// Leaderboard helpers: display-name rules, profile records, and the
// sorted-set that ranks accounts by correct words spelled.
//
// Two KV structures:
//   profile:<username>  -> { displayName, showOnLeaderboard, updatedAt }
//   lb:correct          -> ZSET, member = username, score = correctCount
//   lb:names            -> HASH, username -> displayName (for the board read)
//
// Scores are written with a plain ZADD, not GT/LT: the client always pulls
// the max-merged bundle before pushing, so the number the server stores is
// already that account's true best. Plain ZADD therefore self-heals after
// resets and cross-device merges, and deliberately lets a lower score
// overwrite a higher one when the user resets on purpose.

const kv = require('./_kv');

const PROFILE_PREFIX = 'profile:';
const LB_CORRECT_KEY = 'lb:correct';
const LB_NAMES_KEY = 'lb:names';

// Sanity cap. A real spelling session cannot approach this; it exists to stop
// a scripted PUT from poisoning the board. This is trust + caps, not true
// anti-cheat — the state blob is client-owned by design.
const MAX_CORRECT = 100000;
const MIN_NAME_LEN = 2;
const MAX_NAME_LEN = 20;
const NAME_RE = /^[a-z0-9 _-]+$/i;

function normalizeDisplayName(name) {
  return String(name || '').replace(/\s+/g, ' ').trim();
}

// Returns an error message, or null if the name is acceptable.
function validateDisplayName(name) {
  const n = normalizeDisplayName(name);
  if (n.length < MIN_NAME_LEN || n.length > MAX_NAME_LEN) {
    return 'Display name must be 2–20 characters.';
  }
  if (!NAME_RE.test(n)) {
    return 'Display name can use letters, numbers, spaces, hyphens, or underscores.';
  }
  return null;
}

function clampCorrect(count) {
  const n = Number(count);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(Math.floor(n), MAX_CORRECT);
}

function profileKey(username) {
  return PROFILE_PREFIX + username;
}

async function getProfile(username) {
  return kv.getJSON(profileKey(username));
}

async function setProfile(username, profile) {
  await kv.setJSON(profileKey(username), profile);
}

// The state blob is opaque; we only peek at the one number the board ranks.
function extractCorrectCount(state) {
  const stats = state && state.stats ? state.stats : {};
  return clampCorrect(stats.correctCount);
}

// Keep the board in step with an account's progress + profile.
async function updateScore(username, profile, correctCount) {
  const optedIn = Boolean(profile && profile.showOnLeaderboard);
  const name = profile ? normalizeDisplayName(profile.displayName) : '';

  if (!optedIn) {
    await kv.command('ZREM', LB_CORRECT_KEY, username);
    await kv.command('HDEL', LB_NAMES_KEY, username);
    return;
  }

  const score = clampCorrect(correctCount);
  if (score > 0) {
    await kv.command('ZADD', LB_CORRECT_KEY, String(score), username);
    await kv.command('HSET', LB_NAMES_KEY, username, name || username);
  } else {
    // Opted in but nothing correct yet: stay off the board, keep the name.
    await kv.command('ZREM', LB_CORRECT_KEY, username);
    if (name) await kv.command('HSET', LB_NAMES_KEY, username, name);
  }
}

// Top of the board, highest score first, with display names attached.
// Deliberately does NOT expose login usernames — only display names.
async function topEntries(limit) {
  const raw = await kv.command(
    'ZREVRANGE', LB_CORRECT_KEY, '0', String(limit - 1), 'WITHSCORES'
  );
  const flat = Array.isArray(raw) ? raw : [];
  const members = [];
  const scores = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    members.push(flat[i]);
    scores.push(clampCorrect(flat[i + 1]));
  }
  if (!members.length) return { entries: [] };

  const names = await kv.command('HMGET', LB_NAMES_KEY, ...members);
  const entries = members.map((member, i) => ({
    displayName: (names && names[i]) || member,
    correctCount: scores[i],
    rank: i + 1
  }));
  return { entries };
}

// The signed-in user's own standing, or null if they are not on the board.
async function selfRank(username) {
  const rank = await kv.command('ZREVRANK', LB_CORRECT_KEY, username);
  if (rank === null || rank === undefined) return null;
  const score = await kv.command('ZSCORE', LB_CORRECT_KEY, username);
  return {
    rank: Number(rank) + 1, // Redis ranks are 0-based
    correctCount: clampCorrect(score)
  };
}

module.exports = {
  PROFILE_PREFIX,
  LB_CORRECT_KEY,
  LB_NAMES_KEY,
  MAX_CORRECT,
  normalizeDisplayName,
  validateDisplayName,
  clampCorrect,
  profileKey,
  getProfile,
  setProfile,
  extractCorrectCount,
  updateScore,
  topEntries,
  selfRank
};
