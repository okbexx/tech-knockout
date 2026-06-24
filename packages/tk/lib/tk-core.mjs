import { execFile } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import Ajv2020 from 'ajv/dist/2020.js';
import envPaths from 'env-paths';

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
    schemaVersion: 1,
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
