# GitNexus

> **一句话定位**：纯客户端的代码知识图谱引擎，通过 MCP 协议让任意 AI Agent 获得深度代码库感知能力——像 DeepWiki 但更深，像 Sourcegraph 但更轻。
> **类比**：Sourcegraph Cody 的本地开源替代品 + DeepWiki 的结构化升级版 + MCP 生态的代码智能基础设施。

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `abhigyanpatwari/GitNexus` |
| URL | `https://github.com/abhigyanpatwari/GitNexus` |
| Star | 33,938 (截至 2026-05-01) |
| Fork | 3,858 |
| 许可证 | PolyForm Noncommercial 1.0.0（非商业） |
| 语言 | TypeScript (主), Python (eval) |
| 首次提交 | 2025-08-02 |
| 最近提交 | 2026-05-01 |
| 最新 Release | v1.6.3 (2026-04-24) |
| 贡献者数 | 30+ (核心: abhigyanpatwari 234, magyargergo 181) |
| 分析日期 | 2026-05-01 |

---

## 场景一：是否值得采用

### 解决的问题

AI 编程助手（Cursor、Claude Code、Codex 等）在编辑大型代码库时普遍存在"盲人摸象"问题：
- 看不到跨文件调用链，修改一个函数时不知道影响了谁
- 不理解模块边界和社区结构，重构时容易破坏架构
- 搜索代码时只能用文本匹配，无法理解语义关系

GitNexus 把任意代码库索引成**知识图谱**（符号、调用链、执行流、模块社区），通过 MCP 协议暴露给 AI Agent，让即使是小模型也能获得大模型才有的架构级理解。

### 核心能力与边界

**能做什么：**
- 本地索引任意 GitHub repo 或 ZIP 文件，零网络传输
- 构建包含 4325+ 符号、10556+ 关系、300+ 执行流的知识图谱
- 通过 16 个 MCP tools 暴露查询能力：`query` (BM25+向量混合搜索), `context` (符号 360° 视图), `impact` (变更影响半径), `detect_changes` (diff 到符号映射), `rename` (图辅助重命名) 等
- 支持多仓库 group 的跨 repo 影响分析
- 自动生成 AGENTS.md / CLAUDE.md 上下文文件
- Web UI 可视化探索图谱 + AI Chat

**不能做什么：**
- 不是代码编辑器，不直接修改代码（只做分析和建议）
- 非商业许可证限制了企业内免费使用（需购买商业授权）
- 浏览器端 Web UI 受限于内存（~5K 文件），大仓库需要 CLI + Bridge 模式
- 不支持实时同步，需要手动或 hook 触发 reindex

**与竞品差异：**

| 维度 | GitNexus | Sourcegraph Cody | DeepWiki | Aider |
|------|----------|------------------|----------|-------|
| 部署 | 纯客户端 | 服务端/云端 | 云端 | 本地 CLI |
| 隐私 | 完全本地 | 需信任服务端 | 上传代码 | 本地 |
| 知识表示 | 完整图谱 (符号+关系+执行流) | 向量搜索+代码片段 | 文本描述 | 代码地图 |
| Agent 集成 | MCP (通用) | 专用插件 | 无 | 专用协议 |
| 语言支持 | 15+ | 主流语言 | 不限 | 主流 |
| 开源 | 是 (非商业) | 部分开源 | 否 | 是 |

### 集成成本

- **依赖链**：Node.js >=20，核心依赖约 30 个 npm 包（含 tree-sitter 原生绑定、LadybugDB、ONNX Runtime）
- **部署复杂度**：⭐☆☆☆☆ — 一行命令 `npx gitnexus analyze` 即可索引
- **学习曲线**：⭐⭐☆☆☆ — 对开发者友好，但理解图谱查询和 MCP 配置需要 30 分钟
- **从零到 demo**：5 分钟（安装 + 索引一个小 repo + 在 Claude Code 里试一个 query）


### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键库 / SDK。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| _待补关键依赖_ | | | | | | |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | ⚠️ | PolyForm Noncommercial 禁止商业使用，企业需购买授权或寻找替代 |
| Bus factor | 中 | 两位核心贡献者占主导（415/680+ commits），但社区已有 30+ 贡献者 |
| 供应商锁定 | 低 | 数据存储在本地 `.gitnexus/`，格式开放（LadybugDB），MCP 是开放协议 |
| 维护趋势 | 活跃 | 日均 5-10 次提交，v1.6.3 刚发布，RFC #909 等大特性在持续开发 |
| 安全历史 | 良好 | v1.3.11 修复过 FTS Cypher 注入（#209），有安全响应记录 |

### 结论

**观望（个人/学习）/ 不推荐（企业免费采用）**

理由：
1. 技术能力极强，知识图谱 + MCP 的架构方向非常正确
2. 非商业许可证是最大障碍——如果团队想免费用来做日常开发，法律风险明确
3. 企业版（akonlabs.com）价格未知，需询价评估 ROI
4. 项目不到一年，API 和 schema 仍在快速迭代（如 KuzuDB → LadybugDB 迁移），breaking changes 风险存在

---

## 场景二：技术架构学习

### 核心架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GitNexus 架构总览                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐  │
│  │   Web UI    │    │  CLI Direct │    │   MCP Server (stdio)    │  │
│  │  (React 19) │    │  (Commands) │    │  (Cursor/Claude/Codex)  │  │
│  │  Sigma.js   │    │             │    │                         │  │
│  └──────┬──────┘    └──────┬──────┘    └───────────┬─────────────┘  │
│         │                  │                       │                │
│         └──────────────────┼───────────────────────┘                │
│                            ▼                                        │
│                   ┌─────────────────┐                               │
│                   │   HTTP Bridge   │  ◄── gitnexus serve           │
│                   │   (Express)     │                               │
│                   └────────┬────────┘                               │
│                            ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      Query Layer (LocalBackend)               │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │   │
│  │  │  BM25    │ │  Vector  │ │  Cypher  │ │  Impact Analysis │ │   │
│  │  │  Search  │ │  Search  │ │  Query   │ │  (Graph Walk)    │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ │   │
│  └──────────────────────────┬────────────────────────────────────┘   │
│                             ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  LadybugDB Graph Database                     │   │
│  │         (Nodes: File/Folder/Class/Method/Function/...)        │   │
│  │         (Edges: CALLS/IMPORTS/EXTENDS/CONTAINS/...)           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                             ▲                                       │
│  ┌──────────────────────────┴────────────────────────────────────┐   │
│  │              Ingestion Pipeline (12-Phase DAG)                 │   │
│  │                                                                │   │
│  │  scan → structure → [markdown,cobol] → parse → [routes,tools, │   │
│  │  orm] → crossFile → mro → communities → processes              │   │
│  │                                                                │   │
│  │  ┌─────────────┐    ┌─────────────────────────────────────┐   │   │
│  │  │ Tree-sitter │    │  Dual Resolution Path                │   │   │
│  │  │  Parsers    │───►│  • Legacy Call-Resolution DAG        │   │   │
│  │  │  (15+ lang) │    │  • Scope-Resolution Pipeline (RFC#909)│   │   │
│  │  └─────────────┘    └─────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 纯客户端 | 全部本地运行 | 团队协作的实时共享、云端算力 | 隐私优先，零信任第三方；Agent 场景下代码不外流是刚需 |
| LadybugDB (原 KuzuDB) | 嵌入式图数据库 | 分布式扩展、云原生运维 | 单机性能足够，零配置启动，WASM 版本可跑在浏览器 |
| 12 阶段 Pipeline DAG | 静态拓扑排序执行 | 流式处理、增量更新效率 | 可预测性优先，每个阶段有明确输入输出；方便调试和测试 |
| 双重调用解析 | Legacy DAG + Scope-Resolution 并行 | 代码复杂度、维护成本 | 迁移期保证零回归；CI 双路径 parity 校验确保输出一致 |
| MCP 协议 | 标准 Model Context Protocol | 深度定制 Agent 体验 | 生态兼容性最大化，一次集成支持 Cursor/Claude/Codex/Windsurf 等 |
| Tree-sitter | 语法解析基础 | 编译器级类型精度 | 平衡精度与速度，支持 15+ 语言，社区成熟 |
| Worker Pool 解析 | 并行文件解析 | 内存峰值控制 | 大仓库索引速度关键；`--pool=forks` 隔离原生崩溃 |

### 值得学习的模式

1. **Pipeline DAG Runner**：Kahn 拓扑排序 + 编译时类型安全 + 显式依赖声明。每个 phase 只接收 declared deps，防止隐式耦合。错误处理包裹 phase 名，保留原始 cause。
2. **Same-Graph Guarantee**：新旧两条解析路径（Legacy DAG vs Scope-Resolution）必须输出完全相同的节点 ID、边类型、confidence tier。CI 跑 parity 测试确保迁移零回归。
3. **Language Provider Hook 体系**：共享代码不硬编码任何语言特性，所有语言差异通过 `inferImplicitReceiver` / `selectDispatch` / `mroStrategy` 等 hook 注入。Ruby 是唯一实现双 hook 的语言。
4. **Graph-Assisted Rename**：不是简单的文本替换，而是在图上做符号级重命名，自动追踪跨文件引用，带 `dry_run` 预览。
5. **Staleness Detection**：比较索引时的 `lastCommit` 与当前 `HEAD`，在 MCP tool 调用时提示 Agent 重新索引。
6. **Agent Skill 自动生成**：从知识图谱检测代码社区结构，自动生成 `.claude/skills/` 和 `.cursor/rules/`，让 AI Agent 获得 repo 特定的行为指南。

### 反模式 / 踩坑点

1. **非商业许可证的商业模式风险**：PolyForm Noncommercial 在开源社区有争议。虽然保护了作者的商业利益，但限制了企业的免费试用和二次开发，可能阻碍生态扩张。
2. **Tree-sitter 原生绑定的跨平台噩梦**：不同语言的 tree-sitter parser 需要 native addon，postinstall 脚本里还有自定义的 build 脚本（dart, proto），Windows 支持历史上有问题。
3. **Graph Schema 的快速迭代**：KuzuDB → LadybugDB 的迁移涉及全路径重命名（`kuzu` → `lbug`），对用户是 breaking change。不到一年内发生存储层迁移，说明架构仍在探索期。
4. **Issue 356 个 vs 核心维护者 2 人**：社区贡献活跃但 issue triage 可能跟不上，部分 issue 可能长期无人响应。
5. **Web UI 的浏览器内存墙**：~5K 文件限制对大型 monorepo 不友好，虽然 Bridge 模式可以绕过，但增加了使用复杂度。

### 可借鉴的具体技术点

- **MCP Tool 设计模式**：16 个 tools 的分层设计（discovery → query → analysis → modification），每个 tool 都有明确的输入输出 schema 和风险等级
- **Hybrid Search (BM25 + Vector)**：文本搜索 + 语义搜索的融合排序，适合代码场景（精确匹配符号名 + 理解语义相似）
- **Community Detection (Leiden)**：用图算法自动发现代码模块社区，比文件夹结构更能反映真实架构
- **Contract Bridge for Cross-Repo**：多仓库 group 间的符号契约桥接，解决 monorepo / 微服务架构下的跨 repo 影响分析
- **Pre-commit Hook 集成**：`gitnexus analyze --skills` 在索引时自动生成 Agent 上下文文件，把"代码分析"和"Agent 配置"绑定在一起

---

## 架构解剖

### 目录结构

```
gitnexus/                    # CLI + MCP 核心包
├── src/
│   ├── cli/                 # Commander.js CLI 命令定义
│   ├── core/
│   │   ├── ingestion/       # 12 阶段 ingestion pipeline
│   │   │   ├── pipeline-phases/   # scan, structure, parse, crossFile, mro, communities, processes...
│   │   │   ├── languages/         # 15+ 语言 provider (ts, py, go, rust, java, c/c++, csharp, ruby, php, swift, kotlin, dart, vue, cobol)
│   │   │   ├── call-processor.ts  # 6 阶段调用解析 DAG
│   │   │   ├── import-processor.ts
│   │   │   └── workers/           # Worker pool for parallel parsing
│   │   ├── lbug/            # LadybugDB 适配层 (schema, adapter, queries)
│   │   ├── search/          # BM25 + hybrid fusion
│   │   ├── embeddings/      # HuggingFace transformers + ONNX
│   │   ├── wiki/            # 自动 Wiki 生成
│   │   └── group/           # 多仓库 group 支持 (sync, contracts, bridge)
│   ├── mcp/                 # MCP Server 实现
│   │   ├── server.ts        # stdio MCP server
│   │   ├── tools.ts         # 16 MCP tools 定义
│   │   └── resources.ts     # MCP resources (group contracts/status)
│   └── lib/                 # 工具函数
├── test/
│   ├── unit/                # 纯逻辑测试
│   └── integration/         # 组合测试
├── hooks/                   # Claude Code PreToolUse/PostToolUse hooks
├── skills/                  # 自动生成的 Agent skills
└── vendor/                  # 自定义 tree-sitter parser (dart, proto, swift)

gitnexus-web/                # React 可视化前端
├── src/
│   ├── components/          # React 组件 (Graph, Chat, Sidebar)
│   └── lib/                 # API client, graph utils
├── e2e/                     # Playwright E2E 测试
└── test/                    # Vitest 单元测试

gitnexus-shared/             # 共享类型和常量
├── src/
│   ├── languages.ts         # 支持语言枚举
│   └── scope-resolution/    # 共享的 scope 解析类型

eval/                        # Python 评估框架
├── agents/                  # 评估 Agent 配置
├── environments/            # 测试环境
└── run_eval.py              # 评估主入口
```

### 技术栈

- **运行时 / 框架**：Node.js >=20, TypeScript 5.4, ESM
- **CLI**：Commander.js, cli-progress
- **Web 服务端**：Express.js, CORS
- **Web 前端**：React 19, Vite, Tailwind CSS v4, Sigma.js (图可视化), D3
- **图数据库**：LadybugDB (嵌入式, WASM 版本用于浏览器)
- **图算法库**：graphology (布局: forceatlas2, noverlap)
- **语法解析**：tree-sitter + 15+ 语言 parser
- **嵌入模型**：@huggingface/transformers + ONNX Runtime
- **AI 编排**：LangChain (仅 Web UI 的 chat 功能)
- **测试**：Vitest (CLI + Web), Playwright (Web E2E), Python eval harness
- **CI/CD**：GitHub Actions (format, lint, typecheck, tests, e2e, scope-parity, release)
- **代码质量**：ESLint, Prettier, Husky, lint-staged

### 模块依赖关系

```
cli ( Commander ) ──► runPipelineFromRepo ( ingestion )
                         │
                         ▼
                    12-Phase DAG
                    ├── scan (filesystem)
                    ├── structure (File/Folder nodes)
                    ├── parse (tree-sitter → symbols + edges)
                    │   └── call-processor (6-stage resolution)
                    ├── crossFile (type propagation)
                    ├── mro (method overrides)
                    ├── communities (Leiden clustering)
                    └── processes (execution flows)
                         │
                         ▼
                    LadybugDB (persistence)
                         ▲
    ┌────────────────────┼────────────────────┐
    │                    │                    │
MCP Server          HTTP Bridge           CLI Direct
(tools.ts)          (serve.ts/api.ts)     (tool.ts)
    │                    │                    │
    ▼                    ▼                    ▼
 query/context/    REST API for          gitnexus query
 impact/rename/    gitnexus-web          |context|impact
 detect_changes
```

### 扩展机制

1. **语言扩展**：实现 `LanguageProvider` 接口，注册到 `languages/index.ts`。需要：tree-sitter grammar、queries、import resolver、call extractor、type extractor、scope resolver（可选）。
2. **Pipeline Phase 扩展**：实现 `PipelinePhase<T>` 接口，声明 deps，导出到 `pipeline-phases/index.ts`，加入 `buildPhaseList()`。
3. **MCP Tool 扩展**：在 `mcp/tools.ts` 中添加 tool schema 和 handler。
4. **Group 扩展**：通过 `group.yaml` 配置多仓库组，自动构建 Contract Registry 和 Bridge Graph。
5. **Hook 扩展**：Claude Code 的 `PreToolUse` / `PostToolUse` hooks 在 `gitnexus-claude-plugin/hooks/` 中定义，可自动 enrich 搜索和检测 stale index。

---

## 质量与成熟度

### 代码质量

- **类型系统**：⭐⭐⭐⭐⭐ — 严格的 TypeScript，`tsc --noEmit` 是 CI gate，大量使用 `satisfies` 做编译时 exhaustive check（如 export detection dispatch table）
- **错误处理**：⭐⭐⭐⭐☆ — Pipeline 阶段错误包裹 phase 名，MCP tool errors 有结构化返回。但部分 native addon 崩溃只能依赖 worker 隔离 (`--pool=forks`)
- **代码风格一致性**：⭐⭐⭐⭐⭐ — Prettier + ESLint + lint-staged + husky 强制统一，CI 有 format check

### 测试

- **测试框架**：Vitest (CLI/Web), Playwright (E2E)
- **覆盖率**：CI 开启 coverage，有 auto-ratcheting（阈值自动提升），报告含 coverage bars
- **测试类型**：
  - 单元测试：纯逻辑、parser、graph helper
  - 集成测试：filesystem + MCP wiring + pipeline（968+ 个，从 840 增长）
  - E2E：Web UI 关键路径（Playwright，需 `gitnexus serve` + dev server）
  - Scope Parity：CI 同时跑 Legacy DAG 和 Scope-Resolution 双路径，确保输出一致
  - Eval：Python 框架做 Agent 行为基准测试

### CI/CD

- **流水线配置**：`.github/workflows/`
  - `ci-quality.yml`：format (prettier), lint (eslint), typecheck (tsc --noEmit), workflow convention
  - `ci-tests.yml`：vitest with coverage (ubuntu) + cross-platform (macOS, Windows)
  - `ci-e2e.yml`：Playwright，gate 在 `gitnexus-web/**` 变更
  - `ci-scope-parity.yml`：双路径 parity 校验
  - `publish.yml`：npm 发布
  - `release-candidate.yml`：RC 流程
  - `claude-code-review.yml`：AI PR review
- **发布流程**：npm 包 `gitnexus`，版本号在 `gitnexus/package.json`，changelog 在根目录 `CHANGELOG.md`

### 文档质量

- **API 文档**：⭐⭐⭐⭐☆ — MCP tools 有详细表格和示例，ARCHITECTURE.md 非常深入（500+ 行），但缺少自动化生成的 API doc
- **教程/指南**：⭐⭐⭐⭐☆ — README 有 Quick Start、MCP 配置指南、各编辑器支持文档，还有 `RUNBOOK.md` 做运维参考
- **Changelog**：⭐⭐⭐⭐⭐ — 结构化 changelog，按版本记录 Added/Fixed/Changed/Security，标注 PR 和贡献者
- **开发者文档**：⭐⭐⭐⭐⭐ — `AGENTS.md`, `ARCHITECTURE.md`, `GUARDRAILS.md`, `CONTRIBUTING.md`, `TESTING.md`, `RUNBOOK.md` 全套，甚至为 AI Agent 写了专用开发指南

### Issue / PR 健康度

- **Issue 响应速度**：⭐⭐⭐☆☆ — 356 open issues，核心维护者 2 人，issue triage 有 `triage-sweep.yml` 自动流程，但人力可能吃紧
- **PR 合并节奏**：⭐⭐⭐⭐☆ — 依赖机器人活跃，有 PR labeler 和 description check，Claude Code Review 辅助
- **Breaking change 历史**：⭐⭐⭐☆☆ — v1.4.0 有大规模重构（import-processor 1412→711 行），存储层 KuzuDB→LadybugDB 迁移，schema 变动较快

---

## 社区与生态

### 社区评价

GitNexus 在 9 个月内从 0 增长到 34K stars，增长速度极快（平均 ~3.8K stars/月）。这反映了市场对"AI Agent 代码理解"的强烈需求。

**正面信号：**
- Hacker News / Reddit 上有大量讨论，MCP 生态中代码理解类的头部项目
- 多家编辑器（Cursor, Claude Code, Codex, Windsurf, OpenCode）官方支持或社区推荐
- 有社区衍生插件：`pi-gitnexus` (pi.dev 插件), `gitnexus-stable-ops` (Miyabi 生态)
- TrendShift 上有 badge，说明在开发者社区有热度

**负面信号：**
- 非商业许可证引起部分开发者顾虑，GitHub discussions 中有相关争论
- 部分 issue 报告 native addon 在特定平台（Linux ARM, WSL）上的构建问题
- 项目非常年轻，长期维护承诺尚未经过时间检验

### 衍生项目 / 插件生态

| 项目 | 作者 | 描述 |
|------|------|------|
| pi-gitnexus | @tintinweb | pi.dev 编辑器的 GitNexus 插件 |
| gitnexus-stable-ops | @ShunsukeHayashi | 稳定运维和部署工作流 (Miyabi 生态) |

生态尚在早期，但 MCP 协议的通用性意味着任何支持 MCP 的编辑器/Agent 都可以直接接入，不需要专门的插件开发。

### 竞品对比

| 项目 | Stars | 定位 | 与 GitNexus 差异 |
|------|-------|------|-----------------|
| Sourcegraph Cody | N/A (企业) | 企业级代码 AI | 服务端架构，需信任 Sourcegraph |
| GitHub Copilot Chat | N/A (商业) | AI 结对编程 | 黑盒，无知识图谱 |
| DeepWiki | N/A (云端) | AI 生成代码文档 | 只生成描述，不建结构化图谱 |
| Aider | ~25K | CLI AI 编程助手 | 有代码地图，但侧重编辑而非分析 |
| Continue.dev | ~25K | 开源 AI 代码助手 | 侧重 chat + autocomplete，无深度图谱 |

GitNexus 的差异化在于：**纯客户端 + 完整知识图谱 + MCP 通用协议** 的三重组合。这三点同时满足的项目目前几乎没有。

---

## 关键代码走读

### 1. `gitnexus/src/core/ingestion/pipeline-phases/runner.ts` — DAG 执行引擎
- **路径**：`gitnexus/src/core/ingestion/pipeline-phases/runner.ts`
- **职责**：静态 12 阶段 DAG 的拓扑排序执行
- **实现要点**：
  - Kahn 算法验证无环，出错时 DFS 追踪具体循环路径（如 `A -> B -> C -> A`）
  - 每个 phase 只接收 `deps` 中 declared 的依赖，防止隐式耦合
  - `getPhaseOutput<T>` 提供编译时类型安全的跨阶段数据传递
  - 进度事件系统：`start` → `progress` → `complete`/`error`

### 2. `gitnexus/src/core/ingestion/call-processor.ts` — 调用解析 6 阶段 DAG
- **路径**：`gitnexus/src/core/ingestion/call-processor.ts`
- **职责**：从 AST 提取调用点，推断 receiver，选择 dispatch 策略，解析目标，发射 CALLS 边
- **实现要点**：
  - 6 阶段流水线：`extract-call → classify-form → infer-receiver → select-dispatch → resolve-target → emit-edge`
  - 语言差异通过 `LanguageProvider` hook 注入（`inferImplicitReceiver`, `selectDispatch`）
  - MRO walk 支持 4 种策略：`first-wins`, `c3`, `ruby-mixin`, `none`
  - 与 Scope-Resolution Pipeline 共存，通过 `MIGRATED_LANGUAGES` + `isRegistryPrimary()` 开关

### 3. `gitnexus/src/mcp/tools.ts` — MCP Tool 定义与实现
- **路径**：`gitnexus/src/mcp/tools.ts`
- **职责**：16 个 MCP tools 的 schema 定义和业务逻辑
- **实现要点**：
  - 分层设计：discovery (`list_repos`) → query (`query`, `cypher`) → analysis (`context`, `impact`, `api_impact`) → modification (`rename`)
  - `impact` tool 做 upstream/downstream graph walk，返回风险摘要（LOW/MEDIUM/HIGH/CRITICAL）
  - Group-aware：`repo: "@groupName"` 触发跨仓库查询，RRF 合并结果
  - `detect_changes` 将 git diff 映射到受影响符号和 process，用于 pre-commit 检查

### 4. `gitnexus/src/core/group/cross-impact.ts` — 跨仓库影响分析
- **路径**：`gitnexus/src/core/group/cross-impact.ts`
- **职责**：多仓库 group 间的符号级影响传播
- **实现要点**：
  - Contract Bridge 模式：每个 repo 暴露 provider/consumer 契约，跨 repo 查询时通过契约桥接
  - `group_sync` 重建 Contract Registry (`contracts.json`) 和 Bridge Graph
  - 保持与单 repo 相同的 tool API，用户无感知切换

### 5. `gitnexus/src/core/lbug/schema.ts` — 图数据库 Schema
- **路径**：`gitnexus/src/core/lbug/schema.ts`
- **职责**：LadybugDB 的节点/边 schema 定义
- **实现要点**：
  - 节点类型：File, Folder, Class, Method, Function, Variable, Route, Tool, Community, Process...
  - 边类型：CONTAINS, CALLS, IMPORTS, EXTENDS, IMPLEMENTS, HANDLES_ROUTE, QUERIES, MEMBER_OF, STEP_IN_PROCESS...
  - 边属性：`confidence` (0-1), `reason` (enum), `parameterTypes` (overload 消歧)
  - VECTOR extension 用于语义搜索

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | ⭐⭐⭐⭐⭐ | 15+ 语言、知识图谱、MCP 16 tools、跨 repo、Web UI、Wiki 生成，非常完整 |
| 代码质量 | ⭐⭐⭐⭐⭐ | TypeScript 严格、编译时 exhaustive check、CI 多重 gate、scope parity |
| 文档质量 | ⭐⭐⭐⭐⭐ | ARCHITECTURE.md 500+ 行、全套开发者指南、结构化 Changelog、AGENTS.md |
| 社区活跃度 | ⭐⭐⭐⭐☆ | 34K stars 增长极快，30+ 贡献者，但 issue triage 人力有限 |
| 架构设计 | ⭐⭐⭐⭐⭐ | DAG pipeline、双重解析路径、Language Provider hooks、Contract Bridge 都是高质量设计 |
| 学习价值 | ⭐⭐⭐⭐⭐ | 知识图谱构建、MCP 集成、静态分析 pipeline、跨语言调用解析，每个点都值得深学 |
| 可借鉴度 | ⭐⭐⭐⭐☆ | Pipeline DAG、Hybrid Search、Graph-Assisted Rename、MCP Tool 设计可直接复用；但 LadybugDB 和 tree-sitter 绑定耦合较深 |

**总分：34/35**

---

## 总结

### 一句话评价

GitNexus 是 **2025-2026 年最值得关注的代码智能基础设施项目之一**——它以纯客户端知识图谱 + MCP 通用协议的架构，精准命中了 AI Agent 时代"代码理解"的痛点，技术实现水准极高，但非商业许可证是它扩张的最大枷锁。

### 谁应该用

- **个人开发者 / 开源贡献者**：想让自己的 Cursor/Claude Code 真正理解大型代码库
- **技术团队做架构学习**：研究知识图谱构建、静态分析 pipeline、MCP 协议实现
- **MCP 生态开发者**：需要参考高质量的 MCP tool 设计范例
- **代码可视化研究者**：Sigma.js + graphology + D3 的图谱可视化实现值得参考

### 谁不应该直接用

- **企业想免费商用**：PolyForm Noncommercial 明确禁止，需购买商业授权
- **追求绝对稳定 API 的团队**：项目不到一年，schema 和存储层仍在迭代
- **纯浏览器端分析超大 monorepo**：>5K 文件需要 CLI + Bridge 模式，增加复杂度

### 下一步

1. **试用**：`npx gitnexus analyze` 索引一个自己的 repo，在 Claude Code 里试 `gitnexus_impact` 和 `gitnexus_context`
2. **深入架构**：精读 `call-processor.ts` 和 `scope-resolver.ts`，理解双重解析路径的设计
3. **对比评估**：如果企业有预算，联系 akonlabs.com 询价 enterprise 版本；如果预算有限，对比 Continue.dev + 自定义 RAG 的方案
4. **跟踪 RFC #909**：Scope-Resolution Pipeline 是未来的主路径，关注 TypeScript 迁移进展
