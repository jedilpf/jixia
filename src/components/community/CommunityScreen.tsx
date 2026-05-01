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
 * 沉浸式设计：
 * - 全屏覆盖，无遮罩层
 * - 无卡片容器边框，与主界面融为一体
 * - 古风书院风格背景纹理
 * - 顶部导航栏整合返回按钮
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
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{
        // 古风书院背景 - 深色竹简/宣纸质感
        background: `
          linear-gradient(180deg,
            rgba(28, 12, 8, 0.97) 0%,
            rgba(18, 8, 6, 0.98) 30%,
            rgba(14, 6, 5, 0.99) 100%
          )
        `,
      }}
    >
      {/* 顶部装饰纹理 - 卷轴边缘 */}
      <div
        className="absolute left-0 right-0 top-0 h-2"
        style={{
          background: 'linear-gradient(180deg, rgba(139, 90, 43, 0.5) 0%, transparent 100%)',
        }}
      />
      <div
        className="absolute left-0 top-0 bottom-0 w-2"
        style={{
          background: 'linear-gradient(90deg, rgba(139, 90, 43, 0.4) 0%, transparent 100%)',
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-2"
        style={{
          background: 'linear-gradient(270deg, rgba(139, 90, 43, 0.4) 0%, transparent 100%)',
        }}
      />

      {/* 微妙的纹理叠加 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a520' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* 顶部导航栏 */}
      <header
        className="relative flex h-14 shrink-0 items-center justify-between px-4 md:px-8"
        style={{
          background: `
            linear-gradient(180deg,
              rgba(32, 14, 10, 0.92) 0%,
              rgba(20, 9, 7, 0.95) 100%
            )
          `,
          borderBottom: '2px solid rgba(139, 90, 43, 0.35)',
          borderTop: '1px solid rgba(139, 90, 43, 0.25)',
        }}
      >
        {/* 左侧：返回按钮 */}
        <button
          onClick={handleClose}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-serif transition-all"
          style={{
            background: 'rgba(212, 165, 32, 0.1)',
            border: '1px solid rgba(212, 165, 32, 0.24)',
            color: '#d9c3a0',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(212, 165, 32, 0.18)';
            e.currentTarget.style.color = '#f5e6b8';
            uiAudio.playHover();
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(212, 165, 32, 0.1)';
            e.currentTarget.style.color = '#d9c3a0';
          }}
        >
          <span className="text-lg">←</span>
          <span>返回</span>
        </button>

        {/* 中央：标题 */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
          {/* 印章 */}
          <div
            className="relative flex h-10 w-10 items-center justify-center rounded-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(176, 83, 39, 0.28), rgba(139, 90, 43, 0.18))',
              border: '2px solid rgba(212, 165, 32, 0.5)',
              boxShadow: 'inset 0 0 8px rgba(139, 90, 43, 0.3)',
              transform: 'rotate(-3deg)',
            }}
          >
            <span className="font-serif text-base text-[#d4a520]" style={{ writingMode: 'vertical-rl' }}>论</span>
            {/* 印章四角装饰 */}
            <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-t border-l border-[#d4a520]/60" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 border-t border-r border-[#d4a520]/60" />
            <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 border-b border-l border-[#d4a520]/60" />
            <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-b border-r border-[#d4a520]/60" />
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs tracking-[0.2em] text-[#a87a5d] font-serif">稷下论场</span>
            <span className="font-serif text-lg text-[#f5e6b8] tracking-wider">百家争鸣 · 思辨之地</span>
          </div>
        </div>

        {/* 右侧：占位（保持布局平衡） */}
        <div className="w-20" />
      </header>

      {/* 主内容区 - 全屏沉浸 */}
      <main className="relative flex-1 min-h-0 overflow-hidden">
        <CommunityHome />
      </main>

      {/* 底部装饰 */}
      <div
        className="absolute left-0 right-0 bottom-0 h-2"
        style={{
          background: 'linear-gradient(0deg, rgba(139, 90, 43, 0.5) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}