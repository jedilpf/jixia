# 新手引导实施指南

## 快速开始（1 小时原型）

本指南帮助你在 1 小时内创建一个最小可用的新手引导原型。

---

## 一、胜利条件提示（15 分钟）

### 1.1 创建 VictoryProgress 组件

```typescript
// src/components/battle/VictoryProgress.tsx
import React from 'react';

interface VictoryProgressProps {
  playerZhengLi: number;
  enemyZhengLi: number;
  targetZhengLi?: number;
}

export function VictoryProgress({ 
  playerZhengLi, 
  enemyZhengLi, 
  targetZhengLi = 10 
}: VictoryProgressProps) {
  const playerPercent = Math.min(100, (playerZhengLi / targetZhengLi) * 100);
  const enemyPercent = Math.min(100, (enemyZhengLi / targetZhengLi) * 100);
  
  return (
    <div className="bg-[#1a2129]/90 rounded-lg p-3 border border-[#6b5f4d]">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#efddb8] font-bold">
          ⭐ 胜利进度
        </span>
        <span className="text-xs text-[#9db0c2]">
          目标：{targetZhengLi} 点证立
        </span>
      </div>
      
      {/* 进度条 */}
      <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden mb-2">
        {/* 玩家进度 */}
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
          style={{ width: `${playerPercent}%` }}
        >
          {playerPercent >= 15 && (
            <div className="h-full flex items-center justify-end pr-2">
              <span className="text-xs font-bold text-white">{playerZhengLi}</span>
            </div>
          )}
        </div>
        
        {/* 敌方进度 */}
        <div 
          className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-600 to-red-400 transition-all duration-500"
          style={{ width: `${enemyPercent}%` }}
        >
          {enemyPercent >= 15 && (
            <div className="h-full flex items-center justify-start pl-2">
              <span className="text-xs font-bold text-white">{enemyZhengLi}</span>
            </div>
          )}
        </div>
        
        {/* 中心线 */}
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/30 transform -translate-x-1/2" />
      </div>
      
      {/* 警告提示 */}
      {playerZhengLi >= 8 && (
        <div className="text-center text-xs text-yellow-300 animate-pulse bg-yellow-900/30 py-1 rounded">
          🎯 再得 {targetZhengLi - playerZhengLi} 点即可获胜！
        </div>
      )}
      {enemyZhengLi >= 8 && (
        <div className="text-center text-xs text-red-300 animate-pulse bg-red-900/30 py-1 rounded">
          ⚠️ 敌方即将获胜！
        </div>
      )}
    </div>
  );
}
```

### 1.2 集成到 BattleFrameV2

```typescript
// 在 BattleFrameV2.tsx 中找到资源显示区域
// 添加 VictoryProgress 组件

import { VictoryProgress } from './battle/VictoryProgress';

// 在 header 区域添加
<VictoryProgress 
  playerZhengLi={state.player.resources.zhengLi}
  enemyZhengLi={state.enemy.resources.zhengLi}
/>
```

---

## 二、资源 Tooltip（20 分钟）

### 2.1 创建 ResourceTooltip 组件

```typescript
// src/components/battle/ResourceTooltip.tsx
import React, { useState } from 'react';

interface ResourceTooltipProps {
  resourceKey: string;
  value: number;
  maxValue?: number;
}

const RESOURCE_INFO: Record<string, {
  name: string;
  icon: string;
  description: string;
  details: string;
  gainMethods: string[];
}> = {
  xinZheng: {
    name: '心证',
    icon: '❤️',
    description: '你的信念强度',
    details: '归零时判负，相当于生命值',
    gainMethods: ['控制左路', '部分卡牌效果']
  },
  lingShi: {
    name: '灵势',
    icon: '💎',
    description: '出牌需要的能量',
    details: '每回合开始时回满',
    gainMethods: ['每回合自动获得', '控制左路额外 +1']
  },
  huYin: {
    name: '护印',
    icon: '🛡️',
    description: '额外的保护',
    details: '抵挡受到的伤害',
    gainMethods: ['卡牌效果']
  },
  zhengLi: {
    name: '证立',
    icon: '⭐',
    description: '辩论优势',
    details: '先达到 10 点者获胜',
    gainMethods: ['控制中路', '卡牌效果']
  },
  wenMai: {
    name: '文脉',
    icon: '📜',
    description: '临时存储',
    details: '下回合转换为心证',
    gainMethods: ['控制左路']
  },
  shiXu: {
    name: '失序',
    icon: '⚠️',
    description: '负面状态',
    details: '过高时会有不利影响',
    gainMethods: ['部分卡牌副作用']
  }
};

export function ResourceTooltip({ resourceKey, value, maxValue }: ResourceTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const info = RESOURCE_INFO[resourceKey];
  
  if (!info) return <span>{value}</span>;
  
  const displayValue = maxValue !== undefined ? `${value}/${maxValue}` : value;
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* 资源显示 */}
      <div className="flex items-center gap-1 cursor-help">
        <span>{info.icon}</span>
        <span className="text-sm">{displayValue}</span>
        <span className="text-[10px] text-gray-400">ⓘ</span>
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-[#1a2129] border border-[#6b5f4d] rounded-lg shadow-xl p-3 text-xs">
          {/* 标题 */}
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#6b5f4d]/50">
            <span className="text-lg">{info.icon}</span>
            <span className="font-bold text-[#efddb8]">{info.name}</span>
          </div>
          
          {/* 描述 */}
          <div className="mb-2">
            <div className="text-[#9db0c2] mb-1">{info.description}</div>
            <div className="text-[#7a8c9e]">{info.details}</div>
          </div>
          
          {/* 获取方式 */}
          <div>
            <div className="text-[#9db0c2] mb-1">获取方式:</div>
            <ul className="list-disc list-inside text-[#7a8c9e] space-y-0.5">
              {info.gainMethods.map((method, i) => (
                <li key={i}>{method}</li>
              ))}
            </ul>
          </div>
          
          {/* 小三角 */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-[#1a2129] border-r border-b border-[#6b5f4d]" />
        </div>
      )}
    </div>
  );
}
```

### 2.2 使用 ResourceTooltip

```typescript
// 在资源显示处替换
import { ResourceTooltip } from './battle/ResourceTooltip';

// 原来:
<span>心证：{state.player.resources.xinZheng}</span>

// 改为:
<ResourceTooltip 
  resourceKey="xinZheng"
  value={state.player.resources.xinZheng}
/>
```

---

## 三、三路系统标识（15 分钟）

### 3.1 创建 LaneIndicator 组件

```typescript
// src/components/battle/LaneIndicator.tsx
import React from 'react';

interface LaneIndicatorProps {
  laneId: 'left' | 'center' | 'right';
  controlledBy?: 'player' | 'enemy' | null;
  playerPower: number;
  enemyPower: number;
  reward: string;
}

const LANE_INFO = {
  left: {
    name: '左路',
    subtitle: '立势',
    icon: '🏛️',
    reward: '控制：下回合 +1 心证',
    color: 'blue'
  },
  center: {
    name: '中路',
    subtitle: '争衡',
    icon: '⚔️',
    reward: '控制：+2 证立',
    color: 'red'
  },
  right: {
    name: '右路',
    subtitle: '机辩',
    icon: '✨',
    reward: '控制：+1 机变',
    color: 'purple'
  }
};

export function LaneIndicator({ 
  laneId, 
  controlledBy, 
  playerPower, 
  enemyPower,
  reward 
}: LaneIndicatorProps) {
  const info = LANE_INFO[laneId];
  const isControlled = controlledBy !== null;
  const isPlayerControlled = controlledBy === 'player';
  
  return (
    <div className={`
      rounded-lg border p-2 mb-2
      ${isPlayerControlled 
        ? 'border-blue-400 bg-blue-900/20' 
        : controlledBy === 'enemy'
        ? 'border-red-400 bg-red-900/20'
        : 'border-gray-600 bg-gray-800/20'
      }
    `}>
      {/* 路名和控制状态 */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <span className="text-lg">{info.icon}</span>
          <div>
            <div className="text-sm font-bold text-[#efddb8]">
              {info.name}·{info.subtitle}
            </div>
            <div className="text-[10px] text-[#9db0c2]">
              {reward}
            </div>
          </div>
        </div>
        
        {isControlled && (
          <div className={`
            text-xs px-2 py-1 rounded
            ${isPlayerControlled 
              ? 'bg-blue-600 text-white' 
              : 'bg-red-600 text-white'
            }
          `}>
            {isPlayerControlled ? '我方控制' : '敌方控制'}
          </div>
        )}
      </div>
      
      {/* 战力对比 */}
      <div className="flex items-center gap-2 text-xs">
        <span className={`font-bold ${isPlayerControlled ? 'text-blue-300' : 'text-gray-400'}`}>
          我方：{playerPower}
        </span>
        <span className="text-gray-500">vs</span>
        <span className={`font-bold ${controlledBy === 'enemy' ? 'text-red-300' : 'text-gray-400'}`}>
          敌方：{enemyPower}
        </span>
      </div>
    </div>
  );
}
```

### 3.2 集成到战场显示

```typescript
// 在战场区域添加 LaneIndicator
import { LaneIndicator } from './battle/LaneIndicator';

// 为每路添加指示器
<LaneIndicator
  laneId="center"
  controlledBy={laneControls.center.controlledBy}
  playerPower={laneControls.center.playerPower}
  enemyPower={laneControls.center.enemyPower}
  reward="控制：+2 证立"
/>
```

---

## 四、阶段指引（10 分钟）

### 4.1 创建 PhaseGuide 组件

```typescript
// src/components/battle/PhaseGuide.tsx
import React from 'react';
import { DebatePhase } from '@/battleV2/types';

interface PhaseGuideProps {
  phase: DebatePhase;
  canAct: boolean;
  suggestedAction?: string;
}

const PHASE_GUIDES: Record<DebatePhase, {
  title: string;
  description: string;
  actions: string[];
}> = {
  ming_bian: {
    title: '📜 明辩阶段',
    description: '公开布置你的主论和应对',
    actions: [
      '从手牌选择卡牌',
      '放置到先声/主辩/余论席',
      '可以执行着书'
    ]
  },
  an_mou: {
    title: '🌙 暗谋阶段',
    description: '秘密布置你的暗策',
    actions: [
      '选择一张暗策牌',
      '对手无法看到',
      '在揭示阶段同时亮出'
    ]
  },
  reveal: {
    title: '✨ 揭示阶段',
    description: '双方暗策同时揭示',
    actions: [
      '等待对手完成',
      '准备进入结算'
    ]
  },
  resolve: {
    title: '⚙️ 结算阶段',
    description: '自动结算所有效果',
    actions: [
      '按顺序处理效果',
      '观察战场变化',
      '准备下回合'
    ]
  },
  finished: {
    title: '🏁 结束',
    description: '本局对战完成',
    actions: [
      '查看战绩',
      '开始新对局'
    ]
  }
};

export function PhaseGuide({ phase, canAct, suggestedAction }: PhaseGuideProps) {
  const guide = PHASE_GUIDES[phase];
  
  return (
    <div className="bg-[#1a2129]/90 rounded-lg p-3 border border-[#6b5f4d]">
      {/* 阶段标题 */}
      <div className="text-sm font-bold text-[#efddb8] mb-2">
        {guide.title}
      </div>
      
      {/* 阶段描述 */}
      <div className="text-xs text-[#9db0c2] mb-3">
        {guide.description}
      </div>
      
      {/* 可执行操作 */}
      <div className="space-y-1">
        {guide.actions.map((action, i) => (
          <div 
            key={i}
            className={`
              text-xs flex items-center gap-2
              ${i === 0 && canAct ? 'text-yellow-300 animate-pulse' : 'text-[#7a8c9e]'}
            `}
          >
            <span>{canAct && i === 0 ? '👉' : '•'}</span>
            <span>{action}</span>
          </div>
        ))}
      </div>
      
      {/* 当前操作提示 */}
      {canAct && suggestedAction && (
        <div className="mt-3 text-xs text-yellow-300 bg-yellow-900/30 py-2 px-3 rounded text-center">
          💡 建议：{suggestedAction}
        </div>
      )}
    </div>
  );
}
```

---

## 五、简易教程关卡（20 分钟）

### 5.1 创建 TutorialOverlay 组件

```typescript
// src/components/tutorial/TutorialOverlay.tsx
import React, { useState } from 'react';

interface TutorialStep {
  title: string;
  content: string;
  targetElement?: string; // CSS selector
  action?: () => void;
  actionLabel?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: '欢迎来到稷下论道',
    content: '这是一场关于思想与辩论的较量。你将通过卡牌与对手进行三场论战。',
    actionLabel: '开始教学'
  },
  {
    title: '胜利条件',
    content: '通过积累"证立"来获得胜利。先达到 10 点证立者获胜。',
    targetElement: '.victory-progress',
    actionLabel: '继续'
  },
  {
    title: '资源系统',
    content: '心证是你的生命，归零判负。灵势是出牌费用，每回合回满。',
    targetElement: '.resource-panel',
    actionLabel: '继续'
  },
  {
    title: '出牌流程',
    content: '点击手牌选择卡牌，然后放置到三个计划位（先声/主辩/余论）。',
    targetElement: '.hand-area',
    action: () => console.log('引导出牌'),
    actionLabel: '尝试出牌'
  },
  {
    title: '三路战场',
    content: '战场分为左中右三路。控制中路可获得 2 点证立，最接近胜利！',
    targetElement: '.battle-field',
    actionLabel: '开始对战'
  }
];

interface TutorialOverlayProps {
  onComplete?: () => void;
}

export function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];
  
  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-[#1a2129] border border-[#6b5f4d] rounded-xl p-6 max-w-md mx-4">
        {/* 进度指示 */}
        <div className="flex gap-1 mb-4">
          {TUTORIAL_STEPS.map((_, i) => (
            <div 
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i <= currentStep ? 'bg-yellow-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
        
        {/* 标题 */}
        <h2 className="text-xl font-bold text-[#efddb8] mb-3">
          {step.title}
        </h2>
        
        {/* 内容 */}
        <p className="text-[#9db0c2] mb-6 leading-relaxed">
          {step.content}
        </p>
        
        {/* 按钮 */}
        <button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-bold py-3 px-4 rounded-lg transition"
        >
          {step.actionLabel}
        </button>
        
        {/* 跳过 */}
        {currentStep < TUTORIAL_STEPS.length - 1 && (
          <button
            onClick={() => onComplete?.()}
            className="w-full mt-2 text-[#7a8c9e] hover:text-[#9db0c2] text-sm py-2"
          >
            跳过教学
          </button>
        )}
      </div>
    </div>
  );
}
```

### 5.2 集成到 App

```typescript
// src/App.tsx
import { useState } from 'react';
import { TutorialOverlay } from './components/tutorial/TutorialOverlay';

function App() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);
  
  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setHasCompletedTutorial(true);
    // 可以保存到 localStorage
    localStorage.setItem('tutorialCompleted', 'true');
  };
  
  // 检查是否已完成过教程
  useEffect(() => {
    const completed = localStorage.getItem('tutorialCompleted');
    if (completed === 'true') {
      setShowTutorial(false);
    }
  }, []);
  
  return (
    <div className="App">
      {showTutorial && (
        <TutorialOverlay onComplete={handleTutorialComplete} />
      )}
      
      {/* 其他游戏内容 */}
      <BattleFrameV2 />
    </div>
  );
}
```

---

## 六、完整集成示例

### 6.1 BattleFrameV2 集成所有改进

```typescript
// src/components/BattleFrameV2.tsx (简化示例)
import { VictoryProgress } from './battle/VictoryProgress';
import { ResourceTooltip } from './battle/ResourceTooltip';
import { LaneIndicator } from './battle/LaneIndicator';
import { PhaseGuide } from './battle/PhaseGuide';

export function BattleFrameV2({ onMenu }: BattleFrameV2Props) {
  const { state } = useDebateBattle();
  
  return (
    <div className="battle-frame">
      {/* 顶部信息栏 */}
      <header>
        {/* 胜利进度 */}
        <VictoryProgress 
          playerZhengLi={state.player.resources.zhengLi}
          enemyZhengLi={state.enemy.resources.zhengLi}
        />
        
        {/* 资源显示 */}
        <div className="resource-panel">
          <ResourceTooltip 
            resourceKey="xinZheng"
            value={state.player.resources.xinZheng}
          />
          <ResourceTooltip 
            resourceKey="lingShi"
            value={state.player.resources.lingShi}
            maxValue={state.player.resources.maxLingShi}
          />
          {/* ...其他资源 */}
        </div>
        
        {/* 阶段指引 */}
        <PhaseGuide 
          phase={state.phase}
          canAct={!state.player.plan.lockedPublic}
          suggestedAction="选择一张卡牌放置到计划区"
        />
      </header>
      
      {/* 战场 */}
      <main className="battle-field">
        {/* 敌方战场 */}
        <div className="enemy-field">
          <LaneIndicator
            laneId="left"
            controlledBy={laneControls.left.controlledBy}
            playerPower={laneControls.left.enemyPower}
            enemyPower={laneControls.left.playerPower}
            reward="控制：下回合 +1 心证"
          />
          {/* ...其他路 */}
        </div>
        
        {/* 我方战场 */}
        <div className="player-field">
          <LaneIndicator
            laneId="left"
            controlledBy={laneControls.left.controlledBy}
            playerPower={laneControls.left.playerPower}
            enemyPower={laneControls.left.enemyPower}
            reward="控制：下回合 +1 心证"
          />
          {/* ...其他路 */}
        </div>
      </main>
      
      {/* 手牌 */}
      <div className="hand-area">
        {/* 手牌显示 */}
      </div>
    </div>
  );
}
```

---

## 七、测试清单

完成集成后，请测试以下内容：

### 功能测试
- [ ] 胜利进度条正确显示
- [ ] 资源 Tooltip 悬停显示
- [ ] 三路标识正确显示控制状态
- [ ] 阶段指引随阶段变化
- [ ] 教程弹窗正常显示和跳过

### 用户体验测试
- [ ] 新手能否在 5 分钟内理解游戏目标
- [ ] 资源说明是否清晰易懂
- [ ] 三路系统是否一目了然
- [ ] 阶段操作指引是否准确

### 技术测试
- [ ] TypeScript 编译通过
- [ ] 无控制台错误
- [ ] 移动端响应式正常
- [ ] 性能无显著下降

---

## 八、后续优化方向

完成基础版本后，可以继续优化：

1. **交互式教程** - 实际出牌练习
2. **关键词图鉴** - 可随时查看
3. **战绩统计** - 跟踪学习进度
4. **AI 难度分级** - 从简单开始
5. **成就系统** - 鼓励探索机制

---

*预计实施时间：1-2 小时（基础版）*
*预期效果：新手留存率 +40%*
