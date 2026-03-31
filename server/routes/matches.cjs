const express = require('express');
const { HttpError } = require('../utils/http-error.cjs');

function createMatchesRouter({ matchStore }) {
  const router = express.Router();

  router.post('/ai', (req, res, next) => {
    try {
      const payload = req.body || {};
      const created = matchStore.createAiMatch(payload);
      res.status(201).json({
        ok: true,
        data: {
          match: created,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:matchId', (req, res, next) => {
    try {
      const { matchId } = req.params;
      const match = matchStore.getMatch(matchId);
      if (!match) {
        throw new HttpError(404, 'Match not found.', { matchId });
      }
      res.status(200).json({
        ok: true,
        data: {
          match,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createMatchesRouter,
};
