/**
 * 卡牌路由
 * 处理卡牌列表、详情等接口
 */

const express = require('express');
const { authenticate } = require('../middleware/auth.cjs');

function createCardsRouter({ services }) {
  const router = express.Router();

  /**
   * GET /api/v1/cards
   * 获取卡牌列表
   */
  router.get('/', (req, res, next) => {
    try {
      const { faction, type, rarity, tier, page, limit } = req.query;
      
      const result = services.card.getCardList({
        faction,
        type,
        rarity,
        tier,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20
      });

      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/v1/cards/:id
   * 获取卡牌详情
   */
  router.get('/:id', (req, res, next) => {
    try {
      const { id } = req.params;
      const card = services.card.getCardDetail(id);

      res.json({
        success: true,
        data: card
      });
    } catch (err) {
      if (err.message === 'CARD_NOT_FOUND') {
        return res.status(404).json({
          error: 'CARD_NOT_FOUND',
          message: 'Card not found'
        });
      }
      next(err);
    }
  });

  /**
   * GET /api/v1/cards/collections
   * 获取用户卡牌收藏
   */
  router.get('/collections', authenticate, (req, res, next) => {
    try {
      const userId = req.user.userId;
      const result = services.card.getUserCards(userId);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createCardsRouter };
