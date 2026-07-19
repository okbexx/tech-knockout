# Coding Agents 横评

> 更新日期：2026-07-19（新增 Grok Build；OpenCode / Pi / jcode 沿用各自最近一次核验数据）
> 涉及项目：OpenCode、Pi（原 pi-mono）、jcode、Grok Build
> 参考竞品：Claude Code、Codex CLI、Cline、Aider、Continue、OpenHands、Gemini CLI

---

## 场景一：采用选型横评

### 对比矩阵

| 维度 | OpenCode | Pi | jcode | Grok Build |
|------|----------|----|-------|------------|
| 功能覆盖度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 集成成本 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| 社区健康 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| 文档质量 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 维护持续性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐（公开镜像待观察） |
| 运行时架构成熟度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 扩展与二次开发 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 许可证 | MIT | MIT | MIT | Apache-2.0 |
| **综合推荐度** | ✅ 推荐个人/高级开发者；团队隔离 PoC | ✅ 推荐个人主力试用 / 内部 SDK 底座 | ✅ 推荐个人隔离试用；团队生产化观望 | ⚠️ 源码学习强烈推荐；个人隔离试用；团队押注暂缓 |

### 基础画像

| 项目 | 仓库 | Stars（观测日） | Forks | 语言 | 最新版本 / Release | 核心定位 |
|------|------|----------------|-------|------|---------------------|----------|
| OpenCode | `anomalyco/opencode` | 174,169 | 21,032 | TypeScript | v1.17.6 | 开源 Coding Agent runtime，多入口、多模型、MCP/插件 |
| Pi | `earendil-works/pi` | 68,192（2026-07-07） | 8,371 | TypeScript | v0.80.3 | Terminal agent harness：coding agent CLI + runtime core + unified AI substrate |
| jcode | `1jehuang/jcode` | 7,055（2026-06-15） | 790 | Rust | v0.28.0 | Rust terminal Coding Agent runtime：TUI + server-owned live session + Swarm + Graph Memory |
| Grok Build | `xai-org/grok-build` | 19,581（2026-07-19） | 3,512 | Rust | 源码 `0.2.105`；无 GitHub release/tag | ACP + actor + 持久 session + 多代理的完整 Coding Agent harness |

> 注：**Pi** 是当前 canonical 名称；**pi-mono** 是历史名称。本文后文统一写 **Pi**。

### 分项详评

#### 功能覆盖度

- **OpenCode** 覆盖最广：CLI/TUI/Desktop/Web/HTTP/SDK/GitHub Action/Slack，多模型、多工具、MCP、插件、自定义工具都在同一个 runtime 体系内。
- **Pi** 覆盖也很强，而且比旧判断更“底座化”：Coding Agent CLI、独立 runtime core、统一 AI substrate、TUI、Extension 系统、Session 树、30+ provider 适配、experimental orchestrator，已经不只是“工具箱”。
- **jcode** 已从“Rust TUI 工具”升级为完整 terminal agent runtime：流式 turn 状态机、server-owned live session、Swarm、Graph Memory、MCP、skills、provider/OAuth、本地/云 provider、desktop/mobile crates 和多平台 release 都已进入主线。
- **Grok Build** 的产品面最完整：Ratatui TUI、headless/structured output、ACP stdio、leader/relay、dashboard、三模型协议、MCP、skills/plugins/hooks、subagents/worktrees、memory、sandbox 和 rewind 都在同一 runtime 中。

#### 集成成本

- **Pi**：终端安装仍然很轻，`npm install -g @earendil-works/pi-coding-agent` 即可；但 Node floor 已提高到 `>=22.19.0`，比旧版更挑环境。
- **OpenCode**：终端用户安装路径清晰；源码级二次开发需要 Bun monorepo、Effect、session/event/projection 心智，学习成本中高。团队应先隔离 PoC。
- **jcode**：release binary/Homebrew/AUR 分发降低终端用户成本；源码级二次开发成本仍高，69 个 workspace members、约 54.5 万行 Rust、Swarm/Memory/provider/session/compaction 心智都需要消化。
- **Grok Build**：官方脚本和独立 release index 降低终端安装门槛，但源码是 79-member、约 138.6 万行 Rust 的 monorepo；公开 README 缺少 source build/test 手册，fork 成本为四者最高。

#### 社区健康

- **OpenCode**：热度最高，最近 push/release 都很新；但 6,033 open issues + 1,031 open PRs，典型“高热度、高活跃、高 backlog”。
- **Pi**：品牌与分发面明显产品化（`earendil-works/pi`、`pi.dev`、统一 npm scope），但新贡献者 gate 仍很重；社区参与更像 product-led repo，而不是开放共建型基础设施。
- **jcode**：star/fork 增长很快，v0.28.0 仍在高频 release；但本地 `git shortlog` 显示 4,620 commits 高度集中在作者多个 Git identity 上，bus factor 仍是核心风险。
- **Grok Build**：约五天获得 19.5k Stars，但 Issues/PR 关闭、贡献指南明确不接收外部贡献，公开历史只有 4 个 sync-bot commit。热度极高，社区协作度却是四者最低。

#### 文档质量

- **Pi**：当前是三者里“产品入口文档 + 包级文档 + 工程合同”最完整的一档。README 直接覆盖 permissions/containerization、supply-chain hardening、网站和 docs 入口。
- **OpenCode**：README/AGENTS/CONTEXT 对用户和 agent 友好，但 runtime 深层理解仍需读源码，尤其要分清 V1/V2 session 演进边界。
- **jcode**：README 已覆盖 provider/MCP/memory/swarm/安装，`SERVER_ARCHITECTURE.md`、`MEMORY_ARCHITECTURE.md`、`SWARM_ARCHITECTURE.md`、`SAFETY_SYSTEM.md` 等文档质量不错；不足是实现演进快，稳定扩展 API 和迁移指南还不如前两者成熟。
- **Grok Build**：24 篇用户指南对 session、permissions、sandbox、MCP、skills、hooks、plugins、subagents、memory、telemetry 的说明很细；不足是根 README 太薄，缺少外部 source build/test、release provenance 和迁移政策。

#### 维护持续性

- **OpenCode**：极高活跃，但 backlog 和复杂产品线意味着维护压力巨大。
- **Pi**：维护节奏稳定，release 到 v0.80.3；风险主要来自核心维护者集中、社区 gate 偏重，以及 session persistence / orchestrator 仍在继续演化。
- **jcode**：迭代速度很快，2026-06-15 已到 v0.28.0；release/CI/多平台 artifact 信号强，但单点维护风险和版本稳定性仍需观察。
- **Grok Build**：内部产品代码显然长期迭代，但公开仓仅是 2026-07-16 起的单向同步镜像。当前不能用内部代码成熟度替代公开同步、发布和安全修复持续性的证据。

### 场景一结论

- **想要当下可用的开源 coding agent 主力工具** → 优先试 **OpenCode**，但在关键仓库中先加隔离和权限边界。
- **想要可二次开发的 TypeScript agent substrate / SDK 底座** → 选 **Pi**。
- **想要 Rust terminal-first、高性能本地 runtime、Swarm/Memory 深度能力** → **jcode 值得个人隔离试用**；团队生产化前仍需安全隔离、版本冻结和维护风险评估。
- **想拆解最完整的生产级 Coding Agent runtime** → 读 **Grok Build**；个人使用先在 sandbox/低权限测试仓隔离试用，团队长期押注等待公开同步与 release provenance。
- **只需要 IDE 内 agent 体验** → 看 Cline / Continue。
- **只需要成熟 Git patch flow** → 看 Aider。
- **想要平台级自治软件工程环境** → 看 OpenHands。

---

## 场景二：技术架构学习横评

### 对比矩阵

| 维度 | OpenCode | Pi | jcode | Grok Build |
|------|----------|----|-------|------------|
| 设计模式深度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 代码质量 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 可借鉴度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 创新性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Runtime 可复用性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **综合学习价值** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### 架构模式对比

| 问题 | OpenCode 的方案 | Pi 的方案 | jcode 的方案 | Grok Build 的方案 |
|------|-----------------|-----------|--------------|-------------------|
| Agent 执行内核 | Durable Session + Event/Projection + single-turn runner + tool settlement | Agent core + transport/state abstraction + steering/follow-up queues + session tree | Provider stream reducer + `run_turn_streaming_mpsc` + tool settlement | ACP → MvpAgent → AcpSession actor → ChatState/Sampler actor → ToolBridge |
| 输入生命周期 | `session_input` inbox，`admitted_seq` / `promoted_seq`，`steer` / `queue` | follow-up / steering queue + lifecycle hooks | user prompt、background wake、swarm DM、reload recovery 统一进入 live turn | prompt queue + interjection + goal rounds + TodoGate + cancel/permission outcome |
| 状态持久化 | SQLite/Drizzle tables + synchronized events + projector | jsonl session log + compaction + branch summary（已显露继续演化信号） | Session JSON/journal + provider_session_id + compaction + replay/memory injection | ACP `updates.jsonl` + raw history + plan/signals + rewind snapshots + compaction checkpoints |
| 工具执行 | tool-call durable 记录后 settlement，失败显式收敛 | TypeBox tools + Extension events + before/after interception | Registry + ToolContext + session policy + persisted ToolResult | prepare/permission/hooks → `FuturesUnordered` 并发 → path lock → result 回灌 |
| 扩展机制 | Plugin tools + MCP + filesystem custom tools + HTTP/SDK | TypeScript Extension + lifecycle interception + custom UI + provider registration | MCP + skills + provider profile + crate/internal tool registry | MCP + skills + plugins + hooks + ACP extension methods |
| 多模型支持 | provider/model catalog + route resolver | side-effect-free AI core + compat shim + lazy provider modules | provider trait + 独立 provider crates + OpenAI-compatible profile | Chat Completions / Responses / Anthropic Messages 三后端 Sampler |
| Memory | session context epoch / projection-first history | 无本地 RAG，靠 session/compaction | Graph Memory + embedding seeds + BFS cascade retrieval + listwise rerank | Markdown archive + SQLite/FTS/vector + embedding/MMR/query expansion/dream |
| 多 Agent | task/subagent/tooling 路径，runtime 化能力强 | subagent + experimental orchestrator | Server-owned Swarm：members/channels/event history/live wake | blocking/background subagent + session fork + worktree + leader |
| UI 架构 | CLI/TUI/Desktop/Web/HTTP 多入口读取 projection | CLI/TUI/RPC 外壳读取共享 runtime substrate | Ratatui TUI + server/gateway/debug clients + desktop/mobile crates | Ratatui TUI、headless、ACP stdio、serve/dashboard 共用 session runtime |

### 设计决策对比

- **OpenCode 倾向 runtime 事务化。** 它的核心不是 UI，而是 durable session、event log、projection、tool settlement、location ownership。这是最适合研究“coding agent 怎么从 prompt loop 变成可靠 runtime”的项目。
- **Pi 倾向 harness / substrate 化。** 它表面上是 CLI，真正资产在 provider substrate、agent runtime、extension lifecycle、session persistence 与 release discipline，是“怎么把 agent 从产品壳拆成可复用平台层”的好样本。
- **jcode 倾向本地系统 runtime 化。** 它用 Rust/Tokio/Ratatui，把 terminal agent 做成 server-owned live session：turn reducer、tool settlement、Swarm、Graph Memory、compaction/reload recovery 都是核心，不只是性能优化。
- **Grok Build 倾向协议化 agent OS。** ACP 是入口契约，actor 是所有权边界，persistent session 是恢复边界，permission/sandbox/worktree 是副作用边界；它最适合研究“产品级 Coding Agent 的全栈 runtime”。

### 最值得学习的 TOP 12

1. **OpenCode 的 durable input inbox**：`admitted_seq` / `promoted_seq` 把“收到输入”和“模型看到输入”拆开。
2. **OpenCode 的 tool settlement**：工具调用先 durable 记录，再执行副作用，再发布 result/failure。
3. **OpenCode 的 Event/Projection runtime**：UI/API 从 projection 读状态，runner 只推进事件。
4. **OpenCode 的 Context Epoch**：系统上下文是可比较、可替换、可阻断的 generation，而非一次性 prompt 字符串。
5. **Pi 的 side-effect-free AI core + compat shim**：新代码吃干净 core，老调用方继续走 compat，这种平台迁移姿势非常值得学。
6. **Pi 的 lazy provider module + unified API**：适合多模型 SDK / agent substrate。
7. **Pi 的 Extension 事件系统**：可拦截生命周期事件，适合做可编程 agent 平台。
8. **Pi 的 Session Compaction 文件追踪**：压缩时保留读写文件线索，比普通摘要更实用。
9. **jcode 的 streaming turn reducer**：provider stream、reasoning、tool/native/image/token/retry/error 统一规约成事件、消息和恢复动作。
10. **jcode 的 server-owned live turn**：用户输入、后台任务、swarm DM、reload recovery 都复用同一条 turn 生命周期。
11. **Grok Build 的 ACP + actor 分层**：client 协议、session ownership、chat state 和 HTTP sampling 各自独立，TUI/桌面/leader 不重写内核。
12. **Grok Build 的并发工具 + path lock + explicit outcome**：并行提升吞吐，同文件串行避免冲突，权限拒绝/取消/max-turn 都是一等终止状态。

### 场景二结论

- **想学 agent runtime 事务化边界** → 读 **OpenCode**。
- **想学可扩展 TypeScript agent substrate / SDK** → 读 **Pi**。
- **想学 Rust terminal runtime、server live session、Swarm/Memory、长会话 recovery** → 读 **jcode**。
- **想学 ACP、actor、tool runtime、持久 session、sandbox 与多代理如何组成完整产品** → 读 **Grok Build**。
- 四者都值得学，但学习重点不同：OpenCode 学“事务化执行内核”，Pi 学“平台底座”，jcode 学“本地系统 runtime”，Grok Build 学“协议化 agent OS”。

---

## 最终推荐

### 如果要采用

- **个人/高级开发者主力工具：OpenCode 优先。** 它功能覆盖和生态势能最强，但要接受高频迭代和 backlog 带来的摩擦。
- **内部二次开发底座：Pi 更稳。** provider substrate、SDK、Extension、release discipline 更容易拆出来复用。
- **实验性 Rust terminal agent runtime：jcode 值得个人隔离试用。** 不建议关键生产路径无隔离深度依赖。
- **完整产品级 Rust harness：Grok Build 先隔离试用。** 源码学习价值极高，但公开项目治理和发布连续性尚不足以支撑团队长期押注。

### 如果要学架构

- **OpenCode**：durable session runtime、event/projection、tool settlement、context epoch。
- **Pi**：provider substrate、compat shim、Extension 系统、session tree、SDK 化。
- **jcode**：streaming turn reducer、server-owned live session、Graph Memory、Swarm、compaction/reload recovery。
- **Grok Build**：ACP 内核、ChatState/Sampler actors、并发 tool dispatch、persistent session、permission/sandbox/worktree 组合边界。

### 综合判断

- **采用冠军（个人工具）：OpenCode。** 生态势能最强，功能覆盖最高，但团队采用要做隔离。
- **二次开发冠军：Pi。** 抽象边界更适合拆成内部 SDK / 平台。
- **Rust terminal runtime 学习冠军：jcode。** 如果目标是复刻一个本地高性能 terminal coding agent，jcode 当前学习价值已经超过“观望项目”的级别。
- **完整 Coding Agent 系统工程样本：Grok Build。** 如果目标是研究从客户端协议到长任务恢复、多代理和隔离的完整链路，它的信息密度最高；但不是当前的社区采用冠军。

---

## 备注

### 相关但非同类项目：compound-engineering-plugin

[compound-engineering-plugin](../reports/compound-engineering-plugin.md) 当前更准确的定位是：**root-native 团队型 AI coding workflow 插件 / 编排层**。它以顶层 `skills/` 和多份 native plugin manifests 为事实源，向 Claude、Cursor、Codex、Kimi 与 adapter targets 分发 `brainstorm → plan → work → simplify → review → compound` 的复利工程闭环；它依赖 Claude Code、Cursor、Codex 等宿主平台，而不是自己提供独立 agent runtime。

- **OpenCode / Pi / jcode / Grok Build 是“做一个 agent 平台或 runtime”**。
- **compound-engineering-plugin 是“在现有平台上加工作流编排、review loop 与复利工程协议”**。
- 它与 OpenCode / Pi 更可能互补：一个提供执行底座，一个提供工作流协议。

### 闭源 / 邻近对标检查表

| 项目 | 开源 | 核心差异 | 与四者对比 |
|------|------|----------|------------|
| Claude Code | ❌ | 模型/产品体验强，闭源 | 四个开源 runtime 的价值在可检查与可扩展；Grok Build 尤其接近完整产品层，但公开治理弱 |
| Codex CLI | ❌ / 部分生态开放 | OpenAI 生态深度 | OpenCode 更 runtime 化，Pi 更 substrate / SDK 化 |
| Cline | ✅ | VS Code 插件体验强 | IDE 内体验优先选 Cline；多入口 runtime 看 OpenCode |
| Aider | ✅ | Git patch flow 稳 | 稳定 Git 协作选 Aider；复杂 runtime / 多入口选 OpenCode |
| Continue | ✅ | 企业 IDE/RAG 接入 | 企业 IDE 上下文看 Continue；agent runtime 看 OpenCode / Pi |
| OpenHands | ✅ | 自治软件工程平台 / 任务执行 | 平台任务执行看 OpenHands；本地 coding runtime 看 OpenCode |
| Gemini CLI | ✅ | Google 生态与分发强 | Google provider-first 体验强；开放插件/runtime 可对比 OpenCode / Pi |
