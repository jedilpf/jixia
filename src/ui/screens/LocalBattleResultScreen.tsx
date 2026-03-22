import type { GameState } from '@/core/types';
import { FACTIONS } from '@/data/game/factions';

interface LocalBattleResultScreenProps {
  state: GameState;
  onRestart: () => void;
  onBackHome: () => void;
}

export function LocalBattleResultScreen({ state, onRestart, onBackHome }: LocalBattleResultScreenProps) {
  const factionMap = new Map(FACTIONS.map((f) => [f.id, f.name]));
  const title =
    state.winnerId === 'draw' ? '平局' : state.winnerId === 'player' ? '玩家1胜利' : '玩家2胜利';

  return (
    <div className="flex h-full items-center justify-center bg-[#100f14] text-[#e7e1f0]">
      <div className="w-[620px] rounded-xl border border-[#5d5a72] bg-[#1a1822] p-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded border border-[#5d5a72] p-3">
            玩家1门派：{factionMap.get(state.players.player.factionId ?? '') ?? '未选择'}
          </div>
          <div className="rounded border border-[#5d5a72] p-3">
            玩家2门派：{factionMap.get(state.players.enemy.factionId ?? '') ?? '未选择'}
          </div>
          <div className="rounded border border-[#5d5a72] p-3">玩家1大势：{state.players.player.momentum}</div>
          <div className="rounded border border-[#5d5a72] p-3">玩家2大势：{state.players.enemy.momentum}</div>
        </div>
        <div className="mt-4 rounded border border-[#5d5a72] bg-[#15131d] p-3 text-xs text-[#bfb8cd]">
          共进行 {state.round} 回合
        </div>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            className="rounded-lg border border-[#7e78a0] bg-[#2b2640] px-6 py-2 text-sm"
            onClick={onRestart}
          >
            再来一局
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#7e78a0] bg-[#2b2640] px-6 py-2 text-sm"
            onClick={onBackHome}
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
