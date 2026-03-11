import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SyncPhase } from '../../../../types/syncBattle';
import { formatTimeRemaining, getPhaseDisplayName } from '../../../../engine/SyncBattleEngine';

interface SyncBattleTimerProps {
  phase: SyncPhase;
  timeRemaining: number;
  totalTimeRemaining: number;
  isVisible: boolean;
}

/**
 * SyncBattleTimer - 同步对战计时器组件
 * 
 * 职责：
 * - 显示当前阶段和剩余时间
 * - 提供时间进度指示
 * - 阶段切换动画
 */
export const SyncBattleTimer: React.FC<SyncBattleTimerProps> = ({
  phase,
  timeRemaining,
  totalTimeRemaining,
  isVisible,
}) => {
  const [showWarning, setShowWarning] = useState(false);
  
  // 时间警告
  useEffect(() => {
    if (timeRemaining <= 5000 && timeRemaining > 0) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [timeRemaining]);

  // 计算进度百分比
  const getProgressPercent = () => {
    switch (phase) {
      case 'reveal':
        return (timeRemaining / 10000) * 100;
      case 'hidden':
        return (timeRemaining / 10000) * 100;
      default:
        return 100;
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'reveal':
        return '#4a90d9'; // 蓝色 - 可见
      case 'hidden':
        return '#c41e3a'; // 红色 - 隐藏
      case 'resolution':
        return '#d4af37'; // 金色 - 结算
      default:
        return '#888';
    }
  };

  const progressPercent = getProgressPercent();
  const phaseColor = getPhaseColor();
  const displayTime = formatTimeRemaining(timeRemaining);

  return (
    <div style={styles.container}>
      {/* 阶段指示器 */}
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        style={{
          ...styles.phaseIndicator,
          borderColor: phaseColor,
          boxShadow: `0 0 20px ${phaseColor}40`,
        }}
      >
        <span style={{ ...styles.phaseText, color: phaseColor }}>
          {getPhaseDisplayName(phase)}
        </span>
        {!isVisible && phase === 'hidden' && (
          <span style={styles.hiddenBadge}>对方不可见</span>
        )}
      </motion.div>

      {/* 时间显示 */}
      <div style={styles.timeDisplay}>
        <AnimatePresence mode="wait">
          <motion.span
            key={displayTime}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            style={{
              ...styles.timeText,
              color: showWarning ? '#c41e3a' : '#fff',
              textShadow: showWarning ? '0 0 20px #c41e3a' : 'none',
            }}
          >
            {displayTime}
            <span style={styles.timeUnit}>秒</span>
          </motion.span>
        </AnimatePresence>
      </div>

      {/* 进度条 */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBackground}>
          <motion.div
            style={{
              ...styles.progressBar,
              backgroundColor: phaseColor,
              width: `${progressPercent}%`,
            }}
            initial={{ width: '100%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
        
        {/* 阶段标记 */}
        <div style={styles.phaseMarkers}>
          <div style={styles.marker}>
            <span style={styles.markerLabel}>揭示</span>
            <div style={{
              ...styles.markerDot,
              backgroundColor: phase === 'reveal' ? phaseColor : '#666',
            }} />
          </div>
          <div style={styles.marker}>
            <span style={styles.markerLabel}>隐藏</span>
            <div style={{
              ...styles.markerDot,
              backgroundColor: phase === 'hidden' ? phaseColor : '#666',
            }} />
          </div>
          <div style={styles.marker}>
            <span style={styles.markerLabel}>结算</span>
            <div style={{
              ...styles.markerDot,
              backgroundColor: phase === 'resolution' ? phaseColor : '#666',
            }} />
          </div>
        </div>
      </div>

      {/* 总时间指示 */}
      <div style={styles.totalTime}>
        回合剩余: {formatTimeRemaining(totalTimeRemaining)}秒
      </div>

      {/* 警告动画 */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={styles.warningOverlay}
          >
            <span style={styles.warningText}>时间紧迫！</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    border: '2px solid rgba(212, 175, 55, 0.3)',
    minWidth: 280,
  },
  phaseIndicator: {
    padding: '8px 24px',
    borderRadius: 20,
    border: '2px solid',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  phaseText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  hiddenBadge: {
    fontSize: 10,
    padding: '2px 6px',
    backgroundColor: '#c41e3a',
    borderRadius: 4,
    color: '#fff',
  },
  timeDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    transition: 'all 0.3s ease',
  },
  timeUnit: {
    fontSize: 16,
    color: '#888',
  },
  progressContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  progressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.1s linear',
  },
  phaseMarkers: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 4px',
  },
  marker: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  markerLabel: {
    fontSize: 10,
    color: '#888',
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
  totalTime: {
    fontSize: 12,
    color: '#666',
  },
  warningOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '12px 24px',
    backgroundColor: 'rgba(196, 30, 58, 0.9)',
    borderRadius: 8,
    animation: 'pulse 0.5s infinite',
  },
  warningText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
};

export default SyncBattleTimer;
