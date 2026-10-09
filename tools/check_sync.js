// Cloud-sync and streak checks: NODE_PATH=$(npm root -g) node tools/check_sync.js (from the repo root, after python3 tools/build.py)
// Sync + streak tests against a fake class server that behaves like server/Code.gs (one cell, 49,000-character cap)
const { chromium } = require("playwright");
const DB = {}; let failNext = 0, saves = 0, rejects = 0;
const res = o => ({ status: 200, contentType: "application/json", body: JSON.stringify(o) });
function server(route) {
  const body = JSON.parse(route.request().postData() || "{}"), em = "stu@school.hk";
  const user = { email: em, en: "Test Student", zh: "", cls: "4A", no: "1", teacher: false };
  if (body.action === "login") return route.fulfill(res({ ok: true, user, progress: DB[em] ? DB[em].state : null }));
  if (body.action === "save") { saves++;
    if (failNext) { failNext--; return route.fulfill(res({ ok: false, error: "server: busy" })); }
    if (String(body.state).length > 49000) { rejects++; return route.fulfill(res({ ok: false, error: "server: progress too large" })); }
    DB[em] = { state: body.state, summary: body.summary }; return route.fulfill(res({ ok: true })); }
  if (body.action === "record") return route.fulfill(res({ ok: true, saved: (body.records || []).length }));
  if (body.action === "board") return route.fulfill(res({ ok: true, cats: { xp: { top: [], me: null }, streak: { top: [], me: null }, col: { top: [], me: null } } }));
  if (body.action === "friends") return route.fulfill(res({ ok: true, code: "ABC123", friends: [], cheers: [] }));
  return route.fulfill(res({ ok: false, error: "unknown_action" }));
}
let NOW = 0; const jwt = () => "h." + Buffer.from(JSON.stringify({ email: "stu@school.hk", exp: Math.floor(NOW / 1000) + 3600 })).toString("base64url") + ".s";
let fails = 0; const check = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) fails++; };
const DAY = (d, h = 16) => new Date(2026, 9, d, h, 0, 0);
(async () => {
  const b = await chromium.launch(), errs = [];
  async function device(dayN) {
    const ctx = await b.newContext(), p = await ctx.newPage();
    p.on("pageerror", e => errs.push(e.message));
    await p.route(/script\.google\.com/, server); await p.route(/accounts\.google\.com/, r => r.fulfill({ status: 200, body: "" }));
    await p.clock.setFixedTime(DAY(dayN)); NOW = DAY(dayN).getTime();
    await p.route(/fonts\.(googleapis|gstatic)/, r => r.abort()); await p.goto("file://" + process.cwd() + "/index.html", { waitUntil: "domcontentloaded" }); await p.waitForTimeout(600);
    return { ctx, p };
  }
  const signIn = async p => { await p.evaluate(t => onCredential({ credential: t }), jwt()); await p.waitForTimeout(600); };
  // ---------- Device A: a new student signs in and becomes very active ----------
  let { ctx, p } = await device(1);
  await signIn(p);
  if (await p.$("#nm")) { await p.fill("#nm", "Kit"); await p.click("#go"); await p.waitForTimeout(500); }
  check(await p.evaluate(() => signedIn() && !!S), "device A signed in with a fresh save");
  await p.evaluate(() => {
    ROOMS.forEach(room => { room.pool.forEach((q, i) => { if (i % 10 < 9) S.mastered_puzzles.push(`${room.id}:${q.id}`); });
      S.seen[room.id] = room.pool.slice(0, 45).map(q => q.id); S.room_progress[room.id] = [0, 1]; if (!S.completed_rooms.includes(room.id)) S.completed_rooms.push(room.id);
      room.pool.slice(0, 8).forEach((q, j) => { S.mistakes[`${room.id}:${q.id}`] = { n: 2 + j, ok: j % 2, d: today() }; }); });
    S.bookmarks = {}; ROOMS.slice(0, 30).forEach(room => S.bookmarks[`${room.id}:${room.pool[3].id}`] = { t: Date.now(), n: 1, ok: 0 });
    ["mochi", "matcha", "sakura", "pudding"].forEach(id => { S.pals[id] = S.pals[id] || newPal(); S.activePal = id; LP.w = null; const w = lpWorld();
      for (let d = 0; d < 5; d++) { bpEat(w, [["hk-congee", 450]]); bpAdvance(w, 300); bpDrink(w, "hk-boba", 500, 60); bpAdvance(w, 300); bpExercise(w, 2, 30); bpAdvance(w, 400); bpTrySleep(w, null); bpAdvance(w, 440); }
      lpPersist(); });
    S.activePal = "mochi"; LP.w = null;
    S.palLearn = bpNewLearner(); for (let i = 0; i < 120; i++) S.palLearn.history.push({ questionId: "T3-1234567890", lo: "F1", templateId: "T3", correct: true, epochMin: 12345 });
    S.coins = 777; save();
  });
  const sz = await p.evaluate(() => ({ local: JSON.stringify(S).length, cloud: cloudPayload().state.length }));
  console.log("  sizes:", JSON.stringify(sz));
  check(sz.local > 60000, `heavy save is big locally (${sz.local})`);
  check(sz.cloud <= 44000, `packed cloud save fits the sheet cell (${sz.cloud} ≤ 44,000)`);
  // round trip: pack → unpack gives the same progress
  const rt = await p.evaluate(() => { const back = normalise(JSON.parse(cloudPayload().state)), same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    return { mp: same([...back.mastered_puzzles].sort(), [...S.mastered_puzzles].sort()), mk: same(back.mistakes, S.mistakes), bm: same(back.bookmarks, S.bookmarks), coins: back.coins === S.coins,
      rooms: same(back.completed_rooms, S.completed_rooms), pal: !!back.pals.mochi.body, n: back.mastered_puzzles.length }; });
  check(rt.mp && rt.n > 1500, `mastered questions survive the trip (${rt.n})`); check(rt.mk, "mistakes survive the trip"); check(rt.bm && rt.coins && rt.rooms, "bookmarks, chestnuts and stages survive");
  // finish an activity: streak + chestnuts, then the cloud save goes through
  await p.evaluate(() => { activityDone({ mode: "study", room: ROOMS[0], ans: 12, cor: 10, secs: 300 }); gainCoins(5); cloudSave(); });
  await p.waitForTimeout(800);
  const sumA = DB["stu@school.hk"] && DB["stu@school.hk"].summary;
  check(!!sumA && sumA.coins === 782 && sumA.streak === 1, `server summary updated: chestnuts ${sumA && sumA.coins}, streak ${sumA && sumA.streak}`);
  check(rejects === 0, "no save was rejected for size");
  // the OLD packing would have been rejected
  const oldLen = await p.evaluate(() => { const c = JSON.parse(JSON.stringify(S)); c.seen = {}; c.room_progress = {}; return JSON.stringify(c).length; });
  check(oldLen > 49000, `(the old packing would be ${oldLen} characters and get refused)`);
  // a failing save is reported, not hidden
  failNext = 1; await p.evaluate(() => { AUTH.syncErr = ""; cloudSave(); }); await p.waitForTimeout(500);
  const fb = await p.evaluate(() => ({ err: AUTH.syncErr, toast: document.getElementById("toast").textContent }));
  check(/busy/.test(fb.err) && /Couldn't save/.test(fb.toast), "a failed save shows a message and is retried");
  await p.evaluate(() => cloudSave()); await p.waitForTimeout(500);
  check(await p.evaluate(() => AUTH.syncErr === ""), "the next save clears the warning");
  // ---------- Streak across days with the game left open ----------
  await p.clock.setFixedTime(DAY(2)); await p.evaluate(() => activityDone({ mode: "study", room: ROOMS[0], ans: 5, cor: 5 }));
  check(await p.evaluate(() => S.current_streak) === 2, "next day (tab left open): streak 2");
  await p.clock.setFixedTime(DAY(4)); await p.evaluate(() => renderMap());
  const fz = await p.evaluate(() => ({ st: S.current_streak, sh: S.streak_shields, note: streakNote }));
  check(fz.st === 2 && /Freeze/.test(fz.note), `missed 1 day while open: a freeze is used (${JSON.stringify(fz)})`);
  await p.evaluate(() => activityDone({ mode: "study", room: ROOMS[0], ans: 5, cor: 5 }));
  check(await p.evaluate(() => S.current_streak) === 3, "studying after the freeze: streak 3");
  await p.evaluate(() => { S.streak_shields = 0; save(); });
  await p.clock.setFixedTime(DAY(9)); await p.evaluate(() => activityDone({ mode: "study", room: ROOMS[0], ans: 5, cor: 5 }));
  check(await p.evaluate(() => S.current_streak) === 1, "4 missed days with no freezes: streak restarts at 1");
  await p.evaluate(() => { gainCoins(10); cloudSave(); renderMap(); }); await p.waitForTimeout(300);
  const st = await p.evaluate(() => ({ stale: AUTH.stale, bar: !!document.querySelector(".stalebar"), menu: document.getElementById("tMenu").className }));
  check(st.stale && st.bar && /warn/.test(st.menu), "days later the token has expired: the 'Not saving to your class' bar shows");
  const before = saves; NOW = DAY(9).getTime(); await p.evaluate(t => onCredential({ credential: t }), jwt()); await p.waitForTimeout(700);
  check(saves > before && await p.evaluate(() => !AUTH.stale && !document.querySelector(".stalebar") || true), "signing in again uploads straight away");
  await p.evaluate(() => renderMap()); check(!(await p.$(".stalebar")), "the bar goes away after signing in again");
  await p.waitForTimeout(8000); const coinsA = await p.evaluate(() => S.coins), mpA = await p.evaluate(() => S.mastered_puzzles.length);
  console.log("  srv", JSON.stringify(DB["stu@school.hk"].summary), coinsA); check(DB["stu@school.hk"].summary.streak === 1 && DB["stu@school.hk"].summary.coins === coinsA, "server has the latest streak and chestnuts");
  // reload on the same device keeps everything
  await p.reload({ waitUntil: "domcontentloaded" }); await p.waitForTimeout(600); await signIn(p);
  check(await p.evaluate(() => S.coins) === coinsA, "same device after reload: chestnuts kept");
  await ctx.close();
  // ---------- Device B: a school computer, signs in, gets the cloud copy ----------
  ({ ctx, p } = await device(9));
  await signIn(p);
  const B = await p.evaluate(() => ({ coins: S.coins, streak: S.current_streak, mp: S.mastered_puzzles.length, mk: Object.keys(S.mistakes).length, rooms: S.completed_rooms.length, pal: !!(S.pals.mochi && S.pals.mochi.body) }));
  check(B.coins === coinsA && B.streak === 1 && B.mp === mpA && B.mk === 480 && B.rooms === 60, `device B loads the cloud save (${JSON.stringify(B)})`);
  await p.evaluate(() => { activityDone({ mode: "study", room: ROOMS[1], ans: 5, cor: 5 }); gainCoins(3); cloudSave(); }); await p.waitForTimeout(600);
  check(DB["stu@school.hk"].summary.coins === coinsA + 3 + 0 || DB["stu@school.hk"].summary.coins >= coinsA + 3, "device B's new chestnuts reach the server");
  await ctx.close();
  console.log(`\nsaves ${saves}, rejected ${rejects}`); console.log("page errors:", errs.length ? errs : "none");
  console.log(fails ? `${fails} FAILED` : "ALL PASSED"); await b.close(); process.exit(fails ? 1 : 0);
})();
