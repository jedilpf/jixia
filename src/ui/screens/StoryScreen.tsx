import { useState, useEffect, useCallback, useRef } from 'react';
import { getStoryEngine, type StoryNode, type StoryChoice } from '@/game/story';
import { useAppStore } from '@/app/store';

const STORY_STYLES = {
  container: {
    width: '100%',
    height: '100dvh',
    background: 'linear-gradient(180deg, #1a0a0a 0%, #0d0505 100%)',
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
    borderBottom: '1px solid rgba(212,165,32,0.35)',
    background: 'rgba(13,5,5,0.95)',
    zIndex: 10,
  },
  chapterBadge: {
    padding: '6px 16px',
    background: 'rgba(139,69,19,0.6)',
    borderRadius: '20px',
    border: '1px solid rgba(212,165,32,0.5)',
    color: '#f5e6b8',
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
    lineHeight: 1.8,
    color: '#f5e6b8',
    marginBottom: '24px',
    padding: '16px 24px',
    background: 'rgba(60,30,20,0.5)',
    borderRadius: '8px',
    borderLeft: '3px solid #d4a520',
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
    border: '2px solid #d4a520',
    objectFit: 'cover' as const,
    background: 'rgba(60,30,20,0.6)',
    flexShrink: 0,
  },
  dialogueBox: {
    flex: 1,
    background: 'rgba(40,20,15,0.8)',
    borderRadius: '12px',
    border: '1px solid rgba(212,165,32,0.4)',
    padding: '20px 24px',
  },
  speakerName: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#d4a520',
    marginBottom: '8px',
  },
  dialogueText: {
    fontSize: '17px',
    lineHeight: 1.7,
    color: '#f5e6b8',
    whiteSpace: 'pre-wrap' as const,
  },
  continueIndicator: {
    textAlign: 'right' as const,
    marginTop: '12px',
    color: '#d4a520',
    fontSize: '14px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  choicesArea: {
    padding: '24px 48px',
    background: 'rgba(13,5,5,0.95)',
    borderTop: '1px solid rgba(212,165,32,0.35)',
  },
  choiceButton: {
    width: '100%',
    padding: '16px 24px',
    marginBottom: '12px',
    background: 'linear-gradient(135deg, #3d1f1f 0%, #1a0a0a 100%)',
    border: '1px solid rgba(212,165,32,0.45)',
    borderRadius: '8px',
    color: '#f5e6b8',
    fontSize: '16px',
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  choiceButtonHover: {
    background: 'linear-gradient(135deg, #5c2a2a 0%, #2d1515 100%)',
    borderColor: '#d4a520',
    transform: 'translateX(8px)',
  },
  relationshipBar: {
    height: '56px',
    padding: '0 24px',
    background: 'rgba(13,5,5,0.98)',
    borderTop: '1px solid rgba(212,165,32,0.35)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    overflowX: 'auto' as const,
  },
  factionBadge: {
    minWidth: '72px',
    padding: '6px 10px',
    background: 'rgba(40,20,15,0.7)',
    borderRadius: '6px',
    border: '1px solid rgba(212,165,32,0.3)',
    textAlign: 'center' as const,
    flexShrink: 0,
  },
  factionName: {
    fontSize: '11px',
    color: '#d4a520',
    marginBottom: '4px',
  },
  reputationBar: {
    height: '3px',
    background: 'rgba(212,165,32,0.2)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  backButton: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid rgba(212,165,32,0.45)',
    borderRadius: '6px',
    color: '#f5e6b8',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  menuButton: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid rgba(212,165,32,0.45)',
    borderRadius: '6px',
    color: '#f5e6b8',
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

export function StoryScreen({ onBack }: { onBack?: () => void } = {}) {
  const { dispatch } = useAppStore();
  const engine = getStoryEngine();

  const [currentNode, setCurrentNode] = useState<StoryNode | undefined>(engine.getCurrentNode());
  const [dialogueState, setDialogueState] = useState<DialogueState>('typing');
  const [displayedText, setDisplayedText] = useState('');
  const [isHoveredChoice, setIsHoveredChoice] = useState<number | null>(null);
  const [chapter, setChapter] = useState(0);
  const [, setScene] = useState(0);
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
              e.currentTarget.style.borderColor = '#d4a520';
              e.currentTarget.style.color = '#d4a520';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212,165,32,0.45)';
              e.currentTarget.style.color = '#f5e6b8';
            }}
          >
            ← 返回
          </button>
          <span style={STORY_STYLES.chapterBadge}>{getChapterLabel()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#f5e6b8', fontSize: '14px' }}>
            名望: {stats.fame}
          </span>
          <button
            style={STORY_STYLES.menuButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d4a520';
              e.currentTarget.style.color = '#d4a520';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212,165,32,0.45)';
              e.currentTarget.style.color = '#f5e6b8';
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
                color: '#d4a520',
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
                  background: 'rgba(212,165,32,0.25)',
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
