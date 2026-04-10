/**
 * 牌组模型
 * 提供牌组数据的CRUD操作
 */

const { randomUUID } = require('crypto');

class DeckModel {
  constructor(db) {
    this.db = db;
    this._prepareStatements();
  }

  _prepareStatements() {
    this.stmts = {
      insert: this.db.prepare(`
        INSERT INTO user_decks (id, user_id, name, faction, cards, is_default, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `),
      findById: this.db.prepare('SELECT * FROM user_decks WHERE id = ?'),
      findByUser: this.db.prepare('SELECT * FROM user_decks WHERE user_id = ? ORDER BY created_at DESC'),
      findDefaultByUser: this.db.prepare('SELECT * FROM user_decks WHERE user_id = ? AND is_default = 1'),
      delete: this.db.prepare('DELETE FROM user_decks WHERE id = ?'),
      deleteByUser: this.db.prepare('DELETE FROM user_decks WHERE user_id = ? AND id = ?'),
      clearDefault: this.db.prepare('UPDATE user_decks SET is_default = 0 WHERE user_id = ?')
    };
  }

  /**
   * 创建牌组
   * @param {Object} deckData - 牌组数据
   * @returns {Object} 创建的牌组
   */
  create(deckData) {
    const id = `deck_${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const {
      userId,
      name,
      faction,
      cards,
      isDefault = false
    } = deckData;

    this.stmts.insert.run(
      id,
      userId,
      name,
      faction,
      JSON.stringify(cards),
      isDefault ? 1 : 0,
      now,
      now
    );

    return this.findById(id);
  }

  /**
   * 根据ID查找牌组
   * @param {string} id - 牌组ID
   * @returns {Object|null} 牌组对象
   */
  findById(id) {
    const row = this.stmts.findById.get(id);
    return row ? this._formatDeck(row) : null;
  }

  /**
   * 获取用户的所有牌组
   * @param {string} userId - 用户ID
   * @returns {Array} 牌组列表
   */
  findByUser(userId) {
    const rows = this.stmts.findByUser.all(userId);
    return rows.map(row => this._formatDeck(row));
  }

  /**
   * 获取用户的默认牌组
   * @param {string} userId - 用户ID
   * @returns {Object|null} 默认牌组
   */
  findDefaultByUser(userId) {
    const row = this.stmts.findDefaultByUser.get(userId);
    return row ? this._formatDeck(row) : null;
  }

  /**
   * 更新牌组
   * @param {string} id - 牌组ID
   * @param {Object} updates - 更新数据
   * @returns {Object} 更新后的牌组
   */
  update(id, updates) {
    const allowedFields = ['name', 'faction', 'cards', 'is_default'];
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (allowedFields.includes(dbField)) {
        fields.push(`${dbField} = ?`);
        values.push(dbField === 'cards' ? JSON.stringify(value) : value);
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const sql = `UPDATE user_decks SET ${fields.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);

    return this.findById(id);
  }

  /**
   * 删除牌组
   * @param {string} id - 牌组ID
   * @returns {boolean} 是否成功删除
   */
  delete(id) {
    const result = this.stmts.delete.run(id);
    return result.changes > 0;
  }

  /**
   * 删除用户的指定牌组
   * @param {string} userId - 用户ID
   * @param {string} deckId - 牌组ID
   * @returns {boolean} 是否成功删除
   */
  deleteByUser(userId, deckId) {
    const result = this.stmts.deleteByUser.run(userId, deckId);
    return result.changes > 0;
  }

  /**
   * 设置默认牌组
   * @param {string} userId - 用户ID
   * @param {string} deckId - 牌组ID
   * @returns {Object} 更新后的牌组
   */
  setDefault(userId, deckId) {
    // 先清除该用户的所有默认牌组
    this.stmts.clearDefault.run(userId);

    // 设置指定牌组为默认
    return this.update(deckId, { isDefault: true });
  }

  /**
   * 格式化牌组数据
   * @param {Object} row - 数据库行
   * @returns {Object} 格式化后的牌组对象
   */
  _formatDeck(row) {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      faction: row.faction,
      cards: JSON.parse(row.cards),
      isDefault: row.is_default === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = { DeckModel };
