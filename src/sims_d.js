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

simReg({ id: "reflex", ic: "⚡", name: "Reflex arc", sec: "3d", ord: 40, topic: "t16", fn: reflexSim,
  words: [["stimulus", "🔥", "a change that is detected"], ["receptor", "🖐️", "detects a stimulus"], ["sensory neurone", "➡️", "carries impulses to the spinal cord"], ["relay neurone", "🔁", "links neurones in the spinal cord"], ["motor neurone", "⬅️", "carries impulses to an effector"], ["effector", "💪", "muscle or gland that responds"], ["synapse", "🌉", "gap where chemicals carry a signal"], ["reflex", "⚡", "fast automatic response"]] });
simReg({ id: "muscle", ic: "💪", name: "Arm muscles & joints", sec: "3d", ord: 50, topic: "t16", fn: muscleSim,
  words: [["antagonistic", "↔️", "working in opposite ways"], ["biceps", "💪", "front arm muscle; bends elbow"], ["triceps", "🦾", "back arm muscle; straightens elbow"], ["tendon", "🧵", "joins muscle to bone"], ["hinge joint", "🚪", "joint moving in one plane"], ["cartilage", "🟦", "smooth cushion on bone ends"], ["synovial fluid", "💧", "slippery liquid in a joint"], ["lever", "⚖️", "bone moved by a force"]] });

simStyle(`
.reflex-read,.muscle-read{display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,1fr));gap:8px;margin:8px 0}.reflex-read span,.muscle-read span{background:#F7F2FF;border:2px solid #E1D2FA;border-radius:14px;padding:8px;font-weight:800}.reflex-read b,.muscle-read b{display:block;font-size:1.18rem}.reflex-note,.muscle-note{border-radius:14px;padding:9px 10px;background:#FFF7D8;border:2px solid #F0D875}.reflex-path{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:6px;margin-top:8px}.reflex-path span{border-radius:999px;border:2px solid #DED7EA;background:#fff;padding:7px 8px;font-weight:800;text-align:center}.reflex-path span.on{background:#FFE8A8;border-color:#FFB12E;box-shadow:0 0 0 3px #FFE8A855}.reflex-path span.block{background:#FFE1E1;border-color:#E45C5C}.reflex-legend,.muscle-legend{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.reflex-legend span,.muscle-legend span{border-radius:999px;background:#EEF6FF;padding:5px 8px;font-size:.84rem;font-weight:800}.reflex-synrow{display:grid;grid-template-columns:1fr;gap:8px}.muscle-jointbits{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:8px}.muscle-jointbits span{border-radius:14px;padding:8px;background:#ECFAF2;border:2px solid #BFE8D0;font-weight:800}.muscle-force{height:14px;background:#EFEAF7;border-radius:999px;overflow:hidden;border:1px solid #D7CBE8}.muscle-force i{display:block;height:100%;background:linear-gradient(90deg,#61C685,#FFD257,#E95F52)}@media (prefers-reduced-motion:no-preference){.reflex-pulse{animation:reflex-pop .7s ease-out infinite}.muscle-active{animation:muscle-throb .8s ease-in-out infinite}@keyframes reflex-pop{0%{r:4;opacity:.95}100%{r:14;opacity:.05}}@keyframes muscle-throb{50%{filter:brightness(1.14)}}}
`);

/* Reflex idea: stimulus → receptor → spinal cord reflex path gives a response before the brain path gives pain awareness. */
function reflexSim(root) {
  const st = { stim: "hot", cut: "none", drug: false, zoom: true, t: 0, running: false, pulse: 0, ran: false };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="reflexSvg" class="simsvg nozoom"></div>
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
  const w = k => on(k) ? 6 : 3.2;
  const pulse = p.pathLit;
  const stimIcon = hot ? "🔥 hot object" : pin ? "📌 pin prick" : "🦵 knee tap";
  const hand = knee ? `<path d="M36 154 q20 -13 42 0 q10 7 15 20" fill="none" stroke="#7C5C4D" stroke-width="13" stroke-linecap="round"/><circle cx="96" cy="184" r="9" fill="#F2C2A8" stroke="#7C5C4D" stroke-width="2"/><path d="M92 194 q11 28 4 52" fill="none" stroke="#7C5C4D" stroke-width="12" stroke-linecap="round"/>` : `<path d="M18 172 q28 -36 66 -22 q15 7 16 26 q-5 13 -22 10 l-14 -6 q-10 18 -32 16 q-14 -3 -14 -24Z" fill="#F2C2A8" stroke="#7C5C4D" stroke-width="2"/><path d="M67 150 q-2 -32 12 -48 q7 -6 14 1 q-9 24 1 45" fill="#F2C2A8" stroke="#7C5C4D" stroke-width="2"/>`;
  const stimShape = hot ? `<rect x="14" y="204" width="72" height="26" rx="9" fill="#EA5E43" stroke="#7A2A20" stroke-width="2"/><path d="M27 204 q5 -14 13 0 M47 204 q5 -16 13 0 M67 204 q5 -14 13 0" stroke="#FFD98A" stroke-width="3.5" fill="none"/>` : pin ? `<path d="M18 214 L76 178" stroke="#596579" stroke-width="4"/><circle cx="17" cy="215" r="7" fill="#D8DEE8" stroke="#596579" stroke-width="2"/><path d="M76 178 l-13 -1 l8 10Z" fill="#596579"/>` : `<path d="M72 184 h54" stroke="#596579" stroke-width="8" stroke-linecap="round"/><path d="M126 184 l-12 -10 v20Z" fill="#596579"/>`;
  const pulseDot = (x, y, k) => pulse === k ? `<circle class="reflex-pulse" cx="${x}" cy="${y}" r="6" fill="#FFB12E"/>` : "";
  return `<svg viewBox="0 0 360 260" role="img" aria-label="Reflex arc: receptor in skin sends impulses along a sensory neurone through the dorsal root ganglion to grey matter. A relay neurone synapses with a motor neurone in the ventral horn. The motor neurone leaves by the ventral root to the effector muscle. A separate pathway goes to the brain later.">
    <rect width="360" height="260" rx="18" fill="#F8FBFF"/><text x="14" y="22" font-size="13" font-weight="900" fill="${CO}">${stimIcon}</text>${stimShape}${hand}
    <circle cx="79" cy="156" r="7" fill="${col("receptor")}" stroke="#fff" stroke-width="2.5"/><text x="16" y="142" font-size="11" font-weight="900" fill="${CO}">receptor in skin</text>${pulseDot(79,156,"receptor")}
    <path d="M82 156 C116 92 151 73 194 78" fill="none" stroke="${col("sensory")}" stroke-width="${w("sensory")}" stroke-linecap="round"/><circle cx="164" cy="77" r="12" fill="${on("sensory") ? "#FFD778" : "#DCE4F0"}" stroke="${CO}" stroke-width="2.5"/><text x="126" y="58" font-size="11" font-weight="900" fill="${CO}">dorsal root</text><text x="125" y="70" font-size="10.5" font-weight="900" fill="${CO}">ganglion</text><circle cx="160" cy="77" r="3" fill="#7B61D1"/><circle cx="168" cy="75" r="3" fill="#7B61D1"/>${pulseDot(132,93,"sensory")}
    <ellipse cx="228" cy="134" rx="43" ry="72" fill="#EAF0F8" stroke="#66758A" stroke-width="3"/>
    <path d="M207 73 q24 25 0 61 q24 18 0 61 M249 73 q-24 25 0 61 q-24 18 0 61" fill="none" stroke="#C9D3E2" stroke-width="12" stroke-linecap="round"/>
    <path d="M213 94 q15 22 15 40 q0 24 -17 45 M243 94 q-15 22 -15 40 q0 24 17 45" fill="none" stroke="#8B8FA0" stroke-width="12" stroke-linecap="round"/>
    <text x="198" y="216" font-size="11" font-weight="900" fill="${CO}">spinal cord</text><text x="194" y="49" font-size="11" font-weight="900" fill="#66758A">white matter</text><text x="236" y="138" font-size="11" font-weight="900" fill="#fff">grey</text>
    <path d="M194 78 C212 84 218 96 224 111" fill="none" stroke="${col("sensory")}" stroke-width="${w("sensory")}" stroke-linecap="round"/><circle cx="224" cy="111" r="4" fill="#fff" stroke="${CO}" stroke-width="1.4"/><text x="185" y="104" font-size="10.5" font-weight="900" fill="${CO}">synapse</text>
    <path d="M224 111 C207 130 210 148 230 164" fill="none" stroke="${col("relay")}" stroke-width="${w("relay")}" stroke-linecap="round"/><circle cx="226" cy="136" r="5" fill="${on("relay") ? "#FFD778" : "#D8D1E8"}" stroke="${CO}" stroke-width="1.8"/><text x="237" y="157" font-size="11" font-weight="900" fill="${CO}">relay</text>
    <circle cx="230" cy="164" r="6" fill="${on("motor") ? "#FFD778" : "#F0C9D7"}" stroke="${CO}" stroke-width="2"/><text x="235" y="180" font-size="10.5" font-weight="900" fill="${CO}">motor cell body</text>
    <path d="M230 164 C192 189 127 191 88 175" fill="none" stroke="${col("motor")}" stroke-width="${w("motor")}" stroke-linecap="round"/><text x="138" y="205" font-size="11" font-weight="900" fill="${CO}">ventral root · motor neurone</text><path d="M88 175 q-22 -25 -9 -47" fill="none" stroke="${col("effector")}" stroke-width="${w("effector")}" stroke-linecap="round" stroke-dasharray="6 5"/>
    <path d="M242 96 C285 62 315 47 342 62" fill="none" stroke="${col("brain")}" stroke-width="${w("brain")}" stroke-linecap="round" stroke-dasharray="7 6"/><path d="M333 52 q14 -16 25 0 q11 17 -4 31 q-14 10 -28 -2 q-12 -12 7 -29Z" fill="${on("brain") ? "#FFD778" : "#E8DDF5"}" stroke="${CO}" stroke-width="2.3"/><text x="349" y="101" text-anchor="end" font-size="11" font-weight="900" fill="${CO}">brain</text><text x="349" y="113" text-anchor="end" font-size="11" font-weight="900" fill="${CO}">pain later</text>
    <g font-size="11" font-weight="900" fill="${CO}"><text x="102" y="117">sensory neurone</text><text x="17" y="127">effector muscle</text></g>
    ${p.blocked ? `<g><circle cx="${p.blocked === "sensory" ? 164 : p.blocked === "relay" ? 224 : p.blocked === "motor" ? 160 : 301}" cy="${p.blocked === "sensory" ? 77 : p.blocked === "relay" ? 111 : p.blocked === "motor" ? 185 : 58}" r="13" fill="#FFE1E1" stroke="#E45C5C" stroke-width="3"/><text x="${p.blocked === "brain" ? 292 : p.blocked === "sensory" ? 157 : p.blocked === "motor" ? 153 : 218}" y="${p.blocked === "brain" ? 65 : p.blocked === "sensory" ? 84 : p.blocked === "motor" ? 192 : 118}" font-size="18" font-weight="900" fill="#E45C5C">×</text></g>` : ""}
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
  const barText = (w, y, t) => `<text x="${w > 270 ? w - 6 : w + 6}" y="${y}" font-size="12" font-weight="900" fill="${CO}" text-anchor="${w > 270 ? "end" : "start"}">${t}</text>`;
  return `<svg viewBox="0 0 420 150" role="img" aria-label="Reflex time ${p.reflexMs} milliseconds compared with voluntary reaction ${p.voluntaryMs} milliseconds">
    <rect width="420" height="150" rx="16" fill="#F7FBFF"/><g font-size="13" font-weight="900" fill="${CO}"><text x="22" y="38">reflex</text><text x="22" y="76">pain felt</text><text x="22" y="114">voluntary</text></g>
    <g transform="translate(92 20)"><rect width="320" height="22" rx="11" fill="#E8EEF7"/><rect width="${rw}" height="22" rx="11" fill="#39B87F"/>${barText(rw, 16, p.reflexMs + " ms")}
    <rect y="38" width="320" height="22" rx="11" fill="#E8EEF7"/><rect y="38" width="${bw}" height="22" rx="11" fill="#FFB12E"/>${barText(bw, 54, p.brainMs + " ms")}
    <rect y="76" width="320" height="22" rx="11" fill="#E8EEF7"/><rect y="76" width="${vw}" height="22" rx="11" fill="#7B61D1"/>${barText(vw, 92, p.voluntaryMs + " ms")}</g>
  </svg>`;
}

/* Muscle idea: antagonistic muscles can only pull, so one contracts while the opposite muscle relaxes around the elbow hinge. */
function muscleSim(root) {
  const st = { angle: 118, target: 118, nerve: "none", weight: 1, worn: false, last: 118, impulseT: 0 };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="muscleSvg" class="simsvg nozoom"></div>
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
  const sh = [82, 158], el = [198, 168], L = 130, th = -(170 - st.angle) * Math.PI / 180;
  const wr = [el[0] + L * Math.cos(th), el[1] + L * Math.sin(th)], hand = [wr[0] + 20 * Math.cos(th), wr[1] + 20 * Math.sin(th)];
  const perp = [-Math.sin(th), Math.cos(th)];
  const rad = [el[0] + 54 * Math.cos(th) + 8 * perp[0], el[1] + 54 * Math.sin(th) + 8 * perp[1]];
  const ulna = [el[0] + 60 * Math.cos(th) - 10 * perp[0], el[1] + 60 * Math.sin(th) - 10 * perp[1]];
  const bOrg = [72, 127], tOrg = [74, 198], bic = p.contract === "biceps", tri = p.contract === "triceps", worn = p.worn;
  const bone = (a, b, w) => `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="#EBD9B6" stroke-width="${w}" stroke-linecap="round"/><path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="#8A7A63" stroke-width="2.4" stroke-linecap="round"/>`;
  const tendon = (a, b) => `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="#FFF9EA" stroke-width="5.5" stroke-linecap="round"/><path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="#817566" stroke-width="1.3" stroke-linecap="round"/>`;
  const muscle = (a, b, lift, col, on) => `<path class="${on ? "muscle-active" : ""}" d="M${a[0]} ${a[1]} Q${(a[0]+b[0])/2} ${(a[1]+b[1])/2 + lift} ${b[0]} ${b[1]}" fill="none" stroke="${col}" stroke-width="${on ? 22 : 15}" stroke-linecap="round" opacity="${on ? .98 : .62}"/>`;
  const lab = (x, y, t, col = CO) => `<text x="${x}" y="${y}" font-size="12.5" font-weight="900" fill="${col}">${t}</text>`;
  const weight = p.weight ? `<g transform="translate(${hand[0]} ${hand[1] + 20})"><path d="M0 -12 v14" stroke="#596579" stroke-width="3.5"/><rect x="${p.weight === 2 ? -18 : -13}" y="0" width="${p.weight === 2 ? 36 : 26}" height="28" rx="7" fill="${p.weight === 2 ? "#7B61D1" : "#61A5E8"}" stroke="${CO}" stroke-width="2.5"/><text y="19" text-anchor="middle" font-size="15" font-weight="900" fill="#fff">${p.weight === 2 ? "2" : "1"}</text><path d="M0 36 v22 m-9 -10 l9 12 l9 -12" stroke="#E45C5C" stroke-width="4" fill="none" stroke-linecap="round"/></g>` : "";
  return `<svg viewBox="0 0 420 330" role="img" aria-label="Accurate arm model: scapula humerus radius ulna biceps triceps tendons elbow hinge cartilage synovial membrane fluid and ligaments">
    <defs><marker id="mArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#596579"/></marker></defs>
    <rect width="420" height="330" rx="18" fill="#FFFCF7"/>
    <path d="M34 92 q42 -30 78 -4 q-28 34 -16 82 q8 32 36 58 q-70 16 -106 -40 q-18 -42 8 -96Z" fill="#F2C2A8" stroke="#7C5C4D" stroke-width="2.5"/>
    <path d="M62 112 q35 -10 58 9" fill="none" stroke="#7C5C4D" stroke-width="3" stroke-linecap="round"/>
    ${bone(sh, el, 27)}${bone([el[0], el[1] - 7], [wr[0] + 7 * perp[0], wr[1] + 7 * perp[1]], 12)}${bone([el[0], el[1] + 9], [wr[0] - 8 * perp[0], wr[1] - 8 * perp[1]], 12)}
    <circle cx="${el[0]}" cy="${el[1]}" r="27" fill="#FFF4DC" stroke="${CO}" stroke-width="2.5"/>
    <ellipse cx="${el[0]}" cy="${el[1]}" rx="34" ry="24" fill="none" stroke="#C28FB8" stroke-width="3" stroke-dasharray="5 4"/>
    <path d="M${el[0]-16} ${el[1]-15} q16 ${worn ? 4 : 12} 32 0" stroke="${worn ? "#E45C5C" : "#6CC6D8"}" stroke-width="${worn ? 4 : 8}" fill="none" stroke-linecap="round"/>
    <path d="M${el[0]-16} ${el[1]+15} q16 ${worn ? -4 : -12} 32 0" stroke="${worn ? "#E45C5C" : "#6CC6D8"}" stroke-width="${worn ? 4 : 8}" fill="none" stroke-linecap="round"/>
    <circle cx="${el[0]}" cy="${el[1]}" r="10" fill="#DFF7FF" opacity=".92"/><path d="M${el[0]-24} ${el[1]-30} q24 -16 48 0 M${el[0]-27} ${el[1]+28} q27 19 54 0" stroke="#B88A54" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${muscle(bOrg, rad, -33, "#E84D7A", bic)}${muscle(tOrg, ulna, 35, "#5D7FE8", tri)}
    ${tendon(bOrg, [96, 132])}${tendon(rad, [el[0] + 38 * Math.cos(th) + 6 * perp[0], el[1] + 38 * Math.sin(th) + 6 * perp[1]])}${tendon(tOrg, [99, 200])}${tendon(ulna, [el[0] + 45 * Math.cos(th) - 8 * perp[0], el[1] + 45 * Math.sin(th) - 8 * perp[1]])}
    <circle cx="${hand[0]}" cy="${hand[1]}" r="17" fill="#F2C2A8" stroke="#7C5C4D" stroke-width="2.5"/>${weight}
    <path d="M${rad[0]} ${rad[1]} q-15 8 -27 25" stroke="${bic ? "#E84D7A" : "#A9AFC0"}" stroke-width="4" fill="none" marker-end="url(#mArr)"/><path d="M${ulna[0]} ${ulna[1]} q19 -8 32 -26" stroke="${tri ? "#5D7FE8" : "#A9AFC0"}" stroke-width="4" fill="none" marker-end="url(#mArr)"/>
    ${worn ? `<g stroke="#E45C5C" stroke-width="3.5" stroke-linecap="round"><path d="M181 124 l12 16 M215 124 l-12 16 M226 169 l15 3"/></g>` : ""}
    <g>${lab(24, 82, "scapula")}${lab(112, 126, "humerus")}${lab(226, 133, "radius")}${lab(226, 203, "ulna")}${lab(92, 101, "biceps origin")}${lab(Math.max(150, Math.min(286, rad[0] - 10)), Math.max(42, Math.min(286, rad[1] - 18)), "inserts on radius", "#A83B62")}${lab(142, 294, "triceps inserts on ulna", "#405FB8")}${lab(158, 217, "cartilage + fluid")}${lab(154, 239, "synovial membrane")}${lab(170, 103, "ligaments")}${lab(260, 314, "load = turning force")}</g>
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
