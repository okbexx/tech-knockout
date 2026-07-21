# Coding Agent Control Planes 横评

> 更新日期：2026-07-21
> 涉及项目：Orca、Agent Orchestrator、Herdr、workmux、AgentAPI、Vibe Kanban
> 分类口径：比较的是“如何从一个控制面启动、隔离、观察和协调已有 Coding Agent CLI”，不是比较模型质量，也不是比较 Codex、Claude Code、Grok Build 自身的 agent loop。

---

## 场景一：采用选型横评

### 对比矩阵

| 维度 | Orca | Agent Orchestrator | Herdr | workmux | AgentAPI | Vibe Kanban |
|------|------|--------------------|-------|---------|----------|-------------|
| 产品形态 | Electron ADE + daemon + Web/mobile + JSON CLI | Desktop/daemon + agent adapters + session CLI | Rust terminal multiplexer + local socket | tmux + Git worktree manager | 单 Agent CLI 的 HTTP session facade | Web task board + worker/worktree backend |
| 核心 owner | PTY、worktree、runtime graph、多端 projection、orchestration DB | Agent session/process 与 adapter lifecycle | Terminal panes/process | tmux session/worktree | 被包装 Agent process/session | Task/queue/workspace lifecycle |
| 异构 CLI | 已知 Agent catalog + 任意 shell fallback | 多个专用 adapter，Grok/Antigravity 等适配较深 | 任意终端 CLI | 自定义 command | 每种 Agent 需 adapter | 多种 worker backend |
| 稳定控制 API | `orca ... --json` + local/WS RPC | `ao spawn/status/send` 等 | local socket CLI | CLI/tmux surface | HTTP/JSON/SSE | Web/API/worker control |
| Git worktree | 原生、lineage/base/hook/startup 一体 | 支持 workspace/session isolation | 需自行组合 | 核心能力 | 非核心 | 原生任务 workspace |
| PTY/TUI fidelity | 强，daemon-owned `node-pty` | 强，专用 harness/adapter | 强，terminal-first | 强，tmux 原生 | 取决于 adapter；更偏标准 API | 取决于 worker backend |
| 结构化 orchestration | task DAG、dispatch、heartbeat、gate、circuit breaker | spawn/session/event 较强 | 无内建 DAG | 无内建 DAG | 无多 worker DAG | task/queue 强，Agent 间 lifecycle 较弱 |
| 完成 provenance | `taskId + dispatchId + sender pane` | adapter/session event | 终端状态/约定 | tmux/process 状态 | API event/Agent result | task/worker 状态 |
| Web / mobile / remote | desktop、Web、Expo mobile、VPS/SSH/WSL | desktop/daemon | 终端远程取决于宿主 | SSH/tmux 取决于宿主 | HTTP 可远程部署 | Web 管理面 |
| 安全模型 | token/E2EE/scope/path + Agent permission flags；无统一 OS sandbox | adapter permission/process policy | 继承 shell/tmux 权限 | 继承 shell/tmux 权限 | API auth + worker 本身权限 | 服务认证 + worker 权限 |
| 运行复杂度 | 高 | 中高 | 低 | 低 | 中 | 中高 |
| 最适合 | 完整个人/小团队 Agent ADE | 研究/部署深 adapter harness | 轻量 terminal fleet | worktree + tmux 并行 | 把单个 CLI 标准化为服务 | 任务面板驱动开发 |
| 主要风险 | 版本过快、God Object、远程高权限面 | 安装/产品迁移、adapter 长期维护 | 缺少 durable DAG/worktree policy | 无语义化 worker lifecycle | 丢失部分 TUI 原生语义 | board 与 Agent 内部状态可能割裂 |

### 分项详评

#### Orca

- **最强点**：把 daemon-owned PTY、worktree、stable handle、multi-client projection 和 structured dispatch 放到同一运行时。
- **边界**：它不执行模型推理；current coordinator 也不会自动分解任务，调用方必须先建 task DAG。
- **采用建议**：个人/小团队固定版本后做隔离 PoC；远程接入、高权限仓和 mobile merge/push 先做安全硬化。
- **详细报告**：[Orca](../reports/orca.md)。

#### Agent Orchestrator

- **最强点**：adapter 深度。当前源码能看到 Grok 与 Antigravity 的专用 command、session restore、hook/activity 适配，而非单纯 `spawn("agy")`。
- **边界**：当前产品从旧 npm CLI 向 desktop/daemon 迁移，安装与公开文档口径需要按当前源码确认。
- **采用建议**：如果核心目标是学习“每个 Coding Agent CLI 怎样做专用 adapter”，它比通用 tmux wrapper 更有参考价值。

#### Herdr

- **最强点**：Rust 单工具、terminal-first、local socket，Agent skill 可创建 sibling pane、读取/等待输出和发送输入。
- **边界**：worktree、task DAG、completion authority、merge policy 要由上层补齐。
- **采用建议**：只想让 Codex 控制几个真实 TUI，而不想引入完整桌面平台时优先试。

#### workmux

- **最强点**：把 tmux 与 Git worktree 的高频操作打磨为一套开发者 UX。
- **边界**：它管理进程与目录，不理解 `worker_done`、decision gate 或 Agent session schema。
- **采用建议**：适合“并行工作空间”，不应误当“多 Agent orchestration protocol”。

#### AgentAPI

- **最强点**：将单个 Agent CLI 封装为稳定 HTTP/JSON/event surface，适合作为自研 router 的 worker adapter。
- **边界**：不是 workspace fleet manager；多 worker DAG、worktree、merge 与移动端均需上层实现。
- **采用建议**：需要 machine-to-agent API、又不需要完整 ADE 时，比解析 PTY 屏幕更干净。

#### Vibe Kanban

- **最强点**：以任务、queue、worker 和 workspace 为中心，适合团队可视化调度。
- **边界**：board state 不天然等于 Agent 的真实 turn/tool/terminal state；仍需可靠 adapter 与 completion contract。
- **采用建议**：产品目标是团队 task cockpit 时优先；目标是持续 TUI 与多端接管时看 Orca。

### 场景一结论

- **要完整 desktop/mobile/VPS 异构 CLI Agent ADE** → **Orca**。
- **要专用 CLI adapter 参考，尤其 Grok/Antigravity** → **Agent Orchestrator**。
- **要最轻的 terminal multiplexer** → **Herdr**。
- **要 Git worktree + tmux 的成熟 UX** → **workmux**。
- **要把一个 CLI Agent 变成 HTTP worker** → **AgentAPI**。
- **要团队任务 board/queue** → **Vibe Kanban**。

没有单一项目同时在标准协议、TUI fidelity、worktree、DAG、多端 UI、OS sandbox 和团队 RBAC 上全部领先。正确做法是先确定谁拥有 **Agent session、PTY、workspace、task state、merge authority**，再选工具，而不是按 Star 排名。

---

## 场景二：技术架构学习横评

### 五层控制面模型

```text
┌──────────────────────────────────────────────────────────┐
│ 5. Product Surface                                        │
│ Desktop / Web / Mobile / Kanban / Notifications           │
├──────────────────────────────────────────────────────────┤
│ 4. Orchestration                                          │
│ task DAG / dispatch / heartbeat / gate / retry / merge     │
├──────────────────────────────────────────────────────────┤
│ 3. Workspace Isolation                                    │
│ git worktree / branch / setup hooks / service allocation   │
├──────────────────────────────────────────────────────────┤
│ 2. Session / Process Facade                               │
│ HTTP / RPC / PTY handle / event stream / resume / cancel   │
├──────────────────────────────────────────────────────────┤
│ 1. Agent Adapter                                          │
│ command / prompt delivery / permissions / status / restore │
└──────────────────────────────────────────────────────────┘
                 Codex / Claude / Grok / agy / ...
```

- **AgentAPI** 主要覆盖 1–2 层。
- **Herdr** 主要覆盖 1–2 层的 terminal 版本。
- **workmux** 覆盖 2–3 层。
- **Vibe Kanban** 强在 3–5 层，但依赖下层 worker adapter。
- **Agent Orchestrator** 强在 1–2 层并向 4 层扩展。
- **Orca** 是六者里覆盖 1–5 层最完整的，但也因此复杂度最高。

### 协议边界

| 协议 / Surface | 解决的问题 | 不解决的问题 |
|----------------|------------|--------------|
| MCP | Agent 调用工具/资源 | 不定义任意 Coding Agent CLI 的 session、PTY、resume 和 task ownership |
| ACP | Client 驱动标准 Agent session | 不自动提供 Git worktree fleet、task DAG、mobile UI 或 merge policy |
| HTTP wrapper | 将特定 Agent 暴露成 API | 不保证保留完整 TUI/审批/插件体验 |
| PTY wrapper | 最大程度保留原生 CLI 行为 | 语义状态需要 adapter、hook 或屏幕启发式补充 |
| Orca orchestration CLI | 在本地 runtime 内提供 task/dispatch/message contract | Orca-specific，不是跨产品通用 A2A 标准 |

**MCP 不是通用 Agent-to-Agent 会话协议。** 如果 coordinator 通过 MCP 调一个 router tool，MCP 只覆盖 coordinator→router 的工具调用；router 到 Codex/Claude/Grok/Antigravity 仍需 ACP、HTTP adapter、structured subprocess 或 PTY。

### 最值得学习的模式

1. **Orca：stable terminal handle 不直接等于 PID/PTY ID**
   - 用 pane identity + PTY generation 处理 UI reload、session remint 与 stale address。

2. **Orca：task 与 dispatch 分离**
   - retry 产生新 dispatch，late `worker_done` 不能完成当前 retry。

3. **Orca：version-matched binary guide**
   - Skill 只负责 discovery，真实 CLI guide 由当前 binary 输出，适合高速演进工具。

4. **Agent Orchestrator：专用 adapter 优于统一 shell flag**
   - command、restore、hook、activity、permission 各自适配，才能把“能启动”升级成“一等支持”。

5. **Herdr：terminal-first control socket**
   - 在不重写 Agent 的前提下，为 coordinator 提供 pane create/read/send/wait 最小面。

6. **AgentAPI：structured facade**
   - 对已经支持 headless/event 的 Agent，优先使用结构化 API，而不是反解析 ANSI/TUI。

7. **workmux：workspace isolation 先于并发**
   - 并行 Agent 不应默认修改同一工作目录；worktree 是文件冲突边界，不是安全 sandbox。

8. **Vibe Kanban：task state 与 worker state 分层**
   - Board 负责业务任务，adapter 负责真实 session；两者需要显式 reconciliation。

### 反模式

- 把“能在 pane 里运行”写成“原生支持该 Agent”。
- 用 terminal title 或最后一行输出判断任务完成。
- retry 时复用旧 task completion token/terminal handle。
- 同时让多个 Agent 修改同一 checkout，再指望最终 diff 自动收敛。
- 把 YOLO flag 当作 sandbox。
- 把 mobile/Web 方法 allowlist 当作细粒度 RBAC。
- 用 MCP 替代 session/process/workspace ownership 设计。
- 在没有 cancellation、timeout、heartbeat 和 stale-handle 语义时做长任务自动化。

### 推荐架构

如果从零实现一个由 Codex 协调 Grok/Claude/Antigravity 的最小控制面，建议按以下顺序：

```text
1. 每 worker 独立 git worktree
2. AgentAdapter interface
   - buildCommand
   - deliverPrompt
   - detectReady / detectDone
   - resume / cancel
   - permission profile
3. PTY/process owner 独立于 UI/client
4. Stable session handle + generation
5. Structured event/result envelope
6. taskId + dispatchId completion authority
7. heartbeat / timeout / cancellation / circuit breaker
8. localhost-only router API，之后再加 Web/mobile
9. 最终由 coordinator 审查 diff、运行测试、决定 merge
```

优先级应是：**structured subprocess / ACP / HTTP adapter > 专用 PTY adapter > 通用 PTY fallback**。只有 Antigravity 等缺少稳定 headless contract 的 CLI 才应长期依赖 PTY；一旦上游提供 JSON/ACP，应迁移到结构化 adapter。

---

## 最终推荐

### 如果要采用

- **Orca**：功能面最完整，但先 pin、manual permission、低风险 repo、loopback/private network。
- **Agent Orchestrator**：适合做 adapter PoC 或从源码抽 Grok/Antigravity 支持。
- **Herdr/workmux**：适合个人 terminal workflow，代价远低于完整 ADE。
- **AgentAPI**：适合自研 control plane 的 worker facade。
- **Vibe Kanban**：适合团队任务视角，不应单独承担 Agent session correctness。

### 如果要学架构

- 学 PTY ownership、multi-client projection、dispatch provenance → **Orca**。
- 学异构 Agent adapter → **Agent Orchestrator**。
- 学最小 terminal control socket → **Herdr**。
- 学 worktree/tmux UX → **workmux**。
- 学 CLI→HTTP 标准化 → **AgentAPI**。
- 学 task board 与 worker routing → **Vibe Kanban**。

### 综合结论

**Orca 是当前最完整的异构 Coding Agent 本地控制面，但不是最小、最标准或最安全的默认答案。** 它证明了“保留现有 CLI Agent，同时补 worktree、PTY、RPC、mobile 和 orchestration”这条路线可行；真正值得复刻的是 ownership 与 lifecycle contract，而不是把所有能力继续堆进一个巨型 runtime class。
