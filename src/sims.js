/* ============================================================
   5f. 🔬 Simulation Lab: interactive models for the whole HKDSE Biology compulsory part
   I. Cells and Molecules of Life (a–e) · II. Genetics and Evolution (a–c) · III. Organisms and Environment (a–f) ·
   IV. Health and Diseases (a–c). The Lab shows 4 part tabs → section chips → simulation tabs (+ 🗺️ All labs map).
   How it fits together (read docs/SIM_LAB_GUIDE.md before adding a simulation):
   - simReg({ id, ic, name, sec, ord, topic, fn, words }) registers a simulation; sec is a SIM_SECS key ("1a"–"4c").
   - Each simulation function draws into root and starts simLoop(); it calls simProbe(() => ({ ...live values }))
     so the challenge engine (simchal.js) can check what the student has set up.
   - SIM_P[id] = predict-first question · SIM_Q[id] = exam-style checks · SIM_CH[id] = the ~15-minute challenge.
   This file: core + Breathing · Pupil reflex · Focusing & glasses · Hearing · Root-hair membrane.
   sims2.js: osmosis tubing, phototropism. sims_a–f.js: Part III sections a–f. sims_p1a–p1c.js: Part I.
   sims_p2a–p2b.js: Part II. sims_p4a–p4b.js: Part IV.
   ============================================================ */
let simTab = null, SIM = null, SIM_PROBE = null;
// The four parts of the HKDSE Biology compulsory part: [key, icon, short name, full name, colour, phone name]
const SIM_PARTS = [
  ["1", "🧪", "Cells & Molecules", "I. Cells and Molecules of Life", "#3D8BD9", "Cells"],
  ["2", "🧬", "Genetics & Evolution", "II. Genetics and Evolution", "#8E5BD6", "Genetics"],
  ["3", "🌿", "Organisms & Environment", "III. Organisms and Environment", "#2F9E5B", "Organisms"],
  ["4", "🩺", "Health & Diseases", "IV. Health and Diseases", "#D2455F", "Health"]
];
// Curriculum sections (HKDSE sub-topics): [key, icon, short name, full name, part key]. key = part + letter, e.g. "3a"
const SIM_SECS = [
  ["1a", "🧪", "Molecules", "Molecules of life", "1"],
  ["1b", "🔬", "Cells", "Cellular organisation", "1"],
  ["1c", "🫧", "Membranes", "Movement of substances across membrane", "1"],
  ["1d", "🧬", "Division", "Cell cycle and division", "1"],
  ["1e", "⚡", "Energy", "Cellular energetics", "1"],
  ["2a", "🫛", "Inheritance", "Basic genetics", "2"],
  ["2b", "🧫", "DNA", "Molecular genetics", "2"],
  ["2c", "🦋", "Evolution", "Biodiversity and evolution", "2"],
  ["3a", "🌿", "Plants", "Essential life processes in plants", "3"],
  ["3b", "🍙", "Animals", "Essential life processes in animals", "3"],
  ["3c", "🌸", "Growth", "Reproduction, growth and development", "3"],
  ["3d", "🧠", "Senses", "Coordination and response", "3"],
  ["3e", "⚖️", "Balance", "Homeostasis", "3"],
  ["3f", "🌍", "Ecosystems", "Ecosystems", "3"],
  ["4a", "🥗", "Health", "Personal health", "4"],
  ["4b", "🦠", "Diseases", "Diseases", "4"],
  ["4c", "🛡️", "Defence", "Body defence mechanisms", "4"]
];
const SIMS = [], SIM_CH = {};
// Register a simulation. sec = a SIM_SECS key ("1a"–"4c"); ord sorts inside the section; topic = TOPICS id; words = [[term, emoji, simple meaning]]
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

simReg({ id: "membrane", ic: "🫧", name: "Root-hair membrane", sec: "3a", ord: 10, topic: "t12", fn: membraneSim,
  words: [["cell membrane", "🫧", "thin layer around a cell; controls what goes in and out"], ["osmosis", "💧", "water moves across a membrane to where there is less water"], ["active transport", "🔋", "moving particles from LOW to HIGH concentration, using energy"], ["mineral ion", "⚡", "small charged particle a plant needs, e.g. nitrate"], ["carrier protein", "🚪", "a protein that carries one kind of particle across"], ["respiration", "🔥", "releases energy (ATP) from food, using oxygen"]] });
simReg({ id: "dialysis", ic: "💧", name: "Osmosis tubing", sec: "1c", ord: 20, topic: "t3", fn: dialysisSim,
  words: [["osmosis", "💧", "water moves across a membrane to where there is less water"], ["water potential", "📶", "how free the water is to move; pure water is highest"], ["partially permeable", "🥅", "lets small particles (water) through but not big ones (sucrose)"], ["sucrose", "🍬", "a sugar; too big to pass the pores"], ["rate", "⏱️", "how fast something happens"], ["control", "⚖️", "a set-up kept the same, to compare with"]] });
simReg({ id: "lung", ic: "🫁", name: "Breathing", sec: "3b", ord: 20, topic: "t13", fn: lungSim,
  words: [["diaphragm", "⌒", "sheet of muscle under the lungs"], ["intercostal muscles", "🦴", "muscles between the ribs"], ["inhale", "⬇️", "breathe in"], ["exhale", "⬆️", "breathe out"], ["volume", "📦", "how much space"], ["pressure", "🎈", "how hard the air pushes"], ["atmospheric pressure", "🌍", "the pressure of the air outside the body"]] });
simReg({ id: "pupil", ic: "👁️", name: "Pupil reflex", sec: "3d", ord: 10, topic: "t16", fn: pupilSim,
  words: [["pupil", "⚫", "the hole in the middle of the iris; light enters here"], ["iris", "🟦", "coloured ring of muscle around the pupil"], ["circular muscles", "⭕", "ring-shaped iris muscles; contract → smaller pupil"], ["radial muscles", "✳️", "spoke-shaped iris muscles; contract → bigger pupil"], ["retina", "🎞️", "back of the eye; has light-sensitive cells (receptors)"], ["reflex", "⚡", "a fast, automatic response; no thinking"], ["effector", "💪", "the muscle or gland that responds"]] });
simReg({ id: "lens", ic: "🔍", name: "Focusing & glasses", sec: "3d", ord: 20, topic: "t16", fn: lensSim,
  words: [["accommodation", "🔍", "changing the lens shape to focus near or far"], ["ciliary muscles", "⭕", "ring of muscle that changes the lens shape"], ["suspensory ligaments", "🧵", "threads that hold the lens"], ["convex", "()", "thicker in the middle; bends light more"], ["concave", ")(", "thinner in the middle; spreads light out"], ["short sight", "👓", "can see near things but not far things"], ["long sight", "🔭", "can see far things but not near things"]] });
simReg({ id: "ear", ic: "👂", name: "Hearing", sec: "3d", ord: 30, topic: "t16", fn: earSim,
  words: [["eardrum", "🥁", "thin skin that vibrates when sound hits it"], ["ossicles", "🦴", "three tiny bones that make vibrations bigger"], ["cochlea", "🐌", "snail-shaped tube with hair cells (receptors)"], ["hair cells", "〰️", "receptors that change vibrations into nerve impulses"], ["frequency", "🎵", "pitch: how many vibrations per second (Hz)"], ["auditory nerve", "⚡", "carries impulses from the cochlea to the brain"]] });

function renderSims(tab) {
  if (tab) simTab = tab;
  stopRush(); stopTimer(); if (R) { clearTimeout(R.introT); clearTimeout(R.incT); } R = null; MUSIC.setMode("calm"); renderTools(); homeTab = "lab"; renderNav("lab");
  if (typeof tourEnd === "function" && typeof tourAt !== "undefined" && tourAt >= 0) tourEnd();
  if (!SIMS.some(x => x.id === simTab)) simTab = SIMS.some(x => x.id === S.simLast) ? S.simLast : SIMS[0].id;
  S.simLast = simTab; SIM_PROBE = null;
  S.sims = S.sims || {}; if (!S.sims[simTab]) { S.sims[simTab] = today(); save(); checkTrophies(); } activityDone({ mode: "sim", sim: simTab, ans: 0 });
  const info = SIMS.find(x => x.id === simTab), sec = SIM_SECS.find(x => x[0] === info.sec), part = SIM_PARTS.find(x => x[0] === sec[4]), topic = TOPICS.find(T => T.id === info.topic);
  const fins = list => list.filter(x => simChalState(x.id)[2]).length;
  const inSec = k => SIMS.filter(x => x.sec === k), inPart = k => SIMS.filter(x => (SIM_SECS.find(y => y[0] === x.sec) || [])[4] === k);
  const secs = SIM_SECS.filter(x => x[4] === part[0] && inSec(x[0]).length);
  const roman = k => ["I", "II", "III", "IV"][+k - 1];
  $app.innerHTML = `
    <section class="card simhead" style="--pc:${part[4]}">
      <div class="simtop"><h2 style="margin:0">🔬 Simulation Lab</h2><span class="simtopr"><button class="pill simmapb" id="simMap" aria-haspopup="dialog">🗺️ All labs</button><span class="pill" title="Challenges finished">🏆 ${fins(SIMS)}/${SIMS.length}</span></span></div>
      <div class="simparts" role="tablist" aria-label="HKDSE compulsory parts">${SIM_PARTS.filter(x => inPart(x[0]).length).map(([k, ic, nm, full, col, tiny]) => { const L = inPart(k), f = fins(L); return `<button role="tab" aria-selected="${k === part[0]}" data-simpart="${k}" style="--pc:${col}" title="${esc(full)}"><span class="spic" aria-hidden="true">${ic}</span><span class="spno">${roman(k)}</span><span class="spnm"><span class="splong">${esc(nm)}</span><span class="spshort">${esc(tiny)}</span></span><span class="spbar" aria-label="${f} of ${L.length} challenges done"><i style="width:${Math.round(100 * f / L.length)}%"></i></span></button>`; }).join("")}</div>
      <p class="simpartname"><b>${esc(part[3])}</b></p>
      <div class="simsecs" role="tablist" aria-label="Sections of ${esc(part[3])}">${secs.map(([k, ic, nm, full]) => { const L = inSec(k), f = fins(L); return `<button role="tab" aria-selected="${k === info.sec}" data-simsec="${k}" title="${esc(roman(k[0]) + "(" + k[1] + ") " + full)}"><span class="ssic" aria-hidden="true">${ic}</span><span class="ssnm"><b>${k[1]}.</b> ${nm}</span><span class="ssdots" aria-label="${f} of ${L.length} challenges done">${L.map(x => simChalState(x.id)[2] ? "●" : "○").join("")}</span></button>`; }).join("")}</div>
      <p class="simsecname"><b>${roman(sec[0][0])}(${sec[0][1]}) ${esc(sec[3])}</b></p>
      <div class="slottabs simtabs" role="tablist" aria-label="Simulations">${inSec(info.sec).map(x => { const [d, n, fin] = simChalState(x.id); return `<button role="tab" aria-selected="${x.id === simTab}" data-sim="${x.id}"><span aria-hidden="true">${x.ic}</span><span class="simtabnm">${esc(x.name)}</span><span class="simtabst" aria-label="challenge ${fin ? "finished" : d + " of " + n}">${fin ? "🏆" : n ? `${d}/${n}` : ""}</span></button>`; }).join("")}</div>
      <p class="small muted simnow">${info.ic} <b>${esc(info.name)}</b>${topic ? ` · Topic ${topic.no} ${esc(topic.name)}` : ""} · <a href="#simChal" class="simgo">🎯 Challenge ↓</a></p>
    </section>
    <div id="simBody"></div>`;
  $app.querySelectorAll("[data-sim]").forEach(b => b.onclick = () => { SFX.tap(); renderSims(b.dataset.sim); });
  S.simSec = S.simSec || {}; S.simPart = S.simPart || {};
  const openSec = k => { const list = inSec(k); renderSims((list.find(x => x.id === S.simSec[k]) || list[0]).id); };
  $app.querySelectorAll("[data-simsec]").forEach(b => b.onclick = () => { SFX.tap(); openSec(b.dataset.simsec); });
  $app.querySelectorAll("[data-simpart]").forEach(b => b.onclick = () => {
    SFX.tap(); const k = b.dataset.simpart, first = SIM_SECS.find(x => x[4] === k && inSec(x[0]).length);
    openSec(S.simPart[k] && inSec(S.simPart[k]).length ? S.simPart[k] : first[0]);
  });
  const go = $app.querySelector(".simgo"); if (go) go.onclick = e => { e.preventDefault(); const c = document.getElementById("simChal"); if (c) c.scrollIntoView({ behavior: "smooth", block: "start" }); };
  $app.querySelector("#simMap").onclick = () => { SFX.tap(); simMap(); };
  S.simSec[info.sec] = simTab; S.simPart[part[0]] = info.sec;
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
/* 🗺️ Lab map: every simulation, grouped by HKDSE part and section, with challenge progress (one tap to open) */
function simMap() {
  const roman = k => ["I", "II", "III", "IV"][+k - 1];
  openModal(`<h2 style="margin:0 0 4px">🗺️ All labs</h2><p class="small muted" style="margin:0 0 10px">HKDSE Biology compulsory part · tap a lab to open it</p>
    <div class="simmap">${SIM_PARTS.map(([pk, pic, , pfull, col]) => { const secs = SIM_SECS.filter(x => x[4] === pk && SIMS.some(y => y.sec === x[0])); return secs.length ? `<section class="simmappart" style="--pc:${col}"><h3><span aria-hidden="true">${pic}</span> ${esc(pfull)}</h3>${secs.map(([k, ic, , full]) => `<div class="simmapsec"><p><span aria-hidden="true">${ic}</span> <b>${roman(k[0])}(${k[1]})</b> ${esc(full)}</p><div class="simmaprow">${SIMS.filter(y => y.sec === k).map(y => { const [d, n, fin] = simChalState(y.id); return `<button class="simmapb2${y.id === simTab ? " on" : ""}" data-mapsim="${y.id}"><span aria-hidden="true">${y.ic}</span><span>${esc(y.name)}</span><small>${fin ? "🏆" : n ? `${d}/${n}` : ""}</small></button>`; }).join("")}</div></div>`).join("")}</section>` : ""; }).join("")}</div>`, { wide: true });
  document.querySelectorAll("[data-mapsim]").forEach(b => b.onclick = () => { SFX.tap(); closeModal(); renderSims(b.dataset.mapsim); });
}
/* 📖 Picture word bank: each key word = emoji + word + 🔊 + a short, simple meaning (for students learning in English) */
function simWords(root, info) {
  if (!info.words || !info.words.length) return;
  const W = info.words, card = document.createElement("section"); card.className = "card simwords";
  const mean = i => { const [w, ic, m] = W[i]; return `<span class="swic" aria-hidden="true">${ic}</span><span class="swt"><b>${esc(w)}</b>${typeof sayBtns === "function" ? sayBtns(w) : ""}<small>${esc(m)}</small></span>`; };
  card.innerHTML = foldHtml("lab-words", { icon: "📖", title: "Key words", peek: `${W.length} words · tap one`, cls: "fold-flat", open: false },
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
  if (typeof tourEnd === "function" && typeof tourAt !== "undefined" && tourAt >= 0) tourEnd();
  const st = { t: 0, v: .2, vPrev: .2, auto: true, deep: false, target: null, from: 0, to: 0, k: 0, showVol: true, hist: [] };
  root.innerHTML = `<div class="simgrid">
    <section class="card"><div id="lungSvg" class="simsvg nozoom"></div>
      <div class="row">${segBtns("lmode", [["auto", "▶ Auto breathing"], ["manual", "✋ I control it"]], "auto")}</div>
      <div class="row simbtns" id="lungManual" hidden><button class="btn blue" id="lIn">⬇️ Breathe in</button><button class="btn yellow" id="lOut">⬆️ Breathe out</button></div>
      <label class="small chk"><input type="checkbox" id="lDeep"> 🏃 Exercise (deeper, faster breathing)</label></section>
    <section class="card"><h3 style="margin:0">📈 Pressure in the lungs vs time</h3>
      <div id="lungGraph" class="simsvg nozoom"></div>
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
  return `<svg viewBox="0 -24 420 380" role="img" aria-label="Chest model: thorax with trachea, bronchi, lungs, ribs, intercostal muscles and diaphragm; lung volume ${Math.round(v * 100)}%">
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
      <text x="226" y="30" text-anchor="middle">Trachea rings</text><text x="24" y="202">Pleural membrane</text><text x="18" y="100">${rTxt}</text><text x="252" y="240" font-size="13">Heart</text>
      <text x="210" y="${side + 30}" text-anchor="middle">${dTxt}</text>
      <text x="322" y="10" text-anchor="middle" fill="${inF ? "#5B8FE0" : outF ? "#E07A3F" : CO}">${inF ? "Air in" : outF ? "Air out" : ""}</text></g>
  </svg>`;
}
function pressureGraph(hist, t, showVol) {
  const x = s => 46 + (s - (t - 10)) / 10 * 360, y = P => 110 - P / .6 * 84, yv = v => 196 - v * 170;
  const line = hist.map(([s, P], i) => `${i ? "L" : "M"}${x(s).toFixed(1)} ${y(P).toFixed(1)}`).join(" ");
  const vline = hist.map(([s, , v], i) => `${i ? "L" : "M"}${x(s).toFixed(1)} ${yv(v).toFixed(1)}`).join(" ");
  const last = hist[hist.length - 1] || [t, 0, 0];
  return `<svg viewBox="0 0 420 230" role="img" aria-label="Graph of lung pressure against time">
    <rect x="46" y="26" width="360" height="84" fill="#EAF3FF"/><rect x="46" y="110" width="360" height="84" fill="#FFF1E6"/>
    <g font-size="13" font-weight="800" fill="#7A6A66" font-family="system-ui, sans-serif">
      <text x="400" y="42" text-anchor="end">above atmospheric → air flows OUT</text><text x="400" y="186" text-anchor="end">below atmospheric → air flows IN</text>
      <text x="40" y="30" text-anchor="end">+0.6</text><text x="40" y="114" text-anchor="end">0</text><text x="40" y="198" text-anchor="end">−0.6</text>
      <text x="226" y="222" text-anchor="middle">Time (s) →</text><text x="12" y="112" transform="rotate(-90 12 112)" text-anchor="middle">Pressure (kPa, relative)</text></g>
    <path d="M46 110 H406" stroke="${CO}" stroke-width="2" stroke-dasharray="6 4"/><text x="50" y="104" font-size="13" fill="${CO}" font-family="system-ui, sans-serif">atmospheric pressure</text>
    <path d="M46 26 V194 H406" fill="none" stroke="${CO}" stroke-width="2.5"/>
    ${showVol ? `<path d="${vline}" fill="none" stroke="#3FA06B" stroke-width="3" opacity=".55" stroke-dasharray="2 3"/><text x="404" y="${yv(last[2]) - 6}" text-anchor="end" font-size="13" font-weight="800" fill="#3FA06B" font-family="system-ui, sans-serif">lung volume</text>` : ""}
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
    <section class="card"><div id="pupScene" class="simsvg pupscene nozoom"></div>
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
  const bg = `hsl(45, ${18 + L * .45}%, ${92 - L * .28}%)`;
  const bright = r < 28, gap = 16 + r / 44 * 36, irisCol = bright ? "#4187C9" : "#C34B78";
  const lab = (x, y, t, a = "middle") => `<text x="${x}" y="${y}" text-anchor="${a}">${t}</text>`;
  const rayOp = clamp(.18 + L / 115, .18, .95).toFixed(2);
  return `<svg viewBox="0 0 360 240" role="img" aria-label="Horizontal section of the eye. It shows cornea, aqueous humour, iris muscles, pupil, lens, ciliary body, suspensory ligaments, vitreous humour, retina, fovea, blind spot, optic nerve, choroid and sclera. Pupil diameter ${(r / 44 * 8).toFixed(1)} millimetres.">
    <rect width="360" height="240" rx="16" fill="${bg}"/>
    <g opacity="${rayOp}" stroke="#F6B400" stroke-width="2.4" stroke-linecap="round">
      <path d="M8 88 L82 104 L128 112 L292 114"/><path d="M8 152 L82 136 L128 128 L292 126"/>
    </g>
    <path d="M38 120 C68 44 148 24 235 42 C294 52 327 86 330 120 C327 154 294 188 235 198 C148 216 68 196 38 120Z" fill="#FFFDF8" stroke="#6F5A56" stroke-width="4"/>
    <path d="M50 120 C78 56 150 38 230 54 C278 64 306 91 309 120 C306 149 278 176 230 186 C150 202 78 184 50 120Z" fill="#EAF6FF" opacity=".72"/>
    <path d="M53 120 C80 60 150 42 228 58 C270 66 294 91 297 120 C294 149 270 174 228 182 C150 198 80 180 53 120Z" fill="none" stroke="#5D93BF" stroke-width="3" opacity=".35"/>
    <path d="M295 68 C316 96 316 144 295 172" fill="none" stroke="#E95F8E" stroke-width="6"/><path d="M286 72 C306 98 306 142 286 168" fill="none" stroke="#7D5D48" stroke-width="3" opacity=".9"/>
    <path d="M38 120 C24 91 24 149 38 120Z" fill="#D7ECFF" stroke="#4F7EA9" stroke-width="3"/><path d="M37 120 C58 104 58 136 37 120Z" fill="#C8E8FF" opacity=".8"/>
    <path d="M101 ${120 - gap / 2} Q124 ${94 - gap / 5} 136 82 L139 92 Q126 104 122 ${120 - gap / 2}Z" fill="${irisCol}" stroke="${CO}" stroke-width="2"/>
    <path d="M101 ${120 + gap / 2} Q124 ${146 + gap / 5} 136 158 L139 148 Q126 136 122 ${120 + gap / 2}Z" fill="${irisCol}" stroke="${CO}" stroke-width="2"/>
    ${[0,1,2,3].map(i => `<path d="M105 ${101 + i * 7} L130 ${93 + i * 11}" stroke="#255B94" stroke-width="1.6" opacity=".75"/><path d="M105 ${139 - i * 7} L130 ${147 - i * 11}" stroke="#255B94" stroke-width="1.6" opacity=".75"/>`).join("")}
    <path d="M99 ${120 - gap / 2} Q96 120 99 ${120 + gap / 2}" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>
    <ellipse cx="156" cy="120" rx="${bright ? 13 : 17}" ry="35" fill="#FFE8A8" stroke="${CO}" stroke-width="2.5"/>
    <path d="M138 91 L151 88 M138 149 L151 152 M174 88 L188 78 M174 152 L188 162" stroke="#B7986C" stroke-width="2"/>
    <ellipse cx="196" cy="74" rx="16" ry="10" fill="#E57FA1" stroke="${CO}" stroke-width="2"/><ellipse cx="196" cy="166" rx="16" ry="10" fill="#E57FA1" stroke="${CO}" stroke-width="2"/>
    <circle cx="276" cy="117" r="6" fill="#FFD94D" stroke="${CO}" stroke-width="1.8"/><circle cx="300" cy="146" r="5" fill="#7A6A66"/><path d="M302 146 C324 150 334 162 350 178" stroke="#F2D06B" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M302 146 C324 150 334 162 350 178" stroke="#B8902E" stroke-width="9" fill="none" stroke-linecap="round"/>
    <g font-size="10.5" font-weight="900" fill="${CO}" font-family="system-ui, sans-serif">
      ${lab(48, 36, "cornea")}${lab(94, 62, "aqueous")}${lab(119, 79, "iris muscles")}${lab(102, 119, "pupil", "end")}
      ${lab(157, 184, "lens")}${lab(204, 56, "ciliary body")}${lab(195, 184, "ligaments")}${lab(229, 116, "vitreous")}
      ${lab(296, 58, "retina")}${lab(276, 101, "fovea")}${lab(304, 133, "blind spot")}${lab(318, 199, "optic nerve")}${lab(252, 204, "choroid")}${lab(111, 217, "sclera")}
    </g>
    <text x="180" y="22" text-anchor="middle" font-size="12" font-weight="900" fill="${CO}" font-family="system-ui, sans-serif">${bright ? "Bright: circular muscles contract" : "Dim: radial muscles contract"}</text>
  </svg>`;
}

/* ---------------- 3. 🔍 Focusing, short sight, long sight and glasses ---------------- */
const EYE_D = { normal: 17, short: 18.3, long: 16.3 };      // eyeball length (mm) from lens to retina
const P_MIN = 1000 / 17, P_MAX = P_MIN + 4.3;               // eye lens power range (dioptres): relaxed → fully accommodated
const GLASS = { none: 0, concave: -4.4, convex: 2.46 };      // spectacle power (D), 12 mm in front of the eye
function lensSim(root) {
  const st = { obj: "far", eye: "normal", gl: "none", P: P_MIN };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="lensSvg" class="simsvg nozoom"></div>
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
  const CY = 112, xCor = 118, xLens = 166, xRet = 166 + D * 8.2, xGl = 74, yS = y => CY - y * 12;
  const acc = clamp((st.P - P_MIN) / (P_MAX - P_MIN), 0, 1), thick = 8 + 11 * acc, far = st.obj === "far";
  const lig = s => `<path d="M${xLens - 9} ${CY + s * 34} L${xLens - 28} ${CY + s * (acc > .15 ? 48 : 58)}" stroke="#B89A7A" stroke-width="2"/>`;
  const cil = s => `<ellipse cx="${xLens - 34}" cy="${CY + s * 61}" rx="${acc > .15 ? 13 : 9}" ry="8" fill="${acc > .15 ? "#E0457B" : "#E9A0B0"}" stroke="${CO}" stroke-width="2"/>`;
  const objX = 18, fx = xLens + xf * 8.2, fOK = isFinite(xf) && fx > xLens && fx < 378;
  let rp = "";
  rays.forEach(r => {
    const ys = far ? yS(r.yg) : CY, yg = yS(r.yg), yc = yS(r.yg * .62 + r.ye * .38), yl = yS(r.ye), yr = yS(r.yr);
    const throughGlass = st.gl !== "none" ? ` L${xGl} ${yg}` : "";
    rp += `<path d="M${far ? objX + 28 : objX + 12} ${ys}${throughGlass} L${xCor} ${yc} L${xLens} ${yl} L${xRet} ${yr}" fill="none" stroke="#F2A900" stroke-width="2.2" stroke-linejoin="round"/>`;
    if (xf > D && isFinite(xf)) rp += `<path d="M${xRet} ${yr} L${Math.min(378, fx)} ${yS(r.ye + r.th * (Math.min(xf, 26) - 0))}" stroke="#F2A900" stroke-width="1.8" stroke-dasharray="4 4" opacity=".7"/>`;
  });
  const glasses = st.gl === "concave" ? `<path d="M${xGl - 7} ${CY - 45} Q${xGl - 1} ${CY} ${xGl - 7} ${CY + 45} L${xGl + 7} ${CY + 45} Q${xGl + 1} ${CY} ${xGl + 7} ${CY - 45}Z" fill="rgba(160,196,255,.55)" stroke="${CO}" stroke-width="2.2"/>`
    : st.gl === "convex" ? `<path d="M${xGl} ${CY - 45} Q${xGl - 15} ${CY} ${xGl} ${CY + 45} Q${xGl + 15} ${CY} ${xGl} ${CY - 45}Z" fill="rgba(160,196,255,.55)" stroke="${CO}" stroke-width="2.2"/>` : "";
  return `<svg viewBox="0 0 380 224" role="img" aria-label="Ray diagram: most refraction occurs at the cornea; the lens changes shape to fine tune focus on the retina.">
    <rect width="380" height="224" rx="14" fill="#FBF7EE"/>
    ${far ? `<g transform="translate(${objX} ${CY - 30})"><rect x="10" y="28" width="8" height="28" fill="#8C5A3C"/><circle cx="14" cy="20" r="18" fill="#7CC47A" stroke="${CO}" stroke-width="2"/></g><text x="${objX + 16}" y="${CY + 48}" font-size="10.5" font-weight="900" fill="${CO}" text-anchor="middle" font-family="system-ui, sans-serif">distant</text>`
      : `<g transform="translate(${objX} ${CY - 15})"><rect width="16" height="30" rx="2" fill="#E0457B" stroke="${CO}" stroke-width="2"/><path d="M4 8 h8 M4 14 h8 M4 20 h8" stroke="#fff" stroke-width="2"/></g><text x="${objX + 13}" y="${CY + 34}" font-size="10.5" font-weight="900" fill="${CO}" text-anchor="middle" font-family="system-ui, sans-serif">25 cm</text>`}
    <path d="M${xRet + 4} ${CY + 28} C${xRet + 28} ${CY + 42} ${xRet + 45} ${CY + 70} 378 ${CY + 86}" stroke="#B8902E" stroke-width="18" fill="none"/><path d="M${xRet + 4} ${CY + 28} C${xRet + 28} ${CY + 42} ${xRet + 45} ${CY + 70} 378 ${CY + 86}" stroke="#F2D06B" stroke-width="12" fill="none"/>
    <path d="M108 ${CY} C118 38 184 24 ${xRet - 2} 48 C${xRet + 22} 66 ${xRet + 30} 92 ${xRet + 28} ${CY} C${xRet + 30} 132 ${xRet + 22} 158 ${xRet - 2} 176 C184 200 118 186 108 ${CY}Z" fill="#FFFDF8" stroke="#A8998A" stroke-width="5"/>
    <path d="M118 ${CY} C130 54 186 42 ${xRet - 10} 58 C${xRet + 10} 76 ${xRet + 16} 96 ${xRet + 16} ${CY} C${xRet + 16} 128 ${xRet + 10} 148 ${xRet - 10} 166 C186 182 130 170 118 ${CY}Z" fill="rgba(230,242,255,.62)" stroke="#5A3A2E" stroke-width="2"/>
    <path d="M${xCor} ${CY - 55} Q${xCor - 23} ${CY} ${xCor} ${CY + 55}" fill="rgba(211,228,255,.68)" stroke="${CO}" stroke-width="2.5"/>
    <path d="M${xRet + 8} ${CY - 82} Q${xRet + 20} ${CY} ${xRet + 8} ${CY + 82}" fill="none" stroke="#E0457B" stroke-width="6" opacity=".58"/><circle cx="${xRet + 2}" cy="${CY - 8}" r="4.5" fill="#FFD94D" stroke="${CO}" stroke-width="1.4"/><circle cx="${xRet + 10}" cy="${CY + 28}" r="4" fill="#7A6A66"/>
    <path d="M${xLens - 40} ${CY - 52} V${CY - 30} M${xLens - 40} ${CY + 30} V${CY + 52}" stroke="#4E78AE" stroke-width="5" stroke-linecap="round"/>
    ${lig(-1)}${lig(1)}${cil(-1)}${cil(1)}
    <ellipse cx="${xLens}" cy="${CY}" rx="${thick.toFixed(1)}" ry="36" fill="rgba(255,236,170,.9)" stroke="${CO}" stroke-width="2.5"/>
    ${glasses}${st.gl !== "none" ? `<text x="${xGl}" y="${CY + 61}" font-size="10.5" font-weight="900" fill="${CO}" text-anchor="middle" font-family="system-ui, sans-serif">${st.gl}</text>` : ""}
    <path d="M0 ${CY} H380" stroke="${CO}" stroke-width="1" stroke-dasharray="3 5" opacity=".35"/>
    ${rp}
    ${fOK ? `<circle cx="${fx}" cy="${CY}" r="4.8" fill="#C0392B" stroke="#fff" stroke-width="2"/><text x="${Math.min(356, Math.max(205, fx))}" y="${CY - 12}" font-size="10.5" font-weight="900" fill="#C0392B" text-anchor="middle" font-family="system-ui, sans-serif">focus</text>` : ""}
    <g font-size="10.5" font-weight="900" fill="${CO}" font-family="system-ui, sans-serif">
      <text x="${xCor - 34}" y="48">cornea bends most</text><text x="${xLens + 16}" y="50">lens fine-tunes</text><text x="${xLens - 54}" y="${CY - 46}">iris / pupil</text>
      <text x="${xLens - 4}" y="${CY + 54}" text-anchor="middle">lens</text><text x="${xLens - 54}" y="${CY + 88}">ciliary muscle</text><text x="${xLens + 20}" y="${CY + 88}">ligaments</text>
      <text x="${(xLens + xRet) / 2}" y="106" text-anchor="middle">vitreous humour</text><text x="${xRet + 8}" y="34" text-anchor="end">retina</text><text x="${xRet - 2}" y="${CY - 20}" text-anchor="end">fovea</text><text x="${xRet - 6}" y="${CY + 46}" text-anchor="end">blind spot</text><text x="362" y="${CY + 102}" text-anchor="end">optic nerve</text>
    </g>
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
    <section class="card"><div id="earSvg" class="simsvg nozoom"></div><div id="cochSvg" class="simsvg nozoom"></div></section>
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
  for (let x = 62; x < 136; x += 4) { const o = .5 + .5 * Math.cos(2 * Math.PI * (x - st.ph / (2 * Math.PI) * lam) / lam); waves += `<path d="M${x} 96 v18" stroke="#5B8FE0" stroke-width="2" opacity="${(A * o * .9).toFixed(2)}"/>`; }
  const lab = (x, y, t, a = "start") => `<text x="${x}" y="${y}" text-anchor="${a}">${t}</text>`;
  let spiral = ""; for (let a2 = 0; a2 < 5.2 * Math.PI; a2 += .2) { const r = 24 - a2 * 1.25; spiral += `${spiral ? "L" : "M"}${(244 + r * Math.cos(a2)).toFixed(1)} ${(132 + r * Math.sin(a2)).toFixed(1)} `; }
  const bone = Array.from({ length: 34 }, (_, i) => `<circle cx="${74 + (i * 47) % 270}" cy="${10 + (i * 31) % 196}" r="1" fill="#D8C6A6"/>`).join("");
  return `<svg viewBox="0 0 360 220" role="img" aria-label="Cross-section of the ear showing pinna, ear canal, eardrum, ossicles, oval window, round window, cochlea, semicircular canals, Eustachian tube and auditory nerve.">
    <defs><linearGradient id="erC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE2D4"/><stop offset="1" stop-color="#EFC4AE"/></linearGradient>
      <radialGradient id="erK" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#EAF4FF"/><stop offset="1" stop-color="#BFD8F2"/></radialGradient></defs>
    <rect width="360" height="220" rx="14" fill="#FBF7EE"/>
    <path d="M66 0 H360 V220 H66 Q72 110 66 0Z" fill="#F2E7D2"/>${bone}
    <path d="M49 27 C20 32 10 74 17 112 C23 148 42 176 60 182 C72 184 78 172 70 162 C61 150 55 144 58 129 L61 116 L61 91 C65 68 70 42 49 27Z" fill="#F2C4A8" stroke="#B07A5C" stroke-width="2.2"/>
    <path d="M45 47 C29 58 27 96 34 120 C39 138 49 147 55 142" fill="none" stroke="#D59C7E" stroke-width="2.6" stroke-linecap="round"/><path d="M48 76 C39 88 41 107 53 114" fill="none" stroke="#D59C7E" stroke-width="2"/>
    <path d="M58 90 H138 V116 H58Z" fill="url(#erC)" stroke="#B07A5C" stroke-width="2"/>${waves}
    <path d="M138 62 Q174 57 208 64 Q216 103 208 144 Q174 151 138 144Z" fill="#F7E3E6" stroke="#B89A8C" stroke-width="2"/>
    <path d="M180 144 Q197 178 236 207" stroke="#E8B9C2" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M180 144 Q197 178 236 207" stroke="#B07A8A" stroke-width="1.3" fill="none" opacity=".7"/>
    <path d="M${140 + d} 78 Q${131 + d * 1.6} 103 ${140 + d} 128" fill="none" stroke="#B790A0" stroke-width="4.2"/><path d="M${140 + d} 78 Q${131 + d * 1.6} 103 ${140 + d} 128" fill="none" stroke="#F4E6EE" stroke-width="1.8"/>
    <g transform="translate(${d * .7} 0)" fill="#FFF6E4" stroke="#8C7A66" stroke-width="1.4" stroke-linejoin="round">
      <path d="M139 104 L149 78 Q150 68 158 67 Q166 69 164 78 Q161 85 153 84 L144 106Z"/>
      <path d="M164 70 Q175 62 185 70 Q191 79 182 86 L190 99 Q186 103 181 98 Q173 88 166 82Z"/>
      <path d="M190 98 Q203 88 216 94 L216 115 Q203 119 190 103" fill="none" stroke-width="2.8"/><rect x="215" y="92" width="6" height="25" rx="2"/></g>
    <ellipse cx="${223 + d * .6}" cy="104" rx="3.4" ry="11" fill="#A0C4FF" stroke="#5B7FB0" stroke-width="1.3"/><ellipse cx="225" cy="130" rx="3" ry="8" fill="#C9DDF5" stroke="#5B7FB0" stroke-width="1.2"/>
    <g fill="none"><ellipse cx="238" cy="43" rx="13" ry="24" stroke="#7A6AA8" stroke-width="7"/><ellipse cx="238" cy="43" rx="13" ry="24" stroke="#E2D8F6" stroke-width="4.2"/>
      <ellipse cx="266" cy="50" rx="23" ry="9" stroke="#7A6AA8" stroke-width="7"/><ellipse cx="266" cy="50" rx="23" ry="9" stroke="#E2D8F6" stroke-width="4.2"/>
      <ellipse cx="254" cy="34" rx="19" ry="11" stroke="#7A6AA8" stroke-width="7" transform="rotate(35 254 34)"/><ellipse cx="254" cy="34" rx="19" ry="11" stroke="#E2D8F6" stroke-width="4.2" transform="rotate(35 254 34)"/></g>
    <ellipse cx="244" cy="81" rx="18" ry="12" fill="#E2D8F6" stroke="#7A6AA8" stroke-width="2"/>
    <circle cx="246" cy="132" r="${29 + Math.abs(v) * 2}" fill="url(#erK)" stroke="#5B7FB0" stroke-width="2.2"/>
    <path d="${spiral}" fill="none" stroke="#4A6FA8" stroke-width="8" stroke-linecap="round"/><path d="${spiral}" fill="none" stroke="#9EC3EC" stroke-width="5" stroke-linecap="round"/>
    <path d="M232 85 C250 98 260 113 263 132" stroke="#E0B44A" stroke-width="4" fill="none"/>
    <path d="M263 132 C295 130 315 136 346 140" stroke="#B8902E" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M263 132 C295 130 315 136 346 140" stroke="#F2D06B" stroke-width="6" fill="none" stroke-linecap="round"/>
    ${st.imp.map(x => `<circle cx="${263 + x * 76}" cy="${132 + x * 8}" r="4" fill="#FF6B6B" stroke="#fff" stroke-width="1.2"/>`).join("")}
    <g font-size="10.5" font-weight="900" fill="${CO}" font-family="system-ui, sans-serif">
      ${lab(12, 22, "pinna")}${lab(78, 84, "ear canal")}${lab(137, 57, "eardrum", "middle")}${lab(182, 58, "malleus")}
      ${lab(190, 84, "incus")}${lab(214, 88, "stapes")}      ${lab(232, 104, "oval window")}${lab(210, 166, "round window", "middle")}
      ${lab(256, 18, "semicircular canals", "middle")}${lab(246, 178, "cochlea", "middle")}${lab(346, 158, "auditory nerve →", "end")}${lab(347, 131, "🧠", "end")}${lab(236, 212, "Eustachian tube", "middle")}</g>
  </svg>`;
}
function cochleaSvg(st, A, pos, heard) {
  const x0 = 24, x1 = 336, n = 36;
  let mem = "", hairs = "";
  for (let i = 0; i <= 80; i++) { const p = i / 80, env = Math.exp(-Math.pow((p - pos) / .09, 2)), y = 70 - A * 22 * env * Math.sin(st.ph - p * 18); mem += `${i ? "L" : "M"}${(x0 + p * (x1 - x0)).toFixed(1)} ${y.toFixed(1)} `; }
  for (let i = 0; i < n; i++) {
    const p = (i + .5) / n, x = x0 + p * (x1 - x0), env = Math.exp(-Math.pow((p - pos) / .09, 2)), dead = st.dmg && p < .32, act = !dead && A > .02 && env > .45;
    const y = 70 - A * 22 * env * Math.sin(st.ph - p * 18);
    hairs += dead ? `<path d="M${x} ${y - 2} l-6 -6" stroke="#A89F9A" stroke-width="3" stroke-linecap="round"/>` : `<path d="M${x} ${y - 2} v-11" stroke="${act ? "#FF6B6B" : "#8FB8E8"}" stroke-width="${act ? 4 : 2.5}" stroke-linecap="round"/>`;
  }
  return `<svg viewBox="0 0 360 132" role="img" aria-label="Uncoiled cochlea showing which hair cells vibrate">
    <rect width="360" height="132" rx="14" fill="#E7F3FF"/>
    <text x="180" y="20" text-anchor="middle" font-size="11" font-weight="900" fill="${CO}" font-family="system-ui, sans-serif">Uncoiled cochlea: hair cells vibrate</text>
    <path d="${mem}" fill="none" stroke="${CO}" stroke-width="3"/>${hairs}
    ${st.dmg ? `<rect x="${x0}" y="96" width="${.32 * (x1 - x0)}" height="8" rx="4" fill="#A89F9A" opacity=".6"/>` : ""}
    <g font-size="10.5" font-weight="900" fill="${CO}" font-family="system-ui, sans-serif"><text x="${x0}" y="118">Base HIGH</text><text x="${x1}" y="118" text-anchor="end">Apex LOW</text>
      <text x="180" y="118" text-anchor="middle" fill="${heard ? "#C0392B" : "#7A6A66"}">${heard ? "impulses → brain" : A > .02 ? "no impulses" : ""}</text></g>
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
    <section class="card"><div id="memSvg" class="simsvg nozoom"></div>
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
  const pw = Math.sin(st.t * 3) * 3 * fl, mx = x => 16 + x / 640 * 328, my = y => 142 + y / 310 * 264;
  let s = `<rect width="360" height="430" rx="16" fill="#F4FBFF"/>
    <g font-family="system-ui, sans-serif">
      <rect x="10" y="10" width="340" height="114" rx="16" fill="#FFF8EA" stroke="#E0C7A8" stroke-width="2"/>
      ${[28, 58, 86, 318, 286, 256].map((x, i) => `<circle cx="${x}" cy="${32 + (i % 3) * 25}" r="${7 + i % 2}" fill="#A88055" opacity=".85"/>`).join("")}
      <path d="M18 84 C60 74 112 80 160 68 C210 56 266 64 340 46" stroke="#9ED8FF" stroke-width="8" stroke-linecap="round" opacity=".75"/>
      <path d="M46 98 C94 98 142 92 194 106 C246 120 290 98 332 112" stroke="#9ED8FF" stroke-width="5" stroke-linecap="round" opacity=".55"/>
      <path d="M78 112 C90 72 98 44 142 30 C204 8 258 34 296 54 C254 70 226 96 194 112Z" fill="#BFE9A8" stroke="${CO}" stroke-width="4"/>
      <path d="M89 106 C101 73 112 51 146 40 C198 24 241 44 273 58 C238 74 218 96 190 108Z" fill="#F0FFE7" stroke="#4E9B5B" stroke-width="2"/>
      <path d="M116 86 C145 62 185 52 236 60" fill="none" stroke="#75B35B" stroke-width="20" stroke-linecap="round" opacity=".38"/>
      <ellipse cx="220" cy="56" rx="16" ry="10" fill="#B9A6D9" stroke="${CO}" stroke-width="2"/>
      <g font-size="10.5" font-weight="900" fill="${CO}">
        <path d="M272 55 L318 40" stroke="${CO}" stroke-width="1.5"/><text x="322" y="43" text-anchor="end">cell wall</text>
        <path d="M190 104 L218 118" stroke="${CO}" stroke-width="1.5"/><text x="222" y="120">cell membrane</text>
        <path d="M219 56 L250 30" stroke="${CO}" stroke-width="1.5"/><text x="254" y="32">nucleus</text>
        <path d="M146 82 L86 58" stroke="${CO}" stroke-width="1.5"/><text x="23" y="57">large vacuole</text>
        <text x="20" y="28">soil particles + water films</text>
      </g>
    </g>
    <rect x="10" y="132" width="340" height="286" rx="16" fill="#EAF6FF" stroke="#CFE4F4" stroke-width="2"/>
    <rect x="10" y="330" width="340" height="88" rx="16" fill="#FFF3E6" opacity=".95"/>
    <g font-size="12" font-weight="900" fill="#6A5B58" font-family="system-ui, sans-serif"><text x="20" y="154">SOIL WATER (outside)</text><text x="20" y="408">CYTOPLASM (inside)</text></g>`;
  lip.forEach(p => {
    const x = mx(p.x + p.o), top = p.l === 0, hy = my(top ? 124 : 216), ty = my(top ? 168 : 172), dir = top ? 1 : -1, tw = hl === "tail" ? "#E0457B" : "#E0B44A";
    s += `<path d="M${x - 1.8} ${hy + dir * 4} Q${x - 3.2} ${(hy + ty) / 2} ${x - 1.8} ${ty} M${x + 1.8} ${hy + dir * 4} Q${x + 3.2} ${(hy + ty) / 2} ${x + 1.8} ${ty}" stroke="${tw}" stroke-width="${hl === "tail" ? 2.6 : 2}" fill="none" stroke-linecap="round"/>`;
    s += `<circle cx="${x}" cy="${hy}" r="5.4" fill="${hl === "head" || hl === "phospholipid" ? "#FF8FB1" : "#7FB2FF"}" ${hl === "phospholipid" ? `stroke="#E0457B" stroke-width="2.4"` : `stroke="${CO}" stroke-width="1"`}/>`;
  });
  [100, 255, 410, 575].forEach((x, i) => { s += `<rect x="${mx(x) - 3}" y="${my(i % 2 ? 176 : 142)}" width="6" height="20" rx="3" fill="#F7E36D" ${glow("chol")}/>`; });
  const dn = hot ? `fill="#C9C0B8"` : "", jig = hot ? ` rotate(${Math.sin(st.t * 7) * 8})` : "";
  s += `<g transform="translate(${mx(PX.channel + pw)} 0)${jig}"><rect x="-15" y="${my(108)}" width="11" height="${my(232) - my(108)}" rx="6" ${dn || `fill="#9ED39B"`} ${glow("channel")}/><rect x="4" y="${my(108)}" width="11" height="${my(232) - my(108)}" rx="6" ${dn || `fill="#9ED39B"`} ${glow("channel")}/></g>`;
  const open = st.busy > .45 ? "top" : st.busy > 0 ? "bottom" : "top";
  s += `<g transform="translate(${mx(PX.carrier - pw)} 0)${jig}"><path d="${open === "top" ? `M-16 ${my(108)} L-5 ${my(128)} L5 ${my(128)} L16 ${my(108)} L17 ${my(222)} Q0 ${my(238)} -17 ${my(222)}Z` : `M-17 ${my(110)} Q0 ${my(96)} 17 ${my(110)} L16 ${my(232)} L5 ${my(212)} L-5 ${my(212)} L-16 ${my(232)}Z`}" ${dn || `fill="#F7B267"`} ${glow("carrier")}/>
    ${st.busy > 0 ? `<circle cx="0" cy="${my(open === "top" ? 150 : 196)}" r="5.5" fill="${MEM_MOVE[st.cargo] ? MEM_MOVE[st.cargo].c : "#999"}" stroke="${CO}" stroke-width="1.2"/>` : ""}
    ${st.atp > 0 ? `<g opacity="${st.atp}"><circle cx="0" cy="${my(250)}" r="${18 - st.atp * 7}" fill="#FFE27A" stroke="#E0B44A" stroke-width="2"/><text x="0" y="${my(250) + 4}" text-anchor="middle" font-size="10" font-weight="900" fill="${CO}" font-family="system-ui, sans-serif">ATP</text></g>` : ""}</g>`;
  s += `<g transform="translate(${mx(PX.glyco + pw * .7)} 0)${jig}"><rect x="-12" y="${my(110)}" width="24" height="${my(230) - my(110)}" rx="12" ${dn || `fill="#C9A0FF"`} ${glow("glyco")}/><path d="M0 ${my(110)} V${my(88)} M0 ${my(96)} l-10 -8 M0 ${my(88)} l8 -10 M-10 ${my(88)} l-6 -10" stroke="#3FA06B" stroke-width="2.4" stroke-linecap="round"/>${[[0, my(88)], [-10, my(88)], [8, my(78)], [-16, my(78)]].map(([x, y]) => `<polygon points="${x - 4},${y} ${x - 2},${y - 3.5} ${x + 2},${y - 3.5} ${x + 4},${y} ${x + 2},${y + 3.5} ${x - 2},${y + 3.5}" fill="#B9F3C9" stroke="${CO}" stroke-width="1"/>`).join("")}</g>`;
  if (hot) s += [60, 260, 440].map(x => `<ellipse cx="${mx(x)}" cy="${my(170)}" rx="7" ry="34" fill="#EAF6FF" opacity=".85"/>`).join("");
  st.parts.forEach(p => {
    if (p.d > 0) return;
    const c = MEM_MOVE[p.k].c, x = mx(p.x), y = my(p.y);
    s += p.k === "big" ? `<circle cx="${x}" cy="${y}" r="9" fill="${c}" stroke="${CO}" stroke-width="1.6"/><path d="M${x - 5} ${y} q5 -5 10 0" stroke="#fff" stroke-width="1.8" fill="none"/>`
      : p.k === "glucose" ? `<polygon points="${[0, 1, 2, 3, 4, 5].map(i => `${(x + 5.6 * Math.cos(i * Math.PI / 3)).toFixed(1)},${(y + 5.6 * Math.sin(i * Math.PI / 3)).toFixed(1)}`).join(" ")}" fill="${c}" stroke="${CO}" stroke-width="1.2"/>`
      : `<circle cx="${x}" cy="${y}" r="${p.k === "water" ? 3.8 : 5}" fill="${c}" stroke="${CO}" stroke-width="1"/>${p.k === "ion" || p.k === "active" ? `<path d="M${x - 2.8} ${y} H${x + 2.8} M${x} ${y - 2.8} V${y + 2.8}" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>` : ""}`;
  });
  if (st.labels) s += `<g font-size="10.5" font-weight="900" fill="${CO}" font-family="system-ui, sans-serif">
    <path d="M${mx(PX.channel)} ${my(108) - 6} L40 183" stroke="${CO}" stroke-width="1.4"/><text x="44" y="184">channel protein</text>
    <path d="M${mx(PX.carrier)} ${my(118)} L${mx(PX.carrier) + 32} 184" stroke="${CO}" stroke-width="1.4"/><text x="${mx(PX.carrier) + 36}" y="186">carrier protein</text>
    <path d="M${mx(PX.glyco)} ${my(80)} L278 202" stroke="${CO}" stroke-width="1.4"/><text x="274" y="204" text-anchor="end">glycoprotein</text>
    <text x="332" y="${my(152)}" text-anchor="end">phospholipid bilayer</text>
    <path d="M${mx(100)} ${my(200)} V${my(236)}" stroke="${CO}" stroke-width="1.4"/><text x="${mx(100)}" y="${my(248)}" text-anchor="middle">cholesterol</text></g>`;
  return `<svg viewBox="0 0 360 430" role="img" aria-label="Root hair cell membrane with soil particles, water films, carrier proteins, cell wall, vacuole and nucleus">${s}</svg>`;
}
