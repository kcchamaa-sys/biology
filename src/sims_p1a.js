/* ============================================================
   Part I(a,b). 🧪🔬 Cells and molecules of life simulations.
   Cause→effect ideas:
   - Food tests: reagent + condition (heat / hydrolysis / solvent) → diagnostic colour or emulsion.
   - Biomolecule building: condensation joins monomers and releases water; hydrolysis reverses it.
   - Cell explorer: microscope resolution and specimen type decide which structures can be seen.
   ============================================================ */

if (!window.SIM_P1A_STYLE) {
  window.SIM_P1A_STYLE = 1;
  simStyle(`
    .ft-read,.mb-read,.cv-read{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:8px;margin-top:8px}
    .ft-read span,.mb-read span,.cv-read span{display:block;border:2px solid #E6DCD2;border-radius:14px;background:#fff;padding:8px;min-width:0;font-size:.88rem}.ft-read b,.mb-read b,.cv-read b{display:block;font-size:1.12rem;color:#3B2F2B}.ft-note,.mb-note,.cv-note{border:2px dashed #D7C6B8;border-radius:14px;background:#FFF8E8;padding:9px 10px;font-weight:800}.ft-controls,.mb-controls,.cv-controls{display:grid;gap:10px}.ft-chart{display:grid;gap:5px}.ft-col{display:grid;grid-template-columns:76px 1fr;gap:7px;align-items:center}.ft-swatch{height:20px;border:2px solid rgba(0,0,0,.14);border-radius:999px}.ft-scroll{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}.ft-scroll table{width:max-content;min-width:720px}.ft-table th,.ft-table td{padding:5px 6px;text-align:left;vertical-align:top}.ft-table button{border:2px solid #E6DCD2;border-radius:10px;background:#fff;padding:4px 6px;font-size:.78rem;font-weight:800}.ft-table button.on{background:#E6F8EC;border-color:#3FA06B}.ft-rrows{display:grid;gap:8px}.ft-rrow{border:2px solid #E6DCD2;border-radius:14px;background:#fff;padding:8px;min-width:0}.ft-rgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(92px,1fr));gap:5px;margin-top:5px}.ft-rgrid span{border:1px solid #EAE1D8;border-radius:9px;padding:4px 5px;background:#FFFDF8;min-width:0}.ft-rgrid small{display:block;color:#7A6A66;font-weight:900}.ft-rguess{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px}.ft-rguess button{border:2px solid #E6DCD2;border-radius:10px;background:#fff;padding:4px 6px;font-size:.78rem;font-weight:800}.ft-rguess button.on{background:#E6F8EC;border-color:#3FA06B}.ft-mini{display:flex;flex-wrap:wrap;gap:6px}.ft-mini span,.mb-chip,.cv-chip{display:inline-flex;align-items:center;gap:5px;border:2px solid #E6DCD2;border-radius:999px;background:#fff;padding:5px 8px;font-size:.8rem;font-weight:900}.mb-flow{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:8px}.mb-step{border:2px solid #E6DCD2;border-radius:14px;background:#fff;padding:8px;text-align:center;font-weight:900}.mb-step.on{background:#E6F8EC;border-color:#3FA06B}.mb-func{display:grid;grid-template-columns:repeat(auto-fit,minmax(138px,1fr));gap:8px}.mb-func div,.cv-func{border:2px solid #E6DCD2;border-radius:14px;background:#fff;padding:9px}.cv-compare{overflow:visible}.cv-compgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(138px,1fr));gap:8px}.cv-compcard{border:2px solid #E6DCD2;border-radius:14px;background:#fff;padding:8px;min-width:0}.cv-compcard b{display:block;margin-bottom:4px}.cv-compcard span{display:block;border-top:1px solid #EFE6DA;padding:4px 0;font-size:.84rem}.cv-orglist{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:6px}.cv-orglist button{min-height:44px;border:2px solid #E6DCD2;border-radius:12px;background:#fff;font-weight:900;color:var(--ink);padding:6px 8px}.cv-orglist button[aria-pressed=true]{background:#EAF6FF;border-color:#3E8FDF}.cv-hot{cursor:pointer}.cv-hot:hover,.cv-hot.sel{filter:drop-shadow(0 0 5px rgba(30,102,184,.6))}.cv-calc{display:grid;gap:8px}.cv-calc label{display:grid;gap:3px;font-weight:900}.cv-calc input{width:100%}@media(max-width:520px){.ft-read,.mb-read,.cv-read{grid-template-columns:1fr 1fr}.cv-compgrid{grid-template-columns:1fr}}
  `);
}

/* ---------------- 1. 🧪 Food tests ---------------- */
const FT_TESTS = {
  ben: { name: "Benedict's", short: "Benedict", unit: "reducing sugar", needHeat: true },
  benhyd: { name: "Benedict after HCl", short: "hydrolysed sucrose", needHeat: true },
  iod: { name: "Iodine", short: "starch" },
  biu: { name: "Biuret", short: "protein" },
  eth: { name: "Ethanol emulsion", short: "lipid" },
  grease: { name: "Grease spot", short: "lipid" },
  dcpip: { name: "DCPIP", short: "vitamin C" }
};
const FT_SAMPLES = {
  water: { name: "Distilled water", label: "control", known: true, red: 0, starch: 0, protein: 0, lipid: 0, vitc: 0 },
  glucose: { name: "Glucose solution", label: "0.8% glucose", known: true, red: 4, starch: 0, protein: 0, lipid: 0, vitc: 0 },
  sucrose: { name: "Sucrose solution", label: "non-reducing", known: true, red: 0, sucrose: 4, starch: 0, protein: 0, lipid: 0, vitc: 0 },
  starch: { name: "Starch suspension", label: "amylose", known: true, red: 0, starch: 3, protein: 0, lipid: 0, vitc: 0 },
  albumen: { name: "Egg white", label: "albumen", known: true, red: 0, starch: 0, protein: 4, lipid: 0, vitc: 0 },
  oil: { name: "Cooking oil", label: "triglyceride", known: true, red: 0, starch: 0, protein: 0, lipid: 4, vitc: 0 },
  milk: { name: "Milk", label: "mixture", known: true, red: 2, starch: 0, protein: 2, lipid: 2, vitc: 0 },
  orange: { name: "Orange juice", label: "fruit", known: true, red: 1, starch: 0, protein: 0, lipid: 0, vitc: 4 },
  x: { name: "Unknown X", label: "hidden", red: 4, starch: 0, protein: 0, lipid: 0, vitc: 0, secret: "glucose solution" },
  y: { name: "Unknown Y", label: "hidden", red: 0, sucrose: 4, starch: 0, protein: 0, lipid: 0, vitc: 0, secret: "sucrose solution" },
  z: { name: "Unknown Z", label: "hidden", red: 2, starch: 0, protein: 2, lipid: 2, vitc: 0, secret: "milk" }
};
const FT_BEN_COL = ["#2D83D4", "#58B36C", "#F2D34F", "#EA8A38", "#B9472E"];
const FT_BEN_LAB = ["blue", "green", "yellow", "orange", "brick-red ppt."];
function ftResult(sampleId, testId, progress) {
  const s = FT_SAMPLES[sampleId], done = progress >= .98;
  let rank = 0, positive = false, text = "negative", col = "#2D83D4";
  if (testId === "ben" || testId === "benhyd") {
    rank = testId === "benhyd" ? Math.max(s.red || 0, s.sucrose || 0) : (s.red || 0);
    const i = Math.round(rank * progress); col = FT_BEN_COL[i] || FT_BEN_COL[0]; text = done ? FT_BEN_LAB[rank] : FT_BEN_LAB[i]; positive = rank > 0 && done;
  } else if (testId === "iod") { positive = !!s.starch; col = positive && done ? "#151432" : "#C7832E"; text = positive && done ? "blue-black" : "yellow-brown"; rank = s.starch || 0; }
  else if (testId === "biu") { positive = !!s.protein; col = positive && done ? "#8D53C7" : "#3E8FDF"; text = positive && done ? "violet / purple" : "blue"; rank = s.protein || 0; }
  else if (testId === "eth") { positive = !!s.lipid; col = positive && done ? "#F5F5F2" : "#DDF1FF"; text = positive && done ? "cloudy white emulsion" : "clear"; rank = s.lipid || 0; }
  else if (testId === "grease") { positive = !!s.lipid; col = positive && done ? "#F6E9B9" : "#F7F2E8"; text = positive && done ? "translucent grease spot" : "opaque paper"; rank = s.lipid || 0; }
  else if (testId === "dcpip") { positive = !!s.vitc; col = positive && done ? "#F7FBFF" : "#2D83D4"; text = positive && done ? "decolourised" : "blue"; rank = s.vitc || 0; }
  return { rank, positive, text, col };
}
function foodtestSim(root) {
  const st = { sample: "glucose", test: "ben", t: 0, run: false, fast: false, records: {}, guess: { x: "", y: "", z: "" } };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="ftBench" class="simsvg nozoom"></div><div class="row simbtns"><button class="btn" id="ftRun">▶ Heat / wait</button><button class="btn plain" id="ftFast">⏩ Fast</button><button class="btn yellow" id="ftRecord">✓ Record result</button><button class="btn plain" id="ftReset">↺ Reset tube</button></div><div id="ftRead" class="ft-read"></div></section>
    <section class="card"><h3 style="margin:0">🎛️ Choose sample + test</h3><div class="ft-controls"><div><b class="small">Sample</b>${segBtns("ft-sample", Object.entries(FT_SAMPLES).map(([k, s]) => [k, `${s.name}${s.known ? "" : " (?)"}`]), st.sample)}</div><div><b class="small">Test</b>${segBtns("ft-test", Object.entries(FT_TESTS).map(([k, t]) => [k, t.name]), st.test)}</div><div class="ft-note" id="ftWhy"></div></div></section></div>
    <section class="card"><h3 style="margin:0">📊 Benedict colour chart</h3><div class="ft-chart">${FT_BEN_LAB.map((l, i) => `<div class="ft-col"><b>${i === 0 ? "0" : "+".repeat(i)}</b><i class="ft-swatch" style="background:${FT_BEN_COL[i]}"></i><span>${l}</span></div>`).join("")}</div><p class="small muted">More reducing sugar gives a hotter colour after heating in a boiling water bath.</p></section>
    <section class="card"><h3 style="margin:0">📝 Results table</h3><div id="ftTable"></div><div class="ft-mini" style="margin-top:8px"><span>Unknown X = glucose</span><span>Unknown Y = sucrose</span><span>Unknown Z = milk mixture</span></div></section>`;
  const maxT = () => FT_TESTS[st.test].needHeat ? 6 : 2.2;
  const reset = () => { st.t = 0; st.run = false; root.querySelector("#ftRun").textContent = FT_TESTS[st.test].needHeat ? "▶ Heat / wait" : "▶ Add reagent"; };
  root.querySelectorAll("[data-ft-sample]").forEach(b => b.onclick = () => { SFX.tap(); st.sample = b.getAttribute("data-ft-sample"); root.querySelectorAll("[data-ft-sample]").forEach(x => x.setAttribute("aria-checked", x === b)); reset(); draw(); });
  root.querySelectorAll("[data-ft-test]").forEach(b => b.onclick = () => { SFX.tap(); st.test = b.getAttribute("data-ft-test"); root.querySelectorAll("[data-ft-test]").forEach(x => x.setAttribute("aria-checked", x === b)); reset(); draw(); });
  root.querySelector("#ftRun").onclick = () => { SFX.click(); st.run = !st.run; root.querySelector("#ftRun").textContent = st.run ? "⏸ Pause" : "▶ Continue"; };
  root.querySelector("#ftFast").onclick = () => { SFX.tap(); st.fast = !st.fast; root.querySelector("#ftFast").textContent = st.fast ? "⏩ Fast: on" : "⏩ Fast"; };
  root.querySelector("#ftReset").onclick = () => { SFX.tap(); reset(); draw(); };
  root.querySelector("#ftRecord").onclick = () => { SFX.item(); st.t = maxT(); const r = ftResult(st.sample, st.test, 1); st.records[st.sample + ":" + st.test] = r.text; draw(); };
  root.querySelector("#ftTable").onclick = e => { const b = e.target.closest("[data-ft-guess]"); if (!b) return; SFX.tap(); const [u, val] = b.dataset.ftGuess.split(":"); st.guess[u] = val; draw(); };
  simProbe(() => { const prog = clamp(st.t / maxT(), 0, 1), r = ftResult(st.sample, st.test, prog); return { sample: st.sample, test: st.test, progress: +prog.toFixed(2), result: r.text, positive: r.positive, rank: r.rank, heated: st.t >= maxT() && FT_TESTS[st.test].needHeat, temp: FT_TESTS[st.test].needHeat ? Math.round(25 + 75 * prog) : 25, records: Object.keys(st.records).length, xGuess: st.guess.x, yGuess: st.guess.y, zGuess: st.guess.z, benX: st.records["x:ben"] || "", hydY: st.records["y:benhyd"] || "", biuZ: st.records["z:biu"] || "", ethZ: st.records["z:eth"] || "" }; });
  const draw = () => {
    const prog = clamp(st.t / maxT(), 0, 1), r = ftResult(st.sample, st.test, prog), s = FT_SAMPLES[st.sample], test = FT_TESTS[st.test];
    root.querySelector("#ftBench").innerHTML = ftBenchSvg(st, r, prog);
    root.querySelector("#ftRead").innerHTML = `<span>Sample<b>${esc(s.name)}</b><small>${esc(s.label)}</small></span><span>Test<b>${esc(test.name)}</b><small>${test.needHeat ? "boiling water bath" : "room temperature"}</small></span><span>Tube colour<b>${esc(r.text)}</b></span><span>Time / heat<b>${test.needHeat ? Math.round(25 + 75 * prog) + " °C" : Math.round(prog * 100) + "%"}</b></span>`;
    root.querySelector("#ftWhy").innerHTML = ftWhy(st, r);
    root.querySelector("#ftTable").innerHTML = ftTableHtml(st);
  };
  simLoop(root, dt => { if (st.run) { st.t = Math.min(maxT(), st.t + dt * (st.fast ? 2.7 : .9)); if (st.t >= maxT()) { st.run = false; root.querySelector("#ftRun").textContent = "↺ Run again"; } } draw(); });
}
function ftWhy(st, r) {
  const base = { ben: "Benedict's reagent must be heated: reducing sugars reduce Cu²⁺ to coloured copper(I) oxide precipitate.", benhyd: "Dilute HCl hydrolyses sucrose to reducing sugars. Sodium hydrogencarbonate neutralises the acid before Benedict's test.", iod: "Iodine fits inside the starch helix, giving a blue-black complex.", biu: "Biuret reagent detects peptide bonds in proteins, changing blue to violet.", eth: "Lipids dissolve in ethanol, then form tiny droplets when water is added: a cloudy emulsion.", grease: "Lipids soak into paper and make a translucent spot that does not dry away.", dcpip: "Vitamin C reduces DCPIP, so the blue colour disappears." }[st.test];
  return `${base} <b>${r.positive ? "Positive" : "Negative"}</b>: ${esc(r.text)}.`;
}
function ftBenchSvg(st, r, prog) {
  const heat = FT_TESTS[st.test].needHeat, steam = heat ? Array.from({ length: 8 }, (_, i) => `<path d="M${322 + i * 22} ${188 - (i % 2) * 8} q-12 -18 5 -34" stroke="#BBD9E8" stroke-width="3" fill="none" opacity="${.2 + .5 * prog}"/>`).join("") : "";
  const ppt = (st.test === "ben" || st.test === "benhyd") && r.rank > 0 && prog > .65 ? `<ellipse cx="205" cy="258" rx="46" ry="8" fill="#9F3825" opacity="${prog}"/>` : "";
  const paper = st.test === "grease" ? `<g transform="translate(392 86)"><rect x="0" y="0" width="150" height="92" rx="8" fill="#F7F2E8" stroke="${CO}" stroke-width="3"/><ellipse cx="76" cy="48" rx="38" ry="24" fill="${r.col}" opacity="${r.positive ? .75 : .25}"/><text x="75" y="112" text-anchor="middle" font-size="13" font-weight="900" fill="${CO}">grease-spot paper</text></g>` : "";
  const emul = st.test === "eth" && r.positive && prog > .8 ? Array.from({ length: 26 }, (_, i) => `<circle cx="${177 + (i * 13) % 55}" cy="${176 + (i * 19) % 72}" r="${2 + i % 3}" fill="#fff" opacity=".85"/>`).join("") : "";
  return `<svg viewBox="0 0 640 330" role="img" aria-label="Food test bench showing a test tube, reagent dropper and water bath">
    <defs><linearGradient id="ftGlass" x1="0" x2="1"><stop stop-color="#fff" stop-opacity=".75"/><stop offset=".45" stop-color="#DFF4FF" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity=".55"/></linearGradient></defs><rect width="640" height="330" rx="18" fill="#F7FBFF"/>
    <rect x="42" y="282" width="556" height="24" rx="9" fill="#D6C7B8" stroke="${CO}" stroke-width="2"/><text x="52" y="28" font-size="21" font-weight="900" fill="${CO}">${esc(FT_SAMPLES[st.sample].name)} + ${esc(FT_TESTS[st.test].name)}</text>
    ${heat ? `<g><rect x="304" y="198" width="236" height="84" rx="16" fill="#DDF1FF" stroke="${CO}" stroke-width="3"/><rect x="315" y="218" width="214" height="50" rx="10" fill="#B9E4FF" opacity=".7"/><text x="422" y="248" text-anchor="middle" font-size="18" font-weight="900" fill="${CO}">${Math.round(25 + 75 * prog)} °C water bath</text>${steam}</g>` : `<g><rect x="322" y="220" width="190" height="44" rx="14" fill="#EFE6DA" stroke="${CO}" stroke-width="3"/><text x="417" y="248" text-anchor="middle" font-size="16" font-weight="900" fill="${CO}">room temperature</text></g>`}
    <g transform="translate(90 48)"><rect x="0" y="0" width="70" height="232" rx="28" fill="url(#ftGlass)" stroke="${CO}" stroke-width="3"/><rect x="8" y="118" width="54" height="102" rx="23" fill="${r.col}" stroke="rgba(0,0,0,.12)" stroke-width="2"/>${emul}${ppt}<path d="M10 18 h50" stroke="#fff" stroke-width="5" opacity=".6"/></g>
    <g transform="translate(168 62) rotate(-18)"><rect x="0" y="0" width="32" height="112" rx="13" fill="#fff" stroke="${CO}" stroke-width="3"/><path d="M16 112 v48" stroke="${CO}" stroke-width="6" stroke-linecap="round"/><circle cx="16" cy="170" r="7" fill="#6FAEEA"/><rect x="6" y="12" width="20" height="70" rx="8" fill="#A8D7FF"/></g>
    <g transform="translate(230 60)"><rect x="0" y="0" width="70" height="142" rx="9" fill="#fff" stroke="${CO}" stroke-width="3"/><text x="35" y="64" text-anchor="middle" font-size="21" font-weight="900" fill="${CO}">${st.sample.toUpperCase()}</text></g>${paper}
  </svg>`;
}
function ftTableHtml(st) {
  const rows = ["water", "glucose", "sucrose", "starch", "albumen", "oil", "milk", "orange", "x", "y", "z"], tests = ["ben", "benhyd", "iod", "biu", "eth", "grease", "dcpip"];
  const cell = (s, t) => st.records[s + ":" + t] ? esc(st.records[s + ":" + t]) : "—";
  const guessBtns = u => ["glucose", "sucrose", "milk"].map(g => `<button data-ft-guess="${u}:${g}" class="${st.guess[u] === g ? "on" : ""}">${g}</button>`).join(" ");
  return `<div class="ft-rrows">${rows.map(s => `<div class="ft-rrow"><b>${FT_SAMPLES[s].name}</b><div class="ft-rgrid">${tests.map(t => `<span><small>${FT_TESTS[t].short}</small>${cell(s, t)}</span>`).join("")}</div>${FT_SAMPLES[s].known ? "" : `<div class="ft-rguess"><small>Guess:</small> ${guessBtns(s)}</div>`}</div>`).join("")}</div>`;
}

simReg({ id: "foodtest", ic: "🧪", name: "Food tests", sec: "1a", ord: 10, topic: "t1", fn: foodtestSim,
  words: [["Benedict's", "🧪", "test for reducing sugar"], ["iodine", "🟤", "test for starch"], ["Biuret", "🟣", "test for protein"], ["emulsion", "⚪", "cloudy droplets show lipid"], ["hydrolysis", "💧", "split by adding water"], ["control", "⚖️", "comparison with known result"], ["DCPIP", "🔵", "blue dye for vitamin C"]] });
SIM_P.foodtest = ["Sucrose solution gives a negative Benedict's test first. What happens after boiling with dilute acid, neutralising, then heating with Benedict's?", ["It becomes positive because sucrose is hydrolysed to reducing sugars", "It stays blue because sucrose is never a carbohydrate", "It turns blue-black because acid makes starch", "It gives a grease spot because sucrose is a lipid"], "Hydrolysis splits sucrose into reducing sugars, so Benedict's can become brick-red after heating.", "choose Sucrose and Benedict after HCl, then heat." ];
SIM_Q.foodtest = [["Why is heating needed in Benedict's test?", ["The reduction of copper(II) ions needs heat to happen fast enough", "Heat turns all sugars into starch", "Heat makes proteins violet", "Heat evaporates the sample so the colour is hidden"], "Benedict's is a chemical reduction. A boiling water bath supplies energy and keeps heating safe."], ["Which is the correct negative control for food tests?", ["Distilled water plus the same reagents", "A second unknown sample", "Only reagent, with no tube", "A hot test tube with no reagent"], "A control is treated the same way but should not contain the food substance."]];
SIM_CH.foodtest = { title: "Food Test Detective", mins: 15, story: "Use colour changes to identify the three unknown samples.", missions: [
  { ic: "🧪", name: "Controls", tasks: [
    { type: "goal", ic: "⚖️", do: "Choose <b>Distilled water</b> and run <b>Benedict's</b>.", look: "🧪 Test tube", target: "Negative Benedict control", check: p => p.sample === "water" && p.test === "ben" && p.heated && !p.positive, why: "The control stays blue, so any coloured precipitate in another tube is due to reducing sugar." },
    { type: "goal", ic: "🍬", do: "Heat <b>Glucose solution</b> with <b>Benedict's</b> to a brick-red result.", look: "Colour chart", target: "Benedict rank 4", check: p => p.sample === "glucose" && p.test === "ben" && p.rank >= 4 && p.heated, meter: p => ({ v: p.rank, min: 0, max: 4, lo: 4, hi: 4, unit: "/4", label: "Benedict rank" }), why: "Glucose is a reducing sugar. More reducing sugar gives a stronger colour." },
    { type: "pick", ic: "🔥", do: "Why use a boiling <b>water bath</b>, not a flame?", opts: ["It heats evenly and safely while Benedict's reaction happens", "It adds water to make sugar", "It makes iodine blue-black", "It stops any colour change"], why: "The tube is heated safely to about 100 °C without direct flame." }] },
  { ic: "🔎", name: "Find molecules", tasks: [
    { type: "goal", ic: "🟤", do: "Show a <b>blue-black</b> iodine result for starch.", look: "Test tube", target: "Iodine positive", check: p => p.sample === "starch" && p.test === "iod" && p.positive, why: "Iodine detects starch, especially amylose helices." },
    { type: "goal", ic: "🟣", do: "Show a <b>violet</b> Biuret result for egg white.", look: "Test tube", target: "Biuret positive", check: p => p.sample === "albumen" && p.test === "biu" && p.positive, why: "Albumen is protein; Biuret detects peptide bonds." },
    { type: "goal", ic: "⚪", do: "Make cooking oil give a <b>cloudy emulsion</b>.", look: "Ethanol emulsion", target: "Lipid positive", check: p => p.sample === "oil" && p.test === "eth" && p.positive, why: "Lipids dissolve in ethanol and form white droplets when water is added." }] },
  { ic: "❔", name: "Unknowns", tasks: [
    { type: "goal", ic: "X", do: "Record <b>Unknown X</b> with Benedict's test.", look: "Results table", target: "X Benedict recorded", check: p => p.sample === "x" && p.test === "ben" && p.heated && p.rank >= 4, why: "Unknown X acts like glucose: strong reducing sugar." },
    { type: "goal", ic: "Y", do: "Make <b>Unknown Y</b> positive after HCl hydrolysis.", look: "Results table", target: "Y hydrolysis positive", check: p => p.sample === "y" && p.test === "benhyd" && p.heated && p.rank >= 4, why: "Unknown Y was non-reducing before hydrolysis, like sucrose." },
    { type: "goal", ic: "Z", do: "Show <b>Unknown Z</b> has protein and lipid.", look: "Results table", target: "Z protein or lipid", check: p => p.sample === "z" && ((p.test === "biu" && p.positive) || (p.test === "eth" && p.positive)), why: "Unknown Z gives milk-like results: protein and lipid (and some reducing sugar)." }] },
  { ic: "✍️", name: "Explain", tasks: [
    { type: "fill", ic: "💧", do: "Complete the sucrose sentence.", text: "Sucrose is {non-reducing|reducing} before hydrolysis. Dilute acid {hydrolyses|emulsifies} it to reducing sugars.", why: "Sucrose does not reduce Benedict's until it has been hydrolysed." },
    { type: "order", ic: "🔢", do: "Put the sucrose test steps in order.", items: ["Boil sucrose with dilute hydrochloric acid", "Neutralise with sodium hydrogencarbonate", "Add Benedict's reagent", "Heat in a boiling water bath", "Compare the colour with the chart"], why: "Acid first hydrolyses sucrose. The mixture is neutralised before Benedict's reagent is heated." },
    { type: "pick", ic: "📊", do: "Which sample has the most reducing sugar?", opts: ["Glucose solution / Unknown X", "Distilled water", "Starch suspension", "Cooking oil"], why: "The brick-red precipitate is the highest Benedict rank." }] }
] };

/* ---------------- 2. 🔗 Build biomolecules ---------------- */
const MB_MODES = {
  carb: { name: "Carbohydrates", bond: "glycosidic", mon: "glucose", col: "#FFD27A" },
  protein: { name: "Proteins", bond: "peptide", mon: "amino acid", col: "#B9A6D9" },
  lipid: { name: "Lipids", bond: "ester", mon: "fatty acid", col: "#F4A6B8" }
};
const MB_POLY = { amylose: ["Starch (amylose)", "plant energy store", "α-glucose unbranched helix"], amylopectin: ["Starch (amylopectin)", "plant energy store", "branched α-glucose"], glycogen: ["Glycogen", "animal store in liver/muscle", "highly branched α-glucose"], cellulose: ["Cellulose", "plant cell wall", "β-glucose straight cross-linked fibres"] };
function mbName(st) {
  if (st.mode === "lipid") return st.bonds >= 3 ? "triglyceride" : `glycerol + ${st.bonds} fatty acid${st.bonds === 1 ? "" : "s"}`;
  if (st.mode === "protein") return st.monomers === 1 ? "amino acid" : st.monomers === 2 ? "dipeptide" : "polypeptide";
  return st.monomers === 1 ? (st.poly === "cellulose" ? "β-glucose" : "α-glucose") : st.monomers === 2 ? "maltose" : MB_POLY[st.poly][0];
}
function molbuildSim(root) {
  const st = { mode: "carb", poly: "amylose", monomers: 1, bonds: 0, waterOut: 0, waterIn: 0, pulse: 0 };
  root.innerHTML = `<div class="simgrid wide"><section class="card"><div id="mbSvg" class="simsvg nozoom"></div><div class="row simbtns"><button class="btn" id="mbJoin">🔗 Condense / join</button><button class="btn blue" id="mbSplit">💧 Hydrolyse / split</button><button class="btn plain" id="mbReset">↺ Reset</button></div><div id="mbRead" class="mb-read"></div></section><section class="card"><h3 style="margin:0">🎛️ Build mode</h3><div class="mb-controls"><div><b class="small">Molecule family</b>${segBtns("mb-mode", Object.entries(MB_MODES).map(([k, m]) => [k, m.name]), st.mode)}</div><div id="mbPolyBox"><b class="small">Carbohydrate polymer</b>${segBtns("mb-poly", Object.entries(MB_POLY).map(([k, v]) => [k, v[0]]), st.poly)}</div><div id="mbFlow" class="mb-flow"></div></div></section></div><section class="card"><h3 style="margin:0">🧠 Match molecule to function</h3><div id="mbFunc" class="mb-func"></div></section>`;
  const limit = () => st.mode === "lipid" ? 3 : 8;
  const sync = () => { st.bonds = st.mode === "lipid" ? clamp(st.bonds, 0, 3) : Math.max(0, st.monomers - 1); };
  const reset = () => { st.monomers = 1; st.bonds = 0; st.waterOut = 0; st.waterIn = 0; };
  root.querySelectorAll("[data-mb-mode]").forEach(b => b.onclick = () => { SFX.tap(); st.mode = b.getAttribute("data-mb-mode"); root.querySelectorAll("[data-mb-mode]").forEach(x => x.setAttribute("aria-checked", x === b)); reset(); draw(); });
  root.querySelectorAll("[data-mb-poly]").forEach(b => b.onclick = () => { SFX.tap(); st.poly = b.getAttribute("data-mb-poly"); root.querySelectorAll("[data-mb-poly]").forEach(x => x.setAttribute("aria-checked", x === b)); draw(); });
  root.querySelector("#mbJoin").onclick = () => { SFX.item(); if (st.mode === "lipid") { if (st.bonds < 3) { st.bonds++; st.waterOut++; } } else if (st.monomers < limit()) { st.monomers++; st.bonds++; st.waterOut++; } st.pulse = .9; draw(); };
  root.querySelector("#mbSplit").onclick = () => { SFX.tap(); if (st.mode === "lipid") { if (st.bonds > 0) { st.bonds--; st.waterIn++; } } else if (st.monomers > 1) { st.monomers--; st.bonds--; st.waterIn++; } st.pulse = -.9; draw(); };
  root.querySelector("#mbReset").onclick = () => { SFX.tap(); reset(); draw(); };
  simProbe(() => { const n = st.mode === "lipid" ? st.bonds + 1 : st.monomers; const expected = st.mode === "lipid" ? 3 : Math.max(0, st.monomers - 1); return { mode: st.mode, poly: st.poly, monomers: st.monomers, bonds: st.bonds, watersReleased: st.waterOut, watersUsed: st.waterIn, expectedWater: expected, molecule: mbName(st), bondName: MB_MODES[st.mode].bond, complete: st.mode === "lipid" ? st.bonds === 3 : st.monomers >= 4, cellulose: st.poly === "cellulose", function: st.mode === "carb" ? MB_POLY[st.poly][1] : st.mode === "protein" ? "sequence folds to a specific shape" : "energy store and insulation", units: n }; });
  const draw = () => { sync(); root.querySelector("#mbSvg").innerHTML = mbSvg(st); root.querySelector("#mbRead").innerHTML = `<span>Molecule<b>${esc(mbName(st))}</b><small>${esc(st.mode === "carb" ? MB_POLY[st.poly][2] : st.mode === "protein" ? "amino acids joined" : "glycerol + fatty acids")}</small></span><span>Bonds<b>${st.bonds}</b><small>${MB_MODES[st.mode].bond}</small></span><span>H₂O released<b>${st.waterOut}</b><small>condensation</small></span><span>H₂O used<b>${st.waterIn}</b><small>hydrolysis</small></span>`; root.querySelector("#mbPolyBox").style.display = st.mode === "carb" ? "block" : "none"; root.querySelector("#mbFlow").innerHTML = mbFlowHtml(st); root.querySelector("#mbFunc").innerHTML = mbFuncHtml(st); };
  simLoop(root, dt => { st.pulse *= Math.max(0, 1 - dt * 2.5); draw(); });
}
function mbFlowHtml(st) {
  const bond = MB_MODES[st.mode].bond;
  return `<div class="mb-step on">1. Tap monomer<br><span class="small">${esc(MB_MODES[st.mode].mon)}</span></div><div class="mb-step ${st.bonds ? "on" : ""}">2. Condensation<br><span class="small">${bond} bond + H₂O</span></div><div class="mb-step ${st.mode === "lipid" ? st.bonds === 3 ? "on" : "" : st.monomers >= 3 ? "on" : ""}">3. Polymer / lipid<br><span class="small">${esc(mbName(st))}</span></div><div class="mb-step ${st.waterIn ? "on" : ""}">4. Hydrolysis<br><span class="small">add water to split</span></div>`;
}
function mbFuncHtml(st) { return `<div><b>Starch</b><br><span class="small">Storage in plants; amylose is helical, amylopectin is branched.</span></div><div><b>Glycogen</b><br><span class="small">Highly branched glucose store in liver and muscle.</span></div><div><b>Cellulose</b><br><span class="small">β-glucose chains form cross-linked fibres in cell walls.</span></div><div><b>Digestion</b><br><span class="small">Hydrolysis uses water and enzymes to split food polymers.</span></div>`; }
function mbSvg(st) {
  const col = MB_MODES[st.mode].col, water = st.pulse ? `<g transform="translate(510 58) scale(${1 + Math.abs(st.pulse) * .25})"><circle cx="0" cy="0" r="26" fill="#DDF1FF" stroke="${CO}" stroke-width="3"/><text x="0" y="6" text-anchor="middle" font-size="18" font-weight="900" fill="${CO}">H₂O</text><text x="0" y="46" text-anchor="middle" font-size="13" font-weight="900" fill="${CO}">${st.pulse > 0 ? "released" : "used"}</text></g>` : "";
  let body = "";
  if (st.mode === "carb") {
    const n = st.monomers, beta = st.poly === "cellulose";
    body = Array.from({ length: n }, (_, i) => { const x = 74 + i * 58, y = beta ? 182 + (i % 2 ? 12 : -12) : 182 + Math.sin(i * .8) * (st.poly === "amylose" ? 24 : 8); return `<g><polygon points="${[0, 1, 2, 3, 4, 5].map(k => `${(x + 24 * Math.cos(Math.PI / 6 + k * Math.PI / 3)).toFixed(1)},${(y + 24 * Math.sin(Math.PI / 6 + k * Math.PI / 3)).toFixed(1)}`).join(" ")}" fill="${col}" stroke="${CO}" stroke-width="3"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="20" font-weight="900" fill="${CO}">O</text>${i ? `<line x1="${x - 34}" y1="${y}" x2="${x - 24}" y2="${y}" stroke="${CO}" stroke-width="5"/>` : ""}${(st.poly === "amylopectin" && i === 3) || (st.poly === "glycogen" && (i === 2 || i === 4)) ? `<path d="M${x} ${y - 25} q20 -42 54 -36" stroke="${CO}" stroke-width="5" fill="none"/><polygon points="${[0, 1, 2, 3, 4, 5].map(k => `${(x + 72 + 18 * Math.cos(Math.PI / 6 + k * Math.PI / 3)).toFixed(1)},${(y - 72 + 18 * Math.sin(Math.PI / 6 + k * Math.PI / 3)).toFixed(1)}`).join(" ")}" fill="${col}" stroke="${CO}" stroke-width="2.5"/>` : ""}</g>`; }).join("");
    if (beta && n > 2) body += `<path d="M70 230 H530 M70 250 H530" stroke="#9FC6E8" stroke-width="4" stroke-dasharray="9 7"/><text x="300" y="276" text-anchor="middle" font-size="13" font-weight="900" fill="${CO}">hydrogen bonds cross-link straight cellulose chains</text>`;
  } else if (st.mode === "protein") {
    body = Array.from({ length: st.monomers }, (_, i) => { const x = 70 + i * 58, y = 170 + Math.sin(i * 1.1) * 32; return `<g><circle cx="${x}" cy="${y}" r="25" fill="${col}" stroke="${CO}" stroke-width="3"/><text x="${x}" y="${y - 4}" text-anchor="middle" font-size="11" font-weight="900" fill="${CO}">NH₂</text><text x="${x}" y="${y + 12}" text-anchor="middle" font-size="11" font-weight="900" fill="${CO}">COOH</text><text x="${x}" y="${y + 42}" text-anchor="middle" font-size="11" font-weight="900" fill="${CO}">R</text>${i ? `<path d="M${x - 35} ${y} H${x - 25}" stroke="${CO}" stroke-width="5"/><text x="${x - 30}" y="${y - 10}" text-anchor="middle" font-size="10" font-weight="900" fill="${CO}">peptide</text>` : ""}</g>`; }).join("") + (st.monomers >= 5 ? `<path d="M120 245 C190 210 260 278 330 240 S480 220 520 252" stroke="#8D53C7" stroke-width="8" fill="none" opacity=".55"/><text x="320" y="296" text-anchor="middle" font-size="13" font-weight="900" fill="${CO}">simple folding: sequence → shape → function</text>` : "");
  } else {
    body = `<g transform="translate(85 92)"><rect x="0" y="48" width="58" height="116" rx="16" fill="#DDF1FF" stroke="${CO}" stroke-width="3"/><text x="29" y="112" text-anchor="middle" font-size="14" font-weight="900" fill="${CO}">glycerol</text></g>` + [0, 1, 2].map(i => { const joined = i < st.bonds, y = 112 + i * 54; return `<g opacity="${joined ? 1 : .35}"><path d="M154 ${y} H210 ${joined ? `M154 ${y + 10} H210` : ""}" stroke="${CO}" stroke-width="5"/><path d="M210 ${y} l36 -18 l36 18 l36 -18 l36 18 l36 -18 l36 18" stroke="${joined ? "#E97856" : "#B9B2AA"}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="420" y="${y + 5}" font-size="13" font-weight="900" fill="${CO}">${joined ? "ester bond + fatty acid tail" : "fatty acid waiting"}</text></g>`; }).join("");
  }
  return `<svg viewBox="0 0 640 330" role="img" aria-label="Building biomolecules by condensation and hydrolysis"><rect width="640" height="330" rx="18" fill="#FFF9F0"/><text x="24" y="30" font-size="18" font-weight="900" fill="${CO}">${esc(mbName(st))} · ${st.bonds} ${esc(MB_MODES[st.mode].bond)} bond(s)</text>${body}${water}</svg>`;
}

simReg({ id: "molbuild", ic: "🔗", name: "Build biomolecules", sec: "1a", ord: 20, topic: "t1", fn: molbuildSim,
  words: [["condensation", "💧", "join molecules; water released"], ["hydrolysis", "💧", "split molecules using water"], ["glycosidic", "🔗", "bond between sugars"], ["peptide", "🧵", "bond between amino acids"], ["ester", "🧈", "bond in triglycerides"], ["cellulose", "🌿", "cell-wall polysaccharide"], ["glycogen", "💪", "animal glucose store"]] });
SIM_P.molbuild = ["You join 5 glucose monomers into one unbranched chain. How many water molecules are released?", ["4, because n monomers make n−1 bonds", "5, one from every glucose", "6, because both ends lose water", "0, because water is only used in hydrolysis"], "A chain of n monomers has n−1 joining bonds, so condensation releases n−1 waters.", "tap Condense / join several times and watch the counters." ];
SIM_Q.molbuild = [["Which bond joins two amino acids?", ["Peptide bond", "Glycosidic bond", "Ester bond", "Hydrogen bond only"], "Amino acids join by peptide bonds to form dipeptides and polypeptides."], ["Digestion of starch into maltose/glucose is mainly an example of…", ["Hydrolysis", "Condensation", "Emulsification only", "Denaturation"], "Digestive enzymes add water across glycosidic bonds: hydrolysis."]];
SIM_CH.molbuild = { title: "Biomolecule Builder", mins: 15, story: "Build, split and name biological molecules by their bonds and water counts.", missions: [
  { ic: "💧", name: "Condense", tasks: [
    { type: "goal", ic: "🔗", do: "In <b>Carbohydrates</b>, join at least 4 glucose units.", look: "H₂O counter", target: "4+ sugars", check: p => p.mode === "carb" && p.monomers >= 4, meter: p => ({ v: p.monomers, min: 1, max: 8, lo: 4, hi: 8, unit: "", label: "Glucose units" }), why: "Each new glycosidic bond forms by condensation and releases one water." },
    { type: "read", ic: "🔢", do: "Read the water rule from your chain.", look: "Counters", fields: [["Water from 6 monomers", 5, 0, "H₂O"], ["Bonds in 6 monomers", 5, 0, "bonds"]], why: "For a straight polymer, n monomers make n−1 bonds and release n−1 waters." },
    { type: "pick", ic: "🔗", do: "Name the carbohydrate bond.", need: p => p.mode === "carb" && p.bonds > 0, needTxt: "Build at least one carbohydrate bond.", opts: ["Glycosidic bond", "Peptide bond", "Ester bond", "Ionic bond"], why: "Sugars are joined by glycosidic bonds." }] },
  { ic: "🌿", name: "Compare polysaccharides", tasks: [
    { type: "goal", ic: "🌿", do: "Switch to <b>Cellulose</b> and build a straight chain.", look: "Diagram", target: "β-glucose cellulose", check: p => p.mode === "carb" && p.cellulose && p.monomers >= 4, why: "Cellulose uses β-glucose in straight chains cross-linked by hydrogen bonds." },
    { type: "pick", ic: "🍚", do: "Which polymer stores energy in plants?", opts: ["Starch", "Cellulose", "Collagen", "Cholesterol"], why: "Starch is a plant storage polysaccharide." },
    { type: "pick", ic: "💪", do: "Which polymer is highly branched in liver and muscle?", opts: ["Glycogen", "Cellulose", "Amylose", "Triglyceride"], why: "Glycogen is the animal storage polysaccharide and is highly branched." }] },
  { ic: "🥚", name: "Protein + lipid", tasks: [
    { type: "goal", ic: "🥚", do: "Switch to <b>Proteins</b> and make a polypeptide.", look: "Amino acid diagram", target: "≥4 amino acids", check: p => p.mode === "protein" && p.monomers >= 4 && p.bondName === "peptide", why: "Amino acids join by peptide bonds. The sequence can fold into a specific shape." },
    { type: "goal", ic: "🧈", do: "Switch to <b>Lipids</b> and build a triglyceride.", look: "Glycerol + 3 tails", target: "3 ester bonds", check: p => p.mode === "lipid" && p.bonds === 3, meter: p => ({ v: p.bonds, min: 0, max: 3, lo: 3, hi: 3, unit: "/3", label: "Ester bonds" }), why: "A triglyceride has glycerol joined to three fatty acids by three ester bonds." },
    { type: "fill", ic: "✍️", do: "Complete the lipid sentence.", text: "Glycerol + 3 fatty acids form a {triglyceride|polypeptide}. The bonds are {ester|peptide} bonds.", why: "This is the HKDSE lipid structure: glycerol plus three fatty acids." }] },
  { ic: "💧", name: "Hydrolyse", tasks: [
    { type: "goal", ic: "💧", do: "Use <b>Hydrolyse / split</b> at least once.", look: "H₂O used counter", target: "H₂O used ≥ 1", check: p => p.watersUsed >= 1, why: "Hydrolysis adds water to break a bond. Digestion is hydrolysis." },
    { type: "order", ic: "🔢", do: "Put condensation into order.", items: ["Two monomers line up", "Functional groups react", "One water molecule is released", "A covalent bond forms", "A larger molecule is made"], why: "Condensation joins molecules with the loss of water." },
    { type: "fill", ic: "n−1", do: "Finish the water-count rule.", text: "For n monomers in one chain, the number of bonds is {n−1|n|n+1}, so waters released = {n−1|n|0}.", why: "Every joining bond releases one water, and a chain of n units has n−1 joins." }] }
] };

/* ---------------- 3. 🔬 Cell explorer ---------------- */
const CV_SPEC = {
  plant: { name: "Leaf palisade cell", image: 32, actual: 80, orgs: ["wall", "membrane", "nucleus", "vacuole", "chloroplast", "mitochondrion", "rer", "golgi", "ribosome"] },
  animal: { name: "Cheek / liver cell", image: 18, actual: 45, orgs: ["membrane", "nucleus", "mitochondrion", "rer", "ser", "golgi", "ribosome"] },
  bacterium: { name: "Bacterium", image: 2.4, actual: 6, orgs: ["wall", "membrane", "cytoplasm", "nucleoid", "plasmid", "ribosome", "flagellum", "capsule"] }
};
const CV_ORG = {
  wall: ["Cell wall", "support and shape; plant wall is cellulose, bacterial wall is not cellulose"], membrane: ["Cell membrane", "differentially permeable boundary controlling entry and exit"], nucleus: ["Nucleus", "contains DNA chromosomes and controls cell activities"], vacuole: ["Large vacuole", "cell sap; keeps plant cell turgid; tonoplast surrounds it"], chloroplast: ["Chloroplast", "photosynthesis; grana thylakoids in stroma"], mitochondrion: ["Mitochondrion", "aerobic respiration; cristae increase surface area"], rer: ["Rough ER", "ribosomes on membranes make and transport proteins"], ser: ["Smooth ER", "makes lipids and detoxifies substances"], golgi: ["Golgi apparatus", "modifies and packages proteins in vesicles"], ribosome: ["Ribosomes", "site of protein synthesis; too small for light microscope"], cytoplasm: ["Cytoplasm", "site of many metabolic reactions"], nucleoid: ["Nucleoid", "circular DNA region; no nuclear envelope"], plasmid: ["Plasmid", "small ring of bacterial DNA"], flagellum: ["Flagellum", "movement of some bacteria"], capsule: ["Capsule", "slimy protective outer layer in some bacteria"]
};
const CV_LIGHT_OK = { plant: ["wall", "membrane", "nucleus", "vacuole", "chloroplast"], animal: ["membrane", "nucleus", "cytoplasm"], bacterium: ["wall"] };
function cellviewSim(root) {
  const st = { specimen: "plant", view: "light", obj: 10, eyepiece: 10, org: "nucleus", imageMm: 8 };
  root.innerHTML = `<div class="simgrid wide"><section class="card"><div id="cvSvg" class="simsvg nozoom"></div><div class="cv-read" id="cvRead"></div></section><section class="card"><h3 style="margin:0">🎛️ Microscope controls</h3><div class="cv-controls"><div><b class="small">Specimen</b>${segBtns("cv-spec", Object.entries(CV_SPEC).map(([k, s]) => [k, s.name]), st.specimen)}</div><div><b class="small">View</b>${segBtns("cv-view", [["light", "💡 Light microscope"], ["em", "⚡ Electron microscope"]], st.view)}</div><div><b class="small">Objective lens</b>${segBtns("cv-obj", [[4, "×4"], [10, "×10"], [40, "×40"]], String(st.obj))}</div><div class="cv-calc"><label class="small">📏 Image size on screen: <span id="cvImgLab">8 mm</span><input id="cvImg" type="range" min="2" max="80" value="8"></label></div><div id="cvInfo" class="cv-func"></div></div></section></div><section class="card"><h3 style="margin:0">🏷️ Tap an organelle</h3><div id="cvOrgList" class="cv-orglist"></div></section><section class="card cv-compare"><h3 style="margin:0">Compare cells</h3><div id="cvTable"></div></section>`;
  const setSeg = (name, cb) => root.querySelectorAll(`[data-${name}]`).forEach(b => b.onclick = () => { SFX.tap(); cb(b); root.querySelectorAll(`[data-${name}]`).forEach(x => x.setAttribute("aria-checked", x === b)); draw(); });
  setSeg("cv-spec", b => { st.specimen = b.getAttribute("data-cv-spec"); st.org = CV_SPEC[st.specimen].orgs[0]; });
  setSeg("cv-view", b => { st.view = b.getAttribute("data-cv-view"); });
  setSeg("cv-obj", b => { st.obj = Number(b.getAttribute("data-cv-obj")); });
  root.querySelector("#cvImg").oninput = e => { st.imageMm = Number(e.target.value); draw(); };
  root.querySelector("#cvSvg").onclick = e => { const g = e.target.closest("[data-cv-org]"); if (!g) return; SFX.tap(); st.org = g.dataset.cvOrg; draw(); };
  root.querySelector("#cvOrgList").onclick = e => { const b = e.target.closest("[data-cv-orgbtn]"); if (!b) return; SFX.tap(); st.org = b.dataset.cvOrgbtn; draw(); };
  simProbe(() => { const total = st.eyepiece * st.obj, actual = st.imageMm * 1000 / total, visible = cvVisible(st, st.org); return { specimen: st.specimen, view: st.view, objective: st.obj, eyepiece: st.eyepiece, totalMag: total, imageMm: st.imageMm, actualUm: +actual.toFixed(1), selected: st.org, selectedName: CV_ORG[st.org][0], visible, resolution: st.view === "light" ? .2 : .002, plantOnly: st.specimen === "plant" && ["wall", "chloroplast", "vacuole"].includes(st.org), prokaryote: st.specimen === "bacterium", hasNucleus: st.specimen !== "bacterium" }; });
  const draw = () => { root.querySelector("#cvSvg").innerHTML = cvSvg(st); const p = SIM_PROBE(); root.querySelector("#cvRead").innerHTML = `<span>Total mag.<b>×${p.totalMag}</b><small>eyepiece ×10 × objective ×${st.obj}</small></span><span>Actual size<b>${p.actualUm} µm</b><small>${st.imageMm} mm ×1000 ÷ ×${p.totalMag}</small></span><span>Resolution<b>${st.view === "light" ? "~0.2 µm" : "~0.002 µm"}</b><small>${st.view === "light" ? "ribosomes/ER not resolved" : "ultrastructure visible"}</small></span><span>Selected<b>${esc(p.selectedName)}</b><small>${p.visible ? "visible in this view" : "too small / not present"}</small></span>`; root.querySelector("#cvInfo").innerHTML = `<b>${esc(CV_ORG[st.org][0])}</b><br><span class="small">${esc(CV_ORG[st.org][1])}</span>`; root.querySelector("#cvImgLab").textContent = `${st.imageMm} mm`; root.querySelector("#cvOrgList").innerHTML = CV_SPEC[st.specimen].orgs.map(o => `<button data-cv-orgbtn="${o}" aria-pressed="${st.org === o}">${cvVisible(st, o) ? "👁️" : "·"} ${CV_ORG[o][0]}</button>`).join(""); root.querySelector("#cvTable").innerHTML = cvTableHtml(); };
  draw();
}
function cvVisible(st, org) { if (st.view === "em") return CV_SPEC[st.specimen].orgs.includes(org); return (CV_LIGHT_OK[st.specimen] || []).includes(org); }
function cvHot(st, org, svg) { const on = st.org === org, vis = cvVisible(st, org); return `<g class="cv-hot ${on ? "sel" : ""}" data-cv-org="${org}" opacity="${vis ? 1 : .38}">${svg}</g>`; }
function cvSvg(st) {
  const em = st.view === "em", sp = st.specimen;
  let body = "";
  if (sp === "plant") body = cvPlantSvg(st, em); else if (sp === "animal") body = cvAnimalSvg(st, em); else body = cvBactSvg(st, em);
  const scale = `<g><line x1="430" y1="304" x2="550" y2="304" stroke="${CO}" stroke-width="5"/><text x="490" y="292" text-anchor="middle" font-size="20" font-weight="900" fill="${CO}">${em ? "2 µm" : "20 µm"}</text><text x="28" y="310" font-size="20" font-weight="900" fill="${CO}">total ×${st.obj * 10}</text></g>`;
  return `<svg viewBox="0 0 620 330" role="img" aria-label="${CV_SPEC[sp].name} under ${em ? "electron" : "light"} microscope"><rect width="620" height="330" rx="18" fill="${em ? "#F4F4F0" : "#F7FBFF"}"/><text x="28" y="28" font-size="18" font-weight="900" fill="${CO}">${esc(CV_SPEC[sp].name)} · ${em ? "electron microscope ultrastructure" : "light microscope view"}</text>${body}${scale}</svg>`;
}
function cvPlantSvg(st, em) {
  const wall = cvHot(st, "wall", `<rect x="70" y="58" width="410" height="214" rx="22" fill="#DDE9B7" stroke="${CO}" stroke-width="8"/>`);
  const mem = cvHot(st, "membrane", `<rect x="84" y="72" width="382" height="186" rx="18" fill="#E9F8D8" stroke="#3FA06B" stroke-width="3"/>`);
  const vac = cvHot(st, "vacuole", `<rect x="160" y="96" width="204" height="138" rx="24" fill="#CFE8FF" stroke="#3E8FDF" stroke-width="3"/><text x="262" y="171" text-anchor="middle" font-size="20" font-weight="900" fill="${CO}">tonoplast</text>`);
  const nuc = cvHot(st, "nucleus", `<circle cx="404" cy="142" r="38" fill="#D8C4F2" stroke="${CO}" stroke-width="3"/>${em ? `<circle cx="404" cy="142" r="16" fill="#9B73CF"/><circle cx="438" cy="132" r="3" fill="#fff"/><circle cx="372" cy="148" r="3" fill="#fff"/><path d="M382 128 q22 20 48 4 M386 158 q28 -22 48 0" stroke="#6B4A6B" stroke-width="2" fill="none"/>` : ""}`);
  const chl = [0, 1, 2, 3, 4].map(i => cvHot(st, "chloroplast", `<g transform="translate(${118 + (i % 3) * 108} ${112 + Math.floor(i / 3) * 86}) rotate(${i * 18})"><ellipse cx="0" cy="0" rx="34" ry="16" fill="#62B957" stroke="${CO}" stroke-width="3"/>${em ? `<path d="M-22 -5 h44 M-18 0 h36 M-22 5 h44" stroke="#276E36" stroke-width="3"/>` : ""}</g>`)).join("");
  const mito = em ? [0, 1].map(i => cvHot(st, "mitochondrion", `<g transform="translate(${404 + i * 38} ${216 - i * 26})"><ellipse cx="0" cy="0" rx="28" ry="14" fill="#F6B07D" stroke="${CO}" stroke-width="3"/><path d="M-18 0 q8 -9 16 0 t16 0 t16 0" stroke="#A95832" stroke-width="2" fill="none"/></g>`)).join("") : "";
  const er = em ? cvHot(st, "rer", `<path d="M330 98 c-36 -16 -64 8 -70 38 c42 -16 78 2 108 -18" fill="none" stroke="#7A9AD8" stroke-width="9"/><g fill="${CO}">${Array.from({ length: 10 }, (_, i) => `<circle cx="${268 + i * 10}" cy="${112 + (i % 2) * 16}" r="2"/>`).join("")}</g>`) + cvHot(st, "golgi", `<path d="M116 218 c32 -20 62 -14 86 -4 M116 232 c38 -16 68 -10 94 0 M124 246 c32 -12 58 -8 78 4" stroke="#C989D2" stroke-width="7" fill="none" stroke-linecap="round"/>`) + cvHot(st, "ribosome", `<g fill="${CO}">${Array.from({ length: 18 }, (_, i) => `<circle cx="${250 + (i * 29) % 190}" cy="${84 + (i * 37) % 160}" r="2.2"/>`).join("")}</g>`) : "";
  return wall + mem + vac + chl + nuc + mito + er;
}
function cvAnimalSvg(st, em) {
  const mem = cvHot(st, "membrane", `<path d="M112 170 C86 98 158 52 252 64 C358 46 482 94 474 176 C466 270 332 278 238 258 C154 278 84 232 112 170Z" fill="#FBE7EF" stroke="${CO}" stroke-width="4"/>`);
  const nuc = cvHot(st, "nucleus", `<circle cx="282" cy="158" r="55" fill="#D8C4F2" stroke="${CO}" stroke-width="3"/>${em ? `<circle cx="282" cy="158" r="20" fill="#9B73CF"/><path d="M244 136 q36 -20 76 0 M246 178 q42 22 78 -4" stroke="#6B4A6B" stroke-width="2" fill="none"/><g fill="#fff"><circle cx="236" cy="158" r="3"/><circle cx="328" cy="148" r="3"/></g>` : ""}`);
  const cyto = cvHot(st, "cytoplasm", `<path d="M132 172 C104 120 174 82 254 92 C360 76 444 114 444 178 C440 236 326 244 246 230 C174 244 110 220 132 172Z" fill="#FFF1F6" opacity=".5"/>`);
  const mito = em ? [0, 1, 2].map(i => cvHot(st, "mitochondrion", `<g transform="translate(${170 + i * 102} ${104 + (i % 2) * 116}) rotate(${i * 26})"><ellipse cx="0" cy="0" rx="34" ry="16" fill="#F6B07D" stroke="${CO}" stroke-width="3"/><path d="M-22 0 q8 -10 16 0 t16 0 t16 0 t16 0" stroke="#A95832" stroke-width="2" fill="none"/></g>`)).join("") : "";
  const er = em ? cvHot(st, "rer", `<path d="M326 105 c44 8 70 32 74 70 c-44 -14 -76 -6 -112 -22" fill="none" stroke="#7A9AD8" stroke-width="10"/><g fill="${CO}">${Array.from({ length: 12 }, (_, i) => `<circle cx="${314 + (i * 12)}" cy="${118 + (i % 3) * 18}" r="2"/>`).join("")}</g>`) + cvHot(st, "ser", `<path d="M164 204 c38 -22 76 18 116 -4 c-34 38 -90 12 -126 34" fill="none" stroke="#73C7C7" stroke-width="8"/>`) + cvHot(st, "golgi", `<path d="M168 130 c42 -16 76 -10 112 2 M172 146 c42 -12 72 -6 104 6 M180 162 c34 -8 58 -2 82 8" stroke="#C989D2" stroke-width="7" fill="none" stroke-linecap="round"/>`) + cvHot(st, "ribosome", `<g fill="${CO}">${Array.from({ length: 24 }, (_, i) => `<circle cx="${134 + (i * 37) % 310}" cy="${78 + (i * 31) % 178}" r="2.2"/>`).join("")}</g>`) : "";
  return mem + cyto + nuc + mito + er;
}
function cvBactSvg(st, em) {
  const cap = cvHot(st, "capsule", `<ellipse cx="286" cy="166" rx="210" ry="92" fill="#DFF3F0" stroke="#87BDB3" stroke-width="8" opacity=".8"/>`);
  const wall = cvHot(st, "wall", `<ellipse cx="286" cy="166" rx="176" ry="68" fill="#F9E4B0" stroke="${CO}" stroke-width="5"/>`);
  const mem = cvHot(st, "membrane", `<ellipse cx="286" cy="166" rx="158" ry="55" fill="#FFF4CC" stroke="#3FA06B" stroke-width="3"/>`);
  const cyt = cvHot(st, "cytoplasm", `<ellipse cx="286" cy="166" rx="145" ry="46" fill="#FFF8D9"/>`);
  const nuc = cvHot(st, "nucleoid", `<path d="M220 154 c36 -42 74 46 112 2 c34 -38 70 24 28 46 c-44 18 -72 -42 -112 -2 c-40 30 -76 -12 -28 -46Z" fill="none" stroke="#7A5BC2" stroke-width="6"/>`);
  const plas = em ? cvHot(st, "plasmid", `<circle cx="384" cy="138" r="13" fill="none" stroke="#9B73CF" stroke-width="4"/><circle cx="186" cy="188" r="11" fill="none" stroke="#9B73CF" stroke-width="4"/>`) : "";
  const rib = em ? cvHot(st, "ribosome", `<g fill="${CO}">${Array.from({ length: 36 }, (_, i) => `<circle cx="${154 + (i * 37) % 265}" cy="${124 + (i * 23) % 82}" r="2.3"/>`).join("")}</g>`) : "";
  const flag = cvHot(st, "flagellum", `<path d="M456 166 C520 132 546 206 600 166" stroke="#D98968" stroke-width="8" fill="none" stroke-linecap="round"/>`);
  return cap + wall + mem + cyt + nuc + plas + rib + flag + `<text x="286" y="270" text-anchor="middle" font-size="13" font-weight="900" fill="${CO}">${em ? "70S-style small ribosomes, nucleoid DNA, plasmids" : "light microscope: bacteria are near the resolution limit"}</text>`;
}
function cvTableHtml() { const rows = [["Nucleus", "true nucleus", "true nucleus", "nucleoid only"], ["Cell wall", "cellulose", "absent", "not cellulose"], ["Chloroplast", "green cells", "absent", "absent"], ["Membrane-bound organelles", "mitochondria, ER, Golgi", "mitochondria, ER, Golgi", "none"], ["Ribosomes", "80S; not seen by LM", "80S; not seen by LM", "small 70S-style"]]; return `<div class="cv-compgrid">${[["Plant", 1], ["Animal", 2], ["Bacterium", 3]].map(([name, i]) => `<div class="cv-compcard"><b>${name}</b>${rows.map(r => `<span><small>${r[0]}</small><br>${r[i]}</span>`).join("")}</div>`).join("")}</div>`; }

simReg({ id: "cellview", ic: "🔬", name: "Cell explorer", sec: "1b", ord: 10, topic: "t2", fn: cellviewSim,
  words: [["resolution", "🔍", "separates two close points"], ["magnification", "×", "image size ÷ actual size"], ["nucleus", "🟣", "DNA control centre"], ["mitochondrion", "⚡", "site of aerobic respiration"], ["chloroplast", "🌿", "site of photosynthesis"], ["ribosome", "•", "makes proteins"], ["prokaryote", "🦠", "cell with no true nucleus"], ["graticule", "📏", "microscope measuring scale"]] });
SIM_P.cellview = ["You switch from a light microscope to an electron microscope. What new structures can you resolve?", ["Ribosomes, ER and membranes inside organelles", "Only the whole cell outline", "Only colour in living cells", "Nothing, because magnification and resolution are the same"], "Electron microscopes have much higher resolution, so ultrastructure can be seen.", "toggle Electron microscope and tap organelles." ];
SIM_Q.cellview = [["Total magnification is…", ["eyepiece magnification × objective magnification", "image size × actual size", "eyepiece + objective", "actual size ÷ image size"], "A ×10 eyepiece with a ×40 objective gives ×400 total magnification."], ["Why can an electron microscope show ribosomes but a light microscope cannot?", ["It has a much higher resolution", "It always shows living cells", "It uses iodine stain", "It makes cells larger but not clearer"], "Resolution, not just magnification, decides whether two tiny structures can be seen separately."]];
SIM_CH.cellview = { title: "Cell Explorer Mission", mins: 15, story: "Use microscope view, labels and calculations to compare plant, animal and bacterial cells.", missions: [
  { ic: "×", name: "Magnify", tasks: [
    { type: "goal", ic: "🔬", do: "Set the objective to <b>×40</b>.", look: "Microscope controls", target: "Total magnification ×400", check: p => p.objective === 40 && p.totalMag === 400, why: "Total magnification = eyepiece ×10 × objective ×40 = ×400." },
    { type: "read", ic: "📏", do: "Calculate actual size for 20 mm at ×400.", look: "Calculation panel", fields: [["Actual size", 50, 1, "µm"]], why: "20 mm = 20 000 µm. 20 000 ÷ 400 = 50 µm." },
    { type: "fill", ic: "✍️", do: "Complete the formula.", text: "Actual size = image size {÷|×} magnification. Convert mm to µm by {×1000|÷1000}.", why: "Use the same units before dividing by magnification." }] },
  { ic: "🌿", name: "Plant cell", tasks: [
    { type: "goal", ic: "🌿", do: "Choose <b>Leaf palisade cell</b> and tap a chloroplast.", look: "Cell diagram", target: "Chloroplast selected", check: p => p.specimen === "plant" && p.selected === "chloroplast", why: "Chloroplasts contain grana and stroma for photosynthesis." },
    { type: "pick", ic: "💧", do: "Which plant structure keeps the cell turgid?", opts: ["Large central vacuole", "Ribosome", "Golgi apparatus", "Plasmid"], why: "The vacuole contains cell sap and is surrounded by the tonoplast." },
    { type: "pick", ic: "🧱", do: "What is the plant cell wall made of?", opts: ["Cellulose", "Protein only", "Starch grains", "Circular DNA"], why: "Cellulose microfibrils give the wall strength." }] },
  { ic: "⚡", name: "Ultrastructure", tasks: [
    { type: "goal", ic: "⚡", do: "Switch to <b>Electron microscope</b> and tap rough ER.", look: "Ultrastructure", target: "Rough ER selected", check: p => p.view === "em" && p.selected === "rer" && p.visible, why: "Rough ER has ribosomes on its surface for protein synthesis and transport." },
    { type: "goal", ic: "•", do: "Tap <b>ribosomes</b> in electron microscope view.", look: "Tiny dots", target: "Ribosomes visible", check: p => p.view === "em" && p.selected === "ribosome" && p.visible, why: "Ribosomes are below light microscope resolution but visible with EM." },
    { type: "pick", ic: "🔍", do: "What improves most in EM?", need: p => p.view === "em", needTxt: "Switch to Electron microscope.", opts: ["Resolution", "The cell stays alive", "Field of view always gets wider", "The specimen becomes coloured naturally"], why: "Higher resolution reveals membranes, cristae, grana and ribosomes." }] },
  { ic: "🦠", name: "Compare cells", tasks: [
    { type: "goal", ic: "🦠", do: "Choose <b>Bacterium</b> and tap the nucleoid.", look: "Bacterial cell", target: "Nucleoid selected", check: p => p.specimen === "bacterium" && p.selected === "nucleoid" && p.prokaryote, why: "A bacterium has circular DNA in a nucleoid region, not a true nucleus." },
    { type: "pick", ic: "❌", do: "Which structure is absent from bacteria?", opts: ["Nucleus with nuclear envelope", "Cell membrane", "Cytoplasm", "Ribosomes"], why: "Prokaryotes have no true nucleus and no membrane-bound organelles." },
    { type: "order", ic: "🔢", do: "Order sizes from smallest to largest.", items: ["ribosome", "bacterium", "animal cell", "palisade plant cell"], why: "Ribosomes are tiny organelles; bacteria are cells but usually much smaller than eukaryotic cells." }] }
] };
