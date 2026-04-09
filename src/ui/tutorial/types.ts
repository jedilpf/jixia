/**
 * 教程系统类型定义
 */

export type TutorialStepId =
  | 'welcome'
  | 'phase_intro'
  | 'select_card'
  | 'submit_main'
  | 'submit_side'
  | 'resolve_round'
  | 'understand_result'
  | 'complete';

export interface TutorialStep {
  id: TutorialStepId;
  title: string;
  content: string;
  highlightSelector?: string; // CSS selector for highlighting element
  actionHint?: string; // 提示用户需要执行的动作
  nextStep?: TutorialStepId;
  skipable?: boolean;
}

export interface TutorialState {
  isActive: boolean;
  currentStepId: TutorialStepId;
  completedSteps: TutorialStepId[];
  hasSeenTutorial: boolean; // 是否已看过教程（用于判断是否显示）
}

export interface TutorialContextValue {
  state: TutorialState;
  startTutorial: () => void;
  nextStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  resetTutorial: () => void;
}