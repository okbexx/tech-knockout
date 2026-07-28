import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(packageRoot, '../..');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function fail(message) {
  console.error(`release check failed: ${message}`);
  process.exitCode = 1;
}

const packageJson = readJson(resolve(packageRoot, 'package.json'));
const lock = readJson(resolve(workspaceRoot, 'package-lock.json'));
const plugin = readJson(resolve(workspaceRoot, 'plugins/technical-knockout/.codex-plugin/plugin.json'));
const marketplace = readJson(resolve(workspaceRoot, '.agents/plugins/marketplace.json'));
const expectedName = '@jarl_okbe/tk';
const expectedPlugin = 'technical-knockout';
const version = packageJson.version;
const releaseTag = process.env.RELEASE_TAG || '';

if (packageJson.name !== expectedName) fail(`expected package name ${expectedName}, got ${packageJson.name}`);
if (lock.packages?.['packages/tk']?.version !== version) {
  fail(`package-lock workspace version ${lock.packages?.['packages/tk']?.version || 'missing'} does not match ${version}`);
}
if (plugin.version !== version) fail(`Codex plugin version ${plugin.version} does not match ${version}`);
if (!marketplace.plugins?.some((entry) => entry.name === expectedPlugin)) {
  fail(`marketplace does not expose ${expectedPlugin}`);
}
if (releaseTag && releaseTag !== `v${version}`) {
  fail(`release tag ${releaseTag} does not match package version v${version}`);
}
if (!process.exitCode) console.log(`release ready ${expectedName}@${version}`);
