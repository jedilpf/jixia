const express = require('express');

function createHealthRouter() {
  const router = express.Router();

  router.get('/', (_req, res) => {
    res.status(200).json({
      ok: true,
      service: 'jixia-backend',
      stage: 'p1-skeleton',
      now: new Date().toISOString(),
    });
  });

  return router;
}

module.exports = {
  createHealthRouter,
};
