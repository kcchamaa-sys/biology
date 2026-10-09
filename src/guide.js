/* ============================================================
   5d-2. ❓ Help: a picture-story guide and a spotlight tour, so nobody gets lost.
   - Spotlight tour: the first time a student sees the new Home, the screen dims and one part at a time lights up
     with a numbered bubble (pal → today's plan → the glowing button → care → bottom bar → ❓).
   - Picture guide: 6 cards drawn with the game's own art (dots, Back/Next, swipe). The ❓ button in the top bar
     glows until the guide has been opened once, and the last card can replay the tour.
   ============================================================ */
const TOUR_V = 2;
const GUIDE = [
  ["🏠", "Meet your pal", "Your pal lives on Home. Its body works like a real one: it gets hungry, thirsty and sleepy.", () => `<div class="gart">${figure("chiikawa", "sparkle", S && S.equip)}</div>`],
  ["☀️", "Follow the glowing step", "Today's plan shows 4 steps. Do the one that glows, then the next lights up.", () => `<div class="gart gquest">${["📖", "🍱", "🎯", "🎰"].map((ic, i) => `<span class="${i === 0 ? "done" : i === 1 ? "next" : ""}">${i === 0 ? "✓" : ic}</span>`).join("<i></i>")}</div>`],
  ["👆", "Touch to look inside", "Tap the head, mouth, heart, tummy or hands to see what is happening in the body.", () => `<div class="gart gtouch"><div class="gtbox">${figure("chiikawa", "happy", S && S.equip)}<span class="gpoint" aria-hidden="true">👆</span></div><div class="gzones">${["brain", "mouth", "heart", "belly", "hands"].map(z => `<span>${BP_ZONES[z][0]}</span>`).join("")}</div></div>`],
  ["🗺️", "Study the stages", "🗺️ Stages has every topic. ⏱️ Escape = with a timer. 📖 Study = calm, no timer.", () => `<div class="gart gicons"><span>🗺️</span><span>⏱️</span><span>📖</span></div>`],
  ["🎒", "Collect and dress up", "🎒 Collect: new pals, outfits, pets and biology cards.", () => `<div class="gart gstrip">${["mochi", "matcha", "sakura", "pudding"].map(id => `<span>${palFig(id, "happy")}</span>`).join("")}</div>`],
  ["🔥", "Keep your streak", "Finish one activity a day. Missed a day? A ❄️ Streak Freeze saves your streak.", () => `<div class="gart gicons"><span class="gflame">🔥</span><span>❄️</span><span>🎁</span></div>`]
];
const guideSeen = () => !!(S && S.guideSeen);
function openGuide(i = 0) {
  if (S && !S.guideSeen) { S.guideSeen = 1; save(); renderTools(); }
  const n = GUIDE.length, [ic, title, line, art] = GUIDE[i];
  const box = openModal(`<div class="guide" id="guideCard"><span class="kicker">❓ How to play · ${i + 1} / ${n}</span>
      ${art()}<h2><span aria-hidden="true">${ic}</span> ${esc(title)}</h2><p class="gline">${esc(line)}</p>
      <div class="gdots" aria-hidden="true">${GUIDE.map((_, k) => `<i class="${k === i ? "on" : ""}"></i>`).join("")}</div>
      <div class="row gnav">${i ? `<button class="btn plain" id="gBack">‹ Back</button>` : ""}${i < n - 1 ? `<button class="btn big" id="gNext">Next ›</button>` : `<button class="btn big" id="gTour">🔦 Show me around</button><button class="btn plain" id="gDone">Let's go</button>`}</div></div>`, { wide: false });
  const g = id => box.querySelector("#" + id);
  if (g("gBack")) g("gBack").onclick = () => { SFX.tap(); openGuide(i - 1); };
  if (g("gNext")) g("gNext").onclick = () => { SFX.tap(); openGuide(i + 1); };
  if (g("gDone")) g("gDone").onclick = () => { SFX.tap(); closeModal(); };
  if (g("gTour")) g("gTour").onclick = () => { SFX.tap(); closeModal(); homeTab = "home"; homeSub = "today"; renderMap(); setTimeout(() => startTour(true), 300); };
  let x0 = null; const card = g("guideCard");
  card.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  card.addEventListener("touchend", e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (dx < -50 && i < n - 1) openGuide(i + 1); else if (dx > 50 && i) openGuide(i - 1); });
}

/* ----- Spotlight tour: dim everything, light up one part, say one short thing ----- */
const TOUR = [
  ["#lpRoom", "👆", "This is your pal", "Touch its head, tummy or heart to see inside its body."],
  ["#questBar .qsteps", "☀️", "Today's plan", "4 steps a day. The glowing one is next."],
  ["#qGo", "▶", "Tap the big button", "It always takes you to the next step."],
  ["#careTiles", "💗", "Look after your pal", "Food, drinks, sleep and play change its body."],
  ["#bnav", "🧭", "Everything else", "🗺️ Stages · 🎮 Practice · 🎒 Collect · 🔬 Lab"],
  ["#tHelp", "❓", "Lost?", "Tap ❓ any time for the picture guide."]
];
let tourAt = -1;
function maybeTour() {
  if (!S || S.tourV === TOUR_V || homeTab !== "home" || homeSub !== "today") return;
  setTimeout(() => { if ($modal.innerHTML || homeTab !== "home" || !document.getElementById("questBar")) { setTimeout(maybeTour, 2500); return; } startTour(false); }, 900);
}
function startTour(replay) {
  if (!S) return; if (!replay && S.tourV === TOUR_V) return;
  tourAt = 0; tourShow();
}
function tourEnd() {
  tourAt = -1; S.tourV = TOUR_V; save();
  document.querySelectorAll(".tourspot, .tourtip, .tourblock").forEach(e => e.remove());
}
function tourShow() {
  document.querySelectorAll(".tourspot, .tourtip, .tourblock").forEach(e => e.remove());
  const steps = TOUR.filter(([sel]) => document.querySelector(sel));
  if (tourAt < 0 || tourAt >= steps.length) return tourEnd();
  const [sel, ic, title, line] = steps[tourAt], el = document.querySelector(sel);
  el.scrollIntoView({ block: "center", behavior: reduced() ? "auto" : "smooth" });
  setTimeout(() => {
    if (tourAt < 0) return;
    const r = el.getBoundingClientRect(), pad = 8, fixed = (() => { for (let e = el; e && e !== document.body; e = e.parentElement) { const ps = getComputedStyle(e).position; if (ps === "fixed" || ps === "sticky") return true; } return false; })();
    const top = r.top + (fixed ? 0 : scrollY) - pad, left = Math.max(4, r.left - pad), w = Math.min(innerWidth - 8 - left, r.width + pad * 2), h = r.height + pad * 2;
    const block = document.createElement("div"); block.className = "tourblock"; block.onclick = () => {};
    const spot = document.createElement("div"); spot.className = "tourspot" + (fixed ? " fixed" : "");
    Object.assign(spot.style, { top: top + "px", left: left + "px", width: w + "px", height: h + "px" });
    const tip = document.createElement("div"); tip.className = "tourtip" + (fixed ? " fixed" : ""); tip.setAttribute("role", "dialog"); tip.setAttribute("aria-live", "polite");
    tip.innerHTML = `<div class="ttnum">${tourAt + 1}<small>/${steps.length}</small></div><div class="ttbody"><b><span aria-hidden="true">${ic}</span> ${esc(title)}</b><span>${esc(line)}</span></div>
      <div class="ttbtns"><button class="btn plain sm" id="ttSkip">Skip</button><button class="btn sm" id="ttNext">${tourAt + 1 < steps.length ? "Next ›" : "Got it ✓"}</button></div>`;
    document.body.append(block, spot, tip);
    // the bubble sits below the lit part, or above it when there is no room
    const tipH = tip.offsetHeight, below = r.bottom + pad + 12 + tipH < innerHeight;
    const tTop = below ? r.bottom + pad + 12 : Math.max(8, r.top - pad - 12 - tipH);
    tip.style.top = (tTop + (fixed ? 0 : scrollY)) + "px";
    tip.classList.add(below ? "below" : "above");
    tip.querySelector("#ttNext").onclick = () => { SFX.tap(); tourAt++; tourShow(); };
    tip.querySelector("#ttSkip").onclick = () => { SFX.tap(); tourEnd(); };
    tip.querySelector("#ttNext").focus();
  }, reduced() ? 30 : 380);
}
window.addEventListener("resize", () => { if (tourAt >= 0) tourShow(); });
