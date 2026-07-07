#!/usr/bin/env node
import { Command } from 'commander';
import packageJson from '../package.json' with { type: 'json' };
import {
  buildCatalog,
  buildReplicationBrief,
  codexPluginStatus,
  doctor,
  executeSyncPlan,
  findProject,
  formatCodexInstall,
  formatCodexRefresh,
  formatCodexStatus,
  formatReplicationBrief,
  formatReplicationPlan,
  formatRunList,
  formatRunTrace,
  formatTable,
  formatVerificationResult,
  getRunTrace,
  installCodexPlugin,
  listRuns,
  loadCatalog,
  planReplication,
  projectContext,
  readComparison,
  readReport,
  refreshCodexPlugin,
  searchCatalog,
  sourceStatus,
  syncPlan,
  validateCatalog,
  validateSourceLock,
  verifyReplication,
  writeCatalog,
  writeLock,
} from '../lib/tk-core.mjs';
import {
  auditReportStructure,
  formatReportStructureAudit,
  formatReportStructureLint,
  lintReportStructure,
  normalizeReportHeadings,
  writeReportStructureAudit,
} from '../lib/report-structure.mjs';

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function output(value, options, textFormatter) {
  if (options.json) printJson(value);
  else process.stdout.write(textFormatter(value));
}

const program = new Command();

program
  .name('tk')
  .description('Technical Knockout CLI for capability replication, catalog, source cache, doctor, and agent context operations.')
  .version(packageJson.version);

program
  .command('doctor')
  .description('Run TK doctor checks for repo assets and runtime/source-cache health.')
  .argument('[scope]', 'all | repo | runtime', 'all')
  .option('--json', 'emit machine-readable JSON')
  .option('--require-sources', 'fail when catalog source caches are missing')
  .action(async (scope, options) => {
    const normalizedScope = String(scope || 'all').toLowerCase();
    if (!['all', 'repo', 'runtime'].includes(normalizedScope)) {
      program.error(`Invalid doctor scope: ${scope}. Use all, repo, or runtime.`, { exitCode: 2 });
    }
    const result = await doctor({ ...options, scope: normalizedScope });
    output(result, options, (payload) =>
      payload.checks
        .map((check) => {
          const suffix = check.details?.length ? `: ${check.details.join(', ')}` : '';
          return `${check.ok ? 'ok' : 'fail'} ${check.name}${suffix}`;
        })
        .join('\n') + '\n',
    );
    process.exitCode = result.ok ? 0 : 1;
  });

const catalog = program.command('catalog').description('Build and validate the TK structured catalog.');

catalog
  .command('build')
  .description('Build data/tk.catalog.json from reports, comparisons, and README index metadata.')
  .option('--json', 'emit machine-readable JSON')
  .action((options) => {
    const catalogData = buildCatalog();
    const path = writeCatalog(catalogData);
    const result = {
      path,
      projects: catalogData.projects.length,
      comparisons: catalogData.comparisons.length,
    };
    output(result, options, (payload) =>
      `wrote ${payload.path}\nprojects: ${payload.projects}\ncomparisons: ${payload.comparisons}\n`,
    );
  });

catalog
  .command('validate')
  .description('Validate the current generated catalog.')
  .option('--json', 'emit machine-readable JSON')
  .action((options) => {
    const result = validateCatalog(loadCatalog());
    output(result, options, (payload) =>
      payload.ok ? 'catalog valid\n' : `catalog invalid\n${payload.errors.join('\n')}\n`,
    );
    process.exitCode = result.ok ? 0 : 1;
  });

program
  .command('search')
  .description('Search TK project catalog metadata.')
  .argument('<query...>', 'keyword or natural-language query')
  .option('--json', 'emit machine-readable JSON')
  .action((queryParts, options) => {
    const query = queryParts.join(' ');
    const results = searchCatalog(query);
    output({ query, results }, options, (payload) => `${formatTable(payload.results)}\n`);
  });

program
  .command('inspect')
  .description('Inspect one TK project by id, report file, display name, or owner/repo.')
  .argument('<project>', 'project id, report file, display name, or owner/repo')
  .option('--json', 'emit machine-readable JSON')
  .option('--report', 'print the report Markdown instead of catalog metadata')
  .action((projectId, options) => {
    const project = findProject(projectId);
    if (!project) {
      program.error(`Project not found: ${projectId}`, { exitCode: 2 });
    }
    if (options.report) {
      process.stdout.write(readReport(project));
      return;
    }
    output(project, options, (payload) => `${formatTable([payload])}\n`);
  });

program
  .command('compare')
  .description('Print a TK comparison document by id.')
  .argument('<comparison-id>', 'comparison id without .md extension')
  .option('--json', 'emit machine-readable JSON')
  .action((id, options) => {
    const text = readComparison(id);
    if (!text) {
      program.error(`Comparison not found: ${id}`, { exitCode: 2 });
    }
    output({ id, text }, options, (payload) => payload.text);
  });

program
  .command('deps')
  .description('Inspect direct dependency and SDK evidence for one TK project.')
  .argument('<project>', 'project id, report file, display name, or owner/repo')
  .option('--json', 'emit machine-readable JSON')
  .action((projectId, options) => {
    const project = findProject(projectId);
    if (!project) {
      program.error(`Project not found: ${projectId}`, { exitCode: 2 });
    }
    const result = {
      id: project.id,
      name: project.name,
      repo: project.repo,
      dependencySummary: project.dependencySummary,
      dependencyEvidence: project.dependencyEvidence,
      dependencies: project.dependencies,
    };
    output(result, options, (payload) => {
      const lines = [
        `${payload.id}: ${payload.dependencySummary.total} direct dependencies across ${payload.dependencySummary.manifests} manifests`,
      ];
      for (const item of payload.dependencyEvidence || []) {
        lines.push(`- ${item.dependency}: ${item.usedFor || item.problemSolved || 'see report evidence'}`);
      }
      if (!payload.dependencyEvidence?.length) {
        lines.push('No curated dependency evidence rows yet. Use --json for the full direct dependency list.');
      }
      const direct = payload.dependencies
        .slice(0, 12)
        .map((item) => `${item.name} (${item.ecosystem}/${item.scope})`);
      if (direct.length) {
        lines.push('direct:', ...direct.map((item) => `- ${item}`));
        if (payload.dependencies.length > direct.length) {
          lines.push(`... ${payload.dependencies.length - direct.length} more; use --json for all.`);
        }
      }
      return `${lines.join('\n')}\n`;
    });
  });

program
  .command('plan')
  .description('Build a structured replication plan and persist run artifacts.')
  .argument('<capability...>', 'capability to replicate, such as "agent internet capability layer"')
  .option('--from <projects>', 'comma-separated TK project ids to use as references')
  .option('--limit <number>', 'maximum auto-discovered reference projects', '5')
  .option('--json', 'emit machine-readable JSON')
  .action(async (capabilityParts, options) => {
    const capability = capabilityParts.join(' ');
    const result = await planReplication(capability, options);
    output(result, options, formatReplicationPlan);
  });

program
  .command('replicate')
  .description('Build a capability replication brief from TK reports, comparisons, and source-cache state.')
  .argument('<capability...>', 'capability to replicate, such as "agent internet capability layer"')
  .option('--from <projects>', 'comma-separated TK project ids to use as references')
  .option('--limit <number>', 'maximum auto-discovered reference projects', '5')
  .option('--json', 'emit machine-readable JSON')
  .action(async (capabilityParts, options) => {
    const capability = capabilityParts.join(' ');
    const result = await buildReplicationBrief(capability, options);
    output(result, options, formatReplicationBrief);
  });

program
  .command('verify')
  .description('Verify a replication plan by capability or existing run id.')
  .argument('<target...>', 'capability text or persisted run id')
  .option('--from <projects>', 'comma-separated TK project ids to use as references')
  .option('--limit <number>', 'maximum auto-discovered reference projects', '5')
  .option('--run-id <id>', 'explicit run id to verify')
  .option('--json', 'emit machine-readable JSON')
  .action(async (targetParts, options) => {
    const target = targetParts.join(' ');
    const result = await verifyReplication(target, options);
    output(result, options, formatVerificationResult);
    process.exitCode = result.status === 'fail' ? 1 : 0;
  });

const run = program.command('run').description('Inspect persisted TK replication runs and artifacts.');

run
  .command('list')
  .description('List recent persisted TK runs.')
  .option('--limit <number>', 'maximum runs to show', '20')
  .option('--json', 'emit machine-readable JSON')
  .action((options) => {
    const result = listRuns(options);
    output(result, options, formatRunList);
  });

run
  .command('show')
  .description('Show one persisted TK run, including trace and artifacts.')
  .argument('<run-id>', 'run id such as run_20260706T123456_abcd12')
  .option('--json', 'emit machine-readable JSON')
  .action((runId, options) => {
    const result = getRunTrace(runId, options);
    if (!result) {
      program.error(`Run not found: ${runId}`, { exitCode: 2 });
    }
    output(result, options, formatRunTrace);
  });

const codex = program.command('codex').description('Install and inspect the TK Codex plugin integration.');

codex
  .command('status')
  .description('Check whether the Technical Knockout Codex marketplace and plugin are installed.')
  .option('--marketplace <name>', 'Codex marketplace name', 'tech-knockout')
  .option('--plugin <name>', 'Codex plugin name', 'technical-knockout')
  .option('--json', 'emit machine-readable JSON')
  .action(async (options) => {
    const result = await codexPluginStatus(options);
    output(result, options, formatCodexStatus);
    process.exitCode = result.ok ? 0 : 1;
  });

codex
  .command('install')
  .description('Install the Technical Knockout Codex plugin from its GitHub marketplace.')
  .option('--source <source>', 'Codex marketplace source', 'okbexx/tech-knockout')
  .option('--ref <ref>', 'Git ref to use when adding the marketplace')
  .option('--marketplace <name>', 'Codex marketplace name', 'tech-knockout')
  .option('--plugin <name>', 'Codex plugin name', 'technical-knockout')
  .option('--dry-run', 'print the Codex commands without executing them')
  .option('--json', 'emit machine-readable JSON')
  .action(async (options) => {
    const result = await installCodexPlugin(options);
    output(result, options, formatCodexInstall);
    process.exitCode = result.ok ? 0 : 1;
  });

codex
  .command('refresh')
  .description('Refresh the installed TK Codex plugin cache by removing and adding it again.')
  .option('--marketplace <name>', 'Codex marketplace name', 'tech-knockout')
  .option('--plugin <name>', 'Codex plugin name', 'technical-knockout')
  .option('--dry-run', 'print the Codex commands without executing them')
  .option('--json', 'emit machine-readable JSON')
  .action(async (options) => {
    const result = await refreshCodexPlugin(options);
    output(result, options, formatCodexRefresh);
    process.exitCode = result.ok ? 0 : 1;
  });

const report = program.command('report').description('Audit, lint, and normalize TK report structure.');

report
  .command('audit')
  .description('Audit report structure against TK Report Contract v1.')
  .option('--write', 'persist packages/tk/data/report-structure-audit.json')
  .option('--json', 'emit machine-readable JSON')
  .action((options) => {
    const audit = auditReportStructure(options);
    const result = options.write ? { ...audit, auditPath: writeReportStructureAudit(audit, options) } : audit;
    output(result, options, (payload) => {
      const text = formatReportStructureAudit(payload);
      return payload.auditPath ? `${text}wrote ${payload.auditPath}\n` : text;
    });
    process.exitCode = audit.summary.failedReports === 0 ? 0 : 1;
  });

report
  .command('lint')
  .description('Fail when TK report structure is outside contract.')
  .option('--strict', 'treat warnings as failures')
  .option('--write', 'persist packages/tk/data/report-structure-audit.json')
  .option('--json', 'emit machine-readable JSON')
  .action((options) => {
    const result = lintReportStructure(options);
    if (options.write) {
      result.auditPath = writeReportStructureAudit(result.audit, options);
    }
    output(result, options, (payload) => {
      const text = formatReportStructureLint(payload);
      return payload.auditPath ? `${text}wrote ${payload.auditPath}\n` : text;
    });
    process.exitCode = result.ok ? 0 : 1;
  });

report
  .command('fix-headings')
  .description('Normalize low-risk heading aliases in reports/.')
  .option('--write', 'apply changes instead of dry-run preview')
  .option('--json', 'emit machine-readable JSON')
  .action((options) => {
    const result = normalizeReportHeadings({ dryRun: !options.write });
    output(result, options, (payload) => {
      if (!payload.changedFiles) return 'no report heading changes\n';
      const lines = [payload.dryRun ? 'report heading changes (dry-run)' : 'report heading changes'];
      for (const item of payload.results) {
        lines.push(`${item.path} (${item.changed})`);
        for (const change of item.changes.slice(0, 8)) {
          lines.push(`  line ${change.line}: ${change.from} -> ${change.to}`);
        }
        if (item.changes.length > 8) {
          lines.push(`  ... ${item.changes.length - 8} more changes`);
        }
      }
      return `${lines.join('\n')}\n`;
    });
  });

const source = program.command('source').description('Manage and inspect local project source caches.');

source
  .command('status')
  .description('Inspect source-cache status for all catalog projects.')
  .option('--json', 'emit machine-readable JSON')
  .option('--write-lock', 'write data/tk.lock.json with the current local source-cache state')
  .action(async (options) => {
    const status = await sourceStatus();
    if (options.writeLock) {
      const validation = validateSourceLock(status);
      if (!validation.ok) {
        output(validation, options, (payload) => `source lock invalid\n${payload.errors.join('\n')}\n`);
        process.exitCode = 1;
        return;
      }
      status.lockPath = await writeLock(status);
    }
    output(status, options, (payload) =>
      payload.sources
        .map((item) => `${item.exists ? 'ok' : 'missing'} ${item.id} ${item.sourceDir || ''}`)
        .join('\n') + '\n',
      );
  });

source
  .command('path')
  .description('Print the local source-cache path for one TK project.')
  .argument('<project>', 'project id, report file, display name, or owner/repo')
  .option('--json', 'emit machine-readable JSON')
  .action(async (projectId, options) => {
    const context = await projectContext(projectId);
    if (!context) {
      program.error(`Project not found: ${projectId}`, { exitCode: 2 });
    }
    output(context, options, (payload) =>
      payload.source.exists ? `${payload.source.path}\n` : `missing ${payload.project.id} ${payload.source.path || ''}\n`,
    );
    process.exitCode = context.source.exists ? 0 : 1;
  });

source
  .command('sync')
  .description('Clone missing sources or fetch existing source caches.')
  .option('--missing', 'clone missing source caches')
  .option('--all', 'fetch existing source caches and clone missing ones')
  .option('--only <project>', 'limit sync to one project id or report file')
  .option('--dry-run', 'print the planned git actions without executing them')
  .option('--json', 'emit machine-readable JSON')
  .action(async (options) => {
    const only = options.only ? [options.only] : null;
    const plan = syncPlan({ only, pull: Boolean(options.all && !options.missing) });
    if (options.dryRun) {
      output(plan, options, (payload) =>
        payload.actions
          .map((action) => `${action.action} ${action.id} -> ${action.sourceDir}`)
          .join('\n') + (payload.actions.length ? '\n' : ''),
      );
      return;
    }
    const result = await executeSyncPlan(plan);
    output(result, options, (payload) =>
      payload.results
        .map((item) => `${item.ok ? 'ok' : 'fail'} ${item.action} ${item.id}${item.error ? `\n${item.error}` : ''}`)
        .join('\n') + (payload.results.length ? '\n' : ''),
    );
    process.exitCode = result.ok ? 0 : 1;
  });

await program.parseAsync(process.argv);
