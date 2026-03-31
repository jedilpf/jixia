const { Server } = require('socket.io');

function roomForMatch(matchId) {
  return `match:${matchId}`;
}

function attachSocketServer(httpServer, { matchStore, origins }) {
  const io = new Server(httpServer, {
    cors: {
      origin: origins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.emit('server:hello', {
      ok: true,
      socketId: socket.id,
      now: new Date().toISOString(),
      stage: 'p1-skeleton',
    });

    socket.on('client:ping', (payload = {}) => {
      socket.emit('server:pong', {
        ...payload,
        now: new Date().toISOString(),
      });
    });

    socket.on('client:subscribe-match', ({ matchId, playerId } = {}) => {
      const match = matchStore.getMatch(matchId);
      if (!match) {
        socket.emit('server:error', {
          code: 'MATCH_NOT_FOUND',
          message: 'Cannot subscribe: match does not exist.',
          matchId: matchId || null,
        });
        return;
      }

      socket.join(roomForMatch(match.id));
      socket.data.matchId = match.id;
      socket.data.playerId = playerId || null;

      socket.emit('server:match-state', {
        match,
      });
    });
  });

  function emitMatchState(matchId) {
    const match = matchStore.getMatch(matchId);
    if (!match) {
      return;
    }
    io.to(roomForMatch(matchId)).emit('server:match-state', { match });
  }

  return {
    io,
    emitMatchState,
  };
}

module.exports = {
  attachSocketServer,
};
