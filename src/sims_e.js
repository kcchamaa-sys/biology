/* ============================================================
   5f-e. ⚖️ Lab section e: Homeostasis
   Blood glucose and breathing control: negative feedback loops.
   ============================================================ */

Object.assign(SIM_Q, {
  glucose: [["After a meal, which negative-feedback response lowers blood glucose?", ["β cells secrete insulin; liver and muscles store glucose as glycogen", "α cells secrete glucagon; liver breaks down glycogen", "The breathing centre sends impulses to the diaphragm", "The kidney makes more glucose"], "High blood glucose is detected by pancreatic β cells. Insulin makes body cells take up glucose and liver/muscles store it as glycogen."],
    ["In untreated type 1 diabetes, why does blood glucose stay high after a meal?", ["Little or no insulin is secreted, so cells take up less glucose", "Too much glucagon stores glucose as glycogen", "The liver cannot store glycogen when insulin is high", "The medulla oblongata stops the pancreas"], "Type 1 diabetes destroys β cells, so insulin is missing. Insulin treatment replaces the missing hormone."]],
  co2: [["What is the main stimulus that increases breathing rate during exercise?", ["A rise in carbon dioxide in the blood", "A small fall in nitrogen in the air", "A rise in blood glucose", "A fall in blood starch"], "CO₂ is the main breathing stimulus. Low O₂ can contribute, but it is usually a smaller effect."],
    ["Which pathway is correct when blood CO₂ rises?", ["Chemoreceptors → medulla breathing centre → intercostal muscles and diaphragm → faster, deeper breathing", "Diaphragm → medulla → chemoreceptors → less breathing", "Liver → pancreas → lungs → glycogen", "Cerebrum → stomach → ribs → slower breathing"], "Chemoreceptors in the medulla, aortic bodies and carotid bodies detect the change; the medulla sends impulses to breathing muscles."]]
});
Object.assign(SIM_P, {
  glucose: ["You eat a bowl of rice. What should happen to blood glucose in a healthy person?", ["It rises, insulin rises, then it returns towards normal", "It falls at once because glucagon is released", "It stays high all day because feedback cannot stop it", "It becomes zero because cells use all glucose"], "A meal raises blood glucose. Insulin then brings it back towards the normal range.", "tap 🍚 Eat meal and press ▶ Run."],
  co2: ["You start running. What happens to breathing control?", ["CO₂ rises, chemoreceptors light up, and breathing becomes faster and deeper", "O₂ rises and switches breathing off", "CO₂ falls, so breathing stops", "Only the heart is involved; breathing does not change"], "Working muscles produce more CO₂. Negative feedback increases ventilation to remove it.", "tap 🏃 Exercise and press ▶ Run."]
});

simReg({ id: "glucose", ic: "🍬", name: "Blood glucose control", sec: "3e", ord: 10, topic: "t17", fn: glucoseSim,
  words: [["homeostasis", "⚖️", "keeping internal conditions steady"], ["negative feedback", "🔁", "a response reverses a change"], ["insulin", "🔵", "hormone that lowers blood glucose"], ["glucagon", "🟠", "hormone that raises blood glucose"], ["pancreas", "🟡", "organ with islets that make hormones"], ["glycogen", "📦", "stored glucose in liver and muscles"], ["diabetes", "⚠️", "blood glucose control problem"]] });
simReg({ id: "co2", ic: "🏔️", name: "Breathing control (CO₂)", sec: "3e", ord: 20, topic: "t17", fn: co2Sim,
  words: [["homeostasis", "⚖️", "keeping internal conditions steady"], ["negative feedback", "🔁", "a response reverses a change"], ["carbon dioxide", "CO₂", "waste gas from respiration"], ["chemoreceptor", "📡", "sensor for chemicals in blood"], ["medulla oblongata", "🧠", "brain part controlling breathing"], ["diaphragm", "⌒", "muscle below the lungs"], ["intercostal muscles", "🦴", "muscles between the ribs"], ["pH", "🧪", "how acidic or alkaline blood is"]] });

simStyle(`
.homo-readouts { display:grid; grid-template-columns:repeat(auto-fit,minmax(128px,1fr)); gap:8px; }
.homo-tile { border:2px solid #E8DCD0; border-radius:16px; background:#FFFDF8; padding:10px; min-width:0; }
.homo-tile b { display:block; font-size:.82rem; color:var(--ink-soft); }
.homo-big { font-size:1.35rem; font-weight:950; color:var(--ink); line-height:1.1; }
.homo-mini { height:10px; border-radius:8px; background:#F1E8DE; overflow:hidden; margin-top:6px; }
.homo-mini span { display:block; height:100%; border-radius:8px; width:var(--w); background:var(--c,#3FA06B); }
.homo-events { display:grid; grid-template-columns:repeat(auto-fit,minmax(118px,1fr)); gap:8px; }
.homo-events .btn { min-height:48px; width:100%; }
.homo-check { display:flex; align-items:center; gap:8px; min-height:44px; font-weight:800; }
.homo-check input { width:22px; height:22px; flex:none; }
.homo-loop { display:grid; grid-template-columns:1fr; gap:8px; align-items:center; }
.homo-node { border:2px solid #E6DCD2; background:#fff; border-radius:15px; padding:8px 6px; min-height:68px; display:grid; place-items:center; text-align:center; font-weight:900; font-size:.78rem; line-height:1.2; position:relative; }
.homo-node.on { background:#E6F8EC; border-color:#3FA06B; box-shadow:0 0 0 3px rgba(63,160,107,.18); }
.homo-node.warn { background:#FFF0EC; border-color:#E9573F; }
.homo-arrow { text-align:center; font-size:1.35rem; color:#B9A99A; font-weight:950; }
.homo-arrow.on { color:#3FA06B; animation:homoPulse 1s ease-in-out infinite; }
.homo-chiprow { display:flex; flex-wrap:wrap; gap:6px; }
.homo-chip { display:inline-flex; align-items:center; gap:4px; border-radius:999px; padding:4px 9px; background:#F4EEE8; font-size:.78rem; font-weight:850; }
.homo-node small{display:block;overflow-wrap:anywhere;}
.homo-arrow { transform:rotate(90deg); }
@keyframes homoPulse { 50% { transform:scale(1.08); filter:brightness(1.1); } }
@media (max-width:560px) { .homo-loop { grid-template-columns:1fr 22px 1fr; } .homo-loop .homo-node:nth-of-type(4), .homo-loop .homo-node:nth-of-type(5) { grid-column:auto; } .homo-arrow { font-size:1rem; } }
@media (prefers-reduced-motion: reduce) { .homo-arrow.on { animation:none; } }
`);

const GLU_NORM = [4, 7];
function glucoseSim(root) {
  if (typeof tourEnd === "function" && typeof tourAt !== "undefined" && tourAt >= 0) tourEnd();
  const st = { h: 7, g: 5.2, run: false, fast: false, type1: false, shot: 0, meal: 0, exercise: 0, sleep: 0, hist: [], t: 0, mealEvents: 0, exerciseEvents: 0, sleepEvents: 0, injections: 0 };
  const snap = () => { const m = glucoseModel(st); return Object.assign(m, { hour: st.h, glucose: st.g, running: st.run, fast: st.fast, type1: st.type1, meal: st.meal > 0, exercise: st.exercise > 0, sleep: st.sleep > 0, mealEvents: st.mealEvents, exerciseEvents: st.exerciseEvents, sleepEvents: st.sleepEvents, injections: st.injections, shot: st.shot, normal: st.g >= GLU_NORM[0] && st.g <= GLU_NORM[1] }); };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="gluScene" class="simsvg nozoom"></div>
      <div class="row simbtns"><button class="btn" id="gluRun">▶ Run day</button><button class="btn plain" id="gluFast">⏩ Fast</button><button class="btn plain" id="gluReset">↺ Reset</button></div>
      <div class="homo-events"><button class="btn yellow" data-ge="meal">🍚 Eat meal</button><button class="btn blue" data-ge="exercise">🏃 Exercise</button><button class="btn plain" data-ge="sleep">😴 Fast / sleep</button><button class="btn pink" id="gluShot">💉 Insulin injection</button></div>
      <label class="homo-check small"><input type="checkbox" id="gluType1"> ⚠️ Type 1 diabetes: β cells make no insulin</label>
      <div id="gluRead" class="homo-readouts"></div></section>
    <section class="card"><h3 style="margin:0">📈 Blood glucose over a day</h3><div id="gluGraph" class="simsvg nozoom"></div>
      <h3 style="margin:0">🔁 Negative-feedback loop</h3><div id="gluLoop"></div><div id="gluKey" class="homo-chiprow"></div></section></div>`;
  const runBtn = root.querySelector("#gluRun"), fastBtn = root.querySelector("#gluFast");
  const reset = () => { Object.assign(st, { h: 7, g: 5.2, run: false, fast: false, shot: 0, meal: 0, exercise: 0, sleep: 0, hist: [], t: 0 }); runBtn.textContent = "▶ Run day"; fastBtn.textContent = "⏩ Fast"; };
  runBtn.onclick = () => { SFX.tap(); st.run = !st.run; runBtn.textContent = st.run ? "⏸ Pause" : "▶ Run day"; };
  fastBtn.onclick = () => { SFX.tap(); st.fast = !st.fast; fastBtn.textContent = st.fast ? "⏩ Fast: on" : "⏩ Fast"; };
  root.querySelector("#gluReset").onclick = () => { SFX.tap(); reset(); };
  root.querySelectorAll("[data-ge]").forEach(b => b.onclick = () => { SFX.click(); st.run = true; runBtn.textContent = "⏸ Pause"; const k = b.dataset.ge; if (k === "meal") { st.meal = 1; st.mealEvents++; } if (k === "exercise") { st.exercise = 1; st.exerciseEvents++; } if (k === "sleep") { st.sleep = 1; st.sleepEvents++; } });
  root.querySelector("#gluShot").onclick = () => { SFX.item(); st.shot = Math.max(st.shot, 1.2); st.injections++; st.run = true; runBtn.textContent = "⏸ Pause"; };
  root.querySelector("#gluType1").onchange = e => { SFX.tap(); st.type1 = e.target.checked; };
  simProbe(() => snap());
  simLoop(root, dt => {
    st.t += dt;
    const m0 = glucoseModel(st), dh = st.run ? dt * (st.fast ? 1.35 : .32) : 0;
    if (dh) {
      const rate = glucoseRate(st, m0);
      st.g = clamp(st.g + rate * dh, 2, 16);
      st.h += dh; if (st.h >= 24) st.h -= 24;
      st.meal = Math.max(0, st.meal - dh / 2.2); st.exercise = Math.max(0, st.exercise - dh / 1.1); st.sleep = Math.max(0, st.sleep - dh / 7.5); st.shot = Math.max(0, st.shot - dh / 5);
      if (!st.hist.length || Math.abs(st.hist[st.hist.length - 1].h - st.h) > .05 || st.hist[st.hist.length - 1].h > st.h) st.hist.push({ h: st.h, g: st.g, ins: m0.insulin, glu: m0.glucagon });
      st.hist = st.hist.slice(-520);
    }
    const m = snap();
    root.querySelector("#gluScene").innerHTML = glucoseSceneSvg(st, m);
    root.querySelector("#gluGraph").innerHTML = glucoseGraphSvg(st, m);
    root.querySelector("#gluLoop").innerHTML = glucoseLoopHtml(m);
    root.querySelector("#gluRead").innerHTML = glucoseReadHtml(m);
    root.querySelector("#gluKey").innerHTML = `<span class="homo-chip">🔵 insulin ${m.insulin.toFixed(1)}</span><span class="homo-chip">🟠 glucagon ${m.glucagon.toFixed(1)}</span><span class="homo-chip">📦 liver: ${m.liverMode}</span><span class="homo-chip">🚪 cells: ${m.cellsMode}</span>`;
  });
}
function glucoseModel(st) {
  const high = Math.max(0, st.g - 5.6), low = Math.max(0, 4.8 - st.g);
  const beta = st.type1 ? 0 : clamp(high / 4, 0, 1.15), shot = st.shot, insulin = clamp(beta + shot, 0, 1.7);
  const glucagon = clamp(low / 2.2 + (st.sleep > 0 ? .12 : 0) - insulin * .18, 0, 1.25);
  const state = st.g > 7 ? "high" : st.g < 4 ? "low" : "normal";
  return { insulin, glucagon, state, pancreas: state === "high" ? (st.type1 ? "β cells fail" : "β cells") : state === "low" ? "α cells" : "steady islets", liverMode: insulin > .35 && st.g > 5 ? "store glycogen" : glucagon > .25 ? "release glucose" : "steady", cellsMode: insulin > .35 ? "take up glucose" : st.type1 && st.g > 7 ? "doors closed" : "steady uptake" };
}
function glucoseRate(st, m) {
  const mealIn = st.meal > 0 ? 2.2 * st.meal : 0, use = .10 + (st.exercise > 0 ? .95 : 0) + (st.sleep > 0 ? .03 : 0);
  const uptake = m.insulin * .95 * clamp((st.g - 3.6) / 5, 0, 2) + (st.exercise > 0 ? m.insulin * .35 : 0);
  const liver = m.glucagon * .75 - (m.insulin > .35 && st.g > 5 ? .45 * m.insulin : 0);
  return mealIn + liver - uptake - use;
}
function glucoseReadHtml(m) {
  const tile = (ic, lab, val, bar, c) => `<div class="homo-tile"><b>${ic} ${lab}</b><span class="homo-big">${val}</span><div class="homo-mini"><span style="--w:${clamp(bar,0,100)}%;--c:${c}"></span></div></div>`;
  return tile("🍬", "Blood glucose", `${m.glucose.toFixed(1)} mmol/L`, m.glucose / 12 * 100, m.normal ? "#3FA06B" : m.glucose > 7 ? "#E9573F" : "#5B8FE0") + tile("🔵", "Insulin", m.insulin.toFixed(1), m.insulin / 1.7 * 100, "#4A90E2") + tile("🟠", "Glucagon", m.glucagon.toFixed(1), m.glucagon / 1.25 * 100, "#F2A23A") + tile("🕘", "Time", `${String(Math.floor(m.hour)).padStart(2, "0")}:00`, m.hour / 24 * 100, "#8E5BD6");
}
function glucoseSceneSvg(st, m) {
  const insN = Math.round(m.insulin * 8), gluN = Math.round(m.glucagon * 7), phase = st.t * 42;
  const part = (n, c, y, from, to) => Array.from({ length: n }, (_, i) => { const p = (st.t * (.18 + i * .01) + i / Math.max(1, n)) % 1, x = from + (to - from) * p; return `<circle cx="${x.toFixed(1)}" cy="${(y + Math.sin(p * 6.28 + i) * 7).toFixed(1)}" r="3.2" fill="${c}" stroke="#fff" stroke-width="1"/>`; }).join("");
  return `<svg viewBox="0 0 380 430" role="img" aria-label="Blood glucose homeostasis with pancreas islets, liver glycogen store and blood vessel">
    <rect width="380" height="430" rx="18" fill="#FFF8EC"/><text x="190" y="24" text-anchor="middle" font-size="16" font-weight="950" fill="${CO}">${m.state === "high" ? "High glucose → insulin lowers it" : m.state === "low" ? "Low glucose → glucagon raises it" : "Glucose in normal range"}</text>
    <g transform="translate(20 52)"><rect x="0" y="0" width="138" height="104" rx="28" fill="#FFD46B" stroke="${CO}" stroke-width="3"/><text x="69" y="20" text-anchor="middle" font-size="13" font-weight="950" fill="${CO}">Pancreas islets</text>${Array.from({ length: 12 }, (_, i) => `<circle cx="${24 + (i % 4) * 28}" cy="${42 + Math.floor(i / 4) * 21}" r="8" fill="${st.type1 ? "#C9C1B8" : "#8EC7FF"}" stroke="${m.pancreas === "β cells" ? "#2D7ACB" : CO}" stroke-width="${m.pancreas === "β cells" ? 2.5 : 1}"/>`).join("")}${Array.from({ length: 6 }, (_, i) => `<circle cx="${38 + (i % 3) * 30}" cy="${52 + Math.floor(i / 3) * 22}" r="5.5" fill="#FFC66D" stroke="${m.pancreas === "α cells" ? "#D07600" : CO}" stroke-width="${m.pancreas === "α cells" ? 2.5 : 1}"/>`).join("")}<text x="69" y="94" text-anchor="middle" font-size="12" font-weight="900" fill="${CO}">β insulin · α glucagon</text></g>
    <g transform="translate(218 54)"><path d="M52 6 C98 6 134 30 130 70 C126 112 86 132 48 124 C18 118 0 94 8 62 C12 30 24 8 52 6Z" fill="#B56AA0" stroke="${CO}" stroke-width="3"/><text x="66" y="55" text-anchor="middle" font-size="17" font-weight="950" fill="#fff">Liver</text><text x="66" y="82" text-anchor="middle" font-size="11" font-weight="900" fill="#fff">${m.liverMode}</text><g opacity="${m.liverMode === "store glycogen" ? 1 : .45}">${[0,1,2,3,4].map(i=>`<circle cx="${34+i*14}" cy="104" r="5" fill="#F3BC38" stroke="#fff"/>`).join("")}</g><text x="66" y="124" text-anchor="middle" font-size="12" font-weight="900" fill="${CO}">glycogen store</text></g>
    <path d="M28 224 H352" stroke="#C84747" stroke-width="26" stroke-linecap="round" opacity=".18"/><path d="M28 224 H352" stroke="#C84747" stroke-width="5" stroke-linecap="round" stroke-dasharray="9 8"/><text x="190" y="254" text-anchor="middle" font-size="12" font-weight="900" fill="${CO}">blood vessel: glucose + hormones travel in blood</text>
    ${Array.from({ length: Math.round(st.g * 1.5) }, (_, i) => `<polygon points="${40 + (i * 29 + phase) % 300},${207 + (i * 19) % 36} ${45 + (i * 29 + phase) % 300},${204 + (i * 19) % 36} ${50 + (i * 29 + phase) % 300},${207 + (i * 19) % 36} ${50 + (i * 29 + phase) % 300},${214 + (i * 19) % 36} ${45 + (i * 29 + phase) % 300},${217 + (i * 19) % 36} ${40 + (i * 29 + phase) % 300},${214 + (i * 19) % 36}" fill="#F3BC38" stroke="${CO}" stroke-width=".8" opacity=".86"/>`).join("")}
    ${part(insN, "#4A90E2", 190, 112, 286)}${part(gluN, "#F2A23A", 174, 118, 282)}
    <g transform="translate(54 300)">${[0,1,2,3].map(i=>`<g transform="translate(${i*62} ${i%2*14})"><rect x="0" y="0" width="46" height="38" rx="14" fill="${m.cellsMode === "doors closed" ? "#DDD3CA" : "#BDEBD0"}" stroke="${CO}" stroke-width="2.5"/><path d="M12 19 h22" stroke="${m.insulin > .35 ? "#3FA06B" : "#B9A99A"}" stroke-width="5" stroke-linecap="round"/><text x="23" y="56" text-anchor="middle" font-size="12" font-weight="900" fill="${CO}">cell</text></g>`).join("")}</g>
    ${st.type1 && m.glucose > 7 ? `<g transform="translate(24 382)"><rect width="332" height="32" rx="16" fill="#FFF0EC" stroke="#E9573F" stroke-width="2.5"/><text x="166" y="21" text-anchor="middle" font-size="12" font-weight="950" fill="#8B2E20">Type 1: no insulin from β cells; injection replaces it.</text></g>` : ""}
  </svg>`;
}
function glucoseGraphSvg(st, m) {
  const X = h => 34 + h / 24 * 270, Y = g => 154 - (g - 2) / 14 * 136;
  const pts = st.hist.map(p => `${X(p.h).toFixed(1)},${Y(p.g).toFixed(1)}`).join(" ");
  return `<svg viewBox="0 0 320 176" role="img" aria-label="Blood glucose graph with normal range 4 to 7 millimoles per litre"><rect width="320" height="176" rx="12" fill="#fff"/><path d="M34 14 V154 H306" stroke="${CO}" stroke-width="2" fill="none"/>
    <rect x="34" y="${Y(7)}" width="272" height="${Y(4) - Y(7)}" fill="#DDF4E6"/><text x="300" y="${Y(5.5) + 4}" text-anchor="end" font-size="10" font-weight="900" fill="#3FA06B">normal 4–7</text>
    ${[2, 4, 7, 10, 14, 16].map(g => `<line x1="34" x2="306" y1="${Y(g)}" y2="${Y(g)}" stroke="#EEE4D8"/><text x="30" y="${Y(g) + 3}" text-anchor="end" font-size="9" fill="#7A6A66">${g}</text>`).join("")}
    ${[0, 6, 12, 18, 24].map(h => `<text x="${X(h)}" y="168" text-anchor="middle" font-size="9" fill="#7A6A66">${h}</text>`).join("")}
    ${pts ? `<polyline points="${pts}" fill="none" stroke="#E9573F" stroke-width="3.5" stroke-linecap="round"/>` : ""}<circle cx="${X(m.hour)}" cy="${Y(m.glucose)}" r="5" fill="#E9573F" stroke="#fff" stroke-width="2"/>
    <text x="170" y="12" text-anchor="middle" font-size="10" font-weight="900" fill="${CO}">time of day → · glucose (mmol/L)</text></svg>`;
}
function glucoseLoopHtml(m) {
  const high = m.state === "high", low = m.state === "low", on = high || low;
  const cls = x => `homo-node ${x ? "on" : ""}`;
  return `<div class="homo-loop" aria-label="Negative feedback loop"><div class="${cls(on)}">${high ? "⬆️ High glucose" : low ? "⬇️ Low glucose" : "✅ Normal"}<small>change</small></div><div class="homo-arrow ${on ? "on" : ""}">→</div><div class="${cls(on)}">🟡 Pancreas<br><small>${m.pancreas}</small></div><div class="homo-arrow ${on ? "on" : ""}">→</div><div class="${cls(on)}">${high ? "🔵 Insulin" : low ? "🟠 Glucagon" : "🤫 Less hormone"}</div><div class="homo-arrow ${on ? "on" : ""}">→</div><div class="${cls(on)}">${high ? "📦 Store + uptake" : low ? "🏭 Liver releases" : "⚖️ Steady"}</div><div class="homo-arrow ${on ? "on" : ""}">→</div><div class="${cls(on)}">↩ Back to<br>4–7 mmol/L</div></div>`;
}

function co2Sim(root) {
  if (typeof tourEnd === "function" && typeof tourAt !== "undefined" && tourAt >= 0) tourEnd();
  const st = { co2: 5.3, o2: 97, act: "rest", run: false, fast: false, hist: [], t: 0, tries: { rest: 0, exercise: 0, hold: 0, extra: 0 } };
  const snap = () => { const m = co2Model(st); return Object.assign(m, { co2: st.co2, o2: st.o2, activity: st.act, running: st.run, fast: st.fast, triedExercise: st.tries.exercise, triedHold: st.tries.hold, triedExtra: st.tries.extra, normal: st.co2 >= 4.7 && st.co2 <= 5.9 }); };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="co2Scene" class="simsvg nozoom"></div>
      <div class="row simbtns"><button class="btn" id="co2Run">▶ Run</button><button class="btn plain" id="co2Fast">⏩ Fast</button><button class="btn plain" id="co2Reset">↺ Reset</button></div>
      <div class="homo-events">${[["rest", "🧘 Rest"], ["exercise", "🏃 Exercise"], ["hold", "🤐 Hold breath"], ["extra", "CO₂ Extra CO₂ air"]].map(([k, l]) => `<button class="btn plain" data-ca="${k}">${l}</button>`).join("")}</div>
      <div id="co2Read" class="homo-readouts"></div></section>
    <section class="card"><h3 style="margin:0">📈 Blood CO₂ level</h3><div id="co2Graph" class="simsvg nozoom"></div>
      <h3 style="margin:0">🔁 Negative-feedback loop</h3><div id="co2Loop"></div><div id="co2Key" class="homo-chiprow"></div></section></div>`;
  const runBtn = root.querySelector("#co2Run"), fastBtn = root.querySelector("#co2Fast");
  const reset = () => { st.co2 = 5.3; st.o2 = 97; st.act = "rest"; st.run = false; st.fast = false; st.hist = []; st.t = 0; runBtn.textContent = "▶ Run"; fastBtn.textContent = "⏩ Fast"; };
  runBtn.onclick = () => { SFX.tap(); st.run = !st.run; runBtn.textContent = st.run ? "⏸ Pause" : "▶ Run"; };
  fastBtn.onclick = () => { SFX.tap(); st.fast = !st.fast; fastBtn.textContent = st.fast ? "⏩ Fast: on" : "⏩ Fast"; };
  root.querySelector("#co2Reset").onclick = () => { SFX.tap(); reset(); };
  root.querySelectorAll("[data-ca]").forEach(b => b.onclick = () => { SFX.click(); st.act = b.dataset.ca; st.tries[st.act]++; st.run = true; runBtn.textContent = "⏸ Pause"; });
  simProbe(() => snap());
  simLoop(root, dt => {
    st.t += dt; const m0 = co2Model(st), dm = st.run ? dt * (st.fast ? .34 : .105) : 0;
    if (dm) {
      const prod = st.act === "exercise" ? .58 : st.act === "hold" ? .22 : .20, extra = st.act === "extra" ? .26 : 0, vent = st.act === "hold" ? .025 : .20 * (m0.rate / 14) * (m0.depth / 1);
      st.co2 = clamp(st.co2 + (prod + extra - vent * (st.co2 / 5.3)) * dm, 3.5, 10.5);
      const oT = st.act === "hold" ? 88 : st.act === "exercise" ? 94 : st.act === "extra" ? 95 : 97;
      st.o2 += (oT - st.o2) * Math.min(1, dm * .8);
      if (!st.hist.length || st.t - st.hist[st.hist.length - 1].t > .08) st.hist.push({ t: st.t, co2: st.co2 });
      st.hist = st.hist.slice(-260);
    }
    const m = snap();
    root.querySelector("#co2Scene").innerHTML = co2SceneSvg(st, m);
    root.querySelector("#co2Graph").innerHTML = co2GraphSvg(st, m);
    root.querySelector("#co2Loop").innerHTML = co2LoopHtml(m);
    root.querySelector("#co2Read").innerHTML = co2ReadHtml(m);
    root.querySelector("#co2Key").innerHTML = `<span class="homo-chip">📡 CO₂ stimulus ${m.co2Stim.toFixed(1)}</span><span class="homo-chip">🫧 low O₂ effect ${m.o2Stim.toFixed(1)} (smaller)</span><span class="homo-chip">⚡ impulses ${m.impulses}</span>`;
    root.querySelectorAll("[data-ca]").forEach(b => b.classList.toggle("yellow", b.dataset.ca === st.act));
  });
}
function co2Model(st) {
  const co2Stim = clamp((st.co2 - 5.3) / 2.4, 0, 1.8), o2Stim = clamp((94 - st.o2) / 10, 0, 1) * .35, drive = 1 + co2Stim * 2.25 + o2Stim;
  const rate = st.act === "hold" ? 0 : clamp(14 * drive, 10, 46), depth = st.act === "hold" ? 0 : clamp(.85 + co2Stim * 1.2 + o2Stim * .5, .7, 2.6);
  const pH = clamp(7.40 - (st.co2 - 5.3) * .075, 7.08, 7.55), high = st.co2 > 5.9;
  return { co2Stim, o2Stim, drive, rate, depth, pH, high, receptors: high || o2Stim > .1, medulla: high || o2Stim > .1, impulses: rate > 0 ? Math.round(rate / 3) : 0 };
}
function co2ReadHtml(m) {
  const tile = (ic, lab, val, bar, c) => `<div class="homo-tile"><b>${ic} ${lab}</b><span class="homo-big">${val}</span><div class="homo-mini"><span style="--w:${clamp(bar,0,100)}%;--c:${c}"></span></div></div>`;
  return tile("CO₂", "Blood CO₂", `${m.co2.toFixed(1)} kPa`, m.co2 / 10 * 100, m.normal ? "#3FA06B" : "#E9573F") + tile("🫁", "Rate", `${m.rate.toFixed(0)}/min`, m.rate / 46 * 100, "#4A90E2") + tile("↕️", "Depth", `${m.depth.toFixed(1)}×`, m.depth / 2.6 * 100, "#8E5BD6") + tile("🧪", "Blood pH", m.pH.toFixed(2), (m.pH - 7.05) / .5 * 100, m.pH < 7.35 ? "#E9573F" : "#3FA06B");
}
function co2SceneSvg(st, m) {
  const breath = m.rate ? Math.sin(st.t * m.rate / 9) : -1, lung = 1 + m.depth * .08 * Math.max(0, breath), recOn = m.receptors, impN = m.impulses;
  const impulses = Array.from({ length: impN }, (_, i) => { const p = (st.t * .7 + i / Math.max(1, impN)) % 1, x = 112 + 150 * p, y = 166 + Math.sin(p * Math.PI) * -34; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="#FFD23F" stroke="${CO}" stroke-width=".8"/>`; }).join("");
  return `<svg viewBox="0 0 380 430" role="img" aria-label="Breathing control by carbon dioxide: medulla, carotid and aortic chemoreceptors, intercostal muscles and diaphragm">
    <defs><marker id="cArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#FFD23F"/></marker></defs>
    <rect width="380" height="430" rx="18" fill="#F2FAFF"/><rect y="286" width="380" height="144" fill="#E8F1FF"/>
    <g transform="translate(22 46)"><path d="M62 10 C26 16 12 48 22 80 C32 114 64 128 96 112 C126 96 128 50 104 24 C94 14 78 8 62 10Z" fill="#D5C7F2" stroke="${CO}" stroke-width="3"/><text x="62" y="58" text-anchor="middle" font-size="24" font-weight="950" fill="${CO}">🧠</text><text x="62" y="82" text-anchor="middle" font-size="13" font-weight="950" fill="${CO}">medulla</text><circle cx="58" cy="110" r="11" fill="${recOn ? "#FFE27A" : "#fff"}" stroke="${recOn ? "#E0A800" : CO}" stroke-width="2.5"/><text x="58" y="114" text-anchor="middle" font-size="12" font-weight="900" fill="${CO}">CO₂</text></g>
    <g transform="translate(188 62)"><path d="M50 68 C8 40 0 148 46 166 C64 130 68 94 50 68Z" fill="#FFB1C8" stroke="${CO}" stroke-width="3" transform="scale(${lung} 1) translate(${(1 - lung) * 50} 0)"/><path d="M106 68 C148 40 156 148 110 166 C92 130 88 94 106 68Z" fill="#FFB1C8" stroke="${CO}" stroke-width="3" transform="scale(${lung} 1) translate(${(1 - lung) * 106} 0)"/><path d="M78 36 V196" stroke="${CO}" stroke-width="7" stroke-linecap="round"/><path d="M26 202 Q78 ${220 + 16 * breath} 132 202" fill="none" stroke="#8E5BD6" stroke-width="8" stroke-linecap="round"/><g stroke="#9EC3E8" stroke-width="4" opacity=".9">${[0,1,2,3].map(i=>`<path d="M${18+i*12} ${114+i*12} H${138-i*12}"/>`).join("")}</g><text x="78" y="25" text-anchor="middle" font-size="14" font-weight="950" fill="${CO}">lungs</text><text x="78" y="232" text-anchor="middle" font-size="12" font-weight="900" fill="${CO}">diaphragm + intercostals</text></g>
    <path d="M112 150 C156 148 184 176 214 190" stroke="${recOn ? "#FFD23F" : "#B9A99A"}" stroke-width="4" fill="none" marker-end="url(#cArr)"/>${impulses}
    <g transform="translate(24 236)"><rect x="0" y="0" width="164" height="88" rx="16" fill="#fff" stroke="${CO}" stroke-width="2.5"/><text x="82" y="20" text-anchor="middle" font-size="13" font-weight="950" fill="${CO}">Chemoreceptors</text>${[[38,52,"carotid"],[82,60,"aortic"],[128,50,"medulla"]].map(([x,y,l])=>`<circle cx="${x}" cy="${y}" r="14" fill="${recOn ? "#FFE27A" : "#EAF6FF"}" stroke="${recOn ? "#E0A800" : CO}" stroke-width="2.4"/><text x="${x}" y="${y+27}" text-anchor="middle" font-size="12" font-weight="900" fill="${CO}">${l}</text>`).join("")}</g>
    <g transform="translate(246 42)"><rect x="0" y="0" width="108" height="88" rx="16" fill="${m.high ? "#FFF0EC" : "#E6F8EC"}" stroke="${m.high ? "#E9573F" : "#3FA06B"}" stroke-width="2.5"/><text x="54" y="29" text-anchor="middle" font-size="17" font-weight="950" fill="${CO}">CO₂ ${m.co2.toFixed(1)}</text><text x="54" y="54" text-anchor="middle" font-size="13" font-weight="900" fill="${CO}">pH ${m.pH.toFixed(2)}</text><text x="54" y="76" text-anchor="middle" font-size="12" font-weight="900" fill="#7A6A66">main stimulus</text></g>
    <text x="190" y="396" text-anchor="middle" font-size="15" font-weight="950" fill="${CO}">${st.act === "exercise" ? "Exercise: respiration makes CO₂ rise" : st.act === "hold" ? "Hold breath: CO₂ builds up" : st.act === "extra" ? "Extra CO₂: receptors fire" : "Rest: gases near normal"}</text>
  </svg>`;
}
function co2GraphSvg(st, m) {
  const minT = Math.max(0, st.t - 20), maxT = minT + 20, X = t => 34 + (t - minT) / 20 * 270, Y = c => 154 - (c - 3.5) / 7 * 136;
  const pts = st.hist.filter(p => p.t >= minT).map(p => `${X(p.t).toFixed(1)},${Y(p.co2).toFixed(1)}`).join(" ");
  return `<svg viewBox="0 0 320 176" role="img" aria-label="Blood carbon dioxide graph"><rect width="320" height="176" rx="12" fill="#fff"/><path d="M34 14 V154 H306" stroke="${CO}" stroke-width="2" fill="none"/>
    <rect x="34" y="${Y(5.9)}" width="272" height="${Y(4.7) - Y(5.9)}" fill="#DDF4E6"/><text x="300" y="${Y(5.3) + 4}" text-anchor="end" font-size="10" font-weight="900" fill="#3FA06B">near normal</text>
    ${[4, 5.3, 6.5, 8, 10].map(c => `<line x1="34" x2="306" y1="${Y(c)}" y2="${Y(c)}" stroke="#EEE4D8"/><text x="30" y="${Y(c) + 3}" text-anchor="end" font-size="9" fill="#7A6A66">${c}</text>`).join("")}
    ${pts ? `<polyline points="${pts}" fill="none" stroke="#E9573F" stroke-width="3.5" stroke-linecap="round"/>` : ""}<circle cx="${X(st.t)}" cy="${Y(m.co2)}" r="5" fill="#E9573F" stroke="#fff" stroke-width="2"/>
    <text x="170" y="12" text-anchor="middle" font-size="10" font-weight="900" fill="${CO}">last 20 min · CO₂ (kPa)</text></svg>`;
}
function co2LoopHtml(m) {
  const on = m.high || m.o2Stim > .1;
  const cls = x => `homo-node ${x ? "on" : ""}`;
  return `<div class="homo-loop" aria-label="Negative feedback loop for breathing"><div class="${cls(on)}">${m.high ? "⬆️ CO₂ rises" : "✅ Normal CO₂"}<small>change</small></div><div class="homo-arrow ${on ? "on" : ""}">→</div><div class="${cls(on)}">📡 Chemoreceptors<br><small>medulla + aortic/carotid</small></div><div class="homo-arrow ${on ? "on" : ""}">→</div><div class="${cls(on)}">🧠 Medulla<br><small>breathing centre</small></div><div class="homo-arrow ${on ? "on" : ""}">→</div><div class="${cls(on)}">⚡ More impulses<br><small>rate ${m.rate.toFixed(0)}/min</small></div><div class="homo-arrow ${on ? "on" : ""}">→</div><div class="${cls(on)}">🫁 Faster + deeper<br><small>CO₂ removed</small></div></div>`;
}

SIM_CH.glucose = {
  title: "Glucose Feedback Detective", mins: 15,
  story: "Use the day graph to prove how insulin and glucagon keep blood glucose near 4–7 mmol/L.",
  missions: [
    { ic: "🍚", name: "Meal spike", tasks: [
      { type: "goal", ic: "🍚", do: "Tap <b>🍚 Eat meal</b> and press <b>▶ Run day</b>.", look: "🍬 blood glucose graph", target: "Glucose rises above 6.2 mmol/L", check: p => p.mealEvents >= 1 && p.glucose > 6.2, hold: .4, meter: p => ({ v: p.glucose, min: 3, max: 12, lo: 6.2, hi: 12, unit: " mmol/L", label: "Blood glucose" }), why: "Food is digested to glucose. Blood glucose rises after the meal." },
      { type: "goal", ic: "🔵", do: "Wait until <b>insulin</b> is released.", look: "🟡 pancreas islets + blue bar", target: "Insulin above 0.3", check: p => !p.type1 && p.insulin > .3, hold: .4, why: "High glucose stimulates β cells in the pancreas to release insulin." },
      { type: "pick", ic: "📦", do: "What do liver and muscles do when insulin is high?", look: "Liver + muscles labels", opts: [["Store glucose as glycogen", "📦"], ["Break down glycogen to glucose", "🟠"], ["Make more glucagon", "⚠️"], ["Stop taking up glucose", "✋"]], miss: ["", "That happens when glucagon is high, not insulin.", "Glucagon is the opposite hormone.", "Insulin opens the way for glucose uptake."], why: "Insulin makes body cells take up glucose and stores extra glucose as glycogen." }] },
    { ic: "🏃", name: "Low glucose", tasks: [
      { type: "goal", ic: "🏃", do: "Tap <b>🏃 Exercise</b> and run the day.", look: "Glucose graph", target: "Exercise used at least once", check: p => p.exerciseEvents >= 1, hold: .2, why: "Muscle cells use more glucose during exercise." },
      { type: "goal", ic: "🟠", do: "Make <b>glucagon</b> rise.", look: "orange bar + liver label", target: "Glucagon above 0.25", check: p => p.glucagon > .25, hold: .4, meter: p => ({ v: p.glucagon, min: 0, max: 1.2, lo: .25, hi: 1.2, unit: "", label: "Glucagon" }), hint: "If glucose is still high, keep exercise running or tap 😴 Fast / sleep.", why: "Low glucose stimulates α cells to release glucagon." },
      { type: "pick", ic: "🏭", do: "How does glucagon raise blood glucose?", opts: [["It makes the liver break down glycogen and release glucose", "🏭"], ["It makes muscles store more glycogen", "📦"], ["It makes cells take in more glucose", "🚪"], ["It digests starch in the mouth", "🍞"]], miss: ["", "That would lower blood glucose.", "That is insulin's effect.", "Digestion is not the feedback response."], why: "Glucagon acts mainly on the liver: glycogen → glucose." }] },
    { ic: "💉", name: "Diabetes test", tasks: [
      { type: "goal", ic: "⚠️", do: "Switch on <b>⚠️ Type 1 diabetes</b>.", look: "checkbox under the model", target: "Type 1 on", check: p => p.type1, hold: .2, why: "In type 1 diabetes, β cells do not release enough insulin." },
      { type: "goal", ic: "🍚", do: "Eat a meal in type 1 mode.", look: "glucose graph", target: "High glucose with little insulin", check: p => p.type1 && p.mealEvents >= 2 && p.glucose > 7 && p.insulin < .25, hold: .4, why: "Without insulin, blood glucose stays high because cells take up less glucose." },
      { type: "goal", ic: "💉", do: "Tap <b>💉 Insulin injection</b>.", look: "blue hormone bar", target: "Injected insulin present", check: p => p.type1 && p.injections >= 1 && p.insulin > .6, hold: .3, why: "Insulin treatment replaces the missing hormone, so glucose can be taken up and stored." }] },
    { ic: "🔁", name: "Explain it", tasks: [
      { type: "order", ic: "🔵", do: "Put the <b>high glucose</b> feedback loop in order.", items: ["Blood glucose rises above normal", "β cells in the pancreas detect the rise", "Insulin is secreted", "Body cells take up glucose; liver/muscles store glycogen", "Blood glucose falls back towards normal"], why: "Negative feedback reverses the original change." },
      { type: "fill", ic: "✍️", do: "Complete the exam sentence.", text: "In negative feedback, a change from normal triggers a response that {reverses|increases|ignores} the change and brings the level {back to normal|further away|to zero}.", why: "The response removes the stimulus once the level is corrected." },
      { type: "pick", ic: "⚖️", do: "Why are two hormones useful?", opts: ["Insulin lowers high glucose and glucagon raises low glucose", "Both hormones lower glucose", "Both hormones raise glucose", "The hormones do not affect glucose"], miss: ["", "Glucagon raises glucose.", "Insulin lowers glucose.", "The graph changes when the hormones rise."], why: "Antagonistic hormones give two-way control around the set point." }] }
  ]
};
SIM_CH.co2 = {
  title: "CO₂ Breathing Detective", mins: 15,
  story: "Show that CO₂ is the main stimulus for breathing control, then explain the negative-feedback loop.",
  missions: [
    { ic: "🧘", name: "Resting level", tasks: [
      { type: "goal", ic: "▶", do: "Set <b>🧘 Rest</b> and press <b>▶ Run</b>.", look: "CO₂ graph", target: "CO₂ near normal", check: p => p.activity === "rest" && p.running && p.normal, hold: 2, meter: p => ({ v: p.co2, min: 3.5, max: 10, lo: 4.7, hi: 5.9, unit: " kPa", label: "Blood CO₂" }), why: "At rest, ventilation matches CO₂ production, so the level stays near normal." },
      { type: "read", ic: "📏", do: "Read the resting breathing gauges.", look: "Rate + depth tiles", need: p => p.activity === "rest" && p.normal, needTxt: "🧘 Rest running with CO₂ near normal.", fields: [["Breathing rate", p => p.rate, 3, "/min"], ["Breathing depth", p => p.depth, .3, "×"]], why: "At rest the model is about 14 breaths per minute with normal depth." }] },
    { ic: "🏃", name: "Exercise", tasks: [
      { type: "goal", ic: "🏃", do: "Tap <b>🏃 Exercise</b> and run.", look: "CO₂ graph", target: "CO₂ rises above 5.9 kPa", check: p => p.activity === "exercise" && p.co2 > 5.9, hold: .4, meter: p => ({ v: p.co2, min: 3.5, max: 10, lo: 5.9, hi: 10, unit: " kPa", label: "Blood CO₂" }), why: "Muscles respire faster during exercise, producing more CO₂." },
      { type: "goal", ic: "📡", do: "Light up the <b>chemoreceptors</b>.", look: "yellow receptor circles", target: "Chemoreceptors active", check: p => p.receptors && p.medulla, hold: .4, why: "Chemoreceptors detect the CO₂ rise and stimulate the medulla." },
      { type: "goal", ic: "🫁", do: "Make breathing faster and deeper.", look: "rate and depth gauges", target: "Rate ≥ 24/min and depth ≥ 1.3×", check: p => p.rate >= 24 && p.depth >= 1.3, hold: .4, why: "More impulses make the intercostal muscles and diaphragm ventilate the lungs faster and deeper." },
      { type: "read", ic: "📏", do: "Read the <b>exercise</b> breathing rate and blood CO₂.", look: "Rate tile + CO₂ graph", need: p => p.activity === "exercise" && p.rate >= 24, needTxt: "🏃 Exercise running with fast breathing.", fields: [["Breathing rate", p => p.rate, 3, "/min"], ["Blood CO₂", p => p.co2, .3, "kPa"]], readTip: "The numbers move while it runs: read them off the tiles and type them quickly.", why: "Compare with rest: CO₂ is higher, so breathing is faster." }] },
    { ic: "🤐", name: "CO₂ stimulus", tasks: [
      { type: "goal", ic: "🤐", do: "Tap <b>🤐 Hold breath</b>.", look: "CO₂ graph + pH tile", target: "CO₂ high and pH lower", check: p => p.activity === "hold" && p.co2 > 6.2 && p.pH < 7.35, hold: .4, why: "Holding your breath stops CO₂ removal, so CO₂ builds up and pH falls." },
      { type: "goal", ic: "CO₂", do: "Tap <b>CO₂ Extra CO₂ air</b>.", look: "chemoreceptors", target: "Extra CO₂ tried", check: p => p.activity === "extra" && p.triedExtra >= 1 && p.receptors, hold: .4, why: "Extra CO₂ in inhaled air raises blood CO₂ and stimulates breathing." },
      { type: "pick", ic: "🫧", do: "Which stimulus is strongest in this model?", opts: [["Rising CO₂ is the main stimulus; low O₂ has a smaller effect", "CO₂"], ["Low O₂ is always the only stimulus", "O₂"], ["Nitrogen controls breathing", "N₂"], ["Glucose controls breathing rate directly", "🍬"]], miss: ["", "Low O₂ can help, but the sim labels it as a smaller effect.", "Nitrogen is mostly inert here.", "Glucose control is a different homeostasis loop."], why: "The medulla responds strongly to CO₂ because CO₂ affects blood pH." }] },
    { ic: "🔁", name: "Explain it", tasks: [
      { type: "goal", ic: "🧘", do: "Go back to <b>🧘 Rest</b> and wait until CO₂ is <b>back to normal</b>.", look: "CO₂ graph", target: "CO₂ back in 4.7–5.9 kPa after exercise", check: p => p.activity === "rest" && p.running && p.normal && p.triedExercise, hold: 2, meter: p => ({ v: p.co2, min: 3.5, max: 10, lo: 4.7, hi: 5.9, unit: " kPa", label: "Blood CO₂" }), why: "Faster breathing removed the extra CO₂, so the level returned to normal: negative feedback." },
      { type: "order", ic: "🔢", do: "Put the <b>CO₂ feedback loop</b> in order.", items: ["Blood CO₂ rises", "Chemoreceptors in medulla, aorta and carotid bodies detect it", "Medulla breathing centre sends more impulses", "Intercostal muscles and diaphragm work faster and deeper", "More CO₂ is removed; level returns towards normal"], why: "This is negative feedback: the response reduces the original rise in CO₂." },
      { type: "fill", ic: "✍️", do: "Complete the breathing sentence.", text: "During exercise, muscles respire faster and produce more {CO₂|O₂|nitrogen}. The medulla sends more impulses to the {diaphragm|liver|pancreas} and intercostal muscles.", why: "CO₂ links muscle respiration to faster ventilation." },
      { type: "pick", ic: "🕵️", do: "A classmate says, “We breathe faster mainly because O₂ runs out.” What is best?", opts: ["Mostly wrong: rising CO₂ is the main trigger; low O₂ has a smaller effect", "Correct: O₂ always falls to zero first", "Wrong because breathing is not controlled by the brain", "Correct because CO₂ is harmless"], miss: ["", "Blood O₂ usually stays high enough; CO₂ changes strongly.", "The medulla breathing centre controls breathing.", "CO₂ lowers pH, so it is important."], why: "CO₂ is the main stimulus in this syllabus; low O₂ can add a smaller stimulus." }] }
  ]
};
