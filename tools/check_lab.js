// Lab check: every simulation renders without errors at phone width, and every 🎯 challenge is valid and can be finished.
// Run: python3 tools/build.py && NODE_PATH=$(npm root -g) node tools/check_lab.js [simId …]
// See docs/SIM_LAB_GUIDE.md. Goal tasks are completed directly (their check() must be a function); the other task types
// are answered through the real buttons, selects and inputs.
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const only = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [], warns = [], popups = [];
  let where = "load";
  page.on("pageerror", e => errors.push(`${where}: ${e.message}`));
  page.on("console", m => { if (m.type() === "error" && !/ERR_NAME_NOT_RESOLVED|ERR_INTERNET|net::/.test(m.text())) errors.push(`${where} console: ${m.text()}`); });
  // Trophies / level-ups pop up as students earn 🌰: note them and close them so play can go on.
  const unpop = async () => { const x = await page.evaluate(() => { const m = document.getElementById("modal"), x = m && m.textContent.replace(/\s+/g, " ").trim().slice(0, 60); if (x) closeModal(); return x; }); if (x && !popups.includes(x)) popups.push(x); };
  await page.goto("file://" + path.resolve("index.html"));
  await page.click("#lgGuest"); await page.waitForTimeout(300);
  await page.fill("#nm", "Tester"); await page.selectOption("#tp", "1"); await page.click("#go"); await page.waitForTimeout(500);
  await page.addStyleTag({ content: "#modal{display:none!important}" }); // pop-ups can open at any moment (timers); keep them from blocking clicks
  const ids = await page.evaluate(() => SIMS.map(s => s.id));
  const secs = await page.evaluate(() => SIM_SECS.map(s => s[0]));
  for (const s of secs) if (!(await page.evaluate(s => SIMS.some(x => x.sec === s), s))) errors.push(`section ${s} has no simulation`);
  for (const id of ids) {
    if (only.length && !only.includes(id)) continue;
    where = id;
    const meta = await page.evaluate(id => { const s = SIMS.find(x => x.id === id); return { words: (s.words || []).length, topic: s.topic, hasTopic: TOPICS.some(T => T.id === s.topic), pred: !!SIM_P[id], exam: (SIM_Q[id] || []).length }; }, id);
    if (!meta.hasTopic) errors.push(`${id}: topic "${meta.topic}" is not a TOPICS id`);
    if (meta.words < 4) warns.push(`${id}: only ${meta.words} key words (aim for 5–8)`);
    if (!meta.pred) warns.push(`${id}: no SIM_P predict-first question`);
    if (meta.exam < 2) warns.push(`${id}: ${meta.exam} SIM_Q exam questions (aim for 2)`);
    await page.evaluate(id => { S.simc = {}; renderSims(id); }, id); await page.waitForTimeout(400);
    const sk = await page.$("#spSkip"); if (sk) await sk.click();
    await page.waitForTimeout(700);
    const probe = await page.evaluate(() => { try { return SIM_PROBE ? JSON.stringify(SIM_PROBE()) : null; } catch (e) { return "ERR " + e.message; } });
    if (!probe || probe.startsWith("ERR")) errors.push(`${id}: probe missing or broken (${probe})`);
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (scroll > 0) errors.push(`${id}: horizontal scroll ${scroll}px at 390 px: ` + await page.evaluate(() => [...document.querySelectorAll("#app *")].filter(e => e.getBoundingClientRect().right > innerWidth + .5 && !e.closest(".simsvg")).slice(0, 4).map(e => e.tagName + "." + (typeof e.className === "string" ? e.className : "")).join(", ")));
    // Validate the challenge data
    const v = await page.evaluate(id => {
      const out = { err: [], warn: [], n: 0, sim: 0 };
      if (!SIM_CH[id]) { out.err.push("no SIM_CH challenge"); return out; }
      const T = chalTasks(id); out.n = T.length;
      T.forEach(t => {
        const k = `${id} task ${t.key}`;
        if (!CH_TYPE[t.type]) out.err.push(`${k}: unknown type ${t.type}`);
        if (!t.do) out.err.push(`${k}: no "do" text`);
        if (t.need && typeof t.need !== "function") out.err.push(`${k}: need must be a function`);
        if (t.type === "goal") { if (typeof t.check !== "function") out.err.push(`${k}: goal without check()`); }
        if (t.type === "pick" && (!Array.isArray(t.opts) || t.opts.length < 2)) out.err.push(`${k}: pick needs ≥ 2 opts`);
        if (t.type === "fill" && !/\{[^}|]+\|[^}]+\}/.test(t.text || "")) out.err.push(`${k}: fill text has no {right|wrong} blank`);
        if (t.type === "order" && (!Array.isArray(t.items) || t.items.length < 3)) out.err.push(`${k}: order needs ≥ 3 items`);
        if (t.type === "read") { const F = t.fields || [[t.label, t.ans, t.tol, t.unit]]; F.forEach(f => { if (typeof f[1] !== "number" && typeof f[1] !== "function") out.err.push(`${k}: read answer must be a number or function`); }); }
        if (t.type === "goal" || t.type === "read" || t.need) out.sim++;
        if (String(t.do).replace(/<[^>]+>/g, "").split(/\s+/).length > 32) out.warn.push(`${k}: "do" text is long (${String(t.do).split(/\s+/).length} words)`);
      });
      if (T.length < 14 || T.length > 26) out.warn.push(`${id}: ${T.length} tasks (aim for 15–20 for ~15 min)`);
      if (out.sim * 2 < T.length) out.warn.push(`${id}: only ${out.sim}/${T.length} tasks need the simulation (aim for ≥ half)`);
      return out;
    }, id);
    errors.push(...v.err); warns.push(...v.warn);
    if (v.err.length) continue;
    // Play the challenge to the end
    let guard = 0;
    while (guard++ < 80) {
      const t = await page.evaluate(() => { const t = chalCurrent(); return t ? { key: t.key, type: t.type, items: t.items ? t.items.length : 0, need: !!t.need } : null; });
      if (!t) break;
      await unpop();
      if (await page.evaluate(() => !!LABCH.fb)) { await unpop(); await page.click("#simChal [data-next]"); continue; } // a goal already met on load
      await page.evaluate(k => { if (LABCH.need[k] === undefined) { LABCH.need[k] = 1; chalRender(); } }, t.key);
      const sel = `#simChal [data-ct="${t.key}"]`;
      if (t.type === "goal") await page.evaluate(() => { const t = chalCurrent(); chalDone(t, "test"); });
      else if (t.type === "pick") await page.click(`${sel} [data-pk="0"]`);
      else if (t.type === "fill") { await page.evaluate(sel => document.querySelectorAll(`${sel} [data-fb]`).forEach(s => { s.value = "0"; }), sel); await page.click(`${sel} [data-chk]`); }
      else if (t.type === "order") { for (let i = 0; i < t.items; i++) await page.click(`#simChal [data-op="${i}"]`); await page.click(`${sel} [data-chk]`); }
      else if (t.type === "read") {
        await page.evaluate(sel => { const t = chalCurrent(), F = t.fields || [[t.label, t.ans, t.tol, t.unit]], p = SIM_PROBE ? SIM_PROBE() : {};
          F.forEach(([, a], i) => { document.querySelector(`${sel} [data-rf="${i}"]`).value = String(typeof a === "function" ? a(p) : a); });
          document.querySelector(`${sel} [data-chk]`).click(); }, sel); // one step, so a running model can't change the answer in between
      }
      await page.waitForTimeout(60);
      const ok = await page.evaluate(k => !!chalRec(LABCH.id).d[k], t.key);
      if (!ok) { errors.push(`${id}: task ${t.key} (${t.type}) could not be completed with the right answer`); break; }
      await unpop();
      await page.click("#simChal [data-next]");
    }
    const fin = await page.evaluate(id => { const c = S.simc[id]; return c && c.fin ? 1 : 0; }, id);
    if (!fin) errors.push(`${id}: challenge did not finish`);
    console.log(`✔ ${id}: ${v.n} tasks (${v.sim} use the sim), probe keys: ${probe ? Object.keys(JSON.parse(probe)).join(" ") : "-"}`);
  }
  await browser.close();
  if (popups.length) console.log("Pop-ups closed during play:\n  " + popups.join("\n  "));
  if (warns.length) console.log("Warnings:\n  " + warns.join("\n  "));
  console.log(errors.length ? "ERRORS:\n  " + errors.join("\n  ") : "No errors");
  process.exit(errors.length ? 1 : 0);
})();
