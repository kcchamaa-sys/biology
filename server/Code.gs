/**
 * Mochi Bio Escape – class server (Google Apps Script web app)
 * ----------------------------------------------------------------
 * - Checks each Google sign-in (ID token) and looks the email up in the Users sheet.
 * - Saves every finished activity (escape stage, study series, Cell Rush, dictation,
 *   Mistake Notebook) and each student's game progress to the spreadsheet.
 * - Gives signed-in students the class leaderboard.
 * Guests never reach this server: their progress stays on their own device.
 *
 * Script Properties (Project Settings → Script properties):
 *   SHEET_ID     ID of the Google Sheet that holds the Users tab   (required)
 *   CLIENT_ID    Google OAuth Web client ID used by the game       (required)
 *   USERS_SHEET  optional, name of the users tab (default: 使用者 Users)
 *
 * Users tab columns: Email · Role · Chinese Name · English Name · Class · Class No.
 * (the same tab the S1 Science game uses, so one list serves both games)
 */
var PROPS = PropertiesService.getScriptProperties();
var USERS_DEFAULT = '使用者 Users';
var REC = 'Biology Records';
var PROG = 'Biology Progress';
var REC_HEAD = ['Timestamp', 'Session ID', 'Email', 'Role', 'Class', 'Class No.', 'Chinese Name', 'English Name',
  'Mode', 'Topic', 'Stage', 'Answered', 'Correct', 'Accuracy %', 'Stars', 'Seconds', 'Status', 'Start', 'End',
  'Question IDs', 'Wrong IDs'];
var PROG_HEAD = ['Email', 'Updated', 'Streak', 'Best streak', 'Stars', 'Stages cleared', 'Chestnuts', 'Active pet',
  'Pets', 'Mistakes waiting', 'Mistakes cleared', 'Trophies', 'Last study day', 'Data (do not edit)',
  'Dedication points', 'Collection'];
var DATA_COL = 14; // column N holds the saved game data
var MODES = { escape: 'Escape stage', study: 'Study series', rush: 'Cell Rush', dict: 'Dictation', notebook: 'Mistake Notebook' };
var STATUS = { done: 'Finished', quit: 'Stopped early' };

function doGet() {
  return out({ ok: true, app: 'Mochi Bio Escape', time: new Date().toISOString() });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var v = verifyToken(body.token);
    if (!v.ok) return out(v);
    var user = findUser(v.email);
    if (!user) return out({ ok: false, error: 'not_listed' });
    switch (body.action) {
      case 'login': return out({ ok: true, user: user, progress: getProgress(user.email) });
      case 'save': saveProgress(user, body.state, body.summary || {}); return out({ ok: true });
      case 'record': return out({ ok: true, saved: appendRecords(user, body.records || []) });
      case 'board': return out(board(user, body.scope === 'all' ? 'all' : 'class'));
      default: return out({ ok: false, error: 'unknown_action' });
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
    sh.getRange(1, 1, 1, head.length).setFontWeight('bold').setBackground('#FFE3EA');
  }
  return sh;
}
// Text from the game is trimmed and can never start a formula
function clean(s, n) { return String(s == null ? '' : s).slice(0, n || 200).replace(/^[=+\-@\t\r]+/, ''); }
function num(x) { var n = Number(x); return isFinite(n) ? Math.max(0, Math.min(n, 1000000)) : 0; }
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
  var cache = CacheService.getScriptCache(), c = cache.get('bu_' + email);
  if (c) return JSON.parse(c);
  var sh = book().getSheetByName(PROPS.getProperty('USERS_SHEET') || USERS_DEFAULT);
  if (!sh) throw 'Users sheet not found';
  var v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][0]).trim().toLowerCase() !== email) continue;
    var role = String(v[i][1] || '');
    var u = {
      email: email, role: role, zh: String(v[i][2] || ''), en: String(v[i][3] || ''),
      cls: String(v[i][4] || ''), no: v[i][5] === '' || v[i][5] == null ? '' : String(v[i][5]),
      teacher: isStaffRole(role)
    };
    cache.put('bu_' + email, JSON.stringify(u), 300);
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
        MODES[r.mode] || clean(r.mode, 30), clean(r.topic, 10), clean(r.stage, 60), ans, cor,
        ans ? Math.round(cor / ans * 100) : '', num(r.stars), num(r.secs), STATUS[r.status] || clean(r.status, 20),
        when(r.start), when(r.end), clean(r.ids, 600), clean(r.wrong, 600)];
    });
    var start = sh.getLastRow() + 1;
    sh.getRange(start, 10, rows.length, 2).setNumberFormat('@'); // keep "1" and "t1s2" as text
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
    var row = [u.email, new Date(), num(s.streak), num(s.best), num(s.stars), num(s.stages), num(s.coins), clean(s.pet, 30),
      num(s.pets), num(s.mistakes), num(s.cleared), num(s.trophies), clean(s.lastDay, 12), state, num(s.xp), num(s.col)];
    var r = findRow(sh, u.email);
    if (r < 0) r = sh.getLastRow() + 1;
    sh.getRange(r, 13).setNumberFormat('@');
    sh.getRange(r, 1, 1, row.length).setValues([row]);
  } finally { lock.releaseLock(); }
}
function getProgress(email) {
  var sh = book().getSheetByName(PROG);
  if (!sh) return null;
  var r = findRow(sh, email);
  return r < 0 ? null : String(sh.getRange(r, DATA_COL).getValue() || '') || null;
}

/** Class leaderboard: top 20 students for effort (dedication points), current streak and collection.
 *  Only signed-in students on the class list can see it. */
function fullName(zh, en) {
  zh = String(zh || '').trim();
  return zh || String(en || '').trim() || '?';
}
function boardRows() {
  var cache = CacheService.getScriptCache(), hit = cache.get('bio_board');
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
    var a = ps.getRange(2, 1, n, PROG_HEAD.length).getValues();
    var tz = Session.getScriptTimeZone() || 'Asia/Hong_Kong';
    var yest = Utilities.formatDate(new Date(Date.now() - 864e5), tz, 'yyyy-MM-dd');
    a.forEach(function (r) {
      var em = String(r[0]).toLowerCase(), u = info[em];
      if (!u) return;
      var last = String(r[12] || '');
      rows.push({ e: em, n: u.n, c: u.c, p: String(r[7] || ''), xp: Number(r[14]) || 0,
        st: last >= yest ? Number(r[2]) || 0 : 0, col: Number(r[15]) || 0 });
    });
  }
  cache.put('bio_board', JSON.stringify(rows), 300);
  return rows;
}
function board(user, scope) {
  var rows = boardRows().filter(function (r) { return scope === 'all' || r.c === user.cls; });
  function cat(key) {
    var list = rows.filter(function (r) { return r[key] > 0; }).sort(function (x, y) { return y[key] - x[key] || y.xp - x.xp; });
    var top = list.slice(0, 20).map(function (r) { return { n: r.n, c: r.c, p: r.p, v: r[key], me: r.e === user.email }; });
    var me = null;
    for (var i = 0; i < list.length; i++) if (list[i].e === user.email) { me = { rank: i + 1, v: list[i][key] }; break; }
    return { top: top, me: me };
  }
  return { ok: true, scope: scope, cats: { xp: cat('xp'), streak: cat('st'), col: cat('col') } };
}
