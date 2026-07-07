import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const REPORT_STRUCTURE_CONTRACT_V1 = {
  schemaVersion: 1,
  contractVersion: 'report-structure-v1',
  requiredH2: [
    '基本信息',
    '场景一：是否值得采用',
    '场景二：技术架构学习',
    '质量与成熟度',
    '社区与生态',
    '评分',
    '总结',
  ],
  recommendedH2: ['架构解剖', '关键代码走读'],
  requiredH3ByH2: {
    '场景一：是否值得采用': ['解决的问题', '核心能力与边界', '结论'],
    '场景二：技术架构学习': ['核心架构图'],
    '质量与成熟度': ['代码质量'],
  },
  recommendedH3ByH2: {
    '场景一：是否值得采用': ['依赖 / SDK 选型证据', '风险评估'],
    '场景二：技术架构学习': ['底层技术架构'],
    '架构解剖': ['目录结构', '技术栈', '模块依赖关系', '扩展机制'],
    '质量与成熟度': ['测试', 'CI/CD', '文档质量', 'Issue / PR 健康度'],
    '社区与生态': ['衍生项目 / 插件生态', '竞品对比'],
    '总结': ['一句话评价', '谁应该用', '谁不应该直接用', '下一步'],
  },
  recommendedBottomArchitectureChildren: [
    '最小架构内核',
    '核心抽象',
    '控制面 / 数据面',
    '关键执行链路',
    '状态模型',
    '契约边界',
    '失败与降级模型',
    '可复刻设计不变量',
  ],
};

const H2_ALIAS_MAP = {
  '关键代码 / 文件走读': '关键代码走读',
  '关键文件走读': '关键代码走读',
  '核心文件走读': '关键代码走读',
  '评分（1-5）': '评分',
  '最终评分': '评分',
  '最终结论': '总结',
  '结论': '总结',
  '采用建议': '总结',
  '与同类项目对比': '社区与生态',
  '第二层：架构解剖': '架构解剖',
  '第三层：质量与成熟度': '质量与成熟度',
  '第四层：社区与生态': '社区与生态',
};

const H3_ALIAS_MAP = {
  '采用结论': '结论',
  '采用建议': '结论',
  '采用风险': '风险评估',
  '适合采用的场景': '核心能力与边界',
  '不适合直接采用的场景': '核心能力与边界',
  '依赖/sdk 选型证据': '依赖 / SDK 选型证据',
  '核心文件 / 函数走读': '关键代码走读',
  'Issue/PR 健康度': 'Issue / PR 健康度',
  'CI/CD 与发布': 'CI/CD',
  '文档': '文档质量',
  '代码与内容质量': '代码质量',
  '当前社区信号': '社区评价',
  '社区与维护': '社区评价',
  '社区热度': '社区评价',
  '热度与认可度': '社区评价',
  '正面信号': '社区评价',
  '正面评价集中点': '社区评价',
  '真实痛点': '社区评价',
  '社区结论': '社区评价',
  '生态位': '社区评价',
  '社区评价与生态信号': '社区评价',
  '衍生项目/生态': '衍生项目 / 插件生态',
  '衍生与扩展': '衍生项目 / 插件生态',
  '生态形态': '衍生项目 / 插件生态',
  '竞品 / 参照物': '竞品对比',
  '竞品分层': '竞品对比',
  '竞品对比（定性）': '竞品对比',
  '竞品与邻近项目': '竞品对比',
  '直接竞品 / 邻近替代 / 架构邻居': '竞品对比',
  '竞品与替代分层': '竞品对比',
  '控制面 / 数据面分离': '控制面 / 数据面',
  '失败恢复与降级': '失败与降级模型',
  '失败恢复与降级策略': '失败与降级模型',
  '失败恢复与降级机制': '失败与降级模型',
  '可借鉴的设计不变量': '可复刻设计不变量',
  '谁不应该用': '谁不应该直接用',
  '下一步建议': '下一步',
  '测试 / 验证': '测试',
};

const LEGACY_TOP_LEVEL_PREFIXES = ['第一层：', '第二层：', '第三层：', '第四层：', '第五层：'];
const BOTTOM_ARCHITECTURE_DIRECT_HEADINGS = new Set([
  '最小架构内核',
  '核心抽象',
  '控制面 / 数据面',
  '关键执行链路',
  '状态模型',
  '契约边界',
  '失败与降级模型',
  '可复刻设计不变量',
]);
const APPENDIX_TOP_LEVEL_PREFIXES = ['附录：', '版本变化速读', '近期版本漂移', '维护 / 接管视角', '横评（', '与同类项目对比', '最值得复刻的架构能力'];

function findTkRepoRoot(startDir = process.cwd()) {
  let current = resolve(startDir);
  while (true) {
    if (existsSync(join(current, 'reports')) && existsSync(join(current, 'comparisons'))) return current;
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function getPaths(options = {}) {
  const configuredRepoRoot = options.repoRoot || process.env.TK_REPO_ROOT;
  const repoRoot = configuredRepoRoot ? resolve(configuredRepoRoot) : findTkRepoRoot();
  const packageRoot = resolve(options.packageRoot || PACKAGE_ROOT);
  const dataDir = join(packageRoot, 'data');
  const reportsDir = repoRoot ? join(repoRoot, 'reports') : join(dataDir, 'reports');
  return {
    repoRoot,
    packageRoot,
    dataDir,
    reportsDir,
    auditPath: join(dataDir, 'report-structure-audit.json'),
  };
}

function listMarkdownFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .filter((name) => !name.startsWith('_'))
    .sort()
    .map((name) => join(dir, name));
}

function cleanHeading(value) {
  return String(value || '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function canonicalizeHeading(level, title) {
  const cleaned = cleanHeading(title);
  if (level === 2) return H2_ALIAS_MAP[cleaned] || cleaned;
  if (level === 3 || level === 4) return H3_ALIAS_MAP[cleaned] || cleaned;
  return cleaned;
}

function parseHeadings(text) {
  const lines = text.split(/\r?\n/);
  const headings = [];
  let currentH2 = null;
  let currentH3 = null;
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{2,4})\s+(.+)$/);
    if (!match) continue;
    const level = match[1].length;
    const rawTitle = cleanHeading(match[2]);
    const canonicalTitle = canonicalizeHeading(level, rawTitle);
    if (level === 2) {
      currentH2 = canonicalTitle;
      currentH3 = null;
    } else if (level === 3) {
      currentH3 = canonicalTitle;
    }
    headings.push({
      level,
      rawTitle,
      canonicalTitle,
      line: index + 1,
      parentH2: currentH2,
      parentH3: currentH3,
    });
  }
  return headings;
}

function buildSectionIndex(headings) {
  const h2 = [];
  const h2ByCanonical = {};
  const h3ByH2 = {};
  const h4ByH3 = {};

  for (const heading of headings) {
    if (heading.level === 2) {
      h2.push(heading.canonicalTitle);
      h2ByCanonical[heading.canonicalTitle] = h2ByCanonical[heading.canonicalTitle] || [];
      h2ByCanonical[heading.canonicalTitle].push(heading.rawTitle);
      h3ByH2[heading.canonicalTitle] = h3ByH2[heading.canonicalTitle] || [];
    }
    if (heading.level === 3 && heading.parentH2) {
      h3ByH2[heading.parentH2] = h3ByH2[heading.parentH2] || [];
      h3ByH2[heading.parentH2].push(heading.canonicalTitle);
      h4ByH3[`${heading.parentH2}::${heading.canonicalTitle}`] = h4ByH3[`${heading.parentH2}::${heading.canonicalTitle}`] || [];
    }
    if (heading.level === 4 && heading.parentH2 && heading.parentH3) {
      const key = `${heading.parentH2}::${heading.parentH3}`;
      h4ByH3[key] = h4ByH3[key] || [];
      h4ByH3[key].push(heading.canonicalTitle);
    }
  }

  return { h2, h2ByCanonical, h3ByH2, h4ByH3 };
}

function makeIssue(severity, code, message, details = {}) {
  return { severity, code, message, ...details };
}

function listMissing(actual, required) {
  return required.filter((item) => !actual.includes(item));
}

function isAppendixLike(title) {
  return APPENDIX_TOP_LEVEL_PREFIXES.some((prefix) => title.startsWith(prefix));
}

function analyzeReport(reportPath, options = {}) {
  const paths = getPaths(options);
  const text = readFileSync(reportPath, 'utf8');
  const headings = parseHeadings(text);
  const index = buildSectionIndex(headings);
  const title = text.match(/^#\s+(.+)/m)?.[1]?.trim() || reportPath.split('/').pop().replace(/\.md$/, '');

  const errors = [];
  const warnings = [];
  const missingH2 = listMissing(index.h2, REPORT_STRUCTURE_CONTRACT_V1.requiredH2);
  for (const section of missingH2) {
    errors.push(makeIssue('error', 'missing_required_h2', `缺少顶层章节：${section}`, { section }));
  }
  const missingRecommendedH2 = listMissing(index.h2, REPORT_STRUCTURE_CONTRACT_V1.recommendedH2 || []);
  const hasNestedCodeWalk = headings.some((heading) => heading.level === 3 && heading.canonicalTitle === '关键代码走读');
  for (const section of missingRecommendedH2) {
    if (section === '关键代码走读' && hasNestedCodeWalk) {
      warnings.push(
        makeIssue(
          'warning',
          'codewalk_nested_under_parent_section',
          '关键代码走读仍嵌在其他顶层章节下，建议提升为独立 H2。',
          { section },
        ),
      );
      continue;
    }
    warnings.push(makeIssue('warning', 'missing_recommended_h2', `建议补齐顶层章节：${section}`, { section }));
  }

  const missingRequiredH3 = {};
  for (const [h2, requiredH3] of Object.entries(REPORT_STRUCTURE_CONTRACT_V1.requiredH3ByH2)) {
    const actual = index.h3ByH2[h2] || [];
    const missing = listMissing(actual, requiredH3);
    if (missing.length) {
      missingRequiredH3[h2] = missing;
      for (const section of missing) {
        errors.push(makeIssue('error', 'missing_required_h3', `章节 ${h2} 缺少子章节：${section}`, { parent: h2, section }));
      }
    }
  }

  const missingRecommendedH3 = {};
  for (const [h2, recommendedH3] of Object.entries(REPORT_STRUCTURE_CONTRACT_V1.recommendedH3ByH2)) {
    const actual = index.h3ByH2[h2] || [];
    const missing = listMissing(actual, recommendedH3);
    if (missing.length) {
      missingRecommendedH3[h2] = missing;
      for (const section of missing) {
        warnings.push(makeIssue('warning', 'missing_recommended_h3', `章节 ${h2} 建议补齐子章节：${section}`, { parent: h2, section }));
      }
    }
  }

  const bottomKey = '场景二：技术架构学习::底层技术架构';
  const actualBottomChildren = index.h4ByH3[bottomKey] || [];
  const missingBottomChildren = listMissing(actualBottomChildren, REPORT_STRUCTURE_CONTRACT_V1.recommendedBottomArchitectureChildren);
  if ((index.h3ByH2['场景二：技术架构学习'] || []).includes('底层技术架构') && missingBottomChildren.length) {
    for (const section of missingBottomChildren) {
      warnings.push(makeIssue('warning', 'missing_bottom_architecture_child', `底层技术架构建议补齐：${section}`, { parent: '底层技术架构', section }));
    }
  }

  const scene2H3 = index.h3ByH2['场景二：技术架构学习'] || [];
  if (!scene2H3.includes('底层技术架构')) {
    const flattened = scene2H3.filter((title) => BOTTOM_ARCHITECTURE_DIRECT_HEADINGS.has(title));
    if (flattened.length) {
      warnings.push(
        makeIssue(
          'warning',
          'bottom_architecture_not_grouped',
          `场景二已直接出现底层架构子项，但缺少父章节“底层技术架构”：${flattened.join('、')}`,
          { sections: flattened },
        ),
      );
    }
  }

  const legacyTopLevel = headings
    .filter((heading) => heading.level === 2)
    .map((heading) => heading.rawTitle)
    .filter((title) => LEGACY_TOP_LEVEL_PREFIXES.some((prefix) => title.startsWith(prefix)) || title === '一句话定位');
  for (const section of legacyTopLevel) {
    warnings.push(makeIssue('warning', 'legacy_top_level_section', `仍存在旧分层顶层标题：${section}`, { section }));
  }

  for (const heading of headings) {
    if (heading.level === 2 && heading.rawTitle !== heading.canonicalTitle) {
      warnings.push(
        makeIssue('warning', 'deprecated_heading_alias', `建议将标题“${heading.rawTitle}”归一为“${heading.canonicalTitle}”`, {
          line: heading.line,
          from: heading.rawTitle,
          to: heading.canonicalTitle,
        }),
      );
    }
    if ((heading.level === 3 || heading.level === 4) && heading.rawTitle !== heading.canonicalTitle) {
      warnings.push(
        makeIssue('warning', 'deprecated_heading_alias', `建议将标题“${heading.rawTitle}”归一为“${heading.canonicalTitle}”`, {
          line: heading.line,
          from: heading.rawTitle,
          to: heading.canonicalTitle,
        }),
      );
    }
  }

  const extraTopLevel = headings
    .filter((heading) => heading.level === 2)
    .map((heading) => heading.canonicalTitle)
    .filter((title) => !REPORT_STRUCTURE_CONTRACT_V1.requiredH2.includes(title))
    .filter((title) => !(REPORT_STRUCTURE_CONTRACT_V1.recommendedH2 || []).includes(title))
    .filter((title) => !isAppendixLike(title));
  for (const section of extraTopLevel) {
    warnings.push(makeIssue('warning', 'non_contract_top_level_section', `顶层章节不在 v1 contract 中：${section}`, { section }));
  }

  const status = errors.length ? 'fail' : warnings.length ? 'warn' : 'pass';
  const relPath = paths.repoRoot ? relative(paths.repoRoot, reportPath) : relative(paths.packageRoot, reportPath);
  return {
    path: relPath,
    title,
    status,
    missingH2,
    missingRequiredH3,
    missingRecommendedH3,
    missingBottomArchitectureChildren: missingBottomChildren,
    headings: headings.map((heading) => ({
      level: heading.level,
      line: heading.line,
      title: heading.rawTitle,
      canonicalTitle: heading.canonicalTitle,
      parentH2: heading.parentH2,
      parentH3: heading.parentH3,
    })),
    errors,
    warnings,
  };
}

export function auditReportStructure(options = {}) {
  const paths = getPaths(options);
  const reportFiles = listMarkdownFiles(paths.reportsDir);
  const reports = reportFiles.map((reportPath) => analyzeReport(reportPath, options));
  const passedReports = reports.filter((report) => report.status === 'pass').length;
  const warnedReports = reports.filter((report) => report.status === 'warn').length;
  const failedReports = reports.filter((report) => report.status === 'fail').length;
  const warningCount = reports.reduce((total, report) => total + report.warnings.length, 0);
  const errorCount = reports.reduce((total, report) => total + report.errors.length, 0);
  return {
    schemaVersion: 1,
    contractVersion: REPORT_STRUCTURE_CONTRACT_V1.contractVersion,
    generatedAt: new Date().toISOString(),
    reportRoot: paths.repoRoot ? relative(paths.repoRoot, paths.reportsDir) || 'reports' : paths.reportsDir,
    summary: {
      totalReports: reports.length,
      passedReports,
      warnedReports,
      failedReports,
      warningCount,
      errorCount,
    },
    reports,
  };
}

export function lintReportStructure(options = {}) {
  const audit = auditReportStructure(options);
  const strict = Boolean(options.strict);
  const ok = strict ? audit.summary.failedReports === 0 && audit.summary.warnedReports === 0 : audit.summary.failedReports === 0;
  return {
    ok,
    strict,
    audit,
  };
}

export function writeReportStructureAudit(audit, options = {}) {
  const paths = getPaths(options);
  mkdirSync(paths.dataDir, { recursive: true });
  writeFileSync(paths.auditPath, `${JSON.stringify(audit, null, 2)}\n`);
  return paths.auditPath;
}

function normalizeHeadingLine(line) {
  const match = line.match(/^(#{2,4})\s+(.+)$/);
  if (!match) return { line, changed: false };
  const level = match[1].length;
  const rawTitle = cleanHeading(match[2]);
  const canonicalTitle = canonicalizeHeading(level, rawTitle);
  if (canonicalTitle === rawTitle) return { line, changed: false };
  return {
    line: `${'#'.repeat(level)} ${canonicalTitle}`,
    changed: true,
    from: rawTitle,
    to: canonicalTitle,
  };
}

export function normalizeReportHeadings(options = {}) {
  const paths = getPaths(options);
  if (!paths.repoRoot || !existsSync(paths.reportsDir)) {
    throw new Error('report fix requires a writable TK repo with reports/ directory');
  }
  const dryRun = Boolean(options.dryRun);
  const results = [];
  for (const reportPath of listMarkdownFiles(paths.reportsDir)) {
    const original = readFileSync(reportPath, 'utf8');
    const lines = original.split(/\r?\n/);
    const changes = [];
    const nextLines = lines.map((line, index) => {
      const normalized = normalizeHeadingLine(line);
      if (normalized.changed) {
        changes.push({ line: index + 1, from: normalized.from, to: normalized.to });
      }
      return normalized.line;
    });
    if (!changes.length) continue;
    if (!dryRun) {
      writeFileSync(reportPath, `${nextLines.join('\n')}${original.endsWith('\n') ? '\n' : ''}`);
    }
    results.push({
      path: relative(paths.repoRoot, reportPath),
      changed: changes.length,
      changes,
    });
  }
  return {
    dryRun,
    changedFiles: results.length,
    results,
  };
}

export function formatReportStructureAudit(audit) {
  const lines = [
    `contract: ${audit.contractVersion}`,
    `reports: ${audit.summary.totalReports}`,
    `pass: ${audit.summary.passedReports}`,
    `warn: ${audit.summary.warnedReports}`,
    `fail: ${audit.summary.failedReports}`,
    `warnings: ${audit.summary.warningCount}`,
    `errors: ${audit.summary.errorCount}`,
  ];
  for (const report of audit.reports.filter((item) => item.status !== 'pass')) {
    const headline = `${report.status} ${report.path}`;
    const problems = [
      ...report.errors.map((issue) => issue.message),
      ...report.warnings.slice(0, 4).map((issue) => issue.message),
    ];
    lines.push(headline);
    for (const problem of problems) lines.push(`  - ${problem}`);
    if (report.warnings.length > 4) lines.push(`  - ... ${report.warnings.length - 4} more warnings`);
  }
  return `${lines.join('\n')}\n`;
}

export function formatReportStructureLint(result) {
  if (result.ok) {
    return result.strict ? 'report structure valid (strict)\n' : 'report structure valid\n';
  }
  return `${formatReportStructureAudit(result.audit)}`;
}
