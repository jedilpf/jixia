/**
 * AI策略辅助函数（v2.0）
 *
 * 对齐两层出牌：play_1 / play_2
 */

import type { BattlePlayer, DebateBattleState, DebateCard, SeatId } from './types';

function seatDurability(player: BattlePlayer, seatId: SeatId): number {
  return player.seats[seatId].units.reduce((sum, unit) => sum + unit.hp + unit.power, 0);
}

function chooseOffensiveSeat(defender: BattlePlayer): SeatId {
  return seatDurability(defender, 'zhu_yi') <= seatDurability(defender, 'pang_yi') ? 'zhu_yi' : 'pang_yi';
}

export function aiPlanLayer1Strategy(state: DebateBattleState): {
  layer1Card: DebateCard | null;
  targetSeat: SeatId;
} {
  const enemy = state.enemy;
  const budget = enemy.resources.cost;
  const playable = enemy.hand.filter((card) => card.cost <= budget);

  if (playable.length === 0) {
    return { layer1Card: null, targetSeat: 'zhu_yi' };
  }

  const layer1Card = [...playable].sort((a, b) => evaluateCardValue(b) - evaluateCardValue(a))[0];
  const targetSeat = chooseOffensiveSeat(state.player);
  return { layer1Card, targetSeat };
}

export function aiPlanLayer2Strategy(state: DebateBattleState): {
  layer2Card: DebateCard | null;
  targetSeat: SeatId;
} {
  const enemy = state.enemy;
  const playable = enemy.hand.filter((card) => {
    if (card.id === enemy.plan.layer1CardId) return false;
    const raw = (enemy.hand.find((c) => c.id === enemy.plan.layer1CardId)?.cost ?? 0) + card.cost;
    return raw <= enemy.resources.cost || (raw - 1 <= enemy.resources.cost && enemy.resources.chou > 0);
  });

  if (playable.length === 0) {
    return { layer2Card: null, targetSeat: 'pang_yi' };
  }

  const layer2Card = [...playable].sort((a, b) => evaluateCardValue(b) - evaluateCardValue(a))[0];
  const targetSeat = chooseOffensiveSeat(state.player);
  return { layer2Card, targetSeat };
}

export function evaluateCardValue(card: DebateCard): number {
  if (card.type === '立论') {
    return card.power * 2 + card.hp;
  }

  if (card.effectKind === 'damage') return (card.effectValue ?? 0) * 2;
  if (card.effectKind === 'draw') return (card.effectValue ?? 0) * 1.4;
  if (card.effectKind === 'heal') return (card.effectValue ?? 0) * 1.5;
  return card.cost;
}

export function chooseBestTarget(player: BattlePlayer): SeatId {
  return chooseOffensiveSeat(player);
}

export function getAIDifficultyModifier(mode: 'novice' | 'normal' | 'expert'): number {
  switch (mode) {
    case 'novice':
      return 0.65;
    case 'normal':
      return 0.85;
    case 'expert':
      return 1;
    default:
      return 0.85;
  }
}
