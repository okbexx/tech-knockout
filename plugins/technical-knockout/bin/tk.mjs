#!/usr/bin/env node
import { Command } from 'commander';
import {
  buildCatalog,
  doctor,
  executeSyncPlan,
  findProject,
  formatTable,
  loadCatalog,
  projectContext,
  readComparison,
  readReport,
  searchCatalog,
  sourceStatus,
  syncPlan,
  validateCatalog,
  validateSourceLock,
  writeCatalog,
  writeLock,
} from '../lib/tk-core.mjs';

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
  .description('Technical Knockout CLI for catalog, source cache, doctor, and agent context operations.')
  .version('0.1.0');

program
  .command('doctor')
  .description('Run TK doctor checks for catalog validity and local source-cache health.')
  .option('--json', 'emit machine-readable JSON')
  .action(async (options) => {
    const result = await doctor();
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
