/**
 * JWT令牌工具
 *
 * 处理访问令牌和刷新令牌的生成与验证
 */

const jwt = require('jsonwebtoken');

// 令牌配置
const ACCESS_TOKEN_EXPIRY = '1h';     // 访问令牌有效期
const REFRESH_TOKEN_EXPIRY = '7d';    // 刷新令牌有效期

// 从环境变量获取密钥，或使用默认值
const JWT_SECRET = process.env.JWT_SECRET || 'jixia-mvp-secret-key-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'jixia-mvp-refresh-secret-2026';

/**
 * 生成访问令牌
 * @param {object} payload - 令牌载荷 (userId, username等)
 * @returns {string} - JWT令牌
 */
function generateAccessToken(payload) {
  return jwt.sign(
    {
      userId: payload.userId,
      username: payload.username,
    },
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'jixia-backend',
    }
  );
}

/**
 * 生成刷新令牌
 * @param {object} payload - 令牌载荷
 * @returns {string} - JWT刷新令牌
 */
function generateRefreshToken(payload) {
  return jwt.sign(
    {
      userId: payload.userId,
      username: payload.username,
      type: 'refresh',
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'jixia-backend',
    }
  );
}

/**
 * 验证访问令牌
 * @param {string} token - JWT令牌
 * @returns {object|null} - 解码后的载荷，或null(验证失败)
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'jixia-backend',
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.log('[jwt] 访问令牌已过期');
    } else if (err.name === 'JsonWebTokenError') {
      console.log('[jwt] 访问令牌无效');
    } else {
      console.error('[jwt] 验证错误:', err);
    }
    return null;
  }
}

/**
 * 验证刷新令牌
 * @param {string} token - JWT刷新令牌
 * @returns {object|null} - 解码后的载荷，或null(验证失败)
 */
function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'jixia-backend',
    });

    if (decoded.type !== 'refresh') {
      return null;
    }

    return decoded;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.log('[jwt] 刷新令牌已过期');
    } else if (err.name === 'JsonWebTokenError') {
      console.log('[jwt] 刷新令牌无效');
    }
    return null;
  }
}

/**
 * 从请求头提取令牌
 * @param {object} req - Express请求对象
 * @returns {string|null} - 令牌字符串
 */
function extractToken(req) {
  // 优先从Authorization头获取
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // 备选：从查询参数获取
  if (req.query && req.query.token) {
    return req.query.token;
  }

  // 备选：从cookie获取
  if (req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }

  return null;
}

/**
 * 获取令牌过期时间
 * @param {string} token - JWT令牌
 * @returns {number|null} - 过期时间戳(秒)，或null
 */
function getTokenExpiry(token) {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      return decoded.exp;
    }
  } catch (err) {
    // ignore
  }
  return null;
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractToken,
  getTokenExpiry,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};