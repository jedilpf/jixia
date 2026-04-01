const express = require('express');
const cors = require('cors');
const { parseOrigins } = require('./constants.cjs');
const { requestLogger } = require('./middleware/request-logger.cjs');
const { notFoundHandler, errorHandler } = require('./middleware/error-handler.cjs');
const { createHealthRouter } = require('./routes/health.cjs');
const { createMatchesRouter } = require('./routes/matches.cjs');

function createApp({ matchStore }) {
  const app = express();
  const origins = parseOrigins(process.env.CLIENT_ORIGIN);

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

  app.use('/health', createHealthRouter());
  app.use('/api/v1/matches', createMatchesRouter({ matchStore }));

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
