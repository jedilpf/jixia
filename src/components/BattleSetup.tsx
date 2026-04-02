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
    <div className="relative h-full w-full overflow-hidden bg-[#F2ECD9] text-[#3D2B1F]">
      {/* 矿物色背景纹理 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(58,95,65,0.08),transparent_42%),radial-gradient(circle_at_82%_70%,rgba(44,95,120,0.08),transparent_44%)]" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")' }} />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col px-4 py-8 md:px-8">
        <header className="mb-8 flex items-center justify-between border-b-2 border-[#D4AF65]/30 pb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-[0.2em] text-[#5C4033]">择地而论</h2>
            <p className="mt-2 text-sm text-[#7D5C40]">凡论战者，必占地利。不同场域自有其先贤余韵与特殊规则。</p>
          </div>
          <button
            onClick={onBackMenu}
            className="rounded-md border border-[#8D2F2F]/40 bg-[#F5E6E6] px-4 py-2 text-xs font-bold text-[#8D2F2F] transition hover:bg-[#8D2F2F] hover:text-white"
          >
            辞别归隐
          </button>
        </header>

        <main className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto pb-6 lg:grid-cols-2">
          {ARENAS.map((arena) => {
            const isSelected = arena.id === selectedArenaId;
            return (
              <button
                key={arena.id}
                onClick={() => onSelectArena(arena.id)}
                className={[
                  'group relative rounded-2xl border-2 p-6 text-left transition duration-300 transform',
                  isSelected
                    ? 'scale-[1.02] border-[#D4AF65] bg-[#FFF9EB] shadow-xl'
                    : 'border-[#B8A48D]/40 bg-white/50 hover:bg-white hover:border-[#B8A48D] hover:shadow-md',
                ].join(' ')}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-[#5C4033]">{arena.name}</h3>
                  {isSelected ? (
                    <span className="rounded-full border-2 border-[#3A5F41] bg-[#EBF5EE] px-4 py-1 text-xs font-bold text-[#3A5F41]">
                      已定场
                    </span>
                  ) : null}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-[#7D5C40] italic">“{arena.oneLine}”</p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="font-bold text-[#8B6A4E]">【规则】</span>
                    <span className="text-[#5C4033]">{arena.passive}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-[#8B6A4E]">【倾向】</span>
                    <span className="text-[#5C4033]">{arena.bias}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-[#8D2F2F]">【绝变】</span>
                    <span className="text-[#8D2F2F]/90">{arena.skill}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </main>

        <footer className="mt-auto flex items-center justify-end pt-6 border-t-2 border-[#D4AF65]/30">
          <button
            onClick={onStartBattle}
            className="group flex items-center gap-3 rounded-lg border-2 border-[#8D2F2F] bg-[#8D2F2F] px-10 py-3 text-lg font-bold text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            挺进稷下
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
