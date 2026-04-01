import { DebateCard } from './types';

export interface TopicWeightProfile {
  // Fallback multiplier when no specific rule matches
  base?: number;
  // Optional multipliers keyed by effect kind (damage, draw, etc.)
  byEffectKind?: Partial<Record<DebateCard['effectKind'], number>>;
  // Optional multipliers keyed by card type string
  byCardType?: Record<string, number>;
  // Optional multipliers keyed by framework faction name
  byFaction?: Record<string, number>;
}

export interface TopicDefinition {
  id: string;
  title: string;
  summary?: string;
  weights: TopicWeightProfile;
}

export interface TopicConfig {
  version: string;
  topics: TopicDefinition[];
}

export const DEFAULT_TOPIC_CONFIG: TopicConfig = {
  version: '2026-03-13',
  topics: [
    {
      id: 'topic_governance_reform',
      title: '守成与变法，何者先行？',
      summary: '偏重治理与结构推进，压低纯爆发。',
      weights: {
        base: 1,
        byEffectKind: {
          draw: 1.1,
          shield: 1.05,
          zhengli: 1.15,
          damage: 0.95,
        },
      },
    },
    {
      id: 'topic_law_virtue',
      title: '法先于德，还是德先于法？',
      summary: '偏重对抗与秩序手段，强化反制与压制。',
      weights: {
        base: 1,
        byEffectKind: {
          shixu: 1.2,
          damage: 1.1,
          shield: 0.95,
        },
      },
    },
    {
      id: 'topic_fast_slow',
      title: '速胜与久治，孰为上策？',
      summary: '偏重节奏拉扯，前场爆发高但续航略降。',
      weights: {
        base: 1,
        byEffectKind: {
          damage: 1.15,
          summon_front: 1.1,
          summon_back: 0.95,
          draw: 0.9,
        },
      },
    },
  ],
};

let runtimeTopicConfig: TopicConfig = DEFAULT_TOPIC_CONFIG;

function clampMultiplier(value: number): number {
  return Math.max(0.5, Math.min(1.8, value));
}

export function getTopicConfig(): TopicConfig {
  return runtimeTopicConfig;
}

export function setTopicConfig(config: TopicConfig): void {
  if (!config.topics.length) {
    throw new Error('Topic config must contain at least one topic.');
  }
  runtimeTopicConfig = config;
}

export function pickTopicDefinition(
  randomFn: () => number = Math.random,
  config: TopicConfig = runtimeTopicConfig
): TopicDefinition {
  const topics = config.topics;
  const idx = Math.floor(randomFn() * topics.length);
  return topics[idx] ?? topics[0];
}

export function getTopicById(
  topicId: string,
  config: TopicConfig = runtimeTopicConfig
): TopicDefinition | undefined {
  return config.topics.find((topic) => topic.id === topicId);
}

export function getTopicEffectMultiplier(
  topicId: string,
  card: Pick<DebateCard, 'effectKind' | 'type' | 'faction'>,
  config: TopicConfig = runtimeTopicConfig
): number {
  const topic = getTopicById(topicId, config);
  if (!topic) return 1;

  const base = topic.weights.base ?? 1;
  const effectKindFactor = topic.weights.byEffectKind?.[card.effectKind] ?? 1;
  const cardTypeFactor = topic.weights.byCardType?.[card.type] ?? 1;
  const factionFactor = card.faction ? (topic.weights.byFaction?.[card.faction] ?? 1) : 1;

  return clampMultiplier(base * effectKindFactor * cardTypeFactor * factionFactor);
}
