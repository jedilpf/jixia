const express = require('express');
const { HttpError } = require('../../utils/http-error.cjs');
const {
  resolveUserId,
  assertStorySlotType,
  assertStorySavePayload,
} = require('../../utils/validators.cjs');
const { sendV2Success } = require('./response.cjs');
const {
  parseOptionalRevision,
  normalizeIdempotencyKey,
  toPayloadHash,
  assertRevisionOrConflict,
} = require('./write-guards.cjs');

function createStoryV2Router({ storySaveStore }) {
  const router = express.Router();
  const revisionMap = new Map();
  const idempotencyMap = new Map();

  function getSlotKey(userId, slotType) {
    return `${userId}::${slotType}`;
  }

  function getRevision(slotKey) {
    return revisionMap.get(slotKey) ?? 0;
  }

  function setRevision(slotKey, revision) {
    revisionMap.set(slotKey, revision);
    return revision;
  }

  function buildSlotsWithRevision(userId) {
    const slots = storySaveStore.getSaveSlots(userId);
    return {
      autosave: { ...slots.autosave, revision: getRevision(getSlotKey(userId, 'autosave')) },
      manual_1: { ...slots.manual_1, revision: getRevision(getSlotKey(userId, 'manual_1')) },
      manual_2: { ...slots.manual_2, revision: getRevision(getSlotKey(userId, 'manual_2')) },
      manual_3: { ...slots.manual_3, revision: getRevision(getSlotKey(userId, 'manual_3')) },
    };
  }

  if (!storySaveStore) {
    router.use((_req, _res, next) => {
      next(new HttpError(503, 'Story save store unavailable.'));
    });
    return router;
  }

  router.get('/saves', (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      sendV2Success(req, res, 200, {
        player_id: userId,
        slots: buildSlotsWithRevision(userId),
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/saves/:slotType', (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      const slotType = req.params.slotType;
      assertStorySlotType(slotType);
      const save = storySaveStore.getSave(userId, slotType);
      if (!save) {
        throw new HttpError(404, 'Story save not found.', { userId, slotType });
      }

      const revision = getRevision(getSlotKey(userId, slotType));
      sendV2Success(req, res, 200, {
        player_id: userId,
        slot_type: slotType,
        save_payload: save,
      }, { revision });
    } catch (error) {
      next(error);
    }
  });

  router.put('/saves/:slotType', (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      const slotType = req.params.slotType;
      assertStorySlotType(slotType);

      const payload = req.body?.save_payload || req.body?.data || req.body;
      assertStorySavePayload(payload);

      const slotKey = getSlotKey(userId, slotType);
      const currentRevision = getRevision(slotKey);
      const ifRevision = parseOptionalRevision(req.body?.if_revision);
      assertRevisionOrConflict({
        ifRevision,
        currentRevision,
        details: { userId, slotType },
      });

      const idempotencyKey = normalizeIdempotencyKey(req.body?.idempotency_key);
      const payloadHash = toPayloadHash(payload);
      const idemKey = idempotencyKey ? `${slotKey}::${idempotencyKey}` : null;
      const previousRecord = idemKey ? idempotencyMap.get(idemKey) : null;
      if (previousRecord) {
        if (previousRecord.payloadHash !== payloadHash) {
          throw new HttpError(409, 'Idempotency conflict: same key with different payload.', {
            userId,
            slotType,
            idempotency_key: idempotencyKey,
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
        return;
      }

      const saved = storySaveStore.save(userId, slotType, payload);
      const nextRevision = setRevision(slotKey, currentRevision + 1);
      const responseData = {
        player_id: userId,
        slot_type: slotType,
        idempotency_key: idempotencyKey,
        if_revision: ifRevision,
        saved,
      };

      if (idemKey) {
        idempotencyMap.set(idemKey, {
          payloadHash,
          revision: nextRevision,
          response: responseData,
        });
      }

      sendV2Success(req, res, 200, responseData, { revision: nextRevision });
    } catch (error) {
      next(error);
    }
  });

  router.post('/saves/:slotType/load', (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      const slotType = req.params.slotType;
      assertStorySlotType(slotType);
      const save = storySaveStore.getSave(userId, slotType);
      if (!save) {
        throw new HttpError(404, 'Story save not found.', { userId, slotType });
      }

      const revision = getRevision(getSlotKey(userId, slotType));
      sendV2Success(req, res, 200, {
        player_id: userId,
        slot_type: slotType,
        save_payload: save,
      }, { revision });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/saves/:slotType', (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      const slotType = req.params.slotType;
      assertStorySlotType(slotType);
      const slotKey = getSlotKey(userId, slotType);

      const currentRevision = getRevision(slotKey);
      const ifRevision = parseOptionalRevision(req.body?.if_revision);
      assertRevisionOrConflict({
        ifRevision,
        currentRevision,
        details: { userId, slotType },
      });

      const deleted = storySaveStore.remove(userId, slotType);
      const nextRevision = deleted ? setRevision(slotKey, currentRevision + 1) : currentRevision;
      sendV2Success(req, res, 200, {
        player_id: userId,
        slot_type: slotType,
        deleted,
      }, { revision: nextRevision });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createStoryV2Router,
};
