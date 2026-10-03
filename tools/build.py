"""Assemble the single-file game (index.html) from the parts in src/.
Run: python3 tools/build.py"""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
src = root / "src"
QFILES = [f"q_t{i}.js" for i in range(1, 9)] + ["q_t9.js", "q_t11.js", "q_t13.js", "q_t15.js", "q_t17.js", "q_graphs.js", "q_graphs2.js", "q_kb1.js", "q_kb2.js"]
parts = ["head.html", "chars.js", "icons.js", "diagrams.js", "graphs.js", "stages.js", "stages2.js", "scenes.js"] + QFILES + ["rush.js", "extras.js", "life.js", "pals.js", "sims.js", "study.js", "escape2.js", "home.js", "daily.js", "auth.js", "teacher.js", "cards.js", "lucky.js", "engine.js"]
html = "".join((src / p).read_text() for p in parts) + "</script>\n</body>\n</html>\n"
(root / "index.html").write_text(html)
print(f"index.html: {len(html):,} bytes")
