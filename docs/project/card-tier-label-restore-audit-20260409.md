# 卡牌等级标签恢复审计 2026-04-09

## 目标

在不破坏当前已恢复的 `170` 原始卡源 / `169` 图鉴基线前提下，恢复此前已经做过的三档卡牌展示设定：

- `一等`
- `二等`
- `三等`

## 根因

本次回溯确认，底层三档体系并没有消失：

- `src/battleV2/tierSystem.ts` 仍保留了解锁等级、配额和稀有度到档位的映射逻辑。

真正丢失的是展示层：

- `src/components/showcase/CardGrid.tsx` 不再显示档位徽记
- `src/components/showcase/CardDetail.tsx` 不再显示档位文案
- `src/components/battle/panels/CardLibraryPanel.tsx` 回退成了 `★/★★/★★★`

## 恢复策略

本次不回写 170 张卡的数据本体，也不重新手工分配档位。

统一改为：

1. 以 `src/battleV2/tierSystem.ts` 为唯一真源
2. 新增共享 helper：
   - `getTierLabel`
   - `getCardTierLabel`
3. 图鉴网格、图鉴详情、战斗图书馆全部只读 helper 输出

这样即使后续再次恢复 `showcaseCards.ts` 历史版本，也不需要重做整批卡牌标注。

## 本次落点

- `src/battleV2/tierSystem.ts`
  - 恢复清晰的中文稀有度映射
  - 新增 `一等 / 二等 / 三等` helper
  - 配额报错文案改为中文等级文案
- `src/components/showcase/CardGrid.tsx`
  - 恢复卡面左上侧等级徽章
- `src/components/showcase/CardDetail.tsx`
  - 恢复详情卡面和展开文本内的等级标记
- `src/components/battle/panels/CardLibraryPanel.tsx`
  - 恢复图书馆中的等级文案
  - 头部配额文案改为 `二等 / 三等`
  - 未解锁提示改为等级口径

## 验证

- `npx eslint src/battleV2/tierSystem.ts src/components/showcase/CardGrid.tsx src/components/showcase/CardDetail.tsx`
- `npx eslint --no-ignore src/components/battle/panels/CardLibraryPanel.tsx`

以上通过。

`npx tsc --noEmit` 仍被仓库既有问题拦截：

- `src/game/story/data/chapterMoru008.ts(2966,5)`
- `src/game/story/data/chapterMoru008.ts(3389,5)`

与本次卡牌等级标签恢复无关。
