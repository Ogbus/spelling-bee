// --- Cross-device sync (client) ---
// Collects the app's localStorage state into a single bundle, merges it with
// the copy stored on the server, pushes changes automatically, and drives the
// sign-in / sign-out UI. Loaded after script.js.
//
// Auto-push works by wrapping localStorage.setItem: any write to a synced
// `spellit-*` key schedules a debounced push. Applying remote state uses the
// original setter so it never re-triggers a push loop.

(function () {
  const AUTH_KEY = 'spellit-sync';
  const OWNER_KEY = 'spellit-sync-owner';     // username owning this device's blob
  const ARCHIVE_KEY = 'spellit-sync-archive'; // safety copy of wiped progress (never synced)
  const PREFS_AT_KEY = 'spellit-sync-prefs-at';
  const PREFS_SNAP_KEY = 'spellit-sync-prefs-snap';

  // App state keys that make up the synced bundle.
  const K_STATS = 'spellit-stats';
  const K_HISTORY = 'spellit-history';
  const K_DAILY = 'spellit-daily';
  const K_STREAK = 'spellit-streak';
  const K_DAYS = 'spellit-days';
  const K_WORDS = 'spellit-words';
  const K_BADGES = 'spellit-badges';
  const K_THEME = 'spellit-theme';
  const K_MODE = 'spellit-mode';
  const K_DIFFICULTY = 'spellit-difficulty';
  const K_GOAL = 'spellit-goal';
  const K_SOUND = 'spellit-sound-enabled';

  const SYNC_KEYS = [
    K_STATS, K_HISTORY, K_DAILY, K_STREAK, K_DAYS, K_WORDS, K_BADGES,
    K_THEME, K_MODE, K_DIFFICULTY, K_GOAL, K_SOUND
  ];

  const PUSH_DEBOUNCE_MS = 1500;

  const originalSetItem = localStorage.setItem.bind(localStorage);
  const originalRemoveItem = localStorage.removeItem.bind(localStorage);

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      originalSetItem(key, JSON.stringify(value));
    } catch (err) { /* storage full / unavailable */ }
  }

  // --- Auth storage ---
  function getAuth() {
    const auth = readJSON(AUTH_KEY, null);
    if (auth && auth.username && auth.token) return auth;
    return null;
  }

  function setAuth(username, token) {
    writeJSON(AUTH_KEY, { username, token });
  }

  function clearAuth() {
    try { originalRemoveItem(AUTH_KEY); } catch (err) { /* ignore */ }
  }

  // --- Device data ownership ---
  // The local progress blob belongs to at most one account. `owner` is null
  // while the data is anonymous (played before any sign-in). It is set when
  // the data is first claimed and never silently reassigned: a different
  // account must be told what is on the device before anything moves.
  function getOwner() {
    const owner = readJSON(OWNER_KEY, null);
    return typeof owner === 'string' && owner ? owner : null;
  }

  function setOwner(username) {
    writeJSON(OWNER_KEY, username);
  }

  // Migration for sessions signed in before ownership tracking existed:
  // their device data has already been merged with this account, so claim it.
  (function () {
    const auth = getAuth();
    if (auth && !getOwner()) setOwner(auth.username);
  })();

  // --- State collection ---
  function collectSettings() {
    return {
      theme: localStorage.getItem(K_THEME),
      mode: localStorage.getItem(K_MODE),
      difficulty: localStorage.getItem(K_DIFFICULTY),
      sound: localStorage.getItem(K_SOUND),
      goal: readJSON(K_GOAL, null)
    };
  }

  function prefsSnapshotOf() {
    return JSON.stringify({
      theme: localStorage.getItem(K_THEME),
      mode: localStorage.getItem(K_MODE),
      difficulty: localStorage.getItem(K_DIFFICULTY),
      sound: localStorage.getItem(K_SOUND)
    });
  }

  // Establish the preference baseline now (after script.js has applied its
  // stored defaults). Only changes made *after* this point count as a new
  // "settings write" — otherwise a fresh device's defaults would clobber the
  // account's settings on first sign-in.
  try {
    if (localStorage.getItem(PREFS_SNAP_KEY) === null) {
      originalSetItem(PREFS_SNAP_KEY, prefsSnapshotOf());
    }
  } catch (err) { /* storage unavailable */ }

  function collectState() {
    const settings = collectSettings();

    // Track when the four preference settings last changed (goal is merged
    // separately by date, so it is excluded to avoid churning the timestamp).
    const prefsSnap = prefsSnapshotOf();
    if (prefsSnap !== localStorage.getItem(PREFS_SNAP_KEY)) {
      originalSetItem(PREFS_SNAP_KEY, prefsSnap);
      originalSetItem(PREFS_AT_KEY, String(Date.now()));
    }

    return {
      stats: readJSON(K_STATS, { correctCount: 0, wordsPlayed: 0 }),
      history: readJSON(K_HISTORY, []),
      daily: readJSON(K_DAILY, null),
      streak: readJSON(K_STREAK, { current: 0, best: 0, lastPlayedDate: null }),
      days: readJSON(K_DAYS, {}),
      words: readJSON(K_WORDS, {}),
      badges: readJSON(K_BADGES, {}),
      settings,
      settingsUpdatedAt: Number(localStorage.getItem(PREFS_AT_KEY) || 0)
    };
  }

  // True when the bundle carries no played-progress. Settings alone don't
  // count — changing the theme is not something an account should inherit
  // as "your progress". The daily word record exists from the first visit
  // (initDaily writes it before any play), so only a completed round counts.
  function isEmptyProgress(state) {
    if (!state) return true;
    const stats = state.stats || {};
    if (Number(stats.correctCount || 0) > 0 || Number(stats.wordsPlayed || 0) > 0) return false;
    if (Array.isArray(state.history) && state.history.length > 0) return false;
    if (state.daily && state.daily.completed) return false;
    const streak = state.streak || {};
    if (Number(streak.current || 0) > 0 || Number(streak.best || 0) > 0) return false;
    if (state.days && Object.keys(state.days).length > 0) return false;
    if (state.words && Object.keys(state.words).length > 0) return false;
    if (state.badges && Object.keys(state.badges).length > 0) return false;
    const goal = state.settings && state.settings.goal;
    if (goal && (Number(goal.progress || 0) > 0 || goal.completed)) return false;
    return true;
  }

  // --- Merge helpers ---
  function mergeHistory(a, b) {
    const listA = Array.isArray(a) ? a : [];
    const listB = Array.isArray(b) ? b : [];
    const map = new Map();
    listA.concat(listB).forEach((entry) => {
      if (!entry || !entry.date) return;
      const prev = map.get(entry.date);
      if (!prev || (entry.wordsPlayed || 0) > (prev.wordsPlayed || 0)) {
        map.set(entry.date, entry);
      }
    });
    return Array.from(map.values())
      .sort((x, y) => (x.date < y.date ? 1 : -1))
      .slice(0, 50);
  }

  function mergeDaily(a, b) {
    if (!a) return b;
    if (!b) return a;
    if (a.date !== b.date) return a.date > b.date ? a : b;
    return {
      date: a.date,
      word: a.word || b.word,
      completed: Boolean(a.completed || b.completed),
      correct: Boolean(a.correct || b.correct)
    };
  }

  function mergeStreak(a, b) {
    const sa = a || { current: 0, best: 0, lastPlayedDate: null };
    const sb = b || { current: 0, best: 0, lastPlayedDate: null };
    const newer = (sa.lastPlayedDate || '') >= (sb.lastPlayedDate || '') ? sa : sb;
    return {
      current: newer.current || 0,
      best: Math.max(sa.best || 0, sb.best || 0),
      lastPlayedDate: newer.lastPlayedDate || null
    };
  }

  function mergeCountMap(a, b, fields) {
    const ma = a && typeof a === 'object' ? a : {};
    const mb = b && typeof b === 'object' ? b : {};
    const out = {};
    const keys = new Set(Object.keys(ma).concat(Object.keys(mb)));
    keys.forEach((key) => {
      const va = ma[key] || {};
      const vb = mb[key] || {};
      const rec = {};
      fields.forEach((f) => {
        rec[f] = Math.max(Number(va[f] || 0), Number(vb[f] || 0));
      });
      out[key] = rec;
    });
    return out;
  }

  function mergeBadges(a, b) {
    const ma = a && typeof a === 'object' ? a : {};
    const mb = b && typeof b === 'object' ? b : {};
    const out = {};
    const keys = new Set(Object.keys(ma).concat(Object.keys(mb)));
    keys.forEach((key) => {
      const va = ma[key];
      const vb = mb[key];
      if (va && vb) out[key] = va < vb ? va : vb; // keep first earned
      else out[key] = va || vb;
    });
    return out;
  }

  function mergeGoal(a, b) {
    if (!a) return b || null;
    if (!b) return a;
    if (a.date !== b.date) return a.date > b.date ? a : b;
    return {
      date: a.date,
      target: Math.max(Number(a.target || 0), Number(b.target || 0)),
      progress: Math.max(Number(a.progress || 0), Number(b.progress || 0)),
      completed: Boolean(a.completed || b.completed)
    };
  }

  function mergeSettings(local, remote) {
    const localAt = Number(local.settingsUpdatedAt || 0);
    const remoteAt = Number(remote.settingsUpdatedAt || 0);
    const pick = remoteAt > localAt ? remote.settings : local.settings;
    const other = remoteAt > localAt ? local.settings : remote.settings;
    return {
      theme: pick.theme != null ? pick.theme : other.theme,
      mode: pick.mode != null ? pick.mode : other.mode,
      difficulty: pick.difficulty != null ? pick.difficulty : other.difficulty,
      sound: pick.sound != null ? pick.sound : other.sound,
      goal: mergeGoal(pick.goal, other.goal)
    };
  }

  function mergeBundles(local, remote) {
    if (!remote) return local;
    if (!local) return remote;
    return {
      stats: {
        correctCount: Math.max(Number(local.stats.correctCount || 0), Number(remote.stats.correctCount || 0)),
        wordsPlayed: Math.max(Number(local.stats.wordsPlayed || 0), Number(remote.stats.wordsPlayed || 0))
      },
      history: mergeHistory(local.history, remote.history),
      daily: mergeDaily(local.daily, remote.daily),
      streak: mergeStreak(local.streak, remote.streak),
      days: mergeCountMap(local.days, remote.days, ['played', 'correct']),
      words: mergeCountMap(local.words, remote.words, ['played', 'correct', 'missed']),
      badges: mergeBadges(local.badges, remote.badges),
      settings: mergeSettings(local, remote),
      settingsUpdatedAt: Math.max(Number(local.settingsUpdatedAt || 0), Number(remote.settingsUpdatedAt || 0))
    };
  }

  // --- Apply a merged bundle back to localStorage ---
  function applyState(bundle) {
    if (!bundle) return;
    writeJSON(K_STATS, bundle.stats || { correctCount: 0, wordsPlayed: 0 });
    writeJSON(K_HISTORY, bundle.history || []);
    writeJSON(K_DAILY, bundle.daily || null);
    writeJSON(K_STREAK, bundle.streak || { current: 0, best: 0, lastPlayedDate: null });
    writeJSON(K_DAYS, bundle.days || {});
    writeJSON(K_WORDS, bundle.words || {});
    writeJSON(K_BADGES, bundle.badges || {});

    const s = bundle.settings || {};
    if (s.theme != null) originalSetItem(K_THEME, s.theme);
    if (s.mode != null) originalSetItem(K_MODE, s.mode);
    if (s.difficulty != null) originalSetItem(K_DIFFICULTY, s.difficulty);
    if (s.sound != null) originalSetItem(K_SOUND, s.sound);
    if (s.goal) writeJSON(K_GOAL, s.goal);

    // Keep our own prefs snapshot/timestamp in step so applying remote state
    // does not immediately look like a local preference change.
    originalSetItem(PREFS_SNAP_KEY, JSON.stringify({
      theme: s.theme != null ? s.theme : localStorage.getItem(K_THEME),
      mode: s.mode != null ? s.mode : localStorage.getItem(K_MODE),
      difficulty: s.difficulty != null ? s.difficulty : localStorage.getItem(K_DIFFICULTY),
      sound: s.sound != null ? s.sound : localStorage.getItem(K_SOUND)
    }));
    originalSetItem(PREFS_AT_KEY, String(bundle.settingsUpdatedAt || Date.now()));
  }

  // --- Reset helpers (claim choice: "start fresh") ---
  const PROGRESS_KEYS = [
    K_STATS, K_HISTORY, K_DAILY, K_STREAK, K_DAYS, K_WORDS, K_BADGES, K_GOAL
  ];

  function wipeProgress() {
    PROGRESS_KEYS.forEach((key) => {
      try { originalRemoveItem(key); } catch (err) { /* ignore */ }
    });
  }

  // Keep one local safety copy of the progress about to be wiped (never
  // synced), so a mis-click on a brand-new account isn't unrecoverable.
  function archiveProgress() {
    const state = collectState();
    if (isEmptyProgress(state)) return;
    writeJSON(ARCHIVE_KEY, { archivedAt: new Date().toISOString(), state });
  }

  // --- API ---
  async function api(method, path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    let payload = null;
    try { payload = await res.json(); } catch (err) { payload = null; }
    return { ok: res.ok, status: res.status, body: payload };
  }

  // --- Push ---
  let pushTimer = null;
  let pushing = false;
  let pendingPush = false;

  function schedulePush() {
    if (!getAuth()) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => { pushTimer = null; pushState(); }, PUSH_DEBOUNCE_MS);
  }

  async function pushState() {
    const auth = getAuth();
    if (!auth) return;
    if (pushing) { pendingPush = true; return; }
    pushing = true;
    try {
      await api('PUT', '/api/sync', { state: collectState() }, auth.token);
    } catch (err) {
      // Offline or server error — state stays local and retries on next change.
    } finally {
      pushing = false;
      if (pendingPush) { pendingPush = false; schedulePush(); }
    }
  }

  // --- Pull + merge ---
  let reloading = false;

  function reloadOnce() {
    if (reloading) return;
    reloading = true;
    location.reload();
  }

  async function syncNow(opts) {
    const options = opts || {};
    const auth = getAuth();
    if (!auth) return { ok: false, reason: 'signed-out' };

    let res;
    try {
      res = await api('GET', '/api/sync', null, auth.token);
    } catch (err) {
      return { ok: false, reason: 'offline' };
    }
    if (res.status === 401) {
      clearAuth();
      renderUI();
      return { ok: false, reason: 'expired' };
    }
    if (!res.ok) return { ok: false, reason: 'server' };

    const remote = res.body ? res.body.state : null;
    const local = collectState();
    const merged = remote ? mergeBundles(local, remote) : local;
    const localChanged = JSON.stringify(merged) !== JSON.stringify(local);
    const remoteStale = !remote || JSON.stringify(merged) !== JSON.stringify(remote);

    if (localChanged) applyState(merged);

    // Push only when the server is missing something we have or vice versa.
    if (localChanged || remoteStale) {
      await api('PUT', '/api/sync', { state: merged }, auth.token);
    }

    if (localChanged && options.reloadIfChanged !== false) {
      reloadOnce();
      return { ok: true, changed: true };
    }
    return { ok: true, changed: localChanged };
  }

  // --- setItem patch: auto-push on any synced-key write ---
  localStorage.setItem = function (key, value) {
    originalSetItem(key, value);
    if (AUTH_KEY === key || OWNER_KEY === key || ARCHIVE_KEY === key ||
        PREFS_AT_KEY === key || PREFS_SNAP_KEY === key) return;
    if (SYNC_KEYS.indexOf(key) !== -1) schedulePush();
  };

  // --- UI ---
  const els = {};

  function cacheEls() {
    els.overlay = document.getElementById('sync-overlay');
    els.status = document.getElementById('sync-status');
    els.form = document.getElementById('sync-form');
    els.signedIn = document.getElementById('sync-signed-in');
    els.username = document.getElementById('sync-username');
    els.pin = document.getElementById('sync-pin');
    els.submit = document.getElementById('sync-submit');
    els.toggle = document.getElementById('sync-toggle');
    els.toggleHint = document.getElementById('sync-toggle-hint');
    els.msg = document.getElementById('sync-msg');
    els.signedInAs = document.getElementById('sync-signed-in-as');
    els.signout = document.getElementById('sync-signout');
    els.syncBtn = document.getElementById('sync-now-btn');
    els.close = document.getElementById('sync-close');
    els.close2 = document.getElementById('sync-close-2');
    els.manualSync = document.getElementById('sync-now');
    els.claim = document.getElementById('sync-claim');
    els.claimText = document.getElementById('sync-claim-text');
    els.claimImport = document.getElementById('sync-claim-import');
    els.claimFresh = document.getElementById('sync-claim-fresh');
    els.claimCancel = document.getElementById('sync-claim-cancel');
  }

  let mode = 'login'; // 'login' | 'signup'

  function setMessage(text, kind) {
    if (!els.msg) return;
    els.msg.textContent = text || '';
    els.msg.className = 'sync-msg' + (kind ? ' sync-msg-' + kind : '');
  }

  function setMode(next) {
    mode = next;
    if (els.submit) els.submit.textContent = mode === 'signup' ? 'Create account' : 'Sign in';
    if (els.toggle) els.toggle.textContent = mode === 'signup' ? 'I already have an account' : 'Create a new account';
    if (els.toggleHint) {
      els.toggleHint.textContent = mode === 'signup'
        ? 'Pick a username and a 4–8 digit PIN. Remember them — they unlock your data on any device.'
        : 'Sign in to load your progress from the server.';
    }
    setMessage('', null);
  }

  function renderUI() {
    if (!els.overlay) return;
    const auth = getAuth();
    const claiming = Boolean(pendingClaim && els.claim);
    if (els.claim) els.claim.hidden = !claiming;
    if (claiming) {
      els.form.hidden = true;
      els.signedIn.hidden = true;
      if (els.status) els.status.textContent = 'Confirm where this device\u2019s progress goes';
      return;
    }
    if (auth) {
      els.form.hidden = true;
      els.signedIn.hidden = false;
      if (els.signedInAs) els.signedInAs.textContent = auth.username;
      if (els.status) els.status.textContent = 'Synced as ' + auth.username;
    } else {
      els.form.hidden = false;
      els.signedIn.hidden = true;
      if (els.status) els.status.textContent = 'Not signed in';
    }
  }

  function openOverlay() {
    if (!els.overlay) return;
    setMessage('', null);
    els.overlay.classList.add('visible');
    renderUI();
    if (!getAuth() && els.username) {
      setTimeout(() => els.username.focus(), 50);
    }
  }

  function closeOverlay() {
    pendingClaim = null; // dismissing the prompt leaves the device unclaimed
    if (els.overlay) els.overlay.classList.remove('visible');
  }

  // --- Claim flow: whose data is this device's blob? ---
  // `pendingClaim` holds the session token in memory only — until the user
  // picks an option, no auth exists on disk, so background sync (auto-push,
  // visibility changes) cannot move device data into an account unseen.
  let pendingClaim = null;

  // 'sync'   → silent path: owner already matches, or there is nothing to
  //            protect (empty device), so claiming is harmless.
  // 'prompt' → the user must choose before any data moves.
  function decideClaim(username) {
    const owner = getOwner();
    if (owner === username) return { action: 'sync' };
    const local = collectState();
    if (isEmptyProgress(local)) return { action: 'sync', claim: true };
    if (!owner) {
      return {
        action: 'prompt',
        kind: 'import',
        username,
        wordsPlayed: Number((local.stats && local.stats.wordsPlayed) || 0)
      };
    }
    return { action: 'prompt', kind: 'switch', username, owner };
  }

  function showClaimPrompt(claim, token) {
    pendingClaim = {
      username: claim.username,
      token: token,
      kind: claim.kind,
      owner: claim.owner
    };
    const words = Number(claim.wordsPlayed || 0);
    if (els.claimText) {
      els.claimText.textContent = claim.kind === 'switch'
        ? 'This device\u2019s progress was synced with @' + claim.owner +
          '. Continue as @' + claim.username +
          ': use that account\u2019s data, or also import what\u2019s on this device?'
        : 'You played ' + words + ' word' + (words === 1 ? '' : 's') +
          ' on this device. Import that progress into @' + claim.username + '?';
    }
    if (els.claimImport) {
      els.claimImport.textContent = claim.kind === 'switch'
        ? 'Import device data'
        : 'Import into @' + claim.username;
    }
    if (els.claimFresh) {
      els.claimFresh.textContent = claim.kind === 'switch'
        ? 'Use ' + claim.username + '\u2019s data'
        : 'Start fresh';
    }
    setMessage('', null);
    renderUI();
  }

  async function resolveClaim(choice) {
    const claim = pendingClaim;
    if (!claim) return;
    pendingClaim = null;
    if (els.claimImport) els.claimImport.disabled = true;
    if (els.claimFresh) els.claimFresh.disabled = true;

    setOwner(claim.username);
    setAuth(claim.username, claim.token);
    if (choice === 'fresh') {
      archiveProgress();
      wipeProgress();
    }

    let ok = false;
    try {
      const result = await syncNow({ reloadIfChanged: true });
      ok = Boolean(result && result.ok);
    } catch (err) {
      ok = false; // offline — state stays local and retries on the next change
    }

    if (els.claimImport) els.claimImport.disabled = false;
    if (els.claimFresh) els.claimFresh.disabled = false;
    renderUI();

    if (!ok) {
      setMessage('Signed in. Sync will finish when you\u2019re online.', null);
      return;
    }
    if (choice === 'import') {
      setMessage('Signed in. Your device progress was imported.', 'ok');
    } else {
      setMessage(claim.kind === 'switch'
        ? 'Signed in. Using @' + claim.username + '\u2019s data.'
        : 'Signed in. Starting fresh.', 'ok');
    }
    promptLeaderboardOptIn();
  }

  // Hand off to the leaderboard module to nudge the user to opt in. Called
  // right after a successful sign-in so the prompt feels like part of the
  // flow rather than a surprise popup later.
  function promptLeaderboardOptIn() {
    const lb = window.spellitLeaderboard;
    if (lb && typeof lb.onSignedIn === 'function') lb.onSignedIn();
  }

  async function submitAuth() {
    const username = (els.username.value || '').trim();
    const pin = (els.pin.value || '').trim();
    if (!username || !pin) {
      setMessage('Enter a username and PIN.', 'error');
      return;
    }
    els.submit.disabled = true;
    setMessage(mode === 'signup' ? 'Creating account…' : 'Signing in…', null);
    try {
      const path = mode === 'signup' ? '/api/signup' : '/api/login';
      const res = await api('POST', path, { username, pin }, null);
      if (!res.ok) {
        const msg = res.body && res.body.error ? res.body.error : 'Something went wrong.';
        setMessage(msg, 'error');
        return;
      }
      els.pin.value = '';

      // Deliberately no `state` seed on signup: a new account starts empty
      // and device data only moves in if the claim below says so.
      const nextUser = res.body.username;
      const claim = decideClaim(nextUser);
      if (claim.action === 'sync') {
        if (claim.claim) setOwner(nextUser);
        setAuth(nextUser, res.body.token);
        await syncNow({ reloadIfChanged: true });
        renderUI();
        setMessage('Signed in. Your progress is syncing.', 'ok');
        promptLeaderboardOptIn();
        return;
      }
      showClaimPrompt(claim, res.body.token);
    } catch (err) {
      setMessage('Could not reach the server. Check your connection.', 'error');
    } finally {
      els.submit.disabled = false;
    }
  }

  async function signOut() {
    const auth = getAuth();
    if (auth) {
      try { await api('POST', '/api/logout', null, auth.token); } catch (err) { /* ignore */ }
    }
    clearAuth();
    renderUI();
    setMessage('Signed out. Your data stays on this device.', null);
    if (window.spellitLeaderboard && typeof window.spellitLeaderboard.onSignedOut === 'function') {
      window.spellitLeaderboard.onSignedOut();
    }
  }

  function initUI() {
    cacheEls();
    if (!els.overlay) return;

    if (els.syncBtn) els.syncBtn.addEventListener('click', openOverlay);
    if (els.close) els.close.addEventListener('click', closeOverlay);
    if (els.close2) els.close2.addEventListener('click', closeOverlay);
    if (els.overlay) {
      els.overlay.addEventListener('click', (e) => {
        if (e.target === els.overlay) closeOverlay();
      });
    }
    if (els.toggle) {
      els.toggle.addEventListener('click', () => {
        setMode(mode === 'login' ? 'signup' : 'login');
      });
    }
    if (els.submit) els.submit.addEventListener('click', submitAuth);
    if (els.pin) {
      els.pin.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitAuth();
      });
    }
    if (els.username) {
      els.username.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && els.pin) els.pin.focus();
      });
    }
    if (els.signout) els.signout.addEventListener('click', signOut);
    if (els.claimImport) els.claimImport.addEventListener('click', () => resolveClaim('import'));
    if (els.claimFresh) els.claimFresh.addEventListener('click', () => resolveClaim('fresh'));
    if (els.claimCancel) els.claimCancel.addEventListener('click', closeOverlay);
    if (els.manualSync) {
      els.manualSync.addEventListener('click', async () => {
        setMessage('Syncing…', null);
        const result = await syncNow({ reloadIfChanged: true });
        if (result.ok) setMessage('Up to date.', 'ok');
        else setMessage('Sync failed — try again.', 'error');
      });
    }

    setMode('login');
    renderUI();

    // Pull on load and whenever the tab regains focus.
    if (getAuth()) {
      syncNow({ reloadIfChanged: true });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') syncNow({ reloadIfChanged: true });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
  } else {
    initUI();
  }

  // Expose for debugging / manual use.
  window.spellitSync = {
    collectState, mergeBundles, syncNow, pushState,
    decideClaim, isEmptyProgress, getOwner, setOwner, wipeProgress, archiveProgress,
    open: openOverlay, close: closeOverlay
  };
})();
