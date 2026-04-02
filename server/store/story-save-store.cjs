const path = require('path');
const { createJsonFileStore } = require('./json-file-store.cjs');
const { STORY_SLOT_TYPES, assertStorySlotType } = require('../utils/validators.cjs');

const DEFAULT_SCHEMA = {
  version: 1,
  users: {},
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function summarizeSlot(entry) {
  if (!entry) return { exists: false };
  const saveData = entry.data || {};
  const progress = saveData.progress || {};
  const completedNodes = Array.isArray(progress.completedNodes) ? progress.completedNodes : [];
  const visitedNodes = Array.isArray(progress.visitedNodes) ? progress.visitedNodes : [];
  return {
    exists: true,
    timestamp: entry.timestamp,
    chapter: typeof progress.chapter === 'number' ? progress.chapter : undefined,
    nodeCount: visitedNodes.length > 0 ? visitedNodes.length : completedNodes.length,
    currentNodeId: typeof saveData.currentNodeId === 'string' ? saveData.currentNodeId : undefined,
  };
}

function ensureUserBucket(users, userId) {
  if (!users[userId] || typeof users[userId] !== 'object') {
    users[userId] = {};
  }
  return users[userId];
}

function createStorySaveStore(options = {}) {
  const dataDir = options.dataDir || 'data/backend';
  const filePath = path.resolve(dataDir, options.fileName || 'story-saves.json');
  const fileStore = createJsonFileStore({
    filePath,
    defaultData: DEFAULT_SCHEMA,
  });

  function getSaveSlots(userId) {
    const state = fileStore.getState();
    const userBucket = state.users?.[userId] || {};
    return {
      autosave: summarizeSlot(userBucket.autosave),
      manual_1: summarizeSlot(userBucket.manual_1),
      manual_2: summarizeSlot(userBucket.manual_2),
      manual_3: summarizeSlot(userBucket.manual_3),
    };
  }

  function getSave(userId, slotType) {
    assertStorySlotType(slotType);
    const state = fileStore.getState();
    const entry = state.users?.[userId]?.[slotType];
    return entry?.data ? clone(entry.data) : null;
  }

  function save(userId, slotType, saveData) {
    assertStorySlotType(slotType);
    const timestamp = Date.now();
    fileStore.update((draft) => {
      const users = draft.users || {};
      draft.users = users;
      const userBucket = ensureUserBucket(users, userId);
      userBucket[slotType] = {
        slotType,
        timestamp,
        data: clone(saveData),
      };
      return draft;
    });
    return {
      userId,
      slotType,
      timestamp,
    };
  }

  function remove(userId, slotType) {
    assertStorySlotType(slotType);
    let existed = false;
    fileStore.update((draft) => {
      const users = draft.users || {};
      const userBucket = users[userId];
      if (!userBucket || !userBucket[slotType]) return draft;
      existed = true;
      delete userBucket[slotType];
      if (Object.keys(userBucket).length === 0) {
        delete users[userId];
      }
      return draft;
    });
    return existed;
  }

  function getStats() {
    const state = fileStore.getState();
    const users = state.users || {};
    const userCount = Object.keys(users).length;
    let saveCount = 0;
    for (const userBucket of Object.values(users)) {
      for (const slotType of STORY_SLOT_TYPES) {
        if (userBucket && userBucket[slotType]) {
          saveCount += 1;
        }
      }
    }
    return {
      filePath: fileStore.filePath,
      userCount,
      saveCount,
    };
  }

  return {
    getSaveSlots,
    getSave,
    save,
    remove,
    getStats,
  };
}

module.exports = {
  createStorySaveStore,
};
