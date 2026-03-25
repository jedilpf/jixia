---
name: jixia-workflow-guard
description: Execute scoped work safely in this repository. Use when Codex is asked to implement, review, migrate, or validate code, content, or design work in this project and needs the repository-specific workflow for task packets, mainline ownership, verification order, dirty-worktree-safe gating, and card/data source guardrails.
---

# Jixia Workflow Guard

## Overview

Use this skill to keep work aligned with this repository's operational rules before making changes or reporting review results.

## Core Workflow

1. Read `AGENTS.md`, `AI_START_HERE.md`, and the repository knowledge files before changing code.
2. Create a task file under `ai/tasks/`, then run:
   `npm run ai:task:validate -- --task <task-file>`
   `npm run ai:prompt -- --task <task-file>`
3. Stay inside the task's `allowed_write_paths`.
4. Prefer the narrowest useful verification first, then broader checks if the task touches shared flows.
5. Finish with `npm run ai:finalize -- --task <task-file>`.

## Mainline Guardrails

- Treat `src/` plus the MVP flow as the active implementation mainline.
- Treat `src_new/` as archived history; do not revive it as a parallel source tree.
- Treat `content/cards/*.json` as the card source of truth, with generated runtime data flowing from there.
- Treat non-active cards as retained assets managed by `status`, not by deleting files.
- Keep collection/gallery logic separate from playable/runtime card pools.

## Dirty Worktree Safety

- Assume the repository may be dirty.
- Never revert or overwrite unrelated edits you did not make.
- When running `ai:scope:staged` or `ai:finalize` for a focused task in a dirty tree, prefer an isolated temporary git index so unrelated changes do not contaminate the gate.
- Keep commits narrow with `git commit --only -- <paths...>` when multiple parallel changes exist locally.

## Verification Order

- For review-only tasks, inspect concrete entry points, callers, and tests before giving findings.
- For code changes, usually run `npm run typecheck`, then `npm test`, then task-specific validation such as `npm run validate:structure` or `npm run build` if the touched area affects packaging or UI output.
- Treat build warnings as real signals when they imply scanning drift, packaging drift, or generated artifact pollution.

## Companion Skills

- Use `$develop-web-game` when shaping gameplay-facing UI, screen flow, or interaction polish in this repository.
- Use `$playwright` when validating regressions across collection pages, transitions, or battle flows that are hard to trust from static inspection alone.
- Use `$gh-fix-ci` when adjusting GitHub Actions, gate ordering, or broken CI behavior.
- Use `$security-best-practices` when auditing long-term vulnerabilities, unsafe asset handling, or weak engineering controls.
- Use `$update-memory` near the end if the session produced durable conventions, decisions, or unresolved questions.

## Review Focus

- Prioritize bugs, regressions, structural drift, and missing tests over style commentary.
- Call out when multiple systems with overlapping ownership remain in the tree, because that is a recurring source of long-term maintenance cost here.
- Distinguish between temporary environment failures and genuine project risks.

## Output Expectations

- Report what changed or what you found with concrete file references.
- State what was verified and what was not.
- If you had to use a fallback because local tooling was unavailable, say so plainly.
