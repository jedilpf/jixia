/**
 * JWT认证中间件
 *
 * 验证请求中的JWT令牌，将用户信息注入req.user
 */

const { verifyAccessToken, extractToken } = require('../utils/jwt.cjs');
const { HttpError } = require('../utils/http-error.cjs');

/**
 * 认证中间件 - 要求请求必须携带有效令牌
 */
function authRequired(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return next(new HttpError(401, '未提供认证令牌', { code: 'NO_TOKEN' }));
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return next(new HttpError(401, '令牌无效或已过期', { code: 'INVALID_TOKEN' }));
  }

  // 将用户信息注入请求对象
  req.user = {
    userId: decoded.userId,
    username: decoded.username,
  };

  next();
}

/**
 * 可选认证中间件 - 如果有令牌则验证，无令牌也放行
 */
function authOptional(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    req.user = null;
    return next();
  }

  const decoded = verifyAccessToken(token);

  if (decoded) {
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
    };
  } else {
    req.user = null;
  }

  next();
}

/**
 * 检查用户是否为资源拥有者
 * @param {string} resourceUserIdParam - 路径参数名，如 'userId'
 */
function requireOwnership(resourceUserIdParam = 'userId') {
  return (req, res, next) => {
    if (!req.user) {
      return next(new HttpError(401, '未认证', { code: 'UNAUTHORIZED' }));
    }

    const resourceUserId = req.params[resourceUserIdParam] || req.body[resourceUserIdParam];

    if (resourceUserId && req.user.userId !== resourceUserId) {
      return next(new HttpError(403, '无权访问该资源', { code: 'FORBIDDEN' }));
    }

    next();
  };
}

module.exports = {
  authRequired,
  authOptional,
  requireOwnership,
};