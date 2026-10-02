
/* ============================================================
   5i. 🔐 Class sign-in with Google, or 🎒 guest mode (no Google account needed).
   - Signed in: progress syncs to the class Google Sheet, every finished activity is recorded,
     and the class leaderboard opens. Setup: server/SETUP.md (server code: server/Code.gs).
   - Guest: progress stays on this device only. No leaderboard, no class records.
   Inside the claude.ai preview (a frame) Google sign-in can't run, so it is always guest mode.
   ============================================================ */
const BIO_CONFIG = {
  GOOGLE_CLIENT_ID: "742019381229-dnk6iv61fguubpcv5b8fe7pru3n63k8t.apps.googleusercontent.com",
  API_URL: "" // paste the Apps Script /exec URL here (see server/SETUP.md) to switch class sign-in on
};
const AUTH_KEY = "escapeGame_biology_auth";
const AUTH = { mode: null, user: null, token: null, exp: 0, stale: false, lastSync: 0 };
const SESSION_ID = Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const cloudOn = () => !!(BIO_CONFIG.GOOGLE_CLIENT_ID && BIO_CONFIG.API_URL) && window.top === window.self;
const signedIn = () => AUTH.mode === "google" && !!AUTH.user;
function storeKey() { return signedIn() ? `${SAVE_KEY}_u_${AUTH.user.email}` : SAVE_KEY; }
function authPref(v) {
  try { if (v !== undefined) { v ? localStorage.setItem(AUTH_KEY, v) : localStorage.removeItem(AUTH_KEY); return v; } return localStorage.getItem(AUTH_KEY) || ""; } catch (e) { return ""; }
}
const tokenOk = () => !!AUTH.token && Date.now() < AUTH.exp - 30000;
const userName = () => signedIn() ? (AUTH.user.en || AUTH.user.zh || AUTH.user.email.split("@")[0]) : "Guest";

/* ----- talking to the class server ----- */
function post(action, data) {
  return fetch(BIO_CONFIG.API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(Object.assign({ action, token: AUTH.token, app: "bio" }, data || {})) }).then(r => r.json());
}
function api(action, data) {
  if (!signedIn()) return Promise.resolve({ ok: false, error: "guest" });
  if (!tokenOk()) { markStale(); return Promise.resolve({ ok: false, error: "expired" }); }
  return post(action, data).then(j => { if (!j.ok && j.error === "expired") markStale(); return j; }, () => ({ ok: false, error: "network" }));
}
function markStale() { if (!AUTH.stale) { AUTH.stale = true; renderTools(); toast("⚠️ Sign-in expired. Tap 👤 to sign in again and keep syncing."); } }
function errText(e) {
  return ({ not_listed: "This Google account isn't on the class list. Use your school account, or tap Play as guest.", bad_client: "Sign-in is set up for a different website. Please tell your teacher.",
    unverified: "This Google account's email isn't verified.", expired: "Sign-in timed out. Please try again.", network: "Can't reach the class server. Check your internet, or play as guest.",
    unknown_action: "The class server needs updating. Please tell your teacher." })[e] || `Sign-in problem (${e}). You can still play as guest.`;
}

/* ----- Google Identity Services ----- */
let gisReady = false, gisLoading = false;
function withGIS(cb) {
  if (window.google && google.accounts && google.accounts.id) {
    if (!gisReady) { google.accounts.id.initialize({ client_id: BIO_CONFIG.GOOGLE_CLIENT_ID, callback: onCredential, auto_select: false, cancel_on_tap_outside: true }); gisReady = true; }
    cb(); return;
  }
  if (gisLoading) { setTimeout(() => withGIS(cb), 300); return; }
  gisLoading = true;
  const sc = document.createElement("script"); sc.src = "https://accounts.google.com/gsi/client"; sc.async = true;
  sc.onload = () => { gisLoading = false; withGIS(cb); };
  sc.onerror = () => { gisLoading = false; loginMsg("Couldn't load Google sign-in. Check your internet, or play as guest.", true); };
  document.head.appendChild(sc);
}
function renderGBtn(id) {
  const el = document.getElementById(id); if (!el || !cloudOn()) return;
  withGIS(() => { el.innerHTML = ""; google.accounts.id.renderButton(el, { theme: "filled_blue", size: "large", shape: "pill", text: "signin_with", locale: "en-GB", width: 260 }); });
}
function jwtPayload(t) { try { let p = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"); while (p.length % 4) p += "="; return JSON.parse(decodeURIComponent(escape(atob(p)))); } catch (e) { return {}; } }
function loginMsg(t, bad) { const m = document.getElementById("loginMsg"); if (m) m.innerHTML = `<p class="lgmsg ${bad ? "bad" : ""}">${esc(t)}</p>`; }
function onCredential(resp) {
  const tok = resp.credential, pl = jwtPayload(tok), em = String(pl.email || "").toLowerCase();
  if (signedIn() && em === AUTH.user.email) { // re-sign-in after the token expired
    AUTH.token = tok; AUTH.exp = (pl.exp || 0) * 1000; AUTH.stale = false; closeModal(); toast("☁️ Reconnected. Progress synced."); flushQueue(); cloudSave(); renderTools(); return;
  }
  AUTH.token = tok; AUTH.exp = (pl.exp || 0) * 1000; loginMsg("⏳ Checking the class list…");
  post("login", {}).then(j => {
    if (!j.ok) { AUTH.token = null; loginMsg(errText(j.error), true); return; }
    if (S) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} } // keep any guest progress safe
    AUTH.mode = "google"; AUTH.user = j.user; AUTH.stale = false; AUTH.lastSync = Date.now(); authPref("google");
    let remote = null; try { remote = j.progress ? JSON.parse(j.progress) : null; } catch (e) {}
    const local = load();
    const chosen = remote && (!local || (remote.upd || 0) > (local.upd || 0)) ? normalise(remote) : local;
    const guest = load(SAVE_KEY);
    toast(`👋 Hi ${userName()}${AUTH.user.cls ? ` (${AUTH.user.cls}${AUTH.user.no ? "-" + AUTH.user.no : ""})` : ""}! Progress will sync to your class.`);
    flushQueue();
    if (chosen) { S = chosen; enterGame(); }
    else if (guest && (guest.completed_rooms.length || guest.coins > 0)) offerGuestImport(guest);
    else { S = null; renderWelcome(); prefillName(); }
  }, () => { AUTH.token = null; loginMsg(errText("network"), true); });
}
function prefillName() { const n = document.getElementById("nm"); if (n && signedIn()) n.value = (AUTH.user.en || "").split(/\s+/)[0] || ""; }
function offerGuestImport(guest) {
  openModal(`<span class="kicker">🎒 Guest progress found</span><h2>Move it into your account?</h2>
    ${say("hachiware", `This device has guest progress: <b>${guest.completed_rooms.length}</b> stage${guest.completed_rooms.length === 1 ? "" : "s"} and <b>${guest.coins}</b> 🌰. Only move it if it's <b>yours</b>.`, "normal", "hint")}
    <div class="row"><button class="btn big" id="giYes">Yes, it's mine</button><button class="btn plain" id="giNo">No, start fresh</button></div>`, { closable: false });
  document.getElementById("giYes").onclick = () => { SFX.tap(); closeModal(); S = normalise(JSON.parse(JSON.stringify(guest))); S.player_id = newId(); save(true); enterGame(); };
  document.getElementById("giNo").onclick = () => { SFX.tap(); closeModal(); S = null; renderWelcome(); prefillName(); };
}
function signOut() {
  if (signedIn()) { try { cloudSave(); flushQueue(); } catch (e) {} }
  save();
  try { if (window.google && google.accounts) google.accounts.id.disableAutoSelect(); } catch (e) {}
  Object.assign(AUTH, { mode: null, user: null, token: null, exp: 0, stale: false, lastSync: 0 }); authPref("");
  S = load(); closeModal(); renderLogin();
}
function playAsGuest() {
  SFX.init(); SFX.tap(); authPref("guest"); AUTH.mode = "guest";
  S = load(); S ? enterGame() : renderWelcome();
}
function enterGame() { checkIn(); homeTab = "home"; renderMap(); showResume(); }

/* ----- records queue + cloud save (signed-in only) ----- */
const qKey = () => `${SAVE_KEY}_queue_${signedIn() ? AUTH.user.email : ""}`;
function getQ() { try { return JSON.parse(localStorage.getItem(qKey()) || "[]"); } catch (e) { return []; } }
function setQ(a) { try { localStorage.setItem(qKey(), JSON.stringify(a.slice(-300))); } catch (e) {} }
function logRec(r) {
  if (!signedIn()) return;
  r.session = SESSION_ID; r.end = new Date().toISOString();
  const a = getQ(); a.push(r); setQ(a); flushQueue();
}
let flushing = false;
function flushQueue() {
  if (flushing || !signedIn()) return;
  const a = getQ(); if (!a.length) return;
  flushing = true;
  api("record", { records: a }).then(j => { flushing = false; if (j.ok) { setQ(getQ().slice(a.length)); AUTH.lastSync = Date.now(); } });
}
let cloudTimer = null;
function cloudSaveSoon(now) { if (!signedIn()) return; clearTimeout(cloudTimer); cloudTimer = setTimeout(cloudSave, now ? 50 : 6000); }
const collectionCount = () => PETS.filter(p => S.pets[p.id]).length + collOwned();
function cloudPayload() {
  let st = JSON.stringify(S);
  if (st.length > 45000) { const c = JSON.parse(st); c.seen = {}; c.room_progress = {}; st = JSON.stringify(c); }
  const ap = S.activePet && petById(S.activePet);
  return { state: st, summary: { streak: S.current_streak, best: S.longest_streak, stars: ROOMS.reduce((a, r) => a + roomStars(r), 0), stages: S.completed_rooms.length,
    coins: S.coins, pet: ap ? ap.name : "", pets: PETS.filter(p => S.pets[p.id]).length, mistakes: mistakeKeys().length, cleared: S.mistakes_cleared || 0,
    trophies: Object.keys(S.trophies || {}).length, lastDay: S.last_study_day || "", xp: dedication(), col: collectionCount() } };
}
function cloudSave() { if (!signedIn() || !S) return; if (!tokenOk()) { markStale(); return; } api("save", cloudPayload()).then(j => { if (j.ok) { AUTH.lastSync = Date.now(); } }); }
window.addEventListener("pagehide", () => {
  if (signedIn() && tokenOk() && S && navigator.sendBeacon) {
    try { navigator.sendBeacon(BIO_CONFIG.API_URL, JSON.stringify(Object.assign({ action: "save", token: AUTH.token }, cloudPayload())));
      const a = getQ(); if (a.length) navigator.sendBeacon(BIO_CONFIG.API_URL, JSON.stringify({ action: "record", token: AUTH.token, records: a })); } catch (e) {}
  }
});

/* ----- 🌤️ Login screen ----- */
const LG_FLOAT = ["🧬", "🦠", "🍃", "🔬", "🫁", "🧫", "🌱", "💧", "🐝", "🧠"];
function renderLogin() {
  stopRush(); stopTimer(); R = null; S && save(); renderNav(false); MUSIC.setMode("map");
  document.getElementById("tools").innerHTML = "";
  const on = cloudOn(), back = authPref() === "google";
  $app.innerHTML = `<section class="login">
    <div class="lgsky" aria-hidden="true">${LG_FLOAT.map((e, i) => `<span style="left:${(i * 37 + 7) % 92}%;top:${(i * 53 + 11) % 80}%;animation-delay:${-i * 1.7}s;font-size:${1.1 + (i % 3) * .45}rem">${e}</span>`).join("")}<i class="orb o1"></i><i class="orb o2"></i></div>
    <div class="lgtitle"><span class="kicker">${HERO_KICKER}</span><h1>Mochi Bio Escape</h1><p class="sub">From tiny cells to whole ecosystems, one small stage a day.</p></div>
    <div class="island" aria-hidden="true"><svg class="isl" viewBox="0 0 300 70"><ellipse cx="150" cy="22" rx="146" ry="20" fill="#9ED89A" stroke="${CO}" stroke-width="3"/><path d="M8 24 Q150 120 292 24" fill="#C79A72" stroke="${CO}" stroke-width="3"/><path d="M60 40 q10 8 20 0 M130 52 q10 8 20 0 M200 42 q10 8 20 0" stroke="#A97C57" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="150" cy="18" rx="120" ry="10" fill="#B6E6AE"/></svg>
      <div class="ifig f1">${figure("hachiware", "happy")}</div><div class="ifig f2">${figure("chiikawa", "sparkle")}</div><div class="ifig f3">${figure("usagi", "happy")}</div></div>
    <section class="card lgcard">
      ${on ? `<h2 style="margin:0">${back ? "Welcome back! 👋" : "Join your class"}</h2>
        <p class="small muted" style="margin:0">Sign in with your <b>school Google account</b> to sync progress across devices, appear on the class leaderboard and share your results with your teacher.</p>
        <div id="gbtn" class="gbtn"><button class="btn big" disabled>Loading Google sign-in…</button></div>`
      : `<h2 style="margin:0">Ready to explore? 🌱</h2><p class="small muted" style="margin:0">Class sign-in isn't switched on in this copy, so everyone plays as a guest. Your progress saves on this device, and 🔑 save codes move it to another one.</p>`}
      ${on ? `<div class="or"><span>or</span></div>` : ""}
      <button class="btn ${on ? "plain" : "big"} guestbtn" id="lgGuest">🎒 Play as guest</button>
      <p class="small muted" style="margin:0;text-align:center">${on ? "No Google account needed. Guest progress stays on this device (no leaderboard or class records)." : "No account needed."}</p>
      <div id="loginMsg"></div>
    </section>
    <div class="teasers"><div class="teaser"><span aria-hidden="true">📚</span><b>${ROOMS.length} stages</b><span class="small">across ${TOPICS.length} topics</span></div>
      <div class="teaser"><span aria-hidden="true">🐾</span><b>${PETS.length} rare pets</b><span class="small">with real biology stories</span></div>
      <div class="teaser"><span aria-hidden="true">🔬</span><b>${SIMS.length} simulations</b><span class="small">lungs, eyes, ears, cells</span></div></div>
  </section>`;
  document.getElementById("lgGuest").onclick = playAsGuest;
  if (on) renderGBtn("gbtn");
  window.scrollTo({ top: 0 });
}

/* ----- 👤 Account sheet ----- */
function openAccount() {
  const u = AUTH.user, q = signedIn() ? getQ().length : 0;
  if (signedIn()) {
    openModal(`<span class="kicker">👤 Account</span><h2>${esc(userName())}</h2>
      <p class="small muted" style="margin:0">${u.cls ? `Class ${esc(u.cls)}${u.no ? ` · No. ${esc(u.no)}` : ""} · ` : ""}${esc(u.email)}</p>
      <div class="preview small">${AUTH.stale ? "⚠️ Sign-in expired. Sign in again to keep syncing (your progress is safe on this device)." : `☁️ Synced to your class${AUTH.lastSync ? ` at ${new Date(AUTH.lastSync).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}${q ? ` · ${q} record${q > 1 ? "s" : ""} waiting to upload` : ""}`}</div>
      ${AUTH.stale ? `<div id="gbtn2" class="gbtn"></div>` : `<div class="row"><button class="btn blue" id="acSync">☁️ Sync now</button><button class="btn yellow" id="acLb">🏆 Class leaderboard</button></div>`}
      <div class="row"><button class="btn plain" id="acOut">🚪 Sign out</button></div>`);
    if (AUTH.stale) renderGBtn("gbtn2");
    const sy = document.getElementById("acSync"); if (sy) sy.onclick = () => { SFX.tap(); cloudSave(); flushQueue(); toast("☁️ Syncing…"); };
    const lb = document.getElementById("acLb"); if (lb) lb.onclick = () => { SFX.tap(); openLeaderboard(); };
  } else {
    openModal(`<span class="kicker">👤 Account</span><h2>🎒 Guest mode</h2>
      ${say("hachiware", "Your progress is saved <b>on this device only</b>. Use 🔑 Save code to move it to another device." + (cloudOn() ? " Sign in with your school Google account to sync, join the class leaderboard and send your results to your teacher." : ""), "normal", "hint")}
      <div class="row">${cloudOn() ? `<button class="btn big" id="acIn">🎓 Sign in to my class</button>` : ""}<button class="btn plain" id="acCode">🔑 Save code</button><button class="btn plain" id="acOut">🌤️ Back to the start screen</button></div>`);
    const ai = document.getElementById("acIn"); if (ai) ai.onclick = () => { SFX.tap(); closeModal(); save(); authPref(""); renderLogin(); };
    document.getElementById("acCode").onclick = () => { SFX.tap(); closeModal(); openSaveModal(); };
  }
  document.getElementById("acOut").onclick = () => { SFX.tap(); signOut(); };
}

/* ----- 🏆 Class leaderboard (signed-in students only) ----- */
const LB_CATS = [["xp", "🌟", "Effort", "points"], ["streak", "🔥", "Streak", "days"], ["col", "🐾", "Collection", "found"]];
let lbCat = "xp", lbScope = "class", lbData = {};
function openLeaderboard() {
  const mine = `<div class="preview row" style="justify-content:space-between"><span class="row" style="gap:8px">${playerAv("happy").replace("<svg", '<svg width="40" height="40"')}<b>${esc(signedIn() ? userName() : S.player_name)}</b></span><span><b>${dedication()}</b> effort points</span></div>`;
  const how = `<p class="small muted" style="margin:0">Effort points = 10 per day played + 1 per question right + 10 per stage cleared + 5 per Cell Rush round + 25 per trophy. Coming back every day matters most!</p>`;
  if (!signedIn()) {
    openModal(`<span class="kicker">🏆 Class leaderboard</span><h2>For signed-in classmates</h2>${mine}${how}
      ${say("hachiware", cloudOn() ? "Guests play privately, so there's no board here. Sign in with your school Google account (👤 at the top) to see how your class is doing!" : "Class sign-in isn't switched on in this copy, so your effort points stay on this device. Keep going! 💪", "normal", "hint")}`, { wide: true });
    return;
  }
  const box = openModal(`<span class="kicker">🏆 Class leaderboard</span><h2>Who's working hardest?</h2>
    <div class="slottabs" role="tablist">${LB_CATS.map(([k, ic, nm]) => `<button role="tab" aria-selected="${k === lbCat}" data-lbc="${k}"><span aria-hidden="true">${ic}</span>${nm}</button>`).join("")}</div>
    <div class="slottabs" role="tablist" style="margin-top:-4px">${[["class", "My class"], ["all", "Everyone"]].map(([k, nm]) => `<button role="tab" aria-selected="${k === lbScope}" data-lbs="${k}">${nm}</button>`).join("")}</div>
    <div id="lbBody"><p>Loading the board… ⏳</p></div>${how}`, { wide: true });
  box.querySelectorAll("[data-lbc]").forEach(b => b.onclick = () => { SFX.tap(); lbCat = b.dataset.lbc; openLeaderboard(); });
  box.querySelectorAll("[data-lbs]").forEach(b => b.onclick = () => { SFX.tap(); lbScope = b.dataset.lbs; openLeaderboard(); });
  const show = d => {
    const body = document.getElementById("lbBody"); if (!body) return;
    if (!d || !d.ok) { body.innerHTML = say("chiikawa", esc(errText(d ? d.error : "network")), "cry"); return; }
    const c = d.cats[lbCat], [, ic, , unit] = LB_CATS.find(x => x[0] === lbCat), top = c.top;
    if (!top.length) { body.innerHTML = say("usagi", "Nobody on the board yet. Be the FIRST! 🐰", "happy"); return; }
    const pod = [1, 0, 2].filter(i => top[i]).map(i => `<div class="pod p${i + 1} ${top[i].me ? "me" : ""}"><span class="crown" aria-hidden="true">${["👑", "🥈", "🥉"][i]}</span><b>${esc(top[i].n)}</b><span class="small">${esc(top[i].c)}</span><span class="pv">${ic} ${top[i].v}</span><div class="step">${i + 1}</div></div>`).join("");
    const rest = top.slice(3).map((r, i) => `<tr class="${r.me ? "me" : ""}"><td class="rk">${i + 4}</td><td>${esc(r.n)} <span class="small muted">${esc(r.c)}</span></td><td><b>${r.v}</b> ${unit}</td></tr>`).join("");
    const me = c.me, ahead = me && me.rank > 1 ? top[me.rank - 2] : null;
    body.innerHTML = `<div class="podium">${pod}</div>${rest ? `<div class="lb-wrap"><table class="lb"><tbody>${rest}</tbody></table></div>` : ""}
      ${me ? `<div class="mybar">You: <b>#${me.rank}</b> · ${ic} ${me.v} ${unit}${ahead ? ` · only <b>${ahead.v - me.v + 1}</b> more to pass #${me.rank - 1}!` : " · You're at the top! 🎉"}</div>` : `<div class="mybar">Finish an activity to join the board! 🌱</div>`}
      ${top.slice(0, 3).some(r => r.me) ? say("momonga", "You're in the top 3! Thank you for working so hard. 💜", "sparkle") : ""}`;
  };
  const key = lbScope;
  if (lbData[key] && Date.now() - lbData[key].t < 60000) return show(lbData[key].d);
  cloudSave();
  api("board", { scope: lbScope }).then(d => { if (d && d.ok) lbData[key] = { t: Date.now(), d }; show(d); });
}
