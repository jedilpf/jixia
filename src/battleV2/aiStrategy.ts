/**
 * 智能AI决策系统
 *
 * 策略维度：
 * 1. 卡牌价值评估 - 根据效果类型、数值、费用计算
 * 2. 目标选择策略 - 根据敌方布阵选择最优目标
 * 3. 资源管理 - 灵石/筹的最优分配
 * 4. 局势评估 - 大势差距、场面优势
 */

import type { DebateBattleState, BattlePlayer, DebateCard, SeatId, Zone, EffectKind } from './types';

// 卡牌价值权重
const CARD_VALUE_WEIGHTS: Record<EffectKind, number> = {
  damage: 1.2,      // 伤害优先
  shield: 0.8,      // 护盾次之
  draw: 1.0,        // 抽牌中等
  zhengli: 0.9,     // 证立（增益）
  shixu: 0.7,       // 实虚
  summon_front: 1.1, // 召唤前排
  summon_back: 0.9,  // 召唤后排
};

// 议区优先级（攻击目标选择）
const SEAT_PRIORITY: Record<SeatId, number> = {
  zhu_yi: 2,    // 主议最重要（决定大势）
  pang_yi: 1,   // 旁议次之（获得筹）
};

/**
 * 评估单张卡牌价值
 */
export function evaluateCardValue(card: DebateCard, state: DebateBattleState, side: 'player' | 'enemy'): number {
  const baseValue = card.effectValue * (CARD_VALUE_WEIGHTS[card.effectKind] || 1.0);

  // 费效比
  const costEfficiency = baseValue / Math.max(1, card.cost);

  // 类型加成
  let typeBonus = 0;
  switch (card.type) {
    case '立论':
      typeBonus = 10; // 主战牌
      break;
    case '反诘':
      typeBonus = 8; // 反制牌
      break;
    case '策术':
      typeBonus = 6; // 辅助牌
      break;
    case '门客':
      typeBonus = card.power && card.hp ? card.power + card.hp : 7;
      break;
    case '玄章':
      typeBonus = 5;
      break;
  }

  // 大势加急 - 如果我方大势落后，优先攻击牌
  const myDaShi = side === 'player' ? state.player.resources.daShi : state.enemy.resources.daShi;
  const enemyDaShi = side === 'player' ? state.enemy.resources.daShi : state.player.resources.daShi;
  const dashiUrgency = (enemyDaShi - myDaShi) * 5;

  // 低血量优先治疗/护盾
  let hpBonus = 0;
  if (card.effectKind === 'shield') {
    const mySeats = side === 'player' ? state.player.seats : state.enemy.seats;
    let totalHp = 0;
    for (const seatId of ['zhu_yi', 'pang_yi'] as const) {
      const seat = mySeats[seatId];
      totalHp += (seat.front?.hp || 0) + (seat.back?.hp || 0);
    }
    if (totalHp < 10) hpBonus = 15; // 血量低时护盾优先
  }

  return costEfficiency * 10 + typeBonus + dashiUrgency + hpBonus;
}

/**
 * 选择最优攻击目标
 */
export function chooseBestTarget(
  player: BattlePlayer,
  card: DebateCard
): SeatId {
  const seats = player.seats;

  // 评估每个议区的价值
  const seatScores: Array<{ seat: SeatId; score: number }> = [];

  for (const seatId of ['zhu_yi', 'pang_yi'] as const) {
    const seat = seats[seatId];
    let score = SEAT_PRIORITY[seatId];

    // 如果有单位，评估击杀潜力
    if (seat.front && card.effectKind === 'damage') {
      const killPotential = seat.front.hp <= card.effectValue ? 20 : 0;
      score += killPotential;
    }

    // 后排单位更脆弱
    if (seat.back) {
      score += 5;
    }

    seatScores.push({ seat: seatId, score });
  }

  // 返回得分最高的议区
  seatScores.sort((a, b) => b.score - a.score);
  return seatScores[0].seat;
}

/**
 * AI明辩阶段策略
 */
export function aiPlanMingBianStrategy(state: DebateBattleState): {
  mainCard: DebateCard | null;
  responseCard: DebateCard | null;
  targetSeat: SeatId | null;
  writingCard: DebateCard | null;
} {
  const enemy = state.enemy;
  const budget = enemy.resources.lingShi;
  const hand = enemy.hand;

  // 评估所有可用的卡牌
  const cardEvaluations = hand
    .filter(card => card.cost <= budget)
    .map(card => ({
      card,
      value: evaluateCardValue(card, state, 'enemy'),
    }))
    .sort((a, b) => b.value - a.value);

  if (cardEvaluations.length === 0) {
    return { mainCard: null, responseCard: null, targetSeat: null, writingCard: null };
  }

  // 选择主牌（立论优先，然后是最高价值的牌）
  const mainCandidate = cardEvaluations.find(e => e.card.type === '立论') || cardEvaluations[0];
  let remainingBudget = budget - mainCandidate.card.cost;

  // 选择响应牌（反诘优先）
  const responseCandidates = cardEvaluations.filter(e =>
    e.card !== mainCandidate.card &&
    e.card.cost <= remainingBudget &&
    e.card.type === '反诘'
  );
  const responseCard = responseCandidates[0]?.card || null;
  if (responseCard) {
    remainingBudget -= responseCard.cost;
  }

  // 选择著作牌（如果资源充足）
  const writingCandidate = remainingBudget >= 2
    ? cardEvaluations.find(e =>
        e.card !== mainCandidate.card &&
        e.card !== responseCard &&
        e.card.type === '玄章'
      )?.card || null
    : null;

  // 选择目标
  const targetSeat = mainCandidate.card.effectKind === 'damage'
    ? chooseBestTarget(state.player, mainCandidate.card)
    : 'zhu_yi'; // 非伤害牌默认打主议位

  return {
    mainCard: mainCandidate.card,
    responseCard,
    targetSeat,
    writingCard: writingCandidate,
  };
}

/**
 * AI暗谋阶段策略
 */
export function aiPlanAnMouStrategy(state: DebateBattleState): {
  secretCard: DebateCard | null;
  targetSeat: SeatId | null;
} {
  const enemy = state.enemy;
  const usedLingShi = enemy.plan.usedLingShi;
  const remainingBudget = enemy.resources.lingShi - usedLingShi;

  // 选择暗牌（策术和反诘优先）
  const secretCandidates = enemy.hand
    .filter(card => card.cost <= remainingBudget)
    .filter(card => card.type === '策术' || card.type === '反诘' || card.type === '门客')
    .map(card => ({
      card,
      value: evaluateCardValue(card, state, 'enemy'),
    }))
    .sort((a, b) => b.value - a.value);

  if (secretCandidates.length === 0) {
    return { secretCard: null, targetSeat: null };
  }

  const secretCard = secretCandidates[0].card;
  const targetSeat = secretCard.effectKind === 'damage'
    ? chooseBestTarget(state.player, secretCard)
    : 'zhu_yi';

  return { secretCard, targetSeat };
}

/**
 * AI提交阶段策略
 */
export function aiSubmitStrategy(state: DebateBattleState): {
  type: 'play_card' | 'pass';
  cardId: string | null;
  zone: Zone | null;
  useToken: boolean;
} {
  const enemy = state.enemy;
  const budget = enemy.resources.lingShi;

  // 评估所有可打出的牌
  const playableCards = enemy.hand
    .filter(card => card.cost <= budget)
    .map(card => ({
      card,
      value: evaluateCardValue(card, state, 'enemy'),
    }))
    .sort((a, b) => b.value - a.value);

  // 如果没有可打出的牌，或者局势明显劣势选择空过
  const myDaShi = enemy.resources.daShi;
  const playerDaShi = state.player.resources.daShi;

  if (playableCards.length === 0) {
    return { type: 'pass', cardId: null, zone: null, useToken: false };
  }

  // 大势领先时更保守
  if (myDaShi > playerDaShi + 2 && Math.random() < 0.3) {
    return { type: 'pass', cardId: null, zone: null, useToken: false };
  }

  // 选择最优卡牌
  const bestCard = playableCards[0].card;

  // 选择最优区域
  let zone: Zone = 'main';
  if (bestCard.type === '策术' || bestCard.type === '门客') {
    zone = 'side';
  } else if (bestCard.type === '玄章') {
    zone = 'prep';
  } else if (bestCard.lanePreference) {
    // 根据卡牌的三路偏好选择
    zone = bestCard.lanePreference === 'left' ? 'side' : 'main';
  }

  // 决定是否使用筹
  const useToken = enemy.resources.chou > 0 && (
    bestCard.cost > budget - 1 || // 资源紧张
    bestCard.starTier === 3       // 高星牌值得减费
  );

  return {
    type: 'play_card',
    cardId: bestCard.id,
    zone,
    useToken,
  };
}

/**
 * 获取AI难度系数
 * 用于调整AI决策的随机性
 */
export function getAIDifficultyModifier(mode: 'novice' | 'normal' | 'expert'): number {
  switch (mode) {
    case 'novice':
      return 0.6; // 40%概率做出次优选择
    case 'normal':
      return 0.85; // 15%概率做出次优选择
    case 'expert':
      return 1.0; // 总是做出最优选择
    default:
      return 0.85;
  }
}