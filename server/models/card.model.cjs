/**
 * 卡牌模型
 * 提供卡牌数据的CRUD操作
 */

class CardModel {
  constructor(db) {
    this.db = db;
    this._prepareStatements();
  }

  _prepareStatements() {
    // 预编译常用SQL语句
    this.stmts = {
      findById: this.db.prepare('SELECT * FROM cards WHERE id = ?'),
      findAll: this.db.prepare('SELECT * FROM cards ORDER BY faction, tier, cost'),
      insert: this.db.prepare(`
        INSERT INTO cards (id, name, faction, type, rarity, tier, cost, attack, hp, shield, skill, background, unlock_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),
      delete: this.db.prepare('DELETE FROM cards WHERE id = ?')
    };
  }

  /**
   * 获取所有卡牌
   * @param {Object} filters - 筛选条件
   * @returns {Array} 卡牌列表
   */
  findAll(filters = {}) {
    const { faction, type, rarity, tier, isActive = true } = filters;
    
    // 无筛选时使用预编译语句
    if (!faction && !type && !rarity && !tier && isActive === true) {
      const rows = this.stmts.findAll.all();
      return rows.map(row => this._formatCard(row));
    }

    // 动态构建筛选查询
    const conditions = [];
    const values = [];

    if (faction) {
      conditions.push('faction = ?');
      values.push(faction);
    }
    if (type) {
      conditions.push('type = ?');
      values.push(type);
    }
    if (rarity) {
      conditions.push('rarity = ?');
      values.push(rarity);
    }
    if (tier) {
      conditions.push('tier = ?');
      values.push(tier);
    }
    if (isActive !== undefined) {
      conditions.push('is_active = ?');
      values.push(isActive ? 1 : 0);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM cards ${whereClause} ORDER BY faction, tier, cost`;

    const rows = this.db.prepare(sql).all(...values);
    return rows.map(row => this._formatCard(row));
  }

  /**
   * 根据ID查找卡牌
   * @param {string} id - 卡牌ID
   * @returns {Object|null} 卡牌对象
   */
  findById(id) {
    const row = this.stmts.findById.get(id);
    return row ? this._formatCard(row) : null;
  }

  /**
   * 创建卡牌
   * @param {Object} cardData - 卡牌数据
   * @returns {Object} 创建的卡牌
   */
  create(cardData) {
    const {
      id,
      name,
      faction,
      type,
      rarity,
      tier,
      cost,
      attack = null,
      hp = null,
      shield = null,
      skill,
      background = null,
      unlockLevel = 1
    } = cardData;

    this.stmts.insert.run(id, name, faction, type, rarity, tier, cost, attack, hp, shield, skill, background, unlockLevel);
    return this.findById(id);
  }

  /**
   * 更新卡牌
   * @param {string} id - 卡牌ID
   * @param {Object} updates - 更新数据
   * @returns {Object} 更新后的卡牌
   */
  update(id, updates) {
    const allowedFields = ['name', 'faction', 'type', 'rarity', 'tier', 'cost', 'attack', 'hp', 'shield', 'skill', 'background', 'unlock_level', 'is_active'];
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (allowedFields.includes(dbField)) {
        fields.push(`${dbField} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const sql = `UPDATE cards SET ${fields.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);

    return this.findById(id);
  }

  /**
   * 删除卡牌
   * @param {string} id - 卡牌ID
   * @returns {boolean} 是否成功删除
   */
  delete(id) {
    const result = this.stmts.delete.run(id);
    return result.changes > 0;
  }

  /**
   * 格式化卡牌数据
   * @param {Object} row - 数据库行
   * @returns {Object} 格式化后的卡牌对象
   */
  _formatCard(row) {
    return {
      id: row.id,
      name: row.name,
      faction: row.faction,
      type: row.type,
      rarity: row.rarity,
      tier: row.tier,
      cost: row.cost,
      attack: row.attack,
      hp: row.hp,
      shield: row.shield,
      skill: row.skill,
      background: row.background,
      unlockLevel: row.unlock_level,
      isActive: row.is_active === 1
    };
  }
}

module.exports = { CardModel };
