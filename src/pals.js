
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
  calm: v => `Happiness drops ${v >= 1 ? "never" : "half as fast"}`, energy: v => `+${Math.round(v * 100)}% happiness from pats and care`, notebook: v => `+${Math.round(v * 100)}% Mistake Notebook chestnuts`,
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
  P_("chiro", "Chiro", "bat", "#A79BC9", "#EDE8FA", "epic", 800, ["sims", 5, "Try 5 Lab simulations"], ["xp", .1], "banana", "A night-time bat who 'sees' with sound.", "Bats use echolocation: they make high-pitched calls and listen for the echoes. Hong Kong has over 20 bat species."),
  P_("tako", "Tako", "octopus", "#FF9AA2", "#FFE1E4", "epic", 850, ["correct", 600, "Answer 600 questions right"], ["coins", .08], "fish", "A clever octopus who solves puzzles with all eight arms.", "An octopus has three hearts and blue blood: it carries oxygen with haemocyanin, which contains copper."),
  P_("kurage", "Kurage", "jelly", "#D9CCFF", "#F2EDFF", "epic", 900, ["missions", 10, "Complete 10 daily missions"], ["notebook", .3], "fish", "A dreamy jellyfish who drifts through revision.", "Jellyfish have no brain, heart or blood: their body is so thin that oxygen simply diffuses in."),
  P_("nova", "Nova", "unicorn", "#F4EEFF", "#FFFFFF", "legend", 0, ["days", 60, "Play on 60 different days"], ["xp", .12], "apple", "A legendary star-unicorn that only visits the most devoted scientists.", "Unicorns aren't real, but the narwhal's 'horn' is: it's a long tooth with millions of nerve endings."),
  P_("petal", "Petal", "fawn", "#E9B98E", "#FFF3E6", "legend", 0, ["topics", 10, "Clear 10 whole topics"], ["coins", .1], "salad", "A legendary blossom fawn who grows a little every day.", "Deer antlers are bone that falls off and regrows every year, one of the fastest-growing tissues in any animal."),
  P_("riccio", "Riccio", "pangolin", "#C98B6B", "#FBEFE6", "legend", 0, ["streak", 30, "Reach a 30-day streak"], ["xp", .1], "egg", "A legendary Hong Kong pangolin who rolls into a ball when exams get scary.", "The Chinese pangolin lives wild in Hong Kong and is critically endangered. Its scales are made of keratin."),
  P_("hikari", "Hikari", "firefly", "#FFF3B0", "#FFFBE0", "legend", 0, ["correct", 1500, "Answer 1,500 questions right"], ["xp", .1], "banana", "A legendary firefly whose tail glows brighter with every right answer.", "Fireflies glow by bioluminescence: an enzyme (luciferase) uses ATP to make light with almost no heat."),
  P_("mito", "Mito", "mito", "#FFB066", "#FFE6C7", "legend", 0, null, ["coins", .1], "rice", "A legendary mitochondrion pal who powers every study session. Found only in the Lucky Capsule.", "Mitochondria release energy from glucose by aerobic respiration, making most of the cell's ATP.", { cap: true }),
  P_("chloe", "Chloe", "chloro", "#A6E07A", "#E6F8D4", "legend", 0, null, ["xp", .1], "salad", "A legendary chloroplast pal who sunbathes between lessons. Found only in the Lucky Capsule.", "Chloroplasts trap light energy with chlorophyll and use it to make glucose from CO\u2082 and water.", { cap: true }),
  P_("helix", "Helix", "helix", "#CDB8FF", "#F2ECFF", "myth", 0, null, ["coins", .12], "fish", "A mythic DNA pal whose antenna is a real double helix. The rarest prize in the Lucky Capsule.", "DNA is a double helix of two antiparallel strands joined by complementary base pairs (A\u2013T, C\u2013G).", { cap: true }),
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
const condPct = P => P.cap ? 0 : !P.cond ? (P.price ? Math.min(1, S.coins / P.price) : 1) : Math.min(1, palVal(P.cond[0]) / P.cond[1]);

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
  mito: { back: b => `<circle cx="62" cy="78" r="11" fill="${b}" ${PST}/><circle cx="138" cy="78" r="11" fill="${b}" ${PST}/>`,
    front: (b, be) => bellyEl(be, 18) + clipBody(`<path d="M20 146 Q32 134 44 146 T68 146 T92 146 T116 146 T140 146 T164 146 T188 146" stroke="#E07B1A" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M20 164 Q32 152 44 164 T68 164 T92 164 T116 164 T140 164 T164 164 T188 164" stroke="#E07B1A" stroke-width="4.5" fill="none" stroke-linecap="round"/>`) },
  chloro: { back: b => `<circle cx="64" cy="78" r="11" fill="${b}" ${PST}/><circle cx="136" cy="78" r="11" fill="${b}" ${PST}/><path d="M100 64 C100 50 100 44 102 36" stroke="#3E8E1E" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M102 40 C88 26 74 30 72 38 C84 46 96 44 102 40Z" fill="#7CCB4E" ${PST}/><path d="M102 40 C114 24 130 28 132 36 C120 44 108 44 102 40Z" fill="#9BE15A" ${PST}/>`,
    front: (b, be) => bellyEl(be) + [[78, 150], [100, 156], [122, 150]].map(([x, y]) => [0, 1, 2].map(i => `<ellipse cx="${x}" cy="${y - 5 + i * 5}" rx="8" ry="2.4" fill="#3E8E1E"/>`).join("")).join("") },
  helix: { back: () => { let d1 = "", d2 = "", rungs = ""; for (let i = 0; i <= 12; i++) { const y = 64 - i * 4, x1 = 100 + 10 * Math.sin(i * .7), x2 = 100 - 10 * Math.sin(i * .7); d1 += (i ? "L" : "M") + x1.toFixed(1) + " " + y; d2 += (i ? "L" : "M") + x2.toFixed(1) + " " + y; if (i % 2) rungs += `<path d="M${x1.toFixed(1)} ${y} L${x2.toFixed(1)} ${y}" stroke="#FFD84D" stroke-width="2.5"/>`; }
      return `${rungs}<path d="${d1}" stroke="#7C6BDB" stroke-width="4" fill="none" stroke-linecap="round"/><path d="${d2}" stroke="#FF86D0" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="100" cy="14" r="7" fill="#FFF3B0" ${PST}/><circle cx="62" cy="80" r="10" fill="#CDB8FF" ${PST}/><circle cx="138" cy="80" r="10" fill="#CDB8FF" ${PST}/>`; },
    front: (b, be) => bellyEl(be) + `<path d="M84 142 Q92 152 100 142 Q108 132 116 142 M84 152 Q92 162 100 152 Q108 142 116 152" stroke="#B9A6F2" stroke-width="3" fill="none"/>` },
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
    p.happy = Math.max(5, p.happy - h * .3 * (2 - perk("calm")));
    p.t = now;
  }
}
/* Mood now comes from the pal's living body (livepal.js): hunger, thirst, sleep, exercise; plus happiness from care */
function palMood() {
  if (!S) return "happy";
  if (S.ill) return "sick";
  return lpMood();
}
const MOOD_FACE = { sick: "sick", hungry: "cry", thirsty: "cry", lonely: "cry", sleepy: "sleepy", groggy: "sleepy", asleep: "sleepy", exercise: "brave", overjoyed: "sparkle", happy: "happy" };
const MOOD_INFO = { sick: ["🤒", "Sick"], hungry: ["🍙", "Hungry"], thirsty: ["💧", "Thirsty"], lonely: ["🥺", "Lonely"], sleepy: ["😴", "Sleepy"], groggy: ["🥱", "Groggy"], asleep: ["💤", "Asleep"], exercise: ["🏃", "Playing outside"], overjoyed: ["🤩", "Overjoyed"], happy: ["😊", "Happy"] };
function palGain(ev) {
  if (!S || !(ev.ans > 0)) return;
  // studying never changes the pal's body; a pal with low focus (tired, thirsty, low glucose) just learns at half speed
  const p = palState(activePalId()), before = palLevel(p.xp), low = bpFocus(lpWorld().pal) < 0.3;
  const xp = Math.round((5 + 2 * Math.min(25, ev.cor || 0)) * perk("xp") * (low ? .5 : 1));
  p.xp += xp; p.happy = Math.min(100, p.happy + 3);
  const after = palLevel(p.xp);
  setTimeout(() => toast(after > before ? `⭐ ${palName()} reached level ${after}!${evoReady(activePalId()) ? " Evolution is ready! ✨" : ""}` : `+${xp} XP for ${palName()}${low ? " (low focus: half XP. Check sleep, water and food)" : ""}`), 2600);
}
function evoNeed(id) { const p = palState(id), P = palById(id); return p.stage >= 3 ? null : EVO[P.rar][p.stage - 1]; }
const evoReady = id => { const n = evoNeed(id); return !!n && palLevel(palState(id).xp) >= n[0]; };
function evolve(id) {
  const n = evoNeed(id), p = palState(id); if (!n || palLevel(p.xp) < n[0] || S.coins < n[1]) return;
  S.coins -= n[1]; p.stage += 1; save(true);
  giftCeremony(palById(id).rar === "myth" ? "myth" : "legend", () => { SFX.fanfare(); confetti(200); yaha(`${STAGES[p.stage]}!`); toast(`✨ ${palById(id).name} evolved into a ${STAGES[p.stage]}!`); renderMap(); });
}

/* ----- 🍱 Food and drinks: each one goes into the pal's simulated body (BP_FOODS in bodypal_engine.js) ----- */
const F_ = (id, e, name, cat, bp, price, hp, xp, note) => ({ id, e, name, cat, bp: typeof bp === "string" ? [[bp, BP_FOODS[bp].defaultPortionG]] : bp, price, hp, xp, note });
const FOODS = [
  F_("congee", "🥣", "Fish congee", "meal", "hk-congee", 9, 6, 4, "Mostly water and soft rice starch: easy to digest, and it tops up water too."),
  F_("oats", "🌾", "Porridge with milk", "meal", [["oats", 60], ["milk", 200]], 7, 6, 4, "Oat fibre and milk protein slow the stomach down, so glucose arrives gently."),
  F_("egg", "🍳", "Eggs on toast", "meal", "eggs-toast", 8, 7, 4, "Protein and fat keep food in the stomach longer than toast alone."),
  F_("rice", "🍚", "Rice with vegetables", "meal", "hk-rice", 10, 6, 4, "White rice starch is digested to glucose quite fast; the vegetables add some fibre."),
  F_("pasta", "🍝", "Pasta with tomato", "meal", "pasta-tomato", 10, 6, 4, "Pasta starch is packed tightly, so it is digested more slowly than rice."),
  F_("fish", "🐟", "Steamed fish with rice", "meal", "hk-fish", 14, 8, 6, "Lean protein for growth and repair; the protein slows how fast the stomach empties."),
  F_("noodles", "🍜", "Wonton noodles", "meal", "hk-noodles", 15, 12, 4, "Starch and protein together, plus plenty of water from the soup."),
  F_("salad", "🥗", "Egg salad", "meal", "hk-salad", 8, 6, 4, "Little carbohydrate, so glucose hardly moves; fibre adds bulk for peristalsis."),
  F_("apple", "🍎", "Apple", "snack", "apple", 4, 4, 2, "Fruit sugar with fibre and lots of water."),
  F_("banana", "🍌", "Banana", "snack", "banana", 4, 4, 2, "Sugar and starch for respiration, plus potassium."),
  F_("cheese", "🧀", "Cheese", "snack", "cheese", 5, 4, 2, "Protein, fat and calcium with almost no sugar, so plaque gets nothing to ferment."),
  F_("siumai", "🥟", "Siu mai (4 pieces)", "snack", "hk-siumai", 10, 10, 3, "Protein and fat with a little starch: a slow, small glucose rise."),
  F_("fishball", "🍢", "Curry fish balls", "snack", "hk-fishball", 9, 12, 2, "A Hong Kong street snack: starch and protein, quite salty."),
  F_("bun", "🍞", "Pineapple bun", "snack", "hk-bun", 8, 14, 2, "Soft white flour and a sugary top: glucose rises fast and plaque gets sugar."),
  F_("tart", "🥧", "Egg tart", "snack", "hk-tart", 8, 16, 2, "Buttery pastry and sweet custard: the fat slows the stomach a little."),
  F_("gummy", "🍬", "Gummy sweets", "snack", "gummy-sweets", 5, 14, 1, "Almost pure sugar that sticks to the teeth, and it is acidic too."),
  F_("water", "💧", "Water", "drink", "water", 0, 1, 0, "Pure water: no glucose, no acid, just a smaller water deficit."),
  F_("milk", "🥛", "Low-fat milk", "drink", "milk", 5, 5, 3, "Calcium and protein for bones and teeth. Its sugar, lactose, makes little acid."),
  F_("oj", "🍊", "Orange juice", "drink", "orange-juice", 6, 8, 2, "Fruit sugar without the fibre, and acidic enough to touch enamel directly."),
  F_("cola", "🥤", "Cola", "drink", "cola", 6, 12, 1, "Sugar, acid and some caffeine. Sipping it slowly keeps plaque acidic for longer."),
  F_("coffee", "☕", "Black coffee", "drink", "coffee", 6, 6, 1, "About 95 mg of caffeine. Half is still in the blood 5 hours later."),
  F_("milktea", "🫖", "HK milk tea", "drink", "hk-milktea", 7, 14, 1, "Strong tea with caffeine, plus sugar and evaporated milk."),
  F_("boba", "🧋", "Bubble tea", "drink", "hk-boba", 12, 22, 1, "About 40 g of sugar in one cup, plus some caffeine from the tea.")
];
const foodPrice = f => !f.price ? 0 : Math.max(1, Math.round(f.price / perk("food")));
const foodBolus = f => bpBolus(f.bp);
const isDrink = f => f.cat === "drink";
let feedTab = "meal", feedSip = false;
function openFeed(tab) {
  const P = activePal(); if (tab) feedTab = tab;
  const busy = lpBusy();
  const tabs = [["meal", "🍱 Meals"], ["snack", "🍪 Snacks"], ["drink", "🥤 Drinks"]];
  openModal(`<span class="kicker">🍱 Feed ${esc(P.name)}</span><h2>What should ${esc(P.name)} have?</h2>
    <p class="small muted" style="margin:0">Everything goes into ${esc(P.name)}'s body: watch glucose, water, teeth and caffeine change. Tap 🔍 to see what's inside. ❤️ Favourite: <b>${esc(FOODS.find(f => f.id === P.fav).name)}</b> (double happiness).</p>
    ${busy ? `<p class="lensres no" style="margin:6px 0">${esc(P.name)} is asleep. Food and drinks wait until it wakes up.</p>` : ""}
    <div class="subnav" role="tablist">${tabs.map(([id, l]) => `<button role="tab" data-ftab="${id}" aria-selected="${feedTab === id}">${l}</button>`).join("")}</div>
    ${feedTab === "drink" ? `<div class="row" style="justify-content:center">${segBtns("fsip", [["0", "Gulp it (5 min)"], ["1", "Sip slowly (60 min)"]], feedSip ? "1" : "0")}</div>` : ""}
    <div class="foodgrid">${FOODS.filter(f => f.cat === feedTab).map(f => { const free = S.pantry[f.id], cost = foodPrice(f), sp = foodSpeed(f);
      return `<div class="food"><button class="fpic ${free ? "free" : ""}" data-feed="${f.id}" aria-label="Give ${esc(f.name)}${free ? " (free from your pantry)" : cost ? ` for ${cost} chestnuts` : " (free)"}" ${busy || (!free && S.coins < cost) ? "disabled" : ""}><span class="fe">${f.e}</span><b class="small">${esc(f.name)}</b><span class="small">${sp[0]} ${esc(sp[1])}</span>${free ? `<span class="pill freepill">🎁 Free ×${free}</span>` : cost ? `<span class="pill coinpill">🌰 ${cost}</span>` : `<span class="pill freepill">Free</span>`}</button><button class="fnut" data-nut="${f.id}" aria-label="What's inside ${esc(f.name)}">🔍</button></div>`; }).join("")}</div>`, { wide: true });
  $modal.querySelectorAll("[data-ftab]").forEach(b => b.onclick = () => { SFX.tap(); openFeed(b.dataset.ftab); });
  $modal.querySelectorAll("[data-fsip]").forEach(b => b.onclick = () => { SFX.tap(); feedSip = b.dataset.fsip === "1"; $modal.querySelectorAll("[data-fsip]").forEach(x => x.setAttribute("aria-checked", x === b ? "true" : "false")); });
  $modal.querySelectorAll("[data-feed]").forEach(b => b.onclick = () => feed(b.dataset.feed));
  $modal.querySelectorAll("[data-nut]").forEach(b => b.onclick = () => { SFX.tap(); nutritionCard(b.dataset.nut); });
}
/* How a food behaves inside the pal, from the same formulas the engine uses (no good/bad labels, no energy numbers) */
function foodSpeed(f) {
  const b = foodBolus(f), K = BPK;
  if (b.carb < 5) return b.caf >= 20 ? ["☕", "caffeine, little sugar"] : ["💧", "little carbohydrate"];
  const rate = K.K_ABS_MAX * (b.gi / 100) / (1 + K.FIBRE_ABS_FACTOR * b.fibre);
  const hl = b.drink ? K.EMPTY_HL_DRINK_MIN : bpClamp(K.EMPTY_HL_SOLID_BASE_MIN + K.EMPTY_HL_FAT_PER_G * b.fat + K.EMPTY_HL_PROTEIN_PER_G * b.prot + K.EMPTY_HL_FIBRE_PER_G * b.fibre, K.EMPTY_HL_SOLID_BASE_MIN, K.EMPTY_HL_CAP_MIN);
  return rate >= 0.03 && hl <= 70 ? ["⚡", "fast glucose"] : rate < 0.022 || hl >= 110 ? ["🐢", "slow, steady glucose"] : ["🙂", "medium glucose"];
}
function nutritionCard(id) {
  const f = FOODS.find(x => x.id === id), b = foodBolus(f), K = BPK, r = x => Math.round(x * 10) / 10, sp = foodSpeed(f);
  const bar = (v, max, col) => `<div class="nbar"><i style="width:${Math.min(100, Math.round(100 * v / max))}%;background:${col}"></i></div>`;
  const hl = b.drink ? K.EMPTY_HL_DRINK_MIN : Math.round(bpClamp(K.EMPTY_HL_SOLID_BASE_MIN + K.EMPTY_HL_FAT_PER_G * b.fat + K.EMPTY_HL_PROTEIN_PER_G * b.prot + K.EMPTY_HL_FIBRE_PER_G * b.fibre, K.EMPTY_HL_SOLID_BASE_MIN, K.EMPTY_HL_CAP_MIN));
  const inside = [`${sp[0]} ${b.carb < 5 ? "Hardly any carbohydrate, so blood glucose barely moves." : `${r(b.carb)} g of carbohydrate becomes glucose. ${sp[1] === "fast glucose" ? "It arrives fast, so expect a tall peak." : sp[1] === "medium glucose" ? "It arrives at a medium pace." : "Fibre, fat or protein slow it, so the peak is lower and later."}`}`,
    `🫃 Half of it leaves the stomach every ${hl} minutes${b.drink ? ", because liquids empty fast" : ""}.`,
    b.sugar >= 3 || b.acidic ? `🦷 ${b.sugar >= 3 ? `${r(b.sugar)} g of sugar for plaque bacteria to turn into acid.` : ""}${b.acidic ? " Acidic, so it touches enamel directly." : ""}` : "🦷 Very little sugar, so plaque pH hardly drops.",
    `💧 Adds about ${Math.round(b.water)} mL of water.`].concat(b.caf >= 5 ? [`☕ ${Math.round(b.caf)} mg of caffeine: half is still there 5 hours later.`] : []);
  openModal(`<span class="kicker">🔍 What's inside</span><h2>${f.e} ${esc(f.name)}</h2>
    <table class="ntab"><tbody>
      <tr><td>Carbohydrate</td><td><b>${r(b.carb)} g</b></td><td>${bar(b.carb, 80, "#FFC800")}</td></tr>
      <tr><td>&nbsp;· of which sugar</td><td><b>${r(b.sugar)} g</b></td><td>${bar(b.sugar, 40, "#FF9600")}</td></tr>
      <tr><td>Protein</td><td><b>${r(b.prot)} g</b></td><td>${bar(b.prot, 35, "#1CB0F6")}</td></tr>
      <tr><td>Fat</td><td><b>${r(b.fat)} g</b></td><td>${bar(b.fat, 25, "#CE82FF")}</td></tr>
      <tr><td>Dietary fibre</td><td><b>${r(b.fibre)} g</b></td><td>${bar(b.fibre, 8, "#58CC02")}</td></tr>
      <tr><td>Water</td><td><b>${Math.round(b.water)} mL</b></td><td>${bar(b.water, 500, "#5B8DEF")}</td></tr></tbody></table>
    <p class="small muted" style="margin:0">One serving (${b.mass} ${isDrink(f) ? "mL" : "g"}), approximate values.</p>
    <p style="margin:6px 0 2px"><b>Inside ${esc(palName())}:</b></p><ul class="small lpinside-list">${inside.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
    ${say("chiikawa", esc(f.note), "normal", "hint")}
    <div class="row"><button class="btn big" id="nFeed" ${lpBusy() || (!S.pantry[id] && S.coins < foodPrice(f)) ? "disabled" : ""}>Give it${S.pantry[id] ? " (free)" : foodPrice(f) ? ` for 🌰 ${foodPrice(f)}` : ""}</button><button class="btn plain" id="nBack">← All ${isDrink(f) ? "drinks" : "food"}</button></div>`);
  document.getElementById("nFeed").onclick = () => feed(id);
  document.getElementById("nBack").onclick = () => { SFX.tap(); openFeed(f.cat); };
}
function feed(id) {
  const f = FOODS.find(x => x.id === id), P = activePal(), p = palState(P.id), free = (S.pantry[id] || 0) > 0, cost = free ? 0 : foodPrice(f); if (S.coins < cost) return;
  const w = lpWorld();
  const ok = isDrink(f) ? bpDrink(w, f.bp[0][0], f.bp[0][1], feedSip ? 60 : 5) : bpEat(w, f.bp);
  if (!ok) { SFX.wrong(); toast(`${P.name} is asleep. Try again after it wakes up.`); return; }
  if (free) { S.pantry[id] -= 1; if (!S.pantry[id]) delete S.pantry[id]; } else S.coins -= cost; const fav = P.fav === id;
  p.happy = Math.min(100, p.happy + Math.round(f.hp * (fav ? 2 : 1) * perk("energy"))); p.xp += Math.round(f.xp * perk("xp")); p.meals = (p.meals || 0) + 1;
  S.stats.meals = (S.stats.meals || 0) + 1; SFX.item(); closeModal();
  lpAfter(); refreshCoinsOnly();
  toast(`${f.e} ${P.name} ${isDrink(f) ? (feedSip ? "is sipping" : "drank") : "ate"} the ${f.name.toLowerCase()}.${fav ? " ❤️ Favourite!" : ""} Touch the tummy to watch it.`);
}
const refreshCoinsOnly = () => { if (typeof renderTools === "function") renderTools(); };

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
  PALS.forEach(P => { if (P.rar === "legend" && !P.cap && !S.pals[P.id] && condMet(P)) { S.pals[P.id] = newPal(); palQueue.push(P); } });
  if (palQueue.length) { save(); setTimeout(showPalUnlock, 2600); }
}
function adoptPal(id) {
  const P = palById(id); if (P.cap || S.pals[id] || !condMet(P) || S.coins < P.price) return;
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
  const P = activePal(), p = palState(P.id), lv = palLevel(p.xp), mood = palMood(), [mi, ml] = MOOD_INFO[mood];
  const xpPc = Math.round(100 * (p.xp - lvXP(lv)) / (lvXP(lv + 1) - lvXP(lv)));
  return `<section class="card palpanel lppanel ${P.rar}">
      <div class="row" style="gap:6px;justify-content:space-between"><div class="row" style="gap:6px"><h2 style="margin:0">${esc(P.name)}</h2>${palChips(P)}</div>
        <div class="small"><b>Lv ${lv}</b> · ${STAGES[p.stage]} · <span class="moodchip">${mi} ${ml}</span></div></div>
      ${lpRoomHtml()}
      <div class="row" style="justify-content:space-between;gap:6px"><span class="small" id="lpStatus">${esc(lpStatus(lpWorld().pal))}</span><span class="small muted">👆 Touch the head, mouth, heart, tummy or hands to look inside</span></div>
      <div class="lpgrid"><div id="lpBars" class="bpbars">${lpBars(lpWorld().pal)}</div>
        <div><div class="meter xp"><span>XP</span><div class="tprog"><i style="width:${xpPc}%"></i></div><b>${p.xp}</b></div>
        <p class="small muted" style="margin:4px 0 0">🔬 ${esc(P.fact)}</p></div></div>
      ${lpCareHtml()}</section>`;
}
function palsHtml() {
  const own = PALS.filter(P => S.pals[P.id]).length, list = PALS.slice().sort((a, b) => PAL_ORDER[a.rar] - PAL_ORDER[b.rar]);
  return `${palsSubnav("pals")}<div class="homegrid">${palPanelHtml()}${lpInsideHtml()}
    <section class="card palcoll"><div class="collhead"><h2 style="margin:0">Collect every Study Pal!</h2><span class="pill">${own} / ${PALS.length}</span></div>
      <div class="tprog rainbow"><i style="width:${Math.round(100 * own / PALS.length)}%"></i></div>
      <div class="palstrip" aria-hidden="true">${list.map(P => `<span class="${S.pals[P.id] || !palMystery(P) ? "" : "sil"}">${palFig(P.id, "happy")}</span>`).join("")}</div>
      ${palRarityFolds()}
      ${foldHtml("p-how", { icon: "❓", title: "How do I get pals?" }, `<p class="small" style="margin:0">Only your <b>active</b> pal's perk works. Common, rare and epic pals: reach the goal, then adopt with 🌰. Legendary pals come by themselves after a very hard goal. Mythic pals can only be adopted with 🌰.</p>`)}</section></div>`;
}
// The collection grid, one fold bar per rarity (easiest first); the first group with pals left to get starts open.
const PAL_RAR_NAME = { common: "Common", rare: "Rare", epic: "Epic", legend: "Legendary", myth: "Mythic" };
function palRarityFolds() {
  const order = ["common", "rare", "epic", "legend", "myth"];
  const firstOpen = order.find(r => PALS.some(P => P.rar === r && !S.pals[P.id]));
  return order.map(r => { const g = PALS.filter(P => P.rar === r); if (!g.length) return "";
    const own = g.filter(P => S.pals[P.id]).length;
    return foldHtml("p-" + r, { icon: `<i class="fold-rd rd-${r}"></i>`, title: PAL_RAR_NAME[r], peek: `${own}/${g.length}`, open: r === firstOpen, cls: "fold-flat" }, `<div class="palgrid">${g.map(P => palCard(P)).join("")}</div>`);
  }).join("");
}
const palMystery = P => !S.pals[P.id] && (P.rar === "legend" || P.rar === "myth");
function palCard(P) {
  const got = !!S.pals[P.id], act = activePalId() === P.id, met = condMet(P), pc = Math.round(100 * condPct(P));
  const st = got ? S.pals[P.id] : null;
  return `<div class="palcard ${P.rar} ${got ? "own" : "locked"} ${act ? "active" : ""}">
    <div class="ppic">${got ? palFig(P.id, act ? "sparkle" : "happy", { stage: st.stage }) : palMystery(P) ? `<span class="sil">${palFig(P.id, "normal")}</span><span class="plock" aria-hidden="true">🔒</span>` : `<span class="palprev">${palFig(P.id, "happy")}</span><span class="plock" aria-hidden="true">🔒</span>`}</div>
    <b>${palMystery(P) ? "???" : esc(P.name)}</b><span class="rchip2 small" style="background:${PAL_RAR[P.rar][1]};border-color:${PAL_RAR[P.rar][2]}">${PAL_RAR[P.rar][0]}</span>
    <span class="small muted">${got ? `Lv ${palLevel(st.xp)} · ${STAGES[st.stage]}` : P.cap ? "🎰 Lucky Capsule only" : P.cond ? esc(P.cond[2]) : "Adopt with chestnuts"}</span>
    ${got ? (act ? `<span class="pill saved">⭐ Active</span>` : `<button class="btn plain sm" data-usepal="${P.id}">Make active</button>`)
      : P.cap ? `<span class="pill capchip">Very rare prize</span>`
      : P.rar === "legend" ? `<div class="tprog"><i style="width:${pc}%"></i></div><span class="small">${Math.min(palVal(P.cond[0]), P.cond[1])} / ${P.cond[1]}</span>`
      : met ? `<button class="btn yellow sm" data-adopt="${P.id}" ${S.coins < P.price ? "disabled" : ""}>Adopt 🌰 ${P.price}</button>`
      : `<div class="tprog"><i style="width:${pc}%"></i></div><span class="small">${Math.min(palVal(P.cond[0]), P.cond[1])} / ${P.cond[1]}</span>`}
    <button class="pinfo" data-palinfo="${P.id}" aria-label="About ${esc(P.name)}">i</button></div>`;
}
function openPalInfo(id) {
  const P = palById(id), got = !!S.pals[id];
  openModal(`<span class="kicker">🐾 Study Pal</span><h2>${palMystery(P) ? "A mysterious pal..." : esc(P.name)}</h2><div class="petreveal ${P.rar === "myth" ? "epic" : P.rar}" style="width:150px;height:150px">${got || !palMystery(P) ? palFig(id, "happy") : `<span class="sil">${palFig(id, "normal")}</span>`}</div>
    <div class="row" style="justify-content:center">${palChips(P)}</div>${palMystery(P) ? `<p style="margin:0" class="muted">Only the most dedicated students will meet this one. Reach the goal below to reveal who it is!</p>` : `<p style="margin:0">${esc(P.desc)}</p>
    <section class="jsec"><h3>🔬 Real biology</h3><p style="margin:0">${esc(P.fact)}</p></section>`}
    <p class="small"><b>How to get:</b> ${P.cap ? "Only from the daily 🎰 Lucky Capsule (very rare). A longer streak gives better odds" : P.cond ? esc(P.cond[2]) + (P.price ? `, then adopt for 🌰 ${P.price}` : " (arrives by itself)") : `Adopt for 🌰 ${P.price}`} · <b>Favourite food:</b> ${esc(FOODS.find(f => f.id === P.fav).name)} · <b>Evolves at</b> Lv ${EVO[P.rar][0][0]} and Lv ${EVO[P.rar][1][0]}</p>`);
}
function wirePals() {
  wireCommon();
  const g = id => document.getElementById(id);
  if (g("lpRoom")) { wireLpRoom($app); wireLpCare($app); wireLpInside($app); }
  if (g("pFeed")) g("pFeed").onclick = () => { SFX.tap(); openFeed("meal"); };
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
      <div class="row" style="gap:6px"><button class="btn sm fparr" id="fpPrev" aria-label="Previous pal">◀</button><button class="btn ${P.rar === "myth" ? "pink" : "yellow"} sm" id="fpGo">${P.cap ? "🎰 LUCKY CAPSULE ONLY" : P.rar === "myth" ? `🌰 ${P.price} ADOPT` : esc(P.cond[2]).toUpperCase()}</button><button class="btn sm fparr" id="fpNext" aria-label="Next pal">▶</button></div></div></section>`;
}
function wireFeatured() {
  const g = id => document.getElementById(id);
  if (g("fpPrev")) g("fpPrev").onclick = () => { SFX.tap(); featIdx--; renderMap(); };
  if (g("fpNext")) g("fpNext").onclick = () => { SFX.tap(); featIdx++; renderMap(); };
  if (g("fpGo")) g("fpGo").onclick = () => { SFX.tap(); const L_ = PALS.filter(P => (P.rar === "legend" || P.rar === "myth") && !S.pals[P.id]); const P = L_[(featIdx + L_.length) % L_.length]; if (P && P.cap) { goTab("home"); } else goTab("pals"); };
}
