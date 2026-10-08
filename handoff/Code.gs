/**
 * Mochi Science Pals – class server (Google Apps Script web app)
 * ----------------------------------------------------------------
 * - Checks each Google sign-in (ID token) and looks the email up in the Users sheet.
 * - Saves quiz / study records and each student's game progress to the spreadsheet.
 * - Gives class statistics to staff accounts only.
 * - Co-op squads (Mochi Science Island) live in the second file, Coop.gs.
 *
 * Script Properties (Project Settings → Script properties):
 *   SHEET_ID        ID of the Google Sheet that holds the Users tab   (required)
 *   CLIENT_ID       Google OAuth Web client ID used by the game       (required)
 *   TEACHER_EMAILS  optional, comma-separated. If set, ONLY these emails can open the
 *                   teacher dashboard. If empty, every "教職員" user can.
 *   USERS_SHEET     optional, name of the users tab (default: 使用者 Users)
 */
var PROPS = PropertiesService.getScriptProperties();
var USERS_DEFAULT = '使用者 Users';
var REC = '科學記錄 Science Records';
var PROG = '科學進度 Science Progress';
var REC_HEAD = ['記錄時間 Timestamp', '練習編號 Session ID', '電郵 Email', '身分 Role', '班別 Class', '班號 Class No.',
  '中文姓名 Chinese Name', '英文姓名 English Name', '模式 Mode', '單元 Unit', '小節 Sub-topic', '已答題數 Answered',
  '答對題數 Correct', '準確率 Accuracy %', '星星 Stars', '用時(秒) Seconds', '狀態 Status', '語言 Language',
  '開始時間 Start', '結束時間 End', '題目 Question IDs', '答錯題目 Wrong IDs'];
var PROG_HEAD = ['電郵 Email', '更新時間 Updated', '連續日數 Streak', '最佳連續 Best streak', '星星 Stars', '寵物等級 Pet level',
  '金幣 Coins', '寵物 Pet', '測驗次數 Quizzes', '待清除錯題 Mistakes', '已清除錯題 Cleared', '獎盃 Trophies',
  '最後溫習日 Last study day', '進度資料 Data (do not edit)', '總經驗 Total XP', '收藏 Collection', '傳說 Legendary', '神話 Mythic',
  '諾貝爾火種 Nobel Sparks', '諾貝爾任務 Nobel tasks (per chapter)', '連勝有效日 Streak alive day'];
var DATA_COL = 14; // column N holds the saved game data
var MODES = { quiz: '測驗 Quiz', practice: '錯題練習 Mistake practice', study: '溫習筆記 Study notes', vocab: '詞彙跟讀 Vocab', match: '詞彙配對 Term Match',
  dict_listen: '默書（聽音）Dictation – listen', dict_meaning: '默書（看義／圖）Dictation – meaning/picture',
  speak: '朗讀 Read aloud', nobel: '諾貝爾大冒險 Nobel Quest' };
var STATUS = { done: '完成', quit: '中途結束' };

function doGet() {
  return out({ ok: true, app: 'Mochi Science Pals', time: new Date().toISOString() });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var v = verifyToken(body.token);
    if (!v.ok) return out(v);
    var user = findUser(v.email);
    if (!user) return out({ ok: false, error: 'not_listed' });
    switch (body.action) {
      case 'login': return out(loginResp(user));
      case 'save': return out(saveResp(user, body));
      case 'record':
        var saved = appendRecords(user, body.records || []);
        try { coopEarn(user, body.records || []); } catch (e2) { }
        return out({ ok: true, saved: saved });
      case 'board': return out(board(user, body.scope === 'all' ? 'all' : 'class'));
      case 'stats':
        if (!user.teacher) return out({ ok: false, error: 'forbidden' });
        return out(stats());
      default:
        if (/^coop[A-Z][a-zA-Z]*$/.test(String(body.action))) return out(coopAction(user, body));
        return out({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    return out({ ok: false, error: 'server: ' + err });
  }
}

function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function book() { return SpreadsheetApp.openById(PROPS.getProperty('SHEET_ID')); }
function sheet(name, head) {
  var ss = book(), sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(head);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, head.length).setFontWeight('bold').setBackground('#FFF1C5');
  }
  return sh;
}
function clean(s, n) { return String(s == null ? '' : s).slice(0, n || 200).replace(/^[=+\-@\t\r]+/, ''); }
function num(x) { var n = Number(x); return isFinite(n) ? Math.max(0, Math.min(n, 100000)) : 0; }
function when(s) { var d = new Date(s); return isNaN(d) ? '' : d; }

/** Verifies a Google ID token with Google and caches the result until it expires. */
function verifyToken(token) {
  if (!token) return { ok: false, error: 'no_token' };
  var cache = CacheService.getScriptCache();
  var key = 'tk_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token)).slice(0, 43);
  var hit = cache.get(key);
  if (hit) return JSON.parse(hit);
  var r = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token), { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) return { ok: false, error: 'expired' };
  var p = JSON.parse(r.getContentText());
  if (p.aud !== PROPS.getProperty('CLIENT_ID')) return { ok: false, error: 'bad_client' };
  if (String(p.email_verified) !== 'true') return { ok: false, error: 'unverified' };
  var left = Number(p.exp) - Math.floor(Date.now() / 1000);
  if (left <= 0) return { ok: false, error: 'expired' };
  var res = { ok: true, email: String(p.email).trim().toLowerCase() };
  cache.put(key, JSON.stringify(res), Math.max(1, Math.min(left, 3000)));
  return res;
}

function isStaffRole(role) { return /教職員|staff|teacher|老師/i.test(role); }
function findUser(email) {
  var cache = CacheService.getScriptCache(), c = cache.get('u_' + email);
  if (c) return JSON.parse(c);
  var sh = book().getSheetByName(PROPS.getProperty('USERS_SHEET') || USERS_DEFAULT);
  if (!sh) throw 'Users sheet not found';
  var v = sh.getDataRange().getValues();
  var teachers = (PROPS.getProperty('TEACHER_EMAILS') || '').toLowerCase().split(/[,\s]+/).filter(String);
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][0]).trim().toLowerCase() !== email) continue;
    var role = String(v[i][1] || '');
    var u = {
      email: email, role: role, zh: String(v[i][2] || ''), en: String(v[i][3] || ''),
      cls: String(v[i][4] || ''), no: v[i][5] === '' || v[i][5] == null ? '' : String(v[i][5]),
      teacher: teachers.length ? teachers.indexOf(email) >= 0 : isStaffRole(role)
    };
    cache.put('u_' + email, JSON.stringify(u), 300);
    return u;
  }
  return null;
}

function appendRecords(u, recs) {
  if (!recs.length) return 0;
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var sh = sheet(REC, REC_HEAD);
    var rows = recs.slice(0, 300).map(function (r) {
      var ans = num(r.ans), cor = Math.min(num(r.cor), ans || num(r.cor));
      return [new Date(), clean(r.session, 40), u.email, u.role, u.cls, u.no, u.zh, u.en,
        MODES[r.mode] || clean(r.mode, 30), clean(r.unit, 10), clean(r.sec, 10), ans, cor,
        ans ? Math.round(cor / ans * 100) : '', num(r.stars), num(r.secs), STATUS[r.status] || clean(r.status, 20),
        clean(r.lang, 12), when(r.start), when(r.end), clean(r.ids, 600), clean(r.wrong, 600)];
    });
    var start = sh.getLastRow() + 1;
    sh.getRange(start, 10, rows.length, 2).setNumberFormat('@'); // keep "1.1" as text
    sh.getRange(start, 1, rows.length, REC_HEAD.length).setValues(rows);
    return rows.length;
  } finally { lock.releaseLock(); }
}

function findRow(sh, email) {
  var last = sh.getLastRow();
  if (last < 2) return -1;
  var col = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < col.length; i++) if (String(col[i][0]).toLowerCase() === email) return i + 2;
  return -1;
}
function saveProgress(u, state, s) {
  state = String(state || '');
  if (state.length > 49000) throw 'progress too large';
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var sh = sheet(PROG, PROG_HEAD);
    var row = [u.email, new Date(), num(s.streak), num(s.best), num(s.stars), num(s.level), num(s.coins), clean(s.pet, 20),
      num(s.quizzes), num(s.mistakes), num(s.cleared), num(s.trophies), clean(s.lastDay, 12), state,
      num(s.xp), num(s.col), num(s.leg), num(s.myth), num(s.sp), clean(s.nq, 40), clean(s.alive || s.lastDay, 12)];
    if (sh.getLastColumn() < PROG_HEAD.length) {
      sh.getRange(1, 1, 1, PROG_HEAD.length).setValues([PROG_HEAD]).setFontWeight('bold').setBackground('#FFF1C5');
    }
    var r = findRow(sh, u.email);
    if (r < 0) r = sh.getLastRow() + 1;
    sh.getRange(r, 13).setNumberFormat('@');
    sh.getRange(r, DATA_COL + 6).setNumberFormat('@'); // keep "63,31,0,…" as text
    sh.getRange(r, DATA_COL + 7).setNumberFormat('@'); // keep the date as text
    sh.getRange(r, 1, 1, row.length).setValues([row]);
  } finally { lock.releaseLock(); }
}
/* login: the saved progress + the days this student finished an activity (from Science Records),
   so the game can repair a streak that an old device overwrote */
function loginResp(user) {
  var r = { ok: true, user: user, progress: getProgress(user.email) };
  try { r.act = activeDays(user.email); } catch (e) { r.act = []; }
  return r;
}
/* save: never let an older copy (an old tab on another device) overwrite newer progress.
   "Newer" = later last-study day, then more active days. A restored save code sends force. */
function progMeta(s) { try { var o = JSON.parse(s); return { d: String(o.lastDay || ''), n: Number(o.days) || 0 }; } catch (e) { return null; } }
function saveResp(user, body) {
  var cur = getProgress(user.email);
  if (cur && !body.force) {
    var a = progMeta(cur), b = progMeta(String(body.state || ''));
    if (a && b && (a.d > b.d || (a.d === b.d && a.n > b.n))) return { ok: false, error: 'stale', progress: cur };
  }
  saveProgress(user, body.state, body.summary || {});
  try { coopTouch(user.email, String((body.summary || {}).lastDay || '')); } catch (e1) { }
  return { ok: true };
}
function activeDays(email) {
  var sh = book().getSheetByName(REC); if (!sh) return [];
  var last = sh.getLastRow(); if (last < 2) return [];
  var from = Math.max(2, last - 40000), n = last - from + 1, tz = Session.getScriptTimeZone() || 'Asia/Hong_Kong';
  var ts = sh.getRange(from, 1, n, 1).getValues(), em = sh.getRange(from, 3, n, 1).getValues(), stt = sh.getRange(from, 17, n, 1).getValues();
  var seen = {}, cut = new Date(Date.now() - 400 * 864e5);
  for (var i = 0; i < n; i++) {
    if (String(em[i][0]).toLowerCase() !== email || stt[i][0] !== STATUS.done) continue;
    var t = ts[i][0]; if (!(t instanceof Date)) t = new Date(t);
    if (isNaN(t.getTime()) || t < cut) continue;
    seen[Utilities.formatDate(t, tz, 'yyyy-MM-dd')] = 1;
  }
  return Object.keys(seen).sort();
}
function getProgress(email) {
  var sh = book().getSheetByName(PROG);
  if (!sh) return null;
  var r = findRow(sh, email);
  return r < 0 ? null : String(sh.getRange(r, DATA_COL).getValue() || '') || null;
}

function stats() {
  var ss = book();
  var uv = ss.getSheetByName(PROPS.getProperty('USERS_SHEET') || USERS_DEFAULT).getDataRange().getValues();
  var students = [];
  for (var i = 1; i < uv.length; i++) {
    if (!uv[i][0] || isStaffRole(String(uv[i][1] || ''))) continue;
    students.push({ email: String(uv[i][0]).trim().toLowerCase(), zh: String(uv[i][2] || ''), en: String(uv[i][3] || ''),
      cls: String(uv[i][4] || ''), no: uv[i][5] === '' || uv[i][5] == null ? '' : String(uv[i][5]) });
  }
  var rev = {}; for (var k in MODES) rev[MODES[k]] = k;
  var records = [], rs = ss.getSheetByName(REC);
  if (rs && rs.getLastRow() > 1) {
    rs.getRange(2, 1, rs.getLastRow() - 1, REC_HEAD.length).getValues().forEach(function (r) {
      var t = r[0] instanceof Date ? r[0].toISOString() : String(r[0]);
      records.push({ t: t, email: String(r[2]).toLowerCase(), mode: rev[r[8]] || String(r[8]), unit: String(r[9]), sec: String(r[10]),
        ans: r[11], cor: r[12], stars: r[14], secs: r[15], status: r[16] === STATUS.quit ? 'quit' : 'done', lang: r[17],
        ids: String(r[20] || ''), wrong: String(r[21] || '') });
    });
  }
  var progress = {}, ps = ss.getSheetByName(PROG);
  if (ps && ps.getLastRow() > 1) {
    ps.getRange(2, 1, ps.getLastRow() - 1, DATA_COL - 1).getValues().forEach(function (r) {
      progress[String(r[0]).toLowerCase()] = { upd: r[1] instanceof Date ? r[1].toISOString() : '', streak: r[2], best: r[3], stars: r[4],
        level: r[5], coins: r[6], pet: r[7], quizzes: r[8], mistakes: r[9], cleared: r[10], trophies: r[11], lastDay: String(r[12] || '') };
    });
    // Nobel Time Quest columns (S, T): Sparks and task bit-masks per chapter, e.g. "63,31,0,0,0,0"
    if (ps.getLastColumn() >= DATA_COL + 6) {
      var em = ps.getRange(2, 1, ps.getLastRow() - 1, 1).getValues();
      ps.getRange(2, DATA_COL + 5, ps.getLastRow() - 1, 2).getValues().forEach(function (r, i) {
        var p = progress[String(em[i][0]).toLowerCase()];
        if (p) { p.nqsp = num(r[0]); p.nq = String(r[1] || ''); }
      });
    }
  }
  return { ok: true, students: students, records: records, progress: progress };
}

/** Class leaderboard: top 20 students for effort (XP), current streak and collection.
 *  Shows each student's full name (Chinese name, or English name if blank). */
function fullName(zh, en) {
  zh = String(zh || '').trim();
  return zh || String(en || '').trim() || '?';
}
/* a Sheets date cell comes back as a Date object: always turn it into yyyy-MM-dd text before comparing days */
function dayText(v, tz) {
  if (v instanceof Date) return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
  return String(v || '').slice(0, 10);
}
function boardRowFrom(r, x, u, yest, tz) {
  x = x || [];
  var last = dayText(r[12], tz), alive = dayText(x[6], tz) || last;
  if (last > alive) alive = last;
  return { e: String(r[0]).toLowerCase(), n: u.n, c: u.c, p: String(r[7] || ''), lv: Number(r[5]) || 0, xp: Number(x[0]) || 0,
    st: alive >= yest ? Number(r[2]) || 0 : 0, col: Number(x[1]) || 0, g: Number(x[2]) || 0, m: Number(x[3]) || 0 };
}
function boardYest(tz) { return Utilities.formatDate(new Date(Date.now() - 864e5), tz, 'yyyy-MM-dd'); }
function boardRows() {
  var cache = CacheService.getScriptCache(), hit = cache.get('board_rows4');
  if (hit) return JSON.parse(hit);
  var ss = book(), rows = [];
  var uv = ss.getSheetByName(PROPS.getProperty('USERS_SHEET') || USERS_DEFAULT).getDataRange().getValues();
  var info = {};
  for (var i = 1; i < uv.length; i++) {
    if (!uv[i][0] || isStaffRole(String(uv[i][1] || ''))) continue;
    info[String(uv[i][0]).trim().toLowerCase()] = { n: fullName(uv[i][2], uv[i][3]), c: String(uv[i][4] || '') };
  }
  var ps = ss.getSheetByName(PROG);
  if (ps && ps.getLastRow() > 1) {
    var n = ps.getLastRow() - 1;
    var a = ps.getRange(2, 1, n, DATA_COL - 1).getValues();
    var b = ps.getLastColumn() > DATA_COL ? ps.getRange(2, DATA_COL + 1, n, 7).getValues() : [];
    var tz = Session.getScriptTimeZone() || 'Asia/Hong_Kong', yest = boardYest(tz);
    a.forEach(function (r, k) {
      var u = info[String(r[0]).toLowerCase()];
      if (u) rows.push(boardRowFrom(r, b[k], u, yest, tz));
    });
  }
  cache.put('board_rows4', JSON.stringify(rows), 60);
  return rows;
}
/* the asking student's own row is always read fresh, so their own XP / items / streak never lag behind the cache */
function freshBoardRow(user) {
  try {
    var ps = book().getSheetByName(PROG); if (!ps) return null;
    var r = findRow(ps, user.email); if (r < 0) return null;
    var tz = Session.getScriptTimeZone() || 'Asia/Hong_Kong';
    var a = ps.getRange(r, 1, 1, DATA_COL - 1).getValues()[0], b = ps.getLastColumn() > DATA_COL ? ps.getRange(r, DATA_COL + 1, 1, 7).getValues()[0] : [];
    return boardRowFrom(a, b, { n: fullName(user.zh, user.en), c: String(user.cls || '') }, boardYest(tz), tz);
  } catch (e) { return null; }
}
function board(user, scope) {
  var all = boardRows(), mine = freshBoardRow(user);
  if (mine) { var at = -1; all.forEach(function (r, i) { if (r.e === mine.e) at = i; }); all = all.slice(); if (at >= 0) all[at] = mine; else all.push(mine); }
  var rows = all.filter(function (r) { return scope === 'all' || r.c === user.cls; });
  function cat(key, extra) {
    var list = rows.filter(function (r) { return r[key] > 0; }).sort(function (x, y) { return y[key] - x[key] || y.xp - x.xp; });
    var top = list.slice(0, 20).map(function (r) {
      var o = { n: r.n, c: r.c, p: r.p, lv: r.lv, v: r[key], me: r.e === user.email };
      if (extra) { o.g = r.g; o.m = r.m; }
      return o;
    });
    var me = null;
    for (var i = 0; i < list.length; i++) if (list[i].e === user.email) { me = { rank: i + 1, v: list[i][key] }; break; }
    return { top: top, me: me };
  }
  return { ok: true, scope: scope, cats: { xp: cat('xp'), streak: cat('st'), col: cat('col', true) } };
}
