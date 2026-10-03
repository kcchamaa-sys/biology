
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
// Hand-set skills for questions the heuristic got wrong, keyed like saved progress (`room:qN`), so ids never change.
const SKILL_SET = {
  // experiment method / controls / reliability -> Investigate
  "t3s2:q12": "invest", "t5s3:q18": "invest", "t6s3:q10": "invest", "t6s6:q1": "invest", "t6s6:q5": "invest", "t6s6:q17": "invest",
  "t6s6:q19": "invest", "t7s3:q3": "invest", "t7s3:q6": "invest", "t7s3:q18": "invest", "t7s3:q19": "invest", "t12s2:q6": "invest",
  "t12s2:q9": "invest", "t12s2:q17": "invest", "t15s3:q2": "invest", "t16s3:q13": "invest", "t16s3:q18": "invest",
  // numbers given in the stem -> Data
  "t17s2:q12": "data", "t19s3:q19": "data",
  // "table" with no numbers is really a comparison -> Concepts
  "t4s3:q13": "concept", "t16s3:q14": "concept", "t17s1:q7": "concept"
};
// Returns { skill, unsure } where unsure is a short reason when the heuristic could reasonably go another way.
function skillOf(p) {
  if (p.skill && SKILL_IDS.includes(p.skill)) return { skill: p.skill, unsure: null };
  if (SKILL_SET[`${p.rid}:${p.id}`]) return { skill: SKILL_SET[`${p.rid}:${p.id}`], unsure: null };
  if (p.gen === "spell" || p.gen === "spellmc" || p.type === "spell") return { skill: "word", unsure: null };
  const q = p.q || "", inv = INVEST_RE.test(q);
  if ((p.svg && isGraphSvg(p.svg)) || p.graph) return { skill: "data", unsure: inv ? "graph + investigation wording" : null };
  if (/\btable\b/i.test(q)) return { skill: "data", unsure: /\d/.test(q) ? null : "mentions a table but has no numbers" };
  if (p.svg) return { skill: "see", unsure: inv ? "drawing + investigation wording" : null };
  if (inv) return { skill: "invest", unsure: null };
  if (INVEST_WEAK_RE.test(q)) return { skill: "concept", unsure: "experiment wording, no plan/variable/conclusion cue" };
  if (DATA_WORDS_RE.test(q)) return { skill: "concept", unsure: "data wording but no graph or table" };
  return { skill: "concept", unsure: null };
}
