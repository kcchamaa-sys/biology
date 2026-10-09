
/* ============================================================
   5m. 📊 Teacher statistics (teacher accounts only).
   Shown as an extra bottom-bar tab when the signed-in account is staff (or listed in TEACHER_EMAILS on the server).
   Data comes from the class Google Sheet via the server's "stats" action; nothing is stored on the device.
   ============================================================ */
const isTeacher = () => signedIn() && !!(AUTH.user && AUTH.user.teacher);
const TS = { data: null, loading: false, err: "", cls: "all", period: "30", sort: "no", dir: 1, at: 0 };
const MODE_LABEL = { escape: "Escape stages", study: "Study series", rush: "Cell Rush", dict: "Dictation", notebook: "Mistake Notebook" };
function loadStats(force) {
  if (TS.loading || (!force && TS.data && Date.now() - TS.at < 120000)) return;
  TS.loading = true; TS.err = "";
  api("stats", {}).then(j => { TS.loading = false; if (j && j.ok) { TS.data = j; TS.at = Date.now(); } else TS.err = j && j.error === "unknown_action" ? "update" : errText(j ? j.error : "network"); if (homeTab === "stats") renderMap(); });
}
const pctOf = (c, a) => (a ? Math.round(100 * c / a) : null);
const fmtDay = iso => { const d = new Date(iso); return isNaN(d) ? "–" : `${d.getDate()}/${d.getMonth() + 1}`; };
const yesterday = () => shiftDay(today(), -1);
// Older servers can send the last study day as a Date string ("Thu Oct 08 2026 …"): turn it back into yyyy-mm-dd
const ymd = v => { v = String(v || ""); if (/^\d{4}-\d\d-\d\d/.test(v)) return v.slice(0, 10); const d = new Date(v); return isNaN(d) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
function computeStats() {
  const D = TS.data, since = TS.period === "all" ? 0 : Date.now() - Number(TS.period) * 864e5;
  const studs = D.students.filter(s => TS.cls === "all" || s.cls === TS.cls).sort((a, b) => a.cls < b.cls ? -1 : a.cls > b.cls ? 1 : (Number(a.no) || 0) - (Number(b.no) || 0));
  const by = {}; studs.forEach(s => { by[s.email] = { s, sess: 0, ans: 0, cor: 0, secs: 0, last: "", modes: {} }; });
  const topic = {}, day = {}, modes = {}, missed = {}; let recs = 0;
  D.records.forEach(r => {
    const st = by[r.email]; if (!st) return; const tm = Date.parse(r.t); if (tm < since) return;
    recs++; st.sess++; st.ans += r.ans; st.cor += r.cor; st.secs += r.secs; if (!st.last || r.t > st.last) st.last = r.t; st.modes[r.mode] = (st.modes[r.mode] || 0) + 1;
    modes[r.mode] = (modes[r.mode] || 0) + 1;
    const dk = r.t.slice(0, 10); day[dk] = (day[dk] || 0) + 1;
    if ((r.mode === "escape" || r.mode === "study" || r.mode === "notebook") && /^\d+$/.test(r.topic)) { const t = topic[r.topic] || (topic[r.topic] = { a: 0, c: 0 }); t.a += r.ans; t.c += r.cor; }
    if ((r.mode === "escape" || r.mode === "study") && r.wrong) { const rid = String(r.stage).split(" ")[0]; r.wrong.split(/\s+/).filter(Boolean).forEach(q => { const k = `${rid}:${q}`; missed[k] = (missed[k] || 0) + 1; }); }
  });
  const rows = studs.map(s => { const b = by[s.email], pr = D.progress[s.email] || {}; return { s, sess: b.sess, ans: b.ans, cor: b.cor, acc: pctOf(b.cor, b.ans), mins: Math.round(b.secs / 60), last: b.last,
    streak: ymd(pr.lastDay) >= yesterday() ? pr.streak || 0 : 0, lastDay: ymd(pr.lastDay), best: pr.best || 0, stages: pr.stages || 0, stars: pr.stars || 0, xp: pr.xp || 0, mistakes: pr.mistakes || 0, trophies: pr.trophies || 0, signed: !!D.progress[s.email] }; });
  const active = rows.filter(r => r.sess > 0), ans = rows.reduce((a, r) => a + r.ans, 0), cor = rows.reduce((a, r) => a + r.cor, 0);
  return { rows, active, recs, ans, acc: pctOf(cor, ans), topic, day, modes, missed, classes: [...new Set(D.students.map(s => s.cls).filter(Boolean))].sort() };
}
/* ----- tiny SVG charts: one series each, one blue, values labelled on the bars ----- */
const VIZ = "#2a78d6";
function hbars(items, max, fmtV) {
  if (!items.length) return `<p class="small muted">No data in this period yet.</p>`;
  return `<div class="hbars">${items.map(([label, v, tip]) => `<div class="hbar" title="${esc(tip || `${label}: ${fmtV(v)}`)}"><span class="hbl">${esc(label)}</span><span class="hbt"><i style="width:${max ? Math.max(2, 100 * v / max) : 0}%"></i></span><b class="hbv">${fmtV(v)}</b></div>`).join("")}</div>`;
}
function dayBars(day, n) {
  const days = Array.from({ length: n }, (_, i) => shiftDay(today(), i - n + 1)), vals = days.map(d => day[d] || 0), max = Math.max(1, ...vals), W = 640, H = 150, bw = W / n;
  const peak = vals.indexOf(Math.max(...vals));
  return `<svg class="vchart" viewBox="0 0 ${W} ${H + 22}" role="img" aria-label="Activities per day for the last ${n} days">
    <line x1="0" y1="${H}" x2="${W}" y2="${H}" stroke="#E5DCE6" stroke-width="1"/>
    ${vals.map((v, i) => { const h = v ? Math.max(3, (H - 18) * v / max) : 0, x = i * bw + bw * .18, w = bw * .64; return `<g><title>${days[i]}: ${v} activit${v === 1 ? "y" : "ies"}</title><rect x="${i * bw}" y="0" width="${bw}" height="${H}" fill="transparent"/>${h ? `<path d="M${x} ${H} V${H - h + 4} Q${x} ${H - h} ${x + 4} ${H - h} H${x + w - 4} Q${x + w} ${H - h} ${x + w} ${H - h + 4} V${H}Z" fill="${VIZ}"/>` : ""}${i === peak && v ? `<text x="${x + w / 2}" y="${H - h - 5}" text-anchor="middle" font-size="12" font-weight="800" fill="#4B3350">${v}</text>` : ""}</g>`; }).join("")}
    ${[0, Math.floor(n / 2), n - 1].map(i => `<text x="${i * bw + bw / 2}" y="${H + 16}" text-anchor="middle" font-size="11" fill="#7E6378">${fmtDay(days[i])}</text>`).join("")}</svg>`;
}
function statsHtml() {
  if (!isTeacher()) return `<section class="card"><h2>📊 Statistics</h2><p>This page is for teacher accounts only.</p></section>`;
  if (!TS.data) {
    loadStats();
    return `<section class="card"><h2>📊 Class statistics</h2>${TS.err === "update" ? say("chiikawa", "The class server needs the latest code to show statistics. Tap the button, then follow the 4 steps.", "normal", "hint") + `<button class="btn yellow" id="stCode2">📋 Copy server code</button>`
      : TS.err ? `<p class="bad">${esc(TS.err)}</p><button class="btn" id="stRetry">Try again</button>` : `<p class="muted">Loading class data… ⏳</p>`}</section>`;
  }
  const C = computeStats(), per = { 7: "7 days", 30: "30 days", 90: "90 days", all: "all time" }[TS.period], nDays = TS.period === "7" ? 7 : TS.period === "90" ? 90 : 30;
  const avgStreak = C.rows.length ? (C.rows.reduce((a, r) => a + r.streak, 0) / C.rows.length).toFixed(1) : "0";
  const tile = (ic, v, l, extra) => `<div class="kpi"><span class="kic" aria-hidden="true">${ic}</span><b>${v}</b><span>${l}</span>${extra || ""}</div>`;
  const ring = (n, d) => { const f = d ? n / d : 0; return `<svg class="kring" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15" fill="none" stroke="#EFE7F0" stroke-width="5"/><circle cx="18" cy="18" r="15" fill="none" stroke="${VIZ}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(94.2 * f).toFixed(1)} 94.2" transform="rotate(-90 18 18)"/></svg>`; };
  const tItems = TOPICS.map(T => { const t = C.topic[String(T.no)]; return t && t.a ? { no: T.no, name: T.name, v: pctOf(t.c, t.a), a: t.a } : null; }).filter(Boolean).sort((x, y) => x.v - y.v);
  const mItems = Object.keys(MODE_LABEL).map(k => [MODE_LABEL[k], C.modes[k] || 0]).filter(x => x[1]).sort((a, b) => b[1] - a[1]);
  const clsItems = TS.cls === "all" && C.classes.length > 1 ? C.classes.map(c => { const rs = C.rows.filter(r => r.s.cls === c), a = rs.reduce((x, r) => x + r.ans, 0), k = rs.reduce((x, r) => x + r.cor, 0); return a ? [`Class ${c}`, pctOf(k, a), `Class ${c}: ${pctOf(k, a)}% right (${rs.filter(r => r.sess).length}/${rs.length} active)`] : null; }).filter(Boolean) : [];
  const missed = Object.entries(C.missed).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, n]) => { const [rid, qid] = k.split(":"), r = ROOMS[roomIndex(rid)], p = r && r.pool.find(x => x.id === qid); return p ? { r, p, n } : null; }).filter(Boolean);
  const sortKey = { no: r => `${r.s.cls}${String(r.s.no).padStart(3, "0")}`, name: r => (r.s.en || r.s.zh).toLowerCase(), sess: r => r.sess, acc: r => r.acc == null ? -1 : r.acc, streak: r => r.streak, stages: r => r.stages, last: r => r.last || "" }[TS.sort];
  const rows = C.rows.slice().sort((a, b) => { const x = sortKey(a), y = sortKey(b); return (x < y ? -1 : x > y ? 1 : 0) * TS.dir; });
  const inactive = C.rows.filter(r => !r.sess), maxSess = Math.max(1, ...C.rows.map(r => r.sess));
  const topStreak = C.rows.slice().sort((a, b) => b.streak - a.streak)[0];
  const weak = tItems[0], nm = r => esc((r.s.en || r.s.zh || "").split(/\s+/)[0]);
  // one-glance chips: what needs attention, what is going well
  const chips = [weak && weak.v < 70 ? `<span class="gchip bad">🔻 Weakest: <b>T${weak.no}</b> ${weak.v}%</span>` : weak ? `<span class="gchip good">✅ Every topic ≥ ${weak.v}%</span>` : "",
    inactive.length ? `<span class="gchip warn">😴 <b>${inactive.length}</b> not active</span>` : C.rows.length ? `<span class="gchip good">🙌 Everyone active</span>` : "",
    topStreak && topStreak.streak ? `<span class="gchip">🔥 Top streak: <b>${nm(topStreak)}</b> ${topStreak.streak} d</span>` : "",
    missed[0] ? `<span class="gchip warn">❓ Most missed: T${missed[0].r.topicNo} (${missed[0].n}×)</span>` : ""].filter(Boolean).join("");
  const th = (k, l) => `<th><button class="sortb ${TS.sort === k ? "on" : ""}" data-sort="${k}">${l}${TS.sort === k ? (TS.dir > 0 ? " ▲" : " ▼") : ""}</button></th>`;
  return `<section class="card stathead"><div class="row" style="justify-content:space-between"><h2 style="margin:0">📊 Class statistics</h2><span class="small muted">🕒 ${new Date(TS.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>
      <div class="row stfilters"><label class="small"><select id="stCls" class="name" aria-label="Class">${["all", ...C.classes].map(c => `<option value="${esc(c)}" ${c === TS.cls ? "selected" : ""}>${c === "all" ? "All classes" : `Class ${esc(c)}`}</option>`).join("")}</select></label>
        <div class="slottabs" role="tablist" aria-label="Period">${["7", "30", "90", "all"].map(p => `<button role="tab" aria-selected="${p === TS.period}" data-per="${p}">${{ 7: "7 d", 30: "30 d", 90: "90 d", all: "All" }[p]}</button>`).join("")}</div>
        <button class="btn plain sm" id="stRefresh" aria-label="Refresh">🔄</button><button class="btn yellow sm" id="stCsv">⬇️ CSV</button><button class="btn plain sm" id="stCode">📋 Server code</button><button class="btn plain sm" id="stRepair">🔧 Check streaks</button></div>
      ${chips ? `<div class="gchips">${chips}</div>` : ""}</section>
    <div class="kpis">${tile("👥", `${C.active.length}<small>/${C.rows.length}</small>`, "active", ring(C.active.length, C.rows.length))}${tile("✏️", C.ans.toLocaleString(), "questions")}${tile("🎯", C.acc == null ? "–" : `${C.acc}%`, "right")}${tile("🔥", avgStreak, "avg streak")}</div>
    <div class="statgrid">
      <section class="card"><h3>🧭 Topics <span class="small muted">weakest first</span></h3>${topicBars(tItems)}</section>
      <section class="card"><h3>📅 Activity <span class="small muted">per day, last ${nDays} d</span></h3>${dayBars(C.day, nDays)}</section>
      ${clsItems.length ? `<section class="card"><h3>🏫 Classes <span class="small muted">% right</span></h3>${hbars(clsItems, 100, v => `${v}%`)}</section>` : ""}
    </div>
    <section class="card"><h3>👩‍🎓 Students <span class="small muted">${rows.length} · ${per}</span></h3><div class="sttable-wrap"><table class="sttable"><thead><tr>${th("no", "No.")}${th("name", "Name")}${th("sess", "Activity")}${th("acc", "Right")}${th("streak", "🔥")}${th("stages", "Stages")}${th("last", "Last")}</tr></thead>
      <tbody>${rows.map(r => `<tr class="${r.sess ? "" : "idle"}"><td data-l="No.">${esc(r.s.cls)}${r.s.no ? `-${esc(r.s.no)}` : ""}</td><td data-l="Name"><b>${esc(r.s.en || r.s.zh)}</b>${r.signed ? "" : ` <span class="tagx">never signed in</span>`}</td>
        <td data-l="Activity"><span class="spark" title="${r.sess} activities, ${r.ans} questions, ${r.mins} min"><i style="width:${Math.round(100 * r.sess / maxSess)}%"></i></span> <b>${r.sess}</b></td><td data-l="Right">${accChip(r.acc)}</td>
        <td data-l="Streak">${r.streak ? `🔥 ${r.streak}` : `<span class="muted">–</span>`}</td><td data-l="Stages">${r.stages}</td><td data-l="Last">${ago(r.last)}</td></tr>`).join("")}</tbody></table></div></section>
    <section class="card folds">
      ${foldHtml("st-missed", { icon: "❓", title: "Most-missed questions", peek: missed.length ? `${missed.length}` : "" }, missedHtml(missed))}
      ${foldHtml("st-modes", { icon: "🎮", title: "How they practise", peek: mItems[0] ? mItems[0][0] : "" }, hbars(mItems, Math.max(1, ...mItems.map(x => x[1])), v => `${v}`))}
      ${inactive.length ? foldHtml("st-idle", { icon: "😴", title: "Not active", peek: `${inactive.length}` }, `<div class="idlechips">${inactive.map(r => `<span class="idlechip"><b>${esc(r.s.cls)}${r.s.no ? `-${esc(r.s.no)}` : ""}</b> ${esc(r.s.en || r.s.zh)}</span>`).join("")}</div>`) : ""}
    </section>
    <p class="small muted">🔒 Teachers only · data from your private Google Sheet, not stored on this device.</p>`;
}
/* Topic accuracy: weakest first, colour AND icon carry the band (never colour alone) */
function topicBars(items) {
  if (!items.length) return `<p class="small muted">No answers in this period yet.</p>`;
  const band = v => v >= 80 ? ["hi", "✅"] : v >= 60 ? ["mid", "⚠️"] : ["lo", "🔻"];
  return `<div class="tbars">${items.map(t => { const [c, ic] = band(t.v); return `<div class="tbar ${c}" title="Topic ${t.no} ${esc(t.name)}: ${t.v}% of ${t.a} answers right">
    <span class="tbl"><b>T${t.no}</b> ${esc(t.name)}</span><span class="tbt"><i style="width:${Math.max(3, t.v)}%"></i></span><b class="tbv">${ic} ${t.v}%</b></div>`; }).join("")}</div>`;
}
const ago = iso => { if (!iso) return `<span class="muted">–</span>`; const d = dayNum(today()) - dayNum(ymd(iso)); return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} d ago`; };
const accChip = p => p == null ? `<span class="muted">–</span>` : `<span class="acc ${p >= 80 ? "hi" : p >= 60 ? "mid" : "lo"}">${p >= 80 ? "✅" : p >= 60 ? "⚠️" : "🔻"} ${p}%</span>`;
function missedHtml(list) {
  if (!list.length) return `<p class="small muted">No missed questions recorded in this period.</p>`;
  return `<ol class="missed">${list.map(x => `<li><span class="mchip">T${x.r.topicNo}</span> <b class="mn">${x.n}×</b> <span title="${esc(x.p.q)}">${esc(x.p.q.length > 90 ? x.p.q.slice(0, 88) + "…" : x.p.q)}</span></li>`).join("")}</ol>`;
}
function wireStats() {
  const g = id => document.getElementById(id);
  if (g("stRetry")) g("stRetry").onclick = () => { SFX.tap(); loadStats(true); renderMap(); };
  if (g("stCode2")) g("stCode2").onclick = () => { SFX.tap(); openServerCode(); };
  if (!TS.data) return;
  g("stCls").onchange = e => { TS.cls = e.target.value; renderMap(); };
  $app.querySelectorAll("[data-per]").forEach(b => b.onclick = () => { SFX.tap(); TS.period = b.dataset.per; renderMap(); });
  $app.querySelectorAll("[data-sort]").forEach(b => b.onclick = () => { SFX.tap(); const k = b.dataset.sort; TS.dir = TS.sort === k ? -TS.dir : (k === "no" || k === "name" ? 1 : -1); TS.sort = k; renderMap(); });
  g("stRefresh").onclick = () => { SFX.tap(); TS.data = null; loadStats(true); renderMap(); };
  g("stCsv").onclick = () => { SFX.tap(); downloadStatsCsv(); };
  g("stCode").onclick = () => { SFX.tap(); openServerCode(); };
  g("stRepair").onclick = () => { SFX.tap(); openRepair(); };
}
function downloadStatsCsv() {
  const C = computeStats(), q = v => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
  const head = ["Class", "No.", "English name", "Chinese name", "Activities", "Questions", "Correct", "Accuracy %", "Minutes", "Current streak", "Best streak", "Stages cleared", "Stars", "Mistakes waiting", "Trophies", "Last active"];
  const lines = [head.map(q).join(",")].concat(C.rows.map(r => [r.s.cls, r.s.no, r.s.en, r.s.zh, r.sess, r.ans, r.cor, r.acc == null ? "" : r.acc, r.mins, r.streak, r.best, r.stages, r.stars, r.mistakes, r.trophies, r.last ? r.last.slice(0, 10) : ""].map(q).join(",")));
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" }), a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `biology-stats-${TS.cls === "all" ? "all" : TS.cls}-${today()}.csv`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/* ----- 📋 Copy the class server code (server/Code.gs, built into the page by tools/build.py) -----
   Every time the server changes, the teacher pastes the new code into Apps Script and makes a New version.
   Open it from 📊 Stats, the ☰ menu, or the link ending in #server-code (works even when signed out). */
function copyText(t) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t).then(() => true, () => copyFallback(t));
  return Promise.resolve(copyFallback(t));
}
function copyFallback(t) {
  const ta = document.createElement("textarea"); ta.value = t; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;left:-9999px;top:0";
  document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch (e) {} ta.remove(); return ok;
}
function openServerCode() {
  const lines = SERVER_CODE.split("\n").length;
  openModal(`<span class="kicker">🧩 Class server code</span><h2>Update the class server</h2>
    <button class="btn big yellow" id="scCopy">📋 Copy server code</button>
    <p class="small muted" style="margin:0">Version <b>${SERVER_CODE_VER}</b> · ${lines} lines · always the latest, built with this game</p>
    <ol class="scsteps">
      <li><b>📋 Copy</b> (the button above)</li>
      <li>Open your <b>Apps Script</b> project → <b>Code.gs</b></li>
      <li><b>Select all</b> (Ctrl / ⌘ + A) → <b>Paste</b> → 💾 Save</li>
      <li><b>Deploy → Manage deployments → ✏️ → Version: New version → Deploy</b></li>
    </ol>
    <p class="small muted" style="margin:0">✅ The web address stays the same, so the game needs no change.</p>
    <details class="scview"><summary class="small">👀 Show the code</summary><textarea id="scText" readonly rows="10">${esc(SERVER_CODE)}</textarea></details>`, { wide: true });
  const b = document.getElementById("scCopy");
  b.onclick = () => { SFX.tap(); copyText(SERVER_CODE).then(ok => {
    if (ok) { SFX.item(); b.textContent = "✅ Copied! Now paste it into Apps Script"; b.classList.remove("yellow"); toast("📋 Server code copied"); }
    else { const t = document.getElementById("scText"); t.closest("details").open = true; t.focus(); t.select(); toast("Press Ctrl / ⌘ + C to copy the selected code"); } }); };
}

/* ----- 🔧 Streak check & restore (teacher): rebuild streaks from the activity records on the server -----
   First a dry run lists who would change (before → after); "Restore" writes it. Nothing is ever lowered. */
function openRepair() {
  openModal(`<span class="kicker">🔧 Streak check</span><h2>Checking every student…</h2><p class="muted">Reading the activity records ⏳</p>`);
  api("repair", { dry: true }).then(j => {
    if (!j || !j.ok) { openModal(`<span class="kicker">🔧 Streak check</span><h2>Couldn't check</h2>${j && j.error === "unknown_action" ? say("chiikawa", "The class server needs the latest code first. Tap 📋, then follow the 4 steps.", "normal", "hint") + `<button class="btn yellow" id="rpCode">📋 Copy server code</button>` : `<p class="bad">${esc(errText(j ? j.error : "network"))}</p>`}`);
      const c = document.getElementById("rpCode"); if (c) c.onclick = () => { SFX.tap(); openServerCode(); }; return; }
    const info = {}; ((TS.data && TS.data.students) || []).forEach(s => { info[s.email] = s; });
    const nm = em => { const s = info[em]; return s ? `${esc(s.cls)}${s.no ? `-${esc(s.no)}` : ""} ${esc(s.en || s.zh)}` : esc(em.split("@")[0]); };
    const list = j.fixed || [];
    openModal(`<span class="kicker">🔧 Streak check · ${j.checked} students</span>
      <h2>${list.length ? `${list.length} streak${list.length > 1 ? "s" : ""} to restore` : "✅ All streaks are right"}</h2>
      ${list.length ? `<div class="rplist">${list.map(x => `<div class="rprow"><b>${nm(x.email)}</b><span class="rpchg">🔥 ${x.before.streak} → <b>${x.after.streak}</b></span><span class="small muted">best ${x.before.best} → ${x.after.best} · last ${x.before.last ? fmtDay(x.before.last) : "–"} → ${fmtDay(x.after.last)}</span></div>`).join("")}</div>
        <p class="small muted" style="margin:0">Rebuilt from the finished activities in the Records tab. Streaks only go up, never down. Students see it the next time they sign in.</p>
        <div class="row"><button class="btn big" id="rpGo">✅ Restore ${list.length}</button><button class="btn plain" id="rpNo">Not now</button></div>`
      : `<p class="small muted">Every student's saved streak already matches (or beats) their activity records.</p><button class="btn" id="rpNo">OK</button>`}`, { wide: true });
    const no = document.getElementById("rpNo"); if (no) no.onclick = () => { SFX.tap(); closeModal(); };
    const go = document.getElementById("rpGo"); if (go) go.onclick = () => { SFX.tap(); go.disabled = true; go.textContent = "Restoring… ⏳";
      api("repair", {}).then(k => { if (k && k.ok) { SFX.item(); closeModal(); toast(`✅ Restored ${k.fixed.length} streak${k.fixed.length === 1 ? "" : "s"}`); TS.data = null; loadStats(true); renderMap(); } else { go.disabled = false; go.textContent = "Try again"; toast("Couldn't restore: " + errText(k ? k.error : "network")); } }); };
  });
}
