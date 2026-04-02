const { randomUUID } = require('crypto');

function nowIso() {
  return new Date().toISOString();
}

function buildPlayerId() {
  return `plyr_${randomUUID().replace(/-/g, '').slice(0, 18)}`;
}

function buildSessionToken() {
  return `sess_${randomUUID().replace(/-/g, '')}`;
}

function createInMemoryIdentityStore() {
  const profiles = new Map();
  const sessions = new Map();
  const deviceBindings = new Map();

  function getDeviceBucket(playerId) {
    if (!deviceBindings.has(playerId)) {
      deviceBindings.set(playerId, new Map());
    }
    return deviceBindings.get(playerId);
  }

  function getOrCreateProfile(playerId, overrides = {}) {
    const current = profiles.get(playerId);
    if (current) return { ...current };

    const timestamp = nowIso();
    const profile = {
      player_id: playerId,
      schema_version: '1.0.0',
      display_name: overrides.display_name || `论者-${playerId.slice(-6)}`,
      avatar_url: null,
      locale: overrides.locale || 'zh-CN',
      timezone: overrides.timezone || 'Asia/Shanghai',
      status: 'active',
      status_reason: null,
      created_at: timestamp,
      updated_at: timestamp,
      revision: 1,
    };
    profiles.set(playerId, profile);
    return { ...profile };
  }

  function createGuestSession(input = {}) {
    const playerId = buildPlayerId();
    const profile = getOrCreateProfile(playerId, {
      locale: input.locale,
      timezone: input.timezone,
      display_name: input.display_name,
    });
    const sessionToken = buildSessionToken();
    const expiresInSec = 60 * 60 * 24;
    sessions.set(sessionToken, {
      player_id: playerId,
      created_at: nowIso(),
      expires_in_sec: expiresInSec,
    });

    if (typeof input.device_id === 'string' && input.device_id.trim()) {
      bindDevice(playerId, {
        device_id: input.device_id,
        platform: input.platform || 'web',
        trusted: true,
      });
    }

    return {
      player_id: playerId,
      profile,
      session_token: sessionToken,
      expires_in_sec: expiresInSec,
    };
  }

  function bindDevice(playerId, input = {}) {
    const profile = getOrCreateProfile(playerId);
    const bucket = getDeviceBucket(playerId);
    const deviceId = (input.device_id || '').trim();
    if (!deviceId) {
      throw new Error('device_id is required.');
    }

    const timestamp = nowIso();
    const previous = bucket.get(deviceId);
    const next = {
      player_id: profile.player_id,
      device_id: deviceId,
      platform: input.platform || previous?.platform || 'web',
      trusted: input.trusted !== undefined ? Boolean(input.trusted) : (previous?.trusted ?? true),
      last_seen_at: timestamp,
      created_at: previous?.created_at || timestamp,
      updated_at: timestamp,
      revision: (previous?.revision || 0) + 1,
    };
    bucket.set(deviceId, next);
    return { ...next };
  }

  function listDevices(playerId) {
    const bucket = getDeviceBucket(playerId);
    return Array.from(bucket.values()).map((item) => ({ ...item }));
  }

  function getStats() {
    let deviceCount = 0;
    for (const bucket of deviceBindings.values()) {
      deviceCount += bucket.size;
    }
    return {
      profileCount: profiles.size,
      sessionCount: sessions.size,
      deviceCount,
    };
  }

  return {
    createGuestSession,
    getOrCreateProfile,
    bindDevice,
    listDevices,
    getStats,
  };
}

module.exports = {
  createInMemoryIdentityStore,
};
