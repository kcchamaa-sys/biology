# Biology Study Pals (biology)

Part of a **three-repo family** that shares knowledge. Read [`docs/SHARED_KNOWLEDGE.md` in biology](https://github.com/kcchamaa-sys/biology/blob/claude/wonderful-turing-8ehr7a/docs/SHARED_KNOWLEDGE.md) (or `/home/user/biology/docs/SHARED_KNOWLEDGE.md` if the repo is cloned in this session) before designing or porting a feature.

Siblings: `kcchamaa-sys/biology` (hub), `kcchamaa-sys/s1science`, `kcchamaa-sys/s3science`. If a task would benefit from a sibling and it isn't in the session, attach it with `add_repo`.

## This repo
- Hub repo. Sec 4–6 Biology escape rooms. Source is in `src/`; run `python3 tools/build.py` to regenerate `index.html` (never hand-edit it). Checks: `node tools/check_content.js`, `node tools/check_bodypal.js` (Body Pal engine), `node tools/smoke.js`.

## Working agreements
- Keep this repo standalone: no runtime dependency on the siblings.
- When you build or change something reusable, add a line to the cross-project log in the hub's `docs/SHARED_KNOWLEDGE.md`.
- Never commit student names or other personal data.
- No official logos, artwork or music from existing franchises.
