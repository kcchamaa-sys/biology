/* ============================================================
   5f-d. 🧠 Lab section d: Coordination and response
   New invisible-idea models: reflex arcs and antagonistic arm muscles.
   ============================================================ */

Object.assign(SIM_Q, {
  reflex: [["Why is a withdrawal reflex faster than a voluntary action?", ["The impulse travels through the spinal cord first, along a shorter pathway", "The brain sends the impulse before the receptor is stimulated", "Motor neurones carry impulses faster than sensory neurones only in reflexes", "The effector decides by itself without nerve impulses"], "A spinal reflex uses a short receptor → spinal cord → effector pathway. An impulse also travels to the brain, so pain is felt later."],
    ["A motor neurone is cut in a withdrawal reflex. What happens?", ["The person can feel the stimulus but the muscle does not withdraw", "The hand withdraws but the person feels no pain", "Both pain and withdrawal are normal", "The receptor stops detecting heat"], "The sensory path to the spinal cord and brain still works, but the motor path to the effector muscle is broken."]],
  muscle: [["When the elbow bends, which statement is correct?", ["The biceps contracts and the triceps relaxes", "The triceps contracts and the biceps relaxes", "Both muscles push the forearm upwards", "The tendons contract instead of the muscles"], "Biceps and triceps are antagonistic muscles. To bend the elbow, the biceps shortens and pulls on the radius."],
    ["Why is cartilage useful in a hinge joint?", ["It reduces friction and cushions the ends of the bones", "It contracts to move the bones", "It carries nerve impulses into the muscle", "It joins muscle to bone"], "Cartilage plus synovial fluid gives smooth, low-friction movement at the joint."]]
});

Object.assign(SIM_P, {
  reflex: ["A hot cup touches your finger. What happens first?",
    ["The hand pulls away before the brain feels pain", "The brain feels pain first and then orders the hand away", "Nothing happens unless you choose to move", "The motor neurone detects the heat"],
    "The spinal cord makes a fast reflex response. A separate impulse reaches the brain slightly later, so you feel pain after the withdrawal starts.", "tap ▶ Stimulus and watch which path lights first."],
  muscle: ["You press the 💪 Biceps impulse button. What should the elbow do?",
    ["Bend, because the biceps contracts and pulls the forearm", "Straighten, because the biceps pushes the forearm away", "Stay still, because tendons do the contracting", "Bend only if the triceps contracts too"],
    "Muscles only pull. The biceps shortens, its tendon pulls the radius, and the elbow bends.", "press 💪 Biceps impulse and watch the muscle shape."]
});

simReg({ id: "reflex", ic: "⚡", name: "Reflex arc", sec: "d", ord: 40, topic: "t16", fn: reflexSim,
  words: [["stimulus", "🔥", "a change that is detected"], ["receptor", "🖐️", "detects a stimulus"], ["sensory neurone", "➡️", "carries impulses to the spinal cord"], ["relay neurone", "🔁", "links neurones in the spinal cord"], ["motor neurone", "⬅️", "carries impulses to an effector"], ["effector", "💪", "muscle or gland that responds"], ["synapse", "🌉", "gap where chemicals carry a signal"], ["reflex", "⚡", "fast automatic response"]] });
simReg({ id: "muscle", ic: "💪", name: "Arm muscles & joints", sec: "d", ord: 50, topic: "t16", fn: muscleSim,
  words: [["antagonistic", "↔️", "working in opposite ways"], ["biceps", "💪", "front arm muscle; bends elbow"], ["triceps", "🦾", "back arm muscle; straightens elbow"], ["tendon", "🧵", "joins muscle to bone"], ["hinge joint", "🚪", "joint moving in one plane"], ["cartilage", "🟦", "smooth cushion on bone ends"], ["synovial fluid", "💧", "slippery liquid in a joint"], ["lever", "⚖️", "bone moved by a force"]] });

simStyle(`
.reflex-read,.muscle-read{display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,1fr));gap:8px;margin:8px 0}.reflex-read span,.muscle-read span{background:#F7F2FF;border:2px solid #E1D2FA;border-radius:14px;padding:8px;font-weight:800}.reflex-read b,.muscle-read b{display:block;font-size:1.18rem}.reflex-note,.muscle-note{border-radius:14px;padding:9px 10px;background:#FFF7D8;border:2px solid #F0D875}.reflex-path{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:6px;margin-top:8px}.reflex-path span{border-radius:999px;border:2px solid #DED7EA;background:#fff;padding:7px 8px;font-weight:800;text-align:center}.reflex-path span.on{background:#FFE8A8;border-color:#FFB12E;box-shadow:0 0 0 3px #FFE8A855}.reflex-path span.block{background:#FFE1E1;border-color:#E45C5C}.reflex-legend,.muscle-legend{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.reflex-legend span,.muscle-legend span{border-radius:999px;background:#EEF6FF;padding:5px 8px;font-size:.84rem;font-weight:800}.reflex-synrow{display:grid;grid-template-columns:1fr;gap:8px}.muscle-jointbits{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:8px}.muscle-jointbits span{border-radius:14px;padding:8px;background:#ECFAF2;border:2px solid #BFE8D0;font-weight:800}.muscle-force{height:14px;background:#EFEAF7;border-radius:999px;overflow:hidden;border:1px solid #D7CBE8}.muscle-force i{display:block;height:100%;background:linear-gradient(90deg,#61C685,#FFD257,#E95F52)}@media (prefers-reduced-motion:no-preference){.reflex-pulse{animation:reflex-pop .7s ease-out infinite}.muscle-active{animation:muscle-throb .8s ease-in-out infinite}@keyframes reflex-pop{0%{r:4;opacity:.95}100%{r:14;opacity:.05}}@keyframes muscle-throb{50%{filter:brightness(1.14)}}}
`);

/* Reflex idea: stimulus → receptor → spinal cord reflex path gives a response before the brain path gives pain awareness. */
function reflexSim(root) {
  const st = { stim: "hot", cut: "none", drug: false, zoom: true, t: 0, running: false, pulse: 0, ran: false };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="reflexSvg" class="simsvg"></div>
      <div class="simctl"><div><b class="small">Stimulus</b>${segBtns("rstim", [["hot", "🔥 Hot"], ["pin", "📌 Pin"], ["knee", "🦵 Knee tap"]], st.stim)}</div>
      <div><b class="small">Cut / damage</b>${segBtns("rcut", [["none", "✅ None"], ["sensory", "Sensory"], ["relay", "Relay"], ["motor", "Motor"], ["brain", "To brain"]], st.cut)}</div></div>
      <div class="row simbtns"><button class="btn yellow" id="rRun">▶ Stimulus</button><button class="btn plain" id="rReset">↺ Reset</button></div>
    </section>
    <section class="card"><h3 style="margin:0">⚡ Probe</h3><div id="reflexRead" class="reflex-read"></div><div id="reflexPath" class="reflex-path"></div><p id="reflexWhy" class="small reflex-note"></p>
      <h3 style="margin:10px 0 0">⏱ Reflex vs voluntary</h3><div id="reflexTimer" class="simsvg nozoom"></div><p class="small muted">Reflex: short spinal path. Voluntary: impulse must reach the brain first.</p></section>
    <section class="card"><h3 style="margin:0">🔎 Synapse zoom</h3><label class="small chk"><input type="checkbox" id="rZoom" checked> Show vesicles, neurotransmitter and receptors</label><label class="small chk"><input type="checkbox" id="rDrug"> 💊 Drug blocks receptors</label><div id="reflexSyn" class="simsvg nozoom"></div></section>
  </div>`;
  const start = () => { SFX.click(); st.t = 0; st.running = true; st.ran = true; st.pulse = 1; };
  root.querySelector("#rRun").onclick = start;
  root.querySelector("#rReset").onclick = () => { SFX.tap(); st.t = 0; st.running = false; st.ran = false; st.pulse = 0; };
  root.querySelectorAll("[data-rstim]").forEach(b => b.onclick = () => { SFX.tap(); st.stim = b.dataset.rstim; root.querySelectorAll("[data-rstim]").forEach(x => x.setAttribute("aria-checked", x === b)); start(); });
  root.querySelectorAll("[data-rcut]").forEach(b => b.onclick = () => { SFX.tap(); st.cut = b.dataset.rcut; root.querySelectorAll("[data-rcut]").forEach(x => x.setAttribute("aria-checked", x === b)); st.t = 0; st.running = false; st.ran = false; });
  root.querySelector("#rZoom").onchange = e => { st.zoom = e.target.checked; };
  root.querySelector("#rDrug").onchange = e => { st.drug = e.target.checked; st.t = 0; st.running = false; st.ran = false; };
  const probe = () => reflexProbe(st);
  simProbe(probe);
  simLoop(root, dt => {
    if (st.running) { st.t += dt; if (st.t > .72) st.running = false; }
    st.pulse = Math.max(0, st.pulse - dt);
    const p = probe();
    root.querySelector("#reflexSvg").innerHTML = reflexSvg(st, p);
    root.querySelector("#reflexSyn").innerHTML = st.zoom ? reflexSynapseSvg(st, p) : `<p class="small muted">Tick “Show” to zoom into a synapse.</p>`;
    root.querySelector("#reflexTimer").innerHTML = reflexTimerSvg(p);
    root.querySelector("#reflexRead").innerHTML = `<span>Path lit<b>${esc(p.pathLit)}</b></span><span>Response<b>${p.response ? "✅ yes" : p.done ? "❌ no" : "…"}</b></span><span>Felt pain<b>${p.felt ? "✅ yes" : p.done ? "❌ no" : "…"}</b></span><span>Reflex time<b>${p.response ? p.time + " ms" : p.done ? "blocked" : "…"}</b></span>`;
    root.querySelector("#reflexPath").innerHTML = ["stimulus", "receptor", "sensory", "relay", "motor", "effector", "brain"].map(k => `<span class="${p.lit.includes(k) ? "on" : p.blocked === k ? "block" : ""}">${k}</span>`).join("");
    root.querySelector("#reflexWhy").innerHTML = reflexExplain(st, p);
  });
}
function reflexProbe(st) {
  const sensoryOK = st.cut !== "sensory", synOK = !st.drug, relayOK = sensoryOK && st.cut !== "relay" && synOK, motorOK = relayOK && st.cut !== "motor", brainOK = sensoryOK && st.cut !== "brain";
  const reflexMs = st.stim === "knee" ? 70 : 95, brainMs = st.stim === "knee" ? 185 : 230, voluntaryMs = st.stim === "knee" ? 210 : 285;
  const ms = st.t * 1000, lit = [];
  if (st.ran || st.running) lit.push("stimulus");
  if (ms >= 15) lit.push("receptor");
  if (sensoryOK && ms >= 35) lit.push("sensory");
  if (relayOK && ms >= 60) lit.push("relay");
  if (motorOK && ms >= 78) lit.push("motor");
  if (motorOK && ms >= reflexMs) lit.push("effector");
  if (brainOK && ms >= brainMs) lit.push("brain");
  let blocked = "";
  if (st.ran && ms > 45 && !sensoryOK) blocked = "sensory";
  else if (st.ran && ms > 75 && sensoryOK && (!relayOK)) blocked = "relay";
  else if (st.ran && ms > 95 && relayOK && !motorOK) blocked = "motor";
  else if (st.ran && ms > brainMs && sensoryOK && !brainOK) blocked = "brain";
  const response = motorOK && ms >= reflexMs, felt = brainOK && ms >= brainMs, done = st.ran && !st.running && st.t > .55;
  return { stim: st.stim, damage: st.cut, drug: st.drug, zoom: st.zoom, lit, blocked, pathLit: blocked ? `blocked at ${blocked}` : (lit[lit.length - 1] || "waiting"), response, felt, done, time: reflexMs, reflexMs, voluntaryMs, brainMs };
}
function reflexExplain(st, p) {
  if (!st.ran) return "Tap <b>▶ Stimulus</b>. The orange path will show the impulse route.";
  if (p.drug && p.blocked === "relay") return "💊 Receptors are blocked at the synapse, so the next neurone cannot fire.";
  if (p.blocked === "sensory") return "Sensory neurone cut: no impulse reaches the spinal cord, so there is no response and no pain.";
  if (p.blocked === "motor") return "Motor neurone cut: the spinal cord receives the impulse, but the effector muscle gets no command.";
  if (p.blocked === "brain") return "The reflex still works in the spinal cord, but the separate pathway to the brain is cut.";
  if (p.response && !p.felt) return "The effector has responded. Pain is not felt yet because the brain path is longer.";
  if (p.response && p.felt) return "Reflex first, pain later: a fast protective response before conscious feeling.";
  return "Impulse travelling… watch receptor → sensory → relay → motor → effector.";
}
function reflexSvg(st, p) {
  const hot = st.stim === "hot", knee = st.stim === "knee", pin = st.stim === "pin";
  const on = k => p.lit.includes(k), col = k => on(k) ? "#FFB12E" : p.blocked === k ? "#E45C5C" : "#9BA7BA";
  const w = k => on(k) ? 8 : 4;
  const pulse = p.pathLit;
  const stimIcon = hot ? "🔥 hot object" : pin ? "📌 pin prick" : "🦵 knee tap";
  const hand = knee ? `<path d="M88 180 q38 -22 72 0 q16 10 24 30" fill="none" stroke="#7C5C4D" stroke-width="22" stroke-linecap="round"/><circle cx="186" cy="222" r="15" fill="#F2C2A8" stroke="#7C5C4D" stroke-width="3"/><path d="M178 238 q18 36 4 74" fill="none" stroke="#7C5C4D" stroke-width="20" stroke-linecap="round"/>` : `<path d="M38 216 q50 -60 106 -36 q22 10 24 36 q-8 20 -34 14 l-22 -8 q-16 28 -50 24 q-22 -4 -24 -30Z" fill="#F2C2A8" stroke="#7C5C4D" stroke-width="3"/><path d="M116 178 q-4 -48 18 -72 q10 -8 20 2 q-14 35 2 66" fill="#F2C2A8" stroke="#7C5C4D" stroke-width="3"/>`;
  const stimShape = hot ? `<rect x="34" y="248" width="108" height="38" rx="12" fill="#EA5E43" stroke="#7A2A20" stroke-width="3"/><path d="M54 248 q6 -20 18 0 M84 248 q6 -24 18 0 M114 248 q6 -20 18 0" stroke="#FFD98A" stroke-width="5" fill="none"/>` : pin ? `<path d="M46 266 L126 218" stroke="#596579" stroke-width="5"/><circle cx="42" cy="268" r="11" fill="#D8DEE8" stroke="#596579" stroke-width="3"/><path d="M126 218 l-17 -2 l10 14Z" fill="#596579"/>` : `<path d="M150 226 h88" stroke="#596579" stroke-width="12" stroke-linecap="round"/><path d="M238 226 l-16 -14 v28Z" fill="#596579"/>`;
  const pulseDot = (x, y, k) => pulse === k ? `<circle class="reflex-pulse" cx="${x}" cy="${y}" r="6" fill="#FFB12E"/>` : "";
  return `<svg viewBox="0 0 760 360" role="img" aria-label="Reflex arc from stimulus through spinal cord to effector and brain">
    <rect width="760" height="360" rx="18" fill="#F8FBFF"/><text x="34" y="28" font-size="16" font-weight="900" fill="${CO}">${stimIcon}</text>${stimShape}${hand}
    <circle cx="148" cy="202" r="10" fill="${col("receptor")}" stroke="#fff" stroke-width="3"/><text x="130" y="190" font-size="12" font-weight="900" fill="${CO}">receptor</text>${pulseDot(148,202,"receptor")}
    <path d="M154 202 C228 118 300 98 390 104" fill="none" stroke="${col("sensory")}" stroke-width="${w("sensory")}" stroke-linecap="round"/><circle cx="330" cy="104" r="18" fill="${on("sensory") ? "#FFD778" : "#DCE4F0"}" stroke="${CO}" stroke-width="3"/><text x="284" y="82" font-size="13" font-weight="900" fill="${CO}">dorsal root ganglion</text>${pulseDot(285,120,"sensory")}
    <ellipse cx="458" cy="176" rx="78" ry="112" fill="#EAF0F8" stroke="#66758A" stroke-width="4"/><path d="M420 84 q38 38 0 92 q38 22 0 92 M496 84 q-38 38 0 92 q-38 22 0 92" fill="none" stroke="#BFC9D8" stroke-width="18" stroke-linecap="round"/><path d="M430 116 q28 38 28 60 q0 36 -30 66 M486 116 q-28 38 -28 60 q0 36 30 66" fill="none" stroke="#8B8FA0" stroke-width="18" stroke-linecap="round"/><text x="406" y="338" font-size="13" font-weight="900" fill="${CO}">spinal cord cross-section</text><text x="392" y="58" font-size="12" font-weight="900" fill="#66758A">white matter</text><text x="470" y="178" font-size="12" font-weight="900" fill="#fff">grey</text>
    <path d="M390 104 C420 112 438 126 450 148" fill="none" stroke="${col("sensory")}" stroke-width="${w("sensory")}" stroke-linecap="round"/><path d="M450 148 C428 174 430 204 456 224" fill="none" stroke="${col("relay")}" stroke-width="${w("relay")}" stroke-linecap="round"/><path d="M456 224 C392 250 280 260 168 236" fill="none" stroke="${col("motor")}" stroke-width="${w("motor")}" stroke-linecap="round"/><path d="M168 236 q-36 -42 -14 -72" fill="none" stroke="${col("effector")}" stroke-width="${w("effector")}" stroke-linecap="round" stroke-dasharray="8 7"/>
    <path d="M480 116 C570 78 614 58 660 76" fill="none" stroke="${col("brain")}" stroke-width="${w("brain")}" stroke-linecap="round" stroke-dasharray="9 7"/><path d="M660 76 q34 -40 62 0 q22 34 -10 62 q-28 20 -58 -2 q-28 -24 6 -60Z" fill="${on("brain") ? "#FFD778" : "#E8DDF5"}" stroke="${CO}" stroke-width="3"/><text x="650" y="154" font-size="14" font-weight="900" fill="${CO}">brain feels pain later</text>
    <g font-size="13" font-weight="900" fill="${CO}"><text x="218" y="151">sensory neurone</text><text x="360" y="205">relay</text><text x="242" y="286">motor neurone</text><text x="66" y="154">effector muscle</text></g>
    ${p.blocked ? `<g><circle cx="${p.blocked === "sensory" ? 330 : p.blocked === "relay" ? 450 : p.blocked === "motor" ? 338 : 575}" cy="${p.blocked === "sensory" ? 104 : p.blocked === "relay" ? 174 : p.blocked === "motor" ? 252 : 78}" r="19" fill="#FFE1E1" stroke="#E45C5C" stroke-width="4"/><text x="${p.blocked === "brain" ? 562 : p.blocked === "sensory" ? 318 : p.blocked === "motor" ? 326 : 438}" y="${p.blocked === "brain" ? 84 : p.blocked === "sensory" ? 111 : p.blocked === "motor" ? 259 : 181}" font-size="22" font-weight="900" fill="#E45C5C">×</text></g>` : ""}
  </svg>`;
}
function reflexSynapseSvg(st, p) {
  const active = st.ran && st.t > .045 && st.t < .22, blocked = st.drug;
  const dots = Array.from({ length: active ? 18 : 8 }, (_, i) => `<circle cx="${150 + (active ? (i % 6) * 18 + Math.min(65, st.t * 350) : (i % 4) * 14)}" cy="${86 + (i % 3) * 18}" r="5" fill="#FFB12E" opacity="${active ? .95 : .35}"/>`).join("");
  return `<svg viewBox="0 0 420 190" role="img" aria-label="Synapse zoom with neurotransmitter crossing the cleft">
    <rect width="420" height="190" rx="16" fill="#F9F7FF"/><path d="M32 96 C76 34 146 34 184 76 C154 96 154 124 184 144 C132 160 68 152 32 96Z" fill="#C9E1FF" stroke="${CO}" stroke-width="3"/><path d="M250 42 C318 38 374 68 390 114 C344 150 294 154 250 136 C272 108 272 74 250 42Z" fill="#E5D8FF" stroke="${CO}" stroke-width="3"/>
    <rect x="202" y="24" width="26" height="142" rx="13" fill="#fff" stroke="#B9A9D8" stroke-width="2" stroke-dasharray="5 5"/><text x="215" y="182" text-anchor="middle" font-size="13" font-weight="900" fill="${CO}">cleft</text>
    ${[0,1,2,3,4].map(i => `<circle cx="${106 + i * 14}" cy="${66 + (i % 2) * 54}" r="12" fill="#7EC6FF" stroke="${CO}" stroke-width="2"/>`).join("")}${dots}
    ${[62,86,110,134].map(y => `<path d="M256 ${y} q24 -10 48 0" fill="none" stroke="#7356A6" stroke-width="7" stroke-linecap="round"/>${blocked ? `<path d="M276 ${y - 14} l18 28 M294 ${y - 14} l-18 28" stroke="#E45C5C" stroke-width="5" stroke-linecap="round"/>` : ""}`).join("")}
    <g font-size="13" font-weight="900" fill="${CO}"><text x="54" y="30">vesicles</text><text x="142" y="160">neurotransmitter</text><text x="286" y="32">receptors ${blocked ? "blocked" : "open"}</text></g>
    <text x="210" y="14" text-anchor="middle" font-size="12" font-weight="800" fill="#7A6A66">Chemical signal diffuses across the gap</text>
  </svg>`;
}
function reflexTimerSvg(p) {
  const max = 320, rw = p.reflexMs / max * 320, vw = p.voluntaryMs / max * 320, bw = p.brainMs / max * 320;
  return `<svg viewBox="0 0 420 150" role="img" aria-label="Reflex time ${p.reflexMs} milliseconds compared with voluntary reaction ${p.voluntaryMs} milliseconds">
    <rect width="420" height="150" rx="16" fill="#F7FBFF"/><g font-size="13" font-weight="900" fill="${CO}"><text x="22" y="38">reflex</text><text x="22" y="76">pain felt</text><text x="22" y="114">voluntary</text></g>
    <g transform="translate(92 20)"><rect width="320" height="22" rx="11" fill="#E8EEF7"/><rect width="${rw}" height="22" rx="11" fill="#39B87F"/><text x="${rw + 6}" y="16" font-size="12" font-weight="900" fill="${CO}">${p.reflexMs} ms</text>
    <rect y="38" width="320" height="22" rx="11" fill="#E8EEF7"/><rect y="38" width="${bw}" height="22" rx="11" fill="#FFB12E"/><text x="${bw + 6}" y="54" font-size="12" font-weight="900" fill="${CO}">${p.brainMs} ms</text>
    <rect y="76" width="320" height="22" rx="11" fill="#E8EEF7"/><rect y="76" width="${vw}" height="22" rx="11" fill="#7B61D1"/><text x="${vw + 6}" y="92" font-size="12" font-weight="900" fill="${CO}">${p.voluntaryMs} ms</text></g>
  </svg>`;
}

/* Muscle idea: antagonistic muscles can only pull, so one contracts while the opposite muscle relaxes around the elbow hinge. */
function muscleSim(root) {
  const st = { angle: 118, target: 118, nerve: "none", weight: 1, worn: false, last: 118, impulseT: 0 };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="muscleSvg" class="simsvg"></div>
      <label class="small"><b>Elbow angle</b> <input id="mAngle" type="range" min="55" max="155" value="118" style="width:100%"></label>
      <div class="row simbtns"><button class="btn" id="mBend">💪 Bend</button><button class="btn" id="mStraight">🦾 Straighten</button><button class="btn plain" id="mReset">↺ Reset</button></div></section>
    <section class="card"><h3 style="margin:0">🎛️ Controls</h3><div class="simctl"><div><b class="small">Nerve impulse</b>${segBtns("mnerve", [["none", "None"], ["biceps", "💪 Biceps"], ["triceps", "🦾 Triceps"]], st.nerve)}</div><div><b class="small">Weight in hand</b>${segBtns("mweight", [["0", "🪶 none"], ["1", "🎒 light"], ["2", "🏋️ heavy"]], String(st.weight))}</div></div><label class="small chk"><input id="mWorn" type="checkbox"> 🦴 Cartilage worn (arthritis)</label><div id="muscleRead" class="muscle-read"></div><div id="muscleBits" class="muscle-jointbits"></div><h3 style="margin:10px 0 0">⚖️ Lever force</h3><div class="muscle-force"><i id="mForceBar"></i></div><p id="muscleWhy" class="small muscle-note"></p></section>
  </div>`;
  const slider = root.querySelector("#mAngle");
  const setTarget = (a, nerve) => { st.target = a; st.nerve = nerve || st.nerve; st.impulseT = nerve ? .9 : st.impulseT; slider.value = Math.round(a); root.querySelectorAll("[data-mnerve]").forEach(x => x.setAttribute("aria-checked", x.dataset.mnerve === st.nerve)); };
  root.querySelector("#mBend").onclick = () => { SFX.tap(); setTarget(58, "biceps"); };
  root.querySelector("#mStraight").onclick = () => { SFX.tap(); setTarget(152, "triceps"); };
  root.querySelector("#mReset").onclick = () => { SFX.tap(); st.angle = st.target = 118; st.nerve = "none"; st.impulseT = 0; slider.value = 118; };
  slider.oninput = () => { st.target = Number(slider.value); st.nerve = "none"; };
  root.querySelectorAll("[data-mnerve]").forEach(b => b.onclick = () => { SFX.tap(); const n = b.dataset.mnerve; if (n === "biceps") setTarget(58, "biceps"); else if (n === "triceps") setTarget(152, "triceps"); else { st.nerve = "none"; st.impulseT = 0; } root.querySelectorAll("[data-mnerve]").forEach(x => x.setAttribute("aria-checked", x === b)); });
  root.querySelectorAll("[data-mweight]").forEach(b => b.onclick = () => { SFX.tap(); st.weight = Number(b.dataset.mweight); root.querySelectorAll("[data-mweight]").forEach(x => x.setAttribute("aria-checked", x === b)); });
  root.querySelector("#mWorn").onchange = e => { st.worn = e.target.checked; };
  const probe = () => muscleProbe(st);
  simProbe(probe);
  simLoop(root, dt => {
    st.last = st.angle; const speed = (st.worn ? 58 : 78) / (1 + st.weight * .18);
    if (Math.abs(st.target - st.angle) > .25) st.angle += Math.sign(st.target - st.angle) * Math.min(Math.abs(st.target - st.angle), speed * dt);
    else st.angle = st.target;
    st.impulseT = Math.max(0, st.impulseT - dt); slider.value = Math.round(st.angle);
    const p = probe();
    root.querySelector("#muscleSvg").innerHTML = muscleSvg(st, p);
    root.querySelector("#muscleRead").innerHTML = `<span>Contracts<b>${p.contract === "none" ? "—" : p.contract}</b></span><span>Relaxes<b>${p.relax === "none" ? "—" : p.relax}</b></span><span>Angle<b>${p.angle}°</b></span><span>Force<b>${p.force} N</b></span>`;
    root.querySelector("#muscleBits").innerHTML = `<span>🚪 hinge joint: ${p.angle}°</span><span>🟦 cartilage: ${p.worn ? "worn" : "smooth"}</span><span>💧 synovial fluid: slippery</span><span>🔥 friction: ${p.friction}%</span>`;
    root.querySelector("#mForceBar").style.width = clamp(p.force / 42 * 100, 4, 100) + "%";
    root.querySelector("#muscleWhy").innerHTML = muscleExplain(p);
  });
}
function muscleProbe(st) {
  const d = st.angle - st.last; let contract = "none";
  if (st.impulseT > 0 && st.nerve !== "none") contract = st.nerve;
  else if (d < -.08) contract = "biceps";
  else if (d > .08) contract = "triceps";
  else if (st.weight && st.angle < 138) contract = "biceps";
  const relax = contract === "biceps" ? "triceps" : contract === "triceps" ? "biceps" : "none";
  const load = st.weight === 0 ? 1 : st.weight * 9, lever = 1 + (155 - st.angle) / 120, frictionF = st.worn ? 1.35 : 1;
  const force = Math.round((load * lever + (contract === "none" ? 0 : 5)) * frictionF);
  return { angle: Math.round(st.angle), target: Math.round(st.target), nerve: st.nerve, weight: st.weight, worn: st.worn, contract, relax, action: contract === "biceps" ? "bend" : contract === "triceps" ? "straighten" : "hold", force, friction: st.worn ? 68 : 8, cartilage: st.worn ? "worn" : "smooth", moving: Math.abs(st.target - st.angle) > .5 };
}
function muscleExplain(p) {
  if (p.contract === "biceps") return "💪 Biceps contracts: it shortens, thickens and pulls the radius. The triceps relaxes.";
  if (p.contract === "triceps") return "🦾 Triceps contracts: it pulls the ulna to straighten the elbow. The biceps relaxes.";
  if (p.worn) return "Worn cartilage raises friction, so movement is less smooth and more force is needed.";
  return "Choose a nerve impulse or move the angle. Muscles pull on bones using tendons.";
}
function muscleSvg(st, p) {
  const sh = [126, 175], el = [306, 184], L = 180, th = -(170 - st.angle) * Math.PI / 180, wr = [el[0] + L * Math.cos(th), el[1] + L * Math.sin(th)], hand = [wr[0] + 28 * Math.cos(th), wr[1] + 28 * Math.sin(th)];
  const perp = [-Math.sin(th), Math.cos(th)], bIns = [el[0] + 72 * Math.cos(th) + 18 * perp[0], el[1] + 72 * Math.sin(th) + 18 * perp[1]], tIns = [el[0] + 80 * Math.cos(th) - 22 * perp[0], el[1] + 80 * Math.sin(th) - 22 * perp[1]];
  const bic = p.contract === "biceps", tri = p.contract === "triceps", worn = p.worn;
  const musclePath = (a, b, up, c, active) => `<path class="${active ? "muscle-active" : ""}" d="M${a[0]} ${a[1]} Q${(a[0]+b[0])/2} ${(a[1]+b[1])/2 + up} ${b[0]} ${b[1]}" fill="none" stroke="${c}" stroke-width="${active ? 30 : 18}" stroke-linecap="round" opacity="${active ? .98 : .64}"/>`;
  const tendon = (a, b) => `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="#F8F4E8" stroke-width="7" stroke-linecap="round"/><path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="#84796A" stroke-width="1.5" stroke-linecap="round"/>`;
  const weight = p.weight ? `<g transform="translate(${hand[0]} ${hand[1] + 30})"><path d="M0 -18 v18" stroke="#596579" stroke-width="4"/><rect x="${p.weight === 2 ? -24 : -16}" y="0" width="${p.weight === 2 ? 48 : 32}" height="34" rx="8" fill="${p.weight === 2 ? "#7B61D1" : "#61A5E8"}" stroke="${CO}" stroke-width="3"/><text y="24" text-anchor="middle" font-size="18" font-weight="900" fill="#fff">${p.weight === 2 ? "2" : "1"}</text><path d="M0 42 v42 m-12 -14 l12 16 l12 -16" stroke="#E45C5C" stroke-width="5" fill="none" stroke-linecap="round"/></g>` : "";
  return `<svg viewBox="0 0 620 380" role="img" aria-label="Arm showing biceps triceps elbow hinge joint tendons and lever force">
    <rect width="620" height="380" rx="18" fill="#FFFCF7"/><path d="M80 196 q24 -78 78 -92 q24 -6 42 10 q-38 28 -38 72 q0 46 30 82 q-64 8 -112 -72Z" fill="#F2C2A8" stroke="#7C5C4D" stroke-width="3"/>
    <path d="M${sh[0]} ${sh[1]} L${el[0]} ${el[1]}" stroke="#EBD9B6" stroke-width="34" stroke-linecap="round"/><path d="M${el[0]} ${el[1]} L${wr[0]} ${wr[1]}" stroke="#EBD9B6" stroke-width="28" stroke-linecap="round"/><path d="M${sh[0]} ${sh[1]} L${el[0]} ${el[1]} M${el[0]} ${el[1]} L${wr[0]} ${wr[1]}" stroke="#8A7A63" stroke-width="3" stroke-linecap="round"/>
    <circle cx="${el[0]}" cy="${el[1]}" r="34" fill="#F9F2E1" stroke="${CO}" stroke-width="3"/><path d="M${el[0]-18} ${el[1]-20} q18 ${worn ? 5 : 16} 36 0" stroke="${worn ? "#E45C5C" : "#6CC6D8"}" stroke-width="${worn ? 5 : 11}" fill="none" stroke-linecap="round"/><path d="M${el[0]-18} ${el[1]+20} q18 ${worn ? -5 : -16} 36 0" stroke="${worn ? "#E45C5C" : "#6CC6D8"}" stroke-width="${worn ? 5 : 11}" fill="none" stroke-linecap="round"/><circle cx="${el[0]}" cy="${el[1]}" r="13" fill="#DFF7FF" opacity=".8"/><text x="${el[0]}" y="${el[1]+5}" text-anchor="middle" font-size="13" font-weight="900" fill="${CO}">hinge</text>
    ${musclePath([150, 132], bIns, -42, "#E84D7A", bic)}${musclePath([154, 222], tIns, 44, "#5D7FE8", tri)}${tendon([150,132],[176,142])}${tendon(bIns,[el[0]+64*Math.cos(th),el[1]+64*Math.sin(th)])}${tendon([154,222],[184,214])}${tendon(tIns,[el[0]+74*Math.cos(th),el[1]+74*Math.sin(th)])}
    <circle cx="${hand[0]}" cy="${hand[1]}" r="21" fill="#F2C2A8" stroke="#7C5C4D" stroke-width="3"/>${weight}
    <path d="M${bIns[0]} ${bIns[1]} q-18 12 -34 34" stroke="${bic ? "#E84D7A" : "#A9AFC0"}" stroke-width="5" fill="none" marker-end="url(#mArr)"/><path d="M${tIns[0]} ${tIns[1]} q24 -8 42 -28" stroke="${tri ? "#5D7FE8" : "#A9AFC0"}" stroke-width="5" fill="none" marker-end="url(#mArr)"/>
    <defs><marker id="mArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#596579"/></marker></defs>
    ${worn ? `<g stroke="#E45C5C" stroke-width="4" stroke-linecap="round"><path d="M286 136 l12 18 M322 134 l-12 18 M336 178 l20 2"/></g>` : ""}
    <g font-size="14" font-weight="900" fill="${CO}"><text x="156" y="112">biceps ${bic ? "contracts" : "relaxes"}</text><text x="154" y="260">triceps ${tri ? "contracts" : "relaxes"}</text><text x="360" y="206">radius / ulna</text><text x="210" y="174">humerus</text><text x="362" y="330">Load creates a turning force about the elbow</text></g>
  </svg>`;
}

SIM_CH.reflex = {
  title: "Reflex Rescue", mins: 15,
  story: "Prove that a spinal reflex protects the body before the brain feels pain.",
  missions: [
    { ic: "⚡", name: "Trace the arc", tasks: [
      { type: "goal", ic: "🔥", do: "Set damage to <b>✅ None</b>, then tap <b>▶ Stimulus</b>.", look: "Reflex arc diagram", target: "Effector responds", check: p => p.damage === "none" && !p.drug && p.response, hold: .2, why: "The impulse reached the effector muscle and caused withdrawal." },
      { type: "goal", ic: "🧠", do: "Wait until <b>brain</b> lights after the response.", look: "Orange path + probe", target: "Felt pain after response", check: p => p.damage === "none" && p.response && p.felt, hold: .2, why: "The pain path to the brain is longer, so feeling comes later." },
      { type: "order", ic: "🔢", do: "Put the withdrawal reflex path in order.", items: ["stimulus", "receptor", "sensory neurone", "relay neurone", "motor neurone", "effector", "response"], why: "A reflex arc is receptor → sensory → relay → motor → effector." },
      { type: "pick", ic: "🤔", do: "Which part is the <b>effector</b> here?", look: "Hand / muscle label", opts: [["The arm muscle that pulls the hand away", "💪"], ["The heat itself", "🔥"], ["The dorsal root ganglion", "⚪"], ["The brain path", "🧠"]], miss: ["", "Heat is the stimulus, not the effector.", "The ganglion contains sensory neurone cell bodies.", "The brain feels pain; it is not the responding muscle."], why: "An effector is a muscle or gland that carries out a response." }] },
    { ic: "✂️", name: "Damage test", tasks: [
      { type: "goal", ic: "➡️", do: "Choose <b>Sensory</b> damage, then tap <b>▶ Stimulus</b>.", look: "Probe", target: "No response and no pain", check: p => p.damage === "sensory" && p.done && !p.response && !p.felt, hold: .2, why: "No sensory neurone means no impulse reaches the spinal cord or brain." },
      { type: "goal", ic: "⬅️", do: "Choose <b>Motor</b> damage, then tap <b>▶ Stimulus</b>.", look: "Probe", target: "Pain felt but no response", check: p => p.damage === "motor" && p.done && !p.response && p.felt, hold: .2, why: "The sensory path works, but the effector receives no motor impulse." },
      { type: "goal", ic: "🧠", do: "Choose <b>To brain</b> damage, then tap <b>▶ Stimulus</b>.", look: "Probe", target: "Response yes, felt no", check: p => p.damage === "brain" && p.done && p.response && !p.felt, hold: .2, why: "The spinal reflex can still work without the conscious brain path." },
      { type: "pick", ic: "🔁", do: "Relay neurone damaged: what should you predict?", opts: ["Pain can be felt, but the reflex response is blocked", "The hand withdraws faster than normal", "The receptor stops detecting the stimulus", "Only the motor neurone lights"], miss: ["", "Damage cannot make the path faster.", "The receptor is still at the skin.", "Motor neurone comes after the relay neurone."], why: "The sensory impulse can still travel up to the brain, but the spinal relay to motor is broken." }] },
    { ic: "🌉", name: "Synapse zoom", tasks: [
      { type: "goal", ic: "🔎", do: "Tick <b>Show vesicles</b> and use <b>✅ None</b> damage.", look: "Synapse zoom", target: "Synapse zoom open", check: p => p.zoom && p.damage === "none", hold: .2, why: "The zoom shows vesicles releasing neurotransmitter into the cleft." },
      { type: "goal", ic: "🟡", do: "Tap <b>▶ Stimulus</b> and watch neurotransmitter cross the cleft.", look: "Synapse zoom", target: "Relay neurone lights", check: p => p.zoom && p.lit.includes("relay") && !p.drug, hold: .2, why: "Neurotransmitter diffuses across the cleft and binds to receptors." },
      { type: "goal", ic: "💊", do: "Tick <b>💊 Drug blocks receptors</b>, then tap <b>▶ Stimulus</b>.", look: "Probe + synapse", target: "Blocked at relay", check: p => p.drug && p.done && !p.response && p.blocked === "relay", hold: .2, why: "If receptors are blocked, the next neurone is not stimulated." },
      { type: "fill", ic: "✍️", do: "Complete the synapse sentence.", text: "At a synapse, neurotransmitter {diffuses|contracts|reflects} across the cleft and binds to {receptors|tendons|cartilage}.", why: "Chemical transmitter carries the impulse from one neurone to the next." }] },
    { ic: "⏱", name: "Reaction race", tasks: [
      { type: "goal", ic: "✅", do: "Turn the drug off and choose <b>✅ None</b> damage.", look: "Controls", target: "Normal pathway", check: p => !p.drug && p.damage === "none", hold: .2, why: "Now the reflex and brain pathways are both open." },
      { type: "read", ic: "📏", do: "Read the timer bars.", look: "⏱ Reflex vs voluntary", need: p => !p.drug && p.damage === "none", needTxt: "normal pathway, no drug", fields: [["Reflex time", p => p.reflexMs, 8, "ms"], ["Voluntary reaction", p => p.voluntaryMs, 12, "ms"]], why: "The reflex bar is shorter because the pathway is shorter." },
      { type: "pick", ic: "🏁", do: "Why does the green reflex bar finish first?", look: "Timer", opts: ["It uses the spinal cord first, so the path is shorter", "It waits for a decision in the cerebrum", "It has no receptor", "The muscle detects the heat directly"], miss: ["", "That describes a voluntary action, not a reflex.", "A receptor is needed to detect the stimulus.", "Muscles respond; they do not detect heat here."], why: "Shorter pathway → shorter time → fast protection." }] }
  ]
};

SIM_CH.muscle = {
  title: "Elbow Engineer", mins: 15,
  story: "Show how antagonistic muscles, tendons and a hinge joint move the forearm.",
  missions: [
    { ic: "💪", name: "Bend and straighten", tasks: [
      { type: "goal", ic: "💪", do: "Press <b>💪 Bend</b> until the elbow angle is below 70°.", look: "Arm diagram + probe", target: "Angle ≤ 70°; biceps contracts", check: p => p.angle <= 70 && p.contract === "biceps", meter: p => ({ v: p.angle, min: 55, max: 155, lo: 55, hi: 70, unit: "°", label: "Elbow angle" }), hold: .2, why: "The biceps shortens and pulls on the radius to bend the elbow." },
      { type: "pick", ic: "↔️", do: "While bending, what does the triceps do?", look: "Probe · Contracts / Relaxes", need: p => p.contract === "biceps" && p.angle <= 90, needTxt: "bend the elbow so biceps is contracting", opts: ["It relaxes", "It contracts harder", "It pushes the ulna", "It turns into a tendon"], miss: ["", "If both contracted equally, movement would be difficult.", "Muscles pull; they do not push.", "Tendons connect muscle to bone."], why: "Antagonistic pairs work oppositely: one contracts, the other relaxes." },
      { type: "goal", ic: "🦾", do: "Press <b>🦾 Straighten</b> until the angle is above 145°.", look: "Arm diagram + probe", target: "Angle ≥ 145°; triceps contracts", check: p => p.angle >= 145 && p.contract === "triceps", meter: p => ({ v: p.angle, min: 55, max: 155, lo: 145, hi: 155, unit: "°", label: "Elbow angle" }), hold: .2, why: "The triceps contracts and pulls the ulna to straighten the elbow." },
      { type: "fill", ic: "✍️", do: "Complete the key rule.", text: "Muscles can only {pull|push|detect}; they move bones by pulling on {tendons|cartilage|synovial fluid}.", why: "Tendons transmit the pull from muscle to bone." }] },
    { ic: "⚡", name: "Nerve command", tasks: [
      { type: "goal", ic: "⚡", do: "Press <b>💪 Biceps</b> nerve impulse.", look: "Muscle shape", target: "Biceps active", check: p => p.nerve === "biceps" && p.contract === "biceps", hold: .2, why: "A motor impulse makes the biceps contract." },
      { type: "goal", ic: "⚡", do: "Press <b>🦾 Triceps</b> nerve impulse.", look: "Muscle shape", target: "Triceps active", check: p => p.nerve === "triceps" && p.contract === "triceps", hold: .2, why: "The triceps receives the impulse and pulls in the opposite direction." },
      { type: "order", ic: "🔢", do: "Put the movement steps in order.", items: ["motor neurone sends impulse", "muscle contracts and shortens", "tendon pulls a bone", "forearm moves at the hinge joint"], why: "Nerve impulse → muscle contraction → tendon pull → bone movement." },
      { type: "pick", ic: "🧵", do: "What is the tendon doing?", look: "White tendon lines", opts: ["Connecting muscle to bone so the pull moves the forearm", "Making synovial fluid", "Detecting pain in the skin", "Cushioning the elbow joint"], miss: ["", "Synovial membrane makes the fluid, not the tendon.", "Pain receptors detect pain.", "Cartilage cushions the joint."], why: "A tendon is tough connective tissue joining muscle to bone." }] },
    { ic: "🏋️", name: "Lever and load", tasks: [
      { type: "goal", ic: "🏋️", do: "Set <b>🏋️ heavy</b> weight and bend to about 90°.", look: "Lever force", target: "Heavy load; angle 80–100°", check: p => p.weight === 2 && p.angle >= 80 && p.angle <= 100, meter: p => ({ v: p.angle, min: 55, max: 155, lo: 80, hi: 100, unit: "°", label: "Elbow angle" }), hold: .2, why: "A load in the hand makes a turning force around the elbow." },
      { type: "read", ic: "📏", do: "Read the <b>force</b> needed with the heavy weight.", look: "Probe · Force", need: p => p.weight === 2 && p.angle >= 80 && p.angle <= 100, needTxt: "heavy weight, elbow near 90°", fields: [["Force", p => p.force, 3, "N"]], why: "The heavier load needs a bigger muscle force." },
      { type: "goal", ic: "🪶", do: "Change to <b>🪶 none</b> weight.", look: "Force bar", target: "Force falls", check: p => p.weight === 0 && p.force <= 12, meter: p => ({ v: p.force, min: 0, max: 42, lo: 0, hi: 12, unit: "N", label: "Force" }), hold: .2, why: "With no load, the muscle needs much less force." },
      { type: "pick", ic: "⚖️", do: "Why is the elbow a lever?", opts: ["A force from muscle turns a bone around a joint", "Cartilage contracts to lift the load", "The brain is the fulcrum", "The hand pushes the biceps shorter"], miss: ["", "Cartilage reduces friction; it does not contract.", "The elbow joint is the fulcrum.", "Muscles shorten because they contract, not because the hand pushes them."], why: "Bone = lever, elbow joint = fulcrum, muscle force moves the load." }] },
    { ic: "🦴", name: "Joint health", tasks: [
      { type: "goal", ic: "🦴", do: "Tick <b>Cartilage worn</b>.", look: "Elbow joint", target: "Friction high", check: p => p.worn && p.friction >= 60, hold: .2, why: "Worn cartilage makes the joint rougher, increasing friction." },
      { type: "pick", ic: "💧", do: "Which pair reduces friction in a healthy joint?", look: "Joint labels", opts: ["Cartilage and synovial fluid", "Biceps and triceps", "Sensory and motor neurones", "Humerus and radius only"], miss: ["", "Muscles move the joint; they are not the smooth lining.", "Neurones carry impulses, not joint lubrication.", "Bone ends need smooth coverings and fluid."], why: "Cartilage cushions bone ends; synovial fluid lubricates them." },
      { type: "fill", ic: "✍️", do: "Complete the joint sentence.", text: "The elbow is a {hinge joint|ball-and-socket joint|fixed joint}; it mainly moves in {one plane|all directions|no direction}.", why: "A hinge joint bends and straightens like a door hinge." }] }
  ]
};
