/**
 * 议区系统 - v2.0 两层结算版
 *
 * 核心逻辑：
 * 1. 先比较主议/旁议辩锋，结算大势与筹
 * 2. 再进行单位互斗，更新场面
 */

import { BattlePlayer, CHOU_MAX, DebateBattleState, SeatState, Side } from './types';

export type LaneId = 'zhu_yi' | 'pang_yi';

export const LANE_NAMES: Record<LaneId, string> = {
  zhu_yi: '主议',
  pang_yi: '旁议',
};

export interface LaneControl {
  controlledBy: Side | null;
  playerPower: number;
  enemyPower: number;
}

export function calculateSeatPower(seat: SeatState): number {
  return seat.units.reduce((sum, unit) => sum + Math.max(0, unit.power), 0);
}

export function calculateLaneControl(playerSeat: SeatState, enemySeat: SeatState): LaneControl {
  const playerPower = calculateSeatPower(playerSeat);
  const enemyPower = calculateSeatPower(enemySeat);

  let controlledBy: Side | null = null;
  if (playerPower > enemyPower && playerPower > 0) controlledBy = 'player';
  if (enemyPower > playerPower && enemyPower > 0) controlledBy = 'enemy';

  return {
    controlledBy,
    playerPower,
    enemyPower,
  };
}

export function calculateAllLaneControls(state: DebateBattleState): Record<LaneId, LaneControl> {
  return {
    zhu_yi: calculateLaneControl(state.player.seats.zhu_yi, state.enemy.seats.zhu_yi),
    pang_yi: calculateLaneControl(state.player.seats.pang_yi, state.enemy.seats.pang_yi),
  };
}

function resolveUnitCombat(playerSeat: SeatState, enemySeat: SeatState): void {
  const loop = Math.max(playerSeat.units.length, enemySeat.units.length);

  for (let i = 0; i < loop; i += 1) {
    const playerUnit = playerSeat.units[i];
    const enemyUnit = enemySeat.units[i];

    if (!playerUnit || !enemyUnit) continue;

    enemyUnit.hp -= playerUnit.power;
    playerUnit.hp -= enemyUnit.power;
  }

  playerSeat.units = playerSeat.units.filter((unit) => unit.hp > 0);
  enemySeat.units = enemySeat.units.filter((unit) => unit.hp > 0);
}

/**
 * 回合末议区结算：
 * - 主议胜者 +1 大势
 * - 旁议胜者 +1 筹（上限 CHOU_MAX）
 * - 之后单位互斗并清除阵亡单位
 */
export function resolveCombat(state: DebateBattleState): { summary: string[] } {
  const controls = calculateAllLaneControls(state);
  const summary: string[] = [];

  const zhuControl = controls.zhu_yi;
  if (zhuControl.controlledBy === 'player') {
    state.player.resources.dashi += 1;
    summary.push('我方主议得势：大势 +1');
  } else if (zhuControl.controlledBy === 'enemy') {
    state.enemy.resources.dashi += 1;
    summary.push('敌方主议得势：大势 +1');
  } else {
    summary.push('主议势均力敌');
  }

  const pangControl = controls.pang_yi;
  if (pangControl.controlledBy === 'player') {
    state.player.resources.chou = Math.min(CHOU_MAX, state.player.resources.chou + 1);
    summary.push('我方旁议胜：筹 +1');
  } else if (pangControl.controlledBy === 'enemy') {
    state.enemy.resources.chou = Math.min(CHOU_MAX, state.enemy.resources.chou + 1);
    summary.push('敌方旁议胜：筹 +1');
  } else {
    summary.push('旁议势均力敌');
  }

  resolveUnitCombat(state.player.seats.zhu_yi, state.enemy.seats.zhu_yi);
  resolveUnitCombat(state.player.seats.pang_yi, state.enemy.seats.pang_yi);

  return { summary };
}

export function getLaneControlSummary(state: DebateBattleState): string {
  const controls = calculateAllLaneControls(state);

  const parts: string[] = [];
  (['zhu_yi', 'pang_yi'] as LaneId[]).forEach((laneId) => {
    const laneControl = controls[laneId];
    if (laneControl.controlledBy === 'player') {
      parts.push(`我方控制${LANE_NAMES[laneId]}`);
    } else if (laneControl.controlledBy === 'enemy') {
      parts.push(`敌方控制${LANE_NAMES[laneId]}`);
    } else {
      parts.push(`${LANE_NAMES[laneId]}势均力敌`);
    }
  });

  return parts.join(' | ');
}

export function applyLaneRewards(
  _state: DebateBattleState,
  _laneControls: Record<LaneId, LaneControl>,
): { playerRewards: string[]; enemyRewards: string[] } {
  return { playerRewards: [], enemyRewards: [] };
}

export function canUseChouDiscount(player: BattlePlayer, cardCost: number): boolean {
  return player.resources.chou > 0 && cardCost > 0;
}

export function useChouDiscount(player: BattlePlayer): boolean {
  if (player.resources.chou <= 0) return false;
  player.resources.chou -= 1;
  return true;
}
