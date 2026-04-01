const { randomUUID } = require('crypto');

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

function createInMemoryMatchStore() {
  const matches = new Map();

  function createAiMatch(payload = {}) {
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
    return matches.get(matchId) || null;
  }

  function updateMatch(matchId, updater) {
    const current = matches.get(matchId);
    if (!current) {
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
  };
}

module.exports = {
  createInMemoryMatchStore,
};
