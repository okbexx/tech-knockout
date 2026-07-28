import { execFile, execFileSync } from 'node:child_process';
import { accessSync, constants as fsConstants, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { homedir } from 'node:os';
import Ajv2020 from 'ajv/dist/2020.js';
import envPaths from 'env-paths';
import { applyEdits, modify, parse as parseJsonc } from 'jsonc-parser';
import { parse as parseToml } from 'smol-toml';
import { parseDocument as parseYamlDocument } from 'yaml';
import { auditReportStructure } from './report-structure.mjs';
import { createRun, listRuns as listStoredRuns, readRun as readStoredRun, writeRunArtifact } from './runtime/run-store.mjs';

const execFileAsync = promisify(execFile);
const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const USER_PATHS = envPaths('tech-knockout', { suffix: '' });

export function findRepoRoot(startDir = process.cwd()) {
  return findTkRepoRoot(startDir) || PACKAGE_ROOT;
}

function findTkRepoRoot(startDir = process.cwd()) {
  let current = resolve(startDir);
  while (true) {
    if (existsSync(join(current, 'reports')) && existsSync(join(current, 'comparisons'))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

export function getPaths(options = {}) {
  const configuredRepoRoot = options.repoRoot || process.env.TK_REPO_ROOT;
  const discoveredRepoRoot = configuredRepoRoot ? resolve(configuredRepoRoot) : findTkRepoRoot();
  const repoRoot = discoveredRepoRoot || PACKAGE_ROOT;
  const sourceRoot = resolve(options.sourceRoot || process.env.TK_SOURCE_ROOT || (discoveredRepoRoot ? repoRoot : USER_PATHS.cache));
  const packageRoot = resolve(options.packageRoot || options.pluginRoot || PACKAGE_ROOT);
  const dataDir = join(packageRoot, 'data');
  const runtimeDataDir = resolve(
    options.runtimeDataDir || process.env.TK_RUNTIME_DATA_ROOT || (discoveredRepoRoot ? dataDir : USER_PATHS.data),
  );
  return {
    repoRoot,
    sourceRoot,
    packageRoot,
    pluginRoot: packageRoot,
    runtimeDataDir,
    reportsDir: join(repoRoot, 'reports'),
    comparisonsDir: join(repoRoot, 'comparisons'),
    projectsDir: join(sourceRoot, 'projects'),
    dataDir,
    catalogPath: join(dataDir, 'tk.catalog.json'),
    lockPath: join(runtimeDataDir, 'tk.lock.json'),
    runsDir: join(runtimeDataDir, 'runs'),
    reportSnapshotDir: join(dataDir, 'reports'),
    comparisonSnapshotDir: join(dataDir, 'comparisons'),
  };
}

function readText(path) {
  return readFileSync(path, 'utf8');
}

function listMarkdownFiles(dir, excludeTemplates = true) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .filter((name) => !excludeTemplates || !name.startsWith('_'))
    .sort()
    .map((name) => join(dir, name));
}

const DEPENDENCY_MANIFESTS = new Set(['package.json', 'pyproject.toml', 'requirements.txt', 'go.mod', 'Cargo.toml']);
const SKIPPED_SOURCE_DIRS = new Set([
  '.git',
  'node_modules',
  'vendor',
  'target',
  'dist',
  'build',
  '.next',
  '.turbo',
  '.venv',
  'venv',
  '__pycache__',
]);

function listDependencyManifests(sourcePath) {
  if (!sourcePath || !existsSync(sourcePath)) return [];
  const manifests = [];
  const visit = (dir) => {
    for (const name of readdirSync(dir)) {
      if (SKIPPED_SOURCE_DIRS.has(name)) continue;
      const path = join(dir, name);
      const stat = statSync(path);
      if (stat.isDirectory()) {
        visit(path);
      } else if (stat.isFile() && DEPENDENCY_MANIFESTS.has(name)) {
        manifests.push(path);
      }
    }
  };
  visit(sourcePath);
  return manifests.sort();
}

function dependencyRecord(name, version, ecosystem, scope, manifest, sourcePath) {
  return {
    name,
    version: version == null ? null : String(version),
    ecosystem,
    scope,
    manifest: relative(sourcePath, manifest),
  };
}

function packageJsonDependencies(path, sourcePath) {
  const data = JSON.parse(readText(path));
  const fields = {
    dependencies: 'runtime',
    devDependencies: 'development',
    optionalDependencies: 'optional',
    peerDependencies: 'peer',
    bundledDependencies: 'bundled',
    bundleDependencies: 'bundled',
  };
  const dependencies = [];
  for (const [field, scope] of Object.entries(fields)) {
    const value = data[field];
    if (!value) continue;
    if (Array.isArray(value)) {
      dependencies.push(...value.map((name) => dependencyRecord(name, null, 'npm', scope, path, sourcePath)));
    } else if (typeof value === 'object') {
      dependencies.push(
        ...Object.entries(value).map(([name, version]) => dependencyRecord(name, version, 'npm', scope, path, sourcePath)),
      );
    }
  }
  return dependencies;
}

function pyprojectDependencies(path, sourcePath) {
  const data = parseToml(readText(path));
  const dependencies = [];
  const addList = (items, scope) => {
    if (!Array.isArray(items)) return;
    for (const item of items) {
      const text = String(item);
      const name = text.match(/^([A-Za-z0-9_.-]+)/)?.[1];
      if (name) dependencies.push(dependencyRecord(name, text, 'python', scope, path, sourcePath));
    }
  };
  const addMap = (items, scope) => {
    if (!items || typeof items !== 'object') return;
    for (const [name, spec] of Object.entries(items)) {
      if (name.toLowerCase() !== 'python') {
        dependencies.push(dependencyRecord(name, typeof spec === 'string' ? spec : JSON.stringify(spec), 'python', scope, path, sourcePath));
      }
    }
  };

  addList(data.project?.dependencies, 'runtime');
  for (const items of Object.values(data.project?.['optional-dependencies'] || {})) addList(items, 'optional');
  addMap(data.tool?.poetry?.dependencies, 'runtime');
  addMap(data.tool?.poetry?.['dev-dependencies'], 'development');
  for (const group of Object.values(data.tool?.poetry?.group || {})) addMap(group?.dependencies, 'development');
  for (const items of Object.values(data['dependency-groups'] || {})) addList(items, 'development');
  return dependencies;
}

function requirementsDependencies(path, sourcePath) {
  return readText(path)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && !line.startsWith('-'))
    .map((line) => {
      const name = line.match(/^([A-Za-z0-9_.-]+)/)?.[1] || line;
      return dependencyRecord(name, line, 'python', 'runtime', path, sourcePath);
    });
}

function goModDependencies(path, sourcePath) {
  const dependencies = [];
  let inRequireBlock = false;
  for (const line of readText(path).split(/\r?\n/)) {
    const text = line.replace(/\/\/.*$/, '').trim();
    if (!text) continue;
    if (text === 'require (') {
      inRequireBlock = true;
      continue;
    }
    if (inRequireBlock && text === ')') {
      inRequireBlock = false;
      continue;
    }
    const requireText = inRequireBlock ? text : text.startsWith('require ') ? text.slice('require '.length).trim() : null;
    if (!requireText) continue;
    const [name, version] = requireText.split(/\s+/);
    if (name && version) dependencies.push(dependencyRecord(name, version, 'go', 'runtime', path, sourcePath));
  }
  return dependencies;
}

function cargoDependencies(path, sourcePath) {
  const data = parseToml(readText(path));
  const dependencies = [];
  const addMap = (items, scope) => {
    if (!items || typeof items !== 'object') return;
    for (const [name, spec] of Object.entries(items)) {
      dependencies.push(dependencyRecord(name, typeof spec === 'string' ? spec : JSON.stringify(spec), 'cargo', scope, path, sourcePath));
    }
  };
  addMap(data.dependencies, 'runtime');
  addMap(data['dev-dependencies'], 'development');
  addMap(data['build-dependencies'], 'build');
  for (const target of Object.values(data.target || {})) {
    addMap(target?.dependencies, 'runtime');
    addMap(target?.['dev-dependencies'], 'development');
    addMap(target?.['build-dependencies'], 'build');
  }
  return dependencies;
}

function directDependencies(project, paths) {
  const sourcePath = project.sourceDir ? join(paths.sourceRoot, project.sourceDir) : null;
  if (!sourcePath || !existsSync(sourcePath)) return [];
  const dependencies = [];
  for (const manifest of listDependencyManifests(sourcePath)) {
    try {
      if (manifest.endsWith('/package.json')) dependencies.push(...packageJsonDependencies(manifest, sourcePath));
      else if (manifest.endsWith('/pyproject.toml')) dependencies.push(...pyprojectDependencies(manifest, sourcePath));
      else if (manifest.endsWith('/requirements.txt')) dependencies.push(...requirementsDependencies(manifest, sourcePath));
      else if (manifest.endsWith('/go.mod')) dependencies.push(...goModDependencies(manifest, sourcePath));
      else if (manifest.endsWith('/Cargo.toml')) dependencies.push(...cargoDependencies(manifest, sourcePath));
    } catch (error) {
      dependencies.push({
        name: '<parse-error>',
        version: error.message,
        ecosystem: 'unknown',
        scope: 'error',
        manifest: relative(sourcePath, manifest),
      });
    }
  }
  const seen = new Set();
  return dependencies
    .filter((dependency) => {
      const key = [dependency.name, dependency.ecosystem, dependency.scope, dependency.manifest].join('\0');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort(
    (a, b) =>
      a.ecosystem.localeCompare(b.ecosystem) ||
      a.manifest.localeCompare(b.manifest) ||
      a.scope.localeCompare(b.scope) ||
      a.name.localeCompare(b.name),
    );
}

function dependencySummary(dependencies) {
  const byEcosystem = {};
  const byScope = {};
  const manifests = new Set();
  for (const dependency of dependencies) {
    byEcosystem[dependency.ecosystem] = (byEcosystem[dependency.ecosystem] || 0) + 1;
    byScope[dependency.scope] = (byScope[dependency.scope] || 0) + 1;
    manifests.add(dependency.manifest);
  }
  return {
    total: dependencies.length,
    manifests: manifests.size,
    byEcosystem,
    byScope,
  };
}

function parseMarkdownTable(section) {
  if (!section) return [];
  const lines = section.body.split(/\r?\n/).filter((line) => line.trim().startsWith('|'));
  if (lines.length < 2) return [];
  const rows = lines.map((line) => line.split('|').slice(1, -1).map(cleanInline));
  const headers = rows[0].map((header) => header.toLowerCase());
  return rows.slice(2).flatMap((cells) => {
    if (!cells.length || cells.every((cell) => /^-+$/.test(cell))) return [];
    const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] || '']));
    return [row];
  });
}

function extractDependencyEvidence(text) {
  const section = firstMatchingSection(reportSections(text), [
    '依赖 / SDK 选型证据',
    '依赖/sdk 选型证据',
    'libraries, sdks, and build-vs-buy evidence',
    'dependency evidence',
  ]);
  return {
    present: Boolean(section),
    items: parseMarkdownTable(section)
      .map((row) => ({
        dependency: row.dependency || row['依赖'] || row['库 / sdk'] || row['库/sdk'] || '',
        type: row.type || row['类型'] || '',
        usedFor: row['used for'] || row['用途'] || '',
        problemSolved: row['problem solved'] || row['解决的问题'] || '',
        evidence: row.evidence || row['证据'] || '',
        reuseSignal: row['reuse signal'] || row['复用信号'] || '',
        caution: row.caution || row['注意'] || row['风险'] || '',
      }))
      .filter((item) => item.dependency && !item.dependency.startsWith('_待补')),
  };
}

function extractGithubUrl(text) {
  const match = text.match(/https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/);
  if (!match) return null;
  const owner = match[1];
  const repo = match[2].replace(/\.git$/i, '');
  return {
    owner,
    repo,
    fullName: `${owner}/${repo}`,
    url: `https://github.com/${owner}/${repo}`,
    cloneUrl: `https://github.com/${owner}/${repo}.git`,
    sourceDir: `projects/${owner}__${repo}`,
  };
}

function extractTableValue(text, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`);
  const match = text.match(pattern);
  return match ? cleanInline(match[1]) : null;
}

function cleanInline(value) {
  return value
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractDate(text) {
  const tableDate = extractTableValue(text, '分析日期');
  if (tableDate) return tableDate;
  const loose = text.match(/分析日期[*\s:：|`]*([0-9]{4}-[0-9]{2}-[0-9]{2})/);
  return loose ? loose[1] : null;
}

function extractAdoption(text) {
  const conclusion = text.match(/###\s*结论\s*\n+\s*(?:\*\*)?([^*\n]+)(?:\*\*)?/);
  if (conclusion) return cleanInline(conclusion[1]);
  const indexValue = text.match(/\|\s*\[[^\]]+\]\([^)]+\)\s*\|[^|]*\|\s*([^|]+?)\s*\|/);
  return indexValue ? cleanInline(indexValue[1]) : null;
}

function extractArchitectureValueFromReadme(readme, reportBaseName) {
  const index = readmeProjectIndex(readme);
  const escaped = reportBaseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\[([^\\]]+)\\]\\(\\.\\/reports\\/${escaped}\\.md\\)[^\\n]*`, 'i');
  const match = index.match(pattern);
  if (!match) return null;
  const line = match[0];
  const stars = line.match(/⭐+/);
  return stars ? stars[0].length : null;
}

function extractCategoryFromReadme(readme, reportBaseName) {
  const lines = readmeProjectIndex(readme).split(/\r?\n/);
  let category = null;
  for (const line of lines) {
    const heading = line.match(/^###\s+(.+)/);
    if (heading) category = heading[1].trim();
    if (line.includes(`./reports/${reportBaseName}.md`)) return category;
  }
  return null;
}

function readmeProjectIndex(readme) {
  const start = readme.indexOf('## Project Index');
  if (start === -1) return readme;
  const rest = readme.slice(start);
  const end = rest.indexOf('## Methodology');
  return end === -1 ? rest : rest.slice(0, end);
}

const TAG_CANDIDATES = [
  'agent',
  'coding',
  'mcp',
  'rag',
  'knowledge',
  'cli',
  'desktop',
  'workflow',
  'runtime',
  'graph',
  'design',
  'security',
  'browser',
  'media',
  'video',
  'content',
  'tts',
  'ffmpeg',
  'streamlit',
  'fastapi',
  'comfyui',
  'tauri',
  'rust',
  'typescript',
  'python',
  'go',
];

const INACTIVE_DEPENDENCY_EVIDENCE_PATTERN =
  /(?:\bdeclared[\s-]*only\b|\bdeclared\s+but\b|\bmanifest\s+declared\b|\bunused\b|\bnot\s+used\b|\bunimplemented\b|\bnot\s+implemented\b|\bnot\s+exposed\b|\bnot\s+wired\b|\bnot\s+enabled\b|\bnot\s+available\b|\bnot\s+active\b|\bno\b[^.;|]*(?:agent-facing|mcp|tool|server)[^.;|]*(?:contract|implementation|exposure|integration|support)\b|声明但|仅声明|只声明|未暴露|未实现|未使用|未启用|未接入|没有[^。；;|]*(?:agent-facing|mcp|tool|server)[^。；;|]*(?:contract|契约|实现|暴露|使用|接入))/iu;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasTagToken(text, tag) {
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(tag)}(?=$|[^a-z0-9])`, 'i').test(text);
}

function normalizedDependencyName(value) {
  const text = String(value || '').replace(/`|\*/g, '').trim().toLowerCase();
  return text.match(/^(@?[a-z0-9_.-]+(?:\/[a-z0-9_.-]+)?)/)?.[1] || text;
}

function isInactiveDependencyEvidence(dependency) {
  const text = [dependency.usedFor, dependency.problemSolved].filter(Boolean).join(' ');
  return INACTIVE_DEPENDENCY_EVIDENCE_PATTERN.test(text);
}

function buildTags(project) {
  const dependencyEvidence = project.dependencyEvidence || [];
  const activeDependencyEvidence = dependencyEvidence.filter((dependency) => !isInactiveDependencyEvidence(dependency));
  const inactiveDependencyNames = new Set(
    dependencyEvidence
      .filter(isInactiveDependencyEvidence)
      .map((dependency) => normalizedDependencyName(dependency.dependency))
      .filter(Boolean),
  );
  const text = [
    project.id,
    project.name,
    project.category,
    project.language,
    project.summary,
    project.repo,
    ...(project.dependencies || [])
      .filter((dependency) => !inactiveDependencyNames.has(normalizedDependencyName(dependency.name)))
      .map((dependency) => dependency.name),
    ...activeDependencyEvidence.flatMap((dependency) => [
      dependency.dependency,
      dependency.type,
      dependency.usedFor,
      dependency.problemSolved,
    ]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return TAG_CANDIDATES.filter((tag) => hasTagToken(text, tag));
}

function parseReport(reportPath, paths, readme) {
  const text = readText(reportPath);
  const baseName = reportPath.split('/').pop().replace(/\.md$/, '');
  const github = extractGithubUrl(text);
  const title = text.match(/^#\s+(.+)/m)?.[1]?.trim() || baseName;
  const summary =
    text.match(/^>\s*(?:一句话定位[:：])?\s*(.+)$/m)?.[1]?.replace(/\*\*/g, '').trim() || null;
  const repoName = github?.repo || extractTableValue(text, '仓库')?.split('/').pop() || baseName;
  const owner = github?.owner || null;
  const repo = github?.repo || repoName;
  const id = repo.toLowerCase();
  const project = {
    id,
    name: title.replace(/\s*全量分析报告\s*$/u, ''),
    repo: github?.fullName || extractTableValue(text, '仓库'),
    url: github?.url || null,
    cloneUrl: github?.cloneUrl || null,
    report: relative(paths.repoRoot, reportPath),
    reportFile: baseName,
    category: extractCategoryFromReadme(readme, baseName),
    summary,
    adoption: extractAdoption(text),
    architectureValue: extractArchitectureValueFromReadme(readme, baseName),
    license: extractTableValue(text, '许可证'),
    language: extractTableValue(text, '语言') || extractTableValue(text, '主要语言'),
    analysisDate: extractDate(text),
    sourceDir: github ? github.sourceDir : null,
    owner,
    sourceExists: github ? existsSync(join(paths.sourceRoot, github.sourceDir, '.git')) : false,
  };
  const dependencyEvidence = extractDependencyEvidence(text);
  project.dependencies = directDependencies(project, paths);
  project.dependencySummary = dependencySummary(project.dependencies);
  project.dependencyEvidencePresent = dependencyEvidence.present;
  project.dependencyEvidence = dependencyEvidence.items;
  project.tags = buildTags(project);
  return project;
}

function applyRuntimeSourcePresence(catalog, options = {}) {
  const paths = getPaths(options);
  return {
    ...catalog,
    projects: (catalog.projects || []).map((project) => ({
      ...project,
      sourceExists: Boolean(project.sourceDir && existsSync(join(paths.sourceRoot, project.sourceDir, '.git'))),
    })),
  };
}

export function buildCatalog(options = {}) {
  const paths = getPaths(options);
  const readmePath = join(paths.repoRoot, 'README.md');
  const readme = existsSync(readmePath) ? readText(readmePath) : '';
  const projects = listMarkdownFiles(paths.reportsDir)
    .map((path) => parseReport(path, paths, readme))
    .sort((a, b) => a.id.localeCompare(b.id));
  const comparisons = listMarkdownFiles(paths.comparisonsDir).map((path) => ({
    id: path.split('/').pop().replace(/\.md$/, ''),
    path: relative(paths.repoRoot, path),
    title: readText(path).match(/^#\s+(.+)/m)?.[1]?.trim() || path.split('/').pop(),
  }));
  return {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    repoRoot: options.includeLocalPaths ? paths.repoRoot : undefined,
    projects,
    comparisons,
  };
}

export function writeCatalog(catalog, options = {}) {
  const paths = getPaths(options);
  mkdirSync(paths.dataDir, { recursive: true });
  writeFileSync(paths.catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
  writeTextSnapshots(paths);
  return paths.catalogPath;
}

export function loadCatalog(options = {}) {
  const paths = getPaths(options);
  if (existsSync(paths.catalogPath)) {
    return applyRuntimeSourcePresence(JSON.parse(readText(paths.catalogPath)), options);
  }
  return applyRuntimeSourcePresence(buildCatalog(options), options);
}

export function validateCatalog(catalog, options = {}) {
  const paths = getPaths(options);
  const schema = JSON.parse(readText(join(paths.packageRoot, 'schemas', 'catalog.schema.json')));
  const errors = [];
  errors.push(...validateJsonSchema(schema, catalog));
  const ids = new Set();
  for (const project of catalog.projects || []) {
    if (!project.id) errors.push(`project missing id: ${project.report || '<unknown>'}`);
    if (ids.has(project.id)) errors.push(`duplicate project id: ${project.id}`);
    ids.add(project.id);
    if (!project.report) errors.push(`${project.id} missing report`);
    if (!project.url) errors.push(`${project.id} missing GitHub url`);
    if (!project.sourceDir) errors.push(`${project.id} missing sourceDir`);
    if (!project.dependencyEvidencePresent) errors.push(`${project.id} missing dependency evidence section`);
    const reportFileName = packagedReportFileName(project);
    if (!reportFileName) {
      errors.push(`${project.id} missing reportFile`);
    } else {
      const snapshotPath = join(paths.reportSnapshotDir, reportFileName);
      if (!fileExists(snapshotPath)) {
        errors.push(`${project.id} missing packaged report: ${relative(paths.packageRoot, snapshotPath)}`);
      }
    }
  }
  return { ok: errors.length === 0, errors };
}

function packagedReportFileName(project) {
  if (project.report) return project.report.split('/').pop();
  if (project.reportFile) return `${project.reportFile}.md`;
  return null;
}

function loadSchema(name, options = {}) {
  const paths = getPaths(options);
  return JSON.parse(readText(join(paths.packageRoot, 'schemas', name)));
}

function validateNamedSchema(name, value, options = {}) {
  const schema = loadSchema(name, options);
  const errors = validateJsonSchema(schema, value);
  return { ok: errors.length === 0, errors };
}

export function validateSourceLock(lock, options = {}) {
  const result = validateNamedSchema('source-lock.schema.json', lock, options);
  const errors = [...result.errors];
  const catalog = loadCatalog(options);
  const catalogIds = new Set((catalog.projects || []).map((project) => project.id).filter(Boolean));
  const lockIds = new Set();
  for (const source of lock.sources || []) {
    if (!source.id) continue;
    if (lockIds.has(source.id)) errors.push(`duplicate source lock id: ${source.id}`);
    lockIds.add(source.id);
    if (!catalogIds.has(source.id)) errors.push(`${source.id} source lock entry has no catalog project`);
  }
  for (const id of catalogIds) {
    if (!lockIds.has(id)) errors.push(`${id} missing source lock entry`);
  }
  return { ok: errors.length === 0, errors };
}

export function validateReplicationPlan(plan, options = {}) {
  return validateNamedSchema('replication-plan.schema.json', plan, options);
}

export function validateVerificationResult(result, options = {}) {
  return validateNamedSchema('verification-result.schema.json', result, options);
}

export function validateRunTrace(trace, options = {}) {
  return validateNamedSchema('run-trace.schema.json', trace, options);
}

export function searchCatalog(query, options = {}) {
  const catalog = loadCatalog(options);
  const terms = query.toLowerCase().split(/[^\p{L}\p{N}+#.@/-]+/u).filter(Boolean);
  const scored = catalog.projects
    .map((project) => {
      const identity = [project.id, project.name, project.repo, ...(project.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const description = [project.category, project.summary, project.adoption]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const dependencies = [
        ...(project.dependencies || []).map((dependency) => `${dependency.name} ${dependency.ecosystem}`),
        ...(project.dependencyEvidence || []).flatMap((dependency) => [
          dependency.dependency,
          dependency.usedFor,
          dependency.problemSolved,
          dependency.reuseSignal,
        ]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const score = terms.reduce((total, term) => {
        if (identity.includes(term)) return total + 4;
        if (description.includes(term)) return total + 2;
        if (dependencies.includes(term)) return total + 1;
        return total;
      }, 0);
      const matchedTerms = terms.filter(
        (term) => identity.includes(term) || description.includes(term) || dependencies.includes(term),
      ).length;
      return { project, score, matchedTerms };
    })
    .filter((item) => item.score > 0 || terms.length === 0)
    .sort(
      (a, b) =>
        b.matchedTerms - a.matchedTerms ||
        b.score - a.score ||
        Number(b.project.architectureValue || 0) - Number(a.project.architectureValue || 0) ||
        a.project.id.localeCompare(b.project.id),
    );
  return scored.map((item) => item.project);
}

export function findProject(identifier, options = {}) {
  const catalog = loadCatalog(options);
  const normalized = identifier.toLowerCase();
  return (
    catalog.projects.find((project) => project.id === normalized) ||
    catalog.projects.find((project) => project.reportFile.toLowerCase() === normalized) ||
    catalog.projects.find((project) => project.name.toLowerCase() === normalized) ||
    catalog.projects.find((project) => project.repo?.toLowerCase() === normalized) ||
    null
  );
}

function splitList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(splitList);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanHeading(value) {
  return cleanInline(value)
    .replace(/^\d+[.、]\s*/, '')
    .replace(/^#+\s*/, '')
    .trim();
}

function reportSections(text) {
  const lines = text.split(/\r?\n/);
  const headings = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{2,6})\s+(.+)$/);
    if (match) {
      headings.push({
        index,
        level: match[1].length,
        title: cleanHeading(match[2]),
      });
    }
  }

  return headings.map((heading, position) => {
    const next = headings
      .slice(position + 1)
      .find((candidate) => candidate.level <= heading.level);
    const body = lines.slice(heading.index + 1, next ? next.index : lines.length).join('\n').trim();
    return { ...heading, body };
  });
}

function firstMatchingSection(sections, keywords) {
  return sections.find((section) =>
    keywords.some((keyword) => {
      const title = section.title.toLowerCase();
      const normalizedKeyword = keyword.toLowerCase();
      return title === normalizedKeyword || title.includes(normalizedKeyword);
    }),
  );
}

function snippet(value, maxLength = 1800) {
  const text = String(value || '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/u, '').trim()}\n...`;
}

function extractReplicationSections(report) {
  const sections = reportSections(report);
  const mapping = {
    architecture: ['底层技术架构', 'underlying technical architecture'],
    kernel: ['最小架构内核', 'minimal architecture kernel', '可复刻的最小内核'],
    abstractions: ['核心抽象', 'core abstractions'],
    controlDataPlane: ['控制面 / 数据面', '控制面', 'control plane'],
    executionFlows: ['关键执行链路', 'execution flow'],
    stateModel: ['状态模型', 'state model'],
    contracts: ['契约边界', 'contract'],
    failureModel: ['失败', '降级', 'failure'],
    invariants: ['可复刻设计不变量', 'design invariants', 'invariants'],
  };

  return Object.fromEntries(
    Object.entries(mapping).map(([name, keywords]) => {
      const section = firstMatchingSection(sections, keywords);
      return [
        name,
        section
          ? {
              title: section.title,
              text: snippet(section.body),
            }
          : null,
      ];
    }),
  );
}

function resolveReferenceProjects(capability, options = {}) {
  const references = splitList(options.references || options.from || options.projects);
  const projects = references.length
    ? references.map((identifier) => findProject(identifier, options)).filter(Boolean)
    : searchCatalog(capability, options);
  const limit = Number(options.limit || 5);
  return projects.slice(0, Number.isFinite(limit) && limit > 0 ? limit : 5);
}

function slugValue(value) {
  return (
    String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'capability'
  );
}

function firstUsefulLine(value) {
  return (
    String(value || '')
      .split(/\r?\n/)
      .map((line) => cleanInline(line))
      .find(Boolean) || null
  );
}

function uniqueLines(values, limit = 8) {
  const output = [];
  const seen = new Set();
  for (const value of values || []) {
    const line = cleanInline(String(value || ''));
    if (!line || seen.has(line)) continue;
    seen.add(line);
    output.push(line);
    if (output.length >= limit) break;
  }
  return output;
}

function sectionSummary(reference, key) {
  const section = reference.sections?.[key];
  if (!section?.text) return null;
  const line = firstUsefulLine(section.text);
  return line ? `${reference.project.id}: ${line}` : null;
}

function dependencyEvidenceLines(reference) {
  return (reference.dependencyEvidence || []).map((item) => {
    const detail = item.usedFor || item.problemSolved || item.reuseSignal || item.dependency;
    return `${reference.project.id}: ${item.dependency} — ${cleanInline(detail)}`;
  });
}

function buildImplementationSlices(capability, references) {
  const referenceNames = references.map((reference) => reference.project.id).join(', ') || 'selected references';
  const capabilitySlug = slugValue(capability);
  return [
    {
      id: `${capabilitySlug}-fit`,
      title: 'confirm current-project fit and choose the smallest boundary',
      boundary: `Inspect the current project before copying anything; choose the minimum slice needed from ${referenceNames}.`,
      verification: 'Document the target user-facing path and one boundary that proves the capability is needed.',
    },
    {
      id: `${capabilitySlug}-kernel`,
      title: 'adapt the capability kernel',
      boundary: 'Implement the smallest contract/kernel that reproduces the reference capability without copying host-specific ceremony.',
      verification: 'One deterministic contract check or smoke command passes for the adapted kernel.',
    },
    {
      id: `${capabilitySlug}-trace`,
      title: 'capture verification and run trace',
      boundary: 'Persist plan, brief, and verification artifacts so later work can audit what was attempted.',
      verification: 'Run trace includes plan.json, brief.md, and verification.json artifacts.',
    },
  ];
}

async function collectReferenceEvidence(capability, options = {}) {
  const projects = resolveReferenceProjects(capability, options);
  const references = [];
  for (const project of projects) {
    const report = readReport(project, options);
    const context = await projectContext(project.id, options);
    const source = context?.source || {
      sourceDir: project.sourceDir,
      path: null,
      exists: false,
    };
    references.push({
      project,
      sections: extractReplicationSections(report),
      source,
      dependencySummary: project.dependencySummary,
      dependencyEvidence: project.dependencyEvidence,
      dependencies: project.dependencies,
      freshness: {
        reportDate: project.analysisDate || null,
        sourceCheckedAt: new Date().toISOString(),
      },
      confidence: {
        reportOnly: !source.exists,
        sourceBacked: Boolean(source.exists),
        score: source.exists ? 0.9 : 0.55,
      },
    });
  }
  return references;
}

function buildReplicationPlan(capability, references) {
  const generatedAt = new Date().toISOString();
  const kernel = uniqueLines([
    ...references.map((reference) => sectionSummary(reference, 'kernel')),
    ...references.map((reference) => sectionSummary(reference, 'architecture')),
    ...references.map((reference) => `${reference.project.id}: ${reference.project.summary || reference.project.name}`),
  ]);
  const reuseFirst = uniqueLines(references.flatMap((reference) => dependencyEvidenceLines(reference)));
  const mustKeep = uniqueLines([
    ...references.map((reference) => sectionSummary(reference, 'invariants')),
    ...references.map((reference) => sectionSummary(reference, 'contracts')),
    ...references.map((reference) => sectionSummary(reference, 'failureModel')),
    'Preserve architecture invariants that make the capability work.',
    'Preserve contracts that users, agents, or external tools depend on.',
  ]);
  const canAdapt = uniqueLines([
    ...references.map((reference) => sectionSummary(reference, 'controlDataPlane')),
    ...references.map((reference) => sectionSummary(reference, 'abstractions')),
    'Host adapters, package layout, UI surface, and framework integration can change if the contract stays stable.',
    'Backend implementations can change when the observable capability contract is preserved.',
  ]);
  const risks = uniqueLines([
    ...references.map((reference) => sectionSummary(reference, 'failureModel')),
    ...references.filter((reference) => !reference.source.exists).map((reference) => `${reference.project.id}: source cache missing; plan is report-backed only.`),
    'Current-project fit is not evaluated until the target codebase is inspected.',
  ]);
  return {
    capability,
    generatedAt,
    references: references.map((reference) => reference.project.id),
    kernel,
    reuseFirst,
    implementationSlices: buildImplementationSlices(capability, references),
    mustKeep,
    canAdapt,
    risks,
    verificationContract: `${slugValue(capability)}:v1`,
  };
}

function buildRunTrace(runId, input, result, durationMs, steps) {
  return {
    runId,
    input,
    steps,
    policyHits: [],
    durationMs,
    result,
    generatedAt: new Date().toISOString(),
  };
}

function persistPlanRun(paths, capability, options, references, plan) {
  const run = createRun(paths);
  const input = {
    capability,
    references: plan.references,
    requestedReferences: splitList(options.references || options.from || options.projects),
    limit: Number(options.limit || 5),
  };
  const briefPayload = {
    capability,
    generatedAt: plan.generatedAt,
    references,
    plan,
    brief: plan,
    run,
  };
  const briefMarkdown = formatReplicationBrief(briefPayload);
  const trace = buildRunTrace(run.runId, input, 'planned', 0, [
    { type: 'resolve_references', status: references.length ? 'ok' : 'warn', artifacts: ['references.json'] },
    { type: 'build_plan', status: 'ok', artifacts: ['plan.json', 'brief.md'] },
  ]);
  const validation = validateRunTrace(trace, options);
  if (!validation.ok) {
    throw new Error(`run trace invalid\n${validation.errors.join('\n')}`);
  }
  writeRunArtifact(paths, run.runId, 'input.json', input);
  writeRunArtifact(paths, run.runId, 'references.json', references);
  writeRunArtifact(paths, run.runId, 'plan.json', plan);
  writeRunArtifact(paths, run.runId, 'brief.md', briefMarkdown);
  writeRunArtifact(paths, run.runId, 'trace.json', trace);
  return {
    ...run,
    artifacts: {
      input: join(run.dir, 'input.json'),
      references: join(run.dir, 'references.json'),
      plan: join(run.dir, 'plan.json'),
      brief: join(run.dir, 'brief.md'),
      trace: join(run.dir, 'trace.json'),
    },
  };
}

export async function planReplication(capability, options = {}) {
  const startedAt = Date.now();
  const paths = getPaths(options);
  const references = await collectReferenceEvidence(capability, options);
  const plan = buildReplicationPlan(capability, references);
  const validation = validateReplicationPlan(plan, options);
  if (!validation.ok) {
    throw new Error(`replication plan invalid\n${validation.errors.join('\n')}`);
  }
  const run = options.persist === false ? null : persistPlanRun(paths, capability, options, references, plan);
  return {
    capability,
    generatedAt: plan.generatedAt,
    references,
    plan,
    brief: plan,
    run,
    durationMs: Date.now() - startedAt,
  };
}

export async function buildReplicationBrief(capability, options = {}) {
  return planReplication(capability, { ...options, persist: false });
}

export function listRuns(options = {}) {
  const paths = getPaths(options);
  return {
    runs: listStoredRuns(paths, options),
  };
}

export function getRunTrace(runId, options = {}) {
  const paths = getPaths(options);
  const run = readStoredRun(paths, runId);
  if (!run) return null;
  return {
    runId: run.runId,
    dir: run.dir,
    artifacts: Object.keys(run.artifacts || {}),
    input: run.input,
    references: run.references,
    plan: run.plan,
    verification: run.verification,
    trace: run.trace,
  };
}

export async function verifyReplication(target, options = {}) {
  const paths = getPaths(options);
  const candidateRunId = options.runId || (String(target || '').startsWith('run_') ? String(target) : null);
  let run = candidateRunId ? readStoredRun(paths, candidateRunId) : null;
  if (!run) {
    const capability = candidateRunId ? options.capability : String(target || options.capability || '').trim();
    if (!capability) throw new Error('verifyReplication requires a capability name or run id.');
    const planned = await planReplication(capability, options);
    run = planned.run ? readStoredRun(paths, planned.run.runId) : null;
  }
  if (!run?.plan) {
    throw new Error(`Run not found or missing plan: ${candidateRunId || target}`);
  }

  const warnings = [];
  const planValidation = validateReplicationPlan(run.plan, options);
  const checks = [
    {
      name: 'plan_schema_valid',
      status: planValidation.ok ? 'pass' : 'fail',
      details: planValidation.errors || [],
    },
    {
      name: 'reference_projects_present',
      status: run.plan.references?.length ? 'pass' : 'fail',
      details: run.plan.references?.length ? [] : ['No reference projects were selected.'],
    },
    {
      name: 'kernel_present',
      status: run.plan.kernel?.length ? 'pass' : 'fail',
      details: run.plan.kernel?.length ? [] : ['Replication plan missing kernel evidence.'],
    },
    {
      name: 'verification_contract_present',
      status: run.plan.verificationContract ? 'pass' : 'fail',
      details: run.plan.verificationContract ? [] : ['Replication plan missing verificationContract.'],
    },
  ];

  const missingSources = (run.references || [])
    .filter((reference) => !reference.source?.exists)
    .map((reference) => reference.project.id);
  if (missingSources.length) {
    warnings.push(`Source cache missing for: ${missingSources.join(', ')}`);
    checks.push({ name: 'source_backing', status: 'warn', details: missingSources });
  } else {
    checks.push({ name: 'source_backing', status: 'pass', details: [] });
  }

  const targetProjectEvidence = Boolean(options.targetProjectEvidence);
  if (!targetProjectEvidence) {
    warnings.push('Target-project implementation was not inspected; this result validates TK plan evidence only.');
    checks.push({
      name: 'target_project_implementation',
      status: 'warn',
      details: ['Run the target project verification path before claiming the replicated capability works.'],
    });
  } else {
    checks.push({ name: 'target_project_implementation', status: 'pass', details: [] });
  }
  const status = checks.some((check) => check.status === 'fail') ? 'fail' : warnings.length ? 'warn' : 'pass';
  const verification = {
    contractId: run.plan.verificationContract,
    runId: run.runId,
    status,
    checks,
    warnings,
    generatedAt: new Date().toISOString(),
  };
  const verificationValidation = validateVerificationResult(verification, options);
  if (!verificationValidation.ok) {
    throw new Error(`verification result invalid\n${verificationValidation.errors.join('\n')}`);
  }
  writeRunArtifact(paths, run.runId, 'verification.json', verification);

  const priorSteps = (run.trace?.steps || []).filter((step) => step.type !== 'verify');
  const trace = buildRunTrace(
    run.runId,
    run.trace?.input || { capability: run.plan.capability, references: run.plan.references },
    status,
    run.trace?.durationMs || 0,
    [...priorSteps, { type: 'verify', status: status === 'fail' ? 'fail' : status === 'warn' ? 'warn' : 'ok', artifacts: ['verification.json'] }],
  );
  const traceValidation = validateRunTrace(trace, options);
  if (!traceValidation.ok) {
    throw new Error(`run trace invalid\n${traceValidation.errors.join('\n')}`);
  }
  writeRunArtifact(paths, run.runId, 'trace.json', trace);
  return {
    ...verification,
    trace,
    plan: run.plan,
    references: run.plan.references,
  };
}

export function formatReplicationPlan(payload) {
  return formatReplicationBrief(payload);
}

export function formatVerificationResult(payload) {
  const lines = [`${payload.status} ${payload.contractId}`, `run: ${payload.runId}`];
  for (const check of payload.checks || []) {
    const suffix = check.details?.length ? `: ${check.details.join(', ')}` : '';
    lines.push(`- ${check.status} ${check.name}${suffix}`);
  }
  for (const warning of payload.warnings || []) lines.push(`warning: ${warning}`);
  return `${lines.join('\n')}\n`;
}

export function formatRunTrace(payload) {
  const lines = [
    `${payload.runId} ${payload.trace?.result || 'unknown'}`,
    `capability: ${payload.plan?.capability || payload.input?.capability || 'unknown'}`,
  ];
  for (const step of payload.trace?.steps || []) {
    lines.push(`- ${step.status} ${step.type}${step.artifacts?.length ? ` -> ${step.artifacts.join(', ')}` : ''}`);
  }
  return `${lines.join('\n')}\n`;
}

export function formatRunList(payload) {
  const rows = [['runId', 'result', 'capability', 'generatedAt']];
  for (const run of payload.runs || []) {
    rows.push([run.runId, run.result || '', run.capability || '', run.generatedAt || '']);
  }
  return `${rows.map((row) => row.join('\t')).join('\n')}\n`;
}

export function formatReplicationBrief(payload) {
  const plan = payload.plan || payload.brief || {};
  const capability = plan.capability || payload.capability;
  const references = payload.references || [];
  const reuseEvidence = plan.reuseFirst || [];
  const implementationSlices = plan.implementationSlices || [];
  const lines = [
    `# TK Replication Plan: ${capability}`,
    '',
    'Use this as structured reference evidence before changing the target project.',
    '',
  ];

  if (payload.run?.runId) {
    lines.push(`Run: ${payload.run.runId}`);
    lines.push(`Artifacts: ${payload.run.relativeDir || payload.run.dir}`);
    lines.push('');
  }

  lines.push('## Capability Replication Brief', '', `Capability: ${capability}`, '');
  lines.push('Current project fit:');
  lines.push('- TK has not inspected the target project. Inspect its existing code, platform support, and dependencies before choosing an implementation boundary.');

  lines.push('', 'Reference projects:');
  if (references.length) {
    for (const reference of references) {
      lines.push(`- ${reference.project.id}: ${reference.project.name}`);
    }
  } else {
    lines.push('- No curated TK coverage matched this capability.');
  }

  lines.push('', 'Evidence:');
  if (references.length) {
    for (const reference of references) {
      const { project, source } = reference;
      lines.push(`- ${project.id}: report ${project.report}; source cache ${source.exists ? 'available' : 'missing'}; confidence ${reference.confidence.score}.`);
    }
    const evidenceOrder = ['kernel', 'abstractions', 'controlDataPlane', 'executionFlows', 'stateModel', 'contracts', 'failureModel', 'invariants'];
    for (const reference of references) {
      lines.push('', `### ${reference.project.id} evidence`);
      for (const name of evidenceOrder) {
        const section = reference.sections[name];
        if (!section) continue;
        lines.push('', `#### ${name}: ${section.title}`, section.text);
      }
    }
  } else {
    lines.push('- No report or source-cache evidence is available because no curated TK reference matched.');
  }

  lines.push('', 'TK Replication Ladder:');
  lines.push('- Inspect and reuse current-project capabilities first.');
  lines.push('- Prefer platform features, installed dependencies, official SDKs, and mature packages before self-building infrastructure.');
  lines.push('- Adapt only the smallest TK reference kernel needed for the remaining gap.');

  lines.push('', 'Kernel:');
  if (plan.kernel?.length) {
    for (const item of plan.kernel) lines.push(`- ${item}`);
  } else {
    lines.push('- No kernel evidence is available because no curated TK reference matched.');
  }

  lines.push('', 'Must keep:');
  for (const item of plan.mustKeep || []) lines.push(`- ${item}`);

  lines.push('', 'Can adapt:');
  for (const item of plan.canAdapt || []) lines.push(`- ${item}`);

  lines.push('', 'Do not copy:');
  lines.push('- Reference-project branding, repository layout, prompts, or source code.');
  lines.push('- Host-specific ceremony that is not required by the observable capability contract.');

  lines.push('', 'Build-vs-buy:');
  lines.push('- Evaluate current-project code, platform support, installed dependencies, official SDKs, and mature packages before self-building.');
  lines.push(reuseEvidence.length
    ? '- Selected TK references contain dependency or SDK reuse evidence listed below.'
    : '- No curated dependency or SDK reuse evidence was found; this is not evidence that self-building is required.');

  lines.push('', 'Dependency / SDK evidence:');
  if (reuseEvidence.length) {
    for (const item of reuseEvidence) lines.push(`- ${item}`);
  } else {
    lines.push('- None in the selected TK references. Inspect current-project dependencies and official SDK options before building.');
  }

  lines.push('', 'Implementation boundary:');
  for (const slice of implementationSlices) {
    lines.push(`- ${slice.id}: ${slice.title}`);
    lines.push(`  boundary: ${slice.boundary}`);
  }

  lines.push('', 'Verification:');
  if (plan.verificationContract) lines.push(`- TK contract: ${plan.verificationContract}`);
  lines.push('- TK verification validates plan and reference evidence only; it does not verify target-project implementation.');
  for (const slice of implementationSlices) lines.push(`- ${slice.id}: ${slice.verification}`);
  lines.push("- Run the target project's real verification path before claiming the replicated capability works.");

  lines.push('', 'Freshness gaps:');
  if (references.length) {
    for (const reference of references) {
      const reportDate = reference.freshness?.reportDate ? `report dated ${reference.freshness.reportDate}` : 'report date unavailable';
      const sourceState = reference.source.exists ? 'source cache available' : 'source cache missing';
      lines.push(`- ${reference.project.id}: ${reportDate}; ${sourceState}; source status checked ${reference.freshness?.sourceCheckedAt || 'at brief generation'}.`);
    }
  } else {
    lines.push('- No curated reference matched, so report and source freshness could not be established.');
  }

  lines.push('', 'Next: choose the current-project boundary, then run `tk verify <run_id>` or `tk verify <capability>` for the TK plan/evidence contract.');
  return `${lines.join('\n')}\n`;
}

export async function projectContext(identifier, options = {}) {
  const paths = getPaths(options);
  const project = findProject(identifier, options);
  if (!project) return null;

  const sourcePath = project.sourceDir ? join(paths.sourceRoot, project.sourceDir) : null;
  const exists = Boolean(sourcePath && existsSync(join(sourcePath, '.git')));
  const context = {
    project,
    source: {
      sourceDir: project.sourceDir,
      path: sourcePath,
      exists,
    },
  };

  if (exists) {
    try {
      context.source.branch = await git(['branch', '--show-current'], sourcePath);
      context.source.commit = await git(['rev-parse', 'HEAD'], sourcePath);
      context.source.remote = await git(['remote', 'get-url', 'origin'], sourcePath);
      context.source.shallow = existsSync(join(sourcePath, '.git', 'shallow'));
      context.source.dirty = (await git(['status', '--short'], sourcePath)).length > 0;
    } catch (error) {
      context.source.error = error.message;
    }
  }

  return context;
}

async function git(args, cwd) {
  const { stdout } = await execFileAsync('git', args, { cwd, maxBuffer: 1024 * 1024 * 16 });
  return stdout.trim();
}

const TK_SKILLS = [
  'tk-architecture-learning',
  'tk-capability-replication',
  'tk-reference-discovery',
  'tk-report-authoring',
  'tk-source-evidence',
];

function configuredHome(options = {}) {
  return resolve(options.home || process.env.HOME || homedir());
}

function canonicalSkillsRoot(options = {}) {
  return resolve(options.sourceSkillsRoot || join(PACKAGE_ROOT, 'skills'));
}

function installedSkillsRoot(options = {}) {
  return resolve(options.skillsRoot || process.env.TK_ADAPTER_SKILLS_ROOT || join(USER_PATHS.data, 'skills'));
}

function syncInstalledSkills(options = {}) {
  const source = canonicalSkillsRoot(options);
  const destination = installedSkillsRoot(options);
  mkdirSync(destination, { recursive: true });
  for (const name of TK_SKILLS) {
    const from = join(source, name);
    const to = join(destination, name);
    if (!existsSync(join(from, 'SKILL.md'))) throw new Error(`Canonical TK Skill missing: ${from}`);
    rmSync(to, { recursive: true, force: true });
    cpSync(from, to, { recursive: true });
  }
  return destination;
}

function mcpCommand() {
  return ['npx', '--yes', '--package', '@jarl_okbe/tk', 'tk-mcp-server'];
}

function readJsoncConfig(path) {
  if (!existsSync(path)) return { text: '{}\n', value: {} };
  const text = readText(path);
  const errors = [];
  const value = parseJsonc(text, errors, { allowTrailingComma: true, allowEmptyContent: true });
  if (errors.length) throw new Error(`Invalid JSONC config: ${path}`);
  return { text, value: value || {} };
}

function updateJsonc(text, path, value) {
  return applyEdits(
    text,
    modify(text, path, value, {
      formattingOptions: { insertSpaces: true, tabSize: 2, eol: '\n', insertFinalNewline: true },
    }),
  );
}

function readYamlConfig(path) {
  const document = parseYamlDocument(existsSync(path) ? readText(path) : '{}\n');
  if (document.errors.length) throw new Error(`Invalid YAML config: ${path}: ${document.errors[0].message}`);
  return document;
}

function skillChecks(root) {
  return TK_SKILLS.map((name) => ({
    name,
    ok: existsSync(join(root, name, 'SKILL.md')),
    path: join(root, name, 'SKILL.md'),
  }));
}


function formatHostResult(action, result) {
  if (result.dryRun) return `${JSON.stringify(result.preview, null, 2)}\n`;
  const lines = result.checks.map((check) => {
    const details = check.details?.length ? check.details : check.path ? [check.path] : [];
    const suffix = details.length ? `: ${details.join(', ')}` : '';
    return `${check.ok ? 'ok' : 'fail'} ${check.name}${suffix}`;
  });
  if (result.ok) {
    lines.push(`${action} ${result.host} adapter`);
    for (const next of result.next || []) lines.push(next);
  } else {
    lines.push(`Run tk ${result.host} install, then restart ${result.host === 'hermes' ? 'Hermes' : 'OpenCode'} or start a new session.`);
  }
  return `${lines.join('\n')}\n`;
}

function opencodePaths(options = {}) {
  const configRoot = resolve(options.configRoot || process.env.XDG_CONFIG_HOME || join(configuredHome(options), '.config'));
  return { configPath: join(configRoot, 'opencode', 'opencode.json'), skillsRoot: installedSkillsRoot(options) };
}

export function opencodeAdapterStatus(options = {}) {
  const paths = opencodePaths(options);
  let config;
  try {
    config = readJsoncConfig(paths.configPath).value;
  } catch (error) {
    return { ok: false, host: 'opencode', paths, checks: [{ name: 'config_valid', ok: false, details: [error.message] }] };
  }
  const command = mcpCommand();
  const configuredSkills = config.skills?.paths || [];
  const configuredMcp = config.mcp?.['technical-knockout'];
  const checks = [
    { name: 'config_valid', ok: true, details: [paths.configPath] },
    ...skillChecks(paths.skillsRoot).map((check) => ({ ...check, name: `skill_${check.name}` })),
    { name: 'skills_path_configured', ok: configuredSkills.includes(paths.skillsRoot), details: [paths.skillsRoot] },
    {
      name: 'mcp_configured',
      ok: configuredMcp?.type === 'local' && JSON.stringify(configuredMcp.command) === JSON.stringify(command) && configuredMcp.enabled !== false,
      details: ['technical-knockout'],
    },
  ];
  return { ok: checks.every((check) => check.ok), host: 'opencode', paths, checks };
}

export function installOpencodeAdapter(options = {}) {
  const paths = opencodePaths(options);
  const current = readJsoncConfig(paths.configPath);
  const skills = Array.from(new Set([...(current.value.skills?.paths || []), paths.skillsRoot]));
  let text = updateJsonc(current.text, ['skills', 'paths'], skills);
  text = updateJsonc(text, ['mcp', 'technical-knockout'], {
    type: 'local',
    command: mcpCommand(),
    enabled: true,
  });
  const preview = { configPath: paths.configPath, skills: { paths: skills }, mcp: { 'technical-knockout': { type: 'local', command: mcpCommand(), enabled: true } } };
  if (options.dryRun) return { ok: true, dryRun: true, host: 'opencode', paths, preview, checks: [] };
  syncInstalledSkills(options);
  mkdirSync(dirname(paths.configPath), { recursive: true });
  writeFileSync(paths.configPath, text.endsWith('\n') ? text : `${text}\n`);
  return { ...opencodeAdapterStatus(options), next: ['Restart OpenCode or start a new OpenCode session.', 'Run opencode mcp list to verify the MCP connection.'] };
}

export function removeOpencodeAdapter(options = {}) {
  const paths = opencodePaths(options);
  const current = readJsoncConfig(paths.configPath);
  const configuredSkills = current.value.skills?.paths || [];
  const skills = configuredSkills.filter((path) => path !== paths.skillsRoot);
  let text = current.text;
  if (configuredSkills.includes(paths.skillsRoot)) {
    text = updateJsonc(text, ['skills', 'paths'], skills.length ? skills : undefined);
  }
  if (current.value.mcp?.['technical-knockout'] !== undefined) {
    text = updateJsonc(text, ['mcp', 'technical-knockout'], undefined);
  }
  const preview = { configPath: paths.configPath, removeSkillsPath: paths.skillsRoot, removeMcp: 'technical-knockout' };
  if (options.dryRun) return { ok: true, dryRun: true, host: 'opencode', paths, preview, checks: [] };
  if (existsSync(paths.configPath) && text !== current.text) {
    writeFileSync(paths.configPath, text.endsWith('\n') ? text : `${text}\n`);
  }
  return {
    ok: true,
    host: 'opencode',
    paths,
    checks: [
      { name: 'skills_path_removed', ok: true },
      { name: 'mcp_removed', ok: true },
    ],
    next: ['Restart OpenCode or start a new OpenCode session.'],
  };
}

function hermesPaths(options = {}) {
  const hermesHome = resolve(options.hermesHome || process.env.HERMES_HOME || join(configuredHome(options), '.hermes'));
  return { configPath: join(hermesHome, 'config.yaml'), skillsRoot: installedSkillsRoot(options) };
}

export function hermesAdapterStatus(options = {}) {
  const paths = hermesPaths(options);
  let config;
  try {
    config = readYamlConfig(paths.configPath).toJS() || {};
  } catch (error) {
    return { ok: false, host: 'hermes', paths, checks: [{ name: 'config_valid', ok: false, details: [error.message] }] };
  }
  const configuredMcp = config.mcp_servers?.['technical-knockout'];
  const checks = [
    { name: 'config_valid', ok: true, details: [paths.configPath] },
    ...skillChecks(paths.skillsRoot).map((check) => ({ ...check, name: `skill_${check.name}` })),
    { name: 'skills_path_configured', ok: (config.skills?.external_dirs || []).includes(paths.skillsRoot), details: [paths.skillsRoot] },
    {
      name: 'mcp_configured',
      ok: configuredMcp?.command === 'npx' && JSON.stringify(configuredMcp.args) === JSON.stringify(mcpCommand().slice(1)) && configuredMcp.enabled !== false,
      details: ['technical-knockout'],
    },
  ];
  return { ok: checks.every((check) => check.ok), host: 'hermes', paths, checks };
}

export function installHermesAdapter(options = {}) {
  const paths = hermesPaths(options);
  const document = readYamlConfig(paths.configPath);
  const config = document.toJS() || {};
  const externalDirs = Array.from(new Set([...(config.skills?.external_dirs || []), paths.skillsRoot]));
  document.setIn(['skills', 'external_dirs'], externalDirs);
  document.setIn(['mcp_servers', 'technical-knockout'], {
    command: 'npx',
    args: mcpCommand().slice(1),
    enabled: true,
  });
  const preview = { configPath: paths.configPath, skills: { external_dirs: externalDirs }, mcp_servers: { 'technical-knockout': { command: 'npx', args: mcpCommand().slice(1), enabled: true } } };
  if (options.dryRun) return { ok: true, dryRun: true, host: 'hermes', paths, preview, checks: [] };
  syncInstalledSkills(options);
  mkdirSync(dirname(paths.configPath), { recursive: true });
  writeFileSync(paths.configPath, document.toString());
  return { ...hermesAdapterStatus(options), next: ['Start a new Hermes session or run /reload-skills.', 'Run hermes mcp test technical-knockout to verify the MCP connection.'] };
}

export function removeHermesAdapter(options = {}) {
  const paths = hermesPaths(options);
  const document = readYamlConfig(paths.configPath);
  const config = document.toJS() || {};
  const configuredDirs = config.skills?.external_dirs || [];
  const externalDirs = configuredDirs.filter((path) => path !== paths.skillsRoot);
  if (configuredDirs.includes(paths.skillsRoot)) {
    if (externalDirs.length) document.setIn(['skills', 'external_dirs'], externalDirs);
    else document.deleteIn(['skills', 'external_dirs']);
  }
  if (config.mcp_servers?.['technical-knockout'] !== undefined) {
    document.deleteIn(['mcp_servers', 'technical-knockout']);
  }
  const preview = { configPath: paths.configPath, removeSkillsPath: paths.skillsRoot, removeMcp: 'technical-knockout' };
  if (options.dryRun) return { ok: true, dryRun: true, host: 'hermes', paths, preview, checks: [] };
  if (existsSync(paths.configPath)) writeFileSync(paths.configPath, document.toString());
  return {
    ok: true,
    host: 'hermes',
    paths,
    checks: [
      { name: 'skills_path_removed', ok: true },
      { name: 'mcp_removed', ok: true },
    ],
    next: ['Start a new Hermes session or run /reload-skills.'],
  };
}

export function formatAdapterInstall(result) {
  return formatHostResult('installed', result);
}

export function formatAdapterStatus(result) {
  return formatHostResult(result.ok ? 'ready' : 'not ready', result);
}

export function formatAdapterRemove(result) {
  return formatHostResult('removed', result);
}

async function runClaude(args, cwd = process.cwd()) {
  try {
    const { stdout, stderr } = await execFileAsync('claude', args, {
      cwd,
      maxBuffer: 1024 * 1024 * 16,
    });
    return { ok: true, command: ['claude', ...args], stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (error) {
    return {
      ok: false,
      command: ['claude', ...args],
      stdout: (error.stdout || '').trim(),
      stderr: (error.stderr || '').trim(),
      error: error.message,
      code: error.code,
    };
  }
}

async function runClaudeJson(args, cwd = process.cwd()) {
  const result = await runClaude(args, cwd);
  if (!result.ok) return result;
  try {
    return { ...result, data: JSON.parse(result.stdout) };
  } catch (error) {
    return { ...result, ok: false, error: `Invalid Claude CLI JSON: ${error.message}` };
  }
}

function claudeMarketplaceRecord(records, marketplace) {
  return Array.isArray(records) ? records.find((record) => record.name === marketplace) : undefined;
}

function claudePluginRecord(records, selector, scope) {
  return Array.isArray(records)
    ? records.find((record) => record.id === selector && record.scope === scope)
    : undefined;
}

function normalizeClaudeMarketplaceSource(source, cwd = process.cwd()) {
  if (source && typeof source === 'object') {
    const type = String(source.source || '').toLowerCase();
    if (type === 'directory' || type === 'file') {
      const path = String(source.path || '').trim();
      if (!path) return '';
      const base = resolveClaudeProjectRoot(cwd);
      return `local:${isAbsolute(path) ? resolve(path) : resolve(base, path)}`;
    }
    if (type === 'github' && source.repo) {
      return normalizeClaudeMarketplaceSource(`${source.repo}${source.ref ? `@${source.ref}` : ''}`, cwd);
    }
    if (source.url) {
      return normalizeClaudeMarketplaceSource(`${source.url}${source.ref ? `#${source.ref}` : ''}`, cwd);
    }
    return '';
  }

  const value = String(source || '').trim();
  if (!value) return '';

  if (isAbsolute(value)) return `local:${resolve(value)}`;
  if (value.startsWith('.')) {
    return `local:${resolve(resolveClaudeProjectRoot(cwd), value)}`;
  }

  const sshMatch = value.match(/^git@github\.com:([^/]+)\/(.+)$/i);
  if (sshMatch) {
    const [repo, ref = ''] = sshMatch[2].split('#', 2);
    return `github:${sshMatch[1].toLowerCase()}/${repo.replace(/\.git$/i, '').toLowerCase()}#${ref}`;
  }

  try {
    const url = new URL(value);
    if (url.hostname.toLowerCase() === 'github.com') {
      const [owner, repo] = url.pathname.replace(/^\/+|\/+$/g, '').split('/');
      if (owner && repo) {
        return `github:${owner.toLowerCase()}/${repo.replace(/\.git$/i, '').toLowerCase()}#${url.hash.slice(1)}`;
      }
    }
    url.pathname = url.pathname.replace(/\/+$/g, '').replace(/\.git$/i, '');
    return `url:${url.toString()}`;
  } catch {
    const githubMatch = value.match(/^([^/]+)\/([^/@#]+)(?:@(.+))?$/);
    if (githubMatch) {
      const [, owner, repo, ref = ''] = githubMatch;
      return `github:${owner.toLowerCase()}/${repo.replace(/\.git$/i, '').toLowerCase()}#${ref}`;
    }
    return `raw:${value}`;
  }
}

function claudeMarketplaceRecordSource(record) {
  if (!record) return undefined;
  if (record.source && typeof record.source === 'object') return record.source;
  return record;
}

function claudeMarketplaceSourceMatches(record, source, cwd = process.cwd()) {
  return (
    normalizeClaudeMarketplaceSource(claudeMarketplaceRecordSource(record), cwd) ===
    normalizeClaudeMarketplaceSource(source, cwd)
  );
}

function resolveClaudeProjectRoot(cwd = process.cwd()) {
  try {
    const { stdout: topLevel } = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const { stdout: commonDirectory } = execFileSync('git', ['rev-parse', '--git-common-dir'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const repositoryRoot = resolve(topLevel.trim());
    if (repositoryRoot === resolve(homedir())) return resolve(cwd);
    const commonGitDirectory = resolve(repositoryRoot, commonDirectory.trim());
    return commonDirectory.trim() === '.git'
      ? repositoryRoot
      : dirname(commonGitDirectory);
  } catch {
    return resolve(cwd);
  }
}

function claudeMarketplaceSettingsPath(scope, cwd = process.cwd()) {
  if (scope === 'user') {
    const configRoot = process.env.CLAUDE_CONFIG_DIR
      ? resolve(process.env.CLAUDE_CONFIG_DIR)
      : join(homedir(), '.claude');
    return join(configRoot, 'settings.json');
  }
  const projectRoot = resolveClaudeProjectRoot(cwd);
  return join(projectRoot, '.claude', scope === 'project' ? 'settings.json' : 'settings.local.json');
}

function claudeScopedMarketplaceDeclaration(marketplace, scope, cwd = process.cwd()) {
  const path = claudeMarketplaceSettingsPath(scope, cwd);
  if (!existsSync(path)) return { path, record: undefined };
  try {
    const settings = parseJsonc(readFileSync(path, 'utf8'));
    return { path, record: settings?.extraKnownMarketplaces?.[marketplace]?.source };
  } catch {
    return { path, record: undefined };
  }
}

export async function installClaudePlugin(options = {}) {
  const marketplace = options.marketplace || 'tech-knockout';
  const plugin = options.plugin || 'technical-knockout';
  const source = options.source || 'okbexx/tech-knockout';
  const scope = options.scope || 'user';
  const cwd = options.cwd || process.cwd();
  const selector = `${plugin}@${marketplace}`;
  const addMarketplaceCommand = ['plugin', 'marketplace', 'add', source, '--scope', scope];
  const installPluginCommand = ['plugin', 'install', selector, '--scope', scope];
  const uninstallPluginCommand = ['plugin', 'uninstall', selector, '--scope', scope];

  if (options.dryRun) {
    return {
      ok: true,
      dryRun: true,
      marketplace,
      plugin,
      source,
      scope,
      selector,
      commands: [
        ['claude', 'plugin', 'marketplace', 'list', '--json'],
        ['claude', ...addMarketplaceCommand],
        ['claude', 'plugin', 'marketplace', 'list', '--json'],
        ['claude', 'plugin', 'list', '--json'],
        ['claude', ...installPluginCommand],
      ],
    };
  }

  const steps = [];
  const marketplaceList = await runClaudeJson(['plugin', 'marketplace', 'list', '--json'], cwd);
  steps.push({ name: 'marketplace_list', ...marketplaceList });
  if (!marketplaceList.ok) return { ok: false, marketplace, plugin, source, scope, selector, steps };

  const previousMarketplace = claudeMarketplaceRecord(marketplaceList.data, marketplace);
  const previousSourceMatched = claudeMarketplaceSourceMatches(previousMarketplace, source, cwd);
  const addMarketplace = await runClaude(addMarketplaceCommand, cwd);
  steps.push({ name: 'marketplace_add', ...addMarketplace });
  if (!addMarketplace.ok) return { ok: false, marketplace, plugin, source, scope, selector, steps };

  const verifiedMarketplaceList = await runClaudeJson(['plugin', 'marketplace', 'list', '--json'], cwd);
  steps.push({ name: 'marketplace_verify', ...verifiedMarketplaceList });
  if (!verifiedMarketplaceList.ok) {
    return { ok: false, marketplace, plugin, source, scope, selector, steps };
  }
  const marketplaceRecord = claudeMarketplaceRecord(verifiedMarketplaceList.data, marketplace);
  const marketplaceSourceOk = claudeMarketplaceSourceMatches(marketplaceRecord, source, cwd);
  const scopedDeclaration = claudeScopedMarketplaceDeclaration(marketplace, scope, cwd);
  const marketplaceScopeOk = claudeMarketplaceSourceMatches(scopedDeclaration.record, source, cwd);
  steps.push({
    name: 'marketplace_source',
    ok: marketplaceSourceOk,
    command: ['claude', 'plugin', 'marketplace', 'list', '--json'],
    stdout: marketplaceSourceOk ? `marketplace ${marketplace} resolves to ${source}` : '',
    stderr: marketplaceSourceOk ? '' : `marketplace ${marketplace} does not resolve to ${source}`,
  });
  steps.push({
    name: 'marketplace_scope',
    ok: marketplaceScopeOk,
    command: ['claude', ...addMarketplaceCommand],
    stdout: marketplaceScopeOk ? `marketplace ${marketplace} is declared in ${scope} scope` : '',
    stderr: marketplaceScopeOk ? '' : `marketplace ${marketplace} is not declared in ${scope} scope at ${scopedDeclaration.path}`,
  });
  if (!marketplaceSourceOk || !marketplaceScopeOk) {
    return { ok: false, marketplace, plugin, source, scope, selector, steps };
  }

  const pluginList = await runClaudeJson(['plugin', 'list', '--json'], cwd);
  steps.push({ name: 'plugin_list', ...pluginList });
  if (!pluginList.ok) return { ok: false, marketplace, plugin, source, scope, selector, steps };

  const installed = claudePluginRecord(pluginList.data, selector, scope);
  if (installed && !previousSourceMatched) {
    const uninstall = await runClaude(uninstallPluginCommand, cwd);
    steps.push({ name: 'plugin_uninstall_wrong_source', ...uninstall });
    if (uninstall.ok) {
      const install = await runClaude(installPluginCommand, cwd);
      steps.push({ name: 'plugin_install', ...install });
    }
  } else if (installed?.enabled) {
    steps.push({
      name: 'plugin_install',
      ok: true,
      skipped: true,
      command: ['claude', ...installPluginCommand],
      stdout: `plugin ${selector} already installed and enabled`,
      stderr: '',
    });
  } else if (installed) {
    const enable = await runClaude(['plugin', 'enable', selector, '--scope', scope], cwd);
    steps.push({ name: 'plugin_enable', ...enable });
  } else {
    const install = await runClaude(installPluginCommand, cwd);
    steps.push({ name: 'plugin_install', ...install });
  }

  return {
    ok: steps.every((step) => step.ok),
    marketplace,
    plugin,
    source,
    scope,
    selector,
    steps,
    next: [
      'Restart Claude Code or start a new Claude Code session.',
      'Run /mcp in Claude Code to verify the technical-knockout MCP server.',
    ],
  };
}

export async function claudePluginStatus(options = {}) {
  const marketplace = options.marketplace || 'tech-knockout';
  const plugin = options.plugin || 'technical-knockout';
  const source = options.source || 'okbexx/tech-knockout';
  const scope = options.scope || 'user';
  const cwd = options.cwd || process.cwd();
  const selector = `${plugin}@${marketplace}`;
  const [marketplaceList, pluginList] = await Promise.all([
    runClaudeJson(['plugin', 'marketplace', 'list', '--json'], cwd),
    runClaudeJson(['plugin', 'list', '--json'], cwd),
  ]);
  const marketplaceRecord = marketplaceList.ok
    ? claudeMarketplaceRecord(marketplaceList.data, marketplace)
    : undefined;
  const scopedDeclaration = claudeScopedMarketplaceDeclaration(marketplace, scope, cwd);
  const pluginRecord = pluginList.ok ? claudePluginRecord(pluginList.data, selector, scope) : undefined;
  const cliError = marketplaceList.stderr || marketplaceList.error || pluginList.stderr || pluginList.error;
  const checks = [
    { name: 'claude_cli', ok: marketplaceList.ok && pluginList.ok, details: cliError ? [cliError] : [] },
    { name: 'marketplace_configured', ok: Boolean(marketplaceRecord), details: [marketplace] },
    {
      name: 'marketplace_source',
      ok: claudeMarketplaceSourceMatches(marketplaceRecord, source, cwd),
      details: [source],
    },
    {
      name: 'marketplace_scope',
      ok: claudeMarketplaceSourceMatches(scopedDeclaration.record, source, cwd),
      details: [`${scope}: ${scopedDeclaration.path}`],
    },
    { name: 'plugin_installed', ok: Boolean(pluginRecord), details: [`${selector} (${scope})`] },
    { name: 'plugin_enabled', ok: pluginRecord?.enabled === true, details: [`${selector} (${scope})`] },
  ];
  return {
    ok: checks.every((check) => check.ok),
    marketplace,
    plugin,
    source,
    scope,
    selector,
    checks,
    commands: {
      install: commandText(['tk', 'claude', 'install', '--source', source, '--marketplace', marketplace, '--plugin', plugin, '--scope', scope]),
      refresh: commandText(['tk', 'claude', 'refresh', '--marketplace', marketplace, '--plugin', plugin, '--scope', scope]),
    },
  };
}

export async function refreshClaudePlugin(options = {}) {
  const marketplace = options.marketplace || 'tech-knockout';
  const plugin = options.plugin || 'technical-knockout';
  const scope = options.scope || 'user';
  const selector = `${plugin}@${marketplace}`;
  const updateMarketplaceCommand = ['plugin', 'marketplace', 'update', marketplace];
  const updatePluginCommand = ['plugin', 'update', selector, '--scope', scope];

  if (options.dryRun) {
    return {
      ok: true,
      dryRun: true,
      marketplace,
      plugin,
      scope,
      selector,
      commands: [
        ['claude', ...updateMarketplaceCommand],
        ['claude', ...updatePluginCommand],
      ],
    };
  }

  const updateMarketplace = await runClaude(updateMarketplaceCommand);
  const updatePlugin = updateMarketplace.ok
    ? await runClaude(updatePluginCommand)
    : {
        ok: false,
        command: ['claude', ...updatePluginCommand],
        stdout: '',
        stderr: 'marketplace update failed',
        error: 'marketplace update failed',
      };
  const steps = [
    { name: 'marketplace_update', ...updateMarketplace },
    { name: 'plugin_update', ...updatePlugin },
  ];
  return {
    ok: steps.every((step) => step.ok),
    marketplace,
    plugin,
    scope,
    selector,
    steps,
    next: ['Restart Claude Code or start a new Claude Code session to load the refreshed plugin.'],
  };
}

export async function removeClaudePlugin(options = {}) {
  const marketplace = options.marketplace || 'tech-knockout';
  const plugin = options.plugin || 'technical-knockout';
  const scope = options.scope || 'user';
  const selector = `${plugin}@${marketplace}`;
  const uninstallCommand = ['plugin', 'uninstall', selector, '--scope', scope];

  if (options.dryRun) {
    return {
      ok: true,
      dryRun: true,
      marketplace,
      plugin,
      scope,
      selector,
      commands: [['claude', ...uninstallCommand]],
    };
  }

  const pluginList = await runClaudeJson(['plugin', 'list', '--json']);
  const steps = [{ name: 'plugin_list', ...pluginList }];
  if (!pluginList.ok) return { ok: false, marketplace, plugin, scope, selector, steps };

  if (!claudePluginRecord(pluginList.data, selector, scope)) {
    steps.push({
      name: 'plugin_uninstall',
      ok: true,
      skipped: true,
      command: ['claude', ...uninstallCommand],
      stdout: `plugin ${selector} is not installed in ${scope} scope`,
      stderr: '',
    });
  } else {
    const uninstall = await runClaude(uninstallCommand);
    steps.push({ name: 'plugin_uninstall', ...uninstall });
  }

  return {
    ok: steps.every((step) => step.ok),
    marketplace,
    plugin,
    scope,
    selector,
    steps,
    next: ['Restart Claude Code or start a new Claude Code session so the plugin is unloaded.'],
  };
}

function formatClaudeSteps(result, action) {
  if (result.dryRun) return result.commands.map((command) => commandText(command)).join('\n') + '\n';
  const lines = [];
  for (const step of result.steps || []) {
    const status = step.skipped ? 'skip' : step.ok ? 'ok' : 'fail';
    lines.push(`${status} ${step.name}: ${commandText(step.command || [])}`);
    if (!step.ok) lines.push(step.stderr || step.error || 'claude command failed');
  }
  if (result.ok) {
    lines.push(`${action} ${result.selector}`);
    for (const next of result.next || []) lines.push(next);
  }
  return `${lines.join('\n')}\n`;
}

export function formatClaudeInstall(result) {
  return formatClaudeSteps(result, 'installed');
}

export function formatClaudeRefresh(result) {
  return formatClaudeSteps(result, 'refreshed');
}

export function formatClaudeRemove(result) {
  return formatClaudeSteps(result, 'removed');
}

export function formatClaudeStatus(result) {
  const lines = result.checks.map((check) => {
    const suffix = check.details?.length ? `: ${check.details.join(', ')}` : '';
    return `${check.ok ? 'ok' : 'fail'} ${check.name}${suffix}`;
  });
  if (result.ok) {
    lines.push(`ready ${result.selector} (${result.scope})`);
    lines.push(`refresh: ${result.commands.refresh}`);
  } else {
    lines.push(`install: ${result.commands.install}`);
  }
  return `${lines.join('\n')}\n`;
}

async function runCodex(args, cwd = process.cwd()) {
  try {
    const { stdout, stderr } = await execFileAsync('codex', args, {
      cwd,
      maxBuffer: 1024 * 1024 * 16,
    });
    return { ok: true, command: ['codex', ...args], stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (error) {
    return {
      ok: false,
      command: ['codex', ...args],
      stdout: (error.stdout || '').trim(),
      stderr: (error.stderr || '').trim(),
      error: error.message,
      code: error.code,
    };
  }
}

function marketplaceIsConfigured(output, marketplace) {
  return output
    .split(/\r?\n/)
    .some((line) => line.trim().startsWith(`${marketplace} `) || line.trim() === marketplace);
}

function pluginIsInstalled(output, selector) {
  return output.includes(selector) && output.includes('installed');
}

function commandText(command) {
  return command.map((part) => (/\s/.test(part) ? JSON.stringify(part) : part)).join(' ');
}

export async function installCodexPlugin(options = {}) {
  const marketplace = options.marketplace || 'tech-knockout';
  const plugin = options.plugin || 'technical-knockout';
  const source = options.source || 'okbexx/tech-knockout';
  const selector = `${plugin}@${marketplace}`;
  const steps = [];

  const addMarketplaceCommand = ['plugin', 'marketplace', 'add', source];
  if (options.ref) addMarketplaceCommand.push('--ref', options.ref);
  const addPluginCommand = ['plugin', 'add', selector];

  if (options.dryRun) {
    return {
      ok: true,
      dryRun: true,
      marketplace,
      plugin,
      source,
      commands: [
        ['codex', ...addMarketplaceCommand],
        ['codex', ...addPluginCommand],
        ['codex', 'plugin', 'list', '--marketplace', marketplace],
      ],
    };
  }

  const marketplaceList = await runCodex(['plugin', 'marketplace', 'list']);
  steps.push({ name: 'marketplace_list', ...marketplaceList });
  if (!marketplaceList.ok) {
    return { ok: false, marketplace, plugin, source, steps };
  }

  if (marketplaceIsConfigured(marketplaceList.stdout, marketplace)) {
    steps.push({
      name: 'marketplace_add',
      ok: true,
      skipped: true,
      command: ['codex', ...addMarketplaceCommand],
      stdout: `marketplace ${marketplace} already configured`,
      stderr: '',
    });
  } else {
    const addMarketplace = await runCodex(addMarketplaceCommand);
    steps.push({ name: 'marketplace_add', ...addMarketplace });
    if (!addMarketplace.ok) {
      return { ok: false, marketplace, plugin, source, steps };
    }
  }

  const pluginList = await runCodex(['plugin', 'list', '--marketplace', marketplace]);
  steps.push({ name: 'plugin_list', ...pluginList });
  if (!pluginList.ok) {
    return { ok: false, marketplace, plugin, source, steps };
  }

  if (pluginIsInstalled(pluginList.stdout, selector)) {
    steps.push({
      name: 'plugin_add',
      ok: true,
      skipped: true,
      command: ['codex', ...addPluginCommand],
      stdout: `plugin ${selector} already installed`,
      stderr: '',
    });
  } else {
    const addPlugin = await runCodex(addPluginCommand);
    steps.push({ name: 'plugin_add', ...addPlugin });
    if (!addPlugin.ok) {
      return { ok: false, marketplace, plugin, source, steps };
    }
  }

  return {
    ok: steps.every((step) => step.ok),
    marketplace,
    plugin,
    source,
    selector,
    steps,
    next: [
      'Restart Codex or start a new Codex thread.',
      `Run codex plugin list --marketplace ${marketplace} to verify the installation.`,
    ],
  };
}

export async function codexPluginStatus(options = {}) {
  const marketplace = options.marketplace || 'tech-knockout';
  const plugin = options.plugin || 'technical-knockout';
  const selector = `${plugin}@${marketplace}`;
  const marketplaceList = await runCodex(['plugin', 'marketplace', 'list']);
  const pluginList = await runCodex(['plugin', 'list', '--marketplace', marketplace]);
  const checks = [
    {
      name: 'codex_cli',
      ok: marketplaceList.ok,
      details: marketplaceList.ok ? [] : [marketplaceList.stderr || marketplaceList.error || 'codex command failed'],
    },
    {
      name: 'marketplace_configured',
      ok: marketplaceList.ok && marketplaceIsConfigured(marketplaceList.stdout, marketplace),
      details: marketplaceList.ok ? [] : [marketplaceList.stderr || marketplaceList.error || 'marketplace list failed'],
    },
    {
      name: 'plugin_installed',
      ok: pluginList.ok && pluginIsInstalled(pluginList.stdout, selector),
      details: pluginList.ok ? [] : [pluginList.stderr || pluginList.error || 'plugin list failed'],
    },
  ];
  return {
    ok: checks.every((check) => check.ok),
    marketplace,
    plugin,
    selector,
    checks,
    commands: {
      install: `tk codex install --marketplace ${marketplace} --plugin ${plugin}`,
      refresh: `tk codex refresh --marketplace ${marketplace} --plugin ${plugin}`,
    },
  };
}

export async function refreshCodexPlugin(options = {}) {
  const marketplace = options.marketplace || 'tech-knockout';
  const plugin = options.plugin || 'technical-knockout';
  const selector = `${plugin}@${marketplace}`;
  const upgradeCommand = ['plugin', 'marketplace', 'upgrade', marketplace];
  const removeCommand = ['plugin', 'remove', selector];
  const addCommand = ['plugin', 'add', selector];

  if (options.dryRun) {
    return {
      ok: true,
      dryRun: true,
      marketplace,
      plugin,
      selector,
      commands: [
        ['codex', ...upgradeCommand],
        ['codex', ...removeCommand],
        ['codex', ...addCommand],
      ],
    };
  }

  const upgrade = await runCodex(upgradeCommand);
  const remove = upgrade.ok
    ? await runCodex(removeCommand)
    : { ok: false, command: ['codex', ...removeCommand], stdout: '', stderr: 'marketplace upgrade failed', error: 'marketplace upgrade failed' };
  const add = remove.ok
    ? await runCodex(addCommand)
    : { ok: false, command: ['codex', ...addCommand], stdout: '', stderr: 'plugin removal failed', error: 'plugin removal failed' };
  const steps = [
    { name: 'marketplace_upgrade', ...upgrade },
    { name: 'plugin_remove', ...remove },
    { name: 'plugin_add', ...add },
  ];
  return {
    ok: steps.every((step) => step.ok),
    marketplace,
    plugin,
    selector,
    steps,
    next: ['Start a new Codex thread so refreshed Skills and MCP config are loaded.'],
  };
}
export async function removeCodexPlugin(options = {}) {
  const marketplace = options.marketplace || 'tech-knockout';
  const plugin = options.plugin || 'technical-knockout';
  const selector = `${plugin}@${marketplace}`;
  const removeCommand = ['plugin', 'remove', selector];
  const removeMarketplaceCommand = ['plugin', 'marketplace', 'remove', marketplace];

  if (options.dryRun) {
    return {
      ok: true,
      dryRun: true,
      marketplace,
      plugin,
      selector,
      commands: [
        ['codex', ...removeCommand],
        ['codex', ...removeMarketplaceCommand],
      ],
    };
  }

  const remove = await runCodex(removeCommand);
  const removeMarketplace = remove.ok
    ? await runCodex(removeMarketplaceCommand)
    : { ok: false, command: ['codex', ...removeMarketplaceCommand], stdout: '', stderr: 'plugin removal failed', error: 'plugin removal failed' };
  const steps = [
    { name: 'plugin_remove', ...remove },
    { name: 'marketplace_remove', ...removeMarketplace },
  ];
  return {
    ok: steps.every((step) => step.ok),
    marketplace,
    plugin,
    selector,
    steps,
    next: ['Start a new Codex thread so removed Skills and MCP config are unloaded.'],
  };
}

export function formatCodexRemove(result) {
  if (result.dryRun) {
    return result.commands.map((command) => commandText(command)).join('\n') + '\n';
  }

  const lines = [];
  for (const step of result.steps || []) {
    lines.push(`${step.ok ? 'ok' : 'fail'} ${step.name}: ${commandText(step.command || [])}`);
    if (!step.ok) lines.push(step.stderr || step.error || 'codex command failed');
  }
  if (result.ok) {
    lines.push(`removed ${result.selector}`);
    for (const next of result.next || []) lines.push(next);
  }
  return `${lines.join('\n')}\n`;
}


export function formatCodexInstall(result) {
  if (result.dryRun) {
    return result.commands.map((command) => commandText(command)).join('\n') + '\n';
  }

  const lines = [];
  for (const step of result.steps || []) {
    const status = step.skipped ? 'skip' : step.ok ? 'ok' : 'fail';
    lines.push(`${status} ${step.name}: ${commandText(step.command || [])}`);
    if (!step.ok) {
      if (step.stderr) lines.push(step.stderr);
      else if (step.error) lines.push(step.error);
    }
  }
  if (result.ok) {
    lines.push(`installed ${result.selector}`);
    for (const next of result.next || []) lines.push(next);
  }
  return lines.join('\n') + '\n';
}

export function formatCodexStatus(result) {
  const lines = result.checks.map((check) => {
    const suffix = check.details?.length ? `: ${check.details.join(', ')}` : '';
    return `${check.ok ? 'ok' : 'fail'} ${check.name}${suffix}`;
  });
  if (!result.ok) {
    lines.push(`install: ${result.commands.install}`);
  } else {
    lines.push(`ready ${result.selector}`);
    lines.push(`refresh: ${result.commands.refresh}`);
  }
  return `${lines.join('\n')}\n`;
}

export function formatCodexRefresh(result) {
  if (result.dryRun) {
    return result.commands.map((command) => commandText(command)).join('\n') + '\n';
  }

  const lines = [];
  for (const step of result.steps || []) {
    lines.push(`${step.ok ? 'ok' : 'fail'} ${step.name}: ${commandText(step.command || [])}`);
    if (!step.ok) lines.push(step.stderr || step.error || 'codex command failed');
  }
  if (result.ok) {
    lines.push(`refreshed ${result.selector}`);
    for (const next of result.next || []) lines.push(next);
  }
  return `${lines.join('\n')}\n`;
}

export async function sourceStatus(options = {}) {
  const paths = getPaths(options);
  const catalog = loadCatalog(options);
  const sources = [];
  for (const project of catalog.projects) {
    const sourcePath = project.sourceDir ? join(paths.sourceRoot, project.sourceDir) : null;
    const exists = Boolean(sourcePath && existsSync(join(sourcePath, '.git')));
    const source = {
      id: project.id,
      repo: project.repo,
      url: project.url,
      cloneUrl: project.cloneUrl,
      sourceDir: project.sourceDir,
      exists,
    };
    if (exists) {
      try {
        source.branch = await git(['branch', '--show-current'], sourcePath);
        source.commit = await git(['rev-parse', 'HEAD'], sourcePath);
        source.remote = await git(['remote', 'get-url', 'origin'], sourcePath);
        source.shallow = existsSync(join(sourcePath, '.git', 'shallow'));
        source.dirty = (await git(['status', '--short'], sourcePath)).length > 0;
      } catch (error) {
        source.error = error.message;
      }
    }
    sources.push(source);
  }
  return {
    generatedAt: new Date().toISOString(),
    sources,
  };
}

export async function writeLock(status, options = {}) {
  const paths = getPaths(options);
  mkdirSync(dirname(paths.lockPath), { recursive: true });
  writeFileSync(paths.lockPath, `${JSON.stringify(status, null, 2)}\n`);
  return paths.lockPath;
}

export function syncPlan(options = {}) {
  const paths = getPaths(options);
  const catalog = loadCatalog(options);
  const only = options.only ? new Set(options.only.map((item) => item.toLowerCase())) : null;
  const actions = [];
  for (const project of catalog.projects) {
    if (only && !only.has(project.id) && !only.has(project.reportFile.toLowerCase())) continue;
    if (!project.cloneUrl || !project.sourceDir) continue;
    const sourcePath = join(paths.sourceRoot, project.sourceDir);
    if (!existsSync(join(sourcePath, '.git'))) {
      actions.push({
        action: 'clone',
        id: project.id,
        repo: project.repo,
        cloneUrl: project.cloneUrl,
        sourceDir: project.sourceDir,
      });
    } else if (options.pull) {
      actions.push({
        action: 'fetch',
        id: project.id,
        repo: project.repo,
        sourceDir: project.sourceDir,
      });
    }
  }
  return { actions };
}

export async function executeSyncPlan(plan, options = {}) {
  const paths = getPaths(options);
  mkdirSync(paths.projectsDir, { recursive: true });
  const results = [];
  for (const action of plan.actions) {
    const target = join(paths.sourceRoot, action.sourceDir);
    try {
      if (action.action === 'clone') {
        await git(['clone', '--depth', '1', action.cloneUrl, target], paths.sourceRoot);
      } else if (action.action === 'fetch') {
        await git(['fetch', '--all', '--prune'], target);
      }
      results.push({ ...action, ok: true });
    } catch (error) {
      results.push({ ...action, ok: false, error: error.message });
    }
  }
  return { ok: results.every((result) => result.ok), results };
}

function nearestExistingPath(path) {
  let current = resolve(path);
  while (!existsSync(current)) {
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
  return current;
}

function pathWritable(path) {
  const existing = nearestExistingPath(path);
  if (!existing) return false;
  try {
    accessSync(existing, fsConstants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function repoDoctorChecks(options = {}) {
  const paths = getPaths(options);
  const catalog = loadCatalog(options);
  const validation = validateCatalog(catalog, options);
  const sourceLockPath = join(paths.dataDir, 'tk.lock.json');
  const sourceLockValidation = validatePackagedSourceLock(sourceLockPath, options);
  const reportAudit = auditReportStructure(options);
  const reportAuditPath = join(paths.dataDir, 'report-structure-audit.json');
  const reportsAvailable = existsSync(paths.reportsDir) || existsSync(paths.reportSnapshotDir);
  const comparisonsAvailable = existsSync(paths.comparisonsDir) || existsSync(paths.comparisonSnapshotDir);
  const schemaFiles = [
    'catalog.schema.json',
    'source-lock.schema.json',
    'report-structure-audit.schema.json',
    'replication-plan.schema.json',
    'verification-result.schema.json',
    'run-trace.schema.json',
  ];
  const missingSchemas = schemaFiles.filter((name) => !fileExists(join(paths.packageRoot, 'schemas', name)));
  return [
    { name: 'reports_available', ok: reportsAvailable },
    { name: 'comparisons_available', ok: comparisonsAvailable },
    { name: 'catalog_valid', ok: validation.ok, details: validation.errors },
    { name: 'source_lock_valid', ok: sourceLockValidation.ok, details: sourceLockValidation.errors },
    {
      name: 'report_structure_valid',
      ok: reportAudit.summary.failedReports === 0,
      details: [
        `warn=${reportAudit.summary.warnedReports}`,
        `fail=${reportAudit.summary.failedReports}`,
        ...reportAudit.reports.filter((report) => report.status === 'fail').slice(0, 8).map((report) => report.path),
      ],
    },
    {
      name: 'report_structure_audit_snapshot_present',
      ok: fileExists(reportAuditPath),
      details: [relative(paths.packageRoot, reportAuditPath)],
    },
    { name: 'replication_schemas_available', ok: missingSchemas.length === 0, details: missingSchemas },
  ];
}

function validatePackagedSourceLock(sourceLockPath, options = {}) {
  const paths = getPaths(options);
  if (!fileExists(sourceLockPath)) {
    return { ok: false, errors: [`missing packaged source lock: ${relative(paths.packageRoot, sourceLockPath)}`] };
  }
  try {
    return validateSourceLock(JSON.parse(readText(sourceLockPath)), options);
  } catch (error) {
    return { ok: false, errors: [`invalid packaged source lock: ${error.message}`] };
  }
}

function runtimeDoctorChecks(status, options = {}) {
  const paths = getPaths(options);
  const missingSources = status.sources.filter((source) => !source.exists);
  const dirtySources = status.sources.filter((source) => source.dirty);
  const sourcesRequired = Boolean(options.requireSources);
  const runtimeDataPath = paths.runtimeDataDir;
  const runsPath = paths.runsDir;
  return [
    {
      name: sourcesRequired ? 'sources_present' : 'sources_known',
      ok: sourcesRequired ? missingSources.length === 0 : true,
      details: missingSources.map((s) => s.id),
    },
    { name: 'sources_clean', ok: dirtySources.length === 0, details: dirtySources.map((s) => s.id) },
    { name: 'runtime_data_writable', ok: pathWritable(runtimeDataPath), details: [runtimeDataPath] },
    { name: 'run_artifact_root_writable', ok: pathWritable(runsPath), details: [runsPath] },
  ];
}

export async function doctorRepo(options = {}) {
  const checks = repoDoctorChecks(options);
  return {
    ok: checks.every((check) => check.ok),
    scope: 'repo',
    generatedAt: new Date().toISOString(),
    checks,
  };
}

export async function doctorRuntime(options = {}) {
  const status = await sourceStatus(options);
  const checks = runtimeDoctorChecks(status, options);
  return {
    ok: checks.every((check) => check.ok),
    scope: 'runtime',
    generatedAt: new Date().toISOString(),
    checks,
    sourceGeneratedAt: status.generatedAt,
  };
}

export async function doctor(options = {}) {
  const scope = String(options.scope || 'all').toLowerCase();
  if (scope === 'repo') return doctorRepo(options);
  if (scope === 'runtime') return doctorRuntime(options);
  const repo = await doctorRepo(options);
  const runtime = await doctorRuntime(options);
  const checks = [...repo.checks, ...runtime.checks];
  return {
    ok: checks.every((check) => check.ok),
    scope: 'all',
    generatedAt: new Date().toISOString(),
    checks,
    sections: { repo, runtime },
  };
}

export function readReport(project, options = {}) {
  const paths = getPaths(options);
  const repoPath = join(paths.repoRoot, project.report);
  if (fileExists(repoPath)) return readText(repoPath);
  const snapshotPath = join(paths.reportSnapshotDir, `${project.reportFile}.md`);
  if (fileExists(snapshotPath)) return readText(snapshotPath);
  throw new Error(`Report text not found for ${project.id}`);
}

export function readComparison(id, options = {}) {
  const paths = getPaths(options);
  const repoPath = join(paths.comparisonsDir, `${id}.md`);
  if (fileExists(repoPath)) return readText(repoPath);
  const snapshotPath = join(paths.comparisonSnapshotDir, `${id}.md`);
  if (fileExists(snapshotPath)) return readText(snapshotPath);
  return null;
}

export function formatTable(projects) {
  const rows = projects.map((project) => [
    project.id,
    project.name,
    project.category || '',
    project.adoption || '',
    project.sourceExists ? 'yes' : 'no',
  ]);
  return [
    ['id', 'name', 'category', 'adoption', 'source'],
    ...rows,
  ]
    .map((row) => row.join('\t'))
    .join('\n');
}

export function fileExists(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function writeTextSnapshots(paths) {
  if (existsSync(paths.reportsDir)) {
    mkdirSync(paths.reportSnapshotDir, { recursive: true });
    for (const reportPath of listMarkdownFiles(paths.reportsDir)) {
      copyFileSync(reportPath, join(paths.reportSnapshotDir, reportPath.split('/').pop()));
    }
  }
  if (existsSync(paths.comparisonsDir)) {
    mkdirSync(paths.comparisonSnapshotDir, { recursive: true });
    for (const comparisonPath of listMarkdownFiles(paths.comparisonsDir)) {
      copyFileSync(comparisonPath, join(paths.comparisonSnapshotDir, comparisonPath.split('/').pop()));
    }
  }
}

function formatAjvErrors(errors) {
  return errors.map((error) => {
    const path = error.instancePath || '<root>';
    const message = error.message || 'failed schema validation';
    return `${path} ${message}`;
  });
}

function validateJsonSchema(schema, data) {
  const validator = new Ajv2020({ allErrors: true });
  const valid = validator.validate(schema, data);
  return valid ? [] : formatAjvErrors(validator.errors || []);
}
