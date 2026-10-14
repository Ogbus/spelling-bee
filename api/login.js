// POST /api/login  { username, pin }
// Verifies credentials and returns a bearer session token.

const kv = require('./_kv');
const auth = require('./_auth');
const { sendJSON, readBody, handleError } = require('./_http');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    sendJSON(res, 405, { error: 'Method not allowed.' });
    return;
  }

  try {
    const body = await readBody(req);
    const username = auth.normalizeUsername(body.username);
    const pin = String(body.pin || '');

    if (!username || !pin) {
      sendJSON(res, 400, { error: 'Enter your username and PIN.' });
      return;
    }

    const user = await kv.getJSON(auth.USER_PREFIX + username);
    if (!user || !auth.verifyPin(pin, user.salt, user.hash)) {
      sendJSON(res, 401, { error: 'Incorrect username or PIN.' });
      return;
    }

    const token = await auth.createSession(username);
    sendJSON(res, 200, { username, token });
  } catch (err) {
    handleError(res, err);
  }
};
