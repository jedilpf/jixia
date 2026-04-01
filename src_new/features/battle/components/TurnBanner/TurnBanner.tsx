import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../../../stores/gameStore';

/**
 * TurnBanner - 回合横幅组件
 * 
 * 职责：
 * - 显示当前回合信息
 * - 回合切换动画
 */
export const TurnBanner: React.FC = () => {
  const currentPlayer = useGameStore(state => state.game.currentPlayer);
  const turnNumber = useGameStore(state => state.game.turnNumber);
  const [showBanner, setShowBanner] = React.useState(false);
  const [lastPlayer, setLastPlayer] = React.useState(currentPlayer);

  React.useEffect(() => {
    if (currentPlayer !== lastPlayer) {
      setShowBanner(true);
      setLastPlayer(currentPlayer);
      
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, lastPlayer]);

  const getBannerText = () => {
    if (currentPlayer === 'player') {
      return `第 ${turnNumber} 回合 - 你的论述`;
    } else {
      return `第 ${turnNumber} 回合 - 敌方论述`;
    }
  };

  const getBannerColor = () => {
    return currentPlayer === 'player' ? '#4a90d9' : '#c41e3a';
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
          }}
        >
          <div
            style={{
              padding: '16px 48px',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              border: `3px solid ${getBannerColor()}`,
              borderRadius: 16,
              boxShadow: `0 0 30px ${getBannerColor()}`,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: getBannerColor(),
                textAlign: 'center',
                textShadow: `0 0 20px ${getBannerColor()}`,
              }}
            >
              {getBannerText()}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TurnBanner;
