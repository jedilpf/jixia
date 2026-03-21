﻿﻿﻿﻿﻿﻿﻿import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, PlayerId } from '@/types';
import { SyncPhase, DebateAction, SecretAction, SettlementItem } from '@/types/syncBattle';
import { SyncBattleManager, createSyncBattleManager, SyncGameCallbacks } from '@/utils/syncBattleManager';

export interface UseSyncBattleResult {
  game: GameState | null;
  currentPhase: SyncPhase;
  phaseTimeRemaining: number;
  phaseName: string;
  isPlayerLocked: boolean;
  isEnemyLocked: boolean;
  revealedPlayerSecret: SecretAction | null;
  revealedEnemySecret: SecretAction | null;
  settlementItems: SettlementItem[];
  winner: PlayerId | null;
  
  startGame: () => void;
  submitDebateAction: (action: DebateAction) => boolean;
  submitSecretAction: (action: SecretAction) => boolean;
  lockDecision: () => boolean;
  pause: () => void;
  resume: () => void;
}

export function useSyncBattle(): UseSyncBattleResult {
  const managerRef = useRef<SyncBattleManager | null>(null);
  const [, forceUpdate] = useState({});
  
  const [game, setGame] = useState<GameState | null>(null);
  const [currentPhase, setCurrentPhase] = useState<SyncPhase>('waiting');
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(0);
  const [isPlayerLocked, setIsPlayerLocked] = useState(false);
  const [isEnemyLocked, setIsEnemyLocked] = useState(false);
  const [revealedPlayerSecret, setRevealedPlayerSecret] = useState<SecretAction | null>(null);
  const [revealedEnemySecret, setRevealedEnemySecret] = useState<SecretAction | null>(null);
  const [settlementItems, setSettlementItems] = useState<SettlementItem[]>([]);
  const [winner, setWinner] = useState<PlayerId | null>(null);

  if (!managerRef.current) {
    managerRef.current = createSyncBattleManager();
  }

  const manager = managerRef.current;

  useEffect(() => {
    const callbacks: SyncGameCallbacks = {
      onPhaseChange: (phase: SyncPhase, timeRemaining: number) => {
        setCurrentPhase(phase);
        setPhaseTimeRemaining(timeRemaining);
        setIsPlayerLocked(manager.isPlayerLocked('player'));
        setIsEnemyLocked(manager.isPlayerLocked('enemy'));
        
        if (phase === 'reveal') {
          setRevealedPlayerSecret(manager.getRevealedSecret('player'));
          setRevealedEnemySecret(manager.getRevealedSecret('enemy'));
        }
      },
      onSettlement: (_layer: number, items: SettlementItem[]) => {
        setSettlementItems(items);
      },
      onGameEnd: (gameWinner: PlayerId) => {
        setWinner(gameWinner);
      },
      onStateUpdate: (newGame: GameState) => {
        setGame(newGame);
        forceUpdate({});
      },
    };

    manager.initialize(callbacks);

    return () => {
      manager.stop();
    };
  }, [manager]);

  const startGame = useCallback(() => {
    setWinner(null);
    setRevealedPlayerSecret(null);
    setRevealedEnemySecret(null);
    setSettlementItems([]);
    setIsPlayerLocked(false);
    setIsEnemyLocked(false);
    manager.startGame();
  }, [manager]);

  const submitDebateAction = useCallback((action: DebateAction): boolean => {
    return manager.submitDebateAction('player', action);
  }, [manager]);

  const submitSecretAction = useCallback((action: SecretAction): boolean => {
    return manager.submitSecretAction('player', action);
  }, [manager]);

  const lockDecision = useCallback((): boolean => {
    return manager.lockDecision('player');
  }, [manager]);

  const pause = useCallback(() => {
    manager.pause();
  }, [manager]);

  const resume = useCallback(() => {
    manager.resume();
  }, [manager]);

  return {
    game,
    currentPhase,
    phaseTimeRemaining,
    phaseName: manager.getPhaseName(),
    isPlayerLocked,
    isEnemyLocked,
    revealedPlayerSecret,
    revealedEnemySecret,
    settlementItems,
    winner,
    startGame,
    submitDebateAction,
    submitSecretAction,
    lockDecision,
    pause,
    resume,
  };
}
