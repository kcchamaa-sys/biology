/* ============================================================
   5f-4. 🫀 The living Study Pal. Your active pal's body runs on the Body Pal engine (bodypal_engine.js):
   glucose and insulin, liver glycogen, water and sweat, sleep pressure and the body clock, plaque pH and saliva.
   - Pal time runs while the pal is on screen (🏠 Home or 🐾 Pals): 1 pal minute every real second, ⏩ 10× when fast.
     It pauses when you leave, so a pal is never neglected while you study.
   - Touch a body part (brain, mouth, heart, tummy, hands) to see what is happening inside right now, and why.
   - Feed, give drinks, play outside, brush, screens off, bedtime: every choice changes the body, and Why cards explain it.
   - Questions come from your pal's own last 48 hours (focus-gated, Leitner learner shared by all pals).
   Save per pal: S.pals[id].body = { opts, log, now } (the action log, replayed on load; rebased every 3 pal days).
   Voice (spec C) for body text: calm, no "!", no calorie / weight / good-bad food words.
   ============================================================ */
const LP = { w: null, id: null, speed: 1, acc: 0, timer: null, lastSave: 0, lastSlow: 0, peekUntil: 0, tab: "g", hl: null, sess: null, sip: false, alarm: "07:00",
  seen: { f: 0, n: 0 }, mood: "", night: null, lastPat: 0 };
const LP_KEEP = 2880, LP_REBASE = 4320;
const LP_TRACES = {
  g: ["🩸", "Glucose", "mg/dL", 40, 200, [[70, "#5B8DEF"], [140, "#E07A5F"]]],
  ph: ["🦷", "Plaque pH", "", 4.5, 7.2, [[5.5, "#C0392B", "pH 5.5: enamel starts to dissolve"]]],
  S: ["😴", "Sleep pressure", "", 0, 1, []],
  st: ["🌙", "Sleep stages", "", 0, 4, []],
  def: ["💧", "Water deficit", "mL", -300, 1400, [[600, "#5B8DEF", "thirst switches on"]]],
  caf: ["☕", "Caffeine", "mg", 0, 120, []]
};
const LP_REF = { g: "g", ph: "ph", caf: "caf", def: "def", st: "st" };
const LP_ZONE_TRACE = { brain: "S", heart: "g", belly: "g", mouth: "ph", hands: "def" };
// touch zones over the pal figure (percent of the figure box; FIG_VB is -14 -6 228 202)
const LP_ZONES = [["brain", 50.9, 42, 34, 20], ["mouth", 50.9, 69.5, 15, 9], ["heart", 37.5, 82, 17, 13], ["belly", 62, 82, 17, 13], ["hands", 21.5, 72, 12, 15], ["hands", 80.3, 72, 12, 15]];

/* ---------- The body: load, save, rebase ---------- */
function lpLearner() { S.palLearn = S.palLearn || (S.bodypal && S.bodypal.learner) || bpNewLearner(); return S.palLearn; }
function lpWorld() {
  const id = activePalId();
  if (LP.w && LP.id === id) return LP.w;
  if (LP.w) lpPersist(true);
  const st = palState(id);
  if (S.bodypal) {   // the old Lab tab's pal moves into Mochi (or the active pal), and its learning progress stays
    lpLearner(); S.palSessions = S.palSessions || S.bodypal.sessions || 0;
    if (!st.body && Array.isArray(S.bodypal.log)) st.body = { opts: S.bodypal.opts || {}, log: S.bodypal.log, now: S.bodypal.now };
    delete S.bodypal;
  }
  let w = null;
  if (st.body && Array.isArray(st.body.log)) { try { w = bpReplay(st.body, st.body.now); } catch (e) { w = null; } }
  if (!w) {
    w = bpCreateWorld({ start: 420, seed: bpHash(id) });
    bpAdvance(w, 0);
    st.body = { opts: w.opts, log: [], now: 420 };
  }
  LP.w = w; LP.id = id; LP.seen = { f: w.fired.length, n: w.nights.length }; LP.mood = ""; LP.night = null;
  return w;
}
function lpPersist(now) {
  const w = LP.w; if (!w || !S || !S.pals[LP.id]) return;
  const st = S.pals[LP.id], p = w.pal;
  st.body = { opts: w.opts, log: w.events, now: p.epochMin };
  if (p.epochMin - w.t0 > LP_REBASE && !LP.sess) {
    st.body = Object.assign(bpRebase(st.body, p.epochMin, LP_KEEP), { now: p.epochMin });
    LP.w = bpReplay(st.body, p.epochMin); LP.seen = { f: LP.w.fired.length, n: LP.w.nights.length };
  }
  LP.lastSave = Date.now();
  if (now) save();
}
const lpBusy = () => { const p = lpWorld().pal; return p.sleep.asleep || p.sleep.inBed; };
const lpHour = p => Math.floor(bpMod(p.epochMin) / 60);
const lpNight = p => { const h = lpHour(p); return h >= 19 || h < 6; };

/* ---------- Mood and words ---------- */
function lpMood() {
  const p = lpWorld().pal, P = palState(activePalId());
  if (p.sleep.asleep || p.sleep.inBed) return "asleep";
  if (p.activity.intensity) return "exercise";
  if (p.flags.groggy) return "groggy";
  if (p.flags.thirsty) return "thirsty";
  if (p.flags.hungry) return "hungry";
  if (p.flags.sleepy) return "sleepy";
  if (P.happy < 25) return "lonely";
  return P.happy >= 75 && bpFocus(p) >= 0.6 ? "overjoyed" : "happy";
}
function lpNeedLine() {
  const w = lpWorld(), p = w.pal, sl = p.sleep;
  const m = lpMood();
  if (m === "asleep") return sl.inBed ? "Lying in bed, waiting for the sleep gate to open... 🛏️" : `Zzz... ${{ N1: "light sleep", N2: "light sleep", SWS: "deep sleep", REM: "REM sleep, dreaming" }[sl.stage]} 💤`;
  if (m === "exercise") return `Running about... my heart is at ${bpHeartRate(p)} beats a minute 🏃`;
  if (m === "groggy") return "So groggy... the alarm woke me in the middle of a sleep cycle 🥱";
  if (m === "thirsty") return `I'm thirsty. I've lost about ${Math.round(p.water.deficitMl)} mL of water already 💧`;
  if (m === "hungry") return "My tummy is rumbling. Could we eat something? 🍙";
  if (m === "sleepy") return "Yawn... my sleep gate is open. Bedtime soon? 😴";
  if (p.teeth.plaquePh < BPK.CRITICAL_PH) return `My teeth feel sour. Plaque pH is ${p.teeth.plaquePh.toFixed(1)} 🦷`;
  if (m === "lonely") return "Play with me? A quick Term Match would cheer me up 🥺";
  return pick(["Touch my head, tummy or heart to see inside me ✨", "Everything inside me is ticking along nicely 🌱", `My glucose is ${Math.round(p.fuel.plasmaGlucoseMgDl)} mg/dL. Steady 🙂`]);
}
function lpStatus(p) {
  const sl = p.sleep;
  if (sl.asleep) return `💤 Asleep · ${{ N1: "light sleep", N2: "light sleep", SWS: "deep sleep", REM: "REM sleep" }[sl.stage]}${sl.alarmEpochMin != null ? ` · ⏰ ${bpHHMM(sl.alarmEpochMin)}` : ""}`;
  if (sl.inBed) return "🛏️ In bed, falling asleep";
  if (p.activity.intensity) return `🏃 Playing outside until ${bpHHMM(p.activity.untilEpochMin)}`;
  return "🙂 Awake";
}
const lpClock = p => `Day ${bpDay(p.epochMin)} · ${bpHHMM(p.epochMin)}`;

/* ---------- The room: the pal with touch zones (Home and Pals tab) ---------- */
function lpWindow(night) {
  return `<svg class="rwin" viewBox="0 0 100 105" aria-hidden="true"><rect x="4" y="4" width="92" height="92" rx="18" fill="${night ? "#6E6590" : "#CFE9F7"}" stroke="#fff" stroke-width="6"/>${night
    ? `<circle cx="66" cy="34" r="12" fill="#FFF1C5"/><circle cx="72" cy="30" r="10" fill="#6E6590"/><circle cx="28" cy="60" r="2" fill="#fff"/><circle cx="40" cy="28" r="1.6" fill="#fff"/>`
    : `<circle cx="30" cy="32" r="12" fill="#FFF1A8"/><ellipse cx="62" cy="62" rx="20" ry="9" fill="#fff"/>`}<path d="M50 4 V96 M4 50 H96" stroke="#fff" stroke-width="5"/><rect x="0" y="92" width="100" height="10" rx="5" fill="#E6CBB0"/></svg>`;
}
function lpFace() { return S.ill ? "sick" : MOOD_FACE[lpMood()]; }
function lpRoomHtml(line) {
  const w = lpWorld(), p = w.pal, night = lpNight(p), pet = S.activePet && S.pets[S.activePet] ? petById(S.activePet) : null;
  LP.mood = lpFace(); LP.night = night;
  return `<div class="petroom lproom${night ? " night" : ""}${p.sleep.asleep ? " asleep" : ""}${p.activity.intensity ? " moving" : ""}" id="lpRoom">
    <span id="lpWin">${lpWindow(night)}</span><div class="pbubble" id="lpBubble" aria-live="polite" data-t="${Date.now()}">${line || esc(lpNeedLine())}</div>
    <div class="rug"></div>
    <div class="pet lppet ${frameCls()}" id="lpPet" style="--breath:${(60 / bpBreathRate(p) * 1.6).toFixed(2)}s;--beat:${(60 / bpHeartRate(p)).toFixed(2)}s">
      <div id="lpFig">${figure("chiikawa", LP.mood, S.equip)}</div><span class="lpsweat" aria-hidden="true">💦</span>
      ${LP_ZONES.map(([z, x, y, wd, ht]) => `<button class="lpz lpz-${z}" data-zone="${z}" style="left:${x}%;top:${y}%;width:${wd}%;height:${ht}%" aria-label="Touch ${BP_ZONES[z][1].toLowerCase()}">${z === "heart" ? `<i class="lpbeat" aria-hidden="true">❤</i>` : ""}</button>`).join("")}
    </div>
    ${pet ? `<button class="rpet" data-pet="${pet.id}" aria-label="${esc(pet.nick)} the ${esc(pet.name)}">${petSvg(pet.id)}</button>` : ""}
    <div class="lpclock"><b id="lpClock">${lpClock(p)}</b></div>
  </div>`;
}
function lpPeekHtml(zone) {
  const k = bpPeek(lpWorld(), zone);
  return `<b>${k.ic} ${esc(k.h)}</b><span class="lpread">${esc(k.read)}</span><span class="lpwhy">${esc(k.why)}</span>`;
}
function lpTouch(zone, btn) {
  const w = lpWorld(), bub = document.getElementById("lpBubble"), now = Date.now();
  SFX.tap(); SFX.item();
  if (bub) { bub.innerHTML = lpPeekHtml(zone); bub.classList.add("peek"); bub.style.animation = "none"; void bub.offsetWidth; bub.style.animation = ""; }
  LP.peekUntil = now + 9000;
  const pet = document.getElementById("lpPet"); if (pet) { pet.classList.remove("hop"); void pet.offsetWidth; pet.classList.add("hop"); }
  if (btn) { btn.classList.remove("ping"); void btn.offsetWidth; btn.classList.add("ping"); }
  S.palTouches = S.palTouches || {}; S.palTouches[zone] = (S.palTouches[zone] || 0) + 1;
  if (now - LP.lastPat > 20000 && !w.pal.sleep.asleep) { LP.lastPat = now; lpHappy(2); }
  if (document.getElementById("lpTrace") && LP_ZONE_TRACE[zone]) { LP.tab = LP_ZONE_TRACE[zone]; lpSetTab(); lpDrawSlow(true); }
  save();
}
function lpHappy(n) { const st = palState(activePalId()); st.happy = Math.min(100, st.happy + Math.round(n * perk("energy"))); }
function wireLpRoom(root) {
  root.querySelectorAll("[data-zone]").forEach(b => b.onclick = e => { e.stopPropagation(); lpTouch(b.dataset.zone, b); });
  lpStart();
}

/* ---------- Pal time ---------- */
function lpStart() {
  clearInterval(LP.timer);
  LP.timer = setInterval(lpStep, 250);
}
function lpStep() {
  if (!S || !document.getElementById("lpRoom")) { clearInterval(LP.timer); LP.timer = null; lpPersist(true); return; }
  if (document.hidden || LP.sess || !LP.speed) return;
  LP.acc += 0.25 * LP.speed;
  const n = Math.floor(LP.acc); LP.acc -= n;
  for (let i = 0; i < n; i++) if (lpMinute()) break;
  if (n) lpDraw();
  if (Date.now() - LP.lastSave > 30000) { lpPersist(false); saveLocal(); }   // device only: the class sheet gets it with the next real save
}
// one pal minute; true = something worth stopping for
function lpMinute() {
  const w = lpWorld();
  bpAdvance(w, 1);
  if (bpWantsDoze(w.pal)) { bpTrySleep(w, null); toast(`😴 ${palName()} dozed off by itself: sleep pressure was very high.`); }
  return lpNews();
}
function lpNews() {
  const w = lpWorld();
  let stop = false;
  if (w.fired.length > LP.seen.f) {
    const c = w.fired[w.fired.length - 1], d = BP_CARDS[c.id];
    SFX.hint(); toast(`${d.ic} ${d.h}`);
    const bub = document.getElementById("lpBubble");
    if (bub) { bub.innerHTML = `<b>${d.ic} ${esc(d.h)}</b><span class="lpwhy">${esc(c.mech)}</span>`; bub.classList.add("peek"); LP.peekUntil = Date.now() + 12000; }
    if (LP.speed > 1) { LP.speed = 1; lpSpeedBtns(); }
    stop = true;
  }
  if (w.nights.length > LP.seen.n) { SFX.item(); stop = true; const n = w.nights[w.nights.length - 1]; toast(`🌙 ${palName()} woke up: sleep quality ${Math.round(n.report.score * 100)}/100`); }
  LP.seen = { f: w.fired.length, n: w.nights.length };
  if (stop) { lpPersist(false); saveLocal(); lpDrawSlow(true); }
  return stop;
}
function lpAdvance(m) { for (let i = 0; i < m; i++) if (lpMinute()) break; lpAfter(); }

/* ---------- Drawing (cheap parts every pal minute, the trace every couple of seconds) ---------- */
function lpDraw() {
  const room = document.getElementById("lpRoom"); if (!room) return;
  const w = lpWorld(), p = w.pal, g = id => document.getElementById(id);
  g("lpClock").textContent = lpClock(p);
  const night = lpNight(p), face = lpFace();
  if (night !== LP.night) { LP.night = night; g("lpWin").innerHTML = lpWindow(night); }
  room.classList.toggle("night", night); room.classList.toggle("asleep", p.sleep.asleep); room.classList.toggle("moving", !!p.activity.intensity);
  if (face !== LP.mood) { LP.mood = face; g("lpFig").innerHTML = figure("chiikawa", face, S.equip); }
  const pet = g("lpPet"); pet.style.setProperty("--breath", `${(60 / bpBreathRate(p) * 1.6).toFixed(2)}s`); pet.style.setProperty("--beat", `${(60 / bpHeartRate(p)).toFixed(2)}s`);
  if (Date.now() > LP.peekUntil) { const b = g("lpBubble"); if (b.classList.contains("peek") || !b.dataset.t || Date.now() - b.dataset.t > 15000) { b.classList.remove("peek"); b.textContent = lpNeedLine(); b.dataset.t = Date.now(); } }
  if (g("lpStatus")) g("lpStatus").textContent = lpStatus(p);
  if (g("lpBars")) g("lpBars").innerHTML = lpBars(p);
  if (g("lpActs")) lpActsState();
  if (Date.now() - LP.lastSlow > 2000) lpDrawSlow();
}
function lpBars(p) {
  const st = palState(activePalId()), thirst = bpClamp(p.water.deficitMl / bpThirstMl(p)), press = bpClamp((p.sleep.S - bpL(p)) / (bpH(p) - bpL(p)));
  const bar = (ic, nm, v, col) => `<div class="bpbar"><span aria-hidden="true">${ic}</span><b>${nm}</b><span class="studybar" role="img" aria-label="${nm} ${Math.round(v * 100)}%"><i style="width:${Math.round(v * 100)}%;background:${col}"></i></span></div>`;
  return bar("⚡", "Energy", bpEnergy(p), "linear-gradient(90deg,#FFE27A,#F4B740)") + bar("🎯", "Focus", bpFocus(p), "linear-gradient(90deg,#B9F3C9,#7CC47A)")
    + bar("🍽️", "Hunger", bpHunger(p), "linear-gradient(90deg,#FFD3B6,#E07A5F)") + bar("💧", "Thirst", thirst, "linear-gradient(90deg,#BFE3FF,#5B8DEF)")
    + bar("😴", "Sleepiness", press, "linear-gradient(90deg,#E2D9FF,#8A86C9)") + bar("❤️", "Happy", st.happy / 100, "linear-gradient(90deg,#FFD1DC,#FF86A8)");
}
function lpDrawSlow(force) {
  if (!document.getElementById("lpTrace")) return;
  LP.lastSlow = Date.now();
  const w = lpWorld(), p = w.pal, g = id => document.getElementById(id);
  const a = Math.max(w.t0, p.epochMin - 1440), b = Math.max(p.epochMin, a + 60), hl = LP.hl;
  g("lpTrace").innerHTML = lpTraceSvg(w, LP.tab, hl && hl.key === LP.tab ? Math.max(w.t0, Math.min(a, hl.a)) : a, b);
  const G = p.fuel.plasmaGlucoseMgDl;
  g("lpNow").innerHTML = { g: `Now: <b>${Math.round(G)} mg/dL</b>. Liver glycogen about <b>${Math.round(p.fuel.glycogenLiverG)} g</b>.`, ph: `Now: <b>pH ${p.teeth.plaquePh.toFixed(1)}</b>. Since waking, below pH 5.5 for <b>${p.teeth.deminMinutesToday} min</b>.`,
    S: `Pressure <b>${p.sleep.S.toFixed(2)}</b>. Bed works best once the line nears the upper gate.`, st: `Each cycle is about 90 minutes: light, deep, then REM.`,
    def: `Now: <b>${Math.max(0, Math.round(p.water.deficitMl))} mL</b> short. Thirst switches on at ${bpThirstMl(p)} mL.`, caf: `Now: <b>${Math.round(p.sleep.caffeineMg)} mg</b>. Half is cleared every 5 hours.` }[LP.tab];
  if (force || g("lpCards").dataset.n !== String(w.fired.length)) {
    g("lpCards").dataset.n = w.fired.length;
    const cards = w.fired.slice(-6).reverse();
    g("lpCards").innerHTML = cards.length ? cards.map((c, i) => lpCardHtml(c, i === 0 && c.t >= p.epochMin - 60)).join("") : `<p class="small muted" style="margin:0">Cards appear when something worth explaining happens inside ${esc(palName())}. Try a sweet drink, a late coffee or a night without brushing.</p>`;
    const n = w.nights[w.nights.length - 1];
    g("lpReport").innerHTML = n ? lpReportHtml(n) : "";
  }
  if (!LP.sess && g("lpQuiz")) lpQuizIntro(g("lpQuiz"));
}
function lpTraceSvg(w, key, a, b) {
  const [, , , y0, y1d, lines] = LP_TRACES[key], W = 640, Hh = 190, L = 44, R = 10, T = 12, B = 26;
  const hl = LP.hl && LP.hl.key === key ? LP.hl : null;
  let y1 = y1d;
  if (key === "caf" || key === "g") for (let t = a; t <= b; t++) { const v = bpHistAt(w, key, t); if (v != null && v > y1) y1 = Math.ceil(v / 20) * 20; }
  const X = t => L + (t - a) / Math.max(1, b - a) * (W - L - R), Y = v => T + (1 - (v - y0) / (y1 - y0)) * (Hh - T - B);
  let s = `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${LP_TRACES[key][1]} from ${bpHHMM(a)} to ${bpHHMM(b)}"><rect x="${L}" y="${T}" width="${W - L - R}" height="${Hh - T - B}" fill="#FFFDF8" stroke="#E6DCD2"/>`;
  for (let t = a; t <= b; t += 5) { const st = bpHistAt(w, "st", t); if (st && st >= 1) s += `<rect x="${X(t)}" y="${T}" width="${Math.max(1, X(t + 5) - X(t))}" height="${Hh - T - B}" fill="#EEE9FF"/>`; }
  if (hl) s += `<rect x="${X(Math.max(a, hl.a))}" y="${T}" width="${Math.max(2, X(Math.min(b, hl.b)) - X(Math.max(a, hl.a)))}" height="${Hh - T - B}" fill="rgba(255,226,122,.45)" stroke="#F4B740" stroke-dasharray="4 3"/>`;
  for (let t = Math.ceil(a / 180) * 180; t <= b; t += 180) s += `<line x1="${X(t)}" x2="${X(t)}" y1="${T}" y2="${Hh - B}" stroke="#F1EAE2"/><text x="${X(t)}" y="${Hh - 9}" font-size="11" text-anchor="middle" fill="#7A6A66">${bpHHMM(t)}</text>`;
  const ticks = key === "st" ? [[0, "awake"], [1, "N1"], [2, "N2"], [3, "deep"], [4, "REM"]] : [y0, (y0 + y1) / 2, y1].map(v => [v, key === "ph" || key === "S" ? v.toFixed(1) : Math.round(v)]);
  ticks.forEach(([v, l]) => s += `<text x="${L - 4}" y="${Y(v) + 4}" font-size="10" text-anchor="end" fill="#7A6A66">${l}</text>`);
  lines.forEach(([v, col, lab]) => { if (v > y0 && v < y1) s += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${col}" stroke-dasharray="5 4"/>${lab ? `<text x="${W - R - 4}" y="${Y(v) - 4}" font-size="10" text-anchor="end" fill="${col}">${lab}</text>` : ""}`; });
  const path = (k, col, wdt, step) => { let d = "", prev = null; for (let t = a; t <= b; t++) { const v = bpHistAt(w, k, t); if (v == null) continue; const y = Y(bpClamp(v, y0, y1)); d += d ? (step && prev != null ? `L${X(t).toFixed(1)} ${prev}L${X(t).toFixed(1)} ${y.toFixed(1)}` : `L${X(t).toFixed(1)} ${y.toFixed(1)}`) : `M${X(t).toFixed(1)} ${y.toFixed(1)}`; prev = y.toFixed(1); } return d ? `<path d="${d}" fill="none" stroke="${col}" stroke-width="${wdt}" stroke-linejoin="round"/>` : ""; };
  if (key === "S") s += path("H", "#C0392B", 1.5) + path("L", "#5B8DEF", 1.5) + `<text x="${L + 4}" y="${T + 12}" font-size="10" fill="#C0392B">sleep gate (upper)</text><text x="${L + 4}" y="${Hh - B - 4}" font-size="10" fill="#5B8DEF">wake line (lower)</text>`;
  s += path(key, { ph: "#9B59B6", def: "#2E86DE", caf: "#8E5A2B", st: "#5B4B8A", S: "#5B4B49" }[key] || "#E07A5F", 2.5, key === "st");
  w.events.forEach(e => { if (e.t < a || e.t > b) return; const ic = e.a === "eat" ? (BP_FOODS[e.items[0][0]] || {}).ic : e.a === "drink" ? (BP_FOODS[e.id] || {}).ic : { exercise: "🏃", brush: "🪥", sleep: "🛏️", wake: "☀️", light: e.on ? "📱" : "" }[e.a];
    if (ic) s += `<text x="${X(e.t)}" y="${T + 14}" font-size="13" text-anchor="middle">${ic}</text>`; });
  return s + `</svg>`;
}
function lpCardHtml(c, open) {
  const d = BP_CARDS[c.id];
  return `<details class="bpcard"${open ? " open" : ""}><summary><span aria-hidden="true">${d.ic}</span> <b>${esc(d.h)}</b> <span class="small muted">Day ${bpDay(c.t)} · ${bpHHMM(c.t)}</span></summary>
    <p style="margin:6px 0">${esc(c.mech)}</p>${d.more.split("\n").map(x => `<p class="small" style="margin:4px 0">${esc(x)}</p>`).join("")}</details>`;
}
function lpReportHtml(n) {
  const r = n.report, pct = Math.round(r.score * 100);
  return `<div class="bpreport"><p style="margin:0"><b>🌙 Sleep report · night ${bpDay(n.onset)}</b> · ${bpHHMM(n.onset)}–${bpHHMM(n.wake)} · quality <b>${pct}/100</b></p>
    <div class="studybar" role="img" aria-label="Sleep quality ${pct} out of 100"><i style="width:${pct}%"></i></div>
    <ul class="small" style="margin:6px 0 0;padding-left:18px">${r.explanationLines.map(l => `<li>${esc(l)}</li>`).join("")}</ul></div>`;
}
function lpSetTab() { document.querySelectorAll("[data-lptr]").forEach(x => x.setAttribute("aria-checked", x.dataset.lptr === LP.tab ? "true" : "false")); }

/* ---------- Care (Pals tab) ---------- */
function lpCareHtml() {
  const P = activePal(), st = palState(P.id), n = evoNeed(P.id), lv = palLevel(st.xp);
  return `<div class="row lpspeed" role="group" aria-label="Pal time">${[[0, "⏸ Pause"], [1, "▶ Live"], [10, "⏩ Fast"]].map(([v, l]) => `<button class="btn sm ${LP.speed === v ? "" : "plain"}" data-lpspeed="${v}">${l}</button>`).join("")}
      <button class="btn sm plain" id="lpHour">+1 hour</button><span class="small muted">1 pal minute = 1 second</span></div>
    <div id="lpActs" class="lpacts">
      <div class="row lpawake"><button class="btn yellow" id="pFeed">🍱 Feed</button><button class="btn blue" id="lpDrink">🥤 Drink</button><button class="btn plain" id="lpBrush">🪥 Brush teeth</button><button class="btn plain" id="lpLight"></button></div>
      <div class="row lpawake"><b class="small">🏃 Play outside, 30 min:</b><button class="btn sm plain" data-lpex="1">🚶 Walk</button><button class="btn sm plain" data-lpex="2">🏃 Jog</button><button class="btn sm plain" data-lpex="3">⚡ Sprint</button></div>
      <div class="row lpawake"><b class="small">🛏️ Bedtime:</b>${segBtns("lpalarm", [["none", "No alarm"], ["06:30", "⏰ 06:30"], ["07:00", "⏰ 07:00"]], LP.alarm)}<button class="btn sm" id="lpBed">🛏️ Go to bed</button></div>
      <div class="row lpbed" hidden><button class="btn" id="lpMorning">⏭ Sleep until morning</button><button class="btn plain" id="lpWake">☀️ Wake up now</button></div>
      <div class="row"><button class="btn blue" id="pPlay">🃏 Play Term Match</button>
      ${n ? `<button class="btn ${lv >= n[0] ? "pink" : "plain"}" id="pEvo" ${lv >= n[0] && S.coins >= n[1] ? "" : "disabled"}>✨ Evolve to ${STAGES[st.stage + 1]} · Lv ${n[0]} + 🌰 ${n[1]}</button>` : `<span class="pill saved">👑 Fully evolved</span>`}
      <button class="btn plain" data-go="dress">👗 Dress up</button></div>
    </div>`;
}
function lpActsState() {
  const p = lpWorld().pal, bed = p.sleep.asleep || p.sleep.inBed;
  document.querySelectorAll(".lpawake").forEach(e => e.hidden = bed);
  document.querySelectorAll(".lpbed").forEach(e => e.hidden = !bed);
  const l = document.getElementById("lpLight"); if (l) l.textContent = p.sleep.eveningLight ? "📱 Screens off" : "📱 Screens on";
  document.querySelectorAll("[data-lpex]").forEach(b => b.disabled = !!p.activity.intensity);
}
function lpSpeedBtns() { document.querySelectorAll("[data-lpspeed]").forEach(b => b.classList.toggle("plain", Number(b.dataset.lpspeed) !== LP.speed)); }
function lpAfter() { lpNews(); lpPersist(true); lpDraw(); lpDrawSlow(true); }
function lpAct(ok, msg, happy) {
  if (ok) { SFX.click(); if (happy) lpHappy(happy); lpAfter(); return true; }
  SFX.wrong(); toast(msg || `${palName()} can't do that right now.`); return false;
}
function wireLpCare(root) {
  const w = lpWorld(), $ = s => root.querySelector(s);
  root.querySelectorAll("[data-lpspeed]").forEach(b => b.onclick = () => { SFX.tap(); LP.speed = Number(b.dataset.lpspeed); lpSpeedBtns(); });
  $("#lpHour").onclick = () => { SFX.tap(); lpAdvance(60); };
  $("#lpDrink").onclick = () => { SFX.tap(); openFeed("drink"); };
  $("#lpBrush").onclick = () => lpAct(bpBrush(lpWorld()), `${palName()} is in bed.`, 1);
  $("#lpLight").onclick = () => { const p = lpWorld().pal; lpAct(bpSetLight(lpWorld(), !p.sleep.eveningLight)); };
  root.querySelectorAll("[data-lpex]").forEach(b => b.onclick = () => lpAct(bpExercise(lpWorld(), Number(b.dataset.lpex), 30), `${palName()} is already moving, or it's in bed.`, 3));
  root.querySelectorAll("[data-lpalarm]").forEach(b => b.onclick = () => { SFX.tap(); LP.alarm = b.dataset.lpalarm; root.querySelectorAll("[data-lpalarm]").forEach(x => x.setAttribute("aria-checked", x === b ? "true" : "false")); });
  $("#lpBed").onclick = () => {
    const ww = lpWorld(); let alarm = null;
    if (LP.alarm !== "none") { const [h, m] = LP.alarm.split(":").map(Number); alarm = Math.floor(ww.pal.epochMin / 1440) * 1440 + h * 60 + m; if (alarm <= ww.pal.epochMin + 60) alarm += 1440; }
    lpAct(bpTrySleep(ww, alarm), `${palName()} is still playing outside.`);
  };
  $("#lpWake").onclick = () => lpAct(bpWake(lpWorld()));
  $("#lpMorning").onclick = () => { SFX.tap(); const ww = lpWorld(); for (let i = 0; i < 960 && (ww.pal.sleep.asleep || ww.pal.sleep.inBed); i++) { bpAdvance(ww, 1); } lpAfter(); };
  lpActsState();
  void w;
}

/* ---------- "Inside your pal" and the question session (Pals tab) ---------- */
function lpInsideHtml() {
  const nm = esc(palName());
  return `<section class="card lpinside"><h3 style="margin:0">🔬 Inside ${nm}</h3>
      <p class="small muted" style="margin:0">Live traces from ${nm}'s body over the last 24 pal hours. Touch a body part to jump to its trace.</p>
      ${segBtns("lptr", Object.entries(LP_TRACES).map(([k, [ic, nm2]]) => [k, `${ic} ${nm2}`]), LP.tab)}
      <div id="lpNow" class="small"></div><div id="lpTrace" class="simsvg nozoom"></div>
      <h3 style="margin:0">💡 Why cards</h3><div id="lpCards" class="bpcards"></div><div id="lpReport"></div></section>
    <section class="card bpquiz"><h3 style="margin:0">🧠 Questions from ${nm}'s day</h3><div id="lpQuiz"></div></section>
    <section class="card">${foldHtml("lp-los", { icon: "📚", title: `What ${nm}'s body teaches`, peek: lpLosPeek() }, `<div id="lpLos">${lpLosHtml()}</div>`)}</section>`;
}
function wireLpInside(root) {
  root.querySelectorAll("[data-lptr]").forEach(b => b.onclick = () => { SFX.tap(); LP.tab = b.dataset.lptr; lpSetTab(); lpDrawSlow(true); });
  lpDrawSlow(true);
}
function lpLosPeek() { const L = lpLearner(), n = Object.keys(BP_LOS).filter(lo => L.los[lo] && bpMastered(L.los[lo])).length; return `🌟 ${n} / ${Object.keys(BP_LOS).length}`; }
function lpLosHtml() {
  const L = lpLearner(), dom = { fuel: "⚡ Fuel", water: "💧 Water", sleep: "😴 Sleep", teeth: "🦷 Teeth" };
  return Object.keys(dom).map(d => `<p style="margin:8px 0 4px"><b>${dom[d]}</b></p><ul class="small bplos">${Object.entries(BP_LOS).filter(([, v]) => v[0] === d).map(([lo, v]) => {
    const s = L.los[lo] || { box: 0, seen: 0 }, st = bpMastered(s) ? "🌟" : s.seen ? "●".repeat(s.box) + "○".repeat(4 - s.box) : "○○○○";
    return `<li><span class="bpbox" aria-label="box ${s.box} of 4">${st}</span> ${esc(v[1])}</li>`; }).join("")}</ul>`).join("");
}
function lpQuizIntro(box) {
  const w = lpWorld(), f = bpFocus(w.pal), [n, msg] = bpSessionSize(f), pct = Math.round(f * 100), key = `${n}|${pct}`;
  if (box.dataset.k === key) return; box.dataset.k = key;
  box.innerHTML = `<p class="small" style="margin:4px 0">${esc(palName())}'s focus now: <b>${pct}/100</b>. ${esc(msg || "Focus is high, so this is a full session of 6.")}</p>
    ${n ? `<button class="btn" id="lpQGo">🧠 Ask me ${n} question${n > 1 ? "s" : ""}</button><p class="small muted" style="margin:6px 0 0">Pal time pauses while you answer.</p>` : `<p class="small muted" style="margin:0">Questions use the last 48 pal hours. Let ${esc(palName())} live a few hours, then come back.</p>`}`;
  const go = box.querySelector("#lpQGo");
  if (go) go.onclick = () => {
    SFX.tap(); S.palSessions = (S.palSessions || 0) + 1;
    const s = bpBuildSession(w, lpLearner(), bpHash(`${LP.id}-${S.palSessions}-${w.pal.epochMin}`));
    if (!s.questions.length) { box.dataset.k = ""; box.innerHTML = `<p class="small" style="margin:4px 0">Not enough has happened yet to ask about. Eat, drink, sleep and come back.</p>`; return; }
    LP.sess = { s, i: 0, right: 0 }; save(); lpQuizShow(box);
  };
}
function lpQuizShow(box) {
  const st = LP.sess, q = st.s.questions[st.i], a = q.answer, n = st.s.questions.length, ref = LP_REF[q.evidence.traceRef];
  let ui = "";
  if (a.kind === "mcq" || a.kind === "compare") ui = `<div class="choices">${a.options.map((o, k) => `<button class="choice" data-bpa="${k}"><b>${"ABCD"[k]}</b><span>${esc(o)}</span></button>`).join("")}</div>`;
  else if (a.kind === "bool") ui = `<div class="choices"><button class="choice" data-bpa="t"><b>✔</b><span>True</span></button><button class="choice" data-bpa="f"><b>✖</b><span>False</span></button></div>`;
  else if (a.kind === "numeric") ui = `<div class="row"><input id="bpNum" type="number" inputmode="decimal" step="any" class="bpnum" aria-label="Your answer"> <span>${esc(a.unit || "")}</span> <button class="btn" id="bpNumGo">Check</button></div>`;
  else ui = `<p class="small muted" style="margin:4px 0">Tap them in order, first to last.</p><div class="choices">${a.items.map((o, k) => `<button class="choice" data-bpo="${k}"><b class="bpord"></b><span>${esc(o)}</span></button>`).join("")}</div><div class="row"><button class="btn plain" id="bpOrdReset">↺ Clear</button></div>`;
  box.innerHTML = `<p class="small muted" style="margin:4px 0">Question ${st.i + 1} of ${n} · ⏸ pal time paused</p><p style="margin:4px 0 8px"><b>${esc(q.prompt)}</b></p>
    ${ref ? `<button class="btn plain bplook" id="bpLook">📈 Show me the evidence</button>` : ""}${ui}<div id="bpFb" class="small" aria-live="polite"></div>`;
  const look = box.querySelector("#bpLook");
  if (look) look.onclick = () => { SFX.tap(); LP.tab = ref; LP.hl = { key: ref, a: q.evidence.windowEpochMin[0], b: q.evidence.windowEpochMin[1] }; lpSetTab(); lpDrawSlow(true); document.getElementById("lpTrace").scrollIntoView({ behavior: "smooth", block: "center" }); };
  const finish = (given, btn) => {
    if (st.answered) return; st.answered = true;
    const ok = bpCheckAnswer(q, given);
    bpRecordAnswer(lpLearner(), q, ok, lpWorld().pal.epochMin);
    box.querySelectorAll("button.choice, #bpNumGo, #bpOrdReset").forEach(x => x.disabled = true);
    if (a.kind === "mcq" || a.kind === "compare") box.querySelectorAll("[data-bpa]").forEach(x => { if (Number(x.dataset.bpa) === a.correctIndex) x.classList.add("right"); else if (x === btn) x.classList.add("wrong"); });
    if (a.kind === "bool") box.querySelectorAll("[data-bpa]").forEach(x => { if ((x.dataset.bpa === "t") === a.value) x.classList.add("right"); else if (x === btn) x.classList.add("wrong"); });
    const right = a.kind === "numeric" ? ` The answer is about ${a.value}${a.unit ? " " + a.unit : ""}.` : a.kind === "order" ? ` The order is: ${a.correctOrder.map(i => a.items[i]).join(" → ")}.` : "";
    if (ok) { st.right++; SFX.right(); gainCoins(2, null, btn); } else SFX.wrong();
    box.querySelector("#bpFb").innerHTML = `<p class="lensres ${ok ? "ok" : "no"}" style="margin:6px 0">${ok ? "✅ " + esc(q.feedback.correct) : "🌱 " + esc(q.feedback.incorrect) + esc(right)}</p><p style="margin:4px 0">💡 ${esc(q.feedback.mechanism)}</p>
      <button class="btn" id="bpNext">${st.i + 1 < n ? "Next question" : "Finish"}</button>`;
    box.querySelector("#bpNext").onclick = () => {
      SFX.tap(); st.i++; st.answered = false;
      if (st.i < n) return lpQuizShow(box);
      LP.sess = null; LP.hl = null;
      activityDone({ mode: "sim", sim: "bodypal", ans: n, cor: st.right });
      save(); box.dataset.k = ""; lpDrawSlow(true);
      const los = document.getElementById("lpLos"); if (los) los.innerHTML = lpLosHtml();
      box.insertAdjacentHTML("afterbegin", `<p class="lensres ok" style="margin:6px 0">Session done: ${st.right} of ${n} right. The mastery dots in 📚 have moved, and pal time runs again.</p>`);
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
