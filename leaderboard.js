// --- Leaderboard (client) ---
// Public board of opted-in accounts ranked by correct words spelled, plus the
// display-name / opt-in editor. Loaded after sync.js.
//
// Identity is opt-in and cosmetic: the board shows a display name, never the
// login username. The signed-in user's own standing is shown separately as
// "You", pinned below the board when they fall outside the top N.

(function () {
  const AUTH_KEY = 'spellit-sync';

  // Mirrors the server rules so the save button can fail fast client-side.
  const MIN_NAME_LEN = 2;
  const MAX_NAME_LEN = 20;
  const NAME_RE = /^[a-z0-9 _-]+$/i;

  let els = {};
  let profile = null;   // { displayName, showOnLeaderboard } or null
  let joining = false;  // true while nudging a fresh sign-in to opt in

  // --- Auth (shared shape with sync.js) ---
  function getAuth() {
    try {
      const auth = JSON.parse(localStorage.getItem(AUTH_KEY));
      if (auth && auth.username && auth.token) return auth;
    } catch (err) { /* ignore */ }
    return null;
  }

  async function api(method, path, body, token) {
    const headers = {};
    if (body !== undefined && body !== null) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = 'Bearer ' + token;
    const res = await fetch(path, {
      method,
      headers,
      body: body === undefined || body === null ? undefined : JSON.stringify(body)
    });
    let parsed = null;
    try { parsed = await res.json(); } catch (err) { parsed = null; }
    return { ok: res.ok, status: res.status, body: parsed };
  }

  function normalizeName(name) {
    return String(name || '').replace(/\s+/g, ' ').trim();
  }

  function validateName(name) {
    const n = normalizeName(name);
    if (n.length < MIN_NAME_LEN || n.length > MAX_NAME_LEN) {
      return 'Display name must be 2–20 characters.';
    }
    if (!NAME_RE.test(n)) {
      return 'Display name can use letters, numbers, spaces, hyphens, or underscores.';
    }
    return null;
  }

  function formatScore(n) {
    return Number(n || 0).toLocaleString();
  }

  function cacheEls() {
    const byId = (id) => document.getElementById(id);
    els = {
      overlay: byId('leaderboard-overlay'),
      title: byId('lb-title'),
      profile: byId('lb-profile'),
      joinHint: byId('lb-join-hint'),
      name: byId('lb-name'),
      optin: byId('lb-optin'),
      save: byId('lb-save'),
      profileMsg: byId('lb-profile-msg'),
      list: byId('lb-list'),
      empty: byId('lb-empty'),
      me: byId('lb-me'),
      cta: byId('lb-cta'),
      join: byId('lb-join'),
      msg: byId('lb-msg'),
      close: byId('lb-close')
    };
  }

  function setProfileMsg(text, kind) {
    if (!els.profileMsg) return;
    els.profileMsg.textContent = text || '';
    els.profileMsg.className = 'sync-msg' + (kind ? ' sync-msg-' + kind : '');
  }

  function setBoardMsg(text, kind) {
    if (!els.msg) return;
    els.msg.textContent = text || '';
    els.msg.className = 'sync-msg' + (kind ? ' sync-msg-' + kind : '');
  }

  // --- Profile editor ---
  function renderProfile() {
    if (!els.profile || !els.cta) return;
    const auth = getAuth();
    if (!auth) {
      els.profile.hidden = true;
      els.cta.hidden = false;
      setProfileMsg('', null);
      return;
    }
    els.profile.hidden = false;
    els.cta.hidden = true;
    if (els.name && document.activeElement !== els.name) {
      els.name.value = profile ? profile.displayName : '';
    }
    if (els.optin) els.optin.checked = Boolean(profile && profile.showOnLeaderboard);
    if (els.joinHint) els.joinHint.hidden = !joining;
    if (!joining && !els.profileMsg.textContent) {
      setProfileMsg('Signed in as @' + auth.username + '.', null);
    }
  }

  async function loadProfile() {
    const auth = getAuth();
    if (!auth) { profile = null; return; }
    try {
      const res = await api('GET', '/api/profile', null, auth.token);
      if (res.ok) {
        profile = res.body;
        return;
      }
      if (res.status === 401) profile = null; // session expired
    } catch (err) { /* offline — leave profile as-is */ }
  }

  // --- Board ---
  function renderBoard(data) {
    if (!els.list) return;
    const entries = (data && data.entries) || [];
    els.list.innerHTML = '';

    if (els.empty) els.empty.hidden = entries.length > 0;

    const me = (data && data.me) || null;
    const meInList = me && entries.some((e) => e.rank === me.rank);

    entries.forEach((entry) => {
      const li = document.createElement('li');
      li.className = 'lb-row';
      if (me && entry.rank === me.rank) li.classList.add('lb-row-me');

      const rank = document.createElement('span');
      rank.className = 'lb-rank';
      rank.textContent = entry.rank + '.';

      const name = document.createElement('span');
      name.className = 'lb-name';
      name.textContent = entry.displayName;

      const score = document.createElement('span');
      score.className = 'lb-score';
      score.textContent = formatScore(entry.correctCount) + ' ✓';

      li.appendChild(rank);
      li.appendChild(name);
      li.appendChild(score);
      els.list.appendChild(li);
    });

    if (els.me) {
      if (me && !meInList) {
        els.me.hidden = false;
        els.me.textContent = 'You: #' + me.rank + ' — ' +
          formatScore(me.correctCount) + ' correct';
      } else if (me && meInList) {
        els.me.hidden = false;
        els.me.textContent = 'You: #' + me.rank + ' — keep it up!';
      } else {
        els.me.hidden = true;
      }
    }

    if (!me && getAuth() && profile && profile.showOnLeaderboard) {
      setBoardMsg('Your score appears after you’ve spelled a word.', null);
    } else {
      setBoardMsg('', null);
    }
  }

  async function loadBoard() {
    setBoardMsg('Loading…', null);
    try {
      const res = await api('GET', '/api/leaderboard?limit=20', null, getAuth() ? getAuth().token : null);
      if (!res.ok) {
        setBoardMsg('Couldn’t load the leaderboard. Try again.', 'error');
        return;
      }
      renderBoard(res.body);
    } catch (err) {
      setBoardMsg('Couldn’t load the leaderboard. Check your connection.', 'error');
    }
  }

  async function loadAll() {
    await loadProfile();
    renderProfile();
    await loadBoard();
  }

  // --- Save ---
  async function saveProfile() {
    const auth = getAuth();
    if (!auth) return;
    const displayName = normalizeName(els.name ? els.name.value : '');
    const showOnLeaderboard = Boolean(els.optin && els.optin.checked);

    if (showOnLeaderboard) {
      const err = validateName(displayName);
      if (err) { setProfileMsg(err, 'error'); return; }
    } else if (displayName) {
      const err = validateName(displayName);
      if (err) { setProfileMsg(err, 'error'); return; }
    }

    if (els.save) els.save.disabled = true;
    setProfileMsg('Saving…', null);
    try {
      const res = await api('PUT', '/api/profile', { displayName, showOnLeaderboard }, auth.token);
      if (!res.ok) {
        const msg = res.body && res.body.error ? res.body.error : 'Couldn’t save your profile.';
        setProfileMsg(msg, 'error');
        return;
      }
      profile = res.body;
      joining = false;
      renderProfile();
      setProfileMsg(showOnLeaderboard
        ? 'You’re on the leaderboard as “' + displayName + '”.'
        : 'Saved. You’re hidden from the leaderboard.', 'ok');
      await loadBoard(); // so the change shows immediately
    } catch (err) {
      setProfileMsg('Couldn’t reach the server. Try again.', 'error');
    } finally {
      if (els.save) els.save.disabled = false;
    }
  }

  // --- Open / close ---
  function openOverlay() {
    if (!els.overlay) return;
    els.overlay.classList.add('visible');
    renderProfile();
    loadAll();
  }

  function closeOverlay() {
    joining = false;
    if (els.overlay) els.overlay.classList.remove('visible');
  }

  // Called by sync.js right after a successful sign-in (login or signup, and
  // after the claim prompt resolves). Nudges the user to opt in once, unless
  // they are already on the board.
  async function onSignedIn() {
    const auth = getAuth();
    if (!auth) return;
    if (els.overlay && els.overlay.classList.contains('visible')) return;

    // Step out of the way of the sync modal we are replacing.
    if (window.spellitSync && typeof window.spellitSync.close === 'function') {
      window.spellitSync.close();
    }

    await loadProfile();
    renderProfile();
    loadBoard();

    if (profile && profile.showOnLeaderboard) return; // already opted in
    joining = true;
    if (els.joinHint) els.joinHint.hidden = false;
    setProfileMsg('Pick a display name to appear on the leaderboard.', null);
    els.overlay.classList.add('visible');
    if (els.name) setTimeout(() => els.name.focus(), 50);
  }

  function onSignedOut() {
    profile = null;
    joining = false;
    renderProfile();
  }

  function initUI() {
    cacheEls();
    if (!els.overlay) return;

    if (els.close) els.close.addEventListener('click', closeOverlay);
    els.overlay.addEventListener('click', (e) => {
      if (e.target === els.overlay) closeOverlay();
    });
    if (els.join) {
      els.join.addEventListener('click', () => {
        closeOverlay();
        const btn = document.getElementById('sync-now-btn');
        if (btn) btn.click();
      });
    }
    if (els.save) els.save.addEventListener('click', saveProfile);
    if (els.optin) {
      els.optin.addEventListener('change', () => {
        if (!els.optin.checked) return;
        joining = true;
        if (els.joinHint) els.joinHint.hidden = false;
      });
    }
    if (els.name) {
      els.name.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveProfile();
      });
    }
    renderProfile();
  }

  function wireButton() {
    const btn = document.getElementById('leaderboard-btn');
    if (btn) btn.addEventListener('click', openOverlay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initUI(); wireButton(); });
  } else {
    initUI();
    wireButton();
  }

  window.spellitLeaderboard = {
    open: openOverlay,
    close: closeOverlay,
    onSignedIn,
    onSignedOut,
    saveProfile,
    validateName,
    normalizeName
  };
})();
