/**
 * @legacy 旧版 App Selectors — 仅供 src/app/ 旧状态管理层使用
 *
 * ⚠️  请勿在此文件中添加新 selector。
 *     新的 selector 请在 src/battleV2/ 或对应的 hooks 中实现。
 */
import {
  selectCanPlayCard,
  selectIssueProgressPercent,
  selectLockedIssue,
  selectOpponent,
  selectPhaseLabel,
  selectPlayer,
} from '@/core/selectors';
import type { GameState, PlayerId } from '@/core/types';

export function getPlayer(state: GameState, playerId: PlayerId) {
  return selectPlayer(state, playerId);
}

export function getOpponent(state: GameState, playerId: PlayerId) {
  return selectOpponent(state, playerId);
}

export function getCurrentPhaseLabel(state: GameState) {
  return selectPhaseLabel(state);
}

export function getLockedIssue(state: GameState) {
  return selectLockedIssue(state);
}

export function getIssueProgress(state: GameState) {
  return selectIssueProgressPercent(state);
}

export function canPlayerPlayCard(state: GameState, playerId: PlayerId) {
  return selectCanPlayCard(state, playerId);
}
