/**
 * 轻异构三路系统实现
 * 
 * 三路规则：
 * - 左路【立势】：控制左路，下回合开始时 +1 心证
 * - 中路【争衡】：控制中路，获得 2 点议势（胜利条件：10 点议势）
 * - 右路【机辩】：控制右路，获得 1 点机变（用于下一张术牌/反诘 -1 费）
 */

import { SeatId, BattlePlayer, DebateBattleState } from './types';

// 三路定义
export type LaneId = 'left' | 'center' | 'right';
export type LaneName = '立势' | '争衡' | '机辩';

export const LANE_MAPPING: Record<SeatId, LaneId> = {
  'xian_sheng': 'left',      // 先声席 = 左路
  'zhu_bian': 'center',      // 主辩席 = 中路
  'yu_lun': 'right',         // 余论席 = 右路
};

export const LANE_NAMES: Record<LaneId, LaneName> = {
  left: '立势',
  center: '争衡',
  right: '机辩',
};

export const LANE_DESCRIPTIONS: Record<LaneId, string> = {
  left: '控制左路：下回合开始时 +1 心证',
  center: '控制中路：获得 2 点议势（10 点议势获胜）',
  right: '控制右路：获得 1 点机变（下一张术牌/反诘 -1 费）',
};

// 扩展资源接口
export interface ExtendedResources {
  xinZheng: number;        // 心证
  lingShi: number;         // 灵势
  maxLingShi: number;      // 最大灵势
  huYin: number;           // 护印
  zhengLi: number;         // 议势（胜利条件）
  shiXu: number;           // 失序
  wenMai: number;          // 文脉
  jiBian: number;          // 机变（新增）
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
 * 计算三路控制权
 */
export function calculateAllLaneControls(state: DebateBattleState): Record<LaneId, LaneControl> {
  return {
    left: calculateLaneControl(
      state.player.seats.xian_sheng,
      state.enemy.seats.xian_sheng
    ),
    center: calculateLaneControl(
      state.player.seats.zhu_bian,
      state.enemy.seats.zhu_bian
    ),
    right: calculateLaneControl(
      state.player.seats.yu_lun,
      state.enemy.seats.yu_lun
    ),
  };
}

/**
 * 应用三路回合结束奖励
 */
export function applyLaneRewards(
  state: DebateBattleState,
  laneControls: Record<LaneId, LaneControl>
): { playerRewards: string[]; enemyRewards: string[] } {
  const playerRewards: string[] = [];
  const enemyRewards: string[] = [];
  
  // 左路奖励：控制左路，下回合开始时 +1 心证
  // 这里先标记，在回合开始时实际增加
  if (laneControls.left.controlledBy === 'player') {
    state.player.resources.wenMai += 1;  // 使用文脉作为临时存储，在回合开始时转为心证
    playerRewards.push('左路立势：下回合 +1 心证');
  }
  if (laneControls.left.controlledBy === 'enemy') {
    state.enemy.resources.wenMai += 1;
    enemyRewards.push('左路立势：下回合 +1 心证');
  }
  
  // 中路奖励：控制中路，获得 2 点议势
  if (laneControls.center.controlledBy === 'player') {
    state.player.resources.zhengLi += 2;
    playerRewards.push('中路争衡：+2 议势');
    
    // 检查胜利条件
    if (state.player.resources.zhengLi >= 10) {
      state.phase = 'finished';
      playerRewards.push('🏆 议势达到 10 点，获得胜利！');
    }
  }
  if (laneControls.center.controlledBy === 'enemy') {
    state.enemy.resources.zhengLi += 2;
    enemyRewards.push('中路争衡：+2 议势');
    
    // 检查胜利条件
    if (state.enemy.resources.zhengLi >= 10) {
      state.phase = 'finished';
      enemyRewards.push('🏆 议势达到 10 点，获得胜利！');
    }
  }
  
  // 右路奖励：控制右路，获得 1 点机变
  if (laneControls.right.controlledBy === 'player') {
    state.player.resources.jiBian += 1;
    playerRewards.push('右路机辩：+1 机变');
  }
  if (laneControls.right.controlledBy === 'enemy') {
    state.enemy.resources.jiBian += 1;
    enemyRewards.push('右路机辩：+1 机变');
  }
  
  return { playerRewards, enemyRewards };
}

/**
 * 检查是否可以使用机变减费
 */
export function canUseJiBianDiscount(player: BattlePlayer, cardCost: number): boolean {
  return player.resources.jiBian >= 1 && cardCost > 1;
}

/**
 * 使用机变减费
 * 消耗 1 机变，下一张术牌/反诘费用 -1
 */
export function useJiBianDiscount(player: BattlePlayer): boolean {
  if (player.resources.jiBian >= 1) {
    player.resources.jiBian -= 1;
    // 这里可以设置一个标记，表示下一张牌减费
    // 在实际出牌时检查这个标记
    return true;
  }
  return false;
}

/**
 * 应用左路奖励（回合开始时）
 */
export function applyLeftLaneBonus(player: BattlePlayer): boolean {
  if (player.resources.wenMai > 0) {
    // 将文脉转换为心证
    const bonus = player.resources.wenMai;
    player.resources.wenMai = 0;
    player.resources.lingShi = Math.min(player.resources.maxLingShi, player.resources.lingShi + bonus);
    return true;
  }
  return false;
}

/**
 * 获取三路控制状态描述
 */
export function getLaneControlSummary(state: DebateBattleState): string {
  const controls = calculateAllLaneControls(state);
  const parts: string[] = [];
  
  (['left', 'center', 'right'] as LaneId[]).forEach(laneId => {
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
