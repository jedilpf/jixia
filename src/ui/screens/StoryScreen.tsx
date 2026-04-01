import { useState, useEffect, useCallback, useRef } from 'react';
import { getStoryEngine, type StoryNode, type StoryChoice } from '@/game/story';

const STORY_STYLES = {
  container: {
    width: '100%',
    height: '100dvh',
    background: '#0f0f1a',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    position: 'relative' as const,
  },
  topBar: {
    height: '64px',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(139,115,85,0.3)',
    background: 'rgba(15,15,26,0.95)',
    zIndex: 10,
  },
  chapterBadge: {
    padding: '6px 16px',
    background: 'rgba(26,26,46,0.9)',
    borderRadius: '20px',
    border: '1px solid rgba(139,115,85,0.5)',
    color: '#D4A017',
    fontSize: '14px',
    fontWeight: 600,
  },
  chapterProgressWrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    minWidth: '180px',
  },
  chapterProgressTrack: {
    height: '6px',
    background: 'rgba(139,115,85,0.3)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  chapterProgressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #8B7355 0%, #D4A017 100%)',
    borderRadius: '4px',
    transition: 'width 0.25s ease',
  },
  chapterProgressText: {
    color: '#D4C5A9',
    fontSize: '12px',
    opacity: 0.9,
  },
  centerArea: {
    flex: 1,
    padding: '32px 48px',
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  sceneDescription: {
    fontSize: '16px',
    lineHeight: 1.8,
    color: '#D4C5A9',
    marginBottom: '24px',
    padding: '16px 24px',
    background: 'rgba(26,26,46,0.6)',
    borderRadius: '8px',
    borderLeft: '3px solid #8B7355',
    whiteSpace: 'pre-wrap' as const,
  },
  dialogueArea: {
    display: 'flex',
    gap: '24px',
    marginBottom: '24px',
  },
  portrait: {
    width: '160px',
    height: '240px',
    borderRadius: '8px',
    border: '2px solid #8B7355',
    objectFit: 'cover' as const,
    background: 'rgba(26,26,46,0.8)',
    flexShrink: 0,
  },
  dialogueBox: {
    flex: 1,
    background: 'rgba(26,26,46,0.85)',
    borderRadius: '12px',
    border: '1px solid rgba(139,115,85,0.5)',
    padding: '20px 24px',
  },
  speakerName: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#D4A017',
    marginBottom: '8px',
  },
  dialogueText: {
    fontSize: '17px',
    lineHeight: 1.7,
    color: '#f0ddbb',
    whiteSpace: 'pre-wrap' as const,
  },
  continueIndicator: {
    textAlign: 'right' as const,
    marginTop: '12px',
    color: '#8B7355',
    fontSize: '14px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  choicesArea: {
    padding: '24px 48px',
    background: 'rgba(15,15,26,0.95)',
    borderTop: '1px solid rgba(139,115,85,0.3)',
  },
  choiceImpactHint: {
    marginTop: '6px',
    fontSize: '12px',
    color: '#9db7d6',
    opacity: 0.9,
  },
  latestImpactPanel: {
    padding: '12px 14px',
    marginBottom: '14px',
    borderRadius: '8px',
    border: '1px solid rgba(90, 140, 180, 0.5)',
    background: 'rgba(22, 36, 52, 0.6)',
    color: '#bfd7f3',
    fontSize: '13px',
    lineHeight: 1.5,
  },
  choiceButton: {
    width: '100%',
    padding: '16px 24px',
    marginBottom: '12px',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
    border: '1px solid rgba(139,115,85,0.6)',
    borderRadius: '8px',
    color: '#f0ddbb',
    fontSize: '16px',
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  choiceButtonHover: {
    background: 'linear-gradient(135deg, #2a2a3e 0%, #1a1a2a 100%)',
    borderColor: '#E85D04',
    transform: 'translateX(8px)',
  },
  relationshipBar: {
    height: '56px',
    padding: '0 24px',
    background: 'rgba(15,15,26,0.98)',
    borderTop: '1px solid rgba(139,115,85,0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    overflowX: 'auto' as const,
  },
  factionBadge: {
    minWidth: '72px',
    padding: '6px 10px',
    background: 'rgba(26,26,46,0.8)',
    borderRadius: '6px',
    border: '1px solid rgba(139,115,85,0.4)',
    textAlign: 'center' as const,
    flexShrink: 0,
  },
  factionName: {
    fontSize: '11px',
    color: '#D4C5A9',
    marginBottom: '4px',
  },
  reputationBar: {
    height: '3px',
    background: 'rgba(139,115,85,0.3)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  backButton: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid rgba(139,115,85,0.5)',
    borderRadius: '6px',
    color: '#D4C5A9',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  menuButton: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid rgba(139,115,85,0.5)',
    borderRadius: '6px',
    color: '#D4C5A9',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
};

const FACTION_COLORS: Record<string, string> = {
  confucian: '#B58A52',
  legalist: '#8D4E3E',
  daoist: '#5E8F7E',
  mozi: '#4E6A88',
  strategist: '#A85C45',
  diplomat: '#7C5FA3',
  logician: '#5C6D9E',
  eclectic: '#80755A',
  agronomist: '#6B8D4F',
  yin_yang: '#6C6A89',
  novelist: '#8E6B6B',
  healer: '#5F8D8B',
  musician: '#92713D',
  calendar: '#536A76',
  ritualist: '#8B6A4E',
  merchant: '#9A7E3B',
};

const FACTION_NAMES: Record<string, string> = {
  confucian: '儒家',
  legalist: '法家',
  daoist: '道家',
  mozi: '墨家',
  strategist: '兵家',
  diplomat: '纵横家',
  logician: '名家',
  eclectic: '杂家',
  agronomist: '农家',
  yin_yang: '阴阳家',
  novelist: '小说家',
  healer: '医家',
  musician: '乐家',
  calendar: '历数家',
  ritualist: '礼家',
  merchant: '商家',
};

type DialogueState = 'typing' | 'complete' | 'choice' | 'transition';

interface StoryScreenProps {
  onBack?: () => void;
}

const STAT_LABELS: Record<string, string> = {
  fame: '名望',
  wisdom: '智慧',
  charm: '魅力',
  courage: '勇气',
  insight: '洞察',
};

function formatDelta(delta: number): string {
  return delta >= 0 ? `+${delta}` : `${delta}`;
}

function summarizeEffects(effects: StoryChoice['effects']): string {
  const parts: string[] = [];

  if (effects.stats) {
    for (const [stat, delta] of Object.entries(effects.stats)) {
      if (typeof delta !== 'number' || delta === 0) continue;
      const label = STAT_LABELS[stat] ?? stat;
      parts.push(`${label}${formatDelta(delta)}`);
    }
  }

  if (effects.relationships) {
    for (const [target, value] of Object.entries(effects.relationships)) {
      if (!value) continue;
      const trust = value.trust ?? 0;
      const affection = value.affection ?? 0;
      const total = trust + affection;
      if (total !== 0) {
        parts.push(`${FACTION_NAMES[target] ?? target}关系${formatDelta(total)}`);
      }
    }
  }

  if (effects.path) {
    parts.push(`路线→${effects.path}`);
  }

  if (effects.flags) {
    const importantFlags = Object.entries(effects.flags)
      .filter(([, value]) => value === true)
      .slice(0, 2)
      .map(([flag]) => `标记:${flag}`);
    parts.push(...importantFlags);
  }

  return parts.slice(0, 4).join(' · ');
}

function summarizeChoiceEffects(choice: StoryChoice): string {
  return summarizeEffects(choice.effects);
}

export function StoryScreen({ onBack }: StoryScreenProps = {}) {
  const engine = getStoryEngine();

  const [currentNode, setCurrentNode] = useState<StoryNode | undefined>(engine.getCurrentNode());
  const [availableChoices, setAvailableChoices] = useState<StoryChoice[]>(engine.getAvailableChoices());
  const [dialogueState, setDialogueState] = useState<DialogueState>('typing');
  const [displayedText, setDisplayedText] = useState('');
  const [isHoveredChoice, setIsHoveredChoice] = useState<number | null>(null);
  const [chapter, setChapter] = useState(0);
  const [, setScene] = useState(0);
  const [chapterProgress, setChapterProgress] = useState(engine.getChapterProgress());
  const [lastChoiceImpact, setLastChoiceImpact] = useState<string>('');
  const [relationships, setRelationships] = useState(engine.getRelationships());
  const [stats, setStats] = useState(engine.getPlayerStats());

  const textContainerRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<number | null>(null);

  const startTyping = useCallback((text: string, hasChoices: boolean) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    setDisplayedText('');
    let index = 0;
    const speed = 30;

    typingIntervalRef.current = window.setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
        setDialogueState(hasChoices ? 'choice' : 'complete');
      }
    }, speed);
  }, []);

  useEffect(() => {
    const unsubscribe = engine.subscribe((event) => {
      switch (event.type) {
        case 'node_changed': {
          const nextNode = engine.getCurrentNode();
          setCurrentNode(nextNode);
          setAvailableChoices(engine.getAvailableChoices());
          setChapter(engine.getChapter());
          setScene(engine.getScene());
          setChapterProgress(engine.getChapterProgress());
          startTyping(nextNode?.content || '', Boolean(nextNode?.choices));
          setDialogueState('typing');
          break;
        }
        case 'choice_made':
          setLastChoiceImpact(summarizeEffects(event.effects));
          break;
        case 'relationship_changed':
          setRelationships(engine.getRelationships());
          break;
        case 'stats_changed':
          setStats(engine.getPlayerStats());
          break;
      }
    });

    const initialNode = engine.getCurrentNode();
    setAvailableChoices(engine.getAvailableChoices());
    setChapterProgress(engine.getChapterProgress());
    startTyping(initialNode?.content || '', Boolean(initialNode?.choices));

    return () => {
      unsubscribe();
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [engine, startTyping]);

  const skipTyping = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    setDisplayedText(currentNode?.content || '');
    setDialogueState(currentNode?.choices ? 'choice' : 'complete');
  }, [currentNode]);

  const handleContinue = useCallback(() => {
    if (dialogueState === 'typing') {
      skipTyping();
    } else if (dialogueState === 'complete') {
      if (currentNode?.nextNode) {
        setDialogueState('transition');
        setTimeout(() => {
          engine.goToNext();
        }, 300);
      }
    }
  }, [dialogueState, currentNode, engine, skipTyping]);

  const handleChoice = useCallback((choice: StoryChoice) => {
    engine.makeChoice(choice.id);
  }, [engine]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    }
  }, [onBack]);

  const getChapterLabel = () => {
    if (chapter === 0) return '序章·入学';
    if (chapter === 1) return '第一章·百家入门';
    if (chapter === 2) return '第二章·论辩风云';
    if (chapter === 3) return '第三章·暗流涌动';
    if (chapter === 99) return '终章·问道';
    return '未知章节';
  };

  const getReputation = (faction: string) => {
    const rel = relationships[faction];
    if (!rel) return 0;
    return Math.max(0, Math.min(100, rel.affection + rel.trust + 50));
  };

  const visibleFactions = Object.keys(FACTION_NAMES).slice(0, 8);

  return (
    <div style={STORY_STYLES.container}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Top Bar */}
      <div style={STORY_STYLES.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            style={STORY_STYLES.backButton}
            onClick={handleBack}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#E85D04';
              e.currentTarget.style.color = '#E85D04';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(139,115,85,0.5)';
              e.currentTarget.style.color = '#D4C5A9';
            }}
          >
            ← 返回
          </button>
          <span style={STORY_STYLES.chapterBadge}>{getChapterLabel()}</span>
          <div style={STORY_STYLES.chapterProgressWrap}>
            <div style={STORY_STYLES.chapterProgressTrack}>
              <div
                style={{
                  ...STORY_STYLES.chapterProgressFill,
                  width: `${Math.round(chapterProgress.ratio * 100)}%`,
                }}
              />
            </div>
            <span style={STORY_STYLES.chapterProgressText}>
              章节进度 {chapterProgress.visited}/{chapterProgress.total}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#D4C5A9', fontSize: '14px' }}>
            名望: {stats.fame}
          </span>
          <button
            style={STORY_STYLES.menuButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#E85D04';
              e.currentTarget.style.color = '#E85D04';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(139,115,85,0.5)';
              e.currentTarget.style.color = '#D4C5A9';
            }}
          >
            ⚙️ 设置
          </button>
        </div>
      </div>

      {/* Center Content */}
      <div
        style={STORY_STYLES.centerArea}
        ref={textContainerRef}
        onClick={handleContinue}
      >
        {/* Scene Description */}
        {(currentNode?.type === 'narration' || currentNode?.type === 'ending' || currentNode?.type === 'transition') && (
          <div style={STORY_STYLES.sceneDescription}>
            {displayedText}
            {dialogueState === 'complete' && currentNode?.nextNode && (
              <div style={STORY_STYLES.continueIndicator}>▼ 点击继续</div>
            )}
          </div>
        )}

        {/* Dialogue Area */}
        {(currentNode?.type === 'dialogue' || currentNode?.type === 'choice') && (
          <div style={STORY_STYLES.dialogueArea}>
            {/* Portrait Placeholder */}
            <div
              style={{
                ...STORY_STYLES.portrait,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8B7355',
                fontSize: '14px',
              }}
            >
              {currentNode.speaker ? (
                <span style={{ writingMode: 'vertical-rl' }}>
                  {currentNode.speaker}
                </span>
              ) : (
                '旁白'
              )}
            </div>

            {/* Dialogue Box */}
            <div style={STORY_STYLES.dialogueBox}>
              {currentNode.speaker && (
                <div style={STORY_STYLES.speakerName}>
                  {currentNode.speaker}
                </div>
              )}
              <div style={STORY_STYLES.dialogueText}>
                {displayedText}
              </div>
              {dialogueState === 'complete' && !currentNode.choices && (
                <div style={STORY_STYLES.continueIndicator}>
                  ▼ 点击继续
                </div>
              )}
            </div>
          </div>
        )}

        {/* Choice Area */}
        {dialogueState === 'choice' && currentNode?.choices && (
          <div
            style={{
              ...STORY_STYLES.choicesArea,
              marginTop: 'auto',
              animation: 'fadeIn 0.3s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {lastChoiceImpact && (
              <div style={STORY_STYLES.latestImpactPanel}>
                上一步影响：{lastChoiceImpact}
              </div>
            )}
            {availableChoices.map((choice, index) => (
              <button
                key={choice.id}
                style={{
                  ...STORY_STYLES.choiceButton,
                  ...(isHoveredChoice === index ? STORY_STYLES.choiceButtonHover : {}),
                }}
                onClick={() => handleChoice(choice)}
                onMouseEnter={() => setIsHoveredChoice(index)}
                onMouseLeave={() => setIsHoveredChoice(null)}
              >
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(139,115,85,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  flexShrink: 0,
                }}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{choice.text}</span>
                <span style={STORY_STYLES.choiceImpactHint}>
                  {summarizeChoiceEffects(choice)}
                </span>
              </button>
            ))}
            {availableChoices.length === 0 && (
              <div style={STORY_STYLES.latestImpactPanel}>
                当前没有可执行选项。请回退上一步，或重新读取本章节条件。
              </div>
            )}
          </div>
        )}
      </div>

      {/* Relationship Bar */}
      <div style={STORY_STYLES.relationshipBar}>
        {visibleFactions.map((faction) => (
          <div key={faction} style={STORY_STYLES.factionBadge}>
            <div style={STORY_STYLES.factionName}>
              {FACTION_NAMES[faction] || faction}
            </div>
            <div style={STORY_STYLES.reputationBar}>
              <div
                style={{
                  width: `${getReputation(faction)}%`,

                  height: '100%',
                  background: FACTION_COLORS[faction] || '#8B7355',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
