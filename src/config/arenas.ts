/**
 * Arenas Config - 竞技场与场景配置
 */

export type ArenaId = 'jixia' | 'arena2' | 'arena3';

export interface ArenaDefinition {
  id: ArenaId;
  name: string;
  description: string;
  background: string;
  difficulty: 'easy' | 'normal' | 'hard';
  unlockLevel: number;
}

export const ARENAS: Record<ArenaId, ArenaDefinition> = {
  jixia: {
    id: 'jixia',
    name: '稷下学宫',
    description: '最初的辩论之地。在这里，你将踏出成为一代大儒的第一步。',
    background: '/assets/bg/jixia_bg.jpg',
    difficulty: 'easy',
    unlockLevel: 1,
  },
  arena2: {
    id: 'arena2',
    name: '临淄校场',
    description: '齐国最锋利的剑刃，不仅要在口舌上胜人，更要在意志上压倒对手。',
    background: '/assets/bg/qi_arena.jpg',
    difficulty: 'normal',
    unlockLevel: 3,
  },
  arena3: {
    id: 'arena3',
    name: '函谷雄关',
    description: '秦国最险峻的关路。面对坚实的壁垒，你需要更尖锐的论点。',
    background: '/assets/bg/hangu_pass.jpg',
    difficulty: 'hard',
    unlockLevel: 5,
  },
};
