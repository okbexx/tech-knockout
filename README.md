# Technical Knockout

> 开源项目技术选型与底层架构拆解库。<br>
> 判断项目是否值得采用，也拆出它为什么能成立、哪些架构能力值得复刻。

Technical Knockout（TK）面向正在做技术选型、架构学习和 AI Agent 上下文构建的开发者。这里的报告不只复述 README，也不只看 Star 数，而是基于源码、文档、Issue/PR、Release、测试和生态信号，形成可复用的技术研究资产。

## TK 解决什么问题

普通项目推荐通常停在：这个项目做什么、怎么安装、Star 多少、README 写了什么。

TK 更关注：

- **能不能用**：适合个人、小团队、企业生产化，还是应该观望。
- **为什么能工作**：核心抽象、控制面 / 数据面、执行链路、状态模型和契约边界。
- **怎么复刻能力**：如果重写一个同类系统，哪些架构设计不变量必须保留。
- **和谁比较**：同类横评、邻近替代、架构邻居和真实风险。
- **如何喂给 Agent**：结构化报告可作为 AI coding agent / research agent 的高质量项目上下文。

## 适合谁读

- 技术负责人：快速判断开源项目是否适合引入。
- 独立开发者：从真实项目中提炼可复用架构模式。
- AI Agent 使用者：为 agent 提供可信、结构化的项目背景。
- 开源贡献者：寻找值得贡献、维护或二次构建的项目。
- 架构学习者：通过真实代码学习系统设计，而不是只看概念文章。

## 如何使用这个仓库

- 想快速选型：从下方 **Project Index** 或 [`comparisons/`](./comparisons/) 进入。
- 想学习架构：读单项目报告里的“底层技术架构”“关键执行链路”“可复刻设计不变量”。
- 想让 Agent 使用 TK：运行 `npx @jarl_okbe/tk codex install` 安装 Codex 插件，使用其中的 Skills、CLI 和 MCP 服务。
- 想给其它用户安装 TK Codex 插件：读 [`docs/install-codex-plugin.md`](./docs/install-codex-plugin.md)。
- 想同步报告对应源码：运行 `npx @jarl_okbe/tk source sync --missing`。
- 想让 Agent 读取某个项目当前源码：运行 `npx @jarl_okbe/tk source path <project> --json` 获取本地源码路径。
- 想复用方法论：读 [`METHODOLOGY.md`](./METHODOLOGY.md)。
- 想提交新项目或修正报告：读 [`CONTRIBUTING.md`](./CONTRIBUTING.md)。
- 想让 AI Agent 参与维护：读 [`AGENTS.md`](./AGENTS.md)。

## Agent Product

TK 提供面向 agent 的完整产品形态：

- **npm package**：`packages/tk` 发布为 `@jarl_okbe/tk`，提供 CLI、MCP server、core、schemas 和报告快照。
- **Codex plugin adapter**：`plugins/technical-knockout` 提供 Codex manifest、Skills 和 MCP 启动配置。

- **Skills**：告诉 agent 何时使用 TK、如何做 reference discovery、build-vs-buy、架构学习和报告维护。
- **CLI**：提供确定性的本地操作面，覆盖 catalog、source cache、doctor、search、inspect。
- **MCP**：提供 read-mostly 的结构化上下文查询工具。
- **Catalog / lock**：把 Markdown 报告转成机器可读事实，避免 agent 每次临时解析报告格式。

常用命令：

```bash
npx @jarl_okbe/tk doctor
npx @jarl_okbe/tk codex install
npx @jarl_okbe/tk search "coding agent runtime" --json
npx @jarl_okbe/tk source status --json
npx @jarl_okbe/tk source sync --missing
npx @jarl_okbe/tk source path gitnexus --json
npm run verify
```

完整产品结构见 [`docs/tk-agent-plugin-architecture.md`](./docs/tk-agent-plugin-architecture.md)。
安装指南见 [`docs/install-codex-plugin.md`](./docs/install-codex-plugin.md)。

## Featured Reports

- [jcode](./reports/jcode.md) — Rust terminal Coding Agent runtime：server-owned live session + Swarm + Graph Memory。
- [OpenCode](./reports/opencode.md) — 开源 Coding Agent runtime：durable session + event/projection + tool settlement。
- [Agent Reach](./reports/agent-reach.md) — Agent Internet Capability Layer：给 AI Agent 装互联网读取与搜索能力。
- [Tolaria](./reports/tolaria.md) — AI-native PKM：local-first / Git-first Markdown 知识库桌面应用。
- [CodeGraph](./reports/codegraph.md) — Code Intelligence：本地代码图谱 + MCP Server。
- [Understand-Anything](./reports/Understand-Anything.md) — Agent-native 代码理解工作流。
- [RAGFlow](./reports/ragflow.md) — Enterprise RAG：DeepDoc + 混合检索 + 引用溯源。
- [LightRAG](./reports/LightRAG.md) — GraphRAG 检索内核。

## Comparisons

- [Coding Agents](./comparisons/coding-agents.md)
- [AI Coding Workflow](./comparisons/ai-coding-workflow.md)
- [Code Intelligence](./comparisons/code-intelligence.md)
- [Agent Platforms](./comparisons/agent-platforms.md)
- [Enterprise Knowledge Base / RAG](./comparisons/enterprise-knowledge-base-rag.md)

## Project Index

### AI Coding / Agent Workflow

| Project | What it is | Adopt? | Architecture value | Date |
|---|---|---|---|---|
| [jcode](./reports/jcode.md) | Rust terminal Coding Agent runtime：server-owned live session + Swarm + Graph Memory | 推荐个人隔离试用 / 团队生产化前观望 | ⭐⭐⭐⭐⭐ | 2026-06-15 |
| [pi-mono](./reports/pi-mono.md) | TypeScript Agent 工具箱：Coding Agent CLI + SDK + 25+ Provider | 推荐采用 | ⭐⭐⭐⭐⭐ | 2026-05-01 |
| [OpenCode](./reports/opencode.md) | 开源 Coding Agent runtime：durable session + event/projection + tool settlement | 推荐采用（个人/高级开发者）/ 团队生产化前隔离 PoC | ⭐⭐⭐⭐⭐ | 2026-06-14 |
| [superpowers](./reports/superpowers.md) | 跨平台 Agentic 技能操作系统：Skills + bootstrap + hooks + adapters 注入开发纪律 | 推荐采用（个人/小团队）/ 团队生产化前试点 | ⭐⭐⭐⭐⭐ | 2026-06-15 |
| [ponytail](./reports/ponytail.md) | 跨宿主极简编码纪律插件：以 skills / hooks / AGENTS.md / plugin adapters 把“少写代码但不减安全”的 lazy senior dev ladder 注入 Claude Code、Codex、OpenCode、Hermes 等 agent harness | 推荐采用（个人/小团队）/ 团队标准化前隔离试点 | ⭐⭐⭐⭐⭐ | 2026-06-27 |
| [Trellis](./reports/Trellis.md) | 项目层 AI coding engineering framework：把 spec、task、workspace memory、四阶段工作流、跨平台 agent 配置和事件溯源 channel runtime 落到仓库与本地状态中 | 推荐采用（团队/高频 AI coding 项目的项目记忆与任务底座）/ 商业生产化前评估 AGPL 与流程迁移成本 | ⭐⭐⭐⭐⭐ | 2026-06-24 |
| [compound-engineering-plugin](./reports/compound-engineering-plugin.md) | 团队型 AI coding workflow 插件：Claude-compatible skills/agents 单一源码、多平台转换分发、多 persona review 与 brainstorm → plan → work → review → compound 复利闭环 | 推荐采用（团队多 Agent 审查与复利沉淀）/ 企业生产化前隔离试点 | ⭐⭐⭐⭐⭐ | 2026-06-16 |
| [ECC](./reports/ECC.md) | 跨 Claude Code / Codex / Cursor / OpenCode 的 workflow 操作系统 | 推荐采用（profile/skill/hooks）/ 观望（ECC2） | ⭐⭐⭐⭐⭐ | 2026-06-05 |
| [vibecode-pro-max-kit](./reports/vibecode-pro-max-kit.md) | 面向 Claude Code 与 Codex 的 RIPER-5 规格驱动开发 harness | 观望（生产 full install）/ 推荐 Node 22+ 隔离 PoC 与架构学习 | ⭐⭐⭐⭐⭐ | 2026-06-14 |
| [loop-engineering](./reports/loop-engineering.md) | Practical loop engineering toolkit：patterns registry、starters 与 loop-audit / loop-init / loop-cost，帮助把 AI coding agent 任务产品化为可持续运行的工程回路 | 推荐采用（个人/小团队 loop 试点）/ 团队生产化前受控推广 | ⭐⭐⭐⭐⭐ | 2026-06-16 |
| [last30days-skill](./reports/last30days-skill.md) | 跨 Reddit、X、YouTube、HN、Polymarket、GitHub、Web 的实时社会信号研究 Skill | 推荐采用（个人/小团队）/ 企业生产化前观望 | ⭐⭐⭐⭐⭐ | 2026-06-11 |
| [Agent Reach](./reports/agent-reach.md) | 给 AI Agent 装互联网读取与搜索能力的本地能力层 | 推荐采用（个人/小团队）/ 企业生产化前观望 | ⭐⭐⭐⭐⭐ | 2026-06-16 |

### Code Intelligence / RAG / Knowledge

| Project | What it is | Adopt? | Architecture value | Date |
|---|---|---|---|---|
| [GitNexus](./reports/GitNexus.md) | 纯客户端知识图谱引擎，通过 MCP 让 AI Agent 获得代码库感知 | 观望（个人）/ 不推荐（企业免费） | ⭐⭐⭐⭐⭐ | 2026-05-01 |
| [gitingest](./reports/gitingest.md) | 一键将 Git 仓库转换为 LLM-friendly 文本摘要 | 推荐采用 | ⭐⭐⭐⭐ | 2026-05-02 |
| [CodeGraph](./reports/codegraph.md) | MIT 本地代码图谱 + MCP Server，用 SQLite/FTS5 和 tree-sitter 降低 Agent 探索成本 | 推荐采用（个人/小团队）/ 企业标准化前观望 | ⭐⭐⭐⭐⭐ | 2026-05-21 |
| [Understand-Anything](./reports/Understand-Anything.md) | Agent-native 代码理解工作流包：多平台 Skills + 确定性扫描/合并 + LLM 语义图谱 + dashboard/chat/diff/onboard | 推荐试用（个人/小团队）/ 企业标准化前受控 PoC | ⭐⭐⭐⭐⭐ | 2026-06-15 |
| [AIHub](./reports/AIHub.md) | Chrome 扩展采集多平台 AI 对话，本地构建 AI 对话知识资产库 | 观望（个人 PoC 可试） | ⭐⭐⭐⭐ | 2026-05-31 |
| [RAGFlow](./reports/ragflow.md) | DeepDoc + 模板化 chunking + 混合检索 + 引用溯源的企业级 RAG 平台 | 推荐采用（企业 SOP/复杂文档 RAG） | ⭐⭐⭐⭐⭐ | 2026-06-11 |
| [LightRAG](./reports/LightRAG.md) | 四存储层可插拔、实体关系抽取、多模式 GraphRAG 检索内核 | 推荐采用（图谱增强检索 PoC/内核） | ⭐⭐⭐⭐⭐ | 2026-06-11 |
| [Tolaria](./reports/tolaria.md) | Tauri + React + Rust 的 local-first / Git-first Markdown 知识库桌面应用 | 推荐采用（个人/开发者/小团队 PoC）/ 企业生产化前观望 | ⭐⭐⭐⭐⭐ | 2026-06-13 |

### Agent Platform / Desktop / Design

| Project | What it is | Adopt? | Architecture value | Date |
|---|---|---|---|---|
| [UI-TARS-desktop](./reports/UI-TARS-desktop.md) | ByteDance Multimodal AI Agent Stack：UI-TARS Desktop + GUIAgent SDK + Operator/browser/remote runtime | 生产采用观望 / 推荐 GUI Agent PoC 与架构学习 | ⭐⭐⭐⭐⭐ | 2026-06-17 |
| [openhuman](./reports/openhuman.md) | Rust/Tauri 本地优先 personal AI OS：Memory Tree + tools + workflow runtime + 多 Agent 编排 | 观望（隔离试用 / 架构学习 / 外围维护） | ⭐⭐⭐⭐⭐ | 2026-06-15 |
| [openagent](./reports/openagent.md) | Go + React 自托管个人 AI 助手平台 | 观望（个人/小团队 PoC 可试） | ⭐⭐⭐⭐⭐ | 2026-05-20 |
| [CyberVerse](./reports/CyberVerse.md) | Go + Python + Vue 的实时音视频数字人 Agent 平台 | 观望（PoC/学习推荐） | ⭐⭐⭐⭐⭐ | 2026-05-20 |
| [open-design](./reports/open-design.md) | 本地优先的开源 Claude Design 替代 | 观望（生产）/ 推荐学习与 PoC | ⭐⭐⭐⭐⭐ | 2026-05-20 |

### Tools / Infrastructure / Distribution

| Project | What it is | Adopt? | Architecture value | Date |
|---|---|---|---|---|
| [macshot](./reports/macshot.md) | macOS 原生截图与录屏标注工具 | 推荐采用 | ⭐⭐⭐⭐⭐ | 2026-05-06 |
| [1Shell](./reports/1Shell.md) | WebSSH + 多 VPS 运维中枢 + Remote MCP Server | 观望（个人/小团队 PoC 可试） | ⭐⭐⭐⭐⭐ | 2026-06-10 |
| [CLI-Anything](./reports/CLI-Anything.md) | Agent-native CLI 方法论、CLI-Hub 注册表与 Matrix 多工具工作流层 | 观望（生产）/ 推荐学习与受控 PoC | ⭐⭐⭐⭐⭐ | 2026-06-15 |
| [CodexDesktop-Rebuild](./reports/CodexDesktop-Rebuild.md) | 将官方仅 macOS 的 Codex Desktop 重新打包为跨平台安装包 | 不推荐（生产）/ 观望（尝鲜） | ⭐⭐⭐⭐ | 2026-05-09 |

## Methodology in one screen

每份正式 TK 报告遵循五层分析：

1. **定位与画像** — 解决什么问题，目标用户，类比，基础指标。
2. **架构解剖** — 目录结构、技术栈、核心架构图、扩展机制、底层技术架构。
3. **质量与成熟度** — 代码质量、测试、CI/CD、文档、Issue/PR 健康度。
4. **社区与生态** — 社区评价、衍生项目、竞品与生态位。
5. **选型决策** — 采用建议、风险评估、架构学习价值和评分。

TK 的差异化重点是 **底层技术架构**：最小架构内核、核心抽象、控制面 / 数据面、执行链路、状态模型、契约边界、失败降级和可复刻设计不变量。完整说明见 [`METHODOLOGY.md`](./METHODOLOGY.md)。

## Freshness and limitations

TK 报告是基于分析当日源码、文档、Issue/PR、Release 和社区状态形成的快照。Star、Fork、Issue、API、许可证和项目成熟度都可能随时间变化。

做生产选型前，请结合报告日期重新核验项目当前状态。TK 是独立分析项目；除非特别说明，TK 与被分析项目没有官方隶属、背书或赞助关系。

## License

- 报告、横评和文字分析：Creative Commons Attribution 4.0 International（CC BY 4.0）。
- 模板、脚本、示例代码和 spike：MIT License。

详情见 [`LICENSE`](./LICENSE)。
