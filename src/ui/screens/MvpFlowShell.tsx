import { useEffect, useState } from 'react';
import { useAppStore } from '@/app/store';
import { calculateLevelFromExp } from '@/config/levelSystem';
import { TransitionScreen } from '@/components/TransitionScreen';
import {
  BattleScreen,
  FactionPickScreen,
  HomeScreen,
  LoadingScreen,
  MatchScreen,
  ResultScreen,
  TopicScreen,
  StoryScreen,
} from '@/ui/screens';

interface PlayerProgressState {
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

const PLAYER_PROGRESS_STORAGE_KEY = 'jixia.mvp.playerProgress.v1';

const DEFAULT_PLAYER_PROGRESS: PlayerProgressState = {
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

function loadPlayerProgress(): PlayerProgressState {
  if (typeof window === 'undefined') return DEFAULT_PLAYER_PROGRESS;
  try {
    const raw = window.localStorage.getItem(PLAYER_PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_PLAYER_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<PlayerProgressState>;
    return { ...DEFAULT_PLAYER_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_PLAYER_PROGRESS;
  }
}

export function MvpFlowShell() {
  const { state, dispatch } = useAppStore();
  const [showTransition, setShowTransition] = useState(false);
  const [pendingMatchStart, setPendingMatchStart] = useState(false);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgressState>(loadPlayerProgress);
  const [latestSettlement, setLatestSettlement] = useState<BattleSettlementSummary | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(PLAYER_PROGRESS_STORAGE_KEY, JSON.stringify(playerProgress));
  }, [playerProgress]);

  useEffect(() => {
    if (state.screen !== 'result') {
      setLatestSettlement(null);
      return;
    }

    const playerMomentum = state.players.player.momentum;
    const enemyMomentum = state.players.enemy.momentum;
    const won = state.winnerId === 'player';
    const settlementKey = `${state.seededAt}:${state.round}:${state.winnerId ?? 'none'}:${playerMomentum}:${enemyMomentum}`;

    setPlayerProgress((prev) => {
      if (prev.lastSettlementKey === settlementKey) {
        return prev;
      }

      const opportunityGain = Math.max(0, playerMomentum);
      const expGain = Math.max(20, playerMomentum * 12 + (won ? 60 : 25));
      const goldGain = Math.max(50, playerMomentum * 20 + (won ? 80 : 30));
      const nextTotalExp = prev.totalExp + expGain;
      const levelState = calculateLevelFromExp(nextTotalExp);

      setLatestSettlement({
        settlementKey,
        playerMomentum,
        opportunityGain,
        expGain,
        goldGain,
        won,
      });

      return {
        ...prev,
        totalExp: nextTotalExp,
        level: levelState.level,
        exp: levelState.exp,
        totalGames: prev.totalGames + 1,
        winCount: prev.winCount + (won ? 1 : 0),
        winStreak: won ? prev.winStreak + 1 : 0,
        totalDamage: prev.totalDamage + playerMomentum * 100,
        opportunity: prev.opportunity + opportunityGain,
        lastSettlementKey: settlementKey,
      };
    });
  }, [
    state.screen,
    state.seededAt,
    state.round,
    state.winnerId,
    state.players.player.momentum,
    state.players.enemy.momentum,
  ]);

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
        onStoryMode={() => dispatch({ type: 'NAVIGATE', screen: 'story' })}
        progress={playerProgress}
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

  if (state.screen === 'story') {
    return <StoryScreen />;
  }

  return (
    <ResultScreen
      state={state}
      progress={playerProgress}
      settlement={latestSettlement}
      onRestart={() => dispatch({ type: 'RESET_GAME' })}
    />
  );
}
