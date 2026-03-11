import { useEffect, useMemo, useReducer } from 'react';
import { battleReducer, createInitialBattleState, CreateBattleStateOptions } from './engine';
import { DebateBattleState, PlanSlot, SeatId, TargetableSlot } from './types';

export interface DebateBattleController {
  state: DebateBattleState;
  planCard: (slot: PlanSlot, cardId: string | null) => void;
  planWriting: (cardId: string | null) => void;
  setTargetSeat: (slot: TargetableSlot, seatId: SeatId) => void;
  lockPublic: () => void;
  lockSecret: () => void;
}

export function useDebateBattle(options?: CreateBattleStateOptions): DebateBattleController {
  const [state, dispatch] = useReducer(
    battleReducer,
    undefined,
    () => createInitialBattleState(options)
  );

  useEffect(() => {
    if (state.phase === 'finished') return undefined;
    const timer = window.setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== 'ming_bian' || state.enemy.plan.lockedPublic) return undefined;
    const waitMs = 1200 + Math.floor(Math.random() * 1400);
    const timer = window.setTimeout(() => {
      dispatch({ type: 'AI_AUTO_PLAN' });
    }, waitMs);
    return () => window.clearTimeout(timer);
  }, [state.phase, state.round, state.enemy.plan.lockedPublic]);

  useEffect(() => {
    if (state.phase !== 'an_mou' || state.enemy.plan.lockedSecret) return undefined;
    const waitMs = 900 + Math.floor(Math.random() * 1200);
    const timer = window.setTimeout(() => {
      dispatch({ type: 'AI_AUTO_PLAN' });
    }, waitMs);
    return () => window.clearTimeout(timer);
  }, [state.phase, state.round, state.enemy.plan.lockedSecret]);

  return useMemo(
    () => ({
      state,
      planCard: (slot: PlanSlot, cardId: string | null) => dispatch({ type: 'PLAN_CARD', slot, cardId }),
      planWriting: (cardId: string | null) => dispatch({ type: 'PLAN_WRITING', cardId }),
      setTargetSeat: (slot: TargetableSlot, seatId: SeatId) => dispatch({ type: 'SET_TARGET_SEAT', slot, seatId }),
      lockPublic: () => dispatch({ type: 'LOCK_PUBLIC' }),
      lockSecret: () => dispatch({ type: 'LOCK_SECRET' }),
    }),
    [state]
  );
}
