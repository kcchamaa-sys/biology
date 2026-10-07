
/* ============================================================
   5f-4. 🫀 Body Pal (Simulation Lab tab). The UI for the engine in bodypal_engine.js.
   Care for a pal whose body runs on real physiology: feed it, give it drinks, exercise, brush, put it to bed.
   Watch the traces, read the Why cards, then answer questions built from your pal's own day.
   Save = the action log only (S.bodypal); loading replays it, so the day is always the same day.
   Voice (spec C): calm, no "!", no calorie / weight / good-bad food words.
   ============================================================ */
const BPUI = { w: null, tab: "g", play: false, acc: 0, lastDraw: 0, sess: null, hl: null, portion: 1, sip: false, ex: 2, alarm: "07:00" };
const BP_MAX_DAYS = 14;
const BP_TRACES = {
  g: ["🩸", "Glucose", "mg/dL", 40, 200, [[70, "#5B8DEF"], [140, "#E07A5F"]]],
  ph: ["🦷", "Plaque pH", "", 4.5, 7.2, [[5.5, "#C0392B", "pH 5.5: enamel starts to dissolve"]]],
  S: ["😴", "Sleep pressure", "", 0, 1, []],
  st: ["🌙", "Sleep stages", "", 0, 4, []],
  def: ["💧", "Water deficit", "mL", -300, 1400, [[600, "#5B8DEF", "thirst switches on"]]],
  caf: ["☕", "Caffeine", "mg", 0, 120, []]
};
const BP_REF = { g: "g", ph: "ph", caf: "caf", def: "def", st: "st" };

function bpLoadWorld() {
  if (BPUI.w) return BPUI.w;
  const sv = S.bodypal;
  if (sv && Array.isArray(sv.log)) {
    try { BPUI.w = bpReplay({ log: sv.log, opts: sv.opts || {} }, sv.now); } catch (e) { BPUI.w = null; }
  }
  if (!BPUI.w) bpNewWorld();
  return BPUI.w;
}
function bpNewWorld() {
  const n = ((S.bodypal && S.bodypal.n) || 0) + 1;
  BPUI.w = bpCreateWorld({ start: 420, seed: n });
  bpAdvance(BPUI.w, 0);
  S.bodypal = { n, opts: BPUI.w.opts, log: [], now: 420, learner: (S.bodypal && S.bodypal.learner) || bpNewLearner(), sessions: (S.bodypal && S.bodypal.sessions) || 0 };
  save();
}
function bpPersist() {
  const w = BPUI.w; if (!w) return;
  S.bodypal = Object.assign(S.bodypal || {}, { opts: w.opts, log: w.events, now: w.pal.epochMin });
  save();
}
const bpLearner = () => { S.bodypal = S.bodypal || {}; return S.bodypal.learner || (S.bodypal.learner = bpNewLearner()); };
const bpFull = w => w.pal.epochMin - w.t0 >= BP_MAX_DAYS * 1440;

/* ---------- Drawing ---------- */
function bpMood(p) {
  if (p.sleep.asleep || p.sleep.inBed) return "sleepy";
  if (p.activity.intensity) return "brave";
  if (p.flags.groggy || p.flags.sleepy) return "sleepy";
  if (p.flags.thirsty || p.flags.hungry) return "cry";
  return bpFocus(p) >= 0.7 ? "happy" : "normal";
}
function bpStatus(p) {
  const sl = p.sleep;
  if (sl.asleep) return `💤 Asleep · ${{ N1: "light sleep", N2: "light sleep", SWS: "deep sleep", REM: "REM sleep" }[sl.stage]}${sl.alarmEpochMin != null ? ` · ⏰ ${bpHHMM(sl.alarmEpochMin)}` : ""}`;
  if (sl.inBed) return "🛏️ In bed, trying to fall asleep";
  if (p.activity.intensity) return `🏃 Exercising until ${bpHHMM(p.activity.untilEpochMin)}`;
  return "🙂 Awake";
}
function bpBars(p) {
  const thirst = bpClamp(p.water.deficitMl / bpThirstMl(p)), press = bpClamp((p.sleep.S - bpL(p)) / (bpH(p) - bpL(p)));
  const bar = (ic, nm, v, col) => `<div class="bpbar"><span aria-hidden="true">${ic}</span><b>${nm}</b><span class="studybar" role="img" aria-label="${nm} ${Math.round(v * 100)}%"><i style="width:${Math.round(v * 100)}%;background:${col}"></i></span></div>`;
  return bar("⚡", "Energy", bpEnergy(p), "linear-gradient(90deg,#FFE27A,#F4B740)") + bar("🎯", "Focus", bpFocus(p), "linear-gradient(90deg,#B9F3C9,#7CC47A)")
    + bar("🍽️", "Hunger", bpHunger(p), "linear-gradient(90deg,#FFD3B6,#E07A5F)") + bar("💧", "Thirst", thirst, "linear-gradient(90deg,#BFE3FF,#5B8DEF)")
    + bar("😴", "Sleepiness", press, "linear-gradient(90deg,#E2D9FF,#8A86C9)");
}
function bpChips(p) {
  const f = p.flags, c = [];
  if (f.hungry) c.push("🍽️ hungry"); if (f.thirsty) c.push("💧 thirsty"); if (f.sleepy) c.push("😴 sleepy"); if (f.groggy) c.push("🥱 groggy");
  if (p.sleep.eveningLight) c.push("📱 screens on");
  return c.map(x => `<span class="pill">${x}</span>`).join(" ");
}
function bpTraceSvg(w, key, a, b) {
  const [, , unit, y0, y1d, lines] = BP_TRACES[key], W = 640, Hh = 190, L = 44, R = 10, T = 12, B = 26;
  const hl = BPUI.hl && BPUI.hl.key === key ? BPUI.hl : null;
  let y1 = y1d;
  if (key === "caf") for (let t = a; t <= b; t++) { const v = bpHistAt(w, "caf", t); if (v != null) y1 = Math.max(y1, Math.ceil(v / 20) * 20); }
  if (key === "g") for (let t = a; t <= b; t++) { const v = bpHistAt(w, "g", t); if (v != null && v > y1) y1 = Math.ceil(v / 20) * 20; }
  const X = t => L + (t - a) / Math.max(1, b - a) * (W - L - R), Y = v => T + (1 - (v - y0) / (y1 - y0)) * (Hh - T - B);
  let s = `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${BP_TRACES[key][1]} from ${bpHHMM(a)} to ${bpHHMM(b)}"><rect x="${L}" y="${T}" width="${W - L - R}" height="${Hh - T - B}" fill="#FFFDF8" stroke="#E6DCD2"/>`;
  // night shading and highlight window
  for (let t = a; t <= b; t += 5) { const st = bpHistAt(w, "st", t); if (st && st >= 1) s += `<rect x="${X(t)}" y="${T}" width="${Math.max(1, X(t + 5) - X(t))}" height="${Hh - T - B}" fill="#EEE9FF"/>`; }
  if (hl) s += `<rect x="${X(Math.max(a, hl.a))}" y="${T}" width="${Math.max(2, X(Math.min(b, hl.b)) - X(Math.max(a, hl.a)))}" height="${Hh - T - B}" fill="rgba(255,226,122,.45)" stroke="#F4B740" stroke-dasharray="4 3"/>`;
  // hour grid
  for (let t = Math.ceil(a / 180) * 180; t <= b; t += 180) s += `<line x1="${X(t)}" x2="${X(t)}" y1="${T}" y2="${Hh - B}" stroke="#F1EAE2"/><text x="${X(t)}" y="${Hh - 9}" font-size="11" text-anchor="middle" fill="#7A6A66">${bpHHMM(t)}</text>`;
  const ticks = key === "st" ? [[0, "awake"], [1, "N1"], [2, "N2"], [3, "deep"], [4, "REM"]] : [y0, (y0 + y1) / 2, y1].map(v => [v, key === "ph" ? v.toFixed(1) : key === "S" ? v.toFixed(1) : Math.round(v)]);
  ticks.forEach(([v, l]) => s += `<text x="${L - 4}" y="${Y(v) + 4}" font-size="10" text-anchor="end" fill="#7A6A66">${l}</text>`);
  lines.forEach(([v, col, lab]) => { if (v > y0 && v < y1) s += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${col}" stroke-dasharray="5 4"/>${lab ? `<text x="${W - R - 4}" y="${Y(v) - 4}" font-size="10" text-anchor="end" fill="${col}">${lab}</text>` : ""}`; });
  const path = (k, col, wdt, step) => { let d = "", prev = null; for (let t = a; t <= b; t++) { const v = bpHistAt(w, k, t); if (v == null) continue; const y = Y(bpClamp(v, y0, y1)); d += d ? (step && prev != null ? `L${X(t).toFixed(1)} ${prev}L${X(t).toFixed(1)} ${y.toFixed(1)}` : `L${X(t).toFixed(1)} ${y.toFixed(1)}`) : `M${X(t).toFixed(1)} ${y.toFixed(1)}`; prev = y.toFixed(1); } return d ? `<path d="${d}" fill="none" stroke="${col}" stroke-width="${wdt}" stroke-linejoin="round"/>` : ""; };
  if (key === "S") s += path("H", "#C0392B", 1.5) + path("L", "#5B8DEF", 1.5) + `<text x="${L + 4}" y="${T + 12}" font-size="10" fill="#C0392B">sleep gate (upper)</text><text x="${L + 4}" y="${Hh - B - 4}" font-size="10" fill="#5B8DEF">wake line (lower)</text>`;
  s += path(key, key === "ph" ? "#9B59B6" : key === "def" ? "#2E86DE" : key === "caf" ? "#8E5A2B" : key === "st" ? "#5B4B8A" : key === "S" ? "#5B4B49" : "#E07A5F", 2.5, key === "st");
  // what happened: little icons on the time axis
  w.events.forEach(e => { if (e.t < a || e.t > b) return; const ic = e.a === "eat" ? (BP_FOODS[e.items[0][0]] || {}).ic : e.a === "drink" ? (BP_FOODS[e.id] || {}).ic : { exercise: "🏃", brush: "🪥", sleep: "🛏️", wake: "☀️", light: e.on ? "📱" : "" }[e.a];
    if (ic) s += `<text x="${X(e.t)}" y="${T + 14}" font-size="13" text-anchor="middle">${ic}</text>`; });
  return s + `</svg>`;
}
function bpCardHtml(c, open) {
  const d = BP_CARDS[c.id];
  return `<details class="bpcard"${open ? " open" : ""}><summary><span aria-hidden="true">${d.ic}</span> <b>${esc(d.h)}</b> <span class="small muted">Day ${bpDay(c.t)} · ${bpHHMM(c.t)}</span></summary>
    <p style="margin:6px 0">${esc(c.mech)}</p>${d.more.split("\n").map(x => `<p class="small" style="margin:4px 0">${esc(x)}</p>`).join("")}</details>`;
}
function bpReportHtml(n) {
  const r = n.report, pct = Math.round(r.score * 100);
  return `<div class="bpreport"><p style="margin:0"><b>🌙 Sleep report · night ${bpDay(n.onset)}</b> · ${bpHHMM(n.onset)}–${bpHHMM(n.wake)} · quality <b>${pct}/100</b></p>
    <div class="studybar" role="img" aria-label="Sleep quality ${pct} out of 100"><i style="width:${pct}%"></i></div>
    <ul class="small" style="margin:6px 0 0;padding-left:18px">${r.explanationLines.map(l => `<li>${esc(l)}</li>`).join("")}</ul></div>`;
}

/* ---------- The tab ---------- */
function bodypalSim(root) {
  const w = bpLoadWorld();
  BPUI.play = false; BPUI.sess = null; BPUI.hl = null;
  const solids = Object.values(BP_FOODS).filter(f => f.kind === "solid"), drinks = Object.values(BP_FOODS).filter(f => f.kind === "drink" && f.id !== "glucose-drink");
  const foodBtn = (f, k) => `<button class="bpfood" data-${k}="${f.id}" title="${esc(f.name)}"><span aria-hidden="true">${f.ic}</span><small>${esc(f.name.split(",")[0])}</small></button>`;
  root.innerHTML = `<div class="simgrid wide bpgrid">
    <section class="card">
      <div class="bphead"><div><b id="bpClock"></b><div id="bpStatus" class="small"></div></div><div id="bpChips" class="bpchips"></div></div>
      <div class="bpbody"><div id="bpFig" class="bpfig"></div><div id="bpBars" class="bpbars"></div></div>
      <div class="row simbtns"><button class="btn plain" data-adv="15">+15 min</button><button class="btn plain" data-adv="60">+1 hour</button><button class="btn plain" data-adv="180">+3 hours</button><button class="btn" id="bpPlay">▶ Play</button></div>
      <div id="bpBusy" class="small muted" hidden></div>
      <div id="bpActs" class="bpacts">
        <div><b class="small">🍽️ Eat</b>${segBtns("bpportion", [["0.5", "½ portion"], ["1", "1 portion"], ["2", "2 portions"]], "1")}<div class="bpfoods">${solids.map(f => foodBtn(f, "bpeat")).join("")}</div></div>
        <div><b class="small">🥤 Drink</b>${segBtns("bpsip", [["0", "Gulp (5 min)"], ["1", "Sip slowly (60 min)"]], "0")}<div class="bpfoods">${drinks.map(f => foodBtn(f, "bpdrink")).join("")}<button class="bpfood" data-bpdrink="glucose-drink" title="Glucose drink (test)"><span aria-hidden="true">🧪</span><small>Glucose test</small></button></div></div>
        <div><b class="small">🏃 Move (30 min)</b>${segBtns("bpex", [["1", "🚶 Walk"], ["2", "🏃 Jog"], ["3", "⚡ Sprint"]], "2")}<div class="row simbtns"><button class="btn plain" id="bpEx">Start exercise</button><button class="btn plain" id="bpBrush">🪥 Brush teeth</button><button class="btn plain" id="bpLight"></button></div></div>
        <div><b class="small">🛏️ Bedtime</b>${segBtns("bpalarm", [["none", "No alarm"], ["05:30", "⏰ 05:30"], ["07:00", "⏰ 07:00"]], BPUI.alarm)}<div class="row simbtns"><button class="btn blue" id="bpSleep">🛏️ Go to bed</button></div></div>
      </div>
      <div id="bpSleepActs" class="row simbtns" hidden><button class="btn" id="bpMorning">⏭ Sleep until morning</button><button class="btn plain" id="bpWake">☀️ Wake up now</button></div>
      <div class="row simbtns"><button class="btn plain" id="bpNew">↺ New pal</button></div>
    </section>
    <section class="card">
      <h3 style="margin:0">📈 Inside your pal</h3>
      ${segBtns("bptr", Object.entries(BP_TRACES).map(([k, [ic, nm]]) => [k, `${ic} ${nm}`]), BPUI.tab)}
      <div id="bpNow" class="small"></div>
      <div id="bpTrace" class="simsvg nozoom"></div>
      <h3 style="margin:0">💡 Why cards</h3><div id="bpCards" class="bpcards"></div>
      <div id="bpReport"></div>
    </section></div>
    <section class="card bpquiz"><h3 style="margin:0">🧠 Questions from your pal's day</h3><div id="bpQuiz"></div></section>
    <section class="card">${foldHtml("bp-los", { icon: "📚", title: "What Body Pal teaches", peek: "" }, `<div id="bpLos"></div>`)}</section>
    ${simQuiz("bodypal")}`;
  const $ = s => root.querySelector(s);
  let lastCards = w.fired.length, lastNights = w.nights.length;
  const draw = () => {
    const p = w.pal;
    $("#bpClock").textContent = `Day ${bpDay(p.epochMin)} · ${bpHHMM(p.epochMin)}`;
    $("#bpStatus").textContent = bpStatus(p);
    $("#bpChips").innerHTML = bpChips(p);
    $("#bpFig").innerHTML = figure("chiikawa", bpMood(p));
    $("#bpBars").innerHTML = bpBars(p);
    const bed = p.sleep.asleep || p.sleep.inBed, full = bpFull(w);
    $("#bpActs").hidden = bed; $("#bpSleepActs").hidden = !bed;
    $("#bpBusy").hidden = !full && !p.activity.intensity;
    $("#bpBusy").textContent = full ? `This pal's diary is full (${BP_MAX_DAYS} days). Start a new pal to keep going.` : "Your pal is exercising. Eating and bedtime wait until it finishes.";
    root.querySelectorAll("[data-adv], #bpPlay, #bpMorning").forEach(b => b.disabled = full);
    $("#bpLight").textContent = p.sleep.eveningLight ? "📱 Screens off" : "📱 Screens on";
    const a = Math.max(w.t0, p.epochMin - 1440), b = Math.max(p.epochMin, a + 60), hl = BPUI.hl;
    const a2 = hl && hl.key === BPUI.tab ? Math.min(a, hl.a) : a;
    $("#bpTrace").innerHTML = bpTraceSvg(w, BPUI.tab, a2, b);
    const g = p.fuel.plasmaGlucoseMgDl;
    $("#bpNow").innerHTML = { g: `Now: <b>${Math.round(g)} mg/dL</b>. Liver glycogen about <b>${Math.round(p.fuel.glycogenLiverG)} g</b>.`, ph: `Now: <b>pH ${p.teeth.plaquePh.toFixed(1)}</b>. Today below pH 5.5: <b>${p.teeth.deminMinutesToday} min</b>.`,
      S: `Pressure <b>${p.sleep.S.toFixed(2)}</b>. Bed works best once the line nears the upper gate.`, st: `Each cycle is about 90 minutes: light, deep, then REM.`,
      def: `Now: <b>${Math.round(p.water.deficitMl)} mL</b> short. Thirst switches on at ${bpThirstMl(p)} mL.`, caf: `Now: <b>${Math.round(p.sleep.caffeineMg)} mg</b>. Half is cleared every 5 hours.` }[BPUI.tab];
    const cards = w.fired.slice(-6).reverse();
    $("#bpCards").innerHTML = cards.length ? cards.map((c, i) => bpCardHtml(c, i === 0 && c.t >= p.epochMin - 60)).join("") : `<p class="small muted" style="margin:0">Cards appear when something worth explaining happens. Try a glucose drink, a late coffee or a night without brushing.</p>`;
    const n = w.nights[w.nights.length - 1];
    $("#bpReport").innerHTML = n ? bpReportHtml(n) : "";
  };
  const drawSlow = () => { $("#bpLos").innerHTML = bpLosHtml(); if (!BPUI.sess) bpQuizIntro($("#bpQuiz"), w); };
  // something new to explain: stop playing so the student sees it
  const after = () => {
    if (w.fired.length > lastCards) { const c = w.fired[w.fired.length - 1]; SFX.item(); toast(`${BP_CARDS[c.id].ic} ${BP_CARDS[c.id].h}`); BPUI.play = false; }
    if (w.nights.length > lastNights) { SFX.item(); BPUI.play = false; }
    lastCards = w.fired.length; lastNights = w.nights.length;
    $("#bpPlay").textContent = BPUI.play ? "⏸ Pause" : "▶ Play";
    bpPersist(); draw(); drawSlow();
  };
  const advance = m => { if (bpFull(w)) return; bpAdvance(w, Math.min(m, BP_MAX_DAYS * 1440 - (w.pal.epochMin - w.t0))); };
  const act = (ok, msg) => { if (ok) { SFX.click(); after(); } else { SFX.wrong(); toast(msg || "Your pal can't do that right now."); } };
  root.querySelectorAll("[data-adv]").forEach(b => b.onclick = () => { SFX.tap(); advance(Number(b.dataset.adv)); after(); });
  $("#bpPlay").onclick = () => { SFX.tap(); BPUI.play = !BPUI.play; $("#bpPlay").textContent = BPUI.play ? "⏸ Pause" : "▶ Play"; };
  const seg = (name, fn) => root.querySelectorAll(`[data-${name}]`).forEach(b => b.onclick = () => { SFX.tap(); root.querySelectorAll(`[data-${name}]`).forEach(x => x.setAttribute("aria-checked", x === b ? "true" : "false")); fn(b.getAttribute(`data-${name}`)); });
  seg("bpportion", v => BPUI.portion = Number(v)); seg("bpsip", v => BPUI.sip = v === "1"); seg("bpex", v => BPUI.ex = Number(v)); seg("bpalarm", v => BPUI.alarm = v);
  seg("bptr", v => { BPUI.tab = v; draw(); });
  root.querySelectorAll("[data-bpeat]").forEach(b => b.onclick = () => { const f = BP_FOODS[b.dataset.bpeat]; act(!bpFull(w) && bpEat(w, [[f.id, Math.round(f.defaultPortionG * BPUI.portion)]])); });
  root.querySelectorAll("[data-bpdrink]").forEach(b => b.onclick = () => { const f = BP_FOODS[b.dataset.bpdrink]; act(!bpFull(w) && bpDrink(w, f.id, Math.round(f.defaultPortionG * (f.id === "glucose-drink" ? 1 : BPUI.portion)), BPUI.sip ? 60 : 5)); });
  $("#bpEx").onclick = () => act(!bpFull(w) && bpExercise(w, BPUI.ex, 30), "Your pal is already moving, or it is in bed.");
  $("#bpBrush").onclick = () => act(!bpFull(w) && bpBrush(w));
  $("#bpLight").onclick = () => act(!bpFull(w) && bpSetLight(w, !w.pal.sleep.eveningLight));
  $("#bpSleep").onclick = () => {
    let alarm = null;
    if (BPUI.alarm !== "none") { const [h, m] = BPUI.alarm.split(":").map(Number); alarm = Math.floor(w.pal.epochMin / 1440) * 1440 + h * 60 + m; if (alarm <= w.pal.epochMin + 60) alarm += 1440; }
    act(!bpFull(w) && bpTrySleep(w, alarm), "Your pal is still exercising.");
  };
  $("#bpWake").onclick = () => act(bpWake(w));
  $("#bpMorning").onclick = () => { SFX.tap(); for (let i = 0; i < 960 && (w.pal.sleep.asleep || w.pal.sleep.inBed) && !bpFull(w); i++) advance(1); after(); };
  $("#bpNew").onclick = () => { if (!confirm("Start a new pal? The current pal's days will be cleared (your learning progress stays).")) return; SFX.tap(); BPUI.w = null; bpNewWorld(); bodypalSim(root); };
  wireSimQuiz(root); wireFolds(root);
  BPUI.draw = draw; BPUI.drawSlow = drawSlow; BPUI.root = root;
  draw(); drawSlow();
  simLoop(root, dt => {
    if (!BPUI.play) return;
    if (bpFull(w)) { BPUI.play = false; after(); return; }
    BPUI.acc += dt * 60;   // one simulated hour per second
    const n = Math.floor(BPUI.acc); BPUI.acc -= n;
    for (let i = 0; i < n && BPUI.play; i++) { advance(1); if (w.fired.length > lastCards || w.nights.length > lastNights) { after(); break; } }
    const now = performance.now(); if (BPUI.play && now - BPUI.lastDraw > 200) { BPUI.lastDraw = now; draw(); }
  });
}

/* ---------- Learning objectives (mastery from the Leitner boxes) ---------- */
function bpLosHtml() {
  const L = bpLearner(), dom = { fuel: "⚡ Fuel", water: "💧 Water", sleep: "😴 Sleep", teeth: "🦷 Teeth" };
  return Object.keys(dom).map(d => `<p style="margin:8px 0 4px"><b>${dom[d]}</b></p><ul class="small bplos">${Object.entries(BP_LOS).filter(([, v]) => v[0] === d).map(([lo, v]) => {
    const s = L.los[lo] || { box: 0, seen: 0 }, st = bpMastered(s) ? "🌟" : s.seen ? "●".repeat(s.box) + "○".repeat(4 - s.box) : "○○○○";
    return `<li><span class="bpbox" aria-label="box ${s.box} of 4">${st}</span> ${esc(v[1])}</li>`; }).join("")}</ul>`).join("");
}

/* ---------- Question session (focus-gated, built from the pal's own last 48 h) ---------- */
function bpQuizIntro(box, w) {
  const f = bpFocus(w.pal), [n, msg] = bpSessionSize(f), pct = Math.round(f * 100);
  box.innerHTML = `<p class="small" style="margin:4px 0">Focus now: <b>${pct}/100</b>. ${esc(msg || "Focus is high, so this is a full session of 6.")}</p>
    ${n ? `<button class="btn" id="bpQGo">🧠 Ask me ${n} question${n > 1 ? "s" : ""}</button>` : `<p class="small muted" style="margin:0">Questions use the last 48 hours of your pal's day. Live a few hours first, then come back.</p>`}`;
  const go = box.querySelector("#bpQGo");
  if (go) go.onclick = () => {
    SFX.tap(); S.bodypal.sessions = (S.bodypal.sessions || 0) + 1;
    const s = bpBuildSession(w, bpLearner(), bpHash(`${S.bodypal.n || 1}-${S.bodypal.sessions}-${w.pal.epochMin}`));
    if (!s.questions.length) { box.innerHTML = `<p class="small" style="margin:4px 0">Not enough has happened yet to ask about. Eat, drink, sleep and come back.</p>`; return; }
    BPUI.sess = { s, i: 0, right: 0, done: false }; save(); bpQuizShow(box, w);
  };
}
function bpQuizShow(box, w) {
  const st = BPUI.sess, q = st.s.questions[st.i], a = q.answer, n = st.s.questions.length;
  const ref = BP_REF[q.evidence.traceRef];
  let ui = "";
  if (a.kind === "mcq" || a.kind === "compare") ui = `<div class="choices">${a.options.map((o, k) => `<button class="choice" data-bpa="${k}"><b>${"ABCD"[k]}</b><span>${esc(o)}</span></button>`).join("")}</div>`;
  else if (a.kind === "bool") ui = `<div class="choices"><button class="choice" data-bpa="t"><b>✔</b><span>True</span></button><button class="choice" data-bpa="f"><b>✖</b><span>False</span></button></div>`;
  else if (a.kind === "numeric") ui = `<div class="row"><input id="bpNum" type="number" inputmode="decimal" step="any" class="bpnum" aria-label="Your answer"> <span>${esc(a.unit || "")}</span> <button class="btn" id="bpNumGo">Check</button></div>`;
  else ui = `<p class="small muted" style="margin:4px 0">Tap them in order, first to last.</p><div class="choices">${a.items.map((o, k) => `<button class="choice" data-bpo="${k}"><b class="bpord"></b><span>${esc(o)}</span></button>`).join("")}</div><div class="row"><button class="btn plain" id="bpOrdReset">↺ Clear</button></div>`;
  box.innerHTML = `<p class="small muted" style="margin:4px 0">Question ${st.i + 1} of ${n}</p><p style="margin:4px 0 8px"><b>${esc(q.prompt)}</b></p>
    ${ref ? `<button class="btn plain bplook" id="bpLook">📈 Show me the evidence</button>` : ""}${ui}<div id="bpFb" class="small" aria-live="polite"></div>`;
  const look = box.querySelector("#bpLook");
  if (look) look.onclick = () => { SFX.tap(); BPUI.tab = ref; BPUI.hl = { key: ref, a: q.evidence.windowEpochMin[0], b: q.evidence.windowEpochMin[1] };
    BPUI.root.querySelectorAll("[data-bptr]").forEach(x => x.setAttribute("aria-checked", x.dataset.bptr === ref ? "true" : "false")); BPUI.draw(); BPUI.root.querySelector("#bpTrace").scrollIntoView({ behavior: "smooth", block: "center" }); };
  const finish = (given, btn) => {
    if (st.answered) return; st.answered = true;
    const ok = bpCheckAnswer(q, given);
    bpRecordAnswer(bpLearner(), q, ok, w.pal.epochMin);
    box.querySelectorAll("button.choice, #bpNumGo, #bpOrdReset").forEach(x => x.disabled = true);
    if (a.kind === "mcq" || a.kind === "compare") box.querySelectorAll("[data-bpa]").forEach(x => { if (Number(x.dataset.bpa) === a.correctIndex) x.classList.add("right"); else if (x === btn) x.classList.add("wrong"); });
    if (a.kind === "bool") box.querySelectorAll("[data-bpa]").forEach(x => { if ((x.dataset.bpa === "t") === a.value) x.classList.add("right"); else if (x === btn) x.classList.add("wrong"); });
    const right = a.kind === "numeric" ? ` The answer is about ${a.value}${a.unit ? " " + a.unit : ""}.` : a.kind === "order" ? ` The order is: ${a.correctOrder.map(i => a.items[i]).join(" → ")}.` : "";
    if (ok) { st.right++; SFX.right(); gainCoins(2, null, btn); } else SFX.wrong();
    box.querySelector("#bpFb").innerHTML = `<p class="lensres ${ok ? "ok" : "no"}" style="margin:6px 0">${ok ? "✅ " + esc(q.feedback.correct) : "🌱 " + esc(q.feedback.incorrect) + esc(right)}</p><p style="margin:4px 0">💡 ${esc(q.feedback.mechanism)}</p>
      <button class="btn" id="bpNext">${st.i + 1 < n ? "Next question" : "Finish"}</button>`;
    box.querySelector("#bpNext").onclick = () => {
      SFX.tap(); st.i++; st.answered = false;
      if (st.i < n) return bpQuizShow(box, w);
      activityDone({ mode: "sim", sim: "bodypal", ans: n, cor: st.right });
      BPUI.sess = null; BPUI.hl = null; save(); BPUI.draw(); BPUI.drawSlow();
      box.insertAdjacentHTML("afterbegin", `<p class="lensres ok" style="margin:6px 0">Session done: ${st.right} of ${n} right. The mastery dots below have moved.</p>`);
    };
    save();
  };
  box.querySelectorAll("[data-bpa]").forEach(b => b.onclick = () => finish(b.dataset.bpa === "t" ? true : b.dataset.bpa === "f" ? false : Number(b.dataset.bpa), b));
  const num = box.querySelector("#bpNumGo");
  if (num) { const inp = box.querySelector("#bpNum"); num.onclick = () => { if (inp.value.trim() === "") { inp.focus(); return; } finish(Number(inp.value), num); }; inp.onkeydown = e => { if (e.key === "Enter") num.click(); }; }
  if (a.kind === "order") {
    const picked = [], btns = [...box.querySelectorAll("[data-bpo]")];
    const paint = () => btns.forEach(b => { const k = picked.indexOf(Number(b.dataset.bpo)); b.querySelector(".bpord").textContent = k >= 0 ? k + 1 : "·"; b.classList.toggle("picked", k >= 0); });
    paint();
    btns.forEach(b => b.onclick = () => { const k = Number(b.dataset.bpo); if (picked.includes(k)) return; SFX.tap(); picked.push(k); paint(); if (picked.length === btns.length) finish(picked.slice(), b); });
    box.querySelector("#bpOrdReset").onclick = () => { picked.length = 0; paint(); };
  }
}

/* Lab hooks: predict-first and the quick check (answer 0 is the right one; the lab shuffles them) */
SIM_P.bodypal = ["Your pal drinks a 240 mL coffee (95 mg caffeine) at 20:00. How much caffeine is still in its blood at 23:00?",
  ["About 63 mg, because the liver clears half every 5 hours", "None, because caffeine is used up within an hour", "About 95 mg, because caffeine stays until you sleep", "About 30 mg, because half is cleared every hour"],
  "Caffeine has a half-life of about 5 hours. After 3 hours, 95 × 0.5^(3/5) ≈ 63 mg is left, enough to delay sleep.", "give your pal a coffee at 20:00, play to 23:00 and read the caffeine trace."];
SIM_Q.bodypal = [["After a sugary drink, which hormone brings blood glucose back down?", ["Insulin, which makes liver and muscle cells take up glucose", "Glucagon, which makes the liver release glucose", "Adrenaline, which raises the heart rate", "Caffeine, which blocks sleep pressure"], "Insulin is released by the pancreas when glucose rises. Liver and muscle cells take up glucose and store some as glycogen."],
  ["Why does sipping a sugary drink slowly harm teeth more than drinking it quickly?", ["Each sip restarts the acid, so pH stays below 5.5 for longer", "Slow sips contain more sugar in total", "Saliva stops flowing while you sip", "Quick drinking washes the enamel clean"], "Plaque bacteria turn sugar into acid within minutes. Each new sip resets the drop, so the enamel spends longer below the critical pH of 5.5."]];
