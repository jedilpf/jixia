const express = require('express');
const { HttpError } = require('../../utils/http-error.cjs');
const { resolveUserId } = require('../../utils/validators.cjs');
const { sendV2Success } = require('./response.cjs');

function createIdentityV2Router({ identityStore }) {
  const router = express.Router();

  if (!identityStore) {
    router.use((_req, _res, next) => {
      next(new HttpError(503, 'Identity store unavailable.'));
    });
    return router;
  }

  router.post('/guest-session', (req, res, next) => {
    try {
      const payload = req.body || {};
      const created = identityStore.createGuestSession({
        device_id: payload.device_id,
        platform: payload.platform,
        locale: payload.locale,
        timezone: payload.timezone,
        display_name: payload.display_name,
      });
      sendV2Success(req, res, 201, created);
    } catch (error) {
      next(error);
    }
  });

  router.get('/me', (req, res, next) => {
    try {
      const playerId = resolveUserId(req);
      const profile = identityStore.getOrCreateProfile(playerId);
      const devices = identityStore.listDevices(playerId);
      sendV2Success(req, res, 200, {
        profile,
        devices,
      }, { revision: profile.revision });
    } catch (error) {
      next(error);
    }
  });

  router.post('/bind-device', (req, res, next) => {
    try {
      const playerId = resolveUserId(req);
      const payload = req.body || {};
      const bound = identityStore.bindDevice(playerId, {
        device_id: payload.device_id || req.headers['x-device-id'],
        platform: payload.platform,
        trusted: payload.trusted,
      });
      sendV2Success(req, res, 200, bound, { revision: bound.revision });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createIdentityV2Router,
};
