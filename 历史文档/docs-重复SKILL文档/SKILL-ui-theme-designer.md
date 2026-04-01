---
name: "ui-theme-designer"
description: "Applies the 稷下青铜机关城 visual theme to UI components including colors, textures, and styling. Invoke when user needs to style components according to the bronze-mechanism aesthetic."
---

# UI Theme Designer

This skill applies the 稷下青铜机关城 (Jixia Bronze Mechanism City) visual theme to UI components.

## When to Use

- Styling new UI components
- Creating themed buttons, panels, or cards
- Applying the bronze-mechanism aesthetic
- Defining color schemes for game elements
- Creating texture and material effects

## Theme Overview

### Core Imagery
| Element | Symbolism | Visual Representation |
|---------|-----------|----------------------|
| 炉火 (Furnace Fire) | Energy, Passion | Orange-red glow, ember particles |
| 齿轮 (Gears) | Logic, Deduction | Bronze mechanical details |
| 铜绿 (Patina) | History, Heritage | Weathered bronze textures |
| 竹简 (Bamboo Slips) | Knowledge, Strategy | Textured backgrounds, scrolls |

### Color Palette

#### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Bronze Base | `#8B7355` | Primary UI elements, borders |
| Patina Green | `#4A7C6F` | Accents, highlights, secondary elements |
| Furnace Orange | `#E85D04` | Energy, actions, warnings |
| Cinnabar Red | `#8B2635` | Danger, damage, enemy indicators |

#### Secondary Colors
| Name | Hex | Usage |
|------|-----|-------|
| New Bamboo | `#D4C5A9` | Text, labels, content |
| Dark Slate | `#1a1a2e` | Backgrounds, panels |
| Deep Bronze | `#5d4037` | Shadows, depth |
| Bright Gold | `#D4A017` | Rarity, special items |

#### Background Colors
| Name | Hex | Usage |
|------|-----|-------|
| Canvas Dark | `#0f0f1a` | Main background |
| Panel Dark | `#1a1a2e` | Card backgrounds |
| Overlay | `rgba(0,0,0,0.7)` | Modals, overlays |

## Component Styling

### Buttons

#### Primary Button (Action)
```tsx
<button className="
  px-6 py-3
  bg-gradient-to-b from-amber-700 to-amber-900
  border-2 border-amber-600
  rounded-lg
  text-amber-100 font-bold
  shadow-lg shadow-amber-900/50
  hover:from-amber-600 hover:to-amber-800
  hover:shadow-amber-600/50
  active:scale-95
  transition-all duration-200
">
  确认
</button>
```

#### Secondary Button
```tsx
<button className="
  px-4 py-2
  bg-slate-800
  border border-slate-600
  rounded
  text-slate-300
  hover:bg-slate-700
  hover:text-slate-200
  transition-colors duration-200
">
  取消
</button>
```

#### Danger Button
```tsx
<button className="
  px-4 py-2
  bg-gradient-to-b from-red-800 to-red-900
  border border-red-700
  rounded
  text-red-100
  hover:from-red-700 hover:to-red-800
  transition-all duration-200
">
  投降
</button>
```

### Panels

#### Main Panel
```tsx
<div className="
  bg-slate-900/90
  border-2 border-amber-800/50
  rounded-xl
  shadow-2xl
  backdrop-blur-sm
">
  {/* Content */}
</div>
```

#### Card Frame
```tsx
<div className="
  relative
  bg-gradient-to-b from-slate-800 to-slate-900
  border-2 border-amber-700
  rounded-lg
  shadow-lg
  overflow-hidden
">
  {/* Corner decorations */}
  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-500/50" />
  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-500/50" />
  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-500/50" />
  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-500/50" />
  
  {/* Content */}
</div>
```

### Text Styles

#### Title
```tsx
<h1 className="
  text-3xl font-bold
  text-amber-200
  tracking-wider
  drop-shadow-lg
">
  稷下对决
</h1>
```

#### Body Text
```tsx
<p className="
  text-base
  text-amber-100/90
  leading-relaxed
">
  内容文本
</p>
```

#### Label
```tsx
<span className="
  text-sm
  text-amber-300/70
  uppercase tracking-wide
">
  标签
</span>
```

## Texture Effects

### Bronze Texture
```css
.bronze-texture {
  background: 
    linear-gradient(135deg, rgba(139,115,85,0.1) 0%, transparent 50%),
    linear-gradient(225deg, rgba(74,124,111,0.1) 0%, transparent 50%),
    #1a1a2e;
}
```

### Metal Shine
```css
.metal-shine {
  position: relative;
  overflow: hidden;
}

.metal-shine::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 40%,
    rgba(255,255,255,0.1) 50%,
    transparent 60%
  );
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(100%) rotate(45deg); }
}
```

### Glow Effects

#### Furnace Glow
```css
.furnace-glow {
  box-shadow: 
    0 0 20px rgba(232,93,4,0.3),
    0 0 40px rgba(232,93,4,0.2),
    0 0 60px rgba(232,93,4,0.1);
}
```

#### Bronze Glow
```css
.bronze-glow {
  box-shadow: 
    0 0 15px rgba(139,115,85,0.4),
    inset 0 0 10px rgba(139,115,85,0.1);
}
```

## Element-Specific Themes

### Mana Crystal
```tsx
<div className="
  w-10 h-10
  rounded-full
  bg-gradient-to-br from-blue-400 to-blue-700
  border-2 border-blue-300
  shadow-lg shadow-blue-500/50
  flex items-center justify-center
  text-white font-bold
">
  {cost}
</div>
```

### Health Indicator
```tsx
<div className="
  px-3 py-1
  bg-gradient-to-r from-red-900 to-red-800
  border border-red-700
  rounded-full
  text-red-100 font-bold
  shadow-lg
">
  ❤️ {hp}
</div>
```

### Attack Indicator
```tsx
<div className="
  px-3 py-1
  bg-gradient-to-r from-amber-800 to-amber-700
  border border-amber-600
  rounded-full
  text-amber-100 font-bold
  shadow-lg
">
  ⚔️ {atk}
</div>
```

## Responsive Considerations

### Mobile Adaptations
- Reduce border widths (2px → 1px)
- Simplify textures
- Increase touch targets
- Adjust font sizes

### High DPI Screens
- Use SVG for icons
- Provide 2x textures
- Sharper shadows

## Best Practices

1. **Consistency**: Use theme colors consistently across components
2. **Hierarchy**: Use color to indicate importance (Furnace > Bronze > Slate)
3. **Contrast**: Ensure text readability on all backgrounds
4. **Subtlety**: Use effects sparingly to avoid visual clutter
5. **Performance**: Prefer CSS gradients over image textures
