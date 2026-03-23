import { useEffect, useMemo, useRef, useState } from 'react';
import { FRAMEWORK_FACTIONS, FactionBlueprint } from '@/battleV2/factions';
import { getTopicById, getTopicConfig } from '@/battleV2/topics';
import { ArenaId } from '@/battleV2/types';

type FlowStep = 'matching' | 'topic_vote' | 'topic_result' | 'sect_draft' | 'loading';

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
  if (/稳定|易上手|稳压/.test(source)) return 'easy';
  if (/高爆发|复杂|意外/.test(source)) return 'hard';
  return 'mid';
}

function stepIndex(step: FlowStep): number {
  if (step === 'matching') return 0;
  if (step === 'topic_vote' || step === 'topic_result') return 1;
  if (step === 'sect_draft') return 2;
  return 3;
}

const FLOW_LABELS = ['匹配', '议题', '门派', '加载'];

const TOPIC_META: Record<string, { tags: string[]; aBuff: string; bBuff: string; hint: string }> = {
  topic_governance_reform: {
    tags: ['经营', '稳态', '结构'],
    aBuff: 'A侧偏运营与抽牌效率，利于中后期持续推进。',
    bBuff: 'B侧偏稳定与防护收益，利于拖回合反打。',
    hint: '不要急着交光资源，留出下一回合转折空间。',
  },
  topic_law_virtue: {
    tags: ['对抗', '压制', '反制'],
    aBuff: 'A侧偏压制和失序干扰，利于抢节奏。',
    bBuff: 'B侧偏韧性与反制收益，利于后手换牌差。',
    hint: '优先争夺关键回合，反制要留给对手爆发点。',
  },
  topic_fast_slow: {
    tags: ['节奏', '快慢博弈', '资源置换'],
    aBuff: 'A侧前期爆发收益更高，利于压场抢血。',
    bBuff: 'B侧后期续航更稳，利于长线翻盘。',
    hint: '主议和旁议不要平均用力，必须有主次。',
  },
};

export function PreBattleFlow({ arenaId, onCancel, onComplete }: PreBattleFlowProps) {
  const topics = useMemo(() => sampleUnique(getTopicConfig().topics, 3), []);
  const sectCandidates = useMemo(() => sampleUnique(FRAMEWORK_FACTIONS, 4), []);

  const [step, setStep] = useState<FlowStep>('matching');
  const [topicSecondsLeft, setTopicSecondsLeft] = useState(15);
  const [sectSecondsLeft, setSectSecondsLeft] = useState(20);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [playerTopicId, setPlayerTopicId] = useState<string | null>(null);
  const [enemyTopicId, setEnemyTopicId] = useState<string | null>(null);
  const [resolvedTopicId, setResolvedTopicId] = useState<string | null>(null);
  const [resolvedByRandom, setResolvedByRandom] = useState(false);

  const [selectedSectName, setSelectedSectName] = useState<string | null>(null);
  const [playerSectName, setPlayerSectName] = useState<string | null>(null);
  const [enemySectName, setEnemySectName] = useState<string | null>(null);

  const completedRef = useRef(false);

  const playerTopic = useMemo(
    () => (playerTopicId ? topics.find((topic) => topic.id === playerTopicId) ?? null : null),
    [playerTopicId, topics]
  );
  const enemyTopic = useMemo(
    () => (enemyTopicId ? topics.find((topic) => topic.id === enemyTopicId) ?? null : null),
    [enemyTopicId, topics]
  );
  const resolvedTopic = useMemo(() => {
    if (!resolvedTopicId) return null;
    return getTopicById(resolvedTopicId) ?? topics.find((topic) => topic.id === resolvedTopicId) ?? null;
  }, [resolvedTopicId, topics]);

  const topicForPanel = useMemo(() => {
    const id = selectedTopicId ?? playerTopicId ?? topics[0]?.id;
    if (!id) return null;
    return topics.find((topic) => topic.id === id) ?? getTopicById(id) ?? null;
  }, [selectedTopicId, playerTopicId, topics]);

  const sectForPanel = useMemo(() => {
    const name = selectedSectName ?? playerSectName ?? sectCandidates[0]?.name;
    if (!name) return null;
    return sectCandidates.find((faction) => faction.name === name) ?? null;
  }, [selectedSectName, playerSectName, sectCandidates]);

  useEffect(() => {
    if (step !== 'matching') return undefined;
    const timer = window.setTimeout(() => {
      // Topic selection is now moved into battle; pre-battle skips topic vote.
      setStep('sect_draft');
      setSectSecondsLeft(20);
    }, 2400);
    return () => window.clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (step !== 'topic_vote') return undefined;
    const timer = window.setInterval(() => {
      setTopicSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step !== 'topic_vote' || enemyTopicId) return undefined;
    const timer = window.setTimeout(() => {
      const autoPick = pickRandom(topics);
      if (autoPick) setEnemyTopicId(autoPick.id);
    }, 2500 + Math.floor(Math.random() * 5000));
    return () => window.clearTimeout(timer);
  }, [step, enemyTopicId, topics]);

  useEffect(() => {
    if (step !== 'topic_vote') return;
    if (topicSecondsLeft > 0) return;
    if (!playerTopicId) {
      const fallbackTopic = pickRandom(topics);
      const fallback = selectedTopicId ?? fallbackTopic?.id ?? null;
      if (fallback) setPlayerTopicId(fallback);
    }
    if (!enemyTopicId) {
      const enemyPick = pickRandom(topics);
      if (enemyPick) setEnemyTopicId(enemyPick.id);
    }
  }, [step, topicSecondsLeft, playerTopicId, enemyTopicId, selectedTopicId, topics]);

  useEffect(() => {
    if (step !== 'topic_vote') return;
    if (!playerTopicId || !enemyTopicId) return;
    const sameChoice = playerTopicId === enemyTopicId;
    const randomTopicId = pickRandom([playerTopicId, enemyTopicId]);
    const finalTopicId = sameChoice ? playerTopicId : randomTopicId;
    if (!finalTopicId) return;
    setResolvedByRandom(!sameChoice);
    setResolvedTopicId(finalTopicId);
    setStep('topic_result');
  }, [step, playerTopicId, enemyTopicId]);

  useEffect(() => {
    if (step !== 'topic_result') return undefined;
    const timer = window.setTimeout(() => {
      setStep('sect_draft');
      setSectSecondsLeft(20);
    }, 2200);
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
    }, 3500 + Math.floor(Math.random() * 5000));
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
    if (step !== 'sect_draft') return;
    if (!playerSectName || !enemySectName) return;
    setStep('loading');
  }, [step, playerSectName, enemySectName]);

  useEffect(() => {
    if (step !== 'loading') return undefined;
    completedRef.current = false;
    setLoadingProgress(0);

    const progressTimer = window.setInterval(() => {
      setLoadingProgress((progress) => Math.min(100, progress + 4));
    }, 120);

    const doneTimer = window.setTimeout(() => {
      if (completedRef.current) return;
      if (!playerSectName || !enemySectName) return;
      completedRef.current = true;
      onComplete({
        topicId: resolvedTopic?.id,
        topicTitle: resolvedTopic?.title,
        playerFaction: playerSectName,
        enemyFaction: enemySectName,
      });
    }, 3200);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(doneTimer);
    };
  }, [step, onComplete, resolvedTopic?.id, resolvedTopic?.title, playerSectName, enemySectName]);

  const lockTopicChoice = () => {
    if (playerTopicId) return;
    const pick = pickRandom(topics);
    const finalPick = selectedTopicId ?? pick?.id ?? null;
    if (finalPick) setPlayerTopicId(finalPick);
  };

  const lockSectChoice = () => {
    if (playerSectName) return;
    const pick = pickRandom(sectCandidates);
    const finalPick = selectedSectName ?? pick?.name ?? null;
    if (finalPick) setPlayerSectName(finalPick);
  };

  const arenaLabel = useMemo(() => {
    if (arenaId === 'jixia') return '稷下学宫';
    if (arenaId === 'huode') return '火德论坛';
    if (arenaId === 'cangshu') return '藏书秘阁';
    return '玄机观星台';
  }, [arenaId]);

  const currentStep = stepIndex(step);
  const topicMeta = topicForPanel ? TOPIC_META[topicForPanel.id] : undefined;
  const missingCoreData = topics.length === 0 || sectCandidates.length === 0;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0e1218] text-[#ede3ce]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,167,84,0.2),transparent_42%),radial-gradient(circle_at_82%_70%,rgba(88,142,124,0.18),transparent_44%)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col px-4 py-6 md:px-8">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl tracking-[0.16em] text-[#f3ddb2]">对局准备</h2>
            <p className="mt-1 text-sm text-[#a8bacd]">当前论场：{arenaLabel}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-[#7f4d4d] bg-[#3a1d1f] px-3 py-1.5 text-xs text-[#ffc7c7] transition hover:bg-[#5a2b2d]"
          >
            取消并返回
          </button>
        </header>

        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
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
              当前议题或门派候选数据为空，系统已阻止继续流程以避免闪退。请返回重试。
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
            <div className="h-28 w-28 rounded-full border-4 border-[#d4af65]/60 border-t-[#ffd998] animate-spin" />
            <div className="text-center">
              <h3 className="text-2xl tracking-[0.12em] text-[#ffe4b0]">正在匹配对手</h3>
              <p className="mt-2 text-sm text-[#a8bacd]">请稍候，系统正在寻找旗鼓相当的论敌...</p>
            </div>
          </section>
        ) : null}

        {!missingCoreData && step === 'topic_vote' ? (
          <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="flex flex-1 flex-col">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg tracking-[0.12em] text-[#f2deaf]">议题投票（3选1）</h3>
                <div className="rounded border border-[#8b6e44] bg-[#322717] px-3 py-1 text-sm text-[#ffd48a]">
                  剩余 {topicSecondsLeft}s
                </div>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto pr-1 pb-2 xl:grid-cols-3">
                {topics.map((topic) => {
                  const isSelected = selectedTopicId === topic.id;
                  const isLocked = playerTopicId === topic.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      disabled={Boolean(playerTopicId)}
                      onClick={() => setSelectedTopicId(topic.id)}
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
                        <span className="text-base text-[#f7dfb0]">{topic.title}</span>
                        {isLocked ? (
                          <span className="rounded-full border border-[#a8844e] bg-[#3d2f1c] px-2 py-0.5 text-[11px] text-[#ffde9f]">
                            已锁定
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-[#c6d3df]">{topic.summary ?? '暂无摘要'}</p>
                      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#28384a]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#7c5a2f] via-[#d4af65] to-[#f1cf8f]"
                          style={{ width: isSelected || isLocked ? '100%' : '35%' }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pointer-events-auto mt-4 flex items-center justify-between rounded-lg border border-[#4a5968] bg-[#131b24]/90 px-4 py-3 text-sm text-[#b7c8d9] backdrop-blur-sm md:sticky md:bottom-2 md:z-40">
                <div>
                  我方：{playerTopic ? playerTopic.title : '未锁定'} | 对手：{enemyTopic ? enemyTopic.title : '投票中...'}
                </div>
                <button
                  type="button"
                  onClick={lockTopicChoice}
                  disabled={Boolean(playerTopicId)}
                  className="pointer-events-auto rounded-md border border-[#8f7752] bg-[#312719] px-4 py-2 text-[#ffd68d] transition enabled:hover:bg-[#453521] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {playerTopicId ? '已锁定' : '锁定议题'}
                </button>
              </div>
            </div>

            <aside className="rounded-2xl border border-[#5a6a7a] bg-[#121c27]/80 p-4">
              <div className="text-xs tracking-[0.18em] text-[#9fb2c6]">当前议题详情</div>
              <div className="mt-2 text-lg text-[#f7dfb0]">{topicForPanel?.title ?? '请选择议题'}</div>
              <p className="mt-3 text-sm leading-6 text-[#c7d5e2]">
                {topicForPanel?.summary ?? '右侧将显示该议题的要点描述。'}
              </p>
              {topicMeta ? (
                <div className="mt-4 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {topicMeta.tags.map((tag) => (
                      <span key={tag} className="rounded border border-[#6a7f92] bg-[#1a2633] px-2 py-0.5 text-[11px] text-[#c9d8e5]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="rounded-lg border border-[#72879a]/35 bg-[#101822]/70 px-3 py-2 text-xs text-[#b6c9d9]">
                    A 加成：{topicMeta.aBuff}
                  </div>
                  <div className="rounded-lg border border-[#72879a]/35 bg-[#101822]/70 px-3 py-2 text-xs text-[#b6c9d9]">
                    B 加成：{topicMeta.bBuff}
                  </div>
                  <div className="rounded-lg border border-[#72879a]/35 bg-[#101822]/70 px-3 py-2 text-xs text-[#9fb3c5]">
                    玩法提示：{topicMeta.hint}
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-[#72879a]/35 bg-[#101822]/70 px-3 py-2 text-xs text-[#9fb3c5]">
                  流程提示：同票直入，异票在双方所选中随机二选一。
                </div>
              )}
            </aside>
          </section>
        ) : null}

        {!missingCoreData && step === 'topic_result' ? (
          <section className="flex flex-1 flex-col items-center justify-center">
            <div className="rounded-2xl border border-[#9a7b4f] bg-[#1a242f]/85 px-8 py-7 text-center shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
              <div className="text-xs tracking-[0.22em] text-[#b9cad8]">议题确认</div>
              <div className="mt-3 text-3xl font-semibold tracking-[0.1em] text-[#fbe3b0]">
                {resolvedTopic?.title ?? '议题确认中'}
              </div>
              <div className="mt-3 text-sm text-[#c7d5e1]">
                {resolvedByRandom ? '双方投票不同，系统已在双方候选中随机决定。' : '双方同票，直接采用该议题。'}
              </div>
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
                  我方：{playerSectName ?? '未锁定'} | 对手：{enemySectName ?? '选择中...'}
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

        {!missingCoreData && step === 'loading' ? (
          <section className="flex flex-1 flex-col items-center justify-center gap-5">
            <div className="text-xs tracking-[0.2em] text-[#b9cad8]">即将进入对局</div>
            <div className="text-2xl tracking-[0.1em] text-[#f8dfaf]">{resolvedTopic?.title ?? '议题加载中'}</div>
            <div className="flex items-center gap-4 text-sm text-[#c6d3df]">
              <span>{playerSectName ?? '我方'}</span>
              <span className="text-[#f0c97a]">VS</span>
              <span>{enemySectName ?? '敌方'}</span>
            </div>
            <div className="h-2 w-full max-w-lg overflow-hidden rounded-full bg-[#263341]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8f6b38] via-[#d4af65] to-[#f0c97a] transition-all duration-150"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="text-xs text-[#9fb2c6]">加载进度 {loadingProgress}%</div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
