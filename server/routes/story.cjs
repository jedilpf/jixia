const express = require('express');
const { HttpError } = require('../utils/http-error.cjs');
const {
  assertStorySlotType,
  assertStorySavePayload,
} = require('../utils/validators.cjs');
const { authenticate } = require('../middleware/auth.cjs');

function createStoryRouter({ models, storySaveStore }) {
  const router = express.Router();

  router.use(authenticate);

  router.get('/saves', (req, res, next) => {
    try {
      const userId = req.user.userId;
      const saves = models.story.findByUser(userId);
      
      // 如果数据库没有，使用内存存储作为后备
      if (saves.length === 0 && storySaveStore) {
        const slots = storySaveStore.getSaveSlots(userId);
        res.status(200).json({
          ok: true,
          data: slots,
        });
        return;
      }

      // 格式化槽位数据
      const slots = ['autosave', 'manual_1', 'manual_2', 'manual_3'].map(slotType => {
        const save = saves.find(s => s.slotType === slotType);
        return save ? {
          slotType,
          save: {
            id: save.id,
            version: save.version,
            currentNodeId: save.currentNodeId,
            chapter: save.chapter,
            scene: save.scene,
            playTime: save.playTime,
            updatedAt: save.updatedAt
          }
        } : { slotType, save: null };
      });

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
      const userId = req.user.userId;
      const slotType = req.params.slotType;
      assertStorySlotType(slotType);
      
      const save = models.story.findByUserAndSlot(userId, slotType);
      
      // 如果数据库没有，使用内存存储作为后备
      if (!save && storySaveStore) {
        const memSave = storySaveStore.getSave(userId, slotType);
        if (!memSave) {
          throw new HttpError(404, 'Story save not found.', { userId, slotType });
        }
        res.status(200).json({
          ok: true,
          data: {
            slotType,
            save: memSave,
          },
        });
        return;
      }

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
      const userId = req.user.userId;
      const slotType = req.params.slotType;
      assertStorySlotType(slotType);
      const payload = req.body?.data || req.body;
      assertStorySavePayload(payload);
      
      const saved = models.story.upsert(userId, slotType, payload);

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
      const userId = req.user.userId;
      const slotType = req.params.slotType;
      assertStorySlotType(slotType);
      
      const save = models.story.findByUserAndSlot(userId, slotType);
      
      // 如果数据库没有，使用内存存储作为后备
      if (!save && storySaveStore) {
        const memSave = storySaveStore.getSave(userId, slotType);
        if (!memSave) {
          throw new HttpError(404, 'Story save not found.', { userId, slotType });
        }
        res.status(200).json({
          ok: true,
          data: {
            slotType,
            save: memSave,
          },
        });
        return;
      }

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
      const userId = req.user.userId;
      const slotType = req.params.slotType;
      assertStorySlotType(slotType);
      
      const deleted = models.story.deleteByUserAndSlot(userId, slotType);
      
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
