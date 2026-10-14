// POST /api/logout
// Revokes the caller's current session token.

const auth = require('./_auth');
const { sendJSON, handleError } = require('./_http');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    sendJSON(res, 405, { error: 'Method not allowed.' });
    return;
  }
  try {
    await auth.destroySession(req);
    sendJSON(res, 200, { ok: true });
  } catch (err) {
    handleError(res, err);
  }
};
