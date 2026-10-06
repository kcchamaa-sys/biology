
/* ============================================================
   5l. 🎰 Daily Lucky Capsule (replaces the daily snack chest).
   One free draw per study day, unlocked by answering LUCKY_NEED questions in finished activities that day (a good session, not just one tap).
   Odds are tough: Epic or better is guaranteed within LUCKY_PITY draws.
   Luck rises with the streak at 20 / 40 / 60 / 80 / 100 days (same idea as the S1 Science game).
   Epic or better is guaranteed within 10 draws. The capsule can "upgrade" colour before it bursts open.
   Prizes: chestnuts, food for your pal (pantry), Streak Freezes, outfits, biology card capsules,
   and 3 capsule-only Study Pals (Mito, Chloe: legendary; Helix: mythic).
   ============================================================ */
const LUCK_TIERS = ["common", "rare", "epic", "legend", "myth"];
const LUCK_NAMES = { common: "Common", rare: "Rare", epic: "Epic", legend: "Legendary", myth: "Mythic" };
// odds (%) by streak level: 0–19, 20–39, 40–59, 60–79, 80–99, 100+ days
const LUCK_TABLE = [[68, 24, 6, 1.7, .3], [62, 26, 8.5, 3, .5], [56, 27, 11, 5, 1], [50, 28, 14, 7, 1], [44, 28, 17, 9, 2], [38, 28, 20, 11, 3]];
const LUCK_PITY = 15;
const LUCKY_NEED = 40; // questions answered in finished activities today before the draw unlocks (teachers: change this number)
const luckLevel = () => Math.min(5, Math.floor((S.current_streak || 0) / 20));
const luckOdds = () => LUCK_TABLE[luckLevel()];
const luckyDrawn = () => S.lucky.day === today();
const luckyQ = () => { const p = S.lucky && S.lucky.prog; return p && p.day === today() ? p.q : 0; };
const luckyReady = () => luckyQ() >= LUCKY_NEED && !luckyDrawn();
// Called when an activity finishes: adds its answered questions to today's tally and announces the unlock
function luckyCount(n) {
  if (!S || !S.lucky || !(n > 0)) return;
  const t = today(), p = S.lucky.prog && S.lucky.prog.day === t ? S.lucky.prog : (S.lucky.prog = { day: t, q: 0 }), was = p.q;
  p.q += Math.round(n);
  if (was < LUCKY_NEED && p.q >= LUCKY_NEED && !luckyDrawn()) setTimeout(() => toast("🎰 Lucky Capsule unlocked! Draw it on 🏠 Home."), 1800);
}

function rollLuckyTier() {
  if (S.lucky.pity + 1 >= LUCK_PITY) { const o = luckOdds().slice(2), t = o.reduce((a, b) => a + b, 0); let x = Math.random() * t; for (let i = 0; i < 3; i++) if ((x -= o[i]) < 0) return LUCK_TIERS[i + 2]; return "epic"; }
  let x = Math.random() * 100; const o = luckOdds();
  for (let i = 0; i < 5; i++) if ((x -= o[i]) < 0) return LUCK_TIERS[i];
  return "common";
}
const capPals = r => PALS.filter(P => P.cap && P.rar === r && !S.pals[P.id]);
const unownedOutfits = max => WARDROBE.filter(w => !S.owned.includes(w.id) && w.slot !== "frame" && w.price <= max);
// Build the prize for a tier (falls back to chestnuts or card capsules when something is already owned)
function makePrize(tier) {
  const r = Math.random(), coin = n => ({ kind: "coins", n, title: `${n} chestnuts`, sub: "Spend them on food, outfits and pals." });
  const food = (pool, n) => { const f = pick(pool); return { kind: "food", id: f.id, n, title: `${f.name}${n > 1 ? ` ×${n}` : ""}`, sub: `Saved in your pantry: feed ${palName()} for free!` }; };
  const caps = n => ({ kind: "caps", n, title: `${n} card capsule${n > 1 ? "s" : ""}`, sub: "Open them for biology trading cards." });
  const outfit = max => { const o = unownedOutfits(max); if (!o.length) return null; const w = pick(o); return { kind: "outfit", id: w.id, title: w.name, sub: "A new outfit! Wear it in 👗 Dress up." }; };
  const pal = r_ => { const ps = capPals(r_); if (!ps.length) return null; const P = pick(ps); return { kind: "pal", id: P.id, title: `${P.name} the Study Pal`, sub: P.desc }; };
  const everyday = FOODS.filter(f => f.r === "g"), fancy = FOODS.filter(f => f.r !== "g");
  if (tier === "common") return r < .55 ? coin(15 + Math.floor(Math.random() * 16)) : food(everyday, 1);
  if (tier === "rare") return r < .3 ? coin(40 + Math.floor(Math.random() * 21)) : r < .6 ? food(fancy, 2) : r < .8 && S.streak_shields < FREEZE_MAX ? { kind: "freeze", n: 1, title: "Streak Freeze", sub: "Protects your streak on a missed day." } : caps(1);
  if (tier === "epic") return (r < .45 && outfit(140)) || (r < .75 ? caps(2) : coin(120));
  if (tier === "legend") return (r < .3 && pal("legend")) || (r < .65 && outfit(9999)) || (r < .85 ? caps(3) : coin(300));
  return pal("myth") || pal("legend") || Object.assign(coin(800), { bonusCaps: 5, title: "800 chestnuts + 5 card capsules" });
}
function applyPrize(p) {
  if (p.kind === "coins") gainCoins(p.n);
  if (p.kind === "food") S.pantry[p.id] = (S.pantry[p.id] || 0) + p.n;
  if (p.kind === "freeze") S.streak_shields = Math.min(FREEZE_MAX, S.streak_shields + 1);
  if (p.kind === "caps") S.coll.pending += p.n;
  if (p.bonusCaps) S.coll.pending += p.bonusCaps;
  if (p.kind === "outfit") S.owned.push(p.id);
  if (p.kind === "pal") S.pals[p.id] = newPal();
  save(true);
}
function prizeArt(p) {
  if (p.kind === "coins") return `<div class="pzbig">🌰</div>`;
  if (p.kind === "food") return `<div class="pzbig">${FOODS.find(f => f.id === p.id).e}</div>`;
  if (p.kind === "freeze") return `<div class="pzbig">❄️</div>`;
  if (p.kind === "caps") return `<div class="pzcap">${capsuleSvg("rare")}</div>`;
  if (p.kind === "outfit") return `<div class="pzfig">${figure("chiikawa", "happy", Object.assign({}, S.equip, { [itemById(p.id).slot]: p.id }))}</div>`;
  if (p.kind === "pal") return `<div class="pzfig">${palFig(p.id, "sparkle")}</div>`;
  return "";
}

/* ----- The draw: crank → mix → drop → colour upgrades → burst → prize card ----- */
function openLucky() {
  if (!luckyReady()) { if (luckyDrawn()) toast("🎰 You've drawn today's capsule. Come back tomorrow!"); else toast(`🔒 Answer ${LUCKY_NEED} questions today to unlock the Lucky Capsule (${luckyQ()}/${LUCKY_NEED}).`); return; }
  const o = luckOdds();
  const box = openModal(`<span class="kicker">🎰 Daily Lucky Capsule</span><h2>Turn the crank!</h2>
    <div class="lstage"><div class="lmach" id="lmach">${machineSvg2()}</div><div class="lcap t-common" id="lcap" hidden><i class="lhalf"></i><i class="lband"></i></div><i class="lrays" id="lrays" hidden></i></div>
    <div class="lodds">${LUCK_TIERS.map((t, i) => `<span class="lo t-${t}"><b>${o[i]}%</b>${LUCK_NAMES[t]}</span>`).join("")}</div>
    <p class="small muted" style="text-align:center;margin:0">🍀 Streak luck level ${luckLevel()} (day ${S.current_streak}) · Epic or better within ${LUCK_PITY - S.lucky.pity} draw${LUCK_PITY - S.lucky.pity > 1 ? "s" : ""}</p>
    <div class="row" style="justify-content:center"><button class="btn primary big" id="lGo">🎰 Turn the crank!</button></div>`, { closable: false });
  box.classList.add("luckybox");
  box.querySelector("#lGo").onclick = () => {
    SFX.init(); SFX.click(); box.querySelector("#lGo").disabled = true;
    const tier = rollLuckyTier(), prize = makePrize(tier), k = LUCK_TIERS.indexOf(tier);
    S.lucky.day = today(); S.lucky.draws += 1; S.lucky.pity = k >= 2 ? 0 : S.lucky.pity + 1; S.lucky.last = { tier, title: prize.title, day: today() };
    S.stats.chests += 1; applyPrize(prize); checkTrophies();
    const mach = document.getElementById("lmach"), cap = document.getElementById("lcap"), fast = reduced();
    mach.classList.add("spin");
    let t = fast ? 50 : 1100;
    setTimeout(() => { mach.classList.remove("spin"); cap.hidden = false; cap.classList.add("drop"); SFX.tap(); }, t);
    t += fast ? 50 : 800;
    for (let i = 1; i <= k; i++) setTimeout(() => { cap.className = `lcap t-${LUCK_TIERS[i]} drop up`; void cap.offsetWidth; cap.classList.add("flash"); SFX.tone && SFX.tone(440 + i * 160, .18, { type: "triangle", vol: .12 }); }, t + (fast ? 0 : i * 480));
    t += fast ? 50 : k * 480 + 450;
    setTimeout(() => { cap.classList.add("burst"); document.getElementById("lrays").hidden = false; SFX.fanfare(); }, t);
    setTimeout(() => showPrize(box, tier, prize), t + (fast ? 50 : 650));
  };
}
function showPrize(box, tier, prize) {
  const big = tier === "legend" || tier === "myth";
  if (big) { box.classList.add("shakey"); setTimeout(() => box.classList.remove("shakey"), 600); confetti(260); setTimeout(() => confetti(200), 900); } else confetti(tier === "epic" ? 160 : 70);
  box.innerHTML = `${big ? `<div class="lbanner t-${tier}">${tier === "myth" ? "🌈 MYTHIC!" : "👑 LEGENDARY!"}</div>` : ""}
    <span class="kicker">🎰 Lucky Capsule · ${LUCK_NAMES[tier]}</span>
    <div class="prizecard t-${tier}"><i class="pzrays" aria-hidden="true"></i><span class="pzrar">${LUCK_NAMES[tier]}</span>${prizeArt(prize)}<h2>${esc(prize.title)}</h2><p>${esc(prize.sub)}</p></div>
    <div class="row" style="justify-content:center">${prize.kind === "pal" ? `<button class="btn primary big" id="pzUse">⭐ Make ${esc(palById(prize.id).name)} my active pal</button>` : prize.kind === "outfit" ? `<button class="btn primary big" id="pzUse">👗 Wear it now</button>` : prize.kind === "caps" || prize.bonusCaps ? `<button class="btn primary big" id="pzUse">🎁 Open card capsules</button>` : prize.kind === "food" ? `<button class="btn primary big" id="pzUse">🍱 Feed ${esc(palName())} now</button>` : ""}<button class="btn plain" id="pzOk">Yay! 🥳</button></div>
    <p class="small muted" style="text-align:center;margin:0">Come back tomorrow for another draw. Keep your 🔥 streak to raise your luck!</p>`;
  const done = () => { closeModal(); renderMap(); };
  box.querySelector("#pzOk").onclick = () => { SFX.tap(); done(); };
  const u = box.querySelector("#pzUse");
  if (u) u.onclick = () => { SFX.tap(); closeModal();
    if (prize.kind === "pal") setActivePal(prize.id);
    else if (prize.kind === "outfit") { const w = itemById(prize.id); S.equip[w.slot] = w.id; save(true); refreshPlayer(); dressSlot = w.slot; goTab("dress"); }
    else if (prize.kind === "food") { renderMap(); openFeed(); }
    else { renderMap(); openCapsule(); } };
}

/* ----- 🌟 Home banner: the Lucky Capsule machine (and the card capsules) ----- */
function capsuleAdHtml() {
  const ready = luckyReady(), drawn = luckyDrawn(), o = luckOdds(), lv = luckLevel(), cur = S.current_streak || 0, nextLv = Math.min(5, lv + 1);
  const end = new Date(); end.setHours(24, 0, 0, 0); const hrs = Math.max(0, Math.ceil((end - new Date()) / 3600e3));
  const last = S.lucky.last;
  const btn = ready ? `<button class="btn big adgo" id="luckGo">🎰 Draw today's capsule!</button>`
    : drawn ? `<button class="btn big adgo done" id="luckDone" disabled>✓ Drawn today · next in ${hrs} h</button>`
    : `<button class="btn big adgo locked" id="luckLock">🔒 Answer ${LUCKY_NEED - luckyQ()} more question${LUCKY_NEED - luckyQ() === 1 ? "" : "s"} to unlock</button><div class="tprog thick" role="progressbar" aria-valuemin="0" aria-valuemax="${LUCKY_NEED}" aria-valuenow="${luckyQ()}"><i style="width:${Math.round(100 * luckyQ() / LUCKY_NEED)}%"></i></div><span class="small muted">Today: ${luckyQ()} / ${LUCKY_NEED} questions answered</span>`;
  return `<section class="capad lucky" aria-label="Daily Lucky Capsule">
    <i class="adglow" aria-hidden="true"></i><span class="adspark s1" aria-hidden="true">${spk(5, 5, 5, "y")}</span><span class="adspark s2" aria-hidden="true">${spk(5, 5, 4, "k")}</span><span class="adspark s3" aria-hidden="true">${spk(5, 5, 3, "a")}</span>
    <div class="admain">
      <div class="admach ${ready ? "ready" : ""}">${machineSvg2()}${ready ? `<span class="adbadge">1</span>` : ""}</div>
      <div class="adtext">
        <span class="adnew">🎰 DAILY LUCKY CAPSULE</span>
        <h2>Lucky Capsule</h2>
        <p>Answer ${LUCKY_NEED} questions in a day to earn one draw: chestnuts, food, outfits, Streak Freezes, biology cards... and <b>very rare Study Pals</b>!</p>
        ${btn}
        ${drawn && last ? `<span class="adlast">Today: <b>${esc(last.title)}</b> (${LUCK_NAMES[last.tier]})</span>` : ""}
      </div></div>
    ${foldHtml("h-luck", { icon: "🍀", title: "Streak luck & prizes", peek: `Level ${lv}`, cls: "fold-in" }, `<div class="adstreak"><div class="adsrow"><b>🍀 Streak luck · level ${lv}</b><span class="small">${lv < 5 ? `Day ${nextLv * 20}: Epic ${LUCK_TABLE[nextLv][2]}%, Legendary ${LUCK_TABLE[nextLv][3]}%` : "Maximum luck!"}</span></div>
      <div class="oddsbar" aria-label="Today's odds">${LUCK_TIERS.map((t, i) => `<i class="t-${t}" style="flex:${o[i]}"></i>`).join("")}</div>
      <div class="oddsleg">${LUCK_TIERS.map((t, i) => `<span><i class="t-${t}"></i>${LUCK_NAMES[t]} ${o[i]}%</span>`).join("")}</div>
      ${lv < 5 ? `<div class="tprog thick"><i style="width:${Math.round(100 * (cur - lv * 20) / 20)}%"></i></div><span class="small muted">🔥 ${cur}-day streak · ${nextLv * 20 - cur} more day${nextLv * 20 - cur === 1 ? "" : "s"} to luck level ${nextLv}</span>` : ""}</div>
    <div class="adprizes" aria-label="Possible prizes"><span class="pz">🌰<small>Chestnuts</small></span><span class="pz">🍱<small>Food</small></span><span class="pz">❄️<small>Freeze</small></span><span class="pz">👗<small>Outfits</small></span><span class="pz">🃏<small>Cards</small></span>${PALS.filter(P => P.cap).map(P => `<span class="pz pal ${S.pals[P.id] ? "own" : ""} r-${P.rar}"><span class="${S.pals[P.id] ? "" : "sil"}">${palFig(P.id, "happy")}</span><small>${S.pals[P.id] ? esc(P.name) : P.rar === "myth" ? "Mythic pal" : "Rare pal"}</small></span>`).join("")}</div>`)}
    <div class="adcards"><span>🃏 <b>Biology cards</b> ${collOwned()}/${CARD_N}${S.coll.pending ? ` · <b>${S.coll.pending}</b> capsule${S.coll.pending > 1 ? "s" : ""} to open` : ""}</span>
      <span class="row" style="gap:6px">${S.coll.pending ? `<button class="adalbum" id="adOpen">🎁 Open (${S.coll.pending})</button>` : ""}<button class="adalbum" id="adAlbum">📚 Collection</button></span></div>
  </section>`;
}
function wireCapsuleAd() {
  const g = id => document.getElementById(id);
  if (g("luckGo")) g("luckGo").onclick = () => { SFX.init(); SFX.tap(); openLucky(); };
  if (g("luckLock")) g("luckLock").onclick = () => { SFX.init(); SFX.tap(); toast(`🔒 Keep practising! Answer ${LUCKY_NEED - luckyQ()} more question${LUCKY_NEED - luckyQ() === 1 ? "" : "s"} today (stages, study series, Rush, dictation or notebook) to unlock your draw.`); const ni = nextRoomIndex(); ni === -1 ? goTab("stages") : enterRoom(ROOMS[ni].id); };
  if (g("adOpen")) g("adOpen").onclick = () => { SFX.init(); SFX.tap(); openCapsule(); };
  if (g("adAlbum")) g("adAlbum").onclick = () => { SFX.init(); SFX.tap(); openAlbum(); };
}
