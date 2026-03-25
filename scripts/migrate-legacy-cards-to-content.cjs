const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'cards');
const SHOWCASE_PATH = path.join(ROOT, 'src', 'data', 'showcaseCards.ts');
const DB_PATH = path.join(ROOT, 'src', 'data', 'cardsDB.json');

const BATCH_ID = 'BATCH-20260324-LEGACY-MIGRATION';
const PROVENANCE = {
  batch_id: BATCH_ID,
  models_used: ['codex'],
  canon_version: '0.1.0',
  seed: 'legacy-migration',
};

const TYPE_MAP = {
  spell: 'spell',
  minion: 'minion',
  field: 'field',
  weapon: 'weapon',
  '技能': 'spell',
  '事件': 'spell',
  '反制': 'spell',
  '角色': 'minion',
  '场地': 'field',
  '装备': 'weapon',
};

const RARITY_MAP = {
  common: 'common',
  rare: 'rare',
  epic: 'epic',
  legendary: 'legendary',
  '常见': 'common',
  '稀有': 'rare',
  '史诗': 'epic',
  '传说': 'legendary',
};

const FACTION_ALIAS_MAP = {
  礼心殿: '儒家',
  儒家: '儒家',
  玄匠盟: '墨家',
  墨家: '墨家',
};

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

function safeText(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeCost(cost) {
  if (!Number.isFinite(cost)) return 1;
  const intValue = Math.trunc(Number(cost));
  if (intValue < 0) return 0;
  if (intValue > 10) return 10;
  return intValue;
}

function toAllowedType(rawType) {
  return TYPE_MAP[rawType] || 'spell';
}

function toAllowedRarity(rawRarity) {
  return RARITY_MAP[rawRarity] || 'common';
}

function normalizeFaction(rawFaction) {
  const faction = safeText(rawFaction, '');
  return FACTION_ALIAS_MAP[faction] || faction;
}

function sanitizeIdPart(raw) {
  const normalized = String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized.length > 0 ? normalized : 'CARD';
}

function buildContentId(sourceTag, legacyId, usedIds) {
  const prefix = sourceTag === 'showcase' ? 'LEG-SC-' : 'LEG-DB-';
  const base = `${prefix}${sanitizeIdPart(legacyId)}`;
  let nextId = base;
  let seq = 2;
  while (usedIds.has(nextId)) {
    nextId = `${base}-${seq}`;
    seq += 1;
  }
  usedIds.add(nextId);
  return nextId;
}

function dedupeKey(card) {
  return [
    safeText(card.name, ''),
    safeText(card.faction, ''),
    safeText(card.rulesText, ''),
  ].join('||');
}

function identityKey(card) {
  return [
    safeText(card.name, ''),
    normalizeFaction(card.faction),
  ].join('||');
}

function parseShowcaseCards() {
  const source = fs.readFileSync(SHOWCASE_PATH, 'utf8');
  const executable = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const context = { module: { exports: {} }, exports: {} };
  vm.runInNewContext(executable, context, { filename: 'showcaseCards.ts' });
  const cards = context.module.exports.CARDS || context.exports.CARDS;
  if (!Array.isArray(cards)) {
    throw new Error('Failed to parse CARDS array from src/data/showcaseCards.ts');
  }
  return cards.map((card) => ({
    source: 'showcase',
    legacyId: safeText(card.id, ''),
    name: safeText(card.name, '未命名旧卡'),
    faction: safeText(card.faction, '未定门派'),
    type: safeText(card.type, '技能'),
    rarity: safeText(card.rarity, '常见'),
    cost: normalizeCost(card.cost),
    rulesText: safeText(card.skill, '暂未开放'),
    background: safeText(card.background, 'Legacy import from showcaseCards.ts'),
  }));
}

function parseCardsDb() {
  const cards = readJson(DB_PATH);
  if (!Array.isArray(cards)) return [];
  return cards.map((card) => ({
    source: 'cardsDB',
    legacyId: safeText(card.id, ''),
    name: safeText(card.name, '未命名旧卡'),
    faction: safeText(card.school, '未定门派'),
    type: safeText(card.raw_text?.type || card.type, '技能'),
    rarity: safeText(card.rarity, '常见'),
    cost: normalizeCost(card.cost),
    rulesText: safeText(card.description || card.raw_text?.description, '暂未开放'),
    background: safeText(card.raw_text?.bg, 'Legacy import from cardsDB.json'),
  }));
}

function loadExistingCardIndex() {
  const existing = {
    ids: new Set(),
    dedupe: new Set(),
    identity: new Set(),
  };

  if (!fs.existsSync(CONTENT_DIR)) {
    return existing;
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((name) => name.endsWith('.json'));
  for (const fileName of files) {
    const fullPath = path.join(CONTENT_DIR, fileName);
    try {
      const card = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (card?.id) existing.ids.add(String(card.id));
      const key = dedupeKey({
        name: card?.name,
        faction: card?.faction,
        rulesText: card?.rules_text,
      });
      if (key !== '||') existing.dedupe.add(key);
      const identity = identityKey({
        name: card?.name,
        faction: card?.faction,
      });
      if (identity !== '||') existing.identity.add(identity);
    } catch {
      // Keep migration resilient; parse failures are handled by validators later.
    }
  }
  return existing;
}

function toContentCard(entry, usedIds) {
  const contentId = buildContentId(entry.source, entry.legacyId, usedIds);
  return {
    id: contentId,
    name: entry.name,
    faction: entry.faction,
    rarity: toAllowedRarity(entry.rarity),
    type: toAllowedType(entry.type),
    cost: normalizeCost(entry.cost),
    rules_text: entry.rulesText,
    keyword_ids: [],
    mechanic_ids: ['MEC-CORE-TEMPO'],
    lore_anchor_ids: ['ANC-WORLD-001', 'ANC-RULE-001'],
    provenance: PROVENANCE,
    status: 'planned',
    notes: `legacy_source=${entry.source}; legacy_id=${entry.legacyId}; migrated_at=2026-03-24`,
  };
}

function main() {
  const existing = loadExistingCardIndex();
  const legacyCards = [
    ...parseShowcaseCards(),
    ...parseCardsDb(),
  ];

  const deduped = [];
  const seenLegacy = new Set();
  const seenIdentity = new Set(existing.identity);

  for (const card of legacyCards) {
    const key = dedupeKey(card);
    const identity = identityKey(card);
    if (key === '||') continue;
    if (existing.dedupe.has(key)) continue;
    if (identity !== '||' && seenIdentity.has(identity)) continue;
    if (seenLegacy.has(key)) continue;
    seenLegacy.add(key);
    if (identity !== '||') {
      seenIdentity.add(identity);
    }
    deduped.push(card);
  }

  let created = 0;
  for (const entry of deduped) {
    const contentCard = toContentCard(entry, existing.ids);
    const filePath = path.join(CONTENT_DIR, `${contentCard.id}.json`);
    fs.writeFileSync(filePath, `${JSON.stringify(contentCard, null, 2)}\n`, 'utf8');
    created += 1;
  }

  console.log(`[migrate-legacy-cards] Created ${created} planned card file(s) in content/cards`);
  console.log(`[migrate-legacy-cards] Skipped existing/duplicate entries: ${legacyCards.length - created}`);
}

main();
