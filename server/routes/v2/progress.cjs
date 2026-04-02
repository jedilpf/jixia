const express = require('express');
const { HttpError } = require('../../utils/http-error.cjs');
const { resolveUserId, assertPlayerProgressPayload } = require('../../utils/validators.cjs');
const { sendV2Success } = require('./response.cjs');
const {
  parseOptionalRevision,
  normalizeIdempotencyKey,
  toPayloadHash,
  assertRevisionOrConflict,
} = require('./write-guards.cjs');

function createProgressV2Router({ progressStore }) {
  const router = express.Router();
  const revisionMap = new Map();
  const idempotencyMap = new Map();

  function getRevisionKey(userId) {
    return userId;
  }

  function getRevision(userId) {
    return revisionMap.get(getRevisionKey(userId)) ?? 0;
  }

  function setRevision(userId, revision) {
    revisionMap.set(getRevisionKey(userId), revision);
    return revision;
  }

  function getIdempotencyScope(userId, operation, idempotencyKey) {
    return `${userId}::${operation}::${idempotencyKey}`;
  }

  function replayIfMatched({
    req,
    res,
    userId,
    operation,
    idempotencyKey,
    payloadHash,
  }) {
    if (!idempotencyKey) {
      return false;
    }

    const scope = getIdempotencyScope(userId, operation, idempotencyKey);
    const previousRecord = idempotencyMap.get(scope);
    if (!previousRecord) {
      return false;
    }

    if (previousRecord.payloadHash !== payloadHash) {
      throw new HttpError(409, 'Idempotency conflict: same key with different payload.', {
        userId,
        idempotency_key: idempotencyKey,
        operation,
      });
    }

    sendV2Success(
      req,
      res,
      200,
      previousRecord.response,
      {
        revision: previousRecord.revision,
        idempotent_replay: true,
      }
    );
    return true;
  }

  function rememberIdempotency({
    userId,
    operation,
    idempotencyKey,
    payloadHash,
    revision,
    response,
  }) {
    if (!idempotencyKey) {
      return;
    }

    const scope = getIdempotencyScope(userId, operation, idempotencyKey);
    idempotencyMap.set(scope, {
      payloadHash,
      revision,
      response,
    });
  }

  if (!progressStore) {
    router.use((_req, _res, next) => {
      next(new HttpError(503, 'Progress store unavailable.'));
    });
    return router;
  }

  router.get('/', (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      const progress = progressStore.getProgress(userId);
      sendV2Success(req, res, 200, {
        player_id: userId,
        progress,
      }, { revision: getRevision(userId) });
    } catch (error) {
      next(error);
    }
  });

  router.put('/', (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      const payload = req.body?.progress_payload || req.body?.data || req.body;
      assertPlayerProgressPayload(payload, { partial: false });

      const currentRevision = getRevision(userId);
      const ifRevision = parseOptionalRevision(req.body?.if_revision);
      assertRevisionOrConflict({
        ifRevision,
        currentRevision,
        details: { userId },
      });

      const operation = 'put';
      const idempotencyKey = normalizeIdempotencyKey(req.body?.idempotency_key);
      const payloadHash = toPayloadHash({ operation, payload });
      const replayed = replayIfMatched({
        req,
        res,
        userId,
        operation,
        idempotencyKey,
        payloadHash,
      });
      if (replayed) {
        return;
      }

      const saved = progressStore.setProgress(userId, payload);
      const nextRevision = setRevision(userId, currentRevision + 1);
      const responseData = {
        player_id: userId,
        idempotency_key: idempotencyKey,
        if_revision: ifRevision,
        progress: saved,
      };
      rememberIdempotency({
        userId,
        operation,
        idempotencyKey,
        payloadHash,
        revision: nextRevision,
        response: responseData,
      });

      sendV2Success(req, res, 200, responseData, { revision: nextRevision });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/', (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      const payload = req.body?.progress_payload || req.body?.data || req.body;
      assertPlayerProgressPayload(payload, { partial: true });

      const currentRevision = getRevision(userId);
      const ifRevision = parseOptionalRevision(req.body?.if_revision);
      assertRevisionOrConflict({
        ifRevision,
        currentRevision,
        details: { userId },
      });

      const operation = 'patch';
      const idempotencyKey = normalizeIdempotencyKey(req.body?.idempotency_key);
      const payloadHash = toPayloadHash({ operation, payload });
      const replayed = replayIfMatched({
        req,
        res,
        userId,
        operation,
        idempotencyKey,
        payloadHash,
      });
      if (replayed) {
        return;
      }

      const saved = progressStore.patchProgress(userId, payload);
      const nextRevision = setRevision(userId, currentRevision + 1);
      const responseData = {
        player_id: userId,
        idempotency_key: idempotencyKey,
        if_revision: ifRevision,
        progress: saved,
      };
      rememberIdempotency({
        userId,
        operation,
        idempotencyKey,
        payloadHash,
        revision: nextRevision,
        response: responseData,
      });

      sendV2Success(req, res, 200, responseData, { revision: nextRevision });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/', (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      const currentRevision = getRevision(userId);
      const ifRevision = parseOptionalRevision(req.body?.if_revision);
      assertRevisionOrConflict({
        ifRevision,
        currentRevision,
        details: { userId },
      });

      const operation = 'delete';
      const idempotencyKey = normalizeIdempotencyKey(req.body?.idempotency_key);
      const payloadHash = toPayloadHash({ operation });
      const replayed = replayIfMatched({
        req,
        res,
        userId,
        operation,
        idempotencyKey,
        payloadHash,
      });
      if (replayed) {
        return;
      }

      const deleted = progressStore.removeProgress(userId);
      const nextRevision = deleted ? setRevision(userId, currentRevision + 1) : currentRevision;
      const responseData = {
        player_id: userId,
        idempotency_key: idempotencyKey,
        if_revision: ifRevision,
        deleted,
      };
      rememberIdempotency({
        userId,
        operation,
        idempotencyKey,
        payloadHash,
        revision: nextRevision,
        response: responseData,
      });

      sendV2Success(req, res, 200, responseData, { revision: nextRevision });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createProgressV2Router,
};
