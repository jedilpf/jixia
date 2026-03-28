/**
 * @legacy 旧版战斗结算器 — 仅供 src/core/gameEngine.ts 使用
 *
 * ⚠️  请勿在此文件中添加新功能。
 *     新的战斗结算逻辑请在 src/battleV2/engine.ts 中实现。
 */
import type { CardInstance, IssueDirectionId, PlayerId, PlayerState } from '@/core/types';

export interface ZoneResolveOutcome {
  winner: PlayerId | 'draw';
  playerPower: number;
  enemyPower: number;
  playerComboBonus: number;
  enemyComboBonus: number;
  playerDominantDirection: IssueDirectionId | null;
  enemyDominantDirection: IssueDirectionId | null;
}

export interface BattleResolveOutcome {
  winner: PlayerId | 'draw';
  main: ZoneResolveOutcome;
  side: ZoneResolveOutcome;
  momentumDelta: Record<PlayerId, number>;
}

function scoreCard(card: CardInstance): number {
  return Math.max(0, card.publicPower + Math.floor(card.attack / 2));
}

function getDominantDirection(cards: CardInstance[]): IssueDirectionId | null {
  const score: Record<IssueDirectionId, number> = {
    ritual: 0,
    economy: 0,
    strategy: 0,
  };

  cards.forEach((card) => {
    card.issueTags.forEach((tag) => {
      score[tag] += 1;
    });
  });

  const sorted = (Object.entries(score) as [IssueDirectionId, number][]).sort((a, b) => b[1] - a[1]);
  if (!sorted.length || sorted[0][1] <= 0) {
    return null;
  }
  if (sorted.length > 1 && sorted[0][1] === sorted[1][1]) {
    return null;
  }

  return sorted[0][0];
}

function calcComboBonus(cards: CardInstance[]): number {
  if (cards.length < 2) {
    return 0;
  }

  let bonus = 0;
  const factionCount = new Map<string, number>();
  const directionCount = new Map<IssueDirectionId, number>();

  cards.forEach((card, index) => {
    factionCount.set(card.factionId, (factionCount.get(card.factionId) ?? 0) + 1);
    card.issueTags.forEach((tag) => directionCount.set(tag, (directionCount.get(tag) ?? 0) + 1));

    // 简化版连锁：本牌若与前一张共享任意 comboTag，获得 +1。
    if (index > 0) {
      const prev = cards[index - 1];
      const hit = card.comboTags.some((tag) => prev.comboTags.includes(tag));
      if (hit) {
        bonus += 1;
      }
    }
  });

  factionCount.forEach((count) => {
    if (count >= 2) {
      bonus += count - 1;
    }
  });

  directionCount.forEach((count) => {
    if (count >= 2) {
      bonus += 1;
    }
  });

  return bonus;
}

function resolveZone(playerCards: CardInstance[], enemyCards: CardInstance[]): ZoneResolveOutcome {
  const playerComboBonus = calcComboBonus(playerCards);
  const enemyComboBonus = calcComboBonus(enemyCards);

  const playerPower = playerCards.reduce((sum, card) => sum + scoreCard(card), 0) + playerComboBonus;
  const enemyPower = enemyCards.reduce((sum, card) => sum + scoreCard(card), 0) + enemyComboBonus;

  let winner: PlayerId | 'draw' = 'draw';
  if (playerPower > enemyPower) {
    winner = 'player';
  } else if (enemyPower > playerPower) {
    winner = 'enemy';
  }

  return {
    winner,
    playerPower,
    enemyPower,
    playerComboBonus,
    enemyComboBonus,
    playerDominantDirection: getDominantDirection(playerCards),
    enemyDominantDirection: getDominantDirection(enemyCards),
  };
}

export function resolveBattle(player: PlayerState, enemy: PlayerState): BattleResolveOutcome {
  const main = resolveZone(player.board.mainQueue, enemy.board.mainQueue);
  const side = resolveZone(player.board.sideQueue, enemy.board.sideQueue);

  const momentumDelta: Record<PlayerId, number> = {
    player: main.winner === 'player' ? 1 : 0,
    enemy: main.winner === 'enemy' ? 1 : 0,
  };

  let winner: PlayerId | 'draw' = 'draw';
  if (momentumDelta.player > momentumDelta.enemy) {
    winner = 'player';
  } else if (momentumDelta.enemy > momentumDelta.player) {
    winner = 'enemy';
  }

  return {
    winner,
    main,
    side,
    momentumDelta,
  };
}
