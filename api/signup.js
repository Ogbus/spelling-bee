// POST /api/signup  { username, pin }
// Creates a new account and returns a bearer session token.
// If an optional `state` bundle is provided, it becomes the initial data.

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

    const usernameError = auth.validateUsername(username);
    if (usernameError) {
      sendJSON(res, 400, { error: usernameError });
      return;
    }
    const pinError = auth.validatePin(pin);
    if (pinError) {
      sendJSON(res, 400, { error: pinError });
      return;
    }

    const userKey = auth.USER_PREFIX + username;
    const existing = await kv.get(userKey);
    if (existing) {
      sendJSON(res, 409, { error: 'That username is already taken.' });
      return;
    }

    const { salt, hash } = auth.hashPin(pin);
    const user = { username, salt, hash, createdAt: new Date().toISOString() };
    await kv.setJSON(userKey, user);

    const token = await auth.createSession(username);

    const stateKey = 'state:' + username;
    const initialState =
      body.state && typeof body.state === 'object' ? body.state : null;
    await kv.setJSON(stateKey, {
      state: initialState,
      updatedAt: new Date().toISOString()
    });

    sendJSON(res, 200, { username, token });
  } catch (err) {
    handleError(res, err);
  }
};
