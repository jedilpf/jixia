import { useEffect, useMemo, useReducer } from 'react';
import {
  battleReducer,
  createInitialBattleState,
  CreateBattleStateOptions,
  getPublicSubmitInfo,
  getRevealData,
} from './engine';
import {
  DebateBattleState,
  PlanSlot,
  PublicSubmitInfo,
  RevealData,
  SeatId,
  TargetableSlot,
  Zone,
} from './types';

export interface DebateBattleController {
  state: DebateBattleState;
  selectTopic: (topicId: string) => void;
  planCard: (slot: PlanSlot, cardId: string | null) => void;
  planWriting: (cardId: string | null) => void;
  setTargetSeat: (slot: TargetableSlot, seatId: SeatId) => void;
  lockLayer1: () => void;
  lockLayer2: () => void;
  submitCard: (cardId: string, zone: Zone, useToken: boolean) => void;
  pass: () => void;
  confirmSubmit: () => void;
  getEnemyPublicInfo: () => PublicSubmitInfo;
  getRevealDataState: () => RevealData | null;
}

export function useDebateBattle(options?: CreateBattleStateOptions): DebateBattleController {
  const [state, dispatch] = useReducer(battleReducer, undefined, () => createInitialBattleState(options));

  useEffect(() => {
    if (state.phase === 'finished') return undefined;
    const timer = window.setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== 'play_1' || state.enemy.plan.lockedLayer1) return undefined;
    if (state.topicSelectionPending && state.round >= state.topicSelectionRound) return undefined;

    const waitMs = 1200 + Math.floor(Math.random() * 1400);
    const timer = window.setTimeout(() => {
      dispatch({ type: 'AI_AUTO_PLAN' });
    }, waitMs);

    return () => window.clearTimeout(timer);
  }, [
    state.phase,
    state.round,
    state.enemy.plan.lockedLayer1,
    state.topicSelectionPending,
    state.topicSelectionRound,
  ]);

  useEffect(() => {
    if (state.phase !== 'play_2' || state.enemy.plan.lockedLayer2) return undefined;

    const waitMs = 900 + Math.floor(Math.random() * 1200);
    const timer = window.setTimeout(() => {
      dispatch({ type: 'AI_AUTO_PLAN' });
    }, waitMs);

    return () => window.clearTimeout(timer);
  }, [state.phase, state.round, state.enemy.plan.lockedLayer2]);

  return useMemo(
    () => ({
      state,
      selectTopic: (topicId: string) => dispatch({ type: 'SELECT_TOPIC', topicId }),
      planCard: (slot: PlanSlot, cardId: string | null) => dispatch({ type: 'PLAN_CARD', slot, cardId }),
      planWriting: (cardId: string | null) => dispatch({ type: 'PLAN_WRITING', cardId }),
      setTargetSeat: (slot: TargetableSlot, seatId: SeatId) => dispatch({ type: 'SET_TARGET_SEAT', slot, seatId }),
      lockLayer1: () => dispatch({ type: 'LOCK_LAYER1' }),
      lockLayer2: () => dispatch({ type: 'LOCK_LAYER2' }),
      submitCard: (cardId: string, zone: Zone, useToken: boolean) =>
        dispatch({ type: 'SUBMIT_CARD', cardId, zone, useToken }),
      pass: () => dispatch({ type: 'PASS' }),
      confirmSubmit: () => dispatch({ type: 'CONFIRM_SUBMIT' }),
      getEnemyPublicInfo: () => getPublicSubmitInfo(state.enemy),
      getRevealDataState: () => getRevealData(state),
    }),
    [state],
  );
}
