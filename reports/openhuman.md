# openhuman

> 一句话定位：OpenHuman 是一个 Rust/Tauri 驱动的本地优先 personal AI / agent harness：它把桌面宿主、in-process Rust core、Memory Tree + Obsidian、tinyagents durable agent graphs、tinyflows workflow、SKILL runtime、模型路由、连接器同步、语音/会议代理和多 Agent 编排收进一个完整产品。它的学习价值依然极高，也适合做隔离试用和外围维护贡献；但 GPL-3.0、managed service 耦合、超宽攻击面、vendored CEF / submodule 复杂度与高速 beta 演进，仍让它不适合作为省心的生产底座。

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `tinyhumansai/openhuman` |
| URL | `https://github.com/tinyhumansai/openhuman` |
| Star | 34,347（2026-07-07 GitHub API 快照） |
| Fork | 3,357（2026-07-07 GitHub API 快照） |
| Watchers | 177（2026-07-07 GitHub API 快照） |
| 许可证 | GPL-3.0 |
| 主要语言 | Rust |
| 默认分支 | `main` |
| GitHub 创建时间 | 2026-02-18 |
| 本地首次提交 | 2026-01-27 / `577ffcd2` / 初始化 Tauri + React + TypeScript 骨架 |
| 最近提交 | 2026-07-07 / `77639d3bc` / `fix(flows): render + preserve non-cron trigger schedules on the canvas (B9) (#4647)` |
| 当前包版本 | `Cargo.toml` / `app/package.json` / `app/src-tauri/Cargo.toml` 均为 `0.58.12` |
| 最新 GitHub Release | `v0.58.7`（2026-06-30 发布） |
| 最新 tags | `v0.58.7`, `v0.58.1-staging`, `v0.58.0`, `v0.57.56-staging`, `v0.57.53`；自 2026-06-15 以来已新增 9 个 tags |
| 贡献者 | 本地 `git shortlog -sn --all` 共 151；头部：Steven Enamakel 1222、`github-actions[bot]` 286、`oxoxDev` 268 |
| Issue / PR | open issue 155；open PR 44；repo API `open_issues_count=199` 含 PR |
| 仓库体量 | 5,303 tracked files；Rust 2,395；TS 931；TSX 987；test-like tracked files 928；GitHub workflows 20 |
| 分析日期 | 2026-07-07 |
| 分析边界 | 只做源码、文档、Git 历史、GitHub API / Release / Issue / PR 静态分析；未运行项目、未启动服务、未跑测试/构建 |

## 版本变化速读（相对 2026-05 旧报告）

OpenHuman 在这段时间里继续从“本地优先桌面 AI 平台”长成更像 **personal AI OS / agent harness** 的完整产品：

- **Stars / forks 继续高增**：从 2026-05-17 的约 11.2k / 973 增至 2026-07-07 的约 34.3k / 3.36k。
- **源码已推进到 `0.58.12`，release 仍是 `v0.58.7`**：自 2026-06-15 以来新增 9 个 tags，说明 trunk 继续高速前进，源码与最新 installer/release 之间存在天然时间差。
- **`flows::` 已成为一等域**：`src/core/all.rs` 明确注册 `flows` controller；`src/openhuman/flows/mod.rs` 说明 saved automation workflows 已由 `tinyflows` graph + SQLite 持久层承接，不再只是“workflow UI 占位”。
- **`tinyagents` seam 更成熟**：`src/openhuman/tinyagents/mod.rs` 直接写明 chat route 已与 legacy `run_turn_engine` 达到 functional parity，说明 agent 主链已经明确收敛到 published harness。
- **`skill_runtime` 与 `flows` 需要分开理解**：前者负责 installed `SKILL.md` workflow 的执行、取消、run log；后者负责保存型 automation graph。旧报告里把两者揉成一个“workflow runtime”已经不够精确。
- **控制面继续变宽**：`src/core/all.rs` 现在把 flows、recall calendar、tinyagents replay、thread goals、memory sync、x402、tool registry、model council 等更多域拉进统一 RPC 控制面。
- **推理层统一仍在延续**：`src/openhuman/inference/mod.rs` 继续承担 local runtime、cloud provider、routing、voice/STT/TTS 与 OpenAI-compatible HTTP endpoint。
- **README 仍明确标注 Early Beta**：能力更完整了，但项目方自己并没有把它叙述成稳定产品；这和当前 issue/PR/tag 节奏是吻合的。

---

## 场景一：是否值得采用

### 解决的问题

OpenHuman 要解决的不是“聊天 UI”问题，而是“个人 AI 怎么持续认识我、替我使用工具、接入日常系统，并以桌面产品形态长期运行”的问题。

它的核心组合是：

- **桌面宿主**：Tauri v2 + CEF/WebView + React UI，面向 Windows / macOS / Linux 安装包。
- **Rust Core**：本地 in-process tokio core，仍通过 loopback HTTP / JSON-RPC 暴露统一控制面。
- **长期记忆**：Memory Tree + SQLite + Obsidian-compatible Markdown vault，把连接器数据 canonicalize / chunk / summarize / retrieve。
- **Agent 工具体系**：filesystem、shell、git、grep/glob、patch、browser、http、curl、web_fetch、MCP、Composio、cron、memory、task board、workflow、screen、voice 等。
- **模型与推理**：OpenHuman backend、BYO cloud provider、OpenAI-compatible/Anthropic-style、Ollama/local inference、STT/TTS、role-based routing。
- **连接器与通道**：Gmail、Slack、Notion、GitHub、Linear、Jira、Drive、Calendar、Telegram、WhatsApp、web channel、webhooks、Composio。
- **Flow / Skill runtime**：`flows::` + `tinyflows` 负责保存型 automation graph、触发器、run state 和可视化 canvas；`skill_runtime` 负责 installed `SKILL.md` workflow 的执行、取消、等待、失败 footer、preflight gate 和 degenerate-output detection。
- **Agent Orchestration**：`tinyagents` durable graph harness + 后台 agent command center + run ledger + agent teams + dependency-aware task claiming + replay / observability。

### 核心能力与边界

**能做什么：**

- 作为完整桌面 AI workspace 运行，而不是只提供 CLI 或 SDK。
- 把本地数据、连接器数据和 agent 运行状态写入可查询的本地状态层：Memory Tree、session DB、run ledger、Obsidian vault。
- 通过 controller registry 暴露 `openhuman.<namespace>_<function>` 形式的 JSON-RPC 控制面。
- 通过 tool registry 把系统能力投射给 agent，并用 security policy / approval gate / tool filter 做权限约束。
- 通过 managed Node / Python runtime 降低 MCP、workflow、script-backed skill 对用户本机环境的依赖。
- 通过 MCP client/server、Composio、workflow registry、skill registry、agent profiles 扩展生态入口。
- 通过 iOS experimental transport、devices domain、tunnel crypto 探索“桌面 core + 移动端 client”的未来形态。

**不能或不应高估的部分：**

- 不是轻量库；它是桌面宿主 + 本地 core + durable memory + durable run runtime + managed/local connector/inference 的重型产品单体。
- “Local-first”不是“完全离线”：README 仍明确默认体验会用 OpenHuman-hosted services 做账号登录、模型路由、web search proxy、Composio OAuth / managed integration flows。
- `flows`、`skill_runtime`、`tinyagents`、`memory tree` 现在都是真实运行时，不再只是概念；但概念面越多，越要求维护者先理解各自职责边界，否则很容易在错误层面修 bug。
- 直接闭源二开会碰 GPL-3.0 合规问题。
- 默认工具面与连接器面过宽，企业引入前必须重新做 tool policy、网络 egress、sandbox、credential、MCP allowlist、connector OAuth 与 managed-backend 依赖收敛。
- 文档、release、源码会出现时间差：README / GitBook / AGENTS / manifests / installer 不是同一个节奏，当前源码 `0.58.12` 领先最新 release `v0.58.7` 就是直接例子。

### 集成成本

- **依赖链重**：Rust 1.93、Node 24、pnpm 10.10、Tauri v2、vendored CEF、React 19、Vite 8、SQLite、Tokio/Axum、reqwest、socketioxide、whisper-rs、Playwright / WDIO / Vitest / cargo test 全都在同一产品里。
- **源码构建前置多**：README 明确要求 `git submodule update --init --recursive`，否则 vendored `tauri-cef` / `tinyagents` / `tinyflows` / `tinycortex` / `tinyjuice` / `tinychannels` / `tinyplace` 不完整。
- **分发复杂**：macOS x64/ARM、Linux、Windows、Homebrew、apt、MSI、CEF cache、installer smoke、release/staging workflow 都要维护。
- **状态面复杂**：workspace、action_dir、session_db、run_ledger、memory tree、Obsidian vault、credentials/keyring、agent profiles、flow state、run logs、connector cache、runtime caches。
- **安全配置成本高**：readonly/supervised/full、workspace_only、trusted_roots、approval gate、sandbox backend、HTTP/browser allowlist、MCP allowlist、managed-backend 边界都需要逐项收敛。
- **从零到 demo**：下载安装包试 UI 不难；但从源码跑起完整 desktop + core + CEF + connectors + local/managed provider + e2e 验证，显著重于普通 web app。


### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键库 / SDK。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| `tauri 2.10` + vendored `tauri-cef` + `cef = 146.4.1` | desktop host / runtime fork | 桌面宿主、CEF-only runtime、通知拦截、深链、单实例、原生窗口能力 | 把 agent 产品直接落到用户桌面，同时保留 Chromium 级浏览器能力 | `app/src-tauri/Cargo.toml` 对 `tauri-runtime-cef`、`cef` 和 `vendor/tauri-cef` 的路径 patch 注释非常直白 | 想做“真实桌面 agent”时很有参考价值 | 分发、签名、缓存、崩溃面都显著变重 |
| `tinyagents = 1.7` | orchestration harness | agent graph、tool/model registry、retry/fallback、replay、steering、store registry | 把单轮聊天升级成 durable graph turn 与多 agent 编排 | 根 `Cargo.toml` 注释 + `src/openhuman/tinyagents/mod.rs` | “先有 published harness，再做宿主适配”的路线值得学 | 宿主与 SDK 两层抽象叠加，调试复杂度高 |
| `tinyflows = 0.5` + `@xyflow/react` | workflow engine + canvas | saved automation graph、trigger、compile/run、workflow canvas | 让 workflow 从 prompt 文案变成可视 graph + durable run | 根 `Cargo.toml` 注释 + `src/openhuman/flows/mod.rs` + `app/package.json` | 适合需要 agent-proposed automation 的产品 | graph runtime、UI canvas、approval/trigger 三层要长期一起演进 |
| `tinycortex = 0.1` + `tinyjuice = 0.2.1` + `rusqlite = 0.40` | memory / token compression / local store | Memory Tree、token compression、session DB、run ledger、本地 durable context | 解决“长期认识用户”与“大上下文成本”问题 | 根 `Cargo.toml` 对 `tinycortex`、`tinyjuice`、`rusqlite` 的注释 | 对 personal AI / local-first agent 极有借鉴价值 | 一旦内存模型或压缩策略出错，影响面遍及全系统 |
| `tinychannels = 0.1` + `tinyplace = 2.0` + `socketioxide` | channel / A2A / transport | 多消息通道、agent-to-agent、relay/websocket、tiny.place 经济层 | 把 agent 从单桌面扩展到跨通道/跨实例协作 | 根 `Cargo.toml` 直接依赖 + README 的 17 channels / tiny.place 叙事 | 做多通道 agent 产品时很有参考性 | 外部状态、密钥、传输安全、运营复杂度同时上升 |
| `react 19` + `vite 8` + `redux toolkit` + `tailwind` + `radix` + `playwright/vitest` | UI stack | desktop/web 前端、canvas、command surfaces、test harness | 让 agent OS 有完整可交互产品面，而不只是 CLI | `app/package.json` | 对 UI-first agent 产品可直接借鉴 | 前端面广、组件多、回归成本高 |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | 高 | GPL-3.0；闭源产品二开、私有分发或深度嵌入前必须先做合规判断 |
| Bus factor | 中-高 | 作者总数已到 151，但头部提交仍明显集中在核心团队 |
| 安全攻击面 | 高 | 桌面宿主、本地 RPC、WebView/CEF、shell/file/browser/http/MCP/Composio/voice/screen/钱包/通道 都是边界 |
| Managed backend 耦合 | 中-高 | 可 BYO provider / local runtime，但默认账号、模型路由、search proxy、managed OAuth 仍依赖 OpenHuman 服务 |
| Vendored 依赖 / 构建复杂度 | 高 | `tauri-cef`、`tinyagents`、`tinyflows`、`tinycortex` 等 submodule / path patch 让源码构建和升级面更重 |
| 版本治理 / 发布噪音 | 高 | 当前源码版本 `0.58.12` 已领先最新 release `v0.58.7`；自 2026-06-15 以来新增 9 个 tags，采用方需要固定版本而不是追主干 |
| 维护复杂度 | 高 | 单仓承载桌面、core、memory、flows、skill runtime、agent orchestration、channels、mobile experiment、release matrix |
| 稳定性 | 中 | README 仍标 `Early Beta`；工程投入强，但能力面和变更速度都很高 |
| 文档一致性 | 中 | README / AGENTS / GitBook / manifests / installer 的更新节奏不同，需要以源码和当前 manifests 为准 |
| 生产安全默认值 | 中 | approval gate、policy、allowlist、sandbox 都在，但默认能力面过宽，组织级收敛工作量不小 |

### 结论

**结论：观望；推荐隔离试用、架构学习和外围维护，不建议直接作为闭源/企业生产底座。**

- 如果你想做 **个人本地 AI workspace / personal AI OS**，OpenHuman 是当前非常值得拆解的样本。
- 如果你想找 **长期记忆 + 工具执行 + 桌面宿主 + `tinyagents` / `tinyflows` / SKILL runtime** 的完整工程参照，它的学习价值很高。
- 如果你只是想要一个 **轻量 agent SDK / CLI / RAG 后端 / 企业知识库**，OpenHuman 太重。
- 如果你要在团队生产化，第一步不是部署，而是做许可证、安全 profile、tool allowlist、credential boundary、connector/OAuth 和 provider routing 的风险收敛。

---

## 维护 / 接管视角

### 能不能维护

能，但路线应是 **外围可信贡献 → 有测试的安全/状态修复 → 再逐步进入核心控制面**。不建议一开始碰 provider routing、memory tree ingest、core lifecycle、release matrix 或 workflow runtime 主线重构。

### 最适合的首批 PR 切入点

1. **文档口径修正**
   - 把“QuickJS skills runtime removed”与当前 `flows` / `skill_runtime` / `tinyagents` 的真实执行路径区分清楚。
   - 明确 `src/openhuman/skills` 偏 metadata / discovery，而 `src/openhuman/flows` + `src/openhuman/skill_runtime` 负责 saved flow / `SKILL.md` workflow 的运行、run log 和 cancellation。

2. **安全与隐私 hardening**
   - 近期 merged PR 已在 core RPC auth、secrets、deep-link CSRF、inference resilience 上推进。
   - 适合继续做：token/log redaction、Tauri IPC payload guard、browser allowlist、MCP write audit、prompt-injection gate、sandbox fallback 可观测性。

3. **测试补强**
   - `skill_runtime/run_machinery`：preflight failure、DONE/FAILED/CANCELLED/DEGENERATE footer。
   - `session_db/run_ledger`：agent run / workflow run / team task 状态一致性。
   - `agent_teams`：依赖环、claim token、unknown member、close semantics。
   - `security/policy`：readonly/supervised/full 对 command class 的 gate 决策。

4. **小型 UI / 状态稳定性**
   - command center、workflow recent runs、task board、provider health、core snapshot、approval card、i18n parity。

5. **低风险 read-only agent tool / MCP 能力**
   - 优先只读、可审计、默认开启风险低的能力；写操作和安装类工具必须先走 policy / approval / allowlist。

### 不建议一开始碰的区域

- Provider / inference routing 大改。
- Memory Tree ingest / summarization pipeline 重构。
- Tauri core lifecycle、RPC token、stale listener、embedded server 启停主线。
- CEF / installer / release / signing matrix。
- Composio managed backend、OAuth、webhooks、billing、web3/x402 这类外部状态耦合重的域。
- Flows / skill runtime / tinyagents 的整体架构重写，除非先读清 roadmap、现有 PR 和 run ledger 契约。

### 维护流程建议

- 先读 repo-local `AGENTS.md`；它比部分历史 GitBook 更接近当前工程约束。
- 一 issue 一 PR；不要顺手重构。
- 先定位 domain controller / tool registry / provider factory / run ledger，而不是直接在 JSON-RPC dispatch 或 UI 里加分支。
- 必须补测试；项目要求 changed-line coverage ≥80%。
- PR body 如实说明未运行的命令，不要伪造全量验证。

---

## 场景二：技术架构学习

### 核心架构图

```mermaid
graph TD
  User[User / Desktop UI / Channel] --> React[React 19 UI + Redux + Router]
  React --> Tauri[Tauri v2 Host / CEF / OS Bridge]
  Tauri -->|per-launch bearer + loopback HTTP| Core[In-process Rust Core]

  Core --> RPC[JSON-RPC Controller Registry]
  Core --> EventBus[Typed Event Bus]
  Core --> Config[Config / Profiles / Autonomy]
  Core --> Policy[SecurityPolicy / ApprovalGate / Sandbox]

  RPC --> Domains[src/openhuman/* domains]
  Domains --> Memory[Memory Tree + SQLite + Obsidian Vault]
  Domains --> SessionDB[Session DB WAL + FTS5 + Run Ledger]
  Domains --> Tools[Tool Registry]
  Domains --> Inference[Unified Inference / Provider Routing]
  Domains --> Workflows[Flows + Skill Runtime + Tinyflows]
  Domains --> Orchestration[Agent Orchestration / Teams / Command Center]
  Domains --> Connectors[Composio / Channels / Webhooks / Webviews]
  Domains --> MCP[MCP Client / Registry / Server]
  Domains --> Voice[Voice / Meet Agent / Screen Intelligence]
  Domains --> Runtime[Managed Node + Python Runtime]

  Tools --> External[Shell / File / Browser / HTTP / Git / MCP / Composio / Screen]
  Inference --> Providers[OpenHuman Backend / BYO Providers / Ollama / Local AI]
  Workflows --> RunLog[Run logs: DONE / FAILED / CANCELLED / DEGENERATE]
  Orchestration --> Ledger[Durable agent runs / team tasks]
```

### 架构分层

1. **宿主层：Tauri desktop + in-process core lifecycle**
   - 关键文件：`app/src-tauri/src/core_process.rs`、`AGENTS.md` runtime scope。
   - 设计点：core 不再作为旧 sidecar 泄漏在外，而是在 Tauri host 内作为 tokio task 启动；同时保留 loopback HTTP / JSON-RPC 边界，让 renderer、CLI、测试和 debug external core 共享协议。

2. **控制层：JSON-RPC controller registry**
   - 关键文件：`src/core/all.rs`、`src/core/jsonrpc.rs`、`src/core/auth.rs`。
   - 设计点：所有 domain controller 通过 `RegisteredController` + schema 进入 `openhuman.<namespace>_<function>` 方法空间；internal-only controllers 单独注册，不进入 agent-facing schema catalog。

3. **策略层：Config / SecurityPolicy / Approval / Sandbox**
   - 关键文件：`src/openhuman/config/`、`src/openhuman/security/policy/`、`src/openhuman/approval/`、`src/openhuman/sandbox/`。
   - 设计点：agent access 分为 readonly / supervised / full，配合 `workspace_only`、`trusted_roots`、`allow_tool_install`、command classification、approval gate 和 sandbox backend。

4. **能力层：Tool registry + MCP + connectors**
   - 关键文件：`src/openhuman/tools/ops.rs`。
   - 设计点：工具从 baseline coding tools 扩展到 memory、monitor、browser/http/curl、MCP setup/bridge、workflow、skill registry、threads、task sources、artifacts、learning、screen、presentation、x402/web3 等；浏览器 allowlist 明确不继承 fetch 的 `*` wildcard，是一个值得学习的 fail-safe 收敛。

5. **状态层：Memory Tree + Session DB + Run Ledger**
   - 关键文件：`src/openhuman/memory_tree/mod.rs`、`src/openhuman/session_db/mod.rs`、`src/openhuman/session_db/run_ledger/mod.rs`。
   - 设计点：Memory Tree 负责长期知识；session DB 用 SQLite WAL + FTS5 给 transcript、messages、tool calls、cost、parent/child lineage 做可查询索引；run ledger 给后台 agent/workflow/team 提供 durable 状态。

6. **执行层：`tinyagents` harness + `flows`/`tinyflows` + `skill_runtime` + orchestration**
   - 关键文件：`src/openhuman/tinyagents/mod.rs`、`src/openhuman/flows/mod.rs`、`src/openhuman/tinyflows/mod.rs`、`src/openhuman/skill_runtime/run_machinery.rs`、`src/openhuman/agent_orchestration/mod.rs`。
   - 设计点：一次 agent turn、一个 saved flow run、一个 installed skill workflow run、一个 background subagent、一个 team task 都逐步进入“可取消、可查询、可恢复、可展示”的 runtime 状态，而不是只靠 prompt 内部记忆。

7. **生态层：providers / Composio / MCP / mobile experiment**
   - 关键文件：`src/openhuman/inference/`、`src/openhuman/composio/`、`src/openhuman/mcp_registry/`、`src/openhuman/devices/`。
   - 设计点：OpenHuman 同时尝试接模型、连接器、MCP server、移动端 client 和桌面 provider webviews，生态入口多，但也显著增加外部状态与安全边界。

---

### 底层技术架构

#### 最小架构内核

> OpenHuman 可复刻的最小内核是：`Desktop Host + Local RPC Control Plane + Capability Registries + Durable Personal Context Store + Agent Tool Settlement + Policy/Approval/Sandbox Gate + Background Run Ledger + Managed Runtime Bridge`。

解释：

- **Desktop Host** 让 agent 拥有真实本机上下文和 OS 能力。
- **Local RPC Control Plane** 让 UI、CLI、测试、agent tools 共享一个协议面。
- **Capability Registries** 把 domain、tool、provider、MCP、workflow、profile 变成可发现、可过滤、可授权的能力单元。
- **Durable Context Store** 让 agent 从“本轮聊天”进化到“长期认识用户”。
- **Tool Settlement** 把模型意图转换成受权限约束、可审计、有结果的外部动作。
- **Policy/Approval/Sandbox Gate** 是本地 agent 安全底线。
- **Background Run Ledger** 让长任务、多 agent、workflow 不再依赖前端连接和 prompt 临时状态。
- **Managed Runtime Bridge** 让 Node/Python/MCP/script-backed workflows 在普通用户机器上可控运行。

#### 核心抽象

| 抽象 | 职责 | 关键对象 / 方法 | 为什么重要 |
|------|------|----------------|------------|
| `CoreProcessHandle` | 管理 embedded core 生命周期、端口、token、shutdown/restart | `ensure_running()`、per-launch bearer、`OPENHUMAN_CORE_TOKEN` | 桌面产品既要生命周期可控，又要保留本地 RPC 边界 |
| `RegisteredController` / `ControllerSchema` | 统一 domain RPC schema 和 handler | `build_registered_controllers()`、`rpc_method_name()` | 把平台能力从 ad-hoc dispatch 变成可枚举控制面 |
| `SecurityPolicy` | 约束 agent 工具读写、网络、安装、破坏性动作 | `CommandClass`、`GateDecision`、trusted roots | 本地 agent 能动系统必须先有 fail-closed policy |
| `Tool` registry | 把外部能力暴露给 agent | `all_tools_with_runtime()`、tool allowlist、permission level | agent OS 的真实能力边界，不是 UI 功能清单 |
| `Config` / `AgentProfile` | 存储用户、agent、runtime、权限、模型、memory source 设置 | TOML config、`agent_profiles.json`、profile allowlists | 同一个系统要支持不同 agent persona 和能力包 |
| `Memory Tree` | 将邮件/聊天/文档等变成 chunk、summary tree、retrieval surface | `ingest`、`retrieval`、`tree_runtime` | 个人 AI 的核心资产是长期上下文，而不是聊天记录 |
| `Session DB` / `Run Ledger` | 持久化 session、messages、tool calls、agent runs、workflow runs、teams | SQLite WAL + FTS5、`run_ledger` | 支持搜索、恢复、命令中心和后台 agent 可观测性 |
| `Inference` / provider routing | 统一 local/cloud/voice/http/model context | `inference.*` controllers、provider factory | 模型调用从单 provider 变成按 workload role 路由 |
| `Workflow` / `SkillRuntime` | 发现、运行、取消、等待 `SKILL.md` workflow | `spawn_workflow_run_background()`、run log footer | 把技能从文档/metadata 推进为可运行工作流 |
| `AgentOrchestration` | 管理 background agents、teams、dependency-aware tasks | `command_center`、`agent_teams`、`workflow_runs` | 多 agent 不是 feature list，而是 durable coordination state |
| `MCP / Composio Registry` | 接入外部工具生态和 OAuth integrations | MCP list/call/install、Composio provider registry | 扩展性主要来自协议和连接器，不是 hardcode 每个工具 |

#### 控制面 / 数据面

**Control Plane：**

- Tauri core lifecycle：core 启停、token、端口、stale listener、debug attach。
- JSON-RPC registry：domain method schema、handler、internal-only 分离。
- Config / profiles：模型、权限、tool/MCP/skill allowlist、memory sources、runtime flags。
- Security / approval / sandbox：command classification、path roots、prompt/block/allow、OS/container jail。
- Provider / inference routing：模型 role、local/cloud backend、context window、reliability。
- Workflow / orchestration：preflight gate、iteration cap、cancel token、run status、command center grouping。

**Data Plane：**

- Memory ingest / retrieval：连接器数据、chunks、summary tree、Markdown vault、SQLite。
- Tool execution：shell/file/git/http/browser/curl/screen/MCP/Composio/web3/x402 side effects。
- Provider calls：LLM、STT、TTS、embeddings、vision/local runtime。
- Webview / connectors：Gmail、Slack、WhatsApp、Meet、provider webviews、OAuth flows。
- Session and run writes：messages、tool calls、cost、run logs、agent team tasks。

评价：OpenHuman 的控制面抽象比普通 agent app 强很多，但数据面也过宽。长期风险不是“有没有抽象”，而是这些 registry 是否能持续避免变成中心化大泥球。

#### 关键执行链路

#### 链路 A：桌面启动与 RPC

```text
User opens desktop app
  ↓
Tauri host starts / checks CoreProcessHandle
  ↓
Generate per-launch bearer token + choose loopback port
  ↓
Run embedded Rust core tokio task
  ↓
Renderer obtains token via core_rpc_token Tauri command
  ↓
React services call core_rpc_relay
  ↓
JSON-RPC dispatches to RegisteredController
  ↓
Domain handler returns RpcOutcome / frontend updates state
```

#### 链路 B：Agent tool call settlement

```text
User / channel prompt
  ↓
Agent harness builds model turn + available tools
  ↓
Model emits tool call intent
  ↓
Tool registry resolves tool implementation
  ↓
SecurityPolicy classifies command/path/network/install/destructive risk
  ↓
GateDecision = Allow / Prompt / Block
  ↓
Optional ApprovalGate / Sandbox backend
  ↓
Tool executes side effect or read operation
  ↓
Audit / session_db tool_call / message result persisted
  ↓
Result returns to model continuation
```

#### 链路 C：Memory Tree ingest and recall

```text
Connector / channel / document source emits new data
  ↓
Source identity and collection scope resolved
  ↓
Ingest pipeline canonicalizes and chunks payload
  ↓
Transaction claims source ingest for idempotency
  ↓
Chunks written to SQLite + Markdown vault / pending extraction queue
  ↓
Tree scoring / summarization / entity extraction updates summaries
  ↓
Retrieval tools expose tree reads to agent
  ↓
Agent receives compressed, source-attributed context
```

#### 链路 D：SKILL workflow runtime

```text
User / agent calls workflows_run or run_workflow
  ↓
Registry resolves installed SKILL.md workflow + required inputs
  ↓
Optional preflight gate runs synchronously
  ↓
spawn_workflow_run_background creates run_id + log_path
  ↓
Detached orchestrator agent runs with workflow guidelines and inputs
  ↓
Progress events drain to run log
  ↓
Cancel token / max iterations / repeated-line detector guard execution
  ↓
Footer written: DONE / FAILED / CANCELLED / DEGENERATE
  ↓
await_workflow / command center / recent runs read terminal outcome
```

#### 状态模型

**持久状态：**

- `Config` TOML：provider、runtime、autonomy、browser/http allowlist、workspace/action dirs。
- `<workspace>/session_db/sessions.db`：SQLite WAL + FTS5 session/message/tool-call/cost/lineage index。
- `session_raw/*.jsonl`：KV-cache resume 的原始 transcript source of truth。
- Memory Tree / memory store：SQLite、chunks、summary trees、entity/context indexes。
- Obsidian-compatible Markdown vault：用户可读写的知识副本。
- `agent_profiles.json`：agent persona、SOUL、model defaults、tool/skill/MCP/connectors/memory allowlists。
- workflow / skill run logs：`DONE / FAILED / CANCELLED / DEGENERATE` footer。
- Credentials / keyring / local encryption store。
- Managed Node/Python runtime cache。

**运行时状态：**

- core port、per-launch bearer、shutdown token、restart lock。
- event bus subscriptions、native request handlers。
- active approval requests、interactive chat turn parking、10-minute TTL。
- in-memory tool bootstrap state：NodeBootstrap / PythonBootstrap。
- active MCP connections、webview scanner sessions、Socket.IO backend state。
- running background agents、cancel tokens、team task claims、workflow progress channels。

**外部状态：**

- OpenHuman managed backend：sign-in、model routing、web search proxy、managed Composio/OAuth。
- LLM providers、Ollama/local inference runtime、STT/TTS providers。
- Composio integrations、Gmail/Slack/Notion/GitHub/Linear/Jira/Drive/Calendar。
- Browser/WebView logged-in sessions、desktop apps、screen/voice devices、Meet call state。
- MCP servers、npm/Python package ecosystems、GitHub Releases/package managers。
- Mobile tunnel / device pairing / cloud transport for experimental iOS client。

#### 契约边界

**内部契约：**

- `ControllerSchema` + `RegisteredController`：domain RPC schema and handler。
- `Tool` trait：name、description、schema、permission level、execute result。
- `SecurityPolicy`：command/path/network/install/destructive classification。
- `Config` schema：runtime、provider、autonomy、browser/http、workspace/action roots。
- `Memory Tree` chunk / tree / retrieval request / write outcome types。
- `RunLedger`：agent run、workflow run、team task statuses。

**外部契约：**

- Loopback HTTP / JSON-RPC：`openhuman.<namespace>_<function>`。
- Tauri commands：`core_rpc_relay`、`core_rpc_token`、`start_core_process`、`restart_core_process` 等。
- MCP protocol：stdio / HTTP tool listing and calls。
- OpenAI-compatible `/v1/chat/completions` endpoint and provider adapters。
- Native package install channels：Homebrew、apt、MSI、GitHub Releases。

**Agent-facing 契约：**

- Tool schemas and permission semantics。
- `SKILL.md` workflow contract：definition、inputs、system prompt/guidelines、resources。
- Workflow run log contract：header + progress + terminal footer。
- Agent profiles：SOUL、tool/skill/MCP/memory allowlists。
- Approval card / prompt contract：external-effect action must be user-observable when policy says Prompt。

#### 失败与降级模型

| 失败类型 | 检测方式 | 降级 / 恢复 | 可观测信号 |
|----------|----------|-------------|------------|
| Core listener stale / port conflict | `ensure_running()` / health probe / token check | 识别 stale listener、restart lock、debug reuse existing | logs、health endpoint、frontend boot gate |
| RPC token/auth failure | bearer validation / 401 | 重新启动 core、刷新 token、拒绝未授权 caller | 401、auth logs、core snapshot |
| Tool/path 越权 | SecurityPolicy path/root check | fail-closed block 或 approval prompt | `POLICY_BLOCKED` / approval request |
| Browser allowlist 过宽 | `browser_allowed_domains()` stripping `*` | 浏览器不继承 fetch allow-all；需显式 env 开启 | debug log、browser tool denied |
| Provider/backend outage | health/model errors、recent issue #3686 | BYO provider、local/Ollama、retry/fallback；但 managed features 可能不可用 | dashboard model health、provider error |
| Context length / long conversation | model context / token errors | compression、TokenJuice、thread/session strategies | issue #3606、model error |
| Workflow preflight failure | preflight gate before spawn | 不启动 orchestrator，写 FAILED footer | run log with `[preflight:*]` |
| Workflow low-entropy loop | repeated-line detector | 写 DEGENERATE footer，停止伪结果 | run log footer `DEGENERATE` |
| User cancels workflow | cancel token | drop run future, footer `CANCELLED` | recent runs / log footer |
| Memory ingest partial failure | transaction / job status | unrecoverable vs recoverable job status 分离 | memory job status、logs |
| Connector/OAuth failure | managed backend / Composio error | direct mode / reconnect / status surface | connection status、sync errors |
| Sandbox backend unavailable | backend probe | Docker/local jail/noop fallback + Rust path hardening | sandbox status / policy info |

#### 可复刻设计不变量

1. **本地 agent 产品必须先有权限模型，再暴露工具面。** 工具越宽，policy / approval / audit 越不能后补。
2. **桌面宿主与 core 可同进程，但协议边界不能消失。** In-process core 解决生命周期，loopback RPC 保留可测性和解耦。
3. **能力必须 registry 化。** Controller、Tool、Provider、MCP、Workflow、Profile 都要可枚举、可验证、可过滤。
4. **Agent long task 必须有 durable run ledger。** 长任务不能只活在前端连接或 prompt history 里。
5. **Workflow run 必须有终态。** DONE、FAILED、CANCELLED、DEGENERATE 都要落盘，不能留下“看起来还在跑”的幽灵状态。
6. **Memory 不是向量库塞数据，而是 source identity + idempotent ingest + chunk lifecycle + retrieval contract。**
7. **浏览器自动化要比 HTTP fetch 更保守。** 真实浏览器带 cookie 和登录态，不能继承 `*` allow-all。
8. **Managed runtime 是产品能力，不只是安装脚本。** Node/Python resolution、download、atomic install、PATH injection、cache 和错误可观测性都要设计。
9. **文档口径必须跟随架构收缩。** QuickJS runtime removed、新 skill_runtime 出现这类变化必须写清，否则贡献者会在错层面工作。
10. **“Local-first”要诚实标注 managed service 边界。** 用户数据可本地，但账号、路由、OAuth、搜索代理、webhook 仍可能是外部状态。

---

## 架构解剖

### 目录结构

- `app/`：`openhuman-app` workspace，Vite + React UI、Tauri desktop host、Vitest/WDIO E2E。
- `app/src-tauri/`：Tauri host，负责 desktop shell、core lifecycle、CEF/WebView、CDP/scanners、dictation、screen capture、Meet/audio/video、native windows。
- `src/`：Rust crate `openhuman` + `openhuman-core` CLI binary。
- `src/core/`：transport/control plane：JSON-RPC、auth、controller registry、event bus、logging、observability、CLI adapter。
- `src/openhuman/`：业务 domains，当前包含 agent、memory、tools、inference、flows、skill_runtime、tinyagents、tinyflows、tinycortex、tinyjuice、tinychannels、tinyplace、session_db、agent_orchestration、security、sandbox、MCP、Composio、channels、devices、web3/x402 等大量模块。
- `docs/` / `gitbooks/`：公开与内部文档；以 repo-local `AGENTS.md` 和源码为当前事实优先级更高。
- `.github/workflows/`：20 个 workflows，覆盖 build、test、coverage、typecheck、E2E、desktop build、mobile compile、release、installer smoke、weekly review。
- `packages/`：deb/homebrew/npm/Tauri plugin 等分发与插件包。
- `scripts/`：debug runners、mock API、release、CEF、agent batch、test planning、fixtures。
- `remotion/`：mascot/runtime assets 渲染资源。

### 技术栈

- **桌面 / 前端**：Tauri v2、vendored CEF、React 19、TypeScript、Redux Toolkit、React Router 7、Vite 8、Radix/Tailwind、XYFlow、Vitest、Playwright、WDIO。
- **Core**：Rust 2021、Tokio、Axum、reqwest、rusqlite、socketioxide、tokio-tungstenite、clap、tracing、Sentry/OpenTelemetry、path-patched `tinyagents` / `tinyflows` / `tinycortex` / `tinyjuice` / `tinychannels` / `tinyplace`。
- **AI / Inference**：OpenHuman backend、OpenAI-compatible、Anthropic-style、Ollama/local runtime、STT/TTS、Whisper/Piper、model routing。
- **Tools / Integrations**：MCP HTTP/stdio、Composio、Gmail/Slack/Notion/GitHub/Linear/Jira/Drive/Calendar、browser/webview、curl/http/web_fetch、screen/voice/Meet、flows canvas。
- **Runtime**：managed Node.js、managed Python。
- **Storage / Security**：SQLite WAL + FTS5、OS keychain、Argon2、AES-GCM/ChaCha20Poly1305、per-launch bearer token、policy/approval/sandbox。
- **CI/CD**：Vitest、Playwright/WDIO、cargo test、cargo-llvm-cov、diff-cover ≥80% changed-line coverage、GitHub Actions workflows、desktop/mobile/release smoke。

### 模块依赖关系

- React UI 通过 Tauri commands 获取 core RPC URL/token，再经 `core_rpc_relay` 调用 Rust core。
- Rust core 用 `src/core/all.rs` 聚合 domain controllers，暴露 RPC / CLI / schema discovery。
- Agent harness 从 config/profile 构造可用 tools、MCP、skills、memory sources、provider choices。
- Tool registry 依赖 SecurityPolicy、AuditLogger、RuntimeAdapter、Node/Python bootstrap、action_dir、config allowlists。
- Memory ingest、session DB、run ledger 为 agent 和 UI 提供长期状态与可查询历史。
- `flows::` / `tinyflows` 与 `skill_runtime` 都复用 agent / ledger / observability 能力，但前者是保存型 graph automation，后者是 installed `SKILL.md` workflow 执行。
- Connectors/MCP/Composio/webviews 把外部状态接入 memory 和 tool surface。

### 扩展机制

- **Controller Registry**：新增 domain controller 后统一进入 JSON-RPC / schema。
- **Tool Registry**：新增 agent tool 后进入 agent tool-call pipeline，受 policy/filter 控制。
- **Provider / Inference Factory**：按 workload role 接入 cloud/local/voice/http provider。
- **MCP Registry**：搜索、安装、连接、list tools、call tool。
- **Composio Provider Registry**：管理 OAuth integrations 和 toolkits。
- **Workflow / Skill Registry**：发现、安装、运行 `SKILL.md` workflows。
- **Agent Profiles**：用 persona、SOUL、allowlists 组合不同 agent flavors。
- **Agent Teams / Workflow Runs**：把多 agent 协同变成 durable state。
- **Managed Runtime**：通过 Node/Python bootstrap 接外部 tool/script 生态。

---

## 质量与成熟度

### 代码质量

优点：

- Rust domain 切分明显，`mod.rs` 多数只做 export，业务逻辑放 `ops.rs` / `store.rs` / `schemas.rs` 的约束写进 AGENTS.md。
- controller registry、tool registry、provider routing、`tinyagents`、`flows` / `tinyflows`、run ledger 等抽象能看出持续平台化意图。
- 安全路径不是纯文档：policy tests、approval gate、browser allowlist stripping、internal-only controllers、e2e reset feature gate 都是实码。
- 新增大功能通常伴随 tests 或 debug runner；仓库当前仍有 928 个 test-like tracked files，测试投入保持在较高水平。
- 对失败状态有类型化意识：workflow footer、preflight gate、DEGENERATE detector、run cancel、memory unrecoverable failure 分流。

问题：

- 控制面过宽，`src/core/all.rs` 和 `src/openhuman/tools/ops.rs` 已经是事实上的能力地图，也最容易变成上帝注册表。
- 产品面过满：desktop、memory、agent、flows、skill runtime、MCP、connectors、voice、screen、mobile、payments/web3 同仓推进，长期维护压力大。
- 文档口径仍要经常核实；例如 `flows`、`skill_runtime`、`tinyagents`、release/installers 的节奏并不总同步。
- 默认 managed experience 与 local-first 叙事之间需要持续保持透明，否则用户会误判数据/服务边界。
- 部分外部状态（Composio、OpenHuman backend、provider webviews、OAuth、MCP packages）难以通过纯单元测试完全覆盖。

### 测试

- `AGENTS.md` / README / package scripts 共同指向 Vitest、Rust tests、Playwright / WDIO E2E、mock backend、coverage gate。
- `.github/workflows/coverage.yml` 对 PR changed lines 要求 ≥80%。
- `scripts/debug/` 提供 summary-sized stdout 的 unit/e2e/rust/logs runner，适合 agent 维护时降低输出噪音。
- GitHub workflows（当前 20 个）包含 test/typecheck/coverage/e2e/installer smoke/build desktop/iOS/Android compile/release。
- 本次未运行测试或构建，结论只来自源码、文档、Git 历史、CI 配置和 GitHub API 静态阅读。

### CI/CD

- 20 个 workflow 文件，覆盖 desktop build、Windows build、Android/iOS compile、coverage、typecheck、E2E、installer smoke、release packages、release staging/production、uptime monitor、weekly code review。
- Release automation 成熟度高，但也说明项目分发面已经非常复杂。
- 对贡献者而言，CI 是优点；对接管者而言，CI matrix 本身也是成本。

### 文档质量

- README 对 install、managed/local 边界、Memory Tree、integrations、TokenJuice、agent harness 对比写得比早期更诚实。
- AGENTS.md 非常关键：它定义 runtime scope、security policy、module shape、testing、debug logging、feature workflow、platform notes。
- GitBook 提供较完整 public docs，但历史架构页可能落后于源码。
- 新贡献者文档足够多；选型者需要具备“源码优先、AGENTS 次之、README/GitBook 再校验”的阅读顺序。

### Issue / PR 健康度

- 2026-07-07 快照：open issue 155、open PR 44；repo API `open_issues_count=199` 含 PR。
- 最近提交与 tags 仍然非常活跃：当前 HEAD 已到 `0.58.12` 源码，最新 release 仍是 `v0.58.7`，自 2026-06-15 以来新增 9 个 tags。
- 这说明项目维护强度很高，但也意味着 adopting 方必须接受持续 release noise、installer/source 时间差和 trunk 高频变化。

---

## 社区与生态

### 社区评价

- 34.3k+ stars、3.3k+ forks、177 watchers，而且项目创建时间很短，增长速度仍然异常快。
- Product Hunt / Trendshift / Discord / Reddit / X / GitBook 都已接入传播和社区入口。
- 本地 `git shortlog -sn --all` 已见 151 位作者，说明它不是“README 项目”，但方向感仍明显集中在核心团队。

### 生态强信号

- 方向清晰：local memory、desktop-first、personal AI、connectors、agent tools、managed/local hybrid。
- 工程投入强：CI、coverage、desktop release、installer smoke、debug runner、agent workflow docs。
- 源码持续吸收 coding-agent runtime 模式：todo/task board、`tinyagents`、`flows` / `tinyflows`、command center、agent teams、run ledger、MCP。
- README 开始明确 managed services 边界，比“纯 local-first”营销更可信。

### 采用痛点

- issue/PR 与 tag 节奏都高，source/release/installer 时间差会给采用方带来版本治理压力。
- 生态仍以官方产品、官方 registry 与官方托管体验为中心，第三方插件市场成熟度仍需观察。
- Head contributor 仍集中，项目方向和速度高度依赖核心团队。
- 默认功能面太宽，用户和维护者都容易低估安全/状态/发布复杂度。

### 衍生项目 / 插件生态

- README 提到 `agentmemory` 可作为 optional memory backend，说明它在尝试与其他 coding agents 共享 durable memory。
- Skills / flows 生态仍在快速重构：`flows/`、`skill_registry/`、`skill_runtime/`、`tinyflows/` 都已是活跃主线，但第三方生态成熟度仍需观察。
- MCP registry / setup tools / generic MCP bridge 是最现实的外部工具生态入口。
- Composio integrations 给“118+ third-party integrations”提供能力来源，但 managed backend / OAuth / webhook 是真实边界。

### 竞品对比

**直接竞品 / 同层参照：**

- `openagent`：自托管 Web agent workbench；更适合轻量 PoC 和团队后台，桌面/本地记忆深度不如 OpenHuman。
- `UI-TARS-desktop`：GUI agent / desktop automation 平台；更偏 computer-use 和远程/浏览器自动化，不是 personal memory OS。
- `OpenInterpreter/open-interpreter`：自然语言操作计算机的开发者工具；更轻，长期记忆和桌面产品闭环弱。

**邻近替代：**

- `Dify` / `Flowise` / `LangGraph`：团队 agentic workflow/app platform，不是个人桌面 OS。
- `Open WebUI` / `LobeChat`：多模型/agent UI 工作台，部署和使用更轻，但 OS/tool/memory/desktop 深度不同。
- `Onyx` / `RAGFlow`：企业知识助手/RAG，不直接替代 OpenHuman 的桌面 agent harness。
- `Claude Code` / `Codex` / `Hermes Agent`：终端/开发者 agent runtime，可替代部分 coding/tool workflow，但不是同一桌面产品层。

**架构邻居：**

- `jcode` / `OpenCode`：durable coding-agent runtime、tool settlement、session/recovery 设计值得与 OpenHuman 的 agent harness 对照。
- `mem0` / `agentmemory`：长期记忆抽象与多 agent memory backend。
- `RAGFlow` / `LightRAG`：ingest/retrieval/graph memory 的架构参照。
- Tauri/Rust desktop stack：OpenHuman 的独特价值在于把 agent runtime 下沉到桌面 core。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 5 | Memory、tools、providers、channels、voice、MCP、flows、skill runtime、agent teams、screen、connectors、mobile experiment 等面极广 |
| 代码质量 | 4 | Rust 工程化强、测试多、抽象清晰；但胖核心和中心注册表膨胀明显 |
| 文档质量 | 4 | README/AGENTS 完整且越来越诚实；历史 GitBook/旧口径仍需源码校验 |
| 社区活跃度 | 4 | stars/PR/release 活跃；但 issue/PR 堆积、核心贡献集中、深度生态早期 |
| 架构设计 | 5 | in-process core、RPC registry、tool policy、memory tree、`tinyagents`、`tinyflows`、run ledger 都有学习价值 |
| 学习价值 | 5 | 是 personal AI OS / desktop agent harness 的高密度案例 |
| 可借鉴度 | 4 | 单点模式非常可借鉴；整体复制成本高且 GPL/managed backend 约束强 |
| 维护可接入度 | 4 | 文档/CI/issues 足够，适合外围贡献；核心模块门槛高 |
| 生产安全成熟度 | 3 | 安全投入明显，但攻击面太宽，仍处 early beta |

---

## 关键代码走读

### 1. `app/src-tauri/src/core_process.rs`

职责：Tauri host 里的 core lifecycle 管理。

看点：

- in-process core tokio task，而不是旧 sidecar。
- per-launch bearer token，通过 Tauri command 给 renderer。
- 支持 `OPENHUMAN_CORE_REUSE_EXISTING=1` 外部 core debug。
- 生命周期、端口、shutdown/restart lock 是桌面 agent 产品可靠性的关键。

评价：这是 OpenHuman “桌面产品 + 本地服务”架构最值得学习的文件之一。

### 2. `src/core/all.rs`

职责：全系统 controller registry。

看点：

- `build_registered_controllers()` 展示真实产品版图。
- domain 覆盖 about、app_state、audio、composio、cron、flows、task_sources、dashboard、mcp_registry、agent、tinyagents replay、profiles、agent_registry、agent_experience、health、doctor、security、approval、artifacts、heartbeat、http_host、cost、x402、channels、config、inference、embeddings、screen、sandbox、skill_runtime、skill_registry、memory、wallet、web3、meet、devices、session_db、agent_orchestration 等。
- internal-only controllers 与 agent-facing schema discovery 分开。

评价：比 README 更能说明 OpenHuman 到底已经长成什么平台。

### 3. `src/openhuman/tools/ops.rs`

职责：agent capability composition root。

看点：

- baseline coding tools：shell/read/write/grep/glob/list/edit/patch/csv。
- 多 agent control flow：spawn_subagent、async subagent、steer/wait/continue、parallel agents、todo、plan_exit。
- workflow/skill surface：run_workflow、await_workflow、workflow list/describe/read resource/recent runs/log/create/install/uninstall。
- memory/search/people/learning/thread/task/artifact/system/credential/screen/MCP/web3/x402 工具大量注册。
- browser allowlist 明确剥离 `*`，避免真实 Chromium 继承 fetch allow-all。

评价：这是 OpenHuman 最接近“agent OS kernel”的文件；也是未来复杂度和安全风险的集中点。

### 4. `src/openhuman/skill_runtime/run_machinery.rs`

职责：后台 installed `SKILL.md` workflow run 的生成、取消、轮询和终态记录。

看点：

- `spawn_workflow_run_background()` 同时服务 JSON-RPC 和 `run_skill` / `run_workflow` agent tool。
- preflight gate 在 spawn 前同步失败，并写 FAILED footer。
- detached orchestrator agent 运行单个 skill guidelines + inputs。
- max iterations、cancel token、run log drain、DONE/FAILED/CANCELLED/DEGENERATE footer。
- repeated-line detector 把低熵循环识别为 `DEGENERATE`，避免伪成功。

评价：这依然是理解 OpenHuman 的关键文件之一，但现在必须与 `flows::` / `tinyflows` 分开看：它负责的是 installed skill workflow runtime，不是保存型 flow graph 本身。

### 5. `src/openhuman/session_db/mod.rs`

职责：durable agent session database。

看点：

- SQLite WAL + FTS5。
- session、messages、tool calls、cost metadata、parent/child lineage。
- `session_raw/*.jsonl` 仍是 KV-cache resume source of truth，session DB 提供查询、搜索和 recovery index。

评价：这说明 OpenHuman 在把 agent 运行历史从“日志文件”升级成产品查询层。

### 6. `src/openhuman/agent_orchestration/mod.rs`

职责：高层 agent-to-agent coordination domain。

看点：

- `running_subagents`、`workflow_runs`、`worktree`、`agent_teams`、`command_center`。
- `command_center` 是 run ledger 的只读产品投影。
- `agent_teams` 用 run ledger 创建 teams、members、dependency-aware tasks、claim、message、close。

评价：OpenHuman 正在把多 agent 协作从“模型临时分工”变成 durable coordination state。

### 7. `src/openhuman/inference/mod.rs`

职责：统一推理域。

看点：

- local runtime、cloud/local provider trait、routing reliability、STT/TTS、OpenAI-compatible HTTP endpoint 都收进 `inference.*`。
- 旧 `local_ai_*` RPC 走 legacy alias。

评价：这是从“功能堆叠”向“模型能力控制面”收敛的必要重构。

### 8. `src/openhuman/memory_tree/mod.rs`

职责：summary-tree memory engine。

看点：

- bucket-seal cascade、scoring、embedding、entity extraction、retrieval、summarisation。
- flavor-agnostic tree mechanics 与具体 memory policies 分离。

评价：OpenHuman 的核心护城河不在 chat UI，而在长期上下文如何被稳定写入、压缩和读出。

---

## 总结

### 一句话评价

OpenHuman 是一个快速膨胀但工程密度很高的本地优先 personal AI / agent harness：它真正值得学习的不是 UI，而是如何把桌面生命周期、RPC 控制面、权限策略、工具执行、长期记忆、`tinyagents` / `tinyflows` / `skill_runtime`、session/run ledger 和外部连接器整合成一个可长期运行的 agent 产品。

### 谁应该用

- 想做 desktop AI / personal AI workspace / 本地长期记忆产品的人。
- 想学习 Rust/Tauri + local RPC core 的团队。
- 想拆 agent tool policy、approval gate、MCP bridge、`tinyagents` / `tinyflows` / `skill_runtime`、run ledger 的工程师。
- 想做开源维护练习，尤其是文档、测试、安全 hardening、小型 UI/state 修复的人。

### 谁不应该直接用

- 想要轻量 SDK / CLI / library 的团队。
- 不愿承担 GPL-3.0 合规成本的人。
- 需要稳定、低攻击面、低维护成本生产底座的人。
- 想完全离线、不依赖任何 managed backend 的用户。
- 希望“一装即企业可控”的组织；OpenHuman 需要先做安全 profile 和工具/连接器收敛。

### 下一步

1. 深读 `flows/mod.rs`、`tinyflows/mod.rs` 和 `skill_runtime/run_machinery.rs`，把 saved flows 与 installed skill workflows 的状态契约拆开理解。
2. 深读 `session_db/run_ledger/mod.rs` 与 `agent_orchestration/run_ledger_finalize.rs`，理解 background agent / flow / team 的 durable state。
3. 深读 `security/policy/*` + approval gate，抽象本地 agent 工具权限模型。
4. 深读 `tools/ops.rs`，拆 tool registry 的安全分层和默认工具策略。
5. 深读 `memory_tree/ingest.rs` / `retrieval.rs`，提炼长期记忆最小可复用模型。
6. 若要首个 PR，优先做“文档口径修正：`flows` vs `skill_runtime` vs `tinyagents` 的职责边界”或为 flow/run-ledger 增加聚焦测试。
