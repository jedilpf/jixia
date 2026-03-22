const fs = require('fs');
const path = require('path');
const {
  ROOT,
  resolveProjectPath,
} = require('./common.cjs');

function normalizePath(input) {
  return String(input || '').replace(/\\/g, '/').replace(/^\.\/+/, '');
}

function ensureDir(relativeDir) {
  const full = resolveProjectPath(relativeDir);
  fs.mkdirSync(full, { recursive: true });
  return full;
}

function resolveTaskPath(taskArg) {
  if (!taskArg) {
    throw new Error('missing --task path');
  }
  const normalized = normalizePath(taskArg);
  const full = path.isAbsolute(normalized)
    ? normalized
    : resolveProjectPath(normalized);
  return full;
}

function loadTask(taskArg) {
  const taskPath = resolveTaskPath(taskArg);
  if (!fs.existsSync(taskPath)) {
    throw new Error(`task file not found: ${taskArg}`);
  }
  let data = null;
  try {
    data = JSON.parse(fs.readFileSync(taskPath, 'utf8'));
  } catch (error) {
    throw new Error(`task JSON parse failed: ${error.message || error}`);
  }
  return {
    taskPath,
    taskRelPath: normalizePath(path.relative(ROOT, taskPath)),
    data,
  };
}

function validateTask(task) {
  const errors = [];
  const requiredString = ['task_id', 'goal'];
  for (const key of requiredString) {
    if (typeof task[key] !== 'string' || task[key].trim() === '') {
      errors.push(`${key} must be non-empty string`);
    }
  }

  const requiredArray = ['constraints', 'deliverables', 'allowed_write_paths', 'acceptance_commands'];
  for (const key of requiredArray) {
    if (!Array.isArray(task[key]) || task[key].length === 0) {
      errors.push(`${key} must be non-empty array`);
      continue;
    }
    for (const item of task[key]) {
      if (typeof item !== 'string' || item.trim() === '') {
        errors.push(`${key} must contain non-empty strings`);
        break;
      }
    }
  }

  if (task.status && typeof task.status !== 'string') {
    errors.push('status must be string when provided');
  }

  return errors;
}

function getArg(flag, fallback = null) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) {
    return fallback;
  }
  return process.argv[idx + 1] || fallback;
}

function nowIso() {
  return new Date().toISOString();
}

module.exports = {
  normalizePath,
  ensureDir,
  resolveTaskPath,
  loadTask,
  validateTask,
  getArg,
  nowIso,
};
