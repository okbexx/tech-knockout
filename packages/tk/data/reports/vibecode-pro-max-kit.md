# vibecode-pro-max-kit

> 一句话定位：**vibecode-pro-max-kit 是一套面向 Claude Code 与 Codex 的 RIPER-5 规格驱动开发 harness / workflow substrate：它不实现自己的 coding agent runtime，而是把 phase agents、skills、hooks、`process/` 项目记忆和安装器打包成可复制到项目里的 spec-driven 交付底座。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `withkynam/vibecode-pro-max-kit` |
| URL | `https://github.com/withkynam/vibecode-pro-max-kit` |
| Star | 860（2026-06-14 观测） |
| Fork | 198 |
| 许可证 | MIT |
| 主要语言 | JavaScript / Markdown；另有 Python、HTML、Shell、YAML、TOML |
| GitHub created_at | 2026-05-27 |
| 首次提交 | 2026-05-27（`Initial release v1.0.0`） |
| 最近提交 | 2026-06-02（`Release v2.4.2`） |
| 最新 Git tag / GitHub Release | `v2.4.2`（2026-06-02） |
| manifest version | `2.4.1`（HEAD 与最新 tag 内仍为此值） |
| 贡献者数 | GitHub contributors API 返回 1；本地 git shortlog 显示同一作者多种身份口径 |
| Open issues / PRs | open issues 16，open PRs 2；GitHub repo `open_issues_count=18` 含 PR |
| 分析日期 | 2026-06-14 |
| 分类 | AI Coding Workflow / Agent Harness System |

---

## 场景一：是否值得采用

### 解决的问题

vibecode-pro-max-kit 要解决的不是“再造一个 AI 编程工具”，而是给现有 AI coding 工具补一层**项目级流程纪律、长期记忆和运行时护栏**：

- Agent 不先研究就直接改代码；
- 大任务按 RESEARCH → INNOVATE → PLAN → EXECUTE → UPDATE PROCESS 显式分阶段推进；
- 计划、上下文、验证、报告和 feature 历史写入 `process/`，避免上下文压缩或新会话导致状态丢失；
- Claude Code 与 Codex 共享一套 agent / skill / process 结构；
- hooks 负责 session 初始化、subagent context 注入、隐私文件阻断、依赖目录大范围扫描阻断、状态持久化与编辑后提醒。

目标用户很明确：

- 高频使用 Claude Code / Codex 的个人开发者；
- 用 AI coding 做原型的 founder / PM / designer；
- 想把“vibe coding”升级为 spec-driven delivery 的小团队；
- 想研究 agent workflow harness 如何产品化的人。

### 核心能力与边界

**能做什么：**

- 一键安装 harness 到目标项目：`.claude/`、`.codex/`、`.agents/skills` symlink、`CLAUDE.md`、`AGENTS.md`、`process/development-protocols/`、`process/_seeds/`。
- 提供 12 个 phase / specialist agent：research、innovate、plan、execute、fast mode、update process、debugger、tester、code reviewer、code simplifier、UI/UX designer、git manager。
- 提供 31 个 tracked skills，覆盖 setup、plan/context 生成、audit、debug、security、preview、web testing、MCP management、docs seeking、team orchestration、tech graph 等。
- 提供 Claude / Codex hook surface：session-init、subagent-init、privacy-block、scout-block、session-state、descriptive-name、post-edit-simplify-reminder。
- 用 `vc-manifest.json` + `resolve-manifest.mjs` 声明和解析可分发资产边界。
- 将 `process/` 设计成 durable project memory：general plans、feature folders、context groups、development protocols、seed templates。

**不能做什么：**

- 不是独立 coding agent runtime：没有模型 provider、agent loop、工具编排器、IDE UI 或服务端 API；必须依赖 Claude Code / Codex / 兼容宿主。
- 不能把“支持多工具”理解为多工具同等 runtime parity。源码 first-class surface 主要是 Claude 与 Codex；其他宿主更多依赖 `AGENTS.md` / `SKILL.md` 语义兼容。
- 不提供确定性 code index / retrieval runtime。`vc-setup` 要求 agent 扫描代码并生成 `process/context/all-context.md`，本质是 agent-driven onboarding，而不是可重复索引引擎。
- 不能保证一键安装对已有项目无损。`install.sh` 会备份并删除 `.claude/`、`.codex/`、`.agents/`，再复制 kit 文件；`.claude/settings.json` 的 merge/preserve 语义因 clean-slate 删除而失效。
- 不能把 phase lock 当作绝对 sandbox。很多约束是 prompt、skill、hook 和宿主能力共同实现；不同宿主 enforcement 强度不同。

### 集成成本与安装风险

- **依赖链：** `resolve-manifest.mjs` 明确要求 Node >= 22；但 `install.sh` 只检查 `node` 是否存在，没有检查版本。
- **关键实测：** 在 Node 20.19.2 环境下，`node resolve-manifest.mjs --json` 只解析出 7 个文件；`install.sh` 会先复制这 7 个文件，随后在统计 agents 阶段退出 2，留下 0 个 agents、5 个 skills 的半安装目录。这是一个真实的 partial install / late-fail 风险。
- **Node 22 对照：** `npx node@22 resolve-manifest.mjs --json` 能解析出 500 个 managed files、43 个 kitOnly files、1 个 merge entry、1 个 symlink。
- **安装方式：** README 主路径是 `curl ... | bash` 类型的一键安装；由于 hooks 和配置会进入目标项目，生产使用前应先下载审计，不建议盲目管道执行。
- **对已有项目影响：** 安装会替换 `.claude/`、`.codex/`、`.agents/`、`CLAUDE.md`、`AGENTS.md`；`process/` 目录被设计为保留，但 agent tooling 目录会被重建。
- **学习曲线：** 中高。RIPER-5、phase agents、skills、hooks、process folders、feature folders、context groups 都需要理解。
- **从零到 demo：** Node 22 + throwaway repo 中可快速 PoC；真实项目接入前应先审 `install.sh`、`vc-manifest.json`、hooks 与目标项目现有 `.claude/.codex` 内容。


### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键库 / SDK。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| _待补关键依赖_ | | | | | | |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | 低 | 根仓库 MIT；商用友好。深度商用前仍建议抽查被借鉴 skill / hook 的来源许可。 |
| Bus factor | 高 | GitHub contributors API 当前只有 1 人；项目早期，方向和质量高度依赖作者。 |
| 供应商锁定 | 中 | 文本资产可迁移，但最佳运行路径依赖 Claude Code / Codex 的 agent、skill、hook 行为。 |
| 安装副作用 | 高 | 一键安装会替换核心 agent tooling 目录；缺少 profile / dry-run / install plan。 |
| Node 版本风险 | 高 | Node 20 下 installer 会复制少量文件后 late-fail，留下半安装目录；必须使用 Node 22+ 并验证 manifest 解析数量。 |
| 安全攻击面 | 中 | hooks 进入工具执行链；privacy/scout/session-state 有价值，但也是实际执行面。 |
| CI / release 健康 | 中高 | 最近 Release Kit 多次 failure；Validate Kit PR run 为 `action_required`；Welcome workflow 也有 failure。 |
| 文档漂移 | 中 | README 与实际 assets、validator、Node 版本、install preservation 语义存在漂移。 |
| 社区成熟度 | 中高风险 | Star/fork 增长快，但项目创建时间短，真实用户 issue/PR 证据不足。 |

### 采用结论

**观望（生产 full install） / 推荐隔离 PoC 与架构学习。**

正确采用方式不是直接把它装进关键仓库，而是：

1. 在 throwaway repo 中用 Node 22+ 运行安装与 `vc-setup`；
2. 先确认 `resolve-manifest.mjs --json` 输出接近 500 个 managed files，而不是 7 个；
3. 审计 `install.sh`、`vc-manifest.json`、`.claude/settings.json`、`.claude/hooks/*`、`.codex/hooks/*`；
4. 真实项目中优先手动 cherry-pick `process/` 结构、phase protocol、privacy/scout hooks，而不是整包覆盖；
5. 等 installer preflight、dry-run、settings merge、CI/release 和 README catalog drift 修复后，再考虑标准化采用。

---

## 场景二：技术架构学习

### 核心架构图

```text
vibecode-pro-max-kit repo
│
├─ Source-of-truth assets
│  ├─ .claude/agents/*.md          # Claude Code agent definitions
│  ├─ .codex/agents/*.toml         # Codex mirror agents
│  ├─ .claude/skills/*/SKILL.md    # shared workflow skills
│  ├─ .claude/hooks/*.cjs          # hook entrypoints + shared hook libs
│  ├─ .codex/hooks/*.cjs           # Codex hook mirror
│  ├─ CLAUDE.md / AGENTS.md        # orchestrator + compatibility surfaces
│  └─ process/development-protocols + process/_seeds
│
├─ Distribution layer
│  ├─ vc-manifest.json             # include / exclude / merge / symlink rules
│  ├─ resolve-manifest.mjs         # Node 22 glob resolver
│  └─ install.sh                   # clone temp repo, resolve manifest, copy files
│
├─ Runtime layer inside target project
│  ├─ SessionStart / SubagentStart hooks inject context
│  ├─ PreToolUse hooks block sensitive files and noisy broad scans
│  ├─ PostToolUse hooks update state and simplification reminders
│  └─ phase agents follow RIPER-5 and write plans / reports / context
│
└─ Durable project memory
   ├─ process/context/all-context.md
   ├─ process/context/tests/all-tests.md
   ├─ process/general-plans/{active,completed,backlog,reports,references}
   └─ process/features/{feature}/{active,completed,backlog,reports,references}
```

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| Harness assets 而非 runtime | 提供 agents / skills / hooks / protocols | 自研完整 agent loop | 借宿主工具能力，分发更轻，迭代更快。 |
| RIPER-5 phase lock | research / innovate / plan / execute / update process 分离 | 自由对话式编码速度 | 用显式阶段减少“直接写代码”和上下文漂移。 |
| `process/` 文件记忆 | 计划、报告、上下文都落盘 | 纯会话记忆 | 解决 context compaction、新会话、团队审阅问题。 |
| Manifest-driven install | 资产边界由 JSON + resolver 产生 | 手写 copy list | 更新、排除、symlink、merge 规则更可维护。 |
| Hooks 做 policy middleware | privacy / scout / session hooks | 只靠 prompt 约束 | 对敏感文件和噪音目录扫描提供更强执行边界。 |
| Claude first + Codex mirror | `.claude` 为主，`.codex` 镜像 | 各平台完全原生深适配 | 保持资产单源，但平台 parity 不完全。 |
| Agent-driven context generation | `vc-setup` 让 agent 扫描并写上下文 | 确定性 indexer / graph | 更灵活，但可重复性和准确性依赖模型表现。 |

### 值得学习的模式

1. **Process directory as product surface**：`process/` 不只是文档目录，而是 agent 的状态机、计划库、报告库和项目上下文路由器。
2. **Phase contracts**：每个 phase agent 都有允许/禁止活动和完成语义，降低 agent 理性化跳步。
3. **Context router pattern**：`all-context.md` 是入口路由，不要求每次把所有知识灌进上下文。
4. **Feature folder promotion**：主题 artifacts 变多后升级为 `process/features/{feature}`，避免 general plans 变垃圾堆。
5. **Policy hooks with fail-open design**：privacy/scout hooks 拦截高风险行为，异常时多为 fail-open，避免把宿主工具卡死。
6. **Manifest resolver pattern**：include/exclude/merge/symlink 显式化，适合任何“把 agent/workflow 资产安装到用户项目”的工具。
7. **Compatibility document split**：`CLAUDE.md` 面向 Claude，`AGENTS.md` 面向 Codex/通用 agent，但共享真实 protocol 文件，避免大段复制。

### 反模式 / 踩坑点

1. **installer preflight 不完整**：脚本文案要求 Node 22，但没有实际版本检查，Node 20 下可 silent partial install。
2. **文档承诺过强**：README 的多工具支持、skills 数量、settings preservation 与源码/实测不完全一致。
3. **一键安装副作用真实存在**：会重建 `.claude` / `.codex` / `.agents`，没有 profile 选择和 dry-run。
4. **版本口径漂移**：release/tag 是 `v2.4.2`，manifest 仍为 `2.4.1`。
5. **validator 与运行场景边界不清**：部分 validator 需要安装后项目才存在的 `process/context/all-context.md`，在 kit repo 中直接失败。
6. **Markdown lint 噪音大**：实测 markdownlint 报 7000+ 问题，说明文档风格没有作为质量门收敛。
7. **社区样本太早**：issues 多为 roadmap / good-first backlog，真实用户 bug 与长期维护响应还没有足够证据。

---

## 底层技术架构

### 最小架构内核

`Manifested Workflow Assets + Phase-locked Agent Contracts + Durable Process Artifacts + Hook-based Runtime Guardrails + Host-specific Adapter Surfaces`

也就是：用 manifest 定义可分发的 workflow 资产，用 phase agent / skill / protocol 控制 agent 行为，用 `process/` 保存项目记忆和计划状态，用 hooks 做运行时护栏，再通过 Claude / Codex 两套宿主表面落地。

### 核心抽象

| 抽象 | 职责 | 关键字段 / 机制 | 为什么重要 |
|------|------|----------------|------------|
| Orchestrator | 主会话负责意图识别、路由、上下文裁剪和阶段合规 | `CLAUDE.md` / `AGENTS.md` 中的 routing 与协议引用 | 防止主 agent 同时做需求、设计、计划、执行，降低上下文漂移。 |
| Phase / Mode | RIPER-5 的研究、创新、计划、执行、更新阶段 | phase agent prompt、allowed / forbidden actions、completion phrase | 把“应该先想再做”变成可执行工作流合同。 |
| Agent | 某个阶段或职能的执行角色 | `.claude/agents/*.md` 与 `.codex/agents/*.toml` | 让任务可拆分、可路由、可审查，而不是单 agent 吞掉全部职责。 |
| Skill | 可复用工作流包 / SOP / 脚本容器 | `SKILL.md`、`scripts/`、`references/` | 把 setup、audit、debug、context generation 等流程产品化。 |
| Process Artifact | 项目长期记忆与计划状态 | `process/context`、`general-plans`、`features`、`reports` | 让 agent 工作成果跨会话、跨压缩、跨成员可恢复。 |
| Manifest | 公开分发边界 | `include`、`exclude`、`merge`、`copyIfMissing`、`symlinks` | 决定哪些是 kit 资产，哪些是用户项目状态，避免误覆盖。 |
| Hook Guardrail | 宿主工具生命周期中的运行时策略 | SessionStart / PreToolUse / PostToolUse / Stop | 让隐私、路径、会话状态部分脱离 prompt，进入执行边界。 |

### 控制面 / 数据面

**控制面：**

- `CLAUDE.md` / `AGENTS.md`：宿主可读的总协议与路由表。
- `.claude/agents` / `.codex/agents`：phase 与 specialist 的角色合同。
- `.claude/skills`：setup、audit、context、debug、preview 等工作流合同。
- `.claude/settings.json` / `.codex/hooks.json`：hook wiring。
- `vc-manifest.json` / `resolve-manifest.mjs` / `install.sh`：分发和安装控制。

**数据面：**

- `process/context/*`：项目事实、架构、测试、环境、路由索引。
- `process/general-plans/*`、`process/features/*`：计划、执行状态、完成报告和参考材料。
- session state：hooks 在本地用户态维护的短期/长期会话状态。
- `.vc-installed-files` / `.vc-version`：安装快照与版本状态。

核心价值主要在控制面：它把“agent 应该如何做工程”做成了可分发的协议和护栏；数据面则把 agent 产生的工程认知持久化。

### 关键执行链路

**1. 安装链路**

```text
用户运行 install.sh
  → clone kit 到临时目录
  → 读取 vc-manifest.json version
  → resolve-manifest.mjs 解析 managed files / merge / symlinks
  → 备份并删除已有 .claude/.codex/.agents
  → 复制 managed files
  → 创建 .agents/skills → ../.claude/skills symlink
  → 写入 .vc-installed-files 与 .vc-version
```

关键问题：Node 20 下 resolver 仍返回 JSON 但只含 7 个文件，install 脚本不会识别为失败。

**2. 项目引导链路**

```text
用户触发 vc-setup
  → DETECT 项目栈 / monorepo / 现有 process 状态
  → ASK 获取业务目标、架构约束、测试命令、风险边界
  → SCAFFOLD 从 process/_seeds 建立 context / plan / feature 结构
  → STUDY 深扫代码库并填充 all-context.md / all-tests.md
  → VALIDATE 校验上下文路由、技能路由和 process 结构
```

这条链路说明 install 只是复制 harness，真正的项目适配发生在 `vc-setup`。

**3. 日常任务链路**

```text
用户提出任务
  → Orchestrator 判断 phase 和所需 agent / skill
  → 读取 all-context.md 作为 context router
  → 进入 research / innovate / plan / execute 等阶段
  → PreToolUse hooks 阻断敏感文件或噪音路径
  → agent 写计划 / 修改代码 / 跑验证
  → PostToolUse / Stop hooks 更新 session state 与报告提醒
  → 完成后更新 process artifacts
```

### 状态模型

- **安装状态：** `.vc-version`、`.vc-installed-files`、`.vibecode-backup/`。
- **项目长期状态：** `process/context/`、`process/general-plans/`、`process/features/`、`process/reports/`。
- **计划状态：** active / completed / backlog / reports / references；feature 级计划与 general plan 分层。
- **会话状态：** hooks 维护短期 session temp state 和长期 latest/archive state。
- **子代理状态：** `DONE`、`DONE_WITH_CONCERNS`、`BLOCKED`、`NEEDS_CONTEXT` 等完成语义。

### 契约边界

- **对宿主代理：** 只提供 prompt / skill / hook / artifact contract；推理和工具执行仍由 Claude Code / Codex 完成。
- **对目标项目：** kit 资产可以被安装和更新；真实业务上下文应落在 `process/context` 与 feature folders，不应写死在 kit prompt 中。
- **对平台兼容：** `.claude` 是更接近 canonical 的源，`.codex` 是镜像适配层；多平台支持不是同等 hook parity。
- **对安全：** privacy/scout hooks 是策略边界，但异常多为 fail-open；不能替代人工审计和宿主 sandbox。

### 失败与降级模型

- **Manifest 解析失败：** 当前缺少强版本检查；Node 20 下不是 hard fail，而是 partial success，这是最需要修的失败模型。
- **Hook 异常：** 多数 hook 采用 fail-open，避免卡死宿主工作流；优点是可用性高，缺点是安全 enforcement 不是绝对。
- **隐私阻断：** 敏感文件访问需要显式 approval marker；否则阻断。
- **路径阻断：** scout hook 阻止进入 `node_modules`、`dist`、`.git`、coverage 等高噪音目录或宽模式搜索。
- **上下文缺失：** 依赖 `vc-setup` 生成 `process/context/all-context.md`；裸 kit repo 中相关 validator 会失败。
- **平台能力不足：** 没有 hook parity 的宿主只能退化为 instruction-only / config-only 使用。

### 可复刻设计不变量

1. **宿主无关，工件入仓**：真正可迁移的是 `process/` 工件和协议，而不是某个模型的瞬时上下文。
2. **控制面与项目知识分离**：kit 提供工作流协议；目标项目提供业务事实和架构上下文。
3. **先研究/计划，后执行**：phase lock 必须有明确 transition gate。
4. **上下文分层路由**：`all-context.md` 只做 router，不把全部知识一次性注入。
5. **双宿主镜像但单一真源**：尽量减少 Claude / Codex 资产分叉。
6. **运行时护栏不能只靠 prompt**：至少把隐私、路径、会话状态做进 hook。
7. **安装器必须可观测**：任何 workflow kit 都应提供 dry-run、operation count、Node/runtime preflight 和 partial install detection。
8. **validator 要区分 kit repo 与 installed project**：否则会把“安装后才有的文件”误判为源码仓库失败。

---

## 质量与成熟度

### 代码质量

优点：

- 目录职责清楚：assets、manifest、installer、hooks、protocols 分层明确。
- 核心 installer/resolver 零 npm 依赖，便于分发和审计。
- agent parity、skill frontmatter、protocol wiring、seed、skill routing 等都有 validator。
- privacy / scout / session hooks 体现了把 prompt discipline 推向 runtime policy 的意识。

问题：

- `install.sh` 缺 Node 版本硬检查，造成 Node 20 silent partial install。
- JavaScript 代码缺少 TypeScript 类型边界和统一测试入口。
- README / validator / Node version / manifest version 存在漂移。
- installer 没有 dry-run / plan / profile 选择，对已有项目副作用较重。
- 部分 validator 未清楚区分 kit repo 与 installed target project。

### 实测验证

本次低风险验证结果（2026-06-14）：

| 命令 / 检查 | 结果 | 说明 |
|-------------|------|------|
| `node -v` | `v20.19.2` | 当前环境不是项目要求的 Node 22。 |
| `node resolve-manifest.mjs --json` | 异常但 exit 0 | 只解析 7 个 files、0 个 kitOnly；会误导 installer。 |
| `npx --yes node@22 resolve-manifest.mjs --json` | 通过 | 解析 500 files、43 kitOnly、1 merge、1 symlink。 |
| `bash -n install.sh` | 通过 | Shell 语法 OK。 |
| Node 20 下临时目录运行 `install.sh` | 表面成功但实际失败 | 只安装 7 files、0 agents、5 skills；这是关键风险。 |
| `validate-agent-parity.mjs` | 通过 | 12 Claude agents / 12 Codex agents 对齐，1 warning。 |
| `validate-skills.mjs` | 通过 | 31 skills，2 个 description length warnings。 |
| `validate-guide-sync.mjs` | 失败 | README agent/skill catalog 与磁盘实际内容失同步。 |
| `validate-protocol-wiring.mjs` | 通过 | 8 protocols / 12 agents 检查通过。 |
| `validate-seeds.mjs` | 通过 | seed dir 检查通过。 |
| `validate-context-discovery.mjs` | 失败 | 裸 kit repo 缺少安装后才生成的 `process/context/`。 |
| `validate-skill-routing.mjs` | 通过 | AGENTS / CLAUDE 路由面检查通过。 |
| `validate-skill-cross-refs.mjs` | 通过 | 31 skills cross refs 通过。 |
| `validate-skill-dependencies.mjs` | 通过但有 warning | 存在 `vc-predict ↔ vc-scenario`、`vc-update ↔ vc-setup` 依赖环。 |
| `validate-confusable-skills.mjs` | 通过但有 warning | `vc-docs` 与 `vc-docs-seeker` 易混淆。 |
| `validate-plan-inventory.mjs` | 通过 | 当前无 active/completed plan。 |
| `validate-all-context.mjs` | 失败 | `process/context/all-context.md` 缺失；属于 installed project 边界问题。 |
| Markdown lint | 失败 | 扫描 437 个 Markdown 文件，报 7243 个错误；文档风格未收敛。 |
| Personal path leak check | 失败 | 命中 `/Users/...`、`/home/...`、`C:\Users\...` 示例/文档/ workflow 模式。 |

### CI/CD

- `.github/workflows/validate.yml`：PR 触发，跑 agent/skill/protocol/context/plan validators、路径泄漏检查、markdownlint（非阻塞）。
- `.github/workflows/release.yml`：tag `v*` 触发，跑 validators 后创建 release。
- GitHub recent Actions（2026-06-14 观测）：
  - `Release Kit` 在 `v2.3.0`、`v2.4.0`、`v2.4.1`、`v2.4.2` 多次 failure；
  - `Validate Kit` PR run 为 `action_required`；
  - `Welcome New Contributors` 有 failure；
  - `Label PRs` 成功。

CI 的价值在于它已经把 workflow assets 当成需要验证的软件资产；问题是当前质量门还没稳定，不能把 workflow 文件存在等同于项目成熟。

### 文档

文档表达力强：README 清楚讲 problem、install、workflow、quality pipeline、plan lifecycle、phase programs、context groups、agent/skill catalog、credits，并带多语言 i18n。

但文档也有明显漂移：

- Node 版本口径与实际 resolver 要求不一致；
- settings preservation 承诺与 install script 行为不一致；
- README catalog 与磁盘 agents/skills 失同步；
- manifest version 落后于 release tag；
- 多语言文档增加触达，也放大同步维护成本。

### Issue / PR 健康度

- open issues 16 个，许多是作者自己创建的 roadmap / good-first / enhancement，例如 install `--help`、Ubuntu 24.04 validate、Getting Started tutorial、translations、capability surface lockfile。
- open PRs 2 个：安装统计修复、RIPER-5 Mermaid diagram。
- closed issue / real user bug 样本仍不足。
- 当前更像“刚发布并设计好贡献入口”的项目，而不是已经被真实团队反复验证的稳定工具。

---

## 社区与生态

### 热度与认可度

项目创建不到一个月已有 860 stars / 198 forks，传播效果强；README 文案精准抓住“AI 忘上下文、vibe coding 缺工程纪律”的痛点。

但 fork 抽样多为 0 star / 0 fork 的普通派生，更多像复制试用/个人改装，还未形成成熟二级生态。当前应区分 launch hype 与真实 adoption。

### 竞品分层

**直接竞品 / 同层：**

- `superpowers`：更轻的 agentic skill / methodology layer，强在行为 shaping 和低心智负担。
- `compound-engineering-plugin`：更偏团队多 agent review、复利工程闭环、跨平台 plugin 转换。
- `ECC`：更大的 cross-harness workflow substrate，覆盖 manifests、profiles、hooks、安全 CI、MCP、control-plane alpha。

**邻近替代：**

- 自己维护 `.claude` / `.codex` / `AGENTS.md` / `process/`。
- 使用 Claude Code 内建 Plan / subagents / hooks。
- 使用 Cursor rules / project docs / GitHub Copilot instructions 等轻量配置。

**架构邻居：**

- CLI-Anything：把任意软件包装成 agent-native CLI；和 vibecode 的“把项目工作流包装成 agent-native harness”同属 agent harness 思路。
- Code Intelligence / GitNexus / CodeGraph 类工具：不是直接竞品，但可补足 vibecode 缺失的确定性代码索引、依赖图和 impact analysis。

### 社区结论

传播强、定位准、贡献入口设计完整；但真实 adoption、长期维护、issue 响应、PR 合并质量尚未形成足够证据。社区活跃度不应按 star/fork 高估。

---

## 维护 / 接管视角

### 能不能维护

**可外围贡献 / 可逐步深入；不建议一开始接管核心 workflow protocol。**

原因：项目结构清晰，问题边界可拆，适合做小 PR；但核心价值集中在 phase protocol、hooks、installer 和文档口径，一改就容易影响全局行为。

### 最佳首批 PR 切入点

1. **修 Node preflight**：`install.sh` 必须硬检查 Node >= 22，避免 silent partial install。
2. **增加 dry-run / plan 模式**：输出将复制/覆盖/跳过的文件和 operation count。
3. **修 settings preservation / merge 语义**：clean-slate 删除前应保存并合并 `.claude/settings.json`。
4. **统一 Node 版本口径**：README、CONTRIBUTING、CI、installer、resolver 保持一致。
5. **修 README guide sync validator**：让 catalog validator 与 README 当前结构对齐。
6. **区分 kit repo validator 与 installed-project validator**：`process/context/all-context.md` 类检查应有 mode 或 fixture。
7. **修 release workflow failure**：Release Kit 多次 failure 会削弱用户对安装包的信任。
8. **收敛 Markdown / path leak 规则**：减少 CI 噪音，让质量门更可信。

### 不建议一开始碰的区域

- RIPER-5 phase core protocol 大改；
- agent prompt 体系整体重构；
- hook permission / block semantics 大改；
- process context schema 全面改版；
- 多平台 support 宣称与 runtime parity 的大范围重写。

### 维护流程建议

- 先读 `CONTRIBUTING.md`、`AGENTS.md`、`CLAUDE.md`、对应 skill / agent / hook 文件。
- 一 issue 一 PR，优先 200–400 LOC 内的小变更。
- 每个 PR body 写清楚验证：Node 20/22 行为、install smoke、相关 validator、相关 node tests、是否无法跑完整 CI。
- 对 installer / hook 改动必须在 fresh repo 和 existing `.claude` repo 两种场景跑 smoke test。

---

## 评分

| 维度 | 分数 | 说明 |
|------|------|------|
| 功能覆盖度 | 4/5 | agents / skills / hooks / process memory / installer 覆盖完整，但不是独立 runtime。 |
| 代码质量 | 3/5 | 结构清晰，validator 多；但 Node preflight、installer merge、CI failure、validator 边界问题明显。 |
| 文档质量 | 3/5 | README 叙事强、i18n 好；但与源码/实测存在关键漂移。 |
| 社区活跃度 | 2/5 | stars/forks 增长快，但项目太新、contributors 单核、真实 issue 数据不足。 |
| 架构设计 | 4/5 | `process/` 记忆、phase contracts、manifest installer、hook middleware 都有学习价值。 |
| 学习价值 | 5/5 | 很适合拆解“agent workflow harness 如何产品化”。 |
| 可借鉴度 | 4/5 | process memory、plan lifecycle、context routing、privacy/scout hooks 可拆用；full install 暂需谨慎。 |

---

## 最终结论

vibecode-pro-max-kit 是一个**定位准确、产品表达强、架构思路值得学，但工程成熟度仍处早期**的 AI coding workflow harness。

如果目标是“马上给生产项目装一套稳定工具”，它还不够稳：Node 20 silent partial install、安装副作用、release CI failure、validator 边界、README drift 都需要先修。

如果目标是“研究个人/团队 agent 工作流如何沉淀成可复制资产”，它非常值得看。最有价值的不是 assets 数量，而是这几个设计：

- `process/` 作为项目记忆与工作流状态机；
- phase-locked agents 把 AI coding 从聊天变成阶段制交付；
- manifest-driven installer 把工作流资产做成可分发包；
- hooks 把隐私、依赖目录扫描、会话恢复变成 runtime policy；
- `vc-setup` 把“读项目 → 问用户 → 生成真实上下文”做成首次接入流程。

**建议纳入 AI Coding Workflow 横评；可在 Node 22+ throwaway repo 中隔离 PoC，优先借鉴 process memory + phase protocol，不建议直接 full install 到关键仓库。**
