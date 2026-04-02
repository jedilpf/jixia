const express = require('express');
const { HttpError } = require('../../utils/http-error.cjs');
const {
  resolveUserId,
  assertStorySlotType,
  assertStorySavePayload,
} = require('../../utils/validators.cjs');
const { sendV2Success } = require('./response.cjs');

function createStoryV2Router({ storySaveStore }) {
  const router = express.Router();

  if (!storySaveStore) {
    router.use((_req, _res, next) => {
      next(new HttpError(503, 'Story save store unavailable.'));
    });
    return router;
  }

  router.get('/saves', (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      const slots = storySaveStore.getSaveSlots(userId);
      sendV2Success(req, res, 200, {
        player_id: userId,
        slots,
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
      sendV2Success(req, res, 200, {
        player_id: userId,
        slot_type: slotType,
        save_payload: save,
      });
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
      const saved = storySaveStore.save(userId, slotType, payload);

      sendV2Success(req, res, 200, {
        player_id: userId,
        slot_type: slotType,
        idempotency_key: req.body?.idempotency_key || null,
        if_revision: req.body?.if_revision ?? null,
        saved,
      });
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
      sendV2Success(req, res, 200, {
        player_id: userId,
        slot_type: slotType,
        save_payload: save,
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/saves/:slotType', (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      const slotType = req.params.slotType;
      assertStorySlotType(slotType);
      const deleted = storySaveStore.remove(userId, slotType);
      sendV2Success(req, res, 200, {
        player_id: userId,
        slot_type: slotType,
        deleted,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createStoryV2Router,
};
