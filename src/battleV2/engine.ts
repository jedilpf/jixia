import { ARENA_BY_ID } from './arena';
import { CreateStarterDeckOptions, createStarterDeck, rollGuestFactions } from './cards';
import { CORE_FACTION_NAMES, FRAMEWORK_FACTION_BY_NAME, pickSceneBiasFromRoutePreference, toFrameworkFactionName } from './factions';
import {
  ArenaId,
  BattleAction,
  BattleLog,
  BattlePlayer,
  CardTypeV2,
  DebateBattleState,
  DebateCard,
  DebatePhase,
  PlanSlot,
  Resources,
  SeatId,
  SeatState,
  SeatUnit,
  Side,
  TargetableSlot,
} from './types';
import {
  calculateAllLaneControls,
  applyLaneRewards,
  LANE_NAMES,
} from './laneSystem';

export const PHASE_DURATION: Record<Exclude<DebatePhase, 'finished'>, number> = {
  ming_bian: 25,
  an_mou: 25,
  reveal: 3,
  resolve: 6,
};

export const SEAT_LABEL: Record<SeatId, string> = {
  xian_sheng: '先声席',
  zhu_bian: '主辩席',
  yu_lun: '余论席',
};

export const SLOT_CARD_RULES: Record<PlanSlot, CardTypeV2[]> = {
  main: ['立论', '策术', '门客', '玄章'],
  response: ['反诘', '策术'],
  secret: ['立论', '策术', '反诘'],
};

export interface CreateBattleStateOptions {
  arenaId?: ArenaId;
  useFactionFramework?: boolean;
  playerMainFaction?: string;
  enemyMainFaction?: string;
  playerGuestFactions?: string[];
  enemyGuestFactions?: string[];
}

const ALL_SEATS: SeatId[] = ['xian_sheng', 'zhu_bian', 'yu_lun'];
const MAX_ROUNDS = 99;            // 无固定回合上限，以血量归零结束
const HERO_MAX_XIN_ZHENG = 20;    // 主辩者初始心证
const TOPICS = ['守成与变法，何者先行？', '法先于德，还是德先于法？', '速胜与久治，孰为上策？'];

let logSeq = 0;
let unitSeq = 0;

interface ResolveContext {
  owner: BattlePlayer;
  rival: BattlePlayer;
  card: DebateCard | null;
  round: number;
  logs: BattleLog[];
  feed: string[];
  layerLabel: string;
  targetSeat?: SeatId;
  damageModifier?: number;
  arenaId: ArenaId;
}

function makeLog(round: number, text: string): BattleLog {
  logSeq += 1;
  return { id: `log-${logSeq}`, round, text };
}

function cloneSeatState(): Record<SeatId, SeatState> {
  return {
    xian_sheng: { front: null, back: null },
    zhu_bian: { front: null, back: null },
    yu_lun: { front: null, back: null },
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function drawCards(player: BattlePlayer, count: number): void {
  for (let i = 0; i < count; i += 1) {
    // If deck is empty, shuffle discard back in
    if (player.deck.length === 0 && player.discard.length > 0) {
      player.deck = shuffleArray(player.discard.splice(0));
    }
    const card = player.deck.shift();
    if (!card) {
      // Both deck and discard are exhausted — minor penalty
      player.resources.shiXu += 1;
      continue;
    }
    player.hand.push(card);
  }
}

function buildInitialResources(initialHuYin: number): Resources {
  return {
    xinZheng: HERO_MAX_XIN_ZHENG,
    lingShi: 3,
    maxLingShi: 3,
    huYin: initialHuYin,
    zhengLi: 0,
    shiXu: 0,
    wenMai: 0,
    jiBian: 0,  // 机变（右路奖励）
  };
}

function createPlayer(
  side: Side,
  name: string,
  initialHuYin: number,
  deckOptions?: CreateStarterDeckOptions
): BattlePlayer {
  const deck = createStarterDeck(side, deckOptions);
  const mainFaction = deckOptions?.mainFaction ? toFrameworkFactionName(deckOptions.mainFaction) : null;
  const guestFactions = (deckOptions?.guestFactions ?? []).map((f) => toFrameworkFactionName(f));
  const routePreference = mainFaction ? FRAMEWORK_FACTION_BY_NAME[mainFaction]?.routePreference : '';
  const sceneBias = pickSceneBiasFromRoutePreference(routePreference ?? '');

  const player: BattlePlayer = {
    side,
    name,
    resources: buildInitialResources(initialHuYin),
    deck,
    hand: [],
    discard: [],
    writings: [],
    seats: cloneSeatState(),
    loadout: mainFaction
      ? {
          mainFaction,
          guestFactions,
          sceneBias,
        }
      : undefined,
    plan: {
      mainCardId: null,
      responseCardId: null,
      secretCardId: null,
      writingCardId: null,
      mainTargetSeat: 'zhu_bian',
      secretTargetSeat: 'zhu_bian',
      usedLingShi: 0,
      lockedPublic: false,
      lockedSecret: false,
    },
  };
  drawCards(player, 5);
  return player;
}

function pickTopic(): string {
  return TOPICS[Math.floor(Math.random() * TOPICS.length)] ?? TOPICS[0];
}

export function createInitialBattleState(options?: CreateBattleStateOptions): DebateBattleState {
  const arenaId = options?.arenaId ?? 'jixia';
  const arena = ARENA_BY_ID[arenaId];
  const initialHuYin = arenaId === 'jixia' ? 1 : 0;
  const useFactionFramework = options?.useFactionFramework ?? true;

  const playerMainFaction = toFrameworkFactionName(options?.playerMainFaction ?? CORE_FACTION_NAMES[0]);
  const enemyMainFaction = toFrameworkFactionName(options?.enemyMainFaction ?? CORE_FACTION_NAMES[2] ?? CORE_FACTION_NAMES[0]);
  const playerGuestFactions = options?.playerGuestFactions?.map((f) => toFrameworkFactionName(f))
    ?? rollGuestFactions(playerMainFaction, 6);
  const enemyGuestFactions = options?.enemyGuestFactions?.map((f) => toFrameworkFactionName(f))
    ?? rollGuestFactions(enemyMainFaction, 6);

  const playerDeckOptions: CreateStarterDeckOptions | undefined = useFactionFramework
    ? {
        useFactionFramework: true,
        mainFaction: playerMainFaction,
        guestFactions: playerGuestFactions,
        includeCommons: 8,
        deckSize: 24,
      }
    : undefined;
  const enemyDeckOptions: CreateStarterDeckOptions | undefined = useFactionFramework
    ? {
        useFactionFramework: true,
        mainFaction: enemyMainFaction,
        guestFactions: enemyGuestFactions,
        includeCommons: 8,
        deckSize: 24,
      }
    : undefined;

  const startLog = useFactionFramework
    ? `对局开始：进入${arena.name}｜我方主盟${playerMainFaction}｜敌方主盟${enemyMainFaction}`
    : `对局开始：进入${arena.name}`;

  const auditLine = useFactionFramework
    ? `[R1] faction-setup player=${playerMainFaction} guest=[${playerGuestFactions.join(',')}] enemy=${enemyMainFaction} guest=[${enemyGuestFactions.join(',')}]`
    : `[R1] classic-setup arena=${arenaId}`;

  return {
    round: 1,
    maxRounds: MAX_ROUNDS,
    phase: 'ming_bian',
    secondsLeft: PHASE_DURATION.ming_bian,
    activeTopic: pickTopic(),
    arenaId,
    arenaName: arena.name,
    player: createPlayer('player', '我方', initialHuYin, playerDeckOptions),
    enemy: createPlayer('enemy', '敌方', initialHuYin, enemyDeckOptions),
    logs: [makeLog(1, startLog)],
    resolveFeed: [],
    internalAudit: [auditLine],
  };
}

export function isCardAllowedForSlot(slot: PlanSlot, cardType: CardTypeV2): boolean {
  return SLOT_CARD_RULES[slot].includes(cardType);
}

function getPhaseSeconds(phase: DebatePhase): number {
  if (phase === 'finished') return 0;
  return PHASE_DURATION[phase];
}

function getPlanCardIds(player: BattlePlayer): string[] {
  return [
    player.plan.mainCardId,
    player.plan.responseCardId,
    player.plan.secretCardId,
    player.plan.writingCardId,
  ].filter((id): id is string => Boolean(id));
}

function getCardFromHand(player: BattlePlayer, cardId: string): DebateCard | null {
  return player.hand.find((card) => card.id === cardId) ?? null;
}

function getCardByPlanSlot(player: BattlePlayer, slot: PlanSlot): DebateCard | null {
  const id = slot === 'main' ? player.plan.mainCardId : slot === 'response' ? player.plan.responseCardId : player.plan.secretCardId;
  if (!id) return null;
  return getCardFromHand(player, id);
}

function recalcUsedLingShi(player: BattlePlayer): number {
  const ids = [player.plan.mainCardId, player.plan.responseCardId, player.plan.secretCardId].filter(
    (id): id is string => Boolean(id)
  );
  return ids.reduce((sum, id) => {
    const card = getCardFromHand(player, id);
    return sum + (card?.cost ?? 0);
  }, 0);
}

function projectedUsedLingShi(player: BattlePlayer, slot: PlanSlot, card: DebateCard): number {
  const map: Record<PlanSlot, string | null> = {
    main: player.plan.mainCardId,
    response: player.plan.responseCardId,
    secret: player.plan.secretCardId,
  };
  map[slot] = card.id;

  const ids = Object.values(map).filter((id): id is string => Boolean(id));
  return ids.reduce((sum, id) => {
    const plannedCard = getCardFromHand(player, id);
    return sum + (plannedCard?.cost ?? 0);
  }, 0);
}

export function getPlanAssignError(player: BattlePlayer, slot: PlanSlot, cardId: string | null): string | null {
  if (!cardId) return null;
  const card = getCardFromHand(player, cardId);
  if (!card) return '该牌不在手牌中';
  if (!isCardAllowedForSlot(slot, card.type)) return `${card.type} 不能放入该槽位`;

  const occupied = getPlanCardIds(player);
  if (occupied.includes(cardId)) {
    const sameSlotCard = getCardByPlanSlot(player, slot);
    if (!sameSlotCard || sameSlotCard.id !== cardId) {
      return '该牌已放入其他槽位';
    }
  }

  const costAfterAssign = projectedUsedLingShi(player, slot, card);
  if (costAfterAssign > player.resources.lingShi) {
    return `灵势不足：需要 ${costAfterAssign}，当前 ${player.resources.lingShi}`;
  }
  return null;
}

function applyHeroDamage(resources: Resources, damage: number): number {
  let remain = damage;
  if (resources.huYin > 0) {
    const absorbed = Math.min(resources.huYin, remain);
    resources.huYin -= absorbed;
    remain -= absorbed;
  }
  if (remain > 0) {
    resources.xinZheng = Math.max(0, resources.xinZheng - remain);
  }
  return remain;
}

function applyDamageToLane(target: SeatState, targetResources: Resources, damage: number): number {
  let remain = damage;
  if (target.front && remain > 0) {
    target.front.hp -= remain;
    if (target.front.hp <= 0) {
      remain = Math.abs(target.front.hp);
      target.front = null;
    } else {
      remain = 0;
    }
  }
  if (target.back && remain > 0) {
    target.back.hp -= remain;
    if (target.back.hp <= 0) {
      remain = Math.abs(target.back.hp);
      target.back = null;
    } else {
      remain = 0;
    }
  }
  if (remain > 0) {
    applyHeroDamage(targetResources, remain);
  }
  return remain;
}

function summonUnit(player: BattlePlayer, card: DebateCard, seat: SeatId, layer: 'front' | 'back'): boolean {
  const slot = player.seats[seat];
  if (slot[layer]) return false;
  unitSeq += 1;
  const power = Math.max(1, card.effectValue);
  const unit: SeatUnit = {
    id: `unit-${player.side}-${unitSeq}`,
    name: card.name,
    power,
    hp: power + 1,
    maxHp: power + 1,
  };
  slot[layer] = unit;
  return true;
}

function firstAvailableSeat(player: BattlePlayer, layer: 'front' | 'back'): SeatId | null {
  for (const seat of ALL_SEATS) {
    if (!player.seats[seat][layer]) return seat;
  }
  return null;
}

function pushResolveFeed(feed: string[], line: string): void {
  feed.push(line);
}

function resolveCardEffect(ctx: ResolveContext): void {
  const { owner, rival, card, round, logs, feed, layerLabel, targetSeat, damageModifier = 0, arenaId } = ctx;
  if (!card) return;

  const seat = targetSeat ?? 'zhu_bian';
  const seatLabel = SEAT_LABEL[seat];

  switch (card.effectKind) {
    case 'damage': {
      const amount = Math.max(0, card.effectValue + owner.resources.zhengLi + damageModifier);
      if (amount <= 0) {
        logs.push(makeLog(round, `${owner.name}${layerLabel}《${card.name}》被完全化解`));
        pushResolveFeed(feed, `${owner.name}${layerLabel} ${card.name} 被化解`);
        break;
      }

      const targetLane = rival.seats[seat];
      const frontHpBefore = targetLane.front?.hp ?? 0;
      applyDamageToLane(targetLane, rival.resources, amount);
      logs.push(makeLog(round, `${owner.name}${layerLabel}《${card.name}》对${seatLabel}造成 ${amount} 压力`));
      pushResolveFeed(feed, `${owner.name}${layerLabel} ${card.name} -> ${seatLabel} ${amount}`);

      if (arenaId === 'huode' && frontHpBefore > 0 && amount > frontHpBefore) {
        applyHeroDamage(rival.resources, 1);
        logs.push(makeLog(round, `火德论坛·穿席余烬触发：${rival.name}额外承受 1 心证伤害`));
        pushResolveFeed(feed, `火德论坛：穿席余烬 +1 心证`);
      }
      break;
    }
    case 'shield': {
      owner.resources.huYin += card.effectValue;
      logs.push(makeLog(round, `${owner.name}${layerLabel}《${card.name}》获得 ${card.effectValue} 护印`));
      pushResolveFeed(feed, `${owner.name}${layerLabel} 护印 +${card.effectValue}`);
      break;
    }
    case 'draw': {
      drawCards(owner, card.effectValue);
      logs.push(makeLog(round, `${owner.name}${layerLabel}《${card.name}》抽牌 ${card.effectValue}`));
      pushResolveFeed(feed, `${owner.name}${layerLabel} 抽牌 +${card.effectValue}`);
      break;
    }
    case 'zhengli': {
      owner.resources.zhengLi += card.effectValue;
      logs.push(makeLog(round, `${owner.name}${layerLabel}《${card.name}》获得 ${card.effectValue} 证立`));
      pushResolveFeed(feed, `${owner.name}${layerLabel} 证立 +${card.effectValue}`);
      break;
    }
    case 'shixu': {
      rival.resources.shiXu += card.effectValue;
      logs.push(makeLog(round, `${owner.name}${layerLabel}《${card.name}》使对手失序 +${card.effectValue}`));
      pushResolveFeed(feed, `${owner.name}${layerLabel} 对手失序 +${card.effectValue}`);
      break;
    }
    case 'summon_front': {
      const target = summonUnit(owner, card, seat, 'front') ? seat : firstAvailableSeat(owner, 'front');
      if (!target) break;
      if (target !== seat) {
        summonUnit(owner, card, target, 'front');
      }
      logs.push(makeLog(round, `${owner.name}${layerLabel}《${card.name}》在${SEAT_LABEL[target]}前席登场`));
      pushResolveFeed(feed, `${owner.name}${layerLabel} 前席登场 -> ${SEAT_LABEL[target]}`);
      break;
    }
    case 'summon_back': {
      const target = summonUnit(owner, card, seat, 'back') ? seat : firstAvailableSeat(owner, 'back');
      if (!target) break;
      if (target !== seat) {
        summonUnit(owner, card, target, 'back');
      }
      logs.push(makeLog(round, `${owner.name}${layerLabel}《${card.name}》在${SEAT_LABEL[target]}后席登场`));
      pushResolveFeed(feed, `${owner.name}${layerLabel} 后席登场 -> ${SEAT_LABEL[target]}`);
      break;
    }
    default:
      break;
  }
}

function pickPlannedCard(player: BattlePlayer, cardId: string | null): DebateCard | null {
  if (!cardId) return null;
  return getCardFromHand(player, cardId);
}

function applyWriting(player: BattlePlayer, logs: BattleLog[], feed: string[], round: number, arenaId: ArenaId): void {
  const writingId = player.plan.writingCardId;
  if (!writingId) return;
  const idx = player.hand.findIndex((card) => card.id === writingId);
  if (idx < 0) return;

  const wasFirstWriting = player.writings.length === 0;
  const hadAtLeastOneWriting = player.writings.length >= 1;

  const [card] = player.hand.splice(idx, 1);
  player.writings.push(card);
  player.resources.wenMai += 1;
  player.resources.maxLingShi = Math.min(10, player.resources.maxLingShi + 1);

  logs.push(makeLog(round, `${player.name}执行着书《${card.name}》，文脉 +1`));
  pushResolveFeed(feed, `${player.name} 着书 ${card.name}，文脉 +1`);

  if (arenaId === 'cangshu' && wasFirstWriting) {
    player.resources.huYin += 1;
    logs.push(makeLog(round, `藏书秘阁触发：${player.name}首次着书额外获得 1 护印`));
    pushResolveFeed(feed, '藏书秘阁：首次着书 护印 +1');
  }

  if (arenaId === 'cangshu' && hadAtLeastOneWriting) {
    player.resources.xinZheng = Math.min(HERO_MAX_XIN_ZHENG, player.resources.xinZheng + 1);
    logs.push(makeLog(round, `藏书秘阁触发：${player.name}着书回复 1 心证`));
    pushResolveFeed(feed, '藏书秘阁：着书后回复 1 心证');
  }
}

function discardPlannedCard(player: BattlePlayer, cardId: string | null): void {
  if (!cardId) return;
  const idx = player.hand.findIndex((card) => card.id === cardId);
  if (idx < 0) return;
  const [card] = player.hand.splice(idx, 1);
  player.discard.push(card);
}

function resolveSeatBattle(
  player: BattlePlayer,
  enemy: BattlePlayer,
  logs: BattleLog[],
  feed: string[],
  round: number,
  arenaId: ArenaId
): void {
  ALL_SEATS.forEach((seat) => {
    const pSeat = player.seats[seat];
    const eSeat = enemy.seats[seat];
    const playerFrontBonus = arenaId === 'huode' && pSeat.front ? 1 : 0;
    const enemyFrontBonus = arenaId === 'huode' && eSeat.front ? 1 : 0;
    const pPower = (pSeat.front?.power ?? pSeat.back?.power ?? 0) + playerFrontBonus;
    const ePower = (eSeat.front?.power ?? eSeat.back?.power ?? 0) + enemyFrontBonus;

    if (pPower > 0) {
      applyDamageToLane(eSeat, enemy.resources, pPower);
      logs.push(makeLog(round, `我方${SEAT_LABEL[seat]}争鸣造成 ${pPower} 压力`));
      pushResolveFeed(feed, `我方${SEAT_LABEL[seat]}争鸣 ${pPower}`);
    }

    if (ePower > 0) {
      applyDamageToLane(pSeat, player.resources, ePower);
      logs.push(makeLog(round, `敌方${SEAT_LABEL[seat]}争鸣造成 ${ePower} 压力`));
      pushResolveFeed(feed, `敌方${SEAT_LABEL[seat]}争鸣 ${ePower}`);
    }
  });
}

function resetPlanForNewRound(player: BattlePlayer): void {
  player.plan = {
    mainCardId: null,
    responseCardId: null,
    secretCardId: null,
    writingCardId: null,
    mainTargetSeat: player.plan.mainTargetSeat,
    secretTargetSeat: player.plan.secretTargetSeat,
    usedLingShi: 0,
    lockedPublic: false,
    lockedSecret: false,
  };
  player.resources.zhengLi = 0;
}

function beginNewRound(state: DebateBattleState): void {
  // 应用左路奖励（下回合开始时 +1 心证）
  if (state.player.resources.wenMai > 0) {
    const bonus = state.player.resources.wenMai;
    state.player.resources.wenMai = 0;
    state.player.resources.lingShi = Math.min(state.player.resources.maxLingShi, state.player.resources.lingShi + bonus);
    state.logs.push(makeLog(state.round, `左路立势：我方获得 ${bonus} 心证`));
  }
  if (state.enemy.resources.wenMai > 0) {
    const bonus = state.enemy.resources.wenMai;
    state.enemy.resources.wenMai = 0;
    state.enemy.resources.lingShi = Math.min(state.enemy.resources.maxLingShi, state.enemy.resources.lingShi + bonus);
    state.logs.push(makeLog(state.round, `左路立势：敌方获得 ${bonus} 心证`));
  }
  
  state.player.resources.lingShi = state.player.resources.maxLingShi;
  state.enemy.resources.lingShi = state.enemy.resources.maxLingShi;
  drawCards(state.player, 1);
  drawCards(state.enemy, 1);
}

function resolveRound(state: DebateBattleState): void {
  const logs: BattleLog[] = [];
  const feed: string[] = [];
  const audit: string[] = [];
  const round = state.round;

  audit.push(`[R${round}] resolve-start arena=${state.arenaId}`);
  audit.push(
    `[R${round}] player-plan main=${state.player.plan.mainCardId ?? '-'} resp=${state.player.plan.responseCardId ?? '-'} secret=${state.player.plan.secretCardId ?? '-'} writing=${state.player.plan.writingCardId ?? '-'}`
  );
  audit.push(
    `[R${round}] enemy-plan main=${state.enemy.plan.mainCardId ?? '-'} resp=${state.enemy.plan.responseCardId ?? '-'} secret=${state.enemy.plan.secretCardId ?? '-'} writing=${state.enemy.plan.writingCardId ?? '-'}`
  );

  feed.push('【层1】应对结算');
  const pResponse = pickPlannedCard(state.player, state.player.plan.responseCardId);
  const eResponse = pickPlannedCard(state.enemy, state.enemy.plan.responseCardId);
  resolveCardEffect({
    owner: state.player,
    rival: state.enemy,
    card: pResponse,
    round,
    logs,
    feed,
    layerLabel: '应对',
    arenaId: state.arenaId,
  });
  resolveCardEffect({
    owner: state.enemy,
    rival: state.player,
    card: eResponse,
    round,
    logs,
    feed,
    layerLabel: '应对',
    arenaId: state.arenaId,
  });

  let playerMainDamageModifier = 0;
  let enemyMainDamageModifier = 0;
  if (eResponse?.type === '反诘') {
    playerMainDamageModifier -= 1;
    feed.push('敌方反诘：我方主论伤害 -1');
  }
  if (pResponse?.type === '反诘') {
    enemyMainDamageModifier -= 1;
    feed.push('我方反诘：敌方主论伤害 -1');
  }

  feed.push('【层2】主论结算');
  const pMain = pickPlannedCard(state.player, state.player.plan.mainCardId);
  const eMain = pickPlannedCard(state.enemy, state.enemy.plan.mainCardId);

  if (state.arenaId === 'jixia' && pMain && !state.player.plan.writingCardId) {
    state.player.resources.zhengLi += 1;
    logs.push(makeLog(round, '稷下学宫触发：我方首次立论且未着书，证立 +1'));
    feed.push('稷下学宫：我方证立 +1');
  }
  if (state.arenaId === 'jixia' && eMain && !state.enemy.plan.writingCardId) {
    state.enemy.resources.zhengLi += 1;
    logs.push(makeLog(round, '稷下学宫触发：敌方首次立论且未着书，证立 +1'));
    feed.push('稷下学宫：敌方证立 +1');
  }

  resolveCardEffect({
    owner: state.player,
    rival: state.enemy,
    card: pMain,
    round,
    logs,
    feed,
    layerLabel: '主论',
    targetSeat: state.player.plan.mainTargetSeat,
    damageModifier: playerMainDamageModifier,
    arenaId: state.arenaId,
  });
  resolveCardEffect({
    owner: state.enemy,
    rival: state.player,
    card: eMain,
    round,
    logs,
    feed,
    layerLabel: '主论',
    targetSeat: state.enemy.plan.mainTargetSeat,
    damageModifier: enemyMainDamageModifier,
    arenaId: state.arenaId,
  });

  feed.push('【层3】三席争鸣');
  resolveSeatBattle(state.player, state.enemy, logs, feed, round, state.arenaId);

  feed.push('【层4】暗策结算');
  const pSecret = pickPlannedCard(state.player, state.player.plan.secretCardId);
  const eSecret = pickPlannedCard(state.enemy, state.enemy.plan.secretCardId);

  if (state.arenaId === 'guanxing' && pSecret) {
    state.player.resources.huYin += 1;
    logs.push(makeLog(round, '玄机观星台触发：我方首次暗策，护印 +1'));
    feed.push('玄机观星台：我方暗策 护印 +1');
  }
  if (state.arenaId === 'guanxing' && eSecret) {
    state.enemy.resources.huYin += 1;
    logs.push(makeLog(round, '玄机观星台触发：敌方首次暗策，护印 +1'));
    feed.push('玄机观星台：敌方暗策 护印 +1');
  }

  resolveCardEffect({
    owner: state.player,
    rival: state.enemy,
    card: pSecret,
    round,
    logs,
    feed,
    layerLabel: '暗策',
    targetSeat: state.player.plan.secretTargetSeat,
    arenaId: state.arenaId,
  });
  resolveCardEffect({
    owner: state.enemy,
    rival: state.player,
    card: eSecret,
    round,
    logs,
    feed,
    layerLabel: '暗策',
    targetSeat: state.enemy.plan.secretTargetSeat,
    arenaId: state.arenaId,
  });

  feed.push('【层 5】回合收束');
  applyWriting(state.player, logs, feed, round, state.arenaId);
  applyWriting(state.enemy, logs, feed, round, state.arenaId);

  discardPlannedCard(state.player, state.player.plan.mainCardId);
  discardPlannedCard(state.player, state.player.plan.responseCardId);
  discardPlannedCard(state.player, state.player.plan.secretCardId);
  discardPlannedCard(state.enemy, state.enemy.plan.mainCardId);
  discardPlannedCard(state.enemy, state.enemy.plan.responseCardId);
  discardPlannedCard(state.enemy, state.enemy.plan.secretCardId);

  // ════════════════════════════════════════════════════════════════
  // 【层 6】三路奖励结算（轻异构三路系统）
  // ════════════════════════════════════════════════════════════════
  feed.push('【层 6】三路奖励');
  const laneControls = calculateAllLaneControls(state);
  const { playerRewards, enemyRewards } = applyLaneRewards(state, laneControls);
  
  // 记录三路控制权
  (Object.keys(laneControls) as Array<keyof typeof laneControls>).forEach(laneId => {
    const control = laneControls[laneId];
    const laneName = LANE_NAMES[laneId];
    if (control.controlledBy) {
      const controller = control.controlledBy === 'player' ? '我方' : '敌方';
      logs.push(makeLog(round, `${controller}控制${laneName}（战力 ${control.playerPower}:${control.enemyPower}）`));
      feed.push(`${laneName}: ${controller}控制 (${control.playerPower}:${control.enemyPower})`);
    } else {
      logs.push(makeLog(round, `${laneName}未控制（战力 ${control.playerPower}:${control.enemyPower}）`));
      feed.push(`${laneName}: 未控制 (${control.playerPower}:${control.enemyPower})`);
    }
  });
  
  // 记录奖励
  playerRewards.forEach(reward => {
    logs.push(makeLog(round, `我方：${reward}`));
  });
  enemyRewards.forEach(reward => {
    logs.push(makeLog(round, `敌方：${reward}`));
  });

  state.logs.push(...logs);
  state.resolveFeed = feed;
  audit.push(
    `[R${round}] player-res xin=${state.player.resources.xinZheng} ling=${state.player.resources.lingShi} hu=${state.player.resources.huYin} zhengli=${state.player.resources.zhengLi} shixu=${state.player.resources.shiXu} wenmai=${state.player.resources.wenMai} jibian=${state.player.resources.jiBian}`
  );
  audit.push(
    `[R${round}] enemy-res xin=${state.enemy.resources.xinZheng} ling=${state.enemy.resources.lingShi} hu=${state.enemy.resources.huYin} zhengli=${state.enemy.resources.zhengLi} shixu=${state.enemy.resources.shiXu} wenmai=${state.enemy.resources.wenMai} jibian=${state.enemy.resources.jiBian}`
  );
  audit.push(`[R${round}] resolve-end`);
  state.internalAudit.push(...audit);
  if (state.internalAudit.length > 240) {
    state.internalAudit = state.internalAudit.slice(-240);
  }
}

function canMoveToAnMou(state: DebateBattleState): boolean {
  return state.player.plan.lockedPublic && state.enemy.plan.lockedPublic;
}

function canMoveToReveal(state: DebateBattleState): boolean {
  return state.player.plan.lockedSecret && state.enemy.plan.lockedSecret;
}

function setPhase(state: DebateBattleState, phase: DebatePhase): void {
  state.phase = phase;
  state.secondsLeft = getPhaseSeconds(phase);
}

function advancePhase(state: DebateBattleState): void {
  if (state.phase === 'ming_bian') {
    setPhase(state, 'an_mou');
    state.logs.push(makeLog(state.round, '明辩结束，进入暗策'));
    return;
  }

  if (state.phase === 'an_mou') {
    setPhase(state, 'reveal');
    state.logs.push(makeLog(state.round, '暗策结束，进入揭示'));
    return;
  }

  if (state.phase === 'reveal') {
    setPhase(state, 'resolve');
    resolveRound(state);
    state.logs.push(makeLog(state.round, '进入结算层'));
    return;
  }

  if (state.phase === 'resolve') {
    resetPlanForNewRound(state.player);
    resetPlanForNewRound(state.enemy);

    // 胜负判定：仅以心证归零为结束条件，无回合数上限
    const playerDead = state.player.resources.xinZheng <= 0;
    const enemyDead  = state.enemy.resources.xinZheng  <= 0;
    if (playerDead || enemyDead) {
      setPhase(state, 'finished');
      const result = playerDead && enemyDead
        ? '对局结束：双方同时心证归零，平局'
        : playerDead
        ? '对局结束：我方心证归零，敌方胜'
        : '对局结束：敌方心证归零，我方胜';
      state.logs.push(makeLog(state.round, result));
      return;
    }

    state.round += 1;
    beginNewRound(state);
    setPhase(state, 'ming_bian');
    state.logs.push(makeLog(state.round, `第 ${state.round} 回合开始`));
  }
}

function updatePlanCard(player: BattlePlayer, slot: PlanSlot, cardId: string | null): boolean {
  if (!cardId) {
    if (slot === 'main') player.plan.mainCardId = null;
    if (slot === 'response') player.plan.responseCardId = null;
    if (slot === 'secret') player.plan.secretCardId = null;
    player.plan.usedLingShi = recalcUsedLingShi(player);
    return true;
  }

  const error = getPlanAssignError(player, slot, cardId);
  if (error) return false;

  if (slot === 'main') player.plan.mainCardId = cardId;
  if (slot === 'response') player.plan.responseCardId = cardId;
  if (slot === 'secret') player.plan.secretCardId = cardId;
  player.plan.usedLingShi = recalcUsedLingShi(player);
  return true;
}

function updateWriting(player: BattlePlayer, cardId: string | null): boolean {
  if (!cardId) {
    player.plan.writingCardId = null;
    return true;
  }
  if (!getCardFromHand(player, cardId)) return false;
  if (getPlanCardIds(player).includes(cardId)) return false;
  player.plan.writingCardId = cardId;
  return true;
}

function findAffordableByType(player: BattlePlayer, slot: PlanSlot, costBudget: number): DebateCard[] {
  return player.hand
    .filter((card) => isCardAllowedForSlot(slot, card.type))
    .filter((card) => !getPlanCardIds(player).includes(card.id))
    .filter((card) => card.cost <= costBudget)
    .sort((a, b) => b.cost - a.cost);
}

function chooseTargetSeat(defender: BattlePlayer): SeatId {
  const seatScores = ALL_SEATS.map((seat) => {
    const lane = defender.seats[seat];
    const frontHp = lane.front?.hp ?? 0;
    const backHp = lane.back?.hp ?? 0;
    return {
      seat,
      score: frontHp + backHp,
    };
  });
  seatScores.sort((a, b) => a.score - b.score);
  return seatScores[0].seat;
}

function aiPlanForMingBian(state: DebateBattleState): void {
  const enemy = state.enemy;
  let budget = enemy.resources.lingShi;

  const mainCandidates = findAffordableByType(enemy, 'main', budget);
  const responseCandidates = findAffordableByType(enemy, 'response', budget);

  const playMain = Math.random() < 0.82;
  const playResponse = Math.random() < 0.63;

  if (playMain && mainCandidates.length > 0) {
    const main = mainCandidates[0];
    updatePlanCard(enemy, 'main', main.id);
    enemy.plan.mainTargetSeat = chooseTargetSeat(state.player);
    budget -= main.cost;
  }

  if (playResponse && responseCandidates.length > 0 && budget > 0) {
    const affordableResponse = responseCandidates.find((card) => card.cost <= budget);
    if (affordableResponse) {
      updatePlanCard(enemy, 'response', affordableResponse.id);
      budget -= affordableResponse.cost;
    }
  }

  const canWrite = enemy.resources.maxLingShi < 8 && Math.random() < 0.55;
  if (canWrite) {
    const writingCandidate = enemy.hand.find((card) => !getPlanCardIds(enemy).includes(card.id));
    if (writingCandidate) updateWriting(enemy, writingCandidate.id);
  }

  enemy.plan.lockedPublic = true;
}

function aiPlanForAnMou(state: DebateBattleState): void {
  const enemy = state.enemy;
  const budget = Math.max(0, enemy.resources.lingShi - enemy.plan.usedLingShi);
  const secretCandidates = findAffordableByType(enemy, 'secret', budget);

  if (Math.random() < 0.72 && secretCandidates.length > 0) {
    const secret = secretCandidates[0];
    updatePlanCard(enemy, 'secret', secret.id);
    enemy.plan.secretTargetSeat = chooseTargetSeat(state.player);
  }
  enemy.plan.lockedSecret = true;
}

function setTargetSeat(player: BattlePlayer, slot: TargetableSlot, seatId: SeatId): void {
  if (slot === 'main') player.plan.mainTargetSeat = seatId;
  if (slot === 'secret') player.plan.secretTargetSeat = seatId;
}

export function battleReducer(state: DebateBattleState, action: BattleAction): DebateBattleState {
  const next = structuredClone(state) as DebateBattleState;

  switch (action.type) {
    case 'TICK': {
      if (next.phase === 'finished') return next;
      next.secondsLeft -= 1;
      if (next.secondsLeft === 5 && (next.phase === 'ming_bian' || next.phase === 'an_mou')) {
        const phaseName = next.phase === 'ming_bian' ? '明辩' : '暗策';
        next.logs.push(makeLog(next.round, `倒计时 5 秒：${phaseName}阶段即将自动结束`));
      }
      if (next.phase === 'ming_bian' && canMoveToAnMou(next)) {
        advancePhase(next);
        return next;
      }
      if (next.phase === 'an_mou' && canMoveToReveal(next)) {
        advancePhase(next);
        return next;
      }
      if (next.secondsLeft <= 0) {
        advancePhase(next);
      }
      return next;
    }

    case 'PLAN_CARD': {
      if (next.phase === 'finished') return next;
      if (action.slot === 'secret' && next.phase !== 'an_mou') return next;
      if (action.slot !== 'secret' && next.phase !== 'ming_bian') return next;
      if (action.slot === 'secret' && next.player.plan.lockedSecret) return next;
      if (action.slot !== 'secret' && next.player.plan.lockedPublic) return next;
      updatePlanCard(next.player, action.slot, action.cardId);
      return next;
    }

    case 'PLAN_WRITING': {
      if (next.phase !== 'ming_bian' || next.player.plan.lockedPublic) return next;
      updateWriting(next.player, action.cardId);
      return next;
    }

    case 'SET_TARGET_SEAT': {
      if (next.phase === 'finished') return next;
      if (action.slot === 'main' && (next.phase !== 'ming_bian' || next.player.plan.lockedPublic)) return next;
      if (action.slot === 'secret' && (next.phase !== 'an_mou' || next.player.plan.lockedSecret)) return next;
      setTargetSeat(next.player, action.slot, action.seatId);
      return next;
    }

    case 'LOCK_PUBLIC': {
      if (next.phase !== 'ming_bian') return next;
      next.player.plan.lockedPublic = true;
      next.logs.push(makeLog(next.round, '我方已提前结束明辩'));
      if (!next.enemy.plan.lockedPublic) {
        aiPlanForMingBian(next);
      }
      if (canMoveToAnMou(next)) {
        advancePhase(next);
      }
      return next;
    }

    case 'LOCK_SECRET': {
      if (next.phase !== 'an_mou') return next;
      next.player.plan.lockedSecret = true;
      next.logs.push(makeLog(next.round, '我方已提前结束暗策'));
      if (!next.enemy.plan.lockedSecret) {
        aiPlanForAnMou(next);
      }
      if (canMoveToReveal(next)) {
        advancePhase(next);
      }
      return next;
    }

    case 'AI_AUTO_PLAN': {
      if (next.phase === 'ming_bian' && !next.enemy.plan.lockedPublic) {
        aiPlanForMingBian(next);
        if (canMoveToAnMou(next)) {
          advancePhase(next);
        }
      } else if (next.phase === 'an_mou' && !next.enemy.plan.lockedSecret) {
        aiPlanForAnMou(next);
        if (canMoveToReveal(next)) {
          advancePhase(next);
        }
      }
      return next;
    }

    default:
      return next;
  }
}
