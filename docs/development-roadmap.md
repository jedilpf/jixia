# 后续开发计划

## 当前状态

| 模块 | 完成度 | 状态 |
|------|--------|------|
| 战斗引擎 | 90% | 已优化 |
| 故事系统 | 85% | 完整 |
| UI/UX | 90% | 已优化 |
| 性能 | 90% | 已优化 |
| 可扩展性 | 85% | 已配置化 |

---

## 已完成功能 ✅

### 1. 弃牌阶段优化
- [x] 添加"智能推荐"按钮 - AI推荐最优弃牌组合
- [x] 添加"一键弃牌"按钮 - 自动选择价值最低的卡牌
- [x] 添加弃牌确认动画 - 显示即将丢弃的卡牌
- **文件**: `src/components/battle/DiscardAssistant.tsx`

### 1.2 阶段切换动画
- [x] 添加阶段名称淡入淡出动画
- [x] 添加阶段图标/颜色变化
- [x] 回合开始动画
- **文件**: `src/components/battle/PhaseTransition.tsx`

### 1.3 战斗日志增强
- [x] 添加日志筛选功能
- [x] 高亮关键事件（暴击、翻盘、终结）
- [x] 添加搜索和导出功能
- **文件**: `src/components/battle/panels/EnhancedLogDrawer.tsx`

### 2.1 存档管理UI
- [x] 创建存档选择面板
- [x] 添加存档删除/覆盖功能
- [x] 添加存档对比（时间、章节、进度）
- [x] 添加云同步开关（预留）
- **文件**: `src/ui/components/SaveSlotManager.tsx`

### 2.3 AI行动预览提示
- [x] 添加"敌方思考中..."动画
- [x] 添加AI可能意图提示（低难度模式）
- [x] 添加AI出牌回放功能
- **文件**: `src/components/battle/AIActionPreview.tsx`

### 3.1 内存泄漏修复
- [x] 创建资源追踪器
- [x] requestAnimationFrame追踪与清理
- [x] 定时器追踪与清理
- [x] 事件监听器追踪与清理
- **文件**: `src/utils/performanceMonitor.ts`

### 3.2 渲染优化
- [x] 虚拟滚动组件
- [x] 手牌位置计算缓存
- [x] 防抖/节流工具
- [x] 可见性检测
- **文件**: `src/utils/renderOptimization.tsx`

### 3.3 资源加载优化
- [x] 图片加载错误处理
- [x] 重试机制
- [x] 章节懒加载指示器
- [x] 资源预加载
- **文件**: `src/utils/resourceLoader.tsx`

### 4.1 配置化改造
- [x] 布局尺寸配置化
- [x] 战斗时长配置化
- [x] AI延迟配置化
- [x] 动画时长配置化
- **文件**: `src/config/gameConfig.ts`

---

## 第一阶段：体验优化（已完成）

### 1.1 弃牌阶段优化 ⭐
**痛点**：手牌超限时需逐张选择弃牌，时间压力大

**方案**：
- [x] 添加"智能推荐"按钮 - AI推荐最优弃牌组合
- [x] 添加"一键弃牌"按钮 - 自动选择价值最低的卡牌
- [x] 添加弃牌确认动画 - 显示即将丢弃的卡牌

**文件**：
- `src/battleV2/engine.ts` - 弃牌逻辑
- `src/components/battle/EnhancedCardBattleView.tsx` - UI

### 1.2 阶段切换动画
**痛点**：明辩→暗谋→揭示→结算各阶段切换无动画

**方案**：
- [x] 添加阶段名称淡入淡出动画
- [x] 添加阶段图标/颜色变化
- [x] 替换手动"结束回合"按钮为自动切换

**文件**：
- `src/components/battle/EnhancedCardBattleView.tsx`
- `src/components/battle/animations/AnimationComponents.tsx`

### 1.3 战斗日志增强
**痛点**：日志信息密度低，缺少伤害数值动画

**方案**：
- [x] 添加伤害/护盾数值飘字动画
- [x] 高亮关键事件（暴击、翻盘、终结）
- [x] 添加日志筛选功能

**文件**：
- `src/components/battle/EnhancedCardBattleView.tsx`
- 新增 `src/components/battle/BattleLogEnhanced.tsx`

---

## 第二阶段：功能完善（已完成）

### 2.1 存档管理UI ⭐
**缺失**：多存档槽位无管理界面

**方案**：
- [x] 创建存档选择面板
- [x] 添加存档删除/覆盖功能
- [x] 添加存档对比（时间、章节、进度）
- [x] 添加云同步开关（预留）

**文件**：
- 新增 `src/components/SaveSlotManager.tsx`
- 扩展 `src/utils/SaveManager.ts`

### 2.2 卡牌图鉴高级筛选
**缺失**：只有基础搜索

**方案**：
- [x] 添加派系筛选下拉框
- [x] 添加稀有度筛选
- [x] 添加效果类型筛选
- [x] 添加收藏进度统计面板

**文件**：
- `src/components/showcase/CardGrid.tsx`
- `src/components/showcase/CollectionComponents.tsx`

### 2.3 AI行动预览提示
**痛点**：AI行动无预判提示

**方案**：
- [x] 添加"敌方思考中..."动画
- [x] 添加AI可能意图提示（低难度模式）
- [x] 添加AI出牌回放功能

**文件**：
- `src/battleV2/useDebateBattle.ts`
- `src/components/battle/AIActionPreview.tsx`

---

## 第三阶段：性能优化（已完成）

### 3.1 内存泄漏修复
- [x] StoryEngine监听器清理
- [x] requestAnimationFrame取消
- [x] PlayerLevelSystem监听器管理

### 3.2 渲染优化
- [x] 手牌位置计算缓存
- [x] 社区状态增量合并
- [x] 卡牌图鉴虚拟滚动

### 3.3 资源加载优化
- [x] 图片加载错误处理
- [x] 章节懒加载指示器
- [x] 音频自动播放提示

---

## 第四阶段：可扩展性（已完成）

### 4.1 配置化改造
- [x] 布局尺寸配置化
- [x] 战斗时长配置化
- [x] AI延迟配置化
- [x] 动画时长配置化

### 4.2 数据源统一
- [x] 清理legacy战斗系统
- [x] 统一卡牌数据源
- [x] 移除硬编码用户ID

### 4.3 国际化完善
- [x] 故事内容翻译架构
- [x] 错误提示翻译
- [x] 日期/数字格式化

---

## 优先级标记

⭐ = 高优先级，本周完成
📍 = 中优先级，下周完成
💡 = 低优先级，后续迭代

---

## 新增工具文件索引

| 文件 | 用途 |
|------|------|
| `src/utils/performanceMonitor.ts` | 内存泄漏防护与性能监控 |
| `src/utils/renderOptimization.tsx` | 渲染性能优化工具 |
| `src/utils/resourceLoader.tsx` | 资源加载优化 |
| `src/config/gameConfig.ts` | 游戏配置系统 |
| `src/components/battle/AIActionPreview.tsx` | AI行动预览 |
| `src/components/battle/DiscardAssistant.tsx` | 弃牌辅助 |
| `src/components/battle/PhaseTransition.tsx` | 阶段切换动画 |
| `src/components/battle/panels/EnhancedLogDrawer.tsx` | 增强日志 |
| `src/ui/components/SaveSlotManager.tsx` | 存档管理 |