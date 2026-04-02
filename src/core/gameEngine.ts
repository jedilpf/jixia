import { resolveBattle } from '@/core/battleResolver';
import { getNextBattlePhase } from '@/core/phaseMachine';
import {
  addIssueDirectionScore,
  addIssuePushByTags,
  calculateBurstScore,
  checkBurstTrigger,
  createIssueState,
  getLeadingDirection,
  lockIssueDirection,
  shouldCheckBurst,
} from '@/core/issueSystem';
import type {
  BattlePhase,
  CardDefinition,
  CardInstance,
  GameConfig,
  GameState,
  IssueDefinition,
  IssueDirectionId,
  PlayerId,
  PlayerState,
  ScreenId,
} from '@/core/types';
import { CARDS } from '@/data/game/cards';
import { FACTIONS } from '@/data/game/factions';
import { DEFAULT_GAME_CONFIG } from '@/data/game/gameConfig';
import { ISSUES } from '@/data/game/issues';

let uidSeq = 1;

function nextUid(ownerId: PlayerId, cardId: string): string {
  uidSeq += 1;
  return `${ownerId}_${cardId}_${uidSeq}`;
}

function toInstance(def: CardDefinition, ownerId: PlayerId): CardInstance {
  return {
    uid: nextUid(ownerId, def.id),
    cardId: def.id,
    ownerId,
    zone: 'deck',
    factionId: def.factionId,
    type: def.type,
    publicPower: def.publicPower,
    name: def.name,
    cost: def.cost,
    attack: def.baseAttack,
    health: def.baseHealth,
    maxHealth: def.baseHealth,
    issueTag: def.issueTag ?? def.issueTags[0] ?? 'neutral',
    issueTags: [...def.issueTags],
    comboTags: [...def.comboTags],
  };
}

function randomPick<T>(list: T[], count: number): T[] {
  if (count <= 0) return [];
  const pool = [...list];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

function randomPickWithRepeat<T>(list: T[], count: number): T[] {
  if (count <= 0 || list.length === 0) return [];
  const pool: T[] = [];
  while (pool.length < count) {
    pool.push(...list);
  }
  return randomPick(pool, count);
}

function maxManaForRound(config: GameConfig, round: number): number {
  const index = Math.max(0, round - 1);
  return config.manaByRound[index] ?? config.manaByRound[config.manaByRound.length - 1] ?? 5;
}

function createEmptyPlayer(id: PlayerId, name: string, config: GameConfig): PlayerState {
  return {
    id,
    name,
    factionId: null,
    momentum: 0,
    gold: config.initialGold,
    mana: 0,
    maxMana: 0,
    deck: [],
    hand: [],
    discard: [],
    board: {
      mainQueue: [],
      sideQueue: [],
    },
    hasUsedStrategyCard: false,
    cardsPlayedThisTurn: 0,
  };
}

function buildFactionDeck(factionId: string, ownerId: PlayerId, config: GameConfig): CardInstance[] {
  const factionCards = CARDS.filter((card) => card.factionId === factionId);
  const neutralCards = CARDS.filter((card) => card.factionId === 'neutral');

  const factionPart = randomPickWithRepeat(factionCards, config.factionDeckCount);
  const neutralPart = randomPickWithRepeat(neutralCards, config.neutralDeckCount);

  const combinedDefs = [...factionPart, ...neutralPart];
  const deckDefs = randomPickWithRepeat(combinedDefs, config.deckSize);

  return randomPick(deckDefs, deckDefs.length).map((def) => toInstance(def, ownerId));
}

function drawCards(player: PlayerState, count: number): PlayerState {
  if (count <= 0 || player.deck.length === 0) return player;
  const draw = player.deck.slice(0, count).map((card) => ({ ...card, zone: 'hand' as const }));
  return {
    ...player,
    deck: player.deck.slice(draw.length),
    hand: [...player.hand, ...draw],
  };
}

function resetTurnFlags(player: PlayerState): PlayerState {
  return {
    ...player,
    cardsPlayedThisTurn: 0,
    hasUsedStrategyCard: false,
  };
}

function clearBoardToDiscard(player: PlayerState): PlayerState {
  const boardCards = [...player.board.mainQueue, ...player.board.sideQueue];
  return {
    ...player,
    board: { mainQueue: [], sideQueue: [] },
    discard: [...player.discard, ...boardCards.map((card) => ({ ...card, zone: 'discard' as const }))],
  };
}

function appendLog(state: GameState, text: string): GameState {
  return {
    ...state,
    battle: {
      ...state.battle,
      logs: [...state.battle.logs, text],
    },
  };
}

function withScreen(state: GameState, screen: ScreenId): GameState {
  return {
    ...state,
    screen,
  };
}

function pickIssueDefinition(issueId: string | undefined): IssueDefinition {
  const picked = issueId ? ISSUES.find((item) => item.id === issueId) : undefined;
  return picked ?? ISSUES[0];
}

function getQueueKey(zone: 'main' | 'side'): 'mainQueue' | 'sideQueue' {
  return zone === 'main' ? 'mainQueue' : 'sideQueue';
}

function damageQueue(cards: CardInstance[], damage: number): CardInstance[] {
  if (damage <= 0) {
    return cards;
  }

  return cards.map((card) => ({
    ...card,
    health: Math.max(0, card.health - damage),
  }));
}

function dominantDirectionFromWinner(
  winner: PlayerId | 'draw',
  playerDirection: IssueDirectionId | null,
  enemyDirection: IssueDirectionId | null,
): IssueDirectionId | null {
  if (winner === 'player') {
    return playerDirection;
  }
  if (winner === 'enemy') {
    return enemyDirection;
  }
  return null;
}

export function createInitialGameState(config: GameConfig = DEFAULT_GAME_CONFIG): GameState {
  return {
    screen: 'home',
    round: 0,
    activePlayerId: 'player',
    winnerId: null,
    issueState: null,
    battle: {
      phase: 'round_start',
      maxCardsPerTurn: config.maxCardsPerTurn,
      maxCardsPerZone: config.maxCardsPerZone,
      maxStrategyPerTurn: 3,
      recentIssuePushTotal: 0,
      lastBurstTriggeredRound: null,
      logs: [],
    },
    players: {
      player: createEmptyPlayer('player', '我方', config),
      enemy: createEmptyPlayer('enemy', '对手', config),
    },
    supportScore: {
      player: 0,
      enemy: 0,
    },
    factionResonance: {
      player: 0,
      enemy: 0,
    },
    offeredFactionIds: {
      player: [],
      enemy: [],
    },
    availableIssueIds: ISSUES.map((i) => i.id),
    selectedIssuePreviewIds: [],
    config,
    seededAt: Date.now(),
  };
}

export function startMatchFlow(state: GameState): GameState {
  const issueIds = randomPick(
    state.availableIssueIds.length ? state.availableIssueIds : ISSUES.map((i) => i.id),
    state.config.issueCandidateCount,
  );

  const chosenIssue = pickIssueDefinition(issueIds[0]);

  const allFactionIds = FACTIONS.map((f) => f.id);
  const playerFactions = randomPick(allFactionIds, state.config.factionChoiceCount);
  const enemyFactions = randomPick(allFactionIds, state.config.factionChoiceCount);

  const next = {
    ...state,
    screen: 'match' as const,
    selectedIssuePreviewIds: issueIds,
    issueState: createIssueState(chosenIssue, state.config.issueTriggerThreshold, state.config.burstCheckEvery),
    supportScore: {
      player: 0,
      enemy: 0,
    },
    factionResonance: {
      player: 0,
      enemy: 0,
    },
    offeredFactionIds: {
      player: playerFactions,
      enemy: enemyFactions,
    },
    players: {
      ...state.players,
      player: { ...state.players.player, factionId: null },
      enemy: { ...state.players.enemy, factionId: null },
    },
  };

  return appendLog(next, `匹配开始，中央议题种子：${chosenIssue.seedPrompt}`);
}

export function openTopicPreview(state: GameState): GameState {
  return withScreen(state, 'topic_preview');
}

export function openFactionPick(state: GameState): GameState {
  return withScreen(state, 'faction_pick');
}

export function lockFaction(state: GameState, playerId: PlayerId, factionId: string): GameState {
  const offered = state.offeredFactionIds[playerId];
  if (!offered.includes(factionId)) return state;

  const next = {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...state.players[playerId],
        factionId,
      },
    },
  };
  return appendLog(next, `${playerId === 'player' ? '我方' : '对手'}锁定门派：${factionId}`);
}

export function autoLockFaction(state: GameState, playerId: PlayerId): GameState {
  const pick = state.offeredFactionIds[playerId][0];
  if (!pick) return state;
  return lockFaction(state, playerId, pick);
}

export function enterLoading(state: GameState): GameState {
  return withScreen(state, 'loading');
}

export function startBattle(state: GameState): GameState {
  const playerFaction = state.players.player.factionId ?? state.offeredFactionIds.player[0];
  const enemyFaction = state.players.enemy.factionId ?? state.offeredFactionIds.enemy[0];
  if (!playerFaction || !enemyFaction) return state;

  const playerDeck = buildFactionDeck(playerFaction, 'player', state.config);
  const enemyDeck = buildFactionDeck(enemyFaction, 'enemy', state.config);
  const round = 1;
  const maxMana = maxManaForRound(state.config, round);

  let player: PlayerState = {
    ...state.players.player,
    factionId: playerFaction,
    deck: playerDeck,
    hand: [],
    discard: [],
    board: { mainQueue: [], sideQueue: [] },
    momentum: 0,
    mana: maxMana,
    maxMana,
    cardsPlayedThisTurn: 0,
    hasUsedStrategyCard: false,
  };

  let enemy: PlayerState = {
    ...state.players.enemy,
    factionId: enemyFaction,
    deck: enemyDeck,
    hand: [],
    discard: [],
    board: { mainQueue: [], sideQueue: [] },
    momentum: 0,
    mana: maxMana,
    maxMana,
    cardsPlayedThisTurn: 0,
    hasUsedStrategyCard: false,
  };

  player = drawCards(player, state.config.initialHandSize);
  enemy = drawCards(enemy, state.config.initialHandSize);

  const issueDef = pickIssueDefinition(state.selectedIssuePreviewIds[0]);
  const issueState = createIssueState(issueDef, state.config.issueTriggerThreshold, state.config.burstCheckEvery);

  const next: GameState = {
    ...state,
    screen: 'battle',
    round,
    winnerId: null,
    activePlayerId: 'player',
    issueState,
    battle: {
      ...state.battle,
      phase: 'hidden_submit',
      maxCardsPerTurn: state.config.maxCardsPerTurn,
      maxCardsPerZone: state.config.maxCardsPerZone,
      recentIssuePushTotal: 0,
      logs: [],
    },
    players: {
      player,
      enemy,
    },
  };

  return appendLog(next, `对局开始：${playerFaction} vs ${enemyFaction}，中央议题：${issueDef.seedPrompt}`);
}

export function advanceBattlePhase(state: GameState): GameState {
  const nextPhase = getNextBattlePhase(state.battle.phase);
  return {
    ...state,
    battle: {
      ...state.battle,
      phase: nextPhase,
    },
  };
}

export function playCardToZone(
  state: GameState,
  playerId: PlayerId,
  cardUid: string,
  zone: 'main' | 'side',
): GameState {
  if (state.screen !== 'battle') return state;
  if (state.battle.phase !== 'hidden_submit') return state;
  if (state.activePlayerId !== playerId) return state;

  const player = state.players[playerId];
  if (player.cardsPlayedThisTurn >= state.battle.maxCardsPerTurn) return state;

  const queueKey = getQueueKey(zone);
  if (player.board[queueKey].length >= state.battle.maxCardsPerZone) return state;

  const handIndex = player.hand.findIndex((card) => card.uid === cardUid);
  if (handIndex < 0) return state;
  const card = player.hand[handIndex];
  if (card.cost > player.mana) return state;

  const nextHand = [...player.hand];
  nextHand.splice(handIndex, 1);
  const placed = { ...card, zone };

  const nextPlayer: PlayerState = {
    ...player,
    hand: nextHand,
    mana: player.mana - card.cost,
    board: {
      ...player.board,
      [queueKey]: [...player.board[queueKey], placed],
    },
    cardsPlayedThisTurn: player.cardsPlayedThisTurn + 1,
  };

  let issueState = state.issueState;
  if (issueState) {
    issueState = addIssuePushByTags(issueState, card.issueTags, 1);
  }

  const next = {
    ...state,
    players: {
      ...state.players,
      [playerId]: nextPlayer,
    },
    issueState,
    battle: {
      ...state.battle,
      recentIssuePushTotal: state.battle.recentIssuePushTotal + Math.max(1, card.issueTags.length),
    },
  };

  return appendLog(
    next,
    `${playerId === 'player' ? '我方' : '对手'}暗辩提交 ${card.name} 至${zone === 'main' ? '主议' : '旁议'}（${nextPlayer.cardsPlayedThisTurn}/${state.battle.maxCardsPerTurn}）`,
  );
}

export function passAction(state: GameState): GameState {
  if (state.battle.phase !== 'hidden_submit') return state;
  return {
    ...state,
    battle: {
      ...state.battle,
      phase: 'submission_lock',
      logs: [...state.battle.logs, '本轮提交已锁定，进入明辩揭示。'],
    },
  };
}

export function resolveRound(state: GameState): GameState {
  if (state.screen !== 'battle') return state;
  if (state.battle.phase !== 'submission_lock' && state.battle.phase !== 'hidden_submit') return state;

  const result = resolveBattle(state.players.player, state.players.enemy);

  let issueState = state.issueState;
  const supportScore = { ...state.supportScore };
  const factionResonance = { ...state.factionResonance };

  const mainLosingSide = result.main.winner === 'player' ? 'enemy' : result.main.winner === 'enemy' ? 'player' : null;

  let player = state.players.player;
  let enemy = state.players.enemy;

  if (mainLosingSide === 'player') {
    player = {
      ...player,
      board: {
        ...player.board,
        mainQueue: damageQueue(player.board.mainQueue, 1),
      },
    };
  }
  if (mainLosingSide === 'enemy') {
    enemy = {
      ...enemy,
      board: {
        ...enemy.board,
        mainQueue: damageQueue(enemy.board.mainQueue, 1),
      },
    };
  }

  if (issueState) {
    const mainDirection = dominantDirectionFromWinner(
      result.main.winner,
      result.main.playerDominantDirection,
      result.main.enemyDominantDirection,
    );
    const sideDirection = dominantDirectionFromWinner(
      result.side.winner,
      result.side.playerDominantDirection,
      result.side.enemyDominantDirection,
    );

    if (mainDirection) {
      issueState = addIssueDirectionScore(issueState, mainDirection, 2);
    }
    if (sideDirection) {
      issueState = addIssueDirectionScore(issueState, sideDirection, 1);
    }
  }

  if (result.main.winner === 'player' || result.main.winner === 'enemy') {
    supportScore[result.main.winner] += 1;
  }
  if (result.side.winner === 'player' || result.side.winner === 'enemy') {
    factionResonance[result.side.winner] += 1;
  }

  player = clearBoardToDiscard(player);
  enemy = clearBoardToDiscard(enemy);

  player = {
    ...resetTurnFlags(player),
    momentum: player.momentum + result.momentumDelta.player,
  };

  enemy = {
    ...resetTurnFlags(enemy),
    momentum: enemy.momentum + result.momentumDelta.enemy,
  };

  const roundLogs: string[] = [
    `主议论势：我方 ${result.main.playerPower} / 对手 ${result.main.enemyPower}（胜者：${
      result.main.winner === 'draw' ? '平' : result.main.winner === 'player' ? '我方' : '对手'
    }）`,
    `旁议论势：我方 ${result.side.playerPower} / 对手 ${result.side.enemyPower}（胜者：${
      result.side.winner === 'draw' ? '平' : result.side.winner === 'player' ? '我方' : '对手'
    }）`,
  ];

  let burstTriggeredRound: number | null = state.battle.lastBurstTriggeredRound;

  if (issueState && shouldCheckBurst(state.round, issueState.burstCheckEvery)) {
    const burstScore = calculateBurstScore(
      issueState,
      Math.max(supportScore.player, supportScore.enemy),
      Math.max(factionResonance.player, factionResonance.enemy),
      state.battle.recentIssuePushTotal,
    );

    const burstCheck = checkBurstTrigger(
      burstScore,
      state.config.burstDirectThreshold,
      state.config.burstProbThreshold,
    );

    roundLogs.push(`第 ${state.round} 轮引爆检查：burstScore=${burstScore}`);

    const leading = getLeadingDirection(issueState);
    if (burstCheck.triggered && leading) {
      issueState = lockIssueDirection(issueState, leading, state.round);
      burstTriggeredRound = state.round;
      roundLogs.push(`议题引爆触发（${burstCheck.by}），锁定方向：${leading}`);

      // 简化版强效果：本轮主议胜方额外 +1 大势。
      if (result.main.winner === 'player') {
        player = { ...player, momentum: player.momentum + 1 };
      }
      if (result.main.winner === 'enemy') {
        enemy = { ...enemy, momentum: enemy.momentum + 1 };
      }
    } else {
      roundLogs.push('本轮未触发议题引爆。');
    }
  }

  const reachedVictoryMomentum =
    player.momentum >= state.config.victoryMomentum || enemy.momentum >= state.config.victoryMomentum;

  const reachedRoundLimit = state.round >= state.config.maxRounds;

  if (reachedVictoryMomentum || reachedRoundLimit) {
    const winnerId =
      player.momentum === enemy.momentum ? 'draw' : player.momentum > enemy.momentum ? 'player' : 'enemy';

    return {
      ...state,
      screen: 'result',
      winnerId,
      players: { player, enemy },
      issueState,
      supportScore,
      factionResonance,
      battle: {
        ...state.battle,
        phase: 'issue_burst_check',
        recentIssuePushTotal: 0,
        lastBurstTriggeredRound: burstTriggeredRound,
        logs: [
          ...state.battle.logs,
          ...roundLogs,
          winnerId === 'draw' ? '本局平局' : `${winnerId === 'player' ? '我方' : '对手'}获得胜利`,
        ],
      },
    };
  }

  const nextRound = state.round + 1;
  const nextActive: PlayerId = state.activePlayerId === 'player' ? 'enemy' : 'player';
  const nextMaxMana = maxManaForRound(state.config, nextRound);

  const nextPlayers = {
    player: {
      ...player,
      maxMana: nextMaxMana,
      mana: nextActive === 'player' ? nextMaxMana : player.mana,
    },
    enemy: {
      ...enemy,
      maxMana: nextMaxMana,
      mana: nextActive === 'enemy' ? nextMaxMana : enemy.mana,
    },
  };

  nextPlayers[nextActive] = drawCards(nextPlayers[nextActive], 1);

  return {
    ...state,
    round: nextRound,
    activePlayerId: nextActive,
    players: nextPlayers,
    issueState,
    supportScore,
    factionResonance,
    battle: {
      ...state.battle,
      phase: 'hidden_submit' as BattlePhase,
      recentIssuePushTotal: 0,
      lastBurstTriggeredRound: burstTriggeredRound,
      logs: [
        ...state.battle.logs,
        ...roundLogs,
        `进入第 ${nextRound} 回合，${nextActive === 'player' ? '我方' : '对手'}行动`,
      ],
    },
  };
}
