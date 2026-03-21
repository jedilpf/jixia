# Errors Log

Command failures, exceptions, and unexpected behaviors.

---

## [ERR-20260321-001] clawhub-search-rate-limit

**Logged**: 2026-03-21T08:35:29+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
`npx clawhub search` first run hit API rate limit.

### Error
```
Rate limit exceeded (retry in 1s, remaining: 0/120, reset in 1s)
```

### Context
- Command: `npx clawhub search "electron vite typescript"`
- Environment: local dev machine, Windows PowerShell

### Suggested Fix
Wait for reset window and retry once; transient limits usually clear quickly.

### Resolution
- **Resolved**: 2026-03-21T08:35:29+08:00
- **Notes**: immediate retry succeeded and returned results.

---

## [ERR-20260321-002] ui-token-generator-scss-and-encoding

**Logged**: 2026-03-21T08:35:29+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary
`design_token_generator.py` failed for `summary` and `scss` output.

### Error
```
UnicodeEncodeError on summary output (emoji in Windows GBK console)
AttributeError: DesignTokenGenerator has no attribute _export_as_scss
```

### Context
- Command: `python skills/ui-design-system-2.1.1/scripts/design_token_generator.py "#d4a520" modern summary/scss`
- File: `skills/ui-design-system-2.1.1/scripts/design_token_generator.py`

### Suggested Fix
Replace emoji summary text with ASCII-safe output and implement `_export_as_scss` method.

### Resolution
- **Resolved**: 2026-03-21T08:35:29+08:00
- **Notes**: patched script and regenerated JSON/CSS/SCSS successfully.

---
