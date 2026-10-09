/* ============================================================
   5f-b. 🍙 Lab section b: Essential life processes in animals
   Breathing (lungSim lives in sims.js) — its 🎯 challenge is below and is the REFERENCE EXAMPLE for every
   other challenge (see docs/SIM_LAB_GUIDE.md).
   ============================================================ */

/* 🎯 Breathing challenge. Probe (sims.js): volume 0–100 · pressure kPa (−0.6…0.6, relative to atmospheric) ·
   phase "in"/"out"/"rest" · mode "auto"/"manual" · exercise · breaths · pMax/pMin over the last 10 s */
SIM_CH.lung = {
  title: "Breathing Detective", mins: 15,
  story: "Your mission: prove HOW air gets into the lungs. Use the chest model and the pressure graph as your evidence.",
  missions: [
    { ic: "✋", name: "Take control", tasks: [
      { type: "goal", ic: "✋", do: "Switch the model to <b>✋ I control it</b>.", look: "Buttons under the chest model", target: "Manual mode", check: p => p.mode === "manual", hold: .2,
        why: "Now YOU move the diaphragm and ribs. Watch the labels change." },
      { type: "goal", ic: "⬇️", do: "Press <b>⬇️ Breathe in</b>. Fill the lungs to more than 75%.", look: "Chest model + green volume line", target: "Lung volume ≥ 75%",
        check: p => p.volume >= 75, meter: p => ({ v: p.volume, min: 0, max: 100, lo: 75, hi: 100, unit: "%", label: "Lung volume" }), hold: .3,
        why: "The diaphragm contracted and flattened, and the ribs moved up and out. The chest volume got bigger." },
      { type: "pick", ic: "📈", do: "While the lungs were filling, where was the <b>red pressure line</b>?", look: "📈 Pressure graph",
        opts: [["Below the dashed line: lung pressure was lower than atmospheric", "⬇️"], ["Above the dashed line: lung pressure was higher than atmospheric", "⬆️"], ["On the dashed line: no pressure change", "➖"]],
        miss: ["", "Look again: press ⬇️ Breathe in and watch which way the red line moves.", "The line moves away from the dashed line while the volume changes. Try it again and watch."],
        why: "Volume ↑ → pressure ↓ (below atmospheric). Air moves from high pressure (outside) to low pressure (lungs)." },
      { type: "goal", ic: "⬆️", do: "Now <b>⬆️ Breathe out</b>. Empty the lungs to less than 25%.", look: "Chest model", target: "Lung volume ≤ 25%",
        check: p => p.mode === "manual" && p.volume <= 25, meter: p => ({ v: p.volume, min: 0, max: 100, lo: 0, hi: 25, unit: "%", label: "Lung volume" }), hold: .3,
        why: "The muscles relaxed: the diaphragm domed up and the ribs moved down and in. Volume ↓ → pressure ↑ → air flows out." },
      { type: "goal", ic: "🎈", do: "Make the red line go <b>ABOVE</b> the dashed line (higher than atmospheric pressure).", look: "📈 Pressure graph", hint: "Fill the lungs first (⬇️), then press ⬆️ Breathe out and watch.", target: "Lung pressure above atmospheric",
        check: p => p.pressure > .12, hold: 0, why: "Breathing out squeezes the lungs: pressure rises above atmospheric, so air is pushed out." }] },
    { ic: "📈", name: "Read the graph", tasks: [
      { type: "goal", ic: "▶", do: "Switch back to <b>▶ Auto breathing</b> (no exercise). Watch the graph for 10 seconds.", look: "📈 Pressure graph", target: "Auto, at rest, for 10 s",
        check: p => p.mode === "auto" && !p.exercise, hold: 10, meter: null, why: "The red line goes up and down once for every breath. The dashed line is atmospheric pressure." },
      { type: "read", ic: "🔢", do: "Count the <b>breaths</b> on the graph: how many red-line dips (breaths in) are there in the 10 seconds shown?", look: "📈 Pressure graph",
        need: p => p.mode === "auto" && !p.exercise && p.t > 10, needTxt: "Auto breathing, no exercise.", fields: [["Breaths in 10 s (at rest)", 2.4, 1, "breaths"], ["So breaths per minute (× 6)", 14.4, 4, "/min"]],
        hint: "Count the dips BELOW the dashed line. Then multiply by 6 (60 s ÷ 10 s = 6).", why: "About 2–3 breaths in 10 s → about 12–18 breaths per minute at rest." },
      { type: "fill", ic: "✍️", do: "Use your evidence to finish the sentence.",
        text: "When the chest volume {increases|decreases|stays the same}, the pressure in the lungs {falls below|rises above} atmospheric pressure, so air flows {in|out}.",
        why: "This is the key exam sentence: volume ↑ → pressure ↓ → air in." }] },
    { ic: "🏃", name: "Exercise test", tasks: [
      { type: "goal", ic: "🏃", do: "Tick <b>🏃 Exercise</b> (with auto breathing). Watch for 10 seconds.", look: "Tick box under the chest model", target: "Exercise on, for 10 s",
        check: p => p.exercise && p.mode === "auto", hold: 10, why: "Deeper and faster breaths: the graph swings more and more often." },
      { type: "read", ic: "📏", do: "During exercise, read the graph.", look: "📈 Pressure graph · y-axis",
        need: p => p.exercise && p.mode === "auto", needTxt: "🏃 Exercise ticked, auto breathing.",
        fields: [["Highest pressure (top of the red line)", p => p.pMax, .1, "kPa"], ["Breaths in 10 s", 3.8, 1, "breaths"]],
        hint: "The top grid label is +0.6 kPa, the dashed line is 0. Count the dips below the dashed line.",
        why: "About +0.6 kPa and about 4 breaths in 10 s (≈ 23 per minute). At rest it was only about ±0.2 kPa and 2–3 breaths." },
      { type: "pick", ic: "🤔", do: "Why are the pressure swings <b>bigger</b> during exercise?", look: "Compare rest vs exercise",
        opts: ["Deeper, faster breaths change the chest volume more, and more quickly", "The air outside the body has a higher pressure during exercise", "The lungs make their own air during exercise", "The heart pushes air into the lungs"],
        miss: ["", "The dashed line (atmospheric pressure) did not move. Only the lungs changed.", "Lungs do not make air: all air comes in through the trachea.", "The heart pumps blood, not air."],
        why: "A bigger, faster volume change makes a bigger pressure difference, so more air moves in each minute (more O₂ for respiration in muscles)." },
      { type: "pick", ic: "💪", do: "Which muscles work <b>harder</b> during exercise breathing?", look: "Chest model labels",
        need: p => p.exercise && p.phase === "in", needTxt: "🏃 Exercise on: watch one breath in.",
        opts: ["Diaphragm and intercostal muscles", "Heart muscle only", "Iris muscles", "Biceps and triceps"],
        why: "The diaphragm and intercostal muscles contract more strongly, so the chest volume changes more." }] },
    { ic: "🔢", name: "Explain it", tasks: [
      { type: "order", ic: "⬇️", do: "Put the steps of <b>inhalation</b> in order.", look: "Steps list next to the graph",
        items: ["Diaphragm and external intercostal muscles contract", "Diaphragm flattens; ribs move up and out", "Volume of the chest cavity increases", "Pressure in the lungs falls below atmospheric pressure", "Air flows in through the trachea"],
        why: "Muscles → movement → volume ↑ → pressure ↓ → air in. Exhalation is the reverse." },
      { type: "pick", ic: "🕵️", do: "A classmate says: “Air rushes into the lungs, and this makes the chest get bigger.” What is wrong?",
        opts: ["It is the other way round: the chest gets bigger first, then air flows in", "Nothing is wrong", "Air never enters the lungs; only oxygen does", "The chest gets smaller when air comes in"],
        miss: ["", "Watch the manual model: the volume changes BEFORE the arrow shows air moving in.", "Air (a mixture of gases) enters; oxygen is only part of it.", "Look at the chest model: it gets bigger when air comes in."],
        why: "Cause → effect: muscles change the volume, the volume changes the pressure, and the pressure difference moves the air." },
      { type: "fill", ic: "✍️", do: "Finish the sentence about breathing out at rest.",
        text: "At rest, breathing out is mostly {passive|active}: the diaphragm muscles {relax|contract}, so the diaphragm {domes upwards|flattens}.",
        why: "Quiet exhalation needs no extra muscle work; the stretched lungs and relaxed muscles spring back." }] }
  ]
};

/* ---------------- b10. 🍙 Digestion lab ---------------- */
if (!window.SIM_B_EXTRA_STYLE) {
  window.SIM_B_EXTRA_STYLE = 1;
  simStyle(`
    .dg-panel,.ht-panel{display:grid;gap:10px}.dg-stats,.ht-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px}.dg-tile,.ht-tile{border:2px solid #E6DCD2;border-radius:14px;background:#fff;padding:9px 10px;min-width:0}.dg-tile b,.ht-tile b{display:block;font-size:1.05rem}.dg-note,.ht-note{border-radius:14px;background:#FFF7D6;padding:10px 12px;font-weight:800}.dg-bench{display:grid;gap:10px}.dg-range{display:grid;gap:4px}.dg-range input{width:100%}.dg-points{display:flex;flex-wrap:wrap;gap:6px}.dg-dotchip{border-radius:999px;background:#E6F8EC;padding:4px 8px;font-size:.8rem;font-weight:800}.dg-legend,.ht-legend{display:flex;flex-wrap:wrap;gap:8px;font-size:.82rem;font-weight:800}.dg-legend span,.ht-legend span{border-radius:999px;background:#F4EEE8;padding:4px 8px}.ht-controls{display:grid;gap:10px}.ht-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.ht-phase{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.ht-phase button{min-width:0}.ht-leak{background:#FFF0F0;border-color:#E9573F}.ht-safe{background:#E6F8EC;border-color:#3FA06B}@media(max-width:520px){.ht-phase{grid-template-columns:1fr}.dg-stats,.ht-stats{grid-template-columns:1fr 1fr}}`);
}

const DG_REGIONS = {
  mouth: { name: "Mouth", ic: "👄", ph: 7, enzymes: { starch: "salivary amylase" }, bile: false, absorb: false, note: "Chewing mixes food with saliva. Starch starts becoming maltose." },
  stomach: { name: "Stomach", ic: "🫙", ph: 2, enzymes: { protein: "protease (pepsin)" }, bile: false, absorb: false, note: "Acid gives the stomach protease its low-pH optimum." },
  duod: { name: "Duodenum", ic: "🧪", ph: 8, enzymes: { starch: "pancreatic amylase", protein: "protease", fat: "lipase" }, bile: true, absorb: true, note: "Bile neutralises acid and emulsifies fat; pancreatic enzymes act here." },
  small: { name: "Small intestine", ic: "〰️", ph: 8, enzymes: { starch: "maltase/amylase", protein: "peptidases", fat: "lipase" }, bile: true, absorb: true, note: "Villi give a large surface area for absorption into blood." },
  large: { name: "Large intestine", ic: "💧", ph: 7, enzymes: {}, bile: false, absorb: false, note: "Most digestion is finished; water is absorbed here." }
};
const DG_FOOD = {
  starch: { name: "Starch", ic: "🍚", col: "#FFD27A", opt: { mouth: 7, duod: 8, small: 8 }, product: "maltose → glucose", units: "glucose" },
  protein: { name: "Protein", ic: "🥚", col: "#B9A6D9", opt: { stomach: 2, duod: 8, small: 8 }, product: "amino acids", units: "amino acids" },
  fat: { name: "Fat", ic: "🧈", col: "#F4A6B8", opt: { duod: 8, small: 8 }, product: "fatty acids + glycerol", units: "fatty acids + glycerol" }
};
function dgTempFactor(T) {
  if (T >= 62) return Math.max(0, .22 - (T - 62) * .018);
  if (T <= 0) return 0;
  return Math.max(0, 1 - Math.pow((T - 37) / (T < 37 ? 34 : 25), 2));
}
function dgPhFactor(food, region, ph) {
  const opt = DG_FOOD[food].opt[region];
  if (opt == null) return 0;
  return Math.max(0, Math.exp(-Math.pow(ph - opt, 2) / (opt <= 3 ? 3.2 : 5.2)));
}
function dgBase(food, region) { return DG_REGIONS[region].enzymes[food] ? (region === "small" ? .88 : region === "duod" ? .82 : .72) : 0; }
function dgRate(st, useX) {
  const T = useX && useX.temp != null ? useX.temp : st.temp, ph = useX && useX.ph != null ? useX.ph : st.ph;
  let r = 100 * dgBase(st.food, st.region) * dgTempFactor(T) * dgPhFactor(st.food, st.region, ph);
  if (st.food === "fat") r *= (st.bile && DG_REGIONS[st.region].bile) ? 1.65 : .45;
  return +clamp(r, 0, 100).toFixed(1);
}
function digestSim(root) {
  const st = { food: "starch", region: "mouth", temp: 37, ph: 7, bile: true, graph: "temp", t: 0, cut: 0, absorbed: 0, pts: [] };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="dgGut" class="simsvg nozoom"></div>
      <div class="simctl"><div><b class="small">Food</b>${segBtns("dgfood", Object.entries(DG_FOOD).map(([k, f]) => [k, `${f.ic} ${f.name}`]), st.food)}</div>
      <div><b class="small">Region</b>${segBtns("dgregion", Object.entries(DG_REGIONS).map(([k, r]) => [k, `${r.ic} ${r.name}`]), st.region)}</div></div>
      <div id="dgInfo" class="dg-panel"></div></section>
    <section class="card"><h3 style="margin:0">🧪 Enzyme bench</h3><div class="dg-bench">
      <label class="dg-range small"><b>🌡️ Temperature <span id="dgTempLab">37 °C</span></b><input id="dgTemp" type="range" min="0" max="80" value="37"></label>
      <label class="dg-range small"><b>pH <span id="dgPhLab">7</span></b><input id="dgPh" type="range" min="1" max="10" step="0.1" value="7"></label>
      <label class="small chk"><input type="checkbox" id="dgBile" checked> 🟢 Add bile (emulsifies fat)</label>
      <div class="row simbtns"><button class="btn" id="dgMeasure">📍 Measure rate</button><button class="btn plain" id="dgClear">↺ Clear points</button></div>
      <div><b class="small">Graph</b>${segBtns("dggraph", [["temp", "Rate vs temperature"], ["ph", "Rate vs pH"]], st.graph)}</div>
      <div id="dgGraph" class="simsvg nozoom"></div><div id="dgPts" class="dg-points"></div></div></section></div>`;
  const setSeg = (name, key, cb) => root.querySelectorAll(`[data-${name}]`).forEach(b => b.onclick = () => { SFX.tap(); st[key] = b.dataset[name]; root.querySelectorAll(`[data-${name}]`).forEach(x => x.setAttribute("aria-checked", x === b)); cb && cb(); });
  const resetCut = () => { st.cut = 0; st.absorbed = 0; st.ph = DG_REGIONS[st.region].ph; root.querySelector("#dgPh").value = st.ph; };
  setSeg("dgfood", "food", resetCut); setSeg("dgregion", "region", resetCut); setSeg("dggraph", "graph");
  root.querySelector("#dgTemp").oninput = e => st.temp = Number(e.target.value);
  root.querySelector("#dgPh").oninput = e => st.ph = Number(e.target.value);
  root.querySelector("#dgBile").onchange = e => { st.bile = e.target.checked; SFX.tap(); };
  root.querySelector("#dgMeasure").onclick = () => { SFX.item(); st.pts.push({ food: st.food, region: st.region, graph: st.graph, x: st.graph === "temp" ? st.temp : st.ph, y: dgRate(st), bile: st.bile }); st.pts = st.pts.slice(-12); };
  root.querySelector("#dgClear").onclick = () => { SFX.tap(); st.pts = []; };
  simProbe(() => {
    const matching = st.pts.filter(p => p.food === st.food && p.region === st.region);
    return { food: st.food, region: st.region, regionPH: DG_REGIONS[st.region].ph, enzymes: DG_REGIONS[st.region].enzymes[st.food] || "none", bile: st.bile && DG_REGIONS[st.region].bile, temp: st.temp, pH: +st.ph.toFixed(1), rate: dgRate(st), cut: Math.round(st.cut), absorbed: Math.round(st.absorbed), product: DG_FOOD[st.food].product, graph: st.graph, points: st.pts.length, matchingPoints: matching.length, graphPoints: matching.filter(p => p.graph === st.graph).length, surfaceArea: st.food === "fat" && st.bile && DG_REGIONS[st.region].bile ? "high" : "normal" };
  });
  simLoop(root, dt => {
    st.t += dt;
    const r = dgRate(st); st.cut += (r - st.cut) * Math.min(1, dt * .9);
    const canAbsorb = DG_REGIONS[st.region].absorb && r > 20; st.absorbed += ((canAbsorb ? st.cut : 0) - st.absorbed) * Math.min(1, dt * .8);
    root.querySelector("#dgTempLab").textContent = `${st.temp} °C`; root.querySelector("#dgPhLab").textContent = (+st.ph).toFixed(1);
    root.querySelector("#dgGut").innerHTML = dgGutSvg(st);
    root.querySelector("#dgInfo").innerHTML = dgInfoHtml(st, r);
    root.querySelector("#dgGraph").innerHTML = dgGraphSvg(st);
    root.querySelector("#dgPts").innerHTML = st.pts.filter(p => p.graph === st.graph && p.food === st.food && p.region === st.region).map(p => `<span class="dg-dotchip">${st.graph === "temp" ? p.x + "°C" : "pH " + (+p.x).toFixed(1)}: ${p.y}</span>`).join("") || `<span class="small muted">Tap Measure to add your points.</span>`;
  });
}
function dgInfoHtml(st, r) {
  const reg = DG_REGIONS[st.region], enz = reg.enzymes[st.food] || "no matching enzyme";
  return `<div class="dg-stats"><div class="dg-tile">pH<b>${reg.ph}</b><small>${reg.name}</small></div><div class="dg-tile">Enzyme<b>${enz}</b><small>${DG_FOOD[st.food].name} → ${DG_FOOD[st.food].product}</small></div><div class="dg-tile">Rate<b>${r}/100</b><small>${st.temp} °C · pH ${(+st.ph).toFixed(1)}</small></div><div class="dg-tile">Absorb<b>${Math.round(st.absorbed)}%</b><small>through villi</small></div></div>
    <div class="dg-note">${reg.ic} ${esc(reg.note)} ${st.food === "fat" && reg.bile ? (st.bile ? " Bile is ON: many tiny fat droplets." : " Try bile: it increases surface area.") : ""}</div>
    <div class="dg-legend"><span>⬡ starch</span><span>● protein</span><span>🟡 fat</span><span>⬇ absorbed into blood</span></div>`;
}
function dgGutSvg(st) {
  const active = st.region, food = DG_FOOD[st.food], cut = st.cut / 100, abs = st.absorbed / 100;
  const R = { mouth: [78, 46], stomach: [118, 151], duod: [178, 178], small: [187, 262], large: [242, 254] };
  const node = (k, x, y, label, dx = 0, dy = 0) => `<g class="${active === k ? "on" : ""}"><circle cx="${x}" cy="${y}" r="${active === k ? 19 : 13}" fill="${active === k ? "#FFE27A" : "#fff"}" stroke="${CO}" stroke-width="2.4"/><text x="${x + dx}" y="${y + dy}" text-anchor="middle" font-size="11" font-weight="900" fill="${CO}">${label}</text></g>`;
  const lab = (x1, y1, x2, y2, t, a = "start") => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${CO}" stroke-width="1.1"/><text x="${x2 + (a === "end" ? -3 : 3)}" y="${y2 + 4}" text-anchor="${a}" font-size="10.5" font-weight="900" fill="${CO}">${t}</text>`;
  const mol = (i, small) => { const [x, y] = R[active], a = i * 1.35 + st.t * .8, rr = small ? 29 + i * 2.5 : 17 + i * 2, cx = x + Math.cos(a) * rr, cy = y + Math.sin(a * 1.2) * rr * .55; return dgMolSvg(st.food, cx, cy, small ? .48 : .78, food.col, i); };
  const smallN = Math.round(3 + cut * 10), bigN = Math.max(1, Math.round(7 - cut * 5));
  const arrows = DG_REGIONS[active].absorb ? Array.from({ length: Math.round(abs * 6) }, (_, i) => `<path d="M${142 + i * 12} 304 q18 24 44 30" stroke="#3E8FDF" stroke-width="3" fill="none" marker-end="url(#dgArr)" opacity="${.35 + abs * .65}"/>`).join("") : "";
  return `<svg viewBox="0 0 360 430" role="img" aria-label="Alimentary canal with mouth, oesophagus, stomach, liver, gall bladder, pancreas, duodenum, ileum with villi, large intestine, rectum and anus; ${DG_REGIONS[active].name} selected">
    <defs><marker id="dgArr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#3E8FDF"/></marker></defs>
    <rect width="360" height="430" rx="16" fill="#FFF8EC"/>
    <g font-family="system-ui, sans-serif">
      <text x="16" y="24" font-size="15" font-weight="900" fill="${CO}">${food.ic} ${food.name} → ${food.product}</text>
      <text x="344" y="42" text-anchor="end" font-size="12" font-weight="900" fill="${CO}">cut ${Math.round(st.cut)}% · absorb ${Math.round(st.absorbed)}%</text>
      <path d="M78 54 C76 82 90 95 103 112 C122 137 95 163 120 183" fill="none" stroke="#D98968" stroke-width="14" stroke-linecap="round"/>
      <path d="M126 123 C166 112 194 135 180 164 C165 193 118 189 104 164 C98 145 105 130 126 123Z" fill="#E79A7A" stroke="${CO}" stroke-width="2.3"/>
      <path d="M171 168 C199 165 215 177 218 198" fill="none" stroke="#F2B47E" stroke-width="13" stroke-linecap="round"/>
      <path d="M74 112 C118 85 178 92 217 116 C203 142 160 152 102 139 C78 134 67 126 74 112Z" fill="#B77A3A" stroke="${CO}" stroke-width="2.2"/>
      <ellipse cx="174" cy="145" rx="9" ry="13" fill="#3FA06B" stroke="${CO}" stroke-width="1.6"/><text x="193" y="149" font-size="10.5" font-weight="900" fill="${CO}">gall bladder</text>
      <path d="M198 169 C229 157 262 167 274 188" fill="none" stroke="#F3CF8A" stroke-width="11" stroke-linecap="round"/><text x="252" y="156" font-size="10.5" font-weight="900" fill="${CO}">pancreas</text>
      <path d="M224 164 C258 180 274 217 262 252 C252 284 218 304 179 300 C132 295 108 258 120 222 C130 190 178 184 205 205 C230 228 208 260 174 250 C146 240 148 214 174 211" fill="none" stroke="#F2B47E" stroke-width="17" stroke-linecap="round"/>
      <path d="M236 159 C310 160 330 220 312 292 C296 358 230 372 180 344" fill="none" stroke="#C79774" stroke-width="22" stroke-linecap="round"/>
      <path d="M236 159 V312 M316 206 H242 M310 290 H204" stroke="#B07F5F" stroke-width="5" stroke-linecap="round" opacity=".55"/>
      <path d="M180 344 C208 366 214 384 203 404" fill="none" stroke="#C79774" stroke-width="20" stroke-linecap="round"/><circle cx="203" cy="408" r="7" fill="#8B5E45" stroke="${CO}" stroke-width="2"/>
      ${node("mouth", 78, 46, "mouth", -42, 4)}${node("stomach", 118, 151, "stomach", -42, 0)}${node("duod", 178, 178, "duodenum", 0, 35)}${node("small", 187, 262, "ileum + villi", 0, 42)}${node("large", 242, 254, "large intestine", 58, 0)}
      ${active === "small" || active === "duod" ? `<g>${Array.from({ length: 9 }, (_, i) => `<path d="M${104 + i * 17} 306 q7 -26 15 0" fill="#F6D9A8" stroke="${CO}" stroke-width="1.2"/>`).join("")}<rect x="112" y="344" width="120" height="15" rx="8" fill="#E9573F"/><circle cx="132" cy="351" r="4" fill="#8DD7FF"/><circle cx="176" cy="351" r="4" fill="#8DD7FF"/><text x="238" y="355" font-size="11" font-weight="900" fill="${CO}">blood</text>${arrows}</g>` : ""}
      ${Array.from({ length: bigN }, (_, i) => mol(i, false)).join("")}${Array.from({ length: smallN }, (_, i) => mol(i + 10, true)).join("")}
      ${lab(80, 68, 16, 64, "oesophagus")}${lab(138, 112, 172, 72, "liver")}${lab(203, 404, 252, 408, "rectum + anus")}
    </g>
  </svg>`;
}

function dgMolSvg(food, x, y, s, col, i) {
  if (food === "starch") return `<polygon points="${[0, 1, 2, 3, 4, 5].map(k => `${(x + s * 10 * Math.cos(k * Math.PI / 3)).toFixed(1)},${(y + s * 10 * Math.sin(k * Math.PI / 3)).toFixed(1)}`).join(" ")}" fill="${col}" stroke="${CO}" stroke-width="${1.6 * s}"/>`;
  if (food === "protein") return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(9 * s).toFixed(1)}" fill="${col}" stroke="${CO}" stroke-width="${1.6 * s}"/><path d="M${x - 5 * s} ${y} h${10 * s}" stroke="#fff" stroke-width="${2 * s}"/>`;
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><ellipse rx="${12 * s}" ry="${7 * s}" fill="${col}" stroke="${CO}" stroke-width="${1.6 * s}"/><circle cx="${5 * s}" cy="${-2 * s}" r="${2.4 * s}" fill="#FFF4A8"/></g>`;
}
function dgGraphSvg(st) {
  const isT = st.graph === "temp", W = 330, H = 190, X = x => 34 + (isT ? x / 80 : (x - 1) / 9) * 274, Y = y => 152 - y / 100 * 126;
  const vals = Array.from({ length: 61 }, (_, i) => isT ? i * 80 / 60 : 1 + i * 9 / 60), curve = vals.map((x, i) => `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(dgRate(st, isT ? { temp: x } : { ph: x })).toFixed(1)}`).join(" ");
  const pts = st.pts.filter(p => p.graph === st.graph && p.food === st.food && p.region === st.region);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Rate graph with measured points"><rect width="${W}" height="${H}" rx="12" fill="#fff"/><path d="M34 20 V152 H308" stroke="${CO}" stroke-width="2.4" fill="none"/><text x="172" y="182" text-anchor="middle" font-size="12" font-weight="800" fill="#7A6A66">${isT ? "temperature (°C)" : "pH"} →</text><text x="14" y="88" transform="rotate(-90 14 88)" text-anchor="middle" font-size="12" font-weight="800" fill="#7A6A66">rate</text>${(isT ? [0, 37, 60, 80] : [1, 2, 7, 8, 10]).map(x => `<text x="${X(x)}" y="166" text-anchor="middle" font-size="11" font-weight="800" fill="#7A6A66">${x}</text>`).join("")}${[0, 50, 100].map(y => `<text x="28" y="${Y(y) + 3}" text-anchor="end" font-size="11" font-weight="800" fill="#7A6A66">${y}</text>`).join("")}<path d="${curve}" fill="none" stroke="#3FA06B" stroke-width="4" stroke-linecap="round"/><path d="M${X(isT ? 37 : (DG_FOOD[st.food].opt[st.region] || DG_REGIONS[st.region].ph))} 20 V152" stroke="#E9573F" stroke-width="2" stroke-dasharray="4 4"/><text x="302" y="28" text-anchor="end" font-size="11" font-weight="900" fill="#E9573F">optimum</text>${pts.map(p => `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="5.5" fill="#FFD27A" stroke="${CO}" stroke-width="2"><title>${p.y}</title></circle>`).join("")}</svg>`;
}

simReg({ id: "digest", ic: "🍙", name: "Digestion lab", sec: "3b", ord: 10, topic: "t8", fn: digestSim,
  words: [["digestion", "✂️", "breaking large insoluble food molecules into small soluble molecules"], ["enzyme", "🧪", "a protein that speeds up a chemical reaction"], ["amylase", "🍚", "enzyme that digests starch to maltose"], ["protease", "🥚", "enzyme that digests proteins to amino acids"], ["lipase", "🧈", "enzyme that digests fats to fatty acids and glycerol"], ["bile", "🟢", "alkaline liquid that emulsifies fat and neutralises stomach acid"], ["villi", "〰️", "finger-like folds in the small intestine for absorption"], ["denatured", "🔥", "when an enzyme's active site changes shape and no longer works"]] });

/* ---------------- b30. ❤️ Heart and cardiac cycle ---------------- */
const HT_PHASES = [
  ["atrial", "Atrial systole", "atria contract; AV valves open"],
  ["vent", "Ventricular systole", "ventricles contract; semilunar valves open"],
  ["dia", "Diastole", "heart relaxes; ventricles fill"]
];
function htCycle(rate) { return 60 / rate; }
function htFrac(t, rate) { const c = htCycle(rate); return ((t % c) + c) % c / c; }
function htPhaseOf(f) { return f < .14 ? "atrial" : f < .48 ? "vent" : "dia"; }
function htPressures(f, leaky) {
  const phase = htPhaseOf(f), wave = (a, b, x) => clamp((x - a) / (b - a), 0, 1);
  let la = 5 + 5 * Math.sin(Math.PI * wave(0, .14, f)) + 2.5 * wave(.30, .48, f), lv = 5, ao = 82 - 10 * wave(.48, 1, f);
  if (phase === "vent") { const up = wave(.14, .24, f), down = wave(.40, .48, f); lv = 5 + 118 * Math.sin(Math.PI * clamp((f - .14) / .34, 0, 1)) * (1 - .1 * down); ao = 82 + (leaky ? 25 : 38) * Math.sin(Math.PI * clamp((f - .22) / .26, 0, 1)); la += leaky ? 14 * Math.sin(Math.PI * clamp((f - .18) / .26, 0, 1)) : 0; }
  else if (phase === "atrial") lv = 5 + 8 * Math.sin(Math.PI * wave(0, .14, f));
  return { la: +la.toFixed(1), lv: +lv.toFixed(1), ao: +ao.toFixed(1), phase };
}
function heartSim(root) {
  if (typeof tourEnd === "function" && typeof tourAt !== "undefined" && tourAt >= 0) tourEnd();
  const st = { t: 0, run: true, slow: false, rate: 72, leaky: false, hist: [] };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="htSvg" class="simsvg nozoom"></div><div class="ht-controls">
      <div class="ht-row simbtns"><button class="btn" id="htPlay">⏸ Pause</button><button class="btn plain" id="htSlow">🐢 Slow</button><label class="small chk"><input type="checkbox" id="htLeak"> 💧 Leaky bicuspid valve</label></div>
      <div><b class="small">Heart rate</b>${segBtns("htrate", [["72", "Rest 72/min"], ["120", "Exercise 120/min"]], "72")}</div>
      <div class="ht-phase">${HT_PHASES.map(([k, n]) => `<button class="btn plain" data-htphase="${k}">${n}</button>`).join("")}</div></div></section>
    <section class="card"><h3 style="margin:0">📈 Pressure–time graph</h3><div id="htGraph" class="simsvg nozoom"></div><div id="htInfo" class="ht-panel"></div></section></div>`;
  root.querySelector("#htPlay").onclick = () => { SFX.tap(); st.run = !st.run; root.querySelector("#htPlay").textContent = st.run ? "⏸ Pause" : "▶ Play"; };
  root.querySelector("#htSlow").onclick = () => { SFX.tap(); st.slow = !st.slow; root.querySelector("#htSlow").textContent = st.slow ? "🐢 Slow: on" : "🐢 Slow"; };
  root.querySelector("#htLeak").onchange = e => { SFX.tap(); st.leaky = e.target.checked; };
  root.querySelectorAll("[data-htrate]").forEach(b => b.onclick = () => { SFX.tap(); st.rate = Number(b.dataset.htrate); root.querySelectorAll("[data-htrate]").forEach(x => x.setAttribute("aria-checked", x === b)); });
  const phaseStart = { atrial: .03, vent: .24, dia: .64 };
  root.querySelectorAll("[data-htphase]").forEach(b => b.onclick = () => { SFX.tap(); st.run = false; root.querySelector("#htPlay").textContent = "▶ Play"; st.t = Math.floor(st.t / htCycle(st.rate)) * htCycle(st.rate) + phaseStart[b.dataset.htphase] * htCycle(st.rate); });
  simProbe(() => { const f = htFrac(st.t, st.rate), p = htPressures(f, st.leaky), av = p.phase !== "vent", semi = p.phase === "vent" && p.lv > p.ao; const sv = st.leaky ? 48 : 70; return { phase: p.phase, phaseName: HT_PHASES.find(x => x[0] === p.phase)[1], avOpen: av, semilunarOpen: semi, bicuspid: av ? "open" : st.leaky ? "leaky" : "closed", tricuspid: av ? "open" : "closed", semilunar: semi ? "open" : "closed", la: p.la, lv: p.lv, aorta: p.ao, rate: st.rate, cycle: +htCycle(st.rate).toFixed(2), strokeVolume: sv, cardiacOutput: +(sv * st.rate / 1000).toFixed(1), leaky: st.leaky, running: st.run, slow: st.slow } });
  simLoop(root, dt => {
    if (st.run) st.t += dt * (st.slow ? .25 : 1);
    const f = htFrac(st.t, st.rate), p = htPressures(f, st.leaky);
    st.hist.push({ t: st.t, f, p }); st.hist = st.hist.filter(x => st.t - x.t < htCycle(st.rate) * 1.4);
    root.querySelector("#htSvg").innerHTML = htSvg(st, p);
    root.querySelector("#htGraph").innerHTML = htGraphSvg(st);
    root.querySelector("#htInfo").innerHTML = htInfoHtml(st, p);
  });
}
function htInfoHtml(st, p) {
  const av = p.phase !== "vent", semi = p.phase === "vent" && p.lv > p.ao, sv = st.leaky ? 48 : 70;
  return `<div class="ht-stats"><div class="ht-tile">Phase<b>${HT_PHASES.find(x => x[0] === p.phase)[1]}</b><small>${HT_PHASES.find(x => x[0] === p.phase)[2]}</small></div><div class="ht-tile ${av ? "ht-safe" : ""}">AV valves<b>${av ? "open" : st.leaky ? "leaky" : "closed"}</b><small>bicuspid + tricuspid</small></div><div class="ht-tile ${semi ? "ht-safe" : ""}">Semilunar<b>${semi ? "open" : "closed"}</b><small>aortic + pulmonary</small></div><div class="ht-tile">Cycle time<b>${htCycle(st.rate).toFixed(2)} s</b><small>60 ÷ ${st.rate}</small></div><div class="ht-tile">Stroke vol.<b>${sv} mL</b><small>cardiac output ${(sv * st.rate / 1000).toFixed(1)} L/min</small></div><div class="ht-tile ${st.leaky ? "ht-leak" : ""}">Fault<b>${st.leaky ? "back leak" : "none"}</b><small>${st.leaky ? "less blood reaches aorta" : "one-way valves"}</small></div></div>
    <div class="ht-note">Pressures: LA ${p.la} mmHg · LV ${p.lv} mmHg · aorta ${p.ao} mmHg. ${st.leaky ? "During ventricular systole some red blood leaks back into the left atrium." : "Valves open when pressure behind them is higher."}</div>
    <div class="ht-legend"><span>🔵 deoxygenated right heart</span><span>🔴 oxygenated left heart</span><span>▲ valve open</span><span>× valve closed</span></div>`;
}
function htSvg(st, p) {
  const av = p.phase !== "vent", semi = p.phase === "vent" && p.lv > p.ao, f = htFrac(st.t, st.rate);
  const beat = 1 + (st.run ? .018 * Math.sin(f * Math.PI * 2) : 0);
  const valve = (x, y, open, col, flip) => open
    ? `<path d="M${x - 13} ${y} q${flip ? -6 : 6} -16 ${x} ${y - 21} M${x + 13} ${y} q${flip ? 6 : -6} -16 ${x} ${y - 21}" stroke="${col}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : `<path d="M${x - 13} ${y - 18} L${x + 13} ${y} M${x + 13} ${y - 18} L${x - 13} ${y}" stroke="#6A4A3C" stroke-width="4" stroke-linecap="round"/>`;
  const semiValve = (x, y, open, col) => open
    ? `<path d="M${x - 15} ${y} q15 -18 30 0" stroke="${col}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : `<path d="M${x - 14} ${y - 4} q14 12 28 0 M${x - 10} ${y - 10} q10 9 20 0" stroke="#6A4A3C" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  const arrow = (d, col, leak) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${leak ? 4 : 6}" stroke-linecap="round" marker-end="url(#htArr${col === "#C0392B" ? "R" : "B"})" opacity="${leak ? .65 : .9}"/>`;
  const chords = (x, y, col) => `<path d="M${x - 12} ${y} L${x - 34} ${y + 62} M${x + 12} ${y} L${x + 30} ${y + 62}" stroke="${col}" stroke-width="1.6" opacity=".75"/>`;
  return `<svg viewBox="0 0 360 520" role="img" aria-label="Front view section of the heart with four chambers, valves, septum and main blood vessels">
    <defs><marker id="htArrR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#C0392B"/></marker><marker id="htArrB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#1E66B8"/></marker>
      <linearGradient id="htBlue" x1="0" x2="1"><stop offset="0" stop-color="#CFE8FF"/><stop offset="1" stop-color="#5B8FE0"/></linearGradient><linearGradient id="htRed" x1="0" x2="1"><stop offset="0" stop-color="#FFD6D6"/><stop offset="1" stop-color="#E9573F"/></linearGradient></defs>
    <rect width="360" height="520" rx="18" fill="#F8FBFF"/>
    <text x="180" y="22" text-anchor="middle" font-size="13" font-weight="900" fill="${CO}">Front view: body's left is on picture right</text>
    <g transform="translate(180 266) scale(${beat}) translate(-180 -266)">
      <path d="M88 86 C42 130 42 246 70 344 C93 421 150 470 180 484 C214 466 272 416 294 336 C322 238 314 130 272 86 C238 48 202 68 180 112 C158 68 122 48 88 86Z" fill="#FFE5E5" stroke="${CO}" stroke-width="3"/>
      <path d="M178 98 C163 142 164 222 175 484" stroke="#7B3F3F" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M85 104 C55 146 60 206 112 210 C155 212 164 151 135 113 C120 93 101 88 85 104Z" fill="url(#htBlue)" stroke="${CO}" stroke-width="2.5"/>
      <path d="M74 226 C50 286 73 382 144 434 C171 384 168 286 136 236 C116 214 92 211 74 226Z" fill="#6EA5E8" stroke="${CO}" stroke-width="2.5"/>
      <path d="M226 112 C196 151 205 212 248 210 C300 206 305 146 275 104 C259 88 240 93 226 112Z" fill="url(#htRed)" stroke="${CO}" stroke-width="2.5"/>
      <path d="M224 236 C191 292 187 394 216 456 C289 409 316 287 286 226 C266 211 242 214 224 236Z" fill="#E9573F" stroke="${CO}" stroke-width="5"/>
      <path d="M222 252 C199 304 198 385 220 432" stroke="#B83232" stroke-width="5" opacity=".7" fill="none"/>
      <path d="M55 82 V168 M43 98 H75 M292 104 H326 M305 80 V168" stroke="#1E66B8" stroke-width="13" stroke-linecap="round" fill="none"/>
      <path d="M105 58 C130 18 164 30 180 72 C196 30 230 18 256 58" stroke="#C0392B" stroke-width="18" stroke-linecap="round" fill="none"/>
      <path d="M132 62 C104 20 80 38 70 86" stroke="#1E66B8" stroke-width="16" stroke-linecap="round" fill="none"/>
      ${valve(116, 222, av, "#1E66B8", false)}${chords(116, 222, "#1E66B8")}
      ${valve(248, 222, av && !st.leaky, "#C0392B", true)}${chords(248, 222, "#C0392B")}
      ${semiValve(132, 84, semi, "#1E66B8")}${semiValve(232, 84, semi, "#C0392B")}
      ${arrow("M34 90 C58 116 70 134 88 150", "#1E66B8")}${arrow("M116 206 C110 230 108 257 115 294", "#1E66B8")}${semi ? arrow("M128 300 C160 220 154 118 134 78", "#1E66B8") : ""}
      ${arrow("M326 118 C300 132 284 148 268 162", "#C0392B")}${arrow("M248 206 C254 234 252 260 244 294", "#C0392B")}${semi ? arrow("M238 300 C204 218 218 112 252 62", "#C0392B") : ""}${st.leaky && p.phase === "vent" ? arrow("M244 292 C238 260 244 228 262 190", "#C0392B", true) : ""}
    </g>
    <g font-size="11" font-weight="900" fill="${CO}">
      <text x="21" y="188">Right atrium</text><text x="22" y="420">Right ventricle</text><text x="266" y="188">Left atrium</text><text x="250" y="438">Left ventricle</text>
      <text x="180" y="502" text-anchor="middle">Thick left ventricle wall · septum separates sides</text>
      <text x="38" y="56" fill="#1E66B8">vena cava</text><text x="82" y="42" fill="#1E66B8">pulmonary artery</text><text x="228" y="42" fill="#C0392B">aorta</text><text x="258" y="88" fill="#C0392B">pulmonary veins</text>
      <text x="82" y="247" fill="#1E66B8">tricuspid</text><text x="232" y="247" fill="#C0392B">bicuspid</text>
    </g>
    <text x="180" y="480" text-anchor="middle" font-size="13" font-weight="950" fill="${p.phase === "vent" ? "#E9573F" : p.phase === "atrial" ? "#5B8FE0" : "#3FA06B"}">${HT_PHASES.find(x => x[0] === p.phase)[1]} · AV ${av ? "open" : st.leaky ? "leaky" : "closed"} · semilunar ${semi ? "open" : "closed"}</text>
  </svg>`;
}
function htGraphSvg(st) {
  const c = htCycle(st.rate), start = st.t - c, X = t => 38 + (t - start) / c * 270, Y = p => 154 - p / 130 * 128, path = key => st.hist.filter(h => h.t >= start).map((h, i) => `${i ? "L" : "M"}${X(h.t).toFixed(1)} ${Y(h.p[key]).toFixed(1)}`).join(" ");
  const curX = X(st.t), labels = [["la", "#8E44AD", "left atrium"], ["lv", "#E9573F", "left ventricle"], ["ao", "#C0392B", "aorta"]];
  return `<svg viewBox="0 0 330 190" role="img" aria-label="Pressure time graph for left atrium, left ventricle and aorta"><rect width="330" height="190" rx="12" fill="#fff"/><path d="M38 20 V154 H308" stroke="${CO}" stroke-width="2.3" fill="none"/>${[0, 40, 80, 120].map(y => `<text x="32" y="${Y(y) + 3}" text-anchor="end" font-size="12" fill="#7A6A66">${y}</text><path d="M38 ${Y(y)} H308" stroke="#EAE2DA"/>`).join("")}<text x="174" y="181" text-anchor="middle" font-size="12" font-weight="800" fill="#7A6A66">one cardiac cycle (${c.toFixed(2)} s)</text><text x="18" y="92" transform="rotate(-90 18 92)" text-anchor="middle" font-size="12" font-weight="800" fill="#7A6A66">pressure / mmHg</text>${labels.map(([k, col]) => `<path d="${path(k)}" fill="none" stroke="${col}" stroke-width="3"/>`).join("")}<path d="M${curX} 18 V156" stroke="#222" stroke-width="2" stroke-dasharray="4 3"/><g font-size="12" font-weight="900">${labels.map(([k, col, lab], i) => `<text x="306" y="${26 + i * 14}" text-anchor="end" fill="${col}">${lab}</text>`).join("")}</g></svg>`;
}

simReg({ id: "heart", ic: "❤️", name: "Heart & cardiac cycle", sec: "3b", ord: 30, topic: "t14", fn: heartSim,
  words: [["atrium", "⬆️", "upper heart chamber that receives blood"], ["ventricle", "⬇️", "lower heart chamber that pumps blood out"], ["bicuspid valve", "🚪", "left AV valve between left atrium and left ventricle"], ["tricuspid valve", "🚪", "right AV valve between right atrium and right ventricle"], ["semilunar valve", "▲", "valve at the start of the aorta or pulmonary artery"], ["systole", "💥", "contraction phase"], ["diastole", "🛌", "relaxation phase"], ["cardiac output", "📦", "volume of blood pumped by one ventricle per minute"]] });

Object.assign(SIM_P, {
  digest: ["A fat-rich meal enters the duodenum. What will bile do to the lipase reaction?", ["Increase the rate by emulsifying fat into tiny droplets", "Stop lipase because bile is an enzyme poison", "Digest fat all by itself into amino acids", "Make the stomach more acidic"], "Bile is not an enzyme, but it emulsifies fat into many tiny droplets, giving lipase a larger surface area. It is alkaline too.", "choose Fat + Duodenum, switch bile on/off and measure the rate."],
  heart: ["During ventricular systole, which valves should be open?", ["Semilunar valves open; AV valves closed", "AV valves open; semilunar valves closed", "All valves open", "All valves closed for the whole phase"], "Ventricular pressure rises above artery pressure, opening the semilunar valves. AV valves close to stop backflow into the atria.", "step to Ventricular systole and watch the valve symbols."]
});
Object.assign(SIM_Q, {
  digest: [["Why can glucose be absorbed through villi, but starch cannot?", ["Glucose is small and soluble; starch is a large insoluble molecule", "Glucose has bile attached to it", "Starch is absorbed only in the large intestine", "Starch is already an amino acid"], "Digestion changes large insoluble molecules into small soluble ones, which can cross the wall of the small intestine and enter blood."],
    ["Why does a high fever reduce enzyme activity?", ["High temperature denatures enzymes, changing the active site shape", "High temperature changes glucose into starch", "High temperature makes bile acidic", "High temperature removes all water from the gut"], "Above the optimum, enzyme bonds break, the active site changes shape, and substrate no longer fits well."]],
  heart: [["Why do AV valves close at the start of ventricular systole?", ["Ventricular pressure becomes higher than atrial pressure", "Atrial pressure becomes higher than ventricular pressure", "The aorta has no blood in it", "The heart rate falls to zero"], "Valves respond to pressure differences: high ventricular pressure pushes the AV valves shut and prevents backflow."],
    ["A student at rest has a heart rate of 75 beats per minute. What is one cardiac cycle time?", ["0.8 s", "1.25 s", "60 s", "75 s"], "Cycle time = 60 ÷ heart rate = 60 ÷ 75 = 0.8 s."]]
});

SIM_CH.digest = { title: "Digestion Lab Detective", mins: 15, story: "Track one meal from large food molecules to small soluble units that can enter the blood.", missions: [
  { ic: "🍚", name: "Start digestion", tasks: [
    { type: "goal", ic: "🍚", do: "Choose <b>starch</b> and the <b>mouth</b> region.", look: "Food + region buttons", target: "Starch in mouth", check: p => p.food === "starch" && p.region === "mouth", hold: .2, why: "Salivary amylase starts starch digestion in the mouth." },
    { type: "goal", ic: "🧪", do: "Set the bench near body conditions: <b>37 °C</b> and <b>pH 7</b>. Wait for the cut meter to rise.", look: "Enzyme bench + gut picture", target: "Rate ≥ 55", check: p => p.food === "starch" && p.region === "mouth" && p.temp >= 34 && p.temp <= 40 && p.pH >= 6.4 && p.pH <= 7.6 && p.rate >= 55, meter: p => ({ v: p.rate, min: 0, max: 100, lo: 55, hi: 100, unit: "/100", label: "Rate" }), why: "An enzyme works fastest near its optimum temperature and pH." },
    { type: "pick", ic: "✂️", do: "What is starch digestion making here?", look: "Molecules in the mouth", opts: ["Maltose, then glucose", "Amino acids", "Fatty acids and glycerol", "Water only"], why: "Amylase digests starch to maltose; maltase later makes glucose." }] },
  { ic: "🟢", name: "Test bile", tasks: [
    { type: "goal", ic: "🧈", do: "Choose <b>fat</b> in the <b>duodenum</b> and turn <b>bile ON</b>.", look: "Region + bile checkbox", target: "Fat + duodenum + bile", check: p => p.food === "fat" && p.region === "duod" && p.bile, hold: .2, why: "Bile enters the duodenum and emulsifies fat." },
    { type: "goal", ic: "📍", do: "Measure at least one point for fat digestion with bile.", look: "Graph points", target: "1 measured point", check: p => p.food === "fat" && p.region === "duod" && p.bile && p.matchingPoints >= 1, hold: .2, why: "Measured points let you compare conditions instead of guessing." },
    { type: "pick", ic: "🔎", do: "Why does bile increase the rate of fat digestion?", opts: ["It emulsifies fat, increasing surface area for lipase", "It is the enzyme that digests fat", "It changes fat into starch", "It closes the villi"], miss: ["", "Bile is not an enzyme; lipase is the enzyme.", "Fat is digested to fatty acids and glycerol, not starch.", "Villi absorb products; bile does not close them."], why: "Many tiny droplets expose more surface area, so lipase molecules collide with fat more often." }] },
  { ic: "〰️", name: "Absorb it", tasks: [
    { type: "goal", ic: "〰️", do: "Move to the <b>small intestine</b> with a good rate and watch products enter the blood.", look: "Villi arrows", target: "Absorption ≥ 50%", check: p => p.region === "small" && p.rate >= 45 && p.absorbed >= 50, meter: p => ({ v: p.absorbed, min: 0, max: 100, lo: 50, hi: 100, unit: "%", label: "Absorbed" }), hold: .5, why: "The small intestine has many villi, so small soluble products enter the blood quickly." },
    { type: "fill", ic: "✍️", do: "Finish the exam sentence.", text: "Digestion changes {large insoluble|small insoluble|large soluble} food molecules into {small soluble|large insoluble} molecules so they can be {absorbed|excreted} through villi.", why: "This is the core nutrition sentence for absorption." },
    { type: "order", ic: "🔢", do: "Put the digestion pathway in order.", items: ["Food is chewed and mixed with enzymes", "Enzymes break large molecules into small soluble units", "Small units move through villi", "They enter the blood", "Blood carries them to body cells"], why: "Digestion prepares molecules for absorption; transport then delivers them to cells." }] },
  { ic: "🔥", name: "Enzyme conditions", tasks: [
    { type: "goal", ic: "🔥", do: "Raise the temperature above <b>65 °C</b> and make the rate very low.", look: "Rate graph", target: "High temperature, low rate", check: p => p.temp >= 65 && p.rate <= 25, meter: p => ({ v: p.rate, min: 0, max: 100, lo: 0, hi: 25, unit: "/100", label: "Rate" }), why: "High temperature denatures enzymes: the active site changes shape." },
    { type: "goal", ic: "📈", do: "Switch to the <b>rate vs pH</b> graph and measure a point.", look: "Graph selector", target: "pH graph with a point", check: p => p.graph === "ph" && p.graphPoints >= 1, hold: .2, why: "Different enzymes have different optimum pH values." },
    { type: "pick", ic: "🧪", do: "Which region has the lowest pH for enzyme action?", opts: ["Stomach", "Mouth", "Small intestine", "Large intestine"], why: "The stomach is strongly acidic, about pH 2, which suits stomach protease." }] }
] };

SIM_CH.heart = { title: "Cardiac Cycle Detective", mins: 15, story: "Use valves, arrows and pressure traces to prove how one heartbeat keeps blood moving one way.", missions: [
  { ic: "▶", name: "One beat", tasks: [
    { type: "goal", ic: "🐢", do: "Turn on <b>🐢 Slow</b> and watch one beat at <b>rest</b>.", look: "Play + Slow + heart-rate controls", target: "Slow motion, rest, playing", check: p => p.running && p.slow && p.rate === 72, hold: 2, why: "At 72 beats per minute, each cardiac cycle takes about 0.83 s." },
    { type: "read", ic: "🔢", do: "Read the cardiac cycle time at rest.", look: "Cycle time tile", need: p => p.rate === 72, needTxt: "Rest 72/min selected.", fields: [["Cycle time", p => p.cycle, .05, "s"]], why: "Cycle time = 60 ÷ heart rate." },
    { type: "pick", ic: "🧭", do: "On the diagram, where is the <b>left ventricle</b>?", opts: ["On the right side of the picture, because labels use the body's view", "On the left side of the picture, because it is my left", "At the top of the right heart", "Outside the heart in the aorta"], why: "In a front view the body's left appears on your right. The left ventricle pumps oxygenated blood to the body." }] },
  { ic: "🚪", name: "Valve timing", tasks: [
    { type: "goal", ic: "⬆️", do: "Step to <b>atrial systole</b>.", look: "Phase buttons", target: "Atrial systole", check: p => p.phase === "atrial", hold: .2, why: "Atria contract and top up the ventricles." },
    { type: "pick", ic: "🚪", do: "During atrial systole, which valves are open?", opts: ["AV valves open; semilunar valves closed", "Semilunar valves open; AV valves closed", "All valves closed", "Only the aortic semilunar valve is open"], why: "Blood moves from atria to ventricles through AV valves." },
    { type: "goal", ic: "💥", do: "Step to <b>ventricular systole</b> and watch the semilunar valves.", look: "Valve symbols + graph", target: "Ventricular systole", check: p => p.phase === "vent" && !p.avOpen, hold: .2, why: "High ventricular pressure closes AV valves and opens semilunar valves when it exceeds artery pressure." }] },
  { ic: "📈", name: "Pressure proof", tasks: [
    { type: "read", ic: "📏", do: "During ventricular systole, read the left ventricle and aorta pressures.", look: "Pressure–time graph", need: p => p.phase === "vent" && !p.running, needTxt: "Step to ventricular systole (the heart pauses there).", fields: [["Left ventricle pressure", p => p.lv, 25, "mmHg"], ["Aorta pressure", p => p.aorta, 20, "mmHg"]], readTip: "The exact number changes as the cursor moves; values around 80–120 mmHg are expected.", why: "The ventricle must build high pressure to push blood into the aorta." },
    { type: "goal", ic: "🏃", do: "Switch to <b>exercise</b> heart rate.", look: "Heart-rate buttons", target: "120 beats/min", check: p => p.rate === 120, hold: .2, why: "Exercise increases heart rate, so cycle time becomes shorter." },
    { type: "read", ic: "📦", do: "Read the cardiac output during exercise.", look: "Stroke volume tile", need: p => p.rate === 120 && !p.leaky, needTxt: "Exercise selected, no leaky valve.", fields: [["Cardiac output", p => p.cardiacOutput, .3, "L/min"]], why: "Cardiac output = stroke volume × heart rate. Here 70 mL × 120/min = 8.4 L/min." }] },
  { ic: "💧", name: "Fault test", tasks: [
    { type: "goal", ic: "💧", do: "Turn on the <b>leaky bicuspid valve</b> fault.", look: "Fault checkbox", target: "Leaky valve on", check: p => p.leaky, hold: .2, why: "A faulty valve lets some blood flow backwards." },
    { type: "goal", ic: "↩️", do: "Step to <b>ventricular systole</b> and find the red backflow arrow.", look: "Left atrium + leaky arrow", target: "Leak during ventricular systole", check: p => p.leaky && p.phase === "vent", hold: .2, why: "When the ventricle contracts, the leaky bicuspid valve lets blood return to the left atrium." },
    { type: "pick", ic: "🩺", do: "What happens to stroke volume with this leak?", opts: ["It falls, so less blood reaches the aorta each beat", "It becomes infinite", "It only affects the right atrium", "It makes the semilunar valve disappear"], why: "Some blood goes backwards, so the useful forward stroke volume is smaller." },
    { type: "fill", ic: "✍️", do: "Complete the pressure rule.", text: "A valve opens when pressure {behind it is higher|in front is always higher}; it closes to prevent {backflow|diffusion}.", why: "Heart valves are pressure-operated one-way doors." }] }
] };
