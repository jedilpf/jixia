import type { IssueDefinition } from '@/core/types';

const directionLabels = {
  ritual: '礼法先行',
  economy: '富民优先',
  strategy: '权变制衡',
} as const;

export const ISSUES: IssueDefinition[] = [
  {
    id: 'state_priority',
    name: '治国先富民还是先立法',
    description: '围绕治理次序的核心争论，决定本局叙事方向。',
    seedPrompt: '治国先富民，还是先立法？',
    directionLabels,
    effectText: '每 3 轮进行一次引爆判定，方向领先方更易触发高光。',
  },
  {
    id: 'crisis_response',
    name: '危局之下先守还是先变',
    description: '在外压与内耗并存时，守成与变法的取舍冲突。',
    seedPrompt: '危局之下先守，还是先变？',
    directionLabels,
    effectText: '方向分数差距越大，引爆概率越高。',
  },
  {
    id: 'public_will',
    name: '民意应安抚还是应动员',
    description: '民心是压舱石还是号角，决定明暗辩论走向。',
    seedPrompt: '民意应安抚，还是应动员？',
    directionLabels,
    effectText: '民众支持会参与 burstScore 计算。',
  },
];
