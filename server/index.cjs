const http = require('http');
const { DEFAULT_DATA_DIR, DEFAULT_HOST, DEFAULT_PORT } = require('./constants.cjs');
const { createDatabase, initializeDatabase, closeDatabase } = require('./config/database.cjs');
const { createModels } = require('./models/index.cjs');
const { createServices } = require('./services/index.cjs');
const { createInMemoryMatchStore } = require('./store/match-store.cjs');
const { createStorySaveStore } = require('./store/story-save-store.cjs');
const { createPlayerProgressStore } = require('./store/player-progress-store.cjs');
const { createInMemoryIdentityStore } = require('./store/identity-store.cjs');
const { createApp } = require('./app.cjs');
const { attachSocketServer } = require('./socket/index.cjs');

function startServer() {
  const port = DEFAULT_PORT;
  
  // 初始化数据库
  const db = createDatabase();
  initializeDatabase(db);
  
  // 创建模型层
  const models = createModels(db);
  
  // 创建存储层（保留现有的内存存储用于过渡）
  const matchStore = createInMemoryMatchStore();
  const identityStore = createInMemoryIdentityStore();
  const storySaveStore = createStorySaveStore({ dataDir: DEFAULT_DATA_DIR });
  const progressStore = createPlayerProgressStore({ dataDir: DEFAULT_DATA_DIR });
  
  // 创建服务层
  const services = createServices(models, { matchStore });
  
  const { app, origins } = createApp({ 
    matchStore, 
    identityStore, 
    storySaveStore, 
    progressStore,
    models,
    services,
    db
  });
  
  const httpServer = http.createServer(app);
  const socket = attachSocketServer(httpServer, {
    matchStore,
    origins,
    models,
    services,
    db
  });

  httpServer.listen(port, DEFAULT_HOST, () => {
    console.log(`[backend] listening on http://${DEFAULT_HOST}:${port}`);
    console.log(`[backend] allowed origins: ${origins.join(', ')}`);
    console.log(`[backend] story saves file: ${storySaveStore.getStats().filePath}`);
    console.log(`[backend] progress file: ${progressStore.getStats().filePath}`);
    console.log(`[backend] database models initialized: ${Object.keys(models).join(', ')}`);
    console.log(`[backend] services initialized: user, card, match`);
  });

  const shutdown = (signal) => {
    console.log(`[backend] received ${signal}, shutting down...`);
    
    // 关闭 Socket.IO
    socket.io.close(() => {
      // 关闭 HTTP 服务器
      httpServer.close(() => {
        // 关闭数据库连接
        try {
          closeDatabase(db);
        } catch (err) {
          console.error('[backend] Error closing database:', err.message);
        }
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
    db,
    models,
    services
  };
}

if (require.main === module) {
  try {
    startServer();
  } catch (err) {
    console.error('[backend] Failed to start server:', err);
    process.exit(1);
  }
}

module.exports = {
  startServer,
};
