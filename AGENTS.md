# AGENTS Rules

Before any content/design/code task:
1. Read `AI_START_HERE.md`
2. Use a task file in `ai/tasks/*.json`
3. Generate packet with `npm run ai:prompt -- --task <task-file>`
4. Follow packet constraints first, then execute task
5. Finish with `npm run ai:finalize -- --task <task-file>`

Hard rules:
- Do not bypass `canon/` + `scope/` constraints.
- Do not write outside allowed task scope.
- If unknown, write `UNKNOWN` and record in `open_questions.md`.
