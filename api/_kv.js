// Tiny Redis adapter over the Upstash REST protocol.
// Works with Vercel KV or Upstash Redis — whichever env vars are set.
// Zero dependencies: uses the Node 18+ global fetch.
//
//   Vercel KV:  KV_REST_API_URL / KV_REST_API_TOKEN
//   Upstash:    UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN

const KV_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const KV_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

function isConfigured() {
  return Boolean(KV_URL && KV_TOKEN);
}

async function command(...args) {
  if (!isConfigured()) {
    const err = new Error('Storage is not configured.');
    err.code = 'KV_UNCONFIGURED';
    throw err;
  }
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  });
  if (!res.ok) {
    const err = new Error(`KV request failed (${res.status}).`);
    err.code = 'KV_REQUEST_FAILED';
    throw err;
  }
  const data = await res.json();
  return data.result;
}

async function get(key) {
  return command('GET', key);
}

async function set(key, value) {
  return command('SET', key, value);
}

async function setex(key, seconds, value) {
  return command('SET', key, value, 'EX', String(seconds));
}

async function del(key) {
  return command('DEL', key);
}

async function getJSON(key) {
  const raw = await get(key);
  if (raw === null || raw === undefined) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

async function setJSON(key, value) {
  return set(key, JSON.stringify(value));
}

async function incr(key) {
  return command('INCR', key);
}

async function expire(key, seconds) {
  return command('EXPIRE', key, String(seconds));
}

module.exports = {
  isConfigured,
  command,
  get,
  set,
  setex,
  del,
  getJSON,
  setJSON,
  incr,
  expire
};
