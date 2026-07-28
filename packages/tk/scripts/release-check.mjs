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
const codexPlugin = readJson(resolve(workspaceRoot, 'plugins/technical-knockout/.codex-plugin/plugin.json'));
const codexMarketplace = readJson(resolve(workspaceRoot, '.agents/plugins/marketplace.json'));
const claudePlugin = readJson(resolve(workspaceRoot, 'plugins/technical-knockout/.claude-plugin/plugin.json'));
const claudeMarketplace = readJson(resolve(workspaceRoot, '.claude-plugin/marketplace.json'));
const expectedName = '@jarl_okbe/tk';
const expectedPlugin = 'technical-knockout';
const version = packageJson.version;
const releaseTag = process.env.RELEASE_TAG || '';

if (packageJson.name !== expectedName) fail(`expected package name ${expectedName}, got ${packageJson.name}`);
if (lock.packages?.['packages/tk']?.version !== version) {
  fail(`package-lock workspace version ${lock.packages?.['packages/tk']?.version || 'missing'} does not match ${version}`);
}
if (codexPlugin.version !== version) fail(`Codex plugin version ${codexPlugin.version} does not match ${version}`);
if (claudePlugin.version !== version) fail(`Claude Code plugin version ${claudePlugin.version} does not match ${version}`);
if (!codexMarketplace.plugins?.some((entry) => entry.name === expectedPlugin)) {
  fail(`Codex marketplace does not expose ${expectedPlugin}`);
}
const claudeMarketplaceEntry = claudeMarketplace.plugins?.find((entry) => entry.name === expectedPlugin);
if (!claudeMarketplaceEntry) fail(`Claude Code marketplace does not expose ${expectedPlugin}`);
if (claudeMarketplaceEntry?.version !== version) {
  fail(`Claude Code marketplace plugin version ${claudeMarketplaceEntry?.version || 'missing'} does not match ${version}`);
}
if (releaseTag && releaseTag !== `v${version}`) {
  fail(`release tag ${releaseTag} does not match package version v${version}`);
}
if (!process.exitCode) console.log(`release ready ${expectedName}@${version}`);
