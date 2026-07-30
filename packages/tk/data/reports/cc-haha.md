# cc-haha

> 一句话定位：从 Claude Code 泄露快照演化出的全栈 Coding Agent runtime，集 CLI、Desktop、多模型代理、Swarm、MCP/LSP、远程入口、IM 适配和 Computer Use 于一体；工程密度很高，但源码权利链未解决。

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `NanmiCoder/cc-haha` |
| URL | `https://github.com/NanmiCoder/cc-haha` |
| Star | 13,751（GitHub REST，2026-07-30） |
| Fork | 8,500（GitHub REST，2026-07-30） |
| 许可证 | 根目录声明 MIT；**初始泄露源码的再许可 / 权利链未证明，不能据此认定全仓可按 MIT 复用** |
| 语言 | TypeScript / TSX 为主，另含 Rust、Swift、Python、Shell |
| 首次提交 | `f5a40b86`，2026-03-31，`init: add source code from src.zip` |
| 最近提交 | `dda92e6d`，2026-07-30（北京时间） |
| 源码快照 | `dda92e6deb47d80be110aa789942031c39a10291` |
| 最新 Release | `v0.5.0`，2026-07-27，六平台 Desktop 资产 |
| 贡献者数 | 32 个本地 Git author identity；GitHub 主贡献者 NanmiCoder 为 1,508 contributions |
| 代码规模 | 3,948 tracked files；约 96.2 万行受统计文本；599 个 test/spec 文件 |
| 分析日期 | 2026-07-30 |

> 指标口径：Stars、Forks、Issues、PR、Release 和 assets 来自 2026-07-30 的 GitHub REST 快照；源码判断基于上述 commit。`open_issues_count` 会把 PR 算入，本报告另行拆分为 89 个 open issues 与 43 个 open PR。

---

## 场景一：是否值得采用

### 解决的问题

cc-haha 试图把 Claude Code 的终端 Agent 能力扩展成一个本地 AI 工作台：

- 不只运行 Anthropic 模型，还通过 provider abstraction 和协议转换支持 OpenAI Chat、OpenAI Responses、Grok、Bedrock 及自定义兼容端点；
- CLI 与 Electron Desktop 共用 session JSONL、权限、工具、MCP、skills、hooks 和 agent loop；
- 用 Desktop 提供会话列表、workbench、内置终端、diff、预览、计划任务、远程 H5 和 IM 入口；
- 用 Agent/Swarm/remote session 把单 Agent 提升为多 Agent 协作环境；
- 用 Computer Use、MCP、LSP、sandbox 和 worktree 扩大执行能力，同时补权限边界。

目标用户不是只想要聊天窗口的人，而是：

1. 想用桌面界面管理长会话、后台任务和多 Agent 的重度 Coding Agent 用户；
2. 想连接国产或 OpenAI-compatible provider 的用户；
3. 想研究 Claude Code 级别 agent runtime 实现的人；
4. 想把 coding agent 接入手机 H5、飞书、钉钉、微信、Telegram 等外部入口的开发者。

### 核心能力与边界

- **能做什么：** 自有 agent loop、streaming tool execution、自动压缩、多模型 fallback、MCP/LSP、skills、hooks、subagents、Swarm、worktree、Desktop、H5 remote、IM adapters、Computer Use、session search/index、定时任务。
- **不能做什么：** 不能消除上游 API 的能力差异；不能保证非 Anthropic provider 对 thinking/tool/MCP 语义完全等价；不能用当前 MIT 文件证明初始泄露源码的合法再分发权；不能把一个高权限桌面 Agent 自动变成适合企业生产的安全执行面。
- **与竞品差异：** 相比 OpenCode/Pi，它更像“Claude Code 内核的公开演化分支 + 完整 Desktop”；相比 Grok Build，它使用 Bun/TypeScript/Ink/Electron 而不是 Rust/ACP actor；相比官方 Claude Code，它开放了 provider proxy、Desktop、IM、H5、Swarm 和大量内部实现，但源码来源本身构成最大采用阻断。

### 集成成本

#### 用户侧

- Release 提供 Windows x64/arm64、macOS x64/arm64、Linux x64/arm64 安装资产；Windows x64 v0.5.0 资产已有约 3,177 次下载。
- Desktop 内置 server/CLI sidecar，普通用户不需要手动理解全部 runtime。
- Provider UI 降低自定义模型接入门槛，并能在 Anthropic、OpenAI Chat、OpenAI Responses 之间转换。

#### 团队与二次开发侧

- 根运行时锁定 Bun `1.3.14`，Desktop 使用 pnpm/Electron/Vite/Vitest，另含 Rust native crates、Swift input bridge、多个 IM adapter。
- 仓库约 96.2 万行文本、599 个测试文件、5 个 workflow，远不是可轻量嵌入的 SDK。
- 配置和状态分布在 `~/.claude/`、`~/.claude/cc-haha/`、projects JSONL、teams、settings、OAuth/token 等多类文件。
- 高风险功能横跨 filesystem、shell、MCP、node-pty、Computer Use、remote/H5、IM、OAuth 和 auto updater；团队采用需要最小权限主机、独立 OS 用户、secret management 和出站控制。

**从零到隔离 demo：** 安装 release 并配置一个 provider 可控制在 15–30 分钟；源码构建、Desktop 多平台打包、远程入口和多 Agent 安全验证是数天级工作。

### 依赖 / SDK 选型证据

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| Bun | runtime / bundler / test | CLI、server、agent loop、测试、打包 | 用同一运行时承载 TypeScript CLI、HTTP/WS 和测试 | 根 `package.json`、`bun.lock`、`src/server/index.ts` | 构建 TypeScript-first agent runtime 时可评估 | Bun-specific `feature()`、`Bun.serve` 和 bundle macro 会提高迁移成本 |
| `@anthropic-ai/sdk` | SDK | Messages API、streaming、tool use、thinking | 复用 Claude 协议和类型 | `package.json`、`src/query.ts` | 以 Anthropic tool-use 语义为主时优先 | 整个内部消息模型仍深度 Anthropic-shaped |
| `@modelcontextprotocol/sdk` | protocol SDK | MCP client/server/tool discovery | 避免自研工具协议 | `package.json`、`src/services/mcp/` | 需要跨工具生态时优先 | 远程 MCP 是新的数据外发与提示注入边界 |
| `@anthropic-ai/sandbox-runtime` | sandbox runtime | Bash/network sandbox 与权限联动 | 限制高风险 shell side effects | `package.json`、`src/tools/BashTool/`、permission code | 本地 agent 需要可控 shell 时值得研究 | 不能替代容器/VM；平台行为需逐 OS 验证 |
| Ink + React | TUI framework | CLI 交互、permission dialog、消息与工具状态 | 用组件模型构建流式终端 UI | `package.json`、`src/components/` | React 团队做复杂 TUI 可评估 | 渲染和 runtime 高耦合，桌面端又有另一套 React |
| Electron + Vite + Zustand | desktop stack | Desktop shell、renderer、IPC、状态管理 | 跨平台桌面工作台 | `desktop/package.json`、`desktop/electron/` | 需要本地进程和成熟桌面生态时可复用 | 进程、IPC、更新签名、node-pty 都扩大攻击面 |
| Tauri 2 / Cargo manifest | legacy desktop shell | 保留旧版 `0.3.2` 壳、图标、sidecar 路径与 updater 配置 | 解释仓库中仍存在的 Rust/Tauri 依赖 | `desktop/src-tauri/Cargo.toml`、`tauri.conf.json`；当前 `desktop/package.json` 只构建 Electron `0.5.0` | 可用于研究桌面迁移的遗留边界 | 不是当前主线 runtime；不要把 catalog 抽取出的 15 条 Cargo dependency 误判为现役架构 |
| `electron-updater` | updater | GitHub Release 检查、下载、安装 | 避免自研更新器 | `desktop/electron/services/updater.ts` | 已有 Electron 签名体系时可用 | 本仓 Windows/部分 macOS 可能发布 unsigned；Linux 资产无平台代码签名 |
| Zod / AJV | schema validation | provider、permissions、MCP、server payload、配置 | 在外部输入进入 runtime 前校验 | `package.json`、provider presets、permission sync | 多入口 agent 系统应优先采用 schema-first | schema 数量大时要防止调用链出现绕过入口 |
| OpenTelemetry SDK | telemetry protocol | 可选 traces/metrics/logs exporter | 标准化自托管观测 | `src/utils/telemetry/instrumentation.ts` | 需要显式可配置观测时可复用 | 本报告只确认环境变量配置下启用，不能把残留 Anthropic 事件名当完整隐私审计 |
| GrowthBook | feature flags | 上游 feature gate/cache 兼容 | 保留上游动态配置结构 | `src/services/analytics/growthbook.ts` | 大型产品做 gate 可参考其 cache/failure handling | fork 中无 client key 时直接禁用；不要复制上游内部耦合 |
| node-pty / xterm | terminal | Desktop 内置 shell 与终端呈现 | 提供真实 PTY 而非命令模拟 | `desktop/package.json`、terminal modules | 桌面 IDE/agent 需要完整终端时适合 | 原生模块、多平台构建和进程清理难度高 |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | ❌ | 根 LICENSE 为 MIT，但 root commit 明确是 `source code from src.zip`，后续 commit 明确写 `leaked source`；未见 Anthropic 授权、权利链或文件级来源清单 |
| Bus factor | 高风险 | 1,601 commits 中主维护者 GitHub 贡献为 1,508，核心知识与发布权高度集中 |
| 供应商锁定 | 中高 | provider 可扩展，但消息、thinking、tool result、权限、环境变量和大量内部抽象仍是 Claude/Anthropic-shaped |
| 维护趋势 | 活跃 | 四个月内 36 个 tags，最近 100 个 closed PR 有 53 个 merged；同时 backlog 快速增长 |
| 凭据存储 | ⚠️ | 自定义 provider key 写入 `providers.json` 和 managed settings；写入未显式设 `0600`，依赖目录权限和 umask |
| 远程入口 | ⚠️ | H5 默认关闭且有 token/Origin/capability tests；启用后仍应通过反向代理 TLS、访问控制和独立 token，不应裸露 Bun server |
| Computer Use | ⚠️ | foreground app unknown 时 fail closed，并限制系统快捷键/敏感应用；但能力本身具有桌面级 side effect，不适合主账号无隔离运行 |
| 发布供应链 | ⚠️ | 六平台 release 自动化完整；Actions 使用 mutable tags，未见独立 checksum/SBOM/provenance；Windows 可 unsigned 发布，macOS 签名/公证为条件式 |
| 安全响应 | ⚠️ | 未发现根 `SECURITY.md` 或明确私密漏洞披露通道 |
| 成熟度 | ⚠️ | 89 open issues、43 open PR；最新问题包括 subagent output 为空、任务归属错误、IM 配置冲突和 UI 抖动 |

### 结论

**不推荐直接采用。仅建议在隔离环境做研究或短期体验。**

理由不是功能不够，而是采用决策存在一个无法被测试覆盖抵消的前置阻断：**源码来源和再许可权未证明。** 根 MIT 只能说明仓库维护者声明了一个许可证，不能自动授予其对初始 `src.zip` / “leaked source” 的处分权。

若只是个人体验：

1. 使用无敏感数据的独立 OS 账户或 VM；
2. 不连接工作主账号、生产密钥、浏览器主 profile；
3. provider key 使用低额度、可撤销 token；
4. H5/IM/Computer Use 默认保持关闭，逐项启用；
5. 固定 release 版本并自行记录哈希；
6. 不复制源码进入商业产品。

---

## 场景二：技术架构学习

### 核心架构图

```text
                    ┌─────────────────────────────┐
                    │       Entry Surfaces        │
                    │ CLI / Electron / H5 / IM    │
                    │ SDK WS / Remote / Cron      │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │      Control Plane           │
                    │ Provider / Permission / MCP  │
                    │ Skills / Hooks / Agents      │
                    │ Session policy / Worktree    │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │       query() state machine  │
                    │ stream → tool → settle       │
                    │ compact / fallback / stop    │
                    └───────┬──────────┬──────────┘
                            │          │
              ┌─────────────▼───┐   ┌──▼────────────────┐
              │ Tool Data Plane  │   │ Model Data Plane  │
              │ Bash/File/MCP    │   │ Anthropic/OpenAI  │
              │ LSP/Agent/CU     │   │ Grok/Bedrock/...  │
              └─────────────┬───┘   └──┬────────────────┘
                            │          │
                    ┌───────▼──────────▼──────────┐
                    │ Durable local state          │
                    │ JSONL + sidecars + teams     │
                    │ local index / projections    │
                    └──────────────────────────────┘
```

### 底层技术架构

#### 最小架构内核

脱掉 Desktop、IM、宠物、市场和 provider UI，系统的最小内核是：

```text
Anthropic-shaped Message Model
+ AsyncGenerator Query State Machine
+ Permission-aware Tool Registry
+ JSONL Transcript / Sidecar Persistence
+ MCP / Hook / Skill Extension Contracts
```

它的核心并不是“React 界面”，而是一个能在多轮 tool-use 中保持消息配对、权限、并发、abort、compaction、fallback 和 session 恢复一致性的 runtime。

#### 核心抽象

| 抽象 | 源码位置 | 职责 | 关键字段 / 方法 | 为什么重要 |
|------|----------|------|-----------------|------------|
| Query state machine | `src/query.ts` | 推进一次 agentic turn | `query()`、`queryLoop()`、`State.transition` | 把 stream/tool/compact/retry/stop 统一为显式状态迁移 |
| Tool orchestration | `src/services/tools/toolOrchestration.ts` | 读安全工具并行、写工具串行 | `partitionToolCalls()`、`runTools()` | 吞吐和副作用顺序的核心边界 |
| StreamingToolExecutor | `src/services/tools/StreamingToolExecutor.ts` | 工具边流式生成边执行，保持结果顺序 | queue status、child abort、synthetic result | 防止 fallback/abort 后出现孤儿 tool result |
| Permission engine | `src/utils/permissions/permissions.ts` | rule、mode、sandbox、MCP、ask/deny/allow | `canUseTool`、permission modes | 所有高权限 side effect 的政策入口 |
| ProviderService | `src/server/services/providerService.ts` | provider CRUD、激活、协议转换、测试 | `activateProvider()`、`syncToSettings()` | 把 provider 选择变成控制面，但也承载明文凭据风险 |
| SessionStorage | `src/utils/sessionStorage.ts` | JSONL append、chain、compaction metadata、subagent sidecars | per-file queue、`flush()`、`getTranscriptPath()` | canonical persistence，保证 CLI/Desktop 共用事实源 |
| SessionService local index | `src/server/services/sessionService.ts` | Desktop 查询、projection、search、fallback | index mode、mutation epoch、shadow comparison | 索引只是可降级读模型，不取代 JSONL 事实源 |
| H5 policy/auth | `src/server/h5AccessPolicy.ts`、`middleware/auth.ts` | 本地/远端来源分类、token/Origin/capability | `classifyH5Request()`、`requireH5Token()` | 让远程 UI 不是简单地把 localhost server 暴露出去 |
| Swarm permission sync | `src/utils/swarm/permissionSync.ts` | worker 请求转交 leader 审批 | mailbox / pending / resolved | 多 Agent 下仍保留人类审批所有权 |
| Computer Use policy | `src/vendor/computer-use-mcp/` | 前台 app、按键、输入能力约束 | deny list、key blocklist、executor | 桌面自动化的 fail-closed 边界 |

#### 控制面 / 数据面

- **控制面：** provider 选择、permission modes/rules、MCP 配置、skill/hook 装载、agent definitions、worktree、H5 设置、session policy、feature gates。
- **数据面：** 模型 stream、tool execution、Bash/File/MCP/LSP/Computer Use side effects、WebSocket 消息、provider proxy、JSONL append、release updater 下载。

关键点是权限判断必须发生在工具进入数据面之前；Desktop/H5/IM 只是不同入口，不能各自实现一套绕过 runtime 的执行逻辑。

#### 关键执行链路

```text
用户输入（CLI / Desktop / H5 / IM）
  ↓
构造 Message + ToolUseContext + PermissionContext
  ↓
queryLoop() 读取 compact boundary / memory / tool budget
  ↓
callModel() 流式返回 assistant/tool_use
  ↓
StreamingToolExecutor 校验 schema + canUseTool
  ↓
read-safe 并行；写操作独占；Bash error abort sibling
  ↓
生成严格配对的 tool_result / synthetic error
  ↓
继续 query 或进入 stop hooks / compact / fallback / terminal state
  ↓
JSONL append + local index projection + UI/WS 更新
```

#### 状态模型

| 状态类型 | 位置 | 谁读写 | 生命周期 / 一致性规则 |
|----------|------|--------|------------------------|
| Session canonical log | `~/.claude/projects/.../*.jsonl` | CLI runtime 写；Desktop/server 读写 | append-first；message parent chain；progress 不进入 canonical chain |
| Session sidecars | subagents、remote-agents、metadata | Agent/remote runtime | 与 session ID 和 agent ID 绑定，用于 resume |
| Desktop projections | local index/search index | background coordinator 写；SessionService 读 | stale/degraded 时回退 JSONL；mutation epoch 防止旧索引覆盖新状态 |
| Provider config | `~/.claude/cc-haha/providers.json`、`settings.json` | ProviderService | temp+rename 原子写；密钥明文 |
| Query loop state | `src/query.ts::State` | 单次 `queryLoop()` | 显式 transition；compact/fallback 后重建必要字段 |
| Tool runtime state | StreamingToolExecutor | query loop 与工具执行器 | queued → executing → completed → yielded；abort 时补 synthetic result |
| Team permission state | teams mailbox / pending / resolved | worker 与 leader | lock + schema；审批结果定向回传 worker |
| Remote/H5 capability | H5 settings/token/origin | local desktop 控制面 | 默认关闭；远端不能修改 access settings |

#### 契约边界

- **内部契约：** `Message` / `ToolUseBlock` / `tool_result` 配对、`ToolUseContext`、permission decision、session entry、provider mapping、transition reason。
- **外部 API / CLI / MCP 契约：** Bun REST/WS server、Anthropic/OpenAI-compatible proxy、MCP SDK、Desktop IPC、H5 token、IM adapters。
- **Agent-facing Skill / Hook / prompt / schema 契约：** tools 的 Zod input schema、skills/commands、pre/post/stop hooks、Agent definitions、Swarm mailbox message schema。

#### 失败与降级模型

| 失败类型 | 检测方式 | 系统行为 | 降级 / 修复动作 |
|----------|----------|----------|------------------|
| 模型 streaming fallback | `FallbackTriggeredError` / callback | tombstone 旧 partial message，丢弃旧 tool results | 切换 fallback model，清理 model-bound thinking signature 后重试 |
| Prompt too long | token warning / API 413 | 先 context collapse，再 reactive compact | 单次重试，仍失败则显式终止，避免 stop-hook death spiral |
| 工具未知或 schema 失败 | registry/schema parse | 不执行工具 | 生成 error `tool_result`，保持消息协议完整 |
| 并行 Bash 失败 | error tool result | abort sibling child controller | 给未完成工具生成 synthetic error |
| 用户中断 | abort controller | 收集/补齐 tool results，清理 Computer Use | 返回明确 terminal reason |
| local index stale | status / mutation epoch / shadow compare | 不信索引 | 回退 canonical JSONL 扫描 |
| H5 未启用/来源不可信 | request classification | 403 fail closed | 只允许本地桌面开启并生成独立 token |
| foreground app unknown | Computer Use executor | 禁止输入动作 | 要求获得可信 app identity 后再执行 |
| provider 不兼容 | connectivity + proxy pipeline test | 阻止激活或返回精确错误 | 调整 api format/model mapping/auth strategy |

#### 可复刻设计不变量

1. **每个 tool_use 最终必须对应一个 tool_result，即使 fallback、abort 或工具不存在。**
2. **读安全工具可以并行，未知或写工具默认串行；判断异常时向保守侧降级。**
3. **JSONL 是事实源，索引是 projection；projection 失效不能阻断会话恢复。**
4. **远程入口默认关闭，且远端不能修改自身访问能力。**
5. **多 Agent 不能绕过主 Agent 的审批所有权，worker 权限请求必须汇聚到 leader。**
6. **模型 fallback 不复用旧 attempt 的 partial tool state。**
7. **Computer Use 无法确认前台应用时必须 fail closed。**

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 消息内核 | Anthropic-shaped message/tool/thinking | provider-neutral IR 的纯净度 | 最大化 Claude Code 行为兼容和现有代码复用 |
| 持久化 | append JSONL + sidecars + projection | 单数据库事务一致性 | 与 CLI 生态兼容，便于恢复和人工检查 |
| 工具并发 | read-safe parallel / write exclusive | 最大吞吐 | 避免文件和 shell side effect 相互踩踏 |
| Desktop 架构 | Electron renderer + Bun sidecar | 单进程简单性 | 复用同一 CLI runtime，隔离 UI 与执行 |
| 远程访问 | 默认关闭 + capability token + Origin | 零配置公网访问 | 把本地主机高权限 API 置于显式控制下 |
| Provider 兼容 | Anthropic ↔ OpenAI protocol transform | 完全保真 | 扩展模型供应商范围 |
| Feature flags | 保留 GrowthBook 兼容但 fork 无 key 时禁用 | 上游动态实验能力 | 避免 fork 默认访问未配置的一方服务 |

### 值得学习的模式

1. **流式工具执行与结果顺序分离。** 工具可提前执行，但 `tool_result` 仍按协议顺序发布。
2. **Fallback tombstone。** 对失败 attempt 已流出的消息做显式撤销，而不是把两个模型的轨迹拼接。
3. **Canonical JSONL + local projection。** 兼容性、可检查性和查询性能兼得。
4. **权限模式不是一个 boolean。** default、acceptEdits、plan、dontAsk、auto、bypassPermissions 都是一等状态。
5. **多 Agent permission mailbox。** 把分布式 worker 的审批汇总到 leader UI。
6. **H5 capability 分级。** local desktop、internal SDK、pet、remote browser 不是同一种客户端。
7. **Computer Use 基于前台 app class 控制输入类型。** 比“允许/禁止桌面自动化”更细。

### 反模式 / 踩坑点

1. **先有泄露快照，后补 MIT。** 工程成熟度无法修复权利链缺口。
2. **明文 provider credential 与普通配置混存。** 应改用 OS keychain/secret service，只在 runtime 注入。
3. **功能面增长过快。** CLI、Desktop、H5、IM、宠物、provider market、Computer Use、Swarm、remote 同时演进，backlog 已反映组合复杂度。
4. **发行缺少统一 provenance。** 多平台二进制越多，越需要 checksum、SBOM、attestation 和强制签名策略。
5. **根 package 版本 `999.0.0-local` 与 Desktop release `0.5.0` 双版本。** 对 API/CLI/desktop 兼容矩阵不友好。
6. **Electron 主线仍携带旧 Tauri 壳。** `desktop/src-tauri/tauri.conf.json` 停在 `0.3.2`，当前 `desktop/package.json` 为 Electron `0.5.0`，但 Electron 打包仍复用其 icons/binaries/resources；遗留 manifest 会放大依赖清单和维护认知。
7. **上游内部命名残留。** `USER_TYPE=ant`、`tengu_*`、Claude-specific env 和 analytics types 增加理解成本，也持续提醒源码来源问题。

### 可借鉴的具体技术点

- `StreamingToolExecutor` 的 child abort + synthetic tool result；
- `SessionService` 的 mutation epoch、shadow comparison 和 JSONL fallback；
- H5 的 `local-trusted` / `remote-browser` / `internal-sdk` 分类；
- Computer Use 对 app identity、system keys、browser/IDE/terminal 的能力矩阵；
- provider test 的 direct connectivity + full protocol-transform pipeline 两阶段检查；
- session metadata re-append，保证 tail-window 快速加载仍拿到标题/tag；
- 在 API 413 恢复路径中禁止继续跑 stop hooks，避免错误—hook—重试死循环。

---

## 架构解剖

### 目录结构

```text
cc-haha/
├── src/
│   ├── query.ts                 # agentic turn 状态机
│   ├── services/                # API、tools、MCP、analytics、compact
│   ├── tools/                   # Bash/File/Agent/Web/LSP 等工具
│   ├── utils/                   # session、permissions、swarm、sandbox
│   ├── server/                  # Desktop/H5 REST + WS + proxy + local index
│   ├── remote/ / bridge/        # 远程 session 与 peer communication
│   └── vendor/computer-use-mcp/ # 桌面自动化策略与执行
├── desktop/
│   ├── electron/                # main/preload/IPC/updater
│   └── src/                     # React renderer/workbench/chat/settings
├── adapters/                    # 飞书、钉钉、微信、Telegram、Tau 等入口
├── crates/                      # native Rust components / dashboard
├── docs/                        # 双语用户与 internals 文档
├── scripts/                     # 构建、发布、校验、同步
└── .github/workflows/           # PR quality/triage、desktop release 等
```

### 技术栈

- **运行时 / 框架：** Bun 1.3.14、TypeScript、React 19 + Ink、Bun HTTP/WS。
- **Desktop：** 当前主线为 Electron 42、React 18、Vite 8、Zustand、xterm、node-pty；`src-tauri` 保留旧版 `0.3.2` 壳和共享 assets，不是当前构建入口。
- **协议 / AI：** Anthropic SDK、MCP SDK、OpenAI Chat/Responses transforms、Bedrock、OAuth provider adapters。
- **持久化：** append JSONL、sidecar JSON、local indexes、filesystem locks。
- **Native：** Rust crates、Swift input bridge、platform-specific Computer Use。
- **测试：** Bun test、Vitest、policy contracts、server/integration/native lanes。
- **CI/CD：** GitHub Actions 六平台 release matrix、macOS notarization、条件式 Windows signing、PR path classification。

### 模块依赖关系

```text
Entry surfaces
  → Server / CLI bootstrap
  → Provider + Settings + Permission + MCP control plane
  → query.ts
  → callModel / StreamingToolExecutor
  → concrete tools / subagents / Computer Use
  → JSONL session + projections
  → CLI/Desktop/H5/IM presentation
```

`query.ts` 是窄腰；Desktop、H5 和 IM 若绕过它直接执行 side effect，就会破坏权限和持久化不变量。当前主路径总体保持共享 runtime。

### 扩展机制

- MCP servers/tools/resources；
- skills 与 slash commands；
- pre/post/stop hooks；
- custom agent definitions / subagents / Swarm；
- provider presets + custom base URL + protocol transforms；
- IM adapters；
- Desktop IPC 与 server REST/WS；
- worktree、sandbox、Computer Use capability。

---

## 质量与成熟度

### 代码质量

- **类型系统：** TypeScript/Zod/AJV 覆盖外部输入与内部消息；大量 union/brand/type guard 保护复杂状态。
- **错误处理：** query loop 对 fallback、413、max output、abort、tool errors 都有显式 terminal/transition；索引和可选功能多采用 fail-soft。
- **并发控制：** tool concurrency、per-file write queue、team lock、mutation epoch 都有明确所有权边界。
- **问题：** 96 万行、多个 UI/runtime、上游内部 feature gate 和大量历史兼容路径让可维护性高度依赖核心作者；provider secret 没有专用 secret storage。
- **来源风险：** 工程质量评价不能用于推导许可证有效性。

### 测试

- 静态枚举到 599 个 test/spec 文件，覆盖 permissions、Computer Use、H5 auth、provider transform、session restore/index、tool execution、adapters、Desktop IPC/updater 等。
- PR workflow 按变更面执行 server/desktop/native/provider/chat/persistence/docs/coverage lanes，而非只有一个 smoke test。
- 本次在锁定快照上完成 `bun install --frozen-lockfile`，仓库 policy contract 为 **128/128 passed**。
- 未启动应用、未连接真实 provider、未执行完整全仓测试或 release 构建；因此不对“599 个文件全部通过”作结论。

### CI/CD

优点：

- release tag 与 Desktop version 对齐检查；
- macOS x64/arm64、Windows x64/arm64、Linux x64/arm64 构建矩阵；
- macOS 证书、公证、签名验证；
- package smoke；
- PR path classifier 降低大仓库 CI 成本。

缺点：

- Actions 使用 `@v4` 等 mutable tags，而非 commit SHA；
- 未见 SBOM、SLSA provenance、cosign 或独立 checksum 资产；
- Windows 签名 secret 缺失时仍可发布 unsigned artifact；
- macOS 也提供 unsigned 安装脚本；
- release 供应链强度与其高权限产品定位不匹配。

### 文档质量

- README 和 `docs/en` / `docs/zh` 覆盖安装、providers、Desktop、remote、IM、Computer Use 和 internals，产品文档优秀。
- `docs/*/internals` 对 agent loop、server、desktop 的解释有源码锚点，学习价值高。
- 缺少根 `SECURITY.md`、完整 threat model、source provenance/rights manifest、stable API compatibility policy。
- 当前 README 已弱化最初“leaked source”叙事，但 Git 历史仍是可核验事实；文档没有解释这段来源如何获得授权。

### Issue / PR 健康度

- 2026-07-30 快照：89 个 open issues，43 个 open PR。
- 最近 100 个 closed PR 中 53 个 merged，说明不是只维护者单向提交。
- 最近 100 个 closed issue 中 91 个是真 issue，median comments 为 1，处理速度快但讨论深度普遍有限。
- 最新 open issues 涉及 subagent background output 为空、后台命令归属错误、provider/IM 配置冲突、UI 抖动，都是组合系统常见的真实可靠性问题。
- 贡献高度集中于主维护者；快速迭代和 bus factor 同时存在。

---

## 社区与生态

### 社区评价

#### 可核验信号

- GitHub：13,751 Stars、8,500 Forks、56 subscribers。
- 高 Fork/Star 比例不能简单判为异常：README 明确提供“fork 仓库后由 Actions 自动同步、自动发布”的使用路径，大量 fork 有功能性动机。
- 最新 v0.5.0 Windows x64 asset 约 3,177 下载，证明有真实桌面用户，但其他平台资产多数是几十到几百下载。
- YouTube 搜到 12,298 播放的 `Claude Code's Source Code Leaked!`，说明早期传播直接围绕泄露源码叙事。
- B站精确命中约 3,050 播放的第三方 DeepSeek V4 实测；作者复盘视频约 37,355 播放，并自述前两期视频达到百万播放。

#### 解释

热度是真实的，但由三股力量叠加：

1. “Claude Code 源码泄露”天然传播性；
2. 作者中文内容渠道和密集产品迭代；
3. fork-to-sync / fork-to-release 的分发机制。

因此 Stars/Forks 适合证明关注度，不足以证明企业采用、法律可用性或稳定性。

#### 采样盲区

Agent Reach doctor 显示 YouTube、B站公开 API、Jina Reader 可用；Reddit/X 需要认证，Web Search 后端未配置。本次没有把这些不可访问平台记为“零讨论”。未获得足够独立长期用户样本，因此社区口碑结论保持中等置信度。

### 衍生项目 / 插件生态

- 8,500 forks 构成庞大分发面，但 top forks 的独立 Stars 很低，多数更像同步/私有发布分支，而不是独立生态项目。
- provider presets 参考 cc-switch；支持 MCP、skills、agents、hooks 和 IM adapters，扩展面丰富。
- 生态最大的阻力不是接口数量，而是源码权利链：第三方若复制实现进入自己的商业产品，会继承不确定性。

### 竞品对比

| 维度 | cc-haha | OpenCode | Pi | Grok Build | 官方 Claude Code |
|------|---------|----------|----|------------|------------------|
| 定位 | Claude-shaped 全栈 runtime + Desktop | 开源多入口 coding runtime | TS agent substrate / CLI | Rust/ACP 产品级 harness | 官方闭源产品 |
| Desktop | 强，核心卖点 | 有 | 非核心 | 有 dashboard / client 面 | 官方 Desktop/Cowork 生态 |
| 多 provider | 强，但协议转换有语义损耗 | 强 | 强 | 三协议 sampler | 官方 Anthropic 为主 |
| 多 Agent | Agent/Swarm/remote/worktree | runtime subagents | subagent/orchestrator | leader/relay/subagents | 官方能力 |
| 持久化 | JSONL canonical + local projection | durable session/event/projection | session tree / JSONL | persistent session actors | 不公开 |
| 权限/隔离 | permission modes + sandbox + H5/CU gates | 强 | 强 | 强 | 强但实现不公开 |
| 开源治理 | 高活跃、强作者驱动 | 成熟开放生态 | substrate 导向 | 公开镜像治理弱 | 闭源 |
| 许可证/来源 | **根 MIT，但泄露快照权利链未证明** | MIT | MIT | Apache-2.0 | 商业闭源 |
| 采用判断 | **不推荐生产/商业** | 个人可试，团队隔离 | 二次开发更合适 | 学习优先，采用观望 | 合规购买时更清晰 |
| 学习判断 | 只学架构，不复制代码 | runtime 事务化 | substrate/extension | ACP/actor | 只能学产品行为 |

---

## 关键代码走读

### 1. `query()` / `queryLoop()`

- 路径：`src/query.ts`
- 职责：一次完整 agentic turn 的状态机。
- 实现要点：
  - `AsyncGenerator` 同时输出 stream event、message、tombstone 和 summary；
  - `State.transition` 显式记录 collapse/compact/fallback 等继续原因；
  - model fallback 时清空旧 attempt 的 assistant/tool state；
  - 413 先 collapse drain，再 reactive compact；失败后跳过 stop hooks，避免 retry spiral；
  - abort 时保证 tool_use/tool_result 配对。

### 2. `StreamingToolExecutor`

- 路径：`src/services/tools/StreamingToolExecutor.ts`
- 职责：边接收 streaming tool blocks 边调度执行。
- 实现要点：
  - `queued → executing → completed → yielded` 状态；
  - read-safe 工具并行，exclusive 工具阻塞后续；
  - 每个工具有 child abort controller；
  - Bash error 会 abort siblings；
  - fallback、user interruption、sibling error 都生成 synthetic `tool_result`。

### 3. `SessionService` / `sessionStorage`

- 路径：`src/server/services/sessionService.ts`、`src/utils/sessionStorage.ts`
- 职责：JSONL 事实源、Desktop 查询投影、session resume。
- 实现要点：
  - per-file append queue 与 `0600` transcript file mode；
  - progress 不参与 parent chain；
  - local index 有 shadow/on/off，degraded 自动回退；
  - mutation epoch 防止并发写后读取陈旧 projection；
  - metadata re-append 保证 tail-window 快速读取仍能拿到 title/tag。

### 4. H5 access policy

- 路径：`src/server/h5AccessPolicy.ts`、`src/server/services/h5AccessService.ts`、`src/server/middleware/auth.ts`
- 职责：控制本地桌面、远端浏览器、internal SDK、pet 等客户端能力。
- 实现要点：
  - H5 默认关闭；
  - remote browser 需要独立 256-bit token 和 Origin；
  - 远端不能修改 H5 access settings；
  - spoofed localhost / proxy headers / cross-site subresource 有测试；
  - token 为可恢复性明文存储，部署必须保护配置目录。

### 5. Computer Use policy

- 路径：`src/vendor/computer-use-mcp/executor.ts`、`keyBlocklist.ts`、`deniedApps.ts`
- 职责：把鼠标/键盘/截图工具限制在可接受的前台应用与按键集合。
- 实现要点：
  - 前台应用未知时 fail closed；
  - 系统快捷键别名归一后再 block；
  - browser/交易类应用可只读；terminal/IDE 禁止键盘输入；
  - security tests 覆盖空 app context、读取失败和 deny list。

### 6. ProviderService

- 路径：`src/server/services/providerService.ts`
- 职责：provider CRUD、激活、auth env、协议转换和连接测试。
- 实现要点：
  - Anthropic/OpenAI Chat/OpenAI Responses 统一到 Claude-shaped runtime；
  - 测试分 direct connectivity 与完整 transform pipeline 两阶段；
  - provider settings temp+rename 原子写；
  - API key 明文存储且没有 keychain，是最值得优先修复的安全债。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 5 | CLI/Desktop/H5/IM/provider/MCP/LSP/Swarm/Computer Use 极完整 |
| 代码质量 | 4 | 状态机、并发、恢复、schema 和测试成熟；体量与历史包袱很重 |
| 文档质量 | 4 | 用户和 internals 文档强；缺 SECURITY、threat model 和 provenance 说明 |
| 社区活跃度 | 4 | 13.7k Stars、高发布/合并节奏；backlog 与作者集中明显 |
| 架构设计 | 5 | agent loop、tool settlement、JSONL projection、H5/CU policy 信息密度高 |
| 学习价值 | 5 | 是研究 Claude-shaped coding runtime 的高密度样本 |
| 可借鉴度 | 2 | 设计可借鉴；源码复制受权利链不确定性阻断 |

**总分：29 / 35。**

> 这个总分必须与采用结论一起读：高架构分不代表可合法、可安全地进入生产。

---

## 总结

### 一句话评价

**cc-haha 是一个功能和架构都很强的 Claude-shaped Coding Agent 全栈样本，但“从泄露源码起步、权利链未证明”足以否决商业/生产采用。**

### 谁应该用

- 在隔离 VM 中研究 agent loop、tool settlement、session recovery、Computer Use 安全边界的人；
- 只想短期体验 Desktop、多 provider、H5/IM 的个人开发者；
- 做 clean-room 自研，希望提炼架构不变量而不复制代码的团队。

### 谁不应该直接用

- 商业产品、企业内部平台或需要明确开源合规证明的团队；
- 会连接生产仓库、主浏览器 profile、云管理员凭据和高权限桌面的用户；
- 期望稳定 API/LTS、安全响应 SLA、SBOM/provenance 的组织；
- 打算直接复制代码或基于当前 MIT 声明进行再分发的人。

### 下一步

**研究路径：**

1. 只读 `query.ts`、`StreamingToolExecutor`、session projection、H5 policy、Computer Use policy；
2. 把设计写成 clean-room specification，不复制表达性代码；
3. 在自有 agent runtime 中独立实现 tool settlement、projection fallback 和 remote capability；
4. 若要实际采用，先要求项目提供可验证的源代码权利链、文件级来源、授权证明和重新许可依据；
5. 安全侧优先改造 provider secret storage、发布 provenance、强制签名和根 SECURITY policy。
