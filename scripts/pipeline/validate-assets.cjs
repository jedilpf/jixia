const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SRC_DIR = path.join(ROOT, 'src');
const PUBLIC_DIR = path.join(ROOT, 'public');
const EXCLUDED_PATH_PATTERNS = [
  /[\\/]src[\\/]battleV2[\\/]testCards\.ts$/i,
];

const FILE_EXTENSIONS = new Set(['.ts', '.tsx']);
const ASSET_LITERAL_REGEX = /['"`]\/?(assets\/[A-Za-z0-9_\-./\u4e00-\u9fff]+)['"`]/g;

const REQUIRED_CORE_ASSETS = [
  'assets/card-back.png',
  'assets/card-frame.png',
  'assets/bg-main.png',
  'assets/bg-battle.png',
  'assets/transition.mp4',
  'assets/bell-sound.mp3',
  'assets/cost.png',
  'assets/hp.png',
  'assets/attack.png',
];

// Legacy references not yet shipped as physical assets.
// We keep them here as explicit debt so new missing paths still fail the gate.
const KNOWN_MISSING_ASSET_ALLOWLIST = new Set([
  'assets/shield.png',
  'assets/bg-prebattle.jpg',
]);

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }
    if (FILE_EXTENSIONS.has(path.extname(entry.name))) {
      if (EXCLUDED_PATH_PATTERNS.some((pattern) => pattern.test(fullPath))) {
        continue;
      }
      files.push(fullPath);
    }
  }
  return files;
}

function normalizeAssetPath(input) {
  return input.replace(/^\/+/, '').replace(/\\/g, '/');
}

function collectReferencedAssets(files) {
  const assets = new Map();

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    let match;
    while ((match = ASSET_LITERAL_REGEX.exec(content)) !== null) {
      const assetPath = normalizeAssetPath(match[1]);
      if (!assets.has(assetPath)) {
        assets.set(assetPath, []);
      }
      assets.get(assetPath).push(path.relative(ROOT, filePath).replace(/\\/g, '/'));
    }
  }

  return assets;
}

function main() {
  const srcFiles = walk(SRC_DIR);
  const referencedAssets = collectReferencedAssets(srcFiles);

  for (const assetPath of REQUIRED_CORE_ASSETS) {
    if (!referencedAssets.has(assetPath)) {
      referencedAssets.set(assetPath, ['<core-required>']);
    }
  }

  const missing = [];
  for (const [assetPath, refs] of referencedAssets.entries()) {
    if (KNOWN_MISSING_ASSET_ALLOWLIST.has(assetPath)) {
      continue;
    }
    const fullPath = path.join(PUBLIC_DIR, assetPath);
    if (!fs.existsSync(fullPath)) {
      missing.push({ assetPath, refs });
    }
  }

  if (missing.length > 0) {
    console.error(`[validate-assets] FAILED with ${missing.length} missing asset reference(s):`);
    for (const item of missing) {
      console.error(`- ${item.assetPath}`);
      for (const ref of item.refs.slice(0, 5)) {
        console.error(`  from: ${ref}`);
      }
      if (item.refs.length > 5) {
        console.error(`  ... ${item.refs.length - 5} more`);
      }
    }
    process.exit(1);
  }

  console.log(`[validate-assets] PASS (${referencedAssets.size} referenced asset path(s) checked)`);
}

main();
