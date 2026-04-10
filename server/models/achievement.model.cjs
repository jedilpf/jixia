/**
 * 成就模型
 * 提供成就定义和用户成就解锁功能
 */

const { randomUUID } = require('crypto');

const ACHIEVEMENT_TYPES = ['wins', 'games', 'streak', 'collection', 'story', 'social', 'special'];

const ACHIEVEMENT_TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

class AchievementModel {
  constructor(db) {
    this.db = db;
    this._prepareStatements();
  }

  _prepareStatements() {
    this.stmts = {
      insert: this.db.prepare(`
        INSERT INTO achievements (id, code, name, description, type, tier, requirement, reward, icon, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),
      findById: this.db.prepare('SELECT * FROM achievements WHERE id = ?'),
      findByCode: this.db.prepare('SELECT * FROM achievements WHERE code = ?'),
      findAll: this.db.prepare('SELECT * FROM achievements WHERE is_active = 1 ORDER BY tier, type'),
      findByType: this.db.prepare('SELECT * FROM achievements WHERE type = ? AND is_active = 1'),
      insertUserAchievement: this.db.prepare(`
        INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at)
        VALUES (?, ?, ?, ?)
      `),
      findUserAchievements: this.db.prepare(`
        SELECT a.*, ua.unlocked_at
        FROM user_achievements ua
        JOIN achievements a ON a.id = ua.achievement_id
        WHERE ua.user_id = ?
        ORDER BY ua.unlocked_at DESC
      `),
      hasAchievement: this.db.prepare(`
        SELECT 1 FROM user_achievements
        WHERE user_id = ? AND achievement_id = ?
      `),
      countByUser: this.db.prepare('SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ?'),
      countByTier: this.db.prepare(`
        SELECT a.tier, COUNT(ua.id) as count
        FROM achievements a
        LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = ?
        WHERE a.is_active = 1
        GROUP BY a.tier
      `)
    };
  }

  /**
   * 创建成就定义
   * @param {Object} data - 成就数据
   * @returns {Object} 创建的成就
   */
  create(data) {
    const id = data.id || `ach_${randomUUID().slice(0, 8)}`;
    const {
      code,
      name,
      description,
      type,
      tier = 'bronze',
      requirement,
      reward,
      icon,
      isActive = 1
    } = data;

    this.stmts.insert.run(id, code, name, description, type, tier, JSON.stringify(requirement), JSON.stringify(reward), icon, isActive);
    return this.findById(id);
  }

  /**
   * 根据ID查找成就
   * @param {string} id - 成就ID
   * @returns {Object|null} 成就对象
   */
  findById(id) {
    const row = this.stmts.findById.get(id);
    return row ? this._formatAchievement(row) : null;
  }

  /**
   * 根据code查找成就
   * @param {string} code - 成就code
   * @returns {Object|null} 成就对象
   */
  findByCode(code) {
    const row = this.stmts.findByCode.get(code);
    return row ? this._formatAchievement(row) : null;
  }

  /**
   * 获取所有活跃成就
   * @returns {Array} 成就列表
   */
  findAll() {
    const rows = this.stmts.findAll.all();
    return rows.map(row => this._formatAchievement(row));
  }

  /**
   * 根据类型获取成就
   * @param {string} type - 成就类型
   * @returns {Array} 成就列表
   */
  findByType(type) {
    const rows = this.stmts.findByType.all(type);
    return rows.map(row => this._formatAchievement(row));
  }

  /**
   * 解锁用户成就
   * @param {string} userId - 用户ID
   * @param {string} achievementId - 成就ID
   * @returns {boolean} 是否解锁成功
   */
  unlock(userId, achievementId) {
    const existing = this.stmts.hasAchievement.get(userId, achievementId);
    if (existing) {
      return false;
    }

    const id = `ua_${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    try {
      this.stmts.insertUserAchievement.run(id, userId, achievementId, now);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取用户已解锁成就
   * @param {string} userId - 用户ID
   * @returns {Array} 成就列表
   */
  getUserAchievements(userId) {
    const rows = this.stmts.findUserAchievements.all(userId);
    return rows.map(row => ({
      ...this._formatAchievement(row),
      unlockedAt: row.unlocked_at
    }));
  }

  /**
   * 检查用户是否拥有某个成就
   * @param {string} userId - 用户ID
   * @param {string} achievementId - 成就ID
   * @returns {boolean}
   */
  hasAchievement(userId, achievementId) {
    const row = this.stmts.hasAchievement.get(userId, achievementId);
    return !!row;
  }

  /**
   * 获取用户成就数量
   * @param {string} userId - 用户ID
   * @returns {number}
   */
  getUserAchievementCount(userId) {
    const row = this.stmts.countByUser.get(userId);
    return row ? row.count : 0;
  }

  /**
   * 获取用户各层次成就数量
   * @param {string} userId - 用户ID
   * @returns {Object} { bronze: 0, silver: 0, ... }
   */
  getUserAchievementCountByTier(userId) {
    const rows = this.stmts.countByTier.all(userId);
    const result = {};
    for (const tier of ACHIEVEMENT_TIERS) {
      result[tier] = 0;
    }
    for (const row of rows) {
      result[row.tier] = row.count;
    }
    return result;
  }

  /**
   * 格式化成就数据
   * @param {Object} row - 数据库行
   * @returns {Object} 格式化后的成就对象
   */
  _formatAchievement(row) {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      type: row.type,
      tier: row.tier,
      requirement: row.requirement ? JSON.parse(row.requirement) : null,
      reward: row.reward ? JSON.parse(row.reward) : null,
      icon: row.icon,
      isActive: !!row.is_active
    };
  }

  /**
   * 初始化默认成就（仅创建不存在的）
   * @returns {Array} 创建的成就列表
   */
  seedDefaultAchievements() {
    const defaults = [
      { code: 'first_win', name: '初战告捷', description: '赢得第一场对局', type: 'wins', tier: 'bronze', requirement: { wins: 1 }, reward: { exp: 50 } },
      { code: 'win_10', name: '小有名气', description: '累计获得10场胜利', type: 'wins', tier: 'bronze', requirement: { wins: 10 }, reward: { exp: 200 } },
      { code: 'win_50', name: '辩坛新秀', description: '累计获得50场胜利', type: 'wins', tier: 'silver', requirement: { wins: 50 }, reward: { exp: 500 } },
      { code: 'win_100', name: '名动一时', description: '累计获得100场胜利', type: 'wins', tier: 'gold', requirement: { wins: 100 }, reward: { exp: 1000 } },
      { code: 'win_500', name: '辩才无碍', description: '累计获得500场胜利', type: 'wins', tier: 'platinum', requirement: { wins: 500 }, reward: { exp: 5000 } },
      { code: 'games_10', name: '勤学苦练', description: '完成10场对局', type: 'games', tier: 'bronze', requirement: { games: 10 }, reward: { exp: 100 } },
      { code: 'games_50', name: '渐入佳境', description: '完成50场对局', type: 'games', tier: 'silver', requirement: { games: 50 }, reward: { exp: 300 } },
      { code: 'games_100', name: '熟能生巧', description: '完成100场对局', type: 'games', tier: 'gold', requirement: { games: 100 }, reward: { exp: 800 } },
      { code: 'streak_3', name: '连胜初体验', description: '达到3连胜', type: 'streak', tier: 'bronze', requirement: { streak: 3 }, reward: { exp: 100 } },
      { code: 'streak_5', name: '势如破竹', description: '达到5连胜', type: 'streak', tier: 'silver', requirement: { streak: 5 }, reward: { exp: 300 } },
      { code: 'streak_10', name: '连胜达人', description: '达到10连胜', type: 'streak', tier: 'gold', requirement: { streak: 10 }, reward: { exp: 1000 } },
      { code: 'collection_20', name: '卡牌收集者', description: '收集20张不同卡牌', type: 'collection', tier: 'bronze', requirement: { cards: 20 }, reward: { exp: 200 } },
      { code: 'collection_50', name: '博采众长', description: '收集50张不同卡牌', type: 'collection', tier: 'silver', requirement: { cards: 50 }, reward: { exp: 500 } },
      { code: 'collection_100', name: '博学多才', description: '收集100张不同卡牌', type: 'collection', tier: 'gold', requirement: { cards: 100 }, reward: { exp: 1500 } },
    ];

    const created = [];
    for (const def of defaults) {
      const existing = this.findByCode(def.code);
      if (!existing) {
        const achievement = this.create(def);
        created.push(achievement);
      }
    }
    return created;
  }
}

module.exports = { AchievementModel, ACHIEVEMENT_TYPES, ACHIEVEMENT_TIERS };
