const { randomUUID } = require('crypto');

function resolveRequestId(req) {
  const fromHeader = req.headers['x-request-id'];
  if (typeof fromHeader === 'string' && fromHeader.trim()) {
    return fromHeader.trim();
  }
  return `req_${randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

function sendV2Success(req, res, statusCode, data, meta = {}) {
  res.status(statusCode).json({
    ok: true,
    data,
    meta: {
      request_id: resolveRequestId(req),
      server_time: new Date().toISOString(),
      ...meta,
    },
  });
}

module.exports = {
  sendV2Success,
};
