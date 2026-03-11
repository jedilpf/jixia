import { Card, CharacterCard, GearCard, FieldCard, CharacterInstance, GearInstance, FieldInstance, PlayerState, GameState, PlayerId, GameLogEntry, GamePhase, Hero, takeDamage } from '@/types';
import { INITIAL_DECK } from '@/data/cards';
import { createHeroPower } from '@/data/hero';
import { parseAndExecuteSkill, TargetContext } from './effectEngine';

// ==================== 游戏初始化 ====================

export function createInitialPlayerState(): PlayerState {
  const deck = [...INITIAL_DECK];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return {
    hero: {
      hp: 30,
      maxHp: 30,
      armor: 0,
      weapon: null,
      heroPower: createHeroPower(),
      hasAttackedThisTurn: false,
      buffs: { huchi: 0, qishi: 0, qingming: 0, bilei: 0, xueshi: 0 },
      debuffs: { huaiyi: 0, chenmo: 0 },
      gear: null,
    },
    deck,
    hand: [],
    board: {
      front: [null, null, null],
      back: [null, null, null]
    },
    field: null,
    bookArea: [],
    mana: 1, // Start with 1 maybe? Or start with 0 and rely on writing books
    maxMana: 1,
    fatigue: 0,
    gold: 0, // 初始金币为0
  };
}

export function createInitialGameState(): GameState {
  const player = createInitialPlayerState();
  const enemy = createInitialPlayerState();

  // 初始抽5张牌 (加快启动速度)
  for (let i = 0; i < 5; i++) {
    drawCard(player);
    drawCard(enemy);
  }

  return {
    phase: 'start',
    currentPlayer: 'player',
    turnNumber: 1,
    player,
    enemy,
    winner: null,
    log: [createLogEntry(1, 'player', '论道开始！请开始你的思辨')],
  };
}

export function createLogEntry(turn: number, player: PlayerId, action: string): GameLogEntry {
  return {
    id: Math.random().toString(36).substring(2, 11),
    turn,
    player,
    action,
    timestamp: Date.now(),
  };
}

// ==================== 核心流转逻辑 ====================

export function drawCard(player: PlayerState): Card | null {
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

export function deepCopyGame(game: GameState): GameState {
  return JSON.parse(JSON.stringify(game)) as GameState;
}

export function startTurn(game: GameState, playerId: PlayerId): GameState {
  const newGame = deepCopyGame(game);
  const player = playerId === 'player' ? newGame.player : newGame.enemy;

  // 回复当前最大法力值 (不再自动增加 maxMana)
  player.mana = player.maxMana;

  // 抽牌
  drawCard(player);

  // 状态重置与触发回合开始
  const processStartTurn = (minion: CharacterInstance | null) => {
    if (minion) {
      minion.hasAttacked = false;
      minion.isExhausted = false;
      if (minion.skillDesc) {
        const ctx: TargetContext = { game: playerGame, sourcePlayerId: playerId, sourceInstance: minion };
        playerGame = parseAndExecuteSkill(ctx, minion.skillDesc, 'onStart');
      }
    }
  };

  let playerGame = newGame;
  playerGame.player.board.front.forEach(processStartTurn);
  playerGame.player.board.back.forEach(processStartTurn);
  playerGame.enemy.board.front.forEach(processStartTurn);
  playerGame.enemy.board.back.forEach(processStartTurn);

  // 英雄身上的装备和场地目前简略处理
  const activePlayer = playerId === 'player' ? playerGame.player : playerGame.enemy;
  if (activePlayer.field && activePlayer.field.skillDesc) {
    const ctx: TargetContext = { game: playerGame, sourcePlayerId: playerId };
    playerGame = parseAndExecuteSkill(ctx, activePlayer.field.skillDesc, 'onStart');
  }

  activePlayer.hero.heroPower.usedThisTurn = false;
  activePlayer.hero.hasAttackedThisTurn = false;

  return {
    ...playerGame,
    phase: (playerId === 'player' ? 'player_turn' : 'enemy_turn') as GamePhase,
    currentPlayer: playerId,
    log: [...playerGame.log, createLogEntry(playerGame.turnNumber, playerId, `回合开始，请作答`)],
  };
}

export function endTurn(game: GameState): GameState {
  let newGame = deepCopyGame(game);
  const currentPlayerId = newGame.currentPlayer;
  const activePlayer = currentPlayerId === 'player' ? newGame.player : newGame.enemy;

  // 触发回合结束效果
  const processEndTurn = (minion: CharacterInstance | null) => {
    if (minion && minion.skillDesc) {
      const ctx: TargetContext = { game: newGame, sourcePlayerId: currentPlayerId, sourceInstance: minion };
      newGame = parseAndExecuteSkill(ctx, minion.skillDesc, 'onEnd');
    }
  };

  newGame.player.board.front.forEach(processEndTurn);
  newGame.player.board.back.forEach(processEndTurn);
  newGame.enemy.board.front.forEach(processEndTurn);
  newGame.enemy.board.back.forEach(processEndTurn);

  if (activePlayer.field && activePlayer.field.skillDesc) {
    const ctx: TargetContext = { game: newGame, sourcePlayerId: currentPlayerId };
    newGame = parseAndExecuteSkill(ctx, activePlayer.field.skillDesc, 'onEnd');
  }

  const nextPlayer: PlayerId = currentPlayerId === 'player' ? 'enemy' : 'player';
  const turnNumber = nextPlayer === 'player' ? newGame.turnNumber + 1 : newGame.turnNumber;

  return {
    ...newGame,
    currentPlayer: nextPlayer,
    turnNumber,
    log: [...newGame.log, createLogEntry(game.turnNumber, currentPlayerId, '结束论述')],
  };
}

export function canPlayCard(player: PlayerState, card: Card): boolean {
  return player.mana >= card.cost;
}

// ==================== 新增机制：着书立说 ====================

export function writeBook(game: GameState, playerId: PlayerId, handIndex: number): GameState | null {
  const newGame = deepCopyGame(game);
  const player = playerId === 'player' ? newGame.player : newGame.enemy;
  const card = player.hand[handIndex];

  if (!card) return null;

  // 移除手牌
  player.hand.splice(handIndex, 1);
  // 加入简牍区
  player.bookArea.push(card);
  // 学识上限+1
  player.maxMana = Math.min(10, player.maxMana + 1);
  // 当前学识+1
  player.mana = Math.min(10, player.mana + 1);

  return {
    ...newGame,
    log: [...newGame.log, createLogEntry(newGame.turnNumber, playerId, `将【${card.name}】着成简牍，学识上限+1`)],
  };
}

// ==================== 出牌与解析 ====================

export function playCard(
  game: GameState,
  playerId: PlayerId,
  handIndex: number,
  targetPos?: { row: 'front' | 'back', col: number } // 角色下场的坐标
): GameState | null {
  const newGame = deepCopyGame(game);
  const player = playerId === 'player' ? newGame.player : newGame.enemy;
  const card = player.hand[handIndex];

  if (!card || !canPlayCard(player, card)) return null;

  // 角色牌
  if (card.type === 'character') {
    if (!targetPos) return null; // 必须指定位置
    const rowArray = targetPos.row === 'front' ? player.board.front : player.board.back;
    if (rowArray[targetPos.col] !== null) return null; // 该位置已有实体

    const charCard = card as CharacterCard;
    const charInstance: CharacterInstance = {
      instanceId: `${card.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      cardId: card.id,
      name: card.name,
      atk: charCard.atk,
      hp: charCard.hp,
      maxHp: charCard.hp,
      canAttack: true,
      hasAttacked: false,
      isExhausted: !charCard.hasCharge, // 如果有冲锋则不疲劳
      gear: null,
      buffs: { huchi: 0, qishi: 0, qingming: 0, bilei: 0, xueshi: 0 },
      debuffs: { huaiyi: 0, chenmo: 0 },
      status: [],
      rarity: charCard.rarity,
      hasTaunt: charCard.hasTaunt,
      hasCharge: charCard.hasCharge,
      skillDesc: charCard.skillDesc
    };

    player.mana -= card.cost;
    player.hand.splice(handIndex, 1);
    rowArray[targetPos.col] = charInstance;

    newGame.log.push(createLogEntry(newGame.turnNumber, playerId, `请出学派名士【${card.name}】`));

    // 触发登场效果
    const ctx: TargetContext = { game: newGame, sourcePlayerId: playerId, sourceInstance: charInstance };
    return parseAndExecuteSkill(ctx, charCard.skillDesc, 'onPlay');
  }

  // 事件 / 技能牌
  if (card.type === 'event' || card.type === 'skill') {
    player.mana -= card.cost;
    player.hand.splice(handIndex, 1);
    newGame.log.push(createLogEntry(newGame.turnNumber, playerId, `使用锦囊：【${card.name}】`));

    const ctx: TargetContext = { game: newGame, sourcePlayerId: playerId };
    return parseAndExecuteSkill(ctx, card.skillDesc, 'onPlay');
  }

  // 装备牌
  if (card.type === 'gear') {
    if (!targetPos) return null; // 必须指定位置
    const rowArray = targetPos.row === 'front' ? player.board.front : player.board.back;
    const targetMinion = rowArray[targetPos.col];
    if (!targetMinion) return null;

    const gearCard = card as GearCard;
    const gearInstance: GearInstance = {
      instanceId: `${card.id}_${Date.now()}`,
      cardId: gearCard.id,
      name: gearCard.name,
      atk: gearCard.atk,
      shield: gearCard.shield,
      skillDesc: gearCard.skillDesc
    };

    player.mana -= card.cost;
    player.hand.splice(handIndex, 1);

    // 附加数值
    if (gearInstance.atk) targetMinion.atk += gearInstance.atk;
    if (gearInstance.shield) targetMinion.buffs.huchi += gearInstance.shield;
    targetMinion.gear = gearInstance;

    newGame.log.push(createLogEntry(newGame.turnNumber, playerId, `为【${targetMinion.name}】装备了【${card.name}】`));
    // 触发装备生效效果
    const ctx: TargetContext = { game: newGame, sourcePlayerId: playerId, sourceInstance: targetMinion };
    return parseAndExecuteSkill(ctx, gearCard.skillDesc, 'onPlay');
  }

  // 场地牌
  if (card.type === 'field') {
    const fieldCard = card as FieldCard;
    const fieldInstance: FieldInstance = {
      instanceId: `${card.id}_${Date.now()}`,
      cardId: fieldCard.id,
      name: fieldCard.name,
      shield: fieldCard.shield,
      skillDesc: fieldCard.skillDesc
    };

    player.mana -= card.cost;
    player.hand.splice(handIndex, 1);
    player.field = fieldInstance;

    newGame.log.push(createLogEntry(newGame.turnNumber, playerId, `布置了场地：【${card.name}】`));

    const ctx: TargetContext = { game: newGame, sourcePlayerId: playerId };
    return parseAndExecuteSkill(ctx, fieldCard.skillDesc, 'onPlay');
  }

  return null;
}

// ==================== 攻击判定与结算 ====================

export function canTarget(board: { front: (CharacterInstance | null)[], back: (CharacterInstance | null)[] }, row: 'front' | 'back', col: number): boolean {
  if (row === 'front') return true;
  // 如果是后排（出世席），且同一列的前排（入世席）有单位，则无法被指向性攻击或法术选中
  if (row === 'back' && board.front[col] !== null) return false;
  return true;
}

export function performAttack(
  game: GameState,
  attackerPlayerId: PlayerId,
  attackerPos: { row: 'front' | 'back', col: number },
  targetPlayerId: PlayerId,
  targetPos: { row: 'front' | 'back', col: number } | 'hero'
): GameState | null {
  const newGame = deepCopyGame(game);
  const attackerPlayer = attackerPlayerId === 'player' ? newGame.player : newGame.enemy;
  const targetPlayer = targetPlayerId === 'player' ? newGame.player : newGame.enemy;

  const attackerRowArray = attackerPos.row === 'front' ? attackerPlayer.board.front : attackerPlayer.board.back;
  const attacker = attackerRowArray[attackerPos.col];

  if (!attacker || !attacker.canAttack || attacker.hasAttacked || attacker.isExhausted || attacker.atk <= 0) return null;

  let logAction = '';

  if (targetPos === 'hero') {
    // 前排入世席强制对位：若敌方有任何前排随从，必须先击败它们
    const hasFrontMinions = targetPlayer.board.front.some(m => m !== null);
    if (hasFrontMinions) return null;

    const damage = attacker.atk;
    targetPlayer.hero.hp -= damage;
    attacker.hasAttacked = true;
    logAction = `【${attacker.name}】直击道心，造成 ${damage} 点伤害`;
  } else {
    // 检查掩护机制
    if (!canTarget(targetPlayer.board, targetPos.row, targetPos.col)) {
      return null; // 后排被掩护，无法成为目标
    }

    const targetRowArray = targetPos.row === 'front' ? targetPlayer.board.front : targetPlayer.board.back;
    const target = targetRowArray[targetPos.col];
    if (!target) return null;

    // 使用 takeDamage 计算护甲（壁垒/护持/圣盾）
    takeDamage(target, attacker.atk);
    takeDamage(attacker, target.atk); // 反击

    logAction = `【${attacker.name}】与【${target.name}】交锋，字字诛心！`;

    if (target.hp <= 0) {
      targetRowArray[targetPos.col] = null;
      logAction += `【${target.name}】败退`;
      // 消灭敌方单位获得金币奖励
      if (attackerPlayerId === 'player') {
        attackerPlayer.gold += 2;
        logAction += ` (+2金币)`;
      }
    }
    if (attacker.hp <= 0) {
      attackerRowArray[attackerPos.col] = null;
    } else {
      attacker.hasAttacked = true;
    }
  }

  const winner = checkWinner(newGame);
  // 玩家胜利奖励金币（在此处结算，避免 checkWinner 产生副作用）
  if (winner === 'player') newGame.player.gold += 10;
  return {
    ...newGame,
    winner,
    phase: winner ? 'end' : newGame.phase,
    log: [...newGame.log, createLogEntry(newGame.turnNumber, attackerPlayerId, logAction)],
  };
}

export function checkWinner(game: GameState): PlayerId | null {
  if (game.player.hero.hp <= 0 && game.enemy.hero.hp <= 0) return 'enemy';
  if (game.player.hero.hp <= 0) return 'enemy';
  if (game.enemy.hero.hp <= 0) return 'player';
  return null;
}
// ==================== 英雄与战斗辅助 ====================

export function canUseHeroPower(player: PlayerState): boolean {
  return player.mana >= player.hero.heroPower.cost && !player.hero.heroPower.usedThisTurn;
}

export function activateHeroPower(game: GameState, playerId: PlayerId): GameState | null {
  const newGame = deepCopyGame(game);
  const player = playerId === 'player' ? newGame.player : newGame.enemy;

  if (!canUseHeroPower(player)) return null;

  player.mana -= player.hero.heroPower.cost;
  player.hero.heroPower.usedThisTurn = true;
  // 此处可添加具体英雄技能逻辑，目前仅抽卡示例
  drawCard(player);

  return {
    ...newGame,
    log: [...newGame.log, createLogEntry(newGame.turnNumber, playerId, `使用名士技能：【${player.hero.heroPower.name}】`)],
  };
}

export function canHeroAttack(hero: Hero): boolean {
  return hero.weapon !== null && hero.weapon.durability > 0 && !hero.hasAttackedThisTurn;
}

export function canAttack(minion: CharacterInstance): boolean {
  return minion.canAttack && !minion.hasAttacked && !minion.isExhausted && minion.atk > 0;
}

export function heroAttack(
  game: GameState,
  attackerPlayerId: PlayerId,
  targetPlayerId: PlayerId,
  targetPos: { row: 'front' | 'back', col: number } | 'hero'
): GameState | null {
  const newGame = deepCopyGame(game);
  const attackerPlayer = attackerPlayerId === 'player' ? newGame.player : newGame.enemy;
  const targetPlayer = targetPlayerId === 'player' ? newGame.player : newGame.enemy;

  const hero = attackerPlayer.hero;
  if (!canHeroAttack(hero) || !hero.weapon) return null;

  let logAction = '';

  if (targetPos === 'hero') {
    const damage = hero.weapon.atk;
    targetPlayer.hero.hp -= damage;
    hero.hasAttackedThisTurn = true;
    hero.weapon.durability -= 1;
    logAction = `主帅亲自出击，对敌方主帅造成 ${damage} 点伤害`;
  } else {
    if (!canTarget(targetPlayer.board, targetPos.row, targetPos.col)) {
      return null;
    }

    const targetRowArray = targetPos.row === 'front' ? targetPlayer.board.front : targetPlayer.board.back;
    const target = targetRowArray[targetPos.col];
    if (!target) return null;

    takeDamage(target, hero.weapon.atk); // 使用 takeDamage 计算护甲
    hero.hp -= target.atk; // 受到反击
    hero.hasAttackedThisTurn = true;
    hero.weapon.durability -= 1;

    logAction = `主帅亲自出击，攻击了【${target.name}】`;

    if (target.hp <= 0) {
      targetRowArray[targetPos.col] = null;
      logAction += `，【${target.name}】败退`;
    }
  }

  if (hero.weapon.durability <= 0) {
    hero.weapon = null;
  }

  const winner = checkWinner(newGame);
  if (winner === 'player') newGame.player.gold += 10;
  return {
    ...newGame,
    winner,
    phase: winner ? 'end' : newGame.phase,
    log: [...newGame.log, createLogEntry(newGame.turnNumber, attackerPlayerId, logAction)],
  };
}

export function getEmptySlotCenterOut(board: { front: (CharacterInstance | null)[], back: (CharacterInstance | null)[] }): { row: 'front' | 'back', col: number } | null {
  // 优先放前排入世席，优先级中间往两侧：1 -> 0 -> 2
  const cols = [1, 0, 2];
  for (const row of ['front', 'back'] as const) {
    for (const col of cols) {
      if (board[row][col] === null) {
        return { row, col };
      }
    }
  }
  return null;
}
