/* ============================================================
   5f-f. 🌍 Lab section f: Ecosystems
   Food webs + quadrat sampling for HKDSE Ecosystems (topic t18).
   ============================================================ */

if (!document.getElementById("sim-f-style")) {
  const fwStyle = document.createElement("style");
  fwStyle.id = "sim-f-style";
  fwStyle.textContent = `
  .fw-key,.quad-key{display:flex;flex-wrap:wrap;gap:6px}.fw-key span,.quad-key span{display:inline-flex;align-items:center;gap:4px;border:2px solid #E6DCD2;border-radius:999px;background:#fff;padding:4px 8px;font-size:.82rem;font-weight:800}
  .fw-node{cursor:pointer}.fw-node circle{transition:transform .15s}.fw-node:hover circle,.fw-node.sel circle{transform:scale(1.06);filter:drop-shadow(0 3px 3px rgba(0,0,0,.18))}
  .fw-species{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:6px}.fw-species button{min-height:44px;border:2px solid #E6DCD2;border-radius:13px;background:#fff;font-weight:900;color:var(--ink)}.fw-species button[aria-pressed=true]{background:#E6F8EC;border-color:#3FA06B}
  .fw-read,.quad-read{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px}.fw-read b,.quad-read b{display:block;font-size:1.25rem}
  .fw-pyr{display:grid;gap:8px}.fw-bar{display:grid;grid-template-columns:84px 1fr 72px;gap:6px;align-items:center}.fw-bar i{display:block;height:18px;border-radius:999px;border:2px solid rgba(107,74,107,.18)}
  .fw-chain{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:8px}
  .fw-chain button,.quad-target button{min-height:44px;border:2px solid #E6DCD2;border-radius:12px;background:#fff;font-weight:900;color:var(--ink);padding:6px 8px}.fw-chain button[aria-checked=true],.quad-target button[aria-checked=true]{background:#EAF6FF;border-color:#3E8FDF}
  .quad-target{display:flex;flex-wrap:wrap;gap:6px}.quad-field-dot{stroke:#fff;stroke-width:.7}
  .quad-table th,.quad-table td{padding:5px 6px;text-align:right}.quad-table th:first-child,.quad-table td:first-child{text-align:left}.quad-table .unlock{color:#8C6B35;font-weight:900}
  .quad-mode-panels{display:grid;gap:12px}.quad-note{border:2px dashed #D9CBBE;border-radius:14px;padding:8px;background:#FFF8E8}
  `;
  document.head.appendChild(fwStyle);
}

/* ---------------- 🕸️ Food web & energy ---------------- */
const FW_SPEC = [
  { id: "algae", name: "algae", ic: "🟢", lv: "Producer", col: "#5EBB63", x: 78, y: 240, init: 9000, K: 16000, r: .28, mass: .02, eats: [] },
  { id: "pondweed", name: "pondweed", ic: "🌿", lv: "Producer", col: "#3FA06B", x: 238, y: 245, init: 1600, K: 2700, r: .22, mass: .5, eats: [] },
  { id: "mosquito", name: "mosquito larva", ic: "〰️", lv: "Primary", col: "#F5C96B", x: 72, y: 145, init: 600, K: 1300, r: .2, mass: .02, eats: ["algae"] },
  { id: "snail", name: "snail", ic: "🐚", lv: "Primary", col: "#EFC15B", x: 248, y: 145, init: 320, K: 760, r: .16, mass: 3, eats: ["algae", "pondweed"] },
  { id: "tadpole", name: "tadpole", ic: "⚫", lv: "Primary", col: "#F2D276", x: 395, y: 150, init: 220, K: 520, r: .14, mass: 1, eats: ["algae"] },
  { id: "dragonfly", name: "dragonfly nymph", ic: "💧", lv: "Secondary", col: "#EE8A4A", x: 108, y: 57, init: 80, K: 190, r: .12, mass: .3, eats: ["mosquito", "tadpole"] },
  { id: "smallfish", name: "small fish", ic: "🐟", lv: "Secondary", col: "#E97856", x: 316, y: 58, init: 55, K: 130, r: .1, mass: 8, eats: ["mosquito", "snail", "tadpole"] },
  { id: "kingfisher", name: "kingfisher", ic: "🐦", lv: "Tertiary", col: "#9C76D8", x: 505, y: 62, init: 6, K: 18, r: .06, mass: 40, eats: ["smallfish", "dragonfly"] },
  { id: "decomp", name: "decomposers", ic: "🍄", lv: "Decomposer", col: "#B98A5A", x: 505, y: 245, init: 1100, K: 2200, r: .08, mass: .001, eats: ["detritus"] }
];
const FW = Object.fromEntries(FW_SPEC.map(s => [s.id, s]));
const FW_CHAINS = [
  ["pondweed", "snail", "smallfish", "kingfisher"],
  ["algae", "mosquito", "dragonfly", "kingfisher"],
  ["algae", "tadpole", "smallfish", "kingfisher"]
];
const fwChainKey = c => c.join(">");
const fwLabel = id => FW[id].name;

simReg({ id: "foodweb", ic: "🕸️", name: "Food web & energy", sec: "f", ord: 10, topic: "t18", fn: foodwebSim,
  words: [["producer", "🌿", "makes food by photosynthesis"], ["consumer", "🐟", "gets energy by feeding"], ["decomposer", "🍄", "breaks down dead matter"], ["trophic level", "🔺", "feeding position in a food chain"], ["biomass", "⚖️", "total mass of living material"], ["energy transfer", "🔥", "energy passed to the next level"], ["respiration", "💨", "releases energy; heat is lost"]] });

function foodwebSim(root) {
  const st = { pop: Object.fromEntries(FW_SPEC.map(s => [s.id, s.init])), on: Object.fromEntries(FW_SPEC.map(s => [s.id, true])), sel: "algae", chain: fwChainKey(FW_CHAINS[1]), run: false, fast: false, t: 0, acc: 0, last: "none", hist: [] };
  st.hist.push(fwSnapshot(st));
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="fwMap" class="simsvg"></div>
      <div class="fw-key">${[["Producer", "#3FA06B", "🌿"], ["Primary", "#F5C96B", "1°"], ["Secondary", "#EE8A4A", "2°"], ["Tertiary", "#9C76D8", "3°"], ["Decomposer", "#B98A5A", "🍄"]].map(k => `<span><i style="width:12px;height:12px;border-radius:999px;background:${k[1]};display:inline-block"></i>${k[2]} ${k[0]}</span>`).join("")}</div>
      <div class="fw-species">${FW_SPEC.map(s => `<button data-fw-sel="${s.id}" aria-pressed="${s.id === st.sel}">${s.ic} ${s.name}</button>`).join("")}</div>
      <div class="row simbtns"><button class="btn yellow" data-fw-act="remove">➖ Remove</button><button class="btn" data-fw-act="add">➕ Add back</button><button class="btn blue" data-fw-act="double">✖️2 Double</button></div></section>
    <section class="card"><h3 style="margin:0">📈 Population graph</h3><div id="fwGraph" class="simsvg nozoom"></div>
      <div class="row simbtns"><button class="btn" id="fwRun">▶ Run</button><button class="btn plain" id="fwFast">⏩ Fast</button><button class="btn plain" id="fwReset">↺ Reset</button></div>
      <div id="fwRead" class="fw-read"></div></section></div>
    <section class="card"><h3 style="margin:0">🔺 Pick a food chain → pyramid</h3><div class="fw-chain">${FW_CHAINS.map(c => `<button role="radio" aria-checked="${fwChainKey(c) === st.chain}" data-fw-chain="${fwChainKey(c)}">${c.map(id => FW[id].ic + " " + FW[id].name).join(" → ")}</button>`).join("")}</div><div id="fwPyramid"></div></section>
    <section class="card"><h3 style="margin:0">🔥 Where does energy go?</h3><div class="quad-note">Only about <b>10%</b> reaches the next trophic level. Most is lost as <b>heat from respiration</b>, in <b>faeces</b>, or in <b>uneaten parts</b>.</div></section>`;
  const wireSpecies = () => {
    root.querySelectorAll("[data-fw-sel]").forEach(b => {
      b.setAttribute("aria-pressed", b.dataset.fwSel === st.sel ? "true" : "false");
      b.onclick = () => { SFX.tap(); st.sel = b.dataset.fwSel; st.last = "select:" + st.sel; draw(); };
    });
  };
  root.querySelector("#fwMap").onclick = e => {
    const g = e.target.closest("[data-fw-node]"); if (!g) return;
    SFX.tap(); st.sel = g.dataset.fwNode; st.last = "select:" + st.sel; draw();
  };
  root.querySelectorAll("[data-fw-act]").forEach(b => b.onclick = () => {
    SFX.tap(); const id = st.sel, act = b.dataset.fwAct;
    if (act === "remove") { st.on[id] = false; st.pop[id] = 0; }
    if (act === "add") { st.on[id] = true; st.pop[id] = Math.max(st.pop[id], FW[id].init * .55); }
    if (act === "double") { st.on[id] = true; st.pop[id] = Math.min(FW[id].K, Math.max(1, st.pop[id]) * 2); }
    st.last = act + ":" + id; st.hist.push(fwSnapshot(st)); draw();
  });
  root.querySelectorAll("[data-fw-chain]").forEach(b => b.onclick = () => {
    SFX.tap(); st.chain = b.dataset.fwChain; st.last = "chain:" + st.chain; draw();
  });
  root.querySelector("#fwRun").onclick = () => { SFX.tap(); st.run = !st.run; root.querySelector("#fwRun").textContent = st.run ? "⏸ Pause" : "▶ Run"; };
  root.querySelector("#fwFast").onclick = () => { SFX.tap(); st.fast = !st.fast; root.querySelector("#fwFast").textContent = st.fast ? "⏩ Fast: on" : "⏩ Fast"; };
  root.querySelector("#fwReset").onclick = () => { SFX.tap(); FW_SPEC.forEach(s => { st.pop[s.id] = s.init; st.on[s.id] = true; }); st.t = 0; st.hist = [fwSnapshot(st)]; st.last = "reset"; draw(); };
  simProbe(() => fwProbe(st));
  const draw = () => {
    wireSpecies();
    root.querySelector("#fwMap").innerHTML = fwMapSvg(st);
    root.querySelector("#fwGraph").innerHTML = fwGraphSvg(st);
    root.querySelector("#fwRead").innerHTML = fwReadHtml(st);
    root.querySelector("#fwPyramid").innerHTML = fwPyramidHtml(st);
    root.querySelectorAll("[data-fw-chain]").forEach(b => b.setAttribute("aria-checked", b.dataset.fwChain === st.chain ? "true" : "false"));
  };
  draw();
  simLoop(root, dt => {
    if (st.run) {
      st.acc += dt * (st.fast ? 5 : 1.5);
      while (st.acc >= 1) { fwStep(st); st.acc -= 1; }
      draw();
    }
  });
}
function fwSnapshot(st) { return { t: st.t, pop: Object.fromEntries(FW_SPEC.map(s => [s.id, Math.round(st.pop[s.id])])) }; }
function fwStep(st) {
  const old = Object.assign({}, st.pop), next = Object.assign({}, st.pop);
  FW_SPEC.forEach(s => {
    if (!st.on[s.id]) { next[s.id] = 0; return; }
    if (s.id === "decomp") return;
    const predators = FW_SPEC.filter(p => p.eats.includes(s.id));
    const predPressure = predators.reduce((a, p) => a + (old[p.id] / p.init) * .035, 0);
    let d;
    if (!s.eats.length) d = s.r * old[s.id] * (1 - old[s.id] / s.K) - predPressure * old[s.id];
    else {
      const food = s.eats.reduce((a, id) => a + old[id] / FW[id].init, 0) / s.eats.length;
      d = old[s.id] * s.r * (food - .48) - predPressure * old[s.id];
    }
    next[s.id] = clamp(old[s.id] + d, 0, s.K);
  });
  const missing = FW_SPEC.filter(s => s.id !== "decomp").reduce((a, s) => a + Math.max(0, 1 - next[s.id] / s.init), 0);
  next.decomp = clamp(old.decomp + (950 + missing * 135 - old.decomp) * .08, 250, FW.decomp.K);
  st.pop = next; st.t += 1; st.hist.push(fwSnapshot(st)); st.hist = st.hist.slice(-26);
}
function fwProbe(st) {
  const pyr = fwPyramidVals(st), chain = st.chain.split(">");
  const p = { t: st.t, running: st.run, selected: st.sel, selectedPop: Math.round(st.pop[st.sel]), chain: st.chain, chainLen: chain.length, lastAction: st.last, energy_producer: pyr.energy[0], energy_primary: pyr.energy[1], energy_secondary: pyr.energy[2], energy_tertiary: pyr.energy[3], heatLoss: +(pyr.energy[0] * .9).toFixed(1) };
  FW_SPEC.forEach(s => { p["pop_" + s.id] = Math.round(st.pop[s.id]); p["on_" + s.id] = !!st.on[s.id]; });
  return p;
}
function fwMapSvg(st) {
  const edges = [];
  FW_SPEC.forEach(s => s.eats.forEach(prey => prey !== "detritus" && edges.push([prey, s.id])));
  return `<svg viewBox="0 0 600 310" role="img" aria-label="Hong Kong pond food web. Arrows show energy flows from food to feeder.">
    <defs><marker id="fwArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#6B4A6B"/></marker></defs>
    <rect width="600" height="310" rx="18" fill="#EAF7FF"/><path d="M0 255 C120 230 180 285 310 252 S500 220 600 255 V310 H0Z" fill="#BFE8D5"/>
    <text x="300" y="24" text-anchor="middle" font-size="18" font-weight="900" fill="${CO}">HK pond: energy flows to the eater</text>
    ${edges.map(([a, b]) => {
      const A = FW[a], B = FW[b], on = st.pop[a] > 1 && st.pop[b] > 1;
      return `<path d="M${A.x} ${A.y} C${(A.x + B.x) / 2} ${A.y - 30}, ${(A.x + B.x) / 2} ${B.y + 30}, ${B.x} ${B.y}" fill="none" stroke="${on ? "#6B4A6B" : "#CFC4BA"}" stroke-width="${on ? 3 : 2}" stroke-dasharray="${on ? "0" : "6 5"}" marker-end="url(#fwArr)"/>`;
    }).join("")}
    <path d="M500 225 C450 205 395 225 332 218" fill="none" stroke="#B98A5A" stroke-width="3" stroke-dasharray="5 4" marker-end="url(#fwArr)"/><text x="438" y="217" font-size="12" font-weight="900" fill="#7A5B38">dead matter</text>
    ${FW_SPEC.map(s => {
      const r = s.id === "decomp" ? 35 : 31, faint = st.pop[s.id] < 1, sel = st.sel === s.id;
      return `<g class="fw-node ${sel ? "sel" : ""}" data-fw-node="${s.id}" role="button" tabindex="0" aria-label="${s.name}, ${Math.round(st.pop[s.id])}">
        <circle cx="${s.x}" cy="${s.y}" r="${r}" fill="${faint ? "#EEE7DF" : s.col}" stroke="${sel ? "#1E66B8" : CO}" stroke-width="${sel ? 5 : 3}" opacity="${faint ? .55 : 1}"/>
        <text x="${s.x}" y="${s.y - 4}" text-anchor="middle" font-size="19" font-weight="900" fill="${CO}">${s.ic}</text>
        <text x="${s.x}" y="${s.y + 15}" text-anchor="middle" font-size="11" font-weight="900" fill="${CO}">${Math.round(st.pop[s.id])}</text>
        <text x="${s.x}" y="${s.y + r + 15}" text-anchor="middle" font-size="12" font-weight="900" fill="${CO}">${s.name}</text>
      </g>`;
    }).join("")}
  </svg>`;
}
function fwGraphSvg(st) {
  const ids = ["algae", "pondweed", "mosquito", "snail", "tadpole", "dragonfly", "smallfish", "kingfisher"];
  const X = t => 38 + (t - Math.max(0, st.t - 24)) / 24 * 340, Y = (id, v) => 156 - (v / FW[id].K) * 128;
  let s = `<svg viewBox="0 0 390 176" role="img" aria-label="Population graph over time"><rect width="390" height="176" rx="14" fill="#fff"/><path d="M38 18 V156 H372" stroke="${CO}" stroke-width="2"/><text x="205" y="171" text-anchor="middle" font-size="10" font-weight="800" fill="#7A6A66">time (months) →</text><text x="12" y="91" transform="rotate(-90 12 91)" font-size="10" font-weight="800" fill="#7A6A66">population (% of carrying capacity)</text>`;
  ids.forEach(id => {
    const pts = st.hist.map(h => `${X(h.t).toFixed(1)},${Y(id, h.pop[id]).toFixed(1)}`).join(" ");
    s += `<polyline points="${pts}" fill="none" stroke="${FW[id].col}" stroke-width="${id === st.sel ? 4 : 2}" opacity="${id === st.sel ? 1 : .65}"/>`;
  });
  s += `<text x="48" y="30" font-size="11" font-weight="900" fill="${CO}">Month ${st.t}</text>${ids.slice(0, 6).map((id, i) => `<text x="${62 + i * 52}" y="30" font-size="9" font-weight="900" fill="${FW[id].col}">${FW[id].ic} ${FW[id].name.split(" ")[0]}</text>`).join("")}</svg>`;
  return s;
}
function fwReadHtml(st) {
  const s = FW[st.sel], predators = FW_SPEC.filter(p => p.eats.includes(s.id)).map(p => p.name).join(", ") || "none";
  return `<div><small>Selected</small><b>${s.ic} ${s.name}</b></div><div><small>Population</small><b>${Math.round(st.pop[st.sel])}</b></div><div><small>Trophic level</small><b>${s.lv}</b></div><div><small>Eaten by</small><b style="font-size:.95rem">${predators}</b></div>`;
}
function fwPyramidVals(st) {
  const chain = st.chain.split(">"), base = Math.max(1, st.pop[chain[0]] / FW[chain[0]].init * 10000);
  return { chain, numbers: chain.map(id => Math.round(st.pop[id])), biomass: chain.map(id => +(st.pop[id] * FW[id].mass).toFixed(1)), energy: chain.map((_, i) => +(base * Math.pow(.1, i)).toFixed(i ? 1 : 0)) };
}
function fwPyramidHtml(st) {
  const v = fwPyramidVals(st), maxN = Math.max(...v.numbers, 1), maxB = Math.max(...v.biomass, 1), maxE = Math.max(...v.energy, 1);
  const rows = v.chain.map((id, i) => {
    const w = (arr, max) => clamp(arr[i] / max * 100, 5, 100);
    return `<div class="fw-bar"><b>${FW[id].ic} ${FW[id].name}</b><i style="width:${w(v.numbers, maxN)}%;background:${FW[id].col}"></i><span>${v.numbers[i]}</span>
      <b>biomass</b><i style="width:${w(v.biomass, maxB)}%;background:#BFE8D5"></i><span>${v.biomass[i]} g</span>
      <b>energy</b><i style="width:${w(v.energy, maxE)}%;background:#FFD27A"></i><span>${v.energy[i]} kJ</span></div>`;
  }).reverse().join("");
  return `<div class="fw-pyr">${rows}<p class="small muted" style="margin:0">Energy is upright: about <b>10%</b> passes up each step; about <b>${(v.energy[0] * .9).toFixed(0)} kJ</b> is lost after level 1.</p></div>`;
}

/* ---------------- 🟩 Quadrat sampling ---------------- */
const QUAD_W = 100, QUAD_H = 60, QUAD_AREA = QUAD_W * QUAD_H;
const QUAD_SPEC = [
  ["grass", "short grass", "🌱", "#55A95C"],
  ["daisy", "yellow daisy", "🌼", "#E8B83E"],
  ["reed", "wet-shade reed", "🌾", "#3E8FDF"]
];
const QUAD_PLANTS = quadMakePlants();

simReg({ id: "quadrat", ic: "🟩", name: "Quadrat sampling", sec: "f", ord: 20, topic: "t18", fn: quadratSim,
  words: [["quadrat", "🟩", "square frame used for sampling"], ["random sampling", "🎲", "choosing positions without bias"], ["population estimate", "≈", "calculated total, not counted one by one"], ["frequency", "%", "percentage of quadrats with a species"], ["percentage cover", "▧", "area covered by the species"], ["transect", "📏", "line used to sample a gradient"], ["abiotic factor", "☀️", "non-living condition, like light or moisture"]] });

function quadratSim(root) {
  const st = { mode: "random", size: 5, target: 10, samples: [], seed: 18221, last: null };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="quadField" class="simsvg"></div>
      <div class="quad-key">${QUAD_SPEC.map(s => `<span><i style="width:12px;height:12px;border-radius:999px;background:${s[3]};display:inline-block"></i>${s[2]} ${s[1]}</span>`).join("")}</div>
      <div class="row">${segBtns("quad-mode", [["random", "🎲 Random"], ["transect", "📏 Transect"]], st.mode)}</div>
      <div class="row">${segBtns("quad-size", [[5, "5 × 5 m"], [10, "10 × 10 m"], [15, "15 × 15 m"]], st.size)}</div>
      <div class="quad-target" role="radiogroup" aria-label="Number of quadrats">${[5, 10, 20].map(n => `<button role="radio" aria-checked="${n === st.target}" data-quad-target="${n}">${n} quadrats</button>`).join("")}</div>
      <div class="row simbtns"><button class="btn" id="quadThrow">🎲 Throw 1</button><button class="btn blue" id="quadRun">▶ Take to target</button><button class="btn plain" id="quadReset">↺ Reset</button></div></section>
    <section class="card"><h3 style="margin:0">📊 Results</h3><div id="quadRead" class="quad-read"></div><div id="quadTable"></div><div class="quad-note"><b>Rule:</b> estimate = mean per quadrat × field area ÷ quadrat area. More random quadrats → usually closer to the true count.</div></section></div>
    <section class="card"><h3 style="margin:0">📏 Line transect: light/moisture gradient</h3><div id="quadTransect" class="simsvg nozoom"></div></section>`;
  root.querySelectorAll("[data-quad-mode]").forEach(b => b.onclick = () => { SFX.tap(); st.mode = b.dataset.quadMode; draw(); });
  root.querySelectorAll("[data-quad-size]").forEach(b => b.onclick = () => { SFX.tap(); st.size = Number(b.dataset.quadSize); st.samples = []; st.seed = 18221; st.last = null; draw(); });
  root.querySelectorAll("[data-quad-target]").forEach(b => b.onclick = () => { SFX.tap(); st.target = Number(b.dataset.quadTarget); draw(); });
  root.querySelector("#quadThrow").onclick = () => { SFX.tap(); quadAddSample(st); draw(); };
  root.querySelector("#quadRun").onclick = () => { SFX.tap(); while (st.samples.length < st.target) quadAddSample(st); draw(); };
  root.querySelector("#quadReset").onclick = () => { SFX.tap(); st.samples = []; st.seed = 18221; st.last = null; draw(); };
  simProbe(() => quadProbe(st));
  const draw = () => {
    root.querySelector("#quadField").innerHTML = quadFieldSvg(st);
    root.querySelector("#quadRead").innerHTML = quadReadHtml(st);
    root.querySelector("#quadTable").innerHTML = quadTableHtml(st);
    root.querySelector("#quadTransect").innerHTML = quadTransectSvg();
    root.querySelectorAll("[data-quad-mode]").forEach(b => b.setAttribute("aria-checked", b.dataset.quadMode === st.mode ? "true" : "false"));
    root.querySelectorAll("[data-quad-size]").forEach(b => b.setAttribute("aria-checked", Number(b.dataset.quadSize) === st.size ? "true" : "false"));
    root.querySelectorAll("[data-quad-target]").forEach(b => b.setAttribute("aria-checked", Number(b.dataset.quadTarget) === st.target ? "true" : "false"));
  };
  draw();
}
function quadRandStep(st) { st.seed = (st.seed * 1664525 + 1013904223) >>> 0; return st.seed / 4294967296; }
function quadMakePlants() {
  const r = (() => { let seed = 7331; return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); })();
  const norm = () => (r() + r() + r() + r() - 2);
  const plants = [], add = (sp, n, cx, cy, sx, sy, uniform) => {
    for (let i = 0; i < n; i++) {
      const u = uniform || r() < .28, x = u ? r() * QUAD_W : clamp(cx + norm() * sx, 1, QUAD_W - 1), y = u ? r() * QUAD_H : clamp(cy + norm() * sy, 1, QUAD_H - 1);
      plants.push({ sp, x, y, cover: sp === "grass" ? .35 + r() * .35 : sp === "daisy" ? .22 + r() * .25 : .55 + r() * .75 });
    }
  };
  add("grass", 260, 58, 28, 26, 18, true); add("daisy", 120, 76, 17, 13, 9, false); add("reed", 95, 18, 45, 10, 7, false);
  return plants;
}
function quadAddSample(st) {
  const s = st.size, x = quadRandStep(st) * (QUAD_W - s), y = quadRandStep(st) * (QUAD_H - s), counts = quadCounts(x, y, s);
  st.last = { x, y, size: s, counts }; st.samples.push(st.last);
}
function quadCounts(x, y, s) {
  const c = Object.fromEntries(QUAD_SPEC.map(q => [q[0], { n: 0, cover: 0 }]));
  QUAD_PLANTS.forEach(p => { if (p.x >= x && p.x <= x + s && p.y >= y && p.y <= y + s) { c[p.sp].n++; c[p.sp].cover += p.cover; } });
  return c;
}
function quadStats(st) {
  const n = st.samples.length, area = st.size * st.size, factor = QUAD_AREA / area;
  const trueC = Object.fromEntries(QUAD_SPEC.map(q => [q[0], QUAD_PLANTS.filter(p => p.sp === q[0]).length]));
  const out = {};
  QUAD_SPEC.forEach(q => {
    const id = q[0], sum = st.samples.reduce((a, s) => a + s.counts[id].n, 0), present = st.samples.filter(s => s.counts[id].n > 0).length, cover = st.samples.reduce((a, s) => a + Math.min(100, s.counts[id].cover / area * 100), 0);
    out[id] = { total: sum, mean: n ? sum / n : 0, est: n ? (sum / n) * factor : 0, trueCount: trueC[id], freq: n ? present / n * 100 : 0, cover: n ? cover / n : 0 };
  });
  out.total = { mean: QUAD_SPEC.reduce((a, q) => a + out[q[0]].mean, 0), est: QUAD_SPEC.reduce((a, q) => a + out[q[0]].est, 0), trueCount: QUAD_PLANTS.length };
  return out;
}
function quadProbe(st) {
  const qs = quadStats(st), tr = quadTransectData(), p = { mode: st.mode, size: st.size, n: st.samples.length, target: st.target, area: st.size * st.size, fieldArea: QUAD_AREA, mean_total: +qs.total.mean.toFixed(2), estimate_total: Math.round(qs.total.est), true_total: qs.total.trueCount, lastX: st.last ? +st.last.x.toFixed(1) : 0, lastY: st.last ? +st.last.y.toFixed(1) : 0, transectReedPeak: tr.reedPeak, transectDaisyPeak: tr.daisyPeak, moistureAtReedPeak: tr.moistureAtReedPeak, lightAtDaisyPeak: tr.lightAtDaisyPeak };
  QUAD_SPEC.forEach(q => { const id = q[0], a = qs[id]; p["mean_" + id] = +a.mean.toFixed(2); p["est_" + id] = Math.round(a.est); p["true_" + id] = a.trueCount; p["freq_" + id] = +a.freq.toFixed(1); p["cover_" + id] = +a.cover.toFixed(1); });
  return p;
}
function quadFieldSvg(st) {
  const sx = 5, sy = 5, recent = st.samples.slice(-12);
  return `<svg viewBox="0 0 520 330" role="img" aria-label="School lawn field with random quadrats and clumped plants">
    <defs><linearGradient id="qBg" x1="0" x2="1"><stop offset="0" stop-color="#DDF1FF"/><stop offset=".42" stop-color="#E6F8EC"/><stop offset="1" stop-color="#FFF2C7"/></linearGradient></defs>
    <rect x="10" y="10" width="500" height="300" rx="16" fill="url(#qBg)" stroke="${CO}" stroke-width="3"/>
    <text x="22" y="30" font-size="12" font-weight="900" fill="${CO}">water + shade</text><text x="498" y="30" text-anchor="end" font-size="12" font-weight="900" fill="${CO}">bright + dry</text>
    ${QUAD_PLANTS.map(p => {
      const spec = QUAD_SPEC.find(q => q[0] === p.sp);
      return `<circle class="quad-field-dot" cx="${10 + p.x * sx}" cy="${10 + p.y * sy}" r="${p.sp === "reed" ? 2.7 : p.sp === "daisy" ? 2.3 : 1.8}" fill="${spec[3]}"><title>${spec[1]}</title></circle>`;
    }).join("")}
    ${recent.map((q, i) => `<rect x="${10 + q.x * sx}" y="${10 + q.y * sy}" width="${q.size * sx}" height="${q.size * sy}" fill="none" stroke="${i === recent.length - 1 ? "#E0457B" : "#1E66B8"}" stroke-width="${i === recent.length - 1 ? 4 : 2}" opacity="${.45 + i / recent.length * .5}"/>`).join("")}
    ${st.mode === "transect" ? `<line x1="10" y1="160" x2="510" y2="160" stroke="#E0457B" stroke-width="5" stroke-linecap="round"/><text x="260" y="151" text-anchor="middle" font-size="13" font-weight="900" fill="#E0457B">line transect</text>` : ""}
    <text x="260" y="323" text-anchor="middle" font-size="12" font-weight="900" fill="${CO}">${st.samples.length} random quadrat${st.samples.length === 1 ? "" : "s"} · quadrat ${st.size} × ${st.size} m</text>
  </svg>`;
}
function quadReadHtml(st) {
  const qs = quadStats(st);
  return `<div><small>Quadrats</small><b>${st.samples.length}/${st.target}</b></div><div><small>Mean / quadrat</small><b>${qs.total.mean.toFixed(1)}</b></div><div><small>Estimate</small><b>${Math.round(qs.total.est)}</b></div><div><small>True count</small><b>${st.samples.length >= 10 ? qs.total.trueCount : "🔒 10+"}</b></div>`;
}
function quadTableHtml(st) {
  const qs = quadStats(st), unlocked = st.samples.length >= 10;
  return `<div class="tscroll"><table class="tterms quad-table small"><tbody><tr><th>Species</th><th>Mean</th><th>Estimate</th><th>Frequency</th><th>Cover</th><th>True</th></tr>
    ${QUAD_SPEC.map(q => { const a = qs[q[0]], err = unlocked ? Math.round((a.est - a.trueCount) / a.trueCount * 100) : null;
      return `<tr><td>${q[2]} ${q[1]}</td><td>${a.mean.toFixed(2)}</td><td><b>${Math.round(a.est)}</b>${unlocked ? ` <span class="${Math.abs(err) < 20 ? "good" : "unlock"}">${err > 0 ? "+" : ""}${err}%</span>` : ""}</td><td>${a.freq.toFixed(0)}%</td><td>${a.cover.toFixed(1)}%</td><td>${unlocked ? a.trueCount : `<span class="unlock">after 10</span>`}</td></tr>`;
    }).join("")}</tbody></table></div>`;
}
function quadTransectData() {
  const xs = Array.from({ length: 11 }, (_, i) => i * 10);
  const rows = xs.map(x => {
    const counts = Object.fromEntries(QUAD_SPEC.map(q => [q[0], QUAD_PLANTS.filter(p => p.x >= x - 5 && p.x < x + 5 && Math.abs(p.y - 30) < 9 && p.sp === q[0]).length]));
    return { x, light: Math.round(25 + x * .68), moisture: Math.round(92 - x * .62), counts };
  });
  const peak = id => rows.reduce((best, r) => r.counts[id] > best.counts[id] ? r : best, rows[0]);
  const reed = peak("reed"), daisy = peak("daisy");
  return { rows, reedPeak: reed.x, daisyPeak: daisy.x, moistureAtReedPeak: reed.moisture, lightAtDaisyPeak: daisy.light };
}
function quadTransectSvg() {
  const d = quadTransectData(), X = x => 36 + x / 100 * 300, Yc = n => 138 - n / 32 * 95, Yr = v => 138 - v / 100 * 95;
  let s = `<svg viewBox="0 0 380 168" role="img" aria-label="Line transect graph showing abiotic factors and species distribution"><rect width="380" height="168" rx="14" fill="#fff"/><path d="M36 18 V138 H344" stroke="${CO}" stroke-width="2"/><text x="190" y="162" text-anchor="middle" font-size="10" font-weight="800" fill="#7A6A66">distance along transect (m)</text>`;
  [["moisture", "#3E8FDF"], ["light", "#E8B83E"]].forEach(([k, col]) => { s += `<polyline points="${d.rows.map(r => `${X(r.x)},${Yr(r[k])}`).join(" ")}" fill="none" stroke="${col}" stroke-width="3" stroke-dasharray="${k === "light" ? "0" : "5 4"}"/>`; });
  QUAD_SPEC.forEach(q => { s += `<polyline points="${d.rows.map(r => `${X(r.x)},${Yc(r.counts[q[0]])}`).join(" ")}" fill="none" stroke="${q[3]}" stroke-width="2.5"/>`; });
  s += d.rows.map(r => `<text x="${X(r.x)}" y="151" text-anchor="middle" font-size="8" fill="#7A6A66">${r.x}</text>`).join("");
  s += `<g font-size="10" font-weight="900"><text x="46" y="30" fill="#3E8FDF">moisture</text><text x="295" y="30" fill="#E8B83E">light</text><text x="48" y="124" fill="#3E8FDF">🌾 reeds peak near ${d.reedPeak} m</text><text x="208" y="50" fill="#E8B83E">🌼 daisies peak near ${d.daisyPeak} m</text></g></svg>`;
  return s;
}

Object.assign(SIM_P, {
  foodweb: ["You remove the small fish from the pond. What will happen first?",
    ["Some prey such as snails or tadpoles increase, and kingfishers lose food", "All species increase because there is more space", "Only producers change because arrows start at plants", "Energy starts flowing backwards through the arrows"],
    "Removing one species can affect both its prey and its predators. Arrows show energy flows from food to eater.", "remove 🐟 small fish, then press ▶ Run."],
  quadrat: ["A student only places quadrats beside the pretty flowers. What is the problem?",
    ["The sample is biased, so the population estimate may be too high", "It is random, so it is always the best method", "It measures abiotic factors but not plants", "It makes the quadrat bigger"],
    "Random positions avoid choosing only the places we prefer. More random quadrats make the estimate more reliable.", "throw random quadrats and compare the estimate with the true count."]
});
Object.assign(SIM_Q, {
  foodweb: [["In a food web arrow, what does the arrow show?", ["The direction of energy flow, from food to feeder", "The direction an animal walks", "The direction of carbon dioxide movement only", "The strongest animal in the web"], "Energy in food passes to the organism that eats it, so arrows point from food to feeder."],
    ["Why is the energy pyramid always upright?", ["Most energy is lost at each trophic level, mainly as heat from respiration", "Energy is created by consumers at the top", "Predators always have the largest biomass", "Decomposers send all energy back to producers"], "Only about 10% is transferred; much is lost as heat, faeces and uneaten parts."]],
  quadrat: [["Why should quadrat positions be chosen randomly?", ["To avoid bias in choosing unusually crowded or empty places", "To make every quadrat contain the same species", "To find the exact true population immediately", "To stop abiotic factors changing"], "Random sampling gives each position a fair chance, so the estimate is less biased."],
    ["A plant occurs in 8 out of 20 quadrats. What is its percentage frequency?", ["40%", "8%", "20%", "160%"], "Percentage frequency = quadrats where present ÷ total quadrats × 100 = 8 ÷ 20 × 100 = 40%."]]
});

SIM_CH.foodweb = {
  title: "Pond Energy Detective", mins: 15,
  story: "Use the HK pond food web to prove how energy flows, why pyramids shrink, and how one species can change the whole web.",
  missions: [
    { ic: "🕸️", name: "Read the web", tasks: [
      { type: "goal", ic: "🐟", do: "Tap <b>🐟 small fish</b> in the web.", look: "Food web nodes", target: "Small fish selected", check: p => p.selected === "smallfish", hold: .2, why: "A selected node shows its population, trophic level and predators." },
      { type: "pick", ic: "➡️", do: "What do the arrows mean?", look: "Food web arrows", opts: ["Energy flows from the food to the feeder", "The arrow points to the organism being eaten", "The arrow points to the decomposer only", "The arrow shows where animals swim"], miss: ["", "Look at pondweed → snail: the snail eats the pondweed.", "Decomposers use dead matter, but most arrows are feeding links.", "The arrows connect feeding, not movement."], why: "Food contains energy. It moves to the organism that eats it." },
      { type: "goal", ic: "🔺", do: "Pick the chain <b>🌿 pondweed → 🐚 snail → 🐟 small fish → 🐦 kingfisher</b>.", look: "Pyramid chain buttons", target: "Pondweed chain selected", check: p => p.chain === "pondweed>snail>smallfish>kingfisher", hold: .2, why: "Now the pyramid uses one clear food chain from the web." },
      { type: "read", ic: "🔥", do: "Read the energy reaching <b>🐟 small fish</b>.", look: "Energy pyramid", need: p => p.chain === "pondweed>snail>smallfish>kingfisher", needTxt: "Pick the pondweed → snail → fish → kingfisher chain.", fields: [["Energy at small fish level", p => p.energy_secondary, 8, "kJ"]], why: "About 10% passes up each level, so 10000 → 1000 → about 100 kJ." }] },
    { ic: "➖", name: "Remove one", tasks: [
      { type: "goal", ic: "➖", do: "Select <b>🐟 small fish</b>, then press <b>➖ Remove</b>.", look: "Species buttons + action buttons", target: "Small fish = 0", check: p => p.pop_smallfish === 0 && p.lastAction === "remove:smallfish", hold: .2, why: "A species removed from a web can no longer eat prey or feed predators." },
      { type: "goal", ic: "▶", do: "Press <b>▶ Run</b> and let the graph reach <b>6 months</b>.", look: "Population graph", target: "Month ≥ 6", check: p => p.t >= 6, meter: p => ({ v: p.t, min: 0, max: 12, lo: 6, hi: 12, unit: " mo", label: "Time" }), hold: .2, why: "The graph shows delayed effects spreading through the web." },
      { type: "read", ic: "🐚", do: "Read the <b>snail population</b> after the fish is removed.", look: "Population graph / selected readout", need: p => p.t >= 6 && p.pop_smallfish === 0, needTxt: "Remove small fish and run to at least 6 months.", fields: [["Snail population", p => p.pop_snail, 25, "snails"]], why: "Snails may rise when one of their predators is removed." },
      { type: "pick", ic: "🐦", do: "Why can the <b>kingfisher</b> population fall?", look: "Food web + graph", need: p => p.pop_smallfish === 0, needTxt: "Remove the small fish first.", opts: ["It loses a food source: small fish", "It is eaten by pondweed", "It starts photosynthesis", "The arrows now flow backwards"], miss: ["", "Pondweed is a producer; it does not eat birds.", "Kingfishers are consumers, not producers.", "Energy arrows do not reverse."], why: "Predators depend on enough prey. Less prey means less energy for the predator." }] },
    { ic: "➕", name: "Recover it", tasks: [
      { type: "goal", ic: "➕", do: "Select <b>🐟 small fish</b>, then press <b>➕ Add back</b>.", look: "Action buttons", target: "Small fish present", check: p => p.pop_smallfish > 0 && p.lastAction === "add:smallfish", hold: .2, why: "Adding a species back restores a feeding link, but the web needs time to settle." },
      { type: "goal", ic: "✖️2", do: "Select <b>🟢 algae</b>, then press <b>✖️2 Double</b>.", look: "Action buttons", target: "Algae doubled", check: p => p.lastAction === "double:algae" && p.pop_algae > 9000, hold: .2, why: "More producers can support more primary consumers, if other factors allow." },
      { type: "pick", ic: "🌿", do: "Which trophic level brings new energy into the web?", opts: ["Producers", "Primary consumers", "Secondary consumers", "Decomposers"], miss: ["", "Primary consumers transfer energy already fixed by producers.", "Secondary consumers get energy by eating consumers.", "Decomposers recycle nutrients, not energy."], why: "Producers use light energy to make organic food." },
      { type: "fill", ic: "✍️", do: "Finish the energy sentence.", text: "Only about {10%|90%|100%} of energy passes to the next trophic level; much is lost as {heat|new sunlight|oxygen} during respiration.", why: "This explains why food chains are usually short." }] },
    { ic: "🧠", name: "Explain it", tasks: [
      { type: "order", ic: "🔺", do: "Put the trophic levels in order.", items: ["Producer", "Primary consumer", "Secondary consumer", "Tertiary consumer"], why: "Energy starts with producers and is transferred through consumers." },
      { type: "pick", ic: "🍄", do: "What do decomposers do?", opts: ["Break down dead matter and recycle nutrients", "Recycle all lost heat energy to producers", "Make arrows point backwards", "Eat only living kingfishers"], miss: ["", "Heat energy is lost from the ecosystem; nutrients can be recycled.", "Arrows still show energy from food to feeder.", "Decomposers act mainly on dead organisms and waste."], why: "Decomposers release mineral nutrients for producers, but energy must enter again as light." },
      { type: "fill", ic: "🔥", do: "Name three ways energy is lost.", text: "Energy is lost as heat in {respiration|photosynthesis|pollination}, in {faeces|oxygen|light}, and in {uneaten parts|extra arrows|bigger quadrats}.", why: "Not all biomass is eaten or digested; respiration releases heat." }] }
  ]
};

SIM_CH.quadrat = {
  title: "Quadrat Field Survey", mins: 15,
  story: "Survey a school lawn without counting every plant. Use random quadrats, estimates, frequency, cover and a line transect.",
  missions: [
    { ic: "🎲", name: "Random sample", tasks: [
      { type: "goal", ic: "🟩", do: "Set quadrat size to <b>10 × 10 m</b>.", look: "Quadrat size buttons", target: "10 × 10 m", check: p => p.size === 10, hold: .2, why: "All samples should use the same quadrat size for a fair estimate." },
      { type: "goal", ic: "🎲", do: "Take at least <b>5 random quadrats</b>.", look: "Throw 1 / Take to target buttons", target: "n ≥ 5", check: p => p.mode === "random" && p.n >= 5, meter: p => ({ v: p.n, min: 0, max: 10, lo: 5, hi: 10, unit: "", label: "Quadrats" }), hold: .2, why: "Random coordinates avoid choosing only crowded or empty patches." },
      { type: "read", ic: "🔢", do: "Read the <b>number of quadrats</b> and the <b>mean plants per quadrat</b>.", look: "Results tiles", need: p => p.n >= 5, needTxt: "Take at least 5 random quadrats.", fields: [["Number of quadrats", p => p.n, 0, ""], ["Mean plants per quadrat", p => p.mean_total, .3, "plants"]], why: "The mean is the average count in your random samples." },
      { type: "pick", ic: "🎯", do: "Why throw quadrats randomly?", opts: ["To avoid sampling bias", "To make every quadrat identical", "To count only flowers", "To change the field area"], miss: ["", "Random quadrats can still differ; that is why we use a mean.", "That would be biased towards one species.", "The field area stays the same."], why: "Random sampling gives each place a fair chance to be chosen." }] },
    { ic: "≈", name: "Estimate", tasks: [
      { type: "goal", ic: "🔓", do: "Take at least <b>10 quadrats</b> to unlock the true count.", look: "Results table", target: "n ≥ 10", check: p => p.n >= 10, meter: p => ({ v: p.n, min: 0, max: 20, lo: 10, hi: 20, unit: "", label: "Quadrats" }), hold: .2, why: "More samples usually make the estimate more reliable." },
      { type: "read", ic: "🌾", do: "Read the <b>estimated wet-shade reed population</b>.", look: "Results table", need: p => p.n >= 10, needTxt: "Take at least 10 quadrats.", fields: [["Estimated reeds", p => p.est_reed, 80, "plants"], ["True reeds", p => p.true_reed, 0, "plants"]], why: "Estimate = mean per quadrat × field area ÷ quadrat area." },
      { type: "pick", ic: "📈", do: "What usually happens if you increase from 5 to 20 random quadrats?", opts: ["The estimate is usually more reliable", "The true population changes", "The quadrat becomes a transect", "Bias increases because positions are random"], miss: ["", "Sampling does not change the real plants.", "A transect is a line, not just more quadrats.", "Random positions reduce bias."], why: "A larger sample reduces the effect of one unusual quadrat." },
      { type: "fill", ic: "✍️", do: "Finish the estimate rule.", text: "Estimated population = {mean per quadrat|largest quadrat count|true count} × {field area|plant height|light reading} ÷ quadrat area.", why: "The mean is scaled up from one quadrat to the whole field." }] },
    { ic: "%", name: "Frequency + cover", tasks: [
      { type: "read", ic: "🌼", do: "Read the <b>yellow daisy percentage frequency</b>.", look: "Results table", need: p => p.n >= 10, needTxt: "Take at least 10 quadrats.", fields: [["Daisy frequency", p => p.freq_daisy, 8, "%"]], why: "Frequency is the percentage of quadrats where the species is present." },
      { type: "read", ic: "▧", do: "Read the <b>reed percentage cover</b>.", look: "Results table", need: p => p.n >= 10, needTxt: "Take at least 10 quadrats.", fields: [["Reed cover", p => p.cover_reed, 5, "%"]], why: "Percentage cover estimates how much area the plants cover." },
      { type: "pick", ic: "%", do: "A plant is in 8 out of 20 quadrats. What is its frequency?", opts: ["40%", "8%", "20%", "80%"], miss: ["", "8 is the number of quadrats, not the percentage.", "20 is the total quadrats.", "Check: 8 ÷ 20 = 0.4."], why: "8 ÷ 20 × 100 = 40%." }] },
    { ic: "📏", name: "Transect", tasks: [
      { type: "goal", ic: "📏", do: "Switch to <b>📏 Transect</b> mode.", look: "Mode buttons", target: "Transect mode", check: p => p.mode === "transect", hold: .2, why: "A line transect samples along an environmental gradient." },
      { type: "read", ic: "🌾", do: "Read where <b>wet-shade reeds</b> peak along the transect.", look: "Line transect graph", need: p => p.mode === "transect", needTxt: "Switch to 📏 Transect mode.", fields: [["Reed peak distance", p => p.transectReedPeak, 1, "m"], ["Moisture there", p => p.moistureAtReedPeak, 2, "%"]], why: "Reeds cluster near wetter, shadier parts of the field." },
      { type: "pick", ic: "☀️", do: "What does the transect show?", opts: ["Species distribution can change with abiotic factors", "Random sampling is never useful", "Plants move to the quadrat after it lands", "Light and moisture are biotic factors"], miss: ["", "Random quadrats are useful for estimating population size.", "Plants do not move to the quadrat.", "Light and moisture are non-living, abiotic factors."], why: "A transect is useful when conditions change across a habitat." },
      { type: "fill", ic: "✍️", do: "Finish the fieldwork sentence.", text: "{Random|Chosen|Pretty} quadrats reduce bias; more quadrats make an estimate more {reliable|colourful|biased}.", why: "This is the key fieldwork idea for HKDSE ecology." }] }
  ]
};
