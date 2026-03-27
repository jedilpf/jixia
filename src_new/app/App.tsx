import React from 'react';
import { BattleLayout } from '../features/battle/components/BattleLayout/BattleLayout';

/**
 * App - 应用根组件
 * 
 * 优化后的应用入口
 */
function App() {
  return (
    <div className="app">
      <BattleLayout />
    </div>
  );
}

export default App;
