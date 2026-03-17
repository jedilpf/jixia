import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { LAYOUT, expandLayouts } from '@/config/layoutSpec';
import { GameState, PlayerId, SelectionState, DragState } from '@/types';
import { getEnemyActions } from '@/utils/aiLogic';
import {
  createInitialGameState,
  startTurn,
  canUseHeroPower,
  activateHeroPower,
  canPlayCard,
  playCard,
  canHeroAttack,
  heroAttack,
  canAttack,
  performAttack,
  endTurn,
  getEmptySlotCenterOut,
  writeBook,
} from '@/utils/gameLogic';
import {
  AttackAnimator,
  PlayCardAnimator,
  DamageNumberDisplay,
  useBattleAnimations,
} from './BattleAnimations';
import {
  HandCard,
  MinionCard,
  HeroCard,
  DeckPile,
  EmptySlot,
  DragGhost,
  BattleBackground,
  EndTurnButton,
  GameResultOverlay,
  HeroConsole,
  TurnBanner,
  CastingBar,
  SurrenderButton,
  SettingsButton,
  DropZoneHighlight,
  AttackPointer,
  BookArea,
  GoldDisplay,
} from './battle';
import { AppSettings, SystemModal, SettingsPanel } from './MainMenu';
import { ConfirmModal } from './battle/ConfirmModal';
import { dragManager } from './battle/DragManager';
import { useScale } from '@/hooks';
import { computeHandFan } from '@/utils/layoutMath';

// ==================== 类型定义 ====================

interface BattleLayoutProps {
  settings: AppSettings;
  onSettingsChange: (next: Partial<AppSettings>) => void;
  onMenu?: () => void;
}

// ==================== 视图层主组件 ====================

export function BattleLayout({ settings, onSettingsChange, onMenu }: BattleLayoutProps) {
  const { canvas, layouts } = LAYOUT;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ★ 拖拽时高亮的槽位 (用于 UI 反馈)
  const [hoveredSlot, setHoveredSlot] = useState<{ row: 'front' | 'back', col: number } | null>(null);

  const [hoveredHandIndex, setHoveredHandIndex] = useState<number | null>(null);
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);


  const [isEntering, setIsEntering] = useState(true); // 控制战场整体入场动画
  const [game, setGame] = useState<GameState>(() => createInitialGameState());
  const [selection, setSelection] = useState<SelectionState>({ type: 'none' });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    cardId: null,
    handIndex: null,
    startX: 0,
    startY: 0,
  });
  // attackState 已废弃，拖拽攻击指针由 dragAttackState 控制

  // 实体攻击动画状态 - 用于移动真实的卡牌/随从元素
  const [entityAttackState, setEntityAttackState] = useState<{
    isAttacking: boolean;
    attackerType: 'minion' | 'hero' | null;
    attackerPos: { row: 'front' | 'back'; col: number } | null;
    attackerPlayerId: 'player' | 'enemy' | null;
    targetType: 'minion' | 'hero' | null;
    targetPos: { row: 'front' | 'back'; col: number } | null;
    targetPlayerId: 'player' | 'enemy' | null;
    targetX: number;
    targetY: number;
    progress: number;
  }>({
    isAttacking: false,
    attackerType: null,
    attackerPos: null,
    attackerPlayerId: null,
    targetType: null,
    targetPos: null,
    targetPlayerId: null,
    targetX: 0,
    targetY: 0,
    progress: 0,
  });

  // 拖拽攻击状态 (startX/Y 存储屏幕坐标，给 AttackPointer 使用)
  const [dragAttackState, setDragAttackState] = useState<{
    isDragging: boolean;
    attackerType: 'minion' | 'hero' | null;
    attackerPos: { row: 'front' | 'back'; col: number } | null;
    startScreenX: number;
    startScreenY: number;
  }>({
    isDragging: false,
    attackerType: null,
    attackerPos: null,
    startScreenX: 0,
    startScreenY: 0,
  });

  // 法术条状态
  const [castingState, setCastingState] = useState<{
    isCasting: boolean;
    handIndex: number | null;
    target: string | null;
  }>({
    isCasting: false,
    handIndex: null,
    target: null,
  });

  // 战斗动画
  const {
    attackAnimations,
    playCardAnimations,
    damageNumbers,
    addPlayCardAnimation,
    addDamageNumber,
    removeAttackAnimation,
    removePlayCardAnimation,
    removeDamageNumber,
  } = useBattleAnimations();

  const { scaleInfo, screenToCanvas } = useScale(canvas.w, canvas.h);

  // 布局节点（不再包含手牌，手牌单独渲染）
  const layoutNodes = useMemo(() => {
    const baseLayouts = [...layouts];
    // 过滤掉手牌布局，手牌现在单独渲染
    const nonHandLayouts = baseLayouts.filter((node) => !node.id.includes('hand'));
    return expandLayouts(nonHandLayouts);
  }, [layouts]);

  // 获取节点位置
  const getNodePosition = useCallback(
    (nodeId: string) => {
      const node = layoutNodes.find((n) => n.id === nodeId);
      return node ? { x: node.x + node.w / 2, y: node.y + node.h / 2 } : { x: 0, y: 0 };
    },
    [layoutNodes]
  );

  // 执行带动画的攻击 - 使用实体元素移动
  const executeAttackWithAnimation = useCallback(
    (
      attackerType: 'minion' | 'hero',
      attackerPos: { row: 'front' | 'back'; col: number } | null,
      targetType: 'minion' | 'hero',
      targetPos: { row: 'front' | 'back'; col: number } | null
    ) => {
      // 获取目标位置
      const targetId = targetType === 'hero' ? 'enemy-hero' : `enemy-${targetPos?.row}-${targetPos?.col}`;
      const toPos = getNodePosition(targetId);

      // 开始实体攻击动画
      setEntityAttackState({
        isAttacking: true,
        attackerType,
        attackerPos,
        attackerPlayerId: 'player',
        targetType,
        targetPos,
        targetPlayerId: 'enemy',
        targetX: toPos.x,
        targetY: toPos.y,
        progress: 0,
      });

      // 获取攻击力和伤害值
      let damage = 0;
      if (attackerType === 'hero' && game.player.hero.weapon) {
        damage = game.player.hero.weapon.atk;
      } else if (attackerType === 'minion' && attackerPos !== null) {
        const minion = game.player.board[attackerPos.row][attackerPos.col];
        if (minion) damage = minion.atk;
      }

      // 动画进度更新
      const startTime = Date.now();
      const duration = 500; // 500ms 攻击动画

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        setEntityAttackState((prev) => ({
          ...prev,
          progress,
        }));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // 动画完成，执行实际攻击
          setTimeout(() => {
            if (attackerType === 'hero') {
              const result = heroAttack(game, 'player', 'enemy', targetPos ?? 'hero');
              if (result) setGame(result);
            } else if (attackerPos !== null) {
              const result = performAttack(game, 'player', attackerPos, 'enemy', targetPos ?? 'hero');
              if (result) setGame(result);
            }

            // 添加伤害数字
            if (damage > 0) {
              addDamageNumber({
                x: toPos.x,
                y: toPos.y - 50,
                damage,
              });
            }

            // 重置攻击状态
            setEntityAttackState({
              isAttacking: false,
              attackerType: null,
              attackerPos: null,
              attackerPlayerId: null,
              targetType: null,
              targetPos: null,
              targetPlayerId: null,
              targetX: 0,
              targetY: 0,
              progress: 0,
            });
          }, 100);
        }
      };

      requestAnimationFrame(animate);
    },
    [game, getNodePosition, addDamageNumber]
  );

  // 执行敌方出牌动画
  const executeEnemyPlayCardWithAnimation = useCallback(
    (
      card: { name: string; type: string },
      boardPos: { row: 'front' | 'back'; col: number },
      onComplete: () => void
    ) => {
      // 获取起始位置（敌方手牌区域）
      const fromX = 600;
      const fromY = 200;

      // 获取目标位置（战场槽位）
      const targetNodeId = `enemy-${boardPos.row}-${boardPos.col}`;
      const toPos = getNodePosition(targetNodeId);

      // 添加出牌动画
      addPlayCardAnimation({
        cardName: card.name,
        playerId: 'enemy',
        fromX,
        fromY,
        toX: toPos.x,
        toY: toPos.y,
      });

      // 延迟执行回调（等待动画完成）
      setTimeout(() => {
        onComplete();
      }, 500); // 500ms 后执行
    },
    [getNodePosition, addPlayCardAnimation]
  );

  // 执行敌方攻击动画 - 使用实体元素移动
  const executeEnemyAttackWithAnimation = useCallback(
    (
      attackerType: 'minion' | 'hero',
      attackerPos: { row: 'front' | 'back'; col: number } | null,
      targetType: 'minion' | 'hero',
      targetPos: { row: 'front' | 'back'; col: number } | null,
      onComplete: () => void
    ) => {
      // 获取目标位置
      const targetId = targetType === 'hero' ? 'player-hero' : `player-${targetPos?.row}-${targetPos?.col}`;
      const toPos = getNodePosition(targetId);

      // 开始实体攻击动画
      setEntityAttackState({
        isAttacking: true,
        attackerType,
        attackerPos,
        attackerPlayerId: 'enemy',
        targetType,
        targetPos,
        targetPlayerId: 'player',
        targetX: toPos.x,
        targetY: toPos.y,
        progress: 0,
      });

      // 获取攻击力和伤害值
      let damage = 0;
      if (attackerType === 'hero' && game.enemy.hero.weapon) {
        damage = game.enemy.hero.weapon.atk;
      } else if (attackerType === 'minion' && attackerPos !== null) {
        const minion = game.enemy.board[attackerPos.row][attackerPos.col];
        if (minion) damage = minion.atk;
      }

      // 动画进度更新
      const startTime = Date.now();
      const duration = 500;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        setEntityAttackState((prev) => ({
          ...prev,
          progress,
        }));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // 动画完成
          setTimeout(() => {
            // 添加伤害数字
            if (damage > 0) {
              addDamageNumber({
                x: toPos.x,
                y: toPos.y - 50,
                damage,
              });
            }
            onComplete();

            // 重置攻击状态
            setEntityAttackState({
              isAttacking: false,
              attackerType: null,
              attackerPos: null,
              attackerPlayerId: null,
              targetType: null,
              targetPos: null,
              targetPlayerId: null,
              targetX: 0,
              targetY: 0,
              progress: 0,
            });
          }, 100);
        }
      };

      requestAnimationFrame(animate);
    },
    [game, getNodePosition, addDamageNumber]
  );

  // 自动开始游戏首回合 & 入场动画解除
  useEffect(() => {
    // 短暂延迟后解除入场初始状态，触发 CSS 过渡
    const enterTimer = setTimeout(() => {
      setIsEntering(false);
    }, 100);

    if (game.phase === 'start') {
      const newGame = startTurn(game, 'player');
      setGame(newGame);
    }

    return () => clearTimeout(enterTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 开始游戏（保留兼容接口）
  const handleStartGame = useCallback(() => {
    const newGame = startTurn(game, 'player');
    setGame(newGame);
  }, [game]);

  // 结束回合（AI 使用预计算行动序列，解决闭包 Bug）
  const handleEndTurn = useCallback(() => {
    if (game.currentPlayer !== 'player' || game.winner) return;

    let curGame = endTurn(game);
    setGame(curGame);
    setSelection({ type: 'none' });

    setTimeout(() => {
      curGame = startTurn(curGame, 'enemy');
      setGame({ ...curGame });

      // 预先计算 AI 全部行动（基于此刻状态，避免闭包问题）
      const actions = getEnemyActions(curGame);
      let actionIndex = 0;

      const executeNextAction = () => {
        if (actionIndex >= actions.length) {
          // 所有行动完成，回到玩家回合
          curGame = endTurn(curGame);
          curGame = startTurn(curGame, 'player');
          setGame({ ...curGame });
          return;
        }

        const action = actions[actionIndex++];

        if (action.type === 'end_turn') {
          curGame = endTurn(curGame);
          curGame = startTurn(curGame, 'player');
          setGame({ ...curGame });
          return;
        }

        if (action.type === 'hero_power') {
          const result = activateHeroPower(curGame, 'enemy');
          if (result) { curGame = result; setGame({ ...curGame }); }
          setTimeout(executeNextAction, 300);

        } else if (action.type === 'play_card' && action.data) {
          const card = curGame.enemy.hand[action.data.handIndex as number];
          if (card) {
            executeEnemyPlayCardWithAnimation(card, action.data.boardPos as { row: 'front' | 'back', col: number }, () => {
              const result = playCard(curGame, 'enemy', action.data!.handIndex as number, action.data!.boardPos as { row: 'front' | 'back', col: number });
              if (result) { curGame = result; setGame({ ...curGame }); }
              if (curGame.winner) return;
              setTimeout(executeNextAction, 200);
            });
          } else {
            setTimeout(executeNextAction, 300);
          }

        } else if (action.type === 'hero_attack' && action.data) {
          const targetPos = action.data.targetPos as { row: 'front' | 'back', col: number } | 'hero';
          executeEnemyAttackWithAnimation(
            'hero', null,
            targetPos === 'hero' ? 'hero' : 'minion',
            targetPos === 'hero' ? null : targetPos as { row: 'front' | 'back', col: number },
            () => {
              const result = heroAttack(curGame, 'enemy', 'player', targetPos);
              if (result) { curGame = result; setGame({ ...curGame }); }
              if (curGame.winner) return;
              setTimeout(executeNextAction, 200);
            }
          );

        } else if (action.type === 'attack' && action.data) {
          const atkPos = action.data.attackerPos as { row: 'front' | 'back', col: number };
          const tgtPos = action.data.targetPos as { row: 'front' | 'back', col: number } | 'hero';
          executeEnemyAttackWithAnimation(
            'minion', atkPos,
            tgtPos === 'hero' ? 'hero' : 'minion',
            tgtPos === 'hero' ? null : tgtPos as { row: 'front' | 'back', col: number },
            () => {
              const result = performAttack(curGame, 'enemy', atkPos, 'player', tgtPos);
              if (result) { curGame = result; setGame({ ...curGame }); }
              if (curGame.winner) return;
              setTimeout(executeNextAction, 200);
            }
          );
        } else {
          setTimeout(executeNextAction, 150);
        }
      };

      setTimeout(executeNextAction, 300);
    }, 300);
  }, [game, executeEnemyAttackWithAnimation, executeEnemyPlayCardWithAnimation]);

  // 处理手牌点击 / 拖拽开始
  const handleHandPointerDown = useCallback(
    (e: React.PointerEvent, handIndex: number) => {
      e.preventDefault();
      // ★ 敌方回合禁止操作
      if (game.currentPlayer !== 'player' || game.winner) return;
      const card = game.player.hand[handIndex];
      if (!card || !canPlayCard(game.player, card)) return;

      const startClientX = e.clientX;
      const startClientY = e.clientY;
      let hasStartedDrag = false;

      // 如果当前卡牌已经是「选中」状态，响应拖拽的阈值调低 (更加跟手/即时)
      const isAlreadySelected = selection.type === 'card' && selection.playerId === 'player' && selection.handIndex === handIndex;
      const dragThreshold = isAlreadySelected ? 2 : 8;

      const handlePointerMove = (moveE: PointerEvent) => {
        const dx = moveE.clientX - startClientX;
        const dy = moveE.clientY - startClientY;
        if (!hasStartedDrag && Math.sqrt(dx * dx + dy * dy) > dragThreshold) {
          hasStartedDrag = true;
          // 开启拖拽模式
          const posCanvas = screenToCanvas(startClientX, startClientY);
          setDragState({
            isDragging: true,
            cardId: card.id,
            handIndex,
            startX: posCanvas.x,
            startY: posCanvas.y,
          });
          dragManager.startDrag('card', startClientX, startClientY, card);
          // 取消选中状态
          setSelection({ type: 'none' });
        }

        // 如果已经在拖拽中，实时计算经过的槽位以便高亮
        if (hasStartedDrag) {
          const posCanvas = screenToCanvas(moveE.clientX, moveE.clientY);
          let foundSlot = false;
          for (const row of ['front', 'back'] as const) {
            for (let col = 0; col < 3; col++) {
              const slotNode = layoutNodes.find((n) => n.id === `player-minion-${row}-${col}`);
              if (slotNode &&
                posCanvas.x >= slotNode.x - 20 && posCanvas.x <= slotNode.x + slotNode.w + 20 &&
                posCanvas.y >= slotNode.y - 20 && posCanvas.y <= slotNode.y + slotNode.h + 20
              ) {
                setHoveredSlot({ row, col });
                foundSlot = true;
                break;
              }
            }
            if (foundSlot) break;
          }
          if (!foundSlot) setHoveredSlot(null);
        }
      };

      const handlePointerUp = (upE: PointerEvent) => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        setHoveredSlot(null);

        if (!hasStartedDrag) {
          // ============ Click detected — toggle card selection ============
          const alreadySelected =
            selection.type === 'card' &&
            selection.playerId === 'player' &&
            selection.handIndex === handIndex;
          if (alreadySelected) {
            // 再次点击同一张 — 取消选中
            setSelection({ type: 'none' });
          } else {
            // 点击新卡牌 — 选中并锋定悬浮
            setSelection({
              type: 'card',
              playerId: 'player',
              handIndex,
            });
          }
          return;
        }

        // ============ Drag ended — 拖拽释放逻辑 ============
        dragManager.stopDrag();
        const posCanvas = screenToCanvas(upE.clientX, upE.clientY);

        let cardPlayed = false;

        // 扩大战场躻割区域：包括我方随从栏位（y 可能到 900）
        const battlefieldLeft = 200;
        const battlefieldRight = 1720;
        const battlefieldTop = 200;
        const battlefieldBottom = 940;

        const inBattlefieldArea =
          posCanvas.x >= battlefieldLeft &&
          posCanvas.x <= battlefieldRight &&
          posCanvas.y >= battlefieldTop &&
          posCanvas.y <= battlefieldBottom;

        if (inBattlefieldArea) {
          const isTargetlessCard = card.type === 'skill' || card.type === 'event' || card.type === 'field';
          if (isTargetlessCard) {
            const result = playCard(game, 'player', handIndex);
            if (result) { setGame(result); cardPlayed = true; }
          } else {
            // 首先尝试精确落入某个具体栏位
            let directPlaced = false;
            for (const row of ['front', 'back'] as const) {
              for (let col = 0; col < 3; col++) {
                const slotNode = layoutNodes.find((n) => n.id === `player-minion-${row}-${col}`);
                if (slotNode) {
                  // 扩大命中判定区域，给每个栏位加 20px 外边距
                  if (
                    posCanvas.x >= slotNode.x - 20 && posCanvas.x <= slotNode.x + slotNode.w + 20 &&
                    posCanvas.y >= slotNode.y - 20 && posCanvas.y <= slotNode.y + slotNode.h + 20
                  ) {
                    const minion = game.player.board[row][col];
                    if (card.type === 'character' && minion === null) {
                      const result = playCard(game, 'player', handIndex, { row, col });
                      if (result) { setGame(result); cardPlayed = true; }
                    } else if (card.type === 'gear' && minion !== null) {
                      const result = playCard(game, 'player', handIndex, { row, col });
                      if (result) { setGame(result); cardPlayed = true; }
                    }
                    directPlaced = true;
                    break;
                  }
                }
              }
              if (directPlaced) break;
            }
            // 如果没有精确命中某个栏位，自动选中心出的空栏
            if (!cardPlayed && card.type === 'character') {
              const emptySlot = getEmptySlotCenterOut(game.player.board);
              if (emptySlot) {
                const result = playCard(game, 'player', handIndex, emptySlot);
                if (result) { setGame(result); cardPlayed = true; }
              }
            }
          }
        }

        if (!cardPlayed) {
          const bookNode = layoutNodes.find(n => n.id === 'player-book');
          if (bookNode &&
            posCanvas.x >= bookNode.x && posCanvas.x <= bookNode.x + bookNode.w &&
            posCanvas.y >= bookNode.y && posCanvas.y <= bookNode.y + bookNode.h
          ) {
            const result = writeBook(game, 'player', handIndex);
            if (result) { setGame(result); cardPlayed = true; }
          }
        }

        setDragState({ isDragging: false, cardId: null, handIndex: null, startX: 0, startY: 0 });
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [game, layoutNodes, screenToCanvas, selection]
  );

  // 法术条确认施放 - 从中间向两侧展开
  const handleCastConfirm = useCallback(() => {
    if (!castingState.isCasting || castingState.handIndex === null) return;

    const card = game.player.hand[castingState.handIndex];
    if (!card) return;

    // 找到目标槽位
    let targetSlot: { row: 'front' | 'back', col: number } | null = null;
    if (castingState.target) {
      // 从目标字符串解析槽位坐标 (e.g. “槽位front-1”)
      const match = castingState.target.match(/槽位(front|back)-(\d+)/);
      if (match) {
        targetSlot = { row: match[1] as 'front' | 'back', col: parseInt(match[2]) };
      }
    }

    // 如果没有指定目标，使用从中间向两侧展开的策略
    if (targetSlot === null) {
      targetSlot = getEmptySlotCenterOut(game.player.board);
    }

    if (targetSlot !== null) {
      const result = playCard(game, 'player', castingState.handIndex, targetSlot);
      if (result) {
        setGame(result);
      }
    }

    // 重置法术条状态
    setCastingState({
      isCasting: false,
      handIndex: null,
      target: null,
    });
    setSelection({ type: 'none' });
  }, [castingState, game]);

  // 法术条取消
  const handleCastCancel = useCallback(() => {
    setCastingState({
      isCasting: false,
      handIndex: null,
      target: null,
    });
    setSelection({ type: 'none' });
  }, []);

  // 处理投降
  const handleSurrender = useCallback(() => {
    setShowSurrenderConfirm(true);
  }, []);

  const handleSurrenderConfirm = useCallback(() => {
    setShowSurrenderConfirm(false);
    setGame((prev) => ({
      ...prev,
      winner: 'enemy',
      phase: 'end',
      log: [...prev.log, { id: Date.now().toString(), turn: prev.turnNumber, player: 'player', action: '玩家投降', timestamp: Date.now() }],
    }));
  }, []);

  // 处理槽位点击（放置或攻击）
  const handleSlotClick = useCallback(
    (playerId: PlayerId, slotPos: { row: 'front' | 'back', col: number }) => {
      if (game.currentPlayer !== 'player' || game.winner) return;

      const isPlayerSlot = playerId === 'player';
      const slotRowArray = isPlayerSlot ? game.player.board[slotPos.row] : game.enemy.board[slotPos.row];
      const minion = slotRowArray[slotPos.col];

      // 如果是法术条模式下点击空槽位，选择目标
      if (isPlayerSlot && castingState.isCasting && !minion) {
        setCastingState((prev) => ({
          ...prev,
          target: `槽位${slotPos.row}-${slotPos.col}`,
        }));
        return;
      }

      // 如果是选择卡牌后点击空槽位，放置随从
      if (isPlayerSlot && selection.type === 'card' && selection.handIndex !== undefined && !minion) {
        const result = playCard(game, 'player', selection.handIndex, slotPos);
        if (result) {
          setGame(result);
          setSelection({ type: 'none' });
        }
        return;
      }

      // 如果是选择己方随从后点击敌方目标，攻击
      if (selection.type === 'minion' && selection.playerId === 'player' && !isPlayerSlot) {
        const result = performAttack(
          game,
          'player',
          selection.boardPos!,
          'enemy',
          minion ? slotPos : 'hero'
        );
        if (result) {
          setGame(result);
          setSelection({ type: 'none' });
        }
        return;
      }

      // 如果是选择英雄后点击敌方随从，英雄使用武器攻击
      if (selection.type === 'hero' && selection.playerId === 'player' && !isPlayerSlot && minion) {
        const result = heroAttack(game, 'player', 'enemy', slotPos);
        if (result) {
          setGame(result);
          setSelection({ type: 'none' });
        }
        return;
      }

      // 选择己方随从
      if (isPlayerSlot && minion && canAttack(minion)) {
        setSelection({
          type: 'minion',
          playerId: 'player',
          minionInstanceId: minion.instanceId,
          boardPos: slotPos,
        });
      }
    },
    [game, selection, castingState.isCasting]
  );

  // 处理英雄点击（攻击目标或选择英雄攻击）
  const handleHeroClick = useCallback(
    (playerId: PlayerId) => {
      if (game.currentPlayer !== 'player' || game.winner) return;
      if (playerId === 'player') return;

      // 随从攻击英雄
      if (selection.type === 'minion' && selection.playerId === 'player') {
        const result = performAttack(game, 'player', selection.boardPos!, 'enemy', 'hero');
        if (result) {
          setGame(result);
          setSelection({ type: 'none' });
        }
        return;
      }

      // 英雄使用武器攻击
      if (selection.type === 'hero' && selection.playerId === 'player') {
        const result = heroAttack(game, 'player', 'enemy', 'hero');
        if (result) {
          setGame(result);
          setSelection({ type: 'none' });
        }
      }
    },
    [game, selection]
  );

  // 处理英雄卡片点击（选择英雄进行攻击）
  const handleHeroCardClick = useCallback(
    (playerId: PlayerId) => {
      if (game.currentPlayer !== 'player' || game.winner) return;
      if (playerId !== 'player') return;
      if (!canHeroAttack(game.player.hero)) return;

      setSelection({
        type: 'hero',
        playerId: 'player',
      });
    },
    [game]
  );

  // 处理英雄技能点击
  const handleHeroPowerClick = useCallback(() => {
    if (game.currentPlayer !== 'player' || game.winner) return;
    if (!canUseHeroPower(game.player)) return;

    const result = activateHeroPower(game, 'player');
    if (result) {
      setGame(result);
    }
  }, [game]);

  // ==================== 拖拽攻击功能 ====================

  // 开始拖拽攻击（随从）
  const handleMinionDragStart = useCallback(
    (e: React.PointerEvent, pos: { row: 'front' | 'back', col: number }) => {
      e.preventDefault();
      // ★ 敌方回合禁止操作
      if (game.currentPlayer !== 'player' || game.winner) return;
      const minionRowArray = game.player.board[pos.row];
      const minion = minionRowArray[pos.col];
      if (!minion || !canAttack(minion)) return;

      setDragAttackState({
        isDragging: true,
        attackerType: 'minion',
        attackerPos: pos,
        startScreenX: e.clientX,
        startScreenY: e.clientY,
      });

      // 开启高性能拖拽引擎 — 传入屏幕坐标
      dragManager.startDrag('minion_attack', e.clientX, e.clientY);

      const handlePointerUp = (upE: PointerEvent) => {
        dragManager.stopDrag();
        const upPos = screenToCanvas(upE.clientX, upE.clientY);

        // 检查释放位置是否在敌方目标上
        // 1. 检查敌方英雄
        const enemyHeroNode = layoutNodes.find((n) => n.id === 'enemy-hero');
        if (enemyHeroNode) {
          if (
            upPos.x >= enemyHeroNode.x &&
            upPos.x <= enemyHeroNode.x + enemyHeroNode.w &&
            upPos.y >= enemyHeroNode.y &&
            upPos.y <= enemyHeroNode.y + enemyHeroNode.h
          ) {
            // 攻击敌方英雄 - 使用动画
            executeAttackWithAnimation('minion', pos, 'hero', null);
            setDragAttackState({
              isDragging: false,
              attackerType: null,
              attackerPos: null,
              startScreenX: 0,
              startScreenY: 0,
            });
            window.removeEventListener('pointerup', handlePointerUp);
            return;
          }
        }

        // 2. 检查敌方随从
        let targetFound = false;
        const rows: ('front' | 'back')[] = ['front', 'back'];
        for (const row of rows) {
          for (let col = 0; col < 3; col++) {
            const enemyMinionNode = layoutNodes.find((n) => n.id === `enemy-minion-${row}-${col}`);
            const enemyMinionRowArray = game.enemy.board[row];
            const enemyMinion = enemyMinionRowArray[col];
            if (enemyMinionNode && enemyMinion) {
              if (
                upPos.x >= enemyMinionNode.x &&
                upPos.x <= enemyMinionNode.x + enemyMinionNode.w &&
                upPos.y >= enemyMinionNode.y &&
                upPos.y <= enemyMinionNode.y + enemyMinionNode.h
              ) {
                // 攻击敌方随从 - 使用动画
                executeAttackWithAnimation('minion', pos, 'minion', { row, col });
                targetFound = true;
                break;
              }
            }
          }
          if (targetFound) break;
        }

        setDragAttackState({
          isDragging: false,
          attackerType: null,
          attackerPos: null,
          startScreenX: 0,
          startScreenY: 0,
        });

        window.removeEventListener('pointerup', handlePointerUp);
      };

      window.addEventListener('pointerup', handlePointerUp);
    },
    [game, layoutNodes, screenToCanvas, executeAttackWithAnimation]
  );

  // 开始拖拽攻击（英雄）
  const handleHeroDragStart = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();

      if (!canHeroAttack(game.player.hero)) return;
      if (game.currentPlayer !== 'player') return;



      setDragAttackState({
        isDragging: true,
        attackerType: 'hero',
        attackerPos: null,
        startScreenX: e.clientX,
        startScreenY: e.clientY,
      });

      // 开启高性能拖拽引擎 — 传入屏幕坐标
      dragManager.startDrag('hero_attack', e.clientX, e.clientY);

      const handlePointerUp = (upE: PointerEvent) => {
        dragManager.stopDrag();
        const upPos = screenToCanvas(upE.clientX, upE.clientY);

        // 检查释放位置是否在敌方目标上
        // 1. 检查敌方英雄
        const enemyHeroNode = layoutNodes.find((n) => n.id === 'enemy-hero');
        if (enemyHeroNode) {
          if (
            upPos.x >= enemyHeroNode.x &&
            upPos.x <= enemyHeroNode.x + enemyHeroNode.w &&
            upPos.y >= enemyHeroNode.y &&
            upPos.y <= enemyHeroNode.y + enemyHeroNode.h
          ) {
            // 英雄攻击敌方英雄 - 使用动画
            executeAttackWithAnimation('hero', null, 'hero', null);
            setDragAttackState({
              isDragging: false,
              attackerType: null,
              attackerPos: null,
              startScreenX: 0,
              startScreenY: 0,
            });
            window.removeEventListener('pointerup', handlePointerUp);
            return;
          }
        }

        // 2. 检查敌方随从
        let targetFound = false;
        const rows: ('front' | 'back')[] = ['front', 'back'];
        for (const row of rows) {
          for (let col = 0; col < 3; col++) {
            const enemyMinionNode = layoutNodes.find((n) => n.id === `enemy-minion-${row}-${col}`);
            const enemyMinionRowArray = game.enemy.board[row];
            const enemyMinion = enemyMinionRowArray[col];
            if (enemyMinionNode && enemyMinion) {
              if (
                upPos.x >= enemyMinionNode.x &&
                upPos.x <= enemyMinionNode.x + enemyMinionNode.w &&
                upPos.y >= enemyMinionNode.y &&
                upPos.y <= enemyMinionNode.y + enemyMinionNode.h
              ) {
                // 英雄攻击敌方随从 - 使用动画
                executeAttackWithAnimation('hero', null, 'minion', { row, col });
                targetFound = true;
                break;
              }
            }
          }
          if (targetFound) break;
        }

        setDragAttackState({
          isDragging: false,
          attackerType: null,
          attackerPos: null,
          startScreenX: 0,
          startScreenY: 0,
        });

        window.removeEventListener('pointerup', handlePointerUp);
      };

      window.addEventListener('pointerup', handlePointerUp);
    },
    [game, layoutNodes, screenToCanvas, executeAttackWithAnimation]
  );

  // 点击战场空置区域逻辑
  const handleBattlefieldClick = useCallback((e: React.MouseEvent) => {
    if (game.currentPlayer !== 'player' || game.winner) return;

    const pos = screenToCanvas(e.clientX, e.clientY);

    // 如果当前有卡牌选中
    if (selection.type === 'card' && selection.handIndex !== undefined) {
      // 1. 如果点击的是战场逻辑区域 (y 200-940) -> 尝试出牌
      if (pos.y <= 940) {
        const handIndex = selection.handIndex;
        const card = game.player.hand[handIndex];
        if (!card) { setSelection({ type: 'none' }); return; }

        const isTargetlessCard = card.type === 'skill' || card.type === 'event' || card.type === 'field';
        if (isTargetlessCard) {
          const result = playCard(game, 'player', handIndex);
          if (result) { setGame(result); setSelection({ type: 'none' }); }
        } else {
          const emptySlot = getEmptySlotCenterOut(game.player.board);
          if (emptySlot) {
            const result = playCard(game, 'player', handIndex, emptySlot);
            if (result) { setGame(result); setSelection({ type: 'none' }); }
          }
        }
      } else {
        // 2. 如果点击的是手牌下方或空白边缘 -> 取消选中
        setSelection({ type: 'none' });
      }
    } else {
      // 如果没有选中任何东西，点击画布空白处确保清除所有状态
      setSelection({ type: 'none' });
    }
  }, [game, selection, screenToCanvas]);

  // 渲染游戏
  const renderGame = () => {
    const scale = scaleInfo.scale;

    return (
      <>
        {/* 敌方英雄 */}
        {layoutNodes
          .filter((n) => n.id.includes('enemy-hero'))
          .map((node) => (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: `${node.x * scale}px`,
                top: `${node.y * scale}px`,
                width: `${node.w * scale}px`,
                height: `${node.h * scale}px`,
              }}
            >
              <HeroCard
                hero={game.enemy.hero}
                isEnemy={true}
                canBeAttacked={selection.type === 'minion' && selection.playerId === 'player' || selection.type === 'hero' && selection.playerId === 'player'}
                onClick={() => handleHeroClick('enemy')}
              />
            </div>
          ))}

        {/* 我方英雄 */}
        {layoutNodes
          .filter((n) => n.id.includes('player-hero'))
          .map((node) => (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: `${node.x * scale}px`,
                top: `${node.y * scale}px`,
                width: `${node.w * scale}px`,
                height: `${node.h * scale}px`,
              }}
              onPointerDown={(e) => handleHeroDragStart(e)}
            >
              <HeroCard
                hero={game.player.hero}
                isEnemy={false}
                isSelected={selection.type === 'hero' && selection.playerId === 'player'}
                onClick={() => handleHeroCardClick('player')}
                style={{ cursor: canHeroAttack(game.player.hero) ? 'grab' : 'default' }}
              />
            </div>
          ))}

        {/* ★ 综合控制台（机关仪表盘）—— 取代散落的技能/法力/武器 */}
        {(() => {
          const consoleNode = layoutNodes.find((n) => n.id === 'player-console');
          return consoleNode ? (
            <HeroConsole
              player={game.player}
              turn={game.turnNumber}
              canUsePower={canUseHeroPower(game.player)}
              isPowerSelected={selection.type === 'hero_power'}
              isPlayerTurn={game.currentPlayer === 'player'}
              onPowerClick={() => handleHeroPowerClick()}
              scale={scale}
              x={consoleNode.x}
              y={consoleNode.y}
            />
          ) : null;
        })()}

        {/* 金币显示 */}
        <GoldDisplay gold={game.player.gold} scale={scale} x={20} y={80} />

        {/* 敌方随从槽位 */}
        {layoutNodes
          .filter((n) => n.id.startsWith('enemy-minion-'))
          .map((node) => {
            const parts = node.id.split('-');
            const row = parts[2] as 'front' | 'back';
            const col = parseInt(parts[3] || '0');
            const minionRowArray = row === 'front' ? game.enemy.board.front : game.enemy.board.back;
            const minion = minionRowArray[col];

            // 检查这个随从是否在攻击
            const isAttackingEnemy = entityAttackState.isAttacking &&
              entityAttackState.attackerType === 'minion' &&
              entityAttackState.attackerPos?.row === row &&
              entityAttackState.attackerPos?.col === col &&
              entityAttackState.attackerPlayerId === 'enemy';

            return minion ? (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: `${node.x * scale}px`,
                  top: `${node.y * scale}px`,
                  width: `${node.w * scale}px`,
                  height: `${node.h * scale}px`,
                }}
                onClick={() => handleSlotClick('enemy', { row, col })}
              >
                <MinionCard
                  minion={minion}
                  isEnemy={true}
                  canAttack={false}
                  isAttacking={isAttackingEnemy}
                />
              </div>
            ) : (
              <EmptySlot key={node.id} showBorder={false} scale={scale} x={node.x} y={node.y} w={node.w} h={node.h} />
            );
          })}

        {/* 我方随从槽位 */}
        {layoutNodes
          .filter((n) => n.id.startsWith('player-minion-'))
          .map((node) => {
            const parts = node.id.split('-');
            const row = parts[2] as 'front' | 'back';
            const col = parseInt(parts[3] || '0');
            const minionRowArray = row === 'front' ? game.player.board.front : game.player.board.back;
            const minion = minionRowArray[col];
            const isSelected =
              selection.type === 'minion' &&
              selection.playerId === 'player' &&
              selection.boardPos?.row === row &&
              selection.boardPos?.col === col;
            const isHighlighted =
              selection.type === 'card' &&
              selection.playerId === 'player' &&
              !minion &&
              canPlayCard(game.player, game.player.hand[selection.handIndex!]);

            // 检查这个随从是否在攻击
            const isAttacking = entityAttackState.isAttacking &&
              entityAttackState.attackerType === 'minion' &&
              entityAttackState.attackerPos?.row === row &&
              entityAttackState.attackerPos?.col === col &&
              entityAttackState.attackerPlayerId === 'player';

            return minion ? (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: `${node.x * scale}px`,
                  top: `${node.y * scale}px`,
                  width: `${node.w * scale}px`,
                  height: `${node.h * scale}px`,
                  opacity: isEntering ? 0 : 1,
                  transition: `opacity 0.5s ease-out ${0.4 + (row === 'front' ? 0.0 : 0.1) + col * 0.05}s`,
                }}
              >
                <MinionCard
                  minion={minion}
                  isEnemy={false}
                  isSelected={isSelected}
                  canAttack={canAttack(minion) && !minion.isExhausted}
                  isAttacking={isAttacking}
                  onClick={() => handleSlotClick('player', { row, col })}
                  onPointerDown={(e: React.PointerEvent) => handleMinionDragStart(e, { row, col })}
                />
              </div>
            ) : (
              <EmptySlot
                key={node.id}
                isHighlighted={isHighlighted}
                showBorder={false}
                onClick={() => handleSlotClick('player', { row, col })}
                scale={scale}
                x={node.x}
                y={node.y}
                w={node.w}
                h={node.h}
              />
            );
          })}

        {/* 我方简牍区 */}
        {
          layoutNodes
            .filter((n) => n.id === 'player-book')
            .map((node) => (
              <BookArea
                key={node.id}
                books={game.player.bookArea}
                isEnemy={false}
                scale={scale}
                x={node.x}
                y={node.y}
                w={node.w}
                h={node.h}
                isDraggingOver={(() => {
                  if (!dragState.isDragging) return false;
                  const pos = dragManager.getCurrentPos();
                  return (
                    pos.x >= node.x &&
                    pos.x <= node.x + node.w &&
                    pos.y >= node.y &&
                    pos.y <= node.y + node.h
                  );
                })()}
              />
            ))
        }

        {/* 敌方简牍区 */}
        {
          layoutNodes
            .filter((n) => n.id === 'enemy-book')
            .map((node) => (
              <BookArea
                key={node.id}
                books={game.enemy.bookArea}
                isEnemy={true}
                scale={scale}
                x={node.x}
                y={node.y}
                w={node.w}
                h={node.h}
              />
            ))
        }

        {/* 敌方牌库 */}
        {
          layoutNodes
            .filter((n) => n.id.includes('enemy-deck'))
            .map((node) => (
              <DeckPile
                key={node.id}
                count={game.enemy.deck.length}
                isEnemy={true}
                scale={scale}
                x={node.x}
                y={node.y}
                w={node.w}
                h={node.h}
              />
            ))
        }

        {/* 我方牌库 */}
        {
          layoutNodes
            .filter((n) => n.id.includes('player-deck'))
            .map((node) => (
              <DeckPile
                key={node.id}
                count={game.player.deck.length}
                isEnemy={false}
                scale={scale}
                x={node.x}
                y={node.y}
                w={node.w}
                h={node.h}
              />
            ))
        }

        {/* 敌方手牌 - 左侧水平排列，保持最上层 */}
        {
          (() => {
            const enemyPoses = computeHandFan(game.enemy.hand.length, 450, 40, {
              direction: 'down',
              radius: 0,
              maxAngleDeg: 0,
              reverse: true,
            });
            return game.enemy.hand.map((card, index) => {
              const pose = enemyPoses[index];
              if (!pose) return null;
              return (
                <HandCard
                  key={`enemy-hand-${index}`}
                  card={card}
                  index={index}
                  isPlayable={false}
                  isEnemy={true}
                  scale={scale}
                  x={pose.x}
                  y={pose.y}
                  rotation={pose.rot}
                  zIndex={2000 + pose.z}
                />
              );
            });
          })()
        }

        {/* 我方手牌 - 底部扇形正面（开口朝下） */}
        {
          (() => {
            const playerPoses = computeHandFan(game.player.hand.length, 960, 1040, {
              direction: 'down',
              radius: 650,
              maxAngleDeg: 28,
              reverse: false,
              hoveredIndex: dragState.isDragging ? null : hoveredHandIndex,
            });
            return game.player.hand.map((card, index) => {
              const pose = playerPoses[index];
              if (!pose) return null;
              const isPlayable = canPlayCard(game.player, card);
              const isCardSelected =
                selection.type === 'card' &&
                selection.playerId === 'player' &&
                selection.handIndex === index;
              return (
                <HandCard
                  key={`player-hand-${index}`}
                  card={card}
                  index={index}
                  isPlayable={isPlayable}
                  isSelected={isCardSelected}
                  isDragging={dragState.isDragging && dragState.handIndex === index}
                  scale={scale}
                  x={pose.x}
                  y={pose.y}
                  rotation={pose.rot}
                  zIndex={pose.z}
                  onPointerDown={(e, i) => handleHandPointerDown(e, i)}
                  onMouseEnter={() => setHoveredHandIndex(index)}
                  onMouseLeave={() => setHoveredHandIndex(null)}
                />
              );
            });
          })()
        }



        {/* 法力水晶条 - 我方（综合控制台已包含，此处隐藏） */}

        {/* ★ 敌方综合控制台 */}
        {
          (() => {
            const enemyConsoleNode = layoutNodes.find((n) => n.id === 'enemy-console');
            return enemyConsoleNode ? (
              <HeroConsole
                player={game.enemy}
                turn={game.turnNumber}
                canUsePower={false}
                isPowerSelected={false}
                isPlayerTurn={game.currentPlayer === 'enemy'}
                isEnemy={true}
                onPowerClick={() => { }}
                scale={scale}
                x={enemyConsoleNode.x}
                y={enemyConsoleNode.y}
              />
            ) : null;
          })()
        }

        {/* 拖拽攻击指针 — 使用屏幕坐标，fixed 定位 */}
        {
          dragAttackState.isDragging && (
            <AttackPointer
              fromScreenX={dragAttackState.startScreenX}
              fromScreenY={dragAttackState.startScreenY}
            />
          )
        }

        {/* ★ 结束回合按钮（机关钮） */}
        {
          !game.winner && (() => {
            const endTurnNode = layoutNodes.find((n) => n.id === 'end-turn');
            return endTurnNode ? (
              <div
                key={endTurnNode.id}
                style={{
                  position: 'absolute',
                  left: `${endTurnNode.x * scale}px`,
                  top: `${endTurnNode.y * scale}px`,
                  width: `${endTurnNode.w * scale}px`,
                  height: `${endTurnNode.h * scale}px`,
                  opacity: isEntering ? 0 : 1,
                  transform: isEntering ? 'translateX(20px)' : 'translateX(0)',
                  transition: 'opacity 0.6s ease-out 0.6s, transform 0.6s ease-out 0.6s',
                }}
              >
                <EndTurnButton
                  isPlayerTurn={game.currentPlayer === 'player'}
                  isAiThinking={game.currentPlayer === 'enemy'}
                  scale={1} // let container handle scale wrapper
                  x={0}
                  y={0}
                  w={endTurnNode.w}
                  h={endTurnNode.h}
                  onClick={handleEndTurn}
                />
              </div>
            ) : null;
          })()
        }

        {/* ★ 回合开始横幅动画 */}
        <TurnBanner currentPlayer={game.currentPlayer} turnNumber={game.turnNumber} />

        {/* 游戏开始按钮 */}
        {
          game.phase === 'start' && (
            <button
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-lg text-xl font-bold border-4 border-green-400 shadow-lg"
              onClick={handleStartGame}
            >
              开始游戏
            </button>
          )
        }

        {/* 游戏胜负结果界面 (GameResultOverlay) */}
        {
          game.winner && (
            <GameResultOverlay
              winner={game.winner}
              onPlayAgain={() => {
                const newGame = createInitialGameState();
                setGame(startTurn(newGame, 'player'));
                setSelection({ type: 'none' });
              }}
              onMenu={() => {
                if (onMenu) onMenu();
                else window.location.reload();
              }}
            />
          )
        }
      </>
    );
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-[#0f0f1a] overflow-hidden select-none">
      <div
        className="relative shadow-2xl select-none"
        style={{
          width: `${scaleInfo.containerWidth}px`,
          height: `${scaleInfo.containerHeight}px`,
        }}
      >
        {/* ★ 战场背景（9层青铜机关城主题） */}
        <div className="absolute inset-0 z-0" onClick={handleBattlefieldClick}>
          <BattleBackground
            scale={scaleInfo.scale}
            containerWidth={scaleInfo.containerWidth}
            containerHeight={scaleInfo.containerHeight}
          />
        </div>

        {/* 槽位高亮反馈层 (拖拽经过时显示) */}
        {dragState.isDragging && hoveredSlot && (() => {
          const slotNode = layoutNodes.find(n => n.id === `player-minion-${hoveredSlot.row}-${hoveredSlot.col}`);
          if (!slotNode) return null;
          return (
            <div
              className="absolute z-10 pointer-events-none"
              style={{
                left: `${slotNode.x * scaleInfo.scale}px`,
                top: `${slotNode.y * scaleInfo.scale}px`,
                width: `${slotNode.w * scaleInfo.scale}px`,
                height: `${slotNode.h * scaleInfo.scale}px`,
                background: 'rgba(232, 93, 4, 0.2)',
                border: '2px solid rgba(232, 93, 4, 0.4)',
                borderRadius: '8px',
                boxShadow: '0 0 15px rgba(232, 93, 4, 0.3)',
                animation: 'pulse 1s infinite'
              }}
            />
          );
        })()}

        {/* 游戏内容 */}
        <div className="absolute inset-0">{renderGame()}</div>

        {/* 可放置区域高亮 */}
        <DropZoneHighlight isVisible={dragState.isDragging} scale={scaleInfo.scale} />

        {/* 法术条 */}
        <CastingBar
          card={
            castingState.isCasting && castingState.handIndex !== null
              ? game.player.hand[castingState.handIndex] || null
              : null
          }
          target={castingState.target}
          onConfirm={handleCastConfirm}
          onCancel={handleCastCancel}
          scale={scaleInfo.scale}
        />

        {/* 拖拽幽灵 — fixed 定位，无需 scale */}
        {dragState.isDragging && <DragGhost scale={scaleInfo.scale} />}

        {/* 攻击动画 */}
        {attackAnimations.map((anim) => (
          <AttackAnimator
            key={anim.id}
            animation={anim}
            scale={scaleInfo.scale}
            onComplete={() => removeAttackAnimation(anim.id)}
          />
        ))}

        {/* 出牌动画 */}
        {playCardAnimations.map((anim) => (
          <PlayCardAnimator
            key={anim.id}
            animation={anim}
            scale={scaleInfo.scale}
            onComplete={() => removePlayCardAnimation(anim.id)}
          />
        ))}

        {/* 伤害数字 */}
        {damageNumbers.map((damage) => (
          <DamageNumberDisplay
            key={damage.id}
            damage={damage}
            scale={scaleInfo.scale}
            onComplete={() => removeDamageNumber(damage.id)}
          />
        ))}

        {/* 投降按钮 */}
        {!game.winner && <SurrenderButton onClick={handleSurrender} scale={scaleInfo.scale} />}

        {/* 设置按钮 */}
        <SettingsButton onClick={() => setIsSettingsOpen(true)} />
      </div>

      {/* 设置面板弹窗 (放置在缩放层外，确保全屏覆盖) */}
      {isSettingsOpen && (
        <SystemModal title="机枢设置" onClose={() => { import('@/utils/audioManager').then(m => m.uiAudio.playClick()); setIsSettingsOpen(false); }}>
          <SettingsPanel settings={settings} onSettingsChange={onSettingsChange} />
        </SystemModal>
      )}

      {/* 投降确认弹框 - 春秋风格定制 */}
      <ConfirmModal
        open={showSurrenderConfirm}
        message="将军，是否确定撷界而降？"
        confirmText="撷界而降"
        cancelText="继续弈战"
        onConfirm={handleSurrenderConfirm}
        onCancel={() => setShowSurrenderConfirm(false)}
      />
    </div>
  );
}

export default BattleLayout;
