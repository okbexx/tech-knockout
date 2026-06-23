# loop-engineering

> 一句话定位：**loop-engineering 是一套面向 AI coding agent 的“循环工程”参考实现与工具箱：用机器可读 pattern registry、Grok / Claude Code / Codex / GitHub Actions starters，以及 `loop-audit` / `loop-init` / `loop-cost` 三个 npm CLI，把 triage、PR babysitting、CI sweeping、dependency sweeping、changelog drafting 等 recurring engineering tasks 产品化为可审计、可控成本、可逐级放权的工程回路。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `cobusgreyling/loop-engineering` |
| URL | `https://github.com/cobusgreyling/loop-engineering` |
| Star | 262（2026-06-16 观测） |
| Fork | 37 |
| 许可证 | MIT |
| 主要语言 | JavaScript / TypeScript / Shell；核心资产是 Markdown patterns / starters |
| 默认分支 | `main` |
| GitHub created_at | 2026-06-09 |
| 首次提交 | 2026-06-09 `789233c Cobus Greyling Initial commit: loop-engineering reference repo` |
| 最近提交 | 2026-06-15 `8710657 github-actions[bot] chore(loop): daily triage update STATE.md + run log [automated] (#36)` |
| 最新 Git tag | `loop-audit-v1.4.1`、`loop-init-v1.2.1`、`loop-cost-v1.0.2`（均指向 `dafabcb`） |
| GitHub latest release | 无；`/releases/latest` 返回 404（项目使用 package-specific tags + npm 发布） |
| npm packages | `@cobusgreyling/loop-audit@1.4.1`、`@cobusgreyling/loop-init@1.2.1`、`@cobusgreyling/loop-cost@1.0.2` |
| Open Issues / PRs | 6 issues / 4 PRs；GitHub `open_issues_count=10` 含 PR |
| 贡献者 | GitHub contributors API 返回 2；本地 shortlog：Cobus Greyling 40、github-actions[bot] 3、loop-engineering-bot 1 |
| 本地规模 | 222 tracked files；121 Markdown；30 TS/JS/MJS/Shell；核心 CLI 与脚本约 1,566 行 |
| 分析日期 | 2026-06-16 |
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

- 提供 7 个已登记 loop pattern：`daily-triage`、`pr-babysitter`、`issue-triage`、`ci-sweeper`、`post-merge-cleanup`、`dependency-sweeper`、`changelog-drafter`。
- 用 `patterns/registry.yaml` 记录每个 pattern 的 cadence、risk、readiness level、token cost、suggested daily cap、required skills、state file、human gates、tools 支持。
- 用 `loop-init` 根据 `--pattern` 与 `--tool` 将 starter、state file、`LOOP.md`、skills / agents、`loop-budget.md`、`loop-run-log.md` 落盘到目标项目。
- 用 `loop-audit` 检查一个项目是否具备 loop readiness：state file、triage/verifier skill、`LOOP.md`、AGENTS/CLAUDE、safety doc、GitHub workflows、MCP、worktree、registry、budget/run-log、真实 loop activity。
- 用 `loop-cost` 基于 registry 估算不同 cadence 与 L1/L2/L3 readiness level 的 tokens/day，并对 high cadence、early-exit 缺失、超 daily cap 发 warning。
- 提供 Grok / Claude Code / Codex / GitHub Actions 的 starters 和 examples，将同一 loop 模式映射到不同宿主。
- 项目自身 dogfood：`STATE.md`、`loop-budget.md`、`loop-run-log.md`、daily triage / readiness audit / changelog drafter Actions、自动 PR 合并记录都在仓库内可见。

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

- **依赖链低。** 三个 npm CLI 都是 Node/TypeScript 小包。`loop-audit` / `loop-init` 无 runtime deps；`loop-cost` 仅依赖 `yaml`。
- **安装方式轻。** README 推荐 `npx @cobusgreyling/loop-audit . --suggest`、`npx @cobusgreyling/loop-init . --pattern <name> --tool <grok|claude|codex>`、`npx @cobusgreyling/loop-cost --pattern <name>`。
- **落地副作用可控但真实存在。** `loop-init` 会在目标项目写入 `.grok/.claude/.codex` skills/agents、state file、`LOOP.md`、`loop-budget.md`、`loop-run-log.md`、`AGENTS.md` 模板。虽然不是重型 installer，但仍应先 `--dry-run`。
- **学习成本来自 loop operation。** 用户需要理解 pattern、cadence、L1/L2/L3、state、human gates、verifier、budget 和 run log；不是装一个 CLI 就自动安全。
- **从零到 demo：** 个人项目可当天跑 L1 report-only；团队要进入 L2/L3，至少需要一周报告模式校准、MCP/权限/CI/worktree gate 审计。

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | 低 | MIT；npm packages 也声明 MIT。 |
| Bus factor | 高 | 项目创建不足 10 天，主要由 Cobus Greyling 提交，机器人提交辅助 dogfood；贡献者样本很少。 |
| 供应商锁定 | 低 | 核心是 Markdown + YAML + npm CLI；Grok/Claude/Codex starter 可手动迁移。 |
| 维护趋势 | 活跃但样本短 | 2026-06-09 创建，44 commits，近期 Actions/PR/dogfood 活跃；但长期维护尚未被时间验证。 |
| 安全攻击面 | 中 | CLI 写入 workflow/skill/state 文件，L2/L3 loop 可能触发自动改代码；需要严格审 `LOOP.md`、MCP scope、auto-merge、人类 gate。 |
| 生产成熟度 | 中低 | 适合 pattern/starter 参考和 L1/L2 试点；不是企业级控制面，也没有成熟权限/审计/多租户能力。 |
| 文档漂移 | 中 | README、docs、registry、starter 同步目前靠脚本和 CI 检查；项目早期快速变化，采用前应锁定 package/tag。 |
| 成本失控风险 | 中 | 高频 loops 明确被 `loop-cost` 标记 high cadence / early-exit required；如果用户绕过预算文件与 run log，风险仍在。 |

### 采用结论

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
│       reference repo + dogfooded loop operation toolkit              │
└──────────────────────────────────┬─────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────┐
│                     Pattern Source of Truth                         │
│ patterns/registry.yaml + patterns/*.md                              │
│ - id / cadence / risk / readiness / cost / state_file               │
│ - required skills / human gates / tool support                      │
└──────────────────────────────────┬─────────────────────────────────┘
                                   │ read/bundle
┌──────────────────────────────────▼─────────────────────────────────┐
│                          CLI Tool Plane                             │
│ loop-init              loop-audit               loop-cost           │
│ scaffold assets        score readiness          estimate tokens/day │
└───────────────┬──────────────────┬──────────────────┬──────────────┘
                │                  │                  │
                │ writes           │ scans            │ calculates
                ▼                  ▼                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                         Target Project                              │
│ AGENTS.md / CLAUDE.md · LOOP.md · STATE.md                          │
│ loop-budget.md · loop-run-log.md                                    │
│ .grok/.claude/.codex skills + verifier agents                       │
└──────────────────────────────────┬─────────────────────────────────┘
                                   │ scheduled by
┌──────────────────────────────────▼─────────────────────────────────┐
│                         Host Harnesses                              │
│ Grok loop · Claude Code loop · Codex Automation · GitHub Actions     │
│ - own LLM/tool execution, permissions, CI, PR comments, scheduling   │
└──────────────────────────────────┬─────────────────────────────────┘
                                   │ updates
┌──────────────────────────────────▼─────────────────────────────────┐
│                         Loop Observability                          │
│ STATE.md status · loop-run-log.md run history · budget caps          │
│ GitHub PRs/issues/comments · workflow logs                           │
└────────────────────────────────────────────────────────────────────┘
```

### 最小架构内核

脱掉 README、品牌和具体宿主之后，`loop-engineering` 的最小可复刻内核是：

> **Pattern Registry + Tool-specific Starters + Durable Loop State + Budget/Run-log Observability + Readiness Audit + Cost Estimator + L1/L2/L3 Rollout Contract**

它不是“一个 agent”，而是一个 **loop operation protocol**：

1. 先把适合循环运行的工程任务抽成 pattern。
2. 用 registry 给 pattern 加 cadence、risk、cost、state file、human gates、skills、tool support。
3. 用 starter 将 pattern 物化到目标项目。
4. 用 audit 判断项目是否 ready。
5. 用 cost estimator 判断 cadence 是否会烧穿预算。
6. 用 state/run-log/budget 把每次循环变成可审计事实。
7. 用 L1/L2/L3 分阶段放权，而不是一上来 unattended。

### 核心抽象

| 抽象 | 文件 / 目录 | 职责 | 为什么重要 |
|------|-------------|------|------------|
| Pattern | `patterns/*.md`、`patterns/registry.yaml` | 描述一个 recurring loop 的目标、调度、状态、技能、验证、人类交接、失败模式和成功指标 | 把“让 agent 定期做事”从口头命令变成可复用 SOP |
| Registry Entry | `patterns/registry.yaml` + schema | 机器可读的 pattern metadata：cadence、risk、readiness、token cost、required skills、state file、human gates、tools | CLI、docs、cost estimator 与 future tooling 的共同事实源 |
| Starter | `starters/*`、`templates/*` | 将 pattern 预制成 Grok/Claude/Codex 可用的 skills、agents、state examples、`LOOP.md` | 降低从理念到落地的第一步成本 |
| Loop State | `STATE.md` / pattern-specific state | 记录 watchlist、last run、loop action、human decision、resolved/noise | 没有 durable state，loop 每次都从零开始，无法交接或复盘 |
| Loop Config | `LOOP.md` | 记录 cadence、scope、denylist、human gates、budget、kill switch、MCP/权限边界 | 把 loop 的控制面放进 repo，可 review、可 diff、可被 agent 读取 |
| Readiness Audit | `tools/loop-audit/src/auditor.ts` | 扫描 target repo 的 state、skills、verifier、safety、workflows、budget、run-log、real activity 并给 L0-L3 | 避免团队在没有状态/验证/预算时误开自动 loop |
| Initializer | `tools/loop-init/src/cli.ts` | 根据 pattern + tool 拷贝 starter、生成 budget/run-log、补 minimal-fix/verifier/AGENTS | 把 loop pattern 从文档变成 target repo 内的实际文件 |
| Cost Model | `tools/loop-cost/src/estimator.ts` | 解析 cadence，估算 no-op/report/action/realistic tokens/day，输出 warnings | 把高频 loop 的 token 风险显式化 |
| Verifier / Maker-checker | `skills/loop-verifier`、starter agents | L2+ 中独立验证 agent 产物，不让 implementer 自证完成 | 自动修复类 loop 的安全基本盘 |

### 控制面 / 数据面分离

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

仓库最新提交 `8710657` 就是 daily triage 自动更新 `STATE.md` + run log 的结果。这是它比纯文档项目更可信的地方：它用自己的 loop 工具维护自己。

### 状态模型

1. **Pattern state（静态事实源）**：`patterns/registry.yaml` + `patterns/*.md`。由维护者更新，CLI bundle/read，docs 引用。
2. **Scaffold state（目标项目初始状态）**：`starters/*`、`templates/*` 复制到目标项目后成为用户自己的文件。
3. **Loop runtime state（运行状态）**：`STATE.md` / pattern-specific state。每次 loop 必须更新 last run、action、human decision、resolved/noise。
4. **Observability state（审计状态）**：`loop-run-log.md` 记录 run history；`loop-budget.md` 记录 cap、kill switch、预算策略。
5. **External state（外部事实）**：GitHub issue/PR/CI、MCP connector、Linear/Slack 等；loop 读取和评论，但事实源不在本仓库。
6. **Release/package state（分发状态）**：package-specific tags + npm registry；GitHub Releases 目前为空。

状态模型的核心不变量：**loop 的长期记忆必须在 repo 或共享系统里，而不是只留在某个 agent 会话里。**

### 契约边界

- **Registry 契约：** `registry.yaml` 必须符合 `patterns/registry.schema.json`；每个 pattern 需要 id、name、cadence、risk、readiness、cost、skills、state_file 等关键字段。
- **Pattern 文档契约：** 每个 pattern 应覆盖 goal、scheduling、required skills、state schema、cycle、verification、human handoff、tool notes、failure modes、success metrics。
- **CLI 契约：**
  - `loop-init [target-dir] --pattern <name> --tool <grok|claude|codex> [--dry-run]`
  - `loop-audit <target> [--json|--markdown|--suggest]`
  - `loop-cost --pattern <id> [--cadence <interval>] [--level L1|L2|L3] [--conservative]`
- **Target repo 契约：** 若想进入 L2/L3，必须有 state file、triage skill、verifier、safety gates、budget、run log、真实 loop run 证据。
- **Agent-facing 契约：** skills 明确要求 report-only week one、maker/checker、human handoff、denylist、不要 auto-merge；`LOOP.md` 是 agent 每轮读取的 operational contract。
- **Human gate 契约：** 安全、auth、payments、infra、multi-file refactor、auto-merge、超过尝试次数等必须交给人。

### 失败与降级模型

| 失败类型 | 检测方式 | 降级 / 恢复 |
|----------|----------|-------------|
| 没有 state file | `loop-audit` fail | 从 starter 复制 `STATE.md.example`，先 L1 report-only |
| 没有 triage/verifier | `loop-audit` warn | 安装 `loop-triage` / `loop-verifier`，L2 前必须补 maker/checker |
| 没有 budget/run-log | `loop-audit` warn，L3 cap | 生成 `loop-budget.md`、`loop-run-log.md`，记录 kill switch |
| 高频 cadence 烧 token | `loop-cost` high cadence / cap warning | 降低 cadence、加 early-exit、收紧 watchlist、设 daily cap |
| loop 空转 / 噪音 | state/run-log 中 unresolved/noise 增长 | tighten skill rules，增加 noise section，降低运行频率 |
| auto-fix 错误 | verifier / human gate | 降级到 L1/L2，限制 allowlist，停止 auto-merge |
| MCP/connector 权限过大 | `docs/safety.md` / `LOOP.md` scope review | L1 只读，L2 只 comment/draft PR，写权限最小化 |
| 状态膨胀 | state 文件越来越长 | 每轮 prune merged/closed/resolved，保留 watchlist + decisions |
| workflow 同日重跑冲突 | closed PR #29/#28 说明已遇到 | 修 checkout/push 同步逻辑，将 PR merge 与 run-log 更新一致化 |
| package/release 口径混乱 | GitHub release 404，但 npm/tag 有版本 | 报告中分开 Git tag、npm latest、GitHub Release，不混用 |

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
├── README.md                  # 项目定位、安装、quick start、pattern 导览
├── LOOP.md                    # 仓库自身 loop contract：cadence、budget、human gates
├── STATE.md                   # 仓库自身 daily triage / loop 状态
├── loop-budget.md             # 仓库自身 token cap、kill switch、预算策略
├── loop-run-log.md            # 仓库自身 loop 运行记录
├── patterns/                  # pattern 文档与 registry/schema
│   ├── registry.yaml
│   ├── registry.schema.json
│   └── *.md                   # daily-triage, pr-babysitter, ci-sweeper 等
├── starters/                  # 可复制到目标项目的 Grok/Claude/Codex starter
├── templates/                 # skill/state/budget/run-log 模板
├── skills/                    # 仓库自身 loop skills：triage/verifier/budget 等
├── tools/
│   ├── loop-audit/            # readiness audit CLI
│   ├── loop-init/             # scaffold CLI
│   └── loop-cost/             # token/cadence cost CLI
├── scripts/                   # registry validation、CI gates、bundle assets、run-log append
├── docs/                      # primitives、safety、operating loops、release、MCP cookbook
├── examples/                  # GitHub Actions、MCP、tool-specific examples
├── stories/                   # production story 模板/示例入口
└── .github/workflows/         # validate、audit、daily triage、release、dogfood workflows
```

### 技术栈

- **运行时 / 语言：** Node.js + TypeScript；辅助脚本为 JavaScript/MJS/Shell；核心内容资产为 Markdown/YAML。
- **构建：** 每个 CLI 包独立 `tsc`；`loop-init` 与 `loop-cost` 在 build 前 bundle starters/registry。
- **测试：** Node 内置 `node:test` + `assert`；三个工具包各有独立测试。
- **发布：** package-specific Git tags + GitHub Actions 发布到 npm，使用 npm provenance / OIDC；GitHub Releases 未使用。
- **CI：** registry/schema 校验、loop-init sync 检查、loop readiness audit dogfood、daily triage dogfood、changelog drafter dogfood、release workflows。

### 模块依赖关系

```text
patterns/registry.yaml
  ├─ scripts/validate-registry.mjs      # schema + docs consistency gate
  ├─ tools/loop-cost/scripts/bundle-registry.mjs
  │   └─ tools/loop-cost/src/estimator.ts
  └─ docs/patterns/starter docs

starters/ + templates/
  ├─ tools/loop-init/scripts/bundle-assets.mjs
  └─ tools/loop-init/src/cli.ts
      └─ writes target repo assets

target repo files
  ├─ tools/loop-audit/src/auditor.ts scans readiness
  └─ host harness / GitHub Actions reads and executes loop contracts
```

### 扩展机制

1. **新增 pattern：** 添加 `patterns/<id>.md`，并在 `patterns/registry.yaml` 注册；通过 `registry.schema.json` 与 `scripts/validate-registry.mjs` 校验。
2. **新增 starter：** 在 `starters/<pattern>` 或 tool-specific variant 中加入 skills/agents/state/LOOP 模板，并同步 `loop-init` 的 pattern mapping。
3. **新增宿主工具：** 扩展 `Tool` 类型、`TOOL_SUFFIX`、destination paths、first loop command、starter layout；目前显式支持 Grok / Claude / Codex，GitHub Actions 通过 examples/workflows 体现。
4. **新增 cost policy：** 在 registry 与 `PATTERN_BUDGET`/bundle 中更新 tokens/noop/report/action、daily cap、early-exit requirement。
5. **新增 audit signal：** 在 `LoopSignals`、`auditProject()`、`computeScore()` 和 reporter 中增加扫描项与评分规则。

---

## 质量与成熟度

### 代码质量

优点：

- **代码面很小、职责集中。** 核心 TypeScript/MJS/Shell 约 1,566 行，读完主要执行链路成本低。
- **类型边界清楚。** `LoopSignals`、`AuditResult`、`RegistryPattern`、`EstimateInput/Result` 等 interface 明确表达数据模型。
- **零/低依赖策略好。** `loop-audit` / `loop-init` 无 runtime deps；`loop-cost` 仅 `yaml`，降低供应链面。
- **policy 写进代码。** `computeScore()` 对 L3 的 costReady / hasRealActivity 限制，是一个小但重要的安全设计。
- **dogfood 证据真实。** 仓库内 `STATE.md`、`loop-run-log.md`、Actions、自动 PR/merge 记录说明项目确实在跑自己的 loop。

问题：

- **项目非常新。** 2026-06-09 创建，样本期不足一周，长期代码质量和维护节奏仍待观察。
- **CLI 不是平台级抽象。** `loop-init` 中 pattern/tool 映射偏硬编码；未来 pattern/tool 增多后需要更数据驱动。
- **registry 与 `PATTERN_BUDGET` 有重复。** `loop-init` 内部 mirror registry cost cap，长期可能漂移；更理想是从 bundled registry 统一读取。
- **测试覆盖集中在核心 happy path。** 有单元/CLI smoke，但缺少更丰富的 fixture matrix、跨平台路径、真实 target repo audit regression。

### 测试

本轮未运行项目测试；静态读取到的测试结构：

- `tools/loop-audit/test/auditor.test.mjs`：测试空目录 readiness、minimal-loop scoring、cost observability、loop activity、markdown/json output、`--suggest` 等。
- `tools/loop-init/test/cli.test.mjs`：测试 `--help`、dry-run scaffold、`ci-sweeper` bundled assets 是否包含 state、skills、budget、run-log、loop-budget skill。
- `tools/loop-cost/test/estimator.test.mjs`：测试 cadence interval、range conservative、CI sweeper 高频 warning、daily triage 低成本估算。

测试哲学是“核心规则回归”而不是覆盖率优先。对一个早期 toolkit 来说够用，但若要团队生产化，建议补：Windows path、已有 `.claude/.codex` 合并、registry 全 pattern scaffold fixture、Actions workflow dry-run、audit false positive/negative 样本。

### CI/CD 与发布

- `.github/workflows/validate-patterns.yml`：校验 registry 和 loop-init sync。
- `.github/workflows/audit.yml`：dogfood loop readiness audit，构建 `loop-audit` 后审计当前仓库。
- `.github/workflows/daily-triage.yml`：定时 triage，更新 state/run log 并开 PR。
- `.github/workflows/release-loop-audit.yml` / `release-loop-init.yml` / `release-loop-cost.yml`：tag 触发测试、构建、`npm publish --provenance`。
- `.github/ruleset-main-protection.json`：有 main protection 规则快照。

GitHub Actions 最近 10 次 API 观测中，`Changelog Drafter (dogfood)`、`Loop Readiness Audit (dogfood)`、`Daily Triage (dogfood)`、release package workflows 均有 success 记录。closed PR #28/#29 也显示项目在修 dogfood workflow 的同日重跑、checkout/push 问题。

### 文档质量

文档是项目的主体，质量较高：

- `README.md` 定位清楚，能快速引导到 patterns、starters、CLI。
- `docs/primitives.md` 将 loops 拆成 state、cadence、skills、verification、budget 等 primitives。
- `docs/operating-loops.md` / `docs/loop-design-checklist.md` 给出运行和设计检查表。
- `docs/safety.md` / `SECURITY.md` 对 unattended automation、MCP scope、secret exfiltration、auto-merge、kill switch 有明确风险提示。
- `examples/mcp/README.md` 强调 read + comment 优先、最小权限、human gate、safe propose flow。

不足是项目早期文档多、代码少，真实用户 story/adopters 还少；部分模式还更像“高质量模板”而不是大量生产案例沉淀。

### Issue/PR 健康度

- Open issues 6，多数是 release prep、weekly loop report、docs/adopters、examples/story 补齐类任务。
- Open PRs 4，均是 Dependabot 版本升级（TypeScript / @types/node）。
- Closed PR page 最近 10 个里 9 个 merged，包含 daily triage、discoverability、workflow fix、package metadata、release prep 等。
- API contributors 仅 2，真实 bus factor 仍高。

健康度判断：**活跃、会 dogfood、治理入口清楚，但社区成熟度仍很早期。** 不应因短期 PR/Actions 活跃而高估生产稳定性。

---

## 社区与生态

### 热度与认可度

项目创建一周内达到 262 stars / 37 forks，对 niche workflow toolkit 来说传播不错，但还不能视为成熟 adoption。

GitHub search `"loop-engineering"` 显示同名/相关仓库已有 100+ 搜索结果，其中 `cobusgreyling/loop-engineering` 是 canonical；另有 `loop-engineering-orange-book` 等内容型衍生，但还没有形成稳定插件生态。

HN/公开社交搜索信号很弱，本轮只看到非常稀疏的“loop engineering”相关命中，不能据此推断广泛社区评价。当前更应把它看作 **早期、高质量、作者驱动的 reference toolkit**。

### 生态位置

`loop-engineering` 位于 AI coding stack 的 **loop operation layer**：

```text
Model Provider
  ↓
Coding Agent Runtime / Harness（Grok / Claude Code / Codex / GitHub Actions）
  ↓
Workflow Discipline / Harness Assets（superpowers / ECC / CE / vibecode）
  ↓
Loop Operation Layer（loop-engineering）
  ↓
Project Artifacts（STATE.md / LOOP.md / PRs / CI / run log / budget）
```

它不是 runtime，也不是大一统 workflow substrate；它更像在已有 harness 之上回答：**哪些事该循环跑、怎么跑、多久跑一次、谁来验证、什么时候停。**

### 竞品分层

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

`loop-engineering` 目前更像一个 **方向清楚、文档与 dogfood 很强、但仍处早期的 loop engineering seed project**。它值得进入 TK 的 AI Coding Workflow 横评，但结论必须区分：

- 作为个人/小团队试点工具：值得用。
- 作为企业 unattended automation 控制面：不够，需要叠加权限、审计、告警、回滚和组织流程。

---

## 维护 / 接管视角

### 能不能维护

**可外围贡献 / 可逐步深入；不建议一开始接管核心方向。**

原因：项目代码很小、目录清楚、贡献规范明确，适合做小 PR；但“loop engineering”本身的方法论和 pattern taxonomy 由作者主导，过早改核心概念容易偏离项目定位。

### 最佳首批 PR 切入点

1. **registry 单源化**：减少 `loop-init` 中 `PATTERN_BUDGET` 与 `patterns/registry.yaml` 的重复，避免 cost cap 漂移。
2. **audit fixture 扩展**：增加多个 target repo fixture，覆盖 false positive/negative、无 Git 仓库、Windows path、已有 `.claude/.codex` 场景。
3. **loop-init dry-run 更结构化**：输出 JSON plan 或 operation count，方便团队审副作用。
4. **package release docs 对齐**：明确 GitHub Release 为空、tag/npm 是真实版本口径，减少用户困惑。
5. **examples 补齐**：open issue #19 指向 issue-triage examples；这是低风险高价值文档贡献。
6. **adopters/story 模板补强**：open issue #20/#18 需要真实 adoption/story；可以贡献匿名生产案例。
7. **MCP safe config 扩展**：补更多 read-only / propose-only connector examples。

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

## 关键文件走读

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

### `.github/workflows/daily-triage.yml`

项目自身 dogfood 的核心 workflow。它说明 loop-engineering 不是只写模板，而是把 daily triage 真实跑在本仓库上，并通过 PR 更新 `STATE.md` 与 run log。closed PR #28/#29/#36 都是这条链路的运行证据。

### `docs/safety.md` / `SECURITY.md`

这两份文件明确 unattended automation 风险：恶意依赖、MCP 过权限、prompt secret exfiltration、无限 fix loop、supply-chain PR。它们把 loop 的安全风险说得很直接，是 L2/L3 前必须读的部分。

### `LOOP.md` / `STATE.md` / `loop-budget.md` / `loop-run-log.md`

这四个文件是项目自身作为 target project 的运行状态：loop contract、当前状态、预算上限、运行记录。它们合起来展示了 loop-engineering 最重要的主张：**loop 必须有可审计的状态面。**

---

## 评分（1-5）

| 维度 | 分数 | 说明 |
|------|------|------|
| 功能覆盖度 | 4 | 覆盖 patterns、starters、audit、init、cost、dogfood；但不是 runtime/control plane。 |
| 代码质量 | 4 | 代码小、类型清楚、依赖少、policy 明确；早期项目，映射仍有硬编码和重复源。 |
| 文档质量 | 5 | primitives、safety、operating loops、pattern docs、MCP cookbook 都很清楚。 |
| 社区活跃度 | 2 | 一周内传播不错，但 contributors/issue/adoption 样本太少。 |
| 架构设计 | 5 | pattern registry + state/budget/run-log + audit/cost/L1-L3 组合很完整。 |
| 学习价值 | 5 | 非常适合学习 recurring agent loop 如何产品化和运营化。 |
| 可借鉴度 | 5 | registry、readiness audit、cost estimator、state/run-log/budget 模式可直接迁移。 |

**总分：30/35**

---

## 总结

### 一句话评价

`loop-engineering` 是 AI coding workflow 里少见的 **loop operation toolkit**：它不发明新 agent，而是把已有 agent harness 的周期性使用，拆成 pattern、starter、state、budget、run-log、audit、cost、human gate 这些可工程化对象。

### 谁应该用

- 想把 daily triage、PR babysitter、CI sweeper、dependency sweeper 做成 L1/L2 试点的个人或小团队。
- 已经有 Grok / Claude Code / Codex 使用习惯，但缺少 loop 状态、预算和验证纪律的团队。
- 想学习 agent loop 运营系统如何设计的人。

### 谁不应该直接用

- 期待完整 agent runtime、IDE、服务端、权限系统、多租户审计平台的人。
- 想一键开启 unattended auto-fix / auto-merge 的团队。
- 对长期维护稳定性要求极高、不能接受早期项目风险的生产组织。

### 下一步

1. **试用：** 从 `daily-triage` 或 `pr-babysitter` 的 L1 report-only 开始，先 `loop-init --dry-run`，再落盘。
2. **架构学习：** 优先读 `patterns/registry.yaml`、`tools/loop-audit/src/auditor.ts`、`tools/loop-init/src/cli.ts`、`tools/loop-cost/src/estimator.ts`、`docs/safety.md`。
3. **内部借鉴：** 把 `STATE.md + LOOP.md + loop-budget.md + loop-run-log.md + readiness audit` 这套状态面迁移到自己的 Hermes/agent workflow 体系。
4. **生产化前补强：** 接入权限最小化、worktree isolation、CI verifier、token budget alert、manual approval、run log retention 和 rollback。