import { produce, Draft } from 'immer';
import type { 
  GameState, 
  PlayerState, 
  PlayerId, 
  Card, 
  CharacterCard, 
  CharacterInstance,
  Position,
  GamePhase,
  GameLogEntry
} from '../types/domain';
import { createInitialPlayerState } from '../models/factories';

// ==================== 不可变更新工具 ====================

export function updateGame(
  game: GameState,
  updater: (draft: Draft<GameState>) => void
): GameState {
  return produce(game, updater);
}

export function updatePlayer(
  player: PlayerState,
  updater: (draft: Draft<PlayerState>) => void
): PlayerState {
  return produce(player, updater);
}

// ==================== 游戏初始化 ====================

export function createInitialGameState(): GameState {
  const player = createInitialPlayerState();
  const enemy = createInitialPlayerState();

  // 初始抽5张牌
  for (let i = 0; i < 5; i++) {
    drawCardInternal(player);
    drawCardInternal(enemy);
  }

  return {
    phase: 'start' as GamePhase,
    currentPlayer: 'player' as PlayerId,
    turnNumber: 1,
    player,
    enemy,
    winner: null,
    log: [createLogEntry(1, 'player' as PlayerId, '论道开始！请开始你的思辨')],
  };
}

function createLogEntry(
  turn: number,
  player: PlayerId,
  action: string
): GameLogEntry {
  return {
    id: Math.random().toString(36).substr(2, 9),
    turn,
    player,
    action,
    timestamp: Date.now(),
  };
}

// ==================== 核心游戏逻辑 ====================

function drawCardInternal(player: PlayerState): Card | null {
  if (player.deck.length === 0) {
    player.fatigue++;
    player.hero.hp = Math.max(0, player.hero.hp - player.fatigue);
    return null;
  }
  const card = player.deck.pop()!;
  if (player.hand.length < 10) {
    player.hand.push(card);
  }
  return card;
}

export function drawCard(game: GameState, playerId: PlayerId): GameState {
  return updateGame(game, (draft) => {
    const player = playerId === 'player' ? draft.player : draft.enemy;
    drawCardInternal(player);
  });
}

export function startTurn(game: GameState, playerId: PlayerId): GameState {
  return updateGame(game, (draft) => {
    const player = playerId === 'player' ? draft.player : draft.enemy;
    
    // 回复法力
    player.mana = player.maxMana;
    
    // 抽牌
    drawCardInternal(player);
    
    // 重置随从状态
    const resetMinion = (minion: CharacterInstance | null) => {
      if (minion) {
        minion.hasAttacked = false;
        minion.isExhausted = false;
      }
    };
    
    draft.player.board.front.forEach(resetMinion);
    draft.player.board.back.forEach(resetMinion);
    draft.enemy.board.front.forEach(resetMinion);
    draft.enemy.board.back.forEach(resetMinion);
    
    // 重置英雄
    player.hero.heroPower.usedThisTurn = false;
    player.hero.hasAttackedThisTurn = false;
    
    // 更新游戏状态
    draft.phase = playerId === 'player' ? 'player_turn' : 'enemy_turn';
    draft.currentPlayer = playerId;
    draft.log.push(createLogEntry(draft.turnNumber, playerId, `回合开始，请作答`));
  });
}

export function endTurn(game: GameState): GameState {
  return updateGame(game, (draft) => {
    const currentPlayerId = draft.currentPlayer;
    const nextPlayer: PlayerId = currentPlayerId === 'player' ? 'enemy' : 'player';
    const turnNumber = nextPlayer === 'player' ? draft.turnNumber + 1 : draft.turnNumber;
    
    draft.currentPlayer = nextPlayer;
    draft.turnNumber = turnNumber;
    draft.log.push(createLogEntry(game.turnNumber, currentPlayerId, '结束论述'));
  });
}

// ==================== 卡牌打出逻辑 ====================

export function canPlayCard(player: PlayerState, card: Card): boolean {
  return player.mana >= card.cost;
}

export function playCard(
  game: GameState,
  playerId: PlayerId,
  handIndex: number,
  targetPos?: Position
): GameState | null {
  const player = playerId === 'player' ? game.player : game.enemy;
  const card = player.hand[handIndex];
  
  if (!card || !canPlayCard(player, card)) {
    return null;
  }

  return updateGame(game, (draft) => {
    const draftPlayer = playerId === 'player' ? draft.player : draft.enemy;
    const draftCard = draftPlayer.hand[handIndex];
    
    if (!draftCard) return;
    
    // 扣除法力
    draftPlayer.mana -= draftCard.cost;
    
    // 移除手牌
    draftPlayer.hand.splice(handIndex, 1);
    
    if (draftCard.type === 'character' && targetPos) {
      // 创建随从实例
      const charCard = draftCard as CharacterCard;
      const charInstance: CharacterInstance = {
        instanceId: `${draftCard.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        cardId: draftCard.id,
        name: draftCard.name,
        atk: charCard.atk,
        hp: charCard.hp,
        maxHp: charCard.hp,
        canAttack: true,
        hasAttacked: false,
        isExhausted: !charCard.hasCharge,
        gear: null,
        buffs: { huchi: 0, qishi: 0, qingming: 0, bilei: 0 },
        debuffs: { huaiyi: 0, chenmo: 0 },
        rarity: charCard.rarity,
        hasTaunt: charCard.hasTaunt,
        hasCharge: charCard.hasCharge,
        skillDesc: charCard.skillDesc,
      };
      
      // 放置到战场
      const rowArray = targetPos.row === 'front' 
        ? draftPlayer.board.front 
        : draftPlayer.board.back;
      rowArray[targetPos.col] = charInstance;
      
      draft.log.push(createLogEntry(draft.turnNumber, playerId, `请出学派名士【${draftCard.name}】`));
    } else {
      draft.log.push(createLogEntry(draft.turnNumber, playerId, `使用锦囊：【${draftCard.name}】`));
    }
  });
}

// ==================== 攻击逻辑 ====================

export function canAttack(minion: CharacterInstance): boolean {
  return minion.canAttack && !minion.hasAttacked && !minion.isExhausted && minion.atk > 0;
}

export function performAttack(
  game: GameState,
  attackerPlayerId: PlayerId,
  attackerPos: Position,
  targetPlayerId: PlayerId,
  targetPos: Position | 'hero'
): GameState | null {
  const attackerPlayer = attackerPlayerId === 'player' ? game.player : game.enemy;
  const attackerRowArray = attackerPos.row === 'front' 
    ? attackerPlayer.board.front 
    : attackerPlayer.board.back;
  const attacker = attackerRowArray[attackerPos.col];
  
  if (!attacker || !canAttack(attacker)) {
    return null;
  }

  return updateGame(game, (draft) => {
    const draftAttackerPlayer = attackerPlayerId === 'player' ? draft.player : draft.enemy;
    const draftTargetPlayer = targetPlayerId === 'player' ? draft.player : draft.enemy;
    const draftAttackerRow = attackerPos.row === 'front' 
      ? draftAttackerPlayer.board.front 
      : draftAttackerPlayer.board.back;
    const draftAttacker = draftAttackerRow[attackerPos.col];
    
    if (!draftAttacker) return;
    
    let logAction = '';
    
    if (targetPos === 'hero') {
      // 攻击英雄
      const damage = draftAttacker.atk;
      draftTargetPlayer.hero.hp -= damage;
      draftAttacker.hasAttacked = true;
      logAction = `【${draftAttacker.name}】直击道心，造成 ${damage} 点伤害`;
    } else {
      // 攻击随从
      const draftTargetRow = targetPos.row === 'front' 
        ? draftTargetPlayer.board.front 
        : draftTargetPlayer.board.back;
      const draftTarget = draftTargetRow[targetPos.col];
      
      if (!draftTarget) return;
      
      // 互相伤害
      draftTarget.hp -= draftAttacker.atk;
      draftAttacker.hp -= draftTarget.atk;
      
      logAction = `【${draftAttacker.name}】与【${draftTarget.name}】交锋，字字诛心！`;
      
      // 检查死亡
      if (draftTarget.hp <= 0) {
        draftTargetRow[targetPos.col] = null;
        logAction += `【${draftTarget.name}】败退`;
      }
      if (draftAttacker.hp <= 0) {
        draftAttackerRow[attackerPos.col] = null;
      } else {
        draftAttacker.hasAttacked = true;
      }
    }
    
    // 检查胜负
    if (draft.player.hero.hp <= 0) {
      draft.winner = 'enemy';
      draft.phase = 'end';
    } else if (draft.enemy.hero.hp <= 0) {
      draft.winner = 'player';
      draft.phase = 'end';
    }
    
    draft.log.push(createLogEntry(draft.turnNumber, attackerPlayerId, logAction));
  });
}

// ==================== 着书立说 ====================

export function writeBook(
  game: GameState,
  playerId: PlayerId,
  handIndex: number
): GameState | null {
  const player = playerId === 'player' ? game.player : game.enemy;
  const card = player.hand[handIndex];
  
  if (!card) return null;

  return updateGame(game, (draft) => {
    const draftPlayer = playerId === 'player' ? draft.player : draft.enemy;
    const draftCard = draftPlayer.hand[handIndex];
    
    if (!draftCard) return;
    
    // 移除手牌
    draftPlayer.hand.splice(handIndex, 1);
    // 加入简牍区
    draftPlayer.bookArea.push(draftCard);
    // 学识上限+1
    draftPlayer.maxMana = Math.min(10, draftPlayer.maxMana + 1);
    // 当前学识+1
    draftPlayer.mana = Math.min(10, draftPlayer.mana + 1);
    
    draft.log.push(
      createLogEntry(
        draft.turnNumber, 
        playerId, 
        `将【${draftCard.name}】着成简牍，学识上限+1`
      )
    );
  });
}

// ==================== 英雄技能 ====================

export function canUseHeroPower(player: PlayerState): boolean {
  return (
    player.mana >= player.hero.heroPower.cost && 
    !player.hero.heroPower.usedThisTurn
  );
}

export function activateHeroPower(
  game: GameState,
  playerId: PlayerId
): GameState | null {
  const player = playerId === 'player' ? game.player : game.enemy;
  
  if (!canUseHeroPower(player)) {
    return null;
  }

  return updateGame(game, (draft) => {
    const draftPlayer = playerId === 'player' ? draft.player : draft.enemy;
    
    draftPlayer.mana -= draftPlayer.hero.heroPower.cost;
    draftPlayer.hero.heroPower.usedThisTurn = true;
    
    // 抽一张牌作为示例
    drawCardInternal(draftPlayer);
    
    draft.log.push(
      createLogEntry(
        draft.turnNumber,
        playerId,
        `使用名士技能：【${draftPlayer.hero.heroPower.name}】`
      )
    );
  });
}

// ==================== 辅助函数 ====================

export function getEmptySlotCenterOut(
  board: PlayerState['board']
): Position | null {
  const priority: Position[] = [
    { row: 'front', col: 1 },
    { row: 'back', col: 1 },
    { row: 'front', col: 0 },
    { row: 'front', col: 2 },
    { row: 'back', col: 0 },
    { row: 'back', col: 2 },
  ];
  
  for (const pos of priority) {
    const rowArray = pos.row === 'front' ? board.front : board.back;
    if (rowArray[pos.col] === null) {
      return pos;
    }
  }
  
  return null;
}
