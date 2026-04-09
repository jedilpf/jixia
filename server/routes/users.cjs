/**
 * 用户路由
 *
 * 处理用户信息相关请求：
 * - 获取当前用户信息
 * - 更新用户信息
 * - 更改密码
 */

const express = require('express');
const { validatePasswordStrength } = require('../utils/password.cjs');
const { HttpError } = require('../utils/http-error.cjs');
const { authRequired } = require('../middleware/auth.cjs');

/**
 * 创建用户路由
 * @param {object} userStore - 用户存储实例
 */
function createUsersRouter({ userStore }) {
  const router = express.Router();

  // 所有路由都需要认证
  router.use(authRequired);

  /**
   * GET /api/v1/users/me
   * 获取当前用户信息
   */
  router.get('/me', (req, res, next) => {
    try {
      const user = userStore.getUserById(req.user.userId);

      if (!user) {
        throw new HttpError(404, '用户不存在', { code: 'USER_NOT_FOUND' });
      }

      res.json({
        ok: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * PUT /api/v1/users/me
   * 更新用户信息
   */
  router.put('/me', async (req, res, next) => {
    try {
      const { display_name, avatar_url, email } = req.body;

      // 验证输入
      if (display_name !== undefined) {
        if (typeof display_name !== 'string' || display_name.length > 32) {
          throw new HttpError(400, '显示名称长度不能超过32位', { code: 'VALIDATION_ERROR' });
        }
      }

      if (email !== undefined) {
        if (typeof email !== 'string' || !email.includes('@')) {
          throw new HttpError(400, '邮箱格式无效', { code: 'VALIDATION_ERROR' });
        }
      }

      const updatedUser = await userStore.updateUser(req.user.userId, {
        display_name,
        avatar_url,
        email,
      });

      if (!updatedUser) {
        throw new HttpError(404, '用户不存在', { code: 'USER_NOT_FOUND' });
      }

      res.json({
        ok: true,
        data: updatedUser,
      });
    } catch (err) {
      if (err.message.includes('已被使用')) {
        next(new HttpError(409, err.message, { code: 'CONFLICT' }));
      } else {
        next(err);
      }
    }
  });

  /**
   * PUT /api/v1/users/me/password
   * 更改密码
   */
  router.put('/me/password', async (req, res, next) => {
    try {
      const { current_password, new_password } = req.body;

      if (!current_password || !new_password) {
        throw new HttpError(400, '当前密码和新密码不能为空', { code: 'MISSING_FIELDS' });
      }

      // 验证新密码强度
      const passwordCheck = validatePasswordStrength(new_password);
      if (!passwordCheck.valid) {
        throw new HttpError(400, '新密码不符合要求', {
          code: 'INVALID_PASSWORD',
          errors: passwordCheck.errors,
        });
      }

      // 验证当前密码
      const user = await userStore.authenticateUser(req.user.username, current_password);
      if (!user) {
        throw new HttpError(401, '当前密码错误', { code: 'INVALID_PASSWORD' });
      }

      // 更改密码
      const success = await userStore.changePassword(req.user.userId, new_password);
      if (!success) {
        throw new HttpError(500, '密码更改失败', { code: 'INTERNAL_ERROR' });
      }

      res.json({
        ok: true,
        message: '密码已更改，请重新登录',
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/v1/users/:userId
   * 获取指定用户公开信息（需要认证）
   */
  router.get('/:userId', (req, res, next) => {
    try {
      const user = userStore.getUserById(req.params.userId);

      if (!user) {
        throw new HttpError(404, '用户不存在', { code: 'USER_NOT_FOUND' });
      }

      // 只返回公开信息
      res.json({
        ok: true,
        data: {
          user_id: user.user_id,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = {
  createUsersRouter,
};