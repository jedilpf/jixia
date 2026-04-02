const express = require('express');
const { HttpError } = require('../utils/http-error.cjs');
const {
  resolveUserId,
  assertStorySlotType,
  assertStorySavePayload,
} = require('../utils/validators.cjs');

function createStoryRouter({ storySaveStore }) {
  const router = express.Router();

  router.get('/saves', (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      const slots = storySaveStore.getSaveSlots(userId);
      res.status(200).json({
        ok: true,
        data: slots,
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
      res.status(200).json({
        ok: true,
        data: {
          slotType,
          save,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/saves/:slotType', (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      const slotType = req.params.slotType;
      assertStorySlotType(slotType);
      const payload = req.body?.data || req.body;
      assertStorySavePayload(payload);
      const saved = storySaveStore.save(userId, slotType, payload);
      res.status(201).json({
        ok: true,
        data: saved,
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
      res.status(200).json({
        ok: true,
        data: {
          slotType,
          save,
        },
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
      res.status(200).json({
        ok: true,
        data: {
          userId,
          slotType,
          deleted,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createStoryRouter,
};
