import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function fileExists(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function runId(date = new Date()) {
  const stamp = date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, '');
  const random = Math.random().toString(36).slice(2, 8);
  return `run_${stamp}_${random}`;
}

function artifactPath(paths, runIdValue, name) {
  return join(paths.runsDir, runIdValue, name);
}

export function createRun(paths, metadata = {}) {
  ensureDir(paths.runsDir);
  const id = metadata.runId || runId();
  const dir = join(paths.runsDir, id);
  ensureDir(dir);
  return {
    runId: id,
    dir,
    relativeDir: `runs/${id}`,
  };
}

export function writeRunArtifact(paths, runIdValue, name, value) {
  const run = createRun(paths, { runId: runIdValue });
  const path = artifactPath(paths, run.runId, name);
  const text = typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`;
  writeFileSync(path, text);
  return path;
}

export function readRunArtifact(paths, runIdValue, name, options = {}) {
  const path = artifactPath(paths, runIdValue, name);
  if (!fileExists(path)) return null;
  const text = readFileSync(path, 'utf8');
  return options.json ? JSON.parse(text) : text;
}

export function artifactPaths(paths, runIdValue) {
  const runDir = join(paths.runsDir, runIdValue);
  if (!existsSync(runDir)) return {};
  return Object.fromEntries(
    readdirSync(runDir)
      .sort()
      .map((name) => [name, join(runDir, name)]),
  );
}

export function listRuns(paths, options = {}) {
  if (!existsSync(paths.runsDir)) return [];
  const limit = Number(options.limit || 20);
  return readdirSync(paths.runsDir)
    .filter((name) => name.startsWith('run_'))
    .map((name) => {
      const trace = readRunArtifact(paths, name, 'trace.json', { json: true });
      const plan = readRunArtifact(paths, name, 'plan.json', { json: true });
      const verification = readRunArtifact(paths, name, 'verification.json', { json: true });
      return {
        runId: name,
        generatedAt: trace?.generatedAt || plan?.generatedAt || verification?.generatedAt || null,
        result: verification?.status || trace?.result || 'unknown',
        capability: trace?.input?.capability || plan?.capability || null,
        references: plan?.references || trace?.input?.references || [],
      };
    })
    .sort((a, b) => String(b.generatedAt || '').localeCompare(String(a.generatedAt || '')) || b.runId.localeCompare(a.runId))
    .slice(0, Number.isFinite(limit) && limit > 0 ? limit : 20);
}

export function readRun(paths, runIdValue) {
  const runDir = join(paths.runsDir, runIdValue);
  if (!existsSync(runDir)) return null;
  return {
    runId: runIdValue,
    dir: runDir,
    artifacts: artifactPaths(paths, runIdValue),
    input: readRunArtifact(paths, runIdValue, 'input.json', { json: true }),
    references: readRunArtifact(paths, runIdValue, 'references.json', { json: true }),
    plan: readRunArtifact(paths, runIdValue, 'plan.json', { json: true }),
    verification: readRunArtifact(paths, runIdValue, 'verification.json', { json: true }),
    trace: readRunArtifact(paths, runIdValue, 'trace.json', { json: true }),
  };
}
