# AI Start Here

## 你关心的问题
其他 AI 默认**不会自动**遵守你的约束文件。  
所以必须把约束打包后再喂给它，并在产出后跑自动门禁。

## 强制流程（每次都一样）
1. 准备任务文件（JSON）  
   放在 `ai/tasks/`，参考 `ai/tasks/TASK-EXAMPLE-001.json`
2. 验证任务文件  
   `npm run ai:task:validate -- --task ai/tasks/TASK-EXAMPLE-001.json`
3. 生成可复制给任何 AI 的“任务包提示词”  
   `npm run ai:prompt -- --task ai/tasks/TASK-EXAMPLE-001.json`
4. 把 `ai/out/*.prompt.md` 全文发给目标 AI  
4.5 若出现方案冲突或需求理解冲突：  
   先填写 `docs/standards/conflict-arbitration-template.md` 再动手；  
   信息不清楚时必须先向用户提问确认。
5. AI 产出后，运行收尾强校验  
   先 `git add` 本次任务相关文件，再执行：  
   `npm run ai:finalize -- --task ai/tasks/TASK-EXAMPLE-001.json`

## 这套流程保证什么
- 不能保证外部 AI 主观上“听话”。
- 但可以保证：不符合流程和约束的产出，进不了你的主流程。
