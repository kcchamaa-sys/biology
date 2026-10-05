
/* ============================================================
   🔥 Hard-level formats (exam-board question styles, kept low-key for students: no exam names in the game). Loaded after every other bank, so ids only ever append.
   Every wrong option names the misconception or reading trap it targets (`why`), shown when a student picks it
   and in "🪤 Why the other options are traps" after answering.
   KH(stage, [entry, ...]) where entry is one of:
     ["R", skill, bloom, question, [I, II, III], answer, [noteI, noteII, noteIII], hint, explain]
         Roman-numeral combination. answer = index into ROMAN_SET: 0 I+II · 1 I+III · 2 II+III · 3 all three.
         Each note says why that statement is true or false; trap notes are built from them.
     ["A", skill, bloom, statement1, statement2, answer, hint, explain]
         Two statements. answer = index into AR_OPTS (0 both true + explains · 1 both true, no · 2 1st only · 3 2nd only).
     ["L", skill, bloom, question, [step1, step2, step3], trapStep, hint, explain]
         Logic chain: three dials put the cause → effect steps in order; one trap step is mixed in.
     [fmt, skill, bloom, question, [correct, wrong1, wrong2, wrong3], [trap1, trap2, trap3], hint, explain, table?]
         fmt T table detective · C spot the difference · N real-world puzzle · E spot the flaw.
     Media questions are objects instead: see khMedia() below (fmt K case file · V virtual lab · G pick the graph · D graph detective · S sort it · P tap it).
         table = [[header...], [row...], ...] shown under the question.
   skill letters as in SKILL_TAGS: c concept · s see · d data · i invest.
   ============================================================ */
const KH_SKILL = { c: "concept", s: "see", d: "data", i: "invest" };
const ROMAN_SET = [[0, 1], [0, 2], [1, 2], [0, 1, 2]], ROMAN_TXT = ["I and II only", "I and III only", "II and III only", "I, II and III"], ROMAN = ["I", "II", "III"];
const AR_OPTS = ["Both are true, and the 2nd explains the 1st", "Both are true, but the 2nd does NOT explain the 1st", "The 1st is true, but the 2nd is false", "The 1st is false, but the 2nd is true"];
const AR_WHY = [
  [null, "The 2nd statement IS the reason for the 1st. Test it by joining them with 'because'.", "The 2nd statement is true.", "The 1st statement is true."],
  ["Both are true, but the 2nd is not the reason for the 1st. Join them with 'because': does it make biological sense?", null, "The 2nd statement is true as well.", "The 1st statement is true."],
  ["The 2nd statement is false, so it cannot explain anything.", "The 2nd statement is false.", null, "It's the other way round: the 1st is true and the 2nd is false."],
  ["The 1st statement is false.", "The 1st statement is false.", "It's the other way round: the 1st is false and the 2nd is true.", null]
];
const ANIM_SCENES = ["bubbles", "bead", "ecg"];
// Object entries (media questions): { f, k, b, q, hint, explain, tip?, case?, table?, chart?, scene?, then ONE of:
//   choices + why (+ gch: 4 mini graphs, gax: [x words, y words])  ·  bins + items: [[text, bin]]  ·  tap: { chart | scene, want } }
function khMedia(e) {
  const p = { fmt: e.f, skill: KH_SKILL[e.k], b: e.b, q: e.q, hint: e.hint, explain: e.explain };
  if (e.tip) p.tip = e.tip; if (e.case) p.case = e.case; if (e.table) p.table = e.table;
  if (e.chart) { p.media = plot(e.chart); p.graph = true; }
  if (e.scene) { const r = SCENE[e.scene.kind](e.scene); p.media = r.svg; if (ANIM_SCENES.includes(e.scene.kind)) p.alt = r.alt; }
  if (e.items) return Object.assign(p, { type: "sort", bins: e.bins, items: e.items, answer: e.items.map(x => x[1]) });
  if (e.tap) {
    if (e.tap.chart) return Object.assign(p, { type: "tap", tapSvg: tapPlot(e.tap.chart), answer: [].concat(e.tap.want), graph: true });
    const r = SCENE[e.tap.scene.kind](Object.assign({ tap: true }, e.tap.scene)), want = [].concat(e.tap.want);
    return Object.assign(p, { type: "tap", tapSvg: r.svg, answer: r.kinds.map((k, i) => want.includes(k) ? i : -1).filter(i => i >= 0) });
  }
  Object.assign(p, { choices: e.choices, answer: 0, why: [null].concat(e.why) });
  if (e.gch) { p.gch = e.gch; p.gax = e.gax || ["", ""]; }
  return p;
}
const KH = (id, list) => KB(id, list.map(e => {
  if (!Array.isArray(e)) return khMedia(e);
  const [f, k, b] = e, base = { fmt: f, skill: KH_SKILL[k], b };
  if (f === "R") {
    const [, , , q, stmts, answer, notes, hint, explain] = e, choices = ROMAN_TXT, sets = ROMAN_SET;
    const right = sets[answer], why = sets.map((s, i) => {
      if (i === answer) return null;
      const extra = s.filter(x => !right.includes(x)), miss = right.filter(x => !s.includes(x));
      return extra.length ? `It includes ${ROMAN[extra[0]]}, which is false: ${notes[extra[0]]}` : `It leaves out ${ROMAN[miss[0]]}, which is also true: ${notes[miss[0]]}`;
    });
    return Object.assign(base, { q, stmts, choices, answer, keep: true, why, hint, explain: `${explain} ${notes.map((n, i) => `(${ROMAN[i]}) ${n}`).join(" ")}` });
  }
  if (f === "A") {
    const [, , , s1, s2, answer, hint, explain] = e;
    return Object.assign(base, { q: "Read the two statements. Which option is correct?", stmts: [s1, s2], slabels: ["1st", "2nd"], choices: AR_OPTS, answer, keep: true, why: AR_WHY[answer], hint, explain });
  }
  if (f === "L") {
    const [, , , q, steps, trap, hint, explain] = e, opts = steps.concat(trap);
    return Object.assign(base, { type: "dial", chain: true, q, dials: [opts, opts, opts], labels: ["Step 1", "Step 2", "Step 3"], answer: [0, 1, 2], hint, explain });
  }
  const [, , , q, choices, traps, hint, explain, table] = e;
  return Object.assign(base, { q, choices, answer: 0, why: [null].concat(traps), hint, explain }, table ? { table } : {});
}));
