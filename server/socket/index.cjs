/**
 * Socket.IO 服务器
 * 处理实时对战通信
 * 
 * PRD 定义的事件：
 * - match:submit    玩家提交出牌
 * - match:resolve   回合结算
 * - match:state     对局状态更新
 * - matchmaking:*    匹配相关事件
 * 
 * 认证：
 * - 客户端必须先通过 auth:authenticate 认证
 * - 所有 match 操作都需要验证身份
 */

const { Server } = require('socket.io');
const { REQUIRE_PLAYER_ID } = require('../constants.cjs');
const { verifyToken } = require('../utils/jwt.cjs');

function roomForMatch(matchId) {
  return `match:${matchId}`;
}

function attachSocketServer(httpServer, { matchStore, services, origins }) {
  const io = new Server(httpServer, {
    cors: {
      origin: origins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    // 初始化认证状态
    socket.data.authenticated = false;
    socket.data.user = null;
    next();
  });

  io.on('connection', (socket) => {
    // 基础连接
    socket.emit('server:hello', {
      ok: true,
      socketId: socket.id,
      now: new Date().toISOString(),
      stage: 'p2-backend',
      authenticated: socket.data.authenticated
    });

    socket.on('client:ping', (payload = {}) => {
      socket.emit('server:pong', {
        ...payload,
        now: new Date().toISOString(),
      });
    });

    // ==================== 认证事件 ====================

    /**
     * auth:authenticate - 认证身份
     * 客户端发送: { token }
     * 服务器验证 JWT 并存储用户信息
     */
    socket.on('auth:authenticate', ({ token } = {}) => {
      if (!token) {
        socket.emit('auth:result', {
          success: false,
          error: 'TOKEN_REQUIRED',
          message: 'Token is required'
        });
        return;
      }

      try {
        const decoded = verifyToken(token);
        socket.data.authenticated = true;
        socket.data.user = {
          userId: decoded.userId,
          username: decoded.username
        };
        socket.emit('auth:result', {
          success: true,
          user: socket.data.user
        });
      } catch (err) {
        socket.data.authenticated = false;
        socket.data.user = null;
        socket.emit('auth:result', {
          success: false,
          error: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
          message: err.message
        });
      }
    });

    // ==================== 匹配事件 ====================

    /**
     * 验证是否已认证
     */
    function requireAuth() {
      if (!socket.data.authenticated || !socket.data.user) {
        socket.emit('server:error', {
          code: 'NOT_AUTHENTICATED',
          message: 'You must authenticate first'
        });
        return false;
      }
      return true;
    }

    /**
     * matchmaking:start - 开始匹配
     * 客户端发送: { faction, preferences }
     * 使用认证后的用户ID
     */
    socket.on('matchmaking:start', ({ faction, preferences = {} } = {}) => {
      if (!requireAuth()) {
        return;
      }

      if (!faction) {
        socket.emit('server:error', {
          code: 'INVALID_MATCHMAKING_REQUEST',
          message: 'faction is required'
        });
        return;
      }

      const playerId = socket.data.user.userId;

      // 加入匹配队列
      const result = services.matchmaking.joinQueue(playerId, faction, preferences);
      
      if (result.status === 'matched') {
        // 匹配成功，创建对局
        const match = services.match.createMatch({
          player1Id: result.player1Id,
          player1Faction: result.player1Faction,
          player2Faction: result.player2Faction
        }, socket);

        // 广播给两个玩家
        io.to(roomForMatch(match.matchId)).emit('matchmaking:found', {
          matchId: match.matchId,
          player1Id: result.player1Id,
          player2Id: result.player2Id
        });

        socket.emit('matchmaking:waiting', { status: 'matched', matchId: match.matchId });
      } else {
        // 等待中
        socket.emit('matchmaking:waiting', {
          status: 'waiting',
          queuePosition: result.queuePosition
        });
      }
    });

    /**
     * matchmaking:cancel - 取消匹配
     * 客户端发送: { }
     * 使用认证后的用户ID
     */
    socket.on('matchmaking:cancel', () => {
      if (!requireAuth()) {
        return;
      }

      const playerId = socket.data.user.userId;
      const success = services.matchmaking.leaveQueue(playerId);
      socket.emit('matchmaking:cancelled', {
        success,
        playerId
      });
    });

    // ==================== 对战事件 ====================

    /**
     * match:subscribe - 订阅对局
     * 客户端发送: { matchId }
     * 验证玩家是否在对局中
     */
    socket.on('match:subscribe', ({ matchId } = {}) => {
      if (!requireAuth()) {
        return;
      }

      const match = matchStore.getMatch(matchId);
      if (!match) {
        socket.emit('server:error', {
          code: 'MATCH_NOT_FOUND',
          message: 'Match does not exist',
          matchId: matchId || null,
        });
        return;
      }

      const playerId = socket.data.user.userId;

      // 验证玩家是否在对局中
      const participantIds = [
        match.players?.human?.id,
        match.players?.ai?.id,
      ].filter(Boolean);

      if (participantIds.length > 0 && !participantIds.includes(playerId)) {
        socket.emit('server:error', {
          code: 'PLAYER_ID_INVALID',
          message: 'You are not a participant of this match',
          matchId: match.id,
        });
        return;
      }

      // 加入房间
      socket.join(roomForMatch(match.id));
      socket.data.matchId = match.id;
      socket.data.playerId = playerId;

      // 发送当前对局状态
      socket.emit('match:state', {
        match,
        playerId: playerId
      });
    });

    /**
     * match:submit - 玩家提交出牌
     * 客户端发送: { matchId, cards }
     * 使用认证后的用户ID
     */
    socket.on('match:submit', ({ matchId, cards } = {}) => {
      if (!requireAuth()) {
        return;
      }

      if (!matchId || !cards) {
        socket.emit('server:error', {
          code: 'INVALID_SUBMIT',
          message: 'matchId and cards are required'
        });
        return;
      }

      const playerId = socket.data.user.userId;

      try {
        const result = services.match.submitCards(matchId, playerId, cards, socket);
        
        // 广播提交状态给对手
        socket.to(roomForMatch(matchId)).emit('match:opponent-submitted', {
          playerId,
          submitted: true
        });

        // 如果双方都已提交，触发结算
        if (!result.waitingForOpponent) {
          // 通知双方准备结算
          io.to(roomForMatch(matchId)).emit('match:both-submitted', {
            matchId,
            round: matchStore.getMatch(matchId)?.round || 1
          });
        }

        socket.emit('match:submit-ack', {
          matchId,
          playerId,
          success: true
        });
      } catch (err) {
        socket.emit('server:error', {
          code: err.message || 'SUBMIT_FAILED',
          message: err.message
        });
      }
    });

    /**
     * match:resolve - 回合结算
     * 由服务器在双方提交后自动触发
     * 客户端发送: { matchId }
     */
    socket.on('match:resolve', ({ matchId } = {}) => {
      if (!requireAuth()) {
        return;
      }

      if (!matchId) {
        socket.emit('server:error', {
          code: 'INVALID_RESOLVE',
          message: 'matchId is required'
        });
        return;
      }

      const match = matchStore.getMatch(matchId);
      if (!match) {
        socket.emit('server:error', {
          code: 'MATCH_NOT_FOUND',
          message: 'Match does not exist'
        });
        return;
      }

      // 检查双方是否都已提交
      if (!match.player1Submission || !match.player2Submission) {
        socket.emit('server:error', {
          code: 'NOT_ALL_SUBMITTED',
          message: 'Both players must submit before resolving'
        });
        return;
      }

      // 执行结算（简化版：计算大势差值）
      const roundResult = resolveRound(match);

      // 更新对局状态
      services.match.resolveRound(matchId, { roundResult }, io);

      // 广播结算结果给双方
      io.to(roomForMatch(matchId)).emit('match:resolved', {
        matchId,
        round: roundResult
      });

      // 检查是否结束
      if (roundResult.winner || roundResult.gameOver) {
        const winnerId = roundResult.winner || (roundResult.player1Wins ? match.players.human.id : match.players.ai.id);
        services.match.finishMatch(matchId, winnerId, roundResult.finalMomentum, io);
        
        io.to(roomForMatch(matchId)).emit('match:finished', {
          matchId,
          winnerId,
          finalMomentum: roundResult.finalMomentum
        });
      }
    });

    /**
     * match:leave - 离开对局
     * 客户端发送: { matchId }
     */
    socket.on('match:leave', ({ matchId } = {}) => {
      if (matchId) {
        socket.leave(roomForMatch(matchId));
      }
      
      socket.emit('match:left', {
        matchId,
        playerId: socket.data.user?.userId,
        success: true
      });
    });

    // ==================== 断开连接 ====================

    socket.on('disconnect', () => {
      // 如果玩家在匹配队列中，移除
      if (socket.data.authenticated && socket.data.user) {
        const playerId = socket.data.user.userId;
        services.matchmaking.leaveQueue(playerId);
      }
    });
  });

  /**
   * 回合结算逻辑（简化版）
   */
  function resolveRound(match) {
    const p1Cards = match.player1Submission?.cards || [];
    const p2Cards = match.player2Submission?.cards || [];

    // 简化计算：比较卡牌数量和攻击值
    const p1Power = p1Cards.reduce((sum, card) => sum + (card.attack || 0), 0);
    const p2Power = p2Cards.reduce((sum, card) => sum + (card.attack || 0), 0);

    const momentumDiff = p1Power - p2Power;
    const player1Wins = momentumDiff > 0;
    const player2Wins = momentumDiff < 0;

    return {
      player1Cards: p1Cards.length,
      player2Cards: p2Cards.length,
      player1Power: p1Power,
      player2Power: p2Power,
      momentumDiff,
      player1Wins,
      player2Wins,
      winner: player1Wins ? match.players?.human?.id : player2Wins ? match.players?.ai?.id : null,
      gameOver: false,
      finalMomentum: {
        player1: momentumDiff,
        player2: -momentumDiff
      }
    };
  }

  /**
   * 发送对局状态
   */
  function emitMatchState(matchId) {
    const match = matchStore.getMatch(matchId);
    if (!match) {
      return;
    }
    io.to(roomForMatch(matchId)).emit('match:state', { match });
  }

  return {
    io,
    emitMatchState,
  };
}

module.exports = {
  attachSocketServer,
};
