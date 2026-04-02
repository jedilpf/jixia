import { useMemo, useState } from 'react';
import { FACTIONS } from '@/data/game/factions';
import { getFactionPortrait } from '@/ui/screens/visualAssets';

interface FactionPickScreenProps {
  options: string[];
  lockedFactionId: string | null;
  onConfirm: (factionId: string) => void;
}

export function FactionPickScreen({ options, lockedFactionId, onConfirm }: FactionPickScreenProps) {
  const [selected, setSelected] = useState<string | null>(lockedFactionId);
  const factionMap = useMemo(() => new Map(FACTIONS.map((f) => [f.id, f])), []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#F2ECD9] text-[#3D2B1F]">
      {/* 背景装饰：缯帛纹理与矿物辉光 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(58,95,65,0.08),transparent_40%),radial-gradient(circle_at_85%_75%,rgba(141,47,47,0.08),transparent_40%)]" />
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")' }} />

      {/* 顶部标题组 */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-black tracking-[0.4em] text-[#1A1A1A]">寻访百家</h2>
          <p className="mt-4 text-sm tracking-[0.1em] text-[#5C4033]/70">于诸子争鸣之世，定君子立身之所。请锁定门墙。</p>
          <div className="mx-auto mt-4 h-1 w-24 bg-[#3A5F41]" />
        </div>

        {/* 门派卡片阵列 */}
        <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {options.map((id) => {
            const faction = factionMap.get(id);
            const active = selected === id;
            
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(id)}
                className={[
                  'group relative overflow-hidden rounded-2xl border-2 p-1 transition duration-500 transform',
                  active 
                    ? 'scale-[1.03] border-[#3A5F41] bg-white shadow-2xl skew-y-0' 
                    : 'border-[#B8A48D]/30 bg-white/40 hover:border-[#D4AF65]/60 hover:shadow-lg hover:-translate-y-1'
                ].join(' ')}
              >
                <div className="grid grid-cols-[160px_1fr] h-[180px]">
                  {/* 立绘区域 */}
                  <div className="relative overflow-hidden bg-[#FDFBF7]">
                    <img 
                      src={getFactionPortrait(id)} 
                      alt={faction?.name ?? id} 
                      className={`h-full w-full object-cover transition-transform duration-700 ${active ? 'scale-110' : 'scale-100 group-hover:scale-105 opacity-80'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#FDFBF7]/20" />
                  </div>
                  
                  {/* 信息区域 */}
                  <div className="flex flex-col justify-between p-6">
                    <div>
                      <div className="text-2xl font-bold text-[#1A1A1A]">{faction?.name ?? id}</div>
                      <div className="mt-1 text-sm text-[#5C4033]/60 italic font-medium">{faction?.style ?? '未知流派'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 flex-1 bg-[#B8A48D]/20" />
                      <span className="text-[10px] font-bold tracking-widest text-[#3A5F41] uppercase">Established in Antiquity</span>
                    </div>
                  </div>
                </div>
                
                {/* 选中时的装饰印章 */}
                {active && (
                  <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 border-2 border-dashed border-[#8D2F2F]/40 rounded-full bg-[#8D2F2F]/5">
                    <span className="text-[#8D2F2F] font-bold text-xs">授命</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 底部确认栏：如名帖般的质感 */}
        <div className="mt-16 flex w-full max-w-5xl items-center justify-between rounded-xl border-t-2 border-[#B8A48D]/30 pt-8">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#5C4033]/50 uppercase tracking-widest">Current Selection</span>
            <span className="text-xl font-bold text-[#1A1A1A]">
              {selected ? factionMap.get(selected)?.name ?? selected : '待定门墙'}
            </span>
          </div>
          
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && onConfirm(selected)}
            className="group flex items-center gap-4 rounded-lg bg-[#1A1A1A] px-12 py-4 text-lg font-bold text-[#FDFBF7] transition-all hover:bg-[#3A5F41] hover:px-16 disabled:opacity-20 disabled:grayscale"
          >
            定论开局
            <span className="transition-transform group-hover:translate-x-2">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
