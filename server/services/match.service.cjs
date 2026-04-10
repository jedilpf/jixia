/**
 * 对局服务层
 * 处理对局相关的业务逻辑
 * 
 * Socket.IO 接口预留说明：
 * - 本服务层设计时预留了 Socket 接口，以便 Phase 4 集成实时通信
 * - 关键方法接受可选的 socket/io 参数，用于广播状态更新
 * - 业务逻辑与通信逻辑分离，保持代码清晰
 */

class MatchService {
  constructor(models, matchStore) {
    this.models = models;
    this.matchStore = matchStore;
  }

  /**
   * 创建对局
   * @param {Object} params - 创建参数
   * @param {Socket} [socket] - Socket实例（Phase 4注入，可选）
   * @returns {Object} 对局对象
   */
  createMatch(params, socket = null) {
    const { player1Id, player1Faction, player2Faction } = params;

    // 创建对局记录
    const match = this.models.match.create({
      player1Id,
      player1Faction,
      player2Faction,
      status: 'pending'
    });

    // 同时在内存存储中创建（用于实时对战状态）
    const matchState = this.matchStore.createMatch(match.id, {
      player1Id,
      player1Faction,
      player2Faction,
      status: 'pending'
    });

    // Phase 4: 如果提供了 socket，加入房间
    if (socket) {
      socket.join(`match:${match.id}`);
      // 广播对局创建事件
      this._broadcastMatchState(match.id, { event: 'match:created', match }, socket);
    }

    return {
      matchId: match.id,
      status: match.status,
      player1Id: match.player1Id,
      player1Faction: match.player1Faction,
      player2Faction: match.player2Faction,
      createdAt: match.createdAt
    };
  }

  /**
   * 玩家加入对局
   * @param {string} matchId - 对局ID
   * @param {string} playerId - 玩家ID
   * @param {Socket} [socket] - Socket实例（Phase 4注入，可选）
   * @returns {Object} 更新后的对局
   */
  joinMatch(matchId, playerId, socket = null) {
    // 获取对局
    const match = this.models.match.findById(matchId);
    if (!match) {
      throw new Error('MATCH_NOT_FOUND');
    }

    // 检查对局状态
    if (match.status !== 'pending') {
      throw new Error('MATCH_ALREADY_STARTED');
    }

    // 更新对局
    const updatedMatch = this.models.match.update(matchId, {
      player2Id: playerId,
      status: 'playing'
    });

    // 更新内存存储
    this.matchStore.updateMatch(matchId, {
      player2Id: playerId,
      status: 'playing'
    });

    // Phase 4: 广播玩家加入事件
    if (socket) {
      socket.join(`match:${matchId}`);
      this._broadcastMatchState(matchId, {
        event: 'match:player-joined',
        playerId,
        status: 'playing'
      }, socket);
    }

    return {
      matchId: updatedMatch.id,
      status: updatedMatch.status,
      player1Id: updatedMatch.player1Id,
      player2Id: updatedMatch.player2Id,
      player1Faction: updatedMatch.player1Faction,
      player2Faction: updatedMatch.player2Faction
    };
  }

  /**
   * 获取对局状态
   * @param {string} matchId - 对局ID
   * @returns {Object} 对局状态
   */
  getMatchState(matchId) {
    // 优先从内存存储获取（实时状态）
    const memoryState = this.matchStore.getMatch(matchId);
    if (memoryState) {
      return memoryState;
    }

    // 从数据库获取
    const match = this.models.match.findById(matchId);
    if (!match) {
      throw new Error('MATCH_NOT_FOUND');
    }

    return {
      matchId: match.id,
      status: match.status,
      player1Id: match.player1Id,
      player2Id: match.player2Id,
      player1Faction: match.player1Faction,
      player2Faction: match.player2Faction,
      winnerId: match.winnerId,
      rounds: match.rounds,
      createdAt: match.createdAt
    };
  }

  /**
   * 玩家提交出牌
   * @param {string} matchId - 对局ID
   * @param {string} playerId - 玩家ID
   * @param {Array} cards - 出牌数据
   * @param {Socket} [socket] - Socket实例（Phase 4注入，可选）
   * @returns {Object} 提交结果
   */
  submitCards(matchId, playerId, cards, socket = null) {
    // 验证对局存在
    const match = this.matchStore.getMatch(matchId);
    if (!match) {
      throw new Error('MATCH_NOT_FOUND');
    }

    // 验证玩家在对局中
    const isPlayer1 = match.player1Id === playerId;
    const isPlayer2 = match.player2Id === playerId;
    if (!isPlayer1 && !isPlayer2) {
      throw new Error('NOT_IN_MATCH');
    }

    // 验证对局状态
    if (match.status !== 'playing') {
      throw new Error('MATCH_NOT_PLAYING');
    }

    // 存储出牌（在内存中）
    const submissionKey = isPlayer1 ? 'player1Submission' : 'player2Submission';
    this.matchStore.updateMatch(matchId, {
      [submissionKey]: {
        playerId,
        cards,
        submittedAt: new Date().toISOString()
      }
    });

    // 记录日志
    this.models.match.addLog({
      matchId,
      round: match.round || 1,
      phase: 'submit',
      playerId,
      action: 'submit-cards',
      data: { cardCount: cards.length }
    });

    // Phase 4: 广播出牌提交事件
    if (socket) {
      this._broadcastToOpponent(matchId, playerId, {
        event: 'match:opponent-submitted',
        playerId,
        submitted: true
      }, socket);
    }

    return {
      matchId,
      playerId,
      submitted: true,
      waitingForOpponent: !this._bothPlayersSubmitted(matchId)
    };
  }

  /**
   * 结算回合
   * @param {string} matchId - 对局ID
   * @param {Object} resolution - 结算数据
   * @param {SocketServer} [io] - Socket.IO服务器（Phase 4注入，可选）
   * @returns {Object} 结算结果
   */
  resolveRound(matchId, resolution, io = null) {
    const { roundResult, finalMomentum } = resolution;

    // 获取对局
    const match = this.matchStore.getMatch(matchId);
    if (!match) {
      throw new Error('MATCH_NOT_FOUND');
    }

    // 更新回合数
    const currentRound = (match.round || 0) + 1;
    this.matchStore.updateMatch(matchId, {
      round: currentRound,
      player1Submission: null,
      player2Submission: null,
      lastRoundResult: roundResult
    });

    // 记录日志
    this.models.match.addLog({
      matchId,
      round: currentRound,
      phase: 'resolve',
      playerId: 'system',
      action: 'resolve-round',
      data: roundResult
    });

    // Phase 4: 广播回合结算结果
    if (io) {
      this._broadcastToRoom(matchId, {
        event: 'match:round-resolved',
        round: currentRound,
        result: roundResult
      }, io);
    }

    return {
      matchId,
      round: currentRound,
      result: roundResult
    };
  }

  /**
   * 完成对局
   * @param {string} matchId - 对局ID
   * @param {string} winnerId - 获胜者ID
   * @param {Object} finalMomentum - 最终大势
   * @param {SocketServer} [io] - Socket.IO服务器（Phase 4注入，可选）
   * @returns {Object} 完成结果
   */
  finishMatch(matchId, winnerId, finalMomentum, io = null) {
    // 更新数据库
    const match = this.models.match.finish(matchId, winnerId, finalMomentum);

    // 更新内存存储
    this.matchStore.updateMatch(matchId, {
      status: 'finished',
      winnerId,
      finalMomentum
    });

    // Phase 4: 广播对局结束事件
    if (io) {
      this._broadcastToRoom(matchId, {
        event: 'match:finished',
        winnerId,
        finalMomentum
      }, io);
    }

    return {
      matchId,
      status: 'finished',
      winnerId,
      finalMomentum,
      finishedAt: match.finishedAt
    };
  }

  /**
   * 获取对局历史
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Object} 对局列表
   */
  getMatchHistory(userId, options = {}) {
    const { status, page = 1, limit = 20 } = options;

    const matches = this.models.match.findByUser(userId, {
      status,
      limit: parseInt(limit, 10),
      offset: (page - 1) * limit
    });

    return {
      matches: matches.map(match => ({
        matchId: match.id,
        status: match.status,
        player1Id: match.player1Id,
        player2Id: match.player2Id,
        player1Faction: match.player1Faction,
        player2Faction: match.player2Faction,
        winnerId: match.winnerId,
        rounds: match.rounds,
        createdAt: match.createdAt,
        finishedAt: match.finishedAt
      })),
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
      }
    };
  }

  /**
   * 获取对局日志
   * @param {string} matchId - 对局ID
   * @returns {Array} 日志列表
   */
  getMatchLogs(matchId) {
    const logs = this.models.match.getLogs(matchId);
    return logs;
  }

  // ==================== Socket 辅助方法（Phase 4 实现）====================

  /**
   * 广播对局状态更新
   * @private
   * @param {string} matchId - 对局ID
   * @param {Object} data - 广播数据
   * @param {Socket} socket - Socket实例
   */
  _broadcastMatchState(matchId, data, socket) {
    // Phase 4 实现: socket.to(`match:${matchId}`).emit(data.event, data)
    // 目前仅记录日志
    console.log(`[MatchService] Broadcast to match:${matchId}`, data.event);
  }

  /**
   * 广播给对手
   * @private
   * @param {string} matchId - 对局ID
   * @param {string} playerId - 当前玩家ID
   * @param {Object} data - 广播数据
   * @param {Socket} socket - Socket实例
   */
  _broadcastToOpponent(matchId, playerId, data, socket) {
    // Phase 4 实现: socket.to(`match:${matchId}`).emit(data.event, data)
    // 目前仅记录日志
    console.log(`[MatchService] Broadcast to opponent in match:${matchId}`, data.event);
  }

  /**
   * 广播给房间所有玩家
   * @private
   * @param {string} matchId - 对局ID
   * @param {Object} data - 广播数据
   * @param {SocketServer} io - Socket.IO服务器
   */
  _broadcastToRoom(matchId, data, io) {
    // Phase 4 实现: io.to(`match:${matchId}`).emit(data.event, data)
    // 目前仅记录日志
    console.log(`[MatchService] Broadcast to room match:${matchId}`, data.event);
  }

  // ==================== 私有辅助方法 ====================

  /**
   * 检查双方是否都已提交
   * @private
   * @param {string} matchId - 对局ID
   * @returns {boolean} 是否都已提交
   */
  _bothPlayersSubmitted(matchId) {
    const match = this.matchStore.getMatch(matchId);
    if (!match) return false;
    return !!(match.player1Submission && match.player2Submission);
  }
}

module.exports = { MatchService };
