---
name: "ui-interaction-designer"
description: "Designs user interactions including drag-and-drop, click handlers, selection states, and input feedback. Invoke when user needs to implement or modify user interactions in the game UI."
---

# UI Interaction Designer

This skill designs and implements user interactions for the 稷下 2.0 card battle game.

## When to Use

- Implementing drag-and-drop functionality
- Adding click/tap handlers
- Managing selection states
- Creating hover effects
- Implementing gesture controls
- Adding input feedback

## Interaction Patterns

### 1. Drag and Drop

#### Card Dragging
```typescript
// hooks/useDragAndDrop.ts
export function useDragAndDrop() {
  const [dragState, setDragState] = useState({
    isDragging: false,
    cardId: null as string | null,
    handIndex: null as number | null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const handleDragStart = useCallback((e: React.PointerEvent, handIndex: number) => {
    const card = game.player.hand[handIndex];
    if (!canPlayCard(game.player, card)) return;

    setDragState({
      isDragging: true,
      cardId: card.id,
      handIndex,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    });

    // Add global event listeners
    const handleMove = (e: PointerEvent) => {
      setDragState(prev => ({
        ...prev,
        currentX: e.clientX,
        currentY: e.clientY,
      }));
    };

    const handleEnd = (e: PointerEvent) => {
      // Check drop target and execute action
      const dropTarget = getDropTarget(e.clientX, e.clientY);
      if (dropTarget) {
        playCard(game, 'player', handIndex, dropTarget.index);
      }
      
      setDragState(prev => ({ ...prev, isDragging: false }));
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
  }, [game]);

  return { dragState, handleDragStart };
}
```

#### Attack Dragging
```typescript
// Drag from minion/hero to target
const handleAttackDragStart = useCallback((
  e: React.PointerEvent,
  attackerType: 'minion' | 'hero',
  attackerIndex?: number
) => {
  // Similar pattern to card drag
  // Check canAttack before allowing drag
  // Show attack pointer line during drag
  // Execute attack on valid target drop
}, []);
```

### 2. Selection System

#### Selection State Types
```typescript
type SelectionType = 
  | 'none'
  | 'card'      // Selected card in hand
  | 'minion'    // Selected minion on board
  | 'hero'      // Selected hero (for attack)
  | 'hero_power' // Selected hero power
  | 'target';   // Selecting target for spell/ability

interface SelectionState {
  type: SelectionType;
  playerId?: PlayerId;
  cardId?: string;
  handIndex?: number;
  boardIndex?: number;
  minionInstanceId?: string;
}
```

#### Selection Flow
```
User clicks card/minion/hero
        │
        ▼
Set selection state
        │
        ▼
Highlight valid targets
        │
        ▼
User clicks target / presses ESC
        │
        ├──────────┐
        │          │
        ▼          ▼
   Valid target   Cancel
        │          │
        ▼          ▼
   Execute action  Clear selection
        │
        ▼
   Clear selection
```

#### Implementation
```tsx
// In component
const [selection, setSelection] = useState<SelectionState>({ type: 'none' });

const handleCardClick = (handIndex: number) => {
  if (selection.type === 'none') {
    setSelection({
      type: 'card',
      playerId: 'player',
      handIndex,
    });
  }
};

const handleTargetClick = (targetIndex: number) => {
  if (selection.type === 'card') {
    const result = playCard(game, 'player', selection.handIndex!, targetIndex);
    if (result) {
      setGame(result);
      setSelection({ type: 'none' });
    }
  }
};

// Handle ESC to cancel
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSelection({ type: 'none' });
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 3. Hover States

#### Card Hover
```tsx
<div 
  className="
    transition-all duration-200 ease-out
    hover:-translate-y-2
    hover:shadow-xl
    hover:shadow-amber-500/20
  "
  onMouseEnter={() => setHoveredCard(index)}
  onMouseLeave={() => setHoveredCard(null)}
>
  {/* Card content */}
</div>
```

#### Target Highlight
```tsx
// When a minion is selected for attack
<div 
  className={`
    relative
    ${isValidTarget ? 'cursor-crosshair' : 'cursor-default'}
  `}
>
  {isValidTarget && (
    <div className="
      absolute inset-0
      border-2 border-red-500
      rounded-lg
      animate-pulse
      pointer-events-none
    " />
  )}
  {/* Content */}
</div>
```

### 4. Click vs Drag Distinction

```typescript
const handlePointerDown = (e: React.PointerEvent) => {
  const startX = e.clientX;
  const startY = e.clientY;
  let isDragging = false;

  const handleMove = (e: PointerEvent) => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    // If moved more than threshold, it's a drag
    if (Math.sqrt(dx * dx + dy * dy) > 5) {
      isDragging = true;
      // Start drag operation
    }
  };

  const handleUp = (e: PointerEvent) => {
    if (!isDragging) {
      // It was a click
      handleClick();
    }
    // Cleanup
  };

  window.addEventListener('pointermove', handleMove);
  window.addEventListener('pointerup', handleUp);
};
```

### 5. Input Feedback

#### Visual Feedback
```tsx
// Button press feedback
<button 
  className="
    active:scale-95
    active:bg-amber-800
    transition-all duration-100
  "
>
  点击
</button>

// Success feedback
const showSuccessFeedback = () => {
  // Flash green border
  // Play success sound (if enabled)
  // Show floating "+1" or similar
};

// Error feedback
const showErrorFeedback = () => {
  // Shake animation
  // Red flash
  // Error message tooltip
};
```

#### Sound Feedback (规划中)
```typescript
// Audio feedback system
const playSound = (type: 'cardPlay' | 'attack' | 'damage' | 'turnEnd') => {
  const sounds = {
    cardPlay: '/sounds/card-play.mp3',
    attack: '/sounds/attack.mp3',
    damage: '/sounds/damage.mp3',
    turnEnd: '/sounds/turn-end.mp3',
  };
  
  const audio = new Audio(sounds[type]);
  audio.volume = 0.5;
  audio.play();
};
```

## Interaction States Matrix

| Element | Idle | Hover | Selected | Disabled | Dragging |
|---------|------|-------|----------|----------|----------|
| Hand Card | Normal | Lift + Glow | Green border | Gray + Opacity | Follow cursor |
| Minion | Normal | Scale up | Yellow border | Gray | Move to target |
| Hero | Normal | Glow | Weapon ready | Gray | Attack line |
| Button | Normal | Brighten | Pressed | Gray | - |
| Slot | Normal | Highlight | - | - | Drop zone |

## Accessibility

### Keyboard Navigation
```tsx
// Tab navigation
tabIndex={0}

// Enter/Space activation
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleClick();
  }
}}

// Focus indicators
className="
  focus:outline-none
  focus:ring-2
  focus:ring-amber-500
  focus:ring-offset-2
"
```

### Screen Reader Support
```tsx
// ARIA labels
<button aria-label="结束回合">
  结束回合
</button>

// Live regions for game updates
<div aria-live="polite" className="sr-only">
  {gameLog[gameLog.length - 1]}
</div>

// Role definitions
<div role="button" tabIndex={0}>
  可点击区域
</div>
```

## Best Practices

1. **Immediate Feedback**: Always provide visual feedback within 100ms
2. **Consistent Patterns**: Use same interaction patterns across similar elements
3. **Error Prevention**: Confirm destructive actions (surrender, etc.)
4. **Undo Support**: Allow canceling selections with ESC
5. **Touch Friendly**: Minimum 44px touch targets
6. **Performance**: Use CSS transitions over JS animations
7. **State Clarity**: Clear visual distinction between all states
