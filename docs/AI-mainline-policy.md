# AI 协作说明：新版主线与旧版冻结（2026-03-23）

> Author: Trae AI

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

---

## 冲突仲裁机制（强制）

当出现以下情况时，任何 AI 都不得直接实现：

1. 两个 AI 给出互相冲突的方案。
2. 同一模块出现“接口设计 / 实现方式 / 数据结构”冲突。
3. 对用户需求理解不一致，且会影响代码行为。

执行规则：

1. 先填写 `docs/standards/conflict-arbitration-template.md`。
2. 在表中写明双方观点、仲裁依据、最终方案、实施要求。
3. 信息不全时，必须先向用户提问确认，再改动文件。
4. 仲裁结论未明确前，禁止进入实现阶段。

---

## 2026-03-28 增补：Codex 水印与任务留档（强制）

> Author: Codex AI

适用范围：跨模块、整项目完善、或影响主线协作流程的任务。

1. 任何这类任务开始前，必须先新增一份“任务意图留档”文档。  
   - 路径：`docs/project/record/task-intent-<date>-<task-id>.md`
   - 模板：`docs/standards/task-intent-log-template.md`
2. 任何这类任务的正式交付文档，必须带水印头。  
   - 最小水印格式：`Author: Codex AI`、`Watermark ID`、`Task ID`、`Date`
3. 未写任务意图留档，不得进入实现或批量修改阶段。
4. 未加水印的正式交付文档，不得视为可验收产物。
5. 该规则对其他 AI 同样生效；如冲突，先走仲裁模板再执行。

