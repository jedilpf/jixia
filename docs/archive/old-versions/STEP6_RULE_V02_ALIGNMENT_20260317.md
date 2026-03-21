# Step6 规则规范 v0.2 对齐记录（2026-03-17）

## 目标
- 将 `百家争鸣_核心战斗规则规范_v0.2` 纳入项目正式文档。
- 先完成“设定层/规则层”对齐：不改旧版主战斗渲染框架，仅改 `core + data + ui/newFlow`。

## 已接入文档
1. `docs/百家争鸣_核心战斗规则规范_v0.2.md`（新增）
2. `docs/对战系统文档索引.md`（将 v0.2 提升为 A 区优先文档）

## 本步改动文件
1. `src/core/types.ts`
- 新增议题方向：`ritual/economy/strategy`
- 战斗阶段改为 7 段：`round_start -> hidden_submit -> submission_lock -> reveal -> public_effect -> zone_resolve -> issue_burst_check`
- 玩家战斗区改为队列：`mainQueue/sideQueue`
- 议题状态改为单中央议题结构（含 `heat/directionScore/burst`）

2. `src/data/game/balance.ts`
- 每轮出牌上限：`3`
- 每区上限：`3`
- 牌组规模：`24`（门派 12 + 通用 12）
- 议题引爆检查轮次：`每 3 轮`
- 引爆阈值：`100 / 70`
- 候选议题数：`1`

3. `src/data/game/gameConfig.ts`
- 新增并对齐 v0.2 所需配置字段：`deckSize/factionDeckCount/neutralDeckCount/maxCardsPerTurn/maxCardsPerZone/burstCheckEvery/...`

4. `src/data/game/issues.ts`
- 议题改为“中央议题种子”形式，带方向标签说明

5. `src/data/game/cards.ts`
- 在保留原卡数据基础上做兼容映射：补齐 `type/publicPower/issueTags/comboTags`
- 旧 `issueTag` 映射到 `ritual/economy/strategy`

6. `src/core/issueSystem.ts`
- 重写单议题推进逻辑
- 新增 `burstScore` 计算与引爆判定（直爆/概率爆）

7. `src/core/battleResolver.ts`
- 改为主议/旁议双区独立结算
- 增加简化组合加成（同门派/同标签/顺序连锁）

8. `src/core/gameEngine.ts`
- 对齐暗辩提交（每轮最多 3 张）
- 主议胜者 +1 大势，败方主议卡牌 -1 根基
- 旁议胜负用于议题推进
- 每 3 轮执行议题引爆检查

9. `src/core/phaseMachine.ts`
- 更新阶段序列与中文标签

10. `src/core/selectors.ts`
11. `src/app/selectors.ts`
- 适配新议题结构与新阶段

12. `src/ui/components/IssueBar.tsx`
13. `src/ui/components/SlotView.tsx`
14. `src/ui/screens/BattleScreen.tsx`
15. `src/ui/screens/MvpFlowShell.tsx`
- 适配“单议题 + 每区多牌”展示

## 影响边界
- 本步主要影响 `newFlow` 的规则与展示链路。
- 旧主框架（`BattleFrameV2` 主流程）未做破坏性替换。

## 待继续
- 明辩揭示动画与暗辩背面牌视觉尚是占位实现。
- 引爆强效果目前为简化版（主议胜方额外 +1 大势），后续可按策划细化。
