/**
 * JWT 工具模块
 * 提供令牌生成和验证功能
 */

const jwt = require('jsonwebtoken');

// 从环境变量获取密钥，开发环境使用默认值
const JWT_SECRET = process.env.JWT_SECRET || 'jixia-dev-secret-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * 生成 JWT 令牌
 * @param {Object} payload - 令牌载荷
 * @param {string} payload.userId - 用户ID
 * @param {string} payload.username - 用户名
 * @returns {string} JWT 令牌
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 验证 JWT 令牌
 * @param {string} token - JWT 令牌
 * @returns {Object} 解码后的载荷
 * @throws {Error} 令牌无效或过期
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * 解码 JWT 令牌（不验证）
 * @param {string} token - JWT 令牌
 * @returns {Object|null} 解码后的载荷
 */
function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  JWT_SECRET
};
