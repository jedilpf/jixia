import { test } from 'node:test';
import * as assert from 'node:assert/strict';

import {
  PHASE_DURATION,
  battleReducer,
  checkDaShiVictory,
  createInitialBattleState,
  getPlanAssignError,
  isCardAllowedForSlot,
} from '../../src/battleV2/engine';
import type { DebateCard } from '../../src/battleV2/types';
import { WIN_DASHI } from '../../src/battleV2/types';

function buildSyntheticCard(overrides: Partial<DebateCard> = {}): DebateCard {
  return {
    id: 'test-card-synthetic',
    name: '测试卡',
    type: '立论',
    cost: 2,
    effectKind: 'damage',
    effectValue: 2,
    ...overrides,
  };
}

test('createInitialBattleState keeps core round-1 invariants', () => {
  const state = createInitialBattleState({ forcedTopicId: 'topic_governance_reform' });

  assert.equal(state.round, 1);
  assert.equal(state.phase, 'ming_bian');
  assert.equal(state.secondsLeft, PHASE_DURATION.ming_bian);
  assert.equal(state.player.resources.xinZheng, 20);
  assert.equal(state.enemy.resources.xinZheng, 20);
  assert.equal(state.player.resources.lingShi, 3);
  assert.equal(state.enemy.resources.lingShi, 3);
  assert.equal(state.player.hand.length, 5);
  assert.equal(state.enemy.hand.length, 5);
});

test('isCardAllowedForSlot enforces slot type boundaries', () => {
  assert.equal(isCardAllowedForSlot('response', '反诘'), true);
  assert.equal(isCardAllowedForSlot('response', '立论'), false);
  assert.equal(isCardAllowedForSlot('secret', '立论'), true);
});

test('getPlanAssignError validates hand presence, slot rule, and lingShi budget', () => {
  const state = createInitialBattleState({ forcedTopicId: 'topic_governance_reform' });
  const player = state.player;

  assert.equal(getPlanAssignError(player, 'main', 'missing-card-id'), '该牌不在手牌中');

  const wrongSlotCard = buildSyntheticCard({ id: 'test-card-wrong-slot', type: '立论' });
  player.hand.push(wrongSlotCard);
  const wrongSlotError = getPlanAssignError(player, 'response', wrongSlotCard.id);
  assert.equal(wrongSlotError, `${wrongSlotCard.type} 不能放入该槽位`);

  const expensiveCard = buildSyntheticCard({ id: 'test-card-expensive', type: '策术', cost: 3 });
  player.hand.push(expensiveCard);
  player.resources.lingShi = 1;
  const lingShiError = getPlanAssignError(player, 'main', expensiveCard.id);
  assert.match(lingShiError ?? '', /灵势不足/);
});

test('checkDaShiVictory returns winner at threshold', () => {
  const state = createInitialBattleState({ forcedTopicId: 'topic_governance_reform' });
  assert.equal(checkDaShiVictory(state), null);

  state.player.resources.daShi = WIN_DASHI;
  assert.equal(checkDaShiVictory(state), 'player');
});

test('battleReducer ADVANCE_PHASE follows deterministic phase chain', () => {
  let state = createInitialBattleState({ forcedTopicId: 'topic_governance_reform' });

  state = battleReducer(state, { type: 'ADVANCE_PHASE' });
  assert.equal(state.phase, 'an_mou');

  state = battleReducer(state, { type: 'ADVANCE_PHASE' });
  assert.equal(state.phase, 'reveal');

  state = battleReducer(state, { type: 'ADVANCE_PHASE' });
  assert.equal(state.phase, 'resolve');

  const roundBefore = state.round;
  state = battleReducer(state, { type: 'ADVANCE_PHASE' });
  assert.equal(state.phase, 'ming_bian');
  assert.equal(state.round, roundBefore + 1);
  assert.equal(state.secondsLeft, PHASE_DURATION.ming_bian);
});

test('topic selection window opens countdown on first tick', () => {
  const state = createInitialBattleState();

  state.round = state.topicSelectionRound;
  state.phase = 'ming_bian';
  state.topicSelectionSecondsLeft = null;

  const next = battleReducer(state, { type: 'TICK' });
  assert.equal(next.topicSelectionPending, true);
  assert.equal(next.topicSelectionSecondsLeft, 12);
  assert.equal(next.secondsLeft, PHASE_DURATION.ming_bian);
});
