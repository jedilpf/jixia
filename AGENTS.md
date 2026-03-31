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

## Conflict Arbitration (Mandatory)

If there is any conflict between AI proposals, instructions, architecture choices, or implementation paths:

1. Do not implement immediately.
2. Create a conflict record using:
   - `docs/standards/conflict-arbitration-template.md`
3. Fill the record first (CONFLICT-ID,双方观点,仲裁依据,最终决策,实施要求).
4. If required information is unclear, ask the user first and wait for clarification.
5. Only after arbitration is explicit, proceed with edits.

This rule applies to all AI assistants working in this repository.
