# Coding Agents 横评

> 更新日期：2026-08-17（新增 Oh My Pi；其余项目沿用各自最近一次核验数据）
> 主矩阵项目：OpenCode、Pi（原 pi-mono）、Oh My Pi、DeepSeek Harness、Prime Agent、jcode、Grok Build
> 专项对照：cc-haha（同类 runtime，但因源码权利链未证明，不进入采用推荐主矩阵）
> 参考竞品：Claude Code、Codex CLI、Cline、Aider、Continue、OpenHands、Gemini CLI

---

## 场景一：采用选型横评

### 对比矩阵

| 维度 | OpenCode | Pi | Oh My Pi | DeepSeek Harness | Prime Agent | jcode | Grok Build |
|------|----------|----|-----------|------------------|-------------|-------|------------|
| 功能覆盖度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 集成成本 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐（双栈/native/宽配置） | ⭐⭐⭐（runtime/monorepo 很重） | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| 社区健康 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐（活跃但 backlog 极大） | ⭐⭐⭐（launch 热、治理待观察） | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| 文档质量 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 维护持续性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐（高频发布） | ⭐⭐⭐（内部活跃、公开仅一天） | ⭐⭐⭐⭐（v0.x 高频演进） | ⭐⭐⭐ | ⭐⭐（公开镜像待观察） |
| 运行时架构成熟度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐（完整 Agent OS 取向） | ⭐⭐⭐⭐⭐（源码强、公开 RC） | ⭐⭐⭐⭐（设计强、长任务仍硬化） | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 扩展与二次开发 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 许可证 | MIT | MIT | MIT | MIT | MIT | MIT | Apache-2.0 |
| **综合推荐度** | ✅ 推荐个人/高级开发者；团队隔离 PoC | ✅ 推荐个人主力试用 / 内部 SDK 底座 | ⚠️ 推荐个人受控试用；默认 yolo 必须收紧；团队生产观望 | ⚠️ 架构学习强烈推荐；仅可信 workspace 固定 RC 隔离试用；团队生产底座暂观望 | ⚠️ 架构学习强烈推荐；个人固定版本隔离试用；高权限生产暂缓 | ✅ 推荐个人隔离试用；团队生产化观望 | ⚠️ 源码学习强烈推荐；个人隔离试用；团队押注暂缓 |

### 基础画像

| 项目 | 仓库 | Stars（观测日） | Forks | 语言 | 最新版本 / Release | 核心定位 |
|------|------|----------------|-------|------|---------------------|----------|
| OpenCode | `anomalyco/opencode` | 174,169 | 21,032 | TypeScript | v1.17.6 | 开源 Coding Agent runtime，多入口、多模型、MCP/插件 |
| Pi | `earendil-works/pi` | 68,192（2026-07-07） | 8,371 | TypeScript | v0.80.3 | Terminal agent harness：coding agent CLI + runtime core + unified AI substrate |
| Oh My Pi | `can1357/oh-my-pi` | 25,276（2026-08-17） | 2,434 | TypeScript + Rust | v17.3.5 | Pi 深度分叉上的 batteries-included runtime：IDE/native/multi-agent/browser/memory/capability fabric |
| DeepSeek Harness | `deepseek-ai/deepseek-harness` | 40,232（2026-08-14） | 3,155 | TypeScript + Python SDK | `0.1.0-rc.6`；无 GitHub release/tag | Cordis plugin/fiber tree + SessionEvent/projection + capability seams 的完整 Coding Agent runtime |
| Prime Agent | `PrimeIntellect-ai/prime-agent` | 9,762（2026-08-09） | 938 | TypeScript + Python | v0.7.1 | Pi fork 上的持久 Agent runtime：daemon workers + IPython/RLM + retained children + continual harness |
| jcode | `1jehuang/jcode` | 7,055（2026-06-15） | 790 | Rust | v0.28.0 | Rust terminal Coding Agent runtime：TUI + server-owned live session + Swarm + Graph Memory |
| Grok Build | `xai-org/grok-build` | 19,581（2026-07-19） | 3,512 | Rust | 源码 `0.2.105`；无 GitHub release/tag | ACP + actor + 持久 session + 多代理的完整 Coding Agent harness |

> 注：**Pi** 是当前 canonical 名称；**pi-mono** 是历史名称。本文后文统一写 **Pi**。

### 分项详评

#### 功能覆盖度

- **OpenCode** 覆盖最广：CLI/TUI/Desktop/Web/HTTP/SDK/GitHub Action/Slack，多模型、多工具、MCP、插件、自定义工具都在同一个 runtime 体系内。
- **Pi** 覆盖也很强，而且比旧判断更“底座化”：Coding Agent CLI、独立 runtime core、统一 AI substrate、TUI、Extension 系统、Session 树、30+ provider 适配、experimental orchestrator，已经不只是“工具箱”。
- **Oh My Pi** 继承 Pi substrate，但主动走 batteries-included 路线：静态 registry 有 29 个内置工具，并把 LSP/DAP、Rust native data plane、task/hub、browser/computer、长期 memory、MCP/ACP 与跨宿主 capability discovery 纳入同一 runtime。
- **DeepSeek Harness** 是完整 runtime/platform，不是 DeepSeek adapter：Web/headless/Python SDK、durable session、compaction、sandbox/approval、jobs/goals、MCP/LSP、spawn/fork/ACP/Codex/Claude subagents 都由 profile 组合进同一 Cordis tree。
- **Prime Agent** 继承 Pi substrate 后，把产品重心移到长时自治：常驻 daemon、per-root worker、持久 IPython、RLM retained children、A2A、autonomous gates 和可回滚 continual harness。它的广度不如 OpenCode，但长时多代理深度更强。
- **jcode** 已从“Rust TUI 工具”升级为完整 terminal agent runtime：流式 turn 状态机、server-owned live session、Swarm、Graph Memory、MCP、skills、provider/OAuth、本地/云 provider、desktop/mobile crates 和多平台 release 都已进入主线。
- **Grok Build** 的产品面最完整：Ratatui TUI、headless/structured output、ACP stdio、leader/relay、dashboard、三模型协议、MCP、skills/plugins/hooks、subagents/worktrees、memory、sandbox 和 rewind 都在同一 runtime 中。

#### 集成成本

- **Pi**：终端安装仍然很轻，`npm install -g @earendil-works/pi-coding-agent` 即可；但 Node floor 已提高到 `>=22.19.0`，比旧版更挑环境。
- **Oh My Pi**：binary/npm 用户入口不重，但源码是 Bun + TypeScript + Rust + Cargo/Bazel + native leaves 的双栈 monorepo；安全采用还要收紧默认 `yolo`、固定版本并治理 MCP/project extension/browser/computer 权限。
- **DeepSeek Harness**：`npx @deepseek-ai/dsh web` 的用户入口很轻，但源码是 248-manifest、56.4 万行 TS 的 pnpm monorepo；Cordis、capability seam、event/projection 与 profile patch 心智使二次开发成本很高。
- **Prime Agent**：官方安装器降低入口门槛，但 RLM 完整路径需要 Node 22、Python 3.11、uv/ipykernel、ZeroMQ 和 daemon 状态目录；源码理解还要同时掌握 Pi substrate、Jupyter bridge 与多进程恢复，成本高于 Pi。
- **OpenCode**：终端用户安装路径清晰；源码级二次开发需要 Bun monorepo、Effect、session/event/projection 心智，学习成本中高。团队应先隔离 PoC。
- **jcode**：release binary/Homebrew/AUR 分发降低终端用户成本；源码级二次开发成本仍高，69 个 workspace members、约 54.5 万行 Rust、Swarm/Memory/provider/session/compaction 心智都需要消化。
- **Grok Build**：官方脚本和独立 release index 降低终端安装门槛，但源码是 79-member、约 138.6 万行 Rust 的 monorepo；公开 README 缺少 source build/test 手册，fork 成本为主矩阵最高。

#### 社区健康

- **OpenCode**：热度最高，最近 push/release 都很新；但 6,033 open issues + 1,031 open PRs，典型“高热度、高活跃、高 backlog”。
- **Pi**：品牌与分发面明显产品化（`earendil-works/pi`、`pi.dev`、统一 npm scope），但新贡献者 gate 仍很重；社区参与更像 product-led repo，而不是开放共建型基础设施。
- **Oh My Pi**：2026-08-17 有 25,276 Stars、2,434 Forks、457 contributors；947 open issues + 481 open PR 说明外部参与真实且 release 活跃，同时也是主矩阵中维护 backlog 最重的一档。
- **DeepSeek Harness**：公开一天即 40.2k Stars、3.1k Forks、约 535 个 Discussion 编号，launch attention 极强；但 Issues/PR 关闭、贡献先走 Discussion，尚无公开修复周期、插件质量或版本兼容的时间序列。
- **Prime Agent**：三个月达到 9.7k Stars、498 merged PR，launch validation 很强；但 167 open issues、250 open PR，分叉后前三 identity 占 80.9%，且缺 workspace trust gate，是“高势能、高 backlog、高集中度、高默认权限”的早期项目。
- **jcode**：star/fork 增长很快，v0.28.0 仍在高频 release；但本地 `git shortlog` 显示 4,620 commits 高度集中在作者多个 Git identity 上，bus factor 仍是核心风险。
- **Grok Build**：约五天获得 19.5k Stars，但 Issues/PR 关闭、贡献指南明确不接收外部贡献，公开历史只有 4 个 sync-bot commit。热度极高，社区协作度却是主矩阵最低。

#### 文档质量

- **Pi**：当前是主矩阵里“产品入口文档 + 包级文档 + 工程合同”最完整的一档。README 直接覆盖 permissions/containerization、supply-chain hardening、网站和 docs 入口。
- **Oh My Pi**：README、settings、approval、memory、MCP、agent hub 与 porting guide 信息密度高；不足是未见集中 `SECURITY.md` / threat model，默认 yolo 与宽权限组合需要读者自行拼出风险边界。
- **DeepSeek Harness**：2,355 份 Markdown 包含 architecture、subsystem、generated Cordis API、type-equiv、decision 和 postmortem，文档/源码同步强度是主矩阵最高一档；缺统一 SECURITY/threat model 与稳定 migration guide。
- **Prime Agent**：daemon、RLM runtime、long-running agent 文档的信息密度很高；不足是缺少同等完整的 security threat model、默认 permission/sandbox 和企业 hardening 指南。
- **OpenCode**：README/AGENTS/CONTEXT 对用户和 agent 友好，但 runtime 深层理解仍需读源码，尤其要分清 V1/V2 session 演进边界。
- **jcode**：README 已覆盖 provider/MCP/memory/swarm/安装，`SERVER_ARCHITECTURE.md`、`MEMORY_ARCHITECTURE.md`、`SWARM_ARCHITECTURE.md`、`SAFETY_SYSTEM.md` 等文档质量不错；不足是实现演进快，稳定扩展 API 和迁移指南还不如前两者成熟。
- **Grok Build**：24 篇用户指南对 session、permissions、sandbox、MCP、skills、hooks、plugins、subagents、memory、telemetry 的说明很细；不足是根 README 太薄，缺少外部 source build/test、release provenance 和迁移政策。

#### 维护持续性

- **OpenCode**：极高活跃，但 backlog 和复杂产品线意味着维护压力巨大。
- **Pi**：维护节奏稳定，release 到 v0.80.3；风险主要来自核心维护者集中、社区 gate 偏重，以及 session persistence / orchestrator 仍在继续演化。
- **Oh My Pi**：已到 v17.3.5 且同日仍在 release/push；但 `porting-from-pi-mono` 的 last sync marker 停在 2026-03-22，当前与 Pi 是两条高速分叉线，backport、native release 和大 backlog 会持续放大维护压力。
- **DeepSeek Harness**：12,293 commits 和 7/8 月高强度历史说明内部工程投入持续；但公开仓 2026-08-13 才创建，当前 0.1 RC、无 tag/release，主 CI run 又没有形成任何 job，公开维护持续性尚未被证明。
- **Prime Agent**：v0.1 到 v0.7.1 的发布速度极快，核心团队持续投入；同一观测日仍有 heap OOM、usage attribution flood、compaction self-amplification 和 Windows parity 缺陷，说明长任务主路径仍在硬化。
- **jcode**：迭代速度很快，2026-06-15 已到 v0.28.0；release/CI/多平台 artifact 信号强，但单点维护风险和版本稳定性仍需观察。
- **Grok Build**：内部产品代码显然长期迭代，但公开仓仅是 2026-07-16 起的单向同步镜像。当前不能用内部代码成熟度替代公开同步、发布和安全修复持续性的证据。

### 场景一结论

- **想要当下可用的开源 coding agent 主力工具** → 优先试 **OpenCode**，但在关键仓库中先加隔离和权限边界。
- **想要可二次开发的 TypeScript agent substrate / SDK 底座** → 选 **Pi**。
- **想要 Pi 心智但不想自己拼 LSP/DAP、browser、memory、MCP 与多 Agent runtime** → 试 **Oh My Pi**；先把 approval 从默认 `yolo` 改为 `write` / `always-ask`，再放进低权限隔离环境。
- **想研究可逆插件树、capability seam、append-only event/projection 和安全组合** → 读 **DeepSeek Harness**；只打开可信 workspace，固定 RC 并保留 `workspace-write + ask`。未审计仓先禁用 project instructions/skills，并用外层容器/VM补宿主读取、网络与租户边界。
- **想研究或试用 RLM、持久子代理、detach/attach、continual harness** → 选 **Prime Agent**，但固定版本并放进容器/VM；只打开已审计仓库，启动时先禁用项目 extensions/skills/context files，暂不要交给生产凭据和无限长任务。
- **想要 Rust terminal-first、高性能本地 runtime、Swarm/Memory 深度能力** → **jcode 值得个人隔离试用**；团队生产化前仍需安全隔离、版本冻结和维护风险评估。
- **想拆解最完整的生产级 Coding Agent runtime** → 读 **Grok Build**；个人使用先在 sandbox/低权限测试仓隔离试用，团队长期押注等待公开同步与 release provenance。
- **只需要 IDE 内 agent 体验** → 看 Cline / Continue。
- **只需要成熟 Git patch flow** → 看 Aider。
- **想要平台级自治软件工程环境** → 看 OpenHands。

---

## 场景二：技术架构学习横评

### 对比矩阵

| 维度 | OpenCode | Pi | Oh My Pi | DeepSeek Harness | Prime Agent | jcode | Grok Build |
|------|----------|----|-----------|------------------|-------------|-------|------------|
| 设计模式深度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 代码质量 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 可借鉴度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 创新性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Runtime 可复用性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **综合学习价值** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### 架构模式对比

| 问题 | OpenCode 的方案 | Pi 的方案 | Oh My Pi 的方案 | DeepSeek Harness 的方案 | Prime Agent 的方案 | jcode 的方案 | Grok Build 的方案 |
|------|-----------------|-----------|------------------|------------------------|------------------|--------------|-------------------|
| Agent 执行内核 | Durable Session + Event/Projection + single-turn runner + tool settlement | Agent core + transport/state abstraction + steering/follow-up queues + session tree | Pi agent core + SDK composition root + 29-tool registry + native/IDE data plane | Cordis fiber/plugin tree + ReactLoopAgent turn/step machine + SessionEvent projection | Agent event loop + `AgentSession` + persistent IPython + RLM host bridge | Provider stream reducer + `run_turn_streaming_mpsc` + tool settlement | ACP → MvpAgent → AcpSession actor → ChatState/Sampler actor → ToolBridge |
| 输入生命周期 | `session_input` inbox，`admitted_seq` / `promoted_seq`，`steer` / `queue` | follow-up / steering queue + lifecycle hooks | Pi queue + slash workflow + task/hub yields + advisor/background notifications | Inbox `next-turn` / `next-step` + followup/steer/inject + abort wake reclassification | prompt admission + daemon queue + A2A steering + goal/heartbeat/autonomous continuation | user prompt、background wake、swarm DM、reload recovery 统一进入 live turn | prompt queue + interjection + goal rounds + TodoGate + cancel/permission outcome |
| 状态持久化 | SQLite/Drizzle tables + synchronized events + projector | jsonl session log + compaction + branch summary（已显露继续演化信号） | JSONL session tree + checkpoint/rewind + task revive + pluggable long-term memory | append-only SessionEvent + surface projection + JSONL/Zstd 或 SQLite + crash closer | append-only JSONL tree + worker journal + kernel snapshot + harness/child artifacts | Session JSON/journal + provider_session_id + compaction + replay/memory injection | ACP `updates.jsonl` + raw history + plan/signals + rewind snapshots + compaction checkpoints |
| 工具执行 | tool-call durable 记录后 settlement，失败显式收敛 | TypeBox tools + Extension events + before/after interception | unified approval → TS/native/MCP/browser/task tools → diagnostics/intent trace | capability registry + sandbox/approval wrappers + bounded rolling pool + model-order commit | 默认仅暴露 IPython；Python/`%%bash` + host requests；extension gate 可阻断但无默认 approval | Registry + ToolContext + session policy + persisted ToolResult | prepare/permission/hooks → `FuturesUnordered` 并发 → path lock → result 回灌 |
| 扩展机制 | Plugin tools + MCP + filesystem custom tools + HTTP/SDK | TypeScript Extension + lifecycle interception + custom UI + provider registration | Pi Extension + capability providers + MCP/ACP + packages + internal URL schemes | profile patch stack + Cordis plugin/service + capability seam + client slots + MCP | Pi extensions + Python skills + MCP host bridge + ACP `_meta` + continual harness CRUD | MCP + skills + provider profile + crate/internal tool registry | MCP + skills + plugins + hooks + ACP extension methods |
| 多模型支持 | provider/model catalog + route resolver | side-effect-free AI core + compat shim + lazy provider modules | Pi AI substrate + role router + credential pool/session affinity + fallback/backoff | 默认 DeepSeek adapter + dormant pi-ai provider profiles + per-request credential refs | 继承 Pi provider substrate，增加 daemon/RLM runtime 配置和 auth recovery | provider trait + 独立 provider crates + OpenAI-compatible profile | Chat Completions / Responses / Anthropic Messages 三后端 Sampler |
| Memory | session context epoch / projection-first history | 无本地 RAG，靠 session/compaction | retain/recall/reflect/learn + local/Hindsight/Mnemopi backend | event/projection + compaction + optional full-text session index；无默认长期语义 memory | transcript/compaction + kernel snapshot + harness memory；无向量检索 | Graph Memory + embedding seeds + BFS cascade retrieval + listwise rerank | Markdown archive + SQLite/FTS/vector + embedding/MMR/query expansion/dream |
| 多 Agent | task/subagent/tooling 路径，runtime 化能力强 | subagent + experimental orchestrator | task fan-out/chain + worktree isolation + typed yield + persisted revive + Agent Hub | in-process spawn/fork + continuable child + ACP/Codex/Claude/SDK provider seams | retained child sessions + 独立 kernel/artifact + A2A + usage attribution | Server-owned Swarm：members/channels/event history/live wake | blocking/background subagent + session fork + worktree + leader |
| UI 架构 | CLI/TUI/Desktop/Web/HTTP 多入口读取 projection | CLI/TUI/RPC 外壳读取共享 runtime substrate | CLI/TUI/print/RPC/ACP + browser relay/collab-web 读取共享 session runtime | Web/headless/Python SDK 共用 host tree；Web 由 typed client plugins/slots 组合 | TUI/print/JSON/RPC/ACP 连接 daemon-owned worker/session tree | Ratatui TUI + server/gateway/debug clients + desktop/mobile crates | Ratatui TUI、headless、ACP stdio、serve/dashboard 共用 session runtime |

### 设计决策对比

- **OpenCode 倾向 runtime 事务化。** 它的核心不是 UI，而是 durable session、event log、projection、tool settlement、location ownership。这是最适合研究“coding agent 怎么从 prompt loop 变成可靠 runtime”的项目。
- **Pi 倾向 harness / substrate 化。** 它表面上是 CLI，真正资产在 provider substrate、agent runtime、extension lifecycle、session persistence 与 release discipline，是“怎么把 agent 从产品壳拆成可复用平台层”的好样本。
- **Oh My Pi 倾向 Agent OS 化。** 它证明同一 Pi substrate 可以沿相反方向演进：capability registry 归一多宿主配置，Rust 承担 data plane，LSP write-through 进入写入语义，task/hub、browser、memory 成为静态工具面；代价是更大的 TCB、release matrix 与默认 yolo 风险。
- **DeepSeek Harness 倾向 composition runtime 化。** Cordis tree 同时是 dependency graph、capability graph 和 ownership graph；SessionEvent 是事实层，surface projection 是模型层，profile patch 是产品层。最值得学的是可逆 composition 与 capability seam；最需警惕的是缺 workspace trust、默认项目 instructions/skills 与宿主读取/网络形成的 P1 链，以及 `!!js`/插件供应链和 native sandbox 被误当成完整隔离。
- **Prime Agent 倾向 long-horizon runtime 化。** 它把 Pi substrate 推进为 per-root worker、持久 IPython、retained children、journal/snapshot recovery 和 typed harness refinement；最值得学的是生命周期与状态契约，最需要警惕的是 workspace trust 和跨 store 非事务恢复。
- **jcode 倾向本地系统 runtime 化。** 它用 Rust/Tokio/Ratatui，把 terminal agent 做成 server-owned live session：turn reducer、tool settlement、Swarm、Graph Memory、compaction/reload recovery 都是核心，不只是性能优化。
- **Grok Build 倾向协议化 agent OS。** ACP 是入口契约，actor 是所有权边界，persistent session 是恢复边界，permission/sandbox/worktree 是副作用边界；它最适合研究“产品级 Coding Agent 的全栈 runtime”。

### 最值得学习的 TOP 22

1. **OpenCode 的 durable input inbox**：`admitted_seq` / `promoted_seq` 把“收到输入”和“模型看到输入”拆开。
2. **OpenCode 的 tool settlement**：工具调用先 durable 记录，再执行副作用，再发布 result/failure。
3. **OpenCode 的 Event/Projection runtime**：UI/API 从 projection 读状态，runner 只推进事件。
4. **OpenCode 的 Context Epoch**：系统上下文是可比较、可替换、可阻断的 generation，而非一次性 prompt 字符串。
5. **Pi 的 side-effect-free AI core + compat shim**：新代码吃干净 core，老调用方继续走 compat，这种平台迁移姿势非常值得学。
6. **Pi 的 lazy provider module + unified API**：适合多模型 SDK / agent substrate。
7. **Pi 的 Extension 事件系统**：可拦截生命周期事件，适合做可编程 agent 平台。
8. **Pi 的 Session Compaction 文件追踪**：压缩时保留读写文件线索，比普通摘要更实用。
9. **Oh My Pi 的 capability-first discovery**：先定义 settings/rules/skills/MCP 等能力，再让各宿主 loader 归一成统一 item。
10. **Oh My Pi 的 LSP write-through**：编辑、format、rename hook、deferred diagnostics 形成同一副作用链。
11. **Oh My Pi 的 internal URL resource fabric**：memory/MCP/agent/SSH/artifact 通过 scheme ownership 接入统一 `read` contract。
12. **Oh My Pi 的 task isolation contract**：worktree、provider concurrency、typed yield、persisted revive 共同约束多 Agent。
13. **jcode 的 streaming turn reducer**：provider stream、reasoning、tool/native/image/token/retry/error 统一规约成事件、消息和恢复动作。
14. **jcode 的 server-owned live turn**：用户输入、后台任务、swarm DM、reload recovery 都复用同一条 turn 生命周期。
15. **Grok Build 的 ACP + actor 分层**：client 协议、session ownership、chat state 和 HTTP sampling 各自独立，TUI/桌面/leader 不重写内核。
16. **Grok Build 的并发工具 + path lock + explicit outcome**：并行提升吞吐，同文件串行避免冲突，权限拒绝/取消/max-turn 都是一等终止状态。
17. **Prime Agent 的 RLM host bridge**：Python shim 只做请求，TypeScript host 掌握模型、认证、深度和 child lifecycle，`rlm()` 返回 admission handle 而不是伪同步结果。
18. **Prime Agent 的 daemon recovery contract**：session lease、worker generation、command journal、kernel snapshot 与 uncertain mutation 明确区分“恢复上下文”和“重放副作用”。
19. **Prime Agent 的 typed continual harness**：base prompt immutable，supplemental prompt/memory/skill/subagent 可版本化编辑、冲突检测和回滚；同时应外接客观 eval 决定保留。
20. **DeepSeek Harness 的 reversible plugin tree**：每个 service/listener/timer/process 都有 fiber owner，配置替换失败保留或恢复旧 generation。
21. **DeepSeek Harness 的 SessionEvent surface projection**：append-only 事实层不改旧事件，compaction 与 UI 通过 projection 选择模型所见。
22. **DeepSeek Harness 的并发工具提交协议**：tool body 可 bounded parallel，policy/result/context 始终按模型原始顺序 commit，abort 也保持 call/result pairing。

### 场景二结论

- **想学 agent runtime 事务化边界** → 读 **OpenCode**。
- **想学可扩展 TypeScript agent substrate / SDK** → 读 **Pi**。
- **想学 minimal substrate 如何长成 IDE-aware、native-backed Agent OS** → 读 **Oh My Pi**，同时把默认 yolo 与 native PR CI 盲区当反例一起学。
- **想学可逆插件树、capability seam、event/surface projection、sandbox/approval composition** → 读 **DeepSeek Harness**。
- **想学 RLM host bridge、retained child、daemon recovery 与 continual harness** → 读 **Prime Agent**，并把 workspace trust 缺口当反例一起学。
- **想学 Rust terminal runtime、server live session、Swarm/Memory、长会话 recovery** → 读 **jcode**。
- **想学 ACP、actor、tool runtime、持久 session、sandbox 与多代理如何组成完整产品** → 读 **Grok Build**。
- 七者都值得学，但学习重点不同：OpenCode 学“事务化执行内核”，Pi 学“平台底座”，Oh My Pi 学“batteries-included Agent OS”，DeepSeek Harness 学“可逆 composition runtime”，Prime Agent 学“长时 RLM runtime”，jcode 学“本地系统 runtime”，Grok Build 学“协议化 agent OS”。

---

## 最终推荐

### 如果要采用

- **个人/高级开发者主力工具：OpenCode 优先。** 它功能覆盖和生态势能最强，但要接受高频迭代和 backlog 带来的摩擦。
- **内部二次开发底座：Pi 更稳。** provider substrate、SDK、Extension、release discipline 更容易拆出来复用。
- **Pi 心智的全功能个人工具：Oh My Pi 受控试用。** 固定版本、改掉默认 yolo、隔离 native/browser/computer/MCP 权限后再用；团队生产暂不优先。
- **可组合 Harness 受控试点：DeepSeek Harness。** 仅打开可信 workspace，固定 RC 并保留 `workspace-write + ask`；未审计仓默认禁用 project instructions/skills，外层补容器/VM、出站限制和插件白名单；当前不作为团队生产底座。
- **长时 RLM 受控试点：Prime Agent。** 只在外部隔离、可信仓库和显式禁用项目扩展/skills/context 的前提下采用；不作为当前默认生产工具。
- **实验性 Rust terminal agent runtime：jcode 值得个人隔离试用。** 不建议关键生产路径无隔离深度依赖。
- **完整产品级 Rust harness：Grok Build 先隔离试用。** 源码学习价值极高，但公开项目治理和发布连续性尚不足以支撑团队长期押注。

### 如果要学架构

- **OpenCode**：durable session runtime、event/projection、tool settlement、context epoch。
- **Pi**：provider substrate、compat shim、Extension 系统、session tree、SDK 化。
- **Oh My Pi**：capability registry、LSP write-through、role router、internal URL、task isolation、native data plane。
- **DeepSeek Harness**：Cordis reversible plugin tree、SessionEvent/projection、capability seam、ordered tool commit、sandbox/approval composition。
- **Prime Agent**：IPython/RLM host bridge、retained children、daemon journal/snapshot recovery、typed continual harness。
- **jcode**：streaming turn reducer、server-owned live session、Graph Memory、Swarm、compaction/reload recovery。
- **Grok Build**：ACP 内核、ChatState/Sampler actors、并发 tool dispatch、persistent session、permission/sandbox/worktree 组合边界。

### 综合判断

- **采用冠军（个人工具）：OpenCode。** 生态势能最强，功能覆盖最高，但团队采用要做隔离。
- **二次开发冠军：Pi。** 抽象边界更适合拆成内部 SDK / 平台。
- **Pi 系全功能个人工具：Oh My Pi。** 功能覆盖与架构密度高，但默认权限、双栈供应链和 backlog 使其更适合受控个人试用，而非当前团队生产冠军。
- **可组合 Harness 架构研究冠军：DeepSeek Harness。** capability ownership、event/projection、persistence 与安全组合的开源实现密度最高；生产采用仍受 0.1 RC 和公开治理证据限制。
- **长时 Agent 架构研究冠军：Prime Agent。** RLM、持久子代理和 continual harness 的开源实现密度最高；采用判断仍是 controlled pilot。
- **Rust terminal runtime 学习冠军：jcode。** 如果目标是复刻一个本地高性能 terminal coding agent，jcode 当前学习价值已经超过“观望项目”的级别。
- **完整 Coding Agent 系统工程样本：Grok Build。** 如果目标是研究从客户端协议到长任务恢复、多代理和隔离的完整链路，它的信息密度最高；但不是当前的社区采用冠军。

---

## 同类新增：cc-haha（不进入采用主矩阵）

[cc-haha](../reports/cc-haha.md) 与 OpenCode、Pi、jcode、Grok Build 属于同一类：它有自己的 agent loop、streaming tool executor、JSONL session、permissions、MCP/LSP、subagents/Swarm、provider routing、Desktop、H5/IM 和 Computer Use，不是 Claude Code 的简单 GUI wrapper。

它没有进入上方采用主矩阵，不是因为功能或架构弱，而是存在更高优先级的 **source provenance hard blocker**：

- root commit `f5a40b86` 为 `init: add source code from src.zip`；
- 随后 commit `5a774a2b` 明确写 `emphasize leaked source`；
- 再下一阶段才是 `fix leaked source to be locally runnable`；
- 当前根目录 MIT 没有同时给出 Anthropic 授权、文件级来源或再许可权证明。

| 维度 | cc-haha | 与主矩阵项目的关系 |
|------|---------|--------------------|
| Runtime 完整度 | ⭐⭐⭐⭐⭐ | 产品面接近 Grok Build，入口面接近 OpenCode |
| Agent loop 学习价值 | ⭐⭐⭐⭐⭐ | `query()` 状态机、fallback tombstone、tool-result settlement 信息密度很高 |
| Desktop / Remote | ⭐⭐⭐⭐⭐ | Electron、H5、IM、Computer Use 比 Pi/jcode 更产品化 |
| Session model | ⭐⭐⭐⭐⭐ | JSONL canonical + local projection，介于 Pi 的 JSONL 与 OpenCode 的 projection runtime 之间 |
| 多 provider | ⭐⭐⭐⭐ | provider 面广，但内部消息与权限语义仍深度 Anthropic-shaped |
| 工程质量 | ⭐⭐⭐⭐ | 599 个 test/spec 文件、六平台 release、细粒度 CI；96 万行历史包袱很重 |
| 社区活跃 | ⭐⭐⭐⭐ | 13.7k Stars、8.5k Forks、36 tags、维护极活跃；贡献高度集中 |
| 采用 / 复制 | ⭐ | 根 MIT 不能自动解决初始泄露快照的权利链 |

### 对 cc-haha 的双结论

- **架构学习：强烈推荐。** 重点读 streaming tool execution、JSONL + projection、H5 capability、Computer Use fail-closed、多 Agent permission mailbox。
- **生产 / 商业采用：不推荐。** 在权利链、SECURITY policy、secret storage、强制签名和 release provenance 补齐前，只适合隔离研究。
- **复刻方式：clean-room。** 提炼不变量和契约，重新实现；不要直接复制表达性源码。

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
