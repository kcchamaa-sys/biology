// Each stage's pool: its 15 questions (Bloom 1–6), converted to one shape
const BLOOM = [null, "Remember", "Understand", "Apply", "Analyse", "Evaluate", "Create"];
function buildPools() {
  ROOMS.forEach(r => {
    r.pool = (QB[r.id] || []).map((q, j) => Array.isArray(q)
      ? { id: "q" + j, b: q[0], type: "mc", q: q[1], choices: q[2], answer: 0, hint: q[3], explain: q[4], tip: q[5] }
      : Object.assign({ type: "mc", answer: 0 }, q, { id: "q" + j }));
  });
}
buildPools();
const ROOM_SECONDS = 15 * 60;
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

function freshStats() { return { days: 0, correct: 0, run: 0, bestRun: 0, replays: 0, cleanEscapes: 0, noHintEscapes: 0, rushRounds: 0 }; }
function freshRun() { return { firsts: [], strikes: 0, hints: false, qids: null }; }
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
    rush: { best: 0, lastDay: null }, player_id: newId(), lb_last: 0
  };
}
function normalise(obj) {
  const s = Object.assign(freshState(), obj || {});
  s.bio_mastery = Object.assign(freshMastery(), (obj && obj.bio_mastery) || {});
  s.stats = Object.assign(freshStats(), (obj && obj.stats) || {});
  s.trophies = Object.assign({}, s.trophies); s.room_run = Object.assign({}, s.room_run); s.seen = Object.assign({}, s.seen);
  s.room_progress = Object.assign({}, s.room_progress); s.room_stars = Object.assign({}, s.room_stars); s.room_timer = Object.assign({}, s.room_timer);
  s.mastered_puzzles = [...new Set(s.mastered_puzzles || [])];
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

/* Save code: 8 characters of Crockford base32 (no I, L, O, U), shown as ABCD-EFGH.
   Packs, for each of the 8 topics, stages escaped (0–3) and their average stars (1–3);
   plus the stage in progress and its locks solved (0–4), streak (1–63) and shields (0–3).
   Multiplied by a constant (mod M) so codes look random and typos rarely decode. */
const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const CODE_M = 100000000n * 64n * 4n * 40n; // 1.024e12 < 32^8
const CODE_K = 7919n;                        // coprime with CODE_M (= 2^19 · 5^9)
function modInvBig(a, m) {
  let [r0, r1, s0, s1] = [a % m, m, 1n, 0n];
  while (r1 !== 0n) { const q = r0 / r1; [r0, r1] = [r1, r0 - q * r1]; [s0, s1] = [s1, s0 - q * s1]; }
  return ((s0 % m) + m) % m;
}
const CODE_KINV = modInvBig(CODE_K, CODE_M);
function roomStars(r) {
  if (!S.completed_rooms.includes(r.id)) return 0;
  return S.room_stars[r.id] || 1;
}
const stagesDone = ti => topicRooms(ti).filter(r => S.completed_rooms.includes(r.id)).length;
function topicStars(ti) {
  const done = topicRooms(ti).filter(r => S.completed_rooms.includes(r.id));
  return done.length ? Math.round(done.reduce((a, r) => a + roomStars(r), 0) / done.length) : 0;
}
const fmtCode = c => `${c.slice(0, 4)}-${c.slice(4)}`;
function makeCode() {
  let n = 0n;
  TOPICS.forEach((_, ti) => { const d = stagesDone(ti), v = d ? 1 + (d - 1) * 3 + (Math.max(1, topicStars(ti)) - 1) : 0; n += BigInt(v) * 10n ** BigInt(ti); });
  const cur = ROOMS[roomIndex(S.current_room)];
  const lock = cur && !S.completed_rooms.includes(cur.id) && isUnlocked(roomIndex(cur.id)) ? Math.min(4, (S.room_progress[cur.id] || []).length) : 0;
  const streak = Math.max(1, Math.min(63, S.current_streak)), shields = Math.max(0, Math.min(3, S.streak_shields));
  n += 100000000n * BigInt(streak + 64 * (shields + 4 * ((cur ? cur.t : 0) * 5 + lock)));
  let x = (n * CODE_K) % CODE_M, out = "";
  for (let i = 0; i < 8; i++) { out = B32[Number(x % 32n)] + out; x /= 32n; }
  return out;
}
function decodeCode(raw) {
  const c = String(raw || "").toUpperCase().replace(/[^0-9A-Z]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
  if (c.length !== 8) return null;
  let x = 0n;
  for (const ch of c) { const v = B32.indexOf(ch); if (v < 0) return null; x = x * 32n + BigInt(v); }
  if (x >= CODE_M) return null;
  let n = (x * CODE_KINV) % CODE_M;
  const tv = TOPICS.map((_, ti) => Number((n / 10n ** BigInt(ti)) % 10n));
  n /= 100000000n;
  const streak = Number(n % 64n); n /= 64n;
  const shields = Number(n % 4n); n /= 4n;
  const curT = Math.floor(Number(n) / 5), lock = Number(n) % 5;
  if (streak === 0) return null;
  const done = tv.map(v => (v ? Math.floor((v - 1) / 3) + 1 : 0)), stars = tv.map(v => (v ? ((v - 1) % 3) + 1 : 0));
  if (lock > 0 && done[curT] === 3) return null; // locks in progress can't belong to a finished topic
  return { code: c, done, stars, curT, lock, streak, shields, escaped: done.reduce((a, b) => a + b, 0) };
}
function stateFromCode(d, name) {
  const s = freshState();
  s.player_name = name || (S && S.player_name) || "Student";
  TOPICS.forEach((T, ti) => {
    topicRooms(ti).slice(0, d.done[ti]).forEach(r => { s.completed_rooms.push(r.id); s.inventory.push(r.item); s.room_stars[r.id] = d.stars[ti]; });
    if (d.done[ti] === 3) s.chiikawa_badges.push(T.badge);
  });
  const nextR = topicRooms(d.curT)[Math.min(2, d.done[d.curT])];
  s.current_room = nextR.id;
  if (!s.completed_rooms.includes(nextR.id) && d.lock) s.room_progress[nextR.id] = Array.from({ length: d.lock }, (_, i) => i);
  s.current_streak = d.streak; s.longest_streak = d.streak; s.streak_shields = d.shields; s.last_login_date = today();
  if (S) { s.trophies = S.trophies || {}; s.stats = Object.assign(freshStats(), S.stats); s.coins = S.coins || 0; s.owned = S.owned || []; s.equip = S.equip || s.equip; s.power = S.power || s.power; s.rush = S.rush || s.rush; s.player_id = S.player_id || s.player_id; s.last_chest_date = S.last_chest_date; s.inventory = s.inventory.concat((S.inventory || []).filter(x => SNACKS.includes(x))); }
  return s;
}

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
const TROPHIES = [
  { id: "week", name: "Week Warrior", rar: "bronze", who: "chiikawa", desc: "Play 7 days in a row", prog: () => [S.longest_streak, 7] },
  { id: "steady", name: "Steady Explorer", rar: "silver", who: "hachiware", desc: "Play on 20 different days", prog: () => [S.stats.days, 20] },
  { id: "flame", name: "Eternal Flame", rar: "legend", who: "usagi", desc: "Reach a 30-day streak", prog: () => [S.longest_streak, 30] },
  { id: "sharp", name: "Sharpshooter", rar: "gold", who: "momonga", desc: "15 first-try answers in a row (no hints, no mistakes)", prog: () => [S.stats.bestRun, 15] },
  { id: "hunter", name: "Knowledge Hunter", rar: "gold", who: "kurimanju", desc: "Open 100 locks in total", prog: () => [S.stats.correct, 100] },
  { id: "escaper", name: "Master Escaper", rar: "gold", who: "chiikawa", desc: "Escape all 24 stages (every topic)", prog: () => [S.completed_rooms.length, ROOMS.length] },
  { id: "stars", name: "Star Collector", rar: "legend", who: "hachiware", desc: "Collect 60 stars across the stages (3★ = 3 stars)", prog: () => [ROOMS.reduce((a, r) => a + roomStars(r), 0), 60] },
  { id: "clock", name: "Beat the Clock", rar: "silver", who: "usagi", desc: "5 escapes before time runs out, with 0 guess strikes", prog: () => [S.stats.cleanEscapes, 5] },
  { id: "brain", name: "Brain Power", rar: "silver", who: "momonga", desc: "5 escapes without using any hint", prog: () => [S.stats.noHintEscapes, 5] },
  { id: "practice", name: "Practice Makes Perfect", rar: "bronze", who: "kurimanju", desc: "Replay escaped stages 10 times", prog: () => [S.stats.replays, 10] }
];
const RAR = { bronze: ["#E9A874", "#F7D2AE", "Bronze"], silver: ["#B9C3D3", "#EEF2F8", "Silver"], gold: ["#F5C542", "#FFF1A8", "Gold"], legend: ["#F49AC1", "#D7F0FF", "Legendary"] };
function trophySvg(t, got) {
  const [c1, c2] = got ? RAR[t.rar] : ["#CFC8BC", "#E8E2D6"], id = "tg" + t.id + (++clipN);
  const fill = t.rar === "legend" && got ? `url(#${id})` : c1;
  return `<svg class="cup" viewBox="0 0 100 120" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#FFB7C5"/><stop offset=".35" stop-color="#FDFFB6"/><stop offset=".65" stop-color="#B9F3C9"/><stop offset="1" stop-color="#A0C4FF"/></linearGradient></defs>
    ${got && t.rar === "legend" ? `<g fill="#F5C542">${[[10, 18], [90, 24], [14, 70], [88, 64]].map(([x, y]) => `<path d="M${x} ${y - 6} l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2z"/>`).join("")}</g>` : ""}
    <path d="M24 26 C6 26 6 56 30 58" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M24 26 C6 26 6 56 30 58" fill="none" stroke="${c2}" stroke-width="3" stroke-linecap="round"/>
    <path d="M76 26 C94 26 94 56 70 58" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M76 26 C94 26 94 56 70 58" fill="none" stroke="${c2}" stroke-width="3" stroke-linecap="round"/>
    <path d="M20 14 H80 V38 C80 60 66 72 50 72 C34 72 20 60 20 38 Z" fill="${fill}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M28 20 V36 C28 46 32 54 38 58" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
    <rect x="44" y="72" width="12" height="14" fill="${c1}" stroke="${INK}" stroke-width="3"/>
    <rect x="30" y="86" width="40" height="12" rx="3" fill="${c2}" stroke="${INK}" stroke-width="3"/>
    <rect x="24" y="98" width="52" height="12" rx="3" fill="${c1}" stroke="${INK}" stroke-width="3"/>
    ${got ? `<svg x="31" y="22" width="38" height="38" viewBox="0 0 64 64">${CHAR[t.who].head("happy")}</svg>`
          : `<g transform="translate(50 42)"><rect x="-10" y="-4" width="20" height="16" rx="3" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M-6 -4 v-5 a6 6 0 0 1 12 0 v5" fill="none" stroke="${INK}" stroke-width="3"/></g>`}
  </svg>`;
}
function trophyCard(t) {
  const got = !!S.trophies[t.id];
  const [cur, goal] = t.prog(), v = Math.min(cur, goal);
  return `<div class="trophy ${got ? "got" : "locked"}" aria-label="${esc(t.name)}: ${got ? "unlocked" : `${v} / ${goal}`}">
    ${trophySvg(t, got)}
    <span class="tn">${esc(t.name)}</span>
    <span class="rar ${t.rar}">${RAR[t.rar][2]}</span>
    <span class="td">${esc(t.desc)}</span>
    ${got ? `<span class="pnum">🏆 ${"Unlocked"} ${esc(S.trophies[t.id])}</span>`
          : `<div class="pbar"><i style="width:${Math.round(100 * v / goal)}%"></i></div><span class="pnum">${v} / ${goal}</span>`}
  </div>`;
}
function cabinetHtml() {
  const n = TROPHIES.filter(t => S.trophies[t.id]).length;
  return `<div class="row" style="justify-content:space-between"><h2>🏆 ${"Trophy Cabinet"}</h2><span class="pill">${n} / ${TROPHIES.length} ${"unlocked"}</span></div>
    <p class="small muted">${"These are hard on purpose. They reward coming back day after day and thinking carefully, not rushing."}</p>
    <div class="shelf">${TROPHIES.map(trophyCard).join("")}</div>`;
}
function openCabinet() { openModal(cabinetHtml(), { wide: true }); }
let trophyQueue = [];
function checkTrophies() {
  if (!S) return;
  TROPHIES.forEach(t => {
    if (S.trophies[t.id]) return;
    const [cur, goal] = t.prog();
    if (cur >= goal) { S.trophies[t.id] = today(); S.coins = (S.coins || 0) + 30; trophyQueue.push(t); }
  });
  if (trophyQueue.length) { save(); renderTools(); showTrophyBanner(); lbSubmit(true); }
}
function showTrophyBanner() {
  if (document.querySelector(".tbanner") || !trophyQueue.length) return;
  const t = trophyQueue.shift();
  const d = document.createElement("button"); d.className = "tbanner"; d.setAttribute("aria-live", "polite");
  d.innerHTML = `${trophySvg(t, true)}<span style="text-align:left"><span class="kicker" style="padding:0">${"Trophy unlocked!"}</span><br><b>${esc(t.name)}</b><br><span class="small">${esc(t.desc)} · +30 🌰</span></span>`;
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
const MC_POOL = () => ROOMS.flatMap(r => r.pool.filter(p => p.type === "mc" && !p.svg));

const RUSH_MAKERS = [
  { w: 2, label: "Multiple choice", make() { const p = pick(MC_POOL()); const order = shuffle(p.choices.map((_, i) => i));
      return { prompt: p.q, render: (el, done) => { el.innerHTML = `<div class="rgrid two">${order.map(i => `<button class="rbtn" data-i="${i}">${esc(p.choices[i])}</button>`).join("")}</div>`;
        el.querySelectorAll(".rbtn").forEach(b => b.onclick = () => { const ok = Number(b.dataset.i) === p.answer; b.classList.add(ok ? "ok" : "no"); if (!ok) el.querySelector(`[data-i="${p.answer}"]`).classList.add("ok"); el.querySelectorAll(".rbtn").forEach(x => x.disabled = true); done(ok, p.choices[p.answer]); }); } }; } },
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
    <div class="rules">${`<ul><li>Mixed questions: multiple choice, true/false, matching, ordering, odd one out, fill the gap, test-tube colours and organelle spotting.</li>
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
      <div class="status"><div class="av ${frameCls()}" id="rushAv">${avatar("chiikawa", "normal")}</div><div><div class="rtopic" style="color:var(--yellow)">⚡ ${"Cell Rush · HKDSE S4 Biology"}</div><div class="big" id="rScore">0 ${"pts"}</div></div></div>
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
  S.coins += coins; save(true); checkTrophies(); lbSubmit(true);
  SFX.fanfare(); if (r.score > 0) confetti(120);
  openModal(`<span class="kicker">⚡ ${"Cell Rush · Round over"}</span><h2>${best ? "🎉 New best score!" : "Time's up!"}</h2>
    <div class="row" style="justify-content:center;gap:18px;font-size:1.2rem"><b>${r.score} ${"pts"}</b><span>✅ ${r.correct}/${r.total}</span><span class="pill coinpill">+${coins} 🌰${bonus && r.total > 0 ? " (×2 daily bonus)" : ""}</span></div>
    ${say(r.correct >= 8 ? "usagi" : "hachiware", r.correct >= 8 ? "YAHA!!! Amazing rush! 🐰🎊" : "Nice try! Every round makes your brain faster. 🌱", "happy", r.correct >= 8 ? "" : "hint")}
    <div class="row"><button class="btn big" id="rAgain">⚡ ${"Play again"}</button><button class="btn yellow" id="rShop">👗 ${"Spend chestnuts"}</button><button class="btn plain" id="rMap">🗺️ ${"Map"}</button></div>`, { onClose: renderMap });
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
    <button class="iconbtn" id="tJournal" aria-label="${"Open the Study Journal"}">📓<span class="lbl">${"Journal"}</span></button>
    ${S ? `<button class="iconbtn" id="tSave" aria-label="${"Save and share code"}">🔑<span class="lbl">${"Save code"}</span></button>` : ""}
    <button class="iconbtn" id="tMus" aria-label="${MUSIC.on ? "Turn music off" : "Turn music on"}" title="${"Background music"}" aria-pressed="${MUSIC.on}" style="${MUSIC.on ? "" : "opacity:.5;text-decoration:line-through"}">🎵<span class="lbl">${MUSIC.on ? "Music on" : "Music off"}</span></button>
    <button class="iconbtn" id="tSnd" aria-label="${SFX.on ? "Turn sound effects off" : "Turn sound effects on"}" title="${"Sound effects"}">${SFX.on ? "🔊" : "🔇"}</button>`;
  document.getElementById("tJournal").onclick = () => { SFX.init(); SFX.tap(); openJournal(); };
  const tc = document.getElementById("tCoins"); if (tc) tc.onclick = () => { SFX.init(); SFX.tap(); openShop(); };
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
      <span class="kicker">📓 Study Journal · HKDSE S4 Biology · ${esc(T.part)}</span>
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
  const rows = TOPICS.map((T, ti) => d.done[ti] ? `<li>${T.icon} ${esc(T.name)}: <b>${d.done[ti]}/3</b> stages ${starStr(d.stars[ti])}</li>` : "").join("");
  const nextR = topicRooms(d.curT)[Math.min(2, d.done[d.curT])];
  return `<div class="preview small"><b>This code contains:</b> ${d.escaped} stage${d.escaped === 1 ? "" : "s"} escaped${rows ? `<ul style="margin:4px 0;padding-left:20px">${rows}</ul>` : ". "}${d.lock ? `${d.lock}/5 locks open in <b>${esc(nextR.name)}</b>, ` : ""}🔥 ${d.streak}-day streak, 🛡️ ${d.shields} shield${d.shields === 1 ? "" : "s"}.</div>`;
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
    <div class="row"><input class="codein" id="codeIn" maxlength="9" placeholder="ABCD-EFGH" autocomplete="off" autocapitalize="characters" aria-label="${"Enter save code"}"><button class="btn" id="codeGo">${"Load"}</button></div>
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
    if (!d) { SFX.wrong(); msg.innerHTML = say("chiikawa", "Wah... that code doesn't work. Check each letter and try again. (Codes have 8 letters or numbers, like ABCD-EFGH.)", "cry"); return; }
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
const HERO_KICKER = "HKDSE · Secondary 4 Biology";

function renderWelcome() {
  stopRush(); MUSIC.setMode("map"); stopTimer(); R = null; renderTools();
  $app.innerHTML = `
    <section class="hero">${starsBg()}
      <span class="kicker" style="color:#fff">${HERO_KICKER}</span>
      <h1>Chiikawa Bio Escape</h1>
      <p class="sub">8 topics · 24 stages · 1 stage a day · 10–15 minutes</p>
      ${castHtml({ chiikawa: "cry", usagi: "happy", momonga: "shock" })}
    </section>
    <section class="card">
      ${say("chiikawa", "Ya...!! 😭 We fell asleep in the biology lab... and woke up TINY, inside a giant cell world!", "cry")}
      ${say("hachiware", "Every door is locked with an S4 Biology puzzle. Each topic is a series of 3 stages, and the last one is a <b>boss stage</b> guarded by Rakko. Nantoka naare~! Will you help us escape? ✨", "normal", "hint")}
      ${say("usagi", "YAHA! Let's GO! 🐰💥", "happy")}
      <label for="nm"><b>What should we call you?</b></label>
      <input id="nm" class="name" maxlength="24" placeholder="Your name or nickname" autocomplete="off">
      <label for="tp"><b>Which topic is your class on?</b></label>
      <select id="tp" class="name">${TOPICS.map((T, ti) => `<option value="${ti}">${T.icon} Topic ${T.no}: ${esc(T.name)}</option>`).join("")}</select>
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
    w.innerHTML = `<div class="row"><input class="codein" id="wIn" maxlength="9" placeholder="ABCD-EFGH" autocomplete="off" autocapitalize="characters" aria-label="Enter save code"><button class="btn" id="wGo">Load</button></div><div id="wMsg"></div>`;
    const loadIt = () => {
      const d = decodeCode(document.getElementById("wIn").value);
      if (!d) { SFX.wrong(); document.getElementById("wMsg").innerHTML = say("chiikawa", "Wah... that code doesn't work. Check each letter and try again. (Codes look like ABCD-EFGH.)", "cry"); return; }
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
function renderMap() {
  stopRush(); MUSIC.setMode("map"); stopTimer(); lbSubmit(); if (R) clearTimeout(R.introT); R = null; recomputeMastery(); save(); renderTools();
  const ni = nextRoomIndex(), allDone = ni === -1, chestReady = S.last_chest_date !== today(), nr = allDone ? null : ROOMS[ni];
  const totalStars = ROOMS.reduce((a, r) => a + roomStars(r), 0);
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
      <p class="small muted">Every topic is open. Inside a topic, clear the stages in order: Stage 1 → Stage 2 → ⚔️ Boss stage.</p>
      <div class="tgrid">${TOPICS.map((T, ti) => {
        const rs = topicRooms(ti), d = stagesDone(ti), cur = nr && nr.t === ti;
        return `<div class="tcard ${d === 3 ? "done" : ""} ${cur ? "next" : ""}">
          <div class="thead"><span class="ticon" aria-hidden="true">${T.icon}</span><span style="min-width:0"><span class="tnum">Topic ${T.no}${d === 3 ? " · 🏅 cleared" : ""}</span><br><span class="tname">${esc(T.name)}</span></span></div>
          <div class="tprog" aria-label="${d} of 3 stages escaped"><i style="width:${Math.round(100 * d / 3)}%"></i></div>
          <div class="stages">${rs.map(r => stageBtn(r, roomIndex(r.id), ni)).join("")}</div>
        </div>`; }).join("")}</div>
    </section>
    <section class="card">
      <h2>🎮 Game modes</h2>
      <div class="modes">
        <button class="mode rush" id="mRush"><h3>⚡ Cell Rush</h3><span class="muted small">60 seconds of mixed quick questions from every topic. Earn 🌰 chestnuts for outfits and power-ups.</span><span class="small">Best: <b>${S.rush.best}</b> pts ${S.rush.lastDay !== today() ? "· <b>×2 today!</b>" : ""}</span></button>
        <button class="mode" id="mShop"><h3>👗 Shisa's Shop</h3><span class="muted small">Dress up Chiikawa and buy power-ups for the escape rooms.</span><span class="small">🌰 <b>${S.coins}</b> chestnuts</span></button>
        <button class="mode" id="mLb"><h3>🏅 Leaderboard</h3><span class="muted small">The 10 most dedicated players.</span><span class="small">Your points: <b>${dedication()}</b></span></button>
      </div>
    </section>
    <section class="card">
      <h2>📈 Biology mastery</h2>
      <p class="small muted">Each stage has 15 questions (Bloom levels 1–6), so each topic has 45. Mastery goes up when you answer one right on the first try without a hint. Replay cleared stages to master them all! The first replay each day earns a 📚 revision bonus.</p>
      ${TOPICS.map(T => { const v = S.bio_mastery[T.id]; return `<div><div class="row" style="justify-content:space-between"><b class="small">${TOPIC_LABELS[T.id]}</b><b class="small">${v}%</b></div>
        <div class="tprog"><i style="width:${v}%"></i></div></div>`; }).join("")}
    </section>
    <section class="card cream cabinet" id="cabinet">${cabinetHtml()}</section>
    <section class="card">
      <h2>🎒 Backpack</h2>
      <div class="bag">${S.chiikawa_badges.concat(S.inventory).map(b => `<span class="tag">${esc(b)}</span>`).join("") || `<span class="muted small">Empty. Escape a stage or open the daily chest!</span>`}</div>
      <p class="small muted">🔥 Longest streak: ${S.longest_streak} days · 🛡️ Shields: ${S.streak_shields} (a shield saves your streak if you miss a day)</p>
    </section>`;
  $app.querySelectorAll("[data-room]").forEach(b => b.onclick = () => { SFX.init(); SFX.tap(); streakNote = ""; enterRoom(b.dataset.room); });
  document.getElementById("mRush").onclick = () => { SFX.init(); SFX.tap(); rushIntro(); };
  document.getElementById("mShop").onclick = () => { SFX.init(); SFX.tap(); openShop(); };
  document.getElementById("mLb").onclick = () => { SFX.init(); SFX.tap(); openLeaderboard(); };
  const c = document.getElementById("chest");
  if (chestReady) c.onclick = () => {
    SFX.init(); SFX.fanfare(); confetti(70);
    const snack = pick(SNACKS); S.inventory.push(snack);
    let extra = ""; if (Math.random() < .2 && S.streak_shields < 3) { S.streak_shields++; extra = " …and a 🛡️ shield!"; }
    S.last_chest_date = today(); streakNote = `🎁 Kuri-Manju opened the chest: ${snack}${extra}`; save(true); renderMap();
  };
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
    case "villi": return `${[400, 424, 448, 472].map((x, k) => `<path d="M${x} 300 V${236 + (k % 2) * 16} q10 -16 20 0 V300" fill="#FFB7C5" ${o3}/><path d="M${x + 10} 298 V${240 + (k % 2) * 16}" stroke="#FFFDF0" stroke-width="3"/>`).join("")}`;
  }
  return "";
}
function sceneSvg(r, solvedCount) {
  const o = `stroke="${INK}" stroke-width="4" stroke-linejoin="round"`;
  const books = ["#FFB7C5", "#A0C4FF", "#FDFFB6", "#B9F3C9", "#C9C3F0", "#FFB7C5", "#A0C4FF"];
  return `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(r.name)} escape room">
    <rect width="800" height="500" fill="${r.tint}"/>
    ${r.boss ? `<rect width="800" height="500" fill="url(#bossGlow)"/><defs><radialGradient id="bossGlow" cx=".5" cy=".3" r=".7"><stop offset="0" stop-color="rgba(201,160,255,0)"/><stop offset="1" stop-color="rgba(107,78,140,.45)"/></radialGradient></defs>` : ""}
    <rect y="360" width="800" height="140" fill="${r.floor}"/><path d="M0 360 H800" ${o}/>
    <g class="obj" data-hs="0">
      <rect x="40" y="110" width="160" height="250" rx="8" fill="#D9B48F" ${o}/>
      ${[170, 240, 310].map(y => `<path d="M40 ${y} H200" ${o}/>`).join("")}
      ${books.map((c, i) => `<rect x="${52 + i * 20}" y="${i % 2 ? 128 : 124}" width="16" height="${i % 2 ? 42 : 46}" rx="3" fill="${c}" stroke="${INK}" stroke-width="3"/>`).join("")}
      ${books.slice(0, 5).map((c, i) => `<rect x="${60 + i * 24}" y="${196 + (i % 2) * 4}" width="20" height="${44 - (i % 2) * 4}" rx="3" fill="${c}" stroke="${INK}" stroke-width="3"/>`).join("")}
      <rect x="64" y="262" width="54" height="48" rx="4" fill="#FFFDF0" stroke="${INK}" stroke-width="3"/>
    </g>
    <g class="obj" data-hs="1">
      <circle cx="300" cy="100" r="46" fill="#FFFDF0" ${o}/>
      ${[0, 90, 180, 270].map(a => `<circle cx="${300 + 34 * Math.sin(a * Math.PI / 180)}" cy="${100 - 34 * Math.cos(a * Math.PI / 180)}" r="3.5" fill="${INK}"/>`).join("")}
      <path d="M300 100 V72 M300 100 L318 112" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    </g>
    <g class="obj" data-hs="2">
      <rect x="360" y="300" width="160" height="16" rx="4" fill="#C98F6B" ${o}/><path d="M378 316 V360 M502 316 V360" ${o}/>
      ${specialSvg(r.special)}
    </g>
    <g class="obj" data-hs="3">
      <rect x="248" y="400" width="114" height="72" rx="10" fill="#FFB7C5" ${o}/><path d="M248 424 H362" ${o}/>
      <rect x="292" y="416" width="26" height="24" rx="5" fill="#FDFFB6" stroke="${INK}" stroke-width="3"/>
    </g>
    <g class="obj" data-hs="4">
      <rect x="556" y="250" width="128" height="120" rx="10" fill="#B8C3D6" ${o}/><rect x="570" y="264" width="100" height="92" rx="6" fill="none" stroke="${INK}" stroke-width="3"/>
      <circle cx="620" cy="310" r="20" fill="#FFFDF0" ${o}/><path d="M620 296 v10" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    </g>
    ${r.boss ? `<svg x="472" y="372" width="78" height="108" viewBox="-4 -4 72 100" aria-hidden="true">${figure("rakko", "brave").replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</svg>` : ""}
    <g class="obj" data-hs="door" id="doorG">
      <rect x="700" y="86" width="92" height="274" fill="#FDFFB6" class="door-light"/>
      <g class="door-panel"><rect x="700" y="86" width="92" height="274" rx="6" fill="#C98F6B" ${o}/>
        <rect x="714" y="104" width="64" height="100" rx="6" fill="none" stroke="${INK}" stroke-width="3"/><rect x="714" y="222" width="64" height="118" rx="6" fill="none" stroke="${INK}" stroke-width="3"/>
        <circle cx="716" cy="228" r="7" fill="#FDFFB6" ${o}/></g>
      <rect x="668" y="190" width="24" height="36" rx="4" fill="#2B2433" stroke="${INK}" stroke-width="3"/><circle cx="680" cy="200" r="3.5" fill="${solvedCount === 5 ? "#B9F3C9" : "#FF6B6B"}"/>
    </g>
  </svg>`;
}

let R = null, timerId = null, moodTimer = null;
const masteredIn = r => r.pool.filter(p => S.mastered_puzzles.includes(`${r.id}:${p.id}`)).length;
function pickRun(room) {
  const seen = S.seen[room.id] || [], chosen = [];
  [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6]].forEach(([lo, hi]) => {
    const cands = room.pool.filter(p => p.b >= lo && p.b <= hi && !chosen.includes(p.id));
    const fresh = cands.filter(p => !seen.includes(p.id));
    chosen.push(pick(fresh.length ? fresh : cands).id);
  });
  S.seen[room.id] = seen.concat(chosen).slice(-30);
  return chosen;
}
const runQs = room => S.room_run[room.id].qids.map(id => room.pool.find(p => p.id === id) || room.pool[0]);
function stopTimer() { if (timerId) clearInterval(timerId); timerId = null; }

function enterRoom(id) {
  stopRush();
  const room = ROOMS[roomIndex(id)];
  const replay = S.completed_rooms.includes(room.id);
  if (replay || !S.room_run[room.id]) S.room_run[room.id] = freshRun();
  if (!S.room_run[room.id].qids) S.room_run[room.id].qids = pickRun(room);
  if (replay) { S.room_progress[room.id] = []; S.room_timer[room.id] = ROOM_SECONDS; }
  if (S.room_timer[room.id] == null) S.room_timer[room.id] = ROOM_SECONDS;
  S.current_room = room.id; save(); MUSIC.setMode("room");
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
    me.introT = setTimeout(k < lines.length ? step : () => R === me && setLine("hachiware", "Tap a glowing <b>?</b> to start. ⚠️ Careful: a wrong answer costs <b>20 seconds</b> and shuffles the lock. Guessing <b>jams the lock</b>, costs 🌰 chestnuts and can make the lights go dim. Think first! And watch out for strange happenings in the dark... 👀 (Stuck? Tap 📓 for the textbook notes.)"), k < lines.length ? 2600 : 3200);
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
          <div class="stepper" aria-label="${esc(stageLabel(room))}">${topicRooms(room.t).map(x => `<i class="${x.id === room.id ? "cur" : S.completed_rooms.includes(x.id) ? "on" : ""}"></i>`).join("")}<span class="small">${room.boss ? "Boss stage" : `Stage ${room.s}`} of 3 · ${esc(room.focus)}</span></div>
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
          return `<button class="hs ${done ? "done" : ""}" data-hs="${i}" style="left:${h.x}%;top:${h.y}%" aria-label="${esc(nm)}${done ? " (solved)" : ""}">${done ? "✓" : "?"}<span class="lbl">${esc(nm)}</span></button>`;
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
  const p = R.qs[i];
  const hsName = i === 2 ? room.specialName : HOTSPOTS[i].name;
  const line = i === 2 ? room.specialLine : HOTSPOTS[i].line;
  if (solved.includes(i)) { toast(`${hsName}: ${"already solved ✓"}`); return; }
  SFX.click();
  R.cur = i; R.att[i] = R.att[i] || 0; R.openedAt = Date.now();
  if (R.hiddenHs === i) { R.hiddenHs = null; toast("🔦 Found the hidden lock!"); }
  const typeLabel = { mc: "Multiple choice", keypad: "Keypad lock", dial: "Combination dials" }[p.type];
  const box = openModal(`
    <span class="kicker">${typeLabel} · T${room.topicNo} ${room.boss ? "Boss" : `S${room.s}`} · 🧠 Bloom ${p.b}: ${BLOOM[p.b]}</span>
    <h2>${esc(hsName)}</h2>
    ${room.boss && p.b >= 5 ? say("rakko", "A hard one. Think like a scientist: read every choice before you strike. ⚔️", "brave")
      : p.b >= 5 ? say("chiikawa", `${esc(line)} ...Eh?! This one looks HARD! 😱`, "shock") : say("chiikawa", esc(line), p.b >= 3 ? "brave" : "normal")}
    <p class="q">${esc(p.q)}</p>
    ${p.svg ? `<div class="diagram-box">${DIAGRAMS[p.svg]}</div>` : ""}
    <div id="jamBox"></div>
    <div id="ans">${answerUi(p)}</div>
    <div class="row"><button class="btn blue" id="hint">💡 ${"Hint from Hachiware"}</button><button class="btn plain" id="pj">📓 ${"Journal"}</button></div>
    <div class="pwr" id="pwr"></div>
    <div id="pfb"></div>`, { wide: true });
  renderPwr(p, i);
  document.getElementById("hint").onclick = () => { SFX.hint(); markHint(i); document.getElementById("pfb").innerHTML = say("hachiware", `💡 ${esc(p.hint)}`, "normal", "hint"); };
  document.getElementById("pj").onclick = () => { SFX.tap(); openJournal(room.id, termsIn(room, p)); };
  wireAnswer(p, box);
  if (R.jam[i] > Date.now()) startJam(i, 0);
  if (R.noHintUntil > Date.now()) { const h = document.getElementById("hint"); h.disabled = true; h.textContent = "😴 Hachiware is sleepy..."; }
  if (R.fog) { R.fog = false; fogAnswers(); }
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
  if (!R) return; R.dimUntil = Date.now() + 45000;
  const sc = document.getElementById("scene"); if (sc) sc.style.setProperty("--dim", Math.min(.9, R.room.dim + .25));
  const me = R; setTimeout(() => { if (R === me) { const s2 = document.getElementById("scene"); if (s2) s2.style.setProperty("--dim", R.room.dim); } }, 45000);
}
function markHint(i) { R.hinted[i] = true; S.room_run[R.room.id].hints = true; save(); }
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
  // Dials start at random positions (never all correct)
  const start = p.dials.map(o => Math.floor(Math.random() * o.length));
  if (start.every((v, d) => v === p.answer[d])) start[0] = (start[0] + 1) % p.dials[0].length;
  R.dialStart = start;
  return `<div class="dials">${p.dials.map((opts, d) => `<div class="dial">${p.labels ? `<span class="dlabel">${esc(p.labels[d])}</span>` : ""}<button class="arr" data-d="${d}" data-dir="-1" aria-label="Previous option">▲</button>
    <div class="face" id="face${d}" aria-live="polite">${esc(opts[start[d]])}</div><button class="arr" data-d="${d}" data-dir="1" aria-label="${"Next option"}">▼</button></div>`).join("")}</div>
    <div class="row" style="justify-content:center"><button class="btn" id="dok">${"Try the lock 🔓"}</button></div>`;
}
function wireAnswer(p, box) {
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
  const i = R.cur, id = R.room.id, now = Date.now(), p = R.qs[i], run = S.room_run[id];
  R.att[i] = (R.att[i] || 0) + 1; S.stats.run = 0;
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
  const [rw, rm, rt] = fast ? ["chiikawa", "cry", "Wah...! That was too fast! Did we guess? 😭"] : R.att[i] >= 2 ? ["chiikawa", "cry", "Wah...! Wrong again... uuu... 😭"] : pick(REACT.wrong);
  SFX.wrong(); setMood(rm === "shock" ? "shock" : "cry", 2500);
  const hit = [];
  // Penalty 1: time
  S.room_timer[id] -= 20; penaltyFlash("−20s ⏱️"); updateTimerEl(); hit.push("⏱️ −20 seconds");
  // Penalty 2: the lock reshuffles, so tapping the next option doesn't work
  if (p.type === "mc") {
    const wrap = box.querySelector(".choices"); const kids = shuffle([...wrap.children]);
    kids.forEach((k, n) => { wrap.appendChild(k); k.querySelector("b").textContent = "ABCD"[n]; });
    hit.push("🔀 answers shuffled");
  } else if (p.type === "dial") {
    const spun = p.dials.map(o => Math.floor(Math.random() * o.length));
    if (spun.every((v, d) => v === p.answer[d])) spun[0] = (spun[0] + 1) % p.dials[0].length;
    spun.forEach((v, d) => setDial(d, v, p));
    hit.push("🌀 dials spun");
  }
  // Penalty 3: guessing or a repeat miss jams the lock, adds a strike and costs chestnuts
  let jam = 0, reason = "";
  if (fast) { jam = 25; reason = "Guessing detected! Lock jammed"; }
  else if (R.att[i] >= 2) { jam = Math.min(40, 10 + 10 * (R.att[i] - 1)); reason = "Wrong again! Lock jammed"; }
  if (jam) {
    run.strikes += 1; markHint(i); SFX.door(); hit.push(`🔒 jammed ${jam}s`, "⚠️ strike +1");
    if (S.coins > 0) { const fine = Math.min(S.coins, 3); S.coins -= fine; hit.push(`🌰 −${fine}`); renderTools(); }
    // Penalty 4: every 3rd strike, the lights flicker and the room goes dim
    if (run.strikes % 3 === 0) { dimLights(); hit.push("🌑 lights dimmed for 45 s"); }
  }
  save();
  const st = document.getElementById("strikes"); if (st) st.textContent = `⚠️ ${"Strikes"} ${run.strikes}`;
  const warn = run.strikes >= 6 ? "You've lost 2 stars in this stage." : run.strikes >= 3 ? "3+ strikes: this stage loses 1 star." : `${3 - run.strikes} more strike${3 - run.strikes === 1 ? "" : "s"} and this stage loses a star.`;
  document.getElementById("pfb").innerHTML = `<div class="fb no">
    ${say(rw, rt, rm)}
    <div class="rules"><b>${"Penalties"}:</b> ${hit.join(" · ")}${jam ? `<br>${warn}` : ""}</div>
    ${say("hachiware", `${jam ? "Let's slow down and read carefully. Nantoka naare~!" : "Don't worry! We can figure this out together."} 💡 ${esc(p.hint)}`, "normal", "hint")}
    ${R.att[i] >= 2 ? (b => say(b[0], b[2], b[1]))(pick(REACT.brave)) : ""}</div>`;
  if (jam) startJam(i, jam, reason);
}
function solve() {
  const { room } = R, i = R.cur, p = R.qs[i];
  const firstTry = !R.att[i] && !R.hinted[i], pid = `${room.id}:${p.id}`, run = S.room_run[room.id];
  if (firstTry && !S.mastered_puzzles.includes(pid)) S.mastered_puzzles.push(pid);
  if (firstTry && !run.firsts.includes(i)) run.firsts.push(i);
  S.stats.correct += 1;
  S.stats.run = firstTry ? S.stats.run + 1 : 0; S.stats.bestRun = Math.max(S.stats.bestRun, S.stats.run);
  const solved = S.room_progress[room.id] || []; if (!solved.includes(i)) solved.push(i); S.room_progress[room.id] = solved;
  recomputeMastery(); save(true);
  SFX.right(); setTimeout(() => yaha(), 150); setMood(firstTry ? "sparkle" : "happy", 4000);
  const [cw, cm, ct] = S.stats.run >= 3 ? ["momonga", "sparkle", `${S.stats.run} first-try answers in a row?! You're almost as amazing as me! 💜`] : firstTry ? pick(REACT.right) : ["chiikawa", "happy", "Phew... we got it! 🥹"];
  const kt = termsIn(room, p).map(t => room.terms.find(x => x[0] === t));
  setTimeout(checkTrophies, 1400);
  if (firstTry) confetti(40);
  document.getElementById("hint").hidden = true;
  document.getElementById("pfb").innerHTML = `<div class="fb ok">
    ${say(cw, `${esc(ct)} <b>${firstTry ? "First try! Mastery up 📈" : "Unlocked! 🔓"}</b>`, cm)}
    <p>${esc(p.explain)}</p>
    ${p.tip ? `<p class="tip"><b>📝 Exam tip:</b> ${esc(p.tip)}</p>` : ""}
    ${kt.length ? `<div class="terms">${kt.map(([t, m]) => `<span class="term"><b>${esc(t)}</b><span class="def">${esc(m)}</span></span>`).join("")}</div>` : ""}
    <div class="found">${ICONS[HOTSPOTS[i].item]}<span>${"You found"}: <b>${esc(itemName(i))}</b>. ${"Code digit"} #${i + 1} = <b>${room.code[i]}</b></span></div>
    <div class="row"><button class="btn big" id="collect">${"Collect item ✨"}</button></div></div>`;
  const c = document.getElementById("collect"); c.focus({ preventScroll: true });
  document.getElementById("pfb").scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "nearest" });
  $modal._close = () => collect(i);
  c.onclick = () => collect(i);
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
  const topicDone = first && stagesDone(room.t) === 3 && !S.chiikawa_badges.includes(T.badge);
  if (topicDone) S.chiikawa_badges.push(T.badge);
  const run = S.room_run[room.id] || freshRun();
  const n = run.firsts.length, base = n === 5 ? 3 : n >= 3 ? 2 : 1;
  const lost = run.strikes >= 6 ? 2 : run.strikes >= 3 ? 1 : 0;
  const stars = Math.max(1, base - lost);
  S.room_stars[room.id] = Math.max(S.room_stars[room.id] || 0, stars);
  if (!first) S.stats.replays += 1;
  const revise = !first && S.last_revise_day !== today(); if (revise) S.last_revise_day = today();
  const earned = first ? (room.boss ? 25 : 15) : revise ? 20 : 5; S.coins = (S.coins || 0) + earned; R.done = true; clearTimeout(R.incT);
  if (tLeft >= 0 && run.strikes === 0) S.stats.cleanEscapes += 1;
  if (!run.hints) S.stats.noHintEscapes += 1;
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
      <p style="text-align:center"><b>${n}/5</b> locks on the first try · ⏱️ ${fmt(Math.max(0, used))}${tLeft < 0 ? " (overtime)" : ""} · ⚠️ ${run.strikes} strike${run.strikes === 1 ? "" : "s"}</p>
      <p style="text-align:center"><span class="pill coinpill">+${earned} 🌰 chestnuts${revise ? " · 📚 daily revision bonus!" : ""}</span>${R.incidents ? ` <span class="pill">👻 Incidents survived: ${R.incidents}</span>` : ""}</p>
      ${lost ? `<div class="rules">Guess strikes cost you <b>${lost} star${lost > 1 ? "s" : ""}</b> this time. Replay the stage and think before answering to win them back!</div>` : ""}
      ${room.boss && first ? say("rakko", "...Hmph. Not bad. You have the heart of a true biologist. ⚔️", "happy") : ""}
      ${topicDone ? say("momonga", `TOPIC ${T.no} CLEARED! You earned <b>${esc(T.badge)}</b>! Everyone is crying happy tears! 💜🥹`, "sparkle") : first ? say("momonga", `You earned <b>${esc(room.item)}</b>! 💜`, "happy") : say("kurimanju", "Replay complete. Practice makes the brain strong. 🍵", "happy")}
      <section class="card cream jsec"><h3>📖 Textbook recap: ${esc(room.focus)}</h3><ul>${room.notes.map(x => `<li>${x}</li>`).join("")}</ul></section>
      ${say("hachiware", !nxt ? "That was the final stage of every topic. You've mastered S4 Biology! 🌟" : `That's today's mission done! 🌱 Rest your brain, or keep going if you feel great. Next: <b>${esc(stageLabel(nxt))}: ${esc(nxt.name)}</b>.`, "happy", "hint")}
      <div class="row"><button class="btn big" id="eMap">Back to the map</button>${nxt ? `<button class="btn blue" id="eNext">▶ Next stage</button>` : ""}<button class="btn yellow" id="eCode">🔑 Get my save code</button></div>`, { onClose: renderMap });
    document.getElementById("eMap").onclick = () => { SFX.tap(); closeModal(); renderMap(); };
    if (nxt) document.getElementById("eNext").onclick = () => { SFX.tap(); closeModal(); enterRoom(nxt.id); };
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
  R.used.push(inc.id); R.incidents++;
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
    ok ? (SFX.right(), onRight()) : (SFX.wrong(), onWrong());
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
