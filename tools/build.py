"""Assemble the single-file game (index.html) from the parts in src/.
Run: python3 tools/build.py"""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
src = root / "src"
parts = ["head.html", "chars.js", "diagrams.js", "stages.js"] + [f"q_t{i}.js" for i in range(1, 9)] + ["rush.js", "engine.js"]
html = "".join((src / p).read_text() for p in parts) + "</script>\n</body>\n</html>\n"
(root / "index.html").write_text(html)
print(f"index.html: {len(html):,} bytes")
