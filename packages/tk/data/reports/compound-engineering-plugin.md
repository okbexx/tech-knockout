# compound-engineering-plugin

> 一句话定位：**Compound Engineering 是 EveryInc 把“复利工程”编码成 AI coding workflow 的插件系统：以 Claude Code 插件资产为单一源码，向 Codex、OpenCode、Pi、Gemini、Kiro 等宿主转换分发，并用 39 个 skills、43 个 agents 组织 brainstorm → plan → work → review → compound 的团队协作闭环。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `EveryInc/compound-engineering-plugin` |
| URL | `https://github.com/EveryInc/compound-engineering-plugin` |
| Star | 21,460（2026-06-16 观测） |
| Fork | 1,579 |
| Watchers | 109 |
| 许可证 | MIT |
| 语言 / 运行时 | TypeScript + Markdown；Bun / Node.js 22 |
| 默认分支 | `main` |
| GitHub created_at | 2025-10-09 |
| 首次提交 | 2025-10-09 `77de729 Kieran Klaassen Initial commit: Every Marketplace for Claude Code` |
| 最近提交 | 2026-06-15 `2648200 github-actions[bot] chore: release main (#928)` |
| 最新 GitHub Release | `compound-engineering-v3.13.0`（2026-06-15） |
| npm package | `@every-env/compound-plugin`；npm latest 仍为 `3.8.3`（2026-06-16 查询） |
| Open Issues / PRs | 69 issues / 28 PRs（分别查询 Issues 与 Pulls；GitHub `open_issues_count=97` 含 PR） |
| 贡献者 | 本地 shortlog 76；Trevin Chow 390 commits、Kieran Klaassen 187 + 56 commits、github-actions[bot] 69 commits |
| 本地规模 | 566 tracked files；105 `.ts`、387 `.md`、55 个 `tests/**/*.test.ts`；`plugins/compound-engineering` 下 39 个 `SKILL.md`、43 个 agents |
| 分析日期 | 2026-06-16 |
| 分类 | AI Coding Workflow / Agent Harness Workflow / Team Review Workflow |

> 验证边界：本轮按 TK 默认静态边界，只阅读源码、文档、Git 历史、GitHub API、npm registry、CI/workflow 与测试文件；未安装依赖、未运行项目测试/构建、未启动服务。

---

## 场景一：是否值得采用

### 解决的问题

Compound Engineering 解决的不是“模型能不能写代码”，而是 **AI coding 已经能写代码后，团队如何让每次工程任务产生复利，而不是留下更多隐性债务**。

它把 Every 内部 AI coding 方法论拆成一组 agent-facing workflow：

1. **需求不清先 brainstorm。** `/ce-brainstorm` 用问答把模糊想法落成 requirements doc，避免 agent 直接替用户发明产品行为。
2. **实现前先 plan。** `/ce-plan` 把需求转为可审查计划，强调 repo-relative paths、测试场景、决策理由和稳定 Implementation Unit。
3. **执行时分层委派。** `/ce-work` 支持 inline / serial / parallel subagents、worktree 隔离和任务推进。
4. **合并前多 persona review。** `/ce-code-review` 用多个 reviewer agent 对正确性、测试、维护性、安全、性能、迁移、API 契约等维度做并行审查，再合成去重。
5. **解决后沉淀成组织记忆。** `/ce-compound` 把排障/解决过程写入 `docs/solutions/`，让下次 agent 能复用。
6. **策略与产品反馈闭环。** `/ce-strategy` 维护 `STRATEGY.md`，`/ce-product-pulse` 从使用/性能/错误窗口生成 pulse report，给下一次 brainstorm/strategy 提供 grounding。

目标用户：

- 已经使用 Claude Code / Cursor / Codex / Copilot / Droid / Qwen / OpenCode / Gemini / Kiro 等 AI coding harness 的工程团队。
- 想把“个人对话式 AI 编码”升级为“团队可复用 workflow”的技术负责人。
- 想研究多 agent 审查、prompt workflow、插件跨平台分发的 agent infrastructure 设计者。
- 对复盘、知识沉淀、审查质量要求高，愿意接受流程约束的小团队/产品团队。

### 核心能力与边界

**能做什么：**

- 提供一套完整 CE workflow：`ce-strategy`、`ce-ideate`、`ce-brainstorm`、`ce-plan`、`ce-work`、`ce-debug`、`ce-code-review`、`ce-compound`、`ce-product-pulse` 等。
- 把技能、agents、hooks、MCP 配置和平台 manifest 打包成 Claude-compatible plugin，并通过 Bun/TypeScript CLI 转换到 OpenCode、Codex、Pi、Gemini、Kiro。
- 为 Codex 做特殊兼容：native plugin 安装 skills，Bun converter 默认只补 custom agents，避免 skills 双注册。
- 用 managed manifest、legacy backup、safe path filtering、hook merge index、MCP bounded marker 等机制控制安装/重装/清理副作用。
- 用真实插件转换 smoke test 验证 shipping plugin 到每个已实现 target 的结构漂移，而不是只测 toy fixture。
- 将 review、planning、compounding 等复杂 agent 行为写成详细 `SKILL.md`，本身就是 agent runtime contract。

**不能做什么 / 边界：**

- 不是独立 coding agent runtime：不提供模型调用、tool loop、provider routing、session store、权限沙箱或 UI。
- 不保证 agent 绝对遵守流程：强制力主要来自宿主的 skill/plugin/subagent 能力和 prompt contract，不是硬策略引擎。
- 不是轻量“装上就无感”的个人插件：39 skills + 43 agents 有明显心智与上下文成本。
- 对平台能力依赖很强：Claude/Cursor/Copilot/Droid/Qwen 可走 native Claude-compatible plugin；Codex/OpenCode/Pi/Gemini/Kiro 需要 converter 或特殊步骤，体验不完全一致。
- npm 发布状态需要单独核验：2026-06-16 查询 npm `@every-env/compound-plugin` latest 为 `3.8.3`，落后于 repo/package/release 的 `3.13.0`，open issue #933 也指向 npm out-of-date / CI failure。

**与竞品差异：**

| 维度 | compound-engineering-plugin | superpowers | ECC | vibecode-pro-max-kit | loop-engineering |
|------|-----------------------------|-------------|-----|----------------------|------------------|
| 层级 | 团队 workflow + 多 agent review + 知识复利 | 单次任务行为纪律层 | cross-harness workflow substrate / installer / hooks | spec-driven phase harness + project memory | recurring loop pattern / audit / cost toolkit |
| 最小内核 | skills + agents + parser/converter/writer + managed install state | skills + bootstrap + hooks/adapters | manifests + installer + hooks + large asset catalog | agents/skills/hooks + `process/` memory | registry + starters + state/budget/run-log |
| 强项 | 多 persona review、plan/work/compound 闭环、Claude plugin 分发转译 | 轻、纪律强、触发清晰 | 多 harness 统一与安全治理 | 阶段制交付和项目记忆 | 循环任务运营化 |
| 主要风险 | Claude-first、上下文成本、npm 发布口径漂移 | 无硬 runtime enforcement | 重、安装副作用大 | installer/Node/CI 漂移 | 项目新、CLI 薄 |
| 推荐用途 | 团队审查和复利沉淀 | 个人/小团队提升 agent 纪律 | 内部 workflow substrate | 学 spec-driven delivery | 周期性维护 loop |

### 集成成本

- **依赖链低。** CLI 运行时依赖只有 `citty` 和 `js-yaml`；开发/发布依赖集中在 Bun test、semantic-release、release-please。
- **安装路径多但不统一。** Claude Code、Cursor、Copilot、Droid、Qwen 走 native plugin/extension；Codex 需要 marketplace + Bun custom agents + TUI install 三步；OpenCode/Pi/Gemini/Kiro 走 Bun converter。
- **真实副作用存在。** CLI 会写入宿主 home/config：如 `.codex/agents/<plugin>`、`.codex/config.toml`、`.codex/hooks.json`、target-specific skills/prompts/agents。项目用 backup、manifest 和 managed markers 降低风险，但生产环境仍应先隔离试装。
- **学习曲线中高。** 用户要理解 CE 命令、产物目录、workflow 边界、模式参数、subagent 委派和复利文档；不是只多一个 slash command。
- **从零到 demo。** Claude Code/Cursor native install 可很快体验；Codex 完整体验要额外安装 agents；团队真正采用需要约定哪些 workflow 必跑、产物放哪里、review 发现如何进入 PR/issue。

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | 低 | MIT；核心资产是 Markdown/TypeScript，可 fork 与内部分发。 |
| Bus factor | 中 | contributors 76，但提交集中在 Trevin Chow 与 Kieran Klaassen；方向受 Every 团队主导。 |
| 供应商锁定 | 中 | 文本资产可迁移，但 first-class 格式是 Claude Code plugin；其他平台需要转换/适配。 |
| 维护趋势 | 活跃 | 2026-06-15 仍有 release；近期 PR/issue 频繁，merged PR 517。 |
| 发布口径 | 中高 | repo/package/release 为 `3.13.0`，npm latest 查询为 `3.8.3`；采用 CLI 前必须确认实际安装版本。 |
| 运行时副作用 | 中 | installer/cleanup 会改宿主配置与 agent artifacts；安全路径过滤较强，但仍建议 isolated profile。 |
| 上下文成本 | 中高 | 多 skills/agents + review pipeline 会增加 token 和时延；适合高价值任务，不适合每个微小改动都全流程。 |
| 平台兼容 | 中 | open issues 中持续出现 Codex delegation、bundled script、config-read、plugin stale 等跨平台问题。 |
| 企业生产化 | 中 | 适合团队试点 workflow，但缺少中心化权限、审计、多租户、策略 enforcement。 |

### 采用结论

**🟢 推荐采用（团队多 Agent 审查与复利沉淀） / 🟡 企业生产化前需隔离试点。**

理由：

- CE 的核心价值不在“又一堆 prompts”，而在把 brainstorm、plan、work、review、compound 做成连续 workflow，并把多 agent review 的角色、模式、合成、修复责任写成可执行 contract。
- 它对已经重度使用 AI coding 的团队很有价值：能降低“每次 agent 重新学习一次项目”的浪费，也能用 review pipeline 抑制盲目自动改代码。
- 它不是最轻方案。个人用户只想让 agent 遵守基本纪律，`superpowers` 更轻；团队想统一多 harness 安装/治理，`ECC` 更系统；想做 recurring maintenance loop，`loop-engineering` 更直指问题。
- 采用方式建议：先在隔离 profile / throwaway repo 试 `/ce-brainstorm → /ce-plan → /ce-work → /ce-code-review → /ce-compound`，再决定哪些环节进入团队默认流程。Codex 用户必须额外确认 native plugin + Bun agents 安装都完成。

---

## 场景二：技术架构学习

### 核心架构图

```text
┌─────────────────────────────────────────────────────────────────────┐
│                  Compound Engineering Source Repo                    │
│             source-of-truth plugin assets + converter CLI             │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│                         Plugin Asset Plane                           │
│ plugins/compound-engineering/                                        │
│ - .claude-plugin/plugin.json / .codex-plugin / .cursor-plugin        │
│ - skills/*/SKILL.md + references/scripts                             │
│ - agents/*.md                                                        │
│ - hooks / mcp / AGENTS constraints                                   │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ parsed by
┌──────────────────────────────────▼──────────────────────────────────┐
│                         Normalized Claude Model                      │
│ src/parsers/claude.ts → ClaudePlugin                                 │
│ manifest + agents + commands + skills + hooks + mcpServers           │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ routed by
┌──────────────────────────────────▼──────────────────────────────────┐
│                         Target Registry                              │
│ src/targets/index.ts                                                 │
│ opencode / codex / pi / gemini / kiro                                │
│ TargetHandler = convert(plugin, options) + write(root, bundle)       │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ converts to
┌──────────────────────────────────▼──────────────────────────────────┐
│                         Target Bundles                               │
│ src/converters/*                                                     │
│ - name normalization / prompt-skill rewrite                          │
│ - platform filtering via ce_platforms                                │
│ - agent TOML / prompt / skill dir / sidecar mapping                  │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ writes with
┌──────────────────────────────────▼──────────────────────────────────┐
│                         Managed Install Plane                        │
│ src/targets/* + src/targets/managed-artifacts.ts                     │
│ - install-manifest.json                                              │
│ - backup / legacy-backup                                             │
│ - MCP bounded config merge                                           │
│ - hooks merge index                                                  │
│ - safe path cleanup                                                  │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ consumed by
┌──────────────────────────────────▼──────────────────────────────────┐
│                         Host Harnesses                               │
│ Claude Code / Cursor / Codex / Copilot / Droid / Qwen / OpenCode     │
│ Gemini / Pi / Kiro                                                   │
│ - own LLM calls, tool execution, sessions, permissions, UI            │
└─────────────────────────────────────────────────────────────────────┘
```

### 底层技术架构

#### 1. 最小架构内核

脱掉 README、品牌和具体宿主之后，Compound Engineering 的最小可复刻内核是：

> **Agent-facing Workflow Corpus + Specialized Agent Personas + Source Plugin Model + Target Adapter Registry + Managed Artifact State + Platform-specific Content Transformer + Review/Compound Feedback Contract**

这几个抽象缺一不可：

1. **Workflow Corpus** 定义 agent 行为：什么时候问、什么时候计划、什么时候委派、什么时候审查、什么时候沉淀。
2. **Agent Personas** 提供并行审查和专项研究能力：reviewer 不只是另一个 generic agent，而是带有职责、风险维度和输出契约的 worker。
3. **Source Plugin Model** 给跨平台分发一个事实源：Claude-compatible plugin 是源格式，避免每个平台手写一套资产。
4. **Target Adapter Registry** 把平台差异限制在 `convert + write` 接口内，新增平台不应污染 workflow 正文。
5. **Managed Artifact State** 让 installer 可重跑、可清理、可迁移旧布局，不靠文件名猜测所有权。
6. **Content Transformer** 处理 slash command、agent invocation、prompt/skill name 差异，否则跨平台只能“复制文本”，不能可靠运行。
7. **Feedback Contract** 把 review 发现、solution docs、strategy/pulse 产物写回项目，形成下一次任务的 grounding。

#### 2. 核心抽象

| 抽象 | 文件 / 目录 | 职责 | 为什么重要 |
|------|-------------|------|------------|
| ClaudePlugin | `src/types/claude.ts`、`src/parsers/claude.ts` | 统一承载 manifest、agents、commands、skills、hooks、mcpServers | 所有 target converter 的共同输入模型，决定系统能否跨平台扩展 |
| Skill | `plugins/compound-engineering/skills/*/SKILL.md` | agent-facing workflow contract：触发、阶段、问题、文件产物、验证、边界 | CE 真正的 runtime interface，不是辅助文档 |
| Agent Persona | `plugins/compound-engineering/agents/*.md` | review/research/work 专项 worker 的职责和输出规范 | 多 agent review 的质量来自角色分工，而不是并发数量 |
| TargetHandler | `src/targets/index.ts` | `convert(plugin, options)` + `write(outputRoot, bundle)` + scope 校验 | 把平台差异抽象成可替换 adapter |
| Converter | `src/converters/claude-to-*.ts` | 将 ClaudePlugin 转换成目标平台 bundle，处理名称、调用、frontmatter、sidecar | 避免把每个平台格式写进 source assets |
| Managed Manifest | `install-manifest.json` + `src/targets/managed-artifacts.ts` | 记录本插件上次写入哪些 skills/prompts/agents/groups | 重装/升级/清理时判断“哪些是我拥有的”，防止误删用户资产 |
| Safe Path Guard | `isSafeManagedPath()` | 拒绝 absolute path、`..`、root 外路径 | manifest 被篡改或损坏时仍不能越界删除 |
| MCP Config Block | `renderCodexConfig()` / `mergeCodexConfig()` | 只在 bounded marker 内管理 MCP TOML | 合并配置而不吞掉用户手写 Codex config |
| Hook Merge Index | `mergeCodexHooks()` | 用 `_managed` 记录每个 plugin 拥有哪些 hook entry | 多插件共享 hooks.json 时可替换本插件 entries，不污染 runtime schema |
| Release Component | `.github/release-please-config.json` | cli、compound-engineering、marketplace 多组件 linked versions | plugin/CLI/marketplace 同仓发布，版本一致性需要显式治理 |
| Real Plugin Drift Test | `tests/real-plugin-conversion.test.ts` | 用真实 `plugins/compound-engineering` 转所有已实现 target，再结构校验 | shipping asset 变化能被测试发现，而不是 fixture 自嗨 |

#### 3. 控制面 / 数据面分离

**Control Plane：**

- `plugins/compound-engineering/.claude-plugin/plugin.json`、`.codex-plugin/plugin.json`、`.cursor-plugin/plugin.json`：声明 plugin 元数据、skills 目录、平台 manifest。
- `src/index.ts`、`src/commands/install.ts`、`src/commands/convert.ts`：CLI 入口、target 选择、参数校验、source resolution、output root resolution。
- `src/targets/index.ts`：目标平台注册表和 scope policy。
- `src/utils/resolve-output.ts`、`src/utils/detect-tools.ts`、`src/utils/resolve-home.ts`：决定写入哪里、是否 auto-detect target、如何处理 profile/home。
- `SKILL.md` frontmatter 的 `name`、`description`、`argument-hint`、`ce_platforms`：决定技能如何被宿主发现、在哪些平台可用。
- release-please / GitHub Actions：决定版本、release PR、CI gate。

**Data Plane：**

- `src/parsers/claude.ts` 读取文件系统中的 manifest、Markdown、hooks、MCP JSON。
- `src/converters/*` 转换 agent/skill/command 内容与引用名。
- `src/targets/*` 写入目标宿主目录，复制 sidecar、生成 TOML/JSON/Markdown、合并 config/hooks。
- `plugins/compound-engineering/skills/*/references/` 与 scripts 是 agent 执行时读取的知识/脚本数据。
- `docs/brainstorms/`、`docs/plans/`、`docs/solutions/`、`docs/pulse-reports/` 是 CE workflow 在目标项目中生成或消费的工作数据。

分离程度整体较好：CLI/control policy 与 asset/data transformation 大体分开；但 `src/commands/install.ts` / `convert.ts` 仍有明显重复，target-specific 特例（Codex agents-only、OpenCode scope）也需要在命令层显式处理，说明 adapter 抽象还没有完全把控制面压平。

#### 4. 关键执行链路

**链路 1：本地路径 / bundled plugin 安装到指定 target**

```text
user: bunx @every-env/compound-plugin install compound-engineering --to codex
  ↓
src/index.ts defineCommand(main)
  ↓
src/commands/install.ts resolvePluginPath()
  ├─ explicit local path → pathExists
  ├─ bundled plugin → plugins/<name>/.claude-plugin/plugin.json
  └─ GitHub source → shallow clone temp dir
  ↓
loadClaudePlugin()
  ↓
targets[targetName] + validateScope()
  ↓
target.convert(plugin, options)
  ↓
resolveTargetOutputRoot()
  ↓
target.write(outputRoot, bundle)
  ↓
write install-manifest / config / hooks / agents / skills
  ↓
cleanup temp clone if any
```

关键点：source resolution 不把任意名字直接当路径；branch 参数会跳过 bundled plugin，表示用户明确要远端版本。失败时 temp clone 会被清理。

**链路 2：Claude plugin 解析成统一模型**

```text
plugin root or .claude-plugin/plugin.json
  ↓
resolveClaudeRoot()
  ↓
read .claude-plugin/plugin.json
  ↓
resolveComponentDirs(root, defaultDir, manifest override)
  ↓
loadAgents() / loadCommands() / loadSkills()
  ├─ collectMarkdownFiles / walkFiles
  ├─ parseFrontmatter()
  ├─ derive name / argument-hint / allowed-tools / model
  └─ keep sourcePath / sourceDir
  ↓
loadHooks() + mergeHooks()
  ↓
loadMcpServers() + unwrap/merge MCP configs
  ↓
ClaudePlugin object
```

关键点：manifest 中自定义 hooks/MCP/component path 经过 `resolveWithinRoot()`，路径必须留在 plugin root 内。这是把 plugin 当不完全可信输入时最重要的边界。

**链路 3：Codex agents-only 转换与写入**

```text
ClaudePlugin
  ↓
convertClaudeToCodex(plugin, options)
  ├─ filterSkillsByPlatform(..., "codex")
  ├─ build skillTargets / promptTargets / agentTargets
  ├─ convert all agents → Codex TOML agents
  ├─ default includeSkills=false
  └─ return agents + externallyManagedSkillNames + hooks
  ↓
writeCodexBundle(codexRoot, bundle)
  ├─ read previous install-manifest.json
  ├─ cleanupRemovedPrompts / Skills / Agents
  ├─ write agents under .codex/agents/<plugin>
  ├─ write install-manifest.json
  ├─ cleanup legacy artifacts / symlinks / old skill stores
  ├─ merge bounded MCP block into config.toml
  └─ merge plugin hooks into hooks.json via _managed index
```

关键点：Codex 现在有 native plugin install for skills，但 custom agents 仍需 Bun converter。所以默认 `--to codex` 是 agents-only；`externallyManagedSkillNames` 让 cleanup 知道 skills 仍是当前资产，只是由 native install 管理，避免重跑时误清。

**链路 4：Agent workflow 从计划到复利**

```text
user rough task
  ↓
/ce-strategy optional grounding → STRATEGY.md
  ↓
/ce-brainstorm → docs/brainstorms/*-requirements.md/html
  ↓
/ce-plan → docs/plans/* plan with units, decisions, tests
  ↓
/ce-work → inline/serial/parallel execution + worktree/task tracking
  ↓
/ce-code-review → reviewer selection + parallel agents + synthesis + fix routing
  ↓
/ce-compound → docs/solutions/* with frontmatter and discoverability
  ↓
future brainstorm/plan/debug/review reads durable docs as context
```

这条链路是 CE 的产品内核：converter 只是分发层；真正值得复刻的是把 agent 的一次性能力变成 **可追踪产物 → 审查 → 复盘 → 下次 grounding**。

#### 5. 状态模型

1. **Source state（仓库事实源）：** `plugins/compound-engineering/` 下的 skills、agents、plugin manifests、hooks/MCP；由 Git 管理。
2. **Release state（分发事实源）：** `package.json`、`.github/release-please-config.json`、`.github/.release-please-manifest.json`、Git tags / GitHub Releases / npm dist-tags。当前风险是 repo release 与 npm latest 不一致。
3. **Install state（目标宿主状态）：** 各 target 下的 `install-manifest.json`、`legacy-backup/`、generated agents/skills/prompts、config/hook backup。它决定重装/升级/清理行为。
4. **Host runtime state（外部状态）：** Claude/Codex/Cursor/OpenCode 等宿主保存会话、工具权限、插件启用状态、native skills；CE 不拥有这些状态。
5. **Workflow artifact state（目标项目状态）：** `STRATEGY.md`、`docs/brainstorms/`、`docs/plans/`、`docs/solutions/`、`docs/pulse-reports/`、worktree/branch/diff/PR review。CE skills 读写这些产物，形成复利。
6. **Config state（用户配置）：** `.codex/config.toml`、`.codex/hooks.json`、target-specific home；CE 只应修改自己 bounded/managed 的部分。

核心状态不变量：**凡是会被未来 cleanup 或 agent 决策依赖的状态，都必须写成 repo 文件或 install manifest，不能只留在一次会话记忆里。**

#### 6. 契约边界

- **CLI 契约：**
  - `compound-plugin convert <source> --to <target> [--output] [--scope] [--also]`
  - `compound-plugin install <plugin> --to <target> [--branch] [--codex-home] [--include-skills]`
  - `--to all` 只安装检测到且 implemented 的 target；Claude/Copilot/Droid/Qwen 这种 native plugin 路径会提示 skipped。
- **TargetHandler 契约：** 每个 target 必须提供 `convert` 与 `write`；scope 支持必须声明，否则 `--scope` 被拒绝。
- **Plugin manifest 契约：** Claude-compatible `.claude-plugin/plugin.json` 是 source manifest；`.codex-plugin`、`.cursor-plugin` 是目标 native plugin surface。
- **Skill 契约：** `SKILL.md` frontmatter 的 `description` 是触发面，正文是执行协议；`ce_platforms` 限定平台可见性。
- **Agent 契约：** `agents/*.md` frontmatter/body 定义 persona 能力、模型 hint 与输出要求；converter 会转成目标宿主的 agent 形态。
- **Managed artifact 契约：** install-manifest 只记录插件拥有的相对路径；cleanup 必须先过 safe path guard；legacy artifacts 移到 backup，不直接静默删除。
- **Config merge 契约：** MCP config 只在 managed markers 内替换；hooks 通过 `_managed` index 管理本插件 entries；其他插件/用户 entries 保留。
- **Release 契约：** release-please linked versions 应保持 CLI 与 plugin version 同步；stale `release-as` 由 `src/release/config.ts` 校验。
- **Workflow artifact 契约：** brainstorm 产物定义 WHAT，plan 产物定义 HOW，work 执行计划，review 产出 finding/fix routing，compound 写 solution docs；这些边界在 skill 正文中显式反复强调。

#### 7. 失败与降级模型

| 失败类型 | 检测方式 | 降级 / 恢复 | 可观测信号 |
|----------|----------|-------------|------------|
| 目标平台未安装 | `detectInstalledTools()` / target registry | `--to all` 跳过；提示 native plugin install 路径 | CLI 输出 detected/skipped reason |
| 插件路径不存在 | `resolvePluginPath()` + `pathExists` | fail-fast；远端 clone 失败则删除 temp dir | Error: local path not found / failed to clone |
| manifest path 越界 | `resolveWithinRoot()` | fail-closed，不读取 root 外文件 | Error: Paths must stay within plugin root |
| managed manifest 被篡改 | `isSafeManagedPath()` read-time filter + cleanup re-check | 丢弃 unsafe entries，不执行越界 rm | console.warn dropping unsafe entry |
| 重装误删 native skills | Codex `externallyManagedSkillNames` | agents-only 模式把 native skills 视为 current | install-manifest currentSkills 包含 externally managed names |
| 用户 config 被覆盖 | bounded MCP markers + backupFile + hook merge index | 写前 backup，只替换 managed block / managed hook entries | `.bak.<timestamp>`、markers、`_managed` |
| legacy artifact 与用户文件同名 | ownership classifier / managed symlink check | foreign 文件不移动；managed symlink 才删除 | legacy-backup warning 或静默保留 |
| agent filename collision | `assertNoCodexAgentFilenameCollisions()` | fail-fast，要求改 source agent name | explicit collision error |
| release pin stale | `validateReleasePleaseConfig()` | CI/validate 阻断 stale `release-as` | release validate errors |
| npm 发布滞后 | npm registry 与 repo release 比对；open issue #933 | 采用时锁 GitHub/source install 或等待 npm 修复 | npm latest 低于 GitHub release/package version |
| 跨平台脚本/路径不兼容 | open issues #943/#944/#920/#898 等 | 修 skill 文案、用 native file-read、guard non-Claude 平台 | issues/PRs、CI、用户安装报错 |

CE 的失败模型比普通 prompt pack 强：它不只“提示用户小心”，而是在 installer 层做了 path containment、ownership、backup、legacy migration、idempotent cleanup。但 workflow 执行层仍主要依赖 agent 遵守 skill；这部分不是硬 runtime enforcement。

#### 8. 可复刻设计不变量

1. **Source-of-truth assets 只能有一套。** 多平台支持必须从统一 plugin model 转换，不能每个平台手工维护一份 skill/agent。
2. **平台差异进 adapter，不进 workflow 正文。** 工具名、路径、native plugin 能力、hook 格式应由 converter/writer 处理。
3. **agent-facing contract 是运行时接口。** `SKILL.md` 不是说明书，而是 agent 的执行协议；description 负责触发，正文负责行为。
4. **复杂 workflow 必须产出 durable artifacts。** brainstorm/plan/solution/pulse 写入项目，下一轮任务才能复利。
5. **多 agent review 要有角色、路由和合成规则。** 并发本身不创造质量；reviewer taxonomy、severity、confidence、autofix_class、owner 才是质量控制点。
6. **installer 必须可重跑。** 每次 install/convert 都要知道自己拥有哪些文件、哪些是 legacy、哪些是用户资产。
7. **cleanup 不可信任 manifest。** manifest 是磁盘文件，可能损坏/被改；删除前必须做 absolute/path traversal/root containment 检查。
8. **共享配置必须 bounded merge。** MCP/hook/config 不能全文件覆盖；要有 markers、managed index、backup 和 schema-clean runtime entries。
9. **native 能力优先，converter 补缺口。** Codex native plugin 已能装 skills，就不要重复装；converter 只补 custom agents。
10. **真实资产要进测试。** 只测 fixtures 不够，必须把 shipping plugin 转所有 target 并校验结构漂移。
11. **版本事实源要持续校准。** repo release、package version、npm dist-tag、marketplace manifests 不一致会直接影响安装体验。
12. **复利不是多写文档，而是闭环可被下次 agent 读取。** solution/strategy/pulse/plan 必须有稳定路径、frontmatter、引用和 discoverability。

---

## 架构解剖

### 目录结构

```text
compound-engineering-plugin/
├── README.md                         # 定位、workflow、安装路径、平台说明
├── package.json                      # @every-env/compound-plugin CLI/package
├── src/
│   ├── index.ts                      # citty CLI 入口
│   ├── commands/                     # install / convert / list / cleanup
│   ├── parsers/                      # Claude-compatible plugin parser
│   ├── converters/                   # Claude → OpenCode / Codex / Pi / Gemini / Kiro
│   ├── targets/                      # 各平台 writer + managed artifact cleanup
│   ├── types/                        # Claude / Codex / target bundle 类型
│   ├── utils/                        # frontmatter、file safety、content transform、home/output resolve
│   ├── data/                         # legacy artifact allow-list 等
│   └── release/                      # release-please config validation
├── plugins/
│   └── compound-engineering/
│       ├── README.md                 # 组件清单
│       ├── AGENTS.md                 # plugin asset authoring rules
│       ├── .claude-plugin/           # Claude plugin manifest / marketplace metadata
│       ├── .codex-plugin/            # Codex native plugin manifest
│       ├── .cursor-plugin/           # Cursor plugin manifest
│       ├── skills/                   # 39 个 SKILL.md workflow + references/scripts
│       └── agents/                   # 43 个 agent persona Markdown
├── tests/                            # 55 个 bun:test 文件
├── scripts/release/                  # release sync / preview / validate
├── .github/workflows/                # CI + release-please
└── docs/                             # 项目自身 brainstorms/plans/solutions/specs 等
```

### 技术栈

- **语言 / 运行时：** TypeScript ESM，Bun 作为脚本/test runner；Node.js 22 用于 CI。
- **CLI 框架：** `citty`。
- **配置/文档格式：** Markdown + YAML frontmatter；JSON manifests；TOML for Codex agent/config 输出。
- **测试：** Bun 内置 test runner，`tests/**/*.test.ts` 55 个。
- **CI：** GitHub Actions：semantic PR title、Bun install/test、release validate；release-please 管理多组件 release PR。
- **依赖策略：** runtime deps 仅 `citty`、`js-yaml`，其余主要是 release/dev deps。

### 模块依赖关系

```text
src/index.ts
  └─ defineCommand(main)
      ├─ commands/convert.ts
      │   ├─ loadClaudePlugin()
      │   ├─ targets[targetName].convert()
      │   ├─ resolveTargetOutputRoot()
      │   └─ targets[targetName].write()
      ├─ commands/install.ts
      │   ├─ resolvePluginPath(): local / bundled / GitHub clone
      │   ├─ loadClaudePlugin()
      │   └─ same target convert/write path
      ├─ commands/list.ts
      └─ commands/cleanup.ts

src/parsers/claude.ts
  ├─ utils/frontmatter.ts
  ├─ utils/files.ts
  └─ types/claude.ts

src/converters/claude-to-codex.ts
  ├─ types/claude.ts filterSkillsByPlatform()
  ├─ utils/codex-content.ts
  └─ types/codex.ts

src/targets/codex.ts
  ├─ utils/files.ts isSafeManagedPath / backup / write secure
  ├─ targets/managed-artifacts.ts pattern mirrored by other targets
  ├─ data/plugin-legacy-artifacts.ts
  └─ utils/legacy-cleanup.ts
```

### 扩展机制

1. **新增 target 平台：** 在 `src/targets/index.ts` 注册 `TargetHandler`，实现 converter 与 writer；必要时声明 supported scopes。
2. **新增 skill：** 在 `plugins/compound-engineering/skills/<name>/SKILL.md` 写 frontmatter + body；可用 `ce_platforms` 限定平台。
3. **新增 agent：** 在 `plugins/compound-engineering/agents/*.md` 添加 persona；converter 会按 source path/category 生成目标 agent name。
4. **新增 hook/MCP：** 通过 plugin manifest 或 default `hooks/hooks.json`、`.mcp.json` 被 parser 读取，并由 target writer merge。
5. **新增 release component：** 需要同步 release-please config 与 manifest，并通过 `release:validate` 防 stale pin。
6. **新增 legacy cleanup：** 需要更新 legacy artifact data 与 writer ownership check，避免迁移时误动用户文件。

---

## 质量与成熟度

### 代码质量

优点：

- **分层清楚。** `parser → converter → target writer` 三段式清晰，`TargetHandler` 接口足够小。
- **安全边界意识强。** `resolveWithinRoot()` 防 manifest path escape；`isSafeManagedPath()` 防 install-manifest cleanup 越界；config/hook merge 都避免全文件覆盖。
- **Codex 兼容细节扎实。** agents-only 默认、externallyManagedSkillNames、legacy symlink ownership、agent filename collision 检查，都是从真实安装痛点演进出的设计。
- **测试关注 shipping drift。** `tests/real-plugin-conversion.test.ts` 转换真实 plugin 到所有 implemented target，结构校验不是 toy case。
- **依赖少。** runtime deps 极少，降低供应链和安装复杂度。

问题：

- **命令层重复明显。** `install.ts` 与 `convert.ts` 的 target selection、options、output resolution、extraTargets 逻辑相似，后续 target 增多会增加同步成本。
- **平台特例仍外溢。** Codex/OpenCode 的特殊逻辑出现在命令层和 writer 层，说明 adapter registry 还不是完全 data-driven。
- **asset 面很大。** 39 skills / 43 agents 的维护成本高；修改一条 workflow 规范可能要同步 skill、agent、reference、platform variants。
- **发布状态有漂移风险。** npm latest 落后于 GitHub release/package，说明 release pipeline 至少在 npm publish 链路上存在未闭环风险。
- **agent workflow 强制力有限。** skill 写得再细，执行质量仍依赖宿主 agent 是否读取、遵守和正确调用 subagents/tools。

### 测试

本轮未运行测试/构建；以下为静态证据。

- **测试文件规模：** `tests/**/*.test.ts` 55 个。
- **主要测试面：**
  - parser/frontmatter/manifest path safety。
  - converter 输出：OpenCode、Codex、Pi、Gemini、Kiro。
  - target writer：config merge、hooks merge、managed artifacts、legacy cleanup、path safety。
  - release config validation。
  - real plugin conversion drift：真实 `plugins/compound-engineering` 转所有 implemented target，并按 source inventory 校验 agents/commands/skills 数量和结构。
- **安全测试重点：** `tests/manifest-path-safety.test.ts` 覆盖 absolute path、`..` traversal、unsafe manifest cleanup entries、Codex/Pi manifest filtering。
- **测试哲学：** 对 converter/writer 这类可确定代码做结构性测试；对 skills/agents 这种 agent-facing 文本资产，用 real plugin drift test 防格式/数量漂移。

### CI/CD 与发布

- **CI workflow：** `.github/workflows/ci.yml` 包含 PR title conventional check、Bun setup、`bun install --frozen-lockfile`、`bun test`、`bun run release:validate`。
- **Release workflow：** `release-pr.yml` 用 release-please 管理 release PR；config 中 `cli` 与 `compound-engineering` 使用 linked versions。
- **多组件版本：** `.`、`plugins/compound-engineering`、`.claude-plugin`、`.cursor-plugin` 都有 release-please package config；plugin extra-files 会同步 `.claude-plugin/plugin.json`、`.cursor-plugin/plugin.json`、`.codex-plugin/plugin.json`。
- **stale release-as 防线：** `src/release/config.ts` 会检测 `release-as` 是否不高于 base manifest released version，防止一次性 pin 遗留后冻结后续 release。
- **当前发布风险：** GitHub latest release 为 `compound-engineering-v3.13.0`，但 npm registry latest 为 `3.8.3`；open issue #933 标题为 “npm package out-of-date and failing ci”。采用 CLI 时应优先确认安装源和版本。

### 文档质量

- **README 使用路径完整。** Claude Code、Cursor、Codex、Copilot、Droid、Qwen、OpenCode、Pi、Gemini、Kiro 都有安装说明，Codex 三步安装解释很具体。
- **plugin README 清单清楚。** `plugins/compound-engineering/README.md` 列出 skills/agents 与 workflow。
- **SKILL.md 信息密度高。** `ce-plan`、`ce-brainstorm`、`ce-code-review`、`ce-work`、`ce-compound` 等包含阶段、交互规则、平台工具名、失败处理、产物要求。
- **文档即 runtime。** 优点是 agent 可直接执行；缺点是文本资产快速演进时容易产生局部矛盾，近期 issues/PRs 已出现 bundled-script、config-read、relative-path guidance 等修正。

### Issue/PR 健康度

- **活跃度高。** 2026-06-16 查询：open issues 69、open PRs 28、closed issues 197、merged PRs 517。
- **近期问题集中在平台兼容与 workflow 漂移：** Codex delegation fallback、bundled script path、Claude permission system、config-read、ce-compound non-Claude guard、release/npm out-of-date。
- **维护响应快。** 6 月中旬仍有多个修复 PR 合并，release main 在 2026-06-15 更新。
- **Backlog 不小但可解释。** 项目处在多平台快速适配期，open issues 中大量是具体 workflow/compat 问题，不是无人维护迹象。

---

## 社区与生态

### 生态位置

Compound Engineering 位于 AI coding stack 的 **team workflow layer**：

```text
Model Provider
  ↓
Coding Agent Harness（Claude Code / Codex / Cursor / OpenCode / etc.）
  ↓
Workflow Protocol（CE skills + agents + review/compound loop）
  ↓
Project Artifacts（requirements / plans / reviews / solutions / pulse reports）
  ↓
Team Knowledge Compounding
```

它不替代 harness，而是在 harness 上方定义团队如何把 AI coding 变成可重复、可审查、可沉淀的工程流程。

### 社区评价与生态信号

- **Star/Fork 强。** 21.4k stars / 1.5k forks，说明 CE 在 AI coding workflow 圈有明显传播。
- **Every 背书。** 项目来自 EveryInc，并链接 Every 对 compound engineering 的公开文章，定位不是纯个人 prompt pack。
- **真实多平台压力。** issues/PRs 显示用户在 Codex、Claude、Gemini、Qwen、native plugin 等真实路径中使用，而不是只收藏 README。
- **生态外溢方向。** CE 的多 reviewer、plan/work/compound 思路已成为很多 agent workflow 项目的参照物；它和 superpowers/ECC/vibecode/loop-engineering 形成互补，而非完全替代。

### 竞品 / 邻近项目对比

| 项目 | 定位 | CE 相对优势 | CE 相对劣势 |
|------|------|-------------|-------------|
| superpowers | 轻量 agent discipline skill pack | CE 有更完整团队 workflow、多 agent review、compound 记忆 | superpowers 更轻，触发纪律更聚焦，个人采用更低成本 |
| ECC | 大型 cross-harness workflow substrate | CE 在具体团队工程闭环和 review pipeline 上更有观点 | ECC 的 installer/profile/hooks/security governance 更系统 |
| vibecode-pro-max-kit | RIPER-5 spec-driven harness + process memory | CE 的多 reviewer 与跨平台 plugin 转换更成熟 | vibecode 的 phase protocol/project memory 更强约束 |
| loop-engineering | recurring agent loop pattern/audit/cost toolkit | CE 更适合单个工程任务从需求到复盘的闭环 | loop-engineering 更适合周期性维护任务运营化 |
| Cline/Continue/OpenCode/jcode | coding agent runtime / IDE assistant | CE 可作为 workflow layer 叠在宿主之上 | runtime 项目拥有执行面，CE 不拥有模型/tool/session |

---

## 关键文件走读

### 1. `src/parsers/claude.ts` — Source plugin parser

- **职责：** 将 Claude-compatible plugin 目录解析为统一 `ClaudePlugin`。
- **关键函数：** `loadClaudePlugin()`、`resolveClaudeRoot()`、`loadAgents()`、`loadCommands()`、`loadSkills()`、`loadHooks()`、`loadMcpServers()`、`resolveWithinRoot()`。
- **技术要点：**
  - source root 必须含 `.claude-plugin/plugin.json`，或传入 plugin.json 本身。
  - agents/commands/skills 支持 manifest 自定义路径，但都必须 stay within plugin root。
  - skills 读取 `SKILL.md`，保留 `sourceDir`，便于 writer 原样复制 references/scripts。
  - hooks/MCP 支持默认路径、manifest inline、manifest path，多份 hooks 会 merge。
- **学习价值：** 这是一个很小但完整的 “Markdown plugin → normalized model” parser，可复用到任何 agent skill/agent 分发系统。

### 2. `src/targets/index.ts` — Target adapter registry

- **职责：** 将各平台实现统一成 `TargetHandler`。
- **关键类型：** `TargetHandler<TBundle> = { name, implemented, defaultScope, supportedScopes, convert, write }`。
- **技术要点：**
  - `validateScope()` 明确拒绝不支持 scope 的 target，而不是忽略用户参数。
  - 当前 implemented targets：OpenCode、Codex、Pi、Gemini、Kiro。
  - Claude/Cursor/Copilot/Droid/Qwen 更多走 native plugin，不通过这里转换。
- **学习价值：** 小接口控制平台差异，是 CE 分发架构能扩展的核心。

### 3. `src/converters/claude-to-codex.ts` — Codex conversion policy

- **职责：** 把 ClaudePlugin 转为 Codex bundle。
- **关键设计：** 默认 agents-only；`--include-skills` 才进入 legacy/standalone full mode。
- **技术要点：**
  - `filterSkillsByPlatform(plugin.skills, "codex")` 支持平台特定技能过滤。
  - `buildAgentTargets()` 生成多个 alias：原名、normalized、去 `ce-`、category 前缀、plugin/category 前缀。
  - deprecated `workflows:*` alias 会映射回 canonical `ce-*` skill。
  - `collectReferencedSidecarDirs()` 自动复制 agent body 引用的相邻目录。
- **学习价值：** 很适合学习“native plugin 已支持部分能力时，converter 如何只补缺口而不双注册”。

### 4. `src/targets/codex.ts` — Managed install writer

- **职责：** 写 Codex prompts/skills/agents/config/hooks，并处理重装、清理、legacy migration。
- **关键函数：** `writeCodexBundle()`、`readInstallManifest()`、`cleanupRemovedSkills()`、`cleanupKnownLegacyCodexArtifacts()`、`mergeCodexConfig()`、`mergeCodexHooks()`。
- **技术要点：**
  - 读 install manifest 时过滤 unsafe entries；cleanup 前再次检查。
  - `.codex/config.toml` 的 MCP block 使用 `# BEGIN/END Compound Engineering plugin MCP` 边界。
  - `.codex/hooks.json` 用 `_managed` 记录插件拥有的 hook entry index，不往 runtime hook object 注入 `_source`。
  - legacy prompt cleanup 通过 ownership classifier，避免把用户同名 prompt 移走。
  - `.agents/skills` 共享目录只删除指向 CE managed root 的 symlink。
- **学习价值：** 这是报告中最值得复刻的工程代码：安全、幂等、可迁移的 agent plugin writer。

### 5. `src/utils/files.ts` 与 `src/targets/managed-artifacts.ts` — Cleanup safety primitives

- **职责：** 提供 path safety、backup、secure write、managed manifest read/write 和 artifact cleanup。
- **关键设计：**
  - `isSafeManagedPath(rootDir, candidate)` 拒绝非字符串、空、absolute path、任意 `..` segment、resolve 后 root 外路径。
  - `readManagedInstallManifest()` read-time 过滤 unsafe groups，并 warning。
  - `cleanupRemovedManagedDirectories/Files()` cleanup-time 继续 re-check。
  - `moveLegacyArtifactToBackup()` 用 timestamped `legacy-backup/`，不直接丢弃。
- **学习价值：** 任何会根据 manifest 删除文件的 installer 都应复用这套 guardrail。

### 6. `plugins/compound-engineering/skills/ce-code-review/SKILL.md` — 多 agent review workflow

- **职责：** 定义 CE 最有差异化的代码审查流程。
- **技术要点：**
  - reviewer 分层：always-on、cross-cutting、stack-specific、CE-specific。
  - finding metadata：severity、autofix_class、confidence、owner、requires_verification。
  - 模式区分：interactive、autofix、report-only、headless。
  - 合成阶段强调去重、保守路由和验证责任。
- **学习价值：** 多 agent review 不是“多叫几个 agent”，而是 reviewer taxonomy + structured finding contract + synthesis policy。

### 7. `plugins/compound-engineering/skills/ce-plan/SKILL.md` — 计划 contract

- **职责：** 把需求转成可执行、可审查、可 handoff 的 plan。
- **技术要点：**
  - 明确 `ce-brainstorm` 定义 WHAT，`ce-plan` 定义 HOW，`ce-work` 执行。
  - 要求 repo-relative paths，禁止 absolute path。
  - 支持 markdown/html 输出，但 pipeline mode 强制 markdown。
  - 通过 Phase 0 resume/source/scope/questions/depth 控制计划质量。
- **学习价值：** 这是把 agent planning 从“好看的任务列表”提升到 durable engineering artifact 的范例。

### 8. `tests/real-plugin-conversion.test.ts` — Shipping asset drift test

- **职责：** 转换真实 plugin 到所有 implemented target，校验输出结构。
- **技术要点：**
  - source inventory 独立从 `plugins/compound-engineering` 读取，而不是复用 converter 输出。
  - sandbox 将 HOME/CODEX_HOME/OPENCODE_CONFIG_DIR 指到临时目录，避免写真实用户配置。
  - expected counts 从 source tree 和 `ce_platforms` 推导，避免写死 snapshot。
- **学习价值：** 对 agent workflow 项目来说，Markdown assets 也是代码；必须有防漂移测试。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 5 | 覆盖 brainstorm、strategy、plan、work、debug、review、compound、pulse，团队工程闭环完整。 |
| 架构设计 | 5 | parser/converter/writer 清楚，managed install safety 成熟；workflow artifact 闭环有独特价值。 |
| 代码质量 | 4 | TypeScript 结构清晰、安全 guardrail 多；但 install/convert 重复和平台特例外溢仍在。 |
| 测试质量 | 4 | 55 个 Bun tests，真实插件转换 drift test 很好；本轮未实跑，workflow 文本行为仍难靠测试完全覆盖。 |
| 文档质量 | 5 | README、plugin README、SKILL.md 都很强；缺点是快速演进带来局部文档漂移风险。 |
| 社区活跃度 | 4 | stars/PR/release 活跃，但 issue backlog 和平台兼容问题不少。 |
| 生产成熟度 | 3 | 适合团队试点和局部采用；企业级中心化权限/审计/enforcement 仍需外部补齐。 |
| 学习价值 | 5 | 多 agent review、managed plugin writer、workflow artifact compounding 都值得复刻。 |

**总分：35/40**

---

## 总结

### 一句话评价

**Compound Engineering 是目前最值得拆解的团队型 AI coding workflow 插件之一：它的价值不只是 39 个 skills 和 43 个 agents，而是把“需求 → 计划 → 执行 → 审查 → 复利沉淀”做成 agent 可执行、可分发、可升级的系统。**

### 最值得学习什么

1. **多 agent review 的工程化。** reviewer taxonomy、structured finding、confidence/autofix routing、synthesis policy 比“开很多 subagent”更重要。
2. **跨平台 plugin 分发。** Source plugin model + target registry + converter/writer，是做多 harness workflow 的可复用骨架。
3. **managed install safety。** install-manifest、safe path guard、legacy-backup、bounded config merge、hook `_managed` index，是所有 agent 插件安装器都应有的基本盘。
4. **workflow artifact compounding。** `STRATEGY.md`、brainstorm、plan、solution、pulse 把 agent 工作从一次性对话变成项目长期上下文。
5. **真实资产测试。** shipping plugin conversion drift test 是 prompt/skill 项目工程化的好模式。

### 谁应该用

- 已经在 Claude Code / Cursor / Codex 上做真实工程任务的 3–20 人小团队。
- 需要规范 AI coding 工作流、提高代码审查质量、减少重复踩坑的产品工程团队。
- 想把内部 agent workflow 做成可分发插件/skills/agents 的平台工程师。
- 想学习多 agent review 与 agent-facing workflow contract 的开发者。

### 谁不应该直接用

- 只想让个人 agent 少犯错、不要复杂流程的用户：优先看 `superpowers`。
- 想要独立 coding agent runtime、provider/tool/session 控制面的团队：看 OpenCode / jcode / pi-mono 等 runtime。
- 不能接受安装器写宿主配置、不能先隔离试点的企业环境。
- 只做低价值小改动、无法承受多 agent review token/时延的场景。

### 采用建议

1. **先隔离 profile。** 尤其 Codex：用单独 `CODEX_HOME`，完成 marketplace + native install + Bun agents 三步。
2. **先跑一个完整闭环。** 选一个真实但低风险任务，跑 `/ce-brainstorm → /ce-plan → /ce-work → /ce-code-review → /ce-compound`。
3. **把 review 当试点重点。** 用真实 PR 对比 CE review 与团队现有 review 的漏报/误报/修复成本。
4. **确认 npm/安装源。** 2026-06-16 npm latest 落后 GitHub release；采用前确认 `bunx` 实际版本，必要时从 GitHub/source install。
5. **制定团队协议。** 哪些任务必须 brainstorm/plan，哪些任务只需 lightweight path；review findings 如何进入 PR；solution docs 如何维护和淘汰。
6. **不要把 CE 当硬安全沙箱。** 它是 workflow/control layer，不是权限系统；文件写入、shell、MCP、secret、CI gate 仍要由宿主/企业平台治理。
