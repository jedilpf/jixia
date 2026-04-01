/**
 * Persistence - 玩家进度持久化工具
 * 支持浏览器 localStorage 与 Electron 原生存储。
 */
export interface PlayerProgressState {
  level: number;
  exp: number;
  totalExp: number;
  winCount: number;
  totalGames: number;
  winStreak: number;
  totalDamage: number;
  collectedCards: number;
  totalCards: number;
  opportunity: number;
  lastSettlementKey: string | null;
}
export interface BattleSettlementSummary {
  settlementKey: string;
  playerMomentum: number;
  opportunityGain: number;
  expGain: number;
  goldGain: number;
  won: boolean;
}
const STORAGE_KEY = 'jixia.mvp.playerProgress.v1';
export const DEFAULT_PLAYER_PROGRESS: PlayerProgressState = {
  level: 1,
  exp: 0,
  totalExp: 0,
  winCount: 0,
  totalGames: 0,
  winStreak: 0,
  totalDamage: 0,
  collectedCards: 12,
  totalCards: 160,
  opportunity: 0,
  lastSettlementKey: null,
};
export function loadPlayerProgress(): PlayerProgressState {
  if (typeof window === 'undefined') return DEFAULT_PLAYER_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PLAYER_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<PlayerProgressState>;
    return { ...DEFAULT_PLAYER_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_PLAYER_PROGRESS;
  }
}
export function savePlayerProgress(progress: PlayerProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = JSON.stringify(progress);
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch (err) {
    console.error('Failed to save progress:', err);
  }
}
