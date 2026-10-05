
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
    streak: pr.lastDay >= yesterday() ? pr.streak || 0 : 0, best: pr.best || 0, stages: pr.stages || 0, stars: pr.stars || 0, xp: pr.xp || 0, mistakes: pr.mistakes || 0, trophies: pr.trophies || 0, signed: !!D.progress[s.email] }; });
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
    return `<section class="card"><h2>📊 Class statistics</h2>${TS.err === "update" ? say("chiikawa", "The class server needs the latest <b>server/Code.gs</b> to show statistics. In Apps Script: paste the new code, then <b>Deploy → Manage deployments → ✏️ → New version</b>. The web address stays the same.", "normal", "hint")
      : TS.err ? `<p class="bad">${esc(TS.err)}</p><button class="btn" id="stRetry">Try again</button>` : `<p class="muted">Loading class data… ⏳</p>`}</section>`;
  }
  const C = computeStats(), per = { 7: "7 days", 30: "30 days", 90: "90 days", all: "All time" }[TS.period];
  const tile = (v, l, sub) => `<div class="kpi"><b>${v}</b><span>${l}</span>${sub ? `<small>${sub}</small>` : ""}</div>`;
  const avgStreak = C.rows.length ? (C.rows.reduce((a, r) => a + r.streak, 0) / C.rows.length).toFixed(1) : "0";
  const tItems = TOPICS.map(T => { const t = C.topic[String(T.no)]; return t && t.a ? [`T${T.no} ${T.name}`, pctOf(t.c, t.a), `Topic ${T.no} ${T.name}: ${pctOf(t.c, t.a)}% of ${t.a} answers right`] : null; }).filter(Boolean);
  const mItems = Object.keys(MODE_LABEL).map(k => [MODE_LABEL[k], C.modes[k] || 0]).filter(x => x[1]).sort((a, b) => b[1] - a[1]);
  const clsItems = TS.cls === "all" && C.classes.length > 1 ? C.classes.map(c => { const rs = C.rows.filter(r => r.s.cls === c), a = rs.reduce((x, r) => x + r.ans, 0), k = rs.reduce((x, r) => x + r.cor, 0); return a ? [`Class ${c}`, pctOf(k, a), `Class ${c}: ${pctOf(k, a)}% right (${rs.filter(r => r.sess).length}/${rs.length} active)`] : null; }).filter(Boolean) : [];
  const weak = tItems.slice().sort((a, b) => a[1] - b[1])[0];
  const missed = Object.entries(C.missed).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, n]) => { const [rid, qid] = k.split(":"), r = ROOMS[roomIndex(rid)], p = r && r.pool.find(x => x.id === qid); return p ? { r, p, n } : null; }).filter(Boolean);
  const sortKey = { no: r => `${r.s.cls}${String(r.s.no).padStart(3, "0")}`, name: r => (r.s.en || r.s.zh).toLowerCase(), sess: r => r.sess, acc: r => r.acc == null ? -1 : r.acc, streak: r => r.streak, stages: r => r.stages, last: r => r.last || "" }[TS.sort];
  const rows = C.rows.slice().sort((a, b) => { const x = sortKey(a), y = sortKey(b); return (x < y ? -1 : x > y ? 1 : 0) * TS.dir; });
  const inactive = C.rows.filter(r => !r.sess);
  const th = (k, l) => `<th><button class="sortb ${TS.sort === k ? "on" : ""}" data-sort="${k}">${l}${TS.sort === k ? (TS.dir > 0 ? " ▲" : " ▼") : ""}</button></th>`;
  return `<section class="card stathead"><div class="row" style="justify-content:space-between"><h2 style="margin:0">📊 Class statistics</h2><span class="small muted">Updated ${new Date(TS.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>
      <div class="row stfilters"><label class="small"><b>Class</b> <select id="stCls" class="name">${["all", ...C.classes].map(c => `<option value="${esc(c)}" ${c === TS.cls ? "selected" : ""}>${c === "all" ? "All classes" : `Class ${esc(c)}`}</option>`).join("")}</select></label>
        <div class="slottabs" role="tablist">${["7", "30", "90", "all"].map(p => `<button role="tab" aria-selected="${p === TS.period}" data-per="${p}">${{ 7: "7 days", 30: "30 days", 90: "90 days", all: "All" }[p]}</button>`).join("")}</div>
        <button class="btn plain sm" id="stRefresh">🔄 Refresh</button><button class="btn yellow sm" id="stCsv">⬇️ Download CSV</button></div></section>
    <div class="kpis">${tile(`${C.active.length}/${C.rows.length}`, "students active", per)}${tile(C.recs, "activities finished", per)}${tile(C.ans, "questions answered", per)}${tile(C.acc == null ? "–" : `${C.acc}%`, "answered right", "first-try and retries")}${tile(avgStreak, "average streak", "days, today")}</div>
    <div class="statgrid">
      <section class="card"><h3>Accuracy by topic</h3><p class="small muted" style="margin:0">${weak ? `💡 Weakest topic: <b>${esc(weak[0])}</b> (${weak[1]}%).` : ""}</p>${hbars(tItems, 100, v => `${v}%`)}</section>
      <section class="card"><h3>Activities per day</h3><p class="small muted" style="margin:0">Last ${TS.period === "7" ? 7 : TS.period === "90" ? 90 : 30} days, all finished activities.</p>${dayBars(C.day, TS.period === "7" ? 7 : TS.period === "90" ? 90 : 30)}</section>
      <section class="card"><h3>How students practise</h3>${hbars(mItems, Math.max(1, ...mItems.map(x => x[1])), v => `${v}`)}</section>
      ${clsItems.length ? `<section class="card"><h3>Accuracy by class</h3>${hbars(clsItems, 100, v => `${v}%`)}</section>` : `<section class="card"><h3>Most-missed questions</h3>${missedHtml(missed)}</section>`}
    </div>
    ${clsItems.length ? `<section class="card"><h3>Most-missed questions</h3>${missedHtml(missed)}</section>` : ""}
    <section class="card"><h3>Students (${rows.length})</h3><div class="sttable-wrap"><table class="sttable"><thead><tr>${th("no", "Class · No.")}${th("name", "Name")}${th("sess", "Activities")}${th("acc", "Accuracy")}${th("streak", "Streak")}${th("stages", "Stages")}${th("last", "Last active")}<th>Mistakes</th></tr></thead>
      <tbody>${rows.map(r => `<tr class="${r.sess ? "" : "idle"}"><td data-l="Class · No.">${esc(r.s.cls)}${r.s.no ? ` · ${esc(r.s.no)}` : ""}</td><td data-l="Name"><b>${esc(r.s.en || r.s.zh)}</b>${r.s.en && r.s.zh ? ` <span class="small muted">${esc(r.s.zh)}</span>` : ""}${r.signed ? "" : ` <span class="tagx">never signed in</span>`}</td><td data-l="Activities">${r.sess}</td><td data-l="Accuracy">${accChip(r.acc)}</td><td data-l="Streak">🔥 ${r.streak}</td><td data-l="Stages">${r.stages}</td><td data-l="Last active">${r.last ? fmtDay(r.last) : "–"}</td><td data-l="Mistakes">${r.mistakes}</td></tr>`).join("")}</tbody></table></div></section>
    ${inactive.length ? `<section class="card"><h3>Not active in this period (${inactive.length})</h3><p class="small">${inactive.map(r => `${esc(r.s.cls)}${r.s.no ? `-${esc(r.s.no)}` : ""} ${esc(r.s.en || r.s.zh)}`).join(" · ")}</p></section>` : ""}
    <p class="small muted">Only teacher accounts can see this page. Data comes from your private Google Sheet and is not stored on this device.</p>`;
}
const accChip = p => p == null ? `<span class="muted">–</span>` : `<span class="acc ${p >= 80 ? "hi" : p >= 60 ? "mid" : "lo"}">${p}%</span>`;
function missedHtml(list) {
  if (!list.length) return `<p class="small muted">No missed questions recorded in this period.</p>`;
  return `<ol class="missed">${list.map(x => `<li><span class="small muted">T${x.r.topicNo} · ${esc(x.r.name)} · <b>${x.n}×</b> wrong</span><br>${esc(x.p.q)}</li>`).join("")}</ol>`;
}
function wireStats() {
  const g = id => document.getElementById(id);
  if (g("stRetry")) g("stRetry").onclick = () => { SFX.tap(); loadStats(true); renderMap(); };
  if (!TS.data) return;
  g("stCls").onchange = e => { TS.cls = e.target.value; renderMap(); };
  $app.querySelectorAll("[data-per]").forEach(b => b.onclick = () => { SFX.tap(); TS.period = b.dataset.per; renderMap(); });
  $app.querySelectorAll("[data-sort]").forEach(b => b.onclick = () => { SFX.tap(); const k = b.dataset.sort; TS.dir = TS.sort === k ? -TS.dir : (k === "no" || k === "name" ? 1 : -1); TS.sort = k; renderMap(); });
  g("stRefresh").onclick = () => { SFX.tap(); TS.data = null; loadStats(true); renderMap(); };
  g("stCsv").onclick = () => { SFX.tap(); downloadStatsCsv(); };
}
function downloadStatsCsv() {
  const C = computeStats(), q = v => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
  const head = ["Class", "No.", "English name", "Chinese name", "Activities", "Questions", "Correct", "Accuracy %", "Minutes", "Current streak", "Best streak", "Stages cleared", "Stars", "Mistakes waiting", "Trophies", "Last active"];
  const lines = [head.map(q).join(",")].concat(C.rows.map(r => [r.s.cls, r.s.no, r.s.en, r.s.zh, r.sess, r.ans, r.cor, r.acc == null ? "" : r.acc, r.mins, r.streak, r.best, r.stages, r.stars, r.mistakes, r.trophies, r.last ? r.last.slice(0, 10) : ""].map(q).join(",")));
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" }), a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `biology-stats-${TS.cls === "all" ? "all" : TS.cls}-${today()}.csv`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
