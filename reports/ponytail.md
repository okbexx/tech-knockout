# ponytail

> 一句话定位：**跨宿主极简编码纪律插件：把 “YAGNI → 复用 → stdlib → 原生能力 → 已装依赖 → 一行解 → 最小实现” 这套 lazy senior dev ladder，通过 skills、AGENTS.md、hooks、MCP、Hermes/OpenCode/Pi 等 plugin adapters 注入 AI coding agent，抑制过度工程化而不牺牲安全、验证和可访问性。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `DietrichGebert/ponytail` |
| URL | `https://github.com/DietrichGebert/ponytail` |
| Star | 77,556（截至 2026-07-08） |
| Fork | 4,134 |
| 许可证 | MIT |
| 语言 | JavaScript / Python / Markdown；核心资产是 skills、AGENTS.md 与多宿主 adapter |
| 默认分支 | `main` |
| 首次提交 | 2026-06-12 `3a3d78d Initial commit` |
| 最近提交 | 2026-07-07 `1b2760d feat: hide the pi status bar indicator while keeping ponytail active (#324) (#544)` |
| 最新 Release | `v4.8.4`（2026-06-29，`v4.8.4: lazy in Hermes now`） |
| Open Issues / PRs | 31 issues / 104 PRs（GitHub Search API 分别查询 `is:issue` 与 `is:pr`） |
| 贡献者数 | GitHub contributors API 当前可见 44 个贡献者；项目方向仍明显由 `DietrichGebert` 主导 |
| 本地旧 clone / 远端 tip | 本地 `HEAD` 停在 2026-06-26 的 `c4d1925`；`origin/main` 已到 2026-07-07 的 `1b2760d`，ahead/behind=`0/24` |
| 本地规模 | `origin/main` 视角：150 个 tracked files；55 Markdown；49 JS/TS/Shell/Python；17 个 test-ish files；根包与 `ponytail-mcp` 版本都已到 `4.8.4` |
| 分析日期 | 2026-07-08 |
| 分析边界 | 静态源码 / 文档 / Git 历史 / GitHub API；未安装依赖，未运行项目、测试或构建 |

---

## 场景一：是否值得采用

### 解决的问题

ponytail 解决的不是 “agent 不够强”，而是 **agent 太容易多写**：

1. 一个原生 `<input type="date">` 能解决的问题，agent 装日期选择器、写 wrapper、加样式、引入时区讨论。
2. 一个 stdlib / 平台能力能覆盖的问题，agent 手写 util、抽象 interface、加配置项、铺未来扩展。
3. 一个 bug 应该修共享函数，agent 只修报错路径，留下 sibling caller 继续坏。
4. 一个小改动本该短 diff，agent 输出长篇设计说明和无用 scaffold。

ponytail 的答案是：把 “懒但不马虎的 senior dev” 编码成一套可分发规则。它要求 agent 在写代码前先爬 ladder：

```text
1. 这东西真的需要存在吗？            → 不需要就跳过
2. 代码库里已有 helper / pattern 吗？ → 复用
3. 标准库能做吗？                    → stdlib
4. 平台原生能力能做吗？              → native feature
5. 已安装依赖能做吗？                → reuse dependency
6. 一行能做吗？                      → one-liner
7. 最后才写最小实现                  → minimum code
```

目标用户：

- 已经在用 Claude Code、Codex、OpenCode、Hermes、Pi、Gemini CLI、Copilot CLI 的个人开发者。
- 想减少 AI coding agent 过度工程、依赖膨胀、样板代码的小团队。
- 想研究 “prompt/rules 如何跨宿主产品化” 的 agent workflow 设计者。
- 想给内部 agent 加一层 anti-overengineering 纪律，但不想重写 runtime 的团队。

### 核心能力与边界

- **能做什么：**
  - 提供 `lite / full / ultra / off` 强度模式，默认 `full`。
  - 通过 `skills/ponytail/SKILL.md` 定义 lazy senior dev ladder，并区分何时不能偷懒：trust-boundary validation、data-loss error handling、security、accessibility、硬件校准、用户明确要求和非平凡逻辑的最小可运行检查。
  - 通过 `ponytail-review`、`ponytail-audit`、`ponytail-debt`、`ponytail-gain`、`ponytail-help` 扩展成删复杂度、全仓审计、债务 ledger、benchmark scoreboard 和帮助命令。
  - 支持 Claude Code、Codex、GitHub Copilot CLI、Pi、OpenCode、Gemini CLI / Antigravity、Hermes Agent、CodeWhale、Swival、Devin CLI、OpenClaw、Cursor、Windsurf、Cline、Kiro 等不同层级宿主。
  - 对有 hook/plugin 能力的宿主提供 always-on activation、mode tracking、statusline / status UI；对只有 instruction 能力的宿主提供 AGENTS.md / rules 文件。
  - 提供 MCP server，作为 prompt/tool 形式返回 ponytail instructions，服务于只有 MCP 注入点的宿主。

- **不能做什么 / 边界：**
  - 不提供模型、provider routing、shell/file 工具、会话数据库、权限沙箱或 subagent runtime；这些都由宿主负责。
  - 不是硬 policy enforcement。它把规则注入模型上下文，但最终仍依赖模型遵守。
  - 不解决完整工程流程：不覆盖 brainstorm → plan → work → review → release 的全链路，重点是 “少写正确代码”。
  - 不提供团队级治理、审批、central policy server 或组织配置同步。
  - 不保证所有平台 adapter 同成熟度；README 明确区分 full plugin / command-capable host / instruction-tier fallback。

- **与竞品差异：**

  | 维度 | ponytail | superpowers | compound-engineering-plugin | ECC / vibecode / loop-engineering |
  |------|----------|-------------|-----------------------------|-----------------------------------|
  | 层级 | 轻量行为纪律 / anti-overengineering skill layer | Agentic 技能操作系统 | 团队 workflow + 多 persona review + managed installer | cross-harness substrate / spec-driven harness / loop toolkit |
  | 核心目标 | 少写代码、不减安全 | 让 agent 遵守工程流程 | 团队多 agent 审查和知识复利 | 统一多 harness 资产、项目记忆或周期化任务 |
  | 最小内核 | Skill corpus + mode resolver + instruction builder + thin adapters | Skills + bootstrap + hooks + adapters | Skills/agents + converter + installer | Manifest/profile/hooks/state/budget |
  | 集成重量 | 很轻 | 轻到中 | 中 | 中到重 |
  | 风险 | 规则软约束、多平台漂移、benchmark 口径 | 无硬约束、技能强制力依赖宿主 | 安装副作用和上下文成本 | 安装复杂、状态面更重 |

### 集成成本

- **终端安装成本低。** README 给了 Claude Code、Codex、Copilot CLI、Pi、OpenCode、Gemini、Hermes、Devin、OpenClaw、Cursor/Windsurf/Cline/Kiro 等路径；多数路径是 plugin install 或复制规则文件。
- **运行依赖少。** 核心是 Markdown skills + 少量 Node hook；根包 `package.json` 没有 runtime dependencies，MCP 子包才依赖 MCP SDK 与 zod。
- **学习成本低。** 用户只需要理解 ladder 与三个强度：`lite` 提醒更懒方案，`full` 默认执行 ladder，`ultra` 极端 YAGNI。
- **团队推广成本中等。** 个人启用很简单；团队标准化要先定义哪些场景允许 `ultra`，哪些安全/合规代码必须显式 override，如何避免和其他 compression / style 插件冲突。
- **从零到可用：** 支持 plugin 的宿主通常是分钟级；instruction-tier 宿主只需复制 `AGENTS.md` / rules 文件；若要验证 hooks 和命令，需进入各宿主真实环境。


### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键库 / SDK。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| `@modelcontextprotocol/sdk` | protocol SDK | Ponytail MCP server | Avoids hand-rolling MCP stdio, tool registration, and protocol framing | `ponytail-mcp/package.json`; `ponytail-mcp/index.js` | Reuse when exposing agent tools over MCP | MCP should stay read-mostly or clearly mark side effects |
| `zod` | schema validation | MCP tool input validation | Avoids ad hoc runtime argument checks for agent tool calls | `ponytail-mcp/package.json`; `ponytail-mcp/index.js` | Reuse when tool/API inputs need lightweight runtime validation | Keep schemas close to tool contracts; do not turn validation into a separate framework without need |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | 🟢 低 | MIT，商用友好；核心是 Markdown / JS / Python 小插件 |
| Bus factor | 🟡 中高 | 项目爆火但非常新，贡献集中在作者；GitHub API 显示主导者 86 contributions，开放 PR 54 个 |
| 供应商锁定 | 🟢 低 | 行为规则是可复制文本，适配多个宿主；不绑定远端服务 |
| 维护趋势 | 🟡 高速活跃但早期 | 2026-06-12 创建，v4.8.3 已发布；迭代非常快，也意味着接口和文档容易漂移 |
| 安全历史 | 🟡 中低 | 核心无网络服务；但 hooks 会写状态文件、可能改 statusline；`isShellSafe()` 对 shell snippet 做 allowlist 是正向信号 |
| 多平台稳定性 | 🟡 中 | open issues/PR 里大量 Windows、PowerShell、path、host adapter、CJK、插件冲突问题 |
| Benchmark 可信度 | 🟡 中 | 项目主动修正早期 single-shot 夸大口径，提供 agentic benchmark；但对外引用需保留限制条件 |
| CI 覆盖 | 🟡 中 | 有 node:test、rule copy/version checks、npm trusted publishing；但 CI 只跑 Ubuntu，未见 OS matrix、coverage、lint/typecheck/security scan |
| 团队规范风险 | 🟡 中 | `ultra` / “少写” 容易被误用为砍掉必要能力；skill 明确不允许削弱 validation/security/accessibility，但仍是模型软约束 |

### 结论

**🟢 推荐采用（个人 / 小团队） / 🟡 团队标准化前隔离试点。**

理由：

- 如果你已经在用 AI coding agent，ponytail 是投入产出比很高的行为层：不换 runtime，不改 provider，只给模型加 “少写但正确” 的梯子。
- 它的设计足够轻：核心规则集中在 skills，适配器保持薄，多宿主复用同一 instruction builder。
- 它特别适合个人日常编码、代码审查前的 complexity pass、内部 agent skill library 的 anti-overengineering 基础件。
- 团队采用前不要直接全员 `ultra`：先在非关键仓库试点，明确安全/合规/可访问性/测试底线，避免“少写”被误解成“少验证”。

---

## 场景二：技术架构学习

### 核心架构图

```text
┌────────────────────────────────────────────────────────────────────┐
│                         Behavior Source Layer                       │
│ skills/ponytail/SKILL.md · AGENTS.md · command skill files           │
│ - ladder, boundaries, review/audit/debt/gain/help prompt contracts   │
└───────────────────────────────┬────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────┐
│                         Shared Logic Layer                          │
│ hooks/ponytail-config.js · hooks/ponytail-instructions.js            │
│ - mode normalization, default mode resolution, SKILL.md filtering     │
│ - fallback instructions, deactivation command recognition             │
└───────────────────────────────┬────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────┐
│                         Host Adapter Layer                          │
│ Claude/Codex/Copilot hooks · Hermes plugin · OpenCode plugin · Pi    │
│ extension · Gemini manifest · MCP server · rules files               │
│ - inject context, register commands, track mode, expose skills        │
└───────────────────────────────┬────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────┐
│                         Host Runtime Layer                          │
│ Claude Code · Codex · OpenCode · Hermes · Pi · Gemini · Copilot       │
│ - owns LLM call, tools, shell/files, UI/session, security boundary    │
└───────────────────────────────┬────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────┐
│                         Agent Behavior Outcome                      │
│ smaller diff · stdlib/native reuse · fewer dependencies · checks kept │
│ - not hard-enforced policy, but persistent prompt contract            │
└────────────────────────────────────────────────────────────────────┘
```

### 底层技术架构

#### 最小架构内核

脱掉 logo、README 和宿主品牌，ponytail 可复刻的最小内核是：

> **Behavior Skill Corpus + Mode Resolver + Instruction Builder + Host Adapter Matrix + Lightweight State Handle + Soft-Fail Injection Contract**

这几个抽象缺一不可：

1. **Behavior Skill Corpus** 给 agent 明确的行为法则，不只是宣传文案。
2. **Mode Resolver** 让强度可切换，避免 “一个提示词适配所有场景”。
3. **Instruction Builder** 把同一份 skill 文本转成不同宿主可注入上下文，减少多副本文案漂移。
4. **Host Adapter Matrix** 处理每个宿主不同的 hook、plugin、command、MCP、rules 文件格式。
5. **Lightweight State Handle** 记录当前模式，让会话、子代理和下一轮调用能继承状态。
6. **Soft-Fail Injection Contract** 保证插件失败不会拖垮宿主 agent。

#### 核心抽象

| 抽象 | 源码位置 | 职责 | 关键字段 / 方法 | 为什么重要 |
|------|----------|------|-----------------|------------|
| Mode | `hooks/ponytail-config.js`、`__init__.py` | 表示运行强度和开关 | `off/lite/full/ultra/review`、`normalizeMode()`、`normalizeConfigMode()` | 让同一规则可以按场景强弱切换 |
| Default Mode Resolver | `getDefaultMode()` / `_default_mode()` | 解析默认模式 | `PONYTAIL_DEFAULT_MODE` → config file → `full` | 建立跨宿主一致的启动语义 |
| Instruction Builder | `hooks/ponytail-instructions.js`、Hermes `build_injected_context()` | 生成最终注入文本 | `filterSkillBodyForMode()`、`getPonytailInstructions()` | 数据面核心：SKILL.md 变成 prompt context |
| Runtime State | `hooks/ponytail-runtime.js`、OpenCode state file、Pi session entry、Hermes `_current_mode` | 保存当前模式 | `.ponytail-active`、`ponytail-mode` entry、process-global mode | 让模式跨 turn / subagent / host session 生效 |
| Host Adapter | `__init__.py`、`.opencode/plugins/ponytail.mjs`、`pi-extension/index.js`、`hooks/*.js` | 接入宿主生命周期 | `pre_llm_call`、`experimental.chat.system.transform`、`before_agent_start`、hook stdout schema | 把同一规则落到不同 agent runtime |
| Command Contract | `commands/*.toml`、Hermes `register_command()`、Pi/OpenCode command hooks | 用户控制入口 | `/ponytail`、`/ponytail-review`、`/ponytail-audit` 等 | 保持跨平台 UX 一致 |
| Skill Corpus | `skills/*/SKILL.md`、`AGENTS.md` | 行为本体 | ladder、boundaries、review tags、debt/gain/help | 这是产品真正的数据面和 agent-facing API |
| MCP Surface | `ponytail-mcp/index.js`、`instructions.js` | 给 MCP-only host 返回规则 | prompt `ponytail`、tool `ponytail_instructions` | 承认 MCP 不是 always-on adapter，但提供干净的读取入口 |

#### 控制面 / 数据面

- **控制面：**
  - 模式解析：`hooks/ponytail-config.js`、Hermes `__init__.py`。
  - 状态写入：`.ponytail-active`、OpenCode config 目录、Pi session entry、Hermes 进程变量。
  - 生命周期路由：Claude/Codex/Copilot hooks、OpenCode transform、Pi `before_agent_start`、Hermes `pre_llm_call`、MCP prompt/tool。
  - 命令映射：`/ponytail` 切换模式，`/ponytail-*` 触发具体 skill。
  - 安全阀：`isShellSafe()`、slash access check、invalid mode usage、silent hook failure。

- **数据面：**
  - 真正注入模型的规则文本：`skills/ponytail/SKILL.md`、`skills/ponytail-review/SKILL.md`、fallback instructions。
  - 文档化分发资产：`AGENTS.md`、`.cursor/rules/`、`.windsurf/rules/`、`.clinerules/`、`.github/copilot-instructions.md`。
  - benchmark 结果与 examples：支撑 “少写但安全” 的外部叙事。

关键点：ponytail 的 “数据” 不是业务数据，而是 **agent behavior text**。控制面只负责把正确文本在正确时机送到正确宿主。

#### 关键执行链路

**链路 1：Claude / Codex / Copilot SessionStart 注入**

```text
Host SessionStart hook
  ↓
hooks/ponytail-activate.js
  ↓
getDefaultMode()
  ↓
mode == off ? clearMode + no rules : setMode(mode)
  ↓
getPonytailInstructions(mode)
  ↓
writeHookOutput(event, mode, context)
  ↓
Host receives additionalContext / hookSpecificOutput / raw stdout
  ↓
Agent starts with Ponytail rules active
```

**链路 2：用户切换模式**

```text
User prompt: /ponytail lite | full | ultra | off
  ↓
hooks/ponytail-mode-tracker.js / host command handler
  ↓
normalize mode
  ↓
write .ponytail-active / session entry / process mode
  ↓
next turn reads current mode
  ↓
injected instructions change intensity
```

**链路 3：Hermes 原生插件**

```text
Hermes discovers plugin.yaml + __init__.py
  ↓
register(ctx)
  ├─ register_skill(skills/*)
  ├─ register_hook(pre_llm_call)
  ├─ register_hook(pre_gateway_dispatch)
  └─ register_command(/ponytail*)
  ↓
pre_llm_call → build_injected_context(current/default mode)
  ↓
Hermes model call receives injected context
  ↓
Gateway /ponytail-review → rewrite to skill prompt if slash access allows
```

**链路 4：子代理继承**

```text
Parent has active .ponytail-active
  ↓
Host SubagentStart hook
  ↓
hooks/ponytail-subagent.js
  ↓
readMode()
  ↓
mode exists ? getPonytailInstructions(mode) : silent exit
  ↓
Subagent receives same Ponytail ruleset
```

**链路 5：MCP 只读分发**

```text
MCP client calls prompt ponytail or tool ponytail_instructions
  ↓
ponytail-mcp/index.js
  ↓
resolveMode(mode)
  ↓
buildInstructions(mode)
  ↓
return text + structuredContent
```

#### 状态模型

| 状态类型 | 位置 | 谁读写 | 生命周期 / 一致性规则 |
|----------|------|--------|------------------------|
| 默认模式 | `PONYTAIL_DEFAULT_MODE`、`~/.config/ponytail/config.json`、`%APPDATA%\ponytail\config.json` | config resolver 读；Pi/Hermes/commands 可写 config | 跨会话持久；env 优先于 config；非法值忽略 |
| 当前运行模式 | `.ponytail-active`、OpenCode `~/.config/opencode/.ponytail-active`、Pi `ponytail-mode` session entry、Hermes `_current_mode` | mode command / hooks 写，injection hook 读 | 宿主特化；通常下轮生效；Hermes 是进程级，隔离弱于 session file |
| 注入上下文 | 动态生成，不落盘 | instruction builder 读 skill 后生成 | 每次注入时从 mode + skill text 推导；skill 读取失败回退 fallback |
| statusline / UI 展示 | Claude `settings.json` statusLine、Pi status UI | activation hook 提示配置，Pi extension 设置 UI | 可选态；不影响核心注入 |
| 外部宿主状态 | Claude/Codex/Copilot/OpenCode/Hermes/Pi/Gemini 的 plugin runtime | 宿主拥有 | ponytail 不接管，只遵守其 hook/command/MCP 契约 |

#### 契约边界

- **内部契约：**
  - JS 与 Python 都实现 mode normalization、default mode、skill frontmatter stripping、mode-aware filtering。
  - `filterSkillBodyForMode()` 依赖 Markdown 行形态：表格行 `| **lite** |` 和 example label `- lite:` 是半结构化 API。
  - `writeHookOutput()` 封装 Claude / Codex / Copilot 不同 stdout schema。

- **外部 API / CLI / MCP 契约：**
  - Claude/Codex/Copilot hook events：`SessionStart`、`UserPromptSubmit`、`SubagentStart`。
  - OpenCode server plugin：`config`、`experimental.chat.system.transform`、`command.execute.before`。
  - Hermes plugin：`plugin.yaml`、`register(ctx)`、`pre_llm_call`、`pre_gateway_dispatch`。
  - Pi extension：`registerCommand`、`pi.on(session_start/agent_start/before_agent_start)`。
  - MCP：prompt `ponytail`、tool `ponytail_instructions`，mode 参数仅暴露 `lite/full/ultra`。

- **Agent-facing Skill / Hook / prompt / schema 契约：**
  - `skills/ponytail/SKILL.md` 定义 ladder、boundaries、intensity、output contract。
  - `AGENTS.md` 是 instruction-tier fallback 的可执行上下文。
  - `/ponytail-*` 命令在不同宿主尽量保持同名。
  - `ponytail:` 注释是 debt/shortcut ledger 的约定。

#### 失败与降级模型

| 失败类型 | 检测方式 | 系统行为 | 降级 / 修复动作 |
|----------|----------|----------|------------------|
| mode 为 `off` | normalized mode | 不注入规则，清除或忽略 active flag | 显式关闭，安全 |
| skill 文件读取失败 | `readFileSync` / `read_text` exception | 使用内建 fallback instructions | degraded mode，仍能给基本规则 |
| 状态文件写入失败 | fs exception | catch 后静默 | 不阻塞宿主，最多 mode 不持久 |
| hook stdout / EPIPE | write exception | catch 后静默 | 避免宿主把 hook 判失败 |
| shell path 不安全 | `isShellSafe()` allowlist | 不生成 statusline shell snippet | 提示手工配置，避免 command injection |
| 用户误提 “normal mode” | `isDeactivationCommand()` 全句匹配 | 只有整句命令才关闭 | 避免普通需求误关 ponytail |
| slash 权限不足 | Hermes `_check_slash_access` | 不 rewrite gateway command | 尊重宿主访问控制 |
| 非法 mode | normalize 失败 | usage / fallback default | 不写入坏状态 |
| host 只有 MCP | MCP prompt/tool only | 不假装 always-on | 明确是只读规则服务 |

#### 可复刻设计不变量

1. **行为源必须集中。** 多平台 adapter 不能各自复制一套规则；规则漂移会让产品不可维护。
2. **适配器必须薄。** 宿主桥只做注入、命令映射和状态保存，不重写行为逻辑。
3. **模式语义必须跨语言一致。** JS/Python/MCP/插件都要解释同一组 mode。
4. **off 必须是真的 off。** 关闭模式不应留下隐藏注入。
5. **失败要 soft-fail。** 规则插件坏了不能拖垮用户的 agent session。
6. **status/UI 是衍生态，不是核心依赖。** 状态展示失败不影响行为注入。
7. **宿主边界要承认差异。** 有些平台支持 always-on，有些只支持 prompt/rules，有些只能 MCP；不要假装等价。
8. **agent-facing Markdown 是 API。** SKILL.md 格式变更要用测试约束，不然过滤器和命令语义会坏。
9. **少写不等于少看。** ladder 必须在读代码和理解 flow 之后运行；否则会把 lazy 变成草率。
10. **安全、验证、可访问性不可被压缩。** anti-overengineering 不能变成 anti-quality。

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 核心做成 prompt/skill，而非 runtime | `skills/` + adapters | 硬执行能力、强策略控制 | 轻、跨宿主、安装成本低 |
| 多宿主薄 adapter | 每个平台少量 glue code | 单一 runtime 的一致性 | 用户已在不同 agent harness 中工作 |
| mode file / session entry / process var 分散存储 | 宿主特化状态 | 全局强一致 | 降低依赖，不引入服务或数据库 |
| Markdown 半结构化过滤 | 直接从 SKILL.md 过滤 mode 行 | 严格 schema | 作者可读、可复制、可直接成为 agent context |
| hook 失败静默 | catch and continue | 强错误可见性 | 插件不能破坏主 agent 会话 |
| MCP 只做只读规则服务 | prompt/tool 返回 instructions | always-on 控制 | MCP 不是所有宿主的 lifecycle hook，边界清楚 |
| benchmark 公开修正 | 从 single-shot 改成 agentic benchmark 并写限制 | 更漂亮的营销数字 | 增强可信度，承认任务差异 |

### 值得学习的模式

1. **Behavior-as-distribution**：把一套 agent 行为规则当作可安装产品，而不是散落在 README。
2. **Single skill source + host adapters**：核心 prompt 是数据面，adapter 是控制面。
3. **Mode-filtered skill text**：用强度模式控制同一 skill 的严格程度，避免多份 skill 漂移。
4. **Soft-fail plugin design**：agent 插件不要因为状态文件、stdout、UI 失败而阻断主工作流。
5. **Instruction-tier fallback**：即使没有插件 API，也能通过 AGENTS.md / rules 文件保持最低能力。
6. **Benchmark honesty loop**：把社区质疑转成更公平的 benchmark，而不是硬撑宣传口径。
7. **Subagent context inheritance**：父线程注入不等于子代理继承，需要独立 SubagentStart hook。

### 反模式 / 踩坑点

- **Markdown 格式即 API。** `filterSkillBodyForMode()` 对表格行和 example label 有隐式假设，文案编辑可能破坏行为。
- **Hermes `_current_mode` 是进程级。** 在共享 gateway / 多会话环境下隔离弱；README 也提醒 runtime mode process-local。
- **平台覆盖越广，边角越多。** Windows、PowerShell、CRLF、host-specific path、hook timeout、CJK 语言上下文、插件冲突都会持续出现。
- **benchmark 容易被误读。** “少写”在 over-build trap 上很强，但已经 minimal 的任务收益接近零；真实 agent session cost 也可能因多轮注入和工具调用上升。
- **soft-fail 降低可观测性。** 对用户体验好，但排障时可能不知道插件没有生效。

### 可借鉴的具体技术点

- `isShellSafe()` 用 allowlist 阻止不安全路径进入 statusline shell command。
- `isDeactivationCommand()` 要求整句匹配，避免普通需求文本误触发关闭。
- `writeHookOutput()` 封装多宿主 stdout schema，避免 adapter 里到处写分支。
- MCP tool 标注 `readOnlyHint: true, openWorldHint: false`，清楚表达只读规则服务。
- Hermes gateway command rewrite 前检查 slash access，避免插件绕过宿主权限。
- CI 中 `scripts/check-rule-copies.js` / `check-versions.js` 把规则复制和版本漂移变成测试。

---

## 架构解剖

### 目录结构

```text
ponytail/
├── AGENTS.md                         # compact always-on rules，instruction-tier fallback
├── skills/                           # core behavior corpus：ponytail/review/audit/debt/gain/help
├── hooks/                            # Claude/Codex/Copilot shared hooks + config/runtime/instruction builder
├── commands/                         # command templates for command-capable hosts
├── __init__.py                       # Hermes native plugin
├── plugin.yaml                       # Hermes plugin manifest
├── .opencode/plugins/ponytail.mjs    # OpenCode server plugin
├── pi-extension/                     # Pi extension adapter + tests
├── ponytail-mcp/                     # MCP prompt/tool server
├── .claude-plugin/ .codex-plugin/    # marketplace manifests
├── .cursor/ .windsurf/ .clinerules/  # instruction-tier rules copies
├── .github/                          # Copilot instructions + CI workflows
├── .openclaw/ .kiro/ .agents/        # additional host formats
├── docs/                             # agent portability and platform-native docs
├── benchmarks/                       # single-shot and agentic benchmark harness/results
├── examples/                         # before/after examples
├── scripts/                          # rule copy/version checks, OpenClaw publish, uninstall
└── tests/                            # node:test compatibility and adapter tests
```

### 技术栈

- **运行时 / 框架：** Node.js / JavaScript；Hermes adapter 用 Python；MCP server 用 `@modelcontextprotocol/sdk` + `zod`。
- **构建 / 打包：** npm package `@dietrichgebert/ponytail`；根包 exports OpenCode plugin；GitHub tag release + npm trusted publishing。
- **测试：** Node built-in `node:test` / `assert`；Hermes plugin tests 通过 Node spawn Python 静态验证 Python plugin 行为；benchmark correctness 会调用 Python/Node。
- **CI/CD：** GitHub Actions Ubuntu，Node 22 + Python 3.12 + pandas，跑 rule copy check、version check、`npm test`；发布用 npm OIDC trusted publishing。

### 模块依赖关系

```text
skills/ponytail/SKILL.md
        ▲
        │ read/filter
hooks/ponytail-instructions.js ───────► ponytail-mcp/instructions.js
        ▲                                 ▲
        │                                 │
hooks/ponytail-config.js                  ponytail-mcp/index.js
        ▲
        │
hooks/ponytail-runtime.js
        ▲
        ├── ponytail-activate.js
        ├── ponytail-mode-tracker.js
        └── ponytail-subagent.js

Same behavior mirrored in:
__init__.py  ──► Hermes hooks / commands / skills
.opencode/plugins/ponytail.mjs ──► OpenCode transform / commands
pi-extension/index.js ──► Pi commands / session state / before_agent_start
```

### 扩展机制

- 新宿主 adapter：新增对应 host manifest / plugin / hook，但应复用 `skills/` 和 `hooks/ponytail-instructions.js`。
- 新命令：增加 `skills/ponytail-*/SKILL.md`、`commands/*.toml`，并同步 Hermes/OpenCode/Pi/其他宿主命令暴露。
- 新模式：需要同步 JS `VALID_MODES` / Python `CONFIG_MODES` / tests / docs；当前只建议 `lite/full/ultra/off/review`。
- 新 instruction-tier host：复制或生成对应 rules file，并用 `check-rule-copies.js` 防漂移。

---

## 质量与成熟度

### 代码质量

- **类型系统：** JavaScript 为主，无 TypeScript；代码偏小而直接，依赖少。Python Hermes plugin 使用类型注解但不是重型类型驱动。
- **错误处理：** hooks 普遍采用 best-effort + silent catch，符合 “插件不能阻塞宿主” 的目标；但也牺牲一些可观测性。6 月底到 7 月初新增的修复也集中在这里：Windows stdin EOF、BOM/CRLF、malformed settings、Pi `before_agent_start`、OpenCode 参数类型、default-mode 写入异常等都被补进防御逻辑。
- **代码风格一致性：** 共享逻辑集中在 `hooks/ponytail-config.js` / `ponytail-instructions.js`；多宿主 adapter 风格一致，薄而明确。
- **安全意识：** 对 shell snippet 路径做 allowlist；Hermes gateway rewrite 尊重 slash access；deactivation command 防误触。

### 测试

- **测试框架：** Node built-in `node:test` 和 `assert`；部分 tests 用 `spawnSync` 调 Python 或 Node hook。
- **覆盖率：** 未见 coverage 报告。
- **测试类型：**
  - hook compatibility：Claude/Codex/Copilot state、stdout schema、SubagentStart。
  - host adapter：Hermes plugin、OpenCode plugin、Gemini extension、Copilot plugin、OpenClaw skills。
  - command behavior：mode parsing、slash command、skill command。
  - uninstall / Windows path / statusline safety。
  - persistent default mode、Hermes/Windows compatibility、Pi extension 行为回归。
  - benchmark utilities：LOC/correctness。
- **静态判断：** 对这种 prompt/plugin distribution 项目而言，测试重点放在 adapter 契约和规则漂移上是正确的；近 24 个提交也继续往 Windows/Hermes/Pi/uninstall 这些跨宿主边界补测试。但 CI 仍未扩成真正的多 OS matrix。

### CI/CD

- `.github/workflows/test.yml`：
  - push main/tag 和 PR 触发。
  - `actions/setup-node@v4` Node 22，`actions/setup-python@v5` Python 3.12。
  - 安装 pandas，跑 `check-rule-copies.js`、`check-versions.js`、`npm test`。
- `.github/workflows/publish.yml`：
  - tag `v*` 或 manual dispatch。
  - `id-token: write` + `npm publish`，使用 npm trusted publishing / OIDC。
- **评价：** 发布链路现代；CI 基础合格。但跨平台 adapter 项目最好增加 Windows/macOS matrix、lint/security scan 和 coverage。

### 文档质量

- README 强，定位、安装、命令、benchmark、FAQ 都完整。
- `docs/agent-portability.md` 很关键，明确每个宿主对应文件和能力层级。
- benchmark 文档主动说明旧 single-shot 数字的局限，并给出 agentic benchmark 修正，这比硬营销可信。
- 缺点是项目变化极快，文档漂移风险高；open issues/PR 已出现 Windows、path、OpenCode、CJK、benchmark 口径等修正。

### Issue / PR 健康度

- 开放 issue：31；开放 PR：104。对一个 2026-06-12 创建的新项目来说，社区热度极高，但维护队列压力也进一步抬升。
- 高频主题：新平台 adapter 请求、Windows/PowerShell/path 兼容、benchmark 计量、CJK 语言上下文、插件冲突、statusline/Hook UX，以及默认 mode 持久化、Pi/OpenCode 参数健壮性等跨宿主边缘问题。
- issue/PR 多数无 label / assignee / milestone，triage 体系较轻。
- 维护模式是 “强单核 + 大量外部贡献”，短期迭代快，长期看 bus factor 和 backlog 需要观察；当前 24 commits 的增量里，明显能看到作者在持续收 Pi、Hermes、Windows、uninstall 等适配债。

---

## 社区与生态

### 社区评价

从 stars、PR 数、issue 主题和 README benchmark 争议可以看出：

- **认可点：** 开发者对 “AI agent 过度工程” 有强共鸣；ponytail 用一个好记的 senior-dev persona 把问题讲清楚，传播性极强。
- **真实痛点：** 宿主适配面太宽，平台差异持续制造 bug；CJK/非英语上下文、Windows、hook timeout、冲突插件是实际使用中的痛点。
- **可信信号：** 项目没有回避 benchmark 质疑，而是在 README 中承认旧口径夸大，并补 agentic benchmark；近 24 个提交也主要在补真实跨宿主/跨平台毛边，而不是只堆营销文案。
- **风险信号：** 爆火很快，open PR backlog 已到 104，长期维护和 governance 还没被时间验证。

### 衍生项目 / 插件生态

ponytail 自己就是跨宿主分发包，生态主要体现为 host adapters，而不是第三方插件市场：

- Full plugin / command-capable：Claude Code、Codex、Copilot CLI、OpenCode、Pi、Hermes Agent、Devin、OpenClaw、Gemini/Antigravity。
- Instruction-tier：Cursor、Windsurf、Cline、GitHub Copilot editor、Kiro、CodeWhale、VS Code Codex extension、generic AGENTS.md readers。
- MCP-tier：`ponytail-mcp` 作为只读 prompt/tool server。

### 竞品对比

- **最直接竞品 / 邻近项目：** `superpowers`。两者都是跨宿主 agent behavior distribution；superpowers 覆盖完整工程纪律，ponytail 更窄、更轻、更聚焦少写代码。
- **团队 workflow 邻近：** `compound-engineering-plugin`。CE 更重，强调团队 brainstorm、plan、work、review、compound 复利闭环。
- **cross-harness substrate：** `ECC`。ECC 更像 workflow OS，ponytail 是一个窄行为模块。
- **spec-driven harness：** `vibecode-pro-max-kit`。vibecode 有项目记忆和 phase agents，ponytail 没有状态化 delivery lifecycle。
- **recurring loop toolkit：** `loop-engineering`。loop-engineering 解决周期任务运营，ponytail 解决单次编码时的过度实现。
- **风格压缩邻居：** `caveman`。caveman 压缩表达，ponytail 压缩代码与实现范围；README 也明确两者不同。

---

## 关键代码走读

### 1. `getPonytailInstructions()` / `filterSkillBodyForMode()`

- 路径：`hooks/ponytail-instructions.js`
- 职责：把 `skills/ponytail/SKILL.md` 转成当前 mode 的注入文本。
- 实现要点：
  - 去掉 YAML frontmatter。
  - 过滤 mode-specific table rows 和 examples。
  - `review` 作为独立模式，不走普通 intensity 过滤。
  - 读取失败时返回内建 fallback instructions。
- 价值：这是数据面核心。它让多个宿主共享同一份规则，而不是复制多份 prompt。

### 2. `getDefaultMode()` / `isDeactivationCommand()` / `isShellSafe()`

- 路径：`hooks/ponytail-config.js`
- 职责：统一 mode 语义、默认值解析和安全边界。
- 实现要点：
  - 默认模式解析顺序：`PONYTAIL_DEFAULT_MODE` → config file → `full`。
  - `normal mode` / `stop ponytail` 只在整句命令时关闭，避免误触。
  - statusline shell command 只允许普通路径字符，拒绝 quotes、`&`、`$`、backtick、`;` 等。
- 价值：小文件定义了全系统控制面语义。

### 3. `writeHookOutput()` / `setMode()` / `readMode()`

- 路径：`hooks/ponytail-runtime.js`
- 职责：封装 Claude / Codex / Copilot 的运行态差异。
- 实现要点：
  - 根据 `PLUGIN_DATA` / `COPILOT_PLUGIN_DATA` / Claude config dir 选择 state dir。
  - `SessionStart`、`SubagentStart`、Codex 和 Copilot 输出 schema 不同，集中在一个函数处理。
  - active flag 缺失即 off。
- 价值：把多宿主 hook 差异收敛到一个 compatibility layer。

### 4. Hermes plugin `register()` / `build_injected_context()` / `rewrite_gateway_command()`

- 路径：`__init__.py`
- 职责：让 ponytail 成为 Hermes 原生插件，而不是纯 rules copy。
- 实现要点：
  - 遍历 `skills/` 注册 `ponytail:<skill>`。
  - `pre_llm_call` 注入当前 mode context。
  - `pre_gateway_dispatch` 将 `/ponytail-review` 等 gateway slash command 改写成普通 agent prompt，并尊重 Hermes slash access。
  - `/ponytail` 命令只改进程内 `_current_mode`。
- 风险点：`_current_mode` 是 process-global；共享 gateway 多用户场景需限制 `/ponytail` 给可信用户，README 也有提示。

### 5. OpenCode plugin transform

- 路径：`.opencode/plugins/ponytail.mjs`
- 职责：在 OpenCode 每轮 chat system transform 里注入 ponytail。
- 实现要点：
  - `config()` 注册 commands 和 skills path。
  - `experimental.chat.system.transform` 每轮读取 mode，push ruleset 到 `output.system`。
  - `command.execute.before` 处理 `/ponytail` mode persistence。
- 价值：展示同一 instruction builder 如何在 “每轮动态注入” 型宿主中复用。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 4 | 对 anti-overengineering / 少写正确代码覆盖很完整；不覆盖完整工程流程和 runtime policy |
| 代码质量 | 4 | 代码小、模块边界清楚、依赖少；JS 无类型系统，Hermes process-global mode 有隔离风险 |
| 文档质量 | 5 | README、agent portability、benchmark limitations 写得很完整；但高速演进带来漂移风险 |
| 社区活跃度 | 5 | 77k+ stars、104 个 open PR、31 个 open issues，GitHub-native 热度极强；但项目极新，backlog 也更高 |
| 架构设计 | 5 | Skill corpus + instruction builder + thin adapters + soft-fail contract 非常清晰 |
| 学习价值 | 5 | 非常适合学习 agent behavior 产品化、跨宿主 prompt distribution、软约束降级设计 |
| 可借鉴度 | 5 | 可直接借鉴到内部 agent skill library：mode、adapter、fallback、debt comment、rule drift checks |

---

## 总结

### 一句话评价

**ponytail 是一个很小但很有代表性的 agent behavior product：它没有做新 runtime，却把“别过度工程”这件事做成了可安装、可切换、可跨宿主分发、可测试的规则层。**

### 谁应该用

- 个人开发者：已经用 Claude Code / Codex / OpenCode / Hermes / Pi，希望 agent 少写废代码。
- 小团队：想先用轻量 rules/skills 改善 AI coding 风格，不想引入重型 workflow OS。
- 内部 agent 平台设计者：想学习如何把 prompt discipline 做成跨平台插件包。
- code reviewer：想加一个专门找 overengineering 的 review pass。

### 谁不应该直接用

- 需要硬策略执行、权限沙箱、审批流的企业平台；ponytail 不是 policy engine。
- 需要完整规划/TDD/多 agent review/周期任务运营的团队；应看 superpowers、compound-engineering-plugin、ECC、loop-engineering。
- 对安全/合规代码没有明确 review 机制的团队；不要把 `ultra` 当成少写安全措施的借口。
- 想要稳定企业 LTS 的组织；项目创建时间太近，应持续观察 backlog 和平台兼容性。

### 下一步

1. **个人试用：** 推荐 `full` 默认，`ultra` 只在 throwaway / 小改动中使用。
2. **团队试点：** 先在非关键仓库启用，规定 validation/security/accessibility 不可被简化。
3. **架构借鉴：** 内部 agent skill library 可以直接复制 “single skill source + mode resolver + thin adapters + soft-fail injection” 模式。
4. **继续观察：** 关注 open PR backlog、Windows/CJK/插件冲突修复、Pi/OpenCode edge-case hardening、Hermes 多会话隔离是否演进。
