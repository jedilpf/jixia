import { getBattlePhaseLabel } from '@/core/phaseMachine';
import { getLeadingDirection } from '@/core/issueSystem';
import type { GameState, PlayerId } from '@/core/types';

export function selectPlayer(state: GameState, playerId: PlayerId) {
  return state.players[playerId];
}

export function selectOpponent(state: GameState, playerId: PlayerId) {
  return state.players[playerId === 'player' ? 'enemy' : 'player'];
}

export function selectPhaseLabel(state: GameState): string {
  return getBattlePhaseLabel(state.battle.phase);
}

export function selectLockedIssue(state: GameState) {
  if (!state.issueState || !state.issueState.lockedDirection) return null;
  return {
    id: state.issueState.id,
    name: state.issueState.name,
    direction: state.issueState.lockedDirection,
  };
}

export function selectCanPlayCard(state: GameState, playerId: PlayerId): boolean {
  const player = state.players[playerId];
  if (state.battle.phase !== 'hidden_submit') return false;
  if (state.activePlayerId !== playerId) return false;
  return player.cardsPlayedThisTurn < state.battle.maxCardsPerTurn;
}

export function selectIssueProgressPercent(state: GameState): number {
  if (!state.issueState || state.issueState.triggerThreshold <= 0) return 0;
  return Math.min(100, Math.round((state.issueState.heat / state.issueState.triggerThreshold) * 100));
}

export function selectLeadingDirection(state: GameState) {
  if (!state.issueState) return null;
  return getLeadingDirection(state.issueState);
}
