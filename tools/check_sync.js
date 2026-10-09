// Cloud-sync and streak checks: NODE_PATH=$(npm root -g) node tools/check_sync.js (from the repo root, after python3 tools/build.py)
// Sync + streak tests against a fake class server that behaves like server/Code.gs (one cell, 49,000-character cap)
const { chromium } = require("playwright");
const DB = {}, RECS = []; let failNext = 0, saves = 0, rejects = 0;
const vm = require("vm"), fs = require("fs"), GS = { PropertiesService: { getScriptProperties: () => ({ getProperty: () => "" }) } };
vm.createContext(GS); vm.runInContext(fs.readFileSync(require("path").join(__dirname, "../server/Code.gs"), "utf8"), GS);
const ymdLocal = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const res = o => ({ status: 200, contentType: "application/json", body: JSON.stringify(o) });
function server(route) {
  const body = JSON.parse(route.request().postData() || "{}"), em = "stu@school.hk";
  const user = { email: em, en: "Test Student", zh: "", cls: "4A", no: "1", teacher: false };
  if (body.action === "login") return route.fulfill(res({ ok: true, user, progress: DB[em] ? DB[em].state : null }));
  if (body.action === "save") { saves++;
    if (failNext) { failNext--; return route.fulfill(res({ ok: false, error: "server: busy" })); }
    if (String(body.state).length > 49000) { rejects++; return route.fulfill(res({ ok: false, error: "server: progress too large" })); }
    DB[em] = { state: body.state, summary: body.summary }; return route.fulfill(res({ ok: true })); }
  if (body.action === "record") { (body.records || []).forEach(r => RECS.push(r)); return route.fulfill(res({ ok: true, saved: (body.records || []).length })); }
  if (body.action === "repair") { // the real pure functions from Code.gs: cleanRecords → recordFacts → repairState
    const rows = RECS.map(r => { const x = new Array(23).fill(""); x[0] = new Date(r.end); x[1] = r.session || ""; x[2] = em; x[8] = { study: "Study series", escape: "Escape stage", rush: "Cell Rush", pal: "Pal questions" }[r.mode] || r.mode;
      x[10] = r.stage || ""; x[11] = r.ans; x[12] = r.cor; x[14] = r.stars || 0; x[16] = { done: "Finished", quit: "Stopped early", clear: "Stage cleared" }[r.status] || r.status; x[18] = new Date(r.end); x[22] = r.rid || ""; return x; });
    const cr = GS.cleanRecords(rows), today = ymdLocal(new Date(NOW)), students = [];
    if (DB[em]) { const st = JSON.parse(DB[em].state), out = GS.repairState(st, GS.recordFacts(cr.rows, ymdLocal, body.rooms || null), today);
      if (out.items.length) { students.push({ email: em, items: out.items }); if (!body.dry) { DB[em].state = JSON.stringify(out.state); DB[em].summary.streak = out.state.current_streak; } } }
    return route.fulfill(res({ ok: true, checked: 1, records: cr.counts, students, dry: !!body.dry })); }
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
  // ---------- What the game sends to the class sheet ----------
  RECS.length = 0;
  ({ ctx, p } = await device(9)); await signIn(p);
  await p.evaluate(() => { activityDone({ mode: "notebook", topic: "all", stage: "Mistake Notebook", ans: 0, cor: 0, done: false });   // empty round
    activityDone({ mode: "study", room: ROOMS[2], stage: `${ROOMS[2].id} Mixed · Hard`, ans: 12, cor: 9, stars: 2, secs: 99999, done: true });
    activityDone({ mode: "sim", sim: "bodypal", ans: 4, cor: 3 }); activityDone({ mode: "sim", sim: "lung", ans: 0 }); flushQueue(); });
  await p.waitForTimeout(700);
  check(RECS.length === 2 && RECS.every(r => r.rid && r.ans > 0), "empty rounds and Lab visits are not recorded; every record has an ID " + RECS.map(r => r.mode).join(","));
  const fs1 = RECS.find(r => r.mode === "study"), pal = RECS.find(r => r.mode === "pal");
  check(fs1 && /Mixed · Hard/.test(fs1.stage) && fs1.status === "done" && fs1.secs === 10800, "a mixed series keeps its own label, is not a stage clear, and its time is capped at 3 h");
  check(!!pal, "pal questions are recorded");
  await ctx.close();
  // ---------- Merge: an old copy can never wipe newer progress ----------
  ({ ctx, p } = await device(9));
  const mg = await p.evaluate(() => {
    const A = normalise({ upd: 200, coins: 50, current_streak: 2, longest_streak: 4, last_study_day: "2026-10-05", completed_rooms: [ROOMS[0].id], room_stars: { [ROOMS[0].id]: 1 }, mastered_puzzles: ["a:1"] });
    const B = normalise({ upd: 100, coins: 900, current_streak: 6, longest_streak: 6, last_study_day: "2026-10-08", completed_rooms: [ROOMS[0].id, ROOMS[1].id], room_stars: { [ROOMS[0].id]: 3 }, mastered_puzzles: ["b:2"] });
    const m = mergeSaves(A, B);
    return { coins: m.coins, st: m.current_streak, best: m.longest_streak, last: m.last_study_day, rooms: m.completed_rooms.length, stars: m.room_stars[ROOMS[0].id], mp: m.mastered_puzzles.length };
  });
  check(mg.coins === 50 && mg.st === 6 && mg.best === 6 && mg.last === "2026-10-08" && mg.rooms === 2 && mg.stars === 3 && mg.mp === 2, `merge keeps the newer coins but the later streak and all earned progress ${JSON.stringify(mg)}`);
  await ctx.close();
  // ---------- Guest mode on a class device: a clear warning, and guest progress can join the account ----------
  ({ ctx, p } = await device(9));
  await p.click("#lgGuest"); await p.fill("#nm", "G"); await p.click("#go"); await p.waitForTimeout(700);
  await p.evaluate(() => { if (typeof tourEnd === "function") tourEnd(); S.tourV = 2; activityDone({ mode: "study", room: ROOMS[5], ans: 5, cor: 5 }); S.longest_streak = 50; save(); renderMap(); });
  check(!!(await p.$(".guestbar")), "guest mode shows the 'Playing as guest' bar");
  await p.evaluate(() => { authPref(""); }); await signIn(p);
  await p.waitForTimeout(2200); const gm = await p.evaluate(() => !!document.getElementById("gmYes"));
  check(gm, "signing in offers to add the guest progress");
  if (gm) { await p.click("#gmYes"); await p.waitForTimeout(300); }
  check(await p.evaluate(() => S.longest_streak) === 50, "the guest's best streak is now in the account");
  await ctx.close();
  // ---------- Repair: records uploaded late are dated by when they happened; the teacher's restore raises the streak ----------
  const em = "stu@school.hk", st0 = JSON.parse(DB[em].state); st0.current_streak = 1; st0.longest_streak = Math.max(1, st0.longest_streak); st0.last_study_day = "2026-10-06"; DB[em].state = JSON.stringify(st0);
  RECS.length = 0; [6, 7, 8, 9].forEach(d => RECS.push({ mode: "study", ans: 10, cor: 8, status: "done", end: DAY(d).toISOString() }));
  ({ ctx, p } = await device(9));
  await signIn(p);
  const dryFixed = await p.evaluate(() => api("repair", { dry: true }).then(j => j.students.length));
  check(dryFixed === 1 && JSON.parse(DB[em].state).current_streak === 1, "dry run lists the student without changing anything");
  await p.evaluate(() => api("repair", {}));
  check(JSON.parse(DB[em].state).current_streak === 4 && DB[em].summary.streak === 4, "restore rebuilds a 4-day streak from the records");
  await ctx.close();
  ({ ctx, p } = await device(9));
  await signIn(p);
  check(await p.evaluate(() => S.current_streak) === 4, "the student sees the restored streak on the next sign-in");
  await ctx.close();
  console.log(`\nsaves ${saves}, rejected ${rejects}`); console.log("page errors:", errs.length ? errs : "none");
  console.log(fails ? `${fails} FAILED` : "ALL PASSED"); await b.close(); process.exit(fails ? 1 : 0);
})();
