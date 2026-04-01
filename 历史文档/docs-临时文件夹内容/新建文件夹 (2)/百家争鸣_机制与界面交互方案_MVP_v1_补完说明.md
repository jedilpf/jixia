# 《百家争鸣》MVP v1 补完说明（保持现有框架）

## 1. 本次补完目标
- 在不改动现有战斗内核（`BattleFrameV2 + battleV2 engine`）的前提下，补齐文档中“战斗前完整链路”缺口。
- 对齐文档主流程：`匹配 -> 议题投票 -> 门派四选一 -> 加载页 -> 战斗`。
- 保持既有论场（Arena）机制与结算逻辑不变。

## 2. 已补齐的链路
### 2.1 新增前置流程组件
- 新增组件：`src/components/PreBattleFlow.tsx`
- 内含五步状态：
  - `matching`：匹配中（可取消）
  - `topic_vote`：3 个议题投票，15 秒倒计时，支持超时自动锁定
  - `topic_result`：同票直入；异票在双方票中随机二选一（展示 2.2s）
  - `sect_draft`：4 门派候选，20 秒倒计时，支持超时自动锁定
  - `loading`：对局前信息展示 + 进度条

### 2.2 App 主状态机接入
- 修改：`src/App.tsx`
- 新增 `pre_battle` 页面状态，接入顺序：
  - `battle_setup -> pre_battle -> battle`
- 取消时回到 `battle_setup`，不破坏原有“返回大厅 / 重新选论场”行为。

## 3. 与战斗内核的衔接（最小改动）
### 3.1 BattleFrameV2 透传参数
- 修改：`src/components/BattleFrameV2.tsx`
- 新增可选入参：
  - `forcedTopicId`
  - `playerMainFaction`
  - `enemyMainFaction`

### 3.2 引擎支持“外部指定议题”
- 修改：`src/battleV2/engine.ts`
- `CreateBattleStateOptions` 新增 `forcedTopicId?: string`
- 初始化议题时优先使用外部指定 `topicId`，未指定时仍按原随机逻辑。

## 4. 仍保持不变的框架边界
- 不改动现有战斗相位机制（明辩 / 暗谋 / 揭示 / 结算）。
- 不改动既有牌组构建、费用和结算算法。
- 不改动四个论场的既有效果实现。
- 不改动战斗主 UI 布局与交互骨架。

## 5. 连贯性保证
- 前置链路产出的关键结果（议题、双方门派）已进入战斗初始化，避免“页面选了但战斗没用上”的断链。
- 超时逻辑与文档规则一致：有高亮则锁高亮，无高亮则随机。
- 双方允许同门派，符合文档约束。

## 6. 验证结果
- `npm run typecheck`：通过。
- `npm run build`：当前工程在现有环境下会提前中断（仅输出到 Vite transform 阶段，未给出明确报错）；与本次改动无直接类型层面冲突。

