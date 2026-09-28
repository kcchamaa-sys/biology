<script>
/* ============================================================
   1. Characters: original Chiikawa-style SVG drawings (not official artwork)
   moods: "normal" | "happy" | "cry" | "shock" | "sparkle" | "brave"
   ============================================================ */
const L = en => en; // English-only build: keeps text helpers simple
const INK = "#4A3E3D";
let clipN = 0;
function eyes(x1, x2, y, mood, big) {
  if (mood === "happy") return `<path d="M${x1 - 3.2} ${y + 1.2} q3.2 -4.4 6.4 0 M${x2 - 3.2} ${y + 1.2} q3.2 -4.4 6.4 0" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
  if (mood === "shock") return `<circle cx="${x1}" cy="${y}" r="4.2" fill="#fff" stroke="${INK}" stroke-width="1.8"/><circle cx="${x2}" cy="${y}" r="4.2" fill="#fff" stroke="${INK}" stroke-width="1.8"/>
    <circle cx="${x1}" cy="${y}" r="1.4" fill="${INK}"/><circle cx="${x2}" cy="${y}" r="1.4" fill="${INK}"/>
    <path d="M${x2 + 10} ${y - 8} q-2.4 4.2 0 6 q2.4 -1.8 0 -6Z" fill="#A0C4FF" stroke="#5B8FC9" stroke-width=".8"/>`;
  const star = (cx, cy) => `<path d="M${cx} ${cy - 5} l1.5 3.4 3.6 .4 -2.7 2.4 .8 3.6 -3.2 -1.9 -3.2 1.9 .8 -3.6 -2.7 -2.4 3.6 -.4z" fill="#FDD66B" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>`;
  if (mood === "sparkle") return star(x1, y) + star(x2, y);
  const rx = big ? 3.8 : 2.7, ry = big ? 4.4 : 3.3, hr = big ? 1.4 : 1;
  let s = `<ellipse cx="${x1}" cy="${y}" rx="${rx}" ry="${ry}" fill="${INK}"/><ellipse cx="${x2}" cy="${y}" rx="${rx}" ry="${ry}" fill="${INK}"/>
    <circle cx="${x1 + 1}" cy="${y - 1.3}" r="${hr}" fill="#fff"/><circle cx="${x2 + 1}" cy="${y - 1.3}" r="${hr}" fill="#fff"/>`;
  if (mood === "cry") s += `<path d="M${x1} ${y + 4} q-2.4 4.5 0 6.5 q2.4 -2 0 -6.5Z M${x2} ${y + 4} q-2.4 4.5 0 6.5 q2.4 -2 0 -6.5Z" fill="#A0C4FF" stroke="#5B8FC9" stroke-width=".8"/>`;
  if (mood === "brave") s += `<path d="M${x1 - 4.5} ${y - 7.5} l7 2.2 M${x2 + 4.5} ${y - 7.5} l-7 2.2" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
  return s;
}
function blush(x1, x2, y) {
  const h = x => `M${x - 3.5} ${y + 1.6} l1.6 -3.2 M${x - .5} ${y + 1.6} l1.6 -3.2 M${x + 2.5} ${y + 1.6} l1.6 -3.2`;
  return `<ellipse cx="${x1}" cy="${y}" rx="5.2" ry="3.2" fill="#FFB7C5"/><ellipse cx="${x2}" cy="${y}" rx="5.2" ry="3.2" fill="#FFB7C5"/>
    <path d="${h(x1)} ${h(x2)}" stroke="#E27893" stroke-width=".9" stroke-linecap="round"/>`;
}
function mouth(x, y, mood, open) {
  if (mood === "cry") return `<path d="M${x - 4.5} ${y + 1.5} q2.25 -2.5 4.5 0 q2.25 2.5 4.5 0" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`;
  if (mood === "shock") return `<ellipse cx="${x}" cy="${y + 1}" rx="2.4" ry="3" fill="#F07C9A" stroke="${INK}" stroke-width="1.6"/>`;
  if (mood === "brave") return `<path d="M${x - 3.5} ${y + 1} h7" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
  if (open || mood === "happy" || mood === "sparkle") return `<path d="M${x - 3.8} ${y - 1} q3.8 6 7.6 0 Z" fill="#F07C9A" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`;
  return `<path d="M${x - 2.6} ${y} q1.3 1.8 2.6 0 q1.3 1.8 2.6 0" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`;
}
const OUT = `stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"`;
const CHAR = {
  chiikawa: { name: "Chiikawa", color: "#ffffff",
    head: m => `<circle cx="17" cy="17" r="7" fill="#fff" ${OUT}/><circle cx="47" cy="17" r="7" fill="#fff" ${OUT}/>
      <ellipse cx="32" cy="37" rx="25" ry="21" fill="#fff" ${OUT}/>${blush(15, 49, 43)}${eyes(24, 40, 36, m)}${mouth(32, 43, m)}` },
  hachiware: { name: "Hachiware", color: "#ffffff",
    head: m => { const id = "hc" + (++clipN); return `<path d="M9 26 L13 5 L26 16Z" fill="#A0C4FF" ${OUT}/><path d="M55 26 L51 5 L38 16Z" fill="#A0C4FF" ${OUT}/>
      <clipPath id="${id}"><ellipse cx="32" cy="37" rx="25" ry="21"/></clipPath>
      <ellipse cx="32" cy="37" rx="25" ry="21" fill="#fff"/>
      <path clip-path="url(#${id})" d="M0 33 L0 0 L64 0 L64 33 L42 33 L32 17 L22 33 Z" fill="#A0C4FF"/>
      <ellipse cx="32" cy="37" rx="25" ry="21" fill="none" ${OUT}/>${blush(15, 49, 44)}${eyes(24, 40, 38, m)}${mouth(32, 45, m)}`; } },
  usagi: { name: "Usagi", color: "#FDF3A8",
    head: m => `<ellipse cx="23" cy="10" rx="5.5" ry="13" fill="#FDF3A8" ${OUT}/><ellipse cx="41" cy="10" rx="5.5" ry="13" fill="#FDF3A8" ${OUT}/>
      <ellipse cx="23" cy="10" rx="2" ry="8" fill="#FFB7C5"/><ellipse cx="41" cy="10" rx="2" ry="8" fill="#FFB7C5"/>
      <ellipse cx="32" cy="38" rx="24" ry="20" fill="#FDF3A8" ${OUT}/>${blush(15, 49, 44)}${eyes(24, 40, 37, m)}${mouth(32, 45, m, true)}` },
  momonga: { name: "Momonga", color: "#ffffff",
    head: m => { const id = "mc" + (++clipN); return `<circle cx="14" cy="21" r="6.5" fill="#C9C3F0" ${OUT}/><circle cx="50" cy="21" r="6.5" fill="#C9C3F0" ${OUT}/>
      <clipPath id="${id}"><ellipse cx="32" cy="37" rx="25" ry="21"/></clipPath>
      <ellipse cx="32" cy="37" rx="25" ry="21" fill="#fff"/>
      <path clip-path="url(#${id})" d="M0 30 Q32 15 64 30 L64 0 L0 0 Z" fill="#C9C3F0"/>
      <ellipse cx="32" cy="37" rx="25" ry="21" fill="none" ${OUT}/>${blush(14, 50, 45)}${eyes(23, 41, 38, m, true)}${mouth(32, 46, m)}`; } },
  kurimanju: { name: "Kuri-Manju", color: "#F2D7AE",
    head: m => { const id = "kc" + (++clipN);
      const e = m === "normal" ? `<path d="M21 37 h6 M37 37 h6" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>` : eyes(24, 40, 37, m);
      return `<clipPath id="${id}"><path d="M8 45 Q6 18 32 16 Q58 18 56 45 Q32 56 8 45Z"/></clipPath>
      <path d="M8 45 Q6 18 32 16 Q58 18 56 45 Q32 56 8 45Z" fill="#F2D7AE"/>
      <path clip-path="url(#${id})" d="M0 29 Q32 19 64 29 L64 0 L0 0 Z" fill="#A8703F"/>
      <path d="M8 45 Q6 18 32 16 Q58 18 56 45 Q32 56 8 45Z" fill="none" ${OUT}/>${blush(15, 49, 43)}${e}${mouth(32, 44, m)}`; } },
  // Shisa: a cheerful lion-dog with a curly orange mane (runs the shop)
  shisa: { name: "Shisa", color: "#FFF1C9",
    head: m => `${[[8, 30], [10, 46], [56, 30], [54, 46], [16, 18], [48, 18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#F2A36B" ${OUT}/>`).join("")}
      <circle cx="18" cy="16" r="5.5" fill="#FFF1C9" ${OUT}/><circle cx="46" cy="16" r="5.5" fill="#FFF1C9" ${OUT}/>
      <ellipse cx="32" cy="38" rx="24" ry="20" fill="#FFF1C9" ${OUT}/>
      <path d="M22 27 q2 -3 5 0 M37 27 q3 -3 5 0" stroke="#E07A3F" stroke-width="2" fill="none" stroke-linecap="round"/>${blush(15, 49, 44)}${eyes(24, 40, 37, m)}${mouth(32, 45, m)}` },
  // Rakko: a calm, strong otter swordsman with a little scar (guards the boss stages)
  rakko: { name: "Rakko", color: "#F4E6CF",
    head: m => `<circle cx="14" cy="22" r="5.5" fill="#F4E6CF" ${OUT}/><circle cx="50" cy="22" r="5.5" fill="#F4E6CF" ${OUT}/>
      <ellipse cx="32" cy="38" rx="25" ry="20" fill="#F4E6CF" ${OUT}/>
      <ellipse cx="32" cy="46" rx="9" ry="6" fill="#fff" stroke="${INK}" stroke-width="1.4"/><ellipse cx="32" cy="42" rx="2.4" ry="1.6" fill="${INK}"/>
      ${blush(14, 50, 44)}${m === "normal" || m === "brave"
        ? `<path d="M19 35 l5 4 M24 35 l-5 4" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><ellipse cx="40" cy="37" rx="2.7" ry="3.3" fill="${INK}"/><circle cx="41" cy="35.7" r="1" fill="#fff"/>`
        : eyes(22, 42, 37, m)}${mouth(32, 50, m)}` }
};
const avatar = (who, mood = "normal", eq) => `<svg viewBox="0 0 64 64" aria-hidden="true"><g filter="url(#sketch)">${CHAR[who].head(mood)}${who === "chiikawa" ? outfitSvg(eq) : ""}</g></svg>`;
function figure(who, mood = "normal") {
  const c = CHAR[who].color;
  const extra = who === "rakko" ? `<path d="M56 86 L62 44" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M56 86 L62 44" stroke="#D3E4FF" stroke-width="2.4" stroke-linecap="round"/><path d="M52 72 h10" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`
    : who === "usagi" && mood !== "cry" ? `<path d="M6 56 l-4 -6 M10 52 l-2 -8 M58 56 l4 -6" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>` : "";
  return `<svg viewBox="-4 -4 72 100" aria-hidden="true"><g filter="url(#sketch)">
    <ellipse cx="32" cy="76" rx="19" ry="15" fill="${c}" ${OUT}/>
    <ellipse cx="13" cy="70" rx="5" ry="7" fill="${c}" ${OUT} transform="rotate(${mood === "sparkle" ? 150 : 30} 13 70)"/>
    <ellipse cx="51" cy="70" rx="5" ry="7" fill="${c}" ${OUT} transform="rotate(${mood === "sparkle" ? -150 : -30} 51 70)"/>
    <ellipse cx="24" cy="90" rx="6" ry="3.5" fill="${c}" ${OUT}/><ellipse cx="40" cy="90" rx="6" ry="3.5" fill="${c}" ${OUT}/>
    ${extra}<g>${CHAR[who].head(mood)}${who === "chiikawa" ? outfitSvg() : ""}</g></g></svg>`;
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
   2b. Background music: soft, generated live (no audio files).
   Map: gentle music-box tune in C major. Rooms: slower, mysterious A-minor tune.
   ============================================================ */
const MUSIC_KEY = "escapeGame_biology_music";
const SONGS = {
  map: { bpm: 84,
    chords: [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]],
    melody: [[76, 0, 79, 0, 81, 79, 76, 0], [72, 0, 76, 0, 74, 0, 0, 0], [81, 0, 79, 0, 76, 0, 74, 0], [74, 0, 76, 0, 79, 0, 0, 0],
             [79, 0, 81, 0, 84, 81, 79, 0], [76, 0, 79, 0, 76, 74, 72, 0], [74, 0, 76, 0, 81, 0, 79, 0], [76, 0, 74, 0, 72, 0, 0, 0]] },
  room: { bpm: 66,
    chords: [[45, 48, 52], [41, 45, 48], [48, 52, 55], [43, 47, 50]],
    melody: [[76, 0, 0, 0, 74, 0, 72, 0], [69, 0, 0, 0, 0, 0, 0, 0], [72, 0, 74, 0, 76, 0, 0, 0], [79, 0, 76, 0, 74, 0, 0, 0],
             [81, 0, 79, 0, 76, 0, 0, 0], [74, 0, 72, 0, 69, 0, 0, 0], [72, 0, 0, 74, 76, 0, 0, 0], [74, 0, 0, 0, 0, 0, 0, 0]] }
};
SONGS.rush = { bpm: 112, chords: SONGS.map.chords, melody: SONGS.map.melody };
const MUSIC = {
  on: true, mode: "map", step: 0, next: 0, timer: null, out: null,
  midi: m => 440 * Math.pow(2, (m - 69) / 12),
  bus() {
    const ctx = SFX.ctx; if (!ctx) return null;
    if (!this.out) {
      this.out = ctx.createGain(); this.out.gain.value = 0;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2600;
      this.out.connect(lp).connect(ctx.destination);
    }
    return this.out;
  },
  bell(freq, t, vol) {
    const ctx = SFX.ctx, o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = freq; o2.type = "triangle"; o2.frequency.value = freq * 2;
    const g2 = ctx.createGain(); g2.gain.value = .15;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(g); o2.connect(g2).connect(g); g.connect(this.out);
    o.start(t); o2.start(t); o.stop(t + 1.7); o2.stop(t + 1.7);
  },
  pad(notes, t, dur) {
    const ctx = SFX.ctx;
    notes.forEach(m => [0, 4].forEach(det => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = this.midi(m); o.detune.value = det;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + .9); g.gain.setValueAtTime(.05, t + dur - .6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + .4);
      o.connect(g).connect(this.out); o.start(t); o.stop(t + dur + .5);
    }));
  },
  schedule() {
    const ctx = SFX.ctx; if (!ctx || document.hidden) return;
    const song = SONGS[this.mode], eighth = 30 / song.bpm;
    if (this.next < ctx.currentTime) this.next = ctx.currentTime + .1;
    while (this.next < ctx.currentTime + .6) {
      const bar = Math.floor(this.step / 8) % song.melody.length, pos = this.step % 8;
      if (pos === 0) this.pad(song.chords[bar % song.chords.length], this.next, eighth * 8);
      const m = song.melody[bar][pos];
      if (m) this.bell(this.midi(m), this.next, this.mode === "room" ? .07 : .08);
      this.next += eighth; this.step++;
    }
  },
  start() {
    if (!this.on) return;
    SFX.init(); const out = this.bus(); if (!out || this.timer) return;
    const ctx = SFX.ctx;
    out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(.55, ctx.currentTime, .8);
    this.next = ctx.currentTime + .15; this.timer = setInterval(() => this.schedule(), 150);
  },
  stop() {
    if (this.out && SFX.ctx) this.out.gain.setTargetAtTime(0, SFX.ctx.currentTime, .3);
    clearInterval(this.timer); this.timer = null;
  },
  setMode(m) { if (this.mode === m) return; this.mode = m; this.step = 0; }
};
try { MUSIC.on = localStorage.getItem(MUSIC_KEY) !== "off"; } catch (e) {}

