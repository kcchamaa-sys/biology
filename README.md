# 🧬 Chiikawa Bio Escape

A Chiikawa-style escape-room game for **HKDSE Secondary 4 Biology**. English only. One file (`index.html`), no install, no build step for players.

- **Play:** open `index.html` in any browser (or the GitHub Pages link).
- **Session length:** one stage ≈ 10–15 minutes. One stage a day is the whole goal.

## 8 topics × 3 stages = 24 escape rooms

Every topic is open, so students can jump to the one their class is on. Inside a topic, stages unlock in order: Stage 1 → Stage 2 → ⚔️ **Boss stage** (guarded by Rakko).

| # | Topic | Stage 1 | Stage 2 | ⚔️ Boss stage |
|---|-------|---------|---------|---------------|
| 1 | Molecules of Life | Water and inorganic ions | Carbohydrates and lipids | Proteins, nucleic acids, food tests |
| 2 | Cellular Organisation | Microscopes and cell theory | Organelles; plant vs animal cells | Membrane; prokaryotes vs eukaryotes |
| 3 | Movement Across Membranes | Diffusion | Osmosis | Active transport and phagocytosis |
| 4 | Cell Cycle and Division | Cell cycle and mitosis | Meiosis and variation | Mitosis vs meiosis |
| 5 | Enzymes and Metabolism | How enzymes work | Temperature, pH, substrate | Inhibitors and applications |
| 6 | Photosynthesis | Leaf and chloroplast | Light and light-independent reactions | Limiting factors and experiments |
| 7 | Cellular Respiration | Aerobic respiration | Anaerobic respiration | Comparing processes; experiments |
| 8 | Nutrition in Humans | Balanced diet | Digestion | Absorption and assimilation |

## Question bank

- **15 questions per stage** (361 in total), spread across **Bloom's levels 1–6**. Each visit picks 5 that climb the levels and skip recently seen ones. Answers are shuffled.
- Multiple choice and combination dials, 17 original SVG diagrams, hints, explanations, exam tips, and key terms with meanings.
- 📓 **Study Journal:** summary, key rules and key terms for every stage; terms used in the current puzzle are highlighted.

## Chiikawa emotions 🥹

Chiikawa reacts with many moods (nervous, crying, shocked, brave, sparkly-eyed). Hachiware gives hints, Usagi yells "Yaha!", Momonga shows off, Kuri-Manju brings tea, **Shisa** runs the shop and **Rakko** guards every boss stage. All characters are original Chiikawa-style drawings, not official artwork.

## Game systems

Same as the physics game: 15-minute LED timer (overtime allowed), 1–3 ★, anti-guessing penalties (−20 s, reshuffle, jams, strikes, dim lights), random spooky-but-friendly incidents, ⚡ **Cell Rush** (60-second mixed rush with test-tube colours and organelle spotting), Shisa's shop (outfits and power-ups), 10 trophies, daily streak with shields, daily snack chest and a class leaderboard.

## Saving

- Auto-save to `localStorage` key `escapeGame_biology` (separate from the physics game), with a Resume prompt.
- 🔑 **8-character save code** (e.g. `ABCD-EFGH`) or a link ending `#ABCDEFGH`. It stores stages escaped and stars per topic, locks open in the current stage, streak and shields. (24 stages need more room than 5 characters.)

## Leaderboard

Needs a free Google Sheet: see [`leaderboard/SETUP.md`](leaderboard/SETUP.md), then put the web-app URL in `LEADERBOARD_URL` in `src/engine.js` and rebuild.

## Editing

The page is assembled from `src/` by `python3 tools/build.py`. Content lives in `src/stages.js` (notes, rules, terms), `src/q_t1.js` … `src/q_t8.js` (questions) and `src/rush.js`. Check content with `node tools/check_content.js`.

*Fan-made educational project. Not affiliated with the official Chiikawa brand; Chiikawa belongs to Nagano.*
