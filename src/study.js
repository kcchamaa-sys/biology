
/* ============================================================
   5g. 📖 Study mode: a calm series of questions for one stage (no escape room, no timer, no penalties).
   Wrong answers show the explanation and come back once at the end. Finishing the series completes the stage.
   Learning rewards: a right answer given too fast to have read the question is a "guess" (no mastery; 5+ guesses = 1★),
   and a short "Why?" check at the end asks for the reason behind 2 answers you got right.
   ============================================================ */
// Seconds needed to read a question before a right answer counts (multiple choice; +1 s with a picture)
const READ_SECS = p => p.type !== "mc" || p.gen ? 0 : Math.min(5, 2.5 + p.q.length / 120) + (p.svg ? 1 : 0);

/* ----- 🧭 Study planner: every topic is open. Students choose a topic (optionally one section) and a level:
   🌱 Easy (Bloom 1–2), 🌿 Medium (3–4) or 🔥 Hard (5–6). The game mixes the exercise for them: a weighted blend of
   Concepts, See it, Data and Investigate questions (plus at most 2 spellings at Easy), unseen and unmastered first,
   so each new exercise brings different questions. Level "all" is only used by the full section run. ----- */
const STUDY_LEVELS = { all: ["All levels", "🎚️", 1, 6, ""], easy: ["Easy", "🌱", 1, 2, "Key words, facts and definitions"], medium: ["Medium", "🌿", 3, 4, "Explain, apply and read data"], hard: ["Hard", "🔥", 5, 6, "Analyse, evaluate and investigate"] };
const STUDY_PICK = ["easy", "medium", "hard"], STUDY_N = 12;
// Share of each skill in a mixed exercise (smooth weighted round-robin; a skill with no questions left drops out)
const MIX_W = { concept: 5, data: 2, invest: 2, see: 2, word: 1 };
const studySel = () => { const d = { ti: 0, rid: null, skill: "mixed", lvl: "medium", n: STUDY_N }, s = Object.assign(d, S.study_sel || {});
  if (!TOPICS[s.ti]) s.ti = 0; if (s.rid && (!ROOMS[roomIndex(s.rid)] || ROOMS[roomIndex(s.rid)].t !== s.ti)) s.rid = null;
  if (!STUDY_PICK.includes(s.lvl)) s.lvl = "medium"; s.skill = "mixed"; s.n = STUDY_N; return s; };
const studyRooms = sel => sel.rid ? [ROOMS[roomIndex(sel.rid)]] : topicRooms(sel.ti);
// All questions in scope that match the skill and level (spelling pairs count once per term)
function studyPool(sel, skill = sel.skill, lvl = sel.lvl) {
  const [, , lo, hi] = STUDY_LEVELS[lvl], seenTerm = new Set();
  return studyRooms(sel).flatMap(r => r.pool).filter(p => {
    if (p.b < lo || p.b > hi) return false;
    if (skill !== "mixed" && p.skill !== skill) return false;
    if (p.gen) { const k = p.rid + termOf(p); if (seenTerm.has(k)) return false; seenTerm.add(k); }
    return true;
  });
}
// Blend skills by MIX_W, taking each skill's best-scored (unseen, unmastered) questions first
function mixBySkill(qs, n, score) {
  const by = {}; qs.forEach(p => (by[p.skill] = by[p.skill] || []).push(p));
  Object.values(by).forEach(a => a.sort((x, y) => score.get(x) - score.get(y)));
  const out = [], credit = {};
  while (out.length < n) {
    const live = Object.keys(by).filter(k => by[k].length); if (!live.length) break;
    let best = null; live.forEach(k => { credit[k] = (credit[k] || 0) + (MIX_W[k] || 1); if (!best || credit[k] > credit[best]) best = k; });
    credit[best] -= live.reduce((a, k) => a + (MIX_W[k] || 1), 0);
    out.push(by[best].shift());
  }
  return out;
}
// Pick the series: not-yet-mastered and not-recently-seen questions first, then climb from easy to hard
function buildStudySet(sel) {
  let qs = studyPool(sel);
  if (sel.skill === "mixed") { const sp = shuffle(qs.filter(p => p.gen)).slice(0, 2); qs = qs.filter(p => !p.gen).concat(sp); }
  const seen = new Set(studyRooms(sel).flatMap(r => (S.seen[r.id] || []).map(id => r.id + ":" + id)));
  const score = new Map(qs.map(p => [p, (S.mastered_puzzles.includes(`${p.rid}:${p.id}`) ? 2 : 0) + (seen.has(`${p.rid}:${p.id}`) ? 1 : 0) + Math.random() * .9]));
  const chosen = sel.skill === "mixed" && sel.lvl !== "all" ? mixBySkill(qs, sel.n, score)
    : qs.slice().sort((a, b) => score.get(a) - score.get(b)).slice(0, sel.n);
  studyRooms(sel).forEach(r => { const ids = chosen.filter(p => p.rid === r.id).map(p => p.id); if (ids.length) S.seen[r.id] = (S.seen[r.id] || []).concat(ids).slice(-45); });
  return shuffle(chosen).sort((a, b) => a.b - b.b);
}
const studyLabel = sel => { const T = TOPICS[sel.ti], lv = STUDY_LEVELS[sel.lvl];
  return `${sel.rid ? stageName(ROOMS[roomIndex(sel.rid)]) : `Topic ${T.no}: ${T.name}`} · ${lv[1]} ${lv[0]}${sel.skill === "mixed" ? "" : ` · ${SKILLS.find(k => k.id === sel.skill).name}`}`; };
const buildCount = sel => { const qs = studyPool(sel); return sel.skill === "mixed" ? qs.filter(p => !p.gen).length + Math.min(2, qs.filter(p => p.gen).length) : qs.length; };
function studyPlannerHtml() {
  const sel = studySel(), T = TOPICS[sel.ti], rs = topicRooms(sel.ti), part = T.p;
  const chip = (attr, v, on, inner) => `<button class="spchip ${on ? "on" : ""}" ${attr}="${v}" aria-pressed="${on}">${inner}</button>`;
  const pool = studyPool(sel).filter(p => !p.gen), avail = Math.min(sel.n, buildCount(sel));
  const mix = SKILLS.filter(k => k.id !== "word").map(k => [k, pool.filter(p => p.skill === k.id).length]).filter(([, n]) => n);
  return `<section class="card studyplan">
      <div class="row" style="justify-content:space-between"><h2 style="margin:0">📖 Study planner</h2><span class="pill">All topics open</span></div>
      ${modeSwitch()}
      <div class="spstep"><b class="sph">1 · Topic</b>
        <div class="tabs" role="tablist" aria-label="Curriculum parts">${PARTS.map((P, pi) => `<button class="tab" role="tab" aria-selected="${pi === part}" data-sppart="${pi}">Part ${esc(P.split(".")[0])}</button>`).join("")}</div>
        <div class="sptopics">${TOPICS.map((X, ti) => X.p !== part ? "" : `<button class="sptopic ${ti === sel.ti ? "on" : ""}" data-spt="${ti}" aria-pressed="${ti === sel.ti}"><span class="ticon" aria-hidden="true">${X.icon}</span><span><b>Topic ${X.no}</b><br><span class="small">${esc(X.name)}</span></span><span class="spm">${S.bio_mastery[X.id] || 0}%</span></button>`).join("")}</div>
        <div class="spchips" aria-label="Section">${chip("data-sps", "", !sel.rid, `📚 Whole topic`)}${rs.map(r => chip("data-sps", r.id, sel.rid === r.id, `${secNo(r)} ${esc(r.focus)}`)).join("")}</div></div>
      <div class="spstep"><b class="sph">2 · Level</b><div class="splvls">
        ${STUDY_PICK.map(id => { const [nm, ic, , , tip] = STUDY_LEVELS[id], n = buildCount(Object.assign({}, sel, { lvl: id })), on = sel.lvl === id;
          return `<button class="splvl lv-${id} ${on ? "on" : ""}" data-spl="${id}" aria-pressed="${on}" ${n < 3 ? "disabled" : ""}><span class="spli" aria-hidden="true">${ic}</span><b>${nm}</b><span class="small">${tip}</span><span class="spn">${n} Q</span></button>`; }).join("")}</div></div>
      <p class="small muted" style="margin:0">🎲 Each exercise is a fresh mix of ${STUDY_N} questions${mix.length ? `: ${mix.map(([k, n]) => `${k.icon} ${k.name} ${n}`).join(" · ")}` : ""}. New questions come first, so come back for a different set!</p>
      ${sel.rid ? `<p class="small" style="margin:0">✅ Want to finish this section? <button class="linkbtn" id="spFull">Do the full section run</button> (all levels).</p>` : ""}
      <div class="spgo"><span class="small"><b>${esc(studyLabel(sel))}</b><br>${avail >= 3 ? `${avail} question${avail === 1 ? "" : "s"} · mixed skills${avail < sel.n ? " (all there are at this level)" : ""}` : "Not enough questions here: try another level or the whole topic."}</span>
        <button class="btn big" id="spStart" ${avail >= 3 ? "" : "disabled"}>▶ Start exercise</button></div>
    </section>`;
}
function wireStudyPlanner() {
  const sel = studySel(), set = ch => { S.study_sel = Object.assign(sel, ch); save(); SFX.tap(); renderMap(); };
  wireModeSwitch($app);
  $app.querySelectorAll("[data-sppart]").forEach(b => b.onclick = () => { const ti = TOPICS.findIndex(T => T.p === Number(b.dataset.sppart)); set({ ti, rid: null }); });
  $app.querySelectorAll("[data-spt]").forEach(b => b.onclick = () => set({ ti: Number(b.dataset.spt), rid: null }));
  $app.querySelectorAll("[data-sps]").forEach(b => b.onclick = () => set({ rid: b.dataset.sps || null }));
  $app.querySelectorAll("[data-spl]").forEach(b => b.onclick = () => set({ lvl: b.dataset.spl }));
  const fu = document.getElementById("spFull"); if (fu) fu.onclick = () => { SFX.init(); SFX.tap(); startStudy(sel.rid); };
  const go = document.getElementById("spStart"); if (go) go.onclick = () => { SFX.init(); SFX.tap(); runStudy(studySel()); };
}
// Old entry point (Home "Study it", stage buttons): a full mixed series of one section, which also finishes that section
function startStudy(id, sel) {
  const room = ROOMS[roomIndex(id)];
  runStudy(sel || { ti: room.t, rid: room.id, skill: "mixed", lvl: "all", n: 15 });
}
function runStudy(sel) {
  const rooms = studyRooms(sel), room = rooms[0];
  stopRush(); stopTimer(); if (R) { clearTimeout(R.introT); clearTimeout(R.incT); } R = null;
  renderNav(false); renderTools(); MUSIC.setMode("calm"); closeModal();
  S.current_room = room.id; save();
  const qs = buildStudySet(sel);
  if (!qs.length) { toast("No questions match that choice yet."); homeTab = "stages"; return renderMap(); }
  const full = !!sel.rid && sel.skill === "mixed" && sel.lvl === "all";
  const ST = { sel, full, room, rooms, pool: rooms.flatMap(r => r.pool), queue: qs.map(p => ({ p, retry: false })), at: 0, total: qs.length, firsts: 0, right: 0, retried: 0, guesses: 0, firstIds: [], wrongIds: [], start: new Date().toISOString(), t0: Date.now() };
  const T = TOPICS[room.t], head = sel.rid ? stageName(room) : `Topic ${T.no}: ${T.name}`;
  const focus = `${STUDY_LEVELS[sel.lvl][1]} ${STUDY_LEVELS[sel.lvl][0]} · ${sel.skill === "mixed" ? "🎲 mixed skills" : (k => `${k.icon} ${k.name}`)(SKILLS.find(k => k.id === sel.skill))}`;
  const next = () => {
    if (ST.at >= ST.queue.length) return whyCheck(ST);
    const { p, retry } = ST.queue[ST.at], done = ST.at, n = ST.queue.length, qr = ROOMS[roomIndex(p.rid)];
    $app.innerHTML = `
      <section class="rushhead studyhead"><div class="status"><div class="av ${frameCls()}">${avatar("chiikawa", "normal")}</div>
        <div style="min-width:0"><div class="rtopic" style="color:var(--yellow)">📖 Study · ${T.icon} Topic ${T.no}</div><div class="rt">${esc(head)}</div>
        <div class="small" style="color:#EDE6F7">${focus}${sel.rid ? "" : ` · from ${esc(stageName(qr))}`}</div></div></div>
        <div style="display:grid;justify-items:end;gap:6px"><span class="combo">${Math.min(done + 1, n)} / ${n}</span><span class="small" style="color:#EDE6F7">✅ ${ST.firsts} first try</span></div></section>
      <div class="studybar" aria-hidden="true"><i style="width:${Math.round(100 * done / n)}%"></i></div>
      <section class="card">
        <span class="kicker">${retry ? "🔁 Second chance · " : ""}Question ${done + 1} ${diffChip(p.b)} ${fmtChip(p)} ${bmBtn(qr.id, p.id)}</span>
        <p class="q">${esc(p.q)}</p>${p.svg ? `<div class="diagram-box">${DIAGRAMS[p.svg]}</div>` : ""}${qStim(p)}
        <div id="stAns"></div>
        <div class="row simbtns"><button class="btn blue" id="stHint">💡 Hint</button><button class="btn plain" id="stJ">📓 Notes</button><button class="btn plain" id="stQuit">✕ Stop</button></div>
        <div id="stFb"></div></section>`;
    let hinted = false;
    document.getElementById("stHint").onclick = () => { SFX.hint(); hinted = true; document.getElementById("stFb").innerHTML = say("chiikawa", `💡 ${esc(p.hint)}`, "normal", "hint"); };
    document.getElementById("stJ").onclick = () => { SFX.tap(); openJournal(qr.id, termsIn(qr, p)); };
    document.getElementById("stQuit").onclick = () => { SFX.tap(); if (ST.at) activityDone({ mode: "study", room, done: false, ans: ST.at, cor: ST.firsts, secs: Math.round((Date.now() - ST.t0) / 1000), start: ST.start, wrong: ST.wrongIds.join(" ") }); homeTab = "stages"; renderMap(); };
    const shownAt = Date.now();
    miniQuiz(document.getElementById("stAns"), p, ok => {
      const quick = ok && (Date.now() - shownAt) / 1000 < READ_SECS(p);
      if (quick) ST.guesses++;
      const pid = `${qr.id}:${p.id}`, first = ok && !retry && !hinted && !quick, qc = answerCoins(pid, first);
      if (ok) {
        ST.right++; S.stats.correct += 1; if (first) { ST.firsts++; ST.firstIds.push(pid); if (!S.mastered_puzzles.includes(pid)) S.mastered_puzzles.push(pid); }
        if (p.type === "spell" || p.gen) S.stats.spellRight += 1; if (p.graph && first) S.stats.graphFirst += 1;
        S.stats.run = first ? S.stats.run + 1 : 0; S.stats.bestRun = Math.max(S.stats.bestRun, S.stats.run);
        noteRight(qr.id, p.id, first); SFX.right(); if (first) confetti(18); if (qc) setTimeout(() => gainCoins(qc, "", document.querySelector("#stAns .choice.right, #stAns")), 50);
      } else {
        S.stats.run = 0; noteMistake(qr.id, p.id); SFX.wrong(); if (!ST.wrongIds.includes(pid)) ST.wrongIds.push(pid);
        if (!retry) { ST.queue.push({ p, retry: true }); ST.retried++; }
      }
      recomputeMastery(); save();
      const [w, m, t] = ok ? (quick ? ["chiikawa", "normal", "⚡ Whoa, that was fast! Right, but did you read it all? Fast guesses don't count for mastery. 👀"] : first ? pick(REACT.right) : ["chiikawa", "happy", "Phew... got it! 🥹"]) : ["chiikawa", "cry", retry ? "Uu... still tricky. Let's read it together. 📖" : "Not quite! Let's read why. It will come back once at the end. 🌱"];
      document.getElementById("stFb").innerHTML = `<div class="fb ${ok ? "ok" : "no"}">${say(w, t, m)}<p>${esc(p.explain)}</p>${trapsHtml(p)}${p.tip ? `<p class="tip"><b>📝 Top tip:</b> ${esc(p.tip)}</p>` : ""}
        <div class="row"><button class="btn big" id="stNext">${ST.at + 1 < ST.queue.length ? "Next →" : "Finish 🎉"}</button></div></div>`;
      const nb = document.getElementById("stNext"); nb.onclick = () => { SFX.tap(); ST.at++; next(); window.scrollTo({ top: 0 }); }; nb.focus({ preventScroll: true });
      setTimeout(checkTrophies, 800);
    });
    window.scrollTo({ top: 0 });
  };
  next();
}
// 🤔 "Why?" check: pick the right explanation for 2 questions answered right first try. Right = +5 🌰; wrong = notebook.
function whyCheck(ST) {
  const pool = ST.pool.filter(p => p.type === "mc" && !p.gen && !hasStim(p) && p.explain && p.explain.length > 30), key = p => `${p.rid}:${p.id}`;
  const qs = shuffle(pool.filter(p => ST.firstIds.includes(key(p)))).slice(0, 2);
  ST.why = { right: 0, n: qs.length };
  if (qs.length === 0 || pool.length < 3) return finishStudy(ST);
  let i = 0;
  const step = () => {
    if (i >= qs.length) return finishStudy(ST);
    const p = qs[i], others = shuffle(pool.filter(x => key(x) !== key(p) && x.explain !== p.explain)).slice(0, 2);
    const opts = shuffle([p, ...others]);
    $app.innerHTML = `<section class="card whycard">
      <span class="kicker">🤔 Why? check · ${i + 1} of ${qs.length}</span>
      ${say("chiikawa", "You got this one right. Now show you know <b>why</b>! Pick the explanation that matches.", "normal", "hint")}
      <div class="whyq"><p class="q" style="margin:0">${esc(p.q)}</p><p style="margin:6px 0 0"><b>Answer:</b> ${esc(p.choices[p.answer])}</p></div>
      <div class="choices">${opts.map((x, n) => `<button class="choice" data-w="${key(x)}"><b>${"ABC"[n]}</b><span>${esc(x.explain)}</span></button>`).join("")}</div>
      <div id="whyFb"></div></section>`;
    $app.querySelectorAll("[data-w]").forEach(b => b.onclick = () => {
      const ok = b.dataset.w === key(p);
      $app.querySelectorAll("[data-w]").forEach(x => { x.disabled = true; if (x.dataset.w === key(p)) x.classList.add("right"); });
      if (ok) { ST.why.right++; gainCoins(5, "", b); SFX.right(); } else { b.classList.add("wrong"); SFX.wrong(); noteMistake(p.rid, p.id); }
      save();
      document.getElementById("whyFb").innerHTML = `<div class="fb ${ok ? "ok" : "no"}">${ok ? say("chiikawa", "Yes! You really understand it! +5 🌰", "happy") : say("chiikawa", "Uu... the answer was right but the reason was tricky. It's in your 📕 Mistake Notebook now, so we can practise it. 🌱", "cry")}
        <div class="row"><button class="btn big" id="whyNext">${i + 1 < qs.length ? "Next →" : "See results 🎉"}</button></div></div>`;
      const nb = document.getElementById("whyNext"); nb.onclick = () => { SFX.tap(); i++; step(); window.scrollTo({ top: 0 }); }; nb.focus({ preventScroll: true });
    });
    window.scrollTo({ top: 0 });
  };
  step();
}
function finishStudy(ST) {
  if (!ST.full) return finishFocusedStudy(ST);
  const { room } = ST, T = TOPICS[room.t], first = !S.completed_rooms.includes(room.id);
  if (first) { S.completed_rooms.push(room.id); S.inventory.push(room.item); }
  const topicDone = first && stagesDone(room.t) === topicRooms(room.t).length && !S.chiikawa_badges.includes(T.badge);
  if (topicDone) S.chiikawa_badges.push(T.badge);
  const n = ST.firsts, guessy = ST.guesses >= 5, stars = guessy ? 1 : n >= 13 ? 3 : n >= 9 ? 2 : 1;
  S.room_stars[room.id] = Math.max(S.room_stars[room.id] || 0, stars);
  if (!first) S.stats.replays += 1;
  const revise = !first && S.last_revise_day !== today(); if (revise) S.last_revise_day = today();
  const earned = withStreak(first ? (room.boss ? 50 : 30) : revise ? 25 : 10); S.coins += earned;
  const caps = first ? (room.boss ? 2 : 1) : Math.random() < .4 ? 1 : 0; S.coll.pending += caps;
  S.stats.studyClears = (S.stats.studyClears || 0) + 1;
  if (new Date().getHours() >= 21) S.stats.night += 1;
  const gotSick = maybeGetSick(.08);
  S.room_run[room.id] = freshRun(); S.room_progress[room.id] = [];
  const ni = nextRoomIndex(); S.current_room = ni === -1 ? room.id : ROOMS[ni].id; const nxt = ni === -1 ? null : ROOMS[ni];
  recomputeMastery(); save(true); SFX.fanfare(); confetti(topicDone ? 240 : 150);
  activityDone({ mode: "study", room, done: true, cleared: true, fresh: first, ans: ST.total, cor: ST.firsts, stars, secs: Math.round((Date.now() - ST.t0) / 1000), start: ST.start, ids: ST.queue.map(x => x.p.id).join(" "), wrong: ST.wrongIds.join(" ") });
  renderNav(false);
  $app.innerHTML = `<section class="card">
    <span class="kicker">📖 Study complete · ${esc(stageLabel(room))}</span>
    <h2>🎉 You studied ${esc(stageName(room))}!</h2>
    <div class="cast" style="margin:0">${["chiikawa"].map(w => `<div class="fig" style="width:90px">${figure(w, w === "chiikawa" ? "sparkle" : "happy")}</div>`).join("")}</div>
    <div class="row" style="justify-content:center;font-size:1.8rem" aria-label="${stars} / 3 ★">${starStr(stars)}</div>
    <p style="text-align:center"><b>${ST.firsts}/${ST.total}</b> right first try${ST.retried ? ` · 🔁 ${ST.retried} second chance${ST.retried > 1 ? "s" : ""}` : ""}${ST.why && ST.why.n ? ` · 🤔 Why? <b>${ST.why.right}/${ST.why.n}</b>${ST.why.right ? ` (+${5 * ST.why.right} 🌰)` : ""}` : ""}</p>
    ${guessy ? `<div class="rules">⚡ <b>Guess alert:</b> ${ST.guesses} answers came faster than anyone can read the question, so this series is capped at 1★. Slow down and read; the stars will come! 🌱</div>` : ""}
    <p style="text-align:center"><span class="pill coinpill">+${earned} 🌰${revise ? " · 📚 daily revision bonus" : ""}${multTag()}</span>${caps ? ` <span class="pill rpill">🎁 +${caps} capsule${caps > 1 ? "s" : ""}</span>` : ""}</p>
    ${topicDone ? say("chiikawa", `TOPIC ${T.no} CLEARED! You earned <b>${esc(T.badge)}</b>! 💜🥹`, "sparkle") : first ? say("chiikawa", `You earned <b>${esc(room.item)}</b>! 💜`, "happy") : say("chiikawa", "Revision complete. Practice makes the brain strong. 🍵", "happy")}
    ${gotSick ? say("chiikawa", "Achoo...! I don't feel so good... 🤒 Can we visit the clinic on the Home screen?", "sick") : ""}
    <section class="card cream jsec"><h3>📖 Textbook recap: ${esc(room.focus)}</h3><ul>${room.notes.map(x => `<li>${x}</li>`).join("")}</ul></section>
    <div class="row">${caps ? `<button class="btn pink" id="sdCap">🎁 Open capsule</button>` : ""}${nxt ? `<button class="btn big" id="sdNext">▶ Next stage</button>` : ""}<button class="btn plain" id="sdAgain">🔁 Study again</button><button class="btn plain" id="sdHome">🏠 Home</button></div>
  </section>`;
  const sc = document.getElementById("sdCap"); if (sc) sc.onclick = () => { SFX.tap(); homeTab = "home"; renderMap(); openCapsule(); };
  const sn = document.getElementById("sdNext"); if (sn) sn.onclick = () => { SFX.tap(); enterRoom(nxt.id); };
  document.getElementById("sdAgain").onclick = () => { SFX.tap(); startStudy(room.id); };
  document.getElementById("sdHome").onclick = () => { SFX.tap(); homeTab = "home"; renderMap(); };
  window.scrollTo({ top: 0 }); setTimeout(checkTrophies, 1500);
}

// A focused series (one skill, one level, or a whole topic): mastery, coins and the streak, but it doesn't finish a section
function finishFocusedStudy(ST) {
  const { room, sel } = ST, T = TOPICS[room.t];
  const guessy = ST.guesses >= 5, stars = guessy ? 1 : ST.firsts >= ST.total * .85 ? 3 : ST.firsts >= ST.total * .6 ? 2 : 1;
  const earned = withStreak(8 + Math.round(ST.firsts / 2)); S.coins += earned;
  const caps = Math.random() < .3 ? 1 : 0; S.coll.pending += caps;
  S.stats.studyClears = (S.stats.studyClears || 0) + 1; if (new Date().getHours() >= 21) S.stats.night += 1;
  recomputeMastery(); save(true); SFX.fanfare(); confetti(110);
  activityDone({ mode: "study", room, done: true, ans: ST.total, cor: ST.firsts, stars, secs: Math.round((Date.now() - ST.t0) / 1000), start: ST.start,
    stage: `${room.id} ${studyLabel(sel)}`.slice(0, 60), ids: ST.queue.map(x => x.p.id).join(" "), wrong: ST.wrongIds.join(" ") });
  renderNav(false);
  const weak = ST.wrongIds.length, li = STUDY_PICK.indexOf(sel.lvl), upLvl = li >= 0 && li < 2 && buildCount(Object.assign({}, sel, { lvl: STUDY_PICK[li + 1] })) >= 3 ? STUDY_PICK[li + 1] : null;
  $app.innerHTML = `<section class="card">
    <span class="kicker">📖 Study complete · Topic ${T.no}</span>
    <h2>🎉 ${esc(studyLabel(sel))}</h2>
    <div class="cast" style="margin:0"><div class="fig" style="width:90px">${figure("chiikawa", "sparkle")}</div></div>
    <div class="row" style="justify-content:center;font-size:1.8rem" aria-label="${stars} / 3 ★">${starStr(stars)}</div>
    <p style="text-align:center"><b>${ST.firsts}/${ST.total}</b> right first try${ST.retried ? ` · 🔁 ${ST.retried} second chance${ST.retried > 1 ? "s" : ""}` : ""}${ST.why && ST.why.n ? ` · 🤔 Why? <b>${ST.why.right}/${ST.why.n}</b>` : ""} · 📚 Topic mastery <b>${S.bio_mastery[T.id] || 0}%</b></p>
    ${guessy ? `<div class="rules">⚡ <b>Guess alert:</b> ${ST.guesses} answers came faster than anyone can read the question, so this series is capped at 1★.</div>` : ""}
    <p style="text-align:center"><span class="pill coinpill">+${earned} 🌰${multTag()}</span>${caps ? ` <span class="pill rpill">🎁 +1 capsule</span>` : ""}</p>
    ${say("chiikawa", weak ? `${weak} question${weak > 1 ? "s" : ""} went into your 📕 Mistake Notebook. Fixing them is the fastest way to level up! 💪` : upLvl ? `Flawless! Ready to try the <b>${STUDY_LEVELS[upLvl][1]} ${STUDY_LEVELS[upLvl][0]}</b> level? ✨` : sel.lvl === "hard" ? "Hard level, conquered. You're a real Keeper of the Codex! 👑" : "Flawless! Try a new mix or another topic. ✨", "happy")}
    <div class="row">${caps ? `<button class="btn pink" id="sfCap">🎁 Open capsule</button>` : ""}<button class="btn big" id="sfAgain">🎲 New mix</button>${upLvl ? `<button class="btn yellow" id="sfUp">${STUDY_LEVELS[upLvl][1]} Try ${STUDY_LEVELS[upLvl][0]}</button>` : ""}<button class="btn plain" id="sfPlan">🧭 Planner</button></div>
  </section>`;
  const sc = document.getElementById("sfCap"); if (sc) sc.onclick = () => { SFX.tap(); homeTab = "home"; renderMap(); openCapsule(); };
  document.getElementById("sfAgain").onclick = () => { SFX.tap(); runStudy(sel); };
  const su = document.getElementById("sfUp"); if (su) su.onclick = () => { SFX.tap(); const h = Object.assign({}, sel, { lvl: upLvl }); S.study_sel = h; save(); runStudy(h); };
  document.getElementById("sfPlan").onclick = () => { SFX.tap(); homeTab = "stages"; renderMap(); };
  window.scrollTo({ top: 0 }); setTimeout(checkTrophies, 1500);
}
