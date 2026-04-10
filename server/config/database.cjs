/**
 * 数据库配置模块
 * 使用 better-sqlite3 作为数据库
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DEFAULT_DATABASE_PATH = path.join(process.cwd(), 'data', 'jixia.db');
const MIGRATIONS_PATH = path.join(__dirname, '..', 'migrations', 'init.sql');

/**
 * 创建数据库连接
 * @param {string} dbPath - 数据库文件路径
 * @returns {Database} 数据库实例
 */
function createDatabase(dbPath = DEFAULT_DATABASE_PATH) {
  // 确保数据目录存在
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(dbPath);
  console.log('[database] Connected to SQLite database');

  // 启用外键约束
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  return db;
}

/**
 * 执行初始化脚本
 * @param {Database} db - 数据库实例
 */
function initializeDatabase(db) {
  if (!fs.existsSync(MIGRATIONS_PATH)) {
    throw new Error(`Migration file not found: ${MIGRATIONS_PATH}`);
  }

  const sql = fs.readFileSync(MIGRATIONS_PATH, 'utf-8');
  
  try {
    db.exec(sql);
    console.log('[database] Initialized successfully');
  } catch (err) {
    console.error('[database] Failed to initialize:', err.message);
    throw err;
  }
}

/**
 * 获取数据库状态
 * @param {Database} db - 数据库实例
 * @returns {Object} 数据库状态信息
 */
function getDatabaseStatus(db) {
  const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1").get();
  return {
    connected: true,
    path: db.name,
    hasTables: !!result
  };
}

/**
 * 关闭数据库连接
 * @param {Database} db - 数据库实例
 */
function closeDatabase(db) {
  db.close();
  console.log('[database] Connection closed');
}

module.exports = {
  createDatabase,
  initializeDatabase,
  getDatabaseStatus,
  closeDatabase,
  DEFAULT_DATABASE_PATH
};
