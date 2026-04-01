import { useEffect, useState } from 'react';
import { useAppStore } from '@/app/store';
import { calculateLevelFromExp } from '@/config/levelSystem';
import { TransitionScreen } from '@/components/TransitionScreen';
import {
  FactionPickScreen,
  HomeScreen,
  LoadingScreenV2,
  MatchScreen,
  ResultScreenV2,
  TopicScreenV2,
  StoryScreen,
} from '@/ui/screens';
import BattleFrameV2 from '@/components/BattleFrameV2';
import { 
  loadPlayerProgress, 
  savePlayerProgress, 
  type PlayerProgressState, 
  type BattleSettlementSummary 
} from '@/utils/persistence';

/**
 * MvpFlowShell - 核心游戏流程容器
 * 
 * 职责：
 * 1. 协调 UI Screen 切换。
 * 2. 处理战斗结算逻辑与持久化。
 * 3. 管理全局动画过渡。
 * 
 * Phase 2 改造：已将持久化逻辑外移至 @/utils/persistence，提升了代码解耦度。
 */

export function MvpFlowShell() {
  const { state, dispatch } = useAppStore();
  const [showTransition, setShowTransition] = useState(false);
  const [pendingMatchStart, setPendingMatchStart] = useState(false);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgressState>(loadPlayerProgress);
  const [latestSettlement, setLatestSettlement] = useState<BattleSettlementSummary | null>(null);

  useEffect(() => {
    savePlayerProgress(playerProgress);
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
      <TopicScreenV2
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
      <LoadingScreenV2
        playerFactionId={state.players.player.factionId}
        enemyFactionId={state.players.enemy.factionId}
        issueIds={state.selectedIssuePreviewIds}
        onContinue={() => dispatch({ type: 'START_BATTLE' })}
      />
    );
  }

  if (state.screen === 'battle') {
    return (
      <BattleFrameV2
        arenaId="jixia"
        forcedTopicId={state.selectedIssuePreviewIds[0]}
        playerMainFaction={state.players.player.factionId ?? undefined}
        enemyMainFaction={state.players.enemy.factionId ?? undefined}
        onMenu={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}
        onFinished={(winnerId) => dispatch({ type: 'FINISH_BATTLE', winnerId })}
      />
    );
  }

  if (state.screen === 'story') {
    return <StoryScreen onBack={() => dispatch({ type: 'NAVIGATE', screen: 'home' })} />;
  }

  return (
    <ResultScreenV2
      state={state}
      progress={playerProgress}
      settlement={latestSettlement}
      onRestart={() => dispatch({ type: 'RESET_GAME' })}
    />
  );
}
