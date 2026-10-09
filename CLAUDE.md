# Biology Study Pals (biology)

Part of a **three-repo family** that shares knowledge. Read [`docs/SHARED_KNOWLEDGE.md` in biology](https://github.com/kcchamaa-sys/biology/blob/claude/wonderful-turing-8ehr7a/docs/SHARED_KNOWLEDGE.md) (or `/home/user/biology/docs/SHARED_KNOWLEDGE.md` if the repo is cloned in this session) before designing or porting a feature.

Siblings: `kcchamaa-sys/biology` (hub), `kcchamaa-sys/s1science`, `kcchamaa-sys/s3science`. If a task would benefit from a sibling and it isn't in the session, attach it with `add_repo`.

## This repo
- Hub repo. Sec 4–6 Biology escape rooms. Source is in `src/`; run `python3 tools/build.py` to regenerate `index.html` (never hand-edit it). Checks: `node tools/check_content.js`, `node tools/check_bodypal.js` (Body Pal engine), `node tools/smoke.js`, `node tools/check_sync.js` (cloud save + streaks; Playwright, like smoke), `node tools/check_server.js` (server streak repair).
- Deploy is automatic: pushes to `claude/wonderful-turing-8ehr7a` run `.github/workflows/deploy.yml` (build + checks → `gh-pages`). Don't push to `gh-pages` by hand.

## Working agreements
- **Giving the user code to paste** (e.g. `server/Code.gs`): never paste long code into chat (it can't all be selected on a phone). Run `python3 tools/server_code_page.py <scratchpad>/server-code.html` and republish it to the Class Server Code artifact https://claude.ai/artifact/WXFFkJ9Wfja9yJKucS4eGT (one big Copy button). The game also has ☰ Menu → 📋 Copy server code for teachers, and the link `#server-code`.
- Keep this repo standalone: no runtime dependency on the siblings.
- When you build or change something reusable, add a line to the cross-project log in the hub's `docs/SHARED_KNOWLEDGE.md`.
- Never commit student names or other personal data.
- No official logos, artwork or music from existing franchises.
