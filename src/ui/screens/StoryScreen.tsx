import { useState, useEffect, useCallback, useRef } from 'react';
import { getStoryEngine, type StoryNode, type StoryChoice } from '@/game/story';
import { useAppStore } from '@/app/store';

const STORY_STYLES = {
  container: {
    width: '100%',
    height: '100dvh',
    background: 'linear-gradient(180deg, #2a0e0a 0%, #120604 100%)',
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
    borderBottom: '1px solid rgba(236,185,87,0.22)',
    background: 'rgba(39,12,8,0.94)',
    zIndex: 10,
  },
  chapterBadge: {
    padding: '6px 16px',
    background: 'rgba(88,35,16,0.76)',
    borderRadius: '20px',
    border: '1px solid rgba(236,185,87,0.5)',
    color: '#fff0d1',
    fontSize: '14px',
    fontWeight: 600,
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
    lineHeight: 2,
    color: '#fff3de',
    marginBottom: '24px',
    padding: '16px 24px',
    background: 'rgba(48,18,10,0.55)',
    borderRadius: '8px',
    borderLeft: '3px solid #d9a23a',
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
    border: '2px solid #d9a23a',
    objectFit: 'cover' as const,
    background: 'rgba(48,18,10,0.55)',
    flexShrink: 0,
  },
  dialogueBox: {
    flex: 1,
    background: 'rgba(36,12,8,0.8)',
    borderRadius: '12px',
    border: '1px solid rgba(236,185,87,0.38)',
    padding: '20px 24px',
  },
  speakerName: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#f1c56a',
    marginBottom: '8px',
  },
  dialogueText: {
    fontSize: '17px',
    lineHeight: 1.8,
    color: '#fff3de',
    whiteSpace: 'pre-wrap' as const,
  },
  continueIndicator: {
    textAlign: 'right' as const,
    marginTop: '12px',
    color: '#f1c56a',
    fontSize: '14px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  choicesArea: {
    padding: '24px 48px',
    background: 'rgba(39,12,8,0.94)',
    borderTop: '1px solid rgba(236,185,87,0.22)',
  },
  choiceButton: {
    width: '100%',
    padding: '16px 24px',
    marginBottom: '12px',
    background: 'linear-gradient(135deg, #5a1c14 0%, #2e120d 100%)',
    border: '1px solid rgba(236,185,87,0.42)',
    borderRadius: '8px',
    color: '#fff3de',
    fontSize: '16px',
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  choiceButtonHover: {
    background: 'linear-gradient(135deg, #7c2a18 0%, #4a180f 100%)',
    borderColor: '#f1c56a',
    transform: 'translateX(8px)',
  },
  relationshipBar: {
    height: '56px',
    padding: '0 24px',
    background: 'rgba(36,11,8,0.96)',
    borderTop: '1px solid rgba(236,185,87,0.22)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    overflowX: 'auto' as const,
  },
  factionBadge: {
    minWidth: '72px',
    padding: '6px 10px',
    background: 'rgba(52,20,12,0.62)',
    borderRadius: '6px',
    border: '1px solid rgba(236,185,87,0.28)',
    textAlign: 'center' as const,
    flexShrink: 0,
  },
  factionName: {
    fontSize: '11px',
    color: '#f1c56a',
    marginBottom: '4px',
  },
  reputationBar: {
    height: '3px',
    background: 'rgba(236,185,87,0.18)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  backButton: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid rgba(236,185,87,0.42)',
    borderRadius: '6px',
    color: '#fff3de',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  menuButton: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid rgba(236,185,87,0.42)',
    borderRadius: '6px',
    color: '#fff3de',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
};

const FACTION_COLORS: Record<string, string> = {
  confucian: '#f2c56d',
  legalist: '#d9813f',
  daoist: '#e5a657',
  mozi: '#c77d2b',
  strategist: '#e29a50',
  diplomat: '#f0b35c',
  logician: '#d6a24d',
  eclectic: '#c89d63',
  agronomist: '#bc8a45',
  yin_yang: '#e1b873',
  novelist: '#ce8f4b',
  healer: '#e7b66a',
  musician: '#d89f4d',
  calendar: '#f4c76f',
  ritualist: '#d7a24d',
  merchant: '#b97d3b',
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

interface StorySettings {
  textSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  autoPlay: boolean;
  showRelationshipChanges: boolean;
}

const TEXT_SPEED_MAP: Record<StorySettings['textSpeed'], number> = {
  slow: 60,
  normal: 30,
  fast: 15,
  instant: 0,
};

export function StoryScreen({ onBack }: { onBack?: () => void } = {}) {
  const { dispatch } = useAppStore();
  const engine = getStoryEngine();

  const [isInitialized, setIsInitialized] = useState(false);
  const [currentNode, setCurrentNode] = useState<StoryNode | undefined>();
  const [dialogueState, setDialogueState] = useState<DialogueState>('typing');
  const [displayedText, setDisplayedText] = useState('');
  const [isHoveredChoice, setIsHoveredChoice] = useState<number | null>(null);
  const [chapter, setChapter] = useState(0);
  const [, setScene] = useState(0);
  const [relationships, setRelationships] = useState(engine.getRelationships());
  const [stats, setStats] = useState(engine.getPlayerStats());
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<StorySettings>({
    textSpeed: 'normal',
    autoPlay: false,
    showRelationshipChanges: true,
  });

  const textContainerRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<number | null>(null);

  const startTyping = useCallback((text: string, hasChoices: boolean) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    const speed = TEXT_SPEED_MAP[settings.textSpeed];

    if (speed === 0) {
      setDisplayedText(text);
      setDialogueState(hasChoices ? 'choice' : 'complete');
      return;
    }

    setDisplayedText('');
    let index = 0;

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
  }, [settings.textSpeed]);

  useEffect(() => {
    const unsubscribe = engine.subscribe((event) => {
      switch (event.type) {
        case 'node_changed': {
          const nextNode = engine.getCurrentNode();
          setCurrentNode(nextNode);
          setChapter(engine.getChapter());
          setScene(engine.getScene());
          startTyping(nextNode?.content || '', Boolean(nextNode?.choices));
          setDialogueState('typing');
          break;
        }
        case 'relationship_changed':
          setRelationships(engine.getRelationships());
          break;
        case 'stats_changed':
          setStats(engine.getPlayerStats());
          break;
      }
    });

    const initialNode = engine.getCurrentNode();
    setCurrentNode(initialNode);
    startTyping(initialNode?.content || '', Boolean(initialNode?.choices));
    setIsInitialized(true);

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
    } else {
      dispatch({ type: 'NAVIGATE', screen: 'home' });
    }
  }, [dispatch, onBack]);

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

  if (!isInitialized || !currentNode) {
    return (
      <div style={STORY_STYLES.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#f1dfbb' }}>
          正在加载争鸣史...
        </div>
      </div>
    );
  }

  const getBackgroundStyle = (chap: number) => {
    // Determine image path based on chapter
    const validChaps = [0, 1, 2, 3, 4, 5, 99];
    const targetChap = validChaps.includes(chap) ? chap : 0;
    return {
      background: `linear-gradient(rgba(42, 14, 10, 0.75), rgba(18, 6, 4, 0.95)), url('assets/story/chapter_${targetChap}_bg.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  };

  return (
    <div style={{ ...STORY_STYLES.container, ...getBackgroundStyle(chapter) }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Top Bar */}
      <div style={STORY_STYLES.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            style={STORY_STYLES.backButton}
            onClick={handleBack}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f1c56a';
              e.currentTarget.style.color = '#f1c56a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(236,185,87,0.42)';
              e.currentTarget.style.color = '#fff3de';
            }}
          >
            ← 返回
          </button>
          <span style={STORY_STYLES.chapterBadge}>{getChapterLabel()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#fff3de', fontSize: '14px' }}>
            名望: {stats.fame}
          </span>
          <button
            style={STORY_STYLES.menuButton}
            onClick={() => setShowSettings(!showSettings)}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f1c56a';
              e.currentTarget.style.color = '#f1c56a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(236,185,87,0.42)';
              e.currentTarget.style.color = '#fff3de';
            }}
          >
            ⚙️ 设置
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div style={{
          position: 'absolute',
          top: '64px',
          right: 0,
          width: '320px',
          height: 'calc(100% - 64px)',
          background: 'rgba(39,12,8,0.98)',
          borderLeft: '1px solid rgba(236,185,87,0.38)',
          zIndex: 20,
          animation: 'slideIn 0.3s ease',
          padding: '24px',
          overflowY: 'auto',
        }}>
          <h3 style={{ color: '#f1c56a', fontSize: '18px', marginBottom: '24px', fontWeight: 700 }}>
            故事设置
          </h3>

          {/* Text Speed */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#fff3de', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              文字速度
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['slow', 'normal', 'fast', 'instant'] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSettings(s => ({ ...s, textSpeed: speed }))}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: settings.textSpeed === speed
                      ? 'rgba(236,185,87,0.3)'
                      : 'rgba(52,20,12,0.62)',
                    border: settings.textSpeed === speed
                      ? '1px solid #f1c56a'
                      : '1px solid rgba(236,185,87,0.28)',
                    borderRadius: '6px',
                    color: settings.textSpeed === speed ? '#f1c56a' : '#fff3de',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {speed === 'slow' ? '慢' : speed === 'normal' ? '中' : speed === 'fast' ? '快' : '即时'}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Play */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              color: '#fff3de',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={settings.autoPlay}
                onChange={(e) => setSettings(s => ({ ...s, autoPlay: e.target.checked }))}
                style={{ width: '18px', height: '18px', accentColor: '#f1c56a' }}
              />
              自动播放
            </label>
          </div>

          {/* Show Relationship Changes */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              color: '#fff3de',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={settings.showRelationshipChanges}
                onChange={(e) => setSettings(s => ({ ...s, showRelationshipChanges: e.target.checked }))}
                style={{ width: '18px', height: '18px', accentColor: '#f1c56a' }}
              />
              显示好感度变化
            </label>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowSettings(false)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(236,185,87,0.2)',
              border: '1px solid rgba(236,185,87,0.42)',
              borderRadius: '8px',
              color: '#fff3de',
              cursor: 'pointer',
              fontSize: '14px',
              marginTop: '16px',
            }}
          >
            关闭
          </button>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          top: '76px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 11,
          padding: '8px 22px',
          borderRadius: '999px',
          border: '1px solid rgba(236,185,87,0.38)',
          background: 'rgba(39,12,8,0.78)',
          color: '#f4d28a',
          fontSize: '26px',
          fontWeight: 900,
          letterSpacing: '0.18em',
          textShadow: '0 0 14px rgba(241,197,106,0.22)',
          pointerEvents: 'none',
        }}
      >
        争鸣史
      </div>

      {/* Center Content */}
      <div
        style={STORY_STYLES.centerArea}
        ref={textContainerRef}
        onClick={handleContinue}
      >
        {/* Scene Description */}
        {currentNode?.type === 'narration' && (
          <div style={STORY_STYLES.sceneDescription}>
            {displayedText}
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
                color: '#f1c56a',
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
            {currentNode.choices.map((choice, index) => (
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
                  background: 'rgba(236,185,87,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  flexShrink: 0,
                }}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{choice.text}</span>
              </button>
            ))}
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
                  background: FACTION_COLORS[faction] || '#d7a24d',
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