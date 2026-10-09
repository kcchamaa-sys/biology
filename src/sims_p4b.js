/* ============================================================
   5f-p4b. 🩺 Lab section IV(b,c): Health and Diseases
   Antibiotic sensitivity testing + body defence / immunity models.
   ============================================================ */

if (!window.SIM_P4B_STYLE) {
  window.SIM_P4B_STYLE = 1;
  simStyle(`
  .antibio-read,.immune-read{display:grid;grid-template-columns:repeat(auto-fit,minmax(126px,1fr));gap:8px}.antibio-tile,.immune-tile{border:2px solid #E6DCD2;border-radius:14px;background:#fff;padding:9px;min-width:0}.antibio-tile b,.immune-tile b{display:block;font-size:1.08rem;color:var(--ink)}
  .antibio-discrow,.immune-panelrow{display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:8px}.antibio-discrow button,.immune-panelrow button{min-height:48px;border:2px solid #E6DCD2;border-radius:13px;background:#fff;font-weight:900;color:var(--ink);padding:7px 8px}.antibio-discrow button[aria-pressed=true],.immune-panelrow button[aria-checked=true]{background:#E6F8EC;border-color:#3FA06B;box-shadow:0 0 0 2px rgba(63,160,107,.25)}
  .antibio-note,.immune-note{border:2px dashed #D9CBBE;border-radius:14px;padding:9px 10px;background:#FFF8E8;font-weight:800}.antibio-steps,.immune-chain{display:grid;gap:7px}.antibio-steps span,.immune-chain span{border:2px solid #E6DCD2;border-radius:13px;background:#fff;padding:7px 9px;font-weight:850}.antibio-steps span.on,.immune-chain span.on{background:#E6F8EC;border-color:#3FA06B}.antibio-steps span.bad{background:#FFF0EC;border-color:#E9573F}
  .immune-table{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px}.immune-table div{border:2px solid #E6DCD2;border-radius:14px;background:#fff;padding:8px}.immune-table b{display:block}.immune-micro{display:flex;flex-wrap:wrap;gap:6px}.immune-micro span{border-radius:999px;background:#F4EEE8;padding:4px 8px;font-size:.82rem;font-weight:850}
  .simchal,.simchal *{min-width:0;max-width:100%}.simchal h3,.simchal h4,.simchal p,.simchal span{overflow-wrap:anywhere}
  body:has(#simBody) .tourblock,body:has(#simBody) .tourspot,body:has(#simBody) .tourtip{display:none!important}
  @media (prefers-reduced-motion: reduce){.antibio-grow,.immune-flow{animation:none!important}}
  `);
}

/* ---------------- 💊 Antibiotics test ---------------- */
const ANTIBIO_DISCS = [
  { id: "water", code: "W", name: "Sterile water control", kind: "control", col: "#DDE7F2", mm: 0, x: 178, y: 180 },
  { id: "pen", code: "P", name: "Penicillin antibiotic", kind: "antibiotic", col: "#F8D36B", mm: 24, x: 298, y: 146 },
  { id: "tet", code: "T", name: "Tetracycline antibiotic", kind: "antibiotic", col: "#C6B5F5", mm: 30, x: 338, y: 256 },
  { id: "anti", code: "A", name: "Skin antiseptic", kind: "antiseptic", col: "#94D6B4", mm: 16, x: 216, y: 282 },
  { id: "dis", code: "D", name: "Bench disinfectant", kind: "disinfectant", col: "#F5A6A6", mm: 36, x: 412, y: 196 }
];
const ANTIBIO_ASEPTIC = ["Sterilise inoculating loop in a Bunsen flame", "Lift the Petri dish lid only a little", "Spread bacteria near the flame", "Place soaked paper discs and tape lid (not sealed)", "Incubate at about 25 °C, then never open"];
function antibioZoneMm(st, d) {
  if (st.caseType === "virus") return 0;
  let z = d.mm;
  if (st.resistant && (d.id === "pen" || d.id === "tet")) z = Math.round(z * (d.id === "pen" ? .48 : .62));
  return z;
}
function antibioLargest(st) {
  let best = ANTIBIO_DISCS[0];
  ANTIBIO_DISCS.forEach(d => { if (antibioZoneMm(st, d) > antibioZoneMm(st, best)) best = d; });
  return best;
}

simReg({ id: "antibio", ic: "💊", name: "Antibiotics test", sec: "4b", ord: 20, topic: "t19", fn: antibioSim,
  words: [["antibiotic", "💊", "drug that kills bacteria"], ["antiseptic", "🧴", "kills microbes on skin"], ["disinfectant", "🧼", "kills microbes on surfaces"], ["control", "⚖️", "comparison with no active chemical"], ["zone of inhibition", "⭕", "clear area with no bacterial growth"], ["aseptic technique", "🔥", "method to avoid contamination"], ["resistance", "🧬", "bacteria survive an antibiotic"]] });

function antibioSim(root) {
  // Cause → effect: chemical diffuses from a disc → susceptible bacteria cannot grow → a larger clear zone is measured.
  // Simplification: zone diameter combines killing effect and diffusion, as in school disc-diffusion tests.
  const st = { caseType: "bacteria", resistant: false, course: "finish", discs: [], incubated: false, zGrow: 0, t: 0, gen: 0, asepticStep: -1 };
  root.innerHTML = `<div class="simgrid wide">
    <section class="card"><div id="antibioDish" class="simsvg nozoom"></div>
      <div class="row simbtns"><button class="btn" id="abPlace">➕ Place all discs</button><button class="btn yellow" id="abInc">🌡️ Incubate 25 °C</button><button class="btn plain" id="abReset">↺ Reset plate</button></div>
      <div class="antibio-discrow">${ANTIBIO_DISCS.map(d => `<button data-ab-disc="${d.id}" aria-pressed="false"><b>${d.code}</b> ${d.name}</button>`).join("")}</div>
      <div class="antibio-note small">School-safe method: lid taped but <b>not sealed</b>; incubate at about <b>25 °C</b>; <b>never open</b> after incubation.</div></section>
    <section class="card"><h3 style="margin:0">🧪 Test conditions</h3>
      <div><b class="small">Microbe case</b>${segBtns("ab-case", [["bacteria", "🦠 Bacterial lawn"], ["virus", "🤧 Flu virus case"]], st.caseType)}</div>
      <label class="small chk"><input id="abRes" type="checkbox"> 🧬 Resistant mutants present</label>
      <div><b class="small">Patient course</b>${segBtns("ab-course", [["finish", "✅ Finish course"], ["incomplete", "⚠️ Stop early"]], st.course)}</div>
      <div class="antibio-read" id="abRead"></div><div id="abWhy" class="antibio-steps"></div></section></div>
    <section class="card"><h3 style="margin:0">📈 Resistance over generations</h3><div id="abGraph" class="simsvg nozoom"></div></section>`;
  const draw = () => {
    root.querySelector("#antibioDish").innerHTML = antibioDishSvg(st);
    root.querySelector("#abRead").innerHTML = antibioReadHtml(st);
    root.querySelector("#abWhy").innerHTML = antibioWhyHtml(st);
    root.querySelector("#abGraph").innerHTML = antibioGraphSvg(st);
    root.querySelectorAll("[data-ab-disc]").forEach(b => b.setAttribute("aria-pressed", st.discs.includes(b.dataset.abDisc) ? "true" : "false"));
    root.querySelectorAll("[data-ab-case]").forEach(b => b.setAttribute("aria-checked", b.dataset.abCase === st.caseType ? "true" : "false"));
    root.querySelectorAll("[data-ab-course]").forEach(b => b.setAttribute("aria-checked", b.dataset.abCourse === st.course ? "true" : "false"));
  };
  root.querySelectorAll("[data-ab-disc]").forEach(b => b.onclick = () => { SFX.tap(); if (!st.discs.includes(b.dataset.abDisc)) st.discs.push(b.dataset.abDisc); st.incubated = false; st.zGrow = 0; draw(); });
  root.querySelector("#abPlace").onclick = () => { SFX.item(); st.discs = ANTIBIO_DISCS.map(d => d.id); st.incubated = false; st.zGrow = 0; draw(); };
  root.querySelector("#abInc").onclick = () => { SFX.click(); st.incubated = true; st.zGrow = 0; };
  root.querySelector("#abReset").onclick = () => { SFX.tap(); st.discs = []; st.incubated = false; st.zGrow = 0; st.gen = 0; draw(); };
  root.querySelector("#abRes").onchange = e => { SFX.tap(); st.resistant = e.target.checked; st.gen = 0; draw(); };
  root.querySelectorAll("[data-ab-case]").forEach(b => b.onclick = () => { SFX.tap(); st.caseType = b.dataset.abCase; st.incubated = false; st.zGrow = 0; draw(); });
  root.querySelectorAll("[data-ab-course]").forEach(b => b.onclick = () => { SFX.tap(); st.course = b.dataset.abCourse; st.gen = 0; draw(); });
  simProbe(() => {
    const p = { caseType: st.caseType, resistant: st.resistant, course: st.course, discCount: st.discs.length, incubated: st.incubated, largest: antibioLargest(st).id, largestName: antibioLargest(st).name, asepticStep: st.asepticStep, generation: Math.round(st.gen), resistantPct: antibioResPct(st), safeTemp: 25, lidSealed: false };
    ANTIBIO_DISCS.forEach(d => p["zone_" + d.id] = st.incubated && st.discs.includes(d.id) ? antibioZoneMm(st, d) : 0);
    return p;
  });
  draw();
  simLoop(root, dt => {
    st.t += dt;
    if (st.incubated) st.zGrow = clamp(st.zGrow + dt * .7, 0, 1);
    if (st.resistant && st.course === "incomplete") st.gen = clamp(st.gen + dt * .55, 0, 10);
    else if (st.resistant) st.gen = clamp(st.gen + dt * .18, 0, 10);
    draw();
  });
}
function antibioResPct(st) {
  if (!st.resistant) return 1;
  const end = st.course === "incomplete" ? 94 : 18, k = st.gen / 10;
  return Math.round(1 + (end - 1) * (1 - Math.exp(-3.2 * k)) / (1 - Math.exp(-3.2)));
}
function antibioReadHtml(st) {
  const best = antibioLargest(st), bestZone = st.incubated ? antibioZoneMm(st, best) : 0;
  const tile = (lab, val, sub) => `<div class="antibio-tile"><small>${lab}</small><b>${val}</b><small>${sub || ""}</small></div>`;
  return tile("Discs on agar", `${st.discs.length}/5`, "paper discs") + tile("Largest clear zone", st.incubated ? `${best.code} ${bestZone} mm` : "not incubated", best.name) + tile("Control zone", `${st.incubated ? antibioZoneMm(st, ANTIBIO_DISCS[0]) : 0} mm`, "sterile water") + tile("Resistant bacteria", `${antibioResPct(st)}%`, st.course === "incomplete" ? "rising fast" : "mostly removed");
}
function antibioWhyHtml(st) {
  const arr = ANTIBIO_ASEPTIC.map((s, i) => `<span class="${i <= (st.incubated ? 4 : st.discs.length ? 3 : 1) ? "on" : ""}">${i + 1}. ${s}</span>`).join("");
  const virus = st.caseType === "virus" ? `<span class="bad">🤧 Flu is caused by a virus: antibiotics target bacterial structures, so zones stay 0 mm.</span>` : "";
  const res = st.resistant ? `<span class="${st.course === "incomplete" ? "bad" : "on"}">🧬 Resistant mutants can survive inside zones. ${st.course === "incomplete" ? "Stopping early lets them multiply." : "Finishing the course removes most susceptible bacteria and lowers survival."}</span>` : "";
  return arr + virus + res;
}
function antibioDishSvg(st) {
  const ink = "#3B2F2B", grow = st.zGrow;
  const dots = Array.from({ length: 130 }, (_, i) => { const a = i * 2.399, r = 8 + (i * 37 % 145), x = 300 + Math.cos(a) * r, y = 215 + Math.sin(a) * r; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${1.2 + i % 3 * .45}" fill="#507B4C" opacity="${st.incubated && st.caseType === "bacteria" ? .5 : .18}"/>`; }).join("");
  const discSvg = ANTIBIO_DISCS.filter(d => st.discs.includes(d.id)).map(d => {
    const z = antibioZoneMm(st, d) * 2.15 * grow, zone = st.incubated && z > 1 ? `<circle cx="${d.x}" cy="${d.y}" r="${z / 2}" fill="#FFF8E8" opacity=".88" stroke="#D9CBBE" stroke-width="2"/>` : "";
    const muts = st.incubated && st.resistant && z > 1 && (d.id === "pen" || d.id === "tet") ? [0, 1, 2, 3, 4].map(i => `<circle cx="${d.x + Math.cos(i * 1.9) * z * .24}" cy="${d.y + Math.sin(i * 1.9) * z * .20}" r="4" fill="#355B36" stroke="#fff" stroke-width="1"/>`).join("") : "";
    return `${zone}${muts}<circle cx="${d.x}" cy="${d.y}" r="18" fill="${d.col}" stroke="${ink}" stroke-width="3"/><text x="${d.x}" y="${d.y + 7}" text-anchor="middle" font-size="21" font-weight="950" fill="${ink}">${d.code}</text>`;
  }).join("");
  const ruler = Array.from({ length: 13 }, (_, i) => `<line x1="${135 + i * 25}" x2="${135 + i * 25}" y1="386" y2="${i % 2 ? 400 : 408}" stroke="${ink}" stroke-width="2"/>${i % 2 === 0 ? `<text x="${135 + i * 25}" y="430" text-anchor="middle" font-size="18" font-weight="850" fill="${ink}">${i * 5}</text>` : ""}`).join("");
  const virus = st.caseType === "virus" ? `<g transform="translate(300 215)"><circle r="86" fill="#E8EDF8" stroke="#63718A" stroke-width="4"/>${Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2; return `<path d="M${Math.cos(a) * 88} ${Math.sin(a) * 88} l${Math.cos(a) * 24} ${Math.sin(a) * 24}" stroke="#63718A" stroke-width="6" stroke-linecap="round"/>`; }).join("")}<text y="8" text-anchor="middle" font-size="24" font-weight="950" fill="${ink}">virus</text></g>` : "";
  return `<svg viewBox="0 0 640 460" role="img" aria-label="Petri dish antibiotic sensitivity test with clear zones measured in millimetres">
    <defs><radialGradient id="abAgar" cx=".42" cy=".35" r=".7"><stop offset="0" stop-color="#D9F1C7"/><stop offset="1" stop-color="#A8C989"/></radialGradient></defs>
    <rect width="640" height="460" rx="18" fill="#F7FBFF"/><text x="320" y="34" text-anchor="middle" font-size="23" font-weight="950" fill="${ink}">${st.caseType === "virus" ? "Virus case: no bacterial target" : "Bacterial lawn on nutrient agar"}</text>
    <circle cx="300" cy="215" r="168" fill="#E7EEF5" stroke="#8AA0B8" stroke-width="5"/><circle cx="300" cy="215" r="154" fill="url(#abAgar)" stroke="#6D7E65" stroke-width="3"/>${dots}${virus}${discSvg}
    <g><rect x="122" y="376" width="330" height="60" rx="10" fill="#FFFFFF" opacity=".88" stroke="${ink}" stroke-width="3"/><text x="470" y="411" font-size="19" font-weight="950" fill="${ink}">mm</text>${ruler}</g>
    <text x="320" y="456" text-anchor="middle" font-size="19" font-weight="900" fill="${ink}">Clear zone diameter = no bacterial growth</text>
  </svg>`;
}
function antibioGraphSvg(st) {
  const ink = "#3B2F2B", pct = antibioResPct(st), bars = Array.from({ length: 11 }, (_, g) => { const k = g / 10, end = st.course === "incomplete" ? 94 : 18, v = !st.resistant ? 1 : Math.round(1 + (end - 1) * (1 - Math.exp(-3.2 * k)) / (1 - Math.exp(-3.2))); const h = v * 1.45; return `<rect x="${54 + g * 47}" y="${176 - h}" width="30" height="${h}" rx="5" fill="${st.course === "incomplete" ? "#E9573F" : "#8CCB86"}" opacity="${g <= Math.round(st.gen) ? 1 : .25}"/>`; }).join("");
  return `<svg viewBox="0 0 610 220" role="img" aria-label="Graph of resistant bacteria percentage over generations"><rect width="610" height="220" rx="16" fill="#fff"/><path d="M42 24 V178 H580" stroke="${ink}" stroke-width="3"/><text x="304" y="212" text-anchor="middle" font-size="20" font-weight="900" fill="${ink}">generations after antibiotic use →</text><text x="150" y="22" text-anchor="middle" font-size="18" font-weight="900" fill="${ink}">resistant bacteria / %</text>${[0,25,50,75,100].map(v => `<line x1="42" x2="580" y1="${176 - v * 1.45}" y2="${176 - v * 1.45}" stroke="#EEE4D8"/><text x="36" y="${182 - v * 1.45}" text-anchor="end" font-size="17" fill="${ink}">${v}</text>`).join("")}${bars}<text x="578" y="34" text-anchor="end" font-size="21" font-weight="950" fill="${st.course === "incomplete" ? "#B53A2A" : "#2F7B46"}">${pct}% now</text></svg>`;
}

SIM_P.antibio = ["A disc soaked in sterile water is put on a bacterial lawn. What should happen after incubation?", ["No clear zone; it is the control with no active chemical", "The biggest clear zone, because water kills bacteria", "Many resistant mutants appear because water is an antibiotic", "A clear zone only if the lid is sealed tightly"], "Sterile water should not kill bacteria. It shows that any clear zone is due to the chemical on another disc.", "place all discs and incubate the plate."];
SIM_Q.antibio = [["Why do antibiotics not cure influenza (flu)?", ["Flu is caused by a virus, and antibiotics target bacteria", "Viruses have thick cell walls, so antibiotics cannot enter", "Antibiotics only work outside the body", "Flu bacteria hide inside red blood cells"], "Viruses do not have bacterial cell walls or bacterial ribosomes. Vaccination and hygiene prevent flu; antibiotics do not cure it."],
  ["Why should a patient finish the whole antibiotic course?", ["To kill remaining susceptible bacteria so resistant survivors do not multiply", "To make viruses change back into bacteria", "Because antibiotics work only after the symptoms disappear", "To seal the Petri dish completely"], "Stopping early leaves the most tolerant bacteria alive. They reproduce and the population becomes more resistant."]];
SIM_CH.antibio = { title: "Clear Zone Investigator", mins: 15, story: "Use a safe disc-diffusion test to compare chemicals and explain antibiotic resistance.", missions: [
  { ic: "🔥", name: "Set up safely", tasks: [
    { type: "goal", ic: "➕", do: "Tap <b>➕ Place all discs</b> on the bacterial lawn.", look: "Petri dish", target: "5 discs placed", check: p => p.caseType === "bacteria" && p.discCount >= 5, meter: p => ({ v: p.discCount, min: 0, max: 5, lo: 5, hi: 5, unit: "", label: "Discs" }), why: "Each paper disc has one test chemical. The water disc is a control." },
    { type: "order", ic: "🔥", do: "Put the <b>aseptic technique</b> steps in order.", items: ANTIBIO_ASEPTIC, why: "Sterilise first, open the lid minimally, tape but do not seal, incubate at 25 °C and never open afterwards." },
    { type: "pick", ic: "🧫", do: "Why tape the lid but <b>not seal</b> it completely?", opts: ["Some oxygen can enter, but the lid still stays safely attached", "A sealed plate makes viruses turn into bacteria", "The tape is the chemical that makes clear zones", "Sealing lets students open the plate after incubation"], miss: ["", "Sealing does not change viruses into bacteria.", "The discs, not the tape, contain the chemicals.", "Incubated plates should not be opened."], why: "Taping prevents accidental opening. Not sealing completely avoids unsafe anaerobic conditions." },
    { type: "goal", ic: "🌡️", do: "Tap <b>🌡️ Incubate 25 °C</b> until zones appear.", look: "Petri dish", target: "Incubated plate", check: p => p.incubated && p.zone_dis > 30, hold: .5, why: "Susceptible bacteria grow into a lawn. Clear zones show where bacteria were inhibited." }] },
  { ic: "📏", name: "Measure zones", tasks: [
    { type: "read", ic: "📏", do: "Read the <b>D</b> disinfectant zone diameter.", look: "Ruler overlay", need: p => p.incubated && p.discCount >= 5 && p.caseType === "bacteria", needTxt: "Place all discs and incubate a bacterial lawn.", fields: [["D zone diameter", p => p.zone_dis, 2, "mm"]], why: "D has the largest clear zone in this model: about 36 mm." },
    { type: "read", ic: "⚖️", do: "Read the <b>W</b> water control zone.", look: "Ruler overlay", need: p => p.incubated && p.discCount >= 5, needTxt: "Incubate after placing the W disc.", fields: [["W control zone", p => p.zone_water, 1, "mm"]], why: "The control should be 0 mm. Water itself did not stop bacterial growth." },
    { type: "pick", ic: "🧠", do: "Which chemical is most effective on this plate?", look: "Measured clear zones", need: p => p.incubated && p.zone_dis > 30, needTxt: "Incubate the bacterial plate and compare zones.", opts: ["D: bench disinfectant, because it has the largest zone", "W: sterile water, because it is the safest", "P: penicillin, because antibiotics always beat disinfectants", "A: antiseptic, because it has the smallest clear zone"], miss: ["", "The control has 0 mm, so it did not inhibit bacteria.", "Compare the measured diameters; bigger zone means more inhibition/diffusion here.", "A smaller clear zone means less inhibition on this plate."], why: "A bigger zone means the chemical inhibited growth over a larger distance, or diffused better through agar." }] },
  { ic: "🤧", name: "Bacteria or virus", tasks: [
    { type: "goal", ic: "🤧", do: "Switch to <b>🤧 Flu virus case</b> and incubate.", look: "Microbe case buttons", target: "Virus case with 0 mm zones", check: p => p.caseType === "virus" && p.incubated && p.zone_pen === 0 && p.zone_tet === 0, why: "Antibiotics have no bacterial target in a virus case, so they do not work on flu." },
    { type: "fill", ic: "✍️", do: "Complete the exam sentence.", text: "Antibiotics kill {bacteria|viruses|red blood cells} but not {viruses|bacteria|platelets}, because viruses lack bacterial targets.", why: "This explains why colds and flu should not be treated with leftover antibiotics." },
    { type: "pick", ic: "⚖️", do: "What is the purpose of the <b>water control</b>?", look: "W disc zone", need: p => p.incubated && p.zone_water === 0, needTxt: "Incubate the plate and check W = 0 mm.", opts: ["To show that clear zones are due to the chemical, not the paper disc or water", "To make bacteria grow faster so zones are bigger", "To kill viruses before incubation", "To seal the lid tightly"], why: "A control gives a fair comparison. If W has no zone, zones around other discs are due to their chemicals." }] },
  { ic: "🧬", name: "Resistance", tasks: [
    { type: "goal", ic: "🧬", do: "Turn on <b>🧬 Resistant mutants</b> and choose <b>⚠️ Stop early</b>.", look: "Test conditions", target: "Incomplete course", check: p => p.resistant && p.course === "incomplete", why: "A few resistant mutants can survive. Stopping early gives them a chance to multiply." },
    { type: "read", ic: "📈", do: "Read the resistant population after several generations.", look: "Resistance graph", need: p => p.resistant && p.course === "incomplete" && p.generation >= 6, needTxt: "Resistant mutants on + stop early; wait until generation 6.", fields: [["Resistant bacteria", p => p.resistantPct, 8, "%"]], why: "The graph rises because resistant bacteria survive and reproduce." },
    { type: "pick", ic: "🏥", do: "Why is <b>MRSA</b> difficult to treat?", opts: ["It is Staphylococcus aureus resistant to several antibiotics", "It is an influenza virus", "It cannot reproduce", "It is killed by sterile water controls"], why: "MRSA is an example of antibiotic-resistant bacteria, so doctors have fewer effective drugs." }] }
] };

/* ---------------- 🛡️ Immune response ---------------- */
const IMMUNE_PANELS = [["barriers", "🧱 Barriers"], ["phago", "🧫 Phagocytosis"], ["specific", "🎯 Specific response"], ["timeline", "📈 Timeline"]];
const IMMUNE_SCEN = [["first", "🦠 First infection"], ["second", "🔁 Second same"], ["vaccine", "💉 Vaccine first"], ["passive", "🧴 Antibody injection"], ["different", "🧬 Different pathogen"]];
function immuneCurve(scen, day) {
  const gauss = (x, mu, sig, amp) => amp * Math.exp(-Math.pow(x - mu, 2) / (2 * sig * sig));
  let ab = 0, mem = 0, pathogen = 0, tag = "primary", lag = 7, peak = 44;
  if (scen === "first") { ab = gauss(day, 15, 5.2, 44); pathogen = gauss(day, 8, 4.5, 88); mem = day > 12 ? 45 : 0; }
  if (scen === "second") { ab = gauss(day, 15, 5.2, 35) + gauss(day, 28, 4.2, 132); pathogen = gauss(day, 8, 4.5, 72) + gauss(day, 25, 2.1, 28); mem = day > 12 ? 90 : 0; tag = day >= 24 ? "secondary" : "primary"; lag = day >= 24 ? 2 : 7; peak = 132; }
  if (scen === "vaccine") { ab = gauss(day, 12, 5.5, 28) + gauss(day, 28, 4.4, 126); pathogen = day < 23 ? 0 : gauss(day, 25, 2.1, 24); mem = day > 10 ? 92 : 0; tag = day >= 24 ? "secondary after vaccine" : "vaccine primary"; lag = 2; peak = 126; }
  if (scen === "passive") { ab = 96 * Math.exp(-day / 18); pathogen = gauss(day, 5, 2.4, 18); mem = 0; tag = "passive"; lag = 0; peak = 96; }
  if (scen === "different") { ab = gauss(day, 15, 5.2, 38) + gauss(day, 36, 5.2, 40); pathogen = gauss(day, 8, 4.5, 75) + gauss(day, 30, 4.5, 76); mem = day > 12 ? 42 : 0; tag = day >= 24 ? "new primary" : "primary"; lag = 7; peak = 40; }
  const symptom = Math.max(0, pathogen - ab * .55);
  return { ab: +ab.toFixed(1), pathogen: +pathogen.toFixed(1), symptom: +symptom.toFixed(1), mem: Math.round(mem), tag, lag, peak };
}

simReg({ id: "immune", ic: "🛡️", name: "Immune response", sec: "4c", ord: 10, topic: "t19", fn: immuneSim,
  words: [["phagocyte", "🧫", "white blood cell that engulfs pathogens"], ["lymphocyte", "⚪", "white blood cell with specific receptors"], ["antigen", "🔺", "foreign molecule recognised by immunity"], ["antibody", "Y", "Y-shaped protein binding an antigen"], ["memory cell", "🧠", "long-lived cell for faster response"], ["vaccination", "💉", "safe antigens trigger memory"], ["active immunity", "🏋️", "body makes its own antibodies"], ["passive immunity", "🧴", "ready-made antibodies received"]] });

function immuneSim(root) {
  // Cause → effect: matching antigens select lymphocyte clones → antibody and memory cells form → later responses are faster and stronger.
  // Simplification: antibody curves are stylised HKDSE shapes, not clinical measurements.
  const st = { panel: "barriers", scen: "second", run: false, fast: false, day: 0, t: 0, phago: 0 };
  root.innerHTML = `<div class="simgrid wide"><section class="card"><div id="immuneScene" class="simsvg nozoom"></div>
    <div class="immune-panelrow">${IMMUNE_PANELS.map(([k, l]) => `<button role="radio" aria-checked="${k === st.panel}" data-im-panel="${k}">${l}</button>`).join("")}</div>
    <div class="row simbtns"><button class="btn" id="imRun">▶ Run days</button><button class="btn plain" id="imFast">⏩ Fast</button><button class="btn plain" id="imReset">↺ Reset day</button><button class="btn yellow" id="imPhago">🧫 Step phagocytosis</button></div></section>
    <section class="card"><h3 style="margin:0">📈 Antibody timeline</h3><div><b class="small">Scenario</b>${segBtns("im-scen", IMMUNE_SCEN, st.scen)}</div>
      <label class="small"><b>Day <span id="imDayLab">0</span></b><input id="imDay" type="range" min="0" max="42" value="0" style="width:100%"></label>
      <div id="immuneGraph" class="simsvg nozoom"></div><div id="immuneRead" class="immune-read"></div></section></div>
    <section class="card"><h3 style="margin:0">🧠 What is happening?</h3><div id="immuneChain" class="immune-chain"></div><div id="immuneTable" class="immune-table"></div></section>`;
  const draw = () => {
    const m = immuneCurve(st.scen, st.day);
    root.querySelector("#immuneScene").innerHTML = immuneSceneSvg(st, m);
    root.querySelector("#immuneGraph").innerHTML = immuneGraphSvg(st);
    root.querySelector("#immuneRead").innerHTML = immuneReadHtml(st, m);
    root.querySelector("#immuneChain").innerHTML = immuneChainHtml(st, m);
    root.querySelector("#immuneTable").innerHTML = immuneTableHtml(st);
    root.querySelector("#imDayLab").textContent = st.day.toFixed(0);
    root.querySelector("#imDay").value = st.day;
    root.querySelectorAll("[data-im-panel]").forEach(b => b.setAttribute("aria-checked", b.dataset.imPanel === st.panel ? "true" : "false"));
    root.querySelectorAll("[data-im-scen]").forEach(b => b.setAttribute("aria-checked", b.dataset.imScen === st.scen ? "true" : "false"));
  };
  root.querySelectorAll("[data-im-panel]").forEach(b => b.onclick = () => { SFX.tap(); st.panel = b.dataset.imPanel; draw(); });
  root.querySelectorAll("[data-im-scen]").forEach(b => b.onclick = () => { SFX.tap(); st.scen = b.dataset.imScen; st.day = 0; draw(); });
  root.querySelector("#imRun").onclick = () => { SFX.tap(); st.run = !st.run; root.querySelector("#imRun").textContent = st.run ? "⏸ Pause" : "▶ Run days"; };
  root.querySelector("#imFast").onclick = () => { SFX.tap(); st.fast = !st.fast; root.querySelector("#imFast").textContent = st.fast ? "⏩ Fast: on" : "⏩ Fast"; };
  root.querySelector("#imReset").onclick = () => { SFX.tap(); st.day = 0; st.run = false; st.phago = 0; root.querySelector("#imRun").textContent = "▶ Run days"; draw(); };
  root.querySelector("#imPhago").onclick = () => { SFX.item(); st.panel = "phago"; st.phago = (st.phago + 1) % 5; draw(); };
  root.querySelector("#imDay").oninput = e => { st.day = Number(e.target.value); st.run = false; root.querySelector("#imRun").textContent = "▶ Run days"; draw(); };
  simProbe(() => { const m = immuneCurve(st.scen, st.day); return { panel: st.panel, scenario: st.scen, day: Math.round(st.day), antibody: m.ab, pathogen: m.pathogen, symptoms: m.symptom, memory: m.mem, response: m.tag, lag: m.lag, peak: m.peak, phagoStage: st.phago, phagoEngulfed: st.phago >= 2, phagoDigested: st.phago >= 4, secondaryPeak: 132, primaryLag: 7, passiveLag: 0, threshold: 35 }; });
  draw();
  simLoop(root, dt => {
    if (st.run) st.day = st.day >= 42 ? 42 : st.day + dt * (st.fast ? 4.8 : 1.25);
    st.t += dt;
    if (st.panel === "phago" && st.run) st.phago = Math.floor((st.t % 8) / 1.6);
    draw();
  });
}
function immuneReadHtml(st, m) {
  const tile = (lab, val, sub) => `<div class="immune-tile"><small>${lab}</small><b>${val}</b><small>${sub || ""}</small></div>`;
  return tile("Antibody", `${m.ab}`, "relative units") + tile("Pathogen number", `${m.pathogen}`, "relative") + tile("Response", m.tag, `lag ≈ ${m.lag} day${m.lag === 1 ? "" : "s"}`) + tile("Memory cells", `${m.mem}%`, st.scen === "passive" ? "none made" : "long-lived");
}
function immuneChainHtml(st, m) {
  if (st.panel === "barriers") return `<span class="on">🧱 Skin is a physical barrier.</span><span class="on">🌬️ Mucus traps pathogens; cilia sweep mucus out.</span><span class="on">🧪 Stomach acid and tear lysozyme kill many microbes.</span><span class="on">🩸 Platelets + fibrin form a clot and scab at wounds.</span>`;
  if (st.panel === "phago") return [`🧭 Phagocyte moves towards pathogen`, `🦠 Pseudopodia surround the pathogen`, `🫧 Pathogen inside a phagocytic vacuole`, `🧪 Lysosomes fuse with the vacuole`, `✅ Enzymes digest the pathogen`].map((s, i) => `<span class="${i <= st.phago ? "on" : ""}">${s}</span>`).join("");
  if (st.panel === "specific") return `<span class="on">🔺 Antigens are recognised as foreign.</span><span class="on">⚪ Only the matching lymphocyte clone is selected.</span><span class="on">📈 Clonal proliferation makes many B cells.</span><span class="on">Y Plasma cells secrete specific antibodies.</span><span class="on">🧠 Memory cells remain for a faster secondary response.</span>`;
  return `<span class="${m.tag.includes("secondary") ? "on" : ""}">🔁 Same antigen + memory → faster, higher, longer response.</span><span class="${st.scen === "vaccine" ? "on" : ""}">💉 Vaccination gives harmless antigens before disease.</span><span class="${st.scen === "passive" ? "on" : ""}">🧴 Passive immunity is immediate but short-lived; no memory.</span><span class="${st.scen === "different" ? "on" : ""}">🧬 Different pathogen has different antigens → primary response again.</span>`;
}
function immuneTableHtml(st) {
  return `<div><b>Natural active</b><span class="small">After infection: body makes antibodies + memory.</span></div><div><b>Artificial active</b><span class="small">Vaccination: harmless antigens trigger memory.</span></div><div><b>Natural passive</b><span class="small">Ready-made antibodies from mother to baby.</span></div><div><b>Artificial passive</b><span class="small">Antibody injection: immediate, short-lived, no memory.</span></div>`;
}
function immuneSceneSvg(st, m) {
  if (st.panel === "barriers") return immuneBarrierSvg();
  if (st.panel === "phago") return immunePhagoSvg(st);
  if (st.panel === "specific") return immuneSpecificSvg();
  return immuneTimelineSceneSvg(st, m);
}
function immuneBarrierSvg() {
  const ink = "#3B2F2B";
  const rbc = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="18" ry="10" fill="#D94E4E" stroke="${ink}" stroke-width="2"/><ellipse cx="${x}" cy="${y}" rx="8" ry="4" fill="#F08A84" opacity=".8"/>`;
  return `<svg viewBox="0 0 640 420" role="img" aria-label="First line of defence: skin, mucus, cilia, stomach acid, tears and blood clotting"><rect width="640" height="420" rx="18" fill="#FFF8EC"/><text x="320" y="32" text-anchor="middle" font-size="24" font-weight="950" fill="${ink}">First line: barriers stop entry</text>
    <g transform="translate(34 62)"><rect x="0" y="52" width="142" height="54" rx="10" fill="#E9B18A" stroke="${ink}" stroke-width="3"/><rect x="0" y="106" width="142" height="44" rx="10" fill="#F2CFB2" stroke="${ink}" stroke-width="3"/><path d="M16 50 q8 -30 18 0 M54 50 q8 -34 18 0 M96 50 q8 -28 18 0" stroke="#6D4C41" stroke-width="4" fill="none"/><text x="71" y="184" text-anchor="middle" font-size="20" font-weight="900" fill="${ink}">Skin barrier</text></g>
    <g transform="translate(230 64)"><path d="M0 72 C44 34 112 34 160 72 C118 110 46 110 0 72Z" fill="#DDF1FF" stroke="${ink}" stroke-width="3"/><path d="M18 78 C54 64 106 64 144 78" stroke="#80C2D9" stroke-width="12" stroke-linecap="round"/><path d="M28 58 v-32 M54 56 v-34 M82 55 v-35 M110 56 v-34 M136 58 v-32" stroke="#5B8FE0" stroke-width="5" stroke-linecap="round"/><text x="80" y="184" text-anchor="middle" font-size="20" font-weight="900" fill="${ink}">Mucus + cilia</text></g>
    <g transform="translate(456 58)"><path d="M34 28 C92 22 134 64 112 116 C96 154 34 154 16 114 C-4 72 4 36 34 28Z" fill="#F6A1B5" stroke="${ink}" stroke-width="3"/><circle cx="64" cy="92" r="26" fill="#BFEA83" stroke="${ink}" stroke-width="3"/><text x="66" y="100" text-anchor="middle" font-size="22" font-weight="950" fill="${ink}">pH 2</text><text x="70" y="184" text-anchor="middle" font-size="20" font-weight="900" fill="${ink}">Stomach acid</text></g>
    <g transform="translate(46 282)"><path d="M0 38 C36 -8 108 -8 144 38 C106 84 36 84 0 38Z" fill="#fff" stroke="${ink}" stroke-width="3"/><circle cx="74" cy="38" r="24" fill="#8FC4E8" stroke="${ink}" stroke-width="3"/><circle cx="114" cy="20" r="12" fill="#BFE8FF" stroke="${ink}" stroke-width="2"/><text x="76" y="118" text-anchor="middle" font-size="20" font-weight="900" fill="${ink}">Tears: lysozyme</text></g>
    <g transform="translate(248 260)"><path d="M0 92 C28 40 126 18 206 66" stroke="#C6393B" stroke-width="32" stroke-linecap="round" fill="none" opacity=".32"/>${rbc(42,82)}${rbc(86,58)}${rbc(128,70)}${rbc(168,86)}<path d="M18 54 C72 96 124 30 194 82 M18 86 C76 42 132 112 194 54 M38 42 C70 74 132 76 170 40" stroke="#E6D7B8" stroke-width="5" fill="none"/><circle cx="54" cy="54" r="7" fill="#D8C08A"/><circle cx="136" cy="46" r="7" fill="#D8C08A"/><text x="104" y="138" text-anchor="middle" font-size="20" font-weight="900" fill="${ink}">Platelets + fibrin clot</text></g>
  </svg>`;
}
function immunePhagoSvg(st) {
  const ink = "#3B2F2B", s = st.phago;
  const px = 126 + Math.min(s, 1) * 140, vac = s >= 2, lys = s >= 3, dig = s >= 4;
  const path = s < 2 ? `M${px - 66} 202 C${px - 54} 138 ${px + 44} 118 ${px + 84} 174 C${px + 128} 174 ${px + 144} 236 ${px + 84} 246 C${px + 40} 302 ${px - 58} 274 ${px - 66} 202Z` : `M${px - 76} 202 C${px - 58} 122 ${px + 72} 118 ${px + 96} 190 C${px + 132} 248 ${px + 38} 306 ${px - 36} 270 C${px - 92} 246 ${px - 104} 220 ${px - 76} 202Z`;
  return `<svg viewBox="0 0 640 420" role="img" aria-label="Phagocytosis: phagocyte engulfs and digests a pathogen"><rect width="640" height="420" rx="18" fill="#F7FBFF"/><text x="320" y="34" text-anchor="middle" font-size="24" font-weight="950" fill="${ink}">Second line: phagocytosis</text>
    <path d="${path}" fill="#E9F4FF" stroke="${ink}" stroke-width="4"/><path d="M${px - 18} 190 C${px - 36} 164 ${px + 4} 146 ${px + 22} 170 C${px + 50} 154 ${px + 76} 190 ${px + 48} 210 C${px + 54} 242 ${px + 8} 248 ${px - 2} 218 C${px - 38} 224 ${px - 46} 198 ${px - 18} 190Z" fill="#8CB3E8" stroke="${ink}" stroke-width="3" opacity=".9"/>
    ${!vac ? `<g transform="translate(402 210)">${immunePathogenSvg(0,0,"#77C96B")}</g>` : `<circle cx="${px + 42}" cy="214" r="42" fill="#DDF5FF" stroke="${ink}" stroke-width="3"/><g transform="translate(${px + 42} 214) scale(.8)">${immunePathogenSvg(0,0,dig ? "#B9C2B2" : "#77C96B")}</g>`}
    ${lys ? [0, 1, 2, 3, 4, 5].map(i => `<circle cx="${px - 22 + i * 20}" cy="${154 + (i % 2) * 96}" r="11" fill="#D66BD6" stroke="${ink}" stroke-width="2"/>`).join("") : ""}
    ${s === 1 ? `<path d="M${px + 68} 184 C${px + 118} 154 ${px + 158} 178 ${px + 166} 210 C${px + 124} 192 ${px + 104} 212 ${px + 66} 230" fill="#E9F4FF" stroke="${ink}" stroke-width="4"/>` : ""}
    ${dig ? `<text x="440" y="318" text-anchor="middle" font-size="22" font-weight="950" fill="#2F7B46">digested by enzymes</text>` : ""}
    <text x="168" y="358" font-size="20" font-weight="900" fill="${ink}">phagocyte with lobed nucleus</text><text x="460" y="84" text-anchor="middle" font-size="20" font-weight="900" fill="${ink}">${["chemotaxis", "pseudopodia", "phagocytic vacuole", "lysosomes fuse", "digestion"][s]}</text>
  </svg>`;
}
function immunePathogenSvg(x, y, col) { return `<g><circle cx="${x}" cy="${y}" r="24" fill="${col}" stroke="#3B2F2B" stroke-width="3"/>${Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return `<path d="M${x + Math.cos(a) * 25} ${y + Math.sin(a) * 25} l${Math.cos(a) * 13} ${Math.sin(a) * 13}" stroke="#3B2F2B" stroke-width="4" stroke-linecap="round"/>`; }).join("")}<polygon points="${x-7},${y-30} ${x+7},${y-30} ${x},${y-42}" fill="#E9573F" stroke="#3B2F2B" stroke-width="2"/></g>`; }
function immuneSpecificSvg() {
  const ink = "#3B2F2B";
  const lymph = (x, y, on, lab) => `<g><circle cx="${x}" cy="${y}" r="38" fill="${on ? "#E6F8EC" : "#F1F4FF"}" stroke="${on ? "#2F9E5B" : ink}" stroke-width="4"/><circle cx="${x}" cy="${y}" r="27" fill="#8EA9E8" stroke="${ink}" stroke-width="3"/><path d="M${x-20} ${y-42} l20 -20 l20 20" stroke="${on ? "#E9573F" : "#8A8A8A"}" stroke-width="5" fill="none" stroke-linecap="round"/><text x="${x}" y="${y+70}" text-anchor="middle" font-size="20" font-weight="900" fill="${ink}">${lab}</text></g>`;
  const antibody = (x, y) => `<path d="M${x} ${y} v34 M${x} ${y+10} l-25 -28 M${x} ${y+10} l25 -28" stroke="#A05BD8" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="${x-27}" cy="${y-20}" r="5" fill="#E9573F"/><circle cx="${x+27}" cy="${y-20}" r="5" fill="#E9573F"/>`;
  return `<svg viewBox="0 0 640 420" role="img" aria-label="Specific immune response: clonal selection, antibodies, T cells and memory cells"><rect width="640" height="420" rx="18" fill="#FFF8EC"/><text x="320" y="32" text-anchor="middle" font-size="24" font-weight="950" fill="${ink}">Third line: specific immune response</text>
    <g transform="translate(74 92)">${immunePathogenSvg(0,0,"#77C96B")}<text x="0" y="72" text-anchor="middle" font-size="20" font-weight="900" fill="${ink}">pathogen antigens</text></g>
    ${lymph(204,132,false,"wrong clone")}${lymph(320,132,true,"matching B cell")}${lymph(436,132,false,"wrong clone")}
    <path d="M318 186 C282 224 250 244 218 266" stroke="#6B4A6B" stroke-width="4" marker-end="url(#imArr)" fill="none"/><path d="M338 186 C374 224 410 244 446 266" stroke="#6B4A6B" stroke-width="4" marker-end="url(#imArr)" fill="none"/>
    <defs><marker id="imArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#6B4A6B"/></marker></defs>
    <g transform="translate(194 290)"><circle r="34" fill="#FBE7FF" stroke="${ink}" stroke-width="3"/><text y="8" text-anchor="middle" font-size="19" font-weight="950" fill="${ink}">plasma</text>${[70,108,146].map((x,i)=>antibody(x,-8+i*22)).join("")}<text x="100" y="72" text-anchor="middle" font-size="20" font-weight="900" fill="${ink}">Y-shaped antibodies</text></g>
    <g transform="translate(448 286)"><circle r="34" fill="#E8F7FF" stroke="${ink}" stroke-width="3"/><circle r="24" fill="#8EA9E8"/><text x="0" y="72" text-anchor="middle" font-size="20" font-weight="900" fill="${ink}">memory cell</text></g>
    <g transform="translate(536 116)"><circle r="30" fill="#FFE8A6" stroke="${ink}" stroke-width="3"/><text y="-4" text-anchor="middle" font-size="18" font-weight="950" fill="${ink}">T</text><text y="18" text-anchor="middle" font-size="16" font-weight="900" fill="${ink}">helper</text><text x="0" y="66" text-anchor="middle" font-size="19" font-weight="900" fill="${ink}">helps B cells</text></g>
  </svg>`;
}
function immuneTimelineSceneSvg(st, m) {
  const ink = "#3B2F2B", ill = m.symptom > 35;
  return `<svg viewBox="0 0 640 360" role="img" aria-label="Immune response summary for selected timeline scenario"><rect width="640" height="360" rx="18" fill="#F7FBFF"/><text x="320" y="34" text-anchor="middle" font-size="24" font-weight="950" fill="${ink}">${IMMUNE_SCEN.find(x=>x[0]===st.scen)[1]}</text>
    <g transform="translate(74 92)">${immunePathogenSvg(0,0,ill?"#E9573F":"#77C96B")}<text x="0" y="76" text-anchor="middle" font-size="20" font-weight="900" fill="${ink}">pathogen ${m.pathogen}</text></g>
    <g transform="translate(262 82)">${[0,1,2,3,4].map(i => `<g transform="translate(${(i%3)*44} ${Math.floor(i/3)*58}) scale(${m.ab>60?1.15:1})"><path d="M0 20 v34 M0 30 l-24 -28 M0 30 l24 -28" stroke="#A05BD8" stroke-width="7" fill="none" stroke-linecap="round"/></g>`).join("")}<text x="42" y="166" text-anchor="middle" font-size="20" font-weight="900" fill="${ink}">antibodies ${m.ab}</text></g>
    <g transform="translate(494 96)"><circle r="42" fill="#E8F7FF" stroke="${ink}" stroke-width="4"/><circle r="30" fill="#8EA9E8"/><text y="84" text-anchor="middle" font-size="20" font-weight="900" fill="${ink}">memory ${m.mem}%</text></g>
    <rect x="74" y="274" width="492" height="34" rx="17" fill="${ill?"#FFF0EC":"#E6F8EC"}" stroke="${ill?"#E9573F":"#3FA06B"}" stroke-width="3"/><text x="320" y="298" text-anchor="middle" font-size="21" font-weight="950" fill="${ink}">${ill?"Above illness threshold: symptoms likely":"Below illness threshold: protected or mild"}</text>
  </svg>`;
}
function immuneGraphSvg(st) {
  const ink = "#3B2F2B", X = d => 48 + d / 42 * 520, Ya = v => 178 - v / 145 * 142, Yp = v => 178 - v / 100 * 142;
  const pts = (kind) => Array.from({ length: 85 }, (_, i) => { const d = i / 84 * 42, m = immuneCurve(st.scen, d), y = kind === "ab" ? Ya(m.ab) : Yp(m.symptom); return `${X(d).toFixed(1)},${y.toFixed(1)}`; }).join(" ");
  const m = immuneCurve(st.scen, st.day);
  return `<svg viewBox="0 0 620 250" role="img" aria-label="Graph of antibody concentration and symptoms over days"><rect width="620" height="250" rx="16" fill="#fff"/><path d="M48 20 V178 H568" stroke="${ink}" stroke-width="3"/><text x="308" y="238" text-anchor="middle" font-size="20" font-weight="900" fill="${ink}">days after first event →</text><text x="20" y="108" transform="rotate(-90 20 108)" text-anchor="middle" font-size="18" font-weight="900" fill="${ink}">relative amount</text>
    <rect x="48" y="${Ya(35)}" width="520" height="2" fill="#E9573F"/><text x="560" y="${Ya(35)-8}" text-anchor="end" font-size="18" font-weight="900" fill="#E9573F">illness threshold</text>${[0,7,14,21,28,35,42].map(d => `<line x1="${X(d)}" x2="${X(d)}" y1="178" y2="184" stroke="${ink}" stroke-width="2"/><text x="${X(d)}" y="204" text-anchor="middle" font-size="17" fill="${ink}">${d}</text>`).join("")}
    <polyline points="${pts("ab")}" fill="none" stroke="#8E5BD6" stroke-width="5" stroke-linecap="round"/><polyline points="${pts("sym")}" fill="none" stroke="#E9573F" stroke-width="4" stroke-linecap="round" stroke-dasharray="8 6"/>
    <circle cx="${X(st.day)}" cy="${Ya(m.ab)}" r="7" fill="#8E5BD6" stroke="#fff" stroke-width="3"/><circle cx="${X(st.day)}" cy="${Yp(m.symptom)}" r="6" fill="#E9573F" stroke="#fff" stroke-width="3"/><text x="64" y="34" font-size="19" font-weight="950" fill="#8E5BD6">antibody</text><text x="184" y="34" font-size="19" font-weight="950" fill="#E9573F">symptoms/pathogen trace</text></svg>`;
}

SIM_P.immune = ["A person meets the same pathogen for a second time. What happens to antibody concentration?", ["It rises faster and much higher because memory cells are present", "It rises slowly and lower, exactly like the first time", "It stays at zero because antibodies are only made before infection", "It works only if antibiotics are taken"], "Memory cells specific to the antigen quickly divide into plasma cells, giving a secondary response.", "choose 🔁 Second same and run the days."];
SIM_Q.immune = [["Which statement best explains vaccination?", ["Harmless antigens trigger active immunity and memory cells without causing disease", "Ready-made antibodies are injected and last for life", "Antibiotics are injected to kill viruses", "Platelets make antibodies against the vaccine"], "Vaccines give antigens, not usually ready-made antibodies. The person makes their own antibodies and memory cells."],
  ["Why is a new flu vaccine often needed each year?", ["Flu antigens change, so old memory cells may not match well", "Flu becomes a bacterium each year", "Antibodies turn into antibiotics after one year", "Red blood cells forget all antigens every winter"], "If antigen shapes change, the matching lymphocyte clone and memory response may not recognise the virus strongly."]];
SIM_CH.immune = { title: "Body Fortress Mission", mins: 15, story: "Trace defence from barriers to phagocytes to specific immunity and memory.", missions: [
  { ic: "🧱", name: "First defences", tasks: [
    { type: "goal", ic: "🧱", do: "Open <b>🧱 Barriers</b> panel.", look: "Panel buttons", target: "Barriers shown", check: p => p.panel === "barriers", why: "Skin, mucus, cilia, acid, lysozyme and clotting stop many pathogens before infection starts." },
    { type: "pick", ic: "🩸", do: "What traps red cells in a blood clot?", opts: ["A fibrin mesh formed with platelets", "Y-shaped antibodies", "Cilia in the airway", "Stomach acid"], why: "Platelets start clotting. Fibrin threads form a mesh that traps red cells and seals the wound." },
    { type: "fill", ic: "✍️", do: "Complete the barrier sentence.", text: "Mucus {traps|digests|selects} pathogens and cilia {sweep it out|make antibodies|carry oxygen}.", why: "This is a non-specific first-line defence in the airways." }] },
  { ic: "🧫", name: "Phagocytosis", tasks: [
    { type: "goal", ic: "🧫", do: "Open <b>🧫 Phagocytosis</b> and step to a vacuole.", look: "Step phagocytosis button", target: "Pathogen engulfed", check: p => p.panel === "phago" && p.phagoEngulfed, why: "The pathogen is enclosed in a phagocytic vacuole inside the phagocyte." },
    { type: "goal", ic: "🧪", do: "Step until enzymes digest the pathogen.", look: "Phagocytosis diagram", target: "Digested", check: p => p.panel === "phago" && p.phagoDigested, why: "Lysosomes fuse with the vacuole and release digestive enzymes." },
    { type: "order", ic: "🔢", do: "Put phagocytosis in order.", items: ["Phagocyte moves towards pathogen", "Pseudopodia surround pathogen", "Pathogen enters a phagocytic vacuole", "Lysosomes fuse with the vacuole", "Enzymes digest the pathogen"], why: "Movement → engulfing → vacuole → lysosomes → digestion." }] },
  { ic: "🎯", name: "Specific response", tasks: [
    { type: "goal", ic: "🎯", do: "Open <b>🎯 Specific response</b>.", look: "Specific response panel", target: "Matching clone visible", check: p => p.panel === "specific", why: "Only lymphocytes with complementary receptors are activated: clonal selection." },
    { type: "fill", ic: "Y", do: "Complete the antibody sentence.", text: "Antibodies are {Y-shaped|biconcave|spiral} proteins with {two|zero|ten} antigen-binding sites.", why: "Each antibody has two identical binding sites, so it can neutralise or agglutinate pathogens." },
    { type: "pick", ic: "🧠", do: "What do memory cells do?", opts: ["Remain after infection and make the next response faster", "Engulf bacteria by pseudopodia", "Carry oxygen using haemoglobin", "Seal wounds with fibrin"], why: "Memory cells are long-lived lymphocytes specific to an antigen." }] },
  { ic: "📈", name: "Timeline evidence", tasks: [
    { type: "goal", ic: "🔁", do: "Choose <b>🔁 Second same</b> and run past day 28.", look: "Timeline graph", target: "Secondary response", check: p => p.scenario === "second" && p.day >= 28 && p.response === "secondary", meter: p => ({ v: p.day, min: 0, max: 42, lo: 28, hi: 42, unit: " d", label: "Day" }), why: "The second same antigen triggers a secondary response from memory cells." },
    { type: "read", ic: "📏", do: "Read the <b>secondary peak</b> height.", look: "Purple antibody curve", need: p => p.scenario === "second" && p.day >= 28, needTxt: "Second same scenario, after day 28.", fields: [["Secondary peak", p => p.secondaryPeak, 8, "units"]], why: "The secondary peak is much higher than the primary response." },
    { type: "read", ic: "⏱", do: "Read the <b>primary lag</b> time.", look: "Timeline readout", fields: [["Primary lag", p => p.primaryLag, 1, "days"]], why: "The primary response has a lag of about 1–2 weeks before antibodies rise strongly." },
    { type: "goal", ic: "🧴", do: "Choose <b>🧴 Antibody injection</b> and set day 0.", look: "Scenario buttons + day slider", target: "Passive immunity", check: p => p.scenario === "passive" && p.day === 0 && p.passiveLag === 0, why: "Passive immunity is immediate because ready-made antibodies are given, but no memory cells are made." },
    { type: "pick", ic: "🧬", do: "Why does <b>🧬 Different pathogen</b> give a primary response again?", opts: ["Its antigens are different, so old memory cells do not match", "Antibodies become red blood cells", "Phagocytes cannot move twice", "Vaccines only work on bacteria"], why: "Specific immunity depends on complementary antigen-receptor binding." }] },
  { ic: "💉", name: "Classify immunity", tasks: [
    { type: "pick", ic: "💉", do: "A vaccine gives which type of immunity?", look: "Choose 💉 Vaccine first in the timeline.", need: p => p.scenario === "vaccine", needTxt: "Choose 💉 Vaccine first.", opts: ["Artificial active", "Natural active", "Natural passive", "Artificial passive"], miss: ["", "Natural active follows infection, not vaccination.", "Natural passive is mother-to-baby antibodies.", "Artificial passive is an antibody injection."], why: "Artificial = given deliberately; active = the body makes its own antibodies and memory cells." },
    { type: "pick", ic: "🍼", do: "Antibodies from mother to baby are which type?", look: "Use the immunity table.", need: p => p.panel === "timeline" || p.panel === "barriers", needTxt: "Open a panel and read the immunity table.", opts: ["Natural passive", "Artificial active", "Natural active", "Artificial passive"], why: "Natural = happens without medical injection; passive = ready-made antibodies are received." },
    { type: "pick", ic: "🤧", do: "Why may flu vaccines change each year?", opts: ["Flu antigens change, so memory cells from last year may not match", "Antibiotics stop working after one winter", "Platelets change into lymphocytes yearly", "Skin becomes thinner in winter"], why: "A new antigen shape needs a newly matched immune response." }] }
] };
