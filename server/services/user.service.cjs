/**
 * 用户服务层
 * 处理用户相关的业务逻辑
 */

const { hashPassword, verifyPassword } = require('../utils/password.cjs');
const { generateToken } = require('../utils/jwt.cjs');

class UserService {
  constructor(models) {
    this.models = models;
  }

  /**
   * 用户注册
   * @param {Object} userData - 用户注册数据
   * @returns {Object} 注册结果
   */
  async register(userData) {
    const { username, password, email, displayName } = userData;

    // 检查用户名是否已存在
    if (this.models.user.existsUsername(username)) {
      throw new Error('USERNAME_EXISTS');
    }

    // 检查邮箱是否已存在（如果提供了邮箱）
    if (email && this.models.user.existsEmail(email)) {
      throw new Error('EMAIL_EXISTS');
    }

    // 密码哈希
    const passwordHash = await hashPassword(password);

    // 创建用户
    const user = this.models.user.create({
      username,
      passwordHash,
      email: email || null,
      displayName: displayName || username
    });

    // 生成令牌
    const token = generateToken({ userId: user.id, username: user.username });

    return {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        level: user.level
      },
      token
    };
  }

  /**
   * 用户登录
   * @param {Object} credentials - 登录凭证
   * @returns {Object} 登录结果
   */
  async login(credentials) {
    const { username, password } = credentials;

    // 查找用户（包含密码）
    const user = this.models.user.findByUsernameWithPassword(username);
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // 更新最后登录时间
    this.models.user.updateLastLogin(user.id);

    // 生成令牌
    const token = generateToken({ userId: user.id, username: user.username });

    return {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        level: user.level,
        exp: user.exp,
        opportunity: user.opportunity
      },
      token
    };
  }

  /**
   * 获取用户信息
   * @param {string} userId - 用户ID
   * @returns {Object} 用户信息
   */
  getUserInfo(userId) {
    const user = this.models.user.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      level: user.level,
      exp: user.exp,
      opportunity: user.opportunity,
      status: user.status,
      role: user.role,
      createdAt: user.createdAt
    };
  }

  /**
   * 更新用户信息
   * @param {string} userId - 用户ID
   * @param {Object} updates - 更新数据
   * @returns {Object} 更新后的用户信息
   */
  updateUser(userId, updates) {
    const allowedUpdates = ['displayName', 'avatarUrl', 'email'];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    const user = this.models.user.update(userId, filteredUpdates);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl
    };
  }

  /**
   * 修改密码
   * @param {string} userId - 用户ID
   * @param {string} currentPassword - 当前密码
   * @param {string} newPassword - 新密码
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = this.models.user.findByIdWithPassword(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // 验证当前密码
    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('INVALID_PASSWORD');
    }

    // 更新密码
    const newPasswordHash = await hashPassword(newPassword);
    this.models.user.update(userId, { passwordHash: newPasswordHash });
  }

  /**
   * 获取用户进度
   * @param {string} userId - 用户ID
   * @returns {Object} 用户进度
   */
  getUserProgress(userId) {
    // TODO: 实现从 player_progress 表获取进度
    // 目前返回模拟数据
    const user = this.models.user.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return {
      level: user.level,
      exp: user.exp,
      expToNext: 2000,
      winCount: 0,
      totalGames: 0,
      winRate: 0,
      winStreak: 0,
      maxWinStreak: 0,
      totalDamage: 0,
      collectedCards: 0,
      totalCards: 191,
      opportunity: user.opportunity
    };
  }
}

module.exports = { UserService };
