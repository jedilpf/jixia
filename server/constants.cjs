const DEFAULT_PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 8787);
const DEFAULT_CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5174';

function parseOrigins(value) {
  const raw = typeof value === 'string' && value.trim().length > 0
    ? value
    : DEFAULT_CLIENT_ORIGIN;
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

module.exports = {
  DEFAULT_PORT,
  parseOrigins,
};
