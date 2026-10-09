/* ============================================================
   5f-b. 🍙 Lab section b: Essential life processes in animals
   Breathing (lungSim lives in sims.js) — its 🎯 challenge is below and is the REFERENCE EXAMPLE for every
   other challenge (see docs/SIM_LAB_GUIDE.md).
   ============================================================ */

/* 🎯 Breathing challenge. Probe (sims.js): volume 0–100 · pressure kPa (−0.6…0.6, relative to atmospheric) ·
   phase "in"/"out"/"rest" · mode "auto"/"manual" · exercise · breaths · pMax/pMin over the last 10 s */
SIM_CH.lung = {
  title: "Breathing Detective", mins: 15,
  story: "Your mission: prove HOW air gets into the lungs. Use the chest model and the pressure graph as your evidence.",
  missions: [
    { ic: "✋", name: "Take control", tasks: [
      { type: "goal", ic: "✋", do: "Switch the model to <b>✋ I control it</b>.", look: "Buttons under the chest model", target: "Manual mode", check: p => p.mode === "manual", hold: .2,
        why: "Now YOU move the diaphragm and ribs. Watch the labels change." },
      { type: "goal", ic: "⬇️", do: "Press <b>⬇️ Breathe in</b>. Fill the lungs to more than 75%.", look: "Chest model + green volume line", target: "Lung volume ≥ 75%",
        check: p => p.volume >= 75, meter: p => ({ v: p.volume, min: 0, max: 100, lo: 75, hi: 100, unit: "%", label: "Lung volume" }), hold: .3,
        why: "The diaphragm contracted and flattened, and the ribs moved up and out. The chest volume got bigger." },
      { type: "pick", ic: "📈", do: "While the lungs were filling, where was the <b>red pressure line</b>?", look: "📈 Pressure graph",
        opts: [["Below the dashed line: lung pressure was lower than atmospheric", "⬇️"], ["Above the dashed line: lung pressure was higher than atmospheric", "⬆️"], ["On the dashed line: no pressure change", "➖"]],
        miss: ["", "Look again: press ⬇️ Breathe in and watch which way the red line moves.", "The line moves away from the dashed line while the volume changes. Try it again and watch."],
        why: "Volume ↑ → pressure ↓ (below atmospheric). Air moves from high pressure (outside) to low pressure (lungs)." },
      { type: "goal", ic: "⬆️", do: "Now <b>⬆️ Breathe out</b>. Empty the lungs to less than 25%.", look: "Chest model", target: "Lung volume ≤ 25%",
        check: p => p.mode === "manual" && p.volume <= 25, meter: p => ({ v: p.volume, min: 0, max: 100, lo: 0, hi: 25, unit: "%", label: "Lung volume" }), hold: .3,
        why: "The muscles relaxed: the diaphragm domed up and the ribs moved down and in. Volume ↓ → pressure ↑ → air flows out." },
      { type: "goal", ic: "🎈", do: "Make the red line go <b>ABOVE</b> the dashed line (higher than atmospheric pressure).", look: "📈 Pressure graph", hint: "Fill the lungs first (⬇️), then press ⬆️ Breathe out and watch.", target: "Lung pressure above atmospheric",
        check: p => p.pressure > .12, hold: 0, why: "Breathing out squeezes the lungs: pressure rises above atmospheric, so air is pushed out." }] },
    { ic: "📈", name: "Read the graph", tasks: [
      { type: "goal", ic: "▶", do: "Switch back to <b>▶ Auto breathing</b> (no exercise). Watch the graph for 10 seconds.", look: "📈 Pressure graph", target: "Auto, at rest, for 10 s",
        check: p => p.mode === "auto" && !p.exercise, hold: 10, meter: null, why: "The red line goes up and down once for every breath. The dashed line is atmospheric pressure." },
      { type: "read", ic: "🔢", do: "Count the <b>breaths</b> on the graph: how many red-line dips (breaths in) are there in the 10 seconds shown?", look: "📈 Pressure graph",
        need: p => p.mode === "auto" && !p.exercise && p.t > 10, needTxt: "Auto breathing, no exercise.", fields: [["Breaths in 10 s (at rest)", 2.4, 1, "breaths"], ["So breaths per minute (× 6)", 14.4, 4, "/min"]],
        hint: "Count the dips BELOW the dashed line. Then multiply by 6 (60 s ÷ 10 s = 6).", why: "About 2–3 breaths in 10 s → about 12–18 breaths per minute at rest." },
      { type: "fill", ic: "✍️", do: "Use your evidence to finish the sentence.",
        text: "When the chest volume {increases|decreases|stays the same}, the pressure in the lungs {falls below|rises above} atmospheric pressure, so air flows {in|out}.",
        why: "This is the key exam sentence: volume ↑ → pressure ↓ → air in." }] },
    { ic: "🏃", name: "Exercise test", tasks: [
      { type: "goal", ic: "🏃", do: "Tick <b>🏃 Exercise</b> (with auto breathing). Watch for 10 seconds.", look: "Tick box under the chest model", target: "Exercise on, for 10 s",
        check: p => p.exercise && p.mode === "auto", hold: 10, why: "Deeper and faster breaths: the graph swings more and more often." },
      { type: "read", ic: "📏", do: "During exercise, read the graph.", look: "📈 Pressure graph · y-axis",
        need: p => p.exercise && p.mode === "auto", needTxt: "🏃 Exercise ticked, auto breathing.",
        fields: [["Highest pressure (top of the red line)", p => p.pMax, .1, "kPa"], ["Breaths in 10 s", 3.8, 1, "breaths"]],
        hint: "The top grid label is +0.6 kPa, the dashed line is 0. Count the dips below the dashed line.",
        why: "About +0.6 kPa and about 4 breaths in 10 s (≈ 23 per minute). At rest it was only about ±0.2 kPa and 2–3 breaths." },
      { type: "pick", ic: "🤔", do: "Why are the pressure swings <b>bigger</b> during exercise?", look: "Compare rest vs exercise",
        opts: ["Deeper, faster breaths change the chest volume more, and more quickly", "The air outside the body has a higher pressure during exercise", "The lungs make their own air during exercise", "The heart pushes air into the lungs"],
        miss: ["", "The dashed line (atmospheric pressure) did not move. Only the lungs changed.", "Lungs do not make air: all air comes in through the trachea.", "The heart pumps blood, not air."],
        why: "A bigger, faster volume change makes a bigger pressure difference, so more air moves in each minute (more O₂ for respiration in muscles)." },
      { type: "pick", ic: "💪", do: "Which muscles work <b>harder</b> during exercise breathing?", look: "Chest model labels",
        need: p => p.exercise && p.phase === "in", needTxt: "🏃 Exercise on: watch one breath in.",
        opts: ["Diaphragm and intercostal muscles", "Heart muscle only", "Iris muscles", "Biceps and triceps"],
        why: "The diaphragm and intercostal muscles contract more strongly, so the chest volume changes more." }] },
    { ic: "🔢", name: "Explain it", tasks: [
      { type: "order", ic: "⬇️", do: "Put the steps of <b>inhalation</b> in order.", look: "Steps list next to the graph",
        items: ["Diaphragm and external intercostal muscles contract", "Diaphragm flattens; ribs move up and out", "Volume of the chest cavity increases", "Pressure in the lungs falls below atmospheric pressure", "Air flows in through the trachea"],
        why: "Muscles → movement → volume ↑ → pressure ↓ → air in. Exhalation is the reverse." },
      { type: "pick", ic: "🕵️", do: "A classmate says: “Air rushes into the lungs, and this makes the chest get bigger.” What is wrong?",
        opts: ["It is the other way round: the chest gets bigger first, then air flows in", "Nothing is wrong", "Air never enters the lungs; only oxygen does", "The chest gets smaller when air comes in"],
        miss: ["", "Watch the manual model: the volume changes BEFORE the arrow shows air moving in.", "Air (a mixture of gases) enters; oxygen is only part of it.", "Look at the chest model: it gets bigger when air comes in."],
        why: "Cause → effect: muscles change the volume, the volume changes the pressure, and the pressure difference moves the air." },
      { type: "fill", ic: "✍️", do: "Finish the sentence about breathing out at rest.",
        text: "At rest, breathing out is mostly {passive|active}: the diaphragm muscles {relax|contract}, so the diaphragm {domes upwards|flattens}.",
        why: "Quiet exhalation needs no extra muscle work; the stretched lungs and relaxed muscles spring back." }] }
  ]
};
