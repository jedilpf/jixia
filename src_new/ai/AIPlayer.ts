import type { 
  GameState, 
  PlayerId, 
  Position, 
  CharacterInstance,
  Action,
  AIDifficulty,
  Card
} from '../types/domain';
import {
  playCard,
  performAttack,
  activateHeroPower,
  canPlayCard,
  canAttack,
  canUseHeroPower,
  getEmptySlotCenterOut,
  updateGame,
} from '../engine/GameEngine';

// ==================== AI 配置 ====================

interface AIConfig {
  thinkTime: number;
  randomness: number;
  aggressiveness: number;
}

const AI_CONFIGS: Record<AIDifficulty, AIConfig> = {
  easy: { thinkTime: 500, randomness: 0.3, aggressiveness: 0.5 },
  normal: { thinkTime: 1000, randomness: 0.15, aggressiveness: 0.7 },
  hard: { thinkTime: 2000, randomness: 0.05, aggressiveness: 0.9 },
};

// ==================== 场面评估 ====================

interface BoardValue {
  total: number;
  boardValue: number;
  handValue: number;
  healthValue: number;
  resourceValue: number;
}

export class BoardEvaluator {
  evaluate(game: GameState, playerId: PlayerId): number {
    const player = playerId === 'player' ? game.player : game.enemy;
    const enemy = playerId === 'player' ? game.enemy : game.player;
    
    let score = 0;
    
    // 1. 生命值评估 (0-30分)
    score += this.evaluateHealth(player.hero.hp, enemy.hero.hp);
    
    // 2. 场面价值
    score += this.evaluateBoard(player.board, enemy.board);
    
    // 3. 手牌价值
    score += this.evaluateHand(player.hand);
    
    // 4. 资源优势
    score += this.evaluateResources(player, enemy);
    
    return score;
  }
  
  private evaluateHealth(myHp: number, enemyHp: number): number {
    const myHealthScore = myHp;
    const enemyHealthScore = (30 - enemyHp) * 1.5;
    return myHealthScore + enemyHealthScore;
  }
  
  private evaluateBoard(
    myBoard: GameState['player']['board'], 
    enemyBoard: GameState['enemy']['board']
  ): number {
    const myMinions = [...myBoard.front, ...myBoard.back]
      .filter((m): m is CharacterInstance => m !== null);
    const enemyMinions = [...enemyBoard.front, ...enemyBoard.back]
      .filter((m): m is CharacterInstance => m !== null);
    
    const myValue = myMinions.reduce((sum, m) => 
      sum + m.atk * 2 + m.hp + (m.hasTaunt ? 3 : 0), 0
    );
    
    const enemyValue = enemyMinions.reduce((sum, m) => 
      sum + m.atk * 2 + m.hp + (m.hasTaunt ? 3 : 0), 0
    );
    
    return myValue - enemyValue;
  }
  
  private evaluateHand(hand: Card[]): number {
    return hand.reduce((sum, card) => {
      // 根据费用和类型估算价值
      let value = card.cost * 1.5;
      if (card.type === 'character') value += 2;
      return sum + value;
    }, 0);
  }
  
  private evaluateResources(
    player: GameState['player'], 
    enemy: GameState['enemy']
  ): number {
    let score = 0;
    
    // 法力优势
    score += (player.maxMana - enemy.maxMana) * 2;
    
    // 卡牌优势
    score += (player.hand.length - enemy.hand.length) * 3;
    
    // 牌库深度
    score += (player.deck.length - enemy.deck.length) * 0.5;
    
    return score;
  }
}

// ==================== 斩杀检测 ====================

export class LethalChecker {
  static canLethal(game: GameState, playerId: PlayerId): boolean {
    const player = playerId === 'player' ? game.player : game.enemy;
    const enemy = playerId === 'player' ? game.enemy : game.player;
    
    let totalDamage = 0;
    
    // 随从伤害
    const myMinions = [...player.board.front, ...player.board.back]
      .filter((m): m is CharacterInstance => m !== null)
      .filter(m => canAttack(m));
    
    totalDamage += myMinions.reduce((sum, m) => sum + m.atk, 0);
    
    // 英雄伤害
    if (!player.hero.hasAttackedThisTurn && player.hero.weapon) {
      totalDamage += player.hero.weapon.atk;
    }
    
    // 手牌伤害 (简化估算)
    totalDamage += this.estimateHandDamage(player.hand);
    
    // 考虑敌方护盾
    const effectiveHealth = enemy.hero.hp + enemy.hero.buffs.huchi;
    
    return totalDamage >= effectiveHealth;
  }
  
  private static estimateHandDamage(hand: Card[]): number {
    return hand.reduce((sum, card) => {
      // 简化估算：假设每张牌平均造成3点伤害
      if (card.type === 'skill' || card.type === 'event') {
        return sum + 3;
      }
      return sum;
    }, 0);
  }
  
  static getLethalSequence(game: GameState, playerId: PlayerId): Action[] {
    const actions: Action[] = [];
    const player = playerId === 'player' ? game.player : game.enemy;
    
    // 优先使用手牌增加伤害
    // ...
    
    // 随从攻击
    const myMinions = [...player.board.front, ...player.board.back]
      .filter((m): m is CharacterInstance => m !== null)
      .filter(m => canAttack(m));
    
    for (const minion of myMinions) {
      actions.push({
        type: 'attack',
        payload: { target: 'hero' },
      });
    }
    
    return actions;
  }
}

// ==================== AI 玩家 ====================

export class AIPlayer {
  private config: AIConfig;
  private evaluator: BoardEvaluator;
  
  constructor(difficulty: AIDifficulty = 'normal') {
    this.config = AI_CONFIGS[difficulty];
    this.evaluator = new BoardEvaluator();
  }
  
  async takeTurn(game: GameState): Promise<Action[]> {
    const actions: Action[] = [];
    let currentState = game;
    const playerId: PlayerId = 'enemy';
    
    // 模拟思考时间
    await this.think();
    
    // 1. 检查斩杀
    if (LethalChecker.canLethal(currentState, playerId)) {
      const lethalActions = LethalChecker.getLethalSequence(currentState, playerId);
      return lethalActions;
    }
    
    // 2. 使用英雄技能
    const heroPowerAction = this.tryUseHeroPower(currentState, playerId);
    if (heroPowerAction) {
      actions.push(heroPowerAction);
      currentState = activateHeroPower(currentState, playerId) || currentState;
      await this.think();
    }
    
    // 3. 打出卡牌
    while (true) {
      const cardAction = this.findBestCardToPlay(currentState, playerId);
      if (!cardAction) break;
      
      actions.push(cardAction);
      const newState = this.simulatePlayCard(currentState, playerId, cardAction);
      if (newState) {
        currentState = newState;
        await this.think();
      } else {
        break;
      }
    }
    
    // 4. 随从攻击
    while (true) {
      const attackAction = this.findBestAttack(currentState, playerId);
      if (!attackAction) break;
      
      actions.push(attackAction);
      const newState = this.simulateAttack(currentState, playerId, attackAction);
      if (newState) {
        currentState = newState;
        await this.think();
      } else {
        break;
      }
    }
    
    // 5. 英雄攻击
    const heroAttackAction = this.tryHeroAttack(currentState, playerId);
    if (heroAttackAction) {
      actions.push(heroAttackAction);
    }
    
    // 6. 结束回合
    actions.push({ type: 'end_turn' });
    
    return actions;
  }
  
  private async think(): Promise<void> {
    const thinkTime = this.config.thinkTime * (0.8 + Math.random() * 0.4);
    await new Promise(resolve => setTimeout(resolve, thinkTime));
  }
  
  private tryUseHeroPower(game: GameState, playerId: PlayerId): Action | null {
    const player = playerId === 'player' ? game.player : game.enemy;
    
    if (!canUseHeroPower(player)) return null;
    
    // 评估使用英雄技能的价值
    const score = this.evaluateHeroPower(game, playerId);
    
    if (score > 0 || Math.random() < this.config.randomness) {
      return { type: 'hero_power' };
    }
    
    return null;
  }
  
  private evaluateHeroPower(game: GameState, playerId: PlayerId): number {
    // 简化评估：抽牌技能价值为5
    return 5;
  }
  
  private findBestCardToPlay(game: GameState, playerId: PlayerId): Action | null {
    const player = playerId === 'player' ? game.player : game.enemy;
    const playableCards = player.hand
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => canPlayCard(player, card));
    
    if (playableCards.length === 0) return null;
    
    // 评估每张可打出的卡牌
    const evaluatedCards = playableCards.map(({ card, index }) => {
      const simulatedState = this.simulatePlayCard(game, playerId, {
        type: 'play_card',
        payload: { handIndex: index },
      });
      
      const score = simulatedState 
        ? this.evaluator.evaluate(simulatedState, playerId)
        : -Infinity;
      
      return { index, card, score };
    });
    
    // 选择最优卡牌 (带随机性)
    evaluatedCards.sort((a, b) => b.score - a.score);
    
    const topCards = evaluatedCards.slice(0, Math.max(1, Math.floor(evaluatedCards.length * 0.3)));
    const selected = topCards[Math.floor(Math.random() * topCards.length)];
    
    return {
      type: 'play_card',
      payload: { handIndex: selected.index },
    };
  }
  
  private findBestAttack(game: GameState, playerId: PlayerId): Action | null {
    const player = playerId === 'player' ? game.player : game.enemy;
    const enemy = playerId === 'player' ? game.enemy : game.player;
    
    // 获取所有可攻击的随从
    const attackers: { minion: CharacterInstance; position: Position }[] = [];
    
    ['front', 'back'].forEach((row) => {
      const rowArray = row === 'front' ? player.board.front : player.board.back;
      rowArray.forEach((minion, col) => {
        if (minion && canAttack(minion)) {
          attackers.push({ 
            minion, 
            position: { row: row as 'front' | 'back', col } 
          });
        }
      });
    });
    
    if (attackers.length === 0) return null;
    
    // 评估每个攻击选择
    const evaluatedAttacks: { attacker: typeof attackers[0]; target: Position | 'hero'; score: number }[] = [];
    
    for (const attacker of attackers) {
      // 尝试攻击英雄
      const heroAttackScore = this.evaluateAttack(game, playerId, attacker.position, 'hero');
      evaluatedAttacks.push({ attacker, target: 'hero', score: heroAttackScore });
      
      // 尝试攻击每个敌方随从
      ['front', 'back'].forEach((row) => {
        const rowArray = row === 'front' ? enemy.board.front : enemy.board.back;
        rowArray.forEach((targetMinion, col) => {
          if (targetMinion) {
            const targetPos = { row: row as 'front' | 'back', col };
            const score = this.evaluateAttack(game, playerId, attacker.position, targetPos);
            evaluatedAttacks.push({ attacker, target: targetPos, score });
          }
        });
      });
    }
    
    // 选择最优攻击
    evaluatedAttacks.sort((a, b) => b.score - a.score);
    
    if (evaluatedAttacks.length === 0) return null;
    
    const topAttacks = evaluatedAttacks.slice(0, Math.max(1, Math.floor(evaluatedAttacks.length * 0.3)));
    const selected = topAttacks[Math.floor(Math.random() * topAttacks.length)];
    
    return {
      type: 'attack',
      payload: {
        attackerPos: selected.attacker.position,
        target: selected.target,
      },
    };
  }
  
  private evaluateAttack(
    game: GameState, 
    playerId: PlayerId, 
    attackerPos: Position, 
    target: Position | 'hero'
  ): number {
    const simulatedState = this.simulateAttack(game, playerId, {
      type: 'attack',
      payload: { attackerPos, target },
    });
    
    if (!simulatedState) return -Infinity;
    
    return this.evaluator.evaluate(simulatedState, playerId);
  }
  
  private tryHeroAttack(game: GameState, playerId: PlayerId): Action | null {
    const player = playerId === 'player' ? game.player : game.enemy;
    
    if (player.hero.hasAttackedThisTurn || !player.hero.weapon) {
      return null;
    }
    
    // 简化：总是攻击英雄
    return {
      type: 'hero_attack',
      payload: { target: 'hero' },
    };
  }
  
  // ==================== 模拟执行 ====================
  
  private simulatePlayCard(game: GameState, playerId: PlayerId, action: Action): GameState | null {
    if (action.type !== 'play_card') return null;
    
    const handIndex = action.payload?.handIndex;
    if (handIndex === undefined) return null;
    
    const targetPos = getEmptySlotCenterOut(
      playerId === 'player' ? game.player.board : game.enemy.board
    );
    
    return playCard(game, playerId, handIndex, targetPos);
  }
  
  private simulateAttack(game: GameState, playerId: PlayerId, action: Action): GameState | null {
    if (action.type !== 'attack') return null;
    
    const { attackerPos, target } = action.payload || {};
    if (!attackerPos) return null;
    
    const enemyId: PlayerId = playerId === 'player' ? 'enemy' : 'player';
    return performAttack(game, playerId, attackerPos, enemyId, target);
  }
}

// ==================== 导出便捷函数 ====================

export async function executeAITurn(
  game: GameState, 
  difficulty: AIDifficulty = 'normal'
): Promise<Action[]> {
  const ai = new AIPlayer(difficulty);
  return ai.takeTurn(game);
}
