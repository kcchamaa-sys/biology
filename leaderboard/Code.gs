/**
 * Chiikawa Bio Escape: class leaderboard (Google Apps Script web app).
 * Stores one row per player in the sheet "scores" and returns the top 10 by dedication points.
 * Setup steps: see SETUP.md in this folder.
 */
const SHEET_NAME = "scores";
const HEADERS = ["id", "name", "score", "days", "streak", "trophies", "updated"];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(HEADERS); }
  return sh;
}

function clean_(v, max) { return String(v == null ? "" : v).replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, max); }
function num_(v, max) { const n = Math.floor(Number(v)); return isFinite(n) ? Math.max(0, Math.min(max, n)) : 0; }

function rows_() {
  const values = sheet_().getDataRange().getValues();
  return values.slice(1).filter(r => r[0]).map(r => ({ id: r[0], name: r[1], score: Number(r[2]) || 0, days: Number(r[3]) || 0, streak: Number(r[4]) || 0, trophies: Number(r[5]) || 0 }));
}

function board_(id) {
  const all = rows_().sort((a, b) => b.score - a.score || b.days - a.days);
  const top = all.slice(0, 10).map(r => ({ id: r.id, name: r.name, score: r.score, streak: r.streak, trophies: r.trophies }));
  const rank = id ? all.findIndex(r => r.id === id) + 1 : 0;
  return { top: top, me: rank ? { rank: rank } : null, players: all.length };
}

function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) { return json_(board_(e && e.parameter && e.parameter.id)); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || "{}");
    const id = clean_(d.id, 40);
    if (!/^p[a-z0-9]{6,39}$/.test(id)) return json_({ error: "bad id" });
    const row = [id, clean_(d.name, 16) || "Student", num_(d.score, 100000), num_(d.days, 5000), num_(d.streak, 5000), num_(d.trophies, 10), new Date()];
    const sh = sheet_();
    const ids = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(r => r[0]);
    const at = ids.indexOf(id);
    if (at > 0) sh.getRange(at + 1, 1, 1, row.length).setValues([row]); else sh.appendRow(row);
    return json_(board_(id));
  } finally { lock.releaseLock(); }
}
