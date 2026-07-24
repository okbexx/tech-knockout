# Agent Platforms 横评

> 更新日期：2026-07-24
> 涉及项目：openagent, openhuman, UI-TARS-desktop, CyberVerse, open-design, Buzz
> 分类口径：这里比较的是“平台型 Agent 产品 / 工作台 / 运行时 substrate”，不是纯 SDK，也不是单一 coding agent。六者并非完全同层：openagent 偏自托管 Web agent workbench，openhuman 偏本地优先 personal AI OS，UI-TARS-desktop 偏 GUI automation runtime，CyberVerse 偏实时 digital-human Agent framework，open-design 偏 agent-native design substrate，Buzz 偏人类与 Agent 共用签名事件、频道、Git 与 workflow 的组织协作平台。
>
> **2026-07-21 范围更新**：Orca 同样属于 Agent platform，但它更具体地解决“如何用 daemon-owned PTY、Git worktree、多端 RPC 与 structured dispatch 组织现有 Coding Agent CLI”。为避免把异构 CLI control plane 与通用 personal AI / GUI / digital-human / design platform 混成一张过宽矩阵，Orca 的报告见 [reports/orca.md](../reports/orca.md)，同类横评见 [Coding Agent Control Planes](./coding-agent-control-planes.md)。
>
> **2026-07-24 范围更新**：Buzz 纳入本表，因为它已形成 Rust relay、Tauri/React desktop、Flutter mobile、CLI、ACP process pool、Git/PR 与 workflow 的完整 Agent platform，而不只是通信协议。它回答的是“Agent 如何成为团队成员”。

---

## 场景一：采用选型横评

### 对比矩阵

| 维度 | openagent | openhuman | UI-TARS-desktop | CyberVerse | open-design | Buzz |
|------|-----------|-----------|-----------------|------------|-------------|------|
| 产品形态 | Web 管理台 + 自托管后端 | Rust/Tauri desktop personal AI OS | Electron 桌面应用 + GUIAgent SDK + Operator/browser/remote runtime | Go orchestrator + Python inference + Vue Web 的实时 digital-human Agent 平台 | Web + daemon + desktop + packaged runtime 的 agent-native 设计平台 | Rust relay + Tauri/React desktop + Flutter mobile + CLI + ACP harness 的 Agent-native 团队协作平台 |
| 核心强项 | LLM Provider + RAG + MCP/tools + admin/distribution | Memory Tree + tool registry + `tinyagents` / `tinyflows` + `skill_runtime` + run ledger + connectors | GUIAgent loop、VLM adapter、action parser、Operator port、本地/浏览器/远程执行 | WebRTC / 实时语音 / PersonaAgent / RAG / FlashHead / LiveAct / 云端数字人 provider | `SKILL.md` + `DESIGN.md` + runtime registry + artifact preview/export + MCP + plugin/automation | Nostr 签名事件、host-derived tenancy、ACP queue/pool、频道/DM、Git/PR、workflow 与审计统一数据面 |
| 功能覆盖度 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 集成成本 | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ |
| 社区健康 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 文档质量 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 维护持续性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 许可证 | Apache-2.0 | GPL-3.0 | Apache-2.0 | GPL-3.0 | Apache-2.0 | Apache-2.0 |
| 生产采用建议 | ⚠️ 观望；个人/小团队 PoC 可试 | ⚠️ 观望；隔离试用 / 架构学习 / 外围维护优先 | ⚠️ 观望；GUI agent PoC / 研究推荐 | ⚠️ 观望；PoC / 学习推荐，生产前先做安全收口 | ⚠️ 推荐研究与 PoC；生产采用前先当平台底座评估 | ⚠️ 推荐固定版本、隔离环境内部试点；生产协作主干暂观望 |
| 架构学习价值 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### 分项详评

#### openagent

- **适合采用的点**：部署/分发成熟，Apache-2.0，UI 管理面完整，RAG/MCP/tools/provider 组合速度快。
- **主要风险**：主聊天链路与 OpenAI-compatible API 能力不一致；workflow/BPMN 叙事和新前端源码不完全对应；新旧前端并存；工具安全边界需要自己收紧。
- **最佳采用路径**：作为个人或小团队 self-hosted agent workbench 先跑 PoC，不要一开始就作为企业多租户生产基座。

#### openhuman

- **适合采用的点**：本地优先 desktop personal AI OS，Memory Tree、Obsidian vault、agent tool registry、MCP、Composio、`flows`/`tinyflows`、`skill_runtime`、`session_db`/run ledger、多 Agent orchestration、voice/Meet/channel 等方向完整，架构密度极高。
- **主要风险**：GPL-3.0；默认 managed backend 仍承担账号、模型路由、web search proxy、Composio OAuth / managed integration flows；桌面/Tauri/CEF/Rust core + 宽工具面 + MCP/Composio/voice/screen/web3/x402 攻击面重。
- **最佳采用路径**：隔离安装试用、学习架构、做外围维护贡献；生产化前必须先收敛许可证、安全 profile、tool/MCP allowlist、connector/OAuth、provider routing 和本地数据边界。

#### UI-TARS-desktop

- **适合采用的点**：GUI Agent / computer-use 方向专业，`GUIAgent + VLM adapter + action parser + Operator port` 内核完整，适合作为本地电脑、浏览器和远程执行 runtime 的架构参照。
- **主要风险**：不是通用个人 AI 助手管理台；GUI 自动化在安全、可复现性、跨平台稳定性、日志脱敏和执行审计上天然复杂；当前更适合 runtime/SDK 参考而不是整仓生产化。
- **最佳采用路径**：GUI agent PoC、自动化研究、抽取 SDK/Operator 思路；不宜误当成企业知识助手平台，也不宜整仓直接生产化。

#### CyberVerse

- **适合采用的点**：实时语音 + WebRTC + PersonaAgent + RAG + 数字人视频（FlashHead/LiveAct/云端 provider）已经形成可跑通闭环，尤其适合 digital-human、AI 主播、实时陪伴/客服等场景 PoC。
- **主要风险**：GPL-3.0；默认 host `0.0.0.0`、`cors_origins: ["*"]`、内部 task/knowledge token 可选导致默认安全口径偏松；Node/Go/Python/FFmpeg/模型权重/云端数字人 provider 组合让部署与合规都更重。
- **最佳采用路径**：先跑纯语音或单一 avatar provider 的垂直 PoC；生产前先补 internal token、CORS、网络暴露、模型与权重许可、媒体链路审计。

#### open-design

- **适合采用的点**：`SKILL.md`、`DESIGN.md`、runtime registry、artifact preview/export、MCP install、desktop/daemon 边界和 plugin/automation substrate 都非常完整，适合做 AI 设计工作台或设计产物平台底座。
- **主要风险**：Node 24 + pnpm + better-sqlite3 + Electron + desktop sidecar + Cloud/BYOK proxy + 多 release workflow，维护复杂度极高；repo/backlog 巨大，文档与产品口径会有漂移。
- **最佳采用路径**：先把它当设计 substrate / 协议样板来借，不要直接整仓接手；PoC 先验证一个 runtime + 一个 design-system + 一个 artifact 流程，再决定是否深 fork。

#### Buzz

- **适合采用的点**：人、Agent、Git、PR、workflow 和审计共用签名事件窄腰；`TenantContext` fail closed；ACP queue/pool/session 把多频道并发、崩溃恢复、timeout 和 session rotation 产品化。
- **主要风险**：项目公开历史只有四个多月；v0.4.x 仍在高频修补 Windows PATH/Git Bash、Agent onboarding、runtime discovery、reconnect 与 identity restore；本地 Agent 子进程天然拥有高权限执行面。
- **最佳采用路径**：固定 release，在独立 VM/开发机用户下只开一个 community、一个 Agent runtime 和一个测试 repo；先验证密钥、重连、崩溃恢复与最小工具权限，再决定是否扩大。

### 场景一结论

- **如果要最快搭自托管 AI 助手后台** → 选 **openagent** 做 PoC。
- **如果要本地优先 personal AI OS / long-memory workspace** → 看 **openhuman**，但许可证、managed backend 边界和安全面要先算清楚。
- **如果要电脑/浏览器/GUI automation** → 看 **UI-TARS-desktop**。
- **如果要实时数字人 / 语音视频 Agent** → 看 **CyberVerse**。
- **如果要 agent-native 设计平台 / 设计 substrate** → 看 **open-design**。
- **如果要人类 + Agent + Git 共用协作空间** → 看 **Buzz**，但先固定版本隔离试点。
- **如果要成熟企业 workflow / RAG / knowledge 平台** → 这六者都仍应和 Dify、Flowise、AnythingLLM、Open WebUI、LangGraph、Onyx、RAGFlow 做进一步对照。

---

## 场景二：技术架构学习横评

### 对比矩阵

| 维度 | openagent | openhuman | UI-TARS-desktop | CyberVerse | open-design | Buzz |
|------|-----------|-----------|-----------------|------------|-------------|------|
| 设计模式深度 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 代码质量 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 可借鉴度 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 创新性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 综合学习价值 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### 架构模式对比

| 问题 | openagent 的方案 | openhuman 的方案 | UI-TARS-desktop 的方案 | CyberVerse 的方案 | open-design 的方案 | Buzz 的方案 |
|------|------------------|-------------------|--------------------------|-------------------|--------------------|-------------|
| 产品宿主 | Go 后端 + Web admin | Tauri desktop + in-process Rust core + React | Electron desktop + SDK/packages monorepo | Go server + Python gRPC inference + Vue frontend | Next.js Web + local daemon + Electron/packaged shell | Rust relay + Tauri/React desktop + Flutter mobile + Rust CLI/ACP sidecars |
| 能力组合根 | Store 绑定 prompt/provider/RAG/tools/MCP | Controller/tool/provider/MCP/flows/profile registries + `tinyagents` / `tinyflows` seams | GUIAgent loop + Model adapter + Action parser + Operator port | 会话 orchestrator + plugin registry + PersonaAgent + avatar / ASR / TTS / RAG providers | runtime registry + `SKILL.md` + `DESIGN.md` + plugin/automation substrate | Nostr signed event kind + `TenantContext` + event projection + ACP queue/pool/session |
| 模型接入 | `ModelProvider` interface + factory | unified inference + role-based provider routing | OpenAI-compatible VLM / Responses API + UI-TARS action parsing | gRPC plugin 服务面 + Qwen/Doubao/OpenAI/LiteLLM + 本地/云端数字人 provider | 本地 Agent CLI + BYOK proxy + Open Design Cloud | Goose/Codex/Claude/custom ACP 子进程 + 可选本地 mesh LLM |
| 记忆 / RAG | Store/vector DB/embedding/search provider | Memory Tree + Obsidian vault + session_db/run ledger | 非核心，偏视觉 GUI context / screenshot history | Character knowledge + RAG engine + PersonaAgent 工具化检索 | Skill / Design System / artifact / prompt 资产为主，不以长期记忆为核心卖点 | 事件历史、线程 context、Agent/team snapshot 与 Typesense；非 personal long-memory 主导 |
| 工具体系 | builtin tools + MCP tools 合并 ToolSet | tool registry + MCP client/server + `flows`/`skill_runtime` + security policy | 本地电脑、浏览器、远程电脑/浏览器等 Operator family | Avatar / LLM / TTS / ASR / Omni / VoiceLLM / Persona 插件总线 | MCP install / plugin runtime / automations / external integrations | MCP/dev tools + Git/PR/workflow/media 能力，Agent identity 与协作权限绑定 |
| UI / 流式 | SSE event 分层：message/reason/tool/search/vector | Desktop UI + JSON-RPC/core state + command center/recent runs | `onData` delta conversation + prediction marker + IPC lifecycle | WebRTC 实时媒体 + Go session state + gRPC inference + Web UI | daemon SSE + sandboxed preview + desktop host bridge | Nostr WebSocket subscription + typing/presence + observer archive + desktop/mobile 多端投影 |
| 分发 | 单二进制/Docker/Helm | 多平台桌面安装包 + Homebrew/apt/MSI + CEF | Electron App + npm packages + GitHub release workflows | Docker/Conda/Makefile + Web frontend | Web + daemon + desktop/package + 多 release channel + MCP wiring | 签名/公证 desktop release、Tauri updater、Linux/Windows/macOS、Flutter mobile、Helm/server |
| 失败恢复 | 后端 service / API error 处理 | approval/sandbox、workflow DONE/FAILED/CANCELLED/DEGENERATE、run ledger、health/doctor | screenshot/model/execute retry、max loop、pause/resume/stop、call_user/finished terminal action | session guard、task state、pipeline/turn seq、语音中断与媒体恢复 | runtime resume/recover、proxy fallback、artifact/retry、desktop/daemon 分层恢复 | relay reconnect、channel queue requeue、ACP process respawn、session rotation、stall/timeout surfacing |

### 最值得学习的 TOP 12

1. **openagent 的 Store 能力组合根**
   - 把 prompt、model provider、RAG、tools、skills、MCP server 组合成一个用户可配置对象。

2. **openagent 的 MCP + builtin tool 同构执行**
   - `object.MergeMcpTools()` + `model.callMcpTool()` 是“外部协议工具”和“内建危险能力”如何统一审计的好样本。

3. **openhuman 的 registry-first platform kernel**
   - Controller、Tool、Provider、MCP、Flows、Profile 都 registry 化，能力可发现、可过滤、可授权。

4. **openhuman 的 Memory Tree + session_db / run ledger**
   - 长期记忆、transcript/search、background runs、workflow/team tasks 被放进 durable state，而不是只靠 prompt history。

5. **openhuman 的 `flows` / `tinyflows` 与 `skill_runtime` 分层**
   - 保存型 automation graph 与 installed `SKILL.md` workflow 分层，再配上 DONE/FAILED/CANCELLED/DEGENERATE footer、preflight gate、cancel token、repeated-line detector，是 agent 长任务产品化的关键模式。

6. **UI-TARS-desktop 的 GUI agent runtime 分层**
   - `GUIAgent + UITarsModel + actionParser + Operator` 把 screenshot → VLM → parsed action → OS/browser/remote side effect 做成可替换运行时，对 computer-use / browser-use / remote desktop 自动化方向有直接参考价值。

7. **CyberVerse 的 Go orchestrator + Python inference 双层架构**
   - 用 Go 抓实时会话、PipelineSeq/TurnSeq 和 WebRTC / LiveKit 边界，用 Python gRPC 插件层承载 avatar / ASR / TTS / RAG / Persona，适合实时数字人和语音 Agent 场景。

8. **CyberVerse 的 PersonaAgent + 后台任务投影**
   - 在实时会话里保留 create/cancel/status/knowledge retrieval 这类工具，把“边说边调度后台任务”的模式产品化。

9. **open-design 的 file-protocol substrate**
   - `SKILL.md`、`DESIGN.md`、prompt templates、plugin manifests 把方法论、品牌 contract、产物模板和插件资产全部文件化，是 agent-native 设计平台最有复用价值的抽象之一。

10. **open-design 的 runtime registry + daemon↔web boundary**
   - 把多 Agent CLI、BYOK proxy、MCP install、artifact preview/export、desktop shell 放到同一套 runtime/daemon/contracts 体系里，是“从 agent shell 长成平台”的强样本。

11. **Buzz 的签名事件窄腰 + TenantContext 隔离**
   - 身份、消息、Git、workflow 和审计共用 event contract；community 从入口进入类型、DB 与 Redis key，未知 host fail closed。

12. **Buzz 的按频道串行、跨频道并发 ACP runtime**
   - queue/pool/session 分层处理顺序、并发、进程崩溃、session rotation、timeout 与 context 回填，是长期在线 Agent 产品化的完整样本。

### 场景二结论

- **学自托管 Web agent workbench** → 优先读 **openagent**。
- **学本地优先 personal AI OS / memory-rich desktop platform** → 优先读 **openhuman**。
- **学 agent workflow runtime / durable long-task ledger** → 重点读 **openhuman** 的 `flows`、`tinyflows`、`skill_runtime`、`session_db`、`agent_orchestration`。
- **学 GUI agent / computer-use runtime** → 优先读 **UI-TARS-desktop**。
- **学实时语音 / 数字人 / 媒体会话架构** → 优先读 **CyberVerse**。
- **学 agent-native design substrate / 多 runtime 设计工作台** → 优先读 **open-design**。
- **学 Agent-native 组织协作、签名事件与长期 ACP runtime** → 优先读 **Buzz**。

---

## 最终推荐

### 如果要采用

- 个人/小团队想快速跑 self-hosted agent workbench：先试 **openagent**。
- 想要 desktop personal AI / long-memory workspace：可以隔离试 **openhuman**，但不要跳过 GPL、managed backend、安全和工具权限评估。
- 想做 GUI automation：先看 **UI-TARS-desktop**，把它当 runtime/SDK 思路而不是通用助手平台。
- 想做实时 digital-human / voice-video agent：先试 **CyberVerse**，但务必先补默认安全口径。
- 想做 AI 设计工作台 / 设计 substrate：先看 **open-design**，但按平台底座方式评估，不要被“demo 很快跑起来”误导。
- 想让人、Agent、Git 与 workflow 共用协作空间：固定版本隔离试 **Buzz**，不要直接替换生产主干。

### 如果要学架构

六者都值得看，但不要混淆层级：

- **openagent** 教你怎么把 agent 能力产品化成 Web 管理台。
- **openhuman** 教你怎么做本地优先 personal AI OS：desktop lifecycle、RPC control plane、tool policy、Memory Tree、`flows` / `tinyflows` / `skill_runtime`、run ledger。
- **UI-TARS-desktop** 教你怎么做 GUI agent / desktop automation runtime。
- **CyberVerse** 教你怎么做实时语音 + WebRTC + 数字人 + 背景任务的复合 Agent 框架。
- **open-design** 教你怎么做 design substrate：runtime registry、file protocol、artifact preview/export、daemon↔web↔desktop 边界。
- **Buzz** 教你怎么把签名事件、tenant isolation、ACP process lifecycle、Git 和团队协作压进同一平台窄腰。

### 综合冠军

- **自托管助手后台冠军：openagent**
- **personal AI OS / 长期记忆平台冠军：openhuman**
- **GUI agent / computer-use runtime 冠军：UI-TARS-desktop**
- **实时 digital-human Agent 冠军：CyberVerse**
- **agent-native 设计平台冠军：open-design**
- **Agent-native 团队协作冠军：Buzz**
- **综合结论**：没有一个“全场景总冠军”；它们代表的是六种不同的 Agent 产品化方向。最正确的选型方法不是排总分，而是先认清你到底是在做 **self-hosted backend、personal AI OS、GUI runtime、digital-human framework、design substrate** 还是 **Agent-native team workspace**。
