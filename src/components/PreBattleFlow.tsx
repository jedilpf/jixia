import { useEffect, useMemo, useRef, useState } from 'react';
import { FRAMEWORK_FACTIONS, FactionBlueprint } from '@/battleV2/factions';
import { ArenaId } from '@/battleV2/types';
import { uiAudio } from '@/utils/audioManager';
import { motion } from 'framer-motion';
import { Shield, Zap, ChevronRight, Scale, BookOpen } from 'lucide-react';

// FlowStep type reserved for future multi-step flow extension
// type FlowStep = 'sect_draft';

export interface PreBattleResult {
  topicId?: string;
  topicTitle?: string;
  playerFaction: string;
  enemyFaction: string;
}

interface PreBattleFlowProps {
  arenaId: ArenaId;
  onCancel: () => void;
  onComplete: (result: PreBattleResult) => void;
}

function sampleUnique<T>(items: T[], count: number): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.max(1, Math.min(count, pool.length)));
}

function pickRandom<T>(items: T[]): T | null {
  if (!items.length) return null;
  const idx = Math.floor(Math.random() * items.length);
  return items[idx] ?? items[0] ?? null;
}

function factionDifficultyText(faction: FactionBlueprint): 'easy' | 'mid' | 'hard' {
  const source = [faction.persona, faction.winPath, faction.weakness].join(' ');
  if (source.includes('稳') || source.includes('易') || source.includes('上手')) return 'easy';
  if (source.includes('复杂') || source.includes('高') || source.includes('极限')) return 'hard';
  return 'mid';
}

const getFactionIcon = (name: string, className?: string) => {
  const sizeClass = className || 'w-6 h-6';
  if (name.includes('墨') || name.includes('公输')) return <Zap className={sizeClass} />;
  if (name.includes('儒') || name.includes('名')) return <BookOpen className={sizeClass} />;
  if (name.includes('兵') || name.includes('法')) return <Shield className={sizeClass} />;
  if (name.includes('道') || name.includes('阴阳') || name.includes('方技')) return <Scale className={sizeClass} />;
  return <ChevronRight className={sizeClass} />;
};

export function PreBattleFlow({ arenaId, onCancel, onComplete }: PreBattleFlowProps) {
  const sectCandidates = useMemo(() => sampleUnique(FRAMEWORK_FACTIONS, 4), []);

  const [sectSecondsLeft, setSectSecondsLeft] = useState(30);
  const [selectedSectName, setSelectedSectName] = useState<string | null>(null);
  const [playerSectName, setPlayerSectName] = useState<string | null>(null);
  const [enemySectName, setEnemySectName] = useState<string | null>(null);

  const completedRef = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSectSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (enemySectName) return undefined;
    const timer = window.setTimeout(() => {
      const pick = pickRandom(sectCandidates);
      if (pick) setEnemySectName(pick.name);
    }, 3000 + Math.floor(Math.random() * 2000));
    return () => window.clearTimeout(timer);
  }, [enemySectName, sectCandidates]);

  useEffect(() => {
    if (sectSecondsLeft > 0) return;
    if (!playerSectName) {
      const pick = pickRandom(sectCandidates);
      const finalPick = selectedSectName ?? pick?.name ?? null;
      if (finalPick) setPlayerSectName(finalPick);
    }
  }, [sectSecondsLeft, playerSectName, selectedSectName, sectCandidates]);

  useEffect(() => {
    if (!playerSectName || !enemySectName) return undefined;
    if (completedRef.current) return undefined;

    completedRef.current = true;
    const timer = window.setTimeout(() => {
      onComplete({
        playerFaction: playerSectName,
        enemyFaction: enemySectName,
      });
    }, 320);
    return () => window.clearTimeout(timer);
  }, [playerSectName, enemySectName, onComplete]);

  const lockSectChoice = () => {
    if (playerSectName) return;
    uiAudio.playClick();
    const finalPick = selectedSectName ?? pickRandom(sectCandidates)?.name ?? null;
    if (finalPick) {
      setPlayerSectName(finalPick);
      if (!enemySectName) {
        const enemyPick = pickRandom(sectCandidates.filter(s => s.name !== finalPick));
        setEnemySectName(enemyPick?.name ?? sectCandidates[0].name);
      }
    }
  };

  const arenaLabel = useMemo(() => {
    if (arenaId === 'jixia') return '稷下学宫';
    if (arenaId === 'huode') return '火德讲坛';
    if (arenaId === 'cangshu') return '藏书秘阁';
    return '玄机观星台';
  }, [arenaId]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#3a0d0a] select-none font-serif flex flex-col">
      {/* 锦绣红底色与金纹 */}
      <div className="absolute inset-0 z-0 bg-[#5c1913]">
        <div 
          className="absolute inset-0 opacity-[0.08]" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(212,165,32,0.1),transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col px-12 py-6 justify-between">
        
        {/* 顶部栏 - 紧凑型 */}
        <header className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-black tracking-[0.6em] text-[#f5e6b8] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">百家授业</h2>
                <div className="h-0.5 w-24 bg-gradient-to-r from-[#d4a520] to-transparent" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold text-[#d4a520] tracking-widest">{arenaLabel}</span>
                <span className="text-[10px] text-[#f5e6b8]/20 uppercase tracking-[0.2em]">/ Imperial Selection</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end gap-1">
               <span className="text-[10px] text-[#d4a520]/40 font-bold uppercase tracking-widest">Decision Time</span>
               <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-mono ${sectSecondsLeft <= 10 ? 'text-[#ff4d4d]' : 'text-[#d4a520]'}`}>{sectSecondsLeft}</span>
                  <span className="text-[10px] text-[#d4a520]/60">SEC</span>
               </div>
            </div>
            <button
              onClick={() => { uiAudio.playClick(); onCancel(); }}
              className="px-6 py-2 border border-[#d4a520]/30 text-[#d4a520] text-xs font-bold hover:bg-[#d4a520] hover:text-[#5c1913] transition-all"
            >
              辞别归隐
            </button>
          </div>
        </header>

        {/* 核心内容区 - 使用横向 1x4 布局确保不滚动 */}
        <main className="flex-1 flex flex-col justify-center min-h-0 py-4">
           {/* 过渡引导文字 */}
           <div className="mb-6 text-center">
             <div className="inline-block relative">
               <span className="text-xl text-[#f5e6b8] tracking-[0.4em] font-bold">请 择 本 心</span>
               <div className="absolute -left-12 top-1/2 w-8 h-px bg-gradient-to-l from-[#d4a520] to-transparent" />
               <div className="absolute -right-12 top-1/2 w-8 h-px bg-gradient-to-r from-[#d4a520] to-transparent" />
             </div>
           </div>

           {/* 1x4 横向网格 */}
           <div className="grid grid-cols-4 gap-6 h-[50vh] xl:h-[55vh] max-w-[1500px] mx-auto w-full">
             {sectCandidates.map((faction) => {
               const isSelected = selectedSectName === faction.name;
               const isLocked = playerSectName === faction.name;
               const difficulty = factionDifficultyText(faction);
               
               return (
                 <motion.button
                   key={faction.name}
                   onClick={() => !playerSectName && (uiAudio.playClick(), setSelectedSectName(faction.name))}
                   className={`
                     group relative h-full flex flex-col p-6 rounded-xs border-2 transition-all duration-300 text-left
                     ${isLocked 
                       ? 'border-[#f5e6b8] bg-[#8b2e2e] shadow-[0_0_40px_rgba(212,165,32,0.4)]' 
                       : isSelected 
                         ? 'border-[#d4a520] bg-[#5c1913] scale-105 z-10 shadow-[0_0_30px_rgba(212,165,32,0.2)]' 
                         : 'border-[#d4a520]/10 bg-[#3a0d0a]/60 hover:border-[#d4a520]/40'}
                   `}
                 >
                   {/* 派系图标与名称 */}
                   <div className="flex flex-col items-center gap-4 mb-6 border-b border-[#d4a520]/10 pb-4">
                      <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${isSelected || isLocked ? 'border-[#f5e6b8] bg-[#f5e6b8]/10 text-[#f5e6b8]' : 'border-[#d4a520]/20 text-[#d4a520]/30'}`}>
                         {getFactionIcon(faction.name, 'w-8 h-8')}
                      </div>
                      <h4 className={`text-2xl font-bold tracking-[0.2em] ${isSelected || isLocked ? 'text-[#f5e6b8]' : 'text-[#f5e6b8]/40'}`}>
                        {faction.name}
                      </h4>
                      <div className={`text-[8px] px-2 py-0.5 border ${difficulty === 'hard' ? 'border-[#ff4d4d]/40 text-[#ff4d4d]' : 'border-[#d4a520]/20 text-[#d4a520]/40'}`}>
                        {difficulty === 'hard' ? '极 诣' : difficulty === 'easy' ? '平 易' : '常 通'}
                      </div>
                   </div>

                   {/* 描述文案 - 紧凑型 */}
                   <div className="flex-1 overflow-hidden">
                      <p className={`text-xs leading-relaxed font-light transition-colors ${isSelected || isLocked ? 'text-[#f5e6b8]/90' : 'text-[#f5e6b8]/20'}`}>
                         {faction.persona}
                      </p>
                   </div>

                   {/* 固定底部信息 */}
                   <div className="mt-4 pt-4 border-t border-[#d4a520]/10 space-y-2">
                       <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] text-[#d4a520]/40 font-bold tracking-widest uppercase">Key Strength</span>
                          <span className={`text-[10px] line-clamp-1 ${isSelected || isLocked ? 'text-[#d4a520]' : 'text-[#d4a520]/20'}`}>{faction.winPath}</span>
                       </div>
                   </div>

                   {/* 绝学标签 */}
                   <div className={`absolute top-2 right-2 px-2 py-0.5 text-[8px] bg-black/40 rounded-full transition-opacity ${isSelected || isLocked ? 'opacity-100' : 'opacity-0'}`}>
                      <span className="text-[#f5e6b8]/60">道统归一</span>
                   </div>
                 </motion.button>
               );
             })}
           </div>
        </main>

        {/* 底部功能区 - 固定吸底 */}
        <footer className="flex items-center justify-between py-6 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-12">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#d4a520]/40 font-bold tracking-widest uppercase">Current Faction</span>
                <span className="text-2xl font-bold text-[#f5e6b8] tracking-[0.2em]">
                   {playerSectName || selectedSectName || '请 选 择 ...'}
                </span>
             </div>
             
             <div className="h-10 w-px bg-white/5" />

             <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#d4a520]/40 font-bold tracking-widest uppercase">Opponent Match</span>
                <span className="text-sm font-bold text-[#f5e6b8]/40 italic">
                   {enemySectName ? `已匹配：${enemySectName}` : '寻访对手中...'}
                </span>
             </div>
          </div>

          <motion.button
            whileHover={!playerSectName && selectedSectName ? { scale: 1.05 } : {}}
            whileTap={!playerSectName && selectedSectName ? { scale: 0.95 } : {}}
            onClick={lockSectChoice}
            disabled={Boolean(playerSectName) || !selectedSectName}
            className={`
              relative px-20 py-4 font-bold transition-all duration-300
              ${!playerSectName && selectedSectName 
                ? 'bg-gradient-to-br from-[#d4a520] to-[#b05327] text-[#3a0d0a] shadow-[0_0_30px_rgba(212,165,32,0.5)]' 
                : 'bg-white/5 text-white/10 grayscale'}
            `}
          >
            <span className="text-xl tracking-[1em]">{playerSectName ? '已守持' : '定约授命'}</span>
          </motion.button>
        </footer>

      </div>
    </div>
  );
}
