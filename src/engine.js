// Each stage's pool: its questions, converted to one shape. Internally each has a Bloom level b (1–6);
// students only ever see a friendly difficulty label.
const DIFF = b => b <= 2 ? { t: "Easy", i: "🌱", c: "easy" } : b <= 4 ? { t: "Medium", i: "🌿", c: "medium" } : b === 5 ? { t: "Hard", i: "🔥", c: "hard" } : { t: "Expert", i: "⭐", c: "expert" };
const diffChip = b => { const d = DIFF(b); return `<span class="diff ${d.c}">${d.i} ${d.t}</span>`; };
/* Spelling: every stage's key terms become "type the word" locks, and longer single words
   also become "which spelling is correct?" checks with believable misspellings. */
const normWord = w => String(w || "").toLowerCase().replace(/[^a-z]/g, "");
const countLetters = w => normWord(w).length;
// British and American spellings are both accepted: both sides are mapped to one shared form
// (haemoglobin/hemoglobin, oesophagus/esophagus, fertilise/fertilize, fibre/fiber, colour/color...).
const US_RULES = [[/haem/g, "hem"], [/aemi/g, "emi"], [/caec/g, "cec"], [/faec/g, "fec"], [/paed/g, "ped"], [/foet/g, "fet"], [/^oe/, "e"],
  [/sulph/g, "sulf"], [/mould/g, "mold"], [/grey/g, "gray"], [/(fib|cent|lit|met|lust)re(s?)$/, "$1er$2"], [/our(s?)$/, "or$1"],
  [/([a-z]{3})ys(e|es|ed|ing|er|ers)$/, "$1yz$2"], [/([a-z]{3})is(e|es|ed|ing|ation|ations|er|ers)$/, "$1iz$2"], [/logue$/, "log"], [/rrhoea/g, "rrhea"], [/anaes/g, "anes"], [/programme/g, "program"]];
const spellKey = w => String(w || "").toLowerCase().split(/[^a-z]+/).filter(Boolean).map(x => US_RULES.reduce((a, [re, to]) => a.replace(re, to), x)).join("");
const sameSpelling = (a, b) => normWord(a) === normWord(b) || spellKey(a) === spellKey(b);
function spellBoxes(word, typed) {
  const t = normWord(typed); let k = 0;
  return [...word].map((ch, j) => /[a-z]/i.test(ch) ? `<i class="${t[k] ? "f" : ""}">${esc(t[k] ? t[k++] : (j === 0 ? ch.toLowerCase() : ""))}</i>` : ch === " " ? `<i class="gap"></i>` : `<i class="gap">${esc(ch)}</i>`).join("");
}
function misspell(w) {
  const out = new Set(), sw = (a, i) => a.slice(0, i) + a[i + 1] + a[i] + a.slice(i + 2);
  const V = { a: "e", e: "i", i: "e", o: "u", u: "o", y: "i" };
  for (let i = w.length - 3; i >= 2 && out.size < 2; i--) if (w[i] !== w[i + 1]) out.add(sw(w, i));
  const dbl = w.search(/([a-z])\1/); if (dbl > 0) out.add(w.slice(0, dbl) + w.slice(dbl + 1)); else { const c = w.search(/[^aeiou][aeiou]/); if (c > 0) out.add(w.slice(0, c + 1) + w[c] + w.slice(c + 1)); }
  for (let i = 1; i < w.length - 1 && out.size < 5; i++) if (V[w[i]]) out.add(w.slice(0, i) + V[w[i]] + w.slice(i + 1));
  return [...out].filter(x => x !== w && !sameSpelling(x, w)).slice(0, 3);
}
function buildPools() {
  ROOMS.forEach(r => {
    r.pool = (QB[r.id] || []).map((q, j) => Array.isArray(q)
      ? { id: "q" + j, b: q[0], type: "mc", q: q[1], choices: q[2], answer: 0, hint: q[3], explain: q[4], tip: q[5] }
      : Object.assign({ type: "mc", answer: 0 }, q, { id: "q" + j }));
    r.terms.forEach(([t, m], j) => {
      const core = normWord(t);
      if (core.length < 5 || /[A-Z]{2}|\d/.test(t) || normWord(m).includes(core)) return;
      r.pool.push({ id: "s" + j, b: 1, type: "spell", gen: "spell", q: `Spell the term: “${m}”`, answer: t, hint: `It starts with “${t.slice(0, 3)}…” and has ${core.length} letters.`, explain: `${t}: ${m}.` });
      if (/^[a-z]+$/.test(t) && t.length >= 6) { const bad = misspell(t); if (bad.length === 3) r.pool.push({ id: "m" + j, b: 1, type: "mc", gen: "spellmc", fix: false, q: `Which spelling is correct? (${m})`, choices: [t, ...bad], answer: 0, hint: "Say it slowly, syllable by syllable.", explain: `The correct spelling is “${t}”.` }); }
    });
    r.pool.forEach(p => { p.rid = r.id; p.skill = skillOf(p).skill; });
    // Real questions per skill (word = distinct terms, since a term's spell + spellmc pair counts once)
    r.skillN = Object.fromEntries(SKILL_IDS.map(k => [k, k === "word" ? new Set(r.pool.filter(p => p.gen).map(p => p.id.slice(1))).size : r.pool.filter(p => p.skill === k).length]));
  });
}
buildPools();
const ROOM_SECONDS = 20 * 60;
// Students asked for shorter waits: no time penalty or lock-out lasts longer than 15 s.
const MAX_WAIT = 15, TIME_FINE = 10;
const CHEERS = ["Wahoo!", "Woo!", "Boing boing!", "Waaai!", "Sugoi!"];
const SNACKS = ["🍡 Chestnut bun", "🍘 Rice cracker", "🍮 Pudding", "🍙 Onigiri", "🍜 Ramen ticket", "🧋 Bubble tea", "🥚 Egg tart", "🧇 Egg waffle", "🍍 Pineapple bun", "🍓 Strawberry daifuku"];
const TOPIC_LABELS = Object.fromEntries(TOPICS.map(t => [t.id, `${t.icon} ${t.name}`]));
const topicRooms = ti => ROOMS.filter(r => r.t === ti);

/* ============================================================
   5c. Save system
   - Auto-save to localStorage("escapeGame_biology") on every change
   - 8-character save code (Crockford base32) to move between devices
   ============================================================ */
const SAVE_KEY = "escapeGame_biology";
const SOUND_KEY = "escapeGame_biology_sound";
// Inside the claude.ai viewer the page runs in a frame, so share the published artifact link;
// when the file is hosted on its own (e.g. GitHub Pages), share the page's own address.
const ARTIFACT_URL = "https://claude.ai/artifact/GKWNyuWWhN2pt4ZLFnSDdf";
const shareBase = () => (window.top !== window.self && ARTIFACT_URL ? ARTIFACT_URL : location.href.split("#")[0]);

const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const dayNum = s => { const [y, m, d] = s.split("-").map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };

function freshStats() { return { days: 0, correct: 0, run: 0, bestRun: 0, replays: 0, cleanEscapes: 0, noHintEscapes: 0, rushRounds: 0, chests: 0, night: 0, spellRight: 0, graphFirst: 0, incidents: 0, dictPerfect: 0, dictRounds: 0, escClears: 0, escNoHint: 0, escBosses: 0, cured: 0, wrongMeds: 0 }; }
function freshRun() { return { firsts: [], strikes: 0, hints: false, qids: null, steps: {} }; }
function newId() { return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function freshMastery() { return Object.fromEntries(TOPICS.map(t => [t.id, 0])); }
function freshState() {
  return {
    v: 1, player_name: "Student", current_streak: 0, longest_streak: 0, last_login_date: null,
    completed_rooms: [], current_room: ROOMS[0].id, streak_shields: 3, chiikawa_badges: [], inventory: [],
    bio_mastery: freshMastery(),
    room_progress: {}, mastered_puzzles: [], room_stars: {}, room_timer: {}, last_chest_date: null, seen: {}, last_revise_day: null,
    room_run: {}, trophies: {}, stats: freshStats(),
    coins: 0, owned: [], equip: { hat: null, hair: null, face: null, outfit: null, ribbon: null, hand: null, frame: null }, power: { torch: 1, crystal: 1, guard: 1 },
    rush: { best: 0, lastDay: null }, player_id: newId(), lb_last: 0, mistakes: {}, mistakes_cleared: 0, playMode: "escape", pets: {}, activePet: null, ill: null, lastIllDay: null, lastIll: null, coll: { owned: {}, pending: 0, pity: 0 }, dict: { missed: {}, best: 0 },
    last_study_day: null, study_days: [], frozen_days: [], freeze_month: null, freeze_used: null, mission: null, upd: 0,
    pals: { mochi: newPal() }, activePal: "mochi", lucky: { day: null, pity: 0, draws: 0, last: null }, pantry: {}
  };
}
function normalise(obj) {
  const s = Object.assign(freshState(), obj || {});
  s.bio_mastery = Object.assign(freshMastery(), (obj && obj.bio_mastery) || {});
  s.stats = Object.assign(freshStats(), (obj && obj.stats) || {});
  s.trophies = Object.assign({}, s.trophies); s.room_run = Object.assign({}, s.room_run); s.seen = Object.assign({}, s.seen);
  s.room_progress = Object.assign({}, s.room_progress); s.room_stars = Object.assign({}, s.room_stars); s.room_timer = Object.assign({}, s.room_timer);
  s.mastered_puzzles = [...new Set(s.mastered_puzzles || [])];
  s.mistakes = Object.assign({}, s.mistakes);
  s.coll = Object.assign({ owned: {}, pending: 0, pity: 0, pityL: 0 }, s.coll); s.coll.owned = Object.assign({}, s.coll.owned); migrateCards(s.coll);
  s.pets = Object.assign({}, s.pets);
  s.dict = Object.assign({ missed: {}, best: 0 }, s.dict); s.dict.missed = Object.assign({}, s.dict.missed);
  s.equip = Object.assign({ hat: null, hair: null, face: null, outfit: null, ribbon: null, hand: null, frame: null }, s.equip); s.power = Object.assign({ torch: 0, crystal: 0, guard: 0 }, s.power);
  s.rush = Object.assign({ best: 0, lastDay: null }, s.rush); s.owned = [...(s.owned || [])]; if (!s.player_id) s.player_id = newId();
  s.completed_rooms = [...new Set((s.completed_rooms || []).filter(id => ROOMS.some(r => r.id === id)))];
  if (!ROOMS.some(r => r.id === s.current_room)) s.current_room = ROOMS[0].id;
  // Saves from before the study streak: count the last visit as a study day and hand out the 3 starting Streak Freezes
  if (obj && !("last_study_day" in obj)) { s.last_study_day = s.last_login_date; s.study_days = s.last_login_date ? [s.last_login_date] : []; s.streak_shields = Math.max(s.streak_shields || 0, 3); }
  s.lucky = Object.assign({ day: null, pity: 0, draws: 0, last: null }, s.lucky); s.pantry = Object.assign({}, s.pantry);
  s.pals = Object.assign({ mochi: newPal() }, s.pals); if (!s.pals[s.activePal]) s.activePal = "mochi";
  s.study_days = [...(s.study_days || [])]; s.frozen_days = [...(s.frozen_days || [])];
  return s;
}
function load(key) {
  try {
    const raw = localStorage.getItem(key || storeKey());
    if (raw) return normalise(JSON.parse(raw));
  } catch (e) {}
  return null;
}
let savedFlash = 0;
function save(flash) {
  if (!S) return;
  S.upd = Date.now();
  try { localStorage.setItem(storeKey(), JSON.stringify(S)); } catch (e) {}
  cloudSaveSoon();
  if (flash) { savedFlash = Date.now(); renderTools(); }
}

/* Save code: 12 characters of Crockford base32 (no I, L, O, U), shown as ABCD-EFGH-JKLM.
   Packs, for each topic, stages escaped (0–n) in a mixed radix (n + 1 per topic); the average star rating (1–3);
   the stage in progress and its locks solved (0–4); streak (1–31) and shields (0–3).
   The packed number n (< CODE_M) is multiplied by a constant modulo a large prime P, so codes look random,
   and a typo almost always decodes to a number ≥ CODE_M, which is rejected. */
const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ", CODE_LEN = 12;
const RADIX = TOPICS.map((_, ti) => BigInt(ROOMS.filter(r => r.t === ti).length + 1));
const TOPIC_M = RADIX.reduce((a, b) => a * b, 1n);
const CUR_N = BigInt(TOPICS.length * 5);
const CODE_M = TOPIC_M * 3n * 32n * 4n * CUR_N;   // about 1.6e16
const CODE_P = 1152921504606846883n;               // largest prime below 2^60 = 32^12
const CODE_K = 734690243128773251n;                // any multiplier 1 < K < P
function modInvBig(a, m) {
  let [r0, r1, s0, s1] = [a % m, m, 1n, 0n];
  while (r1 !== 0n) { const q = r0 / r1; [r0, r1] = [r1, r0 - q * r1]; [s0, s1] = [s1, s0 - q * s1]; }
  return ((s0 % m) + m) % m;
}
const CODE_KINV = modInvBig(CODE_K, CODE_P);
function roomStars(r) {
  if (!S.completed_rooms.includes(r.id)) return 0;
  return S.room_stars[r.id] || 1;
}
const stagesDone = ti => topicRooms(ti).filter(r => S.completed_rooms.includes(r.id)).length;
function topicStars(ti) {
  const done = topicRooms(ti).filter(r => S.completed_rooms.includes(r.id));
  return done.length ? Math.round(done.reduce((a, r) => a + roomStars(r), 0) / done.length) : 0;
}
const fmtCode = c => c.match(/.{1,4}/g).join("-");
function makeCode() {
  let n = 0n, mul = 1n;
  TOPICS.forEach((_, ti) => { n += BigInt(stagesDone(ti)) * mul; mul *= RADIX[ti]; });
  const done = ROOMS.filter(r => S.completed_rooms.includes(r.id)), avg = done.length ? Math.round(done.reduce((a, r) => a + roomStars(r), 0) / done.length) : 1;
  const cur = ROOMS[roomIndex(S.current_room)];
  const lock = cur && !S.completed_rooms.includes(cur.id) && isUnlocked(roomIndex(cur.id)) ? Math.min(4, (S.room_progress[cur.id] || []).length) : 0;
  const streak = Math.max(1, Math.min(31, S.current_streak)), shields = Math.max(0, Math.min(3, S.streak_shields));
  n += TOPIC_M * BigInt((avg - 1) + 3 * (streak + 32 * (shields + 4 * ((cur ? cur.t : 0) * 5 + lock))));
  let x = (n * CODE_K) % CODE_P, out = "";
  for (let i = 0; i < CODE_LEN; i++) { out = B32[Number(x % 32n)] + out; x /= 32n; }
  return out;
}
function decodeCode(raw) {
  const c = String(raw || "").toUpperCase().replace(/[^0-9A-Z]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
  if (c.length !== CODE_LEN) return null;
  let x = 0n;
  for (const ch of c) { const v = B32.indexOf(ch); if (v < 0) return null; x = x * 32n + BigInt(v); }
  if (x >= CODE_P) return null;
  let n = (x * CODE_KINV) % CODE_P;
  if (n >= CODE_M) return null;
  let t = n % TOPIC_M;
  const done = RADIX.map(rdx => { const v = Number(t % rdx); t /= rdx; return v; });
  n /= TOPIC_M;
  const avg = Number(n % 3n) + 1; n /= 3n;
  const streak = Number(n % 32n); n /= 32n;
  const shields = Number(n % 4n); n /= 4n;
  const curT = Math.floor(Number(n) / 5), lock = Number(n) % 5;
  if (streak === 0 || curT >= TOPICS.length) return null;
  if (lock > 0 && done[curT] === topicRooms(curT).length) return null; // locks in progress can't belong to a finished topic
  return { code: c, done, stars: done.map(d => (d ? avg : 0)), avg, curT, lock, streak, shields, escaped: done.reduce((a, b) => a + b, 0) };
}
function stateFromCode(d, name) {
  const s = freshState();
  s.player_name = name || (S && S.player_name) || "Student";
  TOPICS.forEach((T, ti) => {
    topicRooms(ti).slice(0, d.done[ti]).forEach(r => { s.completed_rooms.push(r.id); s.inventory.push(r.item); s.room_stars[r.id] = d.stars[ti]; });
    if (d.done[ti] === topicRooms(ti).length) s.chiikawa_badges.push(T.badge);
  });
  const tr = topicRooms(d.curT), nextR = tr[Math.min(tr.length - 1, d.done[d.curT])];
  s.current_room = nextR.id;
  if (!s.completed_rooms.includes(nextR.id) && d.lock) s.room_progress[nextR.id] = Array.from({ length: d.lock }, (_, i) => i);
  s.current_streak = d.streak; s.longest_streak = d.streak; s.streak_shields = d.shields; s.last_login_date = today(); s.last_study_day = today(); s.study_days = [today()];
  if (S) { s.trophies = S.trophies || {}; s.stats = Object.assign(freshStats(), S.stats); s.coins = S.coins || 0; s.owned = S.owned || []; s.equip = S.equip || s.equip; s.power = S.power || s.power; s.rush = S.rush || s.rush; s.player_id = S.player_id || s.player_id; s.last_chest_date = S.last_chest_date; s.mistakes = S.mistakes || {}; s.mistakes_cleared = S.mistakes_cleared || 0; s.coll = S.coll || s.coll; s.dict = S.dict || s.dict; s.pets = S.pets || {}; s.activePet = S.activePet || null; s.ill = S.ill || null; s.playMode = S.playMode || "escape"; s.inventory = s.inventory.concat((S.inventory || []).filter(x => SNACKS.includes(x))); }
  return s;
}

/* Mistake notebook: every wrong answer is saved; answering it right twice in a row clears it */
function noteMistake(rid, qid) {
  if (!S || !rid || !qid) return;
  const k = `${rid}:${qid}`, m = S.mistakes[k] || { n: 0, ok: 0 };
  m.n += 1; m.ok = 0; m.d = today(); S.mistakes[k] = m;
}
function noteRight(rid, qid, firstTry) {
  const k = `${rid}:${qid}`, m = S.mistakes[k];
  if (!m || !firstTry) return false;
  m.ok += 1; m.d = today();
  if (m.ok >= 2) { delete S.mistakes[k]; S.mistakes_cleared = (S.mistakes_cleared || 0) + 1; toast("📕 Cleared from your Mistake Notebook! 🎉"); return true; }
  return false;
}
const mistakeQ = k => { const [rid, qid] = k.split(":"), r = ROOMS[roomIndex(rid)]; const p = r && r.pool.find(x => x.id === qid); return p ? { r, p } : null; };
const mistakeKeys = ti => Object.keys(S.mistakes || {}).filter(k => { const m = mistakeQ(k); return m && (ti == null || m.r.t === ti); });

let S = load();
let streakNote = "";
try { SFX.on = localStorage.getItem(SOUND_KEY) !== "off"; } catch (e) {}

// Daily check-in: count the day, then let streakCheck() (daily.js) refill freezes and cover missed study days.
function checkIn() {
  const t = today();
  if (S.last_login_date !== t) S.stats.days += 1;
  palTick();
  streakNote = streakCheck() || (!S.last_login_date ? "🌱 Finish one activity today to start your study streak!" : "");
  S.longest_streak = Math.max(S.longest_streak || 0, S.current_streak);
  S.last_login_date = t;
  if (S.stats.days > 1 && maybeGetSick(.15)) streakNote = (streakNote ? streakNote + " " : "") + `🤒 Uh-oh... ${palName()} woke up feeling sick. Visit the clinic on Home!`;
  save();
  checkTrophies();
}
function recomputeMastery() {
  TOPICS.forEach((T, ti) => {
    const rs = topicRooms(ti), tot = rs.reduce((a, r) => a + r.pool.length, 0);
    const got = rs.reduce((a, r) => a + masteredIn(r), 0);
    S.bio_mastery[T.id] = tot ? Math.round(100 * got / tot) : 0;
  });
}

/* ============================================================
   6. Helpers
   ============================================================ */
const $app = document.getElementById("app"), $modal = document.getElementById("modal"), $journal = document.getElementById("journal");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pick = a => a[Math.floor(Math.random() * a.length)];
const reduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
// Speech bubbles. "codex" = the story narrator, "murk" = a Murk Warden; anyone else is your Study Pal.
// {P} = the pal's name, {N} = the student's name.
const say = (who, text, mood = "normal", cls = "") => {
  text = String(text).replace(/\{P\}/g, esc(palName())).replace(/\{N\}/g, esc((S && S.player_name) || "Keeper"));
  if (who === "codex") return `<div class="say lore"><div class="av">${codexSvg()}</div><div class="bubble ${cls}"><span class="name">📜 The Codex</span>${text}</div></div>`;
  if (who === "murk") return `<div class="say murk"><div class="av">${murkSvg(mood)}</div><div class="bubble ${cls}"><span class="name">Murk Warden</span>${text}</div></div>`;
  return `<div class="say"><div class="av">${avatar(who, mood)}</div><div class="bubble ${cls}"><span class="name">${(CHAR[who] || CHAR.chiikawa).name}</span>${text}</div></div>`;
};
const roomIndex = id => ROOMS.findIndex(r => r.id === id);
// Every topic is open; inside a topic, stages unlock one after another
const isUnlocked = i => ROOMS[i].s === 1 || S.completed_rooms.includes(ROOMS[i - 1].id);
// Recommended next stage: carry on in the current topic first, then the first unfinished topic
function nextRoomIndex() {
  const cur = ROOMS[roomIndex(S.current_room)];
  const inTopic = cur ? ROOMS.findIndex(r => r.t === cur.t && !S.completed_rooms.includes(r.id)) : -1;
  return inTopic !== -1 ? inTopic : ROOMS.findIndex(r => !S.completed_rooms.includes(r.id));
}
const stageLabel = r => `Topic ${r.topicNo} · ${r.boss ? "Boss stage" : `Stage ${r.s}`}`;
// Study mode is plain studying, so stages are named by their section topic (e.g. "1.1 Water and inorganic ions")
// instead of their escape-room name ("The Water Well").
const secNo = r => `${r.topicNo}.${topicRooms(r.t).indexOf(r) + 1}`;
const stageName = r => S && S.playMode === "study" ? `${secNo(r)} ${r.focus}` : r.name;
const stageLabelM = r => S && S.playMode === "study" ? `Topic ${r.topicNo} · Section ${secNo(r)}` : stageLabel(r);
const starStr = n => "★".repeat(n) + "☆".repeat(3 - n);
const fmt = sec => { const a = Math.abs(sec); return `${sec < 0 ? "+" : ""}${String(Math.floor(a / 60)).padStart(2, "0")}:${String(a % 60).padStart(2, "0")}`; };
function toast(msg) { msg = String(msg).replace(/\{P\}/g, palName()); const t = document.getElementById("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), 2600); }

function confetti(amount = 140) {
  if (reduced()) return;
  const cv = document.getElementById("fx"), ctx = cv.getContext("2d"); cv.hidden = false;
  const dpr = window.devicePixelRatio || 1; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cols = ["#FFB7C5", "#A0C4FF", "#FDFFB6", "#B9F3C9", "#C9C3F0", "#4A3E3D"];
  const ps = Array.from({ length: amount }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 140, y: innerHeight * .4, vx: (Math.random() - .5) * 12, vy: -Math.random() * 12 - 4, r: Math.random() * 5 + 3, c: pick(cols), s: Math.random() < .3, a: Math.random() * 6, va: (Math.random() - .5) * .3 }));
  const start = performance.now();
  (function frame(now) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ps.forEach(p => { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c;
      if (p.s) { ctx.font = `${p.r * 4}px sans-serif`; ctx.fillText("✦", 0, 0); } else ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); ctx.restore(); });
    if (now - start < 2600) requestAnimationFrame(frame); else { ctx.clearRect(0, 0, innerWidth, innerHeight); cv.hidden = true; }
  })(start);
}
function yaha(word) {
  SFX.yaha();
  const d = document.createElement("div"); d.className = "yaha";
  d.innerHTML = `<div class="inner">${figure("chiikawa", "happy")}<span class="word">${esc(word || pick(CHEERS))}</span></div>`;
  document.body.appendChild(d); setTimeout(() => d.remove(), 1250);
}

/* Item icons (clean SVG placeholders) */
const ICONS = {
  card: `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="7" width="24" height="18" rx="3" fill="#FDFFB6" stroke="${INK}" stroke-width="2.5"/><path d="M9 13h14M9 18h9" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  hand: `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="12" fill="#fff" stroke="${INK}" stroke-width="2.5"/><path d="M16 16V8M16 16l6 4" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/></svg>`,
  orb: `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11" fill="#A0C4FF" stroke="${INK}" stroke-width="2.5"/><path d="M11 12 q3 -4 7 -2" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`,
  key: `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="10" cy="16" r="6" fill="#FFB7C5" stroke="${INK}" stroke-width="2.5"/><path d="M16 16h12M24 16v5M28 16v4" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/></svg>`,
  gem: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 12 L11 6 H21 L26 12 L16 27 Z" fill="#B9F3C9" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M6 12H26M13 12l3 15 3-15" stroke="${INK}" stroke-width="1.8" fill="none"/></svg>`
};

/* ============================================================
   6b. Trophies: 10 hard ones that reward steady effort over many days
   ============================================================ */
const topicsCleared = () => TOPICS.filter((_, ti) => stagesDone(ti) === topicRooms(ti).length).length;
const partsCleared = () => PARTS.filter((_, pi) => TOPICS.every((T, ti) => T.p !== pi || stagesDone(ti) === topicRooms(ti).length)).length;
const bossesBeaten = () => ROOMS.filter(r => r.boss && S.completed_rooms.includes(r.id)).length;
const TROPHY_CATS = [["habit", "🔥 Daily habits"], ["adventure", "🗺️ Adventure"], ["brain", "🧠 Brain power"], ["fun", "🎀 Fun & style"]];
const TROPHIES = [
  { id: "week", cat: "habit", name: "Week Warrior", rar: "bronze", who: "chiikawa", desc: "Play 7 days in a row", prog: () => [S.longest_streak, 7] },
  { id: "chest", cat: "habit", name: "Snack Stash", rar: "bronze", who: "chiikawa", desc: "Draw the daily Lucky Capsule 10 times", prog: () => [S.stats.chests, 10] },
  { id: "steady", cat: "habit", name: "Steady Explorer", rar: "silver", who: "chiikawa", desc: "Play on 20 different days", prog: () => [S.stats.days, 20] },
  { id: "night", cat: "habit", name: "Night Owl", rar: "bronze", who: "chiikawa", desc: "Escape a stage after 9 pm", prog: () => [S.stats.night, 1] },
  { id: "flame", cat: "habit", name: "Eternal Flame", rar: "legend", who: "chiikawa", desc: "Reach a 30-day streak", prog: () => [S.longest_streak, 30] },
  { id: "first", cat: "adventure", name: "First Door", rar: "bronze", who: "chiikawa", desc: "Escape your very first stage", prog: () => [S.completed_rooms.length, 1] },
  { id: "topic", cat: "adventure", name: "Topic Tamer", rar: "silver", who: "chiikawa", desc: "Clear every stage of one topic", prog: () => [topicsCleared(), 1] },
  { id: "boss5", cat: "adventure", name: "Boss Buster", rar: "gold", who: "murk", desc: "Beat 5 boss stages", prog: () => [bossesBeaten(), 5] },
  { id: "part", cat: "adventure", name: "Part Champion", rar: "gold", who: "chiikawa", desc: "Clear every topic in one Part", prog: () => [partsCleared(), 1] },
  { id: "escaper", cat: "adventure", name: "Master Escaper", rar: "gold", who: "chiikawa", desc: `Escape all ${ROOMS.length} stages`, prog: () => [S.completed_rooms.length, ROOMS.length] },
  { id: "bossall", cat: "adventure", name: "Warden Breaker", rar: "legend", who: "murk", desc: `Beat all ${TOPICS.length} boss stages`, prog: () => [bossesBeaten(), TOPICS.length] },
  { id: "stars", cat: "adventure", name: "Star Collector", rar: "legend", who: "chiikawa", desc: "Collect 120 stars (3★ = 3 stars)", prog: () => [ROOMS.reduce((a, r) => a + roomStars(r), 0), 120] },
  { id: "spell", cat: "brain", name: "Spelling Bee", rar: "silver", who: "chiikawa", desc: "Spell 30 biology words correctly", prog: () => [S.stats.spellRight, 30] },
  { id: "tidy", cat: "brain", name: "Tidy Notebook", rar: "silver", who: "chiikawa", desc: "Clear 20 questions from your Mistake Notebook", prog: () => [S.mistakes_cleared || 0, 20] },
  { id: "clock", cat: "brain", name: "Beat the Clock", rar: "silver", who: "chiikawa", desc: "5 escapes before time runs out, with 0 guess strikes", prog: () => [S.stats.cleanEscapes, 5] },
  { id: "brain", cat: "brain", name: "Brain Power", rar: "silver", who: "chiikawa", desc: "5 escapes without using any hint", prog: () => [S.stats.noHintEscapes, 5] },
  { id: "sharp", cat: "brain", name: "Sharpshooter", rar: "gold", who: "chiikawa", desc: "15 first-try answers in a row (no hints, no mistakes)", prog: () => [S.stats.bestRun, 15] },
  { id: "graph", cat: "brain", name: "Graph Guru", rar: "gold", who: "chiikawa", desc: "Read 25 graphs right on the first try", prog: () => [S.stats.graphFirst, 25] },
  { id: "hunter", cat: "brain", name: "Knowledge Hunter", rar: "gold", who: "chiikawa", desc: "Answer 300 questions correctly", prog: () => [S.stats.correct, 300] },
  { id: "practice", cat: "brain", name: "Practice Makes Perfect", rar: "bronze", who: "chiikawa", desc: "Replay escaped stages 10 times", prog: () => [S.stats.replays, 10] },
  { id: "rush1", cat: "fun", name: "Rush Rookie", rar: "bronze", who: "chiikawa", desc: "Score 100 points in one Cell Rush", prog: () => [S.rush.best, 100] },
  { id: "spooky", cat: "fun", name: "Spooky Survivor", rar: "silver", who: "chiikawa", desc: "Survive 20 random incidents", prog: () => [S.stats.incidents, 20] },
  { id: "fashion", cat: "fun", name: "Fashion Icon", rar: "silver", who: "chiikawa", desc: "Own 8 outfits from the shop", prog: () => [S.owned.length, 8] },
  { id: "rush2", cat: "fun", name: "Lightning Brain", rar: "gold", who: "chiikawa", desc: "Score 300 points in one Cell Rush", prog: () => [S.rush.best, 300] },
  { id: "coll", cat: "fun", name: "Collector", rar: "gold", who: "chiikawa", desc: "Collect 20 different biology cards", prog: () => [collOwned(), 20] },
  { id: "rare", cat: "fun", name: "Rare Hunter", rar: "legend", who: "chiikawa", desc: "Collect 12 cards that are Rare or better", prog: () => [collOwned(true), 12] },
  { id: "dict", cat: "brain", name: "Dictation Star", rar: "gold", who: "chiikawa", desc: "Get 10 perfect Word Dictation rounds", prog: () => [S.stats.dictPerfect, 10] },
  { id: "doctor", cat: "fun", name: "Little Doctor", rar: "silver", who: "chiikawa", desc: "Cure your Study Pal 5 times with the right treatment", prog: () => [S.stats.cured, 5] },
  { id: "petpal", cat: "adventure", name: "Pet Pal", rar: "gold", who: "chiikawa", desc: "Adopt 10 pets", prog: () => [Object.keys(S.pets).length, 10] },
  { id: "hkguard", cat: "adventure", name: "HK Wildlife Guardian", rar: "legend", who: "chiikawa", desc: "Adopt all 5 Hong Kong species", prog: () => [PETS.filter(p => p.hk && S.pets[p.id]).length, 5] },
  { id: "labsci", cat: "brain", name: "Virtual Scientist", rar: "bronze", who: "chiikawa", desc: "Try 5 biology simulations", prog: () => [Object.keys(S.sims || {}).length, 5] }
];
// Rarity palette: [dark metal, light metal, label, card glow]
const RAR = { bronze: ["#C9824F", "#F7D2AE", "Bronze", "#F7D9BD"], silver: ["#9AA7BC", "#F4F7FB", "Silver", "#E3E9F2"], gold: ["#E0A92A", "#FFF3B0", "Gold", "#FFF1A8"], legend: ["#E27893", "#D7F0FF", "Legendary", "#F8D5E6"] };
function trophySvg(t, got) {
  const id = "tg" + t.id + (++clipN), [dk, lt] = got ? RAR[t.rar] : ["#BDB5A8", "#E8E2D6"];
  const legend = got && t.rar === "legend";
  const metal = legend ? `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#FFB7C5"/><stop offset=".35" stop-color="#FDFFB6"/><stop offset=".65" stop-color="#B9F3C9"/><stop offset="1" stop-color="#A0C4FF"/></linearGradient>`
    : `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${dk}"/><stop offset=".45" stop-color="${lt}"/><stop offset="1" stop-color="${dk}"/></linearGradient>`;
  const spark = (x, y, r = 6) => `<path d="M${x} ${y - r} l${r * .3} ${r * .7} ${r * .7} ${r * .3} -${r * .7} ${r * .3} -${r * .3} ${r * .7} -${r * .3} -${r * .7} -${r * .7} -${r * .3} ${r * .7} -${r * .3}z" fill="#FFF7C2" stroke="${INK}" stroke-width="1"/>`;
  return `<svg class="cup" viewBox="0 0 100 124" aria-hidden="true"><defs>${metal}</defs>
    ${got && (t.rar === "gold" || legend) ? `<circle cx="50" cy="44" r="44" fill="${legend ? "rgba(248,213,230,.55)" : "rgba(255,241,168,.55)"}"/>` : ""}
    <path d="M24 24 C4 24 6 58 32 58" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M24 24 C4 24 6 58 32 58" fill="none" stroke="${lt}" stroke-width="3" stroke-linecap="round"/>
    <path d="M76 24 C96 24 94 58 68 58" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M76 24 C96 24 94 58 68 58" fill="none" stroke="${lt}" stroke-width="3" stroke-linecap="round"/>
    <path d="M18 12 H82 V36 C82 60 67 74 50 74 C33 74 18 60 18 36 Z" fill="url(#${id})" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M18 12 H82" stroke="${INK}" stroke-width="3"/><ellipse cx="50" cy="12" rx="32" ry="4" fill="${lt}" stroke="${INK}" stroke-width="2.4"/>
    <path d="M27 20 V36 C27 47 31 55 37 60" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"/>
    <path d="M44 74 H56 L58 88 H42 Z" fill="url(#${id})" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <rect x="28" y="88" width="44" height="10" rx="3" fill="${lt}" stroke="${INK}" stroke-width="3"/>
    <rect x="20" y="98" width="60" height="16" rx="4" fill="${got ? "#8A5A3C" : "#B8AFA3"}" stroke="${INK}" stroke-width="3"/>
    <rect x="34" y="102" width="32" height="8" rx="2" fill="${got ? "#F5C542" : "#D8D0C4"}" stroke="${INK}" stroke-width="1.6"/>
    ${got ? `<svg x="27" y="18" width="46" height="42" viewBox="${AV_VB}">${charSvg(t.who, "happy", {}, false)}</svg>`
          : `<text x="50" y="50" text-anchor="middle" font-size="26" font-weight="800" fill="#8C8478">?</text>`}
    ${got && t.rar !== "bronze" ? spark(12, 14, 7) + spark(90, 20, 5) + (t.rar !== "silver" ? spark(88, 66, 6) + spark(10, 70, 4) : "") : ""}
    ${got ? "" : `<g transform="translate(78 92)"><rect x="-9" y="-3" width="18" height="14" rx="3" fill="#fff" stroke="${INK}" stroke-width="2.4"/><path d="M-5 -3 v-4 a5 5 0 0 1 10 0 v4" fill="none" stroke="${INK}" stroke-width="2.4"/></g>`}
  </svg>`;
}
// Trading-card trophies: title bar + rarity symbol, a lab-scene art window, description, then a date stamp or progress + reward.
// Locked cards reveal step by step: under 25% a dark silhouette behind frosted glass, 25–60% colours bleed through,
// 60–90% the art shows under thin glass, 90%+ fully visible with an "Almost there!" banner.
const RAR_SYM = { bronze: "●", silver: "◆", gold: "★", legend: "✦" };
const CARD_BG = { habit: ["#FFE9C7", "#FFD6A5"], adventure: ["#D9F2E3", "#AEE3C4"], brain: ["#DDE8FF", "#B7CCF7"], fun: ["#FFE0EC", "#F9BFD3"] };
function trophyCard(t) {
  const got = !!S.trophies[t.id];
  const [cur, goal] = t.prog(), v = Math.min(cur, goal), pc = goal ? v / goal : 0;
  const stage = got ? "" : pc >= .9 ? "rv3" : pc >= .6 ? "rv2" : pc >= .25 ? "rv1" : "rv0";
  const [b1, b2] = CARD_BG[t.cat] || CARD_BG.fun;
  return `<div class="trophy tcard2 ${got ? `got ${t.rar}` : `locked ${stage}`}" aria-label="${esc(t.name)}: ${got ? "unlocked" : `${v} / ${goal}`}">
    <div class="tbar ${t.rar}"><span class="tn">${esc(t.name)}</span><span class="rsym" title="${RAR[t.rar][2]}">${RAR_SYM[t.rar]}</span></div>
    <div class="tart" style="background:radial-gradient(circle at 50% 35%, #fff 0, ${b1} 45%, ${b2} 100%)">
      <svg class="labbg" viewBox="0 0 100 70" aria-hidden="true"><path d="M0 52 H100" stroke="rgba(91,75,73,.25)" stroke-width="2"/><rect x="6" y="30" width="7" height="22" rx="2" fill="rgba(255,255,255,.7)" stroke="rgba(91,75,73,.3)"/><path d="M84 52 l4 -16 h6 l4 16z" fill="rgba(255,255,255,.7)" stroke="rgba(91,75,73,.3)"/><circle cx="20" cy="14" r="2" fill="#fff"/><circle cx="78" cy="10" r="1.6" fill="#fff"/></svg>
      ${trophySvg(t, true)}
      ${got ? "" : `<div class="frost"></div><span class="lock" aria-hidden="true">🔒</span>${stage === "rv3" ? `<span class="almost">Almost there!</span>` : ""}`}
    </div>
    <span class="td">${esc(t.desc)}</span>
    ${got ? `<div class="tfoot"><span class="stamp">✓ ${esc(S.trophies[t.id])}</span><span class="reward">+30 🌰</span></div>`
          : `<div class="pbar"><i style="width:${Math.round(100 * pc)}%"></i></div><div class="tfoot"><span class="pnum">${v} / ${goal}</span><span class="reward dim">+30 🌰</span></div>`}
  </div>`;
}
function cabinetHtml(full = true) {
  const n = TROPHIES.filter(t => S.trophies[t.id]).length;
  const byR = r => `${TROPHIES.filter(t => t.rar === r && S.trophies[t.id]).length}/${TROPHIES.filter(t => t.rar === r).length}`;
  const head = `<div class="row" style="justify-content:space-between"><h2>🏆 Trophy Cabinet</h2><span class="pill" style="margin-right:${full ? 44 : 0}px">${n} / ${TROPHIES.length} unlocked</span></div>
    <div class="tprog"><i style="width:${Math.round(100 * n / TROPHIES.length)}%"></i></div>
    <div class="row small"><span class="ribbon bronze">Bronze ${byR("bronze")}</span><span class="ribbon silver">Silver ${byR("silver")}</span><span class="ribbon gold">Gold ${byR("gold")}</span><span class="ribbon legend">Legendary ${byR("legend")}</span></div>`;
  if (!full) {
    const near = TROPHIES.filter(t => !S.trophies[t.id]).map(t => { const [c, g] = t.prog(); return [t, Math.min(1, c / g)]; }).sort((a, b) => b[1] - a[1]).slice(0, 4).map(x => x[0]);
    return `${head}<p class="small muted">Closest to unlocking next:</p><div class="shelf">${near.map(trophyCard).join("")}</div>
      <div class="row"><button class="btn yellow" id="openCab">🏆 Open the full cabinet</button></div>`;
  }
  return `${head}<p class="small muted">Some are quick wins, some take weeks. Every one rewards curiosity and coming back, not rushing. Each trophy also gives 🌰 30 and a 🎁 capsule!</p>
    ${TROPHY_CATS.map(([c, label]) => `<h3 class="shelf-title">${label}</h3><div class="shelf wood">${TROPHIES.filter(t => t.cat === c).map(trophyCard).join("")}</div>`).join("")}`;
}
function openCabinet() { openModal(cabinetHtml(true), { wide: true }); }

let trophyQueue = [];
function checkTrophies() {
  if (!S) return;
  TROPHIES.forEach(t => {
    if (S.trophies[t.id]) return;
    const [cur, goal] = t.prog();
    if (cur >= goal) { S.trophies[t.id] = today(); setTimeout(() => gainCoins(30), 600); S.coll.pending += 1; trophyQueue.push(t); }
  });
  if (trophyQueue.length) { save(); renderTools(); showTrophyBanner(); }
  checkPets(); checkPals();
}
function showTrophyBanner() {
  if (document.querySelector(".tbanner") || !trophyQueue.length) return;
  const t = trophyQueue.shift();
  const d = document.createElement("button"); d.className = "tbanner"; d.setAttribute("aria-live", "polite");
  d.innerHTML = `${trophySvg(t, true)}<span style="text-align:left"><span class="kicker" style="padding:0">${"Trophy unlocked!"}</span><br><b>${esc(t.name)}</b><br><span class="small">${esc(t.desc)} · +30 🌰 · +1 🎁</span></span>`;
  const done = () => { d.remove(); setTimeout(showTrophyBanner, 300); };
  d.onclick = () => { SFX.tap(); done(); };
  document.body.appendChild(d);
  setTimeout(() => { SFX.fanfare(); confetti(120); }, 200);
  setTimeout(() => d.isConnected && done(), 5000);
}

/* ============================================================
   6c. Wardrobe (cosmetics) and power-ups, bought with 🌰 chestnuts from Cell Rush
   ============================================================ */
const O2 = `stroke="${CO}" stroke-width="3" stroke-linejoin="round"`;
/* Wardrobe: items are drawn on the 200 × 200 Mochi-style body (see charSvg in chars.js).
   Only append new items so saved outfits stay valid. tag: "trend" = Gen Z / meme, "hk" = Hong Kong */
const txt = (x, y, t, sz, c, w = 900) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${sz}" font-weight="${w}" fill="${c}" font-family="system-ui, sans-serif">${t}</text>`;
const WARDROBE = [
  { id: "hat_party", slot: "hat", name: "Party hat", price: 40, svg: `<path d="M76 72 L100 12 L124 72Z" fill="#FFB7C5" ${O2}/><path d="M86 52 H114 M92 34 H108" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="11" r="8" fill="#FDFFB6" ${O2}/>` },
  { id: "hat_beret", slot: "hat", name: "Pink beret", price: 60, svg: `<ellipse cx="94" cy="66" rx="46" ry="15" fill="#FF8FA3" ${O2}/><path d="M94 51 v-10" stroke="${CO}" stroke-width="5" stroke-linecap="round"/><path d="M62 62 Q80 56 98 58" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>` },
  { id: "hat_ears", slot: "hat", name: "Bunny-ear band", price: 80, svg: `<ellipse cx="80" cy="30" rx="11" ry="26" fill="#fff" ${O2}/><ellipse cx="120" cy="30" rx="11" ry="26" fill="#fff" ${O2}/><ellipse cx="80" cy="32" rx="4.5" ry="17" fill="#FFB7C5"/><ellipse cx="120" cy="32" rx="4.5" ry="17" fill="#FFB7C5"/><path d="M56 80 Q100 46 144 80" fill="none" stroke="#FF8FA3" stroke-width="8" stroke-linecap="round"/>` },
  { id: "hat_grad", slot: "hat", name: "Graduation cap", price: 120, svg: `<rect x="74" y="50" width="52" height="18" rx="4" fill="${CO}"/><path d="M50 50 L100 32 L150 50 L100 66Z" fill="${CO}" ${O2}/><path d="M100 49 L140 56 V78" stroke="#FDD66B" stroke-width="3.5" fill="none"/><circle cx="140" cy="80" r="5" fill="#FDD66B"/>` },
  { id: "hat_crown", slot: "hat", name: "Little crown", price: 160, svg: `<path d="M72 72 L76 36 L89 54 L100 30 L111 54 L124 36 L128 72Z" fill="#FFE27A" ${O2}/><circle cx="100" cy="62" r="5.5" fill="#FFB7C5" ${O2}/><circle cx="84" cy="64" r="3.5" fill="#A0C4FF"/><circle cx="116" cy="64" r="3.5" fill="#A0C4FF"/>` },
  { id: "face_round", slot: "face", name: "Round glasses", price: 50, svg: `<g fill="rgba(255,255,255,.3)" stroke="${CO}" stroke-width="3.5"><circle cx="80" cy="116" r="15"/><circle cx="120" cy="116" r="15"/></g><path d="M95 116 h10 M65 113 l-20 -6 M135 113 l20 -6" stroke="${CO}" stroke-width="3.5" stroke-linecap="round"/>` },
  { id: "face_sun", slot: "face", name: "Cool sunglasses", price: 90, svg: `<path d="M58 106 h38 v8 q-19 22 -38 0Z M104 106 h38 v8 q-19 22 -38 0Z" fill="#2B2433" ${O2}/><path d="M96 109 h8" stroke="${CO}" stroke-width="3.5"/><path d="M66 111 h10 M112 111 h10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>` },
  { id: "face_prism", slot: "face", name: "Lab goggles", price: 130, svg: `<path d="M32 114 h136" stroke="#5B8FE0" stroke-width="6"/><rect x="60" y="102" width="38" height="28" rx="12" fill="rgba(211,228,255,.75)" ${O2}/><rect x="102" y="102" width="38" height="28" rx="12" fill="rgba(211,228,255,.75)" ${O2}/><path d="M68 110 l10 -2 M110 110 l10 -2" stroke="#fff" stroke-width="3" stroke-linecap="round"/>` },
  { id: "rib_bow", slot: "ribbon", name: "Red bow", price: 30, svg: `<path d="M142 70 L124 58 L126 84Z M142 70 L160 58 L158 84Z" fill="#FF6B6B" ${O2}/><circle cx="142" cy="71" r="6" fill="#FF6B6B" ${O2}/>` },
  { id: "rib_flower", slot: "ribbon", name: "Sakura flower", price: 45, svg: `${[0, 72, 144, 216, 288].map(a => `<circle cx="${(142 + 9 * Math.sin(a * Math.PI / 180)).toFixed(1)}" cy="${(70 - 9 * Math.cos(a * Math.PI / 180)).toFixed(1)}" r="7.5" fill="#FFB7C5" stroke="${CO}" stroke-width="2.5"/>`).join("")}<circle cx="142" cy="70" r="5" fill="#FDFFB6"/>` },
  { id: "rib_star", slot: "ribbon", name: "Star clip", price: 70, svg: `<path d="M142 50 l5.8 12 13 1.8 -9.5 9 2.3 13 -11.6 -6.2 -11.6 6.2 2.3 -13 -9.5 -9 13 -1.8z" fill="#FDFFB6" ${O2}/>` },
  { id: "fr_sakura", slot: "frame", name: "Sakura frame", price: 60, cls: "fr-sakura" },
  { id: "fr_laser", slot: "frame", name: "Laser frame", price: 90, cls: "fr-laser" },
  { id: "fr_rainbow", slot: "frame", name: "Rainbow frame", price: 140, cls: "fr-rainbow" },
  // --- Wigs ---
  { id: "hair_bob", slot: "hair", name: "Bob-cut wig", price: 70,
    back: `<path d="M34 92 C24 124 28 156 46 164 L64 156 L58 98Z M166 92 C176 124 172 156 154 164 L136 156 L142 98Z" fill="#2F2A30" ${O2}/>`,
    svg: `<path d="M38 108 C32 62 66 44 100 44 C134 44 168 62 162 108 L152 108 L150 96 H50 L48 108Z" fill="#2F2A30" ${O2}/><path d="M70 58 Q88 50 104 52" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".35"/>` },
  { id: "hair_swoop", slot: "hair", tag: "trend", name: "Pop-Star Swoop wig", desc: "The famous 2010 side-swept fringe. Baby, baby, baby, oh~", price: 150,
    svg: `<path d="M38 104 C30 60 66 38 104 40 C142 42 170 62 164 102 C156 88 144 82 132 82 C112 80 90 86 70 98 C60 104 50 108 38 104Z" fill="#8B5A3C" ${O2}/><path d="M160 90 C126 70 84 78 50 112 C58 96 66 90 74 88 C64 100 60 108 58 116 C86 92 122 84 160 90Z" fill="#A36B45" ${O2}/><path d="M84 56 Q110 48 132 58 M70 74 Q96 62 124 66" stroke="#D29A6E" stroke-width="4" fill="none" stroke-linecap="round"/>` },
  { id: "hair_wolf", slot: "hair", tag: "trend", name: "Wolf-cut wig", desc: "Shaggy layers, very K-pop, very Gen Z.", price: 130,
    back: `<path d="M36 96 C24 120 26 148 36 160 L44 150 L40 170 L56 150 L54 104Z M164 96 C176 120 174 148 164 160 L156 150 L160 170 L144 150 L146 104Z" fill="#3B3033" ${O2}/>`,
    svg: `<path d="M38 108 C30 58 66 40 100 40 C134 40 170 58 162 108 L154 94 L148 110 L138 92 L128 108 L118 90 L108 106 L100 88 L92 106 L82 90 L72 108 L62 92 L52 110 L46 94Z" fill="#3B3033" ${O2}/><path d="M70 56 Q92 46 114 50" stroke="#8A7F86" stroke-width="4" fill="none" stroke-linecap="round"/>` },
  { id: "hair_twin", slot: "hair", tag: "trend", name: "Idol twin-tails wig", desc: "Pink K-pop idol twin-tails. Fan-meeting ready!", price: 140,
    back: `<ellipse cx="22" cy="124" rx="17" ry="40" fill="#FF9EC4" ${O2} transform="rotate(18 22 124)"/><ellipse cx="178" cy="124" rx="17" ry="40" fill="#FF9EC4" ${O2} transform="rotate(-18 178 124)"/>`,
    svg: `<path d="M42 104 C38 62 70 46 100 46 C130 46 162 62 158 104 Q148 88 134 92 Q120 80 100 90 Q80 80 66 92 Q52 88 42 104Z" fill="#FF9EC4" ${O2}/><circle cx="40" cy="88" r="8" fill="#FDFFB6" ${O2}/><circle cx="160" cy="88" r="8" fill="#FDFFB6" ${O2}/><path d="M76 58 Q94 50 112 54" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>` },
  // --- Outfits (drawn on the lower body; arm = sleeve colour) ---
  { id: "out_labcoat", slot: "outfit", name: "Lab coat", price: 90, arm: "#fff",
    svg: `<path d="M20 146 Q100 132 180 146 V190 H20Z" fill="#fff" stroke="${CO}" stroke-width="3"/><path d="M100 140 L86 186 M100 140 L114 186" stroke="${CO}" stroke-width="3"/><path d="M84 142 L100 156 L116 142" fill="#D3E4FF" ${O2}/><rect x="124" y="158" width="20" height="14" rx="3" fill="none" stroke="${CO}" stroke-width="2.5"/><path d="M130 158 v-8 M137 158 v-6" stroke="#5B8FE0" stroke-width="3" stroke-linecap="round"/>` },
  { id: "out_hoodie", slot: "outfit", name: "Matcha hoodie", price: 80, arm: "#B8DDB0",
    svg: `<path d="M20 144 Q100 132 180 144 V190 H20Z" fill="#B8DDB0" stroke="${CO}" stroke-width="3"/><rect x="76" y="160" width="48" height="18" rx="8" fill="#A3CF9A" stroke="${CO}" stroke-width="2.5"/><path d="M90 142 v14 M110 142 v14" stroke="#fff" stroke-width="3" stroke-linecap="round"/>` },
  { id: "out_moonwalk", slot: "outfit", tag: "trend", name: "Moonwalk jacket", desc: "Red zip-up jacket from the King of Pop's legendary music video era. Hee-hee!", price: 200, arm: "#D7263D",
    svg: `<path d="M20 142 Q100 130 180 142 V190 H20Z" fill="#D7263D" stroke="${CO}" stroke-width="3"/><path d="M62 144 L80 190 M138 144 L120 190 M40 156 L66 166 M160 156 L134 166" stroke="#2B2433" stroke-width="4.5"/><path d="M100 138 V190" stroke="#E8E8E8" stroke-width="3" stroke-dasharray="3 3"/>` },
  { id: "out_tram", slot: "outfit", tag: "hk", name: "Ding-ding tram tee", desc: "Hong Kong's famous double-decker tram, on a comfy tee.", price: 110, arm: "#3FA06B",
    svg: `<path d="M20 144 Q100 132 180 144 V190 H20Z" fill="#3FA06B" stroke="${CO}" stroke-width="3"/><rect x="78" y="150" width="44" height="26" rx="5" fill="#2E7D52" stroke="#fff" stroke-width="2.5"/><path d="M78 163 H122" stroke="#fff" stroke-width="2"/><rect x="83" y="154" width="8" height="6" fill="#FFF1C5"/><rect x="96" y="154" width="8" height="6" fill="#FFF1C5"/><rect x="109" y="154" width="8" height="6" fill="#FFF1C5"/><rect x="83" y="167" width="8" height="6" fill="#FFF1C5"/><rect x="109" y="167" width="8" height="6" fill="#FFF1C5"/><path d="M100 150 V144" stroke="#fff" stroke-width="2"/>` },
  { id: "out_tutu", slot: "outfit", tag: "trend", name: "Ballerina cappuccino tutu", desc: "Twirl like the internet's favourite brainrot ballerina. ☕🩰", price: 150, arm: "#fff",
    svg: `<path d="M24 148 Q100 136 176 148 V164 H24Z" fill="#FFC2D6" stroke="${CO}" stroke-width="3"/><path d="M16 164 ${Array.from({ length: 12 }, (_, i) => `q7 16 14 0`).join(" ")} V190 H16Z" fill="#FFE0EC" stroke="${CO}" stroke-width="2.5"/><circle cx="100" cy="156" r="5" fill="#FDFFB6" ${O2}/>` },
  { id: "out_puffer", slot: "outfit", tag: "trend", name: "Puffer jacket", desc: "Big, puffy and cosy: the winter Gen Z uniform.", price: 120, arm: "#F4A259",
    svg: `<path d="M18 140 Q100 128 182 140 V190 H18Z" fill="#F4A259" stroke="${CO}" stroke-width="3"/><path d="M22 156 Q100 146 178 156 M22 172 Q100 162 178 172" stroke="#D9803A" stroke-width="3" fill="none"/><path d="M100 136 V190" stroke="${CO}" stroke-width="3"/><path d="M84 138 Q100 150 116 138" stroke="${CO}" stroke-width="3" fill="#FFD9B0"/>` },
  // --- Trend / meme items ---
  { id: "hat_fedora", slot: "hat", tag: "trend", name: "Moonwalk fedora", desc: "Tilt it, lean forward, moonwalk. Shamone!", price: 130,
    svg: `<g transform="rotate(-8 100 60)"><ellipse cx="100" cy="66" rx="54" ry="11" fill="#2B2433" ${O2}/><path d="M70 64 Q68 30 100 30 Q132 30 130 64Z" fill="#2B2433" ${O2}/><path d="M84 36 Q100 46 116 36" stroke="#4A4050" stroke-width="3" fill="none"/><path d="M71 56 H129 V63 H71Z" fill="#fff"/></g>` },
  { id: "hat_monster", slot: "hat", tag: "trend", name: "Blind-box monster hood", desc: "Pointy ears and a cheeky toothy grin: the blind-box monster craze.", price: 160,
    svg: `<path d="M72 64 L60 8 L92 50Z M128 64 L140 8 L108 50Z" fill="#C9A27A" ${O2}/><path d="M72 58 L66 26 L84 50Z M128 58 L134 26 L116 50Z" fill="#FFD1DA"/><path d="M42 96 C42 54 70 40 100 40 C130 40 158 54 158 96 Q100 70 42 96Z" fill="#C9A27A" ${O2}/><path d="M60 88 l5 9 5 -9 5 9 5 -9 5 9 5 -9 5 9 5 -9 5 9 5 -9 5 9 5 -9 5 9 5 -9 5 9 5 -9" fill="#fff" stroke="${CO}" stroke-width="1.8" stroke-linejoin="round"/>` },
  { id: "hat_pineapple", slot: "hat", tag: "hk", name: "Pineapple-bun hat", desc: "A warm bo lo bao from the cha chaan teng, now a hat.", price: 90,
    svg: `<path d="M56 72 C56 30 144 30 144 72Z" fill="#F5C04A" ${O2}/><path d="M70 50 L90 70 M86 40 L114 70 M106 38 L130 64 M130 50 L112 70 M110 38 L82 68 M90 40 L68 62" stroke="#D9932E" stroke-width="3" stroke-linecap="round"/><path d="M72 46 Q84 38 96 38" stroke="#FFF1C5" stroke-width="4" fill="none" stroke-linecap="round"/>` },
  { id: "face_pixel", slot: "face", tag: "trend", name: "Deal-with-it shades", desc: "The classic pixel sunglasses meme. 😎", price: 110,
    svg: `<g fill="#111"><rect x="54" y="104" width="92" height="8"/><rect x="60" y="112" width="34" height="9"/><rect x="66" y="121" width="22" height="7"/><rect x="106" y="112" width="34" height="9"/><rect x="112" y="121" width="22" height="7"/></g><g fill="#fff"><rect x="66" y="114" width="7" height="5"/><rect x="112" y="114" width="7" height="5"/></g>` },
  { id: "face_heart", slot: "face", tag: "trend", name: "Y2K heart shades", desc: "Pink heart glasses. Very Y2K, very cute.", price: 90,
    svg: `<path d="M80 130 C60 116 62 100 80 108 C98 100 100 116 80 130Z M120 130 C100 116 102 100 120 108 C138 100 140 116 120 130Z" fill="rgba(255,95,162,.8)" ${O2}/><path d="M97 110 h6" stroke="${CO}" stroke-width="3.5"/><path d="M72 108 l4 -2 M112 108 l4 -2" stroke="#fff" stroke-width="3" stroke-linecap="round"/>` },
  { id: "acc_phones", slot: "ribbon", tag: "trend", name: "Cat-ear headphones", desc: "Glowing cat-ear headphones for lo-fi study beats.", price: 120,
    svg: `<path d="M38 112 C36 50 164 50 162 112" fill="none" stroke="#F2A7C8" stroke-width="10" stroke-linecap="round"/><path d="M38 112 C36 50 164 50 162 112" fill="none" stroke="${CO}" stroke-width="2" stroke-linecap="round" opacity=".5"/><path d="M62 62 L60 38 L80 54Z M138 62 L140 38 L120 54Z" fill="#F2A7C8" ${O2}/><rect x="24" y="98" width="22" height="34" rx="10" fill="#F2A7C8" ${O2}/><rect x="154" y="98" width="22" height="34" rx="10" fill="#F2A7C8" ${O2}/>` },
  { id: "acc_aura", slot: "ribbon", tag: "trend", name: "Aura +1000 chain", desc: "Instant main-character energy. +1000 aura.", price: 100, low: true,
    svg: `<path d="M64 146 Q100 170 136 146" fill="none" stroke="#E0B44A" stroke-width="4" stroke-dasharray="5 3"/><rect x="80" y="156" width="40" height="18" rx="9" fill="#FFE27A" ${O2}/>${txt(100, 169.5, "+1000", 11, CO)}` },
  { id: "hand_67", slot: "hand", tag: "trend", name: "Six-seven signs", desc: "Six... SEVEN! 🤷 The meme everyone keeps shouting.", price: 120,
    svg: `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -10;0 0" dur=".9s" repeatCount="indefinite"/><rect x="2" y="120" width="32" height="30" rx="8" fill="#FFE27A" ${O2}/>${txt(18, 144, "6", 24, CO)}</g><g><animateTransform attributeName="transform" type="translate" values="0 -10;0 0;0 -10" dur=".9s" repeatCount="indefinite"/><rect x="166" y="120" width="32" height="30" rx="8" fill="#A0E7E5" ${O2}/>${txt(182, 144, "7", 24, CO)}</g>` },
  { id: "hand_glove", slot: "hand", tag: "trend", name: "Sparkly glove", desc: "One glittering white glove. Hee-hee! ✨", price: 90,
    svg: `<path d="M152 128 C150 112 160 104 170 108 L178 100 C182 98 186 102 184 106 L180 114 C186 118 186 130 180 140 C172 150 156 148 152 128Z" fill="#fff" ${O2}/>${[[162, 122], [170, 130], [160, 136], [174, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#A9D4EE"/>`).join("")}${spark4(188, 92, 7, "#FDD66B")}` },
  { id: "hand_dubai", slot: "hand", tag: "trend", name: "Dubai chocolate bar", desc: "Crunchy pistachio kunafa inside. The viral snack!", price: 100,
    svg: `<g transform="rotate(14 170 140)"><path d="M156 116 L162 110 L168 116 L174 110 L180 116 L184 112 V164 H156Z" fill="#9BC53D" ${O2}/><rect x="156" y="124" width="28" height="40" rx="3" fill="#5A3825" ${O2}/><path d="M160 134 H180 M160 146 H180 M170 124 V164" stroke="#7A4E33" stroke-width="2"/><path d="M160 118 l4 4 M168 116 l2 5 M176 118 l-2 4" stroke="#6E9E22" stroke-width="2"/></g>` },
  { id: "hand_milktea", slot: "hand", tag: "hk", name: "HK milk tea", desc: "Silky 'silk-stocking' milk tea, iced, from the cha chaan teng.", price: 70,
    svg: `<path d="M154 108 H186 L182 162 H158Z" fill="rgba(255,255,255,.85)" ${O2}/><path d="M156 124 H184 L181 160 H159Z" fill="#C58B5C"/><rect x="160" y="128" width="8" height="8" rx="2" fill="rgba(255,255,255,.7)"/><rect x="171" y="138" width="8" height="8" rx="2" fill="rgba(255,255,255,.7)"/><path d="M176 108 L184 88" stroke="#FF6B6B" stroke-width="4" stroke-linecap="round"/>` },
  { id: "hand_tumbler", slot: "hand", tag: "trend", name: "Giant pastel tumbler", desc: "The huge 40 oz cup everyone carries. Hydrate!", price: 90,
    svg: `<path d="M184 116 C198 116 198 144 184 144" fill="none" stroke="${CO}" stroke-width="4"/><path d="M156 106 H186 L182 170 H160Z" fill="#B8D8F2" ${O2}/><rect x="152" y="98" width="38" height="10" rx="4" fill="#E6F0FA" ${O2}/><path d="M176 98 L182 76" stroke="${CO}" stroke-width="5" stroke-linecap="round"/><path d="M176 98 L182 76" stroke="#FFB7C5" stroke-width="2.5" stroke-linecap="round"/>` },
  { id: "hand_mahjong", slot: "hand", tag: "hk", name: "Lucky mahjong tile", desc: "The 'fa' tile (發) for good fortune in exams!", price: 80,
    svg: `<g transform="rotate(10 170 136)"><rect x="152" y="112" width="34" height="46" rx="6" fill="#FFFDF0" ${O2}/><rect x="152" y="148" width="34" height="10" rx="4" fill="#3FA06B"/>${txt(169, 142, "發", 24, "#2E8B57", 700)}</g>` }
];
const SLOT_NAMES = { hat: "Hats", hair: "Wigs", face: "Glasses", outfit: "Outfits", ribbon: "Accessories", hand: "Hand items", frame: "Frames" };
const SLOT_ICONS = { hat: "🎩", hair: "💇", face: "🕶️", outfit: "👕", ribbon: "🎀", hand: "🧋", frame: "🖼️" };
const EQ_KEYS = Object.keys(SLOT_NAMES);
const POWERUPS = [
  { id: "torch", icon: "🔦", name: "Torch", price: 25, desc: "Removes one wrong answer, or sets one dial correctly. (Counts as a hint.)" },
  { id: "crystal", icon: "⏳", name: "Time crystal", price: 30, desc: "Adds 60 seconds to the room timer." },
  { id: "guard", icon: "🛡️", name: "Guard charm", price: 35, desc: "Blocks all penalties for your next wrong answer." }
];
const MAX_POWER = 5;
const itemById = id => WARDROBE.find(w => w.id === id);
const frameCls = eq => { eq = eq || (S && S.equip) || {}; const f = eq.frame && itemById(eq.frame); return f ? f.cls : ""; };
const playerAv = (mood = "normal") => `<span class="${frameCls()}" style="display:inline-flex">${avatar("chiikawa", mood)}</span>`;
function addCoins(n, why) { S.coins = Math.max(0, (S.coins || 0) + n); save(); renderTools(); if (why) toast(`${n >= 0 ? "+" : ""}${n} 🌰 ${why}`); }

function refreshPlayer() {
  document.getElementById("brandav").innerHTML = playerAv("happy");
  const c = document.getElementById("chiiAv"); if (c) { c.className = "av " + frameCls(); c.innerHTML = avatar("chiikawa", R ? R.mood : "normal"); }
  renderTools();
}

/* ============================================================
   6d. Dedication points (the class leaderboard lives in auth.js)
   ============================================================ */
function dedication() {
  const t = Object.keys(S.trophies || {}).length;
  return S.stats.days * 10 + S.stats.correct + S.stats.rushRounds * 5 + S.completed_rooms.length * 10 + t * 25;
}

/* ============================================================
   6e. ⚡ Cell Rush: 60-second mixed question rush (no calculations)
   ============================================================ */
const RUSH_SECONDS = 60;
// Rush banks live in the content section (TF_BANK, PAIR_BANK, ODD_BANK, CLOZE_BANK, ORDER_BANK, TEST_BANK)
function subseq(arr, n) { const idx = shuffle(arr.map((_, i) => i)).slice(0, n).sort((a, b) => a - b); return idx.map(i => arr[i]); }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const MC_POOL = () => ROOMS.flatMap(r => r.pool.filter(p => p.type === "mc" && !p.svg && !p.gen));

const RUSH_MAKERS = [
  { w: 2, label: "Multiple choice", make() { const p = pick(MC_POOL()); const order = shuffle(p.choices.map((_, i) => i));
      return { prompt: p.q, render: (el, done) => { el.innerHTML = `<div class="rgrid two">${order.map(i => `<button class="rbtn" data-i="${i}">${esc(p.choices[i])}</button>`).join("")}</div>`;
        el.querySelectorAll(".rbtn").forEach(b => b.onclick = () => { const ok = Number(b.dataset.i) === p.answer; b.classList.add(ok ? "ok" : "no"); if (!ok) { el.querySelector(`[data-i="${p.answer}"]`).classList.add("ok"); noteMistake(p.rid, p.id); } el.querySelectorAll(".rbtn").forEach(x => x.disabled = true); done(ok, p.choices[p.answer]); }); } }; } },
  { w: 3, label: "True or false", make() { const [t, v, why] = pick(TF_BANK);
      return { prompt: t, render: (el, done) => { el.innerHTML = `<div class="tf"><button class="rbtn" data-v="1">✅ ${"True"}</button><button class="rbtn" data-v="0">❌ ${"False"}</button></div>`;
        el.querySelectorAll(".rbtn").forEach(b => b.onclick = () => { const ok = (b.dataset.v === "1") === v; b.classList.add(ok ? "ok" : "no"); el.querySelectorAll(".rbtn").forEach(x => x.disabled = true); done(ok, `${v ? "True" : "False"}. ${why}`); }); } }; } },
  { w: 1, label: "Matching", make() { const pairs = shuffle(PAIR_BANK).slice(0, 3); const right = shuffle(pairs.map((_, i) => i));
      return { prompt: "Match each term to its meaning. Tap a term, then its meaning.", render: (el, done) => {
        el.innerHTML = `<div class="match"><div class="col">${pairs.map((pr, i) => `<button class="rbtn" data-l="${i}">${esc(pr[0])}</button>`).join("")}</div><div class="col">${right.map(i => `<button class="rbtn" data-r="${i}">${esc(pairs[i][1])}</button>`).join("")}</div></div>`;
        let sel = null, got = 0, over = false;
        el.querySelectorAll("[data-l]").forEach(b => b.onclick = () => { if (over) return; el.querySelectorAll("[data-l]").forEach(x => x.classList.remove("sel")); sel = Number(b.dataset.l); b.classList.add("sel"); SFX.tap(); });
        el.querySelectorAll("[data-r]").forEach(b => b.onclick = () => {
          if (over) return; if (sel === null) { toast("Tap a term on the left first"); return; }
          const L = el.querySelector(`[data-l="${sel}"]`);
          if (Number(b.dataset.r) === sel) { L.classList.remove("sel"); L.classList.add("ok"); b.classList.add("ok"); L.disabled = b.disabled = true; sel = null; got++; SFX.click(); if (got === 3) { over = true; done(true); } }
          else { over = true; b.classList.add("no"); L.classList.add("no"); done(false, pairs.map(pr => `${pr[0]} → ${pr[1]}`).join(" · ")); }
        }); } }; } },
  { w: 1, label: "Put in order", make() { const [prompt, items] = pick(ORDER_BANK)(); const shown = shuffle(items);
      return { prompt, render: (el, done) => { el.innerHTML = `<div class="ordered" id="ordAns"></div><div class="rgrid two">${shown.map(t => `<button class="rbtn" data-t="${esc(t)}">${esc(t)}</button>`).join("")}</div>`;
        let k = 0, over = false; const ans = el.querySelector("#ordAns");
        el.querySelectorAll(".rbtn").forEach(b => b.onclick = () => { if (over) return;
          if (b.dataset.t === items[k]) { b.disabled = true; b.classList.add("ok"); ans.insertAdjacentHTML("beforeend", `<span class="tag">${k + 1}. ${esc(items[k])}</span>`); k++; SFX.click(); if (k === items.length) { over = true; done(true); } }
          else { over = true; b.classList.add("no"); done(false, items.join(" → ")); } }); } }; } },
  { w: 2, label: "Odd one out", make() { const [q, items, odd, why] = pick(ODD_BANK); const order = shuffle(items.map((_, i) => i));
      return { prompt: q, render: (el, done) => { el.innerHTML = `<div class="rgrid two">${order.map(i => `<button class="rbtn" data-i="${i}">${esc(items[i])}</button>`).join("")}</div>`;
        el.querySelectorAll(".rbtn").forEach(b => b.onclick = () => { const ok = Number(b.dataset.i) === odd; b.classList.add(ok ? "ok" : "no"); if (!ok) el.querySelector(`[data-i="${odd}"]`).classList.add("ok"); el.querySelectorAll(".rbtn").forEach(x => x.disabled = true); done(ok, why); }); } }; } },
  { w: 2, label: "Fill the gap", make() { const [t, opts, a] = pick(CLOZE_BANK); const order = shuffle(opts.map((_, i) => i));
      return { prompt: t.replace("___", "______"), render: (el, done) => { el.innerHTML = `<div class="rgrid two">${order.map(i => `<button class="rbtn" data-i="${i}">${esc(opts[i])}</button>`).join("")}</div>`;
        el.querySelectorAll(".rbtn").forEach(b => b.onclick = () => { const ok = Number(b.dataset.i) === a; b.classList.add(ok ? "ok" : "no"); el.querySelectorAll(".rbtn").forEach(x => x.disabled = true); done(ok, t.replace("___", opts[a])); }); } }; } },
  { w: 2, label: "Spelling bee", make() { const p = pick(ROOMS.flatMap(r => r.pool.filter(x => x.gen === "spellmc"))); const order = shuffle(p.choices.map((_, i) => i));
      return { prompt: p.q, render: (el, done) => { el.innerHTML = `<div class="rgrid two">${order.map(i => `<button class="rbtn" data-i="${i}">${esc(p.choices[i])}</button>`).join("")}</div>`;
        el.querySelectorAll(".rbtn").forEach(b => b.onclick = () => { const ok = Number(b.dataset.i) === 0; b.classList.add(ok ? "ok" : "no"); if (!ok) { el.querySelector('[data-i="0"]').classList.add("ok"); noteMistake(p.rid, p.id); } el.querySelectorAll(".rbtn").forEach(x => x.disabled = true); done(ok, p.choices[0]); }); } }; } },
  { w: 1, label: "Test-tube colours", make() { const [q, a] = pick(TEST_BANK); const opts = shuffle([a, ...shuffle(Object.keys(TEST_COLOURS).filter(c => c !== a)).slice(0, 3)]);
      return { prompt: q, render: (el, done) => { el.innerHTML = `<div class="swatches">${opts.map(c => `<button class="rbtn sw" data-c="${c}"><i style="background:${TEST_COLOURS[c]}"></i>${c}</button>`).join("")}</div>`;
        el.querySelectorAll(".rbtn").forEach(b => b.onclick = () => { const ok = b.dataset.c === a; b.classList.add(ok ? "ok" : "no"); el.querySelectorAll(".rbtn").forEach(x => x.disabled = true); done(ok, `Answer: ${a}`); }); } }; } },
  { w: 1, label: "Organelle spotter", make() { const keys = Object.keys(SPOT_PARTS), k = pick(keys); const opts = shuffle([k, ...shuffle(keys.filter(x => x !== k)).slice(0, 3)]);
      return { prompt: "Which part of the plant cell is glowing pink?", render: (el, done) => { el.innerHTML = `<div class="diagram-box">${plantCellSvg({ hl: k })}</div><div class="rgrid two">${opts.map(x => `<button class="rbtn" data-k="${x}">${SPOT_PARTS[x]}</button>`).join("")}</div>`;
        el.querySelectorAll(".rbtn").forEach(b => b.onclick = () => { const ok = b.dataset.k === k; b.classList.add(ok ? "ok" : "no"); if (!ok) el.querySelector(`[data-k="${k}"]`).classList.add("ok"); el.querySelectorAll(".rbtn").forEach(x => x.disabled = true); done(ok, SPOT_PARTS[k]); }); } }; } }
];
let RU = null;
function stopRush() { if (RU) { clearInterval(RU.tid); clearTimeout(RU.nextT); } RU = null; }
function rushIntro() {
  const bonus = S.rush.lastDay !== today();
  openModal(`<span class="kicker">⚡ ${"Cell Rush"}</span><h2>${"60-second question rush!"}</h2>
    ${say("chiikawa", "Wahoo! Answer as many as you can before time runs out!", "happy")}
    <div class="rules">${`<ul><li>Mixed questions: multiple choice, true/false, matching, ordering, odd one out, fill the gap, spelling bee, test-tube colours and organelle spotting.</li>
      <li>Correct = +10 points. 3 in a row = <b>×2 combo</b>, 6 in a row = <b>×3</b>.</li>
      <li>Wrong = <b>−3 seconds</b> and the combo resets.</li>
      <li>Every 10 points = 1 🌰 chestnut. ${bonus ? "<b>Today's first round pays double!</b>" : ""}</li></ul>`}</div>
    <p class="small muted">${"Best score"}: ${S.rush.best}</p>
    <div class="row"><button class="btn big" id="rushGo">⚡ ${"Start!"}</button><button class="btn plain" id="rushShop">👗 ${"Shop"}</button></div>`);
  document.getElementById("rushGo").onclick = () => { SFX.init(); startRush(); };
  document.getElementById("rushShop").onclick = () => { SFX.tap(); openShop(); };
}
function startRush() {
  renderNav(false);
  closeModal(); stopTimer(); if (R) clearTimeout(R.introT); R = null; stopRush();
  MUSIC.setMode("rush"); renderTools();
  RU = { score: 0, combo: 0, correct: 0, total: 0, start: new Date().toISOString(), end: Date.now() + RUSH_SECONDS * 1000, lock: false, last: -1 };
  $app.innerHTML = `
    <section class="rushhead">
      <div class="status"><div class="av ${frameCls()}" id="rushAv">${avatar("chiikawa", "normal")}</div><div><div class="rtopic" style="color:var(--yellow)">⚡ ${"Cell Rush · Biology"}</div><div class="big" id="rScore">0 ${"pts"}</div></div></div>
      <div style="display:grid;justify-items:end;gap:6px"><div class="timer" id="rTimer">01:00</div><span class="combo" id="rCombo">${"Combo"} ×1</span></div>
    </section>
    <section class="card rq"><span class="rtype" id="rType"></span><p class="q" id="rPrompt"></p><div id="rBody"></div><div id="rFb"></div></section>
    <div class="row"><button class="btn plain" id="rQuit">✕ ${"End round"}</button></div>`;
  document.getElementById("rQuit").onclick = () => { SFX.tap(); rushEnd(); };
  RU.tid = setInterval(rushTick, 200);
  rushNext();
}
function rushTick() {
  if (!RU) return;
  const left = Math.max(0, Math.ceil((RU.end - Date.now()) / 1000));
  const el = document.getElementById("rTimer"); if (el) { el.textContent = fmt(left); el.className = "timer" + (left <= 10 ? " low" : ""); }
  if (left <= 0) rushEnd();
}
function rushNext() {
  if (!RU) return;
  const bag = RUSH_MAKERS.flatMap((m, i) => Array(m.w).fill(i).filter(x => x !== RU.last || RUSH_MAKERS.length === 1));
  const mi = pick(bag); RU.last = mi; const m = RUSH_MAKERS[mi], q = m.make();
  document.getElementById("rType").textContent = m.label;
  document.getElementById("rPrompt").textContent = q.prompt;
  document.getElementById("rFb").innerHTML = ""; RU.lock = false;
  q.render(document.getElementById("rBody"), rushAnswer);
}
function rushAnswer(ok, reveal) {
  if (!RU || RU.lock) return; RU.lock = true; RU.total++;
  const av = document.getElementById("rushAv");
  if (ok) {
    RU.correct++; RU.combo++; const mult = RU.combo >= 6 ? 3 : RU.combo >= 3 ? 2 : 1; RU.score += 10 * mult;
    SFX.right(); if (mult > 1) SFX.yaha();
    const d = document.createElement("div"); d.className = "plus"; d.textContent = `+${10 * mult}`; document.body.appendChild(d); setTimeout(() => d.remove(), 900);
    if (av) av.innerHTML = avatar("chiikawa", "happy");
  } else {
    RU.combo = 0; RU.end -= 3000; SFX.wrong(); penaltyFlash("−3s ⏱️");
    if (av) av.innerHTML = avatar("chiikawa", "cry");
    document.getElementById("rFb").innerHTML = `<div class="fb no small"><b>${"Answer"}:</b> ${esc(reveal || "")}</div>`;
  }
  const mult = RU.combo >= 6 ? 3 : RU.combo >= 3 ? 2 : 1;
  document.getElementById("rScore").textContent = `${RU.score} ${"pts"}`;
  const c = document.getElementById("rCombo"); c.textContent = `${"Combo"} ×${mult}`; c.className = "combo" + (mult > 1 ? " hot" : "");
  RU.nextT = setTimeout(() => { if (RU) { if (av) av.innerHTML = avatar("chiikawa", "normal"); rushNext(); } }, ok ? 500 : 1700);
}
function rushEnd() {
  if (!RU) return;
  const r = RU; stopRush();
  const bonus = S.rush.lastDay !== today();
  let coins = Math.round(withStreak(Math.ceil(r.score / 10)) * perk("rush")); if (bonus && r.total > 0) coins *= 2;
  if (r.total > 0) { S.rush.lastDay = today(); S.stats.rushRounds += 1; }
  const best = r.score > S.rush.best; S.rush.best = Math.max(S.rush.best, r.score);
  const rcap = r.score >= 120 ? 1 : 0; S.coll.pending += rcap;
  gainCoins(coins); checkTrophies();
  activityDone({ mode: "rush", ans: r.total, cor: r.correct, score: r.score, secs: RUSH_SECONDS, start: r.start });
  SFX.fanfare(); if (r.score > 0) confetti(120);
  openModal(`<span class="kicker">⚡ ${"Cell Rush · Round over"}</span><h2>${best ? "🎉 New best score!" : "Time's up!"}</h2>
    <div class="row" style="justify-content:center;gap:18px;font-size:1.2rem"><b>${r.score} ${"pts"}</b><span>✅ ${r.correct}/${r.total}</span><span class="pill coinpill">+${coins} 🌰${bonus && r.total > 0 ? " (×2 daily bonus)" : ""}${multTag()}</span>${rcap ? `<span class="pill rpill">🎁 +1 capsule</span>` : ""}</div>
    ${say(r.correct >= 8 ? "chiikawa" : "chiikawa", r.correct >= 8 ? "WAHOO!!! Amazing rush! 🎊" : "Nice try! Every round makes your brain faster. 🌱", "happy", r.correct >= 8 ? "" : "hint")}
    <div class="row">${rcap ? `<button class="btn pink" id="rCap">🎁 Open capsule</button>` : ""}<button class="btn big" id="rAgain">⚡ ${"Play again"}</button><button class="btn yellow" id="rShop">👗 ${"Spend chestnuts"}</button><button class="btn plain" id="rMap">🗺️ ${"Map"}</button></div>`, { onClose: renderMap });
  const rc = document.getElementById("rCap"); if (rc) rc.onclick = () => { SFX.tap(); closeModal(); renderMap(); openCapsule(); };
  document.getElementById("rAgain").onclick = () => { SFX.tap(); startRush(); };
  document.getElementById("rShop").onclick = () => { SFX.tap(); renderMap(); openShop(); };
  document.getElementById("rMap").onclick = () => { SFX.tap(); closeModal(); renderMap(); };
}

/* ============================================================
   6f. Topic helpers
   ============================================================ */
const tTopic = r => `${r.topic}: ${r.focus}`;
const topicHtml = r => `${esc(r.topic)} <span class="muted">· ${esc(r.focus)}</span>`;
const topicNo = n => `Topic ${n}`;

/* ============================================================
   7. Top bar
   ============================================================ */
document.getElementById("brandav").innerHTML = playerAv("happy");
function renderTools() {
  // Decluttered top bar: the two game currencies (streak, chestnuts) stay big; everything else lives in the ☰ menu
  const el = document.getElementById("tools"); if (!el) return;
  el.innerHTML = S ? `
    <span class="hcur streak" title="Daily streak · chestnut bonus ×${streakMult().toFixed(2)}"><span class="ci">🔥</span><b>${S.current_streak}</b>${streakMult() > 1 ? `<span class="lbl"> ×${streakMult().toFixed(2).replace(/0$/, "")}</span>` : ""}</span>
    <button class="hcur coins" id="tCoins" aria-label="Chestnuts: ${S.coins}. Open the shop"><span class="ci">🌰</span><b>${S.coins}</b></button>
    ${S.coll.pending ? `<button class="hcur cap capbtn" id="tCap" aria-label="Open ${S.coll.pending} capsule${S.coll.pending > 1 ? "s" : ""}"><span class="ci">🎁</span><b>${S.coll.pending}</b></button>` : ""}
    <button class="menubtn ${typeof AUTH !== "undefined" && AUTH.stale ? "warn" : ""}" id="tMenu" aria-label="Menu"><span></span><span></span><span></span></button>` : "";
  const g = id => document.getElementById(id);
  if (g("tCoins")) g("tCoins").onclick = () => { SFX.init(); SFX.tap(); openShop(); };
  if (g("tCap")) g("tCap").onclick = () => { SFX.init(); SFX.tap(); openCapsule(); };
  if (g("tMenu")) g("tMenu").onclick = () => { SFX.init(); SFX.tap(); openMenu(); };
}
function openMenu() {
  const acc = signedIn() ? userName().split(" ")[0] : "Guest";
  const tiles = [["mTro", "🏆", "Trophies", `${Object.keys(S.trophies).length} / ${TROPHIES.length}`], ["mAcc", signedIn() ? "🎓" : "👤", "Account", acc + (AUTH.stale ? " · sign in again" : "")],
    ["mStory", "📜", "The story", "The Codex of Life"], ["mJou", "📓", "Journal", "Textbook notes"], ["mSave", "🔑", "Save code", "Move to another device"], ["mLb", "🏆", "Leaderboard", signedIn() ? "Your class" : "Signed-in only"],
    ...(isTeacher() ? [["mStats", "📊", "Class statistics", "Teachers only"]] : []), ["mMus", "🎵", "Music", MUSIC.on ? "On" : "Off"], ["mSnd", SFX.on ? "🔊" : "🔇", "Sound effects", SFX.on ? "On" : "Off"], ["mHome", "🏠", "Home", "Back to Mochi's room"]];
  const box = openModal(`<span class="kicker">☰ Menu</span><h2>${esc(S.player_name)}'s settings</h2>
    <div class="menugrid">${tiles.map(([id, ic, t, sub]) => `<button class="mtile" id="${id}"><span class="mi">${ic}</span><b>${t}</b><span class="small muted">${esc(sub)}</span></button>`).join("")}</div>`);
  const on = (id, f) => { box.querySelector("#" + id).onclick = () => { SFX.tap(); f(); }; };
  on("mTro", () => { closeModal(); openCabinet(); }); on("mAcc", () => { closeModal(); openAccount(); }); on("mJou", () => { closeModal(); openJournal(); }); on("mStory", () => { closeModal(); openStory(); });
  on("mSave", () => { closeModal(); openSaveModal(); }); on("mLb", () => { closeModal(); openLeaderboard(); }); on("mHome", () => { closeModal(); homeTab = "home"; renderMap(); });
  if (isTeacher()) on("mStats", () => { closeModal(); goTab("stats"); });
  on("mMus", () => { MUSIC.on = !MUSIC.on; try { localStorage.setItem(MUSIC_KEY, MUSIC.on ? "on" : "off"); } catch (e) {} MUSIC.on ? MUSIC.start() : MUSIC.stop(); openMenu(); });
  on("mSnd", () => { SFX.on = !SFX.on; try { localStorage.setItem(SOUND_KEY, SFX.on ? "on" : "off"); } catch (e) {} if (SFX.on) SFX.init(); openMenu(); });
}

/* ============================================================
   8. Modals
   ============================================================ */
function openModal(html, { wide = false, closable = true, onClose = null } = {}) {
  $modal.innerHTML = `<div class="overlay" id="ov"><div class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true" id="mbox">
    ${closable ? `<button class="iconbtn x" id="mx" aria-label="${"Close"}">✕</button>` : ""}${html}</div></div>`;
  const close = () => { closeModal(); onClose && onClose(); };
  if (closable) {
    document.getElementById("mx").onclick = () => { SFX.tap(); $modal._close && $modal._close(); };
    document.getElementById("ov").onclick = e => { if (e.target.id === "ov" && $modal._close) $modal._close(); };
  }
  $modal._close = closable ? close : null;
  const f = $modal.querySelector(".modal button:not(.x), .modal input"); if (f) f.focus({ preventScroll: true });
  return document.getElementById("mbox");
}
function closeModal() { $modal.innerHTML = ""; $modal._close = null; }
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if ($journal.innerHTML) { $journal.innerHTML = ""; return; }
  if ($modal._close) $modal._close();
});

/* ----- Study Journal / Textbook Helper ----- */
// Terms from this stage that appear in a question: highlighted in the journal
const termsIn = (room, p) => { const txt = [p.q, ...(p.choices || []), ...(p.labels || [])].join(" ").toLowerCase(); return room.terms.filter(([t]) => txt.includes(t.toLowerCase())).map(t => t[0]); };
function openJournal(roomId, highlight = []) {
  let rid = roomId || (R ? R.room.id : (ROOMS[S ? Math.max(0, nextRoomIndex()) : 0]).id);
  const draw = () => {
    const r = ROOMS[roomIndex(rid)], T = TOPICS[r.t];
    $journal.innerHTML = `<div class="overlay top" id="jov"><div class="modal wide" role="dialog" aria-modal="true" aria-label="Study Journal">
      <button class="iconbtn x" id="jx" aria-label="Close journal">✕</button>
      <span class="kicker">📓 Study Journal · Part ${esc(T.part)}</span>
      <h2>${T.icon} Topic ${T.no}: ${esc(T.name)}</h2>
      <div class="tabs" role="tablist" aria-label="Topics">${TOPICS.map((x, ti) => `<button class="tab" role="tab" aria-selected="${ti === r.t}" data-t="${topicRooms(ti)[0].id}">${x.icon} T${x.no}</button>`).join("")}</div>
      <div class="tabs" role="tablist" aria-label="Stages">${topicRooms(r.t).map(x => `<button class="tab" role="tab" aria-selected="${x.id === rid}" data-t="${x.id}">${x.boss ? "⚔️ Boss" : `Stage ${x.s}`}: ${esc(x.focus)}</button>`).join("")}</div>
      <section class="jsec"><h3>📖 Summary</h3><ul>${r.notes.map(n => `<li>${n}</li>`).join("")}</ul></section>
      <section class="jsec"><h3>🧭 Key rules</h3>${r.rules.map(f => `<div class="formula">${esc(f)}</div>`).join("")}</section>
      <section class="jsec"><h3>🔤 Key terms</h3><table class="tterms"><tbody>
        ${r.terms.map(([t, m]) => `<tr class="${highlight.includes(t) ? "hl" : ""}"><td><b>${esc(t)}</b> ${sayBtns(t)}</td><td>${esc(m)}</td></tr>`).join("")}</tbody></table>
        ${highlight.length ? `<p class="small muted">Highlighted terms are used in the puzzle you're on.</p>` : ""}${TTS.ok ? `<p class="small muted">🔊 British pronunciation · 🐢 slowly</p>` : ""}</section>
      ${FACTS[T.id] ? `<section class="jsec fact"><h3>💡 Did you know?</h3><ul>${FACTS[T.id].map(f => `<li>${esc(f)}</li>`).join("")}</ul></section>` : ""}
    </div></div>`;
    document.getElementById("jx").onclick = () => { SFX.tap(); $journal.innerHTML = ""; };
    document.getElementById("jov").onclick = e => { if (e.target.id === "jov") $journal.innerHTML = ""; };
    $journal.querySelectorAll(".tab").forEach(b => b.onclick = () => { SFX.tap(); rid = b.dataset.t; highlight = []; draw(); });
    document.getElementById("jx").focus({ preventScroll: true });
  };
  draw();
}

/* ----- Save & Share Code ----- */
function codePreview(d) {
  const rows = TOPICS.map((T, ti) => d.done[ti] ? `<li>${T.icon} ${esc(T.name)}: <b>${d.done[ti]}/${topicRooms(ti).length}</b> stages</li>` : "").join("");
  const nextR = topicRooms(d.curT)[Math.min(2, d.done[d.curT])];
  return `<div class="preview small"><b>This code contains:</b> ${d.escaped} stage${d.escaped === 1 ? "" : "s"} escaped${d.escaped ? ` (about ${starStr(d.avg)} on average)` : ""}${rows ? `<ul style="margin:4px 0;padding-left:20px">${rows}</ul>` : ". "}${d.lock ? `${d.lock}/5 locks open in <b>${esc(nextR.name)}</b>, ` : ""}🔥 ${d.streak}-day streak, 🛡️ ${d.shields} shield${d.shields === 1 ? "" : "s"}.</div>`;
}
function openSaveModal() {
  const code = makeCode(), link = `${shareBase()}#${code}`;
  openModal(`
    <span class="kicker">🔑 ${"Save &amp; Share Code"}</span>
    <h2>${"Your save code"}</h2>
    ${say("chiikawa", "Your game saves automatically on this device. To carry on using <b>another</b> device (e.g. a school iPad), use this code!", "normal", "hint")}
    <div class="codebox" aria-label="Save code ${code.split("").join(" ")}">${fmtCode(code).split("").map(c => c === "-" ? `<b style="align-self:center">–</b>` : `<span>${c}</span>`).join("")}</div>
    <div class="row" style="justify-content:center">
      <button class="btn yellow" id="cpCode">${"Copy code"}</button>
      <button class="btn blue" id="cpLink">${"Copy link"}</button>
    </div>
    <p class="small muted" style="text-align:center">${"🏆 Trophies, 🌰 chestnuts, outfits and power-ups stay on this device."}</p>
    <p class="small muted" style="text-align:center">${"Write the code in your notebook ✏️ or send the link to yourself. The link opens the game with your progress ready to load."}</p>
    <div class="linkbox" id="linkbox">${esc(link)}</div>
    <hr style="border:0;border-top:2px dashed var(--ink);width:100%;margin:4px 0">
    <h3>${"Have a code from another device?"}</h3>
    <div class="row"><input class="codein" id="codeIn" maxlength="14" placeholder="ABCD-EFGH-JKLM" autocomplete="off" autocapitalize="characters" aria-label="${"Enter save code"}"><button class="btn" id="codeGo">${"Load"}</button></div>
    <div id="codeMsg" style="display:grid;gap:10px"></div>`);
  const copy = async (text, el, ok) => {
    try { await navigator.clipboard.writeText(text); toast(ok); }
    catch (e) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast("Selected. Press copy on your device."); }
  };
  document.getElementById("cpCode").onclick = () => copy(fmtCode(code), $modal.querySelector(".codebox"), `Code ${fmtCode(code)} copied 📋`);
  document.getElementById("cpLink").onclick = () => copy(link, document.getElementById("linkbox"), "Link copied 📋");
  const go = () => {
    const d = decodeCode(document.getElementById("codeIn").value);
    const msg = document.getElementById("codeMsg");
    if (!d) { SFX.wrong(); msg.innerHTML = say("chiikawa", "Wah... that code doesn't work. Check each letter and try again. (Codes have 12 letters or numbers, like ABCD-EFGH-JKLM.)", "cry"); return; }
    msg.innerHTML = `${codePreview(d)}${say("chiikawa", "Load this progress? It will replace the progress on this device.", "normal", "hint")}
      <div class="row"><button class="btn" id="codeYes">${"Yes, load it"}</button><button class="btn plain" id="codeNo">${"Cancel"}</button></div>`;
    document.getElementById("codeYes").onclick = () => applyCode(d);
    document.getElementById("codeNo").onclick = () => (msg.innerHTML = "");
  };
  document.getElementById("codeGo").onclick = go;
  document.getElementById("codeIn").addEventListener("keydown", e => { if (e.key === "Enter") go(); });
}
function clearHash() { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }
function applyCode(d, name) {
  stopTimer();
  S = stateFromCode(d, name); recomputeMastery(); save(true);
  closeModal(); SFX.item(); confetti(60);
  streakNote = `🔑 Progress loaded from code ${d.code}!`;
  clearHash();
  renderMap();
  setTimeout(checkTrophies, 800);
}

/* ----- Resume prompt on reload ----- */
function showResume() {
  const ni = nextRoomIndex();
  const r = ni === -1 ? null : ROOMS[ni];
  const solved = r ? (S.room_progress[r.id] || []).length : 0;
  openModal(`
    <span class="kicker">Welcome back</span>
    <h2>Hi, ${esc(S.player_name)}! 👋</h2>
    ${say("chiikawa", streakNote ? esc(streakNote) : "Ya...! You came back! 🥹", "sparkle")}
    ${r ? say("chiikawa", `Next right step: <b>${esc(stageName(r))}</b> (${stageLabelM(r)}${S.playMode === "study" ? "" : `: ${esc(r.focus)}`})${solved ? ` with <b>${solved}/5</b> locks already open` : ""}. Just this one stage today! 🌱`, "normal", "hint") : say("chiikawa", "You've escaped every stage! Replay any stage to practise.", "happy", "hint")}
    <div class="row">
      ${r ? `<button class="btn big" id="rsGo">▶ Resume game</button>` : ""}
      <button class="btn blue" id="rsMap">🗺️ Topic map</button>
      <button class="btn plain" id="rsCode">🔑 Use a save code</button>
    </div>`, { closable: false });
  if (r) document.getElementById("rsGo").onclick = () => { SFX.init(); SFX.tap(); closeModal(); streakNote = ""; enterRoom(r.id); };
  document.getElementById("rsMap").onclick = () => { SFX.init(); SFX.tap(); closeModal(); renderMap(); };
  document.getElementById("rsCode").onclick = () => { SFX.init(); SFX.tap(); closeModal(); openSaveModal(); };
}
function showCodeFromLink(d) {
  openModal(`
    <span class="kicker">🔑 Save code link</span>
    <h2>Load code ${fmtCode(d.code)}?</h2>
    ${codePreview(d)}
    ${S ? say("chiikawa", "This device already has saved progress. Loading the code will replace it.", "normal", "hint") : `<label for="nm2"><b>What's your name?</b></label><input id="nm2" class="name" maxlength="24" placeholder="Your name or nickname" autocomplete="off">`}
    <div class="row">
      <button class="btn big" id="lkYes">Load my progress</button>
      <button class="btn plain" id="lkNo">${S ? "Keep this device's progress" : "Start a new game"}</button>
    </div>`, { closable: false });
  document.getElementById("lkYes").onclick = () => { SFX.init(); const n = document.getElementById("nm2"); applyCode(d, n && n.value.trim()); };
  document.getElementById("lkNo").onclick = () => {
    SFX.init(); closeModal(); clearHash();
    if (S) { checkIn(); renderMap(); } else renderWelcome();
  };
}

/* ============================================================
   9. Screens
   ============================================================ */
const castHtml = moods => `<div class="cast">${["chiikawa"].map(w => `<div class="fig">${figure(w, (moods && moods[w]) || "normal")}</div>`).join("")}</div>`;
const starsBg = () => `<div class="stars" aria-hidden="true">${[[6, 14], [18, 40], [30, 10], [52, 22], [70, 8], [84, 30], [94, 12], [62, 44]].map(([x, y], i) => `<span style="left:${x}%;top:${y}%;animation-delay:${-i * .4}s">✦</span>`).join("")}</div>`;
const HERO_KICKER = "A cosy biology adventure · Secondary 4–6";

function renderWelcome() {
  stopRush(); MUSIC.setMode("map"); stopTimer(); R = null; renderTools();
  $app.innerHTML = `
    <section class="hero">${starsBg()}
      <span class="kicker" style="color:#fff">${HERO_KICKER}</span>
      <h1>Biology Study Pals</h1>
      <p class="sub">${TOPICS.length} topics · ${ROOMS.length} stages · 1 stage a day · about 15–20 minutes</p>
      ${castHtml({ chiikawa: "cry", usagi: "happy", momonga: "shock" })}
    </section>
    <section class="card">
      ${say("chiikawa", "Ya...!! 😭 We fell asleep in the biology lab... and woke up TINY, inside a giant cell world!", "cry")}
      ${say("chiikawa", "Every door is locked with a biology puzzle, from tiny cells all the way to ecosystems and staying healthy. Each topic is a series of stages (Photosynthesis has 6!), and the last one is a <b>boss stage</b> guarded by a Murk Warden. Each lock needs <b>3 questions</b> in a row to open. It'll work out~! Will you help us escape? ✨", "normal", "hint")}
      ${say("chiikawa", "WAHOO! Let's GO!💥", "happy")}
      <label for="nm"><b>What should we call you?</b></label>
      <input id="nm" class="name" maxlength="24" placeholder="Your name or nickname" autocomplete="off">
      <label for="tp"><b>Which topic is your class on?</b></label>
      <select id="tp" class="name">${PARTS.map((P, pi) => `<optgroup label="Part ${esc(P)}">${TOPICS.map((T, ti) => T.p === pi ? `<option value="${ti}">${T.icon} Topic ${T.no}: ${esc(T.name)}</option>` : "").join("")}</optgroup>`).join("")}</select>
      <div class="row">
        <button class="btn big" id="go">Start the adventure →</button>
        <button class="btn plain" id="haveCode">🔑 I have a save code</button>
      </div>
      <div id="wCode" style="display:grid;gap:10px"></div>
    </section>`;
  const go = () => {
    SFX.init(); SFX.item();
    S = freshState(); const v = document.getElementById("nm").value.trim(); if (v) S.player_name = v;
    const ti = Number(document.getElementById("tp").value) || 0;
    S.current_room = topicRooms(ti)[0].id; checkIn(); save(true); homeTab = "home"; renderMap(); window.scrollTo({ top: 0 });
  };
  document.getElementById("go").onclick = go;
  document.getElementById("nm").addEventListener("keydown", e => { if (e.key === "Enter") go(); });
  document.getElementById("haveCode").onclick = () => {
    SFX.init(); SFX.tap();
    const w = document.getElementById("wCode");
    w.innerHTML = `<div class="row"><input class="codein" id="wIn" maxlength="14" placeholder="ABCD-EFGH-JKLM" autocomplete="off" autocapitalize="characters" aria-label="Enter save code"><button class="btn" id="wGo">Load</button></div><div id="wMsg"></div>`;
    const loadIt = () => {
      const d = decodeCode(document.getElementById("wIn").value);
      if (!d) { SFX.wrong(); document.getElementById("wMsg").innerHTML = say("chiikawa", "Wah... that code doesn't work. Check each letter and try again. (Codes look like ABCD-EFGH-JKLM.)", "cry"); return; }
      document.getElementById("wMsg").innerHTML = `${codePreview(d)}<div class="row"><button class="btn" id="wYes">Yes, load it</button></div>`;
      document.getElementById("wYes").onclick = () => applyCode(d, document.getElementById("nm").value.trim());
    };
    document.getElementById("wGo").onclick = loadIt;
    document.getElementById("wIn").addEventListener("keydown", e => { if (e.key === "Enter") loadIt(); });
    document.getElementById("wIn").focus();
  };
}

function stageBtn(r, i, ni) {
  const done = S.completed_rooms.includes(r.id), open = isUnlocked(i), n = (S.room_progress[r.id] || []).length;
  return `<button class="stage ${done ? "done" : ""} ${i === ni ? "next" : ""} ${r.boss ? "boss" : ""}" data-room="${r.id}" ${open ? "" : "disabled"} aria-label="${esc(stageLabelM(r))}: ${esc(stageName(r))}${done ? `, ${roomStars(r)} stars` : open ? "" : ", locked"}">
    <span class="sn">${S.playMode === "study" ? secNo(r) : r.boss ? "⚔️" : r.s}</span>
    <span style="min-width:0"><span class="sname">${open ? "" : "🔒 "}${esc(S.playMode === "study" ? r.focus : r.name)}</span><span class="ssub">${S.playMode === "study" ? "📖 Study section" : esc(r.focus)}${open ? ` · 📚 ${masteredIn(r)}/${r.pool.length} mastered` : ""}</span></span>
    <span class="sstar">${done ? starStr(roomStars(r)) : open ? `🔑 ${n}/5` : ""}</span>
  </button>`;
}
let mapPart = null;

/* ----- 📕 Mistake Notebook: revise the questions you got wrong ----- */
const shortQ = t => (t.length > 110 ? t.slice(0, 107) + "…" : t);
function renderNotebook() {
  renderNav("play");
  stopRush(); MUSIC.setMode("calm"); stopTimer(); if (R) { clearTimeout(R.introT); clearTimeout(R.incT); } R = null; renderTools();
  const all = mistakeKeys(), cleared = S.mistakes_cleared || 0;
  const rows = all.map(k => ({ k, ...mistakeQ(k), m: S.mistakes[k] })).sort((a, b) => a.r.t - b.r.t || b.m.n - a.m.n);
  $app.innerHTML = `
    <section class="hero nb-hero">${starsBg()}
      <span class="kicker" style="color:#fff">${HERO_KICKER} · Revision mode</span>
      <h1>📕 Mistake Notebook</h1>
      <p class="sub">${all.length ? `${all.length} question${all.length === 1 ? "" : "s"} to fix · ${cleared} cleared so far` : `Nothing to fix right now · ${cleared} cleared so far`}</p>
    </section>
    <section class="card">
      ${say("chiikawa", all.length ? "Every mistake you make in the escape rooms, Cell Rush and incidents is saved here. Answer one right <b>twice in a row</b> to clear it from the notebook. Every mistake is a clue that makes your brain stronger! 🗺️" : "Your notebook is empty. Play escape rooms and Cell Rush; any question you miss will appear here for focused revision. 🌱", "normal", "hint")}
      ${all.length ? say("chiikawa", "Uu... I don't like mistakes... but I'll fix them one by one! 💪", "brave") : ""}
      <div class="row">${all.length ? `<button class="btn big" id="nbAll">▶ Revise ${Math.min(10, all.length)} mistake${all.length === 1 ? "" : "s"}</button>` : ""}<button class="btn plain" id="nbMap">← Topic map</button></div>
    </section>
    <section class="card">
      <h2>By topic</h2>
      <div class="nbtopics">${TOPICS.map((T, ti) => { const n = mistakeKeys(ti).length; return `<div class="nbrow"><span class="ticon" aria-hidden="true">${T.icon}</span>
        <span style="min-width:0"><b>Topic ${T.no}: ${esc(T.name)}</b><br><span class="small muted">${esc(T.part)}</span></span>
        <span class="pill ${n ? "" : "saved"}">${n ? `${n} to fix` : "✓ clear"}</span>
        <button class="btn blue" data-nbt="${ti}" ${n ? "" : "disabled"}>Revise</button></div>`; }).join("")}</div>
    </section>
    ${rows.length ? `<section class="card"><h2>Questions to fix</h2><div class="nblist">${rows.slice(0, 60).map(x => `<div class="nbitem">
        <span class="small muted">${TOPICS[x.r.t].icon} ${esc(stageLabelM(x.r))} · ${esc(stageName(x.r))}${x.p.gen ? " · ✏️ spelling" : x.p.graph ? " · 📈 graph" : ""}</span>
        <span>${esc(shortQ(x.p.q))}</span>
        <span class="small"><b class="bad">✗ ${x.m.n}</b> wrong · <b class="good">✓ ${x.m.ok}/2</b> to clear</span></div>`).join("")}</div>
        ${rows.length > 60 ? `<p class="small muted">…and ${rows.length - 60} more.</p>` : ""}</section>` : ""}`;
  const a = document.getElementById("nbAll"); if (a) a.onclick = () => { SFX.init(); SFX.tap(); startRevision(null); };
  document.getElementById("nbMap").onclick = () => { SFX.tap(); renderMap(); };
  $app.querySelectorAll("[data-nbt]").forEach(b => b.onclick = () => { SFX.init(); SFX.tap(); startRevision(Number(b.dataset.nbt)); });
  window.scrollTo({ top: 0 });
}
function startRevision(ti) {
  const keys = mistakeKeys(ti).sort((a, b) => S.mistakes[a].ok - S.mistakes[b].ok || S.mistakes[b].n - S.mistakes[a].n).slice(0, 10);
  const RV = { keys, at: 0, right: 0, cleared: 0, done: 0, start: new Date().toISOString() };
  const next = () => {
    if (RV.at >= RV.keys.length) {
      const coins = Math.round((RV.cleared * 2 + RV.right) * perk("notebook")); gainCoins(coins); SFX.fanfare(); if (RV.right) confetti(100);
      activityDone({ mode: "notebook", topic: ti == null ? "all" : String(TOPICS[ti].no), stage: "Mistake Notebook", ans: RV.done || 0, cor: RV.right, done: (RV.done || 0) > 0, start: RV.start });
      $app.innerHTML = `<section class="card"><span class="kicker">📕 Revision done</span><h2>${RV.right === RV.keys.length ? "Perfect revision! 🎉" : "Revision complete! 🌱"}</h2>
        <div class="cast" style="margin:0">${["chiikawa"].map(w => `<div class="fig" style="width:84px">${figure(w, RV.right ? (w === "chiikawa" ? "sparkle" : "happy") : "normal")}</div>`).join("")}</div>
        <p style="text-align:center"><b>${RV.right}/${RV.keys.length}</b> right · <b>${RV.cleared}</b> cleared from the notebook · <span class="pill coinpill">+${coins} 🌰</span></p>
        ${say(RV.cleared ? "chiikawa" : "chiikawa", RV.cleared ? "You wiped mistakes out of the notebook! I'm... a little impressed. 💜" : "Getting them right once is a great start. Get each one right again next time to clear it! ✨", RV.cleared ? "sparkle" : "happy", RV.cleared ? "" : "hint")}
        <div class="row"><button class="btn big" id="rvAgain">📕 Back to the notebook</button><button class="btn plain" id="rvMap">🗺️ Map</button></div></section>`;
      document.getElementById("rvAgain").onclick = () => { SFX.tap(); renderNotebook(); };
      document.getElementById("rvMap").onclick = () => { SFX.tap(); renderMap(); };
      return;
    }
    const k = RV.keys[RV.at], { r, p } = mistakeQ(k), m = S.mistakes[k] || { n: 0, ok: 0 };
    $app.innerHTML = `<section class="rushhead"><div class="status"><div class="av">${avatar("chiikawa", "brave")}</div><div><div class="rtopic" style="color:var(--yellow)">📕 Mistake Notebook${ti == null ? "" : ` · ${esc(TOPICS[ti].name)}`}</div><div class="big">Question ${RV.at + 1} of ${RV.keys.length}</div></div></div>
        <span class="combo">✓ ${m.ok}/2 to clear</span></section>
      <section class="card"><span class="kicker">${TOPICS[r.t].icon} ${esc(stageLabel(r))} · ${esc(r.focus)} ${diffChip(p.b)} ${bmBtn(r.id, p.id)}</span>
        <p class="q">${esc(p.q)}</p>${p.svg ? `<div class="diagram-box">${DIAGRAMS[p.svg]}</div>` : ""}
        <div id="rvAns"></div><div class="row"><button class="btn blue" id="rvHint">💡 Hint</button><button class="btn plain" id="rvJ">📓 Notes</button><button class="btn plain" id="rvQuit">✕ Stop</button></div><div id="rvFb"></div></section>`;
    document.getElementById("rvHint").onclick = () => { SFX.hint(); document.getElementById("rvFb").innerHTML = say("chiikawa", `💡 ${esc(p.hint)}`, "normal", "hint"); RV.hinted = true; };
    document.getElementById("rvJ").onclick = () => { SFX.tap(); openJournal(r.id, termsIn(r, p)); };
    document.getElementById("rvQuit").onclick = () => { SFX.tap(); RV.at = RV.keys.length; next(); };
    RV.hinted = false;
    miniQuiz(document.getElementById("rvAns"), p, ok => {
      const fb = document.getElementById("rvFb");
      RV.done++;
      if (ok) { RV.right++; SFX.right(); if (noteRight(r.id, p.id, !RV.hinted)) RV.cleared++; else if (RV.hinted) toast("Right! (Used a hint, so it stays in the notebook for now.)"); }
      else { SFX.wrong(); noteMistake(r.id, p.id); }
      save();
      fb.innerHTML = `<div class="fb ${ok ? "ok" : "no"}">${ok ? say("chiikawa", "Wahoo! Got it!", "happy") : say("chiikawa", "Uu... not yet. Let's read why. 🥺", "cry")}<p>${esc(p.explain)}</p>${p.tip ? `<p class="tip"><b>📝 Top tip:</b> ${esc(p.tip)}</p>` : ""}
        <div class="row"><button class="btn big" id="rvNext">${RV.at + 1 < RV.keys.length ? "Next →" : "Finish"}</button></div></div>`;
      document.getElementById("rvNext").onclick = () => { SFX.tap(); RV.at++; next(); };
      document.getElementById("rvNext").focus({ preventScroll: true });
    });
    window.scrollTo({ top: 0 });
  };
  MUSIC.setMode("calm"); next();
}
// A self-contained answer widget (multiple choice, dials or spelling) used outside escape rooms
function miniQuiz(el, p, done) {
  let over = false;
  const finish = ok => { if (over) return; over = true; el.querySelectorAll("button,input").forEach(x => (x.disabled = true)); done(ok); };
  if (p.type === "mc") {
    const idx = p.choices.map((_, i) => i), order = p.fix ? idx.sort((a, b) => p.choices[a].localeCompare(p.choices[b])) : shuffle(idx);
    el.innerHTML = `<div class="choices">${order.map((i, n) => `<button class="choice" data-i="${i}"><b>${"ABCD"[n]}</b><span>${esc(p.choices[i])}</span></button>`).join("")}</div>`;
    el.querySelectorAll(".choice").forEach(b => b.onclick = () => { const ok = Number(b.dataset.i) === p.answer; b.classList.add(ok ? "right" : "wrong"); if (!ok) el.querySelector(`[data-i="${p.answer}"]`).classList.add("right"); finish(ok); });
  } else if (p.type === "dial") {
    const pos = p.dials.map(o => Math.floor(Math.random() * o.length));
    el.innerHTML = `<div class="dials">${p.dials.map((o, d) => `<div class="dial">${p.labels ? `<span class="dlabel">${esc(p.labels[d])}</span>` : ""}<button class="arr" data-d="${d}" data-dir="-1" aria-label="Previous option">▲</button><div class="face" id="mf${d}">${esc(o[pos[d]])}</div><button class="arr" data-d="${d}" data-dir="1" aria-label="Next option">▼</button></div>`).join("")}</div><div class="row" style="justify-content:center"><button class="btn" id="mdOk">Check 🔓</button></div>`;
    el.querySelectorAll(".arr").forEach(b => b.onclick = () => { const d = Number(b.dataset.d), n = p.dials[d].length; pos[d] = (pos[d] + Number(b.dataset.dir) + n) % n; SFX.click(); document.getElementById("mf" + d).textContent = p.dials[d][pos[d]]; });
    document.getElementById("mdOk").onclick = () => { const ok = pos.every((v, d) => v === p.answer[d]); if (!ok) p.dials.forEach((o, d) => { document.getElementById("mf" + d).textContent = o[p.answer[d]]; }); finish(ok); };
  } else {
    el.innerHTML = `<div class="spell"><div class="sboxes" id="mBoxes">${spellBoxes(p.answer, "")}</div><p class="small muted">${countLetters(p.answer)} letters · starts with “${esc(p.answer[0].toUpperCase())}”</p>
      <div class="row"><input id="mIn" class="name" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Type the biology term"><button class="btn" id="mOk">Check ✏️</button></div></div>`;
    const inp = document.getElementById("mIn");
    inp.oninput = () => { document.getElementById("mBoxes").innerHTML = spellBoxes(p.answer, inp.value); };
    const go = () => { if (!normWord(inp.value)) { toast("Type the word first ✏️"); return; } const ok = sameSpelling(inp.value, p.answer); if (!ok) document.getElementById("mBoxes").innerHTML = spellBoxes(p.answer, p.answer); finish(ok); };
    document.getElementById("mOk").onclick = go; inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); go(); } }); setTimeout(() => inp.focus({ preventScroll: true }), 60);
  }
}

/* ----- Room scene (SVG) ----- */
function specialSvg(kind) {
  const o = `stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`, o3 = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const bubbles = (pts, f = "#fff") => pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${o3}/>`).join("");
  switch (kind) {
    case "jug": return `<path d="M410 300 V220 Q410 196 426 190 H456 Q470 196 470 220 V300 Z" fill="#D3E4FF" ${o}/><path d="M470 216 q26 4 22 34 q-4 22 -22 22" fill="none" ${o}/><path d="M412 244 q28 -10 56 0 V298 H412Z" fill="#7FB3F0"/><path d="M426 188 l-10 -14 h52 l-12 14" fill="#D3E4FF" ${o}/>${bubbles([[430, 262, 4], [448, 276, 3]])}`;
    case "jar": return `<rect x="398" y="200" width="84" height="100" rx="18" fill="rgba(255,255,255,.55)" ${o}/><rect x="404" y="184" width="72" height="20" rx="6" fill="#FFB7C5" ${o}/>${[[420, 280, "#FFB7C5"], [446, 272, "#A0C4FF"], [466, 284, "#FDFFB6"], [430, 252, "#B9F3C9"], [458, 244, "#C9C3F0"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="11" fill="${c}" ${o3}/>`).join("")}`;
    case "gears": return `<circle cx="420" cy="250" r="34" fill="#C9C3F0" ${o}/><circle cx="420" cy="250" r="10" fill="#FFFDF0" ${o3}/><circle cx="476" cy="232" r="22" fill="#FDFFB6" ${o}/><circle cx="476" cy="232" r="7" fill="#FFFDF0" ${o3}/>${[0, 1, 2, 3, 4].map(k => `<circle cx="${396 + k * 22}" cy="292" r="7" fill="${["#FFB7C5", "#A0C4FF", "#B9F3C9", "#FDFFB6", "#C9C3F0"][k]}" ${o3}/>`).join("")}`;
    case "microscope": return `<path d="M410 300 h70 M440 300 v-26 M428 274 h40" fill="none" ${o}/><path d="M456 274 V232 L436 190" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><rect x="424" y="176" width="22" height="34" rx="6" fill="#A0C4FF" ${o3} transform="rotate(-28 435 193)"/><rect x="416" y="246" width="46" height="8" rx="3" fill="#FFFDF0" ${o3}/><circle cx="440" cy="238" r="5" fill="#B9F3C9" ${o3}/>`;
    case "cellmodel": return `<ellipse cx="440" cy="248" rx="62" ry="48" fill="#B9F3C9" ${o}/><circle cx="424" cy="244" r="16" fill="#C9C3F0" ${o3}/><ellipse cx="468" cy="226" rx="12" ry="7" fill="#F2A36B" ${o3}/><ellipse cx="466" cy="270" rx="12" ry="7" fill="#7BC96F" ${o3}/>`;
    case "bubble": return `<ellipse cx="440" cy="236" rx="60" ry="64" fill="rgba(211,228,255,.55)" ${o}/><path d="M408 206 q10 -18 30 -20" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>${bubbles([[510, 200, 9], [520, 240, 6], [370, 222, 7]], "rgba(255,255,255,.6)")}`;
    case "perfume": return `<rect x="410" y="226" width="60" height="74" rx="16" fill="#FFB7C5" ${o}/><rect x="428" y="206" width="24" height="22" rx="4" fill="#FDFFB6" ${o3}/><circle cx="440" cy="196" r="10" fill="#C9C3F0" ${o3}/>${[[486, 190], [504, 170], [520, 196], [492, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#FFB7C5" opacity=".8"/>`).join("")}`;
    case "potato": return `<path d="M392 300 V250 H488 V300 Z" fill="#D3E4FF" ${o}/><path d="M392 262 H488" stroke="#fff" stroke-width="3"/>${[408, 428, 448, 468].map((x, k) => `<rect x="${x}" y="${k % 2 ? 214 : 222}" width="12" height="${k % 2 ? 76 : 68}" rx="4" fill="#F2D7AE" ${o3} ${k === 1 ? `transform="rotate(12 ${x} 250)"` : ""}/>`).join("")}`;
    case "pump": return `<rect x="404" y="222" width="44" height="78" rx="8" fill="#A0C4FF" ${o}/><path d="M426 222 V186 H466" fill="none" ${o}/><rect x="456" y="176" width="24" height="12" rx="3" fill="#FDFFB6" ${o3}/><rect x="458" y="252" width="30" height="46" rx="6" fill="#B9F3C9" ${o3}/><path d="M466 262 v10 M480 262 v10 M462 267 h8" stroke="${INK}" stroke-width="2.4"/>${bubbles([[498, 170, 6], [510, 150, 5], [516, 128, 4]], "#FFB7C5")}`;
    case "copier": return `<rect x="392" y="232" width="96" height="68" rx="8" fill="#E8E2D6" ${o}/><rect x="400" y="216" width="80" height="18" rx="4" fill="#A0C4FF" ${o3}/><rect x="404" y="262" width="30" height="24" rx="3" fill="#fff" ${o3}/><rect x="446" y="262" width="30" height="24" rx="3" fill="#fff" ${o3}/><path d="M410 274 h18 M452 274 h18" stroke="#5B8FE0" stroke-width="3"/>`;
    case "cards": return `${[[-14, "#FFB7C5"], [0, "#FDFFB6"], [14, "#A0C4FF"]].map(([a, c]) => `<rect x="418" y="200" width="44" height="64" rx="6" fill="${c}" ${o3} transform="rotate(${a} 440 290)"/>`).join("")}<path d="M436 226 l4 -8 l4 8 l-4 8z" fill="#E0567E"/>`;
    case "twins": return `<rect x="392" y="190" width="42" height="110" rx="20" fill="#D3E4FF" ${o}/><rect x="446" y="190" width="42" height="110" rx="20" fill="#FFD6DF" ${o}/><path d="M402 214 l14 -14 M456 214 l14 -14" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`;
    case "lock": return `<path d="M412 234 V212 a28 28 0 0 1 56 0 V234" fill="none" stroke="${INK}" stroke-width="10"/><rect x="398" y="232" width="84" height="68" rx="12" fill="#F5C542" ${o}/><path d="M432 258 L440 250 L448 258 L448 276 H432Z" fill="${INK}"/>`;
    case "pot": return `<path d="M398 240 H482 V286 Q482 300 468 300 H412 Q398 300 398 286 Z" fill="#B8C3D6" ${o}/><rect x="392" y="232" width="96" height="12" rx="4" fill="#8C98AC" ${o3}/>${bubbles([[420, 222, 6], [444, 212, 8], [466, 224, 5]])}<path d="M420 200 q-8 -12 0 -24 M446 190 q-8 -12 0 -24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
    case "vault": return `<rect x="396" y="200" width="88" height="100" rx="10" fill="#8C877C" ${o}/><circle cx="440" cy="250" r="26" fill="#B8B2A6" ${o3}/><path d="M440 232 v36 M422 250 h36" stroke="${INK}" stroke-width="4"/><circle cx="440" cy="250" r="6" fill="#FFB7C5" ${o3}/>`;
    case "plant": return `<path d="M414 300 L406 256 H474 L466 300 Z" fill="#E07A3F" ${o}/><path d="M440 256 V206" ${o}/><path d="M440 226 q-34 -6 -40 -34 q30 2 40 34 M440 214 q30 -10 38 -38 q-30 4 -38 38" fill="#7BC96F" ${o3}/>`;
    case "sun": return `<circle cx="440" cy="222" r="30" fill="#FDD66B" ${o}/>${Array.from({ length: 8 }, (_, k) => { const a = k * Math.PI / 4; return `<path d="M${(440 + 40 * Math.cos(a)).toFixed(0)} ${(222 + 40 * Math.sin(a)).toFixed(0)} L${(440 + 54 * Math.cos(a)).toFixed(0)} ${(222 + 54 * Math.sin(a)).toFixed(0)}" stroke="#F5A623" stroke-width="5" stroke-linecap="round"/>`; }).join("")}<rect x="392" y="282" width="96" height="16" rx="4" fill="#C98F6B" ${o3}/>${[408, 432, 456].map(x => `<rect x="${x}" y="268" width="18" height="14" rx="3" fill="#FFFDF0" ${o3}/>`).join("")}`;
    case "pondweed": return `<rect x="392" y="206" width="96" height="94" rx="8" fill="rgba(160,196,255,.6)" ${o}/><path d="M424 300 q-10 -30 6 -60 q-14 -16 -2 -30 M452 300 q10 -34 -4 -64" fill="none" stroke="#3E8E3A" stroke-width="5" stroke-linecap="round"/>${bubbles([[430, 196, 4], [436, 178, 5], [448, 160, 4]])}`;
    case "mitolamp": return `<ellipse cx="440" cy="238" rx="58" ry="34" fill="#F9C9A6" ${o}/><path d="M394 238 h16 v-18 h12 v36 h12 v-36 h12 v36 h12 v-36 h12 v18 h16" fill="none" ${o3}/><path d="M440 272 V300" ${o}/><ellipse cx="440" cy="238" rx="74" ry="48" fill="rgba(253,255,182,.25)"/>`;
    case "bread": return `<path d="M398 300 V262 Q398 226 440 226 Q482 226 482 262 V300 Z" fill="#E9B872" ${o}/><path d="M416 250 q8 -8 16 0 M440 244 q8 -8 16 0 M460 256 q6 -6 12 0" fill="none" ${o3}/>${bubbles([[422, 214, 5], [446, 204, 6], [466, 214, 4]])}`;
    case "limewater": return `<path d="M422 180 V224 L396 290 Q392 300 404 300 H476 Q488 300 484 290 L458 224 V180" fill="rgba(255,255,255,.7)" ${o}/><path d="M408 264 H472 L482 292 Q484 298 476 298 H404 Q396 298 398 292 Z" fill="#E9E4DA"/><path d="M418 178 h44" ${o}/>`;
    case "bento": return `<rect x="388" y="236" width="104" height="64" rx="10" fill="#E0567E" ${o}/><rect x="396" y="244" width="46" height="48" rx="6" fill="#FFFDF0" ${o3}/><rect x="448" y="244" width="36" height="22" rx="4" fill="#7BC96F" ${o3}/><rect x="448" y="270" width="36" height="22" rx="4" fill="#FDD66B" ${o3}/><path d="M408 262 l10 -12 l10 12 v18 h-20z" fill="#fff" ${o3}/><rect x="410" y="270" width="16" height="10" fill="${INK}"/>`;
    case "slide": return `<path d="M400 300 Q380 260 420 240 Q470 220 440 200 Q410 180 460 168" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M400 300 Q380 260 420 240 Q470 220 440 200 Q410 180 460 168" fill="none" stroke="#FFB7C5" stroke-width="15" stroke-linecap="round"/>`;
    case "peapod": return `<path d="M388 280 Q440 196 500 250 Q470 296 388 280Z" fill="#9CCB6B" ${o}/>${[410, 432, 454, 474].map((x, k) => `<circle cx="${x}" cy="${266 - k * 5}" r="10" fill="${k === 2 ? "#DDEB9A" : "#7BC96F"}" ${o3}/>`).join("")}<path d="M500 250 q14 -10 10 -26" fill="none" ${o3}/>`;
    case "family": return `<rect x="392" y="190" width="96" height="110" rx="8" fill="#FFFDF0" ${o}/><path d="M418 222 H462 M440 222 V246 M418 246 H462 M418 246 V262 M462 246 V262" fill="none" ${o3}/><rect x="404" y="210" width="16" height="16" fill="#A0C4FF" ${o3}/><circle cx="470" cy="218" r="9" fill="#FFB7C5" ${o3}/><rect x="410" y="262" width="16" height="16" fill="#5B8FE0" ${o3}/><circle cx="462" cy="272" r="9" fill="#FFFDF0" ${o3}/>`;
    case "heightchart": return `<rect x="410" y="160" width="60" height="140" rx="4" fill="#FFFDF0" ${o}/>${Array.from({ length: 7 }, (_, k) => `<path d="M410 ${176 + k * 18} h${k % 2 ? 14 : 24}" stroke="${INK}" stroke-width="2.4"/>`).join("")}<path d="M448 196 h18 M448 226 h18 M448 254 h18" stroke="#E0567E" stroke-width="4" stroke-linecap="round"/>`;
    case "dna": return `${Array.from({ length: 7 }, (_, k) => { const y = 180 + k * 18, dx = 30 * Math.sin(k * .9); return `<path d="M${(440 - dx).toFixed(0)} ${y} H${(440 + dx).toFixed(0)}" stroke="${["#FFB7C5", "#A0C4FF", "#B9F3C9", "#FDFFB6"][k % 4]}" stroke-width="6" stroke-linecap="round"/>`; }).join("")}<path d="M440 170 ${Array.from({ length: 8 }, (_, k) => `L${(440 + 32 * Math.sin(k * .9)).toFixed(0)} ${180 + k * 18}`).join(" ")} M440 170 ${Array.from({ length: 8 }, (_, k) => `L${(440 - 32 * Math.sin(k * .9)).toFixed(0)} ${180 + k * 18}`).join(" ")}" fill="none" ${o3}/><rect x="412" y="296" width="56" height="8" rx="3" fill="#C98F6B" ${o3}/>`;
    case "petri": return `<ellipse cx="440" cy="284" rx="62" ry="18" fill="rgba(211,228,255,.7)" ${o}/><ellipse cx="440" cy="280" rx="54" ry="13" fill="#FDFFB6" ${o3}/>${[[420, 278], [446, 284], [462, 276], [432, 272]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#B9F3C9" stroke="#3E8E3A" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="10" fill="rgba(185,243,201,.35)"/>`).join("")}`;
    case "butterfly": return `<rect x="392" y="196" width="96" height="104" rx="6" fill="rgba(255,255,255,.55)" ${o}/><path d="M440 230 q-40 -30 -34 6 q4 22 34 10 q30 12 34 -10 q6 -36 -34 -6Z" fill="#FFB7C5" ${o3}/><path d="M440 244 q-26 10 -18 24 q10 8 18 -14 q8 22 18 14 q8 -14 -18 -24Z" fill="#C9C3F0" ${o3}/><path d="M440 226 V266" ${o3}/>`;
    case "globe": return `<circle cx="440" cy="236" r="46" fill="#A0C4FF" ${o}/><path d="M412 216 q14 -10 26 4 q-6 16 -24 12Z M446 250 q18 -8 24 8 q-10 16 -26 6Z" fill="#7BC96F" ${o3}/><path d="M440 282 V300 M414 300 H466" ${o}/><path d="M384 236 a56 56 0 0 1 20 -44" fill="none" stroke="#E0567E" stroke-width="3" stroke-linecap="round"/><path d="M404 192 l2 12 l-12 -2" fill="none" stroke="#E0567E" stroke-width="3"/>`;
    case "fossil": return `<path d="M392 300 Q380 240 440 214 Q500 240 488 300Z" fill="#B8B2A6" ${o}/><path d="M440 262 m-4 0 a4 4 0 1 1 8 0 a10 10 0 1 1 -18 -2 a16 16 0 1 1 30 6 a22 22 0 1 1 -40 -8" fill="none" stroke="#6B5E4E" stroke-width="3.5" stroke-linecap="round"/>`;
    case "potometer": return `<path d="M400 190 q-30 20 -8 50 M400 190 q30 10 20 40 M400 200 q-6 -26 12 -34" fill="#7BC96F" ${o3}/><path d="M400 230 V270 H500" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M400 230 V270 H500" fill="none" stroke="#D3E4FF" stroke-width="4"/><circle cx="462" cy="270" r="4" fill="#fff" stroke="${INK}" stroke-width="1.5"/>${[420, 440, 460, 480].map(x => `<path d="M${x} 282 v8" stroke="${INK}" stroke-width="2"/>`).join("")}`;
    case "lungs": return `<path d="M440 180 V222" ${o}/><path d="M434 220 Q400 208 392 250 Q388 292 424 294 Q436 290 436 262Z" fill="#FFB7C5" ${o}/><path d="M446 220 Q480 208 488 250 Q492 292 456 294 Q444 290 444 262Z" fill="#FFB7C5" ${o}/><path d="M440 222 l-18 18 M440 222 l18 18" ${o3}/>`;
    case "belljar": return `<path d="M398 300 V214 Q398 180 440 180 Q482 180 482 214 V300" fill="rgba(211,228,255,.5)" ${o}/><path d="M440 170 V212 M440 212 l-14 12 M440 212 l14 12" ${o3}/><circle cx="424" cy="236" r="13" fill="#FFB7C5" ${o3}/><circle cx="456" cy="236" r="13" fill="#FFB7C5" ${o3}/><path d="M398 300 Q440 316 482 300" fill="none" stroke="#E0567E" stroke-width="5"/><path d="M440 308 v14" ${o3}/>`;
    case "bloodbag": return `<path d="M470 160 V300" ${o}/><path d="M458 160 h24" ${o}/><rect x="400" y="176" width="58" height="80" rx="14" fill="#D64545" ${o}/><path d="M412 196 h34" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M429 256 V300" stroke="#D64545" stroke-width="4"/><path d="M429 256 V300" fill="none" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 5"/>`;
    case "heart": return `<path d="M440 300 L394 246 Q376 216 404 202 Q428 194 440 220 Q452 194 476 202 Q504 216 486 246 Z" fill="#E0567E" ${o}/><path d="M440 220 V290" stroke="#FFB7C5" stroke-width="3" stroke-dasharray="6 5"/><path d="M420 206 q-10 -22 4 -34 M458 206 q8 -24 -4 -38" fill="none" stroke="#5B8FE0" stroke-width="7" stroke-linecap="round"/>`;
    case "flower": return `<path d="M440 300 V230" stroke="#3E8E3A" stroke-width="6"/><path d="M440 266 q-26 -8 -30 8 q18 6 30 -8" fill="#7BC96F" ${o3}/>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="${(440 + 24 * Math.sin(a * Math.PI / 180)).toFixed(1)}" cy="${(210 - 24 * Math.cos(a * Math.PI / 180)).toFixed(1)}" rx="16" ry="20" transform="rotate(${a} ${(440 + 24 * Math.sin(a * Math.PI / 180)).toFixed(1)} ${(210 - 24 * Math.cos(a * Math.PI / 180)).toFixed(1)})" fill="#FFB7C5" ${o3}/>`).join("")}<circle cx="440" cy="210" r="13" fill="#FDD66B" ${o3}/>`;
    case "egg": return `<ellipse cx="440" cy="252" rx="50" ry="48" fill="rgba(253,255,182,.35)"/><circle cx="440" cy="252" r="36" fill="#FFF1C9" ${o}/><circle cx="440" cy="252" r="30" fill="none" stroke="#F2A36B" stroke-width="2" stroke-dasharray="4 4"/><circle cx="448" cy="244" r="11" fill="#C9C3F0" ${o3}/><path d="M440 288 V300" ${o}/>`;
    case "eye": return `<ellipse cx="440" cy="240" rx="56" ry="36" fill="#FFFDF0" ${o}/><circle cx="440" cy="240" r="24" fill="#5B8FE0" ${o3}/><circle cx="440" cy="240" r="11" fill="${INK}"/><circle cx="446" cy="232" r="4" fill="#fff"/><path d="M440 276 V300 M420 300 H460" ${o}/>`;
    case "brain": return `<path d="M398 260 Q386 212 430 204 Q446 184 470 202 Q498 208 490 244 Q496 272 468 274 Q450 290 428 278 Q398 284 398 260Z" fill="#FFB7C5" ${o}/><path d="M420 228 q12 -10 22 2 q10 -12 22 0 M414 254 q14 -8 26 2 q12 -10 26 2" fill="none" stroke="${INK}" stroke-width="2.4"/><path d="M448 276 v24" ${o}/>`;
    case "bone": return `<path d="M404 300 L470 186" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M404 300 L470 186" stroke="#FFFDF0" stroke-width="11" stroke-linecap="round"/><path d="M470 186 L500 250" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M470 186 L500 250" stroke="#FFFDF0" stroke-width="9" stroke-linecap="round"/><path d="M418 270 Q450 220 474 200" fill="none" stroke="#E0567E" stroke-width="10" stroke-linecap="round" opacity=".85"/><circle cx="470" cy="186" r="9" fill="#FDFFB6" ${o3}/>`;
    case "scale": return `<path d="M440 300 V200 M396 210 H484" ${o}/><path d="M396 210 l-18 40 h36 z M484 210 l-18 40 h36 z" fill="#FDFFB6" ${o3}/><circle cx="484" cy="238" r="7" fill="#fff" ${o3}/><rect x="386" y="232" width="20" height="12" rx="2" fill="#FFB7C5" stroke="${INK}" stroke-width="2"/><path d="M420 300 H460" ${o}/>`;
    case "quadrat": return `<path d="M390 296 L420 250 H500 L470 296Z" fill="rgba(185,243,201,.6)" ${o}/><path d="M410 273 H485 M430 250 L445 296 M460 250 L475 296" stroke="${INK}" stroke-width="1.8"/>${[[425, 280], [452, 262], [470, 285]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="${INK}" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="1.6" fill="#FDD66B"/>`).join("")}`;
    case "virus": return `<rect x="396" y="190" width="88" height="110" rx="8" fill="rgba(255,255,255,.4)" ${o}/><circle cx="440" cy="244" r="26" fill="#B9F3C9" ${o3}/>${Array.from({ length: 10 }, (_, k) => { const a = k * Math.PI / 5; return `<path d="M${(440 + 26 * Math.cos(a)).toFixed(0)} ${(244 + 26 * Math.sin(a)).toFixed(0)} L${(440 + 38 * Math.cos(a)).toFixed(0)} ${(244 + 38 * Math.sin(a)).toFixed(0)}" stroke="${INK}" stroke-width="2.4"/><circle cx="${(440 + 40 * Math.cos(a)).toFixed(0)}" cy="${(244 + 40 * Math.sin(a)).toFixed(0)}" r="4" fill="#FFB7C5" stroke="${INK}" stroke-width="1.5"/>`; }).join("")}`;
    case "shield": return `<path d="M440 180 L490 196 Q490 268 440 300 Q390 268 390 196Z" fill="#A0C4FF" ${o}/>${[[424, 226], [456, 226], [440, 258]].map(([x, y]) => `<path d="M${x} ${y + 12} V${y} M${x} ${y} l-8 -10 M${x} ${y} l8 -10" fill="none" stroke="#FDFFB6" stroke-width="4" stroke-linecap="round"/>`).join("")}`;
    case "prism": return `<path d="M440 196 L486 300 H394 Z" fill="#D3E4FF" ${o}/><path d="M360 250 L426 240" stroke="#fff" stroke-width="5" stroke-linecap="round"/>${["#e0473d", "#f28c28", "#f2c230", "#4caf50", "#3b7de0", "#8e44c8"].map((c, i) => `<path d="M462 250 L530 ${216 + i * 10}" stroke="${c}" stroke-width="4"/>`).join("")}`;
    case "villi": return `${[400, 424, 448, 472].map((x, k) => `<path d="M${x} 300 V${236 + (k % 2) * 16} q10 -16 20 0 V300" fill="#FFB7C5" ${o3}/><path d="M${x + 10} 298 V${240 + (k % 2) * 16}" stroke="#FFFDF0" stroke-width="3"/>`).join("")}`;
  }
  return "";
}
function sceneSvg(r, solvedCount) {
  const sc = SCENES[r.scene] || SCENES.library;
  return `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(r.name)}: ${esc(sc.label)} escape room">
    ${sc.draw(r, solvedCount)}
    <g class="obj" data-hs="2" transform="translate(${sc.sp[0]} ${sc.sp[1]})">${sc.stand}${specialSvg(r.special)}</g>
    ${r.boss ? `<defs><radialGradient id="bossGlow" cx=".5" cy=".3" r=".7"><stop offset="0" stop-color="rgba(201,160,255,0)"/><stop offset="1" stop-color="rgba(107,78,140,.45)"/></radialGradient></defs><rect width="800" height="500" fill="url(#bossGlow)" pointer-events="none"/>
      <svg x="456" y="380" width="104" height="104" viewBox="0 0 64 64" aria-hidden="true">${murkSvg("brave").replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</svg>` : ""}
  </svg>`;
}

let R = null, timerId = null, moodTimer = null;
const masteredIn = r => r.pool.filter(p => S.mastered_puzzles.includes(`${r.id}:${p.id}`)).length;
/* Each lock needs 3 questions in a row and has ONE skill strand (SKILLS in skills.js):
   Words, Concepts, See it, Data, Investigate. Questions climb Bloom's levels inside a lock, spelling only
   appears in lock 1 (never the same term twice), and recently seen questions are skipped when possible.
   Pass 1 fills every lock from its own strand; pass 2 fills what is left from the nearest strand (SKILL_NEAR),
   so a short lock never takes questions another lock needs. Gaps are recorded in SKILL_GAPS. */
const LOCK_Q = 3;
const LOCK_SKILLS = SKILL_IDS;
const LOCK_BANDS = [[1, 3], [2, 4], [3, 6]];
const SKILL_GAPS = {};
const termOf = p => p.gen ? p.id.slice(1) : null;   // spell "s7" and spellmc "m7" test the same term
function pickRun(room) {
  const seen = S.seen[room.id] || [], locks = LOCK_SKILLS.map(() => []), used = new Set(), gaps = [];
  const ok = (li, p) => !used.has(p.id) && (p.gen ? li === 0 && !locks[0].some(x => termOf(x) === termOf(p)) : true);
  const take = (li, c) => {
    const [lo, hi] = LOCK_BANDS[locks[li].length]; let band = c.filter(p => p.b >= lo && p.b <= hi); if (!band.length) band = c;
    const fresh = band.filter(p => !seen.includes(p.id)), q = pick(fresh.length ? fresh : band);
    locks[li].push(q); used.add(q.id); return q;
  };
  LOCK_SKILLS.forEach((sk, li) => {
    while (locks[li].length < LOCK_Q) { const c = room.pool.filter(p => ok(li, p) && p.skill === sk); if (!c.length) break; take(li, c); }
  });
  LOCK_SKILLS.forEach((sk, li) => {
    while (locks[li].length < LOCK_Q) {
      let q = null;
      for (const s of SKILL_NEAR[sk]) { const c = room.pool.filter(p => ok(li, p) && p.skill === s); if (c.length) { q = take(li, c); break; } }
      if (!q) { let c = room.pool.filter(p => ok(li, p)); if (!c.length) c = room.pool.filter(p => !p.gen); q = take(li, c); }
      gaps.push({ lock: li, want: sk, got: q.skill });
    }
  });
  const chosen = locks.flatMap(l => l.sort((a, b) => a.b - b.b).map(q => q.id));
  SKILL_GAPS[room.id] = gaps;
  S.seen[room.id] = seen.concat(chosen).slice(-45);
  return chosen;
}
const runQs = room => { const ids = S.room_run[room.id].qids; return [0, 1, 2, 3, 4].map(i => ids.slice(i * LOCK_Q, i * LOCK_Q + LOCK_Q).map(id => room.pool.find(p => p.id === id) || room.pool[0])); };
const stepOf = i => ((S.room_run[R.room.id].steps || {})[i]) || 0;
const curQ = i => R.qs[i][Math.min(LOCK_Q - 1, stepOf(i))];
const akey = i => `${i}_${stepOf(i)}`;
// Themed strand label for lock i (hidden for runs saved before strands existed,
// and for strands the stage has fewer than 3 real questions of: those locks show no label and no "stand-in" tag)
const lockSkill = i => S.room_run[R.room.id].sk && (R.room.skillN || {})[SKILLS[i].id] >= LOCK_Q ? SKILLS[i] : null;
const skillTag = (i, cls = "") => { const k = lockSkill(i); return k ? `<span class="sktag sk-${k.id} ${cls}" title="${esc(k.tip)}">${k.icon} ${esc(k.name)}</span>` : ""; };
function stopTimer() { if (timerId) clearInterval(timerId); timerId = null; }

function enterRoom(id) {
  if (S.playMode === "study") return startStudy(id);   // 📖 Study mode: a calm question series instead of the room
  stopRush();
  const room = ROOMS[roomIndex(id)];
  const replay = S.completed_rooms.includes(room.id);
  if (replay || !S.room_run[room.id]) S.room_run[room.id] = freshRun();
  const rr = S.room_run[room.id];
  // Runs saved before skill strands keep their questions while a lock is part-done; otherwise re-pick by strand.
  const legacy = rr.qids && !rr.sk && !(S.room_progress[room.id] || []).length && !Object.keys(rr.steps || {}).length;
  if (!rr.qids || rr.qids.length !== 5 * LOCK_Q || legacy) { rr.qids = pickRun(room); rr.steps = {}; rr.sk = 1; }
  if (!rr.steps) rr.steps = {};
  HOTSPOTS = (SCENES[room.scene] || SCENES.library).hs; DOOR = (SCENES[room.scene] || SCENES.library).door;
  if (replay) { S.room_progress[room.id] = []; S.room_timer[room.id] = ROOM_SECONDS; }
  if (S.room_timer[room.id] == null) S.room_timer[room.id] = ROOM_SECONDS;
  S.current_room = room.id; save(); MUSIC.setMode(S.playMode === "study" ? "calm" : room.boss ? "boss" : SCENE_SONG[room.scene] || "room");
  if (R) clearTimeout(R.introT);
  if (R) clearTimeout(R.incT);
  R = { room, replay, study: S.playMode === "study", mood: "normal", att: {}, hinted: {}, jam: {}, lastWrongAt: 0, qs: runQs(room), incidents: 0, used: [], stolen: null, hiddenHs: null };
  const me = R; if (!R.study) R.incT = setTimeout(() => tryIncident(me), (replay ? 25 : 40) * 1000 + Math.random() * 40000);
  closeModal(); renderRoom();
  window.scrollTo({ top: 0 });
  stopTimer(); timerId = setInterval(tickTimer, 1000);
  playIntro();
}
function playIntro() {
  const lines = R.room.intro, me = R; let k = 0;
  const step = () => {
    if (R !== me) return;
    const [w, m, t] = lines[k++];
    setLine(w, t, m);
    me.introT = setTimeout(k < lines.length ? step : () => R === me && (R.study ? setLine("chiikawa", "📖 <b>Study mode:</b> no timer, no penalties, no spooky surprises. Take your time, and tap 📓 for the textbook notes whenever you like. Tap a glowing <b>?</b> to start! 🌱", "normal", "hint") : setLine("chiikawa", "<b>Your mission:</b> 🔦 find 3 shimmering specimens in the dark, wire them into the ⚙️ Bio-Machine, open the 5 <b>?</b> locks, then escape through the 🚪! ⚠️ Careful: a wrong answer costs <b>10 seconds</b> and shuffles the lock. Guessing makes the lock <b>slip back a notch</b> (one bonus question to climb back), jams it for a few seconds, costs 🌰 chestnuts and can make the lights go dim. Think first! And watch out for strange happenings in the dark... 👀 (Stuck? Tap 📓 for the textbook notes.)", "normal", "hint")), k < lines.length ? Math.max(2600, Math.min(9000, String(lines[k - 1][2]).replace(/<[^>]+>/g, "").length * 48)) : 3200);
  };
  step();
}
function setLine(who, html, mood = "normal", cls = "") {
  const el = document.getElementById("line"); if (!el) return;
  el.innerHTML = say(who, html, mood, cls);
}
function setMood(m, ms) {
  if (!R) return; R.mood = m;
  const el = document.getElementById("chiiAv"); if (el) el.innerHTML = avatar("chiikawa", m);
  const st = document.getElementById("chiiSt"); if (st) st.textContent = { normal: `${palName()} is ready`, happy: `${palName()} is happy!`, cry: `${palName()} is nervous... 🥺`, shock: `${palName()} is shocked! 😱`, sparkle: `${palName()} is sparkling! ✨`, brave: `${palName()} is being brave! 💪` }[m];
  clearTimeout(moodTimer);
  if (ms) moodTimer = setTimeout(() => R && setMood(S.room_timer[R.room.id] < 120 ? "cry" : "normal"), ms);
}
function tickTimer() {
  if (!R || document.hidden || R.study) return;
  const id = R.room.id, now = Date.now();
  const frozen = R.freezeUntil > now, warp = R.warpUntil > now;
  if (!frozen) S.room_timer[id] -= warp ? 2 : 1;
  const t = S.room_timer[id];
  const el = document.getElementById("timer");
  if (el) { el.textContent = t >= 0 ? fmt(t) : `${"OVERTIME"} ${fmt(t)}`; el.className = "timer" + (t < 0 ? " over" : t < 120 ? " low" : "") + (frozen ? " frozen" : warp ? " warp" : ""); }
  if (t === 120) { setMood("shock"); setLine("chiikawa", "EHHH?! Only 2 minutes left?! 😱", "shock"); }
  if (t === 0) setLine("chiikawa", "Time's up, but don't worry! We can keep going in overtime. No penalty! 🌱");
  if (t > 0 && t <= 10) SFX.tick();
  if (t % 5 === 0) save();
  if (R.blackUntil && now > R.blackUntil) { R.blackUntil = 0; const sc = document.getElementById("scene"); if (sc) { sc.classList.remove("blackout"); sc.style.setProperty("--dim", R.room.dim); } }
}
function renderRoom() {
  renderTools(); renderNav(false);
  const { room } = R;
  const solved = S.room_progress[room.id] || [];
  const t = S.room_timer[room.id];
  $app.innerHTML = `
    <section class="roomhead">
      <div class="status">
        <div class="av ${frameCls()}" id="chiiAv">${avatar("chiikawa", R.mood)}</div>
        <div style="min-width:0"><div class="rtopic">${TOPICS[room.t].icon} ${topicNo(room.topicNo)}: ${esc(room.topic)}</div>
          <div class="rt">${esc(room.name)} ${room.boss ? `<span class="boss-tag">⚔️ BOSS</span>` : ""}</div>
          <div class="stepper" aria-label="${esc(stageLabel(room))}">${topicRooms(room.t).map(x => `<i class="${x.id === room.id ? "cur" : S.completed_rooms.includes(x.id) ? "on" : ""}"></i>`).join("")}<span class="small">${room.boss ? "Boss stage" : `Stage ${room.s}`} of ${topicRooms(room.t).length} · ${esc(room.focus)}</span></div>
          <div class="small" id="chiiSt">${`${palName()} is ready`}</div></div>
      </div>
      <div style="display:grid;justify-items:end;gap:4px">
        ${R.study ? `<div class="timer study" id="timer" title="Study mode: no timer">📖 Study</div>` : `<div class="timer ${t < 0 ? "over" : t < 120 ? "low" : ""}" id="timer" role="timer" aria-label="${"Time left"}">${t >= 0 ? fmt(t) : `${"OVERTIME"} ${fmt(t)}`}</div>`}
        <span class="small">🔓 ${solved.length}/5 ${"locks"} · 🚪 ${solved.length === 5 ? "code ready!" : "door locked"}</span>
        <span class="strikes" id="strikes" ${R.study ? "hidden" : ""} title="${"Guess strikes: 3 strikes = −1 star, 6 strikes = −2 stars"}">⚠️ ${"Strikes"} ${S.room_run[room.id].strikes}</span>
      </div>
    </section>
    ${goalHtml()}
    <div id="line"></div>
    <section class="scene-wrap">
      <div class="scene ${R.blackUntil > Date.now() ? "blackout" : ""}" id="scene" style="--dim:${R.blackUntil > Date.now() ? .94 : room.dim}">
        ${sceneSvg(room, solved.length)}
        <div class="dark"></div>
        ${HOTSPOTS.map((h, i) => {
          const nm = i === 2 ? room.specialName : h.name, done = solved.includes(i);
          if (R.hiddenHs === i && !done) return "";
          return `<button class="hs ${done ? "done" : ""}" data-hs="${i}" style="left:${h.x}%;top:${h.y}%" aria-label="${esc(nm)}${done ? " (solved)" : stepOf(i) ? ` (${stepOf(i)} of ${LOCK_Q} questions done)` : ""}">${done ? "✓" : stepOf(i) ? `<small>${stepOf(i)}/${LOCK_Q}</small>` : "?"}<span class="lbl">${esc(nm)}</span>${done ? "" : skillTag(i, "onhs")}</button>`;
        }).join("")}
        ${R.stolen !== null ? `<button class="hs wolv" data-wolf="1" style="left:${R.wolfX}%;top:${R.wolfY}%" aria-label="${"Catch the wolverine"}">🐾<span class="lbl">${"Wolverine!"}</span></button>` : ""}
        ${specHtml()}
        <button class="hs door" data-hs="door" style="left:${DOOR.x}%;top:${DOOR.y}%" aria-label="${"Exit door"}">🚪<span class="lbl">${"Exit door"}</span></button>
      </div>
    </section>
    <section class="card" style="padding:12px">
      <div class="row" style="justify-content:space-between"><b>🎒 ${"Inventory"}</b><span class="small muted">${"Each item shows one digit of the door code"}</span></div>
      <div class="inv" id="inv">${invHtml()}</div>
    </section>
    <div class="row"><button class="btn plain" id="toMap">← ${"Topic map"}</button><button class="btn blue" id="openJ">📓 Textbook notes for this stage</button></div>`;
  const scene = document.getElementById("scene");
  const move = e => { const b = scene.getBoundingClientRect(); scene.style.setProperty("--sx", `${((e.clientX - b.left) / b.width) * 100}%`); scene.style.setProperty("--sy", `${((e.clientY - b.top) / b.height) * 100}%`); };
  scene.addEventListener("pointermove", move); scene.addEventListener("pointerdown", move);
  $app.querySelectorAll("[data-hs]").forEach(el => el.addEventListener("click", () => { SFX.init(); el.dataset.hs === "door" ? openDoor() : openPuzzle(Number(el.dataset.hs)); }));
  const wolf = $app.querySelector("[data-wolf]"); if (wolf) wolf.onclick = () => { SFX.init(); chaseWolverine(); };
  wireRoom2();
  wireSlots();
  document.getElementById("toMap").onclick = () => { SFX.tap(); save(); renderMap(); };
  document.getElementById("openJ").onclick = () => { SFX.tap(); openJournal(room.id); };
  setLine("chiikawa", "Tap a glowing <b>?</b> to find a puzzle, or sweep the torch for shimmering specimens 🔦.");
}
function wireSlots() { $app.querySelectorAll(".slot.full").forEach(el => el.onclick = () => { SFX.tap(); toast(el.dataset.info); }); }
function itemName(i) { return i === 2 ? R.room.specialName + " charm" : HOTSPOTS[i].itemName; }
function invHtml(newIdx = -1) {
  const solved = S.room_progress[R.room.id] || [];
  return HOTSPOTS.map((h, i) => R.stolen === i
    ? `<div class="slot stolen" aria-label="${"Taken by the wolverine"}"><span style="font-size:1.5rem">🐾</span><span>${"Taken!"}</span><span class="code">#${i + 1} = ?</span></div>`
    : solved.includes(i)
    ? `<button class="slot full ${i === newIdx ? "new" : ""}" data-info="${esc(itemName(i))}: ${"code digit"} #${i + 1} = ${R.room.code[i]}" aria-label="${esc(itemName(i))}: #${i + 1} = ${R.room.code[i]}">${ICONS[h.item]}<span class="nm">${esc(itemName(i))}</span><span class="code">#${i + 1} = ${R.room.code[i]}</span></button>`
    : `<div class="slot" aria-label="${"Empty slot"} ${i + 1}"><span class="muted">#${i + 1}<br>?</span></div>`).join("");
}

/* ----- Puzzle modal ----- */
function openPuzzle(i) {
  const { room } = R;
  const solved = S.room_progress[room.id] || [];
  const hsName = i === 2 ? room.specialName : HOTSPOTS[i].name;
  const line = i === 2 ? room.specialLine : HOTSPOTS[i].line;
  if (solved.includes(i)) { toast(`${hsName}: already solved ✓`); return; }
  const step = stepOf(i), p = curQ(i), k = akey(i);
  SFX.click();
  R.cur = i; R.att[k] = R.att[k] || 0; R.openedAt = Date.now();
  if (R.hiddenHs === i) { R.hiddenHs = null; toast("🔦 Found the hidden lock!"); }
  const typeLabel = { mc: p.gen ? "Spelling check" : p.graph ? "Graph reading" : "Multiple choice", dial: "Combination dials", spell: "Spelling lock" }[p.type];
  const box = openModal(`
    <span class="kicker">${skillTag(i)}${lockSkill(i) && p.skill !== lockSkill(i).id ? ` <span class="skstand" title="This stage is short of ${esc(lockSkill(i).name)} questions">stand-in</span>` : ""} ${typeLabel} · T${room.topicNo} ${room.boss ? "Boss" : `S${room.s}`} ${diffChip(p.b)} ${bmBtn(room.id, p.id)}</span>
    <h2>${esc(hsName)}</h2>
    <div class="lockprog" aria-label="Question ${step + 1} of ${LOCK_Q} for this lock">${Array.from({ length: LOCK_Q }, (_, n) => `<i class="${n < step ? "on" : n === step ? "cur" : ""}"></i>`).join("")}<span class="small"><b>Question ${step + 1} of ${LOCK_Q}</b> to open this lock</span></div>
    ${step ? say("chiikawa", pick(["Keep going! One more click and the lock wiggles... 🔐", "It's working! The lock is loosening! ✨", "Ya...! Almost there! 🥹"]), "brave")
      : room.boss && p.b >= 5 ? say("murk", "A hard one. Think like a scientist: read every choice before you strike. ⚔️", "brave")
      : p.b >= 5 ? say("chiikawa", `${esc(line)} ...Eh?! This one looks HARD! 😱`, "shock") : say("chiikawa", esc(line), p.b >= 3 ? "brave" : "normal")}
    <p class="q">${esc(p.q)}</p>
    ${p.svg ? `<div class="diagram-box">${DIAGRAMS[p.svg]}</div>` : ""}
    <div id="jamBox"></div>
    <div id="ans">${answerUi(p)}</div>
    <div class="row"><button class="btn blue" id="hint">💡 Hint from ${esc(palName())}</button><button class="btn plain" id="pj">📓 Journal</button></div>
    <div class="pwr" id="pwr"></div>
    <div id="pfb"></div>`, { wide: true });
  renderPwr(p, i);
  document.getElementById("hint").onclick = () => { SFX.hint(); markHint(i); document.getElementById("pfb").innerHTML = say("chiikawa", `💡 ${esc(p.hint)}`, "normal", "hint"); };
  document.getElementById("pj").onclick = () => { SFX.tap(); openJournal(room.id, termsIn(room, p)); };
  wireAnswer(p, box);
  if (R.jam[i] > Date.now()) startJam(i, 0);
  if (R.noHintUntil > Date.now()) { const h = document.getElementById("hint"); h.disabled = true; h.textContent = `😴 ${palName()} is sleepy...`; }
  if (R.fog) { R.fog = false; fogAnswers(); }
  if (p.type === "spell" && !(R.jam[i] > Date.now())) setTimeout(() => { const s = document.getElementById("spIn"); if (s) s.focus({ preventScroll: true }); }, 60);
}
function fogAnswers() {
  const ans = document.getElementById("ans"), jb = document.getElementById("jamBox"); if (!ans) return;
  ans.inert = true; ans.classList.add("fogged"); let left = 6;
  const tick = () => {
    if (!document.getElementById("ans")) return;
    if (left <= 0) { ans.classList.remove("fogged"); if (!(R.jam[R.cur] > Date.now())) ans.inert = false; if (jb && jb.dataset.fog) { jb.innerHTML = ""; delete jb.dataset.fog; } return; }
    if (jb && !jb.innerHTML) jb.dataset.fog = "1";
    if (jb && jb.dataset.fog) jb.innerHTML = `<div class="jam fogbox"><b>🌫️ ${"The fog is clearing..."}</b><span class="jt">${left}s</span><span class="small">${"Read the question carefully while you wait."}</span></div>`;
    left--; setTimeout(tick, 1000);
  };
  tick();
}
function renderPwr(p, i) {
  const el = document.getElementById("pwr"); if (!el) return; if (R.study) { el.innerHTML = `<span class="small muted">📖 Study mode: power-ups rest while you study.</span>`; return; }
  const n = k => S.power[k] || 0;
  el.innerHTML = `<b class="small">🎒 ${"Power-ups"}:</b>
    <button class="btn" data-pw="torch" ${n("torch") ? "" : "disabled"} title="${esc(POWERUPS[0].desc)}">🔦 ${POWERUPS[0].name} ×${n("torch")}</button>
    <button class="btn" data-pw="crystal" ${n("crystal") ? "" : "disabled"} title="${esc(POWERUPS[1].desc)}">⏳ +60s ×${n("crystal")}</button>
    <button class="btn" data-pw="guard" ${n("guard") && !R.guard ? "" : "disabled"} title="${esc(POWERUPS[2].desc)}">🛡️ ${R.guard ? "Guard ready!" : `${POWERUPS[2].name} ×${n("guard")}`}</button>`;
  el.querySelectorAll("[data-pw]").forEach(b => b.onclick = () => usePower(b.dataset.pw, p, i));
}
function usePower(k, p, i) {
  if (!(S.power[k] > 0)) return;
  const box = document.getElementById("mbox");
  if (k === "torch") {
    if (p.type === "mc") {
      const opts = [...box.querySelectorAll(".choice")].filter(b => !b.disabled && Number(b.dataset.i) !== p.answer);
      if (!opts.length) { toast("Nothing left to remove!"); return; }
      const b = pick(opts); b.disabled = true; b.classList.add("wrong"); b.style.textDecoration = "line-through";
    } else if (p.type === "spell") {
      const inp = document.getElementById("spIn"), w = p.answer, typed = normWord(inp.value), tgt = normWord(w);
      let n = 0; while (n < typed.length && typed[n] === tgt[n]) n++;
      if (n >= tgt.length) { toast("The word is complete. Try the lock!"); return; }
      let out = "", c = 0; for (const ch of w) { if (c >= n + 1) break; out += ch; if (/[a-z]/i.test(ch)) c++; }
      inp.value = out; inp.dispatchEvent(new Event("input")); inp.focus();
    } else {
      const wrong = p.dials.map((_, d) => d).filter(d => R.dialPos[d] !== p.answer[d]);
      if (!wrong.length) { toast("All dials are already right. Try the lock!"); return; }
      const d = pick(wrong); setDial(d, p.answer[d], p);
    }
    markHint(i); toast("🔦 The torch shows the way!");
  } else if (k === "crystal") {
    S.room_timer[R.room.id] += 60; updateTimerEl(); penaltyFlash("+60s ⏳");
  } else if (k === "guard") { R.guard = true; toast("🛡️ Your next wrong answer is protected."); }
  S.power[k] -= 1; SFX.item(); save(); renderPwr(p, i);
}
function setDial(d, v, p) {
  R.dialPos[d] = v; const f = document.getElementById("face" + d); if (!f) return;
  f.textContent = p.dials[d][v]; f.classList.remove("spin"); void f.offsetWidth; f.classList.add("spin");
}
function updateTimerEl() {
  const tEl = document.getElementById("timer"); if (!tEl || !R || R.study) return;
  const t = S.room_timer[R.room.id]; tEl.textContent = t >= 0 ? fmt(t) : `${"OVERTIME"} ${fmt(t)}`; tEl.className = "timer" + (t < 0 ? " over" : t < 120 ? " low" : "");
}
function dimLights() {
  if (!R) return; R.dimUntil = Date.now() + MAX_WAIT * 1000;
  const sc = document.getElementById("scene"); if (sc) sc.style.setProperty("--dim", Math.min(.9, R.room.dim + .25));
  const me = R; setTimeout(() => { if (R === me) { const s2 = document.getElementById("scene"); if (s2) s2.style.setProperty("--dim", R.room.dim); } }, MAX_WAIT * 1000);
}
function markHint(i) { R.hinted[akey(i)] = true; S.room_run[R.room.id].hints = true; save(); }
/* Anti-guessing: a lock jams for a while after a guess, and the hint must be read. */
function startJam(i, secs, reason) {
  if (secs) R.jam[i] = Date.now() + secs * 1000;
  const ans = document.getElementById("ans"), jb = document.getElementById("jamBox");
  if (!ans || !jb) return;
  ans.inert = true; ans.classList.add("jammed");
  const p = R.qs[i];
  const tick = () => {
    if (R.cur !== i || !document.getElementById("jamBox")) return;
    const left = Math.ceil((R.jam[i] - Date.now()) / 1000);
    if (left <= 0) { ans.inert = false; ans.classList.remove("jammed"); jb.innerHTML = ""; SFX.click(); return; }
    jb.innerHTML = `<div class="jam" role="status"><b>🔒 ${esc(reason || R.jamReason || "Lock jammed!")}</b><span class="jt">${left}s</span>
      <span class="small">${"Use this time to read the hint below or open the 📓 Journal."}</span></div>`;
    setTimeout(tick, 250);
  };
  R.jamReason = reason || R.jamReason;
  tick();
}
function penaltyFlash(text) {
  if (reduced()) { toast(text); return; }
  const d = document.createElement("div"); d.className = "penalty"; d.textContent = text;
  document.body.appendChild(d); setTimeout(() => d.remove(), 1150);
}
function answerUi(p) {
  // Label-style choices (A, B, Cell C...) show in sorted order; everything else is shuffled
  if (p.type === "mc") { const idx = p.choices.map((_, i) => i), order = p.fix ? idx.sort((a, b) => p.choices[a].localeCompare(p.choices[b])) : shuffle(idx);
    return `<div class="choices">${order.map((i, n) => `<button class="choice" data-i="${i}"><b>${"ABCD"[n]}</b><span>${esc(p.choices[i])}</span></button>`).join("")}</div>`; }
  if (p.type === "keypad") return `<div class="keypad"><div class="kdisplay" aria-live="polite"><span id="kd">_</span>${p.unit ? `<span class="u">${esc(p.unit)}</span>` : ""}</div>
    <div class="keys">${["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "⌫"].map(k => `<button class="key ${k === "⌫" ? "del" : ""}" data-k="${k}" aria-label="${k === "⌫" ? "Delete" : k === "." ? "Decimal point" : k}">${k}</button>`).join("")}</div>
    <button class="btn" id="kok" style="width:min(208px,100%)">Unlock 🔓</button></div>`;
  if (p.type === "spell") return `<div class="spell"><div class="sboxes" id="sBoxes" aria-hidden="true">${spellBoxes(p.answer, "")}</div>
    <p class="small muted">${countLetters(p.answer)} letters · starts with “${esc(p.answer[0].toUpperCase())}”. British or American spelling are both fine. ${TTS.ok ? `Hear it: ${sayBtns(p.answer)}` : ""}</p>
    <div class="row"><input id="spIn" class="name" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Type the biology term"><button class="btn" id="spOk">Try the lock 🔓</button></div></div>`;
  // Dials start at random positions (never all correct)
  const start = p.dials.map(o => Math.floor(Math.random() * o.length));
  if (start.every((v, d) => v === p.answer[d])) start[0] = (start[0] + 1) % p.dials[0].length;
  R.dialStart = start;
  return `<div class="dials">${p.dials.map((opts, d) => `<div class="dial">${p.labels ? `<span class="dlabel">${esc(p.labels[d])}</span>` : ""}<button class="arr" data-d="${d}" data-dir="-1" aria-label="Previous option">▲</button>
    <div class="face" id="face${d}" aria-live="polite">${esc(opts[start[d]])}</div><button class="arr" data-d="${d}" data-dir="1" aria-label="${"Next option"}">▼</button></div>`).join("")}</div>
    <div class="row" style="justify-content:center"><button class="btn" id="dok">${"Try the lock 🔓"}</button></div>`;
}
function wireAnswer(p, box) {
  if (p.type === "spell") {
    const inp = document.getElementById("spIn");
    inp.oninput = () => { document.getElementById("sBoxes").innerHTML = spellBoxes(p.answer, inp.value); };
    const go = () => {
      if (!normWord(inp.value)) { toast("Type the word first ✏️"); return; }
      if (sameSpelling(inp.value, p.answer)) { inp.disabled = true; document.getElementById("spOk").disabled = true; solve(); }
      else { if (soClose(inp.value, p.answer)) toast("🤏 So close! Just a letter or two off."); addMissedWord(p.answer); miss(box); }
    };
    document.getElementById("spOk").onclick = go;
    inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); go(); } });
    return;
  }
  if (p.type === "mc") {
    box.querySelectorAll(".choice").forEach(b => b.onclick = () => {
      if (Number(b.dataset.i) === p.answer) { b.classList.add("right"); box.querySelectorAll(".choice").forEach(x => (x.disabled = true)); solve(); }
      else { b.classList.add("wrong"); b.disabled = true; miss(box); }
    });
  } else if (p.type === "keypad") {
    let v = "", done = false;
    const show = () => (document.getElementById("kd").textContent = v || "_");
    const press = k => { if (done) return; SFX.beep(); if (k === "⌫") v = v.slice(0, -1); else if (v.length < 7 && !(k === "." && v.includes("."))) v += k; show(); };
    box.querySelectorAll(".key").forEach(b => b.onclick = () => press(b.dataset.k));
    const ok = () => {
      if (done) return;
      const n = parseFloat(v); if (Number.isNaN(n)) { toast("Type a number first 🙂"); return; }
      if (Math.abs(n - p.answer) <= p.tol + 1e-9) { done = true; box.querySelectorAll(".key,#kok").forEach(x => (x.disabled = true)); solve(); }
      else { miss(box); v = ""; show(); }
    };
    document.getElementById("kok").onclick = ok;
    box.onkeydown = e => { if (R.jam[R.cur] > Date.now()) return; if (/^[0-9.]$/.test(e.key)) press(e.key); else if (e.key === "Backspace") press("⌫"); else if (e.key === "Enter" && e.target.id !== "collect") { e.preventDefault(); ok(); } };
  } else {
    const pos = (R.dialStart || p.dials.map(() => 0)).slice(); R.dialPos = pos;
    box.querySelectorAll(".arr").forEach(b => b.onclick = () => {
      const d = Number(b.dataset.d), n = p.dials[d].length;
      pos[d] = (pos[d] + Number(b.dataset.dir) + n) % n; SFX.click();
      setDial(d, pos[d], p);
    });
    document.getElementById("dok").onclick = () => { if (pos.every((x, i) => x === p.answer[i])) { box.querySelectorAll(".arr,#dok").forEach(x => (x.disabled = true)); solve(); } else miss(box); };
  }
}
function miss(box) {
  const i = R.cur, id = R.room.id, now = Date.now(), p = curQ(i), k = akey(i), run = S.room_run[id];
  R.att[k] = (R.att[k] || 0) + 1; S.stats.run = 0; noteMistake(id, p.id);
  box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake");
  // Guard charm: blocks every penalty for this one wrong answer
  if (R.guard) {
    R.guard = false; R.lastWrongAt = now; SFX.hint(); save(); renderPwr(p, i);
    document.getElementById("pfb").innerHTML = `<div class="fb no">${say("chiikawa", `${"🛡️ The Guard charm blocked the penalty! Not the right answer though."} 💡 ${esc(p.hint)}`, "normal", "hint")}</div>`;
    return;
  }
  // Study mode: no penalties at all. Just a gentle hint, and the explanation after a second miss.
  if (R.study) {
    SFX.wrong(); setMood("cry", 2000); save();
    document.getElementById("pfb").innerHTML = `<div class="fb no">${say("chiikawa", R.att[k] >= 2 ? "Uu... still not it. Let's read why together. 📖" : pick(["Hmm... not quite! 🥺", "Eh? Not that one... 💦", "Almost! Let's think again. 🌱"]), "cry")}
      ${say("chiikawa", `💡 ${esc(p.hint)}${R.att[k] >= 2 && p.explain ? `<br><br>📖 <b>Why:</b> ${esc(p.explain)}` : ""}`, "normal", "hint")}</div>`;
    return;
  }
  // Guessing = a wrong answer within 5 s of opening the lock, or within 4 s of the last wrong answer
  const fast = now - R.openedAt < 5000 || (R.lastWrongAt && now - R.lastWrongAt < 4000);
  R.lastWrongAt = now;
  const [rw, rm, rt] = fast ? ["chiikawa", "cry", "Wah...! That was too fast! Did we guess? 😭"] : R.att[k] >= 2 ? ["chiikawa", "cry", "Wah...! Wrong again... uuu... 😭"] : pick(REACT.wrong);
  SFX.wrong(); setMood(rm === "shock" ? "shock" : "cry", 2500);
  const hit = [];
  // Penalty 1: time
  S.room_timer[id] -= TIME_FINE; penaltyFlash(`−${TIME_FINE}s ⏱️`); updateTimerEl(); hit.push(`⏱️ −${TIME_FINE} seconds`);
  // Penalty 2: the lock reshuffles, so tapping the next option doesn't work
  if (p.type === "mc") {
    const wrap = box.querySelector(".choices"); const kids = shuffle([...wrap.children]);
    kids.forEach((k, n) => { wrap.appendChild(k); k.querySelector("b").textContent = "ABCD"[n]; });
    hit.push("🔀 answers shuffled");
  } else if (p.type === "spell") {
    const inp = document.getElementById("spIn"); if (inp) { inp.value = ""; inp.dispatchEvent(new Event("input")); }
    hit.push("✏️ letters cleared");
  } else if (p.type === "dial") {
    const spun = p.dials.map(o => Math.floor(Math.random() * o.length));
    if (spun.every((v, d) => v === p.answer[d])) spun[0] = (spun[0] + 1) % p.dials[0].length;
    spun.forEach((v, d) => setDial(d, v, p));
    hit.push("🌀 dials spun");
  }
  // Penalty 3: guessing or a repeat miss jams the lock, adds a strike and costs chestnuts
  let jam = 0, reason = "";
  if (fast) { jam = MAX_WAIT; reason = "Guessing detected! Lock jammed"; }
  else if (R.att[k] >= 2) { jam = Math.min(MAX_WAIT, 5 + 5 * (R.att[k] - 1)); reason = "Wrong again! Lock jammed"; }
  // Penalty 3b: guessing, or a 3rd miss on the same question, makes the lock slip back a notch.
  // The student must answer one extra (fresh) question to climb back: more practice, not more waiting.
  const slipped = (fast || R.att[k] >= 3) && stepOf(i) > 0 && slipLock(i);
  if (slipped) hit.push("🔙 lock slipped back a notch (+1 bonus question)");
  if (jam) {
    run.strikes += 1; markHint(i); SFX.door(); hit.push(`🔒 jammed ${jam}s`, "⚠️ strike +1");
    if (S.coins > 0) { const fine = Math.min(S.coins, 3); S.coins -= fine; hit.push(`🌰 −${fine}`); renderTools(); }
    // Penalty 4: every 3rd strike, the lights flicker and the room goes dim
    if (run.strikes % 3 === 0) { dimLights(); hit.push(`🌑 lights dimmed for ${MAX_WAIT} s`); }
  }
  save();
  const st = document.getElementById("strikes"); if (st) st.textContent = `⚠️ ${"Strikes"} ${run.strikes}`;
  const warn = run.strikes >= 6 ? "You've lost 2 stars in this stage." : run.strikes >= 3 ? "3+ strikes: this stage loses 1 star." : `${3 - run.strikes} more strike${3 - run.strikes === 1 ? "" : "s"} and this stage loses a star.`;
  document.getElementById("pfb").innerHTML = `<div class="fb no">
    ${say(rw, rt, rm)}
    <div class="rules"><b>${"Penalties"}:</b> ${hit.join(" · ")}${jam ? `<br>${warn}` : ""}</div>
    ${slipped ? `<div class="row" style="justify-content:center"><button class="btn blue" id="slipGo">🔙 Try the bonus question</button></div>` : ""}
    ${say("chiikawa", `${jam ? "Let's slow down and read carefully. It'll work out~!" : "Don't worry! We can figure this out together."} 💡 ${esc(p.hint)}`, "normal", "hint")}
    ${R.att[k] >= 2 ? (b => say(b[0], b[2], b[1]))(pick(REACT.brave)) : ""}</div>`;
  if (jam) startJam(i, jam, reason);
  if (slipped) {
    const ans = document.getElementById("ans"); if (ans) ans.inert = true;
    document.getElementById("slipGo").onclick = () => { SFX.tap(); openPuzzle(i); };
  }
}
/* Lock slip: step back one notch and swap in a fresh question of the same strand and a similar level for that step. */
function slipLock(i) {
  const run = S.room_run[R.room.id], s = stepOf(i) - 1, old = R.qs[i][s], used = R.qs.flat().map(q => q.id);
  const okQ = q => !used.includes(q.id) && (q.gen ? i === 0 && !R.qs[i].some(x => termOf(x) === termOf(q)) : true);
  let c = R.room.pool.filter(q => okQ(q) && q.skill === old.skill && Math.abs(q.b - old.b) <= 1);
  if (!c.length) c = R.room.pool.filter(q => okQ(q) && q.skill === old.skill);
  if (!c.length) c = R.room.pool.filter(q => !used.includes(q.id) && !q.gen && Math.abs(q.b - old.b) <= 1);
  if (!c.length) c = R.room.pool.filter(q => !used.includes(q.id) && !q.gen);
  if (!c.length) return false;
  const nq = pick(c);
  R.qs[i][s] = nq; run.qids[i * LOCK_Q + s] = nq.id; run.steps[i] = s;
  const nk = `${i}_${s}`; delete R.att[nk]; delete R.hinted[nk];
  save(); return true;
}
function solve() {
  const { room } = R, i = R.cur, step = stepOf(i), p = curQ(i), k = akey(i);
  const firstTry = !R.att[k] && !R.hinted[k], pid = `${room.id}:${p.id}`, run = S.room_run[room.id];
  const qc = answerCoins(pid, firstTry);
  if (firstTry && !S.mastered_puzzles.includes(pid)) S.mastered_puzzles.push(pid);
  if (firstTry && !run.firsts.includes(k)) run.firsts.push(k);
  noteRight(room.id, p.id, firstTry);
  S.stats.correct += 1;
  if (p.type === "spell" || p.gen) S.stats.spellRight += 1;
  if (p.graph && firstTry) S.stats.graphFirst += 1;
  S.stats.run = firstTry ? S.stats.run + 1 : 0; S.stats.bestRun = Math.max(S.stats.bestRun, S.stats.run);
  const last = step >= LOCK_Q - 1;
  if (last) { const solved = S.room_progress[room.id] || []; if (!solved.includes(i)) solved.push(i); S.room_progress[room.id] = solved; }
  else run.steps[i] = step + 1;
  recomputeMastery(); save(true); if (qc) gainCoins(qc, "", document.querySelector(".modal .choice.right, #mbox h2"));
  SFX.right(); if (last) setTimeout(() => yaha(), 150); setMood(firstTry ? "sparkle" : "happy", 4000);
  const [cw, cm, ct] = S.stats.run >= 3 ? ["chiikawa", "sparkle", `${S.stats.run} first-try answers in a row?! You're almost as amazing as me! 💜`] : firstTry ? pick(REACT.right) : ["chiikawa", "happy", "Phew... we got it! 🥹"];
  const kt = termsIn(room, p).map(t => room.terms.find(x => x[0] === t));
  setTimeout(checkTrophies, 1400);
  if (firstTry) confetti(last ? 40 : 20);
  document.getElementById("hint").hidden = true;
  const lp = document.querySelector(".lockprog"); if (lp) lp.querySelectorAll("i")[step].className = "on";
  document.getElementById("pfb").innerHTML = `<div class="fb ok">
    ${say(cw, `${esc(ct)} <b>${firstTry ? `First try! Mastery up 📈 +${qc} 🌰` : "Correct! ✔️ (first-try answers earn 🌰)"}</b>`, cm)}
    <p>${esc(p.explain)}</p>
    ${p.tip ? `<p class="tip"><b>📝 Top tip:</b> ${esc(p.tip)}</p>` : ""}
    ${kt.length ? `<div class="terms">${kt.map(([t, m]) => `<span class="term"><b>${esc(t)}</b><span class="def">${esc(m)}</span></span>`).join("")}</div>` : ""}
    ${last ? `<div class="found">${ICONS[HOTSPOTS[i].item]}<span>Lock open! You found: <b>${esc(itemName(i))}</b>. Code digit #${i + 1} = <b>${room.code[i]}</b></span></div>
    <div class="row"><button class="btn big" id="collect">Collect item ✨</button></div>`
    : `<div class="row"><button class="btn big" id="collect">Next question (${step + 2}/${LOCK_Q}) →</button><span class="small muted">${LOCK_Q - step - 1} more to open this lock</span></div>`}</div>`;
  const c = document.getElementById("collect"); c.focus({ preventScroll: true });
  document.getElementById("pfb").scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "nearest" });
  if (last) { $modal._close = () => collect(i); c.onclick = () => collect(i); }
  else {
    $modal._close = () => { closeModal(); renderRoom(); };
    c.onclick = () => { SFX.tap(); if (R.jam[i] > Date.now()) R.jam[i] = 0; openPuzzle(i); };
  }
}
function collect(i) {
  if (!R) return;
  SFX.item(); closeModal(); renderRoom();
  document.getElementById("inv").innerHTML = invHtml(i); wireSlots();
  const n = (S.room_progress[R.room.id] || []).length;
  if (n < 5 && R.incidents < 3 && Math.random() < (R.replay ? 0.55 : 0.4)) { const me = R; setTimeout(() => tryIncident(me), 1500); }
  if (n === 5) setLine("chiikawa", specRun().power ? "All 5 code digits found and the power is on! Tap the 🚪 <b>exit door</b>!" : "All 5 code digits found! But the door has no power yet: find the 🔦 specimens and fix the ⚙️ Bio-Machine.");
  else setLine("chiikawa", `Ya...! ${5 - n} more lock${5 - n === 1 ? "" : "s"} to go! 🔍`, "happy");
}

/* ----- Exit door ----- */
function openDoor() {
  const { room } = R;
  const solved = S.room_progress[room.id] || [];
  if (R.stolen !== null) { SFX.wrong(); setMood("cry", 2000); setLine("chiikawa", `The wolverine still has item #${R.stolen + 1}! Tap the 🐾 to catch it first.`, "cry"); return; }
  if (solved.length < 5) { SFX.wrong(); setMood("cry", 2000); setLine("chiikawa", `The door needs a 5-digit code... We have ${solved.length}/5 digits. Let's open more locks! 🔍`, "cry"); return; }
  if (!specRun().power) { SFX.wrong(); setMood("shock", 2000); setLine("chiikawa", `The keypad is dark... the door has <b>no power</b>! 😱 Find the 3 shimmering specimens 🔦 (${specRun().found.length}/3) and fix the ⚙️ Bio-Machine.`, "shock"); return; }
  SFX.click();
  const box = openModal(`
    <span class="kicker">${"Exit door · Keypad"}</span>
    <h2>🚪 ${"Enter the door code"}</h2>
    ${say("chiikawa", "Use the digits on your items, in order #1 → #5.", "normal", "hint")}
    <div class="row" style="justify-content:center">${HOTSPOTS.map((h, i) => `<span class="tag">#${i + 1} = ${room.code[i]}</span>`).join("")}</div>
    <div class="keypad"><div class="kdisplay"><span id="kd">_</span></div>
    <div class="keys">${["7", "8", "9", "4", "5", "6", "1", "2", "3", "", "0", "⌫"].map(k => k ? `<button class="key ${k === "⌫" ? "del" : ""}" data-k="${k}" aria-label="${k === "⌫" ? "Delete" : k}">${k}</button>` : "<span></span>").join("")}</div>
    <button class="btn" id="kok" style="width:min(208px,100%)">${"Open the door 🔓"}</button></div>
    <div id="pfb"></div>`);
  let v = "";
  const show = () => (document.getElementById("kd").textContent = v || "_");
  const press = k => { SFX.beep(); if (k === "⌫") v = v.slice(0, -1); else if (v.length < 5) v += k; show(); };
  box.querySelectorAll(".key").forEach(b => b.onclick = () => press(b.dataset.k));
  const ok = () => {
    if (v === room.code) { closeModal(); escapeRoom(); }
    else { SFX.wrong(); box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake"); v = ""; show(); document.getElementById("pfb").innerHTML = say("chiikawa", "Wah... wrong code! Type the digits in order #1 → #5. 🎒", "cry"); }
  };
  document.getElementById("kok").onclick = ok;
  box.onkeydown = e => { if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === "Backspace") press("⌫"); else if (e.key === "Enter") { e.preventDefault(); ok(); } };
}
function escapeRoom() {
  const { room } = R, T = TOPICS[room.t];
  stopTimer(); clearTimeout(R.introT);
  const tLeft = S.room_timer[room.id], used = ROOM_SECONDS - tLeft;
  const first = !S.completed_rooms.includes(room.id);
  if (first) { S.completed_rooms.push(room.id); S.inventory.push(room.item); }
  const topicDone = first && stagesDone(room.t) === topicRooms(room.t).length && !S.chiikawa_badges.includes(T.badge);
  if (topicDone) S.chiikawa_badges.push(T.badge);
  const run = S.room_run[room.id] || freshRun();
  const n = run.firsts.length, base = n >= 13 ? 3 : n >= 9 ? 2 : 1;
  const lost = run.strikes >= 6 ? 2 : run.strikes >= 3 ? 1 : 0;
  const stars = Math.max(1, base - lost);
  S.room_stars[room.id] = Math.max(S.room_stars[room.id] || 0, stars);
  if (!first) S.stats.replays += 1;
  const revise = !first && S.last_revise_day !== today(); if (revise) S.last_revise_day = today();
  const earned = withStreak(first ? (room.boss ? 50 : 30) : revise ? 25 : 10); S.coins = (S.coins || 0) + earned; R.done = true; clearTimeout(R.incT);
  if (!R.study && tLeft >= 0 && run.strikes === 0) S.stats.cleanEscapes += 1;
  if (!R.study) { S.stats.escClears += 1; if (room.boss) S.stats.escBosses += 1; if (!run.hints) S.stats.escNoHint += 1; }
  const gotSick = maybeGetSick(.08);
  if (!run.hints) S.stats.noHintEscapes += 1;
  if (new Date().getHours() >= 21) S.stats.night += 1;
  const caps = first ? (room.boss ? 2 : 1) : Math.random() < .4 ? 1 : 0; S.coll.pending += caps;
  S.room_run[room.id] = freshRun();
  S.room_timer[room.id] = ROOM_SECONDS;
  const ni = nextRoomIndex(); S.current_room = ni === -1 ? room.id : ROOMS[ni].id;
  const nxt = ni === -1 ? null : ROOMS[ni];
  recomputeMastery(); save(true);
  activityDone({ mode: R.study ? "study" : "escape", room, done: true, fresh: first, ans: run.qids ? run.qids.length : 5 * LOCK_Q, cor: n, stars, secs: Math.max(0, used),
    ids: (run.qids || []).join(" "), wrong: Object.keys(S.mistakes).filter(k => k.startsWith(room.id + ":")).map(k => k.split(":")[1]).join(" ") });
  SFX.door();
  document.getElementById("doorG").classList.add("door-open");
  setMood("sparkle"); setLine("chiikawa", "WAHOO!!! The door is opening!!! 🎊", "happy");
  setTimeout(() => {
    SFX.fanfare(); confetti(topicDone ? 260 : 180); yaha(topicDone ? "Topic cleared!!" : "Wahoo!!");
    openModal(`
      <span class="kicker">Escaped! · ${esc(stageLabel(room))}</span>
      <h2>${R.study ? `📖 You studied ${esc(stageName(room))}!` : `🎉 You escaped ${esc(room.name)}!`}</h2>
      <div class="cast" style="margin:0">${["chiikawa"].map(w => `<div class="fig" style="width:90px">${figure(w, w === "chiikawa" ? "sparkle" : "happy")}</div>`).join("")}</div>
      <div class="row" style="justify-content:center;font-size:1.8rem" aria-label="${stars} / 3 ★">${starStr(stars)}</div>
      <p style="text-align:center"><b>${n}/${5 * LOCK_Q}</b> questions right first try${R.study ? " · 📖 Study mode" : ` · ⏱️ ${fmt(Math.max(0, used))}${tLeft < 0 ? " (overtime)" : ""} · ⚠️ ${run.strikes} strike${run.strikes === 1 ? "" : "s"}`}</p>
      <p style="text-align:center"><span class="pill coinpill">+${earned} 🌰 chestnuts${revise ? " · 📚 daily revision bonus!" : ""}${multTag()}</span>${caps ? ` <span class="pill rpill">🎁 +${caps} capsule${caps > 1 ? "s" : ""}</span>` : ""}${R.incidents ? ` <span class="pill">👻 Incidents survived: ${R.incidents}</span>` : ""}</p>
      ${lost ? `<div class="rules">Guess strikes cost you <b>${lost} star${lost > 1 ? "s" : ""}</b> this time. Replay the stage and think before answering to win them back!</div>` : ""}
      ${room.boss && first ? say("murk", "...Hmph. Not bad. You have the heart of a true biologist. ⚔️", "happy") : ""}
      ${topicDone ? say("chiikawa", `TOPIC ${T.no} CLEARED! You earned <b>${esc(T.badge)}</b>! Everyone is crying happy tears! 💜🥹`, "sparkle") : first ? say("chiikawa", `You earned <b>${esc(room.item)}</b>! 💜`, "happy") : say("chiikawa", "Replay complete. Practice makes the brain strong. 🍵", "happy")}
      <section class="card cream jsec"><h3>📖 Textbook recap: ${esc(room.focus)}</h3><ul>${room.notes.map(x => `<li>${x}</li>`).join("")}</ul></section>
      ${gotSick ? say("chiikawa", "Achoo...! I don't feel so good... 🤒 Can we visit the clinic on the Home screen?", "sick") : ""}
      ${say("chiikawa", !nxt ? "That was the final stage of every topic. You've explored every corner of the biology world! 🌟" : `That's today's mission done! 🌱 Rest your brain, or keep going if you feel great. Next: <b>${esc(stageLabel(nxt))}: ${esc(nxt.name)}</b>.`, "happy", "hint")}
      <div class="row">${caps ? `<button class="btn pink" id="eCap">🎁 Open capsule</button>` : ""}<button class="btn big" id="eMap">Back to the map</button>${nxt ? `<button class="btn blue" id="eNext">▶ Next stage</button>` : ""}<button class="btn yellow" id="eCode">🔑 Get my save code</button></div>`, { onClose: renderMap });
    document.getElementById("eMap").onclick = () => { SFX.tap(); closeModal(); renderMap(); };
    if (nxt) document.getElementById("eNext").onclick = () => { SFX.tap(); closeModal(); enterRoom(nxt.id); };
    const ec = document.getElementById("eCap"); if (ec) ec.onclick = () => { SFX.tap(); closeModal(); renderMap(); openCapsule(); };
    document.getElementById("eCode").onclick = () => { SFX.tap(); renderMap(); openSaveModal(); };
    setTimeout(checkTrophies, 1800);
  }, reduced() ? 100 : 1000);
}

/* ============================================================
   9b. Random incidents: spooky-but-friendly events that change the rules for a while
   ============================================================ */
const CREATURES = {
  wolverine: `<svg viewBox="0 0 160 110" aria-hidden="true"><ellipse cx="80" cy="72" rx="58" ry="30" fill="#6B4A36" stroke="${INK}" stroke-width="3"/><path d="M40 60 Q80 40 120 60" stroke="#E8C79A" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="36" cy="58" r="24" fill="#6B4A36" stroke="${INK}" stroke-width="3"/><circle cx="24" cy="38" r="7" fill="#6B4A36" stroke="${INK}" stroke-width="3"/><circle cx="46" cy="37" r="7" fill="#6B4A36" stroke="${INK}" stroke-width="3"/><circle cx="28" cy="56" r="4" fill="#FDFFB6"/><circle cx="44" cy="56" r="4" fill="#FDFFB6"/><circle cx="36" cy="66" r="3" fill="${INK}"/><path d="M130 70 q22 -4 24 -18" stroke="#6B4A36" stroke-width="10" fill="none" stroke-linecap="round"/><rect x="92" y="84" width="22" height="16" rx="4" fill="#FDFFB6" stroke="${INK}" stroke-width="2.5"/></svg>`,
  shadow: `<svg viewBox="0 0 160 120" aria-hidden="true"><path d="M30 110 Q20 30 80 18 Q140 30 130 110 Q115 98 105 110 Q92 96 80 110 Q68 96 55 110 Q45 98 30 110Z" fill="#120e17" stroke="#6B4E8C" stroke-width="3"/><ellipse cx="62" cy="56" rx="9" ry="12" fill="#fff"/><ellipse cx="98" cy="56" rx="9" ry="12" fill="#fff"/><circle cx="64" cy="58" r="4" fill="#C9A0FF"/><circle cx="100" cy="58" r="4" fill="#C9A0FF"/></svg>`,
  owl: `<svg viewBox="0 0 140 130" aria-hidden="true"><ellipse cx="70" cy="75" rx="45" ry="48" fill="#A98B6B" stroke="${INK}" stroke-width="3"/><path d="M30 40 L40 18 L55 35 M110 40 L100 18 L85 35" fill="#A98B6B" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="52" cy="62" r="17" fill="#FFFDF0" stroke="${INK}" stroke-width="3"/><circle cx="88" cy="62" r="17" fill="#FFFDF0" stroke="${INK}" stroke-width="3"/><circle cx="52" cy="62" r="8" fill="${INK}"/><circle cx="88" cy="62" r="8" fill="${INK}"/><circle cx="55" cy="59" r="3" fill="#fff"/><circle cx="91" cy="59" r="3" fill="#fff"/><path d="M64 80 L70 92 L76 80Z" fill="#F5C542" stroke="${INK}" stroke-width="2"/><path d="M48 100 q22 12 44 0" stroke="#E8D5B7" stroke-width="6" fill="none"/></svg>`,
  bulb: `<svg viewBox="0 0 120 130" aria-hidden="true"><circle cx="60" cy="52" r="36" fill="#3A3145" stroke="#6B4E8C" stroke-width="3"/><path d="M44 50 l8 10 8 -14 8 14 8 -10" stroke="#FF6B6B" stroke-width="3" fill="none"/><rect x="44" y="88" width="32" height="22" rx="4" fill="#7A6A66" stroke="${INK}" stroke-width="3"/><path d="M20 20 l10 8 M100 20 l-10 8 M60 4 v10" stroke="#C9A0FF" stroke-width="3" stroke-linecap="round"/></svg>`,
  fog: `<svg viewBox="0 0 160 100" aria-hidden="true"><path d="M20 70 q20 -30 45 -12 q15 -28 45 -8 q30 -6 30 20 q10 20 -15 22 H30 q-22 -2 -10 -22Z" fill="#8E93A8" stroke="#C9CCD8" stroke-width="3"/><circle cx="60" cy="62" r="4" fill="#fff"/><circle cx="84" cy="62" r="4" fill="#fff"/><path d="M10 92 h140 M30 100 h100" stroke="#C9CCD8" stroke-width="3" stroke-linecap="round"/></svg>`,
  clock: `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="46" fill="#FFFDF0" stroke="${INK}" stroke-width="4"/><path d="M60 60 m-26 0 a26 26 0 1 1 26 26 a18 18 0 1 1 -18 -18 a10 10 0 1 1 10 10" fill="none" stroke="#6B4E8C" stroke-width="3"/><path d="M60 60 L60 22 M60 60 L88 76" stroke="${INK}" stroke-width="5" stroke-linecap="round"/></svg>`,
  shroom: `<svg viewBox="0 0 140 120" aria-hidden="true"><path d="M20 62 Q70 -4 120 62Z" fill="#C9A0FF" stroke="${INK}" stroke-width="3"/><rect x="58" y="62" width="24" height="42" rx="8" fill="#FFFDF0" stroke="${INK}" stroke-width="3"/><circle cx="50" cy="44" r="6" fill="#fff"/><circle cx="80" cy="36" r="5" fill="#fff"/><circle cx="96" cy="50" r="4" fill="#fff"/>${[[28, 18], [110, 22], [18, 44], [124, 40], [70, 8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#FDFFB6"/>`).join("")}</svg>`
};
const INCIDENTS = [
  { id: "blackout", w: 3, art: "bulb", title: ["Blackout!"], text: ["The lights flicker... and go out! Only a little torchlight is left for 25 seconds."], effect: ["🌑 The room is almost dark and the glowing marks are hard to see."],
    run() { R.blackUntil = Date.now() + 25000; const sc = document.getElementById("scene"); if (sc) { sc.classList.add("blackout"); sc.style.setProperty("--dim", .94); } } },
  { id: "wolverine", w: 3, art: "wolverine", cond: () => (S.room_progress[R.room.id] || []).length >= 1, title: ["A wolverine sneaks in!"], text: ["Something fluffy with glowing eyes darts across the floor... It grabs one of your items and hides it in the shadows!"], effect: ["🐾 One code digit is hidden until you catch it: tap the 🐾 and answer its riddle."],
    run() { const solved = S.room_progress[R.room.id] || []; R.stolen = pick(solved); R.wolfX = 20 + Math.random() * 55; R.wolfY = 72 + Math.random() * 14; } },
  { id: "shadow", w: 3, art: "shadow", cond: () => HOTSPOTS.filter((_, i) => !(S.room_progress[R.room.id] || []).includes(i)).length >= 2, title: ["Something is watching..."], text: ["A shadow creature slides along the wall and swallows one of the glowing marks. Two white eyes blink... then it's gone."], effect: ["🔦 One lock is now hidden. Search the room by tapping the objects themselves!"],
    run() { const un = HOTSPOTS.map((_, i) => i).filter(i => !(S.room_progress[R.room.id] || []).includes(i)); R.hiddenHs = pick(un); } },
  { id: "fog", w: 2, art: "fog", title: ["Mysterious fog"], text: ["Cold, grey fog rolls in under the door. You can hear whispering..."], effect: ["🌫️ The answers in your next lock will be hidden in fog for 6 seconds. Read the question first!"],
    run() { R.fog = true; } },
  { id: "clock", w: 2, art: "clock", title: ["The clock goes haywire!"], text: ["Tick... tick... TICKTICKTICK! The wall clock's hands start spinning by themselves."], effect: ["⏩ For 30 seconds, time runs twice as fast."],
    run() { R.warpUntil = Date.now() + 30000; } },
  { id: "spores", w: 2, art: "shroom", title: ["Sleepy spores"], text: ["Glowing mushrooms pop up in the corner and puff out sparkly spores. Your pal yawns... and dozes off."], effect: ["😴 Hints are unavailable for 45 seconds."],
    run() { R.noHintUntil = Date.now() + 45000; } },
  { id: "owl", w: 2, good: true, art: "owl", title: ["A wise night owl appears"], text: ["Hoo... hoo... A big owl lands on the bookshelf, eyes glowing in the dark. It has a riddle for you."], effect: ["🦉 Answer its bonus question for +45 seconds and 5 🌰."],
    run() { setTimeout(owlQuiz, 300); } },
  { id: "tea", w: 2, good: true, art: null, title: ["A quiet page"], text: ["A loose page of the Codex drifts down and glows softly. The Murk backs away, and the room feels calm for a moment."], effect: ["📜 The timer freezes for 30 seconds. Relax and think!"],
    run() { R.freezeUntil = Date.now() + 30000; } }
];
function tryIncident(me) {
  if (!R || R !== me || R.done || R.incidents >= 3) return;
  if ($modal.innerHTML || $journal.innerHTML || document.hidden) { R.incT = setTimeout(() => tryIncident(me), 8000); return; }
  const opts = INCIDENTS.filter(x => !R.used.includes(x.id) && (!x.cond || x.cond()));
  if (!opts.length) return;
  const inc = pick(opts.flatMap(x => Array(x.w).fill(x)));
  R.used.push(inc.id); R.incidents++; S.stats.incidents += 1;
  if (inc.good) SFX.hint(); else SFX.creepy();
  openModal(`<span class="kicker">👻 ${"Incident!"}</span>
    <h2>${inc.title[0]}</h2>
    <div class="creature">${inc.art ? CREATURES[inc.art] : figure("chiikawa", "happy")}</div>
    <p>${inc.text[0]}</p>
    <div class="effect"><b>${inc.effect[0]}</b></div>
    <div class="row"><button class="btn big" id="incOk">${inc.good ? "Yay! 🎉" : "Eek... OK! 😖"}</button></div>`, { closable: false });
  const box = document.getElementById("mbox"); box.classList.add("incident"); if (inc.good) box.classList.add("good");
  document.getElementById("incOk").onclick = () => { SFX.tap(); closeModal(); inc.run(); if (R && inc.id !== "owl") { renderRoom(); document.getElementById("inv").innerHTML = invHtml(); wireSlots(); setLine(inc.good ? "chiikawa" : "chiikawa", inc.effect[0], inc.good ? "normal" : "cry"); } };
}
// A quick question from this room's pool that isn't in the current run
function sideQuestion(maxB) {
  const pool = R.room.pool.filter(p => p.type === "mc" && !p.svg && p.b <= maxB && !S.room_run[R.room.id].qids.includes(p.id));
  return pick(pool.length ? pool : R.room.pool.filter(p => p.type === "mc" && !p.svg));
}
function sideQuiz({ kicker, title, art, p, onRight, onWrong }) {
  const order = shuffle(p.choices.map((_, i) => i));
  const box = openModal(`<span class="kicker">${kicker}</span><h2>${title}</h2><div class="creature">${CREATURES[art]}</div>
    <p class="q">${esc(p.q)}</p><div class="choices">${order.map((i, n) => `<button class="choice" data-i="${i}"><b>${"ABCD"[n]}</b><span>${esc(p.choices[i])}</span></button>`).join("")}</div><div id="sfb"></div>`, { closable: false });
  box.classList.add("incident");
  box.querySelectorAll(".choice").forEach(b => b.onclick = () => {
    const ok = Number(b.dataset.i) === p.answer;
    box.querySelectorAll(".choice").forEach(x => x.disabled = true); b.classList.add(ok ? "right" : "wrong");
    if (!ok) box.querySelector(`[data-i="${p.answer}"]`).classList.add("right");
    document.getElementById("sfb").innerHTML = `<div class="effect"><p>${esc(p.explain)}</p></div><div class="row" style="margin-top:10px"><button class="btn" id="sOk">${"Continue"}</button></div>`;
    ok ? (SFX.right(), onRight()) : (SFX.wrong(), noteMistake(p.rid, p.id), onWrong());
    document.getElementById("sOk").onclick = () => { closeModal(); if (R) { renderRoom(); document.getElementById("inv").innerHTML = invHtml(); wireSlots(); } };
  });
}
function chaseWolverine() {
  if (R.wolfUntil > Date.now()) { toast(`The wolverine is hiding... try again in ${Math.ceil((R.wolfUntil - Date.now()) / 1000)}s`); return; }
  SFX.creepy();
  sideQuiz({ kicker: `🐾 ${"Catch the wolverine!"}`, title: "Answer its riddle to get your item back", art: "wolverine", p: sideQuestion(3),
    onRight: () => { const i = R.stolen; R.stolen = null; S.coins += 3; save(true); toast(`🐾 Got it back! Item #${i + 1} returned (+3 🌰)`); },
    onWrong: () => { R.wolfUntil = Date.now() + 15000; R.wolfX = 20 + Math.random() * 55; toast("It ran off to another corner! Wait 15 s, then try again."); } });
}
function owlQuiz() {
  if (!R) return;
  sideQuiz({ kicker: `🦉 ${"Owl's bonus riddle"}`, title: "Hoo... can you answer this?", art: "owl", p: sideQuestion(6),
    onRight: () => { S.room_timer[R.room.id] += 45; S.coins += 5; save(true); toast("🦉 Wise! +45 s and +5 🌰"); },
    onWrong: () => { toast("🦉 Hoo... not quite. No reward this time."); } });
}

/* ============================================================
   10. Boot: save-code links (#CODE), resume prompt, or new game
   ============================================================ */
document.getElementById("home").onclick = () => { if (S) { SFX.init(); SFX.tap(); closeModal(); homeTab = "home"; renderMap(); } };
document.addEventListener("pointerdown", () => { SFX.init(); MUSIC.start(); }, { once: true });
document.addEventListener("keydown", () => { SFX.init(); MUSIC.start(); }, { once: true });
document.addEventListener("visibilitychange", () => { if (document.hidden && S) save(); });
window.addEventListener("pagehide", () => { if (S) save(); });
(function boot() {
  startIcons();
  const linked = decodeCode(location.hash.slice(1));
  if (linked) { S ? renderMap() : renderWelcome(); showCodeFromLink(linked); return; }
  // Class sign-in screen first, unless this device chose guest mode (or sign-in is off and there is saved progress)
  const pref = authPref();
  if (pref === "guest" || (!pref && S && !cloudOn())) { AUTH.mode = "guest"; if (S) enterGame(); else renderWelcome(); }
  else renderLogin();
})();
