
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

/* Plant cell: textbook-style (cellulose wall with plasmodesmata, granular cytoplasm, tonoplast, nuclear envelope).
   opts.letters shows A–F labels; opts.hl glows one part (wall, membrane, vacuole, nucleus, chloroplast, mito) */
function plantCellSvg(opts = {}) {
  const hl = k => opts.hl === k ? `stroke="${PINK}" stroke-width="5" filter="url(#glowF)"` : "";
  const L1 = opts.letters;
  const chl = (x, y, r) => `<g transform="rotate(${r} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="14.5" ry="7.8" fill="url(#pcChl)" stroke="#2F6B2A" stroke-width="1.3" ${hl("chloroplast")}/>
    <path d="M${x - 11} ${y} H${x + 11}" stroke="#3E8E3A" stroke-width=".9"/>${[-8, -3, 2, 7].map(dx => `<rect x="${x + dx - 1.8}" y="${y - 3.4}" width="3.6" height="6.8" rx="1" fill="#246B24" opacity=".85"/>`).join("")}</g>`;
  const dots = [[52, 44], [60, 80], [48, 110], [80, 36], [120, 36], [160, 34], [212, 80], [214, 100], [208, 150], [196, 180], [120, 180], [96, 176], [60, 186], [210, 40], [180, 172], [140, 190]];
  return `${svgOpen(300, 215, "A plant cell" + (L1 ? " with parts labelled A to F" : " with one part glowing"))}
    <defs><filter id="glowF" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <radialGradient id="pcVac" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#EEF5FF"/><stop offset="1" stop-color="#C6DAF5"/></radialGradient>
      <radialGradient id="pcNuc" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#E4DDF7"/><stop offset="1" stop-color="#A89AD8"/></radialGradient>
      <linearGradient id="pcCyt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBFFF3"/><stop offset="1" stop-color="#EAF5DC"/></linearGradient>
      <linearGradient id="pcChl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9AD88B"/><stop offset="1" stop-color="#4FA746"/></linearGradient></defs>
    <path d="M36 22 Q130 12 226 22 Q236 110 228 196 Q130 206 34 196 Q26 110 36 22Z" fill="#D7EBC0" stroke="#6E8F4E" stroke-width="5" ${hl("wall")}/>
    <path d="M36 22 Q130 12 226 22 Q236 110 228 196 Q130 206 34 196 Q26 110 36 22Z" fill="none" stroke="${INK}" stroke-width="1.2" opacity=".6"/>
    ${[[130, 17, 0], [231, 110, 90], [130, 201, 0], [30, 110, 90]].map(([x, y, r]) => `<rect x="${x - 2}" y="${y - 4}" width="4" height="8" fill="#FBFFF3" transform="rotate(${r} ${x} ${y})"/>`).join("")}
    <path d="M44 30 Q130 21 218 30 Q227 110 220 188 Q130 197 42 188 Q35 110 44 30Z" fill="url(#pcCyt)" stroke="#4E8A3A" stroke-width="1.6" ${hl("membrane")}/>
    ${dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#8FB57A"/>`).join("")}
    <path d="M90 128 q-8 14 0 30 M96 124 q-10 18 0 38" fill="none" stroke="#B9A7D8" stroke-width="1.4"/>
    <path d="M96 60 Q140 46 186 62 Q200 106 188 150 Q146 166 102 152 Q84 106 96 60Z" fill="url(#pcVac)" stroke="#6A8FC9" stroke-width="1.8" ${hl("vacuole")}/>
    <path d="M110 70 Q140 60 170 70" fill="none" stroke="#fff" stroke-width="3" opacity=".7" stroke-linecap="round"/>
    <circle cx="68" cy="150" r="19" fill="url(#pcNuc)" stroke="#5C4B9A" stroke-width="2" ${hl("nucleus")}/><circle cx="68" cy="150" r="16.5" fill="none" stroke="#5C4B9A" stroke-width=".8" stroke-dasharray="5 2"/>
    <circle cx="72" cy="146" r="5.5" fill="#6B5AAE"/>${[[60, 156], [64, 160], [76, 156], [58, 146]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="#6B5AAE"/>`).join("")}
    ${chl(64, 58, -20)}${chl(206, 122, 70)}${chl(160, 176, 5)}${chl(112, 176, -8)}
    <g transform="rotate(-15 204 54)"><ellipse cx="204" cy="54" rx="12" ry="6.8" fill="#F4B183" stroke="#9A5B2B" stroke-width="1.5" ${hl("mito")}/><path d="M195 51 v4 M199 49 v6 M203 50 v7 M207 49 v6 M211 51 v4" stroke="#9A5B2B" stroke-width="1.2" stroke-linecap="round"/></g>
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

  chromosome: `${svgOpen(300, 170, "A chromosome made of two sister chromatids joined at the centromere. X points to one chromatid, Y points to the centromere")}
    <defs><linearGradient id="chG" x1="0" x2="1"><stop offset="0" stop-color="#6F86D6"/><stop offset=".5" stop-color="#A9BCF2"/><stop offset="1" stop-color="#6F86D6"/></linearGradient>
      <clipPath id="chL"><path d="M104 26 Q100 14 113 13 Q127 14 129 27 Q133 70 137 85 Q133 100 129 143 Q127 156 113 157 Q100 156 104 144 Q115 100 123 85 Q115 70 104 26Z"/></clipPath>
      <clipPath id="chR"><path d="M176 26 Q180 14 167 13 Q153 14 151 27 Q147 70 143 85 Q147 100 151 143 Q153 156 167 157 Q180 156 176 144 Q165 100 157 85 Q165 70 176 26Z"/></clipPath></defs>
    ${["chL", "chR"].map(id => `<g clip-path="url(#${id})"><rect x="90" y="0" width="100" height="170" fill="url(#chG)"/>${[24, 34, 46, 56, 66, 104, 116, 128, 140, 150].map((y, i) => `<rect x="90" y="${y}" width="100" height="${i % 3 ? 3 : 6}" fill="#2E3A78" opacity=".35"/>`).join("")}</g>`).join("")}
    <path d="M104 26 Q100 14 113 13 Q127 14 129 27 Q133 70 137 85 Q133 100 129 143 Q127 156 113 157 Q100 156 104 144 Q115 100 123 85 Q115 70 104 26Z M176 26 Q180 14 167 13 Q153 14 151 27 Q147 70 143 85 Q147 100 151 143 Q153 156 167 157 Q180 156 176 144 Q165 100 157 85 Q165 70 176 26Z" fill="none" stroke="#2E3A78" stroke-width="1.8"/>
    <ellipse cx="140" cy="85" rx="8" ry="5" fill="#F29BB5" stroke="${INK}" stroke-width="1.6"/>
    ${lead(112, 44, 60, 40)}${lab(40, 40, "X")}${lead(146, 85, 222, 85)}${lab(230, 85, "Y")}${small(140, 166, "(banding stain, as seen in a karyotype)", "middle")}</svg>`,

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
    <defs><radialGradient id="psV" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#EEF5FF"/><stop offset="1" stop-color="#B9D0F2"/></radialGradient></defs>
    ${[0, 1, 2].map(i => { const x = 18 + i * 106;
      const wall = i === 2 ? `<path d="M${x} 20 H${x + 86} Q${x + 76} 70 ${x + 86} 120 H${x} Q${x + 10} 70 ${x} 20Z" fill="${i === 1 ? "#FDE3EA" : "#D7EBC0"}" stroke="#6E8F4E" stroke-width="4.5"/>` : `<rect x="${x}" y="20" width="86" height="100" rx="6" fill="${i === 1 ? "#FDE3EA" : "#D7EBC0"}" stroke="#6E8F4E" stroke-width="4.5"/>`;
      const chl = pts => pts.map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="4.5" ry="2.6" fill="#4FA746" stroke="#2F6B2A" stroke-width=".8"/>`).join("");
      const inner = i === 0
        ? `<rect x="${x + 5}" y="25" width="76" height="90" rx="4" fill="#F4FBEA" stroke="#4E8A3A" stroke-width="1.6"/><rect x="${x + 13}" y="33" width="60" height="74" rx="10" fill="url(#psV)" stroke="#6A8FC9" stroke-width="1.5"/>${chl([[x + 9, 40], [x + 9, 70], [x + 9, 100], [x + 77, 50], [x + 77, 90], [x + 40, 29], [x + 45, 111]])}<circle cx="${x + 70}" cy="104" r="5" fill="#A89AD8" stroke="#5C4B9A" stroke-width="1"/>`
        : i === 1 ? `<path d="M${x + 24} 42 Q${x + 43} 30 ${x + 62} 42 Q${x + 72} 70 ${x + 62} 98 Q${x + 43} 110 ${x + 24} 98 Q${x + 14} 70 ${x + 24} 42Z" fill="#F4FBEA" stroke="#4E8A3A" stroke-width="1.8"/><ellipse cx="${x + 43}" cy="70" rx="11" ry="15" fill="url(#psV)" stroke="#6A8FC9" stroke-width="1.3"/>${chl([[x + 28, 56], [x + 26, 80], [x + 58, 56], [x + 60, 82], [x + 43, 45]])}<circle cx="${x + 43}" cy="96" r="4" fill="#A89AD8"/><path d="M${x + 24} 42 L${x + 6} 26 M${x + 62} 98 L${x + 80} 114" stroke="#4E8A3A" stroke-width=".8" stroke-dasharray="2 2"/>`
        : `<path d="M${x + 5} 25 H${x + 81} Q${x + 72} 70 ${x + 81} 115 H${x + 5} Q${x + 14} 70 ${x + 5} 25Z" fill="#F4FBEA" stroke="#4E8A3A" stroke-width="1.6"/><path d="M${x + 22} 40 Q${x + 43} 34 ${x + 64} 40 Q${x + 60} 70 ${x + 64} 100 Q${x + 43} 106 ${x + 22} 100 Q${x + 26} 70 ${x + 22} 40Z" fill="url(#psV)" stroke="#6A8FC9" stroke-width="1.5"/>${chl([[x + 13, 40], [x + 15, 72], [x + 13, 104], [x + 72, 48], [x + 72, 96]])}<circle cx="${x + 68}" cy="72" r="4.5" fill="#A89AD8"/>`;
      return wall + inner + lab(x + 43, 138, "ABC"[i], "middle"); }).join("")}</svg>`,

  mitosis: `${svgOpen(330, 150, "Three dividing animal cells A, B and C at different stages of mitosis")}
    <defs><radialGradient id="mtC" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#FFF9EC"/><stop offset="1" stop-color="#F6E3C4"/></radialGradient></defs>
    ${[0, 1, 2].map(i => { const x = 18 + i * 106, cx = x + 43;
      const cell = i === 2 ? `<path d="M${x + 4} 70 Q${x + 4} 22 ${cx} 27 Q${x + 82} 22 ${x + 82} 70 Q${x + 82} 118 ${cx} 113 Q${x + 4} 118 ${x + 4} 70Z" fill="url(#mtC)" stroke="#9A7B55" stroke-width="2.5"/><path d="M${cx} 27 Q${cx - 5} 70 ${cx} 113" fill="none" stroke="#9A7B55" stroke-width="2.5"/>`
        : `<ellipse cx="${cx}" cy="70" rx="${i === 1 ? 38 : 40}" ry="${i === 1 ? 48 : 46}" fill="url(#mtC)" stroke="#9A7B55" stroke-width="2.5"/>`;
      const poles = i < 2 ? [28, 112].map(y => `<g transform="translate(${cx} ${y})"><rect x="-4" y="-1.5" width="8" height="3" rx="1.5" fill="#6B5AAE"/><rect x="-1.5" y="-4" width="3" height="8" rx="1.5" fill="#6B5AAE"/></g>`).join("") : "";
      const spindle = i < 2 ? [-22, -12, -4, 4, 12, 22].map(dx => `<path d="M${cx} 28 Q${cx + dx} 70 ${cx} 112" fill="none" stroke="#B8A58A" stroke-width=".9"/>`).join("") : "";
      const X = (px, py) => `<g><path d="M${px - 3} ${py - 9} Q${px} ${py} ${px - 3} ${py + 9}" stroke="#3E5BB8" stroke-width="4.2" fill="none" stroke-linecap="round"/><path d="M${px + 3} ${py - 9} Q${px} ${py} ${px + 3} ${py + 9}" stroke="#6F86D6" stroke-width="4.2" fill="none" stroke-linecap="round"/><circle cx="${px}" cy="${py}" r="1.8" fill="#F29BB5"/></g>`;
      const V = (px, py, up) => `<path d="M${px - 5} ${py + (up ? 9 : -9)} Q${px} ${py} ${px + 5} ${py + (up ? 9 : -9)}" fill="none" stroke="${up ? "#3E5BB8" : "#6F86D6"}" stroke-width="4" stroke-linecap="round"/><circle cx="${px}" cy="${py}" r="1.6" fill="#F29BB5"/>`;
      const chrom = i === 0 ? [cx - 14, cx, cx + 14].map(px => X(px, 70)).join("") : i === 1 ? [cx - 12, cx, cx + 12].map(px => V(px, 40, true) + V(px, 100, false)).join("")
        : [48, 92].map(y => `<ellipse cx="${cx - 2}" cy="${y}" rx="18" ry="12" fill="#E4DDF7" stroke="#5C4B9A" stroke-width="1.6"/><path d="M${cx - 12} ${y - 2} q5 -5 10 0 t10 2 M${cx - 10} ${y + 4} q6 3 12 -1" fill="none" stroke="#6B5AAE" stroke-width="1.6" stroke-linecap="round"/>`).join("");
      return cell + spindle + poles + chrom + lab(cx, 138, "ABC"[i], "middle"); }).join("")}</svg>`,

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
    <defs><linearGradient id="lfP" x1="0" x2="1"><stop offset="0" stop-color="#C9EFB8"/><stop offset=".5" stop-color="#E4F8D8"/><stop offset="1" stop-color="#C9EFB8"/></linearGradient></defs>
    <rect x="20" y="20" width="282" height="170" fill="#F3FAEE"/>
    <path d="M20 22 H302" stroke="#E5CF72" stroke-width="4"/>
    ${[26, 30, 24, 32, 28, 26, 30, 27, 29, 30].reduce((a, w) => { const x = a.x; a.s += `<rect x="${x}" y="25" width="${w}" height="18" rx="2" fill="#FFFDF4" stroke="#6E8F4E" stroke-width="1.3"/>`; a.x += w; return a; }, { x: 20, s: "" }).s}
    ${Array.from({ length: 14 }, (_, i) => `<rect x="${21 + i * 20}" y="45" width="18" height="54" rx="7" fill="url(#lfP)" stroke="#4E8A3A" stroke-width="1.3"/>${[53, 63, 73, 83, 93].map((y, k) => `<ellipse cx="${(k % 2 ? 36 : 25) + i * 20}" cy="${y}" rx="2.6" ry="3.6" fill="#3E8E3A"/>`).join("")}`).join("")}
    ${[[38, 116, 16, 11], [76, 124, 15, 12], [112, 112, 13, 10], [206, 116, 15, 11], [244, 126, 16, 12], [282, 114, 14, 11], [52, 150, 15, 11], [226, 152, 16, 11], [284, 150, 13, 11]].map(([x, y, rx, ry]) => `<path d="M${x - rx} ${y} Q${x - rx} ${y - ry} ${x} ${y - ry} Q${x + rx + 2} ${y - ry + 2} ${x + rx} ${y} Q${x + rx - 2} ${y + ry} ${x} ${y + ry} Q${x - rx - 1} ${y + ry - 1} ${x - rx} ${y}Z" fill="#E0F4D2" stroke="#4E8A3A" stroke-width="1.3"/><circle cx="${x - 5}" cy="${y - 2}" r="2.2" fill="#3E8E3A"/><circle cx="${x + 5}" cy="${y + 3}" r="2.2" fill="#3E8E3A"/>`).join("")}
    <g><ellipse cx="160" cy="128" rx="30" ry="22" fill="#EFE6C8" stroke="#8C7A4A" stroke-width="1.6"/>${[[150, 120], [162, 116], [172, 124], [156, 130]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.6" fill="#FFFDF4" stroke="#8C6A3A" stroke-width="2"/>`).join("")}${[[150, 142], [160, 144], [170, 141]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#D9E9C8" stroke="#6E8F4E" stroke-width="1"/>`).join("")}</g>
    ${[26, 30, 24, 32, 36, 30, 27, 29, 30].reduce((a, w, i) => { const x = a.x; if (i !== 4) a.s += `<rect x="${x}" y="170" width="${w}" height="16" rx="2" fill="#FFFDF4" stroke="#6E8F4E" stroke-width="1.3"/>`; a.x += w + (i === 3 ? 4 : 0); return a; }, { x: 20, s: "" }).s}
    <path d="M20 188 H302" stroke="#E5CF72" stroke-width="3"/>
    <path d="M145 170 q-10 -12 -26 -10" fill="none" stroke="#9FB98A" stroke-width="1" stroke-dasharray="2 2"/>
    <path d="M132 170 q9 8 0 17 q-7 -8 0 -17Z M158 170 q-9 8 0 17 q7 -8 0 -17Z" fill="#8CCF7E" stroke="#2F6B2A" stroke-width="1.5"/><circle cx="133" cy="178" r="1.5" fill="#246B24"/><circle cx="157" cy="178" r="1.5" fill="#246B24"/>
    ${lead(300, 34, 318, 34)}${lab(322, 34, "A")}${lead(298, 72, 318, 72)}${lab(322, 72, "B")}${lead(296, 132, 318, 132)}${lab(322, 132, "C")}${lead(145, 186, 145, 204)}${lab(152, 206, "D")}${small(160, 162, "vein", "middle")}</svg>`,

  chloroplast: `${svgOpen(320, 170, "A chloroplast with parts labelled A, B and C")}
    <defs><radialGradient id="cpS" cx=".5" cy=".45" r=".65"><stop offset="0" stop-color="#EDF9E4"/><stop offset="1" stop-color="#C6E9B3"/></radialGradient>
      <linearGradient id="cpT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8CD27B"/><stop offset="1" stop-color="#3F9A38"/></linearGradient></defs>
    <path d="M22 85 Q30 26 150 22 Q272 26 280 85 Q272 144 150 148 Q30 144 22 85Z" fill="url(#cpS)" stroke="#2F6B2A" stroke-width="2.6"/>
    <path d="M28 85 Q36 32 150 28 Q266 32 274 85 Q266 138 150 142 Q36 138 28 85Z" fill="none" stroke="#2F6B2A" stroke-width="1.2"/>
    ${Array.from({ length: 40 }, (_, i) => `<circle cx="${40 + (i * 53) % 225}" cy="${40 + (i * 37) % 90}" r=".9" fill="#7FB36F"/>`).join("")}
    <path d="M52 76 Q90 70 110 96 M130 92 Q150 70 172 64 M190 70 Q205 84 224 92 M86 70 Q120 58 150 56" fill="none" stroke="#5DAA52" stroke-width="2.2"/>
    ${[[70, 70], [115, 100], [160, 62], [205, 98], [228, 62]].map(([x, y]) => [0, 1, 2, 3, 4].map(k => `<rect x="${x - 16}" y="${y - 14 + k * 6}" width="32" height="5" rx="2.5" fill="url(#cpT)" stroke="#245E20" stroke-width=".8"/>`).join("")).join("")}
    <ellipse cx="150" cy="118" rx="17" ry="9" fill="#FFFDF4" stroke="#8C7A4A" stroke-width="1.4"/><ellipse cx="150" cy="118" rx="10" ry="5" fill="none" stroke="#C9B98A" stroke-width="1"/><ellipse cx="150" cy="118" rx="4" ry="2" fill="none" stroke="#C9B98A" stroke-width="1"/>
    ${[[92, 122], [210, 124], [60, 102]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#6B5A2E"/>`).join("")}
    ${lead(228, 56, 296, 30)}${lab(300, 30, "A")}${lead(185, 128, 296, 140)}${lab(300, 140, "B")}${lead(150, 122, 120, 162)}${lab(104, 162, "C")}</svg>`,

  mito: `${svgOpen(320, 160, "A mitochondrion with parts labelled A, B and C")}
    <defs><radialGradient id="mtM" cx=".5" cy=".45" r=".65"><stop offset="0" stop-color="#FFE9D6"/><stop offset="1" stop-color="#F6C9A2"/></radialGradient></defs>
    <path d="M22 80 Q24 22 150 20 Q276 22 278 80 Q276 138 150 140 Q24 138 22 80Z" fill="#F4B183" stroke="#8A4B1E" stroke-width="2.6"/>
    <path d="M32 80 Q34 32 150 30 Q266 32 268 80 Q266 128 150 130 Q34 128 32 80Z" fill="url(#mtM)" stroke="#9A5B2B" stroke-width="1.6"/>
    ${[[62, 1], [92, -1], [122, 1], [152, -1], [182, 1], [212, -1], [240, 1]].map(([x, s]) => { const y0 = s > 0 ? 32 : 128, y1 = s > 0 ? 96 : 64; return `<path d="M${x - 7} ${y0} C${x - 9} ${(y0 + y1) / 2} ${x - 4} ${y1} ${x} ${y1} C${x + 4} ${y1} ${x + 9} ${(y0 + y1) / 2} ${x + 7} ${y0}" fill="#FFE3CC" stroke="#9A5B2B" stroke-width="1.6"/>`; }).join("")}
    ${Array.from({ length: 30 }, (_, i) => `<circle cx="${46 + (i * 47) % 208}" cy="${46 + (i * 29) % 70}" r="1.1" fill="#C98A5A"/>`).join("")}
    <path d="M100 108 q10 -8 20 0 q-10 8 -20 0" fill="none" stroke="#6B5AAE" stroke-width="1.3"/>
    ${lead(270, 96, 300, 118)}${lab(304, 122, "A")}${lead(152, 84, 196, 12)}${lab(200, 12, "B")}${lead(136, 80, 60, 146)}${lab(44, 150, "C")}</svg>`,

  lightGraph: `${svgOpen(320, 205, "Graph of rate of photosynthesis against light intensity at high and low carbon dioxide concentration, with points X and Y on the lower curve")}
    ${axes(50, 165, 250, 145, "light intensity", "rate of photosynthesis")}
    <path d="M52 163 C90 90 130 42 190 36 C230 32 270 32 292 32" fill="none" stroke="#5B8FE0" stroke-width="3.5"/>${small(210, 22, "high CO₂", "start", "#3B6FC0")}
    <path d="M52 163 C80 120 110 98 150 94 C200 90 250 90 292 90" fill="none" stroke="${PINK}" stroke-width="3.5"/>${small(210, 106, "low CO₂", "start", PINK)}
    ${dot(80, 122, "X", -22, -6)}${dot(250, 90, "Y", -4, -16)}</svg>`,

  villus: `${svgOpen(300, 215, "A villus with parts labelled A, B and C")}
    <defs><linearGradient id="vlE" x1="0" x2="1"><stop offset="0" stop-color="#F6B7C4"/><stop offset=".5" stop-color="#FFE1E7"/><stop offset="1" stop-color="#F6B7C4"/></linearGradient></defs>
    <path d="M66 205 V70 Q66 14 130 14 Q194 14 194 70 V205" fill="none" stroke="#E8A0B0" stroke-width="4" stroke-dasharray="1 3"/>
    <path d="M70 205 V70 Q70 18 130 18 Q190 18 190 70 V205" fill="url(#vlE)" stroke="${INK}" stroke-width="2.4"/>
    <path d="M82 205 V72 Q82 30 130 30 Q178 30 178 72 V205" fill="#FFF2F4" stroke="#D78C9C" stroke-width="1.2"/>
    ${Array.from({ length: 10 }, (_, i) => `<path d="M70 ${196 - i * 13} H82 M178 ${196 - i * 13} H190" stroke="#D78C9C" stroke-width="1"/><ellipse cx="76" cy="${190 - i * 13}" rx="2.2" ry="3.2" fill="#8E7CC3"/><ellipse cx="184" cy="${190 - i * 13}" rx="2.2" ry="3.2" fill="#8E7CC3"/>`).join("")}
    ${Array.from({ length: 16 }, (_, i) => { const a = Math.PI * (i / 15); return `<circle cx="${(130 - 60 * Math.cos(a)).toFixed(1)}" cy="${(70 - 52 * Math.sin(a)).toFixed(1)}" r="2.8" fill="#8E7CC3"/>`; }).join("")}
    <path d="M122 205 V62 Q122 48 130 48 Q138 48 138 62 V205" fill="#FFF6D6" stroke="#C9A94A" stroke-width="1.8"/>
    <path d="M96 205 V74 Q96 40 130 40 Q164 40 164 74 V205" fill="none" stroke="#C0392B" stroke-width="3"/>
    <path d="M96 170 Q108 162 122 164 M96 140 Q110 132 122 136 M96 110 Q108 104 122 106 M164 170 Q152 162 138 164 M164 140 Q150 132 138 136 M164 110 Q152 104 138 106 M104 60 Q116 70 122 80 M156 60 Q144 70 138 80" fill="none" stroke="#C0392B" stroke-width="1.8"/>
    <path d="M100 205 V180 M160 205 V180" stroke="#6A8FC9" stroke-width="3"/>
    ${lead(186, 120, 236, 120)}${lab(242, 120, "A")}${lead(163, 82, 236, 66)}${lab(242, 66, "B")}${lead(130, 170, 236, 176)}${lab(242, 176, "C")}${small(130, 8, "microvilli (brush border)", "middle")}</svg>`,

  gut: `${svgOpen(300, 250, "The human digestive system with organs labelled A to E")}
    <defs><linearGradient id="gtL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B5563E"/><stop offset="1" stop-color="#7A3322"/></linearGradient>
      <linearGradient id="gtS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFC6D0"/><stop offset="1" stop-color="#E88A9C"/></linearGradient>
      <linearGradient id="gtC" x1="0" x2="1"><stop offset="0" stop-color="#D9A77E"/><stop offset=".5" stop-color="#EBC3A0"/><stop offset="1" stop-color="#D9A77E"/></linearGradient></defs>
    <path d="M60 8 Q150 -6 240 8 Q262 120 250 246 H50 Q38 120 60 8Z" fill="#FFF6EE" stroke="#E6CBB0" stroke-width="2"/>
    <path d="M146 8 Q150 40 152 80" stroke="#E8A0B0" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M146 8 Q150 40 152 80" stroke="#9A5B6B" stroke-width="1.2" fill="none"/>
    <path d="M152 84 Q162 70 190 72 Q222 76 214 108 Q208 136 180 138 Q160 138 156 124 Q170 128 184 124 Q198 116 194 100 Q186 88 168 94 Q158 98 152 92Z" fill="url(#gtS)" stroke="#9A5B6B" stroke-width="2"/>
    <path d="M48 70 Q70 52 150 60 Q160 70 146 86 Q120 104 84 104 Q54 102 48 90 Z" fill="url(#gtL)" stroke="#5A2418" stroke-width="2"/><path d="M110 62 Q112 80 104 100" stroke="#5A2418" stroke-width="1.3" fill="none"/>
    <ellipse cx="110" cy="104" rx="8" ry="6" fill="#7CB342" stroke="#3E6B1E" stroke-width="1.5"/>
    <path d="M152 140 Q180 134 214 142 Q220 148 212 152 Q182 148 156 152 Q148 148 152 140Z" fill="#F2D38C" stroke="#9A7A2B" stroke-width="1.6"/>${[164, 176, 188, 200].map(x => `<circle cx="${x}" cy="146" r="1.5" fill="#C9A94A"/>`).join("")}
    <path d="M78 236 V164 Q78 152 90 152 H214 Q226 152 226 164 V222" fill="none" stroke="#9A6A45" stroke-width="18" stroke-linejoin="round"/><path d="M78 236 V164 Q78 152 90 152 H214 Q226 152 226 164 V222" fill="none" stroke="url(#gtC)" stroke-width="14" stroke-linejoin="round"/>
    ${[[78, 172], [78, 192], [78, 212], [110, 152], [140, 152], [170, 152], [200, 152], [226, 172], [226, 192]].map(([x, y]) => `<path d="M${x - (x === 78 || x === 226 ? 7 : 0)} ${y - (x === 78 || x === 226 ? 0 : 7)} ${x === 78 || x === 226 ? "h14" : "v14"}" stroke="#9A6A45" stroke-width="1.2"/>`).join("")}
    <path d="M226 222 Q200 238 160 236 V246" fill="none" stroke="#9A6A45" stroke-width="12"/><path d="M226 222 Q200 238 160 236 V246" fill="none" stroke="#EBC3A0" stroke-width="8"/>
    <path d="M100 172 q12 -10 24 0 t24 0 t24 0 t24 0 M100 190 q12 10 24 0 t24 0 t24 0 t24 0 M100 208 q12 -10 24 0 t24 0 t24 0 t24 0 M104 222 q12 8 24 0 t24 0" fill="none" stroke="#B55C73" stroke-width="9" stroke-linecap="round"/><path d="M100 172 q12 -10 24 0 t24 0 t24 0 t24 0 M100 190 q12 10 24 0 t24 0 t24 0 t24 0 M100 208 q12 -10 24 0 t24 0 t24 0 t24 0 M104 222 q12 8 24 0 t24 0" fill="none" stroke="#F7B9C6" stroke-width="5" stroke-linecap="round"/>
    ${lead(72, 84, 24, 70)}${lab(10, 70, "A")}${lead(206, 96, 262, 84)}${lab(268, 84, "B")}${lead(210, 147, 262, 134)}${lab(268, 134, "C")}${lab(150, 198, "D", "middle")}${lead(226, 200, 262, 200)}${lab(268, 200, "E")}</svg>`,

  yeast: `${svgOpen(320, 190, "Yeast in glucose solution under a layer of oil, with a tube leading into a second tube of liquid. X marks the oil layer and Y the liquid in the second tube")}
    <path d="M60 30 V150 a28 28 0 0 0 56 0 V30" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M62 62 V150 a26 26 0 0 0 52 0 V62Z" fill="#FDE7A6"/><rect x="62" y="52" width="52" height="12" fill="#F5C542" opacity=".8"/>
    ${[[78, 120], [96, 140], [88, 100], [100, 118], [76, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff" stroke="${INK}" stroke-width="1"/>`).join("")}
    <path d="M200 60 V150 a28 28 0 0 0 56 0 V60" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M202 90 V150 a26 26 0 0 0 52 0 V90Z" fill="#D3E4FF"/>
    <path d="M88 44 V14 H228 V132" fill="none" stroke="${INK}" stroke-width="3"/>
    ${lead(114, 58, 150, 70)}${lab(156, 70, "X")}${lead(254, 120, 284, 120)}${lab(290, 120, "Y")}${small(88, 184, "yeast + glucose", "middle", INK)}</svg>`,

  starchTest: `${svgOpen(330, 150, "Steps of testing a leaf for starch: A boiling water, B hot alcohol in a water bath, C iodine solution")}
    <defs><linearGradient id="stW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCEBFA"/><stop offset="1" stop-color="#B9D3EE"/></linearGradient></defs>
    ${["A", "B", "C"].map((t, i) => { const x = 22 + i * 106;
      if (i === 2) return `<rect x="${x}" y="84" width="86" height="26" rx="3" fill="#FFFFFF" stroke="#9A8C88" stroke-width="2"/>
        <path d="M${x + 16} 94 Q${x + 43} 70 ${x + 70} 94 Q${x + 43} 108 ${x + 16} 94Z" fill="#E6E0C8" stroke="#8C7A4A" stroke-width="1.4"/><path d="M${x + 26} 94 Q${x + 43} 80 ${x + 60} 94 Q${x + 43} 102 ${x + 26} 94Z" fill="#1F2350" opacity=".85"/><path d="M${x + 20} 94 H${x + 66}" stroke="#8C7A4A" stroke-width=".8"/>
        <rect x="${x + 50}" y="18" width="8" height="40" rx="2" fill="#E9E1C8" stroke="#8C7A4A" stroke-width="1.2"/><path d="M${x + 50} 18 h8 l0 -6 q-4 -6 -8 0Z" fill="#555" /><path d="M${x + 54} 58 v10" stroke="#8C5A2B" stroke-width="3" stroke-dasharray="2 4"/>${lab(x + 43, 138, t, "middle")}`;
      return `<path d="M${x + 8} 32 V96 Q${x + 8} 104 ${x + 16} 104 H${x + 70} Q${x + 78} 104 ${x + 78} 96 V32" fill="rgba(255,255,255,.6)" stroke="#7A8C9A" stroke-width="2.2"/>
        <path d="M${x + 10} 48 V96 Q${x + 10} 102 ${x + 16} 102 H${x + 70} Q${x + 76} 102 ${x + 76} 96 V48Z" fill="url(#stW)"/>
        ${[[20, 60], [34, 72], [52, 58], [64, 76], [42, 88]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${dy}" r="2.2" fill="none" stroke="#fff" stroke-width="1"/>`).join("")}
        ${i === 1 ? `<rect x="${x + 30}" y="14" width="24" height="84" rx="11" fill="rgba(255,255,255,.75)" stroke="#7A8C9A" stroke-width="2"/><rect x="${x + 32}" y="52" width="20" height="44" rx="9" fill="#C8E6A0" opacity=".9"/><path d="M${x + 36} 70 q6 -8 12 0 q-6 10 -12 0Z" fill="#E8F0C8" stroke="#8CA86A" stroke-width="1"/>` : `<path d="M${x + 26} 84 q17 -16 34 0 q-17 8 -34 0Z" fill="#4FA746" stroke="#2F6B2A" stroke-width="1.4"/>`}
        <rect x="${x + 4}" y="104" width="78" height="6" fill="#9A9A9A"/>
        ${i === 0 ? `<path d="M${x + 43} 128 q-10 -8 0 -22 q10 14 0 22Z" fill="#6FA8FF" opacity=".9"/><path d="M${x + 43} 126 q-5 -4 0 -12 q5 8 0 12Z" fill="#CFE3FF"/><rect x="${x + 37}" y="128" width="12" height="6" fill="#777"/>` : `<rect x="${x + 14}" y="112" width="58" height="14" rx="3" fill="#555"/><circle cx="${x + 64}" cy="119" r="2.5" fill="#FF6B6B"/>`}
        ${lab(x + 43, 142, t, "middle")}`; }).join("")}</svg>`
};
