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

function badgeTone(level: 'easy' | 'mid' | 'hard'): string {
  if (level === 'easy') return 'border-emerald-400/50 bg-emerald-400/15 text-emerald-100';
  if (level === 'hard') return 'border-rose-400/50 bg-rose-400/15 text-rose-100';
  return 'border-amber-400/50 bg-amber-400/15 text-amber-100';
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

const FLOW_LABELS = ['匹配', '门派'];

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
    <div className="relative h-full w-full overflow-hidden bg-[#0e1218] text-[#ede3ce]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,167,84,0.2),transparent_42%),radial-gradient(circle_at_82%_70%,rgba(88,142,124,0.18),transparent_44%)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col px-4 py-6 md:px-8">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl tracking-[0.16em] text-[#f3ddb2]">对局准备</h2>
            <p className="mt-1 text-sm text-[#a8bacd]">当前论场：{arenaLabel}</p>
            <p className="mt-1 text-xs text-[#8fa3b7]">议题将在战斗中触发选择</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-[#7f4d4d] bg-[#3a1d1f] px-3 py-1.5 text-xs text-[#ffc7c7] transition hover:bg-[#5a2b2d]"
          >
            取消并返回
          </button>
        </header>

        <div className="mb-4 grid grid-cols-2 gap-2">
          {FLOW_LABELS.map((label, index) => {
            const active = currentStep === index;
            const done = currentStep > index;
            return (
              <div
                key={label}
                className={[
                  'rounded-lg border px-3 py-2 text-center text-xs transition',
                  active
                    ? 'border-[#d4af65] bg-[#2f2416] text-[#ffe0a8] shadow-[0_0_0_1px_rgba(212,175,101,0.35)]'
                    : done
                    ? 'border-[#7f8f9f] bg-[#1d2935] text-[#c9d6e2]'
                    : 'border-[#4f6174] bg-[#16202a] text-[#8ea3b7]',
                ].join(' ')}
              >
                <span className="mr-1 opacity-80">{index + 1}.</span>
                {label}
              </div>
            );
          })}
        </div>

        {missingCoreData ? (
          <section className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-[#7f4d4d] bg-[#2a1616]/70 p-6 text-center">
            <h3 className="text-xl text-[#ffd4d4]">对局准备数据异常</h3>
            <p className="max-w-xl text-sm text-[#f0bcbc]">
              当前门派候选数据为空，系统已阻止流程继续以避免闪退，请返回后重试。
            </p>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-[#9a5e5e] bg-[#3f2121] px-4 py-2 text-sm text-[#ffd6d6] hover:bg-[#573030]"
            >
              返回上一页
            </button>
          </section>
        ) : null}

        {!missingCoreData && step === 'matching' ? (
          <section className="flex flex-1 flex-col items-center justify-center gap-6">
            <div className="h-28 w-28 animate-spin rounded-full border-4 border-[#d4af65]/60 border-t-[#ffd998]" />
            <div className="text-center">
              <h3 className="text-2xl tracking-[0.12em] text-[#ffe4b0]">正在匹配对手</h3>
              <p className="mt-2 text-sm text-[#a8bacd]">请稍候，系统正在安排本局门派对阵…</p>
            </div>
          </section>
        ) : null}

        {!missingCoreData && step === 'sect_draft' ? (
          <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="flex flex-1 flex-col">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg tracking-[0.12em] text-[#f2deaf]">门派选择（4选1）</h3>
                <div className="rounded border border-[#8b6e44] bg-[#322717] px-3 py-1 text-sm text-[#ffd48a]">
                  剩余 {sectSecondsLeft}s
                </div>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto pr-1 pb-2 xl:grid-cols-2">
                {sectCandidates.map((faction) => {
                  const isSelected = selectedSectName === faction.name;
                  const isLocked = playerSectName === faction.name;
                  const difficulty = factionDifficultyText(faction);
                  return (
                    <button
                      key={faction.name}
                      type="button"
                      disabled={Boolean(playerSectName)}
                      onClick={() => setSelectedSectName(faction.name)}
                      className={[
                        'group rounded-2xl border p-4 text-left transition duration-200',
                        isLocked
                          ? 'border-[#d4b27a] bg-[#2e2417] shadow-[0_0_0_1px_rgba(212,178,122,0.35)]'
                          : isSelected
                          ? 'border-[#d4af65] bg-[#2a2116] shadow-[0_0_0_1px_rgba(212,175,101,0.35)]'
                          : 'border-[#4f6174] bg-[#18212d] hover:-translate-y-0.5 hover:border-[#8ca1b6] hover:bg-[#202b37]',
                      ].join(' ')}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-lg text-[#f6deaf]">{faction.name}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] ${badgeTone(difficulty)}`}>
                          {difficulty === 'easy' ? '低难度' : difficulty === 'hard' ? '高难度' : '中难度'}
                        </span>
                      </div>
                      <p className="mb-1 text-sm text-[#c8d4df]">定位：{faction.persona}</p>
                      <p className="mb-1 text-xs text-[#9eb1c5]">偏好：{faction.routePreference}</p>
                      <p className="text-xs text-[#9eb1c5]">核心打法：{faction.winPath}</p>
                    </button>
                  );
                })}
              </div>

              <div className="pointer-events-auto mt-4 flex items-center justify-between rounded-lg border border-[#4a5968] bg-[#131b24]/90 px-4 py-3 text-sm text-[#b7c8d9] backdrop-blur-sm md:sticky md:bottom-2 md:z-40">
                <div>
                  我方：{playerSectName ?? '未锁定'} | 对手：{enemySectName ?? '选择中…'}
                </div>
                <button
                  type="button"
                  onClick={lockSectChoice}
                  disabled={Boolean(playerSectName)}
                  className="pointer-events-auto rounded-md border border-[#8f7752] bg-[#312719] px-4 py-2 text-[#ffd68d] transition enabled:hover:bg-[#453521] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {playerSectName ? '已锁定' : '锁定门派'}
                </button>
              </div>

              {playerSectName && enemySectName ? (
                <div className="mt-3 rounded-lg border border-[#5f7d92] bg-[#15232f] px-4 py-2 text-xs text-[#bdd0df]">
                  门派已确认，正在进入战斗…
                </div>
              ) : null}
            </div>

            <aside className="rounded-2xl border border-[#5a6a7a] bg-[#121c27]/80 p-4">
              <div className="text-xs tracking-[0.18em] text-[#9fb2c6]">门派详情</div>
              <div className="mt-2 text-lg text-[#f7dfb0]">{sectForPanel?.name ?? '请选择门派'}</div>
              <p className="mt-3 text-sm leading-6 text-[#c7d5e2]">
                {sectForPanel?.persona ?? '右侧将显示该门派的定位与核心打法。'}
              </p>
              <div className="mt-4 space-y-2">
                <div className="rounded-lg border border-[#72879a]/35 bg-[#101822]/70 px-3 py-2 text-xs text-[#b6c9d9]">
                  路线偏好：{sectForPanel?.routePreference ?? '-'}
                </div>
                <div className="rounded-lg border border-[#72879a]/35 bg-[#101822]/70 px-3 py-2 text-xs text-[#b6c9d9]">
                  核心路径：{sectForPanel?.winPath ?? '-'}
                </div>
                <div className="rounded-lg border border-[#72879a]/35 bg-[#101822]/70 px-3 py-2 text-xs text-[#9fb3c5]">
                  劣势提醒：{sectForPanel?.weakness ?? '-'}
                </div>
              </div>
            </aside>
          </section>
        ) : null}
      </div>
    </div>
  );
}
