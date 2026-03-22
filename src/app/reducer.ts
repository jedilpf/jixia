import type { AppAction } from '@/app/actions';
import {
  advanceBattlePhase,
  autoLockFaction,
  createInitialGameState,
  enterLoading,
  localBeginFactionPick,
  localConfirmHandover,
  localEnterLoading,
  localEnterPlayer2Pick,
  localMarkHandoverToPlayer2,
  lockFaction,
  openFactionPick,
  openTopicPreview,
  passAction,
  playCardToZone,
  resolveRound,
  startBattle,
  startLocalPvpFlow,
  startMatchFlow,
} from '@/core/gameEngine';
import type { GameState } from '@/core/types';

export function createAppInitialState(): GameState {
  return createInitialGameState();
}

export function appReducer(state: GameState, action: AppAction): GameState {
  switch (action.type) {
    case 'RESET_GAME':
      return createInitialGameState();
    case 'NAVIGATE':
      return { ...state, screen: action.screen };
    case 'START_MATCH_FLOW':
      return startMatchFlow(state);
    case 'START_LOCAL_PVP_FLOW':
      return startLocalPvpFlow(state);
    case 'LOCAL_BEGIN_FACTION_PICK':
      return localBeginFactionPick(state);
    case 'LOCAL_MARK_HANDOVER_TO_PLAYER2':
      return localMarkHandoverToPlayer2(state);
    case 'LOCAL_ENTER_PLAYER2_PICK':
      return localEnterPlayer2Pick(state);
    case 'LOCAL_ENTER_LOADING':
      return localEnterLoading(state);
    case 'LOCAL_CONFIRM_HANDOVER':
      return localConfirmHandover(state);
    case 'OPEN_TOPIC_PREVIEW':
      return openTopicPreview(state);
    case 'OPEN_FACTION_PICK':
      return openFactionPick(state);
    case 'LOCK_FACTION':
      return lockFaction(state, action.playerId, action.factionId);
    case 'AUTO_LOCK_FACTION':
      return autoLockFaction(state, action.playerId);
    case 'ENTER_LOADING':
      return enterLoading(state);
    case 'START_BATTLE':
      return startBattle(state);
    case 'ADVANCE_BATTLE_PHASE':
      return advanceBattlePhase(state);
    case 'PLAY_CARD':
      return playCardToZone(state, action.playerId, action.cardUid, action.zone);
    case 'PASS_ACTION':
      return passAction(state);
    case 'RESOLVE_ROUND':
      return resolveRound(state);
    default:
      return state;
  }
}
