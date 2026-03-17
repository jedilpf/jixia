---
name: "ui-animation-designer"
description: "Creates smooth animations for game UI elements including attacks, card plays, damage numbers, and transitions. Invoke when user needs to add or modify animations in the battle interface."
---

# UI Animation Designer

This skill designs and implements animations for the 稷下 2.0 card battle game UI.

## When to Use

- Creating attack animations (minion/hero attacks)
- Implementing card play animations
- Adding damage number popups
- Designing UI transitions and effects
- Creating particle or special effects

## Animation Types

### 1. Attack Animation

**Purpose**: Visualize minion/hero moving to attack target

**Specs**:
- Duration: 500ms
- Easing: ease-in-out
- Path: Straight line to target
- Return: Snap back after attack

**Implementation**:
```typescript
const executeAttackAnimation = (
  attackerElement: HTMLElement,
  targetX: number,
  targetY: number
) => {
  const startX = attackerElement.offsetLeft;
  const startY = attackerElement.offsetTop;
  
  // Animate to target
  attackerElement.style.transition = 'transform 500ms ease-in-out';
  attackerElement.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px)`;
  
  // Return after delay
  setTimeout(() => {
    attackerElement.style.transform = 'translate(0, 0)';
  }, 600);
};
```

### 2. Card Play Animation

**Purpose**: Show card moving from hand to battlefield

**Specs**:
- Duration: 500ms
- Easing: ease-out
- Scale: 1.0 → 0.8 (hand to board size)
- Rotation: Reset to 0

**Implementation**:
```typescript
const playCardAnimation = (
  cardElement: HTMLElement,
  targetX: number,
  targetY: number
) => {
  cardElement.style.transition = 'all 500ms ease-out';
  cardElement.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.8) rotate(0deg)`;
  cardElement.style.opacity = '0';
};
```

### 3. Damage Number Animation

**Purpose**: Display damage values with visual flair

**Specs**:
- Duration: 1000ms
- Movement: Float upward 50px
- Scale: 1.0 → 1.2 → 0.8
- Fade: 100% → 0%

**Implementation**:
```tsx
// DamageNumber component
function DamageNumber({ damage, x, y }: DamageNumberProps) {
  return (
    <div 
      className="absolute text-4xl font-bold text-red-500 pointer-events-none"
      style={{
        left: x,
        top: y,
        animation: 'damageFloat 1s ease-out forwards',
        textShadow: '0 0 10px rgba(239, 68, 68, 0.8)',
      }}
    >
      -{damage}
    </div>
  );
}

// CSS animation
const damageFloat = `
  @keyframes damageFloat {
    0% {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    50% {
      transform: translateY(-25px) scale(1.2);
    }
    100% {
      transform: translateY(-50px) scale(0.8);
      opacity: 0;
    }
  }
`;
```

### 4. Hover Effects

**Purpose**: Indicate interactive elements

**Specs**:
- Duration: 200ms
- Transform: translateY(-5px)
- Shadow: Increase spread

**Implementation**:
```css
.card-hover {
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}
```

### 5. Shake Animation (Damage)

**Purpose**: Indicate taking damage

**Specs**:
- Duration: 300ms
- Movement: Horizontal shake
- Intensity: 5px

**Implementation**:
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.shake {
  animation: shake 300ms ease-in-out;
}
```

## Animation System Architecture

### Hook Pattern
```typescript
// hooks/useBattleAnimations.ts
export function useBattleAnimations() {
  const [animations, setAnimations] = useState<Animation[]>([]);
  
  const addAnimation = (animation: Animation) => {
    setAnimations(prev => [...prev, animation]);
  };
  
  const removeAnimation = (id: string) => {
    setAnimations(prev => prev.filter(a => a.id !== id));
  };
  
  return { animations, addAnimation, removeAnimation };
}
```

### Animation State Machine
```
Idle → Start → Playing → Complete → Cleanup
```

## Performance Guidelines

1. **Use transform and opacity**: These are GPU-accelerated
2. **Avoid layout properties**: Don't animate width, height, top, left
3. **Use will-change sparingly**: Only on actively animating elements
4. **Clean up animations**: Remove animation classes after completion
5. **Debounce rapid animations**: Prevent animation spam

## Visual Effects

### Particle Effects (规划中)
```typescript
// Fire/spark particles for attacks
// Dust particles for card plays
// Glow effects for special cards
```

### Screen Effects
- **Screen shake**: On heavy damage
- **Flash**: On critical hits
- **Blur**: On menu open

## Best Practices

1. **Timing**: Keep animations under 1 second for responsiveness
2. **Easing**: Use ease-out for entering, ease-in for exiting
3. **Consistency**: Use same durations for similar animations
4. **Accessibility**: Respect `prefers-reduced-motion`
5. **Fallbacks**: Ensure UI works without animations
