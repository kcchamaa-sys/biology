/* ============================================================
   5f-p1b. 🧪 Part I labs: membranes + cell division
   Diffusion agar cubes, osmosis in cells, mitosis/meiosis for HKDSE Topics 3–4.
   Cause → effect focus:
   - diffuse: shorter distance + larger SA:V + steeper gradient + warmer particles → faster diffusion to the centre.
   - plasmo: water potential difference → net osmosis → potato mass/cell shape changes.
   - celldiv: DNA replication then chromosome separation → daughter cells with the right chromosome number.
   ============================================================ */

simStyle(`
.diffuse-read,.plasmo-read,.celldiv-read{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:8px}
.diffuse-read span,.plasmo-read span,.celldiv-read span{background:#fff;border:2px solid #E7DCD2;border-radius:13px;padding:8px 10px;font-weight:800;min-width:0}
.diffuse-read b,.plasmo-read b,.celldiv-read b{display:block;font-size:1.15rem;font-variant-numeric:tabular-nums;color:var(--ink)}
.diffuse-chain,.plasmo-chain,.celldiv-chain{display:grid;gap:7px}
.diffuse-chain span,.plasmo-chain span,.celldiv-chain span{border:2px solid #E7DCD2;border-radius:13px;background:#fff;padding:7px 10px;font-weight:800;font-size:.9rem}
.diffuse-chain span.on,.plasmo-chain span.on,.celldiv-chain span.on{background:#E8F7E8;border-color:#69B96F}
.diffuse-calc,.plasmo-fair,.celldiv-compare{display:grid;gap:7px}.diffuse-calc div,.plasmo-fair div,.celldiv-compare div{background:#FFF8E8;border:2px dashed #D9CBBE;border-radius:13px;padding:8px 10px;font-size:.9rem;font-weight:800}
.diffuse-bio{display:grid;grid-template-columns:repeat(auto-fit,minmax(142px,1fr));gap:8px}.diffuse-bio span{background:#F4FAFF;border:2px solid #D2E8F7;border-radius:14px;padding:8px;font-weight:800;font-size:.88rem}
.plasmo-table{max-height:250px;overflow:auto}.plasmo-table th,.plasmo-table td{padding:5px 7px;text-align:right}.plasmo-table th:first-child,.plasmo-table td:first-child{text-align:left}.plasmo-table .sel{background:#FFF4C7}
.plasmo-tabs,.celldiv-tabs{display:flex;gap:7px;flex-wrap:wrap}.plasmo-tabs button,.celldiv-tabs button,.celldiv-stage button{min-height:44px;border:2px solid #E6DCD2;border-radius:13px;background:#fff;color:var(--ink);font-weight:900;padding:7px 10px}.plasmo-tabs button[aria-pressed=true],.celldiv-tabs button[aria-pressed=true],.celldiv-stage button[aria-current=true]{background:#EAF6FF;border-color:#3E8FDF}
.plasmo-mini{font-size:.82rem;color:var(--ink-soft);font-weight:750}.plasmo-cells-key,.celldiv-key{display:flex;gap:6px;flex-wrap:wrap}.plasmo-cells-key span,.celldiv-key span{display:inline-flex;gap:5px;align-items:center;background:#fff;border:2px solid #E6DCD2;border-radius:999px;padding:4px 8px;font-size:.82rem;font-weight:800}.plasmo-cells-key i,.celldiv-key i{width:12px;height:12px;border-radius:99px;display:inline-block}
.celldiv-stage{display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));gap:7px}.celldiv-stage button small{display:block;font-weight:750;color:var(--ink-soft)}
.celldiv-root-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(122px,1fr));gap:8px}.celldiv-root-grid button{min-height:44px;border:2px solid #E6DCD2;border-radius:13px;background:#fff;font-weight:900;color:var(--ink)}.celldiv-root-grid button[aria-pressed=true]{background:#FFF4C7;border-color:#F2A900}
@media (prefers-reduced-motion:reduce){.diffuse-chain span.on,.plasmo-chain span.on,.celldiv-chain span.on{box-shadow:none}}
`);

simReg({ id: "diffuse", ic: "🧊", name: "Diffusion & size", sec: "1c", ord: 10, topic: "t3", fn: diffuseSim,
  words: [["diffusion", "🫧", "net movement from high to low concentration"], ["concentration gradient", "📶", "difference in concentration between two regions"], ["surface area", "▧", "outside area where exchange can happen"], ["volume", "📦", "space inside a cell or cube"], ["SA:V ratio", "↔️", "surface area divided by volume"], ["diffusion distance", "📏", "shortest path particles must travel"], ["passive", "😴", "does not need energy from respiration"]] });
simReg({ id: "plasmo", ic: "🥔", name: "Osmosis in cells", sec: "1c", ord: 30, topic: "t3", fn: plasmoSim,
  words: [["osmosis", "💧", "water moves through a partially permeable membrane"], ["water potential", "📶", "how free water is to move"], ["turgid", "🟢", "firm plant cell full of water"], ["flaccid", "🟡", "soft plant cell after water loss"], ["plasmolysis", "🟣", "membrane pulls away from the cell wall"], ["haemolysis", "🩸", "red blood cells burst in water"], ["crenation", "✹", "red blood cells shrink in strong solution"], ["isotonic", "⚖️", "no net movement of water"]] });
simReg({ id: "celldiv", ic: "🧬", name: "Mitosis & meiosis", sec: "1d", ord: 10, topic: "t4", fn: celldivSim,
  words: [["chromosome", "🧬", "DNA thread carrying genes"], ["sister chromatids", "X", "identical copies joined at a centromere"], ["centromere", "●", "point where chromatids join"], ["spindle", "🕸️", "fibres that move chromosomes"], ["diploid", "2n", "two sets of chromosomes"], ["haploid", "n", "one set of chromosomes"], ["homologous chromosomes", "👯", "matching pair, one from each parent"], ["crossing over", "✂️", "exchange between homologous chromatids"], ["mitotic index", "%", "percentage of cells in mitosis"]] });

/* ---------------- 1. 🧊 Diffusion & size ---------------- */
const DIFFUSE_SIDES = [[0.5, "0.5 cm"], [1, "1 cm"], [2, "2 cm"], [3, "3 cm"]];
const DIFFUSE_CONC = [[0.5, "0.5 mol dm⁻³"], [1, "1.0"], [2, "2.0"]];
const DIFFUSE_TEMP = [[10, "10 °C"], [25, "25 °C"], [40, "40 °C"]];
function diffuseModel(st) {
  const concF = Math.sqrt(st.conc), tempF = { 10: .62, 25: 1, 40: 1.36 }[st.temp] || 1;
  const k = .085 * concF * tempF, dist = Math.min(st.side / 2, k * Math.sqrt(st.t));
  const core = Math.max(0, st.side - 2 * dist), pct = 100 * (1 - Math.pow(core / st.side, 3));
  const sa = 6 * st.side * st.side, vol = Math.pow(st.side, 3), sav = sa / vol;
  const centreT = Math.pow((st.side / 2) / k, 2);
  return { dist, pct, sa, vol, sav, centreT, rateK: k };
}
function diffuseSim(root) {
  const st = { side: 1, conc: 1, temp: 25, t: 0, run: false, fast: false, px: [] };
  for (let i = 0; i < 70; i++) st.px.push({ x: 12 + Math.random() * 190, y: 18 + Math.random() * 154, vx: 0, vy: 0 });
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><span class="kicker">Agar + phenolphthalein indicator</span><div id="diffuseSvg" class="simsvg nozoom"></div>
      <div class="row simbtns"><button class="btn" id="difRun">▶ Start timer</button><button class="btn plain" id="difFast">⏩ Fast</button><button class="btn plain" id="difReset">↺ Reset</button></div>
      <div class="diaopts"><div><b class="small">🧊 Cube side</b>${segBtns("dif-side", DIFFUSE_SIDES, st.side)}</div><div><b class="small">📶 Acid concentration</b>${segBtns("dif-conc", DIFFUSE_CONC, st.conc)}</div><div><b class="small">🌡️ Temperature</b>${segBtns("dif-temp", DIFFUSE_TEMP, st.temp)}</div></div></section>
    <section class="card"><h3 style="margin:0">🫧 Particle view</h3><div id="diffusePart" class="simsvg nozoom"></div><div id="diffuseRead" class="diffuse-read"></div><h3 style="margin:2px 0 0">🧠 What's happening?</h3><div id="diffuseChain" class="diffuse-chain"></div></section></div>
    <section class="card"><h3 style="margin:0">🧮 Surface area : volume</h3><div id="diffuseCalc" class="diffuse-calc"></div></section>
    <section class="card"><h3 style="margin:0">🧬 Link to biology</h3><div class="diffuse-bio"><span>Small cells: high SA:V → fast exchange.</span><span>Flat cells: short diffusion distance.</span><span>Alveoli, villi, root hairs: large exchange surface.</span><span>Large organisms need transport systems.</span></div></section>`;
  const runBtn = root.querySelector("#difRun"), reset = () => { st.t = 0; st.run = false; runBtn.textContent = "▶ Start timer"; };
  root.querySelector("#difRun").onclick = () => { SFX.tap(); st.run = !st.run; runBtn.textContent = st.run ? "⏸ Pause" : "▶ Continue"; };
  root.querySelector("#difFast").onclick = () => { SFX.tap(); st.fast = !st.fast; root.querySelector("#difFast").textContent = st.fast ? "⏩ Fast: on" : "⏩ Fast"; };
  root.querySelector("#difReset").onclick = () => { SFX.tap(); reset(); };
  [["side", Number], ["conc", Number], ["temp", Number]].forEach(([k, cast]) => root.querySelectorAll(`[data-dif-${k}]`).forEach(b => b.onclick = () => { SFX.tap(); st[k] = cast(b.getAttribute(`data-dif-${k}`)); root.querySelectorAll(`[data-dif-${k}]`).forEach(x => x.setAttribute("aria-checked", x === b ? "true" : "false")); reset(); }));
  simProbe(() => { const m = diffuseModel(st); return { side: st.side, conc: st.conc, temp: st.temp, t: +st.t.toFixed(1), running: st.run, dist: +m.dist.toFixed(3), pct: +m.pct.toFixed(1), sa: +m.sa.toFixed(2), volume: +m.vol.toFixed(3), sav: +m.sav.toFixed(1), centreT: +m.centreT.toFixed(1), reached: m.pct >= 99.5, fast: st.fast }; });
  simLoop(root, dt => {
    const m = diffuseModel(st);
    if (st.run) { st.t = Math.min(160, st.t + dt * (st.fast ? 10 : 2.2)); if (m.pct >= 99.7) { st.run = false; runBtn.textContent = "↺ Run again"; } }
    const tempKick = { 10: 35, 25: 70, 40: 115 }[st.temp];
    st.px.forEach(p => { p.vx = p.vx * .88 + (Math.random() - .48) * tempKick * dt; p.vy = p.vy * .88 + (Math.random() - .5) * tempKick * dt; p.x += (p.vx + .55 * st.conc) * dt * 6; p.y += p.vy * dt * 6; if (p.x > 308) p.x = 12; if (p.x < 8) p.x = 308; p.y = clamp(p.y, 14, 184); });
    root.querySelector("#diffuseSvg").innerHTML = diffuseAgarSvg(st, m);
    root.querySelector("#diffusePart").innerHTML = diffuseParticleSvg(st);
    root.querySelector("#diffuseRead").innerHTML = `<span>⏱ Timer<b>${st.t.toFixed(0)} min</b></span><span>📏 Distance diffused<b>${m.dist.toFixed(2)} cm</b></span><span>🧊 Volume reached<b>${m.pct.toFixed(1)}%</b></span><span>🎯 Centre time<b>${m.centreT.toFixed(0)} min</b></span>`;
    root.querySelector("#diffuseCalc").innerHTML = `<div>Surface area = 6 × side² = <b>${m.sa.toFixed(2)} cm²</b></div><div>Volume = side³ = <b>${m.vol.toFixed(3)} cm³</b></div><div>SA:V = ${m.sa.toFixed(2)} ÷ ${m.vol.toFixed(3)} = <b>${m.sav.toFixed(1)} : 1</b></div><div>Shortest diffusion distance to centre = side ÷ 2 = <b>${(st.side/2).toFixed(2)} cm</b></div>`;
    root.querySelector("#diffuseChain").innerHTML = `<span class="on">📶 Acid is high outside, low inside → net diffusion in.</span><span class="${st.temp >= 40 ? "on" : ""}">🌡️ Higher temperature → particles move faster.</span><span class="${st.conc >= 2 ? "on" : ""}">📶 Steeper concentration gradient → faster rate.</span><span class="${st.side <= 1 ? "on" : ""}">📏 Smaller cube → shorter path + larger SA:V.</span>`;
  });
}
function diffuseAgarSvg(st, m) {
  const S = 48 + st.side / 3 * 176, x = 180 - S / 2, y = 68, band = clamp(m.dist / (st.side / 2) * S / 2, 0, S / 2), inner = Math.max(0, S - 2 * band);
  const ticks = DIFFUSE_SIDES.map(([s], i) => { const ss = 48 + s / 3 * 176, tx = 62 + i * 78; return `<rect x="${tx - ss/20}" y="306" width="${ss/10}" height="10" rx="3" fill="#E84D8A" opacity="${s===st.side?1:.35}"/><text x="${tx}" y="334" font-size="13" text-anchor="middle" font-weight="900" fill="${CO}">${s} cm</text>`; }).join("");
  return `<svg viewBox="0 0 360 350" role="img" aria-label="Agar cube cross-section showing colourless acid-diffused band moving inwards"><defs><linearGradient id="difPink" x1="0" x2="1"><stop offset="0" stop-color="#FF8CB8"/><stop offset="1" stop-color="#E84D8A"/></linearGradient><marker id="difArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="#3E8FDF"/></marker></defs><rect width="360" height="350" rx="18" fill="#FFF6FA"/>
    <text x="180" y="22" text-anchor="middle" font-size="15" font-weight="900" fill="${CO}">Agar cube in dilute acid</text><text x="180" y="43" text-anchor="middle" font-size="13" font-weight="850" fill="#7A6A66">phenolphthalein pink → colourless</text>
    <g><rect x="${x}" y="${y}" width="${S}" height="${S}" rx="5" fill="#F7E7ED" stroke="${CO}" stroke-width="3"/><rect x="${x+band}" y="${y+band}" width="${inner}" height="${inner}" rx="3" fill="url(#difPink)" stroke="#B83266" stroke-width="${inner>6?2:0}" opacity="${inner>1?1:0}"/><path d="M${x} ${y} l28 -21 h${S} l-28 21 M${x+S} ${y} l28 -21 v${S} l-28 21" fill="none" stroke="${CO}" stroke-width="2" opacity=".45"/><path d="M${x+S/2} ${y-21} V${y+14}" stroke="#3E8FDF" stroke-width="4" marker-end="url(#difArr)"/></g>
    <g font-size="13" font-weight="900" fill="${CO}"><text x="180" y="270" text-anchor="middle">${m.pct.toFixed(1)}% volume reached · band ${m.dist.toFixed(2)} cm</text><text x="180" y="291" text-anchor="middle">SA:V = ${m.sav.toFixed(1)} : 1</text></g><g>${ticks}</g></svg>`;
}
function diffuseParticleSvg(st) {
  return `<svg viewBox="0 0 320 220" role="img" aria-label="Particles move randomly but net movement is down the concentration gradient"><defs><marker id="difParr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="#3FA06B"/></marker></defs><rect width="320" height="220" rx="14" fill="#F2FAFF"/><rect x="0" y="0" width="150" height="185" fill="#DCEFFF"/><text x="16" y="22" font-size="12" font-weight="900" fill="${CO}">high concentration</text><text x="304" y="22" text-anchor="end" font-size="12" font-weight="900" fill="${CO}">low concentration</text>${st.px.map((p,i)=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${i%5?3.1:4.4}" fill="${i%5?"#3E8FDF":"#8E5BD6"}" opacity=".9"/>`).join("")}<path d="M112 102 H230" stroke="#3FA06B" stroke-width="6" stroke-linecap="round" marker-end="url(#difParr)"/><text x="171" y="90" text-anchor="middle" font-size="12" font-weight="900" fill="#3FA06B">net movement</text><text x="160" y="201" text-anchor="middle" font-size="11" font-weight="850" fill="#7A6A66">random motion; net flow is high → low</text></svg>`;
}

/* ---------------- 2. 🥔 Osmosis in cells ---------------- */
const PLASMO_CONCS = [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1.0], PLASMO_ISO = .35;
function plasmoVar(i, j) { return (((i + 3) * 37 + (j + 5) * 19) % 17 - 8) / 10; }
function plasmoPct(c) { return clamp((PLASMO_ISO - c) * 34 - (c > .55 ? (c-.55)*6 : 0), -26, 14); }
function plasmoRows(progress) {
  return PLASMO_CONCS.map((c, i) => {
    const reps = [0,1,2].map(j => { const init = 2.03 + i * .015 + j * .018, pct = plasmoPct(c) + plasmoVar(i,j), final = init * (1 + pct / 100 * progress); return { init, final, pct: (final - init) / init * 100 }; });
    const mean = reps.reduce((a,r)=>a+r.pct,0)/reps.length;
    return { c, reps, mean };
  });
}
function plasmoState(conc, specimen) {
  if (specimen === "rbc") return conc < .15 ? "haemolysis" : Math.abs(conc - PLASMO_ISO) < .09 ? "normal" : conc > .5 ? "crenated" : "slightly swollen";
  return conc < .18 ? "turgid" : Math.abs(conc - PLASMO_ISO) < .08 ? "incipient plasmolysis" : conc > .5 ? "plasmolysed" : "flaccid";
}
function plasmoXint(rows) {
  for (let i = 0; i < rows.length - 1; i++) if ((rows[i].mean >= 0 && rows[i+1].mean <= 0) || (rows[i].mean <= 0 && rows[i+1].mean >= 0)) {
    const a = rows[i], b = rows[i+1], den = a.mean - b.mean;
    if (Math.abs(den) < 1e-6) continue;
    const f = a.mean / den; return a.c + (b.c - a.c) * f;
  }
  return PLASMO_ISO;
}
function plasmoSim(root) {
  const st = { conc: .4, t: 0, run: false, fast: false, specimen: "onion" };
  root.innerHTML = `<div class="simgrid wide"><section class="card"><span class="kicker">Potato strip experiment · 30 min</span><div id="plasmoGraph" class="simsvg nozoom"></div><div class="row simbtns"><button class="btn" id="plRun">▶ Run 30 min</button><button class="btn plain" id="plFast">⏩ Fast</button><button class="btn plain" id="plReset">↺ Reset</button></div><div><b class="small">🍬 Sucrose solution for microscope</b>${segBtns("pl-conc", PLASMO_CONCS.map(c=>[c, c.toFixed(1)+" mol dm⁻³"]), st.conc)}</div><div id="plasmoRead" class="plasmo-read"></div></section>
    <section class="card"><h3 style="margin:0">🔬 Microscope view</h3><div class="plasmo-tabs"><button aria-pressed="true" data-pl-spec="onion">🧅 Red onion</button><button aria-pressed="false" data-pl-spec="rbc">🩸 Red blood cell</button></div><div id="plasmoCell" class="simsvg nozoom"></div><div class="plasmo-cells-key"><span><i style="background:#8060B8"></i>vacuole / sap</span><span><i style="background:#E85B54"></i>cell membrane</span><span><i style="background:#B58A4A"></i>cell wall</span><span><i style="background:#3E8FDF"></i>water movement</span></div><div id="plasmoChain" class="plasmo-chain"></div></section></div>
    <section class="card"><h3 style="margin:0">📋 Results + fair test</h3><div id="plasmoTable" class="plasmo-table"></div><div class="plasmo-fair"><div>Same size cylinders, same soaking time and temperature.</div><div>Blot dry before weighing; do not squeeze.</div><div>Use replicates and calculate the mean % change.</div></div></section>`;
  const runBtn = root.querySelector("#plRun"), reset = () => { st.t = 0; st.run = false; runBtn.textContent = "▶ Run 30 min"; };
  runBtn.onclick = () => { SFX.tap(); if (st.t >= 30) reset(); st.run = !st.run; runBtn.textContent = st.run ? "⏸ Pause" : "▶ Continue"; };
  root.querySelector("#plFast").onclick = () => { SFX.tap(); st.fast = !st.fast; root.querySelector("#plFast").textContent = st.fast ? "⏩ Fast: on" : "⏩ Fast"; };
  root.querySelector("#plReset").onclick = () => { SFX.tap(); reset(); };
  root.querySelectorAll("[data-pl-conc]").forEach(b => b.onclick = () => { SFX.tap(); st.conc = Number(b.dataset.plConc); root.querySelectorAll("[data-pl-conc]").forEach(x => x.setAttribute("aria-checked", x === b ? "true" : "false")); });
  root.querySelectorAll("[data-pl-spec]").forEach(b => b.onclick = () => { SFX.tap(); st.specimen = b.dataset.plSpec; root.querySelectorAll("[data-pl-spec]").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false")); });
  simProbe(() => { const rows = plasmoRows(st.t/30), sel = rows.find(r => Math.abs(r.c - st.conc) < .001), xint = plasmoXint(rows), state = plasmoState(st.conc, st.specimen); return { conc: st.conc, t: +st.t.toFixed(1), finished: st.t >= 30, specimen: st.specimen, state, selectedPct: +(sel ? sel.mean : 0).toFixed(1), xIntercept: +xint.toFixed(2), iso: PLASMO_ISO, potatoFeel: sel && sel.mean > 2 ? "turgid/firm" : sel && sel.mean < -2 ? "flaccid/soft" : "no net change", running: st.run }; });
  simLoop(root, dt => {
    if (st.run) { st.t = Math.min(30, st.t + dt * (st.fast ? 8 : 1.8)); if (st.t >= 30) { st.run = false; runBtn.textContent = "↺ Run again"; } }
    const rows = plasmoRows(st.t / 30), p = SIM_PROBE ? SIM_PROBE() : {};
    root.querySelector("#plasmoGraph").innerHTML = plasmoGraphSvg(st, rows);
    root.querySelector("#plasmoCell").innerHTML = st.specimen === "onion" ? plasmoOnionSvg(st, p.state) : plasmoRbcSvg(st, p.state);
    root.querySelector("#plasmoRead").innerHTML = `<span>⏱ Time<b>${st.t.toFixed(0)} / 30 min</b></span><span>📈 Selected change<b>${p.selectedPct.toFixed(1)}%</b></span><span>⚖️ Isotonic estimate<b>${p.xIntercept.toFixed(2)} mol dm⁻³</b></span><span>🥔 Strip feel<b>${esc(p.potatoFeel)}</b></span>`;
    root.querySelector("#plasmoTable").innerHTML = plasmoTableHtml(st, rows);
    root.querySelector("#plasmoChain").innerHTML = plasmoChainHtml(st, p.state);
  });
}
function plasmoGraphSvg(st, rows) {
  const X = c => 52 + c * 276, Y = pct => 158 - (pct + 26) / 44 * 118, xint = plasmoXint(rows);
  return `<svg viewBox="0 0 360 220" role="img" aria-label="Graph of percentage mass change against sucrose concentration"><rect width="360" height="220" rx="16" fill="#fff"/><text x="54" y="22" font-size="12" font-weight="900" fill="#7A6A66">% mass change</text><path d="M52 36 V158 H334" stroke="${CO}" stroke-width="2.5"/><line x1="52" x2="334" y1="${Y(0)}" y2="${Y(0)}" stroke="#E9577D" stroke-width="2" stroke-dasharray="5 4"/><text x="330" y="${Y(0)-6}" text-anchor="end" font-size="11" font-weight="900" fill="#E9577D">0% no net</text>${[0,.2,.4,.6,.8,1].map(c=>`<text x="${X(c)}" y="179" text-anchor="middle" font-size="11" font-weight="800" fill="#7A6A66">${c.toFixed(1)}</text>`).join("")}${[-20,-10,0,10].map(v=>`<text x="45" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="#7A6A66">${v}</text>`).join("")}<polyline points="${rows.map(r=>`${X(r.c)},${Y(r.mean)}`).join(" ")}" fill="none" stroke="#8E5BD6" stroke-width="3.5"/>${rows.map(r=>`<circle cx="${X(r.c)}" cy="${Y(r.mean)}" r="${Math.abs(r.c-st.conc)<.001?6:4}" fill="${Math.abs(r.c-st.conc)<.001?"#F2A900":"#8E5BD6"}" stroke="#fff" stroke-width="2"/>`).join("")}<line x1="${X(xint)}" x2="${X(xint)}" y1="40" y2="158" stroke="#3FA06B" stroke-width="2"/><text x="${X(xint)+7}" y="51" font-size="11" font-weight="900" fill="#3FA06B">x = ${xint.toFixed(2)}</text><text x="193" y="211" text-anchor="middle" font-size="11" font-weight="900" fill="#7A6A66">sucrose concentration / mol dm⁻³</text></svg>`;
}
function plasmoTableHtml(st, rows) {
  return `<div class="tscroll"><table class="tterms small"><tbody><tr><th>Sucrose</th><th>Initial mass</th><th>Final mass</th><th>Mean %</th><th>Feel</th></tr>${rows.map(r=>{ const init = r.reps.reduce((a,x)=>a+x.init,0)/3, fin = r.reps.reduce((a,x)=>a+x.final,0)/3, feel = r.mean > 2 ? "firm" : r.mean < -2 ? "soft" : "same"; return `<tr class="${Math.abs(r.c-st.conc)<.001?"sel":""}"><td>${r.c.toFixed(1)}</td><td>${init.toFixed(2)} g</td><td>${fin.toFixed(2)} g</td><td><b>${r.mean.toFixed(1)}%</b></td><td>${feel}</td></tr>`; }).join("")}</tbody></table></div><p class="plasmo-mini">Replicates include small random variation; graph uses the mean.</p>`;
}
function plasmoChainHtml(st, state) {
  const c = st.conc, dilute = c < PLASMO_ISO - .08, conc = c > PLASMO_ISO + .08;
  return `<span class="${dilute?"on":""}">💧 Dilute outside: higher water potential outside → water enters.</span><span class="${Math.abs(c-PLASMO_ISO)<=.08?"on":""}">⚖️ Isotonic: equal water potential → no net movement.</span><span class="${conc?"on":""}">🍬 Concentrated outside: lower water potential outside → water leaves.</span><span class="on">🔎 State: <b>${esc(state)}</b></span>`;
}
function plasmoOnionSvg(st, state) {
  const shrink = state === "plasmolysed" ? 34 : state === "flaccid" || state === "incipient plasmolysis" ? 18 : 0, arrowIn = st.conc < PLASMO_ISO;
  return `<svg viewBox="0 0 360 330" role="img" aria-label="Red onion epidermal cells showing ${state}"><defs><marker id="plArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="#3E8FDF"/></marker></defs><rect width="360" height="330" rx="18" fill="#F7F1FF"/><text x="180" y="25" text-anchor="middle" font-size="16" font-weight="900" fill="${CO}">Red onion epidermis</text><text x="180" y="46" text-anchor="middle" font-size="14" font-weight="900" fill="#7A3CA0">${state}</text>${[0,1,2].map(i=>{ const x=26+i*104,y=78,w=90,h=170, sx=shrink*.55, ix=x+8+sx/2, iy=y+10+sx/2, iw=w-16-sx, ih=h-20-sx; return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#F3E3C0" stroke="#9B6A36" stroke-width="4"/><rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="${state==='plasmolysed'?18:8}" fill="#EEDCF8" stroke="#E85B54" stroke-width="3"/><rect x="${ix+8}" y="${iy+10}" width="${Math.max(14, iw-16)}" height="${Math.max(16, ih-30)}" rx="${state==='plasmolysed'?16:7}" fill="#8060B8" opacity=".72" stroke="#4D3477" stroke-width="2"/><circle cx="${ix+iw-18}" cy="${iy+ih-24}" r="7" fill="#EFE7FF" stroke="${CO}" stroke-width="2"/></g>`; }).join("")}<path d="M180 288 ${arrowIn?"V245":"V318"}" stroke="#3E8FDF" stroke-width="5" marker-end="url(#plArr)"/><text x="198" y="292" font-size="13" font-weight="900" fill="#3E8FDF">net water ${arrowIn?"in":"out"}</text></svg>`;
}
function plasmoRbcSvg(st, state) {
  const arrowIn = st.conc < PLASMO_ISO, burst = state === "haemolysis", cren = state === "crenated";
  const cell = (cx, cy, r) => burst ? `<path d="M${cx-r} ${cy} C${cx-r/2} ${cy-r*1.2} ${cx+r/2} ${cy-r*.8} ${cx+r} ${cy} C${cx+r/2} ${cy+r*.7} ${cx-r/2} ${cy+r*1.1} ${cx-r} ${cy}Z" fill="#FFB6B6" stroke="#B83232" stroke-width="3"/><path d="M${cx+r*.8} ${cy-r*.35} q30 -20 52 -6" stroke="#E85B54" stroke-width="5" fill="none"/>` : cren ? `<path d="${Array.from({length:18},(_,i)=>{ const a=i*Math.PI*2/18, rr=r*(i%2?.78:1.05); return `${i?'L':'M'}${(cx+rr*Math.cos(a)).toFixed(1)} ${(cy+rr*Math.sin(a)).toFixed(1)}`; }).join(' ')}Z" fill="#D94141" stroke="#8E1E1E" stroke-width="3"/><ellipse cx="${cx}" cy="${cy}" rx="${r*.45}" ry="${r*.23}" fill="#9D2424" opacity=".45"/>` : `<ellipse cx="${cx}" cy="${cy}" rx="${r*1.2}" ry="${r*.78}" fill="#D94141" stroke="#8E1E1E" stroke-width="3"/><ellipse cx="${cx}" cy="${cy}" rx="${r*.55}" ry="${r*.34}" fill="#9D2424" opacity=".38"/>`;
  return `<svg viewBox="0 0 360 320" role="img" aria-label="Red blood cells showing ${state}"><defs><marker id="rbcArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="#3E8FDF"/></marker></defs><rect width="360" height="320" rx="18" fill="#FFF5F5"/><text x="180" y="27" text-anchor="middle" font-size="16" font-weight="900" fill="${CO}">Red blood cells</text><text x="180" y="48" text-anchor="middle" font-size="14" font-weight="900" fill="#B83232">${state}</text>${[[90,160,38],[180,150,44],[270,168,36]].map(a=>cell(...a)).join("")}<path d="M180 252 ${arrowIn?"V205":"V298"}" stroke="#3E8FDF" stroke-width="5" marker-end="url(#rbcArr)"/><text x="198" y="260" font-size="13" font-weight="900" fill="#3E8FDF">net water ${arrowIn?"in":"out"}</text><text x="180" y="309" text-anchor="middle" font-size="12" font-weight="900" fill="${CO}">${burst?"No cell wall: water entry can burst RBCs.":cren?"Water loss wrinkles the membrane.":"Isotonic plasma keeps cells normal."}</text></svg>`;
}

/* ---------------- 3. 🧬 Mitosis & meiosis ---------------- */
const CELLDIV_MITOSIS = [
  ["g1", "G1", "Growth", 2, 4, 1], ["s", "S", "DNA copied", 3, 4, 1], ["g2", "G2", "Copied chromosomes", 4, 4, 1], ["pro", "Prophase", "Condense", 4, 4, 1], ["meta", "Metaphase", "Equator", 4, 4, 1], ["ana", "Anaphase", "Chromatids separate", 4, 8, 1], ["telo", "Telophase", "Nuclei reform", 4, 4, 1], ["cyto", "Cytokinesis", "2 diploid cells", 2, 4, 2]
];
const CELLDIV_MEIOSIS = [
  ["g1", "G1", "Diploid cell", 2, 4, 1], ["s", "S", "DNA copied", 4, 4, 1], ["pro1", "Prophase I", "Pair + crossing over", 4, 4, 1], ["meta1", "Metaphase I", "Pairs line up", 4, 4, 1], ["ana1", "Anaphase I", "Homologues separate", 4, 4, 1], ["telo1", "Telophase I", "2 haploid cells", 2, 2, 2], ["meta2", "Metaphase II", "Chromosomes line up", 2, 2, 2], ["ana2", "Anaphase II", "Chromatids separate", 2, 4, 2], ["cyto2", "Cytokinesis II", "4 different gametes", 1, 2, 4]
];
const CELLDIV_ROOT_COUNTS = { interphase: 55, prophase: 17, metaphase: 8, anaphase: 6, telophase: 4 };
function celldivList(st) { return st.mode === "meiosis" ? CELLDIV_MEIOSIS : CELLDIV_MITOSIS; }
function celldivCur(st) { return celldivList(st)[st.step] || celldivList(st)[0]; }
function celldivSim(root) {
  const st = { mode: "mitosis", step: 0, play: false, plant: false, assortment: 0, rootFocus: "all" };
  root.innerHTML = `<div class="simgrid wide"><section class="card"><div class="celldiv-tabs"><button aria-pressed="true" data-cd-mode="mitosis">2️⃣ Mitosis</button><button aria-pressed="false" data-cd-mode="meiosis">4️⃣ Meiosis</button><button aria-pressed="false" data-cd-mode="root">🔬 Root tip</button></div><div id="celldivSvg" class="simsvg nozoom"></div><div id="celldivControls"></div></section><section class="card"><h3 style="margin:0">📈 DNA + chromosome readout</h3><div id="celldivGraph" class="simsvg nozoom"></div><div id="celldivRead" class="celldiv-read"></div><h3 style="margin:2px 0 0">🧠 Key events</h3><div id="celldivChain" class="celldiv-chain"></div></section></div><section class="card"><h3 style="margin:0">⚖️ Mitosis vs meiosis</h3><div class="celldiv-compare"><div><b>Mitosis:</b> 1 division → 2 genetically identical diploid cells for growth, repair and asexual reproduction.</div><div><b>Meiosis:</b> 2 divisions → 4 genetically different haploid gametes for sexual reproduction and variation.</div><div><b>Variation:</b> crossing over + independent assortment + random fertilisation.</div></div></section>`;
  const setMode = m => { st.mode = m; st.step = 0; st.play = false; root.querySelectorAll("[data-cd-mode]").forEach(b => b.setAttribute("aria-pressed", b.dataset.cdMode === m ? "true" : "false")); draw(); };
  root.querySelectorAll("[data-cd-mode]").forEach(b => b.onclick = () => { SFX.tap(); setMode(b.dataset.cdMode); });
  simProbe(() => { const cur = celldivCur(st), total = Object.values(CELLDIV_ROOT_COUNTS).reduce((a,b)=>a+b,0), mit = total - CELLDIV_ROOT_COUNTS.interphase; return { mode: st.mode, stage: cur[0], stageName: cur[1], step: st.step, dna: cur[3], chromosomeNumber: cur[4], daughterCells: cur[5], plant: st.plant, assortment: st.assortment, haploid: st.mode === "meiosis" && (cur[0] === "telo1" || cur[0] === "meta2" || cur[0] === "ana2" || cur[0] === "cyto2"), rootFocus: st.rootFocus, rootTotal: total, rootMitosis: mit, mitoticIndex: +(mit / total * 100).toFixed(1), prophase: CELLDIV_ROOT_COUNTS.prophase, metaphase: CELLDIV_ROOT_COUNTS.metaphase, anaphase: CELLDIV_ROOT_COUNTS.anaphase, telophase: CELLDIV_ROOT_COUNTS.telophase }; });
  const draw = () => {
    const cur = celldivCur(st), rootMode = st.mode === "root";
    root.querySelector("#celldivControls").innerHTML = rootMode ? celldivRootControls(st) : celldivStageControls(st);
    root.querySelector("#celldivSvg").innerHTML = rootMode ? celldivRootSvg(st) : celldivCellSvg(st, cur);
    root.querySelector("#celldivGraph").innerHTML = celldivGraphSvg(st);
    const p = SIM_PROBE ? SIM_PROBE() : {};
    root.querySelector("#celldivRead").innerHTML = rootMode ? `<span>Total cells counted<b>${p.rootTotal}</b></span><span>Cells in mitosis<b>${p.rootMitosis}</b></span><span>Mitotic index<b>${p.mitoticIndex}%</b></span><span>Longest stage<b>interphase</b></span>` : `<span>Stage<b>${esc(cur[1])}</b></span><span>DNA per cell<b>${cur[3]}C</b></span><span>Chromosome no.<b>${cur[4]}</b></span><span>Daughter cells<b>${cur[5]}</b></span>`;
    root.querySelector("#celldivChain").innerHTML = rootMode ? celldivRootChain() : celldivChainHtml(st, cur);
    wireControls();
  };
  const wireControls = () => {
    root.querySelectorAll("[data-cd-step]").forEach(b => b.onclick = () => { SFX.tap(); st.step = Number(b.dataset.cdStep); st.play = false; draw(); });
    const next = root.querySelector("#cdNext"), play = root.querySelector("#cdPlay");
    if (next) next.onclick = () => { SFX.tap(); st.step = (st.step + 1) % celldivList(st).length; draw(); };
    if (play) play.onclick = () => { SFX.tap(); st.play = !st.play; play.textContent = st.play ? "⏸ Pause" : "▶ Play"; };
    const plant = root.querySelector("#cdPlant"); if (plant) plant.onchange = e => { st.plant = e.target.checked; draw(); };
    const assort = root.querySelector("#cdAssort"); if (assort) assort.onclick = () => { SFX.tap(); st.assortment = st.assortment ? 0 : 1; draw(); };
    root.querySelectorAll("[data-cd-root]").forEach(b => b.onclick = () => { SFX.tap(); st.rootFocus = b.dataset.cdRoot; draw(); });
  };
  draw();
  simLoop(root, dt => { if (st.play && st.mode !== "root") { st._acc = (st._acc || 0) + dt; if (st._acc > 1.15) { st._acc = 0; st.step = (st.step + 1) % celldivList(st).length; draw(); } } });
}
function celldivStageControls(st) {
  const list = celldivList(st);
  return `<div class="celldiv-stage">${list.map((x,i)=>`<button data-cd-step="${i}" aria-current="${i===st.step}">${esc(x[1])}<small>${esc(x[2])}</small></button>`).join("")}</div><div class="row simbtns"><button class="btn" id="cdPlay">${st.play ? "⏸ Pause" : "▶ Play"}</button><button class="btn plain" id="cdNext">Next stage ›</button>${st.mode === "mitosis" ? `<label class="btn plain chk"><input id="cdPlant" type="checkbox" ${st.plant?"checked":""}> 🌱 Plant cytokinesis</label>` : `<button class="btn yellow" id="cdAssort">🔀 Assortment: ${st.assortment?"B":"A"}</button>`}</div>`;
}
function celldivRootControls(st) { return `<div class="celldiv-root-grid">${["all","interphase","prophase","metaphase","anaphase","telophase"].map(k=>`<button data-cd-root="${k}" aria-pressed="${st.rootFocus===k}">${k==="all"?"All cells":k}<small>${k!=="all"?CELLDIV_ROOT_COUNTS[k]||"":"90"}</small></button>`).join("")}</div>`; }
function celldivChromX(cx, cy, len, col, ang, swap) {
  const w = 7, dx = Math.sin(ang) * len/2, dy = Math.cos(ang) * len/2, seg = swap ? `<path d="M${cx-dx*.9} ${cy-dy*.9} L${cx-dx*.35} ${cy-dy*.35}" stroke="#E84D8A" stroke-width="${w}" stroke-linecap="round"/>` : "";
  return `<g><path d="M${cx-dx} ${cy-dy} L${cx+dx} ${cy+dy}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><path d="M${cx+dx} ${cy-dy} L${cx-dx} ${cy+dy}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity=".85"/>${seg}<circle cx="${cx}" cy="${cy}" r="6" fill="#F5D76E" stroke="${CO}" stroke-width="2"/></g>`;
}
function celldivV(cx, cy, len, col, flip) { const s = flip ? -1 : 1; return `<path d="M${cx} ${cy} l${s*22} ${-len/2} M${cx} ${cy} l${s*22} ${len/2}" stroke="${col}" stroke-width="7" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="5" fill="#F5D76E" stroke="${CO}" stroke-width="2"/>`; }
function celldivCellSvg(st, cur) {
  const k = cur[0], mei = st.mode === "meiosis", plant = st.plant, two = cur[5] === 2 && k !== "cyto2", four = cur[5] === 4;
  const cellOutline = plant ? `<rect x="78" y="48" width="484" height="260" rx="26" fill="#F3FFF0" stroke="#8C6B35" stroke-width="6"/>` : `<ellipse cx="320" cy="178" rx="244" ry="132" fill="#F7FBFF" stroke="${CO}" stroke-width="4"/>`;
  const nucleus = (k === "g1" || k === "s" || k === "g2") ? `<ellipse cx="320" cy="176" rx="130" ry="82" fill="#E8E2FF" stroke="#7461A8" stroke-width="3" stroke-dasharray="${k==='pro'||k==='pro1'?"7 5":"0"}"/><text x="320" y="82" text-anchor="middle" font-size="20" font-weight="900" fill="#7461A8">nuclear envelope</text>` : (k === "telo" || k === "telo1" || k === "cyto" || k === "cyto2") ? `<ellipse cx="220" cy="176" rx="72" ry="58" fill="#E8E2FF" stroke="#7461A8" stroke-width="3"/><ellipse cx="420" cy="176" rx="72" ry="58" fill="#E8E2FF" stroke="#7461A8" stroke-width="3"/>` : "";
  let chr = "", spindle = "";
  const cols = ["#2F6FDB", "#D94B4B", "#2F6FDB", "#D94B4B"], lens = [80,80,52,52];
  if (["g1"].includes(k)) chr = `<text x="320" y="176" text-anchor="middle" font-size="20" font-weight="900" fill="${CO}">uncondensed DNA</text>`;
  else if (["s"].includes(k)) chr = `<text x="320" y="166" text-anchor="middle" font-size="20" font-weight="900" fill="${CO}">DNA replication</text><text x="320" y="194" text-anchor="middle" font-size="19" font-weight="850" fill="#7A6A66">chromosomes copied</text>`;
  else if (["g2","pro","pro1"].includes(k)) chr = [[280,150],[360,150],[286,214],[354,214]].map((p,i)=>celldivChromX(p[0],p[1],lens[i],cols[i],i%2?.85:-.7,k==="pro1"&&i<2)).join("") + (k==="pro1"?`<text x="320" y="294" text-anchor="middle" font-size="20" font-weight="900" fill="#E84D8A">crossing over at chiasmata</text>`:"");
  else if (["meta","meta2"].includes(k)) { spindle = celldivSpindleSvg(two); chr = [[320,105],[320,155],[320,205],[320,255]].map((p,i)=>celldivChromX(p[0],p[1],lens[i],cols[i],Math.PI/2, false)).join(""); }
  else if (k === "meta1") { spindle = celldivSpindleSvg(false); const off = st.assortment ? -1 : 1; chr = celldivChromX(300,140,80,"#2F6FDB",Math.PI/2,true)+celldivChromX(340,140,80,"#D94B4B",Math.PI/2,true)+celldivChromX(300,220,52,st.assortment?"#D94B4B":"#2F6FDB",Math.PI/2,false)+celldivChromX(340,220,52,st.assortment?"#2F6FDB":"#D94B4B",Math.PI/2,false); }
  else if (k === "ana") { spindle = celldivSpindleSvg(false); chr = [[245,120,0],[245,172,2],[245,224,0],[395,120,1],[395,172,3],[395,224,1]].map((p,i)=>celldivV(p[0],p[1],i%3?52:78,cols[p[2]],p[0]>320)).join(""); }
  else if (k === "ana1") { spindle = celldivSpindleSvg(false); chr = celldivChromX(235,140,80,"#2F6FDB",-.6,true)+celldivChromX(405,140,80,"#D94B4B",.6,true)+celldivChromX(235,220,52,st.assortment?"#D94B4B":"#2F6FDB",-.6,false)+celldivChromX(405,220,52,st.assortment?"#2F6FDB":"#D94B4B",.6,false); }
  else if (["telo","cyto","telo1"].includes(k)) chr = celldivChromX(220,160,70,"#2F6FDB",-.5,false)+celldivChromX(220,205,46,"#2F6FDB",.5,false)+celldivChromX(420,160,70,"#D94B4B",.5,false)+celldivChromX(420,205,46,"#D94B4B",-.5,false);
  else if (k === "ana2") { spindle = celldivSpindleSvg(true); chr = [[215,130,0],[215,220,2],[425,130,1],[425,220,3]].map((p,i)=>celldivV(p[0],p[1],i%2?46:70,cols[p[2]],p[0]>320)).join(""); }
  else if (k === "cyto2") chr = [[180,128,"#2F6FDB"],[180,230,st.assortment?"#D94B4B":"#2F6FDB"],[460,128,"#D94B4B"],[460,230,st.assortment?"#2F6FDB":"#D94B4B"]].map(p=>`<g transform="translate(${p[0]} ${p[1]}) scale(.72)">${celldivV(0,0,66,p[2],false)}</g>`).join("");
  const divide = k === "cyto" ? (plant ? `<rect x="314" y="52" width="12" height="252" fill="#8C6B35" opacity=".7"/><text x="338" y="296" font-size="20" font-weight="900" fill="#8C6B35">cell plate</text>` : `<path d="M320 50 C286 105 286 250 320 306" fill="none" stroke="#E9577D" stroke-width="7"/><text x="342" y="296" font-size="20" font-weight="900" fill="#E9577D">cleavage furrow</text>`) : four ? `<line x1="320" x2="320" y1="56" y2="302" stroke="#E9577D" stroke-width="4"/><line x1="90" x2="550" y1="178" y2="178" stroke="#E9577D" stroke-width="4"/>` : "";
  return `<svg viewBox="0 0 640 360" role="img" aria-label="${st.mode} stage ${cur[1]} with chromosomes and spindle fibres"><rect width="640" height="360" rx="18" fill="#F7FBFF"/>${cellOutline}${nucleus}${spindle}${chr}${divide}<text x="320" y="32" text-anchor="middle" font-size="24" font-weight="900" fill="${CO}">${cur[1]} · ${cur[2]}</text><g class="celldiv-key"><text x="58" y="338" font-size="20" font-weight="900" fill="#2F6FDB">blue: maternal</text><text x="220" y="338" font-size="20" font-weight="900" fill="#D94B4B">red: paternal</text><text x="405" y="338" font-size="20" font-weight="900" fill="#F2A900">dot: centromere</text></g></svg>`;
}
function celldivSpindleSvg(two) {
  const poles = two ? [[160,96],[160,260],[480,96],[480,260]] : [[92,178],[548,178]];
  let s = `<g stroke="#6C8BC8" stroke-width="2" opacity=".85">`;
  poles.forEach(([px,py]) => { s += `<circle cx="${px}" cy="${py}" r="8" fill="#6C8BC8" stroke="${CO}" stroke-width="2"/>`; [[320,105],[320,155],[320,205],[320,255]].forEach(([x,y])=>{ s += `<path d="M${px} ${py} Q${(px+x)/2} ${py} ${x} ${y}" fill="none"/>`; }); });
  return s + `</g>`;
}
function celldivGraphSvg(st) {
  const list = st.mode === "root" ? CELLDIV_MITOSIS : celldivList(st), X = i => 38 + i/(list.length-1)*290, Y = v => 136 - v/4*94;
  return `<svg viewBox="0 0 360 170" role="img" aria-label="DNA content per cell graph"><rect width="360" height="170" rx="14" fill="#fff"/><text x="40" y="22" font-size="12" font-weight="900" fill="#7A6A66">DNA content per cell (C)</text><path d="M38 36 V136 H334" stroke="${CO}" stroke-width="2"/><polyline points="${list.map((x,i)=>`${X(i)},${Y(x[3])}`).join(" ")}" fill="none" stroke="#8E5BD6" stroke-width="3.5"/>${list.map((x,i)=>`<circle cx="${X(i)}" cy="${Y(x[3])}" r="${i===st.step && st.mode!=="root"?6:3.5}" fill="${i===st.step&&st.mode!=="root"?"#F2A900":"#8E5BD6"}"/>`).join("")}<text x="187" y="162" text-anchor="middle" font-size="11" font-weight="900" fill="#7A6A66">stage →</text><text x="34" y="46" text-anchor="end" font-size="11" font-weight="900" fill="#7A6A66">4C</text><text x="34" y="93" text-anchor="end" font-size="11" font-weight="900" fill="#7A6A66">2C</text><text x="34" y="139" text-anchor="end" font-size="11" font-weight="900" fill="#7A6A66">0</text></svg>`;
}
function celldivChainHtml(st, cur) {
  const k = cur[0];
  const rows = st.mode === "mitosis" ? ["G1: cell grows and makes organelles.", "S phase: DNA replication makes sister chromatids.", "PMAT: chromosomes condense, line up, separate, nuclei reform.", "Cytokinesis splits the cytoplasm.", "Result: 2 identical diploid cells."] : ["S phase copies DNA once.", "Meiosis I: homologous chromosomes pair, cross over and separate.", "Independent assortment changes which homologue goes to each pole.", "Meiosis II: sister chromatids separate.", "Result: 4 different haploid cells."];
  const on = st.mode === "mitosis" ? [k==="g1",k==="s"||k==="g2",["pro","meta","ana","telo"].includes(k),k==="cyto",k==="cyto"] : [k==="s",["pro1","meta1","ana1","telo1"].includes(k),["meta1","ana1"].includes(k),["meta2","ana2"].includes(k),k==="cyto2"];
  return rows.map((r,i)=>`<span class="${on[i]?"on":""}">${esc(r)}</span>`).join("");
}
function celldivRootSvg(st) {
  const stages = ["interphase","prophase","metaphase","anaphase","telophase"], cells = [];
  stages.forEach((stage, si) => { for (let i=0;i<CELLDIV_ROOT_COUNTS[stage];i++) cells.push(stage); });
  return `<svg viewBox="0 0 640 380" role="img" aria-label="Onion root tip squash microscope field with stained cells in each mitosis stage"><rect width="640" height="380" rx="18" fill="#F8F1FF"/><text x="320" y="30" text-anchor="middle" font-size="24" font-weight="900" fill="${CO}">Onion root tip squash</text><g transform="translate(45 54)">${cells.map((stage,i)=>{ const col=Math.floor(i%10), row=Math.floor(i/10), x=col*55, y=row*31, hi=st.rootFocus==="all"||st.rootFocus===stage, fill={interphase:"#F7E8FF",prophase:"#E8D8FF",metaphase:"#FFE7A8",anaphase:"#FFD0C4",telophase:"#DFF2FF"}[stage]; const chrom = celldivRootMini(stage, x+26, y+15); return `<g opacity="${hi?1:.18}"><rect x="${x}" y="${y}" width="50" height="27" fill="${fill}" stroke="#8C6B35" stroke-width="1.8"/>${chrom}<title>${stage}</title></g>`; }).join("")}</g><text x="320" y="366" text-anchor="middle" font-size="20" font-weight="900" fill="#7A6A66">Mitotic index = 35 ÷ 90 × 100 = 38.9%</text></svg>`;
}
function celldivRootMini(stage,cx,cy){ if(stage==="interphase")return`<circle cx="${cx}" cy="${cy}" r="8" fill="#8060B8" opacity=".55"/>`; if(stage==="prophase")return celldivChromX(cx,cy,16,"#5E45A8",.8,false); if(stage==="metaphase")return`<path d="M${cx} ${cy-10} V${cy+10}" stroke="#5E45A8" stroke-width="3"/><path d="M${cx-9} ${cy-8} L${cx+9} ${cy+8} M${cx+9} ${cy-8} L${cx-9} ${cy+8}" stroke="#5E45A8" stroke-width="2.5"/>`; if(stage==="anaphase")return`<path d="M${cx-9} ${cy-9} l-7 8 M${cx-9} ${cy+9} l-7 -8 M${cx+9} ${cy-9} l7 8 M${cx+9} ${cy+9} l7 -8" stroke="#5E45A8" stroke-width="3" stroke-linecap="round"/>`; return`<circle cx="${cx-9}" cy="${cy}" r="6" fill="#8060B8" opacity=".7"/><circle cx="${cx+9}" cy="${cy}" r="6" fill="#8060B8" opacity=".7"/>`; }
function celldivRootChain() { return [`Most cells are in interphase, so it is the longest part of the cell cycle.`,`Mitotic index = cells in mitosis ÷ total cells × 100.`,`Root tips are used because cells there divide for growth.`,`Stage counts estimate relative duration: more cells seen = longer stage.`].map(x=>`<span class="on">${esc(x)}</span>`).join(""); }

Object.assign(SIM_P, {
  diffuse: ["A 0.5 cm agar cube and a 3 cm agar cube sit in the same acid. Which cube loses its pink colour throughout first?", ["The 0.5 cm cube, because it has a shorter diffusion distance and larger SA:V", "The 3 cm cube, because it has more volume", "They finish together because the same acid is used", "The 3 cm cube, because it has more surface area in total"], "Small cubes have more surface area per volume and a shorter path to the centre.", "start the timer and compare cube sizes."],
  plasmo: ["A red onion cell is put into a concentrated sucrose solution. What happens to the protoplast?", ["It shrinks and pulls away from the cell wall because water leaves by osmosis", "It bursts because the cell wall is fully permeable", "It becomes turgid because water enters", "Nothing changes because sucrose enters freely"], "The external solution has lower water potential. Water leaves through the partially permeable membrane, causing plasmolysis.", "choose red onion and 1.0 mol dm⁻³ sucrose."],
  celldiv: ["After meiosis in a cell with 2n = 4, what should each gamete contain?", ["n = 2 chromosomes, with one from each homologous pair", "2n = 4 chromosomes, identical to the parent", "8 chromosomes because DNA was copied", "No chromosomes until fertilisation"], "Meiosis halves the chromosome number. DNA copies once, then two divisions make haploid cells.", "switch to meiosis and step to cytokinesis II."]
});
Object.assign(SIM_Q, {
  diffuse: [["Why do most cells stay small?", ["A small cell has a larger surface area to volume ratio for exchange", "A small cell has no need for diffusion", "A large cell has a shorter diffusion distance", "Surface area rises faster than volume as a cube grows"], "As size increases, volume rises faster than surface area, so SA:V falls and diffusion cannot meet demand."], ["Which condition increases the rate of diffusion?", ["A steeper concentration gradient", "A longer diffusion distance", "A lower temperature", "A smaller exchange surface"], "A steeper gradient causes more net movement from high to low concentration each second."]],
  plasmo: [["At the x-intercept of the potato graph, what is true?", ["There is no net movement of water into or out of the tissue", "The cells have all burst", "Sucrose cannot affect water potential", "The potato has no cell membranes"], "At zero % mass change, the solution and potato cell sap have the same water potential."], ["Why do plant cells not burst in distilled water?", ["The cellulose cell wall resists the pressure as the cell becomes turgid", "The cell membrane becomes fully permeable", "Water cannot enter plant cells", "The vacuole disappears"], "Water enters, but the strong cell wall stops over-expansion and gives support."]],
  celldiv: [["What happens in mitotic anaphase?", ["Sister chromatids separate and move to opposite poles", "Homologous chromosomes pair up", "DNA replication begins", "Four haploid nuclei form"], "At anaphase, centromeres split and spindle fibres pull sister chromatids apart."], ["Which feature belongs to meiosis but not mitosis?", ["Homologous chromosomes pair and crossing over can occur", "Sister chromatids are joined by centromeres", "Spindle fibres attach to chromosomes", "Cytokinesis divides the cytoplasm"], "Pairing and crossing over in prophase I create new allele combinations."]]
});

SIM_CH.diffuse = { title: "Agar Cube Detective", mins: 15, story: "Use agar cubes to prove how size, distance, concentration gradient and temperature control diffusion.", missions: [
  { ic:"🧊", name:"Set up", tasks:[
    { type:"goal", ic:"🧊", do:"Choose the <b>0.5 cm</b> agar cube.", look:"Cube side buttons", target:"0.5 cm cube", check:p=>p.side===0.5, hold:.2, why:"The smallest cube has the shortest path to its centre."},
    { type:"goal", ic:"▶", do:"Press <b>▶ Start timer</b> and reach the centre.", look:"Agar cross-section", target:"centre reached", check:p=>p.side===0.5&&p.reached, meter:p=>({v:p.pct,min:0,max:100,lo:99,hi:100,unit:"%",label:"Volume reached"}), hold:.2, why:"Acid quickly reaches the whole small cube."},
    { type:"read", ic:"📏", do:"Read the centre time for the <b>0.5 cm</b> cube.", look:"Readout tiles", need:p=>p.side===0.5&&p.reached, needTxt:"Use the 0.5 cm cube and reach the centre.", fields:[["Centre time",p=>p.centreT,2,"min"]], why:"Centre time is short because diffusion distance is only 0.25 cm."}
  ]},
  { ic:"🧮", name:"SA:V", tasks:[
    { type:"goal", ic:"🧊", do:"Switch to the <b>3 cm</b> agar cube.", look:"Cube side buttons", target:"3 cm cube", check:p=>p.side===3, hold:.2, why:"A larger cube has a much longer path to its centre."},
    { type:"read", ic:"↔️", do:"Read the <b>SA:V ratio</b> for the 3 cm cube.", look:"Calculation panel", need:p=>p.side===3, needTxt:"Choose the 3 cm cube.", fields:[["SA:V",p=>p.sav,.1,":1"]], why:"For a cube, SA:V = 6 ÷ side, so 3 cm gives 2:1."},
    { type:"pick", ic:"📦", do:"Why does the 3 cm cube take longer?", look:"Agar cube + calculation panel", need:p=>p.side===3, needTxt:"Choose the 3 cm cube.", opts:["Its centre is further from the surface and its SA:V is lower","It has no surface area","Acid molecules stop moving in large cubes","Phenolphthalein blocks the acid"], miss:["","Every cube has a surface; compare SA:V.","Particles still move randomly.","The indicator changes colour; it does not block acid."], why:"Volume needing supply rises faster than exchange surface."},
    { type:"fill", ic:"✍️", do:"Complete the cube rule.", text:"As cube side increases, SA:V {decreases|increases|stays the same} and diffusion distance {increases|decreases|disappears}.", why:"This is why large cells are inefficient for diffusion alone."}
  ]},
  { ic:"🌡️", name:"Rate factors", tasks:[
    { type:"goal", ic:"📶", do:"Set acid concentration to <b>2.0 mol dm⁻³</b>.", look:"Acid concentration buttons", target:"steep gradient", check:p=>p.conc===2, hold:.2, why:"Higher acid concentration means a steeper concentration gradient."},
    { type:"goal", ic:"🌡️", do:"Set temperature to <b>40 °C</b>.", look:"Temperature buttons", target:"warm acid", check:p=>p.temp===40, hold:.2, why:"Warmer particles have more kinetic energy."},
    { type:"pick", ic:"🫧", do:"What does the particle view show?", opts:["Random movement with a net movement down the gradient","All particles move in straight lines only","Particles need ATP for diffusion","Net movement is from low to high concentration"], miss:["","The paths jiggle because movement is random.","Diffusion is passive.","The arrow points high → low."], why:"Diffusion is passive net movement from high to low concentration."}
  ]},
  { ic:"🧬", name:"Apply", tasks:[
    { type:"pick", ic:"🫁", do:"Why are alveoli and villi useful exchange surfaces?", opts:["They give a large surface area and a short diffusion distance","They make diffusion use ATP","They reduce the concentration gradient","They are thick and dry"], miss:["","Diffusion is passive.","A steep gradient helps diffusion.","Exchange surfaces are thin and moist."], why:"Large surface + thin barrier + gradients make diffusion fast."},
    { type:"fill", ic:"✍️", do:"Finish the biology link.", text:"Large organisms need transport systems because diffusion alone is too {slow|fast|active} over long {distances|colours|temperatures}.", why:"Blood, xylem and phloem move substances in bulk over long distances."},
    { type:"order", ic:"🔢", do:"Order the adaptations for fast diffusion.", items:["Large surface area", "Thin / short diffusion distance", "Steep concentration gradient"], why:"All three improve exchange in cells and organs."}
  ]}
]};

SIM_CH.plasmo = { title:"Osmosis Cell Lab", mins:15, story:"Run the potato strip experiment, find the isotonic point, then predict onion and red blood cell states.", missions:[
  { ic:"🥔", name:"Run strips", tasks:[
    { type:"goal", ic:"▶", do:"Press <b>▶ Run 30 min</b> and finish the potato experiment.", look:"Timer + graph", target:"30 min finished", check:p=>p.finished, meter:p=>({v:p.t,min:0,max:30,lo:30,hi:30,unit:" min",label:"Time"}), hold:.2, why:"All strips need the same soaking time for a fair test."},
    { type:"read", ic:"📈", do:"Read the x-intercept concentration.", look:"Graph green line", need:p=>p.finished, needTxt:"Finish the 30-minute run.", fields:[["x-intercept",p=>p.xIntercept,.03,"mol dm⁻³"]], why:"The x-intercept estimates the potato tissue solute concentration."},
    { type:"pick", ic:"⚖️", do:"What happens at the x-intercept?", opts:["No net movement of water","Maximum haemolysis","All sucrose enters the cells","The cell wall becomes impermeable"], miss:["","Haemolysis is for red blood cells in water.","Sucrose is not freely entering all cells here.","The plant wall is fully permeable."], why:"Equal water potential gives zero mean % mass change."}
  ]},
  { ic:"📊", name:"Read data", tasks:[
    { type:"goal", ic:"💧", do:"Select <b>0.0 mol dm⁻³</b> solution.", look:"Sucrose buttons", target:"water selected", check:p=>p.conc===0, hold:.2, why:"Distilled water has the highest water potential."},
    { type:"read", ic:"%", do:"Read the selected % mass change in water.", look:"Readout tiles", need:p=>p.conc===0&&p.finished, needTxt:"Finish the run and select 0.0 mol dm⁻³.", fields:[["% mass change",p=>p.selectedPct,1.5,"%"]], why:"Potato gains mass as water enters by osmosis."},
    { type:"goal", ic:"🍬", do:"Select <b>1.0 mol dm⁻³</b> solution.", look:"Sucrose buttons", target:"strong sucrose", check:p=>p.conc===1, hold:.2, why:"Strong sucrose has low water potential."},
    { type:"pick", ic:"🥔", do:"How should the potato strip feel in 1.0 mol dm⁻³?", opts:["Flaccid / soft", "Turgid / firm", "Burst open", "No change in feel"], miss:["","Firm strips have gained water in dilute solution.","Plant cells have walls and do not burst like RBCs.","The graph shows a large negative % change."], why:"Water leaves the cells, turgor falls and the strip becomes soft."}
  ]},
  { ic:"🔬", name:"Cells", tasks:[
    { type:"goal", ic:"🧅", do:"Show <b>red onion</b> in <b>1.0 mol dm⁻³</b> sucrose.", look:"Microscope view", target:"plasmolysed onion", check:p=>p.specimen==="onion"&&p.conc===1&&p.state==="plasmolysed", hold:.2, why:"The protoplast pulls away from the cell wall."},
    { type:"pick", ic:"🧱", do:"What fills the gap between wall and membrane during plasmolysis?", opts:["External sucrose solution", "Air only", "New cell wall", "Burst red blood cells"], miss:["","The gap is liquid, not air.","The wall is outside and remains in place.","This is an onion cell, not blood."], why:"The cell wall is fully permeable, so external solution occupies the space."},
    { type:"goal", ic:"🩸", do:"Switch to <b>red blood cell</b> in <b>0.0 mol dm⁻³</b> solution.", look:"Microscope view", target:"haemolysis", check:p=>p.specimen==="rbc"&&p.conc===0&&p.state==="haemolysis", hold:.2, why:"Water enters; no wall prevents bursting."},
    { type:"goal", ic:"✹", do:"Keep <b>red blood cell</b> and select <b>1.0 mol dm⁻³</b>.", look:"Microscope view", target:"crenation", check:p=>p.specimen==="rbc"&&p.conc===1&&p.state==="crenated", hold:.2, why:"Water leaves and the red blood cell shrinks."}
  ]},
  { ic:"🧪", name:"Explain", tasks:[
    { type:"fill", ic:"✍️", do:"Complete the osmosis sentence.", text:"Water moves from higher {water potential|sucrose mass|temperature} to lower water potential through a {partially permeable|fully permeable|thick cellulose} membrane.", why:"Use water potential language in HKDSE answers."},
    { type:"order", ic:"🔢", do:"Order the fair-test method.", items:["Cut equal-sized potato cylinders","Soak in different sucrose concentrations for 30 min","Blot dry before weighing again","Calculate mean % change from replicates"], why:"Equal size, time and blotting keep the comparison fair."},
    { type:"pick", ic:"🧅", do:"Why do plant cells become turgid but not burst in water?", opts:["The cellulose cell wall resists expansion", "The membrane stops all water entry", "The vacuole leaves the cell", "The nucleus pumps water out"], miss:["","Water does enter by osmosis.","The vacuole becomes full, not lost.","The nucleus does not pump water."], why:"Turgor pressure against the wall gives support."}
  ]}
]};

SIM_CH.celldiv = { title:"Division Stage Detective", mins:15, story:"Step through 2n = 4 cells, compare mitosis and meiosis, then use a root tip squash to calculate mitotic index.", missions:[
  { ic:"2️⃣", name:"Mitosis", tasks:[
    { type:"goal", ic:"2️⃣", do:"Open <b>mitosis</b> and choose <b>S</b> phase.", look:"Stage buttons", target:"S phase", check:p=>p.mode==="mitosis"&&p.stage==="s", hold:.2, why:"DNA replication happens in S phase."},
    { type:"read", ic:"📈", do:"Read DNA content in <b>S/G2</b> after copying.", look:"DNA graph + readout", need:p=>p.mode==="mitosis"&&(p.stage==="s"||p.stage==="g2"), needTxt:"Choose S phase or G2 in mitosis.", fields:[["DNA content",p=>p.dna,.2,"C"]], why:"After DNA replication, DNA content doubles to 4C."},
    { type:"goal", ic:"📍", do:"Choose <b>Metaphase</b> in mitosis.", look:"Chromosome drawing", target:"metaphase", check:p=>p.mode==="mitosis"&&p.stage==="meta", hold:.2, why:"Chromosomes line up at the equator."},
    { type:"goal", ic:"↔️", do:"Choose <b>Anaphase</b> in mitosis.", look:"Spindle fibres", target:"anaphase", check:p=>p.mode==="mitosis"&&p.stage==="ana", hold:.2, why:"Sister chromatids separate to opposite poles."}
  ]},
  { ic:"4️⃣", name:"Meiosis", tasks:[
    { type:"goal", ic:"4️⃣", do:"Open <b>meiosis</b> and choose <b>Prophase I</b>.", look:"Mode + stage buttons", target:"Prophase I", check:p=>p.mode==="meiosis"&&p.stage==="pro1", hold:.2, why:"Homologous chromosomes pair and crossing over can occur."},
    { type:"goal", ic:"🔀", do:"Press <b>🔀 Assortment</b> to switch line-up.", look:"Assortment button", target:"assortment B", check:p=>p.mode==="meiosis"&&p.assortment===1, hold:.2, why:"Independent assortment changes chromosome combinations in gametes."},
    { type:"goal", ic:"👯", do:"Choose <b>Anaphase I</b> in meiosis.", look:"Chromosome drawing", target:"homologues separate", check:p=>p.mode==="meiosis"&&p.stage==="ana1", hold:.2, why:"Homologous chromosomes separate in meiosis I; sister chromatids stay joined."},
    { type:"goal", ic:"🏁", do:"Choose <b>Cytokinesis II</b>.", look:"Final gametes", target:"4 haploid cells", check:p=>p.mode==="meiosis"&&p.stage==="cyto2"&&p.daughterCells===4&&p.haploid, hold:.2, why:"Meiosis II separates chromatids to make 4 haploid cells."}
  ]},
  { ic:"🔬", name:"Root tip", tasks:[
    { type:"goal", ic:"🔬", do:"Open the <b>Root tip</b> microscope.", look:"Mode buttons", target:"root tip", check:p=>p.mode==="root", hold:.2, why:"Root tips have many dividing cells for growth."},
    { type:"read", ic:"%", do:"Read the <b>mitotic index</b>.", look:"Readout + microscope caption", need:p=>p.mode==="root", needTxt:"Open the root tip microscope.", fields:[["Mitotic index",p=>p.mitoticIndex,.2,"%"]], why:"Mitotic index = dividing cells ÷ total cells × 100."},
    { type:"read", ic:"🔢", do:"Read prophase and metaphase counts.", look:"Stage count buttons", need:p=>p.mode==="root", needTxt:"Open the root tip microscope.", fields:[["Prophase",p=>p.prophase,0,"cells"],["Metaphase",p=>p.metaphase,0,"cells"]], why:"Counts from a squash slide estimate relative time spent in each stage."}
  ]},
  { ic:"⚖️", name:"Compare", tasks:[
    { type:"fill", ic:"✍️", do:"Complete the comparison.", text:"Mitosis makes {2|4|1} genetically {identical|different|haploid} diploid cells; meiosis makes {4|2|8} genetically different haploid cells.", why:"Mitosis keeps chromosome number; meiosis halves it."},
    { type:"pick", ic:"🌱", do:"Where is mitosis commonly observed in plants?", opts:["Root tips and shoot tips", "Anthers only", "Only dead xylem vessels", "Only mature pollen grains"], miss:["","Anthers are sites of meiosis for pollen formation.","Dead cells do not divide.","Mature gametophyte cells are not the usual mitosis slide."], why:"Root tips contain meristem cells actively dividing for growth."},
    { type:"pick", ic:"✂️", do:"Which events create variation in meiosis?", opts:["Crossing over and independent assortment", "Cleavage furrow and cell plate", "DNA replication only", "Interphase and cytokinesis only"], miss:["","These divide cytoplasm; they do not shuffle alleles.","Copying DNA alone does not create new combinations.","These are not the main variation sources."], why:"Meiosis shuffles maternal and paternal chromosomes and exchanges segments."},
    { type:"order", ic:"🔢", do:"Order mitosis stages after interphase.", items:["Prophase", "Metaphase", "Anaphase", "Telophase", "Cytokinesis"], why:"PMAT then cytokinesis completes cell division."}
  ]}
]};
