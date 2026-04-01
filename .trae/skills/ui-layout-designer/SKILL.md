---
name: "ui-layout-designer"
description: "Designs responsive game UI layouts using the layoutSpec system. Invoke when user needs to create or modify battle layout, positioning elements, or implementing responsive scaling."
---

# UI Layout Designer

This skill designs and implements responsive game UI layouts for the 稷下 2.0 card battle game.

## When to Use

- Creating new layout configurations
- Modifying existing layout positions
- Implementing responsive scaling
- Positioning UI elements on the battlefield
- Adding new UI components to the layout

## Layout System Overview

### Canvas Configuration
```typescript
const CANVAS = {
  width: 1920,   // Base design width
  height: 1080,  // Base design height
  centerX: 960,  // Horizontal center
};
```

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│                      Canvas (1920x1080)                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Enemy Hero (Top Center)             │   │
│  │                                                  │   │
│  │    ┌──────────────────────────────────────┐     │   │
│  │    │         Enemy Minion Row              │     │   │
│  │    └──────────────────────────────────────┘     │   │
│  │                                                  │   │
│  │    ═══════════════════════════════════════      │   │
│  │              Battlefield Divider                 │   │
│  │    ═══════════════════════════════════════      │   │
│  │                                                  │   │
│  │    ┌──────────────────────────────────────┐     │   │
│  │    │         Player Minion Row             │     │   │
│  │    └──────────────────────────────────────┘     │   │
│  │                                                  │   │
│  │  ┌──────────┐                          ┌──────┐ │   │
│  │  │Player    │                          │End   │ │   │
│  │  │Hero      │                          │Turn  │ │   │
│  │  └──────────┘                          └──────┘ │   │
│  │                                                  │   │
│  │       ┌─────────────────────────────┐           │   │
│  │       │      Player Hand (Fan)       │           │   │
│  │       └─────────────────────────────┘           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Layout Configuration

### LayoutItem Interface
```typescript
interface LayoutItem {
  id: string;           // Unique identifier
  x: number | string;   // X position (number or 'center')
  y: number;            // Y position
  w: number;            // Width
  h: number;            // Height
  label?: string;       // Display label
  color?: string;       // Debug color
}
```

### Position Expressions
- **Absolute**: `x: 100` (pixels from left)
- **Center**: `x: 'center'` (centered horizontally)
- **Center with offset**: `x: 'center+100'` or `x: 'center-100'`

### Standard Layout Nodes

| Node ID | Position | Size | Description |
|---------|----------|------|-------------|
| enemy-hero | (870, 30) | 180x220 | Enemy hero card |
| enemy-minion-0~6 | (417~1365, 280) | 138x161 | Enemy minion slots |
| enemy-deck | (1700, 80) | 100x140 | Enemy deck |
| player-minion-0~6 | (333~1425, 520) | 162x189 | Player minion slots |
| player-hero | (80, 720) | 180x220 | Player hero card |
| player-skill | (280, 800) | 70x70 | Hero power button |
| player-deck | (1700, 860) | 100x140 | Player deck |
| end-turn | (1780, 500) | 100x70 | End turn button |

## Responsive Scaling

### useScale Hook
```typescript
export function useScale(canvasW: number, canvasH: number) {
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    const updateScale = () => {
      const windowW = window.innerWidth;
      const windowH = window.innerHeight;
      const scaleX = windowW / canvasW;
      const scaleY = windowH / canvasH;
      setScale(Math.min(scaleX, scaleY));
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [canvasW, canvasH]);
  
  return { scale };
}
```

### Applying Scale
```tsx
// In component
const { scale } = useScale(1920, 1080);

return (
  <div 
    style={{
      left: `${x * scale}px`,
      top: `${y * scale}px`,
      width: `${w * scale}px`,
      height: `${h * scale}px`,
    }}
  >
    {/* Content */}
  </div>
);
```

## Hand Card Fan Layout

### computeHandFan Function
```typescript
function computeHandFan(
  count: number,        // Number of cards
  centerX: number,      // Fan center X
  baseY: number,        // Fan base Y
  options: {
    direction?: 'up' | 'down';   // Fan direction
    radius?: number;              // Arc radius
    maxAngleDeg?: number;         // Max spread angle
    step?: number;                // Card spacing
    reverse?: boolean;            // Reverse fan direction
  }
): HandPose[];
```

### HandPose Structure
```typescript
interface HandPose {
  x: number;      // Card X position
  y: number;      // Card Y position
  rot: number;    // Rotation in degrees
  z: number;      // Z-index for layering
}
```

### Example Usage
```tsx
const playerPoses = computeHandFan(
  game.player.hand.length,
  960,           // Center X
  1040,          // Base Y
  {
    direction: 'down',
    radius: 580,
    maxAngleDeg: 24,
    step: 90,
  }
);

return game.player.hand.map((card, index) => {
  const pose = playerPoses[index];
  return (
    <HandCard
      key={index}
      card={card}
      x={pose.x}
      y={pose.y}
      rotation={pose.rot}
      style={{ zIndex: pose.z }}
    />
  );
});
```

## Adding New Layout Elements

### Step 1: Define in layoutSpec.ts
```typescript
// In LAYOUT.layouts array
{ 
  id: 'new-element', 
  x: 500, 
  y: 500, 
  w: 100, 
  h: 100,
  label: 'New Element',
  color: '#ff0000'
}
```

### Step 2: Use in Component
```tsx
const layoutNodes = expandLayouts(LAYOUT.layouts);
const newElementNode = layoutNodes.find(n => n.id === 'new-element');

if (newElementNode) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${newElementNode.x * scale}px`,
        top: `${newElementNode.y * scale}px`,
        width: `${newElementNode.w * scale}px`,
        height: `${newElementNode.h * scale}px`,
      }}
    >
      {/* Content */}
    </div>
  );
}
```

## Best Practices

1. **Use LayoutSpec**: Always define positions in config, not hardcoded
2. **Test at multiple resolutions**: Ensure responsive scaling works
3. **Keep margins**: Don't place elements at absolute edges
4. **Consistent spacing**: Use consistent gaps between elements
5. **Debug mode**: Use `showSlotBorders` to visualize layout

## Common Patterns

### Centering Elements
```typescript
// Horizontal center
x: 'center'

// Center with offset
x: 'center+100'  // 100px right of center
x: 'center-100'  // 100px left of center
```

### Stacking Elements
```typescript
// Use z-index for layering
{ id: 'background', z: 0 }
{ id: 'content', z: 10 }
{ id: 'overlay', z: 20 }
```

### Dynamic Positioning
```typescript
// Calculate position based on index
minions.map((_, index) => ({
  id: `minion-${index}`,
  x: 333 + index * 182,  // 162 width + 20 gap
  y: 520,
  w: 162,
  h: 189,
}));
```
