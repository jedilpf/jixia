# AI Workflow (Strict)

## Why
Different AI tools do not automatically share context.  
This workflow forces all of them to consume the same constraints.

## Steps
1. Create task JSON under `ai/tasks/`
2. Validate task JSON
3. Generate AI packet prompt
4. Send packet to target AI
5. Apply AI output in repo
6. Stage only task-related files (`git add ...`)
7. Run finalize checks

## Commands
```bash
npm run ai:task:validate -- --task ai/tasks/TASK-EXAMPLE-001.json
npm run ai:prompt -- --task ai/tasks/TASK-EXAMPLE-001.json
npm run ai:finalize -- --task ai/tasks/TASK-EXAMPLE-001.json
```
