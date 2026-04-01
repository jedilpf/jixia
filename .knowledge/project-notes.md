# Project Notes

## Stable conventions
- Conflict arbitration is mandatory before implementation when AI proposals/instructions conflict.
- Arbitration records must use `docs/standards/conflict-arbitration-template.md`.
- If key information is unclear during arbitration, ask the user first and wait for clarification.
- Before destructive commands (`git clean`, `git reset --hard`, bulk delete/move, or unstage cleanup), list impacted paths first and wait for explicit user approval.
- Treat untracked/staged files as potential in-flight work from parallel AI assistants; inspect content/context before deciding whether to keep, stash, or remove.
- For repository alignment tasks, prefer a safety snapshot (`git stash -u` or equivalent backup) before destructive sync unless the user explicitly requests direct discard.
- User-required local run command uses `npx vite --host` for this repository workflow.
- Current branch-level default acceptance flow is the local `src/App.tsx` menu chain; alternate flows are treated as non-default unless re-arbitrated.
