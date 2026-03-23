# Jixia UI Design System - Asset Catalog (v2_jixia)

This document catalogs the optimized UI assets for the "Jixia Bronze Mechanism City" theme. 
All assets are designed to be consistent and understandable for both human developers and AI agents.

## Naming Convention
- `ui_btn_[name].png`: Interactive buttons.
- `ui_bg_[name].png`: Large container or screen backgrounds.
- `ui_icon_[name].png`: Stats, cursors, or small indicators.
- `ui_frame_[name].png`: Border frames for cards or panels.
- `ui_panel_[name].png`: Textures for dialogs or menus.

## Asset Registry

| Asset Name | Logic ID | Description |
|------------|----------|-------------|
| `ui_icons_stats.png` | `UI_ICON_STATS` | Contains Attack, HP, and Cost icons in a mechanical bronze style. |
| `ui_card_frame.png` | `UI_FRAME_CARD` | Standard bronze steampunk frame for game cards. |
| `ui_btn_menu_group.png` | `UI_BTN_MENU` | Set of 3 buttons: Start, Characters, Collection. |
| `ui_battle_arena.png` | `UI_BG_ARENA` | Optimized top-down battle board with mechanical inlays. |
| `ui_panel_bamboo.png` | `UI_PANEL_TEXT` | Bamboo slip texture for dialogue and scrollable areas. |

## Implementation Guidelines
1. **Buttons**: Use standard 9-slice scaling or cover-fit. Furnace orange (#E85D04) should be the primary glow color.
2. **Colors**: 
   - Primary Bronze: `#8B7355`
   - Glow (Furnace): `#E85D04`
   - Accent (Patina): `#4A7C6F`
3. **Z-Index**: UI Frames should usually sit between the Background and the Content.

---
*Maintained by Antigravity AI*
