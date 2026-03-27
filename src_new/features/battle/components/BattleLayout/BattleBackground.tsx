import React from 'react';

/**
 * BattleBackground - 战斗背景组件
 * 
 * 职责：
 * - 渲染多层背景
 * - 提供视觉深度
 */
export const BattleBackground: React.FC = () => {
  return (
    <div className="battle-background" style={styles.container}>
      {/* 最底层 - 背景色 */}
      <div style={styles.baseLayer} />
      
      {/* 第二层 - 渐变 */}
      <div style={styles.gradientLayer} />
      
      {/* 第三层 - 装饰图案 */}
      <div style={styles.patternLayer}>
        {/* 中央装饰 */}
        <div style={styles.centerDecoration}>
          <div style={styles.yinYang}>☯️</div>
        </div>
        
        {/* 四角装饰 */}
        <div style={{ ...styles.cornerDecoration, top: 20, left: 20 }}>◆</div>
        <div style={{ ...styles.cornerDecoration, top: 20, right: 20 }}>◆</div>
        <div style={{ ...styles.cornerDecoration, bottom: 20, left: 20 }}>◆</div>
        <div style={{ ...styles.cornerDecoration, bottom: 20, right: 20 }}>◆</div>
      </div>
      
      {/* 第四层 - 战场区域标识 */}
      <div style={styles.battlefieldLayer}>
        {/* 敌方区域 */}
        <div style={styles.enemyZone}>
          <span style={styles.zoneLabel}>敌方阵地</span>
        </div>
        
        {/* 我方区域 */}
        <div style={styles.playerZone}>
          <span style={styles.zoneLabel}>我方阵地</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1920,
    height: 1080,
    overflow: 'hidden',
  },
  baseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0a0f',
  },
  gradientLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(ellipse at 50% 0%, rgba(74, 144, 217, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 100%, rgba(139, 69, 19, 0.1) 0%, transparent 50%)
    `,
  },
  patternLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  centerDecoration: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  yinYang: {
    fontSize: 120,
    opacity: 0.2,
    filter: 'blur(2px)',
  },
  cornerDecoration: {
    position: 'absolute',
    fontSize: 24,
    color: '#d4af37',
    opacity: 0.3,
  },
  battlefieldLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  enemyZone: {
    position: 'absolute',
    top: 80,
    left: 400,
    right: 400,
    height: 350,
    border: '2px dashed rgba(196, 30, 58, 0.2)',
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerZone: {
    position: 'absolute',
    bottom: 200,
    left: 400,
    right: 400,
    height: 350,
    border: '2px dashed rgba(74, 144, 217, 0.2)',
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneLabel: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.1)',
    fontWeight: 'bold',
    letterSpacing: 8,
  },
};

export default BattleBackground;
