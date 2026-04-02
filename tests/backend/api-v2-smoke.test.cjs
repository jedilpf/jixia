const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../../server/app.cjs');
const { createInMemoryIdentityStore } = require('../../server/store/identity-store.cjs');

function createMatchStoreStub() {
  return {
    listMatches() {
      return [];
    },
    createAiMatch() {
      return { matchId: 'm_stub' };
    },
    getMatch() {
      return null;
    },
    removeMatch() {
      return false;
    },
  };
}

function createStorySaveStoreStub() {
  const saves = new Map();

  function keyOf(userId, slotType) {
    return `${userId}::${slotType}`;
  }

  return {
    getStats() {
      return {
        filePath: ':memory:',
        saveCount: saves.size,
      };
    },
    getSaveSlots(userId) {
      const read = (slotType) => {
        const payload = saves.get(keyOf(userId, slotType));
        if (!payload) return { exists: false };
        return {
          exists: true,
          timestamp: Date.now(),
          chapter: payload.progress?.chapter ?? 0,
          currentNodeId: payload.currentNodeId,
          nodeCount: Array.isArray(payload.progress?.completedNodes) ? payload.progress.completedNodes.length : 0,
        };
      };
      return {
        autosave: read('autosave'),
        manual_1: read('manual_1'),
        manual_2: read('manual_2'),
        manual_3: read('manual_3'),
      };
    },
    getSave(userId, slotType) {
      return saves.get(keyOf(userId, slotType)) || null;
    },
    save(userId, slotType, payload) {
      saves.set(keyOf(userId, slotType), payload);
      return {
        userId,
        slotType,
        timestamp: Date.now(),
      };
    },
    remove(userId, slotType) {
      return saves.delete(keyOf(userId, slotType));
    },
  };
}

function createProgressStoreStub() {
  const records = new Map();
  return {
    getStats() {
      return {
        filePath: ':memory:',
        userCount: records.size,
      };
    },
    getProgress(userId) {
      return records.get(userId) || {
        exists: false,
        updatedAt: null,
        data: {
          level: 1,
          exp: 0,
        },
      };
    },
    setProgress(userId, payload) {
      const saved = {
        exists: true,
        updatedAt: new Date().toISOString(),
        data: payload,
      };
      records.set(userId, saved);
      return saved;
    },
    patchProgress(userId, payload) {
      const prev = this.getProgress(userId);
      return this.setProgress(userId, {
        ...(prev.data || {}),
        ...payload,
      });
    },
    removeProgress(userId) {
      return records.delete(userId);
    },
  };
}

function createStoryPayload(currentNodeId = 'prolog_0_2') {
  return {
    currentNodeId,
    player: {
      stats: { fame: 1, wisdom: 5, charm: 5, courage: 5, insight: 5 },
      relationships: {},
      flags: {},
    },
    progress: {
      chapter: 0,
      scene: 2,
      completedNodes: ['prolog_0_1'],
    },
  };
}

async function withServer(fn) {
  const { app } = createApp({
    matchStore: createMatchStoreStub(),
    identityStore: createInMemoryIdentityStore(),
    storySaveStore: createStorySaveStoreStub(),
    progressStore: createProgressStoreStub(),
  });
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

test('v2 root endpoint returns module list', async () => {
  await withServer(async (baseUrl) => {
    const result = await requestJson(`${baseUrl}/api/v2`);
    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    assert.deepEqual(result.body.data.modules, ['identity', 'story', 'progress']);
  });
});

test('v2 identity guest-session creates player id', async () => {
  await withServer(async (baseUrl) => {
    const result = await requestJson(`${baseUrl}/api/v2/identity/guest-session`, {
      method: 'POST',
      body: JSON.stringify({
        device_id: 'dev_local_test',
        locale: 'zh-CN',
      }),
    });
    assert.equal(result.status, 201);
    assert.equal(result.body.ok, true);
    assert.match(result.body.data.player_id, /^plyr_/);
    assert.match(result.body.data.session_token, /^sess_/);
  });
});

test('v2 story saves supports put/get flow with compatibility payload', async () => {
  await withServer(async (baseUrl) => {
    const payload = createStoryPayload('prolog_0_2');

    const saveResult = await requestJson(`${baseUrl}/api/v2/story/saves/manual_1`, {
      method: 'PUT',
      headers: { 'x-user-id': 'v2_tester' },
      body: JSON.stringify({
        idempotency_key: 'save_v2_001',
        save_payload: payload,
      }),
    });
    assert.equal(saveResult.status, 200);
    assert.equal(saveResult.body.ok, true);
    assert.equal(saveResult.body.meta.revision, 1);

    const getResult = await requestJson(`${baseUrl}/api/v2/story/saves/manual_1`, {
      method: 'GET',
      headers: { 'x-user-id': 'v2_tester' },
    });
    assert.equal(getResult.status, 200);
    assert.equal(getResult.body.ok, true);
    assert.equal(getResult.body.data.save_payload.currentNodeId, 'prolog_0_2');
  });
});

test('v2 story write enforces if_revision and idempotency_key contracts', async () => {
  await withServer(async (baseUrl) => {
    const firstPayload = createStoryPayload('prolog_story_1');
    const firstWrite = await requestJson(`${baseUrl}/api/v2/story/saves/manual_2`, {
      method: 'PUT',
      headers: { 'x-user-id': 'v2_story_guard' },
      body: JSON.stringify({
        idempotency_key: 'idem_story_1',
        if_revision: 0,
        save_payload: firstPayload,
      }),
    });
    assert.equal(firstWrite.status, 200);
    assert.equal(firstWrite.body.meta.revision, 1);

    const replayWrite = await requestJson(`${baseUrl}/api/v2/story/saves/manual_2`, {
      method: 'PUT',
      headers: { 'x-user-id': 'v2_story_guard' },
      body: JSON.stringify({
        idempotency_key: 'idem_story_1',
        if_revision: 1,
        save_payload: firstPayload,
      }),
    });
    assert.equal(replayWrite.status, 200);
    assert.equal(replayWrite.body.meta.idempotent_replay, true);
    assert.equal(replayWrite.body.meta.revision, 1);

    const staleRevisionWrite = await requestJson(`${baseUrl}/api/v2/story/saves/manual_2`, {
      method: 'PUT',
      headers: { 'x-user-id': 'v2_story_guard' },
      body: JSON.stringify({
        idempotency_key: 'idem_story_2',
        if_revision: 0,
        save_payload: createStoryPayload('prolog_story_2'),
      }),
    });
    assert.equal(staleRevisionWrite.status, 409);
    assert.equal(staleRevisionWrite.body.ok, false);
    assert.equal(staleRevisionWrite.body.error.details.current_revision, 1);

    const idempotencyConflict = await requestJson(`${baseUrl}/api/v2/story/saves/manual_2`, {
      method: 'PUT',
      headers: { 'x-user-id': 'v2_story_guard' },
      body: JSON.stringify({
        idempotency_key: 'idem_story_1',
        if_revision: 1,
        save_payload: createStoryPayload('prolog_story_conflict'),
      }),
    });
    assert.equal(idempotencyConflict.status, 409);
    assert.match(idempotencyConflict.body.error.message, /Idempotency conflict/i);
  });
});

test('v2 progress supports patch/get flow', async () => {
  await withServer(async (baseUrl) => {
    const patchResult = await requestJson(`${baseUrl}/api/v2/progress`, {
      method: 'PATCH',
      headers: { 'x-user-id': 'v2_tester2' },
      body: JSON.stringify({
        progress_payload: {
          level: 3,
          exp: 80,
        },
      }),
    });
    assert.equal(patchResult.status, 200);
    assert.equal(patchResult.body.ok, true);
    assert.equal(patchResult.body.data.progress.data.level, 3);
    assert.equal(patchResult.body.meta.revision, 1);

    const getResult = await requestJson(`${baseUrl}/api/v2/progress`, {
      method: 'GET',
      headers: { 'x-user-id': 'v2_tester2' },
    });
    assert.equal(getResult.status, 200);
    assert.equal(getResult.body.ok, true);
    assert.equal(getResult.body.data.progress.data.exp, 80);
  });
});

test('v2 progress write enforces if_revision and idempotency_key contracts', async () => {
  await withServer(async (baseUrl) => {
    const firstPatch = await requestJson(`${baseUrl}/api/v2/progress`, {
      method: 'PATCH',
      headers: { 'x-user-id': 'v2_progress_guard' },
      body: JSON.stringify({
        idempotency_key: 'idem_progress_patch_1',
        if_revision: 0,
        progress_payload: {
          level: 3,
          exp: 80,
        },
      }),
    });
    assert.equal(firstPatch.status, 200);
    assert.equal(firstPatch.body.meta.revision, 1);

    const replayPatch = await requestJson(`${baseUrl}/api/v2/progress`, {
      method: 'PATCH',
      headers: { 'x-user-id': 'v2_progress_guard' },
      body: JSON.stringify({
        idempotency_key: 'idem_progress_patch_1',
        if_revision: 1,
        progress_payload: {
          level: 3,
          exp: 80,
        },
      }),
    });
    assert.equal(replayPatch.status, 200);
    assert.equal(replayPatch.body.meta.idempotent_replay, true);
    assert.equal(replayPatch.body.meta.revision, 1);

    const staleRevisionPatch = await requestJson(`${baseUrl}/api/v2/progress`, {
      method: 'PATCH',
      headers: { 'x-user-id': 'v2_progress_guard' },
      body: JSON.stringify({
        idempotency_key: 'idem_progress_patch_2',
        if_revision: 0,
        progress_payload: {
          level: 4,
          exp: 81,
        },
      }),
    });
    assert.equal(staleRevisionPatch.status, 409);
    assert.equal(staleRevisionPatch.body.error.details.current_revision, 1);

    const idempotencyConflictPatch = await requestJson(`${baseUrl}/api/v2/progress`, {
      method: 'PATCH',
      headers: { 'x-user-id': 'v2_progress_guard' },
      body: JSON.stringify({
        idempotency_key: 'idem_progress_patch_1',
        if_revision: 1,
        progress_payload: {
          level: 4,
          exp: 81,
        },
      }),
    });
    assert.equal(idempotencyConflictPatch.status, 409);
    assert.match(idempotencyConflictPatch.body.error.message, /Idempotency conflict/i);
  });
});
