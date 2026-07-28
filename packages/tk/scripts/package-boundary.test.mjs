import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { parse as parseYaml } from 'yaml';
import {
  hermesAdapterStatus,
  installHermesAdapter,
  installOpencodeAdapter,
  opencodeAdapterStatus,
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

test('canonical Skills are package-owned and Codex adapter copies stay synchronized', () => {
  const canonicalRoot = join(packageRoot, 'skills');
  const codexRoot = join(workspaceRoot, 'plugins', 'technical-knockout', 'skills');
  const canonicalSkills = skillDirectories(canonicalRoot);
  const codexSkills = skillDirectories(codexRoot);

  assert.deepEqual(codexSkills, canonicalSkills);
  assert.ok(canonicalSkills.length > 0, 'expected canonical TK Skills');
  for (const name of canonicalSkills) {
    const canonical = readFileSync(join(canonicalRoot, name, 'SKILL.md'), 'utf8');
    const codex = readFileSync(join(codexRoot, name, 'SKILL.md'), 'utf8');
    assert.equal(codex, canonical, `Codex adapter Skill drift: ${name}`);
  }
});

test('Codex plugin makes TK the default bounded technical-research route', () => {
  const skill = readWorkspaceFile('plugins/technical-knockout/skills/tk-reference-discovery/SKILL.md');
  const manifest = JSON.parse(readWorkspaceFile('plugins/technical-knockout/.codex-plugin/plugin.json'));

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
});

function adapterFixture() {
  const root = mkdtempSync(join(tmpdir(), 'tk-adapter-'));
  const skillsRoot = join(root, 'installed-skills');
  return { root, skillsRoot };
}

test('OpenCode adapter preserves JSONC config and installs canonical Skills plus MCP', () => {
  const fixture = adapterFixture();
  const configRoot = join(fixture.root, 'config');
  const configPath = join(configRoot, 'opencode', 'opencode.json');
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, '{\n  // keep user settings\n  "autoupdate": true,\n}\n');
  const options = { configRoot, skillsRoot: fixture.skillsRoot };

  const installed = installOpencodeAdapter(options);
  assert.equal(installed.ok, true);
  assert.match(readFileSync(configPath, 'utf8'), /keep user settings/);
  assert.equal(opencodeAdapterStatus(options).ok, true);
  assert.equal(skillDirectories(fixture.skillsRoot).length, 5);

  assert.equal(removeOpencodeAdapter(options).ok, true);
  const removed = readFileSync(configPath, 'utf8');
  assert.doesNotMatch(removed, /technical-knockout/);
  assert.match(removed, /autoupdate/);
});

test('Hermes adapter preserves YAML config and installs canonical Skills plus MCP', () => {
  const fixture = adapterFixture();
  const hermesHome = join(fixture.root, 'hermes');
  const configPath = join(hermesHome, 'config.yaml');
  mkdirSync(hermesHome, { recursive: true });
  writeFileSync(configPath, 'model:\n  default: existing/model\n');
  const options = { hermesHome, skillsRoot: fixture.skillsRoot };

  const installed = installHermesAdapter(options);
  assert.equal(installed.ok, true);
  assert.equal(hermesAdapterStatus(options).ok, true);
  assert.equal(skillDirectories(fixture.skillsRoot).length, 5);
  assert.equal(parseYaml(readFileSync(configPath, 'utf8')).model.default, 'existing/model');

  assert.equal(removeHermesAdapter(options).ok, true);
  const removed = parseYaml(readFileSync(configPath, 'utf8'));
  assert.equal(removed.model.default, 'existing/model');
  assert.equal(removed.mcp_servers?.['technical-knockout'], undefined);
});

test('config adapters remove cleanly when TK is not installed', () => {
  const fixture = adapterFixture();
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
  const plugin = JSON.parse(readWorkspaceFile('plugins/technical-knockout/.codex-plugin/plugin.json'));

  assert.equal(lock.packages['packages/tk'].version, packageJson.version);
  assert.equal(plugin.version, packageJson.version);
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
