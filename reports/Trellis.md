# Trellis

> 一句话定位：**Trellis 是一套项目层 AI coding engineering framework / agent harness substrate：把 spec、task、workspace memory、四阶段工作流、跨平台 agent 配置和事件溯源 channel runtime 落到仓库与本地状态中，让 Claude Code、Codex、Cursor、OpenCode、Pi 等不同 coding agent 在同一套工程上下文和任务纪律下工作。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `mindfold-ai/Trellis` |
| URL | `https://github.com/mindfold-ai/Trellis` |
| Star | 11,043（2026-06-24 观测） |
| Fork | 631 |
| Watchers / Open Issues | GitHub `open_issues_count=10`，拆分后 open issues 6、open PRs 4 |
| 许可证 | AGPL-3.0-only / GitHub API 显示 AGPL-3.0 |
| 语言 / 运行时 | TypeScript monorepo；Node.js >=18.17；初始化依赖 Python >=3.9 |
| npm packages | `@mindfoldhq/trellis@0.6.4`、`@mindfoldhq/trellis-core@0.6.4` |
| npm downloads | `@mindfoldhq/trellis` 最近 7 日约 3,579（2026-06-17 到 2026-06-23） |
| 默认分支 | `main` |
| GitHub created_at | 2026-01-26 |
| 首次提交 | 2026-01-26 `1c61622 taosu <taosu@mindfold.ai> init project` |
| 最近提交 | 2026-06-24 `e1459dd Merge pull request #362 from mindfold-ai/fix/issue-320-brainstorm-prd-converge` |
| 最新 Git tag | `v0.6.4`；GitHub latest release API 返回 404（无 latest release） |
| 贡献者 | GitHub contributors API 返回 32；本地 shortlog 显示 taosu 约 1401 commits，其他贡献者分散 |
| 本地规模 | 2,294 tracked files；224 `.ts`、71 `.py`、956 `.md`、299 `.jsonl`；约 69 个 test/spec 文件 |
| 工作区 | `packages/cli`、`packages/core` |
| 分析日期 | 2026-06-24 |
| 分类 | AI Coding Workflow / Agent Harness Workflow / Project Memory & Task Substrate |

> 验证边界：本轮按 TK 默认静态边界，只阅读源码、README、AGENTS、package manifests、CI/GitHub API、npm registry、Issue/PR 元信息与本地 git 统计；未安装依赖、未运行 Trellis、未运行其测试/构建、未启动任何 agent workflow。

---

## 场景一：是否值得采用

### 解决的问题

Trellis 解决的不是“再做一个 coding agent runtime”，而是 **现有 coding agent 已经能写代码后，如何让它们在同一个项目中持续遵守工程上下文、任务边界和团队标准**。

Claude Code、Codex、Cursor、OpenCode 这类宿主已经提供模型、工具调用、文件编辑、shell、subagent 或 IDE 入口。但它们默认仍容易出现：

1. **每次会话从零开始。** Agent 不知道项目约定、分层规则、历史决策和上次做到哪。
2. **上下文散落。** `AGENTS.md`、`CLAUDE.md`、`.cursorrules` 这类单文件入口容易变成巨型说明书，既难维护，也难按任务精确注入。
3. **任务不是一等对象。** PRD、实现上下文、review context、状态、分支、工作树、commit/PR 信息常常只存在于聊天记录里。
4. **多平台流程漂移。** 团队成员分别使用 Claude Code、Codex、Cursor、OpenCode、Pi 等工具时，同一套工程纪律很难同步。
5. **Agent 记忆不可复用。** 单次会话里的发现、失败、决策如果不沉淀，下一次任务仍要重新解释。

Trellis 的答案是：把工程规则和任务状态变成 repo 内的 `.trellis/` 结构，把不同平台的 commands / skills / agents / hooks 通过 CLI 生成，并在底层提供 `task`、`channel`、`mem` 三组可复用 core primitives。

### 核心能力与边界

**能做什么：**

- 在项目内初始化 `.trellis/`：包括 `workflow.md`、`spec/`、`tasks/`、`workspace/` 等工作知识结构。
- 提供四阶段 workflow：`Plan → Implement → Verify → Finish`。
  - Plan：`trellis-brainstorm` 逐问澄清需求，产出 `prd.md`；研究任务可转交 `trellis-research`。
  - Implement：`trellis-implement` 从 PRD 和 curated context 写代码。
  - Verify：`trellis-check` 对照 specs、diff、lint/typecheck/tests 做检查与自修复。
  - Finish：`trellis-update-spec` 把新学习提升回 `.trellis/spec/`，归档任务并更新 journal。
- 支持多平台安装。README 声称覆盖 16 个 AI coding platforms；CLI 选项可见 `--cursor`、`--claude`、`--opencode`、`--codex`、`--kilo`、`--kiro`、`--gemini`、`--antigravity`、`--devin`、`--qoder`、`--codebuddy`、`--copilot`、`--droid`、`--pi`、`--reasonix`、`--zcode` 等。
- 用 `@mindfoldhq/trellis-core` 暴露 task/channel/mem primitives，供 CLI 和下游 Node 服务消费。
- 用 template hash、manifest prune、migration manifests、backup、safe delete 等机制治理安装/更新/卸载副作用。
- 用 channel event log 支持 worker、thread/forum、message、interrupt、turn lifecycle 等 durable coordination 能力。
- 用 mem reader 检索 Claude Code / Codex / OpenCode / Pi 等宿主的持久会话，提取 brainstorm/context 片段。

**不能做什么 / 边界：**

- 不是独立模型运行时：不负责 provider routing、LLM tool loop、权限沙箱、UI 或 IDE 本体。
- 不替代 Claude Code / Codex / Cursor / OpenCode；它是项目层 substrate，宿主仍负责实际模型调用和工具执行。
- 不保证 agent 绝对遵守流程：强制力来自宿主 skill/command/subagent/hook 能力和 Trellis 注入的上下文，不是集中策略引擎。
- 不适合“只想加一个轻 prompt”的团队：`.trellis/`、tasks、journals、platform artifacts、Python scripts、Node CLI 都是真实流程改造。
- AGPL-3.0-only 对商业闭源产品集成有明确合规门槛。
- 项目仍很新，0.6.x 阶段还在快速演化；open issues 中仍能看到 platform support、workflow manifest、Pi session、Trae/Hermes 支持等方向在推进。

### 与竞品/邻近项目差异

| 维度 | Trellis | superpowers | compound-engineering-plugin | ECC | OpenCode / Claude Code |
|------|---------|-------------|-----------------------------|-----|------------------------|
| 层级 | 项目级 spec/task/memory/workflow substrate + core primitives | 单次任务行为纪律层 | 团队 workflow + 多 agent review + 复利沉淀 | 大型 cross-harness workflow OS / installer / hooks | coding agent runtime / host harness |
| 最小内核 | `.trellis` project memory + task records + platform configurators + template ownership + event channel | skills + bootstrap + host adapters | skills/agents + converter + managed install state | manifests + profiles + assets + hook governance | LLM/tool/session/UI execution |
| 强项 | 把任务、spec、journal 和多平台配置统一落盘；core channel/task/mem 抽象扎实 | 轻、纪律强、安装心智低 | 多 persona review 和 brainstorm→plan→work→review→compound 闭环 | 多 harness 资产治理、安全面和选择性安装 | 真正执行代码修改、命令和会话 |
| 主要风险 | AGPL、流程重、平台矩阵维护成本、新项目 API 漂移 | 软约束、无持久 task substrate | Claude-centric、上下文成本 | 重、安装副作用和上下文负担 | 缺少团队共享 workflow substrate |
| 推荐用途 | 团队/高频 AI coding 项目的任务与记忆底座 | 个人/小团队快速提升 agent 纪律 | 团队多 agent review 与复利沉淀 | 内部 agent workflow OS / 治理样板 | 作为 Trellis 之下的执行宿主 |

### 集成成本

- **运行依赖中等。** CLI 需要 Node >=18.17；`trellis init` 还要探测 Python >=3.9。CLI 运行依赖包括 `commander`、`chalk`、`inquirer`、`giget`、`undici`、`zod`，core 主要是 TypeScript + Node fs primitives。
- **安装副作用真实存在。** `trellis init` 会写 `.trellis/`、root `AGENTS.md` managed block，以及各平台目录/配置；`update` 会做 migration、backup、template overwrite/skip/new；`uninstall` 会根据 manifest 删除或 scrub Trellis-managed artifacts。
- **学习曲线来自流程。** 用户要接受 brainstorm/PRD/task/check/finish/journal/spec promotion 的节奏；这比只安装一个 prompt 包重，但也更接近团队工程系统。
- **多平台成本不均。** Claude/Codex/Cursor/OpenCode/Pi 等平台能力不同；Trellis 通过 configurator 和 template context 抹平差异，但每新增宿主都增加兼容测试和迁移负担。
- **团队采用要先约定 ownership。** `.trellis/spec/` 和 `.trellis/tasks/` 会进入 repo，需要明确哪些内容共享、哪些内容个人化，哪些任务/journal 应提交，哪些应忽略或归档。


### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键库 / SDK。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| _待补关键依赖_ | | | | | | |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | ⚠️ 中高 | AGPL-3.0-only。个人/开源项目问题较小；商业闭源、SaaS 或深度嵌入要先做法务判断。 |
| Bus factor | 🟡 中 | GitHub contributors 32，但本地提交高度集中在 taosu；方向和实现仍由核心维护者主导。 |
| 维护趋势 | 🟢 活跃 | 2026-06-24 当日仍有多次 CI 成功与 merge；1113 commits；npm latest 0.6.4。 |
| 生产成熟度 | 🟡 中 | 项目声量和 CI 活跃，但创建于 2026-01-26，仍处 0.6.x 快速演进期。 |
| 发布口径 | 🟡 中 | npm latest 清楚为 0.6.4；GitHub latest release API 返回 404，release/changelog 主要看 docs/npm/tags。 |
| 平台兼容 | ⚠️ 中高 | 16 platform 支持是优势也是维护负担；open issues/PRs 仍集中在 Pi、Trae、Oh My Pi、Hermes 等适配。 |
| 安装/卸载副作用 | 🟡 中 | template hash、manifest prune 和 scrubber 设计较谨慎，但仍会改写项目与宿主配置。关键仓库应先 throwaway repo / worktree 试装。 |
| 上下文成本 | 🟡 中 | 相比 superpowers 更重；收益来自持久 task/spec/memory，不适合每个微小改动都全流程。 |

### 结论

**🟢 推荐采用（团队/高频 AI coding 项目的项目记忆与任务底座） / 🟡 商业生产化前需先评估 AGPL 与流程迁移成本。**

理由：

- Trellis 的核心价值不是“又一套 prompts”，而是把 **spec、task、journal、workflow、platform artifacts、channel events** 变成可版本化、可迁移、可更新的工程 substrate。
- 对已经重度使用 Claude Code / Codex / Cursor / OpenCode 的团队，它能解决“每个 agent 会话重新学习项目”的浪费，也能让任务 PRD、检查上下文和新学习沉淀成团队资产。
- 它比 superpowers / loop-engineering 更重，但也更接近“项目级 agent workflow layer”；如果只想轻量提升单次任务纪律，superpowers 更合适；如果要做 recurring loop，loop-engineering 更直指问题；如果要做大型多 harness 工作流资产治理，ECC 仍是更宽的参考。
- 建议采用路径：先在非关键仓库或 worktree 试 `trellis init --codex/--claude/--cursor`，跑一条小任务的 brainstorm → implement → verify → finish，再决定 `.trellis/spec/`、`.trellis/tasks/`、workspace journal 的团队提交规范。

---

## 场景二：技术架构学习

### 核心架构图

```text
┌──────────────────────────────────────────────────────────────────────┐
│                          Host Harnesses                              │
│ Claude Code · Codex · Cursor · OpenCode · Pi · Gemini · Copilot ...   │
│ - own LLM calls, editor/terminal tools, UI/session, permission model  │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ platform assets generated by
┌───────────────────────────────▼──────────────────────────────────────┐
│                         Trellis CLI Plane                            │
│ packages/cli                                                         │
│ init / update / upgrade / uninstall / workflow / mem / channel        │
│ - platform configurators                                              │
│ - template registry / remote templates                                │
│ - migration manifests / template hashes / backup                      │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ writes / updates
┌───────────────────────────────▼──────────────────────────────────────┐
│                         Project Knowledge Plane                       │
│ .trellis/                                                            │
│ workflow.md · spec/ · tasks/ · workspace/ · config.yaml · .version    │
│ - specs and conventions                                               │
│ - task PRDs, context jsonl, status                                    │
│ - per-developer journals and session traces                           │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ backed by reusable primitives
┌───────────────────────────────▼──────────────────────────────────────┐
│                         Trellis Core SDK                              │
│ packages/core                                                        │
│ task                channel                         mem               │
│ - task.json schema  - events.jsonl + reducer      - session readers   │
│ - phase projection  - worker/thread projections    - context extract  │
│ - path contracts    - runtime interface            - search windows   │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ durable state / projections
┌───────────────────────────────▼──────────────────────────────────────┐
│                         Local / Repo State                            │
│ repo .trellis files · ~/.trellis/channels · host session stores        │
│ events.jsonl · .seq · pid/cursor/log sidecars · Claude/Codex JSONL     │
└──────────────────────────────────────────────────────────────────────┘
```

### 最小架构内核

脱掉 README、品牌和具体宿主之后，Trellis 的最小可复刻内核是：

> **Project-scoped Knowledge Plane + Task Artifact Model + Workflow Phase Protocol + Platform Configurator Registry + Managed Template Ownership + Migration System + Event-sourced Channel Runtime + Persisted Session Memory Reader**

这几个抽象缺一不可：

1. **Project-scoped Knowledge Plane**：把 specs、workflow、tasks、workspace journal 放到 repo 内或 project scope，而不是散在聊天历史里。
2. **Task Artifact Model**：把 AI coding task 变成 `task.json + prd/context/check/research` 这类稳定工件。
3. **Workflow Phase Protocol**：Plan / Implement / Verify / Finish 不是文案，而是 agent 何时读写哪些工件、何时调用哪些 skill/subagent 的状态协议。
4. **Platform Configurator Registry**：多宿主差异不能写进核心 workflow；每个平台只贡献路径、模板、hook/skill/agent 映射和 Python command 适配。
5. **Managed Template Ownership**：安装器必须知道“哪些文件是我写的”，否则 update/uninstall 会误删用户资产。
6. **Migration System**：跨版本改名、删文件、safe delete、breaking guide 必须可声明、可 dry-run、可备份。
7. **Event-sourced Channel Runtime**：worker/thread/message/interrupt 不应只存在内存里；事件日志提供 durable coordination 和可投影状态。
8. **Persisted Session Memory Reader**：不接管宿主 runtime，但读取宿主历史会话，把有用上下文再喂回 Trellis workflow。

### 核心抽象

| 抽象 | 文件 / 目录 | 职责 | 为什么重要 |
|------|-------------|------|------------|
| `.trellis/` Knowledge Plane | `.trellis/workflow.md`、`.trellis/spec/`、`.trellis/tasks/`、`.trellis/workspace/` | 项目级规则、任务和记忆的落盘位置 | 让 agent 不再依赖“用户每次重新解释项目” |
| CLI Command Tree | `packages/cli/src/cli/index.ts` | `init/update/upgrade/uninstall/mem/workflow/channel` 入口 | 将安装、升级、记忆、协作能力统一到一个 CLI 面 |
| AI Tool Registry | `packages/cli/src/types/ai-tools.ts`、`configurators/index.ts` | 描述平台 id、configDir、cliFlag、templateContext、configure/collectTemplates | 多平台扩展的核心 seam |
| File Writer | `packages/cli/src/utils/file-writer.ts` | `ask/force/skip/append` 写入模式，记录本次实际写入文件 | 把“磁盘存在”与“Trellis 拥有”解耦，降低误删风险 |
| Template Hash Manifest | `packages/cli/src/utils/template-hash.ts` | LF 归一化 SHA256、POSIX key、schema v2 | update/uninstall 判断用户改动与 ownership 的基础 |
| Manifest Prune | `packages/cli/src/utils/manifest-prune.ts` | 修剪历史污染 manifest，保留 `.trellis`、migration paths、managed `AGENTS.md` | 修复旧版本可能把用户 runtime 数据纳入 manifest 的风险 |
| Migration Manifest | `packages/cli/src/migrations/*`、`types/migration.ts` | 声明 rename、rename-dir、delete、safe-file-delete、breaking/migration guide | 让 workflow/template 演进可审计，而不是脚本里硬编码 |
| Task Record | `packages/core/src/task/schema.ts` | 24 字段 `TrellisTaskRecord`，TS/Python writer 对齐 | task 是跨工具、跨语言的稳定状态契约 |
| Channel Event | `packages/core/src/channel/internal/store/events.ts` | `create/message/thread/context/spawned/done/error/interrupt/turn_*` 等事件 | channel 的 durable truth，不靠进程内状态 |
| Worker Runtime | `packages/core/src/channel/api/runtime.ts` | `start/interrupt/stop` 注入式 runtime contract | core 不依赖 CLI/provider 细节，进程编排留给宿主 |
| Supervisor | `packages/cli/src/commands/channel/supervisor.ts` | fork worker、pump stdout/stderr、tail inbox、写事件 | 把实际 agent 子进程与 durable channel events 桥接起来 |
| Mem Adapter | `packages/core/src/mem/*` | 读取 Claude/Codex/OpenCode/Pi 持久会话，输出统一 session/context/search 结果 | 复用宿主历史，而不是自建完整记忆系统 |

### 控制面 / 数据面分离

**控制面：**

- `trellis init/update/upgrade/uninstall`：决定安装哪些平台、模板、workflow、迁移和版本。
- `.trellis/workflow.md`：定义 Plan / Implement / Verify / Finish 的阶段协议。
- `.trellis/config.yaml`、`.trellis/.version`、`.trellis/.template-hashes.json`：决定项目当前 Trellis 版本、配置和 template ownership。
- `AI_TOOLS` + `PLATFORM_FUNCTIONS`：决定某个平台如何生成 skills、commands、agents、hooks、settings。
- migration manifests：决定跨版本重命名/删除/安全删除/破坏性升级的策略。
- channel worker options：`inboxPolicy`、worker id、provider、agent、interrupt/kill policy。

**数据面：**

- `.trellis/spec/`：团队共享的代码规范、架构约定、package/layer scoped context。
- `.trellis/tasks/`：PRD、context jsonl、check jsonl、research、task status、branch/worktree/PR 信息。
- `.trellis/workspace/`：个人 journal、session trace、历史学习。
- `~/.trellis/channels/<project>/<channel>/events.jsonl`：channel append-only event log。
- `.seq`、pid、worker-pid、log、inbox-cursor、spawnlock：host-local sidecar，不等同 durable truth。
- Claude/Codex/OpenCode/Pi 的原生 session JSONL：mem reader 的输入数据。

这个分离是 Trellis 最值得学习的地方：它不接管宿主 agent runtime，只把“工程流程和状态”抽成稳定 substrate。真正的模型调用、文件编辑、终端执行仍由 Claude Code / Codex / Cursor / OpenCode 负责。

### 关键执行链路

#### 链路 1：`trellis init` 从空项目生成 workflow substrate

```text
user runs trellis init --codex/--claude/... -u <name>
  ↓
CLI startup checks .trellis/.version vs CLI VERSION
  ↓
init resolves Python >=3.9 command
  ↓
choose platforms + write mode + monorepo/template/workflow options
  ↓
createWorkflowStructure() writes .trellis skeleton
  ↓
for each platform: configurePlatform()
  ↓
write platform commands / skills / agents / hooks / settings
  ↓
write root AGENTS.md managed block + .version
  ↓
startRecordingWrites() result becomes .template-hashes.json
  ↓
optional developer identity / bootstrap task setup
```

关键点：`file-writer` 只记录“本次实际写入”的文件。字节相同但原本存在的用户文件不会被记录为 Trellis-owned；`append` 也不会记录整文件 ownership。这是 installer 安全性的关键。

#### 链路 2：`trellis update` 安全升级模板和迁移

```text
user runs trellis update [--dry-run|--force|--skip-all|--create-new|--migrate]
  ↓
compare project version / CLI version / npm version
  ↓
load .template-hashes.json
  ↓
pruneOrphanManifestKeys() self-heals poisoned manifest
  ↓
collect currently configured platform templates
  ↓
classify files: new / autoUpdate / changed / userDeleted
  ↓
load migration manifests and classify rename/delete/safe-file-delete
  ↓
backup managed dirs to .trellis/.backup-*
  ↓
apply migrations when allowed; stop on breaking pending migration unless --migrate
  ↓
write/skip/create .new according to conflict policy
  ↓
refresh .version and template hashes
```

关键点：Trellis 没有把 update 做成简单 overwrite。它同时处理用户改动、历史 manifest 污染、migration、backup 和 breaking guide。

#### 链路 3：Plan / Implement / Verify / Finish 的 task workflow

```text
user describes a change
  ↓
trellis-brainstorm asks one question at a time
  ↓
write PRD / research / curated context into .trellis/tasks/<task>/
  ↓
trellis-implement subagent reads PRD + specs + context and edits code
  ↓
trellis-check subagent reviews diff and runs configured checks
  ↓
finish-work archives task, updates journal, promotes useful learnings to spec
```

关键点：Trellis 把单次 AI coding 从“对话”变成“任务工件生命周期”。这比普通 prompt workflow 更像轻量项目管理/记忆系统。

#### 链路 4：Channel worker 的 durable coordination

```text
create / resolve channel
  ↓
spawnWorker(input, runtime)
  ↓
runtime.start() launches actual worker process
  ↓
append spawned event
  ↓
worker-state reducer projects WorkerState
  ↓
sendMessage() appends durable message event
  ↓
supervisor inbox watcher tails events.jsonl and forwards to stdin
  ↓
worker emits progress/done/error/turn_started/turn_finished events
  ↓
interruptWorker() appends interrupt_requested then runtime.interrupt()
```

关键点：channel 的 truth 是 `events.jsonl`。pid/cursor/log 是本机运行时观测，不是全局事实。`sendMessage` 在 strict delivery 下也会先 durable append 用户意图，再补 `undeliverable` 事件，而不是直接丢消息。

#### 链路 5：Mem 从宿主历史会话抽取上下文

```text
mem command / core mem API
  ↓
scan host session roots: Claude / Codex / OpenCode / Pi
  ↓
parse JSONL / session metadata with tolerant readers
  ↓
normalize to MemSessionInfo + DialogueTurn[]
  ↓
search / context / extract phase windows
  ↓
feed useful dialogue context back into Trellis workflow
```

关键点：mem v1 明确不读 channel event logs，也不替代 channel；它只做 persisted-session retrieval 和 dialogue-context extraction。这种边界让 Trellis 可以复用宿主历史，而不用先自研完整 session store。

### 状态模型

| 状态 | 持久化位置 | 投影 / 读写方式 | 设计含义 |
|------|-------------|-----------------|----------|
| Project workflow | `.trellis/workflow.md` | agent/skills 读取 | 项目工作流协议，不是聊天临时规则 |
| Specs | `.trellis/spec/` | 按 package/layer/task scoped injection | 团队共享工程标准 |
| Task | `.trellis/tasks/<task>/task.json` + PRD/context/check/research | `TrellisTaskRecord` 24 字段；phase 从 status 投影 | 任务是独立工件，不是对话片段 |
| Template ownership | `.trellis/.template-hashes.json` | hash + migration + prune | update/uninstall 的安全边界 |
| Project version | `.trellis/.version` | CLI startup/update 比对 | 防止 CLI/project 版本漂移 |
| Channel | `~/.trellis/channels/.../events.jsonl` | append-only events + reducers | durable coordination truth |
| Channel seq | `.seq` sidecar | 与 JSONL tail reconcile | 防重复 seq，允许 sidecar 自愈 |
| Worker runtime | pid/worker-pid/log/inbox-cursor/spawnlock | host-local observation | 运行时辅助，不是 durable truth |
| Host sessions | `~/.claude/projects`、`~/.codex/sessions`、`~/.pi/agent/sessions` 等 | mem adapters parse/search/context | 外部宿主记忆输入 |

### 失败恢复与降级策略

1. **Python 探测失败区分“没安装”和“沙箱阻止”。** `EPERM/EACCES` 会给出 sandbox-restricted warning，而不是误判 Python 不存在。
2. **manifest 污染可自愈。** `pruneOrphanManifestKeys` 会移除不属于当前 configurator 的历史 hash key，避免 uninstall 删除用户 sessions/custom skills。
3. **update 默认保护用户改动。** changed files 会询问、skip、force 或生成 `.new`；breaking migration 没有 `--migrate` 会 hard-stop。
4. **uninstall 以 manifest 为 ownership truth。** 普通文件删除，结构化配置走 scrubber，只剥 Trellis-managed 字段。
5. **task JSON 保守失败。** 损坏或 shape 不符不会被静默覆盖；未知 status 只投影为 unknown。
6. **channel seq 可修复但不猜。** `.seq` 与 JSONL tail 不一致可修复；JSONL 有内容但无法恢复 seq 会硬失败，避免重复编号。
7. **send message 先保留意图。** delivery 失败通过 `undeliverable` 补事件表达，不吞掉用户消息。
8. **runtime observation 不覆盖 durable truth。** liveness reconciliation 默认返回 proposed events，不把 pid 检查直接写成事实。
9. **mem reader 宽松读取。** JSONL 坏行会跳过；OpenCode 等能力不足时降级并 warning，而不是假装完整支持。

### 质量与成熟度

**代码质量：**

- monorepo 分层清楚：`packages/cli` 负责安装/迁移/平台适配/命令面，`packages/core` 负责 task/channel/mem domain primitives。
- CLI installer 不是简单文件复制，已经有 write recorder、template hash、manifest prune、migration manifests、backup、structured scrubber 等生产化设计。
- core channel 采用 append-only event log + reducer projection，task schema 明确对齐 TS/Python writer，整体状态边界比普通 prompt 包扎实。
- 部分 CLI 文件较大（如 `init.ts`、`update.ts`），说明平台/模板/迁移逻辑仍在快速堆叠阶段，后续可能需要进一步拆分。

**测试与 CI：**

- 本地统计约 69 个 test/spec 文件，覆盖 core、CLI templates、platform configurators、migration/update/uninstall 等路径。
- GitHub Actions 最近 10 次 run 中多数 CI 成功，2026-06-24 当日多条 `main` / feature/fix 分支 CI success。
- package scripts 覆盖 `test`、`typecheck`、`lint`、`lint:py`、`build`、`prepublishOnly`。
- 本报告未运行 Trellis 测试，因此不对测试通过率做实测背书。

**文档：**

- README 定位清楚：out-of-the-box engineering framework for AI coding；解释了 specs、tasks、workspace memory、multi-platform setup 和四阶段 loop。
- docs 入口完整：Quick Start、Supported Platforms、Real-World Scenarios、Spec Templates、Changelog。
- repo 自身也由 Trellis 管理，`AGENTS.md` 包含 Trellis managed block；另有 GitNexus block，说明项目在 dogfood 多种 agent infrastructure。

### 可借鉴的设计不变量

1. **把 workflow state 放进 repo，不放进 prompt。** 规则、任务和历史学习都应可 diff、可 review、可迁移。
2. **任务必须有独立 schema。** 没有 `task.json` 这类稳定记录，AI coding 任务无法跨会话/工具/团队协作。
3. **平台适配必须 registry 化。** 支持 16 个工具时，不能让 workflow 正文夹杂每个平台路径和语法。
4. **installer 必须有 ownership truth。** 只靠路径匹配的 uninstall/update 最终会误删用户数据。
5. **迁移要声明化。** workflow/template 一旦版本化，rename/delete/safe-delete/breaking guide 就不能藏在脚本里。
6. **事件日志优先于内存状态。** worker/thread/message/interrupt 这类协作状态需要 durable event log 和 reducer。
7. **宿主历史可以读，不一定要接管。** mem adapter 模式比一开始自研全量 session store 更轻。
8. **不支持要显式降级。** OpenCode reader、sandbox Python probe、delivery failure 都应该 warning/事件化，而不是伪装成功。
9. **个人与团队状态要分层。** shared specs/tasks 与 per-developer workspace journals 应明确边界。
10. **finish 阶段不是结束语，而是学习提升。** `update-spec` 这类 spec promotion 是 workflow 形成复利的关键。

---

## 社区与生态

### 当前社区信号

- Star 11,043、Fork 631，作为 2026-01 创建的新项目，传播速度很快。
- npm `@mindfoldhq/trellis` latest 0.6.4，最近 7 日 downloads 约 3,579，说明已有真实安装使用。
- open issues 很少（10 total including PRs），但其中多条是平台扩展/兼容诉求：Trae、Pi、Oh My Pi、Hermes、workflow YAML manifest、中文支持等。
- CI 活跃且近期成功率看起来较好；同日多个 fix 分支与 main run success。
- GitHub release 口径偏弱：latest release endpoint 404，采用时应以 npm package/tag/docs changelog 为准。

### 生态位

Trellis 位在三类项目之间：

1. **比 superpowers 更重。** superpowers 管“agent 行为纪律”；Trellis 管“项目记忆 + task lifecycle + platform artifacts”。
2. **比 ECC 更聚焦。** ECC 是大型 cross-harness asset OS；Trellis 更聚焦项目内 specs/tasks/workflow 和 core primitives。
3. **比 OpenCode / Claude Code 更上层。** OpenCode/Claude Code 是执行宿主；Trellis 是让这些宿主共享项目上下文的 substrate。

它最适合做“团队 AI coding 项目管理/记忆层”的参考实现。

---

## 最终评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 采用价值 | ⭐⭐⭐⭐☆ | 对高频 AI coding 项目价值高；AGPL 与流程重量限制了无脑引入。 |
| 架构学习价值 | ⭐⭐⭐⭐⭐ | task/channel/mem、installer ownership、migration、event projection 都很值得拆解。 |
| 成熟度 | ⭐⭐⭐⭐☆ | 迭代活跃、CI/测试/发布存在；但项目新、0.6.x、平台矩阵仍在扩展。 |
| 文档质量 | ⭐⭐⭐⭐☆ | README/docs 入口清楚；深层 core/channel 设计需要读源码。 |
| 可复刻性 | ⭐⭐⭐⭐⭐ | 最小内核和状态契约清晰，可被内部 agent workflow substrate 借鉴。 |
| 风险 | 🟡 中 | AGPL、平台兼容、安装副作用、流程迁移成本。 |

## 总结

Trellis 是目前 AI coding workflow 赛道里很值得看的一个项目：它没有执着于再造一个 agent，而是把 agent 需要长期共享的 **工程结构、任务状态、上下文记忆和平台适配** 做成 substrate。

如果只想让个人 coding agent 更守纪律，优先看 superpowers；如果要团队多 agent review，compound-engineering-plugin 更直接；如果要完整 cross-harness workflow OS，ECC 更宽；但如果问题是：**一个真实代码仓库如何持续让多个 AI coding tools 共享 specs、tasks、memory 和 workflow**，Trellis 是目前最值得拆的参考之一。