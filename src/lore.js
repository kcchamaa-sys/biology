
/* ============================================================
   4c. 📜 Lore: "The Codex of Life", the story world of Biology Study Pals (full bible: docs/LORE.md).
   Vita is a living world whose rules are written in the Codex of Life. The Murk (a grey fog of guessing,
   forgetting and muddled ideas, shared with the sibling games) tore the Codex into 60 pages and sealed each
   one in a locked room across 4 Realms. Students are apprentice Keepers; every correct answer unjams a lock.
   Each stage intro opens with its page of the story (the Codex narrates); boss stages are Murk Wardens,
   each made of that chapter's most stubborn misconception.
   ============================================================ */
const REALMS = [
  { name: "The Cellspire", icon: "🏰", line: "A shining tower-city built of living cells, rising from the Wellspring." },
  { name: "The Helix Vaults", icon: "🌀", line: "Spiral vaults beneath the roots, where every inherited instruction is kept." },
  { name: "The Living Wilds", icon: "🌳", line: "Forests, ponds and Hara the gentle giant, whose body is a land of its own." },
  { name: "The Bastion", icon: "🛡️", line: "The fortress at the edge of Vita, where the Murk's last shadows gather." }
];
// One chapter per topic (keyed by topic id)
const CHAPTERS = {
  t1: "The Wellspring", t2: "The Shrinking Lens", t3: "The Gatekeepers", t4: "The Copy Engines", t5: "The Key-Makers",
  t6: "The Sunlight Forge", t7: "The Ember Halls", t9: "The Pea Oracle", t10: "The Helix Stair", t11: "The Hall of All Names",
  t12: "The Green Pipes", t8: "The Gentle Giant's Feast", t13: "The Breath Winds", t14: "The Red River", t15: "The Garden of Beginnings",
  t16: "The Signal Towers", t17: "The Balance Keepers", t18: "The Web of the Wilds", t19: "The Bastion"
};
// One page of the story per stage: the first line of every stage intro
const LORE_STAGE = {
  t1s1: "Every story on Vita begins with water. The Murk has sealed the Wellspring, the very first page of the Codex. Its locks hold the secrets of water and the tiny ions life cannot live without.",
  t1s2: "The Library cooks kept their energy recipes here: starch, glycogen and fats. The Murk locked every jar. Unjam them and the Wellspring's second page will shine again.",
  t1s3: "A Murk Warden has rusted the Protein Factory shut. It is made of one stubborn muddle: 'heat can't hurt a protein.' Prove it wrong (shape is everything!) to free Chapter 1.",
  t2s1: "In this lab the first Keepers built the Shrinking Lens, which lets them shrink to the size of a cell. Learn to use a microscope, and the inside of life opens up.",
  t2s2: "Shrunk down, you walk through a living city where every building has one job. The Murk switched off the street signs. Name each organelle to light them again.",
  t2s3: "The Gate Warden guards the city wall, the cell membrane, whispering: 'bacteria have no DNA because they have no nucleus.' Show it who really belongs inside to free Chapter 2.",
  t3s1: "Particles never sit still on Vita. In this hall the Murk froze the air so nothing could spread. Free the scent and diffusion will flow again.",
  t3s2: "Water is Vita's great traveller, slipping through membranes towards the lower water potential. The Murk has muddled which way it goes. Set it straight.",
  t3s3: "The Pump Warden sneers: 'active transport is just fast diffusion.' Wrong: some cargo must be pushed uphill using ATP. Out-pump it to free Chapter 3.",
  t4s1: "Every new cell on Vita is copied here, chromosome by chromosome. The Murk jammed the engines halfway through a copy. Restart mitosis, one stage at a time.",
  t4s2: "Deep in the Copy Engines, a second machine never makes perfect copies: it shuffles. That is meiosis, and it is why no two Keepers are exactly alike.",
  t4s3: "The Mirror Warden blurs every reflection: 'meiosis is just mitosis done twice.' Tell the twins apart (two identical cells or four different ones) to free Chapter 4.",
  t5s1: "Every reaction on Vita needs the right key. The Key-Makers' shop holds the enzymes, each shaped for its own substrate. The Murk scrambled every key on the wall.",
  t5s2: "The Key-Makers know a secret: too hot or too sour, and a key loses its shape for good. The Murk turned the kitchen up to boiling. Find each enzyme's optimum.",
  t5s3: "The Vault Warden blocks the active sites itself and hisses: 'enzymes make impossible reactions happen.' Unblock the vault to free Chapter 5.",
  t6s1: "The plants of Vita forge sugar from light, water and air. The Sunlight Forge begins inside a leaf, built layer by layer to catch the sun.",
  t6s2: "The Forge's paintings are made of pigments that drink light. The Murk drained their colours. Bring back the chlorophylls and carotenoids.",
  t6s3: "Stage one of the Forge: light splits water and makes ATP and NADPH. The Murk drew the curtains. Let the sunshine back in.",
  t6s4: "Stage two of the Forge: the Calvin cycle turns round and round, fixing carbon into sugar. The Murk tangled the belt. Keep it turning.",
  t6s5: "The Forge can only run as fast as its scarcest supply. Find the factor that is holding it back, and the Murk loses its grip.",
  t6s6: "The Glasshouse Warden insists: 'plants get their food from the soil.' Prove it wrong the Keeper's way, with fair, controlled experiments, to free Chapter 6.",
  t7s1: "In every cell of Vita, tiny embers release the energy stored in food. The Murk smothered the Ember Halls. Relight aerobic respiration.",
  t7s2: "Down below, where oxygen runs short, the embers still glow: anaerobic respiration. Yeast bakers and tired muscles both depend on it.",
  t7s3: "The Detective Warden tangles the clues: 'plants photosynthesise, so they never respire.' Read the evidence, compare the processes, and free Chapter 7. The Cellspire is saved!",
  t9s1: "Beneath the roots of Vita lie the Helix Vaults, where every inherited instruction is kept. The Oracle here speaks only in peas, ratios and alleles.",
  t9s2: "The Hall's portraits trace families back through many generations. The Murk smudged who inherited what. Read the pedigrees and blood groups to restore them.",
  t9s3: "The Arena Warden roars: 'if a trait skips a generation, it can't be genetic.' Solve its genetic puzzles to free Chapter 8.",
  t10s1: "The Vaults' great staircase is a double helix: two strands with paired bases, A with T and C with G. Climb it without slipping.",
  t10s2: "At the foot of the Stair, the code becomes protein: DNA → mRNA → amino acids. The Murk keeps sneaking in mutations. Catch them.",
  t10s3: "The Gene Lab Warden snips carelessly: 'GM food is always dangerous.' Use real biotechnology, and think about its ethics, to free Chapter 9.",
  t11s1: "Every living thing on Vita has a name and a place on the great tree of life. The Murk tore off the labels. Classify them again.",
  t11s2: "On this island, life changes over generations through natural selection. The Murk claims creatures 'decide' to change. Show how evolution really works.",
  t11s3: "The Fossil Warden whispers: 'there are no in-between fossils.' The rocks remember otherwise. Read their evidence to free Chapter 10 and close the Helix Vaults.",
  t12s1: "The great trees of the Living Wilds drink through countless root hairs. The Murk dried out the tunnels. Get water and minerals flowing again.",
  t12s2: "Water climbs this tower all by itself, pulled up by leaves losing vapour. The Murk calls it 'a waste of water'. Prove it is the plant's engine.",
  t12s3: "The Express Warden derails the sugar trains: 'xylem and phloem are the same.' Send water up and sugar wherever it's needed to free Chapter 11.",
  t8s1: "In the Wilds lives Hara, a gentle giant so big that her body is a land of its own. Keepers shrink with the Lens to care for her, starting with her lunch.",
  t8s2: "Shrunk to the size of a rice grain, you slide down Hara's alimentary canal. Enzymes everywhere! Follow the food as it is digested.",
  t8s3: "A jungle of villi grows in Hara's small intestine. The Warden lurking here insists 'food is inside the body as soon as you swallow it.' Prove where absorption happens to free Chapter 12.",
  t13s1: "Hara takes a giant breath, and you are swept in with the air! Ride the wind through her airways down to the alveoli.",
  t13s2: "Hara's chest rises and falls like great bellows. The Murk claims the lungs 'suck' air in. Find the muscles that really do the work.",
  t13s3: "A Smoke Warden has crept into Hara's lungs. Its lie: 'e-cigarettes are completely safe.' Clear the air to free Chapter 13.",
  t14s1: "A red river flows through Hara: her blood, carrying cells, oxygen and food to every corner. Learn what floats in it and where it flows.",
  t14s2: "At the river's source beats Hara's heart, a pump that sends blood round the body twice. The Murk is trying to jam its valves.",
  t14s3: "Deep in the capillary maze, the Warden whispers: 'blood touches every cell.' Show how tissue fluid does the delivering to free Chapter 14.",
  t15s1: "Back in the open Wilds, new life begins: pollen, ovules, seeds. The Murk keeps muddling pollination with fertilisation.",
  t15s2: "Every Keeper began as a single cell. This clinic keeps the story of human reproduction, from gametes to the placenta.",
  t15s3: "The Tower Warden measures badly: 'growth just means getting taller.' Measure growth properly (dry mass!) to free Chapter 15.",
  t16s1: "Across the Wilds, signal towers send messages faster than the wind. The first tower studies the senses: the eye and the ear.",
  t16s2: "Signals race along nerves from receptor to effector. The Murk wants every action to wait for slow thinking. Find the reflex shortcuts.",
  t16s3: "Some messages travel slowly by blood, as hormones. Even plants send chemical letters: auxin tells a shoot which way to grow.",
  t16s4: "The Dance Warden boasts: 'muscles can push.' Every move needs antagonistic pairs that only pull. Dance it right to free Chapter 16.",
  t17s1: "Vita stays alive by keeping things steady. In this bakery, insulin and glucagon keep blood glucose in balance.",
  t17s2: "High on the mountain, the Warden claims 'we only breathe faster because oxygen runs out.' Find the real trigger to free Chapter 17.",
  t18s1: "Every creature in the Wilds is connected to the others. Meet the pond community and the relationships that hold it together.",
  t18s2: "Energy flows one way through the forest, while materials go round and round. The Murk says energy is recycled. Follow the arrows.",
  t18s3: "The Camp Warden samples only where the plants look thickest. Show it fair sampling with quadrats and transects to free Chapter 18. The Wilds are saved!",
  t19s1: "At the very edge of Vita stands the Bastion, where the Murk's last shadows gather as pathogens. Learn how disease spreads to stop it.",
  t19s2: "Inside the Bastion, the body's defenders stand ready: skin, phagocytes, antibodies and memory cells. Train them before the final battle.",
  t19s3: "The Murk Heart itself waits here, built from every excuse: 'one fried meal won't matter, one cigarette won't hurt.' Beat it with real knowledge to make the Codex whole again!"
};
// The Codex narrates the first line of every stage intro (escape mode). First stage of a chapter / realm gets a heading.
function loreLine(r) {
  const T = TOPICS[r.t], rs = ROOMS.filter(x => x.t === r.t), first = rs[0] === r, realmFirst = first && TOPICS.findIndex(x => x.p === T.p) === r.t, Rm = REALMS[T.p];
  const head = realmFirst ? `<b>${Rm.icon} Realm ${["I", "II", "III", "IV"][T.p]}: ${Rm.name}.</b> ` : "";
  return `${head}<b>Chapter ${T.no}: ${CHAPTERS[T.id]}${first ? "" : ` (page ${rs.indexOf(r) + 1})`}.</b> ${LORE_STAGE[r.id] || ""}`;
}
ROOMS.forEach(r => { if (LORE_STAGE[r.id]) r.intro = [["codex", "normal", loreLine(r)]].concat(r.intro); });

/* Original art for the two narrators */
function codexSvg() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#FFF3C4"/><path d="M10 20 Q22 14 32 20 Q42 14 54 20 V48 Q42 42 32 48 Q22 42 10 48Z" fill="#fff" stroke="${CO}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M32 20 V48" stroke="${CO}" stroke-width="2.5"/><path d="M16 27 h11 M16 33 h11 M37 27 h11 M37 33 h8" stroke="#C9A35A" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M32 6 l2 5 l5 1 l-4 3 l1 5 l-4 -3 l-4 3 l1 -5 l-4 -3 l5 -1z" fill="#FFD23F" stroke="#E0A92A" stroke-width="1"/></svg>`;
}
function murkSvg(mood = "brave") {
  const angry = mood !== "cry";
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 44 C2 30 14 14 30 12 C46 8 62 22 56 38 C62 46 52 58 40 54 C32 60 18 58 14 50 C6 52 4 48 8 44Z" fill="#6E6A7E" stroke="#3E3A4E" stroke-width="2.5"/>
    <path d="M16 26 q6 -6 12 0 M36 24 q6 -6 12 0" stroke="#8C88A0" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
    <ellipse cx="24" cy="34" rx="5" ry="${angry ? 3.5 : 5}" fill="#C9F27A"/><ellipse cx="42" cy="34" rx="5" ry="${angry ? 3.5 : 5}" fill="#C9F27A"/>
    ${angry ? `<path d="M17 27 l12 4 M49 27 l-12 4" stroke="#2E2A3A" stroke-width="3" stroke-linecap="round"/>` : ""}<path d="M26 46 q7 ${angry ? -5 : 5} 14 0" stroke="#2E2A3A" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
}

/* 📜 The story of Vita: six picture cards (opened from the ☰ menu and the Home banner) */
const STORY_CARDS = [
  ["The Codex of Life", "Long ago, Life wrote everything it learned into one glowing book: the <b>Codex of Life</b>. Its pages keep the world of <b>Vita</b> alive.", () => `<div class="stbig">${codexSvg()}</div>`],
  ["Born from a spark", "Whenever someone truly understands a page, a spark leaps out and becomes a <b>Study Pal</b>. Every pal carries a real biology fact.", () => `<div class="stbig pal">${figure("chiikawa", "sparkle")}</div>`],
  ["The Murk", "But the <b>Murk</b>, a grey fog of guessing, forgetting and muddled ideas, crept into the Great Library and tore the Codex into <b>60 pages</b>.", () => `<div class="stbig">${murkSvg()}</div>`],
  ["60 locked rooms", "It sealed each page in a locked room across <b>4 Realms</b> and jammed the locks with misconceptions. Its strongest muddles became <b>Murk Wardens</b>.", () => `<div class="strealms">${REALMS.map(R => `<span><b>${R.icon}</b>${esc(R.name)}</span>`).join("")}</div>`],
  ["You are a Keeper", "Only real understanding opens a Murk lock. Guessing just feeds the fog. Read, think, then answer, and each page comes home.", () => `<div class="stbig">🔑</div>`],
  ["Keep your flame", "Study a little every day and your <b>Keeper's Flame</b> grows: gold at 7 days, blue at 30, mythic at 100. The Murk hates a steady flame!", () => `<div class="stbig flame">${flameSvg(Math.max(1, S ? S.current_streak : 1))}</div>`]
];
function openStory(at = 0) {
  if (S) { S.lore_seen = 1; save(); }
  const show = i => {
    const [t, d, art] = STORY_CARDS[i];
    const box = openModal(`<span class="kicker">📜 The story of Vita · ${i + 1} / ${STORY_CARDS.length}</span><div class="storycard">${art()}<h2>${t}</h2><p>${d}</p></div>
      <div class="stdots" aria-hidden="true">${STORY_CARDS.map((_, k) => `<i class="${k === i ? "on" : ""}"></i>`).join("")}</div>
      <div class="row" style="justify-content:space-between"><button class="btn plain" id="stBack" ${i ? "" : "disabled"}>‹ Back</button>${i < STORY_CARDS.length - 1 ? `<button class="btn" id="stNext">Next ›</button>` : `<button class="btn" id="stDone">Let's go, Keeper! ✨</button>`}</div>`);
    box.querySelector("#stBack").onclick = () => { SFX.tap(); show(i - 1); };
    const nx = box.querySelector("#stNext"); if (nx) nx.onclick = () => { SFX.tap(); show(i + 1); };
    const dn = box.querySelector("#stDone"); if (dn) dn.onclick = () => { SFX.item(); closeModal(); if (typeof renderMap === "function" && homeTab === "home") renderMap(); };
  };
  show(at);
}
// A small Home banner until the story has been read once
const storyBannerHtml = () => S && !S.lore_seen ? `<button class="storybanner" id="storyGo"><span class="sbk" aria-hidden="true">${codexSvg()}</span><span><b>New Keeper? Read the story of Vita</b><span class="small">6 picture cards · 1 minute</span></span><span aria-hidden="true">›</span></button>` : "";
