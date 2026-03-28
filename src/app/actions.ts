/**
 * @legacy 旧版 Actions — 仅供 src/app/reducer.ts 使用
 *
 * ⚠️  请勿在此文件中添加新 action。
 *     新的 action 类型请在 src/battleV2/types.ts 的 BattleAction 中添加。
 */
import type { PlayerId, ScreenId } from '@/core/types';

export type AppAction =
  | { type: 'RESET_GAME' }
  | { type: 'NAVIGATE'; screen: ScreenId }
  | { type: 'START_MATCH_FLOW' }
  | { type: 'OPEN_TOPIC_PREVIEW' }
  | { type: 'OPEN_FACTION_PICK' }
  | { type: 'LOCK_FACTION'; playerId: PlayerId; factionId: string }
  | { type: 'AUTO_LOCK_FACTION'; playerId: PlayerId }
  | { type: 'ENTER_LOADING' }
  | { type: 'START_BATTLE' }
  | { type: 'ADVANCE_BATTLE_PHASE' }
  | { type: 'PLAY_CARD'; playerId: PlayerId; cardUid: string; zone: 'main' | 'side' }
  | { type: 'PASS_ACTION' }
  | { type: 'RESOLVE_ROUND' };

