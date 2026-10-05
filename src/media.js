
/* ============================================================
   3c. 🎬 Media for questions: virtual-lab scenes (some animated), tap targets, mini graphs for graph choices.
   Everything is an inline SVG string built at load time (no DOM here, so tools/check_content.js can run it).
   SCENE[kind](params) → { svg, kinds, alt }   kinds[i] = what tap target i is (for "tap it" questions);
   alt = a text description (shown under animated scenes for anyone who can't watch them).
   ============================================================ */
// Small seeded random generator, so a scene looks the same for every student and every visit
const seeded = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const mTxt = (x, y, t, o = {}) => `<text x="${x}" y="${y}" fill="${o.c || INK}" font-size="${o.s || 11}" font-weight="${o.w || 700}" text-anchor="${o.a || "middle"}" dominant-baseline="middle">${t}</text>`;
const tapAttr = (i, tap) => tap ? ` class="tapt" data-t="${i}" tabindex="0" role="button" aria-label="Choice ${i + 1}"` : "";
// A looping 10-second stopwatch (for counting things in animations)
const clock10 = (x, y, secs = 10) => `<g transform="translate(${x} ${y})"><circle r="16" fill="#fff" stroke="${INK}" stroke-width="2"/>${[0, 1, 2, 3].map(k => `<path d="M0 -16 v4" stroke="${INK}" stroke-width="1.6" transform="rotate(${k * 90})"/>`).join("")}
  <path d="M0 0 V-12" stroke="${PINK}" stroke-width="2.6" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="${secs}s" repeatCount="indefinite"/></path><circle r="2.4" fill="${INK}"/>${mTxt(0, 26, `${secs} s loop`, { s: 9.5 })}</g>`;

const SCENE = {
  /* 🫧 Pondweed in tubes at different lamp distances, giving off bubbles. tubes: [{ lbl, every (s per bubble) }] */
  bubbles({ tubes, item = "weed" }) {
    const n = tubes.length, W = 330, H = 210, gap = (W - 70) / n;
    let s = `${svgOpen(W, H, "Animated pondweed tubes giving off bubbles")}<rect width="${W}" height="${H}" rx="14" fill="#F4F8FF"/>${clock10(W - 30, 34)}`;
    tubes.forEach((t, i) => {
      const x = 22 + gap * i + gap / 2 - 20;
      s += `<rect x="${x}" y="40" width="40" height="130" rx="14" fill="#D3E9FF" stroke="${INK}" stroke-width="2"/>
        ${item === "weed" ? `<path d="M${x + 20} 160 q-10 -18 0 -34 q10 -16 0 -32" fill="none" stroke="#3E8E3A" stroke-width="5" stroke-linecap="round"/><path d="M${x + 20} 150 l-10 -6 M${x + 20} 128 l10 -6 M${x + 20} 108 l-9 -7" stroke="#3E8E3A" stroke-width="4" stroke-linecap="round"/>`
          : item === "liver" ? `<path d="M${x + 8} 160 q2 -14 12 -12 q12 -6 14 8 q2 8 -8 8 q-12 4 -18 -4Z" fill="#8E3B2E" stroke="${INK}" stroke-width="1.4"/>`
          : `<rect x="${x + 3}" y="104" width="34" height="62" rx="12" fill="#F2E3B8" opacity=".9"/>${[[12, 130], [24, 142], [16, 154], [28, 120]].map(([a, b]) => `<circle cx="${x + a}" cy="${b}" r="2.4" fill="#C9A24D"/>`).join("")}`}
        ${!t.every ? "" : `<circle cx="${x + 20}" cy="96" r="4.5" fill="#fff" stroke="${INK}" stroke-width="1.4" opacity="0"><animate attributeName="cy" values="96;46" dur="${t.every}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.85;1" dur="${t.every}s" repeatCount="indefinite"/></circle>`}
        ${mTxt(x + 20, 186, t.lbl, { s: 11.5 })}${mTxt(x + 20, 200, `Tube ${"ABCD"[i]}`, { s: 10, c: SOFT })}`;
    });
    return { svg: s.replace('aria-label="Animated pondweed tubes giving off bubbles"', `aria-label="Animated tubes giving off gas bubbles"`) + "</svg>", alt: tubes.map((t, i) => t.every ? `Tube ${"ABCD"[i]} (${t.lbl}): one bubble every ${t.every} s, so ${+(10 / t.every).toFixed(1)} bubbles in 10 s.` : `Tube ${"ABCD"[i]} (${t.lbl}): no bubbles.`).join(" ") };
  },
  /* 🧪 Coloured bead moving along a capillary tube (respirometer / potometer), time-lapse. tubes: [{ lbl, mm, dir }], max (mm), mins */
  bead({ tubes, max = 50, mins = 5, what = "minutes" }) {
    const W = 330, rowH = 58, H = 34 + rowH * tubes.length, L = 46, R = 312, X = v => L + (R - L) * v / max;
    let s = `${svgOpen(W, H, "Animated capillary tube with a moving coloured bead")}<rect width="${W}" height="${H}" rx="14" fill="#FFFBF2"/>${mTxt(W / 2, 14, `Time-lapse: ${mins} ${what} shown in 5 seconds`, { s: 10.5, c: SOFT })}`;
    tubes.forEach((t, i) => {
      const y = 40 + rowH * i, to = X(t.mm) - X(0);
      s += `${mTxt(8, y + 2, t.lbl, { a: "start", s: 10.5 })}<rect x="${L - 6}" y="${y + 10}" width="${R - L + 12}" height="10" rx="5" fill="#E8F2FF" stroke="${INK}" stroke-width="1.6"/>`;
      for (let v = 0; v <= max; v += 5) s += `<path d="M${X(v)} ${y + 22} v${v % 10 ? 4 : 7}" stroke="${INK}" stroke-width="1.2"/>${v % 10 ? "" : mTxt(X(v), y + 36, v, { s: 9.5 })}`;
      s += `<rect x="${X(0) - 4}" y="${y + 11}" width="8" height="8" rx="2" fill="${PINK}" stroke="${INK}" stroke-width="1"><animateTransform attributeName="transform" type="translate" values="0 0;${to} 0;${to} 0" keyTimes="0;.77;1" dur="6.5s" repeatCount="indefinite"/></rect>`;
    });
    s += mTxt(W - 18, H - 6, "mm", { s: 9.5, c: SOFT });
    return { svg: s + "</svg>", alt: tubes.map(t => `${t.lbl}: the bead moves from 0 to ${t.mm} mm in ${mins} ${what}.`).join(" ") };
  },
  /* ❤️ Heart-trace strip, 6 s long, with a sweeping cursor. bpm */
  ecg({ bpm, secs = 6, lbl = "" }) {
    const W = 330, H = 130, L = 14, R = 316, X = t => L + (R - L) * t / secs, base = 78, per = 60 / bpm;
    let s = `${svgOpen(W, H, `Heart trace strip of ${secs} seconds`)}<rect width="${W}" height="${H}" rx="12" fill="#FFF5F5"/>`;
    for (let t = 0; t <= secs; t += 0.2) s += `<path d="M${X(t).toFixed(1)} 26 V${H - 22}" stroke="${Math.abs(t - Math.round(t)) < 1e-6 ? "#F2A3A3" : "#FBDADA"}" stroke-width="${Math.abs(t - Math.round(t)) < 1e-6 ? 1.4 : .7}"/>`;
    for (let t = 0; t <= secs; t++) s += mTxt(X(t), H - 10, `${t} s`, { s: 9.5, c: SOFT });
    let d = `M${L} ${base}`;
    for (let t = per * .35; t < secs; t += per) {
      const x = X(t), u = (R - L) / secs;
      d += ` L${(x - .18 * u).toFixed(1)} ${base} q${(.06 * u).toFixed(1)} -8 ${(.12 * u).toFixed(1)} 0 L${(x - .03 * u).toFixed(1)} ${base} L${x.toFixed(1)} ${base - 44} L${(x + .04 * u).toFixed(1)} ${base + 12} L${(x + .08 * u).toFixed(1)} ${base} L${(x + .2 * u).toFixed(1)} ${base} q${(.08 * u).toFixed(1)} -12 ${(.18 * u).toFixed(1)} 0`;
    }
    d += ` L${R} ${base}`;
    s += `<path d="${d}" fill="none" stroke="#C0392B" stroke-width="2" stroke-linejoin="round"/>${lbl ? mTxt(L + 4, 14, lbl, { a: "start", s: 10.5 }) : ""}
      <rect x="${L}" y="24" width="3" height="${H - 46}" fill="${INK}" opacity=".35"><animate attributeName="x" values="${L};${R}" dur="${secs}s" repeatCount="indefinite"/></rect>`;
    return { svg: s + "</svg>", alt: `A ${secs}-second heart trace${lbl ? ` (${lbl})` : ""} with one tall spike per beat, about ${Math.floor((secs - per * .35) / per) + 1} spikes.` };
  },
  /* 🔬 Root-tip field of view (a fixed layout). counts: { I, P, M, A, T }, seed */
  mitosis({ counts, seed = 7, tap }) {
    const kinds = []; Object.entries(counts).forEach(([k, n]) => { for (let i = 0; i < n; i++) kinds.push(k); });
    const rnd = seeded(seed); for (let i = kinds.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [kinds[i], kinds[j]] = [kinds[j], kinds[i]]; }
    const cols = 6, rows = Math.ceil(kinds.length / cols), cw = 52, ch = 44, W = 18 + cols * cw, H = 16 + rows * ch;
    let s = `${svgOpen(W, H, "Microscope view of root tip cells at different stages")}<rect width="${W}" height="${H}" rx="14" fill="#FCEFF5"/>`;
    const chrom = (x, y, r = 0) => `<path d="M${x - 3} ${y - 5} L${x + 3} ${y + 5} M${x + 3} ${y - 5} L${x - 3} ${y + 5}" stroke="#7A2B5E" stroke-width="2.2" stroke-linecap="round" transform="rotate(${r} ${x} ${y})"/>`;
    kinds.forEach((k, i) => {
      const cx = 9 + (i % cols) * cw + cw / 2, cy = 8 + Math.floor(i / cols) * ch + ch / 2;
      let g = "";
      if (k === "T") g = `<path d="M${cx - 22} ${cy} q0 -18 11 -18 q11 0 11 8 q0 -8 11 -8 q11 0 11 18 q0 18 -11 18 q-11 0 -11 -8 q0 8 -11 8 q-11 0 -11 -18Z" fill="#FFE3EE" stroke="${INK}" stroke-width="1.4"/><circle cx="${cx - 11}" cy="${cy}" r="6" fill="#C98BB9"/><circle cx="${cx + 11}" cy="${cy}" r="6" fill="#C98BB9"/>`;
      else {
        g = `<rect x="${cx - 23}" y="${cy - 19}" width="46" height="38" rx="9" fill="#FFE3EE" stroke="${INK}" stroke-width="1.4"/>`;
        if (k === "I") g += `<circle cx="${cx}" cy="${cy}" r="9" fill="#C98BB9"/><circle cx="${cx + 2}" cy="${cy - 2}" r="2.6" fill="#7A2B5E"/>`;
        if (k === "P") g += `<circle cx="${cx}" cy="${cy}" r="11" fill="#E9C3DD" stroke="#7A2B5E" stroke-width="1.2" stroke-dasharray="3 3"/>${[[-4, -4, 20], [4, -3, -30], [-3, 5, 70], [5, 4, 10]].map(([a, b, r]) => `<path d="M${cx + a - 3} ${cy + b} q3 -4 6 0" fill="none" stroke="#7A2B5E" stroke-width="2.2" stroke-linecap="round" transform="rotate(${r} ${cx + a} ${cy + b})"/>`).join("")}`;
        if (k === "M") g += `<path d="M${cx - 18} ${cy} L${cx} ${cy - 14} L${cx + 18} ${cy} L${cx} ${cy + 14}Z" fill="none" stroke="#D9B2CC" stroke-width=".9"/>${[-10, -3.5, 3.5, 10].map(dy => chrom(cx, cy + dy, 90)).join("")}`;
        if (k === "A") g += `<path d="M${cx - 18} ${cy} H${cx + 18}" stroke="#D9B2CC" stroke-width=".9"/>${[-8, 0, 8].map(dy => `<path d="M${cx - 14} ${cy + dy - 3} l-5 3 l5 3 M${cx + 14} ${cy + dy - 3} l5 3 l-5 3" fill="none" stroke="#7A2B5E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}`;
      }
      s += `<g${tapAttr(i, tap)}>${g}</g>`;
    });
    return { svg: s + "</svg>", kinds, alt: `${kinds.length} cells.` };
  },
  /* 🧫 Agar plate with antiseptic discs and clear zones. discs: [{ lbl, zone (mm diameter) }]; plate 90 mm wide with a ruler */
  plate({ discs, tap }) {
    const W = 330, H = 250, cx = 165, cy = 112, R = 100, k = 2 * R / 90;
    let s = `${svgOpen(W, H, "Agar plate covered in bacteria with antiseptic discs and clear zones")}<rect width="${W}" height="${H}" rx="14" fill="#F8F5EC"/>
      <circle cx="${cx}" cy="${cy}" r="${R + 6}" fill="#fff" stroke="${INK}" stroke-width="2.4"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="#E9D79A"/>`;
    const rnd = seeded(3); for (let i = 0; i < 260; i++) { const a = rnd() * 6.283, r = Math.sqrt(rnd()) * (R - 3); s += `<circle cx="${(cx + r * Math.cos(a)).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}" r="1.3" fill="#C9AE5C"/>`; }
    const pos = [[-44, -40], [44, -40], [-44, 42], [44, 42], [0, 0]];
    discs.forEach((d, i) => { const [dx, dy] = pos[i]; s += `<g${tapAttr(i, tap)}><circle cx="${cx + dx}" cy="${cy + dy}" r="${(d.zone * k / 2).toFixed(1)}" fill="#F7F0D8" stroke="#E2D3A4" stroke-width="1"/><circle cx="${cx + dx}" cy="${cy + dy}" r="${(6 * k / 2).toFixed(1)}" fill="#fff" stroke="${INK}" stroke-width="1.4"/>${mTxt(cx + dx, cy + dy, d.lbl, { s: 10 })}</g>`; });
    const y = H - 22; s += `<path d="M${cx - R} ${y} H${cx + R}" stroke="${INK}" stroke-width="1.6"/>`;
    for (let v = 0; v <= 90; v += 5) s += `<path d="M${(cx - R + v * k).toFixed(1)} ${y} v${v % 10 ? -4 : -7}" stroke="${INK}" stroke-width="1.2"/>${v % 10 ? "" : mTxt(cx - R + v * k, y + 10, v, { s: 9 })}`;
    s += mTxt(cx + R + 16, y + 10, "mm", { s: 9, c: SOFT });
    return { svg: s + "</svg>", kinds: discs.map(d => d.lbl), alt: discs.map(d => `Disc ${d.lbl}: clear zone ${d.zone} mm across.`).join(" ") };
  },
  /* 🌼 A 0.25 m² quadrat (10 × 10 squares) with plants. plants: [{ n, icon: "daisy" | "clover", seed }] */
  quadrat({ plants }) {
    const W = 330, H = 236, L = 55, T = 8, sz = 220, c = sz / 10;
    let s = `${svgOpen(W, H, "Quadrat divided into 100 squares with plants growing in it")}<rect width="${W}" height="${H}" rx="14" fill="#E9F6E4"/><rect x="${L}" y="${T}" width="${sz}" height="${sz}" fill="#CDEBC1" stroke="${INK}" stroke-width="2.4"/>`;
    for (let i = 1; i < 10; i++) s += `<path d="M${L + i * c} ${T} V${T + sz} M${L} ${T + i * c} H${L + sz}" stroke="#8DB57E" stroke-width=".8"/>`;
    const used = new Set();
    plants.forEach(p => { const rnd = seeded(p.seed || 11); let placed = 0, guard = 0;
      while (placed < p.n && guard++ < 999) { const gx = Math.floor(rnd() * 10), gy = Math.floor(rnd() * 10), key = gx + "," + gy; if (used.has(key)) continue; used.add(key); placed++;
        const x = L + gx * c + c / 2, y = T + gy * c + c / 2;
        s += p.icon === "clover" ? `<g fill="#3E8E3A" stroke="${INK}" stroke-width=".7">${[0, 120, 240].map(r => `<circle cx="${x}" cy="${y - 4}" r="4" transform="rotate(${r} ${x} ${y})"/>`).join("")}</g>`
          : `<g>${[0, 60, 120, 180, 240, 300].map(r => `<ellipse cx="${x}" cy="${y - 5}" rx="2.4" ry="4.4" fill="#fff" stroke="#B9AFA0" stroke-width=".5" transform="rotate(${r} ${x} ${y})"/>`).join("")}<circle cx="${x}" cy="${y}" r="2.8" fill="#F5C518"/></g>`; } });
    s += mTxt(L - 30, T + sz / 2, "50 cm", { s: 10, c: SOFT });
    return { svg: s + "</svg>", alt: plants.map(p => `${p.n} ${p.icon === "clover" ? "clover plants" : "daisies"}, each in a different small square.`).join(" ") };
  },
  /* 🌈 Paper chromatogram with a cm ruler. front (cm), spots: [{ d (cm), c, tap label }] */
  chrom({ front, spots, tap }) {
    const W = 330, H = 270, L = 120, T = 18, B = 250, X0 = 150, cm = (B - T - 10) / 10, Y = v => B - v * cm;
    let s = `${svgOpen(W, H, "Paper chromatogram next to a centimetre ruler")}<rect width="${W}" height="${H}" rx="14" fill="#F6F3EE"/><rect x="${X0}" y="${T}" width="70" height="${B - T + 6}" fill="#fff" stroke="${INK}" stroke-width="1.8"/>`;
    for (let v = 0; v <= 10; v += 0.5) s += `<path d="M${L} ${Y(v).toFixed(1)} h${v % 1 ? 6 : 12}" stroke="${INK}" stroke-width="1.2"/>${v % 1 ? "" : mTxt(L - 10, Y(v), v, { s: 9.5 })}`;
    s += `<path d="M${L} ${Y(10)} V${Y(0)}" stroke="${INK}" stroke-width="1.6"/>${mTxt(L - 10, T - 6, "cm", { s: 9, c: SOFT })}
      <path d="M${X0} ${Y(0)} h70" stroke="${SOFT}" stroke-width="1.2" stroke-dasharray="4 3"/>${mTxt(X0 + 104, Y(0), "start line", { s: 9.5, c: SOFT, a: "middle" })}
      <path d="M${X0} ${Y(front)} h70" stroke="#3B6FC0" stroke-width="1.6" stroke-dasharray="6 3"/>${mTxt(X0 + 108, Y(front), "solvent front", { s: 9.5, c: "#3B6FC0" })}`;
    spots.forEach((p, i) => { s += `<g${tapAttr(i, tap)}><ellipse cx="${X0 + 35}" cy="${Y(p.d)}" rx="13" ry="6" fill="${p.c}" stroke="${INK}" stroke-width=".8" opacity=".9"/></g>`; });
    return { svg: s + "</svg>", kinds: spots.map(p => p.name || ""), alt: `Solvent front at ${front} cm. ` + spots.map(p => `${p.name || "A spot"} at ${p.d} cm.`).join(" ") };
  },
  /* 🧅 Plant cells in a solution: turgid or plasmolysed. cells: string of "t"/"p", seed */
  plasmo({ cells, tap }) {
    const n = cells.length, cols = 6, cw = 50, ch = 40, W = 20 + cols * cw, H = 16 + Math.ceil(n / cols) * ch;
    let s = `${svgOpen(W, H, "Microscope view of plant epidermis cells")}<rect width="${W}" height="${H}" rx="14" fill="#F3F7EA"/>`;
    [...cells].forEach((k, i) => {
      const x = 10 + (i % cols) * cw, y = 8 + Math.floor(i / cols) * ch;
      const inner = k === "t" ? `<rect x="${x + 3}" y="${y + 3}" width="${cw - 6}" height="${ch - 6}" rx="3" fill="#D97BA6" opacity=".75"/>`
        : `<path d="M${x + 12} ${y + 10} q10 -6 22 0 q6 10 0 20 q-12 6 -22 0 q-5 -10 0 -20Z" fill="#D97BA6" opacity=".85"/>`;
      s += `<g${tapAttr(i, tap)}><rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="#FBFFF4" stroke="${INK}" stroke-width="2"/>${inner}</g>`;
    });
    return { svg: s + "</svg>", kinds: [...cells], alt: `${n} cells.` };
  },
  /* 📏 A cell seen against an eyepiece graticule (0–100 units). from, to (units), what */
  graticule({ from, to, what = "cell" }) {
    const W = 330, H = 150, L = 20, R = 310, X = v => L + (R - L) * v / 100;
    let s = `${svgOpen(W, H, `A ${what} viewed against an eyepiece graticule`)}<rect width="${W}" height="${H}" rx="14" fill="#EEF3FB"/><circle cx="${W / 2}" cy="${H / 2 + 8}" r="150" fill="none"/>`;
    const cx = (X(from) + X(to)) / 2, rx = (X(to) - X(from)) / 2;
    s += `<ellipse cx="${cx}" cy="70" rx="${rx}" ry="30" fill="#E9F5DD" stroke="#3E8E3A" stroke-width="2"/><circle cx="${cx + rx * .3}" cy="66" r="9" fill="#B9A7D9" stroke="${INK}" stroke-width="1"/>`;
    s += `<path d="M${L} 112 H${R}" stroke="${INK}" stroke-width="1.6"/>`;
    for (let v = 0; v <= 100; v += 5) s += `<path d="M${X(v)} 112 v${v % 10 ? -5 : -10}" stroke="${INK}" stroke-width="1.2"/>${v % 10 ? "" : mTxt(X(v), 124, v, { s: 9 })}`;
    s += `<path d="M${X(from)} 40 V112 M${X(to)} 40 V112" stroke="${PINK}" stroke-width="1" stroke-dasharray="3 3"/>${mTxt(W / 2, 140, "eyepiece graticule units", { s: 9.5, c: SOFT })}`;
    return { svg: s + "</svg>", alt: `The ${what} spans from ${from} to ${to} graticule units.` };
  },
  /* 🧬 DNA profiling gel. lanes: [{ lbl, bands: [size in kb, 1–12] }] (bigger fragments travel less far) */
  gel({ lanes, tap }) {
    const n = lanes.length, W = 330, H = 230, L = 46, lw = (W - L - 14) / n, T = 40, B = 210, Y = s => T + (12 - s) / 11 * (B - T);
    let s = `${svgOpen(W, H, "DNA profiling gel with bands in lanes")}<rect width="${W}" height="${H}" rx="14" fill="#1F2A44"/>`;
    for (let k = 2; k <= 12; k += 2) s += `${mTxt(L - 12, Y(k), k, { s: 9, c: "#B8C4E0" })}<path d="M${L - 4} ${Y(k)} h4" stroke="#B8C4E0"/>`;
    s += mTxt(22, 18, "kb", { s: 9, c: "#B8C4E0" });
    lanes.forEach((ln, i) => { const x = L + lw * i + 6, w = lw - 12;
      s += `<g${tapAttr(i, tap)}><rect x="${x - 3}" y="${T - 14}" width="${w + 6}" height="${B - T + 22}" rx="6" fill="#26355A"/>${mTxt(x + w / 2, T - 24, ln.lbl, { s: 10.5, c: "#fff" })}
        ${ln.bands.map(b => `<rect x="${x}" y="${(Y(b) - 3).toFixed(1)}" width="${w}" height="6" rx="2" fill="#7FE3FF"/>`).join("")}</g>`; });
    return { svg: s + "</svg>", kinds: lanes.map(l => l.lbl), alt: lanes.map(l => `${l.lbl}: bands at ${l.bands.join(", ")} kb.`).join(" ") };
  },
  /* 👪 Family tree. people: [[label, "m"|"f", affected, generation, column]], pairs: [[a, b]], kids: [[pairIndex, [labels]]]; carriers shown half-shaded if c: true */
  pedigree({ people, pairs, kids, tap }) {
    const cols = Math.max(...people.map(p => p[4])) + 1, gens = Math.max(...people.map(p => p[3])) + 1, W = 330, cw = (W - 40) / cols, gh = 72, H = 30 + gens * gh;
    const at = Object.fromEntries(people.map(([l, sx, a, g, c]) => [l, { x: 20 + cw * c + cw / 2, y: 30 + g * gh }]));
    let s = `${svgOpen(W, H, "Family tree")}<rect width="${W}" height="${H}" rx="14" fill="#FBF8FF"/>`;
    pairs.forEach(([a, b], k) => { const A = at[a], B = at[b]; s += `<path d="M${A.x} ${A.y} H${B.x}" stroke="${INK}" stroke-width="1.8"/>`;
      const ch = (kids.find(x => x[0] === k) || [0, []])[1]; if (!ch.length) return;
      const mx = (A.x + B.x) / 2, ys = A.y + gh / 2, xs = ch.map(l => at[l].x);
      s += `<path d="M${mx} ${A.y} V${ys} M${Math.min(...xs, mx)} ${ys} H${Math.max(...xs, mx)}" stroke="${INK}" stroke-width="1.8"/>${xs.map(x => `<path d="M${x} ${ys} V${at[ch[0]].y - 13}" stroke="${INK}" stroke-width="1.8"/>`).join("")}`; });
    people.forEach(([l, sx, a], i) => { const { x, y } = at[l], f = a ? "#7A5CA8" : "#fff";
      s += `<g${tapAttr(i, tap)}>${sx === "m" ? `<rect x="${x - 12}" y="${y - 12}" width="24" height="24" fill="${f}" stroke="${INK}" stroke-width="2"/>` : `<circle cx="${x}" cy="${y}" r="12.5" fill="${f}" stroke="${INK}" stroke-width="2"/>`}${mTxt(x, y + 22, l, { s: 10.5 })}</g>`; });
    s += `<rect x="${W - 98}" y="${H - 22}" width="12" height="12" fill="#7A5CA8" stroke="${INK}"/>${mTxt(W - 80, H - 16, "affected", { a: "start", s: 9.5 })}`;
    return { svg: s + "</svg>", kinds: people.map(p => p[0]), alt: "Family tree: " + people.map(([l, sx, a]) => `${l} (${sx === "m" ? "male" : "female"}${a ? ", affected" : ""})`).join(", ") + "." };
  }
};
// A plot whose points (line) or bars can be tapped. spec as plot(); targets = points of series[0], or the bars.
function tapPlot(spec) {
  const svg = plot(spec), W = 330, H = 220, Lf = 54, Rt = W - 16, T = 18, B = H - 48, [x0, x1] = spec.x || [0, 1], [y0, y1] = spec.y;
  const X = v => Lf + (v - x0) / (x1 - x0) * (Rt - Lf), Y = v => B - (v - y0) / (y1 - y0) * (B - T);
  let t = "";
  if (spec.bars) { const n = spec.bars.cats.length, slot = (Rt - Lf) / n; spec.bars.cats.forEach((c, i) => { t += `<rect x="${(Lf + slot * i + 2).toFixed(1)}" y="${T}" width="${(slot - 4).toFixed(1)}" height="${B - T}" fill="transparent"${tapAttr(i, true)}/>`; }); }
  else spec.series[0].pts.forEach(([a, b], i) => { t += `<circle cx="${X(a).toFixed(1)}" cy="${Y(b).toFixed(1)}" r="11" fill="rgba(224,86,126,.08)" stroke="${PINK}" stroke-width="1.2" stroke-dasharray="2 2"${tapAttr(i, true)}/>`; });
  return svg.replace(/<\/svg>$/, t + "</svg>");
}
// Tiny graph used inside a choice button. { pts: [[x, y]...] } or { bars: [v...] }, optional xl / yl axis words
function miniGraph(g, xl = "", yl = "") {
  const W = 132, H = 78, L = 16, R = 126, T = 6, B = 62;
  let body = "";
  if (g.bars) { const m = Math.max(...g.bars, 1), n = g.bars.length, slot = (R - L) / n; g.bars.forEach((v, i) => { const h = (B - T) * v / m; body += `<rect x="${(L + slot * i + slot * .18).toFixed(1)}" y="${(B - h).toFixed(1)}" width="${(slot * .64).toFixed(1)}" height="${h.toFixed(1)}" fill="#A0C4FF" stroke="${INK}" stroke-width="1"/>`; }); }
  else { const all = g.pts.concat(g.ref || []), xs = all.map(p => p[0]), ys = all.map(p => p[1]), ax = Math.min(...xs), bx = Math.max(...xs), ay = Math.min(0, ...ys), by = Math.max(...ys, 1);
    const map = ps => ps.map(([a, b]) => [L + 2 + (a - ax) / ((bx - ax) || 1) * (R - L - 6), B - (b - ay) / ((by - ay) || 1) * (B - T - 4)]);
    const line = (ps, attr) => `<path d="${g.smooth === false ? "M" + map(ps).map(p => p.map(n => n.toFixed(1)).join(" ")).join(" L") : smoothPath(map(ps))}" fill="none" ${attr} stroke-linecap="round"/>`;
    // a dashed grey reference line (e.g. "before") under the pink answer line
    body = (g.ref ? line(g.ref, `stroke="#9C8F8C" stroke-width="2" stroke-dasharray="5 4"`) : "") + line(g.pts, `stroke="${PINK}" stroke-width="2.6"`); }
  return `<svg class="minig" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="M${L} ${T} V${B} H${R}" fill="none" stroke="${INK}" stroke-width="1.6"/>${body}${mTxt((L + R) / 2, H - 6, xl, { s: 8.5, c: SOFT })}<text x="7" y="${(T + B) / 2}" fill="${SOFT}" font-size="8.5" font-weight="700" text-anchor="middle" transform="rotate(-90 7 ${(T + B) / 2})">${yl}</text></svg>`;
}
