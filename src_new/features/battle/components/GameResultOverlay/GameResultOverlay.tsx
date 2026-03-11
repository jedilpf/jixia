import React from 'react';
import { motion } from 'framer-motion';
import type { PlayerId } from '../../../../types/domain';

interface GameResultOverlayProps {
  winner: PlayerId;
}

/**
 * GameResultOverlay - 游戏结果覆盖层
 * 
 * 职责：
 * - 显示游戏胜负结果
 * - 提供重新开始选项
 */
export const GameResultOverlay: React.FC<GameResultOverlayProps> = ({
  winner,
}) => {
  const isVictory = winner === 'player';
  
  const handleRestart = () => {
    window.location.reload();
  };

  const handleMainMenu = () => {
    // 返回主菜单
    window.location.href = '/';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={styles.overlay}
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
        style={styles.content}
      >
        {/* 结果标题 */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            marginBottom: 24,
            color: isVictory ? '#d4af37' : '#c41e3a',
            textShadow: `0 0 30px ${isVictory ? '#d4af37' : '#c41e3a'}`,
          }}
        >
          {isVictory ? '论道胜利！' : '论道失败'}
        </div>

        {/* 结果描述 */}
        <div
          style={{
            fontSize: 24,
            color: '#ccc',
            marginBottom: 48,
            textAlign: 'center',
          }}
        >
          {isVictory 
            ? '你的思辨击败了对手，稷下学宫为你骄傲！' 
            : '此次论道虽未取胜，但学问之路永无止境。'}
        </div>

        {/* 按钮组 */}
        <div style={styles.buttonGroup}>
          <button
            onClick={handleRestart}
            style={{
              ...styles.button,
              backgroundColor: '#d4af37',
              color: '#000',
            }}
          >
            再来一局
          </button>
          <button
            onClick={handleMainMenu}
            style={{
              ...styles.button,
              backgroundColor: 'transparent',
              color: '#d4af37',
              border: '2px solid #d4af37',
            }}
          >
            返回主菜单
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 48,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderRadius: 24,
    border: '3px solid #d4af37',
    boxShadow: '0 0 50px rgba(212, 175, 55, 0.3)',
    maxWidth: 600,
  },
  buttonGroup: {
    display: 'flex',
    gap: 24,
  },
  button: {
    padding: '16px 32px',
    fontSize: 18,
    fontWeight: 'bold',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    minWidth: 140,
  },
};

export default GameResultOverlay;
