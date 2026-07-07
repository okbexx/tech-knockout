# OpenCode

> 一句话定位：**开源 Coding Agent runtime：以 Session 为聚合根、以 Event/Projection 为持久化骨架、以单轮 LLM turn + 工具结算为执行原子，向上提供 CLI/TUI/Desktop/Web/HTTP 多入口，向下接多模型、MCP、插件和本地工具。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `anomalyco/opencode` |
| URL | `https://github.com/anomalyco/opencode` |
| Star | 174,169（截至 2026-06-14） |
| Fork | 21,032 |
| 许可证 | MIT |
| 语言 | TypeScript |
| 默认分支 | `dev` |
| 创建时间 | 2025-04-30 |
| 最近 push | 2026-06-14 |
| 最新 Release | v1.17.6（2026-06-13） |
| Open Issues / PRs | 6,033 issues / 1,031 PRs |
| 贡献者 | GitHub contributors API 返回 100+；Top10 贡献占比约 80.5% |
| 分析日期 | 2026-06-14 |

---

## 场景一：是否值得采用

### 解决的问题

OpenCode 解决的是 **“开源、可扩展、多入口、多模型的 Coding Agent runtime”** 问题。

同类工具里，Claude Code / Codex CLI 体验强但核心闭源，Aider 稳但偏 Git 驱动 CLI，Cline 偏 VS Code 插件，OpenHands 偏自治软件工程平台。OpenCode 的定位更像：把 coding agent 从“一个终端聊天程序”推进到“可被 CLI、TUI、桌面端、Web、HTTP API 共同驱动的会话执行内核”。

目标用户包括：

1. 想使用开源 Claude Code 替代品的个人开发者。
2. 需要多模型 / 多 Provider / MCP / 插件能力的高级用户。
3. 想研究 coding agent runtime、会话持久化、工具执行结算机制的工程团队。
4. 想把 coding agent 嵌入自有系统、但不想从零写 TUI / HTTP / event runtime 的团队。

### 核心能力与边界

- **能做什么：**
  - 交互式 coding agent：读写文件、搜索、shell、patch、todo、web fetch/search、task/subagent、LSP 等工具。
  - 多入口：CLI/TUI、desktop、web/app、HTTP API、SDK、GitHub Action、Slack 等包线。
  - 多模型：通过 provider/model catalog 接入 Anthropic、OpenAI、Google、OpenRouter、xAI、Moonshot 等多类 provider。
  - MCP 与插件：工具可来自内置 registry、插件、文件系统自定义工具、MCP 生态。
  - Durable session：会话、输入、消息、上下文 epoch、事件、projection 进入 SQLite/Drizzle 风格持久状态。
  - 实时 UI：stream delta、event bus、session projection 支撑 TUI/Web/HTTP 多客户端重放与订阅。

- **不能做什么 / 尚不稳定处：**
  - 不是闭源 Claude Code 的完全等价替代，模型质量和产品细节仍取决于 provider 与运行环境。
  - 当前源码仍处在 V1/V2 session runtime 迁移期，存在兼容桥接与 dual-write/mirror seam。
  - 海量 issue/PR backlog 下，性能、内存、剪贴板、写入卡死、隐私默认行为、沙箱能力等体验问题仍被高频讨论。
  - 生产级多租户隔离、企业审计、强沙箱、稳定集群 ownership 尚不是当前最稳妥的默认能力。

- **与竞品差异：**

  | 维度 | OpenCode | Aider | Cline | Continue | OpenHands | Gemini CLI |
  |------|----------|-------|-------|----------|-----------|------------|
  | 主要入口 | CLI/TUI/Desktop/Web/HTTP | CLI | VS Code | IDE 插件 | Web/云端执行 | CLI |
  | 核心强项 | Durable session runtime + 多入口 + MCP/插件 | Git 驱动编辑 | IDE 操作体验 | 企业 IDE/RAG 接入 | 自治任务执行 | Google 生态分发 |
  | 状态模型 | Event/Projection + SQLite 表 | 文件/Git 为主 | IDE 状态 + task | IDE/workspace context | 任务/容器状态 | CLI session |
  | 扩展性 | 插件、MCP、自定义工具、HTTP API | 较有限 | 插件生态依赖 VS Code | 企业配置强 | 平台型 | Google provider 友好 |
  | 主要风险 | backlog、复杂度、稳定性 | 交互体验传统 | IDE 绑定 | 企业产品路径 | 部署重 | provider 生态绑定 |

### 集成成本

- **运行时与依赖：** Bun monorepo，根 `package.json` 指定 `bun@1.3.14`；Node 22 环境更稳。
- **安装复杂度：** 对终端用户可走官方安装方式；对源码研究/二次开发需 `bun install`，依赖体量较大。
- **学习曲线：** 使用层中等；二次开发层较高，需要理解 Effect、event/projection、session runner、tool registry、provider resolver。
- **从零到 smoke：** 安装 Bun + `bun install` 后，包级 typecheck/test 可跑；不建议从 repo root 跑测试，根 `test` 明确输出 `do not run tests from root`。


### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键库 / SDK。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| _待补关键依赖_ | | | | | | |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | ✅ | MIT |
| Bus factor | 🟡 中 | 非单作者项目，但 Top10 贡献占比约 80.5%，头部维护压力较重 |
| 供应商锁定 | 🟢 低 | 多 provider、MCP、插件、自定义工具降低模型锁定 |
| 维护趋势 | 🟢 高 | 最近 push/release 都在 24 小时内，迭代极活跃 |
| Backlog 压力 | 🔴 高 | 6,033 open issues + 1,031 open PRs，支持压力巨大 |
| 体验稳定性 | 🟡 中 | 高互动 issue 聚焦性能、内存、剪贴板、写入卡死、沙箱/隐私 |
| 架构迁移风险 | 🟡 中 | V1/V2 session runtime 并存，部分能力仍在 TODO 列表中 |
| 生产隔离 | 🟡 中偏高 | coding agent 天然有 shell/file side effects；强沙箱需要外部环境配合 |

### 结论

**🟢 推荐采用（个人/高级开发者） / 🟡 团队生产化前需隔离 PoC。**

理由：

- 作为日常个人 coding agent，OpenCode 已经具备很强的功能覆盖与生态势能。
- 作为架构学习对象，它比“聊天式 CLI”更有价值：其核心是 durable session runtime、event projection、tool settlement、location ownership，而不是 UI 壳。
- 作为团队生产底座，需要谨慎：backlog 极重，runtime 仍在 V1/V2 演进，权限/沙箱/隐私默认行为需要团队自己加防线。
- 推荐策略：个人可直接试用；团队先在隔离 workspace / 容器 / 只读或最小权限环境中验证，再考虑二次开发或集成。

---

## 场景二：技术架构学习

### 核心架构图

```text
┌────────────────────────────────────────────────────────────────────┐
│                         Client / Transport                         │
│ CLI/TUI · Desktop · Web/App · HTTP API · SDK · Slack/GitHub Action │
└───────────────────────────────┬────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────┐
│                         App Runtime Layer                          │
│ packages/opencode                                                  │
│ - server/routes/instance/httpapi                                   │
│ - session/processor, run-state, event-v2-bridge                    │
│ - tool/registry, plugin/index, config/agent                        │
└───────────────────────────────┬────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────┐
│                         Durable Core Layer                         │
│ packages/core                                                      │
│ - Session Service / Store / Input / ContextEpoch                   │
│ - EventV2 / Projector / Database                                   │
│ - SessionExecution / SessionRunner                                 │
└───────────────────────────────┬────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────┐
│                         One Turn Execution                         │
│  load projected history                                            │
│  → prepare system context / agent / model / tools                  │
│  → llm.stream(request) exactly once                                │
│  → durably publish text/reasoning/tool-call/provider events        │
│  → settle tool side effects                                        │
│  → publish toolResult / failure                                    │
│  → continue next turn or settle activity                           │
└───────────────────────────────┬────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────┐
│                  External Effect / Model / Tool Plane              │
│ Providers · MCP · Plugin tools · Shell · File edits · Web · LSP    │
└────────────────────────────────────────────────────────────────────┘
```

### 底层技术架构

#### 最小架构内核

OpenCode 的最小架构内核是：

> **Session Aggregate + Durable Event Log + Projection Store + Input Inbox + Context Epoch + Single-turn LLM Runner + Tool Settlement Hook**

脱掉 TUI、Desktop、README、品牌页之后，系统仍必须保留：

1. 一个可持久化的 session 聚合根。
2. 一个输入 inbox，区分“已录入”和“已提升为模型可见消息”。
3. 一个事件系统，把创建、输入、文本、推理、工具调用、工具结果、失败、模型切换等状态持久化。
4. 一个 projector，把事件投影成 session/message/input/context 表。
5. 一个 runner，每次只执行一个 provider turn，然后等待工具结算，再决定是否继续。
6. 一个 tool registry，把内置工具、插件工具、自定义工具和 MCP 能力物化成统一契约。

这套结构让 OpenCode 更接近“事务化 coding-agent 执行内核”，而不是“终端里的 prompt loop”。

#### 核心抽象

| 抽象 | 源码位置 | 职责 | 关键字段 / 方法 | 为什么重要 |
|------|----------|------|-----------------|------------|
| `Session.Service` | `packages/core/src/session.ts` | 会话聚合根 API | `create` / `prompt` / `resume` / `interrupt` | 所有用户输入、模型执行和中断都收敛到 session |
| `SessionInput` | `packages/core/src/session/input.ts` + `sql.ts` | 用户输入 inbox | `delivery: steer/queue`、`admitted_seq`、`promoted_seq` | 把“收到输入”和“模型看到输入”拆成两阶段 |
| `EventV2.Service` | `packages/core/src/event.ts` | durable event bus | `publish` / `project` / `aggregateEvents` / `replay` | 同时支撑持久化、投影、订阅和 replay |
| `SessionProjector` | `packages/core/src/session/projector.ts` | 事件到表的投影 | `events.project(...)` | UI/HTTP 读取的是 projection，而不是 runner 内存态 |
| `SessionContextEpoch` | `packages/core/src/session/context-epoch.ts` | 系统上下文 generation 管理 | `baseline` / `snapshot` / `revision` / `replacement_seq` | 防止上下文/agent/model 在运行中静默漂移 |
| `SessionRunner` | `packages/core/src/session/runner/llm.ts` | 单 session drain loop | `MAX_STEPS=25`、`llm.stream(request)`、tool settlement | coding agent 的真实执行心脏 |
| `ToolRegistry` | `packages/opencode/src/tool/registry.ts` | 工具装配与过滤 | builtin/custom/plugin tool materialization | 把外部能力统一成模型可调用工具契约 |
| `SessionExecution` | `packages/core/src/session/execution/*.ts` | 执行路由 | `wake` / `resume` / `interrupt` | session 按 location 归属到正确 runtime |
| `SystemContext` | `packages/core/src/system-context/index.ts` | 可刷新系统上下文 | `baseline` / `update` / `removed` / `snapshot` | 支持上下文变化检测与 replacement |
| `SessionRunnerModel` | `packages/core/src/session/runner/model.ts` | provider/model 解析 | catalog + route + API type | 多模型接入不直接散落在 runner 里 |

#### 控制面 / 数据面

- **控制面：**
  - CLI 入口、HTTP route、desktop/web UI、SDK 只是 transport 与命令分发层。
  - `Session.Service` 负责会话语义：create/prompt/resume/interrupt/model switch。
  - `SessionExecution` 根据 session location 把执行投到正确 runner。
  - `Config`、agent config、provider/model resolver、tool filtering 负责策略与能力选择。

- **数据面：**
  - `EventV2.publish()` 写入 durable synchronized event，并触发 projector。
  - `SessionRunner` 执行 `llm.stream(request)`，消费 provider stream。
  - Tool settlement 执行真实副作用：shell、文件读写、patch、web、LSP、MCP、plugin tools。
  - SQLite/Drizzle 表保存 session、message、input、context epoch、event sequence 等事实状态。

### 关键执行链路

#### 1. 用户输入：prompt admit → wake

```text
Session.prompt(input)
  ↓
SessionInput.admit(db, events, prompt, delivery)
  ↓
写入 admitted_seq，输入进入 durable inbox
  ↓
enqueueWake(admitted)
  ↓
SessionExecution.wake(sessionID, admittedSeq)
```

关键点：输入录入和模型执行是两个阶段。`packages/core/src/session.ts` 中 `prompt()` 先调用 `SessionInput.admit(...)`，再 `enqueueWake(...)`。wake 失败不会让输入丢失，只会影响后续调度。

#### 2. Runner drain：steer / queue promotion

```text
SessionRunner.run(sessionID)
  ↓
检查 pending steer / queue
  ↓
failInterruptedTools(sessionID)
  ↓
for step in 0..MAX_STEPS
  ↓
runTurn(sessionID, promotion)
  ↓
如果 tool call 或 steer 输入需要 continuation，则继续下一 turn
```

`MAX_STEPS = 25` 是防止 agent doom loop 的保险丝。`steer` 表示当前 activity 的用户打断/转向，`queue` 表示排到未来 activity 的输入。

#### 3. 单个 provider turn

```text
runTurnAttempt(sessionID, promotion)
  ↓
读取 projected session/history/context
  ↓
准备 system context epoch / agent / model / tool definitions
  ↓
构造 LLM.request
  ↓
llm.stream(request)  // 每个 turn 恰好一次
  ↓
持续 publish text/reasoning/provider/tool-call events
```

这条链路的设计重点是：一次 provider turn 只有一次 `llm.stream(request)`。工具循环不是在 provider stream 内无限递归，而是由 runtime 在工具结算后显式决定 continuation。

#### 4. 工具调用：先 durable 记录，再执行副作用

```text
provider emits tool-call
  ↓
publisher.publish(tool-call event)
  ↓
toolMaterialization.settle(call)
  ↓
执行本地工具 / MCP / plugin side effect
  ↓
publisher.publish(toolResult or failure)
  ↓
await all tool fibers
  ↓
needsContinuation ? next turn : settle
```

核心不变量：**工具不能先执行再补记账**。`packages/core/src/session/runner/llm.ts` 中 tool-call event 先进入 publisher，随后才启动 `toolMaterialization.settle(...)`。

#### 5. Context overflow 恢复

```text
providerError(context overflow) 且 assistant 尚未开始
  ↓
compactAfterOverflow(...)
  ↓
重建 turn
  ↓
再次 overflow 不允许无限恢复
```

这说明 OpenCode 把上下文溢出视为 runner 可恢复故障，但只允许有限恢复，避免无限 compaction/retry。

### 状态模型

| 状态类型 | 位置 | 谁读写 | 生命周期 / 一致性规则 |
|----------|------|--------|------------------------|
| Session 聚合状态 | `session` 表 | Session projector / Store | session 的标题、agent、model、token/cost、目录、更新时间等事实快照 |
| Message 投影状态 | `session_message` / legacy message/part 表 | Event projector | UI/HTTP 从 projection 读取历史，不直接依赖 runner 内存 |
| Input inbox | `session_input` 表 | `SessionInput.admit/promote`、Runner | `admitted_seq` 和 `promoted_seq` 分离，允许 pending 输入 |
| Context epoch | `session_context_epoch` 表 | `SessionContextEpoch.prepare/reconcile/replace` | 保存 baseline/snapshot/revision，检测上下文替换和 agent mismatch |
| Event sequence | Event tables | `EventV2.publish/replay` | aggregate seq 保证同一 session 内事件顺序和 replay 边界 |
| Runtime busy/idle | app runtime `run-state` | 进程内 runner | 只是本地运行优化，不是事实源 |
| Live stream delta | session events | Runner / UI subscribers | delta 服务在线 UI；可重放状态依赖 ended/full boundary |
| 外部副作用状态 | 文件系统、shell、MCP、provider API | Tool settlement | 通过 tool-call/tool-result/failure 事件建立审计边界 |

### 契约边界

- **Core vs App：**
  - `packages/core` 承担 durable contract：Session、Event、Projector、Runner、DB、SystemContext。
  - `packages/opencode` 承担本地运行时：CLI/server/UI bridge、tool registry、plugin loading、V1/V2 兼容层。

- **Runner vs Tool：**
  - Runner 不 hardcode 工具集合；它依赖 registry/materialization 返回 tool definitions 和 settlement hook。
  - 这让内置工具、插件工具、自定义工具、MCP 工具可以统一进入模型上下文。

- **Provider vs Model：**
  - runner 不直接按字符串调用 provider；模型经 catalog/provider/route 解析成标准 LLM request。
  - 这为多 provider、多 API 风格、多模型别名提供隔离层。

- **Transport vs Domain：**
  - HTTP handlers / CLI commands 不应承载会话执行语义；它们调用 Session/Execution/Store 服务。
  - 这让 CLI、TUI、Web、Desktop 和 API 能共享同一个核心。

- **V1 vs V2：**
  - 目前仍有 V1 session/message 与 V2 event/runtime 的兼容 seam。
  - 报告应把这视为“演进态架构”，不是完全收敛态。

### 失败与降级模型

| 失败类型 | 检测方式 | 系统行为 | 降级 / 修复动作 |
|----------|----------|----------|------------------|
| wake 失败 | `execution.wake` cause | 输入已 durable admit，不丢数据 | 后续 resume/wake 可继续处理 |
| location mismatch | runner 检查 session location | 中断当前 runtime 执行 | 由正确 location 的 runner 接管 |
| agent/context 替换竞争 | `SessionContextEpoch.current/prepare` | die 到 turn transition / replacement | 重建 context epoch 或阻断替换 |
| provider context overflow | provider error 且 assistant 未开始 | 触发 overflow compaction | 只允许有限恢复，避免无限重试 |
| provider 未返回 tool result | stream 成功但 tool 未结算 | `failUnsettledTools` | 记录失败，避免悬挂 pending tool |
| tool fiber interrupt | Effect cause has interrupt | 清理 fibers，发布工具失败 | 当前 activity 中断 |
| 普通 tool 异常 | settlement failure | tool failed event | 错误进入模型/历史边界 |
| agent doom loop | 超过 `MAX_STEPS=25` | `StepLimitExceededError` | 停止 activity，需要用户介入 |
| app server 端口冲突 | listen error | 4096 失败则回退随机端口 | 保持本地服务可启动 |
| 用户状态目录权限异常 | 测试/运行时 mkdir EACCES | 相关功能失败 | 修复状态目录权限或改隔离 HOME/XDG 路径 |

### 可复刻设计不变量

1. **先 admit 后执行。** 用户输入必须先进入 durable inbox，再异步唤醒执行器。
2. **输入两阶段生命周期。** `admitted_seq` 与 `promoted_seq` 分离，允许“已收到但尚未进入模型上下文”的状态。
3. **steer 与 queue 明确分离。** 当前 activity 的转向与未来 activity 的排队不能混成同一种输入。
4. **每个 provider turn 恰好一次 `llm.stream(request)`。** 工具循环由 runtime 显式 continuation 驱动。
5. **副作用前必须先有 durable tool-call 记录。** 工具不能先执行再补记账。
6. **工具结算必须收敛。** 所有 local tool fibers 要么 success，要么 failure，要么 interrupted，不允许 pending 永久悬挂。
7. **继续执行永远从 projection 重载历史。** 不依赖 runner 内存拼接上下文，crash 后可恢复。
8. **session ownership 以 location 为准。** 错位 runtime 不能偷跑其他 workspace/session。
9. **live delta 与 durable replay 边界分离。** 在线 UI 可消费增量，但 replay 依赖完整事件/投影。
10. **上下文 baseline 要可比较、可替换、可阻断。** System context 不是一次性字符串，而是带 snapshot/revision 的 generation。
11. **协议层薄，领域层厚。** CLI/HTTP/TUI 只做 transport mapping，业务语义进入 session/event/tool core。
12. **步数与恢复要有保险丝。** coding agent loop 必须有 max steps、bounded retry、bounded overflow recovery。

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 语言/运行时 | TypeScript + Bun | Rust/Go 的单二进制与更低资源占用 | 前端/桌面/CLI/SDK 共享生态，开发速度快 |
| 核心范式 | Effect + typed services/layers | 简单 async/await 的低门槛 | 为复杂并发、资源、fiber、错误处理提供结构化模型 |
| 持久化 | Event/Projection + SQLite/Drizzle | 纯内存 prompt loop 的简单性 | 支持 replay、订阅、多客户端、一致性边界 |
| 会话输入 | inbox + sequence promotion | “用户消息直接 append 到历史”的简单实现 | 支持 steer/queue、中断、恢复和并发边界 |
| Tool 执行 | durable tool-call 后 settlement | 低延迟直接调用 | 换取审计、恢复和失败收敛 |
| 多入口 | CLI/TUI/Desktop/Web/HTTP 同构 | 单入口工具的简洁性 | 把 OpenCode 做成 runtime，而非单一终端应用 |
| 多 provider | catalog/route resolver | 对单 provider 的深度优化 | 避免模型锁定，适配开放生态 |
| V1/V2 迁移 | 兼容层渐进演进 | 架构整洁度 | 保持产品连续性，降低一次性重写风险 |

### 值得学习的模式

1. **Durable input inbox：** 对 agent runtime 来说，输入是事件，不是函数参数。
2. **Tool settlement as transaction boundary：** 工具调用要有 durable intent、side effect、result/failure 三段式。
3. **Context epoch：** 把系统上下文当成可观测、可比较、可替换的状态源，而不是拼接字符串。
4. **Projection-first UI：** UI 和 API 从 projection 读状态，runner 只负责推进事件。
5. **Location-scoped execution：** 多 workspace、多 client、多 runtime 下必须有 ownership 规则。
6. **Thin transport, thick domain：** 多入口产品尤其需要把业务语义下沉到 domain service。

### 反模式 / 踩坑点

1. **复杂度债务很高。** Effect、event/projection、V1/V2 bridge、multi package、多客户端、多 provider 叠加，二次开发门槛高。
2. **Backlog 是真实风险。** 6k+ open issues 和 1k+ open PRs 说明生态非常热，也说明支持压力极大。
3. **默认权限边界要谨慎。** Coding agent 的 shell/file/write 能力天然高风险，团队使用必须配隔离环境。
4. **迁移态架构会增加理解成本。** V1/V2 并存时，读源码要区分旧 message/part 投影和新 session runner/event 流。
5. **包内测试要求严格。** 根测试被禁止，必须按包运行；本地状态目录权限也会影响 core 测试。

### 可借鉴的具体技术点

- `packages/core/src/session/runner/llm.ts`：单轮 provider turn、tool settlement、overflow recovery、step limit。
- `packages/core/src/session/input.ts` + `sql.ts`：input inbox 与 admitted/promoted sequence。
- `packages/core/src/event.ts`：typed durable event bus + projector + replay。
- `packages/core/src/session/context-epoch.ts`：system context generation/reconcile/replace。
- `packages/opencode/src/tool/registry.ts`：内置工具、插件工具、自定义工具的统一 registry。
- `packages/opencode/src/server/routes/instance/httpapi/`：HTTP transport 如何薄封装 domain service。

---

## 架构解剖

### 目录结构

```text
opencode/
├── packages/
│   ├── core/                 # Durable core：Session、Event、Runner、DB、SystemContext
│   │   └── src/session/       # session aggregate、input、store、runner、projector
│   ├── opencode/             # 主 CLI/server runtime：tools、plugins、config、HTTP、processor
│   │   └── src/tool/          # 内置工具与 registry
│   ├── llm/                  # LLM client/event/request/provider abstraction
│   ├── tui/                  # terminal UI
│   ├── app/                  # web/app frontend
│   ├── desktop/              # desktop package
│   ├── sdk/                  # SDK package
│   ├── plugin/               # plugin API
│   ├── ui/                   # shared UI/theme/assets
│   ├── console/              # console/landing/stats related apps
│   └── slack/                # Slack integration
├── .github/workflows/        # typecheck/test/release/deploy/docs/triage 等流水线
├── AGENTS.md                 # 开发约束，含测试与 typecheck 规则
├── CONTEXT.md                # 项目架构/状态上下文
├── package.json              # Bun workspace 根配置
└── bun.lock                  # Bun lockfile
```

### 技术栈

- **运行时 / 框架：** TypeScript、Bun 1.3.14、Node 22 target、Effect、Hono、Solid、Electron/Tauri-like desktop packaging surface（desktop package）。
- **数据库 / 状态：** SQLite + Drizzle ORM 风格 schema、event sequence、projection tables。
- **构建 / 包管理：** Bun workspace、Turbo、tsgo / TypeScript native preview、oxlint、prettier。
- **测试：** Bun test，包级测试；root `test` 明确禁止。
- **CI/CD：** GitHub Actions：typecheck、test、publish、deploy、docs sync、triage、review、VS Code publishing 等。

### 模块依赖关系

```text
Client packages
  ├── CLI/TUI/Desktop/Web/HTTP
  │
  ▼
packages/opencode
  ├── ToolRegistry / Plugin / Config / Server / SessionProcessor
  │
  ▼
packages/core
  ├── Session.Service
  ├── SessionExecution
  ├── SessionRunner
  ├── EventV2
  ├── SessionProjector
  ├── SystemContext
  └── Database
  │
  ├── packages/llm      → provider/model stream
  ├── MCP/plugin tools  → external capabilities
  └── filesystem/shell  → side effects
```

关键观察：依赖方向整体是“入口层 → app runtime → durable core → provider/tool side effects”。真正的 session 事实源在 core，而不是 UI 或 CLI。

### 扩展机制

- **Plugin tools：** `ToolRegistry` 会读取 plugin list 中的 `tool` 定义，把 Zod/legacy args 转成 JSON Schema/Effect schema。
- **Filesystem custom tools：** 扫描 config directories 下 `{tool,tools}/*.{js,ts}`，动态 import 并注册。
- **MCP：** 通过工具层接入外部 MCP 能力，最终仍进入统一 tool contract。
- **HTTP API / SDK：** 为外部系统提供 session、event、instance 等控制面入口。
- **Agent config：** agent/model/tool/prompt 行为可以通过配置选择和路由。

---

## 质量与成熟度

### 代码质量

- **类型系统：** TypeScript + Effect typed services/layers，核心路径类型约束强；schema/codec 用于 event、context、tool 参数边界。
- **错误处理：** 大量错误走 Effect cause / typed error / tagged error；runner 对 interrupt、provider error、tool failure、context overflow 有显式分支。
- **代码风格：** monorepo 结构清晰，但复杂度高；Effect 风格对新贡献者不友好。
- **演进状态：** session runtime 仍有 V1/V2 迁移 TODO，不应把当前 core 视为完全稳定收敛版。

### 测试

本地低风险验证（2026-06-14）：

| 命令 | 结果 |
|------|------|
| `node -v` | `v22.22.3` |
| `bun -v` | `1.3.14` |
| `packages/opencode: bun typecheck` | 通过，退出码 0 |
| `packages/app: bun run test:unit` | 376 pass / 0 fail，退出码 0 |
| `packages/opencode: bun test --timeout 30000 --only-failures` | 3003 tests，2980 pass / 22 skip / 1 todo / 0 fail，退出码 0 |
| `packages/core: bun typecheck` | 通过，退出码 0 |
| `packages/core: bun test --timeout 30000 --only-failures` | 因本机用户状态目录权限异常失败：195 pass / 110 fail / 110 errors |
| `packages/cli: bun run build` | 构建成功，但会触发依赖安装/lockfile save，不适合作为无副作用 smoke |

注意：根 `package.json` 的 `test` 脚本明确输出 `do not run tests from root` 并退出 1；测试应按包或 CI workflow 规则运行。

### CI/CD

- `.github/workflows/typecheck.yml`：typecheck。
- `.github/workflows/test.yml`：`bun turbo test`，并有 HTTP API test 路径。
- `.github/workflows/publish*.yml` / `release*.yml`：发布主包、GitHub Action、VS Code 等。
- `.github/workflows/triage.yml` / review/pr-management/close workflows：社区自动化管理较重。

### 文档质量

- README 对终端用户友好，品牌与入口清晰。
- `AGENTS.md` 对贡献者/agent 开发约束明确，尤其强调不要从 root 跑测试、typecheck 要按包跑。
- `CONTEXT.md` 提供较完整的项目上下文，有利于 agent/self-hosted development。
- 对二次开发者来说，源码结构清楚，但 Effect + V1/V2 迁移使“从文档直接理解 runtime”仍有门槛。

### Issue / PR 健康度

- Open Issues：6,033。
- Open PRs：1,031。
- 高互动问题集中在：性能响应慢、内存占用/泄漏、剪贴板、写入卡死、沙箱、隐私默认行为、模型兼容。
- 解释：OpenCode 是高热度、高活跃、高 backlog 项目。生态势能强，但维护队列和稳定性压力也真实存在。

---

## 社区与生态

### 社区评价

OpenCode 的生态信号非常强：174k+ stars、21k+ forks、最近 release/push 都很新。它已经不是“小众工具”，而是 coding agent 赛道的主流开源项目之一。

同时，过高的 issue/PR backlog 说明它面临典型爆红项目问题：用户预期、平台兼容、provider 兼容、终端差异、隐私/沙箱诉求一起涌入，维护者需要在产品速度和稳定性之间持续取舍。

### 衍生项目 / 插件生态

- MCP 与 plugin tools 让它可以接外部工具生态。
- SDK / HTTP API / GitHub Action / Slack / desktop/web 包说明项目不只想做 CLI，而是想做 coding-agent runtime 与多入口产品线。
- 这带来更强生态潜力，也带来更高发布/兼容复杂度。

### 竞品对比

| 项目 | Stars（2026-06-14） | 定位 | 与 OpenCode 的核心差异 |
|------|---------------------|------|--------------------------|
| OpenCode | 174k | 开源 coding-agent runtime，多入口、多模型、MCP/插件 | runtime 化最明显，热度最高，backlog 也最重 |
| Gemini CLI | 105k | Google 生态 CLI agent | provider/生态背书强，开放 runtime extensibility 不同 |
| OpenHands | 76k | 自治软件工程 agent / 云端任务执行 | 偏任务平台，部署重 |
| Cline | 63k | VS Code agent 插件 | IDE 体验强，但入口绑定 VS Code |
| Aider | 46k | Git 驱动 CLI coding assistant | 成熟稳健，架构更传统，runtime 多入口弱 |
| Continue | 33k | IDE assistant / 企业接入 | 企业配置/RAG/IDE 集成强，非独立 CLI runtime |

---

## 关键代码走读

### 1. Session prompt admit

- 路径：`packages/core/src/session.ts`
- 职责：接收用户 prompt，写入 durable input inbox，再唤醒执行器。
- 实现要点：
  - `prompt()` 先 `SessionInput.admit(...)`，得到 `SessionInput.Admitted`。
  - 默认 `delivery` 是 `steer`。
  - `enqueueWake(admitted)` 异步 fork，不把输入录入和执行开始绑定成同一事务。

### 2. Session input schema

- 路径：`packages/core/src/session/sql.ts`
- 职责：定义 `session_input` 表。
- 实现要点：
  - `delivery`：`steer` 或 `queue`。
  - `admitted_seq`：输入被录入的 session 序号。
  - `promoted_seq`：输入被提升为模型上下文的序号，可为空。
  - pending index 按 session、promoted、delivery、admitted 排序。

### 3. EventV2 durable event bus

- 路径：`packages/core/src/event.ts`
- 职责：统一事件发布、订阅、投影、replay、aggregate event 读取。
- 实现要点：
  - `publish()` 可附带 `commit`，实现事件与本地 projection 的原子操作。
  - `project()` 注册 projector。
  - `aggregateEvents()` 为 session/event stream 提供 replay 入口。

### 4. Session projector

- 路径：`packages/core/src/session/projector.ts`
- 职责：把 session 事件投影到表。
- 实现要点：
  - session created/updated/deleted、message/part update、agent/model switch 都走 `events.project(...)`。
  - agent/model switch 会请求 `SessionContextEpoch` replacement，避免上下文静默漂移。

### 5. Session runner

- 路径：`packages/core/src/session/runner/llm.ts`
- 职责：coding agent 的执行核心。
- 实现要点：
  - `MAX_STEPS = 25`。
  - 进入 run 前检查 pending steer/queue。
  - 每个 turn 执行一次 `llm.stream(request)`。
  - tool-call 先 publish，再 `toolMaterialization.settle(...)`。
  - 所有 tool fibers settle 后才 continuation。
  - context overflow 可触发 compaction 后重试，但二次 overflow 不无限恢复。

### 6. Tool registry

- 路径：`packages/opencode/src/tool/registry.ts`
- 职责：把内置工具、插件工具、文件系统自定义工具组合成模型可调用工具。
- 实现要点：
  - 内置工具包括 shell/read/glob/grep/edit/write/task/fetch/todo/search/skill/patch/question/lsp/plan。
  - 插件工具支持 Zod args 与 legacy schema。
  - 自定义工具从 config directories 的 `{tool,tools}/*.{js,ts}` 动态加载。
  - 工具输出会经过 truncation，避免模型上下文被超长输出打爆。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 5 | CLI/TUI/Desktop/Web/HTTP、工具、MCP、插件、多模型覆盖完整 |
| 代码质量 | 4 | 类型与错误模型强，但 Effect + V1/V2 迁移增加复杂度 |
| 文档质量 | 4 | README/AGENTS/CONTEXT 较好，runtime 深层文档仍有门槛 |
| 社区活跃度 | 5 | 超高热度与近期 release，但 backlog 极重 |
| 架构设计 | 5 | durable session/event/projection/tool settlement 是同类高价值设计 |
| 学习价值 | 5 | 非常适合学习 coding-agent runtime 的底层不变量 |
| 可借鉴度 | 5 | input inbox、context epoch、tool settlement、projection-first UI 可复用 |

---

## 总结

### 一句话评价

OpenCode 最值得看的不是“又一个开源 Claude Code”，而是它把 coding agent 做成了 **durable session runtime**：输入有 inbox，执行有 location ownership，工具有 settlement，状态有 event/projection，上下文有 epoch，UI 只是 projection 的多个消费者。

### 谁应该用

- 想要开源、多模型、多入口 coding agent 的个人开发者。
- 需要 MCP/插件/HTTP API/SDK 扩展面的高级用户。
- 正在设计自有 agent runtime、需要参考 session/event/tool settlement 架构的团队。
- 可以接受高频迭代和偶发不稳定，并愿意用隔离环境运行 agent 的用户。

### 谁不应该直接用

- 需要强企业审计、默认沙箱、多租户隔离、稳定 SLA 的团队。
- 不愿处理 provider 兼容、终端差异、权限配置、状态目录等工程细节的用户。
- 只需要稳定 Git patch flow 的用户，Aider 可能更简单。
- 只需要 IDE 内深度体验的用户，Cline/Continue 更贴合。

### 下一步

- 个人试用：直接安装 OpenCode，在非关键仓库或隔离工作区试用。
- 团队 PoC：放入容器/临时 worktree/最小权限目录，限制 shell/file 权限，记录工具副作用。
- 架构学习：优先读 `packages/core/src/session/runner/llm.ts`、`session/input.ts`、`event.ts`、`context-epoch.ts`、`tool/registry.ts`。
- 二次开发：先理解 V1/V2 session 迁移边界，再决定接 HTTP API、plugin 还是 core package。
