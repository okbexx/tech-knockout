# Orca

> 一句话定位：**以 daemon-owned PTY、Git worktree、多端 RPC 与结构化 dispatch provenance 为内核，把现有 Coding Agent CLI 组织成可并行、可远程、可恢复的本地 Agent Development Environment。**
> 分析日期：2026-07-21
> 项目地址：https://github.com/stablyai/orca
> 审查基线：`827cd49f410f042ae29ee886538d5aa8cf8c0c46`（`main`，2026-07-21）

---

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `stablyai/orca` |
| URL | https://github.com/stablyai/orca |
| 维护方 | Stably AI |
| 主语言 | TypeScript |
| 产品形态 | Electron desktop + headless Linux server + Web client + Expo mobile + Agent-facing CLI / Skills |
| 许可证 | MIT |
| GitHub 创建时间 | 2026-03-17 |
| 首个 Git 提交 | 2026-03-16 |
| 审查时热度 | 24,536 Stars / 1,776 Forks |
| 最新 Release | `v1.4.148`（2026-07-21） |
| Git 历史 | 6,962 commits / 236 个 author identities |
| GitHub contributors | 约 225（API 分页估算） |
| Issue / PR | 803 open issues / 1,044 open PRs / 1,225 closed issues / 6,556 closed PRs |
| 仓库规模 | 9,477 个 tracked files；约 111.5 万行非测试源码、98.6 万行测试代码（按路径/文件名分类） |
| 测试资产 | 3,707 个 test/spec 命名文件；Vitest + Playwright + Electron E2E + mobile tests + perf gates |
| 分析方式 | canonical source 静态审查 + 完整 Git 历史 + GitHub API + CI/Release 配置；未安装依赖、未构建或运行测试 |

> **口径说明**：GitHub 的 `open_issues_count=1847` 同时包含 issue 和 PR；上表通过 Search API 分拆。源码行数只统计常见源码扩展名，并以 `test/spec/__tests__/e2e` 路径或文件名区分测试，不能等同于覆盖率。

### 一句话定位

**Orca 不是新的 Coding Agent，也不是模型 API gateway；它是已有 CLI Agent 之上的本地执行与协作控制面。** Codex、Claude Code、Grok、Antigravity、OpenCode 等仍自行持有模型会话、工具循环和订阅凭证，Orca 持有的是 worktree、PTY、终端句柄、跨端状态、任务 DAG、dispatch 生命周期和 UI。

## 场景一：是否值得采用

### 解决的问题

1. **把并行 Agent 从“多开终端”升级为隔离工作单元**：每项工作可拥有独立 Git worktree、分支、终端、setup hook、PR/Issue 关联和生命周期。
2. **让 Agent CLI 跨设备持续存在**：PTY 由 runtime/daemon 持有，Electron renderer、Web、mobile、CLI 都只是客户端；UI reload 或客户端断线不应直接杀死任务。
3. **统一异构 Agent 的启动与权限参数**：`src/shared/tui-agent-config.ts` 集中定义 agent command、检测、prompt delivery、permission mode 和恢复行为。
4. **给 coordinator 一个机器可调用的控制面**：`orca ... --json` 提供 worktree、terminal、browser、automation 与 orchestration RPC，skills 引导 Codex/Claude 等正确调用。
5. **为多 Agent 协作补充结构化 provenance**：task、dispatch、worker pane、`worker_done`、heartbeat、escalation、decision gate 落入 SQLite，而不是只靠聊天文本和终端标题猜状态。
6. **覆盖本地、SSH、WSL、VPS 和移动接管**：desktop、headless `serve`、Web client 和 Expo mobile 复用 runtime RPC 与会话投影。

### 核心能力与边界

#### 能做什么

- 管理 repo、folder workspace、Git worktree、branch、PR/Issue/MR 关联和 workspace lineage。
- 启动任意可在终端运行的 Agent CLI；对 Codex、Claude、Grok、Antigravity、OpenCode、Gemini、Cursor 等提供已知配置。
- 后台创建 PTY，返回稳定 terminal handle，支持 `list/read/send/wait/split/close`。
- 从 Web/mobile 查看会话、继续输入、操作文件、Git、PR 和内置浏览器。
- 用 task DAG、dispatch context、typed message、heartbeat、gate 和 circuit breaker 监督多个 worker。
- 用 `orca.yaml` 描述 setup/archive hooks、default tabs、issue command 和 environment recipe。
- 将 repo 级 Agent skills 通过版本匹配的 CLI guide 暴露给 coordinator/worker。

#### 不能做什么

- **不替代 Agent 本身**：模型调用、上下文压缩、tool loop、代码编辑能力仍由 Codex/Claude/Grok 等 CLI 提供。
- **当前 coordinator 不会 AI 拆解任务**：`Coordinator.decompose()` 明确标注未实现；`orchestration run` 要求调用方先创建 task DAG。
- **不提供强 OS sandbox**：worktree 隔离是 Git/目录隔离，不是容器、Landlock、Seatbelt 或 seccomp；YOLO/bypass 模式仍可访问用户权限范围内的系统资源。
- **不是通用 Agent-to-Agent 标准协议实现**：其 orchestration 是 Orca 本地 SQLite + terminal injection + CLI message contract，不是 ACP/MCP 的直接替代。
- **mobile scope 不是只读角色**：允许 Git push/commit/discard、文件写入、terminal 和 PR merge 等高影响方法，安全依赖设备 token、E2EE、配对与部署边界。
- **不能保证任意 TUI 都有语义状态**：未知 CLI 可作为裸终端运行，但 `tui-idle`、permission mapping、session resume、structured prompt injection 需要专用 agent config/解析规则。

### 与竞品的边界

| 项目 | 核心所有权 | 强项 | 相对 Orca 的差异 |
|------|------------|------|-------------------|
| Agent Orchestrator | Agent adapter + session daemon | 对 Grok/Antigravity 等 adapter 深、CLI spawn/status/send 明确 | 更偏 worker harness；Orca 的 workspace/UI/mobile/runtime graph 更完整 |
| Herdr / workmux / Claude Squad | terminal/tmux + worktree | 轻量、terminal-first、易集成 | 缺少 Orca 的多端状态投影、typed orchestration 与完整 Git/product surface |
| Vibe Kanban / Emdash | task board + worktree + agent session | 任务可视化与队列 | Orca 更像 ADE 与 live terminal runtime，不只是任务面板 |
| AgentAPI | 单 Agent 的 HTTP wrapper | 将 CLI 会话标准化为 API | Orca 管 workspace、PTY、多端客户端与 DAG；AgentAPI 更适合作为 adapter 层 |
| Grok Build / Codex / Claude Code | Agent runtime / model loop | 真正执行推理、工具调用和代码修改 | Orca 位于其上层；两者不是替代关系 |
| open-design | domain substrate + daemon/runtime registry | Agent-native design artifact、preview/export | 二者都做多 runtime 产品化；Orca 专注 coding workspace/terminal ownership |

### 集成成本

- **个人本机试用**：低到中。安装桌面版、添加 repo、确认现有 Agent CLI 登录状态即可；模型费用继续走用户自己的订阅。
- **Agent 自动调用**：中。需要安装/加载 `orca-cli` 或 `orchestration` skill，启动 runtime，确认正确 executable（Linux 为 `orca-ide`，避免误调 GNOME screen reader），并固定 `--json` contract。
- **VPS / remote**：中到高。需要 headless runtime、WebSocket/反向代理/Tailscale、token/E2EE、持久目录、服务管理和升级策略。
- **团队生产采用**：高。需冻结版本、定义 manual/auto/YOLO 权限、限制 pairing、治理 mobile token、审计 setup hooks、隔离高权限仓库并处理高频 release。
- **深度 fork**：很高。仓库超过 200 万行源码+测试；desktop、daemon、mobile、Web、SSH/WSL、Git host integrations 与 29k 行 `OrcaRuntime` 形成宽耦合维护面。

### 依赖 / SDK 选型证据

> 全量直接依赖由 `tk catalog build` 从本地 manifest 写入 catalog；本表解释影响 build-vs-buy 的关键依赖。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| Electron 43 + `electron-vite` | Desktop runtime / build | 主进程、renderer、preload、打包 | 跨平台本地工作台、native PTY 与浏览器能力 | `package.json`、`src/main/window/createMainWindow.ts` | 需要桌面壳和 Node native capability 时可评估 | 包体、更新、签名、Chromium 攻击面重 |
| `node-pty` | Native runtime | 本地 Agent CLI PTY | 保留真实 TUI、交互审批和会话语义 | `package.json`、`src/main/daemon/terminal-host.ts` | 包装不可 headless 的 CLI 时价值高 | ABI、平台编译、backpressure、终端生命周期复杂 |
| xterm 6 beta family | Terminal UI | desktop/mobile terminal rendering | 浏览器/移动端复用终端语义 | root/mobile manifests | 多端 terminal 产品可复用 | beta 版本、Unicode/WebGL/resize 一致性测试面大 |
| Node `sqlite` `DatabaseSync` | Storage | orchestration 与其他 durable state | 无第三方 native addon 的同步 SQLite | `src/main/sqlite/sync-database.ts`、orchestration DB | Electron/Node 22+ 本地状态很合适 | 同步 API 不适合高吞吐多租户服务；schema ownership 集中 |
| `ws` + `tweetnacl` | Transport / crypto | runtime WebSocket、mobile E2EE | 多端控制与在 `ws://` 上保护 mobile payload | `runtime-rpc.ts`、`ws-transport.ts`、`e2ee-keypair.ts` | 本地/私网设备配对可借鉴 | 自定义 framing/nonce/token contract 要长期维护；不能替代 TLS/网络边界 |
| React 19 + Zustand 5 | UI/state | desktop/mobile client state | 多 pane、多 workspace、多客户端 UI 投影 | root/mobile manifests | 大型交互式本地 UI 可复用 | runtime 与 renderer graph 同步仍非常复杂，库本身不能解决 authority |
| Zod 4 | Schema | RPC、telemetry、config/CLI validation | 在边界处拒绝漂移和非法 payload | `package.json`、RPC/telemetry validators | Agent-facing JSON contract 应优先采用 | schema 数量大时需版本治理 |
| `ssh2` | Remote execution | SSH workspace、remote watcher/PTY | 将远程 repo/terminal 纳入同一 runtime | `package.json`、SSH E2E/workflows | 需要内建 SSH ownership 时可借鉴 | auth/MFA、host key、转发和 watcher 崩溃恢复成本高 |
| PostHog Node | Telemetry | 官方 stable/RC 匿名产品事件 | 产品使用反馈与 release 观测 | `src/main/telemetry/client.ts` | 有明确 consent/validation/burst cap 时可评估 | 官方 build 编译期启用；企业部署应明确 opt-out/egress policy |
| Vitest + Playwright | Test | unit/integration/Electron E2E/perf | 验证 runtime graph、PTY、跨端与发布包 | package scripts、`pr.yml`、`e2e.yml` | Electron 复杂状态产品的必要组合 | CI 成本高，仍不能证明用户环境中的每个 Agent CLI 兼容 |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | ✅ | MIT；适合商用和二次开发 |
| Bus factor | ⚠️ 中 | 约 225 contributors，但前四个 author identities 占约 79% commits；核心知识集中 |
| 供应商锁定 | 低 | Agent/provider BYOS，主数据本地；但 UI/runtime/CLI contract 深度依赖 Orca 自身 |
| 维护趋势 | 极度活跃 | 过去 7 天 36 个 release、398 commits；响应快但变更风险高 |
| 版本稳定性 | ⚠️ 中高风险 | stable/RC 高频滚动，skills 也强调必须读取当前 binary guide；团队必须 pin 版本 |
| 代码复杂度 | ❌ 高 | `orca-runtime.ts` 29,386 行，状态与 side effect ownership 过宽 |
| 默认执行权限 | ⚠️ 高影响 | 统一支持 manual/auto/YOLO；bypass 不是 OS sandbox，误配置会放大所有 Agent 权限 |
| 远程控制面 | ⚠️ 高影响 | mobile/Web 能写文件、操作 Git/PR/terminal；安全取决于 token、E2EE、配对和暴露面 |
| repo hooks | ⚠️ | `orca.yaml` 可运行 shell；CLI 默认需显式 `--setup run`，但 repo policy 可 run-by-default |
| 安全治理 | ⚠️ | 未发现 `SECURITY.md`；源码边界较认真，但缺少公开漏洞披露入口/历史说明 |
| 供应链 | ⚠️ 中 | pnpm lock + packageManager checksum；但 package 大多使用 ranges，GitHub Actions 使用 mutable version tags 而非 commit SHA |
| 可验证性 | ⚠️ | 本次未安装依赖或运行应用；运行性结论来自源码、测试资产与 CI 配置，不是本机 E2E |

### 安全边界细看

- `createMainWindow.ts` 对主窗口启用 `sandbox: true`、`contextIsolation: true`、`nodeIntegration: false`；guest webview 也强制 `nodeIntegration=false/contextIsolation=true/webSecurity=true`。
- runtime metadata、device token 和 keypair 通过 secure-file helper 以收紧权限写盘；WebSocket client 在首个 RPC request 校验 token。
- mobile transport 为 device-scoped token，并在明文 WebSocket payload 上增加 NaCl E2EE；设备可撤销。
- `MOBILE_RPC_METHOD_ALLOWLIST` 对方法做 scope gate，但允许 terminal、Git commit/push/discard、文件写入和 PR merge，属于高能力受信设备而非低权限客户端。
- worktree 路径经过 workspace-root containment；Git IPC 还有 authorized roots cache，创建 worktree 后显式 invalidation。
- setup/default-tab 命令来自 tracked `orca.yaml`，CLI 路径默认要求显式 setup 决策；一旦允许执行，本质仍是完整 shell。
- 权限参数能统一映射各 Agent 的 bypass 模式，例如 Codex `--dangerously-bypass-approvals-and-sandbox`、Claude `--dangerously-skip-permissions`、Grok/Antigravity/OpenCode 对应 YOLO 参数；这只是 UX policy，不是 capability isolation。

### 结论

**⚠️ 观望，但强烈推荐架构学习与隔离 PoC。**

- 个人开发者或小团队想管理多种 CLI Agent：值得试，前提是 pin 版本、默认 manual 权限、使用独立 worktree。
- 想让 Codex 监督 Claude/Grok/Antigravity：Orca 是目前少数真正提供 terminal handle、typed lifecycle、JSON CLI 和 skill contract 的完整方案。
- 高权限生产仓、团队远程接入、移动端 merge/push：先做网络、token、权限和审计硬化，不应直接采用默认全集。
- 想 fork 成自己的底座：优先抽取 protocol/adapter/PTY patterns，不建议直接继承整个 monorepo 与 `OrcaRuntime` 单体。

## 场景二：技术架构学习

### 核心架构图

```text
Codex / Claude / Grok / Antigravity / arbitrary CLI
                         │
                         │ shell + PTY + agent-specific launch config
                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  Terminal / Worktree Execution Plane                 │
│ node-pty │ SSH/WSL │ Git worktree │ setup/default tabs │ browser     │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ PTY events / stable handles / Git state
┌──────────────────────────────▼───────────────────────────────────────┐
│                         OrcaRuntime                                  │
│ authoritative window graph │ PTY index │ workspace/session state     │
│ Git/review/integration ops │ mobile projection │ waiters/coalescers  │
└───────────────┬───────────────────────────────┬──────────────────────┘
                │                               │
       local Unix socket / named pipe     WebSocket + token/E2EE
                │                               │
┌───────────────▼───────────────────────────────▼──────────────────────┐
│                        Runtime RPC Layer                             │
│ method registry │ Zod validation │ source scope │ event subscriptions│
└───────┬──────────────────────┬──────────────────────┬────────────────┘
        │                      │                      │
 Electron renderer        `orca` CLI            Web / Expo mobile

┌──────────────────────────────────────────────────────────────────────┐
│                    Orchestration Sidecar                             │
│ SQLite WAL: messages │ tasks DAG │ dispatch_contexts │ decision_gates│
│ Coordinator: promote → dispatch → monitor → retry/gate → converge   │
└──────────────────────────────────────────────────────────────────────┘
```

### 底层技术架构

#### 最小架构内核

脱掉桌面 UI、mobile、GitHub/Linear/Jira integrations 后，Orca 最小闭环是：

**`AgentCatalog + WorktreeManager + PTYHost + RuntimeRPC + DurableOrchestrationDb + Agent-facing Skill Contract`**。

其中真正不可替代的是 PTY ownership 与 runtime authority；如果 PTY 仍属于 renderer/tmux 临时窗口，多端接管、稳定 handle、structured wait 和 crash recovery 都会退化。

#### 核心抽象

| 抽象 | 源码位置 | 职责 | 关键字段 / 方法 | 为什么重要 |
|------|----------|------|-----------------|------------|
| `OrcaRuntime` | `src/main/runtime/orca-runtime.ts` | 全局 runtime composition root 与 live state owner | `tabs`、`leaves`、`ptysById`、handles、waiters、worktree/repo ops | 所有 client 共享的权威执行状态 |
| `DaemonServer` | `src/main/daemon/daemon-server.ts` | 本地 socket server、client lifecycle、PTY routing | auth/connection、spawn/input/resize/kill | 让 PTY 脱离 renderer 存活 |
| `TerminalHost` | `src/main/daemon/terminal-host.ts` | `node-pty` 进程、ring buffer、ACK/backpressure、resize | spawn、attach、write、kill | TUI fidelity 与持续会话的数据面 |
| Runtime RPC | `runtime-rpc.ts` + `runtime/rpc/*` | 方法注册、scope、validation、WS/local transport | `RpcSourceScope`、method registry、event fan-out | desktop/CLI/mobile/Web 的统一控制面 |
| Agent catalog | `src/shared/tui-agent-config.ts` | agent command、availability、permission/resume/prompt behavior | `TUI_AGENTS`、`getTuiAgentConfig()` | 将异构 CLI 差异表驱动化 |
| Worktree creation | `OrcaRuntime.createManagedWorktree()` | base/ref 选择、冲突处理、path containment、hooks、startup agent | base resolution、suffix retry、`ensurePathWithinWorkspace` | 并行执行的文件隔离与 lineage |
| `OrchestrationDb` | `runtime/orchestration/db.ts` | durable task/message/dispatch/gate/run state | WAL、schema v6、transactional migration | 把协调状态从 terminal 文本中分离 |
| `Coordinator` | `runtime/orchestration/coordinator.ts` | DAG promotion、slot dispatch、heartbeat、retry、gate、convergence | `tick()`、`dispatchReadyTasks()`、circuit breaker | supervised execution，不承担模型推理 |
| Dispatch preamble | `runtime/orchestration/preamble.ts` | 将 lifecycle contract 注入 worker | task/dispatch IDs、heartbeat、ask、worker_done | Agent-facing protocol 的实际实现 |
| Secure file / device registry | `src/shared/secure-file.ts`、`runtime/device-registry.ts` | token/key 权限、device scope、revocation | atomic secure writes、device token | 多端控制面的本地 trust root |

#### 控制面 / 数据面

- **控制面**：repo/worktree 配置、agent catalog、permission mode、RPC method registry、task DAG、dispatch/gate、device pairing、skills、automation schedule。
- **数据面**：PTY byte stream、terminal input/resize、Git/file side effect、shell hooks、browser actions、Agent CLI 自身的模型/tool execution。
- **交汇点**：`OrcaRuntime` 将 runtime graph 映射到 stable terminal handle，并把 RPC 请求落到 PTY/Git/worktree side effects；这也是它过度膨胀的根源。

#### 关键执行链路

##### Agent-first worktree 创建

```text
orca worktree create --agent <agent> --prompt ... --json
  ↓
CLI 读取 secure runtime metadata / token
  ↓
Runtime RPC → createManagedWorktree()
  ↓
解析 repo/base/branch → 防冲突 suffix → path containment
  ↓
git worktree add + metadata/lineage 持久化
  ↓
按 setupDecision 解析 orca.yaml hooks/defaultTabs
  ↓
Runtime 预分配 PTY → agent-specific launch command
  ↓
返回 worktree id + startupTerminal.handle
```

##### CLI terminal 控制

```text
orca terminal send/read/wait --json
  ↓
local socket / WS RPC + token
  ↓
resolve stable handle → leaf/pane/pty generation
  ↓
TerminalHost write / ring-buffer read / waiter registration
  ↓
结构化 result 或 stale/dead/unwritable error
```

##### Supervised orchestration

```text
task-create(spec, deps)
  ↓
SQLite task pending → promoteReadyTasks()
  ↓
Coordinator 计算并发 slot + 可用 terminal
  ↓
创建 dispatch_context(taskId, dispatchId, assignee pane)
  ↓
注入 preamble + TASK 到已识别 Agent CLI
  ↓
worker heartbeat / ask / escalation / worker_done
  ↓
reconcileLifecycleMessage() 校验 taskId + dispatchId + sender pane
  ↓
completed / retry / circuit_broken / decision_gate
  ↓
依赖 task promotion → convergence
```

#### 状态模型

| 状态类型 | 位置 | 谁读写 | 生命周期 / 一致性规则 |
|----------|------|--------|------------------------|
| Repo/worktree/settings/session | persistence store | main runtime + renderer/RPC methods | durable；worktree create/archive 后刷新多个 cache/projection |
| PTY process/buffer | daemon `TerminalHost` | runtime/daemon | 进程级 live state；可 detach/reattach；ACK/backpressure 控制流量 |
| Window graph | `OrcaRuntime.tabs/leaves` | authoritative renderer → runtime | 单 authoritative window；reload 时暂存 live PTY，使用 generation 防 stale handle |
| Mobile/Web projection | runtime mobile snapshots | runtime → paired clients | epoch/version 单调；graph-only change 也必须 bump version，否则客户端丢弃 |
| Orchestration | SQLite WAL | CLI/RPC/Coordinator/worker | task/dispatch/gate 独立状态机；transactional migration；runtime-global |
| Agent session | 外部 Agent CLI 自有目录/进程 | Codex/Claude/Grok 等 | Orca 不解析为统一 model transcript；主要通过 terminal state 和 hook/config 推断 |
| Git state | repo/worktree/remote | Git + runtime | 外部事实；dispatch 前可探测 base drift，超过 20 commits 默认拒绝 |

#### 契约边界

- **内部契约**：runtime method registry、Zod schema、terminal handle/PTY generation、workspace/session projections、SQLite tables。
- **外部 CLI 契约**：`orca ... --json`；Linux packaged command 为 `orca-ide`，managed session 可用 `ORCA_CLI_COMMAND`。
- **Agent catalog 契约**：command、permission argument、prompt delivery、resume behavior、process detection。
- **Agent-facing skill 契约**：skill stub 不复制易漂移帮助，而是要求 `orca skills get orca-cli` 从当前 binary 获取 version-matched guide。
- **Orchestration 契约**：preamble 明确 coordinator handle、task ID、dispatch ID、heartbeat cadence、ask/reply 和 exactly-once `worker_done`。
- **安全契约**：source scope + method allowlist + token/E2EE + filesystem authorized roots；没有单一机制可以独立承担全部边界。

#### 失败与降级模型

| 失败类型 | 检测方式 | 系统行为 | 降级 / 修复动作 |
|----------|----------|----------|------------------|
| renderer reload / graph重建 | graph status + leaf/PTY generation | 暂存 live PTY，拒绝 stale handle，重发 snapshot | 新 graph 重新绑定 PTY；CLI 重新 resolve handle |
| worker 无 heartbeat | 10 分钟 threshold | 只警告，不自动 fail | 人工检查 terminal；避免误杀慢 worker |
| task escalation/失败 | typed message + dispatch context | failure count 增加，task 回 pending | 3 次后 circuit break 并标 failed |
| stale worktree | dispatch 前 probe | behind >20 commits 默认跳过 dispatch | rebase/recreate，或 task spec 显式 `allow-stale-base: true` |
| setup hook 未授权 | setup decision/policy | CLI 默认跳过并返回 warning | 用户显式 `--setup run` 或调整 repo policy |
| terminal dead/stale | handle generation/connection flags | RPC 返回 stale/dead/unwritable | list/show 重新获取 handle，必要时重建 PTY |
| mobile token/E2EE 失败 | token、device record、nonce/decrypt | 关闭/拒绝 socket 或 RPC | revoke/re-pair device；检查时间和 endpoint |
| coordinator 无任务 | `decompose()` 查询 DB | `orchestration run` 失败 | 先 `task-create` 构建 DAG |
| release/build 中断 | CI draft/tag state | release workflow 处理 orphan tag/draft recovery | 重新切 release 或恢复 draft |

#### 可复刻设计不变量

1. **PTY owner 必须独立于 UI 生命周期**：renderer 是 client，不是 terminal process owner。
2. **终端地址不是纯字符串**：handle 必须绑定 PTY generation/稳定 pane identity，stale handle 要 fail fast。
3. **客户端投影必须显式版本化**：即使 durable snapshot 未变，只要 graph projection 变了也要 bump version。
4. **任务与派发分离**：重试会生成新的 dispatch，生命周期消息必须同时绑定 `taskId + dispatchId`。
5. **worker completion 需要来源权威**：`worker_done` 还要匹配 assignee pane，不能接受任意终端伪造完成。
6. **handoff 与 supervised orchestration 不能混用**：前者转移所有权，后者保留 coordinator 监控义务。
7. **版本匹配的 Agent guide 优于仓库内静态 CLI 文档**：高速演进项目尤其如此。
8. **setup hook trust 必须是显式决策**：tracked config 只是来源，不是执行授权。

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 复用现有 Agent CLI | PTY/TUI wrapper + agent catalog | 统一 transcript/tool schema | 保留用户订阅、原生 UX 和快速新增 Agent |
| runtime authority | daemon/main 持有状态 | renderer 内简单实现 | 支持 reload、Web/mobile、headless 与后台任务 |
| orchestration transport | terminal injection + local SQLite CLI | 标准 A2A/ACP session protocol | 可立即覆盖所有支持 shell 的 Agent CLI |
| durable state | SQLite WAL + 同步 API | event-sourced distributed system | 本地单机控制面简单、事务明确 |
| worker liveness | heartbeat 超时只告警 | 自动回收 hung worker | 慢但正确的 coding task 比误杀成本更高 |
| security | token/E2EE/scope/allowlist/secure file 组合 | 细粒度 RBAC/OS sandbox | 面向单用户本地 ADE，而非多租户执行平台 |
| feature delivery | 高频 stable/RC release | 长期稳定 API | 快速修复真实跨平台/PTY edge cases |
| composition root | 巨型 `OrcaRuntime` | 模块化 ownership | 集中协调跨域 invariant，但形成明显 God Object |

### 值得学习的模式

1. **daemon-owned PTY + multi-client projection**：比 tmux wrapper 更适合 desktop/Web/mobile 共同接管。
2. **stable pane identity + PTY generation**：解决 renderer reload、pane breakout、session restart 后的 stale address。
3. **Agent catalog 的 capability/config table**：把 command、prompt delivery、permissions、resume 变成数据，不在业务流程堆 Agent 名称分支。
4. **lifecycle provenance**：`taskId + dispatchId + sender pane` 是比“终端标题/聊天声称完成”可靠得多的完成证据。
5. **版本匹配 skills**：binary serve guide，skill 只负责 discovery，避免高速 release 使 Agent 照旧文档执行破坏性命令。
6. **handoff/orchestration 语义分层**：避免 coordinator 明明已交权还持续偷看、轮询或错误承担修改责任。
7. **graph-only version bump**：多客户端实时 UI 的典型一致性陷阱，源码注释给出了具体事故模型。
8. **dispatch stale-base guard**：在 worker 开始前检查基础分支漂移，比任务结束后处理大冲突成本更低。
9. **CLI hook 显式 opt-in**：无 renderer trust prompt 时不偷偷运行 tracked setup command。
10. **真实兼容矩阵 CI**：编译 Git 2.25.5、测试 Windows update survival、SSH watcher crash、terminal scale perf，而不是只有 unit mocks。

### 反模式 / 踩坑点

1. **`OrcaRuntime` 巨型单体**：29,386 行、约 1.1MB；同时持有 runtime graph、PTY、mobile、Git、worktree、browser、integrations、automation、waiter/coalescer。它把很多 invariant 集中，也把修改爆炸半径集中。
2. **测试镜像单体**：`orca-runtime.test.ts` 33,451 行；大文件测试虽覆盖广，但定位、ownership 和并行修改冲突会恶化。
3. **Coordinator phase 命名超前于能力**：状态含 `decomposing/merging`，但 decomposition 未实现，merging 也不是自动变更合并器；产品文案容易被误读。
4. **自定义 orchestration protocol**：实用但 Orca-specific；外部工具必须调用 Orca CLI，无法直接复用标准 Agent session protocol。
5. **权限统一成 YOLO 不等于隔离**：只是向各 CLI 传 bypass flag；没有统一 capability sandbox、文件 allowlist 或网络 policy。
6. **mobile allowlist 过宽**：scope 命名容易给人“已最小权限”错觉，实际能执行高影响 Git/文件/terminal 操作。
7. **release velocity 过高**：一天多个 RC/stable，团队难以完成每版回归；skills 已被迫通过 binary guide 抵抗 drift。
8. **公开 backlog 极大**：1,044 open PRs 与 803 open issues 会增加 triage、重复修复和长期维护噪音。
9. **缺少公开 SECURITY policy**：与高权限 remote execution 面不匹配。
10. **Actions 使用 mutable version tags**：供应链可复现性弱于 commit SHA pinning。

### 可借鉴的具体技术点

- `src/main/sqlite/sync-database.ts`：用 Node `DatabaseSync` 包一层旧式 adapter，替换第三方 native SQLite addon。
- `src/main/runtime/orchestration/lifecycle-reconciliation.ts`：将 completion/heartbeat authority 独立为可测试规则。
- `src/main/runtime/orchestration/preamble.ts`：把 exactly-once completion、heartbeat cadence、ask/reply 与 stop-after-done 放在命令示例旁，适合 LLM reader。
- `src/shared/tui-agent-config.ts`：Agent CLI catalog 的数据驱动设计。
- `src/shared/secure-file.ts`：跨平台原子写入、权限收紧和 secret file helper。
- `syncWindowGraph()`：处理 renderer reload、PTY remint、duplicate identity 和 projection version 的完整案例。
- `createManagedWorktree()`：base/ref、branch collision、path containment、setup/startup sequence 的生产级 worktree flow。
- E2E workflow：单次构建后 10-way shard，失败保留 trace；scheduled terminal pressure gate 和真实 SSH watcher crash isolation。

## 架构解剖

### 目录结构

```text
orca/
├── src/
│   ├── main/
│   │   ├── runtime/             # OrcaRuntime、RPC、orchestration、mobile/Web projection
│   │   ├── daemon/              # local socket server、PTY host、daemon client
│   │   ├── pty/                 # PTY controller、remote/WSL/SSH execution
│   │   ├── git/                 # worktree、status、diff、auth/path boundary
│   │   ├── integrations/        # GitHub/GitLab/Linear/Jira/... provider surface
│   │   ├── telemetry/           # consent、schema、burst cap、PostHog transport
│   │   └── window/              # Electron BrowserWindow/webview security
│   ├── renderer/                # React desktop UI、workspace/terminal/browser/editor
│   ├── cli/                     # `orca`/`orca-ide` command parser 与 RPC client
│   ├── preload/                 # sandboxed renderer bridge
│   └── shared/                  # types、agent catalog、launch/permission policy、schemas
├── mobile/                      # Expo/React Native mobile client + terminal WebView engine
├── native/                      # macOS/Windows helper、host bridge、native utilities
├── skills/
│   ├── orca-cli/                # discovery stub → version-matched binary guide
│   └── orchestration/           # coordinator/worker lifecycle contract
├── tests/e2e/                   # Electron Playwright E2E 与 fixtures
├── scripts/                     # build/release/test/preflight/packaging helpers
├── .github/workflows/           # PR、E2E、mobile、release、perf、update survival
└── package.json                 # Electron monorepo scripts/direct deps
```

### 技术栈

- **运行时 / 框架**：Node 22+、Electron 43、React 19、Zustand、Expo 55 / React Native 0.83。
- **PTY / Terminal**：`node-pty`、xterm 6 beta、SSH2、WSL/native helpers。
- **状态 / Schema**：Node SQLite、JSON settings/session store、Zod。
- **构建 / 打包**：pnpm 10.24、electron-vite、electron-builder、esbuild、native code signing/notarization。
- **测试**：Vitest、Playwright Electron E2E、mock Agent CLIs、mobile Vitest、scheduled terminal perf。
- **CI/CD**：GitHub Actions；PR verify/build/smoke、10 shard E2E、mobile、Windows update/crash survival、macOS/Windows/Linux release。

### 模块依赖关系

```text
Agent config / shared schemas
        ↓
CLI parser ───────→ Runtime RPC registry ←────── Electron/Web/mobile clients
                         ↓
                     OrcaRuntime
        ┌────────────────┼─────────────────────┐
        ↓                ↓                     ↓
  Daemon/PTY host   Git/worktree layer   Integrations/browser/files
        ↓                                      ↓
 external CLI processes                   external systems

Orchestration CLI/RPC
        ↓
OrchestrationDb ←→ Coordinator
        ↓              ↓
 durable lifecycle   Terminal prompt injection
```

### 扩展机制

- **添加 CLI Agent**：在 `tui-agent-config.ts` 增加 command、检测、permissions、prompt/resume config；未知 Agent 仍可走 generic shell。
- **项目自动化**：`orca.yaml` setup/archive/default tabs/recipes；本地 settings 可覆盖 hook source policy。
- **Agent skills**：repo 自带 `orca-cli` 与 `orchestration` skill，也能把 version-matched guide 输出给 Agent。
- **Host integrations**：GitHub、GitLab、Bitbucket、Azure DevOps、Gitea、Linear、Jira 等 provider modules。
- **Runtime methods**：方法注册表 + source scope + Zod schema；新增方法必须同步 CLI/mobile/Web contract。
- **多端事件**：subscription + versioned snapshot，而非每个 client 独立扫描底层状态。

## 质量与成熟度

### 代码质量

**优点**

- TypeScript strictness、Zod boundary 和大量类型化状态机使危险字符串状态较少。
- 源码注释大量解释“Why”和历史 race/reload/invariant，说明很多 edge case 来自真实事故修复。
- 安全边界不是单点：sandboxed renderer、token、E2EE、scope、path authorization、hook decision 均有独立层。
- CI 覆盖真实 Git 兼容版本、Windows update、SSH watcher crash、terminal throughput 和 release artifact smoke。
- SQLite migration 在 transaction 中执行，WAL/NORMAL/busy timeout 明确。

**问题**

- 多个文件通过 `eslint-disable max-lines` 正当化聚合；`OrcaRuntime` 和对应 test 已明显超过可维护上限。
- 运行时状态同时存在 store、renderer graph、PTY host、mobile snapshot、terminal handles 与外部 Git，理解一致性需要跨大量局部 invariant。
- 注释密度很高但 architecture overview 相对不足；代码解释了局部事故，缺少一份稳定的全局 ownership map。
- repo 快速膨胀，四个月已 9,477 files，重构速度可能追不上功能并发扩张。

### 测试

- 静态检出 3,707 个 test/spec 命名文件；约 98.6 万行测试代码。
- root `pnpm test` 使用 Vitest，并按 6 个 shard 运行；另有 serial Windows path、smoke、CLI pack、packaged app smoke。
- Playwright Electron E2E 分 10 shard，共用一次 build artifact，失败上传 trace。
- scheduled E2E 验证 SSH Docker watcher SIGSEGV 后 PTY/explorer 存活。
- terminal perf 每日运行，可配置 visible/hidden/cross-workspace pane pressure。
- mobile 单独安装、typecheck、test、lint、format，并引用 desktop shared fixture 做 conformance。
- PR CI 编译 Git 2.25.5 执行旧版兼容矩阵。
- **本次未执行测试**：source cache 无 `node_modules`，主机无 pnpm；遵循静态审查约束，没有安装依赖。报告不将“有测试”写成“本地已验证通过”。

### CI/CD

- PR workflow：install、typecheck、lint、format、test、build、macOS entitlement、license、telemetry constants、旧 Git 兼容、CLI/artifact smoke。
- E2E：scheduled + reusable workflow；Linux Xvfb；10-way shard。
- 发布：CI 计算 version、切 tag、处理 orphan tag/draft、跨平台 build/sign/notarize、发布 Homebrew/update metadata。
- 过去 7 天 36 个 release，说明 release automation 非常强，也说明消费者必须 pin 与回归。
- GitHub Actions 主要使用 `actions/*@v6/v7/v8` 等 mutable major tags；对高权限 release workflow，建议改为 commit SHA + version comment。

### 文档质量

- README 产品入口清晰，覆盖 Agent、desktop/mobile/VPS、BYOS、worktree 与 CLI。
- `skills/orca-cli` 有意只保留 discovery stub，真实 guide 由 binary 提供，避免版本漂移；这是文档治理优点。
- `skills/orchestration` 对 ownership、handoff、wait、heartbeat、decision gate 写得非常具体。
- headless Linux、mobile、terminal architecture、release/update 等专项文档丰富。
- 不足是架构全景分散；orchestration marketing 容易让读者忽略 decomposition 未实现。
- 未发现公开 `SECURITY.md`。

### Issue / PR 健康度

- 关闭量大：6,556 closed PRs、1,225 closed issues，维护者确实高速合并和修复。
- backlog 也大：1,044 open PRs、803 open issues，triage 压力显著。
- 近期真实问题集中在：headless/Web remote PTY ownership、reverse proxy convergence、terminal close lifecycle、automation blank terminal、SSH 外部路径等。
- 这些问题与源码复杂度一致：Orca 最难的是 ownership/recovery，不是画 UI。
- 样本中 issue #9747 在约 10 分钟内关闭，显示响应速度极快；但不能用单个样本代表总体 SLA。
- 当前历史只有约四个月，无法判断长期 breaking-change、LTS 和 security response 质量。

## 社区与生态

### 社区评价

从 GitHub 行为看，Orca 的增长和反馈密度都很高：约四个月达到 24.5k Stars、近 7k commits、近万号 issue/PR。大量用户提交 Agent 检测、SSH/MFA、i18n、remote/headless、per-worktree service 等需求，说明它已经进入真实工作流，而不只是 screenshot demo。

同时，超高 issue/PR 编号、每日多 release 与 1k+ open PR 也说明项目处于高速“边飞边修”阶段。社区活跃度应评为五星，稳定性不能因此直接评为五星。

### 衍生项目 / 插件生态

- Agent 生态主要通过“任意终端 CLI + known agent catalog”接入，不要求每个 Agent 写完整 plugin SDK。
- 项目 integrations 已覆盖多个 Git host、tracker、browser/automation、SSH/WSL 和 mobile。
- 自带 skills 是 Agent 生态的重要入口，但 orchestration protocol 当前仍是 Orca-specific。
- 未看到成熟、版本化的第三方 plugin ABI；扩展大多仍需改 monorepo 或通过 CLI/shell/config 组合。

### 竞品对比

- **要最完整的 desktop/mobile/VPS 异构 CLI Agent 工作台**：Orca 当前领先。
- **要最轻量 terminal multiplexer**：Herdr/workmux/Claude Squad 更简单。
- **要单 Agent API adapter**：AgentAPI 更聚焦。
- **要真正的 Agent runtime/loop**：Codex、Claude、Grok Build、OpenCode 属于下层，不应与 Orca二选一。
- **要标准化 client↔agent session**：ACP 方案更可移植；Orca 当前优势是兼容既有 TUI，而非协议标准性。
- **要团队任务 board 而不需要完整 IDE**：Vibe Kanban/Emdash 可能成本更低。

## 关键代码走读

### 1. `OrcaRuntime`

- 路径：`src/main/runtime/orca-runtime.ts`
- 规模：29,386 行、约 1.1MB。
- 职责：runtime composition root；持有 window graph、PTY indexes、stable handles、waiters、worktree/repo/Git/browser/mobile/integration state。
- 实现要点：
  - `syncWindowGraph()` 只接受 authoritative window；
  - renderer reload 时保留 live PTY；
  - 以 `ptyGeneration` 和 stable pane identity 拒绝 stale alias；
  - graph-only change 也为 mobile snapshot bump version；
  - CLI 创建 terminal 后 renderer 可后续 adopt。
- 评价：源码价值最高，也是最大技术债；应按 PTY registry、workspace service、mobile projection、Git/review、browser/integration 拆 ownership。

### 2. `createManagedWorktree()`

- 路径：`src/main/runtime/orca-runtime.ts:16533` 起。
- 职责：创建本地/remote/folder workspace，处理 base、branch、path、lineage、hooks、startup agent。
- 实现要点：
  - 明确失败而不是伪造 `origin/main`；
  - branch/path conflict 最多 suffix retry；
  - `ensurePathWithinWorkspace()` 防越界；
  - CLI 无 renderer trust prompt，因此 setup 默认需要显式决策；
  - Agent-first 路径由 runtime 直接 spawn PTY，UI 后续 adopt，避免依赖 `TerminalPane` mount。
- 评价：是 worktree automation 的高价值参考，但函数体和依赖面过宽。

### 3. `TerminalHost`

- 路径：`src/main/daemon/terminal-host.ts`
- 职责：真正持有 `node-pty`、session buffer、attach/detach、resize/input/kill。
- 实现要点：
  - ring buffer 保存近期输出供重连；
  - ACK/backpressure 防慢客户端拖垮 PTY；
  - session metadata 与 process lifecycle 分离；
  - daemon server 将多 client 请求路由到同一 host。
- 评价：它使 Orca 成为持续 runtime，而不只是 Electron terminal UI。

### 4. `OrchestrationDb`

- 路径：`src/main/runtime/orchestration/db.ts`
- 职责：messages、tasks、dispatch contexts、decision gates、coordinator runs。
- 实现要点：
  - SQLite WAL + `synchronous=NORMAL` + 5s busy timeout；
  - schema v6，migration 全事务；
  - task 与 dispatch 分离，允许 retry 产生新 dispatch；
  - sender/assignee pane key 保存 remint-stable authority；
  - lifecycle rejection 写入 payload marker，便于审计。
- 评价：状态模型小而清晰，是比 GUI 层更值得抽取的核心。

### 5. `Coordinator`

- 路径：`src/main/runtime/orchestration/coordinator.ts`
- 职责：poll loop、task promotion、并发 dispatch、message/gate/escalation、convergence。
- 实现要点：
  - 默认最多 4 个并发 worker；
  - heartbeat 5 分钟、10 分钟 stale warning，只告警不误杀；
  - dispatch 前检查 base drift，超过 20 commits 默认不派发；
  - escalation 失败累计 3 次 circuit break；
  - decision gate 永不自动解决；
  - `decompose()` 明确尚未实现。
- 评价：是可靠 execution supervisor，不是 autonomous planner；产品定位必须说清。

### 6. Dispatch preamble 与 lifecycle reconciliation

- 路径：`runtime/orchestration/preamble.ts`、`lifecycle-reconciliation.ts`
- 职责：把 coordinator protocol 注入 worker，并验证完成/心跳来源。
- 实现要点：
  - `worker_done` exactly once；
  - payload 同时带 taskId/dispatchId；
  - worker 完成后停止，不继续 poll 或做新工作；
  - 禁止 worker 使用 coordinator 看不到的本地 AskUserQuestion；
  - late completion 不能完成新的 retry dispatch。
- 评价：这是可迁移到 Hermes/其他 Agent board 的直接设计资产。

### 7. Agent catalog 与 permission mapping

- 路径：`src/shared/tui-agent-config.ts`、`tui-agent-launch-command.ts`、`tui-agent-permissions.ts`
- 职责：异构 CLI 的启动、prompt/resume、检测与权限参数。
- 实现要点：
  - known agents 数据驱动；
  - prompt delivery 可走 argv、startup input 或 post-ready send；
  - permission mode 映射到各家 CLI 原生 flags；
  - generic shell 保留“任何 CLI 都能跑”的兜底。
- 评价：扩展性好，但 semantic support 取决于每个 adapter 的持续测试；不能把 generic terminal 等同于一等 Agent integration。

### 8. Runtime RPC 与 mobile security

- 路径：`runtime-rpc.ts`、`rpc/ws-transport.ts`、`rpc/mobile-socket-wiring.ts`、`device-registry.ts`。
- 职责：本地/WS client auth、method scope、事件、pairing、E2EE。
- 实现要点：
  - request 前 token gate；
  - direct client 与 device-scoped mobile token 分开；
  - mobile payload E2EE，device 可撤销；
  - method allowlist 防调用未暴露 RPC。
- 评价：单用户产品的边界较完整，但 mobile 权限面宽，不可误当成 RBAC。

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 5.0 | desktop/mobile/Web/VPS/worktree/PTY/Git/integrations/orchestration 非常完整 |
| 代码质量 | 3.5 | 类型、测试、invariant 很强；God Object 与超大文件显著扣分 |
| 文档质量 | 4.5 | 使用/skills/专项文档强，版本匹配 guide 出色；全局架构和能力边界仍可加强 |
| 社区活跃度 | 5.0 | commit/release/issue/PR 极高，但 backlog 同样巨大 |
| 架构设计 | 4.5 | daemon-owned PTY、multi-client projection、dispatch provenance 很强；模块 ownership 不够收敛 |
| 安全成熟度 | 3.5 | Electron/E2EE/token/path/hook 边界认真；无 OS sandbox、mobile 权限宽、缺 SECURITY.md |
| 稳定性 | 3.0 | CI 很强，但项目仅四个月、release 过密、remote/PTY edge cases 仍频繁 |
| 学习价值 | 5.0 | 本地 Agent control plane、PTY lifetime、worktree、multi-client、orchestration 的一线样本 |
| 可借鉴度 | 4.5 | 多个核心 pattern 可直接复用；不建议整仓照搬 |

## 总结

### 一句话评价

**Orca 把“多开几个 Agent TUI”做成了真正的本地控制面：它最强的不是桌面 UI，而是 daemon-owned PTY、稳定 terminal identity、worktree 生命周期、多端状态投影和可验证 dispatch provenance；它当前最大的短板则是 runtime 单体化、安全权限面过宽，以及 coordinator 尚不具备自动任务分解。**

### 谁应该用

- 同时使用 Codex、Claude Code、Grok、Antigravity、OpenCode 等多个 CLI Agent 的个人开发者。
- 需要独立 worktree、后台终端和移动接管的高并行开发者。
- 正在设计本地 Agent IDE、terminal control plane、remote session runtime 或多 Agent coordinator 的团队。
- 想研究“如何不改 Agent 内核，仍给任意 TUI 加结构化协作”的架构人员。

### 谁不应该直接用

- 需要多租户 RBAC、容器/OS sandbox、集中审计和合规控制的企业执行平台。
- 不能接受每日多次版本变化、需要长期稳定 API/LTS 的团队。
- 只需要两个 tmux pane 的轻量用户；Herdr/workmux/Claude Squad 可能更省成本。
- 想获得一个自动拆任务、自动合并、完全自主的 planner；当前 Orca coordinator 不是这个产品。
- 准备直接 fork 整仓做二次平台，但没有 Electron、PTY、Git、移动端和跨平台 release 维护能力的团队。

### 下一步

1. **PoC 固定版本**：锁定 `v1.4.148`，不要跟随 `latest` 自动升级。
2. **默认 manual 权限**：先禁用 YOLO/bypass；为每个 Agent 单独核对 permission mapping。
3. **用低风险 repo 验证四条链路**：worktree create、terminal reload/reconnect、supervised task lifecycle、Web/mobile remote access。
4. **专门做故障演练**：renderer reload、daemon restart、PTY exit、stale handle、worker 不发 heartbeat、reverse proxy reconnect。
5. **远程部署收口**：loopback/Tailscale/reverse proxy、TLS、device revocation、token rotation、egress/telemetry policy。
6. **抽取而非 fork**：若自研，优先复用 Agent catalog、stable handle、dispatch provenance、version-matched skill guide；composition root 从一开始就拆成独立服务。
7. **动态验证缺口**：本次未安装 `grok`、`claude`、`agy`，因此应在 PoC 里分别验证启动参数、prompt delivery、权限提示、session resume、cancel、exit code 和 stale handle recovery。
