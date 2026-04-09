/**
 * 认证路由
 *
 * 处理用户认证相关请求：
 * - 注册
 * - 登录
 * - 令牌刷新
 * - 登出
 */

const express = require('express');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getTokenExpiry,
  REFRESH_TOKEN_EXPIRY,
} = require('../utils/jwt.cjs');
const { validatePasswordStrength } = require('../utils/password.cjs');
const { HttpError } = require('../utils/http-error.cjs');
const { authRequired } = require('../middleware/auth.cjs');

/**
 * 创建认证路由
 * @param {object} userStore - 用户存储实例
 */
function createAuthRouter({ userStore }) {
  const router = express.Router();

  /**
   * POST /api/v1/auth/register
   * 用户注册
   */
  router.post('/register', async (req, res, next) => {
    try {
      const { username, password, email, display_name } = req.body;

      // 验证密码强度
      const passwordCheck = validatePasswordStrength(password);
      if (!passwordCheck.valid) {
        throw new HttpError(400, '密码不符合要求', {
          code: 'INVALID_PASSWORD',
          errors: passwordCheck.errors,
        });
      }

      // 注册用户
      const user = await userStore.registerUser({
        username,
        password,
        email,
        display_name,
      });

      // 生成令牌
      const accessToken = generateAccessToken({
        userId: user.user_id,
        username: user.username,
      });

      const refreshToken = generateRefreshToken({
        userId: user.user_id,
        username: user.username,
      });

      // 存储刷新令牌
      const refreshTokenExpiry = getTokenExpiry(refreshToken);
      if (refreshTokenExpiry) {
        userStore.storeRefreshToken(user.user_id, refreshToken, refreshTokenExpiry);
      }

      res.status(201).json({
        ok: true,
        data: {
          user,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 3600, // 1小时
        },
      });
    } catch (err) {
      if (err.message.includes('已被使用')) {
        next(new HttpError(409, err.message, { code: 'CONFLICT' }));
      } else if (err.message.includes('不能为空') || err.message.includes('长度')) {
        next(new HttpError(400, err.message, { code: 'VALIDATION_ERROR' }));
      } else {
        next(err);
      }
    }
  });

  /**
   * POST /api/v1/auth/login
   * 用户登录
   */
  router.post('/login', async (req, res, next) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        throw new HttpError(400, '用户名和密码不能为空', { code: 'MISSING_FIELDS' });
      }

      // 验证用户
      const user = await userStore.authenticateUser(username, password);

      if (!user) {
        throw new HttpError(401, '用户名或密码错误', { code: 'INVALID_CREDENTIALS' });
      }

      // 生成令牌
      const accessToken = generateAccessToken({
        userId: user.user_id,
        username: user.username,
      });

      const refreshToken = generateRefreshToken({
        userId: user.user_id,
        username: user.username,
      });

      // 存储刷新令牌
      const refreshTokenExpiry = getTokenExpiry(refreshToken);
      if (refreshTokenExpiry) {
        userStore.storeRefreshToken(user.user_id, refreshToken, refreshTokenExpiry);
      }

      res.json({
        ok: true,
        data: {
          user,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 3600,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/v1/auth/refresh
   * 刷新访问令牌
   */
  router.post('/refresh', async (req, res, next) => {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        throw new HttpError(400, '缺少刷新令牌', { code: 'MISSING_TOKEN' });
      }

      // 验证刷新令牌（JWT层面）
      const decoded = verifyRefreshToken(refresh_token);
      if (!decoded) {
        throw new HttpError(401, '刷新令牌无效', { code: 'INVALID_TOKEN' });
      }

      // 验证刷新令牌（存储层面）
      const storedToken = userStore.validateRefreshToken(refresh_token);
      if (!storedToken) {
        throw new HttpError(401, '刷新令牌已过期或被撤销', { code: 'TOKEN_REVOKED' });
      }

      // 获取用户信息
      const user = userStore.getUserById(storedToken.userId);
      if (!user) {
        throw new HttpError(401, '用户不存在', { code: 'USER_NOT_FOUND' });
      }

      // 生成新令牌
      const newAccessToken = generateAccessToken({
        userId: user.user_id,
        username: user.username,
      });

      const newRefreshToken = generateRefreshToken({
        userId: user.user_id,
        username: user.username,
      });

      // 撤销旧刷新令牌，存储新令牌
      userStore.revokeRefreshToken(refresh_token);
      const newExpiry = getTokenExpiry(newRefreshToken);
      if (newExpiry) {
        userStore.storeRefreshToken(user.user_id, newRefreshToken, newExpiry);
      }

      res.json({
        ok: true,
        data: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          expires_in: 3600,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/v1/auth/logout
   * 用户登出
   */
  router.post('/logout', authRequired, (req, res, next) => {
    try {
      const { refresh_token } = req.body;

      // 撤销提供的刷新令牌
      if (refresh_token) {
        userStore.revokeRefreshToken(refresh_token);
      }

      res.json({
        ok: true,
        message: '已登出',
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/v1/auth/logout-all
   * 登出所有设备
   */
  router.post('/logout-all', authRequired, (req, res, next) => {
    try {
      userStore.revokeAllUserTokens(req.user.userId);

      res.json({
        ok: true,
        message: '已登出所有设备',
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = {
  createAuthRouter,
};