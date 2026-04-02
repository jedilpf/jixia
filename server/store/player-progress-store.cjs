const path = require('path');
const { createJsonFileStore } = require('./json-file-store.cjs');

const DEFAULT_PROGRESS = {
  level: 1,
  exp: 0,
  totalExp: 0,
  winCount: 0,
  totalGames: 0,
  winStreak: 0,
  totalDamage: 0,
  collectedCards: 12,
  totalCards: 190,
  opportunity: 0,
  lastSettlementKey: null,
  unlockedPersonages: [],
  factionReputation: {
    rujia: 0,
    fajia: 0,
    mojia: 0,
    daojia: 0,
    mingjia: 0,
    yinyang: 0,
  },
};

const DEFAULT_SCHEMA = {
  version: 1,
  users: {},
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createPlayerProgressStore(options = {}) {
  const dataDir = options.dataDir || 'data/backend';
  const filePath = path.resolve(dataDir, options.fileName || 'player-progress.json');
  const fileStore = createJsonFileStore({
    filePath,
    defaultData: DEFAULT_SCHEMA,
  });

  function getEntry(userId) {
    const state = fileStore.getState();
    return state.users?.[userId] || null;
  }

  function getProgress(userId) {
    const entry = getEntry(userId);
    if (!entry || !entry.data) {
      return {
        exists: false,
        updatedAt: null,
        data: clone(DEFAULT_PROGRESS),
      };
    }
    return {
      exists: true,
      updatedAt: entry.updatedAt,
      data: {
        ...clone(DEFAULT_PROGRESS),
        ...clone(entry.data),
      },
    };
  }

  function setProgress(userId, progressData) {
    const updatedAt = new Date().toISOString();
    const fullData = {
      ...clone(DEFAULT_PROGRESS),
      ...clone(progressData),
    };

    fileStore.update((draft) => {
      const users = draft.users || {};
      draft.users = users;
      users[userId] = {
        updatedAt,
        data: fullData,
      };
      return draft;
    });

    return {
      updatedAt,
      data: fullData,
    };
  }

  function patchProgress(userId, patchData) {
    const current = getProgress(userId);
    const next = {
      ...current.data,
      ...clone(patchData),
    };
    return setProgress(userId, next);
  }

  function removeProgress(userId) {
    let existed = false;
    fileStore.update((draft) => {
      const users = draft.users || {};
      if (!users[userId]) return draft;
      existed = true;
      delete users[userId];
      return draft;
    });
    return existed;
  }

  function getStats() {
    const state = fileStore.getState();
    const users = state.users || {};
    return {
      filePath: fileStore.filePath,
      userCount: Object.keys(users).length,
    };
  }

  return {
    getProgress,
    setProgress,
    patchProgress,
    removeProgress,
    getStats,
    DEFAULT_PROGRESS: clone(DEFAULT_PROGRESS),
  };
}

module.exports = {
  createPlayerProgressStore,
};
