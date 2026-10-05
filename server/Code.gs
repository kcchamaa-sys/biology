/**
 * Mochi Bio Escape – class server (Google Apps Script web app)
 * ----------------------------------------------------------------
 * - Checks each Google sign-in (ID token) and looks the email up in the Users sheet.
 * - Saves every finished activity (escape stage, study series, Cell Rush, dictation,
 *   Mistake Notebook) and each student's game progress to the spreadsheet.
 * - Gives signed-in students the class leaderboard.
 * - Friends: each student has a 6-character friend code and can follow up to 5 classmates (any class in the
 *   Users list), see their study progress and send one preset cheer per friend per day. No free-text messages.
 * Guests never reach this server: their progress stays on their own device.
 *
 * Script Properties (Project Settings → Script properties):
 *   SHEET_ID     ID of the Google Sheet that holds the Users tab   (required)
 *   CLIENT_ID    Google OAuth Web client ID used by the game       (required)
 *   USERS_SHEET  optional, name of the users tab (default: 使用者 Users)
 *   TEACHER_EMAILS optional, comma-separated. If set, ONLY these emails see the teacher statistics.
 *                If empty, every staff account (Role contains 教職員 / staff / teacher) can see them.
 *
 * Users tab columns: Email · Role · Chinese Name · English Name · Class · Class No.
 * (the same tab the S1 Science game uses, so one list serves both games)
 */
var PROPS = PropertiesService.getScriptProperties();
var USERS_DEFAULT = '使用者 Users';
var REC = 'Biology Records';
var PROG = 'Biology Progress';
var FRIENDS = 'Biology Friends';
var CHEERS = 'Biology Cheers';
var FRIEND_MAX = 5;
// Preset cheers only (no free text between students). The client shows the same list in the same order.
var CHEER_MSGS = ['🔥 Keep your flame going!', '👏 Great work today!', '💪 You can do it!', '🌱 Study with me today?'];
var REC_HEAD = ['Timestamp', 'Session ID', 'Email', 'Role', 'Class', 'Class No.', 'Chinese Name', 'English Name',
  'Mode', 'Topic', 'Stage', 'Answered', 'Correct', 'Accuracy %', 'Stars', 'Seconds', 'Status', 'Start', 'End',
  'Question IDs', 'Wrong IDs'];
var PROG_HEAD = ['Email', 'Updated', 'Streak', 'Best streak', 'Stars', 'Stages cleared', 'Chestnuts', 'Active pet',
  'Pets', 'Mistakes waiting', 'Mistakes cleared', 'Trophies', 'Last study day', 'Data (do not edit)',
  'Dedication points', 'Collection', 'Active pal'];
var DATA_COL = 14; // column N holds the saved game data
var MODES = { escape: 'Escape stage', study: 'Study series', rush: 'Cell Rush', dict: 'Dictation', notebook: 'Mistake Notebook', bookmark: 'Bookmarks' };
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
      case 'friends': return out(friendsData(user, true));
      case 'friendAdd': return out(friendAdd(user, body.code));
      case 'friendRemove': return out(friendRemove(user, body.code));
      case 'cheer': return out(cheer(user, body.code, body.msg));
      case 'stats':
        if (!user.teacher) return out({ ok: false, error: 'forbidden' });
        return out(stats());
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
  var teachers = (PROPS.getProperty('TEACHER_EMAILS') || '').toLowerCase().split(/[,\s]+/).filter(String);
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][0]).trim().toLowerCase() !== email) continue;
    var role = String(v[i][1] || '');
    var u = {
      email: email, role: role, zh: String(v[i][2] || ''), en: String(v[i][3] || ''),
      cls: String(v[i][4] || ''), no: v[i][5] === '' || v[i][5] == null ? '' : String(v[i][5]),
      teacher: teachers.length ? teachers.indexOf(email) >= 0 : isStaffRole(role)
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
    if (sh.getRange(1, PROG_HEAD.length).getValue() !== PROG_HEAD[PROG_HEAD.length - 1]) sh.getRange(1, 1, 1, PROG_HEAD.length).setValues([PROG_HEAD]); // older sheets: add new headers
    var row = [u.email, new Date(), num(s.streak), num(s.best), num(s.stars), num(s.stages), num(s.coins), clean(s.pet, 30),
      num(s.pets), num(s.mistakes), num(s.cleared), num(s.trophies), clean(s.lastDay, 12), state, num(s.xp), num(s.col), clean(s.pal, 20)];
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
  var cache = CacheService.getScriptCache(), hit = cache.get('bio_board2');
  if (hit) return JSON.parse(hit);
  var ss = book(), rows = [];
  var uv = ss.getSheetByName(PROPS.getProperty('USERS_SHEET') || USERS_DEFAULT).getDataRange().getValues();
  var info = {};
  for (var i = 1; i < uv.length; i++) {
    if (!uv[i][0] || isStaffRole(String(uv[i][1] || ''))) continue;
    info[String(uv[i][0]).trim().toLowerCase()] = { n: fullName(uv[i][2], uv[i][3]), en: String(uv[i][3] || '').trim(), c: String(uv[i][4] || '') };
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
      rows.push({ e: em, n: u.n, en: u.en, c: u.c, p: String(r[7] || ''), xp: Number(r[14]) || 0,
        st: last >= yest ? Number(r[2]) || 0 : 0, col: Number(r[15]) || 0, s: Number(r[5]) || 0, stars: Number(r[4]) || 0,
        last: last, pal: String(r[16] || '') });
    });
  }
  cache.put('bio_board2', JSON.stringify(rows), 300);
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

/** Teacher statistics (staff only): the class list, the last 365 days of records and each student's progress summary. */
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
  var since = Date.now() - 365 * 864e5, records = [], rs = ss.getSheetByName(REC);
  if (rs && rs.getLastRow() > 1) {
    rs.getRange(2, 1, rs.getLastRow() - 1, REC_HEAD.length).getValues().forEach(function (r) {
      var t = r[0] instanceof Date ? r[0] : new Date(r[0]);
      if (isNaN(t) || t.getTime() < since) return;
      records.push({ t: t.toISOString(), email: String(r[2]).toLowerCase(), mode: rev[r[8]] || String(r[8]), topic: String(r[9]), stage: String(r[10]),
        ans: Number(r[11]) || 0, cor: Number(r[12]) || 0, stars: Number(r[14]) || 0, secs: Number(r[15]) || 0,
        status: r[16] === STATUS.quit ? 'quit' : 'done', wrong: String(r[20] || '') });
    });
  }
  var progress = {}, ps = ss.getSheetByName(PROG);
  if (ps && ps.getLastRow() > 1) {
    ps.getRange(2, 1, ps.getLastRow() - 1, PROG_HEAD.length).getValues().forEach(function (r) {
      progress[String(r[0]).toLowerCase()] = { upd: r[1] instanceof Date ? r[1].toISOString() : '', streak: Number(r[2]) || 0, best: Number(r[3]) || 0,
        stars: Number(r[4]) || 0, stages: Number(r[5]) || 0, coins: Number(r[6]) || 0, pet: String(r[7] || ''), pets: Number(r[8]) || 0,
        mistakes: Number(r[9]) || 0, cleared: Number(r[10]) || 0, trophies: Number(r[11]) || 0, lastDay: String(r[12] || ''), xp: Number(r[14]) || 0, col: Number(r[15]) || 0 };
    });
  }
  return { ok: true, students: students, records: records, progress: progress };
}


/** Friends (signed-in students only).
 *  Friend codes are derived from the email, so nothing extra is stored and a code can't be guessed from a name.
 *  Following is one-way (like Duolingo): you can follow up to 5 people; they see your cheers. */
var CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function friendCode(email) {
  var salt = PROPS.getProperty('FRIEND_SALT') || 'bio-study-pals';
  var d = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + '|' + email), c = '';
  for (var i = 0; i < 6; i++) c += CODE_ABC.charAt((d[i] + 256) % 32);
  return c;
}
function codeMap() {
  var cache = CacheService.getScriptCache(), hit = cache.get('bio_codes');
  if (hit) return JSON.parse(hit);
  var uv = book().getSheetByName(PROPS.getProperty('USERS_SHEET') || USERS_DEFAULT).getDataRange().getValues(), m = {};
  for (var i = 1; i < uv.length; i++) {
    if (!uv[i][0] || isStaffRole(String(uv[i][1] || ''))) continue;
    var em = String(uv[i][0]).trim().toLowerCase(); m[friendCode(em)] = em;
  }
  cache.put('bio_codes', JSON.stringify(m), 600);
  return m;
}
function studentInfo() {
  var cache = CacheService.getScriptCache(), hit = cache.get('bio_uinfo');
  if (hit) return JSON.parse(hit);
  var uv = book().getSheetByName(PROPS.getProperty('USERS_SHEET') || USERS_DEFAULT).getDataRange().getValues(), m = {};
  for (var i = 1; i < uv.length; i++) {
    if (!uv[i][0] || isStaffRole(String(uv[i][1] || ''))) continue;
    var en = String(uv[i][3] || '').trim();
    m[String(uv[i][0]).trim().toLowerCase()] = { first: en.split(/\s+/)[0] || fullName(uv[i][2], uv[i][3]), c: String(uv[i][4] || '') };
  }
  cache.put('bio_uinfo', JSON.stringify(m), 600);
  return m;
}
function friendList(email) {
  var sh = sheet(FRIENDS, ['Email', 'Friends', 'Updated']), r = findRow(sh, email);
  if (r < 0) return { row: -1, list: [] };
  return { row: r, list: String(sh.getRange(r, 2).getValue() || '').split(',').filter(String) };
}
function setFriends(email, list) {
  var sh = sheet(FRIENDS, ['Email', 'Friends', 'Updated']), r = findRow(sh, email);
  if (r < 0) r = sh.getLastRow() + 1;
  sh.getRange(r, 1, 1, 3).setValues([[email, list.join(','), new Date()]]);
}
function cheerRows() { var sh = sheet(CHEERS, ['Timestamp', 'From', 'To', 'Message', 'Seen']); return { sh: sh, v: sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues() : [] }; }
function friendsData(user, markSeen) {
  var tz = Session.getScriptTimeZone() || 'Asia/Hong_Kong', today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var mine = friendList(user.email).list, rows = boardRows(), byEmail = {}, info = studentInfo();
  rows.forEach(function (r) { byEmail[r.e] = r; });
  var friends = mine.map(function (em) {
    var r = byEmail[em] || {}, u = info[em] || {};
    return { code: friendCode(em), n: u.first || r.n || 'Classmate', c: u.c || r.c || '', st: r.st || 0, xp: r.xp || 0, s: r.s || 0,
      stars: r.stars || 0, col: r.col || 0, last: r.last || '', today: r.last === today, pal: r.pal || '' };
  });
  var ch = cheerRows(), week = Date.now() - 7 * 864e5, got = [], sent = {}, nameOf = function (em) { return (info[em] && info[em].first) || 'A friend'; };
  ch.v.forEach(function (r, i) {
    var t = new Date(r[0]).getTime(), from = String(r[1]).toLowerCase(), to = String(r[2]).toLowerCase();
    if (to === user.email && t > week) {
      got.push({ n: nameOf(from), m: String(r[3]), t: new Date(r[0]).toISOString(), seen: !!r[4] });
      if (markSeen && !r[4]) ch.sh.getRange(i + 2, 5).setValue('yes');
    }
    if (from === user.email && Utilities.formatDate(new Date(r[0]), tz, 'yyyy-MM-dd') === today) sent[friendCode(to)] = 1;
  });
  got.reverse();
  return { ok: true, code: friendCode(user.email), max: FRIEND_MAX, friends: friends, cheers: got.slice(0, 20), sent: sent, msgs: CHEER_MSGS };
}
function friendAdd(user, code) {
  code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  var em = codeMap()[code];
  if (!em) return { ok: false, error: 'friend_unknown' };
  if (em === user.email) return { ok: false, error: 'friend_self' };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var f = friendList(user.email).list;
    if (f.indexOf(em) >= 0) return { ok: false, error: 'friend_already' };
    if (f.length >= FRIEND_MAX) return { ok: false, error: 'friend_full' };
    f.push(em); setFriends(user.email, f);
  } finally { lock.releaseLock(); }
  return friendsData(user, false);
}
function friendRemove(user, code) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var f = friendList(user.email).list.filter(function (em) { return friendCode(em) !== code; });
    setFriends(user.email, f);
  } finally { lock.releaseLock(); }
  return friendsData(user, false);
}
function cheer(user, code, msg) {
  var i = Math.floor(Number(msg)); if (!(i >= 0 && i < CHEER_MSGS.length)) return { ok: false, error: 'bad_cheer' };
  var to = null; friendList(user.email).list.forEach(function (em) { if (friendCode(em) === code) to = em; });
  if (!to) return { ok: false, error: 'friend_unknown' };
  var d = friendsData(user, false);
  if (d.sent[code]) return { ok: false, error: 'cheer_once' };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try { sheet(CHEERS, ['Timestamp', 'From', 'To', 'Message', 'Seen']).appendRow([new Date(), user.email, to, CHEER_MSGS[i], '']); } finally { lock.releaseLock(); }
  d.sent[code] = 1; return d;
}
