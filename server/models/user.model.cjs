/**
 * 用户模型
 * 提供用户数据的CRUD操作
 */

const { randomUUID } = require('crypto');

class UserModel {
  constructor(db) {
    this.db = db;
    this._prepareStatements();
  }

  _prepareStatements() {
    // 预编译常用SQL语句
    this.stmts = {
      insert: this.db.prepare(`
        INSERT INTO users (id, username, password_hash, email, display_name, avatar_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `),
      findById: this.db.prepare('SELECT * FROM users WHERE id = ?'),
      findByUsername: this.db.prepare('SELECT * FROM users WHERE username = ?'),
      findByEmail: this.db.prepare('SELECT * FROM users WHERE email = ?'),
      updateLastLogin: this.db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?'),
      delete: this.db.prepare('DELETE FROM users WHERE id = ?'),
      existsUsername: this.db.prepare('SELECT 1 FROM users WHERE username = ?'),
      existsEmail: this.db.prepare('SELECT 1 FROM users WHERE email = ?')
    };
  }

  /**
   * 创建用户
   * @param {Object} userData - 用户数据
   * @returns {Object} 创建的用户
   */
  create(userData) {
    const id = `user_${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    
    const {
      username,
      passwordHash,
      email = null,
      displayName = username,
      avatarUrl = null
    } = userData;

    this.stmts.insert.run(id, username, passwordHash, email, displayName, avatarUrl, now, now);

    return {
      id,
      username,
      email,
      displayName,
      avatarUrl,
      status: 'active',
      role: 'player',
      level: 1,
      exp: 0,
      opportunity: 0,
      createdAt: now
    };
  }

  /**
   * 根据ID查找用户
   * @param {string} id - 用户ID
   * @returns {Object|null} 用户对象
   */
  findById(id) {
    const row = this.stmts.findById.get(id);
    return row ? this._formatUser(row) : null;
  }

  /**
   * 根据用户名查找用户
   * @param {string} username - 用户名
   * @returns {Object|null} 用户对象
   */
  findByUsername(username) {
    const row = this.stmts.findByUsername.get(username);
    return row ? this._formatUser(row) : null;
  }

  /**
   * 根据用户名查找用户（包含密码，用于登录验证）
   * @param {string} username - 用户名
   * @returns {Object|null} 用户对象（包含 passwordHash）
   */
  findByUsernameWithPassword(username) {
    const row = this.stmts.findByUsername.get(username);
    return row ? this._formatUserWithPassword(row) : null;
  }

  /**
   * 根据ID查找用户（包含密码）
   * @param {string} id - 用户ID
   * @returns {Object|null} 用户对象（包含 passwordHash）
   */
  findByIdWithPassword(id) {
    const row = this.stmts.findById.get(id);
    return row ? this._formatUserWithPassword(row) : null;
  }

  /**
   * 根据邮箱查找用户
   * @param {string} email - 邮箱
   * @returns {Object|null} 用户对象
   */
  findByEmail(email) {
    const row = this.stmts.findByEmail.get(email);
    return row ? this._formatUser(row) : null;
  }

  /**
   * 更新用户信息
   * @param {string} id - 用户ID
   * @param {Object} updates - 更新数据
   * @returns {Object} 更新后的用户
   */
  update(id, updates) {
    const allowedFields = ['display_name', 'avatar_url', 'email', 'status', 'level', 'exp', 'opportunity'];
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

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);

    return this.findById(id);
  }

  /**
   * 更新最后登录时间
   * @param {string} id - 用户ID
   */
  updateLastLogin(id) {
    const now = new Date().toISOString();
    this.stmts.updateLastLogin.run(now, id);
  }

  /**
   * 删除用户
   * @param {string} id - 用户ID
   * @returns {boolean} 是否成功删除
   */
  delete(id) {
    const result = this.stmts.delete.run(id);
    return result.changes > 0;
  }

  /**
   * 检查用户名是否已存在
   * @param {string} username - 用户名
   * @returns {boolean} 是否存在
   */
  existsUsername(username) {
    const result = this.stmts.existsUsername.get(username);
    return !!result;
  }

  /**
   * 检查邮箱是否已存在
   * @param {string} email - 邮箱
   * @returns {boolean} 是否存在
   */
  existsEmail(email) {
    const result = this.stmts.existsEmail.get(email);
    return !!result;
  }

  /**
   * 格式化用户数据（将数据库字段转换为驼峰命名）
   * @param {Object} row - 数据库行
   * @returns {Object} 格式化后的用户对象
   */
  _formatUser(row) {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      status: row.status,
      role: row.role,
      level: row.level,
      exp: row.exp,
      opportunity: row.opportunity,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at
    };
  }

  /**
   * 格式化用户数据（包含密码）
   * @param {Object} row - 数据库行
   * @returns {Object} 格式化后的用户对象（包含 passwordHash）
   */
  _formatUserWithPassword(row) {
    return {
      ...this._formatUser(row),
      passwordHash: row.password_hash
    };
  }
}

module.exports = { UserModel };
