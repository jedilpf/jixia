/**
 * 用户存储模块
 *
 * 管理注册用户的数据，包括：
 * - 用户注册信息
 * - 密码哈希
 * - 刷新令牌
 */

const { randomUUID } = require('crypto');
const { hashPassword, verifyPassword } = require('../utils/password.cjs');

function nowIso() {
  return new Date().toISOString();
}

function buildUserId() {
  return `user_${randomUUID().replace(/-/g, '').slice(0, 18)}`;
}

/**
 * 创建内存用户存储（MVP阶段）
 * 未来可替换为数据库实现
 */
function createInMemoryUserStore() {
  const users = new Map();           // userId -> user profile
  const usernameIndex = new Map();   // username -> userId (唯一索引)
  const refreshTokens = new Map();   // refreshToken -> { userId, expiresAt }

  /**
   * 注册新用户
   * @param {object} input - { username, password, email?, display_name? }
   * @returns {Promise<object>} - 用户信息
   */
  async function registerUser(input) {
    const { username, password, email, display_name } = input;

    // 验证必填字段
    if (!username || typeof username !== 'string') {
      throw new Error('用户名不能为空');
    }
    if (!password || typeof password !== 'string') {
      throw new Error('密码不能为空');
    }

    // 验证用户名格式
    const normalizedUsername = username.trim().toLowerCase();
    if (normalizedUsername.length < 3 || normalizedUsername.length > 32) {
      throw new Error('用户名长度需在3-32位之间');
    }
    if (!/^[\w\u4e00-\u9fa5]+$/.test(normalizedUsername)) {
      throw new Error('用户名只能包含字母、数字、下划线或中文');
    }

    // 检查用户名是否已存在
    if (usernameIndex.has(normalizedUsername)) {
      throw new Error('用户名已被使用');
    }

    // 检查邮箱是否已存在（如果提供）
    if (email) {
      for (const user of users.values()) {
        if (user.email === email.toLowerCase()) {
          throw new Error('邮箱已被使用');
        }
      }
    }

    // 哈希密码
    const passwordHash = await hashPassword(password);

    // 创建用户
    const userId = buildUserId();
    const timestamp = nowIso();
    const user = {
      user_id: userId,
      username: normalizedUsername,
      password_hash: passwordHash,
      email: email ? email.toLowerCase() : null,
      display_name: display_name || normalizedUsername,
      avatar_url: null,
      status: 'active',
      role: 'player',          // 默认角色
      created_at: timestamp,
      updated_at: timestamp,
      last_login_at: null,
      revision: 1,
    };

    users.set(userId, user);
    usernameIndex.set(normalizedUsername, userId);

    // 返回用户信息（不含密码哈希）
    return {
      user_id: userId,
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      status: user.status,
      role: user.role,
      created_at: user.created_at,
    };
  }

  /**
   * 用户登录验证
   * @param {string} username - 用户名
   * @param {string} password - 明文密码
   * @returns {Promise<object|null>} - 用户信息或null
   */
  async function authenticateUser(username, password) {
    const normalizedUsername = username.trim().toLowerCase();
    const userId = usernameIndex.get(normalizedUsername);

    if (!userId) {
      return null;
    }

    const user = users.get(userId);
    if (!user || user.status !== 'active') {
      return null;
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return null;
    }

    // 更新最后登录时间
    user.last_login_at = nowIso();
    user.updated_at = nowIso();
    user.revision += 1;

    return {
      user_id: userId,
      username: user.username,
      display_name: user.display_name,
      role: user.role,
    };
  }

  /**
   * 获取用户信息
   * @param {string} userId - 用户ID
   * @returns {object|null} - 用户信息
   */
  function getUserById(userId) {
    const user = users.get(userId);
    if (!user) return null;

    return {
      user_id: userId,
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      status: user.status,
      role: user.role,
      created_at: user.created_at,
      last_login_at: user.last_login_at,
    };
  }

  /**
   * 根据用户名获取用户
   * @param {string} username - 用户名
   * @returns {object|null}
   */
  function getUserByUsername(username) {
    const normalizedUsername = username.trim().toLowerCase();
    const userId = usernameIndex.get(normalizedUsername);
    if (!userId) return null;
    return getUserById(userId);
  }

  /**
   * 存储刷新令牌
   * @param {string} userId - 用户ID
   * @param {string} refreshToken - 刷新令牌
   * @param {number} expiresAt - 过期时间戳(秒)
   */
  function storeRefreshToken(userId, refreshToken, expiresAt) {
    refreshTokens.set(refreshToken, {
      userId,
      expiresAt,
      createdAt: Date.now(),
    });
  }

  /**
   * 验证刷新令牌
   * @param {string} refreshToken - 刷新令牌
   * @returns {object|null} - { userId } 或 null
   */
  function validateRefreshToken(refreshToken) {
    const record = refreshTokens.get(refreshToken);

    if (!record) return null;

    // 检查是否过期
    if (record.expiresAt < Date.now() / 1000) {
      refreshTokens.delete(refreshToken);
      return null;
    }

    // 检查用户是否仍然有效
    const user = users.get(record.userId);
    if (!user || user.status !== 'active') {
      refreshTokens.delete(refreshToken);
      return null;
    }

    return { userId: record.userId };
  }

  /**
   * 删除刷新令牌（用于登出）
   * @param {string} refreshToken - 刷新令牌
   */
  function revokeRefreshToken(refreshToken) {
    refreshTokens.delete(refreshToken);
  }

  /**
   * 删除用户的所有刷新令牌（用于强制登出所有设备）
   * @param {string} userId - 用户ID
   */
  function revokeAllUserTokens(userId) {
    for (const [token, record] of refreshTokens.entries()) {
      if (record.userId === userId) {
        refreshTokens.delete(token);
      }
    }
  }

  /**
   * 更新用户信息
   * @param {string} userId - 用户ID
   * @param {object} updates - 要更新的字段
   * @returns {object|null} - 更新后的用户信息
   */
  async function updateUser(userId, updates) {
    const user = users.get(userId);
    if (!user) return null;

    // 允许更新的字段
    const allowedFields = ['display_name', 'avatar_url', 'email'];
    const timestamp = nowIso();

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    }

    user.updated_at = timestamp;
    user.revision += 1;

    return getUserById(userId);
  }

  /**
   * 更改密码
   * @param {string} userId - 用户ID
   * @param {string} newPassword - 新密码
   * @returns {boolean} - 是否成功
   */
  async function changePassword(userId, newPassword) {
    const user = users.get(userId);
    if (!user) return false;

    user.password_hash = await hashPassword(newPassword);
    user.updated_at = nowIso();
    user.revision += 1;

    // 强制登出所有设备
    revokeAllUserTokens(userId);

    return true;
  }

  /**
   * 获取存储统计
   */
  function getStats() {
    return {
      userCount: users.size,
      activeUsers: Array.from(users.values()).filter(u => u.status === 'active').length,
      refreshTokenCount: refreshTokens.size,
    };
  }

  return {
    registerUser,
    authenticateUser,
    getUserById,
    getUserByUsername,
    storeRefreshToken,
    validateRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens,
    updateUser,
    changePassword,
    getStats,
  };
}

module.exports = {
  createInMemoryUserStore,
};