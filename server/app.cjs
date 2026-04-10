const express = require('express');
const cors = require('cors');
const { parseOrigins } = require('./constants.cjs');
const { requestLogger } = require('./middleware/request-logger.cjs');
const { notFoundHandler, errorHandler } = require('./middleware/error-handler.cjs');
const { createHealthRouter } = require('./routes/health.cjs');
const { createMatchesRouter } = require('./routes/matches.cjs');
const { createStoryRouter } = require('./routes/story.cjs');
const { createProgressRouter } = require('./routes/progress.cjs');
const { createV2Router } = require('./routes/v2/index.cjs');
const { createAuthRouter } = require('./routes/auth.cjs');
const { createUsersRouter } = require('./routes/users.cjs');
const { createCardsRouter } = require('./routes/cards.cjs');
const { createDecksRouter } = require('./routes/decks.cjs');
const { createCommunityRouter } = require('./routes/community.cjs');

function createApp({ matchStore, storySaveStore, progressStore, identityStore, models, services }) {
  const app = express();
  const origins = parseOrigins(process.env.CLIENT_ORIGIN);
  const getBackendStats = () => ({
    identity: identityStore?.getStats ? identityStore.getStats() : null,
    story: storySaveStore?.getStats ? storySaveStore.getStats() : null,
    progress: progressStore?.getStats ? progressStore.getStats() : null,
  });

  app.disable('x-powered-by');
  app.use(cors({
    origin: origins,
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);

  app.get('/', (_req, res) => {
    res.status(200).json({
      ok: true,
      message: 'Jixia backend is running.',
    });
  });

  app.use('/health', createHealthRouter({ getBackendStats }));

  // API v1 路由
  if (services) {
    app.use('/api/v1/auth', createAuthRouter({ services }));
    app.use('/api/v1/users', createUsersRouter({ services }));
    app.use('/api/v1/cards', createCardsRouter({ services }));
    app.use('/api/v1/decks', createDecksRouter({ services }));
  }

  app.use('/api/v1/matches', createMatchesRouter({ matchStore }));
  if (models?.story && storySaveStore) {
    app.use('/api/v1/story', createStoryRouter({ models, storySaveStore }));
  }
  if (models?.progress && progressStore) {
    app.use('/api/v1/progress', createProgressRouter({ models, progressStore }));
  }
  if (models?.leaderboard && models?.achievement && models?.progress) {
    app.use('/api/v1/community', createCommunityRouter({ models }));
  }
  app.use('/api/v2', createV2Router({ identityStore, storySaveStore, progressStore }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return {
    app,
    origins,
  };
}

module.exports = {
  createApp,
};
