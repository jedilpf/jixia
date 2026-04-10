/**
 * 认证中间件
 * 验证 JWT 令牌并提取用户信息
 */

const { verifyToken } = require('../utils/jwt.cjs');

/**
 * 认证中间件 - 验证用户身份
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - 下一个中间件
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authorization header is required'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      error: 'INVALID_TOKEN_FORMAT',
      message: 'Authorization header must be: Bearer <token>'
    });
  }

  const token = parts[1];

  try {
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      username: decoded.username
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'TOKEN_EXPIRED',
        message: 'Token has expired'
      });
    }
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Invalid token'
    });
  }
}

/**
 * 可选认证中间件 - 如果有令牌则验证，没有则继续
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - 下一个中间件
 */
function optionalAuthenticate(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.user = null;
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    req.user = null;
    return next();
  }

  const token = parts[1];

  try {
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      username: decoded.username
    };
  } catch {
    req.user = null;
  }

  next();
}

module.exports = {
  authenticate,
  optionalAuthenticate
};
