#!/usr/bin/env node
import assert from 'node:assert/strict';
import Ajv2020 from 'ajv/dist/2020.js';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findProject, getRunTrace, listRuns, planReplication, verifyReplication } from '../../lib/tk-core.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
export const packageRoot = resolve(scriptDir, '..', '..');
export const repoRoot = resolve(packageRoot, '..', '..');
export const fixturesDir = join(packageRoot, 'fixtures', 'replication');

const artifactSchemaFiles = {
  plan: 'replication-plan.schema.json',
  verification: 'verification-result.schema.json',
  trace: 'run-trace.schema.json',
};
const ajv = new Ajv2020({ allErrors: true });
const artifactValidators = Object.fromEntries(
  Object.entries(artifactSchemaFiles).map(([name, fileName]) => [
    name,
    ajv.compile(JSON.parse(readFileSync(join(packageRoot, 'schemas', fileName), 'utf8'))),
  ]),
);
const requiredBriefLines = [
  '## Capability Replication Brief',
  'Capability:',
  'Current project fit:',
  'Reference projects:',
  'Evidence:',
  'TK Replication Ladder:',
  'Kernel:',
  'Must keep:',
  'Can adapt:',
  'Do not copy:',
  'Build-vs-buy:',
  'Dependency / SDK evidence:',
  'Implementation boundary:',
  'Verification:',
  'Freshness gaps:',
];

function readPersistedArtifacts(runDir) {
  return {
    plan: JSON.parse(readFileSync(join(runDir, 'plan.json'), 'utf8')),
    verification: JSON.parse(readFileSync(join(runDir, 'verification.json'), 'utf8')),
    trace: JSON.parse(readFileSync(join(runDir, 'trace.json'), 'utf8')),
    brief: readFileSync(join(runDir, 'brief.md'), 'utf8'),
  };
}

function assertSchemaValid(fixtureId, artifactName, value) {
  const validate = artifactValidators[artifactName];
  assert.ok(
    validate(value),
    `${fixtureId}: persisted ${artifactName}.json violates ${artifactSchemaFiles[artifactName]}: ${JSON.stringify(validate.errors)}`,
  );
}

function assertRequiredBriefLines(fixtureId, brief) {
  const lines = brief.split(/\r?\n/);
  for (const requiredLine of requiredBriefLines) {
    const present = requiredLine.endsWith(':')
      ? lines.some((line) => line === requiredLine || line.startsWith(`${requiredLine} `))
      : lines.includes(requiredLine);
    assert.ok(present, `${fixtureId}: persisted brief.md missing required field ${requiredLine}`);
  }
}

export function loadReplicationFixtures(dir = fixturesDir) {
  const fixtureFiles = readdirSync(dir).filter((name) => name.endsWith('.json')).sort();
  assert.ok(fixtureFiles.length > 0, 'No TK replication fixtures found.');
  return fixtureFiles.map((fileName) => {
    const path = join(dir, fileName);
    return {
      path,
      fileName,
      ...JSON.parse(readFileSync(path, 'utf8')),
    };
  });
}

function normalizeCheckStatuses(checks = []) {
  return Object.fromEntries(checks.map((check) => [check.name, check.status]));
}

function normalizeTraceSteps(trace = {}) {
  return (trace.steps || []).map((step) => ({
    type: step.type,
    status: step.status,
    artifacts: step.artifacts || [],
  }));
}

function subsetAssert(actualValues, expectedValues, messagePrefix) {
  for (const expectedValue of expectedValues || []) {
    assert.ok(actualValues.includes(expectedValue), `${messagePrefix}: missing ${expectedValue}`);
  }
}

export async function runReplicationFixture(fixture, options = {}) {
  const runtimeDataDir = options.runtimeDataDir || mkdtempSync(join(tmpdir(), 'tk-fixture-'));
  const keepRuntimeDataDir = Boolean(options.keepRuntimeDataDir || options.runtimeDataDir);
  const sourceRoot = options.sourceRoot || join(runtimeDataDir, 'source-cache');
  for (const projectId of fixture.sourceBacked || []) {
    const project = findProject(projectId, { repoRoot, packageRoot, sourceRoot });
    assert.ok(project, `${fixture.id}: unknown source-backed project ${projectId}`);
    mkdirSync(join(sourceRoot, project.sourceDir, '.git'), { recursive: true });
  }
  const runtimeOptions = {
    repoRoot,
    packageRoot,
    runtimeDataDir,
    sourceRoot,
    from: fixture.from,
    limit: fixture.limit || 5,
    ...(options.toolOptions || {}),
  };

  const startedAt = Date.now();
  let result;
  try {
    const plan = await planReplication(fixture.capability, runtimeOptions);
    const listedAfterPlan = listRuns({ ...runtimeOptions, limit: Math.max(Number(fixture.listLimit || 10), 10) });
    const verifyStartedAt = Date.now();
    const verification = await verifyReplication(plan.run.runId, runtimeOptions);
    const verifyDurationMs = Date.now() - verifyStartedAt;
    const trace = getRunTrace(plan.run.runId, runtimeOptions);
    assert.ok(trace?.dir, `${fixture.id}: persisted run directory missing`);
    const persistedArtifacts = readPersistedArtifacts(trace.dir);
    const listedRun = (listedAfterPlan.runs || []).find((run) => run.runId === plan.run.runId) || null;
    const traceSteps = normalizeTraceSteps(persistedArtifacts.trace);
    const artifactFiles = (trace?.artifacts || []).slice().sort();

    result = {
      fixture,
      runtimeDataDir,
      runtimeOptions,
      plan,
      verification,
      trace,
      persistedArtifacts,
      listedRun,
      summary: {
        fixtureId: fixture.id,
        capability: fixture.capability,
        runId: plan.run.runId,
        referenceIds: persistedArtifacts.plan.references,
        verificationContract: persistedArtifacts.plan.verificationContract,
        verifyStatus: persistedArtifacts.verification.status,
        warnings: persistedArtifacts.verification.warnings || [],
        checkNames: (persistedArtifacts.verification.checks || []).map((check) => check.name),
        checkStatuses: normalizeCheckStatuses(persistedArtifacts.verification.checks || []),
        traceResult: persistedArtifacts.trace.result || null,
        traceSteps,
        artifactFiles,
        durations: {
          planMs: plan.durationMs,
          verifyMs: verifyDurationMs,
          endToEndMs: Date.now() - startedAt,
        },
        counts: {
          references: persistedArtifacts.plan.references?.length || 0,
          kernel: persistedArtifacts.plan.kernel?.length || 0,
          mustKeep: persistedArtifacts.plan.mustKeep?.length || 0,
          canAdapt: persistedArtifacts.plan.canAdapt?.length || 0,
          risks: persistedArtifacts.plan.risks?.length || 0,
          warnings: persistedArtifacts.verification.warnings?.length || 0,
          checks: persistedArtifacts.verification.checks?.length || 0,
          artifacts: artifactFiles.length,
        },
      },
    };
    return result;
  } finally {
    if (!keepRuntimeDataDir) {
      rmSync(runtimeDataDir, { recursive: true, force: true });
    }
  }
}

export function assertReplicationFixture(fixture, result) {
  const { plan, trace, persistedArtifacts, listedRun, summary } = result;
  const expect = fixture.expect || {};

  assertSchemaValid(fixture.id, 'plan', persistedArtifacts.plan);
  assertSchemaValid(fixture.id, 'verification', persistedArtifacts.verification);
  assertSchemaValid(fixture.id, 'trace', persistedArtifacts.trace);
  assertRequiredBriefLines(fixture.id, persistedArtifacts.brief);
  assert.equal(
    persistedArtifacts.plan.verificationContract,
    persistedArtifacts.verification.contractId,
    `${fixture.id}: plan and verification contract ids are disconnected`,
  );
  assert.equal(persistedArtifacts.verification.runId, summary.runId, `${fixture.id}: verification run id mismatch`);
  assert.equal(persistedArtifacts.trace.runId, summary.runId, `${fixture.id}: trace run id mismatch`);
  assert.equal(
    persistedArtifacts.trace.input?.capability,
    persistedArtifacts.plan.capability,
    `${fixture.id}: trace capability is disconnected from plan`,
  );
  assert.deepEqual(
    persistedArtifacts.trace.input?.references,
    persistedArtifacts.plan.references,
    `${fixture.id}: trace references are disconnected from plan`,
  );

  assert.ok(summary.runId, `${fixture.id}: missing run id`);
  assert.ok(listedRun, `${fixture.id}: run missing from listRuns`);
  assert.ok(plan.plan.kernel?.length > 0, `${fixture.id}: missing kernel evidence`);
  assert.equal(trace?.plan?.verificationContract, summary.verificationContract, `${fixture.id}: stored plan missing verification contract`);
  assert.equal(trace?.verification?.status, summary.verifyStatus, `${fixture.id}: stored verification status mismatch`);
  assert.ok(summary.traceSteps.some((step) => step.type === 'verify'), `${fixture.id}: trace missing verify step`);

  if (expect.referenceIds) {
    assert.deepEqual(summary.referenceIds, expect.referenceIds, `${fixture.id}: unexpected reference ids`);
  }
  if (expect.verificationContract) {
    assert.equal(summary.verificationContract, expect.verificationContract, `${fixture.id}: unexpected verification contract`);
  }
  if (expect.verifyStatus) {
    assert.equal(summary.verifyStatus, expect.verifyStatus, `${fixture.id}: unexpected verification status`);
    assert.equal(summary.traceResult, expect.verifyStatus, `${fixture.id}: trace result mismatch`);
  }
  if (expect.checkNames) {
    subsetAssert(summary.checkNames, expect.checkNames, `${fixture.id}: missing verification check`);
  }
  if (expect.checkStatuses) {
    for (const [name, status] of Object.entries(expect.checkStatuses)) {
      assert.equal(summary.checkStatuses[name], status, `${fixture.id}: unexpected status for check ${name}`);
    }
  }
  for (const warningText of expect.warningIncludes || []) {
    assert.ok(summary.warnings.some((warning) => warning.includes(warningText)), `${fixture.id}: missing warning containing ${warningText}`);
  }
  if (expect.minCounts) {
    for (const [name, minimum] of Object.entries(expect.minCounts)) {
      assert.ok(summary.counts[name] >= minimum, `${fixture.id}: ${name} count below minimum ${minimum}`);
    }
  }
  if (expect.traceSteps) {
    assert.deepEqual(summary.traceSteps.map((step) => step.type), expect.traceSteps, `${fixture.id}: unexpected trace step order`);
  }
  if (expect.traceArtifactsByStep) {
    for (const [stepName, expectedArtifacts] of Object.entries(expect.traceArtifactsByStep)) {
      const step = summary.traceSteps.find((candidate) => candidate.type === stepName);
      assert.ok(step, `${fixture.id}: missing trace step ${stepName}`);
      subsetAssert(step.artifacts || [], expectedArtifacts, `${fixture.id}: trace step ${stepName} missing artifact`);
    }
  }
  if (expect.artifactFiles) {
    subsetAssert(summary.artifactFiles, expect.artifactFiles, `${fixture.id}: missing artifact file`);
  }

  return result;
}
