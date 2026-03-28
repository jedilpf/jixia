/**
 * @legacy 旧版阶段状态机 — 仅供 src/core/gameEngine.ts 使用
 *
 * ⚠️  请勿在此文件中添加新功能。
 *     新的阶段控制逻辑请在 src/battleV2/engine.ts 中实现。
 */
import type { BattlePhase } from '@/core/types';

export const BATTLE_PHASE_ORDER: BattlePhase[] = [
  'round_start',
  'hidden_submit',
  'submission_lock',
  'reveal',
  'public_effect',
  'zone_resolve',
  'issue_burst_check',
];

export function getNextBattlePhase(current: BattlePhase): BattlePhase {
  const index = BATTLE_PHASE_ORDER.indexOf(current);
  if (index < 0 || index === BATTLE_PHASE_ORDER.length - 1) {
    return BATTLE_PHASE_ORDER[0];
  }
  return BATTLE_PHASE_ORDER[index + 1];
}

export function getBattlePhaseLabel(phase: BattlePhase): string {
  const labels: Record<BattlePhase, string> = {
    round_start: '回合开始',
    hidden_submit: '暗辩提交',
    submission_lock: '提交锁定',
    reveal: '明辩揭示',
    public_effect: '公开效果结算',
    zone_resolve: '议区胜负结算',
    issue_burst_check: '议题推进/引爆判定',
  };
  return labels[phase];
}

export function isActionPhase(phase: BattlePhase): boolean {
  return phase === 'hidden_submit';
}
