// Content sanity checks: node tools/check_content.js
const fs = require("fs"), vm = require("vm");
const src = ["chars.js", "diagrams.js", "graphs.js", "stages.js", "stages2.js", "scenes.js", ...[1,2,3,4,5,6,7,8,9,11,13,15,17].map(i => `q_t${i}.js`), "q_graphs.js", "q_graphs2.js", "q_kb1.js", "q_kb2.js", "rush.js"].map(f => fs.readFileSync(`src/${f}`, "utf8")).join("\n").replace("<script>", "");
const ctx = { outfitSvg: () => "", console, subseq: (a) => a, specialSvg: () => "", SFX: {} };
vm.createContext(ctx); vm.runInContext(src + "\nthis.ROOMS=ROOMS;this.SCENES=SCENES;this.QB=QB;this.DIAGRAMS=DIAGRAMS;this.TOPICS=TOPICS;", ctx);
const { ROOMS, QB, DIAGRAMS } = ctx; let bad = 0, total = 0;
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
    if (/\b(the|this|a) (diagram|graph|bar chart|histogram|trace)\b(?! type)/i.test(o.q) && !/sketch|draw|design/i.test(o.q) && !o.svg) err(`${id}: mentions diagram/graph but has no svg`);
    if (o.type === "mc") {
      if (!Array.isArray(o.choices) || o.choices.length !== 4) err(`${id}: needs 4 choices`);
      else if (!(o.answer >= 0 && o.answer < 4)) err(`${id}: bad answer`);
      else if (new Set(o.choices).size !== 4) err(`${id}: duplicate choices`);
    } else if (o.type === "dial") {
      if (o.dials.length !== o.answer.length || (o.labels && o.labels.length !== o.dials.length)) err(`${id}: dial length mismatch`);
      o.answer.forEach((a, d) => { if (!(a >= 0 && a < o.dials[d].length)) err(`${id}: dial answer out of range`); });
    } else err(`${id}: unknown type ${o.type}`);
  });
  [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6]].forEach(([lo, hi]) => { const n = qs.filter(q => { const b = Array.isArray(q) ? q[0] : q.b; return b >= lo && b <= hi; }).length; if (n < 2) err(`${r.id}: only ${n} questions for Bloom ${lo}-${hi}`); });
  console.log(`${r.id.padEnd(5)} ${String(qs.length).padStart(2)} q · Bloom ${[1,2,3,4,5,6].map(b => `${b}:${bl[b] || 0}`).join(" ")}`);
});
console.log(`\n${ROOMS.length} stages, ${total} questions, ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
