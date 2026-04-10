import { ARENAS } from '@/battleV2/arena';
import { ArenaId } from '@/battleV2/types';

interface BattleSetupProps {
  selectedArenaId: ArenaId;
  onSelectArena: (arenaId: ArenaId) => void;
  onStartBattle: () => void;
  onBackMenu: () => void;
}

export function BattleSetup(props: BattleSetupProps) {
  const { selectedArenaId, onSelectArena, onStartBattle, onBackMenu } = props;

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#1a0a0a] to-[#0d0505] text-[#f5e6b8]">
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{
        background: 'radial-gradient(circle at 30% 30%, rgba(139,69,19,0.3), transparent 50%), radial-gradient(circle at 70% 70%, rgba(139,0,0,0.2), transparent 50%)'
      }} />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col px-6 py-6">
        <header className="mb-6 flex items-center justify-between border-b border-[#d4a520]/30 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-widest text-[#d4a520]">选择战场</h2>
            <p className="mt-1 text-sm text-[#a7c5ba]">不同战场有不同规则，选择适合你的战场</p>
          </div>
          <button
            onClick={onBackMenu}
            className="rounded-md border border-[#8B7355]/60 bg-transparent px-4 py-2 text-sm text-[#d4a520] transition hover:bg-[#d4a520]/10"
          >
            返回
          </button>
        </header>

        <main className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto pb-4 md:grid-cols-2">
          {ARENAS.map((arena) => {
            const isSelected = arena.id === selectedArenaId;
            return (
              <button
                key={arena.id}
                onClick={() => onSelectArena(arena.id)}
                className={[
                  'group relative rounded-xl border-2 p-5 text-left transition duration-200',
                  isSelected
                    ? 'border-[#d4a520] bg-[#2a1515]'
                    : 'border-[#8B7355]/30 bg-[#1a0a0a]/50 hover:border-[#d4a520]/50 hover:bg-[#1f0f0f]',
                ].join(' ')}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#d4a520]">{arena.name}</h3>
                  {isSelected && (
                    <span className="rounded-full bg-[#d4a520]/20 px-3 py-1 text-xs font-bold text-[#d4a520]">
                      已选
                    </span>
                  )}
                </div>
                <p className="mb-3 text-sm text-[#a7c5ba]">{arena.oneLine}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="font-bold text-[#d4a520] min-w-[50px]">开局</span>
                    <span className="text-[#f5e6b8]">{arena.passive}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-[#d4a520] min-w-[50px]">加成</span>
                    <span className="text-[#f5e6b8]">{arena.bias}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-[#ff6b35] min-w-[50px]">绝技</span>
                    <span className="text-[#ffb380]">{arena.skill}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </main>

        <footer className="mt-auto flex items-center justify-end pt-4 border-t border-[#d4a520]/30">
          <button
            onClick={onStartBattle}
            className="group flex items-center gap-3 rounded-lg border-2 border-[#d4a520] bg-[#8B4513] px-8 py-3 text-lg font-bold text-[#f5e6b8] transition-all hover:bg-[#A0522D]"
          >
            开始战斗
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </footer>
      </div>
    </div>
  );
}