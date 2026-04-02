const fs = require('fs');
const path = require('path');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function writeJsonAtomically(filePath, data) {
  const directory = path.dirname(filePath);
  fs.mkdirSync(directory, { recursive: true });

  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpPath, filePath);
}

function createJsonFileStore({ filePath, defaultData }) {
  const resolvedPath = path.resolve(filePath);
  let state;

  function loadState() {
    if (!fs.existsSync(resolvedPath)) {
      const fallback = clone(defaultData);
      writeJsonAtomically(resolvedPath, fallback);
      return fallback;
    }

    try {
      const raw = fs.readFileSync(resolvedPath, 'utf8');
      if (!raw.trim()) {
        const fallback = clone(defaultData);
        writeJsonAtomically(resolvedPath, fallback);
        return fallback;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        const fallback = clone(defaultData);
        writeJsonAtomically(resolvedPath, fallback);
        return fallback;
      }
      return parsed;
    } catch {
      const fallback = clone(defaultData);
      writeJsonAtomically(resolvedPath, fallback);
      return fallback;
    }
  }

  function persist(nextState) {
    state = clone(nextState);
    writeJsonAtomically(resolvedPath, state);
    return clone(state);
  }

  state = loadState();

  return {
    filePath: resolvedPath,
    getState() {
      return clone(state);
    },
    setState(nextState) {
      return persist(nextState);
    },
    update(updater) {
      const draft = clone(state);
      const maybeNext = updater(draft);
      const nextState = maybeNext === undefined ? draft : maybeNext;
      return persist(nextState);
    },
    reload() {
      state = loadState();
      return clone(state);
    },
  };
}

module.exports = {
  createJsonFileStore,
};
