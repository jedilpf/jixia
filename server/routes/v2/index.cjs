const express = require('express');
const { createIdentityV2Router } = require('./identity.cjs');
const { createStoryV2Router } = require('./story.cjs');
const { createProgressV2Router } = require('./progress.cjs');
const { sendV2Success } = require('./response.cjs');

function createV2Router({ identityStore, storySaveStore, progressStore }) {
  const router = express.Router();

  router.get('/', (req, res) => {
    sendV2Success(req, res, 200, {
      version: 'v2',
      modules: ['identity', 'story', 'progress'],
      compatibility_mode: true,
    });
  });

  router.use('/identity', createIdentityV2Router({ identityStore }));
  router.use('/story', createStoryV2Router({ storySaveStore }));
  router.use('/progress', createProgressV2Router({ progressStore }));

  return router;
}

module.exports = {
  createV2Router,
};
