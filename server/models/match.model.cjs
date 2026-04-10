/**
 * 对局模型
 * 提供对局数据的CRUD操作
 */

const { randomUUID } = require('crypto');

class MatchModel {
  constructor(db) {
    this.db = db;
    this._prepareStatements();
  }

  _prepareStatements() {
    // 预编译常用SQL语句
    this.stmts = {
      insert: this.db.prepare(`
        INSERT INTO matches (id, player1_id, player2_id, player1_faction, player2_faction, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `),
      findById: this.db.prepare('SELECT * FROM matches WHERE id = ?'),
      findByUser: this.db.prepare(`
        SELECT * FROM matches 
        WHERE (player1_id = ? OR player2_id = ?) 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `),
      findByUserAndStatus: this.db.prepare(`
        SELECT * FROM matches 
        WHERE (player1_id = ? OR player2_id = ?) AND status = ?
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `),
      delete: this.db.prepare('DELETE FROM matches WHERE id = ?'),
      insertLog: this.db.prepare(`
        INSERT INTO match_logs (id, match_id, round, phase, player_id, action, data, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `),
      getLogs: this.db.prepare('SELECT * FROM match_logs WHERE match_id = ? ORDER BY round, created_at')
    };
  }

  /**
   * 创建对局
   * @param {Object} matchData - 对局数据
   * @returns {Object} 创建的对局
   */
  create(matchData) {
    const id = `match_${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const {
      player1Id,
      player2Id = null,
      player1Faction,
      player2Faction,
      status = 'pending'
    } = matchData;

    this.stmts.insert.run(id, player1Id, player2Id, player1Faction, player2Faction, status, now);
    return this.findById(id);
  }

  /**
   * 根据ID查找对局
   * @param {string} id - 对局ID
   * @returns {Object|null} 对局对象
   */
  findById(id) {
    const row = this.stmts.findById.get(id);
    return row ? this._formatMatch(row) : null;
  }

  /**
   * 获取用户的对局列表
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Array} 对局列表
   */
  findByUser(userId, options = {}) {
    const { status, limit = 50, offset = 0 } = options;

    let rows;
    if (status) {
      rows = this.stmts.findByUserAndStatus.all(userId, userId, status, limit, offset);
    } else {
      rows = this.stmts.findByUser.all(userId, userId, limit, offset);
    }

    return rows.map(row => this._formatMatch(row));
  }

  /**
   * 更新对局
   * @param {string} id - 对局ID
   * @param {Object} updates - 更新数据
   * @returns {Object} 更新后的对局
   */
  update(id, updates) {
    const allowedFields = ['player2_id', 'winner_id', 'status', 'rounds', 'final_momentum'];
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (allowedFields.includes(dbField)) {
        fields.push(`${dbField} = ?`);
        values.push(typeof value === 'object' ? JSON.stringify(value) : value);
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const sql = `UPDATE matches SET ${fields.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);

    return this.findById(id);
  }

  /**
   * 完成对局
   * @param {string} id - 对局ID
   * @param {string} winnerId - 获胜者ID
   * @param {Object} finalMomentum - 最终大势
   * @returns {Object} 更新后的对局
   */
  finish(id, winnerId, finalMomentum) {
    const now = new Date().toISOString();
    const sql = `
      UPDATE matches 
      SET winner_id = ?, status = 'finished', final_momentum = ?, finished_at = ?
      WHERE id = ?
    `;

    this.db.prepare(sql).run(winnerId, JSON.stringify(finalMomentum), now, id);
    return this.findById(id);
  }

  /**
   * 删除对局
   * @param {string} id - 对局ID
   * @returns {boolean} 是否成功删除
   */
  delete(id) {
    const result = this.stmts.delete.run(id);
    return result.changes > 0;
  }

  /**
   * 添加对局日志
   * @param {Object} logData - 日志数据
   * @returns {Object} 创建的日志
   */
  addLog(logData) {
    const id = `log_${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const {
      matchId,
      round,
      phase,
      playerId,
      action,
      data = null
    } = logData;

    this.stmts.insertLog.run(id, matchId, round, phase, playerId, action, data ? JSON.stringify(data) : null, now);
    return { id, matchId, round, phase, playerId, action, data, createdAt: now };
  }

  /**
   * 获取对局日志
   * @param {string} matchId - 对局ID
   * @returns {Array} 日志列表
   */
  getLogs(matchId) {
    const rows = this.stmts.getLogs.all(matchId);
    return rows.map(row => ({
      id: row.id,
      matchId: row.match_id,
      round: row.round,
      phase: row.phase,
      playerId: row.player_id,
      action: row.action,
      data: row.data ? JSON.parse(row.data) : null,
      createdAt: row.created_at
    }));
  }

  /**
   * 格式化对局数据
   * @param {Object} row - 数据库行
   * @returns {Object} 格式化后的对局对象
   */
  _formatMatch(row) {
    return {
      id: row.id,
      player1Id: row.player1_id,
      player2Id: row.player2_id,
      player1Faction: row.player1_faction,
      player2Faction: row.player2_faction,
      winnerId: row.winner_id,
      status: row.status,
      rounds: row.rounds,
      finalMomentum: row.final_momentum ? JSON.parse(row.final_momentum) : null,
      createdAt: row.created_at,
      finishedAt: row.finished_at
    };
  }
}

module.exports = { MatchModel };
