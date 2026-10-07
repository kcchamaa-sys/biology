# Biology Study Pals: current state report (for external review)

> **Purpose of this file:** a complete, honest snapshot of the game, written as context for another AI (or a human reviewer) to analyse it and give feedback on **game mechanics, learning design, question quality, aesthetics, UX, accessibility, technical health and risks**.
> **Snapshot date:** 2026-10-07. Branch `claude/wonderful-turing-8ehr7a` of `kcchamaa-sys/biology`.
> **Numbers in this file were measured from the live source** (not copied from older docs). Where the README disagrees, this file notes it.

---

## 0. How to use this report (for the reviewing AI)

Please give feedback in these areas, with **concrete, prioritised suggestions** (impact × effort):
1. **Learning design:** does the game build understanding and higher-order thinking, or mostly recall? Is retrieval and spacing used well?
2. **Question quality:** accuracy, ambiguity, distractor quality, difficulty labelling, alignment to a senior-secondary Biology curriculum (Hong Kong style, Sec 4–6).
3. **Game mechanics and motivation:** is the reward economy coherent or overloaded? Are there dark patterns? Is the progression clear?
4. **UX and UI:** clarity on phones, cognitive load, text density, navigation.
5. **Aesthetics:** consistency of the kawaii art direction, colour, typography, motion.
6. **Accessibility and inclusion:** reduced motion, colour contrast, reading load, ESL learners.
7. **Technical health:** single-file architecture, size, testability, data and privacy.
8. **The teacher's view:** usefulness of the stats and how easily the game fits lessons.

**The teacher-developer's own priorities:** students should study in a *relaxing* way (no explicit exam framing) while still training skills that transfer to the local public exam. They want more higher-order thinking and more variety (multimedia, not just text passages). Students reported that high achievers were bored by easy spelling questions, so the Study planner was redesigned around Easy / Medium / Hard.

---

## 1. Product summary

| Item | Value |
|---|---|
| Name | **Biology Study Pals** |
| Audience | Secondary 4–6 (ages ~15–17), Hong Kong school, English-medium (many ESL learners) |
| Curriculum | Local senior-secondary Biology, compulsory part: **19 topics, 60 stages** |
| Platform | One static HTML file (`index.html`, about **2.0 MB**), runs in any browser; phone-first; hosted on GitHub Pages and as a claude.ai artifact |
| Build | `python3 tools/build.py` concatenates about 55 files in `src/` (about 11,000 lines of JS/CSS/HTML) into `index.html` |
| Backend (optional) | Google Apps Script + Google Sheet (`server/Code.gs`): Google sign-in, cloud save, activity log, class leaderboard, friends, teacher stats. Without it the game runs in guest mode (localStorage) |
| Dependencies | None at runtime except Google Fonts (*M PLUS Rounded 1c*) and Google Identity for sign-in. All art is inline SVG; music is generated live with Web Audio |
| Sibling games | Shares patterns and lore with an S1 Science game and an S3 Science game (`docs/SHARED_KNOWLEDGE.md`) but has no runtime dependency on them |
| Session target | One stage ≈ 15–20 minutes; "one stage a day" is the stated goal |

---

## 2. Content structure

### 2.1 Topics and stages

There are 4 Parts (Realms in the story) and 19 topics. Every topic is open. In Escape mode, stages inside a topic unlock in order and the last one is a **boss stage**. In Study mode, everything is unlocked.

| # | Topic | Stages | Questions | Easy | Medium | Hard | Concept | Data | Investigate | See it |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Molecules of Life | 3 | 109 | 26 | 42 | 41 | 67 | 23 | 18 | 1 |
| 2 | Cellular Organisation | 3 | 107 | 26 | 39 | 42 | 70 | 18 | 16 | 3 |
| 3 | Movement of Substances Across Membranes | 3 | 108 | 25 | 40 | 43 | 65 | 26 | 15 | 2 |
| 4 | Cell Cycle and Division | 3 | 106 | 24 | 42 | 40 | 68 | 24 | 10 | 4 |
| 5 | Enzymes and Metabolism | 3 | 104 | 23 | 42 | 39 | 62 | 27 | 14 | 1 |
| 6 | Photosynthesis | 6 | 206 | 47 | 78 | 81 | 113 | 47 | 44 | 2 |
| 7 | Cellular Respiration | 3 | 107 | 23 | 43 | 41 | 58 | 24 | 23 | 2 |
| 8 | Basic Genetics | 3 | 104 | 24 | 40 | 40 | 75 | 17 | 10 | 2 |
| 9 | Molecular Genetics and Biotechnology | 3 | 103 | 24 | 37 | 42 | 81 | 12 | 8 | 2 |
| 10 | Biodiversity and Evolution | 3 | 103 | 24 | 37 | 42 | 78 | 17 | 8 | 0 |
| 11 | Life Processes in Plants | 3 | 100 | 23 | 38 | 39 | 68 | 17 | 15 | 0 |
| 12 | Nutrition in Humans | 3 | 107 | 24 | 43 | 40 | 76 | 20 | 9 | 2 |
| 13 | Gas Exchange in Humans | 3 | 100 | 23 | 37 | 40 | 70 | 19 | 11 | 0 |
| 14 | Transport in Humans | 3 | 101 | 23 | 38 | 40 | 76 | 16 | 9 | 0 |
| 15 | Reproduction, Growth and Development | 3 | 104 | 24 | 41 | 39 | 71 | 20 | 13 | 0 |
| 16 | Coordination and Response | 4 | 139 | 32 | 55 | 52 | 106 | 19 | 14 | 0 |
| 17 | Homeostasis | 2 | 68 | 15 | 27 | 26 | 47 | 15 | 6 | 0 |
| 18 | Ecosystems | 3 | 103 | 23 | 41 | 39 | 65 | 20 | 18 | 0 |
| 19 | Health and Diseases | 3 | 105 | 24 | 41 | 40 | 76 | 20 | 9 | 0 |
| | **Total** | **60** | **2,084** | **477** | **801** | **806** | **1,392** | **401** | **270** | **21** |

Notes:
- **Spelling ("Words" skill) items** are not in this table. They are generated automatically from **433 key terms**: "type the word" plus "which spelling is correct?" for longer words.
- **Internal ID quirk:** stage IDs don't match topic numbers after Topic 7 (e.g. `t9s1` is Topic 8 *Basic Genetics*, `t8s*` is Topic 12 *Nutrition*). Students only ever see the topic numbers; this is a maintainability risk only.
- Each stage also has **notes, key rules and key terms** (the Study Journal), an intro line from the story, and a room scene.

### 2.2 Difficulty model

Each question has a Bloom level (1–6). Students see friendly labels:

| Bloom | Label | Count |
|---|---|---|
| 1 | 🌱 Easy | 122 |
| 2 | 🌱 Easy | 355 |
| 3 | 🌿 Medium | 313 |
| 4 | 🌿 Medium | 488 |
| 5 | 🔥 Hard | 557 |
| 6 | ⭐ Expert (counts as Hard in the planner) | 249 |

Bloom levels were assigned by the author (an AI with teacher direction) and have **not been calibrated with real student data** (no item difficulty or discrimination statistics yet, although the server logs wrong-question IDs per activity).

### 2.3 Skills (strands)

Every question has one skill, hand-tagged by "what the student has to do":
- 🔤 **Words** (spelling, generated);
- 💡 **Concept** (recall, explain, apply, judge a claim);
- 🔍 **See it** (read a diagram; covering the picture makes it unanswerable);
- 📈 **Data** (read and interpret numbers, graphs, tables);
- 🧪 **Investigate** (variables, controls, fair tests, reliability, evaluating conclusions).

**Imbalance:** Concept 67% · Data 19% · Investigate 13% · **See it 1% (21 questions)**. "See it" is very scarce because each one needs a drawn diagram.

---

## 3. Question types and formats

### 3.1 Interaction types (measured)

| Type | Count | What the student does |
|---|---|---|
| Multiple choice (4 options) | 1,930 | Tap one option; options are shuffled except "keep-order" items |
| Dials | 100 | Turn 2–3 dials to the right combination; "Chain reaction" items order cause → effect steps, with one trap step |
| Sort it | 33 | Put 4–7 cards into 2–5 groups, then check |
| Tap it | 21 | Tap the right target on a picture or graph (a cell in anaphase, a person in a family tree, a gel lane, a chromatogram spot, a bar or point) |
| Spelling (generated) | from 433 terms | Type the word into letter boxes; British/American spellings are both accepted; plus "which spelling is correct?" |

### 3.2 Pictures and media

- **105 questions use a fixed diagram or graph** from a library of **78 SVG diagrams and graphs** (drawn to scale: osmosis curves, enzyme curves, absorption spectra, GP/RuBP, etc.).
- **73 questions use the newer media engine** (`src/media.js`):
  - **Seeded, procedurally drawn virtual-lab scenes:**
    - animated: pondweed / liver / yeast tubes bubbling against a looping 10-second clock; a respirometer or potometer bead in time-lapse; a 6-second heart trace with a sweeping cursor;
    - static: a root-tip mitosis field (I/P/M/A/T cells); plant cells turgid or plasmolysed; an eyepiece graticule; an agar plate with antiseptic discs and clear zones plus a mm ruler; a 0.25 m² quadrat; a paper chromatogram with a cm ruler; a family tree; a DNA-profiling gel.
  - **Plotted graphs** (with tap targets).
  - **Mini graphs** inside the answer buttons for "Pick the graph", optionally with a dashed "before" reference line.
  - **Case-file evidence cards.**
  - Animated scenes show a "Can't watch it? Read what happens" text alternative.

### 3.3 "Hard" formats (labels students see; deliberately no exam wording)

Measured counts by format code:

| Code | Label shown | Count | Description |
|---|---|---|---|
| R | 🧩 Which are true? | 35 | Statements I, II, III; options "I and II only" … "I, II and III" (fixed order). Trap notes are generated per statement |
| A | ⚖️ True… and why? | 27 | Two statements: are both true, and does the 2nd explain the 1st? Four fixed options |
| T | 📊 Table detective | 54 | A data table plus MCQ; distractors include "data traps" (a true reading that doesn't answer the question) |
| C | ↔️ Spot the difference | 18 | Pick the valid paired comparison ("…whereas…"); distractors are unpaired fragments or reversals |
| N | 🌍 Real-world puzzle | 23 | Novel context (e.g. marathon hyponatraemia, Down syndrome risk, egg allergy and baking) |
| E | 🔎 Spot the flaw | 23 | Find the experimental design flaw |
| L | 🔗 Chain reaction | 35 | Order 3 cause → effect steps on dials; one plausible trap step is mixed in |
| K | 🕵️ Case file | 40 | 3–4 evidence cards (+ table or graph); pick the explanation that fits ALL the evidence |
| G | 📈 Pick the graph | 32 | Four mini graphs as options (e.g. "twice the enzyme, same substrate"; competitive inhibitor; oxygen debt) |
| D | 📈 Graph detective | 8 | Reasoning from a plotted graph (pulse-chase, cyanide on ion uptake, cigarette sales vs lung cancer lag) |
| V | 🔬 Virtual lab | 11 | Observe or measure in a scene (count bubbles, read a bead, count spikes, mitotic index, Rf, quadrat density) |
| S | 🗂️ Sort it | 33 | Classification into groups |
| P | 👆 Tap it | 21 | Tap the answer on a picture or graph |

**Trap feedback:** every wrong option in these formats carries a one-line "why it's a trap" note (the misconception or reading error it targets). It's shown immediately on a wrong pick, plus a collapsible "Why the other options are traps" list after answering.

An earlier "📝 Mark it like an examiner" format (choose the answer that scores full marks) was **removed** at the teacher's request (not higher-order enough, and too exam-flavoured); its 29 slots were replaced with media questions.

### 3.4 Sample items (verbatim or abridged)

- **Concept (older bank, Hard):** "A classmate says: 'Mitochondria MAKE energy.' Which is the best correction?" (Correct: they *release* energy from food during respiration.)
- **Case file:** "Kai collapsed at a summer football match." Cards: 34 °C, played 80 min; drank 2 L of plain water; blood sodium 125 mmol/L; headache, confusion, puffy fingers. Correct: "Diluted blood; cells swelled by osmosis." Traps: "dehydrated", "heat denatured blood proteins", "too much salt made cells shrink".
- **Pick the graph (with reference line):** "The experiment is repeated with TWICE as much enzyme but the same amount of substrate. Which graph shows the new result?" Correct: steeper start, same plateau.
- **Virtual lab:** an animated pondweed scene at 10 / 20 / 30 cm (bubbles every 1 / 4 / 9 s). "Do the results fit the inverse square law?"
- **Tap it:** a family tree. "This condition is caused by a RECESSIVE allele. Tap a person who MUST be a carrier." (Accepts either parent or the unaffected son of an affected mother.)
- **Sort it:** sort examples into Diffusion / Osmosis / Active transport / Phagocytosis.
- **Chain reaction:** "How does the fat in a camel's hump help it survive?" Steps: respired → releases energy and metabolic water → survives longer without food or water. Trap step: "fat is turned straight into water by osmosis".

### 3.5 Known question-quality issues (honest)

1. **Answer-length bias (partly fixed).** Originally the correct option was the **longest in 80%** of 1,836 eligible MCQs (and the shortest in 3%). 600 questions were rewritten. Now it's **longest 59% (1,088), shortest 20% (367)**; the chance level would be 25% each. About 1,000 items still have a slightly longer correct option.
2. **Weak distractors in the older banks.** Many older items have one or more absurd or joke distractors (e.g. "Plants eat insects for all food", "Scientists hide fossils"). This lowers discrimination; a reviewer could flag which to upgrade.
3. **AI-authored content.** Roughly 1,000+ items, including all Hard formats and media items, were written by an AI under teacher direction in a few sessions. They pass automated structural checks but have **not all been reviewed line by line by a subject teacher**. Some data sets are realistic but invented or stylised (e.g. greenhouse costs, rice CO₂ yield and protein, cigarette/cancer curves "scaled to peak = 100", pollen tube lengths). They're internally consistent, but a reviewer should check the numbers.
4. **"See it" scarcity** (21 items). There's no diagram-labelling question type (e.g. "tap the left ventricle on a heart diagram") because there's no general labelled-diagram tap tool yet; the tap tool only covers generated scenes and graphs.
5. **Bloom labels are uncalibrated** (see 2.2). Some "Hard (5)" items are really careful reading rather than analysis.
6. **Explanations sometimes repeat the option text** rather than teaching the underlying idea. Hard items have richer explanations than older ones.
7. **ESL load.** Hard and media questions are text-heavy (case files have 3–4 cards plus a question plus 4 long options). Reading load may hide biology ability.
8. **Spelling.** Generated misspellings come from simple rules; some may look implausible.
9. **Not yet calibrated with real use.** The server records wrong-question IDs, so item statistics *could* be computed but haven't been.

### 3.6 Automated content checks (`node tools/check_content.js`)

These check every stage for: ≥15 questions; Bloom spread; 4 unique options; a valid answer; hint and explanation present; diagram references existing; no "the graph" mention without a graph; well-formed tables and statements; complete trap notes; valid sort and tap items; and skill tags. They warn when a stage has fewer than 4 See/Data/Investigate items. **Current result: 60 stages, 2,084 questions, 0 problems** (warnings: See-it is under 4 in every stage).

---

## 4. Game modes and mechanics

### 4.1 Navigation

- A bottom tab bar: 🏠 Home · 🗺️ Stages · 🎮 Practice · 🐾 Pals (Study Pals / Dress up / Pets) · 🏆 Rewards · 🔬 Lab (+ 📊 Stats for teachers).
- A top bar: 🔥 streak, 🌰 chestnut counter, 🎁 capsules, ☰ menu (trophies, account, journal, save code, leaderboard, music and sound).
- A global **⏱️ Escape / 📖 Study** mode switch on Home and Stages.
- Many secondary panels are **fold bars** (an icon, a title and one peek number; open or closed state remembered per student).

### 4.2 Escape mode (the core game loop)

1. **Story intro:** the Codex narrates one page of lore for the stage (with chapter and realm titles on first entry).
2. **Discover:** in a dark room (8 scene types: library, lab, greenhouse, inside a cell, kitchen, pond, garden, clinic), sweep a torch to find 3 shimmering **specimens** (each a key term).
3. **Process:** wire each specimen to its function on the ⚙️ **Bio-Machine** (one decoy socket; a wrong cable costs −10 s).
4. **Locks:** 5 locks, each needing **3 correct questions in a row** (15 per visit). Lock themes: 🔤 Words → 💡 Concepts → 🔍 See it → 📈 Data → 🧪 Investigate. A lock borrows from the nearest skill when the stage is short (common for See it) and is then labelled "stand-in". Each lock reveals one digit of a 5-digit door code.
5. **Escape:** the door needs the code AND the machine powered.
6. **Timer:** 20 minutes on an LED display (overtime allowed); 1–3 ★.
7. **Anti-guessing penalties:**
   - Every wrong answer costs −10 s and reshuffles the lock (options shuffled, letters cleared, dials spun).
   - A wrong answer within 5 s of opening (or within 4 s of the last miss) counts as guessing: the lock jams for 15 s.
   - A repeat miss also jams it (5–15 s).
   - Strikes, a chestnut fine, and a lock that **slips back a notch** (one extra question) on guessing or a 3rd miss.
   - Power-ups (🔦 torch: remove a wrong option / reveal a letter / fix a dial / place a sort card / remove a wrong tap target; ⏳ +60 s; 🛡️ guard: block one penalty).
8. **Random incidents** (spooky but friendly): fog that hides the answers for 6 s, a sleepy pal (no hints), and surprise bonus questions.
9. A **boss stage** ends each topic, framed by a "Murk Warden" (a personified misconception).
10. 13 pets can only be unlocked in Escape mode (clean escapes, boss wins, no-hint escapes).

### 4.3 Study mode (calm learning)

- **Study planner** (Stages tab in Study mode): choose a **topic** (optionally one section) and a **level** (🌱 Easy / 🌿 Medium / 🔥 Hard). The game builds a **12-question exercise** by weighted round-robin over skills (Concept 5 : Data 2 : Investigate 2 : See 2 : Words 1, with at most 2 spellings and only at Easy), **unseen and unmastered questions first**, ordered easy → hard. Two runs in a row of the same Hard topic overlapped by 0 questions in testing.
- No timer and no penalties. A wrong answer shows the explanation and the question returns once at the end as a "second chance".
- **Guess alert:** a right answer faster than a reading-time threshold (about 2.5–5 s, +1 s with a picture) gives no mastery; 5+ guesses cap the series at 1★.
- **"Why?" check:** after a series, pick the right explanation for 2 questions you got right (+5 🌰 if right; to the Mistake Notebook if wrong).
- A finish screen offers "🎲 New mix" and "Try the next level". Only the "full section run" (all levels) marks a section as completed; level exercises give mastery, chestnuts and streak days.

### 4.4 Practice tab

- ⚡ **Cell Rush:** 60-second mixed rush (plain multiple choice, true/false, matching, put in order, odd one out, fill the gap, test-tube colours, spelling bee).
- 🎧 **Word Dictation:** 10 words; listen and spell, or read the meaning and spell; British text-to-speech; missed words recycle until spelled right twice.
- 📕 **Mistake Notebook:** every wrong answer, grouped by topic; a question clears after 2 correct answers in a row without hints.
- 🔖 **Bookmarks:** save any question (up to 200); redo rounds of 10, least-practised first.

### 4.5 Simulation Lab (7 interactive models)

Cell membrane (fluid mosaic, transport routes, temperature) · Osmosis with dialysis tubing (zoom, level–time graph with ghost runs, fair-test table) · Breathing (chest model + pressure graph) · Pupil reflex · Focusing and glasses (paraxial ray tracing, short/long sight, lenses) · Hearing (ear, cochlea map, hearing damage) · Phototropism (5 historical coleoptile experiments with predict → run → explain). Each now opens with a **"Predict first" card**: controls unlock after a guess, and the first right prediction gives +2 🌰. Each also has a 2-question quick check.

### 4.6 Retention, progression and reward systems

The game layers **many** motivational systems (a reviewer may judge whether this is too many):

| System | Summary |
|---|---|
| 🔥 Study streak | Grows only on days with a finished activity; a full-screen streak-up ceremony (odometer, milestones 3/7/14/…/365); the flame evolves at 7/30/100 days |
| ❄️ Streak Freezes | Start with 3; +1 free per month (max 3); buy more for 150 🌰; used automatically on missed days |
| Streak-risk reminder | A Home banner until today's study is done; turns red in the last 3 hours |
| 📅 Daily mission | One story mission a day targeting the student's weakest area; +40 🌰 + a capsule |
| 🌰 Chestnuts (currency) | +3 per first-try correct answer; stage clears +30 (boss +50); streak multiplier up to ×1.5; spent on outfits, power-ups, freezes, pals and food |
| 🎰 Daily Lucky Capsule | One gacha draw per day, unlocked only after **40 questions answered** in finished activities that day (`LUCKY_NEED`, teacher-adjustable; progress bar on Home). Odds improve with the streak in 6 bands (mythic 0.3% → 3%; legendary 1.7% → 11%); epic or better guaranteed within 15 draws |
| 🃏 Capsule Lab cards | 40 biology trading cards in 5 rarities. Base odds Common 74 / Rare 20 / Epic 5 / Legendary 1 / Mythic 0.2%; streak luck up to +4%; pity: Epic+ every 20, Legendary+ every 80; **duplicates are normal** (converted to 🌰) |
| 🐾 Study Pals (27 + 3 capsule-only) | Tamagotchi-like care (energy, happiness, food with nutrition cards, a sugar-crash mechanic), XP, evolution (Baby → Junior → Master), rarity tiers, a perk per pal |
| 🦜 Pets (25) | Real animals (5 Hong Kong species) with biology stories; unlocked by goals |
| 👗 Dress up | 35 items in 7 slots, including trend/meme items and Hong Kong items |
| 🏆 Trophies (31) | Trading-card style, progressive reveal |
| 🩺 Pal sickness | 30% chance on a new day / 12% after a stage, max once a day; pick the right medicine from 13 (teaches antibiotics vs antivirals, etc.); rewards reduced while sick |
| 👥 Friends | Up to 5 (signed-in only); see their streak, progress and pal; one preset cheer a day; no free text |
| 🏆 Class leaderboard | Effort, streak, collection; on Home and in the menu (the Practice-tab leaderboard was removed) |
| 💚 Wellbeing | Health tips by time of day; a "time to rest" pop-up after 10 pm; a brain-break reminder after 40 minutes |

**Possible concerns for the reviewer:**
- reward overload and currency inflation;
- gacha mechanics for teenagers (no real money is involved, but variable-ratio rewards);
- loss-aversion from streak pressure (mitigated by freezes);
- sickness reducing rewards (punishing absence?);
- time spent on cosmetics vs learning.

### 4.7 Story and characters

- **Lore, "The Codex of Life"** (`docs/LORE.md`): on the world of Vita, the Murk (a fog of guessing and muddled ideas) tore the Codex into 60 pages across 4 Realms (Cellspire, Helix Vaults, Living Wilds, Bastion). The student is a **Keeper**; each boss is a **Murk Warden** embodying one real misconception (e.g. "Muscles can push", "Enzymes make impossible reactions happen"). A 6-card story intro sits on Home.
- **Cast:** the student's active Study Pal (Mochi by default) does all the talking (hints, praise, pep talks) and uses the student's name. The Codex narrates intros. An earlier side cast was removed for simplicity.
- **Language register:** cute and encouraging ("Wahoo!", "Uu... not yet"), mixed with precise biology terms.

---

## 5. Aesthetics and style

### 5.1 Art direction

- **Kawaii "mochi" style:** soft, squishy one-piece blob characters, plum line art (#6B4A6B family), big sparkly eyes (dark with two highlights), blush, nub arms, sparkle buddies. Soft 2.5D shading (light top-left, plum shadow, sheen and rim light).
- **Original IP:** no franchise logos, art or music (a project rule). The style is *inspired by* popular cute franchises but drawn originally.
- **Diagrams and simulations:** textbook-illustration style with real structures and shading, so students can link them to real specimens. The media scenes are cleaner and flatter (pastel fills, plum outlines, mm/cm rulers).
- **Icons:** about 250 original chunky 2-tone icons replace emoji everywhere (a MutationObserver swaps emoji in any rendered text) for cross-device consistency.
- **Room scenes:** 8 illustrated room types, full-bleed, with the pal "popping out" of the frame.

### 5.2 Design tokens (from `src/head.html`)

| Token | Value |
|---|---|
| Background (cream) | `#FFFDF0` |
| Ink / ink-soft | `#4A3E3D` / `#7A6A66` |
| Plum (lines, shadows) | `#6B4A6B` |
| Pastels | pink `#FFB7C5` · blue `#A0C4FF` · yellow `#FDFFB6` · green `#B9F3C9` · red `#FFADAD` |
| Night / LED | `#2B2433` / `#FF6B6B` (escape timer) |
| Radius | 22 px cards; pill chips |
| Shadow | soft plum-tinted double shadow |
| Glass | `rgba(255,255,255,.78)` frosted panels |
| Font | **M PLUS Rounded 1c** (400/700/800) via Google Fonts, falling back to system-ui; 16 px base, line-height 1.55 |

- **Components:** "clay" buttons (darker bottom edge, sink on press); one glossy primary button style; soft secondary buttons; chips; fold bars; trading cards with foil finishes (bronze/silver/gold/rainbow/cosmic); speech bubbles; gift-box and gacha ceremonies.
- **Motion:** confetti, embers, shockwaves, odometer, capsule upgrade sequence, card flips, pet unlock box, SVG animations in media scenes. `prefers-reduced-motion` is respected in about 13 CSS rules and several JS checks (`reduced()`); SMIL scene animations do NOT stop under reduced motion (a text alternative is given instead).
- **Sound:** 8 original procedurally generated tunes (marimba, toy piano, flute, plucked strings, soft drums) per room type, plus special tracks for boss / rush / notebook; UI sound effects; British TTS for terms.

### 5.3 Aesthetic consistency risks (for review)

- Three visual registers coexist: (a) kawaii characters and UI; (b) textbook-style diagrams and simulations; (c) flatter procedurally drawn media scenes and mini graphs. They may or may not feel unified.
- **No dark mode** (no `prefers-color-scheme` rules).
- Mini graphs in "Pick the graph" have no axis numbers (by design: shape reasoning), but the axis labels are small (8.5 px in the SVG).
- High density of chips, badges and emoji-icons in question headers (topic · stage · section · difficulty chip · format chip · bookmark) can wrap to 3 lines on phones.
- Long Hard and Case-file questions make cards very tall on phones (lots of scrolling between evidence and options).

---

## 6. UX, accessibility and inclusion

- **Phone-first.** Checked at 360/390 px, 820 px and 1180–1440 px with no horizontal scroll (automated check in tests). Pop-ups sit above the tab bar with safe-area padding.
- **Reading load.** Hard and media items are text-heavy, which matters for ESL learners. The Codex intros add more text before play.
- **Accessibility:**
  - choices are buttons with letters A–D;
  - tap targets in SVG have `role="button"`, `tabindex` and Enter/Space support;
  - sort uses `aria-pressed`;
  - animated scenes have text alternatives;
  - colour plus symbol is used for right/wrong (✓/✗ and outline).
  - Not audited with a screen reader; colour contrast of pastel chips is not formally checked.
- **Wellbeing:** night-time rest prompts, brain-break reminders, gentle failure language, and a no-penalty Study mode as an alternative to the timed Escape mode.
- **Privacy:**
  - guests store everything in localStorage;
  - signed-in data goes to the school's private Google Sheet (names and emails never in the repo);
  - friends see first name, class, streak, stages and effort only;
  - cheers are presets (no free-text messaging).

---

## 7. Teacher-facing features

- **📊 Stats tab** (teacher accounts):
  - filters by class and period;
  - activity, accuracy and streak summaries;
  - accuracy by topic (weakest topic called out);
  - activity per day and practice mix;
  - **most-missed questions with text**;
  - a sortable student table; inactive students; CSV export.
- The **activity log** records mode, topic, stage, answered, correct, accuracy, stars, time and wrong question IDs, so item analysis is possible but not implemented.
- **Setup:** about 15 minutes with Google Apps Script (`server/SETUP.md`). New server features (friends, bookmarks mode, stats) require the teacher to redeploy `Code.gs`.

---

## 8. Technical architecture and health

| Aspect | State |
|---|---|
| Source | ~55 files in `src/`: content (`stages*.js`, `q_*.js`), engine (`engine.js`), feature modules (`study.js`, `home.js`, `pals.js`, `lucky.js`, `cards.js`, `daily.js`, `friends.js`, `media.js`, `sims*.js`, …), CSS in `head.html` |
| Output | A single `index.html`, about **2.03 MB** uncompressed (all SVG and data inline). No lazy loading |
| Question storage | IDs are positional (`stageId:q<index>`), so questions may only be **appended**, never reordered or deleted. Replacement means overwriting the same index |
| Question authoring | Arrays (`[bloom, q, choices(correct first), hint, explain, tip?]`), objects, `KX()` (skill-tagged arrays) and `KH()` (formats + media objects, documented in `src/q_h0.js`) |
| Save | localStorage (`escapeGame_biology`); 12-character save code / link for moving devices; cloud save for signed-in students |
| Tests | `tools/check_content.js` (content validation), `tools/smoke.js` (Playwright smoke test, phone + desktop). Several feature regression scripts were written during development but live **outside the repo** (a gap: they should be added to `tools/`) |
| Build / deploy | `python3 tools/build.py`, then commit, then GitHub Pages (`gh-pages` branch) and the claude.ai artifact |
| Docs | `README.md` (feature list; **partly stale**, see below), `docs/LORE.md`, `docs/SHARED_KNOWLEDGE.md` (cross-project log), `server/SETUP.md` |

### Known documentation inconsistencies (README vs code)

- README says sickness reduces rewards to ×0.8 in one place and "halved" in another.
- README's Escape/Study section still describes Study mode as "the stage's 15 questions"; it's now the planner (12-question level exercises) plus an optional full section run.
- README mentions a "👗 Dress up" bottom tab; Dress up now lives inside the 🐾 Pals tab.
- README says graph questions = 78. There are 78 graph/diagram SVGs and 104 questions flagged as graph questions (fixed graphs + plotted media graphs).

---

## 9. Recent change history (most recent first)

0. **(Another session, same day) Harder rewards and Lab polish:** the Lucky Capsule now needs 40 questions a day; card odds are rarer with more duplicates; the Lab has roomier spacing, a phototropism layout that fits every screen, and "Predict first" in every lab.
1. **600 MCQs rebalanced** so the correct option isn't reliably the longest (80% → 59% longest; 3% → 20% shortest).
2. **Multimedia Hard questions:** media engine, about 150 media items; the "mark like an examiner" format removed; format labels reworded to avoid exam terms.
3. **240 Hard questions** in exam-board styles (statement combos, two-statement reasoning, data tables, comparisons, novel contexts, design flaws, chain reactions), each with per-option trap notes.
4. **Study planner simplified** to topic + Easy/Medium/Hard with an automatic skill mix; **481 new questions** to give each level enough variety.
5. Earlier: skill strands per lock; hand re-tag of all questions; streak ceremony; fold-bar UI; dialysis and phototropism simulations; lore world; bookmarks; friends; pop-up overflow fixes.

---

## 10. Open questions for the reviewer

1. Is a **12-question exercise** the right length? Is Concept 5 : Data 2 : Investigate 2 : See 2 the right mix per level?
2. Should Bloom labels be replaced or validated by **empirical difficulty** from the activity log?
3. Rewards were recently made **harder to earn** (40-question capsule gate, rarer cards). Is this the right balance between effort and reward? Which reward systems should be **cut or merged** to reduce cognitive load (chestnuts, XP, capsules, cards, trophies, pals, pets, outfits, freezes, missions)?
4. Is the **Escape-mode penalty system** (jams, slip-backs, fines) motivating or anxiety-inducing for 15–17-year-olds? Should it be optional?
5. How to raise **"See it"** coverage cheaply (e.g. a generic "tap the labelled part" tool on existing diagrams)?
6. How to reduce **reading load** for ESL students in Hard items without lowering the cognitive demand (e.g. a key-word glossary on tap, audio read-aloud, shorter cards)?
7. Should spaced repetition be more explicit (e.g. scheduled reviews from the Mistake Notebook and bookmarks)?
8. Is the **single 2 MB HTML file** a problem on low-end phones and school Wi-Fi? Worth splitting or lazy-loading?
9. Does the **three-register aesthetic** (kawaii UI / textbook diagrams / flat media scenes) need unifying?
10. Which question banks most need **subject-teacher review** first (AI-written Hard and media items, invented data sets)?

---

*Generated from the source at the snapshot date. Key files to inspect for deeper review: `src/study.js` (planner and mixing), `src/engine.js` (escape loop, penalties, renderers), `src/media.js` (scenes), `src/q_h0.js` (question format spec), `src/skills.js` (skill tags), `tools/check_content.js` (quality checks), `docs/LORE.md` (story).*
