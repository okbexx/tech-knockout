#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(packageRoot, '../..');
const canonicalSkills = join(packageRoot, 'skills');
const adapterSkillRoots = [join(workspaceRoot, 'plugins', 'technical-knockout', 'skills')];

for (const adapterRoot of adapterSkillRoots) {
  mkdirSync(adapterRoot, { recursive: true });
  const canonicalNames = new Set(
    readdirSync(canonicalSkills, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .filter((entry) => existsSync(join(canonicalSkills, entry.name, 'SKILL.md')))
      .map((entry) => entry.name),
  );

  for (const entry of readdirSync(adapterRoot, { withFileTypes: true })) {
    if (entry.isDirectory() && !canonicalNames.has(entry.name)) {
      rmSync(join(adapterRoot, entry.name), { recursive: true, force: true });
    }
  }

  for (const name of canonicalNames) {
    const destination = join(adapterRoot, name);
    rmSync(destination, { recursive: true, force: true });
    cpSync(join(canonicalSkills, name), destination, { recursive: true });
  }
}
