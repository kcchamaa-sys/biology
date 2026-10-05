
/* ============================================================
   5j. 🔦 Escape room 2.0: discover → manipulate → escape.
   1. Discovery: 3 hidden specimens shimmer faintly in the dark room. Sweep the torch and tap them.
      Each specimen card carries a key term from this stage.
   2. Process: the ⚙️ Bio-Machine. Wire each specimen (term) to its function (meaning).
      Every right cable fills the machine's tank; a wrong cable sparks (−10 s in Escape mode).
   3. Escape: the door needs the 5-digit code from the locks AND power from the Bio-Machine.
   ============================================================ */
const SPEC_ICONS = ["🧫", "🦠", "🌿", "🧬", "💧", "🫁", "🍃", "🔬"];
function specRun() {
  const run = S.room_run[R.room.id], room = R.room;
  if (!run.spec || !run.spec.terms) {
    const ok = room.terms.map((t, i) => [t, i]).filter(([[t, m]]) => m.length <= 80 && t.length <= 26);
    const terms = shuffle(ok).slice(0, 3).map(x => x[1]);
    const taken = HOTSPOTS.filter(Boolean).map(h => [h.x, h.y]).concat([[DOOR.x, DOOR.y]]);
    const cand = shuffle([[10, 20], [22, 32], [30, 70], [48, 40], [52, 76], [62, 18], [68, 44], [70, 88], [86, 22], [18, 92], [44, 14], [58, 60], [26, 58], [80, 72]])
      .filter(([x, y]) => taken.every(([a, b]) => Math.hypot(a - x, (b - y) * .6) > 11));
    run.spec = { terms, pos: cand.slice(0, 3), found: [], wired: [], power: false };
    save();
  }
  return run.spec;
}
function machineSpot() {
  const taken = HOTSPOTS.filter(Boolean).map(h => [h.x, h.y]).concat([[DOOR.x, DOOR.y]], specRun().pos);
  return [[58, 90], [8, 90], [8, 10], [58, 8], [76, 90], [30, 8]].map(p => [p, Math.min(...taken.map(([a, b]) => Math.hypot(a - p[0], (b - p[1]) * .6)))]).sort((a, b) => b[1] - a[1])[0][0];
}
function specHtml() {
  const sp = specRun();
  return sp.pos.map((p, i) => sp.found.includes(i) ? "" : `<button class="spec" data-spec="${i}" style="left:${p[0]}%;top:${p[1]}%" aria-label="Something is shimmering here"><i></i></button>`).join("")
    + (() => { const [x, y] = machineSpot(); return `<button class="hs machine ${sp.power ? "on" : ""}" data-machine="1" style="left:${x}%;top:${y}%" aria-label="Bio-Machine">⚙️<span class="lbl">Bio-Machine${sp.power ? " ✓" : ""}</span></button>`; })();
}
function goalHtml() {
  const sp = specRun(), solved = (S.room_progress[R.room.id] || []).length;
  const chip = (ok, txt) => `<span class="goal ${ok ? "ok" : ""}">${ok ? "✓" : "○"} ${txt}</span>`;
  return `<div class="goals">${chip(sp.found.length === 3, `🔦 Specimens ${sp.found.length}/3`)}${chip(sp.power, `⚙️ Machine ${sp.power ? "on" : "off"}`)}${chip(solved === 5, `🔓 Locks ${solved}/5`)}${chip(false, "🚪 Escape")}</div>`;
}
function wireRoom2() {
  $app.querySelectorAll("[data-spec]").forEach(b => b.onclick = e => { e.stopPropagation(); findSpecimen(Number(b.dataset.spec), b); });
  const m = $app.querySelector("[data-machine]"); if (m) m.onclick = () => { SFX.init(); openMachine(); };
  // solved lock objects glow in the scene
  (S.room_progress[R.room.id] || []).forEach(i => { const o = $app.querySelector(`#scene .obj[data-hs="${i}"]`); if (o) o.classList.add("opened"); });
  if (specRun().power) { const d = $app.querySelector("#scene #doorG"); if (d) d.classList.add("powered"); }
}
function findSpecimen(i, el) {
  const sp = specRun(); if (sp.found.includes(i)) return;
  sp.found.push(i); save(); SFX.item(); confetti(30);
  const [t] = R.room.terms[sp.terms[i]];
  gainCoins(2, "", el);
  openModal(`<span class="kicker">🔦 Specimen found · ${sp.found.length} of 3</span><h2>${SPEC_ICONS[(sp.terms[i] + i) % SPEC_ICONS.length]} ${esc(t)}</h2>
    <div class="speccard"><span class="small muted">Specimen label</span><b>${esc(t)}</b><span class="small">What does it do? Wire it up in the ⚙️ Bio-Machine to find out!</span></div>
    ${say("chiikawa", sp.found.length === 3 ? "That's all 3 specimens! Let's power up the ⚙️ Bio-Machine! ⚡" : "A specimen! There are more shimmering in the dark... keep sweeping the torch! 🔦", "sparkle")}
    <div class="row"><button class="btn primary" id="spOk">${sp.found.length === 3 ? "⚙️ To the Bio-Machine" : "Keep searching"}</button></div>`);
  document.getElementById("spOk").onclick = () => { SFX.tap(); closeModal(); renderRoom(); if (sp.found.length === 3) openMachine(); };
}
function machineSvg(fill, power) {
  const h = 90 * fill, col = power ? "#58CC02" : fill > 0 ? "#1CB0F6" : "#8C98AC";
  return `<svg viewBox="0 0 320 150" class="machinesvg" aria-hidden="true"><defs><linearGradient id="mtank" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".75"/><stop offset="1" stop-color="${col}"/></linearGradient></defs>
    <rect x="10" y="30" width="300" height="110" rx="22" fill="#E9EEF7"/><rect x="10" y="30" width="300" height="110" rx="22" fill="none" stroke="#B8C3D6" stroke-width="4"/>
    <rect x="128" y="10" width="64" height="124" rx="28" fill="#fff" stroke="#B8C3D6" stroke-width="4"/>
    <clipPath id="mclip"><rect x="132" y="14" width="56" height="116" rx="24"/></clipPath>
    <g clip-path="url(#mclip)"><rect class="tankfill" x="132" y="${130 - h - 16}" width="56" height="${h + 20}" fill="url(#mtank)"/>${fill > 0 ? `<circle class="bub" cx="148" cy="118" r="4" fill="#fff" opacity=".7"/><circle class="bub b2" cx="170" cy="122" r="3" fill="#fff" opacity=".7"/>` : ""}</g>
    <rect x="140" y="20" width="8" height="70" rx="4" fill="#fff" opacity=".6"/>
    ${[0, 1, 2].map(i => `<circle cx="${40 + i * 30}" cy="60" r="9" fill="${fill * 3 > i ? "#FFC800" : "#C9D2E0"}" ${fill * 3 > i ? 'class="lamp"' : ""}/>`).join("")}
    <path d="M220 60 h70 M220 80 h50 M220 100 h60" stroke="#C9D2E0" stroke-width="6" stroke-linecap="round"/>
    <path d="M260 40 l-12 26 h14 l-10 26 l26 -34 h-14 l10 -18z" fill="${power ? "#FFC800" : "#C9D2E0"}" ${power ? 'class="lamp"' : ""}/>
    <text x="70" y="118" text-anchor="middle" font-size="15" font-weight="900" fill="#5B4B49" font-family="M PLUS Rounded 1c, sans-serif">${power ? "POWER ON" : `${Math.round(fill * 100)}%`}</text></svg>`;
}
function openMachine() {
  const sp = specRun(), room = R.room;
  if (sp.power) { toast("⚙️ The Bio-Machine is already humming. ⚡"); return; }
  if (sp.found.length < 3) {
    SFX.wrong();
    openModal(`<span class="kicker">⚙️ Bio-Machine</span><h2>Missing specimens</h2>${machineSvg(0, false)}
      ${say("chiikawa", `The machine needs <b>3 specimens</b> to run. You have <b>${sp.found.length}</b>. Sweep your torch over the dark room and look for something <b>shimmering</b>. 🔦`, "normal", "hint")}
      <div class="row"><button class="btn primary" id="mBack">🔦 Keep searching</button></div>`);
    document.getElementById("mBack").onclick = () => { SFX.tap(); closeModal(); };
    return;
  }
  const terms = sp.terms.map(i => room.terms[i]);
  const decoy = shuffle(room.terms.filter((_, i) => !sp.terms.includes(i) && room.terms[i][1].length <= 80)).slice(0, 1);
  const socks = shuffle(terms.map((x, i) => ({ m: x[1], k: i })).concat(decoy.map(x => ({ m: x[1], k: -1 }))));
  let sel = null;
  const draw = () => {
    const fill = sp.wired.length / 3;
    const box = openModal(`<span class="kicker">⚙️ Bio-Machine · wire the specimens</span><h2>Connect each specimen to its function</h2>
      <div class="machinewrap">${machineSvg(fill, false)}</div>
      ${say("chiikawa", sel == null ? "Tap a <b>specimen plug</b> on the left, then the <b>function socket</b> it belongs to. One socket is a trick! ⚡" : `Now tap the function for <b>${esc(terms[sel][0])}</b>...`, "brave")}
      <div class="wires"><div class="wcol">${terms.map(([t], i) => `<button class="plug ${sp.wired.includes(i) ? "done" : sel === i ? "sel" : ""}" data-plug="${i}" ${sp.wired.includes(i) ? "disabled" : ""}><span>${SPEC_ICONS[(sp.terms[i] + i) % SPEC_ICONS.length]}</span>${esc(t)}</button>`).join("")}</div>
        <div class="wcol">${socks.map((s, j) => `<button class="sock ${s.k >= 0 && sp.wired.includes(s.k) ? "done" : ""}" data-sock="${j}" ${s.k >= 0 && sp.wired.includes(s.k) ? "disabled" : ""}>${esc(s.m)}</button>`).join("")}</div></div>
      <div id="mfb"></div>`, { wide: true });
    box.querySelectorAll("[data-plug]").forEach(b => b.onclick = () => { SFX.click(); sel = Number(b.dataset.plug); draw(); });
    box.querySelectorAll("[data-sock]").forEach(b => b.onclick = () => {
      if (sel == null) { toast("Tap a specimen plug first 👈"); return; }
      const s = socks[Number(b.dataset.sock)];
      if (s.k === sel) {
        sp.wired.push(sel); sel = null; save(); SFX.right(); S.stats.correct += 1;
        if (sp.wired.length === 3) { sp.power = true; save(); gainCoins(5); return powerUp(); }
        draw();
      } else {
        SFX.wrong(); b.classList.add("spark"); setTimeout(() => b.classList.remove("spark"), 500);
        if (!R.study) { S.room_timer[room.id] -= 10; updateTimerEl(); }
        const mf = document.getElementById("mfb"); if (mf) mf.innerHTML = say("chiikawa", `Bzzt! ⚡ That's not what <b>${esc(terms[sel][0])}</b> does.${R.study ? "" : " (−10 s)"} Check 📓 the notes if you're unsure.`, "normal", "hint");
      }
    });
  };
  draw();
}
function powerUp() {
  SFX.fanfare(); confetti(120); yaha("Power on!");
  openModal(`<span class="kicker">⚙️ Bio-Machine</span><h2>⚡ Power on!</h2><div class="machinewrap powered">${machineSvg(1, true)}</div>
    ${say("chiikawa", "WAHOO!!! The machine is humming and the door lamp turned GREEN!⚡", "happy")}
    <div class="terms">${specRun().terms.map(i => R.room.terms[i]).map(([t, m]) => `<span class="term"><b>${esc(t)}</b><span class="def">${esc(m)}</span></span>`).join("")}</div>
    <div class="row"><button class="btn primary" id="pwOk">${(S.room_progress[R.room.id] || []).length === 5 ? "🚪 To the exit door" : "🔓 Back to the locks"}</button></div>`);
  document.getElementById("pwOk").onclick = () => { SFX.tap(); closeModal(); renderRoom(); };
}
