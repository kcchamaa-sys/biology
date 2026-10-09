// Server logic checks (pure parts of server/Code.gs): node tools/check_server.js
// Loads Code.gs in a Node vm with tiny Apps Script stubs and checks the streak repair and the record time.
const fs = require("fs"), vm = require("vm"), path = require("path");
const ctx = { PropertiesService: { getScriptProperties: () => ({ getProperty: () => "" }) }, console };
vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname, "../server/Code.gs"), "utf8"), ctx);
let bad = 0, ok = 0; const check = (c, m) => { if (c) ok++; else { bad++; console.log("✗", m); } };
const R = (state, days, today = "2026-10-09") => ctx.rebuildStreak(JSON.parse(JSON.stringify(state)), days, today);
// 1) a save that stopped uploading on 10-03 while the student kept studying every day until today
let r = R({ current_streak: 4, longest_streak: 6, last_study_day: "2026-10-03", study_days: ["2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03"] },
  ["2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09"]);
check(r.changed && r.after.streak === 10 && r.after.best === 10 && r.after.last === "2026-10-09", "stale save is rebuilt to a 10-day streak " + JSON.stringify(r.after));
check(r.state.study_days.includes("2026-10-09") && r.state.study_days.every(d => d >= "2026-09-26"), "study days kept to the last 14 days");
// 2) never lowers: the save already knows more (e.g. Lab days that are not in Records)
r = R({ current_streak: 12, longest_streak: 20, last_study_day: "2026-10-09" }, ["2026-10-08", "2026-10-09"]);
check(!r.changed && r.after.streak === 12 && r.after.best === 20, "a better saved streak is never lowered");
// 3) a gap: recorded days 10-01..10-03 and 10-06..10-08 → streak 3 ending 10-08 (the game applies freezes itself on the next launch)
r = R({ current_streak: 0, longest_streak: 0, last_study_day: null }, ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-06", "2026-10-07", "2026-10-08"]);
check(r.after.streak === 3 && r.after.last === "2026-10-08" && r.after.best === 3, "gap: current 3, best 3 " + JSON.stringify(r.after));
// 4) frozen days bridge a gap, as in the game
r = R({ current_streak: 2, longest_streak: 2, last_study_day: "2026-10-05", frozen_days: ["2026-10-04"], study_days: ["2026-10-03", "2026-10-05"] }, ["2026-10-03", "2026-10-05", "2026-10-06"]);
check(r.after.streak === 4 && r.after.last === "2026-10-06", "freeze days count inside the chain " + JSON.stringify(r.after));
// 5) nothing recorded, nothing saved
r = R({}, []); check(!r.changed, "empty stays unchanged");
// 6) future dates (wrong device clock) are ignored
r = R({ current_streak: 1, longest_streak: 1, last_study_day: "2026-10-09" }, ["2026-10-09", "2027-01-01"]);
check(r.after.last === "2026-10-09" && r.after.streak === 1, "future dates ignored");
// 7) best streak found in the middle of the history
r = R({ current_streak: 1, longest_streak: 1, last_study_day: "2026-10-09" }, ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05", "2026-10-09"]);
check(r.after.best === 5 && r.after.streak === 1, "best streak from older history " + JSON.stringify(r.after));
// 8) record time: uses the End column when plausible, else the upload Timestamp
const up = new Date("2026-10-09T08:00:00Z"), end = new Date("2026-10-05T10:00:00Z"), row = []; row[0] = up; row[18] = end;
check(ctx.recTime(row).getTime() === end.getTime(), "late upload dated by when the activity ended");
row[18] = new Date("2027-01-01T00:00:00Z"); check(ctx.recTime(row).getTime() === up.getTime(), "an End after the upload is ignored");
row[18] = ""; check(ctx.recTime(row).getTime() === up.getTime(), "missing End falls back to the Timestamp");
console.log(bad ? `\n${bad} server check(s) failed, ${ok} passed.` : `All ${ok} server checks passed.`);
process.exit(bad ? 1 : 0);
