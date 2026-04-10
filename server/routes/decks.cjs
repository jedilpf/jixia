/**
 * 牌组路由
 * 处理牌组 CRUD 等接口
 */

const express = require('express');
const { authenticate } = require('../middleware/auth.cjs');

function createDecksRouter({ services }) {
  const router = express.Router();

  /**
   * GET /api/v1/decks
   * 获取用户牌组列表
   */
  router.get('/', authenticate, (req, res, next) => {
    try {
      const result = services.card.getUserDecks(req.user.userId);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/v1/decks
   * 创建牌组
   */
  router.post('/', authenticate, (req, res, next) => {
    try {
      const { name, faction, cards } = req.body;

      // 参数验证
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          error: 'DECK_NAME_REQUIRED',
          message: 'Deck name is required'
        });
      }

      if (!faction) {
        return res.status(400).json({
          error: 'FACTION_REQUIRED',
          message: 'Faction is required'
        });
      }

      if (!cards || !Array.isArray(cards)) {
        return res.status(400).json({
          error: 'CARDS_REQUIRED',
          message: 'Cards array is required'
        });
      }

      const deck = services.card.createDeck(req.user.userId, {
        name: name.trim(),
        faction,
        cards
      });

      res.status(201).json({
        success: true,
        data: deck
      });
    } catch (err) {
      // 牌组验证错误
      if (err.message === 'DECK_MUST_HAVE_24_CARDS') {
        return res.status(400).json({
          error: 'DECK_MUST_HAVE_24_CARDS',
          message: 'Deck must have exactly 24 cards'
        });
      }
      if (err.message.startsWith('CARD_NOT_FOUND')) {
        return res.status(400).json({
          error: 'CARD_NOT_FOUND',
          message: err.message
        });
      }
      if (err.message.startsWith('CARD_FACTION_MISMATCH')) {
        return res.status(400).json({
          error: 'CARD_FACTION_MISMATCH',
          message: err.message
        });
      }
      if (err.message === 'TIER2_CARDS_EXCEED_LIMIT') {
        return res.status(400).json({
          error: 'TIER2_CARDS_EXCEED_LIMIT',
          message: 'Tier 2 cards cannot exceed 8'
        });
      }
      if (err.message === 'TIER3_CARDS_EXCEED_LIMIT') {
        return res.status(400).json({
          error: 'TIER3_CARDS_EXCEED_LIMIT',
          message: 'Tier 3 cards cannot exceed 4'
        });
      }
      next(err);
    }
  });

  /**
   * GET /api/v1/decks/:id
   * 获取牌组详情
   */
  router.get('/:id', authenticate, (req, res, next) => {
    try {
      const { id } = req.params;
      const deck = services.card.getDeckDetail(req.user.userId, id);
      res.json({
        success: true,
        data: deck
      });
    } catch (err) {
      if (err.message === 'DECK_NOT_FOUND') {
        return res.status(404).json({
          error: 'DECK_NOT_FOUND',
          message: 'Deck not found'
        });
      }
      if (err.message === 'DECK_NOT_OWNED') {
        return res.status(403).json({
          error: 'DECK_NOT_OWNED',
          message: 'You do not own this deck'
        });
      }
      next(err);
    }
  });

  /**
   * PUT /api/v1/decks/:id
   * 更新牌组
   */
  router.put('/:id', authenticate, (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, faction, cards } = req.body;

      const deck = services.card.updateDeck(req.user.userId, id, {
        name: name?.trim(),
        faction,
        cards
      });

      res.json({
        success: true,
        data: deck
      });
    } catch (err) {
      if (err.message === 'DECK_NOT_FOUND') {
        return res.status(404).json({
          error: 'DECK_NOT_FOUND',
          message: 'Deck not found'
        });
      }
      if (err.message === 'DECK_NOT_OWNED') {
        return res.status(403).json({
          error: 'DECK_NOT_OWNED',
          message: 'You do not own this deck'
        });
      }
      // 牌组验证错误
      if (err.message === 'DECK_MUST_HAVE_24_CARDS') {
        return res.status(400).json({
          error: 'DECK_MUST_HAVE_24_CARDS',
          message: 'Deck must have exactly 24 cards'
        });
      }
      if (err.message === 'TIER2_CARDS_EXCEED_LIMIT') {
        return res.status(400).json({
          error: 'TIER2_CARDS_EXCEED_LIMIT',
          message: 'Tier 2 cards cannot exceed 8'
        });
      }
      if (err.message === 'TIER3_CARDS_EXCEED_LIMIT') {
        return res.status(400).json({
          error: 'TIER3_CARDS_EXCEED_LIMIT',
          message: 'Tier 3 cards cannot exceed 4'
        });
      }
      next(err);
    }
  });

  /**
   * DELETE /api/v1/decks/:id
   * 删除牌组
   */
  router.delete('/:id', authenticate, (req, res, next) => {
    try {
      const { id } = req.params;
      services.card.deleteDeck(req.user.userId, id);
      res.json({
        success: true,
        message: 'Deck deleted successfully'
      });
    } catch (err) {
      if (err.message === 'DECK_NOT_FOUND') {
        return res.status(404).json({
          error: 'DECK_NOT_FOUND',
          message: 'Deck not found'
        });
      }
      if (err.message === 'DECK_NOT_OWNED') {
        return res.status(403).json({
          error: 'DECK_NOT_OWNED',
          message: 'You do not own this deck'
        });
      }
      if (err.message === 'CANNOT_DELETE_DEFAULT_DECK') {
        return res.status(400).json({
          error: 'CANNOT_DELETE_DEFAULT_DECK',
          message: 'Cannot delete default deck'
        });
      }
      next(err);
    }
  });

  /**
   * POST /api/v1/decks/:id/default
   * 设置默认牌组
   */
  router.post('/:id/default', authenticate, (req, res, next) => {
    try {
      const { id } = req.params;
      const deck = services.card.setDefaultDeck(req.user.userId, id);
      res.json({
        success: true,
        data: deck
      });
    } catch (err) {
      if (err.message === 'DECK_NOT_FOUND') {
        return res.status(404).json({
          error: 'DECK_NOT_FOUND',
          message: 'Deck not found'
        });
      }
      if (err.message === 'DECK_NOT_OWNED') {
        return res.status(403).json({
          error: 'DECK_NOT_OWNED',
          message: 'You do not own this deck'
        });
      }
      next(err);
    }
  });

  return router;
}

module.exports = { createDecksRouter };
