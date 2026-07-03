# AI Coding Workflow 横评

> 分类：AI Coding Workflow / Agent Harness Workflow / Agent Role Roster / Loop Operation Toolkit
> 项目：[superpowers](../reports/superpowers.md)、[ponytail](../reports/ponytail.md)、[compound-engineering-plugin](../reports/compound-engineering-plugin.md)、[ECC](../reports/ECC.md)、[vibecode-pro-max-kit](../reports/vibecode-pro-max-kit.md)、[loop-engineering](../reports/loop-engineering.md)、[agency-agents](../reports/agency-agents.md)
> 更新日期：2026-07-03

## 横评对象

| 项目 | 一句话 | Star（观测日） |
|------|--------|---------------|
| **superpowers** | 跨平台 Agentic 技能操作系统，用 Skills + bootstrap + hooks + adapters 在宿主会话启动时注入设计先行、TDD、工作树隔离、子代理审查和完成前验证 | 227,958（2026-06-15） |
| **ponytail** | 跨宿主极简编码纪律插件：用 skills / hooks / AGENTS.md / plugin adapters 把 “YAGNI → 复用 → stdlib → native → 最小实现” 注入 agent，专门压制过度工程化 | 60,790（2026-06-27） |
| **Trellis** | 项目层 AI coding engineering framework：把 spec、task、workspace memory、四阶段工作流、跨平台 agent 配置和事件溯源 channel runtime 落到仓库与本地状态中 | 11,043（2026-06-24） |
| **compound-engineering-plugin** | 团队型 AI coding workflow 插件：Claude-compatible skills/agents 单一源码、多平台转换分发、多 persona review 与 brainstorm → plan → work → review → compound 复利闭环 | 21,460（2026-06-16） |
| **ECC** | 跨 Claude Code / Codex / Cursor / OpenCode 等 harness 的工作流操作系统：agents、skills、rules、hooks、MCP、installer、ECC2 alpha 控制面 | 207,220（2026-06-05） |
| **vibecode-pro-max-kit** | 面向 Claude Code 与 Codex 的 RIPER-5 规格驱动开发 harness：12 agents、31 skills、7 hooks、`process/` 项目记忆和一键安装器 | 860（2026-06-14） |
| **loop-engineering** | Practical loop engineering toolkit：patterns registry、starters 与 `loop-audit` / `loop-init` / `loop-cost`，把 AI coding agent 任务产品化为可持续运行的工程回路 | 262（2026-06-16） |
| **agency-agents** | 跨宿主 AI 专家角色库：233 个 Markdown agent、16 个 division、14 个工具安装目标、转换/安装脚本和 Hermes lazy-router plugin | 125,636（2026-07-03） |

> 分层提醒：这八个项目同属 AI coding workflow / agent harness asset 决策面，但不是完全同层。`ponytail` 是最窄的 anti-overengineering 行为层；`superpowers` 偏单次任务行为纪律，`Trellis` 偏项目级 spec/task/memory 与跨平台工作流 substrate，`compound-engineering-plugin` 偏团队协作、多 Agent 审查与 workflow artifact 复利沉淀，`ECC` 偏 cross-harness substrate，`vibecode-pro-max-kit` 偏 spec-driven harness + 项目记忆，`loop-engineering` 偏 recurring loop operation / starter toolkit，`agency-agents` 偏专家角色资产库与多宿主分发层。

## 采用选型横评

| 维度 | superpowers | ponytail | Trellis | compound-engineering-plugin | ECC | vibecode-pro-max-kit | loop-engineering | agency-agents | 评价 |
|------|------------|----------|---------|-----------------------------|-----|----------------------|------------------|---------------|------|
| 功能覆盖度 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Trellis 覆盖 spec/task/workspace memory/channel/mem 与多平台生成；ECC 覆盖面最大；CE 覆盖 brainstorm/strategy/plan/work/debug/review/compound/pulse 的团队任务闭环；ponytail 故意很窄，只管 “少写但正确”；loop-engineering 聚焦 patterns/starters/audit/cost，不做 runtime / hook OS；agency-agents 覆盖专家角色最广，但不是 workflow engine。 |
| 集成成本 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ponytail、superpowers 和 loop-engineering 最轻；ponytail 可退化成 AGENTS.md/rules 文件；Trellis 需要接受 `.trellis/`、任务工件、Python/Node 与平台配置写入；CE 的 Claude/Cursor native install 较顺，但 Codex 需要 native plugin + Bun agents；agency-agents 文件型宿主上手快，Hermes lazy-router 更轻，但全量 233 agents 不应盲装。 |
| 社区健康 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ponytail 爆发极快，star/PR/issue 活跃，但项目创建时间很短、backlog 高；Trellis 声量强、迭代快、npm 有真实下载，但项目很新且提交集中；loop-engineering 项目仅一周，star/fork 有早期传播但 contributors/adoption 样本少；agency-agents 热度极高，fork/衍生多，backlog 压力也高。 |
| 文档质量 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ponytail README、agent portability、benchmark caveat 写得很清楚；CE 的 README、plugin README 与 SKILL.md 是 runtime contract 级文档；Trellis README/docs 入口清楚，core/channel 深层设计主要靠源码；loop-engineering 的 primitives、safety、operating loops、patterns 文档非常清楚；agency-agents 文档完整但有 agent count / originality 目录漂移。 |
| 维护持续性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ponytail 迭代很快但新项目时间太短；Trellis 2026-06-24 当日仍有 CI 与 merge，维护活跃；loop-engineering dogfood 活跃，但长期维护还未被时间验证；agency-agents 2026-07 仍活跃合并，主维护者明显主导。 |
| 平台覆盖 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ponytail 覆盖 Claude/Codex/Copilot CLI/OpenCode/Pi/Hermes/Gemini/Cursor/Windsurf/Cline/Kiro 等，但不少是 instruction-tier；Trellis README 声称 16 AI coding platforms，CLI option 面很宽；loop-engineering 显式覆盖 Grok / Claude / Codex / GitHub Actions；agency-agents 覆盖 Claude/Codex/Gemini/Cursor/OpenCode/Qwen/Kimi/Hermes 等 14 个工具目标。 |
| 安全/治理 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ponytail 有 shell path allowlist、access check、soft-fail，但不是 hard policy；Trellis 的 template hash、manifest prune、migration/backup/scrubber 让 installer ownership 设计扎实；CE 在 installer 层有 safe path guard、managed manifest、bounded config merge 与 hook ownership index；loop-engineering 对 L1/L2/L3、human gates、MCP scope、budget/kill switch 讲得清楚；agency-agents 有 SECURITY、lint、single-source checks、originality check，但 install.sh 会写宿主目录，prompt 安全仍需人工审查。 |
| 上下文/副作用控制 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ponytail 只注入一套轻规则，副作用主要是 mode state/statusline；Trellis 通过 task/spec/context curated injection 控制上下文，但 `.trellis/` 与多平台 artifacts 有真实副作用；CE workflow 文本多、安装会写宿主配置，需隔离 profile；loop-engineering 的 `STATE.md` / `LOOP.md` / budget / run-log 状态面好；agency-agents 的 Hermes lazy-router 是亮点，其他宿主全量 per-agent 安装仍有文件/上下文膨胀。 |
| Recurring loop 运维能力 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ponytail 不解决 recurring loop；Trellis 有 task/journal/finish/spec promotion 和 channel worker primitives，但 recurring loop 运营不是主轴；loop-engineering 是唯一把 cadence、readiness、token cap、run log、state 和 audit 作为主轴的项目；agency-agents 的 NEXUS 是 playbook，不是持续运行 loop。 |

### 采用建议

- **个人开发者 / 只想让 agent 少写废代码：优先 ponytail**
  - 最窄、最轻、心智成本最低。
  - 适合日常小改、代码审查前 complexity pass、避免不必要依赖和抽象。
  - 默认用 `full`，不要把 `ultra` 当成砍安全/验证的借口。

- **个人开发者 / 只想提升完整 coding agent 纪律：优先 superpowers**
  - 最轻、方法论清楚、心智负担最低。
  - 不需要理解复杂 installer、hooks、副作用边界。

- **团队/高频 AI coding 项目 / 需要项目记忆与任务底座：优先 Trellis**
  - 更适合把 specs、tasks、workspace journals 和四阶段 workflow 固化到仓库。
  - 对多平台团队有价值：同一项目层 substrate 服务 Claude Code、Codex、Cursor、OpenCode、Pi 等宿主。
  - 商业生产化前必须先评估 AGPL-3.0-only 与 `.trellis/` 工作流迁移成本。

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

- **想要多领域专家角色池 / AI agency persona library：优先 agency-agents**
  - 价值在 233 个跨 division 专家角色、14 个宿主目标、转换/安装脚本和 Hermes lazy-router。
  - 推荐按需安装：Hermes 用 router，团队用 fork + approved agents-file；不要把全量 agents 默认塞进所有宿主。

## 架构学习横评

| 维度 | superpowers | ponytail | Trellis | compound-engineering-plugin | ECC | vibecode-pro-max-kit | loop-engineering | agency-agents | 评价 |
|------|------------|----------|---------|-----------------------------|-----|----------------------|------------------|---------------|------|
| 设计模式深度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ponytail 在 “single skill source + mode resolver + thin adapters + soft-fail injection” 上很干净；Trellis 在 task artifact、template ownership、migration、event-sourced channel、mem adapter 上很有代表性；CE 在 source plugin model + target adapter + managed install state + multi reviewer contract 上很有代表性；loop-engineering 在 pattern registry + loop state + budget/run-log + readiness audit 上很有代表性；agency-agents 在 prompt asset library 产品化、single-source registry、Hermes lazy-router 上值得拆。 |
| 代码质量 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ponytail 代码小、依赖少、测试覆盖 adapter 契约；但 JS 无类型系统，Hermes process-global mode 有隔离风险；Trellis core 分层扎实、installer 安全性设计较强，但 CLI init/update 文件偏大且平台矩阵仍在快速堆叠；loop-engineering 代码小、类型清楚、依赖少；agency-agents 脚本清楚但 Shell 文件大，originality 目录列表有漂移。 |
| 可借鉴度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ponytail 的 behavior-as-distribution、mode-filtered skill、rule drift checks 可直接借鉴；Trellis 的 `.trellis` project memory、task schema、channel events、template hash/migration 可以直接借鉴到内部 agent substrate；CE 的 managed plugin writer、多 agent review contract 和 compound artifact loop 可迁移；loop-engineering 的 `STATE.md + LOOP.md + budget + run-log + audit` 可复用；agency-agents 的 `tools.json` / `divisions.json` / converter / installer / Hermes lazy-router / duplicate detector 也可直接复用。 |
| 创新性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ponytail 概念不复杂，但把 anti-overengineering 做成跨宿主产品，传播和工程化都很强；Trellis 的创新在于把 repo-native project memory/task lifecycle 和跨宿主配置结合；CE 的创新在于把复利工程做成跨宿主可分发 workflow；loop-engineering 概念不复杂，但把 loop operation 产品化得很清楚；agency-agents 不是 runtime 创新，但把大规模专家角色库跨宿主产品化做得完整。 |
| 综合学习价值 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 学行为 shaping 看 superpowers；学 anti-overengineering 产品化看 ponytail；学项目级 agent memory/task substrate 看 Trellis；学团队 review 看 CE；学 substrate 工程看 ECC；学项目记忆看 vibecode；学 recurring loop 运维看 loop-engineering；学角色库/agent marketplace 看 agency-agents。 |

### 架构学习建议

- **学习如何让 agent 遵守流程：看 superpowers**
  - Red Flags / CSO / TDD-for-docs 是方法论标杆。

- **学习如何把“少写代码”做成跨平台产品：看 ponytail**
  - `skills/ponytail/SKILL.md` 是行为本体。
  - `hooks/ponytail-instructions.js` 是规则文本 → 注入上下文的数据面。
  - `hooks/ponytail-config.js` / `ponytail-runtime.js` 是 mode/state/control plane。
  - `__init__.py`、`.opencode/plugins/ponytail.mjs`、`pi-extension/index.js` 展示 thin adapter 模式。

- **学习项目级 agent memory / task substrate：看 Trellis**
  - `.trellis/spec`、`.trellis/tasks`、`.trellis/workspace` 如何把上下文、任务和学习变成 repo-native 工件。
  - template hash / manifest prune / migration manifests 如何治理安装器 ownership 和升级副作用。
  - `task/channel/mem` core primitives 如何把 task schema、event-sourced worker coordination 和宿主 session memory reader 分层。

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

- **学习大规模专家角色库如何分发：看 agency-agents**
  - `Frontmatter Agent Corpus + tools/divisions registry + deterministic converters + installer selection + Hermes lazy-router` 是最小可复刻内核。
  - `tools.json` 的 `installKind` 把 per-agent、roster、plugin 三类宿主安装机制显式化。
  - `agency-agents-router` 展示了大角色库在 Hermes 这类 prompt-cache-sensitive 宿主中的正确姿势：搜索/读取/委派，而不是全量注入。

## 总结推荐

| 场景 | 推荐 |
|------|------|
| 个人/小团队只想减少 agent 过度工程 | 🏆 **ponytail** — 最窄、最轻、直接压缩无用代码和依赖。 |
| 个人/小团队快速提升完整 coding discipline | 🏆 **superpowers** — 最轻、最稳、工程流程覆盖更完整。 |
| 团队项目记忆与任务底座 | 🏆 **Trellis** — 把 specs、tasks、workspace memory、四阶段 workflow 和多平台配置落成 repo-native substrate。 |
| 团队多 Agent 审查与复利沉淀 | 🏆 **compound-engineering-plugin** — 更聚焦组织 workflow 闭环。 |
| 多 harness 统一工作流资产 | 🏆 **ECC** — 选择性安装、hooks、安全 CI、MCP、ECC2 control-plane 路线最完整。 |
| Founder/PM/vibecoder 想试 spec-driven 交付 | **vibecode-pro-max-kit** — 值得 Node 22+ 隔离 PoC，但生产 full install 先观望。 |
| Recurring repo maintenance / triage / PR babysitting | 🏆 **loop-engineering** — patterns、starters、readiness audit、成本与运行状态面最直接。 |
| 多领域专家角色池 / AI agency persona library | 🏆 **agency-agents** — 覆盖面最大，Hermes lazy-router 设计好；必须按需装、先审查。 |
| 学习 agent 行为 shaping | 🏆 **superpowers** — Red Flags / CSO / TDD-for-docs 是标杆。 |
| 学习 anti-overengineering skill 产品化 | 🏆 **ponytail** — mode resolver、thin adapters、soft-fail injection、benchmark honesty loop 很值得拆。 |
| 学习项目级 agent memory / task substrate | 🏆 **Trellis** — `.trellis` specs/tasks/workspace、task schema、channel events、mem adapters 和 template ownership 很值得拆。 |
| 学习 agent workflow 平台工程 | 🏆 **ECC** — 最值得拆解 manifests、installer、hooks、validators、public/private boundary。 |
| 学习项目记忆与计划生命周期 | 🏆 **vibecode-pro-max-kit** — `process/` 结构和 RIPER-5 phase protocol 很有参考价值。 |
| 学习 recurring loop 运维 | 🏆 **loop-engineering** — L1/L2/L3、state、budget、run-log、human gate 组合最清楚。 |
| 学习 prompt asset library 产品化 | 🏆 **agency-agents** — registry/converter/installer/CI/router 组合最完整。 |
| 综合冠军 | **看目标**：只想少写废代码选 ponytail；想改善完整编码质量选 superpowers；想做内部 agent substrate 选 ECC；想做“AI coding 项目管理/记忆层”原型看 vibecode；想把维护任务周期化运营看 loop-engineering；想要专家角色池选 agency-agents。 |

---

## 横评备注

- `ponytail` 和 `superpowers` 很互补：前者是 anti-overengineering 微纪律，后者是完整工程流程纪律。可以一起用，但要注意上下文注入和 style/verbosity 插件冲突。
- `ponytail` 不是 hard policy engine；validation、security、accessibility、data-loss error handling 不能因为 “lazy” 被砍掉。
- `ponytail` 的 benchmark 适合看方向：在 over-build trap 上收益大，在已经 minimal 的任务收益接近零；真实 agent session cost 可能受工具调用和重复注入影响。
- `loop-engineering` 不是 coding agent runtime，也不是厚重的 cross-harness workflow OS；它更像把 recurring AI coding tasks 做成 pattern、starter、audit 与 budget 工具的一套 loop operation toolkit。
- `loop-engineering` 与 `superpowers` 很互补：前者管“哪些事循环跑、如何运营”，后者管“agent 在单次任务中如何守纪律”。
- `loop-engineering` 与 `ECC` 的差别在重量级：ECC 是 substrate / OS，loop-engineering 是 lightweight pattern kit；团队如果已有内部平台，可直接借鉴 loop-engineering 的状态面和 readiness audit。
- `vibecode-pro-max-kit` 与 `loop-engineering` 都强调状态落盘，但前者关注 spec-driven delivery 的项目记忆，后者关注 recurring operations 的运行状态。
- `compound-engineering-plugin` 重新分析后更应视为“workflow + converter + managed installer”三位一体项目：采用价值在团队审查和知识复利，架构学习价值在 Claude-compatible source assets 如何安全分发到 Codex/OpenCode/Pi/Gemini/Kiro 等宿主。
- `Trellis` 更应视为“项目级 AI coding substrate”而不是单个 agent runtime：采用价值在 repo-native specs/tasks/workspace memory 与多平台配置复用，架构学习价值在 task schema、event-sourced channel、mem adapters、template ownership 和 migration system。采用前需评估 AGPL-3.0-only 与 `.trellis/` 流程迁移成本。
- 采用 `compound-engineering-plugin` 前需额外核对安装源版本：2026-06-16 观测 GitHub latest release 为 `compound-engineering-v3.13.0`，npm `@every-env/compound-plugin` latest 查询仍为 `3.8.3`。
- 采用 loop-engineering 前必须先确认：不要直接开 L3 unattended；先 L1 report-only，补 verifier、worktree、budget、run-log、human gate、MCP scope，再逐步放权。
- vibecode-pro-max-kit 采用前必须验证 Node 22+：Node 20.19.2 下 `resolve-manifest.mjs` 只解析 7 个文件，`install.sh` 会先复制少量文件再退出失败，留下 0 个 agents / 5 个 skills 的半安装目录。
- `agency-agents` 不应被误解成 coding agent runtime。它不拥有 LLM loop、tool settlement、session store 或权限沙箱；这些都由宿主负责。
- `agency-agents` 与 `superpowers` 可以互补：前者负责“专家是谁”，后者负责“工作流程怎么守纪律”。
- 对 Hermes 用户，`agency-agents-router` 是最推荐的采用方式：固定 4 个工具，完整 roster 存磁盘，按需 search/load/delegate；不要把 233 个 agents 全量塞进 `skills.external_dirs`。
- 采用 agency-agents 前要额外检查：README agent count 是否已更新、`check-agent-originality.sh` 是否补齐 GIS/Security、是否需要 fork 内部 allowlist。
