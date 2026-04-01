const { randomUUID } = require('crypto');
const { DEFAULT_MATCH_TTL_MS } = require('../constants.cjs');

function normalizePlayerName(input) {
  const fallback = '玩家';
  if (typeof input !== 'string') {
    return fallback;
  }
  const text = input.trim();
  return text.length > 0 ? text.slice(0, 24) : fallback;
}

function normalizeBotName(input) {
  const fallback = 'AI辩手';
  if (typeof input !== 'string') {
    return fallback;
  }
  const text = input.trim();
  return text.length > 0 ? text.slice(0, 24) : fallback;
}

function createInMemoryMatchStore(options = {}) {
  const matches = new Map();
  const ttlMs = Number.isFinite(options.ttlMs) && options.ttlMs > 0
    ? Math.floor(options.ttlMs)
    : DEFAULT_MATCH_TTL_MS;

  function isMatchExpired(match) {
    const reference = Date.parse(match.updatedAt || match.createdAt || 0);
    if (!Number.isFinite(reference) || reference <= 0) return false;
    return (Date.now() - reference) > ttlMs;
  }

  function deleteIfExpired(matchId, match) {
    if (!match) return false;
    if (!isMatchExpired(match)) return false;
    matches.delete(matchId);
    return true;
  }

  function sweepExpiredMatches() {
    let removed = 0;
    for (const [matchId, match] of matches.entries()) {
      if (deleteIfExpired(matchId, match)) {
        removed += 1;
      }
    }
    return removed;
  }

  function createAiMatch(payload = {}) {
    sweepExpiredMatches();

    const now = new Date().toISOString();
    const matchId = randomUUID();
    const humanPlayerId = `HUMAN-${randomUUID().slice(0, 8)}`;
    const aiPlayerId = `AI-${randomUUID().slice(0, 8)}`;

    const match = {
      id: matchId,
      mode: 'pve_ai',
      status: 'setup',
      createdAt: now,
      updatedAt: now,
      players: {
        human: {
          id: humanPlayerId,
          name: normalizePlayerName(payload.playerName),
        },
        ai: {
          id: aiPlayerId,
          name: normalizeBotName(payload.botName),
          level: typeof payload.botLevel === 'string' ? payload.botLevel : 'normal',
        },
      },
      stateVersion: 1,
      snapshot: {
        round: 1,
        phase: 'setup',
        currentPlayerId: humanPlayerId,
        topicSelectionPending: false,
      },
    };

    matches.set(matchId, match);
    return match;
  }

  function getMatch(matchId) {
    const match = matches.get(matchId) || null;
    if (deleteIfExpired(matchId, match)) {
      return null;
    }
    return match;
  }

  function updateMatch(matchId, updater) {
    sweepExpiredMatches();
    const current = matches.get(matchId);
    if (!current) {
      return null;
    }
    if (deleteIfExpired(matchId, current)) {
      return null;
    }
    const next = updater(current);
    if (!next) {
      return current;
    }
    next.updatedAt = new Date().toISOString();
    matches.set(matchId, next);
    return next;
  }

  return {
    createAiMatch,
    getMatch,
    updateMatch,
    sweepExpiredMatches,
  };
}

module.exports = {
  createInMemoryMatchStore,
};
