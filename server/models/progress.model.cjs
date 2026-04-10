/**
 * 玩家进度模型
 * 提供玩家进度的CRUD操作
 */

const { randomUUID } = require('crypto');

class ProgressModel {
  constructor(db) {
    this.db = db;
    this._prepareStatements();
  }

  _prepareStatements() {
    this.stmts = {
      insert: this.db.prepare(`
        INSERT INTO player_progress (id, user_id, level, exp, win_count, total_games, win_streak, max_win_streak, total_damage, collected_cards, opportunity, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),
      findById: this.db.prepare('SELECT * FROM player_progress WHERE id = ?'),
      findByUser: this.db.prepare('SELECT * FROM player_progress WHERE user_id = ?'),
      update: this.db.prepare(`
        UPDATE player_progress 
        SET level = ?, exp = ?, win_count = ?, total_games = ?, win_streak = ?, max_win_streak = ?, total_damage = ?, collected_cards = ?, opportunity = ?, updated_at = ?
        WHERE user_id = ?
      `),
      delete: this.db.prepare('DELETE FROM player_progress WHERE user_id = ?')
    };
  }

  /**
   * 创建进度记录
   * @param {Object} data - 进度数据
   * @returns {Object} 创建的进度
   */
  create(data) {
    const id = `prog_${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const {
      userId,
      level = 1,
      exp = 0,
      winCount = 0,
      totalGames = 0,
      winStreak = 0,
      maxWinStreak = 0,
      totalDamage = 0,
      collectedCards = 0,
      opportunity = 0
    } = data;

    this.stmts.insert.run(
      id,
      userId,
      level,
      exp,
      winCount,
      totalGames,
      winStreak,
      maxWinStreak,
      totalDamage,
      collectedCards,
      opportunity,
      now,
      now
    );

    return this.findById(id);
  }

  /**
   * 根据ID查找进度
   * @param {string} id - 进度ID
   * @returns {Object|null} 进度对象
   */
  findById(id) {
    const row = this.stmts.findById.get(id);
    return row ? this._formatProgress(row) : null;
  }

  /**
   * 根据用户ID查找进度
   * @param {string} userId - 用户ID
   * @returns {Object|null} 进度对象
   */
  findByUser(userId) {
    const row = this.stmts.findByUser.get(userId);
    return row ? this._formatProgress(row) : null;
  }

  /**
   * 获取或创建进度
   * @param {string} userId - 用户ID
   * @returns {Object} 进度对象
   */
  getOrCreate(userId) {
    let progress = this.findByUser(userId);
    if (!progress) {
      progress = this.create({ userId });
    }
    return progress;
  }

  /**
   * 更新进度
   * @param {string} userId - 用户ID
   * @param {Object} updates - 更新数据
   * @returns {Object} 更新后的进度
   */
  update(userId, updates) {
    const existing = this.findByUser(userId);
    if (!existing) {
      return this.create({ userId, ...updates });
    }

    const now = new Date().toISOString();

    const {
      level,
      exp,
      winCount,
      totalGames,
      winStreak,
      maxWinStreak,
      totalDamage,
      collectedCards,
      opportunity
    } = updates;

    this.stmts.update.run(
      level ?? existing.level,
      exp ?? existing.exp,
      winCount ?? existing.winCount,
      totalGames ?? existing.totalGames,
      winStreak ?? existing.winStreak,
      maxWinStreak ?? existing.maxWinStreak,
      totalDamage ?? existing.totalDamage,
      collectedCards ?? existing.collectedCards,
      opportunity ?? existing.opportunity,
      now,
      userId
    );

    return this.findByUser(userId);
  }

  /**
   * 批量更新进度（部分更新）
   * @param {string} userId - 用户ID
   * @param {Object} updates - 更新数据
   * @returns {Object} 更新后的进度
   */
  patch(userId, updates) {
    return this.update(userId, updates);
  }

  /**
   * 增加胜利次数
   * @param {string} userId - 用户ID
   * @param {number} expGain - 获得经验
   * @returns {Object} 更新后的进度
   */
  addWin(userId, expGain = 0) {
    const existing = this.findByUser(userId);
    if (!existing) {
      return this.create({ userId, winCount: 1, totalGames: 1, exp: expGain });
    }

    const newWinCount = existing.winCount + 1;
    const newTotalGames = existing.totalGames + 1;
    const newWinStreak = existing.winStreak + 1;
    const newMaxWinStreak = Math.max(existing.maxWinStreak, newWinStreak);
    const newExp = existing.exp + expGain;

    return this.update(userId, {
      winCount: newWinCount,
      totalGames: newTotalGames,
      winStreak: newWinStreak,
      maxWinStreak: newMaxWinStreak,
      exp: newExp
    });
  }

  /**
   * 增加失败次数
   * @param {string} userId - 用户ID
   * @param {number} expGain - 获得经验
   * @returns {Object} 更新后的进度
   */
  addLoss(userId, expGain = 0) {
    const existing = this.findByUser(userId);
    if (!existing) {
      return this.create({ userId, totalGames: 1, exp: expGain });
    }

    return this.update(userId, {
      totalGames: existing.totalGames + 1,
      winStreak: 0,
      exp: existing.exp + expGain
    });
  }

  /**
   * 删除进度
   * @param {string} userId - 用户ID
   * @returns {boolean} 是否成功删除
   */
  delete(userId) {
    const result = this.stmts.delete.run(userId);
    return result.changes > 0;
  }

  /**
   * 格式化进度数据
   * @param {Object} row - 数据库行
   * @returns {Object} 格式化后的进度对象
   */
  _formatProgress(row) {
    return {
      id: row.id,
      userId: row.user_id,
      level: row.level,
      exp: row.exp,
      winCount: row.win_count,
      totalGames: row.total_games,
      winStreak: row.win_streak,
      maxWinStreak: row.max_win_streak,
      totalDamage: row.total_damage,
      collectedCards: row.collected_cards,
      opportunity: row.opportunity,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = { ProgressModel };
