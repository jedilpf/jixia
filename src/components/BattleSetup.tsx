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
    <div className="relative h-full w-full overflow-hidden bg-[#0f1419] text-[#e9d8b4]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(213,167,84,0.18),transparent_48%),radial-gradient(circle_at_80%_72%,rgba(74,130,116,0.14),transparent_48%)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col px-4 py-6 md:px-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl tracking-[0.18em] text-[#f0ddb1]">选择论场</h2>
            <p className="mt-2 text-sm text-[#9eb1c5]">不同论场有不同被动与机制偏向，开局前可自由切换。</p>
          </div>
          <button
            onClick={onBackMenu}
            className="rounded-md border border-[#7e4d4d] bg-[#3b1d1f] px-3 py-1.5 text-xs text-[#ffc0c0] transition hover:bg-[#5a2a2e]"
          >
            返回菜单
          </button>
        </header>

        <main className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto pb-6 lg:grid-cols-2">
          {ARENAS.map((arena) => {
            const isSelected = arena.id === selectedArenaId;
            return (
              <button
                key={arena.id}
                onClick={() => onSelectArena(arena.id)}
                className={[
                  'rounded-2xl border p-4 text-left transition',
                  isSelected
                    ? 'border-[#d4af65] bg-[#2b241b] shadow-[0_0_0_1px_rgba(255,208,125,0.35)]'
                    : 'border-[#566473] bg-[#1a222c] hover:border-[#8fa3b7] hover:bg-[#202b37]',
                ].join(' ')}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg text-[#f2deaf]">{arena.name}</h3>
                  {isSelected ? (
                    <span className="rounded-full border border-[#a8844e] bg-[#3a2f1f] px-2 py-0.5 text-xs text-[#ffde9f]">
                      已选择
                    </span>
                  ) : null}
                </div>
                <p className="mb-2 text-sm text-[#c8d4df]">{arena.oneLine}</p>
                <p className="mb-1 text-xs text-[#9eb1c5]">被动：{arena.passive}</p>
                <p className="mb-1 text-xs text-[#9eb1c5]">偏向：{arena.bias}</p>
                <p className="text-xs text-[#9eb1c5]">技能：{arena.skill}</p>
              </button>
            );
          })}
        </main>

        <footer className="mt-auto flex items-center justify-end pt-4">
          <button
            onClick={onStartBattle}
            className="rounded-md border border-[#8f7752] bg-[#312719] px-6 py-2 text-sm text-[#ffd68d] transition hover:bg-[#443420]"
          >
            开始对局
          </button>
        </footer>
      </div>
    </div>
  );
}
