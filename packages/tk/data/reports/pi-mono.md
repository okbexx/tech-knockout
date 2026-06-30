# pi-mono

> 一句话定位：**AI Agent 工具箱 monorepo，以可扩展的 Coding Agent CLI（pi）为核心，向下沉淀为统一的 LLM API 层与 Agent 运行时层，向上提供 TUI/Web UI 组件库，追求"开箱即用的 CLI 工具 + 可编程的 Agent SDK"双重定位。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `badlogic/pi-mono` |
| URL | `https://github.com/badlogic/pi-mono` |
| Star | 43,427（截至 2026-05-01） |
| Fork | 5,095 |
| 许可证 | MIT |
| 语言 | TypeScript |
| 首次提交 | 2025-08-09 |
| 最近提交 | 2026-05-01（持续高频迭代） |
| 最新 Release | v0.71.1 |
| 贡献者数 | 30（核心作者 Mario Zechner 占 3,029/3,300+ 次提交） |
| 分析日期 | 2026-05-01 |

---

## 场景一：是否值得采用

### 解决的问题

pi-mono 解决的核心痛点是**现有 Coding Agent 工具要么封闭不可扩展（Claude Code、Codex CLI），要么扩展机制简陋（Aider），且缺乏分层清晰的 Agent SDK 供二次开发**。具体包括：

1. **闭源工具锁定**：Claude Code、Codex CLI 功能强大但无法自定义行为或嵌入内部系统
2. **扩展困难**：Aider 虽有扩展点，但受限于 Python 动态性，难以做类型安全的工具注册和事件拦截
3. **多 Provider 适配成本高**：每个项目重复写 OpenAI/Anthropic/Google 等适配层
4. **Session 管理缺失**：大多数 agent 工具缺乏持久化、compaction、branching 等高级会话机制

目标用户是**需要自定义 coding agent 行为的开发者**和**想把 agent 能力嵌入内部工具/服务的团队**。

### 核心能力与边界

- **能做什么：**
  - 交互式 Coding Agent CLI（pi）：read / bash / edit / write / grep / find / ls 七件套工具
  - 25+ LLM Provider 统一接入（Anthropic、OpenAI、Google、ZAI/智谱、Kimi、MiniMax、OpenRouter、Groq、xAI 等）
  - Extension 系统：TypeScript 文件自动发现，可注册自定义工具、命令、事件拦截、自定义 UI 组件
  - Session 树：持久化、compaction（带文件操作追踪）、branch summary、tree navigation / resume / fork
  - Skills 系统：Markdown + YAML frontmatter 定义 prompt 模板，自动发现
  - Subagent 编排：单任务、并行（8 任务/4 并发）、链式调用
  - SDK 化：pi-agent-core + pi-ai 可作为独立库嵌入到 HTTP 服务或桌面应用
  - TUI（pi-tui）和 Web UI（pi-web-ui）组件库，可复用

- **不能做什么：**
  - 目前不是 IDE 插件（无 VS Code/JetBrains 集成），定位是终端工具
  - 无内置 Git 智能操作（如 Aider 的自动 commit/PR），需通过 bash 工具间接使用
  - 无原生多 Agent Swarm 协调（有 Subagent 但非自动编排）
  - 无本地 embedding / RAG 能力（纯 LLM 驱动）
  - 无跨平台二进制分发（Node.js/Bun 运行时依赖）

- **与竞品差异：**

  | 维度 | pi-mono | Claude Code | Codex CLI | Aider | Cline |
  |------|---------|-------------|-----------|-------|-------|
  | 开源 | ✅ MIT | ❌ | ❌ | ✅ Apache 2.0 | ✅ MIT |
  | 可扩展性 | ✅ Extension SDK（TS） | ⚠️ 有限 | ⚠️ 有限 | ⚠️ 脚本级 | ⚠️ 设置级 |
  | Provider 数 | 25+ | Anthropic 为主 | OpenAI 为主 | 多 | 多 |
  | Session 管理 | ✅ 树形 + compaction | ⚠️ 有限 | ⚠️ 有限 | ❌ 文件级 | ⚠️ 有限 |
  | 作为 SDK | ✅ 核心包独立 | ❌ | ❌ | ⚠️ 库可用 | ❌ |
  | TUI | ✅ 内置（pi-tui） | ✅ | ⚠️ 简单 | ✅ | ❌（IDE 内） |
  | 语言 | TypeScript | TypeScript/Python | Rust/TS | Python | TypeScript |
  | 社区 Stars | 43k | 120k | 79k | 44k | 61k |

### 集成成本

- **依赖链**：Node.js 22+ 或 Bun。核心包依赖标准 npm 生态（OpenAI SDK、Anthropic SDK、TypeBox 等），无原生编译依赖。
- **部署复杂度**：`npm install -g @mariozechner/pi-coding-agent` 一键安装。作为 SDK 嵌入时，标准 npm 依赖管理。
- **学习曲线**：中等。Extension 开发需要理解事件流和 TypeBox schema，但 jiti 免编译降低了门槛。CLI 操作与 Claude Code 类似，迁移成本低。
- **从零到跑通 demo**：约 5 分钟（安装 → 配置 API key → `pi` 启动）。


### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键库 / SDK。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| _待补关键依赖_ | | | | | | |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | ✅ | MIT，商用无忧 |
| Bus factor | 🟡 中 | 核心作者 Mario Zechner 贡献率 >90%，但他是 libGDX 等长期项目的维护者，有持续维护记录 |
| 供应商锁定 | 🟢 低 | 25+ provider 支持，且 Extension 可注册自定义 provider |
| 维护趋势 | 🟢 高 | 从 2025-08 到现在高频迭代，v0.71.1，版本节奏稳定 |
| 安全历史 | 🟢 良好 | 无重大 CVE。Extension 运行时有安全提示（满系统权限）。有 issue-gate/pr-gate 防止低质量输入 |
| 新贡献者门槛 | 🔴 高 | 新 issue/PR 自动关闭，需 maintainer 手动审核，社区参与门槛极高 |

### 结论

**🟢 推荐采用（特别适合作为内部工具基座）**

理由：
- **工程完成度极高**：43k stars 不是 hype 堆出来的，代码结构清晰、类型安全、测试覆盖扎实（203 个测试文件）。
- **分层架构价值大**：pi-ai 的 provider 抽象和 pi-agent-core 的 Agent 运行时，可以直接作为内部 Agent 服务的底座。
- **扩展机制先进**：TypeScript Extension 系统比 Aider 的 Python 脚本扩展更类型安全，比 Codex skill 更灵活（可拦截事件、自定义 UI）。
- **Session 系统成熟**：compaction 带文件操作追踪、branch summary、tree navigation——这些在开源 agent 工具中很少见。
- **风险可控**：Mario Zechner 是资深开源维护者（libGDX 10 年+），虽然贡献集中，但个人稳定性高于普通单作者项目。
- **建议策略**：个人可直接作为主力 coding agent 使用；团队可作为内部 Agent 平台的底座进行二次开发。

---

## 场景二：技术架构学习

### 核心架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │ pi CLI (print)  │  │ pi TUI          │  │ pi Web UI           │  │
│  │ (non-interactive)│  │ (interactive)   │  │ (browser component) │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘  │
│           └────────────────────┴──────────────────────┘              │
├─────────────────────────────────────────────────────────────────────┤
│                        Coding Agent Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │ AgentSession    │  │ ExtensionRunner │  │ SessionManager      │  │
│  │ (lifecycle)     │  │ (tools/events)  │  │ (persist/branch)    │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘  │
│           └────────────────────┴──────────────────────┘              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Built-in Tools: read | bash | edit | write | grep | find | ls │  │
│  │ Skills: Markdown frontmatter auto-discovery                  │  │
│  └─────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                        Agent Runtime Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │ Agent class     │  │ AgentLoop       │  │ EventStream         │  │
│  │ (state/queue)   │  │ (ReAct loop)    │  │ (streaming events)  │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘  │
│           │                    │                       │             │
│  ┌────────┴────────────────────┴───────────────────────┴─────────┐  │
│  │  Steering Queue | Follow-up Queue | Tool Execution (parallel) │  │
│  └────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                        Unified LLM API Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │ Provider Registry│  │ Model Registry  │  │ Credential Resolver │  │
│  │ (lazy load)      │  │ (generated)     │  │ (env/settings/OAuth)│  │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘  │
│           └────────────────────┴──────────────────────┘              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 25+ Providers: anthropic | openai | google | zai | kimi | ... │  │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 语言 | TypeScript (Node/Bun) | 运行时性能（vs Rust） | 生态丰富、开发速度快、jiti 免编译、前后端共享 |
| 免编译运行时 | jiti | 静态类型检查的严格性（运行时才报错） | Extension 开发零构建步骤，用户体验极佳 |
| 分层 monorepo | 5 个独立包 | 单一入口的简洁性 | pi-ai 和 pi-agent-core 可被外部复用，不绑定 CLI |
| Lazy provider 加载 | 运行时动态 import | 启动时的类型安全 | 减少启动依赖，避免浏览器环境加载 Node-only 模块报错 |
| Session 持久化 | 追加式日志文件（jsonl） | 数据库查询能力 | 简单、可手动审查、版本化升级（CURRENT_SESSION_VERSION = 3） |
| Compaction 策略 | LLM 生成摘要 + 文件操作追踪 | 精确上下文保留 | 在窗口限制和上下文保留之间取得平衡 |
| Tool schema | TypeBox | Zod | 更轻量、JSON Schema 原生、与 provider 要求对齐 |
| 自动关 issue/PR | Gate 机制 | 开放社区参与 | 作者精力有限，过滤低质量输入，保持核心代码质量 |

### 值得学习的模式

1. **分层 Provider 抽象**：pi-ai 的 `ApiRegistry` + lazy provider module + `streamSimple` 统一接口，是"如何支持 25+ provider 而不让代码爆炸"的教科书。每个 provider 只需实现 `streamXxx` 和 `streamSimpleXxx`，注册时懒加载。

2. **Extension 事件系统**：`ExtensionRunner` 管理事件订阅和拦截，支持 `beforeAgentStart`、`tool_call`、`tool_result` 等 20+ 事件。`block: true` 机制可在事件中间拦截并取消操作（如阻止 rm -rf），这是安全扩展的关键设计。

3. **Session Compaction 的文件追踪**：compaction 不只是生成文本摘要，还追踪 `readFiles` 和 `modifiedFiles`，让 LLM 在压缩后的上下文中仍能知道哪些文件被修改过。这比简单的对话摘要更实用。

4. **MutableAgentState 的 getter/setter 封装**：`Agent.state.messages` 返回的是副本，但赋值时会触发浅拷贝。这种设计既保护了内部状态，又允许外部读取和批量替换。

5. **Faux Provider 测试模式**：测试框架使用自建的 faux provider（假模型）来模拟 LLM 响应序列，不依赖真实 API key。203 个测试文件全部可离线运行，CI 稳定性极高。

6. **环境自适应的 Node/Bun/Browser 兼容**：`env-api-keys.ts` 中用动态 import + `typeof process` 判断来区分 Node 和浏览器环境，确保 pi-ai 在 web-ui 中使用时不会尝试加载 `node:fs`。

### 反模式 / 踩坑点

1. **jiti 免编译的代价**：虽然开发体验好，但 TypeScript 类型错误在运行时才暴露，Extension 开发时没有 tsc 保护。对于大型扩展项目，建议自建 tsconfig 做静态检查。

2. **Bus factor 现实**：虽然 Mario 有长期维护记录，但 90%+ 的提交集中在一人。AGENTS.md 中明确要求"新 issue/PR 自动关闭"，进一步降低了社区参与度。

3. **Extension 权限模型粗粒度**：Extensions 运行满系统权限，虽然有 `block` 机制，但没有沙箱。恶意扩展（或被 LLM 诱导编写的扩展）危害极大。

4. **compaction 的可靠性问题**：Open issue #4046 "Compaction just deletes everything" 说明 compaction 仍有 edge case，长会话下有丢上下文风险。

5. **npm 生态的版本锁定**：monorepo 用 `scripts/sync-versions.js` 手动同步 5 个包的版本号，不是 Changesets 或 Rush 等标准工具，维护成本随包数量增长。

### 可借鉴的具体技术点

- **统一 LLM API 的 provider 注册模式**：如果你需要在自己的工具中支持多模型后端，直接参考 `packages/ai/src/providers/register-builtins.ts` 的 lazy loader 设计。
- **Session 追加式持久化**：`session-manager.ts` 的 jsonl 追加 + 版本化 header + compaction 策略，适合任何需要持久化对话历史的应用。
- **Extension 自动发现机制**：`~/.pi/agent/extensions/*.ts` + `.pi/extensions/*.ts` + `settings.json` 的三层发现路径，可移植到任何插件系统。
- **TypeBox 工具 schema 定义**：`pi.registerTool()` 的参数设计（name/label/description/parameters/execute）是一个清晰的 agent tool 接口规范。
- **测试中的 faux model 模式**：用声明式响应序列替代真实 LLM 调用，大幅降低测试成本和 flakiness。

---

## 架构解剖

### 目录结构

```
pi-mono/
├── packages/
│   ├── ai/                    # 统一 LLM API（25+ provider，model registry）
│   │   ├── src/providers/     # 各 provider 实现（anthropic, openai, google, zai, ...）
│   │   ├── src/models.ts      # Model registry + cost calculation
│   │   ├── src/types.ts       # 核心类型（Api, KnownProvider, ThinkingLevel）
│   │   └── scripts/           # generate-models.ts（自动生成模型目录）
│   ├── agent/                 # Agent 运行时（Agent class, AgentLoop, types）
│   │   ├── src/agent.ts       # Agent 类：state, queue, subscribe, prompt, abort
│   │   ├── src/agent-loop.ts  # ReAct loop：stream → tool call → execute → retry
│   │   └── src/types.ts       # AgentMessage, AgentTool, AgentEvent 等
│   ├── coding-agent/          # Coding Agent CLI + SDK
│   │   ├── src/cli.ts         # CLI 入口（args 解析）
│   │   ├── src/core/
│   │   │   ├── agent-session.ts      # AgentSession：生命周期 + 事件
│   │   │   ├── session-manager.ts    # Session 持久化（jsonl + versioning）
│   │   │   ├── extensions/           # Extension 系统（runner, loader, events）
│   │   │   ├── tools/                # 7 个内置工具实现
│   │   │   ├── compaction/           # Compaction + branch summarization
│   │   │   ├── skills.ts             # Skill 发现与解析
│   │   │   └── bash-executor.ts      # Bash 执行（流式 + 截断 + 临时文件）
│   │   ├── src/modes/
│   │   │   ├── interactive/          # TUI 交互模式
│   │   │   ├── print/                # 非交互模式
│   │   │   └── rpc/                  # JSON-RPC 模式（供其他工具调用）
│   │   ├── test/                     # 203 个测试文件（vitest）
│   │   └── docs/                     # 详细文档（extensions.md, sdk.md, models.md）
│   ├── tui/                   # 终端 UI 库（differential rendering）
│   └── web-ui/                # Web 端 chat UI 组件（Tailwind + Web Components）
├── .github/workflows/         # CI/CD（ci.yml, build-binaries.yml, issue-gate.yml, pr-gate.yml）
├── .pi/                       # 项目自身的 pi 配置、extensions、prompts
├── AGENTS.md                  # 自开发规范（严格的质量要求）
├── CONTRIBUTING.md            # 贡献指南
└── package.json               # Workspace monorepo 定义
```

### 技术栈

- **运行时 / 框架**：Node.js 22+ / Bun，TypeScript 5.9
- **构建**：tsgo（自研/定制的 TypeScript 编译器）、tsc（web-ui）
- **测试**：Vitest（agent/ai/coding-agent），Node --test（tui）
- **Lint/Format**：Biome 2.3.5
- **Schema**：TypeBox 1.1.24
- **TUI**：自研 pi-tui（differential rendering）
- **Web UI**：Web Components + Tailwind CSS

### 模块依赖关系

```
@mariozechner/pi-coding-agent
  ├── @mariozechner/pi-agent-core
  │   └── @mariozechner/pi-ai
  ├── @mariozechner/pi-tui
  └── @mariozechner/pi-ai（peer）

@mariozechner/pi-web-ui
  └── @mariozechner/pi-ai（类型引用）
```

**关键观察**：依赖图是严格的单向 DAG。pi-ai 不依赖任何上层包，pi-agent-core 只依赖 pi-ai，coding-agent 集成所有包。这种分层确保了 pi-ai 和 pi-agent-core 可被独立复用。

### 扩展机制

- **Extension 自动发现**：`~/.pi/agent/extensions/*.ts`（全局）、`.pi/extensions/*.ts`（项目级）、`settings.json` 自定义路径
- **Extension API**：`pi.registerTool()`、`pi.registerCommand()`、`pi.on(event, handler)`、`pi.registerProvider()`
- **事件拦截**：`tool_call` 事件可返回 `{ block: true, reason: "..." }` 阻止执行
- **UI 交互**：`ctx.ui.confirm()`、`ctx.ui.select()`、`ctx.ui.notify()`、`ctx.ui.custom()`（完整 TUI 组件）
- **状态持久化**：`pi.appendEntry()` 向 session 写入自定义 entry，reload 后可恢复
- **包分发**：支持 npm 包和 git 包两种形式的扩展分发

---

## 质量与成熟度

### 代码质量

- **类型系统**：TypeScript 5.9，严格模式。AGENTS.md 明确禁止 `any` 类型和 inline import。
- **错误处理**：统一使用 Error 子类（如 `ExtensionError`），异步错误通过 event 传播。
- **代码风格一致性**：Biome 统一格式化 + lint，CI 中 `npm run check` 强制执行。
- **AGENTS.md 质量**：可能是见过的最严格的 AI 开发规范之一，涵盖代码风格、测试要求、Changelog 格式、issue/PR 流程，甚至包括 tmux 测试 TUI 的脚本。

### 测试

- **测试框架**：Vitest（3 个主要包），globals 模式，30 秒超时
- **测试数量**：203 个 `.test.ts` 文件
- **测试类型**：
  - 单元测试：工具函数、session 管理、compaction 逻辑
  - 集成测试：AgentSession 全流程（使用 faux provider）
  - E2E 测试：TUI 行为、CLI 参数解析、session 树导航
  - Regression 测试：`test/suite/regressions/<issue-number>-*.test.ts`
- **Mock 策略**：faux provider 模拟 LLM 响应，不依赖真实 API，CI 100% 离线

**评价**：测试策略非常成熟。faux provider 的设计尤其值得称赞，解决了 agent 工具测试依赖外部 API 的普遍难题。

### CI/CD

- **流水线配置**：
  - `ci.yml`：install → build → check → test
  - `build-binaries.yml`：编译 Bun 二进制分发包
  - `issue-gate.yml` / `pr-gate.yml`：自动关闭新贡献者的 issue/PR
  - `approve-contributor.yml`：maintainer 评论 `lgtm`/`lgtmi` 后解锁贡献者
- **发布流程**：`npm run release:patch/minor/major` → 自动同步版本号 → tag → publish
- **版本管理**：`scripts/sync-versions.js` 同步 5 个包的版本号，`scripts/release.mjs` 驱动发布

### 文档质量

- **API 文档**：每个包的 `docs/` 目录有详细文档（extensions.md 200+ 行、sdk.md、models.md、session.md、skills.md）
- **教程/指南**：README 简洁，但 coding-agent/docs/ 中有完整的使用指南和 SDK 示例（13 个示例文件）
- **Changelog**：每个包有独立的 CHANGELOG.md，格式规范（Unreleased → Breaking Changes/Added/Changed/Fixed/Removed）
- **AGENTS.md**：不仅规范人类开发者，也规范 AI agent 的行为，质量极高

### Issue/PR 健康度

- **Open Issues**：仅 10 个（截至 2026-05-01），管理极其严格
- **Issue 响应**：低质量 issue 被 gate 自动关闭，maintainer 每日 review 被关闭的 issue
- **PR 合并节奏**：外部 PR 极少（gate 机制），核心代码由 maintainer 直接维护
- **Breaking change**：从 v0.1 到 v0.71，快速迭代但无重大破坏性变更公开记录

---

## 社区与生态

### 社区评价

- **GitHub 声量**：43.4k stars，在 coding agent 开源项目中仅次于 Aider（44.2k）和 Cline（61.2k），但远超大多数同类产品。
- **作者背书**：Mario Zechner（badlogic）是 libGDX（20k+ stars）的创造者，在 Java 游戏开发和开源社区有极高声誉。这解释了项目初期的快速涨星。
- **讨论氛围**：Discord 社区（shield badge 显示）+ X 上的技术分享。由于 issue/PR gate，技术讨论更多在 Discord 或 X 上进行。

### 衍生项目 / 插件生态

- **pi-chat**：`earendil-works/pi-chat` — Slack bot 封装（官方文档提及）
- **pi-share-hf**：`badlogic/pi-share-hf` — 将 pi 的会话分享到 Hugging Face（用于公开训练数据）
- **Hugging Face 数据集**：`badlogicgames/pi-mono` — 作者公开自己的工作会话数据
- **Extension 示例**：官方提供了 subagent、custom-provider、sandbox、with-deps 等多个扩展示例
- **无大规模第三方生态**：由于项目较新（2025-08 创建）且 gate 机制严格，第三方扩展生态尚在萌芽

### 竞品对比

| 项目 | 语言 | Stars | 开源 | 核心差异 |
|------|------|-------|------|---------|
| **pi-mono** | TypeScript | 43k | ✅ MIT | Extension SDK + Session 树 + 25+ provider |
| Claude Code | TS/Python | 120k | ❌ | 官方最佳模型支持、闭源、无法扩展 |
| Codex CLI | Rust/TS | 79k | ❌ | OpenAI 生态深度集成、Codex 模型独占 |
| Cline | TypeScript | 61k | ✅ MIT | VS Code 插件形态、IDE 集成最深 |
| Aider | Python | 44k | ✅ Apache | Git 集成最强、多模型、成熟稳定 |
| jcode | Rust | 新 | ✅ MIT | 性能极致、Swarm、本地 Memory、单作者 |

---

## 关键代码走读

### 1. Agent 类（Agent 运行时的状态机）
- **路径**：`packages/agent/src/agent.ts`
- **职责**：管理 Agent 状态、事件订阅、steering/follow-up 队列、工具执行策略
- **实现要点**：
  - `MutableAgentState` 用 getter/setter 做浅拷贝保护
  - `PendingMessageQueue` 支持 `all` 和 `one-at-a-time` 两种 drain 模式
  - `subscribe()` 返回 unsubscribe 函数，listener 按订阅顺序 await
  - `toolExecution` 策略：`parallel` 或 `sequential`

### 2. Agent Loop（ReAct 循环）
- **路径**：`packages/agent/src/agent-loop.ts`
- **职责**：将 AgentMessage 转为 LLM Message，流式处理响应，执行 tool call
- **实现要点**：
  - `agentLoop()` 启动新 turn，`agentLoopContinue()` 用于 retry/continue
  - `EventStream<AgentEvent, AgentMessage[]>` 统一事件和终止消息
  - `convertToLlm` 在调用边界处转换，Agent 内部始终使用 `AgentMessage`

### 3. Session Manager（持久化与版本化）
- **路径**：`packages/coding-agent/src/core/session-manager.ts`
- **职责**：Session 的创建、加载、持久化、entry 追加
- **实现要点**：
  - `CURRENT_SESSION_VERSION = 3`，支持从旧版本迁移
  - Entry 类型：message / compaction / branch_summary / custom / label / session_info / thinking_level_change / model_change
  - 追加式 jsonl 文件，appendFileSync 保证原子性

### 4. Compaction（上下文压缩）
- **路径**：`packages/coding-agent/src/core/compaction/compaction.ts`
- **职责**：长 session 的上下文压缩，保留关键信息
- **实现要点**：
  - 提取文件操作历史（readFiles / modifiedFiles）存入 CompactionEntry.details
  - 用 LLM 生成对话摘要，但保留文件操作追踪
  - `buildSessionContext()` 构建 LLM 上下文时自动跳过被 compaction 替代的历史

### 5. Extension Runner（扩展系统）
- **路径**：`packages/coding-agent/src/core/extensions/runner.ts`
- **职责**：加载、运行、事件分发给 extensions
- **实现要点**：
  - `ExtensionRunner` 管理所有已加载 extension 的 event handler
  - 事件处理按注册顺序串行执行，前一个 handler 的 `block: true` 会终止后续
  - Async factory function 支持 extension 的异步初始化（如远程配置获取）

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | ⭐⭐⭐⭐⭐ | CLI/TUI/Web UI、25+ provider、Extension SDK、Session 树、Subagent、Skills，覆盖极全 |
| 代码质量 | ⭐⭐⭐⭐⭐ | TypeScript 严格模式、Biome 强制、AGENTS.md 规范、faux provider 测试模式，质量极高 |
| 文档质量 | ⭐⭐⭐⭐⭐ | 每个包独立 docs/、CHANGELOG、AGENTS.md、13 个 SDK 示例，文档体系完整 |
| 社区活跃度 | ⭐⭐⭐ | 43k stars 极高，但 gate 机制导致外部参与极低，几乎无第三方生态 |
| 架构设计 | ⭐⭐⭐⭐⭐ | 分层 monorepo、lazy provider、Extension 事件系统、Session compaction，设计精妙 |
| 学习价值 | ⭐⭐⭐⭐⭐ | Provider 抽象、Agent 状态机、Session 持久化、Extension 拦截模式，均有高学习价值 |
| 可借鉴度 | ⭐⭐⭐⭐⭐ | pi-ai 和 pi-agent-core 可直接作为 SDK 复用，Extension 模式可移植到任何工具 |

**总分：33/35（94%）**

---

## 总结

### 一句话评价

> **pi-mono 是当前开源 Coding Agent 领域工程完成度最高、架构分层最清晰、扩展机制最先进的项目。它把"好用的 CLI 工具"和"可二次开发的 Agent SDK"这两个通常矛盾的目标，通过严格的 monorepo 分层和 Extension 系统同时实现了。**

### 谁应该用

- **个人开发者**：需要替代 Claude Code/Codex CLI 的开源方案，且希望自定义行为
- **团队/企业**：想把 Agent 能力嵌入内部工具、CI/CD、IDE 插件或 Web 服务
- **多模型用户**：需要在不同 provider 间自由切换（如国内 GLM + 国外 Claude 混合使用）
- **TypeScript 生态开发者**：已经在 Node/Bun 栈中，希望复用现有工程能力
- **AI Agent 研究者**：想研究现代 Agent 运行时、Session 管理、Provider 抽象的参考实现

### 谁不应该用

- **纯 Rust/Python 栈团队**：引入 Node.js 生态有额外成本
- **需要 IDE 深度集成**：Cline/Continue 在 VS Code 中体验更好
- **追求极致性能**：jcode（Rust）内存占用更低
- **需要本地 RAG/Memory**：pi-mono 是纯 LLM 驱动，无 embedding 能力
- **希望活跃参与开源社区**：gate 机制下外部贡献几乎不可能

### 下一步

1. **短期（1-2 周）**：本地安装 `npm install -g @mariozechner/pi-coding-agent`，配置 GLM/ZAI provider，试用 Extension 开发一个内部工具扩展
2. **中期（1-3 个月）**：基于 `pi-agent-core` + `pi-ai` 搭建一个内部 Agent HTTP 服务（参考 SDK 示例 13-session-runtime.ts），验证作为团队底座的可行性
3. **长期（3-6 个月）**：若团队有 VS Code 需求，可基于 `pi-web-ui` 开发插件；若有自动化需求，可用 RPC 模式集成到 CI 流水线
4. **架构学习**：重点阅读 `packages/ai/src/providers/register-builtins.ts`（provider 注册）、`packages/agent/src/agent.ts`（状态机）、`packages/coding-agent/src/core/session-manager.ts`（持久化设计）
