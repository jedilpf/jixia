/**
 * LeaderboardModel 单元测试
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const Database = require('better-sqlite3');
const { LeaderboardModel } = require('../../../server/models/leaderboard.model.cjs');

describe('LeaderboardModel', () => {
  let db;
  let model;

  before(() => {
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        display_name TEXT,
        avatar_url TEXT,
        status TEXT DEFAULT 'active',
        level INTEGER DEFAULT 1,
        exp INTEGER DEFAULT 0
      );

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

    const insertUser = db.prepare('INSERT INTO users (id, username, display_name, status, level) VALUES (?, ?, ?, ?, ?)');
    const insertProgress = db.prepare('INSERT INTO player_progress (id, user_id, win_count, total_games, win_streak, max_win_streak, level, exp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

    insertUser.run('user_1', 'player1', '玩家一', 'active', 5);
    insertUser.run('user_2', 'player2', '玩家二', 'active', 3);
    insertUser.run('user_3', 'player3', '玩家三', 'active', 7);

    insertProgress.run('prog_1', 'user_1', 50, 60, 5, 10, 5, 5000);
    insertProgress.run('prog_2', 'user_2', 30, 40, 3, 8, 3, 3000);
    insertProgress.run('prog_3', 'user_3', 100, 120, 15, 20, 7, 10000);

    model = new LeaderboardModel(db);
  });

  after(() => {
    if (db) db.close();
  });

  describe('getByWinCount()', () => {
    it('should return entries ordered by win count', () => {
      const entries = model.getByWinCount(10, 0);
      assert.ok(Array.isArray(entries));
      assert.strictEqual(entries.length, 3);
      assert.strictEqual(entries[0].userId, 'user_3');
      assert.strictEqual(entries[0].winCount, 100);
      assert.strictEqual(entries[0].rank, 1);
    });

    it('should respect limit and offset', () => {
      const entries = model.getByWinCount(2, 0);
      assert.strictEqual(entries.length, 2);
    });
  });

  describe('getByWinRate()', () => {
    it('should return entries ordered by win rate', () => {
      const entries = model.getByWinRate(10, 10, 0);
      assert.ok(Array.isArray(entries));
      assert.ok(entries[0].winRate !== undefined);
    });
  });

  describe('getByLevel()', () => {
    it('should return entries ordered by level', () => {
      const entries = model.getByLevel(10, 0);
      assert.ok(Array.isArray(entries));
      assert.strictEqual(entries[0].level, 7);
    });
  });

  describe('getByWinStreak()', () => {
    it('should return entries ordered by max win streak', () => {
      const entries = model.getByWinStreak(10, 0);
      assert.ok(Array.isArray(entries));
      assert.strictEqual(entries[0].maxWinStreak, 20);
    });
  });

  describe('getUserRank()', () => {
    it('should return correct rank for user', () => {
      const rank = model.getUserRank('user_3');
      assert.strictEqual(rank, 1);
    });

    it('should return rank for user not in progress table', () => {
      const rank = model.getUserRank('user_nonexistent');
      assert.strictEqual(typeof rank, 'number');
    });
  });

  describe('getTotalPlayers()', () => {
    it('should return total active players', () => {
      const total = model.getTotalPlayers();
      assert.strictEqual(total, 3);
    });
  });
});
