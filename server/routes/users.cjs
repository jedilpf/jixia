/**
 * 用户管理路由
 * 处理用户信息查询、修改等接口
 */

const express = require('express');
const { authenticate } = require('../middleware/auth.cjs');

function createUsersRouter({ services }) {
  const router = express.Router();

  /**
   * GET /api/v1/users/me
   * 获取当前用户信息
   */
  router.get('/me', authenticate, (req, res, next) => {
    try {
      const userInfo = services.user.getUserInfo(req.user.userId);
      res.json({
        success: true,
        data: userInfo
      });
    } catch (err) {
      if (err.message === 'USER_NOT_FOUND') {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }
      next(err);
    }
  });

  /**
   * PATCH /api/v1/users/me
   * 更新当前用户信息
   */
  router.patch('/me', authenticate, (req, res, next) => {
    try {
      const { displayName, avatarUrl, email } = req.body;
      const updates = {};
      
      if (displayName !== undefined) updates.displayName = displayName.trim();
      if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
      if (email !== undefined) updates.email = email?.trim() || null;

      const userInfo = services.user.updateUser(req.user.userId, updates);
      res.json({
        success: true,
        data: userInfo
      });
    } catch (err) {
      if (err.message === 'USER_NOT_FOUND') {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }
      next(err);
    }
  });

  /**
   * POST /api/v1/users/me/password
   * 修改密码
   */
  router.post('/me/password', authenticate, async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: 'MISSING_PASSWORDS',
          message: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: 'INVALID_PASSWORD',
          message: 'New password must be at least 6 characters'
        });
      }

      await services.user.changePassword(req.user.userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (err) {
      if (err.message === 'USER_NOT_FOUND') {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }
      if (err.message === 'INVALID_PASSWORD') {
        return res.status(401).json({
          error: 'INVALID_PASSWORD',
          message: 'Current password is incorrect'
        });
      }
      next(err);
    }
  });

  /**
   * GET /api/v1/users/me/progress
   * 获取用户进度
   */
  router.get('/me/progress', authenticate, (req, res, next) => {
    try {
      const progress = services.user.getUserProgress(req.user.userId);
      res.json({
        success: true,
        data: progress
      });
    } catch (err) {
      if (err.message === 'USER_NOT_FOUND') {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }
      next(err);
    }
  });

  return router;
}

module.exports = { createUsersRouter };
