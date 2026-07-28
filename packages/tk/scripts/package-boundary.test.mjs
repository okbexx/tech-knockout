import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { parse as parseYaml } from 'yaml';
import {
  codexPluginStatus,
  hermesAdapterStatus,
  installCodexPlugin,
  installClaudePlugin,
  installHermesAdapter,
  installOpencodeAdapter,
  opencodeAdapterStatus,
  refreshClaudePlugin,
  removeClaudePlugin,
  removeHermesAdapter,
  removeOpencodeAdapter,
} from '../lib/tk-core.mjs';

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
function readWorkspaceFile(relativePath) {
  return readFileSync(join(workspaceRoot, relativePath), 'utf8');
}

function skillDirectories(root) {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => {
      try {
        readFileSync(join(root, entry.name, 'SKILL.md'), 'utf8');
        return true;
      } catch {
        return false;
      }
    })
    .map((entry) => entry.name)
    .sort();
}

test('canonical Skills are package-owned and native plugin copies stay synchronized', () => {
  const canonicalRoot = join(packageRoot, 'skills');
  const pluginRoot = join(workspaceRoot, 'plugins', 'technical-knockout', 'skills');
  const canonicalSkills = skillDirectories(canonicalRoot);
  const pluginSkills = skillDirectories(pluginRoot);

  assert.deepEqual(pluginSkills, canonicalSkills);
  assert.ok(canonicalSkills.length > 0, 'expected canonical TK Skills');
  for (const name of canonicalSkills) {
    const canonical = readFileSync(join(canonicalRoot, name, 'SKILL.md'), 'utf8');
    const plugin = readFileSync(join(pluginRoot, name, 'SKILL.md'), 'utf8');
    assert.equal(plugin, canonical, `native plugin Skill drift: ${name}`);
  }
});

test('Claude plugin marketplace reuses plugin-local Skills and the published MCP server', () => {
  const marketplace = JSON.parse(readWorkspaceFile('.claude-plugin/marketplace.json'));
  const manifest = JSON.parse(readWorkspaceFile('plugins/technical-knockout/.claude-plugin/plugin.json'));
  const mcp = JSON.parse(readWorkspaceFile('plugins/technical-knockout/.mcp.json'));
  const entry = marketplace.plugins.find((plugin) => plugin.name === 'technical-knockout');

  assert.equal(marketplace.name, 'tech-knockout');
  assert.equal(entry.source, './plugins/technical-knockout');
  assert.equal(manifest.name, 'technical-knockout');
  assert.deepEqual(mcp.mcpServers['technical-knockout'], {
    command: 'npx',
    args: ['--yes', '--package', '@jarl_okbe/tk', 'tk-mcp-server'],
  });
});

test('Codex plugin makes TK the default bounded technical-research route', () => {
  const skill = readWorkspaceFile('plugins/technical-knockout/skills/tk-reference-discovery/SKILL.md');
  const manifest = JSON.parse(readWorkspaceFile('plugins/technical-knockout/.codex-plugin/plugin.json'));
  const mcp = JSON.parse(readWorkspaceFile('plugins/technical-knockout/.mcp.json'));

  for (const trigger of ['technical research', 'architecture design', 'library/framework/tool selection', 'build-vs-buy']) {
    assert.match(skill, new RegExp(trigger.replace(/[/-]/g, '\\$&'), 'i'), `missing default research trigger: ${trigger}`);
  }
  assert.match(skill, /curated research source/i);
  assert.match(skill, /even when the user does not mention TK/i);
  assert.match(skill, /maintainer-approved candidate set/i);
  assert.match(skill, /No curated TK coverage/i);
  assert.match(skill, /Do not search for,\s+introduce, or recommend projects outside TK/i);
  assert.match(skill, /Discovery alone should not\s+create a replication run/i);
  assert.doesNotMatch(skill, /continue with primary external sources/i);
  assert.match(manifest.description, /maintainer-curated set/i);
  assert.match(manifest.interface.defaultPrompt, /curated TK project set/i);
  assert.equal(manifest.mcpServers, './.mcp.json');
  assert.deepEqual(mcp.mcpServers['technical-knockout'], {
    command: 'npx',
    args: ['--yes', '--package', '@jarl_okbe/tk', 'tk-mcp-server'],
  });
});

function adapterFixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'tk-adapter-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const skillsRoot = join(root, 'installed-skills');
  return { root, skillsRoot };
}

test('Codex adapter dry run and isolated status expose install state', async (t) => {
  const installed = await installCodexPlugin({ dryRun: true, ref: 'v0.1.7' });
  assert.deepEqual(installed.commands, [
    ['codex', 'plugin', 'marketplace', 'add', 'okbexx/tech-knockout', '--ref', 'v0.1.7'],
    ['codex', 'plugin', 'add', 'technical-knockout@tech-knockout'],
    ['codex', 'plugin', 'list', '--marketplace', 'tech-knockout'],
  ]);

  const fixture = adapterFixture(t);
  const fakeBin = join(fixture.root, 'bin');
  const codexPath = join(fakeBin, 'codex');
  mkdirSync(fakeBin, { recursive: true });
  writeFileSync(
    codexPath,
    `#!/usr/bin/env node
const args = process.argv.slice(2).join(' ');
if (args === 'plugin marketplace list') {
  console.log('tech-knockout okbexx/tech-knockout');
} else if (args === 'plugin list --marketplace tech-knockout') {
  console.log('technical-knockout@tech-knockout installed');
} else {
  process.exitCode = 2;
}
`,
  );
  chmodSync(codexPath, 0o755);
  const priorPath = process.env.PATH;
  process.env.PATH = `${fakeBin}${delimiter}${priorPath || ''}`;
  try {
    const status = await codexPluginStatus({ cwd: fixture.root });
    assert.equal(status.ok, true);
    assert.deepEqual(
      status.checks.map(({ name, ok }) => ({ name, ok })),
      [
        { name: 'codex_cli', ok: true },
        { name: 'marketplace_configured', ok: true },
        { name: 'plugin_installed', ok: true },
      ],
    );
    assert.equal(status.selector, 'technical-knockout@tech-knockout');
  } finally {
    process.env.PATH = priorPath;
  }
});

test('Claude adapter dry runs expose the native lifecycle without changing host state', async () => {
  const options = { dryRun: true, scope: 'local' };
  const installed = await installClaudePlugin(options);
  const refreshed = await refreshClaudePlugin(options);
  const removed = await removeClaudePlugin(options);

  assert.deepEqual(installed.commands, [
    ['claude', 'plugin', 'marketplace', 'list', '--json'],
    ['claude', 'plugin', 'marketplace', 'add', 'okbexx/tech-knockout', '--scope', 'local'],
    ['claude', 'plugin', 'marketplace', 'list', '--json'],
    ['claude', 'plugin', 'list', '--json'],
    ['claude', 'plugin', 'install', 'technical-knockout@tech-knockout', '--scope', 'local'],
  ]);
  assert.deepEqual(refreshed.commands, [
    ['claude', 'plugin', 'marketplace', 'update', 'tech-knockout'],
    ['claude', 'plugin', 'update', 'technical-knockout@tech-knockout', '--scope', 'local'],
  ]);
  assert.deepEqual(removed.commands, [
    ['claude', 'plugin', 'uninstall', 'technical-knockout@tech-knockout', '--scope', 'local'],
  ]);
});

test('Claude CLI rejects unsupported plugin scopes before execution', async () => {
  await assert.rejects(
    execFileAsync(process.execPath, [join(packageRoot, 'bin', 'tk.mjs'), 'claude', 'install', '--scope', 'invalid', '--dry-run']),
    (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /Allowed choices are user, project, local/);
      return true;
    },
  );
});

test('Claude status rejects wrong marketplace sources and missing scoped declarations', async (t) => {
  const fixture = adapterFixture(t);
  const fakeBin = join(fixture.root, 'bin');
  const expectedSource = join(fixture.root, 'expected-marketplace');
  const wrongSource = join(fixture.root, 'wrong-marketplace');
  const settingsPath = join(fixture.root, '.claude', 'settings.local.json');
  const claudePath = join(fakeBin, 'claude');
  mkdirSync(fakeBin, { recursive: true });
  mkdirSync(dirname(settingsPath), { recursive: true });
  writeFileSync(
    claudePath,
    `#!/usr/bin/env node
const args = process.argv.slice(2).join(' ');
if (args === 'plugin marketplace list --json') {
  console.log(JSON.stringify([{ name: 'tech-knockout', source: 'directory', path: process.env.FAKE_MARKETPLACE_SOURCE }]));
} else if (args === 'plugin list --json') {
  console.log(JSON.stringify([{ id: 'technical-knockout@tech-knockout', scope: 'local', enabled: true }]));
} else {
  process.exitCode = 2;
}
`,
  );
  chmodSync(claudePath, 0o755);
  const command = [
    join(packageRoot, 'bin', 'tk.mjs'),
    'claude',
    'status',
    '--source',
    expectedSource,
    '--scope',
    'local',
    '--json',
  ];
  const baseEnv = { ...process.env, PATH: `${fakeBin}${delimiter}${process.env.PATH || ''}` };

  writeFileSync(settingsPath, JSON.stringify({
    extraKnownMarketplaces: {
      'tech-knockout': { source: { source: 'directory', path: wrongSource } },
    },
  }));
  await assert.rejects(
    execFileAsync(process.execPath, command, {
      cwd: fixture.root,
      env: { ...baseEnv, FAKE_MARKETPLACE_SOURCE: wrongSource },
    }),
    (error) => {
      const result = JSON.parse(error.stdout);
      assert.equal(result.checks.find((check) => check.name === 'marketplace_source').ok, false);
      assert.equal(result.checks.find((check) => check.name === 'marketplace_scope').ok, false);
      return true;
    },
  );

  writeFileSync(settingsPath, JSON.stringify({ enabledPlugins: {} }));
  await assert.rejects(
    execFileAsync(process.execPath, command, {
      cwd: fixture.root,
      env: { ...baseEnv, FAKE_MARKETPLACE_SOURCE: expectedSource },
    }),
    (error) => {
      const result = JSON.parse(error.stdout);
      assert.equal(result.checks.find((check) => check.name === 'marketplace_source').ok, true);
      assert.equal(result.checks.find((check) => check.name === 'marketplace_scope').ok, false);
      return true;
    },
  );
});

test('Claude status respects CLAUDE_CONFIG_DIR and pinned GitHub sources', async (t) => {
  const fixture = adapterFixture(t);
  const fakeBin = join(fixture.root, 'bin');
  const configRoot = join(fixture.root, 'claude-profile');
  const claudePath = join(fakeBin, 'claude');
  mkdirSync(fakeBin, { recursive: true });
  mkdirSync(configRoot, { recursive: true });
  writeFileSync(
    join(configRoot, 'settings.json'),
    JSON.stringify({
      extraKnownMarketplaces: {
        'tech-knockout': {
          source: { source: 'github', repo: 'okbexx/tech-knockout', ref: 'v0.1.7' },
        },
      },
    }),
  );
  writeFileSync(
    claudePath,
    `#!/usr/bin/env node
const args = process.argv.slice(2).join(' ');
if (args === 'plugin marketplace list --json') {
  console.log(JSON.stringify([{ name: 'tech-knockout', source: 'github', repo: 'okbexx/tech-knockout', ref: 'v0.1.7' }]));
} else if (args === 'plugin list --json') {
  console.log(JSON.stringify([{ id: 'technical-knockout@tech-knockout', scope: 'user', enabled: true }]));
} else {
  process.exitCode = 2;
}
`,
  );
  chmodSync(claudePath, 0o755);
  const { stdout } = await execFileAsync(
    process.execPath,
    [
      join(packageRoot, 'bin', 'tk.mjs'),
      'claude',
      'status',
      '--source',
      'okbexx/tech-knockout@v0.1.7',
      '--scope',
      'user',
      '--json',
    ],
    {
      cwd: fixture.root,
      env: {
        ...process.env,
        CLAUDE_CONFIG_DIR: configRoot,
        PATH: `${fakeBin}${delimiter}${process.env.PATH || ''}`,
      },
    },
  );
  const result = JSON.parse(stdout);
  assert.equal(result.ok, true);
  assert.equal(result.checks.find((check) => check.name === 'marketplace_source').ok, true);
  assert.equal(result.checks.find((check) => check.name === 'marketplace_scope').details[0], `user: ${join(configRoot, 'settings.json')}`);
  assert.ok(result.checks.every((check) => check.ok), 'Claude status contains a failing check');
  assert.equal(result.checks.find((check) => check.name === 'plugin_installed')?.ok, true);
  assert.equal(result.checks.find((check) => check.name === 'plugin_enabled')?.ok, true);
});

test('Claude status does not confuse directory sources with GitHub shorthand', async (t) => {
  const fixture = adapterFixture(t);
  const fakeBin = join(fixture.root, 'bin');
  const configRoot = join(fixture.root, 'claude-profile');
  const claudePath = join(fakeBin, 'claude');
  mkdirSync(fakeBin, { recursive: true });
  mkdirSync(configRoot, { recursive: true });
  writeFileSync(
    join(configRoot, 'settings.json'),
    JSON.stringify({
      extraKnownMarketplaces: {
        'tech-knockout': { source: { source: 'directory', path: 'okbexx/tech-knockout' } },
      },
    }),
  );
  writeFileSync(
    claudePath,
    `#!/usr/bin/env node
const args = process.argv.slice(2).join(' ');
if (args === 'plugin marketplace list --json') {
  console.log(JSON.stringify([{ name: 'tech-knockout', source: 'github', repo: 'okbexx/tech-knockout' }]));
} else if (args === 'plugin list --json') {
  console.log(JSON.stringify([{ id: 'technical-knockout@tech-knockout', scope: 'user', enabled: true }]));
} else {
  process.exitCode = 2;
}
`,
  );
  chmodSync(claudePath, 0o755);
  await assert.rejects(
    execFileAsync(
      process.execPath,
      [join(packageRoot, 'bin', 'tk.mjs'), 'claude', 'status', '--scope', 'user', '--json'],
      {
        cwd: fixture.root,
        env: {
          ...process.env,
          CLAUDE_CONFIG_DIR: configRoot,
          PATH: `${fakeBin}${delimiter}${process.env.PATH || ''}`,
        },
      },
    ),
    (error) => {
      const result = JSON.parse(error.stdout);
      assert.equal(result.checks.find((check) => check.name === 'marketplace_source').ok, true);
      assert.equal(result.checks.find((check) => check.name === 'marketplace_scope').ok, false);
      return true;
    },
  );
});

test('OpenCode adapter preserves JSONC config and installs canonical Skills plus MCP', (t) => {
  const fixture = adapterFixture(t);
  const configRoot = join(fixture.root, 'config');
  const configPath = join(configRoot, 'opencode', 'opencode.json');
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, '{\n  // keep user settings\n  "autoupdate": true,\n}\n');
  const options = { configRoot, skillsRoot: fixture.skillsRoot };

  const installed = installOpencodeAdapter(options);
  assert.equal(installed.ok, true);
  assert.match(readFileSync(configPath, 'utf8'), /keep user settings/);
  const status = opencodeAdapterStatus(options);
  assert.equal(status.ok, true);
  assert.ok(status.checks.every((check) => check.ok), 'OpenCode status contains a failing check');
  assert.equal(status.checks.find((check) => check.name === 'mcp_configured')?.ok, true);
  assert.equal(skillDirectories(fixture.skillsRoot).length, 5);

  assert.equal(removeOpencodeAdapter(options).ok, true);
  const removed = readFileSync(configPath, 'utf8');
  assert.doesNotMatch(removed, /technical-knockout/);
  assert.match(removed, /autoupdate/);
});

test('Hermes adapter preserves YAML config and installs canonical Skills plus MCP', (t) => {
  const fixture = adapterFixture(t);
  const hermesHome = join(fixture.root, 'hermes');
  const configPath = join(hermesHome, 'config.yaml');
  mkdirSync(hermesHome, { recursive: true });
  writeFileSync(configPath, 'model:\n  default: existing/model\n');
  const options = { hermesHome, skillsRoot: fixture.skillsRoot };

  const installed = installHermesAdapter(options);
  assert.equal(installed.ok, true);
  const status = hermesAdapterStatus(options);
  assert.equal(status.ok, true);
  assert.ok(status.checks.every((check) => check.ok), 'Hermes status contains a failing check');
  assert.equal(status.checks.find((check) => check.name === 'mcp_configured')?.ok, true);
  assert.equal(skillDirectories(fixture.skillsRoot).length, 5);
  assert.equal(parseYaml(readFileSync(configPath, 'utf8')).model.default, 'existing/model');

  assert.equal(removeHermesAdapter(options).ok, true);
  const removed = parseYaml(readFileSync(configPath, 'utf8'));
  assert.equal(removed.model.default, 'existing/model');
  assert.equal(removed.mcp_servers?.['technical-knockout'], undefined);
});

test('config adapters remove cleanly when TK is not installed', (t) => {
  const fixture = adapterFixture(t);
  const options = {
    configRoot: join(fixture.root, 'config'),
    hermesHome: join(fixture.root, 'hermes'),
    skillsRoot: fixture.skillsRoot,
  };

  assert.equal(removeOpencodeAdapter(options).ok, true);
  assert.equal(removeHermesAdapter(options).ok, true);
});

test('release metadata versions stay synchronized', () => {
  const packageJson = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
  const lock = JSON.parse(readWorkspaceFile('package-lock.json'));
  const codexPlugin = JSON.parse(readWorkspaceFile('plugins/technical-knockout/.codex-plugin/plugin.json'));
  const claudePlugin = JSON.parse(readWorkspaceFile('plugins/technical-knockout/.claude-plugin/plugin.json'));
  const claudeMarketplace = JSON.parse(readWorkspaceFile('.claude-plugin/marketplace.json'));
  const marketplaceEntry = claudeMarketplace.plugins.find((plugin) => plugin.name === 'technical-knockout');

  assert.equal(lock.packages['packages/tk'].version, packageJson.version);
  assert.equal(codexPlugin.version, packageJson.version);
  assert.equal(claudePlugin.version, packageJson.version);
  assert.equal(marketplaceEntry.version, packageJson.version);
});

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
  const requiredSkillFiles = skillDirectories(join(packageRoot, 'skills')).map((name) => `skills/${name}/SKILL.md`);
  assert.ok(requiredDataFiles.some((file) => file.startsWith('data/reports/')), 'expected packaged reports');
  assert.ok(
    requiredDataFiles.some((file) => file.startsWith('data/comparisons/')),
    'expected packaged comparisons',
  );

  assert.equal(requiredSkillFiles.length, 5, 'expected five packaged canonical Skills');
  const pack = await dryRunPack();
  const packageFiles = new Set(pack.files.map((file) => file.path));
  const allowedDataFiles = new Set(requiredDataFiles);
  const missingRequiredFiles = [...requiredDataFiles, ...requiredSkillFiles].filter((file) => !packageFiles.has(file));
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
