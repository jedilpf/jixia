/**
 * 模型层入口
 * 统一导出所有模型
 */

const { UserModel } = require('./user.model.cjs');
const { CardModel } = require('./card.model.cjs');
const { MatchModel } = require('./match.model.cjs');
const { DeckModel } = require('./deck.model.cjs');
const { StoryModel } = require('./story.model.cjs');
const { ProgressModel } = require('./progress.model.cjs');
const { LeaderboardModel } = require('./leaderboard.model.cjs');
const { AchievementModel } = require('./achievement.model.cjs');

/**
 * 创建所有模型实例
 * @param {sqlite3.Database} db - 数据库实例
 * @returns {Object} 模型集合
 */
function createModels(db) {
  return {
    user: new UserModel(db),
    card: new CardModel(db),
    match: new MatchModel(db),
    deck: new DeckModel(db),
    story: new StoryModel(db),
    progress: new ProgressModel(db),
    leaderboard: new LeaderboardModel(db),
    achievement: new AchievementModel(db)
  };
}

module.exports = {
  createModels,
  UserModel,
  CardModel,
  MatchModel,
  DeckModel,
  StoryModel,
  ProgressModel,
  LeaderboardModel,
  AchievementModel
};
