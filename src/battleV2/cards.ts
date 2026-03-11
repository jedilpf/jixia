/**
 * cards.ts — battleV2 战斗副牌
 *
 * 规则：
 *  - 使用 showcaseCards.ts 中的真实设定卡作为数据源，保持卡名/设定/门派一对一对应。
 *  - 图路径 = `assets/cards/${id}.jpg`；若实际文件不存在，返回 undefined，
 *    调用方可回退到按卡型提供的默认图。
 *  - 首发 Starter 牌库：从"礼心殿"和"名相府"两个门派各取5张（共10种），
 *    每张复制2份凑成 20 张完整牌库。
 */

import { DebateCard, Side } from './types';
import { CORE_FACTION_NAMES, FRAMEWORK_FACTION_BY_NAME, FRAMEWORK_FACTION_NAMES, pickSceneBiasFromRoutePreference, resolveFactionForCards, toFrameworkFactionName } from './factions';
import { CARDS, CardData } from '@/data/showcaseCards';

// ── 已有美术资源的卡牌 id 白名单 ─────────────────────────────────────
const ART_EXISTS = new Set([
  'wenyan', 'zhuduchao', 'jiangxi', 'sishi', 'libian',
  'tiequan', 'duanjian', 'jianyin', 'juwentang', 'chilin',
  'yunxiu', 'baoyi', 'dansha', 'taiqing', 'hebu',
  'liannuju', 'jimu', 'chengfang', 'jianshi', 'qianji',
  'jingqi', 'zhange', 'bingshu', 'fengjun', 'poji',
  'baima', 'mingshi', 'tongyi', 'cifeng', 'guibian',
]);

export function artPathForId(id: string): string | undefined {
  return ART_EXISTS.has(id) ? `assets/cards/${id}.jpg` : undefined;
}

// ── 从 CARDS 按 id 查找对应的设定 ────────────────────────────────────
const SHOWCASE_MAP: Record<string, CardData> = Object.fromEntries(CARDS.map((c) => [c.id, c]));
const CARDS_BY_FACTION: Record<string, CardData[]> = CARDS.reduce((acc, card) => {
  if (!acc[card.faction]) acc[card.faction] = [];
  acc[card.faction].push(card);
  return acc;
}, {} as Record<string, CardData[]>);

// ── 首发 Starter 牌库卡池（10种，各2份=20张）─────────────────────────
//   礼心殿：wenyan / zhuduchao / jiangxi / sishi / libian
//   名相府：baima  / mingshi  / tongyi  / cifeng / guibian
const STARTER_IDS: string[] = [
  'wenyan', 'zhuduchao', 'jiangxi', 'sishi', 'libian',
  'baima',  'mingshi',  'tongyi',  'cifeng', 'guibian',
];

const DEFAULT_GUEST_COUNT = 6;
const DEFAULT_COMMON_COUNT = 8;
const DEFAULT_FRAMEWORK_DECK_SIZE = 24;

export interface CreateStarterDeckOptions {
  // 兼容老逻辑：不传时仍使用 20 张固定 Starter
  useFactionFramework?: boolean;
  // 新逻辑：16 门派兼容框架
  mainFaction?: string;
  guestFactions?: string[];
  guestCount?: number;
  includeCommons?: number;
  deckSize?: number;
  forceClassicStarter?: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function dedupePreserveOrder<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const result: T[] = [];
  for (const item of arr) {
    if (seen.has(item)) continue;
    seen.add(item);
    result.push(item);
  }
  return result;
}

function getStableFactionCards(faction: string): CardData[] {
  const cards = CARDS_BY_FACTION[faction] ?? [];
  return [...cards].sort((a, b) => a.cost - b.cost || a.id.localeCompare(b.id));
}

function buildSignatureSlotMap(): Map<string, number> {
  const slotMap = new Map<string, number>();
  for (const faction of Object.keys(CARDS_BY_FACTION)) {
    const cards = getStableFactionCards(faction);
    cards.forEach((card, idx) => slotMap.set(card.id, idx + 1));
  }
  return slotMap;
}

const SIGNATURE_SLOT_BY_ID = buildSignatureSlotMap();
const CORE_FACTION_SET = new Set(CORE_FACTION_NAMES);

function showcaseToDebateCardFromSource(src: CardData): Omit<DebateCard, 'id'> {
  // 映射 showcaseCards 类型 → DebateCard effectKind
  type EffectKind = DebateCard['effectKind'];
  const typeMap: Record<string, EffectKind> = {
    '技能': 'draw',
    '事件': 'damage',
    '场地': 'shield',
    '装备': 'shield',
    '角色': 'summon_front',
    '反制': 'shixu',
  };

  const frameworkFaction = toFrameworkFactionName(src.faction);
  const blueprint = FRAMEWORK_FACTION_BY_NAME[frameworkFaction];
  const sceneBias = blueprint ? pickSceneBiasFromRoutePreference(blueprint.routePreference) : 'all';

  return {
    name: src.name,
    type: src.type === '角色' ? '门客'
      : src.type === '反制' ? '反诘'
        : src.type === '场地' ? '玄章'
          : src.type === '装备' ? '策术'
            : '立论',
    cost: Math.max(1, src.cost <= 3 ? src.cost : Math.round(src.cost / 2)),
    effectKind: typeMap[src.type] ?? 'draw',
    effectValue: src.attack ?? src.shield ?? (src.hp ? Math.ceil(src.hp / 2) : 1),
    art: artPathForId(src.id),
    prologue: src.background,
    description: src.skill,
    faction: frameworkFaction,
    factionCore: CORE_FACTION_SET.has(frameworkFaction),
    guestEligible: true,
    signatureSlot: SIGNATURE_SLOT_BY_ID.get(src.id),
    sceneBias,
    lanePreference: sceneBias === 'all' ? undefined : sceneBias,
  };
}

function showcaseToDebateCard(id: string): Omit<DebateCard, 'id'> | null {
  const src = SHOWCASE_MAP[id];
  if (!src) return null;
  return showcaseToDebateCardFromSource(src);
}

function buildCardId(side: Side, copy: number, id: string): string {
  return `${side}-c${copy}-${id}`;
}

function createClassicStarterDeck(side: Side): DebateCard[] {
  const deck: DebateCard[] = [];
  const copies = 2; // 每种卡2份

  for (let copy = 0; copy < copies; copy += 1) {
    for (const id of STARTER_IDS) {
      const base = showcaseToDebateCard(id);
      if (!base) continue;
      deck.push({ ...base, id: buildCardId(side, copy, id) });
    }
  }

  return deck;
}

function getDeckIdsForFactionFramework(
  mainFaction: string,
  guestFactions: string[],
  commonCount: number,
  deckSize: number
): string[] {
  const mainShowcaseFaction = resolveFactionForCards(mainFaction);
  const mainIds = getStableFactionCards(mainShowcaseFaction).slice(0, 10).map((c) => c.id);

  const guestShowcaseFactions = dedupePreserveOrder(
    guestFactions.map((f) => resolveFactionForCards(f)).filter((f) => f && f !== mainShowcaseFaction)
  ).filter((f) => (CARDS_BY_FACTION[f]?.length ?? 0) > 0);

  // 每个客派贡献 1 张代表牌
  const guestIds = guestShowcaseFactions
    .map((faction) => getStableFactionCards(faction)[0]?.id)
    .filter((id): id is string => Boolean(id));

  const selectedIds = dedupePreserveOrder([...mainIds, ...guestIds]);

  const commonsPool = CARDS
    .filter((card) => !selectedIds.includes(card.id))
    .sort((a, b) => a.cost - b.cost || a.id.localeCompare(b.id));
  const commonIds = commonsPool.slice(0, Math.max(0, commonCount)).map((c) => c.id);

  const baseIds = dedupePreserveOrder([...selectedIds, ...commonIds]);
  if (baseIds.length === 0) return [];

  const result: string[] = [];
  for (let i = 0; i < deckSize; i += 1) {
    result.push(baseIds[i % baseIds.length]);
  }
  return result;
}

export function listShowcaseFactions(): string[] {
  return Object.keys(CARDS_BY_FACTION).sort((a, b) => a.localeCompare(b));
}

export function rollGuestFactions(mainFaction: string, count = DEFAULT_GUEST_COUNT): string[] {
  const normalizedMain = toFrameworkFactionName(mainFaction);
  const candidates = FRAMEWORK_FACTION_NAMES.filter((f) => f !== normalizedMain);
  return shuffleArray([...candidates]).slice(0, Math.max(0, count));
}

export function createStarterDeck(side: Side, options?: CreateStarterDeckOptions): DebateCard[] {
  if (options?.forceClassicStarter) return createClassicStarterDeck(side);

  const useFramework = Boolean(
    options?.useFactionFramework ||
    options?.mainFaction ||
    (options?.guestFactions && options.guestFactions.length > 0)
  );
  if (!useFramework) return createClassicStarterDeck(side);

  const mainFaction = toFrameworkFactionName(options?.mainFaction ?? CORE_FACTION_NAMES[0]);
  const guestFactions = options?.guestFactions?.length
    ? options.guestFactions.map((f) => toFrameworkFactionName(f))
    : rollGuestFactions(mainFaction, options?.guestCount ?? DEFAULT_GUEST_COUNT);
  const commonCount = options?.includeCommons ?? DEFAULT_COMMON_COUNT;
  const deckSize = options?.deckSize ?? DEFAULT_FRAMEWORK_DECK_SIZE;

  const ids = getDeckIdsForFactionFramework(mainFaction, guestFactions, commonCount, deckSize);
  const deck: DebateCard[] = [];
  ids.forEach((id, idx) => {
    const src = SHOWCASE_MAP[id];
    if (!src) return;
    const base = showcaseToDebateCardFromSource(src);
    deck.push({ ...base, id: `${side}-f${idx}-${id}` });
  });

  if (deck.length === 0) return createClassicStarterDeck(side);
  return deck;
}
