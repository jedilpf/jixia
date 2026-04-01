import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import type { 
  GameState, 
  PlayerId, 
  Position, 
  SelectionState,
  DragState,
  AIDifficulty
} from '../types/domain';
import {
  createInitialGameState,
  startTurn,
  endTurn,
  playCard,
  performAttack,
  writeBook,
  activateHeroPower,
  canPlayCard,
  canAttack,
  canUseHeroPower,
  getEmptySlotCenterOut,
} from '../engine/GameEngine';

// ==================== Store 状态定义 ====================

interface GameStoreState {
  // 游戏状态
  game: GameState;
  selection: SelectionState;
  dragState: DragState;
  isAnimating: boolean;
  aiDifficulty: AIDifficulty;
  
  // 计算属性
  currentPlayer: PlayerId;
  isPlayerTurn: boolean;
  canEndTurn: boolean;
}

interface GameStoreActions {
  // 游戏流程
  startGame: () => void;
  startTurn: () => void;
  endTurn: () => void;
  
  // 卡牌操作
  selectCard: (handIndex: number) => void;
  playCard: (handIndex: number, targetPos?: Position) => boolean;
  writeBook: (handIndex: number) => boolean;
  
  // 战斗操作
  selectMinion: (position: Position) => void;
  attack: (attackerPos: Position, target: Position | 'hero') => boolean;
  
  // 英雄操作
  useHeroPower: () => boolean;
  heroAttack: (target: Position | 'hero') => boolean;
  
  // 选择状态
  clearSelection: () => void;
  setSelection: (selection: SelectionState) => void;
  
  // 拖拽
  startDrag: (cardIndex: number, startPos: { x: number; y: number }) => void;
  updateDrag: (currentPos: { x: number; y: number }) => void;
  endDrag: () => void;
  
  // AI
  executeEnemyTurn: () => Promise<void>;
  setAIDifficulty: (difficulty: AIDifficulty) => void;
  
  // 辅助
  canPlayCardAtIndex: (handIndex: number) => boolean;
  canAttackWithMinion: (position: Position) => boolean;
  getEmptySlot: () => Position | null;
}

export type GameStore = GameStoreState & GameStoreActions;

// ==================== Store 创建 ====================

const initialSelection: SelectionState = { type: 'none' };
const initialDragState: DragState = { isDragging: false };

export const useGameStore = create<GameStore>()(
  devtools(
    immer((set, get) => ({
      // ==================== 初始状态 ====================
      game: createInitialGameState(),
      selection: initialSelection,
      dragState: initialDragState,
      isAnimating: false,
      aiDifficulty: 'normal',
      
      get currentPlayer() {
        return get().game.currentPlayer;
      },
      
      get isPlayerTurn() {
        return get().game.currentPlayer === 'player';
      },
      
      get canEndTurn() {
        return get().isPlayerTurn && get().game.phase !== 'end';
      },
      
      // ==================== 游戏流程 ====================
      startGame: () => {
        set((state) => {
          state.game = createInitialGameState();
          state.selection = initialSelection;
          state.game.phase = 'player_turn';
        });
      },
      
      startTurn: () => {
        const { game } = get();
        const newGame = startTurn(game, game.currentPlayer);
        if (newGame) {
          set((state) => {
            state.game = newGame;
          });
        }
      },
      
      endTurn: () => {
        const { game } = get();
        const newGame = endTurn(game);
        if (newGame) {
          set((state) => {
            state.game = newGame;
            state.selection = initialSelection;
          });
        }
      },
      
      // ==================== 卡牌操作 ====================
      selectCard: (handIndex: number) => {
        const { game, isPlayerTurn } = get();
        if (!isPlayerTurn) return;
        
        const card = game.player.hand[handIndex];
        if (!card) return;
        
        set((state) => {
          state.selection = {
            type: 'card',
            handIndex,
          };
        });
      },
      
      playCard: (handIndex: number, targetPos?: Position): boolean => {
        const { game } = get();
        const newGame = playCard(game, 'player', handIndex, targetPos);
        
        if (newGame) {
          set((state) => {
            state.game = newGame;
            state.selection = initialSelection;
          });
          return true;
        }
        return false;
      },
      
      writeBook: (handIndex: number): boolean => {
        const { game } = get();
        const newGame = writeBook(game, 'player', handIndex);
        
        if (newGame) {
          set((state) => {
            state.game = newGame;
          });
          return true;
        }
        return false;
      },
      
      // ==================== 战斗操作 ====================
      selectMinion: (position: Position) => {
        const { game, isPlayerTurn } = get();
        if (!isPlayerTurn) return;
        
        const rowArray = position.row === 'front' 
          ? game.player.board.front 
          : game.player.board.back;
        const minion = rowArray[position.col];
        
        if (!minion || !canAttack(minion)) return;
        
        set((state) => {
          state.selection = {
            type: 'minion',
            minionPos: position,
            sourcePlayer: 'player',
          };
        });
      },
      
      attack: (attackerPos: Position, target: Position | 'hero'): boolean => {
        const { game } = get();
        const newGame = performAttack(game, 'player', attackerPos, 'enemy', target);
        
        if (newGame) {
          set((state) => {
            state.game = newGame;
            state.selection = initialSelection;
          });
          return true;
        }
        return false;
      },
      
      // ==================== 英雄操作 ====================
      useHeroPower: (): boolean => {
        const { game } = get();
        const newGame = activateHeroPower(game, 'player');
        
        if (newGame) {
          set((state) => {
            state.game = newGame;
          });
          return true;
        }
        return false;
      },
      
      heroAttack: (target: Position | 'hero'): boolean => {
        // TODO: 实现英雄攻击
        return false;
      },
      
      // ==================== 选择状态 ====================
      clearSelection: () => {
        set((state) => {
          state.selection = initialSelection;
        });
      },
      
      setSelection: (selection: SelectionState) => {
        set((state) => {
          state.selection = selection;
        });
      },
      
      // ==================== 拖拽 ====================
      startDrag: (cardIndex: number, startPos: { x: number; y: number }) => {
        set((state) => {
          state.dragState = {
            isDragging: true,
            cardIndex,
            startPos,
            currentPos: startPos,
          };
        });
      },
      
      updateDrag: (currentPos: { x: number; y: number }) => {
        set((state) => {
          if (state.dragState.isDragging) {
            state.dragState.currentPos = currentPos;
          }
        });
      },
      
      endDrag: () => {
        set((state) => {
          state.dragState = initialDragState;
        });
      },
      
      // ==================== AI ====================
      executeEnemyTurn: async () => {
        const { game, endTurn } = get();
        
        set((state) => {
          state.isAnimating = true;
        });
        
        // TODO: 集成AI系统
        // 模拟AI思考时间
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 简单AI: 结束回合
        endTurn();
        
        set((state) => {
          state.isAnimating = false;
        });
      },
      
      setAIDifficulty: (difficulty: AIDifficulty) => {
        set((state) => {
          state.aiDifficulty = difficulty;
        });
      },
      
      // ==================== 辅助方法 ====================
      canPlayCardAtIndex: (handIndex: number): boolean => {
        const { game } = get();
        const card = game.player.hand[handIndex];
        return card ? canPlayCard(game.player, card) : false;
      },
      
      canAttackWithMinion: (position: Position): boolean => {
        const { game } = get();
        const rowArray = position.row === 'front' 
          ? game.player.board.front 
          : game.player.board.back;
        const minion = rowArray[position.col];
        return minion ? canAttack(minion) : false;
      },
      
      getEmptySlot: (): Position | null => {
        const { game } = get();
        return getEmptySlotCenterOut(game.player.board);
      },
      
    })),
    { name: 'GameStore' }
  )
);

// ==================== 选择器 ====================

export function selectPlayerHand(state: GameStore) {
  return state.game.player.hand;
}

export function selectPlayerBoard(state: GameStore) {
  return state.game.player.board;
}

export function selectEnemyBoard(state: GameStore) {
  return state.game.enemy.board;
}

export function selectPlayerMana(state: GameStore) {
  return { mana: state.game.player.mana, maxMana: state.game.player.maxMana };
}

export function selectGamePhase(state: GameStore) {
  return state.game.phase;
}

export function selectCurrentPlayer(state: GameStore) {
  return state.game.currentPlayer;
}

export function selectGameLog(state: GameStore) {
  return state.game.log;
}

export function selectWinner(state: GameStore) {
  return state.game.winner;
}
