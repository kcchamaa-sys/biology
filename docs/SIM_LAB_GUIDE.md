# 🔬 Simulation Lab guide

This guide explains how the Lab tab works, so anyone (a teacher, a co-editor or another AI tool) can add or improve a simulation and its 🎯 challenge. Read it before you change `src/sims*.js` or `src/simchal.js`.

- **Who it is for:** Hong Kong S4–S6 Biology students who learn in English as a second language, mostly on phones.
- **Scope:** the whole HKDSE Biology compulsory part: **I. Cells and Molecules of Life** (a–e), **II. Genetics and Evolution** (a–c), **III. Organisms and Environment** (a–f), **IV. Health and Diseases** (a–c).
- **Promise to students:** every simulation shows something you cannot see in real life. Every challenge takes about **15 minutes**, and you can only finish it by **using the simulation**.

---

## 1. Curriculum map

The Lab has three levels: **4 part tabs** (I–IV, with a progress bar) → **section chips** (the HKDSE sub-topics) → **simulation tabs**. The **🗺️ All labs** button opens a map of every lab with challenge progress. Section keys in code are part number + letter (`"1a"` … `"4c"`, see `SIM_SECS` in `src/sims.js`).

| Sec | Section | Simulation (`id`) | The abstract idea it makes visible | File |
|---|---|---|---|---|
| **I** | **Cells and Molecules of Life** | | | |
| 1a | Molecules of life | 🧪 Food tests (`foodtest`) | Benedict's, iodine, biuret, ethanol emulsion tests; identify unknowns; semi-quantitative Benedict's | `sims_p1a.js` |
| 1a | | 🔗 Build biomolecules (`molbuild`) | Condensation vs hydrolysis; glycosidic, peptide, ester bonds; n monomers → n−1 waters | `sims_p1a.js` |
| 1b | Cellular organisation | 🔬 Cell explorer (`cellview`) | Light vs electron microscope; organelles and functions; plant / animal / bacterial cells; magnification | `sims_p1a.js` |
| 1c | Movement of substances across membrane | 🧊 Diffusion & size (`diffuse`) | Agar cubes: surface area : volume ratio and diffusion time; factors affecting diffusion | `sims_p1b.js` |
| 1c | | 💧 Osmosis tubing (`dialysis`) | Water potential gradient → net water movement; rate vs final level; fair tests | `sims2.js` |
| 1c | | 🥔 Osmosis in cells (`plasmo`) | Potato strips % mass change; plasmolysis; red blood cells in different solutions | `sims_p1b.js` |
| 1d | Cell cycle and division | 🧬 Mitosis & meiosis (`celldiv`) | Chromosome behaviour stage by stage; crossing over; independent assortment; mitotic index | `sims_p1b.js` |
| 1e | Cellular energetics | 🔑 Enzyme lab (`enzyme`) | Active site; temperature, pH, substrate and enzyme concentration; competitive vs non-competitive inhibitors | `sims_p1c.js` |
| 1e | | 🌿 Photosynthesis lab (`photo`) | Pondweed bubbles; limiting factors; light-dependent reactions and Calvin cycle in the chloroplast | `sims_p1c.js` |
| 1e | | 🔋 Respiration lab (`resp`) | Respirometer; yeast fermentation; glycolysis → Krebs cycle → oxidative phosphorylation; aerobic vs anaerobic | `sims_p1c.js` |
| **II** | **Genetics and Evolution** | | | |
| 2a | Basic genetics | 🫛 Genetic crosses (`cross`) | Punnett squares; random fertilisation → 3 : 1; test cross; ABO codominance; sex linkage | `sims_p2a.js` |
| 2a | | 🌳 Pedigree detective (`pedigree`) | Reading family trees: dominant / recessive, autosomal / X-linked, genotypes, probabilities | `sims_p2a.js` |
| 2b | Molecular genetics | 🔠 DNA to protein (`protein`) | Transcription and translation; the genetic code; substitution and frameshift mutations | `sims_p2a.js` |
| 2b | | 🧫 DNA fingerprinting (`gel`) | PCR and gel electrophoresis; matching band patterns; recombinant DNA (insulin) | `sims_p2b.js` |
| 2c | Biodiversity and evolution | 🗂️ Classify & key (`classify`) | Using and building dichotomous keys; classification hierarchy; binomial names | `sims_p2b.js` |
| 2c | | 🦋 Natural selection (`evolve`) | Peppered moths: variation → selection → allele frequency change over generations | `sims_p2b.js` |
| **III** | **Organisms and Environment** | | | |
| 3a | Essential life processes in plants | 🫧 Root-hair membrane (`membrane`) | How water (osmosis) and mineral ions (active transport, needs ATP) cross a membrane | `sims.js` |
| 3a | | 🍃 Leaf gas exchange (`leafgas`) | Photosynthesis vs respiration in a leaf; hydrogencarbonate indicator; compensation point | `sims_a.js` |
| 3a | | 💨 Transpiration (potometer) (`transp`) | Potometer bubble; how light, humidity, wind and temperature change the rate of water loss | `sims_a.js` |
| 3b | Essential life processes in animals | 🍙 Digestion lab (`digest`) | Where each food is digested, by which enzyme, at which pH; absorption in the small intestine | `sims_b.js` |
| 3b | | 🫁 Breathing (`lung`) | Volume ↑ → pressure ↓ → air in (live pressure graph) | `sims.js` |
| 3b | | ❤️ Heart & cardiac cycle (`heart`) | Cardiac cycle: pressure in atrium / ventricle / aorta decides which valve opens | `sims_b.js` |
| 3c | Reproduction, growth and development | 🌸 Menstrual cycle hormones (`cycle`) | FSH, LH, oestrogen and progesterone over 28 days; the uterus lining; pregnancy | `sims_c.js` |
| 3c | | 🌱 Germination & growth (`grow`) | Fresh mass vs dry mass; why dry mass falls first; growth curves | `sims_c.js` |
| 3d | Coordination and response | 👁️ Pupil reflex (`pupil`) | Reflex arc; antagonistic iris muscles | `sims.js` |
| 3d | | 🔍 Focusing & glasses (`lens`) | Accommodation; short/long sight; corrective lenses (ray diagram) | `sims.js` |
| 3d | | 👂 Hearing (`ear`) | Pathway of sound; frequency mapped along the cochlea; hair-cell damage | `sims.js` |
| 3d | | ⚡ Reflex arc (`reflex`) | Receptor → sensory → relay → motor → effector; synapse; reflex vs voluntary | `sims_d.js` |
| 3d | | 💪 Arm muscles & joints (`muscle`) | Antagonistic muscles, the elbow as a lever, tendons and the joint | `sims_d.js` |
| 3d | | 🌻 Phototropism (`tropism`) | Classic coleoptile experiments; uneven auxin → uneven elongation | `sims2.js` |
| 3e | Homeostasis | 🍬 Blood glucose control (`glucose`) | Negative feedback with insulin and glucagon; diabetes | `sims_e.js` |
| 3e | | 🏔️ Breathing control (CO₂) (`co2`) | CO₂ in blood → chemoreceptors → breathing rate (negative feedback) | `sims_e.js` |
| 3f | Ecosystems | 🕸️ Food web & energy (`foodweb`) | Energy flow and 10% transfer; pyramids; what happens when one population changes | `sims_f.js` |
| 3f | | 🟩 Quadrat sampling (`quadrat`) | Random sampling, estimating population size, frequency and % cover; line transects | `sims_f.js` |
| **IV** | **Health and Diseases** | | | |
| 4a | Personal health | 🚭 Smoking & health (`smoke`) | Smoking machine (tar, heat, acidic gases); cilia, emphysema, CO and nicotine effects | `sims_p4a.js` |
| 4a | | 🫀 Heart health (`heartrisk`) | Atherosclerosis in a coronary artery; lifestyle risk factors → narrowing → heart attack | `sims_p4a.js` |
| 4b | Diseases | 🦠 Disease spread (`spread`) | Transmission routes; epidemic curve; prevention measures; vaccination and herd immunity | `sims_p4a.js` |
| 4b | | 💊 Antibiotics test (`antibio`) | Zones of inhibition; aseptic technique; antibiotics vs viruses; antibiotic resistance | `sims_p4b.js` |
| 4c | Body defence mechanisms | 🛡️ Immune response (`immune`) | Lines of defence; phagocytosis; B and T cells, antibodies; primary vs secondary response; vaccination | `sims_p4b.js` |

The tab order inside a section comes from `ord`.

**Backlog (good next simulations):** tissue-fluid formation at a capillary; nitrogen and carbon cycles; flower pollination (insect vs wind); hormone vs nerve comparison race; predator–prey population graph; succession on a bare rock; seed dispersal; DNA extraction; blood clotting.

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
| `src/sims_a.js` … `src/sims_f.js` | Part III, one file per section: new simulations + `SIM_CH` challenges for every sim in that section |
| `src/sims_p1a.js` … `src/sims_p1c.js`, `sims_p2a.js`, `sims_p2b.js`, `sims_p4a.js`, `sims_p4b.js` | Parts I, II and IV: simulations + their `SIM_CH` challenges |
| `src/simch_d.js` | Challenges for the older section-d sims (pupil, lens, ear, tropism) |
| `src/simchal.js` | The challenge engine (do not put content here) |
| `src/head.html` | Shared Lab CSS (search for "🔬 Lab:") |
| `tools/build.py` | Lists every file in load order; add new files here |

### Register a simulation
```js
simReg({ id: "transp", ic: "💨", name: "Transpiration", sec: "3a", ord: 40, topic: "t12", fn: transpSim,
  words: [["stomata", "👄", "tiny holes in the leaf; water vapour leaves here"], …] });
function transpSim(root) {
  const st = { … };                                   // all state is local
  root.innerHTML = `<div class="simgrid wide"><section class="card">…</section><section class="card">…</section></div>`;
  // wire controls with root.querySelector(...)
  simProbe(() => ({ light: st.light, rate: +st.rate.toFixed(2), runs: st.runs }));
  simLoop(root, dt => { /* update st, redraw SVG */ });
}
```
- `sec`: a `SIM_SECS` key, `"1a"`–`"4c"` (part number + section letter). `ord`: position in the section. `topic`: a `TOPICS` id (`t1` molecules, `t2` cells, `t3` membranes, `t4` cell division, `t5` enzymes, `t6` photosynthesis, `t7` respiration, `t9` basic genetics, `t10` molecular genetics, `t11` biodiversity & evolution, `t12` plants, `t8` nutrition, `t13` gas exchange, `t14` transport, `t15` reproduction, `t16` coordination, `t17` homeostasis, `t18` ecosystems, `t19` health & diseases).
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
NODE_PATH=$(npm root -g) node tools/check_layout.js # every lab at 360/390 px phones, iPad portrait/landscape, desktop
NODE_PATH=$(npm root -g) node tools/smoke.js       # whole-game smoke test
```
`tools/check_layout.js [simId …]` reports sideways page scroll (error), and as warnings: clipped HTML text, elements sticking out of their card, diagrams that need a sideways swipe, SVG labels cut off by the diagram edge, overlapping SVG labels, labels smaller than 8.5 px on screen, and small tap targets. Aim for zero warnings on a new simulation (`--strict` makes warnings fail).

**Layout rules (phone, iPad, desktop):**
- Draw diagrams to **fit the card width** (`.simsvg.nozoom`): design the `viewBox` for a ~320 px wide phone card (taller, narrower viewBoxes; stack panels vertically). Use the sideways-swipe `.simsvg` only for a diagram that truly cannot fit.
- SVG label text must be ≥ 9 px on a 360 px phone: font-size (viewBox units) ≥ 9 × viewBox width ÷ 320.
- Keep every label inside the `viewBox`, give labels over drawings a white halo, and move long or secondary labels into an HTML legend under the diagram.
- Diagrams should look like a good textbook / exam diagram (correct structures and proportions, leader-line labels), not cartoons.
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
