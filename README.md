# 🧬 Chiikawa Bio Escape

A cosy Chiikawa-style biology escape-room adventure for **Secondary 4–6**. It is framed as exploring, not exam drilling, but the content follows the local senior secondary Biology curriculum (compulsory part) closely, so teachers can map it to lessons. English only. One file (`index.html`), no install, no build step for players.

- **Play:** open `index.html` in any browser (or the GitHub Pages link).
- **Session length:** one stage ≈ 15–20 minutes. One stage a day is the whole goal.

## 19 topics, 60 stages (escape rooms)

Every topic is open, so students can jump to the one their class is on (the map has Part I–IV tabs). Inside a topic, stages unlock in order; the last stage is a ⚔️ **boss stage** guarded by Rakko.

| Part | Topics (stages) |
|------|-----------------|
| I. Cells and Molecules of Life | 1 Molecules of Life (3) · 2 Cellular Organisation (3) · 3 Movement Across Membranes (3) · 4 Cell Cycle and Division (3) · 5 Enzymes and Metabolism (3) · 6 Photosynthesis (6) · 7 Cellular Respiration (3) |
| II. Genetics and Evolution | 8 Basic Genetics (3) · 9 Molecular Genetics and Biotechnology (3) · 10 Biodiversity and Evolution (3) |
| III. Organisms and Environment | 11 Life Processes in Plants (3) · 12 Nutrition in Humans (3) · 13 Gas Exchange in Humans (3) · 14 Transport in Humans (3) · 15 Reproduction, Growth and Development (3) · 16 Coordination and Response (4) · 17 Homeostasis (2) · 18 Ecosystems (3) |
| IV. Health and Diseases | 19 Health and Diseases (3) |

## Rooms and questions

- **8 room scenes** (library, science lab, greenhouse, inside a cell, kitchen, underwater pond, secret garden, clinic), so stages feel different.
- **Each lock needs 3 questions in a row** (15 per visit), climbing in difficulty. Students see friendly labels (🌱 Easy, 🌿 Medium, 🔥 Hard, ⭐ Expert) instead of Bloom's levels. Progress on a half-open lock is saved.
- **981 core questions** (15–20 per stage) including **78 graph-reading questions** (drawn to scale: potato-strip osmosis, enzyme curves, absorption spectra, GP/RuBP, lactic acid, and more).
- **Spelling practice**: every stage's key terms become "type the word" locks and "which spelling is correct?" checks (British and American spellings are both accepted, e.g. haemoglobin / hemoglobin). Up to 3 per visit; also a Spelling bee round in Cell Rush.
- 📓 **Study Journal:** summary, key rules and key terms for every stage.

## 🎵 Music

Eight **original** tunes composed for this game in a cheerful Chiikawa-like mood (marimba, toy-piano bells, flute, plucked strings, soft drums), generated live in the browser. The tune changes with the room type, with special tracks for boss stages, Cell Rush and the Mistake Notebook. The official Chiikawa soundtrack is not used (copyright).

## 📕 Mistake Notebook

Every wrong answer (escape rooms, Cell Rush, incidents) is saved on the device. The notebook groups them by topic; students revise up to 10 at a time, and a question is cleared after they get it right twice in a row (without hints).

## Chiikawa emotions 🥹

Chiikawa reacts with many moods (nervous, crying, shocked, brave, sparkly-eyed). Hachiware gives hints, Usagi yells "Yaha!", Momonga shows off, Kuri-Manju brings tea, **Shisa** runs the shop and **Rakko** guards every boss stage. All characters are original Chiikawa-style drawings, not official artwork.

## Game systems

Same as the physics game: 20-minute LED timer (overtime allowed), 1–3 ★, gentle anti-guessing penalties (no wait or time loss over 15 s: −10 s, reshuffle, short jams, strikes, chestnut fine, and guessing makes the lock **slip back a notch** so students answer one bonus question), random spooky-but-friendly incidents, ⚡ **Cell Rush** (60-second mixed rush with test-tube colours and organelle spotting), Shisa's shop (outfits and power-ups), daily streak with shields, daily snack chest and a class leaderboard.

## 🏆 Trophies (26)

Four shelves (Daily habits, Adventure, Brain power, Just for fun) with Bronze, Silver, Gold and Legendary trophies. Each is a drawn cup with a character inside, a rarity ribbon and a shine; gold and legendary ones glow. The map shows the 4 closest to unlocking. Each trophy gives 🌰 30 and a 🎁 capsule.

## 🧸 Capsule collection (20)

Students earn 🎁 capsules (first escape = 1, boss = 2, sometimes on replays, daily chest, 120+ in Cell Rush, every trophy) and open them for collectibles:

- **15 common** biology-snack items (Mitochondria Mochi, Ribosome Boba, Villi Plushie…).
- **5 ✨ rare** Gen-Z-style items with holographic cards: Powerhouse Era holo photocard, secret blind-box figure, Aura +1000 bag charm, Chloroplast matcha latte, Y2K flip-phone DNA charm.
- About 1 in 12 pulls is rare, with a guaranteed rare within 12 capsules. Duplicates become 🌰 5.

## Saving

- Auto-save to `localStorage` key `escapeGame_biology` (separate from the physics game), with a Resume prompt.
- 🔑 **12-character save code** (e.g. `ABCD-EFGH-JKLM`) or a link ending `#ABCDEFGHJKLM`. It stores stages escaped per topic, the average star rating, locks open in the current stage, streak (up to 31) and shields. The Mistake Notebook, trophies, collectibles and chestnuts stay on the device.

## Leaderboard

Needs a free Google Sheet: see [`leaderboard/SETUP.md`](leaderboard/SETUP.md), then put the web-app URL in `LEADERBOARD_URL` in `src/engine.js` and rebuild.

## Editing

The page is assembled from `src/` by `python3 tools/build.py`. Content lives in `src/stages.js` and `src/stages2.js` (notes, rules, terms), `src/scenes.js` (rooms), `src/q_t*.js`, `src/q_graphs.js` and `src/q_graphs2.js` (questions), `src/graphs.js` (graph data) and `src/rush.js`. Check content with `node tools/check_content.js`.

*Fan-made educational project. Not affiliated with the official Chiikawa brand; Chiikawa belongs to Nagano.*
