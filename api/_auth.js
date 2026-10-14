// Auth helpers: PIN hashing (scrypt) and bearer session tokens.
// Sessions are opaque random tokens stored in KV with a TTL — no JWT secret
// to manage, and revoking a session is a single DEL.

const crypto = require('crypto');
const kv = require('./_kv');

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const USER_PREFIX = 'user:';
const SESSION_PREFIX = 'session:';

function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase();
}

function validateUsername(username) {
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return 'Username must be 3–20 characters: letters, numbers, or underscore.';
  }
  return null;
}

function validatePin(pin) {
  if (!/^\d{4,8}$/.test(String(pin || ''))) {
    return 'PIN must be 4–8 digits.';
  }
  return null;
}

function hashPin(pin, salt) {
  const useSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(pin), useSalt, 64).toString('hex');
  return { salt: useSalt, hash: derived };
}

function verifyPin(pin, salt, expectedHash) {
  const derived = crypto.scryptSync(String(pin), salt, 64).toString('hex');
  const a = Buffer.from(derived, 'hex');
  const b = Buffer.from(expectedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function newSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function createSession(username) {
  const token = newSessionToken();
  await kv.setex(SESSION_PREFIX + token, SESSION_TTL_SECONDS, username);
  return token;
}

function getBearerToken(req) {
  const header = req.headers['authorization'] || req.headers['Authorization'] || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}

// Resolves the bearer token to a username, or null if invalid/expired.
async function resolveSession(req) {
  const token = getBearerToken(req);
  if (!token) return null;
  const username = await kv.get(SESSION_PREFIX + token);
  return username || null;
}

async function destroySession(req) {
  const token = getBearerToken(req);
  if (token) await kv.del(SESSION_PREFIX + token);
}

module.exports = {
  USER_PREFIX,
  SESSION_PREFIX,
  SESSION_TTL_SECONDS,
  normalizeUsername,
  validateUsername,
  validatePin,
  hashPin,
  verifyPin,
  createSession,
  resolveSession,
  destroySession
};
