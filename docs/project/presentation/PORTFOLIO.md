# 《思筹之录》Portfolio Documentation

**Project Name**: 思筹之录 (Sī Chóu Zhī Lù)
**English**: Jixia: Strategic Thought Record
**Type**: AI-Assisted Cultural Strategy Card Game

> This document serves as the primary portfolio showcase for KMD submission.
> Last updated: 2026-04-25

---

## 1. Project Identity

### Official Name
**《思筹之录》** (Sī Chóu Zhī Lù)

### Tagline
*包罗万象，百家永生。* — A comprehensive strategy card game rooted in the rich tradition of the Hundred Schools of Thought.

### What This Game Is
A strategic card battle game where players deploy argument cards (立论) and tactic cards (施策) across two debate chambers (主议/旁议) to reach 8 Momentum (大势) first. The game combines cultural depth from Warring States philosophy with modern AI-assisted content generation.

### Why This Game Is Different
- **Cultural authenticity**: Each faction and card draws from real philosophical traditions (儒家、墨家、道家、法家、名家、阴阳家、纵横家、杂家、农家、小说家)
- **Two-layer resolution**: Immediate feedback after each play phase, no waiting for reveals
- **Position strategy**: Two-chamber layout creates meaningful tactical decisions about where to place cards

---

## 2. Architecture Overview

### Current Implementation: Battle V2 Engine
The mainline implementation uses `src/battleV2/engine.ts` — a self-contained battle system with its own state machine (`DebateBattleState`), AI strategy module, and rendering via `BattleFrameV2`.

```
App Shell (MvpFlowShell.tsx)
  ├── Pre-Battle Flow (screen navigation via appReducer)
  └── Battle V2 Engine (BattleFrameV2 + useDebateBattle)
        ├── DebateBattleState (internal battle state)
        ├── AI Strategy (aiStrategy.ts)
        └── Card Resolution (laneSystem.ts + cards.ts)
```

### Legacy Prototype: Core Engine
`src/core/gameEngine.ts` contains the original battle prototype. It is **deprecated and not used by the current battle system**. It remains in the codebase as a historical reference only. All battle logic in the current showcase runs through battleV2.

### State Management
- **Battle state**: Fully encapsulated in `useDebateBattle` hook — no external dependencies
- **App state**: Managed via `appReducer` for screen navigation (home → match → topic → faction_pick → loading → battle)

---

## 3. Game Rules Summary

### Victory Condition
First player to reach **8 Momentum (大势)** wins.

### Core Resources
| Resource | Chinese | Function |
|----------|---------|----------|
| Momentum | 大势 | Score — reach 8 to win |
| Cost | 用度 | Card deployment cost |
| Power | 辩锋 | Attack value |
| Vitality | 根基 | Health/hit points |
| Chips | 筹 | -1 cost to played card (max 1) |
| Shield | 护印 | Damage absorption |

### Turn Structure (Two-Layer Resolution)
```
Round Start
  → Gain cost (per round curve: R1=2, R2=3, R3=4, R4+=5)
  → Refill hand to 5

Layer 1: Play → Resolve
  → Player plays cards (max 2 total across both layers)
  → Immediate resolution of card effects

Layer 2: Play → Resolve
  → Player plays remaining cards
  → Immediate resolution

Round End
  → Discard excess cards
  → Draw to hand limit
```

### Battlefield Structure
Each player has **two chambers**:
- **主议 (Main Chamber)**: Win here → +1 Momentum
- **旁议 (Side Chamber)**: Win here → +1 Chip

Each chamber holds up to **3 立论** cards.

### Card Types
- **立论 (Argument)**: Unit cards with Power + Vitality, placed on the battlefield
- **施策 (Tactic)**: Instant-effect spell cards

### Phase Timing (Usability-Adjusted)
The current build uses extended phase durations for usability testing and AI deliberation:
- Play phases: 40 seconds each
- Resolution: 3 seconds each

These values are adjustable in `src/battleV2/engine.ts` (PHASE_DURATION constant). The design baseline is immediate resolution, with timing tuned for playtesting comfort.

---

## 4. Cultural Design Rationale

### Why Warring States Philosophy?
The Hundred Schools of Thought (百家争鸣) represents one of history's most fertile periods of intellectual debate. Each school advocated distinct philosophies through structured argumentation — making it a natural fit for a debate-based card game.

### Faction Design Philosophy
Each of the 10 factions represents a real philosophical school:

| Faction | School | Core Concept |
|---------|--------|-------------|
| 礼心殿 | 儒家 | Ritual and virtue |
| 衡戒廷 | 法家 | Strict law and order |
| 归真观 | 道家 | Natural simplicity |
| 玄匠盟 | 墨家 | Engineering and benefit |
| 九阵堂 | 兵家 | Military strategy |
| 名相府 | 名家 | Logic and epistemology |
| 纵横阁 | 纵横家 | Diplomacy and alliance |
| 杂学苑 | 杂家 | Eclectic synthesis |
| 农家 | 农家 | Agriculture primacy |
| 小说家 | 小说家 | Storytelling and anecdote |

### Card Design Principles
Each card in the 170-card collection:
1. Reflects the philosophical identity of its faction
2. Has a clearly defined resolution timing (no ambiguous "when X happens" triggers)
3. Creates meaningful tactical decisions about chamber placement

---

## 5. AI Integration

### Where AI Assists
- **Card narrative generation**: AI辅助卡牌背景文生成 (see `src/community/mockData.ts` for community-generated content patterns)
- **AI opponents**: `src/battleV2/aiStrategy.ts` implements decision-making for non-player battles
- **Content curation**: Community module enables player-submitted strategies and discussions

### AI Opponent Strategy
The AI evaluates plays based on:
- Board state advantage (power differential between chambers)
- Resource efficiency (cost-to-value ratio)
- Momentum race position (are we winning or losing?)
- Chip management (saving chips for high-impact plays)

---

## 6. Current Feature Status

### Implemented
- [x] Main menu with progress tracking
- [x] Faction selection flow
- [x] Topic/issue selection
- [x] Battle V2 engine with two-layer resolution
- [x] AI opponent with basic strategy
- [x] Card library with 170-card spec
- [x] Result screen with exp/gold rewards
- [x] Community module (posts, comments, likes)
- [x] Save system with profile persistence

### In Progress
- [ ] Full 170-card effect implementation (currently ~20 core cards)
- [ ] Complete UI visual polish
- [ ] Story mode chapters
- [ ] All 4 battlegrounds (currently standard only)

### Planned
- [ ] Writing system (着书) for mid-game progression
- [ ] Cross-cultural localization
- [ ] Multiplayer synchronization

---

## 7. Technical Stack

- **Framework**: React + TypeScript + Vite
- **State Management**: Zustand (app state), React hooks (battle state)
- **Styling**: CSS with design system tokens
- **Persistence**: localStorage-based profile system
- **AI**: Rule-based strategy evaluation

---

## 8. For KMD Reviewers

### "How do we know players understand the cultural concepts?"

The game layers cultural information:
1. **Card names and effects** reflect philosophical school identity
2. **Faction selection** introduces players to each school's core tenants
3. **Community module** allows players to discuss and share interpretations

### "How does AI enhance the cultural content?"

AI assists with narrative generation and provides believable opponents that encourage players to think strategically about their card choices rather than just optimizing numbers.

### "Is this playable?"

Yes. A complete battle flow (home → match → battle → result) is fully playable against AI. Average battle duration: 3-4 minutes.

---

## 9. Key File Reference

| Purpose | Path |
|---------|------|
| Main battle engine | `src/battleV2/engine.ts` |
| Battle UI | `src/components/BattleFrameV2.tsx` |
| AI strategy | `src/battleV2/aiStrategy.ts` |
| Card definitions | `src/battleV2/cards.ts` |
| Core types | `src/battleV2/types.ts` |
| Design rules | `docs/battle/battle-design-核心规则-v2.0.md` |
| Card spec | `docs/game-rules/card-collection-170-spec.md` |

---

*This document is the authoritative showcase reference for 思筹之录. For technical implementation details, refer to the design documents in `docs/`.*
