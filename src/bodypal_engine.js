
/* ============================================================
   5f-3. 🫀 Body Pal engine (from "New update direction.md", the BODYPAL spec)
   A pal whose body is simulated minute by minute: fuel (glucose, insulin, liver glycogen), water, sleep
   (two-process model, 90-min cycles, caffeine, evening light) and teeth (Stephan curve).
   DOM-free and deterministic: no Date.now(), no Math.random(). The same action log always gives the same day,
   so the game saves only the log and replays it, and the question "oracle" simply re-runs a changed log.
   Constants, grades, tuning and decisions: docs/bodypal_science_notes.md. Checks: node tools/check_bodypal.js
   ============================================================ */
const BPK = {
  MASS_DEFAULT_KG: 60, VG_DL_PER_KG: 1.7, EGP_BASAL_MG_KG_MIN: 2.2, EGP_SUPPRESS_PER_X: 0.25, COUNTERREG_GAIN: 0.08,
  GLY_SHARE_MAX: 0.85, GLY_SHARE_EXP: 0.3, GLYCOGEN_LIVER_CAP_G: 120, U_II_MG_KG_MIN: 1.0, U_ID_BASAL_MG_MIN: 72,
  GLUCOSE_EFFECTIVENESS: 0.015, K_ABS_MAX: 0.05, FIBRE_ABS_FACTOR: 0.08, FIRST_PASS_MAX: 0.30,
  EMPTY_HL_DRINK_MIN: 27, EMPTY_HL_SOLID_BASE_MIN: 60, EMPTY_HL_FAT_PER_G: 2.0, EMPTY_HL_PROTEIN_PER_G: 1.0,
  EMPTY_HL_FIBRE_PER_G: 1.5, EMPTY_HL_CAP_MIN: 150, INSULIN_GAIN_PER_MGDL: 0.12, INSULIN_HL_MIN: 5, X_TAU_MIN: 30,
  SENS_SLEEP_DEBT_PENALTY: 0.3, SENS_EXERCISE_BONUS: 0.15, EXERCISE_UPTAKE_PER_INT: 1.5, EXERCISE_EGP_PER_INT: 0.6,
  SWEAT_ML_MIN: { 1: 8, 2: 15, 3: 25 }, RECENT_EXERCISE_H: 12,
  WATER_LOSS_AWAKE_ML_H: 95, WATER_LOSS_ASLEEP_ML_H: 45, THIRST_FRACTION_MASS: 0.01, WATER_SURPLUS_FLOOR_ML: -300,
  SATIETY_MASS_REF_G: 350, SATIETY_TIME_TAU_MIN: 240, HUNGER_LOW_GLUCOSE_BONUS: 0.2, HUNGRY_THRESHOLD: 0.75,
  TAU_S_RISE_H: 18.2, TAU_S_DECAY_H: 4.2, H_MEAN: 0.67, L_MEAN: 0.17, C_AMPLITUDE: 0.12, C_PEAK_MINUTE: 960,
  GATE_OFFSET: 0.10, LATENCY_MIN_MIN: 10, LATENCY_SLOPE_NEAR: 350, LATENCY_SLOPE_FAR: 600, LATENCY_CAP_MIN: 180,
  LIGHT_LATENCY_MIN: 15, CAFFEINE_LATENCY_PER_MG: 0.2, NATURAL_WAKE_MIN_H: 4, INERTIA_MIN: 30, CYCLE_MIN: 90,
  SWS_BASE_MIN: 40, SWS_DECLINE_PER_CYCLE: 12, REM_BASE_MIN: 10, REM_GROWTH_PER_CYCLE: 8, REM_CAP_MIN: 40,
  CAFFEINE_HL_H: 5, LIGHT_DELAY_PER_NIGHT_MIN: 10, LIGHT_DELAY_CAP_MIN: 60, LIGHT_DELAY_RECOVERY_MIN_DAY: 20,
  SLEEP_NEED_TEEN_MIN: 540, IDEAL_ONSET_MINUTE: 1350,
  ACID_PER_EXPOSURE: 0.6, ACID_SUGAR_REF_G: 5, ACID_BUFFER_HL_AWAKE_MIN: 35, SALIVA_FLOW_ASLEEP: 0.1,
  SALIVA_BUFFER_ASLEEP: 0.4, PH_RESTING: 7.0, PH_DROP_MAX: 2.0, PH_APPROACH_RATE: 0.25, FLUORIDE_SHIELD_EFFECT: 0.3,
  FLUORIDE_HL_MIN: 120, CRITICAL_PH: 5.5
};
/* Seed foods (spec Appendix 1), values per 100 g or 100 mL */
const BP_FOODS = [
  ["glucose-drink", "Glucose drink (test)", "🧪", "drink", [16.7, 0, 0, 0, 0, 83, 0], 100, false, 300],
  ["water", "Water", "💧", "drink", [0, 0, 0, 0, 0, 100, 0], 0, false, 250],
  ["cola", "Cola", "🥤", "drink", [10.6, 0, 0, 0, 0, 89, 10], 63, true, 330],
  ["orange-juice", "Orange juice", "🍊", "drink", [8.4, 0, 0.2, 0.7, 0.2, 88, 0], 50, true, 250],
  ["coffee", "Coffee, black", "☕", "drink", [0, 0, 0, 0.1, 0, 99, 39.6], 0, false, 240],
  ["milk", "Milk, semi-skimmed", "🥛", "drink", [4.8, 0, 0, 3.4, 1.7, 89, 0], 30, false, 200],
  ["oats", "Porridge oats, dry", "🥣", "solid", [1, 58, 10, 13, 7, 9, 0], 55, false, 60],
  ["white-bread", "White bread", "🍞", "solid", [5, 44, 2.5, 9, 3, 37, 0], 75, false, 70],
  ["banana", "Banana", "🍌", "solid", [12, 5, 2.6, 1.1, 0.3, 75, 0], 51, false, 120],
  ["apple", "Apple", "🍎", "solid", [10, 0, 2.4, 0.3, 0.2, 86, 0], 36, false, 180],
  ["pasta-tomato", "Pasta with tomato sauce", "🍝", "solid", [3, 22, 2, 5, 3, 65, 0], 50, false, 350],
  ["chicken-rice-veg", "Chicken, rice and vegetables", "🍛", "solid", [1.5, 18, 2, 12, 5, 60, 0], 60, false, 400],
  ["gummy-sweets", "Gummy sweets", "🍬", "solid", [60, 15, 0, 5, 0, 15, 0], 80, true, 40],
  ["cheese", "Cheese", "🧀", "solid", [0.5, 0, 0, 25, 33, 37, 0], 0, false, 30],
  ["eggs-toast", "Eggs on wholemeal toast", "🍳", "solid", [2, 20, 4, 12, 9, 52, 0], 55, false, 200],
  // Hong Kong dishes for the living Study Pal: per-serving estimates turned into per 100 g (GI from published tables of similar foods; grade C)
  ...[["hk-salad", "Egg salad", "🥗", "solid", 200, [10, 10, 11, 4, 4, 150, 0], 30], ["hk-rice", "Rice with vegetables", "🍚", "solid", 350, [60, 7, 3, 2, 3, 240, 0], 73],
    ["hk-fish", "Steamed fish with rice", "🐟", "solid", 400, [55, 30, 8, 2, 2, 290, 0], 70], ["hk-congee", "Fish congee", "🥣", "solid", 450, [40, 14, 4, 1, 1, 390, 0], 78],
    ["hk-siumai", "Siu mai (4 pieces)", "🥟", "solid", 100, [12, 10, 12, 1, 0.5, 60, 0], 55], ["hk-fishball", "Curry fish balls", "🍢", "solid", 150, [18, 10, 10, 3, 0.5, 105, 0], 55],
    ["hk-noodles", "Wonton noodles", "🍜", "solid", 500, [55, 20, 10, 2, 2, 410, 0], 55], ["hk-bun", "Pineapple bun", "🍞", "solid", 90, [45, 6, 11, 15, 1, 25, 0], 70],
    ["hk-tart", "Egg tart", "🥧", "solid", 70, [20, 4, 12, 10, 0.3, 30, 0], 55], ["hk-milktea", "HK milk tea", "🫖", "drink", 250, [22, 3, 5, 20, 0, 215, 60], 45],
    ["hk-boba", "Bubble tea", "🧋", "drink", 500, [70, 2, 7, 40, 0, 410, 40], 65]
  ].map(([id, name, ic, kind, g, [carb, prot, fat, sugar, fibre, water, caf], gi]) => [id, name, ic, kind, [sugar, carb - sugar, fibre, prot, fat, water, caf].map(v => Math.round(v / g * 1000) / 10), gi, false, g])
].reduce((o, [id, name, ic, kind, v, gi, acidic, portion]) => {
  const [sugarsG, starchG, fibreG, proteinG, fatG, waterG, caffeineMg] = v;
  o[id] = { id, name, ic, kind, per100: { sugarsG, starchG, fibreG, proteinG, fatG, waterG, caffeineMg }, gi, acidic, defaultPortionG: portion };
  return o;
}, {});

const bpClamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const bpInRange = (x, lo, hi) => x >= lo && x <= hi ? 1 : x < lo ? bpClamp(1 - (lo - x) / 25) : bpClamp(1 - (x - hi) / 60);
const bpMod = m => ((m % 1440) + 1440) % 1440;
const bpHHMM = m => `${String(Math.floor(bpMod(m) / 60)).padStart(2, "0")}:${String(Math.round(bpMod(m) % 60)).padStart(2, "0")}`;
const bpDay = m => Math.floor(m / 1440) + 1;
/* Seeded PRNG (mulberry32): only the question builder uses it, never the body */
function bpRng(seed) {
  let a = seed >>> 0;
  const r = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  r.int = n => Math.floor(r() * n); r.pick = arr => arr[r.int(arr.length)];
  r.shuffle = arr => { const b = arr.slice(); for (let i = b.length - 1; i > 0; i--) { const j = r.int(i + 1); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  return r;
}
const bpHash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

/* ---------- Process C, thresholds and selectors (§A5, §A6) ---------- */
function bpC(p, minute) {
  const phase = bpMod(minute) - p.sleep.chronotypeOffsetMin - p.sleep.cPhaseDelayMin;
  return Math.cos(2 * Math.PI * (phase - BPK.C_PEAK_MINUTE) / 1440);   // peak 16:00, trough 04:00
}
const bpH = (p, m = p.epochMin) => BPK.H_MEAN + BPK.C_AMPLITUDE * bpC(p, m);
const bpL = (p, m = p.epochMin) => BPK.L_MEAN + BPK.C_AMPLITUDE * bpC(p, m);
const bpSeff = p => p.sleep.S - 0.03 * p.sleep.caffeineMg / 100;   // caffeine masks pressure, it does not remove it
const bpGap = p => bpSeff(p) - (bpH(p) - BPK.GATE_OFFSET);
function bpSatiety(p) { return 0.6 * bpClamp(p.fuel.gutMassG / BPK.SATIETY_MASS_REF_G) + 0.4 * Math.exp(-p.fuel.minutesSinceMeal / BPK.SATIETY_TIME_TAU_MIN); }
function bpHunger(p) { return bpClamp(1 - bpSatiety(p) + (p.fuel.plasmaGlucoseMgDl < 75 ? BPK.HUNGER_LOW_GLUCOSE_BONUS : 0)); }
const bpHyd = p => 1 - bpClamp(p.water.deficitMl / 1200);
function bpEnergy(p) { return bpClamp(0.5 * bpInRange(p.fuel.plasmaGlucoseMgDl, 75, 140) + 0.3 * (1 - p.sleep.S) + 0.2 * bpHyd(p)); }
function bpFocusParts(p) {
  return { sleep: 0.4 * (1 - bpClamp(bpSeff(p))), glucose: 0.3 * bpInRange(p.fuel.plasmaGlucoseMgDl, 75, 140), water: 0.2 * bpHyd(p), caffeine: 0.1 * bpClamp(p.sleep.caffeineMg / 100) };
}
function bpFocus(p) { const f = bpFocusParts(p); return bpClamp(f.sleep + f.glucose + f.water + f.caffeine); }
/* Cartoon heart and breathing rates for the living pal (selectors only: nothing in the body reads them back).
   Resting teen values; exercise raises both with effort; a water deficit makes the heart beat a little faster
   because blood volume falls; caffeine adds a few beats. */
function bpHeartRate(p) {
  if (p.sleep.asleep) return p.sleep.stage === "REM" ? 66 : p.sleep.stage === "SWS" ? 56 : 60;
  return Math.round(72 + [0, 28, 55, 85][p.activity.intensity] + 4 * bpClamp(p.water.deficitMl / 1000, 0, 2) + 0.04 * p.sleep.caffeineMg);
}
function bpBreathRate(p) {
  if (p.sleep.asleep) return p.sleep.stage === "REM" ? 15 : 12;
  return 15 + [0, 7, 15, 25][p.activity.intensity];
}
/* Living pal: very high sleep pressure after the gate opens and nothing else going on, so it dozes off by itself */
const bpWantsDoze = p => !p.sleep.asleep && !p.sleep.inBed && !p.activity.intensity && bpGap(p) >= 0.12;
const bpThirstMl = p => BPK.THIRST_FRACTION_MASS * p.massKg * 1000;
const bpSleepDebt = p => bpClamp((p.sleep.sleepNeedMin - p.sleep.lastSleptMin) / p.sleep.sleepNeedMin);
function bpStageAt(k) {   // k = minutes since sleep onset → [stage, cycle]
  const n = Math.floor(k / BPK.CYCLE_MIN), r = k % BPK.CYCLE_MIN;
  const sws = Math.max(0, BPK.SWS_BASE_MIN - BPK.SWS_DECLINE_PER_CYCLE * n), rem = Math.min(BPK.REM_CAP_MIN, BPK.REM_BASE_MIN + BPK.REM_GROWTH_PER_CYCLE * n);
  const n2 = BPK.CYCLE_MIN - 5 - sws - rem;
  return [r < 5 ? "N1" : r < 5 + n2 ? "N2" : r < 5 + n2 + sws ? "SWS" : "REM", n];
}

/* ---------- World ---------- */
const bpClone = o => JSON.parse(JSON.stringify(o));
function bpNewPal(epochMin, opts = {}) {
  if (opts.snap) return bpClone(opts.snap.pal);
  return {
    epochMin, massKg: opts.massKg || BPK.MASS_DEFAULT_KG,
    activity: { intensity: 0, untilEpochMin: null, startEpochMin: null, sweatThisBoutMl: 0, glucoseAtStart: null, recentExerciseUntilEpochMin: null },
    fuel: { plasmaGlucoseMgDl: 90, insulinPlasma: 1, insulinAction: 1, gutCarbG: 0, gutMassG: 0, gutEmptyHalfLifeMin: BPK.EMPTY_HL_DRINK_MIN, gutAbsorbRate: BPK.K_ABS_MAX * 0.5,
      insulinSensitivity: 1, glycogenLiverG: opts.fasted ? 60 : 100, stomachCarbG: 0, minutesSinceMeal: opts.fasted ? 720 : 0, exerciseUptake: 1 },
    water: { deficitMl: 0, sweatRateMlPerMin: 0, intakeTodayMl: 0 },
    sleep: { S: 0.17, chronotypeOffsetMin: opts.chronotypeOffsetMin || 0, cPhaseDelayMin: 0, asleep: false, inBed: false, sleepOnsetEpochMin: null, alarmEpochMin: null,
      stage: "wake", cycleIndex: 0, tonight: null, caffeineMg: 0, eveningLight: false, lastSleptMin: BPK.SLEEP_NEED_TEEN_MIN, sleepNeedMin: BPK.SLEEP_NEED_TEEN_MIN,
      lastReport: null, groggyUntil: null, wokeAt: epochMin },
    teeth: { plaquePh: BPK.PH_RESTING, acidLoad: 0, fluorideShield: 0, salivaFlow: 1, deminMinutesToday: 0, erosionMinutesToday: 0, lastBrushEpochMin: null, expSugarG: 0, expAcid: false },
    flags: { hungry: false, thirsty: false, sleepy: false, groggy: false }
  };
}
const BP_HIST = ["g", "x", "ph", "S", "H", "L", "def", "caf", "st", "acid"];
function bpCreateWorld(opts = {}) {
  const sn = opts.snap, start = sn ? sn.pal.epochMin : opts.start != null ? opts.start : 420;
  const w = { pal: bpNewPal(start, opts), t0: start, scheduled: [], cards: {}, fired: [], events: [], meals: [], nights: [], bouts: [], drinks: [], attempts: [],
    hist: {}, seed: opts.seed || 1, opts, foods: BP_FOODS };
  BP_HIST.forEach(k => w.hist[k] = []);
  if (sn) {   // a rebased save: carry what the next minutes need (pending sips, card edges, the last meals, a short history tail)
    Object.assign(w, bpClone({ scheduled: sn.scheduled, cards: sn.cards, meals: sn.meals, attempts: sn.attempts }));
    BP_HIST.forEach(k => w.hist[k] = (sn.hist[k] || []).slice());
    w.t0 = start - (w.hist.g.length ? w.hist.g.length - 1 : 0);
  }
  return w;
}
/* A living pal never stops, so its log can't grow for ever: replay to `keep` minutes ago, snapshot that moment,
   and keep only the later actions. Replaying the new save gives the same pal as replaying the old one. */
function bpRebase(save, now, keep = 2880) {
  const cut = now - keep, w = bpReplay(save, cut), tail = {};
  BP_HIST.forEach(k => tail[k] = w.hist[k].slice(-90).map(v => Math.round(v * 1000) / 1000));   // 90 min covers every card's look-back
  const snap = bpClone({ pal: w.pal, scheduled: w.scheduled, cards: w.cards, meals: w.meals.slice(-3), attempts: w.attempts.slice(-1), hist: tail });
  return { opts: Object.assign({}, save.opts, { snap }), log: (save.log || []).filter(e => e.t > cut) };
}
const bpHistAt = (w, k, epoch) => { const i = epoch - w.t0; return i >= 0 && i < w.hist[k].length ? w.hist[k][i] : null; };

/* ---------- One minute (§A1 order: time → sleep → fuel → water → teeth → flags) ---------- */
function bpTick(p) {
  const K = BPK, f = p.fuel, sl = p.sleep, wa = p.water, te = p.teeth, a = p.activity;
  p.epochMin += 1;
  const now = p.epochMin;
  // sleep: Process S
  if (sl.asleep) sl.S -= sl.S * (1 - Math.exp(-1 / (K.TAU_S_DECAY_H * 60)));
  else sl.S += (1 - sl.S) * (1 - Math.exp(-1 / (K.TAU_S_RISE_H * 60)));
  sl.caffeineMg -= sl.caffeineMg * Math.LN2 / (K.CAFFEINE_HL_H * 60);
  if (sl.asleep) {
    const [stage, n] = bpStageAt(now - sl.sleepOnsetEpochMin);
    sl.stage = stage; sl.cycleIndex = n;
    if (stage === "REM") sl.tonight.remMin++; else if (stage === "SWS") sl.tonight.swsMin++;
  }
  // fuel (§A3)
  const recent = a.recentExerciseUntilEpochMin != null && now < a.recentExerciseUntilEpochMin ? 1 : 0;
  f.insulinSensitivity = bpClamp(1 - K.SENS_SLEEP_DEBT_PENALTY * bpSleepDebt(p) + K.SENS_EXERCISE_BONUS * recent, 0.7, 1.3);
  const kE = Math.LN2 / f.gutEmptyHalfLifeMin, em = f.stomachCarbG * kE;
  f.stomachCarbG -= em; f.gutCarbG += em; f.gutMassG -= f.gutMassG * kE;
  const absG = f.gutCarbG * f.gutAbsorbRate; f.gutCarbG -= absG;
  const absMg = absG * 1000, fp = K.FIRST_PASS_MAX * absMg * bpClamp(f.insulinAction / 3);
  f.glycogenLiverG = Math.min(K.GLYCOGEN_LIVER_CAP_G, f.glycogenLiverG + fp / 1000);
  const G = f.plasmaGlucoseMgDl, X = f.insulinAction, Vg = K.VG_DL_PER_KG * p.massKg, inten = a.intensity;
  const egp = K.EGP_BASAL_MG_KG_MIN * p.massKg * Math.max(0, 1 - K.EGP_SUPPRESS_PER_X * (X - 1)) * Math.min(3, 1 + K.COUNTERREG_GAIN * Math.max(0, 85 - G)) * (1 + K.EXERCISE_EGP_PER_INT * inten);
  const fGly = K.GLY_SHARE_MAX * Math.pow(Math.max(0, f.glycogenLiverG) / 100, K.GLY_SHARE_EXP);   // the rest is gluconeogenesis, always available
  f.glycogenLiverG = Math.max(0, f.glycogenLiverG - egp * fGly / 1000);
  const uii = K.U_II_MG_KG_MIN * p.massKg * f.exerciseUptake, uid = K.U_ID_BASAL_MG_MIN * X * f.insulinSensitivity * (G / 90), usg = K.GLUCOSE_EFFECTIVENESS * Math.max(0, G - 90) * Vg;
  f.plasmaGlucoseMgDl = G + (absMg - fp + egp - uii - uid - usg) / Vg;
  const It = 1 + K.INSULIN_GAIN_PER_MGDL * Math.max(0, G - 90);
  f.insulinPlasma += (It - f.insulinPlasma) * Math.LN2 / K.INSULIN_HL_MIN;
  f.insulinAction += (f.insulinPlasma - X) / K.X_TAU_MIN;
  f.minutesSinceMeal += 1;
  // water (§A4)
  wa.deficitMl += (sl.asleep ? K.WATER_LOSS_ASLEEP_ML_H : K.WATER_LOSS_AWAKE_ML_H) / 60 * p.massKg / 60 + wa.sweatRateMlPerMin;
  if (inten) a.sweatThisBoutMl += wa.sweatRateMlPerMin;
  // teeth (§A7); exposures collected during the minute count once
  if (te.expSugarG > 0.5 || te.expAcid) {
    te.acidLoad = Math.min(1, te.acidLoad + K.ACID_PER_EXPOSURE * bpClamp(te.expSugarG / K.ACID_SUGAR_REF_G, 0.3, 1));
    if (te.expAcid) te.erosionMinutesToday += 1;
  }
  te.expSugarG = 0; te.expAcid = false;
  te.acidLoad -= te.acidLoad * Math.LN2 / (K.ACID_BUFFER_HL_AWAKE_MIN / te.salivaFlow);
  const buffer = K.SALIVA_BUFFER_ASLEEP + (1 - K.SALIVA_BUFFER_ASLEEP) * te.salivaFlow;   // less saliva, less bicarbonate buffering
  const target = K.PH_RESTING - K.PH_DROP_MAX * Math.min(1, te.acidLoad * (1 - K.FLUORIDE_SHIELD_EFFECT * te.fluorideShield) / buffer);
  te.plaquePh += (target - te.plaquePh) * K.PH_APPROACH_RATE;
  if (te.plaquePh < K.CRITICAL_PH) te.deminMinutesToday += 1;
  te.fluorideShield -= te.fluorideShield * Math.LN2 / K.FLUORIDE_HL_MIN;
  // flags
  p.flags.thirsty = wa.deficitMl >= bpThirstMl(p);
  p.flags.hungry = !sl.asleep && bpHunger(p) > K.HUNGRY_THRESHOLD;
  p.flags.sleepy = !sl.asleep && bpGap(p) >= 0;
  p.flags.groggy = sl.groggyUntil != null && now < sl.groggyUntil;
  return p;
}

/* ---------- Actions (all applied at the current minute) ---------- */
function bpBolus(items) {   // items: [[foodId, grams]] eaten together
  const b = { carb: 0, sugar: 0, fibre: 0, prot: 0, fat: 0, water: 0, caf: 0, mass: 0, giC: 0, acidic: false, drink: true };
  items.forEach(([id, g]) => {
    const fd = BP_FOODS[id], q = g / 100, v = fd.per100, c = (v.sugarsG + v.starchG) * q;
    b.carb += c; b.sugar += v.sugarsG * q; b.fibre += v.fibreG * q; b.prot += v.proteinG * q; b.fat += v.fatG * q; b.water += v.waterG * q; b.caf += v.caffeineMg * q;
    b.mass += g; b.giC += fd.gi * c; b.acidic = b.acidic || fd.acidic; if (fd.kind === "solid") b.drink = false;
  });
  b.gi = b.carb > 0 ? b.giC / b.carb : 0;
  b.solidMass = items.reduce((s, [id, g]) => s + (BP_FOODS[id].kind === "solid" ? g : 0), 0);
  b.solidFibre = items.reduce((s, [id, g]) => s + (BP_FOODS[id].kind === "solid" ? BP_FOODS[id].per100.fibreG * g / 100 : 0), 0);
  return b;
}
function bpIngest(w, b, isSip) {
  const p = w.pal, f = p.fuel, K = BPK;
  const nutr = b.carb + b.prot + b.fat;
  if (nutr >= 0.5 || !b.drink) {   // plain water and black coffee pass straight through: they don't change gut kinetics or satiety
    const hl = b.drink ? K.EMPTY_HL_DRINK_MIN : bpClamp(K.EMPTY_HL_SOLID_BASE_MIN + K.EMPTY_HL_FAT_PER_G * b.fat + K.EMPTY_HL_PROTEIN_PER_G * b.prot + K.EMPTY_HL_FIBRE_PER_G * b.fibre, K.EMPTY_HL_SOLID_BASE_MIN, K.EMPTY_HL_CAP_MIN);
    f.gutEmptyHalfLifeMin = (f.gutEmptyHalfLifeMin * f.gutMassG + hl * b.mass) / (f.gutMassG + b.mass);
    if (b.carb > 0) {
      const rate = K.K_ABS_MAX * (b.gi / 100) / (1 + K.FIBRE_ABS_FACTOR * b.fibre), old = f.gutCarbG + f.stomachCarbG;
      f.gutAbsorbRate = (f.gutAbsorbRate * old + rate * b.carb) / (old + b.carb);
    }
    f.stomachCarbG += b.carb; f.gutMassG += b.mass;
    if (nutr >= 2) f.minutesSinceMeal = 0;
  }
  p.water.deficitMl = Math.max(K.WATER_SURPLUS_FLOOR_ML, p.water.deficitMl - b.water);
  p.water.intakeTodayMl += b.water;
  p.sleep.caffeineMg += b.caf;
  if (b.sugar > 0 || b.acidic) { p.teeth.expSugarG += b.sugar; p.teeth.expAcid = p.teeth.expAcid || b.acidic; }
}
const bpBusy = w => w.pal.sleep.asleep || w.pal.sleep.inBed;
function bpEat(w, items) {
  if (bpBusy(w)) return false;
  if (typeof items === "string") items = [[items, BP_FOODS[items].defaultPortionG]];
  const b = bpBolus(items);
  bpIngest(w, b);
  if (b.carb >= 10) w.meals.push({ t: w.pal.epochMin, carb: b.carb, fibre: b.fibre, fibreDensity: b.solidMass ? b.solidFibre / b.solidMass * 100 : 0, hl: w.pal.fuel.gutEmptyHalfLifeMin, items, g0: w.pal.fuel.plasmaGlucoseMgDl, checked: false });
  bpLog(w, "eat", { items });
  return true;
}
function bpDrink(w, id, ml, over = 5) {
  if (bpBusy(w)) return false;
  const n = Math.max(1, Math.round(ml / 30)), each = ml / n, now = w.pal.epochMin;
  for (let i = 0; i < n; i++) w.scheduled.push({ t: now + Math.floor(i * over / n), kind: "sip", id, ml: each });
  const fd = BP_FOODS[id], carb = (fd.per100.sugarsG + fd.per100.starchG) * ml / 100;
  w.drinks.push({ t: now, id, ml, over, end: now + over, sugar: fd.per100.sugarsG * ml / 100, caf: fd.per100.caffeineMg * ml / 100 });
  if (carb >= 10) w.meals.push({ t: now, carb, fibre: 0, fibreDensity: 0, hl: BPK.EMPTY_HL_DRINK_MIN, items: [[id, ml]], g0: w.pal.fuel.plasmaGlucoseMgDl, checked: false });
  bpLog(w, "drink", { id, ml, over });
  bpRunDue(w);
  return true;
}
function bpExercise(w, intensity, minutes) {
  if (bpBusy(w) || w.pal.activity.intensity) return false;
  const p = w.pal, a = p.activity;
  a.intensity = intensity; a.untilEpochMin = p.epochMin + minutes; a.startEpochMin = p.epochMin; a.sweatThisBoutMl = 0; a.glucoseAtStart = p.fuel.plasmaGlucoseMgDl;
  p.fuel.exerciseUptake = 1 + BPK.EXERCISE_UPTAKE_PER_INT * intensity; p.water.sweatRateMlPerMin = BPK.SWEAT_ML_MIN[intensity];
  w.scheduled.push({ t: a.untilEpochMin, kind: "exEnd" });
  bpLog(w, "exercise", { intensity, minutes });
  return true;
}
function bpBrush(w) {
  if (bpBusy(w)) return false;
  const te = w.pal.teeth;
  te.plaquePh = BPK.PH_RESTING; te.acidLoad = 0; te.fluorideShield = 1; te.lastBrushEpochMin = w.pal.epochMin;
  bpLog(w, "brush", {});
  return true;
}
function bpSetLight(w, on) { w.pal.sleep.eveningLight = !!on; bpLog(w, "light", { on: !!on }); return true; }
function bpLatency(p, light, caf) {
  const K = BPK, gap = bpGap(p);
  let lat = gap >= 0.10 ? K.LATENCY_MIN_MIN : gap >= 0 ? K.LATENCY_MIN_MIN + K.LATENCY_SLOPE_NEAR * (0.10 - gap) : Math.min(K.LATENCY_CAP_MIN, 45 + K.LATENCY_SLOPE_FAR * (-gap));
  return { gap, lat: Math.round(lat + (light ? K.LIGHT_LATENCY_MIN : 0) + K.CAFFEINE_LATENCY_PER_MG * caf), base: Math.round(lat) };
}
function bpTrySleep(w, alarmEpochMin = null) {
  const p = w.pal, sl = p.sleep;
  if (bpBusy(w) || p.activity.intensity) return false;
  const caf = sl.caffeineMg, L = bpLatency(p, sl.eveningLight, caf), now = p.epochMin;
  sl.inBed = true; sl.alarmEpochMin = alarmEpochMin;
  const at = { t: now, latency: L.lat, base: L.base, gap: L.gap, caffeineMg: caf, light: sl.eveningLight, alarm: alarmEpochMin, lightLatency: sl.eveningLight ? BPK.LIGHT_LATENCY_MIN : 0, cafLatency: Math.round(BPK.CAFFEINE_LATENCY_PER_MG * caf), S: sl.S };
  w.attempts.push(at);
  w.scheduled.push({ t: now + L.lat, kind: "onset" });
  bpLog(w, "sleep", { alarm: alarmEpochMin });
  if (caf >= 40) bpFire(w, "caffeine-still-here", { mg: Math.round(caf), min: at.cafLatency });
  if (L.lat > 45 && L.gap < 0) bpFire(w, "not-sleepy-yet", { lat: L.lat });
  return true;
}
function bpOnset(w) {
  const p = w.pal, sl = p.sleep, te = p.teeth, at = w.attempts[w.attempts.length - 1];
  sl.inBed = false; sl.asleep = true; sl.sleepOnsetEpochMin = p.epochMin; sl.stage = "N1"; sl.cycleIndex = 0;
  sl.tonight = { remMin: 0, swsMin: 0, latencyMin: at ? at.latency : 0, caffeineAtAttemptMg: at ? at.caffeineMg : sl.caffeineMg, awakeningsMin: 0, sOnset: sl.S, caffeineAtOnsetMg: sl.caffeineMg, onsetMinuteOfDay: bpMod(p.epochMin), light: sl.eveningLight, acidAtOnset: te.acidLoad, phAtOnset: te.plaquePh, deminBefore: te.deminMinutesToday };
  te.salivaFlow = BPK.SALIVA_FLOW_ASLEEP;
  if (te.acidLoad > 0.3 && (te.lastBrushEpochMin == null || p.epochMin - te.lastBrushEpochMin > 60)) bpFire(w, "brush-before-bed", { ph: p.teeth.plaquePh });
}
function bpWake(w, how = "forced") {
  const p = w.pal, sl = p.sleep, te = p.teeth, K = BPK, now = p.epochMin;
  if (sl.inBed && !sl.asleep) {   // got up before falling asleep
    sl.inBed = false; sl.alarmEpochMin = null; w.scheduled = w.scheduled.filter(s => s.kind !== "onset");
    if (how === "forced") bpLog(w, "wake", {});
    return true;
  }
  if (!sl.asleep) return false;
  const slept = now - sl.sleepOnsetEpochMin, cut = sl.stage === "SWS" || sl.stage === "REM";
  const tn = sl.tonight, sWake = sl.S;
  if (cut) sl.groggyUntil = now + K.INERTIA_MIN;
  sl.asleep = false; sl.stage = "wake"; sl.lastSleptMin = slept; sl.wokeAt = now; te.salivaFlow = 1;
  const night = { onset: sl.sleepOnsetEpochMin, wake: now, how, slept, remMin: tn.remMin, swsMin: tn.swsMin, latencyMin: tn.latencyMin, caffeineAtOnsetMg: tn.caffeineAtOnsetMg, caffeineAtAttemptMg: tn.caffeineAtAttemptMg,
    light: tn.light, sOnset: tn.sOnset, sWake, cut: how !== "natural" && cut, deminNight: te.deminMinutesToday - tn.deminBefore, acidAtOnset: tn.acidAtOnset, delayBefore: sl.cPhaseDelayMin, onsetMinuteOfDay: tn.onsetMinuteOfDay };
  // evening light moves the clock at the next wake; light-free evenings let it drift back
  sl.cPhaseDelayMin = tn.light ? Math.min(K.LIGHT_DELAY_CAP_MIN, sl.cPhaseDelayMin + K.LIGHT_DELAY_PER_NIGHT_MIN) : Math.max(0, sl.cPhaseDelayMin - K.LIGHT_DELAY_RECOVERY_MIN_DAY);
  night.delayAfter = sl.cPhaseDelayMin;
  sl.lastReport = night.report = bpSleepReport(p, night);
  w.nights.push(night);
  sl.eveningLight = false; sl.alarmEpochMin = null; sl.tonight = null;
  te.deminMinutesToday = 0; te.erosionMinutesToday = 0; p.water.intakeTodayMl = 0;
  if (how === "forced") bpLog(w, "wake", {});
  if (how === "alarm" && slept < 0.75 * sl.sleepNeedMin) bpFire(w, "short-night", { min: slept, rem: tn.remMin });
  return true;
}
function bpSleepReport(p, n) {
  const K = BPK, idealOnset = bpMod(K.IDEAL_ONSET_MINUTE + p.sleep.chronotypeOffsetMin + n.delayBefore);
  let dOn = Math.abs(n.onsetMinuteOfDay - idealOnset); dOn = Math.min(dOn, 1440 - dOn);
  const c = {
    duration: 0.35 * bpClamp(n.slept / p.sleep.sleepNeedMin), pressureCleared: 0.25 * bpClamp((n.sOnset - n.sWake) / n.sOnset),
    latency: 0.15 * bpClamp(1 - (n.latencyMin - 10) / 60), timing: 0.10 * bpClamp(1 - dOn / 180),
    caffeine: 0.10 * (1 - bpClamp(n.caffeineAtOnsetMg / 100)), interruption: 0.05 * (n.cut ? 0 : 1)
  };
  const score = Object.values(c).reduce((s, v) => s + v, 0), lines = [];
  lines.push(`Your pal slept ${n.slept} minutes, against a teen need of about ${p.sleep.sleepNeedMin} minutes.`);
  if (n.caffeineAtAttemptMg >= 15) lines.push(`${Math.round(n.caffeineAtAttemptMg)} mg of caffeine was still circulating at lights out. In this model that added about ${Math.round(K.CAFFEINE_LATENCY_PER_MG * n.caffeineAtAttemptMg)} minutes to falling asleep.`);
  if (n.latencyMin > 30) lines.push(`Falling asleep took ${n.latencyMin} minutes because the body clock had not fully opened the sleep gate.`);
  if (n.cut) lines.push(`The alarm cut into ${n.remMin && n.slept % 90 > 60 ? "REM" : "deep"} sleep, so your pal wakes groggy for about ${K.INERTIA_MIN} minutes.`);
  if (n.light) lines.push(`Screen light in the evening moved the body clock to ${n.delayAfter} minutes later than usual.`);
  if (lines.length < 4 && n.slept < 0.75 * p.sleep.sleepNeedMin) lines.push(`A short night trims mostly REM sleep: only ${n.remMin} minutes of REM tonight.`);
  return { score: Math.round(score * 100) / 100, components: c, explanationLines: lines.slice(0, 4) };
}
function bpLog(w, a, args) { w.events.push(Object.assign({ t: w.pal.epochMin, a }, args)); }

/* ---------- Scheduler + advance ---------- */
function bpRunDue(w) {
  const now = w.pal.epochMin;
  if (!w.scheduled.some(s => s.t <= now)) return;
  const due = w.scheduled.filter(s => s.t <= now); w.scheduled = w.scheduled.filter(s => s.t > now);
  due.forEach(s => {
    if (s.kind === "sip") bpIngest(w, bpBolus([[s.id, s.ml]]), true);
    else if (s.kind === "onset") bpOnset(w);
    else if (s.kind === "exEnd") {
      const a = w.pal.activity, fell = a.glucoseAtStart - w.pal.fuel.plasmaGlucoseMgDl;
      w.bouts.push({ t: a.startEpochMin, end: now, intensity: a.intensity, sweatMl: a.sweatThisBoutMl, g0: a.glucoseAtStart, g1: w.pal.fuel.plasmaGlucoseMgDl });
      if (fell >= 10) bpFire(w, "muscles-pull", { min: now - a.startEpochMin, a: a.glucoseAtStart, b: w.pal.fuel.plasmaGlucoseMgDl });
      a.intensity = 0; a.untilEpochMin = null; a.recentExerciseUntilEpochMin = now + BPK.RECENT_EXERCISE_H * 60;
      w.pal.fuel.exerciseUptake = 1; w.pal.water.sweatRateMlPerMin = 0;
    }
  });
}
function bpRecord(w) {
  const p = w.pal, h = w.hist;
  h.g.push(p.fuel.plasmaGlucoseMgDl); h.x.push(p.fuel.insulinAction); h.ph.push(p.teeth.plaquePh); h.S.push(p.sleep.S); h.H.push(bpH(p)); h.L.push(bpL(p));
  h.def.push(p.water.deficitMl); h.caf.push(p.sleep.caffeineMg); h.st.push(p.sleep.asleep ? ["N1", "N2", "SWS", "REM"].indexOf(p.sleep.stage) + 1 : p.sleep.inBed ? 0.5 : 0); h.acid.push(p.teeth.acidLoad);
}
function bpAdvance(w, minutes) {
  if (!w.hist.g.length) bpRecord(w);
  for (let i = 0; i < minutes; i++) {
    bpTick(w.pal);
    const p = w.pal, sl = p.sleep;
    bpRunDue(w);
    if (sl.asleep && p.epochMin - sl.sleepOnsetEpochMin >= 1) {
      if (sl.alarmEpochMin != null && p.epochMin >= sl.alarmEpochMin) bpWake(w, "alarm");
      else if (p.epochMin - sl.sleepOnsetEpochMin >= BPK.NATURAL_WAKE_MIN_H * 60 && sl.S <= bpL(p)) bpWake(w, "natural");
    }
    bpRecord(w);
    bpCards(w);
  }
  return w;
}
/* Replay an action log (the save format and the oracle's re-run) */
function bpApply(w, e) {
  if (e.a === "eat") return bpEat(w, e.items);
  if (e.a === "drink") return bpDrink(w, e.id, e.ml, e.over);
  if (e.a === "exercise") return bpExercise(w, e.intensity, e.minutes);
  if (e.a === "brush") return bpBrush(w);
  if (e.a === "sleep") return bpTrySleep(w, e.alarm);
  if (e.a === "wake") return bpWake(w);
  if (e.a === "light") return bpSetLight(w, e.on);
  return false;
}
function bpReplay(save, until) {
  const w = bpCreateWorld(save.opts || {});
  const log = (save.log || []).slice().sort((a, b) => a.t - b.t);
  log.forEach(e => {
    if (e.t > until) return;
    if (e.t > w.pal.epochMin) bpAdvance(w, e.t - w.pal.epochMin);
    bpApply(w, e);
  });
  if (until > w.pal.epochMin) bpAdvance(w, until - w.pal.epochMin);
  return w;
}

/* ---------- Why cards (§A8): headline, mechanism with a live number, learn more ---------- */
const BP_CARDS = {
  "glucose-rising": { n: 1, lo: "F1", cd: 6, h: "Glucose on the way up", ic: "📈",
    m: d => `Glucose reached ${d.g} mg/dL ${d.min} minutes after eating, as the gut absorbed the sugar.`,
    more: "Starch and sugar are broken down to glucose in the gut. Glucose crosses the gut wall into the blood within about 15 minutes. So the trace starts climbing soon after the first mouthful.\nA drink with free sugar arrives fastest, because liquid leaves the stomach quickly. Try: compare the trace after a drink and after a meal." },
  "slow-burn": { n: 2, lo: "F2", cd: 12, h: "A slower kind of fuel", ic: "🥣",
    m: d => `This meal peaked at only ${d.g} mg/dL because fibre slowed how fast the gut absorbed it.`,
    more: "Fibre, fat and protein keep food in the stomach longer and slow absorption in the gut. The same amount of carbohydrate then arrives over a longer time.\nIn this model the peak is lower and later, and the energy bar stays steadier. Try: give the same carbohydrate as a sweet drink and compare the peaks." },
  "insulin-at-work": { n: 3, lo: "F3", cd: 6, h: "Insulin is moving it", ic: "🔑",
    m: d => `Insulin action is ${d.x} times its resting level, so muscle and liver take glucose from the blood.`,
    more: "The pancreas releases insulin when glucose rises. Insulin signals muscle, fat and liver cells to take up glucose, and the liver stores some as glycogen.\nNotice that the insulin trace lags behind glucose by about 20 minutes. That lag is why glucose keeps falling for a while after the peak." },
  "stored-fuel": { n: 4, lo: "F4", cd: 24, h: "Running on stored fuel", ic: "🔋",
    m: d => `It is ${d.h} hours since a meal, yet the liver keeps glucose at ${d.g} mg/dL from its glycogen store.`,
    more: "Between meals and overnight, the liver breaks down glycogen and releases glucose. It also makes new glucose from other molecules.\nSo blood glucose stays steady even after a long gap. The liver store shrinks, though: notice the glycogen number in the body panel. Try: give breakfast and watch the store refill." },
  "holding-the-floor": { n: 5, lo: "F5", cd: 12, h: "Why it doesn't just keep falling", ic: "🛟",
    m: d => `Glucose dipped to ${d.g} mg/dL, so glucagon told the liver to release more glucose.`,
    more: "When glucose drops, the pancreas releases glucagon and the adrenal glands release adrenaline. Both push the liver to release more glucose.\nThe pal's cartoon version of this is one simple rule: the lower glucose goes, the harder the liver works. That is why the trace flattens out instead of falling further." },
  "muscles-pull": { n: 6, lo: "F6", cd: 12, h: "Muscles take their own", ic: "💪",
    m: d => `During the ${d.min}-minute workout, muscles pulled glucose from ${d.a} down to ${d.b} mg/dL.`,
    more: "Working muscle takes up glucose without needing extra insulin. Contraction itself opens the way in.\nThe liver speeds up too, so glucose falls a little instead of crashing. For about 12 hours afterwards muscle stays more sensitive to insulin. Try: compare a meal before and after a run." },
  "the-dip": { n: 7, lo: "F7", cd: 12, h: "The dip after the rush", ic: "🎢",
    m: d => `Glucose fell from ${d.peak} to ${d.g} mg/dL as insulin kept working after the sugar ran out.`,
    more: "A fast, high peak brings a big insulin response. Insulin action lags behind, so it is still high when the sugar has already been absorbed.\nGlucose then dips below where it started for a while. Notice the energy bar: it tracks glucose being in range, not glucose being high." },
  "water-leaves": { n: 8, lo: "W1", cd: 12, h: "Thirst arrives late", ic: "🌵",
    m: d => `Your pal is already ${d.ml} mL short of water, and only now does the brain switch on thirst.`,
    more: "Water leaves all the time, through breath, skin and urine, even at rest. The brain only switches on thirst after about 1 % of body mass has gone.\nSo thirst is a late signal. Food also carries water, and so do drinks with caffeine. Try: give small drinks through the day and watch the deficit line." },
  "sweat-adds-up": { n: 9, lo: "W4", cd: 12, h: "Sweat adds up", ic: "💦",
    m: d => `This workout has already used ${d.ml} mL of water as sweat from the skin.`,
    more: "Sweat cools the body as it evaporates. Harder exercise and longer exercise both mean more sweat.\nIn this model a medium workout loses about 15 mL every minute. Notice how fast the deficit line climbs during exercise. Try: give a drink after the workout and watch the line come back down." },
  "caffeine-still-here": { n: 10, lo: "S6", cd: 24, h: "Caffeine is still here", ic: "☕",
    m: d => `${d.mg} mg of caffeine is still in the blood at lights out, adding about ${d.min} minutes to falling asleep.`,
    more: "The liver clears caffeine slowly: about half is gone every 5 hours. A coffee at 20:00 is still about two thirds there at 23:00.\nCaffeine blocks the signal of sleep pressure, so the pal feels less sleepy. The pressure itself is still there, and it comes back as caffeine clears." },
  "not-sleepy-yet": { n: 11, lo: "S2", cd: 24, h: "Not sleepy yet", ic: "🕰️",
    m: d => `The body clock has not opened the sleep gate yet, so falling asleep takes about ${d.lat} minutes.`,
    more: "Two things decide when sleep comes. Sleep pressure builds the whole day, and the body clock sets when the sleep gate opens.\nIn the early evening the clock holds the gate shut, even if pressure is quite high. In this model that zone ends around 22:00 for a typical teen. Try: go to bed a little later and compare." },
  "short-night": { n: 12, lo: "S5", cd: 24, h: "Short night, less REM", ic: "⏰",
    m: d => `Your pal slept only ${d.min} minutes, so it got just ${d.rem} minutes of REM sleep.`,
    more: "Deep sleep comes mostly in the first cycles of the night. REM sleep grows in the later cycles.\nSo cutting a night short removes mostly REM, not deep sleep. REM is linked with memory and mood. Try: compare tonight's report with a full night." },
  "screens-moved-clock": { n: 13, lo: "S7", cd: 72, h: "Your clock moved", ic: "📱",
    m: d => `Evening screen light has moved the body clock ${d.d} minutes later than usual.`,
    more: "Bright light in the evening tells the body clock that the day is still going. The clock shifts a little later each night.\nIn this model the sleep gate then opens later too, so falling asleep at the usual time gets harder. Light-free evenings let it drift back by about 20 minutes a day." },
  "sipping": { n: 14, lo: "T2", cd: 12, h: "Sipping keeps the acid going", ic: "🥤",
    m: d => `Plaque pH sat under 5.5 for ${d.n} of the last 60 minutes because each sip restarts the acid.`,
    more: "Plaque bacteria turn sugar into acid within minutes. Saliva then needs about 20 to 40 minutes to bring the pH back up.\nEach new sip starts a fresh drop before recovery is finished. So how often sugar arrives matters more than how much. Try: give the same drink in 5 minutes and compare." },
  "brush-before-bed": { n: 15, lo: "T3", cd: 24, h: "Saliva clocks off at night", ic: "🌙",
    m: d => `Saliva flow drops to about a tenth in sleep, and plaque pH is ${d.ph.toFixed(1)} right now.`,
    more: "Saliva carries bicarbonate, which neutralises the acid that plaque makes. During sleep the flow nearly stops.\nSo acid left in the mouth at lights out stays for hours. Fluoride from toothpaste helps enamel hold on to its minerals. Try: brush just before bed and compare the overnight pH." }
};
function bpFire(w, id, data) {
  const c = w.cards[id] || (w.cards[id] = { last: null, fired: 0, prev: false }), def = BP_CARDS[id], now = w.pal.epochMin;
  if (c.last != null && now - c.last < def.cd * 60) return false;
  c.last = now; c.fired++;
  w.fired.push({ id, t: now, data, mech: def.m(data) });
  return true;
}
/* Edge-triggered state cards: fire when the predicate turns true (and the cooldown allows) */
function bpEdge(w, id, on, data) {
  const c = w.cards[id] || (w.cards[id] = { last: null, fired: 0, prev: false });
  if (on && !c.prev) bpFire(w, id, data());
  c.prev = on;
}
function bpCards(w) {
  const p = w.pal, f = p.fuel, now = p.epochMin, h = w.hist, i = h.g.length - 1, G = f.plasmaGlucoseMgDl;
  const back = (k, m) => h[k][Math.max(0, i - m)];
  // 1: crossing 140 upwards within 60 min of eating (spec 120; raised so a can of cola, ~133, stays quiet as the fixtures require)
  const lastMeal = w.meals[w.meals.length - 1];
  bpEdge(w, "glucose-rising", G > 140 && lastMeal && now - lastMeal.t <= 60, () => ({ g: Math.round(G), min: now - lastMeal.t }));
  // 2: a fibre-rich meal whose 2-h peak stayed ≤ 120
  w.meals.forEach(m => {
    if (m.checked || now - m.t < 120) return; m.checked = true;
    let pk = 0; for (let k = m.t - w.t0; k <= i; k++) pk = Math.max(pk, h.g[k]);
    m.peak = pk;
    if (m.fibreDensity >= 5 && pk <= 120) bpFire(w, "slow-burn", { g: Math.round(pk) });
  });
  // 3: insulin action high and glucose falling for 10 minutes
  let falling = i >= 10; for (let k = 0; k < 10 && falling; k++) falling = h.g[i - k] < h.g[i - k - 1];
  bpEdge(w, "insulin-at-work", f.insulinAction >= 2.5 && falling && back("g", 30) >= 130, () => ({ x: f.insulinAction.toFixed(1) }));
  // 4: a long gap since food, glucose steady
  bpEdge(w, "stored-fuel", !p.sleep.asleep && !p.sleep.inBed && f.minutesSinceMeal >= 780 && G >= 75 && G <= 95, () => ({ h: Math.round(f.minutesSinceMeal / 60), g: Math.round(G) }));
  // 5: glucose below 75 with counter-regulation for 5 minutes
  let low = i >= 5; for (let k = 0; k < 5 && low; k++) low = h.g[i - k] < 75;
  bpEdge(w, "holding-the-floor", low, () => ({ g: Math.round(G) }));
  // 7: a dip after a high peak
  let pk = 0, pkAt = -1; for (let k = Math.max(0, i - 90); k <= i; k++) if (h.g[k] > pk) { pk = h.g[k]; pkAt = k; }
  bpEdge(w, "the-dip", pk >= 140 && G < 80 && pk - G >= 50, () => ({ peak: Math.round(pk), g: Math.round(G) }));
  // 8, 9: water
  bpEdge(w, "water-leaves", p.flags.thirsty, () => ({ ml: Math.round(p.water.deficitMl) }));
  bpEdge(w, "sweat-adds-up", p.activity.intensity > 0 && p.activity.sweatThisBoutMl >= 300, () => ({ ml: Math.round(p.activity.sweatThisBoutMl) }));
  // 13: clock moved by evening light
  bpEdge(w, "screens-moved-clock", p.sleep.cPhaseDelayMin >= 30, () => ({ d: p.sleep.cPhaseDelayMin }));
  // 14: sipping, pH under 5.5 for ≥ 40 of the last 60 min
  let under = 0; for (let k = Math.max(0, i - 59); k <= i; k++) if (h.ph[k] < BPK.CRITICAL_PH) under++;
  bpEdge(w, "sipping", under >= 40 && !p.sleep.asleep && !p.sleep.inBed, () => ({ n: under }));
}

/* ---------- Touch the living pal (DOM-free so the voice lint can check every line) ----------
   Each body part reads the live state and explains the mechanism behind what is happening right now. */
const BP_ZONES = {
  brain: ["🧠", "Brain and body clock", "sleep"], heart: ["❤️", "Heart and lungs", "fuel"], belly: ["🫃", "Stomach and blood glucose", "fuel"],
  mouth: ["🦷", "Teeth and saliva", "teeth"], hands: ["🖐️", "Skin and water", "water"]
};
function bpPeek(w, zone) {
  const p = w.pal, f = p.fuel, sl = p.sleep, te = p.teeth, wa = p.water, a = p.activity, G = Math.round(f.plasmaGlucoseMgDl);
  const back = bpHistAt(w, "g", p.epochMin - 10), trend = back == null ? 0 : f.plasmaGlucoseMgDl - back;
  const stage = { N1: "light", N2: "light", SWS: "deep", REM: "REM" }[sl.stage];
  let read = "", why = "";
  if (zone === "brain") {
    read = `Sleep pressure ${sl.S.toFixed(2)} · focus ${Math.round(bpFocus(p) * 100)}/100${sl.caffeineMg >= 5 ? ` · caffeine ${Math.round(sl.caffeineMg)} mg` : ""}`;
    const awakeH = Math.max(0, Math.round((p.epochMin - (sl.wokeAt || w.t0)) / 60));
    why = sl.asleep ? (stage === "deep" ? "Deep sleep now. Sleep pressure clears fastest in these early cycles." : stage === "REM" ? "REM sleep now. The eyes dart about and dreams happen here. REM grows in the later cycles." : "Light sleep now. One full cycle of light, deep and REM sleep takes about 90 minutes.")
      : sl.inBed ? "Lying in bed, waiting for the sleep gate. The more pressure, the faster sleep comes."
      : p.flags.groggy ? "Woken in the middle of a cycle, so the brain stays slow for about 30 minutes."
      : sl.caffeineMg >= 30 ? "Caffeine blocks the signal of sleep pressure, so I feel less sleepy. The pressure itself is still there."
      : G < 75 ? `Glucose is only ${G} mg/dL. The brain runs mostly on glucose, so focus drops.`
      : p.flags.sleepy ? "The body clock has opened the sleep gate. Going to bed now means falling asleep quickly."
      : `Sleep pressure has built for ${awakeH} hours since I woke up. Only sleep clears it.`;
  } else if (zone === "heart") {
    read = `Heart ${bpHeartRate(p)} beats a minute · breathing ${bpBreathRate(p)} breaths a minute`;
    why = a.intensity ? "Working muscles need more oxygen and glucose, so the heart and lungs speed up."
      : sl.asleep ? "Asleep, the body needs less energy, so the heart and breathing slow down."
      : wa.deficitMl >= 800 ? "Water loss lowers the blood volume, so the heart beats a little faster to keep blood flowing."
      : p.activity.recentExerciseUntilEpochMin != null && p.epochMin < p.activity.recentExerciseUntilEpochMin ? "After exercise the muscles stay extra sensitive to insulin for about 12 hours."
      : "At rest the heart pumps about 5 litres of blood every minute, carrying glucose and oxygen to every cell.";
  } else if (zone === "belly") {
    read = `Glucose ${G} mg/dL ${trend > 1 ? "↑" : trend < -1 ? "↓" : "→"} · food in the gut ${Math.round(f.gutMassG)} g · liver store ${Math.round(f.glycogenLiverG)} g`;
    why = f.insulinAction >= 2 && trend < -1 ? "Insulin is high, so liver and muscle cells are taking glucose out of the blood."
      : trend > 1 ? "Glucose from digested food is crossing the wall of the small intestine into the blood."
      : f.gutMassG >= 30 ? `Food leaves the stomach a little at a time. Half of it empties every ${Math.round(f.gutEmptyHalfLifeMin)} minutes.`
      : f.minutesSinceMeal >= 300 ? `No food for ${Math.round(f.minutesSinceMeal / 60)} hours. The liver breaks down glycogen to keep glucose steady.`
      : p.flags.hungry ? "My stomach is nearly empty, so the hunger signal is on."
      : "Glucose is steady. Insulin and glucagon from the pancreas keep it in range.";
  } else if (zone === "mouth") {
    read = `Plaque pH ${te.plaquePh.toFixed(1)} · ${te.plaquePh < BPK.CRITICAL_PH ? "enamel is losing minerals" : "enamel is safe"}`;
    why = sl.asleep ? "Saliva almost stops during sleep, so any acid stays in the mouth for longer."
      : te.plaquePh < BPK.CRITICAL_PH ? "Plaque bacteria turned sugar into acid. Below pH 5.5 the enamel starts to dissolve."
      : te.acidLoad > 0.1 ? "Saliva is neutralising the acid. Recovery takes about 20 to 40 minutes."
      : te.fluorideShield > 0.3 ? "Fluoride from brushing helps the enamel hold on to its minerals."
      : "Plaque pH is close to neutral. Each sugary snack starts a new acid attack.";
  } else {
    read = wa.deficitMl > 20 ? `Water ${Math.round(wa.deficitMl)} mL short · thirst switches on at ${bpThirstMl(p)} mL` : `Water fully topped up · thirst switches on at ${bpThirstMl(p)} mL short`;
    why = a.intensity ? `Sweat leaves through the skin at ${wa.sweatRateMlPerMin} mL a minute. It cools the body as it evaporates.`
      : p.flags.thirsty ? `Thirst switched on only after ${bpThirstMl(p)} mL was already lost. Thirst is a late signal.`
      : sl.asleep ? "Even asleep, water leaves in every breath, about 45 mL an hour."
      : "Water leaves through breath, skin and urine all the time, about 95 mL an hour.";
  }
  const [ic, h, dom] = BP_ZONES[zone];
  return { ic, h, dom, read, why };
}

/* ---------- Learning objectives (§B2), misconceptions (T3/T7) and claims (T10) ---------- */
const BP_LOS = {
  F1: ["fuel", "Carbohydrate you eat appears in the blood as glucose within about 15 minutes.", "Digested carbohydrate reaches the blood as glucose within minutes"],
  F2: ["fuel", "Fibre, fat and protein slow how fast glucose arrives, so the peak is lower and later.", "Fibre, fat and protein slow how fast glucose arrives"],
  F3: ["fuel", "Insulin rises after glucose and moves glucose into muscle, fat and liver.", "Insulin moves glucose from the blood into cells"],
  F4: ["fuel", "Between meals the liver releases stored glucose (glycogen), so levels stay steady.", "The liver releases glucose from its glycogen store"],
  F5: ["fuel", "If glucose drops low, other hormones push the liver to release more, so it rarely keeps falling.", "Glucagon pushes the liver to release more glucose"],
  F6: ["fuel", "Working muscle takes up glucose without needing extra insulin, and stays more sensitive for hours.", "Working muscle takes up glucose without extra insulin"],
  F7: ["fuel", "A fast, high peak is often followed by a dip; the energy feeling tracks glucose being in range, not high.", "Insulin keeps working after a fast peak, so glucose dips"],
  W1: ["water", "Water leaves the body all the time, through breath, skin and urine, even at rest.", "Water leaves through breath, skin and urine all the time"],
  W2: ["water", "Thirst switches on after about 1 % of body mass is already lost; it lags the deficit.", "Thirst only switches on after about 1 % is lost"],
  W3: ["water", "Food carries water too; a meal counts toward intake.", "Food carries water, so meals count toward intake"],
  W4: ["water", "Sweat loss scales with intensity and time; caffeine drinks still count as water.", "Sweat grows with effort and time; coffee still counts as water"],
  S1: ["sleep", "Sleep pressure builds the whole time you're awake.", "Sleep pressure builds the whole time you are awake"],
  S2: ["sleep", "A body clock sets when sleep is available; trying too early gives long latency.", "The body clock keeps the sleep gate shut too early"],
  S3: ["sleep", "Sleep clears pressure fast at first, then slower.", "Sleep clears pressure fast at first, then slower"],
  S4: ["sleep", "Sleep runs in 90-minute cycles. Deep sleep comes early and REM comes late. Waking from either feels groggy.", "Deep sleep comes early in the night, REM comes late"],
  S5: ["sleep", "Cutting a night short removes mostly REM, not deep sleep.", "A short night mostly removes the late REM sleep"],
  S6: ["sleep", "Caffeine halves about every 5 hours and masks pressure without removing it.", "Caffeine halves every 5 hours and masks sleep pressure"],
  S7: ["sleep", "Bright or screen light in the evening pushes the body clock later, a little each night.", "Evening light pushes the body clock a little later"],
  T1: ["teeth", "Sugar in the mouth is turned to acid by plaque within minutes; pH drops below 5.5 and enamel loses mineral.", "Plaque bacteria turn sugar into acid within minutes"],
  T2: ["teeth", "How often sugar arrives matters more than how much; sipping keeps pH low.", "Each sip restarts the acid before saliva recovers"],
  T3: ["teeth", "Saliva buffers the acid in 20 to 40 minutes while awake; it nearly stops during sleep.", "Saliva buffers acid, but it nearly stops in sleep"],
  T4: ["teeth", "Acidic drinks erode directly, even without sugar; fluoride reduces mineral loss.", "Acidic drinks erode enamel directly; fluoride reduces mineral loss"]
};
const BP_MISC = {
  F1: ["Sugar takes several hours to reach the blood", "Carbohydrate goes straight from the mouth into the blood", "Only sweet foods turn into glucose in the blood"],
  F2: ["Fibre adds extra glucose, so the peak is higher", "Every carbohydrate gives exactly the same glucose curve", "Protein turns into glucose faster than sugar does"],
  F3: ["Insulin adds glucose to the blood after a meal", "Insulin rises first, before any glucose arrives", "Glucose leaves the blood only through the kidneys"],
  F4: ["Glucose falls steadily between meals until you eat", "The muscles send their glucose back to the blood", "The brain stops using glucose between meals"],
  F5: ["Low glucose keeps falling until the next meal", "Insulin rises to push glucose back up", "The stomach releases stored sugar when glucose is low"],
  F6: ["Muscles need extra insulin before they take any glucose", "Exercise raises glucose because muscles release sugar", "Muscle uptake stops the moment exercise ends"],
  F7: ["Higher glucose always means more energy", "Glucose stays high for hours after a sugary drink", "The dip happens because the drink had no water"],
  W1: ["The body loses water only when it sweats", "Water loss stops while you are asleep", "Water is lost only when you go to the toilet"],
  W2: ["Thirst switches on as soon as any water is lost", "If you are not thirsty, you have no water deficit", "Thirst comes from a dry mouth, not from water loss"],
  W3: ["Only drinks count toward water intake", "Food uses up water, so meals make the deficit bigger", "Water in food is not absorbed by the gut"],
  W4: ["Coffee removes more water than it gives", "Sweat loss is the same whatever the effort", "Sweating only happens on hot days"],
  S1: ["Sleep pressure builds only when you feel tired", "Sleep pressure stays the same all day", "Caffeine removes sleep pressure for good"],
  S2: ["You fall asleep fast whenever you go to bed early", "The body clock only controls waking up", "Sleep gate timing is the same for everyone"],
  S3: ["Sleep clears pressure at the same rate all night", "Sleep pressure clears only in the last hour of sleep", "Sleep pressure rises during sleep"],
  S4: ["Deep sleep comes mostly at the end of the night", "Sleep is one long stage from start to finish", "Waking from REM sleep always feels fresh"],
  S5: ["A short night mostly removes deep sleep", "A short night removes every stage equally", "REM sleep comes first, so it is never lost"],
  S6: ["Caffeine is gone within an hour of drinking it", "Caffeine removes sleep pressure, so you need less sleep", "Caffeine lasts only while you can taste it"],
  S7: ["Evening light moves the body clock earlier", "Light only matters in the morning, never at night", "Screens change sleep only by being noisy"],
  T1: ["Sugar itself dissolves enamel without any bacteria", "pH in plaque rises after eating sugar", "It takes days for sugar to make acid"],
  T2: ["Only the total amount of sugar matters", "Sipping is gentler because each sip is small", "Gulping keeps the pH low for longer than sipping"],
  T3: ["Saliva flow is the same awake and asleep", "Acid clears fastest during sleep", "Saliva makes the mouth more acidic"],
  T4: ["Only sugary drinks can affect enamel", "Fluoride makes enamel dissolve faster", "Acidic drinks are fine if they have no sugar"]
};
/* T10 claims: each test reads the pal's own history and returns supports / contradicts / untested */
const BP_CLAIMS = [
  ["F7", "A sugary drink keeps glucose high for hours.", w => { const pk = bpPeaks(w).find(p => p.v >= 140); if (!pk) return "untested"; const g = bpHistAt(w, "g", pk.t + 150); return g == null ? "untested" : g < 110 ? "contradicts" : "supports"; }],
  ["S6", "A coffee at dinner time has worn off by bedtime.", w => { const a = w.attempts.find(a => a.caffeineMg >= 30); if (a) return "contradicts"; return w.drinks.some(d => d.caf > 0 && bpMod(d.t) >= 960) ? "supports" : "untested"; }],
  ["W2", "You feel thirsty as soon as you start losing water.", w => w.fired.some(c => c.id === "water-leaves") ? "contradicts" : "untested"],
  ["W4", "Coffee does not count toward your water intake.", w => w.drinks.some(d => d.id === "coffee") ? "contradicts" : "untested"],
  ["T2", "Sipping a sweet drink slowly keeps plaque acidic for longer.", w => w.fired.some(c => c.id === "sipping") ? "supports" : "untested"],
  ["T3", "Brushing before bed makes no difference to overnight acid.", w => { const n = w.nights.find(n => n.deminNight >= 60); if (n) return "contradicts"; return "untested"; }],
  ["S2", "You can fall asleep quickly any time you go to bed early.", w => w.attempts.some(a => a.latency > 45 && a.gap < 0) ? "contradicts" : "untested"],
  ["S5", "A short night mostly costs you deep sleep.", w => w.nights.some(n => n.slept < 405) ? "contradicts" : "untested"],
  ["F4", "Twelve hours without food makes blood glucose fall very low.", w => w.fired.some(c => c.id === "stored-fuel") ? "contradicts" : "untested"],
  ["F6", "Exercise can lower glucose without any extra insulin.", w => w.bouts.some(b => b.g0 - b.g1 >= 10) ? "supports" : "untested"],
  ["S1", "Sleep pressure builds the longer you stay awake.", w => w.hist.S.length > 480 ? "supports" : "untested"],
  ["S7", "Evening screens move the body clock later.", w => w.nights.some(n => n.delayAfter > n.delayBefore) ? "supports" : "untested"],
  ["F2", "A fibre-rich breakfast gives a lower glucose peak.", w => w.fired.some(c => c.id === "slow-burn") ? "supports" : "untested"]
];
function bpPeaks(w) {   // peak after each meal (within 3 h)
  return w.meals.map(m => { let v = 0, t = m.t; for (let k = m.t; k <= m.t + 180; k++) { const g = bpHistAt(w, "g", k); if (g != null && g > v) { v = g; t = k; } } return { m, v, t }; });
}

/* ============================================================
   Questions from the pal's own day (Spec B). The oracle is the simulation: answers are read from the
   pal's history or from a re-run of a changed action log. Questions never change the pal.
   ============================================================ */
const BP_WIN = 2880;   // evidence must lie in the last 48 game hours
const BP_CMP = ["higher", "lower", "about the same"];
const BP_CLAIM_OPTS = ["The pal's day supports this", "The pal's day contradicts this", "The pal's day doesn't test this"];
const bpFoodName = items => items.map(([id]) => BP_FOODS[id].name.toLowerCase()).join(" with ");
const bpRerun = (w, mutate, until) => bpReplay({ log: mutate(w.events.map(e => Object.assign({}, e))), opts: w.opts }, until);
const bpCountBelow = (w, k, a, b, thr) => { let n = 0; for (let t = a; t <= b; t++) { const v = bpHistAt(w, k, t); if (v != null && v < thr) n++; } return n; };
const bpMaxIn = (w, k, a, b) => { let v = -Infinity, at = a; for (let t = a; t <= b; t++) { const x = bpHistAt(w, k, t); if (x != null && x > v) { v = x; at = t; } } return { v, t: at }; };
const bpMinIn = (w, k, a, b) => { let v = Infinity, at = a; for (let t = a; t <= b; t++) { const x = bpHistAt(w, k, t); if (x != null && x < v) { v = x; at = t; } } return { v, t: at }; };
const bpCmp = (a, b, rel = 0.1, abs = 3) => Math.abs(a - b) <= Math.max(abs, rel * Math.abs(a)) ? 2 : b > a ? 0 : 1;   // how b compares with a
const bpNightName = n => `the night starting ${bpHHMM(n.onset)} on day ${bpDay(n.onset)}`;
function bpLoFact(w, lo) {   // one live number for the LO's domain, so every mechanism quotes the sim
  const p = w.pal, d = BP_LOS[lo][0];
  if (d === "fuel") return `Right now your pal's glucose is ${Math.round(p.fuel.plasmaGlucoseMgDl)} mg/dL.`;
  if (d === "water") return `Right now your pal is ${Math.max(0, Math.round(p.water.deficitMl))} mL short of water.`;
  if (d === "sleep") return `Right now sleep pressure is ${p.sleep.S.toFixed(2)} and caffeine is ${Math.round(p.sleep.caffeineMg)} mg.`;
  return `Right now plaque pH is ${p.teeth.plaquePh.toFixed(1)}.`;
}
const bpDrinkOk = w => !bpBusy(w) && !w.pal.activity.intensity;

const BP_TEMPLATES = {
  T1: {   // Read the trace
    applicable(w) {
      const now = w.pal.epochMin, out = [];
      bpPeaks(w).forEach(p => { if (p.m.t >= now - BP_WIN && p.m.t + 180 <= now && p.v >= 100) out.push({ k: "gpeak", m: p.m, v: p.v, t: p.t }); });
      w.meals.forEach(d => {
        if (d.t < now - BP_WIN || d.t + 90 > now) return;
        const lo = bpMinIn(w, "ph", d.t, d.t + 90); if (lo.v < 6.2) out.push({ k: "ph", d, v: lo.v, t: lo.t });
      });
      w.attempts.forEach(a => { if (a.t >= now - BP_WIN && a.caffeineMg >= 10) out.push({ k: "caf", a }); });
      const th = w.fired.find(c => c.id === "water-leaves" && c.t >= now - BP_WIN); if (th) out.push({ k: "thirst", c: th });
      return out;
    },
    build(w, q) {
      const now = w.pal.epochMin;
      if (q.k === "gpeak") return { lo: q.v >= 140 ? "F7" : "F1", prompt: `Look at the glucose trace after the ${bpFoodName(q.m.items)} at ${bpHHMM(q.m.t)}. What was the highest glucose, in mg/dL?`,
        evidence: { traceRef: "g", windowEpochMin: [q.m.t, q.m.t + 180] }, answer: { kind: "numeric", value: Math.round(q.v), tolerance: 5, unit: "mg/dL" },
        feedback: { correct: `Yes, the peak was ${Math.round(q.v)} mg/dL.`, incorrect: `Look again at the glucose trace near ${bpHHMM(q.t)}.`, mechanism: `Glucose peaked at ${Math.round(q.v)} mg/dL at ${bpHHMM(q.t)}, ${q.t - q.m.t} minutes after eating, as the gut absorbed the carbohydrate.` } };
      if (q.k === "ph") return { lo: "T1", prompt: `After the ${bpFoodName(q.d.items)} at ${bpHHMM(q.d.t)}, how low did plaque pH go?`,
        evidence: { traceRef: "ph", windowEpochMin: [q.d.t, q.d.t + 90] }, answer: { kind: "numeric", value: Math.round(q.v * 10) / 10, tolerance: 0.2, unit: "pH" },
        feedback: { correct: `Yes, it fell to about pH ${q.v.toFixed(1)}.`, incorrect: `Look again at the plaque pH trace near ${bpHHMM(q.t)}.`, mechanism: `Plaque bacteria turned the sugar into acid, so pH fell to ${q.v.toFixed(1)} within ${q.t - q.d.t} minutes.` } };
      if (q.k === "caf") return { lo: "S6", prompt: `Your pal went to bed at ${bpHHMM(q.a.t)}. How much caffeine was still in its blood, in mg?`,
        evidence: { traceRef: "caf", windowEpochMin: [Math.max(w.t0, now - BP_WIN, q.a.t - 360), q.a.t] }, answer: { kind: "numeric", value: Math.round(q.a.caffeineMg), tolerance: 5, unit: "mg" },
        feedback: { correct: `Yes, about ${Math.round(q.a.caffeineMg)} mg.`, incorrect: `Look again at the caffeine trace at ${bpHHMM(q.a.t)}.`, mechanism: `${Math.round(q.a.caffeineMg)} mg was left because the liver clears only half of the caffeine every 5 hours.` } };
      return { lo: "W2", prompt: `Thirst switched on at ${bpHHMM(q.c.t)}. How big was the water deficit then, in mL?`,
        evidence: { traceRef: "def", windowEpochMin: [q.c.t - 120, q.c.t] }, answer: { kind: "numeric", value: q.c.data.ml, tolerance: 50, unit: "mL" },
        feedback: { correct: `Yes, about ${q.c.data.ml} mL.`, incorrect: `Look again at the water deficit trace at ${bpHHMM(q.c.t)}.`, mechanism: `The brain switches on thirst only at about ${bpThirstMl(w.pal)} mL, which is 1 % of body mass.` } };
    }
  },
  T2: {   // Counterfactual: change one thing, re-run, compare
    applicable(w) {
      const now = w.pal.epochMin, out = [];
      w.drinks.forEach(d => {
        if (d.t < now - BP_WIN || d.sugar < 10 || d.t + 180 > now) return;
        out.push({ k: d.over >= 30 ? "gulp" : "sip", d });
      });
      w.nights.forEach(n => { if (n.onset >= now - BP_WIN && n.acidAtOnset > 0.3) out.push({ k: "brush", n }); });
      w.attempts.forEach(a => { const d = w.drinks.filter(d => d.caf >= 40 && d.t < a.t && a.t - d.t <= 600 && bpMod(d.t) >= 720).pop(); if (d && a.t >= now - BP_WIN && w.nights.some(n => n.onset > a.t)) out.push({ k: "coffee", a, d }); });
      w.nights.forEach(n => { if (n.onset >= now - BP_WIN && n.how === "alarm" && n.slept < 420) out.push({ k: "alarm", n }); });
      return out;
    },
    build(w, q) {
      const same = e => (x => x.t === e.t && x.a === e.a);
      if (q.k === "sip" || q.k === "gulp") {
        const over = q.k === "sip" ? 60 : 5, a = q.d.t, b = q.d.t + 180, orig = bpCountBelow(w, "ph", a, b, 5.5);
        const alt = bpRerun(w, log => log.map(e => e.a === "drink" && e.t === q.d.t ? Object.assign(e, { over }) : e), b), v = bpCountBelow(alt, "ph", a, b, 5.5);
        const c = bpCmp(orig, v, 0.15, 4), name = BP_FOODS[q.d.id].name.toLowerCase();
        return { lo: "T2", prompt: `Your pal took ${q.d.over} minutes to drink the ${name} at ${bpHHMM(a)}. If it had taken ${over} minutes instead, minutes under pH 5.5 would be…`,
          evidence: { traceRef: "ph", windowEpochMin: [a, b] }, answer: { kind: "compare", options: BP_CMP.slice(), correctIndex: c },
          feedback: { correct: `Yes. The re-run gives ${v} minutes instead of ${orig}.`, incorrect: `Look again at the plaque pH trace after ${bpHHMM(a)}.`, mechanism: `The real day had ${orig} minutes under pH 5.5; the re-run had ${v}, because each sip restarts the acid.` } };
      }
      if (q.k === "brush") {
        const n = q.n, at = w.attempts.filter(x => x.t <= n.onset).pop();
        const alt = bpRerun(w, log => log.filter(e => !(e.a === "brush" && e.t >= at.t - 60 && e.t <= at.t)).concat([{ t: at.t - 1, a: "brush" }]), n.wake);
        const an = alt.nights.find(x => Math.abs(x.onset - n.onset) <= 30) || { deminNight: 0 }, c = bpCmp(n.deminNight, an.deminNight, 0.15, 4);
        return { lo: "T3", prompt: `Before ${bpNightName(n)}, your pal did not brush. If it had brushed just before bed, minutes under pH 5.5 overnight would be…`,
          evidence: { traceRef: "ph", windowEpochMin: [n.onset, n.wake] }, answer: { kind: "compare", options: BP_CMP.slice(), correctIndex: c },
          feedback: { correct: `Yes. The re-run gives ${an.deminNight} minutes instead of ${n.deminNight}.`, incorrect: `Look at the plaque pH trace during that night.`, mechanism: `With saliva almost off, the acid stayed: ${n.deminNight} minutes under pH 5.5 without brushing, ${an.deminNight} with it.` } };
      }
      if (q.k === "coffee") {
        const day0 = Math.floor(q.d.t / 1440) * 1440, at = q.a, n = w.nights.find(n => n.onset > at.t);
        if (day0 + 480 < w.t0) return null;
        const alt = bpRerun(w, log => log.map(e => e.a === "drink" && e.t === q.d.t ? Object.assign(e, { t: day0 + 480 }) : e), n.onset + 5);
        const aa = alt.attempts.find(x => x.t === at.t) || at, c = bpCmp(at.latency, aa.latency, 0.1, 3);
        return { lo: "S6", prompt: `Your pal had a ${BP_FOODS[q.d.id].name.toLowerCase()} at ${bpHHMM(q.d.t)}. If it had been at 08:00 instead, the time to fall asleep would be…`,
          evidence: { traceRef: "caf", windowEpochMin: [q.d.t, at.t] }, answer: { kind: "compare", options: BP_CMP.slice(), correctIndex: c },
          feedback: { correct: `Yes. The re-run falls asleep in ${aa.latency} minutes instead of ${at.latency}.`, incorrect: `Look at the caffeine trace at ${bpHHMM(at.t)}.`, mechanism: `At bedtime ${Math.round(at.caffeineMg)} mg was left in the real day and ${Math.round(aa.caffeineMg)} mg in the re-run.` } };
      }
      const n = q.n, alt = bpRerun(w, log => log.map(e => e.a === "sleep" && e.t <= n.onset && e.t >= n.onset - 200 && e.alarm != null ? Object.assign(e, { alarm: e.alarm + 180 }) : e), n.wake + 180);
      const an = alt.nights.find(x => Math.abs(x.onset - n.onset) <= 30) || n, c = bpCmp(n.remMin, an.remMin, 0.1, 3);
      return { lo: "S5", prompt: `The alarm ended ${bpNightName(n)} after ${n.slept} minutes. With the alarm 3 hours later, REM minutes would be…`,
        evidence: { traceRef: "st", windowEpochMin: [n.onset, n.wake] }, answer: { kind: "compare", options: BP_CMP.slice(), correctIndex: c },
        feedback: { correct: `Yes. REM goes from ${n.remMin} to ${an.remMin} minutes.`, incorrect: `Look at the sleep stages for that night.`, mechanism: `REM grows in the late cycles, so the longer night gives ${an.remMin} minutes of REM instead of ${n.remMin}.` } };
    }
  },
  T3: {   // Why did that happen?
    applicable(w) { const now = w.pal.epochMin; return w.fired.filter(c => c.t >= now - BP_WIN).map(c => ({ c })); },
    build(w, q, rng) {
      const def = BP_CARDS[q.c.id], lo = def.lo, opts = rng.shuffle([BP_LOS[lo][2]].concat(BP_MISC[lo]));
      return { lo, prompt: `At ${bpHHMM(q.c.t)} the card "${def.h}" appeared. Why did that happen?`, evidence: { traceRef: "card", windowEpochMin: [q.c.t - 60, q.c.t] },
        answer: { kind: "mcq", options: opts, correctIndex: opts.indexOf(BP_LOS[lo][2]) },
        feedback: { correct: `Yes. ${BP_LOS[lo][1]}`, incorrect: `Open the card from ${bpHHMM(q.c.t)} and read the mechanism.`, mechanism: q.c.mech } };
    }
  },
  T4: {   // Put it in order
    applicable(w) {
      const now = w.pal.epochMin, out = [];
      if (bpCountBelow(w, "ph", now - BP_WIN, now, 5.5) > 0) out.push({ k: "T1" });
      if (bpPeaks(w).some(p => p.m.t >= now - BP_WIN && p.v >= 110)) out.push({ k: "F3" });
      if (w.nights.some(n => n.onset >= now - BP_WIN)) out.push({ k: "S3" });
      return out;
    },
    build(w, q, rng) {
      const chains = {
        T1: ["Sugar reaches the plaque", "Bacteria turn the sugar into acid", "Plaque pH falls below 5.5", "Enamel loses some mineral"],
        F3: ["Starch is digested to glucose in the gut", "Glucose is absorbed into the blood", "The pancreas releases insulin", "Muscle and liver take up glucose"],
        S3: ["Sleep pressure builds all day", "The sleep gate opens at night", "Deep sleep clears pressure fast", "Pressure clears more slowly near morning"]
      }, items = chains[q.k], shown = rng.shuffle(items.map((_, i) => i));
      const now = w.pal.epochMin, trace = { T1: "ph", F3: "g", S3: "S" }[q.k];
      const num = q.k === "T1" ? `${bpCountBelow(w, "ph", now - BP_WIN, now, 5.5)} minutes under pH 5.5` : q.k === "F3" ? `a peak of ${Math.round(bpMaxIn(w, "g", now - BP_WIN, now).v)} mg/dL` : `sleep pressure as high as ${bpMaxIn(w, "S", now - BP_WIN, now).v.toFixed(2)}`;
      return { lo: q.k, prompt: `Put these steps from your pal's day in order, first to last.`, evidence: { traceRef: trace, windowEpochMin: [now - BP_WIN, now] },
        answer: { kind: "order", items: shown.map(i => items[i]), correctOrder: items.map((_, i) => shown.indexOf(i)) },
        feedback: { correct: `Yes, that is the chain.`, incorrect: `Start from what your pal ate or did, then follow the trace.`, mechanism: `Your pal's last two days show ${num}, which comes from this chain.` } };
    }
  },
  T5: {   // Predict, then the oracle re-runs
    applicable(w) {
      const p = w.pal, m = bpMod(p.epochMin), out = [];
      if (bpDrinkOk(w) && m >= 360 && m <= 1260) out.push({ k: "coffee" });
      if (bpDrinkOk(w) && m >= 360 && m <= 1200) out.push({ k: "run" });
      return out;
    },
    build(w, q) {
      const now = w.pal.epochMin;
      if (q.k === "coffee") {
        const t23 = Math.floor(now / 1440) * 1440 + 1380, alt = bpRerun(w, log => log.filter(e => e.t <= now).concat([{ t: now, a: "drink", id: "coffee", ml: 240, over: 5 }]), t23), v = Math.round(alt.pal.sleep.caffeineMg);
        return { lo: "S6", prompt: `Caffeine now: ${Math.round(w.pal.sleep.caffeineMg)} mg. If your pal drinks a 240 mL coffee now, how much caffeine will be left at 23:00, in mg?`,
          evidence: { traceRef: "caf", windowEpochMin: [Math.max(w.t0, now - 600), now] }, answer: { kind: "numeric", value: v, tolerance: 5, unit: "mg" },
          feedback: { correct: `Yes, the re-run gives ${v} mg.`, incorrect: `Remember: half the caffeine is cleared about every 5 hours.`, mechanism: `The coffee adds 96 mg, and the liver halves it every 5 hours, leaving ${v} mg at 23:00.` } };
      }
      const alt = bpRerun(w, log => log.filter(e => e.t <= now).concat([{ t: now, a: "exercise", intensity: 2, minutes: 30 }]), now + 31), b = alt.bouts[alt.bouts.length - 1], v = Math.round(b ? b.sweatMl : 450);
      return { lo: "W4", prompt: `If your pal runs at medium effort for 30 minutes now, how much water will it lose as sweat, in mL?`,
        evidence: { traceRef: "def", windowEpochMin: [Math.max(w.t0, now - 600), now] }, answer: { kind: "numeric", value: v, tolerance: 50, unit: "mL" },
        feedback: { correct: `Yes, the re-run gives ${v} mL.`, incorrect: `Sweat adds up minute by minute at medium effort.`, mechanism: `At medium effort the skin sweats ${BPK.SWEAT_ML_MIN[2]} mL a minute, so 30 minutes gives ${v} mL.` } };
    }
  },
  T7: {   // True or false
    applicable(w) { return Object.keys(BP_LOS).map(lo => ({ lo })); },
    build(w, q, rng) {
      const truth = rng() < 0.5, text = truth ? BP_LOS[q.lo][1] : rng.pick(BP_MISC[q.lo]) + ".", now = w.pal.epochMin;
      return { lo: q.lo, prompt: `True or false: ${text}`, evidence: { traceRef: "none", windowEpochMin: [Math.max(w.t0, now - 60), now] }, answer: { kind: "bool", value: truth },
        feedback: { correct: truth ? `Yes, that is true.` : `Yes, that is a common mix-up.`, incorrect: truth ? `It is true: watch your pal's traces for it.` : `That one is a common mix-up.`, mechanism: `${BP_LOS[q.lo][1]} ${bpLoFact(w, q.lo)}` } };
    }
  },
  T8: {   // Best next move: re-run each option
    applicable(w) {
      const p = w.pal, out = [], m = bpMod(p.epochMin);
      if (bpDrinkOk(w) && p.flags.thirsty) out.push({ k: "thirst" });
      if (bpDrinkOk(w) && (m >= 1200 || m < 120) && p.teeth.acidLoad > 0.2) out.push({ k: "bed" });
      return out;
    },
    build(w, q) {
      const now = w.pal.epochMin;
      let opts, score;
      if (q.k === "thirst") {
        opts = [["Drink 250 mL of water", [{ a: "drink", id: "water", ml: 250, over: 5 }]], ["Eat 40 g of gummy sweets", [{ a: "eat", items: [["gummy-sweets", 40]] }]], ["Rest for an hour", []], ["Go for a 30-minute run", [{ a: "exercise", intensity: 2, minutes: 30 }]]];
        score = acts => bpRerun(w, log => log.filter(e => e.t <= now).concat(acts.map(x => Object.assign({ t: now }, x))), now + 90).pal.water.deficitMl;
      } else {
        const wake = Math.floor((now + 600) / 1440) * 1440 + 420;
        opts = [["Brush teeth, then sleep", [{ a: "brush" }, { a: "sleep", alarm: wake }]], ["Go to sleep straight away", [{ a: "sleep", alarm: wake }]], ["Drink a cola, then sleep", [{ a: "drink", id: "cola", ml: 330, over: 5 }, { a: "sleep", alarm: wake, dt: 6 }]], ["Eat an apple, then sleep", [{ a: "eat", items: [["apple", 180]] }, { a: "sleep", alarm: wake, dt: 2 }]]];
        score = acts => { const alt = bpRerun(w, log => log.filter(e => e.t <= now).concat(acts.map(x => Object.assign({ t: now + (x.dt || 0) }, x))), wake + 1); return bpCountBelow(alt, "ph", now, wake, 5.5); };
      }
      const s = opts.map(o => score(o[1])), best = s.indexOf(Math.min(...s)), unique = s.filter(v => v === s[best]).length === 1;
      if (!unique) return null;
      const unit = q.k === "thirst" ? "mL short of water" : "minutes under pH 5.5";
      return { lo: q.k === "thirst" ? "W2" : "T3", prompt: q.k === "thirst" ? `Your pal is thirsty. Which move leaves it least short of water in 90 minutes?` : `It is late and plaque pH is ${w.pal.teeth.plaquePh.toFixed(1)}. Which move gives the fewest minutes under pH 5.5 tonight?`,
        evidence: { traceRef: q.k === "thirst" ? "def" : "ph", windowEpochMin: [Math.max(w.t0, now - 120), now] }, answer: { kind: "mcq", options: opts.map(o => o[0]), correctIndex: best },
        feedback: { correct: `Yes. The re-runs agree.`, incorrect: `The re-runs point to another move.`, mechanism: `Re-runs: ${opts.map((o, i) => `${o[0].toLowerCase()} gives ${Math.round(Math.max(0, s[i]))}`).join("; ")} ${unit}.` } };
    }
  },
  T9: {   // Compare two of the pal's own nights
    applicable(w) {
      const now = w.pal.epochMin, ns = w.nights.filter(n => n.onset >= now - BP_WIN);
      return ns.length >= 2 ? [{ k: "rem", a: ns[ns.length - 2], b: ns[ns.length - 1] }, { k: "lat", a: ns[ns.length - 2], b: ns[ns.length - 1] }] : [];
    },
    build(w, q) {
      const rem = q.k === "rem", va = rem ? q.a.remMin : q.a.latencyMin, vb = rem ? q.b.remMin : q.b.latencyMin, c = bpCmp(va, vb, 0.1, 3);
      return { lo: rem ? "S5" : "S2", prompt: `Compare ${bpNightName(q.b)} with the night before. ${rem ? "REM sleep" : "Time to fall asleep"} was…`,
        evidence: { traceRef: "st", windowEpochMin: [q.a.onset, q.b.wake] }, answer: { kind: "compare", options: BP_CMP.slice(), correctIndex: c },
        feedback: { correct: `Yes: ${vb} minutes against ${va}.`, incorrect: `Open both sleep reports and compare.`, mechanism: rem ? `REM was ${va} then ${vb} minutes, because REM fills the late cycles of a night.` : `It took ${va} then ${vb} minutes, because the body clock sets when the sleep gate opens.` } };
    }
  },
  T10: {   // Claim check
    applicable(w) { return BP_CLAIMS.map((c, i) => ({ i, r: c[2](w) })); },
    build(w, q) {
      const [lo, text] = BP_CLAIMS[q.i], idx = ["supports", "contradicts", "untested"].indexOf(q.r), now = w.pal.epochMin;
      return { lo, prompt: `Claim: "${text}" What does your pal's day say?`, evidence: { traceRef: "claim", windowEpochMin: [Math.max(w.t0, now - BP_WIN), now] },
        answer: { kind: "mcq", options: BP_CLAIM_OPTS.slice(), correctIndex: idx },
        feedback: { correct: `Yes. Your pal's own traces decide this one.`, incorrect: `Check the cards and traces from the last 2 days.`, mechanism: `${idx === 2 ? "Nothing in the last 48 hours tests this yet. " : ""}${BP_LOS[lo][1]} ${bpLoFact(w, lo)}` } };
    }
  }
};
const BP_RERUN_T = ["T2", "T5", "T8", "T9"];

/* ---------- Learner model (Leitner, §B5) ---------- */
function bpNewLearner() { const los = {}; Object.keys(BP_LOS).forEach(lo => los[lo] = { box: 0, dueEpochMin: 0, streak: 0, seen: 0, correct: 0 }); return { los, history: [] }; }
const BP_BOX_DAYS = [0, 1, 2, 4, 8];
function bpRecordAnswer(learner, q, correct, epochMin) {
  const s = learner.los[q.lo] || (learner.los[q.lo] = { box: 0, dueEpochMin: 0, streak: 0, seen: 0, correct: 0 });
  s.seen++; if (correct) { s.correct++; s.box = Math.min(4, s.box + 1); s.streak++; } else { s.box = Math.max(0, s.box - 1); s.streak = 0; }
  s.dueEpochMin = epochMin + BP_BOX_DAYS[s.box] * 1440;
  learner.history.push({ questionId: q.id, lo: q.lo, templateId: q.templateId, correct, epochMin });
  if (learner.history.length > 300) learner.history.splice(0, learner.history.length - 300);
  return s;
}
const bpMastered = s => s.box >= 3 && s.streak >= 2;
function bpCheckAnswer(q, given) {
  const a = q.answer;
  if (a.kind === "numeric") return Math.abs(Number(given) - a.value) <= a.tolerance;
  if (a.kind === "bool") return given === a.value;
  if (a.kind === "order") return Array.isArray(given) && given.length === a.correctOrder.length && given.every((v, i) => v === a.correctOrder[i]);
  return given === a.correctIndex;
}

/* ---------- Session builder with focus gating (§B6) ---------- */
function bpSessionSize(focus) {
  if (focus >= 0.70) return [6, ""];
  if (focus >= 0.50) return [4, "Focus is a bit low, so this is a short session."];
  if (focus >= 0.30) return [2, "Focus is low. Two questions, then look at why."];
  return [0, "Not now: the pal can't concentrate. Check sleep, water and glucose."];
}
function bpInstance(w, tid, params, rng) {
  const q = BP_TEMPLATES[tid].build(w, params, rng);
  if (!q) return null;
  q.templateId = tid; q.id = `${tid}-${bpHash(JSON.stringify([tid, q.prompt, q.answer, w.pal.epochMin]))}`;
  return bpValidate(w, q).length ? null : q;
}
function bpBuildSession(w, learner, seed) {
  const rng = bpRng(seed), now = w.pal.epochMin, focus = bpFocus(w.pal), [n, msg] = bpSessionSize(focus);
  const session = { id: `s${seed}-${now}`, questions: [], focusAtStart: Math.round(focus * 100) / 100, message: msg };
  if (!n) return session;
  // candidates by template, built lazily per LO
  const cands = [];
  Object.keys(BP_TEMPLATES).forEach(tid => BP_TEMPLATES[tid].applicable(w).forEach(p => cands.push({ tid, p, lo: p.lo || null })));
  const loOf = c => { if (c.lo) return c.lo; if (c.tid === "T3") return BP_CARDS[c.p.c.id].lo; if (c.tid === "T10") return BP_CLAIMS[c.p.i][0]; if (c.tid === "T4") return c.p.k;
    return { gpeak: c.p.v >= 140 ? "F7" : "F1", ph: "T1", caf: "S6", thirst: "W2", sip: "T2", gulp: "T2", brush: "T3", coffee: "S6", alarm: "S5", run: "W4", bed: "T3", rem: "S5", lat: "S2" }[c.p.k]; };
  cands.forEach(c => c.lo = loOf(c));
  const L = learner.los, recentCard = new Set(w.fired.filter(c => c.t >= now - 1440).map(c => BP_CARDS[c.id].lo));
  const rank = lo => { const s = L[lo]; const due = s.dueEpochMin <= now;
    if (due && s.seen && s.box === 0) return 0; if (due && s.seen && s.box <= 2) return 1; if (recentCard.has(lo) && !s.seen) return 2; if (due && s.seen) return 3; if (!s.seen) return 4; return bpMastered(s) ? 6 : 5; };
  const los = rng.shuffle(Object.keys(BP_LOS)).filter(lo => cands.some(c => c.lo === lo)).sort((a, b) => rank(a) - rank(b));
  const used = {}, usedLo = {}, hist = learner.history;
  const tryPick = (lo, onlyT) => {
    const pool = rng.shuffle(cands.filter(c => c.lo === lo && !c.taken && (used[c.tid] || 0) < 2 && (!onlyT || onlyT.includes(c.tid))))
      .sort((a, b) => hist.filter(h => h.lo === lo && h.templateId === a.tid).length - hist.filter(h => h.lo === lo && h.templateId === b.tid).length + (a.tid === "T10" && a.p.r === "untested" ? 1 : 0) - (b.tid === "T10" && b.p.r === "untested" ? 1 : 0));
    for (const c of pool) { c.taken = true; const q = bpInstance(w, c.tid, c.p, rng); if (q) { used[c.tid] = (used[c.tid] || 0) + 1; usedLo[lo] = 1; return q; } }
    return null;
  };
  for (let pass = 0; pass < 3 && session.questions.length < n; pass++)
    for (const lo of los) { if (session.questions.length >= n) break; if (pass === 0 && usedLo[lo]) continue; if (rank(lo) === 6 && pass === 0 && rng() > 0.125) continue; const q = tryPick(lo); if (q) session.questions.push(q); }
  if (n >= 4 && !session.questions.some(q => BP_RERUN_T.includes(q.templateId))) {
    for (const lo of los) { const q = tryPick(lo, BP_RERUN_T); if (q) { session.questions[session.questions.length - 1] = q; break; } }
  }
  return session;
}

/* ---------- Voice lint (Spec C) and instance validation (§B7) ---------- */
const BP_BANNED = ["calorie", "kcal", "weight", "diet", "junk", "clean eating", "cheat", "burn off", "guilty", "bad for you", "good for you", "healthy choice", "unhealthy", "detox", "toxic", "sugar crash", "damage", "ruin", "rot", "destroy", "danger", "should always", "never eat", "!"];
function bpVoiceLint(text, opts = {}) {
  const errs = [], t = String(text), low = t.toLowerCase();
  BP_BANNED.forEach(b => { const re = b === "!" ? /!/ : new RegExp(`\\b${b.replace(/ /g, "\\s+")}`, "i"); if (re.test(low)) errs.push(`banned "${b}"`); });
  t.split(/(?<=[.?…])\s+/).forEach(s => { const n = s.split(/\s+/).filter(Boolean).length; if (n > (opts.maxWords || 20)) errs.push(`sentence of ${n} words: "${s.slice(0, 50)}…"`); });
  return errs;
}
function bpValidate(w, q) {
  const errs = [], now = w.pal.epochMin, a = q.answer, words = s => String(s).split(/\s+/).filter(Boolean).length;
  if (words(q.prompt) > 40) errs.push("prompt > 40 words");
  if (a.options) { if (a.options.some(o => words(o) > 12)) errs.push("option > 12 words"); if (new Set(a.options.map(o => o.toLowerCase().trim())).size !== a.options.length) errs.push("duplicate options"); if (!(a.correctIndex >= 0 && a.correctIndex < a.options.length)) errs.push("no correct option"); }
  if (a.kind === "numeric" && !(a.tolerance > 0)) errs.push("tolerance");
  if (a.kind === "order" && a.correctOrder.slice().sort().join() !== a.items.map((_, i) => i).join()) errs.push("order");
  const [s0, s1] = q.evidence.windowEpochMin; if (s0 < now - BP_WIN || s1 > now) errs.push("evidence outside last 48 h");
  if (!/\d/.test(q.feedback.mechanism)) errs.push("mechanism has no number");
  [q.prompt, q.feedback.correct, q.feedback.incorrect, q.feedback.mechanism].concat(a.options || a.items || []).forEach(s => bpVoiceLint(s, { maxWords: 40 }).forEach(e => errs.push(e)));
  if (/\bwrong\b/i.test(q.feedback.incorrect)) errs.push("feedback says wrong");
  return errs;
}
