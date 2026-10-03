# 🧬 Living Pals: Study Pal & Pet Life-Simulation Plan (GSBIO)

**Status:** PLAN ONLY. Nothing in here is built yet.
**Repo:** `biology` (hub). Edit `src/`, then `python3 tools/build.py`. Never hand-edit `index.html`.
**Audience of this file:** the chat(s) that will build it. Each phase in §9 fits one chat.

---

## 0. 30-second summary

- Today a pal has two bars (⚡ energy, ❤️ happy) that fall in a straight line, food bumps them up instantly, and getting sick is a random dice roll. Pets are **unlock-only collectibles**: no care, no age, no death.
- The goal: **the pal behaves like a real teenager's body, and each pet like its real species**. Every number on screen is a real biology variable. Every change comes with a **"Why?" card** tied to a syllabus topic.
- Three layers, built in this order:
  1. **Pal body**: fuel, glucose, energy balance, nutrients, water, sleep, movement, defence, teeth.
  2. **Pal weekly check-up**: a lab report the student must interpret (DSE-style data questions made from the pal's own data).
  3. **Pets**: species-specific needs, life stages, lifespan, ageing, breeding and genetics.
- **Golden rule:** care changes the *pal's* gains and looks. It **never** changes question correctness, mastery, records or anything a teacher sees.

### 👉 Next right step
Start **Phase 0** (§9). Copy the handoff prompt below into a new chat.

### 📋 Handoff prompt (copy-paste into the building chat)

```
You are the lead developer of GSBIO (repo kcchamaa-sys/biology, the hub of the Pet Game family).
Build Phase <N> of docs/LIVING_PALS_PLAN.md (branch: claude/adoring-bell-z7vh01 has the plan;
fetch it, then work on the branch you are given).
Read first: CLAUDE.md, docs/SHARED_KNOWLEDGE.md, then plan §1 (principles), §3 (architecture),
§7 (guardrails) and the sections for this phase.
Rules: edit src/ then run `python3 tools/build.py`; run `node tools/check_content.js`,
`node tools/smoke.js` and `node tools/sim_test.js` before every commit; one phase per chat;
keep the repo standalone; never commit student names; no franchise art/logos/music.
Add a line to the cross-project log in docs/SHARED_KNOWLEDGE.md when you finish.
Do not ask me about anything that has a default in §11. Stop at the end of the phase and
summarise: what changed, what you tested, what is next.
```

---

## 1. Design principles (every decision must pass these)

1. **Real cause → real effect → shown reason.** No effect without a Why card. No Why card without a real mechanism.
2. **Same direction as real life; magnitude compressed.** Slow processes (weeks) are sped up so students see them in days. The UI says so ("Slow changes are sped up so you can see them").
3. **Predict → observe → explain.** Before key actions, ask the student to predict ("What will this do to Mochi's sleep?"). A right prediction earns a small bonus. This is the actual learning loop.
4. **Never punish study.** Care affects pal XP rate, mood, looks and unlocks. It never touches correctness, mastery, streaks, records, the leaderboard or the teacher sheet.
5. **No death spirals.** A struggling or absent student must never lose a pal. Free staple meal, stasis while away, long grace (see §3.2, §5).
6. **Care costs ≤ 2 minutes a day.** Four touch-points for the pal (breakfast, lunch, dinner, bedtime) and one daily round for pets. Study stays the main activity.
7. **Body-positive, never shaming.** No "fat" or "thin" words, no calorie goals for the student, no diet or fasting actions (see §7).
8. **Honest simplification.** Every place the model simplifies has a "Real life is more complex" line (see §8).
9. **Standalone, single file, no new runtime dependencies.** Art is inline SVG. Audio and speech stay as they are.
10. **Deterministic and testable.** The simulation is pure functions plus a seeded random generator, tested headlessly in Node.

**Who is modelled:**
- **Study Pals = human (teen) physiology**, whatever the animal on the outside. The lessons transfer to the student's own body and to the DSE syllabus.
- **Pets = their own species' physiology.** Comparing them with the human pal is the lesson (ectotherm vs endotherm, metabolic rate vs lifespan, osmoregulation, metamorphosis).

---

## 2. What exists today (read these before coding)

| Area | Where | What it does now | Plan |
|---|---|---|---|
| Pal state | `src/pals.js` `newPal()` | `{xp, stage, energy, happy, t, meals}` | Keep fields; add `bio` block. `energy` and `happy` become **derived** from the model |
| Time | `palTick()` | energy −1.2/h, happy −0.3/h, cap 72 h, no clock | Replace with the lazy catch-up sim (§3.2) |
| Mood | `palMood()` | thresholds plus "after 22:00 = sleepy" | Derive from model; keep the `MOOD_*` tables |
| Food | `FOODS` (15 items), `feed()` | instant +energy, +happy; "3 treats a day = sugar crash" | Extend data; replace rule with the glucose model (§4.1) |
| Sickness | `ILLS`, `MEDS`, `maybeGetSick(.15 / .08)`, `openClinic()` | random illness; pick the right medicine | Keep the clinic UI; make illness **causal** (§4.8) |
| Daily facts | `DAILY_LIFE` (14 static lines) | random fun facts | Replace with live Why-log lines; keep the list as fallback |
| Pets | `PETS` (25 species) in `src/life.js`, `S.pets[id]=date`, `S.activePet` | unlock-only journal with a biology story | Add a **care layer** keyed by pet id (§5). Keep journal and unlock rules |
| Streak and clinic ties | `engine.js` ~L218 (daily roll), ~L1554 (after a room) | call `palTick()` and `maybeGetSick()` | Hook the sim in here |
| State/save | `engine.js` `freshState()`, `normalise()`, `save()` | localStorage; 12-char save code encodes progress only | New data lives under `S.pals[id].bio` and `S.care`; save code unchanged |
| Tests | `tools/check_content.js` (vm loader), `tools/smoke.js` (Playwright) | content and UI smoke | Add `tools/sim_test.js` (§10) |

Before changing anything, grep for every use of `.energy`, `.happy`, `palState(`, `S.treats` and `S.ill` so nothing breaks.

---

## 3. Architecture

### 3.1 New files (add to `PARTS` in `tools/build.py`, before `life.js` / `pals.js`)

| File | Contents |
|---|---|
| `src/sim_data.js` | Constants and tables: extended foods, activities, ills, weather by month, species profiles. **Data only.** |
| `src/sim.js` | Pure functions. No DOM, no `S` global, no `Date.now()`. Everything takes `(state, now)` and a seed. Must load in Node via `vm` like `check_content.js` does |
| `src/body.js` | UI: Body Lab, sleep report, check-up, predict prompts, Why log |
| `src/pets_care.js` | Pet care UI and glue (Phase 5+) |
| `tools/sim_test.js` | Headless scenario tests (§10) |

### 3.2 Time model (the part most likely to go wrong, so decide it once)

- **Lazy catch-up:** when the app opens (and every ~10 min while open), advance the sim from `bio.t` to now in **15-minute steps** (fast variables use 5-minute sub-steps). Cap one catch-up at **48 h**. 48 h × 4 = 192 steps, which is trivial.
- **Clock = the student's local clock.** Breakfast, lunch, night and school/weekend come from real local time. That is what makes "ate right before sleep" real.
- **Never go backwards:** if `now < bio.t` (clock changed), set `bio.t = now` and apply nothing.
- **Away mode (protects students):** if the app was closed for more than 18 h, run the remaining hours in **coast mode**: pal sleeps and eats a plain staple. Vitals can fall to *comfortable-low* but never below a safety floor, and **no illness can start from absence alone**. Pets enter **stasis** (§5.2).
- **Seeded randomness:** `rng = mulberry32(hash(palId, dayNum, stepIndex) >>> 0)`. Always `>>> 0` after XOR (known bug class in this family; see the 2026-10-03 s1science log line).
- **Slow-variable compression:** a single constant `TIME_COMPRESSION = 3` multiplies *slow* changes only (body reserves, micronutrient pools, fitness, bone, teeth). Fast variables (glucose, caffeine, sleep stages, hydration) run in real time. Show this to students in the Body Lab footer.

### 3.3 State shape (additions only)

```js
S.pals[id].bio = {
  v: 1, t: <ms>,
  // fast
  glucose: 5.0, insulin: 0, gut: [/* {t0, carb, fat, prot, fibre, gi, liquidMl, caffMg, kcal} */],
  glycogen: 70, water: 70, caffeine: 0, heart: 70, temp: 37.0,
  sleepP: 0.3,        // sleep pressure (Process S), 0..1
  alert: 70,          // derived alertness
  // medium (days)
  sleepDebt: 0,       // hours, rolling
  imm: 70, abTitre: {/*virus id: level*/}, vax: {/*vaccine id: {day, level}*/},
  acidMin: 0, plaque: 0, gutComfort: 80,
  // slow (weeks, compressed)
  reserve: 0,         // kg-equivalent above/below set-point
  fitness: 30, bone: 50,
  pool: { protein: 70, fibre: 70, ca: 70, fe: 70, vitC: 70, vitD: 60, vitA: 70, na: 40 },
  // schedule and traits
  bed: "22:30", wake: "06:45", traits: { chrono: 0, metab: 0, sweet: 0, lactose: 0 },
  // memory for explanations
  why: [/* ring buffer, max 60: {t, kind, text, topic, good} */],
  day: { /* today's tallies: kcal, sugarG, caffMg, activityMin, handwash, brush */ },
  week: [/* last 7 daily summaries for Care Score and Check-up */]
}
S.sim = { on: true, gentle: false, bodyShape: true, tc: 3 }   // class/teacher-level switches
S.care = { /* pets, Phase 5+ */ }
```

- `normalise()` must create `bio` lazily through `simEnsure(p)`. Old saves must load unchanged.
- **Flag-off equals old behaviour.** With `S.sim.on = false` the game must behave exactly as before. Phase 0 ships with it **off**; Phase 1 flips it on. Prove it with a golden test (replay scripted actions both ways).

### 3.4 The "Why" ledger (the heart of the education)

Every model effect pushes `{t, kind, text, topic, good}` to `bio.why`. Examples:
- `kind: "glucose"`, text: "Bubble tea has about 40 g of sugar in liquid form, so it left the stomach fast. Blood glucose peaked at 8.1 mmol/L, then insulin pulled it down.", topic: Nutrition / Homeostasis.
- Why cards show cause → mechanism → "what to try", written in the plain, short style of the existing `say("hachiware", …)` hints.
- The Why log is the only source of the "daily life" chat lines in the new system.

### 3.5 Public API of `sim.js` (keep it this small)

```
simEnsure(p)                    // create/upgrade bio
simAdvance(p, now, ctx)         // lazy catch-up; ctx = {weather, season, flags, rng}
simEat(p, foodId, now)          // adds to gut, logs why
simDrink(p, drinkId, now)
simDo(p, activityId, mins, now)
simSleepStart(p, now) / simSleepEnd(p, now)   // returns a SleepReport
simBrush(p, now), simWash(p, now), simVaccinate(p, vaxId, now)
simVitals(p)                    // all numbers the UI may show, with ranges and status
simMeters(p)                    // the 6 student-facing meters (0..100)
simCheckup(p, now)              // weekly lab report object
simRisk(p, now)                 // illness risk breakdown (for the Why card)
```

The UI never reads `bio` fields directly. It reads `simVitals` and `simMeters`.

---

## 4. Study Pal body model (human teen physiology)

Each block has: **Real biology → Model → What the student sees → Syllabus link**. All numbers are *starting constants to tune in tests*; the "Facts to verify" in §12 must be checked before any figure is shown to students.

### 4.1 ⛽ Fuel: digestion, blood glucose and hormones

**Real biology.** Starch is broken down by amylase (saliva, then pancreas) and maltase to glucose. Protein is broken down by pepsin (stomach, pH ~2) and then pancreatic proteases to amino acids. Fat is emulsified by bile (bile has no enzyme) and digested by lipase to fatty acids and glycerol. Glucose is absorbed in the small intestine, travels via the hepatic portal vein to the liver, and blood glucose is held near 4–6 mmol/L by **negative feedback**: high glucose → islet β cells release insulin → liver and muscle take up glucose and store it as glycogen; low glucose → α cells release glucagon → the liver breaks glycogen down. Fibre, fat and protein slow stomach emptying. High-GI foods and liquids empty fast.

**Model.**
- Each meal becomes an item in `gut[]`. Stomach emptying has a half-life: `th = 30 + 1.0·fat_g + 0.7·prot_g + 5·fibre_g − (liquid ? 15 : 0)` minutes, clamped 20–240. (Heuristic game constant; flag it in §8.)
- Glucose appearance `Ra` comes from emptied *available carbohydrate* (carb − fibre) × a GI speed factor (low 0.7 / med 1.0 / high 1.3).
- Glucose dynamics (5-min sub-steps), the structure to implement:
  ```
  dG/dt = c·Ra − Si·a·I − uptakeExercise + liverRelease(G, glycogen)
  dI/dt = b·max(0, G − G0) − I/τ        // insulin lags glucose
  G0 = 5.0 mmol/L,  c ≈ 0.05 mmol/L per g carbohydrate,  Si = insulin sensitivity (1.0 healthy)
  ```
- **Target curves** (tests assert these bands; tune constants until they hold):

  | Meal (healthy pal, Si = 1) | Peak glucose | Time to peak | Back to baseline | Dip below baseline |
  |---|---|---|---|---|
  | Apple | ~5.9 | 40 min | < 1.5 h | none |
  | Rice with vegetables | 6.5–7.0 | 60–75 min | < 3 h | ≤ 0.3 |
  | Steamed fish and rice | ≤ 6.5 | 75 min | < 3 h | none |
  | Bubble tea (≈ 40 g sugar, liquid) | 7.8–8.5 | 30–40 min | ~2.5 h | 0.6–1.0 below G0 |
  | Back-to-back treats | up to ~9.5 | 40 min | > 3 h | possible dip ≈ 3.8–4.0 |

  A healthy pal must never exceed ~10 mmol/L or fall below ~3.5 mmol/L (this protects the "pal never gets seriously ill from a normal diet" rule).
- **Glycogen** (0–100): fills when glucose is high, falls ~4%/h at rest (liver store is mostly used up overnight), faster with exercise. Empty glycogen with no food → "bonk" and the existing `hypo` illness path.
- **Insulin sensitivity `Si`** is reduced by sleep debt (§4.5), high reserves (§4.2) and inactivity (§4.7), and raised by fitness. Lower `Si` means a higher, longer glucose peak (the road toward type 2 diabetes). **It is reversible.**
- `energy` (the old 0–100 bar) = weighted blend of fuel state (glucose level and *rate of fall*), glycogen and alertness. A fast fall in glucose (> ~1.2 mmol/L per hour toward < 4.2) shows as "wobbly / drowsy".
- This **replaces** the "3 treats = sugar crash" rule. The crash now emerges from the curve, with a Why card that tells the honest story (see §8 item 1).

**Student sees.** A live **glucose line chart** for the day with the 4–7.8 healthy band shaded, meal icons on the time axis, and the four hormone arrows (insulin ↑ / glucagon ↑). Each meal shows "Predicted vs actual peak".
**Syllabus.** Nutrition in humans (digestion, enzymes, absorption), Homeostasis (blood glucose regulation, negative feedback), Enzymes and metabolism.

### 4.2 ⚖️ Energy balance and body reserves

**Real biology.** Energy in (food) minus energy out (basal metabolism + thermic effect of food + activity) is stored (mostly as fat) or drawn from stores. About 7,700 kcal ≈ 1 kg of fat tissue is a standard approximation; real weight change is slower and self-correcting because expenditure changes as weight changes. Protein has a bigger thermic effect than fat.

**Model.**
- Default pal needs ~**2,300 kcal/day** (traits move it ±8%). Out = BMR (~1,450 × metabolism trait) + activity (MET × 55 kg × hours) + thermic effect (carb ~7%, protein ~25%, fat ~2% of intake). Sitting to study ≈ 1.3 MET.
- `reserve += (kcal_in − kcal_out) / 7700 × TIME_COMPRESSION`. Adaptive damping: expenditure drifts ±3% with reserve, which creates the real-life plateau.
- Short-term "weight" wobbles are mostly **water bound to glycogen** (≈ 3 g water per g glycogen). Show this in a Why card; it explains why a scale can mislead.
- **Shape bands** (art: scale the body and belly SVG ±8%; no sad faces for any band): *lean · just right · well-stocked · extra-stocked*. The shape is cosmetic. The *effects* below are what matter.

| Sustained state (≥ ~5 game days) | Effects (all reversible, all explained) |
|---|---|
| Low reserve | less stamina, "feels cold", slower recovery after illness, growth readiness stalls, mood dips. Why card: "not enough fuel for growth and repair" |
| Just right | baseline |
| Extra reserve (e.g. +1,000 kcal/day for 10 days) | `Si` −10 to −30%, resting heart rate +5–8 bpm, stamina down, hotter in summer, check-up flags "keep an eye on". Fixed by activity and a few steadier days |

**Honest note shown to students.** "It is the extra energy that gets stored, not the time on the clock. But eating a big meal late still makes sleep and glucose control worse." (see §8 item 2).
**Syllabus.** Nutrition in humans (balanced diet, obesity as a health topic), Respiration, Health and diseases (non-communicable diseases and lifestyle).

### 4.3 🥗 Balanced diet: nutrient pools

**Real biology.** Seven nutrient classes: carbohydrate, lipid, protein, vitamins, minerals, fibre, water. Deficiencies take **weeks to months** to show because the body holds stores (vitamin C: scurvy after about 1–3 months of near-zero intake; iron: anaemia after depleted stores; vitamin D and calcium: weak bones; vitamin A: night blindness). Tea and coffee tannins reduce non-haem iron absorption; vitamin C increases it. Lactose intolerance (low lactase after childhood) is very common in East Asian populations: it is an **enzyme** story.

**Model.**
- Extend `FOODS` from 15 to **~35** (add tofu, choy sum, orange, spinach, carrot, oats, wholemeal bread, nuts, yoghurt, chicken, beef, sweet potato, soy milk, plain water, lemon tea, soda, fries, instant noodles, egg waffle, etc.). Fields: `kcal, carb, sugar, protein, fatSat, fatUnsat, fibre, sodiumMg, caffMg, liquidMl, gi (L/M/H), group (HK Food Pyramid), lvl: {ca, fe, vitC, vitD, vitA}` where each level is 0–3 (none, low, medium, high). **Levels, not fake-precise milligrams.**
- Pools (0–100) fill from servings and decay daily so a balanced diet sits near ~70. A pool below ~15 for N game days (vitamin C ~7, iron ~12, vitamin A/D ~10, all compressed) triggers the matching deficiency illness through the clinic. Keep `scurvy` and `anaemia`; add rickets (D/Ca) and night blindness (A). Check the syllabus before adding more.
- **Interactions to model (each gets a Why card):** milk tea with a meal lowers iron absorption; an orange alongside spinach raises it; fibre and water together keep gut transit comfortable; a very salty meal raises thirst and a short-term blood-pressure bump.
- **Trait: lactose intolerance.** Affected pals bloat after milk. They get calcium from tofu, choy sum or lactose-free milk. Teaches enzyme specificity.
- **Plate view:** a 7-day plate wheel (HK Healthy Eating Food Pyramid groups) instead of a "good/bad" list. Describe foods by what they are *rich in*, not by moral labels. The existing green/yellow/red dots stay as "everyday / sometimes / treat", not as guilt.
- **Fairness:** a free **canteen staple** each meal slot (a rotating balanced meal). Chestnuts buy variety, treats, extras and medicine. Never gate survival on chestnuts.

**Syllabus.** Molecules of life, Nutrition in humans, Health and diseases (deficiency diseases).

### 4.4 💧 Water, kidneys and heat

**Real biology.** Water in: drinks and food (~20%). Water out: urine (≥ ~500 mL/day obligatory), breath and skin (~0.8–0.9 L), sweat (up to ~1 L/h in hot exercise), faeces. Low blood water → raised osmolarity → hypothalamus → thirst and **ADH** → kidneys reabsorb more water → smaller, darker urine. Evaporating sweat cools the body, but in hot **humid** air (Hong Kong summer) sweat evaporates poorly, so heat illness risk rises. In cold, skin vessels constrict and muscles shiver.

**Model.**
- `water` (0–100) with thirst threshold ~45, trouble < 30. Urine colour scale 1–8 (a real clinical heuristic) as a reading, not a goal to obsess over.
- **Weather** by date: deterministic table by HK month (hot-humid Apr–Oct; cool fronts Dec–Feb; typhoon signal days block outdoor activity). Weather modifies sweat loss, activity options and the dress-up items that matter (sun hat, umbrella, jacket).
- Effects: low `water` → lower alertness, headache, constipation, concentrated urine; exercise in heat with low `water` → the existing `heat` illness (cure `cool`).
- **Free water** always. Moderate tea/coffee still hydrates (see §8 item 4).

**Syllabus.** Homeostasis (osmoregulation, ADH, thermoregulation), Coordination and response.

### 4.5 😴 Sleep and the body clock (the user's headline example)

**Real biology.**
- **Two-process model (Borbély):** *Process S* (sleep pressure, adenosine builds while awake, clears in sleep) and *Process C* (the circadian clock in the hypothalamus, light-driven via the SCN). Alertness is roughly C minus S. This is why there is an early-afternoon dip even without lunch.
- Teens need ~8–10 h. Adolescents' clocks run later (delayed phase), so early school starts clash with biology.
- Sleep has ~90-minute cycles: light sleep → **deep slow-wave sleep (SWS, mostly early in the night: growth-hormone pulses, glucose handling, memory consolidation)** → **REM (more in the later cycles: emotional processing, memory)**.
- **Caffeine** blocks adenosine receptors; half-life ≈ 5 h (range ~3–7). Roughly half of an afternoon dose is still active at bedtime.
- Evening bright light / screens delay melatonin; content that excites matters too. The light effect is real but smaller than popular claims.
- A large or fatty meal close to bedtime delays sleep onset, can cause reflux when lying down, and keeps digestion and core temperature up. Evening sugar-heavy, low-fibre eating is associated with lighter, more broken sleep. A **small light snack is fine**: don't teach "never eat before bed".
- Hot humid nights reduce deep sleep and REM.
- **Short sleep changes appetite hormones** (leptin down, ghrelin up) and raises craving for sugary, high-calorie food. It reduces insulin sensitivity and weakens immune defence.
- Sleep debt builds and **performance keeps falling even when people stop feeling that tired**.

**Model.**
- Pal sleep schedule: default **bed 22:30, wake 06:45** on school days, later at weekends. The student can change it within 21:00–01:00 / 05:30–09:30.
- **Two ways to sleep:**
  1. **Auto:** during the scheduled window the pal sleeps. If the student opens the game, "You woke me!" causes fragmentation (and logs it as night screen time).
  2. **🌙 Tuck in** button: lights out now, with a short bedtime biology fact. Lights-out earlier than the schedule is a small positive bonus.
- **Process S:** awake `S += (1 − S)(1 − e^(−dt/18.2h))`; asleep `S −= S(1 − e^(−dt/4.2h))` (the published human-model constants). **Process C:** a 24-h cosine with a peak late afternoon, shifted by the `chrono` trait (lark/owl). `alert = f(C − S)` plus a small caffeine boost.
- **Sleep onset latency** = 15 min + penalties:

  | Factor at bedtime | Effect (starting size) | Real basis (see §12) |
  |---|---|---|
  | Large/fatty meal ended < 3 h ago | latency +10–25 min, efficiency −5%, SWS −10% | gastric emptying 3–4 h, reflux when lying down |
  | Sugary, low-fibre evening meal or drink | SWS −, more arousals | observed associations |
  | Caffeine still ≥ ~100 mg | latency +10–30 min, SWS − | adenosine antagonism, half-life ~5 h |
  | Game or bright screen in the last 60 min | melatonin onset +15–30 min | light via ipRGC, modest effect |
  | Vigorous exercise < 1 h before | latency +5–10 min (evidence mixed) | small effect |
  | Hot humid night | SWS and REM −; the fan/AC option offsets it | core-temperature drop needed for sleep |
  | Hungry (glucose low at bedtime) | small, possible 3 am waking | |
  | Light snack ≤ 200 kcal, low fat | **no penalty** | |
  | Worry or exam stress | latency + | cortisol |

- **Sleep quality `Q` (0–1)** = duration vs need (8–10 h) × efficiency × SWS fraction × continuity. Cap one bad night at about −15% next-day effects. **Chronic debt compounds** (rolling 7-day `sleepDebt`).
- Optional nuance: show a **self-rated alertness** bar that lags the real one when debt is high ("feels fine, performs worse").
- **Naps:** 20 min = alertness boost; > 30 min = sleep inertia (groggy); a late nap lowers night-time sleep pressure.
- **Weekend sleep-in** shifts the clock; Monday shows "social jet lag" (alertness dip). Phase 7 candidate.

**Next-day effects (each explained):** alertness baseline and pal XP rate (mild, ≤ −15% for one night, up to −30% for chronic debt), mood, appetite (the pal asks for treats more; satiety lower), insulin sensitivity ↓ (§4.1), immune strength ↓ (§4.8).

**Student sees.** A **Sleep report** every morning: bedtime, time to fall asleep, hours, a simple **hypnogram** (stage bars across the night), a 1–5 star rating and a **"What affected this?"** list from the Why ledger, for example: *"Bubble tea at 21:30: caffeine half-life is about 5 h, so about half was still active at bedtime."*
**Learning bonus (evidence-based, low-risk): 🌙 Dream Replay.** Each morning the pal "replays" up to **3 of yesterday's mistakes** from `S.mistakes` as retrieval practice (question first, then answer). Good sleep (`Q ≥ 0.7`) unlocks all 3 plus a small XP bonus; poor sleep gives 1 plus a message about memory consolidation. **The Notebook is always fully available**: only the *bonus* depends on sleep.
**Syllabus.** Coordination and response (nervous system, hormones), Homeostasis, Nutrition in humans, Health and diseases. Also a gentle mirror of the student's own habits.

### 4.6 ☕ Caffeine and drinks (small module inside 4.5)

- `caffeine` pool with exponential decay (half-life ~5 h). Foods carry `caffMg` (verify HK milk tea, bubble tea, cola, coffee, energy drinks; see §12).
- Effects: reduces *felt* sleep pressure for a few hours; raises heart rate slightly; delays sleep (§4.5). A Why card at 14:00 shows the decay curve and "the 10 pm level".
- Moderate intake does not dehydrate (§8 item 4).

### 4.7 🏃 Movement: heart, lungs, muscles, fitness

**Real biology.** Exercise raises heart rate (cardiac output = heart rate × stroke volume) and breathing rate; muscles use glucose and glycogen and, when oxygen runs short, make **lactic acid** (lactate) by anaerobic respiration; after hard exercise breathing stays raised to repay the **oxygen debt**. Training lowers resting heart rate (bigger stroke volume), raises glucose uptake without needing much insulin, and improves sleep and mood. Delayed muscle soreness (1–3 days later) comes from tiny muscle-fibre damage, **not** leftover lactic acid.

**Model.**
- Activities with METs (starting values): stretch break 2.3, tai chi/yoga 2.5–3, walk 3.5, cycle 6–8, swim 6–8, basketball 6.5–8, jog 7, stairs 8. Durations 10/20/30 min. Typhoon or heavy rain blocks outdoor ones (the stairs and stretch break always work).
- Effects per session: kcal (MET × 55 kg × h), glycogen drain, sweat (needs `water`), heart rate curve (rest ≈ 70 → up to ~85% of ~195–200 in vigorous work), breathing rate, lactate for vigorous work, glucose uptake, next-night sleep depth ↑ (moderate to vigorous, not within an hour of bed).
- `fitness` (slow): +0.4 per ≥ 30-min session on a day, with a weekly dose similar to the WHO child/teen guidance (≈ 60 min a day of moderate-to-vigorous activity). Detraining decays ~0.5%/day. Higher fitness: lower resting heart rate (−5 to −10 bpm), faster recovery heart rate, better `Si`, more daily XP stamina.
- **Sitting while studying** adds a tiny "stand up and stretch" prompt after long sessions (links to §4.10 eyes).
- First time a *new* hard activity is done, next day shows "muscle soreness" with the correct explanation.

**Student sees.** After any exercise a live **heart rate and breathing graph** (rest → exercise → recovery) and the lactate and oxygen-debt story. This doubles as the DSE practical on effect of exercise on pulse and breathing.
**Syllabus.** Cellular respiration (aerobic and anaerobic), Gas exchange, Transport in humans, Homeostasis, Health (physical activity).

### 4.8 🛡️ Defence: immunity, infection and medicine

**Real biology.** Pathogens (virus, bacterium, fungus, parasite, protist) cause infectious disease. Barriers (skin, mucus, stomach acid), then phagocytes, then the **adaptive response**: lymphocytes make specific antibodies. The **primary response is slow** (days to ~1–2 weeks) and small; the **secondary response (after infection or vaccination) is faster (2–3 days), bigger and longer-lasting** thanks to memory cells. Fever is a hypothalamic set-point rise driven by pyrogens and is part of defence; paracetamol eases discomfort. Antibiotics act only on bacteria. **Stopping a course early or using antibiotics when they are not needed lets resistant bacteria survive and multiply**: natural selection in action. Short sleep, poor nutrition and stress lower resistance; crowds and poor hand hygiene raise exposure. Hong Kong has two flu peaks a year (winter and summer).

**Model.**
- `imm` (0–100) = base × sleep factor × nutrition factor × stress factor × (1 + vaccine protection). Keep this honest: **do not claim vitamin C or "immune-boosting foods" prevent colds** (§8 item 9). Nutrition matters through *adequacy*, not mega-doses.
- **Exposure events (replaces random dice):** crowded day (school, MTR), a classmate ill, flu season weight, hand-wash prompts before meals (a quick optional tap that lowers gut-infection exposure). Hygiene cuts exposure, not "luck".
- `P(infect) = 1 − exp(−dose × (1 − protection))`, protection from antibody titre (`abTitre[virus]`) and `imm`. Roll with the seeded rng. Show the breakdown on a **risk card** before the roll when the student has a "Check risk today" button (predict step).
- **Course of illness:** incubation (cold 1–3 d, flu ~1–4 d, strep 2–5 d, norovirus ~1–2 d, Salmonella ~0.5–6 d) → symptoms and fever → recovery. Antibody curve is drawn from the pal's own data, **primary vs secondary** side by side (great DSE graph).
- **Vaccination (💉):** the seasonal flu shot (HK school outreach runs in autumn/winter). Antibody titre rises over ~2 weeks, wanes over months. During flu season a vaccinated pal's infection probability is much lower. A graph shows why.
- **Antibiotic stewardship mini-simulation (Phase 4):**
  1. Strep-type infection gets a **5-day course**; each day shows a colony graph of *susceptible* (blue) and *resistant* (red; starts ≈ 1 in a million).
  2. On day 2–3 symptoms fade and the game asks "Stop early?". If the student stops, the susceptible bacteria are gone but the resistant remainder regrows, so **relapse** with a "this strain no longer responds to that antibiotic" message and a different drug needed.
  3. Antibiotic given for a virus: no cure, plus a gut-flora upset (a day of loose stool and `gutComfort` ↓) and a visible "resistance pressure" counter in the Why log.
- Keep `ILLS` and `MEDS` and the clinic UI. Change **when and why** illness starts, not the choose-the-treatment loop. Add the course and relapse data to each ill.

**Syllabus.** Health and diseases (pathogens, immunity, vaccination, antibiotics), Biodiversity and evolution (natural selection, resistance), Cells (antibodies).

### 4.9 🦷 Teeth and gut

- **Teeth (Stephan curve).** After sugar or starch, plaque bacteria make acid and plaque pH drops below ~5.5 for roughly 20–40 minutes, which dissolves enamel; saliva and fluoride repair it. **Frequency of exposures matters more than total amount**, and sipping a sugary drink for an hour is one long acid attack. Model `acidMin` (minutes with acid), `plaque` (removed by brushing), and an enamel health value. A cavity appears after a cumulative threshold across days; a dentist visit fixes it. Show a **pH-over-time Stephan curve** for the pal's day. **Syllabus:** Nutrition in humans (teeth, dental caries).
- **Gut.** Transit comfort `gutComfort` rises with fibre and water, falls with low fibre/low water (constipation) or antibiotics (flora upset). **Syllabus:** Nutrition in humans (peristalsis, fibre).

### 4.10 😊 Mood, stress and eyes (explainable, not mystical)

- `happy` = baseline + explainable contributions: sleep `Q`, movement, steady glucose, outdoor time, social play (Term Match, other pals), achievements. Missing needs subtract. Each contribution appears in the Why log. Avoid pop-science attributions (e.g. do not claim "serotonin from the gut"); say what research supports: sleep loss reduces emotional regulation; regular activity lifts mood.
- **Stress (optional, Phase 7):** an "exam week" event with evidence-based coping options (breathing, a walk, sleep protection). Chronic stress lowers `imm`. **Never** generate student stress from low scores.
- **Eyes and screens (Phase 7, Hong Kong relevant):** long study sessions cause eye strain; the 20-20-20 habit helps; **outdoor time protects against myopia progression** (strong evidence from school trials; confirm figures before display). Syllabus: Coordination and response (the eye, accommodation, correcting short sight with a concave lens).

### 4.11 🌱 Growth and the Care Score (link to evolution)

- Evolution (`EVO`, stages Baby/Junior/Master) stays XP + chestnuts. Reframe the language as **development**.
- **Care Score** (0–100) = mean of six domains over the last 7 days: Fuel (balanced and regular), Sleep, Move, Water, Defence (hygiene, vaccine), Teeth. A low score gives no punishment beyond the natural effects. A **high** score gives up to **+15% pal XP**, a **Radiant** aura at ≥ 80 for 7 days, and a **bonus trait** when evolving. This keeps the incentive positive.

### 4.12 🧬 Individual differences (traits, Phase 7)

Each pal gets a few seeded traits to show that people differ and that traits are inherited: chronotype (lark/owl; fits Chiro the bat and Luna the owl), metabolism (±8%), sweet tooth (craving strength), stress sensitivity, lactose tolerance. Keep it to four or five traits.

### 4.13 🩺 The weekly check-up (the education bridge)

- Once a week (or on demand), **Dr Koma** shows a **lab report** from the pal's last 7 days with a reference range and status for each item. Teen-appropriate ranges (verify): resting heart rate ~60–100 bpm, fasting glucose ~4.0–5.5 mmol/L (<6.1 normal in HK practice), haemoglobin ~12–16 g/dL, vitamin D adequate ≥ ~50 nmol/L, urine colour, a "body reserve" band (not BMI), sleep average, activity minutes.
- From the same data the game generates **3 DSE-style questions** with a small chart (a glucose day, a sleep week, a heart-rate trace, an antibody curve): *"Describe the pattern. Explain it. Suggest a change."*. Reuse `graphs.js` and the existing graph-question renderer. Answers go through the **existing question and scoring pipeline** (do not invent a second scoring path); correct answers earn chestnuts.
- Out-of-range values give a gentle "worth a look" with the cause chain, never alarm.

---

## 5. Pets: Rescue, care, grow, age

### 5.1 Framing and ethics (a recommendation, see §11)

Many of the 25 species are endangered, wild-only or cannot ethically be kept (dolphin, penguin, spoonbill, golden coin turtle). Frame the system as a **Nature Rescue Centre**: students *rehabilitate, care for, breed (conservation programmes) and release* animals. Three modes per species:

- **Keep** (appropriate in a care setting): axolotl, clownfish, seahorse, octopus, sea star, jellyfish, firefly, monarch, spider, chameleon, mantis shrimp, tardigrade, naked mole-rat, platypus, hummingbird (sanctuary), red panda (sanctuary), sloth (sanctuary), fennec (sanctuary).
- **Sanctuary** (rehab, then release or lifelong sanctuary): kakapo, golden coin turtle, horseshoe crab, Romer's tree frog.
- **Monitor** (population mini-game, never "kept"): Chinese white dolphin, black-faced spoonbill, emperor penguin. Survey boat and wetland health, not feeding.

(Executor: confirm the grouping against the existing story texts before final.)

### 5.2 The life clock

- Each pet has a `lifeDays` in **play days** (days the student opened the game). Real age advances only on **study days**, so a student away for two weeks does not lose a pet. While away > 2 days the pet enters **stasis** ("the keepers look after it").
- Scaling formula (starting point; tune later): `lifeDays = max(10, round(10 × years^0.75))` where `years` is a typical care or captive lifespan. This preserves the *ordering* of real lifespans (the learning point) without 90-year games. **Show** each pet's real lifespan next to its game life clock ("1 game day ≈ N real weeks for this species").
- Stages: **Egg / Larva / Juvenile / Adult / Senior** (species decide which exist). Fractions per species, e.g. axolotl 5%/30%/55%/10%; monarch egg·larva·pupa·adult in roughly 1/3/3/3 game days.
- **Welfare** (0–100) sets the rate of growth and the lifespan modifier: poor long-term husbandry shortens life by up to −20%; excellent care adds up to +10% (captive animals often outlive wild ones). Neglect **never** kills a pet: the worst case is a "needs help" state and stunted growth. Death occurs only as natural end of life in Senior stage (§5.5). With **Gentle mode** there is no death: seniors retire to the sanctuary.
- Welfare uses the real **Five Domains** animal-welfare model: nutrition, environment, health, behaviour (enrichment and social needs), mental state.

### 5.3 Four care archetypes (one engine each, species just supply data)

| Archetype | Species | Core mechanic (the biology lesson) |
|---|---|---|
| **Aquatic** | clownfish, seahorse, axolotl, octopus, sea star, mantis shrimp, jellyfish, horseshoe crab | **Water quality:** temperature, salinity, dissolved oxygen, and the **nitrogen cycle**. Uneaten food → ammonia (toxic) → nitrite → nitrate by nitrifying bacteria. A **water-test strip** shows readings, and a **water change** resets nitrate. Marine animals in fresh water → osmosis problem (osmoconformers like sea stars suffer in low salinity). Gills = gas exchange |
| **Ectotherm terrarium** | chameleon, tree frog, golden coin turtle, tardigrade (micro) | **Thermal gradient and UVB.** Metabolic rate follows temperature (**Q10 ≈ 2**: roughly doubles per +10 °C), so a cold reptile eats and digests less (enzymes and temperature). UVB makes vitamin D → calcium → bones (metabolic bone disease if absent). Amphibian skin needs moisture; chytrid fungus is a real threat |
| **Endotherm energy budget** | red panda, sloth, fennec, platypus, hummingbird, kakapo, naked mole-rat | **Energy budget by size and diet** (Kleiber: metabolic rate ∝ mass^0.75). Specialist diets (bamboo, leaves, nectar, insects), torpor, water economy (fennec), heat stress (red panda above ~25 °C), social colony (mole-rat) |
| **Invertebrate life cycle** | firefly, monarch, spider, tardigrade | **Metamorphosis and moulting.** Egg → larva → pupa → adult, with a different diet and habitat per stage (monarch larva needs milkweed; firefly larva eats snails; moulting needs calcium and shelter) |

### 5.4 Species table (starting data; verify every lifespan against AnAge/IUCN, see §12)

`game days` = formula in §5.2 with a mid typical value. The *signature mechanic* is what makes the species unique and teachable.

| id | Archetype · mode | Real lifespan (approx.) | ≈ game days | Signature mechanic (real biology) | Syllabus link |
|---|---|---|---|---|---|
| redpanda | Endotherm · Keep (sanctuary) | ~8–10 y wild, up to ~15–20 captive | ~64 | Bamboo is low-energy and cellulose is hard to digest, so it conserves energy, sleeps lots, and overheats if warm | Nutrition, homeostasis |
| clownfish | Aquatic · Keep | ~6–10 y wild, 10+ captive | ~48 | Anemone **mutualism**; mucus coat; **all hatch male, dominant becomes female** | Ecosystems, reproduction |
| axolotl | Aquatic · Keep | ~10–15 y (captive) | ~64 | **Neoteny** (stays larval with external gills); regeneration; keep cool water; albino is a simple recessive trait | Genetics, development, gas exchange |
| seastar | Aquatic · Keep | species vary (~5–35 y) | ~76 | Osmoconformer, **regeneration**, tube feet, external digestion | Osmosis, classification |
| penguin | Endotherm · Monitor | ~15–20 y wild | ~84 | Countercurrent heat exchange, huddling; male fasts through incubation | Homeostasis |
| sloth | Endotherm · Keep (sanctuary) | ~20–30 y | ~112 | Very low metabolic rate, slow gut fermentation, wide body-temperature swings | Respiration, nutrition |
| firefly | Invertebrate · Keep | larva 1–2 y; adult weeks | ~14 | **Bioluminescence = luciferin + luciferase (enzyme) + ATP + O₂**; needs a dark habitat (light pollution) | Enzymes, ATP |
| monarch | Invertebrate · Keep | adult weeks; migrants ~8 months | ~10 | **Complete metamorphosis**; milkweed toxins (warning colours); multi-generation migration | Reproduction/development, ecosystems |
| octopus | Aquatic · Keep | ~1–2 y | ~14 | **Semelparity** (female stops eating after brooding, then dies); three hearts, copper-based blue blood; needs enrichment | Transport, life history |
| mantis | Aquatic · Keep | ~3–6 y | ~33 | **Moulting (ecdysis)**; hard to keep after moult; exceptional eyes | Arthropod growth, senses |
| fennec | Endotherm · Keep (sanctuary) | ~10–14 y | ~64 | Desert water economy (concentrated urine), big ears radiate heat (surface area : volume), nocturnal | Homeostasis, adaptation |
| platypus | Endotherm · Keep (sanctuary) | ~12–17 y wild, longer captive | ~76 | Egg-laying mammal; electroreception; eats a large share of body mass daily | Classification, nutrition |
| tardigrade | Invertebrate · Keep | ~3–30 months active | ~14 | **Cryptobiosis (tun):** can pause life when dry, so the **life clock pauses** and a neglected one survives; revives with water | Metabolism, water |
| seahorse | Aquatic · Keep | ~1–5 y | ~23 | **Male pregnancy**; no stomach, so it needs very frequent small meals | Reproduction, nutrition |
| spider | Invertebrate · Keep | ~1 y | ~10 | **Courtship dance mini-game = sexual selection**; short life | Evolution |
| chameleon | Ectotherm · Keep | ~3–7 y | ~33 | Colour change from **tunable nanocrystal lattices in skin** (not just pigment), UVB and basking | Coordination, vitamin D |
| hummingbird | Endotherm · Keep (sanctuary) | ~3–5 y typical | ~28 | Highest mass-specific metabolic rate; heart ~1,000+ bpm; **nightly torpor** if energy low; nectar sugar | Respiration, homeostasis |
| jellyfish | Aquatic · Keep | **Can revert to polyp** (not invulnerable) | ~20 per cycle | **Reverse development** when stressed: life restarts once; can still die to predators or disease | Cells, development, ageing |
| molerat | Endotherm · Keep | ~30+ y | ~128 | **Mortality does not rise with age**; cancer resistance; tolerates low oxygen; **eusocial colony with a queen** | Evolution, ageing, social behaviour |
| kakapo | Endotherm · Sanctuary | up to ~60–90 y (estimates) | ~215 | Breeds only in some years (rimu mast); **small population = inbreeding**; flightless, nocturnal | Genetics, conservation |
| spoonbill | Endotherm · Monitor | ~15 y+ | ~76 | **Migration** between breeding grounds and **Mai Po** wetland; food chain, pollutants (bioaccumulation) | Ecosystems |
| treefrog | Ectotherm · Sanctuary | not well known (few years) | ~28 | **Direct development** (eggs on land, no tadpole); moist skin respiration; chytrid risk | Gas exchange, development |
| dolphin | Endotherm · Monitor | ~30–40 y | ~144 | Calves nurse; **skin flushes pink when exerted** (vasodilation); echolocation | Homeostasis, senses |
| turtle | Ectotherm · Sanctuary | decades (~20–30+) | ~128 | Q10 and temperature; shell and calcium; illegal trade drives extinction risk | Conservation, enzymes |
| horseshoe | Aquatic · Sanctuary | ~20+ y; ~10 y to mature | ~95 | **Copper-based blue blood** clots with bacterial toxin (used for medical testing); intertidal nursery, tide clock | Transport, ecosystems |

Every figure above is marked `verify` in `sim_data.js` until a source is recorded; do not display a figure that has no source.

### 5.5 Ageing, endings, legacy (species-specific, and each is a lesson)

- **Senior stage:** slower, sleepier, needs softer food and extra warmth. Natural end after the stage completes.
- **Species twists (accurate):** *octopus*: female stops eating after brooding and declines (hormone-driven senescence); *naked mole-rat*: **no rise in death risk with age** until the end; *immortal jellyfish*: **rebirth** as a polyp when stressed or old; *tardigrade*: **tun** pauses the clock; *monarch / firefly / spider*: the end of the life cycle after reproduction.
- **Ending ceremony (gentle, short):** a **Life Report**: lifespan vs species average, welfare line graph, size-by-age growth curve, favourite food, offspring count, and the biology story's key fact. The pet moves to the **Memory Garden** (journal page remains). **Gentle mode** replaces this with "retires to the wild reserve".
- **Release option** (Sanctuary mode): at adulthood with welfare ≥ 70 the student can release it into a "protected habitat"; a conservation fact card follows.

### 5.6 Breeding and genetics (Phase 6)

- Pets flagged `breed` can reproduce at maturity when pair, habitat and welfare conditions are met. Offspring inherit **1–2 simple heritable traits** with Mendelian rules (e.g. axolotl: wild-type vs albino, recessive). Show a **Punnett square**, ask the student to **predict** the ratio, then **really roll** the offspring so small-sample variance appears (4 eggs rarely give exactly 3:1).
- Rare mutation (~1–2%). **Small founder population → inbreeding** lowers fertility (kakapo conservation lesson). Show a **pedigree-style family tree** across 3 generations.
- Clownfish **change sex**; seahorse **male broods**; monarch has **generations** with a migratory one that lives longer.

### 5.7 Care loop (keeps it light)

- **Daily round** screen: each kept pet shows 3 icons for its top needs. **"Do the usual"** completes the species-appropriate routine in one tap (training wheels). A **Learn mode** lets students make each choice (food type and amount, temperature, water change) for bonus predictions.
- **Max one surprise problem per day** (cloudy water, shed skin stuck, missing milkweed) as a short problem-solving card. Limit of **3 active habitats** at a time.
- **Journal:** keep the existing `openPet()` story. Add tabs: *Care*, *Life clock*, *Family tree*, *Compare* (side-by-side with the human pal: heart rate, lifespan, body temperature, diet).

---

## 6. UI surfaces (phone first, 360 px; wrap, never scroll sideways)

| Surface | What it shows | Notes |
|---|---|---|
| **Pal panel (existing)** | 6 meters: ⚡ Energy · 😴 Alert · 💧 Water · ❤️ Mood · 🛡️ Defence · 🏃 Fitness; one "Do next" chip | Replaces the 2-bar panel; keep the mood face |
| **Body Lab** (new tab) | **Today** (24-h strip: meals, caffeine, exercise, sleep; live glucose chart) · **Body** (cut-away organ map that lights up stomach, small intestine, liver, pancreas, heart, lungs, brain, kidneys) · **Report** (sleep report, check-up) · **Why log** | Reuse `DIAGRAMS`/`icons.js`; every graph has a text summary; colour is never the only signal |
| **Feed modal (existing)** | Adds time-of-day line, a **Predict** prompt for sleep/glucose, and "what is this rich in" instead of moral labels | Keep nutrition cards |
| **Bedtime** | 🌙 Tuck in, schedule editor, tomorrow's weather | Short bedtime fact |
| **Clinic (existing)** | Risk breakdown, antibody curve, antibiotic course, check-up lab sheet | Same medicine cabinet |
| **Rescue Centre (new tab)** | Habitats with 3 need icons, daily round, life clock, Compare | Archetype panels |
| **Settings (teacher/student)** | Gentle mode, body-shape on/off, pause for holidays/exams, schedule | Stored in `S.sim` |

Respect `prefers-reduced-motion`. Reuse the clay-button/card styling in the UI 3.0 override block at the end of `src/head.html`. Watch the `.x svg` sizing gotcha (emoji icons; `.ic` is `!important`).

---

## 7. Guardrails (safety, fairness, privacy)

1. **Body image and eating disorders.** The audience is 15–18. No "fat/skinny" words, no calorie or weight goals for the student, no diet, fasting or "burn it off" mechanics, no reward for being underweight, no numbers about the student's own body. Both low and high reserves are described as *energy reserves* that need balance. The footer on health screens: "This is a simplified model, not medical advice. Talk to a doctor, school nurse or counsellor about your own health."
2. **Fairness.** Free canteen staple at every meal; stasis while away; no pet or pal loss from neglect; free water; chestnuts only buy extras.
3. **No effect on academics.** Nothing in this system changes question correctness, mastery, streaks, records, leaderboard or the teacher sheet. Dream Replay and Check-up questions use the existing question and scoring pipeline only.
4. **Death and distress.** Gentle mode (teacher default switch). Endings are short and kind. Never random.
5. **Alcohol, drugs, self-harm, dieting.** Not modelled. Do not add them.
6. **Privacy.** No student names or personal data in the repo, no new fields in the cloud records. Care data stays in the browser save unless a later phase adds an aggregated, name-free teacher view.
7. **Originality.** Original art only. No official artwork, logos or music from existing franchises.
8. **Teacher sign-off** before each phase ships: a Biology teacher checks every Why card and number.

---

## 8. Science accuracy ledger (what to teach, and what to flag as simplified)

| # | Popular belief | What is more accurate | How the game handles it |
|---|---|---|---|
| 1 | "Sugar makes you crash" | Glucose is tightly regulated; healthy people usually get only a *small* dip after a fast spike, and tiredness after a meal has other causes (meal size, circadian dip, sleep). Fast swings are felt more | Dip is small; Why card says "usually small in a healthy body". Large swings only with lower `Si` |
| 2 | "Eating late makes you fat" | Total energy balance decides storage. Late big meals do worsen sleep and evening glucose handling | Both statements shown together |
| 3 | "Lactic acid causes muscle soreness" | Lactate is cleared within about an hour; soreness (DOMS) is micro-damage | Show lactate rising and clearing; separate DOMS card |
| 4 | "Tea and coffee dehydrate you" | At moderate doses they hydrate overall | Count the water; mention the small diuretic effect |
| 5 | "7,700 kcal = 1 kg" | A standard approximation; the body adapts and weight also moves with water and glycogen | Damped model; state the simplification |
| 6 | "Everyone needs exactly 8 h" | Teens ~8–10 h; individuals differ | Range plus chronotype trait |
| 7 | "Antibiotics help colds" | They only act on bacteria; misuse drives resistance | Gut upset plus resistance counter |
| 8 | "Fever is the illness" | Fever is part of the immune response | Fever shown as a defence signal; paracetamol for comfort |
| 9 | "Vitamin C prevents colds" | Not for the general population; deficiency causes scurvy | **Do not** model vitamin C as cold prevention |
| 10 | "Blue light alone ruins sleep" | Real but modest; what you are doing on the screen and when also matters | Modest penalty plus a content/time note |
| 11 | "Sleep-ins fix a week of short sleep" | They help but do not fully reverse debt and shift the clock | Partial repay and "social jet lag" note |
| 12 | "Naked mole-rats are immortal" | Death risk does not rise with age, but they do die | Phrase carefully |
| 13 | "The jellyfish is immortal" | It can revert to a polyp but is still killed by predators and disease | Rebirth, not invulnerability |
| 14 | "Chameleons change colour to match backgrounds" | Mainly signalling and temperature; mechanism is nanocrystals | Describe accurately |
| 15 | "Fat can be burned from one spot" | No spot reduction | Do not model local fat |

Every Why card that simplifies ends with a dim "Real life is more complex" line.

---

## 9. Phases (one chat each; micro-steps in order)

Each phase has: **steps**, **files**, **done when**. Always run: `python3 tools/build.py && node tools/check_content.js && node tools/smoke.js && node tools/sim_test.js`.

### Phase 0: Foundations (flag off, nothing visible changes)
1. Read CLAUDE.md, SHARED_KNOWLEDGE.md, `src/pals.js`, `src/life.js` (ILLS, `maybeGetSick`), `engine.js` (`freshState`, `normalise`, `save`, daily roll ~L218).
2. Add `src/sim_data.js` and `src/sim.js` with `simEnsure`, `simAdvance` (empty model), the seeded rng, the Why ledger and the time model of §3.2.
3. Add `bio` to `newPal()`/`normalise()` via `simEnsure`. Add `S.sim` flags (**`on:false`**).
4. Add both files to `tools/build.py` before `life.js`/`pals.js`.
5. Write `tools/sim_test.js` with a `vm` loader, deterministic-rng test, clock-backwards test, 48 h cap test, away-mode test and the **flag-off golden test**.
6. Add a tiny hidden dev panel (`?dev=1`) to view `bio` and fast-forward time for testing.
7. Log in `docs/SHARED_KNOWLEDGE.md`.
**Done when:** the game behaves identically with the flag off; all tests green; old saves load.

### Phase 1: Fuel and body (turn the flag on)
1. Extend `FOODS` to ~35 with the full fields (§4.3). Mark each with HK Food Pyramid group.
2. Implement gut queue, glucose/insulin/glycogen (§4.1) and the energy-balance reserve (§4.2).
3. Derive `energy` and `happy` from the model; keep both fields.
4. Replace the sugar-crash rule; keep the old pop-up *text* style with the new truth.
5. Add the **free canteen staple** and the chestnut policy (§4.3).
6. Build Body Lab → **Today** (glucose chart and meal strip) and **Why log**.
7. Add the **Predict** prompt to Feed.
8. Body shape art (±8% scale, four bands), behind `S.sim.bodyShape`.
**Done when:** the target-curve table of §4.1 passes in tests; a day of normal eating keeps glucose 4–7.8; scenario S1–S4 of §10 pass; phone layout OK at 360 px.

### Phase 2: Sleep and caffeine
1. Add bed/wake schedule, auto-sleep and **🌙 Tuck in**.
2. Implement Process S/C, latency, sleep stages and quality (§4.5) and caffeine decay (§4.6).
3. Morning **Sleep report** with hypnogram and "What affected this?".
4. Next-day effects: alertness, XP rate (mild), appetite/cravings, `Si`, `imm`.
5. **Dream Replay** from `S.mistakes` (bonus only).
6. Nap mechanic; hot-night option.
**Done when:** S5, S6 and S10 of §10 pass; a late bubble tea clearly lowers sleep quality with an accurate Why card; the Notebook is never gated.

### Phase 3: Water, weather, movement
1. Hydration, urine colour, weather by HK month (§4.4), typhoon blocking.
2. Activities, HR/breathing/lactate chart, fitness and detraining (§4.7).
3. Ties to dress-up items (hat, umbrella, jacket).
4. DOMS card.
**Done when:** heat plus low water plus hard exercise produces the existing `heat` illness with a correct Why chain; fitness lowers resting heart rate over ~2 weeks of play.

### Phase 4: Defence, clinic 2.0, teeth, check-up
1. Replace `maybeGetSick` random rolls with the causal risk model (§4.8); keep a **tiny** random seed so no two weeks are identical.
2. Antibody primary/secondary graph; flu vaccination.
3. **Antibiotic course mini-sim** with resistance (§4.8). Add relapse data to `ILLS`.
4. Teeth and Stephan curve; brushing; dentist (§4.9). Gut comfort.
5. Add deficiency illnesses (rickets, night blindness) after a syllabus check.
6. **Weekly check-up** and generated data questions (§4.13) through the existing question pipeline.
**Done when:** S7–S8 of §10 pass; all illnesses can be cured; absence alone never makes a pal sick.

### Phase 5: Pets Keep v1 (6 starter species)
1. Create `src/pets_care.js`. Implement the life clock, stages, welfare (Five Domains), stasis, daily round, Gentle mode (§5.2, §5.7).
2. Build the four archetype engines minimally.
3. Starter species (one per archetype plus the two extremes): **axolotl** (aquatic), **chameleon** (ectotherm), **hummingbird** (endotherm), **monarch** (invertebrate life cycle), **naked mole-rat** (long life, no ageing rise), **octopus** (short life, semelparity).
4. New **Rescue Centre** tab; journal tabs *Care* and *Life clock*; **Compare with human pal**.
5. Art: scale and stage badges plus a few stage icons (egg, caterpillar, chrysalis). Keep the cute style.
**Done when:** each starter pet can be raised through a whole life in tests (fast-forwarded), with the right ending behaviour; no pet can be lost to neglect.

### Phase 6: Pets Keep v2
1. Remaining 19 species via data, plus Monitor and Sanctuary modes.
2. **Breeding and genetics** (§5.6); Punnett prediction; pedigree.
3. Species twists: jellyfish rebirth, tardigrade tun, spoonbill migration, kakapo inbreeding.
4. **Life Report**, Memory Garden, release ceremony.
**Done when:** all 25 species have verified data (sources recorded in `sim_data.js`), and every ending is gentle.

### Phase 7: Polish and teacher tools
1. Care Score, Radiant aura and evolution bonus trait (§4.11).
2. Traits (§4.12); social jet lag; exam-week stress (optional); eyes and screens.
3. Teacher switches: Gentle mode, body-shape off, holiday/exam pause.
4. Accessibility and performance pass; README and `SHARED_KNOWLEDGE.md` updates.
**Done when:** a Biology teacher has signed off every Why card.

---

## 10. Test plan (`tools/sim_test.js`, headless, deterministic)

| # | Scenario | Pass condition |
|---|---|---|
| S1 | A normal day: breakfast 07:00, canteen lunch 12:30, dinner 18:30, sleep 22:30 | Glucose 4.0–7.8 all day; energy ≥ 60 at 15:00 |
| S2 | 3 bubble teas in a row | Peak ≥ 8.0; dip ≤ 4.3 within ~3 h; Why log names "liquid sugar, high GI" |
| S3 | Skip breakfast and study | Energy < 45 by 11:00; glycogen low; the hungry line appears |
| S4 | +1,000 kcal/day for 10 days | `reserve` > +2 kg-eq (tc = 3); `Si` ↓ ≥ 10%; fixed after a week of balance and activity |
| S5 | Bubble tea at 22:30, bed 23:00 vs control | Sleep quality ≥ 10 points lower; latency ≥ +15 min; Why log cites caffeine half-life |
| S6 | 7 nights at 6 h vs 9 h (Monte Carlo n = 2,000 per arm) | Infection rate ≥ 2× in the short-sleep arm; `Si` ↓; appetite ↑ |
| S7 | Antibiotic course stopped on day 2 vs completed | Relapse probability much higher; resistant fraction ↑ |
| S8 | Lactose-intolerant pal + milk vs tofu | Bloating only with milk; calcium pool equal with tofu |
| S9 | Flag off | Byte-identical state after a scripted session vs the pre-sim build |
| S10 | 48 h away | No vital below its safety floor; no illness started by absence; pets in stasis |
| P1 | Same seed twice | Identical output |
| P2 | Mass check | `kcal_in = kcal_out + Δreserve·7700/tc` within 1% |
| P3 | Monotonic sanity | More caffeine at bedtime never improves sleep |
| P4 | Pet lifecycle (fast-forward) | Each starter species reaches its ending state; neglect never kills; Gentle mode never shows death |

Also run `node tools/smoke.js` (phone 390 and desktop): no horizontal scroll in the Body Lab and Rescue Centre; no console errors.

---

## 11. Defaults for open decisions (builders must not block on these)

| ❓ Decision | Default | Why |
|---|---|---|
| Pets framed as "Nature Rescue Centre" with Keep / Sanctuary / Monitor modes | **Yes** | Many species are endangered or not keepable; keeps the education honest |
| Death | **Natural end only, gentle, "Legacy" default; Gentle mode available** | Life cycles are the lesson; protects vulnerable students |
| Slow-variable speed-up | **×3** (`TIME_COMPRESSION`) | Effects visible in ~1–2 weeks |
| Sleep model | **Both** auto schedule and 🌙 Tuck in | Mirrors real nights and rewards the habit |
| Body shape shown | **On, subtle; teacher can turn off** | Teaches without stigma |
| Does sleep affect pal XP? | **Yes, mild (cap −15% one night, −30% chronic)** | A real, felt incentive that never touches grades |
| Order to ship | **Phase 1 then 2 first** | "Eat then sleep" is the headline experience |
| Teacher dashboard data | **None for now** | No new cloud fields (privacy) |
| First pets | **The 6 starters in Phase 5** | One per archetype plus the two lifespan extremes |

---

## 12. Facts to verify before any number reaches students

Check each against a reliable source (note the source next to the value in `sim_data.js`). Anything unverified must not be displayed.

- Teen sleep need 8–10 h (AASM / AAP). Local survey figures for Hong Kong teen sleep (use only with a citation).
- Caffeine half-life ~5 h and its effect on sleep (Drake et al., 2013). Caffeine content of HK milk tea, bubble tea, cola, coffee, energy drinks.
- Two-process model constants (Borbély; τ rise 18.2 h, τ decay 4.2 h as used in human models).
- Sleep restriction effects on leptin/ghrelin, craving and insulin sensitivity (Spiegel et al., 2004; Buxton et al., 2010) and on cold susceptibility (Prather et al., 2015).
- WHO 2020 physical activity guideline for ages 5–17; MET values (Compendium of Physical Activities).
- ~7,700 kcal per kg fat tissue and weight-change dynamics (Hall et al., 2011/2012). Thermic effect by macronutrient.
- Glycaemic index values (University of Sydney GI database); normal glucose ranges (WHO / HK Department of Health).
- Stephan curve and caries risk (frequency of sugar exposure).
- HK Department of Health Healthy Eating Food Pyramid; seasonal influenza vaccination school outreach timing; HK flu seasons; HK vitamin D status of teens.
- Cochrane review on vitamin C and colds (justifies §8 item 9).
- Lactose intolerance prevalence in East Asian populations.
- Pet lifespans and facts: **AnAge** (Human Ageing Genomic Resources) and **IUCN Red List** for every row in §5.4; mole-rat mortality (Ruby et al., 2018); chameleon photonic crystals (Teixeira et al., 2015); Five Domains welfare model (Mellor); Kleiber's law and Q10 as textbook statements.
- HK facts on the three HK-linked pets (spoonbill at Mai Po, Romer's tree frog, Chinese white dolphin, golden coin turtle, horseshoe crab): check population and status text against current IUCN / AFCD pages.
