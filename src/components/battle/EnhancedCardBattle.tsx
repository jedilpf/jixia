// EnhancedCardBattle.tsx - 增强版卡牌战斗系统
// 包含拖拽功能、金币系统、回合时间控制

import { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CharacterCard } from '@/types';
import { INITIAL_DECK } from '@/data/cards';

// ==================== 类型定义 ====================

export type BattlePhase = 'player-turn' | 'game-over';
export type TurnStage = 'open' | 'hidden' | 'reveal' | 'resolve'; // 阶段

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
  armor: number; // 护印
  mana: number; // 灵势
  maxMana: number;
  ramp: number; // 文脉
  disorder: number; // 失序
  proof: number; // 证立
  weapon: { atk: number; durability: number } | null;
  hasAttacked: boolean;
  buffs: string[];
}

export interface BattleState {
  phase: BattlePhase;
  turn: number;
  turnStage: TurnStage;
  timeRemaining: number;
  player: {
    hero: BattleHero;
    deck: Card[];
    hand: Card[];
    board: {
      front: (BattleUnit | null)[];
      back: (BattleUnit | null)[];
    };
    actionSlots: {
      mainPlay: Card | null;
      response: Card | null;
      hidden: Card | null;
      writeBook: Card | null;
    };
    gold: number;
  };
  enemy: {
    hero: BattleHero;
    deck: Card[];
    hand: Card[];
    board: {
      front: (BattleUnit | null)[];
      back: (BattleUnit | null)[];
    };
    actionSlots: {
      mainPlay: Card | null;
      response: Card | null;
      hidden: Card | null;
      writeBook: Card | null;
    };
    gold: number;
  };
  selectedCard: Card | null;
  selectedUnit: BattleUnit | null;
  draggedCard: Card | null;
  dragPosition: { x: number; y: number } | null;
  gameLog: string[];
  winner: 'player' | 'enemy' | null;
}

// ==================== 全局事件 ====================
export const battleEvents = new EventTarget();
export const emitDamageEvent = (targetType: 'player-hero' | 'enemy-hero' | 'player-unit' | 'enemy-unit', row: 'front' | 'back' | null, col: number | null, amount: number) => {
  battleEvents.dispatchEvent(new CustomEvent('battle-damage', { detail: { targetType, row, col, amount } }));
};

// ==================== 初始状态 ====================

const createInitialHero = (): BattleHero => ({
  hp: 30,
  maxHp: 30,
  armor: 0,
  mana: 1,
  maxMana: 1,
  ramp: 0,
  disorder: 0,
  proof: 0,
  weapon: null,
  hasAttacked: false,
  buffs: [],
});

const createInitialBattleState = (): BattleState => ({
  phase: 'player-turn',
  turn: 1,
  turnStage: 'open',
  timeRemaining: 20,
  player: {
    hero: createInitialHero(),
    deck: [...INITIAL_DECK].sort(() => Math.random() - 0.5),
    hand: [],
    board: {
      front: [null, null, null],
      back: [null, null, null],
    },
    actionSlots: { mainPlay: null, response: null, hidden: null, writeBook: null },
    gold: 0,
  },
  enemy: {
    hero: createInitialHero(),
    deck: [...INITIAL_DECK].sort(() => Math.random() - 0.5),
    hand: [],
    board: {
      front: [null, null, null],
      back: [null, null, null],
    },
    actionSlots: { mainPlay: null, response: null, hidden: null, writeBook: null },
    gold: 0,
  },
  selectedCard: null,
  selectedUnit: null,
  draggedCard: null,
  dragPosition: null,
  gameLog: ['战斗开始！'],
  winner: null,
});

// ==================== 核心 Hook ====================

export function useEnhancedCardBattle() {
  const [battle, setBattle] = useState<BattleState>(createInitialBattleState());
  const isAnimating = false;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化抽牌
  useEffect(() => {
    setBattle(prev => {
      const newState = { ...prev };
      for (let i = 0; i < 5; i++) {
        const card = newState.player.deck.pop();
        if (card) newState.player.hand.push(card);
      }
      for (let i = 0; i < 5; i++) {
        const card = newState.enemy.deck.pop();
        if (card) newState.enemy.hand.push(card);
      }
      return newState;
    });
  }, []);

  // 回合计时器
  useEffect(() => {
    if (battle.turnStage === 'reveal' || battle.turnStage === 'resolve' || battle.phase === 'game-over') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setBattle(prev => {
        const newTime = prev.timeRemaining - 1;

        if (newTime <= 0) {
          // 时间到，进入揭示
          return { ...prev, timeRemaining: 0, turnStage: 'reveal' };
        }

        const newStage: TurnStage = newTime > 10 ? 'open' : 'hidden';

        return {
          ...prev,
          timeRemaining: newTime,
          turnStage: newStage,
        };
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [battle.turnStage, battle.phase]);

  // 阶段推进器 (Reveal -> Resolve -> Next Turn)
  useEffect(() => {
    if (battle.turnStage === 'reveal') {
      const timer = setTimeout(() => {
        setBattle(prev => {
          const newState = { ...prev };
          // 随机给敌方放一个单位，用于演示碰撞
          const emptyCols = [];
          for (let c = 0; c < 3; c++) if (!newState.enemy.board.front[c]) emptyCols.push(c);
          if (emptyCols.length > 0) {
            const randomCol = emptyCols[Math.floor(Math.random() * emptyCols.length)];
            newState.enemy.board.front[randomCol] = {
              id: `e_${Date.now()}`,
              cardId: 'dummy',
              name: '无名小卒',
              atk: Math.floor(Math.random() * 3) + 1,
              hp: Math.floor(Math.random() * 3) + 1,
              maxHp: 3,
              cost: 1,
              hasAttacked: false,
              isExhausted: false,
              buffs: [],
              position: { row: 'front', col: randomCol },
              owner: 'enemy'
            };
            addLog(newState, '揭示阶段：敌方亮出了隐密的部署！');
          }
          newState.turnStage = 'resolve';
          return newState;
        });
      }, 2000); // 揭示动画时长
      return () => clearTimeout(timer);
    }

    if (battle.turnStage === 'resolve') {
      const timer = setTimeout(() => {
        setBattle(prev => {
          const newState = { ...prev };
          resolveTurn(newState);

          if (newState.phase === 'game-over') return newState;

          newState.turn += 1;
          newState.timeRemaining = 20;
          newState.turnStage = 'open';

          // 重新初始化并抽手牌
          for (let i = 0; i < 2; i++) {
            const pCard = newState.player.deck.pop();
            if (pCard) newState.player.hand.push(pCard);
            const eCard = newState.enemy.deck.pop();
            if (eCard) newState.enemy.hand.push(eCard);
          }

          // 恢复费用
          newState.player.hero.maxMana = Math.min(10, 1 + newState.player.hero.ramp);
          newState.player.hero.mana = newState.player.hero.maxMana;
          newState.enemy.hero.maxMana = Math.min(10, 1 + newState.enemy.hero.ramp);
          newState.enemy.hero.mana = newState.enemy.hero.maxMana;

          // 角色重置
          const rows: ('front' | 'back')[] = ['front', 'back'];
          for (const row of rows) {
            for (const unit of newState.player.board[row]) {
              if (unit) { unit.hasAttacked = false; unit.isExhausted = false; }
            }
            for (const unit of newState.enemy.board[row]) {
              if (unit) { unit.hasAttacked = false; unit.isExhausted = false; }
            }
          }

          return newState;
        });
      }, 2000); // 等待结算完成
      return () => clearTimeout(timer);
    }
  }, [battle.turnStage]);

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

  // 开始拖拽
  const startDrag = useCallback((card: Card, x: number, y: number) => {
    setBattle(prev => ({
      ...prev,
      draggedCard: card,
      dragPosition: { x, y },
    }));
  }, []);

  // 更新拖拽位置
  const updateDrag = useCallback((x: number, y: number) => {
    setBattle(prev => ({
      ...prev,
      dragPosition: { x, y },
    }));
  }, []);

  // 结束拖拽
  const endDrag = useCallback((target?: { type: 'board'; row: 'front' | 'back'; col: number } | { type: 'slot'; name: string }) => {
    setBattle(prev => {
      if (!prev.draggedCard || !target) {
        return { ...prev, draggedCard: null, dragPosition: null };
      }

      const newState = { ...prev };
      const card = newState.draggedCard!;

      if (newState.player.hero.mana < card.cost) {
        addLog(newState, '灵势不足！');
        return { ...newState, draggedCard: null, dragPosition: null };
      }

      if (target.type === 'slot') {
        const slotName = target.name as keyof typeof newState.player.actionSlots;

        // 阶段限制
        if (newState.turnStage === 'open' && slotName === 'hidden') {
          addLog(newState, '明辩阶段不可放置暗策！');
          return { ...newState, draggedCard: null, dragPosition: null };
        }
        if (newState.turnStage === 'hidden' && slotName !== 'hidden') {
          addLog(newState, '暗谋阶段仅可放置暗策！');
          return { ...newState, draggedCard: null, dragPosition: null };
        }

        if (newState.player.actionSlots[slotName]) {
          addLog(newState, '该槽位已有卡牌！');
          return { ...newState, draggedCard: null, dragPosition: null };
        }

        newState.player.hero.mana -= card.cost;
        const handIndex = newState.player.hand.findIndex(c => c.id === card.id);
        if (handIndex >= 0) newState.player.hand.splice(handIndex, 1);

        newState.player.actionSlots[slotName] = card;
        addLog(newState, `准备了动作卡牌`);

        return { ...newState, draggedCard: null, dragPosition: null };
      }

      if (target.type === 'board' && card.type === 'character') {
        if (newState.turnStage === 'hidden') {
          addLog(newState, '暗谋阶段无法在明面上部署门客！');
          return { ...newState, draggedCard: null, dragPosition: null };
        }
        playCharacterCard(newState, card as CharacterCard, { row: target.row, col: target.col });
      }

      return { ...newState, draggedCard: null, dragPosition: null };
    });
  }, []);

  // 打出角色卡
  const playCharacterCard = (state: BattleState, card: CharacterCard, position: { row: 'front' | 'back'; col: number }) => {
    const { row, col } = position;
    if (state.player.board[row][col]) {
      addLog(state, '该位置已有单位');
      return;
    }

    // 消耗法力
    state.player.hero.mana -= card.cost;

    // 从手牌移除
    const handIndex = state.player.hand.findIndex(c => c.id === card.id);
    if (handIndex >= 0) state.player.hand.splice(handIndex, 1);

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

    // 触发效果
    if (card.skillDesc) {
      triggerCardEffect(state, unit, card.skillDesc);
    }
  };

  // 触发卡牌效果
  const triggerCardEffect = (state: BattleState, unit: BattleUnit, skillDesc: string) => {
    if (skillDesc.includes('造成')) {
      const match = skillDesc.match(/造成(\d+)点伤害/);
      if (match) {
        const damage = parseInt(match[1]);
        state.enemy.hero.hp = Math.max(0, state.enemy.hero.hp - damage);
        addLog(state, `${unit.name} 造成 ${damage} 点伤害`);
      }
    }
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
        const damage = attackerRef.atk;
        newState.enemy.hero.hp = Math.max(0, newState.enemy.hero.hp - damage);
        emitDamageEvent('enemy-hero', null, null, damage);
        addLog(newState, `${attackerRef.name} 攻击敌方英雄，造成 ${damage} 点伤害`);
      } else {
        const enemyUnit = target;
        const damageToEnemy = attackerRef.atk;
        const damageToAttacker = enemyUnit.atk;

        enemyUnit.hp -= damageToEnemy;
        attackerRef.hp -= damageToAttacker;

        const enemyPos = enemyUnit.position;
        const attackerPos = attackerRef.position;
        if (enemyPos) emitDamageEvent('enemy-unit', enemyPos.row, enemyPos.col, damageToEnemy);
        if (attackerPos) emitDamageEvent('player-unit', attackerPos.row, attackerPos.col, damageToAttacker);

        addLog(newState, `${attackerRef.name} 与 ${enemyUnit.name} 交战`);

        if (enemyUnit.hp <= 0) {
          removeDeadUnit(newState, enemyUnit);
        }
      }

      attackerRef.hasAttacked = true;
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
      const damage = weapon.atk;

      newState.enemy.hero.hp = Math.max(0, newState.enemy.hero.hp - damage);
      emitDamageEvent('enemy-hero', null, null, damage);
      weapon.durability--;

      if (weapon.durability <= 0) {
        newState.player.hero.weapon = null;
        addLog(newState, '武器已损坏');
      }

      newState.player.hero.hasAttacked = true;
      addLog(newState, `英雄攻击，造成 ${damage} 点伤害`);

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
          state.player.gold += 2;
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
      state.player.gold += 10;
      addLog(state, '玩家获胜！取得名实');
    } else if (state.player.hero.hp <= 0) {
      state.winner = 'enemy';
      state.phase = 'game-over';
      addLog(state, '敌方获胜！心证破灭');
    }
  };

  // 结算回合
  const resolveTurn = (state: BattleState) => {
    addLog(state, '=== 正在结算回合 ===');

    // 应对卡
    if (state.player.actionSlots.response) {
      addLog(state, `【应对】${state.player.actionSlots.response.name}`);
      if (state.player.actionSlots.response.skillDesc) {
        triggerCardEffect(state, state.player.hero as any, state.player.actionSlots.response.skillDesc);
      }
    }

    // 主论卡
    if (state.player.actionSlots.mainPlay) {
      addLog(state, `【主论】${state.player.actionSlots.mainPlay.name}`);
      if (state.player.actionSlots.mainPlay.skillDesc) {
        triggerCardEffect(state, state.player.hero as any, state.player.actionSlots.mainPlay.skillDesc);
      }
    }

    // 战场碰撞(2个议区独立结算)
    const laneNames = ['主议', '旁议'];
    for (let col = 0; col < 2; col++) {
      let pDmg = 0;
      let eDmg = 0;

      // 统计该列玩家总攻击力
      if (state.player.board.front[col]) pDmg += state.player.board.front[col]!.atk;
      if (state.player.board.back[col]) pDmg += state.player.board.back[col]!.atk;

      // 统计该列敌方总攻击力
      if (state.enemy.board.front[col]) eDmg += state.enemy.board.front[col]!.atk;
      if (state.enemy.board.back[col]) eDmg += state.enemy.board.back[col]!.atk;

      // 玩家伤害贯穿敌方
      let pRemaining = pDmg;
      if (pRemaining > 0) {
        const eFront = state.enemy.board.front[col];
        if (eFront) {
          const dmg = Math.min(eFront.hp, pRemaining);
          eFront.hp -= dmg;
          pRemaining -= dmg;
          emitDamageEvent('enemy-unit', 'front', col, dmg);
        }
      }
      if (pRemaining > 0) {
        const eBack = state.enemy.board.back[col];
        if (eBack) {
          const dmg = Math.min(eBack.hp, pRemaining);
          eBack.hp -= dmg;
          pRemaining -= dmg;
          emitDamageEvent('enemy-unit', 'back', col, dmg);
        }
      }
      if (pRemaining > 0) {
        state.enemy.hero.hp = Math.max(0, state.enemy.hero.hp - pRemaining);
        emitDamageEvent('enemy-hero', null, null, pRemaining);
      }

      // 敌方伤害贯穿玩家
      let eRemaining = eDmg;
      if (eRemaining > 0) {
        const pFront = state.player.board.front[col];
        if (pFront) {
          const dmg = Math.min(pFront.hp, eRemaining);
          pFront.hp -= dmg;
          eRemaining -= dmg;
          emitDamageEvent('player-unit', 'front', col, dmg);
        }
      }
      if (eRemaining > 0) {
        const pBack = state.player.board.back[col];
        if (pBack) {
          const dmg = Math.min(pBack.hp, eRemaining);
          pBack.hp -= dmg;
          eRemaining -= dmg;
          emitDamageEvent('player-unit', 'back', col, dmg);
        }
      }
      if (eRemaining > 0) {
        // 护印优先吸收
        if (state.player.hero.armor > 0) {
          const armorDmg = Math.min(state.player.hero.armor, eRemaining);
          state.player.hero.armor -= armorDmg;
          eRemaining -= armorDmg;
        }
        if (eRemaining > 0) {
          state.player.hero.hp = Math.max(0, state.player.hero.hp - eRemaining);
        }
      }

      // 判定死亡
      if (state.enemy.board.front[col] && state.enemy.board.front[col]!.hp <= 0) state.enemy.board.front[col] = null;
      if (state.enemy.board.back[col] && state.enemy.board.back[col]!.hp <= 0) state.enemy.board.back[col] = null;
      if (state.player.board.front[col] && state.player.board.front[col]!.hp <= 0) state.player.board.front[col] = null;
      if (state.player.board.back[col] && state.player.board.back[col]!.hp <= 0) state.player.board.back[col] = null;

      if (pDmg > 0 || eDmg > 0) {
        addLog(state, `【${laneNames[col]}争鸣】玩家火力:${pDmg} 敌方火力:${eDmg}`);
      }
    }

    // 暗策卡
    if (state.player.actionSlots.hidden) {
      addLog(state, `【暗策】揭开了 ${state.player.actionSlots.hidden.name}`);
      if (state.player.actionSlots.hidden.skillDesc) {
        triggerCardEffect(state, state.player.hero as any, state.player.actionSlots.hidden.skillDesc);
      }
    }

    // 着书卡
    if (state.player.actionSlots.writeBook) {
      addLog(state, `【着书】投资了 ${state.player.actionSlots.writeBook.name}，文脉+1`);
      state.player.hero.ramp += 1;
    }

    // 清理槽位
    state.player.actionSlots = { mainPlay: null, response: null, hidden: null, writeBook: null };
    state.enemy.actionSlots = { mainPlay: null, response: null, hidden: null, writeBook: null };

    checkWinCondition(state);
  };

  // 结束阶段（跳入下一个阶段）
  const endTurn = useCallback(() => {
    setBattle(prev => {
      // 只有在 turnStage = open / hidden 时才允许手动跳转
      if (prev.turnStage === 'open') {
        return { ...prev, turnStage: 'hidden', timeRemaining: 10 };
      }
      if (prev.turnStage === 'hidden') {
        return { ...prev, turnStage: 'reveal', timeRemaining: 0 };
      }
      return prev;
    });
  }, []);

  // 重新开始
  const restart = useCallback(() => {
    setBattle(createInitialBattleState());
  }, []);

  return {
    battle,
    isAnimating,
    selectCard,
    selectUnit,
    startDrag,
    updateDrag,
    endDrag,
    unitAttack,
    heroAttack,
    endTurn,
    restart,
  };
}

export default useEnhancedCardBattle;
