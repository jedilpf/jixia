/**
 * ProgressModel 单元测试
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const Database = require('better-sqlite3');
const { ProgressModel } = require('../../../server/models/progress.model.cjs');

describe('ProgressModel', () => {
  let db;
  let model;

  before(() => {
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE IF NOT EXISTS player_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        level INTEGER DEFAULT 1,
        exp INTEGER DEFAULT 0,
        win_count INTEGER DEFAULT 0,
        total_games INTEGER DEFAULT 0,
        win_streak INTEGER DEFAULT 0,
        max_win_streak INTEGER DEFAULT 0,
        total_damage INTEGER DEFAULT 0,
        collected_cards INTEGER DEFAULT 0,
        opportunity INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);
    model = new ProgressModel(db);
  });

  after(() => {
    if (db) db.close();
  });

  describe('create()', () => {
    it('should create a new progress record', () => {
      const progress = model.create({ userId: 'user_test1' });
      assert.ok(progress);
      assert.strictEqual(progress.userId, 'user_test1');
      assert.strictEqual(progress.level, 1);
      assert.strictEqual(progress.winCount, 0);
    });
  });

  describe('findByUser()', () => {
    it('should find existing progress', () => {
      const progress = model.findByUser('user_test1');
      assert.ok(progress);
      assert.strictEqual(progress.userId, 'user_test1');
    });

    it('should return null for non-existent user', () => {
      const progress = model.findByUser('user_nonexistent');
      assert.strictEqual(progress, null);
    });
  });

  describe('getOrCreate()', () => {
    it('should return existing progress', () => {
      const progress = model.getOrCreate('user_test1');
      assert.ok(progress);
      assert.strictEqual(progress.userId, 'user_test1');
    });

    it('should create new progress for non-existent user', () => {
      const progress = model.getOrCreate('user_new');
      assert.ok(progress);
      assert.strictEqual(progress.userId, 'user_new');
    });
  });

  describe('update()', () => {
    it('should update progress fields', () => {
      const updated = model.update('user_test1', { level: 5, exp: 1000 });
      assert.ok(updated);
      assert.strictEqual(updated.level, 5);
      assert.strictEqual(updated.exp, 1000);
    });
  });

  describe('addWin()', () => {
    it('should increment win count and streak', () => {
      const before = model.findByUser('user_test1');
      const beforeWins = before.winCount;
      const beforeStreak = before.winStreak;

      const updated = model.addWin('user_test1', 50);
      assert.strictEqual(updated.winCount, beforeWins + 1);
      assert.strictEqual(updated.winStreak, beforeStreak + 1);
      assert.ok(updated.exp >= 50);
    });
  });

  describe('addLoss()', () => {
    it('should increment games and reset streak', () => {
      const before = model.findByUser('user_test1');
      const beforeGames = before.totalGames;
      const beforeStreak = before.winStreak;

      const updated = model.addLoss('user_test1', 10);
      assert.strictEqual(updated.totalGames, beforeGames + 1);
      assert.strictEqual(updated.winStreak, 0);
    });
  });

  describe('delete()', () => {
    it('should delete progress', () => {
      const deleted = model.delete('user_test1');
      assert.strictEqual(deleted, true);

      const progress = model.findByUser('user_test1');
      assert.strictEqual(progress, null);
    });
  });
});
