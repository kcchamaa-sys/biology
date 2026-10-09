/* ============================================================
   5f-a. 🌿 Lab section a: Essential life processes in plants
   Leaf gas exchange + transpiration live models, plus challenges for all section-a sims.
   ============================================================ */

simStyle(`
  .leafgas-read,.transp-read{display:grid;grid-template-columns:repeat(auto-fit,minmax(138px,1fr));gap:8px;margin-top:8px}
  .leafgas-read span,.transp-read span{display:block;background:#fff;border:2px solid #E8DFD7;border-radius:12px;padding:8px;font-size:.9rem}
  .leafgas-read b,.transp-read b{display:block;font-size:1.15rem;color:#3B2F2B}
  .leafgas-tubechip{display:inline-flex;align-items:center;gap:6px;padding:5px 8px;border-radius:999px;background:#fff;border:2px solid #E8DFD7;font-weight:800}
  .leafgas-chain,.transp-chain{display:grid;gap:7px;margin-top:8px}
  .leafgas-chain span,.transp-chain span{padding:7px 9px;border-radius:12px;background:#F7F0E8;border:2px solid #E8DFD7;font-weight:800}
  .leafgas-chain span.on,.transp-chain span.on{background:#E8F7E8;border-color:#78C87E}
  .transp-table{max-height:210px;overflow:auto}
`);

const LEAFGAS_CO2 = { low: .65, normal: 1, high: 1.35 };
const LEAFGAS_CO2_LAB = { low: "low CO₂", normal: "normal CO₂", high: "high CO₂" };
function leafgasRates(st) {
  const effLight = st.foil ? 0 : st.light;
  const tempF = clamp(.18 + .95 * Math.exp(-Math.pow((st.temp - 25) / 16, 2)), .18, 1.08);
  const co2F = LEAFGAS_CO2[st.co2] || 1;
  const pMax = st.setup === "leaf" ? 10.5 * co2F * tempF : 0;
  const photo = st.setup === "leaf" ? pMax * effLight / (effLight + 30) : 0;
  const resp = st.setup === "leaf" ? 1.25 * Math.pow(1.055, st.temp - 25) : 0;
  const denom = 10.5 * co2F * tempF - resp;
  const comp = denom <= 0 ? 101 : 30 * resp / denom;
  const net = photo - resp;
  const open = st.setup === "leaf" && effLight > 12;
  return { effLight, tempF, co2F, photo, resp, net, comp, open };
}
function leafgasColour(x) { return x > .35 ? "yellow" : x < -.35 ? "purple" : "red"; }
function leafgasSim(root) {
  const st = { light: 60, temp: 25, co2: "normal", setup: "leaf", foil: false, run: false, fast: false, t: 0, ind: 0 };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="leafgasSvg" class="simsvg"></div>
      <div class="row simbtns"><button class="btn" id="lgRun">▶ Run tube</button><button class="btn plain" id="lgFast">⏩ Fast</button><button class="btn plain" id="lgReset">↺ Reset indicator</button></div>
      <label class="small"><b>☀️ Light intensity: <span id="lgLightLab"></span></b><input type="range" id="lgLight" min="0" max="100" value="60" style="width:100%"></label>
      <div class="row simbtns"><button class="btn plain" data-lg-light="0">🌑 Darkness</button><button class="btn plain" data-lg-light="18">🌥️ Dim</button><button class="btn plain" data-lg-light="75">☀️ Bright</button></div>
      <label class="small"><b>🌡️ Temperature: <span id="lgTempLab"></span></b><input type="range" id="lgTemp" min="5" max="45" value="25" style="width:100%"></label>
    </section>
    <section class="card"><h3 style="margin:0">🧪 Experiment set-up</h3>
      <div><b class="small">Tube contents</b>${segBtns("lg-setup", [["leaf", "🍃 Leaf in tube"], ["noleaf", "⚖️ No-leaf control"]], "leaf")}</div>
      <div style="margin-top:8px"><b class="small">Carbon dioxide around leaf</b>${segBtns("lg-co2", [["low", "low"], ["normal", "normal"], ["high", "high"]], "normal")}</div>
      <label class="small chk"><input type="checkbox" id="lgFoil"> 🧻 Cover tube with foil (dark treatment)</label>
      <div class="leafgas-read" id="leafgasRead"></div><div id="leafgasWhy" class="leafgas-chain"></div>
      <p class="small muted" style="margin:8px 0 0">Hydrogencarbonate indicator: <b>yellow</b> = more CO₂, <b>red</b> = equilibrium, <b>purple</b> = less CO₂.</p>
    </section></div>`;
  const light = root.querySelector("#lgLight"), temp = root.querySelector("#lgTemp"), runBtn = root.querySelector("#lgRun");
  const updateLabels = () => {
    root.querySelector("#lgLightLab").textContent = st.light <= 0 ? "darkness" : `${st.light}%`;
    root.querySelector("#lgTempLab").textContent = `${st.temp} °C`;
  };
  const resetInd = () => { st.t = 0; st.ind = 0; st.run = false; runBtn.textContent = "▶ Run tube"; };
  light.oninput = () => { st.light = Number(light.value); updateLabels(); };
  temp.oninput = () => { st.temp = Number(temp.value); updateLabels(); };
  root.querySelectorAll("[data-lg-light]").forEach(b => b.onclick = () => { SFX.tap(); st.light = Number(b.dataset.lgLight); light.value = st.light; updateLabels(); });
  root.querySelectorAll("[data-lg-setup]").forEach(b => b.onclick = () => { SFX.tap(); st.setup = b.dataset.lgSetup; root.querySelectorAll("[data-lg-setup]").forEach(x => x.setAttribute("aria-checked", x === b ? "true" : "false")); resetInd(); });
  root.querySelectorAll("[data-lg-co2]").forEach(b => b.onclick = () => { SFX.tap(); st.co2 = b.dataset.lgCo2; root.querySelectorAll("[data-lg-co2]").forEach(x => x.setAttribute("aria-checked", x === b ? "true" : "false")); });
  root.querySelector("#lgFoil").onchange = e => { st.foil = e.target.checked; };
  runBtn.onclick = () => { SFX.click(); st.run = !st.run; runBtn.textContent = st.run ? "⏸ Pause" : "▶ Continue"; };
  root.querySelector("#lgFast").onclick = () => { SFX.tap(); st.fast = !st.fast; root.querySelector("#lgFast").textContent = st.fast ? "⏩ Fast: on" : "⏩ Fast"; };
  root.querySelector("#lgReset").onclick = () => { SFX.tap(); resetInd(); };
  updateLabels();
  simProbe(() => { const r = leafgasRates(st), colour = leafgasColour(st.ind); return { light: st.light, effLight: +r.effLight.toFixed(1), temp: st.temp, co2: st.co2, setup: st.setup, foil: st.foil, photo: +r.photo.toFixed(2), resp: +r.resp.toFixed(2), net: +r.net.toFixed(2), gas: Math.abs(r.net) < .15 ? "none" : r.net > 0 ? "o2out" : "co2out", open: r.open, ind: +st.ind.toFixed(2), colour, run: st.run, t: +st.t.toFixed(1), comp: +r.comp.toFixed(1) }; });
  simLoop(root, dt => {
    const r = leafgasRates(st);
    if (st.run) {
      const step = dt * (st.fast ? 7 : 1.6);
      st.t += step;
      const target = st.setup === "leaf" ? -r.net / 3.4 : 0;
      st.ind = clamp(st.ind + (target - st.ind) * step * .18, -2.2, 2.2);
    }
    const colour = leafgasColour(st.ind);
    root.querySelector("#leafgasSvg").innerHTML = leafgasSvg(st, r, colour);
    root.querySelector("#leafgasRead").innerHTML = `<span>Photosynthesis rate<b>${r.photo.toFixed(1)}</b></span><span>Respiration rate<b>${r.resp.toFixed(1)}</b></span><span>Net gas exchange<b>${Math.abs(r.net) < .15 ? "balanced" : r.net > 0 ? "O₂ out" : "CO₂ out"}</b></span><span>Compensation point<b>${r.comp > 100 ? "not reached" : `${r.comp.toFixed(0)}% light`}</b></span>`;
    root.querySelector("#leafgasWhy").innerHTML = `<span class="${r.effLight <= 0 ? "on" : ""}">🌑 Darkness: photosynthesis stops, but respiration continues.</span><span class="${Math.abs(r.net) < .15 ? "on" : ""}">⚖️ Compensation point: photosynthesis = respiration.</span><span class="${r.net > .15 ? "on" : ""}">☀️ In bright light, CO₂ is used and O₂ leaves the stomata.</span><span class="${st.setup === "noleaf" ? "on" : ""}">⚖️ No-leaf control: indicator should stay red.</span>`;
  });
}
function leafgasSvg(st, r, colour) {
  const tubeCol = { yellow: "#F8D84A", red: "#E85B54", purple: "#9B5EDB" }[colour];
  const tubeLab = { yellow: "more CO₂", red: "equilibrium", purple: "less CO₂" }[colour];
  const pH = Math.min(142, r.photo * 13), rH = Math.min(142, r.resp * 22), net = r.net;
  const stom = r.open ? 18 : 4, guard = r.open ? "#75C77A" : "#9DCB80";
  const gas = Math.abs(net) < .15 ? `<text x="466" y="144" text-anchor="middle" font-size="18" font-weight="900" fill="#7A6A66">balanced</text>` : net > 0
    ? `<path d="M456 166 C430 154 416 126 392 116" stroke="#3FA06B" stroke-width="5" fill="none" marker-end="url(#lgArrG)"/><path d="M394 204 C420 192 438 174 454 162" stroke="#5B8FE0" stroke-width="4" fill="none" marker-end="url(#lgArrB)"/><text x="386" y="104" font-size="14" font-weight="900" fill="#3FA06B">O₂ out</text><text x="380" y="222" font-size="14" font-weight="900" fill="#5B8FE0">CO₂ in</text>`
    : `<path d="M454 160 C424 144 410 116 388 102" stroke="#E9573F" stroke-width="5" fill="none" marker-end="url(#lgArrR)"/><path d="M392 218 C420 202 438 180 454 164" stroke="#5B8FE0" stroke-width="4" fill="none" marker-end="url(#lgArrB)"/><text x="374" y="90" font-size="14" font-weight="900" fill="#E9573F">CO₂ out</text><text x="374" y="236" font-size="14" font-weight="900" fill="#5B8FE0">O₂ in</text>`;
  const foil = st.foil ? `<rect x="82" y="50" width="206" height="210" rx="14" fill="#B8B8B8" opacity=".82"/><text x="185" y="160" text-anchor="middle" font-size="24" font-weight="900" fill="#fff">FOIL</text>` : "";
  return `<svg viewBox="0 0 640 340" role="img" aria-label="Leaf gas exchange with hydrogencarbonate indicator">
    <defs><marker id="lgArrG" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#3FA06B"/></marker><marker id="lgArrR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#E9573F"/></marker><marker id="lgArrB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#5B8FE0"/></marker></defs>
    <rect width="640" height="340" rx="14" fill="#F7FBF0"/>
    <g transform="translate(28 28)"><rect x="42" y="14" width="230" height="268" rx="28" fill="#EAF8FF" stroke="#3B2F2B" stroke-width="3"/><rect x="62" y="202" width="190" height="56" rx="20" fill="${tubeCol}" stroke="#3B2F2B" stroke-width="2"/><text x="157" y="236" text-anchor="middle" font-size="18" font-weight="900" fill="#3B2F2B">${tubeLab}</text>${st.setup === "leaf" ? leafgasLeafSvg(156, 132) : `<g><circle cx="156" cy="130" r="42" fill="#fff" stroke="#B9B2AA" stroke-width="3" stroke-dasharray="7 5"/><text x="156" y="136" text-anchor="middle" font-size="18" font-weight="900" fill="#7A6A66">no leaf</text></g>`}${foil}<text x="156" y="302" text-anchor="middle" font-size="13" font-weight="800" fill="#7A6A66">hydrogencarbonate indicator tube · ${st.t.toFixed(0)} s</text></g>
    <g transform="translate(346 28)"><text x="112" y="18" text-anchor="middle" font-size="17" font-weight="900" fill="#3B2F2B">Rates inside the leaf</text><rect x="26" y="42" width="54" height="160" rx="12" fill="#E6F4E9"/><rect x="32" y="${202 - pH}" width="42" height="${pH}" rx="8" fill="#5BBE62"/><text x="53" y="224" text-anchor="middle" font-size="13" font-weight="900" fill="#3B2F2B">photo</text><rect x="142" y="42" width="54" height="160" rx="12" fill="#FBEAE8"/><rect x="148" y="${202 - rH}" width="42" height="${rH}" rx="8" fill="#E9573F"/><text x="169" y="224" text-anchor="middle" font-size="13" font-weight="900" fill="#3B2F2B">resp</text><line x1="0" y1="${202 - Math.min(142, r.comp / 100 * 142)}" x2="224" y2="${202 - Math.min(142, r.comp / 100 * 142)}" stroke="#8E44C8" stroke-width="2" stroke-dasharray="5 4"/><text x="222" y="${196 - Math.min(142, r.comp / 100 * 142)}" text-anchor="end" font-size="11" font-weight="900" fill="#8E44C8">compensation</text></g>
    <g transform="translate(440 230)"><ellipse cx="48" cy="42" rx="44" ry="24" fill="#DDF4D4" stroke="#3B2F2B" stroke-width="2"/><ellipse cx="${48 - stom / 2}" cy="42" rx="18" ry="24" fill="${guard}" stroke="#3B2F2B" stroke-width="2"/><ellipse cx="${48 + stom / 2}" cy="42" rx="18" ry="24" fill="${guard}" stroke="#3B2F2B" stroke-width="2"/><ellipse cx="48" cy="42" rx="${stom / 2}" ry="20" fill="#24322B"/><text x="48" y="86" text-anchor="middle" font-size="13" font-weight="900" fill="#3B2F2B">stoma ${r.open ? "open" : "closed"}</text></g>${gas}
  </svg>`;
}
function leafgasLeafSvg(cx, cy) { return `<g><path d="M${cx - 86} ${cy + 8} C${cx - 24} ${cy - 70} ${cx + 78} ${cy - 56} ${cx + 88} ${cy + 8} C${cx + 34} ${cy + 56} ${cx - 42} ${cy + 60} ${cx - 86} ${cy + 8}Z" fill="#69BC5B" stroke="#3B2F2B" stroke-width="3"/><path d="M${cx - 70} ${cy + 8} C${cx - 6} ${cy + 4} ${cx + 46} ${cy + 0} ${cx + 78} ${cy + 8}" stroke="#2F803B" stroke-width="4" fill="none"/><path d="M${cx - 20} ${cy + 4} q-16 -24 -40 -34 M${cx + 8} ${cy + 2} q12 -24 40 -34 M${cx + 26} ${cy + 4} q18 22 44 28" stroke="#2F803B" stroke-width="2" fill="none" opacity=".7"/><text x="${cx}" y="${cy + 82}" text-anchor="middle" font-size="13" font-weight="900" fill="#3B2F2B">leaf in sealed tube</text></g>`; }

const TRANSP_OPTS = {
  light: ["☀️ Light", [["dark", "🌑 Dark"], ["dim", "🌥️ Dim"], ["bright", "☀️ Bright"]]],
  wind: ["💨 Wind", [["still", "Still"], ["breeze", "Breeze"], ["fan", "Fan"]]],
  humidity: ["💧 Humidity", [["high", "High"], ["normal", "Normal"], ["low", "Low"]]],
  temp: ["🌡️ Temperature", [["15", "15 °C"], ["25", "25 °C"], ["35", "35 °C"]]],
  vaseline: ["🧴 Vaseline", [["none", "None"], ["upper", "Upper"], ["lower", "Lower"], ["both", "Both"]]]
};
const TRANSP_STD = { light: "bright", wind: "still", humidity: "normal", temp: "25", vaseline: "none" };
function transpRate(v) {
  const lf = { dark: .35, dim: .7, bright: 1.18 }[v.light], wf = { still: 1, breeze: 1.45, fan: 2.0 }[v.wind], hf = { high: .45, normal: 1, low: 1.75 }[v.humidity], tf = { 15: .62, 25: 1, 35: 1.55 }[v.temp], vf = { none: 1, upper: .88, lower: .32, both: .08 }[v.vaseline];
  return 1.9 * lf * wf * hf * tf * vf;
}
function transpChangedLabel(v) {
  const ch = Object.keys(TRANSP_STD).filter(k => v[k] !== TRANSP_STD[k]);
  if (!ch.length) return "Standard";
  return ch.map(k => `${TRANSP_OPTS[k][0].replace(/^[^ ]+ /, "")}: ${TRANSP_OPTS[k][1].find(o => o[0] === v[k])[1].replace(/^[^ ]+ /, "")}`).join(" + ");
}
function transpSim(root) {
  const st = { v: Object.assign({}, TRANSP_STD), run: false, t: 0, rows: [], fast: false, finished: false };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="transpSvg" class="simsvg"></div>
      <div class="row simbtns"><button class="btn" id="trRun">▶ Run 1 minute</button><button class="btn plain" id="trFast">⏩ Fast</button><button class="btn plain" id="trReset">↺ Reset bubble</button></div>
      <p class="small muted" style="margin:6px 0 0">A potometer measures <b>water uptake</b>. This is approximately the transpiration rate if the shoot is healthy and sealed.</p>
    </section>
    <section class="card"><h3 style="margin:0">🎛️ Change one factor at a time</h3>
      <div class="diaopts">${Object.entries(TRANSP_OPTS).map(([k, [lab, opts]]) => `<div><b class="small">${lab}</b>${segBtns("tr-" + k, opts, st.v[k])}</div>`).join("")}</div>
      <div class="transp-read" id="transpRead"></div><div id="transpWhy" class="transp-chain"></div>
    </section></div>
    <section class="card"><h3 style="margin:0">📈 My runs</h3><div id="transpGraph" class="simsvg nozoom"></div><div id="transpTable" class="transp-table"></div></section>`;
  const runBtn = root.querySelector("#trRun");
  const reset = () => { st.t = 0; st.run = false; st.finished = false; runBtn.textContent = "▶ Run 1 minute"; };
  runBtn.onclick = () => { SFX.click(); if (st.finished) reset(); st.run = !st.run; runBtn.textContent = st.run ? "⏸ Pause" : "▶ Continue"; };
  root.querySelector("#trFast").onclick = () => { SFX.tap(); st.fast = !st.fast; root.querySelector("#trFast").textContent = st.fast ? "⏩ Fast: on" : "⏩ Fast"; };
  root.querySelector("#trReset").onclick = () => { SFX.tap(); reset(); };
  Object.keys(TRANSP_OPTS).forEach(k => root.querySelectorAll(`[data-tr-${k}]`).forEach(b => b.onclick = () => { SFX.tap(); st.v[k] = b.getAttribute(`data-tr-${k}`); root.querySelectorAll(`[data-tr-${k}]`).forEach(x => x.setAttribute("aria-checked", x === b ? "true" : "false")); reset(); }));
  const tableHtml = () => !st.rows.length ? `<p class="small muted">Finish a 1-minute run to add a result.</p>` : `<div class="tscroll"><table class="tterms small"><tbody><tr><th>Set-up</th><th>Bubble distance</th><th>Rate</th></tr>${st.rows.map(r => `<tr><td>${esc(r.label)}</td><td>${r.dist.toFixed(1)} mm</td><td>${r.rate.toFixed(2)} mm/min</td></tr>`).join("")}</tbody></table></div>`;
  simProbe(() => { const rate = transpRate(st.v), dist = rate * st.t / 60; return Object.assign({}, st.v, { temp: Number(st.v.temp), rate: +rate.toFixed(2), dist: +dist.toFixed(1), t: +st.t.toFixed(1), running: st.run, finished: st.finished, runs: st.rows.length, rowLabels: st.rows.map(r => r.label) }); });
  simLoop(root, dt => {
    const rate = transpRate(st.v);
    if (st.run) {
      st.t = Math.min(60, st.t + dt * (st.fast ? 18 : 8));
      if (st.t >= 60) {
        st.run = false; st.finished = true; runBtn.textContent = "↺ Run again"; SFX.item();
        const label = transpChangedLabel(st.v), row = { label, rate, dist: rate };
        st.rows = [row].concat(st.rows.filter(r => r.label !== label)).slice(0, 7);
      }
    }
    root.querySelector("#transpSvg").innerHTML = transpSvg(st, rate);
    root.querySelector("#transpRead").innerHTML = `<span>Bubble distance<b>${(rate * st.t / 60).toFixed(1)} mm</b></span><span>Rate of uptake<b>${rate.toFixed(2)} mm/min</b></span><span>Timer<b>${st.t.toFixed(0)} / 60 s</b></span><span>Runs saved<b>${st.rows.length}</b></span>`;
    root.querySelector("#transpWhy").innerHTML = `<span class="${st.v.light === "bright" ? "on" : ""}">☀️ Light opens stomata → faster water vapour loss.</span><span class="${st.v.wind !== "still" ? "on" : ""}">💨 Wind removes moist air around the leaf.</span><span class="${st.v.humidity === "low" ? "on" : ""}">💧 Low humidity makes a steeper water-vapour gradient.</span><span class="${st.v.vaseline === "lower" || st.v.vaseline === "both" ? "on" : ""}">🧴 Lower surface has many stomata: Vaseline there greatly lowers the rate.</span>`;
    root.querySelector("#transpGraph").innerHTML = transpGraphSvg(st, rate);
    root.querySelector("#transpTable").innerHTML = tableHtml();
  });
}
function transpSvg(st, rate) {
  const dist = rate * st.t / 60, bx = 92 + Math.min(240, dist * 24), v = st.v, open = v.light === "dark" || v.vaseline === "both" ? 5 : v.vaseline === "lower" ? 8 : 18;
  const vap = Array.from({ length: 9 }, (_, i) => `<path d="M${440 + (i % 3) * 34} ${156 - Math.floor(i / 3) * 22} q${8 + i % 2 * 5} -18 ${24 + i % 2 * 7} -26" stroke="#69BFEA" stroke-width="3" fill="none" opacity="${.28 + Math.min(1, rate / 6) * .55}" stroke-linecap="round"/>`).join("");
  return `<svg viewBox="0 0 640 360" role="img" aria-label="Bubble potometer measuring water uptake by a leafy shoot">
    <defs><marker id="trArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#3E8FDF"/></marker></defs><rect width="640" height="360" rx="14" fill="#F4FBFF"/>
    <g transform="translate(42 204)"><rect x="34" y="44" width="318" height="28" rx="14" fill="#DDF1FF" stroke="#3B2F2B" stroke-width="3"/><rect x="12" y="34" width="62" height="48" rx="10" fill="#CFE8FF" stroke="#3B2F2B" stroke-width="3"/><circle cx="${bx}" cy="58" r="10" fill="#fff" stroke="#3E8FDF" stroke-width="3"/><path d="M352 58 C386 58 398 18 420 -22" stroke="#6B8E43" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M360 58 H80" stroke="#3E8FDF" stroke-width="5" marker-end="url(#trArr)" opacity=".65"/>
      ${[0, 2, 4, 6, 8, 10].map(mm => `<line x1="${92 + mm * 24}" y1="78" x2="${92 + mm * 24}" y2="92" stroke="#3B2F2B" stroke-width="2"/><text x="${92 + mm * 24}" y="108" text-anchor="middle" font-size="11" font-weight="800" fill="#7A6A66">${mm}</text>`).join("")}<text x="212" y="124" text-anchor="middle" font-size="12" font-weight="900" fill="#7A6A66">scale (mm) · bubble moves as water is taken up</text></g>
    <g transform="translate(415 46)"><path d="M44 216 C38 152 44 92 52 34" stroke="#6B8E43" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M52 38 C4 46 -4 90 48 102 C96 86 94 48 52 38Z" fill="#69BC5B" stroke="#3B2F2B" stroke-width="2.5"/><path d="M52 102 C8 112 8 156 56 162 C108 146 98 108 52 102Z" fill="#5FB35C" stroke="#3B2F2B" stroke-width="2.5"/><path d="M52 38 C48 82 50 122 56 162" stroke="#2F803B" stroke-width="3" fill="none"/>${vap}<text x="82" y="26" font-size="14" font-weight="900" fill="#3B2F2B">water vapour out</text></g>
    <g transform="translate(62 42)"><rect x="0" y="0" width="180" height="118" rx="14" fill="#fff" stroke="#E8DFD7" stroke-width="2"/><text x="90" y="20" text-anchor="middle" font-size="14" font-weight="900" fill="#3B2F2B">Leaf surface zoom</text><ellipse cx="90" cy="62" rx="52" ry="30" fill="#DDF4D4" stroke="#3B2F2B" stroke-width="2"/><ellipse cx="${90 - open / 2}" cy="62" rx="20" ry="28" fill="#80C67B" stroke="#3B2F2B" stroke-width="2"/><ellipse cx="${90 + open / 2}" cy="62" rx="20" ry="28" fill="#80C67B" stroke="#3B2F2B" stroke-width="2"/><ellipse cx="90" cy="62" rx="${open / 2}" ry="22" fill="#24322B"/><text x="90" y="106" text-anchor="middle" font-size="12" font-weight="900" fill="#3B2F2B">stomata ${open > 10 ? "open" : "partly closed/blocked"}</text></g>
    <g transform="translate(270 38)"><rect x="0" y="0" width="120" height="124" rx="14" fill="#FDF8ED" stroke="#E8DFD7" stroke-width="2"/><text x="60" y="20" text-anchor="middle" font-size="14" font-weight="900" fill="#3B2F2B">Xylem pull</text>${[0, 1, 2].map(i => `<path d="M${32 + i * 24} 106 V42" stroke="#3E8FDF" stroke-width="9" stroke-linecap="round"/><path d="M${32 + i * 24} 46 l-8 12 M${32 + i * 24} 46 l8 12" stroke="#fff" stroke-width="2"/>`).join("")}<text x="60" y="118" text-anchor="middle" font-size="11" font-weight="800" fill="#7A6A66">water column</text></g>
    <text x="608" y="334" text-anchor="end" font-size="14" font-weight="900" fill="#3B2F2B">${transpChangedLabel(v)} · ${rate.toFixed(2)} mm/min</text>
  </svg>`;
}
function transpGraphSvg(st, rate) {
  const rows = [{ label: "current", rate }].concat(st.rows), max = Math.max(2, ...rows.map(r => r.rate)) * 1.1, X = i => 42 + i * 38, H = r => r.rate / max * 116;
  return `<svg viewBox="0 0 320 170" role="img" aria-label="Bar graph of transpiration rate in student runs"><rect width="320" height="170" rx="12" fill="#fff"/><path d="M34 14 V140 H306" stroke="#3B2F2B" stroke-width="2"/><text x="14" y="92" transform="rotate(-90 14 92)" font-size="10" font-weight="800" fill="#7A6A66">rate (mm/min)</text>${rows.slice(0, 7).map((r, i) => `<rect x="${X(i)}" y="${140 - H(r)}" width="24" height="${H(r)}" rx="5" fill="${i ? "#B9A6D9" : "#3E8FDF"}"/><text x="${X(i) + 12}" y="${136 - H(r)}" text-anchor="middle" font-size="9" font-weight="900" fill="#3B2F2B">${r.rate.toFixed(1)}</text>`).join("")}<text x="170" y="162" text-anchor="middle" font-size="10" font-weight="800" fill="#7A6A66">current + saved runs</text></svg>`;
}

simReg({ id: "leafgas", ic: "🍃", name: "Leaf gas exchange", sec: "3a", ord: 30, topic: "t12", fn: leafgasSim,
  words: [["photosynthesis", "☀️", "making food using light"], ["respiration", "🔥", "releasing energy from food"], ["stomata", "👄", "tiny pores in a leaf"], ["guard cells", "🟢", "cells that open and close stomata"], ["hydrogencarbonate indicator", "🧪", "shows carbon dioxide level"], ["compensation point", "⚖️", "photosynthesis equals respiration"], ["control", "⚖️", "comparison set-up kept the same"]] });
simReg({ id: "transp", ic: "💧", name: "Transpiration (potometer)", sec: "3a", ord: 40, topic: "t12", fn: transpSim,
  words: [["transpiration", "💧", "water vapour loss from leaves"], ["potometer", "🧪", "measures water uptake by a shoot"], ["stomata", "👄", "tiny pores in a leaf"], ["xylem", "🟦", "tubes carrying water upwards"], ["humidity", "💧", "how much water vapour is in air"], ["transpiration pull", "⬆️", "water column pulled upwards"], ["fair test", "⚖️", "change one variable only"]] });

Object.assign(SIM_P, {
  leafgas: ["A leaf in hydrogencarbonate indicator is put in bright light. What colour should the indicator move towards?", ["Purple, because photosynthesis uses up CO₂", "Yellow, because photosynthesis makes extra CO₂", "Red, because respiration stops in light", "Black, because oxygen is produced"], "In bright light photosynthesis is faster than respiration, so CO₂ falls and the indicator becomes purple.", "set a leaf in bright light, press ▶ Run tube and watch the indicator."],
  transp: ["You turn on a fan beside the leafy shoot. What happens to the bubble in the potometer?", ["It moves faster, because wind removes moist air near the leaf", "It stops, because wind closes all xylem vessels", "It moves backwards, because water enters the leaf from the air", "It stays the same, because wind does not affect stomata"], "Wind keeps the water-vapour gradient steep, so transpiration and water uptake are faster.", "set Wind to Fan, press ▶ Run 1 minute and compare the rate."]
});
Object.assign(SIM_Q, {
  leafgas: [["At the compensation point of a leaf, which statement is correct?", ["The rate of photosynthesis equals the rate of respiration", "Photosynthesis has stopped completely", "Respiration has stopped completely", "The stomata are always closed"], "At this light intensity, CO₂ used in photosynthesis equals CO₂ produced in respiration, so net gas exchange is zero."],
    ["Why is a no-leaf tube useful in a hydrogencarbonate indicator experiment?", ["It is a control, showing the indicator does not change without a leaf", "It provides extra oxygen for the leaf", "It makes the indicator turn purple faster", "It blocks all light from the experiment"], "A control lets you compare. If the no-leaf tube stays red, the colour change in the leaf tube is due to the leaf."]],
  transp: [["What does a bubble potometer measure directly?", ["Water uptake by the shoot", "Mass of water vapour leaving the stomata", "Rate of photosynthesis", "Number of open stomata"], "The bubble movement shows how much water is taken up. This is approximately the transpiration rate under good conditions."],
    ["Why does low humidity increase transpiration?", ["It makes a steeper water-vapour gradient from the leaf to the air", "It fills the air spaces inside the leaf with liquid water", "It closes all stomata completely", "It stops water moving in the xylem"], "Dry air has less water vapour, so water vapour diffuses out of the leaf faster."]]
});

SIM_CH.membrane = {
  title: "Root-hair Membrane Mission", mins: 15,
  story: "Help a root hair cell absorb water and mineral ions. Prove which substances cross the membrane, and why ATP matters.",
  missions: [
    { ic: "🧱", name: "Build the membrane", tasks: [
      { type: "goal", ic: "🔎", do: "Tap <b>Hydrophilic head</b> in the parts list.", look: "🔎 Tap a part", target: "Head selected", check: p => p.part === "head", hold: .2, why: "Heads face the watery outside and cytoplasm because they are water-loving." },
      { type: "goal", ic: "🟡", do: "Tap <b>Hydrophobic tails</b> in the parts list.", look: "🔎 Tap a part", target: "Tails selected", check: p => p.part === "tail", hold: .2, why: "The fatty tails point inwards. They make an oily barrier to ions and large polar substances." },
      { type: "pick", ic: "🧩", do: "Why is this called a <b>fluid mosaic</b> model?", opts: ["Phospholipids and proteins can move sideways in a patchwork membrane", "The membrane is a hard wall made of cellulose", "Water dissolves the whole membrane", "Only one kind of molecule is present"], miss: ["", "Cellulose is in the cell wall, not the cell membrane.", "The membrane is stable; it does not dissolve in water.", "Look at the model: there are phospholipids and several proteins."], why: "Fluid = molecules move sideways. Mosaic = different proteins are scattered in the bilayer." }] },
    { ic: "↔️", name: "Diffusion and osmosis", tasks: [
      { type: "goal", ic: "🫧", do: "Send <b>🫧 O₂ / CO₂</b> across the membrane.", look: "Particle buttons under the model", target: "Small gas has crossed", check: p => (p.inside && p.inside.o2 >= 1) || (p.sent && p.sent.o2 >= 2), hold: .2, why: "Small non-polar gases cross directly through the phospholipid bilayer by diffusion." },
      { type: "goal", ic: "💧", do: "Send <b>💧 Water (osmosis)</b> across the membrane.", look: "Particle buttons", target: "Water has crossed", check: p => (p.inside && p.inside.water >= 1) || (p.sent && p.sent.water >= 2), hold: .2, why: "Osmosis is the diffusion of water across a differentially permeable membrane." },
      { type: "pick", ic: "📶", do: "In root hairs, water enters mainly because…", opts: ["the cell sap has lower water potential than the soil water", "water needs ATP to cross the membrane", "mineral ions pull water through the cell wall only", "the membrane is fully permeable to every solute"], miss: ["", "Osmosis is passive; no ATP is needed for water movement.", "The membrane controls entry; the wall is fully permeable.", "The membrane is differentially permeable, not fully permeable."], why: "Water moves by osmosis from higher water potential in the soil to lower water potential in the root hair cell." }] },
    { ic: "🔋", name: "Proteins and ATP", tasks: [
      { type: "goal", ic: "⚡", do: "Send <b>⚡ Ions (channel)</b> across the membrane.", look: "Particle buttons", target: "Ion through a channel", check: p => (p.inside && p.inside.ion >= 1) || (p.sent && p.sent.ion >= 2), hold: .2, why: "Charged ions cannot pass through the oily tails; they need a membrane protein." },
      { type: "goal", ic: "🔋", do: "Send <b>🔋 Active transport</b> until ions are inside.", look: "Carrier protein + ATP flash", target: "Active transport shown", check: p => (p.inside && p.inside.active >= 1) || (p.sent && p.sent.active >= 2), hold: .2, why: "Active transport uses ATP from respiration to move mineral ions against the concentration gradient." },
      { type: "pick", ic: "🌱", do: "Why do root hair cells need oxygen for mineral ion uptake?", opts: ["Oxygen is used in respiration to release ATP for active transport", "Oxygen dissolves mineral ions in the soil", "Oxygen changes ions into water", "Oxygen opens the cell wall pores"], miss: ["", "The ions are already dissolved in soil water.", "Ions are not changed into water.", "The cell wall is freely permeable; active transport happens at the membrane."], why: "Respiration uses oxygen to release energy. ATP powers carrier proteins for mineral ion uptake." }] },
    { ic: "🌡️", name: "Membrane damage", tasks: [
      { type: "goal", ic: "🔥", do: "Raise <b>🌡️ Temperature</b> above 50 °C.", look: "Temperature slider", target: "Membrane leaking", check: p => p.leak === true, hold: .5, meter: p => ({ v: p.temp || 0, min: 0, max: 70, lo: 51, hi: 70, unit: "°C", label: "Temperature" }), why: "High temperature denatures membrane proteins and disturbs the bilayer, so the membrane leaks." },
      { type: "fill", ic: "✍️", do: "Complete the exam sentence.", text: "Mineral ions enter root hair cells by {active transport|osmosis|simple diffusion}, using {ATP|starch|chlorophyll} from respiration.", why: "Mineral ions often move from low concentration in soil to higher concentration in the cell, so ATP is needed." },
      { type: "order", ic: "🔢", do: "Put mineral ion uptake in order.", items: ["Mitochondria release ATP by respiration", "A carrier protein binds a mineral ion", "ATP changes the carrier protein shape", "The ion is moved into the root hair cell against its gradient"], why: "Respiration supplies ATP; the carrier protein uses it to pump ions into the cell." }] }
  ]
};

SIM_CH.dialysis = {
  title: "Osmosis Fair-test Lab", mins: 15,
  story: "Use dialysis tubing as a model membrane. Run fair tests to explain water potential, rate and the level-time graph.",
  missions: [
    { ic: "▶", name: "Standard run", tasks: [
      { type: "goal", ic: "⚖️", do: "Set the <b>standard set-up</b>: 20%, short tubing, normal volumes, 25 °C.", look: "Controls under the osmosis set-up", target: "Standard variables", check: p => p.conc === 20 && p.len === "short" && p.vol === "normal" && p.water === "normal" && p.temp === 25, hold: .4, why: "A standard set-up gives a baseline for comparing one changed variable at a time." },
      { type: "goal", ic: "⏱️", do: "Press <b>▶ Start</b> and finish the 30-minute run.", look: "Timer and graph", target: "30 min finished", check: p => p.finished && p.conc === 20 && p.len === "short" && p.temp === 25, hold: .2, why: "The level rises then slows as the water potential gradient becomes smaller." },
      { type: "read", ic: "📏", do: "Read the final liquid level rise.", look: "Experimental capillary tube", need: p => p.finished && p.conc === 20 && p.len === "short" && p.temp === 25, needTxt: "Finish the standard 30-minute run.", fields: [["Final rise", p => p.level, 3, "mm"]], readTip: "Use the number beside the green arrow in the capillary.", why: "This is the dependent variable: how far the level rose after 30 minutes." }] },
    { ic: "💧", name: "Explain osmosis", tasks: [
      { type: "pick", ic: "📶", do: "Why does water enter the tubing?", opts: ["The sucrose solution has lower water potential than the distilled water", "Sucrose molecules pass out through the pores", "Water moves from low to high water potential", "The beaker volume pushes water into the tube"], miss: ["", "Watch the zoom: sucrose is too large for the pores.", "Water moves from higher to lower water potential.", "Changing beaker volume should not change the result."], why: "Water moves down a water potential gradient through the partially permeable tubing." },
      { type: "goal", ic: "🔬", do: "Watch the pore zoom until net water has moved <b>into</b> the tubing.", look: "🔎 Zoom in on the tubing wall", target: "Net water in", check: p => (p.netIn || 0) > 5, hold: .2, why: "More water molecules enter than leave. Sucrose cannot pass through the tiny pores." },
      { type: "fill", ic: "✍️", do: "Complete the key sentence.", text: "Osmosis is the net movement of {water|sucrose|ions} across a {partially permeable|fully permeable|thick paper} membrane from higher to lower {water potential|sucrose mass|temperature}.", why: "Use the phrase water potential in HKDSE osmosis answers." }] },
    { ic: "🧪", name: "Change one variable", tasks: [
      { type: "goal", ic: "🍬", do: "Change only <b>🍬 Sucrose concentration</b> to 40% and finish a run.", look: "Concentration buttons + graph", target: "40% run finished", check: p => p.conc === 40 && p.len === "short" && p.vol === "normal" && p.water === "normal" && p.temp === 25 && p.finished, hold: .2, why: "A higher sucrose concentration gives a steeper water potential gradient and a higher final level." },
      { type: "read", ic: "📏", do: "Read the 40% final level rise.", look: "Capillary and graph", need: p => p.conc === 40 && p.finished, needTxt: "Finish a 40% sucrose run.", fields: [["Final rise at 40%", p => p.level, 5, "mm"]], why: "The fair-test table should show both rate and final level are higher than the standard run." },
      { type: "goal", ic: "📏", do: "Change only <b>📏 Tubing length</b> to 30 cm and finish a run.", look: "Tubing length buttons", target: "Long tubing run finished", check: p => p.conc === 20 && p.len === "long" && p.vol === "normal" && p.water === "normal" && p.temp === 25 && p.finished, hold: .2, why: "Longer tubing gives more surface area, so the rate is faster, but the final level is the same." }] },
    { ic: "📈", name: "Use the graph", tasks: [
      { type: "pick", ic: "📈", do: "On the level-time graph, what shows the <b>rate</b> of osmosis?", opts: ["The steepness of the curve at the start", "The final flat level only", "The colour of the sucrose", "The width of the beaker"], miss: ["", "The final flat level is the total rise, not the rate.", "Colour only helps you see concentration.", "Beaker width is not the measured rate."], why: "A steeper curve means the level is rising faster each minute." },
      { type: "pick", ic: "⚖️", do: "Which change should have <b>no effect</b> in this model?", opts: ["Increasing the volume of distilled water in the beaker", "Increasing sucrose concentration", "Increasing tubing length", "Increasing temperature"], miss: ["", "Concentration changes gradient and final level.", "Length changes surface area and rate.", "Temperature changes particle kinetic energy and rate."], why: "The beaker already has distilled water. More of it does not change the water potential gradient." },
      { type: "order", ic: "🔢", do: "Put the fair-test method in order.", items: ["Choose one independent variable to change", "Keep all other variables the same", "Run for the same time", "Compare the level rise or graph steepness"], why: "Fair tests change one variable only, so differences in results have one likely cause." }] }
  ]
};

SIM_CH.leafgas = {
  title: "Leaf Gas Detective", mins: 15,
  story: "Find when a leaf releases oxygen, when it releases carbon dioxide, and how hydrogencarbonate indicator proves it.",
  missions: [
    { ic: "☀️", name: "Light and dark", tasks: [
      { type: "goal", ic: "🌑", do: "Set <b>☀️ Light intensity</b> to darkness.", look: "Light slider or 🌑 Darkness button", target: "Darkness", check: p => p.effLight === 0 && p.setup === "leaf", hold: .4, why: "In darkness photosynthesis stops, but respiration continues." },
      { type: "goal", ic: "🟡", do: "Press <b>▶ Run tube</b> until the indicator is yellow.", look: "Indicator tube", target: "Yellow = more CO₂", check: p => p.colour === "yellow" && p.setup === "leaf", hold: .3, why: "Respiration releases CO₂, so hydrogencarbonate indicator turns yellow." },
      { type: "goal", ic: "☀️", do: "Now use <b>☀️ Bright</b> light with a leaf.", look: "Light controls", target: "Bright leaf", check: p => p.light >= 70 && !p.foil && p.setup === "leaf", hold: .4, why: "Light lets chloroplasts photosynthesise." },
      { type: "goal", ic: "🟣", do: "Run until the indicator is purple.", look: "Indicator tube", target: "Purple = less CO₂", check: p => p.colour === "purple" && p.setup === "leaf" && p.light >= 70 && !p.foil, hold: .3, why: "Photosynthesis uses CO₂ faster than respiration makes it, so CO₂ falls." }] },
    { ic: "⚖️", name: "Compensation point", tasks: [
      { type: "goal", ic: "⚖️", do: "Move the light near the <b>compensation point</b>.", look: "Rates panel", target: "Net gas exchange near zero", check: p => p.setup === "leaf" && !p.foil && Math.abs(p.net) <= .35 && p.light > 0, hold: .7, meter: p => ({ v: p.net || 0, min: -4, max: 6, lo: -.35, hi: .35, unit: "", label: "Net rate" }), why: "At the compensation point, photosynthesis and respiration are equal." },
      { type: "pick", ic: "🫧", do: "At the compensation point, what is the <b>net</b> gas exchange?", opts: ["No net CO₂ or O₂ exchange", "Only oxygen leaves", "Only carbon dioxide leaves", "The leaf stops respiring"], miss: ["", "That happens above the compensation point.", "That happens in darkness or very low light.", "Plants respire all the time."], why: "Both processes continue, but their gas changes cancel out." },
      { type: "fill", ic: "✍️", do: "Complete the comparison.", text: "Above the compensation point, photosynthesis is {faster|slower|absent} than respiration, so net {oxygen|carbon dioxide|nitrogen} leaves the leaf.", why: "Bright leaves have net photosynthesis: O₂ out and CO₂ in." }] },
    { ic: "🧪", name: "Controls", tasks: [
      { type: "goal", ic: "⚖️", do: "Choose <b>⚖️ No-leaf control</b> and run for 10 s.", look: "Tube contents buttons", target: "No-leaf control running", check: p => p.setup === "noleaf" && p.run && p.t >= 10, hold: .2, why: "The control checks that the indicator does not change by itself." },
      { type: "pick", ic: "🟥", do: "What should the no-leaf control show?", opts: ["It should stay red, because no leaf changes CO₂", "It should turn purple faster than the leaf tube", "It should turn yellow because glass respires", "It proves light is not needed"], miss: ["", "Without a leaf, CO₂ is not being used up.", "Glass does not respire.", "Use the leaf tube to test light."], why: "A red no-leaf tube supports the conclusion that leaf processes caused the colour change." },
      { type: "goal", ic: "🧻", do: "Return to <b>🍃 Leaf in tube</b> and tick <b>🧻 foil</b>.", look: "Foil checkbox", target: "Leaf covered with foil", check: p => p.setup === "leaf" && p.foil && p.effLight === 0, hold: .3, why: "Foil is a dark treatment. It blocks light even if the light slider is high." },
      { type: "pick", ic: "🌑", do: "Why does foil make the leaf tube behave like darkness?", opts: ["Foil blocks light, so photosynthesis cannot use CO₂", "Foil kills the leaf instantly", "Foil adds extra CO₂ to the tube", "Foil opens stomata wider"], miss: ["", "The model tests light blocking, not killing.", "Foil is outside the tube; it does not add CO₂.", "Guard cells open in light, not because of foil."], why: "No light means no photosynthesis, but respiration still releases CO₂." }] },
    { ic: "👄", name: "Stomata", tasks: [
      { type: "goal", ic: "👄", do: "Make the stomata <b>open</b> in the leaf picture.", look: "Guard cells beside the rates", target: "Open stomata", check: p => p.open === true, hold: .4, why: "In light, guard cells become turgid and the stomatal pore opens for gas exchange." },
      { type: "order", ic: "🔢", do: "Put bright-light gas exchange in order.", items: ["Light is absorbed by chlorophyll", "Photosynthesis uses CO₂", "CO₂ diffuses in through stomata", "O₂ diffuses out of the leaf"], why: "Photosynthesis lowers CO₂ inside the leaf, maintaining diffusion in through stomata; oxygen diffuses out." },
      { type: "fill", ic: "✍️", do: "Complete the dark-treatment sentence.", text: "In darkness, photosynthesis {stops|speeds up|makes CO₂}, but respiration {continues|stops|uses light}, so CO₂ {increases|decreases|stays zero}.", why: "Plants respire day and night. Photosynthesis needs light." }] }
  ]
};

SIM_CH.transp = {
  title: "Potometer Water Detective", mins: 15,
  story: "Use the bubble potometer to measure water uptake and test the factors that change transpiration.",
  missions: [
    { ic: "▶", name: "Measure uptake", tasks: [
      { type: "goal", ic: "⚖️", do: "Set the standard potometer: bright, still air, normal humidity, 25 °C, no Vaseline.", look: "Factor buttons", target: "Standard set-up", check: p => p.light === "bright" && p.wind === "still" && p.humidity === "normal" && p.temp === 25 && p.vaseline === "none", hold: .4, why: "This is the baseline. Change one variable at a time from here." },
      { type: "goal", ic: "⏱️", do: "Press <b>▶ Run 1 minute</b> and finish the run.", look: "Bubble and timer", target: "One run finished", check: p => p.finished && p.light === "bright" && p.wind === "still" && p.humidity === "normal" && p.temp === 25, hold: .2, why: "Bubble distance in one minute gives water uptake in mm per minute." },
      { type: "read", ic: "📏", do: "Read the bubble distance for the standard run.", look: "Scale under the bubble", need: p => p.finished, needTxt: "Finish a 1-minute run.", fields: [["Bubble distance", p => p.dist, .4, "mm"], ["Rate", p => p.rate, .15, "mm/min"]], why: "Distance per minute is the water uptake rate." }] },
    { ic: "💨", name: "Environmental factors", tasks: [
      { type: "goal", ic: "💨", do: "Change only <b>💨 Wind</b> to Fan and finish a run.", look: "Wind buttons + table", target: "Fan run finished", check: p => p.light === "bright" && p.wind === "fan" && p.humidity === "normal" && p.temp === 25 && p.vaseline === "none" && p.finished, hold: .2, why: "Wind removes the moist boundary layer, so water vapour diffuses out faster." },
      { type: "read", ic: "📈", do: "Read the fan rate.", look: "Rate readout", need: p => p.wind === "fan" && p.finished, needTxt: "Finish a fan run.", fields: [["Fan rate", p => p.rate, .2, "mm/min"]], why: "The fan rate is higher than the standard rate." },
      { type: "goal", ic: "💧", do: "Change only <b>💧 Humidity</b> to Low and finish a run.", look: "Humidity buttons", target: "Low-humidity run finished", check: p => p.light === "bright" && p.wind === "still" && p.humidity === "low" && p.temp === 25 && p.vaseline === "none" && p.finished, hold: .2, why: "Low humidity steepens the water-vapour gradient from leaf to air." },
      { type: "pick", ic: "☀️", do: "Why does bright light usually increase transpiration?", opts: ["Light opens stomata for gas exchange, so more water vapour can diffuse out", "Light turns water into glucose directly", "Light blocks xylem vessels", "Light makes humidity higher around the leaf"], miss: ["", "Photosynthesis uses water, but the fast effect shown is stomatal opening.", "The xylem stays open.", "Higher humidity would lower transpiration."], why: "Open stomata allow CO₂ in for photosynthesis, but water vapour also diffuses out." }] },
    { ic: "🧴", name: "Vaseline controls", tasks: [
      { type: "goal", ic: "🧴", do: "Set <b>🧴 Vaseline</b> to Lower and finish a run.", look: "Vaseline buttons", target: "Lower surface blocked", check: p => p.vaseline === "lower" && p.light === "bright" && p.wind === "still" && p.humidity === "normal" && p.temp === 25 && p.finished, hold: .2, why: "Most stomata are on the lower surface, so blocking it greatly lowers water loss." },
      { type: "pick", ic: "🍃", do: "Why does Vaseline on the lower surface have a larger effect?", opts: ["The lower surface usually has more stomata", "The upper surface has no cuticle", "Xylem is only in the lower surface", "Vaseline makes water evaporate faster"], miss: ["", "The waxy cuticle is strongest on the upper surface.", "Xylem is in veins, not only one surface.", "Vaseline blocks pores; it does not speed evaporation."], why: "Blocking stomata lowers diffusion of water vapour from the leaf air spaces." },
      { type: "goal", ic: "⛔", do: "Set Vaseline to <b>Both</b> surfaces and watch the rate become very low.", look: "Rate readout + stomata zoom", target: "Very low rate", check: p => p.vaseline === "both" && p.rate < .35, hold: .5, meter: p => ({ v: p.rate || 0, min: 0, max: 6, lo: 0, hi: .35, unit: " mm/min", label: "Rate" }), why: "Blocking both surfaces seals most routes for water vapour to leave." }] },
    { ic: "🔢", name: "Explain the model", tasks: [
      { type: "pick", ic: "🧪", do: "What does the potometer measure directly?", opts: ["Water uptake by the shoot", "Exact water vapour lost from every stoma", "Mass of glucose made", "Oxygen uptake by roots"], miss: ["", "Transpiration is inferred from uptake; some water is used in cells.", "The potometer does not test glucose.", "Roots are not in this apparatus."], why: "A potometer measures water uptake, which is approximately transpiration rate." },
      { type: "order", ic: "⬆️", do: "Put transpiration pull in order.", items: ["Water evaporates from moist mesophyll cell walls", "Water vapour diffuses out through stomata", "Water is pulled up the xylem", "The bubble moves along the potometer scale"], why: "Water loss from the leaf pulls the continuous xylem water column upwards." },
      { type: "fill", ic: "✍️", do: "Complete the fair-test rule.", text: "To test a factor, change {one|two|all} independent variable, keep the others {constant|hidden|moving}, and compare the {rate|colour|leaf name}.", why: "Changing one variable at a time lets you link cause and effect." }] }
  ]
};
