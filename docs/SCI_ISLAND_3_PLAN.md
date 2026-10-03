# Mochi Science Island 3.0: "Living Island" game-mechanics plan

**Audience:** the executing Claude session (Opus) working in **`kcchamaa-sys/s1science`** (the Island lives there; this plan was written in the `biology` hub).
**Author role:** game director. The user approved this direction. Your job is to build it in phases, test it, and report.
**Language of the game:** bilingual EN / 繁體中文 (`L('English','中文')`), British spelling, Hong Kong examples.

---

## 0. How to use this plan (read first)

1. Attach/clone `kcchamaa-sys/s1science` **with push access** (`add_repo` with `access: "push"`). Read its `CLAUDE.md`, then `README.md` (Island section), `server/Coop.gs`, `server/SETUP.md`, and the client block in `index.html` (search `COOP=` / `function coop` / `function co[A-Z]`, roughly lines 9068–9475 at commit `43a00cc`).
2. Also read the hub's `docs/SHARED_KNOWLEDGE.md` (in `kcchamaa-sys/biology`) for house patterns, and note reusable ideas in the `biology` repo: `src/escape2.js` (term↔function wiring), `src/sims.js` (simulations), `src/graphs.js` / `src/q_graphs*.js` (SVG graph questions).
3. **Build in phases (section 9). Ship Phase 1 and stop for the user's review before Phase 2.** Every phase must leave the game working for existing squads.
4. Follow the repo working agreements: standalone repo, **never commit student names or personal data**, no official logos/artwork/music from existing franchises (also **do not reproduce Hong Kong Observatory logos or warning-signal graphics**; use original icons), single hand-edited `index.html`.
5. When done with each phase: update `README.md` (Island section), `server/SETUP.md` (new Script Properties), and add one line to the hub's cross-project log (`biology/docs/SHARED_KNOWLEDGE.md`; ask the user to attach the hub if you cannot push there).
6. Do not open a PR unless the user asks.

**User context that affects the work:** the user is a Hong Kong S1 Science teacher. Their students are 12–13. The user prefers short, scannable output with bold takeaways, so keep your status reports to bullets and give one clear next step.

---

## 1. Vision and design pillars

> The island becomes a **living system**. Every rule is a real S1 science concept, and the explanation arrives as a **consequence the squad must handle**, not as a paragraph to read.

| Pillar | Meaning | Test |
|---|---|---|
| **Mechanics = the science** | Rain → runoff → sewage → water quality → health. If you remove the explanation text, the rules still teach. | Every event card lists the S1 sections it exercises |
| **Decisions over answers** | Trade-offs and planning, not only right/wrong | At least one choice per event with no single "correct" button |
| **Personal + shared** | Roles, pal posts, personal plots and commissions inside a squad island | Each member has something only they did |
| **Variety of action** | Sorting, ordering, tuning, diagnosing, reading data, refuting Murk, jigsaw | ≥ 8 task types live by Phase 3 |
| **Study stays the engine** | Island time is *earned* by studying, and the island never taxes study rewards | No island event reduces coins, XP or materials already earned |
| **Gentle, not punishing** | Failure is repairable and teaches ("Field Report") | Mercy rules in section 6.6 pass tests |

---

## 2. What exists today (verified facts, do not re-derive)

**Server (`server/Coop.gs`, Apps Script)**
- One JSON state per squad in one sheet cell (`COOP_SQ`). **Google Sheets caps a cell at 50,000 chars**, so keep the whole squad state well under ~30 KB and add a size test.
- `coopRoll(row)` rolls the squad forward **lazily day by day** (max 31 days) on every request. No time triggers. **This is where the world simulation hooks in.**
- State `st`: `m` (members), `mats[1..6]`, `bp`, `spark`, `crys`, `star`, `bld`, `con`, `fog`, `fogB`, `frz`, `blk`, `streak`, `best`, `sg`, `day`, `wk`, `puz`, `log` (max 25), `deco`, `prize`.
- Member: `role`, `joined`, `days[]`, `dk/dm/soft/dc/owe` (daily material caps and coin overflow), `rep`, `tot`.
- Actions via `coopAction` switch: `coopGet/Create/Join/Leave/Role/Build/Puzzle/Repair/Trade/Forge/Deco/Claim/Pause/Kick`, plus teacher `coopAll`. `coopView(u,row)` shapes what the client sees; `coopEarn` turns correct quiz/practice/dictation answers into materials; `coopTouch` counts a study day.
- Squad days and fog: missed days use a Squad Freeze, then add Fog (max 10). Fog ≥ 3 disables a building's perk. Fog ≥ 9 lets Murk steal 5% of materials. Sunday raid needs 120 correct answers per member. Teacher holiday pause: Script Property `COOP_PAUSE=1`.
- Buildings: `safety, water, green, cell, power, part` (3 levels each, unit-tagged 1–6) and wonders `obs, museum, light`. Roles: `chem` (units 2 & 6), `bio` (3 & 4), `phys` (5 & 1), `eng`.

**Client (`index.html`)**
- `COOP` state object, `coopCall(action,data,quiet)`, `coopAfterLoad()`, `coopHTML()` / `coopSquadHTML(q,d)`, `coIsland(q)` (SVG island), `CO_ART[key](level)`, `coBld`, `coDeco`, `coTod()` (real-clock day/night sky), FX (`coLevelUp`, `coShock`, `coCreep`, `coPop`, all respecting `coRM()` reduced motion).
- Quiz reuse: `coPickQ(unit,seed,k)`, `coRepairQs(n)`, `coQuiz(kind,list,meta)`, `optsFor(q)`, `ALLSECS`, `S.secs[id].stars`.
- Existing quiz content is in `CHAPTERS` (units 1–6). **S1 units:** 1 Introducing science · 2 Water · 3 Looking at living things · 4 Cells, human reproduction & heredity · 5 Energy · 6 Matter as particles.

**Syllabus sections you can attach tasks and events to** (verify the exact ids in `CHAPTERS` before writing content):
- Unit 1: 1.1–1.4 (science practice, **1.3 lab safety**, **1.4 apparatus**)
- Unit 2: **2.1 states of water · 2.2 water cycle · 2.3 dissolving · 2.4 water purification · 2.5 further treatment of drinking water · 2.6 conservation and pollution**
- Unit 3: 3.1–3.4 (living things, grouping, identification key, biodiversity)
- Unit 4: 4.1 cells … 4.6 heredity
- Unit 5: **5.1 energy changes · 5.2 heat transfer · 5.3 energy sources**
- Unit 6: 6.1 particle theory · 6.2 model · 6.3 dissolving (particles) · **6.4 thermal expansion/contraction · 6.5 gas pressure · 6.6 density**

---

## 3. The new loop: "One Island Day"

Keep it 10–20 minutes. The Island tab opens on an **"Island Today" card that shows exactly ONE highlighted next step** (a progress ring of 4 steps; no guilt copy if skipped).

1. **Read** last night's **Field Report** (what happened and why; names the concept; optional 1-tap "Why did that happen?" check).
2. **Study** as now (quizzes, practice, dictation) → materials + **Ops** (island action points).
3. **Prepare** using the **Forecast** (tomorrow certain, the day after "likely"). Spend Ops on prep actions.
4. **Do tasks**: the squad Task Board and your personal commission (section 7).
5. **Night tick** (lazy, in `coopRoll`): weather and events resolve against capacity; meters change; the Field Report is written.

**Ops:** each member earns **2 Ops on any day they study** (+0 extra; cap carry-over 4). Ops are spent on prep actions and commissions. *Rationale:* island management is gated by real study, so managing can never replace studying.

---

## 4. Two-layer economy

**Layer A: Study stock (exists, keep unchanged):** `mats[1..6]`, `bp`, `spark`, `crys`, `star`. Buildings still cost these.

**Layer B: Island meters (new, squad-level, 0–100 unless stated):**

| Meter | Icon | Unit link | Meaning | Main levers |
|---|---|---|---|---|
| **Clean Water** | 💧 | Unit 2 | Drinkable supply | Reservoir, treatment chain, pollution `pol` (0–10) |
| **Energy** | ⚡ | Unit 5 | Battery charge | Solar (needs sun), wind (needs wind), generator (reliable but pollutes), battery size, demand |
| **Food** | 🍱 | Unit 3 | Greenhouse stock | Crop plots, light/water/temperature, storage vs spoilage |
| **Health** | ❤️ | Units 1, 4 | Island wellbeing | Derived: water quality, food, accidents; Clinic and Safety Lab protect it |

**Rules (hard):**
- Meters **gate perks**, they do not tax study. Examples: Greenhouse snack needs Food ≥ 30; Power-Station coin bonus needs Energy ≥ 30; Cell Clinic +XP needs Health ≥ 40; Water Works fog-clear needs Clean Water ≥ 30.
- Consequences available to the world sim: lower meters, raise Fog (cap +2 a day from systems), disable perks, delay construction. **Never** remove coins, XP, materials already earned, or pets. (Murk's existing 5% steal at Fog ≥ 9 stays as is.)
- **Buildings are never destroyed.** A struggling system shows "Strained" or "Offline" and is repairable.

### 4.1 One uniform resolution formula (use for every event)

For each affected system `S` on the night tick:
```
load     = event.load[S] × severity(weather)
capacity = Σ module levels (+ prep actions with correct Reason ×2)
           + pal-post bonus + research bonus + role bonus  − Fog penalty
ratio    = capacity / load
ratio ≥ 1.0  → OK        (small bonus: meter +10, Codex entry may unlock)
0.6 ≤ ratio < 1 → STRAINED (meter −10, Field Report explains the missing capacity)
ratio < 0.6  → CRISIS    (meter −25, side effects, Fog +1 on that system)
```
All constants live in one `COOP_WORLD` object at the top of `Coop.gs` so they can be tuned in one place. **Tuning target:** a squad that studies daily and prepares sometimes sees ≤ 1 crisis a week and recovers within 2 days. A squad that ignores prep reaches Health ≈ 40, never 0, and never hits more than +1 Fog a day from systems.

### 4.2 Water system (the Rain Day slice) in detail

- **Modules (built with mats; levels):** `drain` (storm drain, 0–3), `pond` (retention pond, 0–2), `reservoir` (0–3), treatment chain `screen`, `settle`, `filter`, `disinfect` (each 0/1; each has a concept: coarse filtering, sedimentation, filtration, killing microbes with chlorine).
- **Runoff:** `runoff = rain_intensity × paved_factor`. Paved factor drops with permeable paving (cheap decor-like module) and with Greenhouse level (green cover absorbs water).
- **Overflow:** if `runoff > drain + pond` the excess is **sewage overflow** → `pol += excess`.
- **Treatment quality:** the treatment chain removes `pol` per stage. **Order matters**: the chain is arranged by the player in a **Treatment Plant puzzle** (task type `order`). The correct order (screen → settle → filter → disinfect) gives full efficiency; a wrong order gives 50% (and the Field Report names the misplaced stage and why). The puzzle is done **once per module upgrade**, not daily.
- **Outcome:** `pol` left after treatment lowers Clean Water and Health. Missing disinfect + `pol ≥ 3` triggers the **"Water-borne illness"** side event (Clinic diagnosis task).
- **Chain reactions on heavy rain** (all through the same formula): solar output −50% (cloud) · greenhouse waterlogging (Food) · stagnant puddles → mosquito event · humid stores → mould risk.

---

## 5. Systems by building (so every building does something)

| Building | Unit | Becomes the manager of | New active play |
|---|---|---|---|
| Water Works | 2 | Reservoir, treatment chain, runoff | Treatment Plant order puzzle, pollutant sorting, reservoir graph |
| Power Station | 5 | Energy generation/storage | Energy-balance dial, energy-chain ordering, wind/solar/generator choice (energy sources; generator raises pollution) |
| Greenhouse | 3 | Food plots | Fair-test designer (light/water/temperature), biodiversity choice (mixed plots resist pests; monoculture does not) |
| Cell Clinic | 4 | Health recovery | Diagnosis task, microscope cell identification |
| Particle Factory | 6 | Thermal/pressure/density events | Heatwave rail-gap and pipe tuning (thermal expansion), pressure tank, oil-spill density sorting; desalination (evaporate and condense) in drought |
| Safety Lab | 1 | Incident prevention and **Research board** | Hazard hotspots, response ordering, fair-test labs that unlock permanent Research |
| Wonders | all | Late game | Observatory = 2-day extended forecast and weather-history graph · Museum = Codex showcase · Lighthouse = keeps existing prize |

**Research board (Safety Lab):** 6–8 permanent upgrades (e.g. "Rain gauge: forecast accuracy", "Permeable paving", "Insulated pipes"). Each costs mats **plus** one completed fair-test lab. This is where students *choose* what to specialise in.

---

## 6. Weather and the event deck

### 6.1 Deterministic world weather
- `coopWx(date)` is a **pure function of the Hong Kong date** (plus teacher spotlight property), so **every squad in the class gets the same weather**. This enables class discussion ("Typhoon tomorrow, did you prepare?") and testing.
- Seasonal weights: summer Jun–Sep (rain, heavy rain, typhoon, heatwave), winter Dec–Feb (cold front), plus calm and cloudy days year-round.
- **Forecast** = `coopWx(tomorrow)` exactly, and the day after as "likely"/"chance" (probability display only).
- Add a unit test over 365 days: determinism, valid types, mercy rules in 6.6.

### 6.2 Event cards (starter set; confirm each concept against `CHAPTERS` before writing text)

| # | Event | Systems loaded | Concepts (sections) | Prep actions (with Reason) | Task types used |
|---|---|---|---|---|---|
| E1 | 🌤 Calm day / Research day | none | 1.2 | build, research | fair-test |
| E2 | 🌦 Light rain | water | 2.2 | open drains | order (water cycle) |
| E3 | 🌧 **Heavy rain** | water, energy, food, health | 2.2, 2.4, 2.5, 2.6, 1.3 | drains, pond, store water early | order (treatment), sort (pollutants), graph, budget |
| E4 | 🌀 **Typhoon** | energy, structure | 5.1, 5.3, 6.5 | secure solar panels, switch to battery, harvest wind | dial (energy), graph (pressure), budget |
| E5 | ☀ **Heatwave** | water (evaporation), energy (cooling), food (spoilage), rails | 2.1, 5.2, 6.4 | shade, insulate, pre-chill food, rail gaps | dial, sort (conduction/convection/radiation), fair-test |
| E6 | ❄ Cold front | energy (heating), food (frost), pipes | 2.1, 5.2, 6.4 | insulate, cover crops | match, dial |
| E7 | 🏜 Drought / water restriction | water | 2.1, 2.3, 2.6, 6.3 | conserve, desalinate (evaporate + condense) | budget, dial |
| E8 | 🛢 Oil spill | water | 6.6, 2.4 | boom, skimmer | sort (density), dial (float/sink) |
| E9 | 🦟 Mosquito outbreak (after E3) | health | 3.1, 3.4 | clear stagnant water | hotspot, diagnose |
| E10 | 🍞 Mould in the store (after humid days) | food | 3.1–3.2 | dry storage | fair-test |
| E11 | 🔌 Power cut | energy | 5.1 | battery, priorities | order (energy chain), budget |
| E12 | 🧪 Lab spill | health | 1.3, 1.4 | safety-lab level | hotspot, order (response) |
| E13 | 🤒 Water-borne illness (trigger: `pol≥3` and no disinfect) | health | 2.5, 4.1 | clinic | diagnose |

Each event card needs: id, EN/中 name and flavour, icon, season weights, system loads (per severity 1–3), prep actions, concept section ids, Field Report templates for OK/STRAINED/CRISIS (EN/中, cause → effect → *why*), and a Codex entry id.

### 6.3 "Action + Reason" prep (key teaching mechanic)
A prep action costs 1–2 Ops. After tapping it, the student picks the **reason** from 3 options (one real concept, two real misconceptions). **Right reason = ×2 effect**, wrong reason = ×1 and the explanation shows. Reasons come from the existing question style (explanations and wrong options in `CHAPTERS`).

### 6.4 Field Report card
After each night tick: 2–4 lines in a consistent template: **What happened → Why (concept, S1 section link) → What to do next.** Optional "Why?" 1-tap check (MCQ from the section's existing questions). Link to the Study note for that section.

### 6.5 Island Codex 小島圖鑑
Concept cards unlocked by events and tasks (squad-level list `st.cdx`, max 80 ids). Each card: 2–3 lines EN/中, one Hong Kong example (e.g. underground stormwater storage tanks, typhoon signals as *words only*), tiny original SVG. The Museum wonder is the showcase.

### 6.6 Mercy rules (must be unit-tested)
- **No two severe events on consecutive days; max 2 severe per rolling 7 days.**
- After a CRISIS day, the next day is capped to calm/cloudy ("recovery day").
- **No double jeopardy:** on a day the squad broke its streak (absent members), the world sim runs at **half damage**, since Fog already penalises the miss.
- **Holiday pause** (`COOP_PAUSE=1`) skips the world tick entirely, with all meters frozen.
- New squads get a **7-day tutorial schedule** (calm → light rain → heavy rain with a guided Treatment Plant on day 3).
- Missed 3+ days never drops a meter below 20.
- Teacher can turn events off (below).

### 6.7 Teacher controls (Script Properties + on-screen toggles on the Teacher view)
- `COOP_WORLD` `0/1` master switch (**default 0 = off** until the teacher enables it; deploy safely).
- `COOP_MODE` `gentle|standard` (gentle halves loads).
- `COOP_SPOT` unit number: **Spotlight unit** (raises event weights for that unit's concepts for 7 days; for pre-test revision).
- Teacher view gets: squads in crisis; **concept-miss heat map** (which section tags were missed most, from task results; section ids only, **no student names stored beyond what the sign-in already provides**); "force event tomorrow".

---

## 7. Personalisation

| Feature | Design | Server data |
|---|---|---|
| **Role duties** | Roles are **bonuses, not gates** (squads of 2–4 must cover everything). Chemist runs water treatment (+1 stage efficiency), Biologist food and clinic, Physicist energy and thermal, Engineer drains and structure (+1 Ops). Doing a task in your role gives a "Mastery" mark. | `m.role` (exists) |
| **Pal posts** | A member assigns their current pal (already known via `coopPets()`) to one building. Pal **type tags** (aquatic, plant, animal, tech, lab) give the post a small bonus (e.g. aquatic pal at Water Works). *Executor: inspect the pal definitions in `index.html`, create a `type` map for all pals, keep it data-driven.* | `m.post` building key |
| **Personal plot** | Each member gets one island plot with 3 choices: theme (Garden / Workshop / Observatory), a short **nickname plate** (≤ 12 chars; teacher can clear), and the pal post. | `m.plot {th,nick}` |
| **Personal commission** | Daily, one per member, **3 difficulty tiers** the student chooses (Easy / Standard / Challenge). The **client** picks topics from the student's **weakest sections** (`S.secs[id].stars`) and sends only the section id + seed. Rewards: Ops, a Codex card, small mats for Challenge; **never extra coins** (anti-grinding). | `m.cm {d,id,tier,done}` |
| **Mastery skins** | Building skins unlock when **any member** reaches 3★ across a unit (client reports unit-mastery flags; stored per member). The *squad* picks the skin, so teammates' mastery helps everyone. | `m.mast[]`, `st.skin{}` |
| **Contribution titles** | Non-numeric titles earned by activity (Storm Warden, Water Warden, Energy Keeper, Field Medic, Lab Guardian). **No leaderboard, no rankings** (quieter students are not shamed). | `m.titles[]` |
| **Field notes** | A personal notebook (local only, **not** in the save code, not sent to the server): a one-line "My hypothesis" or "I'd protect the island by…". Optional "share to squad" is **Phase 4 and chips/emoji reactions only**. | local `S.fieldNotes` |

---

## 8. Task engine: variety beyond "answer and get coins"

### 8.1 Architecture
Create a client **task registry** `COTASK = { type: { build(seed,ctx), render(task,host), grade(ans) } }` and a data bank `COTASKS` (templates, bilingual, tagged by `section`, `bloom`, `unit`).
- `build` is **deterministic from a seed**; the **server issues seeds/ids** (like `st.puz.seed`) so tasks cannot be farmed by re-rolling.
- `grade` returns `{score: 0|0.5|1, wrong: [concept tags], expEN, expZH}`.
- New server action **`coopTask {tid, seed, score}`**: validates the daily cap, awards **Ops / Codex / progress (never coins)**, writes the concept-miss counters, and returns the new view.
- **Daily caps:** 3 squad tasks + 1 commission per member; the same template seed within 7 days pays 0.
- **Mobile first:** tap-to-select/tap-to-place (not drag-only), ordering with up/down buttons, sliders with a numeric readout, 44 px targets, `prefers-reduced-motion` respected, nothing wider than the viewport at **360 px**.
- Wrong answers become **concept flags** with a "Study this" link to the section notes; (the existing 錯題本 stays for MCQ).
- Reuse `optsFor` and the `CHAPTERS` banks for any MCQ step.

### 8.2 Task types

| ID | Type | Interaction | Scoring | First used |
|---|---|---|---|---|
| T1 | **Order the chain** | Arrange steps (treatment chain, water cycle, energy conversion chain, scientific method, lab-spill response) | Partial credit per correct position | **Phase 1** |
| T2 | **Sort and classify** | Tap items into 2–4 bins (pollutants, separation methods, conduction/convection/radiation, density float/sink) | % correct | **Phase 1** |
| T3 | **Match-wire** | Term ↔ function (port the pattern from `biology/src/escape2.js`) | % correct | Phase 2 |
| T4 | **Tune the dial** | Sliders with a live SVG (heater → particle animation; solar vs load; float/sink). **Predict first** (pick the direction), then run | In target band + prediction right | Phase 2 |
| T5 | **Fair-test designer** | For a scenario, choose what to **change / measure / keep the same** | 3 dropdowns, % correct | Phase 2 |
| T6 | **Hazard hotspots** | Tap risky items in a lab/island scene (decoys included) | found − false taps, no timer | Phase 2 |
| T7 | **Read the data** | Seeded line/bar chart (reservoir level, temperature, pressure) + a decision MCQ ("ration water?") | 0/0.5/1 | Phase 2 (graph pattern from `biology/src/graphs.js`) |
| T8 | **Diagnose** | Symptom/clue cards → cause, then pick the one test that tells two causes apart | 0/0.5/1 | Phase 3 |
| T9 | **Murk's Whispers** | Fog states a plausible **misconception**; student picks the flaw and the fix. Used as a variant of the **repair quiz** (successful refutations clear Fog) | MCQ score | Phase 2 |
| T10 | **Budget/allocate** | Spend N tokens across needs for an event; the sim shows the result. Multiple acceptable plans; graded by a rubric (critical needs covered) | rubric score | Phase 2 |
| T11 | **Teach-back (chips)** | Build one sentence from keyword chips; a squadmate taps ✅ Approve for a bonus. **Chips only in v1, no free text from minors** | auto + peer | Phase 3 |
| T12 | **Jigsaw clues** | Each member sees a *different* clue card; the squad decides together (in class or chat); one submits; all must have opened their clue. **Upgrade the Daily Blueprint puzzle** to this | 0/1 | Phase 3 |
| T13 | **Real-life mission** (weekly) | "Find 3 changes of state at home" → tick categories seen + 1 check question. **Text/ticks only, no photos** | check question | Phase 3 |

**Content minimums at launch of each type:** ≥ 6 templates, each with seeded variants, EN + 中, an explanation, a `section` tag, and a Bloom level. British spelling. Wrong options must be real student misconceptions. Diagram labels must not overflow (the repo has a figure check; extend it to the new SVGs).

### 8.3 Rewards (change the island, not just a counter)
Clearer water on the island, a meter moving, a new module online, a Codex card, a new research option, an extra prep Ops. The only coins remain the existing study-flow coins.

---

## 9. Delivery phases (build and test in this order)

### Phase 0: scaffolding (small, no visible change)
- `COOP_WORLD` constants block; `st.v = 2` with **`coopMigrate(st)`** adding defaults for old squads (called when reading rows). Old squads must keep working.
- Feature flag `COOP_WORLD` Script Property (default off). Size guard test (< 30 KB JSON).
- A Node **fake Apps Script harness** (vm context with in-memory Sheets/Properties/Cache and a shiftable `Date`, as used for Coop.gs before; see the hub log) so the server logic is testable.
- **Done when:** existing squad rolls forward identically with the flag off; harness tests pass.

### Phase 1: "Rain Day" vertical slice (**stop and report here**)
- `coopWx` (calm, cloudy, light rain, heavy rain only), Forecast card, Ops, **Water system only** (drain, pond, reservoir, 4 treatment stages, `pol`, Clean Water, Health), uniform resolution formula, mercy rules + 7-day tutorial schedule.
- Task types **T1 (order) and T2 (sort)**, the **Treatment Plant puzzle**, **Action + Reason** prep (3 prep actions), **Field Report** card, **Island Today** card, **Codex v1** (6 entries), weather FX on the island (rain streaks; respects reduced motion; no flashing > 3/s).
- Teacher toggle `COOP_WORLD`, `COOP_MODE`, holiday pause covers the world tick.
- **Acceptance tests:** weather determinism over 365 days; mercy rules; lazy roll over a 10-day gap resolves correctly; meters clamp 0–100; no coin/XP/mat deductions anywhere; old squad migration; 360 px layout; reduced motion; EN and 中 text complete; no overflow in SVGs.

### Phase 2: full systems and the deck
- Energy, Food, Health meters; all 13 events; role duties; Research board; prep-action catalogue; T3, T4, T5, T6, T7, T9, T10; **Murk's Whispers** variant of repair quizzes; teacher **spotlight** and **concept-miss heat map**; observatory wonder (extended forecast); optionally merge the Sunday raid into a weekly "Storm Sunday" big event (keep the same 120-per-member threshold as "prep power").
- **Acceptance:** balance simulation script (30 virtual squads × 90 days under three behaviours: diligent / casual / absent) meets the tuning targets in 4.1; mercy rules still hold with all events.

### Phase 3: personalisation and social
- Pal posts (type map), personal plots (nickname with teacher clear), personal commissions targeted at weak sections, mastery skins, contribution titles, T8, T11 (chips), T12 jigsaw (upgrade the daily puzzle), T13 weekly real-life mission, field notes (local only).
- **Acceptance:** no student names added to the repo; nicknames are length-limited and clearable by teachers; no leaderboard; local-only data stays out of the server.

### Phase 4: polish
- New module art in the dark-ink style (`CO_ART` variants for modules and flood/typhoon states), FX polish, audio only if it can be generated in-browser, Codex showcase in the Museum, "share to squad" via emoji reactions, balancing from the first real class data (ask the teacher for aggregate feedback).

---

## 10. Technical constraints and gotchas

- **Single `index.html`** hand-edited (no build). Keep new client code in the existing Island block or a clearly marked new block; keep functions namespaced `co*` / `coop*`.
- **Save code:** squad state is server-side, so Phases 0–2 should **not** need a save-code change. If you add personal local state that must survive device changes, read the save-code encode/decode first (it is bit-packed, v15 today) and bump the version **without breaking old codes**; otherwise keep it local-only.
- **Server trust:** the existing design trusts client-reported results. Keep rewards small and capped, issue seeds from the server, and never mint coins.
- **Concurrency:** all writes go through `coopAction`'s script lock. Keep the world tick inside `coopRoll`.
- **Do not store student free text** beyond the 12-char nickname; **no photos**.
- **Accessibility:** colour is never the only signal; keyboard-operable controls for ordering; ARIA labels on SVG scenes; photosensitivity-safe FX.
- **Content accuracy:** each event and Codex card must match the S1 syllabus text in `CHAPTERS` (mark uncertain ones for the teacher to confirm instead of guessing, e.g. mould or mosquito links to specific sections).
- **Originality:** all art is original; HK flavour via words and generic icons only.

---

## 11. Director's defaults (change only if the user says so)

1. World events **off by default**; the teacher enables them.
2. Tasks never grant coins; study coins stay as in the anti-grinding rules.
3. Teach-back is **chips only** in v1.
4. Weather is **shared across all squads** (class-wide) and deterministic by date.
5. Roles are **bonuses, not gates**.
6. No leaderboard for the island.
7. Ship Phase 1 and **wait for the user's go-ahead** before Phase 2.

## 12. Your first reply to the user should be

- Confirmation that you read the files, with a 5-line summary of how you will implement Phase 0 and 1.
- Any contradictions you found between this plan and the code (cite `file:line`).
- Questions limited to genuine blockers (for example, which pal types to assign), each with a recommended default.
