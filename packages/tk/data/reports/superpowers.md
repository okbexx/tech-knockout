# superpowers

> 一句话定位：**跨平台 Agentic 技能操作系统：把“先设计、再计划、TDD、工作树隔离、子代理审查、完成前验证”编码成 14 个可分发的 SKILL.md，并通过 Claude Code / Codex / Cursor / OpenCode / Gemini CLI / Copilot CLI 等宿主的插件、hook 与 skill 机制，在会话启动时注入开发纪律。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `obra/superpowers` |
| URL | `https://github.com/obra/superpowers` |
| Star | 227,958（截至 2026-06-15） |
| Fork | 20,281 |
| 许可证 | MIT |
| 语言 | Markdown / Shell / JavaScript（核心资产是 Markdown skills） |
| 默认分支 | `main` |
| 首次提交 | 2025-10-09 `dd013f6 Initial commit: Superpowers plugin v1.0.0` |
| 最近提交 | 2026-05-29 `6fd4507 Require contributors to disclose authoring environment and target dev` |
| 最新 Release | v5.1.0（2026-04-30） |
| Open Issues / PRs | 124 issues / 159 PRs（分别查询 Issues 与 Pulls，不混用 GitHub `open_issues_count`） |
| 本地规模 | 147 个 tracked files；70 个 Markdown 文件约 17,014 行；31 个 shell 脚本约 5,089 行 |
| 核心贡献 | 本地 `git shortlog` 显示 Jesse Vincent 672 commits、Drew Ritter 230 commits；其余贡献者分散 |
| 分析日期 | 2026-06-15 |

---

## 场景一：是否值得采用

### 解决的问题

superpowers 解决的不是“再做一个 coding agent runtime”，而是 **“现有 coding agent 很强，但经常不守工程纪律”** 的问题。

Claude Code、Codex、Cursor、OpenCode、Gemini CLI 这类宿主已经有模型、工具调用、文件读写和终端能力，但 agent 默认仍容易出现：

1. **没澄清需求就动手**：一句“做个 todo list”直接写代码，遗漏约束后返工。
2. **计划质量不可控**：计划看似完整，但隐藏 placeholder、缺接口契约、任务过大或验证缺失。
3. **TDD 被口头化**：先写实现，后补测试，甚至没看过失败用例。
4. **排障靠猜**：看到错误就改最近一行，没有根因链路。
5. **子代理污染上下文**：把全部会话历史丢给 subagent，审查者继承实现者偏见。
6. **完成声明不可信**：没跑验证就说“完成”“应该可以”。
7. **多平台技能漂移**：Claude Code、Codex、Cursor、OpenCode、Gemini 的工具名、hook 格式和子代理能力不同，同一套方法论很难同步。

superpowers 的答案是：把这些纪律写成 **可版本控制、可安装、可审查、可迁移的技能文件**，并让宿主在会话启动时注入 `using-superpowers` bootstrap，迫使 agent 在行动前先加载相应技能。

目标用户：

- 已经在用 Claude Code / Codex / Cursor / OpenCode / Gemini CLI / Copilot CLI 的个人开发者。
- 想统一团队 AI 编码规范，但暂时不想自研 agent runtime 的小团队。
- 想研究“如何用文本约束文本生成器”的 agent workflow 设计者。
- 想把 TDD、debugging、planning、review 等工程纪律移植到自家 agent harness 的开发者。

### 核心能力与边界

- **能做什么：**
  - 会话启动时注入 `using-superpowers`，让 agent 在任何任务前判断是否必须加载 skill。
  - 提供 14 个核心技能，覆盖 brainstorming、writing-plans、executing-plans、subagent-driven-development、test-driven-development、systematic-debugging、using-git-worktrees、verification-before-completion、requesting-code-review、receiving-code-review、finishing-a-development-branch 等。
  - 通过 `.claude-plugin/`、`.codex-plugin/`、`.cursor-plugin/`、`.opencode/`、`gemini-extension.json`、`GEMINI.md`、`hooks/session-start` 等适配不同宿主。
  - 为 OpenCode 做 plugin JS 适配：注册 skills 目录、注入 bootstrap、缓存 bootstrap 内容、映射 Claude 风格工具名到 OpenCode 工具体系。
  - 为 Codex marketplace 提供 `scripts/sync-to-codex-plugin.sh`，把上游仓库内容确定性同步到 `prime-radiant-inc/openai-codex-plugins`。
  - 为 brainstorming 提供零依赖本地 visual companion server：用 Node 内置 `http/fs/crypto` 实现静态页面、WebSocket、文件监听、生命周期退出。
  - 为复杂技能提供行为测试/集成测试脚本：skill triggering、explicit skill requests、Claude Code skill tests、OpenCode plugin tests、Codex sync tests、brainstorm server tests。

- **不能做什么 / 边界：**
  - 不提供模型推理、provider 路由、文件系统沙箱、工具执行器或会话数据库；这些都依赖宿主。
  - 不保证 agent 绝对遵守规则；它通过 bootstrap、强约束措辞、Red Flags、对抗测试提高遵守率，但不是硬 runtime policy。
  - 不做团队级知识库或长期记忆；它让 agent 产出设计文档、计划和 git commit，但没有独立知识图谱、RAG 或组织记忆系统。
  - 不适合无 plugin/skill/hook 入口的平台；复制 Markdown 文件只能获得静态资料，不能获得自动触发。
  - 对贡献者很不友好但合理：v5.1.0 明确要求 PR 说明模型、harness、插件、human partner，并证明新 harness 会在 clean session 自动触发 `brainstorming`。

- **与竞品差异：**

  | 维度 | superpowers | compound-engineering-plugin | ECC | OpenCode / jcode |
  |------|-------------|-----------------------------|-----|------------------|
  | 层级 | 方法论与技能分发层 | 团队 workflow / 多 agent review 插件 | cross-harness workflow substrate | 独立 coding agent runtime |
  | 最小内核 | Skills + bootstrap + hooks + adapters | Skills + agents + CLI converter | manifests + installer + hooks + rules | session runtime + tools + provider |
  | 强项 | 轻、跨平台、行为 shaping 成熟 | 多 reviewer、置信度门控、复利沉淀 | 多 harness 资产管理与安全治理 | 实际执行内核与工具系统 |
  | 主要风险 | 无硬强制、依赖宿主能力 | Claude-centric、上下文成本 | 安装副作用和复杂度 | runtime/backlog/安全隔离 |
  | 推荐用途 | 个人/小团队马上提升 agent 纪律 | 团队结构化审查闭环 | 内部 agent workflow substrate | 直接替代/构建 coding agent |

### 集成成本

- **终端用户安装成本低。** README 覆盖 Claude Code、Factory Droid、Codex、Cursor、GitHub Copilot CLI、Gemini CLI、OpenCode 等路径。OpenCode 可在 `opencode.json` 中添加 `"superpowers@git+https://github.com/obra/superpowers.git"`；Gemini 走 `gemini-extension.json` + `GEMINI.md`；Cursor 使用专用 hooks manifest。
- **运行依赖极少。** 核心技能是 Markdown；运行时代码主要是 hook shell、OpenCode plugin JS、brainstorm server CJS 和同步脚本。
- **学习成本来自流程而非工具。** 用户不需要学新 CLI，但要接受 agent 先 brainstorming、再 plan、再 review 的节奏；对于“快速改一行”场景会显得重。
- **二次开发成本中等。** 添加技能本身容易，但写出能稳定触发、不会被 agent 摘要误用、能通过对抗测试的技能很难。


### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键库 / SDK。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| _待补关键依赖_ | | | | | | |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | 🟢 低 | MIT，明文 Markdown 和脚本，商用友好 |
| Bus factor | 🟡 中 | Jesse Vincent / Drew Ritter 主导明显，但社区贡献者多，PR/Issue 活跃 |
| 供应商锁定 | 🟢 低 | 技能本身是 Markdown，适配多个宿主；可 fork 自建 |
| 运行时攻击面 | 🟡 中低 | 核心无服务；但 hooks、brainstorm server、sync 脚本和宿主工具调用仍有副作用边界 |
| Backlog 压力 | 🟡 中高 | 124 open issues + 159 open PRs；热度极高，贡献门槛高 |
| 体验稳定性 | 🟡 中 | v5.x 修了大量 Windows、Bash、OpenCode、Codex、worktree 兼容问题，说明真实平台差异很多 |
| 技能强制力 | 🟡 中 | 依赖 agent 遵守 skill 调用；不是 runtime-enforced policy |
| 贡献治理 | 🟢 强 / 🔴 严 | PR 模板和 AGENTS 明确防 AI slop；对质量好，对外部贡献摩擦大 |

### 采用结论

**🟢 推荐采用（个人/小团队） / 🟡 团队生产化前需要试点和规范。**

理由：

- 如果你已经用 Claude Code / Codex / Cursor / OpenCode，superpowers 是投入产出比极高的质量层：不换工具，只加纪律。
- 它的核心优势不是“技能数量”，而是把技能触发、反理性化、对抗测试、跨平台 adapter、贡献治理串成了一套可复制方法。
- 对团队而言，直接全员安装前应先确认：哪些技能强制执行、哪些场景允许 override、设计/计划文档放哪里、完成前验证如何与 CI 对齐。
- 不建议把它理解为 agent runtime；真正需要自定义 provider、会话持久化、工具权限、HTTP API 的团队，应看 OpenCode / jcode / pi-mono 这类底层 runtime。

---

## 场景二：技术架构学习

### 核心架构图

```text
┌──────────────────────────────────────────────────────────────────────┐
│                         Host Harness Layer                           │
│ Claude Code · Codex · Cursor · OpenCode · Gemini CLI · Copilot CLI    │
│ - Owns LLM calls, file tools, shell tools, subagents, UI/session       │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                     Platform Adapter / Distribution                  │
│ .claude-plugin/plugin.json · .codex-plugin/plugin.json                │
│ .cursor-plugin/plugin.json · .opencode/plugins/superpowers.js         │
│ gemini-extension.json · GEMINI.md · hooks/hooks*.json                 │
│ scripts/sync-to-codex-plugin.sh                                       │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                         Session Bootstrap Plane                      │
│ hooks/session-start                                                  │
│ - detects harness env                                                │
│ - emits additionalContext / bootstrap text                           │
│ - maps startup/clear/compact semantics                               │
│ - avoids resume duplicate injection                                  │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                         Skill Runtime Contract                       │
│ skills/using-superpowers/SKILL.md                                    │
│ - gatekeeper: must load relevant skills before acting                 │
│ - describes trigger discipline and tool mapping references            │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                         Methodology Skills                           │
│ brainstorming · writing-plans · TDD · systematic-debugging            │
│ using-git-worktrees · SDD · code-review · verification                │
│ finishing-a-development-branch · writing-skills                       │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                         Auxiliary Local Code                         │
│ brainstorm visual server · hook wrappers · tests · sync scripts       │
│ - supports UX, compatibility, regression evidence                    │
└──────────────────────────────────────────────────────────────────────┘
```

### 底层技术架构

#### 最小架构内核

脱掉 README、安装命令和平台品牌之后，superpowers 的最小可复刻内核是：

> **Skill Corpus + Trigger Metadata + Session Bootstrap + Host Adapter Matrix + Tool Mapping References + Review/Verification Prompt Templates + Behavioral Regression Harness**

它不是传统意义的代码系统，而是 **agent behavior protocol**：

1. 用 Markdown + YAML frontmatter 定义行为模块。
2. 用 `description` 控制 skill 检索触发，而不是概述流程。
3. 用 session-start hook 把 gatekeeper 技能放进每次新会话。
4. 用宿主 adapter 抹平 Claude/Codex/Cursor/OpenCode/Gemini 的 hook、工具名和 subagent 差异。
5. 用 prompt template 固化审查角色：实现者、spec reviewer、quality reviewer、code reviewer。
6. 用对抗测试和真实 harness transcript 证明技能不仅“写得对”，而是会被 agent 真的执行。

#### 核心抽象

| 抽象 | 文件 / 目录 | 职责 | 为什么重要 |
|------|-------------|------|------------|
| Skill | `skills/*/SKILL.md` | 行为模块：触发条件、步骤、红线、反模式、输出契约 | 把工程方法论变成可 diff、可安装、可迁移的文本资产 |
| Gatekeeper | `skills/using-superpowers/SKILL.md` | 会话入口；要求 agent 在行动前检查并加载相关 skill | 没有 gatekeeper，skills 只是资料库，不会自动进入执行路径 |
| Bootstrap Hook | `hooks/session-start` + `hooks/hooks*.json` | 在 startup / clear / compact 等事件注入 bootstrap | 让纪律不依赖用户每次提醒 |
| Host Adapter | `.claude-plugin/`、`.codex-plugin/`、`.cursor-plugin/`、`.opencode/`、`GEMINI.md` | 把同一技能包分发到不同宿主 | 解决“方法论相同，平台协议不同”的问题 |
| Tool Mapping | `skills/using-superpowers/references/*-tools.md` | 翻译 Claude Code 工具名到 Codex/Gemini/Copilot 等工具 | 避免技能正文与某一平台强绑定 |
| Review Templates | `subagent-driven-development/*-prompt.md`、`requesting-code-review/code-reviewer.md` | 给 subagent 精确上下文和审查职责 | 子代理不继承父会话历史，降低同谋/乐观偏差 |
| Visual Companion Server | `skills/brainstorming/scripts/server.cjs` | brainstorming 的本地 HTML/WebSocket 辅助界面 | 让抽象讨论可视化，但不引入外部依赖 |
| Regression Harness | `tests/*` | 验证触发、显式请求、平台适配、brainstorm server、sync 脚本 | 技能是“代码”，也需要回归证据 |
| Distribution Sync | `scripts/sync-to-codex-plugin.sh` | 将上游确定性镜像到 Codex plugin marketplace fork | 多平台分发不靠手工复制，减少漂移 |
| Contribution Gate | `AGENTS.md` / PR template | 过滤 AI slop、要求真实问题和 human review | 项目本身就是 agent-facing 项目，治理必须显式写给 agent |

#### 控制面 / 数据面分离

- **控制面：**
  - skill frontmatter 的 `name` / `description` 决定何时被检索和加载。
  - `using-superpowers` 决定 agent 是否必须停下、加载技能、再行动。
  - hooks 和 plugin manifests 决定 bootstrap 何时进入宿主会话。
  - PR template、AGENTS、writing-skills 规定贡献者和 agent 如何修改系统。

- **数据面：**
  - 设计文档、计划、测试、代码 diff、git branch、worktree、agent transcript 是被技能操作的对象。
  - brainstorming server 的 `content/` 目录承载 HTML 屏幕，`state/` 目录承载 events、server-info、pid、log，v5.0.6 将两者分离，避免状态文件通过 HTTP 暴露。
  - OpenCode plugin 的 bootstrap 内容被 module-level cache 读取，避免每个 agent step 重复 fs read 和 frontmatter regex。

这个分离很关键：superpowers 不接管宿主 runtime，只在控制面注入协议；实际文件、终端、模型和会话仍由宿主执行。

#### 关键执行链路

**链路 1：新会话自动进入 superpowers 协议**

```text
host starts session
→ platform hook fires session-start
→ hooks/session-start detects host env
→ emits bootstrap / additionalContext
→ agent sees using-superpowers requirement
→ before acting, loads matching skill
→ skill dictates next action / questions / verification
```

失败点与修复：

- Bash 5.3 heredoc 大变量展开曾导致 hang，v5.0.3 改用 `printf`。
- Ubuntu/Debian dash 不支持 `${BASH_SOURCE}`，改成 POSIX-safe `$0`。
- Cursor Windows 直接执行 extensionless script 会打开编辑器，v5.1.0 改用 `run-hook.cmd`。
- resume 会话重复注入上下文会污染历史，v5.0.3 限定 startup / clear / compact。

**链路 2：从模糊需求到计划**

```text
user: "Let's make a react todo list"
→ bootstrap says relevant skills must be checked
→ brainstorming triggers before code
→ agent asks one question at a time, explores alternatives
→ writes spec / design
→ inline self-review checks placeholders, consistency, scope, ambiguity
→ user review gate
→ writing-plans produces task plan with exact files, tests, validation
→ inline plan self-review checks coverage and placeholders
```

v5.0.6 的关键取舍：brainstorming / writing-plans 曾用 subagent review loop，但 5 个版本 × 5 次回归测试显示质量收益不明显、耗时增加约 25 分钟，于是改为 inline self-review。这个决策说明 superpowers 不是迷信“更多 agent”，而是以行为实验调整流程。

**链路 3：subagent-driven-development 的审查原子**

```text
read plan once
→ for each independent task:
  → dispatch implementer with full task text, not vague file pointer
  → implementer self-review
  → spec compliance reviewer reads actual code, distrust implementer report
  → if spec passes, code quality reviewer checks maintainability/test/security
  → fix issues before next task
→ final verification-before-completion
```

核心不是“派更多代理”，而是 **上下文隔离 + 审查顺序**：spec reviewer 先判“有没有按要求做”，quality reviewer 后判“做得好不好”。如果顺序反过来，代码质量 reviewer 可能优化一个本来就不符合需求的实现。

**链路 4：worktree 安全执行**

```text
using-git-worktrees
→ detect existing isolation: GIT_DIR != GIT_COMMON
→ submodule guard
→ if no existing isolation, ask user consent
→ prefer native harness worktree tool
→ fallback to git worktree
→ verify .worktrees/worktrees ignored
→ setup baseline
```

v5.1.0 重写后，worktree 技能不再隐式创建隔离环境，而是先检测、再征求同意、再优先使用宿主原生工具；`finishing-a-development-branch` 也改为 provenance-based cleanup，只清理 superpowers 创建的 `.worktrees/` / `worktrees/` / `~/.config/superpowers/worktrees/`，避免删掉宿主拥有的工作区。

**链路 5：OpenCode adapter**

```text
opencode loads plugin spec
→ .opencode/plugins/superpowers.js registers skills path through config hook
→ chat message transform injects bootstrap into first user message
→ getBootstrapContent reads once, caches content / missing sentinel
→ OpenCode native skill tool loads superpowers skills
→ tool mapping translates TodoWrite / Task / Skill semantics
```

v5.0.7 把 bootstrap 从 system transform 改到 messages transform，避免系统消息每轮膨胀，也避开 Qwen 等模型对多 system message 的兼容问题。v5.1.0 又缓存 bootstrap 内容，因为 OpenCode 的 `experimental.chat.messages.transform` 会在 agent loop 每一步触发。

#### 状态模型

superpowers 没有自己的全局数据库，但有几个关键状态面：

1. **技能状态**：每个 `SKILL.md` 是静态行为状态，frontmatter 负责索引，正文负责执行协议。
2. **会话状态**：由宿主保存；superpowers 只通过 bootstrap/hook 影响会话起点。
3. **工作状态**：设计文档、计划、测试、git worktree、branch、commit 由具体 skill 生成和检查。
4. **brainstorm server 状态**：`content/` 与 `state/` 分离；`server-info` 记录 URL/port/screen_dir/state_dir；events 文件记录交互信号；idle/owner PID 控制生命周期。
5. **分发状态**：plugin manifests 和 version 字段由 `scripts/bump-version.sh` / `sync-to-codex-plugin.sh` 保持一致。
6. **贡献状态**：PR template 要求记录 model + harness + plugins + human partner，本质是在 GitHub PR 上持久化“这次变更由什么 agent 环境产生”。

#### 契约边界

- **Skill 契约：** agent 必须先加载完整 skill，再执行；description 只描述触发条件，不替代正文。
- **Hook 契约：** session-start 只注入 bootstrap，不执行业务逻辑；各平台 manifest 决定 hook 何时触发。
- **Subagent 契约：** 子代理收到精确上下文，不继承父会话历史；reviewer 必须读代码，不信 implementer report。
- **Worktree 契约：** 不创建嵌套隔离；不清理宿主拥有的 worktree；discard 必须 typed confirmation。
- **Verification 契约：** 没有新鲜验证证据就不能声明完成。这个契约在 superpowers 内部写得非常强硬，但对外仍依赖宿主执行。
- **Contribution 契约：** core library 只接受通用能力；项目特定、团队特定、第三方服务推广、AI slop、未有人类审查的 PR 会被拒。

#### 失败恢复与降级

- **平台 hook 失败：** 用多平台 wrapper 和环境检测修补；Cursor Windows 走 `.cmd`，Copilot CLI 输出 `additionalContext`，Gemini 用 `GEMINI.md` import。
- **brainstorm server 孤儿进程：** owner PID + idle timeout；EPERM 视为 alive；startup 时若 owner PID 已死则禁用 PID 监控，转用 idle timeout。
- **依赖风险：** v5.0.2 移除 vendored `node_modules`，用 Node built-in 模块重写 server，减少安装和供应链问题。
- **review loop 过慢：** 以实验结果移除低收益 subagent review loop，降级为 inline self-review。
- **OpenCode token/IO 膨胀：** bootstrap 改为 user message transform，并缓存内容。
- **Codex marketplace 漂移：** 用确定性 rsync overlay + PR 自动化同步，保留 marketplace metadata。

#### 可复刻设计不变量

如果要重写一个同类系统，必须保留这些不变量：

1. **先有 gatekeeper，再有技能库。** 没有 session bootstrap 的技能库只是文档，不是运行协议。
2. **description 只写触发条件。** 如果 description 总结流程，agent 会按摘要偷懒执行，不读正文。
3. **技能正文要封堵理性化。** Red Flags、Never/Always、失败案例表格不是装饰，是 agent 行为控制手段。
4. **跨平台适配必须独立于技能正文。** 工具名和 hook 格式放 references/adapter，不要污染核心方法论。
5. **子代理必须上下文隔离。** reviewer 不应拿父会话历史，也不应相信 implementer 自述。
6. **审查顺序固定：先 spec compliance，再 quality。** 否则容易把错误需求实现“优化”得更漂亮。
7. **工作区所有权要可证明。** 创建前检测，清理前判断 provenance；不要删除宿主管理的 workspace。
8. **完成声明必须绑定证据。** “应该可以”是协议失败，必须让 agent 把命令、输出和退出码作为声明前置条件。
9. **技能变更要行为测试，不只是语法检查。** Markdown 没有编译器，只能通过 adversarial prompt / transcript / harness test 验证。
10. **贡献流程要写给 agent 看。** 在 agent-heavy 仓库里，PR template 和 AGENTS.md 是防垃圾贡献的 runtime guardrail。

---

## 质量与成熟度

### 代码与内容质量

- **内容一致性高。** 14 个核心 skills 都采用 YAML frontmatter + H1 + 明确触发/步骤/红线的结构。
- **语言强约束。** `verification-before-completion`、`test-driven-development`、`using-superpowers` 等技能有大量 “Never / Always / Red Flags / Iron Law”，目标是压制 agent 常见偷懒借口。
- **工程化细节强。** v5.x release notes 不是泛泛 changelog，而是记录 Bash、Windows、OpenCode、Codex、PID、WebSocket、worktree provenance 等真实兼容问题。
- **少量文档漂移。** `docs/README.opencode.md` 仍写 `experimental.chat.system.transform`，而 v5.0.7 release notes 已说明改为 messages transform；这种跨平台快速演进项目需要持续文档校准。

### 测试

本轮按用户要求只做静态源码分析，未继续运行项目/测试/构建；以下为源码结构与文档证据。

- **测试目录规模：** `tests/` 下 52 个文件。
- **主要测试面：**
  - `tests/skill-triggering/`：验证特定 prompt 是否触发对应 skill。
  - `tests/explicit-skill-requests/`：验证用户显式要求使用技能时，agent 是否真的加载和执行。
  - `tests/subagent-driven-dev/`：用 svelte-todo、go-fractals 示例检查 SDD 工作流。
  - `tests/claude-code/`：Claude Code headless skill tests，含 SDD、document review、worktree native preference、requesting-code-review。
  - `tests/opencode/`：plugin loading、priority、tools、bootstrap caching。
  - `tests/brainstorm-server/`：server、WebSocket protocol、Windows lifecycle。
  - `tests/codex-plugin-sync/`：Codex marketplace sync 脚本。
- **测试哲学：** 不是覆盖率优先，而是行为证据优先。尤其 `writing-skills` 要求对技能本身做 TDD：先让 agent 在没有技能时失败，再写技能让 agent 成功，再封堵 loophole。

### CI/CD 与发布

- **GitHub Actions：** `.github/` 下只有 issue templates、PR template、FUNDING，没有 workflow 文件；项目质量 gate 主要靠本地/人工/harness 测试和严 PR 模板。
- **版本管理：** `scripts/bump-version.sh` 管理多处 manifest/package 版本；`RELEASE-NOTES.md` 是单一 changelog 来源。
- **Codex 分发：** `scripts/sync-to-codex-plugin.sh` 克隆 `prime-radiant-inc/openai-codex-plugins`，构建 rsync overlay，保留 OpenAI marketplace metadata，提交 sync branch 并打开 PR。
- **v5.1.0 重点：** 移除 legacy slash commands、移除唯一 named agent、worktree 技能重写、AI contributor guideline、Codex sync tooling、OpenCode bootstrap caching、code review 模板合并、Cursor Windows hook 修复、Gemini Task mapping。

### 文档质量

- **README：** 安装路径广，适合用户直接采用。
- **Release Notes：** 信息密度高，能看出每个修复背后的真实平台问题。
- **docs/testing.md：** 明确如何用 Claude Code headless session 和 transcript 验证复杂技能。
- **PR template：** 极强约束，要求说明 model/harness/plugins/human partner；新 harness 必须提供 clean-session transcript，且 “Let's make a react todo list” 必须自动触发 brainstorming。
- **平台文档：** OpenCode、Codex、Gemini、Copilot tool references 存在，但因平台演进快，要留意局部漂移。

### Issue/PR 健康度

- **热度极高。** 2026-06-15 快照为 227,958 stars / 20,281 forks；fork 比例说明很多人不是只收藏，而是在复制/适配。
- **Backlog 可观。** open issues 124 / open PRs 159；对一个方法论插件来说 PR 压力偏高。
- **治理强硬。** v5.1.0 release notes 提到最近 100 个 closed PR 有 94% rejection，主要来自 AI-generated slop：没读模板、重复 PR、伪造问题、把私有配置推到 core、没有 human review。
- **生态外溢明显。** GitHub 搜索可见 superpowers-zh、superpowers-skills、superpowers-lab、superpowers-copilot、amplifier-bundle-superpowers、goose-superpowers、kiro-superpowers 等衍生项目。

---

## 社区与生态

### 生态位置

superpowers 处在 AI coding stack 的 **workflow protocol layer**：

```text
Model Provider
  ↓
Coding Agent Runtime / Harness（Claude Code / Codex / OpenCode / Cursor / Gemini）
  ↓
Workflow Protocol（superpowers / CE / ECC / vibecode）
  ↓
Project Artifacts（spec / plan / tests / commits / PR）
```

它不替代 runtime，而是把 runtime 的自由能力变成工程流程。

### 衍生与扩展

- **官方/作者生态：** `obra/superpowers-skills`、`obra/superpowers-lab` 等技能/实验仓库。
- **中文/本地化：** `jnMetaCode/superpowers-zh` 星数很高，说明技能方法论有跨语言传播需求。
- **宿主迁移：** `superpowers-copilot`、`amplifier-bundle-superpowers`、`goose-superpowers`、`kiro-superpowers` 等项目把方法论迁移到其他 agent harness。
- **工作流融合：** 与 Compound Engineering、ECC、vibecode-pro-max-kit 不完全互斥；superpowers 更适合做轻量 discipline baseline，CE/ECC/vibecode 更适合团队流程或完整 substrate。

### 竞品对比

| 维度 | superpowers | compound-engineering-plugin | ECC | vibecode-pro-max-kit |
|------|-------------|-----------------------------|-----|----------------------|
| 核心哲学 | 纪律注入：brainstorm / plan / TDD / review / verify | 复利工程：plan / work / review / compound | 多 harness 资产与治理 | RIPER-5 spec-driven 交付 |
| 资产形态 | 14 core skills + hooks + adapters | skills + many agents + converter | profiles/components/manifests/hooks | agents/skills/hooks/process memory |
| 用户心智 | 低：装上后让 agent 遵守 | 中：理解 CE 命令和 review pipeline | 高：理解 substrate 和 profiles | 中高：理解 RIPER phases |
| 平台覆盖 | 很广，且轻量 | 多平台但 Claude-first | 很广，偏系统化 | Claude/Codex first-class |
| 强制力 | prompt/skill 级 | prompt/agent 级 | installer/hook/rule 级更强 | hook + process 结构更强 |
| 最值得学 | Red Flags、CSO、TDD-for-docs、bootstrap | 多 reviewer 合成与置信度门控 | manifest/profile/security governance | 项目记忆和 phase gates |

---

## 关键文件走读

### `skills/using-superpowers/SKILL.md`

整个系统的 gatekeeper。它不是“介绍 superpowers”，而是要求 agent：开始任何对话都要检查是否有相关技能；如果有，必须通过 skill 工具加载，不可只凭记忆执行。其价值在于把技能库从“可选参考资料”升级为“会话启动协议”。

### `skills/brainstorming/SKILL.md` + `skills/brainstorming/scripts/server.cjs`

brainstorming 是 superpowers 的产品体验入口：它阻止 agent 直接写代码，通过问题、方案、设计和用户确认把模糊需求转成 spec。`server.cjs` 是零依赖 visual companion server：内置 HTTP、WebSocket frame encode/decode、fs.watch reload、owner PID / idle timeout 生命周期。v5.0.6 将 `content/` 与 `state/` 分离，避免状态文件被 HTTP 暴露。

### `skills/writing-plans/SKILL.md`

把 spec 转成可执行计划。核心不是“列任务”，而是保证每个任务有清晰文件、接口、验证步骤，不留下 TBD / placeholder / vague reference。v5.0.6 后采用 inline self-review，而不是昂贵的 subagent review loop。

### `skills/subagent-driven-development/SKILL.md`

执行层核心技能。要求计划只读一次，每个任务派新子代理，并在每个任务后做 spec compliance review 和 code quality review。它最值得学习的是上下文分配：子代理拿完整任务文本，但不继承父会话历史。

### `skills/subagent-driven-development/spec-reviewer-prompt.md`

明确写着 “Do Not Trust the Report”。reviewer 的任务不是总结 implementer 说了什么，而是读实际代码，逐条比对需求，找 missing requirements、extra work、misunderstanding，并给 file:line 证据。

### `skills/requesting-code-review/code-reviewer.md`

v5.1.0 后 code reviewer named agent 被删除，persona/checklist 合并到这个模板，调用时用 `Task (general-purpose)`。这降低了 named agent 分发不一致的问题，也让 Codex/Copilot/Gemini 等平台更容易扁平化映射。

### `skills/using-git-worktrees/SKILL.md`

v5.1.0 重写后的 worktree 技能体现了 “不要 fight harness”：先检测是否已在 worktree，再区分 submodule，征求用户同意，优先宿主原生 worktree 工具，最后才 `git worktree` fallback。它把 git 操作的危险点写成协议。

### `skills/finishing-a-development-branch/SKILL.md`

完成分支技能不是简单 merge 指南，而是基于环境状态展示 4 个或 3 个选项，并规定何时 cleanup。它特别强调不要清理 harness-owned workspace，PR 分支要保留 worktree，discard 要 typed confirmation。

### `skills/verification-before-completion/SKILL.md`

最强硬的技能之一：没有 fresh verification evidence 就不能声明完成。虽然本报告任务按用户要求不运行 superpowers 项目，但这个技能本身展示了如何把“不要说谎”编码成 agent 可执行检查。

### `hooks/session-start`

跨平台启动脚本。它要处理 shell 兼容、宿主环境变量、startup/resume/clear/compact 差异、输出 JSON 格式。这个文件是 superpowers 从“技能目录”变成“自动注入协议”的关键。

### `.opencode/plugins/superpowers.js`

OpenCode adapter：注册 skills、注入 bootstrap、缓存 bootstrap 内容、处理 transform hook 的频繁调用。v5.x 的多次修复说明 OpenCode adapter 是真实使用路径，不是文档占位。

### `scripts/sync-to-codex-plugin.sh`

Codex marketplace 同步工具。值得学习的是：路径无关、预检 gh/rsync/git/python、base branch 检查、dry-run preview、anchored excludes、保留 marketplace metadata、sync branch + PR 自动化。它是多平台插件分发治理的一部分。

### `.github/PULL_REQUEST_TEMPLATE.md`

这是 agent-era 开源治理样本。它要求披露 model + harness + plugins + human partner；新 harness support 必须提供 clean-session transcript；明确拒绝 copy skills、runtime shim、用户每次 opt-in 等“假集成”。

---

## 评分（1-5）

| 维度 | 分数 | 说明 |
|------|------|------|
| 功能覆盖度 | 5 | 覆盖需求澄清、计划、TDD、debug、worktree、subagent review、code review、完成验证、分支收尾 |
| 架构设计 | 5 | 以 skills + bootstrap + adapters 实现多宿主单内核，边界清楚 |
| 内容质量 | 5 | 技能文本高度工程化，反模式、红线、检查表和审查模板密度高 |
| 测试/验证文化 | 5 | 对 Markdown 技能做行为测试和对抗测试，是同类标杆 |
| 社区活跃度 | 5 | 227k+ stars、20k+ forks，生态外溢明显 |
| 维护风险 | 4 | backlog 与贡献压力高，核心方向仍由少数维护者主导 |
| 采用成本 | 5 | 已有宿主用户安装成本低，心智成本主要来自流程习惯 |
| 可复刻价值 | 5 | Red Flags、CSO、session bootstrap、上下文隔离 review 都值得复用 |

**总分：39/40**

---

## 总结

superpowers 是目前最值得研究的 agent workflow 项目之一。它的厉害之处不在于“写了 14 个提示词”，而在于把提示词变成了一个可分发、可测试、可治理的 **行为协议系统**：

- 用 `using-superpowers` 解决“技能如何进入会话”。
- 用 frontmatter description 和 CSO 解决“技能如何被正确触发”。
- 用 Red Flags / Iron Law / Never-Always 解决“agent 如何少找借口”。
- 用 subagent prompt templates 解决“审查者如何不被实现者污染”。
- 用 hooks / adapters 解决“同一方法论如何跨宿主运行”。
- 用 PR template / AGENTS 解决“agent 参与开源贡献时如何防 slop”。

采用上，它适合作为个人和小团队的 AI 编码纪律底座；架构学习上，它是“文本如何控制文本生成器”的优秀案例；复刻上，真正要学的不是具体文案，而是 **bootstrap、触发、隔离、验证、适配、治理** 这一整套不变量。