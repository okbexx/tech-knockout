# jcode

> 一句话定位：**Rust 编写的 terminal-first Coding Agent runtime：以高性能 TUI 为交互面，以 server-owned live session 为运行骨架，内置工具注册、流式 turn 状态机、Swarm 多 Agent 协作、本地 Graph Memory 与多 provider/OAuth 接入。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `1jehuang/jcode` |
| URL | `https://github.com/1jehuang/jcode` |
| Star | 7,055（截至 2026-06-15） |
| Fork | 790 |
| 许可证 | MIT |
| 语言 | Rust |
| 默认分支 | `master` |
| 首次提交 | 2026-01-05 |
| 最近提交 | 2026-06-14 `c7463d56 chore(release): bump version to 0.28.0` |
| 最新 Release | v0.28.0（2026-06-15） |
| Open Issues / PRs | 89 issues / 3 PRs（分别查询 `/issues` 与 `/pulls`，不混用 GitHub `open_issues_count`） |
| 本地规模 | 69 个 workspace members，956 个 Rust 文件，约 544,723 行 Rust |
| 贡献者 | 本地 `git shortlog` 显示 4,620 commits 分布在 3 个 Git identity：`jeremy` 4,187、`1jehuang` 393、`Jeremy Huang` 40；实质 bus factor 高度集中 |
| 分析日期 | 2026-06-15 |

---

## 场景一：是否值得采用

### 解决的问题

jcode 解决的是 **“把 Claude Code / Codex CLI 式终端 Agent 体验，推进到一个本地高性能、可长期运行、可多客户端/多会话协作的 Rust runtime”** 的问题。

它不是只做一个 prompt loop，也不是只做一个漂亮 TUI。当前源码里更核心的部分是：

1. **流式 Agent turn 状态机**：provider stream、reasoning、tool call、tool result、token usage、compaction、重试与中断都在 `run_turn_streaming_mpsc` 内显式推进。
2. **server-owned live session**：server 维护 session → live `Agent` 的映射，支持普通客户端、debug client、gateway client、后台任务、reload recovery 与 swarm wake。
3. **多 Agent Swarm 协作**：通过 server 侧 member 状态、channel subscription、event history、completion report，把多个 agent 放进同一 repo/任务空间协作。
4. **本地记忆系统**：embedding hit 不是直接注入，而是进入 graph/cascade retrieval，再可经 sidecar / listwise rerank 做相关性筛选。
5. **多 provider 与工具面**：Claude/OpenAI/Gemini/Copilot/Azure/Alibaba Coding Plan/Fireworks/MiniMax/LM Studio/Ollama/OpenAI-compatible 等登录与运行路径，叠加 MCP、web、file、bash、task、memory、skill、side_panel 等工具。

目标用户：

- 想要一个 **Rust 单二进制 / terminal-first / 高性能** coding agent 的高级开发者。
- 需要在同一代码库里同时跑多个 agent、互相通知、互相通信的重度 Agent 用户。
- 想研究 **turn runtime、server lifecycle、memory retrieval、swarm coordination** 的工程团队。
- 想借鉴“官方终端 Agent”相邻架构（thin CLI + thick core + provider boundary + tool invocation + safety/recovery stack）的系统设计者。

### 核心能力与边界

- **能做什么：**
  - 交互式 TUI coding agent：文件读写、patch/edit、bash、grep/glob/ls、browser/webfetch/websearch、LSP、PDF、gmail、todo、task/subagent、side panel、skill、session search、MCP 等工具。
  - 多入口/多客户端：root crate 负责 CLI startup，`jcode-tui` re-export app core；server 支持普通 client、debug client、gateway client；desktop/mobile 相关 crate 已进入 workspace。
  - 多 provider：内置 OAuth / provider profile / OpenAI-compatible 配置，README 覆盖 Claude、OpenAI/Codex、Gemini、Copilot、Azure、Alibaba Coding Plan、Fireworks、MiniMax、LM Studio、Ollama、本地 vLLM 等路径。
  - 持久会话：`Session` 保存消息、compaction 状态、provider session id/provider key、model/route/reasoning effort、env snapshots、memory injections、replay events、active pid/status 等。
  - 流式执行：`run_turn_streaming_mpsc` 处理 reasoning delta、text delta、tool use start/input/end、native tool call、generated image、token usage、retry rollback、context-limit compaction、payload-too-large recovery。
  - Swarm：server 统一维护 `SwarmMember`、swarms_by_id、event_history、channel subscriptions、shared context、file touch 服务和成员状态。
  - Graph Memory：`MemoryGraph` 以 memory/tag/cluster 节点和 `HasTag`/`RelatesTo`/`Supersedes`/`Contradicts`/`DerivedFrom` 边组织记忆，并支持 BFS cascade retrieval。

- **不能做什么 / 尚不稳定处：**
  - 不是企业团队协作 SaaS；它更像本地/个人/小团队 PoC 的 agent runtime。
  - 外部插件生态仍弱。虽然 MCP、skills、工具 registry 都存在，但与 OpenCode 的 plugin/HTTP ecosystem 或 Pi（原 pi-mono）的 Extension SDK 相比，第三方扩展面还不成熟。
  - bus factor 高：提交高度集中在作者 Jeremy Huang 多个 Git identity 上；项目非常活跃，但维护风险和 reviewer 缺口都要计入。
  - 功能面增长很快，报告时 v0.28.0；breaking change、配置迁移、provider 行为兼容仍需跟踪。
  - 本次本地环境没有 `cargo`/`rustc`，无法在当前机器上实际跑 `cargo test` 或 build；测试/CI 评价基于源码和 GitHub Actions 配置。

- **与竞品差异：**

  | 维度 | jcode | OpenCode | Pi（原 pi-mono） | Aider / Cline / Continue |
  |------|-------|----------|---------|--------------------------|
  | 主要形态 | Rust terminal runtime + TUI + server | 多入口 durable coding-agent runtime | TypeScript Agent CLI + SDK/Extension | Git patch CLI / IDE 插件 / 企业 IDE 上下文 |
  | 核心强项 | 本地性能、live session、Swarm、Graph Memory、reload recovery | Event/Projection、HTTP/SDK、插件/MCP、多入口 | Provider SDK、Extension、Session tree、轻量嵌入 | 成熟使用路径或 IDE 集成 |
  | 状态模型 | JSON/session journal + provider session + compaction + replay/memory injection | SQLite/Event/Projection | jsonl/session tree | 多为文件/Git/IDE 状态 |
  | 工具结算 | provider stream → tool calls → registry.execute → persisted tool_result | durable event 后 settlement | TypeBox tools + extension events | 各自工具机制 |
  | 多 Agent | Swarm 是核心卖点 | task/subagent/runtime 能力强 | subagent 编排 | 通常较弱或依赖宿主 |
  | 采用风险 | 高速演进 + bus factor | backlog 巨大 + runtime 复杂 | 作者集中 + gate 高 | 各自生态/锁定风险 |

### 集成成本

- **运行时与依赖：** Rust workspace，当前根 `Cargo.toml` 约 69 个 members，默认 feature 包含 `pdf` 与 `embeddings`。源码规模已达约 54.5 万行 Rust；二次开发需要理解 `jcode-base`、`jcode-app-core`、`jcode-tui`、provider crates、tool crates、session/memory/server 模块。
- **部署复杂度：** 对终端用户，README 和 Release 提供单二进制/安装脚本/Homebrew/AUR 等路径；对开发者，workspace 大、依赖多、CI matrix 重，首次 build 成本高。
- **学习曲线：** 使用层中高；Swarm、memory、MCP、provider profile、server/live session 都需要心智。源码学习层很高，但架构收益也很高。
- **从零到 smoke：** 若只下载 release 并配置 provider，理论上 10–20 分钟；若源码构建，需要 Rust toolchain、平台依赖和较长编译时间。


### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键库 / SDK。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| _待补关键依赖_ | | | | | | |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | ✅ | MIT，根仓库许可清晰 |
| Bus factor | 🔴 高 | 本地 4,620 commits 高度集中在作者多 Git identity 上；缺少多人 reviewer 信号 |
| 供应商锁定 | 🟢 低 | provider 覆盖广，OpenAI-compatible、本地 Ollama/LM Studio/vLLM、MCP 都降低锁定 |
| 维护趋势 | 🟢 活跃 / 🟡 集中 | 2026-01 到 2026-06 已 28 个 release 左右，最近 release v0.28.0；但维护压力集中 |
| Backlog 压力 | 🟡 中 | 89 open issues / 3 open PRs；远低于 OpenCode 的 backlog，但项目仍新 |
| 体验稳定性 | 🟡 中 | 代码里大量 reload/context/payload recovery 说明作者在补真实运行故障面；高频迭代仍会带 regression 风险 |
| 安全边界 | 🟡 中偏高 | coding agent 天然拥有 shell/file/web/MCP 副作用；需要隔离 workspace、最小权限 provider key、审计工具调用 |
| 企业生产化 | 🟡 观望 | 缺少多租户、企业审计、权限治理与稳定扩展生态；更适合个人/小团队隔离 PoC |

### 结论

**🟢 推荐个人/高级开发者隔离试用；🟡 团队生产化前观望。**

理由：

- 技术密度非常高：server-owned live session、streaming turn 状态机、Graph Memory、Swarm、compaction/reload recovery 都是下一代 terminal agent 的关键问题。
- 对个人工具而言，jcode 已经不是“玩具项目”：Release、CI、Windows/macOS/Linux artifact、Homebrew/AUR、provider login、MCP、memory、swarm 都在快速成型。
- 对团队生产而言，最大问题不是功能不够，而是 **维护集中 + 安全边界 + 高速演进**。建议在隔离仓库、容器或专用 workspace 中试用，避免直接给核心生产仓库和高权限密钥。
- 架构学习价值极高：如果要研究“Rust 怎么写 terminal coding agent runtime”，jcode 比许多功能清单型项目更值得读。

---

## 场景二：技术架构学习

### 核心架构图

```text
┌──────────────────────────────────────────────────────────────────────┐
│                          Client / Presentation                       │
│ CLI startup · TUI · desktop/mobile crates · gateway/debug clients     │
│ src/main.rs → jcode::run() → cli::startup::run()                      │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                         Server / Live Runtime                        │
│ jcode-app-core/src/server/*                                           │
│ - ServerRuntime: sessions, client connections, swarm state            │
│ - live_turn: server-initiated wake/background/reload turns             │
│ - client_lifecycle: client message stream handling                     │
│ - swarm_*: member state, channels, event history, persistence          │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                         Agent Turn Runtime                           │
│ jcode-app-core/src/agent/*                                            │
│ run_once_streaming_mpsc                                               │
│   → add user message + save session                                   │
│   → run_turn_streaming_mpsc loop                                      │
│   → provider.complete_split(stream)                                   │
│   → text/reasoning/tool/native events                                 │
│   → persist assistant/tool results                                    │
│   → continue / compact / recover / stop                               │
└───────────────┬───────────────────────┬──────────────────────────────┘
                │                       │
┌───────────────▼──────────────┐ ┌──────▼──────────────────────────────┐
│ Tool / Effect Plane           │ │ Provider / Model Plane              │
│ Registry + ToolContext        │ │ Provider trait + provider crates     │
│ read/write/edit/bash/MCP/...  │ │ Claude/OpenAI/Gemini/Copilot/...    │
│ permission/session policies   │ │ split system prompt + cache events   │
└───────────────┬──────────────┘ └──────┬──────────────────────────────┘
                │                       │
┌───────────────▼───────────────────────▼──────────────────────────────┐
│                    Persistent Context / Recovery Plane                │
│ Session JSON/journal · provider_session_id · compaction state         │
│ MemoryGraph + sidecar + listwise rerank · replay events               │
│ reload recovery · active pid/crash detection · runtime memory logs    │
└──────────────────────────────────────────────────────────────────────┘
```

### 底层技术架构

#### 最小架构内核

脱掉 README、安装脚本和 TUI 样式后，jcode 的最小可复刻内核是：

> **Session Journal + Provider Streaming Adapter + Turn State Machine + Tool Registry/Settlement + Event Fanout + Compaction/Reload Recovery + Nonblocking Memory Retrieval + Swarm Membership Bus**

这里的关键不是 Rust 或 Ratatui 本身，而是：每一次模型调用都被放进一个可恢复、可观测、可重放的 turn 状态机；工具副作用不散落在 UI 层；server 可以在没有客户端新消息的情况下唤醒 live session；memory 和 compaction 都以“不要阻塞主 turn”为原则接入。

#### 核心抽象

| 抽象 | 源码位置 | 职责 | 关键字段 / 方法 | 为什么重要 |
|------|----------|------|-----------------|------------|
| `Agent` | `crates/jcode-app-core/src/agent.rs` + `agent/*` | 单个会话的执行主体 | `run_once_streaming_mpsc`、`run_turn_streaming_mpsc`、`messages_for_provider`、`tool_definitions` | 把 provider stream、tool loop、memory、compaction、session save 收敛到一个运行原子 |
| `Session` | `crates/jcode-base/src/session.rs` | 持久会话聚合根 | `messages`、`compaction`、`provider_session_id`、`provider_key`、`model`、`route_api_method`、`memory_injections`、`replay_events`、`status` | 让 reload/resume/rewind/provider session 复用成为可能 |
| `Registry` | `crates/jcode-app-core/src/tool/mod.rs` | 工具注册与执行入口 | `tools: HashMap<String, Arc<dyn Tool>>`、`skills`、`compaction`、`execute` | 将 read/write/bash/MCP/web/task/skill 等外部副作用统一成模型可调用契约 |
| `ToolContext` | `jcode_tool_core` re-export 于 `tool/mod.rs` | 工具执行上下文 | `session_id`、`message_id`、`tool_call_id`、`working_dir`、`stdin_request_tx`、`graceful_shutdown_signal`、`execution_mode` | 工具不直接依赖 UI 或全局状态，便于 server/headless/subagent 复用 |
| `ServerRuntime` | `crates/jcode-app-core/src/server/runtime.rs` | 多客户端与 live session runtime | `sessions`、`event_tx`、`swarm_state`、`shared_context`、`file_touch`、`channel_subscriptions`、`shutdown_signals` | 把“一个终端进程”升级成“可被多客户端/后台任务驱动的会话服务” |
| `LiveTurnSwarmContext` | `crates/jcode-app-core/src/server/live_turn.rs` | server-initiated turn 的 swarm bookkeeping | `members`、`swarms_by_id`、`event_history`、`event_counter`、`event_tx` | 背景任务完成、swarm DM、reload recovery 也能像用户输入一样进入完整 turn 生命周期 |
| `MemoryGraph` | `crates/jcode-memory-types/src/graph.rs` | 图式记忆存储与检索 | `memories`、`tags`、`clusters`、`edges`、`reverse_edges`、`cascade_retrieve` | 比纯向量检索多了 tag/关系/替代/冲突/衍生边，可做多跳召回 |
| `MemoryAgentHandle` | `crates/jcode-base/src/memory_agent.rs` | 异步记忆代理通信句柄 | `update_context_sync_with_dir`、`Reset`、channel capacity、turn extraction constants | Memory 作为 side agent 非阻塞运行，不把每个 turn 变成同步 RAG 延迟 |
| `CompactionManager` integration | `crates/jcode-app-core/src/agent/compaction.rs` | 上下文压缩和错误恢复 | `try_auto_compact_after_context_limit`、`try_recover_after_payload_too_large`、provider session reset | 长会话真实故障不是“报错结束”，而是可降级、可缩减、可 retry |

#### 控制面 / 数据面

- **控制面：**
  - CLI startup、server accept loop、client lifecycle、provider/model selection、tool policy、Swarm member 状态、channel subscription、reload recovery、compaction trigger、memory relevance trigger。
  - `ServerRuntime` 决定哪个 session 被哪个客户端/后台事件唤醒；`Agent` 决定是否继续下一 turn、是否 compact、是否处理 soft interrupt。
  - `Registry` 装配工具定义，session-level policy 控制 allowed/disabled tools。

- **数据面：**
  - provider stream：`provider.complete_split(...)` 真实调用模型并产生 `StreamEvent`。
  - tool side effect：`registry.execute(tool_name, input, ToolContext)` 执行文件、shell、MCP、web、browser、task、memory 等副作用。
  - persistent write：`Session.save()`、session journal、memory graph、runtime memory log、swarm persistence。
  - UI/event fanout：`ServerEvent::{TextDelta, ReasoningDelta, ToolStart, ToolDone, TokenUsage, Done, Error}` 推给 TUI/gateway/debug clients。

这种分离的价值是：TUI 可以换，transport 可以换，provider 可以换；但 Agent turn、Session 状态和 Tool settlement 不需要重写。

### 关键执行链路

#### 1. 用户输入 → 单 turn 流式执行

```text
client sends message
  ↓
client_lifecycle::process_message_streaming_mpsc
  ↓
Agent::run_once_streaming_mpsc(user_message, images, system_reminder, event_tx)
  ↓
add user Message + Session.save()
  ↓
Agent::run_turn_streaming_mpsc(event_tx)
  ↓
messages_for_provider + memory prompt nonblocking + split system prompt
  ↓
provider.complete_split(messages, tools, static_prompt, dynamic_prompt, resume_session_id)
  ↓
consume StreamEvent: reasoning/text/tool/native/image/token/session/error
  ↓
persist assistant message + token usage + provider_session_id
  ↓
execute tool calls or break / continue / compact / recover
```

关键点：`run_turn_streaming_mpsc` 是一个显式 loop，不是“一次 LLM 调用后就结束”。它会在工具结果、图像上下文、soft interrupt、compaction recovery 后决定是否继续下一轮 provider call。

#### 2. 工具调用 → settlement → continuation

```text
StreamEvent::ToolUseStart / ToolInputDelta / ToolUseEnd
  ↓
组装 ToolCall + refresh intent
  ↓
assistant message 写入 ToolUse block
  ↓
for each tool call
  ↓
validation_error? → 写 ToolResult error
  ↓
ToolContext(session_id, message_id, tool_call_id, working_dir, shutdown_signal, mode)
  ↓
Registry::execute(tool_name, normalized_input, ctx)
  ↓
ServerEvent::ToolDone + Role::User ToolResult
  ↓
Session.save()
  ↓
如果有 continuation 条件，进入下一次 provider call
```

关键点：工具输出会被持久化为后续 provider 可见的 `ToolResult`，并且有输出截断保护（`MAX_TOOL_OUTPUT_CHARS_FOR_HISTORY = 512 * 1024`），避免大日志污染 session history 和 prompt cache。

#### 3. server-initiated live turn

```text
background completion / swarm DM / scheduled wake / reload recovery
  ↓
run_live_turn_if_idle(session_id, message, system_reminder, sessions, swarm)
  ↓
idle_live_agent: session 有 live attachment 且 Agent lock idle
  ↓
spawn_tracked_live_turn
  ↓
update member status: running
  ↓
process_message_streaming_mpsc(agent, message, ..., event_tx)
  ↓
成功：status ready + completion report + ServerEvent::Done { id: 0 }
失败：status failed + ServerEvent::Error { id: 0 }
```

关键点：这解决了“不是用户直接输入，但 agent 应该继续跑”的状态一致性问题。背景 wake、swarm 通知和 reload recovery 不再是旁路逻辑，而是进入同一条 live turn 生命周期。

#### 4. Memory retrieval / injection

```text
turn messages snapshot
  ↓
build_memory_prompt_nonblocking_shared
  ↓
使用上一轮 pending memory，异步触发下一轮 relevance/extraction
  ↓
MemoryManager / MemoryGraph:
  embedding seeds → cascade_retrieve(seed_ids, scores, depth, max_results)
  ↓
可选 sidecar/listwise rerank：hybrid order → LLM JSON ranking
  ↓
MemoryInjected event + memory as user suffix
  ↓
provider call
```

关键点：Memory 是“非阻塞后缀”，不是每个 turn 都同步等 RAG。`memory_rerank.rs` 明确记录了 listwise rerank 的 benchmark 口径：hybrid pool recall 高但排序弱，LLM listwise rerank 将 recall@5 从 0.53 提到 0.75、precision@5 从 0.23 提到 0.35。

### 状态模型

| 状态类型 | 位置 | 谁读写 | 生命周期 / 一致性规则 |
|----------|------|--------|------------------------|
| 会话持久状态 | `crates/jcode-base/src/session.rs` + session storage/journal | `Agent`、server/session admin、resume/rewind/crash recovery | 用户/assistant/tool/memory/replay/env 状态持久化；provider session reset 会同步清理 agent 与 session 字段 |
| 运行时 live session | `ServerRuntime.sessions: HashMap<String, Arc<Mutex<Agent>>>` | server accept loop、client lifecycle、live_turn | 一个 session 可被 live client/gateway/debug 驱动；Agent lock 表示当前是否 idle |
| 工具注册状态 | `Registry.tools` + session tool policy | Agent/tool system/MCP reload | base tools 用 `OnceLock` 共享，session clone 有独立 compaction manager；MCP 工具变化会 unlock tool list |
| Swarm 状态 | `SwarmState`、members、swarms_by_id、event_history、channel subscriptions | server swarm modules、communicate tool、live_turn | member 状态 running/ready/failed/completed，事件进入 history 并 fanout；可 snapshot/persist |
| Memory 状态 | `MemoryGraph`、project/global memory store、sidecar stats | memory agent、memory tools、turn injection | embedding seeds + graph cascade + rerank；extraction 可在 topic change/periodic/session end 触发 |
| Compaction 状态 | `Session.compaction` + `CompactionManager` | Agent turn loop | 手动/自动 compaction 后 reset cache/tool lock/provider session；context limit/payload too large 可 retry |
| 外部状态 | 文件系统、shell 进程、MCP server、provider upstream session、OAuth token store | tool execution/provider/auth modules | 通过 ToolContext/provider session id 接入；必须用隔离 workspace 和最小权限治理 |

### 契约边界

- **内部契约：**
  - `Provider` 输出统一 `StreamEvent`；Agent 不关心 Anthropic/OpenAI/Gemini/Copilot 的底层协议差异。
  - `Tool` 通过 name/schema/execute 与 `ToolContext` 接入；工具执行必须返回 `ToolOutput`，错误成为 tool result 或 `ServerEvent::Error`。
  - `Session` 负责 provider-visible messages、visible conversation messages、compaction state、replay images 等 render/persistence 语义。

- **外部 CLI / API / MCP 契约：**
  - CLI 支持 login/provider add/run/TUI/server/headless/debug 等路径；MCP config 分 global `~/.jcode/mcp.json` 和 project-local `.jcode/mcp.json`。
  - OpenAI-compatible provider profile 可写 `~/.jcode/config.toml` 和 provider env file；README 也暴露 `extra_body` 等非标准 provider 兼容口。
  - Release artifacts 覆盖 Linux/macOS/Windows x64/aarch64，并生成 checksums；Homebrew/AUR 更新在 release workflow 中。

- **Agent-facing 契约：**
  - `AGENTS.md`、skills、tool descriptions、system prompt split、memory injection prompt、`<system-reminder>` 识别，都服务于让模型在统一规则下使用能力。
  - Swarm/communicate tools 提供 agent 之间 DM/broadcast/channel/share/await 的协作协议。

### 失败与降级模型

| 失败类型 | 检测方式 | 系统行为 | 降级 / 修复动作 |
|----------|----------|----------|------------------|
| provider context limit | error string 包含 context length/window/tokens 等 | `try_auto_compact_after_context_limit` | hard compact、reset cache/tool lock/provider session、retry；超过 retry limit 才失败 |
| request payload too large / 413 | `is_request_payload_too_large_error` | 识别为 body byte-size，而不是 token 问题 | strip oversized inline images，reset compaction/provider session 后 retry |
| OpenAI native compaction 内容过大 | OpenAI encrypted content too large error | 尝试 discard oversized native compaction | 同步 compaction state 并 retry |
| mid-stream transient retry | `StreamEvent::RetryRollback` | 清空本次 partial text/tool/reasoning/image 状态 | 通知 client rollback，进入 retrying phase |
| graceful shutdown / reload | shutdown signal during stream/tool | 文本追加 reload marker 或跳过工具并写 tool_result | session save，live turn 可由 reload recovery/continuation 恢复 |
| tool missing output | turn 前 `repair_missing_tool_outputs` | 补齐历史里的 missing tool output | 避免 provider API 要求 tool_use 后必须紧跟 tool_result 被破坏 |
| tool validation error | `ToolCall::validation_error` | 发送 ToolDone error，写入 Role::User ToolResult error | 不执行副作用，继续保持消息历史合法 |
| memory rerank LLM 失败 | transport error / no parseable JSON array | 记录日志 | fallback hybrid order；只有真实 `[]` 才表示“没有相关 memory” |
| live turn 失败 | `spawn_tracked_live_turn` result Err | member status failed + terminal Error event | attached client 能收敛 UI 状态，不会卡在 running |

### 可复刻设计不变量

1. **每个 turn 必须是可恢复的状态机**：provider stream、tool call、tool result、usage、errors 都要有显式状态，不要藏在 UI callback。
2. **工具副作用必须有 settlement 边界**：模型提出 tool use 不等于副作用已完成；执行、错误、截断、跳过都要写回 history。
3. **server wake 与 user prompt 应走同一条 turn 生命周期**：背景任务、swarm DM、reload recovery 不能成为旁路。
4. **长会话失败应优先 recovery，而不是 fail-fast**：context limit、payload too large、provider native compaction 问题都要有可观测 retry 策略。
5. **Memory 检索不要阻塞主 turn**：上一轮 pending + 下一轮异步计算，比每次同步 RAG 更适合交互式 coding agent。
6. **Memory 排序要区分“检索到”和“值得注入”**：embedding/hybrid 负责召回，listwise rerank/precision mode 负责减少噪声。
7. **provider session id 是状态，不是缓存细节**：rewind、clear、compaction、payload recovery 后必须同步 reset。
8. **工具输出必须有历史预算**：大日志要截断并提示用户重定向到文件，保护协议、session history 和 prompt cache。
9. **Swarm 必须有 member 状态与终端事件**：否则 coordinator/attached UI 无法判断 worker 是否真正完成。
10. **性能优化要进入产品结构**：jemalloc/glibc arena、opt-level、sidecar、render crate、base tool OnceLock 不是微调，而是长运行 agent 的可用性基础。

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 语言 | Rust | Python/TS 的迭代速度和生态脚手架 | 单二进制、内存控制、长期 server/TUI 性能、跨平台 artifact |
| UI 形态 | terminal-first TUI | Web/IDE 的低学习成本 | 远程开发/SSH/键盘驱动更适合重度 coding agent |
| runtime 形态 | server-owned live session | 简单单进程 prompt loop | 支持多客户端、gateway/debug、background wake、swarm、reload recovery |
| memory | Graph Memory + embedding + sidecar + rerank | 纯向量库的简单实现 | 需要关系、多跳、替代/冲突、项目级记忆和注入精度 |
| tool system | 内置工具 registry + MCP/skills | 完全开放插件生态 | 先保证核心工具体验和协议一致性，再扩展外部生态 |
| provider 接入 | 多 provider + OAuth + OpenAI-compatible profile | 单 provider 的简单性 | 降低供应商锁定，复用用户已有订阅/本地模型 |
| release | 多平台二进制 + Homebrew/AUR | 只发源码包 | terminal 工具要像产品一样安装和更新 |
| compaction/recovery | 自动硬压缩/strip image/retry | 错误透明但用户手动处理 | coding agent 长会话里“能恢复”比“错误纯净”更重要 |

### 值得学习的模式

1. **streaming turn as reducer**：把 provider 的异步 stream 规约成内部状态、client event、persistent message 三类输出。
2. **live turn unification**：所有非用户输入触发的执行（background/swarm/reload）都走同一生命周期，避免状态漂移。
3. **tool registry + per-session policy**：base tools 共享，session policy 控制 allowed/disabled，MCP reload 时解锁 tool definitions。
4. **memory as asynchronous co-processor**：memory agent 通过 channel 获取 context，负责 retrieval/extraction/maintenance，主 agent 只消费 pending result。
5. **graph + vector hybrid memory**：embedding 召回作为 seed，graph 负责沿 tag/relation/supersede/contradict 边扩展。
6. **listwise rerank with failure semantics**：LLM rerank 失败 fallback hybrid order；真实空数组代表模型认为无关，语义清晰。
7. **provider session hygiene**：在 rewind/clear/compaction/recovery 时同步重置 provider session，避免上游状态与本地 history 分叉。
8. **CI release matrix 即产品契约**：Linux glibc baseline、Windows runtime smoke、checksum、Homebrew/AUR 更新都纳入 workflow。

### 反模式 / 踩坑点

1. **复杂度增长很快**：69 个 workspace members、近 55 万行 Rust，对外部贡献者理解成本高。
2. **bus factor 高**：项目质量很强，但审查和维护高度依赖作者本人。
3. **文档追不上实现速度**：README 已非常长，docs 有 server/memory/swarm/safety/resume 文档，但很多真实语义仍要靠源码定位。
4. **外部扩展生态弱于 OpenCode/Pi**：MCP/skills 有入口，但尚未形成面向第三方的稳定 Extension SDK 或插件市场。
5. **测试在本机不可快速复现**：当前分析环境无 cargo/rustc；即使有，workspace 大、CI matrix 重，快速全量验证成本较高。
6. **安全默认值需要使用者兜底**：shell/file/MCP/browser/gmail 等工具能力很强，团队使用必须加 workspace、密钥、网络和文件权限隔离。

### 可借鉴的具体技术点

- `run_turn_streaming_mpsc`：学习如何处理 reasoning/tool/native/image/token/error/retry 的统一 stream reducer。
- `server/live_turn.rs`：学习后台/Swarm/reload wake 如何复用普通 turn 生命周期。
- `Session`：学习 provider session、compaction、memory injection、replay event、env snapshot 如何一起持久化。
- `MemoryGraph::cascade_retrieve`：学习向量 seed + 图 BFS 的轻量 graph memory 设计。
- `memory_rerank.rs`：学习如何给 LLM rerank 设计 JSON-only contract 和失败/空结果语义。
- `tool/mod.rs`：学习 base tool OnceLock、session tool policy、registry clone 独立 compaction manager 的工程细节。
- Release workflow：学习 terminal agent 如何做多平台 artifact、checksum、Windows smoke、Homebrew/AUR 自动更新。

---

## 架构解剖

### 目录结构

```text
jcode/
├── src/
│   ├── main.rs               # 二进制入口：allocator tuning、tokio runtime、macOS hotkey listener special case
│   ├── lib.rs                # re-export jcode_tui / app core，CLI startup 入口
│   └── cli/                  # CLI 命令、startup、login/provider/run/server 等入口层
├── crates/
│   ├── jcode-app-core/        # Agent/server/tool/ambient/replay/telemetry/usage 等应用核心
│   ├── jcode-base/            # session、provider、memory、auth、config、mcp、message 等基础层
│   ├── jcode-tui/             # 终端 UI 集成层
│   ├── jcode-tui-*           # markdown、mermaid、render、core、anim 等 TUI 子模块
│   ├── jcode-provider-*       # provider core 与 Anthropic/OpenAI/Gemini/Copilot/OpenRouter/Bedrock 等适配
│   ├── jcode-memory-types/    # memory entry/store/graph 类型
│   ├── jcode-tool-*           # tool core/types 纯契约层
│   ├── jcode-protocol/        # client/server 协议类型
│   ├── jcode-session-types/   # session render/replay/persist 相关类型
│   ├── jcode-swarm-core/      # swarm plan/report/状态辅助逻辑
│   ├── jcode-desktop/         # 桌面端相关能力
│   ├── jcode-mobile-core/     # 移动端核心
│   └── ...                    # setup hints、telemetry、build support、pdf 等
├── docs/
│   ├── SERVER_ARCHITECTURE.md
│   ├── MEMORY_ARCHITECTURE.md
│   ├── SWARM_ARCHITECTURE.md
│   ├── SAFETY_SYSTEM.md
│   ├── RESUME_BEHAVIOR.md
│   └── MULTI_SESSION_CLIENT_ARCHITECTURE.md
├── scripts/
│   ├── test_fast.sh           # cargo test --lib --bins + startup regression check
│   ├── test_e2e.sh            # 完整 E2E 入口
│   ├── build_linux_compat.sh  # manylinux/glibc baseline release build
│   └── security_preflight.sh / check_* 等
├── tests/                     # e2e / harness / integration tests
├── .github/workflows/
│   ├── ci.yml                 # Linux/macOS/Windows build/test/fmt/security/cross-check
│   └── release.yml            # multi-platform release artifacts + checksum + Homebrew/AUR
├── AGENTS.md                  # repo-local agent 工作规范
├── README.md                  # 产品说明、provider、memory、swarm、MCP、安装
└── Cargo.toml                 # workspace + feature/profile 配置
```

### 技术栈

- **运行时 / 框架：** Rust + Tokio；TUI 基于 ratatui/crossterm 生态；TLS 使用 rustls/aws-lc-rs。
- **构建 / 打包：** Cargo workspace；default features = `pdf` + `embeddings`；release profile 默认 `opt-level=1`，另有 `release-lto`；Linux 可选 jemalloc/glibc arena tuning。
- **Provider / 模型：** 多 provider crates + OpenAI-compatible profile；支持 OAuth/订阅型 provider 与本地 OpenAI-compatible servers。
- **Memory：** 本地 memory graph、embedding/sidecar、LLM extraction、listwise rerank。
- **测试：** Rust unit/integration/e2e；本地统计 126 个 Rust test-like 文件；CI 覆盖 Linux/macOS/Windows、fmt、安全 preflight、Windows targeted/e2e smoke、cross-target check。
- **CI/CD：** GitHub Actions；Release 对 Linux/macOS/Windows x64/aarch64 产物、SHA256SUMS、Homebrew formula、AUR package 做自动化。

### 模块依赖关系

```text
root jcode crate
  └── jcode-tui
      └── jcode-app-core
          ├── jcode-base
          │   ├── jcode-message-types / jcode-session-types / jcode-memory-types
          │   ├── provider implementations
          │   └── auth/config/mcp/memory/session
          ├── jcode-tool-core / jcode-tool-types
          ├── jcode-protocol
          ├── jcode-swarm-core
          └── TUI/server/tool/agent application logic
```

关键观察：`src/lib.rs` 说明 root crate 是“entrypoint + cli layer”，presentation moved 到 `jcode-tui`，非 presentation moved 到 `jcode-app-core`，再通过 re-export 保持旧 `crate::<module>` path 可用。这是一个进行中的大型拆分，但兼容性处理比较务实。

### 扩展机制

- **Provider profile：** `jcode provider add`、`jcode login --provider ...`、`~/.jcode/config.toml`、provider env file、`extra_body`/context_window 等配置。
- **MCP：** global `~/.jcode/mcp.json` + project `.jcode/mcp.json`，兼容 `.claude/mcp.json` 和 Codex config 导入。
- **Tools：** 内置 registry；base tools 以 `OnceLock` 缓存，session policy 可控制 allowed/disabled；MCP reload 触发 tool list unlock。
- **Skills：** `SkillRegistry` 与 `skill` tool；agent-facing Markdown skill 能进入 runtime。
- **Hooks：** `turn_end` observer hook 可接收 status、duration、model、cwd、last assistant text、error。
- **Swarm communication：** communicate/channel/share/await 等工具与 server state 形成 agent 间通信协议。

---

## 质量与成熟度

### 代码质量

- **类型系统：** Rust 类型边界强，session/provider/message/tool/memory/swarm 类型分层清晰；大量独立 `*-types` crate 降低循环依赖。
- **错误处理：** 应用层多用 `anyhow::Result`，错误会进入 `ServerEvent::Error`、tool result error 或 recovery path；compaction/payload/retry 有明确分支。
- **代码风格一致性：** 单作者/少数 identity 带来风格统一；但也意味着 code review 和外部维护门槛高。
- **工程纪律：** 有 `AGENTS.md`、docs、CI、release matrix、安全 preflight、warning budget；不是“随手写”的 CLI。

### 测试

- **测试框架：** Cargo test；CI 中 Linux/macOS/Windows 都有 build/test/fmt/security/targeted e2e。
- **本地统计：** 126 个 Rust test-like 文件，覆盖 app-core server/client/swarm/reload/tool、base auth/provider/memory/mcp/session、TUI/render/markdown 等区域。
- **E2E / smoke：** `scripts/test_fast.sh` 跑 `cargo test --lib --bins`；CI 还跑 Windows provider behavior、lifecycle e2e、release binary launch、installer verification。
- **本次限制：** 当前分析机器无 `cargo`/`rustc`，未能实际执行 build/test；报告不伪造测试通过结果。

### CI/CD

- **CI：** `.github/workflows/ci.yml` 包含 fmt、security preflight、Linux/macOS/Windows build & test、Windows cross-target check、PowerShell syntax check 等。
- **Release：** `.github/workflows/release.yml` 先创建 release，再并行 build Linux/macOS/Windows 多 target，上传 artifact 与 checksum，更新 Homebrew/AUR。
- **成熟度信号：** Windows ARM64、portable Linux x86_64 glibc baseline、installer verification 都是终端产品级别的信号。

### 文档质量

- **README：** 非常长，覆盖功能、memory、swarm、provider login、OpenAI-compatible、本地 runtime、MCP、scriptable login 等；对用户上手有帮助。
- **架构文档：** `SERVER_ARCHITECTURE.md`、`MEMORY_ARCHITECTURE.md`、`SWARM_ARCHITECTURE.md`、`SAFETY_SYSTEM.md`、`MULTI_SESSION_CLIENT_ARCHITECTURE.md` 质量较高。
- **不足：** 源码演进太快，很多真实语义只能读代码；外部扩展/插件 API 文档仍不如 OpenCode / Pi 成熟。

### Issue / PR 健康度

- **Open issues / PRs：** 89 / 3（2026-06-15）。
- **最近维护：** 最新 release v0.28.0 发布于 2026-06-15；本地 HEAD 为 2026-06-14 bump version。最近 releases 连续 v0.24.0 → v0.28.0，迭代非常快。
- **社区状态：** 星标和 fork 已快速增长到 7k+/790，但贡献仍高度集中；社区热度上升，维护结构尚未分散。

---

## 社区与生态

### 社区评价

jcode 的社区信号更像“新晋高势能个人项目”：

- 正面信号：Rust、TUI 性能、Swarm、Memory、本地 provider/OAuth 支持形成差异化；star 增长快；release 密集。
- 风险信号：open issues 已到 89，项目仍在快速新增能力；外部 contributor/reviewer 结构不明显。
- 使用建议：个人可以当作“高潜力主力工具候选”试用；团队应把它当作 PoC 和架构学习对象，先不要无隔离深度绑定。

### 衍生项目 / 插件生态

- **MCP 与 provider profile** 是当前最现实的外部生态入口。
- **Homebrew/AUR/release artifacts** 表明分发正在产品化。
- **Swarm / skills / memory** 主要还是 jcode 内建生态，尚未看到稳定第三方插件市场。
- 与 `agentgrep` 等作者周边工具存在组合空间，但还不是成熟生态网络。

### 竞品对比

- **直接竞品：** OpenCode、Pi（原 pi-mono）、Aider、Gemini CLI、Codex CLI、Claude Code、Cline/Continue（如果用户入口是终端/IDE coding agent）。
- **邻近替代：** OpenHands（自治软件工程平台）、Continue（企业 IDE/RAG 接入）、Cline（VS Code 操作体验）。
- **架构邻居：** OpenCode 的 durable runtime，Pi 的 SDK/Extension，Hermes Agent 的 toolset/memory/cron/gateway/subagent 运行面。

jcode 的独特位置是：**它更像“高性能本地 terminal agent runtime + swarm/memory 实验场”，而不是最稳妥的企业 agent platform。**

---

## 关键代码走读

### 1. `Agent::run_turn_streaming_mpsc`

- **路径：** `crates/jcode-app-core/src/agent/turn_streaming_mpsc.rs`
- **职责：** jcode 的核心 turn reducer。
- **实现要点：**
  - turn 前修复 missing tool outputs，避免 provider history 非法。
  - 构建 provider messages、tool definitions、nonblocking memory prompt、split system prompt，并发出 KV cache request event。
  - 消费 `StreamEvent`：thinking/text/tool/generated image/token/session/native tool/error/retry rollback。
  - 支持 context-limit auto compaction、payload-too-large image stripping、OpenAI native compaction recovery。
  - assistant message、reasoning、tool use、token usage 写入 session，然后执行 tools 并写 tool results。

### 2. `Agent::run_once_streaming_mpsc`

- **路径：** `crates/jcode-app-core/src/agent/turn_execution.rs`
- **职责：** 单次用户消息进入 agent turn 的入口。
- **实现要点：**
  - 注入其他 agents 的 pending notifications。
  - 将 image blocks 与 user text 组合成 `Message`，保存 session。
  - 调用 `run_turn_streaming_mpsc`，结束后触发 `turn_end` observer hook。
  - clear/rewind/reset provider session 都显式处理 provider_session_id 和 cache/tool lock。

### 3. `ServerRuntime`

- **路径：** `crates/jcode-app-core/src/server/runtime.rs`
- **职责：** server 进程里的客户端接入、session map、swarm/shared context、debug/gateway 生命周期。
- **实现要点：**
  - `sessions: Arc<RwLock<HashMap<String, Arc<Mutex<Agent>>>>>` 是 live Agent 所有权核心。
  - main/debug/gateway accept loop 分开；每种 client 都进入 `run_client_stream` 类路径。
  - 持有 `SwarmState`、file touch、channel subscriptions、shutdown signals、soft interrupt queues、await members runtime。

### 4. `spawn_tracked_live_turn`

- **路径：** `crates/jcode-app-core/src/server/live_turn.rs`
- **职责：** server 主动唤醒 live session 的统一实现。
- **实现要点：**
  - server-initiated turns 包括 swarm DM/broadcast wake、background task completion、scheduled task、post-reload resume。
  - turn 开始时 member 状态置为 `running`，成功置为 `ready` 并保存 completion report，失败置为 `failed`。
  - 向 attached client 发送 synthetic terminal `Done { id: 0 }` 或 `Error { id: 0 }`，避免 UI 卡住。

### 5. `Session`

- **路径：** `crates/jcode-base/src/session.rs`
- **职责：** 持久会话与恢复语义。
- **实现要点：**
  - 字段不仅有 messages，还有 compaction、provider_session_id/provider_key、model/route、reasoning effort、subagent_model、autoreview/autojudge、canary/testing build、working_dir、status、last_pid、env_snapshots、memory_injections、replay_events。
  - `is_internal_system_reminder_message` 识别 `<system-reminder>`，区分内部提醒和可见对话。
  - 支持 crash detection、active pid、journal、startup stub、rendered messages/images。

### 6. `MemoryGraph::cascade_retrieve`

- **路径：** `crates/jcode-memory-types/src/graph.rs`
- **职责：** 从 embedding seed 出发做图式级联检索。
- **实现要点：**
  - 节点包括 memories、tags、clusters；边包括 `HasTag`、`InCluster`、`RelatesTo`、`Supersedes`、`Contradicts`、`DerivedFrom`。
  - BFS 队列携带 `(node_id, score, depth)`，每跳按 edge weight 与 `0.7^depth` 衰减。
  - 遇到 tag 节点会通过 reverse_edges 找到所有带 tag 的 memory，扩展召回。
  - 最终 `top_k_scored` 保留最高分结果。

### 7. `memory_rerank.rs`

- **路径：** `crates/jcode-base/src/memory_rerank.rs`
- **职责：** listwise LLM rerank memory candidates。
- **实现要点：**
  - Prompt 要求只返回 JSON array candidate numbers。
  - `extract_ranking` 区分“无 JSON array”（失败，fallback hybrid）和真实 `[]`（模型认为无相关 memory）。
  - Precision mode 只注入模型保留的 memory；Recall mode 把 omitted candidates 按 hybrid order 追加。
  - 注释中写明 benchmark：recall@5 0.53 → 0.75，precision@5 0.23 → 0.35。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | ⭐⭐⭐⭐⭐ | TUI、server/live session、tools、MCP、provider、memory、swarm、desktop/mobile crates、release 分发都已覆盖 |
| 代码质量 | ⭐⭐⭐⭐ | Rust 类型边界和恢复逻辑扎实；复杂度高、外部 reviewer 少扣分 |
| 文档质量 | ⭐⭐⭐⭐ | README 和架构 docs 丰富；但实现演进快，API/扩展稳定文档仍需补 |
| 社区活跃度 | ⭐⭐⭐ | star/fork/release 活跃，但贡献高度集中，生态仍早期 |
| 架构设计 | ⭐⭐⭐⭐⭐ | turn reducer、server live runtime、Graph Memory、Swarm、compaction recovery 都很值得学 |
| 学习价值 | ⭐⭐⭐⭐⭐ | terminal agent runtime / Rust TUI / memory / swarm / provider boundary 的综合样本 |
| 可借鉴度 | ⭐⭐⭐⭐⭐ | 多个设计可直接迁移到自己的 agent runtime：tool settlement、memory rerank、live turn、recovery |

**总分：31/35（88.6%）**

---

## 总结

### 一句话评价

> **jcode 是当前最值得跟踪的 Rust terminal coding-agent runtime 之一：功能推进极快，底层架构很有野心，适合个人隔离试用和深度架构学习；但团队生产化要先解决 bus factor、安全隔离和版本稳定性问题。**

### 谁应该用

- 高频使用 coding agent、愿意试新工具的高级开发者。
- 需要本地高性能 TUI、多会话、Swarm 协作、Graph Memory 的个人/小团队 PoC。
- 想研究 agent turn runtime、工具结算、provider streaming、memory rerank 的架构学习者。
- Rust/TUI/terminal 产品开发者。

### 谁不应该直接用

- 需要企业级权限审计、多租户隔离、长期 SLA 的团队。
- 不能接受 breaking change 或高频 release 的保守生产环境。
- 不愿意理解 provider profile/MCP/工具权限/Swarm 心智的轻量用户。
- 需要成熟第三方插件市场或稳定 Extension SDK 的平台团队。

### 下一步

1. **个人试用：** 用 release binary + 单独测试仓库 + 最小权限 provider key 做 1 周试用。
2. **团队 PoC：** 放进容器/隔离 workspace，限制 shell/file/network/MCP 权限，观察工具调用审计和 session recovery。
3. **架构学习：** 优先读 `turn_streaming_mpsc.rs`、`server/live_turn.rs`、`session.rs`、`graph.rs`、`memory_rerank.rs`。
4. **持续跟踪：** 关注 v0.28.0 之后 release 节奏、issue 关闭质量、是否出现外部核心贡献者和第三方扩展生态。
