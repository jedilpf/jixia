# Local Hold Value Curation v1

Date: 2026-03-28  
Scope: `.tmp/local-hold/*` artifacts recovered during cleanup

## 1. Objective

Promote only long-term reusable artifacts into tracked mainline files.
Keep temporary reports and one-off task scraps out of git history.

## 2. Decision Rules

- Keep: repeatable tooling, stable process docs, enforceable checks.
- Hold local: raw AI summaries, weekly scratch reports, draft prompts.
- Reject: duplicate transient tasks without direct implementation value.

## 3. Promotion Decisions

| Artifact | Decision | Target | Reason |
|---|---|---|---|
| `.tmp/local-hold/scripts/validate-assets.cjs` | Promote | `scripts/pipeline/validate-assets.cjs` | Adds missing static asset reference guardrail. |
| Asset validation command | Promote | `package.json` (`validate:assets`) | Makes check runnable and discoverable in standard scripts. |
| Daily gate integration | Promote | `scripts/pipeline/gate-daily.cjs` | Ensures asset validation runs in routine quality gate. |
| `.tmp/local-hold/reports/AI_DESIGN_SUMMARIES_FOR_CODEX.md` | Hold local | `.tmp/local-hold/reports/` | Contains mixed strategy notes and stale context; not mainline-safe. |
| `.tmp/local-hold/reports/本轮AI工作汇总-待Codex审核.md` | Hold local | `.tmp/local-hold/reports/` | Useful as audit memo but not durable product/process spec. |
| `.tmp/local-hold/ai-tasks/*.json` (26 files) | Hold local | `.tmp/local-hold/ai-tasks/` | Historical task drafts; promote case-by-case only when code/docs are shipped. |

## 4. Current Promotion Set

This curation round promotes exactly three technical changes:

1. Add `scripts/pipeline/validate-assets.cjs`
2. Add `validate:assets` script in `package.json`
3. Add asset validation to `gate:daily`

No gameplay logic, UI behavior, or balance data are changed.

## 5. Follow-up Policy

- If a held artifact is later needed, convert it into a scoped task with:
  - explicit allowed paths
  - acceptance commands
  - concise rewrite before tracking
- Do not bulk-import local-hold reports/tasks into git.
