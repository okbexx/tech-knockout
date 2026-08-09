# Prime Agent

> 一句话定位：**Prime Agent 是从 Pi 分叉并重构出的持久化 Coding Agent runtime：以 `AgentSession` 为执行聚合根，以常驻 daemon/worker 隔离会话树，以 IPython 作为模型默认工具面，再把 RLM 子代理、Agent2Agent、autonomous gates 与可回滚 continual harness 组合成长时自治系统。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `PrimeIntellect-ai/prime-agent` |
| URL | `https://github.com/PrimeIntellect-ai/prime-agent` |
| 冻结提交 | `a18809e00ea30638584d87b3afea7285a9d7296c` |
| Star | 9,747（2026-08-09 GitHub API 快照） |
| Fork | 936 |
| 许可证 | MIT |
| 主要语言 | TypeScript；另含 Python kernel runtime |
| 默认分支 | `main` |
| GitHub 仓库创建 | 2026-05-08 |
| 上游历史根提交 | 2025-08-09，继承自 Pi monorepo |
| 分叉提交 | `8b5abc6a`，`fork pi-mono as prime agent`（2026-05-07） |
| 冻结 HEAD 提交时间 | 2026-08-07 |
| 最新 Release | `v0.7.1`（2026-08-07） |
| Git 历史 | 4,480 commits；256 个 name/email identity |
| 分叉后历史 | 2026-05-07 起 524 commits |
| Open Issues / PRs | 167 issues / 249 PRs |
| Closed Issues / merged PRs | 16 issues / 498 PRs；另有 127 个 closed-unmerged PR |
| 源码规模 | 1,134 tracked files；912 个 TS 文件、约 344,579 行 TS；23 个 Python 文件、约 4,115 行 Python |
| 测试资产 | 415 个 `*.test.ts` / `*.spec.ts` 文件（静态计数） |
| 分析日期 | 2026-08-09 |

> 验证边界：本报告对冻结源码、Git 历史、GitHub API、发布信息和官方博客做静态核验；**未安装依赖、未启动 Prime Agent、未运行其测试/构建/benchmark**。所有运行时体验、跨平台行为和性能结论均据此降级表述。

---

## 场景一：是否值得采用

### 解决的问题

Prime Agent 不是为了再做一个“LLM + bash + edit”的终端聊天程序，而是试图解决四个更难的问题：

1. **长会话如何保持可恢复。** UI 关闭后 agent 继续运行；daemon 或 worker 重启后可以从 JSONL、artifact 和 kernel snapshot 恢复。
2. **模型如何程序化组织上下文和子任务。** 模型在持久 IPython 中写 Python，把检索、工具和子代理调用组合成程序，而不是只能逐个发固定 JSON tool call。
3. **多代理如何从一次性 task 升级成持久关系。** RLM child 有独立 session、kernel、历史和目录；父子可在后续 turn 继续通信，而不是返回一次摘要后销毁。
4. **harness 如何随任务积累可复用状态。** `/refine` 根据 trajectory 修改 prompt note、memory、skill、subagent spec，并保留历史与 rollback。

典型使用场景：

- **个人长时编码任务**：关闭终端后 agent 仍执行；稍后重新 attach 查看或 steering。
- **并行代码审查**：根 agent 用 `await rlm(...)` 启动 API、测试、安全三个 retained child，继续主线工作，结果异步返回。
- **长时 eval / autoresearch**：目标、heartbeat、token/turn/time budget、completion gate 一起约束 unattended run。
- **研究 agent harness**：拆解 IPython host bridge、daemon recovery、session lease、multi-agent accounting、continual harness。
- **嵌入其他客户端**：通过 SDK、JSON/RPC、ACP 或 local daemon protocol 驱动同一 runtime。

### 核心能力与边界

#### 能做什么

- 多 provider/model substrate，继承并继续维护 Pi 的 `ai`、`agent`、`tui`、`coding-agent` 包层。
- 交互 TUI、print、JSON、RPC、piped input、SDK、daemon client 和 ACP 等多入口。
- 每个 root session tree 独占 worker；支持 detach/attach、switch/fork/import、session lease、snapshot/replay。
- 默认以持久 IPython kernel 为模型工具面，Python skills 在 kernel namespace 中调用。
- RLM 子代理异步 admission、独立 runtime、持久 registry、显式 Agent2Agent 消息与 usage attribution。
- autonomous continuation、goal、heartbeat、cron-style session schedule、completion gate 与多重预算。
- continual harness：prompt、memory、skill、subagent 四类 CRUD；local/global scope；refinement history 与 rollback。
- extensions、自定义 provider、custom tools、skills、MCP integration 与 ACP metadata 扩展。

#### 不能做什么 / 不应误解为什么

- **不是安全沙箱。** `packages/coding-agent/docs/rlm-runtime.md:249-253` 明确说明 IPython 执行模型生成的 Python 和 shell magic，权限等同 worker OS 用户；kernel 只是协议/生命周期边界。
- **“Self-improving”不是训练模型。** `/refine` 是另一次 LLM review 生成 JSON edits，然后修改 harness 状态；不更新模型权重，也没有自动因果证明这些 edits 提升了成功率。
- **不是完全 hermetic 的长期作业系统。** session/job 有恢复语义，但 shell、文件、网络和外部 API side effect 仍可能处于 uncertain 状态，系统选择“不自动重放”。
- **不是成熟的多租户 Agent 平台。** daemon token、owner-only files 和 process isolation 面向同一 OS 用户下的本地协调，不构成 hostile tenant isolation。
- **不是 Prime Intellect 从零原创的全部 runtime。** 4,480 个 commits 中大量 AI/provider/agent/TUI/session 基础来自 Pi；Prime 自有增量主要是 IPython/RLM、daemon、long-running/autonomous、refine、A2A、Agents View 与 ACP 组合。
- **没有默认命令审批防线。** 默认 IPython 能执行任意 Python/shell；仓库有 sandbox extension example 和 remote operation hooks，但不是默认强制 gate。

#### 与 Pi 的真实关系

Git 历史给出了清晰边界：

```text
Pi monorepo / Mario Zechner 主导的基础历史
  ↓ 3e5ad67e: 迁移 npm scope 到 @earendil-works
8b5abc6a: fork pi-mono as prime agent
  ↓
IPython default + RLM bridge + long-running goal
  ↓
daemon workers + Agents View + A2A
  ↓
/refine continual harness + autonomous gates + ACP
```

因此，评估 Prime Agent 应采用“双层归因”：

- provider 适配、基础 agent loop、TUI、extensions、JSONL session tree 等主要是 **Pi substrate**；
- RLM-native execution、每 root worker 的 daemon topology、retained children、continual harness 和 long-horizon control 是 **Prime Agent 的差异化工程**。

### 集成成本

- **终端使用**：官方安装器最终安装 npm tarball；Node 要求 `>=22.8.0`。若启用 RLM/IPython，还需要可用 Python、`uv`、`ipykernel` 和 ZeroMQ native binding。
- **源码开发**：npm workspaces；根构建串行构建 `tui → ai → agent → coding-agent`，同时包含 Python runtime 包。
- **运行状态**：默认写入 `~/.prime/agent`，包括 auth、settings、sessions、session-artifacts、daemon/worker metadata、harness 和 kernel environment。
- **理解成本**：高。需要同时理解 Pi agent substrate、append-only session tree、daemon supervisor/worker protocol、Jupyter ZeroMQ、RLM host request、refinement state 和 autonomous continuation。
- **团队 PoC 建议**：固定 `v0.7.1` 或具体 SHA；在容器/VM/低权限工作区运行；关闭 telemetry；限制 secrets 暴露；先验证 one-shot coding，再验证 daemon/child/refine。

### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键依赖和协议。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| `@earendil-works/pi-ai` | model substrate | provider adapters、stream、usage、cost、thinking | 统一多 provider 消息与流式语义 | `packages/coding-agent/package.json:49-73`；`packages/ai/` | **高**：需要 TypeScript 多模型 substrate 时优先研究 | Prime fork scope 与上游 Pi 演进会带来跟踪成本 |
| `@earendil-works/pi-agent-core` | agent runtime | message state、tool loop、steer/follow-up、transport | 把 agent loop 与具体 UI 解耦 | `packages/agent/`；`agent-session.ts` | **高**：轻量可嵌入 agent core | Prime 的持久/daemon 语义主要在 coding-agent 层，不在 core 单包 |
| `@earendil-works/pi-tui` | terminal UI | interactive/Agents View/components | 终端交互、增量渲染与组件模型 | `packages/tui/`、`packages/coding-agent/src/modes/interactive/` | **中高**：终端原生产品可复用 | UI 与 daemon capability 协商增加测试矩阵 |
| `zeromq` + Jupyter protocol | runtime / IPC | IPython shell、IOPub、control channels | 持久 REPL、异步 host request、interrupt/shutdown | `kernel/index.ts`；`docs/rlm-runtime.md:76-123` | **高**：需要模型可编程 REPL 时很有价值 | native dependency、进程清理和 Windows 行为复杂 |
| `prime-agent-runtime` / `ipykernel` | Python runtime | `rlm`、goal、refine、agent_message skills | 给模型稳定 Python API，执行仍留在 TS host | `prime-agent-runtime/pyproject.toml`；`src/rlm/` | **高**：host-owned policy + thin Python shim 是好边界 | 不是 sandbox；bootstrap/venv/ABI 都是运维面 |
| `proper-lockfile` | concurrency / storage | session lease、同路径互斥 | 防止多个 worker 同时写同一 transcript | `packages/coding-agent/package.json:66`；`session-lease.ts` | **高**：本地多进程 JSONL 状态适用 | network filesystem 与异常进程恢复需额外验证 |
| `typebox` | schema | tools、protocol payload、config | 统一 runtime validation 与 TS 类型 | coding-agent tool/protocol 层 | **高**：协议密集型 TS runtime 适用 | schema/version migration 仍需显式治理 |
| `@agentclientprotocol/sdk` | protocol SDK | ACP server/client surface | 接入支持 ACP 的编辑器或宿主 | `packages/coding-agent/package.json:50`；`modes/acp/` | **中高**：需要标准 agent client protocol 时复用 | Prime 特有能力只能放 namespaced `_meta`，互操作会降级 |
| `@modelcontextprotocol/sdk`（optional peer/transitive） | protocol SDK | MCP integration skills/extensions | 接入外部 tools/services | lockfile peer evidence；内置 MCP skills | **中**：生态连接面成熟 | 外部 MCP 即可信代码/网络边界，context 和凭据面扩大 |
| `vitest` | test framework | unit/integration/process/kernel tests | 支持 415 个 TS test/spec 文件与 CI shards | 各 package manifest；`.github/workflows/ci.yml` | **高**：TS monorepo 标准选择 | 静态测试数量不等于当前 HEAD 在本机通过 |
| GitHub Actions + R2 + npm tarball | release pipeline | build、pack、checksum、channel pointer、installer | 同时提供 immutable version artifact 与 stable/beta pointer | `.github/workflows/build-binaries.yml` | **中高**：两阶段 pack/publish 值得学 | workflow pinning 混杂；发布凭据集中于 publish trust domain |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | ✅ | 根仓库 MIT；但二次分发时仍应保留 Pi 历史和第三方 notices |
| Bus factor | 🟡 中偏高 | 分叉后 524 commits 中 Kevin Thomas 同 email 326（62.2%）；前三 identity 合计 80.9% |
| 供应商锁定 | 🟢 低到中 | 多 provider 与 custom provider 降低模型锁定；默认 Prime 登录、内置 Prime skill、analytics endpoint 增加产品耦合 |
| 维护趋势 | 🟢 极活跃 | 三个月内快速演进至 v0.7.1；高频 release 同时意味着兼容面仍在快速变化 |
| 默认执行权限 | 🔴 高 | IPython 与 shell magic 直接继承 OS 用户权限，默认不是 approval-first 或 sandbox-first |
| 长任务稳定性 | 🟠 中高 | 冻结观测日存在 heap OOM、child usage flood、compaction self-amplification、worker recovery 等开放问题 |
| Windows | 🟠 中高 | uv shim、daemon socket、kernel cwd lock、worker shutdown、WSL shell 等问题集中暴露 |
| Telemetry | 🟠 中 | `telemetry.enabled` 默认 true；支持 `DO_NOT_TRACK`、`PI_OFFLINE`、`PRIME_AGENT_TELEMETRY=false`，但团队应显式关闭 |
| 供应链 | 🟠 中 | lockfile、checksum、`min-release-age=7` 是积极信号；普通 CI actions 和部分 release artifact actions 仍用浮动 tag |
| 协议/状态复杂度 | 🟠 中高 | daemon protocol、schema revision、worker generation、journal、snapshot、leases 和 child registry 组合导致状态空间大 |
| Benchmark 外推 | 🟠 中 | 官方报告 ARC/long-context 成绩，但当前没有模型按 Prime harness 训练，且本报告未独立复现 benchmark |

### 结论

**🟡 推荐架构学习与个人隔离试用；团队高权限、长时自治生产暂缓。**

推荐方式：

- **研究源码**：强烈推荐，特别是 RLM host bridge、daemon recovery、session lease、continual harness。
- **个人日常编码**：可固定版本试用；不要一开始就让它持有生产凭据或无限制运行长任务。
- **团队内部 PoC**：容器/VM、最小权限、单独 secrets broker、关闭 telemetry、设置 turn/token/time gates。
- **生产关键仓库**：等待 v1 稳定契约、默认 permission/sandbox 策略、Windows parity、长任务问题收敛与安全政策补齐。

---

## 场景二：技术架构学习

### 核心架构图

```text
CLI / TUI / print / JSON / RPC / SDK / ACP
                    │
                    ▼
          Client / AgentConnection
                    │ public local JSONL protocol
                    ▼
         Daemon Supervisor (control plane)
  routing · auth token · journal · replay cursor · adoption
       │                 │                 │
       ▼                 ▼                 ▼
 catalog process    root worker A     root worker B
 session scans      AgentSession      AgentSession
                    │   │   │
                    │   │   └─ scheduler / goals / heartbeats
                    │   └──── extensions / resources / providers
                    └──────── IPython KernelManager
                                  │ Jupyter ZeroMQ
                                  ▼
                       prime-agent-runtime (Python)
                    rlm · goal · refine · agent_message
                                  │ host.request
                                  ▼
                      retained child AgentSession(s)
```

### 底层技术架构

#### 最小架构内核

脱掉品牌、TUI、provider 数量和博客后，Prime Agent 的最小内核是：

> **Append-only Session Tree + AgentSession Runtime + Resident Worker Ownership + Versioned Daemon Protocol + Persistent IPython Host Bridge + Retained Child Registry + Bounded Continuation + Editable Harness Ledger**

它不是单一 agent loop，而是三个相互约束的状态机：

1. **会话状态机**：JSONL tree、active leaf、compaction、fork/switch/import、artifact。
2. **进程状态机**：supervisor、resident/client-owned worker、lease、journal、generation、recovery。
3. **自治状态机**：goal/heartbeat/schedule、RLM children、autonomous budgets/gates、refine plan/apply。

#### 核心抽象

| 抽象 | 源码位置 | 职责 | 关键字段 / 方法 | 为什么重要 |
|------|----------|------|-----------------|------------|
| `AgentSession` | `packages/coding-agent/src/core/agent-session.ts` | 单会话执行聚合根 | prompt/continue/compact/refine、RLM registry、goal/autonomous、usage | Prime 差异化功能最终都收敛在这里，当前也是复杂度最高的 god object |
| `AgentSessionRuntime` | `core/agent-session-runtime.ts:79-108` | 绑定 session、cwd services、lease 与子 runtime | replace/new/switch/fork/import/dispose | 把会话对象和可重建 runtime 生命周期分开 |
| `SessionManager` | `core/session-manager.ts` | JSONL tree、leaf、branch、entries、load/save | append、branch、session file | durable transcript 的事实源 |
| `AgentSessionServices` | `core/agent-session-services.ts` | cwd-bound composition | auth/model/resources/tools/extensions/settings | runtime rebuild 时重建环境相关服务，避免陈旧 cwd captures |
| `DaemonSupervisor` | `modes/daemon/daemon-supervisor.ts` | public socket、worker ownership、routing、journal、recovery | create/attach/adopt/restart/route | 将多会话协调从执行数据面剥离 |
| `DaemonMode` / worker | `modes/daemon/daemon-mode.ts` | root runtime、children、scheduler、client attachment | session commands、events、snapshot | 每个 root tree 的真实执行所有者 |
| `DaemonAgentConnection` | `modes/agent-connection/daemon-agent-connection.ts` | client snapshot + event replay | cursor、attach、resync、commands | TUI/JSON/RPC 不直接依赖 worker 内存对象 |
| `KernelManager` | `core/kernel/index.ts` | Jupyter channels、process、comm、interrupt、snapshot | execute、host request、shutdown | 把模型生成 Python 与 TS policy bridge 起来 |
| `RlmSubagentRuntime` | `core/rlm-runtime.ts` + `agent-session.ts` | child admission、model resolution、registry、usage | `runRlmChild`、list/delete | 子代理是完整 retained session，不是普通 tool return |
| `HarnessState` | `prime-agent-runtime/src/rlm/harness.py:141-172` | local/global harness CRUD | upsert/list/get/delete/refinement events | “self-improving”的真实持久状态，不是第二执行引擎 |
| `RefinementProposal` | `core/refinement/refinement.ts:65-102` | LLM-proposed typed edits | create/update/delete、before/after、rollback | 将自修改限制在可审计的数据契约内 |
| autonomous controller | `agent-session.ts` + `core/autonomous.ts` | continuation、gate、budget、workspace change | max turns/tokens/time、gate retries | 防止“继续直到完成”退化成无限循环 |
| session lease/journal | `session-lease.ts`、`command-recovery-journal.ts` | 多进程互斥与 mutation idempotency | canonical path、clientId+commandId | 处理本地多进程下的重复写和 uncertain result |

#### 控制面 / 数据面

- **控制面**：CLI args、settings、resource loader、provider/model selection、daemon supervisor、worker catalog、session lease、protocol capability、autonomous budget/gates、scheduler metadata。
- **数据面**：provider stream、IPython code execution、shell/file/network side effect、JSONL append、kernel state snapshot、RLM child turn、A2A message、tool output。
- **隔离原则**：supervisor 不执行 provider、tool、kernel 或 transcript scan；每个 root worker 承担自身 tree 的数据面。catalog 扫描失败不应拖垮 active worker。

#### 关键执行链路

##### 1. 交互 prompt：client → resident worker → provider

```text
prime-agent CLI / TUI
  → ensure daemon + protocol/schema/build identity check
  → attach/create resident root worker
  → AgentSessionRuntime(createRuntime)
  → AgentSession.prompt(user message)
  → Pi Agent core streams provider response
  → default IPython tool call / extension tool call
  → append session JSONL + emit worker event
  → supervisor routes opaque event to attached client
```

入口组装见 `packages/coding-agent/src/main.ts:1243-1313,1577-1629`。重要性质：UI detach 不等于 runtime stop；session lease 防止同一 transcript 被两个进程同时写入。

##### 2. RLM child：IPython → host request → retained session

```text
model executes: handle = await rlm("inspect API", name="api")
  → Python `rlm` opens Jupyter comm `host.request`
  → KernelManager receives `rlm.run`
  → parent AgentSession checks depth/model/auth
  → creates child artifact dir and durable registry entry
  → admission returns RLMSpawnHandle immediately
  → detached child AgentSession runs independently
  → child sends explicit agent_message or writes file
  → parent attributes child usage to launching assistant turn
```

`docs/rlm-runtime.md:23-72,158-205` 与 TS ownership 对应。关键设计是**admission handle 绝不假装是 child answer**，避免同步等待把 parent turn 卡死。

##### 3. daemon crash/reconnect：generation + snapshot，而不是盲 replay

```text
client reconnects with {generation, sequence}
  → supervisor/worker classify replay interval
  → complete: replay missing events
  → partial/unavailable or generation changed: send coherent snapshot
  → client replaces local projection and resumes

worker crash
  → reap tracked subprocess group
  → append recovery marker
  → rebuild AgentSessionRuntime under same active-session ID
  → uncertain side effects are not replayed
```

设计依据见 `docs/daemon.md:97-143`。系统优先避免重复副作用，而不是承诺 exactly-once 外部执行。

##### 4. `/refine`：trajectory → typed edit → harness ledger

```text
manual refine / auto review checkpoint
  → gather trajectory + harness overview + refinement history
  → LLM emits strict RefinementProposal JSON
  → validate scope/kind/reference/arguments
  → apply smallest create/update/delete edits
  → atomically persist harness state + history
  → next turn reads supplemental harness state
  → rollback can restore before snapshots
```

`core/refinement/refinement.ts:123-173` 明确 base system prompt immutable；`harness.py:186-209` 在 host/kernel 并发修改时按 mtime reload，避免旧内存快照直接覆盖外部 edits。

##### 5. autonomous run：turn end → gate → bounded continuation

```text
assistant appears finished
  → check max turns / tokens / wall-clock / continuations
  → run completion gates
  → gate fails: bounded output fed back to agent
  → workspace unchanged after same failure: skip redundant rerun
  → continue or terminate with explicit reason
```

CLI 默认文档给出 12 turns、80k tokens、30 分钟、3 continuations 等默认上限（`command-registry.ts:223-232`）；具体运行应仍显式配置。

#### 状态模型

| 状态类型 | 位置 | 谁读写 | 生命周期 / 一致性规则 |
|----------|------|--------|------------------------|
| session transcript | `~/.prime/agent/sessions/*.jsonl` | `SessionManager` / worker | append-only tree；active leaf 决定当前 branch；full history 可恢复 |
| session artifacts | `session-artifacts/<id>/` | worker/kernel/scheduler/RLM | kernel snapshot、jobs、harness、children；按 feature 懒创建 |
| local harness | `<session-artifacts>/harness/harness_state.json` | TS refine + Python harness | 当前 session scope；mtime reload；refinement history/rollback |
| global harness | `~/.prime/agent/harness/` | explicit global refine/harness calls | 跨 session；blast radius 更大，应只存稳定经验 |
| daemon descriptors/journal | agent dir owner-only files | supervisor/workers | token、generation、active-session mapping、command result；可 compact |
| runtime memory | `AgentSession` / worker maps | single root worker | active model stream、clients、children、pending refine、budget、scheduler claims |
| kernel namespace | IPython process | model/Python runtime | session-persistent，可 snapshot；不是 durable truth 的唯一来源 |
| provider/auth external state | env/auth store/provider service | auth/model registry/providers | 凭据过期、rate limit、model removal 均可能让 child spawn fail closed |
| workspace/Git/external APIs | OS/files/network | model-generated code/tools | 非事务 side effect；journal 只记录命令结果语义，不能回滚外部世界 |

#### 契约边界

- **内部契约**：`AgentSession` ↔ Pi Agent core；`AgentSessionRuntime` ↔ cwd services；supervisor ↔ worker binary frame；worker ↔ client JSONL protocol；KernelManager ↔ Python `host.request`。
- **外部契约**：CLI flags/commands、SDK exports、JSON/RPC framing、ACP、provider APIs、extension lifecycle、skills/Python imports。
- **版本契约**：daemon protocol version 处理不兼容 wire change；schema revision/capability 处理兼容新增；app version/build identity 防止旧 daemon 静默复用。
- **Agent-facing 契约**：默认只暴露 IPython；`rlm()` 返回 admission handle；child answer 必须显式 message/file；refine 只能编辑 supplemental harness；goal complete 必须由 agent 显式声明。
- **信任边界**：同 OS 用户下进程协调 ≠ 安全隔离；skills、extensions、MCP、Python packages、model-generated code 均属于可信代码面。

#### 失败与降级模型

| 失败类型 | 检测方式 | 系统行为 | 降级 / 修复动作 |
|----------|----------|----------|------------------|
| daemon identity 不兼容 | protocol/schema/app/build check | 拒绝 attach，提示 shutdown/update | 先 checkpoint，再协调重启；旧 busy daemon 无 manifest 时保留 |
| worker crash | supervisor health/descriptor | 单 root tree 受影响；250ms/1s/5s 重试 | 同 active ID 恢复；三次失败标记 root failed |
| client backpressure | socket write/drain | 只停止该 attachment 增量事件 | cursor replay 或 fresh snapshot，不建立无界队列 |
| duplicate mutation | `clientId + commandId` journal | completed 返回旧结果 | received-but-no-result 标 uncertain，不自动 replay |
| concurrent session open | canonical path lease | 返回 `session_already_active` | attach existing owner，而不是双写 |
| kernel bootstrap stale/missing | import probe/bootstrap marker | 重建 managed environment | custom Python 缺 `rlm` 时明确失败 |
| RLM depth/model invalid | parent + host dual validation | spawn fail closed | 不静默替换模型；调整 depth 或选择可用模型 |
| child/parent teardown | AbortController/registry | cancel descendants、close runtime | completed daemon child 可 rehydrate；delete 写 tombstone |
| refine JSON invalid/truncated | schema/parser/output budget | 不应用 proposal | 缩小请求或重试；保留旧 harness |
| external side effect uncertain | command journal lacks durable result | 不重放 | 由用户/agent检查外部状态后决定修复 |
| long session state explosion | heap/entry count/attach timeout | 当前版本可能 OOM 或 worker unreachable | 固定版本、限制 child/turn、及时 compact/delete；等待对应修复 |

#### 可复刻设计不变量

1. **一个持久 session path 同时最多只有一个写 owner。**
2. **supervisor 只协调，不执行 provider/tool/kernel 数据面。**
3. **一个 root session tree 对应一个隔离 worker failure domain。**
4. **generation 变化后 sequence 不可直接比较；snapshot 是恢复基线。**
5. **mutating command 结果不确定时不自动重放外部副作用。**
6. **RLM admission 与 RLM completion 分离；handle 不是 answer。**
7. **Python shim 不拥有 provider credential 或 agent loop；policy 留在 TS host。**
8. **child usage 必须归因但不能污染 parent context-window measurement。**
9. **refine 不改 base system prompt，只改 typed supplemental state。**
10. **所有自治循环都必须同时有 turn、token、time 或 gate 等硬边界。**
11. **client backpressure 局部化，不能让一个慢 UI 堵塞所有 worker。**
12. **本地 IPC token/进程隔离不能冒充 hostile-code sandbox。**

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 模型默认工具面 | 单个持久 IPython + Python skills | 固定 JSON tool schema 的简单性 | 让模型程序化处理历史、并行子代理和数据 |
| 子代理返回 | admission handle + async message | 同步 `task()` 返回摘要的易用性 | 避免长 child 阻塞 parent，并支持 retained continuation |
| daemon topology | supervisor + catalog + per-root workers | 单进程实现简单性 | 隔离 crash、支持 detach、恢复和多 client |
| transcript | append-only JSONL tree | SQL query/projection便利 | 分支、可移植、人工可审计、兼容 Pi |
| recovery | snapshot + cursor + no uncertain replay | 伪 exactly-once | 外部 side effect 重复比漏自动恢复更危险 |
| refinement | typed CRUD ledger + rollback | 任意自改 prompt/source 的灵活性 | 收窄自修改 blast radius，保留审计线索 |
| global/local harness | 默认 local，显式 global | 自动跨会话学习 | 防止一次任务噪音污染所有未来 session |
| protocol evolution | protocol/schema/capability 三层 | 单一版本号简单性 | 支持兼容新增、客户端降级与明确 hard break |

### 值得学习的模式

- **host-owned policy，language shim 只做 ergonomics**：Python API 简洁，但 auth、usage、depth、lifecycle 留在 TypeScript。
- **replay + snapshot 双恢复通道**：小 gap 用 event，大 gap/换 generation 用 coherent snapshot。
- **mutation journal 的 uncertain 语义**：明确“不知道是否发生”，比错误地自动重试更可靠。
- **retained child registry**：child ID、session ID、active-session ID、tombstone 与 rehydrate 分离。
- **两阶段 self-modification**：plan 在后台，apply 在 quiescent turn boundary，并校验 branch version。
- **workspace-aware completion gates**：相同失败且 workspace 未变化时不重复烧 token/CPU。

### 反模式 / 踩坑点

- `AgentSession` 和 daemon 文件体量很大，功能集中导致认知和回归面持续上升。
- local JSONL + artifact + daemon descriptor + journal + kernel snapshot + harness 多份状态并存，必须持续维护 cross-store invariants。
- default telemetry enabled 不适合隐私敏感团队的“安装即安全”预期。
- 无默认 approval/sandbox 时，RLM 只会把单 agent 的 OS 风险放大成多个 agent 并发风险。
- 高频 release 与快速 protocol/schema 改动适合创新，不适合作为尚未锁版本的企业标准底座。
- 当前开放问题已经证明 usage attribution、compaction 和 long-running state 会出现自放大路径；不能只依据设计文档推断稳定。
- GitHub Actions pinning 不一致：主 CI 用浮动 major/tag，release 部分固定 SHA、部分仍浮动，供应链纪律不闭环。

### 可借鉴的具体技术点

1. `clientId + commandId` append-only mutation journal。
2. daemon `generation + sequence` cursor 与 capability negotiation。
3. 大 snapshot chunking + file-backed transcript cache，避免 supervisor 构造历史级对象。
4. per-session canonical-path lease 与 replacement 先 acquire 新 lease 再 release 旧 lease。
5. Jupyter control channel 回 host response，避免 shell-channel deadlock。
6. child usage durable attribution + context-tree own/aggregate reconciliation。
7. refine before/after snapshot、scope validation 和 rollback。
8. managed kernel bootstrap marker、bounded stderr tail、graceful shutdown + process-tree fallback。

---

## 架构解剖

### 目录结构

```text
packages/
  ai/                  多 provider/model substrate（主要继承 Pi）
  agent/               通用 agent core、message/tool/transport 状态机
  tui/                 terminal UI primitives
  coding-agent/
    src/core/           AgentSession、runtime、session、kernel、refine、goals
    src/modes/          interactive / daemon / rpc / acp / agent-connection
    src/cli/            参数、daemon 命令、session resolver、update
    skills/             Python/MCP/Prime integrations
    docs/               architecture、daemon、RLM、long-running contracts
    test/               unit/integration/process/kernel/daemon tests
prime-agent-runtime/
  src/rlm/              Python shim、harness、host_request、child types
.github/workflows/      CI、release、stale management
scripts/                release pack、installer check、browser smoke
install.sh              stable/beta channel installer
```

### 技术栈

- **运行时**：Node.js `>=22.8.0`；TypeScript ESM；Python 3.11 managed kernel。
- **模型层**：forked Pi AI substrate，多 provider streaming。
- **Agent/TUI**：forked Pi Agent core + TUI。
- **IPC**：Unix/local sockets JSONL、private binary worker frame、Jupyter ZeroMQ/HMAC。
- **状态**：append-only JSONL、JSON artifacts、journals、snapshots、lock files。
- **Schema**：TypeBox。
- **测试**：Vitest；process smoke、kernel 和 coding-agent 三 shards。
- **构建/发布**：npm workspaces、tsgo/Biome、R2 immutable artifacts/channel pointers、GitHub Release。

### 模块依赖关系

```text
coding-agent CLI/modes
  → AgentSessionRuntime / AgentSessionServices
  → AgentSession
  → @earendil-works/pi-agent-core
  → @earendil-works/pi-ai

AgentSession
  → SessionManager / compaction / goals / refine / scheduler
  → KernelManager → prime-agent-runtime Python
  → SubagentRuntimeHost → child AgentSessionRuntime

interactive / RPC / ACP
  → AgentConnection abstraction
  → in-process connection OR daemon connection
  → supervisor → worker
```

### 扩展机制

- TypeScript extensions：session/tool/model/input/UI lifecycle hooks。
- custom provider factory 与 provider registry。
- skills/resources：project、global、built-in sources。
- Python skills：通过 IPython import/call pattern 暴露。
- MCP integration：以 skill/extension 形式连接外部服务。
- ACP：标准能力走协议，Prime 特有 goal/refine/RLM/heartbeat 走 namespaced `_meta`。
- SDK：可自定义 tools、tool allowlist、session services、runtime factory。
- bash operations/spawn hook：可把命令改写到 SSH/container/sandbox backend。

---

## 质量与成熟度

### 代码质量

- **强项**：类型定义密集；protocol/schema/compatibility 有显式版本；注释解释 deadlock、replay、uncertain mutation 等真正分布式系统问题。
- **强项**：session lease、owner-only mode、atomic rename、bounded output、AbortSignal、process-tree cleanup 与 branch-version validation 显示出真实故障驱动的工程迭代。
- **弱项**：`agent-session.ts`、`daemon-mode.ts`、`daemon-supervisor.ts` 已成为高复杂度中心；大量状态字段和跨 store invariant 增加修改成本。
- **弱项**：静态 manifest 广泛使用 caret range；虽然 lockfile 固定安装，但发布包消费者仍受 semver range 与上游变化影响。
- **弱项**：缺少根级 `SECURITY.md` / CONTRIBUTING 文档，安全披露和外部贡献契约不够清楚。

### 测试

冻结源码含 415 个 `*.test.ts` / `*.spec.ts`，覆盖：

- AI provider adapters 与 stream normalization；
- agent core/tool state；
- TUI；
- coding-agent session、daemon、snapshot、RLM、refine、autonomous、ACP；
- process smoke 与 kernel tests；
- installer/browser smoke scripts。

CI 将 coding-agent 分成三 shard，并单独运行 process smoke 与 kernel job（`.github/workflows/ci.yml:46-116`）。这是强信号，但本报告没有执行它们，因此不能表述为本地通过。

测试盲区/待证：

- CI 只在 Ubuntu；Windows 问题与 platform-specific cleanup 未形成对等主矩阵。
- 官方 benchmark 与长时 soak 没有在当前审计环境复现。
- 当前开放 issues 表明大规模 child usage、长上下文、compaction retry debris 的状态组合仍可穿透现有测试。

### CI/CD

- Build/check job 执行 `npm ci`、build、Biome/tsgo/installer/browser check。
- Test matrix 覆盖 agent/ai/tui/coding-agent shards/process/kernel。
- Release 先 resolve context，再 pack immutable tarball/SHA256SUMS，最后由 publish job上传 R2、更新 stable/beta pointer、创建 GitHub Release。
- release checkout/setup-node 多处固定 commit SHA，且 `persist-credentials: false`，这是积极设计。
- 但普通 CI 仍是 `actions/checkout@v7`、`setup-node@v7.0.0`；release 的 upload/download-artifact 也存在浮动 tag，pinning 不一致。
- `.npmrc` 声明 `min-release-age=7`，降低新发布恶意包风险；其实际 enforcement 依赖 npm 版本，应在 CI 明确验证而不是只依赖注释。

### 文档质量

文档是项目强项：

- `architecture.md` 给出组件职责和运行边界；
- `daemon.md` 解释 topology、lease、replay、backpressure、idempotency 与 recovery；
- `rlm-runtime.md` 解释 Jupyter channel、host request deadlock、child lifecycle、usage attribution；
- `long-running-agents.md` 解释 goal/scheduler/heartbeat/autonomous；
- README 与官方博客对用户价值表达清晰。

主要缺口：安全威胁模型、企业 deployment hardening、权限/审批默认策略、breaking-change migration 尚未形成同等完整的单独文档。

### Issue / PR 健康度

GitHub API 快照：

- Issues：open 167、closed 16，open share 91.3%。仓库年轻，不能简单解释为维护停滞；但 bug intake 明显快于关闭。
- PR：open 249、merged 498、closed-unmerged 127；closed PR merge rate 79.7%，open share 28.5%。
- 观测日热点缺陷：
  - #1063：长 goal 约 1.5h 后 heap OOM；
  - #1054：child usage attribution 洪泛导致 worker freeze；
  - #900：compaction durable retry debris 自放大；
  - #1047-1052：Windows kernel/daemon/uv/shell 一组 parity 问题；
  - #1042：官方安装后 `npm update -g` registry 404；
  - #1029：模型重复输出缺乏 degeneration guard。
- 对应修复 PR 已快速出现，说明响应活跃；也说明 v0.7.1 的核心长时路径仍在实战硬化阶段。

---

## 社区与生态

### 社区评价

- **热度强**：创建约三个月达到 9.7k Stars、936 Forks，发布节奏密集。
- **产品发布驱动强**：从 v0.1.x 到 v0.7.1 快速推进，Prime 团队对 daemon/RLM/autonomous/refine 的开发投入明确。
- **贡献集中**：分叉后 Kevin Thomas 单 email 占 62.2%，前三 identity 占 80.9%；这是清晰架构主导力，也是 bus-factor 风险。
- **外部协作活跃但 backlog 高**：已有 498 merged PR，同时 249 open PR；项目需要更强 triage、release stabilization 与兼容治理。
- **公开第三方讨论样本不足**：不将零散外部评价作为核心结论；采用判断主要依据源码、GitHub issue/PR 与官方博客，并明确区分官方 benchmark 主张与独立验证。

### 衍生项目 / 插件生态

Prime Agent 继承 Pi 的 extension/custom-provider/skill 思路，并新增：

- Prime Intellect 产品 skill；
- websearch、MCP integrations、Python-backed skills；
- ACP client compatibility；
- sandbox extension example；
- SDK embedding examples。

当前更像“快速形成中的一方生态”，还不是 OpenCode/Claude Code 规模的独立插件市场。`@earendil-works/*` scope 说明它在技术上延续 Pi substrate，但生态兼容不应默认等同于 canonical Pi。

### 竞品对比

| 维度 | Prime Agent | Pi | OpenCode | Claude Code / Codex | OpenHands |
|------|-------------|----|----------|---------------------|-----------|
| 最强定位 | RLM + persistent multi-agent + continual harness | 极简可扩展 TS agent substrate | 多入口 durable runtime + MCP/plugin | 模型与原生 harness 深度协同 | 平台化自治软件工程环境 |
| 默认模型工具面 | persistent IPython | JSON schema tools/extensions | structured tools/MCP/plugin | 原生工具协议 | sandboxed action/tool runtime |
| 会话 | JSONL tree + daemon worker/artifacts | JSONL tree | durable event/projection/DB | 产品内部实现 | task/session/database/container |
| 子代理 | retained full sessions + A2A | subagent/orchestrator 能力 | task/subagent | 原生 harness 能力 | delegation/platform workers |
| 自修改 | typed harness CRUD + rollback | skills/extensions 主要人工管理 | config/plugin/tool 管理 | 闭源内部策略 | workflow/agent config |
| 默认安全 | OS user 权限，非 sandbox | permissions/container guidance 更成熟 | 需显式 permission/sandbox | 产品内置审批/沙箱差异化 | 容器/平台隔离更强 |
| 适合 | harness research、长时 agent、个人实验 | 二次开发底座、轻量终端 | 多入口日常主力与平台集成 | 追求最佳原生体验 | 团队任务平台/远程执行 |
| 当前主要风险 | v0.x 长任务稳定、默认权限、状态复杂度 | 功能较克制、上游演进 | backlog/复杂度 | 闭源/供应商锁定 | 部署重、平台成本 |

选型结论：

- **要最简洁、可二次开发 substrate**：优先 Pi。
- **要成熟多入口开源主力**：优先 OpenCode，再做权限隔离。
- **要研究 RLM、持久子代理、自修改 harness**：Prime Agent 信息密度最高。
- **要最强模型原生体验**：Claude Code/Codex 仍有训练与 harness 协同优势。
- **要多租户远程任务平台和默认环境隔离**：OpenHands 类平台更合适。

---

## 关键代码走读

### 1. `AgentSession`

- 路径：`packages/coding-agent/src/core/agent-session.ts`
- 职责：单 session 的 provider loop 周边治理、compaction、RLM、goal、autonomous、refine、scheduler、usage。
- 实现要点：
  - default active tool 是 IPython，并可通过 allowlist 抑制；
  - RLM parent registry、child runtime、usage attribution 都归 parent session；
  - auto-refine 使用 branch version、AbortController、pending plan 与 quiescent boundary；
  - 这是架构中心，也是最需要继续拆分的复杂度热点。

### 2. `AgentSessionRuntime`

- 路径：`packages/coding-agent/src/core/agent-session-runtime.ts:79-300`
- 职责：把 `AgentSession`、cwd services、lease 与 hosted children 包装成可重建 runtime。
- 实现要点：replacement 先申请目标 lease；teardown 完成后 apply 新 runtime；失败释放未提交 lease；dispose 可等待 kernel snapshot。

### 3. daemon supervisor / worker protocol

- 路径：`packages/coding-agent/src/modes/daemon/daemon-supervisor.ts`、`daemon-mode.ts`、`daemon-protocol.ts`
- 职责：session tree process ownership、client routing、journal、recovery、schema/capability。
- 实现要点：public JSONL + private framed transport；per-worker token/generation fencing；slow client 局部 backpressure；command result idempotency。

### 4. `KernelManager` 与 RLM bridge

- 路径：`packages/coding-agent/src/core/kernel/index.ts`、`core/tools/ipython.ts`、`core/rlm-runtime.ts`
- 职责：持久 IPython、Jupyter framing、comm dispatch、child admission。
- 实现要点：普通 execute 序列化；host request 通过 control channel 回复以避免 shell deadlock；child runtime 在 TS host 创建。

### 5. refinement + harness

- 路径：`packages/coding-agent/src/core/refinement/refinement.ts`、`prime-agent-runtime/src/rlm/harness.py`
- 职责：trajectory review、typed CRUD、local/global persistence、history/rollback。
- 实现要点：base prompt immutable；skill reference 必须是 Python import/callable；host/kernel 双 writer 用 mtime reload；坏 JSON/坏 proposal 不应用。

### 6. telemetry

- 路径：`packages/coding-agent/src/core/telemetry.ts:13-19,204-219,312-350`、`settings-manager.ts:832-836`
- 职责：installation ID、agent lifecycle/command/run aggregate analytics。
- 实现要点：默认 endpoint 为 Prime API；默认 enabled；ID 文件 `0600` 原子写；`DO_NOT_TRACK`、`PI_OFFLINE` 和显式 env/config 可关闭；捕获失败后 client self-disable。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 5.0 | coding、RLM、daemon、A2A、autonomous、refine、ACP 已形成完整系统 |
| 代码质量 | 4.1 | failure semantics 和协议治理强；核心 god files 与多状态源拖累可维护性 |
| 文档质量 | 4.7 | daemon/RLM/long-running 文档优秀；安全与企业 hardening 文档不足 |
| 社区活跃度 | 4.2 | 星标、release、merged PR 很强；issue/PR backlog 与集中度较高 |
| 架构设计 | 4.8 | worker failure domain、host bridge、journal/snapshot/refine contract 很有原创价值 |
| 产品成熟度 | 3.4 | v0.7.1；长任务与 Windows 核心问题仍密集出现 |
| 安全默认值 | 2.8 | 非 sandbox、无默认命令审批、telemetry 默认开、缺根安全政策 |
| 学习价值 | 5.0 | 当前开源 RLM/长时多代理 runtime 中信息密度极高 |
| 可借鉴度 | 4.8 | 协议、恢复、lease、retained child、typed self-modification 都可抽取复用 |

**综合评分：8.5 / 10。**

> 评分解释：这是“架构价值高、产品成熟度尚未追上复杂度”的项目。若只评学习价值接近 9.5/10；若评高权限生产采用，目前约 6.5/10。

---

## 总结

### 一句话评价

**Prime Agent 最有价值的不是把 Pi 换了品牌，而是把 Pi 的 agent substrate 推进成了“可常驻、可恢复、可递归、可继续通信、可修改自身 harness”的本地 Agent runtime；但这些能力也把状态复杂度和 OS 权限风险同时放大。**

### 谁应该用

- 研究 RLM、programmatic tool calling、persistent subagents 的 agent 工程师；
- 需要本地长时 session、detach/attach 和多 agent steering 的高级用户；
- 正在做 agent daemon、session recovery、command journal 的 runtime 团队；
- 想实验 continual harness、可回滚 memory/skill/subagent CRUD 的研究者；
- 能为 agent 提供容器/VM、最小权限和明确预算的人。

### 谁不应该直接用

- 需要默认命令审批、强 sandbox 或 hostile multi-tenant isolation 的企业；
- 想把“self-improving”理解为自动训练和保证单调提升的人；
- 不能接受 v0.x 高频 breaking changes、daemon/kernel 运维和 Python/Node 双 runtime 的团队；
- Windows-first 且要求当前版本稳定 parity 的用户；
- 持有生产云凭据、SSH key、钱包或敏感数据，却不准备做外部隔离的人。

### 下一步

1. 固定 `v0.7.1`/SHA，在无生产凭据的 disposable repo 做 one-shot coding smoke。
2. 显式关闭 telemetry，记录所有网络出站和本地状态目录。
3. 在容器/VM 中验证 IPython shell、interrupt、process-tree cleanup、daemon detach/attach。
4. 用 1 个 root + 2 个 retained children 做 1 小时 soak，观察 memory、usage attribution、compaction 和 recovery。
5. 手工触发 `/refine`，审查 before/after、local/global scope 和 rollback；不要先启用自动 global refinement。
6. 团队采用前补齐 permission broker、secret isolation、egress policy、artifact retention 与 version migration playbook。
