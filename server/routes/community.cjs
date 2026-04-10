/**
 * 社区路由
 * 包含排行榜、成就等功能
 */

const express = require('express');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.cjs');

function createCommunityRouter({ models }) {
  const router = express.Router();

  router.get('/leaderboard', optionalAuthenticate, (req, res, next) => {
    try {
      const { type = 'wins', page = 1, limit = 20 } = req.query;
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
      const offset = (pageNum - 1) * limitNum;

      let entries = [];
      let total = models.leaderboard.getTotalPlayers();

      switch (type) {
        case 'wins':
          entries = models.leaderboard.getByWinCount(limitNum, offset);
          break;
        case 'winrate':
          entries = models.leaderboard.getByWinRate(10, limitNum, offset);
          break;
        case 'level':
          entries = models.leaderboard.getByLevel(limitNum, offset);
          break;
        case 'streak':
          entries = models.leaderboard.getByWinStreak(limitNum, offset);
          break;
        default:
          entries = models.leaderboard.getByWinCount(limitNum, offset);
      }

      res.status(200).json({
        ok: true,
        data: {
          entries,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/leaderboard/me', authenticate, (req, res, next) => {
    try {
      const userId = req.user.userId;

      const progress = models.progress.findByUser(userId);
      if (!progress) {
        res.status(200).json({
          ok: true,
          data: {
            rank: null,
            total: models.leaderboard.getTotalPlayers(),
            progress: null
          }
        });
        return;
      }

      const rank = models.leaderboard.getUserRank(userId);
      const stats = {
        userId,
        username: req.user.username,
        displayName: req.user.displayName || req.user.username,
        level: progress.level,
        exp: progress.exp,
        winCount: progress.winCount,
        totalGames: progress.totalGames,
        winRate: progress.totalGames > 0 ? parseFloat((progress.winCount / progress.totalGames).toFixed(4)) : 0,
        maxWinStreak: progress.maxWinStreak
      };

      res.status(200).json({
        ok: true,
        data: {
          rank,
          total: models.leaderboard.getTotalPlayers(),
          progress: stats
        }
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/achievements', authenticate, (req, res, next) => {
    try {
      const userId = req.user.userId;

      const allAchievements = models.achievement.findAll();
      const userAchievements = models.achievement.getUserAchievements(userId);
      const userAchievementIds = new Set(userAchievements.map(a => a.id));
      const tierCount = models.achievement.getUserAchievementCountByTier(userId);

      const entries = allAchievements.map(achievement => ({
        ...achievement,
        unlocked: userAchievementIds.has(achievement.id),
        unlockedAt: userAchievements.find(a => a.id === achievement.id)?.unlockedAt || null
      }));

      res.status(200).json({
        ok: true,
        data: {
          achievements: entries,
          totalCount: allAchievements.length,
          unlockedCount: userAchievements.length,
          tierCount
        }
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/achievements/me', authenticate, (req, res, next) => {
    try {
      const userId = req.user.userId;

      const userAchievements = models.achievement.getUserAchievements(userId);
      const totalCount = models.achievement.getUserAchievementCount(userId);
      const tierCount = models.achievement.getUserAchievementCountByTier(userId);

      res.status(200).json({
        ok: true,
        data: {
          achievements: userAchievements,
          totalCount,
          tierCount
        }
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/achievements/init', authenticate, (req, res, next) => {
    try {
      if (req.user.role !== 'admin') {
        res.status(403).json({
          ok: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only admins can initialize achievements'
          }
        });
        return;
      }

      const created = models.achievement.seedDefaultAchievements();

      res.status(201).json({
        ok: true,
        data: {
          message: `Initialized ${created.length} achievements`,
          achievements: created
        }
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createCommunityRouter
};
