# loop-engineering

> 一句话定位：**loop-engineering 是一套面向 AI coding workflow 的“循环工程”工具箱与参考实现：用机器可读 pattern registry、interactive showcase、multi-host starters，以及 `loop-audit` / `loop-init` / `loop-cost` / `loop-sync` / `loop-context` / `loop-worktree` / `loop-mcp-server` / `goal-audit` 等 npm 工具，把 triage、PR babysitting、CI sweeping、dependency sweeping、changelog drafting 和 bounded goal finishing 产品化为可审计、可控成本、可逐级放权的工程回路。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `cobusgreyling/loop-engineering` |
| URL | `https://github.com/cobusgreyling/loop-engineering` |
| Star | 6,545（2026-07-08 观测） |
| Fork | 838（2026-07-08 观测） |
| Watchers | 38（2026-07-08 观测） |
| 许可证 | MIT |
| 主要语言 | JavaScript / TypeScript / Markdown / YAML；核心资产是 patterns、starters、skills、Pages showcase 与多 npm CLI |
| 默认分支 | `main` |
| GitHub created_at | 2026-06-09 |
| 首次提交 | 2026-06-09 `789233c Cobus Greyling Initial commit: loop-engineering reference repo` |
| 最近提交 | 2026-07-08 `8bce2fb github-actions[bot] chore(loop): daily triage update STATE.md + run log [automated] (#215)` |
| 最新 Git tags | `v1.5.0`、`loop-audit-v1.5.3`、`loop-init-v1.3.3`、`loop-worktree-v1.0.0`、`loop-mcp-server-v1.0.0` |
| GitHub latest release | `v1.5.0 — Community Tools Drop`（2026-06-30 发布） |
| npm packages | `@cobusgreyling/loop-audit@1.5.3`、`@cobusgreyling/loop-init@1.3.3`、`@cobusgreyling/loop-cost@1.0.3`、`@cobusgreyling/loop-sync@1.0.0`、`@cobusgreyling/loop-context@1.0.0`、`@cobusgreyling/loop-mcp-server@1.0.0`、`@cobusgreyling/loop-worktree@1.0.0`、`@cobusgreyling/goal-audit@1.0.2` |
| Open Issues / PRs | 19 issues / 7 PRs；GitHub `open_issues_count=26` 含 PR |
| 贡献者 | GitHub contributors API 当前可见 14；提交仍明显集中在 Cobus 主线与机器人 dogfood 提交 |
| 本地旧 clone / 远端 tip | 本地 `HEAD` 停在 2026-06-15 的 `8710657`；`origin/main` 已到 2026-07-08 的 `8bce2fb`，ahead/behind=`0/129` |
| 远端规模 | `origin/main` 视角：452 tracked files；235 Markdown；77 TS/JS/MJS/Shell；13 test files；8 个 tool packages |
| 分析日期 | 2026-07-08 |
| 分类 | AI Coding Workflow / Loop Engineering Toolkit |

> 验证边界：本轮按 TK 默认静态边界，只阅读源码、文档、Git 历史、GitHub API、Actions 元信息、npm registry 元信息；未安装依赖、未运行项目测试/构建、未启动服务。

---

## 场景一：是否值得采用

### 解决的问题

`loop-engineering` 要解决的不是“再造一个 coding agent runtime”，而是 **当 AI agent 已经能读代码、改代码、调用工具后，哪些工程任务应该被做成可重复运行的 loop，以及这些 loop 如何安全落地**。

传统 AI coding 工作流常见问题是：

1. **一次性 prompt 很强，但不可运营。** 今天让 agent 看一次 issue/PR/CI，明天还要重新说一遍；没有状态、节奏、预算和交接记录。
2. **自动化边界不清。** “让 agent 每 5 分钟看 PR”听起来美好，但缺少 L1 report-only、L2 assisted fix、L3 unattended 的放权路径，很容易过早自动写代码或烧 token。
3. **loop 成本不可见。** 高频 PR babysitter / CI sweeper 如果没有 early exit、daily cap、run log，很快从效率工具变成 token 黑洞。
4. **不同 agent harness 各有入口。** Grok TUI、Claude Code、Codex、GitHub Actions 都能跑循环，但需要不同的 skills、agents、state 文件、调度命令和 starter 结构。
5. **团队不知道自己的 repo 是否 loop-ready。** 有无 `STATE.md`、`LOOP.md`、verifier、budget、MCP scope、worktree 策略、safety gate，应该有一个可重复审计口径。

`loop-engineering` 的答案是：把 recurring engineering tasks 抽象为 **patterns**，再给每个 pattern 配好 starter、skill、state schema、预算估算和 readiness audit。

目标用户：

- 已经在用 Grok / Claude Code / Codex / GitHub Actions 做 AI coding 的个人开发者。
- 想把“每日 triage / PR babysit / CI fix / dependency sweep / changelog draft”变成半自动 loop 的小团队。
- 需要一套轻量模板来试点 L1/L2/L3 agent loop 的团队技术负责人。
- 想研究“AI coding 工作流如何从 prompt 变成运营系统”的 agent workflow 设计者。

### 核心能力与边界

**能做什么：**

- 提供 7 个已登记 loop pattern：`daily-triage`、`pr-babysitter`、`issue-triage`、`ci-sweeper`、`post-merge-cleanup`、`dependency-sweeper`、`changelog-drafter`，并通过 `patterns/registry.yaml` 暴露 cadence、risk、week-one mode、token cost、state file、skills、human gates、tools 支持。
- `loop-init` 已不只是拷 starter：它会根据 `--pattern` 与 `--tool` 落盘 `STATE.md`、`LOOP.md`、`loop-budget.md`、`loop-run-log.md`、skills、constraints，并在 scaffold 后直接打印 Loop Ready score；当前原生 scaffold 宿主是 Grok / Claude / Codex / Opencode。
- `loop-audit` 检查一个项目是否具备 loop readiness：state / skills / verifier / `LOOP.md` / workflows / safety docs / MCP hints / worktree evidence / budget / run-log / 真实活动信号，并可输出建议、JSON 和 badge。
- `loop-cost` 基于 registry 估算不同 cadence 与 L1/L2/L3 readiness level 的 tokens/day，对高频 cadence、daily cap、early-exit requirement 做显式告警。
- `loop-sync` 用来检查 `STATE.md ↔ LOOP.md`、skills 结构与配置漂移，支持 JSON 输出和实验性的 auto-fix / dry-run。
- `loop-context` 提供 deterministic ledger pruning + circuit breaker：检测 stagnation、no-progress、iteration cap、token budget，避免 L2/L3 loop 无意义重试烧 token。
- `loop-worktree` 为每次 fix attempt 管理隔离 git worktree，支持 `create / mark / cleanup / gc / list`，把“每轮修复一个工作树”产品化。
- `loop-mcp-server` 把 patterns、skills、state、budget、run-log 暴露成 MCP resources/tools，让 agent 按需读取 loop 资产，而不是把所有文档硬塞进 prompt。
- 文档与分发层也已产品化：GitHub Pages interactive showcase、pattern picker、quickstart、star-history 页面、per-tool npm 包和 dogfood workflows 一起构成完整 adoption surface。

**不能做什么 / 边界：**

- 不是 coding agent runtime：没有自己的模型调用、tool loop、session store、provider routing、UI 或权限沙箱。
- 不是 full cross-harness workflow OS：没有 ECC 那种 profile/component installer、hook runtime、安全 CI 大矩阵或控制面。
- 不是 agent skill 行为纪律底座：不替代 `superpowers` 这类“单次任务前必须 brainstorm/plan/TDD/verify”的行为 shaping 层。
- 不保证 L2/L3 unattended loop 安全。它提供 gates、budget、verifier、worktree 和 denylist 模板，但最终权限、token、CI、MCP scope、auto-merge 策略仍由用户团队实现。
- CLI 本身很薄，核心价值在 patterns/starter/docs；如果团队已经有成熟内部 agent loop 平台，它更多是参考模型而不是替换品。

**与竞品差异：**

| 维度 | loop-engineering | superpowers | ECC | vibecode-pro-max-kit | compound-engineering-plugin |
|------|------------------|-------------|-----|----------------------|-----------------------------|
| 层级 | recurring loop pattern + starter + audit/cost toolkit | 单次任务行为纪律层 | cross-harness workflow substrate | spec-driven harness + process memory | 团队多 Agent 协作与 review workflow |
| 最小内核 | registry + starters + state/budget/run-log + audit/init/cost CLI | skills + bootstrap + adapters | agents/skills/rules/hooks/manifests/installer | phase agents + hooks + `process/` | skills + agents + converter + review pipeline |
| 强项 | 把 loop rollout、readiness、成本显式化 | 轻量提升 agent 工程纪律 | 大规模安装治理与安全面 | 项目记忆与阶段制交付 | 多 persona review 与复利沉淀 |
| 风险 | 项目很新、CLI 薄、生产控制面缺失 | 依赖宿主遵守 skill | 重、上下文/副作用大 | installer/CI/Node 口径风险 | Claude-centric、上下文成本 |

### 集成成本

- **依赖链仍然偏轻，但已从 3 个 CLI 扩成多小包矩阵。** 大多数工具仍是 Node/TypeScript 小包；新增重量主要来自 `@modelcontextprotocol/sdk`（MCP server）和更多 per-tool publish/release workflows。
- **安装方式仍然轻。** README 与 Quickstart 以 `npx` 为主：`loop-init`、`loop-audit`、`loop-cost`、`loop-sync`、`loop-context`、`loop-mcp-server`、`loop-worktree` 都能按工具单独使用；不 clone 也能体验大部分 adoption path。
- **落地副作用比旧稿更明确。** `loop-init` 会写入 state / budget / run-log / skills / constraints；`loop-worktree` 会创建 `.loop-worktrees/` 与 manifest；`loop-mcp-server` 需要 `LOOP_PROJECT_ROOT`；因此更应该先 dry-run、先 L1 report-only。
- **学习成本来自“多工具 + loop operation 心智”。** 用户不只要理解 pattern、cadence、L1/L2/L3、human gates，还要理解 drift、context breaker、MCP lookup、worktree isolation 在什么阶段接入。
- **从零到 demo：** 个人项目可当天跑 L1 report-only；团队若要进入 L2/L3，至少要用一周以上时间验证 constraints、verifier、budget、CI/worktree、MCP scope 与人工审批链。


### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键库 / SDK。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| `yaml` | runtime dep | `loop-cost`、`loop-mcp-server` 解析 registry / config | 让 token cost、pattern metadata、MCP lookup 能直接读取 YAML 事实源 | `tools/loop-cost/package.json`、`tools/mcp-server/package.json` | 如果你也想把 workflow contract 放进 repo，可直接复用 | YAML 作为事实源时，schema / validation 仍要另补 |
| `@modelcontextprotocol/sdk` | runtime dep | `loop-mcp-server` 暴露 patterns / skills / state / budget / run-log | 给 agent 提供 runtime-queryable loop resources，而不是把所有 docs 塞进 prompt | `tools/mcp-server/package.json`、`tools/mcp-server/src/index.ts` | 适合把静态 workflow 资产变成 agent 可查询的资源层 | 会把项目根目录解析与路径安全带进攻击面 |
| `ajv` | dev dep | registry/schema 校验 | 防止 pattern registry 与 docs/starter 漂移 | 根 `package.json` 的 `validate:registry` + `ajv` | 任何 machine-readable pattern catalog 都值得配 schema gate | 只校验结构，不保证语义质量 |
| `@cobusgreyling/loop-audit` | internal package dep | `loop-init` scaffold 后立刻给出 Loop Ready score | 把“装完再审计”缩成一次命令，形成闭环 onboarding | `tools/loop-init/package.json` 依赖 `@cobusgreyling/loop-audit` | 很适合把 doctor / bootstrap 组合成 first-run experience | 内部包版本如果落后，init 与 audit 口径会漂移 |
| TypeScript + Node built-ins (`node:test`) | build/test toolchain | 所有 CLI 包的 deterministic util / test harness | 维持轻依赖、多小包、可预测 CLI 行为 | 各 `tools/*/package.json` + `test/*.test.mjs` | 适合做 agent workflow 小工具，不必上重型框架 | 多包分散 build/test 脚本后，release matrix 会更碎 |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | 低 | MIT；当前公开 npm packages 也统一声明 MIT。 |
| Bus factor | 中高 | contributors API 已到 14，但核心提交、taxonomy 与发布节奏仍明显由 Cobus 主线驱动，机器人提交辅助 dogfood。 |
| 供应商锁定 | 低 | 核心仍是 Markdown/YAML/state files + npm CLI；即使不用这些 CLI，也能手动迁移 pattern、skills、LOOP/STATE 结构。 |
| 维护趋势 | 很活跃 | 本地旧 clone 相对远端已落后 129 commits；`v1.5.0`、`loop-worktree`、`loop-mcp-server`、star-history/pages 等都在 6 月底到 7 月初连续推进。 |
| 安全攻击面 | 中 | 现在不仅有 scaffold，还加入了 MCP server、worktree、context breaker 等本地工具面；L2/L3 loop 仍需要严格审 `LOOP.md`、`loop-constraints.md`、MCP scope、auto-merge 与 human gates。 |
| 生产成熟度 | 中 | 适合个人/小团队 L1/L2 loop 试点；比 6 月中旬更完整，但依旧不是企业级集中权限、审计、告警、多租户控制面。 |
| 文档漂移 | 中低 | registry/schema gate、quickstart、GitHub Pages showcase、README badge 与 per-tool docs 明显加强；但多 surface（README / docs / starters / npm / release notes）快速演进，仍应锁定版本。 |
| 成本失控风险 | 中 | `loop-cost` 之外现在又补了 `loop-context` circuit breaker、`loop-budget.md`、`loop-constraints.md` 与 run-log；若团队绕过这些约束，风险仍会回到人工治理。 |

### 结论

**🟢 推荐采用（个人/小团队 loop 试点） / 🟡 团队生产化前受控推广。**

理由：

- 它填补了 AI coding workflow 中一个很实用的空位：**recurring loop 的模式库、脚手架、readiness audit 和成本估算**。
- 作为轻量 starter/toolkit，投入产出比高，尤其适合先把 daily triage、PR babysitter、CI sweeper 这类重复事务做成 L1 report-only。
- 架构学习价值很高：它把“loop engineering”从理念拆成 registry、state、budget、run-log、verifier、human gate、cadence 的组合。
- 不建议把它误读为完整自动化平台。团队要进 L2/L3，必须先补权限治理、worktree 隔离、CI 验证、MCP scope、human approval、成本报警与回滚策略。

---

## 场景二：技术架构学习

### 核心架构图

```text
┌────────────────────────────────────────────────────────────────────┐
│                       Loop Engineering Repo                         │
│   reference repo + showcase + dogfooded loop operation toolkit      │
└──────────────────────────────────┬─────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────┐
│                     Pattern Source of Truth                         │
│ patterns/registry.yaml + patterns/*.md + docs/QUICKSTART.md         │
│ - cadence / risk / week-one mode / token cost / state / skills      │
│ - human gates / tool support / starter links / quickstart surface   │
└──────────────────────────────────┬─────────────────────────────────┘
                                   │ read / bundle / publish
┌──────────────────────────────────▼─────────────────────────────────┐
│                        Utility & Delivery Plane                     │
│ loop-init   loop-audit   loop-cost   loop-sync                      │
│ loop-context   loop-worktree   loop-mcp-server   goal-audit         │
└───────────────┬───────────────┬───────────────┬────────────────────┘
                │ writes        │ scans/checks  │ serves / isolates
                ▼               ▼               ▼
┌────────────────────────────────────────────────────────────────────┐
│                         Target Project                              │
│ LOOP.md · STATE.md · loop-constraints.md                            │
│ loop-budget.md · loop-run-log.md · loop-ledger.json                 │
│ skills/ / tool-specific assets / .loop-worktrees/manifest.json      │
└──────────────────────────────────┬─────────────────────────────────┘
                                   │ scheduled / executed by
┌──────────────────────────────────▼─────────────────────────────────┐
│                         Host Harnesses                              │
│ Grok · Claude Code · Codex · Opencode · GitHub Actions              │
│ Cursor / Windsurf / OpenClaw / Hermes（当前多为 examples/manual）   │
└──────────────────────────────────┬─────────────────────────────────┘
                                   │ updates / observes
┌──────────────────────────────────▼─────────────────────────────────┐
│                        Loop Observability Layer                     │
│ STATE.md · run-log · budget / constraints · audit score             │
│ GitHub PRs/issues/comments · workflow logs · star-history / pages   │
└────────────────────────────────────────────────────────────────────┘
```

### 最小架构内核

脱掉 README、品牌和具体宿主之后，`loop-engineering` 的最小可复刻内核是：

> **Pattern Registry + Tool-specific Starters + Durable Loop State/Constraints + Budget/Run-log Observability + Audit/Cost/Sync/Context/Worktree Utilities + MCP Lookup Surface + L1/L2/L3 Rollout Contract**

它不是“一个 agent”，而是一个 **loop operation protocol**：

1. 先把适合循环运行的工程任务抽成 pattern。
2. 用 registry 给 pattern 加 cadence、risk、week-one mode、cost、state file、human gates、skills、tool support。
3. 用 starter / init 把 pattern 物化到目标项目。
4. 用 audit 判断项目是否 ready，用 sync 检查 state/loop/skills 是否漂移。
5. 用 cost estimator 判断 cadence 是否会烧穿预算。
6. 用 context breaker 与 loop ledger 限制无意义重试。
7. 用 worktree manager 把 L2/L3 的修复尝试隔离出来。
8. 用 MCP server 把静态 loop 资产变成 agent 按需查询的资源层。
9. 用 state/run-log/budget/constraints 把每次循环变成可审计事实。
10. 用 L1/L2/L3 分阶段放权，而不是一上来 unattended。

### 核心抽象

| 抽象 | 文件 / 目录 | 职责 | 为什么重要 |
|------|-------------|------|------------|
| Pattern | `patterns/*.md`、`patterns/registry.yaml` | 描述一个 recurring loop 的目标、调度、状态、技能、验证、人类交接、失败模式和成功指标 | 把“让 agent 定期做事”从口头命令变成可复用 SOP |
| Registry Entry | `patterns/registry.yaml` + schema | 机器可读的 pattern metadata：cadence、risk、week-one mode、token cost、skills、state、human gates、tools | CLI、docs、quickstart、cost estimator 与 future tooling 的共同事实源 |
| Starter / Scaffold | `starters/*`、`templates/*`、`tools/loop-init` | 将 pattern 预制成可落盘的 skills、state、constraints、budget、run-log、first-run command | 降低从理念到可运行 loop 的第一步成本 |
| Loop State | `STATE.md` / pattern-specific state | 记录 watchlist、last run、loop action、human decision、resolved/noise | 没有 durable state，loop 每次都从零开始，无法交接或复盘 |
| Loop Contract | `LOOP.md`、`loop-constraints.md` | 记录 cadence、scope、denylist、human gates、budget、kill switch、approval boundary | 把 loop 的控制面放进 repo，可 review、可 diff、可被 agent 读取 |
| Audit Engine | `tools/loop-audit/src/auditor.ts` | 扫描 target repo 的 state、skills、verifier、safety、workflows、budget、run-log、real activity 并给 L0-L3 | 避免团队在没有状态/验证/预算时误开自动 loop |
| Sync Checker | `tools/loop-sync/src/sync.ts` | 比对 `STATE.md`、`LOOP.md`、skills、required files 的一致性，输出 drift report | 解决“文件都在，但 contract 已经漂移”的中期维护问题 |
| Context Ledger / Breaker | `tools/loop-context/src/context-manager.ts` | 压缩尝试历史、归一化错误、检测 stagnation/no-progress/token cap 并决定是否继续 | 给 fix-capable loop 一个 deterministic 的停手机制 |
| Worktree Manager | `tools/loop-worktree/src/worktree.ts` / `cli.ts` | 为每次尝试创建、标记、回收独立 git worktree | 把 L2/L3 的隔离执行从约定升级为工具能力 |
| MCP Resource Surface | `tools/mcp-server/src/index.ts` | 把 patterns、skills、state、budget、run-log 暴露为 MCP resources/tools | 让外部 agent 在运行时按需查询 loop 资产，降低 prompt 填充成本 |

### 控制面 / 数据面

**控制面：**

- `patterns/registry.yaml`：pattern metadata 与 cost cap 的源头。
- `patterns/*.md`：每类 loop 的人类可读 SOP、failure modes、tool-specific notes。
- `LOOP.md`：目标项目内的 loop scope、cadence、gates、budget、kill switch。
- `AGENTS.md` / `CLAUDE.md`：项目约定、测试命令、agent 行为边界。
- `loop-audit`：把 readiness policy 变成可执行检查。
- `loop-cost`：把 cadence 与 readiness level 变成预算评估。
- GitHub workflows / scheduler / Grok `/loop` / Codex Automation：真正触发 loop 的调度控制。

**数据面：**

- `STATE.md` / `*-state.md`：loop 读写的工作队列、状态和人类决策。
- `loop-run-log.md`：每次运行的时间、模式、结果、token/预算事件。
- GitHub issues / PRs / CI runs / commits：loop 观察和操作的外部事实。
- Worktree diff / PR comment / release notes draft：loop 产生的结果数据。
- MCP / connector 返回的数据：外部系统读取结果，属于数据面输入。

这个分离的价值是：`loop-engineering` 不接管执行面，只定义 **如何让执行面可控地循环起来**。模型、工具、权限、CI、PR 合并仍由宿主和目标项目负责。

### 关键执行链路

#### 链路 1：从 pattern 到 target project scaffold

```text
user chooses pattern + tool
→ loop-init parseArgs()
→ resolve PATTERN_STARTERS / TOOL_SUFFIX / STATE_FILES / PATTERN_BUDGET
→ locate bundled or monorepo starters/templates
→ copy tool-specific skills / agents
→ copy state example as STATE.md or pattern-specific state
→ copy LOOP.md
→ add L2 templates: minimal-fix + verifier where needed
→ generate loop-budget.md + loop-run-log.md + loop-budget skill
→ create AGENTS.md template if absent
→ print first loop command + audit/cost next steps
```

这条链路的核心设计是：**初始化不只是复制 skill，而是同时建立状态、预算、运行记录和人类 gate 的骨架**。这比普通 “copy prompt files” 更接近可运营 loop。

#### 链路 2：readiness audit 从结构到等级

```text
loop-audit target
→ scan state files: STATE.md / pr-babysitter-state.md / ...
→ scan skills: .grok/.claude/.codex/skills + verifier agents
→ scan LOOP.md / AGENTS.md / CLAUDE.md
→ scan safety docs, GitHub workflows, MCP hints, worktree evidence
→ scan loop-budget.md / loop-run-log.md / loop-budget skill
→ scan git history / state timestamps / workflows for real loop activity
→ compute score
→ cap L3 unless cost observability + real activity exist
→ emit human/json/markdown report + suggestions
```

`computeScore()` 的关键不是数学精度，而是 policy：没有 state、triage、verifier、budget/run-log、真实活动信号，就不能轻易进入 L3。它把“别太早放权”写成了代码。

#### 链路 3：cost estimator 将 cadence 风险显式化

```text
registry pattern + chosen cadence + readiness level
→ parse cadence: 15m / 1d / 5m-15m
→ convert to runs/day
→ read tokens_noop / tokens_report / tokens_action / daily_cap
→ choose realistic mix by L1/L2/L3 and early_exit_required
→ calculate no-op/report/action/realistic tokens/day
→ warn if action every run > daily cap
→ warn if realistic > daily cap
→ warn if high cadence >= 96 runs/day
→ print human-readable estimate
```

这条链路最值得复用：它不试图精确预测模型账单，而是把“高频 loop 必须 early exit、必须 daily cap、必须看 realistic blend”变成团队讨论的显式对象。

#### 链路 4：项目自身 dogfood loop

```text
GitHub schedule fires daily triage / readiness audit / changelog drafter
→ workflow checks out main / runs loop-related prompt/tool/script
→ updates STATE.md / loop-run-log.md / draft artifacts
→ opens or updates PR
→ human/bot merge path records result
→ next audit sees state + workflows + git activity as real loop usage
```

仓库最新提交 `8bce2fb` 依然是 daily triage 自动更新 `STATE.md` + run log 的结果，而 7 月 7-8 日连续合入的 `loop-worktree`、star-history、MCP server docs 也说明它不只是写文档，而是在持续用自己的 loop/tooling 维护自己。

### 状态模型

1. **Pattern state（静态事实源）**：`patterns/registry.yaml` + `patterns/*.md`。由维护者更新，CLI bundle/read，docs 引用。
2. **Scaffold state（目标项目初始状态）**：`starters/*`、`templates/*` 复制到目标项目后成为用户自己的文件。
3. **Loop runtime state（运行状态）**：`STATE.md` / pattern-specific state。每次 loop 必须更新 last run、action、human decision、resolved/noise。
4. **Observability state（审计状态）**：`loop-run-log.md` 记录 run history；`loop-budget.md` 记录 cap、kill switch、预算策略。
5. **External state（外部事实）**：GitHub issue/PR/CI、MCP connector、Linear/Slack 等；loop 读取和评论，但事实源不在本仓库。
6. **Release/package state（分发状态）**：GitHub latest release `v1.5.0` + per-tool npm dist-tags + package-specific tags；必须分开看 repo release 与各子工具发版。

状态模型的核心不变量：**loop 的长期记忆必须在 repo 或共享系统里，而不是只留在某个 agent 会话里。**

### 契约边界

- **Registry 契约：** `registry.yaml` 必须符合 `patterns/registry.schema.json`；每个 pattern 需要 id、name、cadence、risk、readiness、cost、skills、state_file 等关键字段。
- **Pattern 文档契约：** 每个 pattern 应覆盖 goal、scheduling、required skills、state schema、cycle、verification、human handoff、tool notes、failure modes、success metrics。
- **CLI 契约：**
  - `loop-init [target-dir] --pattern <name> --tool <grok|claude|codex|opencode> [--dry-run]`
  - `loop-audit <target> [--json|--markdown|--suggest]`
  - `loop-cost --pattern <id> [--cadence <interval>] [--level L1|L2|L3] [--conservative]`
  - `loop-sync [target-dir] [--json|--dry-run|--auto-fix]`
  - `loop-context --check --ledger <path>`
  - `loop-worktree create|mark|cleanup|gc|list ...`
  - `LOOP_PROJECT_ROOT=<repo> loop-mcp-server`
- **Target repo 契约：** 若想进入 L2/L3，必须有 state file、triage skill、verifier、constraints、safety gates、budget、run log、真实 loop run 证据；fix-capable loop 还应有 worktree / ledger / approval boundary。
- **Agent-facing 契约：** skills 明确要求 report-only week one、maker/checker、human handoff、denylist、不要 auto-merge；`LOOP.md` 是 agent 每轮读取的 operational contract。
- **Human gate 契约：** 安全、auth、payments、infra、multi-file refactor、auto-merge、超过尝试次数等必须交给人。

### 失败与降级模型

| 失败类型 | 检测方式 | 降级 / 恢复 |
|----------|----------|-------------|
| 没有 state file | `loop-audit` fail | 从 starter 复制 `STATE.md.example`，先 L1 report-only |
| 没有 triage/verifier | `loop-audit` warn | 安装 `loop-triage` / `loop-verifier`，L2 前必须补 maker/checker |
| 没有 budget/run-log/constraints | `loop-audit` warn，L3 cap | 生成 `loop-budget.md`、`loop-run-log.md`、`loop-constraints.md`，记录 kill switch |
| 高频 cadence 烧 token | `loop-cost` high cadence / cap warning | 降低 cadence、加 early-exit、收紧 watchlist、设 daily cap |
| loop 空转 / 噪音 | `loop-context` breaker、state/run-log 中 unresolved/noise 增长 | tighten skill rules，增加 breaker 与 ledger，必要时降回 L1 |
| auto-fix 错误 | verifier / human gate / worktree review | 降级到 L1/L2，限制 allowlist，停止 auto-merge |
| MCP/connector 权限过大 | `docs/safety.md` / `LOOP.md` / MCP config review | L1 只读，L2 只 comment/draft PR，写权限最小化 |
| state/loop/skills 漂移 | `loop-sync` warning / critical | 先修 contract drift，再恢复调度 |
| worktree 残留或脏状态 | `loop-worktree gc/list` | 回收 orphan worktree，必要时 `--force` 清理后再继续 |
| package/release 口径混乱 | repo release 与 npm/tool tags 不一致 | 报告中分开 repo release、Git tag、per-tool npm latest，不混用 |

`loop-engineering` 的降级哲学很清楚：**先 L1 看见问题，再 L2 辅助修复，最后才 L3 unattended。任何结构或证据缺失都应向低等级降级。**

### 可复刻设计不变量

1. **先建 pattern registry，再写 starter。** 没有机器可读 registry，CLI、docs、cost/audit 会漂移。
2. **每个 loop 必须有 durable state。** 没有 `STATE.md` / pattern state 的 loop 不是工程系统，只是定时 prompt。
3. **L1/L2/L3 是放权合同，不是营销标签。** report-only、assisted fix、unattended 必须对应不同权限、验证和预算。
4. **高频 loop 必须 early exit。** PR babysitter / CI sweeper 这类 5–15m loop 如果 no-op 不低成本退出，必然烧穿预算。
5. **成本模型要进入脚手架，而不是事后提醒。** `loop-init` 同时生成 budget/run-log，说明成本是 runtime contract 的一部分。
6. **maker/checker 是 L2 的最低安全单元。** 自动修复类 loop 不能让 implementer 自证完成。
7. **human gate 必须写进 `LOOP.md`。** 安全、auth、infra、付款、auto-merge 等边界不能只藏在用户脑子里。
8. **审计工具要扫描真实活动，不只扫描文件存在。** `loop-audit` 检查 state timestamp、workflow、git history，避免“空架子”伪装 ready。
9. **starter 要按宿主差异落地，但 pattern 本身保持宿主无关。** Grok/Claude/Codex/GitHub Actions 是适配层，不应污染核心 loop 概念。
10. **项目自身要 dogfood。** 如果 loop 工具不敢用来维护自己，很难说服团队把它装进生产仓库。

---

## 架构解剖

### 目录结构

```text
loop-engineering/
├── README.md                  # 项目定位、quickstart、pattern links、工具入口、showcase 链接
├── LOOP.md / STATE.md         # 仓库自身 dogfood contract 与当前 loop state
├── loop-budget.md             # 仓库自身 token cap、kill switch、预算策略
├── loop-run-log.md            # 仓库自身 loop 运行记录
├── patterns/                  # 7 个 patterns + registry/schema
│   ├── registry.yaml
│   ├── registry.schema.json
│   └── *.md                   # daily-triage, pr-babysitter, ci-sweeper 等
├── starters/                  # clone-and-run starter kits（109 tracked files）
├── templates/                 # state / budget / run-log / constraints 模板
├── skills/                    # root-native loop skills：triage/verifier/minimal-fix/budget/constraints
├── tools/
│   ├── loop-audit/            # readiness audit CLI
│   ├── loop-init/             # scaffold CLI
│   ├── loop-cost/             # token/cadence cost CLI
│   ├── loop-sync/             # drift checker
│   ├── loop-context/          # deterministic memory manager + circuit breaker
│   ├── mcp-server/            # MCP server for patterns / skills / state lookup
│   └── loop-worktree/         # isolated git worktree manager
├── docs/                      # quickstart、interactive showcase、pages、primitives、safety、release、star-history
├── examples/                  # host-specific examples: Grok / Claude / Codex / Opencode / Cursor / Windsurf / OpenClaw / Hermes / GitHub Actions
├── assets/ / stories/ / resources/   # visuals、故事样板、社区补充资产
├── scripts/                   # registry validation、CI gates、bundle assets、contributors/star-history 脚本
└── .github/workflows/         # 15 个 workflows：validate、audit、daily triage、star-history、welcome-contributors、per-tool release
```

### 技术栈

- **运行时 / 语言：** Node.js + TypeScript；辅助脚本为 JavaScript/MJS/Shell；核心内容资产仍是 Markdown/YAML/HTML。
- **构建：** 每个工具包独立 `tsc`；`loop-init` / `loop-cost` 在 build 前 bundle starters/registry；Pages 展示层直接从 `docs/` 发布。
- **测试：** Node 内置 `node:test` + `assert`；目前 7 个工具包各有独立测试文件。
- **发布：** repo 级 latest release `v1.5.0` + per-tool Git tags + GitHub Actions 发布到 npm，使用 npm provenance / OIDC。
- **CI：** registry/schema 校验、loop-init sync、readiness audit dogfood、daily triage、star-history 更新、welcome-contributors、per-tool release workflows。

### 模块依赖关系

```text
patterns/registry.yaml
  ├─ scripts/validate-registry.mjs           # schema + docs consistency gate
  ├─ tools/loop-cost/scripts/bundle-registry.mjs
  │   └─ tools/loop-cost/src/estimator.ts    # cadence / token estimator
  ├─ tools/mcp-server/src/resolver.ts        # MCP lookup resolver
  └─ docs/QUICKSTART.md / showcase           # picker / docs surface

starters/ + templates/ + skills/
  ├─ tools/loop-init/scripts/bundle-assets.mjs
  └─ tools/loop-init/src/cli.ts
      └─ writes target repo state / constraints / run-log / skills

target repo files
  ├─ tools/loop-audit/src/auditor.ts         # scans readiness level
  ├─ tools/loop-sync/src/sync.ts             # detects drift
  ├─ tools/loop-context/src/context-manager.ts # breaker / pruning / ledger
  ├─ tools/loop-worktree/src/worktree.ts     # isolate fix attempts
  └─ host harness / GitHub Actions / MCP client reads & executes loop contracts
```

### 扩展机制

1. **新增 pattern：** 添加 `patterns/<id>.md`，并在 `patterns/registry.yaml` 注册；通过 `registry.schema.json` 与 `scripts/validate-registry.mjs` 校验。
2. **新增 starter：** 在 `starters/<pattern>` 或 tool-specific variant 中加入 skills/agents/state/LOOP 模板，并同步 `loop-init` 的 pattern mapping。
3. **新增宿主工具：** 扩展 `Tool` 类型、`TOOL_SUFFIX`、destination paths、first loop command、starter layout；当前原生 scaffold 支持 Grok / Claude / Codex / Opencode，Cursor / Windsurf / OpenClaw / Hermes / GitHub Actions 主要通过 examples/manual path 体现。
4. **新增 cost policy：** 在 registry 与 `PATTERN_BUDGET`/bundle 中更新 tokens/noop/report/action、daily cap、early-exit requirement。
5. **新增 audit signal：** 在 `LoopSignals`、`auditProject()`、`computeScore()` 和 reporter 中增加扫描项与评分规则。
6. **新增 utility package：** 按问题域分出 `loop-sync` / `loop-context` / `loop-worktree` / `loop-mcp-server`，尽量保持 deterministic、单用途、小包发布。

---

## 质量与成熟度

### 代码质量

优点：

- **代码面扩了，但仍然可读。** `origin/main` 视角是 452 tracked files、77 个 TS/JS/MJS/Shell 文件、7 个工具包测试文件；相比 6 月中旬已大很多，但主链路仍能在一次源码阅读里看清。
- **deterministic 小工具哲学保持一致。** `loop-sync`、`loop-context`、`loop-worktree` 都尽量把逻辑做成无需 LLM 的可测试 utility，而不是再造一个重 runtime。
- **类型/契约边界比旧稿更完整。** 现在除了 `RegistryPattern`、`AuditResult` 外，还有 breaker decision、MCP resource/tool schema、worktree manifest 等明确结构面。
- **policy 不只写在文档里。** audit、sync、breaker、daily-triage、PR comment、inline gate status 都把“先报告、再放权、遇错停机”的治理逻辑写进代码和 workflow。
- **dogfood 证据更强。** `STATE.md`、`loop-run-log.md`、audit workflow、daily triage、star-history、Pages、recent merged PR 一起说明项目在持续用自己的 loop/tooling 维护自己。

问题：

- **项目仍然年轻。** 创建于 2026-06-09；虽然已不是“刚一周”的状态，但长期维护、版本兼容和真实企业 adoption 还缺时间证明。
- **工具面增长快于统一抽象。** 包数量与 workflow 数量都在上升，build/release/docs 口径碎片化风险也在上升。
- **宿主支持仍有一层不对称。** Grok/Claude/Codex/Opencode 是原生 scaffold 路径，Cursor/Windsurf/OpenClaw/Hermes 仍更多依赖 examples/manual copy。
- **docs/showcase 面已经大于 runtime core。** 这有利于传播，但也意味着 narrative、模板和真实长期使用案例之间可能出现剪刀差。
- **bus factor 仍偏高。** contributors API 虽已有 14，但核心 taxonomy、release cadence 与 dogfood 方向仍强依赖 Cobus 主线。

### 测试

本轮未运行项目测试；静态读取到的测试结构：

- `tools/loop-audit/test/auditor.test.mjs`：测试空目录 readiness、minimal-loop scoring、cost observability、loop activity、markdown/json output、`--suggest` 等。
- `tools/loop-init/test/cli.test.mjs`：测试 `--help`、dry-run scaffold、bundled assets 是否包含 state / skills / budget / run-log / constraints。
- `tools/loop-cost/test/estimator.test.mjs`：测试 cadence interval、range conservative、CI sweeper 高频 warning、daily triage 低成本估算。
- `tools/loop-sync/test/sync.test.mjs`：测试 drift detection、required files、score/level 输出。
- `tools/loop-context/test/context-manager.test.mjs`：测试 error normalization、stagnation / no-progress / token-budget / max-iterations breaker。
- `tools/mcp-server/test/server.test.mjs`：测试 MCP resources/tools 暴露与 resolver 行为。
- `tools/loop-worktree/test/worktree.test.mjs`：测试 worktree create/mark/cleanup/gc/list 的 manifest 逻辑。

测试哲学仍是“deterministic utility regression”而不是 coverage-first。对 reference toolkit 来说合理，但若要团队生产化，仍建议补：跨平台路径与 shell 差异、更多 host scaffold matrix、MCP root/path safety fixture、worktree 脏状态与 orphan recovery、audit false positive/negative 样本。

### CI/CD

- `.github/workflows/validate-patterns.yml`：校验 registry/schema、loop-init sync 和文档一致性。
- `.github/workflows/audit.yml`：构建并运行 `loop-audit` dogfood，对当前仓库输出 readiness score / badge / comment 证据。
- `.github/workflows/daily-triage.yml` + `changelog-drafter.yml`：定时 triage、更新 state/run log、起 PR、生成 changelog 草案。
- `release-loop-audit.yml`、`release-loop-init.yml`、`release-loop-cost.yml`、`release-loop-sync.yml`、`release-loop-context.yml`、`release-loop-mcp-server.yml`、`release-loop-worktree.yml`、`release-goal-audit.yml`：按工具拆分的 tag→test→build→`npm publish --provenance` 发布链。
- `update-star-history.yml`、`welcome-contributors.yml`、`publish-goal-audit-bootstrap.yml`：社区/分发辅助流水线；`docs/` 与 Pages 展示层也通过这套 CI 节奏持续更新。
- `.github/ruleset-main-protection.json`：有 main protection 规则快照。

GitHub Actions 最近 10 次 API 观测中，`Pages build and deployment`、`Update Star History`、`Loop Readiness Audit (dogfood)`、`Daily Triage (dogfood)`、release workflows 均有 success；这说明项目已从“只有 dogfood”扩到“dogfood + 分发 + 展示层”的完整流水线。

### 文档质量

文档是项目的主体，质量较高：

- `README.md` + `docs/QUICKSTART.md` + GitHub Pages interactive showcase 能把 pattern、tool、host support 和 adoption path 一次讲清。
- `docs/primitives.md` 将 loops 拆成 state、cadence、skills、verification、budget 等 primitives，而且 host appendix 持续扩到 Windsurf / Zed / Gemini CLI 等邻近宿主。
- `docs/operating-loops.md` / `docs/loop-design-checklist.md` 给出运行和设计检查表。
- `docs/safety.md` / `SECURITY.md` 对 unattended automation、MCP scope、secret exfiltration、auto-merge、kill switch 有明确风险提示。
- `docs/GITHUB_PAGES.md`、star-history、community update、`examples/mcp/README.md` 让“如何展示 / 如何最小权限接入 / 如何对外传播”也变成一等文档面。

不足是 showcase / 模板 / 指南仍多于长期生产案例；adopters、真实 team story、host-specific hard-failure 案例还需要继续累积。

### Issue / PR 健康度

- Open issues 当前 19；多是 docs/examples/showcase、adopter surface、tooling polish，而不是系统性 crash backlog。
- Open PR 当前 7；除 Dependabot 外，已经出现真实 docs/example 贡献（如 Windsurf、Zed、badge 目录补齐）。
- recent merged PR 包含 `loop-worktree`、`loop-mcp-server` 文档、star-history、Pages/community surface 与持续的 daily triage 更新，说明主线不是停在 6 月中旬那组三工具状态。
- contributors API 已到 14，但方向与合并节奏仍是 founder-led。

健康度判断：**活跃、欢迎外部小贡献、dogfood 很真，但还没有进入“大量陌生贡献者自驱维护”的成熟阶段。** 不应因短期增长而高估企业级稳定性。

---

## 社区与生态

### 热度与认可度

截至 2026-07-08，项目已到 **6,545 stars / 838 forks / 38 watchers**。对一个 2026-06-09 才创建、且高度方法论导向的 workflow toolkit 来说，这已经不是“小圈子 seed”级别，而是明显的 breakout niche adoption。

GitHub search `"loop-engineering"` 相关仓库已超过 100 个，其中 `cobusgreyling/loop-engineering` 是 canonical；另有 `loop-engineering-orange-book` 等内容衍生。真正的插件生态还谈不上成熟，但 docs/examples/showcase/community-update 已经形成“内容生态先行”的扩散态势。

公开社交搜索信号依旧不如 GitHub 内部信号强；因此更稳妥的结论不是“全民 adoption”，而是：**GitHub-native 关注度很高、社区入口在形成、但真实长期生产面案例仍少于热度。**

### 生态位置

`loop-engineering` 位于 AI coding stack 的 **loop operation layer**：

```text
Model Provider
  ↓
Coding Agent Runtime / Harness（Grok / Claude Code / Codex / Opencode / GitHub Actions）
  ↓
Workflow Discipline / Harness Assets（superpowers / ECC / CE / vibecode）
  ↓
Loop Operation Layer（loop-engineering）
  ↓
Project Artifacts（STATE.md / LOOP.md / PRs / CI / run log / budget）
```

它不是 runtime，也不是大一统 workflow substrate；它更像在已有 harness 之上回答：**哪些事该循环跑、怎么跑、多久跑一次、谁来验证、什么时候停。**

### 竞品对比

**直接同层 / 相邻同类：**

- 自己维护的 `.github/workflows` + Claude/Codex/Grok prompt + state docs：最现实替代；但缺少 registry/audit/cost/toolkit 的统一表达。
- `superpowers`：更偏单次任务纪律，不是 recurring loop toolkit；可组合使用。
- `ECC`：更完整 workflow substrate；如果团队要统一多 harness assets 和 hooks，ECC 更强，但也更重。
- `vibecode-pro-max-kit`：更偏 spec-driven project memory / phase harness；不是 loop operation。

**邻近替代：**

- GitHub Actions + Renovate/Dependabot + Mergify：传统确定性自动化能覆盖 dependency/CI/merge 部分，但缺少 agent reasoning 与 triage 综合判断。
- Linear/Jira automation + Slack bot：适合运营流转，不负责代码修复/verifier/worktree。
- 内部 agent platform / Hermes cron + skills：更灵活，但需要自己沉淀 patterns、state、budget、audit。

**架构邻居：**

- `Agent Reach`：能力层；可给 loops 提供互联网读取/搜索能力，但不设计 loop。
- `CLI-Anything`：agent-native command surface；同样将 agent 操作产品化，但目标是 CLI/harness，而不是 recurring loop。
- `GitNexus` / Code Intelligence 工具：可作为 loop 的 evidence provider，例如 CI triage 或 PR babysitter 需要 impact analysis。

### 社区结论

`loop-engineering` 现在更准确的定位是：**已经跑出明显 GitHub-native traction、docs/showcase/工具面同步扩张，但控制面仍明显 founder-led 的 loop engineering toolkit。** 它值得进入 TK 的 AI Coding Workflow 横评，但结论必须区分：

- 作为个人/小团队试点工具：值得用。
- 作为企业 unattended automation 控制面：不够，需要叠加权限、审计、告警、回滚和组织流程。

---

## 维护 / 接管视角

### 能不能维护

**可外围贡献 / 可逐步深入；不建议一开始接管核心方向。**

原因：项目代码很小、目录清楚、贡献规范明确，适合做小 PR；但“loop engineering”本身的方法论和 pattern taxonomy 由作者主导，过早改核心概念容易偏离项目定位。

### 最佳首批 PR 切入点

1. **registry 单源化**：继续减少 `loop-init` 中 `PATTERN_BUDGET` / first-run mapping 与 `patterns/registry.yaml` 的重复，避免 cost cap 和 docs 漂移。
2. **fixture matrix 扩展**：给 `loop-sync`、`loop-context`、`loop-worktree`、`loop-mcp-server` 补 target repo fixtures，覆盖 false positive/negative、无 Git 仓库、Windows path、脏 worktree、ledger stagnation、path safety。
3. **structured dry-run / plan 输出**：让 `loop-init`、`loop-worktree` 输出更稳定的 JSON/operation plan，方便团队审副作用。
4. **宿主支持补强**：把 Cursor / Windsurf / OpenClaw / Hermes 从 examples/manual 路径逐步推向更一等的 scaffold 或至少更完整的 migration guide。
5. **MCP/root safety 强化**：补更多 `LOOP_PROJECT_ROOT`、path traversal、read-only / propose-only connector examples 与测试。
6. **adopters / hard-failure 案例补强**：补真实 production story、失败复盘、rollback playbook，比继续堆 showcase 更能提升信度。
7. **release/docs matrix 去重**：随着 per-tool workflows 增多，适合抽公共 release/build/docs 骨架，减少维护碎片。

### 不建议一开始碰的区域

- L1/L2/L3 readiness 语义大改。
- pattern taxonomy 全面重命名。
- 自动 merge / unattended fix 默认策略。
- 多宿主 tool support 声明扩大到未验证平台。
- 把项目重构成重型平台或 daemon；这会违背它当前轻量 reference/toolkit 的优势。

### 维护流程建议

- 先读 `CONTRIBUTING.md`、`AGENTS.md`、`LOOP.md`、`docs/safety.md`、`patterns/registry.yaml`。
- 一 issue 一 PR，优先文档、schema、fixture、低风险 CLI 输出改进。
- 对 CLI 改动至少说明：`npm run build`、`node --test`、对应 `loop-init --dry-run` 或 `loop-audit --json` 验证；如果未运行，PR body 要如实写明。
- 对 pattern 改动必须同步 registry、docs、starter、cost cap、tests，否则很容易产生漂移。

---

## 关键代码走读

### `patterns/registry.yaml`

这是项目的事实源。它把 pattern 从 Markdown 文章提升为可编程对象：id、name、cadence、risk、readiness、token_cost、cost scenarios、state_file、required_skills、human_gates、tools。`loop-cost` 和未来 tooling 都依赖这个结构。

### `patterns/registry.schema.json`

registry 的结构化约束。对于 workflow toolkit 来说，schema 的意义是防止“文档看起来像 pattern，但缺少 cost/human gate/state file 等关键字段”。这也是把方法论工程化的关键。

### `tools/loop-audit/src/auditor.ts`

readiness audit 的核心。它不是简单检查文件存在，而是组合扫描 state files、skills、verifier、`LOOP.md`、GitHub workflows、MCP hints、worktree evidence、registry、budget/run-log、loop activity，并通过 `computeScore()` 给出 L0-L3。最值得学的是 L3 gating：即使分数够，如果 cost observability 或 real activity 不完整，也会降级。

### `tools/loop-init/src/cli.ts`

scaffold CLI。其价值不在参数解析，而在它知道每个 pattern 的 state file、starter、budget、first loop command、L2 所需 minimal-fix/verifier。它将 “copy starter” 升级成 “创建可运营 loop 骨架”。

### `tools/loop-cost/src/estimator.ts`

成本估算器。它将 cadence 解析为 runs/day，再按 noop/report/action/realistic blend 估算 token/day。虽然模型简单，但抓住了 loop 成本管理的核心：**最坏情况、现实混合、高频 warning、early-exit requirement**。

### `tools/loop-context/src/context-manager.ts`

这是 7 月版本最关键的新补丁之一。它把 loop 内“重复失败 / 无进展 / token 透支 / 迭代过多”从主观感受变成 deterministic breaker：归一化 error、压缩 ledger、检测 stagnation/no-progress，必要时直接阻止 loop 继续烧钱。

### `tools/mcp-server/src/index.ts`

这说明项目边界已经从“只会写文件的 starter”扩到“可被外部 agent 运行时查询的 loop resource surface”。它不是执行 runtime，但让 patterns、skills、state、budget、run-log 能按需暴露给 MCP client，是把静态文档层变成可编程资源层的关键一步。

### `tools/loop-worktree/src/cli.ts`

worktree 管理器把“每次修复在独立工作树里做”从流程建议升级为工具能力：create/mark/cleanup/gc/list + manifest 让 L2/L3 loop 的隔离执行、回收和复盘更容易工程化。

### `.github/workflows/daily-triage.yml`

项目自身 dogfood 的核心 workflow。它说明 loop-engineering 不是只写模板，而是把 daily triage 真实跑在本仓库上，并通过 PR 更新 `STATE.md` 与 run log；最新 `8bce2fb` 仍是这条链路的直接产物。

### `docs/safety.md` / `SECURITY.md`

这两份文件明确 unattended automation 风险：恶意依赖、MCP 过权限、prompt secret exfiltration、无限 fix loop、supply-chain PR。它们把 loop 的安全风险说得很直接，是 L2/L3 前必须读的部分。

### `LOOP.md` / `STATE.md` / `loop-budget.md` / `loop-run-log.md`

这四个文件是项目自身作为 target project 的运行状态：loop contract、当前状态、预算上限、运行记录。它们合起来展示了 loop-engineering 最重要的主张：**loop 必须有可审计的状态面。**

---

## 评分

| 维度 | 分数 | 说明 |
|------|------|------|
| 功能覆盖度 | 5 | 从 patterns/starters 到 audit、init、cost、sync、context、worktree、MCP、Pages/showcase，loop operation surface 已很完整。 |
| 代码质量 | 4 | deterministic 小工具策略清楚、类型边界好；但包/文档/release 面增长快，统一抽象与维护碎片仍要持续收敛。 |
| 文档质量 | 5 | README、Quickstart、Pages、primitives、safety、examples、release/community surface 都很强。 |
| 社区活跃度 | 4 | GitHub-native traction 很强（6545 stars / 838 forks / contributors API 14），但仍明显 founder-led，真实长期案例少于热度。 |
| 架构设计 | 5 | pattern registry + state/constraints/budget/run-log + audit/cost/sync/context/worktree/MCP 组合非常完整。 |
| 学习价值 | 5 | 非常适合学习 recurring agent loop 如何产品化和运营化。 |
| 可借鉴度 | 5 | registry、readiness audit、cost estimator、state/run-log/budget、breaker、worktree、MCP resource surface 都可直接迁移。 |

**总分：33/35**

---

## 总结

### 一句话评价

`loop-engineering` 是 AI coding workflow 里少见的 **loop operation toolkit**：它不发明新 agent，而是把已有 agent harness 的周期性使用，拆成 pattern、starter、state、constraints、budget、run-log、audit、cost、sync、context breaker、worktree、MCP resource 这些可工程化对象。

### 谁应该用

- 想把 daily triage、PR babysitter、CI sweeper、dependency sweeper 做成 L1/L2 试点的个人或小团队。
- 已经有 Grok / Claude Code / Codex / Opencode 使用习惯，但缺少 loop 状态、预算、breaker 和验证纪律的团队。
- 想学习 agent loop 运营系统如何设计的人。

### 谁不应该直接用

- 期待完整 agent runtime、IDE、服务端、权限系统、多租户审计平台的人。
- 想一键开启 unattended auto-fix / auto-merge 的团队。
- 对长期维护稳定性要求极高、不能接受早期项目风险的生产组织。

### 下一步

1. **试用：** 从 `daily-triage` 或 `pr-babysitter` 的 L1 report-only 开始，先 `loop-init --dry-run`，再落盘。
2. **架构学习：** 优先读 `patterns/registry.yaml`、`tools/loop-audit/src/auditor.ts`、`tools/loop-context/src/context-manager.ts`、`tools/mcp-server/src/index.ts`、`tools/loop-worktree/src/cli.ts`、`docs/safety.md`。
3. **内部借鉴：** 把 `STATE.md + LOOP.md + loop-constraints.md + loop-budget.md + loop-run-log.md + readiness audit + breaker` 这套状态面迁移到自己的 Hermes/agent workflow 体系。
4. **生产化前补强：** 接入权限最小化、worktree isolation、CI verifier、token budget alert、manual approval、run log retention、rollback 和 case-study 驱动的安全演练。
