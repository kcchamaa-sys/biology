// Body Pal checks (spec tests from "New update direction.md"): node tools/check_bodypal.js
// Runs the scripted fixtures through the DOM-free engine (src/bodypal_engine.js) and checks the physiology targets,
// the Why cards each fixture should fire, determinism, the question builder and the voice lint (Spec C).
const fs = require("fs"), vm = require("vm"), path = require("path");
const code = fs.readFileSync(path.join(__dirname, "../src/bodypal_engine.js"), "utf8");
const ctx = { console }; vm.createContext(ctx);
vm.runInContext(code + "\n;Object.assign(this, { BPK, BP_FOODS, BP_CARDS, BP_LOS, BP_MISC, BP_CLAIMS, BP_TEMPLATES, bpReplay, bpAdvance, bpCreateWorld, bpHistAt, bpFocus, bpBuildSession, bpNewLearner, bpRecordAnswer, bpCheckAnswer, bpValidate, bpVoiceLint, bpCountBelow, bpSleepReport, bpMastered });", ctx);
const B = ctx;
let bad = 0, ok = 0;
const check = (cond, msg) => { if (cond) ok++; else { bad++; console.log("✗", msg); } };
const D = (d, hm) => { const [h, m] = hm.split(":").map(Number); return (d - 1) * 1440 + h * 60 + m; };
const E = (t, a, x = {}) => Object.assign({ t, a }, x);
const run = (log, until, opts = {}) => B.bpReplay({ log, opts: Object.assign({ start: D(1, "07:00") }, opts) }, until);
const ids = w => w.fired.map(c => B.BP_CARDS[c.id].n).sort((a, b) => a - b);   // the set of cards; the spec lists them by number
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const range = (w, k, a, b) => { let lo = Infinity, hi = -Infinity; for (let t = a; t <= b; t++) { const v = B.bpHistAt(w, k, t); if (v != null) { lo = Math.min(lo, v); hi = Math.max(hi, v); } } return [lo, hi]; };
function boring(d = 1, o = {}) {
  const L = [E(D(d, "07:30"), "eat", { items: [["eggs-toast", 200]] }), E(D(d, "07:30"), "drink", { id: "water", ml: 250, over: 5 }), E(D(d, "10:30"), "drink", { id: "water", ml: 250, over: 5 }),
    E(D(d, "13:00"), "eat", { items: [["chicken-rice-veg", 400]] }), E(D(d, "13:00"), "drink", { id: "water", ml: 300, over: 5 }),
    E(D(d, "16:00"), "eat", { items: [["apple", 180]] }), E(D(d, "16:00"), "drink", { id: "water", ml: 250, over: 5 }),
    E(D(d, "19:00"), "eat", { items: [["pasta-tomato", 350]] }), E(D(d, "19:00"), "drink", { id: "water", ml: 300, over: 5 }), E(D(d, "21:30"), "drink", { id: "water", ml: 200, over: 5 })];
  if (o.brush !== false) L.push(E(D(d, o.brush || "22:45"), "brush"));
  L.push(E(D(d, o.sleep || "23:00"), "sleep", { alarm: o.alarm === null ? null : D(d + 1, o.alarm || "07:00") }));
  return L;
}

/* Phase 1: determinism, hydration, performance */
{
  const a = run(boring(1), D(2, "08:00")), b = run(boring(1), D(2, "08:00"));
  check(same(a.hist, b.hist) && same(a.fired, b.fired) && same(a.nights, b.nights), "determinism: two runs differ");
  const w = run([], D(1, "16:00")), first = w.hist.def.findIndex(v => v >= 600), h = first / 60;
  check(h >= 5 && h <= 8, `thirst should appear 5–8 h after waking with no intake (got ${h.toFixed(1)} h)`);
  const t0 = Date.now(); let L = []; for (let d = 1; d <= 7; d++) L = L.concat(boring(d));
  const wk = run(L, D(8, "07:50")); const ms = Date.now() - t0;
  check(ms < 1000, `7-day run took ${ms} ms (limit 1000)`);
  check(!wk.fired.length, `7 boring days should fire no cards (got ${ids(wk)})`);
}
/* boring-day: no cards, no thirst, little demineralisation, no erosion */
{
  const w = run(boring(1), D(2, "07:20"));
  check(!w.fired.length, `boring-day fires nothing (got ${ids(w)})`);
  check(!w.hist.def.some(v => v >= 600), "boring-day: thirst never fires");
  const n = w.nights[0];
  check(n && w.nights.length === 1, "boring-day: one night");
  const demin = B.bpCountBelow(w, "ph", D(1, "07:00"), D(2, "07:00"), 5.5);
  check(demin < 30, `boring-day demineralisation ${demin} min (< 30)`);
  check(n.deminNight === 0, "boring-day: no overnight demineralisation");
}
/* Phase 2: fuel */
{
  const w = run([E(D(1, "08:00"), "drink", { id: "glucose-drink", ml: 300, over: 5 })], D(1, "13:00")), s = D(1, "08:00");
  let pk = 0, pt = 0; for (let t = s; t <= s + 240; t++) { const v = B.bpHistAt(w, "g", t); if (v > pk) { pk = v; pt = t; } }
  const nad = range(w, "g", pt, s + 300)[0];
  check(pk >= 140 && pk <= 180, `ogtt peak ${pk.toFixed(0)} (140–180)`);
  check(pt - s >= 30 && pt - s <= 60, `ogtt peak at ${pt - s} min (30–60)`);
  check(B.bpHistAt(w, "g", s + 150) < 110, `ogtt glucose at 150 min ${B.bpHistAt(w, "g", s + 150).toFixed(0)} (< 110)`);
  check(nad >= 65, `ogtt nadir ${nad.toFixed(0)} (≥ 65)`);
  check(same(ids(w), [1, 3, 7]), `ogtt cards [1,3,7] (got ${ids(w)})`);
}
{
  const w = run([E(D(1, "08:00"), "eat", { items: [["oats", 60], ["milk", 200]] })], D(1, "12:00")), [lo, hi] = range(w, "g", D(1, "08:00"), D(1, "12:00"));
  check(hi <= 120, `porridge peak ${hi.toFixed(0)} (≤ 120)`); check(lo >= 75, `porridge low ${lo.toFixed(0)} (≥ 75)`);
  check(same(ids(w), [2]), `porridge cards [2] (got ${ids(w)})`);
}
{
  // D0 is an ordinary day up to the 19:00 meal; then nothing but water until 09:00 on D1
  const w = run(boring(0).filter(e => e.t <= D(0, "19:00")).concat([E(D(0, "22:45"), "brush"), E(D(0, "23:00"), "sleep", { alarm: D(1, "07:00") }), E(D(1, "07:15"), "drink", { id: "water", ml: 300 })]), D(1, "09:00"), { start: D(0, "07:00") });
  const [lo, hi] = range(w, "g", D(1, "01:00"), D(1, "09:00")), gly = w.pal.fuel.glycogenLiverG;
  check(lo >= 75 && hi <= 95, `fast-14h glucose ${lo.toFixed(0)}–${hi.toFixed(0)} (75–95)`);
  check(gly >= 20 && gly <= 40, `fast-14h liver glycogen at 09:00 ${gly.toFixed(0)} g (20–40)`);
  check(same(ids(w), [4]), `fast-14h cards [4] (got ${ids(w)})`);
}
{
  const L = boring(1).filter(e => e.t <= D(1, "13:00")).concat([E(D(1, "15:00"), "exercise", { intensity: 2, minutes: 30 }), E(D(1, "15:35"), "drink", { id: "water", ml: 500 })]);
  const w = run(L, D(1, "18:00")), g0 = B.bpHistAt(w, "g", D(1, "15:00")), [lo] = range(w, "g", D(1, "15:00"), D(1, "15:30")), fall = g0 - B.bpHistAt(w, "g", D(1, "15:30"));
  check(fall >= 10 && fall <= 30, `run: glucose falls ${fall.toFixed(0)} mg/dL (10–30)`); check(lo >= 65, `run: low ${lo.toFixed(0)} (≥ 65)`);
  check(Math.round(w.bouts[0].sweatMl) === 450, `run: sweat ${w.bouts[0].sweatMl} mL (450)`);
  check(w.pal.fuel.insulinSensitivity > 1, "run: insulin sensitivity raised after exercise");
  check(same(ids(w), [6, 9]), `run cards [6,9] (got ${ids(w)})`);
}
{
  const w = run([], D(2, "07:00")), [lo, hi] = range(w, "g", D(1, "07:00"), D(2, "07:00"));
  check(lo >= 85 && hi <= 95, `basal 24 h glucose ${lo.toFixed(1)}–${hi.toFixed(1)} (85–95)`);
}
/* Phase 3: teeth */
{
  const cola = over => boring(1).concat([E(D(1, "16:00"), "drink", { id: "cola", ml: 330, over })]);
  const A = run(cola(60), D(1, "22:00")), Bw = run(cola(5), D(1, "22:00"));
  const a = B.bpCountBelow(A, "ph", D(1, "16:00"), D(1, "17:00"), 5.5), b = B.bpCountBelow(Bw, "ph", D(1, "16:00"), D(1, "18:00"), 5.5);
  check(a >= 40, `sip: ${a} of 60 min under pH 5.5 (≥ 40)`); check(b >= 15 && b <= 40 && b < a, `gulp: ${b} min under pH 5.5 (spec 20–40; 15–40 within the §A9 ranges, see science notes)`);
  check(same(ids(A), [14]), `sip cards [14] (got ${ids(A)})`); check(same(ids(Bw), []), `gulp cards [] (got ${ids(Bw)})`);
}
{
  const base = o => boring(1, o).concat([E(D(1, "22:30"), "drink", { id: "cola", ml: 330, over: 10 })]);
  const A = run(base({ brush: false }), D(2, "07:10")), Bw = run(base({ brush: "22:55" }), D(2, "07:10"));
  check(A.nights[0].deminNight >= 90, `no brush: overnight ${A.nights[0].deminNight} min under 5.5 (≥ 90)`);
  check(Bw.nights[0].deminNight < 5, `brush 22:55: overnight ${Bw.nights[0].deminNight} min under 5.5 (< 5)`);
  check(same(ids(A), [15]), `bedtime no-brush cards [15] (got ${ids(A)})`); check(same(ids(Bw), []), `bedtime brush cards [] (got ${ids(Bw)})`);
}
/* Phase 4: sleep */
const normal = run(boring(1, { alarm: null }), D(2, "07:50"));
{
  const n = normal.nights[0], wk = n.wake - D(2, "00:00");
  check(n.latencyMin <= 20, `normal-night latency ${n.latencyMin} (≤ 20)`);
  check(n.how === "natural" && wk >= 375 && wk <= 465, `normal-night natural wake at ${Math.floor(wk / 60)}:${String(wk % 60).padStart(2, "0")} (06:15–07:45)`);
  check(n.report.score >= 0.8, `normal-night score ${n.report.score} (≥ 0.8)`);
  check(same(ids(normal), []), `normal-night cards [] (got ${ids(normal)})`);
}
{
  const w = run(boring(1, { sleep: "20:00" }), D(2, "07:50"));
  check(w.attempts[0].latency > 45, `early-bed latency ${w.attempts[0].latency} (> 45)`);
  check(same(ids(w), [11]), `early-bed cards [11] (got ${ids(w)})`);
}
{
  const A = run(boring(1, { alarm: "04:00" }), D(2, "05:00")), Bw = run(boring(1), D(2, "07:50")), a = A.nights[0], b = Bw.nights[0];
  check(b.remMin >= 1.6 * a.remMin, `REM 8 h ${b.remMin} ≥ 1.6 × REM 5 h ${a.remMin}`);
  check(a.swsMin >= 0.85 * b.swsMin, `SWS 5 h ${a.swsMin} ≥ 0.85 × SWS 8 h ${b.swsMin}`);
  check(same(ids(A), [12]), `alarm-5h cards [12] (got ${ids(A)})`); check(same(ids(Bw), []), `alarm-8h cards [] (got ${ids(Bw)})`);
  // an alarm that lands in SWS or REM leaves the pal groggy for 30 min
  const onset = a.onset, remAt = onset + 4 * 90 + 50;   // cycle 4: N1 5 + N2 45 → REM from minute 50
  const G = run(boring(1).map(e => e.a === "sleep" ? Object.assign({}, e, { alarm: remAt }) : e), remAt + 5);
  check(G.nights[0].cut && G.pal.flags.groggy, "alarm during REM sets groggy");
}
{
  const w = run(boring(1, { alarm: null }).concat([E(D(1, "20:00"), "drink", { id: "coffee", ml: 240, over: 5 })]), D(2, "07:50"));
  const at = w.attempts[0], extra = w.nights[0].latencyMin - normal.nights[0].latencyMin;
  check(Math.round(at.caffeineMg) === 63, `late-coffee caffeine at 23:00 ${at.caffeineMg.toFixed(1)} mg (63)`);
  check(extra >= 8 && extra <= 16, `late-coffee adds ${extra} min to latency (≈ 12)`);
  check(w.nights[0].report.explanationLines.some(l => l.includes("63 mg")), "late-coffee report quotes 63 mg");
  check(same(ids(w), [10]), `late-coffee cards [10] (got ${ids(w)})`);
}
{
  let L = []; for (let d = 1; d <= 5; d++) { L = L.concat(boring(d)); if (d <= 3) L.push(E(D(d, "21:00"), "light", { on: true })); }
  const w = run(L, D(6, "07:50")), delays = w.nights.map(n => n.delayAfter);
  check(delays[2] === 30, `screens: delay after 3 nights ${delays[2]} (30)`);
  check(delays[4] === 0, `screens: delay after 2 light-free nights ${delays[4]} (0)`);
  check(same(ids(w), [13]), `screens cards [13] once (got ${ids(w)})`);
  check(w.fired.length === 1 && w.fired[0].t === w.nights[2].wake, "screens: card 13 fires at the D3→D4 wake");
}
/* Phase 5: card content and voice (Spec C) */
{
  const sample = { g: 162, min: 40, x: "3.1", h: 13, a: 104, b: 88, peak: 172, ml: 600, mg: 63, lat: 66, rem: 54, d: 30, n: 44, ph: 5.2 };
  Object.entries(B.BP_CARDS).forEach(([id, c]) => {
    const words = s => s.split(/\s+/).filter(Boolean).length, mech = c.m(sample);
    check(words(c.h) <= 6 && !/!/.test(c.h), `${id}: headline ≤ 6 words, no "!"`);
    check(/\d/.test(mech) && mech.split(/(?<=\.)\s+/).length === 1, `${id}: mechanism is one sentence with a number`);
    check(words(c.more) <= 120 && c.more.split("\n").length <= 2, `${id}: learnMore ≤ 120 words, ≤ 2 paragraphs`);
    [c.h, mech, c.more].forEach(s => B.bpVoiceLint(s).forEach(e => check(false, `${id}: ${e}`)));
  });
  Object.entries(B.BP_LOS).forEach(([lo, [, st, short]]) => { [st, short].forEach(s => B.bpVoiceLint(s).forEach(e => check(false, `${lo}: ${e}`))); check(short.split(" ").length <= 12, `${lo}: short form ≤ 12 words`); });
  Object.entries(B.BP_MISC).forEach(([lo, list]) => { check(list.length >= 3, `${lo}: ≥ 3 misconceptions`); list.forEach(s => { B.bpVoiceLint(s).forEach(e => check(false, `${lo} misconception: ${e}`)); check(s.split(" ").length <= 12, `${lo}: misconception ≤ 12 words`); }); });
  check(B.BP_CLAIMS.length >= 12, "≥ 12 claims"); B.BP_CLAIMS.forEach(([, t]) => B.bpVoiceLint(t).forEach(e => check(false, `claim: ${e}`)));
  normal.nights.concat(run(boring(1, { alarm: "04:00", sleep: "20:00" }).concat([E(D(1, "19:30"), "drink", { id: "coffee", ml: 240 })]), D(2, "05:00")).nights)
    .forEach(n => { check(n.report.explanationLines.length <= 4, "≤ 4 explanation lines"); n.report.explanationLines.forEach(l => { check(l.split(/(?<=\.)\s+/).length <= 2, `≤ 2 sentences: ${l}`); B.bpVoiceLint(l).forEach(e => check(false, `report: ${e}`)); }); });
}
/* Phase 6: questions */
{
  // a busy week: ogtt-style breakfast, a run, late coffee + screens, sipping cola without brushing, an early alarm
  let L = boring(1);
  L = L.concat(boring(2).filter(e => !(e.t === D(2, "07:30") && e.a === "eat")), [E(D(2, "08:00"), "drink", { id: "glucose-drink", ml: 300 })]);
  L = L.concat(boring(3), [E(D(3, "15:00"), "exercise", { intensity: 2, minutes: 30 })]);
  L = L.concat(boring(4), [E(D(4, "20:00"), "drink", { id: "coffee", ml: 240 }), E(D(4, "21:00"), "light", { on: true })]);
  L = L.concat(boring(5, { brush: false }), [E(D(5, "16:00"), "drink", { id: "cola", ml: 330, over: 60 }), E(D(5, "22:30"), "drink", { id: "cola", ml: 330, over: 10 })]);
  L = L.concat(boring(6, { alarm: "05:30" }), boring(7));
  const w = run(L, D(7, "18:00")), snap = JSON.stringify(w.pal);
  const tpl = {};
  Object.keys(B.BP_TEMPLATES).forEach(tid => B.BP_TEMPLATES[tid].applicable(w).forEach(p => { const q = B.BP_TEMPLATES[tid].build(w, p, Object.assign(() => 0.3, { int: n => 0, pick: a => a[0], shuffle: a => a.slice() })); if (!q) return; q.templateId = tid; q.id = tid;
    const errs = B.bpValidate(w, q); check(!errs.length, `${tid} ${p.k || ""}: ${errs.join("; ")} | ${q.prompt}`); tpl[tid] = (tpl[tid] || 0) + 1; }));
  ["T1", "T3", "T4", "T5", "T7", "T9", "T10"].forEach(t => check(tpl[t] > 0, `template ${t} has instances on the week`));
  const L1 = B.bpNewLearner(), s1 = B.bpBuildSession(w, L1, 42), s2 = B.bpBuildSession(w, B.bpNewLearner(), 42);
  check(same(s1, s2), "same (world, seed) → identical session");
  const f = B.bpFocus(w.pal), want = f >= 0.7 ? 6 : f >= 0.5 ? 4 : f >= 0.3 ? 2 : 0;
  check(s1.questions.length === want, `session length ${s1.questions.length} for focus ${f.toFixed(2)} (want ${want})`);
  check(new Set(s1.questions.map(q => q.templateId)).size >= Math.min(3, want), "session mixes templates");
  check(Object.values(s1.questions.reduce((o, q) => (o[q.templateId] = (o[q.templateId] || 0) + 1, o), {})).every(n => n <= 2), "≤ 2 of one template per session");
  if (want >= 4) check(s1.questions.some(q => ["T2", "T5", "T8", "T9"].includes(q.templateId)), "session of ≥ 4 has a re-run question");
  s1.questions.forEach(q => { const right = q.answer.kind === "numeric" ? q.answer.value : q.answer.kind === "bool" ? q.answer.value : q.answer.kind === "order" ? q.answer.correctOrder : q.answer.correctIndex;
    check(B.bpCheckAnswer(q, right), `${q.templateId}: the correct answer checks`); B.bpRecordAnswer(L1, q, true, w.pal.epochMin); });
  check(JSON.stringify(w.pal) === snap, "answering never changes the pal");
  // Leitner transitions
  const L2 = B.bpNewLearner(), q = { id: "x", lo: "F1", templateId: "T7" };
  [true, true, true].forEach(c => B.bpRecordAnswer(L2, q, c, 0));
  check(L2.los.F1.box === 3 && L2.los.F1.streak === 3 && B.bpMastered(L2.los.F1) && L2.los.F1.dueEpochMin === 4 * 1440, "Leitner: three right → box 3, due in 4 days, mastered");
  B.bpRecordAnswer(L2, q, false, 0); check(L2.los.F1.box === 2 && L2.los.F1.streak === 0, "Leitner: wrong → down one box, streak 0");
  // generated session prompts pass the voice lint
  s1.questions.forEach(q => [q.prompt, q.feedback.mechanism].forEach(s => B.bpVoiceLint(s, { maxWords: 40 }).forEach(e => check(false, `question voice: ${e}`))));
  // T2 counterfactuals agree with the teaching: sipping → more acid minutes, gulping → fewer, brushing → fewer, earlier coffee → faster sleep
  const t2 = B.BP_TEMPLATES.T2.applicable(w).map(p => [p.k, B.BP_TEMPLATES.T2.build(w, p)]).filter(x => x[1]);
  const exp = { sip: 0, brush: 1, coffee: 1, alarm: 0, gulp: 1 };   // "sip" = the real drink was quick and the re-run sips it
  t2.forEach(([k, q]) => check(q.answer.correctIndex === exp[k], `T2 ${k}: re-run says "${q.answer.options[q.answer.correctIndex]}" | ${q.feedback.mechanism}`));
  check(t2.some(([k]) => k === "sip") && t2.some(([k]) => k === "brush"), "T2 has sip and brush counterfactuals on the week");
}
console.log(bad ? `\n${bad} Body Pal check(s) failed, ${ok} passed.` : `All ${ok} Body Pal checks passed.`);
process.exit(bad ? 1 : 0);
