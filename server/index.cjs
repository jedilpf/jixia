const http = require('http');
const { DEFAULT_DATA_DIR, DEFAULT_HOST, DEFAULT_PORT } = require('./constants.cjs');
const { createInMemoryMatchStore } = require('./store/match-store.cjs');
const { createStorySaveStore } = require('./store/story-save-store.cjs');
const { createPlayerProgressStore } = require('./store/player-progress-store.cjs');
const { createApp } = require('./app.cjs');
const { attachSocketServer } = require('./socket/index.cjs');

function startServer() {
  const port = DEFAULT_PORT;
  const matchStore = createInMemoryMatchStore();
  const storySaveStore = createStorySaveStore({ dataDir: DEFAULT_DATA_DIR });
  const progressStore = createPlayerProgressStore({ dataDir: DEFAULT_DATA_DIR });
  const { app, origins } = createApp({ matchStore, storySaveStore, progressStore });
  const httpServer = http.createServer(app);
  const socket = attachSocketServer(httpServer, {
    matchStore,
    origins,
  });

  httpServer.listen(port, DEFAULT_HOST, () => {
    console.log(`[backend] listening on http://${DEFAULT_HOST}:${port}`);
    console.log(`[backend] allowed origins: ${origins.join(', ')}`);
    console.log(`[backend] story saves file: ${storySaveStore.getStats().filePath}`);
    console.log(`[backend] progress file: ${progressStore.getStats().filePath}`);
  });

  const shutdown = (signal) => {
    console.log(`[backend] received ${signal}, shutting down...`);
    socket.io.close(() => {
      httpServer.close(() => {
        console.log('[backend] shutdown complete');
        process.exit(0);
      });
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  return {
    httpServer,
    socket,
  };
}

if (require.main === module) {
  startServer();
}

module.exports = {
  startServer,
};
