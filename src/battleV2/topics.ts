/**
 * 议题系统 - 简化版（空实现）
 */

import { EffectKind } from './types';

export interface TopicDefinition {
  id: string;
  title: string;
  summary?: string;
}

export interface TopicConfig {
  version: string;
  topics: TopicDefinition[];
}

export const DEFAULT_TOPIC_CONFIG: TopicConfig = {
  version: '2026-04-15',
  topics: [
    { id: 'topic_default', title: '默认议题', summary: '无特殊效果' },
  ],
};

export function getTopicConfig(): TopicConfig {
  return DEFAULT_TOPIC_CONFIG;
}

export function getTopicById(id: string): TopicDefinition | null {
  return DEFAULT_TOPIC_CONFIG.topics.find(t => t.id === id) || null;
}

export function getTopicEffectMultiplier(_topicId: string, _effectKind: EffectKind): number {
  return 1; // 简化版：无效果加成
}