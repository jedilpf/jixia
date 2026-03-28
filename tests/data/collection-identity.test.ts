import { test } from 'node:test';
import * as assert from 'node:assert/strict';

import {
  ACTIVE_COLLECTION_CARDS,
  COLLECTION_CARDS,
  getCollectionFactionName,
  type CardData,
} from '../../src/data/cardsSource';

function normalizeCollectionName(name: string): string {
  return name
    .trim()
    .replace(/[\s\u3000]+/g, '')
    .replace(/[，。、“”‘’：；！？,.!?:;·—-]/g, '')
    .toLowerCase();
}

function collectionIdentity(card: CardData): string {
  const faction = getCollectionFactionName(card.faction).trim();
  const name = normalizeCollectionName(card.name);
  return `${faction}::${name}`;
}

test('collection cards keep unique visible identities', () => {
  const seen = new Map<string, string>();
  for (const card of COLLECTION_CARDS) {
    const key = collectionIdentity(card);
    const firstId = seen.get(key);
    assert.equal(
      firstId,
      undefined,
      `duplicate collection identity "${key}" from ${firstId} and ${card.id}`
    );
    seen.set(key, card.id);
  }
});

test('active collection cards are unique and consistent', () => {
  const activeSet = new Set(ACTIVE_COLLECTION_CARDS.map((card) => card.id));
  assert.equal(
    activeSet.size,
    ACTIVE_COLLECTION_CARDS.length,
    'ACTIVE_COLLECTION_CARDS should not contain duplicate ids'
  );

  for (const card of ACTIVE_COLLECTION_CARDS) {
    assert.equal(card.status, 'active');
  }
});

