const {
  loadCards,
  extractYamlTerms,
  extractYamlList,
} = require('./common.cjs');

function normalizeToken(token) {
  return token
    .replace(/[0-9０-９+\-]/g, '')
    .replace(/[()（）]/g, '')
    .trim();
}

function main() {
  const { cards, parseErrors } = loadCards();
  const errors = [];

  if (parseErrors.length > 0) {
    for (const item of parseErrors) {
      errors.push(`${item.filePath}: JSON parse failed -> ${item.error}`);
    }
  }

  if (cards.length === 0) {
    console.log('[validate-terminology] No card files found in content/cards, skip.');
    process.exit(0);
  }

  const registeredTerms = new Set(extractYamlTerms('canon/terminology.yaml'));
  const forbiddenTerms = extractYamlList('canon/taboo.yaml', 'forbidden_mechanic_terms');

  for (const cardFile of cards) {
    const { relativePath, data } = cardFile;

    const keywordIds = Array.isArray(data.keyword_ids) ? data.keyword_ids : [];
    for (const keyword of keywordIds) {
      if (!registeredTerms.has(keyword)) {
        errors.push(`${relativePath}: keyword "${keyword}" is not registered in canon/terminology.yaml`);
      }
    }

    const rulesText = typeof data.rules_text === 'string' ? data.rules_text : '';
    const matches = [...rulesText.matchAll(/【([^】]+)】/g)];
    for (const match of matches) {
      const raw = match[1];
      const normalized = normalizeToken(raw);
      if (normalized.length > 0 && !registeredTerms.has(normalized)) {
        errors.push(`${relativePath}: rule token "${raw}" -> "${normalized}" is not registered`);
      }
    }

    for (const forbidden of forbiddenTerms) {
      if (forbidden && rulesText.includes(forbidden)) {
        errors.push(`${relativePath}: contains forbidden term "${forbidden}"`);
      }
    }
  }

  if (errors.length > 0) {
    console.error(`[validate-terminology] FAILED with ${errors.length} issue(s):`);
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }

  console.log(`[validate-terminology] PASS (${cards.length} file(s))`);
}

main();
