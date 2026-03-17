import type { GameState } from '@/core/types';

interface ResultScreenProps {
  state: GameState;
  onRestart: () => void;
}

export function ResultScreen({ state, onRestart }: ResultScreenProps) {
  const title =
    state.winnerId === 'draw' ? '平局' : state.winnerId === 'player' ? '我方胜利' : '对手胜利';

  return (
    <div className="flex h-full items-center justify-center bg-[#100f14] text-[#e7e1f0]">
      <div className="w-[520px] rounded-xl border border-[#5d5a72] bg-[#1a1822] p-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded border border-[#5d5a72] p-3">我方大势：{state.players.player.momentum}</div>
          <div className="rounded border border-[#5d5a72] p-3">对手大势：{state.players.enemy.momentum}</div>
        </div>
        <div className="mt-4 rounded border border-[#5d5a72] bg-[#15131d] p-3 text-xs text-[#bfb8cd]">
          共进行 {state.round} 回合
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

