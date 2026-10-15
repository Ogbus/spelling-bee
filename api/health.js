// GET /api/health — safe diagnostic for the KV connection.
// Reports whether storage env vars are present (names only, never values)
// and whether a Redis round-trip succeeds. No auth required; no secrets shown.

const kv = require('./_kv');
const { sendJSON, handleError } = require('./_http');

const NAMES = [
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN'
];

module.exports = async (req, res) => {
  try {
    const envVarsPresent = {};
    NAMES.forEach((name) => { envVarsPresent[name] = Boolean(process.env[name]); });

    let roundTrip = 'skipped';
    if (kv.isConfigured()) {
      try {
        const key = 'health:' + Date.now() + ':' + Math.random().toString(36).slice(2);
        await kv.setex(key, 30, 'ok');
        const value = await kv.get(key);
        await kv.del(key);
        roundTrip = value === 'ok' ? 'ok' : 'unexpected-response';
      } catch (err) {
        roundTrip = 'error:' + (err.code || err.message || 'unknown');
      }
    }

    sendJSON(res, 200, {
      configured: kv.isConfigured(),
      node: process.version,
      envVarsPresent,
      roundTrip
    });
  } catch (err) {
    handleError(res, err);
  }
};
