
/* ============================================================
   5j. 🔖 Bookmarks: students save any question (🔖 on every question card: escape locks, Study mode,
   Mistake Notebook and bookmark runs) and redo them later from 🎮 Practice → 🔖 Bookmarks.
   S.bookmarks = { "roomId:questionId": { t: savedAt, n: tries, ok: right } } (same key style as the Mistake Notebook).
   ============================================================ */
const BM_MAX = 200;
const bmStore = () => (S.bookmarks = S.bookmarks || {});
const isBookmarked = k => !!bmStore()[k];
const bookmarkKeys = ti => Object.keys(bmStore()).filter(k => { const m = mistakeQ(k); return m && (ti == null || m.r.t === ti); });
// The toggle button for one question (any screen). A single document-level listener handles every click.
const bmBtn = (rid, qid) => { const k = `${rid}:${qid}`, on = isBookmarked(k);
  return `<button type="button" class="bmbtn ${on ? "on" : ""}" data-bm="${k}" aria-pressed="${on}" aria-label="${on ? "Remove bookmark" : "Bookmark this question"}" title="${on ? "Bookmarked: tap to remove" : "Bookmark to redo later"}">🔖<span>${on ? "Saved" : "Save"}</span></button>`; };
function toggleBookmark(k) {
  const bm = bmStore();
  if (bm[k]) { delete bm[k]; toast("🔖 Bookmark removed"); }
  else {
    if (Object.keys(bm).length >= BM_MAX) { toast(`🔖 You can keep up to ${BM_MAX} bookmarks. Remove some first.`); return false; }
    bm[k] = { t: Date.now(), n: 0, ok: 0 }; SFX.item(); toast("🔖 Saved! Redo it any time in 🎮 Practice → Bookmarks.");
  }
  save(); return true;
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-bm]"); if (!b || !S) return;
  e.preventDefault(); e.stopPropagation();
  if (!toggleBookmark(b.dataset.bm)) return;
  const on = isBookmarked(b.dataset.bm);
  b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); b.setAttribute("aria-label", on ? "Remove bookmark" : "Bookmark this question");
  const sp = b.querySelector("span"); if (sp) sp.textContent = on ? "Saved" : "Save";
});

/* ----- 🎮 Practice → 🔖 Bookmarks ----- */
function renderBookmarks() {
  renderNav("play");
  stopRush(); MUSIC.setMode("calm"); stopTimer(); if (R) { clearTimeout(R.introT); clearTimeout(R.incT); } R = null; renderTools();
  const all = bookmarkKeys(), rows = all.map(k => ({ k, ...mistakeQ(k), b: bmStore()[k] })).sort((a, b) => a.r.t - b.r.t || b.b.t - a.b.t);
  $app.innerHTML = `
    <section class="hero bm-hero">${starsBg()}
      <span class="kicker" style="color:#fff">${HERO_KICKER} · Practice</span>
      <h1>🔖 Bookmarks</h1>
      <p class="sub">${all.length ? `${all.length} saved question${all.length === 1 ? "" : "s"}` : "No bookmarks yet"}</p>
    </section>
    <section class="card">
      ${say("chiikawa", all.length ? "Your own question collection! Redo them as often as you like. Got one totally sorted? Tap <b>🔖 Saved</b> to remove it." : "Tap <b>🔖 Save</b> on any question (in a stage, Study mode or the Mistake Notebook) and it appears here, ready to redo. 📌", "happy")}
      <div class="row">${all.length ? `<button class="btn big" id="bmAll">▶ Redo ${Math.min(10, all.length)} bookmark${all.length === 1 ? "" : "s"}</button>` : ""}<button class="btn plain" id="bmBack">← Practice</button></div>
    </section>
    ${all.length ? `<section class="card"><h2>By topic</h2><div class="nbtopics">${TOPICS.map((T, ti) => { const n = bookmarkKeys(ti).length; if (!n) return "";
        return `<div class="nbrow"><span class="ticon" aria-hidden="true">${T.icon}</span><span style="min-width:0"><b>Topic ${T.no}: ${esc(T.name)}</b></span>
        <span class="pill">🔖 ${n}</span><button class="btn blue" data-bmt="${ti}">Redo</button></div>`; }).join("")}</div></section>
      <section class="card"><h2>Saved questions</h2><div class="nblist">${rows.slice(0, 80).map(x => `<div class="nbitem bmitem">
        <span class="small muted">${TOPICS[x.r.t].icon} ${esc(stageLabelM(x.r))} · ${esc(stageName(x.r))}</span>
        <span>${esc(shortQ(x.p.q))}</span>
        <span class="row" style="justify-content:space-between;gap:6px"><span class="small">${x.b.n ? `✓ ${x.b.ok}/${x.b.n} right when redone` : "Not redone yet"}</span>${bmBtn(x.r.id, x.p.id)}</span></div>`).join("")}</div>
        ${rows.length > 80 ? `<p class="small muted">…and ${rows.length - 80} more.</p>` : ""}</section>` : ""}`;
  const a = document.getElementById("bmAll"); if (a) a.onclick = () => { SFX.init(); SFX.tap(); startBookmarkRun(null); };
  document.getElementById("bmBack").onclick = () => { SFX.tap(); goTab("play"); };
  $app.querySelectorAll("[data-bmt]").forEach(b => b.onclick = () => { SFX.init(); SFX.tap(); startBookmarkRun(Number(b.dataset.bmt)); });
  window.scrollTo({ top: 0 });
}
// Redo up to 10 bookmarks: the ones redone least (and least often right) come first
function startBookmarkRun(ti) {
  const bm = bmStore(), keys = shuffle(bookmarkKeys(ti)).sort((a, b) => (bm[a].n - bm[b].n) || (bm[a].ok / (bm[a].n || 1)) - (bm[b].ok / (bm[b].n || 1))).slice(0, 10);
  if (!keys.length) return renderBookmarks();
  const RV = { keys, at: 0, right: 0, done: 0, start: new Date().toISOString(), hinted: false };
  const next = () => {
    if (RV.at >= RV.keys.length) {
      const coins = Math.round(RV.right * perk("notebook")); gainCoins(coins); SFX.fanfare(); if (RV.right) confetti(80);
      activityDone({ mode: "bookmark", topic: ti == null ? "all" : String(TOPICS[ti].no), stage: "Bookmarks", ans: RV.done, cor: RV.right, done: RV.done > 0, start: RV.start });
      $app.innerHTML = `<section class="card"><span class="kicker">🔖 Bookmark run done</span><h2>${RV.done && RV.right === RV.done ? "All right! 🎉" : "Run complete! 🌱"}</h2>
        <div class="cast" style="margin:0"><div class="fig" style="width:84px">${figure("chiikawa", RV.right ? "sparkle" : "normal")}</div></div>
        <p style="text-align:center"><b>${RV.right}/${RV.done}</b> right · <span class="pill coinpill">+${coins} 🌰</span></p>
        ${say("chiikawa", RV.right === RV.done && RV.done ? "Those are looking solid now! Remove any you've mastered so your list stays sharp. ✨" : "Keep them bookmarked and come back tomorrow. Spaced practice makes it stick! 🌱", "happy")}
        <div class="row"><button class="btn big" id="bmBackL">🔖 Back to bookmarks</button><button class="btn plain" id="bmHome">🏠 Home</button></div></section>`;
      document.getElementById("bmBackL").onclick = () => { SFX.tap(); renderBookmarks(); };
      document.getElementById("bmHome").onclick = () => { SFX.tap(); goTab("home"); };
      window.scrollTo({ top: 0 }); return;
    }
    const k = RV.keys[RV.at], { r, p } = mistakeQ(k);
    $app.innerHTML = `<section class="rushhead"><div class="status"><div class="av">${avatar("chiikawa", "brave")}</div><div><div class="rtopic" style="color:var(--yellow)">🔖 Bookmarks${ti == null ? "" : ` · ${esc(TOPICS[ti].name)}`}</div><div class="rt">Question ${RV.at + 1} of ${RV.keys.length}</div></div></div>
        <span class="combo">✓ ${RV.right}</span></section>
      <section class="card"><span class="kicker">${TOPICS[r.t].icon} ${esc(stageLabelM(r))} · ${esc(r.focus)} ${diffChip(p.b)} ${fmtChip(p)} ${bmBtn(r.id, p.id)}</span>
        <p class="q">${esc(p.q)}</p>${p.svg ? `<div class="diagram-box">${DIAGRAMS[p.svg]}</div>` : ""}${qStim(p)}
        <div id="bmAns"></div><div class="row"><button class="btn blue" id="bmHint">💡 Hint</button><button class="btn plain" id="bmJ">📓 Notes</button><button class="btn plain" id="bmQuit">✕ Stop</button></div><div id="bmFb"></div></section>`;
    document.getElementById("bmHint").onclick = () => { SFX.hint(); document.getElementById("bmFb").innerHTML = say("chiikawa", `💡 ${esc(p.hint)}`, "normal", "hint"); };
    document.getElementById("bmJ").onclick = () => { SFX.tap(); openJournal(r.id, termsIn(r, p)); };
    document.getElementById("bmQuit").onclick = () => { SFX.tap(); RV.at = RV.keys.length; next(); };
    miniQuiz(document.getElementById("bmAns"), p, ok => {
      RV.done++; const b = bmStore()[k]; if (b) { b.n++; if (ok) b.ok++; }
      if (ok) { RV.right++; SFX.right(); } else { SFX.wrong(); noteMistake(r.id, p.id); }
      save();
      document.getElementById("bmFb").innerHTML = `<div class="fb ${ok ? "ok" : "no"}">${ok ? say("chiikawa", "Wahoo! Got it!", "happy") : say("chiikawa", "Not yet... let's read why. 🥺", "cry")}<p>${esc(p.explain)}</p>${trapsHtml(p)}${p.tip ? `<p class="tip"><b>📝 Exam tip:</b> ${esc(p.tip)}</p>` : ""}
        <div class="row"><button class="btn big" id="bmNext">${RV.at + 1 < RV.keys.length ? "Next →" : "Finish"}</button></div></div>`;
      document.getElementById("bmNext").onclick = () => { SFX.tap(); RV.at++; next(); };
      document.getElementById("bmNext").focus({ preventScroll: true });
    });
    window.scrollTo({ top: 0 });
  };
  MUSIC.setMode("calm"); next();
}
