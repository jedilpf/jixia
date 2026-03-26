# AI 协作说明：单入口主线收口（2026-03-26）

## 目标结论

1. `src/App.tsx -> MvpFlowShell` 是当前唯一默认入口。
2. 当前战斗主线为 `src/battleV2/**`（由 MVP 流程驱动）。
3. 历史链路仅用于对照，不作为主线入口。

---

## 给其他 AI 的硬规则

1. 不要新增并行入口分流逻辑（例如再次引入 `newFlow=1`）。
2. 新需求优先落在当前主线目录：
   - `src/core/`
   - `src/ui/screens/`
   - `src/ui/components/`
   - `src/data/`
   - `src/battleV2/`
3. `src/App_legacy.tsx` 仅作历史参考，不作为可发布入口。

---

## 入口策略（已生效）

1. 默认打开项目：进入 MVP 流程（`src/App.tsx -> MvpFlowShell`）。
2. 不再通过 URL 参数切换入口。
3. 目的：所有开发与验收走同一入口，避免并行链路漂移。

---

## 推荐开发流程（多 AI 协作）

1. 先确认任务是否属于当前单入口主线。
2. 列出拟修改文件，确保不引入入口分流。
3. 完成后至少做一次基础校验（例如 `npm run build` 或任务门禁命令）。
4. 在提交说明里明确写：
   - 本次是否保持单入口
   - 是否触达 legacy/归档目录（正常应为“否”）

---

## 一段可复制的 Prompt 约束

```text
当前项目采用“单入口主线”策略：
1) 唯一入口为 src/App.tsx -> MvpFlowShell，禁止新增 newFlow/legacyFlow 等分流参数。
2) 当前战斗主线是 src/battleV2/**，图鉴与战斗卡源按 cardsSource 统一读取。
3) legacy 目录仅作归档，不作为活主线改动范围。
4) 请先输出“将要修改的文件清单”，确认不引入并行入口后再实施。
```
