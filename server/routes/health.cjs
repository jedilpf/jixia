const express = require('express');

function createHealthRouter(options = {}) {
  const router = express.Router();
  const getBackendStats = typeof options.getBackendStats === 'function'
    ? options.getBackendStats
    : () => ({});

  router.get('/', (_req, res) => {
    res.status(200).json({
      ok: true,
      service: 'jixia-backend',
      stage: 'p2-persistent-core',
      now: new Date().toISOString(),
      stats: getBackendStats(),
    });
  });

  return router;
}

module.exports = {
  createHealthRouter,
};
