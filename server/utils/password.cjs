/**
 * 密码工具模块
 * 提供密码哈希和验证功能
 */

const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

/**
 * 哈希密码
 * @param {string} password - 明文密码
 * @returns {Promise<string>} 密码哈希
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 验证密码
 * @param {string} password - 明文密码
 * @param {string} hash - 密码哈希
 * @returns {Promise<boolean>} 是否匹配
 */
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  hashPassword,
  verifyPassword
};
