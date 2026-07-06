#!/usr/bin/env node
import { assertReplicationFixture, loadReplicationFixtures, runReplicationFixture } from './lib/replication-fixture-suite.mjs';

function metricStats(values) {
  const numbers = values.map((value) => Number(value || 0));
  const total = numbers.reduce((sum, value) => sum + value, 0);
  return {
    min: numbers.length ? Math.min(...numbers) : 0,
    max: numbers.length ? Math.max(...numbers) : 0,
    avg: numbers.length ? Number((total / numbers.length).toFixed(2)) : 0,
    total,
  };
}

function formatTable(rows) {
  return `${rows.map((row) => row.join('\t')).join('\n')}\n`;
}

const asJson = process.argv.includes('--json');
const fixtures = loadReplicationFixtures();
const records = [];

for (const fixture of fixtures) {
  const result = await runReplicationFixture(fixture);
  assertReplicationFixture(fixture, result);
  records.push({
    id: fixture.id,
    capability: fixture.capability,
    references: result.summary.referenceIds,
    verificationContract: result.summary.verificationContract,
    status: result.summary.verifyStatus,
    warnings: result.summary.warnings,
    counts: result.summary.counts,
    durations: result.summary.durations,
    traceSteps: result.summary.traceSteps,
  });
}

const summary = {
  fixtures: records.length,
  statuses: records.reduce((bucket, record) => {
    bucket[record.status] = (bucket[record.status] || 0) + 1;
    return bucket;
  }, {}),
  planMs: metricStats(records.map((record) => record.durations.planMs)),
  verifyMs: metricStats(records.map((record) => record.durations.verifyMs)),
  endToEndMs: metricStats(records.map((record) => record.durations.endToEndMs)),
  references: metricStats(records.map((record) => record.counts.references)),
  kernel: metricStats(records.map((record) => record.counts.kernel)),
  mustKeep: metricStats(records.map((record) => record.counts.mustKeep)),
  canAdapt: metricStats(records.map((record) => record.counts.canAdapt)),
  risks: metricStats(records.map((record) => record.counts.risks)),
};

const benchmark = {
  generatedAt: new Date().toISOString(),
  fixtures: records,
  summary,
};

if (asJson) {
  process.stdout.write(`${JSON.stringify(benchmark, null, 2)}\n`);
} else {
  const rows = [
    ['fixture', 'status', 'refs', 'kernel', 'mustKeep', 'canAdapt', 'risks', 'planMs', 'verifyMs', 'totalMs'],
    ...records.map((record) => [
      record.id,
      record.status,
      String(record.counts.references),
      String(record.counts.kernel),
      String(record.counts.mustKeep),
      String(record.counts.canAdapt),
      String(record.counts.risks),
      String(record.durations.planMs),
      String(record.durations.verifyMs),
      String(record.durations.endToEndMs),
    ]),
  ];
  process.stdout.write(formatTable(rows));
  process.stdout.write(
    `summary fixtures=${summary.fixtures} statuses=${JSON.stringify(summary.statuses)} plan(avg/max)=${summary.planMs.avg}/${summary.planMs.max} verify(avg/max)=${summary.verifyMs.avg}/${summary.verifyMs.max} total(avg/max)=${summary.endToEndMs.avg}/${summary.endToEndMs.max}\n`,
  );
}
