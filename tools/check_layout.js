// Lab layout check: every simulation at phone, iPad and desktop sizes. Finds sideways page scroll, clipped HTML text,
// diagrams that need sideways swiping, SVG labels that are cut off, overlap each other or are too small to read.
// Run: python3 tools/build.py && NODE_PATH=$(npm root -g) node tools/check_layout.js [simId …]   (add --strict to fail on warnings)
// See docs/SIM_LAB_GUIDE.md ("Layout rules").
const { chromium } = require("playwright");
const path = require("path");
const SIZES = [[360, 740, "phone-S"], [390, 844, "phone"], [768, 1024, "iPad"], [1024, 768, "iPad-land"], [1366, 900, "desktop"]];
(async () => {
  const args = process.argv.slice(2), strict = args.includes("--strict"), only = args.filter(a => !a.startsWith("--"));
  const browser = await chromium.launch();
  const errors = [], warns = [];
  for (const [w, h, tag] of SIZES) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    let where = tag;
    page.on("pageerror", e => errors.push(`${where}: ${e.message}`));
    await page.goto("file://" + path.resolve("index.html"));
    await page.click("#lgGuest"); await page.waitForTimeout(300);
    await page.fill("#nm", "Tester"); await page.selectOption("#tp", "1"); await page.click("#go"); await page.waitForTimeout(500);
    await page.addStyleTag({ content: "#modal{display:none!important} *{animation-duration:0s!important;transition:none!important}" });
    const ids = await page.evaluate(() => SIMS.map(s => s.id));
    for (const id of ids) {
      if (only.length && !only.includes(id)) continue;
      where = `${id} @${tag}`;
      await page.evaluate(id => { S.simc = {}; renderSims(id); }, id); await page.waitForTimeout(250);
      const sk = await page.$("#spSkip"); if (sk) await sk.click();
      await page.waitForTimeout(500);
      const r = await page.evaluate(() => {
        const out = { err: [], warn: [] }, app = document.getElementById("app");
        const scroll = document.documentElement.scrollWidth - innerWidth;
        if (scroll > 0) out.err.push(`page scrolls sideways by ${scroll}px`);
        const name = e => e.tagName.toLowerCase() + (typeof e.className === "string" && e.className ? "." + e.className.trim().split(/\s+/)[0] : "");
        const vis = e => { const s = getComputedStyle(e); return s.display !== "none" && s.visibility !== "hidden" && e.getClientRects().length; };
        // 1. HTML text that is cut off (overflow hidden / clip / ellipsis) inside the Lab
        app.querySelectorAll("*").forEach(e => {
          if (e.closest("svg") || !vis(e)) return;
          const s = getComputedStyle(e), txt = (e.textContent || "").trim();
          if (!txt) return;
          const clipX = /hidden|clip/.test(s.overflowX) && e.scrollWidth > e.clientWidth + 2, clipY = /hidden|clip/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 2 && s.webkitLineClamp === "none";
          if ((clipX || clipY) && e.children.length < 3) out.warn.push(`text cut off in ${name(e)}: "${txt.slice(0, 40)}"`);
        });
        // 2. Elements that stick out of their card (masked by the card edge or the screen)
        app.querySelectorAll("section.card").forEach(card => {
          const cr = card.getBoundingClientRect();
          card.querySelectorAll("button, input, select, p, h2, h3, h4, label, span, b, small").forEach(e => {
            if (!vis(e) || e.closest(".simsvg, .slottabs, .chbar, .simseg, svg")) return;
            const r = e.getBoundingClientRect();
            if (r.width && (r.right > cr.right + 1 || r.left < cr.left - 1)) out.warn.push(`${name(e)} sticks out of its card by ${Math.round(Math.max(r.right - cr.right, cr.left - r.left))}px: "${(e.textContent || "").trim().slice(0, 30)}"`);
          });
        });
        // 3. Diagrams that need a sideways swipe (fine for a few very wide models, but fitting is friendlier)
        app.querySelectorAll(".simsvg").forEach(e => { if (vis(e) && e.scrollWidth > e.clientWidth + 4) out.warn.push(`diagram needs sideways swipe (${e.scrollWidth}px in ${e.clientWidth}px)`); });
        // 4. SVG labels: cut off by the SVG edge, overlapping another label, or tiny on screen
        app.querySelectorAll("#simBody svg").forEach(svg => {
          if (!vis(svg) || svg.closest(".chdock, .chic")) return;
          const sr = svg.getBoundingClientRect(); if (sr.width < 60) return;
          const T = [...svg.querySelectorAll("text")].filter(t => vis(t) && (t.textContent || "").trim() && +getComputedStyle(t).opacity !== 0);
          const boxes = T.map(t => ({ t, r: t.getBoundingClientRect(), s: (t.textContent || "").trim().slice(0, 24) }));
          boxes.forEach(({ r, s, t }) => {
            if (!r.width) return;
            if (r.left < sr.left - 2 || r.right > sr.right + 2 || r.top < sr.top - 2 || r.bottom > sr.bottom + 2) out.warn.push(`SVG label cut off by the diagram edge: "${s}"`);
            const fs = parseFloat(getComputedStyle(t).fontSize) * (sr.width / (svg.viewBox.baseVal && svg.viewBox.baseVal.width || sr.width));
            if (fs && fs < 8.5 && r.height < 10) out.warn.push(`SVG label too small to read (${fs.toFixed(1)}px): "${s}"`);
          });
          for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i].r, b = boxes[j].r;
            const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
            if (ix > 2 && iy > 2 && ix * iy > .35 * Math.min(a.width * a.height, b.width * b.height)) out.warn.push(`SVG labels overlap: "${boxes[i].s}" × "${boxes[j].s}"`);
          }
        });
        // 5. Tap targets in the Lab smaller than 36 px tall
        app.querySelectorAll("#simBody button").forEach(b => { if (!vis(b) || b.closest("svg, .chkw, .saybtns")) return; const r = b.getBoundingClientRect(); if (r.height < 34 && r.width < 34) out.warn.push(`small tap target: ${name(b)} "${(b.textContent || "").trim().slice(0, 20)}" ${Math.round(r.width)}×${Math.round(r.height)}`); });
        out.warn = [...new Set(out.warn)];
        return out;
      });
      r.err.forEach(e => errors.push(`${where}: ${e}`));
      r.warn.forEach(e => warns.push(`${where}: ${e}`));
    }
    await page.close();
  }
  await browser.close();
  if (warns.length) console.log("Warnings:\n  " + warns.join("\n  "));
  console.log(errors.length ? "ERRORS:\n  " + errors.join("\n  ") : "No errors");
  process.exit(errors.length || (strict && warns.length) ? 1 : 0);
})();
