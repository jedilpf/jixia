const { HttpError } = require('../../utils/http-error.cjs');

function parseOptionalRevision(rawValue, fieldName = 'if_revision') {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return null;
  }

  const parsed = Number(rawValue);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new HttpError(400, `${fieldName} must be a non-negative integer.`);
  }
  return parsed;
}

function normalizeIdempotencyKey(rawValue) {
  if (rawValue === undefined || rawValue === null) {
    return null;
  }
  if (typeof rawValue !== 'string') {
    throw new HttpError(400, 'idempotency_key must be a string.');
  }
  const value = rawValue.trim();
  if (!value) {
    throw new HttpError(400, 'idempotency_key cannot be empty.');
  }
  if (value.length > 128) {
    throw new HttpError(400, 'idempotency_key is too long (max 128).');
  }
  return value;
}

function toPayloadHash(payload) {
  return JSON.stringify(payload);
}

function assertRevisionOrConflict({ ifRevision, currentRevision, details = {} }) {
  if (ifRevision === null || ifRevision === currentRevision) {
    return;
  }
  throw new HttpError(409, 'Revision conflict.', {
    ...details,
    if_revision: ifRevision,
    current_revision: currentRevision,
  });
}

module.exports = {
  parseOptionalRevision,
  normalizeIdempotencyKey,
  toPayloadHash,
  assertRevisionOrConflict,
};
