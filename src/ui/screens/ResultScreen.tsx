import type { GameState } from '@/core/types';

interface BattleSettlementSummary {
  settlementKey: string;
  playerMomentum: number;
  opportunityGain: number;
  expGain: number;
  goldGain: number;
  won: boolean;
}

interface ResultScreenProps {
  state: GameState;
  progress: {
    level: number;
    exp: number;
    opportunity: number;
    winCount: number;
    totalGames: number;
  };
  settlement: BattleSettlementSummary | null;
  onRestart: () => void;
}

export function ResultScreen({ state, progress, settlement, onRestart }: ResultScreenProps) {
  const title =
    state.winnerId === 'draw' ? '平局' : state.winnerId === 'player' ? '我方胜利' : '对手胜利';
  const winRate =
    progress.totalGames > 0 ? Math.round((progress.winCount / progress.totalGames) * 100) : 0;

  return (
    <div className="flex h-full items-center justify-center bg-[#100f14] text-[#e7e1f0]">
      <div className="w-[560px] rounded-xl border border-[#5d5a72] bg-[#1a1822] p-6">
        <h2 className="text-2xl font-bold">{title}</h2>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded border border-[#5d5a72] p-3">我方大势：{state.players.player.momentum}</div>
          <div className="rounded border border-[#5d5a72] p-3">对手大势：{state.players.enemy.momentum}</div>
        </div>

        <div className="mt-4 rounded border border-[#5d5a72] bg-[#15131d] p-3 text-xs text-[#bfb8cd]">
          共进行 {state.round} 回合
        </div>

        <div className="mt-4 rounded border border-[#5d5a72] bg-[#15131d] p-3 text-sm">
          <div className="text-[#bfb8cd]">战后成长结算</div>
          {settlement ? (
            <div className="mt-2 space-y-1 text-[#e7e1f0]">
              <div>大势转化：{settlement.playerMomentum} 大势 → +{settlement.opportunityGain} 机遇</div>
              <div>经验奖励：+{settlement.expGain}</div>
              <div>大事奖励：+{settlement.goldGain}</div>
            </div>
          ) : (
            <div className="mt-2 text-[#bfb8cd]">本局奖励已结算</div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-[#bfb8cd]">
          <div className="rounded border border-[#5d5a72] p-2">当前等级：Lv.{progress.level}</div>
          <div className="rounded border border-[#5d5a72] p-2">当前机遇：{progress.opportunity}</div>
          <div className="rounded border border-[#5d5a72] p-2">总胜率：{winRate}%</div>
        </div>

        <button
          type="button"
          className="mt-5 rounded-lg border border-[#7e78a0] bg-[#2b2640] px-6 py-2 text-sm"
          onClick={onRestart}
        >
          返回首页
        </button>
      </div>
    </div>
  );
}
