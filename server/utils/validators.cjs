const { HttpError } = require('./http-error.cjs');

const STORY_SLOT_TYPES = ['autosave', 'manual_1', 'manual_2', 'manual_3'];

function sanitizeUserId(input) {
  if (typeof input !== 'string') return null;
  const text = input.trim();
  if (!text) return null;
  return text.slice(0, 64);
}

function resolveUserId(req) {
  const fromHeader = sanitizeUserId(req.headers['x-user-id'] || req.headers['x-device-id']);
  const fromQuery = sanitizeUserId(req.query?.userId);
  const fromBody = sanitizeUserId(req.body?.userId);

  const userId = fromHeader || fromQuery || fromBody;
  if (!userId) {
    throw new HttpError(400, 'Missing user identity. Provide x-user-id header or userId param.');
  }
  return userId;
}

function assertStorySlotType(slotType) {
  if (!STORY_SLOT_TYPES.includes(slotType)) {
    throw new HttpError(400, 'Invalid slot type.', {
      accepted: STORY_SLOT_TYPES,
      received: slotType,
    });
  }
}

function assertObject(value, fieldName) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, `${fieldName} must be an object.`);
  }
}

function assertStorySavePayload(payload) {
  assertObject(payload, 'Story save payload');

  if (typeof payload.currentNodeId !== 'string' || payload.currentNodeId.trim().length === 0) {
    throw new HttpError(400, 'Story save payload missing currentNodeId.');
  }

  assertObject(payload.player, 'Story save payload.player');
  assertObject(payload.progress, 'Story save payload.progress');

  if (typeof payload.progress.chapter !== 'number' || !Number.isFinite(payload.progress.chapter)) {
    throw new HttpError(400, 'Story save payload.progress.chapter must be a number.');
  }

  if (typeof payload.progress.scene !== 'number' || !Number.isFinite(payload.progress.scene)) {
    throw new HttpError(400, 'Story save payload.progress.scene must be a number.');
  }

  if (!Array.isArray(payload.progress.completedNodes)) {
    throw new HttpError(400, 'Story save payload.progress.completedNodes must be an array.');
  }
}

const PROGRESS_NUMERIC_FIELDS = [
  'level',
  'exp',
  'totalExp',
  'winCount',
  'totalGames',
  'winStreak',
  'totalDamage',
  'collectedCards',
  'totalCards',
  'opportunity',
];

function assertPlayerProgressPayload(payload, options = {}) {
  const partial = options.partial === true;
  assertObject(payload, 'Player progress payload');

  if (!partial) {
    for (const field of PROGRESS_NUMERIC_FIELDS) {
      if (typeof payload[field] !== 'number' || !Number.isFinite(payload[field])) {
        throw new HttpError(400, `Player progress payload.${field} must be a finite number.`);
      }
    }
  } else {
    for (const field of PROGRESS_NUMERIC_FIELDS) {
      if (payload[field] === undefined) continue;
      if (typeof payload[field] !== 'number' || !Number.isFinite(payload[field])) {
        throw new HttpError(400, `Player progress payload.${field} must be a finite number.`);
      }
    }
  }

  if (payload.lastSettlementKey !== undefined && payload.lastSettlementKey !== null && typeof payload.lastSettlementKey !== 'string') {
    throw new HttpError(400, 'Player progress payload.lastSettlementKey must be string|null.');
  }

  if (payload.unlockedPersonages !== undefined && !Array.isArray(payload.unlockedPersonages)) {
    throw new HttpError(400, 'Player progress payload.unlockedPersonages must be an array.');
  }

  if (payload.factionReputation !== undefined) {
    assertObject(payload.factionReputation, 'Player progress payload.factionReputation');
    for (const [key, value] of Object.entries(payload.factionReputation)) {
      if (typeof key !== 'string') {
        throw new HttpError(400, 'Player progress payload.factionReputation has invalid key.');
      }
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new HttpError(400, `Player progress payload.factionReputation.${key} must be a finite number.`);
      }
    }
  }
}

module.exports = {
  STORY_SLOT_TYPES,
  resolveUserId,
  assertStorySlotType,
  assertStorySavePayload,
  assertPlayerProgressPayload,
};
