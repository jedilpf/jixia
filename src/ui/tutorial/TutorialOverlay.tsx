import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { getTutorialStep, getNextStep, TUTORIAL_STEP_ORDER } from './tutorialSteps';
import { useTutorial } from './TutorialContext';

interface TutorialOverlayProps {
  currentStepId: string;
}

const V9_COLORS = {
  paper: '#FDFBF7',
  ink: '#1A1A1A',
  gold: '#D4AF65',
  jade: '#3A5F41',
  crimson: '#8D2F2F',
  wood: '#2A1A1A',
  silk: '#F2E8D5',
};

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TutorialOverlay({ currentStepId }: TutorialOverlayProps) {
  const { nextStep, skipTutorial } = useTutorial();
  const step = getTutorialStep(currentStepId as any);
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');

  // 更新高亮区域
  const updateHighlight = useCallback(() => {
    if (!step?.highlightSelector) {
      setHighlightRect(null);
      return;
    }

    const element = document.querySelector(step.highlightSelector);
    if (!element) {
      setHighlightRect(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = 8;

    setHighlightRect({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // 计算提示框位置
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    if (rect.top > viewportHeight * 0.6) {
      setTooltipPosition('top');
    } else if (rect.left > viewportWidth * 0.6) {
      setTooltipPosition('left');
    } else if (rect.left < viewportWidth * 0.3) {
      setTooltipPosition('right');
    } else {
      setTooltipPosition('bottom');
    }
  }, [step?.highlightSelector]);

  useEffect(() => {
    updateHighlight();

    // 监听窗口变化更新高亮
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight, true);

    // 定期更新（应对动态内容）
    const interval = setInterval(updateHighlight, 500);

    return () => {
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight, true);
      clearInterval(interval);
    };
  }, [updateHighlight]);

  if (!step) {
    return null;
  }

  const hasNextStep = getNextStep(currentStepId as any) !== null;

  // 计算提示框位置样式
  const getTooltipStyle = (): React.CSSProperties => {
    if (!highlightRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const tooltipWidth = 480;
    const tooltipHeight = 250;
    const gap = 16;

    switch (tooltipPosition) {
      case 'top':
        return {
          top: highlightRect.top - tooltipHeight - gap,
          left: highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2,
        };
      case 'bottom':
        return {
          top: highlightRect.top + highlightRect.height + gap,
          left: highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2,
        };
      case 'left':
        return {
          top: highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2,
          left: highlightRect.left - tooltipWidth - gap,
        };
      case 'right':
        return {
          top: highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2,
          left: highlightRect.left + highlightRect.width + gap,
        };
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200]"
      >
        {/* 遮罩层 - 使用 SVG 镂空效果 */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="tutorial-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {highlightRect && (
                <rect
                  x={highlightRect.left}
                  y={highlightRect.top}
                  width={highlightRect.width}
                  height={highlightRect.height}
                  fill="black"
                  rx="8"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#tutorial-mask)"
          />
        </svg>

        {/* 高亮边框 */}
        {highlightRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute pointer-events-none"
            style={{
              top: highlightRect.top,
              left: highlightRect.left,
              width: highlightRect.width,
              height: highlightRect.height,
              border: `2px solid ${V9_COLORS.gold}`,
              borderRadius: 8,
              boxShadow: `0 0 20px ${V9_COLORS.gold}50`,
            }}
          />
        )}

        {/* 教程卡片 */}
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="absolute w-[480px] rounded-2xl border-2 shadow-2xl overflow-hidden"
          style={{
            backgroundColor: V9_COLORS.paper,
            borderColor: V9_COLORS.jade,
            ...getTooltipStyle(),
          }}
        >
          {/* 标题栏 */}
          <div
            className="px-6 py-4 border-b"
            style={{ backgroundColor: V9_COLORS.jade, borderColor: `${V9_COLORS.jade}33` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-black tracking-widest text-white uppercase">
                新手引导
              </span>
              {step.skipable && (
                <button
                  onClick={skipTutorial}
                  className="text-xs font-bold text-white/70 hover:text-white transition-colors"
                >
                  跳过教程
                </button>
              )}
            </div>
          </div>

          {/* 内容区 */}
          <div className="p-6 space-y-4">
            <h3
              className="text-xl font-black tracking-tight"
              style={{ color: V9_COLORS.ink }}
            >
              {step.title}
            </h3>

            <p
              className="text-base leading-relaxed opacity-80"
              style={{ color: V9_COLORS.ink }}
            >
              {step.content}
            </p>

            {/* 动作提示 */}
            {step.actionHint && (
              <div
                className="px-4 py-3 rounded-lg border-l-4"
                style={{
                  backgroundColor: `${V9_COLORS.gold}15`,
                  borderColor: V9_COLORS.gold,
                }}
              >
                <span
                  className="text-sm font-bold"
                  style={{ color: V9_COLORS.gold }}
                >
                  → {step.actionHint}
                </span>
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div
            className="px-6 py-4 border-t flex justify-end gap-4"
            style={{ borderColor: `${V9_COLORS.wood}22` }}
          >
            {hasNextStep ? (
              <button
                onClick={nextStep}
                className="px-6 py-2.5 rounded-lg font-black text-sm transition-all hover:-translate-y-0.5"
                style={{
                  backgroundColor: V9_COLORS.jade,
                  color: 'white',
                }}
              >
                下一步
              </button>
            ) : (
              <button
                onClick={skipTutorial}
                className="px-6 py-2.5 rounded-lg font-black text-sm transition-all hover:-translate-y-0.5"
                style={{
                  backgroundColor: V9_COLORS.jade,
                  color: 'white',
                }}
              >
                开始对战
              </button>
            )}
          </div>

          {/* 进度指示器 */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1A1A1A]/10">
            <motion.div
              className="h-full"
              style={{ backgroundColor: V9_COLORS.jade }}
              initial={{ width: '0%' }}
              animate={{
                width: `${((TUTORIAL_STEP_ORDER.indexOf(currentStepId as any) + 1) / TUTORIAL_STEP_ORDER.length) * 100}%`,
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}