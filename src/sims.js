/* ============================================================
   5f. 🔬 Simulation Lab: interactive models for "Organisms and Environment"
   (HKDSE Biology compulsory part: a. Plants · b. Animals · c. Reproduction, growth and development ·
   d. Coordination and response · e. Homeostasis · f. Ecosystems)
   How it fits together (read docs/SIM_LAB_GUIDE.md before adding a simulation):
   - simReg({ id, ic, name, sec, ord, topic, fn, words }) registers a simulation; the Lab groups them by section.
   - Each simulation function draws into root and starts simLoop(); it calls simProbe(() => ({ ...live values }))
     so the challenge engine (simchal.js) can check what the student has set up.
   - SIM_P[id] = predict-first question · SIM_Q[id] = exam-style checks · SIM_CH[id] = the ~15-minute challenge.
   This file: core + 1. Breathing · 2. Pupil reflex · 3. Focusing & glasses · 4. Hearing · 5. Cell membrane (root hair).
   sims2.js: osmosis tubing, phototropism. sims_a–f.js: one file per curriculum section.
   ============================================================ */
let simTab = null, SIM = null, SIM_PROBE = null;
const SIM_SECS = [
  ["a", "🌿", "Plants", "Essential life processes in plants"],
  ["b", "🍙", "Animals", "Essential life processes in animals"],
  ["c", "🌸", "Growth", "Reproduction, growth and development"],
  ["d", "🧠", "Senses", "Coordination and response"],
  ["e", "⚖️", "Balance", "Homeostasis"],
  ["f", "🌍", "Ecosystems", "Ecosystems"]
];
const SIMS = [], SIM_CH = {};
// Register a simulation. sec = "a"–"f"; ord sorts inside the section; topic = TOPICS id; words = [[term, emoji, simple meaning]]
function simReg(o) {
  SIMS.push(Object.assign({ ord: 50, words: [] }, o));
  const si = s => SIM_SECS.findIndex(x => x[0] === s.sec);
  SIMS.sort((a, b) => si(a) - si(b) || a.ord - b.ord);
}
// The open simulation shares its live state with the challenge engine (a plain object of numbers/strings/booleans)
function simProbe(fn) { SIM_PROBE = fn; }
// Extra CSS for one simulation file (prefix every class with the sim id)
function simStyle(css) { const e = document.createElement("style"); e.textContent = css; document.head.appendChild(e); }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const segBtns = (name, opts, cur) => `<div class="simseg" role="radiogroup">${opts.map(([v, l]) => `<button role="radio" aria-checked="${v === cur}" data-${name}="${v}">${l}</button>`).join("")}</div>`;
// "Done" state of a simulation's challenge, for the tabs: [tasks done, total, finished?]
function simChalState(id) { const c = (S.simc || {})[id], n = typeof chalTasks === "function" && SIM_CH[id] ? chalTasks(id).length : 0; return [c ? Object.keys(c.d || {}).length : 0, n, !!(c && c.fin)]; }

simReg({ id: "membrane", ic: "🫧", name: "Root-hair membrane", sec: "a", ord: 10, topic: "t12", fn: membraneSim,
  words: [["cell membrane", "🫧", "thin layer around a cell; controls what goes in and out"], ["osmosis", "💧", "water moves across a membrane to where there is less water"], ["active transport", "🔋", "moving particles from LOW to HIGH concentration, using energy"], ["mineral ion", "⚡", "small charged particle a plant needs, e.g. nitrate"], ["carrier protein", "🚪", "a protein that carries one kind of particle across"], ["respiration", "🔥", "releases energy (ATP) from food, using oxygen"]] });
simReg({ id: "dialysis", ic: "💧", name: "Osmosis tubing", sec: "a", ord: 20, topic: "t12", fn: dialysisSim,
  words: [["osmosis", "💧", "water moves across a membrane to where there is less water"], ["water potential", "📶", "how free the water is to move; pure water is highest"], ["partially permeable", "🥅", "lets small particles (water) through but not big ones (sucrose)"], ["sucrose", "🍬", "a sugar; too big to pass the pores"], ["rate", "⏱️", "how fast something happens"], ["control", "⚖️", "a set-up kept the same, to compare with"]] });
simReg({ id: "lung", ic: "🫁", name: "Breathing", sec: "b", ord: 20, topic: "t13", fn: lungSim,
  words: [["diaphragm", "⌒", "sheet of muscle under the lungs"], ["intercostal muscles", "🦴", "muscles between the ribs"], ["inhale", "⬇️", "breathe in"], ["exhale", "⬆️", "breathe out"], ["volume", "📦", "how much space"], ["pressure", "🎈", "how hard the air pushes"], ["atmospheric pressure", "🌍", "the pressure of the air outside the body"]] });
simReg({ id: "pupil", ic: "👁️", name: "Pupil reflex", sec: "d", ord: 10, topic: "t16", fn: pupilSim,
  words: [["pupil", "⚫", "the hole in the middle of the iris; light enters here"], ["iris", "🟦", "coloured ring of muscle around the pupil"], ["circular muscles", "⭕", "ring-shaped iris muscles; contract → smaller pupil"], ["radial muscles", "✳️", "spoke-shaped iris muscles; contract → bigger pupil"], ["retina", "🎞️", "back of the eye; has light-sensitive cells (receptors)"], ["reflex", "⚡", "a fast, automatic response; no thinking"], ["effector", "💪", "the muscle or gland that responds"]] });
simReg({ id: "lens", ic: "🔍", name: "Focusing & glasses", sec: "d", ord: 20, topic: "t16", fn: lensSim,
  words: [["accommodation", "🔍", "changing the lens shape to focus near or far"], ["ciliary muscles", "⭕", "ring of muscle that changes the lens shape"], ["suspensory ligaments", "🧵", "threads that hold the lens"], ["convex", "()", "thicker in the middle; bends light more"], ["concave", ")(", "thinner in the middle; spreads light out"], ["short sight", "👓", "can see near things but not far things"], ["long sight", "🔭", "can see far things but not near things"]] });
simReg({ id: "ear", ic: "👂", name: "Hearing", sec: "d", ord: 30, topic: "t16", fn: earSim,
  words: [["eardrum", "🥁", "thin skin that vibrates when sound hits it"], ["ossicles", "🦴", "three tiny bones that make vibrations bigger"], ["cochlea", "🐌", "snail-shaped tube with hair cells (receptors)"], ["hair cells", "〰️", "receptors that change vibrations into nerve impulses"], ["frequency", "🎵", "pitch: how many vibrations per second (Hz)"], ["auditory nerve", "⚡", "carries impulses from the cochlea to the brain"]] });

function renderSims(tab) {
  if (tab) simTab = tab;
  stopRush(); stopTimer(); if (R) { clearTimeout(R.introT); clearTimeout(R.incT); } R = null; MUSIC.setMode("calm"); renderTools(); homeTab = "lab"; renderNav("lab");
  if (!SIMS.some(x => x.id === simTab)) simTab = SIMS.some(x => x.id === S.simLast) ? S.simLast : SIMS[0].id;
  S.simLast = simTab; SIM_PROBE = null;
  S.sims = S.sims || {}; if (!S.sims[simTab]) { S.sims[simTab] = today(); save(); checkTrophies(); } activityDone({ mode: "sim", sim: simTab, ans: 0 });
  const info = SIMS.find(x => x.id === simTab), sec = SIM_SECS.find(x => x[0] === info.sec), topic = TOPICS.find(T => T.id === info.topic);
  const secDone = s => SIMS.filter(x => x.sec === s).map(x => simChalState(x.id)[2]);
  const allDone = SIMS.filter(x => simChalState(x.id)[2]).length;
  $app.innerHTML = `
    <section class="card simhead">
      <div class="simtop"><h2 style="margin:0">🔬 Simulation Lab</h2><span class="pill" title="Challenges finished">🏆 ${allDone}/${SIMS.length}</span></div>
      <div class="simsecs" role="tablist" aria-label="Curriculum sections">${SIM_SECS.map(([k, ic, nm, full]) => { const d = secDone(k); return `<button role="tab" aria-selected="${k === info.sec}" data-simsec="${k}" title="${esc(k + ". " + full)}"><span class="ssic" aria-hidden="true">${ic}</span><span class="ssnm"><b>${k}.</b> ${nm}</span><span class="ssdots" aria-label="${d.filter(Boolean).length} of ${d.length} challenges done">${d.map(x => x ? "●" : "○").join("")}</span></button>`; }).join("")}</div>
      <p class="simsecname"><b>${sec[0]}. ${esc(sec[3])}</b></p>
      <div class="slottabs" role="tablist">${SIMS.filter(x => x.sec === info.sec).map(x => { const [d, n, fin] = simChalState(x.id); return `<button role="tab" aria-selected="${x.id === simTab}" data-sim="${x.id}"><span aria-hidden="true">${x.ic}</span>${esc(x.name)}<span class="simtabst" aria-label="challenge ${fin ? "finished" : d + " of " + n}">${fin ? "🏆" : n ? `${d}/${n}` : ""}</span></button>`; }).join("")}</div>
      <p class="small muted" style="margin:0">${info.ic} ${esc(info.name)}${topic ? ` · Topic ${topic.no} ${esc(topic.name)}` : ""} · 🎯 challenge below</p>
    </section>
    <div id="simBody"></div>`;
  $app.querySelectorAll("[data-sim]").forEach(b => b.onclick = () => { SFX.tap(); renderSims(b.dataset.sim); });
  $app.querySelectorAll("[data-simsec]").forEach(b => b.onclick = () => {
    SFX.tap(); const k = b.dataset.simsec, list = SIMS.filter(x => x.sec === k);
    S.simSec = S.simSec || {}; renderSims((list.find(x => x.id === S.simSec[k]) || list[0]).id);
  });
  S.simSec = S.simSec || {}; S.simSec[info.sec] = simTab;
  const body = document.getElementById("simBody");
  info.fn(body);
  simPredict(body, simTab);
  simWords(body, info);
  if (typeof simChallenge === "function") simChallenge(body, simTab);
  wireFolds($app);
  // Phones: wide diagrams scroll inside their card; start them centred on the interesting middle
  setTimeout(() => $app.querySelectorAll(".simsvg:not(.nozoom)").forEach(e => { if (e.scrollWidth > e.clientWidth) e.scrollLeft = (e.scrollWidth - e.clientWidth) / 2; }), 120);
  window.scrollTo({ top: 0 });
}
/* 📖 Picture word bank: each key word = emoji + word + 🔊 + a short, simple meaning (for students learning in English) */
function simWords(root, info) {
  if (!info.words || !info.words.length) return;
  const W = info.words, card = document.createElement("section"); card.className = "card simwords";
  const mean = i => { const [w, ic, m] = W[i]; return `<span class="swic" aria-hidden="true">${ic}</span><span class="swt"><b>${esc(w)}</b>${typeof sayBtns === "function" ? sayBtns(w) : ""}<small>${esc(m)}</small></span>`; };
  card.innerHTML = foldHtml("lab-words", { icon: "📖", title: "Key words", peek: `${W.length} words · tap one`, cls: "fold-flat", open: true },
    `<div class="swrow" role="tablist" aria-label="Key words">${W.map(([w, ic], i) => `<button role="tab" class="swchip" aria-selected="${i === 0}" data-sw="${i}"><span aria-hidden="true">${ic}</span>${esc(w)}</button>`).join("")}</div>
    <div class="swcard" aria-live="polite">${mean(0)}</div>`);
  card.querySelectorAll("[data-sw]").forEach(b => b.onclick = () => {
    SFX.tap(); card.querySelectorAll("[data-sw]").forEach(x => x.setAttribute("aria-selected", x === b ? "true" : "false"));
    card.querySelector(".swcard").innerHTML = mean(Number(b.dataset.sw)); if (typeof speak === "function") speak(W[Number(b.dataset.sw)][0]);
  });
  root.insertBefore(card, root.firstChild);
}
/* One animation loop per open simulation; it stops itself when the page changes */
function simLoop(root, step) {
  const me = SIM = { root, last: performance.now() };
  const f = now => {
    if (SIM !== me || !root.isConnected) return;
    const dt = Math.min(.05, (now - me.last) / 1000); me.last = now;
    if (!document.hidden) step(dt);
    requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}
/* Exam-style checks: 2 per simulation. They become the last mission ("🧠 Exam check") of each challenge (simchal.js). */
const SIM_Q = {
  lung: [["During inhalation, what happens to the air pressure inside the lungs?", ["It falls below atmospheric pressure, so air flows in", "It rises above atmospheric pressure, so air flows in", "It stays equal to atmospheric pressure", "It falls to zero"], "Volume ↑ → pressure ↓ below atmospheric → air moves in down the pressure gradient."],
    ["Which change happens when you breathe out at rest?", ["The diaphragm relaxes and domes upwards", "The diaphragm contracts and flattens", "The external intercostal muscles contract", "The ribs move upwards and outwards"], "At rest, breathing out is mostly passive: the muscles relax, the chest volume falls and pressure rises."]],
  pupil: [["In bright light, which muscles of the iris contract?", ["The circular muscles", "The radial muscles", "The ciliary muscles", "The suspensory ligaments"], "Circular muscles contract (radial relax) → the pupil gets smaller → less light enters, protecting the retina."],
    ["In the pupil reflex, what is the effector?", ["The muscles of the iris", "The retina", "The optic nerve", "The brain"], "Retina (receptor) → sensory neurone → brain → motor neurone → iris muscles (effector)."]],
  lens: [["When you look at a near object, what happens?", ["Ciliary muscles contract, suspensory ligaments slacken, the lens becomes thicker", "Ciliary muscles relax, suspensory ligaments tighten, the lens becomes thinner", "Ciliary muscles contract, suspensory ligaments tighten, the lens becomes thinner", "The pupil gets bigger and the lens stays the same"], "A thicker, more convex lens refracts light more, so the image of a near object focuses on the retina."],
    ["A short-sighted person sees distant objects blurred. Which lens corrects this?", ["A concave (diverging) lens", "A convex (converging) lens", "No lens: they should squint", "A thicker eye lens"], "The image forms in front of the retina, so a concave lens spreads the rays out a little before they enter the eye."]]
};

/* Predict first: students guess before they run each simulation (the Phototropism lab has its own per-set-up predictions).
   A wrong guess costs nothing; the first right guess in a lab earns +2 🌰. Controls unlock once a guess is made (or Skip is pressed). */
const SIM_P = {
  membrane: ["You turn the temperature up to 65 °C. What do you think happens to the cell membrane?",
    ["It leaks, because heat denatures the membrane proteins", "It gets stronger, so fewer substances can cross it", "Nothing changes, because membranes are not affected by heat", "It closes completely, so nothing at all can cross it"],
    "Too much heat denatures the membrane proteins and disturbs the phospholipids, so the membrane leaks.", "slide the temperature and tap the particle buttons."],
  dialysis: ["Dialysis tubing holds 20% sucrose and sits in a beaker of distilled water. What happens to the liquid level in the tubing after 30 minutes?",
    ["The level rises, because water moves into the tubing by osmosis", "The level falls, because sucrose moves out into the beaker", "The level stays the same, because both sides are balanced", "The level rises first, then falls back to where it started"],
    "Water moves from the higher water potential (beaker) into the lower water potential (sucrose) through the pores. Sucrose is too big to leave, so the level rises.", "press ▶ Start."],
  lung: ["You tick 🏃 Exercise. What will happen to the lung-pressure graph?",
    ["Bigger and faster pressure swings: deeper, quicker breaths", "Smaller and slower pressure swings: shallower breaths", "No change, because breathing is not affected by exercise", "The graph becomes a flat line, because the lungs stop moving"],
    "Exercise needs more oxygen, so we breathe deeper and faster. The lung pressure changes more and more often.", "tick 🏃 Exercise and watch the graph."],
  pupil: ["You move from a dark room into bright sun. What will the pupil do?",
    ["It gets smaller, because the circular muscles contract", "It gets smaller, because the radial muscles contract", "It gets bigger, because the circular muscles contract", "It stays the same size, because the iris cannot move"],
    "In bright light the circular muscles contract (the radial muscles relax), so the pupil gets smaller and protects the retina.", "move the light slider or tap Dark room / Bright sun."],
  lens: ["A short-sighted eye with no glasses looks at a distant tree. Where do the light rays meet?",
    ["In front of the retina, so the tree looks blurred", "Behind the retina, so the tree looks blurred", "Exactly on the retina, so the tree looks sharp", "On the lens itself, so no image forms at all"],
    "A short-sighted eye focuses too strongly, so the rays meet in front of the retina. A concave lens spreads them out first and fixes this.", "set Eye to Short sight, then try the glasses."],
  ear: ["You tick 🎧 Hearing damage and slide the pitch up to 15 kHz (a high ringtone). Can the person hear it?",
    ["No: the hair cells for high pitches are damaged and do not regrow", "Yes: the sound is simply louder, so it is always heard", "Yes: the ear drum repairs itself, so every pitch is heard", "No: the whole ear stops working, so nothing is heard"],
    "Loud noise damages the hair cells in the cochlea, usually the ones for high pitches first. Hair cells do not grow back.", "tick Hearing damage and slide the pitch."]
};
function simPredict(root, id) {
  const P = SIM_P[id]; if (!P) return;
  const [q, ch, why, tryIt] = P, order = shuffle(ch.map((_, k) => k)); let picked = null;
  const card = document.createElement("section"); card.className = "card simpred";
  card.innerHTML = `<span class="kicker">🤔 Predict first</span><p style="margin:2px 0 8px"><b>${esc(q)}</b></p>
    <div class="choices">${order.map((k, n) => `<button class="choice" data-sp="${k}"><b>${"ABCD"[n]}</b><span>${esc(ch[k])}</span></button>`).join("")}</div>
    <div class="spfb small" aria-live="polite"><span class="muted">Pick your best guess to unlock the simulation.</span><button class="btn plain" id="spSkip">Skip</button></div>`;
  root.insertBefore(card, root.firstChild);
  const lock = on => root.querySelectorAll(".simgrid, .simchal").forEach(e => { e.inert = on; e.classList.toggle("simlocked", on); });
  lock(true);
  const fb = card.querySelector(".spfb");
  card.querySelector("#spSkip").onclick = () => { SFX.tap(); lock(false); card.remove(); };
  card.querySelectorAll("[data-sp]").forEach(b => b.onclick = () => {
    SFX.tap(); picked = Number(b.dataset.sp); lock(false); b.classList.add("picked");
    card.querySelectorAll("[data-sp]").forEach(x => x.disabled = true);
    fb.innerHTML = `<span>🤔 Guess saved. Now ${esc(tryIt)} Then compare:</span><button class="btn" id="spCheck">🔍 Check my prediction</button>`;
    fb.querySelector("#spCheck").onclick = () => {
      const ok = picked === 0; S.simp = S.simp || {}; const first = ok && !S.simp[id];
      card.querySelectorAll("[data-sp]").forEach(x => { x.classList.remove("picked"); if (Number(x.dataset.sp) === 0) x.classList.add("right"); else if (Number(x.dataset.sp) === picked) x.classList.add("wrong"); });
      if (first) { S.simp[id] = 1; S.coins += 2; save(true); renderTools(); SFX.right(); } else ok ? SFX.right() : SFX.wrong();
      fb.innerHTML = `<p class="lensres ${ok ? "ok" : "no"}" style="margin:0;width:100%">${ok ? "✅ Your prediction was right!" + (first ? " <b>+2 🌰</b>" : "") : "❌ Not this time, and that's how we learn."} <span style="font-weight:600">${esc(why)}</span></p>`;
    };
  });
}

/* ---------------- 1. 🫁 Breathing ---------------- */
function lungSim(root) {
  const st = { t: 0, v: .2, vPrev: .2, auto: true, deep: false, target: null, from: 0, to: 0, k: 0, showVol: true, hist: [] };
  root.innerHTML = `<div class="simgrid">
    <section class="card"><div id="lungSvg" class="simsvg"></div>
      <div class="row">${segBtns("lmode", [["auto", "▶ Auto breathing"], ["manual", "✋ I control it"]], "auto")}</div>
      <div class="row simbtns" id="lungManual" hidden><button class="btn blue" id="lIn">⬇️ Breathe in</button><button class="btn yellow" id="lOut">⬆️ Breathe out</button></div>
      <label class="small chk"><input type="checkbox" id="lDeep"> 🏃 Exercise (deeper, faster breathing)</label></section>
    <section class="card"><h3 style="margin:0">📈 Pressure in the lungs vs time</h3>
      <div id="lungGraph" class="simsvg"></div>
      <label class="small chk"><input type="checkbox" id="lVol" checked> Show lung volume too</label>
      <div id="lungSteps" class="simsteps"></div></section></div>`;
  const $s = root.querySelector("#lungSvg"), $g = root.querySelector("#lungGraph"), $steps = root.querySelector("#lungSteps");
  root.querySelectorAll("[data-lmode]").forEach(b => b.onclick = () => {
    SFX.tap(); st.auto = b.dataset.lmode === "auto"; st.target = null;
    root.querySelectorAll("[data-lmode]").forEach(x => x.setAttribute("aria-checked", x === b));
    root.querySelector("#lungManual").hidden = st.auto;
  });
  const go = to => { SFX.tap(); st.target = true; st.from = st.v; st.to = to; st.k = 0; };
  root.querySelector("#lIn").onclick = () => go(st.deep ? 1 : .8);
  root.querySelector("#lOut").onclick = () => go(st.deep ? 0 : .2);
  root.querySelector("#lDeep").onchange = e => { st.deep = e.target.checked; };
  root.querySelector("#lVol").onchange = e => { st.showVol = e.target.checked; };
  let lastPhase = "";
  simProbe(() => { const ps = st.hist.map(h => h[1]); return { volume: Math.round(st.v * 100), pressure: +(st.P || 0).toFixed(2), phase: st.phase || "rest", mode: st.auto ? "auto" : "manual", exercise: st.deep, showVol: st.showVol, breaths: st.nIn || 0, pMax: ps.length ? +Math.max(...ps).toFixed(2) : 0, pMin: ps.length ? +Math.min(...ps).toFixed(2) : 0, t: +st.t.toFixed(1) }; });
  simLoop(root, dt => {
    st.t += dt; st.vPrev = st.v;
    if (st.auto) {
      const T = st.deep ? 2.6 : 4.2, a = st.deep ? .95 : .55, base = st.deep ? .03 : .2;
      st.ph = (st.ph || 0) + dt / T;
      st.v = base + a * (1 - Math.cos(2 * Math.PI * st.ph)) / 2;
    } else if (st.target) {
      st.k = Math.min(1, st.k + dt / (st.deep ? 1 : 1.7));
      st.v = st.from + (st.to - st.from) * (1 - Math.cos(Math.PI * st.k)) / 2;
      if (st.k >= 1) st.target = null;
    }
    const dv = (st.v - st.vPrev) / Math.max(dt, 1e-3), P = clamp(-.5 * dv, -.6, .6);
    st.hist.push([st.t, P, st.v]); while (st.hist.length && st.t - st.hist[0][0] > 10) st.hist.shift();
    const phase = dv > .03 ? "in" : dv < -.03 ? "out" : "rest";
    if (phase === "in" && st.phase !== "in") st.nIn = (st.nIn || 0) + 1;
    st.P = P; st.phase = phase;
    $s.innerHTML = thoraxSvg(st.v, dv);
    $g.innerHTML = pressureGraph(st.hist, st.t, st.showVol);
    if (phase !== lastPhase) { lastPhase = phase; $steps.innerHTML = lungSteps(phase); }
  });
}
function thoraxSvg(v, dv) {
  const sx = 1 + .1 * v, sy = 1 + .13 * v, side = 300 + 12 * v, center = 262 + 38 * v, ctrl = 2 * center - side;
  const tree = `<path d="M188 110 Q172 128 160 150 Q150 172 140 200 M160 150 Q170 176 168 212 M172 128 Q142 134 120 152 M140 200 l-14 22 M140 200 l6 26 M168 212 l-10 24 M168 212 l10 20 M120 152 l-16 12 M120 152 l-2 24 M150 172 l-18 4" fill="none" stroke="#C45C75" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>`;
  const lung = `<path d="M188 104 C142 98 94 140 94 212 C94 252 110 278 150 282 C176 284 192 270 192 248 Z" fill="url(#lgF)" stroke="#9A4A5E" stroke-width="2.4"/>
    ${[[120, 130], [140, 160], [112, 190], [150, 230], [124, 250], [170, 190], [106, 226]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="none" stroke="#E7A2B3" stroke-width="1.2"/>`).join("")}
    <path d="M104 198 Q140 176 188 184" fill="none" stroke="#9A4A5E" stroke-width="1.3" opacity=".7"/>${tree}`;
  const lungs = `<g transform="translate(190 104) scale(${sx} ${sy}) translate(-190 -104)">${lung}</g><g transform="translate(420 0) scale(-1 1)"><g transform="translate(190 104) scale(${sx} ${sy}) translate(-190 -104)">${lung}</g></g>`;
  let ribs = "";
  for (let i = 0; i < 6; i++) {
    const y0 = 112 + i * 29 - 6 * v, reach = 96 + 20 * v + i * 3, drop = 24 - 14 * v;
    [-1, 1].forEach(s => {
      const d = `M${210 + s * 14} ${y0} Q${210 + s * (reach - 14)} ${y0 - 10} ${210 + s * reach} ${y0 + drop}`;
      ribs += `<path d="${d}" fill="none" stroke="#8C7A66" stroke-width="10" stroke-linecap="round" opacity=".9"/><path d="${d}" fill="none" stroke="#F3E8D2" stroke-width="6.5" stroke-linecap="round"/>
        <path d="M${210 + s * 14} ${y0} L${210 + s * 38} ${y0 - 3}" stroke="#D5E3EE" stroke-width="6.5" stroke-linecap="round"/>`;
    });
    if (i < 5) [-1, 1].forEach(s => { for (let k = 0; k < 3; k++) ribs += `<path d="M${210 + s * (reach - 44 + k * 10)} ${y0 + drop - 8} l${s * 7} 17" stroke="${dv > .03 ? "#D2455F" : "#C9A0A0"}" stroke-width="${dv > .03 ? 3 : 2}" stroke-linecap="round"/>`; });
  }
  const flow = clamp(dv * 1.6, -1, 1), inF = flow > .05, outF = flow < -.05;
  const arrow = inF ? `<path d="M210 -4 v26 m-10 -10 l10 12 l10 -12" stroke="#5B8FE0" stroke-width="5" fill="none" stroke-linecap="round" opacity="${Math.min(1, Math.abs(flow) + .3)}"/>`
    : outF ? `<path d="M210 24 v-26 m-10 10 l10 -12 l10 12" stroke="#E07A3F" stroke-width="5" fill="none" stroke-linecap="round" opacity="${Math.min(1, Math.abs(flow) + .3)}"/>` : "";
  const dTxt = dv > .03 ? "Diaphragm contracts → flattens" : dv < -.03 ? "Diaphragm relaxes → domes up" : "Diaphragm";
  const rTxt = dv > .03 ? "Ribs move up and out" : dv < -.03 ? "Ribs move down and in" : "Ribs";
  const dia = `M58 ${side} Q210 ${ctrl} 362 ${side}`;
  return `<svg viewBox="0 -10 420 360" role="img" aria-label="Chest model: lung volume ${Math.round(v * 100)}%">
    <defs><radialGradient id="lgF" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="#FAD0D9"/><stop offset="1" stop-color="#E38EA3"/></radialGradient>
      <clipPath id="dCT"><rect x="165" y="200" width="90" height="140"/></clipPath></defs>
    <path d="M60 330 C40 220 60 110 120 80 Q210 50 300 80 C360 110 380 220 360 330Z" fill="#FFF1E6" stroke="#E6CBB0" stroke-width="3"/>
    <rect x="202" y="16" width="16" height="84" rx="6" fill="#F4D6DC" stroke="#9A4A5E" stroke-width="2.4"/>${[26, 36, 46, 56, 66, 76, 86].map(y => `<path d="M203 ${y} h14" stroke="#FFFFFF" stroke-width="3"/><path d="M203 ${y + 1.5} h14" stroke="#C9A0AA" stroke-width="1"/>`).join("")}
    ${lungs}
    <path d="M196 176 Q176 160 180 196 Q188 230 214 244 Q240 226 246 196 Q250 164 228 172 Q214 158 196 176Z" fill="#B84A43" stroke="#7A2A26" stroke-width="2" opacity=".92"/><path d="M204 180 Q214 196 212 230" fill="none" stroke="#7A2A26" stroke-width="1.2" opacity=".6"/>
    <path d="M210 98 Q200 112 176 126 M210 98 Q220 112 244 126" stroke="#F4D6DC" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M210 98 Q200 112 176 126 M210 98 Q220 112 244 126" stroke="#9A4A5E" stroke-width="1.6" fill="none" opacity=".5"/>
    ${ribs}<rect x="202" y="104" width="16" height="150" rx="6" fill="#F3E8D2" stroke="#8C7A66" stroke-width="2.4"/>
    <path d="${dia}" fill="none" stroke="#9E3B33" stroke-width="13" stroke-linecap="round"/><path d="${dia}" fill="none" stroke="#C9574B" stroke-width="9" stroke-linecap="round"/>
    <path d="${dia}" fill="none" stroke="#EFE3CF" stroke-width="9" clip-path="url(#dCT)"/>
    ${[80, 110, 140, 280, 310, 340].map(x => { const t = (x - 58) / 304, y = (1 - t) * (1 - t) * side + 2 * t * (1 - t) * ctrl + t * t * side; return `<path d="M${x} ${y - 4} l3 8" stroke="#7A2A26" stroke-width="1" opacity=".6"/>`; }).join("")}
    ${arrow}
    <g font-size="13" font-weight="800" fill="${CO}" font-family="system-ui, sans-serif">
      <text x="230" y="30">Trachea</text><text x="6" y="200">Lung</text><text x="6" y="96">${rTxt}</text><text x="252" y="240" font-size="11">Heart</text>
      <text x="210" y="${side + 30}" text-anchor="middle">${dTxt}</text>
      <text x="210" y="-2" text-anchor="middle" fill="${inF ? "#5B8FE0" : outF ? "#E07A3F" : CO}" transform="translate(70 0)">${inF ? "Air in" : outF ? "Air out" : ""}</text></g>
  </svg>`;
}
function pressureGraph(hist, t, showVol) {
  const x = s => 46 + (s - (t - 10)) / 10 * 360, y = P => 110 - P / .6 * 84, yv = v => 196 - v * 170;
  const line = hist.map(([s, P], i) => `${i ? "L" : "M"}${x(s).toFixed(1)} ${y(P).toFixed(1)}`).join(" ");
  const vline = hist.map(([s, , v], i) => `${i ? "L" : "M"}${x(s).toFixed(1)} ${yv(v).toFixed(1)}`).join(" ");
  const last = hist[hist.length - 1] || [t, 0, 0];
  return `<svg viewBox="0 0 420 230" role="img" aria-label="Graph of lung pressure against time">
    <rect x="46" y="26" width="360" height="84" fill="#EAF3FF"/><rect x="46" y="110" width="360" height="84" fill="#FFF1E6"/>
    <g font-size="11" font-weight="800" fill="#7A6A66" font-family="system-ui, sans-serif">
      <text x="400" y="42" text-anchor="end">above atmospheric → air flows OUT</text><text x="400" y="186" text-anchor="end">below atmospheric → air flows IN</text>
      <text x="40" y="30" text-anchor="end">+0.6</text><text x="40" y="114" text-anchor="end">0</text><text x="40" y="198" text-anchor="end">−0.6</text>
      <text x="226" y="222" text-anchor="middle">Time (s) →</text><text x="12" y="112" transform="rotate(-90 12 112)" text-anchor="middle">Pressure (kPa, relative)</text></g>
    <path d="M46 110 H406" stroke="${CO}" stroke-width="2" stroke-dasharray="6 4"/><text x="50" y="104" font-size="10" fill="${CO}" font-family="system-ui, sans-serif">atmospheric pressure</text>
    <path d="M46 26 V194 H406" fill="none" stroke="${CO}" stroke-width="2.5"/>
    ${showVol ? `<path d="${vline}" fill="none" stroke="#3FA06B" stroke-width="3" opacity=".55" stroke-dasharray="2 3"/><text x="404" y="${yv(last[2]) - 6}" text-anchor="end" font-size="11" font-weight="800" fill="#3FA06B" font-family="system-ui, sans-serif">lung volume</text>` : ""}
    <path d="${line}" fill="none" stroke="#C0392B" stroke-width="3.5" stroke-linejoin="round"/>
    <circle cx="${x(last[0])}" cy="${y(last[1])}" r="6" fill="#C0392B" stroke="#fff" stroke-width="2"/>
  </svg>`;
}
function lungSteps(phase) {
  const IN = ["Diaphragm muscles contract: the diaphragm flattens (moves down)", "External intercostal muscles contract: ribs move upwards and outwards", "Volume of the chest cavity and lungs increases", "Pressure in the lungs falls below atmospheric pressure", "Air flows in through the trachea"];
  const OUT = ["Diaphragm muscles relax: the diaphragm domes upwards", "External intercostal muscles relax: ribs move downwards and inwards", "Volume of the chest cavity and lungs decreases", "Pressure in the lungs rises above atmospheric pressure", "Air flows out through the trachea"];
  if (phase === "rest") return `<p class="small"><b>⏸ Between breaths:</b> the pressure in the lungs equals atmospheric pressure, so no air moves (the graph sits on the dashed line).</p>`;
  return `<p class="small" style="margin:0"><b>${phase === "in" ? "⬇️ Inhalation" : "⬆️ Exhalation"}</b></p><ol class="small">${(phase === "in" ? IN : OUT).map(s => `<li>${s}</li>`).join("")}</ol>`;
}

/* ---------------- 2. 👁️ Pupil reflex ---------------- */
function pupilSim(root) {
  const st = { light: 50, r: 28, target: 28, delay: 0, pulse: 0, flash: 0 };
  root.innerHTML = `<div class="simgrid">
    <section class="card"><div id="pupScene" class="simsvg pupscene"></div>
      <label class="small"><b>💡 Light intensity</b> <input type="range" id="pLight" min="0" max="100" value="50" style="width:100%"></label>
      <div class="row simbtns"><button class="btn plain" data-pl="3">🌑 Dark room</button><button class="btn plain" data-pl="50">💡 Classroom</button><button class="btn plain" data-pl="100">☀️ Bright sun</button><button class="btn yellow" id="pTorch">🔦 Torch flash</button></div></section>
    <section class="card"><h3 style="margin:0">🧠 What's happening?</h3><div id="pupInfo"></div>
      <div class="arc" id="pupArc">${["👁️ Receptor<br><small>retina (light-sensitive cells)</small>", "⚡ Sensory neurone<br><small>optic nerve</small>", "🧠 Brain<br><small>(involuntary: no thinking)</small>", "⚡ Motor neurone", "💪 Effector<br><small>iris muscles</small>"].map((s, i) => `<span class="arcstep" data-arc="${i}">${s}</span>`).join('<span class="arcgo">→</span>')}</div>
      <p class="small muted">Try it in real life: cover one eye with your hand for 10 seconds, then uncover it while looking in a mirror. Watch the pupil shrink! 👀</p></section></div>`;
  const slider = root.querySelector("#pLight");
  const setLight = L => { st.light = L; slider.value = L; st.target = 44 - 32 * Math.pow(L / 100, .7); st.delay = .25; st.pulse = 1.2; };
  slider.oninput = () => setLight(Number(slider.value));
  root.querySelectorAll("[data-pl]").forEach(b => b.onclick = () => { SFX.tap(); setLight(Number(b.dataset.pl)); });
  root.querySelector("#pTorch").onclick = () => { SFX.click(); st.flash = 1.4; st.prevLight = st.light; setLight(100); };
  setLight(50); st.r = st.target;
  simProbe(() => ({ light: st.light, diam: +(st.r / 44 * 8).toFixed(1), circular: st.target < 28 ? "contract" : "relax", radial: st.target < 28 ? "relax" : "contract", torch: st.flash > 0, retina: Math.round(100 * (.08 + .92 * st.light / 100) * (st.r * st.r) / (44 * 44)) }));
  simLoop(root, dt => {
    if (st.flash > 0) { st.flash -= dt; if (st.flash <= 0) setLight(st.prevLight); }
    if (st.delay > 0) st.delay -= dt; else st.r += (st.target - st.r) * Math.min(1, dt / .35);
    st.pulse = Math.max(0, st.pulse - dt);
    root.querySelector("#pupScene").innerHTML = eyeFrontSvg(st.light, st.r);
    const bright = st.target < 28, into = Math.round(100 * (.08 + .92 * st.light / 100) * (st.r * st.r) / (44 * 44));
    root.querySelector("#pupInfo").innerHTML = `<div class="musc"><span class="${bright ? "on" : ""}">⭕ Circular muscles: <b>${bright ? "contract" : "relax"}</b></span><span class="${bright ? "" : "on"}">✳️ Radial muscles: <b>${bright ? "relax" : "contract"}</b></span></div>
      <p class="small">Pupil <b>${bright ? "constricts (smaller)" : "dilates (bigger)"}</b> → <b>${bright ? "less" : "more"}</b> light enters the eye. ${bright ? "This protects the retina from damage." : "This helps us see in dim light."}</p>
      <div class="small"><b>Light reaching the retina</b></div><div class="tprog"><i style="width:${clamp(into, 3, 100)}%"></i></div><p class="small muted">Pupil diameter ≈ ${(st.r / 44 * 8).toFixed(1)} mm</p>`;
    const k = st.pulse > 0 ? Math.floor((1.2 - st.pulse) / .24) : -1;
    root.querySelectorAll("[data-arc]").forEach((e, i) => e.classList.toggle("on", i === k));
  });
}
function eyeFrontSvg(L, r) {
  const bg = `hsl(45, ${20 + L * .6}%, ${8 + L * .85}%)`;
  let fib = "";
  for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); fib += `M${(180 + (r + 3) * c).toFixed(1)} ${(120 + (r + 3) * s).toFixed(1)} L${(180 + 70 * c).toFixed(1)} ${(120 + 70 * s).toFixed(1)} `; }
  const bright = r < 28;
  return `<svg viewBox="0 0 360 240" role="img" aria-label="Eye with pupil diameter ${(r / 44 * 8).toFixed(1)} millimetres">
    <rect width="360" height="240" rx="16" fill="${bg}"/>
    ${L > 60 ? `<g opacity="${(L - 60) / 40}">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${40 + i * 40} 0 L${60 + i * 40} 30" stroke="#FFE27A" stroke-width="6" stroke-linecap="round"/>`).join("")}</g>` : ""}
    <path d="M6 120 Q180 -34 354 120 Q180 268 6 120Z" fill="#F2CDB4" opacity=".85"/>
    <path d="M20 120 Q180 -8 340 120 Q180 248 20 120Z" fill="#FFFDF8" stroke="#7A5040" stroke-width="3.5"/>
    <path d="M40 112 Q70 104 96 110 M300 110 Q320 116 334 122 M48 132 Q72 138 92 132 M296 134 Q314 132 330 126" fill="none" stroke="#E8A0A0" stroke-width="1.2"/>
    <clipPath id="eyeClip"><path d="M20 120 Q180 -8 340 120 Q180 248 20 120Z"/></clipPath>
    <g clip-path="url(#eyeClip)"><circle cx="180" cy="120" r="72" fill="url(#irisG)"/>
      <path d="${fib}" stroke="${bright ? "#5A7FB0" : "#C0392B"}" stroke-width="${bright ? 1.4 : 2.4}" opacity=".9"/>
      ${[5, 10, 15].map(d => `<circle cx="180" cy="120" r="${r + d}" fill="none" stroke="${bright ? "#C0392B" : "#5A7FB0"}" stroke-width="${bright ? 2.6 : 1.2}" opacity=".9"/>`).join("")}
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(k => { const a = k / 12 * Math.PI * 2 + .2, rr = r + 12 + (k % 3) * 9; return `<ellipse cx="${(180 + rr * Math.cos(a)).toFixed(1)}" cy="${(120 + rr * Math.sin(a)).toFixed(1)}" rx="4" ry="2.2" fill="#3F5F8C" opacity=".45" transform="rotate(${(a * 57.3).toFixed(0)} ${(180 + rr * Math.cos(a)).toFixed(1)} ${(120 + rr * Math.sin(a)).toFixed(1)})"/>`; }).join("")}
      <circle cx="180" cy="120" r="72" fill="none" stroke="#243A5C" stroke-width="5"/><circle cx="180" cy="120" r="${r}" fill="#15121A"/><circle cx="${180 + r * .35}" cy="${120 - r * .4}" r="${Math.max(3, r * .22)}" fill="#fff" opacity=".85"/></g>
    <path d="M20 120 Q180 -8 340 120" fill="none" stroke="#5A3A2E" stroke-width="5" stroke-linecap="round"/>
    ${Array.from({ length: 22 }, (_, k) => { const t = .08 + k * .04, x = (1 - t) * (1 - t) * 20 + 2 * t * (1 - t) * 180 + t * t * 340, y = (1 - t) * (1 - t) * 120 + 2 * t * (1 - t) * -8 + t * t * 120; return `<path d="M${x.toFixed(1)} ${y.toFixed(1)} q${(t - .5) * 14} -12 ${(t - .5) * 22} -14" fill="none" stroke="#3A2A24" stroke-width="1.8" stroke-linecap="round"/>`; }).join("")}
    <path d="M40 60 Q180 -22 320 60" fill="none" stroke="#C99A80" stroke-width="2" opacity=".7"/>
    <defs><radialGradient id="irisG" cx=".5" cy=".5" r=".5"><stop offset=".25" stop-color="#9A7B4A"/><stop offset=".45" stop-color="#6F97C9"/><stop offset=".85" stop-color="#4E78AE"/><stop offset="1" stop-color="#2F4E7A"/></radialGradient></defs>
    <g font-size="12" font-weight="800" font-family="system-ui, sans-serif" fill="${L < 35 ? "#fff" : CO}"><text x="14" y="228">Iris</text><text x="346" y="228" text-anchor="end">Pupil: ${bright ? "constricted" : "dilated"}</text></g>
  </svg>`;
}

/* ---------------- 3. 🔍 Focusing, short sight, long sight and glasses ---------------- */
const EYE_D = { normal: 17, short: 18.3, long: 16.3 };      // eyeball length (mm) from lens to retina
const P_MIN = 1000 / 17, P_MAX = P_MIN + 4.3;               // eye lens power range (dioptres): relaxed → fully accommodated
const GLASS = { none: 0, concave: -4.4, convex: 2.46 };      // spectacle power (D), 12 mm in front of the eye
function lensSim(root) {
  const st = { obj: "far", eye: "normal", gl: "none", P: P_MIN };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="lensSvg" class="simsvg"></div>
      <div class="simctl"><div><b class="small">Look at</b>${segBtns("lo", [["far", "🌳 Distant tree"], ["near", "📖 Book (25 cm)"]], st.obj)}</div>
        <div><b class="small">Eye</b>${segBtns("le", [["normal", "🙂 Normal"], ["short", "👓 Short sight"], ["long", "🔭 Long sight"]], st.eye)}</div>
        <div><b class="small">Glasses</b>${segBtns("lg", [["none", "None"], ["concave", "Concave )("], ["convex", "Convex ()"]], st.gl)}</div></div></section>
    <section class="card"><h3 style="margin:0">👀 What ${esc(palName())} sees</h3><div id="lensView" class="lensview"></div><div id="lensInfo"></div></section></div>`;
  const seg = (name, key) => root.querySelectorAll(`[data-${name}]`).forEach(b => b.onclick = () => { SFX.tap(); st[key] = b.dataset[name]; root.querySelectorAll(`[data-${name}]`).forEach(x => x.setAttribute("aria-checked", x === b)); });
  seg("lo", "obj"); seg("le", "eye"); seg("lg", "gl");
  simProbe(() => ({ obj: st.obj, eye: st.eye, glasses: st.gl, sharp: !!st.sharp, focus: st.sharp ? "on" : st.off < 0 ? "front" : "behind", thick: !!st.thick, accom: Math.round(100 * (st.P - P_MIN) / (P_MAX - P_MIN)), maxed: !!st.maxed }));
  let key = "";
  simLoop(root, dt => {
    const D = EYE_D[st.eye], Pg = GLASS[st.gl];
    const trace = (P, y0) => {       // paraxial ray trace in mm: returns heights and slopes
      const u = 250, xg = 12;
      let y = y0, th = st.obj === "far" ? 0 : y0 / (u - xg);
      const yg = y; if (Pg) th -= yg * Pg / 1000;
      const ye = yg + th * xg; th -= ye * P / 1000;
      return { yg, ye, th, yr: ye + th * D, xf: ye / -th };
    };
    const probe = trace(P_MIN, 2), th1 = (probe.ye - probe.yg) / 12;     // slope of the ray entering the eye
    const need = 1000 * (th1 / probe.ye + 1 / D);                          // lens power that would focus it on the retina
    const want = clamp(need, P_MIN, P_MAX);
    st.P += (want - st.P) * Math.min(1, dt / .45);
    const rays = [2.4, 1.2, -1.2, -2.4].map(y => trace(st.P, y)), xf = rays[0].xf, off = xf - D, blur = Math.abs(rays[0].yr);
    root.querySelector("#lensSvg").innerHTML = eyeSideSvg(st, rays, D, xf);
    const k = [st.obj, st.eye, st.gl, Math.round(st.P * 10), Math.round(off * 20)].join();
    if (k === key) return; key = k;
    const acc = (st.P - P_MIN) / (P_MAX - P_MIN), sharp = Math.abs(off) < .08;
    st.sharp = sharp; st.off = off; st.thick = acc > .15; st.maxed = (st.P >= P_MAX - .01 && need > P_MAX + .05) || (st.P <= P_MIN + .01 && need < P_MIN - .05);
    root.querySelector("#lensView").innerHTML = viewSvg(st.obj, Math.min(8, blur * 6));
    const thick = acc > .15;
    root.querySelector("#lensInfo").innerHTML = `
      <p class="lensres ${sharp ? "ok" : "no"}">${sharp ? "✅ Image focused on the retina: clear!" : off < 0 ? "❌ Image focuses in FRONT of the retina: blurred" : "❌ Image focuses BEHIND the retina: blurred"}</p>
      <ul class="small">
        <li>Ciliary muscles: <b>${thick ? "contract" : "relax"}</b></li>
        <li>Suspensory ligaments: <b>${thick ? "slacken (loose)" : "tighten (pulled)"}</b></li>
        <li>Lens: <b>${thick ? "thicker, more convex" : "thinner, less convex"}</b> → <b>${thick ? "more" : "less"}</b> refraction</li>
        ${st.P >= P_MAX - .01 && need > P_MAX + .05 ? `<li>⚠️ The lens is already as thick as it can get, but it's still not enough!</li>` : ""}
        ${st.P <= P_MIN + .01 && need < P_MIN - .05 ? `<li>⚠️ The lens is already as thin as it can get, but it still bends the light too much!</li>` : ""}
      </ul>
      ${eyeTip(st, sharp)}`;
  });
}
function eyeTip(st, sharp) {
  if (st.eye === "short") return `<p class="small">👓 <b>Short sight (myopia):</b> the eyeball is a bit too long (or the lens too strong), so light from <b>distant</b> objects focuses in front of the retina. ${st.gl === "concave" ? (sharp ? "The <b>concave lens</b> diverges the rays first, so they focus on the retina. ✨" : "") : st.gl === "convex" ? "A convex lens makes it even worse! Try a concave lens." : "Try a <b>concave (diverging)</b> lens."}</p>`;
  if (st.eye === "long") return `<p class="small">🔭 <b>Long sight (hyperopia):</b> the eyeball is a bit too short (or the lens too weak), so light from <b>near</b> objects focuses behind the retina. ${st.gl === "convex" ? (sharp ? "The <b>convex lens</b> converges the rays first, so they focus on the retina. ✨" : "") : st.gl === "concave" ? "A concave lens makes it even worse! Try a convex lens." : "Try a <b>convex (converging)</b> lens."}</p>`;
  return `<p class="small">🙂 A normal eye changes the thickness of its lens (accommodation) to focus both distant and near objects on the retina. ${st.gl === "none" ? "" : sharp ? "With glasses on, the lens has to change shape more to cope. A normal eye doesn't need glasses." : "It can't make up for these glasses here, so the image is blurred. A normal eye doesn't need glasses!"}</p>`;
}
function eyeSideSvg(st, rays, D, xf) {
  const S = 15, XE = 330, CY = 150, XR = XE + D * S, XG = XE - 12 * S, Y = y => CY - y * 13;
  const thick = 7 + 13 * clamp((st.P - P_MIN) / (P_MAX - P_MIN), 0, 1), acc = thick > 9;
  const ex0 = XE - 34, cx = (ex0 + XR) / 2, rx = (XR - ex0) / 2;
  const lig = acc ? (s => `<path d="M${XE} ${CY + s * 40} q-4 ${s * 3} 0 ${s * 6} q4 ${s * 3} 0 ${s * 6}" stroke="#B89A7A" stroke-width="2" fill="none"/>`) : (s => `<path d="M${XE} ${CY + s * 40} L${XE} ${CY + s * 54}" stroke="#B89A7A" stroke-width="2"/>`);
  const cil = s => `<ellipse cx="${XE}" cy="${CY + s * 62}" rx="${acc ? 13 : 9}" ry="${acc ? 10 : 7}" fill="${acc ? "#E0457B" : "#E9A0B0"}" stroke="${CO}" stroke-width="2"/>`;
  const objX = 18, far = st.obj === "far";
  let rp = "";
  rays.forEach(r => {
    const start = far ? `M${objX + 30} ${Y(r.yg)}` : `M${objX + 16} ${CY}`;
    const endY = Y(r.yr);
    rp += `<path d="${start} L${st.gl !== "none" ? `${XG} ${Y(r.yg)} L` : ""}${XE} ${Y(r.ye)} L${XR} ${endY}" fill="none" stroke="#F2A900" stroke-width="2.4" stroke-linejoin="round"/>`;
    if (xf > D && isFinite(xf)) { const xe = Math.min(640, XE + xf * S); rp += `<path d="M${XR} ${endY} L${xe} ${Y(r.ye + r.th * (xe - XE) / S)}" stroke="#F2A900" stroke-width="2" stroke-dasharray="4 4" opacity=".7"/>`; }
  });
  const fx = XE + xf * S, fOK = isFinite(xf) && fx > XE && fx < 640;
  const glasses = st.gl === "concave" ? `<path d="M${XG - 10} ${CY - 50} Q${XG - 2} ${CY} ${XG - 10} ${CY + 50} L${XG + 10} ${CY + 50} Q${XG + 2} ${CY} ${XG + 10} ${CY - 50}Z" fill="rgba(160,196,255,.5)" stroke="${CO}" stroke-width="2.5"/>`
    : st.gl === "convex" ? `<path d="M${XG} ${CY - 50} Q${XG - 18} ${CY} ${XG} ${CY + 50} Q${XG + 18} ${CY} ${XG} ${CY - 50}Z" fill="rgba(160,196,255,.5)" stroke="${CO}" stroke-width="2.5"/>` : "";
  return `<svg viewBox="0 0 640 300" role="img" aria-label="Ray diagram of the eye">
    <rect width="640" height="300" rx="14" fill="#FBF7EE"/>
    ${far ? `<g transform="translate(${objX} ${CY - 34})"><rect x="11" y="30" width="8" height="30" fill="#8C5A3C"/><circle cx="15" cy="22" r="20" fill="#7CC47A" stroke="${CO}" stroke-width="2"/></g><text x="${objX}" y="${CY + 52}" font-size="11" font-weight="800" fill="${CO}" font-family="system-ui, sans-serif">far away</text>`
      : `<g transform="translate(${objX} ${CY - 16})"><rect x="0" y="0" width="16" height="32" rx="2" fill="#E0457B" stroke="${CO}" stroke-width="2"/><path d="M4 8 h8 M4 14 h8 M4 20 h8" stroke="#fff" stroke-width="2"/></g><text x="${objX}" y="${CY + 34}" font-size="11" font-weight="800" fill="${CO}" font-family="system-ui, sans-serif">25 cm (not to scale)</text>`}
    <path d="M${XR - 4} ${CY + 30} C${XR + 30} ${CY + 40} ${XR + 40} ${CY + 80} 640 ${CY + 96}" stroke="#B8902E" stroke-width="22" fill="none"/><path d="M${XR - 4} ${CY + 30} C${XR + 30} ${CY + 40} ${XR + 40} ${CY + 80} 640 ${CY + 96}" stroke="#F2D06B" stroke-width="16" fill="none"/>
    <ellipse cx="${cx}" cy="${CY}" rx="${rx}" ry="118" fill="#FFFDF8" stroke="#A8998A" stroke-width="7"/>
    <ellipse cx="${cx}" cy="${CY}" rx="${rx - 5}" ry="113" fill="rgba(230,242,255,.55)" stroke="#5A3A2E" stroke-width="2.5"/>
    <path d="M${XE - 10} ${CY - 60} V${CY - 38} M${XE - 10} ${CY + 38} V${CY + 60}" stroke="#4E78AE" stroke-width="6" stroke-linecap="round"/>
    <g font-size="10" font-weight="700" fill="#7A6A66" font-family="system-ui, sans-serif"><text x="${XE - 14}" y="${CY - 104}" text-anchor="end">iris</text><text x="${cx}" y="${CY - 100}" text-anchor="middle">vitreous humour</text><text x="${XR - 20}" y="${CY + 112}" text-anchor="end">optic nerve →</text><text x="${cx + 60}" y="${CY - 124}">sclera</text></g>
    <path d="M${XR - 6} ${CY - 100} Q${XR + 6} ${CY} ${XR - 6} ${CY + 100}" fill="none" stroke="#E0457B" stroke-width="7" opacity=".55"/><text x="${Math.min(XR, 600)}" y="${CY + 136}" font-size="11" font-weight="800" fill="${CO}" text-anchor="middle" font-family="system-ui, sans-serif">retina</text>
    <path d="M${ex0 + 4} ${CY - 60} Q${ex0 - 22} ${CY} ${ex0 + 4} ${CY + 60}" fill="rgba(211,228,255,.6)" stroke="${CO}" stroke-width="2.5"/><text x="${ex0 - 16}" y="${CY - 66}" font-size="11" font-weight="800" fill="${CO}" font-family="system-ui, sans-serif">cornea</text>
    ${lig(-1)}${lig(1)}${cil(-1)}${cil(1)}
    <ellipse cx="${XE}" cy="${CY}" rx="${thick.toFixed(1)}" ry="40" fill="rgba(255,236,170,.85)" stroke="${CO}" stroke-width="2.5"/>
    <g font-size="11" font-weight="800" fill="${CO}" font-family="system-ui, sans-serif"><text x="${XE + 18}" y="${CY - 64}">ciliary muscle</text><text x="${XE + 18}" y="${CY - 44}">suspensory ligament</text><text x="${XE - 6}" y="${CY + 88}" text-anchor="middle">lens</text></g>
    ${glasses}${st.gl !== "none" ? `<text x="${XG}" y="${CY + 70}" font-size="11" font-weight="800" fill="${CO}" text-anchor="middle" font-family="system-ui, sans-serif">${st.gl} lens</text>` : ""}
    <path d="M0 ${CY} H640" stroke="${CO}" stroke-width="1" stroke-dasharray="3 5" opacity=".35"/>
    ${rp}
    ${fOK ? `<circle cx="${fx}" cy="${CY}" r="5" fill="#C0392B" stroke="#fff" stroke-width="2"/><text x="${fx}" y="${CY - 10}" font-size="11" font-weight="800" fill="#C0392B" text-anchor="middle" font-family="system-ui, sans-serif">focus</text>` : ""}
  </svg>`;
}
function viewSvg(obj, blur) {
  const id = "vb" + (++clipN);
  return `<svg viewBox="0 0 220 140" role="img" aria-label="${blur < .6 ? "Sharp" : "Blurred"} view">
    <defs><filter id="${id}"><feGaussianBlur stdDeviation="${blur.toFixed(2)}"/></filter></defs>
    <rect width="220" height="140" rx="12" fill="${obj === "far" ? "#D6ECFA" : "#FFF6E4"}"/>
    <g filter="url(#${id})">${obj === "far"
      ? `<rect x="0" y="100" width="220" height="40" fill="#A8D5A2"/><rect x="100" y="64" width="14" height="40" fill="#8C5A3C"/><circle cx="107" cy="54" r="32" fill="#5FB35C"/><circle cx="178" cy="28" r="14" fill="#FFE27A"/>`
      : `<rect x="30" y="16" width="160" height="108" rx="6" fill="#fff" stroke="${CO}" stroke-width="2"/><text x="110" y="52" text-anchor="middle" font-size="18" font-weight="900" fill="${CO}" font-family="system-ui, sans-serif">Biology</text>${[70, 84, 98, 112].map(y => `<path d="M48 ${y} h124" stroke="#9A8C88" stroke-width="4" stroke-linecap="round"/>`).join("")}`}</g>
  </svg>`;
}

/* ---------------- 4. 👂 Hearing ---------------- */
SIM_Q.ear = [["Which structure contains the receptors (hair cells) that detect sound?", ["The cochlea", "The eardrum", "The ear ossicles", "The semicircular canals"], "Hair cells in the cochlea are the receptors; they turn vibrations into nerve impulses."],
  ["What is the function of the ear ossicles?", ["To amplify vibrations and pass them to the oval window", "To detect movement of the head", "To equalise air pressure on both sides of the eardrum", "To change vibrations into nerve impulses"], "The hammer, anvil and stirrup act as levers that amplify the vibrations of the eardrum."]];
SIM_Q.membrane = [["Why is the model called 'fluid'?", ["The phospholipids and proteins can move sideways within the membrane", "The membrane is made mostly of water", "Water flows freely through every part of it", "It is liquid at every temperature"], "Molecules drift and swap places sideways, so the membrane is flexible, not a rigid wall."],
  ["How is active transport different from facilitated diffusion?", ["It moves substances against the concentration gradient, using energy (ATP) from respiration", "It does not need any membrane proteins", "It only moves water", "It moves substances down the concentration gradient"], "Both can use carrier proteins, but only active transport uses ATP to move substances from low to high concentration."]];
const EAR_STEPS = ["Pinna collects sound waves", "Waves travel along the ear canal", "Eardrum vibrates", "Ossicles (hammer, anvil, stirrup) amplify the vibrations", "Stirrup pushes the oval window", "Fluid in the cochlea vibrates", "Hair cells (receptors) are stimulated → nerve impulses", "Auditory nerve carries impulses to the brain → we hear!"];
let earAudio = null;
function playTone(f, loud) {
  try {
    earAudio = earAudio || new (window.AudioContext || window.webkitAudioContext)();
    const o = earAudio.createOscillator(), g = earAudio.createGain(), t = earAudio.currentTime, v = .015 + .09 * loud / 100;
    o.frequency.value = f; o.type = "sine"; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .05); g.gain.setValueAtTime(v, t + 1.1); g.gain.linearRampToValueAtTime(0, t + 1.3);
    o.connect(g).connect(earAudio.destination); o.start(t); o.stop(t + 1.35);
  } catch (e) {}
}
function earSim(root) {
  const st = { fv: 50, f: 632, loud: 60, on: true, dmg: false, ph: 0, imp: [], step: 0, stepT: 0 };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="earSvg" class="simsvg"></div><div id="cochSvg" class="simsvg"></div></section>
    <section class="card"><h3 style="margin:0">🎚️ Sound controls</h3>
      <label class="small"><b>Pitch (frequency): <span id="eF"></span></b><input type="range" id="eFreq" min="0" max="100" value="50" style="width:100%"></label>
      <div class="row simbtns"><button class="btn plain" data-ef="100">🥁 Drum 100 Hz</button><button class="btn plain" data-ef="500">🗣️ Voice 500 Hz</button><button class="btn plain" data-ef="4000">🐦 Bird 4 kHz</button><button class="btn plain" data-ef="15000">📱 Ringtone 15 kHz</button></div>
      <label class="small"><b>Loudness: <span id="eL"></span></b><input type="range" id="eLoud" min="0" max="100" value="60" style="width:100%"></label>
      <div class="row simbtns"><button class="btn yellow" id="ePlay">🎵 Hear it</button><button class="btn plain" id="eOn">⏸ Pause sound waves</button></div>
      <label class="small chk"><input type="checkbox" id="eDmg"> 🎧 Hearing damage (years of very loud music)</label>
      <p class="small muted" style="margin:0">Keep your volume low. Humans hear about 20 Hz to 20,000 Hz; the top of the range drops as we get older.</p>
      <div id="earSteps" class="earsteps"></div><div id="earNote"></div></section></div>`;
  const fS = root.querySelector("#eFreq"), lS = root.querySelector("#eLoud");
  const setF = v => { st.fv = v; st.f = Math.round(20 * Math.pow(1000, v / 100)); fS.value = v; root.querySelector("#eF").textContent = st.f >= 1000 ? (st.f / 1000).toFixed(1) + " kHz" : st.f + " Hz"; };
  const setL = v => { st.loud = v; lS.value = v; root.querySelector("#eL").textContent = `${Math.round(20 + v * .8)} dB ${v > 85 ? "⚠️ can damage hair cells!" : ""}`; };
  fS.oninput = () => setF(Number(fS.value)); lS.oninput = () => setL(Number(lS.value));
  root.querySelectorAll("[data-ef]").forEach(b => b.onclick = () => { SFX.tap(); setF(100 * Math.log(Number(b.dataset.ef) / 20) / Math.log(1000)); });
  root.querySelector("#ePlay").onclick = () => { st.on = true; st.played = (st.played || 0) + 1; root.querySelector("#eOn").textContent = "⏸ Pause sound waves"; playTone(st.f, st.loud); };
  root.querySelector("#eOn").onclick = () => { SFX.tap(); st.on = !st.on; root.querySelector("#eOn").textContent = st.on ? "⏸ Pause sound waves" : "▶ Start sound waves"; };
  root.querySelector("#eDmg").onchange = e => { st.dmg = e.target.checked; };
  setF(50); setL(60);
  simProbe(() => ({ freq: st.f, db: Math.round(20 + st.loud * .8), waves: st.on, damage: st.dmg, heard: !!st.heard, region: st.fv > 68 ? "base" : st.fv < 34 ? "apex" : "middle", played: st.played || 0 }));
  let lastNote = "";
  simLoop(root, dt => {
    const A = st.on ? st.loud / 100 : 0, rate = 1.2 + 2.6 * st.fv / 100;          // visual vibration rate (slowed down to be seen)
    st.ph += dt * rate * Math.PI * 2;
    const pos = 1 - st.fv / 100, dead = st.dmg && pos < .32, heard = A > .02 && !dead;
    st.heard = heard; st.A = A;
    if (heard && Math.random() < dt * (2 + 14 * A)) st.imp.push(0);
    st.imp = st.imp.map(x => x + dt * .9).filter(x => x < 1);
    if (A > .02) { st.stepT += dt; if (st.stepT > .55) { st.stepT = 0; st.step = (st.step + 1) % (heard ? 8 : 7); } }
    root.querySelector("#earSvg").innerHTML = earSvg(st, A);
    root.querySelector("#cochSvg").innerHTML = cochleaSvg(st, A, pos, heard);
    root.querySelector("#earSteps").innerHTML = `<ol class="small">${EAR_STEPS.map((s, i) => `<li class="${A > .02 && i === st.step ? "on" : ""} ${!heard && i >= 6 && A > .02 ? "off" : ""}">${s}</li>`).join("")}</ol>`;
    const note = A <= .02 ? "🤫 Silence: nothing vibrates, so no impulses are sent." : dead ? "❌ The hair cells for this high pitch are damaged, so no impulses reach the brain: this pitch can't be heard. Damaged hair cells do not grow back!" : `✅ ${pos < .33 ? "High" : pos > .66 ? "Low" : "Medium"} pitch: hair cells near the <b>${pos < .33 ? "base" : pos > .66 ? "tip (apex)" : "middle"}</b> of the cochlea vibrate most. ${A > .85 ? "Very loud sounds make many more impulses per second, and can damage hair cells." : "Louder sounds → more impulses per second."}`;
    if (note !== lastNote) { lastNote = note; root.querySelector("#earNote").innerHTML = `<p class="lensres ${dead || A <= .02 ? "no" : "ok"}" style="font-weight:600">${note}</p>`; }
  });
}
function earSvg(st, A) {
  const v = Math.sin(st.ph) * A, d = v * 5, lam = 70 - 50 * st.fv / 100;
  let waves = "";
  for (let x = 98; x < 244; x += 5) { const o = .5 + .5 * Math.cos(2 * Math.PI * (x - st.ph / (2 * Math.PI) * lam) / lam); waves += `<path d="M${x} 128 v24" stroke="#5B8FE0" stroke-width="2.4" opacity="${(A * o * .9).toFixed(2)}"/>`; }
  const lab = (x, y, t, a = "start") => `<text x="${x}" y="${y}" text-anchor="${a}">${t}</text>`;
  let spiral = ""; for (let a2 = 0; a2 < 5.2 * Math.PI; a2 += .18) { const r = 38 - a2 * 2.05; spiral += `${spiral ? "L" : "M"}${(440 + r * Math.cos(a2)).toFixed(1)} ${(174 + r * Math.sin(a2)).toFixed(1)} `; }
  const bone = Array.from({ length: 60 }, (_, i) => `<circle cx="${112 + (i * 67) % 480}" cy="${14 + (i * 41) % 270}" r="1.3" fill="#D8C6A6"/>`).join("");
  return `<svg viewBox="0 0 640 300" role="img" aria-label="Cross-section of the ear">
    <defs><linearGradient id="erC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE2D4"/><stop offset="1" stop-color="#EFC4AE"/></linearGradient>
      <radialGradient id="erK" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#EAF4FF"/><stop offset="1" stop-color="#BFD8F2"/></radialGradient></defs>
    <rect width="640" height="300" rx="14" fill="#FBF7EE"/>
    <path d="M110 0 H640 V300 H110 Q120 150 110 0Z" fill="#F2E7D2"/>${bone}
    <path d="M78 34 C28 40 12 104 24 152 C34 198 62 236 96 248 C114 252 120 234 108 220 C96 204 86 196 90 176 L94 158 L94 122 C100 92 110 60 78 34Z" fill="#F2C4A8" stroke="#B07A5C" stroke-width="2.4"/>
    <path d="M70 58 C44 70 38 122 50 160 C58 184 72 196 82 190" fill="none" stroke="#D59C7E" stroke-width="3" stroke-linecap="round"/><path d="M76 96 C62 110 64 140 80 150" fill="none" stroke="#D59C7E" stroke-width="2.2"/>
    <path d="M92 122 H250 V158 H92Z" fill="url(#erC)" stroke="#B07A5C" stroke-width="2"/>${[100, 108, 116].map(x => `<path d="M${x} 124 l3 6 M${x + 2} 156 l3 -6" stroke="#8C6A52" stroke-width="1"/>`).join("")}<circle cx="132" cy="154" r="2.2" fill="#C9A24A"/><circle cx="146" cy="126" r="1.8" fill="#C9A24A"/>${waves}
    <path d="M250 84 Q306 76 368 86 Q380 140 368 196 Q306 206 250 196Z" fill="#F7E3E6" stroke="#B89A8C" stroke-width="2"/>
    <path d="M318 196 Q340 250 396 288" stroke="#E8B9C2" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M318 196 Q340 250 396 288" stroke="#B07A8A" stroke-width="1.5" fill="none" opacity=".6"/>
    <path d="M${252 + d} 106 Q${238 + d * 1.6} 140 ${252 + d} 174" fill="none" stroke="#B790A0" stroke-width="5"/><path d="M${252 + d} 106 Q${238 + d * 1.6} 140 ${252 + d} 174" fill="none" stroke="#F4E6EE" stroke-width="2"/>
    <g transform="translate(${d * .7} 0)" fill="#FFF6E4" stroke="#8C7A66" stroke-width="1.6" stroke-linejoin="round">
      <path d="M${248 + d * .3} 146 L262 112 Q262 98 273 96 Q284 98 282 110 Q278 119 267 117 L${254 + d * .3} 148Z"/>
      <path d="M276 100 Q292 90 306 99 Q313 110 302 118 L313 136 Q308 141 301 133 Q289 121 280 114Z"/>
      <path d="M313 134 Q334 118 356 126 L356 154 Q334 160 313 140" fill="none" stroke-width="3.2"/><rect x="354" y="124" width="7" height="32" rx="2"/></g>
    <ellipse cx="${367 + d * .6}" cy="140" rx="3.5" ry="14" fill="#A0C4FF" stroke="#5B7FB0" stroke-width="1.5"/><ellipse cx="370" cy="178" rx="3" ry="9" fill="#C9DDF5" stroke="#5B7FB0" stroke-width="1.2"/><path d="M366 154 L300 248" stroke="${CO}" stroke-width="1.4"/><circle cx="366" cy="154" r="2.4" fill="${CO}"/>
    <g fill="none"><ellipse cx="398" cy="64" rx="18" ry="30" stroke="#7A6AA8" stroke-width="9"/><ellipse cx="398" cy="64" rx="18" ry="30" stroke="#E2D8F6" stroke-width="5.5"/>
      <ellipse cx="436" cy="74" rx="30" ry="11" stroke="#7A6AA8" stroke-width="9"/><ellipse cx="436" cy="74" rx="30" ry="11" stroke="#E2D8F6" stroke-width="5.5"/>
      <ellipse cx="418" cy="52" rx="24" ry="14" stroke="#7A6AA8" stroke-width="9" transform="rotate(35 418 52)"/><ellipse cx="418" cy="52" rx="24" ry="14" stroke="#E2D8F6" stroke-width="5.5" transform="rotate(35 418 52)"/></g>
    <ellipse cx="404" cy="112" rx="24" ry="16" fill="#E2D8F6" stroke="#7A6AA8" stroke-width="2"/>
    <circle cx="440" cy="174" r="${46 + Math.abs(v) * 2}" fill="url(#erK)" stroke="#5B7FB0" stroke-width="2.4"/>
    <path d="${spiral}" fill="none" stroke="#4A6FA8" stroke-width="11" stroke-linecap="round"/><path d="${spiral}" fill="none" stroke="#9EC3EC" stroke-width="7" stroke-linecap="round"/>
    <path d="M420 118 C450 140 460 160 466 178" stroke="#E0B44A" stroke-width="5" fill="none"/>
    <path d="M466 178 C520 176 552 186 604 190" stroke="#B8902E" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M466 178 C520 176 552 186 604 190" stroke="#F2D06B" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M470 176 C520 174 552 184 602 188 M470 181 C520 179 552 189 602 193" stroke="#D9B24A" stroke-width="1" fill="none"/>
    ${st.imp.map(x => `<circle cx="${466 + x * 136}" cy="${178 + x * 12}" r="5" fill="#FF6B6B" stroke="#fff" stroke-width="1.5"/>`).join("")}
    <g font-size="12" font-weight="800" fill="${CO}" font-family="system-ui, sans-serif">
      ${lab(14, 24, "Pinna")}${lab(120, 116, "Ear canal")}${lab(236, 78, "Eardrum", "middle")}${lab(300, 72, "Ossicles", "middle")}${lab(296, 256, "Oval window", "end")}
      ${lab(454, 30, "Semicircular canals")}${lab(440, 240, "Cochlea", "middle")}${lab(604, 212, "Auditory nerve →", "end")}${lab(612, 184, "🧠", "end")}${lab(388, 298, "Eustachian tube", "end")}${lab(160, 30, "Temporal bone")}</g>
  </svg>`;
}
function cochleaSvg(st, A, pos, heard) {
  const x0 = 60, x1 = 600, n = 44;
  let mem = "", hairs = "";
  for (let i = 0; i <= 80; i++) { const p = i / 80, env = Math.exp(-Math.pow((p - pos) / .09, 2)), y = 70 - A * 22 * env * Math.sin(st.ph - p * 18); mem += `${i ? "L" : "M"}${(x0 + p * (x1 - x0)).toFixed(1)} ${y.toFixed(1)} `; }
  for (let i = 0; i < n; i++) {
    const p = (i + .5) / n, x = x0 + p * (x1 - x0), env = Math.exp(-Math.pow((p - pos) / .09, 2)), dead = st.dmg && p < .32, act = !dead && A > .02 && env > .45;
    const y = 70 - A * 22 * env * Math.sin(st.ph - p * 18);
    hairs += dead ? `<path d="M${x} ${y - 2} l-6 -6" stroke="#A89F9A" stroke-width="3" stroke-linecap="round"/>` : `<path d="M${x} ${y - 2} v-11" stroke="${act ? "#FF6B6B" : "#8FB8E8"}" stroke-width="${act ? 4 : 2.5}" stroke-linecap="round"/>`;
  }
  return `<svg viewBox="0 0 640 132" role="img" aria-label="Uncoiled cochlea">
    <rect width="640" height="132" rx="14" fill="#E7F3FF"/>
    <text x="320" y="20" text-anchor="middle" font-size="12" font-weight="800" fill="${CO}" font-family="system-ui, sans-serif">The cochlea, uncoiled: which hair cells vibrate?</text>
    <path d="${mem}" fill="none" stroke="${CO}" stroke-width="3"/>${hairs}
    ${st.dmg ? `<rect x="${x0}" y="96" width="${.32 * (x1 - x0)}" height="8" rx="4" fill="#A89F9A" opacity=".6"/>` : ""}
    <g font-size="11" font-weight="800" fill="${CO}" font-family="system-ui, sans-serif"><text x="${x0}" y="118">Base · HIGH pitch</text><text x="${x1}" y="118" text-anchor="end">Apex (tip) · LOW pitch</text>
      <text x="320" y="118" text-anchor="middle" fill="${heard ? "#C0392B" : "#7A6A66"}">${heard ? "→ impulses to the brain" : A > .02 ? "no impulses" : ""}</text></g>
  </svg>`;
}

/* ---------------- 5. 🫧 Cell membrane: the fluid mosaic model ---------------- */
const MEM_PARTS = {
  phospholipid: ["Phospholipid", "The main building block. Two layers of phospholipids form the bilayer."],
  head: ["Hydrophilic head", "The phosphate 'head' is water-loving, so heads face the watery outside and the cytoplasm."],
  tail: ["Hydrophobic tails", "Two fatty-acid 'tails' are water-hating, so they point inwards, away from water. Water-soluble substances and ions can't pass through this oily middle easily."],
  channel: ["Channel protein", "A protein with a water-filled pore. Specific ions and water molecules pass through it by diffusion (facilitated diffusion)."],
  carrier: ["Carrier protein", "Binds a specific molecule (like glucose), changes shape and releases it on the other side. Used in facilitated diffusion and in active transport (with ATP)."],
  glyco: ["Glycoprotein", "A protein with a carbohydrate chain on the outside. Used for cell recognition, like a name tag."],
  chol: ["Cholesterol", "Sits between phospholipid tails and keeps the membrane from becoming too fluid or too stiff."]
};
const MEM_MOVE = {
  o2: { l: "🫧 O₂ / CO₂", c: "#E9573F", how: "Simple diffusion: small, non-polar molecules slip straight through the phospholipid bilayer, from high to low concentration. No energy needed." },
  water: { l: "💧 Water (osmosis)", c: "#5B8FE0", how: "Osmosis: water molecules diffuse across the membrane (a lot of them through channel proteins) from a region of higher water potential to a region of lower water potential." },
  glucose: { l: "🍬 Glucose", c: "#F2A900", how: "Facilitated diffusion: glucose is too large and polar for the bilayer, so a carrier protein binds it, changes shape and releases it. Down the gradient, no ATP." },
  ion: { l: "⚡ Ions (channel)", c: "#3FA06B", how: "Facilitated diffusion through a channel protein: ions are charged, so they can't cross the hydrophobic tails. They pass through the water-filled pore." },
  active: { l: "🔋 Active transport", c: "#8E44C8", how: "Active transport: a carrier protein uses energy from ATP (made in respiration) to move ions from LOW to HIGH concentration, against the gradient." },
  big: { l: "🥩 Protein molecule", c: "#8C8478", how: "Too big and not lipid-soluble, and there's no carrier for it: it can't cross. The membrane is differentially (selectively) permeable." }
};
function membraneSim(root) {
  const PX = { channel: 170, carrier: 330, glyco: 490 };
  const lip = [];
  for (let x = 24; x < 630; x += 19) if (!Object.values(PX).some(p => Math.abs(x - p) < 30)) [0, 1].forEach(l => lip.push({ x, l, o: 0, v: 0 }));
  const st = { T: 37, parts: [], busy: 0, atp: 0, hl: null, labels: true, t: 0, move: "o2" };
  for (let i = 0; i < 8; i++) st.parts.push({ k: "active", x: 40 + Math.random() * 560, y: 248 + Math.random() * 48, ph: "in", vx: 0, vy: 0 });
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="memSvg" class="simsvg"></div>
      <div class="row simbtns">${Object.entries(MEM_MOVE).map(([k, m]) => `<button class="btn plain" data-mv="${k}">${m.l}</button>`).join("")}</div>
      <label class="small"><b>🌡️ Temperature: <span id="mT"></span></b><input type="range" id="mTemp" min="0" max="70" value="37" style="width:100%"></label>
      <label class="small chk"><input type="checkbox" id="mLab" checked> Show labels</label></section>
    <section class="card"><h3 style="margin:0">🔎 Tap a part</h3>
      <div class="row simbtns">${Object.entries(MEM_PARTS).map(([k, [n]]) => `<button class="btn plain" data-mp="${k}">${n}</button>`).join("")}</div>
      <div id="memInfo"></div><div id="memCount"></div></section></div>`;
  const tS = root.querySelector("#mTemp"), info = root.querySelector("#memInfo");
  const setT = v => { st.T = v; root.querySelector("#mT").textContent = `${v} °C ${v < 10 ? "(cold: less fluid)" : v > 50 ? "(too hot: proteins denature, membrane leaks!)" : v >= 30 && v <= 40 ? "(body temperature)" : ""}`; };
  tS.oninput = () => setT(Number(tS.value)); setT(37);
  const showInfo = html => { info.innerHTML = `<div class="chart" style="margin-top:8px">${html}</div>`; };
  root.querySelectorAll("[data-mp]").forEach(b => b.onclick = () => { SFX.tap(); st.hl = b.dataset.mp; st.hlT = 3; const [n, d] = MEM_PARTS[st.hl]; showInfo(`<b>${n}</b><br>${d}`); });
  root.querySelectorAll("[data-mv]").forEach(b => b.onclick = () => {
    SFX.click(); const k = b.dataset.mv; st.move = k; st.sent[k] = (st.sent[k] || 0) + 1; showInfo(`<b>${MEM_MOVE[k].l}</b><br>${MEM_MOVE[k].how}`);
    for (let i = 0; i < 5; i++) st.parts.push({ k, x: 40 + Math.random() * 560, y: 20 + Math.random() * 60, ph: "go", d: i * .35, ex: 0 });
  });
  root.querySelector("#mLab").onchange = e => { st.labels = e.target.checked; };
  showInfo(`<b>The fluid mosaic model</b><br>The membrane is a <b>phospholipid bilayer</b> with <b>proteins</b> scattered in it like tiles in a mosaic. Everything can drift sideways: it's <b>fluid</b>. Try sending molecules across with the buttons!`);
  st.sent = {};
  simProbe(() => { const inside = {}; st.parts.forEach(p => { if (p.y > 220) inside[p.k] = (inside[p.k] || 0) + 1; }); return { temp: st.T, leak: st.T > 50, move: st.move, sent: Object.assign({}, st.sent), inside, atp: st.atp > 0, part: st.hl || "" }; });
  let lastCount = "";
  simLoop(root, dt => {
    st.t += dt; st.hlT = Math.max(0, (st.hlT || 0) - dt); st.atp = Math.max(0, st.atp - dt); st.busy = Math.max(0, st.busy - dt);
    const fl = clamp(st.T / 37, .1, 2), hot = st.T > 50;
    lip.forEach(p => { p.v += (Math.random() - .5) * 60 * fl * dt - p.o * 3 * dt; p.v *= .9; p.o = clamp(p.o + p.v * dt * 10, -6 * fl, 6 * fl); });
    st.parts.forEach(p => stepParticle(p, dt, st, PX, fl, hot));
    st.parts = st.parts.filter(p => p.ph !== "gone");
    root.querySelector("#memSvg").innerHTML = membraneSvg(lip, st, PX, fl, hot);
    const cnt = {}; st.parts.forEach(p => { cnt[p.k] = cnt[p.k] || [0, 0]; cnt[p.k][p.y > 220 ? 1 : 0]++; });
    const c = Object.entries(cnt).map(([k, [o, i]]) => `<tr><td>${MEM_MOVE[k].l}</td><td>${o}</td><td>${i}</td></tr>`).join("");
    if (c !== lastCount) { lastCount = c; root.querySelector("#memCount").innerHTML = c ? `<table class="tterms small" style="margin-top:8px"><tbody><tr><th></th><th>Outside</th><th>Inside</th></tr>${c}</tbody></table>` : ""; }
  });
}
function stepParticle(p, dt, st, PX, fl, hot) {
  const sp = 70 * (.5 + .5 * fl);
  if (p.d > 0) { p.d -= dt; return; }
  if (p.ph === "in" || p.ph === "out") {       // wander in the cytoplasm or outside fluid
    p.vx = (p.vx || 0) * .95 + (Math.random() - .5) * 40 * dt * 10; p.vy = (p.vy || 0) * .95 + (Math.random() - .5) * 40 * dt * 10;
    p.x = clamp(p.x + p.vx * dt, 12, 628); p.y = p.ph === "in" ? clamp(p.y + p.vy * dt, 236, 300) : clamp(p.y + p.vy * dt, 14, 104); return;
  }
  const route = hot ? "leak" : { o2: "bilayer", water: Math.random() < .5 ? "channel" : "bilayer", glucose: "carrier", ion: "channel", active: "carrier", big: "bounce" }[p.k];
  if (p.ph === "go") {
    if (!p.ex) { p.route = route; p.ex = p.route === "channel" ? PX.channel + (Math.random() - .5) * 6 : p.route === "carrier" ? PX.carrier : (() => { let x; do { x = 30 + Math.random() * 580; } while (Object.values(PX).some(q => Math.abs(x - q) < 34)); return x; })(); }
    const dx = p.ex - p.x, dy = 108 - p.y, dd = Math.hypot(dx, dy);
    if (dd < 3) { if (p.route === "bounce") { p.ph = "bounce"; SFX.tap && 0; } else if (p.route === "carrier") { if (st.busy <= 0) { st.busy = .9; st.cargo = p.k; if (p.k === "active") st.atp = 1; p.ph = "cross"; } } else p.ph = "cross"; return; }
    p.x += dx / dd * sp * dt; p.y += dy / dd * sp * dt;
  } else if (p.ph === "cross") {
    p.y += (p.route === "bilayer" ? .45 : p.route === "carrier" ? 1.3 : 1) * sp * dt; p.x += Math.sin(p.y / 6) * .3;
    if (p.y > 236) { p.ph = "in"; p.vx = 0; p.vy = 0; }
  } else if (p.ph === "bounce") {
    p.y -= sp * dt; if (p.y < 60) { p.ph = "out"; }
  }
}
function membraneSvg(lip, st, PX, fl, hot) {
  const hl = st.hlT > 0 ? st.hl : null, glow = k => hl === k ? `stroke="#E0457B" stroke-width="4"` : `stroke="${CO}" stroke-width="2"`;
  const pw = Math.sin(st.t * 3) * 3 * fl;
  let s = `<rect width="640" height="310" rx="14" fill="#EAF6FF"/><rect y="220" width="640" height="90" rx="14" fill="#FFF3E6"/>`;
  s += `<g font-size="12" font-weight="800" fill="#7A6A66" font-family="system-ui, sans-serif"><text x="12" y="22">OUTSIDE the cell</text><text x="12" y="302">INSIDE (cytoplasm)</text></g>`;
  lip.forEach(p => {
    const x = p.x + p.o, top = p.l === 0, hy = top ? 124 : 216, ty = top ? 168 : 172, dir = top ? 1 : -1, tw = hl === "tail" ? "#E0457B" : "#E0B44A";
    s += `<path d="M${x - 3} ${hy + dir * 6} Q${x - 6} ${(hy + ty) / 2} ${x - 3} ${ty} M${x + 3} ${hy + dir * 6} Q${x + 6} ${(hy + ty) / 2} ${x + 3} ${ty}" stroke="${tw}" stroke-width="${hl === "tail" ? 3.5 : 2.6}" fill="none" stroke-linecap="round"/>`;
    s += `<circle cx="${x}" cy="${hy}" r="8" fill="${hl === "head" || hl === "phospholipid" ? "#FF8FB1" : "#7FB2FF"}" ${hl === "phospholipid" ? `stroke="#E0457B" stroke-width="3"` : `stroke="${CO}" stroke-width="1.5"`}/>`;
  });
  [100, 255, 410, 575].forEach((x, i) => { s += `<rect x="${x - 4}" y="${i % 2 ? 176 : 142}" width="8" height="24" rx="4" fill="#F7E36D" ${glow("chol")}/>`; });
  const dn = hot ? `fill="#C9C0B8"` : "", jig = hot ? ` rotate(${Math.sin(st.t * 7) * 8})` : "";
  s += `<g transform="translate(${PX.channel + pw} 0)${jig}"><rect x="-28" y="108" width="20" height="124" rx="10" ${dn || `fill="#9ED39B"`} ${glow("channel")}/><rect x="8" y="108" width="20" height="124" rx="10" ${dn || `fill="#9ED39B"`} ${glow("channel")}/></g>`;
  const open = st.busy > .45 ? "top" : st.busy > 0 ? "bottom" : "top";
  s += `<g transform="translate(${PX.carrier - pw} 0)${jig}"><path d="${open === "top" ? "M-26 108 L-8 128 L8 128 L26 108 L28 222 Q0 238 -28 222Z" : "M-28 110 Q0 96 28 110 L26 232 L8 212 L-8 212 L-26 232Z"}" ${dn || `fill="#F7B267"`} ${glow("carrier")}/>
    ${st.busy > 0 ? `<circle cx="0" cy="${open === "top" ? 150 : 196}" r="7" fill="${MEM_MOVE[st.cargo] ? MEM_MOVE[st.cargo].c : "#999"}" stroke="${CO}" stroke-width="1.5"/>` : ""}
    ${st.atp > 0 ? `<g opacity="${st.atp}"><circle cx="0" cy="250" r="${22 - st.atp * 8}" fill="#FFE27A" stroke="#E0B44A" stroke-width="2"/><text x="0" y="254" text-anchor="middle" font-size="11" font-weight="900" fill="${CO}" font-family="system-ui, sans-serif">ATP</text></g>` : ""}</g>`;
  s += `<g transform="translate(${PX.glyco + pw * .7} 0)${jig}"><rect x="-20" y="110" width="40" height="120" rx="18" ${dn || `fill="#C9A0FF"`} ${glow("glyco")}/><path d="M0 110 V88 M0 96 l-12 -10 M0 88 l10 -12 M-12 86 l-6 -10" stroke="#3FA06B" stroke-width="3.5" stroke-linecap="round"/>${[[0, 88], [-12, 86], [10, 76], [-18, 76]].map(([x, y]) => `<polygon points="${x - 5},${y} ${x - 2.5},${y - 4.3} ${x + 2.5},${y - 4.3} ${x + 5},${y} ${x + 2.5},${y + 4.3} ${x - 2.5},${y + 4.3}" fill="#B9F3C9" stroke="${CO}" stroke-width="1.2"/>`).join("")}</g>`;
  if (hot) s += [60, 260, 440].map(x => `<ellipse cx="${x}" cy="170" rx="10" ry="40" fill="#EAF6FF" opacity=".85"/>`).join("");
  st.parts.forEach(p => {
    if (p.d > 0) return;
    const c = MEM_MOVE[p.k].c;
    s += p.k === "big" ? `<circle cx="${p.x}" cy="${p.y}" r="13" fill="${c}" stroke="${CO}" stroke-width="2"/><path d="M${p.x - 7} ${p.y} q7 -6 14 0" stroke="#fff" stroke-width="2" fill="none"/>`
      : p.k === "glucose" ? `<polygon points="${[0, 1, 2, 3, 4, 5].map(i => `${(p.x + 7 * Math.cos(i * Math.PI / 3)).toFixed(1)},${(p.y + 7 * Math.sin(i * Math.PI / 3)).toFixed(1)}`).join(" ")}" fill="${c}" stroke="${CO}" stroke-width="1.5"/>`
      : `<circle cx="${p.x}" cy="${p.y}" r="${p.k === "water" ? 4.5 : 5.5}" fill="${c}" stroke="${CO}" stroke-width="1.2"/>${p.k === "ion" || p.k === "active" ? `<text x="${p.x}" y="${p.y + 3}" text-anchor="middle" font-size="8" font-weight="900" fill="#fff">+</text>` : ""}`;
  });
  if (st.labels) s += `<g font-size="11" font-weight="800" fill="${CO}" font-family="system-ui, sans-serif">
    <text x="${PX.channel}" y="102" text-anchor="middle">channel protein</text><text x="${PX.carrier}" y="102" text-anchor="middle">carrier protein</text>
    <text x="${PX.glyco + 22}" y="70">glycoprotein</text><text x="628" y="150" text-anchor="end">phospholipid</text><text x="628" y="164" text-anchor="end">bilayer</text><path d="M100 200 V236" stroke="${CO}" stroke-width="1.5"/><text x="100" y="248" text-anchor="middle">cholesterol</text></g>`;
  return `<svg viewBox="0 0 640 310" role="img" aria-label="Fluid mosaic model of the cell membrane">${s}</svg>`;
}
