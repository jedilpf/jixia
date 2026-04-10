# 兼采楼重复卡图修复 2026-04-10

## 问题

图鉴中以下三张卡显示为同一张图：

- `jianai4` `学贯通匠`
- `jianai5` `综合推论`
- `jianai6` `博闻强记`

## 根因

不是加载链路出错，而是物理文件本身完全重复。

修复前检查结果：

- `public/assets/cards/jianai4.png`
- `public/assets/cards/jianai5.png`
- `public/assets/cards/jianai6.png`

三者：

- 文件大小一致
- 修改时间一致
- `SHA256` 完全一致

因此图鉴一定会显示成同一张图。

## 处理方式

本次没有改卡牌数据，也没有改现有卡图 fallback 逻辑。

直接替换了这三张物理 PNG，使其分别基于同门派现有兼采楼原画生成不同变体：

- `jianai4.png` 基于 `pangtong.png`
- `jianai5.png` 基于 `jianai.png`
- `jianai6.png` 基于 `jianai3.png`

处理包含：

- 重新取景裁切
- 轻度色调区分
- 保持 `1024x1024` 输出

## 结果

修复后这三张文件的 `SHA256` 均不同，图鉴中不再撞图。

## 备注

当前 `src/utils/assets.ts` 已正确把 `jianai2-6` 走 `.png`，所以这次不需要改代码映射。
