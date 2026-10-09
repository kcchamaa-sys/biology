"""Build the one-tap "copy the class server code" page for the teacher (published as a claude.ai artifact).
Run: python3 tools/server_code_page.py OUT.html  — then publish OUT.html to the same artifact URL (see CLAUDE.md)."""
import hashlib, json, sys
from pathlib import Path
root = Path(__file__).resolve().parent.parent
code = (root / "server" / "Code.gs").read_text()
html = (root / "tools" / "server_code_page.html").read_text()
html = html.replace("__VER__", hashlib.sha1(code.encode()).hexdigest()[:7]).replace("__LINES__", str(code.count("\n") + 1))
html = html.replace("__CODE__", json.dumps(code).replace("</", "<\\/"))
out = Path(sys.argv[1] if len(sys.argv) > 1 else "server-code.html")
out.write_text(html)
print(out, len(html))
