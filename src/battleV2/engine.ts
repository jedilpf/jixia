/**
 * 战斗引擎 - v2.0 两层结算版
 *
 * 规则对齐：
 * - 卡牌类型仅保留：立论 / 策术
 * - 回合阶段：play_1 -> resolve_1 -> play_2 -> resolve_2
 * - 核心胜利条件：先到 8 大势
 */

import {
  ArenaId,
  BattleAction,
  BattlePlayer,
  CardTypeV2,
  DASHI_TARGET,
  DebateBattleState,
  DebateCard,
  DebatePhase,
  PlanSlot,
  PublicPlanInfo,
  PublicSubmitInfo,
  RevealData,
  RuleOp,
  SeatId,
  SeatUnit,
  Side,
  TargetableSlot,
} from './types';
import { ARENA_BY_ID } from './arena';
import { createStarterDeck } from './cards';
import { resolveCombat } from './laneSystem';

export const PHASE_DURATION: Record<Exclude<DebatePhase, 'finished'>, number> = {
  play_1: 40,
  resolve_1: 3,
  play_2: 40,
  resolve_2: 3,
};

const MAX_ROUNDS = 40;
const TOPIC_SELECTION_ROUND = 2;
const AI_SCORE_JITTER = 0.25;
const HAND_REFILL_TO = 5;

let unitSeq = 0;

export const SEAT_LABEL: Record<SeatId, string> = {
  zhu_yi: '主议',
  pang_yi: '旁议',
};

export const SLOT_CARD_RULES: Record<PlanSlot, CardTypeV2[]> = {
  layer1: ['立论', '策术'],
  layer2: ['立论', '策术'],
  writing: ['立论', '策术'],
};

export interface CreateBattleStateOptions {
  arenaId?: ArenaId;
  forcedTopicId?: string;
  playerLevel?: number;
  enemyLevel?: number;
  playerMainFaction?: string;
  enemyMainFaction?: string;
}

type AIEvalPhase = 'play_1' | 'play_2';

function makeLog(round: number, text: string) {
  return {
    id: `log-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    round,
    text,
    timestamp: Date.now(),
  };
}

function clonePlayer(player: BattlePlayer): BattlePlayer {
  return {
    ...player,
    resources: { ...player.resources },
    deck: [...player.deck],
    hand: [...player.hand],
    discard: [...player.discard],
    writings: [...player.writings],
    seats: {
      zhu_yi: {
        maxUnits: 3,
        units: player.seats.zhu_yi.units.map((unit) => ({ ...unit })),
      },
      pang_yi: {
        maxUnits: 3,
        units: player.seats.pang_yi.units.map((unit) => ({ ...unit })),
      },
    },
    plan: { ...player.plan },
    submitAction: player.submitAction ? { ...player.submitAction } : null,
    loadout: player.loadout
      ? {
          ...player.loadout,
          guestFactions: [...player.loadout.guestFactions],
        }
      : undefined,
  };
}

function cloneState(state: DebateBattleState): DebateBattleState {
  return {
    ...state,
    topicOptions: [...state.topicOptions],
    player: clonePlayer(state.player),
    enemy: clonePlayer(state.enemy),
    logs: [...state.logs],
    resolveFeed: [...state.resolveFeed],
    internalAudit: [...state.internalAudit],
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createInitialSeats(): BattlePlayer['seats'] {
  return {
    zhu_yi: { units: [], maxUnits: 3 },
    pang_yi: { units: [], maxUnits: 3 },
  };
}

export function getMaxCost(round: number): number {
  if (round <= 1) return 2;
  if (round === 2) return 3;
  if (round === 3) return 4;
  return 5;
}

function drawCards(player: BattlePlayer, count: number): void {
  for (let i = 0; i < count; i += 1) {
    if (player.deck.length === 0 && player.discard.length > 0) {
      player.deck = shuffleArray(player.discard.splice(0));
    }
    const card = player.deck.shift();
    if (card) player.hand.push(card);
  }
}

function getCardFromHand(player: BattlePlayer, cardId: string | null): DebateCard | null {
  if (!cardId) return null;
  return player.hand.find((card) => card.id === cardId) ?? null;
}

function getCardFromKnownZones(player: BattlePlayer, cardId: string | null): DebateCard | null {
  if (!cardId) return null;
  return (
    player.hand.find((card) => card.id === cardId)
    ?? player.discard.find((card) => card.id === cardId)
    ?? player.writings.find((card) => card.id === cardId)
    ?? null
  );
}

function getPlanRawCost(player: BattlePlayer, layer1CardId: string | null, layer2CardId: string | null): number {
  const layer1 = getCardFromKnownZones(player, layer1CardId);
  const layer2 = getCardFromKnownZones(player, layer2CardId);
  return (layer1?.cost ?? 0) + (layer2?.cost ?? 0);
}

function evaluatePlanCost(
  player: BattlePlayer,
  layer1CardId: string | null,
  layer2CardId: string | null,
): { valid: boolean; rawCost: number; usedCost: number } {
  const card1 = layer1CardId ? getCardFromHand(player, layer1CardId) : null;
  const card2 = layer2CardId ? getCardFromHand(player, layer2CardId) : null;

  const rawCost = (card1?.cost ?? 0) + (card2?.cost ?? 0);
  if (rawCost <= player.resources.cost) {
    return { valid: true, rawCost, usedCost: rawCost };
  }

  const canUseChou = player.resources.chou > 0 && rawCost - 1 <= player.resources.cost;
  if (canUseChou) {
    return { valid: true, rawCost, usedCost: rawCost - 1 };
  }

  return { valid: false, rawCost, usedCost: rawCost };
}

function consumeChouIfNeeded(player: BattlePlayer): void {
  const rawCost = getPlanRawCost(player, player.plan.layer1CardId, player.plan.layer2CardId);
  if (rawCost > player.plan.usedCost && player.resources.chou > 0) {
    player.resources.chou -= 1;
  }
}

function consumePlannedCard(player: BattlePlayer, cardId: string | null): DebateCard | null {
  if (!cardId) return null;

  const index = player.hand.findIndex((card) => card.id === cardId);
  if (index < 0) return null;

  const [card] = player.hand.splice(index, 1);
  // 立论在结算后以单位形式存在于议区，不应同时进入弃牌堆
  // 只有策术（不驻场的即时卡）才进入弃牌堆
  if (card.type !== '立论') {
    player.discard.push(card);
  }
  return card;
}

function chooseAIOffensiveSeat(target: BattlePlayer): SeatId {
  const zhuScore = target.seats.zhu_yi.units.reduce((sum, unit) => sum + unit.hp + unit.power, 0);
  const pangScore = target.seats.pang_yi.units.reduce((sum, unit) => sum + unit.hp + unit.power, 0);
  return zhuScore <= pangScore ? 'zhu_yi' : 'pang_yi';
}

function getCardRuleOps(card: DebateCard): RuleOp[] {
  if (card.rule?.ops?.length) {
    return card.rule.ops.filter((op) => Number.isFinite(op.value) && op.value > 0);
  }

  if (!card.effectKind || !card.effectValue || card.effectValue <= 0) {
    return [];
  }

  if (card.effectKind === 'damage') {
    return [{ op: 'damage', target: 'enemy', value: card.effectValue }];
  }
  if (card.effectKind === 'draw') {
    return [{ op: 'draw', target: 'self', value: card.effectValue }];
  }
  if (card.effectKind === 'heal') {
    return [{ op: 'shield', target: 'self', value: card.effectValue }];
  }

  return [];
}

function estimateCardThreat(card: DebateCard | null): number {
  if (!card) return 0;
  if (card.type === '立论') return card.power * 1.4 + card.hp;

  const ops = getCardRuleOps(card);
  let score = 0;
  for (const op of ops) {
    if (op.op === 'damage') score += op.value * 1.7;
    if (op.op === 'draw') score += op.value * 1.1;
    if (op.op === 'heal' || op.op === 'shield') score += op.value * 1.3;
    if (op.op === 'discard') score += op.value * 1.2;
  }
  if (score > 0) return score;

  return card.cost;
}

function evaluateAICard(card: DebateCard, state: DebateBattleState, phase: AIEvalPhase): number {
  // enemy = AI 自己, player = 人类对手
  const ai = state.enemy;
  const opponent = state.player;

  const aiBoardPower =
    ai.seats.zhu_yi.units.reduce((sum, unit) => sum + unit.power, 0)
    + ai.seats.pang_yi.units.reduce((sum, unit) => sum + unit.power, 0);
  const opponentBoardPower =
    opponent.seats.zhu_yi.units.reduce((sum, unit) => sum + unit.power, 0)
    + opponent.seats.pang_yi.units.reduce((sum, unit) => sum + unit.power, 0);

  let score = 0;

  if (card.type === '立论') {
    score = card.power * 2 + card.hp * 1.15;
    if (aiBoardPower <= opponentBoardPower) score += 1.4;
    if (card.cost <= 2) score += 0.4;
  } else {
    const ops = getCardRuleOps(card);
    if (ops.length === 0) {
      score = card.cost;
    } else {
      for (const op of ops) {
        if (op.op === 'damage') {
          // 评估 AI 伤害策术时，看对手场上的威胁（而非对手手牌）
          score += op.value * 2.2 + estimateCardThreat(getCardFromHand(opponent, opponent.plan.layer1CardId)) * 0.1;
          if (opponent.resources.dashi >= 6) score += 1.6;
        } else if (op.op === 'draw') {
          score += op.value * 1.5 + Math.max(0, 4 - ai.hand.length) * 0.8;
        } else if (op.op === 'heal' || op.op === 'shield') {
          score += op.value * 1.6 + (ai.resources.guyin <= 1 ? 0.9 : 0);
        } else if (op.op === 'discard') {
          score += op.value * 1.7;
        } else {
          score += card.cost * 0.5;
        }
      }
    }
  }

  if (phase === 'play_2') score += 0.25;
  score -= card.cost * 0.2;
  score += Math.random() * AI_SCORE_JITTER;

  return score;
}

function pickBestPlayableCard(playable: DebateCard[], state: DebateBattleState, phase: AIEvalPhase): DebateCard | null {
  if (playable.length === 0) return null;

  let best: DebateCard | null = null;
  let bestScore = -Infinity;

  for (const card of playable) {
    const score = evaluateAICard(card, state, phase);
    if (score > bestScore) {
      bestScore = score;
      best = card;
    }
  }

  return best;
}

function summonUnit(player: BattlePlayer, card: DebateCard, seatId: SeatId): boolean {
  const seat = player.seats[seatId];
  if (seat.units.length >= seat.maxUnits) return false;

  const unit: SeatUnit = {
    id: `unit-${unitSeq++}`,
    cardId: card.id,
    name: card.name,
    power: Math.max(1, card.power),
    hp: Math.max(1, card.hp),
    maxHp: Math.max(1, card.hp),
  };

  seat.units.push(unit);
  return true;
}

function applyDamageToSeat(
  target: BattlePlayer,
  seatId: SeatId,
  amount: number,
): { unitDamage: number; absorbedByGuyin: number; dashiPressure: number } {
  const seat = target.seats[seatId];
  let remain = Math.max(0, amount);
  let unitDamage = 0;

  while (remain > 0 && seat.units.length > 0) {
    const front = seat.units[0];
    const dealt = Math.min(front.hp, remain);
    front.hp -= dealt;
    unitDamage += dealt;
    remain -= dealt;
    if (front.hp <= 0) seat.units.shift();
  }

  const absorbedByGuyin = Math.min(target.resources.guyin, remain);
  target.resources.guyin -= absorbedByGuyin;
  remain -= absorbedByGuyin;

  const dashiPressure = remain > 0 ? Math.ceil(remain / 2) : 0;
  if (dashiPressure > 0) {
    target.resources.dashi = Math.max(0, target.resources.dashi - dashiPressure);
  }

  return {
    unitDamage,
    absorbedByGuyin,
    dashiPressure,
  };
}

function applySpellEffect(
  caster: BattlePlayer,
  target: BattlePlayer,
  card: DebateCard,
  targetSeat: SeatId,
  feed: string[],
  ownerLabel: string,
): void {
  const ops = getCardRuleOps(card);
  if (ops.length === 0) return;

  for (const op of ops) {
    if (op.op === 'damage') {
      const dealt = applyDamageToSeat(target, targetSeat, op.value);
      const chunks: string[] = [];
      if (dealt.unitDamage > 0) chunks.push(`席位伤害 ${dealt.unitDamage}`);
      if (dealt.absorbedByGuyin > 0) chunks.push(`护体吸收 ${dealt.absorbedByGuyin}`);
      if (dealt.dashiPressure > 0) chunks.push(`大势压制 ${dealt.dashiPressure}`);
      if (chunks.length === 0) chunks.push('未造成有效影响');
      feed.push(`${ownerLabel}【${card.name}】：${chunks.join('，')}`);
      continue;
    }

    if (op.op === 'draw') {
      drawCards(caster, op.value);
      feed.push(`${ownerLabel}【${card.name}】：抽 ${op.value} 张牌`);
      continue;
    }

    if (op.op === 'heal' || op.op === 'shield') {
      caster.resources.guyin += op.value;
      feed.push(`${ownerLabel}【${card.name}】：护体 +${op.value}`);
      continue;
    }

    if (op.op === 'discard') {
      const discardCount = Math.min(op.value, target.hand.length);
      if (discardCount <= 0) {
        feed.push(`${ownerLabel}【${card.name}】：对方无可弃手牌`);
        continue;
      }
      for (let i = 0; i < discardCount; i += 1) {
        const dropped = target.hand.shift();
        if (dropped) target.discard.push(dropped);
      }
      feed.push(`${ownerLabel}【${card.name}】：令对方弃 ${discardCount} 张牌`);
    }
  }
}

function resolveSingleCard(
  caster: BattlePlayer,
  target: BattlePlayer,
  card: DebateCard | null,
  targetSeat: SeatId,
  feed: string[],
  ownerLabel: string,
): void {
  if (!card) {
    feed.push(`${ownerLabel}：空过`);
    return;
  }

  if (card.type === '立论') {
    const success = summonUnit(caster, card, targetSeat);
    feed.push(
      success
        ? `${ownerLabel}【${card.name}】入驻${SEAT_LABEL[targetSeat]}`
        : `${ownerLabel}【${card.name}】入驻失败（${SEAT_LABEL[targetSeat]}已满）`,
    );
    return;
  }

  applySpellEffect(caster, target, card, targetSeat, feed, ownerLabel);
}

function resolveLayer(
  player: BattlePlayer,
  enemy: BattlePlayer,
  playerCardId: string | null,
  enemyCardId: string | null,
  playerSeat: SeatId,
  enemySeat: SeatId,
  feed: string[],
  layerLabel: string,
): void {
  const playerCard = getCardFromHand(player, playerCardId);
  const enemyCard = getCardFromHand(enemy, enemyCardId);

  resolveSingleCard(player, enemy, playerCard, playerSeat, feed, `我方${layerLabel}`);
  resolveSingleCard(enemy, player, enemyCard, enemySeat, feed, `敌方${layerLabel}`);

  consumePlannedCard(player, playerCardId);
  consumePlannedCard(enemy, enemyCardId);
}

function checkVictory(state: DebateBattleState): Side | 'draw' | null {
  if (state.player.resources.dashi >= DASHI_TARGET) return 'player';
  if (state.enemy.resources.dashi >= DASHI_TARGET) return 'enemy';

  if (state.round >= MAX_ROUNDS) {
    if (state.player.resources.dashi > state.enemy.resources.dashi) return 'player';
    if (state.enemy.resources.dashi > state.player.resources.dashi) return 'enemy';
    return 'draw';
  }

  return null;
}

function resolveLayerByKey(state: DebateBattleState, layer: 'layer1' | 'layer2'): DebateBattleState {
  const next = cloneState(state);
  const feed: string[] = [];

  if (layer === 'layer1') {
    resolveLayer(
      next.player,
      next.enemy,
      next.player.plan.layer1CardId,
      next.enemy.plan.layer1CardId,
      next.player.plan.layer1TargetSeat,
      next.enemy.plan.layer1TargetSeat,
      feed,
      '第一手',
    );
  } else {
    resolveLayer(
      next.player,
      next.enemy,
      next.player.plan.layer2CardId,
      next.enemy.plan.layer2CardId,
      next.player.plan.layer2TargetSeat,
      next.enemy.plan.layer2TargetSeat,
      feed,
      '第二手',
    );
  }

  next.resolveFeed = feed;
  next.logs.push(...feed.map((text) => makeLog(next.round, text)));

  // Bug #5 fix: 在每次 layer 结算后立即检查胜利，避免策术等效果达成胜利条件后游戏继续
  const layerWinner = checkVictory(next);
  if (layerWinner) {
    next.phase = 'finished';
    next.winner = layerWinner;
    next.secondsLeft = 0;
    return next;
  }

  return next;
}

function finalizeRound(state: DebateBattleState): DebateBattleState {
  const next = cloneState(state);

  consumeChouIfNeeded(next.player);
  consumeChouIfNeeded(next.enemy);

  const laneResult = resolveCombat(next);
  laneResult.summary.forEach((line) => {
    next.logs.push(makeLog(next.round, line));
  });

  const winner = checkVictory(next);
  if (winner) {
    next.phase = 'finished';
    next.winner = winner;
    next.secondsLeft = 0;
    return next;
  }

  const nextRound = next.round + 1;
  const nextMaxCost = getMaxCost(nextRound);

  next.round = nextRound;
  next.phase = 'play_1';
  next.secondsLeft = PHASE_DURATION.play_1;
  next.resolveFeed = [];

  next.player.resources.maxCost = nextMaxCost;
  next.player.resources.cost = nextMaxCost;
  next.enemy.resources.maxCost = nextMaxCost;
  next.enemy.resources.cost = nextMaxCost;

  next.player.plan = {
    layer1CardId: null,
    layer2CardId: null,
    writingCardId: null,
    layer1TargetSeat: 'zhu_yi',
    layer2TargetSeat: 'pang_yi',
    usedCost: 0,
    lockedLayer1: false,
    lockedLayer2: false,
  };

  next.enemy.plan = {
    layer1CardId: null,
    layer2CardId: null,
    writingCardId: null,
    layer1TargetSeat: 'zhu_yi',
    layer2TargetSeat: 'pang_yi',
    usedCost: 0,
    lockedLayer1: false,
    lockedLayer2: false,
  };

  drawCards(next.player, Math.max(0, HAND_REFILL_TO - next.player.hand.length));
  drawCards(next.enemy, Math.max(0, HAND_REFILL_TO - next.enemy.hand.length));

  return next;
}

function lockLayerIfNeeded(state: DebateBattleState): DebateBattleState {
  const next = cloneState(state);

  if (next.phase === 'play_1') {
    next.player.plan.lockedLayer1 = true;
    next.enemy.plan.lockedLayer1 = true;
    return next;
  }

  if (next.phase === 'play_2') {
    next.player.plan.lockedLayer2 = true;
    next.enemy.plan.lockedLayer2 = true;
    return next;
  }

  return next;
}

function advancePhase(state: DebateBattleState): DebateBattleState {
  if (state.phase === 'finished') return state;

  if (state.phase === 'play_1') {
    const locked = lockLayerIfNeeded(state);
    const resolved = resolveLayerByKey(locked, 'layer1');
    resolved.phase = 'resolve_1';
    resolved.secondsLeft = PHASE_DURATION.resolve_1;
    return resolved;
  }

  if (state.phase === 'resolve_1') {
    return {
      ...state,
      phase: 'play_2',
      secondsLeft: PHASE_DURATION.play_2,
      resolveFeed: [],
    };
  }

  if (state.phase === 'play_2') {
    const locked = lockLayerIfNeeded(state);
    const resolved = resolveLayerByKey(locked, 'layer2');
    resolved.phase = 'resolve_2';
    resolved.secondsLeft = PHASE_DURATION.resolve_2;
    return resolved;
  }

  if (state.phase === 'resolve_2') {
    return finalizeRound(state);
  }

  return state;
}

function aiAutoPlan(state: DebateBattleState): DebateBattleState {
  const next = cloneState(state);
  const enemy = next.enemy;

  if (next.phase === 'play_1' && !enemy.plan.lockedLayer1) {
    const playable = enemy.hand.filter((card) => card.cost <= enemy.resources.cost);
    const picked = pickBestPlayableCard(playable, next, 'play_1');

    if (picked) {
      enemy.plan.layer1CardId = picked.id;
      enemy.plan.layer1TargetSeat = chooseAIOffensiveSeat(next.player);
      const costEval = evaluatePlanCost(enemy, enemy.plan.layer1CardId, enemy.plan.layer2CardId);
      enemy.plan.usedCost = costEval.usedCost;
    }

    enemy.plan.lockedLayer1 = true;
    return next;
  }

  if (next.phase === 'play_2' && !enemy.plan.lockedLayer2) {
    const playable = enemy.hand.filter((card) => {
      if (card.id === enemy.plan.layer1CardId) return false;
      const costEval = evaluatePlanCost(enemy, enemy.plan.layer1CardId, card.id);
      return costEval.valid;
    });

    const picked = pickBestPlayableCard(playable, next, 'play_2');

    if (picked) {
      enemy.plan.layer2CardId = picked.id;
      enemy.plan.layer2TargetSeat = chooseAIOffensiveSeat(next.player);
      const costEval = evaluatePlanCost(enemy, enemy.plan.layer1CardId, enemy.plan.layer2CardId);
      enemy.plan.usedCost = costEval.usedCost;
    }

    enemy.plan.lockedLayer2 = true;
    return next;
  }

  return next;
}

function canAdvanceFromCurrentPlayPhase(state: DebateBattleState): boolean {
  if (state.phase === 'play_1') {
    return state.player.plan.lockedLayer1 && state.enemy.plan.lockedLayer1;
  }
  if (state.phase === 'play_2') {
    return state.player.plan.lockedLayer2 && state.enemy.plan.lockedLayer2;
  }
  return false;
}

function createPlayer(side: Side, name: string): BattlePlayer {
  const deck = createStarterDeck(side, { useFullCardPool: true });
  const initialCost = getMaxCost(1);

  return {
    side,
    name,
    resources: {
      cost: initialCost,
      maxCost: initialCost,
      dashi: 0,
      chou: 0,
      guyin: 0,
    },
    deck: shuffleArray(deck),
    hand: [],
    discard: [],
    writings: [],
    seats: createInitialSeats(),
    plan: {
      layer1CardId: null,
      layer2CardId: null,
      writingCardId: null,
      layer1TargetSeat: 'zhu_yi',
      layer2TargetSeat: 'pang_yi',
      usedCost: 0,
      lockedLayer1: false,
      lockedLayer2: false,
    },
    gold: 0,
    submitAction: null,
  };
}

export function createInitialBattleState(options?: CreateBattleStateOptions): DebateBattleState {
  const arenaId = options?.arenaId ?? 'jixia';
  const arena = ARENA_BY_ID[arenaId];

  const player = createPlayer('player', '我方');
  const enemy = createPlayer('enemy', '敌方');

  drawCards(player, HAND_REFILL_TO);
  drawCards(enemy, HAND_REFILL_TO);

  return {
    round: 1,
    maxRounds: MAX_ROUNDS,
    phase: 'play_1',
    secondsLeft: PHASE_DURATION.play_1,
    activeTopicId: options?.forcedTopicId ?? null,
    activeTopic: '',
    topicSelectionPending: false,
    topicSelectionRound: TOPIC_SELECTION_ROUND,
    topicSelectionSecondsLeft: null,
    topicOptions: [],
    arenaId,
    arenaName: arena?.name ?? '稷下学宫',
    player,
    enemy,
    logs: [makeLog(1, '战斗开始：进入第一手出牌')],
    resolveFeed: [],
    internalAudit: [],
    winner: null,
  };
}

function handlePlanCard(state: DebateBattleState, slot: PlanSlot, cardId: string | null): DebateBattleState {
  if (slot !== 'layer1' && slot !== 'layer2') return state;

  const next = cloneState(state);
  const player = next.player;

  if (slot === 'layer1' && next.phase !== 'play_1') return state;
  if (slot === 'layer2' && next.phase !== 'play_2') return state;
  if (slot === 'layer1' && player.plan.lockedLayer1) return state;
  if (slot === 'layer2' && player.plan.lockedLayer2) return state;

  if (cardId && !player.hand.some((card) => card.id === cardId)) return state;
  if (cardId && slot === 'layer1' && player.plan.layer2CardId === cardId) return state;
  if (cardId && slot === 'layer2' && player.plan.layer1CardId === cardId) return state;

  // Bug #4 fix: 出牌时验证目标议区容量
  if (cardId) {
    const targetSeat = slot === 'layer1' ? player.plan.layer1TargetSeat : player.plan.layer2TargetSeat;
    const seat = player.seats[targetSeat];
    const existingUnits = seat.units.length;
    const otherLayerHasCard = slot === 'layer1'
      ? Boolean(player.plan.layer2CardId)
      : Boolean(player.plan.layer1CardId);
    const otherLayerTargetSameSeat = (slot === 'layer1' && player.plan.layer2TargetSeat === targetSeat)
      || (slot === 'layer2' && player.plan.layer1TargetSeat === targetSeat);
    const otherLayerCount = (otherLayerHasCard && otherLayerTargetSameSeat) ? 1 : 0;
    if (existingUnits + 1 + otherLayerCount > seat.maxUnits) {
      return state; // 议区已满，拒绝出牌
    }
  }

  if (slot === 'layer1') player.plan.layer1CardId = cardId;
  if (slot === 'layer2') player.plan.layer2CardId = cardId;

  // 策术立即触发：出牌时立即执行效果，不等待结算阶段
  if (cardId) {
    const card = getCardFromHand(player, cardId);
    if (card?.type === '策术') {
      const targetSeat = slot === 'layer1' ? player.plan.layer1TargetSeat : player.plan.layer2TargetSeat;
      const spellFeed: string[] = [];
      applySpellEffect(player, next.enemy, card, targetSeat, spellFeed, '我方');
      next.logs.push(...spellFeed.map((text) => makeLog(next.round, text)));
    }
  }

  const costEval = evaluatePlanCost(player, player.plan.layer1CardId, player.plan.layer2CardId);
  if (!costEval.valid) return state;

  player.plan.usedCost = costEval.usedCost;
  return next;
}

function handleSetTargetSeat(state: DebateBattleState, slot: TargetableSlot, seatId: SeatId): DebateBattleState {
  const next = cloneState(state);
  const player = next.player;

  // Bug #4 fix: 议区容量验证 - 检查目标议区是否已满
  // 计算在计划阶段该议区将承载的卡牌数（含已计划的 layer1/layer2）
  const existingCount = player.seats[seatId].units.length;
  const layer1Count = player.plan.layer1CardId ? 1 : 0;
  const layer2Count = player.plan.layer2CardId ? 1 : 0;
  // 当前变更的 layer 不应计入（尚未确定），其他 layer 的计入
  const otherLayerCount = slot === 'layer1' ? layer2Count : layer1Count;
  const maxUnits = player.seats[seatId].maxUnits;
  if (existingCount + otherLayerCount + 1 > maxUnits) {
    // 议区已满，拒绝变更目标
    return state;
  }

  if (slot === 'layer1') {
    next.player.plan.layer1TargetSeat = seatId;
  } else {
    next.player.plan.layer2TargetSeat = seatId;
  }

  return next;
}

export function battleReducer(state: DebateBattleState, action: BattleAction): DebateBattleState {
  switch (action.type) {
    case 'TICK': {
      if (state.phase === 'finished') return state;
      // Bug #8 fix: 在 play_1/play_2 阶段，倒计时归零时也要检查双方是否都已锁定，
      // 只有双方都锁定（或有一方超时）才能推进阶段，避免单方面强制推进
      if (state.secondsLeft <= 1) {
        if (canAdvanceFromCurrentPlayPhase(state)) {
          return advancePhase(state);
        }
        // 一方未锁定但倒计时已到，强制锁定当前玩家的规划并推进
        const next = cloneState(state);
        if (next.phase === 'play_1' && !next.player.plan.lockedLayer1) {
          next.player.plan.lockedLayer1 = true;
        }
        if (next.phase === 'play_2' && !next.player.plan.lockedLayer2) {
          next.player.plan.lockedLayer2 = true;
        }
        if (canAdvanceFromCurrentPlayPhase(next)) {
          return advancePhase(next);
        }
        return next;
      }
      return {
        ...state,
        secondsLeft: state.secondsLeft - 1,
      };
    }

    case 'SELECT_TOPIC': {
      return {
        ...state,
        activeTopicId: action.topicId,
        activeTopic: action.topicId,
        topicSelectionPending: false,
        topicSelectionSecondsLeft: null,
      };
    }

    case 'PLAN_CARD':
      return handlePlanCard(state, action.slot, action.cardId);

    case 'PLAN_WRITING': {
      const next = cloneState(state);
      if (action.cardId && !next.player.hand.some((card) => card.id === action.cardId)) {
        return state;
      }
      next.player.plan.writingCardId = action.cardId;
      return next;
    }

    case 'SET_TARGET_SEAT':
      return handleSetTargetSeat(state, action.slot, action.seatId);

    case 'LOCK_LAYER1': {
      if (state.phase !== 'play_1') return state;
      const next = cloneState(state);
      next.player.plan.lockedLayer1 = true;
      if (canAdvanceFromCurrentPlayPhase(next)) {
        return advancePhase(next);
      }
      return next;
    }

    case 'LOCK_LAYER2': {
      if (state.phase !== 'play_2') return state;
      const next = cloneState(state);
      next.player.plan.lockedLayer2 = true;
      if (canAdvanceFromCurrentPlayPhase(next)) {
        return advancePhase(next);
      }
      return next;
    }

    case 'CANCEL_LAYER1': {
      // 取消 Layer1 出牌：只能取消未锁定的规划
      if (state.phase !== 'play_1' && state.phase !== 'play_2') return state;
      if (state.player.plan.lockedLayer1) return state;
      if (!state.player.plan.layer1CardId) return state;

      const next = cloneState(state);
      const player = next.player;

      // 重算 usedCost（只考虑 Layer2）
      const costEval = evaluatePlanCost(player, null, player.plan.layer2CardId);
      player.plan.layer1CardId = null;
      player.plan.layer1TargetSeat = 'zhu_yi';
      player.plan.usedCost = costEval.usedCost;
      return next;
    }

    case 'CANCEL_LAYER2': {
      // 取消 Layer2 出牌：只能取消未锁定的规划
      if (state.phase !== 'play_1' && state.phase !== 'play_2') return state;
      if (state.player.plan.lockedLayer2) return state;
      if (!state.player.plan.layer2CardId) return state;

      const next = cloneState(state);
      const player = next.player;

      // 重算 usedCost（只考虑 Layer1）
      const costEval = evaluatePlanCost(player, player.plan.layer1CardId, null);
      player.plan.layer2CardId = null;
      player.plan.layer2TargetSeat = 'pang_yi';
      player.plan.usedCost = costEval.usedCost;
      return next;
    }

    case 'AI_AUTO_PLAN': {
      const next = aiAutoPlan(state);
      if (canAdvanceFromCurrentPlayPhase(next)) {
        return advancePhase(next);
      }
      return next;
    }

    case 'ADVANCE_PHASE':
      return advancePhase(state);

    case 'SUBMIT_CARD':
    case 'PASS':
    case 'CONFIRM_SUBMIT':
    case 'AI_AUTO_SUBMIT':
      return state;

    default:
      return state;
  }
}

export function getPublicSubmitInfo(player: BattlePlayer): PublicSubmitInfo {
  return {
    submitted: player.plan.lockedLayer1 || player.plan.lockedLayer2,
    zone: null,
    hasUsedToken: false,
  };
}

export function getRevealData(_state: DebateBattleState): RevealData | null {
  return null;
}

export function getPublicPlanInfo(player: BattlePlayer): PublicPlanInfo {
  return {
    hasLayer1Card: Boolean(player.plan.layer1CardId),
    hasLayer2Card: Boolean(player.plan.layer2CardId),
    hasWritingCard: Boolean(player.plan.writingCardId),
    layer1TargetSeat: player.plan.layer1TargetSeat,
    layer2TargetSeat: player.plan.layer2TargetSeat,
    lockedLayer1: player.plan.lockedLayer1,
    lockedLayer2: player.plan.lockedLayer2,
    handCount: player.hand.length,
    writingCount: player.writings.length,
  };
}

export function getPlayerPlannedCardIds(player: BattlePlayer): { layer1: string | null; layer2: string | null } {
  return {
    layer1: player.plan.layer1CardId,
    layer2: player.plan.layer2CardId,
  };
}

export function getCurrentPhaseActionHint(phase: DebatePhase): { canPlan: boolean; slot: PlanSlot | null } {
  if (phase === 'play_1') return { canPlan: true, slot: 'layer1' };
  if (phase === 'play_2') return { canPlan: true, slot: 'layer2' };
  return { canPlan: false, slot: null };
}
