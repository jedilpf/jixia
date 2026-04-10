/**
 * 认证路由
 * 处理用户注册、登录等认证相关接口
 */

const express = require('express');
const { authRateLimiter } = require('../middleware/rate-limit.cjs');

function createAuthRouter({ services }) {
  const router = express.Router();

  /**
   * POST /api/v1/auth/register
   * 用户注册
   */
  router.post('/register', authRateLimiter(), async (req, res, next) => {
    try {
      const { username, password, email, displayName } = req.body;

      // 参数验证
      if (!username || username.trim().length < 3) {
        return res.status(400).json({
          error: 'INVALID_USERNAME',
          message: 'Username must be at least 3 characters'
        });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({
          error: 'INVALID_PASSWORD',
          message: 'Password must be at least 6 characters'
        });
      }

      if (username.trim().length > 20) {
        return res.status(400).json({
          error: 'USERNAME_TOO_LONG',
          message: 'Username must be at most 20 characters'
        });
      }

      const result = await services.user.register({
        username: username.trim(),
        password,
        email: email?.trim() || undefined,
        displayName: displayName?.trim() || undefined
      });

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      if (err.message === 'USERNAME_EXISTS') {
        return res.status(409).json({
          error: 'USERNAME_EXISTS',
          message: 'Username already exists'
        });
      }
      if (err.message === 'EMAIL_EXISTS') {
        return res.status(409).json({
          error: 'EMAIL_EXISTS',
          message: 'Email already exists'
        });
      }
      next(err);
    }
  });

  /**
   * POST /api/v1/auth/login
   * 用户登录
   */
  router.post('/login', authRateLimiter(), async (req, res, next) => {
    try {
      const { username, password } = req.body;

      // 参数验证
      if (!username || !password) {
        return res.status(400).json({
          error: 'MISSING_CREDENTIALS',
          message: 'Username and password are required'
        });
      }

      const result = await services.user.login({ username, password });

      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      if (err.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        });
      }
      next(err);
    }
  });

  return router;
}

module.exports = { createAuthRouter };
