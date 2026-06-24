# AI Coding Workflow 横评

> 分类：AI Coding Workflow / Agent Harness Workflow / Loop Operation Toolkit
> 项目：[superpowers](../reports/superpowers.md)、[compound-engineering-plugin](../reports/compound-engineering-plugin.md)、[ECC](../reports/ECC.md)、[vibecode-pro-max-kit](../reports/vibecode-pro-max-kit.md)、[loop-engineering](../reports/loop-engineering.md)
> 更新日期：2026-06-16

## 横评对象

| 项目 | 一句话 | Star（观测日） |
|------|--------|---------------|
| **superpowers** | 跨平台 Agentic 技能操作系统，用 Skills + bootstrap + hooks + adapters 在宿主会话启动时注入设计先行、TDD、工作树隔离、子代理审查和完成前验证 | 227,958（2026-06-15） |
| **compound-engineering-plugin** | 团队型 AI coding workflow 插件：Claude-compatible skills/agents 单一源码、多平台转换分发、多 persona review 与 brainstorm → plan → work → review → compound 复利闭环 | 21,460（2026-06-16） |
| **ECC** | 跨 Claude Code / Codex / Cursor / OpenCode 等 harness 的工作流操作系统：agents、skills、rules、hooks、MCP、installer、ECC2 alpha 控制面 | 207,220（2026-06-05） |
| **vibecode-pro-max-kit** | 面向 Claude Code 与 Codex 的 RIPER-5 规格驱动开发 harness：12 agents、31 skills、7 hooks、`process/` 项目记忆和一键安装器 | 860（2026-06-14） |
| **loop-engineering** | Practical loop engineering toolkit：patterns registry、starters 与 `loop-audit` / `loop-init` / `loop-cost`，把 AI coding agent 任务产品化为可持续运行的工程回路 | 262（2026-06-16） |

> 分层提醒：这五个项目同属 AI coding workflow 决策面，但不是完全同层。`superpowers` 偏单次任务行为纪律，`compound-engineering-plugin` 偏团队协作、多 Agent 审查与 workflow artifact 复利沉淀，`ECC` 偏 cross-harness substrate，`vibecode-pro-max-kit` 偏 spec-driven harness + 项目记忆，`loop-engineering` 偏 recurring loop operation / starter toolkit。

## 采用选型横评

| 维度 | superpowers | compound-engineering-plugin | ECC | vibecode-pro-max-kit | loop-engineering | 评价 |
|------|------------|-----------------------------|-----|----------------------|------------------|------|
| 功能覆盖度 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ECC 覆盖面最大；CE 覆盖 brainstorm/strategy/plan/work/debug/review/compound/pulse 的团队任务闭环；loop-engineering 聚焦 patterns/starters/audit/cost，不做 runtime / hook OS。 |
| 集成成本 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | superpowers 和 loop-engineering 最轻；CE 的 Claude/Cursor native install 较顺，但 Codex 需要 native plugin + Bun agents，且 skills/agents 心智成本较高；vibecode 依赖 Node 22+ 且会替换 `.claude`/`.codex`。 |
| 社区健康 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | loop-engineering 项目仅一周，star/fork 有早期传播但 contributors/adoption 样本少。 |
| 文档质量 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | CE 的 README、plugin README 与 SKILL.md 是 runtime contract 级文档；loop-engineering 的 primitives、safety、operating loops、patterns 文档非常清楚。 |
| 维护持续性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | loop-engineering dogfood 活跃，但长期维护还未被时间验证。 |
| 平台覆盖 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | loop-engineering 显式覆盖 Grok / Claude / Codex / GitHub Actions，但不是深平台 adapter。 |
| 安全/治理 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | CE 在 installer 层有 safe path guard、managed manifest、bounded config merge 与 hook ownership index；loop-engineering 对 L1/L2/L3、human gates、MCP scope、budget/kill switch 讲得清楚，但执行仍依赖用户环境。 |
| 上下文/副作用控制 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | CE workflow 文本多、安装会写宿主配置，需隔离 profile；loop-engineering 的 `STATE.md` / `LOOP.md` / budget / run-log 状态面好；`loop-init` 仍会写入目标项目文件，应先 dry-run。 |
| Recurring loop 运维能力 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | loop-engineering 是唯一把 cadence、readiness、token cap、run log、state 和 audit 作为主轴的项目。 |

### 采用建议

- **个人开发者 / 只想提升 coding agent 纪律：优先 superpowers**
  - 最轻、方法论清楚、心智负担最低。
  - 不需要理解复杂 installer、hooks、副作用边界。

- **团队技术负责人 / 需要多 Agent 审查和复利沉淀：优先 compound-engineering-plugin**
  - 更聚焦团队 workflow 闭环：brainstorm → plan → work → review → compound。
  - 多 persona review 和置信度门控比 vibecode 更成熟。

- **重度 agent operator / 想统一多 harness 工作流资产：推荐 ECC，但从 minimal/developer profile 开始**
  - ECC 的 manifest/profile/target/hook/security CI 更完整。
  - 适合长期做内部 agent workflow substrate。

- **想研究 spec-driven harness 与项目记忆结构：vibecode-pro-max-kit 值得 Node 22+ 隔离 PoC**
  - 最值得看的是 RIPER-5 phase agents、`process/` context/plan/report 结构、installer manifest、privacy/scout hooks。
  - 暂不建议直接 full install 到关键仓库；先在 Node 22+ throwaway repo 跑，修 Node preflight、settings preservation 与 CI/test 漂移后再考虑真实采用。

- **想把 recurring repo maintenance / triage / babysitting 做成 loop：优先 loop-engineering**
  - 它不是最强 workflow OS，但最直接回答“哪些任务适合循环跑、多久跑一次、状态放哪、如何控成本、什么时候交给人”。
  - 推荐先跑 L1 report-only，再逐步进入 L2 assisted fix；不建议直接 L3 unattended。

## 架构学习横评

| 维度 | superpowers | compound-engineering-plugin | ECC | vibecode-pro-max-kit | loop-engineering | 评价 |
|------|------------|-----------------------------|-----|----------------------|------------------|------|
| 设计模式深度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | CE 在 source plugin model + target adapter + managed install state + multi reviewer contract 上很有代表性；loop-engineering 在 pattern registry + loop state + budget/run-log + readiness audit 上很有代表性。 |
| 代码质量 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | loop-engineering 代码小、类型清楚、依赖少；但项目早期，映射仍有硬编码与重复源。 |
| 可借鉴度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | CE 的 managed plugin writer、多 agent review contract 和 compound artifact loop 可直接迁移到内部 agent workflow；loop-engineering 的 `STATE.md + LOOP.md + budget + run-log + audit` 也很可复用。 |
| 创新性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | CE 的创新在于把复利工程做成跨宿主可分发 workflow；loop-engineering 概念不复杂，但把 loop operation 产品化得很清楚。 |
| 综合学习价值 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 学行为 shaping 看 superpowers；学团队 review 看 CE；学 substrate 工程看 ECC；学项目记忆看 vibecode；学 recurring loop 运维看 loop-engineering。 |

### 架构学习建议

- **学习如何让 agent 遵守流程：看 superpowers**
  - Red Flags / CSO / TDD-for-docs 是方法论标杆。

- **学习多 agent 协作审查：看 compound-engineering-plugin**
  - 多 reviewer、置信度门控、合成去重、复利工程闭环。

- **学习 agent workflow 平台工程：看 ECC**
  - Manifest-driven selective install、profiles/components/targets、security-as-CI、hook governance、public/private boundary。

- **学习 spec-driven 项目记忆：看 vibecode-pro-max-kit**
  - `process/context/all-context.md` router。
  - `process/general-plans` + `process/features` 生命周期。
  - RIPER-5 phase agents 与 explicit transition gates。
  - privacy/scout/session/subagent hooks 如何把 prompt discipline 部分变成 runtime policy。
  - `vc-setup` 如何把首次接入做成 detect → ask → scaffold → study → validate。

- **学习 recurring agent loop 怎么运营化：看 loop-engineering**
  - `patterns/registry.yaml` 如何把 loop pattern 变成机器可读事实源。
  - `STATE.md` / `LOOP.md` / `loop-budget.md` / `loop-run-log.md` 如何组成 loop 状态面。
  - `loop-audit` 如何把 readiness 从主观判断变成 L0-L3 扫描规则。
  - `loop-cost` 如何把 cadence、early-exit、daily cap、realistic blend 变成预算讨论。
  - `loop-init` 如何一次性 scaffold pattern、skills、state、budget、run-log，而不只是复制 prompt。

## 总结推荐

| 场景 | 推荐 |
|------|------|
| 个人/小团队快速采用 | 🏆 **superpowers** — 最轻、最稳、心智成本最低。 |
| 团队多 Agent 审查与复利沉淀 | 🏆 **compound-engineering-plugin** — 更聚焦组织 workflow 闭环。 |
| 多 harness 统一工作流资产 | 🏆 **ECC** — 选择性安装、hooks、安全 CI、MCP、ECC2 control-plane 路线最完整。 |
| Founder/PM/vibecoder 想试 spec-driven 交付 | **vibecode-pro-max-kit** — 值得 Node 22+ 隔离 PoC，但生产 full install 先观望。 |
| Recurring repo maintenance / triage / PR babysitting | 🏆 **loop-engineering** — patterns、starters、readiness audit、成本与运行状态面最直接。 |
| 学习 agent 行为 shaping | 🏆 **superpowers** — Red Flags / CSO / TDD-for-docs 是标杆。 |
| 学习 agent workflow 平台工程 | 🏆 **ECC** — 最值得拆解 manifests、installer、hooks、validators、public/private boundary。 |
| 学习项目记忆与计划生命周期 | 🏆 **vibecode-pro-max-kit** — `process/` 结构和 RIPER-5 phase protocol 很有参考价值。 |
| 学习 recurring loop 运维 | 🏆 **loop-engineering** — L1/L2/L3、state、budget、run-log、human gate 组合最清楚。 |
| 综合冠军 | **看目标**：只想改善编码质量选 superpowers；想做内部 agent substrate 选 ECC；想做“AI coding 项目管理/记忆层”原型看 vibecode；想把维护任务周期化运营看 loop-engineering。 |

---

## 横评备注

- `loop-engineering` 不是 coding agent runtime，也不是厚重的 cross-harness workflow OS；它更像把 recurring AI coding tasks 做成 pattern、starter、audit 与 budget 工具的一套 loop operation toolkit。
- `loop-engineering` 与 `superpowers` 很互补：前者管“哪些事循环跑、如何运营”，后者管“agent 在单次任务中如何守纪律”。
- `loop-engineering` 与 `ECC` 的差别在重量级：ECC 是 substrate / OS，loop-engineering 是 lightweight pattern kit；团队如果已有内部平台，可直接借鉴 loop-engineering 的状态面和 readiness audit。
- `vibecode-pro-max-kit` 与 `loop-engineering` 都强调状态落盘，但前者关注 spec-driven delivery 的项目记忆，后者关注 recurring operations 的运行状态。
- `compound-engineering-plugin` 重新分析后更应视为“workflow + converter + managed installer”三位一体项目：采用价值在团队审查和知识复利，架构学习价值在 Claude-compatible source assets 如何安全分发到 Codex/OpenCode/Pi/Gemini/Kiro 等宿主。
- 采用 `compound-engineering-plugin` 前需额外核对安装源版本：2026-06-16 观测 GitHub latest release 为 `compound-engineering-v3.13.0`，npm `@every-env/compound-plugin` latest 查询仍为 `3.8.3`。
- 采用 loop-engineering 前必须先确认：不要直接开 L3 unattended；先 L1 report-only，补 verifier、worktree、budget、run-log、human gate、MCP scope，再逐步放权。
- vibecode-pro-max-kit 采用前必须验证 Node 22+：Node 20.19.2 下 `resolve-manifest.mjs` 只解析 7 个文件，`install.sh` 会先复制少量文件再退出失败，留下 0 个 agents / 5 个 skills 的半安装目录。
