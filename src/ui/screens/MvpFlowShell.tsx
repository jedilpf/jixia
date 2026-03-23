import { useState } from 'react';
import { useAppStore } from '@/app/store';
import { TransitionScreen } from '@/components/TransitionScreen';
import {
  BattleScreen,
  FactionPickScreen,
  HomeScreen,
  LoadingScreen,
  MatchScreen,
  PreFactionLoading,
  ResultScreen,
  TopicScreen,
} from '@/ui/screens';

export function MvpFlowShell() {
  const { state, dispatch } = useAppStore();
  const [showTransition, setShowTransition] = useState(false);
  const [pendingMatchStart, setPendingMatchStart] = useState(false);
  const [showPreFactionLoading, setShowPreFactionLoading] = useState(false);

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

  const handlePreFactionLoadingComplete = () => {
    setShowPreFactionLoading(false);
    dispatch({ type: 'OPEN_FACTION_PICK' });
  };

  if (showTransition) {
    return <TransitionScreen onComplete={handleTransitionComplete} />;
  }

  if (showPreFactionLoading) {
    return <PreFactionLoading onComplete={handlePreFactionLoadingComplete} minDisplayMs={2000} />;
  }

  if (state.screen === 'home') {
    return <HomeScreen onStart={beginMatchWithTransition} />;
  }

  if (state.screen === 'match') {
    return <MatchScreen onContinue={() => dispatch({ type: 'OPEN_TOPIC_PREVIEW' })} />;
  }

  if (state.screen === 'topic_preview') {
    return (
      <TopicScreen
        topicIds={state.selectedIssuePreviewIds}
        onContinue={() => {
          setShowPreFactionLoading(true);
        }}
      />
    );
  }

  if (state.screen === 'faction_pick') {
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
    return (
      <BattleScreen
        state={state}
        onPlayToMain={(cardUid) => dispatch({ type: 'PLAY_CARD', playerId: 'player', cardUid, zone: 'main' })}
        onPlayToSide={(cardUid) => dispatch({ type: 'PLAY_CARD', playerId: 'player', cardUid, zone: 'side' })}
        onResolveRound={() => {
          dispatch({ type: 'PASS_ACTION' });
          dispatch({ type: 'RESOLVE_ROUND' });
        }}
      />
    );
  }

  return <ResultScreen state={state} onRestart={() => dispatch({ type: 'RESET_GAME' })} />;
}
