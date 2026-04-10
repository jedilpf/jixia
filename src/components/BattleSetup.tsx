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
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#2a0e0a] to-[#120604] text-[#f8e6be]">
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{
        background: 'radial-gradient(circle at 30% 30%, rgba(210,150,72,0.24), transparent 50%), radial-gradient(circle at 70% 70%, rgba(125,61,35,0.28), transparent 50%)'
      }} />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col px-6 py-6">
        <header className="mb-6 flex items-center justify-between border-b border-[#f0c36e]/30 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-widest text-[#f0c36e]">选择战场</h2>
            <p className="mt-1 text-sm text-[#d1b185]">不同战场有不同规则，选择适合你的战场</p>
          </div>
          <button
            onClick={onBackMenu}
            className="rounded-md border border-[#d29648]/60 bg-transparent px-4 py-2 text-sm text-[#f0c36e] transition hover:bg-[#f0c36e]/10"
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
                    ? 'border-[#f0c36e] bg-[#341410]'
                    : 'border-[#d29648]/30 bg-[#120604]/50 hover:border-[#f0c36e]/50 hover:bg-[#25100e]',
                ].join(' ')}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#f0c36e]">{arena.name}</h3>
                  {isSelected && (
                    <span className="rounded-full bg-[#f0c36e]/20 px-3 py-1 text-xs font-bold text-[#f0c36e]">
                      已选
                    </span>
                  )}
                </div>
                <p className="mb-3 text-sm text-[#d1b185]">{arena.oneLine}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="font-bold text-[#f0c36e] min-w-[50px]">开局</span>
                    <span className="text-[#f8e6be]">{arena.passive}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-[#f0c36e] min-w-[50px]">加成</span>
                    <span className="text-[#f8e6be]">{arena.bias}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-[#d46b42] min-w-[50px]">绝技</span>
                    <span className="text-[#f1b08b]">{arena.skill}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </main>

        <footer className="mt-auto flex items-center justify-end pt-4 border-t border-[#f0c36e]/30">
          <button
            onClick={onStartBattle}
            className="group flex items-center gap-3 rounded-lg border-2 border-[#f0c36e] bg-[#7a2f1d] px-8 py-3 text-lg font-bold text-[#f8e6be] transition-all hover:bg-[#9a4126]"
          >
            开始战斗
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </footer>
      </div>
    </div>
  );
}