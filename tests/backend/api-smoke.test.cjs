const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../../server/app.cjs');

function createMatchStoreStub() {
  const matches = new Map();
  return {
    listMatches() {
      return Array.from(matches.values());
    },
    createAiMatch(payload = {}) {
      const id = payload.matchId || `m_${Date.now()}`;
      const match = { matchId: id, mode: 'ai' };
      matches.set(id, match);
      return match;
    },
    getMatch(matchId) {
      return matches.get(matchId) || null;
    },
    removeMatch(matchId) {
      return matches.delete(matchId);
    },
  };
}

function createStorySaveStoreStub() {
  const userSaves = new Map();

  function ensureUser(userId) {
    if (!userSaves.has(userId)) {
      userSaves.set(userId, new Map());
    }
    return userSaves.get(userId);
  }

  return {
    getStats() {
      return {
        filePath: ':memory:',
        userCount: userSaves.size,
      };
    },
    getSaveSlots(userId) {
      const bucket = userSaves.get(userId) || new Map();
      const makeSlot = (slotType) => {
        const save = bucket.get(slotType);
        if (!save) return { exists: false };
        const completedNodes = Array.isArray(save.progress?.completedNodes) ? save.progress.completedNodes : [];
        const visitedNodes = Array.isArray(save.progress?.visitedNodes) ? save.progress.visitedNodes : [];
        return {
          exists: true,
          timestamp: Date.now(),
          chapter: save.progress?.chapter,
          currentNodeId: save.currentNodeId,
          nodeCount: visitedNodes.length > 0 ? visitedNodes.length : completedNodes.length,
        };
      };

      return {
        autosave: makeSlot('autosave'),
        manual_1: makeSlot('manual_1'),
        manual_2: makeSlot('manual_2'),
        manual_3: makeSlot('manual_3'),
      };
    },
    getSave(userId, slotType) {
      const bucket = userSaves.get(userId);
      if (!bucket) return null;
      return bucket.get(slotType) || null;
    },
    save(userId, slotType, payload) {
      const bucket = ensureUser(userId);
      bucket.set(slotType, payload);
      return {
        userId,
        slotType,
        timestamp: Date.now(),
      };
    },
    remove(userId, slotType) {
      const bucket = userSaves.get(userId);
      if (!bucket) return false;
      return bucket.delete(slotType);
    },
  };
}

function createProgressStoreStub() {
  const data = new Map();
  return {
    getStats() {
      return {
        filePath: ':memory:',
        userCount: data.size,
      };
    },
    getProgress(userId) {
      return data.get(userId) || { exists: false, updatedAt: null, data: {} };
    },
    setProgress(userId, payload) {
      const saved = {
        exists: true,
        updatedAt: new Date().toISOString(),
        data: payload,
      };
      data.set(userId, saved);
      return saved;
    },
    patchProgress(userId, payload) {
      const prev = data.get(userId) || { exists: false, updatedAt: null, data: {} };
      return this.setProgress(userId, { ...prev.data, ...payload });
    },
    removeProgress(userId) {
      return data.delete(userId);
    },
  };
}

async function withServer(fn) {
  const stores = {
    matchStore: createMatchStoreStub(),
    storySaveStore: createStorySaveStoreStub(),
    progressStore: createProgressStoreStub(),
  };
  const { app } = createApp(stores);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await fn(baseUrl);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

async function requestJson(url, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  const response = await fetch(url, {
    ...rest,
    headers: {
      'content-type': 'application/json',
      ...(extraHeaders || {}),
    },
  });
  const body = await response.json();
  return {
    status: response.status,
    body,
  };
}

test('health endpoint returns backend status payload', async () => {
  await withServer(async (baseUrl) => {
    const result = await requestJson(`${baseUrl}/health`);
    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    assert.equal(result.body.service, 'jixia-backend');
    assert.ok(result.body.stats.story);
    assert.ok(result.body.stats.progress);
  });
});

test('story endpoint validates invalid slot type', async () => {
  await withServer(async (baseUrl) => {
    const result = await requestJson(`${baseUrl}/api/v1/story/saves/manual_x`, {
      method: 'POST',
      headers: { 'x-user-id': 'qa_user' },
      body: JSON.stringify({
        data: {
          currentNodeId: 'prolog_0_1',
          player: { stats: {}, relationships: {}, flags: {} },
          progress: { chapter: 0, scene: 1, completedNodes: [] },
        },
      }),
    });

    assert.equal(result.status, 400);
    assert.equal(result.body.ok, false);
    assert.equal(result.body.error.code, 'REQUEST_ERROR');
  });
});

test('story save and load endpoints keep manual slot payload', async () => {
  await withServer(async (baseUrl) => {
    const payload = {
      currentNodeId: 'prolog_0_2',
      player: {
        stats: { fame: 2, wisdom: 6, charm: 5, courage: 5, insight: 5 },
        relationships: {},
        flags: {},
      },
      progress: {
        chapter: 0,
        scene: 2,
        completedNodes: ['prolog_0_1'],
      },
    };

    const saveResult = await requestJson(`${baseUrl}/api/v1/story/saves/manual_1`, {
      method: 'POST',
      headers: { 'x-user-id': 'story_tester' },
      body: JSON.stringify({ data: payload }),
    });
    assert.equal(saveResult.status, 201);
    assert.equal(saveResult.body.ok, true);

    const loadResult = await requestJson(`${baseUrl}/api/v1/story/saves/manual_1`, {
      method: 'GET',
      headers: { 'x-user-id': 'story_tester' },
    });
    assert.equal(loadResult.status, 200);
    assert.equal(loadResult.body.ok, true);
    assert.equal(loadResult.body.data.slotType, 'manual_1');
    assert.equal(loadResult.body.data.save.currentNodeId, 'prolog_0_2');
  });
});
