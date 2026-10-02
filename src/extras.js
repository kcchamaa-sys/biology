
/* ============================================================
   5c. Extras: British pronunciation, Word Dictation, fun-fact chat card, streak bonus
   ============================================================ */
/* 🔊 British pronunciation (Web Speech API, en-GB voice). Buttons use data-say; one click handler serves them all. */
const TTS = { ok: typeof speechSynthesis !== "undefined" && typeof SpeechSynthesisUtterance !== "undefined" };
function gbVoice() {
  const vs = TTS.ok ? speechSynthesis.getVoices() : [];
  return vs.find(v => /en[-_]GB/i.test(v.lang) && /Google UK|Serena|Kate|Daniel|Libby|Sonia/i.test(v.name)) || vs.find(v => /en[-_]GB/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
}
function speak(text, slow) {
  if (!TTS.ok) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = "en-GB"; u.rate = slow ? .55 : .9;
    const v = gbVoice(); if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) {}
}
const sayBtns = t => TTS.ok ? `<span class="saybtns"><button class="saybtn" data-say="${esc(t)}" aria-label="Hear “${esc(t)}”" title="British pronunciation">🔊</button><button class="saybtn" data-say="${esc(t)}" data-slow="1" aria-label="Hear “${esc(t)}” slowly" title="Slowly">🐢</button></span>` : "";
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-say]"); if (b) { e.preventDefault(); e.stopPropagation(); speak(b.dataset.say, !!b.dataset.slow); } }, true);

/* 🔥 Streak bonus: chestnut rewards grow 5% per streak day, up to ×1.5 */
const streakMult = () => Math.min(1.5, 1 + .05 * Math.max(0, ((S && S.current_streak) || 1) - 1));
const withStreak = n => Math.round(n * streakMult() * (S && S.ill ? .5 : 1));
const multTag = () => (streakMult() > 1 ? ` · 🔥 ×${streakMult().toFixed(2).replace(/0$/, "")} streak bonus` : "") + (S && S.ill ? " · 🤒 ×0.5 (Mochi is sick)" : "");

/* Near-miss check for spelling ("so close!") */
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const soClose = (typed, word) => { const a = normWord(typed), b = normWord(word); return a.length > 2 && a !== b && lev(a, b) <= (b.length >= 9 ? 2 : 1); };

/* 💡 Did you know? Two fun facts per topic, many with Hong Kong examples. Shown in the chat card and the Journal. */
const FACTS = {
  t1: ["Cellulose is the most common organic molecule on Earth. We can't digest it, but as dietary fibre it keeps our gut moving.", "Water has a high specific heat capacity, so it warms up and cools down slowly. That helps keep your body temperature steady."],
  t2: ["Your body has about 30 trillion human cells, and roughly as many bacterial cells, mostly living in your gut!", "Some nerve cells stretch from the bottom of your spine to your toes: that's about 1 metre for a single cell."],
  t3: ["Salting vegetables for pickles draws water out of their cells by osmosis. That's why they go soft and limp.", "Root hair cells take in mineral ions by active transport, even when the soil has fewer ions than the cell."],
  t4: ["The cells lining your small intestine are replaced every 3–5 days by mitosis.", "Human body cells have 46 chromosomes, but a potato cell has 48!"],
  t5: ["Fresh pineapple contains a protease called bromelain. That's why it makes your tongue tingle and stops jelly from setting.", "Biological washing powders contain proteases and lipases, so they remove food stains even in cool water, saving energy."],
  t6: ["About half of the oxygen we breathe is made by tiny phytoplankton in the oceans, not by trees.", "Country parks cover about 40% of Hong Kong's land: that's a lot of leaves photosynthesising next to a busy city!"],
  t7: ["The fluffy inside of a pineapple bun comes from yeast: its anaerobic respiration makes CO₂ bubbles in the dough.", "Sprinting up many flights of stairs makes your muscles respire anaerobically, and lactic acid builds up. Deep breaths afterwards repay the oxygen debt."],
  t9: ["Gregor Mendel studied thousands of pea plants in a monastery garden to work out the basic laws of inheritance.", "Each of your body cells carries two copies of most genes: one from your mother and one from your father."],
  t10: ["If you stretched out all the DNA in just one of your cells, it would be about 2 metres long!", "Much of the insulin used by people with diabetes is made by genetically modified bacteria carrying the human insulin gene."],
  t11: ["Hong Kong is small, but more than 200 kinds of butterflies have been recorded here.", "Chinese white dolphins living in Hong Kong waters are born dark grey and turn pink as they grow up."],
  t12: ["A big tree can lose hundreds of litres of water a day by transpiration.", "Some mangrove trees at Mai Po have roots that poke up out of the mud like snorkels, to get air in the waterlogged soil."],
  t8: ["Folds, villi and microvilli give your small intestine a surface area of about half a badminton court!", "Egg tarts and pineapple buns are yummy but high in fat and sugar. A balanced diet is about how often you eat them, not never."],
  t13: ["Your lungs contain around 300–500 million alveoli, giving a huge surface for gas exchange.", "Chemicals in cigarette smoke stop the cilia in your airways from beating, so mucus and dirt build up: that's the 'smoker's cough'."],
  t14: ["Your heart beats around 100,000 times every day without you thinking about it.", "A red blood cell lives about 120 days and has no nucleus, leaving more room for haemoglobin."],
  t15: ["A human egg cell is one of the largest cells in the body: about 0.1 mm across, just about visible to the naked eye.", "Bees and other insects pollinate many fruit trees, such as lychee and longan trees."],
  t16: ["Some nerve impulses travel at over 100 metres per second: faster than a racing car!", "Your pupils shrink in bright light by a reflex action. You don't have to think about it at all."],
  t17: ["On a humid Hong Kong summer day, sweat evaporates slowly, so it cools you less. That's why humid days feel extra hot.", "Insulin and glucagon from your pancreas keep your blood glucose level within a narrow range all day long."],
  t18: ["Every winter, tens of thousands of migratory birds visit Mai Po, including the endangered black-faced spoonbill.", "Red tides in Hong Kong waters are algal blooms, often linked to extra nutrients from sewage and farm waste."],
  t19: ["Dengue fever is spread by Aedes mosquitoes. Emptying stagnant water, like in flowerpot trays, stops them from breeding.", "Washing your hands with soap for 20 seconds removes many disease-causing microorganisms."]
};
const FACT_WHO = ["hachiware", "momonga", "kurimanju", "chiikawa", "usagi"];
function cheerLines() {
  const ni = nextRoomIndex(), out = [];
  if (S.current_streak > 1) out.push(["usagi", "happy", `🔥 ${S.current_streak} days in a row! Your chestnut rewards are ×${streakMult().toFixed(2).replace(/0$/, "")} right now. WAHOO!`]);
  else out.push(["chiikawa", "happy", "Every day you come back, your 🔥 streak grows and chestnut rewards go up (up to ×1.5)! 🥹"]);
  const nm = mistakeKeys().length; if (nm) out.push(["hachiware", "normal", `📕 ${nm} question${nm > 1 ? "s" : ""} waiting in your Mistake Notebook. Fixing just 3 today makes your brain stronger!`]);
  const nw = Object.keys(S.dict.missed).length; if (nw) out.push(["momonga", "happy", `🎧 ${nw} tricky word${nw > 1 ? "s" : ""} to practise in Word Dictation. I could spell them easily... probably. 💜`]);
  if (ni !== -1) out.push(["hachiware", "normal", `Next right step: <b>${esc(ROOMS[ni].name)}</b>. Just one stage. You've got this! 🌱`]);
  if (S.ill) out.push(["shisa", "normal", `🤒 Mochi is sick with <b>${esc(illById(S.ill.id).name)}</b>. Open the 🩺 medicine cabinet and pick the right treatment!`]);
  out.push(["chiikawa", "happy", esc(pick(DAILY_LIFE))]);
  if (S.coll.pending) out.push(["chiikawa", "sparkle", `🎁 You have ${S.coll.pending} capsule${S.coll.pending > 1 ? "s" : ""} to open! What's inside?!`]);
  out.push(["kurimanju", "happy", "Tired? A 5-minute Cell Rush or a Dictation round still counts. Small steps. *sip* 🍵"]);
  return out;
}
function factLine() {
  const ni = nextRoomIndex(), T = ni !== -1 && Math.random() < .5 ? TOPICS[ROOMS[ni].t] : pick(TOPICS);
  return [pick(FACT_WHO), "happy", `💡 <b>Did you know?</b> ${esc(pick(FACTS[T.id]))} <span class="small muted">(${T.icon} ${esc(T.name)})</span>`];
}
function chatCardHtml() {
  return `<section class="card chatcard" id="chatCard"><div id="chatLine">${(l => say(l[0], l[2], l[1]))(factLine())}</div>
    <div class="row"><button class="btn plain" id="chFact">💡 Fun fact</button><button class="btn plain" id="chCheer">💪 Cheer me on</button></div></section>`;
}
let chatTick = 0;
function wireChatCard() {
  const show = l => { const el = document.getElementById("chatLine"); if (!el) return; el.innerHTML = say(l[0], l[2], l[1]); el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); };
  document.getElementById("chFact").onclick = () => { SFX.tap(); show(factLine()); };
  document.getElementById("chCheer").onclick = () => { SFX.tap(); show(pick(cheerLines())); };
  clearInterval(wireChatCard.t);
  wireChatCard.t = setInterval(() => {
    if (!document.getElementById("chatCard")) { clearInterval(wireChatCard.t); return; }
    if (document.hidden || $modal.innerHTML) return;
    show(++chatTick % 2 ? pick(cheerLines()) : factLine());
  }, 20000);
}

/* 🎧 Word Dictation: hear the British pronunciation (or read the meaning) and spell the term. */
const DICT_N = 10;
const dictable = t => /^[A-Za-z][A-Za-z -]*$/.test(t) && normWord(t).length >= 4 && !/[A-Z]{2}/.test(t);
let TERM_INDEX = null;
function termIndex() {
  if (TERM_INDEX) return TERM_INDEX;
  TERM_INDEX = {};
  ROOMS.forEach(r => r.terms.forEach(([t, m]) => { if (dictable(t) && !TERM_INDEX[normWord(t)]) TERM_INDEX[normWord(t)] = { w: t, m, t: r.t }; }));
  return TERM_INDEX;
}
const topicWords = ti => Object.values(termIndex()).filter(x => x.t === ti);
const missedWords = () => Object.keys(S.dict.missed).map(k => termIndex()[k]).filter(Boolean);
function addMissedWord(w) { const k = normWord(w); if (!termIndex()[k]) return; S.dict.missed[k] = { n: ((S.dict.missed[k] || {}).n || 0) + 1, ok: 0 }; save(); }
function rightWord(w) { const k = normWord(w), m = S.dict.missed[k]; if (!m) return false; m.ok += 1; if (m.ok >= 2) { delete S.dict.missed[k]; return true; } return false; }
let DT = null;
function renderDictation(pre) {
  renderNav("play");
  stopRush(); MUSIC.setMode("calm"); stopTimer(); if (R) { clearTimeout(R.introT); clearTimeout(R.incT); } R = null; renderTools();
  const miss = missedWords(), ni = nextRoomIndex();
  const sel = pre || (DT && DT.src) || (miss.length ? "missed" : String(ni === -1 ? 0 : ROOMS[ni].t));
  const mode = (DT && DT.mode) || (TTS.ok ? "listen" : "meaning");
  DT = { src: sel, mode };
  const list = () => DT.src === "missed" ? missedWords() : topicWords(Number(DT.src));
  $app.innerHTML = `
    <section class="hero dict-hero">${starsBg()}
      <span class="kicker" style="color:#fff">${HERO_KICKER} · Word practice</span>
      <h1>🎧 Word Dictation</h1>
      <p class="sub">Hear it, spell it, own it. ${DICT_N} words a round · 2 tries each</p>
    </section>
    <section class="card">
      ${say("hachiware", TTS.ok ? "I'll say a biology word in a British accent. Type what you hear! Tap 🐢 to hear it slowly. British or American spelling are both fine. 🎧" : "Your browser can't play sounds for words, so let's use the meaning mode: read the meaning and spell the term! 📖", "normal", "hint")}
      <label class="small"><b>Words from</b><br><select class="name" id="dSrc">
        ${miss.length ? `<option value="missed" ${sel === "missed" ? "selected" : ""}>🎧 My missed words (${miss.length})</option>` : ""}
        ${TOPICS.map((T, ti) => `<option value="${ti}" ${sel === String(ti) ? "selected" : ""}>${T.icon} Topic ${T.no}: ${esc(T.name)}</option>`).join("")}</select></label>
      <div class="row" role="radiogroup" aria-label="Mode">
        <button class="btn ${mode === "listen" ? "blue" : "plain"}" id="dmListen" ${TTS.ok ? "" : "disabled"} aria-pressed="${mode === "listen"}">🔊 Listen &amp; spell</button>
        <button class="btn ${mode === "meaning" ? "blue" : "plain"}" id="dmMean" aria-pressed="${mode === "meaning"}">📖 Meaning → spell</button>
      </div>
      <details class="wlist"><summary>📋 Word list (<span id="dCount">${list().length}</span> words)</summary><table class="tterms"><tbody id="dList"></tbody></table></details>
      <div class="row"><button class="btn big" id="dStart">▶ Start dictation</button><button class="btn plain" id="dBack">🗺️ Map</button></div>
      <p class="small muted">Best round: ${S.dict.best}/${DICT_N} · Perfect rounds: ${S.stats.dictPerfect} · A perfect round wins a 🎁 capsule!</p>
    </section>`;
  window.scrollTo({ top: 0 });
  const fill = () => {
    const l = list();
    document.getElementById("dCount").textContent = l.length;
    document.getElementById("dList").innerHTML = l.map(x => `<tr><td><b>${esc(x.w)}</b> ${sayBtns(x.w)}</td><td>${esc(x.m)}</td></tr>`).join("") || `<tr><td class="muted">No words here yet.</td></tr>`;
  };
  fill();
  document.getElementById("dSrc").onchange = e => { DT.src = e.target.value; fill(); };
  const setMode = m => { DT.mode = m; document.getElementById("dmListen").className = `btn ${m === "listen" ? "blue" : "plain"}`; document.getElementById("dmMean").className = `btn ${m === "meaning" ? "blue" : "plain"}`; };
  document.getElementById("dmListen").onclick = () => { SFX.tap(); setMode("listen"); };
  document.getElementById("dmMean").onclick = () => { SFX.tap(); setMode("meaning"); };
  document.getElementById("dBack").onclick = () => { SFX.tap(); renderMap(); };
  document.getElementById("dStart").onclick = () => {
    SFX.init(); SFX.tap();
    const l = list(); if (!l.length) { toast("No words in this list yet!"); return; }
    Object.assign(DT, { words: shuffle(l).slice(0, DICT_N), i: 0, right: 0, missed: [] });
    dictWord();
  };
}
function dictWord() {
  renderNav(false);
  const x = DT.words[DT.i], listen = DT.mode === "listen";
  DT.tries = 0; DT.done = false; DT.hint = false;
  $app.innerHTML = `
    <section class="hero dict-hero">${starsBg()}
      <span class="kicker" style="color:#fff">🎧 Word Dictation · ${listen ? "Listen & spell" : "Meaning → spell"}</span>
      <h1>Word ${DT.i + 1} of ${DT.words.length}</h1>
      <div class="dprog">${DT.words.map((_, k) => `<i class="${k < DT.i ? (DT.missed.includes(DT.words[k]) ? "no" : "ok") : k === DT.i ? "cur" : ""}"></i>`).join("")}</div>
    </section>
    <section class="card dictcard">
      ${listen ? `<div class="row" style="justify-content:center"><button class="btn big blue" id="dPlay">🔊 Play the word</button><button class="btn plain" id="dSlow">🐢 Slowly</button></div>`
               : `<p class="dmean">“${esc(x.m)}”</p>`}
      <div class="sboxes" id="dBoxes" aria-hidden="true">${spellBoxes(x.w, "")}</div>
      <p class="small muted" id="dInfo">${countLetters(x.w)} letters · try 1 of 2</p>
      <div class="row"><input id="dIn" class="name" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Type the word"><button class="btn" id="dOk">Check ✓</button></div>
      <div id="dFb" aria-live="polite"></div>
      <div class="row"><button class="btn plain" id="dHint">💡 Hint</button><button class="btn plain" id="dQuit">End round</button></div>
    </section>`;
  window.scrollTo({ top: 0 });
  const inp = document.getElementById("dIn");
  if (listen) {
    document.getElementById("dPlay").onclick = () => { speak(x.w); inp.focus(); };
    document.getElementById("dSlow").onclick = () => { speak(x.w, true); inp.focus(); };
    setTimeout(() => speak(x.w), 350);
  }
  inp.oninput = () => { document.getElementById("dBoxes").innerHTML = spellBoxes(x.w, inp.value); };
  inp.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); DT.done ? dictNext() : check(); } };
  document.getElementById("dHint").onclick = () => {
    SFX.hint(); DT.hint = true;
    document.getElementById("dFb").innerHTML = say("hachiware", `It starts with “<b>${esc(x.w.slice(0, 3))}</b>…”${listen ? ` and means: <i>${esc(x.m)}</i>` : ""}`, "normal", "hint");
  };
  document.getElementById("dQuit").onclick = () => { SFX.tap(); dictEnd(); };
  const finish = ok => {
    DT.done = true; inp.disabled = true; document.getElementById("dOk").disabled = true;
    if (ok) { DT.right += 1; S.stats.spellRight += 1; const cleared = rightWord(x.w); if (cleared) toast("🎧 Cleared from your missed words! 🎉"); }
    else { DT.missed.push(x); addMissedWord(x.w); }
    save();
    document.getElementById("dFb").innerHTML = `<div class="fb ${ok ? "ok" : "no"}">${ok ? say(pick(["usagi", "chiikawa", "momonga"]), pick(["WAHOO!! Perfect spelling! 🐰", "We did it...! 🥹✨", "Correct! Almost as cute as me. 💜"]), "sparkle")
      : say("chiikawa", "Uuu... that one was tricky. 😭 We'll practise it again later!", "cry")}
      <p class="dword"><b>${esc(x.w)}</b> ${sayBtns(x.w)}</p><p class="small muted" style="text-align:center">${esc(x.m)}</p>
      <div class="row" style="justify-content:center"><button class="btn big" id="dNext">${DT.i + 1 < DT.words.length ? "Next word ▶" : "See results 🎉"}</button></div></div>`;
    document.getElementById("dNext").onclick = () => { SFX.tap(); dictNext(); };
    document.getElementById("dNext").focus();
  };
  const check = () => {
    if (!normWord(inp.value)) { toast("Type the word first ✏️"); return; }
    if (sameSpelling(inp.value, x.w)) { SFX.right(); confetti(24); finish(true); return; }
    DT.tries += 1; SFX.wrong();
    if (DT.tries >= 2) { finish(false); return; }
    document.getElementById("dInfo").textContent = `${countLetters(x.w)} letters · try 2 of 2`;
    document.getElementById("dFb").innerHTML = say("hachiware", soClose(inp.value, x.w) ? "🤏 <b>So close!</b> Just a letter or two off. Check each syllable and try once more!" : `Not quite. ${listen ? "Listen again (try 🐢) and" : "Read the meaning again and"} have one more go!`, "normal", "hint");
    inp.focus(); inp.select();
  };
  document.getElementById("dOk").onclick = check;
  inp.focus({ preventScroll: true });
}
function dictNext() { DT.i += 1; if (DT.i < DT.words.length) dictWord(); else dictEnd(); }
function dictEnd() {
  renderNav("play");
  const n = Math.min(DT.i + (DT.done ? 1 : 0), DT.words.length), perfect = n >= 8 && n === DT.words.length && DT.right === n;
  S.stats.dictRounds = (S.stats.dictRounds || 0) + (n ? 1 : 0);
  S.dict.best = Math.max(S.dict.best, DT.right);
  const coins = withStreak(DT.right); S.coins += coins;
  if (perfect) { S.stats.dictPerfect += 1; S.coll.pending += 1; }
  save(true); checkTrophies();
  activityDone({ mode: "dict", topic: DT.src === "missed" ? "missed" : "", stage: "Dictation", ans: n, cor: DT.right, wrong: DT.missed.map(x => x.w).join(", ") });
  if (DT.right) { SFX.fanfare(); confetti(perfect ? 160 : 60); }
  $app.innerHTML = `
    <section class="hero dict-hero">${starsBg()}
      <span class="kicker" style="color:#fff">🎧 Word Dictation · Round over</span>
      <h1>${perfect ? "🎉 Perfect round!" : `${DT.right} / ${n} spelled right`}</h1>
      <p class="sub"><span class="pill coinpill">+${coins} 🌰${multTag()}</span> ${perfect ? `<span class="pill rpill">🎁 +1 capsule</span>` : ""}</p>
    </section>
    <section class="card">
      ${perfect ? say("usagi", "WOOOO!!! Every single word! 🐰🎊", "sparkle") : DT.right >= n / 2 ? say("hachiware", "Nice work! The words you missed are saved in <b>My missed words</b>. Spell each one right twice to clear it. 🌱", "happy", "hint") : say("kurimanju", "Tricky words today. That's how brains grow. Listen to them once more below. 🍵", "happy")}
      ${DT.missed.length ? `<h3>Words to practise</h3><table class="tterms"><tbody>${DT.missed.map(x => `<tr><td><b>${esc(x.w)}</b> ${sayBtns(x.w)}</td><td>${esc(x.m)}</td></tr>`).join("")}</tbody></table>` : ""}
      <div class="row">${perfect ? `<button class="btn pink" id="dCap">🎁 Open capsule</button>` : ""}<button class="btn big" id="dAgain">🎧 Another round</button>${DT.missed.length ? `<button class="btn yellow" id="dMissed">Practise missed words</button>` : ""}<button class="btn plain" id="dMap">🗺️ Map</button></div>
    </section>`;
  window.scrollTo({ top: 0 });
  document.getElementById("dAgain").onclick = () => { SFX.tap(); renderDictation(); };
  document.getElementById("dMap").onclick = () => { SFX.tap(); renderMap(); };
  const dm = document.getElementById("dMissed"); if (dm) dm.onclick = () => { SFX.tap(); DT.src = "missed"; renderDictation("missed"); };
  const dc = document.getElementById("dCap"); if (dc) dc.onclick = () => { SFX.tap(); openCapsule(); };
}
