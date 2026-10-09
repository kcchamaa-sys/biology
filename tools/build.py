"""Assemble the single-file game (index.html) from the parts in src/.
Run: python3 tools/build.py"""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
src = root / "src"
QFILES = [f"q_t{i}.js" for i in range(1, 9)] + ["q_t9.js", "q_t11.js", "q_t13.js", "q_t15.js", "q_t17.js", "q_graphs.js", "q_graphs2.js", "q_kb1.js", "q_kb2.js", "q_x1.js", "q_x2.js", "q_x3.js", "q_x4.js", "q_h0.js", "q_h1.js", "q_h2.js", "q_h3.js", "q_h4.js", "q_m1.js", "q_m2.js", "q_m3.js", "q_m4.js"]
parts = ["head.html", "chars.js", "icons.js", "diagrams.js", "graphs.js", "media.js", "stages.js", "stages2.js", "scenes.js", "lore.js"] + QFILES + ["rush.js", "extras.js", "life.js", "bodypal_engine.js", "pals.js", "livepal.js", "sims.js", "sims2.js", "sims_a.js", "sims_b.js", "sims_c.js", "sims_d.js", "simch_d.js", "sims_e.js", "sims_f.js", "sims_p1a.js", "sims_p1b.js", "sims_p1c.js", "sims_p2a.js", "sims_p2b.js", "sims_p4a.js", "sims_p4b.js", "simchal.js", "study.js", "bookmarks.js", "escape2.js", "home.js", "guide.js", "daily.js", "streakfx.js", "auth.js", "friends.js", "teacher.js", "cards.js", "lucky.js", "skills.js", "engine.js"]
# The class server code (server/Code.gs) rides along, so teachers can copy the latest version with one tap (teacher.js)
import hashlib, json
code = (root / "server" / "Code.gs").read_text()
server_js = f"const SERVER_CODE = {json.dumps(code)}, SERVER_CODE_VER = {json.dumps(hashlib.sha1(code.encode()).hexdigest()[:7])};\n".replace("</", "<\\/")
html = "".join((src / p).read_text() + (server_js if p == "teacher.js" else "") for p in parts) + "</script>\n</body>\n</html>\n"
(root / "index.html").write_text(html)
print(f"index.html: {len(html):,} bytes")
