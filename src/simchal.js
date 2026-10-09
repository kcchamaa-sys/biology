/* ============================================================
   5f-3. 🎯 Lab challenges: a ~15-minute mission set after every simulation
   SIM_CH[id] = { title, story, mins: 15, missions: [{ ic, name, tasks: [task, …] }] }   (defined next to each sim)
   Task types (full reference + examples: docs/SIM_LAB_GUIDE.md):
     goal  – "Make it happen": check(p) must stay true for `hold` seconds (p = the sim's live probe). Optional meter(p).
     read  – "Measure": type numbers read from the sim. fields: [[label, answer or () => answer, tolerance, unit]].
     pick  – "Choose": one right option (always written FIRST; the engine shuffles). miss: notes for wrong options.
     fill  – "Complete the sentence": text with {right|wrong|wrong} blanks (right option first).
     order – "Put in order": items in the correct order; the engine shuffles.
   Any task may have need(p) + needTxt: the answer stays locked until the sim has been set up that way once.
   The last mission ("🧠 Exam check") is built from SIM_Q[id] automatically.
   Progress: S.simc[id] = { d: { "m.t": 1 }, w: wrong answers, h: hints, secs, fin }.
   ============================================================ */
const CH_TYPE = { goal: ["🎛️", "Do it"], read: ["📏", "Measure"], pick: ["🤔", "Choose"], fill: ["✍️", "Complete the sentence"], order: ["🔢", "Put in order"] };
let LABCH = null;
function chalMissions(id) {
  const def = SIM_CH[id]; if (!def) return [];
  const ms = def.missions.slice();
  if (SIM_Q[id] && !def.noExam) ms.push({ ic: "🧠", name: "Exam check", tasks: SIM_Q[id].map(([q, ch, why]) => ({ type: "pick", do: q, opts: ch, why })) });
  return ms;
}
function chalTasks(id) { return chalMissions(id).flatMap((m, mi) => m.tasks.map((t, ti) => Object.assign({ key: mi + "." + ti, mi }, t))); }
const chalRec = id => { S.simc = S.simc || {}; return S.simc[id] = S.simc[id] || { d: {}, w: 0, h: 0, secs: 0 }; };
const chalStars = c => c.w <= 2 ? 3 : c.w <= 6 ? 2 : 1;
const chalClock = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
// Key words from the word bank become tappable (🔊) in task text. Authors may use <b>, <i>, <br> and ↑ ↓ → arrows.
function chalText(html, words) {
  let out = String(html); const keep = [];
  (words || []).slice().sort((a, b) => b[0].length - a[0].length).forEach(([w, ic, m]) => {
    const re = new RegExp(`(^|[^\\w>="-])(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}s?)(?![\\w<])`, "i");
    out = out.replace(re, (_, pre, word) => { keep.push(`<button class="chkw" data-say="${esc(w)}" title="${esc(m)}"><span aria-hidden="true">${ic}</span>${word}</button>`); return `${pre}\u0001${keep.length - 1}\u0002`; });
  });
  return out.replace(/\u0001(\d+)\u0002/g, (_, i) => keep[i]);
}
function simChallenge(root, id) {
  if (!SIM_CH[id]) return;
  const card = document.createElement("section"); card.className = "card simchal"; card.id = "simChal";
  root.appendChild(card);
  const dock = document.createElement("div"); dock.className = "chdock"; dock.id = "chDock"; dock.hidden = true;
  root.appendChild(dock);
  const old = LABCH; if (old && old.timer) clearInterval(old.timer);
  LABCH = { id, root, card, dock, def: SIM_CH[id], words: (SIMS.find(x => x.id === id) || {}).words || [], need: {}, hold: {}, picks: {}, order: {}, fb: null, tick: performance.now() };
  chalRender();
  const me = LABCH;
  me.timer = setInterval(() => {
    if (LABCH !== me || !card.isConnected) { clearInterval(me.timer); if (LABCH === me) LABCH = null; return; }
    chalPoll();
  }, 250);
  if ("IntersectionObserver" in window) {
    me.io = new IntersectionObserver(es => es.forEach(e => { me.curVisible = e.isIntersecting; chalDock(); }), { threshold: .25 });
  }
}
function chalCurrent() { const c = chalRec(LABCH.id); return chalTasks(LABCH.id).find(t => !c.d[t.key]); }
function chalRender() {
  const { id, card, def } = LABCH, c = chalRec(id), ms = chalMissions(id), tasks = chalTasks(id), done = tasks.filter(t => c.d[t.key]).length;
  const cur = LABCH.fb ? tasks.find(t => t.key === LABCH.fb.key) : chalCurrent();
  const curM = cur ? cur.mi : ms.length;
  const missionDone = mi => ms[mi].tasks.every((_, ti) => c.d[mi + "." + ti]);
  card.innerHTML = `
    <div class="chhead"><span class="kicker">🎯 Challenge · ⏱ about ${def.mins || 15} min</span>
      <h3>${esc(def.title)}</h3>${def.story ? `<p class="chstory">${chalText(def.story, LABCH.words)}</p>` : ""}
      <div class="chmeta"><span class="pill">✅ ${done}/${tasks.length}</span><span class="pill" id="chClock">⏱ ${chalClock(c.secs || 0)}</span>${c.fin ? `<span class="pill">${"⭐".repeat(chalStars(c))}</span>` : ""}</div>
      <ol class="chbar" aria-label="Missions">${ms.map((m, mi) => `<li class="${missionDone(mi) ? "done" : mi === curM ? "now" : ""}" title="${esc(m.name)}"><span class="chdot" aria-hidden="true">${missionDone(mi) ? "✓" : m.ic}</span><span class="chmn">${esc(m.name)}</span></li>`).join("")}</ol></div>
    ${!cur ? chalFinishHtml(c, tasks) : `<div class="chmission"><h4>${ms[curM].ic} Mission ${curM + 1}: ${esc(ms[curM].name)} <small>${ms[curM].tasks.filter((_, ti) => c.d[curM + "." + ti]).length}/${ms[curM].tasks.length}</small></h4>
      <div class="chtasks">${ms[curM].tasks.map((t, ti) => { const T = Object.assign({ key: curM + "." + ti, mi: curM }, t); return T.key === cur.key ? chalTaskHtml(T) : c.d[T.key] ? `<div class="cht done"><span aria-hidden="true">✅</span><span>${chalText(T.do, [])}</span></div>` : `<div class="cht locked"><span aria-hidden="true">🔒</span><span>${CH_TYPE[T.type][0]} ${CH_TYPE[T.type][1]}</span></div>`; }).join("")}</div></div>`}`;
  chalWire(cur);
  if (LABCH.io) { LABCH.io.disconnect(); const el = card.querySelector(".cht.cur, .chfin"); if (el) LABCH.io.observe(el); }
  chalDock(); chalPoll(true);
}
function chalFinishHtml(c, tasks) {
  const st = chalStars(c);
  return `<div class="chfin"><div class="chtrophy" aria-hidden="true">🏆</div><h4>Challenge complete!</h4>
    <p class="chstars" aria-label="${st} stars">${"⭐".repeat(st)}${"☆".repeat(3 - st)}</p>
    <div class="chmeta"><span class="pill">✅ ${tasks.length} tasks</span><span class="pill">⏱ ${chalClock(c.secs || 0)}</span><span class="pill">❌ ${c.w} wrong</span><span class="pill">💡 ${c.h} hints</span></div>
    <p class="small muted">⭐⭐⭐ = 2 or fewer wrong answers. Replay to practise and beat your stars.</p>
    <div class="row simbtns"><button class="btn" id="chAgain">🔁 Replay challenge</button>${chalNextSim() ? `<button class="btn yellow" id="chNext">Next simulation ›</button>` : ""}</div></div>`;
}
function chalNextSim() { const i = SIMS.findIndex(x => x.id === LABCH.id); return SIMS.slice(i + 1).concat(SIMS.slice(0, i)).find(x => SIM_CH[x.id] && !simChalState(x.id)[2]); }
function chalTaskHtml(t) {
  const [tic, tnm] = CH_TYPE[t.type], fb = LABCH.fb && LABCH.fb.key === t.key ? LABCH.fb : null, W = LABCH.words;
  let body = "";
  if (t.type === "goal") body = `<div class="chgoal"><span class="chlight" data-light aria-hidden="true"></span><span class="chgt">${esc(t.target || "Waiting for you to set it up…")}</span></div>${t.meter ? `<div class="chmeter" data-meter></div>` : ""}`;
  else if (t.type === "read") body = `<div class="chread">${(t.fields || [[t.label || "Answer", t.ans, t.tol, t.unit]]).map(([lab, , , unit], i) => `<label class="chfield"><span>${esc(lab)}</span><span class="chin"><input type="text" inputmode="decimal" autocomplete="off" data-rf="${i}" aria-label="${esc(lab)}">${unit ? `<b>${esc(unit)}</b>` : ""}</span><span class="chmark" data-rm="${i}"></span></label>`).join("")}</div><button class="btn" data-chk>✔ Check</button>`;
  else if (t.type === "pick") {
    const order = LABCH.picks[t.key] = LABCH.picks[t.key] || shuffle(t.opts.map((_, k) => k));
    body = `<div class="choices chpick">${order.map((k, n) => { const o = t.opts[k], [txt, ic] = Array.isArray(o) ? o : [o, ""]; return `<button class="choice" data-pk="${k}"><b>${"ABCD"[n]}</b><span>${ic ? `<span class="chpic" aria-hidden="true">${ic}</span>` : ""}${esc(txt)}</span></button>`; }).join("")}</div>`;
  } else if (t.type === "fill") {
    let n = 0;
    body = `<p class="chfill">${esc(t.text).replace(/\{([^}]+)\}/g, (_, g) => { const opts = g.split("|"), i = n++, ord = LABCH.picks[t.key + "f" + i] = LABCH.picks[t.key + "f" + i] || shuffle(opts.map((_, k) => k));
      return `<select data-fb="${i}" aria-label="Blank ${i + 1}"><option value="">▾ choose</option>${ord.map(k => `<option value="${k}">${opts[k]}</option>`).join("")}</select>`; })}</p><button class="btn" data-chk>✔ Check</button>`;
  } else if (t.type === "order") {
    const pool = LABCH.picks[t.key] = LABCH.picks[t.key] || chalShuffleOrder(t.items.length), got = LABCH.order[t.key] = LABCH.order[t.key] || [];
    body = `<ol class="chorder">${got.map((k, n) => `<li><button class="chochip on" data-oo="${n}" aria-label="Remove: ${esc(t.items[k])}"><b>${n + 1}</b>${esc(t.items[k])}<span aria-hidden="true">✕</span></button></li>`).join("")}${got.length < t.items.length ? `<li class="chslot">${got.length + 1}. tap the next step ↓</li>` : ""}</ol>
      <div class="chopool">${pool.filter(k => !got.includes(k)).map(k => `<button class="chochip" data-op="${k}">${esc(t.items[k])}</button>`).join("")}</div>
      <div class="row"><button class="btn" data-chk ${got.length < t.items.length ? "disabled" : ""}>✔ Check</button><button class="btn plain" data-oclr>↺ Clear</button></div>`;
  }
  const needOk = !t.need || LABCH.need[t.key];
  return `<div class="cht cur ${fb ? (fb.ok ? "isok" : "") : ""}" data-ct="${t.key}">
    <div class="chtop"><span class="chic" aria-hidden="true">${t.ic || tic}</span><div class="chtxt"><span class="chtype">${tic} ${tnm}</span><p class="chdo">${chalText(t.do, W)}</p>
      ${t.look ? `<span class="chlook">👀 ${esc(t.look)}</span>` : ""}</div></div>
    ${t.need ? `<div class="chneed ${needOk ? "ok" : ""}" data-need><span class="chlight ${needOk ? "on" : ""}" aria-hidden="true"></span><span><b>${needOk ? "✅ Set up" : "🔒 First, in the simulation:"}</b> ${chalText(t.needTxt || "", W)}</span></div>` : ""}
    <div class="chbody ${needOk ? "" : "chwait"}" ${needOk ? "" : "inert"}>${fb && fb.ok ? "" : body}</div>
    <div class="chfoot">${fb && fb.ok ? "" : t.hint ? `<button class="btn plain chhintb" data-hint>💡 Hint</button>` : ""}<div class="chhint" data-hintbox ${LABCH.hintOpen === t.key ? "" : "hidden"}>${t.hint ? chalText(t.hint, W) : ""}</div>
      <div class="chfb" aria-live="polite">${fb ? fb.html : ""}</div></div></div>`;
}
function chalShuffleOrder(n) { let o; do { o = shuffle([...Array(n).keys()]); } while (n > 1 && o.every((k, i) => k === i)); return o; }
function chalWire(t) {
  const { card } = LABCH;
  card.querySelector("#chAgain") && (card.querySelector("#chAgain").onclick = () => { SFX.tap(); const c = chalRec(LABCH.id); c.d = {}; c.w = 0; c.h = 0; c.secs = 0; save(); LABCH.picks = {}; LABCH.order = {}; LABCH.need = {}; chalRender(); card.scrollIntoView({ behavior: "smooth", block: "start" }); });
  card.querySelector("#chNext") && (card.querySelector("#chNext").onclick = () => { SFX.tap(); renderSims(chalNextSim().id); });
  card.querySelector("[data-next]") && (card.querySelector("[data-next]").onclick = () => { SFX.tap(); LABCH.fb = null; LABCH.hintOpen = null; chalRender(); const el = card.querySelector(".cht.cur, .chfin"); el && el.scrollIntoView({ behavior: "smooth", block: "center" }); });
  if (!t) return;
  const el = card.querySelector(`[data-ct="${t.key}"]`); if (!el || (LABCH.fb && LABCH.fb.key === t.key)) return;
  const hb = el.querySelector("[data-hint]");
  if (hb) hb.onclick = () => { SFX.tap(); const box = el.querySelector("[data-hintbox]"); box.hidden = !box.hidden; if (!box.hidden && LABCH.hintOpen !== t.key) { chalRec(LABCH.id).h++; save(); } LABCH.hintOpen = box.hidden ? null : t.key; };
  if (t.type === "pick") el.querySelectorAll("[data-pk]").forEach(b => b.onclick = () => {
    const k = Number(b.dataset.pk);
    if (k === 0) { b.classList.add("right"); chalDone(t, `✅ ${chalText(t.why || "Correct!", LABCH.words)}`); }
    else { b.classList.add("wrong"); b.disabled = true; chalWrong(t, (t.miss && t.miss[k]) || "Not quite. Use the simulation to test it, then try again."); }
  });
  if (t.type === "read") el.querySelector("[data-chk]").onclick = () => {
    const F = t.fields || [[t.label || "Answer", t.ans, t.tol, t.unit]];
    let ok = 0;
    F.forEach(([, ans, tol], i) => {
      const a = typeof ans === "function" ? ans(SIM_PROBE ? SIM_PROBE() : {}) : ans, v = parseFloat(String(el.querySelector(`[data-rf="${i}"]`).value).replace(/[^\d.\-]/g, ""));
      const tl = tol != null ? tol : Math.max(1, Math.abs(a) * .05), good = Number.isFinite(v) && Math.abs(v - a) <= tl + 1e-9;
      el.querySelector(`[data-rm="${i}"]`).textContent = good ? "✅" : "❌"; ok += good;
    });
    if (ok === F.length) chalDone(t, `✅ ${chalText(t.why || "Well measured!", LABCH.words)}`);
    else chalWrong(t, `${ok}/${F.length} correct. ${t.readTip || "Look at the simulation again: check the units and read the value carefully."}`);
  };
  if (t.type === "fill") el.querySelector("[data-chk]").onclick = () => {
    const sel = [...el.querySelectorAll("[data-fb]")];
    if (sel.some(s => s.value === "")) { SFX.tap(); el.querySelector(".chfb").innerHTML = `<p class="chbad">✍️ Choose a word for every blank first.</p>`; return; }
    sel.forEach(s => s.classList.toggle("bad", s.value !== "0"));
    sel.forEach(s => s.classList.toggle("good", s.value === "0"));
    const bad = sel.filter(s => s.value !== "0").length;
    if (!bad) chalDone(t, `✅ ${chalText(t.why || "Great sentence!", LABCH.words)}`); else chalWrong(t, `${bad} blank${bad > 1 ? "s are" : " is"} not right yet (marked in red). Check with the simulation.`);
  };
  if (t.type === "order") {
    const got = LABCH.order[t.key];
    el.querySelectorAll("[data-op]").forEach(b => b.onclick = () => { SFX.tap(); got.push(Number(b.dataset.op)); chalRender(); const nb = LABCH.card.querySelector("[data-op]") || LABCH.card.querySelector("[data-chk]"); nb && nb.focus(); });
    el.querySelectorAll("[data-oo]").forEach(b => b.onclick = () => { SFX.tap(); got.splice(Number(b.dataset.oo), 1); chalRender(); });
    el.querySelector("[data-oclr]").onclick = () => { SFX.tap(); got.length = 0; chalRender(); };
    el.querySelector("[data-chk]").onclick = () => {
      const right = got.filter((k, i) => k === i).length;
      if (right === t.items.length) chalDone(t, `✅ ${chalText(t.why || "Perfect order!", LABCH.words)}`);
      else { el.querySelectorAll("[data-oo]").forEach((b, i) => b.classList.add(got[i] === i ? "good" : "bad")); chalWrong(t, `${right}/${t.items.length} in the right place (green). Tap the red ones to take them out, then try again.`, true); }
    };
  }
}
function chalWrong(t, msg, keep) {
  SFX.wrong(); const c = chalRec(LABCH.id); c.w++; save();
  const el = LABCH.card.querySelector(`[data-ct="${t.key}"] .chfb`); if (el) el.innerHTML = `<p class="chbad">❌ ${chalText(msg, LABCH.words)}</p>`;
  if (!keep && t.type === "order") LABCH.order[t.key] = [];
}
function chalDone(t, html) {
  const c = chalRec(LABCH.id); if (c.d[t.key]) return;
  c.d[t.key] = 1; SFX.right();
  const ms = chalMissions(LABCH.id), mDone = ms[t.mi].tasks.every((_, ti) => c.d[t.mi + "." + ti]), all = chalTasks(LABCH.id).every(x => c.d[x.key]);
  let gain = 2, extra = "";
  if (mDone) { gain += 5; extra += `<p class="chgood">🎉 <b>Mission ${t.mi + 1} complete!</b> +5 🌰</p>`; activityDone({ mode: "sim", sim: LABCH.id, ans: ms[t.mi].tasks.length, cor: ms[t.mi].tasks.length }); }
  if (all) { gain += 20; c.fin = c.fin || today(); extra += `<p class="chgood">🏆 <b>Challenge complete!</b> +20 🌰</p>`; if (typeof confetti === "function") confetti(120); }
  gain = withStreak(gain); S.coins += gain; S.stats.correct += 1; save(true); renderTools(); if (all) checkTrophies();
  LABCH.fb = { key: t.key, ok: true, html: `<div class="chgood">${html} <b>+${gain} 🌰</b></div>${extra}<button class="btn" data-next>${all ? "See my result 🏆" : mDone ? "Next mission ›" : "Next task ›"}</button>` };
  chalRender();
}
// Live checks: goal tasks complete themselves; "need" locks open once the sim is set up; meters and the dock follow the sim.
function chalPoll(first) {
  if (!LABCH) return;
  const now = performance.now(), dt = Math.min(1, (now - LABCH.tick) / 1000); LABCH.tick = now;
  const c = chalRec(LABCH.id), t = LABCH.fb ? null : chalCurrent();
  if (!c.fin && !document.hidden && !first) { c.secs = (c.secs || 0) + dt; const ck = LABCH.card.querySelector("#chClock"); if (ck) ck.textContent = "⏱ " + chalClock(c.secs); }
  if (!t) return;
  let p = {}; try { p = SIM_PROBE ? SIM_PROBE() || {} : {}; } catch (e) { p = {}; }
  const el = LABCH.card.querySelector(`[data-ct="${t.key}"]`); if (!el) return;
  const ok = f => { try { return !!f(p); } catch (e) { return false; } };
  if (t.need && !LABCH.need[t.key] && ok(t.need)) { LABCH.need[t.key] = 1; SFX.tap(); chalRender(); return; }
  if (t.type === "goal") {
    const on = ok(t.check), light = el.querySelector("[data-light]");
    LABCH.hold[t.key] = on ? (LABCH.hold[t.key] || 0) + dt : 0;
    if (light) light.classList.toggle("on", on);
    if (t.meter) { const m = el.querySelector("[data-meter]"); if (m) { try { m.innerHTML = chalMeter(t.meter(p)); } catch (e) {} } }
    if (on && LABCH.hold[t.key] >= (t.hold != null ? t.hold : 1)) { chalDone(t, `✅ ${chalText(t.why || "You did it!", LABCH.words)}`); return; }
  }
  chalDock(p);
}
// A horizontal gauge with a green target zone: { v, min, max, lo, hi, unit, label }
function chalMeter(m) {
  const pc = x => clamp((x - m.min) / (m.max - m.min) * 100, 0, 100), inZone = m.v >= m.lo && m.v <= m.hi;
  return `<div class="chgauge" role="img" aria-label="${esc(m.label || "Value")}: ${m.v}${m.unit || ""}, target ${m.lo}–${m.hi}"><span class="chzone" style="left:${pc(m.lo)}%;width:${pc(m.hi) - pc(m.lo)}%"></span><span class="chneedle ${inZone ? "in" : ""}" style="left:${pc(m.v)}%"></span></div>
    <div class="chglab"><span>${esc(m.label || "Now")}: <b>${typeof m.v === "number" ? +m.v.toFixed(1) : m.v}${esc(m.unit || "")}</b></span><span>🎯 ${m.lo}–${m.hi}${esc(m.unit || "")} ${inZone ? "✅" : ""}</span></div>`;
}
// Sticky task dock: the current task stays in view while the student scrolls up to use the simulation.
function chalDock() {
  if (!LABCH) return;
  const t = LABCH.fb ? null : chalCurrent(), d = LABCH.dock, all = chalTasks(LABCH.id), c = chalRec(LABCH.id);
  if (LABCH.fb && !LABCH.curVisible) {
    const why = LABCH.fb.html.replace(/<button class="btn" data-next[\s\S]*$/, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const html = `<div class="chdockb ok"><span class="chic" aria-hidden="true">✅</span><button class="chdt" data-dock><small>🎯 Task done! Tap to read more</small>${esc(why)}</button><button class="btn" data-dnext>Next ›</button></div>`;
    if (d.dataset.h !== html) {
      d.dataset.h = html; d.innerHTML = html;
      d.querySelector("[data-dock]").onclick = () => { SFX.tap(); const el = LABCH.card.querySelector(".cht.cur"); el && el.scrollIntoView({ behavior: "smooth", block: "center" }); };
      d.querySelector("[data-dnext]").onclick = () => { SFX.tap(); LABCH.fb = null; LABCH.hintOpen = null; chalRender(); };
    }
    d.hidden = false; return;
  }
  if (!t || LABCH.curVisible || c.fin) { d.hidden = true; return; }
  const n = all.findIndex(x => x.key === t.key) + 1, txt = String(t.do).replace(/<[^>]+>/g, "");
  const html = `<button class="chdockb" data-dock><span class="chic" aria-hidden="true">${t.ic || CH_TYPE[t.type][0]}</span><span class="chdt"><small>🎯 Task ${n}/${all.length}</small>${esc(txt)}</span>${t.type === "goal" || (t.need && !LABCH.need[t.key]) ? `<span class="chlight ${LABCH.card.querySelector(`[data-ct="${t.key}"] .chlight.on`) ? "on" : ""}" aria-hidden="true"></span>` : ""}<span class="chgo" aria-hidden="true">▾</span></button>`;
  if (d.dataset.h !== html) { d.dataset.h = html; d.innerHTML = html; d.querySelector("[data-dock]").onclick = () => { SFX.tap(); const el = LABCH.card.querySelector(".cht.cur"); el && el.scrollIntoView({ behavior: "smooth", block: "center" }); }; }
  d.hidden = false;
}
