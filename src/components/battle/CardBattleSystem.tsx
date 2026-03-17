// CardBattleSystem.tsx - 卡牌战斗核心系统
// 实现与卡牌对战机制紧密关联的战斗逻辑

import { useState, useCallback, useEffect } from 'react';
import { Card, CharacterCard, SkillCard, EventCard, GearCard } from '@/types';
import { INITIAL_DECK } from '@/data/cards';

// ==================== 类型定义 ====================

export type BattlePhase = 'player-turn' | 'enemy-turn' | 'animating' | 'game-over';

export interface BattleUnit {
  id: string;
  cardId: string;
  name: string;
  atk: number;
  hp: number;
  maxHp: number;
  cost: number;
  hasAttacked: boolean;
  isExhausted: boolean;
  buffs: string[];
  position: { row: 'front' | 'back'; col: number } | null;
  owner: 'player' | 'enemy';
  image?: string;
}

export interface BattleHero {
  hp: number;
  maxHp: number;
  armor: number;
  mana: number;
  maxMana: number;
  weapon: { atk: number; durability: number } | null;
  hasAttacked: boolean;
  buffs: string[];
}

export interface BattleState {
  phase: BattlePhase;
  turn: number;
  player: {
    hero: BattleHero;
    deck: Card[];
    hand: Card[];
    board: {
      front: (BattleUnit | null)[];
      back: (BattleUnit | null)[];
    };
  };
  enemy: {
    hero: BattleHero;
    deck: Card[];
    hand: Card[];
    board: {
      front: (BattleUnit | null)[];
      back: (BattleUnit | null)[];
    };
  };
  selectedCard: Card | null;
  selectedUnit: BattleUnit | null;
  targetUnit: BattleUnit | null;
  animatingEffects: EffectAnimation[];
  gameLog: string[];
  winner: 'player' | 'enemy' | null;
}

export interface EffectAnimation {
  id: string;
  type: 'damage' | 'heal' | 'summon' | 'spell' | 'attack' | 'death';
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  value: number;
  isCritical: boolean;
  element: 'fire' | 'ice' | 'lightning' | 'poison' | 'holy' | 'shadow' | 'physical';
}

// ==================== 初始状态 ====================

const createInitialHero = (): BattleHero => ({
  hp: 30,
  maxHp: 30,
  armor: 0,
  mana: 1,
  maxMana: 1,
  weapon: null,
  hasAttacked: false,
  buffs: [],
});

const createInitialBattleState = (): BattleState => ({
  phase: 'player-turn',
  turn: 1,
  player: {
    hero: createInitialHero(),
    deck: [...INITIAL_DECK].sort(() => Math.random() - 0.5),
    hand: [],
    board: {
      front: [null, null, null],
      back: [null, null, null],
    },
  },
  enemy: {
    hero: createInitialHero(),
    deck: [...INITIAL_DECK].sort(() => Math.random() - 0.5),
    hand: [],
    board: {
      front: [null, null, null],
      back: [null, null, null],
    },
  },
  selectedCard: null,
  selectedUnit: null,
  targetUnit: null,
  animatingEffects: [],
  gameLog: ['战斗开始！'],
  winner: null,
});

// ==================== 核心 Hook ====================

export function useCardBattleSystem() {
  const [battle, setBattle] = useState<BattleState>(createInitialBattleState());
  const isAnimating = false;

  useEffect(() => {
    setBattle(prev => {
      const newState = { ...prev };
      // 玩家抽5张
      for (let i = 0; i < 5; i++) {
        const card = newState.player.deck.pop();
        if (card) newState.player.hand.push(card);
      }
      // 敌方抽5张
      for (let i = 0; i < 5; i++) {
        const card = newState.enemy.deck.pop();
        if (card) newState.enemy.hand.push(card);
      }
      return newState;
    });
  }, []);

  // 抽牌
  const drawCard = useCallback((player: 'player' | 'enemy') => {
    setBattle(prev => {
      const newState = { ...prev };
      const p = player === 'player' ? newState.player : newState.enemy;
      if (p.deck.length > 0 && p.hand.length < 10) {
        const card = p.deck.pop()!;
        p.hand.push(card);
        addLog(newState, `${player === 'player' ? '玩家' : '敌方'}抽取了卡牌`);
      }
      return newState;
    });
  }, []);

  // 添加日志
  const addLog = (state: BattleState, message: string) => {
    state.gameLog.unshift(`[回合${state.turn}] ${message}`);
    if (state.gameLog.length > 20) state.gameLog.pop();
  };

  // 选择卡牌
  const selectCard = useCallback((card: Card | null) => {
    setBattle(prev => ({ ...prev, selectedCard: card }));
  }, []);

  // 选择单位
  const selectUnit = useCallback((unit: BattleUnit | null) => {
    setBattle(prev => ({ ...prev, selectedUnit: unit }));
  }, []);

  // 使用卡牌
  const playCard = useCallback((card: Card, targetPosition?: { row: 'front' | 'back'; col: number }) => {
    setBattle(prev => {
      if (prev.phase !== 'player-turn' || isAnimating) return prev;
      
      const newState = { ...prev };
      const player = newState.player;
      
      // 检查法力值
      if (player.hero.mana < card.cost) {
        addLog(newState, '法力值不足！');
        return newState;
      }

      // 消耗法力
      player.hero.mana -= card.cost;
      
      // 从手牌移除
      const handIndex = player.hand.findIndex(c => c.id === card.id);
      if (handIndex >= 0) player.hand.splice(handIndex, 1);

      // 根据卡牌类型执行效果
      switch (card.type) {
        case 'character':
          return playCharacterCard(newState, card as CharacterCard, targetPosition);
        case 'skill':
        case 'event':
          return playSpellCard(newState, card as SkillCard | EventCard);
        case 'gear':
          return playGearCard(newState, card as GearCard);
      }

      return newState;
    });
  }, [isAnimating]);

  // 打出角色卡
  const playCharacterCard = (state: BattleState, card: CharacterCard, position?: { row: 'front' | 'back'; col: number }): BattleState => {
    if (!position) {
      addLog(state, '请选择放置位置');
      return state;
    }

    const { row, col } = position;
    if (state.player.board[row][col]) {
      addLog(state, '该位置已有单位');
      return state;
    }

    const unit: BattleUnit = {
      id: `unit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cardId: card.id,
      name: card.name,
      atk: card.atk,
      hp: card.hp,
      maxHp: card.hp,
      cost: card.cost,
      hasAttacked: false,
      isExhausted: true,
      buffs: [],
      position: { row, col },
      owner: 'player',
    };

    state.player.board[row][col] = unit;
    addLog(state, `召唤了 ${card.name}`);

    if (card.skillDesc) {
      triggerCardEffect(state, unit, card.skillDesc);
    }

    return state;
  };

  // 打出法术卡
  const playSpellCard = (state: BattleState, card: SkillCard | EventCard): BattleState => {
    addLog(state, `使用了法术 ${card.name}`);
    
    // 解析法术效果
    if (card.skillDesc) {
      const damageMatch = card.skillDesc.match(/造成(\d+)点伤害/);
      if (damageMatch) {
        const damage = parseInt(damageMatch[1]);
        state.enemy.hero.hp = Math.max(0, state.enemy.hero.hp - damage);
        addEffectAnimation(state, {
          type: 'spell',
          sourceX: 400,
          sourceY: 600,
          targetX: 400,
          targetY: 200,
          value: damage,
          isCritical: false,
          element: 'fire',
        });
        addLog(state, `对敌方英雄造成 ${damage} 点伤害`);
      }

      const healMatch = card.skillDesc.match(/回复(\d+)点生命/);
      if (healMatch) {
        const heal = parseInt(healMatch[1]);
        state.player.hero.hp = Math.min(state.player.hero.maxHp, state.player.hero.hp + heal);
        addLog(state, `回复了 ${heal} 点生命`);
      }

      const drawMatch = card.skillDesc.match(/抽(\d+)张/);
      if (drawMatch) {
        const count = parseInt(drawMatch[1]);
        for (let i = 0; i < count; i++) drawCard('player');
      }
    }

    return state;
  };

  // 打出装备卡
  const playGearCard = (state: BattleState, card: GearCard): BattleState => {
    state.player.hero.weapon = {
      atk: card.atk || 1,
      durability: card.durability || card.shield || 2,
    };
    addLog(state, `装备了 ${card.name}`);
    return state;
  };

  // 触发卡牌效果
  const triggerCardEffect = (state: BattleState, unit: BattleUnit, skillDesc: string) => {
    // 简单的效果解析
    if (skillDesc.includes('造成')) {
      const match = skillDesc.match(/造成(\d+)点伤害/);
      if (match) {
        const damage = parseInt(match[1]);
        state.enemy.hero.hp = Math.max(0, state.enemy.hero.hp - damage);
        addLog(state, `${unit.name} 造成 ${damage} 点伤害`);
      }
    }
    
    if (skillDesc.includes('抽')) {
      const match = skillDesc.match(/抽(\d+)张/);
      if (match) {
        const count = parseInt(match[1]);
        for (let i = 0; i < count; i++) drawCard('player');
      }
    }
  };

  // 添加效果动画
  const addEffectAnimation = (state: BattleState, effect: Omit<EffectAnimation, 'id'>) => {
    const id = `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    state.animatingEffects.push({ ...effect, id });
    
    // 3秒后移除动画
    setTimeout(() => {
      setBattle(prev => ({
        ...prev,
        animatingEffects: prev.animatingEffects.filter(e => e.id !== id),
      }));
    }, 3000);
  };

  // 单位攻击
  const unitAttack = useCallback((attacker: BattleUnit, target: BattleUnit | 'hero') => {
    setBattle(prev => {
      if (prev.phase !== 'player-turn' || isAnimating) return prev;
      if (attacker.hasAttacked || attacker.isExhausted) return prev;

      const newState = { ...prev };
      
      let attackerRef: BattleUnit | null = null;
      const rows: ('front' | 'back')[] = ['front', 'back'];
      for (const row of rows) {
        for (let col = 0; col < 3; col++) {
          const unit = newState.player.board[row][col];
          if (unit && unit.id === attacker.id) {
            attackerRef = unit;
            break;
          }
        }
        if (attackerRef) break;
      }

      if (!attackerRef) return newState;

      if (target === 'hero') {
        newState.enemy.hero.hp = Math.max(0, newState.enemy.hero.hp - attackerRef.atk);
        addLog(newState, `${attackerRef.name} 攻击敌方英雄，造成 ${attackerRef.atk} 点伤害`);
      } else {
        const enemyUnit = target;
        enemyUnit.hp -= attackerRef.atk;
        
        attackerRef.hp -= enemyUnit.atk;
        
        addLog(newState, `${attackerRef.name} 与 ${enemyUnit.name} 交战`);
        
        if (enemyUnit.hp <= 0) {
          removeDeadUnit(newState, enemyUnit);
        }
      }

      attackerRef.hasAttacked = true;

      // 检查胜利条件
      checkWinCondition(newState);

      return newState;
    });
  }, [isAnimating]);

  // 英雄攻击
  const heroAttack = useCallback(() => {
    setBattle(prev => {
      if (prev.phase !== 'player-turn' || isAnimating) return prev;
      if (prev.player.hero.hasAttacked || !prev.player.hero.weapon) return prev;

      const newState = { ...prev };
      const weapon = newState.player.hero.weapon!;
      
      newState.enemy.hero.hp = Math.max(0, newState.enemy.hero.hp - weapon.atk);
      weapon.durability--;
      
      if (weapon.durability <= 0) {
        newState.player.hero.weapon = null;
        addLog(newState, '武器已损坏');
      }

      newState.player.hero.hasAttacked = true;
      addLog(newState, `英雄攻击，造成 ${weapon.atk} 点伤害`);

      checkWinCondition(newState);
      return newState;
    });
  }, [isAnimating]);

  // 移除死亡单位
  const removeDeadUnit = (state: BattleState, unit: BattleUnit) => {
    const rows: ('front' | 'back')[] = ['front', 'back'];
    for (const row of rows) {
      for (let col = 0; col < 3; col++) {
        if (state.enemy.board[row][col]?.id === unit.id) {
          state.enemy.board[row][col] = null;
          addLog(state, `${unit.name} 被消灭`);
          return;
        }
      }
    }
  };

  // 检查胜利条件
  const checkWinCondition = (state: BattleState) => {
    if (state.enemy.hero.hp <= 0) {
      state.winner = 'player';
      state.phase = 'game-over';
      addLog(state, '玩家获胜！');
    } else if (state.player.hero.hp <= 0) {
      state.winner = 'enemy';
      state.phase = 'game-over';
      addLog(state, '敌方获胜！');
    }
  };

  // 结束回合
  const endTurn = useCallback(() => {
    setBattle(prev => {
      if (prev.phase !== 'player-turn') return prev;
      
      const newState = { ...prev };
      newState.phase = 'enemy-turn';
      
      const rows: ('front' | 'back')[] = ['front', 'back'];
      for (const row of rows) {
        for (const unit of newState.player.board[row]) {
          if (unit) {
            unit.hasAttacked = false;
            unit.isExhausted = false;
          }
        }
      }
      newState.player.hero.hasAttacked = false;

      addLog(newState, '玩家结束回合');
      return newState;
    });

    setTimeout(() => executeEnemyTurn(), 1000);
  }, []);

  // 敌方回合
  const executeEnemyTurn = () => {
    setBattle(prev => {
      const newState = { ...prev };
      
      // 增加法力
      newState.enemy.hero.maxMana = Math.min(10, newState.enemy.hero.maxMana + 1);
      newState.enemy.hero.mana = newState.enemy.hero.maxMana;
      
      // 抽牌
      if (newState.enemy.deck.length > 0 && newState.enemy.hand.length < 10) {
        const card = newState.enemy.deck.pop()!;
        newState.enemy.hand.push(card);
      }

      // 简单AI：随机使用手牌
      const playableCards = newState.enemy.hand.filter(c => c.cost <= newState.enemy.hero.mana);
      if (playableCards.length > 0) {
        const card = playableCards[Math.floor(Math.random() * playableCards.length)];
        newState.enemy.hero.mana -= card.cost;
        
        const handIndex = newState.enemy.hand.findIndex(c => c.id === card.id);
        if (handIndex >= 0) newState.enemy.hand.splice(handIndex, 1);
        
        addLog(newState, `敌方使用了 ${card.name}`);
        
        // 简单效果
        if (card.type === 'skill' || card.type === 'event') {
          const damageMatch = card.skillDesc?.match(/造成(\d+)点伤害/);
          if (damageMatch) {
            const damage = parseInt(damageMatch[1]);
            newState.player.hero.hp = Math.max(0, newState.player.hero.hp - damage);
          }
        }
      }

      const rows: ('front' | 'back')[] = ['front', 'back'];
      for (const row of rows) {
        for (const unit of newState.enemy.board[row]) {
          if (unit && !unit.hasAttacked) {
            newState.player.hero.hp = Math.max(0, newState.player.hero.hp - unit.atk);
            unit.hasAttacked = true;
            addLog(newState, `敌方 ${unit.name} 攻击，造成 ${unit.atk} 点伤害`);
          }
        }
      }

      checkWinCondition(newState);

      if (newState.winner) return newState;

      newState.turn++;
      newState.phase = 'player-turn';
      newState.player.hero.maxMana = Math.min(10, newState.player.hero.maxMana + 1);
      newState.player.hero.mana = newState.player.hero.maxMana;
      
      if (newState.player.deck.length > 0 && newState.player.hand.length < 10) {
        const card = newState.player.deck.pop()!;
        newState.player.hand.push(card);
      }

      for (const row of rows) {
        for (const unit of newState.enemy.board[row]) {
          if (unit) {
            unit.hasAttacked = false;
            unit.isExhausted = false;
          }
        }
      }
      newState.enemy.hero.hasAttacked = false;

      addLog(newState, `第 ${newState.turn} 回合开始`);
      
      return newState;
    });
  };

  // 重新开始
  const restart = useCallback(() => {
    setBattle(createInitialBattleState());
  }, []);

  return {
    battle,
    isAnimating,
    selectCard,
    selectUnit,
    playCard,
    unitAttack,
    heroAttack,
    endTurn,
    restart,
  };
}

export default useCardBattleSystem;
