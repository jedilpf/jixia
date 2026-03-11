import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../../../stores/gameStore';

/**
 * BattleEffects - 战斗特效组件
 * 
 * 职责：
 * - 渲染伤害数字
 * - 渲染攻击动画
 * - 渲染治疗特效
 */
export const BattleEffects: React.FC = () => {
  const game = useGameStore(state => state.game);
  
  // 这里可以添加更多特效状态
  const [effects, setEffects] = React.useState<EffectData[]>([]);
  
  // 监听游戏日志，生成特效
  React.useEffect(() => {
    const lastLog = game.log[game.log.length - 1];
    if (lastLog) {
      // 根据日志内容生成特效
      // 简化实现：仅作为占位
    }
  }, [game.log]);

  return (
    <div className="battle-effects" style={styles.container}>
      <AnimatePresence>
        {effects.map((effect) => (
          <EffectItem key={effect.id} data={effect} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface EffectData {
  id: string;
  type: 'damage' | 'heal' | 'buff' | 'debuff';
  value: number;
  x: number;
  y: number;
}

const EffectItem: React.FC<{ data: EffectData }> = ({ data }) => {
  const { type, value, x, y } = data;
  
  const getColor = () => {
    switch (type) {
      case 'damage': return '#ff4444';
      case 'heal': return '#44ff44';
      case 'buff': return '#4444ff';
      case 'debuff': return '#ff44ff';
      default: return '#ffffff';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 0.5 }}
      animate={{ opacity: 0, y: -100, scale: 1.5 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        color: getColor(),
        fontSize: 48,
        fontWeight: 'bold',
        textShadow: '0 0 10px currentColor',
        pointerEvents: 'none',
      }}
    >
      {value > 0 ? '+' : ''}{value}
    </motion.div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1920,
    height: 1080,
    pointerEvents: 'none',
    zIndex: 100,
  },
};

export default BattleEffects;
