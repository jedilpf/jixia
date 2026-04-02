import { useEffect, useMemo, useRef, useState } from 'react';
import { FRAMEWORK_FACTIONS, FactionBlueprint } from '@/battleV2/factions';
import { ArenaId } from '@/battleV2/types';

type FlowStep = 'matching' | 'sect_draft';

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

function stepIndex(step: FlowStep): number {
  if (step === 'matching') return 0;
  return 1;
}

const FLOW_LABELS = ['寻访', '受命'];

export function PreBattleFlow({ arenaId, onCancel, onComplete }: PreBattleFlowProps) {
  const sectCandidates = useMemo(() => sampleUnique(FRAMEWORK_FACTIONS, 4), []);

  const [step, setStep] = useState<FlowStep>('matching');
  const [sectSecondsLeft, setSectSecondsLeft] = useState(20);

  const [selectedSectName, setSelectedSectName] = useState<string | null>(null);
  const [playerSectName, setPlayerSectName] = useState<string | null>(null);
  const [enemySectName, setEnemySectName] = useState<string | null>(null);

  const completedRef = useRef(false);

  const sectForPanel = useMemo(() => {
    const name = selectedSectName ?? playerSectName ?? sectCandidates[0]?.name;
    if (!name) return null;
    return sectCandidates.find((faction) => faction.name === name) ?? null;
  }, [selectedSectName, playerSectName, sectCandidates]);

  useEffect(() => {
    if (step !== 'matching') return undefined;
    const timer = window.setTimeout(() => {
      setStep('sect_draft');
      setSectSecondsLeft(20);
    }, 2400);
    return () => window.clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (step !== 'sect_draft') return undefined;
    const timer = window.setInterval(() => {
      setSectSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step !== 'sect_draft' || enemySectName) return undefined;
    const timer = window.setTimeout(() => {
      const pick = pickRandom(sectCandidates);
      if (pick) setEnemySectName(pick.name);
    }, 2500 + Math.floor(Math.random() * 2000));
    return () => window.clearTimeout(timer);
  }, [step, enemySectName, sectCandidates]);

  useEffect(() => {
    if (step !== 'sect_draft') return;
    if (sectSecondsLeft > 0) return;
    if (!playerSectName) {
      const pick = pickRandom(sectCandidates);
      const finalPick = selectedSectName ?? pick?.name ?? null;
      if (finalPick) setPlayerSectName(finalPick);
    }
    if (!enemySectName) {
      const pick = pickRandom(sectCandidates);
      if (pick) setEnemySectName(pick.name);
    }
  }, [step, sectSecondsLeft, playerSectName, enemySectName, selectedSectName, sectCandidates]);

  useEffect(() => {
    if (step !== 'sect_draft') return undefined;
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
  }, [step, playerSectName, enemySectName, onComplete]);

  const lockSectChoice = () => {
    if (playerSectName) return;
    const pick = pickRandom(sectCandidates);
    const finalPick = selectedSectName ?? pick?.name ?? null;
    if (finalPick) setPlayerSectName(finalPick);
  };

  const arenaLabel = useMemo(() => {
    if (arenaId === 'jixia') return '稷下学宫';
    if (arenaId === 'huode') return '火德讲坛';
    if (arenaId === 'cangshu') return '藏书秘阁';
    return '玄机观星台';
  }, [arenaId]);

  const currentStep = stepIndex(step);
  const missingCoreData = sectCandidates.length === 0;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#FDFBF7]">
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-0">
         <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col px-6 py-10 md:px-12">
        <header className="mb-12 flex items-end justify-between">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-full border-4 border-[#1A1A1A] flex items-center justify-center shadow-2xl">
               <span className="text-3xl font-black italic serif">J</span>
            </div>
            <div>
              <h2 className="text-5xl font-black tracking-tighter text-[#1A1A1A] uppercase leading-none">百家受业</h2>
              <div className="flex items-center gap-4 mt-3">
                 <span className="text-[10px] font-black bg-[#1A1A1A] text-white px-3 py-1 rounded-full tracking-widest uppercase">{arenaLabel}</span>
                 <span className="text-[10px] font-black text-[#5C4033]/30 tracking-[0.3em] uppercase italic">The Scholarly Way</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="group flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-[#1A1A1A]/10 text-[10px] font-black text-[#1A1A1A]/30 tracking-[0.3em] uppercase hover:border-[#8D2F2F] hover:text-[#8D2F2F] transition-all"
          >
            <span>辞别归隐</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
          </button>
        </header>

        <div className="mb-12 flex items-center gap-4">
          {FLOW_LABELS.map((label, index) => (
            <div
              key={label}
              className={`
                flex-1 px-8 py-4 rounded-2xl border-2 transition-all flex items-center justify-between
                ${currentStep === index ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-2xl scale-105 z-10' : 'bg-white border-[#1A1A1A]/5 text-[#5C4033]/30 opacity-60'}
              `}
            >
               <span className="text-[10px] font-black tracking-[0.4em] uppercase">{label}</span>
               <span className="text-xl font-black italic opacity-20">0{index + 1}</span>
            </div>
          ))}
        </div>

        {missingCoreData ? (
          <section className="flex-1 flex flex-col items-center justify-center p-20 bg-white border-8 border-white rounded-[3rem] shadow-2xl">
             <div className="w-24 h-24 rounded-full bg-[#8D2F2F]/10 flex items-center justify-center mb-8">
                <span className="text-4xl font-black text-[#8D2F2F]">!</span>
             </div>
             <h3 className="text-2xl font-black text-[#1A1A1A] mb-4 uppercase tracking-tight">论战准备数据异常</h3>
             <p className="text-sm font-bold text-[#1A1A1A]/40 uppercase tracking-widest leading-relaxed mb-10 text-center max-w-md">The academy's scrolls are scattered. Please return to the menu and seek guidance.</p>
             <button onClick={onCancel} className="px-12 py-5 rounded-3xl bg-[#1A1A1A] text-white text-[10px] font-black tracking-[0.4em] uppercase hover:scale-105 active:scale-95 transition-all">REVISIT ARCHIVES</button>
          </section>
        ) : null}

        {!missingCoreData && step === 'matching' ? (
          <section className="flex-1 flex flex-col items-center justify-center gap-10">
            <div className="relative">
               <div className="w-40 h-40 rounded-full border-2 border-[#1A1A1A]/5 border-t-[#3A5F41] animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className="text-6xl font-black italic serif">寻</div>
               </div>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-black tracking-tight text-[#1A1A1A] uppercase">寻方定位中...</h3>
              <p className="mt-4 text-[10px] font-black text-[#5C4033]/30 tracking-[0.4em] uppercase italic animate-pulse">Navigating the Scholarly Compass</p>
            </div>
          </section>
        ) : null}

        {!missingCoreData && step === 'sect_draft' ? (
          <section className="grid min-h-0 flex-1 grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr] animate-in fade-in slide-in-from-bottom duration-1000 cubic-bezier(0.23, 1, 0.32, 1)">
            <div className="flex flex-col">
              <div className="mb-8 flex items-center justify-between px-2">
                <h3 className="text-2xl font-black tracking-tight text-[#1A1A1A] uppercase">百家分馆</h3>
                <div className="flex items-center gap-4">
                   <span className="text-[10px] font-black text-[#5C4033]/30 tracking-widest uppercase italic">Remaining Time</span>
                   <div className="px-6 py-2 rounded-full border-2 border-[#1A1A1A] text-xl font-black tabular-nums bg-white">
                     {sectSecondsLeft}S
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto scrollbar-hide pb-10">
                {sectCandidates.map((faction) => {
                  const isSelected = selectedSectName === faction.name;
                  const isLocked = playerSectName === faction.name;
                  const difficulty = factionDifficultyText(faction);
                  const diffColor = difficulty === 'easy' ? '#3A5F41' : difficulty === 'hard' ? '#8D2F2F' : '#D4AF65';
                  
                  return (
                    <button
                      key={faction.name}
                      type="button"
                      disabled={Boolean(playerSectName)}
                      onClick={() => setSelectedSectName(faction.name)}
                      className={`
                        group relative rounded-[2.5rem] border-4 p-8 text-left transition-all duration-500
                        ${isLocked ? 'bg-white border-[#3A5F41] shadow-2xl scale-105 z-20' : isSelected ? 'bg-white border-[#1A1A1A] shadow-xl scale-[1.02] z-10' : 'bg-white/40 border-[#1A1A1A]/5 hover:border-[#1A1A1A]/20'}
                      `}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-2xl font-black text-[#1A1A1A] uppercase tracking-tighter">{faction.name}</span>
                        <div className="w-10 h-10 rounded-full border-2 border-[#1A1A1A]/5 flex items-center justify-center text-[8px] font-black" style={{ color: diffColor, borderColor: `${diffColor}20` }}>
                           {difficulty === 'easy' ? '初' : difficulty === 'hard' ? '极' : '常'}
                        </div>
                      </div>
                      <p className="mb-6 text-[10px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.2em] italic serif group-hover:text-[#1A1A1A]/60"> {faction.persona} </p>
                      <div className="space-y-2">
                         <div className="flex items-center gap-3">
                            <span className="w-1 h-1 rounded-full bg-[#1A1A1A]/10" />
                            <span className="text-[9px] font-black text-[#1A1A1A]/40 uppercase tracking-widest">{faction.routePreference}</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className="w-1 h-1 rounded-full bg-[#3A5F41]" />
                            <span className="text-[9px] font-black text-[#3A5F41] uppercase tracking-widest">{faction.winPath}</span>
                         </div>
                      </div>
                      
                      {isLocked && (
                        <div className="absolute top-4 right-4 animate-in fade-in zoom-in">
                           <div className="bg-[#3A5F41] text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest leading-none shadow-lg">LOCKED IN</div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto px-10 py-8 rounded-[3rem] bg-white border-4 border-[#1A1A1A] shadow-[0_40px_80px_rgba(0,0,0,0.2)] flex items-center justify-between">
                <div>
                   <div className="text-[10px] font-black text-[#5C4033]/30 uppercase tracking-[0.4em] mb-1">State of Governance</div>
                   <div className="text-xl font-black text-[#1A1A1A] uppercase tracking-tight">
                     {playerSectName ? `受命：${playerSectName}` : '待定论点'} · {enemySectName ? `敌手：${enemySectName}` : '寻访对手…'}
                   </div>
                </div>
                <button
                  type="button"
                  onClick={lockSectChoice}
                  disabled={Boolean(playerSectName)}
                  className="px-12 py-5 rounded-[2rem] bg-[#1A1A1A] text-white text-[10px] font-black tracking-[0.3em] uppercase hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-20"
                >
                  {playerSectName ? '定轴入局' : '受命入局 (VOW)'}
                </button>
              </div>
            </div>

            <aside className="rounded-[3rem] bg-white border-8 border-white shadow-2xl p-10 flex flex-col relative overflow-hidden">
               <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0">
                  <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
               </div>
               
               <div className="relative z-10 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                     <span className="text-[10px] font-black text-[#5C4033]/30 uppercase tracking-[0.4em]">门派钤印 · ARCHIVE</span>
                     <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-black shadow-lg">印</div>
                  </div>
                  
                  <div className="text-5xl font-black text-[#1A1A1A] uppercase tracking-tighter mb-6">{sectForPanel?.name ?? '请择百家'}</div>
                  <p className="text-base font-bold text-[#1A1A1A]/70 leading-relaxed italic serif mb-10 border-l-4 border-[#1A1A1A]/10 pl-8">
                    “{sectForPanel?.persona ?? '在此明证该派本心。'}”
                  </p>

                  <div className="space-y-6 mt-auto">
                    <DetailItem label="枢机偏好 · STRATEGY" content={sectForPanel?.routePreference} color="#1A1A1A" />
                    <DetailItem label="取胜之径 · VICTORY" content={sectForPanel?.winPath} color="#3A5F41" />
                    <DetailItem label="其术之弊 · WEAKNESS" content={sectForPanel?.weakness} color="#8D2F2F" />
                  </div>
               </div>
            </aside>
          </section>
        ) : null}
      </div>
    </div>
  );
}

const DetailItem: React.FC<{ label: string; content?: string; color: string }> = ({ label, content, color }) => (
  <div className="group">
     <span className="text-[9px] font-black tracking-[0.3em] uppercase mb-2 block opacitiy-40" style={{ color }}>{label}</span>
     <div className="p-6 rounded-[2rem] bg-[#FDFBF7] border-2 border-[#1A1A1A]/5 group-hover:border-[#1A1A1A]/20 transition-all shadow-inner">
       <span className="text-sm font-black text-[#1A1A1A] uppercase leading-snug">{content ?? '-'}</span>
     </div>
  </div>
);
