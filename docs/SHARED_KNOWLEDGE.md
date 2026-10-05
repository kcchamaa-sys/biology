# Shared knowledge: the Pet Game family

Three sibling repos, one teacher, one pattern. **This file lives in `biology` (the hub).** Edit it here; the other repos point to it.

| Repo | Game | Audience | Language | Shape |
|------|------|----------|----------|-------|
| [`biology`](https://github.com/kcchamaa-sys/biology) | Biology Study Pals | Sec 4–6 Biology | English | Escape rooms + pet/dress-up; **built** from `src/` by `tools/build.py` |
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
| Co-op squads (shared island, squad streak, Fog penalty) | `s1science/server/Coop.gs` + Island tab in `s1science/index.html` |
| Class login, teacher dashboard, Excel export | `s1science/server/` (biology `server/` + `src/auth.js` = a lighter port: login, guest mode, records, class board, no dashboard) |
| Leaderboard setup | `biology/server/` (signed-in class board), `s3science/leaderboard/` (anonymous nicknames) |
| Starting a new subject | `s1science/docs/NEXT_GAME_PROMPT.md`, `s3science/NEW_SUBJECT_PROMPT.md` |

## Rules of thumb when porting between repos

1. Copy the **idea and the data shape**, then re-fit it: the three repos use different state keys and currencies.
2. Keep each repo working standalone; do not add cross-repo runtime dependencies.
3. After porting, update the README of the receiving repo and add a line to the log below.
4. Edit biology via `src/` then run `python3 tools/build.py`; never hand-edit its `index.html`.

## Cross-project log (newest first)

- 2026-10-09 (biology): **Media question engine** (`src/media.js`). `SCENE[kind](params)` returns `{ svg, kinds, alt }` for seeded, DOM-free inline-SVG virtual labs: bubbles / bead / ecg (SMIL-animated) and mitosis, plate, quadrat, chrom, plasmo, graticule, pedigree and gel. Elements marked with `data-t` become tap targets. Also `tapPlot()` (tappable points or bars on `plot()` graphs) and `miniGraph()` (thumbnail graphs for graph-choice buttons, with an optional dashed reference line). `KH()` object entries in `src/q_h0.js` add question types `sort` (cards into groups) and `tap`, plus `case` (evidence cards). Reusable in s1science/s3science for any 'observe and measure' question. Lesson: keep exam-board names out of student-facing labels.
- 2026-10-08 (biology): **DSE-style Hard formats with trap feedback.** `KH()` in `src/q_h0.js` turns compact entries into Roman-numeral combos, two-statement items, data-table questions, "mark it like an examiner", compare, new-context, spot-the-flaw and logic-chain (dial) questions. Each wrong option carries a `why` note naming its misconception. The renderers are `qStim()` (statements and tables), `trapHtml()`/`trapsHtml()` and `fmtChip()` in `src/engine.js`; `keep: true` keeps the authored option order. A reusable pattern for any exam-board MCQ style; s1science/s3science could port it with their own option sets. 240 questions, 4 per stage.
- 2026-10-07 (biology): **Level-only exercises + a bigger bank.**
  - The Study planner now asks only for topic (or section) and level (Easy / Medium / Hard). `mixBySkill()` in `src/study.js` builds a 12-question exercise by smooth weighted round-robin over skills (`MIX_W`, concept 5 : data 2 : invest 2 : see 2 : word 1), unseen and unmastered first, so repeat visits get new questions. Reusable for any "pick a level, we mix it" practice mode.
  - 481 new questions in `src/q_x1–4.js`, 8 per stage across Easy/Medium/Hard and Concept/Data/Investigate. `KX(stage, [[skill, bloom, q, choices, hint, explain, tip?]])` sets each question's skill directly, so no SKILL_TAGS letters are needed. Loaded after all older banks so saved ids never move. Hard questions 267 → 446; Data 97 → 277; Investigate 122 → 242.
- 2026-10-06 (biology): **Study planner** (`src/study.js`): Study mode no longer reuses the escape-room picker, whose lock 1 always held 3 spellings.
  - Students choose scope (section or whole topic), skill strand, Bloom band (Easy 1–2 / Medium 3–4 / Hard 5–6) and length. Each chip shows its live count and is disabled at 0.
  - The series puts unmastered, unseen questions first, sorted by Bloom; spelling is capped at 2 in Mixed and deduped per term.
  - Study mode unlocks everything (`isUnlocked`). Only a full Mixed, all-levels section series counts as finishing a section.
  - Reusable for any skill-tagged bank. High achievers asked for exactly this.

- 2026-10-05 (biology): **Friends + Bookmarks.**
  - **Friends** (`src/friends.js`, plus `friends`/`friendAdd`/`friendRemove`/`cheer` actions in `server/Code.gs`):
    - Codes are 6 characters, derived from SHA-256(salt + email), so there is no code table. Only students on the class list can be added (staff excluded).
    - Following is one-way, up to 5 friends.
    - Cheers are preset messages only (no free text), one per friend per day. They are stored in a *Biology Cheers* tab and marked as seen when shown.
    - Tested against a **fake Apps Script harness**: mocked SpreadsheetApp, Cache, Lock and Utilities, with SHA-256 returning signed bytes like GAS does. The same harness backed a Playwright `route()`, so the UI ran against the real server code.
  - **Bookmarks** (`src/bookmarks.js`): `S.bookmarks` is keyed `room:qid`, like the Mistake Notebook. One document-level click listener handles every 🔖 button, including inside modals. Redo runs reuse `miniQuiz`.
  - The Practice tab's leaderboard tile was removed (Home has it).

- 2026-10-05 (biology): **Story world "The Codex of Life"** (`docs/LORE.md` bible + `src/lore.js`). **The Murk is now the shared villain across the family.**
  - The setting: the living world Vita; the Codex of Life torn into 60 pages across 4 Realms (one per Part); students are Keepers; Study Pals are sparks born from understood pages.
  - Each chapter's boss is a **Murk Warden** made of one real misconception. The Keeper's Flame is the streak.
  - Every stage intro opens with a Codex narrator line. There is a 6-card story modal, a Home banner until it is read, realm and chapter names on Stages, and Codex/Warden SVG avatars.
  - **The old side cast was retired:** `say()`/`charSvg()` route any unknown speaker to the active Study Pal, `{N}` = the student's name, and question stems use "A classmate says…".
  - **Study mode** now names stages by section ("1.1 Water and inorganic ions").
  - **Sim labels:** a CSS `paint-order: stroke` halo keeps labels readable over animation. On phones, label-dense SVGs get `min-width` inside an in-card scroller, centred on load.

- 2026-10-05 (biology): **Two practical-style simulations** (`src/sims2.js`); the Lab tabs are now ordered by topic.
  - **Osmosis with dialysis tubing:** a live capillary level, a pore zoom (water passes, sucrose blocked, in/out counters), a level–time graph with ghost runs, and a **fair-test table** that separates variables changing the *rate* (surface area, temperature) from those changing the *final level* (volume of sucrose solution), both (concentration), or neither (beaker volume). The model is h(t) = H(1 − e^(−rt)).
  - **Phototropism coleoptile investigations** (Darwin → Boysen-Jensen → Paál → Went) as a predict-then-run timeline: tap-to-predict chips marked ✅/❌, auxin shown as red dots riding along each bent coleoptile, mica stopping the flow, darkness scenes, and a cell-elongation zoom.
  - **Reusable pattern:** "predict → run → picture conclusion cards" for any classic experiment. Draw the bent stem as a polyline of points, so dots and blocks can follow it.

- 2026-10-05 (biology): **Streak-up ceremony** (`src/streakfx.js`, called from `markStudied`): a full-screen, tap-to-skip overlay that follows the game-motion-fx recipe.
  - Beats: charge-up embers → a CSS **odometer** (one digit strip per column, staggered `translateY`, so 99 → 100 rolls) → boom (ring + burst).
  - Milestones add 2 impact frames, rays, a title slam and confetti. Reward toasts are queued until the overlay closes.
  - An original kawaii SVG flame evolves at 7/30/100 days. Reduced motion shows the final card only.
  - Lesson: a state class named `.week` picked up the Home `.week span` styles, so prefix FX state classes (`sfx-`).

  **Fold bars** (`foldHtml` / `wireFolds` in `src/home.js`): `<details class="fold">` with icon · title · one peek number · chevron. Open state is stored per student in `localStorage` (`bsp_folds`).
  - Home now leads with one next step, and secondary cards fold. Pals fold by rarity (the first incomplete group is open), and the Lab quick check and mastery chart fold too.
  - Home went from 3632 to 1947 px at 360 px wide. Reusable in s1/s3 for any long dashboard.

- 2026-10-05 (s1science): **Streak-up ceremony + fold bars.** Ceremony = full-screen overlay queued until no modal/popup is open (`stkQueue` polls), timeline: ember particles converge → flame charge → per-digit odometer roll (each column is a strip from old digit to new, wraps 9→0, new leading column grows in) → 2-frame impact + shockwave + spark burst → title slam → week strip with today's stamp → pal + milestone meter → Continue. Milestones go gold with rays + confetti; tap skips to an end state via one `.stk-end` class that zeroes all animation delays. Fold bars = `<details data-fold=id>` with a summary peek, state in localStorage `fold_<id>` saved on the capturing `toggle` event, so re-renders keep it; used to group long lists (units, rarity tiers) and park secondary cards. Study page went 6,176 → 1,753 px at 360 px.

- 2026-10-03 (s1science): **Daily incidents + a villain roster built from bad science habits.** 10 Murk minions, each = one bad lab habit/attitude (messy bench, tasting chemicals, rushing, faking data, no goggles, cherry-picking, copying, ignoring evidence, wasting, unfair tests) with a named "good habit" counter; 30 incidents (20 minion, 10 lucky discoveries), each story → 3-choice question → why. Server picks one per squad per day (hash of squad+date, no repeats in 12 days), grades it (answer index stays server-side), one try per member, first right answer = squad bonus + bestiary catch; unsolved minion = small overnight penalty, never takes earned items. Content lives in one Python data file that generates both the server table and the client text, so they can't drift. Also: a figure must never be emoji-only when a question asks about it — label what is *seen*, not the answer.

- 2026-10-03 (s1science): **Free building placement + neighbour synergies** (Island co-op). Server `Coop.gs`: `COOP_PLOTXY` (9 plots), `COOP_SYN` pairs within `COOP_NEAR` px give +10% materials (some add drainage/health), `coopMove` costs 1 Blueprint, a fogged building switches its links off, old squads migrate to default plots. Client: plot-picker modal with a mini map + live synergy preview, golden link lines, villagers with state-aware tips, scenery scatter that avoids plots. Reusable pattern for any "build a base" strategy layer: server owns plot validity and bonuses; client only previews.

- 2026-10-03 (biology): **Skill strands, one theme per lock** (`src/skills.js` + `pickRun` in `src/engine.js`). Every question has a `skill`: `word | concept | see | data | invest`. An explicit field wins; otherwise `skillOf()` tags it with a heuristic (spelling → word; graph svg or table → data; other svg → see; plan/fair test/variable/repeat/conclusion/evaluate → invest; else concept) and reports an `unsure` reason. The 5 locks are Words → Concepts → See it → Data → Investigate, 3 questions each, climbing Bloom inside the lock. Spelling appears only in lock 1. A short strand borrows from `SKILL_NEAR`, records the gap in `SKILL_GAPS` and shows a "stand-in" tag. A lock shows its label only when the stage has ≥3 real questions of that skill. Pass 1 fills every lock from its own strand before pass 2 borrows, so one lock never starves another. Lock 1 never repeats a term (spell `sN` and spellmc `mN` share N). Every bank question is now **hand-reviewed** by what the student has to DO, and stored as `SKILL_TAGS` (one letter per question per stage, in bank order: c/s/d/i). The bank's data and order never change, and the regex is only a fallback for new, untagged questions (`check_content --unsure` lists them). Lesson: keyword tagging mislabels "X says… evaluate" items as investigation and lab scenarios as concepts; tag by the task, using a "cover the picture/data" test. `tools/check_content.js` prints per-stage skill counts, warns below 4 see/data/invest, ranks the 10 biggest gaps, and lists unsure tags with `--unsure`. Question ids stay append-only (progress keys are `room:qN`). Reusable in s1/s3 as a coverage audit for any Bloom-tagged bank.

- 2026-10-03 (s1science → all): **Design skills** saved in `.claude/skills/` (this hub and s1science), loaded automatically by Claude Code in those repos:
  - `kid-game-ui-design`: picture-first UI, tabs, quest bar, tiles, flow diagrams, picture-story guides, phone checks.
  - `cute-mascot-characters`: the mochi-bean house style, rarity tiers, trading cards, emoji → icons, originality rules.
  - `game-motion-fx`: ceremonies, impact frames, reward pops, fog, gacha, battle, weather, safety and performance.
  - `anime-art-direction-svg`: brief → pillars → SVG, building stages, lighting ramps, theming.

  Also new in s1: an animated story guide (pals vs Murk) and a walkable player pal on the Island, with tap-to-walk via `getScreenCTM().inverse()`, proximity action chips, and teammates at fixed spots.

- 2026-10-03 (biology): **Daily Lucky Capsule** (`src/lucky.js`) ported from s1science: one draw per study day, the s1 streak luck table (20-day steps to 100), epic+ pity in 10, capsule colour-upgrade animation, prizes = chestnuts, pantry food (free feeding), Streak Freeze, unowned outfits, card capsules, and 3 capsule-only pals (`cap: true` in PALS; excluded from auto-unlock and adoption). **Home leaderboard card** (`homeBoardHtml` in `src/auth.js`, reuses the `board` action). **Teacher stats** (`src/teacher.js` + `stats` action and `TEACHER_EMAILS` in `server/Code.gs`): KPI tiles, single-series bar charts, most-missed questions mapped back to question text, sortable table that becomes cards on phones, CSV export. Sign-in now always lands on Home.

- 2026-10-03 (s1science): **Living Island 3.0, Phase 1** (`server/Coop.gs` world section + Island block in `index.html`). Reusable patterns:
  - **Deterministic class-wide weather:** a hash of the date + season weights, walked forward from an anchor with memo so that mercy rules (no back-to-back severe nights, max 2 in 7) stay a pure function.
  - **Lazy night tick inside the daily roll**, using one uniform formula: capacity ÷ load → OK / strained / crisis.
  - **Action + Reason prep:** the server keeps the right reason id, so the client can't cheat.
  - **Server-issued task seeds** (template + seed, with a stale check) behind a client task registry: order and sort tasks, 12 templates.
  - **Side-by-side "flag off = identical" test**, loading the previous Coop.gs from git into the fake Apps Script harness.
  - **Bug class to watch:** `h ^= x` in JS hashes yields negative numbers unless you `>>> 0` after every XOR. It silently skewed the weather and broke array picks.

- 2026-10-03 (s1science): **Island 2.0 art direction** (`coop2.js` + `coop2.css` in the s1 build), a reusable "dark ink cinematic" kit for any scene.
  - Shared SVG `<defs>` injected once per screen: hatch / cross-hatch patterns, glow filters, an animated `feTurbulence`+`feDisplacementMap` "ink smoke" filter, and a grey+animated-noise "corroded" filter.
  - Building art as `CO_ART[key](level)` functions (3 stages each).
  - FX that diff the last-seen state in `localStorage`: a level-up overlay with charge-up → 2 one-frame impact frames (white/black silhouettes) → shockwave, repair shockwave, fog creep, and Web-Animations "material pop" chips flying into the inventory. All of it respects `prefers-reduced-motion`.

- 2026-10-03 (s1science): **Co-op squads, "Mochi Science Island"** (`server/Coop.gs` + `coop.js` in the s1 build), reusable for any subject with class sign-in.
  - Squads of 2–4 (any class) join with a 6-letter code. Squad state is one JSON row per squad in a `Coop Squads` sheet, rolled forward lazily day by day on each request (no time triggers needed).
  - Correct answers in records become per-unit materials, with a soft daily cap (full rate to 30, slower to 45, overflow becomes coins).
  - Squad streak: buildings progress only on days every member studied. Missed days use a weekly Squad Freeze, then add Fog, which disables perks and steals at 9+. There is a weekly raid on total correct answers, plus a teacher holiday pause (`COOP_PAUSE`).
  - Daily split puzzle (one part per member, a teammate can rescue a wrong part), repair quizzes, 6 unit buildings × 3 levels + 3 wonders. The final wonder unlocks a co-op-only pal + trophy card.
  - Server tested with a Node fake Apps Script runtime (`gas_harness.js` in the session scratchpad; pattern: vm context with in-memory Sheets/Properties/Cache and a shiftable Date).

- 2026-10-03 (biology): **Biology Capsule Lab** (`src/cards.js`): 40 educational trading cards in 5 rarities modelled on the s1science trophy-card style (title bar + rarity symbol, art window, foil/holo per rarity, 3D tilt), rarity odds with pity counters, streak-driven capsules (+1 every 3rd day, +2 on milestones) and streak luck, plus a large animated Home advert. Migration map converts old collectible ids. Card art is drawn with the icon helpers exposed as `ICN.__h` (wrap in an IIFE: names like `L`, `R`, `H` clash with globals). Locked pals now preview in colour except legendary/mythic. Default pal eyes are plain dark eyes with two highlights.
- 2026-10-03 (s1science): **Lucky Capsule** daily gacha (`capsule.js` in the s1 build) replaces the free daily gift.
  - One draw per study day; rarity odds step up every 20 streak days (to 100); epic+ pity within 10 draws.
  - Crank / drop / rarity-upgrade / burst animation built from CSS + inline SVG only.
  - Prizes: coins, food, Streak Freeze, unowned decor, and capsule-only apparatus decor plus 3 apparatus pals (Bunsen, Cylie, mythic electronic balance Gram).
  - Save code v14: item slots grew from 7 to 8 bits because the item count passed 127 (watch for this when porting).

- 2026-10-02 (s1science): **Fog battle 2.0** for the Nobel Quest boss (`nqbattle.js` + `nqextra.js` in the s1 build), reusable for any quiz boss.
  - Correct answers earn Knowledge Points, spent on Quick Strike / Mend / Heavy Blast.
  - Pre-battle prep: pal stance (Striker / Protector / Scholar) plus 2 chapter-reward items equipped as functional gear.
  - Phase 2 at half HP: Fog Shield broken only by "Shield Breaker" science questions, plus a countdown.
  - The boss mutates based on the task the student leaves for last; the first task completed sets an opening bonus.
  - Story dates glow if the Timeline was done first.
  - Question pool per chapter is now 90–110: hand-written + linked textbook section + generated date / order / word / true-false items with fresh distractors and seen-question down-weighting.
  - Also new in s1: trading-card trophies 3.0 (two-pal lab-incident scenes baked to cached images for smooth scrolling).

- 2026-10-02 (biology): **Chestnut economy fix** (per-answer rewards via one `gainCoins()` helper that refreshes the counter and flies a "+N" into it; stage rewards ×2). **Escape 2.0** in `src/escape2.js`: hidden specimens (discovery) → Bio-Machine term↔function wiring (process) → door needs code + power. **UI 3.0** override block at the end of `src/head.html` (soft tokens, glossy primary buttons, ☰ menu top bar, glowing active tab). Pal art: radial body gradient + clipped sheen (`bodyShine`), plum line colour, larger multi-highlight eyes. Gotcha: generic rules like `.x svg { width }` also hit the emoji icons; `.ic` sizes are now `!important`.

- 2026-10-02 (biology): Renamed to **Biology Study Pals**. Ported the s1science **Science Pals** system as Study Pals (`src/pals.js`): 19 animal pals reused + 8 new biology pals, energy/happiness/XP, moods, 3 evolution stages, perks, rarity auras, food with nutrition cards and sugar crash, Term Match play, featured-pal advert. The active pal *is* the main character (it replaces the `chiikawa` char via getters, so dialogue and outfits follow it). New reusable **emoji → icon swapper** (`src/icons.js`): ~250 original 2-tone icons plus a MutationObserver that converts emoji in any rendered text (skips SVG/option text; only rewrites text that contains a mapped emoji, to avoid observer loops).

- 2026-10-02 (biology): Ported from s1science: Google class sign-in with **guest mode** (`src/auth.js`, `server/Code.gs`, tabs `Biology Records` / `Biology Progress`, reuses the s1 Users tab and Client ID); study-day streak with Streak Freezes (3, +1/month, 150 to buy) and a streak-risk card; daily mission aimed at the weakest topic; health tips by time of day + late-night rest pop-up; guess alert + "Why?" check after study series; clay buttons, trading-card trophies with progressive reveal, gift-box ceremony for epic/legendary pets (`src/daily.js`, `src/head.html`). The old anonymous `leaderboard/` was removed.

- 2026-10-02: Multi-repo setup created; shared knowledge hub added.

- 2026-10-03 (biology): Class sign-in switched on for S4–S6 Biology. `BIO_CONFIG.API_URL` in `src/auth.js` now points at the deployed Apps Script web app (Users tab holds the Biology students and 2 teachers; records go to `Biology Records` / `Biology Progress`).
