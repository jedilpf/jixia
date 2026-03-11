import React, { createContext, useContext, ReactNode } from 'react';

/**
 * BattleContext - 战斗上下文
 * 
 * 提供战斗相关的共享状态和回调
 */

interface BattleContextValue {
  // 可以在这里添加战斗特定的共享状态
  // 例如：动画状态、音效控制等
}

const BattleContext = createContext<BattleContextValue | null>(null);

interface BattleProviderProps {
  children: ReactNode;
}

/**
 * BattleProvider - 战斗上下文提供者
 */
export const BattleProvider: React.FC<BattleProviderProps> = ({ children }) => {
  const value: BattleContextValue = {
    // 初始化值
  };

  return (
    <BattleContext.Provider value={value}>
      {children}
    </BattleContext.Provider>
  );
};

/**
 * useBattleContext - 战斗上下文 Hook
 * 
 * @throws 如果在 Provider 外使用会抛出错误
 */
export function useBattleContext(): BattleContextValue {
  const context = useContext(BattleContext);
  
  if (!context) {
    throw new Error('useBattleContext must be used within a BattleProvider');
  }
  
  return context;
}

export default BattleContext;
