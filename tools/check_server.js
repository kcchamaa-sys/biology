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
const up = new Date("2026-10-09T08:00:00Z"), end = new Date("2026-10-05T10:00:00Z"), rr = []; rr[0] = up; rr[18] = end;
check(ctx.recTime(rr).getTime() === end.getTime(), "late upload dated by when the activity ended");
rr[18] = new Date("2027-01-01T00:00:00Z"); check(ctx.recTime(rr).getTime() === up.getTime(), "an End after the upload is ignored");
rr[18] = ""; check(ctx.recTime(rr).getTime() === up.getTime(), "missing End falls back to the Timestamp");
// 9) Records cleanup: empty rounds, duplicates (same activity sent twice), late uploads re-dated, sorted by time
const D = iso => new Date(iso), row = (o) => { const r = new Array(23).fill(""); r[0] = D(o.ts); r[1] = o.ses || "s1"; r[2] = o.em || "a@x.hk"; r[8] = o.mode || "Study series"; r[10] = o.stage || "t1s1 Water";
  r[11] = o.ans == null ? 12 : o.ans; r[12] = 10; r[14] = o.stars || 0; r[16] = o.status || "Finished"; r[18] = o.end ? D(o.end) : ""; r[21] = o.up ? D(o.up) : ""; r[22] = o.rid || ""; return r; };
const rows = [
  row({ ts: "2026-10-09T08:00:00Z", end: "2026-10-04T09:00:00Z" }),                         // uploaded 5 days late
  row({ ts: "2026-10-09T08:00:05Z", end: "2026-10-04T09:00:00Z" }),                         // the same activity again (sent on page close + next visit)
  row({ ts: "2026-10-05T10:00:00Z", end: "2026-10-05T10:00:00Z", ans: 0, status: "Stopped early" }),   // empty round
  row({ ts: "2026-10-06T10:00:00Z", end: "2026-10-06T10:00:00Z", rid: "r1" }),
  row({ ts: "2026-10-06T11:00:00Z", end: "2026-10-06T10:00:00Z", rid: "r1" }),               // same record ID
  row({ ts: "2026-10-07T10:00:00Z", end: "2026-10-07T10:00:00Z", mode: "Escape stage", stage: "t2s1 Cells", stars: 3, status: "Finished" })
];
const cr = ctx.cleanRecords(rows);
check(cr.counts.empty === 1 && cr.counts.duplicate === 2 && cr.counts.redated === 1 && cr.rows.length === 3, "records cleanup " + JSON.stringify(cr.counts));
check(cr.rows[0][0].toISOString().startsWith("2026-10-04") && cr.rows[0][21] instanceof Date, "late upload re-dated to its real day, upload time kept in 'Uploaded'");
check(cr.rows.every((r, i) => !i || r[0] >= cr.rows[i - 1][0]), "rows sorted by activity time");
// 10) Facts: study days, stages cleared, stars (old study rows count only when longer than a 12-question mix)
const ymd = d => d.toISOString().slice(0, 10);
const fr = ctx.recordFacts([
  row({ ts: "2026-10-01T05:00:00Z", mode: "Escape stage", stage: "t2s1 Cells", stars: 2 }),
  row({ ts: "2026-10-02T05:00:00Z", mode: "Study series", stage: "t3s1 Mixed", ans: 12, stars: 3 }),             // a 12-question mix: not a stage clear
  row({ ts: "2026-10-03T05:00:00Z", mode: "Study series", stage: "t4s1 Enzymes", ans: 30, stars: 3 }),          // an old full study series
  row({ ts: "2026-10-04T05:00:00Z", mode: "Study series", stage: "t5s1 Mixed · Hard", ans: 12, stars: 2, status: "Stage cleared" }),
  row({ ts: "2026-10-05T05:00:00Z", mode: "Cell Rush", stage: "", ans: 20 }),
  row({ ts: "2026-10-06T05:00:00Z", status: "Stopped early", stage: "t6s1 X", ans: 5 })
], ymd, null);
check(JSON.stringify(Object.keys(fr.cleared).sort()) === JSON.stringify(["t2s1", "t4s1", "t5s1"]) && fr.stars.t2s1 === 2 && fr.stars.t4s1 === 3 && !fr.stars.t3s1, "stages and stars from records " + JSON.stringify(fr));
check(fr.days.length === 5 && !fr.days.includes("2026-10-06"), "study days: finished activities only");
// 11) Repair a state: adds stages and stars, raises the streak, never removes anything
const st = { completed_rooms: ["t1s1", "t2s1"], room_stars: { t1s1: 3, t2s1: 3 }, current_streak: 1, longest_streak: 1, last_study_day: "2026-10-05" };
const rp = ctx.repairState(JSON.parse(JSON.stringify(st)), { days: ["2026-10-04", "2026-10-05"], cleared: { t2s1: 1, t4s1: 1 }, stars: { t2s1: 1, t4s1: 2 } }, "2026-10-09");
check(rp.state.completed_rooms.join() === "t1s1,t2s1,t4s1" && rp.state.room_stars.t2s1 === 3 && rp.state.room_stars.t4s1 === 2 && rp.state.current_streak === 2, "repairState adds a stage, never lowers stars, raises the streak " + JSON.stringify(rp.items));
const rp2 = ctx.repairState({ completed_rooms: ["t9s9"], room_stars: { t9s9: 3 }, current_streak: 5, longest_streak: 9, last_study_day: "2026-10-09" }, { days: [], cleared: {}, stars: {} }, "2026-10-09");
check(!rp2.items.length && rp2.state.current_streak === 5, "nothing to add: nothing changes");
const sm = ctx.summaryOf(rp.state); check(sm.stages === 3 && sm.stars === 8 && sm.streak === 2, "summary columns from the repaired state " + JSON.stringify(sm));
console.log(bad ? `\n${bad} server check(s) failed, ${ok} passed.` : `All ${ok} server checks passed.`);
process.exit(bad ? 1 : 0);
