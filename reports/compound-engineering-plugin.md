# compound-engineering-plugin

> 一句话定位：**一套以"复利工程"为理念的多 Agent 协作编码工作流插件，支持 Claude Code、Cursor、Codex 等 7 个平台，核心亮点是多 Agent 并行代码审查与置信度门控机制。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `EveryInc/compound-engineering-plugin` |
| URL | `https://github.com/EveryInc/compound-engineering-plugin` |
| Star | 15,974 (2026-05-02) |
| Fork | 1,246 |
| 许可证 | MIT |
| 语言 | TypeScript |
| 首次提交 | 2025-10-09 |
| 最近提交 | 2026-05-01 |
| 最新 Release | v3.4.1 |
| 贡献者数 | 10+ (核心: Trevin Chow 334, Kieran Klaassen 240) |
| 分析日期 | 2026-05-02 |

---

## 场景一：是否值得采用

### 解决的问题

传统编码中每次变更都积累技术债务：上下文越来越难 hold，Bug 反复出现，团队知识随人员流动流失。Compound Engineering 试图用 AI Agent 工作流把单次工程任务变成**可复用的组织记忆** — 计划写得更细、审查做多层把关、排障结果文档化到 `docs/solutions/`。

目标用户：已经使用 Claude Code / Cursor / Codex 等 AI 编码工具的团队，希望把零散的 AI 对话升级为结构化工作流。

### 核心能力与边界

- **能做什么：**
  - 提供 37 个 skills（`/ce-plan`, `/ce-work`, `/ce-code-review` 等）覆盖 brainstorm → plan → work → review → compound 全闭环
  - 18+ 审查 persona 的多 Agent 并行代码审查，结构化 JSON 输出 + 合并去重
  - 知识复利系统：排障结果自动文档化，YAML frontmatter 分类归档
  - 跨平台分发：以 Claude Code 插件为单一源码，通过 CLI 转换到 Codex、Cursor、Pi、Gemini、Kiro、OpenCode

- **不能做什么：**
  - 不是独立的 IDE 或编辑器，依赖宿主平台（Claude Code 等）
  - 不提供模型推理能力，只提供工作流编排和 prompt 工程
  - 对非 Claude Code 平台的支持是"转换"而非原生设计，体验有折损

- **与竞品差异：**
  - vs Cline/Continue：CE 不是通用 AI 助手，而是**有观点的工作流系统**（80% 时间在 plan/review，20% 在 execution）
  - vs 其他插件：多 Agent 审查管道（置信度门控 + 合并去重）是独特工程化设计

### 集成成本

- **依赖链：** 极简。运行时仅依赖 `citty`（CLI 框架）和 `js-yaml`，无 AI SDK、无向量库
- **部署复杂度：** 低。`bun install` + `bunx @every-env/compound-plugin install` 即可
- **学习曲线：** 中高。37 个 skills + 49 个 agents 有显著认知负担，需要理解 `ce-` 前缀的命令体系
- **从零到 demo：** 约 10 分钟安装，但让团队真正用起来需要 1-2 周的磨合期

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | ✅ | MIT，商用友好 |
| Bus factor | 中 | 核心贡献者 2 人（Trevin + Kieran），但 Every Inc 是商业公司在 backing |
| 供应商锁定 | 中 | 插件格式以 Claude Code 为 first-class，其他平台是转换目标；但 MIT 许可降低风险 |
| 维护趋势 | 活跃 | 日更节奏，2025-10 至今 7 个月持续迭代，semantic-release 自动化 |
| 安全历史 | 无重大 | Issue 中无安全漏洞报告，代码审查流程本身含 security reviewer persona |

### 结论

**推荐采用**（针对已使用 Claude Code 的团队）

理由：工作流设计有深度，多 Agent 审查机制工程化程度高，知识复利系统对团队长期有价值。但**更适合已有 AI 编码习惯、愿意接受结构化流程约束的团队**；个人开发者或喜欢自由探索式 AI 编码的用户可能觉得束缚感强。

---

## 场景二：技术架构学习

### 核心架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Compound Engineering                      │
│                     (Plugin Workspace)                       │
├─────────────────────────────────────────────────────────────┤
│  plugins/compound-engineering/                               │
│  ├── skills/        ← 37 skills (Markdown + frontmatter)     │
│  │   ├── ce-plan/SKILL.md                                    │
│  │   ├── ce-work/SKILL.md                                    │
│  │   ├── ce-code-review/SKILL.md                             │
│  │   └── ...                                                  │
│  └── agents/        ← 49 agents (Markdown persona definitions)│
│      ├── ce-correctness-reviewer.agent.md                    │
│      ├── ce-security-reviewer.agent.md                       │
│      └── ...                                                  │
├─────────────────────────────────────────────────────────────┤
│  src/                 ← CLI + Converter + Writer             │
│  ├── parsers/claude.ts      ← 解析 Claude 插件格式           │
│  ├── converters/            ← Claude → 各平台格式转换         │
│  │   ├── claude-to-codex.ts                                │
│  │   ├── claude-to-opencode.ts                             │
│  │   └── ...                                                │
│  ├── targets/               ← 各平台写入器                   │
│  │   ├── codex.ts                                          │
│  │   ├── opencode.ts                                       │
│  │   └── ...                                                │
│  └── commands/              ← CLI 子命令                     │
├─────────────────────────────────────────────────────────────┤
│  CLI: compound-plugin convert <source> --to <target>         │
└─────────────────────────────────────────────────────────────┘
```

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 以 Claude Code 为单一源码 | 只需维护一套插件格式 | 其他平台的原生体验优化 | Claude Code 是最大用户群，转换成本可控 |
| Markdown + YAML frontmatter 作为 skill 格式 | 人类可读、版本友好 | 结构化验证能力弱于 JSON Schema | 作者可手写编辑，降低贡献门槛 |
| 多 Agent 并行审查后合并 | 深度审查 + 去重 | 实时性（完整审查需等待所有 agent） | 代码质量比速度更重要 |
| Model Tiering（高 stakes 上最强模型） | 控制成本 | 审查一致性 | 正确性/安全审查需要 Opus 级推理，其他可用中端模型 |
| `docs/solutions/` 知识库 | 持久化组织记忆 | 需要维护刷新机制 | 新 Agent 可以从历史学习，避免重复踩坑 |

### 值得学习的模式

1. **Persona 分层审查体系**：Always-on (6) + Cross-cutting conditional (7) + Stack-specific (8) + CE-specific (2)，按 diff 内容动态调度，避免过度审查
2. **置信度门控 + 保守路由**：`safe_auto` → `gated_auto` → `manual` 的单向升级规则，合成器选更保守的一边
3. **U-ID 稳定的实现单元**：plan 中每个单元有稳定 ID，支持 reorder/split/delete 不 renumber，跨编辑保持 traceability
4. **跨平台转换器模式**：解析 → 转换 → 写入的三段式架构，新增平台只需实现 converter + writer
5. **AGENTS.md 作为运行时规范**：把项目规范文件（CLAUDE.md / AGENTS.md）纳入审查范围，确保 Agent 行为一致

### 反模式 / 踩坑点

1. **49 个 agents 的维护负担**：每个 agent 是独立 markdown 文件，更新一个审查标准需要同步多个 persona 定义
2. **Context 开销大**：完整 plan + work + review + compound 循环可能消耗 5-10 个 subagent 调用，token 成本不低
3. **Claude-centric 设计**：其他平台是"二等公民"，Codex 甚至需要 `--include-skills` 才能输出 skills（默认只转 agents）
4. **worktree 隔离的 git 操作开销**：parallel subagents 依赖 worktree，在大型 monorepo 中 git 操作可能成为瓶颈
5. **浅层 issue 解决速度过快（0.1 天平均）**：可能是 bot 自动关闭或轻量 issue 为主，需警惕真实 bug 的响应质量

### 可借鉴的具体技术点

- **frontmatter 解析与验证流水线**：`src/utils/frontmatter.ts` 处理 YAML + Markdown 混合格式，可复用于任何文档驱动配置系统
- **命令行参数 token 解析**：`ce-code-review` 的 `$ARGUMENTS` 多 token 解析模式（`mode:autofix`, `base:xxx`, `plan:xxx`），可借鉴用于复杂 CLI 参数设计
- **技能目录遍历 + 平台过滤**：`filterSkillsByPlatform` 实现按 `ce_platforms` 字段过滤，支持同一 skill 在不同平台有不同表现
- **Release-please 多组件联动**：`cli` 和 `compound-engineering` 通过 `linked-versions` 保持版本同步，适合 monorepo 发布管理

---

## 架构解剖

### 目录结构

```
compound-engineering-plugin/
├── src/                          # CLI + 转换引擎
│   ├── commands/                 # CLI 子命令（convert, install, list, cleanup）
│   ├── converters/               # Claude → 各平台格式转换逻辑
│   ├── parsers/                  # Claude 插件格式解析器
│   ├── targets/                  # 各平台输出写入器
│   ├── types/                    # TypeScript 类型定义
│   ├── utils/                    # 工具函数（frontmatter, path, model 等）
│   └── data/                     # 静态数据（权限映射等）
├── plugins/
│   ├── compound-engineering/     # 核心插件（37 skills + 49 agents）
│   │   ├── skills/ce-*/          # 每个 skill 一个目录，含 SKILL.md + references/
│   │   └── agents/               # 所有 agent 定义（扁平结构）
│   └── coding-tutor/             # 辅助插件
├── tests/                        # 45 个测试文件，覆盖 converter + writer + CLI
├── docs/                         # 项目自身文档
│   ├── brainstorms/              # 需求文档（ce-brainstorm 产出）
│   ├── plans/                    # 计划文档（ce-plan 产出）
│   ├── solutions/                # 解决方案文档（ce-compound 产出）
│   └── specs/                    # 各平台规范文档
├── scripts/release/              # 发布自动化脚本
└── .github/workflows/            # CI/CD 配置
```

### 技术栈

- **运行时 / 框架**：Bun / Node.js 22，TypeScript
- **CLI 框架**：`citty`（轻量命令行解析）
- **构建 / 打包**：Bun 内置 transpiler，无 webpack/vite
- **测试**：Bun 内置测试框架（`bun test`）
- **CI/CD**：GitHub Actions（semantic PR title 校验、test、release-please 自动化）
- **发布**：semantic-release + release-please 混合（多组件 `linked-versions`）

### 模块依赖关系

```
CLI Entry (src/index.ts)
    ├── convert command (src/commands/convert.ts)
    │   ├── loadClaudePlugin (src/parsers/claude.ts)
    │   ├── target.convert (src/converters/*)
    │   └── target.write (src/targets/*)
    ├── install command (src/commands/install.ts)
    └── list/cleanup commands
```

核心依赖极少（仅 `citty` + `js-yaml`），整个转换引擎是自包含的。

### 扩展机制

1. **新增 Target 平台**：在 `src/targets/index.ts` 注册，实现 `convert` + `write` 两个函数
2. **新增 Skill**：在 `plugins/compound-engineering/skills/` 下新建目录，写 `SKILL.md` + frontmatter
3. **新增 Agent**：在 `plugins/compound-engineering/agents/` 下新建 `.agent.md` 文件
4. **MCP Server 集成**：通过 `.mcp.json` 或 manifest 中的 `mcpServers` 字段配置
5. **Hooks 系统**：`hooks/hooks.json` 定义事件钩子，支持多文件合并

---

## 质量与成熟度

### 代码质量

- **类型系统**：严格 TypeScript，类型定义分离在 `src/types/` 下，接口粒度适中
- **错误处理**：同步代码有 try/catch，异步有合理 fallback（如 `pathExists` 检查）
- **代码风格一致性**：高。全仓库统一风格，无 prettier/eslint 配置但肉眼可见一致

### 测试

- **测试框架**：Bun 内置 test runner
- **测试文件**：45 个 `.test.ts` 文件，覆盖 parser、converter、writer、CLI、release 逻辑
- **测试类型**：纯单元测试为主，大量 fixture-based 测试（`tests/fixtures/` 含完整插件样例）
- **覆盖率**：未直接测量，但 converter 和 writer 的每个目标平台都有独立测试文件

### CI/CD

- **流水线配置**：
  - `ci.yml`：PR title semantic 校验 + test
  - `release-pr.yml`：release-please 管理版本 PR
  - `release-preview.yml`：发布预览
  - `deploy-docs.yml`：文档部署
- **发布流程**：完全自动化。release-please 检测 conventional commit → 生成 release PR → 合并后自动打 tag + GitHub Release
- **分支保护**：`main` 分支要求 test status check 通过，禁止直接 push

### 文档质量

- **API 文档**：无独立 API 文档，但代码注释充分
- **教程/指南**：README 含完整安装指南和 workflow 示例，每个 skill 的 SKILL.md 即使用文档
- **Changelog**：`CHANGELOG.md` 是指针文件，指向 GitHub Releases；各组件有自己的 `CHANGELOG.md`
- **项目自身使用 CE**：仓库内可见 `docs/plans/`、`docs/solutions/`、`docs/brainstorms/`，说明团队确实用自己的工具开发

### Issue/PR 健康度

- **Issue 响应速度**：平均 0.1 天解决（可能含 bot 自动关闭）
- **Open Issues**：58（相对 15k+ stars 比例健康）
- **PR 合并节奏**：高频，通过 semantic PR title 和 test gate 保证质量
- **Breaking change**：v2.39.0 将 commands 迁移到 skills，有明确迁移说明；整体版本管理规范

---

## 社区与生态

### 社区评价

Compound Engineering 在 AI 编码工具圈有较高认可度：
- 被 Anthropic 官方博客和多次 Devin 对比评测引用
- 社区普遍认可其"有观点的工作流"设计 — 不是泛泛的 AI 助手，而是有明确工程哲学的系统
- 批评声音主要集中在"Claude Code 绑定太深"和"context 开销大"

### 衍生项目 / 插件生态

- **Every Inc 自身产品线**：Proof（协作工具）、其他内部工具可能也在使用 CE
- **社区复刻**：GitHub 上可见多个基于 CE 思路的私人 fork，但官方生态尚未完全开放

### 竞品对比

| 项目 | Stars | 定位 | 与 CE 的差异 |
|------|-------|------|-------------|
| Cline | 61,261 | 通用 AI 编码助手（VS Code 扩展） | 更通用、更独立；CE 是工作流插件，依赖宿主平台 |
| Continue | 32,917 | 开源 AI 编码助手（多 IDE） | 偏实时补全和 chat；CE 偏结构化工作流和审查 |
| OpenCode | 12,284 | 开源编码 Agent 框架 | 自托管、更底层；CE 是上层工作流编排 |
| Compound Engineering | 15,974 | 结构化工作流插件 | **唯一有完整多 Agent 审查管道和知识复利系统的方案** |

---

## 关键代码走读

### 1. `src/parsers/claude.ts` — Claude 插件解析器

- **路径**：`src/parsers/claude.ts`
- **职责**：将 `.claude-plugin/plugin.json` + `skills/` + `agents/` + `commands/` 解析为统一的 `ClaudePlugin` 对象
- **实现要点**：
  - 递归遍历目录收集 Markdown 文件
  - frontmatter 解析分离 data（YAML）和 body（Markdown）
  - 支持自定义路径（manifest 中可覆盖默认目录）
  - 安全校验：`resolveWithinRoot` 防止路径遍历攻击

### 2. `src/converters/claude-to-codex.ts` — Codex 平台转换器

- **路径**：`src/converters/claude-to-codex.ts`
- **职责**：将 Claude 插件格式转换为 Codex 的 agents + prompts + skills
- **实现要点**：
  - 默认 agents-only 模式，避免与 Codex 原生 plugin install 冲突（ skills 双注册问题）
  - `invocationTargets` 映射：Agent 体中引用 skills/commands 时，需要知道目标平台的名称转换
  - `buildAgentTargets` 生成多别名映射（含 category 前缀、ce- 前缀剥离等）
  - `collectReferencedSidecarDirs` 自动发现 agent 引用的相邻目录

### 3. `src/targets/index.ts` — 目标平台注册表

- **路径**：`src/targets/index.ts`
- **职责**：统一注册所有目标平台的 convert + write 处理器
- **实现要点**：
  - `TargetHandler` 接口定义：`convert`（转换）+ `write`（写入）+ `supportedScopes`（作用域）
  - 5 个目标平台统一接口：OpenCode、Codex、Pi、Gemini、Kiro
  - `validateScope` 校验 `--scope` 参数（global vs workspace）

### 4. `plugins/compound-engineering/skills/ce-code-review/SKILL.md` — 审查工作流

- **路径**：`plugins/compound-engineering/skills/ce-code-review/SKILL.md`
- **职责**：多 Agent 并行代码审查的完整 orchestration 规范
- **实现要点**：
  - 18+ reviewer persona 的分层条件调度逻辑
  - 4 种 mode（interactive / autofix / report-only / headless）的完整行为差异定义
  - Severity P0-P3 + autofix_class 四级的结构化输出规范
  - Stage 1-6 的完整审查管道：scope → intent → reviewer selection → spawn → merge → synthesis

### 5. `plugins/compound-engineering/skills/ce-plan/SKILL.md` — 计划工作流

- **路径**：`plugins/compound-engineering/skills/ce-plan/SKILL.md`
- **职责**：从需求到实现计划的完整规划流程
- **实现要点**：
  - Phase 0-5 的完整流程：Resume → Source → Scope → Bootstrap → Questions → Depth
  - Implementation Unit 的 U-ID 稳定性规则（支持 reorder/split/delete 不 renumber）
  - 三种 plan depth（Lightweight / Standard / Deep）的差异化模板
  - `ce-brainstorm` 与 `ce-plan` 的明确边界（WHAT vs HOW）

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 5 | 37 skills + 49 agents 覆盖完整编码工作流，从 ideation 到 review 到知识复利 |
| 代码质量 | 4 | TypeScript 严格，错误处理合理，测试覆盖充分；但 converter 中有不少类型断言 (`as`) |
| 文档质量 | 5 | SKILL.md 本身就是使用文档，每个工作流含完整 Phase 规范、反模式提示、平台兼容说明 |
| 社区活跃度 | 4 | 15k+ stars，日更节奏，但核心贡献者集中在 Every Inc 团队 |
| 架构设计 | 4 | 转换器模式清晰，多 Agent 审查管道工程化程度高；但 49 agents 的维护模式有待观察 |
| 学习价值 | 5 | 多 Agent 审查、置信度门控、知识复利系统都是可复用的架构模式 |
| 可借鉴度 | 4 | `docs/solutions/` 模式、U-ID 稳定单元、Model Tiering 可直接复用；但整体绑定 Claude Code |

**总分：31/35**

---

## 总结

### 一句话评价

**Compound Engineering 是目前 AI 编码工作流领域工程化程度最高的开源方案** — 它不只是一个插件，而是一套有明确哲学（复利 > 债务）、有完整管道（多 Agent 审查 + 知识归档）、有跨平台分发能力的工作流操作系统。

### 谁应该用

- 已使用 Claude Code 的 3-10 人工程团队
- 希望把 AI 编码从"个人助手"升级为"团队协作流程"的组织
- 对代码审查质量要求高、愿意接受结构化工作流约束的团队

### 谁不应该用

- 个人开发者或喜欢自由探索式 AI 编码的用户（会觉得流程束缚）
- 主要使用非 Claude Code 平台的团队（转换支持存在，但体验有折损）
- 追求极致速度、不接受多 Agent 审查等待时间的场景

### 下一步

1. **试用核心工作流**：从 `/ce-brainstorm` → `/ce-plan` → `/ce-work` 跑一个完整循环
2. **评估审查管道**：在真实 PR 上运行 `/ce-code-review`，对比团队现有审查质量
3. **观察知识复利**：使用 `/ce-compound` 一个月后检查 `docs/solutions/` 的实用价值
4. **对比横评**：等待 Cline/Continue 等竞品推出类似的多 Agent 审查功能后再刷新对比
