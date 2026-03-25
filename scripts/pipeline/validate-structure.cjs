const {
  loadCards,
} = require('./common.cjs');

const REQUIRED_FIELDS = [
  'id',
  'name',
  'faction',
  'rarity',
  'type',
  'cost',
  'rules_text',
  'keyword_ids',
  'mechanic_ids',
  'lore_anchor_ids',
  'provenance',
  'status',
];

const ALLOWED_TYPES = new Set(['spell', 'minion', 'field', 'weapon']);
const ALLOWED_RARITIES = new Set(['common', 'rare', 'epic', 'legendary']);
const ALLOWED_STATUS = new Set(['active', 'planned', 'draft', 'rework', 'archived']);
const ALLOWED_DISPLAY_TYPES = new Set(['技能', '事件', '场地', '装备', '角色', '反制']);
const FACTION_ALIAS_MAP = {
  礼心殿: '儒家',
  儒家: '儒家',
  玄匠盟: '墨家',
  墨家: '墨家',
};

function push(errs, path, message) {
  errs.push(`${path}: ${message}`);
}

function normalizeFaction(faction) {
  const raw = typeof faction === 'string' ? faction.trim() : '';
  return FACTION_ALIAS_MAP[raw] || raw;
}

function visibleCatalogKey(data) {
  if (data.status === 'archived') {
    return null;
  }
  if (typeof data.name !== 'string' || data.name.trim() === '') {
    return null;
  }
  const normalizedFaction = normalizeFaction(data.faction);
  if (!normalizedFaction) {
    return null;
  }
  return `${normalizedFaction}::${data.name.trim()}`;
}

function main() {
  const { cards, parseErrors } = loadCards();
  const errors = [];

  if (parseErrors.length) {
    for (const item of parseErrors) {
      errors.push(`${item.filePath}: JSON parse failed -> ${item.error}`);
    }
  }

  if (cards.length === 0) {
    console.log('[validate-structure] No card files found in content/cards, skip.');
    process.exit(0);
  }

  const idSet = new Set();
  const visibleCatalogKeyMap = new Map();
  for (const cardFile of cards) {
    const { relativePath, data } = cardFile;

    for (const field of REQUIRED_FIELDS) {
      if (!(field in data)) {
        push(errors, relativePath, `missing required field "${field}"`);
      }
    }

    if (typeof data.id !== 'string' || !/^[A-Z0-9-]{6,}$/.test(data.id)) {
      push(errors, relativePath, 'id must match pattern ^[A-Z0-9-]{6,}$');
    } else if (idSet.has(data.id)) {
      push(errors, relativePath, `duplicated id "${data.id}"`);
    } else {
      idSet.add(data.id);
    }

    if (typeof data.name !== 'string' || data.name.trim() === '') {
      push(errors, relativePath, 'name must be non-empty string');
    }

    if (!ALLOWED_TYPES.has(data.type)) {
      push(errors, relativePath, `type must be one of ${Array.from(ALLOWED_TYPES).join(', ')}`);
    }

    if (!ALLOWED_RARITIES.has(data.rarity)) {
      push(errors, relativePath, `rarity must be one of ${Array.from(ALLOWED_RARITIES).join(', ')}`);
    }

    if (!Number.isInteger(data.cost) || data.cost < 0 || data.cost > 10) {
      push(errors, relativePath, 'cost must be integer between 0 and 10');
    }

    if (typeof data.rules_text !== 'string' || data.rules_text.trim() === '') {
      push(errors, relativePath, 'rules_text must be non-empty string');
    }

    if (!Array.isArray(data.keyword_ids)) {
      push(errors, relativePath, 'keyword_ids must be array');
    }

    if (!Array.isArray(data.mechanic_ids) || data.mechanic_ids.length === 0) {
      push(errors, relativePath, 'mechanic_ids must be non-empty array');
    }

    if (!Array.isArray(data.lore_anchor_ids) || data.lore_anchor_ids.length === 0) {
      push(errors, relativePath, 'lore_anchor_ids must be non-empty array');
    }

    if (typeof data.provenance !== 'object' || data.provenance === null || Array.isArray(data.provenance)) {
      push(errors, relativePath, 'provenance must be object');
    } else {
      for (const key of ['batch_id', 'models_used', 'canon_version', 'seed']) {
        if (!(key in data.provenance)) {
          push(errors, relativePath, `provenance missing "${key}"`);
        }
      }
      if (!Array.isArray(data.provenance.models_used) || data.provenance.models_used.length === 0) {
        push(errors, relativePath, 'provenance.models_used must be non-empty array');
      }
    }

    if (!ALLOWED_STATUS.has(data.status)) {
      push(errors, relativePath, `status must be one of ${Array.from(ALLOWED_STATUS).join(', ')}`);
    }

    if ('display_type' in data) {
      if (typeof data.display_type !== 'string' || !ALLOWED_DISPLAY_TYPES.has(data.display_type.trim())) {
        push(errors, relativePath, `display_type must be one of ${Array.from(ALLOWED_DISPLAY_TYPES).join(', ')}`);
      }
    }

    const catalogKey = visibleCatalogKey(data);
    if (catalogKey) {
      const firstPath = visibleCatalogKeyMap.get(catalogKey);
      if (firstPath) {
        push(errors, relativePath, `duplicate visible catalog card with ${firstPath} for key "${catalogKey}"`);
      } else {
        visibleCatalogKeyMap.set(catalogKey, relativePath);
      }
    }
  }

  if (errors.length > 0) {
    console.error(`[validate-structure] FAILED with ${errors.length} issue(s):`);
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }

  console.log(`[validate-structure] PASS (${cards.length} file(s))`);
}

main();
