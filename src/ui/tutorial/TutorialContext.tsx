import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { TutorialContextValue, TutorialState } from './types';
import { TUTORIAL_STEP_ORDER } from './tutorialSteps';

const TUTORIAL_STORAGE_KEY = 'jixia_tutorial_state';

function loadTutorialState(): TutorialState {
  try {
    const saved = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as TutorialState;
      return parsed;
    }
  } catch {
    // ignore
  }
  return {
    isActive: false,
    currentStepId: 'welcome',
    completedSteps: [],
    hasSeenTutorial: false,
  };
}

function saveTutorialState(state: TutorialState): void {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function TutorialProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<TutorialState>(loadTutorialState);

  useEffect(() => {
    saveTutorialState(state);
  }, [state]);

  const startTutorial = useCallback(() => {
    setState({
      isActive: true,
      currentStepId: 'welcome',
      completedSteps: [],
      hasSeenTutorial: false,
    });
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = TUTORIAL_STEP_ORDER.indexOf(state.currentStepId);
    if (currentIndex < 0 || currentIndex >= TUTORIAL_STEP_ORDER.length - 1) {
      // 到达最后一步，完成教程
      setState({
        isActive: false,
        currentStepId: 'complete',
        completedSteps: [...state.completedSteps, state.currentStepId],
        hasSeenTutorial: true,
      });
      return;
    }

    const nextStepId = TUTORIAL_STEP_ORDER[currentIndex + 1];
    setState({
      ...state,
      currentStepId: nextStepId,
      completedSteps: [...state.completedSteps, state.currentStepId],
    });
  }, [state]);

  const skipTutorial = useCallback(() => {
    setState({
      isActive: false,
      currentStepId: 'complete',
      completedSteps: TUTORIAL_STEP_ORDER,
      hasSeenTutorial: true,
    });
  }, []);

  const completeTutorial = useCallback(() => {
    setState({
      isActive: false,
      currentStepId: 'complete',
      completedSteps: [...state.completedSteps, state.currentStepId],
      hasSeenTutorial: true,
    });
  }, [state]);

  const resetTutorial = useCallback(() => {
    setState({
      isActive: false,
      currentStepId: 'welcome',
      completedSteps: [],
      hasSeenTutorial: false,
    });
  }, []);

  const value = useMemo(
    () => ({
      state,
      startTutorial,
      nextStep,
      skipTutorial,
      completeTutorial,
      resetTutorial,
    }),
    [state, startTutorial, nextStep, skipTutorial, completeTutorial, resetTutorial],
  );

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
}

export function useTutorial(): TutorialContextValue {
  const ctx = useContext(TutorialContext);
  if (!ctx) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return ctx;
}

/**
 * 检查是否需要显示教程（首次进入游戏）
 */
export function useShouldShowTutorial(): boolean {
  const { state } = useTutorial();
  return !state.hasSeenTutorial;
}