// Shared request/response helpers for the serverless functions.

function sendJSON(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 5 * 1024 * 1024) req.destroy(); // 5 MB safety cap
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function handleError(res, err) {
  if (err && err.code === 'KV_UNCONFIGURED') {
    sendJSON(res, 503, { error: 'Sync storage is not configured on the server.' });
    return;
  }
  console.error('Spell It API error:', err);
  sendJSON(res, 500, { error: 'Something went wrong. Please try again.' });
}

module.exports = { sendJSON, readBody, handleError };
