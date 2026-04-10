# Main Menu Button White Background Cleanup 2026-04-10

## Scope

Cleaned the four initial hall button raster assets:

- `public/assets/btn-start.png`
- `public/assets/btn-story.png`
- `public/assets/btn-characters.png`
- `public/assets/btn-collection.png`

## Problem

The button PNGs had an opaque white outer background baked into the bitmap itself.
Because the menu renders these images directly, the white fill appeared as a visible rectangular backing in the hall UI.

## Root Cause

This was not a CSS or component-layer issue.
The white area was part of the physical PNG files, especially around the exterior of the button frame.

## Fix

Used a conservative cleanup pass:

- detect light neutral pixels connected to the image border
- convert only that connected outer region to transparency
- preserve interior highlights, glow, text, and frame details

## Result

- All four button assets now have transparent outer corners/background.
- Corner alpha on each cleaned button is now `0`.
- No menu logic or JSX wiring needed changes because the asset references were already correct.
