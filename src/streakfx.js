
/* ============================================================
   5i. 🔥 Streak-up ceremony: plays once, the moment the streak grows (markStudied).
   Beats: charge-up (embers fly into the flame) → odometer rolls the old number to the new one (99 → 100)
   → boom (shockwave + ember burst; milestones add 2 impact frames, light rays, a title slam and confetti)
   → this week's dots light up → tap anywhere to continue. The flame "evolves" at 7, 30 and 100 days.
   Reduced motion: no flashes or movement, the final card is shown and the text stays.
   ============================================================ */
const STREAK_TITLES = { 3: "Spark lit!", 7: "One whole week!", 14: "Two weeks strong!", 21: "Habit unlocked!", 30: "One month!", 50: "Half a hundred!", 75: "Unstoppable!", 100: "100 DAYS!", 150: "Streak legend!", 200: "Mythic streak!", 365: "One full year!" };
const FLAME_TIERS = [
  { min: 100, id: "myth", name: "Mythic flame", c: ["#7B4DFF", "#FF6FD8", "#FFF3FF"] },
  { min: 30, id: "blue", name: "Blue flame", c: ["#2F6BFF", "#6FD3FF", "#EFFFFF"] },
  { min: 7, id: "gold", name: "Golden flame", c: ["#FF9F1C", "#FFD93D", "#FFFBE0"] },
  { min: 0, id: "orange", name: "Little flame", c: ["#FF5A36", "#FFA62B", "#FFF1C9"] }
];
const flameTier = n => FLAME_TIERS.find(t => n >= t.min);
// Original kawaii flame: three layered tongues, a bright core and a little face. Gradient ids get a random suffix.
function flameSvg(n, mood = "happy") {
  const t = flameTier(n), u = Math.random().toString(36).slice(2, 7);
  const face = mood === "sleep" ? `<path d="M41 70q4 3 8 0M55 70q4 3 8 0" stroke="#5B3A29" stroke-width="3" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="44" cy="69" rx="3.6" ry="4.6" fill="#5B3A29"/><ellipse cx="60" cy="69" rx="3.6" ry="4.6" fill="#5B3A29"/><circle cx="45.2" cy="67.4" r="1.3" fill="#fff"/><circle cx="61.2" cy="67.4" r="1.3" fill="#fff"/>
       <path d="M47 77q5 5 10 0" stroke="#5B3A29" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="37" cy="76" rx="4" ry="2.4" fill="#FF7A9C" opacity=".55"/><ellipse cx="67" cy="76" rx="4" ry="2.4" fill="#FF7A9C" opacity=".55"/>`;
  return `<svg class="flamesvg fl-${t.id}" viewBox="0 0 104 112" aria-hidden="true"><defs>
      <linearGradient id="fo${u}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${t.c[0]}"/><stop offset="1" stop-color="${t.c[1]}"/></linearGradient>
      <radialGradient id="fc${u}" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="${t.c[2]}"/><stop offset=".7" stop-color="${t.c[1]}"/><stop offset="1" stop-color="${t.c[1]}" stop-opacity="0"/></radialGradient></defs>
    <g class="fl-tongues">
      <path class="fl-out" d="M52 6C60 24 86 34 86 66c0 24-16 40-34 40S18 90 18 66c0-14 8-22 14-30 2 10 6 14 10 15C38 34 44 18 52 6z" fill="url(#fo${u})" stroke="#5B3A29" stroke-width="4" stroke-linejoin="round"/>
      <path class="fl-mid" d="M66 34c8 10 12 20 10 32-2 14-12 22-24 22s-22-8-23-20c4 4 8 5 11 4-3-10 2-20 8-26 1 8 4 12 8 13 2-10 6-18 10-25z" fill="${t.c[1]}" opacity=".9"/>
      <ellipse class="fl-core" cx="52" cy="76" rx="22" ry="20" fill="url(#fc${u})"/></g>${face}</svg>`;
}
const dayStr = n => new Date(n * 86400000).toISOString().slice(0, 10);
function streakCeremony(n, prev, after = []) {
  const big = STREAK_MILESTONES.includes(n) || !!STREAK_TITLES[n], from = Math.max(0, prev == null ? n - 1 : prev);
  const evolve = n > 1 && flameTier(from).id !== flameTier(n).id, calm = reduced();
  const a = String(n), b = String(from).padStart(a.length, " ");
  const odo = [...a].map((ch, i) => {
    const o = b[i]; let strip;
    if (o === ch) strip = [ch]; else if (o === " ") strip = ["", ch];
    else { strip = [o]; let d = +o; while (String(d) !== ch && strip.length < 11) { d = (d + 1) % 10; strip.push(String(d)); } }
    return `<span class="odo-col" style="--n:${strip.length - 1};--i:${a.length - 1 - i}"><span class="odo-strip">${strip.map(s => `<i>${s || "&nbsp;"}</i>`).join("")}</span></span>`;
  }).join("");
  const t = dayNum(today()), studied = S.study_days || [];
  const week = Array.from({ length: 7 }, (_, k) => { const ds = dayStr(t - 6 + k), on = k === 6 || studied.includes(ds);
    return `<span class="sfx-dot ${on ? "on" : ""} ${k === 6 ? "today" : ""}" style="--k:${k}" title="${ds}">${k === 6 ? "🔥" : on ? "✓" : ""}</span>`; }).join("");
  const nextM = STREAK_MILESTONES.find(m => m > n), title = STREAK_TITLES[n] || (n === 1 ? "Streak started!" : "Streak up!");
  document.querySelectorAll(".sfx-ov").forEach(o => o.remove());
  const ov = document.createElement("div");
  ov.className = `sfx-ov ${big ? "big" : ""} ${evolve ? "evolve" : ""} ${calm ? "final calm" : ""}`;
  ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", `${n}-day streak. ${title}`);
  ov.innerHTML = `<div class="sfx-dim"></div>${big ? `<div class="sfx-rays"></div>` : ""}
    <div class="sfx-stage">
      <div class="sfx-embers" aria-hidden="true">${Array.from({ length: 14 }, (_, k) => `<i style="--a:${k * 360 / 14}deg;--d:${(k % 5) * 60}ms"></i>`).join("")}</div>
      <div class="sfx-ring" aria-hidden="true"></div><div class="sfx-ring r2" aria-hidden="true"></div>
      <div class="sfx-burst" aria-hidden="true">${Array.from({ length: 16 }, (_, k) => `<i style="--a:${k * 360 / 16 + 11}deg"></i>`).join("")}</div>
      <div class="sfx-flame"><div class="sfx-old">${flameSvg(from || 1)}</div><div class="sfx-new">${flameSvg(n)}</div></div>
      <div class="sfx-num" aria-hidden="true">${odo}</div>
      <div class="sfx-unit">day streak</div>
      <div class="sfx-title">${esc(title)}</div>
      ${evolve ? `<div class="sfx-evo">✨ ${flameTier(n).name} unlocked!</div>` : ""}
      <div class="sfx-week" aria-label="This week">${week}</div>
      <div class="sfx-next small">${nextM ? `Next goal: <b>${nextM} days</b> · ${nextM - n} to go` : "You're a streak legend!"} · Rewards ×${streakMult().toFixed(2).replace(/0$/, "")}</div>
      <div class="sfx-pal" aria-hidden="true">${figure("chiikawa", "happy", {})}</div>
      <div class="sfx-tap">Tap to continue</div>
    </div><div class="sfx-flash" aria-hidden="true"></div>`;
  document.body.appendChild(ov);
  const timers = [], at = (ms, f) => timers.push(setTimeout(f, ms));
  let done = false;
  const finish = () => { if (done) return; done = true; timers.forEach(clearTimeout); ov.classList.add("out"); setTimeout(() => { ov.remove(); after.forEach(f => f()); }, 380); };
  const toFinal = () => { timers.forEach(clearTimeout); timers.length = 0; ov.classList.add("final"); at(big ? 5200 : 3200, finish); };
  let armed = false; setTimeout(() => { armed = true; }, 450);
  ov.addEventListener("click", () => { if (!armed) return; ov.classList.contains("final") ? finish() : toFinal(); });
  if (calm) { SFX.fanfare(); at(4200, finish); return ov; }
  requestAnimationFrame(() => ov.classList.add("in"));
  at(950, () => { ov.classList.add("roll"); [...a].forEach((_, i) => at(i * 250, () => SFX.tick())); });
  const boomAt = 1500 + (a.length - 1) * 250;
  if (big) {   // two single impact frames, once (photosensitivity-safe)
    at(boomAt - 90, () => ov.classList.add("imp1"));
    at(boomAt - 48, () => { ov.classList.remove("imp1"); ov.classList.add("imp2"); });
  }
  at(boomAt, () => { ov.classList.remove("imp2"); ov.classList.add("boom"); SFX.fanfare(); if (big) { confetti(220); SFX.yaha(); } });
  at(boomAt + 700, () => ov.classList.add("sfx-wk"));
  at(boomAt + 700 + 7 * 90, () => { ov.classList.add("final"); SFX.item(); });
  at(boomAt + (big ? 5200 : 3400), finish);
  return ov;
}
