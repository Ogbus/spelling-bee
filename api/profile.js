// GET  /api/profile -> { username, displayName, showOnLeaderboard }
// PUT  /api/profile { displayName, showOnLeaderboard } -> { ...profile }
//
// Opt-in is explicit: an account starts with no profile and never appears on
// the leaderboard until it saves a display name with showOnLeaderboard true.

const kv = require('./_kv');
const auth = require('./_auth');
const lb = require('./_lb');
const { sendJSON, readBody, handleError } = require('./_http');

function stateKey(username) {
  return 'state:' + username;
}

function publicProfile(username, profile) {
  return {
    username,
    displayName: profile ? lb.normalizeDisplayName(profile.displayName) : '',
    showOnLeaderboard: Boolean(profile && profile.showOnLeaderboard)
  };
}

module.exports = async (req, res) => {
  try {
    const username = await auth.resolveSession(req);
    if (!username) {
      sendJSON(res, 401, { error: 'Not signed in.' });
      return;
    }

    if (req.method === 'GET') {
      sendJSON(res, 200, publicProfile(username, await lb.getProfile(username)));
      return;
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = await readBody(req);
      const displayName = lb.normalizeDisplayName(body.displayName);
      const showOnLeaderboard = Boolean(body.showOnLeaderboard);

      if (showOnLeaderboard) {
        const nameError = lb.validateDisplayName(displayName);
        if (nameError) {
          sendJSON(res, 400, { error: nameError });
          return;
        }
      } else if (displayName) {
        const nameError = lb.validateDisplayName(displayName);
        if (nameError) {
          sendJSON(res, 400, { error: nameError });
          return;
        }
      }

      const profile = {
        displayName,
        showOnLeaderboard,
        updatedAt: new Date().toISOString()
      };
      await lb.setProfile(username, profile);

      // Sync the board to the current standing without waiting for a push.
      const record = await kv.getJSON(stateKey(username));
      await lb.updateScore(
        username,
        profile,
        lb.extractCorrectCount(record ? record.state : null)
      );

      sendJSON(res, 200, publicProfile(username, profile));
      return;
    }

    sendJSON(res, 405, { error: 'Method not allowed.' });
  } catch (err) {
    handleError(res, err);
  }
};
