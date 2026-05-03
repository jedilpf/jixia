/**
 * dndTypes.ts
 * 拖拽系统类型定义，所有 drag/drop 相关的类型必须在此定义
 */

import type { DebateCard } from '@/battleV2/types';

// Drag 类型常量
export const DRAG_CARD_TYPE = 'card';
export const DRAG_ATTACK_TYPE = 'attack';

// 卡牌拖拽项
export interface CardDragItem {
  type: typeof DRAG_CARD_TYPE;
  card: DebateCard;
  sourceSlot: 'layer1' | 'layer2';
}

// 攻击拖拽项（预留）
export interface AttackDragItem {
  type: typeof DRAG_ATTACK_TYPE;
  unitId: string;
}

export type DragItem = CardDragItem | AttackDragItem;
