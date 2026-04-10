# Main Menu Return Transition Polish

Date: 2026-04-10
Task: `TASK-20260410-187`

## Problem
- Returning from sub-screens back to the initial four-button main menu felt abrupt because the app switched straight to `screen = 'menu'` with no shared handoff.

## Fix
- Added a lightweight shared return-to-menu curtain transition in `src/App.tsx`.
- The transition now:
  - briefly covers the outgoing sub-screen
  - switches the app shell back to `menu`
  - then fades the curtain away so the main menu reappears more naturally

## Scope
- No navigation model rewrite
- No gameplay or story content change
- No asset/image edits
