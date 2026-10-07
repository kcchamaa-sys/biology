# BODYPAL — Build Spec (single source of truth for Claude Code)

Working name: `bodypal`. A virtual "pal" whose body is simulated minute-by-minute (fuel, water,
sleep, teeth). The learner feeds it, waters it, exercises it, brushes its teeth and puts it to
bed, watches what happens, gets short "Why" cards explaining the mechanism, and later answers
questions generated from the pal's own day. Target learner: teens (~13–17). Tone: calm,
curious, mechanism-first. No calories, no weight, no diet talk — ever.

---

## 0. How to use this file (instructions for Claude Code)

1. Build **phase by phase** (§3). Do not start a phase until the previous phase's
   *Definition of Done* passes (`npm test` green, fixtures run).
2. Commit at the end of each phase with message `phase-N: <summary>`.
3. Constants live in `src/engine/constants.ts` and are mirrored in `docs/science_notes.md`
   (§A9). You may tune a constant **only within the range given in §A9** and only to make a
   listed test pass. Record every change (value, reason, test) in `science_notes.md`.
   If a test cannot pass within the ranges, stop and report — do not widen a range silently.
4. `tick` is pure over `PalState`. No `Date.now()`, no `Math.random()` in the engine.
   Randomness (questions, UI) comes only from `world.rng` (seeded).
5. The word "calorie"/"kcal" (and the §C4 banned list) must not appear in any user-facing
   string. A lint test enforces this.
6. Every user-facing sentence follows Spec C. Run the voice lint before committing copy.
7. When this file is ambiguous, prefer: (a) the listed tests, (b) the §A9 source, (c) the
   simplest teaching-faithful behaviour. Note the decision in `docs/decisions.md`.
8. Create `CLAUDE.md` in the repo root containing §0 verbatim plus the repo layout (§2).

---

## 1. Project overview and non-negotiables `[reconstructed]`

**What the learner does.** Advance time (1 min → 1 day fast-forward), choose actions
(eat / drink / exercise / brush / sleep / wake), watch bars (energy, focus, hunger, thirst) and
traces (glucose, plaque pH, sleep pressure), read Why cards when something interesting
happens, and do short question sessions built from their pal's day.

**What the learner learns** — 22 learning objectives (LOs) across four domains:
fuel (glucose/insulin/glycogen), water, sleep (two-process model, stages, caffeine, light),
teeth (Stephan curve, frequency, saliva, fluoride). Full list in §B2.

**Non-negotiables**
- The simulation is the oracle. Copy quotes numbers the sim produced; nothing is hand-waved.
- No kcal, no body weight, no "good/bad food", no fear. Energy and focus are unit-less bars.
- Mechanism before advice. Advice is optional and phrased as something to try.
- Deterministic: same fixture + seed → identical traces, cards and questions.
- Answering questions never changes the pal's body (no "answer right, pal gets healthier").
- Every constant has a confidence grade and a source; the two files are kept in sync by test.

---

## 2. Repo layout and stack `[reconstructed — defaults; swap framework if you prefer]`

TypeScript (strict), Vite + React for UI, Vitest for tests, no backend. Node ≥ 20.

```
bodypal/
  CLAUDE.md
  SPEC.md                      ← this file
  docs/
    science_notes.md           ← §A9 mirror + tuning log
    voice.md                   ← Spec C mirror
    decisions.md
  src/
    engine/
      types.ts                 ← PalState, World, Event, Food (§A2)
      constants.ts             ← §A9, one export per row
      rng.ts                   ← seeded PRNG (mulberry32 or similar)
      world.ts                 ← createWorld, advance(world, minutes), event log
      tick.ts                  ← pure tick(state, dt=1)
      actions.ts               ← eat, drink, exercise, brushTeeth, trySleep, wake
      fuel.ts  water.ts  sleep.ts  teeth.ts
      selectors.ts             ← energy, focus, hunger, satiety, sleepQualityReport
      cards.ts                 ← Why-card triggers + cooldowns (§A8)
    content/
      foods.json               ← §A2 Food[] (seed list in Appendix 1)
      whyCards.json            ← 15 cards: trigger id, headline, mechanism, learnMore
      los.json                 ← 22 LOs (§B2)
      misconceptions.json      ← ≥3 distractors per LO (T3)
      claims.json              ← ≥12 claims (T10)
    questions/
      schema.ts  oracle.ts  learner.ts  session.ts
      templates/T1.ts … T10.ts
    ui/                        ← Phase 7
  scripts/
    run-fixture.ts             ← `npm run sim -- --fixture boring-day --days 1 --csv out.csv`
  test/
    fixtures/*.json            ← scripted days (Appendix 2)
    engine/*.test.ts  questions/*.test.ts  content/*.test.ts  voice/*.test.ts
```

---

## 3. Build phases and Definition of Done

### Phase 0 — Scaffold
- Vite/React/TS/Vitest project; `npm test`, `npm run sim`, `npm run lint:voice`.
- `types.ts` with every interface in §A2 and §B2. `constants.ts` with every §A9 row.
- `docs/science_notes.md` generated table; test `constants-sync.test.ts` parses both files
  and fails on any mismatch of name/value.
- Seeded RNG. **DoD:** tests pass; `constants-sync` green.

### Phase 1 — Engine skeleton, hydration, hunger, fixtures
- `createWorld(fixtureSeed)`, `advance(world, minutes)` (applies due scheduled actions,
  calls `tick`, appends `Event` with dotted-path deltas), fixture runner producing CSV.
- Implement §A4 hydration and §A5 satiety/hunger/energy/focus selectors (fuel inputs may
  be stubbed at basal values).
- Fixtures from Appendix 2 load and run 7 days in < 1 s (Node).
- **Tests:** determinism (two runs identical); thirst flag appears 5–8 h after waking with
  no intake; thirst never fires on `boring-day`; 7-day perf.

### Phase 2 — Fuel model (§A3)
- Full stomach → gut → plasma pipeline, liver glycogen, insulin I/X, exercise coupling.
- **Tests (the arbiter for tuning):**
  - (a) `ogtt`: 300 mL drink containing 50 g glucose (gi 100, 0 fibre) at 08:00 from a fed
    basal state → peak 140–180 mg/dL at 30–60 min; < 110 by 150 min; nadir ≥ 65.
  - (b) `porridge`: 60 g oats cooked with 200 mL milk → peak ≤ 120; no value < 75 in 4 h.
  - (c) `fast-14h`: last meal 19:00, nothing until 09:00 → glucose 75–95 throughout;
    `glycogenLiverG` 20–40 g at 09:00; EGP never 0.
  - (d) `run`: 30 min intensity 2 at 2 h post-lunch → glucose falls 10–30 mg/dL, never < 65;
    sweat total 450 mL; `recentExerciseFlag` raises `insulinSensitivity` for 12 h.
  - Basal stability: 24 h with no actions from basal → glucose stays within 85–95 (no drift).
- **DoD:** (a)–(d) pass with constants within §A9 ranges; tuning log written.

### Phase 3 — Teeth (§A7) + hydration polish
- Sip scheduler for `drink(…, overMinutes)`; Stephan curve; saliva/sleep coupling.
- **Tests:**
  - (a) `sip-vs-gulp`: 330 mL cola over 60 min → `plaquePh < 5.5` for ≥ 40 of the 60 min
    (+ recovery tail); same cola over 5 min → total minutes < 5.5 between 20 and 40.
  - (b) `bedtime-brush`: cola 22:30, sleep 23:00. No brush → `deminMinutesToday` ≥ 90
    overnight; brush at 22:55 → < 5.
  - (c) `boring-day` → `deminMinutesToday` < 30 and `erosionMinutesToday` = 0.

### Phase 4 — Sleep (§A6)
- Process S/C, gate/latency, stages, natural wake vs alarm, inertia, caffeine kinetics,
  evening-light phase delay, `SleepQualityReport`.
- **Tests:**
  - (a) `normal-night`: wake 07:00, no caffeine/light, lie down 23:00 → latency ≤ 20 min;
    natural wake 06:15–07:45; report score ≥ 0.8.
    *Tunable for this test only:* gate offset 0.15 (0.10–0.25), `H_MEAN` (0.60–0.70),
    `L_MEAN` (0.12–0.22). Record changes.
  - (b) `early-bed`: same day, lie down 20:00 → latency > 45 min; card 11 fires.
  - (c) `alarm-5h-vs-8h`: `tonight.remMin(8 h) ≥ 1.6 × remMin(5 h)`;
    `swsMin(5 h) ≥ 0.85 × swsMin(8 h)`; 5 h alarm from REM/SWS sets `groggy` 30 min.
  - (d) `late-coffee`: 240 mL coffee (95 mg) at 20:00, lie down 23:00 → `caffeineMg` rounds
    to 63; latency ≈ +12 min vs (a); an `explanationLines` entry contains "63 mg"; card 10.
  - (e) `screens-3-nights`: eveningLight true 3 nights → `cPhaseDelayMin` = 30; card 13
    fires exactly once (72 h cooldown); after 2 light-free evenings delay = 0 (−20/day, floor 0).

### Phase 5 — Why cards (§A8) + copy (Spec C)
- Trigger engine evaluated after every tick/action over state + last 240 min history.
- Draft `learnMore` (≤ 120 words) and `explanationLines` templates under Spec C.
- **Tests:** `boring-day` fires zero cards; each fixture in Appendix 2 fires exactly its
  listed cards; cooldowns respected; voice lint passes on all content JSON.

### Phase 6 — Questions (Spec B)
- Schema, 10 templates, oracle (sim re-runs), learner model, session builder, focus gating.
- **Tests:** same `(world, seed)` → identical session; every generated instance passes
  `validateInstance`; T1/T2/T5 answers reproduce from the oracle; Leitner transitions;
  session length follows §B6 table; answering never mutates `world.pal` (deep-equal check).

### Phase 7 — UI
- Screens: Pal (bars + clock + action buttons + fast-forward), Traces (glucose, plaque pH,
  S/H/L with sleep shading, hydration deficit), Why-card drawer, Sleep report, Questions.
- No units on energy/focus. No kcal anywhere (string lint runs over `src/ui`).
- Keyboard-operable; colour never the sole carrier of meaning.

### Phase 8 — Integration
- 7-day scripted scenario (Appendix 2 `week`) runs end-to-end; snapshot test of card
  sequence and daily sleep scores; bundle builds; README with screenshots.

---

# Spec A — Body simulation

### A1. Engine contract `[reconstructed]`

```ts
tick(state: PalState, dtMin = 1): PalState        // pure; dt is always 1 in production
```
Sub-step order inside one tick: advance time → sleep (asleep? stage, S, natural wake) →
fuel → water → teeth → flags. Each sub-step reads the *previous* sub-step's output; no
sub-step reads the event log.

`World` owns everything that is not body state:

```ts
export interface World {
  pal: PalState;
  events: Event[];                               // append-only log
  scheduled: ScheduledAction[];                  // future sips, exercise end, sleep onset…
  cards: Record<WhyCardId, { lastFiredEpochMin: number | null; fired: number }>;
  learner: LearnerModel;                         // Spec B
  rng: Rng;                                      // seeded; engine never uses it
  foods: Record<string, Food>;
}

advance(world, minutes)   // for each minute: apply due scheduled actions → tick → cards → log
```

Actions (all in `actions.ts`, all return a new `World`):

| Action | Effect |
|---|---|
| `eat(w, foodId, grams)` | adds carb/mass to stomach, blends `gutEmptyHalfLifeMin` and `gutAbsorbRate` (mass-weighted), water to hydration, tooth exposure if sugary/acidic, `minutesSinceMeal = 0` |
| `drink(w, foodId, ml, overMinutes = 5)` | schedules ~30 mL sips evenly over `overMinutes`; each sip = tiny `eat` with drink kinetics + caffeine |
| `exercise(w, intensity 1–3, minutes)` | sets `activity` until end time; §A3 exercise block |
| `brushTeeth(w)` | §A7 |
| `trySleep(w, alarmEpochMin \| null)` | computes latency (§A6), schedules onset; records `eveningLight`, caffeine at attempt |
| `wake(w)` | forced wake (also used by alarm/natural wake internally) |
| `setEveningLight(w, bool)` | learner toggle for the 2 h before bed |

### A2. State and data types (`[reconstructed]` top; verbatim from `insulinSensitivity` on)

```ts
export interface PalState {
  epochMin: number;              // minutes since world start; minuteOfDay = epochMin % 1440
  massKg: number;                // 60 default; scales Vg, EGP, water loss, thirst threshold

  activity: {                    // [added] exercise bookkeeping
    intensity: 0 | 1 | 2 | 3;
    untilEpochMin: number | null;
    sweatThisBoutMl: number;
    glucoseAtStart: number | null;
    recentExerciseUntilEpochMin: number | null;   // recentExerciseFlag = epochMin < this
  };

  fuel: {
    plasmaGlucoseMgDl: number;   // G; 90 basal
    insulinPlasma: number;       // I; 1 = basal
    insulinAction: number;       // X; remote compartment, 1 = basal
    gutCarbG: number;            // carbohydrate in the intestine, available to absorb
    gutMassG: number;            // total food mass in stomach + gut; drives satiety
    gutEmptyHalfLifeMin: number; // 20 (drinks) … 150 (fatty solids)
    gutAbsorbRate: number;       // per minute, from GI and fibre
    insulinSensitivity: number;  // 1 = normal; 0.7–1.3. Lowered by sleep debt, raised for ~12 h after exercise
    glycogenLiverG: number;      // 0–120; ~100 after a normal fed day
    stomachCarbG: number;        // carbohydrate still in the stomach (not yet emptied into gutCarbG)
    minutesSinceMeal: number;
    exerciseUptake: number;      // contraction-driven, insulin-independent uptake multiplier; 1 at rest
  };

  water: {
    deficitMl: number;           // 0 = euhydrated; positive = dehydrated
    sweatRateMlPerMin: number;   // 0 at rest, set by exercise()
    intakeTodayMl: number;
  };

  sleep: {
    S: number;                   // Process S homeostatic pressure, 0–1
    chronotypeOffsetMin: number; // −120 (lark) … +180 (owl); shifts Process C
    cPhaseDelayMin: number;      // accumulated delay from evening light, decays 20 min/day toward 0
    asleep: boolean;
    sleepOnsetEpochMin: number | null;
    alarmEpochMin: number | null;
    stage: 'wake' | 'N1' | 'N2' | 'SWS' | 'REM';
    cycleIndex: number;          // 0-based 90-min cycle counter for the current sleep bout
    tonight: { remMin: number; swsMin: number; latencyMin: number; awakeningsMin: number;
               sOnset: number; caffeineAtOnsetMg: number; onsetMinuteOfDay: number };  // [added fields]
    caffeineMg: number;          // circulating caffeine, first-order clearance
    eveningLight: boolean;       // bright/screen light in the 2 h before sleep attempt
    lastSleptMin: number;        // [added] duration of the last completed bout
    sleepNeedMin: number;        // [added] 540 default (SLEEP_NEED_TEEN_MIN)
    lastReport: SleepQualityReport | null;
  };
  // sleepDebtFraction (used by insulinSensitivity) = clamp((sleepNeedMin − lastSleptMin) / sleepNeedMin, 0, 1)

  teeth: {
    plaquePh: number;            // 7.0 resting
    acidLoad: number;            // 0–1, decays with saliva buffering; drives plaquePh target
    fluorideShield: number;      // 0–1, set to 1 by brushing, decays
    salivaFlow: number;          // 1 awake, 0.1 asleep (scales recovery)
    deminMinutesToday: number;   // minutes with plaquePh < 5.5 (caries proxy)
    erosionMinutesToday: number; // minutes of extrinsic acid contact (acidic drink proxy)
    lastBrushEpochMin: number | null;
  };

  flags: { hungry: boolean; thirsty: boolean; sleepy: boolean; groggy: boolean };
}

// Derived, never stored — recomputed by selectors from PalState:
//   focus  0–1   = f(S, glucose-in-range, hydration, caffeine)   → used by Spec B §B6
//   energy 0–1   = f(glucose, S, hydration)                        → shown as a bar, never as kcal

export interface Food {
  id: string;
  name: string;
  kind: 'solid' | 'drink';
  per100: {                      // per 100 g (solids) or 100 mL (drinks)
    sugarsG: number; starchG: number; fibreG: number;
    proteinG: number; fatG: number; waterG: number; caffeineMg: number;
  };
  gi: number;                    // 0–100, glucose = 100; 0 for carb-free foods
  acidic: boolean;               // true if pH < 4 (cola, orange juice, energy drinks)
  defaultPortionG: number;
  source: string;                // USDA FoodData Central id or GI-table reference
}

export interface Event {
  time: number;                  // epochMin
  type: 'eat' | 'drink' | 'exercise' | 'brushTeeth' | 'sleep' | 'wake' | 'tick';
  payload: unknown;
  deltas: Partial<Record<string, number>>;   // dotted paths → change, e.g. "fuel.stomachCarbG": +50
}
```

The `events: Event[]` log lives on the `World` object, not inside `PalState`, so `tick` stays pure over `PalState` alone. `tick` events are logged only when something non-trivial changed (a flag flipped, a stage changed, a card fired) to keep the log small.

### A3. Fuel model (glucose, insulin, glycogen)

Three stages: **stomach → intestine → plasma**, plus liver and insulin. All rates are per minute; the engine integrates with explicit Euler at Δt = 1 min.

**Stomach emptying** (first-order, rate from meal composition)

```
k_empty            = ln 2 / gutEmptyHalfLifeMin
emptiedCarb        = stomachCarbG × k_empty
stomachCarbG      -= emptiedCarb ; gutCarbG += emptiedCarb
gutMassG          -= gutMassG × k_empty
gutEmptyHalfLifeMin (set on eat/drink, mass-weighted blend of current and new):
   drinks:   20 min
   solids:   clamp(60 + 2.0 × fatG + 1.0 × proteinG + 1.5 × fibreG, 60, 150)
```

**Intestinal absorption**

```
gutAbsorbRate (set on eat/drink, mass-weighted blend)
             = K_ABS_MAX × (gi / 100) / (1 + 0.08 × fibreG)        K_ABS_MAX = 0.08 /min
absorbedMg   = gutCarbG × gutAbsorbRate × 1000
liverFirstPass = 0.30 × absorbedMg × clamp(insulinAction / 3, 0, 1)   // splanchnic uptake → glycogen
glycogenLiverG += liverFirstPass / 1000  (cap 120)
Ra           = absorbedMg − liverFirstPass                            // appears in plasma
```

**Plasma glucose**

```
Vg   = 1.7 dL/kg × massKg                                   = 102 dL
EGP  = EGP_B × suppress(X) × counterReg(G) × glycogenAvail
       EGP_B        = 2.0 mg/kg/min × massKg               = 120 mg/min
       suppress(X)  = max(0, 1 − 0.25 × (X − 1))           // fully off at X = 5
       counterReg(G)= 1 + 0.08 × max(0, 85 − G)            // glucagon/adrenaline cartoon, cap 3
       glycogenAvail= glycogen share f_gly = 0.75 × (glycogenLiverG/100)^0.3 ; remainder is gluconeogenesis (always available)
glycogenLiverG −= EGP × f_gly / 1000
U_ii = 1.0 mg/kg/min × massKg × exerciseUptake              = 60 mg/min at rest (brain, red cells, muscle contraction)
U_id = 60 mg/min × X × insulinSensitivity × (G / 90)         // insulin-dependent
U_sg = 0.025 /min × max(0, G − 90) × Vg                      // glucose effectiveness
dG   = (Ra + EGP − U_ii − U_id − U_sg) / Vg                  // mg/dL per minute
```

**Insulin**

```
I_target = 1 + 0.12 × max(0, G − 90)                          // basal = 1
dI       = (I_target − I) × ln2 / 5                           // plasma half-life 5 min
dX       = (I − X) / 20                                       // remote-compartment lag, τ = 20 min
insulinSensitivity = clamp(1 − 0.3 × sleepDebtFraction + 0.15 × recentExerciseFlag, 0.7, 1.3)
```

**Exercise** — `exercise(intensity ∈ {1,2,3}, minutes)` sets, for the duration: `exerciseUptake = 1 + 1.5 × intensity`, EGP multiplier `1 + 0.6 × intensity` (so glucose falls modestly rather than crashing), `sweatRateMlPerMin = {1: 8, 2: 15, 3: 25}`, and `recentExerciseFlag = 1` for 12 h afterwards. Exercise never edits `plasmaGlucoseMgDl` directly.

**Tuning rule.** The numbers above are starting values. Phase 2 tests (a)–(c) are the arbiter: tune only within the ranges listed in §A9, and record the final value and the reason in `science_notes.md`.

### A4. Hydration

```
lossMlPerMin   = awake ? 95/60 : 45/60                       // insensible + urine, scaled × massKg/60
               + sweatRateMlPerMin
deficitMl     += lossMlPerMin
drink/eat      : deficitMl −= waterG (food water counts); deficitMl floor = −300 (brief surplus, then voided)
thirsty flag   : deficitMl ≥ 0.01 × massKg × 1000  (600 mL)
```

Caffeine's diuretic effect is **not** modelled (Simplified — habitual intake has negligible net effect; documented in notes so a learner's question "doesn't coffee dehydrate you?" is answered by a Why card, not by the sim).

### A5. Hunger, satiety, energy, focus

```
satiety   = 0.6 × clamp(gutMassG / 350, 0, 1) + 0.4 × exp(−minutesSinceMeal / 240)
hunger    = 1 − satiety, +0.2 if plasmaGlucose < 75
hungry    = hunger > 0.75
energy    = 0.5 × inRange(glucose, 75, 140) + 0.3 × (1 − S) + 0.2 × (1 − clamp(deficitMl / 1200))
focus     = 0.4 × (1 − S_eff) + 0.3 × inRange(glucose, 75, 140) + 0.2 × (1 − clamp(deficitMl / 1200)) + 0.1 × clamp(caffeineMg / 100)
            where S_eff = S − 0.03 × caffeineMg / 100   (caffeine masks sleep pressure; it does not remove it)
inRange(x, lo, hi) = 1 inside, falling linearly to 0 at lo−25 / hi+60
```

Energy and focus are shown as bars with no units. No kcal appear anywhere.

### A6. Sleep system

**Process S** (Borbély two-process model; Daan, Beersma & Borbély 1984 time constants)

```
awake : S += (1 − S) × (1 − exp(−1 / (18.2 × 60)))           // rises toward 1, τ_r = 18.2 h
asleep: S −= S × (1 − exp(−1 / (4.2 × 60)))                   // decays toward 0, τ_d = 4.2 h
```

**Process C** — 24-h sinusoid, phase set by chronotype and accumulated light delay:

```
phaseMin   = minuteOfDay − chronotypeOffsetMin − cPhaseDelayMin
C(t)       = sin(2π × (phaseMin − 16×60) / 1440)             // peaks ~16:00, trough ~04:00 for offset 0
H(t)       = 0.67 + 0.12 × C(t)                               // upper threshold: sleep becomes available
L(t)       = 0.17 + 0.12 × C(t)                               // lower threshold: natural wake
```

**Sleep gate and latency**

```
gap        = S_eff − (H(t) − 0.15)                            // how far above the gate the pal is
latencyMin = gap ≥ 0.10 → 10
             0 ≤ gap < 0.10 → 10 + 350 × (0.10 − gap)          // 10 … 45 min
             gap < 0 → 45 + 600 × (−gap), cap 180              // "not sleepy yet" (wake-maintenance zone)
             + 15 if eveningLight
             + 0.2 × caffeineMg                               // 60 mg → +12 min
```

Trying to sleep at 20:00 after a normal 07:00 wake gives S ≈ 0.50 against a gate of ≈ 0.65 → latency > 45 min (Phase 4 test b).

**Natural wake vs alarm.** Each asleep minute: if `alarmEpochMin` reached → wake. Else if `S ≤ L(t)` and at least 4 h asleep → natural wake. Waking from SWS or REM sets `groggy` (sleep inertia) for 30 min.

**Stage approximation** — 90-min cycles from onset, each cycle `n` (0-based) laid out as N1 5 min → N2 → SWS → REM:

```
swsMin(n) = max(0, 40 − 12 × n)
remMin(n) = min(40, 10 + 8 × n)
n2Min(n)  = 90 − 5 − swsMin(n) − remMin(n)
```

An alarm after 5 h (3.3 cycles) yields ≈ 10 + 18 + 26 + part of 34 REM minutes; 8 h (5.3 cycles) adds 40 + 40 more (Phase 4 test c).

**Caffeine kinetics**

```
caffeineMg −= caffeineMg × ln2 / (5 × 60)                     // half-life 5 h
drink()     : caffeineMg += per100.caffeineMg × ml / 100
```

95 mg at 20:00 → 95 × 0.5^(3/5) ≈ 63 mg at 23:00; this number must appear verbatim (rounded to whole mg) in `explanationLines`.

**Evening light.** If `eveningLight` was true at sleep onset: `cPhaseDelayMin += 10` (cap 60) applied at the next wake; it decays by 20 min/day toward 0 on light-free evenings. Sleeping later, by itself, is not penalised — the delay simply moves the gate.

**SleepQualityReport**

```ts
export interface SleepQualityReport {
  score: number;                              // 0–1, weighted sum below
  components: {
    duration: number;      // 0.35 × clamp(sleptMin / sleepNeedMin)
    pressureCleared: number; // 0.25 × (S_onset − S_wake) / S_onset
    latency: number;       // 0.15 × clamp(1 − (latencyMin − 10) / 60)
    timing: number;        // 0.10 × (1 − |onsetMinuteOfDay − idealOnset| / 180)   idealOnset from C
    caffeine: number;      // 0.10 × (1 − clamp(caffeineAtOnsetMg / 100))
    interruption: number;  // 0.05 × (alarm cut SWS/REM ? 0 : 1)
  };
  explanationLines: string[];   // ≤ 2 sentences each, LINNAEA voice rules (Spec C) apply
}
```

`idealOnset` = the minute of day at which `H(t) − 0.15` first drops below 0.62 in the evening (≈ 22:30 for offset 0, later for owls / after light delay).

### A7. Tooth model (Stephan curve)

```
exposure (any eat/drink minute with sugarsG > 0.5 in that bite/sip, or acidic == true):
    acidLoad   = min(1, acidLoad + 0.6 × clamp(sugarsInBiteG / 5, 0.3, 1))
    if acidic  : erosionMinutesToday += 1
each minute:
    acidLoad  −= acidLoad × ln2 / (25 / salivaFlow)           // buffering half-life 25 min awake, 250 min asleep
    targetPh   = 7.0 − 2.0 × acidLoad × (1 − 0.3 × fluorideShield)   // floor ≈ 5.0 with no fluoride
    plaquePh  += (targetPh − plaquePh) × 0.25                 // reaches minimum in ~5–10 min
    if plaquePh < 5.5: deminMinutesToday += 1
    fluorideShield −= fluorideShield × ln2 / 120               // half-life 2 h
brushTeeth():
    plaquePh = 7.0; acidLoad = 0; fluorideShield = 1; lastBrushEpochMin = now
```

Drinks are delivered as sips: `drink(foodId, ml, overMinutes = 5)` splits the volume into ~30 mL sips spaced evenly, each a fresh exposure. Because recovery takes ~25–40 min and each sip re-triggers the drop, 330 mL over 60 min keeps `plaquePh` under 5.5 for most of the hour, whereas 5 min of gulping gives one ~30-min dip (Phase 3 test). `salivaFlow` drops to 0.1 during sleep, which is why the before-bed brush matters most (Why card 15). `deminMinutesToday` / `erosionMinutesToday` reset at each natural or alarm wake.

### A8. Why cards (data, 15)

Trigger predicates are evaluated after every tick/action against `PalState` plus the last 240 min of history. Cooldown is per card, in game hours. `learnMore` text (≤120 words) is drafted in Phase 5 under the Spec C voice rules; the table fixes trigger, cooldown, LO and headline so Phase 5 content can't drift from the engine.

| # | id | LO | Trigger (evaluated on state + last 240 min) | Cooldown | Headline |
|---|---|---|---|---|---|
| 1 | `glucose-rising` | F1 | `plasmaGlucoseMgDl` crosses 120 upward within 60 min of an eat/drink | 6 h | Glucose on the way up |
| 2 | `slow-burn` | F2 | meal with `fibreG ≥ 4` or `gutEmptyHalfLifeMin ≥ 100`, and 2-h post-meal peak ≤ 120 | 12 h | A slower kind of fuel |
| 3 | `insulin-at-work` | F3 | `insulinAction ≥ 2.5` and glucose falling for 10 consecutive min | 6 h | Insulin is moving it |
| 4 | `stored-fuel` | F4 | awake, `minutesSinceMeal ≥ 600`, glucose 75–95 | 24 h | Running on stored fuel |
| 5 | `holding-the-floor` | F5 | glucose < 75 and `counterReg(G) > 1.2` for 5 min | 12 h | Why it doesn't just keep falling |
| 6 | `muscles-pull` | F6 | exercise bout ended and glucose fell ≥ 10 mg/dL during it | 12 h | Muscles take their own |
| 7 | `the-dip` | F7 | glucose fell ≥ 50 mg/dL within 90 min of a peak ≥ 140 and is now < 80 | 12 h | The dip after the rush |
| 8 | `water-leaves` | W1, W2 | `flags.thirsty` flips to true | 12 h | Thirst arrives late |
| 9 | `sweat-adds-up` | W4 | `activity.sweatThisBoutMl ≥ 300` | 12 h | Sweat adds up |
| 10 | `caffeine-still-here` | S6 | `trySleep` called with `caffeineMg ≥ 30` | 24 h | Caffeine is still here |
| 11 | `not-sleepy-yet` | S2 | `trySleep` latency > 45 min with `gap < 0` | 24 h | Not sleepy yet |
| 12 | `short-night` | S5 | alarm wake with `sleptMin < 0.75 × sleepNeedMin` | 24 h | Short night, less REM |
| 13 | `screens-moved-clock` | S7 | `cPhaseDelayMin ≥ 30` | 72 h | Your clock moved |
| 14 | `sipping` | T2 | `plaquePh < 5.5` for ≥ 40 of the last 60 min | 12 h | Sipping keeps the acid going |
| 15 | `brush-before-bed` | T3 | sleep onset with `acidLoad > 0.3` and no brush in the last 60 min | 24 h | Saliva clocks off at night |

Card rules:
- A card fires once per trigger edge (false → true), never while continuously true.
- Cooldown is measured in game time from `lastFiredEpochMin`.
- Each card has `headline` (≤ 6 words), `mechanism` (one sentence quoting ≥ 1 number from the current state, filled from a template), `learnMore` (≤ 120 words), `lo`.
- `boring-day` must fire nothing. If it does, fix the trigger, not the fixture.

### A9. Constants, ranges, confidence grades, sources

Grades: **A** well-established physiology (textbook / primary literature value used as-is);
**B** simplified (real mechanism, simplified or lumped parameter); **C** cartoon (invented
for teachability; shape is right, number is ours). Every row is one export in `constants.ts`
and one row in `docs/science_notes.md`; `constants-sync.test.ts` enforces equality.

| Constant | Value | Tunable range | Grade | Source / note |
|---|---|---|---|---|
| `MASS_DEFAULT_KG` | 60 | — | A | median mass, 13–17 yr |
| `VG_DL_PER_KG` | 1.7 | 1.5–1.9 | A | Bergman minimal model glucose distribution |
| `EGP_BASAL_MG_KG_MIN` | 2.0 | 1.8–2.3 | A | overnight fasted EGP, adults/teens |
| `EGP_SUPPRESS_PER_X` | 0.25 | 0.18–0.35 | B | fully suppressed at X = 5 |
| `COUNTERREG_GAIN` | 0.08 | 0.05–0.12 | C | glucagon/adrenaline cartoon; cap 3× |
| `GLY_SHARE_MAX` | 0.75 | 0.65–0.85 | B | glycogenolysis vs gluconeogenesis split, fed state |
| `GLY_SHARE_EXP` | 0.3 | 0.2–0.5 | C | shape of glycogen depletion curve |
| `GLYCOGEN_LIVER_CAP_G` | 120 | — | A | adult liver glycogen ~100–120 g |
| `U_II_MG_KG_MIN` | 1.0 | 0.9–1.2 | A | insulin-independent uptake (brain ≈ 60 %) |
| `U_ID_BASAL_MG_MIN` | 60 | 45–80 | B | sized so basal G is stationary at X = 1 |
| `GLUCOSE_EFFECTIVENESS` | 0.025 | 0.015–0.035 | B | S_G, Bergman |
| `K_ABS_MAX` | 0.08 | 0.05–0.12 | B | Dalla Man meal model kabs range |
| `FIBRE_ABS_FACTOR` | 0.08 | 0.04–0.12 | C | per g fibre, slows absorption |
| `FIRST_PASS_MAX` | 0.30 | 0.20–0.40 | B | splanchnic uptake of oral glucose |
| `EMPTY_HL_DRINK_MIN` | 20 | 15–30 | A | gastric emptying, liquids |
| `EMPTY_HL_SOLID_BASE_MIN` | 60 | 50–80 | A | solids, low fat |
| `EMPTY_HL_FAT_PER_G` | 2.0 | 1.0–3.0 | B | fat slows emptying |
| `EMPTY_HL_PROTEIN_PER_G` | 1.0 | 0.5–1.5 | B | |
| `EMPTY_HL_FIBRE_PER_G` | 1.5 | 0.5–2.5 | B | |
| `EMPTY_HL_CAP_MIN` | 150 | 120–180 | A | |
| `INSULIN_GAIN_PER_MGDL` | 0.12 | 0.08–0.18 | B | β-cell response above 90 |
| `INSULIN_HL_MIN` | 5 | 4–6 | A | plasma insulin half-life |
| `X_TAU_MIN` | 20 | 15–30 | A | remote insulin action lag (Bergman p2) |
| `SENS_SLEEP_DEBT_PENALTY` | 0.3 | 0.2–0.4 | B | sleep restriction lowers sensitivity 20–30 % |
| `SENS_EXERCISE_BONUS` | 0.15 | 0.10–0.25 | A | post-exercise sensitivity ↑ for 12–24 h |
| `EXERCISE_UPTAKE_PER_INT` | 1.5 | 1.0–2.5 | B | contraction-driven uptake |
| `EXERCISE_EGP_PER_INT` | 0.6 | 0.4–0.9 | B | hepatic output matches uptake at moderate intensity |
| `SWEAT_ML_MIN` | {1: 8, 2: 15, 3: 25} | ±30 % | A | 0.5–1.5 L/h |
| `RECENT_EXERCISE_H` | 12 | — | A | |
| `WATER_LOSS_AWAKE_ML_H` | 95 | 80–110 | A | ~2.3 L/day resting total, sedentary |
| `WATER_LOSS_ASLEEP_ML_H` | 45 | 35–55 | B | |
| `THIRST_FRACTION_MASS` | 0.01 | 0.008–0.015 | A | thirst at ~1 % body-mass deficit |
| `WATER_SURPLUS_FLOOR_ML` | −300 | — | C | |
| `SATIETY_MASS_REF_G` | 350 | 300–450 | C | |
| `SATIETY_TIME_TAU_MIN` | 240 | 180–300 | C | |
| `HUNGER_LOW_GLUCOSE_BONUS` | 0.2 | — | C | |
| `HUNGRY_THRESHOLD` | 0.75 | — | C | |
| `TAU_S_RISE_H` | 18.2 | — | A | Daan, Beersma & Borbély 1984 |
| `TAU_S_DECAY_H` | 4.2 | — | A | Daan, Beersma & Borbély 1984 |
| `H_MEAN` | 0.67 | 0.60–0.70 | B | upper threshold mean |
| `L_MEAN` | 0.17 | 0.12–0.22 | B | lower threshold mean |
| `C_AMPLITUDE` | 0.12 | 0.08–0.16 | B | |
| `C_PEAK_MINUTE` | 960 | — | B | 16:00 alertness peak |
| `GATE_OFFSET` | 0.15 | 0.10–0.25 | C | distance below H at which sleep is possible |
| `LATENCY_MIN_MIN` | 10 | — | A | normal latency 10–20 min |
| `LATENCY_SLOPE_NEAR` | 350 | — | C | |
| `LATENCY_SLOPE_FAR` | 600 | — | C | |
| `LATENCY_CAP_MIN` | 180 | — | C | |
| `LIGHT_LATENCY_MIN` | 15 | 10–20 | B | |
| `CAFFEINE_LATENCY_PER_MG` | 0.2 | 0.1–0.3 | B | ~+12 min at 60 mg |
| `NATURAL_WAKE_MIN_H` | 4 | — | C | guard against premature wake |
| `INERTIA_MIN` | 30 | 15–45 | A | sleep inertia after SWS/REM wake |
| `CYCLE_MIN` | 90 | — | A | |
| `SWS_BASE_MIN` / `SWS_DECLINE_PER_CYCLE` | 40 / 12 | — | B | SWS front-loaded |
| `REM_BASE_MIN` / `REM_GROWTH_PER_CYCLE` / `REM_CAP_MIN` | 10 / 8 / 40 | — | B | REM back-loaded |
| `CAFFEINE_HL_H` | 5 | 4–6 | A | adult/adolescent range 3–7 h |
| `LIGHT_DELAY_PER_NIGHT_MIN` | 10 | — | B | evening light delays phase ~10–30 min |
| `LIGHT_DELAY_CAP_MIN` | 60 | — | C | |
| `LIGHT_DELAY_RECOVERY_MIN_DAY` | 20 | — | C | |
| `SLEEP_NEED_TEEN_MIN` | 540 | 480–600 | A | 8–10 h recommended, 13–17 yr |
| `ACID_PER_EXPOSURE` | 0.6 | 0.4–0.8 | C | |
| `ACID_SUGAR_REF_G` | 5 | — | C | |
| `ACID_BUFFER_HL_AWAKE_MIN` | 25 | 20–35 | A | Stephan curve recovery 20–40 min |
| `SALIVA_FLOW_ASLEEP` | 0.1 | 0.05–0.2 | A | near-zero unstimulated flow in sleep |
| `PH_RESTING` / `PH_DROP_MAX` | 7.0 / 2.0 | — | A | critical pH 5.5; floor ≈ 5.0 |
| `PH_APPROACH_RATE` | 0.25 | — | C | |
| `FLUORIDE_SHIELD_EFFECT` | 0.3 | 0.2–0.4 | B | |
| `FLUORIDE_HL_MIN` | 120 | 90–180 | B | |
| `CRITICAL_PH` | 5.5 | — | A | enamel demineralisation threshold |

---

# Spec B — Questions

### B1. Principles
- Every question is **about this pal's own day** or a counterfactual re-run of it. No generic quiz items.
- The oracle is the simulation. Correct answers are computed, not authored.
- Questions never change the pal. The session builder receives a *read-only* `World`.
- Sessions are gated by the pal's `focus` selector (§B6) — a teaching device, not a punishment.
- Deterministic from `(world, seed)`.

### B2. Learning objectives and schema

```ts
export type LoId =
  | 'F1'|'F2'|'F3'|'F4'|'F5'|'F6'|'F7'
  | 'W1'|'W2'|'W3'|'W4'
  | 'S1'|'S2'|'S3'|'S4'|'S5'|'S6'|'S7'
  | 'T1'|'T2'|'T3'|'T4';

export interface LearningObjective { id: LoId; domain: 'fuel'|'water'|'sleep'|'teeth';
  statement: string; evidenceSelectors: string[];  /* which traces/fields demonstrate it */ }
```

| id | statement (learner-facing, Spec C voice) |
|---|---|
| F1 | Carbohydrate you eat appears in the blood as glucose within about 15 minutes. |
| F2 | Fibre, fat and protein slow how fast glucose arrives, so the peak is lower and later. |
| F3 | Insulin rises after glucose and moves glucose into muscle, fat and liver. |
| F4 | Between meals the liver releases stored glucose (glycogen), so levels stay steady. |
| F5 | If glucose drops low, other hormones push the liver to release more — it rarely keeps falling. |
| F6 | Working muscle takes up glucose without needing extra insulin, and stays more sensitive for hours. |
| F7 | A fast, high peak is often followed by a dip; the "energy" feeling tracks glucose being in range, not high. |
| W1 | Water leaves the body all the time — breath, skin, urine — even at rest. |
| W2 | Thirst switches on after about 1 % of body mass is already lost; it lags the deficit. |
| W3 | Food carries water too; a meal counts toward intake. |
| W4 | Sweat loss scales with intensity and time; caffeine drinks still count as water. |
| S1 | Sleep pressure builds the whole time you're awake. |
| S2 | A body clock sets *when* sleep is available; trying too early gives long latency. |
| S3 | Sleep clears pressure fast at first, then slower. |
| S4 | Sleep runs in ~90-min cycles; deep sleep comes early, REM comes late; waking from deep/REM feels groggy. |
| S5 | Cutting a night short removes mostly REM, not deep sleep. |
| S6 | Caffeine halves about every 5 hours and masks pressure without removing it. |
| S7 | Bright/screen light in the evening pushes the body clock later, a little each night. |
| T1 | Sugar in the mouth is turned to acid by plaque within minutes; pH drops below 5.5 and enamel loses mineral. |
| T2 | How *often* sugar arrives matters more than how much; sipping keeps pH low. |
| T3 | Saliva buffers the acid in 20–40 min while awake; it nearly stops during sleep. |
| T4 | Acidic drinks erode directly, even without sugar; fluoride reduces mineral loss. |

```ts
export interface QuestionInstance {
  id: string;                      // hash(templateId, params, seed)
  templateId: 'T1'|…|'T10';
  lo: LoId;
  prompt: string;                  // Spec C voice
  evidence: { traceRef: string; windowEpochMin: [number, number] }; // what the UI highlights
  answer: AnswerSpec;              // see below
  feedback: { correct: string; incorrect: string; mechanism: string }; // each ≤ 2 sentences
}

export type AnswerSpec =
  | { kind: 'mcq'; options: string[]; correctIndex: number }
  | { kind: 'numeric'; value: number; tolerance: number; unit: string }
  | { kind: 'order'; items: string[]; correctOrder: number[] }
  | { kind: 'compare'; options: ['higher','lower','about the same']; correctIndex: number }
  | { kind: 'bool'; value: boolean };
```

### B3. Templates (T1–T10)

Each template exports `applicable(world): Params[]` (what can be asked from this history) and
`build(world, params, rng): QuestionInstance`. Only instances whose evidence lies in the last
48 h of game time are eligible.

| id | Name | Kind | What the oracle does | Typical LOs |
|---|---|---|---|---|
| T1 | Read the trace | numeric / mcq | finds peak/trough/crossing time or value in a trace window | F1, F7, T1, S1, W2 |
| T2 | Counterfactual | compare | clones the world at a chosen event, swaps one parameter (food, time, duration, brush y/n), re-runs ≤ 6 h, compares the metric | F2, S5, S6, T2, T3 |
| T3 | Why did that happen? | mcq | correct mechanism sentence from the fired card; 3 distractors from `misconceptions.json` for that LO | all |
| T4 | Put it in order | order | 4 events from one causal chain (e.g. sugar → acid → pH < 5.5 → mineral loss) | T1, F1→F3, S1→S3 |
| T5 | Predict | numeric | before advancing: "If you drink this now, how much caffeine at 23:00?" — oracle re-runs | S6, W4, F2 |
| T6 | Which trace? | mcq | shows a card headline, asks which of 3 trace snippets it belongs to | all |
| T7 | True or false | bool | mechanism statement paraphrased from an LO vs a misconception | all |
| T8 | Best next move | mcq | pal in a flagged state; oracle re-runs each of 3–4 actions for 60–120 min and ranks by the relevant metric | W2, F5, T3, S2 |
| T9 | Compare two days | compare / mcq | two of the pal's own nights/days; which had more REM / lower demin minutes / steadier glucose and the one-line why | S5, S7, T2, F2 |
| T10 | Claim check | mcq | a claim from `claims.json`; options: "the pal's day supports this / contradicts this / doesn't test this"; oracle checks the evidence selector | F7, W4, S6, T2 |

Template constraints:
- T1 numeric tolerance: ±5 mg/dL glucose, ±0.2 pH, ±10 min time, ±5 mg caffeine.
- T2/T8/T9 re-runs use a cloned `World` with a fresh RNG stream; the original is never touched.
- T3 distractors must be *plausible* misconceptions tagged to that LO (min 3 per LO in `misconceptions.json`), never silly.
- T10 claims (`claims.json`, ≥ 12) each carry `lo`, `text`, and `test: { selector, predicate }` so the oracle can decide "supports / contradicts / doesn't test" from the actual history.
- No instance may reference kcal, weight, or "good/bad" food. Voice lint runs over generated prompts in tests.

### B4. Oracle

```ts
oracle.peak(world, trace, window) → { epochMin, value }
oracle.firstCrossing(world, trace, threshold, dir, window)
oracle.rerun(world, atEpochMin, mutation, horizonMin) → World   // deep clone, apply mutation, advance
oracle.metric(world, name, window)   // 'glucosePeak' | 'minutesBelowPh55' | 'remMin' | 'latencyMin' | 'deficitMl' | 'caffeineAt' | …
```

All oracle calls are pure over the input world. Re-runs of ≤ 6 h must complete in < 50 ms.

### B5. Learner model (Leitner)

```ts
export interface LearnerModel {
  los: Record<LoId, { box: 0|1|2|3|4; dueEpochMin: number; streak: number; seen: number; correct: number }>;
  history: { questionId: string; lo: LoId; templateId: string; correct: boolean; epochMin: number }[];
}
```
- Intervals by box (game days): 0 → 0, 1 → 1, 2 → 2, 3 → 4, 4 → 8.
- Correct: `box = min(4, box+1)`, `streak++`. Incorrect: `box = max(0, box−1)`, `streak = 0`.
- **Mastered** = `box ≥ 3 && streak ≥ 2`. Mastered LOs still appear ~1 in 8 questions.
- Priority for selection: due & box 0 → due & box 1–2 → LOs with a card fired in the last 24 h never asked → due & box 3–4 → unseen LOs.

### B6. Session builder and focus gating

```
focus = selectors.focus(world.pal)   // §A5
```
| focus | questions | message shown |
|---|---|---|
| ≥ 0.70 | 6 | — |
| 0.50–0.69 | 4 | "Focus is a bit low — short session." |
| 0.30–0.49 | 2 | "Focus is low. Two questions, then look at why." + link to focus breakdown |
| < 0.30 | 0 | "Not now — the pal can't concentrate. Check sleep, water, glucose." |

Builder: pick LOs by §B5 priority; for each, choose the applicable template with the fewest
recent uses for that LO (ties by `rng`); at most 2 of the same template per session; at least
one T2/T8/T9 (sim re-run) per session of ≥ 4. Return `QuestionSession { id, questions, focusAtStart }`.
Answering calls `learner.record(...)` and returns feedback; it must not touch `world.pal`.

### B7. Validation (`validateInstance`)
Prompt ≤ 40 words; options ≤ 12 words each; exactly one correct; numeric tolerance > 0;
evidence window within last 48 h; voice lint passes; no two options identical after
normalisation; mechanism feedback quotes at least one number from the evidence window.

---

# Spec C — Voice and copy

### C1. The LINNAEA rules (every user-facing sentence)
- **L**iteral numbers — quote what the sim produced ("63 mg", "41 minutes under pH 5.5"), rounded sensibly; never "a lot".
- **I**nviting — second person, present tense, "try", "notice", "see what happens".
- **N**eutral about food and bodies — no good/bad, clean/junk, no weight, no appearance.
- **N**o fear — no "damage", "ruin", "destroy", "danger"; say what the mechanism does.
- **A**ctive voice, one idea per sentence, ≤ 20 words.
- **E**vidence-graded — Grade A: state plainly. Grade B: "in this model…". Grade C: "the pal's cartoon version of this…".
- **A**ge-right — reading age ~12; define any term the first time it appears in a session.

### C2. Shape rules
- Headlines ≤ 6 words, no exclamation marks.
- `mechanism` lines: exactly one sentence, contains ≥ 1 number and ≥ 1 named part (liver, insulin, saliva, body clock…).
- `learnMore` ≤ 120 words, ≤ 2 paragraphs, ends with one optional "Try:" sentence or nothing.
- `explanationLines` (sleep report) ≤ 2 sentences each, ≤ 4 lines.
- Feedback for a wrong answer never says "wrong"; it names the mechanism and points at the trace.

### C3. Numbers
Glucose in mg/dL whole numbers; pH to one decimal; caffeine whole mg; time as `HH:MM` 24 h or "N minutes"; water in mL (≥ 1000 → "1.2 L"). Percentages only for sleep report components.

### C4. Banned list (lint fails on any match, case-insensitive, user-facing strings only)
`calorie`, `kcal`, `weight`, `fat` (as adjective — allow "fat" as nutrient in food data only), `diet`, `junk`, `clean eating`, `cheat`, `burn off`, `guilty`, `bad for you`, `good for you`, `healthy choice`, `unhealthy`, `detox`, `toxic`, `sugar crash` (use "dip"), `damage`, `ruin`, `rot`, `destroy`, `danger`, `should always`, `never eat`, `!`.

### C5. Examples
- ✅ "Glucose peaked at 162 mg/dL at 08:42, about 40 minutes after the drink."
- ✅ "63 mg of caffeine is still circulating. In this model that adds about 12 minutes to falling asleep."
- ✅ "Saliva flow drops to roughly a tenth during sleep, so tonight's acid lingers. Try: brush before bed."
- ❌ "Sugar crash incoming!" ❌ "That drink is bad for your teeth." ❌ "Burn it off with a run."

### C6. Voice lint (`npm run lint:voice`)
Runs over `src/content/*.json`, `explanationLines` templates, and generated question fixtures:
banned list (C4), sentence length ≤ 20 words, headline ≤ 6 words, `learnMore` ≤ 120 words,
presence of a digit in every `mechanism` string, no "!" anywhere.

---

# Appendix 1 — Seed foods (`src/content/foods.json`)

Values per 100 g / 100 mL; fill `source` with the USDA FDC id when you add more.

```json
[
 {"id":"glucose-drink","name":"Glucose drink (test)","kind":"drink","per100":{"sugarsG":16.7,"starchG":0,"fibreG":0,"proteinG":0,"fatG":0,"waterG":83,"caffeineMg":0},"gi":100,"acidic":false,"defaultPortionG":300,"source":"OGTT standard, 50 g in 300 mL"},
 {"id":"water","name":"Water","kind":"drink","per100":{"sugarsG":0,"starchG":0,"fibreG":0,"proteinG":0,"fatG":0,"waterG":100,"caffeineMg":0},"gi":0,"acidic":false,"defaultPortionG":250,"source":"—"},
 {"id":"cola","name":"Cola","kind":"drink","per100":{"sugarsG":10.6,"starchG":0,"fibreG":0,"proteinG":0,"fatG":0,"waterG":89,"caffeineMg":10},"gi":63,"acidic":true,"defaultPortionG":330,"source":"USDA FDC"},
 {"id":"orange-juice","name":"Orange juice","kind":"drink","per100":{"sugarsG":8.4,"starchG":0,"fibreG":0.2,"proteinG":0.7,"fatG":0.2,"waterG":88,"caffeineMg":0},"gi":50,"acidic":true,"defaultPortionG":250,"source":"USDA FDC"},
 {"id":"coffee","name":"Coffee, black","kind":"drink","per100":{"sugarsG":0,"starchG":0,"fibreG":0,"proteinG":0.1,"fatG":0,"waterG":99,"caffeineMg":40},"gi":0,"acidic":false,"defaultPortionG":240,"source":"USDA FDC (≈95 mg per 240 mL)"},
 {"id":"milk","name":"Milk, semi-skimmed","kind":"drink","per100":{"sugarsG":4.8,"starchG":0,"fibreG":0,"proteinG":3.4,"fatG":1.7,"waterG":89,"caffeineMg":0},"gi":30,"acidic":false,"defaultPortionG":200,"source":"USDA FDC"},
 {"id":"oats","name":"Porridge oats, dry","kind":"solid","per100":{"sugarsG":1,"starchG":58,"fibreG":10,"proteinG":13,"fatG":7,"waterG":9,"caffeineMg":0},"gi":55,"acidic":false,"defaultPortionG":60,"source":"USDA FDC; GI tables"},
 {"id":"white-bread","name":"White bread","kind":"solid","per100":{"sugarsG":5,"starchG":44,"fibreG":2.5,"proteinG":9,"fatG":3,"waterG":37,"caffeineMg":0},"gi":75,"acidic":false,"defaultPortionG":70,"source":"USDA FDC; GI tables"},
 {"id":"banana","name":"Banana","kind":"solid","per100":{"sugarsG":12,"starchG":5,"fibreG":2.6,"proteinG":1.1,"fatG":0.3,"waterG":75,"caffeineMg":0},"gi":51,"acidic":false,"defaultPortionG":120,"source":"USDA FDC"},
 {"id":"apple","name":"Apple","kind":"solid","per100":{"sugarsG":10,"starchG":0,"fibreG":2.4,"proteinG":0.3,"fatG":0.2,"waterG":86,"caffeineMg":0},"gi":36,"acidic":false,"defaultPortionG":180,"source":"USDA FDC"},
 {"id":"pasta-tomato","name":"Pasta with tomato sauce","kind":"solid","per100":{"sugarsG":3,"starchG":22,"fibreG":2,"proteinG":5,"fatG":3,"waterG":65,"caffeineMg":0},"gi":50,"acidic":false,"defaultPortionG":350,"source":"composite"},
 {"id":"chicken-rice-veg","name":"Chicken, rice and vegetables","kind":"solid","per100":{"sugarsG":1.5,"starchG":18,"fibreG":2,"proteinG":12,"fatG":5,"waterG":60,"caffeineMg":0},"gi":60,"acidic":false,"defaultPortionG":400,"source":"composite"},
 {"id":"gummy-sweets","name":"Gummy sweets","kind":"solid","per100":{"sugarsG":60,"starchG":15,"fibreG":0,"proteinG":5,"fatG":0,"waterG":15,"caffeineMg":0},"gi":80,"acidic":true,"defaultPortionG":40,"source":"USDA FDC"},
 {"id":"cheese","name":"Cheese","kind":"solid","per100":{"sugarsG":0.5,"starchG":0,"fibreG":0,"proteinG":25,"fatG":33,"waterG":37,"caffeineMg":0},"gi":0,"acidic":false,"defaultPortionG":30,"source":"USDA FDC"},
 {"id":"eggs-toast","name":"Eggs on wholemeal toast","kind":"solid","per100":{"sugarsG":2,"starchG":20,"fibreG":4,"proteinG":12,"fatG":9,"waterG":52,"caffeineMg":0},"gi":55,"acidic":false,"defaultPortionG":200,"source":"composite"}
]
```

# Appendix 2 — Fixtures (`test/fixtures/*.json`)

Format: `{ "name", "seed", "massKg", "chronotypeOffsetMin", "start": "HH:MM", "initial": "fed-basal" | "fasted-basal", "actions": [ { "t": "D1 HH:MM", "do": "eat|drink|exercise|brush|sleep|wake|light", ...args } ], "expectCards": [ids in order ] }`.

`fed-basal`: glucose 90, I = X = 1, glycogen 100 g, S = 0.17 at 07:00 (just woke), deficit 0,
plaquePh 7.0, caffeine 0. `fasted-basal`: same but glycogen 60 g, `minutesSinceMeal = 720`.

| fixture | script (D1 unless noted) | expectCards |
|---|---|---|
| `boring-day` | wake 07:00 · 07:30 eggs-toast 200 g + water 250 · 10:30 water 250 · 13:00 chicken-rice-veg 400 g + water 300 · 16:00 apple 180 g + water 250 · 19:00 pasta-tomato 350 g + water 300 · 21:30 water 200 · brush 22:45 · sleep 23:00 alarm 07:00 | `[]` |
| `ogtt` | wake 07:00 · 08:00 glucose-drink 300 mL over 5 min · water as boring-day | `[1, 3, 7]` |
| `porridge` | wake 07:00 · 08:00 oats 60 g + milk 200 mL (eaten together, solid kinetics) | `[2]` |
| `fast-14h` | D0 19:00 pasta 350 g, brush, sleep 23:00 alarm 07:00; D1 water only until 09:00 | `[4]` |
| `run` | boring-day through lunch · 15:00 exercise intensity 2, 30 min · 15:35 water 500 | `[6, 9]` |
| `sip-vs-gulp` | two worlds: A) 16:00 cola 330 mL over 60 min; B) 16:00 cola 330 mL over 5 min; both boring-day otherwise, no brush until 22:45 | A `[14]`, B `[]` |
| `bedtime-brush` | two worlds: boring-day with 22:30 cola 330 mL over 10 min; A) no brush; B) brush 22:55; sleep 23:00 | A `[15]`, B `[]` |
| `normal-night` | boring-day | `[]` |
| `early-bed` | boring-day but sleep attempt 20:00 | `[11]` |
| `alarm-5h-vs-8h` | two worlds: sleep 23:00, alarm A) 04:00, B) 07:00 | A `[12]`, B `[]` |
| `late-coffee` | boring-day + 20:00 coffee 240 mL | `[10]` |
| `screens-3-nights` | boring-day × 5; `light true` 21:00 on D1–D3, false D4–D5 | `[13]` (once, D3→D4 wake) |
| `week` | 7 days mixing the above: D1 boring · D2 ogtt-style breakfast · D3 run · D4 late coffee + screens · D5 sipping cola + no brush · D6 alarm 05:30 · D7 boring | snapshot test; sequence stored in `test/snapshots/week-cards.json` on first green run |

Rule for all fixtures: if an *unlisted* card fires, first check whether the fixture's water or
meal timing is the cause and fix the fixture; only then suspect the trigger or constants.

---

# Appendix 3 — `docs/decisions.md` seed

```
# Decisions
- 2026-10-07  Engine is pure over PalState; World holds log/RNG/scheduler (SPEC §A1).
- 2026-10-07  Caffeine diuresis not modelled (SPEC §A4) — taught by card, not sim.
- 2026-10-07  Questions are read-only over World; re-runs clone (SPEC §B1, §B4).
```