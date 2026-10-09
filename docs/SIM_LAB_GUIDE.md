# 🔬 Simulation Lab guide

This guide explains how the Lab tab works, so anyone (a teacher, a co-editor or another AI tool) can add or improve a simulation and its 🎯 challenge. Read it before you change `src/sims*.js` or `src/simchal.js`.

- **Who it is for:** Hong Kong S4–S6 Biology students who learn in English as a second language, mostly on phones.
- **Scope:** HKDSE Biology compulsory part **"Organisms and Environment"**, sections **a–f**.
- **Promise to students:** every simulation shows something you cannot see in real life. Every challenge takes about **15 minutes**, and you can only finish it by **using the simulation**.

---

## 1. Curriculum map

| Sec | Section | Simulation (`id`) | The abstract idea it makes visible | File |
|---|---|---|---|---|
| a | Essential life processes in plants | 🫧 Root-hair membrane (`membrane`) | How water (osmosis) and mineral ions (active transport, needs ATP) cross a membrane | `sims.js` |
| a | | 💧 Osmosis tubing (`dialysis`) | Water potential gradient → net water movement; rate vs final level; fair tests | `sims2.js` |
| a | | 🍃 Leaf gas exchange (`leafgas`) | Photosynthesis vs respiration in a leaf; hydrogencarbonate indicator; compensation point | `sims_a.js` |
| a | | 💨 Transpiration (`transp`) | Potometer bubble; how light, humidity, wind and temperature change the rate of water loss | `sims_a.js` |
| b | Essential life processes in animals | 🍙 Digestion (`digest`) | Where each food is digested, by which enzyme, at which pH; absorption in the small intestine | `sims_b.js` |
| b | | 🫁 Breathing (`lung`) | Volume ↑ → pressure ↓ → air in (live pressure graph) | `sims.js` |
| b | | ❤️ Heart (`heart`) | Cardiac cycle: pressure in atrium / ventricle / aorta decides which valve opens | `sims_b.js` |
| c | Reproduction, growth and development | 🩸 Menstrual cycle (`cycle`) | FSH, LH, oestrogen and progesterone over 28 days; the uterus lining; pregnancy | `sims_c.js` |
| c | | 🌱 Germination & growth (`grow`) | Fresh mass vs dry mass; why dry mass falls first; growth curves | `sims_c.js` |
| d | Coordination and response | 👁️ Pupil reflex (`pupil`) | Reflex arc; antagonistic iris muscles | `sims.js` |
| d | | 🔍 Focusing & glasses (`lens`) | Accommodation; short/long sight; corrective lenses (ray diagram) | `sims.js` |
| d | | 👂 Hearing (`ear`) | Pathway of sound; frequency mapped along the cochlea; hair-cell damage | `sims.js` |
| d | | ⚡ Reflex arc (`reflex`) | Receptor → sensory → relay → motor → effector; synapse; reflex vs voluntary | `sims_d.js` |
| d | | 💪 Arm muscles (`muscle`) | Antagonistic muscles, the elbow as a lever, tendons and the joint | `sims_d.js` |
| d | | 🌱 Phototropism (`tropism`) | Classic coleoptile experiments; uneven auxin → uneven elongation | `sims2.js` |
| e | Homeostasis | 🍬 Blood glucose (`glucose`) | Negative feedback with insulin and glucagon; diabetes | `sims_e.js` |
| e | | 🏔️ Breathing control (`co2`) | CO₂ in blood → chemoreceptors → breathing rate (negative feedback) | `sims_e.js` |
| f | Ecosystems | 🦊 Food web (`foodweb`) | Energy flow and 10% transfer; pyramids; what happens when one population changes | `sims_f.js` |
| f | | 🔲 Quadrat sampling (`quadrat`) | Random sampling, estimating population size, frequency and % cover; line transects | `sims_f.js` |

The Lab groups sims by section (the six round chips at the top). The tab order inside a section comes from `ord`.

**Backlog (good next simulations):** tissue-fluid formation at a capillary; nitrogen and carbon cycles; flower pollination (insect vs wind); hormone vs nerve comparison race; predator–prey population graph; succession on a bare rock; seed dispersal.

---

## 2. Design logic: the 6-step recipe

Use these steps in order for every new simulation.

### Step 1. Pick ONE abstract idea
A simulation is worth building when the idea is:
- **invisible** (pressure, hormones, nerve impulses, water potential);
- **too slow or too fast** (a 28-day cycle, a heartbeat, seedling growth);
- **too small** (alveoli, synapses, membranes);
- **multi-variable** (factors that affect transpiration);
- **a feedback loop** (blood glucose, breathing rate).

Write the idea as one "cause → effect" sentence, for example *"volume ↑ → pressure ↓ → air flows in"*. The whole simulation exists to show that sentence.

### Step 2. Make the hidden thing visible
Choose the picture that shows the idea best:

| The idea is… | Show it as |
|---|---|
| a quantity that changes over time | a live line graph with a moving dot, plus "ghost" lines from earlier runs |
| a concentration or level | a fill level, a gauge or a colour scale (e.g. indicator colours) |
| movement of particles | a few dots with arrows (count them in a small table) |
| a pathway or chain | a row of icon steps; the active step lights up |
| a comparison | two bars side by side |
| a structure | a labelled side-view or cross-section, labels with a white halo |

### Step 3. Controls = the syllabus variables
- Use the **independent variables** the exam talks about (light intensity, humidity, wind, temperature…).
- Keep to **3–5 controls**: segmented buttons (`segBtns`) for categories, sliders for numbers, and **preset buttons with emoji** ("🌑 Dark", "☀️ Bright").
- Add **▶ Run / ⏩ Fast / ↺ Reset** when the process takes time.
- Changing a variable should change the picture **immediately**, so cause and effect stay together.

### Step 4. Readouts = the dependent variable
- One main readout with a **number and a unit** (mm per minute, mmol/L, kPa).
- One "🧠 What's happening?" panel that shows the **cause → effect chain** with icons. Highlight the step that is happening now.
- Use colour **and** an icon or word (✅/❌, ▲/▼), never colour alone.

### Step 5. Expose a probe
Call `simProbe(() => ({ … }))` once inside the simulation function. Return plain values (numbers, strings, booleans, small arrays) for everything a challenge might check: settings, live readings, counters ("runs done", "set-ups tried"), and flags ("finished", "running"). The probe is called 4 times a second; keep it cheap.

### Step 6. Write a 15-minute challenge
Follow this arc. Each mission is 3–5 tasks; the whole challenge is **15–20 tasks**, including the automatic exam check.

| Mission | Purpose | Main task types |
|---|---|---|
| 1. Explore | Learn the controls; make something happen | `goal`, `pick` |
| 2. Measure | Read numbers from the graph or readout | `read`, `goal` with `meter` |
| 3. Investigate | Change one variable at a time; fair test | `goal` + `read` (with `need`), `pick` |
| 4. Explain | Turn the evidence into exam language | `fill`, `order`, `pick` (misconceptions) |
| 5. Apply (optional) | A new context, a data question, an HK example | `pick`, `read` |
| 🧠 Exam check | Added automatically from `SIM_Q[id]` | `pick` |

**Rules that make students use the simulation purposefully:**
- At least **half** the tasks must need the simulation: `goal`, `read`, or any task with `need`.
- A `read` answer should come from the model (`fields: [[label, p => p.value, tol, unit]]`) or a number the student can only get by running it.
- Use `need` to lock a question until the right set-up is on screen ("🔒 First: set humidity to High").
- Wrong options in `pick` are **real misconceptions**. Give each one a `miss` note that sends the student back to the simulation ("Try it: …").
- Never ask for something the screen cannot show.

---

## 3. Visual aids for English learners (required)

1. **Picture word bank:** `words: [[term, emoji, meaning]]` in `simReg`. The meaning uses at most 12 simple words. Students tap a chip to hear it (🔊 British voice) and see the meaning. The same words become tappable purple chips inside every task.
2. **Short task text:** at most about 20 words. One verb first ("Switch…", "Make…", "Read…"). Put the control name in **bold** with its emoji, exactly as it appears on the button.
3. **👀 Look:** every task that needs the simulation gets a `look` hint naming the panel ("📈 Pressure graph").
4. **Icons on everything:** each task has `ic`; options in `pick` can be `[text, emoji]`.
5. **Sentence frames:** use `fill` tasks to rehearse the exam sentence ("When … increases, … because …").
6. **Arrows instead of words:** ↑ ↓ → for increase / decrease / leads to.
7. **Hints show where to look**, not the answer.
8. **Feedback (`why`)** is one or two short sentences in the "cause → effect" pattern.

---

## 4. Code reference

### Files
| File | What is in it |
|---|---|
| `src/sims.js` | Lab core (`simReg`, `renderSims`, `simLoop`, `simProbe`, `simStyle`, word bank, predict-first, `SIM_Q`, `SIM_P`) + breathing, pupil, focusing, hearing, membrane |
| `src/sims2.js` | Osmosis tubing, phototropism |
| `src/sims_a.js` … `src/sims_f.js` | One file per section: new simulations + `SIM_CH` challenges for every sim in that section |
| `src/simch_d.js` | Challenges for the older section-d sims (pupil, lens, ear, tropism) |
| `src/simchal.js` | The challenge engine (do not put content here) |
| `src/head.html` | Shared Lab CSS (search for "🔬 Lab:") |
| `tools/build.py` | Lists every file in load order; add new files here |

### Register a simulation
```js
simReg({ id: "transp", ic: "💨", name: "Transpiration", sec: "a", ord: 40, topic: "t12", fn: transpSim,
  words: [["stomata", "👄", "tiny holes in the leaf; water vapour leaves here"], …] });
function transpSim(root) {
  const st = { … };                                   // all state is local
  root.innerHTML = `<div class="simgrid wide"><section class="card">…</section><section class="card">…</section></div>`;
  // wire controls with root.querySelector(...)
  simProbe(() => ({ light: st.light, rate: +st.rate.toFixed(2), runs: st.runs }));
  simLoop(root, dt => { /* update st, redraw SVG */ });
}
```
- `sec`: `"a"`–`"f"`. `ord`: position in the section. `topic`: a `TOPICS` id (`t12` plants, `t8` nutrition, `t13` gas exchange, `t14` transport, `t15` reproduction, `t16` coordination, `t17` homeostasis, `t18` ecosystems).
- `simLoop(root, step)` runs `step(dt)` every frame (dt ≤ 0.05 s) and stops itself when the page changes.
- Wrap the main content in `.simgrid` (the predict-first card locks `.simgrid` and `.simchal` until a guess is made).
- `SIM_P[id] = [question, [right, wrong, wrong, wrong], why, "what to try"]` adds a predict-first card.
- `SIM_Q[id] = [[question, [right, …], why], …]` becomes the 🧠 Exam check mission.

### Challenge data
```js
SIM_CH.transp = {
  title: "Leaf Water Detective", mins: 15,
  story: "One sentence: the student's mission.",
  missions: [
    { ic: "🎛️", name: "Explore", tasks: [ task, task, … ] },
    …
  ]
};
```

### Task types
Every task can have: `ic` (emoji), `do` (instruction; `<b>` allowed), `look` (where to look), `hint`, `why` (feedback after success), `need(p)` + `needTxt` (lock until the sim is set up).

| type | Extra fields | Completes when |
|---|---|---|
| `goal` | `check(p)`, `hold` (s, default 1), `target` (short text), `meter(p)` → `{ v, min, max, lo, hi, unit, label }` | `check` stays true for `hold` seconds |
| `read` | `fields: [[label, answer or (p) => answer, tolerance, unit]]`, `readTip` | every field is within its tolerance (default ±5% or ±1) |
| `pick` | `opts: [right, wrong, …]` (strings or `[text, emoji]`), `miss: ["", note for opt 1, …]` | the right option is chosen (options are shuffled) |
| `fill` | `text: "… {right|wrong|wrong} …"` | every blank is right |
| `order` | `items: [first, second, …]` | the order is right (items are shuffled) |

The **right answer is always written first**; the engine shuffles. `p` is the current probe object.

**Rewards and saving** (automatic): +2 🌰 per task, +5 per mission, +20 for the whole challenge (all × streak bonus). Finishing a mission counts as studying today (streak). Progress is in `S.simc[id] = { d: { "mission.task": 1 }, w, h, secs, fin }`. Stars: ⭐⭐⭐ ≤ 2 wrong, ⭐⭐ ≤ 6 wrong.

**The task dock:** while the current task is off-screen, a sticky bar above the bottom nav shows it (with a live 🟢 light for `goal`/`need`), so students can scroll up, use the simulation, and still see what to do. When a task is done there, the dock shows ✅ + the short "why" and a **Next ›** button, so the student can keep working at the model without scrolling.

### Coding conventions
- Inline SVG only, drawn in code, with a `viewBox` and `role="img"` + `aria-label`. No images, fonts or libraries from the web.
- **Prefix everything** with the sim id: function names (`transpSvg`), constants (`TRANSP_…`) and CSS classes (`.transp-…`). The game is one big script, so a short global name like `CH` can clash and break the whole game.
- Put sim-specific CSS in the section file with `simStyle(\`…\`)`.
- Phone first: test at 360–390 px. No sideways scroll on the page. Wide diagrams go in `.simsvg` (they scroll inside their card); small ones use `.simsvg.nozoom`.
- Tap targets ≥ 44 px. Respect `prefers-reduced-motion` for decorative motion.
- British spelling, short sentences, HK examples where natural. No real student names. No official logos or characters.
- Curriculum facts must be correct for HKDSE; when the model simplifies, say so in a comment.

---

## 5. Testing

```bash
python3 tools/build.py              # rebuild index.html
node tools/check_content.js         # question banks
NODE_PATH=$(npm root -g) node tools/check_lab.js   # every sim renders; every challenge is valid and can be completed
NODE_PATH=$(npm root -g) node tools/smoke.js       # whole-game smoke test
```
`tools/check_lab.js` opens each simulation at 390 px, checks for errors and sideways scroll, validates every `SIM_CH` task (types, fields, answers), and plays every challenge to the end (non-goal tasks are answered through the UI; goal tasks are checked to have a working `check` function).

Before you finish, also try every `goal` task by hand: it must be reachable with the controls on screen.

Avoid a first `goal` that the model already meets when it opens (e.g. "play the heart" when it starts playing): it ticks itself off before the student does anything. Ask for a real change instead (🐢 slow motion, a preset, a slider into a zone). If a `read` answer changes while the model runs, add a `need` that pauses it (or a wide `tol` + `readTip`).

## 6. Checklist for a new simulation
- [ ] One abstract idea, written as a cause → effect sentence (top-of-function comment).
- [ ] `simReg` with `sec`, `ord`, `topic` and 5–8 `words`.
- [ ] 3–5 controls, presets with emoji, a live readout with units, a "What's happening?" chain.
- [ ] `simProbe` exposes everything the challenge checks.
- [ ] `SIM_P` (predict first) and 2 `SIM_Q` exam questions.
- [ ] `SIM_CH` with 4–5 missions, 15–20 tasks in total, ≥ half need the simulation.
- [ ] Added to `tools/build.py` if it is a new file; `check_lab.js` passes; no sideways scroll at 390 px.
- [ ] A line in this guide's curriculum map, and in `docs/SHARED_KNOWLEDGE.md` if the pattern is reusable.
