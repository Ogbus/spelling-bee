// GET /api/leaderboard?limit=20 -> { entries, me }
//
// Public and safe to cache briefly: it never returns login usernames, only
// opted-in display names. `me` is the signed-in user's own standing (or null
// when signed out / not on the board).

const auth = require('./_auth');
const lb = require('./_lb');
const { sendJSON, handleError } = require('./_http');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function clampLimit(raw) {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return Math.min(Math.max(n, 1), MAX_LIMIT);
}

function sendCached(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
  res.end(JSON.stringify(payload));
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'GET') {
      sendJSON(res, 405, { error: 'Method not allowed.' });
      return;
    }

    const limit = clampLimit(req.query && req.query.limit);
    const { entries } = await lb.topEntries(limit);

    let me = null;
    const username = await auth.resolveSession(req);
    if (username) {
      const standing = await lb.selfRank(username);
      if (standing) {
        const profile = await lb.getProfile(username);
        me = {
          rank: standing.rank,
          correctCount: standing.correctCount,
          displayName: profile ? lb.normalizeDisplayName(profile.displayName) : username
        };
      }
    }

    sendCached(res, 200, { entries, me, limit });
  } catch (err) {
    handleError(res, err);
  }
};
