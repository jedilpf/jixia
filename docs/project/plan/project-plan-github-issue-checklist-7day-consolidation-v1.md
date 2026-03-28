# GitHub Issue Checklist - 7 Day Consolidation

- Version: v1
- Date: 2026-03-24
- Scope: Repository consolidation only (single-mainline, single-source, single-entry, test guardrails)

## How To Use
1. Create milestone `Consolidation-W1`.
2. Create issues in order (D1 -> D3 -> D7).
3. Use "Dependencies" field below to avoid parallel conflicts.
4. Do not start content expansion (new factions/cards/UI polish) before D7 issues close.

---

## Day 1 (Stop Bleeding)

### Issue D1-01 - Freeze current baseline and rollback point
- Labels: `type/chore`, `priority/p0`, `track/consolidation`
- Milestone: `Consolidation-W1`
- Dependencies: none

Body:
```md
## Goal
Create a safe rollback point and lock a single active baseline before structural consolidation.

## Tasks
- [ ] Create tag: `pre-consolidation-2026-03-24`
- [ ] Create branch: `refactor/single-mainline`
- [ ] Add/update `docs/baseline/current-baseline.md`
- [ ] Ensure baseline states:
  - active frontend: `src/`
  - active battle: `src/battleV2/`
  - card source of truth: `content/cards/*.json`

## Acceptance
- [ ] Tag exists and is visible in repo tags
- [ ] Baseline doc exists and is referenced by README
```

### Issue D1-02 - Clean tracked cache/backup artifacts from active surface
- Labels: `type/chore`, `priority/p0`, `track/repo-hygiene`
- Milestone: `Consolidation-W1`
- Dependencies: D1-01

Body:
```md
## Goal
Remove cache/backup noise from active repository surface.

## Tasks
- [ ] Untrack `.vite/**` from git index
- [ ] Move `backups/` into `archive/legacy-backups/` (or equivalent archived location)
- [ ] Ensure `.gitignore` covers `.vite` and `backups`

## Acceptance
- [ ] `git ls-files | grep '^.vite/'` returns empty
- [ ] root-level `backups/` is no longer active in mainline development
```

### Issue D1-03 - Add baseline pointer + consolidation log
- Labels: `type/docs`, `priority/p1`, `track/consolidation`
- Milestone: `Consolidation-W1`
- Dependencies: D1-01

Body:
```md
## Goal
Make active baseline discoverable for all contributors and AI agents.

## Tasks
- [ ] Add baseline pointer in `README.md`
- [ ] Add/update `docs/migration/consolidation-log.md`
- [ ] Record scope boundaries (active vs archived directories)

## Acceptance
- [ ] README has an explicit baseline pointer
- [ ] Consolidation log captures stage actions and risks
```

---

## Day 3 (Converge Source + Entry)

### Issue D3-01 - Enforce single card source and runtime generation
- Labels: `type/refactor`, `priority/p0`, `track/cards`
- Milestone: `Consolidation-W1`
- Dependencies: D1-01, D1-02

Body:
```md
## Goal
Use `content/cards/*.json` as single editable source; runtime reads generated output.

## Tasks
- [ ] Add/maintain generator: `scripts/build-cards-runtime.cjs`
- [ ] Generate runtime file: `src/generated/cardsRuntime.ts`
- [ ] Add bridge source module: `src/data/cardsSource.ts`
- [ ] Switch active consumers from direct legacy source to bridge source

## Acceptance
- [ ] `npm run cards:runtime` succeeds
- [ ] active battle/showcase consumers no longer directly import `showcaseCards.ts`
- [ ] fallback compatibility remains available for transition period
```

### Issue D3-02 - Retire dual entry and freeze a single default flow
- Labels: `type/refactor`, `priority/p0`, `track/entry`
- Milestone: `Consolidation-W1`
- Dependencies: D1-01

Body:
```md
## Goal
Eliminate long-term dual-entry behavior (e.g., URL flag split).

## Tasks
- [x] Remove `newFlow=1` routing split from default app entry
- [ ] Keep exactly one default production entry path
- [ ] Move non-active flow to archive or explicit experimental boundary

## Acceptance
- [ ] local run enters one deterministic flow by default
- [ ] no hidden URL branch required for primary battle path
```

### Issue D3-03 - Archive legacy parallel code branch (`src_new`)
- Labels: `type/chore`, `priority/p0`, `track/archive`
- Milestone: `Consolidation-W1`
- Dependencies: D3-02

Body:
```md
## Goal
Stop parallel development between `src` and `src_new`.

## Tasks
- [ ] Move `src_new/` to `archive/legacy-src_new/`
- [ ] Add readme note in archive explaining retirement status
- [ ] Block routine development under `archive/`

## Acceptance
- [ ] root no longer presents `src_new/` as active path
- [ ] docs clearly define archive as non-active
```

---

## Day 7 (Playable Loop + Real Guardrails)

### Issue D7-01 - Deliver one complete playable loop
- Labels: `type/feature`, `priority/p0`, `track/gameplay`
- Milestone: `Consolidation-W1`
- Dependencies: D3-02, D3-03

Body:
```md
## Goal
Ship one stable minimum playable loop before further content expansion.

## Scope
- 1 debate scene
- 2 factions
- <= 20 cards
- 3~5 turns to end

## Tasks
- [ ] from main menu to battle start
- [ ] legal card play and cost deduction
- [ ] turn/lane resolution and win/lose state
- [ ] result page and return to main menu

## Acceptance
- [ ] one full match can be played end-to-end without manual intervention
```

### Issue D7-02 - Add formal test entry and core rule tests
- Labels: `type/test`, `priority/p0`, `track/quality`
- Milestone: `Consolidation-W1`
- Dependencies: D7-01

Body:
```md
## Goal
Move from advisory checks to enforceable rule safety.

## Tasks
- [ ] add `test` script in `package.json`
- [ ] add minimal automated tests for:
  - play legality
  - phase transition
  - resource deduction
  - win/loss determination

## Acceptance
- [ ] `npm test` runs in CI
- [ ] failures block PR merge
```

### Issue D7-03 - Tighten CI from warning mode to blocking mode
- Labels: `type/ci`, `priority/p1`, `track/quality`
- Milestone: `Consolidation-W1`
- Dependencies: D7-02

Body:
```md
## Goal
Prevent regression and repository drift by default.

## Tasks
- [ ] keep `gate:daily` and `typecheck` in required CI
- [ ] make lint blocking (remove non-blocking mode)
- [ ] add generated-file consistency check for card pipeline

## Acceptance
- [ ] PR cannot merge when lint/test/gate fails
- [ ] card source changes without generated sync fail CI
```

---

## Suggested Execution Order
1. D1-01
2. D1-02
3. D1-03
4. D3-01
5. D3-02
6. D3-03
7. D7-01
8. D7-02
9. D7-03

## Not In This Week
- Expansion of factions/card pool
- New visual polish tracks
- Marketing/localization tracks

## Definition of Done (Week)
- One active mainline
- One card source of truth
- One default app entry
- One end-to-end playable loop
- Blocking CI on core quality gates
