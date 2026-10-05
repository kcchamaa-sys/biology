# The Codex of Life: story bible for Biology Study Pals

This is the background lore for the Biology Study Pals universe. In the game it lives in `src/lore.js`:
- realms, chapters and one story page per stage;
- the six-card "story of Vita";
- the Codex and Murk Warden narrators.

Keep this file and `src/lore.js` in step. The **Murk** is shared with the sibling games (see `docs/SHARED_KNOWLEDGE.md`), so all three can grow one universe.

## The world in one paragraph

**Vita** is a living world. Every rule that makes life work (how water dissolves things, how enzymes fit, how genes are copied, how energy flows through a forest) is written in one glowing book: the **Codex of Life**. Life wrote it over billions of years and it is kept in the **Great Library**.

Whenever someone truly understands a page, a spark leaps out and becomes a **Study Pal**.

One night, the **Murk** crept into the Library. It is a grey fog of guessing, forgetting and muddled ideas. It tore the Codex into **60 pages** and sealed each page in a locked room across **4 Realms**, then jammed the locks with misconceptions. Its most stubborn muddles took shape as **Murk Wardens**.

The student is a new **Keeper**. Only real understanding opens a Murk lock; guessing just feeds the fog.

## Core rules of the universe

1. **Truth is the only key.** A correct answer unjams a lock. A guess feeds the Murk, which is why guessing makes a lock slip back and the room dim.
2. **The Murk can hide truth but never destroy it.** Every page can be recovered, so mistakes are never final. The Mistake Notebook wipes Murk smudges away.
3. **Understanding makes life.** Study Pals are born from understood pages, so every pal carries a real biology fact. Rarer pals come from harder pages.
4. **A steady flame beats a big fire.** The Keeper's Flame (the study streak) grows on every study day: gold at 7 days, blue at 30, mythic at 100. The Murk hates a steady flame.
5. **Biology is never bent for the story.** The story frames the science; it never changes it. Villains are misconceptions, not wrong facts presented as true.

## Characters

| Who | What they are | Voice |
|---|---|---|
| **The Codex** | The living book; the narrator of every stage | Calm, a little poetic. Opens each room with its page of the story. |
| **Your Study Pal** | A spark of understanding (Mochi first, then any pal you adopt). It speaks in rooms, hints and pep talks. | Kawaii, brave, encouraging; calls the student by name. |
| **The Murk** | Grey fog of guessing, forgetting and muddled ideas (shared franchise villain) | Whispers misconceptions. |
| **Murk Wardens** | A boss for each chapter, made of that chapter's most common misconception | Smug, says the misconception out loud. Beaten by explaining why it is wrong. |
| **Hara, the gentle giant** | A huge, kind creature of the Living Wilds whose body is a land of its own. Keepers shrink with the Lens to travel inside her (digestion, breathing, transport). | Never speaks; breathes, eats and heartbeats are her "lines". |

The old side cast from the first version of the game was retired. Every line is now spoken by the Codex, your Study Pal or a Murk Warden.

## Game systems, explained in-world

| Game system | In the story |
|---|---|
| Escape rooms (stages) | Sealed rooms, each holding one page of the Codex |
| Locks and questions | Murk-jammed locks; correct reasoning unjams them |
| Boss stages | Murk Wardens (one misconception each) |
| Specimens + Bio-Machine | Ancient Library machines that run on understood life |
| Study streak | The Keeper's Flame |
| Study Pals | Sparks born from understood pages |
| Chestnuts | Snacks from the Library's chestnut trees; Keepers trade them |
| Mistake Notebook | Murk smudges you can wipe away |
| Simulation Lab | The Keeper's Workshop, where living models are rebuilt |
| Study mode | Quiet reading in the Library: no locks, no Murk |

## The four Realms (the four Parts)

| Realm | Part | Picture |
|---|---|---|
| 🏰 **The Cellspire** | I. Cells and Molecules of Life | A shining tower-city built of living cells, rising from the Wellspring |
| 🌀 **The Helix Vaults** | II. Genetics and Evolution | Spiral vaults beneath the roots where every inherited instruction is kept |
| 🌳 **The Living Wilds** | III. Organisms and Environment | Forests, ponds and Hara the gentle giant |
| 🛡️ **The Bastion** | IV. Health and Diseases | The fortress at the edge of Vita, where the Murk's last shadows gather as pathogens |

## Chapters (one per topic) and their Wardens

| # | Topic | Chapter | Warden's misconception |
|---|---|---|---|
| 1 | Molecules of Life | The Wellspring | "Heat can't hurt a protein." |
| 2 | Cellular Organisation | The Shrinking Lens | "Bacteria have no DNA because they have no nucleus." |
| 3 | Movement Across Membranes | The Gatekeepers | "Active transport is just fast diffusion." |
| 4 | Cell Cycle and Division | The Copy Engines | "Meiosis is just mitosis done twice." |
| 5 | Enzymes and Metabolism | The Key-Makers | "Enzymes make impossible reactions happen." |
| 6 | Photosynthesis | The Sunlight Forge | "Plants get their food from the soil." |
| 7 | Cellular Respiration | The Ember Halls | "Plants photosynthesise, so they never respire." |
| 8 | Basic Genetics | The Pea Oracle | "If a trait skips a generation, it can't be genetic." |
| 9 | Molecular Genetics and Biotechnology | The Helix Stair | "GM food is always dangerous." |
| 10 | Biodiversity and Evolution | The Hall of All Names | "There are no in-between fossils." |
| 11 | Life Processes in Plants | The Green Pipes | "Xylem and phloem are the same." |
| 12 | Nutrition in Humans | The Gentle Giant's Feast | "Food is inside the body as soon as you swallow it." |
| 13 | Gas Exchange in Humans | The Breath Winds | "E-cigarettes are completely safe." |
| 14 | Transport in Humans | The Red River | "Blood touches every cell." |
| 15 | Reproduction, Growth and Development | The Garden of Beginnings | "Growth just means getting taller." |
| 16 | Coordination and Response | The Signal Towers | "Muscles can push." |
| 17 | Homeostasis | The Balance Keepers | "We only breathe faster because oxygen runs out." |
| 18 | Ecosystems | The Web of the Wilds | Samples only where the plants look thickest (unfair sampling). |
| 19 | Health and Diseases | The Bastion | **The Murk Heart** (final boss): "One fried meal won't matter, one cigarette won't hurt." |

The page-by-page story line for all 60 stages is `LORE_STAGE` in `src/lore.js`. Each stage intro opens with it, narrated by the Codex. The first stage of a chapter adds the chapter title, and the first stage of a realm adds the realm name.

## Writing new lore (checklist)

- **One page per stage:** 1–3 short sentences. Name the room, say what the Murk did, and hint at the biology inside.
- **A Warden says one real, common misconception,** ideally one the stage's questions actually test.
- **Keep it kind and brave** (ages 15–17): no gore, no fear for its own sake, and nothing that mocks students.
- **Use original names and art only.** Nothing from existing franchises.
- **When adding a stage:** add its `LORE_STAGE` entry, and a chapter in `CHAPTERS` if it is a new topic.
