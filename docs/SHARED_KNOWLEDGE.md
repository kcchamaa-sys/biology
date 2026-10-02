# Shared knowledge: the Pet Game family

Three sibling repos, one teacher, one pattern. **This file lives in `biology` (the hub).** Edit it here; the other repos point to it.

| Repo | Game | Audience | Language | Shape |
|------|------|----------|----------|-------|
| [`biology`](https://github.com/kcchamaa-sys/biology) | Mochi Bio Escape | Sec 4–6 Biology | English | Escape rooms + pet/dress-up; **built** from `src/` by `tools/build.py` |
| [`s1science`](https://github.com/kcchamaa-sys/s1science) | Mochi Science Pals 麻糬科學小夥伴 | S1 Science | EN / 繁中 | Pet-raising revision; single hand-edited `index.html`; `server/Code.gs` |
| [`s3science`](https://github.com/kcchamaa-sys/s3science) | Puff's Physics Escape | S3 Physics (Ch 14 Light) | EN / 繁中 | Chiikawa-themed escape rooms; single `index.html`; `leaderboard/` |

Live sites follow `https://kcchamaa-sys.github.io/<repo>/`.

## Patterns shared by all three (reuse, don't reinvent)

- **Single-file delivery:** students open `index.html`; no install, no player-side build. All art is inline SVG, all audio is generated in-browser (Web Audio), speech uses the Web Speech API (en-GB).
- **Bite-sized sessions:** one stage/room/quiz per day (10–20 min); daily **streak** with freeze/shield mechanics; streak bonus on rewards.
- **Questions:** tagged by Bloom level (Remember → Create), 15 per quiz (biology: 3 in a row per lock), recently-seen questions skipped, options shuffled. Wrong options should be real student misconceptions; explanations shown on every answer; mistakes go to a notebook.
- **Study notes / Journal** per topic with bilingual key terms where applicable; 🔊 normal + 🐢 slow British pronunciation; **dictation** (listen-and-spell, meaning-and-spell), 2 tries per word, missed words recycle.
- **Pets / dress-up / shop:** chubby "mochi bean" mascots, thick brown outlines, soft 2-tone shading; currency (🌰 chestnuts in biology/s3, 🪙 coins in s1); rarity tiers; trend + Hong Kong items. Characters are original; **no official logos/artwork/soundtracks** (Chiikawa, Pokémon-style etc. are "inspired by" only).
- **Pet health:** missed streak days make pets sick; medicine at a clinic (s1 and biology both).
- **Chat card / fun facts:** characters share science facts (with Hong Kong examples) and personal encouragement.
- **Persistence:** `localStorage` auto-save. s3 adds a 5-char **save code**. s1 and biology/s3 can use a **Google Sheet + Apps Script** leaderboard / class dashboard (`server/Code.gs` + `SETUP.md` in s1 and biology; `leaderboard/Code.gs` + `SETUP.md` in s3). Biology's sign-in has a no-account **guest mode**. **Never store student names in a repo.**
- **Quality gates:** diagrams must not overflow their box or the viewport (s1 has an automatic figure check; biology has `tools/check_content.js` and `tools/smoke.js`); phone layout checked at 360 px; UI must wrap, not scroll sideways.
- **Content rules:** curriculum-aligned to Hong Kong syllabus, English British spelling accepted both ways where spelling is tested; concept-only (no calculations) in s3.

## Where to look for a pattern

| Need | Look in |
|------|---------|
| Pet art, dress-up slots, rarity tiers, medicine/health, streak freeze | `s1science/index.html` |
| Bilingual EN/繁中 switching, Bloom-tagged banks, save code, random incidents | `s3science/index.html` |
| Room scenes, locks, simulations (Lab), study mode, graph questions, split source + build | `biology/src/`, `biology/tools/` |
| Class login, teacher dashboard, Excel export | `s1science/server/` (biology `server/` + `src/auth.js` = a lighter port: login, guest mode, records, class board, no dashboard) |
| Leaderboard setup | `biology/server/` (signed-in class board), `s3science/leaderboard/` (anonymous nicknames) |
| Starting a new subject | `s1science/docs/NEXT_GAME_PROMPT.md`, `s3science/NEW_SUBJECT_PROMPT.md` |

## Rules of thumb when porting between repos

1. Copy the **idea and the data shape**, then re-fit it: the three repos use different state keys and currencies.
2. Keep each repo working standalone; do not add cross-repo runtime dependencies.
3. After porting, update the README of the receiving repo and add a line to the log below.
4. Edit biology via `src/` then run `python3 tools/build.py`; never hand-edit its `index.html`.

## Cross-project log (newest first)

- 2026-10-02 (biology): Ported from s1science: Google class sign-in with **guest mode** (`src/auth.js`, `server/Code.gs`, tabs `Biology Records` / `Biology Progress`, reuses the s1 Users tab and Client ID); study-day streak with Streak Freezes (3, +1/month, 150 to buy) and a streak-risk card; daily mission aimed at the weakest topic; health tips by time of day + late-night rest pop-up; guess alert + "Why?" check after study series; clay buttons, trading-card trophies with progressive reveal, gift-box ceremony for epic/legendary pets (`src/daily.js`, `src/head.html`). The old anonymous `leaderboard/` was removed.

- 2026-10-02: Multi-repo setup created; shared knowledge hub added.
