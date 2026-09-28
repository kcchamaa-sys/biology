
/* ============================================================
   4b. Room scenes: 8 different backdrops. Each has 5 lock objects (hs 0–4) and an exit.
   The stage's special object sits at hs 2, shifted by sp = [dx, dy] from its base at (440, 300).
   ============================================================ */
const SO = `stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`, SO3 = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const H = (name, x, y, item, itemName, line) => ({ name, x, y, item, itemName, line });
// Door-style exit: panel that swings open (class door-panel) over a glowing gap (door-light)
const doorRect = (x, y, w, h, fill, lamp) => `<g class="obj" data-hs="door" id="doorG"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#FDFFB6" class="door-light"/>
  <g class="door-panel"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" ${SO}/><rect x="${x + 14}" y="${y + 18}" width="${w - 28}" height="${h * .36}" rx="6" fill="none" stroke="${INK}" stroke-width="3"/><rect x="${x + 14}" y="${y + h * .48}" width="${w - 28}" height="${h * .43}" rx="6" fill="none" stroke="${INK}" stroke-width="3"/><circle cx="${x + 16}" cy="${y + h * .52}" r="7" fill="#FDFFB6" ${SO}/></g>${lamp || ""}</g>`;
const lampFor = (x, y, solved) => `<rect x="${x}" y="${y}" width="24" height="36" rx="4" fill="#2B2433" stroke="${INK}" stroke-width="3"/><circle cx="${x + 12}" cy="${y + 10}" r="3.5" fill="${solved === 5 ? "#B9F3C9" : "#FF6B6B"}"/>`;

const SCENES = {
  library: { label: "Library", sp: [0, 0], door: { x: 93, y: 47 },
    hs: [H("Bookshelf", 15, 50, "card", "Code card", "A biology textbook is glowing on the shelf... there's a question inside!"), H("Wall clock", 37.5, 20, "hand", "Clock hand", "The clock has stopped ticking. A riddle is written on its face."), null,
      H("Locked box", 38, 86, "key", "Small key", "A cute pink box with a padlock. It's humming quietly..."), H("Safe", 77.5, 63, "gem", "Cell gem", "A heavy safe with a dial. Hmm... Chiikawa gulps.")],
    draw(r, n) {
      const books = ["#FFB7C5", "#A0C4FF", "#FDFFB6", "#B9F3C9", "#C9C3F0", "#FFB7C5", "#A0C4FF"];
      return `<rect width="800" height="500" fill="${r.tint}"/><rect y="360" width="800" height="140" fill="${r.floor}"/><path d="M0 360 H800" ${SO}/>
      <g class="obj" data-hs="0"><rect x="40" y="110" width="160" height="250" rx="8" fill="#D9B48F" ${SO}/>${[170, 240, 310].map(y => `<path d="M40 ${y} H200" ${SO}/>`).join("")}
        ${books.map((c, i) => `<rect x="${52 + i * 20}" y="${i % 2 ? 128 : 124}" width="16" height="${i % 2 ? 42 : 46}" rx="3" fill="${c}" stroke="${INK}" stroke-width="3"/>`).join("")}
        ${books.slice(0, 5).map((c, i) => `<rect x="${60 + i * 24}" y="${196 + (i % 2) * 4}" width="20" height="${44 - (i % 2) * 4}" rx="3" fill="${c}" stroke="${INK}" stroke-width="3"/>`).join("")}<rect x="64" y="262" width="54" height="48" rx="4" fill="#FFFDF0" stroke="${INK}" stroke-width="3"/></g>
      <g class="obj" data-hs="1"><circle cx="300" cy="100" r="46" fill="#FFFDF0" ${SO}/>${[0, 90, 180, 270].map(a => `<circle cx="${300 + 34 * Math.sin(a * Math.PI / 180)}" cy="${100 - 34 * Math.cos(a * Math.PI / 180)}" r="3.5" fill="${INK}"/>`).join("")}<path d="M300 100 V72 M300 100 L318 112" stroke="${INK}" stroke-width="5" stroke-linecap="round"/></g>
      <g class="obj" data-hs="3"><rect x="248" y="400" width="114" height="72" rx="10" fill="#FFB7C5" ${SO}/><path d="M248 424 H362" ${SO}/><rect x="292" y="416" width="26" height="24" rx="5" fill="#FDFFB6" stroke="${INK}" stroke-width="3"/></g>
      <g class="obj" data-hs="4"><rect x="556" y="250" width="128" height="120" rx="10" fill="#B8C3D6" ${SO}/><rect x="570" y="264" width="100" height="92" rx="6" fill="none" stroke="${INK}" stroke-width="3"/><circle cx="620" cy="310" r="20" fill="#FFFDF0" ${SO}/><path d="M620 296 v10" stroke="${INK}" stroke-width="3" stroke-linecap="round"/></g>
      ${doorRect(700, 86, 92, 274, "#C98F6B", lampFor(668, 190, n))}`;
    },
    stand: `<rect x="360" y="300" width="160" height="16" rx="4" fill="#C98F6B" ${SO}/><path d="M378 316 V360 M502 316 V360" ${SO}/>` },

  lab: { label: "Science lab", sp: [-10, 0], door: { x: 93, y: 47 },
    hs: [H("Fume cupboard", 14, 38, "card", "Lab card", "Green mist swirls behind the fume cupboard glass... a note is taped inside!"), H("Cell poster", 38.75, 20, "hand", "Poster pin", "A giant cell poster. One organelle has a question mark on it!"), null,
      H("Test-tube rack", 36, 55, "key", "Test-tube key", "Four test tubes bubble in different colours. One has a tiny key!"), H("Specimen fridge", 79, 50, "gem", "Frozen gem", "Brrr... the specimen fridge is locked with a riddle.")],
    draw(r, n) {
      return `<rect width="800" height="500" fill="${r.tint}"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 100} 0 V380" stroke="rgba(255,255,255,.25)" stroke-width="2"/>`).join("")}<path d="M0 190 H800" stroke="rgba(255,255,255,.25)" stroke-width="2"/>
      <rect y="380" width="800" height="120" fill="${r.floor}"/><path d="M0 380 H800" ${SO}/>${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 100} 380 L${i * 100 - 40} 500" stroke="rgba(0,0,0,.12)" stroke-width="2"/>`).join("")}
      <g class="obj" data-hs="0"><rect x="30" y="70" width="170" height="310" rx="8" fill="#DCE3EA" ${SO}/><rect x="46" y="100" width="138" height="130" rx="6" fill="rgba(185,243,201,.65)" ${SO3}/><path d="M60 200 q20 -30 40 -10 t40 -20" fill="none" stroke="#3E8E3A" stroke-width="3" opacity=".7"/><path d="M96 208 h22 l-4 -40 h-14z" fill="#C9C3F0" ${SO3}/><path d="M30 250 H200" ${SO}/><rect x="60" y="280" width="110" height="80" rx="4" fill="none" ${SO3}/></g>
      <g class="obj" data-hs="1"><rect x="250" y="44" width="120" height="112" rx="6" fill="#FFFDF0" ${SO}/><ellipse cx="310" cy="100" rx="44" ry="34" fill="#B9F3C9" ${SO3}/><circle cx="296" cy="96" r="12" fill="#C9C3F0" ${SO3}/><ellipse cx="330" cy="112" rx="8" ry="5" fill="#F2A36B" stroke="${INK}" stroke-width="2"/></g>
      <rect x="220" y="300" width="340" height="16" rx="4" fill="#8C98AC" ${SO}/><rect x="232" y="316" width="316" height="64" fill="#B8C3D6" ${SO}/>${[0, 1, 2, 3].map(i => `<path d="M${232 + i * 79} 316 V380" ${SO3}/><circle cx="${270 + i * 79}" cy="348" r="4" fill="${INK}"/>`).join("")}
      <g class="obj" data-hs="3"><rect x="246" y="276" width="84" height="24" rx="4" fill="#C98F6B" ${SO3}/>${["#FFB7C5", "#A0C4FF", "#B9F3C9", "#FDFFB6"].map((c, i) => `<rect x="${254 + i * 18}" y="236" width="12" height="52" rx="6" fill="${c}" stroke="${INK}" stroke-width="2.4"/>`).join("")}</g>
      <g class="obj" data-hs="4"><rect x="580" y="150" width="104" height="230" rx="10" fill="#EEF2F8" ${SO}/><path d="M580 230 H684" ${SO3}/><rect x="668" y="178" width="6" height="36" rx="3" fill="${INK}"/><rect x="668" y="250" width="6" height="50" rx="3" fill="${INK}"/><path d="M600 170 l10 10 M620 170 l-10 10" stroke="#A0C4FF" stroke-width="3" stroke-linecap="round"/></g>
      ${doorRect(704, 90, 88, 290, "#A9B8D9", lampFor(700, 60, n))}`;
    },
    stand: "" },

  greenhouse: { label: "Greenhouse", sp: [20, 0], door: { x: 7, y: 50 },
    hs: [H("Watering can", 23, 72, "card", "Seed packet", "A watering can drips... a seed packet with a question floats inside!"), H("Sun lamp", 37.5, 14, "hand", "Lamp switch", "The sun lamp flickers. There's a riddle on its switch."), null,
      H("Seed drawer", 37, 87, "key", "Garden key", "Tiny wooden drawers full of seeds. One won't open without an answer!"), H("Plant shelf", 83, 48, "gem", "Dew gem", "A shelf of sleepy seedlings. A glowing gem hides among the pots.")],
    draw(r, n) {
      return `<rect width="800" height="500" fill="#CFEBFF"/><rect width="800" height="500" fill="${r.tint}" opacity=".45"/>
      ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 100} 0 V390" stroke="#FFFFFF" stroke-width="7" opacity=".8"/><path d="M${i * 100} 0 V390" stroke="${INK}" stroke-width="1.5" opacity=".4"/>`).join("")}<path d="M0 140 H800 M0 270 H800" stroke="#fff" stroke-width="6" opacity=".8"/>
      <path d="M520 40 l40 60 M540 30 l30 45" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>
      <rect y="390" width="800" height="110" fill="#8A6A4A"/><rect y="390" width="800" height="16" fill="${r.floor}"/><path d="M0 390 H800" ${SO}/>
      <g class="obj" data-hs="1"><path d="M300 0 V44" ${SO3}/><path d="M270 44 H330 L318 80 H282 Z" fill="#FDD66B" ${SO}/><ellipse cx="300" cy="96" rx="44" ry="14" fill="rgba(253,255,182,.6)"/></g>
      <g class="obj" data-hs="0"><path d="M140 390 V340 Q140 324 156 324 H212 Q228 324 228 340 V390Z" fill="#A0C4FF" ${SO}/><path d="M228 344 L262 318" ${SO}/><circle cx="266" cy="316" r="7" fill="#A0C4FF" ${SO3}/><path d="M156 324 q28 -30 56 0" fill="none" ${SO}/></g>
      <g class="obj" data-hs="3"><rect x="240" y="404" width="112" height="72" rx="6" fill="#C98F6B" ${SO}/>${[0, 1].map(k => `<path d="M240 ${428 + k * 24} H352" ${SO3}/>`).join("")}${[0, 1, 2].map(k => `<circle cx="296" cy="${417 + k * 24}" r="4" fill="${INK}"/>`).join("")}</g>
      <g class="obj" data-hs="4"><rect x="600" y="150" width="130" height="240" rx="6" fill="rgba(255,255,255,.35)" ${SO}/>${[220, 300].map(y => `<path d="M600 ${y} H730" ${SO3}/>`).join("")}${[[630, 220], [690, 220], [630, 300], [690, 300], [660, 386]].map(([x, y]) => `<path d="M${x - 16} ${y} L${x - 12} ${y - 24} H${x + 12} L${x + 16} ${y}Z" fill="#E07A3F" ${SO3}/><path d="M${x} ${y - 24} q-10 -14 -2 -26 M${x} ${y - 24} q10 -12 4 -22" fill="none" stroke="#3E8E3A" stroke-width="3"/>`).join("")}</g>
      <g class="obj" data-hs="door" id="doorG"><rect x="12" y="110" width="92" height="280" fill="#FDFFB6" class="door-light"/><g class="door-panel"><rect x="12" y="110" width="92" height="280" rx="6" fill="rgba(211,228,255,.85)" ${SO}/><path d="M58 110 V390 M12 250 H104" ${SO3}/><circle cx="92" cy="258" r="6" fill="#FDFFB6" ${SO3}/></g>${lampFor(108, 150, n)}</g>`;
    },
    stand: `<rect x="370" y="300" width="180" height="16" rx="4" fill="#A8703F" ${SO}/><path d="M388 316 V390 M532 316 V390" ${SO}/>` },

  cellworld: { label: "Inside a cell", sp: [40, 10], door: { x: 94, y: 48 },
    hs: [H("Nucleus", 19, 42, "card", "DNA card", "The giant nucleus glows purple... a message is written in its DNA!"), H("Mitochondrion", 45, 16, "hand", "Energy spark", "A bean-shaped mitochondrion hums with energy. It wants an answer!"), null,
      H("Ribosome cluster", 31, 84, "key", "Protein key", "Tiny ribosomes are building a protein key... answer to take it!"), H("Vacuole bubble", 82.5, 66, "gem", "Bubble gem", "A wobbly vacuole bubble. Something sparkly floats inside.")],
    draw(r, n) {
      return `<defs><radialGradient id="cyto" cx=".45" cy=".45" r=".75"><stop offset="0" stop-color="#FFF6FA"/><stop offset="1" stop-color="${r.tint}"/></radialGradient></defs><rect width="800" height="500" fill="url(#cyto)"/>
      <path d="M0 16 Q100 0 200 18 T400 14 T600 20 T800 12 M0 484 Q120 500 240 482 T480 488 T800 480" fill="none" stroke="#E27893" stroke-width="10" opacity=".6"/>
      ${[[120, 380], [540, 120], [600, 440], [260, 250], [700, 60], [80, 80], [380, 440], [660, 230]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#C9C3F0" opacity=".8"/>`).join("")}
      <path d="M40 300 Q160 260 300 320 T560 300" fill="none" stroke="#F2A6B8" stroke-width="6" opacity=".5"/>
      <g class="obj" data-hs="0"><circle cx="152" cy="210" r="96" fill="#C9C3F0" ${SO}/><circle cx="152" cy="210" r="84" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="10 8"/><circle cx="176" cy="196" r="26" fill="#8E7CC3" ${SO3}/><path d="M100 250 q20 -20 40 0 t40 0" fill="none" stroke="#6B4E8C" stroke-width="3"/></g>
      <g class="obj" data-hs="1" transform="rotate(-12 360 80)"><ellipse cx="360" cy="80" rx="80" ry="36" fill="#F9C9A6" ${SO}/><path d="M292 80 h14 v-18 h14 v36 h14 v-36 h14 v36 h14 v-36 h14 v36 h14 v-18 h18" fill="none" ${SO3}/></g>
      <g class="obj" data-hs="3">${[[230, 410], [250, 432], [272, 412], [252, 392], [292, 428], [214, 432], [276, 448]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="#A0C4FF" ${SO3}/>`).join("")}</g>
      <g class="obj" data-hs="4"><circle cx="660" cy="330" r="62" fill="rgba(160,196,255,.55)" ${SO}/><path d="M624 300 q12 -18 34 -20" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/></g>
      <g class="obj" data-hs="door" id="doorG"><rect x="732" y="150" width="60" height="180" fill="#FDFFB6" class="door-light"/><g class="door-panel"><path d="M732 150 H792 V330 H732 Q720 240 732 150Z" fill="#FFB7C5" ${SO}/><path d="M748 170 V310 M776 170 V310" stroke="${INK}" stroke-width="3" stroke-dasharray="8 6"/></g>${lampFor(700, 190, n)}</g>`;
    },
    stand: `<ellipse cx="440" cy="306" rx="96" ry="18" fill="#FFD6DF" ${SO}/>` },

  kitchen: { label: "Kitchen", sp: [20, 0], door: { x: 92, y: 48 },
    hs: [H("Fridge", 11, 50, "card", "Recipe card", "The fridge hums... a recipe card is stuck on it with a question!"), H("Menu board", 37.5, 19, "hand", "Chalk stick", "Today's menu is written in chalk... and a riddle!"), null,
      H("Rice cooker", 30, 50, "key", "Lid key", "The rice cooker beeps. Its lid is locked until you answer!"), H("Oven", 70, 70, "gem", "Toasty gem", "Something warm glows inside the oven...")],
    draw(r, n) {
      return `<rect width="800" height="500" fill="${r.tint}"/><rect y="200" width="800" height="100" fill="#FFFDF0" opacity=".6"/>${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 50} 200 V300" stroke="rgba(0,0,0,.08)" stroke-width="2"/>`).join("")}<path d="M0 250 H800" stroke="rgba(0,0,0,.08)" stroke-width="2"/>
      <rect y="380" width="800" height="120" fill="${r.floor}"/>${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 50}" y="${380 + (i % 2) * 40}" width="50" height="40" fill="rgba(255,255,255,.25)"/>`).join("")}<path d="M0 380 H800" ${SO}/>
      <g class="obj" data-hs="0"><rect x="30" y="120" width="124" height="260" rx="12" fill="#EEF2F8" ${SO}/><path d="M30 220 H154" ${SO3}/><rect x="136" y="150" width="7" height="44" rx="3" fill="${INK}"/><rect x="136" y="240" width="7" height="60" rx="3" fill="${INK}"/><circle cx="70" cy="170" r="10" fill="#FFB7C5" ${SO3}/><rect x="90" y="250" width="30" height="24" rx="3" fill="#FDFFB6" stroke="${INK}" stroke-width="2"/></g>
      <g class="obj" data-hs="1"><rect x="230" y="46" width="140" height="96" rx="6" fill="#2F4A3A" stroke="#8A6A4A" stroke-width="8"/><path d="M250 76 h60 M250 96 h90 M250 116 h50" stroke="#FFFDF0" stroke-width="3" stroke-linecap="round" opacity=".85"/></g>
      <rect x="180" y="300" width="460" height="16" rx="4" fill="#C98F6B" ${SO}/><rect x="192" y="316" width="436" height="64" fill="#E9CFA3" ${SO}/>
      <g class="obj" data-hs="3"><rect x="206" y="248" width="80" height="52" rx="18" fill="#FFFDF0" ${SO}/><path d="M206 266 H286" ${SO3}/><circle cx="246" cy="286" r="5" fill="#FF6B6B"/><rect x="236" y="238" width="20" height="10" rx="4" fill="${INK}"/></g>
      <g class="obj" data-hs="4"><rect x="512" y="320" width="110" height="58" rx="6" fill="#8C98AC" ${SO3}/><rect x="526" y="332" width="82" height="34" rx="4" fill="#FFD27A" ${SO3}/></g>
      ${doorRect(690, 100, 88, 280, "#F2B6A0", lampFor(656, 150, n))}`;
    },
    stand: "" },

  pond: { label: "Underwater pond", sp: [20, 0], door: { x: 93, y: 45 },
    hs: [H("Coral rock", 14, 70, "card", "Shell card", "Bubbles rise from the coral... a shell card is wedged inside!"), H("Jellyfish", 38.75, 18, "hand", "Glow tentacle", "A friendly jellyfish glows. It won't let go of its riddle!"), null,
      H("Giant clam", 37.5, 86, "key", "Pearl key", "A giant clam snaps shut. It opens only for a correct answer!"), H("Treasure chest", 80, 81, "gem", "Sea gem", "A sunken treasure chest... locked with a question!")],
    draw(r, n) {
      return `<defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${r.tint}"/><stop offset="1" stop-color="#3E6E8E"/></linearGradient></defs><rect width="800" height="500" fill="url(#sea)"/>
      ${[120, 300, 520].map(x => `<path d="M${x} 0 L${x - 60} 380 L${x + 20} 380 L${x + 40} 0Z" fill="#fff" opacity=".08"/>`).join("")}
      <path d="M0 400 Q100 380 200 400 T400 398 T600 404 T800 396 V500 H0Z" fill="#E9D6A6" ${SO}/>
      ${[[560, 400], [600, 400], [250, 404]].map(([x, y]) => `<path d="M${x} ${y} q-14 -40 4 -80 q-16 -30 0 -60" fill="none" stroke="#3E8E3A" stroke-width="7" stroke-linecap="round"/>`).join("")}
      ${[[180, 200, 6], [196, 170, 4], [620, 150, 5], [640, 120, 3]].map(([x, y, s]) => `<circle cx="${x}" cy="${y}" r="${s}" fill="none" stroke="#fff" stroke-width="2"/>`).join("")}
      <g class="obj" data-hs="0"><path d="M40 400 Q40 300 80 290 Q90 250 120 270 Q150 240 170 290 Q200 320 180 400Z" fill="#FF9F9F" ${SO}/>${[[86, 320], [130, 300], [150, 350], [100, 370]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#FFD6DF" stroke="${INK}" stroke-width="2"/>`).join("")}</g>
      <g class="obj" data-hs="1"><path d="M270 96 Q270 50 310 50 Q350 50 350 96Z" fill="rgba(201,195,240,.9)" ${SO}/>${[282, 298, 314, 330].map(x => `<path d="M${x} 96 q-8 24 4 46" fill="none" stroke="#C9C3F0" stroke-width="4" stroke-linecap="round"/>`).join("")}<circle cx="298" cy="78" r="3" fill="${INK}"/><circle cx="322" cy="78" r="3" fill="${INK}"/></g>
      <g class="obj" data-hs="3"><path d="M250 450 Q300 380 350 450Z" fill="#F4E6CF" ${SO}/><path d="M262 450 L300 404 M300 450 V404 M338 450 L300 404" stroke="${INK}" stroke-width="2"/><path d="M250 450 Q300 470 350 450" fill="#E9D6A6" ${SO3}/></g>
      <g class="obj" data-hs="4"><rect x="588" y="384" width="104" height="64" rx="8" fill="#A8703F" ${SO}/><path d="M588 406 H692" ${SO3}/><path d="M588 384 Q640 350 692 384" fill="#C98F6B" ${SO}/><rect x="630" y="398" width="20" height="18" rx="3" fill="#F5C542" ${SO3}/></g>
      <g class="obj" data-hs="door" id="doorG"><path d="M704 330 V180 Q748 110 792 180 V330Z" fill="#FDFFB6" class="door-light"/><g class="door-panel"><path d="M704 330 V180 Q748 110 792 180 V330Z" fill="#2B3A4A" ${SO}/><path d="M722 320 V190 M748 320 V160 M774 320 V190" stroke="#4E6A80" stroke-width="4"/></g>${lampFor(672, 230, n)}</g>`;
    },
    stand: `<ellipse cx="440" cy="310" rx="100" ry="22" fill="#9AA6B2" ${SO}/>` },

  garden: { label: "Secret garden", sp: [5, 0], door: { x: 94, y: 62 },
    hs: [H("Tree hollow", 13, 46, "card", "Leaf card", "Something rustles inside the tree hollow... a leaf card with a riddle!"), H("Beehive", 37.5, 20, "hand", "Honey spoon", "Bzzz! The bees guard a honey spoon. Answer to borrow it!"), null,
      H("Mushroom ring", 34, 86, "key", "Mushroom key", "A ring of glowing mushrooms. The biggest one hides a key!"), H("Garden shed", 78, 56, "gem", "Garden gem", "The old shed door is stuck. A riddle is carved on it.")],
    draw(r, n) {
      return `<rect width="800" height="500" fill="#CFEBFF"/><circle cx="660" cy="70" r="40" fill="#FDD66B" opacity=".9"/><path d="M0 300 Q200 230 420 290 T800 270 V380 H0Z" fill="${r.tint}" opacity=".8"/>
      <rect y="370" width="800" height="130" fill="${r.floor}"/><path d="M0 370 H800" ${SO}/>${Array.from({ length: 20 }, (_, i) => `<path d="M${i * 40 + 10} 372 l4 -12 l4 12" fill="none" stroke="#3E8E3A" stroke-width="2"/>`).join("")}
      ${Array.from({ length: 6 }, (_, i) => `<rect x="${540 + i * 26}" y="320" width="10" height="52" rx="3" fill="#FFFDF0" stroke="${INK}" stroke-width="2"/>`).join("")}
      <g class="obj" data-hs="0"><rect x="70" y="170" width="70" height="200" fill="#8A6A4A" ${SO}/><circle cx="105" cy="140" r="86" fill="#7BC96F" ${SO}/><circle cx="60" cy="110" r="10" fill="#FFB7C5"/><circle cx="150" cy="130" r="9" fill="#FFB7C5"/><ellipse cx="105" cy="232" rx="18" ry="26" fill="#3E2A1E" ${SO3}/></g>
      <g class="obj" data-hs="1"><path d="M240 40 H380" ${SO}/><path d="M300 40 V58" ${SO3}/><ellipse cx="300" cy="96" rx="34" ry="40" fill="#F5C542" ${SO}/>${[80, 96, 112].map(y => `<path d="M270 ${y} H330" stroke="${INK}" stroke-width="2"/>`).join("")}<ellipse cx="300" cy="124" rx="8" ry="6" fill="#3E2A1E"/></g>
      <g class="obj" data-hs="3">${[[240, 440, 20, "#FF6B6B"], [280, 430, 26, "#FFB7C5"], [320, 446, 18, "#C9C3F0"]].map(([x, y, s, c]) => `<rect x="${x - 5}" y="${y}" width="10" height="${s}" rx="3" fill="#FFFDF0" ${SO3}/><path d="M${x - s} ${y + 2} Q${x} ${y - s * 1.2} ${x + s} ${y + 2}Z" fill="${c}" ${SO3}/>`).join("")}</g>
      <g class="obj" data-hs="4"><path d="M560 370 V230 L625 180 L690 230 V370Z" fill="#C98F6B" ${SO}/><rect x="600" y="280" width="50" height="90" rx="4" fill="#8A6A4A" ${SO3}/><rect x="578" y="236" width="30" height="26" fill="#D3E4FF" ${SO3}/></g>
      <g class="obj" data-hs="door" id="doorG"><rect x="714" y="250" width="76" height="120" fill="#FDFFB6" class="door-light"/><g class="door-panel"><rect x="714" y="250" width="76" height="120" rx="4" fill="#FFFDF0" ${SO}/>${[730, 752, 774].map(x => `<path d="M${x} 256 V366" ${SO3}/>`).join("")}<path d="M714 290 H790 M714 336 H790" ${SO3}/></g>${lampFor(708, 206, n)}</g>`;
    },
    stand: `<rect x="380" y="300" width="130" height="70" rx="10" fill="#A8703F" ${SO}/><ellipse cx="445" cy="302" rx="65" ry="12" fill="#E9CFA3" ${SO3}/>` },

  clinic: { label: "Clinic", sp: [0, 0], door: { x: 93, y: 47 },
    hs: [H("X-ray light box", 14, 28, "card", "X-ray film", "The X-ray box flickers on... there's a question written on the film!"), H("Eye chart", 36, 22, "hand", "Eye-chart letter", "The eye chart letters rearrange into a riddle!"), null,
      H("Medicine drawer", 35.5, 68, "key", "Drawer key", "The medicine drawer is locked. The label has a question."), H("Weighing scale", 77.5, 70, "gem", "Balance gem", "The scale wobbles... a gem sits on it.")],
    draw(r, n) {
      return `<rect width="800" height="500" fill="${r.tint}"/><rect y="250" width="800" height="130" fill="#FFFDF0" opacity=".35"/>
      <rect y="380" width="800" height="120" fill="${r.floor}"/><path d="M0 380 H800" ${SO}/><path d="M0 250 H700" stroke="${INK}" stroke-width="2" opacity=".3"/>
      <rect x="430" y="60" width="140" height="100" rx="6" fill="#CFEBFF" ${SO}/><path d="M500 60 V160 M430 110 H570" ${SO3}/>
      <g class="obj" data-hs="0"><rect x="40" y="70" width="150" height="120" rx="6" fill="#F4FBFF" ${SO}/><rect x="52" y="82" width="126" height="96" fill="#2B3A4A"/>${[100, 116, 132, 148].map(y => `<path d="M80 ${y} q35 -12 70 0" fill="none" stroke="#fff" stroke-width="3"/>`).join("")}<path d="M115 90 V170" stroke="#fff" stroke-width="4"/></g>
      <g class="obj" data-hs="1"><rect x="252" y="50" width="80" height="120" rx="4" fill="#fff" ${SO}/>${[["E", 76, 26], ["F P", 104, 18], ["T O Z", 128, 13], ["L P E D", 150, 10]].map(([t, y, s]) => `<text x="292" y="${y}" font-size="${s}" font-weight="800" text-anchor="middle" fill="${INK}">${t}</text>`).join("")}</g>
      <g class="obj" data-hs="3"><rect x="230" y="296" width="110" height="84" rx="6" fill="#EEF2F8" ${SO}/><path d="M230 324 H340 M230 352 H340" ${SO3}/>${[310, 338, 366].map(y => `<rect x="274" y="${y}" width="22" height="6" rx="3" fill="${INK}"/>`).join("")}<path d="M280 286 h10 v-10 h10 v10 h10 v10 h-10 v10 h-10 v-10 h-10z" fill="#FF6B6B" stroke="${INK}" stroke-width="1.5"/></g>
      <g class="obj" data-hs="4"><rect x="580" y="350" width="84" height="30" rx="6" fill="#B8C3D6" ${SO}/><path d="M622 350 V250" ${SO}/><circle cx="622" cy="240" r="22" fill="#FFFDF0" ${SO}/><path d="M622 240 l8 -10" stroke="${INK}" stroke-width="3" stroke-linecap="round"/></g>
      ${doorRect(704, 90, 88, 290, "#D3E4FF", lampFor(672, 170, n))}`;
    },
    stand: `<rect x="370" y="300" width="150" height="14" rx="4" fill="#B8C3D6" ${SO}/><path d="M384 314 V366 M506 314 V366" ${SO}/><circle cx="384" cy="372" r="7" fill="${INK}"/><circle cx="506" cy="372" r="7" fill="${INK}"/>` }
};
// Fill in each scene's special-object lock position from its offset
Object.values(SCENES).forEach(sc => { sc.hs[2] = H("", +((440 + sc.sp[0]) / 8).toFixed(1), +((262 + sc.sp[1]) / 5).toFixed(1), "orb", "", ""); });
let HOTSPOTS = SCENES.library.hs, DOOR = SCENES.library.door;
