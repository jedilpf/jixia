/**
 * 匹配服务层
 * 处理玩家匹配逻辑
 * 
 * 匹配规则：
 * - 不同门派玩家进行对战
 * - 同一门派玩家不会匹配在一起
 */

const { randomUUID } = require('crypto');

class MatchmakingService {
  constructor(matchStore) {
    this.matchStore = matchStore;
    this.matchQueue = []; // 全局匹配队列，不再按门派分组
  }

  /**
   * 加入匹配队列
   * @param {string} playerId - 玩家ID
   * @param {string} faction - 门派
   * @param {Object} preferences - 匹配偏好
   * @returns {Object} 匹配结果
   */
  joinQueue(playerId, faction, preferences = {}) {
    // 检查是否已在队列中
    const existingIndex = this.matchQueue.findIndex(p => p.playerId === playerId);
    if (existingIndex !== -1) {
      return { status: 'already_in_queue' };
    }

    // 添加到队列
    this.matchQueue.push({
      playerId,
      faction,
      preferences,
      joinedAt: Date.now()
    });

    // 尝试匹配（寻找不同门派的对手）
    const match = this.tryMatch();

    return {
      status: match ? 'matched' : 'waiting',
      queuePosition: this.matchQueue.length,
      match: match || null
    };
  }

  /**
   * 离开匹配队列
   * @param {string} playerId - 玩家ID
   * @returns {boolean} 是否成功离开
   */
  leaveQueue(playerId) {
    const index = this.matchQueue.findIndex(p => p.playerId === playerId);
    
    if (index === -1) {
      return false;
    }

    this.matchQueue.splice(index, 1);
    return true;
  }

  /**
   * 尝试匹配 - 寻找不同门派的对手
   * @returns {Object|null} 匹配到的对手
   */
  tryMatch() {
    if (this.matchQueue.length < 2) {
      return null;
    }

    // 遍历队列，找到第一对不同门派的玩家
    for (let i = 0; i < this.matchQueue.length; i++) {
      const player1 = this.matchQueue[i];
      
      for (let j = i + 1; j < this.matchQueue.length; j++) {
        const player2 = this.matchQueue[j];
        
        // 检查是否不同门派
        if (player1.faction !== player2.faction) {
          // 从队列中移除这两个玩家
          this.matchQueue.splice(j, 1);
          this.matchQueue.splice(i, 1);

          // 创建对局
          const match = this.matchStore.createMatch({
            id: `match_${randomUUID().slice(0, 8)}`,
            players: {
              human: { id: player1.playerId },
              ai: { id: player2.playerId }
            },
            factions: {
              human: player1.faction,
              ai: player2.faction
            },
            status: 'pending'
          });

          return {
            matchId: match.id,
            player1Id: player1.playerId,
            player2Id: player2.playerId,
            player1Faction: player1.faction,
            player2Faction: player2.faction
          };
        }
      }
    }

    return null;
  }

  /**
   * 获取匹配队列状态
   * @returns {Object} 队列信息
   */
  getQueueStatus() {
    return {
      queueLength: this.matchQueue.length,
      players: this.matchQueue.map(p => ({
        playerId: p.playerId,
        faction: p.faction,
        waitingTime: Date.now() - p.joinedAt
      }))
    };
  }

  /**
   * 获取队列中的玩家数量
   * @returns {number}
   */
  getQueueLength() {
    return this.matchQueue.length;
  }
}

module.exports = { MatchmakingService };
