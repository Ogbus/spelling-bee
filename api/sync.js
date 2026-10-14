// GET  /api/sync   -> { state, updatedAt }
// PUT  /api/sync   { state }  -> { updatedAt }
//
// The state blob is opaque to the server; the client owns the merge logic.
// Clients pull before pushing so the most recent merge wins.

const kv = require('./_kv');
const auth = require('./_auth');
const { sendJSON, readBody, handleError } = require('./_http');

const MAX_STATE_BYTES = 1024 * 1024; // 1 MB per user

function stateKey(username) {
  return 'state:' + username;
}

module.exports = async (req, res) => {
  try {
    const username = await auth.resolveSession(req);
    if (!username) {
      sendJSON(res, 401, { error: 'Not signed in.' });
      return;
    }

    if (req.method === 'GET') {
      const record = await kv.getJSON(stateKey(username));
      sendJSON(res, 200, {
        state: record ? record.state : null,
        updatedAt: record ? record.updatedAt : null
      });
      return;
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = await readBody(req);
      const state = body.state;
      if (state === undefined) {
        sendJSON(res, 400, { error: 'Missing state.' });
        return;
      }
      const serialized = JSON.stringify(state || null);
      if (serialized.length > MAX_STATE_BYTES) {
        sendJSON(res, 413, { error: 'Saved data is too large.' });
        return;
      }
      const updatedAt = new Date().toISOString();
      await kv.setJSON(stateKey(username), { state: state || null, updatedAt });
      sendJSON(res, 200, { updatedAt });
      return;
    }

    sendJSON(res, 405, { error: 'Method not allowed.' });
  } catch (err) {
    handleError(res, err);
  }
};
