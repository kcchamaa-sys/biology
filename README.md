# 🧬 Chiikawa Bio Escape

A Chiikawa-style escape-room game for **HKDSE Secondary 4 Biology**. English only. One file (`index.html`), no install, no build step for players.

- **Play:** open `index.html` in any browser (or the GitHub Pages link).
- **Session length:** one stage ≈ 10–15 minutes. One stage a day is the whole goal.

## 8 topics, 27 stages (escape rooms)

Every topic is open, so students can jump to the one their class is on. Inside a topic, stages unlock in order; the last stage is a ⚔️ **Boss stage** (guarded by Rakko). Photosynthesis is split into 6 stages.

| # | Topic | Stage 1 | Stage 2 | ⚔️ Boss stage |
|---|-------|---------|---------|---------------|
| 1 | Molecules of Life | Water and inorganic ions | Carbohydrates and lipids | Proteins, nucleic acids, food tests |
| 2 | Cellular Organisation | Microscopes and cell theory | Organelles; plant vs animal cells | Membrane; prokaryotes vs eukaryotes |
| 3 | Movement Across Membranes | Diffusion | Osmosis | Active transport and phagocytosis |
| 4 | Cell Cycle and Division | Cell cycle and mitosis | Meiosis and variation | Mitosis vs meiosis |
| 5 | Enzymes and Metabolism | How enzymes work | Temperature, pH, substrate | Inhibitors and applications |
| 6 | Photosynthesis (6 stages) | Leaf structure · Pigments and spectra · Light-dependent reactions · Calvin cycle · Limiting factors | | Investigating photosynthesis |
| 7 | Cellular Respiration | Aerobic respiration | Anaerobic respiration | Comparing processes; experiments |
| 8 | Nutrition in Humans | Balanced diet | Digestion | Absorption and assimilation |

## Rooms and questions

- **8 room scenes** (library, science lab, greenhouse, inside a cell, kitchen, underwater pond, secret garden, clinic), so stages feel different.
- **Each lock needs 3 questions in a row** (15 per visit), climbing Bloom's levels 1–6. Progress on a half-open lock is saved.
- **470 core questions** (15–20 per stage) including **62 graph-reading questions** (drawn to scale: potato-strip osmosis, enzyme curves, absorption spectra, GP/RuBP, lactic acid, and more).
- **Spelling practice**: every stage's key terms become "type the word" locks and "which spelling is correct?" checks (British/HKDSE spelling). Up to 3 per visit; also a Spelling bee round in Cell Rush.
- 📓 **Study Journal:** summary, key rules and key terms for every stage.

## 📕 Mistake Notebook

Every wrong answer (escape rooms, Cell Rush, incidents) is saved on the device. The notebook groups them by HKDSE topic; students revise up to 10 at a time, and a question is cleared after they get it right twice in a row (without hints).

## Chiikawa emotions 🥹

Chiikawa reacts with many moods (nervous, crying, shocked, brave, sparkly-eyed). Hachiware gives hints, Usagi yells "Yaha!", Momonga shows off, Kuri-Manju brings tea, **Shisa** runs the shop and **Rakko** guards every boss stage. All characters are original Chiikawa-style drawings, not official artwork.

## Game systems

Same as the physics game: 20-minute LED timer (overtime allowed), 1–3 ★, anti-guessing penalties (−20 s, reshuffle, jams, strikes, dim lights), random spooky-but-friendly incidents, ⚡ **Cell Rush** (60-second mixed rush with test-tube colours and organelle spotting), Shisa's shop (outfits and power-ups), 10 trophies, daily streak with shields, daily snack chest and a class leaderboard.

## Saving

- Auto-save to `localStorage` key `escapeGame_biology` (separate from the physics game), with a Resume prompt.
- 🔑 **8-character save code** (e.g. `ABCD-EFGH`) or a link ending `#ABCDEFGH`. It stores stages escaped and stars per topic, locks open in the current stage, streak (up to 31) and shields. The Mistake Notebook, trophies and chestnuts stay on the device.

## Leaderboard

Needs a free Google Sheet: see [`leaderboard/SETUP.md`](leaderboard/SETUP.md), then put the web-app URL in `LEADERBOARD_URL` in `src/engine.js` and rebuild.

## Editing

The page is assembled from `src/` by `python3 tools/build.py`. Content lives in `src/stages.js` (notes, rules, terms), `src/scenes.js` (rooms), `src/q_t1.js` … `src/q_t8.js` and `src/q_graphs.js` (questions), `src/graphs.js` (graph data) and `src/rush.js`. Check content with `node tools/check_content.js`.

*Fan-made educational project. Not affiliated with the official Chiikawa brand; Chiikawa belongs to Nagano.*
