import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { buildCatalog, doctorRepo, validateCatalog, validateSourceLock } from '../lib/tk-core.mjs';

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

function tempRepoRoot() {
  const root = mkdtempSync(join(tmpdir(), 'tk-tag-regression-'));
  mkdirSync(join(root, 'reports'), { recursive: true });
  mkdirSync(join(root, 'comparisons'), { recursive: true });
  return root;
}

function writeReport(root, fileName, text) {
  writeFileSync(join(root, 'reports', fileName), text);
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

test('catalog tags use token boundaries and ignore inactive dependency evidence rows', () => {
  const root = tempRepoRoot();
  mkdirSync(join(root, 'projects', 'example__pixelle-fixture'), { recursive: true });
  writeFileSync(
    join(root, 'projects', 'example__pixelle-fixture', 'pyproject.toml'),
    `[project]
dependencies = [
  "fastmcp==2.0.0",
  "mcp==1.0.0",
  "streamlit==1.0.0",
  "fastapi==1.0.0",
  "ffmpeg-python==0.2.0",
  "comfyui==0.1.0",
]
`,
  );
  writeFileSync(
    join(root, 'README.md'),
    `# Fixture

## Project Index

### AI Media / Content Automation
| Project | Adoption |
|---|---|
| [Pixelle Fixture](./reports/pixelle-fixture.md) | PoC |

## Methodology
`,
  );
  writeReport(
    root,
    'pixelle-fixture.md',
    `# Pixelle Fixture 全量分析报告

> AI Media / Content Automation for video workflow runtime, browser client storage, and TTS narration.

| 字段 | 值 |
|---|---|
| 仓库 | https://github.com/example/pixelle-fixture |
| 语言 | Python |

### 依赖 / SDK 选型证据

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|---|---|---|---|---|---|---|
| fastmcp>=2.0.0 | Agent MCP CLI bridge | manifest 声明但源码未暴露 MCP server/tool | 当前没有 Agent-facing MCP/tool contract | pyproject.toml | none | unused/unimplemented |
| mcp>=1.0.0 | Agent MCP CLI bridge | declared-only manifest package | no agent-facing MCP/tool contract | pyproject.toml | none | unused/unimplemented |
| streamlit | UI runtime | browser workflow console | renders content operations | app.py | implemented | |
| fastapi | API runtime | HTTP API runtime | serves browser client requests with no custom tool needed | api.py | implemented | |
| ffmpeg | Media runtime | video transcoding | content automation uses ffmpeg | services/video.py | implemented | |
| comfyui | Workflow runtime | ComfyUI workflow execution | media generation workflow | workers.py | implemented | |
| tts | Media runtime | TTS narration | creates voiceover content | services/tts.py | implemented | |
`,
  );

  const project = buildCatalog({ repoRoot: root, sourceRoot: root, packageRoot }).projects.find((item) => item.id === 'pixelle-fixture');

  assert.ok(project, 'expected pixelle fixture project');
  assert.ok(project.dependencies.some((dependency) => dependency.name === 'mcp'), 'expected inactive dependency to stay in catalog');
  for (const tag of ['media', 'video', 'content', 'tts', 'ffmpeg', 'streamlit', 'fastapi', 'comfyui', 'python', 'workflow', 'runtime', 'browser']) {
    assert.ok(project.tags.includes(tag), `expected tag ${tag}, got: ${project.tags.join(', ')}`);
  }
  for (const tag of ['agent', 'mcp', 'cli', 'rag', 'coding']) {
    assert.equal(project.tags.includes(tag), false, `unexpected tag ${tag}: ${project.tags.join(', ')}`);
  }
});

test('catalog tags preserve explicit go token matching', () => {
  const root = tempRepoRoot();
  writeFileSync(
    join(root, 'README.md'),
    `# Fixture

## Project Index

### Runtime Tools
| Project | Adoption |
|---|---|
| [Go Fixture](./reports/go-fixture.md) | PoC |

## Methodology
`,
  );
  writeReport(
    root,
    'go-fixture.md',
    `# Go Fixture 全量分析报告

> Go runtime service for ergonomic storage clients.

| 字段 | 值 |
|---|---|
| 仓库 | https://github.com/example/go-fixture |
| 语言 | Go |

### 依赖 / SDK 选型证据

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|---|---|---|---|---|---|---|
| net/http | Runtime | Go HTTP runtime | serves API requests | server.go | implemented | |
`,
  );

  const project = buildCatalog({ repoRoot: root, sourceRoot: root, packageRoot }).projects.find((item) => item.id === 'go-fixture');

  assert.ok(project, 'expected go fixture project');
  assert.ok(project.tags.includes('go'), `expected go tag, got: ${project.tags.join(', ')}`);
  assert.equal(project.tags.includes('rag'), false, `unexpected rag tag: ${project.tags.join(', ')}`);
  assert.equal(project.tags.includes('cli'), false, `unexpected cli tag: ${project.tags.join(', ')}`);
});
