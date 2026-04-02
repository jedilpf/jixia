function parsePositiveInt(value, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    return fallback;
  }
  return Math.floor(num);
}

function parseBoolean(value, fallback = false) {
  if (typeof value !== 'string') return fallback;
  const text = value.trim().toLowerCase();
  if (text === '1' || text === 'true' || text === 'yes' || text === 'on') return true;
  if (text === '0' || text === 'false' || text === 'no' || text === 'off') return false;
  return fallback;
}

const DEFAULT_PORT = parsePositiveInt(process.env.BACKEND_PORT || process.env.PORT, 8787);
const DEFAULT_HOST = process.env.BACKEND_HOST || '127.0.0.1';
const DEFAULT_CLIENT_ORIGIN = process.env.CLIENT_ORIGIN
  || 'http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:5174,http://localhost:5174';
const DEFAULT_MATCH_TTL_MS = parsePositiveInt(process.env.MATCH_TTL_MS, 4 * 60 * 60 * 1000);
const REQUIRE_PLAYER_ID = parseBoolean(process.env.REQUIRE_PLAYER_ID, false);
const DEFAULT_DATA_DIR = process.env.BACKEND_DATA_DIR || 'data/backend';

function parseOrigins(value) {
  const raw = typeof value === 'string' && value.trim().length > 0
    ? value
    : DEFAULT_CLIENT_ORIGIN;
  return Array.from(new Set(raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)));
}

module.exports = {
  DEFAULT_PORT,
  DEFAULT_HOST,
  DEFAULT_MATCH_TTL_MS,
  REQUIRE_PLAYER_ID,
  DEFAULT_DATA_DIR,
  parseOrigins,
};
