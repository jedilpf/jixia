---
name: "ui-card-designer"
description: "Designs game card UI components with proper layout, styling and animations. Invoke when user needs to create or modify card components like HandCard, MinionCard, HeroCard, etc."
---

# UI Card Designer

This skill helps design and implement game card UI components for the 稷下 2.0 card battle game.

## When to Use

- Creating new card components (HandCard, MinionCard, HeroCard, etc.)
- Modifying existing card UI designs
- Adding card animations and effects
- Implementing card state visuals (hover, selected, disabled)

## Design Principles

### Card Structure
```
┌─────────────────────┐
│      [Cost]         │  ← Top-left: Mana cost crystal
│                     │
│    [Card Name]      │  ← Center: Card name
│                     │
│    [Card Image]     │  ← Middle: Card illustration
│                     │
│    [Description]    │  ← Bottom: Effect description
│                     │
│  [Atk]    [HP/Dur]  │  ← Bottom corners: Stats
└─────────────────────┘
```

### Visual Style (稷下青铜机关城主题)
- **Border**: Bronze texture with patina accents (#8B7355, #4A7C6F)
- **Background**: Dark slate with subtle texture
- **Text**: New bamboo yellow (#D4C5A9) for readability
- **Highlight**: Furnace orange (#E85D04) for interactive states

### Card Types Styling

| Type | Border Color | Background | Accent |
|------|--------------|------------|--------|
| Minion | Bronze (#8B7355) | Dark slate | Copper green |
| Spell | Blue (#4A90E2) | Mystic dark | Arcane glow |
| Weapon | Amber (#D4A017) | Metallic | Steel shine |
| Hero Power | Orange (#E85D04) | Fiery dark | Flame effect |

### Animation States

1. **Idle**: Subtle breathing animation (scale 1.0 → 1.02)
2. **Hover**: Lift up with shadow (translateY -10px, shadow increase)
3. **Selected**: Glow border + slight scale up (1.05)
4. **Playable**: Green tint + glow pulse
5. **Unplayable**: Grayscale + opacity 0.6
6. **Dragging**: Follow cursor with rotation based on movement

## Implementation Guidelines

### Props Interface
```typescript
interface CardComponentProps {
  card: Card;
  isPlayable?: boolean;
  isSelected?: boolean;
  isEnemy?: boolean;
  faceDown?: boolean;
  scale?: number;
  rotation?: number;
  onClick?: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
}
```

### Tailwind Classes Pattern
```tsx
// Base card styles
const baseClasses = `
  relative rounded-lg border-2
  transition-all duration-200 ease-out
  cursor-pointer select-none
`;

// Type-specific styles
const typeStyles = {
  minion: 'border-amber-700 bg-slate-800',
  spell: 'border-blue-600 bg-slate-900',
  weapon: 'border-amber-500 bg-slate-800',
};

// State styles
const stateStyles = {
  playable: 'ring-2 ring-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]',
  selected: 'ring-2 ring-yellow-400 scale-105',
  unplayable: 'grayscale opacity-60',
};
```

## Examples

### Creating a New Card Component
```tsx
// src/components/battle/NewCardType.tsx
import { Card } from '@/types/game';

interface NewCardTypeProps {
  card: Card;
  isPlayable: boolean;
  scale: number;
}

export function NewCardType({ card, isPlayable, scale }: NewCardTypeProps) {
  return (
    <div 
      className={`
        relative rounded-lg border-2 border-amber-700
        bg-slate-800 shadow-lg
        ${isPlayable ? 'hover:-translate-y-2 hover:shadow-xl' : 'grayscale opacity-60'}
      `}
      style={{
        width: `${120 * scale}px`,
        height: `${168 * scale}px`,
      }}
    >
      {/* Cost crystal */}
      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-blue-600 
                      flex items-center justify-center text-white font-bold">
        {card.cost}
      </div>
      
      {/* Card content */}
      <div className="p-2 h-full flex flex-col">
        <div className="text-amber-200 text-sm font-bold text-center truncate">
          {card.name}
        </div>
        {/* ... more content */}
      </div>
    </div>
  );
}
```

## Best Practices

1. **Responsive Scaling**: Always use `scale` prop for responsive sizing
2. **Performance**: Use `will-change: transform` for animated cards
3. **Accessibility**: Add proper ARIA labels for card states
4. **Consistency**: Follow the bronze-mechanism visual theme
5. **Animation**: Use CSS transitions, avoid heavy JS animations
