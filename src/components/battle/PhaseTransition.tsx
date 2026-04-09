/**
 * 战斗阶段切换动画组件
 *
 * 在明辩→暗谋→揭示→结算各阶段切换时显示动画
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { DebatePhase } from '@/battleV2/types';

interface PhaseTransitionOverlayProps {
  currentPhase: DebatePhase;
  show: boolean;
  onComplete: () => void;
}

const PHASE_CONFIG: Record<DebatePhase, {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  bgColor: string;
}> = {
  ming_bian: {
    title: '明辩',
    subtitle: '光明正大地陈述观点',
    icon: '☀️',
    color: '#d4a520',
    bgColor: 'rgba(212, 165, 32, 0.15)',
  },
  an_mou: {
    title: '暗谋',
    subtitle: '暗中布局，出奇制胜',
    icon: '🌙',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
  },
  reveal: {
    title: '揭示',
    subtitle: '真相大白于天下',
    icon: '✨',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
  resolve: {
    title: '结算',
    subtitle: '胜负在此一决',
    icon: '⚖️',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  finished: {
    title: '终局',
    subtitle: '辩论结束',
    icon: '🏆',
    color: '#d4a520',
    bgColor: 'rgba(212, 165, 32, 0.2)',
  },
};

export function PhaseTransitionOverlay({
  currentPhase,
  show,
  onComplete,
}: PhaseTransitionOverlayProps) {
  const config = PHASE_CONFIG[currentPhase];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none"
          style={{ background: config.bgColor }}
          onAnimationComplete={() => {
            // 动画完成后自动关闭
            setTimeout(onComplete, 100);
          }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="text-center"
          >
            {/* 图标 */}
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-6xl mb-4"
            >
              {config.icon}
            </motion.div>

            {/* 阶段名称 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-4xl font-serif font-black tracking-[0.3em] mb-2"
              style={{
                color: config.color,
                textShadow: `0 0 30px ${config.color}80`,
              }}
            >
              {config.title}
            </motion.div>

            {/* 副标题 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-lg font-serif tracking-wider"
              style={{ color: '#a7c5ba' }}
            >
              {config.subtitle}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * 阶段指示器组件（显示在战斗界面顶部）
 */
interface PhaseIndicatorProps {
  currentPhase: DebatePhase;
  secondsLeft: number;
  phaseDuration: number;
}

export function PhaseIndicator({
  currentPhase,
  secondsLeft,
  phaseDuration,
}: PhaseIndicatorProps) {
  const config = PHASE_CONFIG[currentPhase];
  const progress = (secondsLeft / phaseDuration) * 100;

  return (
    <div
      className="flex items-center gap-4 px-4 py-2 rounded-lg"
      style={{
        background: 'rgba(16, 25, 46, 0.9)',
        border: `1px solid ${config.color}40`,
      }}
    >
      {/* 阶段图标 */}
      <span className="text-xl">{config.icon}</span>

      {/* 阶段名称 */}
      <span
        className="font-serif font-bold tracking-wider"
        style={{ color: config.color }}
      >
        {config.title}
      </span>

      {/* 进度条 */}
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: config.color }}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>

      {/* 倒计时 */}
      <span
        className="font-mono text-sm"
        style={{
          color: secondsLeft <= 5 ? '#ff6666' : config.color,
        }}
      >
        {secondsLeft}s
      </span>
    </div>
  );
}

/**
 * 回合开始动画
 */
export function RoundStartAnimation({
  round,
  show,
  onComplete,
}: {
  round: number;
  show: boolean;
  onComplete: () => void;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none"
          style={{ background: 'rgba(0, 0, 0, 0.6)' }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="text-center"
            onAnimationComplete={() => setTimeout(onComplete, 500)}
          >
            <div
              className="text-5xl font-serif font-black tracking-[0.2em] mb-2"
              style={{
                color: '#d4a520',
                textShadow: '0 0 40px rgba(212, 165, 32, 0.8)',
              }}
            >
              第 {round} 回合
            </div>
            <div
              className="text-xl font-serif tracking-wider"
              style={{ color: '#a7c5ba' }}
            >
              开始辩论
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}