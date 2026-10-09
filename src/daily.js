
/* ============================================================
   5h. Daily life: 🔥 study streak with ❄️ Streak Freezes, the streak-risk reminder,
   📅 one daily mission, 💚 health tips by time of day, and one hook for every finished activity.
   The streak now grows on days you STUDY (finish any activity), not just days you open the game.
   ============================================================ */
const FREEZE_MAX = 3, FREEZE_PRICE = 150;
const STREAK_MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200];
const monthKey = () => today().slice(0, 7);
function shiftDay(s, n) { const [y, m, d] = s.split("-").map(Number), x = new Date(y, m - 1, d + n); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; }
const studiedToday = () => S.last_study_day === today();

// Called on every launch (and new day): monthly freeze refill, then cover missed days with freezes.
function streakCheck() {
  const t = today(), notes = [];
  if (S.freeze_month !== monthKey()) {
    if (S.freeze_month && S.streak_shields < FREEZE_MAX) { S.streak_shields += 1; notes.push("❄️ New month: +1 free Streak Freeze!"); }
    S.freeze_month = monthKey();
  }
  const last = S.last_study_day;
  if (last && S.current_streak > 0) {
    const missed = dayNum(t) - dayNum(last) - 1;
    if (missed > 0) {
      if (S.streak_shields >= missed) {
        S.streak_shields -= missed;
        for (let k = 1; k <= missed; k++) S.frozen_days.push(shiftDay(last, k));
        S.last_study_day = shiftDay(t, -1); S.freeze_used = { day: t, n: missed };
        notes.push(`❄️ ${missed} Streak Freeze${missed > 1 ? "s" : ""} kept your ${S.current_streak}-day streak safe! Study today to keep it growing.`);
      } else {
        const lost = S.current_streak; S.current_streak = 0;
        notes.push(`🌱 Welcome back! Your ${lost}-day streak melted while you were away. Finish one activity today to start a new one.`);
      }
    }
  }
  S.frozen_days = S.frozen_days.filter(d => dayNum(t) - dayNum(d) < 14);
  return notes.join(" ");
}
// The first finished activity of the day grows the streak.
function markStudied() {
  const t = today(); if (S.last_study_day === t) return false;
  const gap = S.last_study_day ? dayNum(t) - dayNum(S.last_study_day) : 99;
  const prev = gap === 1 ? S.current_streak : 0;
  S.current_streak = gap === 1 && S.current_streak > 0 ? S.current_streak + 1 : 1;
  S.last_study_day = t; S.longest_streak = Math.max(S.longest_streak || 0, S.current_streak);
  S.study_days = S.study_days.filter(d => dayNum(t) - dayNum(d) < 14).concat(t);
  const n = S.current_streak, sc = streakCapsuleFor(n), after = [];
  if (sc) { S.coll.pending += sc; after.push(() => toast(`🎁 Streak reward: +${sc} capsule${sc > 1 ? "s" : ""} for day ${n}!`)); }
  // The full-screen streak ceremony plays once, after the result screen has appeared.
  setTimeout(() => streakCeremony(n, prev, after), 900);
  return true;
}
function buyFreeze() {
  if (S.coins < FREEZE_PRICE || S.streak_shields >= FREEZE_MAX) return;
  S.coins -= FREEZE_PRICE; S.streak_shields += 1; save(true); SFX.item(); toast(`❄️ Streak Freeze bought! You have ${S.streak_shields}.`); renderMap();
}

/* ----- Home cards ----- */
function weekRow() {
  const t = today();
  return `<div class="week">${Array.from({ length: 7 }, (_, k) => { const d = shiftDay(t, k - 6), x = new Date(Date.now() + (k - 6) * 864e5);
    const on = S.study_days.includes(d), fr = S.frozen_days.includes(d);
    return `<span class="${on ? "on" : ""} ${fr ? "frz" : ""} ${k === 6 ? "today" : ""}" title="${fr ? "Covered by a Streak Freeze" : on ? "Studied" : ""}">${fr ? "❄" : "SMTWTFS"[x.getDay()]}</span>`; }).join("")}</div>`;
}
function streakCardHtml() {
  const mult = streakMult(), done = studiedToday();
  return `<section class="card streakcard"><div class="row" style="gap:12px;flex-wrap:nowrap"><span class="flame ${done ? "" : "dim"}" aria-hidden="true">🔥</span>
      <div style="flex:1;min-width:0"><b>${S.current_streak} day streak</b> ${done ? `<span class="pill saved">✓ studied today</span>` : ""}<div class="small muted">Rewards ×${mult.toFixed(2).replace(/0$/, "")} · Best ${S.longest_streak}</div></div>
      <button class="freezebtn" id="frzInfo" aria-label="Streak Freezes: ${S.streak_shields} of ${FREEZE_MAX}">${"❄️".repeat(S.streak_shields)}${"<i>❄️</i>".repeat(FREEZE_MAX - S.streak_shields)}</button></div>
    ${weekRow()}</section>`;
}
// Mochi pops up when today's study isn't done yet. Red and pulsing in the last 3 hours or with no freezes left.
function riskCardHtml() {
  if (studiedToday()) return "";
  const now = new Date(), end = new Date(now); end.setHours(24, 0, 0, 0);
  const mins = Math.max(0, Math.round((end - now) / 60000)), h = Math.floor(mins / 60), m = mins % 60;
  const urgent = S.current_streak > 0 && (h < 3 || S.streak_shields === 0);
  const just = S.freeze_used && S.freeze_used.day === today();
  // One compact line under the Next step card (the Next step card already has the Enter button).
  const line = S.current_streak > 0
    ? `<b>⏳ ${h} h ${m} min</b> to keep your <b>${S.current_streak}-day</b> streak · ${S.streak_shields ? `❄️ ×${S.streak_shields}` : "<b>no freezes!</b>"}${just ? " · a freeze was just used" : ""}`
    : "🌱 Finish <b>one</b> activity to start a streak";
  return `<section class="card riskcard ${urgent ? "urgent" : ""}"><div class="rkrow"><div class="av" aria-hidden="true">${avatar("chiikawa", urgent ? "shock" : "normal")}</div><div class="rkline">${line}</div>
    <button class="btn yellow small" id="rkRush" aria-label="60-second Rush">⚡ Rush</button></div></section>`;
}
function wireDailyCards() {
  const fi = document.getElementById("frzInfo"); if (fi) fi.onclick = () => { SFX.tap(); openFreezeInfo(); };
  const go = document.getElementById("rkGo"); if (go) go.onclick = () => { SFX.tap(); const ni = nextRoomIndex(); streakNote = ""; enterRoom((ni === -1 ? ROOMS[roomIndex(S.current_room)] : ROOMS[ni]).id); };
  const ru = document.getElementById("rkRush"); if (ru) ru.onclick = () => { SFX.tap(); rushIntro(); };
  const mg = document.getElementById("msGo"); if (mg) mg.onclick = () => { SFX.tap(); missionGo(); };
}
function openFreezeInfo() {
  openModal(`<span class="kicker">❄️ Streak Freeze</span><h2>You have ${S.streak_shields} / ${FREEZE_MAX}</h2>
    <div class="frzbig" aria-hidden="true">${"❄️".repeat(S.streak_shields)}${"<i>❄️</i>".repeat(FREEZE_MAX - S.streak_shields)}</div>
    <ul class="small"><li>Your streak grows on days you <b>finish an activity</b> (a stage, a study series, a Rush, a dictation or notebook round).</li>
      <li>Miss a day? A freeze <b>switches on by itself</b> and keeps your streak. 2 missed days use 2.</li>
      <li>You get <b>1 free freeze every month</b> (up to ${FREEZE_MAX}). Extra ones cost 🌰 ${FREEZE_PRICE}, so they stay precious.</li></ul>
    ${say("chiikawa", "Freezes are for busy days and sick days, not lazy days. 😉 Even one 5-minute Rush counts!", "normal", "hint")}
    <div class="row"><button class="btn yellow" id="frzBuy" ${S.coins < FREEZE_PRICE || S.streak_shields >= FREEZE_MAX ? "disabled" : ""}>Buy 1 for 🌰 ${FREEZE_PRICE}</button><button class="btn plain" id="frzOk">OK</button></div>`);
  document.getElementById("frzBuy").onclick = () => { closeModal(); buyFreeze(); };
  document.getElementById("frzOk").onclick = () => { SFX.tap(); closeModal(); };
}

/* ----- 📅 Daily mission: one a day, aimed at what each student avoids or finds hardest ----- */
const MISSION_STORY = {
  weak: [["🕵️ Detective {P}", "A mystery in Topic {T}! Clear one stage there to crack the case."], ["🏥 Ward round", "The pal clinic needs help with Topic {T}. Clear one stage there."], ["🔦 Power cut!", "The lab lights went out over Topic {T}. Clear one stage to switch them back on."]],
  fix: [["📕 Mistake hunt", "Three old mistakes are hiding in the Notebook. Answer 3 notebook questions right."], ["🧹 Lab clean-up", "Tidy the Mistake Notebook: answer 3 of its questions right."]],
  dict: [["📻 Radio host {P}", "{P} is reading the biology news on air. Spell 5 dictation words right."], ["✉️ Letter to a scientist", "Write a neat letter: spell 5 dictation words right."]],
  rush: [["⚡ Speed lab", "The centrifuge is spinning! Score 80+ points in one Cell Rush."], ["🏃 Relay race", "Hand on the baton: score 80+ points in one Cell Rush."]],
  sim: [["🔬 Lab day", "Run 2 different simulations in the 🔬 Lab tab and read what changes."], ["🧪 Experiment fair", "Show the class 2 different simulations from the 🔬 Lab tab."]],
  fresh: [["🗺️ Field trip", "Explore somewhere new: clear a stage you have never cleared."], ["🦆 Mai Po expedition", "Pack your binoculars: clear a brand-new stage."]]
};
const MISSION_N = { weak: 1, fix: 3, dict: 5, rush: 1, sim: 2, fresh: 1 };
function weakestTopic() {
  const started = TOPICS.map((T, ti) => ti).filter(ti => stagesDone(ti) > 0 || Object.keys(S.mistakes).some(k => { const m = mistakeQ(k); return m && m.r.t === ti; }));
  const list = started.length ? started : [ROOMS[roomIndex(S.current_room)].t];
  return list.slice().sort((a, b) => S.bio_mastery[TOPICS[a].id] - S.bio_mastery[TOPICS[b].id] || mistakeKeys(b).length - mistakeKeys(a).length)[0];
}
function dailyMission() {
  const t = today();
  if (S.mission && S.mission.day === t) return S.mission;
  const ok = ["weak", "rush", "sim"];
  if (mistakeKeys().length >= 3) ok.push("fix", "fix");
  ok.push("dict"); if (Object.keys(S.dict.missed).length >= 3) ok.push("dict");
  if (S.completed_rooms.length < ROOMS.length) ok.push("fresh");
  ok.push("weak");
  const seed = dayNum(t) + [...String(S.player_id)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const kind = ok[seed % ok.length], story = MISSION_STORY[kind][seed % MISSION_STORY[kind].length];
  S.mission = { day: t, kind, ti: kind === "weak" ? weakestTopic() : null, prog: 0, n: MISSION_N[kind], done: false, s: MISSION_STORY[kind].indexOf(story) };
  save();
  return S.mission;
}
function missionText(m) {
  const [title, text] = MISSION_STORY[m.kind][m.s] || MISSION_STORY[m.kind][0];
  return { title: title.replace("{P}", palName()), text: text.replace("{P}", palName()).replace("{T}", m.ti == null ? "" : `${TOPICS[m.ti].no} (${TOPICS[m.ti].name})`) };
}
function missionCardHtml() {
  const m = dailyMission(), { title, text } = missionText(m), pc = Math.min(100, Math.round(100 * m.prog / m.n));
  return `<section class="card missioncard ${m.done ? "done" : ""}"><div class="row" style="justify-content:space-between;flex-wrap:nowrap;gap:8px">
      <span class="kicker" style="margin:0">📅 Daily mission</span><span class="pill coinpill">${m.done ? "✓ Done" : "+40 🌰 + 🎁"}</span></div>
    <h3 style="margin:2px 0">${title}</h3><p class="small" style="margin:0">${esc(text)}</p>
    <div class="tprog thick" aria-label="${m.prog} of ${m.n}"><i style="width:${pc}%"></i></div>
    ${m.done ? `<p class="small muted" style="margin:0">Mission complete! A new one arrives tomorrow. 🌙</p>` : `<div class="row"><span class="small"><b>${m.prog} / ${m.n}</b></span><button class="btn blue" id="msGo">Go →</button></div>`}</section>`;
}
function missionGo() {
  const m = dailyMission();
  if (m.kind === "weak") { const r = topicRooms(m.ti).find(x => !S.completed_rooms.includes(x.id) && isUnlocked(roomIndex(x.id))) || topicRooms(m.ti)[0]; return enterRoom(r.id); }
  if (m.kind === "fresh") { const ni = nextRoomIndex(); return ni === -1 ? goTab("stages") : enterRoom(ROOMS[ni].id); }
  if (m.kind === "fix") return renderNotebook();
  if (m.kind === "dict") { DT = null; return renderDictation(); }
  if (m.kind === "rush") return rushIntro();
  if (m.kind === "sim") return renderSims();
}
function missionProgress(ev) {
  const m = dailyMission(); if (m.done) return;
  let add = 0;
  if (m.kind === "weak" && (ev.mode === "escape" || ev.mode === "study") && ev.done && ev.room && ev.room.t === m.ti) add = 1;
  if (m.kind === "fresh" && ev.fresh) add = 1;
  if (m.kind === "fix" && ev.mode === "notebook") add = ev.cor || 0;
  if (m.kind === "dict" && ev.mode === "dict") add = ev.cor || 0;
  if (m.kind === "rush" && ev.mode === "rush" && (ev.score || 0) >= 80) add = 1;
  if (m.kind === "sim" && ev.mode === "sim" && !(m.sims || []).includes(ev.sim)) { m.sims = (m.sims || []).concat(ev.sim); add = 1; }
  if (!add) return;
  m.prog = Math.min(m.n, m.prog + add);
  if (m.prog >= m.n) {
    m.done = true; S.coll.pending += 1; setTimeout(() => gainCoins(40), 1600); S.stats.missions = (S.stats.missions || 0) + 1;
    setTimeout(() => { SFX.fanfare(); confetti(120); toast(`📅 Daily mission complete: ${missionText(m).title}! +40 🌰 and a capsule 🎁`); }, 1600);
  }
  save();
}

/* ----- 🌰 Chestnuts: one helper for every reward, so the top-bar counter always updates and a "+N" pops up ----- */
function gainCoins(n, why, at) {
  if (!S || !n) return 0;
  S.coins = Math.max(0, (S.coins || 0) + n); if (n > 0) S.stats.earned = (S.stats.earned || 0) + n;
  save(); renderTools(); coinPop(n, at); if (why) toast(`${n > 0 ? "+" : ""}${n} 🌰 ${why}`);
  return n;
}
function coinPop(n, at) {
  if (reduced()) return;
  const tc = document.getElementById("tCoins"), src = at && at.getBoundingClientRect ? at.getBoundingClientRect() : null, dst = tc ? tc.getBoundingClientRect() : null;
  const d = document.createElement("div"); d.className = "cpop" + (n < 0 ? " neg" : ""); d.textContent = `${n > 0 ? "+" : ""}${n} 🌰`;
  const x = src ? src.left + src.width / 2 : dst ? dst.left + dst.width / 2 : innerWidth / 2, y = src ? src.top : dst ? dst.bottom + 10 : 80;
  d.style.left = x + "px"; d.style.top = y + "px"; document.body.appendChild(d);
  if (dst && src && n > 0) requestAnimationFrame(() => { d.style.transform = `translate(${dst.left + dst.width / 2 - x}px, ${dst.top - y}px) scale(.6)`; d.style.opacity = ".2"; });
  setTimeout(() => d.remove(), 1100);
  if (tc) { tc.classList.remove("bump"); void tc.offsetWidth; tc.classList.add("bump"); }
}
// A right answer on the first try pays 3 🌰 for a question you've never mastered, 1 🌰 for one you already know
const answerCoins = (pid, firstTry) => !firstTry ? 0 : Math.round((S.mastered_puzzles.includes(pid) ? 1 : 3) * (S.ill ? .8 : 1) * perk("coins"));

/* ----- One hook for every finished activity: streak, mission and class records ----- */
function activityDone(ev) {
  if (!S) return;
  newDayCheck();
  if (ev.done !== false && (ev.ans || 0) > 0) { markStudied(); luckyCount(ev.ans); }
  palGain(ev);
  missionProgress(ev);
  if (ev.mode !== "sim") logRec({ mode: ev.mode, topic: ev.room ? String(TOPICS[ev.room.t].no) : ev.topic || "", stage: ev.room ? `${ev.room.id} ${ev.room.name}` : ev.stage || "",
    ans: ev.ans || 0, cor: ev.cor || 0, stars: ev.stars || 0, secs: ev.secs || 0, status: ev.done === false ? "quit" : "done", start: ev.start || "", ids: ev.ids || "", wrong: ev.wrong || "" });
  save(); cloudSaveSoon();
}

/* ----- 💚 Health tips by time of day (from the device clock) ----- */
function healthTip() {
  const d = new Date(), h = d.getHours() + d.getMinutes() / 60, schoolNight = d.getDay() >= 0 && d.getDay() <= 4;
  if (h >= 22 || h < 5) return ["🌙", "Melatonin is rising: your body is ready for sleep. Sleep is when your brain files today's memories. Time to rest!"];
  if (h >= 21 && schoolNight) return ["😴", "School tomorrow! Teens need 8–10 hours of sleep. Aim to sleep by 10:30 so you're not sleepy in class."];
  if (h < 10) return ["🍳", "Breakfast refuels your blood glucose after the overnight fast. Your brain runs mostly on glucose!"];
  if (h < 14) return ["💧", "Sip some water. Even mild dehydration lowers concentration, and your kidneys need water to remove urea."];
  if (h < 18) return ["🏃", "Ten minutes of exercise raises your heart rate and sends more oxygen to your brain. Stretch break?"];
  return ["👀", "20-20-20 rule: every 20 minutes, look 6 m (20 feet) away for 20 seconds so your ciliary muscles can relax."];
}
const healthTipHtml = () => { const [ic, t] = healthTip(); return `<div class="healthtip"><span aria-hidden="true">${ic}</span><span>${esc(t)}</span></div>`; };
const lateNight = () => { const h = new Date().getHours(); return h >= 22 || h < 5; };
let sessionStart = Date.now(), breakShown = false, lastRestPop = 0;
function wellbeingTick() {
  if (!S || document.hidden || $modal.innerHTML || (R && !R.study) || RU) return;
  if (lateNight() && Date.now() - lastRestPop > 3600e3) {
    lastRestPop = Date.now();
    openModal(`<span class="kicker">🌙 Time to rest</span><h2>It's getting late...</h2><div class="cast" style="margin:0"><div class="fig" style="width:110px">${figure("chiikawa", "sleepy")}</div></div>
      ${say("chiikawa", "Yawn... 🥱 Your progress is saved. Deep sleep helps your hippocampus move today's learning into long-term memory. See you tomorrow?", "sleepy")}
      <div class="row"><button class="btn big" id="rstOk">😴 Good night!</button><button class="btn plain" id="rstMore">5 more minutes</button></div>`);
    document.getElementById("rstOk").onclick = () => { SFX.tap(); closeModal(); save(true); toast("💤 Saved. Sweet dreams, see you tomorrow!"); };
    document.getElementById("rstMore").onclick = () => { SFX.tap(); closeModal(); };
    return;
  }
  if (!breakShown && Date.now() - sessionStart > 40 * 60e3) {
    breakShown = true;
    openModal(`<span class="kicker">🧘 Brain break</span><h2>40 minutes of great work!</h2>
      ${say("chiikawa", "Stand up, stretch, drink some water and look out of the window for 20 seconds. Your eyes and brain will thank you! 💚", "happy", "hint")}
      <div class="row"><button class="btn big" id="brkOk">OK, quick break!</button></div>`);
    document.getElementById("brkOk").onclick = () => { SFX.tap(); closeModal(); };
  }
}
setInterval(wellbeingTick, 60e3);
