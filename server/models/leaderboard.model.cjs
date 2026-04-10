/**
 * 排行榜模型
 * 提供玩家排行榜查询功能
 */

class LeaderboardModel {
  constructor(db) {
    this.db = db;
    this._prepareStatements();
  }

  _prepareStatements() {
    this.stmts = {
      getByWinCount: this.db.prepare(`
        SELECT
          u.id as user_id,
          u.username,
          u.display_name,
          u.avatar_url,
          u.level,
          p.win_count,
          p.total_games,
          p.win_streak,
          p.max_win_streak,
          p.exp,
          p.total_damage
        FROM player_progress p
        JOIN users u ON u.id = p.user_id
        WHERE u.status = 'active'
        ORDER BY p.win_count DESC, p.total_games ASC
        LIMIT ?
        OFFSET ?
      `),
      getByWinRate: this.db.prepare(`
        SELECT
          u.id as user_id,
          u.username,
          u.display_name,
          u.avatar_url,
          u.level,
          p.win_count,
          p.total_games,
          p.win_streak,
          p.max_win_streak,
          CAST(p.win_count AS REAL) / CAST(p.total_games AS REAL) as win_rate,
          p.exp
        FROM player_progress p
        JOIN users u ON u.id = p.user_id
        WHERE u.status = 'active' AND p.total_games >= ?
        ORDER BY win_rate DESC, p.total_games ASC
        LIMIT ?
        OFFSET ?
      `),
      getByLevel: this.db.prepare(`
        SELECT
          u.id as user_id,
          u.username,
          u.display_name,
          u.avatar_url,
          u.level,
          p.exp,
          p.win_count,
          p.total_games
        FROM player_progress p
        JOIN users u ON u.id = p.user_id
        WHERE u.status = 'active'
        ORDER BY u.level DESC, p.exp DESC
        LIMIT ?
        OFFSET ?
      `),
      getByWinStreak: this.db.prepare(`
        SELECT
          u.id as user_id,
          u.username,
          u.display_name,
          u.avatar_url,
          u.level,
          p.win_streak,
          p.max_win_streak,
          p.win_count
        FROM player_progress p
        JOIN users u ON u.id = p.user_id
        WHERE u.status = 'active'
        ORDER BY p.max_win_streak DESC, p.win_count DESC
        LIMIT ?
        OFFSET ?
      `),
      getUserRankByWinCount: this.db.prepare(`
        SELECT COUNT(*) + 1 as rank
        FROM player_progress p
        JOIN users u ON u.id = p.user_id
        WHERE u.status = 'active' AND p.win_count > (
          SELECT COALESCE(p2.win_count, 0)
          FROM player_progress p2
          WHERE p2.user_id = ?
        )
      `),
      getTotalPlayers: this.db.prepare(`
        SELECT COUNT(*) as total
        FROM users
        WHERE status = 'active'
      `)
    };
  }

  /**
   * 获取胜利次数排行榜
   * @param {number} limit - 每页数量
   * @param {number} offset - 偏移量
   * @returns {Array} 排行榜列表
   */
  getByWinCount(limit = 20, offset = 0) {
    const rows = this.stmts.getByWinCount.all(limit, offset);
    return rows.map((row, index) => this._formatEntry(row, offset + index + 1));
  }

  /**
   * 获取胜率排行榜（至少10场对局）
   * @param {number} minGames - 最少对局数
   * @param {number} limit - 每页数量
   * @param {number} offset - 偏移量
   * @returns {Array} 排行榜列表
   */
  getByWinRate(minGames = 10, limit = 20, offset = 0) {
    const rows = this.stmts.getByWinRate.all(minGames, limit, offset);
    return rows.map((row, index) => this._formatEntry(row, offset + index + 1, 'win_rate'));
  }

  /**
   * 获取等级排行榜
   * @param {number} limit - 每页数量
   * @param {number} offset - 偏移量
   * @returns {Array} 排行榜列表
   */
  getByLevel(limit = 20, offset = 0) {
    const rows = this.stmts.getByLevel.all(limit, offset);
    return rows.map((row, index) => this._formatEntry(row, offset + index + 1));
  }

  /**
   * 获取最高连胜排行榜
   * @param {number} limit - 每页数量
   * @param {number} offset - 偏移量
   * @returns {Array} 排行榜列表
   */
  getByWinStreak(limit = 20, offset = 0) {
    const rows = this.stmts.getByWinStreak.all(limit, offset);
    return rows.map((row, index) => this._formatEntry(row, offset + index + 1));
  }

  /**
   * 获取用户排名
   * @param {string} userId - 用户ID
   * @returns {number} 排名
   */
  getUserRank(userId) {
    const row = this.stmts.getUserRankByWinCount.get(userId);
    return row ? row.rank : null;
  }

  /**
   * 获取总玩家数
   * @returns {number} 总数
   */
  getTotalPlayers() {
    const row = this.stmts.getTotalPlayers.get();
    return row ? row.total : 0;
  }

  /**
   * 格式化排行榜条目
   * @param {Object} row - 数据库行
   * @param {number} rank - 排名
   * @param {string} sortType - 排序类型
   * @returns {Object} 格式化后的条目
   */
  _formatEntry(row, rank, sortType = 'wins') {
    const entry = {
      rank,
      userId: row.user_id,
      username: row.username,
      displayName: row.display_name || row.username,
      avatarUrl: row.avatar_url,
      level: row.level,
      winCount: row.win_count,
      totalGames: row.total_games,
      winStreak: row.win_streak,
      maxWinStreak: row.max_win_streak
    };

    if (sortType === 'win_rate') {
      entry.winRate = row.win_rate ? parseFloat(row.win_rate.toFixed(4)) : 0;
    }

    if (row.exp !== undefined) {
      entry.exp = row.exp;
    }

    if (row.total_damage !== undefined) {
      entry.totalDamage = row.total_damage;
    }

    return entry;
  }
}

module.exports = { LeaderboardModel };
