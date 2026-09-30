
/* ============================================================
   5g. 📖 Study mode: a calm series of questions for one stage (no escape room, no timer, no penalties).
   Wrong answers show the explanation and come back once at the end. Finishing the series completes the stage.
   ============================================================ */
function startStudy(id) {
  const room = ROOMS[roomIndex(id)];
  stopRush(); stopTimer(); if (R) { clearTimeout(R.introT); clearTimeout(R.incT); } R = null;
  renderNav(false); renderTools(); MUSIC.setMode("calm"); closeModal();
  S.current_room = room.id; save();
  const qs = pickRun(room).map(qid => room.pool.find(p => p.id === qid)).filter(Boolean);
  const ST = { room, queue: qs.map(p => ({ p, retry: false })), at: 0, total: qs.length, firsts: 0, right: 0, retried: 0 };
  const T = TOPICS[room.t];
  const next = () => {
    if (ST.at >= ST.queue.length) return finishStudy(ST);
    const { p, retry } = ST.queue[ST.at], done = ST.at, n = ST.queue.length;
    $app.innerHTML = `
      <section class="rushhead studyhead"><div class="status"><div class="av ${frameCls()}">${avatar("chiikawa", "normal")}</div>
        <div style="min-width:0"><div class="rtopic" style="color:var(--yellow)">📖 Study · ${T.icon} Topic ${T.no}</div><div class="rt">${esc(room.name)}</div>
        <div class="small" style="color:#EDE6F7">${room.boss ? "⚔️ Boss stage" : `Stage ${room.s}`} · ${esc(room.focus)}</div></div></div>
        <div style="display:grid;justify-items:end;gap:6px"><span class="combo">${Math.min(done + 1, n)} / ${n}</span><span class="small" style="color:#EDE6F7">✅ ${ST.firsts} first try</span></div></section>
      <div class="studybar" aria-hidden="true"><i style="width:${Math.round(100 * done / n)}%"></i></div>
      <section class="card">
        <span class="kicker">${retry ? "🔁 Second chance · " : ""}Question ${done + 1} ${diffChip(p.b)}</span>
        <p class="q">${esc(p.q)}</p>${p.svg ? `<div class="diagram-box">${DIAGRAMS[p.svg]}</div>` : ""}
        <div id="stAns"></div>
        <div class="row simbtns"><button class="btn blue" id="stHint">💡 Hint</button><button class="btn plain" id="stJ">📓 Notes</button><button class="btn plain" id="stQuit">✕ Stop</button></div>
        <div id="stFb"></div></section>`;
    let hinted = false;
    document.getElementById("stHint").onclick = () => { SFX.hint(); hinted = true; document.getElementById("stFb").innerHTML = say("hachiware", `💡 ${esc(p.hint)}`, "normal", "hint"); };
    document.getElementById("stJ").onclick = () => { SFX.tap(); openJournal(room.id, termsIn(room, p)); };
    document.getElementById("stQuit").onclick = () => { SFX.tap(); homeTab = "home"; renderMap(); };
    miniQuiz(document.getElementById("stAns"), p, ok => {
      const pid = `${room.id}:${p.id}`, first = ok && !retry && !hinted;
      if (ok) {
        ST.right++; S.stats.correct += 1; if (first) { ST.firsts++; if (!S.mastered_puzzles.includes(pid)) S.mastered_puzzles.push(pid); }
        if (p.type === "spell" || p.gen) S.stats.spellRight += 1; if (p.graph && first) S.stats.graphFirst += 1;
        S.stats.run = first ? S.stats.run + 1 : 0; S.stats.bestRun = Math.max(S.stats.bestRun, S.stats.run);
        noteRight(room.id, p.id, first); SFX.right(); if (first) confetti(18);
      } else {
        S.stats.run = 0; noteMistake(room.id, p.id); SFX.wrong();
        if (!retry) { ST.queue.push({ p, retry: true }); ST.retried++; }
      }
      recomputeMastery(); save();
      const [w, m, t] = ok ? (first ? pick(REACT.right) : ["chiikawa", "happy", "Phew... got it! 🥹"]) : ["chiikawa", "cry", retry ? "Uu... still tricky. Let's read it together. 📖" : "Not quite! Let's read why. It will come back once at the end. 🌱"];
      document.getElementById("stFb").innerHTML = `<div class="fb ${ok ? "ok" : "no"}">${say(w, t, m)}<p>${esc(p.explain)}</p>${p.tip ? `<p class="tip"><b>📝 Top tip:</b> ${esc(p.tip)}</p>` : ""}
        <div class="row"><button class="btn big" id="stNext">${ST.at + 1 < ST.queue.length ? "Next →" : "Finish 🎉"}</button></div></div>`;
      const nb = document.getElementById("stNext"); nb.onclick = () => { SFX.tap(); ST.at++; next(); window.scrollTo({ top: 0 }); }; nb.focus({ preventScroll: true });
      setTimeout(checkTrophies, 800);
    });
    window.scrollTo({ top: 0 });
  };
  next();
}
function finishStudy(ST) {
  const { room } = ST, T = TOPICS[room.t], first = !S.completed_rooms.includes(room.id);
  if (first) { S.completed_rooms.push(room.id); S.inventory.push(room.item); }
  const topicDone = first && stagesDone(room.t) === topicRooms(room.t).length && !S.chiikawa_badges.includes(T.badge);
  if (topicDone) S.chiikawa_badges.push(T.badge);
  const n = ST.firsts, stars = n >= 13 ? 3 : n >= 9 ? 2 : 1;
  S.room_stars[room.id] = Math.max(S.room_stars[room.id] || 0, stars);
  if (!first) S.stats.replays += 1;
  const revise = !first && S.last_revise_day !== today(); if (revise) S.last_revise_day = today();
  const earned = withStreak(first ? (room.boss ? 25 : 15) : revise ? 20 : 5); S.coins += earned;
  const caps = first ? (room.boss ? 2 : 1) : Math.random() < .4 ? 1 : 0; S.coll.pending += caps;
  S.stats.studyClears = (S.stats.studyClears || 0) + 1;
  if (new Date().getHours() >= 21) S.stats.night += 1;
  const gotSick = maybeGetSick(.12);
  S.room_run[room.id] = freshRun(); S.room_progress[room.id] = [];
  const ni = nextRoomIndex(); S.current_room = ni === -1 ? room.id : ROOMS[ni].id; const nxt = ni === -1 ? null : ROOMS[ni];
  recomputeMastery(); save(true); SFX.fanfare(); confetti(topicDone ? 240 : 150);
  renderNav(false);
  $app.innerHTML = `<section class="card">
    <span class="kicker">📖 Study complete · ${esc(stageLabel(room))}</span>
    <h2>🎉 You studied ${esc(room.name)}!</h2>
    <div class="cast" style="margin:0">${["usagi", "chiikawa", "hachiware"].map(w => `<div class="fig" style="width:90px">${figure(w, w === "chiikawa" ? "sparkle" : "happy")}</div>`).join("")}</div>
    <div class="row" style="justify-content:center;font-size:1.8rem" aria-label="${stars} / 3 ★">${starStr(stars)}</div>
    <p style="text-align:center"><b>${ST.firsts}/${ST.total}</b> right first try${ST.retried ? ` · 🔁 ${ST.retried} second chance${ST.retried > 1 ? "s" : ""}` : ""}</p>
    <p style="text-align:center"><span class="pill coinpill">+${earned} 🌰${revise ? " · 📚 daily revision bonus" : ""}${multTag()}</span>${caps ? ` <span class="pill rpill">🎁 +${caps} capsule${caps > 1 ? "s" : ""}</span>` : ""}</p>
    ${topicDone ? say("momonga", `TOPIC ${T.no} CLEARED! You earned <b>${esc(T.badge)}</b>! 💜🥹`, "sparkle") : first ? say("momonga", `You earned <b>${esc(room.item)}</b>! 💜`, "happy") : say("kurimanju", "Revision complete. Practice makes the brain strong. 🍵", "happy")}
    ${gotSick ? say("chiikawa", "Achoo...! I don't feel so good... 🤒 Can we visit Dr Koma on the Home screen?", "sick") : ""}
    <section class="card cream jsec"><h3>📖 Textbook recap: ${esc(room.focus)}</h3><ul>${room.notes.map(x => `<li>${x}</li>`).join("")}</ul></section>
    <div class="row">${caps ? `<button class="btn pink" id="sdCap">🎁 Open capsule</button>` : ""}${nxt ? `<button class="btn big" id="sdNext">▶ Next stage</button>` : ""}<button class="btn plain" id="sdAgain">🔁 Study again</button><button class="btn plain" id="sdHome">🏠 Home</button></div>
  </section>`;
  const sc = document.getElementById("sdCap"); if (sc) sc.onclick = () => { SFX.tap(); homeTab = "home"; renderMap(); openCapsule(); };
  const sn = document.getElementById("sdNext"); if (sn) sn.onclick = () => { SFX.tap(); enterRoom(nxt.id); };
  document.getElementById("sdAgain").onclick = () => { SFX.tap(); startStudy(room.id); };
  document.getElementById("sdHome").onclick = () => { SFX.tap(); homeTab = "home"; renderMap(); };
  window.scrollTo({ top: 0 }); setTimeout(checkTrophies, 1500); lbSubmit(true);
}
