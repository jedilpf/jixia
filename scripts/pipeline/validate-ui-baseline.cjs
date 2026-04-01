const fs = require('fs');
const path = require('path');

function readUtf8(relPath) {
  const fullPath = path.resolve(process.cwd(), relPath);
  return fs.readFileSync(fullPath, 'utf8');
}

function fail(message) {
  console.error(`[validate-ui-baseline] ${message}`);
  process.exit(1);
}

function assertPattern(content, ruleName, pattern) {
  if (!pattern.test(content)) {
    fail(`Missing required baseline rule: ${ruleName}`);
  }
}

function countCardsFromShowcase(showcaseSource) {
  return (showcaseSource.match(/\{\s*id:\s*'/g) ?? []).length;
}

function main() {
  const showcaseSource = readUtf8('src/data/showcaseCards.ts');
  const appSource = readUtf8('src/App.tsx');

  const cardCount = countCardsFromShowcase(showcaseSource);
  const minCards = 100;
  if (cardCount < minCards) {
    fail(`Card corpus too small: ${cardCount} (required >= ${minCards})`);
  }

  const requiredAppRules = [
    {
      name: 'MainMenu story entry',
      pattern: /onStory=\{\(\)\s*=>\s*setScreen\('story'\)\}/,
    },
    {
      name: 'MainMenu collection entry',
      pattern: /onCollection=\{\(\)\s*=>\s*setScreen\('collection'\)\}/,
    },
    {
      name: 'MainMenu characters entry',
      pattern: /onCharacters=\{\(\)\s*=>\s*setScreen\('characters'\)\}/,
    },
    {
      name: 'Story screen branch',
      pattern: /screen === 'story'/,
    },
    {
      name: 'Collection screen branch',
      pattern: /screen === 'collection'/,
    },
    {
      name: 'Characters screen branch',
      pattern: /screen === 'characters'/,
    },
  ];

  for (const rule of requiredAppRules) {
    assertPattern(appSource, rule.name, rule.pattern);
  }

  console.log(
    `[validate-ui-baseline] PASS (cards=${cardCount}, main-menu-rules=${requiredAppRules.length})`
  );
}

main();
