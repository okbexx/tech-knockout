import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { doctorRepo, validateCatalog, validateSourceLock } from '../lib/tk-core.mjs';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function baseProject(overrides = {}) {
  return {
    id: 'current-project',
    name: 'Current Project',
    repo: 'example/current-project',
    url: 'https://github.com/example/current-project',
    cloneUrl: 'https://github.com/example/current-project.git',
    report: 'reports/current-project.md',
    reportFile: 'current-project',
    category: null,
    summary: null,
    adoption: null,
    architectureValue: null,
    license: null,
    language: null,
    analysisDate: '2026-07-10',
    sourceDir: 'projects/example__current-project',
    owner: 'example',
    sourceExists: false,
    dependencySummary: {
      total: 0,
      manifests: 0,
      byEcosystem: {},
      byScope: {},
    },
    dependencies: [],
    dependencyEvidencePresent: true,
    dependencyEvidence: [],
    tags: [],
    ...overrides,
  };
}

function catalog(projects = [baseProject()]) {
  return {
    schemaVersion: 2,
    generatedAt: '2026-07-10T00:00:00.000Z',
    projects,
    comparisons: [],
  };
}

function tempPackageRoot() {
  const root = mkdtempSync(join(tmpdir(), 'tk-catalog-invariants-'));
  mkdirSync(join(root, 'schemas'), { recursive: true });
  mkdirSync(join(root, 'data', 'reports'), { recursive: true });
  copyFileSync(join(packageRoot, 'schemas', 'catalog.schema.json'), join(root, 'schemas', 'catalog.schema.json'));
  copyFileSync(join(packageRoot, 'schemas', 'source-lock.schema.json'), join(root, 'schemas', 'source-lock.schema.json'));
  copyFileSync(
    join(packageRoot, 'schemas', 'report-structure-audit.schema.json'),
    join(root, 'schemas', 'report-structure-audit.schema.json'),
  );
  copyFileSync(
    join(packageRoot, 'schemas', 'replication-plan.schema.json'),
    join(root, 'schemas', 'replication-plan.schema.json'),
  );
  copyFileSync(
    join(packageRoot, 'schemas', 'verification-result.schema.json'),
    join(root, 'schemas', 'verification-result.schema.json'),
  );
  copyFileSync(join(packageRoot, 'schemas', 'run-trace.schema.json'), join(root, 'schemas', 'run-trace.schema.json'));
  return root;
}

function lock(ids = ['current-project']) {
  return {
    generatedAt: '2026-07-10T00:00:00.000Z',
    sources: ids.map((id) => ({
      id,
      repo: `example/${id}`,
      url: `https://github.com/example/${id}`,
      cloneUrl: `https://github.com/example/${id}.git`,
      sourceDir: `projects/example__${id}`,
      exists: false,
    })),
  };
}

function writePackageIndex(root, { projects = [baseProject()], sourceLock = lock() } = {}) {
  mkdirSync(join(root, 'data'), { recursive: true });
  writeFileSync(join(root, 'data', 'tk.catalog.json'), `${JSON.stringify(catalog(projects), null, 2)}\n`);
  writeFileSync(join(root, 'data', 'tk.lock.json'), `${JSON.stringify(sourceLock, null, 2)}\n`);
  for (const project of projects) {
    const reportFile = project.report.split('/').pop();
    writeFileSync(join(root, 'data', 'reports', reportFile), '# Fixture Report\n');
  }
  writeFileSync(
    join(root, 'data', 'report-structure-audit.json'),
    `${JSON.stringify({ schemaVersion: 1, summary: { failedReports: 0 } }, null, 2)}\n`,
  );
}

test('catalog validation fails when a project has no packaged report snapshot', () => {
  const root = tempPackageRoot();
  const result = validateCatalog(catalog(), { packageRoot: root, repoRoot: root, sourceRoot: root });

  assert.equal(result.ok, false);
  assert.ok(
    result.errors.some((error) => error.includes('current-project missing packaged report')),
    `expected missing packaged report error, got: ${result.errors.join('; ')}`,
  );
});

test('source lock validation fails when it contains a stale project id', () => {
  const root = tempPackageRoot();
  writePackageIndex(root, { sourceLock: lock(['current-project', 'pruned-project']) });
  const result = validateSourceLock(lock(['current-project', 'pruned-project']), {
    packageRoot: root,
    repoRoot: root,
    sourceRoot: root,
  });

  assert.equal(result.ok, false);
  assert.ok(
    result.errors.some((error) => error.includes('pruned-project source lock entry has no catalog project')),
    `expected stale source lock error, got: ${result.errors.join('; ')}`,
  );
});

test('repo doctor fails when the persisted packaged source lock has a stale id', async () => {
  const root = tempPackageRoot();
  writePackageIndex(root, { sourceLock: lock(['current-project', 'pruned-project']) });
  const result = await doctorRepo({ packageRoot: root, repoRoot: root, sourceRoot: root });
  const check = result.checks.find((item) => item.name === 'source_lock_valid');

  assert.equal(result.ok, false);
  assert.ok(check, 'expected source_lock_valid check');
  assert.equal(check.ok, false);
  assert.ok(
    check.details.some((detail) => detail.includes('pruned-project source lock entry has no catalog project')),
    `expected stale source lock detail, got: ${check.details.join('; ')}`,
  );
});

test('repo doctor passes when the persisted packaged source lock matches the catalog', async () => {
  const root = tempPackageRoot();
  writePackageIndex(root);
  const result = await doctorRepo({ packageRoot: root, repoRoot: root, sourceRoot: root });
  const check = result.checks.find((item) => item.name === 'source_lock_valid');

  assert.ok(check, 'expected source_lock_valid check');
  assert.equal(check.ok, true, check.details.join('; '));
});
