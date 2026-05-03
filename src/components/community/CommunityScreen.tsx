import { useEffect } from 'react';
import { uiAudio } from '@/utils/audioManager';
import { useCommunityState } from '../../hooks/useCommunityState';
import { CommunityHome } from './CommunityHome';

interface CommunityScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 社区全屏界面
 *
 * 沉浸式设计（V9 墨染空间）：
 * - 全屏覆盖，无遮罩层
 * - 动态墨迹背景 + 玻璃拟态容器
 */
export function CommunityScreen({ isOpen, onClose }: CommunityScreenProps) {
  const {
    actions: { openHome, closeCommunity },
  } = useCommunityState();

  useEffect(() => {
    if (isOpen) {
      openHome();
    }
  }, [isOpen, openHome]);

  if (!isOpen) return null;

  const handleClose = () => {
    uiAudio.playClick();
    closeCommunity();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto overflow-hidden animate-in fade-in duration-700">
      {/* 沉浸式墨染背景 */}
      <div className="absolute inset-0 bg-[#0a0503]/70 backdrop-blur-2xl transition-all duration-1000" onClick={handleClose} />
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{ background: 'radial-gradient(circle at 50% 50%, #1e3a5f 0%, transparent 100%)' }} />
      
      <div className="relative w-full max-w-7xl h-[85vh] flex flex-col items-center animate-in zoom-in-95 duration-500 z-10 px-16">
        {/* V9 浮动顶栏 */}
        <div className="w-full flex items-center justify-between mb-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-sm bg-[#831843]/10 border-2 border-[#831843]/40 shadow-[0_0_20px_rgba(131,24,67,0.2)] rotate-[-4deg]">
              <span className="font-serif text-2xl text-[#831843]" style={{ writingMode: 'vertical-rl' }}>论</span>
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#831843]" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#831843]" />
            </div>
            <div>
              <h2 className="text-[#f6e4c3] font-serif text-5xl tracking-[0.5em] drop-shadow-[0_0_15px_rgba(246,228,195,0.2)]">百家文库</h2>
              <p className="text-[#831843] text-[10px] tracking-[0.3em] font-black uppercase mt-2">Jixia Community · Academic Library</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="text-[#f6e4c3]/40 hover:text-[#f6e4c3] text-4xl font-light transition-all hover:rotate-90 hover:scale-110"
          >✕</button>
        </div>

        {/* 主内容区 - 彻底移除旧版容器 */}
        <main className="relative flex-1 w-full min-h-0 overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm p-8 shadow-inner">
            <CommunityHome />
          </div>
        </main>

        {/* 底部装饰 */}
        <div className="mt-8 py-4 border-t border-white/5 w-full text-center shrink-0">
          <span className="text-[10px] text-[#f6e4c3]/20 tracking-[0.8em] font-serif uppercase">思辨不息 · 问道无穷</span>
        </div>
      </div>
    </div>
  );
}