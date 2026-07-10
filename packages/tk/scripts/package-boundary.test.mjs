import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const execFileAsync = promisify(execFile);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(packageRoot, '../..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function markdownFiles(relativeDirectory) {
  const absoluteDirectory = join(packageRoot, relativeDirectory);
  return readdirSync(absoluteDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => `${relativeDirectory}/${entry.name}`)
    .sort();
}

async function dryRunPack() {
  const { stdout } = await execFileAsync(
    npmCommand,
    ['pack', '--dry-run', '--json', '--workspace', '@jarl_okbe/tk'],
    {
      cwd: workspaceRoot,
      maxBuffer: 20 * 1024 * 1024,
    },
  );
  const packs = JSON.parse(stdout);
  assert.equal(packs.length, 1, `expected one workspace pack result, got ${packs.length}`);
  return packs[0];
}

test('npm package includes required TK data and excludes runtime artifacts', async () => {
  const requiredDataFiles = [
    'data/.gitkeep',
    'data/report-structure-audit.json',
    'data/tk.catalog.json',
    'data/tk.lock.json',
    ...markdownFiles('data/reports'),
    ...markdownFiles('data/comparisons'),
  ];
  assert.ok(requiredDataFiles.some((file) => file.startsWith('data/reports/')), 'expected packaged reports');
  assert.ok(
    requiredDataFiles.some((file) => file.startsWith('data/comparisons/')),
    'expected packaged comparisons',
  );

  const pack = await dryRunPack();
  const packageFiles = new Set(pack.files.map((file) => file.path));
  const allowedDataFiles = new Set(requiredDataFiles);
  const missingRequiredFiles = requiredDataFiles.filter((file) => !packageFiles.has(file));
  const runtimeArtifacts = pack.files
    .map((file) => file.path)
    .filter((file) => file.startsWith('data/runs/'))
    .sort();
  const unexpectedDataFiles = pack.files
    .map((file) => file.path)
    .filter((file) => file.startsWith('data/'))
    .filter((file) => !allowedDataFiles.has(file))
    .filter((file) => !file.startsWith('data/runs/'))
    .sort();

  if (missingRequiredFiles.length > 0 || runtimeArtifacts.length > 0 || unexpectedDataFiles.length > 0) {
    assert.fail(
      [
        `missing required package data files: ${missingRequiredFiles.join(', ') || 'none'}`,
        `runtime artifacts in package: ${runtimeArtifacts.slice(0, 20).join(', ') || 'none'}`,
        `unexpected data files in package: ${unexpectedDataFiles.join(', ') || 'none'}`,
      ].join('\n'),
    );
  }
});
