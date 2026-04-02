const express = require('express');
const { resolveUserId, assertPlayerProgressPayload } = require('../utils/validators.cjs');

function createProgressRouter({ progressStore }) {
  const router = express.Router();

  router.get('/', (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      const progress = progressStore.getProgress(userId);
      res.status(200).json({
        ok: true,
        data: {
          userId,
          ...progress,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  router.put('/', (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      const payload = req.body?.data || req.body;
      assertPlayerProgressPayload(payload, { partial: false });
      const saved = progressStore.setProgress(userId, payload);
      res.status(200).json({
        ok: true,
        data: {
          userId,
          exists: true,
          ...saved,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/', (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      const payload = req.body?.data || req.body;
      assertPlayerProgressPayload(payload, { partial: true });
      const saved = progressStore.patchProgress(userId, payload);
      res.status(200).json({
        ok: true,
        data: {
          userId,
          exists: true,
          ...saved,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/', (req, res, next) => {
    try {
      const userId = resolveUserId(req);
      const deleted = progressStore.removeProgress(userId);
      res.status(200).json({
        ok: true,
        data: {
          userId,
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
  createProgressRouter,
};
