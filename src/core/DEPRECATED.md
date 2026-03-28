# ⚠️ DEPRECATED — src/core/

This directory contains the **first-generation game engine prototype** and is no longer in active use.

## 现状
- `gameEngine.ts`：第一代引擎，状态模型为 `GameState / PlayerState`，已被 `battleV2` 取代
- `battleResolver.ts`：第一代战斗结算器
- `issueSystem.ts`：第一代议题系统
- `phaseMachine.ts`：第一代阶段状态机
- `selectors.ts`：第一代选择器
- `types.ts`：第一代类型定义

## 请使用
- 游戏引擎：`src/battleV2/engine.ts`
- 类型定义：`src/battleV2/types.ts`

## 注意
请勿将此目录下的任何模块引入新功能代码。这些文件仅作为历史参考保留。
