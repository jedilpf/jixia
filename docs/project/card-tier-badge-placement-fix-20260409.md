# 卡牌等级徽章位置修正 2026-04-09

## 修正原因

上一轮虽然恢复了 `一等 / 二等 / 三等` 文案，但放置方式不对：

- 错误做法：在卡面左上角额外加一个矩形等级条
- 正确做法：把等级文案放回原有的黄色圆形徽章

这条要求与历史任务约束一致：

- `TASK-20260404-139-card-tier-badge.json`
  - `Top-left yellow badge in card showcase cards displays the tier label.`

## 本次修正

- `src/components/showcase/CardGrid.tsx`
  - 移除外置矩形等级条
  - 左上黄色圆形徽章改为显示 `一等 / 二等 / 三等`
  - 费用改为底部信息徽记显示

- `src/components/showcase/CardDetail.tsx`
  - 移除左上外置矩形等级条
  - 左上黄色圆形徽章改为显示 `一等 / 二等 / 三等`
  - 费用改为详情信息区显示

## 验证

- 等级文案不再额外挂在卡面边缘
- `一等 / 二等 / 三等` 直接出现在左上黄色圆徽章中
