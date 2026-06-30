import { execFile } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import Ajv2020 from 'ajv/dist/2020.js';
import envPaths from 'env-paths';
import { parse as parseToml } from 'smol-toml';

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

function buildTags(project) {
  const text = [
    project.id,
    project.name,
    project.category,
    project.language,
    project.summary,
    project.repo,
    ...(project.dependencies || []).map((dependency) => dependency.name),
    ...(project.dependencyEvidence || []).flatMap((dependency) => [
      dependency.dependency,
      dependency.type,
      dependency.usedFor,
      dependency.problemSolved,
    ]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const candidates = [
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
    'tauri',
    'rust',
    'typescript',
    'python',
    'go',
  ];
  return candidates.filter((tag) => text.includes(tag));
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
  }
  return { ok: errors.length === 0, errors };
}

export function validateSourceLock(lock, options = {}) {
  const paths = getPaths(options);
  const schema = JSON.parse(readText(join(paths.packageRoot, 'schemas', 'source-lock.schema.json')));
  const errors = validateJsonSchema(schema, lock);
  return { ok: errors.length === 0, errors };
}

export function searchCatalog(query, options = {}) {
  const catalog = loadCatalog(options);
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const scored = catalog.projects
    .map((project) => {
      const haystack = [
        project.id,
        project.name,
        project.repo,
        project.category,
        project.summary,
        project.adoption,
        ...(project.dependencies || []).map((dependency) => `${dependency.name} ${dependency.ecosystem}`),
        ...(project.dependencyEvidence || []).flatMap((dependency) => [
          dependency.dependency,
          dependency.usedFor,
          dependency.problemSolved,
          dependency.reuseSignal,
        ]),
        ...(project.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return { project, score };
    })
    .filter((item) => item.score > 0 || terms.length === 0)
    .sort((a, b) => b.score - a.score || a.project.id.localeCompare(b.project.id));
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

export async function buildReplicationBrief(capability, options = {}) {
  const projects = resolveReferenceProjects(capability, options);
  const references = [];

  for (const project of projects) {
    const report = readReport(project, options);
    const context = await projectContext(project.id, options);
    references.push({
      project,
      sections: extractReplicationSections(report),
      source: context?.source || {
        sourceDir: project.sourceDir,
        path: null,
        exists: false,
      },
      dependencySummary: project.dependencySummary,
      dependencyEvidence: project.dependencyEvidence,
      dependencies: project.dependencies,
    });
  }

  return {
    capability,
    generatedAt: new Date().toISOString(),
    references,
    brief: {
      capability,
      referenceProjects: references.map((item) => item.project.id),
      ladder: [
        'Skip the capability if the current project does not actually need it.',
        'Reuse current-project code, contracts, and installed dependencies before copying a reference.',
        'Prefer standard library, native platform features, official SDKs, and mature OSS over new TK-owned infrastructure.',
        'Use TK evidence only to extract the smallest capability kernel and invariants.',
        'Implement the smallest verifiable boundary; add a bigger base only after evidence proves the smaller rung fails.',
      ],
      currentProjectFit: 'Not evaluated here. The agent must inspect the current project before choosing what to reuse.',
      kernel: 'Extract the smallest capability kernel from the referenced sections, then adapt it to the current project.',
      mustKeep: [
        'Architecture invariants that make the capability work.',
        'Contract boundaries that agents, users, or external tools depend on.',
        'Failure and degradation behavior that protects users and state.',
      ],
      canAdapt: [
        'UI, framework, package layout, and host-specific adapters.',
        'Backend implementations when the capability contract stays stable.',
      ],
      doNotCopy: [
        'Project branding, private paths, credentials, or unrelated process ceremony.',
        'Source code without checking license and current-project fit.',
      ],
      buildVsBuy: 'Use current-project dependencies, standard libraries, official SDKs, and mature OSS before self-building infrastructure.',
      implementationBoundary: 'Implement only the smallest current-project slice that proves the replicated capability.',
      verification: [
        'A user-visible success path.',
        'One deterministic CLI/test/smoke check for the replicated contract.',
        'Freshness note for any time-sensitive upstream facts.',
      ],
    },
  };
}

export function formatReplicationBrief(payload) {
  const lines = [
    `# TK Reference Brief: ${payload.capability}`,
    '',
    'Use this brief with the current project before implementation. It is reference evidence, not a decision by itself.',
    '',
    'Next:',
    '1. Check whether the current project needs this capability.',
    '2. Reuse current-project code, platform features, installed dependencies, official SDKs, or mature OSS first.',
    '3. Ask the agent to turn this reference brief into a current-project implementation boundary.',
    '',
    '## Reference Projects',
  ];

  if (!payload.references.length) {
    lines.push('No TK reference projects matched. Try `tk search <capability>` or pass `--from <project>`.');
    return `${lines.join('\n')}\n`;
  }

  for (const reference of payload.references) {
    const { project, source } = reference;
    lines.push(`- ${project.id}: ${project.name}`);
    if (project.summary) lines.push(`  summary: ${project.summary}`);
    if (project.adoption) lines.push(`  adoption: ${project.adoption}`);
    lines.push(`  report: ${project.report}`);
    lines.push(`  source: ${source.exists ? 'available' : 'missing'}`);
    if (reference.dependencySummary) {
      lines.push(
        `  dependencies: ${reference.dependencySummary.total} direct across ${reference.dependencySummary.manifests} manifests`,
      );
    }
  }

  lines.push('', '## Dependency Evidence');
  for (const reference of payload.references) {
    lines.push('', `### ${reference.project.id}`);
    const evidence = reference.dependencyEvidence || [];
    if (!evidence.length) {
      lines.push('No curated dependency evidence rows yet. Use `tk deps <project> --json` for the direct dependency list.');
      continue;
    }
    for (const item of evidence.slice(0, 8)) {
      lines.push(`- ${item.dependency}: ${item.usedFor || item.problemSolved || item.reuseSignal}`);
      if (item.reuseSignal) lines.push(`  reuse: ${item.reuseSignal}`);
      if (item.caution) lines.push(`  caution: ${item.caution}`);
    }
  }

  lines.push('', '## Evidence Pack');
  const evidenceOrder = [
    'kernel',
    'abstractions',
    'controlDataPlane',
    'executionFlows',
    'stateModel',
    'contracts',
    'failureModel',
    'invariants',
  ];
  for (const reference of payload.references) {
    lines.push('', `### ${reference.project.id}`);
    for (const name of evidenceOrder) {
      const section = reference.sections[name];
      if (!section) continue;
      lines.push('', `#### ${name}: ${section.title}`, section.text);
    }
  }

  lines.push('', '## Replication Contract');
  lines.push(`Capability: ${payload.brief.capability}`);
  lines.push(`Reference projects: ${payload.brief.referenceProjects.join(', ')}`);
  lines.push('', 'TK Replication Ladder:');
  for (const item of payload.brief.ladder) lines.push(`- ${item}`);
  lines.push(`Current project fit: ${payload.brief.currentProjectFit}`);
  lines.push(`Kernel: ${payload.brief.kernel}`);
  lines.push(`Build-vs-buy: ${payload.brief.buildVsBuy}`);
  lines.push(`Implementation boundary: ${payload.brief.implementationBoundary}`);
  lines.push(
    'Source files: use `tk source path <project> --json` when implementation details require local file evidence.',
  );
  lines.push('', 'Must keep:');
  for (const item of payload.brief.mustKeep) lines.push(`- ${item}`);
  lines.push('', 'Can adapt:');
  for (const item of payload.brief.canAdapt) lines.push(`- ${item}`);
  lines.push('', 'Do not copy:');
  for (const item of payload.brief.doNotCopy) lines.push(`- ${item}`);
  lines.push('', 'Verification:');
  for (const item of payload.brief.verification) lines.push(`- ${item}`);

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
        ['codex', ...removeCommand],
        ['codex', ...addCommand],
      ],
    };
  }

  const remove = await runCodex(removeCommand);
  const add = await runCodex(addCommand);
  const steps = [
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

export async function doctor(options = {}) {
  const paths = getPaths(options);
  const catalog = loadCatalog(options);
  const validation = validateCatalog(catalog, options);
  const status = await sourceStatus(options);
  const missingSources = status.sources.filter((source) => !source.exists);
  const dirtySources = status.sources.filter((source) => source.dirty);
  const reportsAvailable = existsSync(paths.reportsDir) || existsSync(paths.reportSnapshotDir);
  const comparisonsAvailable = existsSync(paths.comparisonsDir) || existsSync(paths.comparisonSnapshotDir);
  const sourcesRequired = Boolean(options.requireSources);
  const checks = [
    { name: 'reports_available', ok: reportsAvailable },
    { name: 'comparisons_available', ok: comparisonsAvailable },
    { name: 'catalog_valid', ok: validation.ok, details: validation.errors },
    {
      name: sourcesRequired ? 'sources_present' : 'sources_known',
      ok: sourcesRequired ? missingSources.length === 0 : true,
      details: missingSources.map((s) => s.id),
    },
    { name: 'sources_clean', ok: dirtySources.length === 0, details: dirtySources.map((s) => s.id) },
  ];
  return {
    ok: checks.every((check) => check.ok),
    generatedAt: new Date().toISOString(),
    checks,
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
