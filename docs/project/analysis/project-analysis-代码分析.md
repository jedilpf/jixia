# Repo File Metrics Brief (Skill: data-analysis)

## Decision
Prioritize cleanup and governance on `backups/` and static assets first, then module-level refactors in `src/`.

## Evidence
- Total files analyzed (excluding `.git`, `node_modules`, `dist*`): **870**
- Top file types: `.ts` 212, `.md` 167, `.tsx` 167, `.jpg` 83, `.png` 71
- Largest directories by file count:
  - `backups/`: 216
  - `public/`: 152
  - `src/`: 146
  - `src_new/`: 80
  - `docs/`: 55

## Confidence
Medium. This is structural metadata analysis; no runtime or dependency graph analysis yet.

## Caveats
- Size in file count does not equal maintenance cost.
- Media files may be intentional and not technical debt.
- Backup snapshots may be deliberate archival policy.

## Recommended Next Action
1. Define retention rules for `backups/` and archive older snapshots.
2. Audit `public/` images for compression/dedup opportunities.
3. Run dependency and dead-code analysis for `src/` + `src_new/` before deeper refactor.
