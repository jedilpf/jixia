import { GameState, PlayerId } from '@/types/battle';
import { CharacterInstance } from '@/types/instances';
import {
  DebateAction,
  SecretAction,
  SettlementItem,
} from '@/types/syncBattle';
import { parseAndExecuteSkill, TargetContext } from './effectEngine';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateSettlementQueue(
  playerDebate: DebateAction | null,
  enemyDebate: DebateAction | null,
  playerSecret: SecretAction | null,
  enemySecret: SecretAction | null
): SettlementItem[] {
  const queue: SettlementItem[] = [];

  if (playerDebate?.type === 'play_counter') {
    queue.push({
      id: generateId(),
      layer: 1,
      sourcePlayerId: 'player',
      card: undefined,
      effectType: 'counter',
      description: `玩家打出应对牌`,
    });
  }
  if (enemyDebate?.type === 'play_counter') {
    queue.push({
      id: generateId(),
      layer: 1,
      sourcePlayerId: 'enemy',
      card: undefined,
      effectType: 'counter',
      description: `敌方打出应对牌`,
    });
  }

  if (playerDebate?.type === 'play_main') {
    queue.push({
      id: generateId(),
      layer: 2,
      sourcePlayerId: 'player',
      card: undefined,
      effectType: 'main_thesis',
      description: `玩家打出主论牌`,
    });
  }
  if (enemyDebate?.type === 'play_main') {
    queue.push({
      id: generateId(),
      layer: 2,
      sourcePlayerId: 'enemy',
      card: undefined,
      effectType: 'main_thesis',
      description: `敌方打出主论牌`,
    });
  }

  queue.push({
    id: generateId(),
    layer: 3,
    sourcePlayerId: 'player',
    effectType: 'board_clash',
    description: `三席争鸣结算`,
  });

  if (playerSecret?.type === 'play_secret') {
    queue.push({
      id: generateId(),
      layer: 4,
      sourcePlayerId: 'player',
      card: undefined,
      effectType: 'secret',
      description: `玩家暗策生效`,
    });
  }
  if (enemySecret?.type === 'play_secret') {
    queue.push({
      id: generateId(),
      layer: 4,
      sourcePlayerId: 'enemy',
      card: undefined,
      effectType: 'secret',
      description: `敌方暗策生效`,
    });
  }

  queue.push({
    id: generateId(),
    layer: 5,
    sourcePlayerId: 'player',
    effectType: 'turn_end',
    description: `回合结束处理`,
  });

  return queue;
}

export function executeSettlementLayer(
  game: GameState,
  layer: 1 | 2 | 3 | 4 | 5,
  items: SettlementItem[]
): GameState {
  let newGame = JSON.parse(JSON.stringify(game)) as GameState;

  switch (layer) {
    case 1:
      newGame = executeLayer1_Counter(newGame, items);
      break;
    case 2:
      newGame = executeLayer2_MainThesis(newGame, items);
      break;
    case 3:
      newGame = executeLayer3_BoardClash(newGame);
      break;
    case 4:
      newGame = executeLayer4_Secret(newGame, items);
      break;
    case 5:
      newGame = executeLayer5_TurnEnd(newGame);
      break;
  }

  return newGame;
}

function executeLayer1_Counter(game: GameState, items: SettlementItem[]): GameState {
  let newGame = game;

  for (const item of items) {
    if (item.effectType === 'counter') {
      const ctx: TargetContext = {
        game: newGame,
        sourcePlayerId: item.sourcePlayerId,
      };
      newGame = parseAndExecuteSkill(ctx, '反制效果', 'onPlay');
    }
  }

  return newGame;
}

function executeLayer2_MainThesis(game: GameState, items: SettlementItem[]): GameState {
  let newGame = game;

  for (const item of items) {
    if (item.effectType === 'main_thesis' && item.card) {
      const ctx: TargetContext = {
        game: newGame,
        sourcePlayerId: item.sourcePlayerId,
        sourceInstance: item.sourceInstance,
      };
      newGame = parseAndExecuteSkill(ctx, item.card.skillDesc, 'onPlay');
    }
  }

  return newGame;
}

function executeLayer3_BoardClash(game: GameState): GameState {
  const newGame = JSON.parse(JSON.stringify(game)) as GameState;

  const playerFront = newGame.player.board.front;
  const enemyFront = newGame.enemy.board.front;

  for (let col = 0; col < 3; col++) {
    const playerMinion = playerFront[col];
    const enemyMinion = enemyFront[col];

    if (playerMinion && enemyMinion) {
      const playerAtk = playerMinion.atk + (playerMinion.buffs?.qishi || 0);
      const enemyAtk = enemyMinion.atk + (enemyMinion.buffs?.qishi || 0);

      playerMinion.hp -= enemyAtk;
      enemyMinion.hp -= playerAtk;

      if (playerMinion.hp <= 0) {
        playerFront[col] = null;
      }
      if (enemyMinion.hp <= 0) {
        enemyFront[col] = null;
      }
    }
  }

  return newGame;
}

function executeLayer4_Secret(game: GameState, items: SettlementItem[]): GameState {
  let newGame = game;

  for (const item of items) {
    if (item.effectType === 'secret' && item.card) {
      const ctx: TargetContext = {
        game: newGame,
        sourcePlayerId: item.sourcePlayerId,
        sourceInstance: item.sourceInstance,
      };
      newGame = parseAndExecuteSkill(ctx, item.card.skillDesc, 'onPlay');
    }
  }

  return newGame;
}

function executeLayer5_TurnEnd(game: GameState): GameState {
  const newGame = JSON.parse(JSON.stringify(game)) as GameState;

  const processEndTurn = (minion: CharacterInstance | null, playerId: PlayerId) => {
    if (minion && minion.skillDesc) {
      const ctx: TargetContext = {
        game: newGame,
        sourcePlayerId: playerId,
        sourceInstance: minion,
      };
      parseAndExecuteSkill(ctx, minion.skillDesc, 'onEnd');
    }
  };

  newGame.player.board.front.forEach(m => processEndTurn(m, 'player'));
  newGame.player.board.back.forEach(m => processEndTurn(m, 'player'));
  newGame.enemy.board.front.forEach(m => processEndTurn(m, 'enemy'));
  newGame.enemy.board.back.forEach(m => processEndTurn(m, 'enemy'));

  if (newGame.player.field?.skillDesc) {
    const ctx: TargetContext = { game: newGame, sourcePlayerId: 'player' };
    parseAndExecuteSkill(ctx, newGame.player.field.skillDesc, 'onEnd');
  }
  if (newGame.enemy.field?.skillDesc) {
    const ctx: TargetContext = { game: newGame, sourcePlayerId: 'enemy' };
    parseAndExecuteSkill(ctx, newGame.enemy.field.skillDesc, 'onEnd');
  }

  const decrementDebuffs = (minion: CharacterInstance | null) => {
    if (minion) {
      if (minion.debuffs.huaiyi > 0) minion.debuffs.huaiyi--;
      if (minion.debuffs.chenmo > 0) minion.debuffs.chenmo--;
    }
  };

  newGame.player.board.front.forEach(decrementDebuffs);
  newGame.player.board.back.forEach(decrementDebuffs);
  newGame.enemy.board.front.forEach(decrementDebuffs);
  newGame.enemy.board.back.forEach(decrementDebuffs);

  return newGame;
}

export class SettlementEngine {
  private game: GameState;
  private settlementLog: Array<{
    layer: number;
    item: SettlementItem;
    result: string;
    timestamp: number;
  }> = [];

  constructor(initialGame: GameState) {
    this.game = JSON.parse(JSON.stringify(initialGame));
  }

  getGame(): GameState {
    return this.game;
  }

  getSettlementLog(): typeof this.settlementLog {
    return this.settlementLog;
  }

  executeLayer(layer: 1 | 2 | 3 | 4 | 5, items: SettlementItem[]): GameState {
    const startTime = Date.now();

    for (const item of items) {
      const beforeState = JSON.stringify(this.game);
      
      this.game = executeSettlementLayer(this.game, layer, [item]);
      
      const afterState = JSON.stringify(this.game);
      const stateChanged = beforeState !== afterState;

      this.settlementLog.push({
        layer,
        item,
        result: stateChanged ? '已执行' : '无变化',
        timestamp: startTime,
      });
    }

    return this.game;
  }

  executeAllLayers(queue: SettlementItem[]): GameState {
    for (let layer = 1; layer <= 5; layer++) {
      const layerItems = queue.filter(item => item.layer === layer);
      this.executeLayer(layer as 1 | 2 | 3 | 4 | 5, layerItems);
    }
    return this.game;
  }

  exportLog(): string {
    return JSON.stringify(this.settlementLog, null, 2);
  }
}

export function createSettlementEngine(game: GameState): SettlementEngine {
  return new SettlementEngine(game);
}
