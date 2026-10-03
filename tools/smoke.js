// Browser smoke test: NODE_PATH=$(npm root -g) node tools/smoke.js [outdir]
const { chromium } = require("playwright");
const path = require("path");
const out = process.argv[2] || ".";
(async () => {
  const browser = await chromium.launch();
  const errors = [];
  for (const [w, h, tag] of [[390, 844, "phone"], [1200, 900, "desktop"]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    page.on("pageerror", e => errors.push(`${tag}: ${e.message}`));
    page.on("console", m => { if (m.type() === "error") errors.push(`${tag} console: ${m.text()}`); });
    await page.goto("file://" + path.resolve("index.html"));
    await page.screenshot({ path: `${out}/${tag}-0-login.png`, fullPage: true });
    await page.click("#lgGuest");
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/${tag}-1-welcome.png`, fullPage: true });
    await page.fill("#nm", "Tester");
    await page.selectOption("#tp", "1");
    await page.click("#go");
    await page.waitForTimeout(600);
    if (await page.evaluate(() => homeTab !== "home" || !document.querySelector(".capad"))) errors.push(`${tag}: welcome did not land on Home`);
    await page.evaluate(() => enterRoom(S.current_room));
    await page.waitForTimeout(400);
    await page.evaluate(() => { R.incidents = 99; });
    await page.screenshot({ path: `${out}/${tag}-2-room.png`, fullPage: true });
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (scroll > 0) errors.push(`${tag}: horizontal scroll ${scroll}px in room`);
    // Solve all 5 locks (3 questions each) using the answers in R.qs; answer the very first one wrong once
    let shot = 0, wrongDone = false;
    for (let i = 0; i < 5; i++) {
      for (let k = 0; k < 3; k++) {
        await page.evaluate(i => { R.jam[i] = 0; openPuzzle(i); R.openedAt = 0; R.lastWrongAt = 0; }, i);
        await page.waitForTimeout(120);
        const p = await page.evaluate(i => { const p = curQ(i); return { type: p.type, answer: p.answer }; }, i);
        if (!wrongDone && p.type === "mc") {
          await page.click(`.choice:not([data-i="${p.answer}"])`); wrongDone = true;
          await page.waitForTimeout(200); await page.evaluate(i => { R.jam[i] = 0; openPuzzle(i); }, i); await page.waitForTimeout(100);
        }
        if (shot < 4 && (p.type !== "mc" || shot === 0)) { await page.screenshot({ path: `${out}/${tag}-3-puzzle-${p.type}-${shot++}.png`, fullPage: false }); }
        if (p.type === "mc") await page.click(`.choice[data-i="${p.answer}"]`);
        else if (p.type === "spell") { await page.fill("#spIn", p.answer); await page.click("#spOk"); }
        else { await page.evaluate(i => { const p = curQ(i); p.answer.forEach((a, d) => setDial(d, a, p)); }, i); await page.click("#dok"); }
        await page.waitForTimeout(200);
        if (i === 0 && k === 0) await page.screenshot({ path: `${out}/${tag}-4-solved.png`, fullPage: false });
        await page.click("#collect");
        await page.waitForTimeout(120);
      }
    }
    // Escape 2.0: find the 3 specimens and wire them into the Bio-Machine, then open the door
    await page.evaluate(() => { closeModal(); renderRoom(); document.querySelectorAll("[data-spec]").forEach(b => b.click()); closeModal(); openMachine(); });
    for (let k = 0; k < 3; k++) await page.evaluate(k => { const sp = specRun(), m = R.room.terms[sp.terms[k]][1]; document.querySelector(`[data-plug="${k}"]`).click(); [...document.querySelectorAll("[data-sock]")].find(b => b.textContent === m).click(); }, k);
    if (!(await page.evaluate(() => specRun().power))) errors.push(`${tag}: Bio-Machine did not power up`);
    await page.evaluate(() => { closeModal(); renderRoom(); });
    await page.evaluate(() => openDoor());
    const code = await page.evaluate(() => R.room.code);
    for (const k of code) await page.click(`.key[data-k="${k}"]`);
    await page.click("#kok");
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${out}/${tag}-5-escaped.png`, fullPage: false });
    await page.click("#eMap");
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${tag}-6-map.png`, fullPage: true });
    const scroll2 = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (scroll2 > 0) errors.push(`${tag}: horizontal scroll ${scroll2}px on map: ` + await page.evaluate(() => [...document.querySelectorAll("body *")].filter(e => e.getBoundingClientRect().right > innerWidth + .5).slice(0, 5).map(e => e.tagName + "." + (typeof e.className === "string" ? e.className : "") + " " + Math.round(e.getBoundingClientRect().right)).join(", ")));
    // Save code round trip
    const rt = await page.evaluate(() => { const c = makeCode(); const d = decodeCode(c); return { c, d, done: TOPICS.map((_, i) => stagesDone(i)) }; });
    console.log(tag, "code", rt.c, JSON.stringify(rt.d.done), "expected", JSON.stringify(rt.done));
    if (JSON.stringify(rt.d.done) !== JSON.stringify(rt.done)) errors.push(`${tag}: save code round trip mismatch`);
    // Journal, shop, rush, leaderboard, cabinet
    await page.evaluate(() => openJournal("t6s1")); await page.waitForTimeout(200);
    await page.screenshot({ path: `${out}/${tag}-7-journal.png`, fullPage: false });
    await page.evaluate(() => { $journal.innerHTML = ""; openShop(); }); await page.waitForTimeout(200);
    await page.screenshot({ path: `${out}/${tag}-8-shop.png`, fullPage: false });
    await page.evaluate(() => { closeModal(); startRush(); });
    for (let k = 0; k < 10; k++) {
      await page.waitForTimeout(300);
      const t = await page.evaluate(() => document.getElementById("rType") && document.getElementById("rType").textContent);
      if (k === 2 || t === "Organelle spotter") await page.screenshot({ path: `${out}/${tag}-9-rush-${k}.png`, fullPage: false });
      await page.evaluate(() => { const b = document.querySelector("#rBody .rbtn:not(:disabled)"); if (b) b.click(); });
      await page.waitForTimeout(1800);
    }
    await page.evaluate(() => rushEnd()); await page.waitForTimeout(300);
    await page.evaluate(() => { closeModal(); renderMap(); openLeaderboard(); }); await page.waitForTimeout(200);
    await page.evaluate(() => { closeModal(); openSaveModal(); }); await page.waitForTimeout(200);
    await page.screenshot({ path: `${out}/${tag}-10-save.png`, fullPage: false });
    await page.evaluate(() => { closeModal(); renderNotebook(); }); await page.waitForTimeout(200);
    await page.screenshot({ path: `${out}/${tag}-12-notebook.png`, fullPage: true });
    const nb = await page.evaluate(() => mistakeKeys().length);
    if (nb < 1) errors.push(`${tag}: mistake notebook is empty after a wrong answer`);
    await page.click("#nbAll"); await page.waitForTimeout(200);
    await page.screenshot({ path: `${out}/${tag}-13-revise.png`, fullPage: false });
    // Every diagram and every stage scene renders
    for (const id of await page.evaluate(() => ROOMS.map(r => r.id))) {
      await page.evaluate(id => { closeModal(); enterRoom(id); R.incidents = 99; }, id);
    }
    if (tag === "desktop") for (const id of ["t14s2", "t16s4", "t19s3", "t10s1", "t15s1", "t9s1"]) {
      await page.evaluate(id => { closeModal(); enterRoom(id); R.incidents = 99; }, id); await page.waitForTimeout(250);
      await (await page.$("#scene")).screenshot({ path: `${out}/scene-${id}.png` });
    }
    await page.close();
  }
  await browser.close();
  console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "No errors");
})();
