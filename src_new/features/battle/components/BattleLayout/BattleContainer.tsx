import React from 'react';
import { useScale } from '../../../../hooks/useScale';

interface BattleContainerProps {
  children: React.ReactNode;
}

/**
 * BattleContainer - 战斗容器组件
 * 
 * 职责：
 * - 提供响应式缩放
 * - 设置画布基准尺寸
 */
export const BattleContainer: React.FC<BattleContainerProps> = ({ children }) => {
  const { scale, containerRef } = useScale({
    designWidth: 1920,
    designHeight: 1080,
  });

  return (
    <div
      ref={containerRef}
      className="battle-container"
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0a0a0f',
        position: 'relative',
      }}
    >
      <div
        className="battle-canvas"
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          position: 'absolute',
          left: '50%',
          top: '50%',
          marginLeft: -960,
          marginTop: -540,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default BattleContainer;
