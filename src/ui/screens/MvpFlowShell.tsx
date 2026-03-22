import { useState } from 'react';
import { useAppStore } from '@/app/store';
import { TransitionScreen } from '@/components/TransitionScreen';
import {
  BattleScreen,
  FactionPickScreen,
  HomeScreen,
  LoadingScreen,
  LocalBattleResultScreen,
  LocalBattleSetupScreen,
  MatchScreen,
  PlayerHandoverScreen,
  ResultScreen,
  TopicScreen,
} from '@/ui/screens';

export function MvpFlowShell() {
  const { state, dispatch } = useAppStore();
  const [showTransition, setShowTransition] = useState(false);
  const [pendingMatchStart, setPendingMatchStart] = useState(false);

  const beginMatchWithTransition = () => {
    setPendingMatchStart(true);
    setShowTransition(true);
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);
    if (pendingMatchStart) {
      setPendingMatchStart(false);
      dispatch({ type: 'START_MATCH_FLOW' });
    }
  };

  if (showTransition) {
    return <TransitionScreen onComplete={handleTransitionComplete} />;
  }

  if (state.screen === 'home') {
    return (
      <HomeScreen
        onStart={beginMatchWithTransition}
        onStartLocal={() => dispatch({ type: 'START_LOCAL_PVP_FLOW' })}
      />
    );
  }

  if (state.screen === 'local_setup') {
    return (
      <LocalBattleSetupScreen
        issueName={state.issueState?.name ?? '待生成'}
        playerOptions={state.offeredFactionIds.player}
        enemyOptions={state.offeredFactionIds.enemy}
        onContinue={() => dispatch({ type: 'LOCAL_BEGIN_FACTION_PICK' })}
        onBack={() => dispatch({ type: 'RESET_GAME' })}
      />
    );
  }

  if (state.screen === 'local_handover') {
    return (
      <PlayerHandoverScreen
        fromPlayerLabel="玩家1"
        toPlayerLabel="玩家2"
        onContinue={() => dispatch({ type: 'LOCAL_ENTER_PLAYER2_PICK' })}
      />
    );
  }

  if (state.screen === 'match') {
    return <MatchScreen onContinue={() => dispatch({ type: 'OPEN_TOPIC_PREVIEW' })} />;
  }

  if (state.screen === 'topic_preview') {
    return (
      <TopicScreen
        topicIds={state.selectedIssuePreviewIds}
        onContinue={() => dispatch({ type: 'OPEN_FACTION_PICK' })}
      />
    );
  }

  if (state.screen === 'faction_pick') {
    if (state.gameMode === 'local_pvp') {
      const isPlayer1Pick = state.localBattleMeta.setupStep !== 'player2_pick';
      const pickerId = isPlayer1Pick ? 'player' : 'enemy';
      const pickerLabel = isPlayer1Pick ? '玩家1' : '玩家2';

      return (
        <FactionPickScreen
          options={state.offeredFactionIds[pickerId]}
          lockedFactionId={state.players[pickerId].factionId}
          title={`${pickerLabel}门派抉择`}
          subtitle={`请${pickerLabel}确认本局门派`}
          onConfirm={(factionId) => {
            dispatch({ type: 'LOCK_FACTION', playerId: pickerId, factionId });
            if (isPlayer1Pick) {
              dispatch({ type: 'LOCAL_MARK_HANDOVER_TO_PLAYER2' });
            } else {
              dispatch({ type: 'LOCAL_ENTER_LOADING' });
            }
          }}
        />
      );
    }

    return (
      <FactionPickScreen
        options={state.offeredFactionIds.player}
        lockedFactionId={state.players.player.factionId}
        onConfirm={(factionId) => {
          dispatch({ type: 'LOCK_FACTION', playerId: 'player', factionId });
          dispatch({ type: 'AUTO_LOCK_FACTION', playerId: 'enemy' });
          dispatch({ type: 'ENTER_LOADING' });
        }}
      />
    );
  }

  if (state.screen === 'loading') {
    return (
      <LoadingScreen
        playerFactionId={state.players.player.factionId}
        enemyFactionId={state.players.enemy.factionId}
        issueIds={state.selectedIssuePreviewIds}
        onContinue={() => dispatch({ type: 'START_BATTLE' })}
      />
    );
  }

  if (state.screen === 'battle') {
    const actingPlayerId =
      state.gameMode === 'local_pvp'
        ? state.localBattleMeta.handVisibilityOwnerId ?? state.localBattleMeta.currentActingPlayerId
        : 'player';

    return (
      <BattleScreen
        state={state}
        onPlayToMain={(cardUid) =>
          dispatch({ type: 'PLAY_CARD', playerId: actingPlayerId, cardUid, zone: 'main' })
        }
        onPlayToSide={(cardUid) =>
          dispatch({ type: 'PLAY_CARD', playerId: actingPlayerId, cardUid, zone: 'side' })
        }
        onResolveRound={() => {
          dispatch({ type: 'PASS_ACTION' });
          dispatch({ type: 'RESOLVE_ROUND' });
        }}
        onConfirmLocalHandover={() => dispatch({ type: 'LOCAL_CONFIRM_HANDOVER' })}
      />
    );
  }

  if (state.gameMode === 'local_pvp') {
    return (
      <LocalBattleResultScreen
        state={state}
        onRestart={() => dispatch({ type: 'START_LOCAL_PVP_FLOW' })}
        onBackHome={() => dispatch({ type: 'RESET_GAME' })}
      />
    );
  }

  return <ResultScreen state={state} onRestart={() => dispatch({ type: 'RESET_GAME' })} />;
}
