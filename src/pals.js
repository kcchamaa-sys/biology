
/* ============================================================
   4c. 🐾 Study Pals: the character you raise. The active pal IS the main character
   (room, dialogue, dress-up, avatar). Each pal has Energy, Happiness, XP / level,
   3 evolution stages (Baby → Junior → Master), moods, a small perk, a favourite food and a real biology fact.
   19 animal pals come from the S1 Science game; 8 are new biology pals.
   Rarity: common · rare · epic (adopt with 🌰 once the goal is met) · legendary (free, very hard goals) · mythic (🌰 only).
   ============================================================ */
const PAL_RAR = { common: ["Common", "#E5E5E5", "#AFAFAF"], rare: ["Rare", "#BDE7FF", "#1CB0F6"], epic: ["Epic", "#EBD4FF", "#CE82FF"], legend: ["Legendary", "#FFE9A6", "#FFC800"], myth: ["Mythic", "#FFD6F0", "#FF86D0"] };
const PAL_ORDER = { myth: 0, legend: 1, epic: 2, rare: 3, common: 4 };
const PERK_TXT = { xp: v => `+${Math.round(v * 100)}% pal XP`, coins: v => `+${Math.round(v * 100)}% chestnuts`, food: v => `Food ${Math.round(v * 100)}% cheaper`,
  calm: v => `Happiness drops ${v >= 1 ? "never" : "half as fast"}`, energy: v => `Energy drops ${v >= 1 ? "never" : "half as fast"}`, notebook: v => `+${Math.round(v * 100)}% Mistake Notebook chestnuts`,
  dict: v => `+${Math.round(v * 100)}% dictation chestnuts`, rush: v => `+${Math.round(v * 100)}% Cell Rush chestnuts` };
const P_ = (id, name, sp, body, belly, rar, price, cond, perk, fav, desc, fact, extra) => Object.assign({ id, name, sp, body, belly, rar, price, cond, perk, fav, desc, fact }, extra || {});
const PALS = [
  P_("mochi", "Mochi", "bear", "#FFFFFF", "#FFF6EE", "common", 0, null, ["calm", .5], "rice", "A squishy rice-cake bear who loves taking notes.", "Bears fatten up before winter: stored fat is respired slowly during hibernation."),
  P_("matcha", "Matcha", "frog", "#C9E7B4", "#EAF4E2", "rare", 150, ["streak", 3, "Reach a 3-day streak"], ["xp", .08], "salad", "A calm little frog who hums in the rain.", "Frogs can take in oxygen through their thin, moist skin as well as their lungs."),
  P_("sakura", "Sakura", "bunny", "#FFD9E2", "#FFEDF1", "rare", 200, ["studies", 5, "Finish 5 stages or study series"], ["coins", .05], "apple", "A shy bunny who blushes at every right answer.", "Rabbits eat some of their own soft droppings, so plant food passes through the gut twice and more cellulose is digested."),
  P_("pudding", "Pudding", "chick", "#FFE58F", "#FFF5D6", "rare", 250, ["correct", 150, "Answer 150 questions right"], ["food", .2], "rice", "A wobbly chick who is scared of Bunsen flames.", "A chick inside an egg breathes through thousands of tiny pores in the shell."),
  P_("soda", "Soda", "seal", "#CFE7F6", "#E9F5FC", "rare", 300, ["cleared", 10, "Clear 10 Mistake Notebook questions"], ["notebook", .25], "fish", "A bubbly seal who loves deep dives.", "When a seal dives, its heart rate slows right down to save oxygen for the brain and heart."),
  P_("kinako", "Kinako", "hamster", "#F6D6A4", "#FFF6E8", "rare", 300, ["days", 7, "Play on 7 different days"], ["energy", .5], "banana", "A round hamster who stores facts in her cheeks.", "A hamster's front teeth never stop growing, so it gnaws to wear them down."),
  P_("hachi", "Hachi", "bee", "#FFD24D", "#FFEFB0", "rare", 350, ["sims", 3, "Try 3 Lab simulations"], ["xp", .08], "banana", "A busy bee who pollinates every flower on the way to class.", "Honeybees do a 'waggle dance' to tell other bees the direction and distance of food."),
  P_("kame", "Kame", "turtle", "#A9D98B", "#F2F7D9", "rare", 350, ["streak", 5, "Reach a 5-day streak"], ["energy", .5], "salad", "A slow-and-steady turtle who never skips a day.", "Turtles are ectotherms: they warm up by basking, because they can't make enough body heat themselves."),
  P_("noro", "Noro", "sloth", "#C9A88A", "#F3E6D6", "rare", 400, ["three", 3, "Get 3★ in 3 stages"], ["calm", .5], "salad", "A sleepy sloth who reads one page very, very carefully.", "Sloths have such a slow metabolism that green algae grow in their fur, giving them camouflage."),
  P_("taro", "Taro", "cat", "#E4D6F3", "#F2EAFA", "epic", 500, ["three", 8, "Get 3★ in 8 stages"], ["coins", .06], "fish", "A sleepy cat who dreams in DNA spirals.", "Cats can't taste sweetness: the gene for their sweet-taste receptor doesn't work."),
  P_("goma", "Goma", "panda", "#FFFFFF", "#F6F2EF", "epic", 500, ["days", 14, "Play on 14 different days"], ["energy", .5], "salad", "A panda who naps on textbooks.", "Pandas eat bamboo but have a meat-eater's short gut, so they digest little of it and eat for 12+ hours a day."),
  P_("mikan", "Mikan", "fox", "#FFC894", "#FFF4E8", "epic", 550, ["dict", 3, "Get 3 perfect dictation rounds"], ["dict", .2], "egg", "A tangerine fox who listens for every syllable.", "A fox's large ears have many blood vessels close to the surface, which helps it lose heat."),
  P_("nori", "Nori", "penguin", "#8494B5", "#FFFFFF", "epic", 600, ["streak", 7, "Reach a 7-day streak"], ["rush", .15], "fish", "A tiny penguin who slides into every Cell Rush.", "In a penguin's legs, warm blood flowing down heats the cold blood flowing back (countercurrent exchange)."),
  P_("ume", "Ume", "axolotl", "#FFC9DA", "#FFE8F0", "epic", 650, ["cleared", 30, "Clear 30 Mistake Notebook questions"], ["notebook", .25], "fish", "A smiley axolotl who waves her frilly gills.", "Axolotls can regrow lost legs, and even parts of the heart and brain."),
  P_("wata", "Wata", "sheep", "#FFF7EA", "#FFFDF8", "epic", 650, ["rush", 150, "Score 150 in Cell Rush"], ["food", .2], "salad", "A fluffy lamb made of marshmallow clouds.", "Sheep are ruminants: microbes in their four-part stomach digest the cellulose in grass."),
  P_("chiku", "Chiku", "hedgehog", "#F3E1C8", "#FFF8EE", "epic", 700, ["spell", 80, "Spell 80 key terms right"], ["dict", .2], "egg", "A shy hedgehog who spells every word twice.", "Hedgehog spines are hairs made of keratin, the same protein as your nails."),
  P_("kuma", "Kuma", "koala", "#D6D9DE", "#F2F3F5", "epic", 750, ["three", 18, "Get 3★ in 18 stages"], ["energy", .5], "salad", "A dozy koala who naps between quizzes.", "Koalas sleep up to 20 hours a day: eucalyptus leaves give very little energy and gut bacteria must break down their toxins."),
  P_("chiro", "Chiro", "bat", "#A79BC9", "#EDE8FA", "epic", 800, ["sims", 5, "Try all 5 Lab simulations"], ["xp", .1], "banana", "A night-time bat who 'sees' with sound.", "Bats use echolocation: they make high-pitched calls and listen for the echoes. Hong Kong has over 20 bat species."),
  P_("tako", "Tako", "octopus", "#FF9AA2", "#FFE1E4", "epic", 850, ["correct", 600, "Answer 600 questions right"], ["coins", .08], "fish", "A clever octopus who solves puzzles with all eight arms.", "An octopus has three hearts and blue blood: it carries oxygen with haemocyanin, which contains copper."),
  P_("kurage", "Kurage", "jelly", "#D9CCFF", "#F2EDFF", "epic", 900, ["missions", 10, "Complete 10 daily missions"], ["notebook", .3], "fish", "A dreamy jellyfish who drifts through revision.", "Jellyfish have no brain, heart or blood: their body is so thin that oxygen simply diffuses in."),
  P_("nova", "Nova", "unicorn", "#F4EEFF", "#FFFFFF", "legend", 0, ["days", 60, "Play on 60 different days"], ["xp", .12], "apple", "A legendary star-unicorn that only visits the most devoted scientists.", "Unicorns aren't real, but the narwhal's 'horn' is: it's a long tooth with millions of nerve endings."),
  P_("petal", "Petal", "fawn", "#E9B98E", "#FFF3E6", "legend", 0, ["topics", 10, "Clear 10 whole topics"], ["coins", .1], "salad", "A legendary blossom fawn who grows a little every day.", "Deer antlers are bone that falls off and regrows every year, one of the fastest-growing tissues in any animal."),
  P_("riccio", "Riccio", "pangolin", "#C98B6B", "#FBEFE6", "legend", 0, ["streak", 30, "Reach a 30-day streak"], ["xp", .1], "egg", "A legendary Hong Kong pangolin who rolls into a ball when exams get scary.", "The Chinese pangolin lives wild in Hong Kong and is critically endangered. Its scales are made of keratin."),
  P_("hikari", "Hikari", "firefly", "#FFF3B0", "#FFFBE0", "legend", 0, ["correct", 1500, "Answer 1,500 questions right"], ["xp", .1], "banana", "A legendary firefly whose tail glows brighter with every right answer.", "Fireflies glow by bioluminescence: an enzyme (luciferase) uses ATP to make light with almost no heat."),
  P_("finn", "Finn", "shark", "#8FBCE6", "#FFFFFF", "myth", 1500, null, ["coins", .08], "fish", "A mythic baby shark who never stops swimming, just like a streak.", "A shark's skeleton is cartilage, not bone, and many sharks must keep swimming to push water over their gills."),
  P_("tardi", "Tardi", "tardigrade", "#D8CBB5", "#F5EEDF", "myth", 2500, null, ["energy", 1], "rice", "A mythic water bear who survives absolutely anything.", "Tardigrades can dry out almost completely and survive boiling, freezing, radiation and even outer space."),
  P_("luna", "Luna", "owl", "#8A86C9", "#F3EEFF", "myth", 3500, null, ["notebook", .3], "fish", "A mythic moon owl who reads every textbook at night.", "Owls can turn their heads about 270°, and their ears sit at different heights to pinpoint sounds.")
];
const palById = id => PALS.find(p => p.id === id) || PALS[0];
const activePalId = () => (S && S.activePal && S.pals && S.pals[S.activePal] ? S.activePal : "mochi");
const activePal = () => palById(activePalId());
const palName = () => activePal().name;
const palState = id => { S.pals = S.pals || {}; if (!S.pals[id]) S.pals[id] = newPal(); return S.pals[id]; };
function newPal() { return { xp: 0, stage: 1, energy: 80, happy: 80, t: Date.now(), meals: 0 }; }
const palLevel = xp => Math.floor(Math.sqrt((xp || 0) / 25)) + 1;
const lvXP = l => 25 * (l - 1) * (l - 1);
const STAGES = [null, "Baby", "Junior", "Master"];
const EVO = { common: [[5, 120], [10, 300]], rare: [[5, 120], [10, 300]], epic: [[5, 150], [10, 350]], legend: [[7, 250], [13, 600]], myth: [[8, 400], [15, 900]] };
function perk(kind) { if (!S) return 1; const [t, v] = activePal().perk; return t === kind ? 1 + v : 1; }
const perkLabel = P => PERK_TXT[P.perk[0]](P.perk[1]);
const palVal = k => !S ? 0 : ({ streak: S.longest_streak, days: S.stats.days, studies: (S.stats.studyClears || 0) + (S.stats.escClears || 0), correct: S.stats.correct, cleared: S.mistakes_cleared || 0,
  sims: Object.keys(S.sims || {}).length, three: Object.values(S.room_stars || {}).filter(v => v >= 3).length, dict: S.stats.dictPerfect, rush: S.rush.best, spell: S.stats.spellRight,
  missions: S.stats.missions || 0, topics: typeof topicsCleared === "function" ? topicsCleared() : 0 })[k] || 0;
const condMet = P => !P.cond || palVal(P.cond[0]) >= P.cond[1];
const condPct = P => !P.cond ? (P.price ? Math.min(1, S.coins / P.price) : 1) : Math.min(1, palVal(P.cond[0]) / P.cond[1]);

/* ----- Art: every pal shares Mochi's squishy body; species features are layered on (ported from the S1 Science pals) ----- */
const PST = `stroke="${CO}" stroke-width="3.5" stroke-linejoin="round"`;
const bellyEl = (c, ry = 20) => `<ellipse cx="100" cy="152" rx="36" ry="${ry}" fill="${c}"/>`;
const clipBody = inner => { const id = "pb" + (++clipN); return `<clipPath id="${id}"><path d="${BODY}"/></clipPath><g clip-path="url(#${id})">${inner}</g>`; };
const PAL_ART = {
  frog: { back: b => `<circle cx="70" cy="72" r="17" fill="${b}" ${PST}/><circle cx="130" cy="72" r="17" fill="${b}" ${PST}/>`, front: (b, be) => bellyEl(be) + `<circle cx="70" cy="72" r="7" fill="#fff"/><circle cx="130" cy="72" r="7" fill="#fff"/>` },
  bunny: { back: b => `<ellipse cx="76" cy="44" rx="13" ry="32" fill="${b}" ${PST} transform="rotate(-12 76 44)"/><ellipse cx="124" cy="44" rx="13" ry="32" fill="${b}" ${PST} transform="rotate(12 124 44)"/><ellipse cx="76" cy="46" rx="6" ry="22" fill="#FFB9C8" transform="rotate(-12 76 46)"/><ellipse cx="124" cy="46" rx="6" ry="22" fill="#FFB9C8" transform="rotate(12 124 46)"/>`, front: (b, be) => bellyEl(be) },
  chick: { back: () => `<path d="M100 64 C94 48 98 40 104 38 C102 46 104 54 100 64Z M100 64 C108 50 116 48 120 50 C112 54 106 60 100 64Z" fill="#F7D476" ${PST}/>`, front: (b, be) => bellyEl(be), after: () => `<path d="M94 124 L106 124 L100 132Z" fill="#FF9600" stroke="${CO}" stroke-width="2" stroke-linejoin="round"/>` },
  seal: { front: (b, be) => bellyEl(be), after: () => `<path d="M52 124 L36 120 M52 130 L36 132 M148 124 L164 120 M148 130 L164 132" stroke="${CO}" stroke-width="2" stroke-linecap="round"/><ellipse cx="100" cy="125" rx="5" ry="3.5" fill="${CO}"/>` },
  hamster: { back: b => `<circle cx="64" cy="74" r="11" fill="${b}" ${PST}/><circle cx="136" cy="74" r="11" fill="${b}" ${PST}/><circle cx="64" cy="74" r="5" fill="#FFC6D2"/><circle cx="136" cy="74" r="5" fill="#FFC6D2"/>`, front: (b, be) => bellyEl(be) + `<ellipse cx="100" cy="78" rx="9" ry="10" fill="#E3AE6C" opacity=".8"/>` },
  bee: { back: () => `<ellipse cx="44" cy="92" rx="22" ry="14" fill="rgba(220,240,255,.85)" ${PST} transform="rotate(-30 44 92)"/><ellipse cx="156" cy="92" rx="22" ry="14" fill="rgba(220,240,255,.85)" ${PST} transform="rotate(30 156 92)"/><path d="M86 66 Q78 40 68 34 M114 66 Q122 40 132 34" stroke="${CO}" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="68" cy="34" r="6" fill="${CO}"/><circle cx="132" cy="34" r="6" fill="${CO}"/>`,
    front: () => clipBody(`<path d="M0 142 Q100 128 200 142 V156 Q100 142 0 156Z M0 166 Q100 152 200 166 V182 Q100 168 0 182Z" fill="#4B3B2F"/>`) },
  turtle: { back: () => `<path d="M100 186 l-6 8 l12 -2Z" fill="#7CBF5E" ${PST}/>`,
    front: () => clipBody(`<path d="M0 0 H200 V96 Q100 74 0 96Z" fill="#8A6A3F"/><path d="M70 72 l14 -10 h32 l14 10 M84 62 v-14 M116 62 v-14 M58 90 l12 -18 M142 90 l-12 -18" stroke="#5E4526" stroke-width="3" fill="none"/>`) + bellyEl("#F2F7D9") },
  sloth: { front: (b, be) => bellyEl(be) + `<ellipse cx="100" cy="118" rx="46" ry="26" fill="#F3E6D6"/><path d="M68 108 Q78 104 88 116 Q80 128 68 120Z M132 108 Q122 104 112 116 Q120 128 132 120Z" fill="#6B4E3A"/>`, after: () => `<ellipse cx="100" cy="124" rx="5" ry="3.5" fill="${CO}"/>` },
  cat: { back: b => `<path d="M50 96 L56 50 L90 70Z" fill="${b}" ${PST}/><path d="M150 96 L144 50 L110 70Z" fill="${b}" ${PST}/><path d="M58 84 L61 60 L80 72Z M142 84 L139 60 L120 72Z" fill="#F7C6D4"/>`, front: (b, be) => bellyEl(be), after: () => `<path d="M52 124 L36 120 M52 130 L36 132 M148 124 L164 120 M148 130 L164 132" stroke="${CO}" stroke-width="2" stroke-linecap="round"/>` },
  panda: { back: () => `<circle cx="60" cy="76" r="15" fill="#4B4B4B" ${PST}/><circle cx="140" cy="76" r="15" fill="#4B4B4B" ${PST}/>`, front: (b, be) => bellyEl(be) + `<ellipse cx="80" cy="117" rx="13" ry="14" fill="#5E5555" transform="rotate(-20 80 117)"/><ellipse cx="120" cy="117" rx="13" ry="14" fill="#5E5555" transform="rotate(20 120 117)"/>` },
  fox: { back: b => `<path d="M150 162 C196 164 204 118 182 96 C176 118 164 136 144 146Z" fill="${b}" ${PST}/><path d="M182 96 C196 110 198 128 192 140 C186 126 184 112 182 96Z" fill="#FFF4E8"/><path d="M52 98 L50 44 L92 68Z" fill="${b}" ${PST}/><path d="M148 98 L150 44 L108 68Z" fill="${b}" ${PST}/><path d="M60 86 L58 58 L80 72Z M140 86 L142 58 L120 72Z" fill="#FFF4E8"/>`, front: (b, be) => bellyEl(be) },
  penguin: { front: () => `<ellipse cx="100" cy="128" rx="54" ry="46" fill="#fff"/>`, after: () => `<path d="M93 124 L107 124 L100 132Z" fill="#FF9600" stroke="${CO}" stroke-width="2" stroke-linejoin="round"/>` },
  axolotl: { back: () => [[-30, 34, 90], [0, 26, 108], [30, 34, 126]].map(([r, x, y]) => `<ellipse cx="${x}" cy="${y}" rx="15" ry="6" fill="#F58FB1" ${PST} transform="rotate(${r} ${x} ${y})"/><ellipse cx="${200 - x}" cy="${y}" rx="15" ry="6" fill="#F58FB1" ${PST} transform="rotate(${-r} ${200 - x} ${y})"/>`).join(""), front: (b, be) => bellyEl(be) },
  sheep: { back: () => `<ellipse cx="36" cy="104" rx="17" ry="8" fill="#F1DCC0" ${PST} transform="rotate(20 36 104)"/><ellipse cx="164" cy="104" rx="17" ry="8" fill="#F1DCC0" ${PST} transform="rotate(-20 164 104)"/>`, front: (b, be) => bellyEl(be) + [60, 74, 88, 100, 112, 126, 140].map((x, i) => `<circle cx="${x}" cy="${i % 2 ? 70 : 76}" r="14" fill="#fff" stroke="${CO}" stroke-width="3"/>`).join("") },
  hedgehog: { back: () => { let d = ""; for (let i = 0; i < 11; i++) { const a = Math.PI * (.95 + i * .11), p = (r1, r2, aa) => `${(100 + r1 * Math.cos(aa)).toFixed(1)} ${(128 + r2 * Math.sin(aa)).toFixed(1)}`; d += `${i ? "L" : "M"}${p(76, 70, a)} L${p(96, 90, a + .05)} L${p(76, 70, a + .1)} `; } return `<path d="${d}Z" fill="#A9825E" ${PST}/>`; }, front: (b, be) => bellyEl(be), after: () => `<ellipse cx="100" cy="124" rx="4.5" ry="3.5" fill="${CO}"/>` },
  koala: { back: b => `<circle cx="48" cy="84" r="26" fill="${b}" ${PST}/><circle cx="152" cy="84" r="26" fill="${b}" ${PST}/><circle cx="50" cy="86" r="14" fill="#fff"/><circle cx="150" cy="86" r="14" fill="#fff"/>`, front: (b, be) => bellyEl(be), after: () => `<ellipse cx="100" cy="124" rx="8" ry="6" fill="#5E5555"/>` },
  bat: { back: b => `<path d="M40 120 Q6 96 0 132 Q14 128 18 142 Q26 132 36 146Z M160 120 Q194 96 200 132 Q186 128 182 142 Q174 132 164 146Z" fill="#7E70A8" ${PST}/><path d="M56 94 L46 40 L92 70Z" fill="${b}" ${PST}/><path d="M144 94 L154 40 L108 70Z" fill="${b}" ${PST}/><path d="M60 82 L55 54 L80 70Z M140 82 L145 54 L120 70Z" fill="#F7C6D4"/>`, front: (b, be) => bellyEl(be), after: () => `<path d="M94 133 l2 5 l2 -5 M102 133 l2 5 l2 -5" fill="#fff" stroke="${CO}" stroke-width="1.5" stroke-linejoin="round"/>` },
  octopus: { back: b => [34, 58, 82, 118, 142, 166].map((x, i) => `<path d="M${x} 158 q${i < 3 ? -14 : 14} 16 ${i < 3 ? -4 : 4} 30 q${i < 3 ? 10 : -10} 2 ${i < 3 ? 8 : -8} -10" fill="none" stroke="${CO}" stroke-width="15" stroke-linecap="round"/><path d="M${x} 158 q${i < 3 ? -14 : 14} 16 ${i < 3 ? -4 : 4} 30 q${i < 3 ? 10 : -10} 2 ${i < 3 ? 8 : -8} -10" fill="none" stroke="${b}" stroke-width="9" stroke-linecap="round"/>`).join(""), front: (b, be) => `<circle cx="70" cy="86" r="5" fill="#fff" opacity=".6"/><circle cx="82" cy="76" r="3" fill="#fff" opacity=".6"/>` + bellyEl(be, 16) },
  jelly: { back: () => [52, 74, 100, 126, 148].map((x, i) => `<path d="M${x} 168 q${i % 2 ? 8 : -8} 12 0 22 q${i % 2 ? -8 : 8} 8 0 18" fill="none" stroke="#B9A6F2" stroke-width="5" stroke-linecap="round"/>`).join(""), front: () => `<path d="M48 100 Q100 70 152 100" stroke="#fff" stroke-width="6" fill="none" opacity=".6" stroke-linecap="round"/>${[[64, 150], [100, 160], [136, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff" opacity=".7"/>`).join("")}` },
  unicorn: { back: b => `<path d="M92 66 L100 20 L108 66Z" fill="#FFC800" ${PST}/><path d="M95 52 L105 48 M96 40 L104 36" stroke="#E5A000" stroke-width="2"/><path d="M60 80 Q52 58 68 64Z M140 80 Q148 58 132 64Z" fill="${b}" ${PST}/>`, front: (b, be) => bellyEl(be) + `<path d="M56 108 l2 4 l4 .5 l-3 3 l1 4 l-4 -2 l-4 2 l1 -4 l-3 -3 l4 -.5Z M144 108 l2 4 l4 .5 l-3 3 l1 4 l-4 -2 l-4 2 l1 -4 l-3 -3 l4 -.5Z" fill="#CE82FF"/><path d="M70 70 Q100 56 130 70" stroke="#FF86D0" stroke-width="4" fill="none" opacity=".7"/>` },
  fawn: { back: b => `<ellipse cx="50" cy="86" rx="20" ry="9" fill="${b}" ${PST} transform="rotate(-28 50 86)"/><ellipse cx="150" cy="86" rx="20" ry="9" fill="${b}" ${PST} transform="rotate(28 150 86)"/><ellipse cx="50" cy="86" rx="11" ry="4" fill="#FFD1DA" transform="rotate(-28 50 86)"/><ellipse cx="150" cy="86" rx="11" ry="4" fill="#FFD1DA" transform="rotate(28 150 86)"/><path d="M84 68 Q78 46 70 30 M77 50 Q66 46 58 38 M116 68 Q122 46 130 30 M123 50 Q134 46 142 38" stroke="${CO}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M84 68 Q78 46 70 30 M77 50 Q66 46 58 38 M116 68 Q122 46 130 30 M123 50 Q134 46 142 38" stroke="#F3E1C8" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="70" cy="30" r="5" fill="#FF86D0"/><circle cx="130" cy="30" r="5" fill="#FF86D0"/>`,
    front: (b, be) => bellyEl(be) + [[60, 100, 4.5], [71, 89, 3.2], [140, 100, 4.5], [129, 89, 3.2], [52, 114, 3], [148, 114, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".85"/>`).join("") },
  pangolin: { back: b => `<circle cx="62" cy="80" r="9" fill="${b}" ${PST}/><circle cx="138" cy="80" r="9" fill="${b}" ${PST}/><path d="M156 162 Q198 164 198 128 Q196 102 172 108 Q186 118 184 134 Q180 150 154 146Z" fill="${b}" ${PST}/><path d="M166 158 q6 -6 0 -12 M178 154 q6 -6 2 -14 M188 142 q4 -8 -2 -14" stroke="#8A5A3C" stroke-width="2.5" fill="none"/>`,
    front: (b, be) => bellyEl(be, 22) + [[72, 84, 100, 116, 128], [62, 76, 90, 110, 124, 138]].map((row, j) => row.map((x, i) => { const y = j ? 88 : (i === 0 || i === 4 ? 78 : 74); return `<path d="M${x - 9} ${y} Q${x} ${y + 15} ${x + 9} ${y}Z" fill="#8A5A3C" stroke="${CO}" stroke-width="2"/>`; }).join("")).join("") },
  firefly: { back: () => `<circle cx="150" cy="166" r="34" fill="rgba(255,240,120,.45)"/><circle cx="150" cy="166" r="20" fill="#FFF07A" ${PST}/><ellipse cx="46" cy="100" rx="22" ry="12" fill="rgba(230,245,255,.85)" ${PST} transform="rotate(-24 46 100)"/><ellipse cx="154" cy="100" rx="22" ry="12" fill="rgba(230,245,255,.85)" ${PST} transform="rotate(24 154 100)"/><path d="M88 66 Q82 42 72 38 M112 66 Q118 42 128 38" stroke="${CO}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="72" cy="38" r="5" fill="#FFC800" ${PST}/><circle cx="128" cy="38" r="5" fill="#FFC800" ${PST}/>`,
    front: () => clipBody(`<path d="M0 0 H200 V92 Q100 72 0 92Z" fill="#4B4B4B"/>`) + bellyEl("#FFFBE0") },
  shark: { back: b => `<path d="M166 150 Q196 128 198 104 Q186 128 170 132Z" fill="${b}" ${PST}/><path d="M166 150 Q194 160 204 178 Q184 170 164 164Z" fill="${b}" ${PST}/><path d="M82 70 Q96 14 128 30 Q112 44 118 66Z" fill="${b}" ${PST}/>`,
    front: () => `<path d="M40 148 Q100 196 160 148 Q150 176 100 178 Q50 176 40 148Z" fill="#fff" opacity=".95"/><path d="M44 112 q-5 6 0 12 M52 108 q-5 7 0 14 M156 112 q5 6 0 12 M148 108 q5 7 0 14" stroke="#5C8DC2" stroke-width="2.5" fill="none" stroke-linecap="round"/>` },
  tardigrade: { back: b => [[34, 132], [166, 132], [44, 160], [156, 160]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="9" fill="${b}" ${PST}/><path d="M${x + (x < 100 ? -12 : 8)} ${y + 2} l4 4 M${x + (x < 100 ? -9 : 5)} ${y + 6} l3 4" stroke="${CO}" stroke-width="2" stroke-linecap="round"/>`).join(""),
    front: () => `<path d="M38 102 Q100 86 162 102 M32 138 Q100 124 168 138 M40 164 Q100 152 160 164" stroke="#B8A88E" stroke-width="3" fill="none"/>`, after: () => `<ellipse cx="100" cy="134" rx="6" ry="4" fill="#E88A9A" stroke="${CO}" stroke-width="2"/>` },
  owl: { back: b => `<path d="M52 92 L46 46 L84 70Z" fill="${b}" ${PST}/><path d="M148 92 L154 46 L116 70Z" fill="${b}" ${PST}/><path d="M56 80 L52 56 L72 70Z M144 80 L148 56 L128 70Z" fill="#C9C2EE"/>`,
    front: (b, be) => `<circle cx="80" cy="116" r="18" fill="#FFF6D6" stroke="#C9C2EE" stroke-width="3"/><circle cx="120" cy="116" r="18" fill="#FFF6D6" stroke="#C9C2EE" stroke-width="3"/>` + [[82, 150], [100, 158], [118, 150], [91, 166], [109, 166]].map(([x, y]) => `<path d="M${x - 5} ${y} l5 5 l5 -5" stroke="#B9AEE6" stroke-width="2.5" fill="none" stroke-linecap="round"/>`).join(""),
    after: () => `<path d="M94 124 L106 124 L100 134Z" fill="#FF9600" stroke="${CO}" stroke-width="2" stroke-linejoin="round"/>` }
};
const MOCHI_CHAR = CHAR.chiikawa;
// Halo, sparkles and rarity aura for the active pal (evolution stage 3 = golden halo; legendary = gold glow; mythic = rainbow ring)
function palAura(P, st) {
  let s = "";
  if (P.rar === "myth") s += `<g class="pring">${["#FF4B4B", "#FF9600", "#FFC800", "#58CC02", "#1CB0F6", "#CE82FF"].map((c, i) => `<circle cx="100" cy="118" r="88" fill="none" stroke="${c}" stroke-width="5" stroke-dasharray="46 507" stroke-dashoffset="${-i * 92}" opacity=".75"/>`).join("")}</g>`;
  else if (P.rar === "legend") s += `<circle cx="100" cy="118" r="86" fill="#FFE27A" opacity=".35"/><g class="pring"><circle cx="100" cy="118" r="88" fill="none" stroke="#FFC800" stroke-width="3" stroke-dasharray="6 14"/></g>`;
  if (st >= 3) s += `<circle cx="100" cy="118" r="80" fill="#FFF1C5" opacity=".7"/><circle cx="100" cy="118" r="80" fill="none" stroke="#FFC800" stroke-width="3" stroke-dasharray="4 10"/>`;
  return s;
}
function palMarks(st) {
  let s = "";
  if (st >= 2) s += `<path d="M146 112 l2 4 l4 .5 l-3 3 l1 4 l-4 -2 l-4 2 l1 -4 l-3 -3 l4 -.5Z" fill="#FFC800" stroke="${CO}" stroke-width="1"/>`;
  if (st >= 3) s += `<g class="twinkle">${spark4(28, 72, 8, "#FFC800")}${spark4(174, 56, 7, "#FFC800")}</g>`;
  return s;
}
// The player's character ("chiikawa" key) now draws whichever Study Pal is active
CHAR.chiikawa = {
  get name() { return palName(); },
  get color() { return activePal().id === "mochi" ? MOCHI_CHAR.color : activePal().body; },
  back() { const P = activePal(), st = S && S.pals && S.pals[P.id] ? S.pals[P.id].stage : 1, A = PAL_ART[P.sp];
    return palAura(P, st) + (P.id === "mochi" ? MOCHI_CHAR.back() : A && A.back ? A.back(P.body) : ""); },
  front() { const P = activePal(), A = PAL_ART[P.sp]; return P.id === "mochi" ? "" : A && A.front ? A.front(P.body, P.belly) : ""; },
  face(m) { return MOCHI_CHAR.face(m); },
  after(m) { const P = activePal(), A = PAL_ART[P.sp], st = S && S.pals && S.pals[P.id] ? S.pals[P.id].stage : 1; return (A && A.after && m !== "sick" ? A.after(m) : "") + palMarks(st); }
};
// Draw any pal (collection cards, adverts), independent of which one is active
function palFig(id, mood = "happy", opts = {}) {
  const keep = S && S.activePal, had = S && S.pals && S.pals[id];
  if (!S) return figure("chiikawa", mood, {});
  S.pals = S.pals || {}; if (!had) S.pals[id] = Object.assign(newPal(), { stage: opts.stage || 1 });
  S.activePal = id;
  const svg = figure("chiikawa", mood, opts.eq || {});
  S.activePal = keep; if (!had) delete S.pals[id];
  return svg;
}

/* ----- Care: energy and happiness drift down over time; studying earns XP ----- */
function palTick() {
  if (!S) return;
  S.pals = S.pals || {}; if (!S.pals.mochi) S.pals.mochi = newPal(); if (!S.activePal || !S.pals[S.activePal]) S.activePal = "mochi";
  const p = palState(S.activePal), now = Date.now(), h = Math.min(72, (now - (p.t || now)) / 3600e3);
  if (h > .05) {
    p.energy = Math.max(5, p.energy - h * 1.2 * (2 - perk("energy")));
    p.happy = Math.max(5, p.happy - h * .3 * (2 - perk("calm")));
    p.t = now;
  }
}
function palMood() {
  if (!S) return "happy";
  const p = palState(activePalId()), h = new Date().getHours();
  if (S.ill) return "sick";
  if (p.energy < 25) return "hungry";
  if (p.happy < 25) return "lonely";
  if (h >= 22 || h < 6 || p.energy < 42) return "sleepy";
  if (p.happy >= 75 && p.energy >= 60) return "overjoyed";
  return "happy";
}
const MOOD_FACE = { sick: "sick", hungry: "cry", lonely: "cry", sleepy: "sleepy", overjoyed: "sparkle", happy: "happy" };
const MOOD_INFO = { sick: ["🤒", "Sick"], hungry: ["🍙", "Hungry"], lonely: ["🥺", "Lonely"], sleepy: ["😴", "Sleepy"], overjoyed: ["🤩", "Overjoyed"], happy: ["😊", "Happy"] };
const MOOD_LINE = { hungry: "My tummy is rumbling... 🍙 Hungry pals learn slower (my brain needs glucose!). Can we eat?", lonely: "Uu... play with me? 🥺 A quick Term Match would cheer me up!", sleepy: "Yawn... I'm a bit sleepy. 😴" };
function palGain(ev) {
  if (!S || !(ev.ans > 0)) return;
  const p = palState(activePalId()), before = palLevel(p.xp);
  const xp = Math.round((5 + 2 * Math.min(25, ev.cor || 0)) * perk("xp") * (p.energy < 25 ? .5 : 1));
  p.xp += xp; p.energy = Math.max(5, p.energy - 6); p.happy = Math.min(100, p.happy + 3);
  const after = palLevel(p.xp);
  setTimeout(() => toast(after > before ? `⭐ ${palName()} reached level ${after}!${evoReady(activePalId()) ? " Evolution is ready! ✨" : ""}` : `+${xp} XP for ${palName()}${p.energy < 25 ? " (hungry: half XP)" : ""}`), 2600);
}
function evoNeed(id) { const p = palState(id), P = palById(id); return p.stage >= 3 ? null : EVO[P.rar][p.stage - 1]; }
const evoReady = id => { const n = evoNeed(id); return !!n && palLevel(palState(id).xp) >= n[0]; };
function evolve(id) {
  const n = evoNeed(id), p = palState(id); if (!n || palLevel(p.xp) < n[0] || S.coins < n[1]) return;
  S.coins -= n[1]; p.stage += 1; save(true);
  giftCeremony(palById(id).rar === "myth" ? "myth" : "legend", () => { SFX.fanfare(); confetti(200); yaha(`${STAGES[p.stage]}!`); toast(`✨ ${palById(id).name} evolved into a ${STAGES[p.stage]}!`); renderMap(); });
}

/* ----- 🍱 Food with nutrition cards (approximate values per typical serving) ----- */
const FOODS = [
  { id: "apple", e: "🍎", name: "Apple", price: 4, en: 14, hp: 4, xp: 2, r: "g", n: [95, 25, .5, .3, 19, 4.4], note: "Fibre adds bulk, so food moves easily along the gut by peristalsis." },
  { id: "banana", e: "🍌", name: "Banana", price: 4, en: 18, hp: 4, xp: 2, r: "g", n: [105, 27, 1.3, .4, 14, 3.1], note: "Rich in carbohydrate and potassium: quick energy for respiration." },
  { id: "milk", e: "🥛", name: "Low-fat milk", price: 5, en: 14, hp: 5, xp: 3, r: "g", n: [110, 12, 8, 2.5, 12, 0], note: "Calcium and protein for strong bones and teeth. The sugar here is lactose." },
  { id: "salad", e: "🥗", name: "Egg salad", price: 8, en: 16, hp: 6, xp: 4, r: "g", n: [180, 10, 10, 11, 4, 4], note: "Vitamins, minerals and fibre from vegetables, plus protein from the egg." },
  { id: "rice", e: "🍚", name: "Rice with vegetables", price: 10, en: 34, hp: 6, xp: 4, r: "g", n: [300, 60, 7, 3, 2, 3], note: "Starch is digested to glucose: slow, steady energy for the brain." },
  { id: "fish", e: "🐟", name: "Steamed fish with rice", price: 14, en: 40, hp: 8, xp: 6, r: "g", n: [420, 55, 30, 8, 2, 2], note: "Lean protein for growth and repair; fish oils are good unsaturated fats." },
  { id: "congee", e: "🥣", name: "Fish congee", price: 9, en: 26, hp: 6, xp: 4, r: "g", n: [250, 40, 14, 4, 1, 1], note: "Easy to digest and full of water: great when you're unwell." },
  { id: "egg", e: "🍳", name: "Fried egg on toast", price: 8, en: 24, hp: 7, xp: 4, r: "y", n: [260, 26, 11, 13, 3, 2], note: "Good protein, but frying adds fat. Boiling an egg is lighter." },
  { id: "siumai", e: "🥟", name: "Siu mai (4 pieces)", price: 10, en: 22, hp: 10, xp: 3, r: "y", n: [200, 12, 10, 12, 1, .5], note: "Tasty protein, but quite fatty and salty. Too much salt can raise blood pressure." },
  { id: "fishball", e: "🍢", name: "Curry fish balls", price: 9, en: 18, hp: 12, xp: 2, r: "y", n: [200, 18, 10, 10, 3, .5], note: "A Hong Kong favourite! Lots of salt and some fat, so not every day." },
  { id: "noodles", e: "🍜", name: "Wonton noodles", price: 15, en: 36, hp: 12, xp: 4, r: "y", n: [400, 55, 20, 10, 2, 2], note: "Balanced carbohydrate and protein, but the soup is very salty." },
  { id: "bun", e: "🍞", name: "Pineapple bun", price: 8, en: 20, hp: 14, xp: 2, r: "r", n: [300, 45, 6, 11, 15, 1], note: "Sugar and fat in the crunchy top. Yummy, but a treat." },
  { id: "tart", e: "🥧", name: "Egg tart", price: 8, en: 14, hp: 16, xp: 2, r: "r", n: [200, 20, 4, 12, 10, .3], note: "Buttery pastry is high in saturated fat. A sometimes-snack!" },
  { id: "milktea", e: "☕", name: "HK milk tea", price: 7, en: 10, hp: 14, xp: 1, r: "r", n: [150, 22, 3, 5, 20, 0], note: "Caffeine keeps you awake; added sugar gives a quick spike, then a dip." },
  { id: "boba", e: "🧋", name: "Bubble tea", price: 12, en: 14, hp: 22, xp: 1, r: "r", n: [350, 70, 2, 7, 40, 0], note: "About 10 teaspoons of sugar in one cup! Fun, but a big treat." }
];
const FOOD_R = { g: ["Everyday", "#58CC02"], y: ["Sometimes", "#FFC800"], r: ["Treat", "#FF4B4B"] };
const foodPrice = f => Math.max(1, Math.round(f.price / perk("food")));
function openFeed() {
  const P = activePal();
  openModal(`<span class="kicker">🍱 Feed ${esc(P.name)}</span><h2>What's for ${new Date().getHours() < 11 ? "breakfast" : new Date().getHours() < 16 ? "lunch" : "dinner"}?</h2>
    <p class="small muted" style="margin:0">❤️ ${esc(P.name)}'s favourite: <b>${esc(FOODS.find(f => f.id === P.fav).name)}</b> (double happiness). Tap 🔍 for the nutrition card. 3 treats in one day = sugar crash!</p>
    <div class="foodgrid">${FOODS.map(f => `<div class="food"><button class="fpic" data-feed="${f.id}" aria-label="Feed ${esc(f.name)} for ${foodPrice(f)} chestnuts" ${S.coins < foodPrice(f) ? "disabled" : ""}><span class="fe">${f.e}</span><b class="small">${esc(f.name)}</b><span class="small"><i class="rdot" style="background:${FOOD_R[f.r][1]}"></i>${FOOD_R[f.r][0]}</span><span class="pill coinpill">🌰 ${foodPrice(f)}</span></button><button class="fnut" data-nut="${f.id}" aria-label="Nutrition card for ${esc(f.name)}">🔍</button></div>`).join("")}</div>`, { wide: true });
  $modal.querySelectorAll("[data-feed]").forEach(b => b.onclick = () => feed(b.dataset.feed));
  $modal.querySelectorAll("[data-nut]").forEach(b => b.onclick = () => { SFX.tap(); nutritionCard(b.dataset.nut); });
}
function nutritionCard(id) {
  const f = FOODS.find(x => x.id === id), [kc, c, pr, fa, su, fi] = f.n, bar = (v, max, col) => `<div class="nbar"><i style="width:${Math.min(100, Math.round(100 * v / max))}%;background:${col}"></i></div>`;
  openModal(`<span class="kicker">🔍 Nutrition card</span><h2>${f.e} ${esc(f.name)}</h2>
    <span class="pill" style="background:${FOOD_R[f.r][1]};color:#fff">${FOOD_R[f.r][0]}</span>
    <table class="ntab"><tbody>
      <tr><td>Energy</td><td><b>${kc} kcal</b></td><td>${bar(kc, 600, "#FF9600")}</td></tr>
      <tr><td>Carbohydrate</td><td><b>${c} g</b></td><td>${bar(c, 80, "#FFC800")}</td></tr>
      <tr><td>&nbsp;· of which sugar</td><td><b>${su} g</b></td><td>${bar(su, 40, "#FF4B4B")}</td></tr>
      <tr><td>Protein</td><td><b>${pr} g</b></td><td>${bar(pr, 35, "#1CB0F6")}</td></tr>
      <tr><td>Fat</td><td><b>${fa} g</b></td><td>${bar(fa, 25, "#CE82FF")}</td></tr>
      <tr><td>Dietary fibre</td><td><b>${fi} g</b></td><td>${bar(fi, 8, "#58CC02")}</td></tr></tbody></table>
    <p class="small muted" style="margin:0">Approximate values for one typical serving.</p>
    ${say("hachiware", esc(f.note), "normal", "hint")}
    <div class="row"><button class="btn big" id="nFeed" ${S.coins < foodPrice(f) ? "disabled" : ""}>Feed for 🌰 ${foodPrice(f)}</button><button class="btn plain" id="nBack">← All food</button></div>`);
  document.getElementById("nFeed").onclick = () => feed(id);
  document.getElementById("nBack").onclick = () => { SFX.tap(); openFeed(); };
}
function feed(id) {
  const f = FOODS.find(x => x.id === id), P = activePal(), p = palState(P.id), cost = foodPrice(f); if (S.coins < cost) return;
  S.coins -= cost; const fav = P.fav === id;
  p.energy = Math.min(100, p.energy + f.en); p.happy = Math.min(100, p.happy + f.hp * (fav ? 2 : 1)); p.xp += Math.round(f.xp * perk("xp")); p.meals = (p.meals || 0) + 1;
  S.treats = S.treats && S.treats.day === today() ? S.treats : { day: today(), n: 0 };
  let crash = false; if (f.r === "r") { S.treats.n += 1; if (S.treats.n === 3) { crash = true; p.energy = Math.max(5, p.energy - 15); } }
  S.stats.meals = (S.stats.meals || 0) + 1; save(true); SFX.item(); closeModal(); renderMap();
  if (crash) openModal(`<span class="kicker">🍬 Sugar crash!</span><h2>${esc(P.name)} feels wobbly...</h2>${say("chiikawa", "Too many sweet treats today... 😵 First my blood glucose shot up, then insulin brought it down fast, and now I feel tired!", "cry")}
      ${say("hachiware", "Tip: choose 🟢 everyday foods. Starchy foods release glucose slowly, so energy stays steady.", "normal", "hint")}<div class="row"><button class="btn" id="crOk">OK</button></div>`), document.getElementById("crOk").onclick = () => { SFX.tap(); closeModal(); };
  else toast(`${f.e} ${P.name} ate the ${f.name.toLowerCase()}!${fav ? " ❤️ Favourite!" : ""} Energy ${Math.round(p.energy)}`);
}

/* ----- 🃏 Play: Term Match (tap a term, then its meaning) ----- */
function playMatch() {
  const rooms = ROOMS.filter(r => S.completed_rooms.includes(r.id) || r.id === S.current_room);
  const pairs = shuffle(rooms.flatMap(r => r.terms.filter(([t, m]) => m.length < 70))).slice(0, 4);
  const right = shuffle(pairs.map((_, i) => i));
  let sel = null, done = 0, miss = 0;
  const box = openModal(`<span class="kicker">🃏 Term Match with ${esc(palName())}</span><h2>Match each term to its meaning</h2>
    <div class="tmatch"><div class="tcol">${pairs.map(([t], i) => `<button class="tm" data-t="${i}">${esc(t)}</button>`).join("")}</div><div class="tcol">${right.map(i => `<button class="tm m" data-m="${i}">${esc(pairs[i][1])}</button>`).join("")}</div></div><div id="tmFb"></div>`, { wide: true });
  box.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { SFX.tap(); box.querySelectorAll("[data-t]").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); sel = b.dataset.t; });
  box.querySelectorAll("[data-m]").forEach(b => b.onclick = () => {
    if (sel == null) { toast("Tap a term first 👈"); return; }
    if (b.dataset.m === sel) {
      SFX.right(); b.disabled = true; b.classList.add("ok"); const t = box.querySelector(`[data-t="${sel}"]`); t.disabled = true; t.classList.add("ok"); t.classList.remove("sel"); sel = null; done++;
      if (done === pairs.length) {
        const p = palState(activePalId()), first = S.lastPlay !== today(); S.lastPlay = today();
        p.happy = Math.min(100, p.happy + (miss ? 10 : 18)); p.xp += Math.round(8 * perk("xp")); const coins = first ? 5 : 0; S.coins += coins; S.stats.matches = (S.stats.matches || 0) + 1; save(true);
        confetti(80); document.getElementById("tmFb").innerHTML = `${say("chiikawa", `Yay! That was fun! 🥹 Happiness +${miss ? 10 : 18}${coins ? ", +5 🌰 (first game today)" : ""}`, "sparkle")}<div class="row"><button class="btn" id="tmAgain">🔁 Again</button><button class="btn plain" id="tmOk">Done</button></div>`;
        document.getElementById("tmAgain").onclick = () => { SFX.tap(); playMatch(); }; document.getElementById("tmOk").onclick = () => { SFX.tap(); closeModal(); renderMap(); };
      }
    } else { SFX.wrong(); miss++; b.classList.add("shake"); setTimeout(() => b.classList.remove("shake"), 400); }
  });
}

/* ----- Unlocks: legendary pals arrive by themselves; others are adopted on the Pals page ----- */
let palQueue = [];
function checkPals() {
  if (!S) return;
  PALS.forEach(P => { if (P.rar === "legend" && !S.pals[P.id] && condMet(P)) { S.pals[P.id] = newPal(); palQueue.push(P); } });
  if (palQueue.length) { save(); setTimeout(showPalUnlock, 2600); }
}
function adoptPal(id) {
  const P = palById(id); if (S.pals[id] || !condMet(P) || S.coins < P.price) return;
  S.coins -= P.price; S.pals[id] = newPal(); save(true); palQueue.push(P); showPalUnlock();
}
function showPalUnlock() {
  if (!palQueue.length) return;
  if ($modal.innerHTML && !$modal.querySelector(".foodgrid") || R || RU || document.querySelector(".dressgrid")) { setTimeout(showPalUnlock, 3000); return; }
  const P = palQueue[0];
  if ((P.rar === "epic" || P.rar === "legend" || P.rar === "myth") && !P._cer && !reduced()) { P._cer = true; closeModal(); return giftCeremony(P.rar, showPalUnlock); }
  palQueue.shift(); delete P._cer; SFX.fanfare(); confetti(P.rar === "myth" || P.rar === "legend" ? 240 : 120);
  openModal(`<span class="kicker">🐾 New Study Pal!</span><h2>${esc(P.name)} joined your team!</h2>
    <div class="petreveal flipin ${P.rar === "myth" ? "epic" : P.rar}"><i class="aura" aria-hidden="true"></i>${palFig(P.id, "sparkle")}</div>
    <div class="row" style="justify-content:center">${palChips(P)}</div>
    <p style="text-align:center;margin:0">${esc(P.desc)}</p>
    <div class="row" style="justify-content:center"><button class="btn big" id="paSet">⭐ Set as my active pal</button><button class="btn plain" id="paLater">Later</button></div>`, { onClose: () => setTimeout(showPalUnlock, 400) });
  document.getElementById("paSet").onclick = () => { SFX.item(); setActivePal(P.id); closeModal(); setTimeout(showPalUnlock, 400); };
  document.getElementById("paLater").onclick = () => { SFX.tap(); closeModal(); renderMap(); setTimeout(showPalUnlock, 400); };
}
function setActivePal(id) { if (!S.pals[id]) return; palTick(); S.activePal = id; palState(id).t = Date.now(); save(true); refreshPlayer(); if (!R && !RU) renderMap(); toast(`⭐ ${palById(id).name} is your active Study Pal!`); }
const palChips = P => `<span class="pill rchip2" style="background:${PAL_RAR[P.rar][1]};border-color:${PAL_RAR[P.rar][2]}">${PAL_RAR[P.rar][0]}</span><span class="pill perk" style="background:#fff">✨ ${esc(perkLabel(P))}</span>`;

/* ----- 🐾 Pals page: active pal care panel + collection ----- */
const palsSubnav = on => `<div class="subnav" role="tablist">${[["pals", "🐾", "Study Pals"], ["dress", "👗", "Dress up"], ["pets", "🦜", "Pets"]].map(([id, ic, nm]) => `<button role="tab" data-go="${id}" aria-selected="${on === id}"><span aria-hidden="true">${ic}</span>${nm}</button>`).join("")}</div>`;
const meter = (v, cls, label) => `<div class="meter ${cls}" aria-label="${label} ${Math.round(v)} of 100"><span>${label}</span><div class="tprog"><i style="width:${Math.round(v)}%"></i></div><b>${Math.round(v)}</b></div>`;
function palPanelHtml() {
  const P = activePal(), p = palState(P.id), lv = palLevel(p.xp), mood = palMood(), [mi, ml] = MOOD_INFO[mood], n = evoNeed(P.id);
  const xpPc = Math.round(100 * (p.xp - lvXP(lv)) / (lvXP(lv + 1) - lvXP(lv)));
  return `<section class="card palpanel ${P.rar}"><div class="palhero"><div class="palbig ${frameCls()}">${figure("chiikawa", MOOD_FACE[mood], S.equip)}</div>
      <div class="palinfo"><div class="row" style="gap:6px"><h2 style="margin:0">${esc(P.name)}</h2>${palChips(P)}</div>
        <div class="small"><b>Lv ${lv}</b> · ${STAGES[p.stage]} · <span class="moodchip">${mi} ${ml}</span></div>
        <div class="meter xp"><span>XP</span><div class="tprog"><i style="width:${xpPc}%"></i></div><b>${p.xp}</b></div>
        ${meter(p.energy, "en", "⚡ Energy")}${meter(p.happy, "hp", "❤️ Happy")}
        <p class="small muted" style="margin:0">🔬 ${esc(P.fact)}</p></div></div>
    ${MOOD_LINE[mood] ? say("chiikawa", MOOD_LINE[mood], MOOD_FACE[mood]) : ""}
    <div class="row"><button class="btn yellow" id="pFeed">🍱 Feed</button><button class="btn blue" id="pPlay">🃏 Play Term Match</button>
      ${n ? `<button class="btn ${lv >= n[0] ? "pink" : "plain"}" id="pEvo" ${lv >= n[0] && S.coins >= n[1] ? "" : "disabled"}>✨ Evolve to ${STAGES[p.stage + 1]} · Lv ${n[0]} + 🌰 ${n[1]}</button>` : `<span class="pill saved">👑 Fully evolved</span>`}
      <button class="btn plain" data-go="dress">👗 Dress up</button></div></section>`;
}
function palsHtml() {
  const own = PALS.filter(P => S.pals[P.id]).length, list = PALS.slice().sort((a, b) => PAL_ORDER[a.rar] - PAL_ORDER[b.rar]);
  return `${palsSubnav("pals")}<div class="homegrid">${palPanelHtml()}
    <section class="card palcoll"><div class="collhead"><h2 style="margin:0">Collect every Study Pal!</h2><span class="pill">${own} / ${PALS.length}</span></div>
      <div class="tprog rainbow"><i style="width:${Math.round(100 * own / PALS.length)}%"></i></div>
      <div class="palstrip" aria-hidden="true">${list.map(P => `<span class="${S.pals[P.id] ? "" : "sil"}">${palFig(P.id, "happy")}</span>`).join("")}</div>
      <div class="palgrid">${list.map(P => palCard(P)).join("")}</div>
      <p class="small muted" style="margin:0">Only your <b>active</b> pal's perk works. Common, rare and epic pals: reach the goal, then adopt with 🌰. Legendary pals come by themselves after a very hard goal. Mythic pals can only be adopted with 🌰.</p></section></div>`;
}
function palCard(P) {
  const got = !!S.pals[P.id], act = activePalId() === P.id, met = condMet(P), pc = Math.round(100 * condPct(P));
  const st = got ? S.pals[P.id] : null;
  return `<div class="palcard ${P.rar} ${got ? "own" : "locked"} ${act ? "active" : ""}">
    <div class="ppic">${got ? palFig(P.id, act ? "sparkle" : "happy", { stage: st.stage }) : `<span class="sil">${palFig(P.id, "normal")}</span><span class="plock" aria-hidden="true">🔒</span>`}</div>
    <b>${esc(P.name)}</b><span class="rchip2 small" style="background:${PAL_RAR[P.rar][1]};border-color:${PAL_RAR[P.rar][2]}">${PAL_RAR[P.rar][0]}</span>
    <span class="small muted">${got ? `Lv ${palLevel(st.xp)} · ${STAGES[st.stage]}` : P.cond ? esc(P.cond[2]) : "Adopt with chestnuts"}</span>
    ${got ? (act ? `<span class="pill saved">⭐ Active</span>` : `<button class="btn plain sm" data-usepal="${P.id}">Make active</button>`)
      : P.rar === "legend" ? `<div class="tprog"><i style="width:${pc}%"></i></div><span class="small">${Math.min(palVal(P.cond[0]), P.cond[1])} / ${P.cond[1]}</span>`
      : met ? `<button class="btn yellow sm" data-adopt="${P.id}" ${S.coins < P.price ? "disabled" : ""}>Adopt 🌰 ${P.price}</button>`
      : `<div class="tprog"><i style="width:${pc}%"></i></div><span class="small">${Math.min(palVal(P.cond[0]), P.cond[1])} / ${P.cond[1]}</span>`}
    <button class="pinfo" data-palinfo="${P.id}" aria-label="About ${esc(P.name)}">i</button></div>`;
}
function openPalInfo(id) {
  const P = palById(id), got = !!S.pals[id];
  openModal(`<span class="kicker">🐾 Study Pal</span><h2>${esc(P.name)}</h2><div class="petreveal ${P.rar === "myth" ? "epic" : P.rar}" style="width:150px;height:150px">${got ? palFig(id, "happy") : `<span class="sil">${palFig(id, "normal")}</span>`}</div>
    <div class="row" style="justify-content:center">${palChips(P)}</div><p style="margin:0">${esc(P.desc)}</p>
    <section class="jsec"><h3>🔬 Real biology</h3><p style="margin:0">${esc(P.fact)}</p></section>
    <p class="small"><b>How to get:</b> ${P.cond ? esc(P.cond[2]) + (P.price ? `, then adopt for 🌰 ${P.price}` : " (arrives by itself)") : `Adopt for 🌰 ${P.price}`} · <b>Favourite food:</b> ${esc(FOODS.find(f => f.id === P.fav).name)} · <b>Evolves at</b> Lv ${EVO[P.rar][0][0]} and Lv ${EVO[P.rar][1][0]}</p>`);
}
function wirePals() {
  wireCommon();
  const g = id => document.getElementById(id);
  if (g("pFeed")) g("pFeed").onclick = () => { SFX.tap(); openFeed(); };
  if (g("pPlay")) g("pPlay").onclick = () => { SFX.tap(); playMatch(); };
  if (g("pEvo")) g("pEvo").onclick = () => { SFX.tap(); evolve(activePalId()); };
  $app.querySelectorAll("[data-usepal]").forEach(b => b.onclick = () => setActivePal(b.dataset.usepal));
  $app.querySelectorAll("[data-adopt]").forEach(b => b.onclick = () => { SFX.tap(); adoptPal(b.dataset.adopt); });
  $app.querySelectorAll("[data-palinfo]").forEach(b => b.onclick = () => { SFX.tap(); openPalInfo(b.dataset.palinfo); });
}

/* ----- 🌟 Featured Pal advert on Home: a legendary or mythic pal you don't own yet ----- */
let featIdx = null;
function featuredHtml() {
  const list = PALS.filter(P => (P.rar === "legend" || P.rar === "myth") && !S.pals[P.id]); if (!list.length) return "";
  if (featIdx == null) featIdx = dayNum(today()) % list.length; featIdx = (featIdx + list.length) % list.length;
  const P = list[featIdx], pc = Math.round(100 * condPct(P));
  return `<section class="card featpal ${P.rar}"><div class="fpfig">${palFig(P.id, "sparkle", { stage: 3 })}</div>
    <div class="fptext"><span class="kicker" style="padding:0">🌟 Featured ${P.rar === "myth" ? "Mythic" : "Legendary"} Pal</span><h3 style="margin:0">${esc(P.name)}</h3>
      <p class="small" style="margin:0">${esc(P.desc)}</p><span class="pill perk" style="background:#fff">✨ ${esc(perkLabel(P))}</span>
      <div class="tprog"><i style="width:${pc}%"></i></div>
      <div class="row" style="gap:6px"><button class="btn sm fparr" id="fpPrev" aria-label="Previous pal">◀</button><button class="btn ${P.rar === "myth" ? "pink" : "yellow"} sm" id="fpGo">${P.rar === "myth" ? `🌰 ${P.price} ADOPT` : esc(P.cond[2]).toUpperCase()}</button><button class="btn sm fparr" id="fpNext" aria-label="Next pal">▶</button></div></div></section>`;
}
function wireFeatured() {
  const g = id => document.getElementById(id);
  if (g("fpPrev")) g("fpPrev").onclick = () => { SFX.tap(); featIdx--; renderMap(); };
  if (g("fpNext")) g("fpNext").onclick = () => { SFX.tap(); featIdx++; renderMap(); };
  if (g("fpGo")) g("fpGo").onclick = () => { SFX.tap(); goTab("pals"); };
}
