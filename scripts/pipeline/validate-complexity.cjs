const {
  loadCards,
  extractYamlNumber,
} = require('./common.cjs');

function main() {
  const { cards, parseErrors } = loadCards();
  const errors = [];

  if (parseErrors.length > 0) {
    for (const item of parseErrors) {
      errors.push(`${item.filePath}: JSON parse failed -> ${item.error}`);
    }
  }

  if (cards.length === 0) {
    console.log('[validate-complexity] No card files found in content/cards, skip.');
    process.exit(0);
  }

  const maxRulesTextLength = extractYamlNumber('canon/taboo.yaml', 'max_rules_text_length') ?? 25;
  const maxKeywordsPerCard = extractYamlNumber('canon/taboo.yaml', 'max_keywords_per_card') ?? 2;
  const maxRuleSentences = extractYamlNumber('canon/taboo.yaml', 'max_rules_sentences') ?? 2;

  for (const cardFile of cards) {
    const { relativePath, data } = cardFile;
    const rulesText = typeof data.rules_text === 'string' ? data.rules_text.trim() : '';
    const keywordIds = Array.isArray(data.keyword_ids) ? data.keyword_ids : [];

    if (rulesText.length > maxRulesTextLength) {
      errors.push(`${relativePath}: rules_text length ${rulesText.length} exceeds ${maxRulesTextLength}`);
    }

    if (keywordIds.length > maxKeywordsPerCard) {
      errors.push(`${relativePath}: keyword count ${keywordIds.length} exceeds ${maxKeywordsPerCard}`);
    }

    const sentenceCount = rulesText
      .split(/[。！？!?；;]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .length;
    if (sentenceCount > maxRuleSentences) {
      errors.push(`${relativePath}: sentence count ${sentenceCount} exceeds ${maxRuleSentences}`);
    }
  }

  if (errors.length > 0) {
    console.error(`[validate-complexity] FAILED with ${errors.length} issue(s):`);
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }

  console.log(`[validate-complexity] PASS (${cards.length} file(s))`);
}

main();
