class HttpError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = Number(statusCode) || 500;
    this.details = details;
  }
}

function isHttpError(error) {
  return Boolean(error && typeof error.statusCode === 'number');
}

module.exports = {
  HttpError,
  isHttpError,
};
