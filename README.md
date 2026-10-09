# 🧬 Biology Study Pals

A cosy kawaii-style biology escape-room adventure for **Secondary 4–6**. It is framed as exploring, not exam drilling, but the content follows the local senior secondary Biology curriculum (compulsory part) closely, so teachers can map it to lessons. English only. One file (`index.html`), no install, no build step for players.

- **Play:** open `index.html` in any browser (or the GitHub Pages link).
- **Auto-deploy:** every push or merged PR on `claude/wonderful-turing-8ehr7a` rebuilds the game, runs the checks and publishes it to GitHub Pages (`.github/workflows/deploy.yml`). Work on other branches goes live once it is merged.
- **Session length:** one stage ≈ 15–20 minutes. One stage a day is the whole goal.

## 19 topics, 60 stages (escape rooms)

Every topic is open, so students can jump to the one their class is on (the map has Part I–IV tabs). Inside a topic, stages unlock in order; the last stage is a ⚔️ **boss stage** guarded by a **Murk Warden**.

| Part | Topics (stages) |
|------|-----------------|
| I. Cells and Molecules of Life | 1 Molecules of Life (3) · 2 Cellular Organisation (3) · 3 Movement Across Membranes (3) · 4 Cell Cycle and Division (3) · 5 Enzymes and Metabolism (3) · 6 Photosynthesis (6) · 7 Cellular Respiration (3) |
| II. Genetics and Evolution | 8 Basic Genetics (3) · 9 Molecular Genetics and Biotechnology (3) · 10 Biodiversity and Evolution (3) |
| III. Organisms and Environment | 11 Life Processes in Plants (3) · 12 Nutrition in Humans (3) · 13 Gas Exchange in Humans (3) · 14 Transport in Humans (3) · 15 Reproduction, Growth and Development (3) · 16 Coordination and Response (4) · 17 Homeostasis (2) · 18 Ecosystems (3) |
| IV. Health and Diseases | 19 Health and Diseases (3) |

## Question quality

- 262 extra questions were written from a core knowledge base (compulsory part, 30 chapters). Wrong options use real student mistakes (e.g. "bile digests fat", "antibodies kill bacteria", "the rib cage expands"), and correct answers use the wording markers accept (water potential, denatured, complementary, epithelium/endothelium one cell thick, net gas exchange).
- Existing questions and notes were checked against the list of rejected wording and corrected where needed.
- Diagrams and simulations use a textbook-illustration style (real structures, shading and detail) so students can link them to real specimens and exam diagrams; characters and pets stay cute.

## Rooms and questions

- **8 room scenes** (library, science lab, greenhouse, inside a cell, kitchen, underwater pond, secret garden, clinic), so stages feel different.
- **Each lock needs 3 questions in a row** (15 per visit), climbing in difficulty inside the lock. **Each lock has one skill theme**: 🔤 Words → 💡 Concepts → 🔍 See it → 📈 Data → 🧪 Investigate (shown as a small label on the lock). If a stage has fewer than 3 questions of a theme, that lock borrows from the nearest theme and shows no label. Lock 1 never tests the same term twice. Every question's skill was hand-reviewed and lives in `SKILL_TAGS` in `src/skills.js` (append a letter when you add a question); `node tools/check_content.js --unsure` reports coverage. Students see friendly labels (🌱 Easy, 🌿 Medium, 🔥 Hard, ⭐ Expert) instead of Bloom's levels. Progress on a half-open lock is saved.
- **2,084 core questions** (31–37 per stage) including **78 graph-reading questions** (drawn to scale: potato-strip osmosis, enzyme curves, absorption spectra, GP/RuBP, lactic acid, and more).
- **Spelling practice**: every stage's key terms become "type the word" locks and "which spelling is correct?" checks (British and American spellings are both accepted, e.g. haemoglobin / hemoglobin). They appear only in the Words lock (lock 1); also a Spelling bee round in Cell Rush.
- 📓 **Study Journal:** summary, key rules and key terms for every stage.

## 🏠 Layout, art and dress-up

- **Mochi-style home with a bottom tab bar** (🏠 Home · 🗺️ Stages · 🎮 Practice · 👗 Dress up · 🐾 Pets · 🏆 Rewards · 🔬 Lab), so each screen is short and students rarely scroll. Home leads with the Lucky Capsule and the **one next step**; everything else (streak, daily mission, class board, featured pal, tips) sits in **fold bars**: an icon, a short title and one peek number, remembered open or closed per student. Pals are grouped into rarity folds, and Practice's mastery chart folds away too.
- **Art style:** characters are soft, squishy one-piece blobs with thin warm-brown outlines, big blush, nub arms and sparkles (in the style of the Mochi Science Pals game).
- **👗 Dress up:** a fitting room with 7 slots (hats, wigs, glasses, outfits, accessories, hand items, frames). Tap to try on for free, tap again to buy with 🌰. 35 items, including 🔥 trend / meme items (Pop-Star Swoop wig, Moonwalk jacket + fedora + sparkly glove, Six-seven signs, Deal-with-it shades, Blind-box monster hood, Dubai chocolate, Aura +1000 chain, idol twin-tails, wolf cut, ballerina cappuccino tutu…) and 🇭🇰 Hong Kong items (pineapple-bun hat, milk tea, ding-ding tram tee, lucky mahjong tile).
- **⏱️ Escape or 📖 Study mode:** a switch on Home and Stages. Study mode skips the escape room: students answer the stage's 15 questions as a calm series with no time limit. Every answer shows the explanation; wrong ones come back once as a second chance at the end. Finishing the series completes the stage (stars come from first-try answers), and mistakes go to the Mistake Notebook.

## 🎧 Words and fun facts

- 🔊 **British pronunciation** (normal and 🐢 slow, Web Speech API) for every key term in the Study Journal and on spelling locks.
- 🎧 **Word Dictation** mode: 10 words a round from any topic or from *My missed words*. Two modes: listen and spell, or read the meaning and spell. 2 tries per word, letter boxes, a hint, and a "so close!" nudge for near-misses. Words missed here or in spelling locks come back until spelled right twice. A perfect round gives a 🎁 capsule.
- 🧭 **Study planner** (📖 Study mode → Stages tab). **Every topic and section is open.**
  - Students pick a **topic** (or one section of it) and a **level**: 🌱 Easy (Bloom 1–2: key words and facts), 🌿 Medium (3–4: explain, apply, read data) or 🔥 Hard (5–6: analyse, evaluate, investigate). That's it.
  - The game **mixes the exercise** (12 questions): a weighted blend of 💡 Concepts, 📈 Data, 🧪 Investigate and 🔍 See it (about 5 : 2 : 2 : 2), plus at most 2 spellings at Easy. Questions not yet mastered and not seen recently come first, so each new exercise brings different questions. The finish screen offers 🎲 New mix and a step up to the next level.
  - With a section chosen, a "full section run" link plays the old all-level series that completes the section.
  - Only that full section run finishes a section (stars, item, badge). Level exercises give mastery, chestnuts and streak days.
- 🔥 **Hard level: higher-order formats** (`src/q_h1–4.js`, built with `KH()`). Labels are playful and never mention exams: 🧩 Which are true? · ⚖️ True… and why? · 📊 Table detective · ↔️ Spot the difference · 🌍 Real-world puzzle · 🔎 Spot the flaw · 🔗 Chain reaction (dials that put cause → effect in order).
  - Every wrong option names the misconception or data trap it targets: "🪤 Why that one's a trap" on a wrong pick, plus a fold listing all of them.
- 🎬 **Media questions** (`src/q_m1–4.js` + 29 in `q_h*`, about 150 in all; the engine is `src/media.js`):
  - 🕵️ **Case files:** evidence cards, sometimes with a table or graph (e.g. a collapsed footballer's blood test, a cheese maker's three days, a measles outbreak).
  - 🔬 **Virtual labs:** observe and measure in drawn scenes, some animated:
    - pondweed / liver / yeast tubes bubbling against a 10-s clock;
    - a respirometer or potometer bead in time-lapse;
    - a 6-s heart trace;
    - root-tip mitosis fields, onion cells in sucrose, an eyepiece graticule;
    - agar plates with clear zones, a quadrat, a chromatogram with a ruler;
    - family trees and DNA-profiling gels.
    - Animated scenes have a "Can't watch it? Read what happens" text version.
  - 📈 **Pick the graph:** the four choices are mini graphs, some with a dashed "before" line, e.g. "twice the enzyme, same substrate".
  - 📈 **Graph detective:** questions on a real plotted graph.
  - 🗂️ **Sort it:** put 4–7 cards into 2–5 groups.
  - 👆 **Tap it:** tap the right cell, spot, person, gel lane, bar or point on a graph.
  - They work in Study, escape locks (the torch power-up places a card or removes a wrong target), the Mistake Notebook and Bookmarks.
- 👥 **Friends** (signed-in students, up to 5) on Home, in the left column under the pal room. Students share a 6-character friend code, then see each friend's pal, streak, stages and effort points ("✓ studied today" / "last studied 3 days ago") and send one preset cheer a day ("🔥 Keep your flame going!"). Cheers they receive pop up on Home. No free-text messages. Needs the updated `server/Code.gs`.
- 🔖 **Bookmarks:** a 🔖 Save button on every question (escape locks, Study mode, Mistake Notebook). 🎮 Practice → 🔖 Bookmarks lists saved questions by topic and runs redo rounds of up to 10, least-practised first. Up to 200 bookmarks.
- 💬 **Chat card** on the map: your Study Pal shares biology fun facts (many with Hong Kong examples) and personal encouragement (streak, mistakes to fix, next stage). It changes every 20 s; the same facts appear as 💡 *Did you know?* in the Journal.
- 🔥 **Streak bonus:** chestnut rewards grow 5% per streak day, up to ×1.5. Streaks also earn capsules (see Biology Capsule Lab).

## 🔬 Simulation Lab (🔬 Lab tab in the bottom bar)

Interactive models for the whole HKDSE Compulsory Part **"Organisms and Environment"**, grouped into six section chips: 🌿 a. Plants · 🍙 b. Animals · 🌸 c. Growth · 🧠 d. Senses (coordination) · ⚖️ e. Balance (homeostasis) · 🌍 f. Ecosystems. Each simulation page has the same picture-first layout for second-language learners:

1. **🔮 Predict first** (one question, then the model unlocks).
2. **The model**: picture + controls + live readings + "🧠 What's happening?" cause → effect chain.
3. **📖 Key words**: picture chips with a one-line meaning and 🔊.
4. **🎯 Challenge (about 15 min)**: 4–5 missions (Explore → Measure → Investigate → Explain → Apply → 🧠 Exam check). Most tasks can only be done by *using* the model: "get the reading into the green zone" goals with a live gauge, "read it off the graph" numbers, and 🔒 tasks that open after the student tries something. Keyword chips speak and explain the word. A sticky task bar keeps the current task in view while students work on the model. Rewards: +2 🌰 per task, +5 per mission, +20 for finishing; stars for few mistakes and few hints. Progress is saved per student (`S.simc`).

How to add or extend a simulation (design logic, API, task types, visual-aid rules, checklist): **[`docs/SIM_LAB_GUIDE.md`](docs/SIM_LAB_GUIDE.md)**. Check with `NODE_PATH=$(npm root -g) node tools/check_lab.js` (Playwright: every model renders at phone width, every challenge is valid and can be finished).

- **🫁 Breathing:** an animated chest (ribs, intercostal muscles, diaphragm, lungs, trachea) with auto or hand-controlled breathing and an exercise mode. A live graph plots **pressure in the lungs against time** (relative to atmospheric, with lung volume as an option), and the steps of inhalation/exhalation update as they happen.
- **👁️ Pupil reflex:** a light slider (dark room → bright sun, plus a torch flash). The pupil changes size after a short reflex delay; circular vs radial muscles light up, the reflex arc animates, and a bar shows how much light reaches the retina.
- **🔍 Focusing and glasses:** a ray diagram of the eye (cornea, lens, ciliary muscles, suspensory ligaments, retina) for a distant tree or a near book. The lens thickens or thins by accommodation; choose a normal, short-sighted or long-sighted eye and a concave or convex lens. The focus point, a verdict (in front of / on / behind the retina) and a blurred or clear "What Mochi sees" view update live. Calculated with real paraxial ray tracing.
- **👂 Hearing:** a labelled ear (pinna, canal, eardrum, ossicles, oval window, cochlea, semicircular canals, auditory nerve, Eustachian tube). Pitch and loudness sliders (with presets and a real tone to hear); sound waves, eardrum and ossicles vibrate, and an uncoiled cochlea shows which hair cells respond (high pitch at the base, low at the apex) with impulses to the brain. A hearing-damage switch shows why loud music can take away high pitches.
- **🫧 Cell membrane (fluid mosaic model):** a moving phospholipid bilayer with channel and carrier proteins, a glycoprotein and cholesterol (tap a part to learn it). Send O₂, water, glucose, ions, an active-transport ion (with ATP) or a big protein molecule and watch the route each takes; counters show outside vs inside. A temperature slider changes fluidity, and above 50 °C proteins denature and the membrane leaks.

- **💧 Osmosis with dialysis tubing (Topic 3):** an experimental set-up (sucrose solution in the tubing) next to the control (distilled water in the tubing), both in beakers of distilled water. The capillary level rises live against the initial-level mark.
  - **Zoom in:** the tubing wall shows water molecules passing through tiny pores while sucrose is blocked, with in/out counters and the net-flow arrow.
  - **Level–time graph:** keeps the last 3 runs as ghost lines, so "steep = rate" and "levels off = final level" can be compared.
  - **Five picture cards** explain the idea: different water potentials → pores → net water in → rises then slows → control.
  - **Fair-test table:** change one variable (concentration, tubing length, volume of sucrose solution, volume of distilled water, temperature) and see whether it changes the **rate**, the **final level**, or neither.
- The Body Pal simulation that used to live here is now the **living Study Pal** (see 🐾 Study Pals below).
- **🌱 Phototropism (Topic 16):** the five classic coleoptile investigations on a timeline (Darwin 1880, Boysen-Jensen 1913 ×2, Paál 1919, Went 1926).
  - **Predict first:** students tap each set-up (A–D) to predict "bends left / grows straight / bends right / no growth".
  - **Run:** the light shines from the left (or the scene goes dark), the coleoptiles grow and bend over "2 days", and **red dots show auxin** flowing down (and getting stopped by mica). Predictions are marked ✅/❌.
  - **Explain:** the conclusions appear as icon cards, plus a zoom picture of light-side vs shaded-side cells elongating.

## 🎵 Music

Eight **original** tunes composed for this game in a cheerful Mochi-like mood (marimba, toy-piano bells, flute, plucked strings, soft drums), generated live in the browser. The tune changes with the room type, with special tracks for boss stages, Cell Rush and the Mistake Notebook. The official Mochi soundtrack is not used (copyright).

## 📕 Mistake Notebook

Every wrong answer (escape rooms, Cell Rush, incidents) is saved on the device. The notebook groups them by topic; students revise up to 10 at a time, and a question is cleared after they get it right twice in a row (without hints).

## Characters 🥹

**Story: The Codex of Life** (full bible in [`docs/LORE.md`](docs/LORE.md)).
- **The world:** on the living world of **Vita**, the Murk (a grey fog of guessing and muddled ideas) tore the Codex of Life into 60 pages and sealed them in locked rooms across 4 Realms: the Cellspire, the Helix Vaults, the Living Wilds and the Bastion.
- **The player:** students are apprentice **Keepers**. Every stage intro opens with its page of the story, read by 📜 **the Codex**, and every boss is a **Murk Warden** made of one common misconception.
- **The cast:** the old side characters were retired. The student's own **Study Pal** (Mochi first) does all the talking, hints and cheering, and calls the student by name. A 6-card picture story opens from the Home banner (until read) and the ☰ menu.
- Mochi reacts with many moods: nervous, crying, shocked, brave, sparkly-eyed and sick.

## Game systems

Same as the physics game: 20-minute LED timer (overtime allowed), 1–3 ★, gentle anti-guessing penalties (no wait or time loss over 15 s: −10 s, reshuffle, short jams, strikes, chestnut fine, and guessing makes the lock **slip back a notch** so students answer one bonus question), random spooky-but-friendly incidents, ⚡ **Cell Rush** (60-second mixed rush with test-tube colours and organelle spotting), the shop (outfits and power-ups), a study streak with ❄️ Streak Freezes, a daily mission, daily snack chest and a class leaderboard.

## 🌰 Chestnuts (economy fix)

Students reported that chestnuts were too hard to get: a whole stage paid only 15 🌰. Now:
- **+3 🌰 for every question right on the first try** (+1 if already mastered), with a "+3" that flies into the counter.
- Clearing a new stage **+30** (boss **+50**), first revision stage of the day **+25**, replays **+10**; specimens **+2**, Bio-Machine **+5**, daily mission **+40**, every trophy **+30**.
- Being sick now reduces rewards to ×0.8 (was ×0.5) and happens less often.
- The top-bar counter always updates straight away; the shop shows "Need 🌰 N more" with an *Earn chestnuts* button and a "How do I get chestnuts?" guide; unlock pop-ups no longer cover the shop.

## 🔦 Escape room 2.0 (discover → manipulate → escape)

- **Discovery:** 3 specimens shimmer faintly in each dark room. Sweep the torch and tap them; each specimen card carries a key term from the stage.
- **Process:** the ⚙️ **Bio-Machine**. Wire each specimen to its function (one socket is a decoy). Each right cable fills the glowing tank; a wrong cable sparks (−10 s in Escape mode).
- **Escape:** the door needs both the 5-digit code from the locks **and** power from the machine. Goal chips (🔦 Specimens · ⚙️ Machine · 🔓 Locks · 🚪 Escape) show progress; opened lock objects glow in the scene.

## ✨ Look and feel

- **Pals:** soft 2.5D shading (light top-left, plum shadow, sheen and rim light), plum line art instead of dark brown, bigger sparkly eyes set a little lower, plush ears, a pink star hair clip and a floating sparkle buddy. The eyes are the regular cute style (dark with two highlights); star eyes are no longer used.
- **UI:** soft frosted panels without thick borders, one glossy primary button style (soft secondary buttons), a decluttered top bar (🔥 streak, big 🌰 counter, 🎁, and a ☰ menu for trophies, account, journal, save code, leaderboard, music and sound), a glowing pill behind the active bottom tab, and a full-bleed room where the pal pops out of the frame.
- Checked at iPhone (390 px), iPad portrait (820 px) and landscape (1180 px), and desktop (1440 px): no sideways scrolling.

## 🐾 Study Pals (27)

Your **Study Pal** is the character you raise: it lives in the room, talks in the dialogue, wears your outfits and appears in your avatar. Mochi is the starter pal.

- **19 animal pals from the S1 Science game** (Mochi, Matcha, Sakura, Pudding, Soda, Taro, Kinako, Goma, Mikan, Nori, Ume, Wata, Chiku, Kuma, Nova, Petal, Riccio, Finn, Luna) and **8 new biology pals**: Hachi the honeybee, Kame the turtle, Noro the sloth, Chiro the bat, Tako the octopus, Kurage the jellyfish, Hikari the firefly (legendary) and Tardi the tardigrade (mythic).
- Every pal shares the same squishy body, so every outfit fits. Each has a short story, a **real biology fact** (e.g. octopus blood uses copper-based haemocyanin; fireflies make light with luciferase and ATP), a favourite food and a small **perk** (more XP, more chestnuts, cheaper food, more happiness from care, slower happiness drop, or bonuses in the Mistake Notebook, dictation or Cell Rush). Only the active pal's perk works.
- **Rarity:** common · rare · epic (reach the goal, then adopt with 🌰) · legendary (arrives by itself after a very hard goal) · mythic (🌰 only). Legendary pals glow gold and mythic pals have a turning rainbow ring.
- **🫀 A living body (Topics 12, 13 & 17, plus sleep).** The active pal's body runs on the Body Pal engine (`src/bodypal_engine.js`, from `New update direction.md`): **fuel** (glucose, insulin, liver glycogen), **water** (breath, skin, urine and sweat; thirst at 1 % of body mass), **sleep** (two-process model, 90-minute cycles, caffeine half-life 5 h, evening screen light) and **teeth** (plaque pH, the critical pH 5.5, saliva, fluoride).
  - **Pal time** runs while the pal is on screen (Home or Pals): 1 pal minute per second, ⏩ Fast = 10 per second, ⏸ Pause, +1 hour. It pauses when you leave, so a pal is never neglected while you study. It also pauses during the pal's questions.
  - **Learn by touching:** tap the pal's **head** (sleep pressure, body clock, caffeine, focus), **mouth** (plaque pH, saliva), **heart** (heart and breathing rate), **tummy** (glucose trend, food in the gut, liver glycogen) or **hands** (water deficit, sweat). The bubble shows the live reading and *why* it is happening right now. A pat gives a little happiness.
  - **It looks alive:** it breathes at its breathing rate, a little heart beats at its heart rate, it bounces and sweats while playing outside, the room goes dark at pal night, and it **dozes off by itself** when sleep pressure gets very high.
  - **Care:** 🍱 Feed (8 meals, 8 snacks, 7 drinks, mostly Hong Kong food; gulp or sip), 🪥 brush, 📱 screens on/off, 🏃 play outside (walk / jog / sprint), 🛏️ bedtime with or without an alarm, ⏭ sleep until morning. Each 🔍 food card shows what's inside and what it will do inside the pal (glucose speed, stomach half-life, sugar for plaque, water, caffeine), with no energy numbers and no good/bad labels. Favourite food = double happiness.
  - **🔬 Inside your pal:** live traces (glucose, plaque pH, sleep pressure, sleep stages, water deficit, caffeine), **15 Why cards** quoting the pal's own numbers, and a **sleep report** every morning.
  - **🧠 Questions from your pal's day** (last 48 pal hours, focus-gated, "what if" re-runs of the pal's own day) and 📚 22 learning objectives with a Leitner learner shared by all pals.
  - **Moods** come from the body: hungry, thirsty, sleepy, groggy, asleep, playing outside, lonely (low happiness), happy, overjoyed, sick. ❤️ Happiness still drifts down slowly; pats, food, play and Term Match raise it.
  - **XP:** every finished activity gives XP (5 + 2 per first-try answer); a pal with low **focus** (tired, thirsty, low glucose) earns half. Studying never changes the body.
  - Save: `S.pals[id].body = { opts, log, now }` (the action log, replayed on load; rebased every 3 pal days so it stays small). The old Lab save (`S.bodypal`) moves into the active pal automatically.
- **🃏 Play:** Term Match (match 4 key terms from your stages to their meanings) raises happiness and XP. Tapping the pal in the room gives a little happiness too.
- **Evolution:** Baby → Junior → Master at Lv 5 / 10 (legendary Lv 7 / 13, mythic Lv 8 / 15) plus chestnuts. Juniors get a gold star mark; Masters get a golden halo and sparkles. Epic, legendary and mythic unlocks use the gift-box ceremony.
- **🌟 Featured Pal advert** on Home shows a legendary or mythic pal you don't own yet, with its perk, progress and ◀ ▶ to browse.
- The bottom bar now has one **🐾 Pals** tab with three parts: Study Pals · Dress up · Pets.

## 🎨 Icons

Every emoji is replaced by an original chunky 2-tone icon set (about 250 icons, flat colours with a darker "depth" layer and a white shine, in a Duolingo-like style), so the game looks the same on every phone and computer. The icons live in `src/icons.js`; a small observer swaps emoji in any text the game shows, so new text with emoji is converted automatically.

## 🦜 Pets (25)

Mochi can adopt 25 rare animals from across the animal kingdom (mammals, birds, reptiles, amphibians, fish, insects, an arachnid, a crustacean, a mollusc, a cnidarian, an echinoderm, a tardigrade and a horseshoe crab). Each has a Mochi-style drawing, its scientific name, home, conservation status and a **real biology story** linked to a syllabus topic (for example the fennec fox's ears and vasodilation, the octopus's blue haemocyanin, the firefly's luciferase).

- **5 Hong Kong species** (👑 Legendary): Chinese white dolphin, black-faced spoonbill, Romer's tree frog, golden coin turtle and Chinese horseshoe crab.
- **13 pets unlock only in ⏱️ Escape mode** (Escape clears, no-hint escapes, clean escapes, boss wins); the other 12 come from studying, streaks, Dictation, the Mistake Notebook, Cell Rush and curing Mochi.
- The chosen companion lives in Mochi's room on Home; tap it to hear a fact. The 🐾 Pets tab has filters (Hong Kong, Escape only, Mine) and progress bars.

## 🩺 Mochi gets sick

Mochi sometimes wakes up sick (30% on a new day) or catches something after a stage (12%), at most once a day. The pal clinic shows the **symptoms** and a **test result**, and students pick from a 13-item medicine cabinet (antibiotics, antivirals, antifungal cream, deworming tablets, antimalarials, rest + paracetamol, ORS, vitamin C, iron, antihistamine, cooling, glucose, vaccine).

- 13 illnesses: viruses (cold, flu, dengue), bacteria (strep throat, Salmonella), a fungus, a parasitic worm, a protist (malaria), deficiencies (scurvy, anaemia), an allergy and homeostasis problems (heat exhaustion, low blood glucose).
- Every wrong choice explains why it can't work (e.g. antibiotics don't work on viruses, vaccines prevent but don't cure). A cure explains the biology and gives a prevention tip.
- While sick, chestnut rewards are halved. The chat card also shares biology moments from Mochi's daily life (brushing teeth, sleep and growth hormone, ADH, shivering…).

## 🔥 Study streak, ❄️ Streak Freezes and the daily mission

- **The streak grows on days you study**: finish any activity (escape stage, study series, Cell Rush, dictation or notebook round). Just opening the game no longer counts. A full-screen **streak-up ceremony** plays the moment the streak grows: embers fly into a cute flame, an odometer rolls the old number to the new one (99 → 100), a shockwave bursts, and this week's dots light up. Milestones (3/7/14/21/30/50/75/100/150/200/365) add a title slam, light rays, two impact frames and confetti. The flame evolves at 7 (gold), 30 (blue) and 100 days (mythic). Tap to skip; reduced-motion devices get a still card.
- **❄️ Streak Freeze**: everyone starts with **3**; **1 free freeze each new month** (never above 3); extra ones cost 🌰 150 (tap the ❄️ on the streak card). A missed day uses a freeze automatically (2 missed days use 2). Frozen days show as ❄ on the week row.
- **Streak-risk reminder**: until today's study is done, Mochi appears at the top of Home with the time left today and freezes left, plus *Next stage* and *60-second Rush* buttons. It turns red and pulses in the last 3 hours or when no freezes are left.
- **📅 Daily mission**: one story mission a day (Detective Mochi, Power cut!, Radio host Mochi, Mai Po expedition, Lab day…), aimed at what each student avoids or finds hardest: a stage in their **weakest topic**, 3 Mistake Notebook questions, 5 dictation words, an 80+ Cell Rush, 2 Lab simulations or a brand-new stage. Reward: 🌰 40 + a 🎁 capsule.
- **💚 Health tips by time of day** (device clock, under Mochi's room): breakfast and blood glucose, water and kidneys, exercise and blood flow, the 20-20-20 eye rule (ciliary muscles), and sleep by 10:30 on school nights. After 10 pm a gentle "time to rest" pop-up (sleep and memory) appears once an hour; after 40 minutes of play a brain-break reminder appears.

## 🧠 Learning rewards (Study mode)

- **Guess alert**: a right multiple-choice answer given faster than anyone could read the question (about 2.5–5 s depending on length, +1 s with a picture) doesn't count for mastery or first-try stars. 5 or more cap the series at 1★.
- **🤔 "Why?" check**: after each study series, students pick the right explanation for 2 questions they got right first try. Right = +5 🌰; wrong = the question goes to the Mistake Notebook (the answer was remembered but not understood).

## 🏆 Trophies (31)

Four shelves (Daily habits, Adventure, Brain power, Just for fun) as **trading cards**: a title bar with a rarity symbol (● bronze, ◆ silver, ★ gold, ✦ legendary), a lab-scene art window, the goal, then a date stamp or progress bar and the +30 🌰 reward. Card finishes: matte bronze, silver, embossed gold with a light sweep, and a rainbow legendary. Locked cards reveal step by step: under 25% a dark silhouette behind frosted glass with a padlock, 25–60% colours bleed through, 60–90% thin glass, 90%+ fully visible with a pulsing "Almost there!". The map shows the 4 closest to unlocking. Each trophy gives 🌰 30 and a 🎁 capsule.

## 🎰 Daily Lucky Capsule (Home)

The big banner at the top of 🏠 Home is a gachapon machine (it replaces the old daily snack chest).
- **One free draw per study day**, unlocked by today's first finished activity, so every draw is also a streak day.
- **The draw:** the crank turns, capsules mix, one drops and bounces, then it can **upgrade** colour (pink → blue → purple → gold → rainbow) before bursting into a prize card. Legendary and Mythic pulls get a banner, a shake and extra confetti.
- **Luck rises with the streak** at 20 / 40 / 60 / 80 / 100 days (shown on the banner as an odds bar):

  | Streak | Common | Rare | Epic | Legendary | Mythic |
  |---|---|---|---|---|---|
  | 0–19 days | 60% | 28% | 9% | 2.5% | 0.5% |
  | 20–39 | 52% | 28% | 13% | 5% | 2% |
  | 40–59 | 44% | 28% | 17% | 8% | 3% |
  | 60–79 | 36% | 28% | 21% | 11% | 4% |
  | 80–99 | 28% | 28% | 25% | 13% | 6% |
  | 100+ | 20% | 28% | 28% | 16% | 8% |

  Epic or better is guaranteed within 10 draws.
- **Prizes:** chestnuts, food for your pal (saved in a pantry; feeding from the pantry is free), Streak Freezes, outfits you don't own yet, biology card capsules, and **3 capsule-only Study Pals**: Mito the mitochondrion and Chloe the chloroplast (legendary) and Helix the DNA pal (mythic, the rarest prize).

## 🏆 Home leaderboard

A class leaderboard card on Home shows the top 5 for 🌟 effort, 🔥 streak or 🐾 collection, plus your own rank and how far it is to the next place. Guests see a sign-in teaser.

## 📊 Teacher statistics (teacher accounts only)

Teacher accounts (staff role in the Users tab, or listed in `TEACHER_EMAILS`) get an extra **📊 Stats** tab and a menu tile:
- Filters: class and period (7 / 30 / 90 days / all).
- Summary: students active, activities finished, questions answered, accuracy, average streak.
- Charts: accuracy by topic (with the weakest topic called out), activities per day, how students practise, accuracy by class.
- Most-missed questions (with the question text), a sortable student table (cards on phones), students not active, and a CSV download.
- Needs the latest `server/Code.gs` deployed (it adds the `stats` action). Data is fetched from your private sheet and never stored on the device.

## Landing page

After signing in (or choosing guest), everyone lands on 🏠 Home. New players also go to Home after the welcome screen.

## 🃏 Biology Capsule Lab (40 cards)

Card capsules are opened from the Lucky Capsule banner on Home, the 🎁 button in the top bar or the Rewards tab.

- **40 collectible trading cards**, each a real biology term, structure or concept with a short, precise description (e.g. *Mitochondrion*, *Haemoglobin*, *Krebs cycle*, *PCR*, *CRISPR-Cas9*, *Chinese pangolin*, *Endosymbiosis*).
- **5 rarities:** Common 16 (matte bronze) · Rare 12 (silver holo, sweeping shine) · Epic 7 (embossed gold glow) · Legendary 3 (animated rainbow holo) · Mythic 2 (cosmic foil with a turning rainbow ring and twinkling stars). Locked cards are dark mystery foil; Legendary and Mythic stay fully hidden.
- **Card layout** (like the S1 Science trophy cards): title bar with rarity symbol, illustration window, category and rarity, description, number and a collected stamp. Tap a card in the collection to read it; drag or tilt it for a 3D holo effect.
- **Odds:** 58% Common, 27% Rare, 10% Epic, 4% Legendary, 1% Mythic. **Pity:** Epic or better is guaranteed every 10 capsules, Legendary or better every 40. Duplicates become 🌰 (5 / 10 / 25 / 60 / 120).
- **Streaks feed the machine:** +1 capsule on every 3rd streak day, +2 on days 7, 14, 21, 30, 50, 75, 100, 150 and 200, and **streak luck** (+0.4% better odds per streak day, up to +8%). Other sources: stages, bosses, the daily chest, Cell Rush 120+, perfect dictation, daily missions, trophies.
- Saves from the old 20-item collection are converted automatically (each old item became the matching biology card).

## 🧭 Layout 3.0: one home for your pal, one place to collect (2026-10-09)

Students said they got lost: Home and the Pals tab both showed the pal, and Rewards overlapped with collecting.

- **Bottom bar: 5 tabs**: 🏠 Home · 🗺️ Stages · 🎮 Practice · 🎒 Collect · 🔬 Lab.
- **🏠 Home** has two views:
  - **☀️ Today**: the living pal with picture need-bars (⚡ 🎯 ❤️ 🍽️ 💧 😴) and pal-time controls (⏸ ▶ ⏩ +1h). Below it:
    - **Today's plan**: 📖 Study → 🍱 Care → 🎯 Mission → 🎰 Capsule. Done steps turn green ✓, only the next one glows, and one big button names the next action.
    - **💗 Look after** tiles: Feed, Drink, Play outside, Brush, Screens, Bedtime, Term Match, Dress up.
    - Everything else in fold bars: Lucky Capsule, streak, mission, friends, leaderboard, tips, story.
  - **🔬 Inside \<pal\>**: the body bars, live traces, Why cards, the sleep report and questions from the pal's day.
- **🎒 Collect** (was Pals + Rewards): 🐾 Pals (active pal card with level and evolve, featured pal, collection) · 👗 Dress up · 🦜 Pets · 🃏 Cards (trophies, biology cards, backpack).
- **Help that shows instead of tells:**
  - a **spotlight tour** on the first visit: the screen dims and 6 parts light up one by one with a numbered bubble;
  - a **❓ picture guide** in the top bar: 6 cards drawn with the game's own art, swipe or Back/Next. It glows until opened once, and its last card replays the tour;
  - both are also in ☰ Menu (❓ How to play, 🔦 Show me around).
- **📋 Copy server code** for teachers: ☰ Menu, 📊 Stats, or the page link ending in `#server-code` (works signed out). It always holds the `server/Code.gs` built with this version.

## Saving

- **Cloud save fix (2026-10-09).** Busy students' saves had grown past the 49,000-character limit of one sheet cell. The server refused every save, so their streak, chestnuts and progress stopped updating for the class (leaderboard, friends, teacher stats, other devices). Fixed:
  - The cloud copy is now packed. Mastered questions and mistakes are grouped by stage; "recently seen" and half-finished locks are left out; the pal's learner history is trimmed. A very busy save drops from about 95,000 to about 30,000 characters, and nothing that matters is lost.
  - A failed save now shows a message, is retried after a minute, and is listed in 👤 Account.
  - Google sign-in only lasts about an hour. When it runs out, a **"Not saving to your class"** bar appears on every page, with a one-tap way to sign in again. Progress waits safely on the device until then.
  - A **new day while the game stays open** now runs the daily check (streak freezes, missed days) straight away.
  - Server (needs a redeploy of `server/Code.gs`): an oversized save still updates the summary columns, and the "last study day" is read correctly even when Sheets has turned it into a date.
  - **🔧 Check & restore (teacher, 📊 Stats):** a dry run first shows tiles and one line per student, then **✅ Restore** writes it. It never takes anything away. It covers:
    - **Records:** removes duplicate rows (an activity sent twice) and empty rounds; re-dates rows that were uploaded late (the upload time moves to a new "Uploaded" column); sorts rows by time.
    - **Students:** rebuilds streak, best streak and last study day; adds stages cleared and stars from Escape stages and full study sections; rebuilds a save for students who have records but no saved progress; refreshes the summary columns.
    - **Not covered:** chestnuts (they aren't in the records). They come back from each student's own device on the next sign-in.
  - **Activity records, fixed going forward:**
    - each row is dated when the activity ended and carries a Record ID, so a second upload is skipped;
    - empty rounds and Lab visits aren't logged; pal questions are ("Pal questions");
    - full stages are marked "Stage cleared", and a mixed series keeps its own label;
    - escape rows list only that run's wrong answers and have a start time; dictation has a start time and duration;
    - time is capped at 3 h per activity.
  - **No more lost progress between copies:** signing in merges the device copy and the class copy. The newer copy's chestnuts and settings win. The streak follows the copy that studied last, and everything earned (stages, stars, mastered questions, trophies, pals, cards, best streak) is kept from both.
  - **Guest mode on a class device** shows a blue "Playing as guest" bar with 🎓 Sign in. After signing in, guest progress found on the device can be added to the account (asked once).
  - Checks: `NODE_PATH=$(npm root -g) node tools/check_sync.js` (a fake class server with the same limit, two devices, a mocked clock).
- Auto-save to `localStorage` key `escapeGame_biology` (separate from the physics game), with a Resume prompt. Signed-in students save under their own key on the device **and** to the class sheet, so they can continue on any device.
- 🔑 **12-character save code** (e.g. `ABCD-EFGH-JKLM`) or a link ending `#ABCDEFGHJKLM`. It stores stages escaped per topic, the average star rating, locks open in the current stage, streak (up to 31) and Streak Freezes. The Mistake Notebook, trophies, collectibles and chestnuts stay on the device.

## 🔐 Class sign-in (Google) or guest mode

- **Start screen**: Mochi and the glowing Codex on a floating grassy island with drifting biology icons. Two choices: **Sign in with Google** (school account) or **🎒 Play as guest** (no Google account needed). The choice is remembered; 👤 in the top bar opens the account sheet (sync status, sign out, or sign in later).
- **Signed in** (students on the class list in the teacher's Google Sheet): progress syncs to the sheet, every finished activity is recorded (mode, topic, stage, answered, correct, accuracy, stars, time, wrong question IDs), and the **🏆 class leaderboard** opens: top 20 for 🌟 effort, 🔥 current streak and 🐾 collection, for "My class" or "Everyone", with a podium and a "only N more to pass #2" bar. If a device already has guest progress, the student is asked once whether to move it into their account.
- **Guests**: progress stays on the device (🔑 save codes still move it). No leaderboard and no class records.
- **Setup** (about 15 minutes, once): [`server/SETUP.md`](server/SETUP.md), server code [`server/Code.gs`](server/Code.gs). It reuses the S1 Science game's Users tab and Google Client ID; put the new Apps Script `/exec` URL into `BIO_CONFIG.API_URL` at the top of `src/auth.js` and rebuild. Until then (and always in the claude.ai preview) the game runs in guest mode. Student names and emails stay in the private sheet, never in this repo.

## ✨ UI 2.0

- "Clay" buttons and tabs with a darker bottom edge that sink when pressed; thicker glossy progress bars; speech bubbles that pop in.
- **Epic and legendary pets** arrive in a gift box that shakes 3 times, bursts open with light rays (and a gold shower for legendary), then the pet card flips in with a glowing aura.

## Editing

The page is assembled from `src/` by `python3 tools/build.py`. Content lives in `src/stages.js` and `src/stages2.js` (notes, rules, terms), `src/scenes.js` (rooms), `src/q_t*.js`, `src/q_graphs.js`, `src/q_graphs2.js`, `src/q_kb*.js`, `src/q_x1–4.js` and `src/q_h0–4.js` (questions; `q_x*` uses `KX()` and `q_h*` uses `KH()`, both of which set each question's skill directly; `KH()` formats are documented in `src/q_h0.js`), `src/graphs.js` (graph data) and `src/rush.js`. Daily systems (streak, freezes, mission, health tips) are in `src/daily.js`; sign-in, cloud save and the class leaderboard in `src/auth.js`; Study Pals in `src/pals.js`; icons in `src/icons.js`. Check content with `node tools/check_content.js`.

*Educational project with original kawaii-style characters and an original story world (The Codex of Life).*
