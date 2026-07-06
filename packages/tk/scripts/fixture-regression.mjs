#!/usr/bin/env node
import { assertReplicationFixture, loadReplicationFixtures, runReplicationFixture } from './lib/replication-fixture-suite.mjs';

const fixtures = loadReplicationFixtures();

for (const fixture of fixtures) {
  const result = await runReplicationFixture(fixture);
  assertReplicationFixture(fixture, result);
  process.stdout.write(`ok fixture ${fixture.id} run=${result.summary.runId}\n`);
}

process.stdout.write(`ok fixtures=${fixtures.length}\n`);
