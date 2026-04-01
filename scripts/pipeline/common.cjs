const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');

function resolveProjectPath(...parts) {
  return path.join(ROOT, ...parts);
}

function readUtf8(relativePath) {
  const fullPath = resolveProjectPath(relativePath);
  return fs.readFileSync(fullPath, 'utf8');
}

function listFilesRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(fullPath));
      continue;
    }
    files.push(fullPath);
  }
  return files;
}

function listCardFiles() {
  const cardsDir = resolveProjectPath('content', 'cards');
  return listFilesRecursive(cardsDir)
    .filter((filePath) => filePath.toLowerCase().endsWith('.json'))
    .sort();
}

function loadCards() {
  const files = listCardFiles();
  const cards = [];
  const parseErrors = [];
  for (const filePath of files) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      cards.push({
        filePath,
        relativePath: path.relative(ROOT, filePath).replace(/\\/g, '/'),
        data: JSON.parse(raw),
      });
    } catch (error) {
      parseErrors.push({
        filePath: path.relative(ROOT, filePath).replace(/\\/g, '/'),
        error: String(error.message || error),
      });
    }
  }
  return { cards, parseErrors };
}

function extractYamlIds(relativePath) {
  const content = readUtf8(relativePath);
  const ids = [];
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*-\s*id:\s*([A-Za-z0-9_.-]+)/);
    if (match) {
      ids.push(match[1]);
    }
  }
  return ids;
}

function extractYamlTerms(relativePath) {
  const content = readUtf8(relativePath);
  const terms = [];
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*-\s*term:\s*(.+?)\s*$/);
    if (match) {
      terms.push(match[1].trim());
    }
  }
  return terms;
}

function extractYamlList(relativePath, sectionKey) {
  const lines = readUtf8(relativePath).split(/\r?\n/);
  const list = [];
  let inSection = false;
  let sectionIndent = null;
  for (const line of lines) {
    const sectionMatch = line.match(/^(\s*)([A-Za-z0-9_]+):\s*$/);
    if (sectionMatch) {
      const [, indent, key] = sectionMatch;
      if (key === sectionKey) {
        inSection = true;
        sectionIndent = indent.length;
        continue;
      }
      if (inSection && indent.length <= sectionIndent) {
        break;
      }
    }

    if (!inSection) {
      continue;
    }

    const itemMatch = line.match(/^\s*-\s*(.+?)\s*$/);
    if (itemMatch) {
      list.push(itemMatch[1].trim());
    }
  }
  return list;
}

function extractYamlNumber(relativePath, key) {
  const content = readUtf8(relativePath);
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^\\s*${escapedKey}:\\s*(\\d+)\\s*$`, 'm');
  const match = content.match(regex);
  if (!match) {
    return null;
  }
  return Number(match[1]);
}

function runNodeScript(relativePath) {
  return runNodeScriptWithArgs(relativePath, []);
}

function runNodeScriptWithArgs(relativePath, args) {
  const scriptPath = resolveProjectPath(relativePath);
  const result = spawnSync(process.execPath, [scriptPath, ...(args || [])], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  return result.status === null ? 1 : result.status;
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

module.exports = {
  ROOT,
  resolveProjectPath,
  readUtf8,
  loadCards,
  extractYamlIds,
  extractYamlTerms,
  extractYamlList,
  extractYamlNumber,
  runNodeScript,
  runNodeScriptWithArgs,
  rel,
};
