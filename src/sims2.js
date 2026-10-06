
/* ============================================================
   5f-2. 🔬 More Simulation Lab models (original drawings; content follows the HK Biology syllabus)
   6. 💧 Osmosis with dialysis tubing: live liquid levels, a zoom on the pores, a level–time graph and a fair-test table
      (which changes affect the RATE of rise and which affect the FINAL level).
   7. 🌱 Phototropism: the classic coleoptile investigations (Darwin, Boysen-Jensen, Paal, Went).
      Predict each set-up, run it, and watch the auxin (red dots) and the bending.
   ============================================================ */
Object.assign(SIM_Q, {
  dialysis: [["In the control set-up (distilled water inside AND outside the tubing), why does the liquid level stay the same?", ["The water potential is the same on both sides, so there is no net movement of water", "Distilled water cannot pass through dialysis tubing", "The pores are blocked by water molecules", "Water only moves when sucrose moves too"], "Water molecules still cross both ways, but equally, so there is no NET movement and the level stays put."],
    ["Which change makes the liquid level rise FASTER but does not change the final level?", ["Using a longer dialysis tubing", "Using a more concentrated sucrose solution", "Using a larger volume of the same sucrose solution", "Using a larger volume of distilled water in the beaker"], "A longer tubing gives a larger surface area, so water enters faster. The final level depends on the sucrose solution (its concentration and volume), not on the surface area."]],
  tropism: [["In Darwin's investigation, a coleoptile with an opaque cap over its tip grows straight up in unilateral light. What does this show?", ["The tip detects the light", "The tip is not needed for growth", "Light stops the coleoptile growing", "The cap makes a growth chemical"], "With the tip covered it still grows, but it cannot 'see' where the light comes from, so it does not bend. The tip is the light detector."],
    ["In Went's investigation, an agar block with MORE chemical on its right half is put on a cut coleoptile in darkness. What happens?", ["The right side grows faster, so it bends to the left", "The left side grows faster, so it bends to the right", "It grows straight up", "It does not grow, because there is no light"], "More auxin → those cells elongate more. The faster-growing right side pushes the shoot over to the left. No light is needed: the chemical alone causes bending."]]
});

/* ---------------- 6. 💧 Osmosis with dialysis tubing ---------------- */
const DIA_STD = { conc: 20, len: "short", temp: 25, vol: "normal", water: "normal" };
const DIA_OPTS = {
  conc: ["🍬 Sucrose concentration", [[5, "5%"], [10, "10%"], [20, "20%"], [40, "40%"]]],
  len: ["📏 Tubing length", [["short", "15 cm"], ["long", "30 cm"]]],
  vol: ["🧴 Volume of sucrose solution", [["normal", "Normal"], ["large", "Larger"]]],
  water: ["🥛 Volume of distilled water", [["normal", "Normal"], ["large", "Larger"]]],
  temp: ["🌡️ Temperature", [[10, "10 °C"], [25, "25 °C"], [40, "40 °C"]]]
};
// Model: final level H depends on the sucrose solution (concentration × volume); the starting rate depends on the
// water potential gradient (concentration), the surface area (length) and temperature. The beaker volume changes nothing.
function diaModel(v) {
  const cf = v.conc / 20, volF = v.vol === "large" ? 1.5 : 1, sa = v.len === "long" ? 1.6 : 1, tf = { 10: .6, 25: 1, 40: 1.45 }[v.temp];
  const H = 60 * cf * volF, slope = 6 * cf * sa * tf;
  return { H, slope, r: slope / H, h: t => H * (1 - Math.exp(-(slope / H) * t)) };
}
function dialysisSim(root) {
  const st = { v: Object.assign({}, DIA_STD), t: 0, run: false, fast: false, ghosts: [], rows: [], zoom: [], cross: { in: 0, out: 0 } };
  const zoomReset = () => {
    st.zoom = []; st.cross = { in: 0, out: 0 };
    for (let i = 0; i < 46; i++) st.zoom.push({ k: "w", x: 10 + Math.random() * 140, y: 10 + Math.random() * 180 });   // beaker side: pure water
    for (let i = 0; i < 26; i++) st.zoom.push({ k: "w", x: 170 + Math.random() * 140, y: 10 + Math.random() * 180 });  // tubing side: fewer free water molecules
    const ns = Math.round(st.v.conc / 4);
    for (let i = 0; i < ns; i++) st.zoom.push({ k: "s", x: 180 + Math.random() * 120, y: 20 + Math.random() * 160 });
    st.zoom.forEach(p => { p.vx = 0; p.vy = 0; });
  };
  zoomReset();
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="diaSvg" class="simsvg"></div>
      <div class="row simbtns"><button class="btn" id="dRun">▶ Start (30 min)</button><button class="btn plain" id="dFast">⏩ Fast</button><button class="btn plain" id="dReset">↺ Reset</button></div>
      <div class="diaopts">${Object.entries(DIA_OPTS).map(([k, [lab, opts]]) => `<div><b class="small">${lab}</b>${segBtns("dv-" + k, opts.map(([v, l]) => [String(v), l]), String(st.v[k]))}</div>`).join("")}</div>
    </section>
    <section class="card"><h3 style="margin:0">🔎 Zoom in on the tubing wall</h3><div id="diaZoom" class="simsvg nozoom"></div><div id="diaCross" class="small"></div>
      <h3 style="margin:10px 0 0">📈 Liquid level vs time</h3><div id="diaGraph" class="simsvg nozoom"></div></section></div>
    <section class="card"><h3 style="margin:0">🧠 Why does the level rise?</h3>${diaStepsHtml()}</section>
    <section class="card"><h3 style="margin:0">🧪 Fair-test table</h3><p class="small muted" style="margin:4px 0">Change <b>one</b> thing, press Start, and compare with the standard set-up (20%, 15 cm, 25 °C). Which changes affect the <b>rate</b>? Which affect the <b>final level</b>?</p><div id="diaTable"></div></section>
    ${simQuiz("dialysis")}`;
  const runBtn = root.querySelector("#dRun");
  const reset = () => { st.t = 0; st.run = false; runBtn.textContent = "▶ Start (30 min)"; zoomReset(); };
  runBtn.onclick = () => { SFX.click(); if (st.t >= 30) reset(); st.run = !st.run; runBtn.textContent = st.run ? "⏸ Pause" : "▶ Continue"; };
  root.querySelector("#dFast").onclick = () => { SFX.tap(); st.fast = !st.fast; root.querySelector("#dFast").textContent = st.fast ? "⏩ Fast: on" : "⏩ Fast"; };
  root.querySelector("#dReset").onclick = () => { SFX.tap(); reset(); };
  Object.keys(DIA_OPTS).forEach(k => root.querySelectorAll(`[data-dv-${k}]`).forEach(b => b.onclick = () => {
    SFX.tap(); const raw = b.getAttribute(`data-dv-${k}`); st.v[k] = typeof DIA_STD[k] === "number" ? Number(raw) : raw;
    root.querySelectorAll(`[data-dv-${k}]`).forEach(x => x.setAttribute("aria-checked", x === b ? "true" : "false")); reset();
  }));
  const tableHtml = () => {
    if (!st.rows.length) return `<p class="small muted" style="margin:0">Finish a 30-minute run to add a row.</p>`;
    const std = diaModel(DIA_STD), arrow = (a, b) => Math.abs(a - b) < .05 * b ? `<span class="dsame">= same</span>` : a > b ? `<span class="dup">▲ higher</span>` : `<span class="ddown">▼ lower</span>`;
    return `<div class="tscroll"><table class="tterms small diatable"><tbody><tr><th>What changed</th><th>Rate of rise</th><th>Final level</th></tr>${st.rows.map(r => `<tr><td>${r.label}</td><td>${arrow(r.m.slope, std.slope)}</td><td>${arrow(r.m.H, std.H)}</td></tr>`).join("")}</tbody></table></div>`;
  };
  const changedLabel = v => { const ch = Object.keys(DIA_STD).filter(k => v[k] !== DIA_STD[k]); return ch.length ? ch.map(k => `${DIA_OPTS[k][0].split(" ").slice(1).join(" ")}: <b>${DIA_OPTS[k][1].find(o => o[0] === v[k])[1]}</b>`).join(" + ") : "<b>Standard set-up</b>"; };
  wireSimQuiz(root); wireFolds(root);
  let lastTable = "";
  simLoop(root, dt => {
    const m = diaModel(st.v), tf = { 10: .6, 25: 1, 40: 1.45 }[st.v.temp];
    if (st.run) {
      st.t = Math.min(30, st.t + dt * (st.fast ? 6 : 2));
      if (st.t >= 30) {
        st.run = false; runBtn.textContent = "↺ Run again"; SFX.item();
        st.ghosts = [{ m, label: changedLabel(st.v) }].concat(st.ghosts).slice(0, 3);
        st.rows = [{ m, label: changedLabel(st.v) }].concat(st.rows.filter(r => r.label !== changedLabel(st.v))).slice(0, 6);
      }
    }
    const h = m.h(st.t);
    root.querySelector("#diaSvg").innerHTML = diaSetupSvg(st, h);
    // zoom: random walk; water may pass the pores, sucrose bounces. Net flow follows the run.
    const moving = st.run || st.t === 0, sp = 120 * tf;
    st.zoom.forEach(p => {
      if (!moving && Math.random() < .7) return;
      p.vx = p.vx * .9 + (Math.random() - .5) * sp * dt * (p.k === "s" ? 3 : 8); p.vy = p.vy * .9 + (Math.random() - .5) * sp * dt * (p.k === "s" ? 3 : 8);
      let nx = p.x + p.vx * dt * 6, ny = clamp(p.y + p.vy * dt * 6, 6, 194);
      const crossing = (p.x < 160) !== (nx < 160), atPore = [30, 70, 110, 150, 190].some(py => Math.abs(ny - py) < 8);
      if (crossing && (p.k === "s" || !atPore)) { nx = p.x; p.vx = -p.vx; }
      // fewer FREE water molecules on the sucrose side (sucrose holds some), so fewer leave: the net flow is inwards
      else if (crossing && nx < 160 && Math.random() < .45) { nx = p.x; p.vx = -p.vx; }
      else if (crossing) { if (nx >= 160) st.cross.in++; else st.cross.out++; }
      p.x = clamp(nx, p.k === "s" ? 174 : 4, p.k === "s" ? 308 : 316); p.y = p.k === "s" ? clamp(ny, 26, 186) : ny;
    });
    root.querySelector("#diaZoom").innerHTML = diaZoomSvg(st);
    root.querySelector("#diaCross").innerHTML = `<span class="pill" style="background:#DDF1FF">💧 into tubing: <b>${st.cross.in}</b></span> <span class="pill">💧 out: <b>${st.cross.out}</b></span> ${st.cross.in + st.cross.out > 6 ? `→ <b>net movement ${st.cross.in > st.cross.out ? "INTO the tubing" : "≈ none"}</b>` : ""}`;
    root.querySelector("#diaGraph").innerHTML = diaGraphSvg(st, m);
    const tb = tableHtml(); if (tb !== lastTable) { lastTable = tb; root.querySelector("#diaTable").innerHTML = tb; }
  });
}
function diaSetupSvg(st, h) {
  const v = st.v, scale = .8, y0 = 205, tubeH = v.len === "long" ? 92 : 62, tubeW = v.vol === "large" ? 44 : 32, waterTop = v.water === "large" ? 250 : 268;
  const sucCol = { 5: "#9CC9F2", 10: "#6FAEEA", 20: "#3E8FDF", 40: "#1E66B8" }[v.conc];
  const setup = (cx, exp) => {
    const lvl = exp ? y0 - h * scale : y0, tb = 352 - 8, tt = tb - tubeH;
    return `<g>
      <rect x="${cx + 70}" y="40" width="7" height="322" rx="3" fill="#B9B2AA"/><rect x="${cx + 10}" y="345" width="120" height="14" rx="5" fill="#CFC8C0" stroke="${CO}" stroke-width="2"/>
      <rect x="${cx - 2}" y="${y0 - 70}" width="76" height="9" rx="4" fill="#9A9187"/><circle cx="${cx + 2}" cy="${y0 - 66}" r="7" fill="#8C8478" stroke="${CO}" stroke-width="1.5"/>
      <path d="M${cx - 62} 240 L${cx - 58} 356 Q${cx - 58} 362 ${cx - 52} 362 L${cx + 52} 362 Q${cx + 58} 362 ${cx + 58} 356 L${cx + 62} 240" fill="none" stroke="${CO}" stroke-width="3"/>
      <path d="M${cx - 59} ${waterTop} L${cx - 57} 356 Q${cx - 57} 360 ${cx - 52} 360 L${cx + 52} 360 Q${cx + 57} 360 ${cx + 57} 356 L${cx + 59} ${waterTop}Z" fill="#DDF1FF" opacity=".9"/>
      <rect x="${cx - tubeW / 2}" y="${tt}" width="${tubeW}" height="${tubeH}" rx="${tubeW / 2}" fill="${exp ? sucCol : "#CFE8FF"}" stroke="${CO}" stroke-width="2.5" stroke-dasharray="${exp ? "0" : "0"}"/>
      ${exp ? Array.from({ length: Math.round(v.conc / 5) }, (_, i) => `<circle cx="${cx - tubeW / 2 + 8 + (i * 13) % (tubeW - 14)}" cy="${tt + 12 + (i * 17) % (tubeH - 22)}" r="2.6" fill="#FFD27A"/>`).join("") : ""}
      <path d="M${cx - 9} ${tt + 4} l9 -10 l9 10" fill="#E6DDF0" stroke="${CO}" stroke-width="2"/>
      <rect x="${cx - 4}" y="22" width="8" height="${tt - 18}" rx="3" fill="#fff" stroke="${CO}" stroke-width="2"/>
      <rect x="${cx - 2}" y="${lvl}" width="4" height="${tt - lvl}" fill="${exp ? sucCol : "#9CC9F2"}"/>
      <line x1="${cx - 16}" y1="${y0}" x2="${cx + 16}" y2="${y0}" stroke="#E0457B" stroke-width="2" stroke-dasharray="4 3"/>
      ${exp && h > 2 ? `<path d="M${cx + 14} ${y0 - 4} V${lvl + 4}" stroke="#3FA06B" stroke-width="3" marker-end="url(#dArr)"/><text x="${cx + 20}" y="${(y0 + lvl) / 2 + 4}" font-size="15" font-weight="900" fill="#3FA06B">+${h.toFixed(0)} mm</text>` : ""}
      <text x="${cx}" y="16" text-anchor="middle" font-size="17" font-weight="900" fill="${CO}">${exp ? "Experimental" : "Control"}</text>
      <text x="${cx}" y="379" text-anchor="middle" font-size="14" font-weight="800" fill="#7A6A66">${exp ? `${v.conc}% sucrose in tubing` : "distilled water in tubing"}</text>
      ${exp ? `<g transform="translate(${cx + 34} ${tt + 6})"><rect x="0" y="0" width="6" height="34" rx="3" fill="#fff" stroke="${CO}" stroke-width="1.5"/><rect x="1.5" y="${30 - v.temp * .7}" width="3" height="${v.temp * .7}" fill="#E9573F"/><circle cx="3" cy="36" r="4.5" fill="#E9573F" stroke="${CO}" stroke-width="1.5"/></g>` : ""}
    </g>`;
  };
  return `<svg viewBox="0 0 640 384" role="img" aria-label="Osmosis set-ups with dialysis tubing; the experimental level has risen by ${h.toFixed(0)} millimetres">
    <defs><marker id="dArr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#3FA06B"/></marker></defs>
    <rect width="640" height="384" rx="14" fill="#F7FBFF"/>
    ${setup(170, true)}${setup(470, false)}
    <text x="320" y="${y0 + 4}" text-anchor="middle" font-size="13" font-weight="800" fill="#E0457B">initial level</text>
    <g font-size="14" font-weight="900" fill="${CO}"><text x="320" y="298" text-anchor="middle">beaker of</text><text x="320" y="315" text-anchor="middle">distilled water</text></g>
    <text x="320" y="44" text-anchor="middle" font-size="16" font-weight="900" fill="${CO}">⏱ ${st.t.toFixed(0)} / 30 min</text>
  </svg>`;
}
function diaZoomSvg(st) {
  let s = `<rect width="320" height="200" rx="12" fill="#EAF6FF"/><rect x="160" width="160" height="200" rx="12" fill="#DCE9FF"/>`;
  s += `<rect x="156" y="0" width="8" height="200" fill="#B9A6D9"/>${[30, 70, 110, 150, 190].map(y => `<rect x="155" y="${y - 7}" width="10" height="14" fill="#EAF6FF"/>`).join("")}`;
  st.zoom.forEach(p => { s += p.k === "s" ? `<polygon points="${[0, 1, 2, 3, 4, 5].map(i => `${(p.x + 9 * Math.cos(i * Math.PI / 3)).toFixed(1)},${(p.y + 9 * Math.sin(i * Math.PI / 3)).toFixed(1)}`).join(" ")}" fill="#FFD27A" stroke="${CO}" stroke-width="1.5"/>`
    : `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.2" fill="#3E8FDF"/>`; });
  s += `<g font-size="11" font-weight="900" fill="${CO}"><text x="8" y="16">Beaker: water</text><text x="312" y="16" text-anchor="end">Tubing: sucrose</text>
    <text x="160" y="198" text-anchor="middle" font-size="9">↑ tiny pores ↑</text></g>
    <g transform="translate(118 100)"><path d="M0 0 H70" stroke="#3FA06B" stroke-width="6" stroke-linecap="round"/><path d="M62 -10 L78 0 L62 10Z" fill="#3FA06B"/><text x="35" y="-12" text-anchor="middle" font-size="11" font-weight="900" fill="#3FA06B">net water</text></g>`;
  return `<svg viewBox="0 0 320 200" role="img" aria-label="Zoomed view: small water molecules pass through the pores, large sucrose molecules cannot">${s}</svg>`;
}
function diaGraphSvg(st, m) {
  const X = t => 34 + t / 30 * 270, Y = h => 150 - h / 190 * 135, pts = (mm, tEnd) => Array.from({ length: 31 }, (_, i) => i * tEnd / 30).map(t => `${X(t).toFixed(1)},${Y(mm.h(t)).toFixed(1)}`).join(" ");
  let s = `<rect width="320" height="176" rx="12" fill="#fff"/><path d="M34 12 V150 H306" stroke="${CO}" stroke-width="2" fill="none"/>
    <text x="170" y="170" text-anchor="middle" font-size="10" font-weight="800" fill="#7A6A66">time (min) →</text><text x="10" y="90" font-size="10" font-weight="800" fill="#7A6A66" transform="rotate(-90 10 90)">rise (mm)</text>
    ${[0, 10, 20, 30].map(t => `<text x="${X(t)}" y="162" text-anchor="middle" font-size="9" fill="#7A6A66">${t}</text>`).join("")}${[0, 60, 120, 180].map(h => `<text x="30" y="${Y(h) + 3}" text-anchor="end" font-size="9" fill="#7A6A66">${h}</text>`).join("")}`;
  st.ghosts.forEach((g, i) => { s += `<polyline points="${pts(g.m, 30)}" fill="none" stroke="#B9A6D9" stroke-width="2" stroke-dasharray="5 4" opacity="${.9 - i * .25}"/>`; });
  s += `<line x1="34" y1="${Y(0)}" x2="306" y2="${Y(0)}" stroke="#9AA7BC" stroke-width="3"/><text x="300" y="${Y(0) - 5}" text-anchor="end" font-size="9" font-weight="800" fill="#7A8FA8">control: no change</text>`;
  if (st.t > 0) s += `<polyline points="${pts(m, st.t)}" fill="none" stroke="#1E66B8" stroke-width="3.5" stroke-linecap="round"/>`;
  if (st.t >= 30) s += `<g font-size="9" font-weight="900"><text x="${X(3)}" y="${Y(m.h(3)) - 8}" fill="#E0457B">steep = fast rate</text><text x="${X(27)}" y="${Y(m.H) - 6}" text-anchor="end" fill="#3FA06B">levels off = final level</text></g>`;
  return `<svg viewBox="0 0 320 176" role="img" aria-label="Graph of liquid level rise against time">${s}</svg>`;
}
// Visual explanation: four picture steps plus the control
function diaStepsHtml() {
  const card = (n, svg, t, d) => `<div class="dstep"><span class="dnum">${n}</span><svg viewBox="0 0 120 80" aria-hidden="true">${svg}</svg><b>${t}</b><span class="small">${d}</span></div>`;
  return `<div class="dsteps">
    ${card(1, `<rect x="14" y="12" width="26" height="60" rx="6" fill="#EAF6FF" stroke="${CO}" stroke-width="2"/><rect x="14" y="16" width="26" height="56" rx="6" fill="#3E8FDF"/><rect x="80" y="12" width="26" height="60" rx="6" fill="#EAF6FF" stroke="${CO}" stroke-width="2"/><rect x="80" y="46" width="26" height="26" rx="6" fill="#3E8FDF"/><text x="27" y="10" text-anchor="middle" font-size="8" font-weight="900" fill="${CO}">water</text><text x="93" y="10" text-anchor="middle" font-size="8" font-weight="900" fill="${CO}">sucrose</text>`,
      "Different water potentials", "Distilled water: <b>HIGH</b> water potential. 20% sucrose: <b>LOWER</b>.")}
    ${card(2, `<rect x="56" y="0" width="8" height="80" fill="#B9A6D9"/><rect x="55" y="32" width="10" height="16" fill="#fff"/><circle cx="30" cy="40" r="5" fill="#3E8FDF"/><path d="M38 40 H86" stroke="#3FA06B" stroke-width="3"/><path d="M84 34 L94 40 L84 46Z" fill="#3FA06B"/><polygon points="96,62 101,53 111,53 116,62 111,71 101,71" fill="#FFD27A" stroke="${CO}" stroke-width="1.5"/><path d="M78 56 l8 8 M86 56 l-8 8" stroke="#E9573F" stroke-width="3"/>`,
      "Pores: size sorting", "Small water molecules fit through. Big sucrose molecules <b>cannot</b>.")}
    ${card(3, `<rect x="44" y="24" width="32" height="50" rx="16" fill="#3E8FDF" stroke="${CO}" stroke-width="2"/>${[[16, 30], [16, 54], [104, 30], [104, 54]].map(([x, y]) => `<path d="M${x} ${y} L${x < 60 ? 38 : 82} ${y}" stroke="#3FA06B" stroke-width="3"/><path d="M${x < 60 ? 36 : 84} ${y - 5} L${x < 60 ? 44 : 76} ${y} L${x < 60 ? 36 : 84} ${y + 5}Z" fill="#3FA06B"/>`).join("")}<rect x="57" y="2" width="6" height="24" fill="#fff" stroke="${CO}" stroke-width="1.5"/><rect x="58" y="8" width="4" height="18" fill="#3E8FDF"/>`,
      "Net water IN", "More water molecules enter than leave, so the solution's volume grows.")}
    ${card(4, `<path d="M14 70 V8 M14 70 H112" stroke="${CO}" stroke-width="2" fill="none"/><path d="M14 70 Q40 20 108 16" stroke="#1E66B8" stroke-width="3.5" fill="none"/><text x="70" y="44" font-size="8" font-weight="900" fill="#3FA06B">slows down</text>`,
      "Level rises, then slows", "Water dilutes the sucrose solution and the column of liquid pushes back, so the rise slows.")}
    ${card("C", `<rect x="44" y="24" width="32" height="50" rx="16" fill="#CFE8FF" stroke="${CO}" stroke-width="2"/><path d="M20 40 H38 M100 40 H82" stroke="#3E8FDF" stroke-width="3"/><path d="M38 52 H20 M82 52 H100" stroke="#3E8FDF" stroke-width="3"/><text x="60" y="14" text-anchor="middle" font-size="10" font-weight="900" fill="${CO}">= equal</text>`,
      "Control set-up", "Same water potential inside and out: water moves both ways equally. <b>No net movement</b>, so the level stays.")}
  </div>`;
}

/* ---------------- 7. 🌱 Phototropism: the coleoptile investigations ---------------- */
const TROP_RES = { L: ["↖", "Bends left"], R: ["↗", "Bends right"], S: ["⬆", "Grows straight"], N: ["✋", "No growth"] };
// st: items stacked on top of the cut end (tip, agar block, mica plate…); lanes: [lateral side (−1 left … +1 right), dots, stop fraction]
const TROP = {
  darwin: { who: "Charles Darwin", year: 1880, light: true, aim: "Which part of the coleoptile detects the light?", set: [
    { n: "Intact coleoptile", r: "L", st: ["tip"], lanes: [[.6, 7], [-.6, 3]] },
    { n: "Tip removed", r: "N", st: [], lanes: [] },
    { n: "Opaque cap on the tip", r: "S", st: ["tip", "cap"], lanes: [[.5, 5], [-.5, 5]] },
    { n: "Opaque collar below the tip", r: "L", st: ["tip"], collar: true, lanes: [[.6, 7], [-.6, 3]] }],
    concl: [["✂️", "<b>A vs B:</b> without the tip there is no growth, so the <b>tip is needed for growth</b>."], ["🎯", "<b>A, C and D:</b> it only bends when the <b>tip</b> can see the light, so the <b>tip detects unilateral light</b>."]] },
  boysen1: { who: "Boysen-Jensen", year: 1913, light: true, aim: "Is the signal from the tip a chemical?", set: [
    { n: "Intact coleoptile", r: "L", st: ["tip"], lanes: [[.6, 7], [-.6, 3]] },
    { n: "Agar block only (no tip)", r: "N", st: ["agar"], lanes: [] },
    { n: "Tip on an agar block", r: "L", st: ["agar", "tip"], lanes: [[.6, 7], [-.6, 3]] },
    { n: "Tip on a mica plate", r: "N", st: ["mica", "tip"], lanes: [[.6, 6, .97], [-.6, 3, .97]] }],
    concl: [["🧪", "A substance is made in the tip. It passes through <b>agar</b> but not <b>mica</b>, so it is <b>chemical</b> in nature."], ["⬇️", "The chemical travels <b>down to the lower part</b>, where the bending happens."]] },
  boysen2: { who: "Boysen-Jensen (part 2)", year: 1913, light: true, aim: "Which side does the chemical travel down?", set: [
    { n: "Mica on the LIT side", r: "L", st: ["tip"], side: -1, lanes: [[.6, 7], [-.6, 2, .9]] },
    { n: "Mica on the SHADED side", r: "S", st: ["tip"], side: 1, lanes: [[.6, 7, .9], [-.6, 3]] }],
    concl: [["🌗", "Blocking the <b>shaded</b> side stops the bending, so the chemical passes down the <b>shaded side</b>, and that side grows more. The shoot bends <b>towards the light</b>."]] },
  paal: { who: "Árpád Paál", year: 1919, light: false, aim: "How does the chemical cause bending?", set: [
    { n: "Tip put on the LEFT side of the cut end", r: "R", st: ["tipL"], lanes: [[-.6, 8]] },
    { n: "Tip put on the RIGHT side of the cut end", r: "L", st: ["tipR"], lanes: [[.6, 8]] }],
    concl: [["📈", "The side under the tip gets <b>more chemical</b> and <b>grows faster</b>, so the shoot bends away from that side. No light is needed!"]] },
  went: { who: "Frits Went", year: 1926, light: false, aim: "Does light change how the chemical is spread out?", set: [
    { n: "Agar block that held a tip, centred", r: "S", st: ["agarR"], lanes: [[.5, 5], [-.5, 5]] },
    { n: "Blocks X | Y from a tip lit from the left (Y = shaded side)", r: "L", st: ["xy"], lanes: [[.6, 8], [-.6, 3]] },
    { n: "Plain agar block (control)", r: "N", st: ["agar"], lanes: [] }],
    concl: [["💡", "Light makes the chemical spread <b>unevenly</b>: more goes to the <b>shaded side</b> (block Y)."], ["🌱", "More chemical → cells <b>elongate more</b> → that side grows faster → the shoot bends towards the light. The chemical is called <b>auxin</b>."]] }
};
const TROP_ORDER = ["darwin", "boysen1", "boysen2", "paal", "went"];
// Draw one coleoptile; returns the svg and its path points so auxin dots can ride along it.
function coleoSvg(x, base, len, bend, S, p) {
  const N = 24, pts = [[x, base]]; let a = 0;
  for (let i = 1; i <= N; i++) { const u = i / N; a = u < .45 ? 0 : bend * Math.pow((u - .45) / .55, 1.3); const [px, py] = pts[i - 1]; pts.push([px + Math.sin(a) * len / N, py - Math.cos(a) * len / N]); }
  const d = pts.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ");
  let s = `<path d="${d}" stroke="#4E8A3A" stroke-width="24" fill="none"/><path d="${d}" stroke="#BFE38A" stroke-width="19" fill="none"/>`;
  if (S.collar) { const c = pts.slice(2, 17).map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" "); s += `<path d="${c}" stroke="#4A4458" stroke-width="27" fill="none"/>`; }
  if (S.side) { const q = pts[21], q2 = pts[22], nx = -(q2[1] - q[1]), ny = q2[0] - q[0], L = Math.hypot(nx, ny) || 1, sd = S.side; s += `<path d="M${q[0]} ${q[1]} L${q[0] + sd * nx / L * 12} ${q[1] + sd * ny / L * 12}" stroke="#2F2A3A" stroke-width="4" stroke-linecap="round"/>`; }
  const top = pts[N], ang = a * 180 / Math.PI;
  let stack = "", yy = 0;
  S.st.forEach(k => {
    if (k === "agar" || k === "agarR") { stack += `<rect x="-12" y="${yy - 9}" width="24" height="9" rx="2" fill="#CFE8FF" stroke="${CO}" stroke-width="1.8"/>${k === "agarR" ? `<circle cx="-4" cy="${yy - 4.5}" r="1.8" fill="#E9443F"/><circle cx="4" cy="${yy - 4.5}" r="1.8" fill="#E9443F"/>` : ""}`; yy -= 9; }
    else if (k === "xy") { stack += `<rect x="-14" y="${yy - 10}" width="13" height="10" rx="2" fill="#CFE8FF" stroke="${CO}" stroke-width="1.6"/><rect x="1" y="${yy - 10}" width="13" height="10" rx="2" fill="#CFE8FF" stroke="${CO}" stroke-width="1.6"/><line x1="0" y1="${yy - 13}" x2="0" y2="${yy + 1}" stroke="#2F2A3A" stroke-width="2.5"/>
        <circle cx="-7" cy="${yy - 5}" r="1.8" fill="#E9443F"/>${[[4, -7], [9, -7], [6.5, -3], [11, -3]].map(([cx, cy]) => `<circle cx="${cx}" cy="${yy + cy}" r="1.8" fill="#E9443F"/>`).join("")}
        <text x="-7" y="${yy - 13}" text-anchor="middle" font-size="8" font-weight="900" fill="${CO}">X</text><text x="7" y="${yy - 13}" text-anchor="middle" font-size="8" font-weight="900" fill="${CO}">Y</text>`; yy -= 10; }
    else if (k === "mica") { stack += `<rect x="-14" y="${yy - 3}" width="28" height="3" fill="#2F2A3A"/>`; yy -= 3; }
    else if (k === "tip") { stack += `<path d="M-9.5 ${yy} A9.5 10 0 0 1 9.5 ${yy}Z" fill="#BFE38A" stroke="#4E8A3A" stroke-width="2.5"/>`; }
    else if (k === "tipL" || k === "tipR") { const o = k === "tipL" ? -5 : 5; stack += `<path d="M${o - 6} ${yy} A6 7 0 0 1 ${o + 6} ${yy}Z" fill="#BFE38A" stroke="#4E8A3A" stroke-width="2.5"/>`; }
    else if (k === "cap") { stack += `<path d="M-12 ${yy + 2} A12 13 0 0 1 12 ${yy + 2}Z" fill="#4A4458" stroke="#2F2A3A" stroke-width="2"/>`; }
  });
  s += `<g transform="translate(${top[0].toFixed(1)} ${top[1].toFixed(1)}) rotate(${ang.toFixed(1)})">${stack}</g>`;
  return { s, pts };
}
function tropismSim(root) {
  const st = { inv: "darwin", p: 0, run: false, pred: {}, done: {}, t: 0 };
  root.innerHTML = `<section class="card"><div class="tropline" role="tablist" aria-label="Investigations in time order">${TROP_ORDER.map((k, i) => `${i ? `<span class="tarrow" aria-hidden="true">→</span>` : ""}<button role="tab" data-ti="${k}"><b>${TROP[k].year}</b><span>${TROP[k].who.replace(" (part 2)", " ②")}</span></button>`).join("")}</div>
      <p class="small muted" style="margin:6px 0 0">Each scientist built on the one before. Tap one to open their experiment.</p></section>
    <div class="simgrid wide">
      <section class="card"><div id="trAim"></div><div id="trSvg" class="simsvg nozoom"></div>
        <div id="trPred" class="trpred"></div>
        <div class="row simbtns"><button class="btn" id="trRun">💡 Run the experiment</button><button class="btn plain" id="trReset">↺ Reset</button></div></section>
      <section class="card"><h3 style="margin:0">📋 What it shows</h3><div id="trConc"></div>
        ${foldHtml("lab-trwhy", { icon: "🔎", title: "Zoom in: why does it bend?", open: true, cls: "fold-flat" }, tropWhySvg())}</section></div>
    ${simQuiz("tropism")}`;
  const draw = () => {
    const I = TROP[st.inv];
    root.querySelectorAll("[data-ti]").forEach(b => b.setAttribute("aria-selected", b.dataset.ti === st.inv ? "true" : "false"));
    root.querySelector("#trAim").innerHTML = `<span class="kicker">${I.year} · ${esc(I.who)}</span><p style="margin:2px 0 6px"><b>Aim:</b> ${esc(I.aim)} ${I.light ? `<span class="pill" style="background:#FFF3B0">☀️ light from the LEFT</span>` : `<span class="pill" style="background:#E6E1F5">🌙 in darkness</span>`}</p>`;
    const shown = st.p >= 1;
    root.querySelector("#trPred").innerHTML = (shown ? "" : `<p class="trph">🤔 <b>Predict first:</b> what will each set-up do? Tap a card to guess.</p>`) + I.set.map((S, i) => {
      const pr = st.pred[st.inv + i], ok = shown && pr === S.r, R = TROP_RES[S.r];
      return `<button class="trchip ${shown ? (ok ? "right" : "wrong") : ""}" data-pr="${i}" ${shown ? "disabled" : ""} aria-label="Set-up ${"ABCD"[i]}: ${esc(S.n)}. ${shown ? `Result: ${R[1]}` : `Your prediction: ${pr ? TROP_RES[pr][1] : "none yet"}`}">
        <b class="trl">${"ABCD"[i]}</b><span class="trn">${esc(S.n)}</span>
        <span class="trp">${shown ? `${ok ? "✅" : pr ? "❌" : ""} <b>${R[0]} ${R[1]}</b>${I.light && S.r === "L" ? " (to the light)" : ""}` : pr ? `🤔 ${TROP_RES[pr][0]} ${TROP_RES[pr][1]}` : "Tap to predict"}</span></button>`;
    }).join("");
    root.querySelectorAll("[data-pr]").forEach(b => b.onclick = () => { SFX.tap(); const k = st.inv + b.dataset.pr, cyc = ["L", "S", "R", "N"], cur = st.pred[k]; st.pred[k] = cyc[(cyc.indexOf(cur) + 1) % cyc.length]; draw(); });
    root.querySelector("#trConc").innerHTML = shown ? `<div class="trconc">${I.concl.map(([ic, t]) => `<div><span aria-hidden="true">${ic}</span><span>${t}</span></div>`).join("")}</div>`
      : `<p class="small muted">Predict each set-up (tap the cards), then press <b>Run</b>. Watch the <b style="color:#E9443F">red dots</b>: they show the growth chemical (auxin).</p>`;
  };
  const runBtn = root.querySelector("#trRun");
  runBtn.onclick = () => {
    const miss = TROP[st.inv].set.filter((_, i) => !st.pred[st.inv + i]).length;
    if (miss && !st.nudged) { st.nudged = st.inv; SFX.tap(); toast(`🤔 Predict first! ${miss} set-up${miss > 1 ? "s" : ""} still need a guess. Tap the cards, or press Run again to skip.`); root.querySelector("#trPred").classList.add("nudge"); return; }
    st.nudged = null; SFX.click(); st.p = 0; st.run = true; st.t = 0; draw();
  };
  root.querySelector("#trReset").onclick = () => { SFX.tap(); st.nudged = null; st.p = 0; st.run = false; TROP[st.inv].set.forEach((_, i) => delete st.pred[st.inv + i]); draw(); };
  root.querySelectorAll("[data-ti]").forEach(b => b.onclick = () => { SFX.tap(); st.inv = b.dataset.ti; st.p = st.done[st.inv] ? 1 : 0; st.run = false; draw(); });
  wireSimQuiz(root); wireFolds(root); draw();
  simLoop(root, dt => {
    st.t += dt;
    if (st.run) { st.p = Math.min(1, st.p + dt / 4); if (st.p >= 1) { st.run = false; st.done[st.inv] = 1; SFX.item(); draw();
      const I = TROP[st.inv], right = I.set.filter((S, i) => st.pred[st.inv + i] === S.r).length; if (right === I.set.length) { toast(`🎯 All ${right} predictions right!`); confetti(80); } } }
    root.querySelector("#trSvg").innerHTML = tropSceneSvg(st);
  });
}
function tropSceneSvg(st) {
  const I = TROP[st.inv], n = I.set.length, W = Math.max(430, 110 + 108 * n), xs = I.set.map((_, i) => 90 + (W - 110) / n * (i + .5)), base = 300, p = st.p, live = st.run || p >= 1;
  let s = `<rect width="${W}" height="340" rx="14" fill="${I.light ? "#F4FBFF" : "#2E2B45"}"/><rect y="${base}" width="${W}" height="40" fill="${I.light ? "#E8D9C6" : "#3D3858"}"/>`;
  if (I.light) {
    s += `<g><circle cx="34" cy="110" r="20" fill="#FFE27A" stroke="#E0B44A" stroke-width="3"/>${[0, 1, 2].map(i => `<g opacity="${live ? .9 : .35}"><path d="M60 ${88 + i * 22} H${W - 20}" stroke="#FFD23F" stroke-width="3" stroke-dasharray="10 9" ${live ? `stroke-dashoffset="${(-st.t * 40) % 19}"` : ""}/></g>`).join("")}
      <text x="34" y="152" text-anchor="middle" font-size="18" font-weight="900" fill="#B07A10">light</text><text x="${W - 14}" y="76" text-anchor="end" font-size="17" font-weight="800" fill="#7A6A66">shaded side →</text></g>`;
  } else s += `<g><circle cx="${W - 40}" cy="44" r="16" fill="#FFF1C5"/><circle cx="${W - 32}" cy="38" r="14" fill="#2E2B45"/><text x="20" y="36" font-size="19" font-weight="900" fill="#E6E1F5">In darkness</text></g>`;
  I.set.forEach((S, i) => {
    const grows = S.r !== "N", len = 150 + (grows ? 55 * p : 0), bend = (S.r === "L" ? -1 : S.r === "R" ? 1 : 0) * .62 * p;
    const c = coleoSvg(xs[i], base, len, bend, S, p);
    s += c.s;
    if (live) S.lanes.forEach(([side, cnt, stop]) => { for (let k = 0; k < cnt; k++) {
      const f = ((st.t * .22 + k / cnt) % 1), u = Math.max(stop || 0, 1 - f * .8), idx = Math.min(24, Math.round(u * 24)), q = c.pts[idx], q2 = c.pts[Math.max(0, idx - 1)];
      const nx = -(q[1] - q2[1]), ny = q[0] - q2[0], L = Math.hypot(nx, ny) || 1, off = side * 6 + (k % 2 ? 1.5 : -1.5);
      // a plate right under the tip (stop ≥ .97) keeps the chemical up in the tip itself
      const up = stop >= .97 ? 5 + (k % 3) * 2 : 0, tx = (q[0] - q2[0]) / L, ty = (q[1] - q2[1]) / L, oo = up ? off * .5 : off;
      s += `<circle cx="${(q[0] + nx / L * oo + tx * up).toFixed(1)}" cy="${(q[1] + ny / L * oo + ty * up).toFixed(1)}" r="2.6" fill="#E9443F" opacity="${.55 + .45 * Math.sin(k + st.t * 3) ** 2}"/>`; } });
    s += `<text x="${xs[i]}" y="${base + 31}" text-anchor="middle" font-size="26" font-weight="900" fill="${I.light ? CO : "#E6E1F5"}">${"ABCD"[i]}</text>`;
    s += `<line x1="${xs[i] - 26}" y1="${base - 150}" x2="${xs[i] + 26}" y2="${base - 150}" stroke="${I.light ? "#C9B8A8" : "#6E6590"}" stroke-width="1.5" stroke-dasharray="4 4"/>`;
  });
  s += `<text x="${W - 10}" y="${base - 160}" text-anchor="end" font-size="15" font-weight="800" fill="${I.light ? "#9A8A86" : "#9C94BC"}">start height</text>`;
  if (st.run || p >= 1) s += `<text x="${W / 2}" y="26" text-anchor="middle" font-size="20" font-weight="900" fill="${I.light ? CO : "#E6E1F5"}">⏱ ${p >= 1 ? "after 2 days" : `day ${(p * 2).toFixed(1)}`}</text>`;
  return `<svg class="${I.light ? "" : "dark"}" viewBox="0 0 ${W} 340" role="img" aria-label="${esc(I.who)}'s coleoptile experiment">${s}</svg>`;
}
// Static zoom: the bending zone, light side vs shaded side cells
function tropWhySvg() {
  const col = (x, hgt, n, dots) => Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${150 - (i + 1) * hgt}" width="34" height="${hgt - 2}" rx="5" fill="#BFE38A" stroke="#4E8A3A" stroke-width="2"/>${Array.from({ length: dots }, (_, d) => `<circle cx="${x + 8 + d * 9}" cy="${150 - (i + .5) * hgt}" r="2.6" fill="#E9443F"/>`).join("")}`).join("");
  return `<svg class="trwhy" viewBox="0 0 300 200" role="img" aria-label="Cells on the shaded side are longer because they have more auxin">
    <rect width="300" height="200" rx="12" fill="#F4FBFF"/>
    <circle cx="22" cy="40" r="13" fill="#FFE27A" stroke="#E0B44A" stroke-width="2"/><path d="M38 40 H58" stroke="#FFD23F" stroke-width="3" stroke-dasharray="6 5"/>
    ${col(62, 22, 5, 1)}${col(136, 30, 4, 3)}
    <path d="M206 40 C240 40 250 90 250 150" stroke="#4E8A3A" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M206 40 C240 40 250 90 250 150" stroke="#BFE38A" stroke-width="11" fill="none" stroke-linecap="round"/>
    <g font-size="10" font-weight="900" fill="${CO}"><text x="79" y="168" text-anchor="middle">light side</text><text x="153" y="168" text-anchor="middle">shaded side</text>
      <text x="79" y="182" text-anchor="middle" font-size="9" fill="#7A6A66">less auxin</text><text x="153" y="182" text-anchor="middle" font-size="9" fill="#E9443F">more auxin</text>
      <text x="246" y="176" text-anchor="middle">bends to</text><text x="246" y="189" text-anchor="middle">the light</text></g>
    <path d="M176 96 h10" stroke="${CO}" stroke-width="2.5"/><path d="M185 91 l7 5 l-7 5z" fill="${CO}"/>
  </svg>
  <p class="small" style="margin:6px 0 0">Shaded-side cells get <b>more auxin</b>, so they <b>elongate more</b>. That side grows faster and pushes the shoot over <b>towards the light</b>.</p>`;
}
