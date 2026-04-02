import { useState, useEffect, useCallback, useRef } from 'react';
import { getStoryEngine, type StoryNode, type StoryChoice } from '@/game/story';
import { SaveLoadModal } from '@/ui/components/SaveLoadModal';
import { motion, AnimatePresence } from 'framer-motion';

const V9_COLORS = {
  paper: '#FDFBF7',
  ink: '#1A1A1A',
  gold: '#D4AF65',
  jade: '#3A5F41',
  crimson: '#8D2F2F',
  wood: '#2A1A1A',
  silk: '#F2E8D5',
};

export function StoryScreen({ onBack }: { onBack?: () => void } = {}) {
  const engine = getStoryEngine();

  const [currentNode, setCurrentNode] = useState<StoryNode | undefined>(engine.getCurrentNode());
  const [availableChoices, setAvailableChoices] = useState<StoryChoice[]>(engine.getAvailableChoices());
  const [dialogueState, setDialogueState] = useState<'typing' | 'complete' | 'choice'>('typing');
  const [displayedText, setDisplayedText] = useState('');
  const [showSeal, setShowSeal] = useState(false);
  const [chapterProgress, setChapterProgress] = useState(engine.getChapterProgress());
  const [stats, setStats] = useState(engine.getPlayerStats());
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);

  const typingIntervalRef = useRef<number | null>(null);

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
    }, 20);
  }, []);

  useEffect(() => {
    const unsubscribe = engine.subscribe((event) => {
      if (event.type === 'node_changed') {
        const nextNode = engine.getCurrentNode();
        setCurrentNode(nextNode);
        setAvailableChoices(engine.getAvailableChoices());
        setStats(engine.getPlayerStats());
        setChapterProgress(engine.getChapterProgress());
        setDialogueState('typing');
        setShowSeal(false);
        startTyping(nextNode?.content || '', Boolean(nextNode?.choices));
      }
    });

    const initial = engine.getCurrentNode();
    startTyping(initial?.content || '', Boolean(initial?.choices));
    return () => {
      unsubscribe();
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [engine, startTyping]);

  const handleMakeChoice = (cid: string) => {
    setShowSeal(true);
    setTimeout(() => {
      engine.makeChoice(cid);
    }, 1200);
  };

  const handleContinue = () => {
    if (dialogueState === 'typing') {
      clearInterval(typingIntervalRef.current!);
      setDisplayedText(currentNode?.content || '');
      setDialogueState(currentNode?.choices ? 'choice' : 'complete');
    } else if (dialogueState === 'complete' && currentNode?.nextNode) {
      engine.goToNext();
    }
  };

  return (
    <div className="w-full h-screen bg-[#FDFBF7] flex flex-col relative overflow-hidden text-[#1A1A1A] selection:bg-[#3A5F41]/20">
      {/* 全局材质蒙版 */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.12] mix-blend-multiply transition-opacity duration-1000" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png"), url("https://www.transparenttextures.com/patterns/natural-paper.png")' }} />
      
      {/* 顶部：史官案头 */}
      <header className="h-[100px] px-12 flex items-center justify-between border-b-4 border-[#2A1A1A] bg-white/80 backdrop-blur-sm z-50">
        <div className="flex items-center gap-10">
          <button onClick={onBack} className="group flex flex-col items-center">
            <span className="text-[10px] font-black tracking-[0.3em] opacity-30 group-hover:opacity-100 transition-opacity">EXIT</span>
            <span className="text-sm font-black group-hover:text-[#8D2F2F] transition-colors">◀ 归隐</span>
          </button>
          <div className="h-12 w-[1px] bg-[#1A1A1A]/10 mx-2" />
          <div className="flex flex-col items-start gap-1">
             <div className="px-4 py-1.5 bg-[#2A1A1A] text-[#F2E8D5] rounded shadow-lg text-xs font-black tracking-[0.2em]">
                {engine.getChapter() === 0 ? '序 · 入学' : `卷 ${engine.getChapter()}`}
             </div>
             <div className="flex items-center gap-3">
               <div className="w-32 h-1 bg-[#1A1A1A]/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${chapterProgress.ratio * 100}%` }} className="h-full bg-[#D4AF65]" />
               </div>
               <span className="text-[9px] font-black opacity-20 uppercase tracking-widest">Progress {chapterProgress.visited}/{chapterProgress.total}</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-12">
          <div className="flex flex-col items-end">
             <div className="text-xs font-black tracking-widest">学子 · {stats.fame}名望</div>
             <div className="text-[9px] font-bold opacity-30 mt-1 uppercase tracking-[0.4em]">Chronicle of Scholars</div>
          </div>
          <div className="flex gap-4">
             {['存', '取'].map(mode => (
               <button key={mode} onClick={() => mode === '存' ? setShowSaveModal(true) : setShowLoadModal(mode === '取')}
                 className="w-12 h-12 rounded-xl border border-[#1A1A1A]/10 flex items-center justify-center font-black hover:bg-[#1A1A1A] hover:text-white transition-all shadow-sm">
                 {mode === '存' ? '记' : '溯'}
               </button>
             ))}
          </div>
        </div>
      </header>

      {/* 主舞台：卷轴区域 */}
      <main className="flex-1 overflow-y-auto px-24 py-16 scroll-smooth z-10" onClick={handleContinue}>
        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* 剧情大插图：绢本装裱感 */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentNode?.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="relative w-full aspect-[21/9] rounded-[3rem] overflow-hidden border-[12px] border-white shadow-2xl scale-[1.02]"
            >
               {currentNode?.image ? (
                 <img src={currentNode.image} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-[#F2E8D5] flex flex-col items-center justify-center opacity-40">
                    <span className="text-6xl serif italic">无声之处</span>
                    <span className="text-[10px] font-black tracking-[0.5em] mt-6">AWAITING BRUSH STROKES</span>
                 </div>
               )}
               {/* 金煌微粒遮罩 */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
               <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.2)] pointer-events-none" />
            </motion.div>
          </AnimatePresence>

          {/* 叙事/旁白区域：宣纸浮雕感 */}
          {(currentNode?.type === 'narration' || currentNode?.type === 'ending') && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="bg-white/90 p-16 rounded-sm border-l-[8px] border-[#3A5F41] shadow-xl relative overflow-hidden group"
            >
              <div className="absolute -right-8 -bottom-8 opacity-[0.03] text-[180px] font-black italic serif select-none rotate-12">史</div>
              <div className="text-[23px] leading-[2] text-[#1A1A1A] whitespace-pre-wrap font-serif tracking-tight">
                {displayedText}
              </div>
              
              {dialogueState === 'complete' && (currentNode as any)?.nextNode && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-12 pt-8 border-t border-[#D4AF65]/20 flex items-center gap-4"
                >
                  <span className="text-[11px] font-black text-[#D4AF65] tracking-[0.5em] uppercase">▶ 点击卷轴 续写华章</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#D4AF65]/30 to-transparent" />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* 对话区域：名士卷帘 */}
          {(currentNode?.type === 'dialogue' || currentNode?.type === 'choice') && (
            <div className="flex gap-16 items-start pb-24">
               {/* 立绘槽位 */}
               <motion.div 
                 initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}
                 className="relative shrink-0 w-[240px] h-[380px] rounded-lg border-[6px] border-[#2A1A1A] bg-[#F2E8D5] shadow-2xl overflow-hidden"
               >
                  {currentNode.speakerImage && <img src={currentNode.speakerImage} className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 text-white text-base font-black whitespace-pre-wrap leading-tight" style={{ writingMode: 'vertical-rl' }}>
                    {currentNode.speaker || '佚名'}
                  </div>
               </motion.div>

               {/* 对话框 */}
               <motion.div 
                 initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
                 className="flex-1 bg-white p-12 rounded-sm shadow-xl relative min-h-[200px]"
               >
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-3 h-3 bg-[#8D2F2F] rotate-45" />
                     <span className="text-lg font-black text-[#8D2F2F] tracking-widest">{currentNode.speaker}</span>
                  </div>
                  <div className="text-[26px] leading-[1.8] text-[#1A1A1A]/90 font-serif">
                    {displayedText}
                  </div>
               </motion.div>
            </div>
          )}
        </div>
      </main>

      {/* 抉择区域：悬浮木牌样式 */}
      <AnimatePresence>
        {dialogueState === 'choice' && currentNode?.choices && (
          <motion.div 
            initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
            className="absolute bottom-0 inset-x-0 bg-white border-t-[3px] border-[#2A1A1A] px-24 py-16 z-[100] shadow-[0_-30px_100px_rgba(0,0,0,0.1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center gap-6 mb-12">
               <div className="h-px w-24 bg-[#1A1A1A]/10" />
               <span className="text-[12px] font-black text-[#1A1A1A]/40 uppercase tracking-[0.8em]">百家之抉 · THE CHOSEN PATH</span>
               <div className="h-px w-24 bg-[#1A1A1A]/10" />
            </div>

            <div className="grid grid-cols-2 gap-10 max-w-7xl mx-auto">
              {availableChoices.map((choice, i) => (
                <button 
                  key={choice.id}
                  onClick={() => handleMakeChoice(choice.id)}
                  className="group relative bg-[#FDFBF7] border-2 border-[#1A1A1A]/5 p-8 rounded-xl text-left hover:border-[#3A5F41] hover:bg-[#3A5F41]/[0.02] transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-2"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 rounded-full border-2 border-[#1A1A1A]/10 flex items-center justify-center font-black group-hover:bg-[#3A5F41] group-hover:text-white group-hover:border-[#3A5F41] transition-all">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <div className="flex-1">
                      <div className="text-[1.3rem] font-serif font-black mb-3 leading-snug">{choice.text}</div>
                      <div className="text-[10px] font-black text-[#3A5F41] opacity-40 uppercase tracking-widest leading-relaxed">
                        {(choice.effects as any)?.hint || 'Destiny is in your hands'}
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 border-2 border-[#3A5F41] opacity-0 group-hover:opacity-20 rounded-xl transition-opacity pointer-events-none" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 朱砂封印动效：选择后的转场 */}
      <AnimatePresence>
        {showSeal && (
          <motion.div 
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none bg-white/40 backdrop-blur-[2px]"
          >
             <div className="relative">
                <motion.div 
                  initial={{ rotate: -15 }} animate={{ rotate: 10 }}
                  className="w-[200px] h-[200px] border-8 border-[#8D2F2F] flex items-center justify-center rounded-sm bg-[#8D2F2F]/5"
                >
                   <span className="text-[#8D2F2F] text-6xl font-black serif tracking-tight" style={{ writingMode: 'vertical-rl' }}>
                      因果已定
                   </span>
                </motion.div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] opacity-[0.05] grayscale select-none">印</div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部名望状态栏 */}
      <footer className="h-16 px-12 border-t border-[#1A1A1A]/5 flex items-center gap-12 bg-[#FDFBF7] z-50">
          <span className="text-[10px] font-black opacity-20 uppercase tracking-[0.5em] whitespace-nowrap">Faction Trust</span>
          <div className="flex gap-10 overflow-x-auto scrollbar-hide py-2">
             {['儒', '法', '道', '墨', '兵', '纵', '名', '杂'].map((f, i) => (
               <div key={f} className="flex flex-col gap-1.5 shrink-0 min-w-[60px]">
                  <div className="flex items-center justify-between">
                     <span className="text-[11px] font-black">{f}</span>
                     <span className="text-[9px] font-serif text-[#D4AF65] italic">50</span>
                  </div>
                  <div className="h-1 w-full bg-[#1A1A1A]/5 rounded-full" />
               </div>
             ))}
          </div>
      </footer>

      <SaveLoadModal 
        open={showSaveModal || showLoadModal} 
        mode={showSaveModal ? 'save' : 'load'} 
        onClose={() => { setShowSaveModal(false); setShowLoadModal(false); }}
        onSave={(slotId) => {
          engine.saveManual(slotId);
          setShowSaveModal(false);
        }}
        onLoad={(slotId) => {
          engine.loadSlot(slotId);
          setShowLoadModal(false);
        }}
        slots={engine.getSaveSlots()}
      />
    </div>
  );
}

export default StoryScreen;
