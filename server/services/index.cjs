/**
 * 服务层入口
 * 统一导出所有服务
 */

const { UserService } = require('./user.service.cjs');
const { CardService } = require('./card.service.cjs');
const { MatchService } = require('./match.service.cjs');
const { MatchmakingService } = require('./matchmaking.service.cjs');

/**
 * 创建所有服务实例
 * @param {Object} models - 模型层实例
 * @param {Object} stores - 存储层实例
 * @returns {Object} 服务集合
 */
function createServices(models, stores) {
  const { matchStore } = stores;

  return {
    user: new UserService(models),
    card: new CardService(models),
    match: new MatchService(models, matchStore),
    matchmaking: new MatchmakingService(matchStore)
  };
}

module.exports = {
  createServices,
  UserService,
  CardService,
  MatchService,
  MatchmakingService
};
