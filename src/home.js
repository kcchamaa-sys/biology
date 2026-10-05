
/* ============================================================
   5d. Home screens: Mochi-style tabs with a bottom navigation bar, so students rarely scroll.
   Tabs: 🏠 Home · 🗺️ Stages · 🎮 Practice · 👗 Dress up · 🏆 Rewards
   ============================================================ */
let homeTab = "home", dressSlot = "hat", dressTry = null;
const NAV_TABS = [["home", "🏠", "Home"], ["stages", "🗺️", "Stages"], ["play", "🎮", "Practice"], ["pals", "🐾", "Pals"], ["rewards", "🏆", "Rewards"], ["lab", "🔬", "Lab"]];
const PAL_TABS = ["pals", "dress", "pets"];
function renderNav(active) {
  const nav = document.getElementById("bnav"); if (!nav) return;
  $app.className = active ? "tab-" + active : "";
  if (PAL_TABS.includes(active)) active = "pals";
  if (active === false || !S) { nav.hidden = true; document.body.classList.remove("has-nav"); return; }
  nav.hidden = false; document.body.classList.add("has-nav");
  const badge = { play: mistakeKeys().length, rewards: S.coll.pending, home: S.ill ? "🤒" : 0 };
  const tabs = isTeacher() ? NAV_TABS.concat([["stats", "📊", "Stats"]]) : NAV_TABS;
  nav.innerHTML = `<div class="nav-in">${tabs.map(([id, ic, label]) => `<button data-nav="${id}" ${active === id ? 'aria-current="page"' : ""}><span class="ni" aria-hidden="true">${ic}</span>${label}${badge[id] ? `<span class="nbadge">${badge[id]}</span>` : ""}</button>`).join("")}</div>`;
  nav.querySelectorAll("[data-nav]").forEach(b => b.onclick = () => { SFX.init(); SFX.tap(); homeTab = b.dataset.nav; renderMap(); window.scrollTo({ top: 0 }); });
}
const goTab = t => { homeTab = t; renderMap(); window.scrollTo({ top: 0 }); };

/* Fold bars: a secondary section collapses to one tappable bar (icon · short title · one "peek" number · chevron),
   so each screen leads with its one next step. Open/closed is remembered per student (browser storage). */
const FOLD_KEY = "bsp_folds";
function foldState() { try { return JSON.parse(localStorage.getItem(FOLD_KEY) || "{}") || {}; } catch (e) { return {}; } }
function foldHtml(id, { icon, title, peek = "", open = false, cls = "" }, body) {
  const st = foldState(), isOpen = Object.prototype.hasOwnProperty.call(st, id) ? !!st[id] : open;
  return `<details class="fold ${cls}" data-fold="${id}" ${isOpen ? "open" : ""}><summary><span class="fold-ic" aria-hidden="true">${icon}</span><span class="fold-t">${title}</span>${peek ? `<span class="fold-peek">${peek}</span>` : ""}<span class="fold-chev" aria-hidden="true"></span></summary><div class="fold-body">${body}</div></details>`;
}
function wireFolds(root) {
  (root || document).querySelectorAll("details.fold[data-fold]").forEach(d => d.addEventListener("toggle", () => {
    const st = foldState(); st[d.dataset.fold] = d.open; try { localStorage.setItem(FOLD_KEY, JSON.stringify(st)); } catch (e) {}
  }));
}

/* Escape mode (timer, penalties, spooky incidents) or Study mode (calm, no timer, no penalties) */
const isStudy = () => S.playMode === "study";
function modeSwitch() {
  return `<div class="modeswitch" role="radiogroup" aria-label="How do you want to play?">
    <button role="radio" data-pm="escape" aria-checked="${!isStudy()}"><b>⏱️ Escape</b><span>Timer, penalties, surprises</span></button>
    <button role="radio" data-pm="study" aria-checked="${isStudy()}"><b>📖 Study</b><span>Question series, no timer</span></button></div>`;
}
function wireModeSwitch(root) {
  root.querySelectorAll("[data-pm]").forEach(b => b.onclick = () => { SFX.tap(); S.playMode = b.dataset.pm; save(); toast(isStudy() ? "📖 Study mode: take your time, no timer or penalties." : "⏱️ Escape mode: beat the clock!"); renderMap(); });
}

/* A cosy pastel room with the player's dressed-up Mochi, like the Mochi pet room */
function roomWindow() {
  const h = new Date().getHours(), night = h >= 19 || h < 6;
  return `<svg class="rwin" viewBox="0 0 100 105" aria-hidden="true"><rect x="4" y="4" width="92" height="92" rx="18" fill="${night ? "#6E6590" : "#CFE9F7"}" stroke="#fff" stroke-width="6"/>${night
    ? `<circle cx="66" cy="34" r="12" fill="#FFF1C5"/><circle cx="72" cy="30" r="10" fill="#6E6590"/><circle cx="28" cy="60" r="2" fill="#fff"/><circle cx="40" cy="28" r="1.6" fill="#fff"/>`
    : `<circle cx="30" cy="32" r="12" fill="#FFF1A8"/><ellipse cx="62" cy="62" rx="20" ry="9" fill="#fff"/>`}<path d="M50 4 V96 M4 50 H96" stroke="#fff" stroke-width="5"/><rect x="0" y="92" width="100" height="10" rx="5" fill="#E6CBB0"/></svg>`;
}
function roomCard(line, mood = "happy", eq, withPet = true) {
  const pet = withPet && S.activePet && S.pets[S.activePet] ? petById(S.activePet) : null;
  if (S.ill) mood = "sick"; else if (mood === "happy" || mood === "normal") mood = MOOD_FACE[palMood()];
  return `<div class="petroom">${roomWindow()}<div class="pbubble">${line}</div>
    <div class="rug"></div><div class="pet ${frameCls(eq)}">${figure("chiikawa", mood, eq)}</div>
    ${pet ? `<button class="rpet" data-pet="${pet.id}" aria-label="${esc(pet.nick)} the ${esc(pet.name)}">${petSvg(pet.id)}</button>` : ""}</div>`;
}
let greetCache = { k: "", t: "" };
function greeting() {
  const key = [S.ill ? 1 : 0, palMood(), streakNote, Math.floor(Date.now() / 600e3)].join("|");
  if (greetCache.k !== key) greetCache = { k: key, t: greeting0() };
  return greetCache.t;
}
function greeting0() {
  if (streakNote) return esc(streakNote);
  if (!S.ill && MOOD_LINE[palMood()] && palMood() !== "sleepy") return MOOD_LINE[palMood()];
  if (S.ill) return `Achoo... I feel sick... 🤒 (${esc(illById(S.ill.id).sym.split(",")[0])})`;
  const h = new Date().getHours(), ni = nextRoomIndex();
  return pick([h < 12 ? `Good morning, ${esc(S.player_name)}! ☀️` : h < 18 ? `Hi ${esc(S.player_name)}! Ready for one small stage? 🌱` : `Evening study buddy~ 🌙`,
    ni === -1 ? "We escaped EVERY stage! 🥹🎉" : "Ya...! Let's explore biology together! ✨", "Tap 👗 Dress up to change my look! 🎀"]);
}

function renderMap() {
  stopRush(); MUSIC.setMode("map"); stopTimer(); if (R) { clearTimeout(R.introT); clearTimeout(R.incT); } R = null; recomputeMastery(); save(); renderTools();
  palTick();
  if (!NAV_TABS.some(t => t[0] === homeTab) && !PAL_TABS.includes(homeTab) && !(homeTab === "stats" && isTeacher())) homeTab = "home";
  if (homeTab === "lab") return renderSims();
  const ni = nextRoomIndex(), nr = ni === -1 ? null : ROOMS[ni];
  if (mapPart === null) mapPart = nr ? TOPICS[nr.t].p : 0;
  $app.innerHTML = { home: homeHtml, stages: stagesHtml, play: playHtml, pals: palsHtml, dress: dressHtml, pets: petsHtml, rewards: rewardsHtml, stats: statsHtml }[homeTab]();
  renderNav(homeTab);
  ({ home: wireHome, stages: wireStages, play: wirePlay, pals: wirePals, dress: wireDress, pets: wirePets, rewards: wireRewards, stats: wireStats })[homeTab]();
  $app.querySelectorAll(".subnav [data-go]").forEach(b => b.onclick = () => { SFX.tap(); goTab(b.dataset.go); });
  wireFolds($app);
}

/* ----- 🏠 Home ----- */
function homeHtml() {
  const ni = nextRoomIndex(), nr = ni === -1 ? null : ROOMS[ni], T = nr && TOPICS[nr.t], m = dailyMission();
  // 1) the daily capsule ad, 2) the ONE next step, 3) the pal room, 4) everything else folded into bars
  return `${storyBannerHtml()}${capsuleAdHtml()}
    ${S.ill ? `<section class="card sickcard"><div class="row" style="gap:12px;flex-wrap:nowrap"><span class="flame" aria-hidden="true">🤒</span><div style="flex:1;min-width:0"><b>${esc(palName())} is sick!</b><div class="small">${esc(illById(S.ill.id).sym)}</div><div class="small muted">Chestnut rewards are halved until Mochi gets better.</div></div></div>
      <button class="btn big" id="goClinic">🩺 Open the medicine cabinet</button></section>` : ""}
    <section class="card nextcard">
      <span class="kicker">✨ Next step</span>
      ${nr ? (isStudy() ? `<h2>${T.icon} ${esc(stageName(nr))}</h2><p class="small muted" style="margin:0">📖 Topic ${T.no}: ${esc(T.name)}</p>` : `<h2>${T.icon} ${esc(nr.name)}</h2><p class="small muted" style="margin:0">Topic ${T.no} · ${nr.boss ? "⚔️ Boss stage" : `Stage ${nr.s}`} · ${esc(nr.focus)}</p>`)
           : `<h2>🎉 Every stage escaped!</h2><p class="small muted" style="margin:0">Replay any stage in 🗺️ Stages to win 3 stars.</p>`}
      ${modeSwitch()}
      <div class="row">${nr ? `<button class="btn big" data-room="${nr.id}">${isStudy() ? "📖 Study it" : "▶ Enter"}</button>` : ""}<button class="btn plain" data-go="stages">🗺️ All stages</button></div>
    </section>
    ${riskCardHtml()}
    <div class="homegrid">
    <section class="card roomwrap">${roomCard(greeting(), S.completed_rooms.length ? "happy" : "normal")}
      <div class="row" style="justify-content:center"><button class="btn plain" data-go="dress">👗 Dress up</button><button class="btn yellow" data-go="pals">🍱 Feed & care</button></div></section>
    <div class="homeside folds">
      ${foldHtml("h-streak", { icon: "🔥", title: "My streak", peek: `${S.current_streak} 🔥 · ${"❄️".repeat(S.streak_shields) || "0 ❄️"}` }, streakCardHtml())}
      ${foldHtml("h-mission", { icon: "🎯", title: "Daily mission", peek: m.done ? "✓ Done" : m.n ? `${m.prog || 0}/${m.n}` : "" }, missionCardHtml())}
      ${foldHtml("h-board", { icon: "🏆", title: "Class leaderboard", peek: `${dedication()} pts` }, homeBoardHtml())}
      ${foldHtml("h-feat", { icon: "⭐", title: "Featured pal" }, featuredHtml())}
      ${foldHtml("h-tips", { icon: "💡", title: "Tips & fun facts" }, healthTipHtml() + chatCardHtml())}
    </div></div>`;
}
function wireHome() {
  const sg = document.getElementById("storyGo"); if (sg) sg.onclick = () => { SFX.tap(); openStory(); };
  wireCommon(); wireChatCard(); wireModeSwitch($app); wireDailyCards(); wireFeatured(); wireCapsuleAd(); wireHomeBoard();
  const gc = document.getElementById("goClinic"); if (gc) gc.onclick = () => { SFX.tap(); openClinic(); };

}
let lastPat = 0;
function wireCommon() {
  $app.querySelectorAll(".petroom .pet").forEach(b => b.onclick = () => { if (Date.now() - lastPat < 20000) return; lastPat = Date.now(); const p = palState(activePalId()); p.happy = Math.min(100, p.happy + 2); save(); SFX.item(); b.classList.remove("hop"); void b.offsetWidth; b.classList.add("hop"); toast(`❤️ ${palName()} loves pats! Happy +2`); });
  $app.querySelectorAll(".rpet[data-pet]").forEach(b => b.onclick = () => { SFX.item(); const p = petById(b.dataset.pet); const bub = $app.querySelector(".pbubble"); if (bub) { bub.innerHTML = `<b>${esc(p.nick)}:</b> ${esc(pick(p.story.split(". ")))}${/[.!?]$/.test(p.story) ? "" : "."}`; bub.style.animation = "none"; void bub.offsetWidth; bub.style.animation = ""; } b.classList.remove("hop"); void b.offsetWidth; b.classList.add("hop"); });
  $app.querySelectorAll("[data-room]").forEach(b => b.onclick = () => { SFX.init(); SFX.tap(); streakNote = ""; enterRoom(b.dataset.room); });
  $app.querySelectorAll("[data-go]").forEach(b => b.onclick = () => { SFX.tap(); goTab(b.dataset.go); });
}

/* ----- 🗺️ Stages ----- */
function stagesHtml() {
  const ni = nextRoomIndex(), nr = ni === -1 ? null : ROOMS[ni], totalStars = ROOMS.reduce((a, r) => a + roomStars(r), 0);
  return `<section class="card">
      <div class="row" style="justify-content:space-between"><h2>${isStudy() ? "📖 Sections" : "🗺️ Stages"}</h2><span class="pill">⭐ ${totalStars} / ${ROOMS.length * 3} · 🚪 ${S.completed_rooms.length} / ${ROOMS.length}</span></div>
      ${modeSwitch()}
      <div class="tabs" role="tablist" aria-label="Curriculum parts">${PARTS.map((P, pi) => { const n = TOPICS.filter(T => T.p === pi).length, d = TOPICS.filter((T, ti) => T.p === pi && stagesDone(ti) === topicRooms(ti).length).length;
        return `<button class="tab" role="tab" aria-selected="${pi === mapPart}" data-part="${pi}">Part ${esc(P)} <span class="small">${d}/${n}</span></button>`; }).join("")}</div>
      ${isStudy() ? "" : `<p class="realmline"><b>${REALMS[mapPart].icon} Realm: ${esc(REALMS[mapPart].name)}</b> · ${esc(REALMS[mapPart].line)}</p>`}
      <div class="tgrid">${TOPICS.map((T, ti) => { if (T.p !== mapPart) return "";
        const rs = topicRooms(ti), d = stagesDone(ti), cur = nr && nr.t === ti, nT = rs.length;
        return `<details class="tcard ${d === nT ? "done" : ""} ${cur ? "next" : ""}" ${cur ? "open" : ""}>
          <summary class="thead"><span class="ticon" aria-hidden="true">${T.icon}</span><span style="min-width:0;flex:1"><span class="tnum">Topic ${T.no}${d === nT ? " · 🏅 cleared" : ` · ${d}/${nT} ${isStudy() ? "sections" : "stages"}`}</span><br><span class="tname">${esc(T.name)}</span>${isStudy() ? "" : `<br><span class="tchap">📜 Chapter ${T.no}: ${esc(CHAPTERS[T.id])}</span>`}</span></summary>
          <div class="tprog" aria-label="${d} of ${nT} stages escaped"><i style="width:${Math.round(100 * d / nT)}%"></i></div>
          <div class="stages">${rs.map(r => stageBtn(r, roomIndex(r.id), ni)).join("")}</div>
        </details>`; }).join("")}</div>
      <p class="small muted">${isStudy() ? "Tap a topic to open its sections. Each section is a calm series of 15 questions." : "Tap a topic to open it. Inside a topic, clear the stages in order; the last one is a ⚔️ boss stage."}</p>
    </section>`;
}
function wireStages() {
  wireCommon(); wireModeSwitch($app);
  $app.querySelectorAll("[data-part]").forEach(b => b.onclick = () => { SFX.tap(); mapPart = Number(b.dataset.part); renderMap(); });
}

/* ----- 🎮 Practice ----- */
function playHtml() {
  const nw = Object.keys(S.dict.missed).length;
  return `<section class="card">
      <h2>🎮 Practice</h2>
      <div class="modes">
        <button class="mode rush" id="mRush"><h3>⚡ Cell Rush</h3><span class="muted small">60 seconds of quick mixed questions. Earn 🌰 chestnuts.</span><span class="small">Best: <b>${S.rush.best}</b> pts ${S.rush.lastDay !== today() ? "· <b>×2 today!</b>" : ""}</span></button>
        <button class="mode note" id="mNote"><h3>📕 Mistake Notebook</h3><span class="muted small">Fix the questions you got wrong. Right twice = cleared.</span><span class="small"><b>${mistakeKeys().length}</b> to fix · ${S.mistakes_cleared || 0} cleared</span></button>
        <button class="mode dict-mode" id="mDict"><h3>🎧 Word Dictation</h3><span class="muted small">Hear key terms in a British accent and spell them.</span><span class="small">${nw ? `<b>${nw}</b> missed words to practise` : `Best round: <b>${S.dict.best}</b>/${DICT_N}`}</span></button>
        <button class="mode" id="mLb"><h3>🏆 Class leaderboard</h3><span class="muted small">${signedIn() ? "Effort, streak and collection in your class." : "For signed-in classmates. Guests play privately."}</span><span class="small">Your effort points: <b>${dedication()}</b></span></button>
      </div>
    </section>
    ${foldHtml("pr-mastery", { icon: "📈", title: "Biology mastery", peek: `${Math.round(TOPICS.reduce((a, T) => a + S.bio_mastery[T.id], 0) / TOPICS.length)}%` }, `
      <p class="small muted">Mastery goes up when you answer a question right on the first try without a hint. Replay cleared stages to master them all!</p>
      <div class="mastery">${TOPICS.map(T => { const v = S.bio_mastery[T.id]; return `<div><div class="row" style="justify-content:space-between"><b class="small">${TOPIC_LABELS[T.id]}</b><b class="small">${v}%</b></div><div class="tprog"><i style="width:${v}%"></i></div></div>`; }).join("")}</div>
    `)}`;
}
function wirePlay() {
  document.getElementById("mRush").onclick = () => { SFX.init(); SFX.tap(); rushIntro(); };
  document.getElementById("mNote").onclick = () => { SFX.init(); SFX.tap(); renderNotebook(); };
  document.getElementById("mLb").onclick = () => { SFX.init(); SFX.tap(); openLeaderboard(); };
  document.getElementById("mDict").onclick = () => { SFX.init(); SFX.tap(); DT = null; renderDictation(); };
}

/* ----- 🏆 Rewards ----- */
function rewardsHtml() {
  return `<div class="homegrid">
    <section class="card cream cabinet" id="cabinet">${cabinetHtml(false)}</section>
    <div class="homeside">
      <section class="card coll-mode"><div class="row" style="justify-content:space-between"><h2>🃏 Biology cards</h2><span class="pill">${collOwned()} / ${CARD_N} · ✨ ${collOwned(true)} / ${CARD_N - collTotal("common")} rare+</span></div>
        <p class="small muted" style="margin:0">${CARD_N} biology cards from Common to Mythic. Keep your 🔥 streak to earn capsules.</p>
        <div class="row">${S.coll.pending ? `<button class="btn pink" id="rwCap">🎁 Open capsule (${S.coll.pending})</button>` : ""}<button class="btn yellow" id="rwAlbum">📚 See collection</button></div></section>
      <section class="card"><h2>🎒 Backpack</h2>
        <div class="bag">${S.chiikawa_badges.concat(S.inventory).map(b => `<span class="tag">${esc(b)}</span>`).join("") || `<span class="muted small">Empty. Escape a stage or open the daily chest!</span>`}</div></section>
    </div></div>`;
}
function wireRewards() {
  const oc = document.getElementById("openCab"); if (oc) oc.onclick = () => { SFX.tap(); openCabinet(); };
  document.getElementById("rwAlbum").onclick = () => { SFX.tap(); openAlbum(); };
  const rc = document.getElementById("rwCap"); if (rc) rc.onclick = () => { SFX.tap(); openCapsule(); };
}

/* ----- 👗 Dress up: try items on, buy them with chestnuts, and wear them everywhere ----- */
const TAGS = { trend: "🔥 Trend", hk: "🇭🇰 HK" };
function dressHtml() {
  const slot = dressSlot, eq = S.equip, tryEq = dressTry ? Object.assign({}, eq, { [dressTry.slot]: dressTry.id }) : eq;
  const ti = dressTry && itemById(dressTry.id);
  const items = slot === "power" ? [] : WARDROBE.filter(w => w.slot === slot);
  const line = ti ? `<b>${esc(ti.name)}</b>${ti.desc ? `<br><span class="small">${esc(ti.desc)}</span>` : ""}` : pick(["Do I look cute? 🥹", "Try things on! It's free to try~ ✨", "Ooh, what should I wear today? 🎀"]);
  return `${palsSubnav("dress")}<div class="dressgrid">
    <section class="card roomwrap dresspv">${roomCard(line, "happy", tryEq)}
      <div class="row" style="justify-content:center"><span class="pill coinpill">🌰 ${S.coins}</span>
        ${ti && !S.owned.includes(ti.id) ? (S.coins >= ti.price ? `<button class="btn primary" data-buy="${ti.id}">Buy for 🌰 ${ti.price}</button>` : `<span class="needmore">Need 🌰 ${ti.price - S.coins} more</span><button class="btn yellow" id="dsEarn">⚡ Earn chestnuts</button>`) + `<button class="btn plain" id="dsBack">Stop trying</button>` : ""}
        <button class="btn plain" id="dsRand">🎲 Random look</button><button class="btn plain" id="dsOff">🧼 Take all off</button></div>
      <details class="earnguide"><summary>🌰 How do I get chestnuts?</summary><ul class="small">
        <li><b>+3</b> for every question you get right on the <b>first try</b> (+1 if you'd already mastered it)</li>
        <li><b>+30</b> for clearing a new stage (<b>+50</b> boss) · <b>+25</b> for your first revision stage each day</li>
        <li>⚡ Cell Rush (×2 the first round each day) · 🎧 Dictation · 📕 Mistake Notebook · 📅 Daily mission <b>+40</b> · 🏆 every trophy <b>+30</b></li></ul></details></section>
    <section class="card dressshop">
      <div class="slottabs" role="tablist">${EQ_KEYS.map(k => `<button role="tab" aria-selected="${k === slot}" data-slot="${k}"><span aria-hidden="true">${SLOT_ICONS[k]}</span>${SLOT_NAMES[k]}</button>`).join("")}<button role="tab" aria-selected="${slot === "power"}" data-slot="power"><span aria-hidden="true">🎒</span>Power-ups</button></div>
      ${slot === "power" ? `<p class="small muted">Power-ups help in ⏱️ Escape mode. Use them from the 🎒 bar in any lock. Hold up to ${MAX_POWER} of each.</p>
        <div class="shopgrid">${POWERUPS.map(u => `<div class="sitem"><div style="font-size:2.2rem">${u.icon}</div><b>${esc(u.name)}</b><span class="small muted">${esc(u.desc)}</span>
          <span class="small"><b>You have ${S.power[u.id] || 0}</b></span><button class="btn yellow" data-pbuy="${u.id}" ${S.coins < u.price || (S.power[u.id] || 0) >= MAX_POWER ? "disabled" : ""}>🌰 ${u.price}</button></div>`).join("")}</div>`
      : `<div class="shopgrid">
        <button class="sitem ${!eq[slot] ? "on" : ""}" data-none="${slot}"><div class="pv none">∅</div><b class="small">None</b></button>
        ${items.map(w => { const own = S.owned.includes(w.id), on = eq[slot] === w.id, trying = dressTry && dressTry.id === w.id;
          const pvEq = Object.assign({}, eq, { [slot]: w.id });
          return `<button class="sitem ${on ? "on" : ""} ${trying ? "trying" : ""}" data-item="${w.id}" aria-label="${esc(w.name)}${own ? on ? ", wearing" : ", owned" : `, ${w.price} chestnuts`}">
            ${w.tag ? `<span class="itag ${w.tag}">${TAGS[w.tag]}</span>` : ""}
            <div class="pv ${w.cls || ""}">${avatar("chiikawa", "happy", pvEq)}</div>
            <b class="small">${esc(w.name)}</b>
            <span class="small ${own ? "" : "price"}">${on ? "✓ Wearing" : own ? "Owned · tap to wear" : `🌰 ${w.price}`}</span></button>`; }).join("")}</div>
        <p class="small muted">Tap an item to try it on. Tap again to buy it (or to wear it if you own it).</p>`}
    </section></div>`;
}
function wireDress() {
  const redraw = () => { const y = window.scrollY; renderMap(); window.scrollTo({ top: y }); };
  const buy = id => {
    const w = itemById(id); if (!w || S.coins < w.price || S.owned.includes(id)) return;
    S.coins -= w.price; S.owned.push(id); S.equip[w.slot] = id; dressTry = null; save(true); SFX.fanfare(); confetti(60); yaha("So cute!"); refreshPlayer(); redraw(); checkTrophies();
  };
  $app.querySelectorAll("[data-slot]").forEach(b => b.onclick = () => { SFX.tap(); dressSlot = b.dataset.slot; dressTry = null; redraw(); });
  $app.querySelectorAll("[data-none]").forEach(b => b.onclick = () => { SFX.tap(); S.equip[b.dataset.none] = null; dressTry = null; save(); refreshPlayer(); redraw(); });
  $app.querySelectorAll("[data-item]").forEach(b => b.onclick = () => {
    const w = itemById(b.dataset.item);
    if (S.owned.includes(w.id)) { SFX.item(); S.equip[w.slot] = S.equip[w.slot] === w.id ? null : w.id; dressTry = null; save(true); refreshPlayer(); redraw(); return; }
    if (dressTry && dressTry.id === w.id) { if (S.coins >= w.price) buy(w.id); else { SFX.wrong(); toast(`You need 🌰 ${w.price - S.coins} more. Every first-try right answer gives +3 🌰!`); } return; }
    SFX.tap(); dressTry = { slot: w.slot, id: w.id }; redraw();
  });
  $app.querySelectorAll("[data-buy]").forEach(b => b.onclick = () => buy(b.dataset.buy));
  const earn = document.getElementById("dsEarn"); if (earn) earn.onclick = () => { SFX.tap(); rushIntro(); };
  const back = document.getElementById("dsBack"); if (back) back.onclick = () => { SFX.tap(); dressTry = null; redraw(); };
  document.getElementById("dsOff").onclick = () => { SFX.tap(); EQ_KEYS.forEach(k => { if (k !== "frame") S.equip[k] = null; }); dressTry = null; save(); refreshPlayer(); redraw(); };
  document.getElementById("dsRand").onclick = () => {
    SFX.item(); dressTry = null;
    EQ_KEYS.forEach(k => { if (k === "frame") return; const own = WARDROBE.filter(w => w.slot === k && S.owned.includes(w.id)); S.equip[k] = own.length && Math.random() < .75 ? pick(own).id : null; });
    if (!S.owned.length) toast("Buy a few items first, then shuffle your looks! 🎲");
    save(); refreshPlayer(); redraw();
  };
  $app.querySelectorAll("[data-pbuy]").forEach(b => b.onclick = () => {
    const u = POWERUPS.find(x => x.id === b.dataset.pbuy); if (S.coins < u.price) return;
    S.coins -= u.price; S.power[u.id] = (S.power[u.id] || 0) + 1; save(true); SFX.item(); redraw();
  });
}
function openShop(tab) { dressSlot = tab === "power" ? "power" : dressSlot === "power" ? "hat" : dressSlot; closeModal(); goTab("dress"); }

/* ----- 🐾 Pets ----- */
let petFilter = "all";
function petsHtml() {
  const own = PETS.filter(p => S.pets[p.id]).length, act = S.activePet && petById(S.activePet);
  const F = { all: ["All", () => true], hk: ["🇭🇰 Hong Kong", p => p.hk], esc: ["⏱️ Escape only", p => p.esc], mine: ["⭐ Mine", p => S.pets[p.id]] };
  const order = { common: 0, rare: 1, epic: 2, legend: 3 };
  const list = PETS.filter(F[petFilter][1]).slice().sort((a, b) => order[a.rar] - order[b.rar]);
  return `${palsSubnav("pets")}<section class="card">
      <div class="row" style="justify-content:space-between"><h2>🦜 ${esc(palName())}'s pets</h2><span class="pill">${own} / ${PETS.length} adopted · 🇭🇰 ${PETS.filter(p => p.hk && S.pets[p.id]).length} / 5</span></div>
      ${say("chiikawa", act ? `${esc(act.nick)} the ${esc(act.name)} is my companion! Tap a pet to read its real biology story. 🥹` : "Rare animals from all over the world want to live with me! Clear stages to adopt them. Half of them only come in ⏱️ Escape mode! 🐾", "happy")}
      <div class="slottabs" role="tablist">${Object.entries(F).map(([k, [l]]) => `<button role="tab" aria-selected="${k === petFilter}" data-pf="${k}">${l}</button>`).join("")}</div>
      <div class="petgrid">${list.map(p => { const got = !!S.pets[p.id];
        return `<button class="petcard ${got ? "own" : "locked"} ${p.rar} ${S.activePet === p.id ? "active" : ""}" data-openpet="${p.id}">
          ${p.hk ? `<span class="itag hk">🇭🇰 HK</span>` : p.esc ? `<span class="itag esc">⏱️ Escape</span>` : ""}
          <div class="petpic">${petSvg(p.id)}</div>
          <b class="small">${got ? esc(p.nick) : "???"}</b><span class="small muted">${esc(p.name)}</span>
          <span class="rchip" style="background:${PET_RAR[p.rar][1]}">${PET_RAR[p.rar][0]}</span>
          ${got ? "" : `<div class="tprog" style="width:100%"><i style="width:${Math.min(100, Math.round(100 * petVal(p.k) / p.n))}%"></i></div>`}</button>`; }).join("")}</div>
    </section>`;
}
function wirePets() {
  $app.querySelectorAll("[data-pf]").forEach(b => b.onclick = () => { SFX.tap(); petFilter = b.dataset.pf; renderMap(); });
  $app.querySelectorAll("[data-openpet]").forEach(b => b.onclick = () => { SFX.tap(); openPet(b.dataset.openpet); });
}
