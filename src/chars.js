<script>
/* ============================================================
   1. Characters: original Chiikawa-style SVG drawings (not official artwork)
   moods: "normal" | "happy" | "cry" | "shock" | "sparkle" | "brave"
   ============================================================ */
const L = en => en; // English-only build: keeps text helpers simple
const INK = "#4A3E3D";
let clipN = 0;
/* Mochi-style art: one soft squishy blob (head and body in one), thin warm-brown outlines,
   big blush, tiny nub arms and feet, sparkles. All drawn in a 200 × 200 space. */
const CO = "#5B4B49";
const CS = `stroke="${CO}" stroke-width="3.5" stroke-linejoin="round"`;
const BODY = "M100 62 C148 62 170 98 170 130 C170 164 140 178 100 178 C60 178 30 164 30 130 C30 98 52 62 100 62Z";
const spark4 = (x, y, r, c) => `<path d="M${x} ${y - r} Q${x + r * .22} ${y - r * .22} ${x + r} ${y} Q${x + r * .22} ${y + r * .22} ${x} ${y + r} Q${x - r * .22} ${y + r * .22} ${x - r} ${y} Q${x - r * .22} ${y - r * .22} ${x} ${y - r}Z" fill="${c}"/>`;
function eyes(m, o = {}) {
  const [x1, x2, y] = [80, 120, o.y || 116], big = o.big ? 1.25 : 1;
  const dot = x => `<ellipse cx="${x}" cy="${y}" rx="${6 * big}" ry="${7.5 * big}" fill="${CO}"/><circle cx="${x + 2 * big}" cy="${y - 2.8 * big}" r="${2.3 * big}" fill="#fff"/><circle cx="${x - 2 * big}" cy="${y + 3 * big}" r="${1.1 * big}" fill="#fff"/>`;
  if (m === "happy") return `<path d="M${x1 - 8} ${y + 4} Q${x1} ${y - 8} ${x1 + 8} ${y + 4} M${x2 - 8} ${y + 4} Q${x2} ${y - 8} ${x2 + 8} ${y + 4}" stroke="${CO}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  if (m === "sparkle") return spark4(x1, y, 11, "#FDD66B") + spark4(x2, y, 11, "#FDD66B") + `<path d="M${x1} ${y - 11} Q${x1 + 2.4} ${y - 2.4} ${x1 + 11} ${y} Q${x1 + 2.4} ${y + 2.4} ${x1} ${y + 11} Q${x1 - 2.4} ${y + 2.4} ${x1 - 11} ${y} Q${x1 - 2.4} ${y - 2.4} ${x1} ${y - 11}Z M${x2} ${y - 11} Q${x2 + 2.4} ${y - 2.4} ${x2 + 11} ${y} Q${x2 + 2.4} ${y + 2.4} ${x2} ${y + 11} Q${x2 - 2.4} ${y + 2.4} ${x2 - 11} ${y} Q${x2 - 2.4} ${y - 2.4} ${x2} ${y - 11}Z" fill="none" stroke="${CO}" stroke-width="2.2" stroke-linejoin="round"/>`;
  if (m === "shock") return `<circle cx="${x1}" cy="${y}" r="9" fill="#fff" stroke="${CO}" stroke-width="3"/><circle cx="${x2}" cy="${y}" r="9" fill="#fff" stroke="${CO}" stroke-width="3"/><circle cx="${x1}" cy="${y}" r="3" fill="${CO}"/><circle cx="${x2}" cy="${y}" r="3" fill="${CO}"/>`;
  if (m === "cry") return `<path d="M${x1 - 10} ${y - 12} L${x1 + 6} ${y - 16} M${x2 + 10} ${y - 12} L${x2 - 6} ${y - 16}" stroke="${CO}" stroke-width="3" stroke-linecap="round"/>` + dot(x1) + dot(x2)
    + `<path class="tear" d="M${x1 - 3} ${y + 8} Q${x1 - 8} ${y + 22} ${x1 - 3} ${y + 30} Q${x1 + 2} ${y + 22} ${x1 - 3} ${y + 8}Z M${x2 + 3} ${y + 8} Q${x2 - 2} ${y + 22} ${x2 + 3} ${y + 30} Q${x2 + 8} ${y + 22} ${x2 + 3} ${y + 8}Z" fill="#9ED0F0" stroke="#6FAFD8" stroke-width="1.2"/>`;
  if (m === "brave") return dot(x1) + dot(x2) + `<path d="M${x1 - 10} ${y - 16} L${x1 + 7} ${y - 10} M${x2 + 10} ${y - 16} L${x2 - 7} ${y - 10}" stroke="${CO}" stroke-width="3.5" stroke-linecap="round"/>`;
  if (m === "line") return `<path d="M${x1 - 8} ${y} h16 M${x2 - 8} ${y} h16" stroke="${CO}" stroke-width="3.5" stroke-linecap="round"/>`;
  return dot(x1) + dot(x2);
}
function blush(hatch = true, y = 132) {
  const h = x => `M${x - 7} ${y + 3} l3 -6 M${x - 1} ${y + 3} l3 -6 M${x + 5} ${y + 3} l3 -6`;
  return `<ellipse cx="62" cy="${y}" rx="12" ry="7" fill="#FFB3C1" opacity=".85"/><ellipse cx="138" cy="${y}" rx="12" ry="7" fill="#FFB3C1" opacity=".85"/>${hatch ? `<path d="${h(62)} ${h(138)}" stroke="#E27893" stroke-width="1.6" stroke-linecap="round"/>` : ""}`;
}
function mouth(m, open, y = 130) {
  if (m === "cry") return `<path d="M88 ${y + 6} q4 -6 8 0 q4 6 8 0 q4 -6 8 0" fill="none" stroke="${CO}" stroke-width="3" stroke-linecap="round"/>`;
  if (m === "shock") return `<ellipse cx="100" cy="${y + 6}" rx="6" ry="8" fill="#E88A9A" stroke="${CO}" stroke-width="3"/>`;
  if (m === "brave") return `<path d="M91 ${y + 3} h18" stroke="${CO}" stroke-width="3.5" stroke-linecap="round"/>`;
  if (open || m === "happy" || m === "sparkle") return `<path d="M89 ${y - 2} Q100 ${y + 18} 111 ${y - 2}Z" fill="#E88A9A" stroke="${CO}" stroke-width="3" stroke-linejoin="round"/><path d="M95 ${y + 7} Q100 ${y + 3} 105 ${y + 7}" fill="#F7B6C2"/>`;
  return `<path d="M91 ${y} q4.5 6 9 0 q4.5 6 9 0" fill="none" stroke="${CO}" stroke-width="3" stroke-linecap="round"/>`;
}
const capClip = (d, fill) => { const id = "cc" + (++clipN); return `<clipPath id="${id}"><path d="${BODY}"/></clipPath><path clip-path="url(#${id})" d="${d}" fill="${fill}"/>`; };
const CHAR = {
  chiikawa: { name: "Chiikawa", color: "#ffffff",
    back: () => `<circle cx="62" cy="76" r="15" fill="#fff" ${CS}/><circle cx="138" cy="76" r="15" fill="#fff" ${CS}/><circle cx="62" cy="77" r="6.5" fill="#FFD1DA"/><circle cx="138" cy="77" r="6.5" fill="#FFD1DA"/>`,
    face: m => blush(true) + eyes(m) + mouth(m) },
  hachiware: { name: "Hachiware", color: "#ffffff", ear: "#9EB9E6",
    back: () => `<path d="M48 104 L56 48 L94 70Z" fill="#9EB9E6" ${CS}/><path d="M152 104 L144 48 L106 70Z" fill="#9EB9E6" ${CS}/><path d="M58 88 L61 62 L80 74Z M142 88 L139 62 L120 74Z" fill="#F7C6D4"/>`,
    front: () => capClip("M0 0 H200 V100 H132 L100 70 L68 100 H0Z", "#9EB9E6"),
    face: m => blush(true) + eyes(m) + mouth(m) },
  usagi: { name: "Usagi", color: "#FDF3A8",
    back: () => `<ellipse cx="78" cy="40" rx="14" ry="36" fill="#FDF3A8" ${CS} transform="rotate(-8 78 40)"/><ellipse cx="122" cy="40" rx="14" ry="36" fill="#FDF3A8" ${CS} transform="rotate(8 122 40)"/><ellipse cx="78" cy="42" rx="6" ry="24" fill="#FFB9C8" transform="rotate(-8 78 42)"/><ellipse cx="122" cy="42" rx="6" ry="24" fill="#FFB9C8" transform="rotate(8 122 42)"/>`,
    face: m => blush(true) + eyes(m) + mouth(m, m !== "brave" && m !== "cry") },
  momonga: { name: "Momonga", color: "#ffffff",
    back: () => `<path d="M150 168 C204 170 210 104 176 88 C188 118 178 146 150 150Z" fill="#C9C3F0" ${CS}/><path d="M176 96 C190 116 188 140 176 152" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/><circle cx="58" cy="80" r="15" fill="#C9C3F0" ${CS}/><circle cx="142" cy="80" r="15" fill="#C9C3F0" ${CS}/>`,
    front: () => capClip("M0 0 H200 V98 Q100 74 0 98Z", "#C9C3F0"),
    face: m => blush(false) + eyes(m, { big: true }) + mouth(m) },
  kurimanju: { name: "Kuri-Manju", color: "#F2D7AE",
    front: () => capClip("M0 0 H200 V100 Q100 82 0 100Z", "#A8703F") + `<path d="M74 78 Q90 70 104 72" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".45"/>`,
    face: m => blush(false) + eyes(m === "normal" ? "line" : m) + mouth(m) },
  shisa: { name: "Shisa", color: "#FFF1C9",
    back: () => [[38, 104], [34, 134], [44, 160], [162, 104], [166, 134], [156, 160], [56, 76], [144, 76], [80, 60], [120, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="17" fill="#F2A36B" ${CS}/>`).join("") + `<circle cx="66" cy="72" r="10" fill="#FFF1C9" ${CS}/><circle cx="134" cy="72" r="10" fill="#FFF1C9" ${CS}/>`,
    face: m => `<path d="M68 98 q6 -7 13 0 M119 98 q7 -7 13 0" stroke="#E07A3F" stroke-width="3.5" fill="none" stroke-linecap="round"/>` + blush(false) + eyes(m) + mouth(m) },
  rakko: { name: "Rakko", color: "#EAD7BC",
    back: () => `<circle cx="60" cy="82" r="11" fill="#EAD7BC" ${CS}/><circle cx="140" cy="82" r="11" fill="#EAD7BC" ${CS}/>`,
    face: m => `<ellipse cx="100" cy="136" rx="20" ry="13" fill="#fff" stroke="${CO}" stroke-width="2.5"/><ellipse cx="100" cy="128" rx="6.5" ry="4.5" fill="${CO}"/>` + blush(false)
      + (m === "normal" || m === "brave" ? `<path d="M73 109 l14 14 M87 109 l-14 14" stroke="${CO}" stroke-width="3.5" stroke-linecap="round"/>` + eyes("x").replace(/^[\s\S]*?(<ellipse cx="120")/, "$1") : eyes(m)) + mouth(m, false, 142) }
};
/* Dress-up layers for Chiikawa (the player). Items live in WARDROBE (engine). */
function dressParts(eq) {
  eq = eq || (typeof S !== "undefined" && S && S.equip);
  const it = k => eq && eq[k] && typeof itemById === "function" ? itemById(eq[k]) : null;
  return { hat: it("hat"), hair: it("hair"), face: it("face"), outfit: it("outfit"), acc: it("ribbon"), hand: it("hand") };
}
function arms(m, c) {
  const a = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="14" fill="${c}" ${CS} transform="rotate(${r} ${x} ${y})"/>`;
  if (m === "happy" || m === "sparkle") return a(34, 110, -32) + a(166, 110, 32);
  if (m === "shock") return a(28, 120, -60) + a(172, 120, 60);
  if (m === "cry") return a(52, 144, -10) + a(148, 144, 10);
  if (m === "brave") return a(40, 142, 25) + a(164, 112, 30);
  return a(40, 142, 25) + a(160, 142, -25);
}
function charSvg(who, m = "normal", eq, full = true) {
  const C = CHAR[who], c = C.color, d = who === "chiikawa" ? dressParts(eq) : {};
  const o = d.outfit, armC = (o && o.arm) || c;
  let s = full ? `<ellipse cx="100" cy="184" rx="58" ry="8" fill="rgba(91,75,73,.13)"/>` : "";
  if (d.hair && d.hair.back) s += d.hair.back;
  s += C.back ? C.back() : "";
  if (full) s += `<ellipse cx="76" cy="176" rx="14" ry="8" fill="${c}" ${CS}/><ellipse cx="124" cy="176" rx="14" ry="8" fill="${c}" ${CS}/>`;
  s += `<path d="${BODY}" fill="${c}" ${CS}/>`;
  if (C.front) s += C.front();
  if (o) { const id = "oc" + (++clipN); s += `<clipPath id="${id}"><path d="${BODY}"/></clipPath><g clip-path="url(#${id})">${o.svg}</g><path d="${BODY}" fill="none" ${CS}/>`; }
  s += arms(m, armC);
  if (who === "chiikawa" && d.acc && d.acc.low) s += d.acc.svg;
  s += C.face(m);
  if (d.hair) s += d.hair.svg;
  if (d.face) s += d.face.svg;
  if (d.hat) s += d.hat.svg;
  if (d.acc && !d.acc.low) s += d.acc.svg;
  if (d.hand) s += d.hand.svg;
  if (full && who === "rakko") s += `<path d="M170 176 L190 96" stroke="${CO}" stroke-width="9" stroke-linecap="round"/><path d="M170 176 L190 96" stroke="#D3E4FF" stroke-width="4.5" stroke-linecap="round"/><path d="M160 158 h22" stroke="${CO}" stroke-width="6" stroke-linecap="round"/>`;
  if (full && who === "usagi" && m !== "cry") s += `<path d="M14 100 l-10 -8 M18 84 l-6 -12 M186 100 l10 -8" stroke="${CO}" stroke-width="3" stroke-linecap="round"/>`;
  if (m === "sparkle" || m === "happy") s += `<g class="twinkle">${spark4(26, 70, 8, "#FFB3C1")}${spark4(176, 60, 7, "#A9D4EE")}</g>`;
  if (m === "shock") s += `<path d="M160 70 Q154 82 160 88 Q166 82 160 70Z" fill="#9ED0F0" stroke="#6FAFD8" stroke-width="1.5"/>`;
  return s;
}
const AV_VB = "12 30 176 160";
const avatar = (who, mood = "normal", eq) => `<svg viewBox="${AV_VB}" aria-hidden="true">${charSvg(who, mood, eq, false)}</svg>`;
const FIG_VB = "-14 -6 228 202";
function figure(who, mood = "normal", eq) {
  return `<svg viewBox="${FIG_VB}" aria-hidden="true"><g class="squish">${charSvg(who, mood, eq, true)}</g></svg>`;
}
/* Short emotional reactions: Chiikawa and friends react out loud to what happens */
const REACT = {
  right: [["usagi", "happy", "Yaha! 🐰"], ["chiikawa", "sparkle", "Ya...! We did it! ✨"], ["hachiware", "happy", "Sugoi! You're so smart! 💙"], ["momonga", "sparkle", "Hmph... that was cute AND correct! 💜"], ["usagi", "happy", "URA! URAAA! 🎉"], ["chiikawa", "happy", "Waaai~! 🥹"]],
  wrong: [["chiikawa", "cry", "Wah...! 😭 The lock didn't open..."], ["chiikawa", "shock", "Eh?! EHHH?! 😱"], ["chiikawa", "cry", "Uu... uuu... 🥺"], ["usagi", "shock", "Haa?! 🐰💦"]],
  brave: [["chiikawa", "brave", "I-I won't give up! 💪"], ["hachiware", "happy", "Nantoka naare~! It'll work out somehow! ✨"], ["chiikawa", "brave", "Let's read it again... slowly. 📖"]]
};

/* ============================================================
   2. Sound effects: Web Audio, no files
   ============================================================ */
const SFX = {
  ctx: null, on: true,
  init() {
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === "suspended") this.ctx.resume();
    } catch (e) { this.ctx = null; }
  },
  tone(freq, dur, { type = "sine", vol = .15, at = 0, to = null } = {}) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime + at, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.ctx.destination); o.start(t); o.stop(t + dur + .02);
  },
  tap() { this.tone(660, .06, { type: "triangle", vol: .07 }); },
  beep() { this.tone(1320, .05, { type: "square", vol: .04 }); },
  click() { this.tone(900, .03, { type: "square", vol: .05 }); this.tone(500, .04, { type: "triangle", vol: .06, at: .03 }); },
  right() { [784, 988, 1319].forEach((f, i) => this.tone(f, .2, { type: "triangle", at: i * .08, vol: .13 })); },
  yaha() { this.tone(1500, .1, { vol: .12, to: 1900 }); this.tone(1900, .18, { vol: .12, at: .13, to: 1300 }); },
  wrong() { this.tone(330, .16, { type: "square", vol: .05, to: 220 }); this.tone(247, .28, { type: "triangle", vol: .1, at: .13, to: 165 }); },
  item() { [1046, 1568, 2093].forEach((f, i) => this.tone(f, .16, { at: i * .06, vol: .08 })); },
  hint() { this.tone(1046, .3, { vol: .09 }); this.tone(1568, .4, { vol: .05, at: .08 }); },
  door() { this.tone(110, .9, { type: "sawtooth", vol: .05, to: 70 }); this.tone(180, .7, { type: "triangle", vol: .06, at: .2, to: 120 }); },
  tick() { this.tone(1800, .02, { type: "square", vol: .03 }); },
  creepy() { this.tone(92, 1.6, { vol: .09, to: 70 }); this.tone(97, 1.6, { vol: .07, to: 73 }); this.tone(1250, .9, { type: "triangle", vol: .03, at: .3, to: 880 }); this.tone(740, .7, { type: "triangle", vol: .025, at: .9, to: 520 }); },
  fanfare() {
    [[523, 0], [659, .12], [784, .24], [1046, .36], [784, .52], [1046, .64]].forEach(([f, a]) => this.tone(f, .26, { type: "triangle", at: a, vol: .13 }));
    this.tone(1319, .8, { at: .8, vol: .11 });
  }
};

/* ============================================================
   2b. Background music: 8 ORIGINAL cute tunes in a cheerful Chiikawa-like mood,
   generated live with Web Audio (no audio files, no official soundtrack).
   Each song: 8 bars × 8 eighth-notes. melody/bass are MIDI numbers (0 = rest),
   chords are held pads, drums are 8-step strings (k kick, s snare, h hat, . rest).
   ============================================================ */
const MUSIC_KEY = "escapeGame_biology_music";
const CH = { C: [48, 52, 55], Dm: [50, 53, 57], Em: [52, 55, 59], F: [53, 57, 60], G: [55, 59, 62], Am: [57, 60, 64], Bb: [46, 50, 53], Bm: [47, 50, 54], D: [50, 54, 57], A: [45, 49, 52], E: [52, 56, 59], Gm: [55, 58, 62], Cl: [48, 52, 55] };
const bassBar = (roots, pat) => roots.map(r => pat.map(o => (o === null ? 0 : r + o)));
const SONGS = {
  // Map: "Picnic Parade" (C major marimba march)
  map: { title: "Picnic Parade", bpm: 108, swing: .12, lead: "marimba", drums: "k.h.s.hh",
    chords: ["C", "F", "G", "C", "Am", "F", "G", "C"],
    melody: [[72, 0, 76, 79, 76, 0, 72, 0], [77, 0, 76, 74, 72, 0, 69, 0], [71, 0, 74, 79, 77, 76, 74, 0], [76, 0, 72, 0, 72, 0, 0, 0],
             [76, 0, 79, 81, 79, 0, 76, 0], [77, 76, 74, 72, 74, 0, 77, 0], [79, 0, 77, 76, 74, 0, 71, 0], [72, 0, 76, 0, 72, 0, 0, 0]],
    bass: bassBar([36, 41, 43, 36, 45, 41, 43, 36], [0, null, null, null, 7, null, 12, null]) },
  // Library & lab: "Curious Steps" (A minor pizzicato tiptoe)
  room: { title: "Curious Steps", bpm: 84, swing: .08, lead: "pluck", drums: "k...s...",
    chords: ["Am", "Dm", "E", "Am", "F", "G", "E", "Am"],
    melody: [[69, 0, 72, 0, 76, 0, 72, 0], [74, 0, 77, 0, 74, 0, 72, 0], [71, 0, 68, 0, 71, 0, 74, 0], [72, 0, 69, 0, 0, 0, 0, 0],
             [72, 0, 74, 76, 77, 0, 76, 0], [74, 0, 71, 0, 79, 0, 77, 0], [76, 0, 74, 0, 71, 0, 68, 0], [69, 0, 0, 0, 0, 0, 0, 0]],
    bass: bassBar([45, 38, 40, 45, 41, 43, 40, 45], [0, null, 7, null, 0, null, 7, null]) },
  // Garden & greenhouse: "Sunny Sprout" (F major flute stroll)
  garden: { title: "Sunny Sprout", bpm: 96, swing: .1, lead: "flute", drums: "k.h.k.h.",
    chords: ["F", "C", "Dm", "Bb", "F", "Gm", "C", "F"],
    melody: [[77, 0, 0, 76, 77, 0, 72, 0], [76, 0, 74, 72, 74, 0, 0, 0], [74, 0, 77, 0, 81, 0, 79, 77], [74, 0, 0, 0, 70, 0, 0, 0],
             [72, 0, 77, 0, 79, 81, 79, 77], [79, 0, 0, 77, 74, 0, 70, 0], [72, 0, 74, 0, 76, 0, 79, 0], [77, 0, 0, 0, 0, 0, 0, 0]],
    bass: bassBar([41, 36, 38, 34, 41, 43, 36, 41], [0, null, null, 7, 12, null, 7, null]) },
  // Pond & inside a cell: "Bubble Float" (dreamy D major music box)
  float: { title: "Bubble Float", bpm: 70, swing: 0, lead: "bell", drums: "........",
    chords: ["D", "Bm", "G", "A", "D", "Bm", "G", "D"],
    melody: [[78, 0, 0, 0, 81, 0, 78, 0], [76, 0, 0, 0, 74, 0, 0, 0], [74, 0, 76, 0, 78, 0, 79, 0], [81, 0, 0, 0, 76, 0, 0, 0],
             [78, 0, 0, 81, 83, 0, 81, 0], [78, 0, 0, 0, 76, 0, 74, 0], [71, 0, 74, 0, 79, 0, 78, 0], [74, 0, 0, 0, 0, 0, 0, 0]],
    bass: bassBar([38, 35, 43, 45, 38, 35, 43, 38], [0, null, null, null, 7, null, null, null]) },
  // Kitchen & clinic: "Snack Time" (G major bouncy marimba)
  snack: { title: "Snack Time", bpm: 100, swing: .14, lead: "marimba", drums: "k.h.s.h.",
    chords: ["G", "Em", "C", "D", "G", "Em", "C", "D"],
    melody: [[79, 0, 79, 81, 83, 0, 79, 0], [76, 0, 79, 0, 76, 0, 74, 0], [72, 0, 76, 0, 79, 0, 76, 0], [74, 0, 78, 0, 81, 0, 0, 0],
             [83, 0, 81, 79, 81, 0, 79, 76], [79, 0, 76, 0, 74, 0, 71, 0], [72, 0, 74, 76, 79, 0, 76, 0], [74, 0, 78, 0, 79, 0, 0, 0]],
    bass: bassBar([43, 40, 36, 38, 43, 40, 36, 38], [0, null, 7, null, 0, 12, 7, null]) },
  // Boss stages: "Rakko's Trial" (D minor, brave and driving)
  boss: { title: "Rakko's Trial", bpm: 118, swing: 0, lead: "pluck", drums: "k.hsk.hs",
    chords: ["Dm", "Bb", "C", "A", "Dm", "Bb", "C", "A"],
    melody: [[74, 0, 74, 77, 76, 0, 74, 0], [70, 0, 74, 0, 77, 0, 74, 0], [72, 0, 76, 0, 79, 77, 76, 0], [73, 0, 76, 0, 81, 0, 0, 0],
             [81, 0, 79, 77, 76, 0, 74, 0], [77, 0, 74, 0, 70, 0, 74, 0], [76, 0, 72, 0, 79, 0, 76, 0], [73, 0, 69, 0, 74, 0, 0, 0]],
    bass: bassBar([38, 34, 36, 33, 38, 34, 36, 33], [0, 0, 12, 0, 0, 12, 0, 7]) },
  // Cell Rush: "Yaha Dash" (fast C major)
  rush: { title: "Yaha Dash", bpm: 150, swing: 0, lead: "marimba", drums: "k.hsk.hs",
    chords: ["C", "G", "Am", "F", "C", "G", "F", "C"],
    melody: [[72, 76, 79, 76, 72, 76, 79, 84], [83, 79, 74, 79, 83, 0, 79, 0], [81, 76, 72, 76, 81, 84, 81, 76], [77, 0, 81, 0, 77, 0, 74, 0],
             [72, 76, 79, 84, 83, 79, 76, 79], [74, 79, 83, 86, 84, 0, 83, 0], [81, 84, 81, 76, 77, 81, 77, 74], [72, 0, 79, 0, 72, 0, 0, 0]],
    bass: bassBar([36, 43, 45, 41, 36, 43, 41, 36], [0, 12, 0, 12, 0, 12, 7, 12]) },
  // Mistake Notebook: "Study Tea" (slow F major lullaby)
  calm: { title: "Study Tea", bpm: 64, swing: 0, lead: "bell", drums: "........",
    chords: ["F", "Dm", "Bb", "C", "F", "Dm", "Bb", "F"],
    melody: [[72, 0, 0, 0, 69, 0, 72, 0], [74, 0, 0, 0, 69, 0, 0, 0], [70, 0, 74, 0, 77, 0, 74, 0], [72, 0, 0, 0, 0, 0, 0, 0],
             [77, 0, 0, 76, 74, 0, 72, 0], [74, 0, 0, 0, 77, 0, 0, 0], [70, 0, 72, 0, 74, 0, 72, 0], [69, 0, 0, 0, 65, 0, 0, 0]],
    bass: bassBar([41, 38, 34, 36, 41, 38, 34, 41], [0, null, null, null, 7, null, null, null]) }
};
const SCENE_SONG = { library: "room", lab: "room", greenhouse: "garden", garden: "garden", pond: "float", cellworld: "float", kitchen: "snack", clinic: "snack" };
const MUSIC = {
  on: true, mode: "map", step: 0, next: 0, timer: null, out: null, noise: null,
  midi: m => 440 * Math.pow(2, (m - 69) / 12),
  bus() {
    const ctx = SFX.ctx; if (!ctx) return null;
    if (!this.out) {
      this.out = ctx.createGain(); this.out.gain.value = 0;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3200;
      this.out.connect(lp).connect(ctx.destination);
      const n = ctx.createBuffer(1, ctx.sampleRate * .5, ctx.sampleRate), d = n.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noise = n;
    }
    return this.out;
  },
  env(g, t, vol, a, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dec); },
  osc(type, freq, t, dur, vol, a = .01, detune = 0) {
    const ctx = SFX.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq; o.detune.value = detune; this.env(g, t, vol, a, dur);
    o.connect(g).connect(this.out); o.start(t); o.stop(t + dur + .05); return o;
  },
  // Instruments
  bell(f, t, v) { this.osc("sine", f, t, 1.6, v, .02); this.osc("triangle", f * 2, t, .9, v * .15, .02); },
  marimba(f, t, v) { this.osc("sine", f, t, .5, v * 1.1, .005); this.osc("sine", f * 4, t, .12, v * .25, .003); },
  pluck(f, t, v) { const o = this.osc("triangle", f, t, .35, v * 1.1, .004); o.frequency.setValueAtTime(f * 1.01, t); o.frequency.exponentialRampToValueAtTime(f, t + .05); this.osc("sine", f * 2, t, .15, v * .2, .004); },
  flute(f, t, v, len) {
    const ctx = SFX.ctx, o = this.osc("sine", f, t, len, v * .9, .06), lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 5.2; lg.gain.value = f * .006; lfo.connect(lg).connect(o.frequency); lfo.start(t + .1); lfo.stop(t + len + .05);
    this.osc("triangle", f * 2, t, len * .8, v * .08, .08);
  },
  bassNote(f, t) { this.osc("triangle", f, t, .45, .11, .01); this.osc("sine", f, t, .3, .06, .01); },
  pad(notes, t, dur) {
    const ctx = SFX.ctx;
    notes.forEach(m => [0, 5].forEach(det => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = this.midi(m); o.detune.value = det;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.025, t + .5); g.gain.setValueAtTime(.025, t + dur - .4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + .3);
      o.connect(g).connect(this.out); o.start(t); o.stop(t + dur + .4);
    }));
  },
  drum(k, t) {
    const ctx = SFX.ctx;
    if (k === "k") { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + .14); this.env(g, t, .22, .003, .18); o.connect(g).connect(this.out); o.start(t); o.stop(t + .2); return; }
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = this.noise; f.type = k === "s" ? "bandpass" : "highpass"; f.frequency.value = k === "s" ? 1800 : 7000;
    this.env(g, t, k === "s" ? .09 : .03, .002, k === "s" ? .14 : .05);
    src.connect(f).connect(g).connect(this.out); src.start(t); src.stop(t + .2);
  },
  schedule() {
    const ctx = SFX.ctx; if (!ctx || document.hidden) return;
    const song = SONGS[this.mode] || SONGS.map, eighth = 30 / song.bpm;
    if (this.next < ctx.currentTime) this.next = ctx.currentTime + .1;
    while (this.next < ctx.currentTime + .6) {
      const bar = Math.floor(this.step / 8) % song.melody.length, pos = this.step % 8;
      const t = this.next + (pos % 2 ? song.swing * eighth : 0);
      if (pos === 0) this.pad(CH[song.chords[bar]], this.next, eighth * 8);
      const m = song.melody[bar][pos];
      if (m) { const f = this.midi(m), v = .075; if (song.lead === "flute") this.flute(f, t, v, eighth * 1.8); else this[song.lead](f, t, v); }
      const b = song.bass[bar][pos]; if (b) this.bassNote(this.midi(b), t);
      const d = song.drums[pos]; if (d && d !== ".") this.drum(d, t);
      this.next += eighth; this.step++;
    }
  },
  start() {
    if (!this.on) return;
    SFX.init(); const out = this.bus(); if (!out || this.timer) return;
    const ctx = SFX.ctx;
    out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(.5, ctx.currentTime, .8);
    this.next = ctx.currentTime + .15; this.timer = setInterval(() => this.schedule(), 150);
  },
  stop() {
    if (this.out && SFX.ctx) this.out.gain.setTargetAtTime(0, SFX.ctx.currentTime, .3);
    clearInterval(this.timer); this.timer = null;
  },
  setMode(m) { if (!SONGS[m]) m = "map"; if (this.mode === m) return; this.mode = m; this.step = 0; }
};
try { MUSIC.on = localStorage.getItem(MUSIC_KEY) !== "off"; } catch (e) {}

