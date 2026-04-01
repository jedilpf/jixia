# CLAUDE Working Rules

This repository enforces a strict AI workflow:
- Start from `AI_START_HERE.md`
- Consume a task file from `ai/tasks/*.json`
- Use generated packet from `ai/out/*.prompt.md`
- Run `npm run ai:finalize -- --task <task-file>` before handoff

If any constraint conflicts with creative output:
- Constraints win
- Put unresolved items into `open_questions.md`
