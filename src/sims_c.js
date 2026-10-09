/* ============================================================
   5f-c. 🌸 Lab section c: Reproduction, growth and development
   Menstrual-cycle hormones + germination/growth simulations.
   ============================================================ */

Object.assign(SIM_P, {
  cycle: ["A student takes the contraceptive pill correctly. What happens to ovulation?",
    ["Ovulation is prevented because FSH and LH stay low", "Ovulation happens earlier because oestrogen is high", "The uterus lining is shed every day", "The ovary releases two eggs every cycle"],
    "The pill keeps oestrogen and progesterone high enough for negative feedback on the pituitary. FSH and LH stay low, so no LH surge and no ovulation.", "switch on the contraceptive pill and move the day slider."],
  grow: ["A soaked seed is kept with no oxygen. What will happen?",
    ["It will not germinate because respiration cannot release energy", "It will germinate faster because water is present", "It will photosynthesise before the root appears", "It will grow normally if the temperature is warm"],
    "Seeds need water, oxygen and a suitable temperature. Oxygen is needed for aerobic respiration, which releases energy for germination.", "change oxygen and count the sprouting seeds."]
});

Object.assign(SIM_Q, {
  cycle: [["What directly triggers ovulation in a normal menstrual cycle?", ["A surge in LH around day 14", "A fall in oestrogen on day 5", "High progesterone on day 1", "Menstruation removing the follicle"], "Rising oestrogen from the mature follicle leads to a sharp LH surge. The LH surge triggers ovulation."],
    ["If fertilisation occurs, why does the uterine lining stay thick?", ["The corpus luteum remains active and secretes progesterone", "FSH becomes the main pregnancy hormone", "The pituitary stops making all hormones", "Menstruation makes the lining thicker"], "Progesterone from the corpus luteum maintains the uterine lining in early pregnancy, so menstruation does not occur."]],
  grow: [["Why is dry mass a more reliable measure of plant growth than fresh mass?", ["Dry mass removes the variable water content", "Dry mass is always easier to measure in the field", "Fresh mass contains no living tissue", "Length and mass always change at the same rate"], "Fresh mass changes with water uptake and loss. Dry mass better shows how much new plant material has been made."],
    ["Why can a seedling's dry mass fall just after germination?", ["Food stores are respired before photosynthesis produces much new food", "Mineral ions leave the seed and become oxygen", "Water destroys the embryo's dry matter", "The first leaves immediately use all light energy"], "Before green leaves photosynthesise well, the embryo respires stored food. Some dry matter is lost as carbon dioxide and water."]]
});

simStyle(`
.cycle-read,.grow-read{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:8px}.cycle-read span,.grow-read span{background:#fff;border:2px solid #E8DCCD;border-radius:13px;padding:8px 10px;font-weight:800;min-width:0}.cycle-read b,.grow-read b{display:block;font-size:1.1rem;font-variant-numeric:tabular-nums}.cycle-ctl,.grow-ctl{display:grid;gap:10px}.cycle-ctl label,.grow-ctl label{display:grid;gap:5px;font-weight:800}.cycle-ctl input[type=range],.grow-ctl input[type=range]{width:100%;min-height:34px}.cycle-checks,.grow-checks{display:flex;gap:8px;flex-wrap:wrap}.cycle-checks label,.grow-checks label{display:flex;align-items:center;gap:7px;background:#fff;border:2px solid #E6DCD2;border-radius:13px;padding:8px 10px;min-height:44px}.cycle-checks input,.grow-checks input{width:18px;height:18px}.cycle-chain,.grow-chain{display:grid;gap:6px}.cycle-step,.grow-step{border:2px solid #E6DCD2;border-radius:13px;background:#fff;padding:7px 10px;font-size:.9rem;font-weight:800}.cycle-step.on,.grow-step.on{background:#FFF3C4;border-color:#F2A900;box-shadow:0 0 0 2px rgba(242,169,0,.18)}.cycle-note,.grow-note{background:#F4FAFF;border:2px dashed #BFD7EE;border-radius:14px;padding:9px 11px;font-size:.9rem}.cycle-legend,.grow-legend{display:flex;gap:7px;flex-wrap:wrap;font-size:.82rem;font-weight:800}.cycle-legend i,.grow-legend i{display:inline-block;width:14px;height:6px;border-radius:8px;margin-right:4px;vertical-align:middle}.grow-phases{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:8px}.grow-phases span{border:2px solid #D9EAD2;background:#F4FFF0;border-radius:13px;padding:7px 9px;font-size:.86rem;font-weight:800}.grow-dishes{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:8px}.grow-dishes span{background:#fff;border:2px solid #E6DCD2;border-radius:13px;padding:8px;text-align:center;font-weight:800}.grow-mini{font-size:.82rem;color:var(--ink-soft);font-weight:700}@media (prefers-reduced-motion:reduce){.cycle-step.on,.grow-step.on{box-shadow:none}}
`);

simReg({ id: "cycle", ic: "🌸", name: "Menstrual cycle hormones", sec: "3c", ord: 10, topic: "t15", fn: cycleSim,
  words: [["menstrual cycle", "🌸", "monthly cycle preparing the uterus for pregnancy"], ["ovulation", "🥚", "release of an egg from the ovary"], ["FSH", "📣", "pituitary hormone that stimulates a follicle"], ["LH", "⚡", "pituitary hormone that triggers ovulation"], ["oestrogen", "🌿", "ovary hormone that rebuilds the uterus lining"], ["progesterone", "🛡️", "hormone that maintains the uterus lining"], ["corpus luteum", "🌕", "yellow body after ovulation; secretes progesterone"], ["negative feedback", "↩️", "high hormone levels reduce hormone release"]] });
simReg({ id: "grow", ic: "🌱", name: "Germination & growth", sec: "3c", ord: 20, topic: "t15", fn: growSim,
  words: [["germination", "🌱", "a seed starts to grow into a seedling"], ["respiration", "🔥", "releases energy from food using oxygen"], ["fresh mass", "💧", "mass including water in the plant"], ["dry mass", "⚖️", "mass after water is removed"], ["sigmoid curve", "📈", "S-shaped growth curve"], ["fair test", "🧪", "change one variable; keep the others the same"], ["photosynthesis", "🍃", "plants make food using light energy"]] });

/* Cause → effect: pituitary hormones control the ovary; ovary hormones change the uterus lining and feed back to the pituitary. */
function cycleSim(root) {
  if (typeof tourEnd === "function" && typeof tourAt !== "undefined" && tourAt >= 0) tourEnd();
  const st = { day: 1, play: false, fertilised: false, pill: false };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><span class="kicker">Textbook model · 28 days</span><div id="cycleSvg" class="simsvg nozoom"></div>
      <div class="cycle-ctl"><label><span>📅 Day <b id="cycleDayLab">1</b></span><input id="cycleDay" type="range" min="1" max="28" step="1" value="1"></label>
      <div class="row simbtns"><button class="btn" id="cyclePlay">▶ Play</button><button class="btn plain" id="cycleReset">↺ Reset</button></div>
      <div class="cycle-checks"><label><input id="cycleFert" type="checkbox"> 🤰 Fertilised?</label><label><input id="cyclePill" type="checkbox"> 💊 Contraceptive pill</label></div></div></section>
    <section class="card"><h3 style="margin:0">📈 Hormones + lining</h3><div id="cycleGraph" class="simsvg nozoom"></div><div id="cycleRead" class="cycle-read"></div>
      <h3 style="margin:2px 0 0">🧠 What's happening?</h3><div id="cycleChain" class="cycle-chain"></div><p class="cycle-note" id="cycleNote"></p></section></div>`;
  const dayEl = root.querySelector("#cycleDay"), dayLab = root.querySelector("#cycleDayLab"), playBtn = root.querySelector("#cyclePlay");
  const setDay = v => { st.day = clamp(Math.round(Number(v)), 1, 28); dayEl.value = st.day; dayLab.textContent = st.day; };
  dayEl.oninput = () => { st.play = false; playBtn.textContent = "▶ Play"; setDay(dayEl.value); };
  root.querySelector("#cycleFert").onchange = e => { st.fertilised = e.target.checked; };
  root.querySelector("#cyclePill").onchange = e => { st.pill = e.target.checked; if (st.pill) st.fertilised = false; root.querySelector("#cycleFert").checked = st.fertilised; };
  playBtn.onclick = () => { SFX.tap(); st.play = !st.play; playBtn.textContent = st.play ? "⏸ Pause" : "▶ Play"; };
  root.querySelector("#cycleReset").onclick = () => { SFX.tap(); st.play = false; playBtn.textContent = "▶ Play"; root.querySelector("#cyclePill").checked = st.pill = false; root.querySelector("#cycleFert").checked = st.fertilised = false; setDay(1); };
  simProbe(() => { const m = cycleModel(st.day, st.fertilised, st.pill); return Object.assign({ day: st.day, fertilised: st.fertilised, pill: st.pill, playing: st.play }, m); });
  simLoop(root, dt => {
    if (st.play) { st._acc = (st._acc || 0) + dt * 5; if (st._acc >= 1) { st._acc = 0; setDay(st.day >= 28 ? 1 : st.day + 1); } }
    const m = cycleModel(st.day, st.fertilised, st.pill);
    root.querySelector("#cycleSvg").innerHTML = cycleSvg(st, m);
    root.querySelector("#cycleGraph").innerHTML = cycleGraphSvg(st);
    root.querySelector("#cycleRead").innerHTML = `<span>🌸 Phase<b>${esc(m.phase)}</b></span><span>📏 Lining<b>${m.lining.toFixed(1)} mm</b></span><span>⚡ LH<b>${m.LH.toFixed(0)}%</b></span><span>🛡️ Progesterone<b>${m.progesterone.toFixed(0)}%</b></span>`;
    root.querySelector("#cycleChain").innerHTML = cycleChainHtml(m);
    root.querySelector("#cycleNote").innerHTML = m.note;
  });
}
function cycleModel(day, fertilised, pill) {
  const d = Number(day), bell = (c, w, h) => h * Math.exp(-Math.pow(d - c, 2) / (2 * w * w));
  if (pill) return { FSH: 10, LH: 8, oestrogen: 72, progesterone: 72, lining: 7.6, phase: "pill: no ovulation", ovary: "quiet follicles", ovulation: false, lhSurge: false, progHigh: true, noOvulation: true, menstruation: false, step: 4, note: "💊 High oestrogen + progesterone → negative feedback to the pituitary → FSH and LH stay low → no LH surge and no ovulation." };
  let FSH = 20 + bell(3, 2.2, 23) + bell(13, 2.2, 15), LH = 12 + bell(14, .95, 88), oestrogen = 18 + bell(12, 3.4, 68) + bell(21, 5, 20), progesterone = 8 + (d > 14 ? bell(21, 4, 78) : 0);
  let lining = d <= 5 ? 2 + .22 * (d - 1) : d <= 14 ? 3 + .55 * (d - 5) : d <= 25 ? 8 + .16 * (d - 14) : Math.max(2, 10 - 2.3 * (d - 25));
  let phase = d <= 5 ? "menstruation" : d < 13 ? "follicle grows" : d <= 15 ? "ovulation" : d <= 25 ? "corpus luteum" : "luteum degenerates";
  let ovary = d < 13 ? "growing follicle" : d <= 15 ? "ovulation" : d <= 25 ? "corpus luteum" : "degenerating luteum";
  if (fertilised && d >= 18) { progesterone = Math.max(progesterone, 84); oestrogen = Math.max(oestrogen, 48); lining = Math.max(lining, 9.4); phase = "early pregnancy"; ovary = "corpus luteum maintained"; }
  const step = pill ? 4 : d <= 5 ? 0 : d < 13 ? 1 : d <= 15 ? 2 : (fertilised && d >= 18) ? 5 : d <= 25 ? 3 : 6;
  const note = fertilised && d >= 18 ? "🤰 After fertilisation, the corpus luteum is maintained in early pregnancy. Progesterone stays high, so the lining is not shed." : d >= 26 ? "No fertilisation → corpus luteum degenerates → progesterone falls → the lining begins to break down." : d <= 5 ? "Low oestrogen and progesterone → menstruation. FSH starts a new follicle growing." : d <= 14 ? "The follicle secretes oestrogen. High oestrogen near day 14 helps cause the LH surge." : "The corpus luteum secretes progesterone. Progesterone keeps the uterine lining thick and glandular.";
  return { FSH, LH, oestrogen, progesterone, lining, phase, ovary, ovulation: d >= 13 && d <= 15, lhSurge: LH > 65, progHigh: progesterone > 60, noOvulation: false, menstruation: d <= 5, step, note };
}
function cycleSvg(st, m) {
  const d = st.day, follicleR = st.pill ? 8 : d < 14 ? 8 + d * 1.15 : 7, liningH = clamp(m.lining * 6.5, 12, 74), luteum = m.ovary.includes("luteum"), ov = m.ovulation && !st.pill;
  const fols = Array.from({ length: 4 }, (_, i) => `<circle cx="${40 + i * 24}" cy="${98 - i * 5}" r="${6 + i * 2}" fill="#FFE8F0" stroke="${CO}" stroke-width="1.5"/>`).join("");
  return `<svg viewBox="0 0 360 440" role="img" aria-label="Menstrual cycle day ${d}: ovary follicle changes and uterus lining thickness ${m.lining.toFixed(1)} millimetres">
    <defs><marker id="cyArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="#7A6A66"/></marker><radialGradient id="cyFol"><stop offset="0" stop-color="#FFF8C8"/><stop offset="1" stop-color="#F8BBD0"/></radialGradient></defs>
    <rect width="360" height="440" rx="18" fill="#FFF8FC"/>
    <g transform="translate(18 34)"><rect x="0" y="0" width="126" height="56" rx="16" fill="#E9F4FF" stroke="${CO}" stroke-width="2.5"/><text x="63" y="20" text-anchor="middle" font-size="13" font-weight="900" fill="${CO}">Pituitary</text><text x="63" y="42" text-anchor="middle" font-size="11" font-weight="800" fill="#2D5F99">FSH ${m.FSH.toFixed(0)} · LH ${m.LH.toFixed(0)}</text></g>
    <g transform="translate(202 22)"><ellipse cx="70" cy="78" rx="68" ry="48" fill="#FFE8F0" stroke="${CO}" stroke-width="2.5"/><text x="70" y="15" text-anchor="middle" font-size="14" font-weight="900" fill="${CO}">Ovary</text>${luteum ? `<circle cx="70" cy="78" r="27" fill="#FFD35A" stroke="${CO}" stroke-width="2.5"/><path d="M55 72 q15 -15 32 0 q-7 22 -32 24" fill="#FFB74D" opacity=".7"/><text x="70" y="134" text-anchor="middle" font-size="11" font-weight="900" fill="${CO}">${m.ovary}</text>` : `${fols}<circle cx="74" cy="76" r="${follicleR}" fill="url(#cyFol)" stroke="${CO}" stroke-width="2.5"/><circle cx="74" cy="76" r="4.5" fill="#fff" stroke="${CO}" stroke-width="1.6"/>${ov ? `<circle cx="120" cy="75" r="8" fill="#fff" stroke="#D2455F" stroke-width="2"/><path d="M92 76 C110 58 132 64 134 82" fill="none" stroke="#D2455F" stroke-width="2"/><text x="78" y="134" text-anchor="middle" font-size="12" font-weight="900" fill="#D2455F">ovulation</text>` : `<text x="76" y="134" text-anchor="middle" font-size="11" font-weight="900" fill="${CO}">${m.ovary}</text>`}`}</g>
    <path d="M146 66 C180 48 202 48 230 66" fill="none" stroke="#5B8FE0" stroke-width="3" marker-end="url(#cyArr)"/><text x="187" y="43" text-anchor="middle" font-size="10" font-weight="900" fill="#2D5F99">FSH + LH</text>
    <path d="M232 112 C188 145 146 132 118 92" fill="none" stroke="#B36AD8" stroke-width="3" marker-end="url(#cyArr)"/><text x="180" y="146" text-anchor="middle" font-size="10" font-weight="900" fill="#7A3CA0">ovary hormones feed back</text>
    <g transform="translate(82 196)"><path d="M78 16 C44 46 36 105 56 148 C68 174 116 174 128 148 C148 105 140 46 106 16 C96 8 88 8 78 16Z" fill="#FFE4E8" stroke="${CO}" stroke-width="2.5"/><path d="M63 ${154 - liningH} C78 ${140 - liningH} 106 ${140 - liningH} 121 ${154 - liningH} L121 146 C104 162 80 162 63 146Z" fill="#E9577D" opacity=".82" stroke="#B83255" stroke-width="2"/><text x="92" y="188" text-anchor="middle" font-size="13" font-weight="900" fill="${CO}">Uterus lining</text><text x="92" y="208" text-anchor="middle" font-size="13" font-weight="900" fill="#B83255">${m.lining.toFixed(1)} mm</text></g>
    <g transform="translate(18 322)"><circle cx="38" cy="38" r="34" fill="#fff" stroke="${CO}" stroke-width="2.5"/><text x="38" y="35" text-anchor="middle" font-size="13" font-weight="900" fill="${CO}">Day</text><text x="38" y="58" text-anchor="middle" font-size="26" font-weight="900" fill="#D2455F">${d}</text></g>
    <text x="342" y="418" text-anchor="end" font-size="11" font-weight="800" fill="#7A6A66">follicle → ovulation → corpus luteum</text>
  </svg>`;
}
function cycleGraphSvg(st) {
  const X = d => 36 + (d - 1) / 27 * 294, Y = v => 168 - v / 100 * 132, cursor = X(st.day);
  const line = (k, col) => `<polyline points="${Array.from({ length: 28 }, (_, i) => { const m = cycleModel(i + 1, st.fertilised, st.pill); return `${X(i + 1).toFixed(1)},${Y(m[k]).toFixed(1)}`; }).join(" ")}" fill="none" stroke="${col}" stroke-width="3" stroke-linejoin="round"/>`;
  return `<svg viewBox="0 0 360 224" role="img" aria-label="Graph of FSH, LH, oestrogen and progesterone levels with cursor on day ${st.day}"><rect width="360" height="224" rx="14" fill="#fff"/><path d="M36 34 V168 H330" stroke="${CO}" stroke-width="2.5" fill="none"/>${[25,50,75,100].map(v=>`<line x1="36" x2="330" y1="${Y(v)}" y2="${Y(v)}" stroke="#E9E1DA"/><text x="31" y="${Y(v)+4}" text-anchor="end" font-size="14" fill="#7A6A66">${v}</text>`).join("")}${[1,7,14,21,28].map(d=>`<text x="${X(d)}" y="194" text-anchor="middle" font-size="14" font-weight="800" fill="#7A6A66">${d}</text>`).join("")}<text x="190" y="215" text-anchor="middle" font-size="14" font-weight="800" fill="#7A6A66">day of cycle →</text>${line("FSH","#2D8ED6")}${line("LH","#E63B55")}${line("oestrogen","#3FA06B")}${line("progesterone","#8E5BD6")}<line x1="${cursor}" x2="${cursor}" y1="28" y2="172" stroke="${CO}" stroke-width="3" stroke-dasharray="5 4"/><circle cx="${cursor}" cy="${Y(cycleModel(st.day,st.fertilised,st.pill).LH)}" r="5" fill="#E63B55" stroke="#fff" stroke-width="2"/></svg>`;
}

function cycleChainHtml(m) {
  const rows = ["🧠 Pituitary sends FSH/LH", "🌸 Ovary changes: " + m.ovary, "📣 Ovary hormones feed back", "🏠 Uterine lining: " + m.lining.toFixed(1) + " mm", "✅ Result: " + m.phase];
  return rows.map((r, i) => `<div class="cycle-step ${i === m.step || (m.step > 4 && i === 4) ? "on" : ""}">${esc(r)}</div>`).join("");
}

/* Cause → effect: water + oxygen + suitable temperature allow respiration, so seeds germinate; growth measurements then follow a sigmoid curve. */
function growSim(root) {
  if (typeof tourEnd === "function" && typeof tourAt !== "undefined" && tourAt >= 0) tourEnd();
  const st = { water: "moist", oxygen: "air", temp: 25, day: 0, play: false, plot: "dry" };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><span class="kicker">Fair test · change one variable</span><div id="growSvg" class="simsvg nozoom"></div>
      <div class="grow-ctl"><div><b>💧 Water</b>${segBtns("gw", [["dry","Dry"],["moist","Moist"],["flooded","Flooded"]], st.water)}</div><div><b>🫧 Oxygen</b>${segBtns("go", [["air","Air"],["none","No oxygen"]], st.oxygen)}</div><div><b>🌡️ Temperature</b>${segBtns("gt", [[5,"5 °C"],[25,"25 °C"],[45,"45 °C"]], String(st.temp))}</div><label><span>📅 Growth day <b id="growDayLab">0</b></span><input id="growDay" type="range" min="0" max="14" step="1" value="0"></label><div class="row simbtns"><button class="btn" id="growPlay">▶ Play</button><button class="btn plain" id="growReset">↺ Reset</button></div></div></section>
    <section class="card"><h3 style="margin:0">📈 Plot and compare</h3><div>${segBtns("gp", [["fresh","💧 Fresh mass"],["dry","⚖️ Dry mass"],["length","📏 Length"]], st.plot)}</div><div id="growGraph" class="simsvg nozoom"></div><div id="growRead" class="grow-read"></div><div class="grow-note"><b>⚖️ Dry mass is most reliable:</b> drying removes variable water content, so it better shows new biomass.</div><h3 style="margin:2px 0 0">🧠 What's happening?</h3><div id="growChain" class="grow-chain"></div></section></div>
    <section class="card"><h3 style="margin:0">📈 Sigmoid growth phases</h3><div class="grow-phases"><span>1️⃣ Lag: cells activate</span><span>2️⃣ Fast: mitosis + elongation</span><span>3️⃣ Slow: limits increase</span><span>4️⃣ Plateau: little net growth</span></div></section>`;
  const setDay = v => { st.day = clamp(Math.round(Number(v)), 0, 14); root.querySelector("#growDay").value = st.day; root.querySelector("#growDayLab").textContent = st.day; };
  root.querySelector("#growDay").oninput = e => { st.play = false; root.querySelector("#growPlay").textContent = "▶ Play"; setDay(e.target.value); };
  root.querySelectorAll("[data-gw]").forEach(b => b.onclick = () => { SFX.tap(); st.water = b.dataset.gw; root.querySelectorAll("[data-gw]").forEach(x => x.setAttribute("aria-checked", x === b)); });
  root.querySelectorAll("[data-go]").forEach(b => b.onclick = () => { SFX.tap(); st.oxygen = b.dataset.go; root.querySelectorAll("[data-go]").forEach(x => x.setAttribute("aria-checked", x === b)); });
  root.querySelectorAll("[data-gt]").forEach(b => b.onclick = () => { SFX.tap(); st.temp = Number(b.dataset.gt); root.querySelectorAll("[data-gt]").forEach(x => x.setAttribute("aria-checked", x === b)); });
  root.querySelectorAll("[data-gp]").forEach(b => b.onclick = () => { SFX.tap(); st.plot = b.dataset.gp; root.querySelectorAll("[data-gp]").forEach(x => x.setAttribute("aria-checked", x === b)); });
  root.querySelector("#growPlay").onclick = () => { SFX.tap(); st.play = !st.play; root.querySelector("#growPlay").textContent = st.play ? "⏸ Pause" : "▶ Play"; };
  root.querySelector("#growReset").onclick = () => {
    SFX.tap(); Object.assign(st, { water: "moist", oxygen: "air", temp: 25, play: false, plot: "dry", _acc: 0 }); setDay(0);
    root.querySelector("#growPlay").textContent = "▶ Play";
    root.querySelectorAll("[data-gw]").forEach(x => x.setAttribute("aria-checked", x.dataset.gw === "moist"));
    root.querySelectorAll("[data-go]").forEach(x => x.setAttribute("aria-checked", x.dataset.go === "air"));
    root.querySelectorAll("[data-gt]").forEach(x => x.setAttribute("aria-checked", x.dataset.gt === "25"));
    root.querySelectorAll("[data-gp]").forEach(x => x.setAttribute("aria-checked", x.dataset.gp === "dry"));
  };
  simProbe(() => Object.assign({ water: st.water, oxygen: st.oxygen, temp: st.temp, day: st.day, plot: st.plot, playing: st.play }, growModel(st)));
  simLoop(root, dt => {
    if (st.play) { st._acc = (st._acc || 0) + dt * 3; if (st._acc >= 1) { st._acc = 0; setDay(st.day >= 14 ? 0 : st.day + 1); } }
    const m = growModel(st);
    root.querySelector("#growSvg").innerHTML = growSvg(st, m);
    root.querySelector("#growGraph").innerHTML = growGraphSvg(st);
    root.querySelector("#growRead").innerHTML = `<span>🌱 Germinated<b>${m.germinated}/10</b></span><span>💧 Fresh mass<b>${m.freshMass.toFixed(1)} g</b></span><span>⚖️ Dry mass<b>${m.dryMass.toFixed(2)} g</b></span><span>📏 Length<b>${m.length.toFixed(1)} cm</b></span>`;
    root.querySelector("#growChain").innerHTML = growChainHtml(m);
  });
}
function growModel(st) {
  const wF = st.water === "dry" ? 0 : st.water === "flooded" ? .45 : 1, oF = st.oxygen === "none" ? 0 : 1, tF = st.temp === 5 ? .28 : st.temp === 25 ? 1 : 0;
  const germFrac = Math.min(wF, oF, tF), germinated = Math.round(10 * germFrac), d = Number(st.day), active = germFrac > 0;
  const g = active ? 1 / (1 + Math.exp(-.62 * (d - 7))) : 0, leaf = active && d >= 5;
  const dryDip = active ? .28 * Math.min(d, 4) / 4 : 0, photoGain = d >= 5 ? germFrac * 3.2 * g : 0, dryMass = +(1 - dryDip + photoGain).toFixed(2);
  const freshMass = +(1.1 + (st.water !== "dry" ? .55 * Math.min(d, 2) : 0) + germFrac * 6.2 * g).toFixed(1), length = +(germFrac * 12.5 * g).toFixed(1);
  const status = germinated >= 8 ? "most germinate" : germinated === 0 ? "no germination" : "slow or few";
  const reason = st.water === "dry" ? "No water → enzymes cannot work and the seed cannot swell." : st.oxygen === "none" ? "No oxygen → aerobic respiration cannot release enough energy." : st.temp === 45 ? "Too hot → enzymes are denatured." : st.temp === 5 ? "Cold → enzyme-controlled reactions are slow." : st.water === "flooded" ? "Flooding leaves less oxygen around seeds, so fewer germinate." : "Water + oxygen + suitable temperature → respiration releases energy for germination.";
  const phase = !active ? "not growing" : d < 3 ? "lag" : d < 9 ? "rapid growth" : d < 13 ? "slowing" : "plateau";
  return { germinated, germFrac, freshMass, dryMass, length, status, reason, leaf, phase, dryDip: dryDip > .1, sigmoid: phase };
}
function growSvg(st, m) {
  const h = clamp(m.length * 10, 0, 116), show = m.germinated > 0;
  const miniSeeds = Array.from({ length: 10 }, (_, i) => { const x = 34 + (i % 5) * 28, y = 50 + Math.floor(i / 5) * 28, on = i < m.germinated; return `<g><ellipse cx="${x}" cy="${y}" rx="9" ry="6" fill="#B9854D" stroke="${CO}" stroke-width="1.4" transform="rotate(${-20 + i * 9} ${x} ${y})"/>${on ? `<path d="M${x + 6} ${y - 2} q12 -11 25 -${11 + h * .13}" fill="none" stroke="#4C9A5A" stroke-width="2.6" stroke-linecap="round"/>` : ""}</g>`; }).join("");
  const seedling = show ? `<g transform="translate(232 342)">
      <ellipse cx="-24" cy="0" rx="31" ry="18" fill="#D3A060" stroke="${CO}" stroke-width="2.2"/><ellipse cx="22" cy="-2" rx="29" ry="18" fill="#C99250" stroke="${CO}" stroke-width="2.2"/><path d="M-2 -8 C4 -42 10 -${70 + h * .45} 22 -${96 + h}" stroke="#3FA06B" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M18 -${72 + h * .65} C56 -${91 + h * .75} 70 -${58 + h * .55} 32 -${57 + h * .55}Z" fill="#80CE72" stroke="${CO}" stroke-width="2"/><path d="M12 -${55 + h * .45} C-24 -${72 + h * .55} -42 -${43 + h * .4} -8 -${39 + h * .36}Z" fill="#91D982" stroke="${CO}" stroke-width="2"/>
      <path d="M-4 6 q-20 20 -48 28 M0 8 q25 16 52 24 M-4 6 q4 28 2 54" stroke="#D9B26F" stroke-width="4" fill="none" stroke-linecap="round"/>
      <g font-size="11" font-weight="900" fill="${CO}"><text x="-58" y="-10">cotyledons</text><text x="34" y="-${86 + h}" >plumule</text><text x="-58" y="58">radicle</text><text x="-56" y="22">testa</text><text x="74" y="24" text-anchor="middle">day ${st.day}</text></g>
    </g>` : `<g transform="translate(232 318)"><ellipse cx="0" cy="0" rx="48" ry="25" fill="#C99250" stroke="${CO}" stroke-width="2.5"/><text x="0" y="48" text-anchor="middle" font-size="13" font-weight="900" fill="#B83255">day ${st.day}: no seedling yet</text></g>`;
  return `<svg viewBox="0 0 360 450" role="img" aria-label="Germinating seed showing testa, cotyledons, radicle and plumule; ${m.germinated} of 10 seeds germinated"><rect width="360" height="450" rx="18" fill="#F7FFF3"/>
    <g transform="translate(18 28)"><ellipse cx="86" cy="64" rx="86" ry="54" fill="#EAF6FF" stroke="${CO}" stroke-width="2.5"/><ellipse cx="86" cy="64" rx="72" ry="40" fill="${st.water === "dry" ? "#F1E1C5" : st.water === "flooded" ? "#BFE8FF" : "#DDF4DD"}" opacity=".95"/>${miniSeeds}<text x="86" y="136" text-anchor="middle" font-size="12" font-weight="900" fill="${CO}">Dish: ${m.germinated}/10 germinate</text></g>
    <g transform="translate(0 0)">${seedling}</g>
    <g font-size="12" font-weight="900" fill="${CO}"><text x="18" y="424">💧 ${st.water}</text><text x="104" y="424">🫧 ${st.oxygen === "air" ? "oxygen" : "no oxygen"}</text><text x="222" y="424">🌡️ ${st.temp} °C</text><text x="338" y="444" text-anchor="end">${m.status}</text></g>
  </svg>`;
}
function growGraphSvg(st) {
  const cfg = { fresh: ["Fresh mass", "g", "#2D8ED6", 8], dry: ["Dry mass", "g", "#8E5BD6", 4.5], length: ["Length", "cm", "#3FA06B", 13] }[st.plot], X = d => 42 + d / 14 * 278, Y = v => 154 - v / cfg[3] * 124;
  const val = (d, ideal) => growModel(Object.assign({}, st, { day: d, water: ideal ? "moist" : st.water, oxygen: ideal ? "air" : st.oxygen, temp: ideal ? 25 : st.temp }))[st.plot === "fresh" ? "freshMass" : st.plot === "dry" ? "dryMass" : "length"];
  const pts = ideal => Array.from({ length: 15 }, (_, d) => `${X(d).toFixed(1)},${Y(val(d, ideal)).toFixed(1)}`).join(" ");
  const now = growModel(st), v = now[st.plot === "fresh" ? "freshMass" : st.plot === "dry" ? "dryMass" : "length"], cx = X(st.day), cy = Y(v);
  return `<svg viewBox="0 0 340 188" role="img" aria-label="Graph of ${cfg[0]} against days"><rect width="340" height="188" rx="14" fill="#fff"/><path d="M42 24 V154 H320" stroke="${CO}" stroke-width="2.5" fill="none"/><polyline points="${pts(true)}" fill="none" stroke="#B9B2AA" stroke-width="3" stroke-dasharray="6 5"/><polyline points="${pts(false)}" fill="none" stroke="${cfg[2]}" stroke-width="3.5" stroke-linejoin="round"/><line x1="${cx}" x2="${cx}" y1="20" y2="158" stroke="${CO}" stroke-width="2.5" stroke-dasharray="4 4"/><circle cx="${cx}" cy="${cy}" r="6" fill="${cfg[2]}" stroke="#fff" stroke-width="2"/><text x="318" y="22" text-anchor="end" font-size="10" font-weight="900" fill="#7A6A66">dashed = ideal</text><text x="180" y="181" text-anchor="middle" font-size="11" font-weight="800" fill="#7A6A66">days after soaking →</text><text x="12" y="92" text-anchor="middle" font-size="11" font-weight="800" fill="#7A6A66" transform="rotate(-90 12 92)">${cfg[0]} (${cfg[1]})</text></svg>`;
}
function growChainHtml(m) {
  const rows = ["💧 Water activates enzymes", "🫧 Oxygen allows respiration", "🌡️ Suitable temperature keeps enzymes working", "🔥 Food store respired: dry mass may dip", "🍃 Leaves photosynthesise: growth rises", "📈 Phase: " + m.phase];
  const on = m.germinated === 0 ? (m.reason.startsWith("No water") ? 0 : m.reason.startsWith("No oxygen") ? 1 : 2) : m.dryDip ? 3 : m.leaf ? 4 : 5;
  return rows.map((r, i) => `<div class="grow-step ${i === on || (i === 5 && m.germinated) ? "on" : ""}">${esc(r)}</div>`).join("") + `<p class="grow-mini">${esc(m.reason)}</p>`;
}

SIM_CH.cycle = { title: "Hormone Cycle Detective", mins: 15, story: "Use the hormone graph to explain ovulation, menstruation, pregnancy and the contraceptive pill.", missions: [
  { ic: "🌸", name: "Explore", tasks: [
    { type: "goal", ic: "📅", do: "Set <b>📅 Day</b> to 14 with no pill.", look: "📈 Hormone graph", target: "Day 14, LH surge", check: p => p.day === 14 && !p.pill && p.lhSurge, meter: p => ({ v: p.LH, min: 0, max: 100, lo: 65, hi: 100, unit: "%", label: "LH" }), hold: .3, why: "Around day 14, LH rises sharply. This LH surge triggers ovulation." },
    { type: "pick", ic: "⚡", do: "Choose the hormone that surges at <b>ovulation</b>.", look: "Red line on the graph", opts: [["LH", "⚡"], ["Progesterone", "🛡️"], ["FSH", "📣"], ["Dry mass", "⚖️"]], miss: ["", "Progesterone rises after ovulation from the corpus luteum.", "FSH helps follicles grow, but LH is the sharp ovulation trigger.", "Dry mass is a plant growth measurement, not a hormone."], why: "LH surge → ovulation." },
    { type: "goal", ic: "💊", do: "Switch on <b>💊 Contraceptive pill</b>.", look: "Pituitary → ovary arrows", target: "FSH and LH low", check: p => p.pill && p.noOvulation && p.FSH < 20 && p.LH < 20, hold: .3, why: "High oestrogen and progesterone give negative feedback, keeping FSH and LH low." }] },
  { ic: "📏", name: "Measure", tasks: [
    { type: "goal", ic: "🩸", do: "Turn pill off. Set <b>📅 Day</b> to 1.", look: "Uterine lining", target: "Menstruation, thin lining", check: p => !p.pill && p.day === 1 && p.menstruation, meter: p => ({ v: p.lining, min: 0, max: 11, lo: 1.5, hi: 3, unit: " mm", label: "Lining" }), hold: .3, why: "Low ovarian hormones at the start cause the lining to break down." },
    { type: "read", ic: "📏", do: "Read the <b>uterine lining</b> thickness on day 1.", look: "Readout under the graph", need: p => p.day === 1 && !p.pill, needTxt: "📅 Day 1, 💊 pill off.", fields: [["Lining thickness", p => p.lining, .4, "mm"]], hint: "Look for the 📏 Lining readout.", why: "The lining is thin during menstruation." },
    { type: "goal", ic: "🛡️", do: "Set <b>📅 Day</b> to 21 with no fertilisation.", look: "Purple progesterone line", target: "Progesterone high", check: p => !p.pill && !p.fertilised && p.day === 21 && p.progHigh, meter: p => ({ v: p.progesterone, min: 0, max: 100, lo: 60, hi: 100, unit: "%", label: "Progesterone" }), hold: .3, why: "The corpus luteum secretes progesterone after ovulation." },
    { type: "read", ic: "🔢", do: "Read progesterone and lining on day 21.", look: "Readout under the graph", need: p => p.day === 21 && !p.pill && !p.fertilised, needTxt: "📅 Day 21, 🤰 fertilised off.", fields: [["Progesterone", p => p.progesterone, 4, "%"], ["Lining", p => p.lining, .6, "mm"]], hint: "Use the 🛡️ and 📏 readouts.", why: "High progesterone maintains a thick lining." }] },
  { ic: "🤰", name: "Investigate", tasks: [
    { type: "goal", ic: "🤰", do: "Tick <b>🤰 Fertilised?</b> and set <b>📅 Day</b> to 26.", look: "Ovary + progesterone line", target: "Corpus luteum maintained", check: p => p.fertilised && !p.pill && p.day === 26 && p.progesterone > 75 && p.lining > 9, meter: p => ({ v: p.progesterone, min: 0, max: 100, lo: 75, hi: 100, unit: "%", label: "Progesterone" }), hold: .3, why: "In early pregnancy the corpus luteum remains active, so progesterone stays high." },
    { type: "read", ic: "📏", do: "Read progesterone on day 26 after fertilisation.", look: "Readout under the graph", need: p => p.fertilised && p.day === 26 && !p.pill, needTxt: "🤰 fertilised on, 📅 Day 26.", fields: [["Progesterone", p => p.progesterone, 4, "%"]], hint: "Look for 🛡️ Progesterone.", why: "Progesterone stays high, so menstruation does not happen." },
    { type: "pick", ic: "🩸", do: "Why is there no menstruation after fertilisation?", look: "Uterine lining + corpus luteum", opts: ["Progesterone stays high and maintains the lining", "LH stays high and sheds the lining", "FSH digests the uterine lining", "The egg becomes the lining"], miss: ["", "LH triggers ovulation; it does not maintain the lining.", "FSH stimulates follicle growth, not digestion of the lining.", "The embryo implants in the lining; it does not become the lining."], why: "Corpus luteum → progesterone high → lining maintained." }] },
  { ic: "✍️", name: "Explain", tasks: [
    { type: "order", ic: "🔢", do: "Put the normal cycle steps in order.", look: "Ovary diagram", items: ["FSH stimulates a follicle to grow", "The follicle secretes oestrogen", "An LH surge triggers ovulation", "The corpus luteum secretes progesterone", "If no fertilisation, progesterone falls and menstruation starts"], why: "This is the hormone control sequence for a normal cycle." },
    { type: "fill", ic: "💊", do: "Complete the pill sentence.", text: "The contraceptive pill keeps {oestrogen and progesterone|FSH and LH|blood glucose} high, so negative feedback keeps {FSH and LH|progesterone only} low and prevents {ovulation|menstruation only}.", why: "High ovarian hormones suppress pituitary FSH/LH, so there is no LH surge." },
    { type: "pick", ic: "↩️", do: "What is <b>negative feedback</b> here?", opts: ["Ovary hormones reduce pituitary FSH and LH release", "Pituitary hormones destroy the ovary", "The uterus controls the pituitary by nerves", "LH makes progesterone fall immediately"], miss: ["", "The ovary is not destroyed; hormone levels change.", "This simulation shows hormonal feedback, not a nerve reflex.", "LH helps ovulation; progesterone rises after ovulation."], why: "Oestrogen/progesterone feed back to the pituitary and reduce FSH/LH release." },
    { type: "read", ic: "⚡", do: "Check LH on the pill.", look: "Readout after switching on pill", need: p => p.pill, needTxt: "💊 Contraceptive pill on.", fields: [["LH on pill", p => p.LH, 2, "%"]], hint: "Use the ⚡ LH readout.", why: "LH is low on the pill, so ovulation is prevented." }] }
] };

SIM_CH.grow = { title: "Seed Growth Detective", mins: 15, story: "Run fair tests, measure seedling growth, and decide which measurement is most reliable.", missions: [
  { ic: "🌱", name: "Explore", tasks: [
    { type: "goal", ic: "✅", do: "Set <b>💧 Water</b> moist, <b>🫧 Oxygen</b> air, and <b>🌡️ Temperature</b> 25 °C.", look: "Seed dish", target: "Best germination", check: p => p.water === "moist" && p.oxygen === "air" && p.temp === 25 && p.germinated >= 8, meter: p => ({ v: p.germinated, min: 0, max: 10, lo: 8, hi: 10, unit: "/10", label: "Seeds" }), hold: .3, why: "Seeds need water, oxygen and a suitable temperature to germinate well." },
    { type: "goal", ic: "📅", do: "Move <b>📅 Growth day</b> to 4.", look: "Seed dish", target: "Sprouting seeds", check: p => p.day === 4 && p.germinated >= 8, meter: p => ({ v: p.day, min: 0, max: 14, lo: 4, hi: 4, unit: " d", label: "Day" }), hold: .3, why: "By day 4, many seeds have germinated under suitable conditions." },
    { type: "read", ic: "🔢", do: "Count the germinated seeds.", look: "🌱 Germinated readout", fields: [["Germinated seeds", p => p.germinated, 0, "/10"]], hint: "Use the 🌱 Germinated readout.", why: "A good set-up gives about 9–10 germinated seeds out of 10." },
    { type: "goal", ic: "💧", do: "Change only <b>💧 Water</b> to dry.", look: "Seed dish", target: "No germination", check: p => p.water === "dry" && p.oxygen === "air" && p.temp === 25 && p.germinated <= 1, meter: p => ({ v: p.germinated, min: 0, max: 10, lo: 0, hi: 1, unit: "/10", label: "Seeds" }), hold: .3, why: "Without water, enzymes cannot work and the seed cannot swell." }] },
  { ic: "🧪", name: "Fair test", tasks: [
    { type: "goal", ic: "🫧", do: "Change only <b>🫧 Oxygen</b> to no oxygen.", look: "What's happening?", target: "No oxygen", check: p => p.water === "moist" && p.oxygen === "none" && p.temp === 25 && p.germinated === 0, meter: p => ({ v: p.germinated, min: 0, max: 10, lo: 0, hi: 0, unit: "/10", label: "Seeds" }), hold: .3, why: "No oxygen means aerobic respiration cannot release enough energy for germination." },
    { type: "pick", ic: "⚖️", do: "Why is this a <b>fair test</b> for oxygen?", opts: ["Only oxygen changed; water and temperature stayed the same", "All three variables changed together", "The seeds were counted before changing oxygen", "Fair tests do not need a control"], miss: ["", "Changing many variables means you cannot know the cause.", "The count is useful, but fairness is about controlling variables.", "A control or comparison helps you judge the effect."], why: "Change one independent variable and keep the others constant." },
    { type: "goal", ic: "❄️", do: "Set <b>🌡️ Temperature</b> to 5 °C with moist air.", look: "Seed dish", target: "Cold, slow germination", check: p => p.water === "moist" && p.oxygen === "air" && p.temp === 5 && p.germinated <= 3, meter: p => ({ v: p.germinated, min: 0, max: 10, lo: 0, hi: 3, unit: "/10", label: "Seeds" }), hold: .3, why: "Low temperature slows enzyme-controlled reactions, so fewer seeds germinate in the same time." },
    { type: "read", ic: "🔢", do: "Read germinated seeds at 5 °C.", look: "🌱 Germinated readout", need: p => p.water === "moist" && p.oxygen === "air" && p.temp === 5, needTxt: "💧 Moist, 🫧 air, 🌡️ 5 °C.", fields: [["Germinated seeds", p => p.germinated, 0, "/10"]], hint: "Look under the graph for the germinated count.", why: "Cold conditions give slow or few germinations." }] },
  { ic: "📈", name: "Measure", tasks: [
    { type: "goal", ic: "⚖️", do: "Return to 25 °C. Choose <b>⚖️ Dry mass</b> and day 3.", look: "Graph", target: "Early dry-mass dip", check: p => p.water === "moist" && p.oxygen === "air" && p.temp === 25 && p.plot === "dry" && p.day === 3 && p.dryMass < 1, meter: p => ({ v: p.dryMass, min: .6, max: 4.5, lo: .65, hi: .99, unit: " g", label: "Dry mass" }), hold: .3, why: "Early dry mass falls because stored food is respired before photosynthesis is strong." },
    { type: "read", ic: "⚖️", do: "Read dry mass on day 3.", look: "⚖️ Dry mass readout", need: p => p.plot === "dry" && p.day === 3 && p.temp === 25 && p.oxygen === "air" && p.water === "moist", needTxt: "⚖️ Dry mass, day 3, suitable conditions.", fields: [["Dry mass", p => p.dryMass, .08, "g"]], hint: "Use the ⚖️ Dry mass readout.", why: "It is below the starting value because respiration used food stores." },
    { type: "goal", ic: "🍃", do: "Move <b>📅 Growth day</b> to 10.", look: "Seedling and graph", target: "Dry mass rising", check: p => p.water === "moist" && p.oxygen === "air" && p.temp === 25 && p.plot === "dry" && p.day === 10 && p.dryMass > 2.5, meter: p => ({ v: p.dryMass, min: .6, max: 4.5, lo: 2.5, hi: 4.5, unit: " g", label: "Dry mass" }), hold: .3, why: "After leaves form, photosynthesis adds new dry matter." },
    { type: "read", ic: "📏", do: "Read dry mass and length on day 10.", look: "Readouts", need: p => p.day === 10 && p.water === "moist" && p.oxygen === "air" && p.temp === 25, needTxt: "Day 10 with suitable conditions.", fields: [["Dry mass", p => p.dryMass, .12, "g"], ["Length", p => p.length, .5, "cm"]], hint: "Use ⚖️ Dry mass and 📏 Length readouts.", why: "Both are higher after rapid growth begins." }] },
  { ic: "✍️", name: "Explain", tasks: [
    { type: "fill", ic: "🔥", do: "Complete the dry-mass sentence.", text: "At first, dry mass {falls|rises|stays the same} because stored food is {respired|absorbed from soil|changed into water}. Later, photosynthesis makes it {rise|fall}.", why: "Respiration uses stored food first; later photosynthesis makes new biomass." },
    { type: "pick", ic: "⚖️", do: "Which growth measure is most reliable?", opts: ["Dry mass, because water content is removed", "Fresh mass, because it includes all water", "Length, because all seedlings are straight", "Number of leaves only, because mass is never useful"], miss: ["", "Fresh mass changes if the plant takes up or loses water.", "Length can miss widening and branching.", "Leaf number is useful, but it is not a complete measure of biomass."], why: "Dry mass is less affected by water content, so it is more reliable for biomass." },
    { type: "order", ic: "📈", do: "Order the <b>sigmoid curve</b> phases.", items: ["Lag phase: enzymes activate and cells prepare", "Rapid growth: mitosis and cell elongation", "Growth slows as resources become limiting", "Plateau: little net increase"], why: "Growth commonly follows an S-shaped sigmoid curve: lag → rapid → slowing → plateau." }] }
] };
