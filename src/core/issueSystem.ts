import type { IssueDefinition, IssueDirectionId, IssueState } from '@/core/types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function createIssueState(
  issue: IssueDefinition,
  triggerThreshold: number,
  burstCheckEvery: number,
): IssueState {
  return {
    id: issue.id,
    name: issue.name,
    stage: 'seed',
    heat: 0,
    directionScore: {
      ritual: 0,
      economy: 0,
      strategy: 0,
    },
    triggerThreshold,
    burstCheckEvery,
    lockedDirection: null,
    lastBurstRound: null,
  };
}

export function addIssueDirectionScore(
  issueState: IssueState,
  direction: IssueDirectionId,
  amount: number,
): IssueState {
  if (amount <= 0) {
    return issueState;
  }

  const nextDirectionScore = {
    ...issueState.directionScore,
    [direction]: issueState.directionScore[direction] + amount,
  };

  const nextHeat = issueState.heat + amount;

  return {
    ...issueState,
    stage: issueState.stage === 'seed' ? 'contested' : issueState.stage,
    heat: nextHeat,
    directionScore: nextDirectionScore,
  };
}

export function addIssuePushByTags(
  issueState: IssueState,
  tags: IssueDirectionId[],
  amount: number,
): IssueState {
  if (amount <= 0 || tags.length === 0) {
    return issueState;
  }

  return tags.reduce((acc, tag) => addIssueDirectionScore(acc, tag, amount), issueState);
}

export function getLeadingDirection(issueState: IssueState): IssueDirectionId | null {
  const sorted = Object.entries(issueState.directionScore)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA) as [IssueDirectionId, number][];

  if (!sorted.length || sorted[0][1] <= 0) {
    return null;
  }

  if (sorted.length > 1 && sorted[0][1] === sorted[1][1]) {
    return null;
  }

  return sorted[0][0];
}

export function getDirectionLead(issueState: IssueState): number {
  const sorted = Object.values(issueState.directionScore).sort((a, b) => b - a);
  const first = sorted[0] ?? 0;
  const second = sorted[1] ?? 0;
  return first - second;
}

export function shouldCheckBurst(round: number, burstCheckEvery: number): boolean {
  if (burstCheckEvery <= 0) {
    return false;
  }
  return round > 0 && round % burstCheckEvery === 0;
}

export function calculateBurstScore(
  issueState: IssueState,
  support: number,
  factionResonance: number,
  recentProgress: number,
): number {
  const heat = clamp(issueState.heat, 0, 100);
  const lead = clamp(getDirectionLead(issueState) * 8, 0, 100);
  const supportScore = clamp(support * 10, 0, 100);
  const resonanceScore = clamp(factionResonance * 10 + recentProgress * 5, 0, 100);

  return Math.round(heat * 0.4 + lead * 0.25 + supportScore * 0.2 + resonanceScore * 0.15);
}

export function checkBurstTrigger(
  burstScore: number,
  directThreshold: number,
  probabilityThreshold: number,
): { triggered: boolean; by: 'direct' | 'probability' | 'none' } {
  if (burstScore >= directThreshold) {
    return { triggered: true, by: 'direct' };
  }

  if (burstScore < probabilityThreshold) {
    return { triggered: false, by: 'none' };
  }

  const probabilityRange = Math.max(1, directThreshold - probabilityThreshold);
  const chance = clamp((burstScore - probabilityThreshold) / probabilityRange, 0, 1);
  const triggered = Math.random() < chance;

  return { triggered, by: triggered ? 'probability' : 'none' };
}

export function lockIssueDirection(
  issueState: IssueState,
  direction: IssueDirectionId,
  round: number,
): IssueState {
  return {
    ...issueState,
    stage: 'locked',
    lockedDirection: direction,
    lastBurstRound: round,
  };
}
