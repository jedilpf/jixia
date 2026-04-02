import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getStoryEngine, type StoryNode, type StoryChoice } from '@/game/story';
import { SaveLoadModal } from '@/ui/components/SaveLoadModal';
import type { SaveSlotType, SaveSlotInfo } from '@/game/story/StoryEngine';

const V9_COLORS = {
  paper: '#FDFBF7',
  ink: '#1A1A1A',
  gold: '#D4AF65',
  jade: '#3A5F41',
  crimson: '#8D2F2F',
  wood: '#2A1A1A',
  silk: '#F2E8D5',
};

const STORY_STYLES = {
  container: {
    width: '100%',
    height: '100dvh',
    background: V9_COLORS.paper,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    position: 'relative' as const,
    color: V9_COLORS.ink,
    fontFamily: 'serif',
  },
  paperOverlay: {
    position: 'absolute' as const,
    inset: 0,
    opacity: 0.08,
    pointerEvents: 'none' as const,
    backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
    zIndex: 1,
  },
  topBar: {
    minHeight: '88px',
    padding: '0 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `2px solid ${V9_COLORS.wood}`,
    background: 'white',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    zIndex: 10,
    gap: '20px',
  },
  chapterBadge: {
    padding: '8px 24px',
    background: V9_COLORS.wood,
    borderRadius: '4px',
    color: V9_COLORS.silk,
    fontSize: '15px',
    fontWeight: 800,
    whiteSpace: 'nowrap' as const,
    letterSpacing: '0.2em',
    boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
  },
  centerArea: {
    flex: 1,
    padding: '48px 64px',
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '32px',
    zIndex: 2,
    background: 'radial-gradient(circle at center, transparent, rgba(58,95,65,0.02))',
  },
  sceneDescription: {
    fontSize: '20px',
    lineHeight: 1.9,
    color: V9_COLORS.ink,
    marginBottom: '32px',
    padding: '40px 50px',
    background: 'white',
    borderRadius: '2px',
    border: `1px solid ${V9_COLORS.ink}10`,
    boxShadow: '0 20px 60px rgba(0,0,0,0.03)',
    whiteSpace: 'pre-wrap' as const,
    position: 'relative' as const,
    overflow: 'hidden',
    borderLeft: `6px solid ${V9_COLORS.jade}`,
  },
  dialogueArea: {
    display: 'flex',
    gap: '40px',
    marginBottom: '32px',
    alignItems: 'flex-start',
  },
  portrait: {
    width: '240px',
    height: '360px',
    borderRadius: '4px',
    border: `4px solid ${V9_COLORS.wood}`,
    boxShadow: '20px 20px 0 rgba(0,0,0,0.05)',
    objectFit: 'cover' as const,
    background: V9_COLORS.silk,
    flexShrink: 0,
    position: 'relative' as const,
  },
  dialogueBox: {
    flex: 1,
    background: 'white',
    border: `1px solid ${V9_COLORS.ink}15`,
    borderRadius: '4px',
    padding: '32px 40px',
    position: 'relative' as const,
    boxShadow: '10px 10px 40px rgba(0,0,0,0.02)',
  },
  speakerName: {
    fontSize: '18px',
    fontWeight: 900,
    color: V9_COLORS.crimson,
    marginBottom: '16px',
    letterSpacing: '0.1em',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  dialogueText: {
    fontSize: '22px',
    lineHeight: 1.8,
    color: V9_COLORS.ink,
    opacity: 0.9,
    whiteSpace: 'pre-wrap' as const,
  },
  choicesArea: {
    padding: '40px 64px',
    background: 'white',
    borderTop: `2px solid ${V9_COLORS.wood}`,
    boxShadow: '0 -20px 50px rgba(0,0,0,0.05)',
    zIndex: 5,
  },
  choiceButton: {
    width: '100%',
    padding: '24px 32px',
    marginBottom: '16px',
    background: 'white',
    border: `1px solid ${V9_COLORS.ink}10`,
    borderRadius: '4px',
    color: V9_COLORS.ink,
    fontSize: '18px',
    fontWeight: 700,
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    position: 'relative' as const,
  },
  reputationStrip: {
    height: '64px',
    padding: '0 40px',
    background: V9_COLORS.paper,
    borderTop: `1px solid ${V9_COLORS.ink}05`,
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    zIndex: 50,
  },
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
};

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

type DialogueState = 'typing' | 'complete' | 'choice' | 'transition';
type SaveToastTone = 'success' | 'error' | 'info';

interface StoryScreenProps {
  onBack?: () => void;
}

export function StoryScreen({ onBack }: StoryScreenProps = {}) {
  const engine = getStoryEngine();

  const [currentNode, setCurrentNode] = useState<StoryNode | undefined>(engine.getCurrentNode());
  const [availableChoices, setAvailableChoices] = useState<StoryChoice[]>(engine.getAvailableChoices());
  const [dialogueState, setDialogueState] = useState<DialogueState>('typing');
  const [displayedText, setDisplayedText] = useState('');
  const [isHoveredChoice, setIsHoveredChoice] = useState<number | null>(null);
  const [chapter, setChapter] = useState(0);
  const [chapterProgress, setChapterProgress] = useState(engine.getChapterProgress());
  const [lastChoiceImpact, setLastChoiceImpact] = useState<string>('');
  const [stats, setStats] = useState(engine.getPlayerStats());
  const [saveSlots, setSaveSlots] = useState<Record<SaveSlotType, SaveSlotInfo>>(() => engine.getSaveSlots());
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [saveToast, setSaveToast] = useState<{ tone: SaveToastTone; text: string } | null>(null);

  const typingIntervalRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((tone: SaveToastTone, text: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setSaveToast({ tone, text });
    toastTimerRef.current = window.setTimeout(() => setSaveToast(null), 3000);
  }, []);

  const startTyping = useCallback((text: string, hasChoices: boolean) => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    setDisplayedText('');
    let index = 0;
    typingIntervalRef.current = window.setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index += 1;
      } else {
        clearInterval(typingIntervalRef.current!);
        setDialogueState(hasChoices ? 'choice' : 'complete');
      }
    }, 25);
  }, []);

  const summarizeEffects = useCallback((effects: StoryChoice['effects']) => {
    const parts: string[] = [];
    if (effects.stats) {
      Object.entries(effects.stats).forEach(([k, v]) => {
        if (v) parts.push(`${STAT_LABELS[k] ?? k}${formatDelta(v as number)}`);
      });
    }
    return parts.join(' · ');
  }, []);

  useEffect(() => {
    const unsubscribe = engine.subscribe((event) => {
      if (event.type === 'node_changed') {
        const nextNode = engine.getCurrentNode();
        setCurrentNode(nextNode);
        setAvailableChoices(engine.getAvailableChoices());
        setChapter(engine.getChapter());
        setStats(engine.getPlayerStats());
        setChapterProgress(engine.getChapterProgress());
        setSaveSlots(engine.getSaveSlots());
        setDialogueState('typing');
        startTyping(nextNode?.content || '', Boolean(nextNode?.choices));
      } else if (event.type === 'choice_made') {
        setLastChoiceImpact(summarizeEffects(event.effects));
      }
    });

    const initial = engine.getCurrentNode();
    startTyping(initial?.content || '', Boolean(initial?.choices));
    return () => {
      unsubscribe();
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [engine, startTyping, summarizeEffects]);

  const handleContinue = () => {
    if (dialogueState === 'typing') {
      clearInterval(typingIntervalRef.current!);
      setDisplayedText(currentNode?.content || '');
      setDialogueState((currentNode as any)?.choices ? 'choice' : 'complete');
    } else if (dialogueState === 'complete' && (currentNode as any)?.nextNode) {
      engine.goToNext();
    }
  };

  return (
    <div style={STORY_STYLES.container}>
      <div style={STORY_STYLES.paperOverlay} />
      
      {/* 顶部：史官案头 */}
      <div style={STORY_STYLES.topBar}>
        <div className="flex items-center gap-10">
          <button 
            onClick={onBack}
            className="text-sm font-black uppercase tracking-widest text-[#1A1A1A]/40 hover:text-[#8D2F2F] transition-colors flex items-center gap-2"
          >
            ← 归隐
          </button>
          <div style={STORY_STYLES.chapterBadge}>
            {chapter === 0 ? '序 · 入学' : `第 ${chapter} 章`}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-1.5 w-48 bg-[#1A1A1A]/5 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-[#D4AF65] transition-all duration-1000" 
                 style={{ width: `${chapterProgress.ratio * 100}%` }} 
               />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]/30">
              Chronicle Progress: {chapterProgress.visited}/{chapterProgress.total}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
             <div className="text-xs font-black text-[#1A1A1A] tracking-widest">学子 · {stats.fame}名望</div>
             <div className="text-[9px] font-black text-[#5C4033]/30 uppercase tracking-[0.3em] mt-1">Registry of Deeds</div>
          </div>
          <div className="flex gap-3">
            {['存', '取'].map((btn) => (
              <button
                key={btn}
                onClick={btn === '存' ? () => setShowSaveModal(true) : () => setShowLoadModal(true)}
                className="w-12 h-12 rounded-lg border-2 border-[#1A1A1A]/10 flex items-center justify-center font-black text-sm hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all shadow-sm"
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={STORY_STYLES.centerArea} onClick={handleContinue}>
        {/* 背景大插图插槽 */}
        <div className="w-full h-80 rounded-[3rem] border-8 border-white bg-[#F2E8D5] shadow-xl mb-8 overflow-hidden relative group">
           {(currentNode as any)?.image ? (
             <img src={(currentNode as any).image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s]" />
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-[#1A1A1A]/10 italic">
                <span className="text-6xl serif opacity-20">翰墨无声</span>
                <span className="text-[10px] tracking-[0.4em] uppercase font-black mt-4">Scene Illustration Awaiting Scroll</span>
             </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/30 to-transparent" />
        </div>

        {/* 旁白或叙述 */}
        {(currentNode?.type === 'narration' || currentNode?.type === 'ending') && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000" style={STORY_STYLES.sceneDescription}>
            <div className="absolute top-4 right-8 opacity-[0.03] text-8xl font-black italic serif select-none">史</div>
            {displayedText}
            {dialogueState === 'complete' && (currentNode as any)?.nextNode && (
              <div className="mt-8 text-[11px] font-black text-[#D4AF65] tracking-[0.4em] uppercase animate-pulse border-t border-[#D4AF65]/20 pt-4">
                 ◀ 点击宣纸 续写华章
              </div>
            )}
          </div>
        )}

        {/* 对话区 */}
        {(currentNode?.type === 'dialogue' || currentNode?.type === 'choice') && (
          <div className="animate-in fade-in slide-in-from-left-10 duration-700" style={STORY_STYLES.dialogueArea}>
            <div style={STORY_STYLES.portrait}>
               <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2A1A1A] to-transparent h-1/2" />
               <div className="absolute bottom-6 left-6 text-white text-sm font-black whitespace-pre-wrap leading-tight" style={{ writingMode: 'vertical-rl' }}>
                  {currentNode.speaker || '轶名'}
               </div>
               {(currentNode as any).speakerImage && <img src={(currentNode as any).speakerImage} className="w-full h-full object-cover" />}
            </div>

            <div style={STORY_STYLES.dialogueBox}>
              {currentNode.speaker && (
                <div style={STORY_STYLES.speakerName}>
                  <div className="w-2 h-2 rounded-full bg-[#8D2F2F]" />
                  {currentNode.speaker}
                </div>
              )}
              <div style={STORY_STYLES.dialogueText}>{displayedText}</div>
              {dialogueState === 'complete' && !currentNode.choices && (
                 <div className="mt-8 text-[11px] font-black text-[#3A5F41] tracking-[0.4em] uppercase opacity-40 animate-pulse">
                    Continue to Record ->
                 </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 抉择区 */}
      {dialogueState === 'choice' && currentNode?.choices && (
        <div style={STORY_STYLES.choicesArea} onClick={(e) => e.stopPropagation()} className="animate-in slide-in-from-bottom duration-1000">
          <div className="flex items-center gap-4 mb-10">
             <div className="h-px flex-1 bg-[#1A1A1A]/5" />
             <span className="text-[11px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.6em]">百家之决 · THE CHOICE</span>
             <div className="h-px flex-1 bg-[#1A1A1A]/5" />
          </div>

          <div className="grid grid-cols-2 gap-8 max-w-7xl mx-auto">
            {availableChoices.map((choice, index) => (
              <button
                key={choice.id}
                style={{
                  ...STORY_STYLES.choiceButton,
                  borderColor: isHoveredChoice === index ? V9_COLORS.jade : `${V9_COLORS.ink}10`,
                  boxShadow: isHoveredChoice === index ? `20px 20px 60px ${V9_COLORS.jade}15` : 'none',
                  transform: isHoveredChoice === index ? 'translateY(-8px) scale(1.02)' : 'none',
                }}
                onClick={() => engine.makeChoice(choice.id)}
                onMouseEnter={() => setIsHoveredChoice(index)}
                onMouseLeave={() => setIsHoveredChoice(null)}
              >
                <div 
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-black transition-all" 
                  style={{ 
                    borderColor: isHoveredChoice === index ? V9_COLORS.jade : `${V9_COLORS.ink}20`,
                    color: isHoveredChoice === index ? 'white' : V9_COLORS.ink,
                    backgroundColor: isHoveredChoice === index ? V9_COLORS.jade : 'transparent'
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="flex-1">
                  <div className="text-xl serif font-black leading-tight">{choice.text}</div>
                  <div className="mt-2 text-[10px] font-bold text-[#3A5F41]/40 tracking-wider uppercase">
                    {(choice.effects as any)?.hint || 'Moulding the Future Paths'}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {lastChoiceImpact && (
            <div className="mt-10 text-center text-[10px] font-black text-[#8D2F2F] tracking-[0.4em] uppercase opacity-50 italic">
               * 因果流转：{lastChoiceImpact}
            </div>
          )}
        </div>
      )}

      {/* 底部名望条 */}
      <div style={STORY_STYLES.reputationStrip}>
         <span className="text-[10px] font-black text-[#1A1A1A]/20 uppercase tracking-[0.5em] mr-10 whitespace-nowrap">Faction Reputations</span>
         <div className="flex gap-8 overflow-x-auto scrollbar-hide py-4">
            {Object.keys(FACTION_NAMES).map(f => (
               <div key={f} className="flex flex-col gap-2 shrink-0">
                  <div className="flex items-center justify-between gap-10">
                     <span className="text-[10px] font-black text-[#1A1A1A]">{FACTION_NAMES[f]}</span>
                     <span className="text-[8px] font-black text-[#D4AF65]">{engine.getRelationships()[f]?.trust || 0}</span>
                  </div>
                  <div className="w-24 h-1 bg-[#1A1A1A]/5 rounded-full overflow-hidden">
                     <div className="h-full bg-[#1A1A1A]/20" style={{ width: `${(engine.getRelationships()[f]?.trust || 0) + 50}%` }} />
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* 存档/读档弹窗 */}
      {(showSaveModal || showLoadModal) && (
        <SaveLoadModal
          open={true}
          mode={showSaveModal ? 'save' : 'load'}
          onClose={() => { setShowSaveModal(false); setShowLoadModal(false); }}
        />
      )}

      {/* 吐司提示 */}
      {saveToast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[99999] animate-in slide-in-from-bottom-4 duration-500">
           <div className="px-10 py-5 rounded-2xl bg-[#1A1A1A] text-white shadow-2xl border-2 border-[#D4AF65]/30">
              <span className="text-xs font-black tracking-widest uppercase">{saveToast.text}</span>
           </div>
        </div>
      )}
    </div>
  );
}

export default StoryScreen;
