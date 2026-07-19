# Grok Build

> 一句话定位：**以 ACP、actor、工具运行时、持久会话和多代理为骨架的完整 Coding Agent harness。**
> 分析日期：2026-07-19（观察窗口仅约 3–5 天）
> 项目地址：https://github.com/xai-org/grok-build
> 审查基线：`7cfcb20d2b50b0d18801a6c0af2e401c0e060894`（`main`，2026-07-18）

---

## 基本信息

### 项目画像

| 项目 | 内容 |
|------|------|
| 项目名称 | Grok Build |
| 维护方 | xAI / SpaceXAI |
| 语言 | Rust 2024 Edition |
| 许可证 | Apache-2.0 |
| 当前源码版本 | `0.2.105` |
| GitHub 创建时间 | 2026-07-14 |
| 首个公开提交 | 2026-07-16 |
| 审查时热度 | 19,581 Stars / 3,512 Forks / 30 Watchers |
| 公开历史 | 4 个同步提交，作者均为 `xai-org-project-sync-bot` |
| Issue / PR | Issues 关闭；Pull Requests API 不开放；不接受外部贡献 |
| Release / Tag | GitHub Releases 0、Tags 0；官方二进制经独立 release index 分发 |
| 源码规模 | 79 个 workspace members，2,269 个 Rust 文件，约 138.6 万行 Rust |
| 测试资产 | 静态检出约 26,061 个 Rust 测试标注，分布于 1,497 个文件 |
| 依赖锁定 | `Cargo.lock` 1,274 个包；1,193 个 registry checksum；git 依赖固定 commit |

> **数据口径说明**：GitHub `open_issues_count=0` 不能单独证明“没有问题”；本项目的 `has_issues=false`，公开 Issue 渠道本身已关闭。Pull Requests API 返回 404，与贡献指南“不接受外部 PR”一致。

### 一句话定位

**Grok Build 不是一个绑定 Grok 模型的命令行外壳，而是一套以 ACP、actor、工具运行时、持久会话和多代理为骨架的完整 Coding Agent harness。**

## 场景一：是否值得采用

### 解决的问题

1. **把长任务做成可恢复的状态机**：对话、工具调用、TODO、文件快照、token、subagent 全部进入持久会话。
2. **将模型协议与 agent runtime 解耦**：同时支持 OpenAI Chat Completions、OpenAI Responses、Anthropic Messages；可接 xAI、Ollama 与自托管兼容端点。
3. **让多个客户端复用同一 agent**：TUI、headless、stdio/ACP、leader/relay、dashboard 共享同一底层会话和执行引擎。
4. **将工具执行做成受控运行时**：权限审批、hooks、MCP、并发调度、同文件锁、sandbox、rewind 共同构成执行边界。
5. **支持超长自主工作**：自动 compaction、goal harness、TodoGate、subagent、worktree 与跨会话 memory 组成持续执行层。

---

### 核心能力与边界

#### 交互与接入面

- **全屏 TUI**：Ratatui + Crossterm，支持 Markdown、语法高亮、Mermaid、diff、TODO、session picker、dashboard、语音输入等。
- **Headless**：`grok -p` / `--prompt-json` / `--prompt-file`，支持 plain、JSON、JSONL stream、JSON Schema structured output。
- **ACP stdio agent**：通过 Agent Client Protocol 暴露 `session/new`、`session/load`、prompt、cancel 和扩展方法，供桌面端、IDE 或自定义客户端接入。
- **Leader / relay**：常驻 leader 复用 agent 进程，管理多 session、自动更新、连接恢复和远程 relay。
- **Serve / dashboard**：提供 agent server 与多会话可视化管理面。

#### Agent 能力

- 基于模型响应的原生工具调用循环；无工具调用时结束，权限拒绝/取消/达到 `max_turns` 时终止。
- `Goal Harness`：在一轮完成后继续评估目标是否真的达成，可自动注入后续 directive。
- `TodoGate`：模型试图结束但 TODO 未完成时，按策略注入提醒并继续，且有最大触发上限防止无限循环。
- 自动与手动 compaction，支持 two-pass 预压缩、溢出前压缩和压缩 checkpoint。
- Structured Output：后端原生 JSON Schema 优先；不支持时注入专用工具并本地验证、重试。
- 中途 interjection：用户可在模型等待或工具执行过程中追加指令；等待型工具可被新消息打断。
- Prompt queue、doom-loop 信号、usage ledger、auth recovery、rate-limit retry、模型 fingerprint 与细粒度 latency 统计。

#### 工具、扩展与自动化

- 内置文件、搜索、shell、Git、TODO、浏览/搜索等 coding tools。
- **MCP**：stdio 与 Streamable HTTP，支持 OAuth、工具命名空间与 managed MCP re-auth。
- **Skills**：兼容 `.grok`、`.agents`、Claude Code、Cursor 等目录层级，可自动或显式调用，支持热重载。
- **Plugins**：本地/市场插件可提供 skills、commands、agents、hooks、MCP 配置及 LSP 配置。
- **Hooks**：覆盖 prompt submit、permission request、pre/post tool、stop、subagent、config change 等生命周期。
- **Subagents**：支持同步阻塞与 background agent，可配置模型、工具范围和 worktree 隔离。
- **Worktrees / Forks**：每个代理或会话 fork 可拥有独立 Git worktree，再将变更应用回主工作区。

#### 会话、记忆与恢复

会话落在 `~/.grok/sessions/<encoded-cwd>/<session-id>/`：

- `updates.jsonl`：权威 ACP 更新流；
- `chat_history.jsonl`：发送给模型的原始上下文；
- `summary.json`：标题、模型、父 session、消息计数；
- `plan.json`：TODO 状态；
- `rewind_points.jsonl`：每个 prompt 的文件快照；
- `signals.json`：turn/tool/token 指标；
- `compaction_checkpoints/` 与 `subagents/`：长会话与子代理状态。

实验性 memory 使用 Markdown + SQLite/FTS/vector index，将全局知识、工作区知识、session archive 分层，并支持 embedding、MMR、query expansion 和 dream/curation。

### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键库 / SDK。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| Rust 2024 + `tokio` | Runtime / async | actors、model streaming、tools、leader | 为长生命周期 agent 提供统一并发与取消模型 | root `Cargo.toml`，79 workspace members | 适合生产级本地 agent runtime | 编译和二次开发门槛高 |
| `agent-client-protocol` + `xai-acp-lib` | Client-agent protocol | TUI、stdio、desktop、leader session contract | 避免每个客户端重写 agent loop | `MvpAgent` / `AcpSession` | 多端 agent 产品的高价值内核 | ACP unstable surface 仍需版本治理 |
| 三 backend Sampler | Model abstraction | Chat Completions / Responses / Messages | 模型可替换，不锁死 xAI | `xai-grok-sampler/src/lib.rs` | 可复用到 BYOK、自托管、多 provider 产品 | provider edge cases 集中且测试面大 |
| `ratatui` + `crossterm` | TUI | 实时 transcript、diff、TODO、dashboard | 构建 terminal-first 产品界面 | `xai-grok-pager/Cargo.toml` | 适合长任务、keyboard-driven agent | UI 状态复杂，必须与 runtime 解耦 |
| `rmcp 2.1` + isolated Reqwest 0.13 | MCP client | stdio/HTTP、OAuth、tool namespace | 接入外部工具生态并隔离依赖冲突 | `xai-grok-mcp/Cargo.toml` | MCP 已是 agent 标准扩展面 | 远程服务扩大权限与凭证面 |
| JSONL + SQLite/FTS/vector | State / memory | crash recovery、search、semantic recall | 分离权威事件流、关键词检索和语义记忆 | session persistence / `xai-grok-memory` | 适合可恢复长会话 | 多份派生状态需要严格一致性规则 |
| `nono` + bwrap + seccomp | OS isolation | 文件和 child network sandbox | 把安全边界下沉到 OS 能力层 | `xai-grok-sandbox` | 比 prompt-only permission 更可靠 | 默认关闭，apply 失败时会降级运行 |
| `Cargo.lock` + NOTICE | Supply-chain governance | 依赖锁定和许可证归档 | 提升 fork 与构建的确定性 | 1,274 packages、1,193 checksums、git commit pin | 静态供应链纪律较强 | 公开 CI/漏洞扫描不可见 |

### 风险评估

- **治理风险高**：Issues/PR 关闭、不接受外部贡献，无法按常规 upstream 路径修复或推动需求。
- **供应链可验证性不足**：GitHub 无 release/tag/Actions，官方二进制与公开 commit 的对应关系未动态验证。
- **默认权限组合偏激进**：sandbox 默认 off，首次审批默认高亮 all sessions，hooks 对异常 fail-open。
- **fork 成本高**：138.6 万行 Rust、79 crates、大量内部 managed/relay/telemetry 路径，需要持续 Rust 平台能力。
- **观察窗口过短**：公开同步仅约三天，无法确认安全修复、breaking change 和 release provenance 的长期行为。

### 结论

Grok Build 的产品能力已达到生产级 Coding Agent runtime 的完整度，但公开发布、协作与外部可验证构建链尚未达到同等成熟度。适合源码学习和隔离试用；直接用于高权限生产仓、或作为团队长期可共同维护的上游基座，当前都应暂缓。

## 场景二：技术架构学习

### 核心架构图

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         Client / Entry Layer                        │
│  Ratatui TUI │ Headless │ ACP stdio │ Leader/Relay │ Serve/Dashboard│
└──────────────────────────────┬──────────────────────────────────────┘
                               │ ACP JSON-RPC / internal commands
┌──────────────────────────────▼──────────────────────────────────────┐
│                         MvpAgent / Bootstrap                        │
│ config + auth + model catalog + MCP + plugin/skill + session routing│
└──────────────────────────────┬──────────────────────────────────────┘
                               │ session/new | load | prompt | cancel
┌──────────────────────────────▼──────────────────────────────────────┐
│                        AcpSession Actor                             │
│ lifecycle │ prompt queue │ goal harness │ compaction │ subagents   │
│ permission │ hooks │ persistence │ observability │ rewind          │
└───────────────┬──────────────────────────────┬──────────────────────┘
                │                              │
┌───────────────▼──────────────┐   ┌──────────▼──────────────────────┐
│       ChatState Actor        │   │        Sampler Actor            │
│ messages / tools / usage     │   │ HTTP stream / retry / cancel   │
│ build request / compaction   │   │ Chat / Responses / Messages    │
└───────────────┬──────────────┘   └──────────┬──────────────────────┘
                │                             │ model response
                └──────────────┬──────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       ToolBridge / Registry                         │
│ built-ins │ MCP │ plugin tools │ skills │ structured output        │
│ prepare → permission/hooks → parallel dispatch → result normalization│
└─────────────────┬───────────────────────────┬───────────────────────┘
                  │                           │
       ┌──────────▼──────────┐     ┌─────────▼──────────────────────┐
       │ Workspace Operations │     │ Isolation / Coordination      │
       │ fs / shell / git     │     │ sandbox / file locks /        │
       │ search / web / TODO  │     │ worktrees / subagents         │
       └──────────┬──────────┘     └─────────┬──────────────────────┘
                  └──────────────┬────────────┘
                                 ▼
                    ChatState result injection
                                 │
                                 └──► next sampling loop / final reply
```

### 底层技术架构

#### 最小架构内核

最小闭环不是完整 TUI，而是：**ACP session contract + AcpSession actor + ChatState actor + Sampler actor + ToolBridge + append-only persistence**。skills、MCP、memory、leader、dashboard、subagents 都可围绕这个闭环按需扩展。

#### 核心抽象

| 模块 | 路径 | 职责 |
|------|------|------|
| Composition root | `xai-grok-pager-bin/src/main.rs` | CLI 参数、sandbox、认证、更新、TUI/headless/agent/leader 分流 |
| TUI | `xai-grok-pager` / `xai-grok-pager-render` | 终端状态、render、input、dashboard、diff、session UI |
| Agent gateway | `xai-grok-shell/src/agent/app.rs` | 创建 `MvpAgent`，建立 ACP connection，启动 stdio/headless/leader |
| ACP Agent | `xai-grok-shell/src/agent/mvp_agent/` | ACP method、session routing、model/auth/MCP 初始化 |
| Session runtime | `xai-grok-shell/src/session/acp_session*.rs` | 单 session actor、turn、tool、permission、hooks、compaction、subagent |
| Chat state | `xai-chat-state/src/actor/` | 对话状态、请求构建、消息与 usage 更新、compaction 状态 |
| Sampling | `xai-grok-sampler` | 三种 API backend、stream 转换、retry/cancel/metrics actor |
| Tool registry | `xai-grok-tools/src/registry/` | 工具定义、alias、origin、权限 metadata、dispatcher |
| Tool runtime | `xai-tool-runtime` / `xai-grok-workspace` | workspace operations 与工具执行边界 |
| MCP | `xai-grok-mcp` | rmcp transport、OAuth、凭证、server lifecycle |
| Sandbox | `xai-grok-sandbox` | nono/Landlock/Seatbelt、bwrap、child seccomp 网络限制 |
| Persistence | `xai-grok-shell/src/session/persistence.rs` | JSONL/JSON 增量持久化、flush、恢复与索引 |
| Memory | `xai-grok-memory` | Markdown archive、SQLite/FTS/vector、embedding、MMR、dream |

#### 控制面 / 数据面

- **控制面**：CLI/config/auth、model catalog、session routing、permission policy、hooks/plugins/skills、MCP lifecycle、leader/update。
- **数据面**：prompt/message event、model token stream、tool call/result、file snapshot、usage/metrics、JSONL persistence。
- `AcpSession` 是二者的交汇点，但 ChatState、Sampler 与 WorkspaceOps 分别保持状态、网络和副作用所有权。

#### 关键执行链路

##### 启动

1. `main.rs` 解析 CLI、设置 cwd、应用 sandbox、加载配置与认证。
2. 交互模式进入 TUI；单 prompt 进入 headless；`agent stdio` / `leader` 进入 ACP agent 路径。
3. `spawn_agent_local()` 创建 `MvpAgent` 和 `AgentSideConnection`，并在 Tokio `LocalSet` 上运行会话 actor。
4. `MvpAgent` 创建或恢复 `AcpSession`，初始化 ChatState、Sampler、ToolBridge、MCP、hooks、skills、persistence 和通知管道。

##### 一轮对话

1. 用户 prompt 先触发 `UserPromptSubmit` hook，记录 prompt index、file-state rewind 起点和 turn lifecycle。
2. `AcpSession` 进入外层 goal round，再进入内部 model/tool loop。
3. 每次 loop 先处理 interjection、skill reminder、monitor event、memory、MCP reminder 和 auto-compaction。
4. ChatState 根据历史、有效工具和 memory 生成 `ConversationRequest`。
5. Sampler actor 选择 Chat Completions / Responses / Messages backend，完成 streaming、retry、auth recovery 与取消协调。
6. Assistant 内容写回 ChatState；若没有工具调用则运行 TodoGate、structured-output 校验和 turn bookkeeping 后结束。
7. 若有工具调用，先 parse/prepare，再走 hooks 与权限审批。
8. 已批准工具进入 `FuturesUnordered` 并发执行；命中同一文件路径时，通过 path lock 串行化，避免并发写冲突。
9. 工具结果标准化后写回 ChatState，触发 post-tool hook 和事件指标，随后进入下一轮 sampling。
10. turn 结束后 flush session、结束 file tracker、保存 rewind point，并冻结包括 subagent 在内的 usage ledger。

#### 状态模型

- Session state：ACP updates、raw model history、TODO、signals、rewind、compaction、subagent metadata。
- Turn state：prompt id、loop index、tool turn count、TodoGate fire count、auth retry schedule、structured-output retry。
- Tool state：prepared call、permission outcome、dispatch slot、path lock、hook result、normalized tool result。
- Sampler state：request id、backend、stream events、latency/usage、retry/cancel attribution。

#### 契约边界

- ACP 定义 client ↔ agent；
- `ConversationRequest/Item` 定义 session ↔ sampler；
- `ToolSpec/PreparedToolCall/ToolCallResponse` 定义 model ↔ tool runtime；
- `updates.jsonl` 是 restore 的权威事件流；
- permission/sandbox/worktree 分别负责用户授权、OS 能力和 Git 写隔离，不能互相替代。

#### 失败与降级模型

- 模型侧：401 refresh 后 1s/2s/4s 有界重试，rate limit 与 stream cancel 独立处理；
- 上下文侧：preflight/auto compaction 后重提请求；
- 工具侧：解析失败、工具不存在、hook deny、permission reject/cancel 都归一为显式 outcome；
- sandbox 侧：平台不支持或 apply 失败会告警后继续，因此不是 fail-closed；
- subagent 与 auto-update 都有 drain/deferral timeout，避免无限阻塞主 session。

#### 可复刻设计不变量

##### 1. Actor 不是包装，而是并发边界

ChatState、Sampler、Session 各自拥有命令/事件通道和生命周期。网络 streaming、状态变更、工具并发、client notification 被拆开，避免一个全局可变 agent object 承担所有并发责任。

##### 2. ACP 是真正的内核协议

TUI 之外的 stdio、桌面端、leader、外部 client 都可通过同一 session API 驱动 agent。它把 Grok Build 从“终端应用”变成“可嵌入 agent service”。

##### 3. 工具调用并发，但状态写入受控

多工具调用不是顺序 `for` 循环：实现使用 `FuturesUnordered`，并配合同文件锁、授权阶段、MCP re-auth 和统一结果回灌。这是吞吐与正确性之间较成熟的折中。

##### 4. 长任务终止条件显式化

`max_turns`、TodoGate fire cap、auth retry cap、goal round 决策、subagent drain timeout、auto-update busy deferral 都有硬边界。代码中还能看到由历史事故反推出来的 retry invariants，说明该运行时经历过真实长任务压力。

##### 5. 状态恢复不是“保存聊天文本”

ACP event stream、raw model history、file snapshots、TODO、usage、compaction checkpoint、subagent metadata 分开持久化，支持 resume、rewind、fork 与索引查询。这比只保存 messages 数组完整得多。

---

## 架构解剖

### 目录结构

```text
grok-build/
├── crates/codegen/xai-grok-pager-bin   # composition root / CLI
├── crates/codegen/xai-grok-pager       # Ratatui 产品界面
├── crates/codegen/xai-grok-shell       # agent、ACP session、turn/tool orchestration
├── crates/codegen/xai-chat-state       # 对话状态 actor
├── crates/codegen/xai-grok-sampler     # 三模型协议与 streaming actor
├── crates/codegen/xai-grok-tools       # tool registry / dispatcher
├── crates/codegen/xai-grok-workspace   # 文件、shell、Git 等副作用
├── crates/codegen/xai-grok-mcp         # MCP client / OAuth
├── crates/codegen/xai-grok-sandbox     # OS sandbox
├── crates/codegen/xai-grok-memory      # 跨 session memory
├── crates/common/xai-tool-*            # 通用工具协议与 runtime
└── prod/mc                             # 内部 managed/relay 类型与接口
```

### 技术栈

| 层级 | 技术 / 依赖 | 作用 |
|------|-------------|------|
| 语言/runtime | Rust 2024、Tokio | 内存安全、异步 actor 与并发工具执行 |
| TUI | Ratatui、Crossterm、Syntect | 跨平台终端渲染、输入与高亮 |
| 协议 | `agent-client-protocol`、`xai-acp-lib` | agent-client JSON-RPC 接口 |
| HTTP / streaming | Reqwest、Rustls、SSE | 模型与 MCP 流式通信 |
| MCP | `rmcp 2.1`、OAuth2 | MCP client、认证与 transport |
| 状态/存储 | JSONL、SQLite、FTS5、sqlite-vec | session、检索与 memory |
| Git | git2、worktree 工具 | repo 状态、fork、隔离与变更应用 |
| Sandbox | nono、Landlock/Seatbelt、bwrap、seccomp | 文件和子进程网络限制 |
| 解析/工具 | tree-sitter、regex、serde/jsonschema | 代码理解、配置和 structured output |
| 可观测性 | tracing、OpenTelemetry、Mixpanel 可选 | 本地日志、性能与可选 telemetry |

#### 依赖治理

优点：

- `Cargo.lock` 完整纳入仓库；registry 依赖具 checksum。
- 唯一检出的 git source 固定到完整 commit，而非浮动 branch。
- 多份第三方 NOTICE 随仓库提供。
- MCP 甚至单独隔离 Reqwest 0.13，避免与主 workspace 的 0.12 类型/特性冲突。

风险：

- 1,274 个 lock package 和 79 个 workspace member 带来很高的升级、审计与 fork 成本。
- 公开仓无 CI，外部无法看到 lock 更新、license 扫描、漏洞扫描与跨平台构建是否持续通过。
- 根 README 没有 source build / test 手册；“源码可本地构建”是许可证和贡献文档声明，不等于公开路径已验证。

### 模块依赖关系

`xai-grok-pager-bin` 是 composition root，向下组合 `xai-grok-pager` 和 `xai-grok-shell`；shell 通过 ACP/session 层依赖 ChatState、Sampler、Workspace、MCP、sandbox、memory；工具协议与 runtime 下沉到 `crates/common/xai-tool-*`。模型网络、会话状态和副作用执行分别由 Sampler、ChatState、Workspace/ToolBridge 持有，避免 TUI 或 CLI 直接跨层写状态。

### 扩展机制

- **协议扩展**：ACP extension methods 为 session fork、leader、dashboard 等能力提供统一入口。
- **模型扩展**：custom model catalog + 三 backend Sampler，可增加 OpenAI-compatible、自托管和 Anthropic-compatible 模型。
- **工具扩展**：内置 registry、MCP namespace、plugin tools 与 structured-output synthetic tool 共用 dispatch/result contract。
- **行为扩展**：skills 注入模型上下文，hooks 截获生命周期，plugins 打包 skills/commands/agents/hooks/MCP/LSP。
- **执行扩展**：subagent、background agent、worktree 和 leader 在同一 session runtime 上扩展并发，而不是另起一套 agent loop。

---

## 质量与成熟度

### 代码质量

#### 优点

1. **模块边界清楚**：sampling、chat state、workspace、MCP、sandbox、memory、telemetry、TUI 均拆成独立 crate。
2. **行为型测试资产大**：除普通 unit tests，还有 PTY E2E、scripted scenarios、leader cluster、MCP timing、sandbox deny-path、persistence、permissions 等专项测试。
3. **事故经验进入不变量**：auth retry 代码直接记录过 16m40s / 11.6 天错误退避事故及 1s/2s/4s 修复约束，这是成熟生产代码常见特征。
4. **恢复与取消完整**：turn、tool、subagent、leader update、streaming、interjection 都有取消/timeout 路径。
5. **跨平台意识强**：macOS fd limit、Windows stdio、Linux seccomp/musl、Landlock/Seatbelt、PTY 和 target-specific dependencies 均有专门处理。
6. **可观测性深入执行链**：模型 TTFT/ITL/TPS、tool duration、turn outcome、retry、doom-loop、memory injection 和 session lifecycle 都有事件。

#### 问题

1. **关键文件仍然过大**：`main.rs`、`turn.rs`、`tool_calls.rs` 均约 2,500–3,000 行；虽然已拆 crate，但 session orchestration 仍是高复杂度中心。
2. **部分模块放宽 lint**：例如 sandbox crate 顶部允许 unused、unreachable、dead code，降低静态信号质量。
3. **公开历史被压扁**：只有 4 个 bot 同步提交，无法通过 blame/PR/review 追踪设计演进、回归来源与所有权。
4. **测试无法外部验证**：仓库无 GitHub Actions；本次环境也没有 Cargo，因此没有把任何测试写成“已通过”。
5. **内部产品痕迹明显**：大量 managed config、GCS trace、relay、SpaceXAI 名称、内部 extension method，fork 方要自行区分通用能力与内部部署耦合。

#### 静态质量结论

这是**生产级内部 monorepo 的公开快照**，不是社区协作型开源仓库。代码的深度、测试形态和故障恢复设计远高于普通首发项目；但公开可审计性、构建透明度和长期维护承诺远低于其内部工程成熟度。

### 测试

- 静态统计识别到约 26,061 个 Rust `#[test]` / `#[tokio::test]` 标注，分布于 1,497 个 Rust 文件。
- 测试形态覆盖 unit、PTY E2E、scripted scenario、leader cluster、MCP timing、sandbox deny paths、persistence、permissions 和 tool orchestration。
- 本次**未执行测试**：分析环境没有 Cargo，公开仓也没有可观察 CI；测试资产规模不能等同于当前 commit 已通过。

### CI/CD

- GitHub `.github/workflows` 为空；公开 Actions、required checks、coverage、release workflow 均不可见。
- GitHub 无 release/tag，官方安装脚本读取独立 release index；二进制 provenance 与审查 commit 的对应关系未验证。
- 结论：内部 CI 很可能存在，但公开仓没有提供可独立复核的交付证据。

### 文档质量

- 24 篇用户指南系统覆盖模型、自定义模型、MCP、skills、plugins、hooks、headless、subagents、sessions、sandbox、permissions、memory、telemetry。
- 根 README 聚焦安装和入口，缺少 source build/test、架构总览、版本兼容和 release provenance。
- 文档对外使用很强，对外贡献和源码维护较弱。

### Issue / PR 健康度

- `has_issues=false`；Issues API 返回 0 条，不能解释为“无缺陷”。
- Pull Requests API 返回 404，贡献指南明确“不接受外部贡献”。
- 公开维护反馈回路不可观察，无法评估响应时延、合并质量、backlog 或修复 SLA。

### 安全与隐私评估

#### 已有安全机制

- Apache-2.0 源码公开；安全漏洞走 xAI HackerOne。
- 权限模式支持 `plan`、`default`、`auto`、`yolo`，并对工具动作逐项审批。
- Session 内可保存 allow decision，工具 metadata 支持只读/破坏性/不可撤销/全局影响标记。
- OS-level sandbox：nono 在 Linux/macOS 提供 Landlock/Seatbelt；Linux 可用 bwrap 重新执行进程。
- 子进程网络可通过 seccomp 限制；sandbox deny path 支持 read/write 隔离。
- hooks 可在 pre-tool 阶段 deny 工具调用；payload 有截断逻辑。
- MCP credentials 文件按 0600 写入；OAuth token 与 server 配置分离。
- telemetry 默认 `Disabled`；未知 telemetry 值按 disabled 处理。
- session 支持 rewind，减少误改文件后的恢复成本。

#### 主要风险

##### 1. 默认 sandbox 为 off

官方文档明确默认 `sandbox = "off"`。而这是一个拥有 shell、文件、Git、网络、MCP 和插件能力的 coding agent。隔离必须由用户主动打开，且平台不支持时实现会 warn 后继续无 sandbox 运行。

##### 2. 审批 UI 的默认选择过宽

首次 permission dialog 的默认高亮项是 **“Always allow on all sessions”**，不是单次允许。用户一次误按会把局部决策扩大到全局 session 范围。

##### 3. Hooks fail-open

除 hook 明确返回 deny 外，非零退出、timeout、无输出、无效 JSON 都不会阻止操作。这样能避免扩展故障让 agent 完全不可用，但不适合把 hook 当唯一强制安全边界。

##### 4. 插件/skills 是本地代码和提示词供应链

插件可注入 MCP、commands、agents、hooks、skills；skills 扫描多个兼容目录且不遵循 `.gitignore`。恶意仓库中的 `.grok/.agents/.claude/.cursor` 内容可能影响模型行为或扩展面。

##### 5. Agent 进程本身仍需联网

进程级网络保持开放以访问模型 API；网络限制主要针对已知 child launch path。自定义工具、MCP、插件和未覆盖的进程启动路径仍需独立审计。

##### 6. 凭证与内容泄漏面较大

自定义模型 API key、MCP token、hooks、OTEL endpoint、trace upload、feedback 与 managed relay 都可能接触 prompt、tool arguments、工作区路径或结果。默认 telemetry 关闭是优点，但启用外部 OTEL/content gates 时必须重新做数据分级。

#### 安全采用建议

1. 首次运行用一次性测试仓、低权限 API key 和无生产密钥环境。
2. 显式启用 `sandbox = "workspace"` 或更严格 profile，并确认启动日志显示 `applied=true`。
3. 不保存 “Always allow on all sessions”；优先单次授权。
4. 对项目内 `.grok/`、`.agents/`、`.claude/`、`.cursor/` 和 plugin manifest 做代码审查。
5. 将 hooks 视为审计/策略补充，不视为 fail-closed sandbox。
6. MCP token 单独分权；远程 MCP 只接可信端点。
7. 团队部署前抓包确认 telemetry、feedback、trace 与 relay 的实际出站行为。

---

## 社区与生态

### 热度与真实成熟度必须拆开

19.5k Stars、3.5k Forks 在约五天内非常突出，说明 xAI 品牌和完整 coding-agent 源码具有强关注度；它不说明社区已形成。

公开协作事实恰好相反：

- Issues 关闭；
- Pull Requests API 不开放；
- `CONTRIBUTING.md` 明确不接受外部 PR 和 unsolicited patches；
- 公开历史只有 4 个 sync-bot commit；
- GitHub contributors API 仅暴露同步 bot；
- 无 GitHub release、tag、Actions；
- 维护者把公开仓定义为 “source transparency and local builds”。

因此该仓库应视为 **source-available development mirror under an OSI license**，而不是传统社区驱动项目。

### 极短观察窗口

项目在 2026-07-14 建仓、2026-07-16 才有首个公开提交，本报告日期为 2026-07-19。以下问题都还无法由公开数据回答：

- 同步频率能否持续；
- 安全修复到公开镜像的延迟；
- source 与官方二进制是否长期可对应；
- breaking changes 与 migration policy；
- tag/release provenance；
- 外部 fork 是否会形成事实社区。

### 健康度结论

**内部产品健康度：强；公开项目健康度：当前不可验证；社区健康度：弱。**

### 衍生项目 / 插件生态

- 官方 plugin system 可组合 skills、commands、agents、hooks、MCP 与 LSP，但公开仓没有可观察的第三方 marketplace 生态数据。
- 项目开放时间仅约五天，3.5k Forks 尚不能说明形成了可维护衍生项目。
- 由于 upstream 不接收贡献，未来更可能出现独立 fork/插件生态；截至审查日还不能判断哪个 fork 会成为事实社区入口。

### 竞品对比

| 维度 | Grok Build | Pi Mono | OpenCode | JCode |
|------|------------|---------|----------|-------|
| 核心语言 | Rust | TypeScript | TypeScript | Rust |
| 定位 | 完整 agent OS / 产品 runtime | 极小可嵌入 agent core | 多模型终端 agent | Rust terminal agent runtime |
| Agent loop | Actor + ACP + goal/TodoGate | 紧凑可扩展 loop | durable session/event-projection | streaming turn reducer + tool settlement |
| 模型协议 | Chat / Responses / Messages | provider adapters | 多 provider | 多 provider |
| TUI | 非常完整 | 轻量 | 完整 | 完整 |
| Headless / SDK | Headless + ACP + serve | SDK 复用强 | CLI/API | CLI/server/gateway |
| Session 恢复 | JSONL + snapshots + compaction | 轻量 session | SQLite/session | JSON/journal + compaction |
| 多代理 | subagent + fork + worktree + leader | 可组合 | 有限/插件化 | 内置 Swarm |
| 扩展 | MCP + skills + plugins + hooks | extension/tool | plugins/MCP | MCP + skills + providers |
| Sandbox | OS sandbox + permission | 依赖宿主 | permission/sandbox | permission + 宿主隔离 |
| 代码规模 | 极大 | 小 | 中大 | 中大 |
| 学习难度 | 高 | 低 | 中 | 中高 |
| 社区协作 | 不接受外部贡献 | 开放 | 开放 | 开放 |
| 最适场景 | 研究完整生产级 agent runtime | 二次开发/嵌入 | 直接日常使用 | Rust 本地 runtime / Swarm / Memory |

#### Grok Build 相对优势

- 执行链完整度最高：TUI、ACP、actor、tools、permission、sandbox、persistence、subagents、worktrees 都在同一仓库。
- 长任务可靠性设计非常深：取消、重试、compaction、goal、TodoGate、usage accounting、rewind 都不是附加 demo。
- 模型端不锁死 xAI，具备 harness 复用价值。
- 对桌面端/IDE/leader 的协议化支持强于只做 CLI 的项目。

#### 相对劣势

- 对 fork 方而言，138 万行 Rust 和 79-crate workspace 的理解、裁剪、升级成本远高于 Pi/OpenCode。
- 不接受贡献意味着扩展诉求只能自维护 fork，无法按普通开源路径 upstream。
- 公开 release/CI/history 缺失，供应链与发布可验证性弱于成熟社区项目。
- 默认 sandbox/permission 组合对普通用户不够保守。

---

## 评分

### 评分表

| 维度 | 评分 | 说明 |
|------|------|------|
| 功能完整性 | 5/5 | 从 TUI、ACP、模型、工具到多代理、memory、dashboard 几乎覆盖完整产品面 |
| 代码质量 | 4/5 | 模块化、测试和恢复设计强；关键 orchestrator 文件过大，公开 CI 不可验证 |
| 文档质量 | 4/5 | 用户指南详细；根 README 与 source build/test/release 文档不足 |
| 社区活跃度 | 1/5 | 热度高但 Issues/PR 关闭、不接受贡献、仅 bot 同步、观察窗口极短 |
| 架构设计 | 5/5 | ACP + actor + tool runtime + persistence 的边界成熟，长任务机制完整 |
| 学习价值 | 5/5 | 生产级 coding-agent runtime、权限、sandbox、恢复、多代理的高密度样本 |
| 复用价值 | 4/5 | Apache-2.0 且模型可替换；但体量、内部耦合和无 upstream 路径抬高成本 |
| **总分** | **28/35（80%）** | **代码成熟、公开项目机制不成熟；有条件推荐** |

### 结论标签

- **源码学习**：🟢 强烈推荐
- **个人隔离试用**：🟡 有条件推荐
- **直接挂生产仓/高权限环境**：🔴 不推荐
- **作为团队长期平台基座**：🟡 等待公开同步、构建与发布连续性
- **直接 fork 做二次开发**：🟡 只适合能长期维护大型 Rust monorepo 的团队

---

## 关键代码走读

### 执行入口与 session bootstrap

- `xai-grok-pager-bin/src/main.rs`：解析 CLI、加载配置/认证、应用 sandbox，并将 TUI、headless、ACP agent、leader 分流。
- `xai-grok-shell/src/agent/app.rs`：`spawn_agent_local()` 创建 `MvpAgent` 与 ACP connection，在 Tokio `LocalSet` 上托管非 `Send` session actors。
- `xai-grok-shell/src/agent/mvp_agent/acp_agent.rs`：实现 ACP method，负责 session create/load/prompt/cancel 与 client update channel。

### Turn、sampling 与 tool settlement

- `acp_session_impl/turn.rs`：goal round、inner loop、memory/skill/MCP 注入、compaction、TodoGate、structured output、usage freeze。
- `acp_session_impl/sampler_turn.rs`：向 Sampler actor 发 request，消费 stream events，并统一 TTFT/usage/error/cancel。
- `acp_session_impl/tool_calls.rs`：parse/prepare、permission/hooks、MCP re-auth、`FuturesUnordered` 并发、path lock、result normalization。
- `xai-chat-state/src/actor/state.rs`：持有模型可见消息和 tool state；构造 `ConversationRequest`，避免 session orchestrator 直接改内部状态。

### 值得借鉴的设计

### 10.1 ACP 作为产品内核，不是外围适配器

把 agent 的 session/new、load、prompt、cancel、notification 做成协议后，TUI、桌面、IDE、leader 不需要各自重写 agent loop。**这比“先写 CLI，后补 HTTP server”更适合多端产品。**

### 10.2 ChatState 与 Sampler 分离

模型请求状态和 HTTP streaming 状态属于两种不同生命周期。将它们做成独立 actor，让 compaction、重试、取消、usage 和消息回灌各自保持单一所有权。

### 10.3 并发工具 + 路径锁

完全串行浪费模型一次返回多个独立工具调用的机会；完全并发又会制造同文件写冲突。Grok Build 的“并发 futures + path lock”是实用折中。

### 10.4 让终止条件成为一等状态

`max_turns`、TodoGate cap、goal decision、retry budget、subagent drain、permission rejection 都有显式 outcome，而不是依赖 prompt 说“不要无限循环”。

### 10.5 把恢复做成事件流 + 多份派生状态

`updates.jsonl` 是权威流，summary/plan/signals/index 是派生/辅助状态，rewind 是独立文件快照。该设计同时照顾 crash recovery、debug、search 和用户撤销。

### 10.6 安全机制必须看组合默认值

Grok Build 同时提供 permission、sandbox、hooks、worktree、rewind，但默认 sandbox off、审批首选项过宽、hooks fail-open。**有安全机制不等于默认安全**，产品评审必须分析组合行为。

---

### 不宜照搬的部分

1. **不要一开始就复制 79-crate 结构**：这是多年产品演进结果，不是新项目的最小架构。
2. **不要把内部遥测/managed config/relay 与通用 runtime 混为一层**：fork 时应先画部署依赖图再裁剪。
3. **不要照搬全局授权默认项**：首次审批默认应是 once，而不是 all sessions。
4. **不要把 fail-open hook 当安全策略引擎**：强制策略应进入 sandbox、tool runtime 或外部隔离边界。
5. **不要把 Stars 当社区评分**：本项目是最典型反例——热度爆炸，但公开协作面为零。
6. **不要在没有 tag/release provenance 时自动信任二进制更新**：至少要校验签名、checksum、source commit 对应关系。

---

## 总结

### 谁应该用

- 构建 coding agent、IDE agent、agent desktop、ACP client 的研发团队；
- 研究长上下文 compaction、可恢复会话、工具并发与多代理运行时的工程师；
- 需要对比 Claude Code / Codex 类闭源产品底层实现的人；
- 有 Rust 能力、愿意维护内部 fork 的平台团队。

### 谁不应该直接用

- 只想要一个小型 SDK 或容易改的 agent loop：优先 Pi；
- 期待通过 Issue/PR 与上游共同演进的团队；
- 需要稳定 semver、公开 release notes、CI badge 和可验证供应链的企业；
- 没有隔离环境，却要直接让 agent 操作生产仓和高权限凭证的用户。

### 下一步

#### 阶段 1：阅读

优先阅读：

1. `xai-grok-shell/src/agent/app.rs`
2. `xai-grok-shell/src/agent/mvp_agent/`
3. `xai-grok-shell/src/session/acp_session_impl/turn.rs`
4. `xai-grok-shell/src/session/acp_session_impl/tool_calls.rs`
5. `xai-chat-state/src/actor/`
6. `xai-grok-sampler/`
7. `xai-grok-sandbox/`
8. `xai-grok-shell/src/session/persistence.rs`

#### 阶段 2：隔离试用

- 临时仓库；
- sandbox workspace profile；
- 低权限、短期 token；
- 禁止自动全局授权；
- 暂不装第三方 plugin/MCP；
- 关闭 telemetry/trace/feedback 出站，确认网络行为后再按需开启。

#### 阶段 3：团队评估

至少观察 30–90 天：

- public sync 是否稳定；
- 是否出现 tag、release checksum/signature 与 source mapping；
- 安全修复同步延迟；
- 配置迁移与 breaking change；
- 是否出现可独立维护的社区 fork。

---

### 一句话评价

Grok Build 的源码证明了一件事：**现代 Coding Agent 的竞争已经从“模型 + shell 工具”进入“协议化 session runtime + 持久状态 + 并发工具 + 权限/隔离 + 多代理协调”的系统工程阶段。**

在源码层面，它是目前最值得拆解的完整样本之一：actor 边界清楚、ACP 内核化、tool loop 深、长任务恢复机制完整，测试资产和事故经验都显示它不是首发 demo。

但它当前不是成熟的社区开源项目。公开仓是单向同步镜像，不接受 Issue/PR 式协作，没有 GitHub release/tag/CI，公开历史无法支撑外部维护判断。极短观察窗口也使任何“稳定”“持续维护”“社区繁荣”的结论都不成立。

**最终建议：把它当高价值架构教材和可隔离试用的产品，不要暂时把它当可共同维护、可长期押注的开源基座。**

---

### 附录 A：动态验证边界

本报告完成了：

- canonical GitHub API / Git 数据核验；
- workspace、manifest、lockfile、文档与关键执行链静态审查；
- CLI → ACP → session → chat state / sampler → tool → persistence 的源码走读；
- permission、sandbox、hooks、MCP、memory、subagent 与 telemetry 风险审查。

本报告**没有**声称：

- `cargo build` 成功；
- 任一测试通过；
- 官方二进制与审查 commit 可复现对应；
- sandbox 在本机实际生效；
- 三种模型 backend 均已真实调用；
- 性能、token 成本或 benchmark 已实测。

原因：本次遵循无依赖安装、无构建/测试的源码审查边界，且分析环境没有 Cargo。以上均属于后续动态验证事项。

### 附录 B：证据来源

- `README.md`、`Cargo.toml`、`Cargo.lock`、`LICENSE`、`CONTRIBUTING.md`、`SECURITY.md`
- `crates/codegen/xai-grok-pager-bin/src/main.rs`
- `crates/codegen/xai-grok-shell/src/agent/app.rs`
- `crates/codegen/xai-grok-shell/src/agent/mvp_agent/`
- `crates/codegen/xai-grok-shell/src/session/acp_session.rs`
- `crates/codegen/xai-grok-shell/src/session/acp_session_impl/{turn,tool_calls,sampler_turn,run_loop}.rs`
- `crates/codegen/xai-chat-state/src/actor/`
- `crates/codegen/xai-grok-sampler/src/lib.rs`
- `crates/codegen/xai-grok-tools/src/registry/`
- `crates/codegen/xai-grok-sandbox/src/lib.rs`
- `crates/codegen/xai-grok-memory/src/lib.rs`
- `crates/codegen/xai-grok-telemetry/src/config.rs`
- `crates/codegen/xai-grok-pager/docs/user-guide/`
- GitHub REST API（仓库、提交、贡献者、issues、pulls、tags、releases、security advisories）
