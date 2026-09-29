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
    r.pool.forEach(p => { p.rid = r.id; });
  });
}
buildPools();
const ROOM_SECONDS = 20 * 60;
// Students asked for shorter waits: no time penalty or lock-out lasts longer than 15 s.
const MAX_WAIT = 15, TIME_FINE = 10;
const CHEERS = ["Yaha!", "Ura!", "Puru puru!", "Waaai!", "Sugoi!"];
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

function freshStats() { return { days: 0, correct: 0, run: 0, bestRun: 0, replays: 0, cleanEscapes: 0, noHintEscapes: 0, rushRounds: 0, chests: 0, night: 0, spellRight: 0, graphFirst: 0, incidents: 0 }; }
function freshRun() { return { firsts: [], strikes: 0, hints: false, qids: null, steps: {} }; }
function newId() { return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function freshMastery() { return Object.fromEntries(TOPICS.map(t => [t.id, 0])); }
function freshState() {
  return {
    v: 1, player_name: "Student", current_streak: 0, longest_streak: 0, last_login_date: null,
    completed_rooms: [], current_room: ROOMS[0].id, streak_shields: 1, chiikawa_badges: [], inventory: [],
    bio_mastery: freshMastery(),
    room_progress: {}, mastered_puzzles: [], room_stars: {}, room_timer: {}, last_chest_date: null, seen: {}, last_revise_day: null,
    room_run: {}, trophies: {}, stats: freshStats(),
    coins: 0, owned: [], equip: { hat: null, face: null, ribbon: null, frame: null }, power: { torch: 1, crystal: 1, guard: 1 },
    rush: { best: 0, lastDay: null }, player_id: newId(), lb_last: 0, mistakes: {}, mistakes_cleared: 0, coll: { owned: {}, pending: 0, pity: 0 }
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
  s.coll = Object.assign({ owned: {}, pending: 0, pity: 0 }, s.coll); s.coll.owned = Object.assign({}, s.coll.owned);
  s.equip = Object.assign({ hat: null, face: null, ribbon: null, frame: null }, s.equip); s.power = Object.assign({ torch: 0, crystal: 0, guard: 0 }, s.power);
  s.rush = Object.assign({ best: 0, lastDay: null }, s.rush); s.owned = [...(s.owned || [])]; if (!s.player_id) s.player_id = newId();
  s.completed_rooms = [...new Set((s.completed_rooms || []).filter(id => ROOMS.some(r => r.id === id)))];
  if (!ROOMS.some(r => r.id === s.current_room)) s.current_room = ROOMS[0].id;
  return s;
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return normalise(JSON.parse(raw));
  } catch (e) {}
  return null;
}
let savedFlash = 0;
function save(flash) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {}
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
  s.current_streak = d.streak; s.longest_streak = d.streak; s.streak_shields = d.shields; s.last_login_date = today();
  if (S) { s.trophies = S.trophies || {}; s.stats = Object.assign(freshStats(), S.stats); s.coins = S.coins || 0; s.owned = S.owned || []; s.equip = S.equip || s.equip; s.power = S.power || s.power; s.rush = S.rush || s.rush; s.player_id = S.player_id || s.player_id; s.last_chest_date = S.last_chest_date; s.mistakes = S.mistakes || {}; s.mistakes_cleared = S.mistakes_cleared || 0; s.coll = S.coll || s.coll; s.inventory = s.inventory.concat((S.inventory || []).filter(x => SNACKS.includes(x))); }
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

// Daily streak: same day → no change; next day → +1; missed days → shields cover them, else restart at 1.
function checkIn() {
  const t = today();
  if (S.last_login_date !== t) S.stats.days += 1;
  if (!S.last_login_date) { S.current_streak = 1; streakNote = "🔥 Day 1 of your streak!"; }
  else if (S.last_login_date !== t) {
    const gap = dayNum(t) - dayNum(S.last_login_date);
    if (gap === 1) { S.current_streak += 1; streakNote = `🔥 Streak up! ${S.current_streak} days in a row.`; }
    else if (gap > 1) {
      const missed = gap - 1;
      if (S.streak_shields >= missed) { S.streak_shields -= missed; S.current_streak += 1; streakNote = `🛡️ Hachiware used ${missed} shield${missed > 1 ? "s" : ""} to protect your streak! Now ${S.current_streak} days.`; }
      else { S.current_streak = 1; streakNote = "🌱 Welcome back! Chiikawa missed you. 🥹 Your streak restarted at 1."; }
    }
    if (S.current_streak % 7 === 0 && S.streak_shields < 3) { S.streak_shields += 1; streakNote += " 🛡️ 7-day milestone: +1 shield!"; }
  }
  S.longest_streak = Math.max(S.longest_streak || 0, S.current_streak);
  S.last_login_date = t;
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
const say = (who, text, mood = "normal", cls = "") => `<div class="say"><div class="av">${avatar(who, mood)}</div><div class="bubble ${cls}"><span class="name">${CHAR[who].name}</span>${text}</div></div>`;
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
const starStr = n => "★".repeat(n) + "☆".repeat(3 - n);
const fmt = sec => { const a = Math.abs(sec); return `${sec < 0 ? "+" : ""}${String(Math.floor(a / 60)).padStart(2, "0")}:${String(a % 60).padStart(2, "0")}`; };
function toast(msg) { const t = document.getElementById("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), 2600); }

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
  d.innerHTML = `<div class="inner">${figure("usagi", "happy")}<span class="word">${esc(word || pick(CHEERS))}</span></div>`;
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
const collOwned = rare => COLLECTIBLES.filter(c => (rare == null || c.rare === rare) && (S.coll.owned[c.id] || 0) > 0).length;
const TROPHY_CATS = [["habit", "🔥 Daily habits"], ["adventure", "🗺️ Adventure"], ["brain", "🧠 Brain power"], ["fun", "🎀 Fun & style"]];
const TROPHIES = [
  { id: "week", cat: "habit", name: "Week Warrior", rar: "bronze", who: "chiikawa", desc: "Play 7 days in a row", prog: () => [S.longest_streak, 7] },
  { id: "chest", cat: "habit", name: "Snack Stash", rar: "bronze", who: "kurimanju", desc: "Open the daily snack chest 10 times", prog: () => [S.stats.chests, 10] },
  { id: "steady", cat: "habit", name: "Steady Explorer", rar: "silver", who: "hachiware", desc: "Play on 20 different days", prog: () => [S.stats.days, 20] },
  { id: "night", cat: "habit", name: "Night Owl", rar: "bronze", who: "momonga", desc: "Escape a stage after 9 pm", prog: () => [S.stats.night, 1] },
  { id: "flame", cat: "habit", name: "Eternal Flame", rar: "legend", who: "usagi", desc: "Reach a 30-day streak", prog: () => [S.longest_streak, 30] },
  { id: "first", cat: "adventure", name: "First Door", rar: "bronze", who: "chiikawa", desc: "Escape your very first stage", prog: () => [S.completed_rooms.length, 1] },
  { id: "topic", cat: "adventure", name: "Topic Tamer", rar: "silver", who: "hachiware", desc: "Clear every stage of one topic", prog: () => [topicsCleared(), 1] },
  { id: "boss5", cat: "adventure", name: "Boss Buster", rar: "gold", who: "rakko", desc: "Beat 5 boss stages", prog: () => [bossesBeaten(), 5] },
  { id: "part", cat: "adventure", name: "Part Champion", rar: "gold", who: "shisa", desc: "Clear every topic in one Part", prog: () => [partsCleared(), 1] },
  { id: "escaper", cat: "adventure", name: "Master Escaper", rar: "gold", who: "chiikawa", desc: `Escape all ${ROOMS.length} stages`, prog: () => [S.completed_rooms.length, ROOMS.length] },
  { id: "bossall", cat: "adventure", name: "Rakko's Respect", rar: "legend", who: "rakko", desc: `Beat all ${TOPICS.length} boss stages`, prog: () => [bossesBeaten(), TOPICS.length] },
  { id: "stars", cat: "adventure", name: "Star Collector", rar: "legend", who: "hachiware", desc: "Collect 120 stars (3★ = 3 stars)", prog: () => [ROOMS.reduce((a, r) => a + roomStars(r), 0), 120] },
  { id: "spell", cat: "brain", name: "Spelling Bee", rar: "silver", who: "usagi", desc: "Spell 30 biology words correctly", prog: () => [S.stats.spellRight, 30] },
  { id: "tidy", cat: "brain", name: "Tidy Notebook", rar: "silver", who: "kurimanju", desc: "Clear 20 questions from your Mistake Notebook", prog: () => [S.mistakes_cleared || 0, 20] },
  { id: "clock", cat: "brain", name: "Beat the Clock", rar: "silver", who: "usagi", desc: "5 escapes before time runs out, with 0 guess strikes", prog: () => [S.stats.cleanEscapes, 5] },
  { id: "brain", cat: "brain", name: "Brain Power", rar: "silver", who: "momonga", desc: "5 escapes without using any hint", prog: () => [S.stats.noHintEscapes, 5] },
  { id: "sharp", cat: "brain", name: "Sharpshooter", rar: "gold", who: "momonga", desc: "15 first-try answers in a row (no hints, no mistakes)", prog: () => [S.stats.bestRun, 15] },
  { id: "graph", cat: "brain", name: "Graph Guru", rar: "gold", who: "hachiware", desc: "Read 25 graphs right on the first try", prog: () => [S.stats.graphFirst, 25] },
  { id: "hunter", cat: "brain", name: "Knowledge Hunter", rar: "gold", who: "kurimanju", desc: "Answer 300 questions correctly", prog: () => [S.stats.correct, 300] },
  { id: "practice", cat: "brain", name: "Practice Makes Perfect", rar: "bronze", who: "kurimanju", desc: "Replay escaped stages 10 times", prog: () => [S.stats.replays, 10] },
  { id: "rush1", cat: "fun", name: "Rush Rookie", rar: "bronze", who: "usagi", desc: "Score 100 points in one Cell Rush", prog: () => [S.rush.best, 100] },
  { id: "spooky", cat: "fun", name: "Spooky Survivor", rar: "silver", who: "chiikawa", desc: "Survive 20 random incidents", prog: () => [S.stats.incidents, 20] },
  { id: "fashion", cat: "fun", name: "Fashion Icon", rar: "silver", who: "momonga", desc: "Own 8 outfits from Shisa's shop", prog: () => [S.owned.length, 8] },
  { id: "rush2", cat: "fun", name: "Lightning Brain", rar: "gold", who: "usagi", desc: "Score 300 points in one Cell Rush", prog: () => [S.rush.best, 300] },
  { id: "coll", cat: "fun", name: "Collector", rar: "gold", who: "shisa", desc: "Collect 15 different collectibles", prog: () => [collOwned(), 15] },
  { id: "rare", cat: "fun", name: "Rare Hunter", rar: "legend", who: "chiikawa", desc: "Collect all 5 rare collectibles", prog: () => [collOwned(true), 5] }
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
    ${got ? `<svg x="29" y="17" width="42" height="42" viewBox="0 0 64 64">${CHAR[t.who].head("happy")}</svg>`
          : `<text x="50" y="50" text-anchor="middle" font-size="26" font-weight="800" fill="#8C8478">?</text>`}
    ${got && t.rar !== "bronze" ? spark(12, 14, 7) + spark(90, 20, 5) + (t.rar !== "silver" ? spark(88, 66, 6) + spark(10, 70, 4) : "") : ""}
    ${got ? "" : `<g transform="translate(78 92)"><rect x="-9" y="-3" width="18" height="14" rx="3" fill="#fff" stroke="${INK}" stroke-width="2.4"/><path d="M-5 -3 v-4 a5 5 0 0 1 10 0 v4" fill="none" stroke="${INK}" stroke-width="2.4"/></g>`}
  </svg>`;
}
function trophyCard(t) {
  const got = !!S.trophies[t.id];
  const [cur, goal] = t.prog(), v = Math.min(cur, goal);
  return `<div class="trophy ${got ? `got ${t.rar}` : "locked"}" aria-label="${esc(t.name)}: ${got ? "unlocked" : `${v} / ${goal}`}">
    <span class="ribbon ${t.rar}">${RAR[t.rar][2]}</span>
    ${trophySvg(t, got)}
    <span class="tn">${esc(t.name)}</span>
    <span class="td">${esc(t.desc)}</span>
    ${got ? `<span class="pnum">🏆 ${esc(S.trophies[t.id])}</span>`
          : `<div class="pbar"><i style="width:${Math.round(100 * v / goal)}%"></i></div><span class="pnum">${v} / ${goal}</span>`}
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

/* ============================================================
   6b2. Collectibles: 20 capsule toys (15 common, 5 rare). Earn 🎁 capsules by playing; open them to collect.
   ============================================================ */
const COLL_ART = {
  photocard: `<svg viewBox="0 0 80 100" aria-hidden="true"><defs><linearGradient id="holoA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB7C5"/><stop offset=".3" stop-color="#FDFFB6"/><stop offset=".55" stop-color="#B9F3C9"/><stop offset=".8" stop-color="#A0C4FF"/><stop offset="1" stop-color="#C9C3F0"/></linearGradient></defs>
    <rect x="6" y="4" width="68" height="92" rx="10" fill="url(#holoA)" stroke="${INK}" stroke-width="3"/><rect x="13" y="12" width="54" height="56" rx="6" fill="#FFF1E6" stroke="${INK}" stroke-width="2"/>
    <g transform="rotate(-12 40 42)"><ellipse cx="40" cy="42" rx="20" ry="11" fill="#F9C9A6" stroke="${INK}" stroke-width="2.2"/><path d="M24 42 h5 v-6 h5 v12 h5 v-12 h5 v12 h5 v-6 h6" fill="none" stroke="${INK}" stroke-width="1.8"/></g>
    <circle cx="33" cy="40" r="1.8" fill="${INK}"/><circle cx="46" cy="38" r="1.8" fill="${INK}"/><path d="M20 20 l3 5 5 1 -5 1 -3 5 -1 -5 -5 -1 5 -1z" fill="#fff"/>
    <text x="40" y="80" text-anchor="middle" font-size="7.5" font-weight="800" fill="${INK}">POWERHOUSE</text><text x="40" y="89" text-anchor="middle" font-size="7.5" font-weight="800" fill="${INK}">ERA ✦</text></svg>`,
  blindbox: `<svg viewBox="0 0 80 100" aria-hidden="true"><rect x="10" y="50" width="60" height="44" rx="6" fill="#2B2433" stroke="${INK}" stroke-width="3"/><path d="M10 50 l8 -10 h44 l8 10" fill="#3E3350" stroke="${INK}" stroke-width="3"/>
    <text x="40" y="78" text-anchor="middle" font-size="9" font-weight="800" fill="#FDD66B">SECRET</text><text x="40" y="89" text-anchor="middle" font-size="6.5" fill="#C9A0FF">1 / 144</text>
    <g transform="translate(20 4) scale(.62)"><circle cx="17" cy="17" r="7" fill="#3A3145" stroke="${INK}" stroke-width="2.4"/><circle cx="47" cy="17" r="7" fill="#3A3145" stroke="${INK}" stroke-width="2.4"/><ellipse cx="32" cy="37" rx="25" ry="21" fill="#3A3145" stroke="${INK}" stroke-width="2.4"/><ellipse cx="24" cy="36" rx="3" ry="3.6" fill="#FDD66B"/><ellipse cx="40" cy="36" rx="3" ry="3.6" fill="#FDD66B"/><ellipse cx="15" cy="43" rx="5" ry="3" fill="#C9A0FF"/><ellipse cx="49" cy="43" rx="5" ry="3" fill="#C9A0FF"/><path d="M52 8 a8 8 0 1 0 6 10 a6 6 0 1 1 -6 -10z" fill="#FDD66B"/></g></svg>`,
  aura: `<svg viewBox="0 0 80 100" aria-hidden="true"><circle cx="40" cy="58" r="34" fill="rgba(201,160,255,.35)"/><circle cx="40" cy="58" r="26" fill="rgba(160,196,255,.35)"/><path d="M40 6 v18" stroke="${INK}" stroke-width="3"/><circle cx="40" cy="8" r="5" fill="none" stroke="${INK}" stroke-width="3"/>
    <circle cx="40" cy="56" r="22" fill="#FFFDF0" stroke="${INK}" stroke-width="3"/><circle cx="28" cy="38" r="6" fill="#FFFDF0" stroke="${INK}" stroke-width="2.4"/><circle cx="52" cy="38" r="6" fill="#FFFDF0" stroke="${INK}" stroke-width="2.4"/>
    <path d="M31 54 l3 -3 3 3 M43 54 l3 -3 3 3" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/><path d="M36 62 q4 4 8 0" fill="none" stroke="${INK}" stroke-width="2"/><ellipse cx="28" cy="60" rx="4" ry="2.4" fill="#FFB7C5"/><ellipse cx="52" cy="60" rx="4" ry="2.4" fill="#FFB7C5"/>
    <text x="40" y="94" text-anchor="middle" font-size="10" font-weight="800" fill="#6B4E8C">+1000 ✦</text></svg>`,
  matcha: `<svg viewBox="0 0 80 100" aria-hidden="true"><path d="M18 30 H62 L56 92 H24 Z" fill="rgba(255,255,255,.7)" stroke="${INK}" stroke-width="3"/><path d="M20 52 H60 L56 90 H24Z" fill="#9CCB6B"/><path d="M19 42 H61 L60 52 H20Z" fill="#F4F0E8"/>
    ${[[32, 70], [46, 76], [38, 84]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="3.5" fill="#6BBF5F" stroke="${INK}" stroke-width="1.4"/>`).join("")}<rect x="14" y="24" width="52" height="8" rx="3" fill="#FFFDF0" stroke="${INK}" stroke-width="2.4"/><path d="M48 24 L56 4" stroke="#FFB7C5" stroke-width="5" stroke-linecap="round"/>
    <path d="M40 60 q-8 -6 -4 -12 q6 -2 4 12 q-2 -14 4 -12 q4 6 -4 12" fill="#FFFDF0" opacity=".8"/></svg>`,
  flip: `<svg viewBox="0 0 80 100" aria-hidden="true"><rect x="22" y="6" width="36" height="42" rx="8" fill="#FFB7C5" stroke="${INK}" stroke-width="3"/><rect x="27" y="11" width="26" height="26" rx="4" fill="#D3E4FF" stroke="${INK}" stroke-width="2"/><text x="40" y="28" text-anchor="middle" font-size="10">💖</text>
    <rect x="22" y="50" width="36" height="42" rx="8" fill="#FFB7C5" stroke="${INK}" stroke-width="3"/>${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${28 + c * 9}" y="${58 + r * 9}" width="6" height="5" rx="2" fill="#FFFDF0" stroke="${INK}" stroke-width="1"/>`).join("")).join("")}
    <path d="M58 70 q14 4 12 16" fill="none" stroke="${INK}" stroke-width="1.6"/><path d="M66 84 q4 4 0 8 q-4 4 0 8 M72 84 q-4 4 0 8 q4 4 0 8" fill="none" stroke="#5B8FE0" stroke-width="2"/>${[[16, 10], [64, 44], [12, 60]].map(([x, y]) => `<path d="M${x} ${y - 5} l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5z" fill="#FDD66B"/>`).join("")}</svg>`
};
const COLLECTIBLES = [
  { id: "mochi", e: "🍡", name: "Mitochondria Mochi", desc: "The powerhouse of the cell, but squishy." },
  { id: "onigiri", e: "🍙", name: "Chloroplast Onigiri", desc: "Packed with green goodness and sunshine." },
  { id: "boba", e: "🧋", name: "Ribosome Boba", desc: "Every pearl is a tiny protein factory." },
  { id: "dango", e: "🔑", name: "Enzyme Key Charm", desc: "Fits exactly one lock. Very specific." },
  { id: "donut", e: "🍩", name: "Red Blood Cell Donut", desc: "Biconcave, no nucleus, extra cute." },
  { id: "grapes", e: "🍇", name: "Alveoli Grapes", desc: "Huge surface area, tiny and juicy." },
  { id: "villi", e: "🧸", name: "Villi Plushie", desc: "Soft, finger-shaped and absorbent." },
  { id: "virus", e: "🦠", name: "Virus Squishy", desc: "Harmless. Probably. Wash your hands!" },
  { id: "jelly", e: "🪼", name: "Amoeba Jelly", desc: "Changes shape whenever it wants." },
  { id: "pollen", e: "🌼", name: "Pollen Puff", desc: "Sticky, spiky and ready to travel." },
  { id: "peapod", e: "🫛", name: "Pea-Pod Pals", desc: "Round and wrinkled friends, Mendel-approved." },
  { id: "dnastick", e: "🧬", name: "DNA Biscuit Stick", desc: "A–T, C–G, crunch!" },
  { id: "heartkey", e: "💓", name: "Heartbeat Keychain", desc: "Ba-dum, ba-dum, double circulation." },
  { id: "stomaclip", e: "🍃", name: "Stomata Hair Clip", desc: "Opens in the day, closes when it's dry." },
  { id: "noodles", e: "🍜", name: "Neuron Noodles", desc: "Long, fast and full of impulses." },
  { id: "photocard", rare: true, art: "photocard", name: "Powerhouse Era Holo Photocard", desc: "Holographic idol photocard of Mitochondria. It's in its powerhouse era. ✦" },
  { id: "blindbox", rare: true, art: "blindbox", name: "Secret Blind-Box: Midnight Chiikawa", desc: "The 1-in-144 secret figure. Collectors everywhere are screaming." },
  { id: "aura", rare: true, art: "aura", name: "Aura +1000 Bag Charm", desc: "Clip it on your bag for instant main-character energy." },
  { id: "matcha", rare: true, art: "matcha", name: "Chloroplast Matcha Latte", desc: "Iced, aesthetic, and it's giving photosynthesis." },
  { id: "flip", rare: true, art: "flip", name: "Y2K Flip-Phone DNA Charm", desc: "Sparkly retro flip phone with a double-helix strap. Y2K core." }
];
const RARE_CHANCE = .08, RARE_PITY = 12;
function collArt(c) { return c.rare ? COLL_ART[c.art] : `<span class="cemoji" aria-hidden="true">${c.e}</span>`; }
function collCard(c, own) {
  return `<div class="coll ${c.rare ? "rare" : ""} ${own ? "own" : "missing"}" aria-label="${own ? esc(c.name) : "Not collected yet"}">
    <div class="cart">${own ? collArt(c) : `<span class="cq">?</span>`}</div>
    <b class="small">${own ? esc(c.name) : c.rare ? "??? Rare" : "???"}</b>
    <span class="tag ${c.rare ? "rtag" : ""}">${c.rare ? "✨ Rare" : "Common"}</span>
    ${own && own > 1 ? `<span class="small muted">×${own}</span>` : ""}</div>`;
}
function openAlbum() {
  const n = collOwned(), nr = collOwned(true), cap = S.coll.pending;
  const box = openModal(`<span class="kicker">🧸 Collection</span><h2>Capsule Collection</h2>
    <div class="row" style="justify-content:space-between"><span class="pill">${n} / ${COLLECTIBLES.length} collected</span><span class="pill rpill">✨ ${nr} / 5 rare</span></div>
    ${say("shisa", cap ? `You have <b>${cap}</b> capsule${cap > 1 ? "s" : ""} waiting! Open ${cap > 1 ? "them" : "it"}~ 🦁🎁` : "Earn 🎁 capsules by escaping stages, beating bosses, opening the daily chest, scoring 120+ in Cell Rush and unlocking trophies!", "happy")}
    ${cap ? `<div class="row"><button class="btn big" id="alOpen">🎁 Open a capsule (${cap})</button></div>` : ""}
    <h3>✨ Rare</h3><div class="collgrid">${COLLECTIBLES.filter(c => c.rare).map(c => collCard(c, S.coll.owned[c.id])).join("")}</div>
    <h3>Common</h3><div class="collgrid">${COLLECTIBLES.filter(c => !c.rare).map(c => collCard(c, S.coll.owned[c.id])).join("")}</div>
    <p class="small muted">Rare pulls are about 1 in 12, and you're guaranteed one within ${RARE_PITY} capsules. Duplicates turn into 🌰 5.</p>`, { wide: true });
  const b = box.querySelector("#alOpen"); if (b) b.onclick = () => { SFX.tap(); openCapsule(true); };
}
function grantCapsule(n = 1, why = "") {
  S.coll.pending += n; save(true);
  if (why) toast(`🎁 +${n} capsule${n > 1 ? "s" : ""}: ${why}`);
}
function rollCollectible() {
  const rareHit = S.coll.pity + 1 >= RARE_PITY || Math.random() < RARE_CHANCE;
  const pool = COLLECTIBLES.filter(c => !!c.rare === rareHit), fresh = pool.filter(c => !S.coll.owned[c.id]);
  const c = pick(fresh.length && Math.random() < .75 ? fresh : pool);
  S.coll.pity = c.rare ? 0 : S.coll.pity + 1;
  return c;
}
function openCapsule(fromAlbum) {
  if (!(S.coll.pending > 0)) return;
  const box = openModal(`<span class="kicker">🎁 Mystery capsule</span><h2>What's inside?</h2>
    <div class="capsule" id="cap" aria-hidden="true"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44" fill="#FFB7C5" stroke="${INK}" stroke-width="4"/><path d="M16 60 H104 A44 44 0 0 1 16 60Z" fill="#FFFDF0" stroke="${INK}" stroke-width="4"/><circle cx="60" cy="60" r="9" fill="#FDFFB6" stroke="${INK}" stroke-width="3"/><path d="M36 34 q10 -10 22 -10" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg></div>
    ${say("chiikawa", "Uu... I'm so nervous... please be something cute! 🥺🙏", "brave")}
    <div class="row" style="justify-content:center"><button class="btn big" id="capGo">Twist and open! 🔄</button></div>`, { closable: false });
  box.querySelector("#capGo").onclick = () => {
    SFX.click(); const cap = document.getElementById("cap"); cap.classList.add("shake"); box.querySelector("#capGo").disabled = true;
    setTimeout(() => {
      const c = rollCollectible(), dup = (S.coll.owned[c.id] || 0) > 0;
      S.coll.owned[c.id] = (S.coll.owned[c.id] || 0) + 1; S.coll.pending -= 1; if (dup) S.coins += 5;
      save(true); checkTrophies();
      if (c.rare) { SFX.fanfare(); setTimeout(() => SFX.yaha(), 400); confetti(220); } else { SFX.item(); confetti(60); }
      box.innerHTML = `<span class="kicker">${c.rare ? "✨ RARE PULL! ✨" : "🎁 Capsule opened"}</span><h2>${c.rare ? "No way... it's RARE!!" : dup ? "A friend you already have!" : "New collectible!"}</h2>
        <div class="reveal ${c.rare ? "rare" : ""}">${collCard(c, 1)}</div>
        <p style="text-align:center">${esc(c.desc)}</p>
        ${c.rare ? say("usagi", "YAHA!!! URAAA!!! That's SO rare!!! 🐰✨", "sparkle") : dup ? say("kurimanju", "A duplicate... traded for 🌰 5. *sip* 🍵", "happy") : say("hachiware", "Cute! It's in your collection now. ✨", "happy", "hint")}
        <div class="row" style="justify-content:center">${S.coll.pending ? `<button class="btn big" id="capMore">🎁 Open another (${S.coll.pending})</button>` : ""}<button class="btn yellow" id="capAlbum">🧸 See collection</button><button class="btn plain" id="capDone">Done</button></div>`;
      const more = box.querySelector("#capMore"); if (more) more.onclick = () => { SFX.tap(); openCapsule(fromAlbum); };
      box.querySelector("#capAlbum").onclick = () => { SFX.tap(); openAlbum(); };
      box.querySelector("#capDone").onclick = () => { SFX.tap(); closeModal(); if (!R && !RU) renderMap(); };
    }, reduced() ? 50 : 1100);
  };
}

let trophyQueue = [];
function checkTrophies() {
  if (!S) return;
  TROPHIES.forEach(t => {
    if (S.trophies[t.id]) return;
    const [cur, goal] = t.prog();
    if (cur >= goal) { S.trophies[t.id] = today(); S.coins = (S.coins || 0) + 30; S.coll.pending += 1; trophyQueue.push(t); }
  });
  if (trophyQueue.length) { save(); renderTools(); showTrophyBanner(); lbSubmit(true); }
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
const O2 = `stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"`;
const WARDROBE = [
  { id: "hat_party", slot: "hat", name: "Party hat", price: 40, svg: `<path d="M21 19 L32 -8 L43 19 Z" fill="#FFB7C5" ${O2}/><path d="M25 12 H39 M28 4 H36" stroke="#fff" stroke-width="2.4"/><circle cx="32" cy="-9" r="3.5" fill="#FDFFB6" ${O2}/>` },
  { id: "hat_beret", slot: "hat", name: "Pink beret", price: 60, svg: `<ellipse cx="30" cy="15" rx="21" ry="7.5" fill="#FF8FA3" ${O2}/><path d="M30 7.5 v-4" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` },
  { id: "hat_ears", slot: "hat", name: "Bunny-ear band", price: 80, svg: `<ellipse cx="22" cy="0" rx="5" ry="12" fill="#fff" ${O2}/><ellipse cx="42" cy="0" rx="5" ry="12" fill="#fff" ${O2}/><ellipse cx="22" cy="0" rx="2" ry="8" fill="#FFB7C5"/><ellipse cx="42" cy="0" rx="2" ry="8" fill="#FFB7C5"/><path d="M13 21 Q32 6 51 21" fill="none" stroke="#FF8FA3" stroke-width="4" stroke-linecap="round"/>` },
  { id: "hat_grad", slot: "hat", name: "Graduation cap", price: 120, svg: `<rect x="20" y="10" width="24" height="9" rx="2" fill="${INK}"/><path d="M8 9 L32 1 L56 9 L32 17 Z" fill="${INK}" ${O2}/><path d="M32 9 L50 12 V22" stroke="#FDFFB6" stroke-width="2" fill="none"/><circle cx="50" cy="23" r="2.4" fill="#FDFFB6"/>` },
  { id: "hat_crown", slot: "hat", name: "Little crown", price: 160, svg: `<path d="M19 19 L21 3 L26.5 11 L32 1 L37.5 11 L43 3 L45 19 Z" fill="#FFE27A" ${O2}/><circle cx="32" cy="14" r="2.5" fill="#FFB7C5"/><circle cx="24.5" cy="15" r="1.8" fill="#A0C4FF"/><circle cx="39.5" cy="15" r="1.8" fill="#A0C4FF"/>` },
  { id: "face_round", slot: "face", name: "Round glasses", price: 50, svg: `<g fill="rgba(255,255,255,.3)" stroke="${INK}" stroke-width="2"><circle cx="24" cy="36" r="6"/><circle cx="40" cy="36" r="6"/></g><path d="M30 36 h4 M18 35 l-6 -2 M46 35 l6 -2" stroke="${INK}" stroke-width="2"/>` },
  { id: "face_sun", slot: "face", name: "Cool sunglasses", price: 90, svg: `<path d="M16 32 h14 v4 q-7 8 -14 0Z M34 32 h14 v4 q-7 8 -14 0Z" fill="#2B2433" ${O2}/><path d="M30 33 h4" stroke="${INK}" stroke-width="2"/><path d="M19 34 h4 M37 34 h4" stroke="#fff" stroke-width="1.5"/>` },
  { id: "face_prism", slot: "face", name: "Lab goggles", price: 130, svg: `<path d="M8 34 h48" stroke="#5B8FE0" stroke-width="3"/><rect x="15" y="29" width="15" height="12" rx="5" fill="rgba(211,228,255,.7)" ${O2}/><rect x="34" y="29" width="15" height="12" rx="5" fill="rgba(211,228,255,.7)" ${O2}/><path d="M30 34 h4" stroke="${INK}" stroke-width="2.4"/><path d="M18 32 l4 -1 M37 32 l4 -1" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>` },
  { id: "rib_bow", slot: "ribbon", name: "Red bow", price: 30, svg: `<path d="M48 13 L40 8 L41 18 Z M48 13 L56 8 L55 18 Z" fill="#FF6B6B" ${O2}/><circle cx="48" cy="13" r="2.8" fill="#FF6B6B" ${O2}/>` },
  { id: "rib_flower", slot: "ribbon", name: "Sakura flower", price: 45, svg: `${[0, 72, 144, 216, 288].map(a => `<circle cx="${(48 + 4 * Math.sin(a * Math.PI / 180)).toFixed(1)}" cy="${(12 - 4 * Math.cos(a * Math.PI / 180)).toFixed(1)}" r="3.4" fill="#FFB7C5" stroke="${INK}" stroke-width="1.6"/>`).join("")}<circle cx="48" cy="12" r="2.2" fill="#FDFFB6"/>` },
  { id: "rib_star", slot: "ribbon", name: "Star clip", price: 70, svg: `<path d="M48 3 l2.6 5.4 5.9 .8 -4.3 4.1 1 5.9 -5.2 -2.8 -5.2 2.8 1 -5.9 -4.3 -4.1 5.9 -.8z" fill="#FDFFB6" ${O2}/>` },
  { id: "fr_sakura", slot: "frame", name: "Sakura frame", price: 60, cls: "fr-sakura" },
  { id: "fr_laser", slot: "frame", name: "Laser frame", price: 90, cls: "fr-laser" },
  { id: "fr_rainbow", slot: "frame", name: "Rainbow frame", price: 140, cls: "fr-rainbow" }
];
const SLOT_NAMES = { hat: "Hats", face: "Glasses", ribbon: "Hair clips", frame: "Frames" };
const POWERUPS = [
  { id: "torch", icon: "🔦", name: "Torch", price: 25, desc: "Removes one wrong answer, or sets one dial correctly. (Counts as a hint.)" },
  { id: "crystal", icon: "⏳", name: "Time crystal", price: 30, desc: "Adds 60 seconds to the room timer." },
  { id: "guard", icon: "🛡️", name: "Guard charm", price: 35, desc: "Blocks all penalties for your next wrong answer." }
];
const MAX_POWER = 5;
const itemById = id => WARDROBE.find(w => w.id === id);
function outfitSvg(eq) {
  eq = eq || (typeof S !== "undefined" && S && S.equip);
  if (!eq) return "";
  return ["ribbon", "face", "hat"].map(k => eq[k] && itemById(eq[k]) ? itemById(eq[k]).svg : "").join("");
}
const frameCls = eq => { eq = eq || (S && S.equip) || {}; const f = eq.frame && itemById(eq.frame); return f ? f.cls : ""; };
const playerAv = (mood = "normal") => `<span class="${frameCls()}" style="display:inline-flex">${avatar("chiikawa", mood)}</span>`;
function addCoins(n, why) { S.coins = Math.max(0, (S.coins || 0) + n); save(); renderTools(); if (why) toast(`${n >= 0 ? "+" : ""}${n} 🌰 ${why}`); }

function openShop(tab = "outfits") {
  const draw = () => {
    const eq = S.equip;
    const html = `
      <span class="kicker">👗 ${"Wardrobe &amp; Shop"}</span>
      <h2>${"Dress up Chiikawa"}</h2>
      <div class="preview-big"><div class="fig"><span class="${frameCls()}" style="display:inline-flex;border-radius:50%">${figure("chiikawa", "happy")}</span></div>
        <div style="display:grid;gap:6px"><span class="pill coinpill" style="justify-self:start">🌰 ${S.coins} ${"chestnuts"}</span>
        ${say("shisa", "Welcome to Shisa's shop~! Earn chestnuts in ⚡ Cell Rush (double on your first round each day), by escaping stages and by unlocking trophies. 🦁", "happy")}</div></div>
      <div class="tabs" role="tablist"><button class="tab" role="tab" aria-selected="${tab === "outfits"}" data-tab="outfits">👒 ${"Outfits"}</button><button class="tab" role="tab" aria-selected="${tab === "power"}" data-tab="power">🎒 ${"Power-ups"}</button></div>
      ${tab === "outfits" ? Object.keys(SLOT_NAMES).map(slot => `<h3>${SLOT_NAMES[slot]}</h3><div class="shopgrid">${WARDROBE.filter(w => w.slot === slot).map(w => {
          const own = S.owned.includes(w.id), on = eq[slot] === w.id;
          const prevEq = Object.assign({}, eq, { [slot]: w.id });
          return `<div class="sitem ${on ? "on" : ""}"><div class="pv"><span class="${frameCls(prevEq)}" style="display:inline-flex;border-radius:50%">${avatar("chiikawa", "happy", prevEq)}</span></div>
            <b class="small">${esc(w.name)}</b>
            ${own ? `<button class="btn ${on ? "plain" : "blue"}" data-wear="${w.id}">${on ? "Take off" : "Wear"}</button>`
                  : `<button class="btn yellow" data-buy="${w.id}" ${S.coins < w.price ? "disabled" : ""}>🌰 ${w.price}</button>`}</div>`; }).join("")}</div>`).join("")
      : `<p class="small muted">${`Power-ups help inside escape rooms. Use them from the 🎒 bar in any lock. You can hold up to ${MAX_POWER} of each.`}</p>
         <div class="shopgrid">${POWERUPS.map(u => `<div class="sitem"><div style="font-size:2.2rem">${u.icon}</div><b>${esc(u.name)}</b><span class="small muted">${esc(u.desc)}</span>
           <span class="small"><b>${"You have"} ${S.power[u.id] || 0}</b></span>
           <button class="btn yellow" data-pbuy="${u.id}" ${S.coins < u.price || (S.power[u.id] || 0) >= MAX_POWER ? "disabled" : ""}>🌰 ${u.price}</button></div>`).join("")}</div>`}`;
    const box = openModal(html, { wide: true });
    box.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { SFX.tap(); tab = b.dataset.tab; draw(); });
    box.querySelectorAll("[data-buy]").forEach(b => b.onclick = () => {
      const w = itemById(b.dataset.buy); if (S.coins < w.price) return;
      S.coins -= w.price; S.owned.push(w.id); S.equip[w.slot] = w.id; save(true); SFX.fanfare(); confetti(50); yaha("Cute!"); draw(); refreshPlayer();
    });
    box.querySelectorAll("[data-wear]").forEach(b => b.onclick = () => {
      const w = itemById(b.dataset.wear); S.equip[w.slot] = S.equip[w.slot] === w.id ? null : w.id; save(true); SFX.item(); draw(); refreshPlayer();
    });
    box.querySelectorAll("[data-pbuy]").forEach(b => b.onclick = () => {
      const u = POWERUPS.find(x => x.id === b.dataset.pbuy); if (S.coins < u.price) return;
      S.coins -= u.price; S.power[u.id] = (S.power[u.id] || 0) + 1; save(true); SFX.item(); draw();
    });
  };
  draw();
}
function refreshPlayer() {
  document.getElementById("brandav").innerHTML = playerAv("happy");
  const c = document.getElementById("chiiAv"); if (c) { c.className = "av " + frameCls(); c.innerHTML = avatar("chiikawa", R ? R.mood : "normal"); }
  renderTools();
}

/* ============================================================
   6d. Leaderboard: the 10 most dedicated players.
   Needs a free Google Apps Script web app (see leaderboard/SETUP.md).
   Paste its /exec URL below. When empty, the game shows your own dedication points only.
   ============================================================ */
const LEADERBOARD_URL = "";
function dedication() {
  const t = Object.keys(S.trophies || {}).length;
  return S.stats.days * 10 + S.stats.correct + S.stats.rushRounds * 5 + S.completed_rooms.length * 10 + t * 25;
}
function lbPayload() {
  return { id: S.player_id, name: String(S.player_name || "Student").slice(0, 16), score: dedication(), days: S.stats.days, streak: S.longest_streak, trophies: Object.keys(S.trophies || {}).length };
}
async function lbSubmit(force) {
  if (!LEADERBOARD_URL || !S) return null;
  if (!force && Date.now() - (S.lb_last || 0) < 60000) return null;
  S.lb_last = Date.now(); save();
  try { const r = await fetch(LEADERBOARD_URL, { method: "POST", body: JSON.stringify(lbPayload()) }); return await r.json(); } catch (e) { return null; }
}
async function lbFetch() {
  try { const r = await fetch(`${LEADERBOARD_URL}?id=${encodeURIComponent(S.player_id)}`); return await r.json(); } catch (e) { return null; }
}
function openLeaderboard() {
  const mine = `<div class="preview row" style="justify-content:space-between"><span class="row" style="gap:8px">${playerAv("happy").replace("<svg", '<svg width="40" height="40"')}<b>${esc(S.player_name)}</b></span><span><b>${dedication()}</b> ${"dedication points"}</span></div>`;
  const how = `<p class="small muted">${"Dedication points = 10 per day played + 1 per lock opened + 10 per room escaped + 5 per Cell Rush round + 25 per trophy. Coming back every day matters most!"}</p>`;
  const nameBox = `<div class="row"><label for="lbName" class="small"><b>${"Your nickname on the board:"}</b></label><input id="lbName" class="name" maxlength="16" value="${esc(S.player_name)}" style="max-width:200px"><button class="btn plain" id="lbSave">${"Save"}</button></div>
    <p class="small muted">${"Please use a nickname, not your full name."}</p>`;
  const box = openModal(`<span class="kicker">🏅 ${"Leaderboard"}</span><h2>${"Top 10 most dedicated players"}</h2>${mine}${how}
    <div id="lbBody">${LEADERBOARD_URL ? `<p>${"Loading the board... ⏳"}</p>` : say("hachiware", "The class leaderboard isn't switched on yet. Your teacher can connect it in about 5 minutes (see <b>leaderboard/SETUP.md</b> in the project). Until then, your dedication points are saved on this device.", "normal", "hint")}</div>${nameBox}`, { wide: true });
  document.getElementById("lbSave").onclick = () => {
    const v = document.getElementById("lbName").value.trim(); if (!v) return;
    S.player_name = v.slice(0, 16); save(true); toast("Nickname saved ✓"); lbSubmit(true).then(() => openLeaderboard());
  };
  if (!LEADERBOARD_URL) return;
  lbSubmit(true).then(() => lbFetch()).then(d => {
    const body = document.getElementById("lbBody"); if (!body) return;
    if (!d || !d.top) { body.innerHTML = say("chiikawa", "Wah... the board couldn't load. Check your internet and try again.", "cry"); return; }
    const medal = i => ["🥇", "🥈", "🥉"][i] || String(i + 1);
    body.innerHTML = `<div class="lb-wrap"><table class="lb"><thead><tr><th>#</th><th>${"Player"}</th><th>${"Points"}</th><th>🔥 ${"Best streak"}</th><th>🏆</th></tr></thead><tbody>
      ${d.top.map((r, i) => `<tr class="${r.id === S.player_id ? "me" : ""}"><td class="rk">${medal(i)}</td><td>${esc(r.name)}</td><td>${Number(r.score) || 0}</td><td>${Number(r.streak) || 0}</td><td>${Number(r.trophies) || 0}</td></tr>`).join("") || `<tr><td colspan="5">${"No players yet. Be the first!"}</td></tr>`}
    </tbody></table></div>${d.me && d.me.rank > 10 ? `<p class="small"><b>${"Your rank"}: #${d.me.rank}</b>. ${"Keep going to reach the top 10! 💪"}</p>` : ""}`;
  });
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
    ${say("usagi", "Yaha! Answer as many as you can before time runs out! 🐰", "happy")}
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
  closeModal(); stopTimer(); if (R) clearTimeout(R.introT); R = null; stopRush();
  MUSIC.setMode("rush"); renderTools();
  RU = { score: 0, combo: 0, correct: 0, total: 0, end: Date.now() + RUSH_SECONDS * 1000, lock: false, last: -1 };
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
  let coins = Math.ceil(r.score / 10); if (bonus && r.total > 0) coins *= 2;
  if (r.total > 0) { S.rush.lastDay = today(); S.stats.rushRounds += 1; }
  const best = r.score > S.rush.best; S.rush.best = Math.max(S.rush.best, r.score);
  const rcap = r.score >= 120 ? 1 : 0; S.coll.pending += rcap;
  S.coins += coins; save(true); checkTrophies(); lbSubmit(true);
  SFX.fanfare(); if (r.score > 0) confetti(120);
  openModal(`<span class="kicker">⚡ ${"Cell Rush · Round over"}</span><h2>${best ? "🎉 New best score!" : "Time's up!"}</h2>
    <div class="row" style="justify-content:center;gap:18px;font-size:1.2rem"><b>${r.score} ${"pts"}</b><span>✅ ${r.correct}/${r.total}</span><span class="pill coinpill">+${coins} 🌰${bonus && r.total > 0 ? " (×2 daily bonus)" : ""}</span>${rcap ? `<span class="pill rpill">🎁 +1 capsule</span>` : ""}</div>
    ${say(r.correct >= 8 ? "usagi" : "hachiware", r.correct >= 8 ? "YAHA!!! Amazing rush! 🐰🎊" : "Nice try! Every round makes your brain faster. 🌱", "happy", r.correct >= 8 ? "" : "hint")}
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
  const justSaved = Date.now() - savedFlash < 2500;
  document.getElementById("tools").innerHTML = `
    ${S ? `<span class="pill" title="${"Daily streak"}">🔥 ${S.current_streak}</span>` : ""}
    ${S ? `<span class="pill ${justSaved ? "saved" : ""}" title="${"Your progress saves automatically on this device"}">${justSaved ? `✓<span class="lbl"> ${"Saved"}</span>` : `💾<span class="lbl"> ${"Auto-save"}</span>`}</span>` : ""}
    ${S ? `<button class="iconbtn coinpill" id="tCoins" aria-label="${"Chestnuts"}: ${S.coins}">🌰 ${S.coins}</button>` : ""}
    ${S ? `<button class="iconbtn" id="tTrophy" aria-label="${"Open the Trophy Cabinet"}">🏆<span class="lbl">${"Trophies"}</span></button>` : ""}
    ${S && S.coll.pending ? `<button class="iconbtn capbtn" id="tCap" aria-label="Open ${S.coll.pending} capsule${S.coll.pending > 1 ? "s" : ""}">🎁<span class="lbl"> ${S.coll.pending}</span></button>` : ""}
    <button class="iconbtn" id="tJournal" aria-label="${"Open the Study Journal"}">📓<span class="lbl">${"Journal"}</span></button>
    ${S ? `<button class="iconbtn" id="tSave" aria-label="${"Save and share code"}">🔑<span class="lbl">${"Save code"}</span></button>` : ""}
    <button class="iconbtn" id="tMus" aria-label="${MUSIC.on ? "Turn music off" : "Turn music on"}" title="Background music: ${esc((SONGS[MUSIC.mode] || SONGS.map).title)}" aria-pressed="${MUSIC.on}" style="${MUSIC.on ? "" : "opacity:.5;text-decoration:line-through"}">🎵<span class="lbl">${MUSIC.on ? "Music on" : "Music off"}</span></button>
    <button class="iconbtn" id="tSnd" aria-label="${SFX.on ? "Turn sound effects off" : "Turn sound effects on"}" title="${"Sound effects"}">${SFX.on ? "🔊" : "🔇"}</button>`;
  document.getElementById("tJournal").onclick = () => { SFX.init(); SFX.tap(); openJournal(); };
  const tc = document.getElementById("tCoins"); if (tc) tc.onclick = () => { SFX.init(); SFX.tap(); openShop(); };
  const tcap = document.getElementById("tCap"); if (tcap) tcap.onclick = () => { SFX.init(); SFX.tap(); openCapsule(); };
  const tt = document.getElementById("tTrophy"); if (tt) tt.onclick = () => { SFX.init(); SFX.tap(); openCabinet(); };
  const ts = document.getElementById("tSave"); if (ts) ts.onclick = () => { SFX.init(); SFX.tap(); openSaveModal(); };
  document.getElementById("tMus").onclick = () => {
    MUSIC.on = !MUSIC.on; try { localStorage.setItem(MUSIC_KEY, MUSIC.on ? "on" : "off"); } catch (e) {}
    MUSIC.on ? MUSIC.start() : MUSIC.stop(); renderTools();
  };
  document.getElementById("tSnd").onclick = () => {
    SFX.on = !SFX.on; try { localStorage.setItem(SOUND_KEY, SFX.on ? "on" : "off"); } catch (e) {}
    if (SFX.on) { SFX.init(); SFX.tap(); } renderTools();
  };
  clearTimeout(renderTools._t);
  if (justSaved) renderTools._t = setTimeout(renderTools, 2600);
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
        ${r.terms.map(([t, m]) => `<tr class="${highlight.includes(t) ? "hl" : ""}"><td><b>${esc(t)}</b></td><td>${esc(m)}</td></tr>`).join("")}</tbody></table>
        ${highlight.length ? `<p class="small muted">Highlighted terms are used in the puzzle you're on.</p>` : ""}</section>
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
    ${say("hachiware", "Your game saves automatically on this device. To carry on using <b>another</b> device (e.g. a school iPad), use this code!", "normal", "hint")}
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
    msg.innerHTML = `${codePreview(d)}${say("hachiware", "Load this progress? It will replace the progress on this device.", "normal", "hint")}
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
    ${r ? say("hachiware", `Next right step: <b>${esc(r.name)}</b> (${stageLabel(r)}: ${esc(r.focus)})${solved ? ` with <b>${solved}/5</b> locks already open` : ""}. Just this one stage today! 🌱`, "normal", "hint") : say("hachiware", "You've escaped every stage! Replay any stage to practise.", "happy", "hint")}
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
    ${S ? say("hachiware", "This device already has saved progress. Loading the code will replace it.", "normal", "hint") : `<label for="nm2"><b>What's your name?</b></label><input id="nm2" class="name" maxlength="24" placeholder="Your name or nickname" autocomplete="off">`}
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
const castHtml = moods => `<div class="cast">${["usagi", "hachiware", "chiikawa", "momonga", "kurimanju"].map(w => `<div class="fig">${figure(w, (moods && moods[w]) || "normal")}</div>`).join("")}</div>`;
const starsBg = () => `<div class="stars" aria-hidden="true">${[[6, 14], [18, 40], [30, 10], [52, 22], [70, 8], [84, 30], [94, 12], [62, 44]].map(([x, y], i) => `<span style="left:${x}%;top:${y}%;animation-delay:${-i * .4}s">✦</span>`).join("")}</div>`;
const HERO_KICKER = "A cosy biology adventure · Secondary 4–6";

function renderWelcome() {
  stopRush(); MUSIC.setMode("map"); stopTimer(); R = null; renderTools();
  $app.innerHTML = `
    <section class="hero">${starsBg()}
      <span class="kicker" style="color:#fff">${HERO_KICKER}</span>
      <h1>Chiikawa Bio Escape</h1>
      <p class="sub">${TOPICS.length} topics · ${ROOMS.length} stages · 1 stage a day · about 15–20 minutes</p>
      ${castHtml({ chiikawa: "cry", usagi: "happy", momonga: "shock" })}
    </section>
    <section class="card">
      ${say("chiikawa", "Ya...!! 😭 We fell asleep in the biology lab... and woke up TINY, inside a giant cell world!", "cry")}
      ${say("hachiware", "Every door is locked with a biology puzzle, from tiny cells all the way to ecosystems and staying healthy. Each topic is a series of stages (Photosynthesis has 6!), and the last one is a <b>boss stage</b> guarded by Rakko. Each lock needs <b>3 questions</b> in a row to open. Nantoka naare~! Will you help us escape? ✨", "normal", "hint")}
      ${say("usagi", "YAHA! Let's GO! 🐰💥", "happy")}
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
    checkIn(); save(true); enterRoom(topicRooms(ti)[0].id);
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
  return `<button class="stage ${done ? "done" : ""} ${i === ni ? "next" : ""} ${r.boss ? "boss" : ""}" data-room="${r.id}" ${open ? "" : "disabled"} aria-label="${esc(stageLabel(r))}: ${esc(r.name)}${done ? `, ${roomStars(r)} stars` : open ? "" : ", locked"}">
    <span class="sn">${r.boss ? "⚔️" : r.s}</span>
    <span style="min-width:0"><span class="sname">${open ? "" : "🔒 "}${esc(r.name)}</span><span class="ssub">${esc(r.focus)}${open ? ` · 📚 ${masteredIn(r)}/${r.pool.length} mastered` : ""}</span></span>
    <span class="sstar">${done ? starStr(roomStars(r)) : open ? `🔑 ${n}/5` : ""}</span>
  </button>`;
}
let mapPart = null;
function renderMap() {
  stopRush(); MUSIC.setMode("map"); stopTimer(); lbSubmit(); if (R) clearTimeout(R.introT); R = null; recomputeMastery(); save(); renderTools();
  const ni = nextRoomIndex(), allDone = ni === -1, chestReady = S.last_chest_date !== today(), nr = allDone ? null : ROOMS[ni];
  const totalStars = ROOMS.reduce((a, r) => a + roomStars(r), 0);
  if (mapPart === null) mapPart = nr ? TOPICS[nr.t].p : 0;
  $app.innerHTML = `
    <section class="hero">${starsBg()}
      <span class="kicker" style="color:#fff">${HERO_KICKER}</span>
      <h1>Hi, ${esc(S.player_name)}!</h1>
      <p class="sub">${allDone ? "You escaped EVERY stage! 🎉" : `Next: ${stageLabel(nr)} · ${esc(nr.name)}`}</p>
      ${castHtml(allDone ? { chiikawa: "sparkle", hachiware: "happy", usagi: "happy", momonga: "happy", kurimanju: "happy" } : { usagi: "happy", chiikawa: S.completed_rooms.length ? "happy" : "normal" })}
    </section>
    ${streakNote ? `<section class="card cream"><b>${esc(streakNote)}</b></section>` : ""}
    <section class="card">
      ${allDone ? say("chiikawa", "We escaped EVERY stage! 🥹🎉 Replay stages to earn 3 stars and master every question.", "sparkle") : say("hachiware", `Your next right step: just <b>one</b> stage today. ${nr.boss ? "It's a <b>boss stage</b>, but you're ready! ⚔️" : "Small steps grow into big brains! 🌱"}`, "normal", "hint")}
      <div class="row">
        ${!allDone ? `<button class="btn big" data-room="${nr.id}">▶ Enter ${esc(nr.name)}</button>` : ""}
        <button class="btn yellow" id="chest" ${chestReady ? "" : "disabled"}>${chestReady ? "🎁 Daily snack chest" : "🎁 Opened. Back tomorrow!"}</button>
      </div>
    </section>
    <section class="card">
      <div class="row" style="justify-content:space-between"><h2>🗺️ Topic map</h2><span class="pill">⭐ ${totalStars} / ${ROOMS.length * 3} · 🚪 ${S.completed_rooms.length} / ${ROOMS.length}</span></div>
      <p class="small muted">Every topic is open. Inside a topic, clear the stages in order; the last one is a ⚔️ boss stage. Each stage is a different room: labs, gardens, even inside a cell!</p>
      <div class="tabs" role="tablist" aria-label="Curriculum parts">${PARTS.map((P, pi) => { const n = TOPICS.filter(T => T.p === pi).length, d = TOPICS.filter((T, ti) => T.p === pi && stagesDone(ti) === topicRooms(ti).length).length;
        return `<button class="tab" role="tab" aria-selected="${pi === mapPart}" data-part="${pi}">Part ${esc(P)} <span class="small">${d}/${n}</span></button>`; }).join("")}</div>
      <div class="tgrid">${TOPICS.map((T, ti) => { if (T.p !== mapPart) return "";
        const rs = topicRooms(ti), d = stagesDone(ti), cur = nr && nr.t === ti;
        const nT = rs.length;
        return `<div class="tcard ${d === nT ? "done" : ""} ${cur ? "next" : ""}">
          <div class="thead"><span class="ticon" aria-hidden="true">${T.icon}</span><span style="min-width:0"><span class="tnum">Topic ${T.no}${d === nT ? " · 🏅 cleared" : ` · ${nT} stages`}</span><br><span class="tname">${esc(T.name)}</span></span></div>
          <div class="tprog" aria-label="${d} of ${nT} stages escaped"><i style="width:${Math.round(100 * d / nT)}%"></i></div>
          <div class="stages">${rs.map(r => stageBtn(r, roomIndex(r.id), ni)).join("")}</div>
        </div>`; }).join("")}</div>
    </section>
    <section class="card">
      <h2>🎮 Game modes</h2>
      <div class="modes">
        <button class="mode rush" id="mRush"><h3>⚡ Cell Rush</h3><span class="muted small">60 seconds of mixed quick questions from every topic. Earn 🌰 chestnuts for outfits and power-ups.</span><span class="small">Best: <b>${S.rush.best}</b> pts ${S.rush.lastDay !== today() ? "· <b>×2 today!</b>" : ""}</span></button>
        <button class="mode note" id="mNote"><h3>📕 Mistake Notebook</h3><span class="muted small">Every question you got wrong, saved so you can fix it calmly. Get each right twice to clear it.</span><span class="small"><b>${mistakeKeys().length}</b> to fix · ${S.mistakes_cleared || 0} cleared</span></button>
        <button class="mode" id="mShop"><h3>👗 Shisa's Shop</h3><span class="muted small">Dress up Chiikawa and buy power-ups for the escape rooms.</span><span class="small">🌰 <b>${S.coins}</b> chestnuts</span></button>
        <button class="mode coll-mode" id="mColl"><h3>🧸 Capsule Collection</h3><span class="muted small">20 cute collectibles to find, including 5 ✨ rare ones. Open capsules you earn from playing.</span><span class="small"><b>${collOwned()}</b>/${COLLECTIBLES.length} collected${S.coll.pending ? ` · <b>🎁 ${S.coll.pending} to open!</b>` : ""}</span></button>
        <button class="mode" id="mLb"><h3>🏅 Leaderboard</h3><span class="muted small">The 10 most dedicated players.</span><span class="small">Your points: <b>${dedication()}</b></span></button>
      </div>
    </section>
    <section class="card">
      <h2>📈 Biology mastery</h2>
      <p class="small muted">Each stage has 15–20 questions from 🌱 Easy to ⭐ Expert, including graph reading, plus spelling practice for its key terms. Mastery goes up when you answer one right on the first try without a hint. Replay cleared stages to master them all! The first replay each day earns a 📚 revision bonus.</p>
      ${TOPICS.map((T, ti) => { const v = S.bio_mastery[T.id]; return `${!ti || TOPICS[ti - 1].p !== T.p ? `<h3 class="small" style="margin-top:6px">Part ${esc(T.part)}</h3>` : ""}<div><div class="row" style="justify-content:space-between"><b class="small">${TOPIC_LABELS[T.id]}</b><b class="small">${v}%</b></div>
        <div class="tprog"><i style="width:${v}%"></i></div></div>`; }).join("")}
    </section>
    <section class="card cream cabinet" id="cabinet">${cabinetHtml(false)}</section>
    <section class="card">
      <h2>🎒 Backpack</h2>
      <div class="bag">${S.chiikawa_badges.concat(S.inventory).map(b => `<span class="tag">${esc(b)}</span>`).join("") || `<span class="muted small">Empty. Escape a stage or open the daily chest!</span>`}</div>
      <p class="small muted">🔥 Longest streak: ${S.longest_streak} days · 🛡️ Shields: ${S.streak_shields} (a shield saves your streak if you miss a day)</p>
    </section>`;
  $app.querySelectorAll("[data-room]").forEach(b => b.onclick = () => { SFX.init(); SFX.tap(); streakNote = ""; enterRoom(b.dataset.room); });
  $app.querySelectorAll("[data-part]").forEach(b => b.onclick = () => { SFX.tap(); mapPart = Number(b.dataset.part); const y = window.scrollY; renderMap(); window.scrollTo({ top: y }); });
  document.getElementById("mRush").onclick = () => { SFX.init(); SFX.tap(); rushIntro(); };
  document.getElementById("mShop").onclick = () => { SFX.init(); SFX.tap(); openShop(); };
  document.getElementById("mNote").onclick = () => { SFX.init(); SFX.tap(); renderNotebook(); };
  document.getElementById("mLb").onclick = () => { SFX.init(); SFX.tap(); openLeaderboard(); };
  document.getElementById("mColl").onclick = () => { SFX.init(); SFX.tap(); openAlbum(); };
  const oc = document.getElementById("openCab"); if (oc) oc.onclick = () => { SFX.init(); SFX.tap(); openCabinet(); };
  const c = document.getElementById("chest");
  if (chestReady) c.onclick = () => {
    SFX.init(); SFX.fanfare(); confetti(70);
    const snack = pick(SNACKS); S.inventory.push(snack);
    let extra = ""; if (Math.random() < .2 && S.streak_shields < 3) { S.streak_shields++; extra = " …and a 🛡️ shield!"; }
    S.last_chest_date = today(); S.stats.chests += 1; S.coll.pending += 1; streakNote = `🎁 Kuri-Manju opened the chest: ${snack}${extra} …plus a mystery capsule!`; save(true); renderMap(); checkTrophies(); openCapsule();
  };
}

/* ----- 📕 Mistake Notebook: revise the questions you got wrong ----- */
const shortQ = t => (t.length > 110 ? t.slice(0, 107) + "…" : t);
function renderNotebook() {
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
      ${say("hachiware", all.length ? "Every mistake you make in the escape rooms, Cell Rush and incidents is saved here. Answer one right <b>twice in a row</b> to clear it from the notebook. Every mistake is a clue that makes your brain stronger! 🗺️" : "Your notebook is empty. Play escape rooms and Cell Rush; any question you miss will appear here for focused revision. 🌱", "normal", "hint")}
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
        <span class="small muted">${TOPICS[x.r.t].icon} ${esc(stageLabel(x.r))} · ${esc(x.r.name)}${x.p.gen ? " · ✏️ spelling" : x.p.graph ? " · 📈 graph" : ""}</span>
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
  const RV = { keys, at: 0, right: 0, cleared: 0 };
  const next = () => {
    if (RV.at >= RV.keys.length) {
      const coins = RV.cleared * 2 + RV.right; S.coins += coins; save(true); SFX.fanfare(); if (RV.right) confetti(100);
      $app.innerHTML = `<section class="card"><span class="kicker">📕 Revision done</span><h2>${RV.right === RV.keys.length ? "Perfect revision! 🎉" : "Revision complete! 🌱"}</h2>
        <div class="cast" style="margin:0">${["chiikawa", "hachiware", "usagi"].map(w => `<div class="fig" style="width:84px">${figure(w, RV.right ? (w === "chiikawa" ? "sparkle" : "happy") : "normal")}</div>`).join("")}</div>
        <p style="text-align:center"><b>${RV.right}/${RV.keys.length}</b> right · <b>${RV.cleared}</b> cleared from the notebook · <span class="pill coinpill">+${coins} 🌰</span></p>
        ${say(RV.cleared ? "momonga" : "hachiware", RV.cleared ? "You wiped mistakes out of the notebook! I'm... a little impressed. 💜" : "Getting them right once is a great start. Get each one right again next time to clear it! ✨", RV.cleared ? "sparkle" : "happy", RV.cleared ? "" : "hint")}
        <div class="row"><button class="btn big" id="rvAgain">📕 Back to the notebook</button><button class="btn plain" id="rvMap">🗺️ Map</button></div></section>`;
      document.getElementById("rvAgain").onclick = () => { SFX.tap(); renderNotebook(); };
      document.getElementById("rvMap").onclick = () => { SFX.tap(); renderMap(); };
      return;
    }
    const k = RV.keys[RV.at], { r, p } = mistakeQ(k), m = S.mistakes[k] || { n: 0, ok: 0 };
    $app.innerHTML = `<section class="rushhead"><div class="status"><div class="av">${avatar("chiikawa", "brave")}</div><div><div class="rtopic" style="color:var(--yellow)">📕 Mistake Notebook${ti == null ? "" : ` · ${esc(TOPICS[ti].name)}`}</div><div class="big">Question ${RV.at + 1} of ${RV.keys.length}</div></div></div>
        <span class="combo">✓ ${m.ok}/2 to clear</span></section>
      <section class="card"><span class="kicker">${TOPICS[r.t].icon} ${esc(stageLabel(r))} · ${esc(r.focus)} ${diffChip(p.b)}</span>
        <p class="q">${esc(p.q)}</p>${p.svg ? `<div class="diagram-box">${DIAGRAMS[p.svg]}</div>` : ""}
        <div id="rvAns"></div><div class="row"><button class="btn blue" id="rvHint">💡 Hint</button><button class="btn plain" id="rvJ">📓 Notes</button><button class="btn plain" id="rvQuit">✕ Stop</button></div><div id="rvFb"></div></section>`;
    document.getElementById("rvHint").onclick = () => { SFX.hint(); document.getElementById("rvFb").innerHTML = say("hachiware", `💡 ${esc(p.hint)}`, "normal", "hint"); RV.hinted = true; };
    document.getElementById("rvJ").onclick = () => { SFX.tap(); openJournal(r.id, termsIn(r, p)); };
    document.getElementById("rvQuit").onclick = () => { SFX.tap(); RV.at = RV.keys.length; next(); };
    RV.hinted = false;
    miniQuiz(document.getElementById("rvAns"), p, ok => {
      const fb = document.getElementById("rvFb");
      if (ok) { RV.right++; SFX.right(); if (noteRight(r.id, p.id, !RV.hinted)) RV.cleared++; else if (RV.hinted) toast("Right! (Used a hint, so it stays in the notebook for now.)"); }
      else { SFX.wrong(); noteMistake(r.id, p.id); }
      save();
      fb.innerHTML = `<div class="fb ${ok ? "ok" : "no"}">${ok ? say("usagi", "Yaha! Got it! 🐰", "happy") : say("chiikawa", "Uu... not yet. Let's read why. 🥺", "cry")}<p>${esc(p.explain)}</p>${p.tip ? `<p class="tip"><b>📝 Top tip:</b> ${esc(p.tip)}</p>` : ""}
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
      <svg x="468" y="372" width="84" height="116" viewBox="${FIG_VB}" aria-hidden="true">${figure("rakko", "brave").replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</svg>` : ""}
  </svg>`;
}

let R = null, timerId = null, moodTimer = null;
const masteredIn = r => r.pool.filter(p => S.mastered_puzzles.includes(`${r.id}:${p.id}`)).length;
/* Each lock needs 3 questions in a row. Locks climb Bloom's levels; spelling questions are capped
   at 3 per visit (one per lock), and recently seen questions are skipped when possible. */
const LOCK_Q = 3;
const BANDS = [[[1, 2], [1, 2], [2, 3]], [[1, 2], [2, 3], [3, 4]], [[2, 3], [3, 4], [3, 4]], [[3, 4], [4, 5], [4, 5]], [[4, 5], [5, 6], [5, 6]]];
function pickRun(room) {
  const seen = S.seen[room.id] || [], chosen = [];
  let spells = 0;
  BANDS.forEach(bands => {
    let lockSpell = false;
    bands.forEach(([lo, hi]) => {
      const ok = p => !chosen.includes(p.id) && (!p.gen || (spells < 3 && !lockSpell));
      let c = room.pool.filter(p => ok(p) && p.b >= lo && p.b <= hi);
      if (!c.length) c = room.pool.filter(p => ok(p) && p.b >= lo - 1 && p.b <= hi + 1);
      if (!c.length) c = room.pool.filter(ok);
      if (!c.length) c = room.pool.filter(p => !chosen.includes(p.id));
      const fresh = c.filter(p => !seen.includes(p.id)), q = pick(fresh.length ? fresh : c);
      chosen.push(q.id); if (q.gen) { spells++; lockSpell = true; }
    });
  });
  S.seen[room.id] = seen.concat(chosen).slice(-45);
  return chosen;
}
const runQs = room => { const ids = S.room_run[room.id].qids; return [0, 1, 2, 3, 4].map(i => ids.slice(i * LOCK_Q, i * LOCK_Q + LOCK_Q).map(id => room.pool.find(p => p.id === id) || room.pool[0])); };
const stepOf = i => ((S.room_run[R.room.id].steps || {})[i]) || 0;
const curQ = i => R.qs[i][Math.min(LOCK_Q - 1, stepOf(i))];
const akey = i => `${i}_${stepOf(i)}`;
function stopTimer() { if (timerId) clearInterval(timerId); timerId = null; }

function enterRoom(id) {
  stopRush();
  const room = ROOMS[roomIndex(id)];
  const replay = S.completed_rooms.includes(room.id);
  if (replay || !S.room_run[room.id]) S.room_run[room.id] = freshRun();
  const rr = S.room_run[room.id];
  if (!rr.qids || rr.qids.length !== 5 * LOCK_Q) { rr.qids = pickRun(room); rr.steps = {}; }
  if (!rr.steps) rr.steps = {};
  HOTSPOTS = (SCENES[room.scene] || SCENES.library).hs; DOOR = (SCENES[room.scene] || SCENES.library).door;
  if (replay) { S.room_progress[room.id] = []; S.room_timer[room.id] = ROOM_SECONDS; }
  if (S.room_timer[room.id] == null) S.room_timer[room.id] = ROOM_SECONDS;
  S.current_room = room.id; save(); MUSIC.setMode(room.boss ? "boss" : SCENE_SONG[room.scene] || "room");
  if (R) clearTimeout(R.introT);
  if (R) clearTimeout(R.incT);
  R = { room, replay, mood: "normal", att: {}, hinted: {}, jam: {}, lastWrongAt: 0, qs: runQs(room), incidents: 0, used: [], stolen: null, hiddenHs: null };
  const me = R; R.incT = setTimeout(() => tryIncident(me), (replay ? 25 : 40) * 1000 + Math.random() * 40000);
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
    me.introT = setTimeout(k < lines.length ? step : () => R === me && setLine("hachiware", "Tap a glowing <b>?</b> to start. ⚠️ Careful: a wrong answer costs <b>10 seconds</b> and shuffles the lock. Guessing makes the lock <b>slip back a notch</b> (one bonus question to climb back), jams it for a few seconds, costs 🌰 chestnuts and can make the lights go dim. Think first! And watch out for strange happenings in the dark... 👀 (Stuck? Tap 📓 for the textbook notes.)"), k < lines.length ? 2600 : 3200);
  };
  step();
}
function setLine(who, html, mood = "normal") {
  const el = document.getElementById("line"); if (!el) return;
  el.innerHTML = say(who, html, mood, who === "hachiware" ? "hint" : "");
}
function setMood(m, ms) {
  if (!R) return; R.mood = m;
  const el = document.getElementById("chiiAv"); if (el) el.innerHTML = avatar("chiikawa", m);
  const st = document.getElementById("chiiSt"); if (st) st.textContent = { normal: "Chiikawa is ready", happy: "Chiikawa is happy!", cry: "Chiikawa is nervous... 🥺", shock: "Chiikawa is shocked! 😱", sparkle: "Chiikawa is sparkling! ✨", brave: "Chiikawa is being brave! 💪" }[m];
  clearTimeout(moodTimer);
  if (ms) moodTimer = setTimeout(() => R && setMood(S.room_timer[R.room.id] < 120 ? "cry" : "normal"), ms);
}
function tickTimer() {
  if (!R || document.hidden) return;
  const id = R.room.id, now = Date.now();
  const frozen = R.freezeUntil > now, warp = R.warpUntil > now;
  if (!frozen) S.room_timer[id] -= warp ? 2 : 1;
  const t = S.room_timer[id];
  const el = document.getElementById("timer");
  if (el) { el.textContent = t >= 0 ? fmt(t) : `${"OVERTIME"} ${fmt(t)}`; el.className = "timer" + (t < 0 ? " over" : t < 120 ? " low" : "") + (frozen ? " frozen" : warp ? " warp" : ""); }
  if (t === 120) { setMood("shock"); setLine("chiikawa", "EHHH?! Only 2 minutes left?! 😱", "shock"); }
  if (t === 0) setLine("hachiware", "Time's up, but don't worry! We can keep going in overtime. No penalty! 🌱");
  if (t > 0 && t <= 10) SFX.tick();
  if (t % 5 === 0) save();
  if (R.blackUntil && now > R.blackUntil) { R.blackUntil = 0; const sc = document.getElementById("scene"); if (sc) { sc.classList.remove("blackout"); sc.style.setProperty("--dim", R.room.dim); } }
}
function renderRoom() {
  renderTools();
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
          <div class="small" id="chiiSt">${"Chiikawa is ready"}</div></div>
      </div>
      <div style="display:grid;justify-items:end;gap:4px">
        <div class="timer ${t < 0 ? "over" : t < 120 ? "low" : ""}" id="timer" role="timer" aria-label="${"Time left"}">${t >= 0 ? fmt(t) : `${"OVERTIME"} ${fmt(t)}`}</div>
        <span class="small">🔓 ${solved.length}/5 ${"locks"} · 🚪 ${solved.length === 5 ? "code ready!" : "door locked"}</span>
        <span class="strikes" id="strikes" title="${"Guess strikes: 3 strikes = −1 star, 6 strikes = −2 stars"}">⚠️ ${"Strikes"} ${S.room_run[room.id].strikes}</span>
      </div>
    </section>
    <div id="line"></div>
    <section class="scene-wrap">
      <div class="scene ${R.blackUntil > Date.now() ? "blackout" : ""}" id="scene" style="--dim:${R.blackUntil > Date.now() ? .94 : room.dim}">
        ${sceneSvg(room, solved.length)}
        <div class="dark"></div>
        ${HOTSPOTS.map((h, i) => {
          const nm = i === 2 ? room.specialName : h.name, done = solved.includes(i);
          if (R.hiddenHs === i && !done) return "";
          return `<button class="hs ${done ? "done" : ""}" data-hs="${i}" style="left:${h.x}%;top:${h.y}%" aria-label="${esc(nm)}${done ? " (solved)" : stepOf(i) ? ` (${stepOf(i)} of ${LOCK_Q} questions done)` : ""}">${done ? "✓" : stepOf(i) ? `<small>${stepOf(i)}/${LOCK_Q}</small>` : "?"}<span class="lbl">${esc(nm)}</span></button>`;
        }).join("")}
        ${R.stolen !== null ? `<button class="hs wolv" data-wolf="1" style="left:${R.wolfX}%;top:${R.wolfY}%" aria-label="${"Catch the wolverine"}">🐾<span class="lbl">${"Wolverine!"}</span></button>` : ""}
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
  wireSlots();
  document.getElementById("toMap").onclick = () => { SFX.tap(); save(); renderMap(); };
  document.getElementById("openJ").onclick = () => { SFX.tap(); openJournal(room.id); };
  setLine("hachiware", "Tap a glowing <b>?</b> to find a puzzle.");
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
    <span class="kicker">${typeLabel} · T${room.topicNo} ${room.boss ? "Boss" : `S${room.s}`} ${diffChip(p.b)}</span>
    <h2>${esc(hsName)}</h2>
    <div class="lockprog" aria-label="Question ${step + 1} of ${LOCK_Q} for this lock">${Array.from({ length: LOCK_Q }, (_, n) => `<i class="${n < step ? "on" : n === step ? "cur" : ""}"></i>`).join("")}<span class="small"><b>Question ${step + 1} of ${LOCK_Q}</b> to open this lock</span></div>
    ${step ? say("chiikawa", pick(["Keep going! One more click and the lock wiggles... 🔐", "It's working! The lock is loosening! ✨", "Ya...! Almost there! 🥹"]), "brave")
      : room.boss && p.b >= 5 ? say("rakko", "A hard one. Think like a scientist: read every choice before you strike. ⚔️", "brave")
      : p.b >= 5 ? say("chiikawa", `${esc(line)} ...Eh?! This one looks HARD! 😱`, "shock") : say("chiikawa", esc(line), p.b >= 3 ? "brave" : "normal")}
    <p class="q">${esc(p.q)}</p>
    ${p.svg ? `<div class="diagram-box">${DIAGRAMS[p.svg]}</div>` : ""}
    <div id="jamBox"></div>
    <div id="ans">${answerUi(p)}</div>
    <div class="row"><button class="btn blue" id="hint">💡 Hint from Hachiware</button><button class="btn plain" id="pj">📓 Journal</button></div>
    <div class="pwr" id="pwr"></div>
    <div id="pfb"></div>`, { wide: true });
  renderPwr(p, i);
  document.getElementById("hint").onclick = () => { SFX.hint(); markHint(i); document.getElementById("pfb").innerHTML = say("hachiware", `💡 ${esc(p.hint)}`, "normal", "hint"); };
  document.getElementById("pj").onclick = () => { SFX.tap(); openJournal(room.id, termsIn(room, p)); };
  wireAnswer(p, box);
  if (R.jam[i] > Date.now()) startJam(i, 0);
  if (R.noHintUntil > Date.now()) { const h = document.getElementById("hint"); h.disabled = true; h.textContent = "😴 Hachiware is sleepy..."; }
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
  const el = document.getElementById("pwr"); if (!el) return;
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
  const tEl = document.getElementById("timer"); if (!tEl || !R) return;
  const t = S.room_timer[R.room.id]; tEl.textContent = t >= 0 ? fmt(t) : `${"OVERTIME"} ${fmt(t)}`; tEl.className = "timer" + (t < 0 ? " over" : t < 120 ? " low" : "");
}
function dimLights() {
  if (!R) return; R.dimUntil = Date.now() + MAX_WAIT * 1000;
  const sc = document.getElementById("scene"); if (sc) sc.style.setProperty("--dim", Math.min(.9, R.room.dim + .25));
  const me = R; setTimeout(() => { if (R === me) { const s2 = document.getElementById("scene"); if (s2) s2.style.setProperty("--dim", R.room.dim); } }, MAX_WAIT * 1000);
}
function markHint(i) { R.hinted[akey(i)] = true; S.room_run[R.room.id].hints = true; save(); }
/* Anti-guessing: a lock jams for a while after a guess, and Hachiware's hint must be read. */
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
      <span class="small">${"Use this time to read Hachiware's hint below or open the 📓 Journal."}</span></div>`;
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
    <p class="small muted">${countLetters(p.answer)} letters · starts with “${esc(p.answer[0].toUpperCase())}”. British or American spelling are both fine.</p>
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
      if (sameSpelling(inp.value, p.answer)) { inp.disabled = true; document.getElementById("spOk").disabled = true; solve(); } else miss(box);
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
    document.getElementById("pfb").innerHTML = `<div class="fb no">${say("hachiware", `${"🛡️ The Guard charm blocked the penalty! Not the right answer though."} 💡 ${esc(p.hint)}`, "normal", "hint")}</div>`;
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
    ${say("hachiware", `${jam ? "Let's slow down and read carefully. Nantoka naare~!" : "Don't worry! We can figure this out together."} 💡 ${esc(p.hint)}`, "normal", "hint")}
    ${R.att[k] >= 2 ? (b => say(b[0], b[2], b[1]))(pick(REACT.brave)) : ""}</div>`;
  if (jam) startJam(i, jam, reason);
  if (slipped) {
    const ans = document.getElementById("ans"); if (ans) ans.inert = true;
    document.getElementById("slipGo").onclick = () => { SFX.tap(); openPuzzle(i); };
  }
}
/* Lock slip: step back one notch and swap in a fresh question of a similar level for that step. */
function slipLock(i) {
  const run = S.room_run[R.room.id], s = stepOf(i) - 1, old = R.qs[i][s], used = R.qs.flat().map(q => q.id);
  let c = R.room.pool.filter(q => !used.includes(q.id) && !q.gen && Math.abs(q.b - old.b) <= 1);
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
  recomputeMastery(); save(true);
  SFX.right(); if (last) setTimeout(() => yaha(), 150); setMood(firstTry ? "sparkle" : "happy", 4000);
  const [cw, cm, ct] = S.stats.run >= 3 ? ["momonga", "sparkle", `${S.stats.run} first-try answers in a row?! You're almost as amazing as me! 💜`] : firstTry ? pick(REACT.right) : ["chiikawa", "happy", "Phew... we got it! 🥹"];
  const kt = termsIn(room, p).map(t => room.terms.find(x => x[0] === t));
  setTimeout(checkTrophies, 1400);
  if (firstTry) confetti(last ? 40 : 20);
  document.getElementById("hint").hidden = true;
  const lp = document.querySelector(".lockprog"); if (lp) lp.querySelectorAll("i")[step].className = "on";
  document.getElementById("pfb").innerHTML = `<div class="fb ok">
    ${say(cw, `${esc(ct)} <b>${firstTry ? "First try! Mastery up 📈" : "Correct! ✔️"}</b>`, cm)}
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
  if (n === 5) setLine("hachiware", "All 5 code digits found! Tap the 🚪 <b>exit door</b> and enter the code!");
  else setLine("chiikawa", `Ya...! ${5 - n} more lock${5 - n === 1 ? "" : "s"} to go! 🔍`, "happy");
}

/* ----- Exit door ----- */
function openDoor() {
  const { room } = R;
  const solved = S.room_progress[room.id] || [];
  if (R.stolen !== null) { SFX.wrong(); setMood("cry", 2000); setLine("chiikawa", `The wolverine still has item #${R.stolen + 1}! Tap the 🐾 to catch it first.`, "cry"); return; }
  if (solved.length < 5) { SFX.wrong(); setMood("cry", 2000); setLine("chiikawa", `The door needs a 5-digit code... We have ${solved.length}/5 digits. Let's open more locks! 🔍`, "cry"); return; }
  SFX.click();
  const box = openModal(`
    <span class="kicker">${"Exit door · Keypad"}</span>
    <h2>🚪 ${"Enter the door code"}</h2>
    ${say("hachiware", "Use the digits on your items, in order #1 → #5.", "normal", "hint")}
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
  const earned = first ? (room.boss ? 25 : 15) : revise ? 20 : 5; S.coins = (S.coins || 0) + earned; R.done = true; clearTimeout(R.incT);
  if (tLeft >= 0 && run.strikes === 0) S.stats.cleanEscapes += 1;
  if (!run.hints) S.stats.noHintEscapes += 1;
  if (new Date().getHours() >= 21) S.stats.night += 1;
  const caps = first ? (room.boss ? 2 : 1) : Math.random() < .4 ? 1 : 0; S.coll.pending += caps;
  S.room_run[room.id] = freshRun();
  S.room_timer[room.id] = ROOM_SECONDS;
  const ni = nextRoomIndex(); S.current_room = ni === -1 ? room.id : ROOMS[ni].id;
  const nxt = ni === -1 ? null : ROOMS[ni];
  recomputeMastery(); save(true);
  SFX.door();
  document.getElementById("doorG").classList.add("door-open");
  setMood("sparkle"); setLine("usagi", "YAHA!!! The door is opening!!! 🐰🎊", "happy");
  setTimeout(() => {
    SFX.fanfare(); confetti(topicDone ? 260 : 180); yaha(topicDone ? "Topic cleared!!" : "Yaha!!");
    openModal(`
      <span class="kicker">Escaped! · ${esc(stageLabel(room))}</span>
      <h2>🎉 You escaped ${esc(room.name)}!</h2>
      <div class="cast" style="margin:0">${(room.boss ? ["usagi", "chiikawa", "rakko"] : ["usagi", "chiikawa", "hachiware"]).map(w => `<div class="fig" style="width:90px">${figure(w, w === "chiikawa" ? "sparkle" : "happy")}</div>`).join("")}</div>
      <div class="row" style="justify-content:center;font-size:1.8rem" aria-label="${stars} / 3 ★">${starStr(stars)}</div>
      <p style="text-align:center"><b>${n}/${5 * LOCK_Q}</b> questions right first try · ⏱️ ${fmt(Math.max(0, used))}${tLeft < 0 ? " (overtime)" : ""} · ⚠️ ${run.strikes} strike${run.strikes === 1 ? "" : "s"}</p>
      <p style="text-align:center"><span class="pill coinpill">+${earned} 🌰 chestnuts${revise ? " · 📚 daily revision bonus!" : ""}</span>${caps ? ` <span class="pill rpill">🎁 +${caps} capsule${caps > 1 ? "s" : ""}</span>` : ""}${R.incidents ? ` <span class="pill">👻 Incidents survived: ${R.incidents}</span>` : ""}</p>
      ${lost ? `<div class="rules">Guess strikes cost you <b>${lost} star${lost > 1 ? "s" : ""}</b> this time. Replay the stage and think before answering to win them back!</div>` : ""}
      ${room.boss && first ? say("rakko", "...Hmph. Not bad. You have the heart of a true biologist. ⚔️", "happy") : ""}
      ${topicDone ? say("momonga", `TOPIC ${T.no} CLEARED! You earned <b>${esc(T.badge)}</b>! Everyone is crying happy tears! 💜🥹`, "sparkle") : first ? say("momonga", `You earned <b>${esc(room.item)}</b>! 💜`, "happy") : say("kurimanju", "Replay complete. Practice makes the brain strong. 🍵", "happy")}
      <section class="card cream jsec"><h3>📖 Textbook recap: ${esc(room.focus)}</h3><ul>${room.notes.map(x => `<li>${x}</li>`).join("")}</ul></section>
      ${say("hachiware", !nxt ? "That was the final stage of every topic. You've explored every corner of the biology world! 🌟" : `That's today's mission done! 🌱 Rest your brain, or keep going if you feel great. Next: <b>${esc(stageLabel(nxt))}: ${esc(nxt.name)}</b>.`, "happy", "hint")}
      <div class="row">${caps ? `<button class="btn pink" id="eCap">🎁 Open capsule</button>` : ""}<button class="btn big" id="eMap">Back to the map</button>${nxt ? `<button class="btn blue" id="eNext">▶ Next stage</button>` : ""}<button class="btn yellow" id="eCode">🔑 Get my save code</button></div>`, { onClose: renderMap });
    document.getElementById("eMap").onclick = () => { SFX.tap(); closeModal(); renderMap(); };
    if (nxt) document.getElementById("eNext").onclick = () => { SFX.tap(); closeModal(); enterRoom(nxt.id); };
    const ec = document.getElementById("eCap"); if (ec) ec.onclick = () => { SFX.tap(); closeModal(); renderMap(); openCapsule(); };
    document.getElementById("eCode").onclick = () => { SFX.tap(); renderMap(); openSaveModal(); };
    setTimeout(checkTrophies, 1800); lbSubmit(true);
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
  { id: "spores", w: 2, art: "shroom", title: ["Sleepy spores"], text: ["Glowing mushrooms pop up in the corner and puff out sparkly spores. Hachiware yawns... and dozes off."], effect: ["😴 Hints are unavailable for 45 seconds."],
    run() { R.noHintUntil = Date.now() + 45000; } },
  { id: "owl", w: 2, good: true, art: "owl", title: ["A wise night owl appears"], text: ["Hoo... hoo... A big owl lands on the bookshelf, eyes glowing in the dark. It has a riddle for you."], effect: ["🦉 Answer its bonus question for +45 seconds and 5 🌰."],
    run() { setTimeout(owlQuiz, 300); } },
  { id: "tea", w: 2, good: true, art: null, title: ["Kuri-Manju's tea break"], text: ["Out of nowhere, Kuri-Manju pours a cup of warm tea. The room feels calm for a moment."], effect: ["🍵 The timer freezes for 30 seconds. Relax and think!"],
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
    <div class="creature">${inc.art ? CREATURES[inc.art] : figure("kurimanju", "happy")}</div>
    <p>${inc.text[0]}</p>
    <div class="effect"><b>${inc.effect[0]}</b></div>
    <div class="row"><button class="btn big" id="incOk">${inc.good ? "Yay! 🎉" : "Eek... OK! 😖"}</button></div>`, { closable: false });
  const box = document.getElementById("mbox"); box.classList.add("incident"); if (inc.good) box.classList.add("good");
  document.getElementById("incOk").onclick = () => { SFX.tap(); closeModal(); inc.run(); if (R && inc.id !== "owl") { renderRoom(); document.getElementById("inv").innerHTML = invHtml(); wireSlots(); setLine(inc.good ? "hachiware" : "chiikawa", inc.effect[0], inc.good ? "normal" : "cry"); } };
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
document.getElementById("home").onclick = () => { if (S) { SFX.init(); SFX.tap(); closeModal(); renderMap(); } };
document.addEventListener("pointerdown", () => { SFX.init(); MUSIC.start(); }, { once: true });
document.addEventListener("keydown", () => { SFX.init(); MUSIC.start(); }, { once: true });
document.addEventListener("visibilitychange", () => { if (document.hidden && S) save(); });
window.addEventListener("pagehide", () => { if (S) save(); });
(function boot() {
  const linked = decodeCode(location.hash.slice(1));
  if (linked) { S ? renderMap() : renderWelcome(); showCodeFromLink(linked); return; }
  if (S) { checkIn(); renderMap(); showResume(); } else renderWelcome();
})();
