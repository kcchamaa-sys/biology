
/* ============================================================
   3. Diagrams: original inline SVGs (labels in English)
   ============================================================ */
const PINK = "#E0567E", SOFT = "#7A6A66";
const lab = (x, y, t, a = "start", sz = 15) => `<text x="${x}" y="${y}" fill="${INK}" font-size="${sz}" font-weight="800" text-anchor="${a}" dominant-baseline="middle">${t}</text>`;
const lead = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${INK}" stroke-width="1.6"/><circle cx="${x1}" cy="${y1}" r="2.4" fill="${INK}"/>`;
const small = (x, y, t, a = "start", c = SOFT) => `<text x="${x}" y="${y}" fill="${c}" font-size="11.5" font-weight="700" text-anchor="${a}" dominant-baseline="middle">${t}</text>`;
const svgOpen = (w, h, label) => `<svg class="diagram" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">`;
function axes(x0, y0, w, h, xl, yl) {
  return `<path d="M${x0} ${y0 - h} V${y0} H${x0 + w}" fill="none" stroke="${INK}" stroke-width="2.4"/>
    <path d="M${x0 - 5} ${y0 - h + 8} L${x0} ${y0 - h} L${x0 + 5} ${y0 - h + 8} M${x0 + w - 8} ${y0 - 5} L${x0 + w} ${y0} L${x0 + w - 8} ${y0 + 5}" fill="none" stroke="${INK}" stroke-width="2"/>
    ${small(x0 + w / 2, y0 + 30, xl, "middle", INK)}<text x="${x0 - 12}" y="${y0 - h / 2}" fill="${INK}" font-size="11.5" font-weight="700" text-anchor="middle" transform="rotate(-90 ${x0 - 12} ${y0 - h / 2})">${yl}</text>`;
}
const dot = (x, y, t, dx = 8, dy = -10) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${PINK}" stroke="${INK}" stroke-width="1.6"/>${lab(x + dx, y + dy, t)}`;

/* Plant cell. opts.letters shows A–F labels; opts.hl glows one part (wall, membrane, vacuole, nucleus, chloroplast, mito) */
function plantCellSvg(opts = {}) {
  const hl = k => opts.hl === k ? `stroke="${PINK}" stroke-width="5" filter="url(#glowF)"` : "";
  const L1 = opts.letters;
  const chl = (x, y, r) => `<g transform="rotate(${r} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="13" ry="7.5" fill="#7BC96F" stroke="${INK}" stroke-width="1.8" ${hl("chloroplast")}/><path d="M${x - 7} ${y - 2} h5 M${x + 1} ${y + 2} h6 M${x - 4} ${y + 3} h4" stroke="#2F6B2A" stroke-width="1.6"/></g>`;
  return `${svgOpen(300, 215, "A plant cell" + (L1 ? " with parts labelled A to F" : " with one part glowing"))}
    <defs><filter id="glowF" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <rect x="30" y="18" width="200" height="180" rx="18" fill="#CFEFC0" stroke="${INK}" stroke-width="5" ${hl("wall")}/>
    <rect x="41" y="29" width="178" height="158" rx="12" fill="#F6FFF1" stroke="#5E9E4B" stroke-width="2.2" ${hl("membrane")}/>
    <rect x="88" y="52" width="108" height="108" rx="40" fill="#D3E4FF" stroke="${INK}" stroke-width="2" ${hl("vacuole")}/>
    <circle cx="68" cy="150" r="19" fill="#C9C3F0" stroke="${INK}" stroke-width="2" ${hl("nucleus")}/><circle cx="72" cy="146" r="5" fill="#8E7CC3"/>
    ${chl(64, 58, -20)}${chl(206, 122, 70)}${chl(160, 176, 5)}
    <g transform="rotate(-15 204 54)"><ellipse cx="204" cy="54" rx="11" ry="6.5" fill="#F2A36B" stroke="${INK}" stroke-width="1.8" ${hl("mito")}/><path d="M196 54 q2 -4 4 0 t4 0 t4 0" fill="none" stroke="${INK}" stroke-width="1.3"/></g>
    ${L1 ? `${lead(215, 54, 256, 40)}${lab(262, 40, "F")}${lead(196, 100, 256, 86)}${lab(262, 86, "C")}${lead(212, 128, 256, 128)}${lab(262, 128, "E")}
      ${lead(219, 158, 256, 160)}${lab(262, 160, "B")}${lead(230, 190, 256, 192)}${lab(262, 192, "A")}${lead(55, 160, 14, 186)}${lab(6, 196, "D")}` : ""}
  </svg>`;
}

const DIAGRAMS = {
  plantCell: plantCellSvg({ letters: true }),

  tubes: `${svgOpen(320, 170, "Four test tubes after food tests: A blue-black, B brick-red, C purple, D blue")}
    ${[["#1F2350", "A"], ["#C2451E", "B"], ["#8E44C8", "C"], ["#5B8FE0", "D"]].map(([c, t], i) => { const x = 40 + i * 72;
      return `<path d="M${x} 20 V128 a18 18 0 0 0 36 0 V20" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M${x + 2} 70 V128 a16 16 0 0 0 32 0 V70 Z" fill="${c}"/>
        <path d="M${x - 4} 20 h44" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>${lab(x + 18, 162, t, "middle")}`; }).join("")}</svg>`,

  chromosome: `${svgOpen(300, 170, "A chromosome made of two parts joined at one point. X points to one arm, Y points to the joining point")}
    <path d="M120 22 Q138 85 120 148" fill="none" stroke="#A0C4FF" stroke-width="18" stroke-linecap="round"/>
    <path d="M160 22 Q142 85 160 148" fill="none" stroke="#A0C4FF" stroke-width="18" stroke-linecap="round"/>
    <path d="M120 22 Q138 85 120 148 M160 22 Q142 85 160 148" fill="none" stroke="${INK}" stroke-width="2" opacity=".35"/>
    <circle cx="140" cy="85" r="10" fill="#FFB7C5" stroke="${INK}" stroke-width="2.4"/>
    ${lead(114, 40, 60, 40)}${lab(40, 40, "X")}${lead(150, 85, 222, 85)}${lab(230, 85, "Y")}</svg>`,

  membrane: `${svgOpen(340, 190, "The cell membrane: a double layer of phospholipids with proteins. X marks a phospholipid head, Y the tails, Z a protein")}
    ${small(20, 14, "outside the cell")}${small(20, 180, "cytoplasm")}
    ${Array.from({ length: 18 }, (_, i) => { const x = 22 + i * 17; if (x > 104 && x < 158) return "";
      return `<path d="M${x - 2} 50 v24 M${x + 2} 50 v24 M${x - 2} 128 v-24 M${x + 2} 128 v-24" stroke="${INK}" stroke-width="1.6"/><circle cx="${x}" cy="46" r="6" fill="#FDFFB6" stroke="${INK}" stroke-width="1.6"/><circle cx="${x}" cy="132" r="6" fill="#FDFFB6" stroke="${INK}" stroke-width="1.6"/>`; }).join("")}
    <path d="M110 34 Q106 89 112 146 Q131 160 150 146 Q158 89 152 34 Q131 22 110 34Z" fill="#FFB7C5" stroke="${INK}" stroke-width="2.4"/>
    <path d="M128 40 V140 M134 40 V140" stroke="${INK}" stroke-width="1.2" stroke-dasharray="4 4"/>
    <ellipse cx="250" cy="31" rx="26" ry="11" fill="#C9C3F0" stroke="${INK}" stroke-width="2"/>
    ${lead(209, 46, 214, 12)}${lab(220, 11, "X")}${lead(278, 64, 322, 64)}${lab(326, 64, "Y", "end")}${lead(131, 150, 131, 170)}${lab(138, 172, "Z")}</svg>`,

  diffuse: `${svgOpen(320, 150, "A box split by a membrane. Side P has many particles; side Q has few")}
    <rect x="20" y="20" width="280" height="100" rx="10" fill="#FFFDF0" stroke="${INK}" stroke-width="3"/>
    <path d="M160 20 V120" stroke="${INK}" stroke-width="3" stroke-dasharray="8 6"/>
    ${[[40, 40], [60, 70], [45, 100], [85, 45], [100, 80], [75, 105], [125, 55], [135, 95], [110, 30], [140, 70], [65, 38], [95, 110], [120, 100], [50, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${PINK}" stroke="${INK}" stroke-width="1.4"/>`).join("")}
    ${[[200, 50], [250, 95], [275, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${PINK}" stroke="${INK}" stroke-width="1.4"/>`).join("")}
    ${lab(90, 138, "P", "middle")}${lab(230, 138, "Q", "middle")}${small(166, 14, "membrane")}</svg>`,

  plantStates: `${svgOpen(330, 150, "Three plant cells A, B and C after being placed in different solutions")}
    ${[0, 1, 2].map(i => { const x = 18 + i * 106;
      const wall = i === 2 ? `<path d="M${x} 20 H${x + 86} Q${x + 78} 70 ${x + 86} 120 H${x} Q${x + 8} 70 ${x} 20Z" fill="#CFEFC0" stroke="${INK}" stroke-width="4"/>` : `<rect x="${x}" y="20" width="86" height="100" rx="8" fill="#CFEFC0" stroke="${INK}" stroke-width="4"/>`;
      const inner = i === 0 ? `<rect x="${x + 6}" y="26" width="74" height="88" rx="6" fill="#F6FFF1" stroke="#5E9E4B" stroke-width="2"/><rect x="${x + 16}" y="36" width="54" height="68" rx="18" fill="#A0C4FF" stroke="${INK}" stroke-width="1.8"/>`
        : i === 1 ? `<rect x="${x + 6}" y="26" width="74" height="88" rx="6" fill="#E9F2DC"/><path d="M${x + 22} 44 Q${x + 43} 30 ${x + 64} 44 Q${x + 72} 70 ${x + 62} 96 Q${x + 43} 108 ${x + 24} 96 Q${x + 14} 70 ${x + 22} 44Z" fill="#F6FFF1" stroke="#5E9E4B" stroke-width="2"/><ellipse cx="${x + 43}" cy="70" rx="12" ry="16" fill="#A0C4FF" stroke="${INK}" stroke-width="1.6"/>`
        : `<path d="M${x + 6} 26 H${x + 80} Q${x + 73} 70 ${x + 80} 114 H${x + 6} Q${x + 13} 70 ${x + 6} 26Z" fill="#F6FFF1" stroke="#5E9E4B" stroke-width="2"/><rect x="${x + 22}" y="44" width="42" height="52" rx="16" fill="#A0C4FF" stroke="${INK}" stroke-width="1.8"/>`;
      return wall + inner + lab(x + 43, 138, "ABC"[i], "middle"); }).join("")}</svg>`,

  mitosis: `${svgOpen(330, 150, "Three dividing animal cells A, B and C at different stages of mitosis")}
    ${[0, 1, 2].map(i => { const x = 18 + i * 106, cx = x + 43;
      const cell = i === 2 ? `<path d="M${x + 4} 70 Q${x + 4} 22 ${cx} 26 Q${x + 82} 22 ${x + 82} 70 Q${x + 82} 118 ${cx} 114 Q${x + 4} 118 ${x + 4} 70Z M${cx - 6} 26 Q${cx} 70 ${cx - 6} 114" fill="#FFF6DA" stroke="${INK}" stroke-width="3"/>`
        : `<ellipse cx="${cx}" cy="70" rx="40" ry="46" fill="#FFF6DA" stroke="${INK}" stroke-width="3"/>`;
      const spindle = i < 2 ? `<path d="M${cx} 28 L${cx - 16} 70 L${cx} 112 M${cx} 28 L${cx} 112 M${cx} 28 L${cx + 16} 70 L${cx} 112" fill="none" stroke="${SOFT}" stroke-width="1.2"/>` : "";
      const X = (px, py) => `<path d="M${px - 5} ${py - 7} L${px + 5} ${py + 7} M${px + 5} ${py - 7} L${px - 5} ${py + 7}" stroke="#5B8FE0" stroke-width="4" stroke-linecap="round"/>`;
      const V = (px, py, up) => `<path d="M${px - 5} ${py + (up ? 7 : -7)} L${px} ${py} L${px + 5} ${py + (up ? 7 : -7)}" fill="none" stroke="#5B8FE0" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
      const chrom = i === 0 ? [52, 70, 88].map(py => X(cx, py)).join("") : i === 1 ? [cx - 12, cx, cx + 12].map(px => V(px, 40, true) + V(px, 100, false)).join("")
        : `<ellipse cx="${cx - 2}" cy="48" rx="20" ry="13" fill="#C9C3F0" stroke="${INK}" stroke-width="1.8"/><ellipse cx="${cx - 2}" cy="92" rx="20" ry="13" fill="#C9C3F0" stroke="${INK}" stroke-width="1.8"/>`;
      return cell + spindle + chrom + lab(cx, 138, "ABC"[i], "middle"); }).join("")}</svg>`,

  lockKey: `${svgOpen(320, 170, "An enzyme with a triangular active site, and three molecules A, B and C of different shapes")}
    <path d="M30 40 H90 L110 78 L130 40 H180 V130 H30 Z" fill="#A0C4FF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    ${small(70, 110, "enzyme", "start", INK)}${lead(110, 62, 150, 152)}${small(154, 156, "active site", "start", INK)}
    <path d="M222 30 H262 L242 66 Z" fill="#FFB7C5" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>${lab(290, 46, "A")}
    <circle cx="242" cy="96" r="15" fill="#FDFFB6" stroke="${INK}" stroke-width="2.4"/>${lab(290, 96, "B")}
    <rect x="224" y="124" width="36" height="28" rx="3" fill="#B9F3C9" stroke="${INK}" stroke-width="2.4"/>${lab(290, 138, "C")}</svg>`,

  tempGraph: `${svgOpen(320, 205, "Graph of rate of an enzyme reaction against temperature, with points A, B and C")}
    ${axes(50, 165, 250, 145, "temperature / °C", "rate of reaction")}
    ${[["10", 83], ["20", 116], ["30", 149], ["40", 182], ["50", 215], ["60", 248]].map(([t, x]) => `<path d="M${x} 165 v5" stroke="${INK}" stroke-width="2"/>${small(x, 178, t, "middle", INK)}`).join("")}
    <g transform="translate(-16 0)"><path d="M71 158 C126 150 166 110 196 40 C204 25 212 30 222 60 C232 100 240 150 254 162" fill="none" stroke="${PINK}" stroke-width="3.5" stroke-linecap="round"/>
    ${dot(144, 124, "A", -20, -8)}${dot(206, 30, "B", 10, -2)}${dot(238, 124, "C", 8, -4)}</g></svg>`,

  phGraph: `${svgOpen(320, 205, "Graph of rate of reaction against pH for two enzymes, P and Q")}
    ${axes(50, 165, 250, 145, "pH", "rate of reaction")}
    ${[1, 3, 5, 7, 9, 11].map((t, i) => `<path d="M${70 + i * 40} 165 v5" stroke="${INK}" stroke-width="2"/>${small(70 + i * 40, 178, t, "middle", INK)}`).join("")}
    <path d="M58 150 Q90 20 122 150" fill="none" stroke="${PINK}" stroke-width="3.5"/>${lab(84, 52, "P")}
    <path d="M160 155 Q220 16 282 155" fill="none" stroke="#5B8FE0" stroke-width="3.5"/>${lab(228, 52, "Q")}</svg>`,

  substrateGraph: `${svgOpen(320, 205, "Graph of rate of reaction against substrate concentration, with points X and Y")}
    ${axes(50, 165, 250, 145, "substrate concentration", "rate of reaction")}
    <path d="M52 163 C90 90 130 55 180 48 C220 44 260 44 292 44" fill="none" stroke="${PINK}" stroke-width="3.5"/>
    ${dot(86, 112, "X", -22, -6)}${dot(250, 44, "Y", -4, -16)}</svg>`,

  leaf: `${svgOpen(340, 215, "Cross-section of a leaf with layers labelled A to D")}
    <path d="M20 24 H300" stroke="#9CCB8A" stroke-width="5"/>
    ${Array.from({ length: 10 }, (_, i) => `<rect x="${22 + i * 28}" y="27" width="28" height="18" rx="3" fill="#FFFDF0" stroke="${INK}" stroke-width="1.6"/>`).join("")}
    ${Array.from({ length: 14 }, (_, i) => `<rect x="${23 + i * 20}" y="48" width="18" height="52" rx="7" fill="#B9F3C9" stroke="${INK}" stroke-width="1.6"/>${[58, 70, 82, 92].map(y => `<circle cx="${32 + i * 20}" cy="${y}" r="3" fill="#3E8E3A"/>`).join("")}`).join("")}
    ${[[40, 118], [78, 128], [118, 116], [160, 130], [200, 118], [240, 128], [280, 116], [58, 150], [140, 152], [222, 150], [290, 150]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="17" ry="12" fill="#D8F5C9" stroke="${INK}" stroke-width="1.6"/><circle cx="${x - 5}" cy="${y}" r="2.5" fill="#3E8E3A"/><circle cx="${x + 5}" cy="${y + 2}" r="2.5" fill="#3E8E3A"/>`).join("")}
    ${Array.from({ length: 10 }, (_, i) => i === 4 ? "" : `<rect x="${22 + i * 28}" y="168" width="28" height="16" rx="3" fill="#FFFDF0" stroke="${INK}" stroke-width="1.6"/>`).join("")}
    <path d="M134 168 q7 8 0 16 q-6 -8 0 -16Z M156 168 q-7 8 0 16 q6 -8 0 -16Z" fill="#7BC96F" stroke="${INK}" stroke-width="1.6"/>
    ${lead(300, 36, 318, 36)}${lab(322, 36, "A")}${lead(298, 74, 318, 74)}${lab(322, 74, "B")}${lead(300, 132, 318, 132)}${lab(322, 132, "C")}${lead(145, 188, 145, 204)}${lab(152, 206, "D")}</svg>`,

  chloroplast: `${svgOpen(320, 170, "A chloroplast with parts labelled A, B and C")}
    <ellipse cx="150" cy="85" rx="130" ry="62" fill="#D8F5C9" stroke="${INK}" stroke-width="3"/><ellipse cx="150" cy="85" rx="123" ry="55" fill="none" stroke="${INK}" stroke-width="1.6"/>
    ${[[70, 70], [115, 100], [160, 62], [205, 98], [228, 62]].map(([x, y]) => [0, 1, 2, 3].map(k => `<rect x="${x - 16}" y="${y - 12 + k * 7}" width="32" height="6" rx="3" fill="#6BBF5F" stroke="${INK}" stroke-width="1.2"/>`).join("")).join("")}
    <path d="M86 78 H99 M131 92 H144 M176 76 H189" stroke="#6BBF5F" stroke-width="2"/>
    <ellipse cx="150" cy="118" rx="16" ry="8" fill="#fff" stroke="${INK}" stroke-width="1.6"/>
    ${lead(228, 56, 296, 30)}${lab(300, 30, "A")}${lead(185, 128, 296, 140)}${lab(300, 140, "B")}${lead(150, 122, 120, 162)}${lab(104, 162, "C")}</svg>`,

  mito: `${svgOpen(320, 160, "A mitochondrion with parts labelled A, B and C")}
    <ellipse cx="150" cy="80" rx="128" ry="58" fill="#F9C9A6" stroke="${INK}" stroke-width="3"/>
    <path d="M36 80 Q36 34 150 30 Q264 34 264 80 Q264 126 150 130 Q36 126 36 80Z" fill="#FFE4D1" stroke="${INK}" stroke-width="1.6"/>
    <path d="M40 80 L70 80 L70 40 L85 40 L85 108 L100 108 L100 40 L115 40 L115 118 L130 118 L130 38 L145 38 L145 118 L160 118 L160 38 L175 38 L175 118 L190 118 L190 40 L205 40 L205 110 L220 110 L220 44 L235 44 L235 80 L260 80" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    ${lead(270, 96, 300, 118)}${lab(304, 122, "A")}${lead(160, 60, 196, 12)}${lab(200, 12, "B")}${lead(122, 80, 60, 146)}${lab(44, 150, "C")}</svg>`,

  lightGraph: `${svgOpen(320, 205, "Graph of rate of photosynthesis against light intensity at high and low carbon dioxide concentration, with points X and Y on the lower curve")}
    ${axes(50, 165, 250, 145, "light intensity", "rate of photosynthesis")}
    <path d="M52 163 C90 90 130 42 190 36 C230 32 270 32 292 32" fill="none" stroke="#5B8FE0" stroke-width="3.5"/>${small(210, 22, "high CO₂", "start", "#3B6FC0")}
    <path d="M52 163 C80 120 110 98 150 94 C200 90 250 90 292 90" fill="none" stroke="${PINK}" stroke-width="3.5"/>${small(210, 106, "low CO₂", "start", PINK)}
    ${dot(80, 122, "X", -22, -6)}${dot(250, 90, "Y", -4, -16)}</svg>`,

  villus: `${svgOpen(300, 215, "A villus with parts labelled A, B and C")}
    <path d="M70 205 V70 Q70 18 130 18 Q190 18 190 70 V205" fill="#FFD6DF" stroke="${INK}" stroke-width="3"/>
    ${Array.from({ length: 8 }, (_, i) => `<path d="M${72} ${198 - i * 17} h8 M${188} ${198 - i * 17} h-8" stroke="${INK}" stroke-width="1.4"/>`).join("")}
    <path d="M122 205 V64 Q122 50 130 50 Q138 50 138 64 V205" fill="#FFFDF0" stroke="${INK}" stroke-width="2"/>
    <path d="M96 205 V70 Q96 36 130 36 Q164 36 164 70 V205 M96 150 L122 138 M96 110 L122 98 M164 150 L138 138 M164 110 L138 98" fill="none" stroke="#D64545" stroke-width="2.6"/>
    ${lead(186, 120, 236, 120)}${lab(242, 120, "A")}${lead(162, 80, 236, 66)}${lab(242, 66, "B")}${lead(130, 170, 236, 176)}${lab(242, 176, "C")}</svg>`,

  gut: `${svgOpen(300, 250, "The human digestive system with organs labelled A to E")}
    <path d="M150 10 V78" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M150 10 V78" stroke="#FFD6DF" stroke-width="5" stroke-linecap="round"/>
    <path d="M60 76 Q70 58 150 64 L148 104 Q100 112 70 100 Z" fill="#A8703F" stroke="${INK}" stroke-width="2.4"/>
    <path d="M150 76 Q200 64 206 100 Q210 138 170 136 Q150 134 152 118" fill="#FFB7C5" stroke="${INK}" stroke-width="2.4"/>
    <path d="M150 128 Q176 146 206 138" fill="none" stroke="${INK}" stroke-width="2"/><path d="M150 140 Q182 154 212 142 L210 150 Q180 162 150 150Z" fill="#FDE7A6" stroke="${INK}" stroke-width="2"/>
    <path d="M80 238 V160 Q80 150 90 150 H214 Q224 150 224 160 V224" fill="none" stroke="${INK}" stroke-width="16" stroke-linejoin="round"/><path d="M80 238 V160 Q80 150 90 150 H214 Q224 150 224 160 V224" fill="none" stroke="#E5C3A2" stroke-width="11" stroke-linejoin="round"/>
    <path d="M110 172 q20 -12 40 0 t40 0 M110 190 q20 12 40 0 t40 0 M110 208 q20 -12 40 0 t40 0" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M110 172 q20 -12 40 0 t40 0 M110 190 q20 12 40 0 t40 0 M110 208 q20 -12 40 0 t40 0" fill="none" stroke="#FFD6DF" stroke-width="4" stroke-linecap="round"/>
    ${lead(76, 86, 24, 70)}${lab(10, 70, "A")}${lead(196, 96, 262, 84)}${lab(268, 84, "B")}${lead(206, 146, 262, 134)}${lab(268, 134, "C")}${lead(150, 190, 150, 190)}${lab(150, 238, "D", "middle")}${lead(224, 200, 262, 200)}${lab(268, 200, "E")}</svg>`,

  yeast: `${svgOpen(320, 190, "Yeast in glucose solution under a layer of oil, with a tube leading into a second tube of liquid. X marks the oil layer and Y the liquid in the second tube")}
    <path d="M60 30 V150 a28 28 0 0 0 56 0 V30" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M62 62 V150 a26 26 0 0 0 52 0 V62Z" fill="#FDE7A6"/><rect x="62" y="52" width="52" height="12" fill="#F5C542" opacity=".8"/>
    ${[[78, 120], [96, 140], [88, 100], [100, 118], [76, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff" stroke="${INK}" stroke-width="1"/>`).join("")}
    <path d="M200 60 V150 a28 28 0 0 0 56 0 V60" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M202 90 V150 a26 26 0 0 0 52 0 V90Z" fill="#D3E4FF"/>
    <path d="M88 44 V14 H228 V132" fill="none" stroke="${INK}" stroke-width="3"/>
    ${lead(114, 58, 150, 70)}${lab(156, 70, "X")}${lead(254, 120, 284, 120)}${lab(290, 120, "Y")}${small(88, 184, "yeast + glucose", "middle", INK)}</svg>`,

  starchTest: `${svgOpen(330, 150, "Steps of testing a leaf for starch: A boiling water, B hot alcohol in a water bath, C iodine solution")}
    ${["A", "B", "C"].map((t, i) => { const x = 22 + i * 106;
      return `<rect x="${x}" y="40" width="86" height="70" rx="10" fill="${i === 2 ? "#FFFDF0" : "#D3E4FF"}" stroke="${INK}" stroke-width="3"/>
        ${i === 1 ? `<rect x="${x + 28}" y="18" width="30" height="80" rx="6" fill="#E9FFD9" stroke="${INK}" stroke-width="2.4"/>` : ""}
        ${i === 2 ? `<ellipse cx="${x + 43}" cy="75" rx="30" ry="18" fill="#1F2350" stroke="${INK}" stroke-width="2"/><circle cx="${x + 70}" cy="30" r="0"/>` : `<ellipse cx="${x + 43}" cy="80" rx="22" ry="12" fill="${i === 0 ? "#6BBF5F" : "#CFEFC0"}" stroke="${INK}" stroke-width="2"/>`}
        ${i < 2 ? `<path d="M${x + 20} 128 q6 -10 0 -18 M${x + 43} 128 q6 -10 0 -18 M${x + 66} 128 q6 -10 0 -18" fill="none" stroke="#E07A3F" stroke-width="2.4" stroke-linecap="round"/>` : ""}
        ${lab(x + 43, 142, t, "middle")}`; }).join("")}</svg>`
};
