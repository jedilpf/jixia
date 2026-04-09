/**
 * 密码哈希工具
 *
 * 使用bcrypt进行密码加密和验证
 */

const bcrypt = require('bcrypt');

// bcrypt cost factor (越高越安全但越慢)
const SALT_ROUNDS = 12;

/**
 * 对密码进行哈希
 * @param {string} password - 明文密码
 * @returns {Promise<string>} - 哈希后的密码
 */
async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('密码不能为空');
  }

  if (password.length < 6) {
    throw new Error('密码长度至少6位');
  }

  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 验证密码
 * @param {string} password - 明文密码
 * @param {string} hash - 哈希后的密码
 * @returns {Promise<boolean>} - 是否匹配
 */
async function verifyPassword(password, hash) {
  if (!password || !hash) {
    return false;
  }

  try {
    return bcrypt.compare(password, hash);
  } catch (err) {
    console.error('[password] 验证失败:', err);
    return false;
  }
}

/**
 * 验证密码强度
 * @param {string} password - 明文密码
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validatePasswordStrength(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    errors.push('密码不能为空');
    return { valid: false, errors };
  }

  if (password.length < 6) {
    errors.push('密码长度至少6位');
  }

  if (password.length > 128) {
    errors.push('密码长度不能超过128位');
  }

  // 可选：更强的密码规则
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('密码需包含大写字母');
  // }
  // if (!/[0-9]/.test(password)) {
  //   errors.push('密码需包含数字');
  // }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
};