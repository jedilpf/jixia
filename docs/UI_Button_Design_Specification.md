# 《谋天下·问道百家》游戏界面按钮设计规范

> Author: Trae AI

## 文档信息
- **版本**: v1.0
- **创建日期**: 2026-03-23
- **主题风格**: 稷下青铜机关城 (Jixia Bronze Mechanism City)
- **设计目标**: 为所有AI模型提供清晰、可实现的按钮设计规范

---

## 一、设计原则与视觉规范

### 1.1 核心视觉主题

基于"稷下青铜机关城"美学，按钮设计遵循以下核心元素：

| 元素 | 象征意义 | 视觉表现 |
|------|----------|----------|
| 炉火 (Furnace Fire) | 能量、激情 | 橙红色光晕、火星粒子 |
| 齿轮 (Gears) | 逻辑、推演 | 青铜机械纹理、旋转动画 |
| 铜绿 (Patina) | 历史、传承 | 风化青铜质感 |
| 竹简 (Bamboo Slips) | 知识、策略 | 纹理背景、卷轴形态 |

### 1.2 色彩系统

#### 主色调
| 名称 | Hex值 | 用途 |
|------|-------|------|
| Bronze Base (青铜基色) | `#8B7355` | 主UI元素、边框 |
| Patina Green (铜绿) | `#4A7C6F` | 强调色、高亮、次要元素 |
| Furnace Orange (炉火橙) | `#E85D04` | 能量、行动、警告 |
| Cinnabar Red (朱砂红) | `#8B2635` | 危险、伤害、敌方指示 |

#### 辅助色
| 名称 | Hex值 | 用途 |
|------|-------|------|
| New Bamboo (新竹色) | `#D4C5A9` | 文本、标签、内容 |
| Dark Slate (深石板) | `#1a1a2e` | 背景、面板 |
| Deep Bronze (深青铜) | `#5d4037` | 阴影、深度 |
| Bright Gold (亮金色) | `#D4A017` | 稀有度、特殊物品 |

#### 背景色
| 名称 | Hex值 | 用途 |
|------|-------|------|
| Canvas Dark | `#0f0f1a` | 主背景 |
| Panel Dark | `#1a1a2e` | 卡片背景 |
| Overlay | `rgba(0,0,0,0.7)` | 模态框、遮罩层 |

### 1.3 按钮类型定义

#### Type A: 主行动按钮 (Primary Action Button)
- **用途**: 核心操作（开始游戏、确认选择、结束回合）
- **视觉**: 渐变背景 + 发光边框 + 悬停放大
- **颜色**: 炉火橙渐变 `#7c3a00` → `#4a1a00`

#### Type B: 次要按钮 (Secondary Button)
- **用途**: 辅助操作（返回、取消、查看详情）
- **视觉**: 深色背景 + 细边框 + 悬停高亮
- **颜色**: 深石板 `#1a1a2e` + 青铜边框

#### Type C: 危险/负面按钮 (Danger Button)
- **用途**: 破坏性操作（投降、退出、删除）
- **视觉**: 红色系渐变 + 警告图标
- **颜色**: 朱砂红系 `#8B2635` → `#5d1a22`

#### Type D: 图标按钮 (Icon Button)
- **用途**: 快捷操作（设置、邮件、任务）
- **视觉**: 圆形/方形 + 图标 + 悬停反馈
- **尺寸**: 48px × 48px 标准

#### Type E: 文字链接按钮 (Text Link)
- **用途**: 轻量级导航（查看规则、了解更多）
- **视觉**: 下划线 + 颜色变化
- **颜色**: 铜绿 `#4A7C6F` → 亮金 `#D4A017`

---

## 二、界面按钮详细设计

### 2.1 主菜单界面 (HomeScreen / MainMenu)

#### 2.1.1 主功能按钮组

| 按钮ID | 按钮名称 | 类型 | 位置坐标 | 尺寸 | 功能描述 |
|--------|----------|------|----------|------|----------|
| BTN-MAIN-001 | 开始对战 | Type A | 主内容区中央偏下 | 宽度288px, 自适应高度 | 进入AI对战匹配流程 |
| BTN-MAIN-002 | 本地双人 | Type A | BTN-MAIN-001下方 | 宽度288px, 自适应高度 | 进入本地双人模式 |
| BTN-MAIN-003 | 规则说明 | Type B | 第二行左侧 | 宽度136px, 高度40px | 打开游戏规则说明 |
| BTN-MAIN-004 | 开发测试入口 | Type B | 第二行右侧 | 宽度136px, 高度40px | 进入开发测试界面 |

**视觉规范 (BTN-MAIN-001/002)**:
```
背景: linear-gradient(180deg, #7c3a00 0%, #4a1a00 60%, #2e1000 100%)
边框: 1.5px solid rgba(232,93,4,0.7)
圆角: 6px
文字: #fef3c7, 16px, font-weight: 800, font-family: serif
悬停: 背景亮度+10%, 边框发光, scale(1.04)
点击: scale(0.97)
```

#### 2.1.2 顶部导航按钮

| 按钮ID | 按钮名称 | 类型 | 位置坐标 | 尺寸 | 功能描述 |
|--------|----------|------|----------|------|----------|
| BTN-NAV-001 | 活动中心 | Type D | 右上角第1个 | 48px × 48px | 打开活动面板 |
| BTN-NAV-002 | 修行任务 | Type D | 右上角第2个 | 48px × 48px | 打开任务列表 |
| BTN-NAV-003 | 百灵鸟传书 | Type D | 右上角第3个 | 48px × 48px | 打开邮件系统 |
| BTN-NAV-004 | 机枢设置 | Type D | 右上角第4个 | 48px × 48px | 打开设置面板 |

**视觉规范 (BTN-NAV-001~004)**:
```
背景: rgba(0,0,0,0.4) + backdrop-blur
边框: 1px solid rgba(212,165,32,0.3)
圆角: 50% (圆形)
图标: 24px, 颜色 #d4a520
悬停: 背景 rgba(0,0,0,0.6), 图标 #f5e6b8, scale(1.05)
```

#### 2.1.3 货币操作按钮

| 按钮ID | 按钮名称 | 类型 | 位置坐标 | 尺寸 | 功能描述 |
|--------|----------|------|----------|------|----------|
| BTN-COIN-001 | 获取铜钱 | Type D | 铜钱显示右侧 | 32px × 32px | 打开铜钱商店 |
| BTN-JADE-001 | 获取机关玉 | Type D | 机关玉显示右侧 | 32px × 32px | 打开机关玉商店 |

**视觉规范**:
```
背景: linear-gradient(to bottom, #b8860b, #8B5e00)
边框: 1px solid #d4a520
圆角: 50%
文字: "+", 白色, 16px, font-weight: bold
悬停: brightness(1.25)
```

---

### 2.2 议题选择界面 (TopicScreen)

| 按钮ID | 按钮名称 | 类型 | 位置坐标 | 尺寸 | 功能描述 |
|--------|----------|------|----------|------|----------|
| BTN-TOPIC-001 | 继续 | Type A | 面板底部中央 | 自适应宽度, 高度36px | 确认议题，进入门派选择 |

**视觉规范**:
```
背景: linear-gradient(to bottom, #4a2c17, #2a1a0f)
边框: 1px solid #b88a53
圆角: 8px
文字: #f6e4c3, 14px, font-weight: 600
悬停: 背景 #5a3c27
```

---

### 2.3 门派选择界面 (FactionPickScreen)

| 按钮ID | 按钮名称 | 类型 | 位置坐标 | 尺寸 | 功能描述 |
|--------|----------|------|----------|------|----------|
| BTN-FACTION-001 | 确认门派 | Type A | 面板底部右侧 | 自适应宽度, 高度36px | 确认选择的门派 |

**状态说明**:
- **禁用状态**: 未选择门派时，opacity: 0.45, cursor: not-allowed
- **启用状态**: 选择门派后，正常显示

---

### 2.4 匹配界面 (MatchScreen)

| 按钮ID | 按钮名称 | 类型 | 位置坐标 | 尺寸 | 功能描述 |
|--------|----------|------|----------|------|----------|
| BTN-MATCH-001 | 继续 | Type A | 面板底部中央 | 自适应宽度, 高度36px | 跳过匹配动画，进入战斗 |

---

### 2.5 加载界面 (LoadingScreen)

| 按钮ID | 按钮名称 | 类型 | 位置坐标 | 尺寸 | 功能描述 |
|--------|----------|------|----------|------|----------|
| BTN-LOAD-001 | 进入战斗 | Type A | 面板底部 | 自适应宽度, 高度36px | 完成加载，进入战斗场景 |

---

### 2.6 战斗界面 (BattleScreen)

#### 2.6.1 核心战斗按钮

| 按钮ID | 按钮名称 | 类型 | 位置坐标 | 尺寸 | 功能描述 |
|--------|----------|------|----------|------|----------|
| BTN-BTL-001 | 鸣金 (结束回合) | Type A | 右侧控制面板底部 | 宽度120px, 高度60px | 结束当前玩家回合 |
| BTN-BTL-002 | 暗辩提交到主议 | Type B | 右侧控制面板中部 | 自适应宽度, 高度32px | 将选中卡牌提交到主议区 |
| BTN-BTL-003 | 暗辩提交到旁议 | Type B | BTN-BTL-002下方 | 自适应宽度, 高度32px | 将选中卡牌提交到旁议区 |
| BTN-BTL-004 | 锁定并结算本轮 | Type A | BTN-BTL-003下方 | 自适应宽度, 高度32px | 锁定选择并结算当前回合 |

**BTN-BTL-001 (鸣金按钮) 详细规范**:
```
位置: absolute, 根据scale动态计算
尺寸: width: 100px * scale, height: 50px * scale
背景: 
  - 启用: linear-gradient(180deg, #7c3a00 0%, #4a1a00 60%, #2e1000 100%)
  - 禁用: linear-gradient(180deg, #2a2018 0%, #1a1410 100%)
边框: 
  - 启用: rgba(232,93,4,0.7)
  - 禁用: rgba(100,80,60,0.4)
圆角: 6px

内部结构:
  - 顶部齿轮图标: ⚙, 14px, 旋转动画
  - 主文字: "鸣金"/"论道中"/"等待", 11px, font-weight: 800
  - 副文字: "收兵"/"···", 8px

动画:
  - 启用时: pulse发光动画 (2s ease-in-out infinite)
  - AI思考时: 进度条扫描动画
  - 齿轮: 4s linear infinite 旋转

交互:
  - 悬停: scale(1.04), 播放悬停音效
  - 点击: scale(0.97), 播放点击音效
  - 禁用: opacity: 0.65, cursor: not-allowed
```

#### 2.6.2 辅助功能按钮

| 按钮ID | 按钮名称 | 类型 | 位置坐标 | 尺寸 | 功能描述 |
|--------|----------|------|----------|------|----------|
| BTN-BTL-005 | 认输 | Type C | 左下角 | min-width: 80px, height: 34px | 投降结束战斗 |
| BTN-BTL-006 | 设置 | Type D | 左上角 | 自适应, 高度32px | 打开战斗设置 |
| BTN-BTL-007 | 战斗日志 | Type D | 左侧边栏 | 40px × 40px | 展开/收起战斗日志 |
| BTN-BTL-008 | 英雄技能 | Type D | 英雄头像旁 | 70px × 70px | 使用英雄技能 |

**BTN-BTL-005 (认输按钮) 详细规范**:
```
位置: absolute, left: 20px, bottom: 20px (根据scale)
尺寸: min-width: 80px * scale, height: 34px * scale
背景: linear-gradient(135deg, rgba(42,27,18,0.7), rgba(23,14,8,0.75))
边框: 1px solid rgba(139,115,85,0.4)
圆角: 6px
图标: 🏳 (投降旗帜)
文字: "认输", 13px, font-family: serif, color: #c8ab7e

悬停效果:
  - 背景: linear-gradient(135deg, rgba(61,37,22,0.85), rgba(31,18,10,0.9))
  - 边框: rgba(139,115,85,0.7)
  - transform: translateY(-2px)
```

**BTN-BTL-006 (设置按钮) 详细规范**:
```
位置: absolute, top: 16px, left: 16px
尺寸: 自适应, height: 32px
背景: 
  - 默认: linear-gradient(135deg, rgba(16,10,4,0.7), rgba(26,18,8,0.75))
  - 悬停: linear-gradient(135deg, rgba(26,14,4,0.85), rgba(40,24,8,0.9))
边框: 
  - 默认: rgba(139,115,85,0.4)
  - 悬停: rgba(139,115,85,0.7)
圆角: 6px
图标: ⚙
文字: "设置", 14px, font-family: serif

悬停效果:
  - scale(1.05)
  - 阴影: 0 0 12px rgba(139,115,85,0.4)
```

**BTN-BTL-007 (战斗日志按钮) 详细规范**:
```
容器: 左侧边栏, width: 48px
按钮: width: 40px, height: 40px
背景: rgba(42,35,24,0.8)
边框: 1px solid rgba(92,77,58,0.5)
圆角: 8px
图标: SVG文档图标, 16px, color: #8a7a6a
文字: "日志", 8px, 位于图标下方

未读标记:
  - 位置: absolute, top: -4px, right: -4px
  - 背景: linear-gradient(to right, #c9725a, #a85a4a)
  - 圆角: 50%
  - 动画: ping (脉冲效果)
```

**BTN-BTL-008 (英雄技能按钮) 详细规范**:
```
位置: absolute, 根据scale和坐标动态定位
尺寸: 70px × 70px (根据scale)
背景:
  - 可用: bg-purple-800/80
  - 已用: bg-gray-800/60
  - 不可用时: bg-gray-800/60
边框: 2px solid
  - 可用: border-purple-400
  - 已用: border-gray-600
圆角: 8px

内部结构:
  - 技能名称: 12px, font-weight: bold, 居中
  - 法力消耗: 14px, font-weight: bold
    - 可用: text-yellow-400
    - 不可用: text-gray-400
  - 已使用标记: "已使用"文字

选中状态: ring-2 ring-yellow-400
```

---

### 2.7 本地双人模式界面

#### 2.7.1 本地双人准备界面 (LocalBattleSetupScreen)

| 按钮ID | 按钮名称 | 类型 | 位置坐标 | 尺寸 | 功能描述 |
|--------|----------|------|----------|------|----------|
| BTN-LOCAL-001 | 返回首页 | Type B | 面板底部右侧 | 自适应宽度, 高度36px | 返回主菜单 |

#### 2.7.2 玩家交接遮罩界面 (PlayerHandoverScreen)

| 按钮ID | 按钮名称 | 类型 | 位置坐标 | 尺寸 | 功能描述 |
|--------|----------|------|----------|------|----------|
| BTN-HANDOVER-001 | 确认交接 | Type A | 遮罩中央 | 宽度200px, 高度50px | 确认玩家身份，继续游戏 |

**视觉规范**:
```
背景: linear-gradient(180deg, #7c3a00 0%, #4a1a00 100%)
边框: 2px solid rgba(212,165,32,0.8)
圆角: 8px
文字: "请交给玩家X", 18px, font-weight: bold
动画: 脉冲发光，提示玩家操作
```

---

### 2.8 结果界面 (ResultScreen)

| 按钮ID | 按钮名称 | 类型 | 位置坐标 | 尺寸 | 功能描述 |
|--------|----------|------|----------|------|----------|
| BTN-RESULT-001 | 返回首页 | Type B | 面板底部 | 自适应宽度, 高度32px | 返回主菜单 |
| BTN-RESULT-002 | 再来一局 | Type A | BTN-RESULT-001旁边 | 自适应宽度, 高度32px | 重新开始游戏 |

---

### 2.9 过渡/转场界面 (TransitionScreen)

| 按钮ID | 按钮名称 | 类型 | 位置坐标 | 尺寸 | 功能描述 |
|--------|----------|------|----------|------|----------|
| BTN-TRANS-001 | 跳过 | Type E | 右下角 | 文本形式 | 跳过过渡动画 |

**视觉规范**:
```
位置: absolute, bottom: 32px, right: 40px
文字: "点击或 ESC 跳过", 13px, font-family: serif
颜色: rgba(212,197,169,0.55)
动画: 闪烁动画 (opacity 0.3 → 0.85)
触发: 点击屏幕任意位置或按ESC键
延迟显示: 600ms后显示
```

---

### 2.10 系统弹窗按钮 (SystemModal)

| 按钮ID | 按钮名称 | 类型 | 位置坐标 | 尺寸 | 功能描述 |
|--------|----------|------|----------|------|----------|
| BTN-MODAL-001 | 关闭 | Type D | 弹窗标题栏右侧 | 32px × 32px | 关闭弹窗 |
| BTN-MODAL-002 | 领取附件 | Type A | 邮件弹窗底部 | 全宽, 高度36px | 领取邮件奖励 |

**BTN-MODAL-001 (关闭按钮) 详细规范**:
```
位置: 弹窗标题栏右上角
尺寸: 32px × 32px
背景: rgba(0,0,0,0.3)
边框: 1px solid rgba(212,165,32,0.2)
圆角: 50%
文字: "×", 20px, color: #a7c5ba

悬停效果:
  - 背景: rgba(212,165,32,0.2)
  - 文字: #f5e6b8
```

---

## 三、按钮交互规范

### 3.1 通用交互状态

| 状态 | 视觉表现 | 音效 |
|------|----------|------|
| 默认 (Default) | 标准样式 | 无 |
| 悬停 (Hover) | 亮度+10%, scale(1.02~1.05), 边框高亮 | playHover() |
| 按下 (Active/Pressed) | scale(0.95~0.97), 亮度-5% | playClick() |
| 禁用 (Disabled) | opacity: 0.45~0.65, cursor: not-allowed | 无 |
| 聚焦 (Focus) | outline: 2px solid rgba(212,165,32,0.5) | 无 |

### 3.2 音效映射

所有按钮使用统一的音效管理器 `uiAudio`:

```typescript
// 悬停音效
onMouseEnter={() => uiAudio.playHover()}

// 点击音效
onClick={() => uiAudio.playClick()}
```

### 3.3 动画时间规范

| 动画类型 | 持续时间 | 缓动函数 |
|----------|----------|----------|
| 悬停过渡 | 200ms | ease-out |
| 点击反馈 | 150ms | ease-in-out |
| 发光脉冲 | 2000ms | ease-in-out infinite |
| 齿轮旋转 | 4000ms | linear infinite |
| 模态框出现 | 300ms | cubic-bezier(0.175,0.885,0.32,1.275) |

---

## 四、响应式适配规范

### 4.1 缩放机制

战斗界面按钮使用 `scale` 参数进行响应式适配:

```typescript
// 基础尺寸 (scale = 1 时的尺寸)
const baseWidth = 100;
const baseHeight = 50;

// 实际渲染尺寸
const actualWidth = baseWidth * scale;
const actualHeight = baseHeight * scale;
```

### 4.2 移动端适配

| 元素 | 桌面端 | 移动端 (<768px) |
|------|--------|-----------------|
| 按钮间距 | 20px | 12px |
| 按钮高度 | 40-50px | 44-56px (增大触控区域) |
| 图标尺寸 | 24px | 20px |
| 字体大小 | 14-16px | 12-14px |

---

## 五、实现代码模板

### 5.1 Type A 主行动按钮模板

```tsx
import { uiAudio } from '@/utils/audioManager';

interface PrimaryButtonProps {
  label: string;
  subLabel?: string;
  disabled?: boolean;
  onClick: () => void;
  scale?: number;
}

export function PrimaryButton({ 
  label, 
  subLabel, 
  disabled = false, 
  onClick,
  scale = 1 
}: PrimaryButtonProps) {
  return (
    <button
      onClick={() => { uiAudio.playClick(); onClick(); }}
      disabled={disabled}
      onMouseEnter={() => !disabled && uiAudio.playHover()}
      className="relative overflow-hidden rounded-lg transition-all duration-200"
      style={{
        background: disabled 
          ? 'linear-gradient(180deg, #2a2018 0%, #1a1410 100%)'
          : 'linear-gradient(180deg, #7c3a00 0%, #4a1a00 60%, #2e1000 100%)',
        border: `${1.5 * scale}px solid ${disabled ? 'rgba(100,80,60,0.4)' : 'rgba(232,93,4,0.7)'}`,
        opacity: disabled ? 0.65 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span style={{ 
        color: '#fef3c7', 
        fontSize: `${16 * scale}px`,
        fontWeight: 800,
        fontFamily: 'serif'
      }}>
        {label}
      </span>
      {subLabel && (
        <span style={{ 
          color: 'rgba(244,162,97,0.7)', 
          fontSize: `${12 * scale}px` 
        }}>
          {subLabel}
        </span>
      )}
    </button>
  );
}
```

### 5.2 Type D 图标按钮模板

```tsx
import { uiAudio } from '@/utils/audioManager';
import { useState } from 'react';

interface IconButtonProps {
  icon: string;
  label?: string;
  onClick: () => void;
  badge?: number;
}

export function IconButton({ icon, label, onClick, badge }: IconButtonProps) {
  const [hover, setHover] = useState(false);
  
  return (
    <button
      onClick={() => { uiAudio.playClick(); onClick(); }}
      onMouseEnter={() => { uiAudio.playHover(); setHover(true); }}
      onMouseLeave={() => setHover(false)}
      className="relative flex items-center justify-center rounded-full transition-all duration-200"
      style={{
        width: '48px',
        height: '48px',
        background: hover ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
        border: `1px solid ${hover ? 'rgba(212,165,32,0.5)' : 'rgba(212,165,32,0.3)'}`,
        backdropFilter: 'blur(8px)',
        transform: hover ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <span style={{ fontSize: '24px', color: hover ? '#f5e6b8' : '#d4a520' }}>
        {icon}
      </span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}
```

---

## 六、按钮命名规范

### 6.1 ID命名规则

```
BTN-{界面}-{序号}

界面标识:
- MAIN: 主菜单
- NAV: 顶部导航
- COIN/JADE: 货币
- TOPIC: 议题选择
- FACTION: 门派选择
- MATCH: 匹配
- LOAD: 加载
- BTL: 战斗
- LOCAL: 本地双人
- HANDOVER: 交接遮罩
- RESULT: 结果
- TRANS: 过渡
- MODAL: 弹窗
```

### 6.2 组件命名规则

```
{功能}Button.tsx

示例:
- EndTurnButton.tsx
- SurrenderButton.tsx
- SettingsButton.tsx
- HeroPowerButton.tsx
```

---

## 七、文件位置索引

| 按钮组件 | 文件路径 |
|----------|----------|
| EndTurnButton | `src/components/battle/EndTurnButton.tsx` |
| SurrenderButton | `src/components/battle/SurrenderButton.tsx` |
| SettingsButton | `src/components/battle/SettingsButton.tsx` |
| HeroPowerButton | `src/components/battle/HeroPowerButton.tsx` |
| LogButton | `src/components/battle/controls/LogButton.tsx` |
| MainMenu | `src/components/MainMenu.tsx` |
| HomeScreen | `src/ui/screens/HomeScreen.tsx` |
| BattleScreen | `src/ui/screens/BattleScreen.tsx` |
| TopicScreen | `src/ui/screens/TopicScreen.tsx` |
| FactionPickScreen | `src/ui/screens/FactionPickScreen.tsx` |
| MatchScreen | `src/ui/screens/MatchScreen.tsx` |
| LoadingScreen | `src/ui/screens/LoadingScreen.tsx` |
| LocalBattleSetupScreen | `src/ui/screens/LocalBattleSetupScreen.tsx` |
| ResultScreen | `src/ui/screens/ResultScreen.tsx` |
| TransitionScreen | `src/components/TransitionScreen.tsx` |

---

## 八、注意事项与最佳实践

### 8.1 性能优化

1. **避免不必要的重渲染**: 使用 `React.memo` 包裹按钮组件
2. **动画性能**: 优先使用 `transform` 和 `opacity` 进行动画
3. **事件节流**: 快速点击时使用防抖/节流处理

### 8.2 可访问性

1. **键盘导航**: 确保所有按钮可通过 Tab 键聚焦
2. **屏幕阅读器**: 添加适当的 `aria-label` 属性
3. **高对比度**: 禁用状态下的按钮仍需保持可读性

### 8.3 常见陷阱

1. **z-index管理**: 弹窗按钮需确保在遮罩层之上 (z-index: 9999+)
2. **事件冒泡**: 弹窗内按钮需阻止事件冒泡到遮罩层
3. **移动端触控**: 确保触控目标不小于 44×44px

---

**文档结束**

如有任何疑问或需要进一步澄清的地方，请参考项目中的实际实现代码或联系设计团队。
