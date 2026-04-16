/**
 * 轻异构议区系统实现
 *
 * 议区规则（根据文档v1.2）：
 * - 主议【大势】：控制主议，获得大势（胜利条件：8点大势）
 * - 旁议【筹】：控制旁议，获得1个筹（可用于出牌减费）
 */

import { SeatId, BattlePlayer, DebateBattleState } from './types';

// 议区定义
export type LaneId = 'zhu_yi' | 'pang_yi';
export type LaneName = '主议' | '旁议';

export const LANE_MAPPING: Record<SeatId, LaneId> = {
  'zhu_yi': 'zhu_yi',      // 主议 = 主议
  'pang_yi': 'pang_yi',    // 旁议 = 旁议
};

export const LANE_NAMES: Record<LaneId, LaneName> = {
  zhu_yi: '主议',
  pang_yi: '旁议',
};

export const LANE_DESCRIPTIONS: Record<LaneId, string> = {
  zhu_yi: '控制主议：获得大势（8点大势获胜），主议胜额外+1大势',
  pang_yi: '控制旁议：获得1个筹（可用于出牌减费）',
};

// 资源快照（含兼容旧字段）
export interface ExtendedResources {
  xinZheng: number;        // 心证
  lingShi: number;         // 灵势
  maxLingShi: number;      // 最大灵势
  huYin: number;           // 护印
  zhengLi: number;         // 证立（本回合加成）
  shiXu: number;           // 失序
  wenMai: number;          // 文脉（着书累积）
  jiBian: number;          // 机变（兼容旧字段）
  daShi: number;           // 大势（主议胜利推进）
  chou: number;            // 筹（旁议奖励）
}

// 控制权状态
export interface LaneControl {
  controlledBy: Side | null;  // 控制方
  playerPower: number;        // 玩家战力
  enemyPower: number;         // 敌方战力
}

export type Side = 'player' | 'enemy';

/**
 * 计算单路控制权
 * 规则：
 * - 该路你的场上单位优于对方 -> 你控制
 * - 或对方为空而你有单位 -> 你控制
 * - 平局则双方都不控制
 */
export function calculateLaneControl(
  playerLane: { front: { power: number } | null; back: { power: number } | null },
  enemyLane: { front: { power: number } | null; back: { power: number } | null }
): LaneControl {
  // 计算双方战力
  const playerPower = (playerLane.front?.power || 0) + (playerLane.back?.power || 0);
  const enemyPower = (enemyLane.front?.power || 0) + (enemyLane.back?.power || 0);
  
  // 判定控制权
  let controlledBy: Side | null = null;
  
  if (playerPower > enemyPower && playerPower > 0) {
    controlledBy = 'player';
  } else if (enemyPower > playerPower && enemyPower > 0) {
    controlledBy = 'enemy';
  }
  // 平局或双方都为空，则无人控制
  
  return {
    controlledBy,
    playerPower,
    enemyPower,
  };
}

/**
 * 计算议区控制权
 */
export function calculateAllLaneControls(state: DebateBattleState): Record<LaneId, LaneControl> {
  return {
    zhu_yi: calculateLaneControl(
      state.player.seats.zhu_yi,
      state.enemy.seats.zhu_yi
    ),
    pang_yi: calculateLaneControl(
      state.player.seats.pang_yi,
      state.enemy.seats.pang_yi
    ),
  };
}

/**
 * 应用议区回合结束奖励
 */
export function applyLaneRewards(
  state: DebateBattleState,
  laneControls: Record<LaneId, LaneControl>
): { playerRewards: string[]; enemyRewards: string[] } {
  const playerRewards: string[] = [];
  const enemyRewards: string[] = [];

  // 主议奖励：控制主议，获得大势（胜利条件：8点大势）
  // 主议胜额外 +1 大势
  if (laneControls.zhu_yi.controlledBy === 'player') {
    state.player.resources.daShi += 1;  // 基础获得1点大势
    playerRewards.push('主议胜：+1 大势');

    // 检查胜利条件
    if (state.player.resources.daShi >= 8) {
      state.phase = 'finished';
      playerRewards.push('🏆 大势达到 8 点，获得胜利！');
    }
  }
  if (laneControls.zhu_yi.controlledBy === 'enemy') {
    state.enemy.resources.daShi += 1;
    enemyRewards.push('主议胜：+1 大势');

    // 检查胜利条件
    if (state.enemy.resources.daShi >= 8) {
      state.phase = 'finished';
      enemyRewards.push('🏆 大势达到 8 点，获得胜利！');
    }
  }

  // 旁议奖励：控制旁议，获得1个筹（可用于出牌减费）
  if (laneControls.pang_yi.controlledBy === 'player') {
    if (state.player.resources.chou < 1) {
      state.player.resources.chou += 1;
      playerRewards.push('旁议胜：获得1筹');
    } else {
      playerRewards.push('旁议胜：筹已达上限');
    }
  }
  if (laneControls.pang_yi.controlledBy === 'enemy') {
    if (state.enemy.resources.chou < 1) {
      state.enemy.resources.chou += 1;
      enemyRewards.push('旁议胜：获得1筹');
    } else {
      enemyRewards.push('旁议胜：筹已达上限');
    }
  }

  return { playerRewards, enemyRewards };
}

/**
 * 检查是否可以使用筹减费
 */
export function canUseChouDiscount(player: BattlePlayer, cardCost: number): boolean {
  return player.resources.chou >= 1 && cardCost > 1;
}

/**
 * 使用筹减费
 * 消耗 1 筹，出牌费用 -1
 */
export function useChouDiscount(player: BattlePlayer): boolean {
  if (player.resources.chou >= 1) {
    player.resources.chou -= 1;
    return true;
  }
  return false;
}

/**
 * 获取议区控制状态描述
 */
export function getLaneControlSummary(state: DebateBattleState): string {
  const controls = calculateAllLaneControls(state);
  const parts: string[] = [];

  (['zhu_yi', 'pang_yi'] as LaneId[]).forEach(laneId => {
    const control = controls[laneId];
    const laneName = LANE_NAMES[laneId];

    if (control.controlledBy === 'player') {
      parts.push(`我方控制${laneName}`);
    } else if (control.controlledBy === 'enemy') {
      parts.push(`敌方控制${laneName}`);
    } else {
      parts.push(`${laneName}未控制`);
    }
  });

  return parts.join(' | ');
}
