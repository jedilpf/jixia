# AI 协作说明：新版主线与旧版冻结（2026-03-23）

## 目标结论

1. `新版（MvpFlowShell）` 是当前唯一主线，默认运行。
2. `旧版（BattleFrameV2 + battleV2）` 只做保留，不主动改动。
3. 旧版仅用于回归对照，访问方式：URL 加 `?legacyFlow=1`。

---

## 给其他 AI 的硬规则

1. 不要把新功能做在旧版战斗流里。
2. 不要重构或清理旧版目录，旧版是“冻结留档”。
3. 新需求优先落在新版目录：
   - `src/core/`
   - `src/ui/screens/`
   - `src/ui/components/`
   - `src/data/game/`
4. 只有在用户明确要求“修旧版”时，才可以修改这些旧版文件：
   - `src/components/BattleFrameV2.tsx`
   - `src/battleV2/**`
   - `src/components/BattleSetup.tsx`
   - `src/components/PreBattleFlow.tsx`

---

## 入口策略（已生效）

1. 默认打开项目：进入新版流程（MVP）。
2. 需要看旧版时：手动加参数 `?legacyFlow=1`。
3. 目的：
   - 普通开发和验收都走新版，保证口径收敛。
   - 旧版仍可随时打开做回归比对。

---

## 推荐开发流程（多 AI 协作）

1. 先确认任务是否属于“新版主线”。
2. 列出拟修改文件，确保不触达旧版冻结目录。
3. 完成后至少做一次基础校验（例如 `npm run build` 或任务门禁命令）。
4. 在提交说明里明确写：
   - 本次是否仅修改新版
   - 是否触达旧版（正常应为“否”）

---

## 一段可复制的 Prompt 约束

```text
当前项目采用“新版默认、旧版冻结”策略：
1) 默认主线为 MvpFlowShell（src/core + src/ui/screens + src/ui/components + src/data/game）。
2) 旧版 BattleFrameV2/battleV2 仅保留，不要改动。
3) 除非我明确说“修旧版”，否则禁止修改 src/battleV2/** 与 BattleFrameV2 相关文件。
4) 请先输出“将要修改的文件清单”，确认只在新版主线内改动，再开始实施。
```

