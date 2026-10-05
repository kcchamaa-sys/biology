
/* ============================================================
   5k. 👥 Friends (signed-in students only, up to 5): like Duolingo. Share your 6-character friend code,
   follow up to 5 classmates, see their streak and progress, and send one preset cheer per friend per day.
   Lives on 🏠 Home in the left column under the pal room (the empty space on wide screens).
   Server actions: friends · friendAdd · friendRemove · cheer (server/Code.gs). No free-text messages.
   ============================================================ */
const FR = { d: null, t: 0, busy: false, pick: null, celebrated: false };
const FR_ERR = { friend_unknown: "No student has that code. Check the 6 letters and numbers.", friend_self: "That's your own code! 😄", friend_already: "You already follow this friend.", friend_full: "You already have 5 friends. Remove one to add another.", cheer_once: "You already cheered this friend today. Try again tomorrow! 🌱", unknown_action: "Friends need the latest class server. Ask your teacher to update it." };
const frErr = e => FR_ERR[e] || errText(e);
function friendsHtml() {
  if (!signedIn()) return `<section class="card friendscard locked"><div class="frhead"><h3 style="margin:0">👥 Friends</h3><span class="pill">🔒 Sign-in</span></div>
      <div class="frghost" aria-hidden="true">${[0, 1, 2].map(() => `<div class="frrow"><span class="frav"></span><span class="frname"><i></i><i></i></span></div>`).join("")}</div>
      <p class="small muted" style="margin:0">${cloudOn() ? "Sign in with your school Google account to add up to <b>5 friends</b>, see their streaks and cheer each other on!" : "Friends need class sign-in, which isn't switched on in this copy."}</p>
      ${cloudOn() ? `<div class="row"><button class="btn blue" id="frSign">🎓 Sign in to add friends</button></div>` : ""}</section>`;
  return `<section class="card friendscard" id="frCard"><div class="frhead"><h3 style="margin:0">👥 Friends</h3><span class="pill" id="frCount">…</span></div><div id="frBody"><p class="small muted" style="margin:0">Loading your friends… 🌱</p></div></section>`;
}
function wireFriends() {
  const sb = document.getElementById("frSign"); if (sb) sb.onclick = () => { SFX.tap(); save(); authPref(""); renderLogin(); };
  if (!signedIn() || !document.getElementById("frBody")) return;
  if (FR.d && Date.now() - FR.t < 60000) return fillFriends(FR.d);
  if (!tokenOk()) { fillFriends({ ok: false, error: "expired" }); return; }
  api("friends", {}).then(d => { if (d && d.ok && Array.isArray(d.friends)) { FR.d = d; FR.t = Date.now(); } fillFriends(d); });
}
const agoDays = day => { if (!day) return null; return Math.max(0, dayNum(today()) - dayNum(String(day).slice(0, 10))); };
function friendRow(f, d) {
  const P = PALS.find(x => x.id === f.pal) || PALS.find(x => x.id === "mochi"), ago = agoDays(f.last), sent = d.sent && d.sent[f.code];
  const status = f.today ? `<span class="frst on">✓ studied today</span>` : ago == null ? `<span class="frst">Not started yet</span>` : `<span class="frst ${ago > 2 ? "away" : ""}">Last studied ${ago === 1 ? "yesterday" : `${ago} days ago`}</span>`;
  return `<div class="frrow" data-frc="${esc(f.code)}">
    <span class="frav" aria-hidden="true">${palFig(P.id, f.today ? "happy" : "normal")}</span>
    <span class="frname"><b>${esc(f.n)}</b>${f.c ? ` <span class="frcls">${esc(f.c)}</span>` : ""}<br>${status}
      <span class="frstats"><span title="Streak">🔥 ${f.st}</span><span title="Stages escaped">🚪 ${f.s}</span><span title="Effort points">🌟 ${f.xp}</span></span></span>
    <span class="fract"><button class="btn ${sent ? "plain" : "yellow"} frcheer" data-cheer="${esc(f.code)}" ${sent ? "disabled" : ""} aria-label="${sent ? `Cheered ${esc(f.n)} today` : `Cheer ${esc(f.n)}`}">${sent ? "✓ Cheered" : "👏 Cheer"}</button>
      <button class="frx" data-frx="${esc(f.code)}" aria-label="Remove ${esc(f.n)}" title="Remove friend">✕</button></span>
    ${FR.pick === f.code ? `<div class="frpick" role="group" aria-label="Choose a cheer">${(d.msgs || []).map((m, i) => `<button class="frmsg" data-msg="${i}" data-to="${esc(f.code)}">${esc(m)}</button>`).join("")}</div>` : ""}
  </div>`;
}
function fillFriends(d) {
  const body = document.getElementById("frBody"), cnt = document.getElementById("frCount"); if (!body) return;
  if (d && d.ok && !Array.isArray(d.friends)) d = { ok: false, error: "unknown_action" };   // an older class server
  if (!d || !d.ok) { body.innerHTML = `<p class="small muted" style="margin:0">${esc(frErr(d ? d.error : "network"))}</p>`; if (cnt) cnt.textContent = "–"; return; }
  if (cnt) cnt.textContent = `${d.friends.length} / ${d.max}`;
  const fresh = (d.cheers || []).filter(c => !c.seen);
  if (fresh.length && !FR.celebrated) { FR.celebrated = true; setTimeout(() => { toast(`💌 ${fresh[0].n} cheered you: ${fresh[0].m}`); if (!reduced()) confetti(60); SFX.item(); }, 700); }
  const ago = t => { const h = Math.round((Date.now() - new Date(t)) / 36e5); return h < 1 ? "just now" : h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`; };
  body.innerHTML = `
    ${(d.cheers || []).length ? `<div class="frcheers">${d.cheers.slice(0, 3).map(c => `<div class="frgot ${c.seen ? "" : "new"}"><b>💌 ${esc(c.n)}</b> ${esc(c.m)} <span class="small muted">${ago(c.t)}</span></div>`).join("")}</div>` : ""}
    ${d.friends.length ? `<div class="frlist">${d.friends.map(f => friendRow(f, d)).join("")}</div>`
      : `<div class="frempty"><span aria-hidden="true">👋</span><span class="small">No friends yet. Swap codes with a classmate and add each other: studying together keeps both your flames burning!</span></div>`}
    <div class="frmine"><span class="small muted">My friend code</span><b class="frcode" id="frMy">${esc(d.code)}</b><button class="btn plain small" id="frCopy">📋 Copy</button></div>
    ${d.friends.length < d.max ? `<div class="fradd"><input id="frIn" class="name" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Friend's code" aria-label="Friend's 6-character code"><button class="btn blue" id="frAdd">➕ Add</button></div>`
      : `<p class="small muted" style="margin:0">You have 5 friends, the maximum.</p>`}
    <p class="small muted" style="margin:0">🔒 Friends see your first name, class, streak, stages and effort points. Only share your code with classmates you know.</p>`;
  const busy = on => { FR.busy = on; body.querySelectorAll("button,input").forEach(x => { if (on) x.disabled = true; }); };
  const reload = nd => { if (nd && nd.ok && Array.isArray(nd.friends)) { FR.d = nd; FR.t = Date.now(); fillFriends(nd); } else { fillFriends(FR.d || nd); toast(`⚠️ ${frErr(nd ? nd.error : "network")}`); } };
  const cp = document.getElementById("frCopy"); if (cp) cp.onclick = () => { SFX.tap(); try { navigator.clipboard.writeText(d.code).then(() => toast("📋 Code copied! Send it to a classmate.")); } catch (e) { toast(`Your code: ${d.code}`); } };
  const add = document.getElementById("frAdd"), inp = document.getElementById("frIn");
  if (add) { const go = () => { const code = (inp.value || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); if (code.length !== 6) { toast("Friend codes have 6 letters and numbers."); return; } if (!tokenOk()) { markStale(); return; }
      SFX.tap(); busy(true); api("friendAdd", { code }).then(nd => { if (nd && nd.ok) { SFX.item(); toast("👥 Friend added!"); } reload(nd); }); };
    add.onclick = go; inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); go(); } }); }
  body.querySelectorAll("[data-cheer]").forEach(b => b.onclick = () => { SFX.tap(); FR.pick = FR.pick === b.dataset.cheer ? null : b.dataset.cheer; fillFriends(FR.d); });
  body.querySelectorAll("[data-msg]").forEach(b => b.onclick = () => { if (!tokenOk()) { markStale(); return; } SFX.tap(); FR.pick = null; busy(true);
    api("cheer", { code: b.dataset.to, msg: Number(b.dataset.msg) }).then(nd => { if (nd && nd.ok) { SFX.right(); toast("👏 Cheer sent!"); } reload(nd); }); });
  body.querySelectorAll("[data-frx]").forEach(b => b.onclick = () => {
    const f = d.friends.find(x => x.code === b.dataset.frx); if (!f) return;
    const box = openModal(`<span class="kicker">👥 Friends</span><h2>Remove ${esc(f.n)}?</h2><p>You can add them again later with their code.</p><div class="row"><button class="btn" id="frYes">Remove</button><button class="btn plain" id="frNo">Keep</button></div>`);
    box.querySelector("#frNo").onclick = () => { SFX.tap(); closeModal(); };
    box.querySelector("#frYes").onclick = () => { SFX.tap(); closeModal(); if (!tokenOk()) { markStale(); return; } busy(true); api("friendRemove", { code: f.code }).then(reload); };
  });
}
