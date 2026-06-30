---
name: tk-report-authoring
description: Use when creating, updating, validating, or reviewing Technical Knockout reports, comparisons, README project index entries, catalog data, source cache state, or TK methodology docs.
---

# TK Report Authoring

Use this skill when maintaining TK itself.

## Required Steps

1. Fetch remote refs and check branch status before writes.
2. Identify the target `owner/repo` and report path.
3. Ensure source cache is present with `tk source status --json`; sync if
   missing and the user wants a full report.
4. Use `reports/_TEMPLATE.md` or an equivalent full structure.
5. Base claims on verifiable evidence:
   - local source
   - README/docs/changelog/release
   - issues/PRs/actions when checked
   - real command output if tests/builds were run
6. Add `### 依赖 / SDK 选型证据` to every report:
   - make sure local source is present so `tk catalog build` can capture all
     direct dependencies from manifests;
   - explain key libraries, SDKs, frameworks, CLIs, protocol packages, parsers,
     storage engines, search tools, and UI/runtime dependencies;
   - for each key dependency, state what problem it solves, evidence paths,
     reuse signal, and caution.
7. Update `README.md` Project Index and relevant `comparisons/*.md`.
8. Run catalog and doctor checks before finishing.

## Do Not

- Do not invent test/build results.
- Do not submit report conclusions based only on a README unless the report
  explicitly says the deeper evidence was not verified.
- Do not commit `projects/` source caches.
- Do not silently leave README, comparison, and catalog out of sync.
