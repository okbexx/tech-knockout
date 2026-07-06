#!/usr/bin/env node
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getRunTrace, listRuns, planReplication, verifyReplication } from '../lib/tk-core.mjs';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(packageRoot, '..', '..');
const fixturesDir = join(packageRoot, 'fixtures', 'replication');
const fixtureFiles = readdirSync(fixturesDir).filter((name) => name.endsWith('.json')).sort();

assert.ok(fixtureFiles.length > 0, 'No TK replication fixtures found.');

for (const fileName of fixtureFiles) {
  const fixturePath = join(fixturesDir, fileName);
  const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
  const runtimeDataDir = mkdtempSync(join(tmpdir(), 'tk-fixture-'));
  const options = {
    repoRoot,
    packageRoot,
    runtimeDataDir,
    from: fixture.from,
    limit: fixture.limit || 5,
  };

  try {
    const plan = await planReplication(fixture.capability, options);
    assert.ok(plan.run?.runId, `${fixture.id}: missing run id`);
    assert.deepEqual(plan.plan.references, fixture.expect.referenceIds, `${fixture.id}: unexpected reference ids`);
    assert.equal(
      plan.plan.verificationContract,
      fixture.expect.verificationContract,
      `${fixture.id}: unexpected verification contract`,
    );
    assert.ok(plan.plan.kernel?.length > 0, `${fixture.id}: missing kernel evidence`);

    for (const [artifactName, artifactPath] of Object.entries(plan.run.artifacts || {})) {
      assert.ok(existsSync(artifactPath), `${fixture.id}: missing artifact ${artifactName}`);
    }

    const listedAfterPlan = listRuns({ ...options, limit: 10 });
    assert.ok(
      (listedAfterPlan.runs || []).some((run) => run.runId === plan.run.runId),
      `${fixture.id}: run missing from listRuns`,
    );

    const runTraceBeforeVerify = getRunTrace(plan.run.runId, options);
    assert.equal(
      runTraceBeforeVerify?.plan?.verificationContract,
      fixture.expect.verificationContract,
      `${fixture.id}: stored plan missing verification contract`,
    );

    const verification = await verifyReplication(plan.run.runId, options);
    assert.equal(verification.status, fixture.expect.verifyStatus, `${fixture.id}: unexpected verification status`);

    for (const checkName of fixture.expect.checkNames || []) {
      assert.ok(
        verification.checks.some((check) => check.name === checkName),
        `${fixture.id}: missing verification check ${checkName}`,
      );
    }

    for (const warningText of fixture.expect.warningIncludes || []) {
      assert.ok(
        verification.warnings.some((warning) => warning.includes(warningText)),
        `${fixture.id}: missing warning containing ${warningText}`,
      );
    }

    const runTraceAfterVerify = getRunTrace(plan.run.runId, options);
    assert.equal(
      runTraceAfterVerify?.verification?.status,
      fixture.expect.verifyStatus,
      `${fixture.id}: stored verification status mismatch`,
    );
    assert.ok(
      (runTraceAfterVerify?.trace?.steps || []).some((step) => step.type === 'verify'),
      `${fixture.id}: trace missing verify step`,
    );

    console.log(`ok fixture ${fixture.id} run=${plan.run.runId}`);
  } finally {
    rmSync(runtimeDataDir, { recursive: true, force: true });
  }
}

console.log(`ok fixtures=${fixtureFiles.length}`);
