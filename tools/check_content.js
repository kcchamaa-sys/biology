// Content sanity checks: node tools/check_content.js
const fs = require("fs"), vm = require("vm");
const src = ["chars.js", "diagrams.js", "graphs.js", "media.js", "stages.js", "stages2.js", "scenes.js", ...[1,2,3,4,5,6,7,8,9,11,13,15,17].map(i => `q_t${i}.js`), "q_graphs.js", "q_graphs2.js", "q_kb1.js", "q_kb2.js", ...["q_x1.js", "q_x2.js", "q_x3.js", "q_x4.js", "q_h0.js", "q_h1.js", "q_h2.js", "q_h3.js", "q_h4.js", "q_m1.js", "q_m2.js", "q_m3.js", "q_m4.js"].filter(f => fs.existsSync(`src/${f}`)), "skills.js", "rush.js"].map(f => fs.readFileSync(`src/${f}`, "utf8")).join("\n").replace("<script>", "");
const ctx = { outfitSvg: () => "", console, subseq: (a) => a, specialSvg: () => "", SFX: {} };
vm.createContext(ctx); vm.runInContext(src + "\nthis.ROOMS=ROOMS;this.SCENES=SCENES;this.QB=QB;this.DIAGRAMS=DIAGRAMS;this.TOPICS=TOPICS;this.skillOf=skillOf;this.SKILL_IDS=SKILL_IDS;this.SKILL_TAGS=SKILL_TAGS;", ctx);
const { ROOMS, QB, DIAGRAMS, skillOf, SKILL_IDS, SKILL_TAGS } = ctx; let bad = 0, total = 0;
// Skill strands (src/skills.js): per-stage counts; warn (not fail yet) below SKILL_MIN for see/data/invest
const SKILL_MIN = 4, warns = [], unsure = [], cover = [];
const normWord = w => String(w || "").toLowerCase().replace(/[^a-z]/g, "");
const spellable = r => (r.terms || []).filter(([t, m]) => { const c = normWord(t); return c.length >= 5 && !/[A-Z]{2}|\d/.test(t) && !normWord(m).includes(c); }).length;
const err = m => { bad++; console.log("✗", m); };
const codes = new Set();
ROOMS.forEach(r => {
  const qs = QB[r.id]; if (!qs) return err(`${r.id}: no questions`);
  total += qs.length;
  if (qs.length < 15) err(`${r.id}: ${qs.length} questions`);
  if (!ctx.SCENES[r.scene]) err(`${r.id}: unknown scene ${r.scene}`);
  if (!/^\d{5}$/.test(r.code) || codes.has(r.code)) err(`${r.id}: bad/duplicate code ${r.code}`); codes.add(r.code);
  ["intro", "notes", "rules", "terms"].forEach(k => { if (!r[k] || !r[k].length) err(`${r.id}: missing ${k}`); });
  const bl = {}; qs.forEach((q, j) => {
    const o = Array.isArray(q) ? { b: q[0], q: q[1], choices: q[2], answer: 0, hint: q[3], explain: q[4], type: "mc" } : Object.assign({ type: "mc", answer: 0 }, q);
    bl[o.b] = (bl[o.b] || 0) + 1;
    const id = `${r.id}#${j}`;
    if (!(o.b >= 1 && o.b <= 6)) err(`${id}: bloom ${o.b}`);
    if (!o.q || !o.hint || !o.explain) err(`${id}: missing q/hint/explain`);
    if (o.svg && !DIAGRAMS[o.svg]) err(`${id}: unknown svg ${o.svg}`);
    if (/\b(the|this|a) (diagram|graph|bar chart|histogram|trace)\b(?! type)/i.test(o.q) && !/sketch|draw|design/i.test(o.q) && !o.svg && !o.media && !o.tapSvg && !o.gch) err(`${id}: mentions diagram/graph but has no svg`);
    if (o.type === "mc") {
      if (!Array.isArray(o.choices) || o.choices.length !== 4) err(`${id}: needs 4 choices`);
      else if (!(o.answer >= 0 && o.answer < 4)) err(`${id}: bad answer`);
      else if (new Set(o.choices).size !== 4) err(`${id}: duplicate choices`);
      if (o.why && (o.why.length !== 4 || o.why[o.answer] || o.why.some((w, i) => i !== o.answer && !w))) err(`${id}: why needs a trap note for each wrong option only`);
      if (o.stmts && (o.stmts.length < 2 || o.stmts.some(x => !x))) err(`${id}: bad statements`);
      if (o.table && (o.table.length < 2 || o.table.some(row => row.length !== o.table[0].length))) err(`${id}: table rows differ in length`);
    } else if (o.type === "dial") {
      if (o.chain && (new Set(o.dials[0]).size !== o.dials[0].length)) err(`${id}: duplicate chain steps`);
      if (o.dials.length !== o.answer.length || (o.labels && o.labels.length !== o.dials.length)) err(`${id}: dial length mismatch`);
      o.answer.forEach((a, d) => { if (!(a >= 0 && a < o.dials[d].length)) err(`${id}: dial answer out of range`); });
    } else if (o.type === "sort") {
      if (!o.bins || o.bins.length < 2 || !o.items || o.items.length < 3 || o.items.some(([t, k]) => !t || !(k >= 0 && k < o.bins.length))) err(`${id}: bad sort items`);
      if (o.bins && o.bins.some((b, k) => !o.items.some(it => it[1] === k))) err(`${id}: a sort bin has no items`);
    } else if (o.type === "tap") {
      if (!o.tapSvg || !Array.isArray(o.answer) || !o.answer.length) err(`${id}: tap question has no correct target`);
      else if ((o.tapSvg.match(/data-t="/g) || []).length < 3) err(`${id}: tap question needs at least 3 targets`);
    } else err(`${id}: unknown type ${o.type}`);
      if (o.gch && (o.gch.length !== 4)) err(`${id}: graph choices need 4 graphs`);
  });
  [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6]].forEach(([lo, hi]) => { const n = qs.filter(q => { const b = Array.isArray(q) ? q[0] : q.b; return b >= lo && b <= hi; }).length; if (n < 2) err(`${r.id}: only ${n} questions for Bloom ${lo}-${hi}`); });
  const tagN = (SKILL_TAGS[r.id] || "").length;
  if (tagN > qs.length || /[^csdi]/.test(SKILL_TAGS[r.id] || "")) err(`${r.id}: SKILL_TAGS has ${tagN} letters for ${qs.length} questions (or a bad letter)`);
  const sk = Object.fromEntries(SKILL_IDS.map(k => [k, 0])); sk.word = spellable(r);
  qs.forEach((q, j) => { const o = Object.assign(Array.isArray(q) ? { b: q[0], q: q[1] } : Object.assign({}, q), { rid: r.id, id: "q" + j }), t = skillOf(o); sk[t.skill]++; if (t.unsure) unsure.push(`${r.id}#q${j} [${t.skill}] ${t.unsure}: ${o.q.slice(0, 90)}`); });
  const short = ["see", "data", "invest"].filter(k => sk[k] < SKILL_MIN);
  if (short.length) warns.push(`${r.id}: ${short.map(k => `${k} ${sk[k]}`).join(", ")} (want ≥${SKILL_MIN})`);
  cover.push({ id: r.id, sk, gap: ["see", "data", "invest"].reduce((a, k) => a + Math.max(0, SKILL_MIN - sk[k]), 0) + Math.max(0, 3 - sk.word) });
  console.log(`${r.id.padEnd(5)} ${String(qs.length).padStart(2)} q · Bloom ${[1,2,3,4,5,6].map(b => `${b}:${bl[b] || 0}`).join(" ")} · Skill ${SKILL_IDS.map(k => `${k}:${sk[k]}`).join(" ")}`);
});
const sum = Object.fromEntries(SKILL_IDS.map(k => [k, cover.reduce((a, c) => a + c.sk[k], 0)]));
console.log(`\nSkill totals: ${SKILL_IDS.map(k => `${k} ${sum[k]}`).join(" · ")} (word = spelling-lock terms)`);
console.log(`Lock labels shown (stage has ≥3 of that skill): ${SKILL_IDS.map(k => `${k} ${cover.filter(c => c.sk[k] >= 3).length}/${cover.length}`).join(" · ")}`);
if (warns.length) { console.log(`\n⚠ ${warns.length} stage(s) below ${SKILL_MIN} see/data/invest questions (warning only):`); warns.forEach(w => console.log("  ⚠", w)); }
console.log("\nBiggest skill gaps:"); cover.slice().sort((a, b) => b.gap - a.gap).slice(0, 10).forEach(c => console.log(`  ${c.id.padEnd(5)} missing ${c.gap} · ${SKILL_IDS.map(k => `${k}:${c.sk[k]}`).join(" ")}`));
console.log(`\n${unsure.length} question(s) without a hand-reviewed skill (SKILL_TAGS)${process.argv.includes("--unsure") ? ":" : " (run with --unsure to list)"}`);
if (process.argv.includes("--unsure")) unsure.forEach(u => console.log("  ?", u));
console.log(`\n${ROOMS.length} stages, ${total} questions, ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
