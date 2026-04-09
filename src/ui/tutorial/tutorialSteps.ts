import type { TutorialStep, TutorialStepId } from './types';

/**
 * 新手试炼教程步骤
 *
 * 目标：帮助首次玩家理解游戏并完成第一场对战
 */
export const TUTORIAL_STEPS: Record<TutorialStepId, TutorialStep> = {
  welcome: {
    id: 'welcome',
    title: '欢迎来到稷下学宫',
    content: '这里是诸子百家论辩之地。你将代表一个学派，通过出牌辩论来争夺"大势"。先达到8点大势者获胜。',
    skipable: true,
    nextStep: 'phase_intro',
  },

  phase_intro: {
    id: 'phase_intro',
    title: '当前阶段：暗棋布阵',
    content: '现在是"暗棋布阵"阶段。你和对手同时选择卡牌放入主议位或旁议位，彼此看不到对方的布局。',
    highlightSelector: '.phase-indicator',
    skipable: true,
    nextStep: 'select_card',
  },

  select_card: {
    id: 'select_card',
    title: '选择一张卡牌',
    content: '从手牌区选择一张卡牌。点击卡牌即可选中。每张卡牌有费用（左上角数字）和势力值。',
    highlightSelector: '.hand-bar',
    actionHint: '点击下方手牌区的一张卡牌',
    skipable: true,
    nextStep: 'submit_main',
  },

  submit_main: {
    id: 'submit_main',
    title: '提交到主议位',
    content: '主议位是正面战场，卡牌的势力值直接对决。胜者获得大势加分。点击"提交主议"按钮将选中的卡牌放入主议位。',
    highlightSelector: '.submit-main-btn',
    actionHint: '选中卡牌后，点击右侧"提交主议"按钮',
    skipable: true,
    nextStep: 'submit_side',
  },

  submit_side: {
    id: 'submit_side',
    title: '提交到旁议位',
    content: '旁议位是侧面战场，用于辅助主议。旁议胜者可以为后续回合积累优势。每回合最多可放置2张卡牌。',
    highlightSelector: '.submit-side-btn',
    actionHint: '也可以尝试点击"提交旁议"按钮',
    skipable: true,
    nextStep: 'resolve_round',
  },

  resolve_round: {
    id: 'resolve_round',
    title: '结算本回合',
    content: '布局完成后，点击"落子结算"按钮揭示双方卡牌，计算胜负，更新大势值。',
    highlightSelector: '.resolve-btn',
    actionHint: '点击"落子结算"按钮完成本回合',
    skipable: true,
    nextStep: 'understand_result',
  },

  understand_result: {
    id: 'understand_result',
    title: '理解结算结果',
    content: '结算后查看右侧日志，了解主议和旁议的胜负情况。大势值会根据结果更新。继续出牌直到一方大势达到8点。',
    highlightSelector: '.chronicle-logs',
    skipable: true,
    nextStep: 'complete',
  },

  complete: {
    id: 'complete',
    title: '教程完成',
    content: '你已经了解了基本玩法！继续对战，积累大势，争取获胜。祝你在稷下学宫论辩成功！',
    skipable: false,
    nextStep: undefined,
  },
};

/**
 * 教程步骤顺序
 */
export const TUTORIAL_STEP_ORDER: TutorialStepId[] = [
  'welcome',
  'phase_intro',
  'select_card',
  'submit_main',
  'submit_side',
  'resolve_round',
  'understand_result',
  'complete',
];

/**
 * 获取下一个教程步骤
 */
export function getNextStep(currentId: TutorialStepId): TutorialStepId | null {
  const currentIndex = TUTORIAL_STEP_ORDER.indexOf(currentId);
  if (currentIndex < 0 || currentIndex >= TUTORIAL_STEP_ORDER.length - 1) {
    return null;
  }
  return TUTORIAL_STEP_ORDER[currentIndex + 1];
}

/**
 * 获取教程步骤
 */
export function getTutorialStep(id: TutorialStepId): TutorialStep | undefined {
  return TUTORIAL_STEPS[id];
}