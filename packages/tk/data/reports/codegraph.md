# CodeGraph

> **一句话定位**：CodeGraph 是一个 MIT 许可、本地优先的代码知识图谱库 + CLI + MCP Server，用 tree-sitter 把项目索引成 SQLite/FTS5 符号图，再让 Claude Code、Cursor、Codex CLI、opencode 等 Agent 用少量工具调用完成代码探索。
> **类比**：像 **GitNexus 的轻量 MIT 版** + **Aider repo-map 的 MCP 化升级**；比 gitingest 更“结构化”，但比 GitNexus 少了深层图数据库、社区发现、跨仓库 Contract Bridge 和 Web UI。

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `colbymchenry/codegraph` |
| URL | `https://github.com/colbymchenry/codegraph` |
| Star | 11,755（观测于 2026-05-21） |
| Fork | 700 |
| 许可证 | MIT |
| 语言 | TypeScript |
| 首次提交 | 2026-01-18 |
| 最近提交 | 2026-05-20（`c3f1e27 release: 0.8.0`） |
| 最新 Release | `v0.8.0`（2026-05-20） |
| npm | `@colbymchenry/codegraph@0.8.0`，最近 30 天下载约 22,671 |
| 贡献者数 | 本地 `git shortlog` 约 14 个名字；核心作者 Colby McHenry/Mchenry 约 271/307 commits |
| 分析日期 | 2026-05-21 |

---

## 场景一：是否值得采用

### 解决的问题

CodeGraph 解决的是 AI coding agent 的“探索成本”问题：大模型在陌生代码库里经常先跑一轮 grep/glob/read，甚至开多个探索子代理，才能定位相关文件和调用链。这个过程会消耗大量 token、工具调用和时间。

CodeGraph 的路线不是让 Agent 直接编辑代码，而是先把项目本地索引成一个可查询的代码知识图谱，再通过 MCP 提供：

- 符号搜索：找到函数、类、方法、组件、route。
- 上下文构建：给一个自然语言任务，返回相关符号、调用关系和代码片段。
- 调用/被调用关系：`callers` / `callees`。
- 影响半径：变更某个符号前看潜在受影响代码。
- 结构化文件树：避免用文件系统扫目录。
- Agent 指令注入：安装时给 Claude/Cursor/Codex/opencode 写 MCP 配置和说明文件。

README 声称在 7 个真实开源代码库的基准中，平均 **35% cheaper、59% fewer tokens、49% faster、70% fewer tool calls**。这个基准值得参考，但也要注意它依赖“Agent 按 CodeGraph 指令直接回答，而不是继续派子代理读文件”这个使用策略。

### 核心能力与边界

**能做什么：**

- 一行 `npx @colbymchenry/codegraph` 进入交互安装器，配置 Claude Code、Cursor、Codex CLI、opencode。
- `codegraph init -i` 在项目本地生成 `.codegraph/codegraph.db`。
- 用 `web-tree-sitter` / WASM grammar 解析 TypeScript、JavaScript、Python、Go、Rust、Java、C/C++、C#、PHP、Ruby、Swift、Kotlin、Dart、Scala、Svelte、Vue、Liquid、Pascal/Delphi 等语言。
- 把 nodes / edges / files / unresolved_refs 持久化到 SQLite，节点名、docstring、signature 建 FTS5 索引。
- 解析 import、call、extends、implements、instantiates、references 等关系。
- 识别 Web 框架 route：Express、NestJS、Django、Flask、FastAPI、Rails、Spring、Go routers、Rust web frameworks、ASP.NET、Vapor、React Router、SvelteKit、Vue/Nuxt 等。
- MCP 暴露 `codegraph_search/context/callers/callees/impact/node/explore/status/files` 9 类工具。
- MCP server 在初始化时返回 server-level instructions，明确要求 Agent “直接用 CodeGraph 回答，不要先 grep / 不要派文件读取子代理”。
- 通过 file watcher + git hook fallback 维持索引新鲜度。
- 支持 native `better-sqlite3`，装不上时 fallback 到 `node-sqlite3-wasm`。

**不能做什么：**

- 不是完整 IDE / Agent 平台，不负责代码编辑、patch、review、运行测试。
- 不是 GitNexus 那类深层图谱平台：没有 Cypher、社区发现、execution flow/process、跨仓库 contract bridge、Web graph UI、semantic vector search。
- 不是编译器级类型系统：跨文件调用解析是 best-effort name matching + import resolution + framework heuristics，动态语言、多态、运行时注入仍可能误判。
- 不是云端团队知识服务：数据留在 `.codegraph/` 本地，协作共享、权限、审计需要自己做。
- 当前 repo 自身没有 `.github/workflows/`，质量 gate 主要体现在本地 `npm run build` / `npm test` 和维护者流程，不是仓库内 CI 强制。

**与竞品差异：**

| 维度 | CodeGraph | GitNexus | gitingest | ace-tool-rs |
|------|-----------|----------|-----------|-------------|
| 产品边界 | 本地代码图谱 + MCP | 深层本地图谱平台 + MCP/Web/跨仓库 | 仓库转 LLM-friendly 文本 | 本地切块 + 远端检索后端 MCP 桥 |
| 存储 | SQLite + FTS5 | LadybugDB / 图数据库 | 文本输出 | 本地缓存 + 远端 API |
| 搜索/理解 | 符号图 + FTS + 调用/影响分析 | 图谱 + hybrid search + process/community | 无图谱 | 远端 retrieval |
| Agent 集成 | MCP，强安装器 | MCP，工具面更深 | 无原生 MCP | MCP 两工具 |
| 隐私 | 本地 | 本地 | 本地/服务端取决于用法 | 本地代码切块上传远端 |
| 许可证 | MIT | PolyForm Noncommercial / 商业 | MIT | GPL-3.0 / 商业双许可 |
| 成熟度 | 新但增长快 | 更大、更深，但许可限制 | 成熟单点工具 | 小众桥接器 |

### 集成成本

- **依赖链**：Node.js `>=20 <25`；运行时依赖 10 个左右，核心包括 `web-tree-sitter`、`tree-sitter-wasms`、`node-sqlite3-wasm`、`better-sqlite3` optional、`commander`、`@clack/prompts`、`picomatch`、`jsonc-parser`。
- **部署复杂度**：低。全局安装和初始化都很直接；我在临时目录 smoke test：`npm ci` → `npm run build` → `node dist/bin/codegraph.js init -i --verbose .` 成功，索引 124 文件，最终 status 显示 1,801 nodes / 4,575 edges / native backend。
- **学习曲线**：低到中。用户只要理解“先 init，再让 Agent 用 MCP 工具”；但要用好 `context` vs `explore` vs `node` 的边界，需要看 server instructions。
- **从零到 demo**：小项目 3-10 分钟；大项目主要成本在首次索引和 native SQLite 是否可用。
- **运行约束**：Node 25 被显式 block；native SQLite 装不上会走 WASM fallback，慢 5-10 倍，且可能引发锁等待。


### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键库 / SDK。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| `web-tree-sitter` + `tree-sitter-wasms` | parser / WASM runtime | Multi-language AST extraction | Avoids writing language parsers and keeps install cross-platform | `package.json`; `src/extraction/grammars.ts`; `src/extraction/tree-sitter.ts` | Reuse for local code intelligence that needs broad language coverage | Grammar quality varies by language; large WASM modules and Node/V8 quirks need smoke tests |
| `node:sqlite` / SQLite | storage | Local symbol graph, FTS, and queryable index | Avoids designing a custom graph store for local code navigation | `src/db/sqlite-adapter.ts`; report storage section | Reuse for local-first code indexes that need durability and simple deployment | Watch concurrency/locking and Node version availability |
| `commander` | CLI framework | CodeGraph command surface | Avoids hand-writing CLI parsing, help, version, and subcommands | `package.json`; `src/bin/codegraph.ts` | Reuse for Node CLIs with moderate command complexity | Consider heavier frameworks only when plugin lifecycle or generated docs are needed |
| `@clack/prompts` | CLI UX | Interactive install/init/uninstall prompts | Avoids bespoke terminal prompt UI | `package.json`; `src/installer/index.ts`; `src/bin/codegraph.ts` | Reuse when onboarding needs clear interactive choices | Keep non-interactive flags for CI and agents |
| `picomatch` | glob matcher | Include/exclude filtering | Avoids custom glob matching | `package.json`; report risk section | Reuse mature glob libraries for file selection | Audit advisories matter; CodeGraph report flags direct picomatch security risk |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | ✅ 低 | MIT，明显优于 GitNexus / ace-tool-rs 的商业限制。 |
| Bus factor | ⚠️ 中高 | Star 增长极快，但代码提交仍高度集中在 Colby；open PR 已很多，维护压力会上升。 |
| 供应商锁定 | ✅ 低 | 数据本地 SQLite，MCP 是开放协议；Agent 配置可卸载。 |
| 维护趋势 | ✅ 活跃 | 2026-05-20 刚发 v0.8.0；open PR 多集中在语言/Agent target 扩展。 |
| 安全历史 | ⚠️ 中 | `npm audit` 当前 8 个漏洞：6 moderate、2 high；其中 direct `picomatch` 有 high ReDoS / glob matching advisory，fix available。 |
| 质量 gate | ⚠️ 中 | 本地 `npm test` 666/666 通过，但仓库未跟踪 GitHub Actions/CI 配置。 |
| 文档一致性 | ⚠️ 中 | README 很完整，但部分段落与 v0.8 的新 Agent guidance 冲突；README MCP 工具表也漏列 `codegraph_explore`。 |

### 结论

**推荐采用（个人/小团队/内部 PoC） / 企业核心强制标准件暂时观望。**

理由：

1. **定位很准**：它不是“又一个 coding agent”，而是给现有 coding agent 装一个本地结构化索引层。
2. **MIT + 本地优先**：相比 GitNexus 的非商业许可，CodeGraph 更适合作为团队可控基础件试用。
3. **集成成本低**：npm + MCP + 多 Agent installer，比 GitNexus 轻很多。
4. **工程质量已经不是玩具**：strict TS、worker parse、WAL/lock、watch fallback、installer idempotency、666 个测试都说明作者在认真打磨真实使用痛点。
5. **但成熟度还没到“无脑企业标准”**：没有 repo-level CI、直接依赖有 audit 风险、文档有 drift、项目只有 4 个月，open PR backlog 很快堆高。

我会把它放进“默认可试工具箱”：给个人 Claude/Codex/Cursor 项目配上，观察它在真实大仓库里的命中率、误报率和索引稳定性；如果要在企业强制推广，先补安全依赖、CI 策略和一套内部 benchmark。

---

## 场景二：技术架构学习

### 核心架构图

```text
┌──────────────────────────────────────────────────────────────────┐
│                         使用入口 / 分发层                         │
│                                                                  │
│  npx @colbymchenry/codegraph  →  interactive installer            │
│  codegraph CLI                  →  init/index/sync/status/query    │
│  codegraph serve --mcp          →  MCP Server for Agents           │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                         CodeGraph Facade                          │
│                         src/index.ts                              │
│  init/open/close · indexAll/sync · search · callers/callees        │
│  impact · buildContext · watch/unwatch                            │
└──────────────┬──────────────────┬───────────────────┬────────────┘
               │                  │                   │
               ▼                  ▼                   ▼
┌─────────────────────┐  ┌───────────────────┐  ┌────────────────────┐
│ Extraction Layer     │  │ Resolution Layer  │  │ Query/Context Layer │
│ src/extraction/*     │  │ src/resolution/*  │  │ graph + context     │
│ - scan files         │  │ - framework rules │  │ - BFS/DFS traversal │
│ - detect language    │  │ - import aliases  │  │ - FTS search        │
│ - worker parsing     │  │ - name matching   │  │ - code blocks       │
│ - tree-sitter WASM   │  │ - edge creation   │  │ - impact radius     │
└──────────────┬──────┘  └─────────┬─────────┘  └──────────┬─────────┘
               │                   │                       │
               └───────────────────▼───────────────────────┘
                                ┌───────────────────────────┐
                                │ SQLite Graph DB            │
                                │ .codegraph/codegraph.db    │
                                │ nodes / edges / files      │
                                │ unresolved_refs / FTS5     │
                                └──────────────┬────────────┘
                                               │
┌──────────────────────────────────────────────▼───────────────────┐
│                         MCP Tool Surface                           │
│                         src/mcp/tools.ts                           │
│ search · context · callers · callees · impact · node · explore     │
│ status · files                                                     │
└──────────────────────────────────────────────────────────────────┘
```

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 本地 SQLite 图谱 | `.codegraph/codegraph.db` + FTS5 | 分布式图数据库、跨团队共享 | 零服务、低门槛、隐私和安装体验优先。 |
| Tree-sitter WASM | `web-tree-sitter` + grammar WASM | 编译器级类型精度、native parser 极致性能 | 跨平台安装稳定，npm 用户不用编译一堆语言 parser。 |
| Facade 聚合 | `CodeGraph` 类集中暴露 public API | 更细粒度 service container | 对 library/CLI/MCP 三种入口统一，接入简单。 |
| worker thread 解析 | `parse-worker.ts` + timeout + recycle | 实现复杂度 | 避免 WASM 卡死/OOM 阻塞主线程和 MCP handshake。 |
| best-effort resolution | framework → import → name matching | 类型系统完整性 | 以速度和语言覆盖换精度，符合 Agent 探索场景。 |
| MCP-first 工具面 | 9 个结构化工具 + server instructions | 专有 IDE 深集成 | 一次支持 Claude/Cursor/Codex/opencode 等多宿主。 |
| Installer 写入 Agent 配置 | 每个 target 自己处理 JSON/TOML/JSONC | 用户手写配置的纯净性 | 降低首次使用门槛，但带来配置写入边界问题。 |
| adaptive explore budget | 按项目文件数限制 `codegraph_explore` 输出 | “一次性吐全量上下文”的简单粗暴 | 防止小项目反而比 grep/read 更贵。 |

### 值得学习的模式

1. **Agent Guidance as Runtime Surface**
   - `src/mcp/server-instructions.ts` 不是文档附属品，而是 MCP initialize response 的一部分。
   - 它直接塑造 Agent 行为：先 `codegraph_context`，再一次 `codegraph_explore`，避免 grep/read/sub-agent 探索。
   - 这对所有 MCP 工具都值得借鉴：工具能力不够，使用策略也要随工具一起交付。

2. **轻量图谱的足够好路线**
   - CodeGraph 没有一上来做 Neo4j/Kuzu/LadybugDB，也没有 embeddings。
   - 它用 SQLite + FTS5 + edges 表就覆盖了 80% Agent 探索需求。
   - 对内部工具很有启发：不是所有“代码智能”都需要大图数据库。

3. **Parse Worker 生命周期治理**
   - `PARSE_TIMEOUT_MS`、`WORKER_RECYCLE_INTERVAL`、OOM retry、comment-stripping retry 这套逻辑很工程化。
   - 重点不是“能 parse”，而是大仓库和奇怪文件不会把整个 index/MCP 拖死。

4. **MCP output budget 作为成本控制层**
   - `getExploreBudget()` 和 `getExploreOutputBudget()` 把文件数映射到调用预算、输出字符上限、per-file cap、relationship section 开关。
   - 这比“工具结果统一截断 15k”更贴近 Agent 成本结构。

5. **Multi-agent installer target interface**
   - `AgentTarget` 把 detect/install/uninstall/printConfig/describePaths 拆开。
   - Claude、Cursor、Codex、opencode 各自处理不同配置格式；测试用同一套 contract 跑，避免 installer 回归。

6. **文件同步双路径**
   - 运行时 `FileWatcher` 用 native `fs.watch` + debounce。
   - WSL `/mnt` 等慢文件系统跳过 watcher，改走 git hooks / manual sync。
   - 这是“功能可用但不赌环境”的 fail-soft 设计。

### 反模式 / 踩坑点

1. **文档 drift 已出现**
   - v0.8 Changelog 和 `server-instructions.ts` 明确改成“不要派子代理，直接用 codegraph_context/explore”。
   - README 的 “Global Instructions Reference” 仍保留旧口径：要求 `NEVER call codegraph_explore or codegraph_context directly in the main session`，这会误导用户和 Agent。
   - README MCP Tools 表也漏了 `codegraph_explore`。

2. **配置验证和能力枚举不完全同步**
   - `src/types.ts` 的 `LANGUAGES` 已含 20+ 语言。
   - `src/config.ts::validateConfig()` 的 `validLanguages` 仍只列了 TS/JS/Python/Go/Rust/Java/Svelte/unknown，这类漂移已经有 open PR #233 指向修复。
   - 对快速扩语言项目，这是典型维护风险。

3. **没有仓库内 CI workflows**
   - 本地测试很强，但 `.github/workflows` 未跟踪。
   - 外部贡献者多起来后，没有 CI 会拖慢 review，也让 PR 质量不稳定。

4. **安全依赖需要马上处理**
   - `npm audit` 显示 direct `picomatch` high severity，fix available。
   - CodeGraph 用 picomatch 做 include/exclude glob；虽然不等于立即可利用，但基础设施工具不应长期带这个红点。

5. **大文件/大类仍依赖启发式截断**
   - `codegraph_explore` 已经很努力做 cluster ranking 和 envelope filtering。
   - 但对巨大单文件、动态生成、框架 magic、多态调用，仍可能需要回退 Read/Grep/测试验证。

### 可借鉴的具体技术点

- **SQLite FTS5 + structured nodes/edges**：最低复杂度的本地代码图谱。
- **MCP initialize instructions**：把工具使用策略注入 Agent 运行时。
- **installer target contract tests**：多 Agent 配置写入最容易破坏，contract suite 是必要的。
- **worker recycle for WASM parsers**：WASM memory 不会自动收缩，定期销毁 worker 是现实解。
- **line-numbered explore output**：让 Agent 能直接引用 `file:line`，少一次 Read。
- **native + wasm SQLite 双后端**：提高安装成功率，同时在 status 里暴露性能降级。
- **path traversal guard**：读源码片段前用 `validatePathWithinRoot()`，MCP 工具层必要防线。

---

## 架构解剖

### 目录结构

```text
codegraph/
├── src/
│   ├── index.ts              # CodeGraph facade：生命周期、索引、查询、sync、watch
│   ├── types.ts              # NodeKind / EdgeKind / Language / config / graph types
│   ├── config.ts             # .codegraph/config.json load/save/validation
│   ├── directory.ts          # .codegraph 目录识别/创建/删除
│   ├── db/
│   │   ├── schema.sql        # nodes/edges/files/unresolved_refs/FTS schema
│   │   ├── index.ts          # DatabaseConnection + WAL/pragma/migrations
│   │   ├── queries.ts        # prepared statements + search/ranking/stats
│   │   └── sqlite-adapter.ts # better-sqlite3/native 与 wasm fallback
│   ├── extraction/
│   │   ├── index.ts          # ExtractionOrchestrator：scan/read/worker/store/sync
│   │   ├── grammars.ts       # tree-sitter WASM grammar lazy loading
│   │   ├── tree-sitter.ts    # TreeSitterExtractor 主体
│   │   ├── parse-worker.ts   # worker thread parser runtime
│   │   └── languages/        # 每语言 extractor config
│   ├── resolution/
│   │   ├── index.ts          # ReferenceResolver：framework/import/name 三策略
│   │   ├── import-resolver.ts
│   │   ├── name-matcher.ts
│   │   ├── path-aliases.ts
│   │   └── frameworks/       # Laravel/Express/NestJS/React/... route resolver
│   ├── graph/
│   │   ├── traversal.ts      # BFS/DFS, callers/callees, impact radius
│   │   └── queries.ts        # file dependency、module structure、cycles
│   ├── context/
│   │   ├── index.ts          # search + graph expansion + code block extraction
│   │   └── formatter.ts      # markdown/json 格式化
│   ├── search/
│   │   ├── query-parser.ts   # kind/lang/path/name field filters + fuzzy fallback
│   │   └── query-utils.ts
│   ├── mcp/
│   │   ├── index.ts          # MCPServer：initialize, roots/list, lazy init, watcher
│   │   ├── tools.ts          # 9 个 MCP tool schema + handlers
│   │   ├── transport.ts      # stdio JSON-RPC transport
│   │   └── server-instructions.ts
│   ├── installer/
│   │   ├── index.ts          # interactive + non-interactive installer
│   │   └── targets/          # Claude/Cursor/Codex/opencode 配置写入
│   ├── sync/                 # file watcher + git hooks
│   ├── ui/                   # CLI shimmer progress
│   └── bin/codegraph.ts      # Commander CLI
├── __tests__/                # 25 个 test files，666 tests
├── scripts/                  # release / eval helper scripts
├── docs/plans/               # 设计计划文档
├── README.md
├── CHANGELOG.md
├── CLAUDE.md
└── package.json
```

### 技术栈

- **运行时 / 语言**：Node.js `>=20 <25`，TypeScript 5，CommonJS output。
- **解析**：`web-tree-sitter` + `tree-sitter-wasms` + 自带 Pascal/Scala WASM。
- **存储**：SQLite；native `better-sqlite3` optional，fallback `node-sqlite3-wasm`。
- **搜索**：SQLite FTS5 + query parser + path/kind/language/name filters。
- **MCP**：自实现 stdio JSON-RPC transport，协议版本 `2024-11-05`。
- **CLI**：Commander.js，@clack/prompts，ANSI/shimmer progress。
- **配置写入**：JSON、JSONC、TOML surgical writer。
- **测试**：Vitest，真实文件系统与真实 SQLite，无 DB mock。
- **CI/CD**：仓库内未跟踪 `.github/workflows`；发布通过 `npm publish` + `scripts/release.sh` + GitHub Release。

### 模块依赖关系

```text
src/bin/codegraph.ts / src/mcp/index.ts / library users
                │
                ▼
           src/index.ts  (CodeGraph facade)
                │
      ┌─────────┼─────────┬──────────┬───────────┐
      ▼         ▼         ▼          ▼           ▼
 extraction  resolution  db       graph      context
      │         │         ▲          ▲           ▲
      │         └─────────┴──────────┴───────────┘
      │                    SQLite graph
      ▼
 tree-sitter WASM + language/framework extractors
```

### 扩展机制

1. **新增语言**：在 `src/extraction/grammars.ts` 加扩展名和 WASM grammar，在 `src/extraction/languages/` 新增 `LanguageExtractor`，注册到 `languages/index.ts`，再补测试。
2. **新增框架 route**：在 `src/resolution/frameworks/<framework>.ts` 实现 `FrameworkResolver`，注册到 `frameworks/index.ts`。
3. **新增 MCP tool**：在 `src/mcp/tools.ts` 增加 schema 和 handler，并同步 `server-instructions.ts` 和 installer instructions。
4. **新增 Agent target**：在 `src/installer/targets/` 新文件实现 `AgentTarget`，加到 `registry.ts`，补 `installer-targets.test.ts` contract 覆盖。
5. **配置扩展**：`.codegraph/config.json` 控制 include/exclude/languages/frameworks/maxFileSize/customPatterns。

---

## 质量与成熟度

### 代码质量

- **类型系统**：⭐⭐⭐⭐☆
  - `tsconfig.json` 开启 strict、noImplicitAny、strictNullChecks、noUncheckedIndexedAccess、noUnusedLocals、noImplicitReturns 等。
  - `NODE_KINDS` / `LANGUAGES` 用 `as const` 做 runtime + type 双用途。
  - 扣分点：`config.ts` 的 language validation 没完全跟上 `LANGUAGES`，说明类型源与校验层仍会漂移。

- **错误处理**：⭐⭐⭐⭐☆
  - indexing 有 mutex + file lock，避免多进程写库冲突。
  - parser worker 有 timeout、crash reject、recycle、retry、comment strip fallback。
  - MCP default project detection 失败时返回可操作错误：提示传 `projectPath` 或 MCP args 加 `--path`。
  - 扣分点：best-effort 解析本质会有误判，需要 Agent/用户理解限制。

- **代码风格一致性**：⭐⭐⭐⭐☆
  - 模块分层清楚，测试覆盖面广。
  - 扣分点：`src/extraction/index.ts`、`src/mcp/tools.ts`、`src/bin/codegraph.ts` 单文件偏大，长期会降低维护性。

### 测试

- **测试框架**：Vitest。
- **本次验证**：
  - `npm ci` 成功；npm audit 提示 8 vulnerabilities。
  - `npm run build` 成功。
  - `npm test`：25 test files passed，666 tests passed。
  - 临时目录 smoke：`codegraph init -i --verbose .` 成功；status 显示 native backend、124 files、1,801 nodes、4,575 edges。
  - GitNexus 分析成功：3,905 nodes、8,798 edges、117 clusters、300 flows。
- **测试类型**：
  - extraction 多语言单测。
  - resolution/import/framework integration。
  - graph traversal / context / search parser。
  - MCP initialize / roots/list。
  - installer target contract tests。
  - watcher/sync/git-hook/security/path tests。
- **不足**：没有看到仓库内 CI workflow；`npm audit` 依赖风险未清。

### CI/CD

- **流水线配置**：未跟踪 `.github/workflows/`。
- **发布流程**：`CHANGELOG.md` + `package.json` bump + `npm publish` + `scripts/release.sh` 创建 tag/GitHub Release。
- **风险**：外部 PR 很多时，没有 CI 会导致维护者手动成本上升，也降低第三方信任度。

### 文档质量

- **README**：功能说明、benchmark、quick start、manual setup、CLI、MCP tools、configuration、troubleshooting 都有，整体完成度高。
- **Changelog**：非常强，v0.8.0 对每个 Added/Changed/Fixed 都写了问题背景、issue 号、用户可见影响和 workaround。
- **Repo-local agent docs**：`CLAUDE.md` 写了架构、模块布局、测试、release 规则和 house rules，质量很高。
- **扣分点**：README 局部 drift 明显：旧 Global Instructions Reference 与 v0.8 的“answer directly”策略冲突；MCP tool 表漏 `codegraph_explore`。

### Issue/PR 健康度

- **Open issue / PR**：GitHub API `open_issues_count` 为 105（含 PR）；分开查约 47 open issues、56 open PR。
- **近期问题集中点**：Windows/NTFS watcher、Node 版本/SQLite、installer 写配置边界、更多 Agent target、更多语言/框架支持。
- **PR 节奏**：非常活跃，2026-05-21 当天已有多个 PR：shell completions、Antigravity target、Julia、MyBatis XML、Copilot CLI、Devin target、Jupyter notebook 等。
- **风险**：社区热度增长快于 maintainer 带宽，PR backlog 已经形成；需要 CI、triage label、贡献规范来承接。

---

## 社区与生态

### 社区评价

当前社区信号偏正面：

- Star 约 11.8k，项目 4 个月内增长很快。
- npm 最近 30 天下载 22k+，说明不只是 GitHub 点星。
- open PR 多，且集中在“我想让它支持更多语言 / 更多 Agent 宿主 / 更多框架”的扩展型需求，这是正向 adoption 信号。
- issue 里也有真实运行痛点：Windows/WSL 文件监听、installer 配置边界、Node/SQLite backend、benchmark 口径等。作者在 Changelog 中对这些问题有较细处理。

负面/风险信号：

- bus factor 偏高。
- PR 数高于 issue 数，说明 contributor enthusiasm 很高，但 review backlog 压力也高。
- 没有 CI workflow，会影响外部贡献合入速度。
- 文档更新速度没完全跟上实现变化。

### 衍生项目 / 插件生态

CodeGraph 本身更像“生态内基础件”，不是插件平台：

- 官方 installer 已支持 Claude Code、Cursor、Codex CLI、opencode。
- PR 正在扩展 Copilot CLI、Antigravity、Devin for Terminal 等 target。
- 语言/框架支持 PR 很多，说明扩展点被社区看懂了。
- 目前还没有看到成熟第三方 plugin ecosystem；生态主要围绕 upstream repo 贡献。

### 竞品分层

**直接竞品：**

- **GitNexus**：同为本地代码图谱 + MCP，但更深、更重，非商业许可。
- **Sourcegraph Cody / enterprise code search**：企业级代码理解，但多为云/服务端，部署与预算不同。

**邻近替代：**

- **gitingest / Repomix**：低成本把仓库整理成 LLM 输入，不提供图谱/调用关系。
- **ace-tool-rs**：MCP 桥接器，本地切块，远端检索；不是自包含图谱。
- **Aider repo-map**：coding agent 内置代码地图，更偏编辑工作流而非通用 MCP 基础设施。

**架构邻居：**

- **GitNexus**：学习“深图谱 + 复杂静态分析”的上限。
- **Continue / Cursor / Claude Code MCP 生态**：学习 Agent 宿主接入和 tool instruction 设计。

---

## 关键代码走读

### 1. `src/index.ts` — CodeGraph facade

- **职责**：统一 library、CLI、MCP 的核心入口。
- **实现要点**：
  - `CodeGraph.init/open/openSync` 负责 `.codegraph`、config、DB、orchestrator、resolver、graph/context builder 初始化。
  - `indexAll()` 用 `Mutex` + `FileLock` 防止并发索引，然后调用 `ExtractionOrchestrator.indexAll()`，最后 batched resolve references。
  - `sync()` 对 git fast path 做 changed-file-scoped resolution；无 git info 时回到 full batched resolution。
  - `watch()` 组合 FileWatcher，把文件保存转成 debounced `sync()`。
- **学习点**：Facade 层没有业务花活，主要负责生命周期和并发边界，把复杂性压到 extraction/resolution/context。

### 2. `src/extraction/index.ts` + `tree-sitter.ts` — 索引与 AST 提取

- **职责**：扫描文件、读取内容、加载必要 grammar、用 worker parse、存储 nodes/edges/unresolved refs。
- **实现要点**：
  - 优先用 `git ls-files` 获取 tracked + untracked source，并递归处理嵌套 git repo。
  - 解析 worker 有 10s 基础 timeout，按文件大小扩展；每 250 文件 recycle worker，释放 WASM heap。
  - bulk index 会检查 `maxFileSize`，避免大 bundle/generated 文件拖垮 parser。
  - tree-sitter 先创建 file node，再按 language extractor 抽 function/class/method/property/import 等。
  - non-tree-sitter 格式如 Svelte/Vue/Liquid/DFM 有专门 extractor。
- **学习点**：大仓库索引的难点不是 AST 规则本身，而是“文件发现、ignore、WASM 内存、挂死恢复、增量同步”。

### 3. `src/resolution/index.ts` + `import-resolver.ts` — reference resolution

- **职责**：把 extraction 阶段留下的 unresolved references 变成真实 graph edges。
- **实现要点**：
  - 三段策略：framework-specific → import-based → name matching。
  - `warmCaches()` 只缓存 file paths 和 symbol names，避免大仓库把所有节点加载进内存。
  - `resolveAndPersistBatched()` 每批 5000 个 unresolved refs，边解析边写库，并删除已处理 refs，避免 OOM。
  - `createEdges()` 会把 class target 的 call 提升为 `instantiates`，把 interface target 的 extends 提升为 `implements`。
  - `import-resolver.ts` 支持 tsconfig/jsconfig paths、fallback aliases、相对路径、re-export。
- **学习点**：这里体现了“够用的静态分析”：先做高置信框架/import，再用低置信名字匹配兜底。

### 4. `src/mcp/tools.ts` + `server-instructions.ts` — Agent 工具面

- **职责**：把图谱能力变成 Agent 能正确使用的 MCP tools。
- **实现要点**：
  - tool schema 覆盖 search/context/callers/callees/impact/node/explore/status/files。
  - `codegraph_context` 是 primary tool，组合搜索、graph traversal 和代码块。
  - `codegraph_explore` 按项目大小动态预算：小项目不输出附加文件列表和预算注释，大项目保留更丰富关系图。
  - explore 输出带行号、gap/trim marker、relationship map，并硬 cap 到预算，避免上下文膨胀。
  - `codegraph_node(includeCode=true)` 对 class/interface/struct/enum 返回 outline，而不是整块大 body。
  - `SERVER_INSTRUCTIONS` 明确反模式：不要 grep first、不要 search+node 链式替代 context、不要 loop node。
- **学习点**：MCP 工具的胜负不只在工具函数本身，而在工具描述、输出预算、Agent 行为约束。

### 5. `src/installer/targets/*` — 多 Agent 配置写入

- **职责**：把 CodeGraph 接进不同 Agent 宿主。
- **实现要点**：
  - `targets/registry.ts` 集中列出 Claude、Cursor、Codex、opencode。
  - 每个 target 自己决定 global/local config 路径、MCP JSON/TOML/JSONC 写法、instructions 文件位置。
  - Cursor 处理 cwd/rootUri quirk，会注入 `--path`。
  - opencode 使用 jsonc-parser 做 surgical edits，保留注释和格式。
  - `installer-targets.test.ts` 用 contract tests 覆盖 install idempotency、sibling preservation、uninstall、printConfig、partial-state recovery。
- **学习点**：Agent 工具想真正被采用，installer 是一等公民；手写 MCP 配置会阻断大部分用户。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 4.0 | 覆盖本地图谱、MCP、impact、context、watcher、installer；但没有 GitNexus 那种深图谱/跨仓库/Web UI/semantic hybrid。 |
| 代码质量 | 4.0 | strict TS、真实 SQLite 测试、worker/lock 设计扎实；扣分在大文件模块、配置枚举漂移、audit 风险。 |
| 文档质量 | 3.5 | README/Changelog/CLAUDE.md 很丰富；但 v0.8 策略变更后 README 存在明显旧口径。 |
| 社区活跃度 | 4.0 | Star/npm/PR 动能强；项目太新且 bus factor 高，PR backlog 已显现。 |
| 架构设计 | 4.5 | 轻量图谱 + MCP instructions + adaptive output budget 是很好的设计组合。 |
| 学习价值 | 5.0 | 非常适合学习“Agent 工具如何降低探索成本”和“本地代码智能 MVP 怎么做”。 |
| 可借鉴度 | 5.0 | MIT，模块清楚，installer/MCP/SQLite/worker 模式都能直接复用到内部工具。 |

---

## 总结

### 一句话评价

**CodeGraph 是目前最值得拿来试的轻量本地 Code Intelligence MCP：没有 GitNexus 那么深，但 MIT、简单、Agent-first，路线非常适合内部工具化。**

### 谁应该用

- Claude Code / Cursor / Codex / opencode 的重度用户，想减少探索成本。
- 小团队想要一个 MIT、本地、可控的代码结构索引。
- 正在做 Agent 平台 / MCP 工具 / 内部工程助手的人，想学工具说明、输出预算、installer 的设计。
- 需要比 gitingest 更结构化、但不想上 GitNexus 复杂栈的人。

### 谁不应该用

- 需要企业级多仓库权限、审计、共享图谱、跨 repo contract 分析的团队。
- 需要编译器级精度和类型推导的静态分析场景。
- 对依赖安全和 CI 有硬门槛、不能接受新项目快速变化的生产环境。
- 只想把仓库转成 prompt 文本的人；这种场景 gitingest/Repomix 更简单。

### 下一步

1. **作为个人/小团队工具，建议直接试用**：选 1-2 个真实中大型项目跑 `codegraph init -i`，在 Claude/Codex 中对比原生 grep/read 和 CodeGraph MCP 的 token/tool-call 差异。
2. **如果要内部标准化**：先补内部安全基线：升级 `picomatch`、评估 Vitest/Vite dev vuln、加 CI、写一套内部 benchmark。
3. **如果要学习架构**：重点读 `src/mcp/tools.ts`、`src/extraction/index.ts`、`src/resolution/index.ts`、`src/installer/targets/*`。
4. **如果要贡献 PR**：优先做低风险但价值高的修复：README v0.8 guidance drift、MCP tool 表补 `codegraph_explore`、config language validation 对齐 `LANGUAGES`、CI workflow baseline。
