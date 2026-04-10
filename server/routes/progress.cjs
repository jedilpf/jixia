const express = require('express');
const { HttpError } = require('../utils/http-error.cjs');
const {
  resolveUserId,
  assertPlayerProgressPayload,
} = require('../utils/validators.cjs');
const { authenticate } = require('../middleware/auth.cjs');

function createProgressRouter({ models, progressStore }) {
  const router = express.Router();

  router.use(authenticate);

  router.get('/', (req, res, next) => {
    try {
      const userId = req.user.userId;
      let progress = models.progress.findByUser(userId);

      if (!progress && progressStore) {
        progress = progressStore.getProgress(userId);
      }

      if (!progress) {
        progress = models.progress.getOrCreate(userId);
      }

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
      const userId = req.user.userId;
      const payload = req.body?.data || req.body;
      assertPlayerProgressPayload(payload, { partial: false });

      const saved = models.progress.update(userId, payload);

      if (progressStore) {
        progressStore.setProgress(userId, payload);
      }

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
      const userId = req.user.userId;
      const payload = req.body?.data || req.body;
      assertPlayerProgressPayload(payload, { partial: true });

      const saved = models.progress.patch(userId, payload);

      if (progressStore) {
        progressStore.patchProgress(userId, payload);
      }

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
      const userId = req.user.userId;
      const deleted = models.progress.delete(userId);

      if (progressStore) {
        progressStore.removeProgress(userId);
      }

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
