/**
 * 争鸣史存档模型
 * 提供争鸣史存档的CRUD操作
 */

const { randomUUID } = require('crypto');

class StoryModel {
  constructor(db) {
    this.db = db;
    this._prepareStatements();
  }

  _prepareStatements() {
    this.stmts = {
      insert: this.db.prepare(`
        INSERT INTO story_saves (id, user_id, slot_type, version, current_node_id, chapter, scene, player_stats, player_relationships, player_flags, history, visited_nodes, bridge_state, play_time, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),
      findById: this.db.prepare('SELECT * FROM story_saves WHERE id = ?'),
      findByUserAndSlot: this.db.prepare('SELECT * FROM story_saves WHERE user_id = ? AND slot_type = ?'),
      findByUser: this.db.prepare('SELECT * FROM story_saves WHERE user_id = ? ORDER BY updated_at DESC'),
      update: this.db.prepare(`
        UPDATE story_saves 
        SET version = ?, current_node_id = ?, chapter = ?, scene = ?, player_stats = ?, player_relationships = ?, player_flags = ?, history = ?, visited_nodes = ?, bridge_state = ?, play_time = ?, updated_at = ?
        WHERE id = ?
      `),
      delete: this.db.prepare('DELETE FROM story_saves WHERE id = ?'),
      deleteByUserAndSlot: this.db.prepare('DELETE FROM story_saves WHERE user_id = ? AND slot_type = ?')
    };
  }

  /**
   * 创建存档
   * @param {Object} data - 存档数据
   * @returns {Object} 创建的存档
   */
  create(data) {
    const id = `story_${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const {
      userId,
      slotType,
      version = '1.0',
      currentNodeId,
      chapter = 0,
      scene = 0,
      playerStats = {},
      playerRelationships = {},
      playerFlags = {},
      history = [],
      visitedNodes = [],
      bridgeState = null,
      playTime = 0
    } = data;

    this.stmts.insert.run(
      id,
      userId,
      slotType,
      version,
      currentNodeId,
      chapter,
      scene,
      JSON.stringify(playerStats),
      JSON.stringify(playerRelationships),
      JSON.stringify(playerFlags),
      JSON.stringify(history),
      JSON.stringify(visitedNodes),
      bridgeState ? JSON.stringify(bridgeState) : null,
      playTime,
      now,
      now
    );

    return this.findById(id);
  }

  /**
   * 根据ID查找存档
   * @param {string} id - 存档ID
   * @returns {Object|null} 存档对象
   */
  findById(id) {
    const row = this.stmts.findById.get(id);
    return row ? this._formatStory(row) : null;
  }

  /**
   * 根据用户ID和槽位类型查找存档
   * @param {string} userId - 用户ID
   * @param {string} slotType - 槽位类型
   * @returns {Object|null} 存档对象
   */
  findByUserAndSlot(userId, slotType) {
    const row = this.stmts.findByUserAndSlot.get(userId, slotType);
    return row ? this._formatStory(row) : null;
  }

  /**
   * 获取用户的所有存档
   * @param {string} userId - 用户ID
   * @returns {Array} 存档列表
   */
  findByUser(userId) {
    const rows = this.stmts.findByUser.all(userId);
    return rows.map(row => this._formatStory(row));
  }

  /**
   * 更新存档
   * @param {string} id - 存档ID
   * @param {Object} updates - 更新数据
   * @returns {Object} 更新后的存档
   */
  update(id, updates) {
    const existing = this.findById(id);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();

    const {
      version,
      currentNodeId,
      chapter,
      scene,
      playerStats,
      playerRelationships,
      playerFlags,
      history,
      visitedNodes,
      bridgeState,
      playTime
    } = updates;

    this.stmts.update.run(
      version ?? existing.version,
      currentNodeId ?? existing.currentNodeId,
      chapter ?? existing.chapter,
      scene ?? existing.scene,
      playerStats ? JSON.stringify(playerStats) : existing.playerStatsJson,
      playerRelationships ? JSON.stringify(playerRelationships) : existing.playerRelationshipsJson,
      playerFlags ? JSON.stringify(playerFlags) : existing.playerFlagsJson,
      history ? JSON.stringify(history) : existing.historyJson,
      visitedNodes ? JSON.stringify(visitedNodes) : existing.visitedNodesJson,
      bridgeState ? JSON.stringify(bridgeState) : existing.bridgeStateJson,
      playTime ?? existing.playTime,
      now,
      id
    );

    return this.findById(id);
  }

  /**
   * 保存或更新存档（upsert）
   * @param {string} userId - 用户ID
   * @param {string} slotType - 槽位类型
   * @param {Object} data - 存档数据
   * @returns {Object} 保存的存档
   */
  upsert(userId, slotType, data) {
    const existing = this.findByUserAndSlot(userId, slotType);
    
    if (existing) {
      return this.update(existing.id, data);
    } else {
      return this.create({
        userId,
        slotType,
        ...data
      });
    }
  }

  /**
   * 删除存档
   * @param {string} id - 存档ID
   * @returns {boolean} 是否成功删除
   */
  delete(id) {
    const result = this.stmts.delete.run(id);
    return result.changes > 0;
  }

  /**
   * 删除用户的指定槽位存档
   * @param {string} userId - 用户ID
   * @param {string} slotType - 槽位类型
   * @returns {boolean} 是否成功删除
   */
  deleteByUserAndSlot(userId, slotType) {
    const result = this.stmts.deleteByUserAndSlot.run(userId, slotType);
    return result.changes > 0;
  }

  /**
   * 格式化存档数据
   * @param {Object} row - 数据库行
   * @returns {Object} 格式化后的存档对象
   */
  _formatStory(row) {
    return {
      id: row.id,
      userId: row.user_id,
      slotType: row.slot_type,
      version: row.version,
      currentNodeId: row.current_node_id,
      chapter: row.chapter,
      scene: row.scene,
      playerStats: JSON.parse(row.player_stats || '{}'),
      playerRelationships: JSON.parse(row.player_relationships || '{}'),
      playerFlags: JSON.parse(row.player_flags || '{}'),
      history: JSON.parse(row.history || '[]'),
      visitedNodes: JSON.parse(row.visited_nodes || '[]'),
      bridgeState: row.bridge_state ? JSON.parse(row.bridge_state) : null,
      playTime: row.play_time,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      // 内部使用
      playerStatsJson: row.player_stats,
      playerRelationshipsJson: row.player_relationships,
      playerFlagsJson: row.player_flags,
      historyJson: row.history,
      visitedNodesJson: row.visited_nodes,
      bridgeStateJson: row.bridge_state
    };
  }
}

module.exports = { StoryModel };
