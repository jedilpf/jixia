const { isHttpError } = require('../utils/http-error.cjs');

function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl || req.url}`,
    },
  });
}

function errorHandler(error, req, res, _next) {
  const statusCode = isHttpError(error) ? error.statusCode : 500;
  const code = statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR';
  const message = error?.message || 'Unexpected server error.';
  const details = isHttpError(error) ? error.details : undefined;

  if (statusCode >= 500) {
    console.error('[api:error]', {
      method: req.method,
      path: req.originalUrl || req.url,
      message,
      stack: error?.stack || '',
    });
  }

  res.status(statusCode).json({
    ok: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
