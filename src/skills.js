
/* ============================================================
   5h. Skill strands: every question belongs to ONE skill, and each escape-room lock has ONE strand.
   Lock 1 Words · Lock 2 Concepts · Lock 3 See it · Lock 4 Data · Lock 5 Investigate.
   A question may set `skill` itself; otherwise skillOf() tags it with a heuristic.
   Shared with tools/check_content.js, so keep this file free of DOM and game-state code.
   ============================================================ */
const SKILLS = [
  { id: "word", name: "Words", icon: "🔤", tip: "Key terms and spelling" },
  { id: "concept", name: "Concepts", icon: "💡", tip: "Explain the biology" },
  { id: "see", name: "See it", icon: "🔍", tip: "Read a diagram or picture" },
  { id: "data", name: "Data", icon: "📈", tip: "Read graphs and tables" },
  { id: "invest", name: "Investigate", icon: "🧪", tip: "Plan, test and conclude" }
];
const SKILL_IDS = SKILLS.map(s => s.id);
// Nearest strands to borrow from when a stage is short. Spelling ("word") is never borrowed outside lock 1.
const SKILL_NEAR = { word: ["concept"], concept: ["see", "invest", "data"], see: ["data", "concept", "invest"], data: ["see", "invest", "concept"], invest: ["data", "concept", "see"] };
const isGraphSvg = s => /^g[A-Z]/.test(s) || /Graph$/.test(s);
const INVEST_RE = /\b(plan(s|ned|ning)?|fair test\w*|variables?|repeat(s|ed|ing)?|replicates?|conclu(sion|sions|de|ded|des)|evaluat\w*|control (group|experiment|set-?up|tube)|investigat\w*)\b/i;
const INVEST_WEAK_RE = /\b(experiment\w*|hypothes\w*|reliab\w*|valid\w*|predict\w*|measure\w*)\b/i;
const DATA_WORDS_RE = /\b(table|results?|data|readings?|per ?cent|rate of)\b|\d+\s?%/i;
/* Hand-reviewed skill of every bank question, by what the student has to DO (read question by question, not by regex).
   One letter per question, in bank order (index j = question id "qj"): c concept · s see · d data · i invest.
   concept: recall, explain, apply, or judge a claim ("X says… evaluate"); needs no picture and no numbers.
   see: name/identify parts on a drawing; covering the picture makes it unanswerable.
   data: read, describe or interpret numbers, a graph or a table (also a graph described in words); a graph that
     is only decoration counts as concept.
   invest: method: variables, controls, fair test, reliability, set-up/apparatus, procedure, lab scenarios, or
     whether a conclusion is supported.
   New questions are only ever appended: add a letter at the end of the stage's string. Untagged questions fall back
   to the heuristic below and are listed by `node tools/check_content.js --unsure`. */
const SKILL_TAGS = {
  t1s1: "cccccccccccciicdddcccc",
  t1s2: "ccccccccccsciicdcdcicic",
  t1s3: "ccccccccccccciidddcidi",
  t2s1: "ccciccciciciciiiddccci",
  t2s2: "cccccccssccccccdcccccc",
  t2s3: "cccccccscccccccddcccc",
  t3s1: "ccccsccccccciicdddccc",
  t3s2: "cccccicscdcciicddiccccc",
  t3s3: "ccccccccccdciicdddcccc",
  t4s1: "ccccsccssccdcicdddcccd",
  t4s2: "cccccccccccccccddccccc",
  t4s3: "ccccccccccccccidcccc",
  t5s1: "ccccccsccccccciddcccc",
  t5s2: "cccccdcdddiicicddcccd",
  t5s3: "cccccccccccccicddcii",
  t6s1: "cccccccscccccciccccc",
  t6s2: "cccccicsccccccidddccc",
  t6s3: "cccccciccciccciddccc",
  t6s4: "cccccccccccccciddcccc",
  t6s5: "ccccciccddiicciddddc",
  t6s6: "ciiiiiiiiiiiiiiddiii",
  t7s1: "cccccccscccccccdddccccc",
  t7s2: "ccccccccisiciicdddcccc",
  t7s3: "cciiiiiciciicicddiii",
  t9s1: "cccccccccdcccicccccc",
  t9s2: "ccccccccccccccccccccc",
  t9s3: "cccccccccccciicddcccc",
  t10s1: "cccccccccccccccccc",
  t10s2: "ccccccccccccccccccccc",
  t10s3: "ccccccccccccccccccccc",
  t11s1: "ccccccccccccccccccccc",
  t11s2: "cccccccccccccccdcccc",
  t11s3: "cccccccccccccciccccc",
  t12s1: "cccccccccccciccccc",
  t12s2: "cccccciciiccdicdciicc",
  t12s3: "ccccccccccccciccccc",
  t8s1: "ccccccccccccccccdccc",
  t8s2: "cccccccscccccicddiccccc",
  t8s3: "cccccccscccccccddccccc",
  t13s1: "ccccccccccccccccccc",
  t13s2: "ccccccccdccccicddcccc",
  t13s3: "cccccicccccciicccc",
  t14s1: "ccccccccccccicccdcccc",
  t14s2: "ccccccccccccccicccc",
  t14s3: "ccccccccccccccccccc",
  t15s1: "cccccccccccccicccccc",
  t15s2: "ccccccccccccccccccccc",
  t15s3: "cciicccccccicidddiccc",
  t16s1: "cccccccccccccicccccccc",
  t16s2: "ccccccccccccciccccccc",
  t16s3: "ccccccciccccciccccic",
  t16s4: "cccccccccccccccccccc",
  t17s1: "ccccccccccccdccdcccccc",
  t17s2: "ccccccccccccdicdcc",
  t18s1: "ccccccccdccccicdcccc",
  t18s2: "cccccccccccccccdcccccc",
  t18s3: "iciicdcciccicicidic",
  t19s1: "ccccccccccccccidccccc",
  t19s2: "cccccccccccdccddcccccc",
  t19s3: "ccccccccccccccccccci"
};
const TAG_SKILL = { c: "concept", s: "see", d: "data", i: "invest" };
// Returns { skill, unsure }: an explicit `skill` field wins, then SKILL_TAGS, then the heuristic (always marked unsure).
function skillOf(p) {
  if (p.skill && SKILL_IDS.includes(p.skill)) return { skill: p.skill, unsure: null };
  if (p.gen === "spell" || p.gen === "spellmc" || p.type === "spell") return { skill: "word", unsure: null };
  const tag = /^q\d+$/.test(p.id || "") && (SKILL_TAGS[p.rid] || "")[+p.id.slice(1)];
  if (TAG_SKILL[tag]) return { skill: TAG_SKILL[tag], unsure: null };
  const h = skillGuess(p); return { skill: h.skill, unsure: `not hand-reviewed yet${h.unsure ? `; ${h.unsure}` : ""}` };
}
// Keyword heuristic, used only for questions not yet in SKILL_TAGS.
function skillGuess(p) {
  const q = p.q || "", inv = INVEST_RE.test(q);
  if ((p.svg && isGraphSvg(p.svg)) || p.graph) return { skill: "data", unsure: inv ? "graph + investigation wording" : null };
  if (/\btable\b/i.test(q)) return { skill: "data", unsure: /\d/.test(q) ? null : "mentions a table but has no numbers" };
  if (p.svg) return { skill: "see", unsure: inv ? "drawing + investigation wording" : null };
  if (inv) return { skill: "invest", unsure: null };
  if (INVEST_WEAK_RE.test(q)) return { skill: "concept", unsure: "experiment wording, no plan/variable/conclusion cue" };
  if (DATA_WORDS_RE.test(q)) return { skill: "concept", unsure: "data wording but no graph or table" };
  return { skill: "concept", unsure: null };
}
