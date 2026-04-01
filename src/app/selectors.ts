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
