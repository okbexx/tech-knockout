# vibecode-pro-max-kit

> 一句话定位：**vibecode-pro-max-kit 是一套把 Claude Code / Codex 驱动开发流程“装进仓库”的 workflow kit：它不提供自己的 agent runtime，而是通过 agents、skills、hooks、`process/` 工件和 manifest-driven installer，把 7 阶段 spec-first 交付纪律复制到任意项目里。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `withkynam/vibecode-pro-max-kit` |
| URL | `https://github.com/withkynam/vibecode-pro-max-kit` |
| Star | 1018（2026-07-07 观测） |
| Fork | 216 |
| 许可证 | MIT |
| 主要语言 | JavaScript、Markdown、Shell、YAML |
| GitHub created_at | 2026-05-27 |
| 首次提交 | 2026-05-27（`Initial release v1.0.0`） |
| 最近提交 | 2026-06-21（`docs(install): document Windows path (Git Bash / WSL) — v3.2.5`） |
| 最新 Git tag / GitHub Release | `v3.2.5`（2026-06-21） |
| 当前 manifest | `vc-manifest.json` 中声明 `3.2.5` |
| 历史提交数 | 89 |
| 贡献者数 | GitHub contributors API 仅见 1 位；本地 `git shortlog` 为同一作者的 2 个身份口径（`kynam` / `Ky-Nam Nguyen`） |
| Open issues / PRs | issues 18，open PR 1 |
| 分析日期 | 2026-07-07 |
| 分类 | AI Coding Workflow / Agent Harness / Installable Process Kit |

---

## 场景一：是否值得采用

### 解决的问题

vibecode-pro-max-kit 解决的不是“没有 AI 写代码工具可用”，而是**现有 AI coding 工具缺少项目级流程纪律、长期记忆和运行时护栏**：

- agent 容易跳过研究/澄清/计划，直接下手改代码；
- 大任务缺少统一的阶段合同，换会话后上下文丢失；
- 团队难以把“怎么让 agent 做事”固化成可复用的仓库资产；
- Claude Code / Codex 的 prompt、hooks、project memory 往往是零散手工配置，难升级、难审计、难迁移。

它面向的核心人群很清晰：

- 重度使用 Claude Code 或 Codex 的个人开发者；
- 想把 vibe coding 升级为 spec-driven delivery 的小团队；
- 需要让 agent 产出可审阅、可恢复、可迁移工件的项目；
- 想研究“workflow harness 产品化”而不是“再造模型 runtime”的工程团队。

### 核心能力与边界

**能做什么：**

- 用 `install.sh` + `vc-manifest.json` + `resolve-manifest.mjs` 把 kit 安装进目标项目。
- 提供 **15 个 agents / 33 个 skills / 10 个 hooks** 的完整工作流资产面。
- 把 RIPER-5 扩展为 **R → SPEC → I → P → V → E → UP** 的 7 阶段交付链。
- 用 `process/` 作为 durable project memory，保存 context、plans、features、protocols、seed templates。
- 在 Claude / Codex 会话生命周期上挂接 `session-init`、`scout-block`、`privacy-block`、`session-state`、`post-write-plan-check` 等 hook。
- 支持 fresh install 与 upgrade 两条主路；fresh 安装后路由到 `vc-setup`，已有 harness 则路由到 `vc-update`。
- 提供一组以 validator 为核心的软件质量门，而不是只靠 README 和 prompt 约束自己。

**不能做什么：**

- 它**不是自己的 agent runtime**：没有模型 provider、tool schema、会话循环、terminal/browser runtime；必须依附 Claude Code、Codex 或兼容宿主。
- 它**不是确定性代码索引系统**：`vc-setup` 的上下文生成仍依赖 agent 扫描与落盘，不是 GitNexus / CodeGraph 这类索引引擎。
- 它**不是零副作用配置层**：安装和更新会接管 `.claude/`、`.codex/`、`.agents/`、`CLAUDE.md`、`AGENTS.md` 等 agent tooling 面。
- 它**不是“多宿主同等成熟”**：当前版本就存在 Codex 路径的真实回归——`.codex/hooks.json` 引用缺失的 `.codex/hooks/run-node.sh`，上游 issue #20 已打开。

**与竞品差异：**

- 相比只有 rules / docs 的轻量方案，它更像**可安装的流程操作系统**；
- 相比带自有 runtime 的 agent 平台，它更轻、更易嵌进现有仓库，但控制力也受宿主限制；
- 相比手工维护 `.claude` / `AGENTS.md` / `process/`，它的价值在于 **manifest、upgrade path、validators、mirror assets、protocol contract** 是一起交付的。

### 集成成本

- **运行时前提：** Node.js >= 22、git、bash。README 现在明确 Windows 需走 Git Bash / WSL，而不是 PowerShell / `cmd.exe`。
- **接入成本：** 中等偏高。不是一条 prompt rule，而是一整套 phase、skills、hooks、`process/`、migration 规则。
- **对现有仓库的影响：** 会接管 agent tooling 面；但 `process/` 被视为用户工件，需要保留与迁移。
- **从零跑通 demo：** 很快。2026-07-07 实测在临时 git 仓库里 fresh install 成功，输出 15 agents / 33 skills / 10 hooks / 415 installed files，并正确提示下一步执行 `vc-setup`。
- **真正采用门槛：** 不在安装，而在“你是否愿意接受这套 phase-first、artifact-heavy 的交付纪律”。

### 依赖 / SDK 选型证据

> 全量直接依赖由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释最关键、最能体现 build-vs-buy 取舍的依赖与运行时选择。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| Node.js 22 built-ins（尤其 `fs.globSync`） | runtime | `resolve-manifest.mjs` / validator 脚本 / 安装器辅助 | 用零外部依赖做 manifest 解析、glob 展开、文件边界计算 | `resolve-manifest.mjs` 顶部直接声明 Requires Node >= 22；`install.sh` 42-56 行做 major version gate | 适合“要把 workflow 资产分发到用户仓库”且希望降低 npm 供应链依赖的项目 | 运行时兼容面被锁到 Node 22；README/installer/CI 一旦漂移就会直接伤安装成功率 |
| Bash + git | CLI / protocol | `install.sh` clone、备份、复制、快照写入 | 用最小 bootstrap 面实现 `curl ... | bash` 一键安装与升级前准备 | `install.sh` 11-18、58-76、149-176、390-472 行 | 适合需要极低接入门槛、面向开发者仓库分发的 kit | shell UX 脆弱；Windows 只能经 Git Bash / WSL；一键脚本天然需要更强审计意识 |
| vendored `ignore`（`vendor/ignore.cjs`） | parser / policy | `scout-block` 路径阻断与 `.vcignore` 解析 | 用 gitignore 风格模式限制 agent 扫描高噪音 / 高风险目录 | `.claude/hooks/scout-block/pattern-matcher.cjs` 9-115 行 | 适合给 agent 加 PreToolUse 级别的路径策略护栏 | 当前策略是 fail-open；解析失败时优先可用性，不是绝对安全边界 |
| `puppeteer` + `sharp` + `yargs` + `debug` | browser / CLI | `vc-agent-browser` skill 的脚本层 | 给 kit 增加浏览器自动化和截图等能力，而不污染 core installer | `.claude/skills/vc-agent-browser/scripts/package.json` | 适合把“少量重型能力”隔离到可选 skill，而非让整个 kit 引入大依赖树 | 这不是 core install 依赖；只有真正用该 skill 时才值得接受额外环境负担 |
| `jest`（skill-local dev dependency） | test | `vc-sequential-thinking` skill 脚本测试 | 给局部技能脚本提供独立测试面 | `.claude/skills/vc-sequential-thinking/package.json` | 适合 skill 级脚本各自维护最小测试栈 | 仓库没有统一的根测试工程；质量门主要仍靠 validators，而不是完整 JS monorepo test harness |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | 低 | MIT，商用友好。 |
| Bus factor | 高 | 公开贡献面目前基本仍是单作者主导。 |
| 供应商锁定 | 中 | 工件是文本和脚本，可迁移；但最佳体验明显绑在 Claude Code / Codex 的 hook surface。 |
| 安装副作用 | 中 | `3.2.3/3.2.4` 已修掉旧的数据丢失主风险，但它仍会接管 agent tooling 目录，不是轻量插件。 |
| Codex parity | 高 | v3.2.5 实测 fresh install 后 `.codex/hooks.json` 仍引用缺失的 `run-node.sh`，这是实际可复现回归。 |
| CI / release 健康 | 中高 | `validate.yml` / `release.yml` 设计完整，但近期多个 `Release Kit` workflow 都是 failure。 |
| 文档承诺风险 | 中 | README 很强，但“Works everywhere” 这类营销口径目前跑在实际宿主回归前面。 |
| 安全边界 | 中 | `privacy` / `scout` hooks 是加分项，但 hook 本身也是执行面；而且多处策略是 fail-open。 |
| 维护趋势 | 活跃但很早期 | 5 月末起量，6 月快速迭代到 3.2.5；节奏快，但稳定性和 release discipline 还没沉淀。 |

### 结论

**有条件采用（Claude Code 主路径） / Codex 标准化部署暂观望。**

理由很直接：

1. **旧的阻塞性结论已经失效。** 6 月那版最严重的几条负面（Node gate 漏检、context validator 在 bare kit 中误失败、upgrade 可能删除 legacy content）在 `3.2.3` / `3.2.4` / `3.2.5` 这轮里已被显式修正，当前 fresh install 在 Node `v22.22.3` 上可完整成功。
2. **核心架构值得学，也足够成体系。** 它不是零散 prompt 包，而是 install、manifest、migration、hooks、validators、process memory 一起工作的 workflow substrate。
3. **但“多宿主可用”这件事现在还没闭环。** 我实测安装产物中 `.codex/hooks.json` 全面引用 `run-node.sh`，而该文件并未随 kit 发出；这不是 README 级小瑕疵，而是会让 Codex hooks 直接报 127 的真实回归。

因此正确姿势是：

- **如果你是 Claude Code 主用户**：可以认真评估采用，尤其适合想把 agent 工程纪律沉淀到仓库里的团队；
- **如果你要把它当 Claude + Codex 的统一标准件**：先等上游修掉 issue #20，或者自己补丁化 `run-node.sh` 再部署；
- **如果你只是想学架构**：这项目当前非常值得精读，学习价值高于直接无脑全量安装。

---

## 场景二：技术架构学习

### 核心架构图

```text
vibecode-pro-max-kit
│
├─ Source-of-truth workflow assets
│  ├─ .claude/agents/*.md              # 15 Claude agents（phase + specialist）
│  ├─ .claude/skills/*/SKILL.md        # 33 workflow skills
│  ├─ .claude/hooks/*.{cjs,mjs}        # 10 hook entrypoints + shared libs
│  ├─ .codex/agents/*                  # Codex mirror agents
│  ├─ .codex/hooks.json + hook mirrors # Codex mirror hook surface
│  ├─ CLAUDE.md / AGENTS.md            # host-facing routing / contract docs
│  └─ process/development-protocols + process/_seeds
│
├─ Distribution & migration plane
│  ├─ vc-manifest.json                 # include/exclude/kitOnly/merge/symlink/legacyDeletions
│  ├─ resolve-manifest.mjs             # Node 22 manifest resolver
│  ├─ install.sh                       # deterministic bootstrap / backup / stale cleanup
│  ├─ CHANGELOG.md / MIGRATION.md      # versioned upgrade contract
│  └─ .github/workflows/{validate,release}.yml
│
├─ Runtime plane inside target repo
│  ├─ SessionStart hook → project detection / env / status bootstrap
│  ├─ PreToolUse hooks → privacy block / scout block / naming checks
│  ├─ PostToolUse hooks → session-state / plan validation / reminders
│  ├─ Stop/Subagent hooks → validator sweep / state flush
│  └─ agents + skills drive R→SPEC→I→P→V→E→UP execution
│
└─ Durable project memory
   ├─ process/context/*
   ├─ process/general-plans/{active,completed,backlog,...}
   ├─ process/features/*
   └─ process/_seeds/*
```

### 底层技术架构

#### 最小架构内核

`Manifested Workflow Assets + Deterministic Installer + Hook Guardrails + Phase Contracts + Durable Process Artifacts`

去掉 README 营销、i18n、图片和宿主品牌之后，真正不可替代的内核就是这五块：

1. **manifest 定义“什么是 kit 资产”；**
2. **installer 负责把资产安全复制/升级到用户仓库；**
3. **hooks 负责运行时护栏；**
4. **agents/skills/protocols 负责 phase contract；**
5. **`process/` 负责跨会话、跨成员、跨升级保存项目状态。**

#### 核心抽象

| 抽象 | 源码位置 | 职责 | 关键字段 / 方法 | 为什么重要 |
|------|----------|------|-----------------|------------|
| Manifest | `vc-manifest.json` | 声明哪些文件被分发、哪些只属于 kit、自定义 merge / symlink / legacy cleanup 规则 | `include`、`exclude`、`kitOnly`、`merge`、`symlinks`、`legacyDeletions` | 这是整个“workflow as installable asset”模式的边界根。 |
| Resolver | `resolve-manifest.mjs` | 把 manifest 模式解析成精确文件列表与 owned path 集合 | `resolveGlobPatterns()`、`matchesExclude()`、`matchesPatternList()` | 让安装器不再依赖手写 copy list，升级时能做差异化治理。 |
| Installer | `install.sh` | preflight、备份、复制、stale cleanup、symlink fallback、route 到 setup/update | Node 22 gate、snapshot diff、`legacyDeletions` defer、summary counters | 决定 kit 是否“真能被安全采用”，不是附属脚本，而是产品入口。 |
| Phase Agent | `.claude/agents/*.md` | 定义某阶段 / 某职能角色该做什么、不该做什么 | phase prompts、allowed/forbidden 活动、completion contract | 把“先想后做”从口号变成可分发执行合同。 |
| Skill | `.claude/skills/*` | 封装 setup / context / update / audit / security / browser 等工作流能力 | `SKILL.md`、`scripts/`、`references/` | 让工作流能力模块化，而不是都塞进主 agent prompt。 |
| Hook Guardrail | `.claude/hooks/*` / `.codex/hooks.json` | 宿主生命周期上的策略控制层 | SessionStart / PreToolUse / PostToolUse / Stop | 把隐私、路径限制、状态持久化从“提示词约定”升级到“执行前后动作”。 |
| Durable Process Artifact | `process/` | 保存项目事实、计划、feature 状态与升级后的长期知识 | `context/`、`general-plans/`、`features/`、`_seeds/` | 这是它区别于普通 prompt/rules 包的真正产品面。 |

#### 控制面 / 数据面

- **控制面：** `CLAUDE.md`、`AGENTS.md`、`.claude/agents/*`、`.claude/skills/*`、`.claude/settings.json`、`.codex/hooks.json`、`vc-manifest.json`、`install.sh`、workflows。它们决定如何做事、何时拦截、如何升级、如何验证。
- **数据面：** `process/context/*`、`process/general-plans/*`、`process/features/*`、会话状态文件、`.vc-installed-files`、`.vc-version`、目标项目真实源码与命令执行结果。它们承载 agent 工作后留下的真实项目状态。

这个项目最值得学的一点就是：**它把“AI coding 的方法论”拆成控制面，把“项目事实与执行结果”拆成数据面。** 这样升级 kit 时，理论上不该毁坏用户项目状态。

#### 关键执行链路

**1. Fresh install 链路**

```text
用户运行 install.sh
  ↓
Node 22 preflight + git/bash preflight
  ↓
clone / copy kit 到临时目录
  ↓
resolve-manifest.mjs 解析 include/exclude/kitOnly/symlinks
  ↓
备份已有 harness → 复制 managed files → 写 snapshot/version
  ↓
设置 symlink（失败则 fallback copy）
  ↓
打印 summary + 路由到 “Run vc-setup”
```

**2. Upgrade 链路**

```text
已有 harness 的项目重新运行 install.sh
  ↓
install.sh 只做确定性文件同步 / 旧路径 defer
  ↓
打印 “Run vc-update”
  ↓
vc-update 再做 agent-assisted 迁移（legacy layout / plan migration）
```

**3. 日常任务链路**

```text
宿主启动会话
  ↓
session-init hook 识别 repo / branch / project type / active plan
  ↓
agent 根据 CLAUDE.md / AGENTS.md 路由到 phase + skills
  ↓
PreToolUse hooks 执行 privacy / scout / naming guardrails
  ↓
agent 读写 process artifacts，推进 SPEC / PLAN / EXECUTE / UPDATE
  ↓
PostToolUse / Stop hooks 更新 state、扫 validator、输出提醒
```

#### 状态模型

| 状态类型 | 位置 | 谁读写 | 生命周期 / 一致性规则 |
|----------|------|--------|------------------------|
| 分发边界状态 | `vc-manifest.json` | kit 仓库维护者 | 每个 release 需和实际 shipped files 保持一致，否则 install/upgrade 语义失真。 |
| 安装快照状态 | `.vc-installed-files`、`.vc-version` | `install.sh` / `vc-update` | 记录当前项目已安装哪些 kit 资产，用于 stale removal 与版本判断。 |
| Durable project state | `process/context/*`、`process/general-plans/*`、`process/features/*` | agent / skills / 用户 | 属于用户项目长期工件，升级时必须保留或迁移，不能被 kit 粗暴覆盖。 |
| Session runtime state | hook env、session-state 缓存 | `session-init`、`session-state` 等 hooks | 属于短期会话面，用于恢复、状态栏、当前计划路由。 |
| 外部状态 | git 分支、宿主 hook 系统、GitHub release/workflow 状态 | git / Claude / Codex / GitHub Actions | 控制 kit 能否正确进入宿主、能否完成发布与验证。 |

#### 契约边界

- **内部契约：** `.claude` 资产是主真源，`.codex` 是镜像/适配层；manifest 负责定义哪些目录属于 kit 资产。
- **外部 CLI / 安装契约：** 用户只需跑 `install.sh`；fresh 安装必须打印 `vc-setup`，upgrade 必须打印 `vc-update`。
- **Agent-facing 契约：** `CLAUDE.md` / `AGENTS.md` 定义 phase routing，skills 定义 SOP，hooks 定义执行前后护栏。
- **项目数据契约：** `process/` 属于用户项目长期状态，不该被 deterministic installer 直接抹掉。
- **宿主契约：** Claude hook wiring 与 Codex hook wiring 必须都可执行；当前 Codex 的 `run-node.sh` 缺失说明这层契约还未闭环。

#### 失败与降级模型

| 失败类型 | 检测方式 | 系统行为 | 降级 / 修复动作 |
|----------|----------|----------|------------------|
| Node 版本过低 | `install.sh` 50-56 行 major gate | 直接退出，拒绝安装 | 升级到 Node 22+；这是对旧 partial install 风险的正确修复。 |
| manifest 解析失败 | `resolve-manifest.mjs` exit 非 0 / JSON 为空 | `install.sh` 输出错误并退出 | 检查 Node 版本、manifest 文件、kit clone 完整性。 |
| 声明文件缺失 | `missingDeclared` 非空 | 安装器 warning | 提示 clone 可能不完整；需要重新拉取 kit。 |
| symlink 失败（Windows/权限） | `ln -sf` 失败 | fallback copy | 安装可继续，但 Codex 侧不会自动反映后续更新。 |
| bare-kit 缺少 `all-context.md` | validator 自检 | 直接 skip，exit 0 | 这修复了旧版“在 kit 仓库里误判失败”的问题。 |
| hook JSON 解析/内部异常 | `scout-block.cjs` / 多数 hooks | fail-open | 优先保证宿主继续工作，但安全强度下降。 |
| Codex hook wrapper 缺失 | 安装后执行 `.codex/hooks.json` 命令 | hook 直接报 127 | 这是当前真实 regression；需上游补发 `run-node.sh` 或改 wiring。 |
| release workflow 失败 | GitHub Actions | release automation 不可信 | 不影响本地安装，但会削弱“发版就是可用包”的信任。 |

#### 可复刻设计不变量

1. **把 workflow 当软件资产，而不是长 prompt。**
2. **控制面与用户项目数据面必须硬分离。**
3. **deterministic install 与 agent-assisted migration 要分两段做。**
4. **长期状态必须落盘到项目内，而不是寄希望于会话记忆。**
5. **运行时护栏至少要覆盖路径、敏感文件、状态持久化。**
6. **多宿主适配如果不是自动验证，就迟早漂移。**

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 做 installable kit，不做 agent runtime | agents + skills + hooks + process 工件 | 自己掌控模型/工具/runtime 的能力 | 复用 Claude / Codex 的现成能力，极大降低产品表面积。 |
| manifest 驱动分发边界 | `vc-manifest.json` + resolver | 手写 copy list 的简单性 | 只有 manifest 化，升级/差异清理/kitOnly 才能长期维护。 |
| deterministic install + agent-assisted update 分离 | `install.sh` 负责复制，`vc-update` 负责迁移 | “一个脚本做完全部”的表面简洁 | legacy 内容迁移依赖更高语义，纯 shell 不该乱删用户工件。 |
| `.claude` 为主真源，`.codex` 做镜像 | 单源资产面 | 每个宿主都做深度原生实现 | 降低维护面，但也带来了当前 Codex 漂移回归。 |
| 核心安装器零 npm 依赖 | 只用 Node built-ins + shell | 可直接用现成生态库的便利 | 供应链风险更低，可审计性更高。 |
| hook 设计偏 fail-open | 可用性优先 | 安全/策略绝对执行 | 避免宿主被小脚本错误卡死，但牺牲一部分 enforcement 强度。 |
| `process/` 作为 durable memory | 文件化计划/上下文/特性状态 | 纯会话记忆与即席对话 | 支撑长任务、跨会话恢复、团队共享与升级迁移。 |

### 值得学习的模式

1. **Manifest + owned-paths + snapshot diff**：把“安装到用户项目”这件事从脚本堆里抽象成可验证边界。
2. **Fresh route / upgrade route 分叉**：安装器只负责判断“你下一步该走 `vc-setup` 还是 `vc-update`”。
3. **bare-kit validator mode**：源码仓库与安装后项目的 validator 语义要分开，不然质量门永远吵闹。
4. **policy hook + project override**：默认基线放在 shipped `.vcignore`，用户可在项目根局部覆写。
5. **技能目录生成 catalog**：用 frontmatter + generated catalog 替代手工维护的大表，减少文档漂移。
6. **把 process 目录当 first-class product surface**：这比单纯“加点 prompt rules”更有复用价值。

### 反模式 / 踩坑点

1. **镜像层缺少 release-grade 自动验证。** 当前 Codex `run-node.sh` 缺失正是镜像资产漂移的典型后果。
2. **营销口径跑在 parity 之前。** README 的“Works everywhere” 在现阶段仍偏超前。
3. **workflow 很强，但心智负担也高。** 不是每个仓库都需要这么重的 phase / artifact discipline。
4. **release automation 还没稳。** 连续 tag release failure 会直接伤用户信任。
5. **早期项目的“单作者强主导”风险仍高。** 这类 kit 一旦作者方向变化，整个协议面都可能快速变。

### 可借鉴的具体技术点

- `install.sh` 的 **summary counter + next-step routing**。
- `resolve-manifest.mjs` 针对 **dotfile glob** 的补偿逻辑。
- `legacyDeletions` 的 **内容目录 defer 机制**。
- `session-init` 的 **cheap startup metadata + deferred enrichment** 思路。
- `scout-block` 的 **`.vcignore` + vendored parser + fail-open hook** 模式。
- `validate-all-context.mjs` 的 **bare-kit skip** 设计。

---

## 架构解剖

### 目录结构

```text
vibecode-pro-max-kit/
├── .claude/
│   ├── agents/                  # 15 个 Claude agents
│   ├── hooks/                   # 10 个 hook entrypoint + lib/
│   ├── skills/                  # 33 个技能目录 + 局部脚本依赖
│   └── settings.json            # Claude hook wiring
├── .codex/
│   ├── agents/                  # Codex 镜像 agents
│   ├── hooks/                   # Codex 镜像 hooks
│   └── hooks.json               # Codex hook wiring（当前有 run-node.sh 回归）
├── process/
│   ├── development-protocols/   # 协议文档
│   ├── _seeds/                  # seed templates
│   ├── context/                 # generated skills catalog 等
│   ├── features/                # 安装后项目使用
│   └── general-plans/           # 安装后项目使用
├── vc-manifest.json             # 分发边界与迁移规则
├── resolve-manifest.mjs         # manifest resolver
├── install.sh                   # 安装器
├── CHANGELOG.md / MIGRATION.md  # 版本与迁移文档
├── docs/i18n/                   # 多语言 README
└── .github/workflows/           # validate / release
```

### 技术栈

- **运行时 / 框架：** Node.js 22、Bash、Markdown/YAML 驱动的 agent assets。
- **构建 / 打包：** 无传统 build system；manifest resolver 直接决定分发资产。
- **测试：** 以 validator 脚本为主，少量 skill-local 脚本测试（如 Jest / Puppeteer 附属环境）。
- **CI/CD：** GitHub Actions，PR `validate.yml`，tag `release.yml`。

### 模块依赖关系

```text
vc-manifest.json
  ↓
resolve-manifest.mjs
  ↓
install.sh
  ↓
installed project (.claude / .codex / process)
  ↓
CLAUDE.md / AGENTS.md route work to agents + skills
  ↓
hooks enforce runtime guardrails
  ↓
process/* stores durable project artifacts
```

更细一点看，是三条并行链：

1. **分发链：** `vc-manifest.json → resolve-manifest.mjs → install.sh`
2. **行为链：** `CLAUDE.md/AGENTS.md → agents → skills → protocols`
3. **运行时护栏链：** `settings.json/hooks.json → hook entrypoints → lib/* → project state`

### 扩展机制

- 新增 / 修改 agent：放进 `.claude/agents/`，再同步到 `.codex/agents/`。
- 新增 / 修改 skill：目录级资产，带 `SKILL.md`、`scripts/`、`references/`。
- 新增 hook：在 `.claude/hooks/` / `.codex/hooks/` 与 wiring 文件同步。
- 调整路径策略：修改 shipped `.vcignore`，或在项目根添加本地 `.claude/.vcignore` override。
- 调整分发边界：改 `vc-manifest.json`，再由 resolver 与 publish/validate 流程兜底。

---

## 质量与成熟度

### 代码质量

优点：

- core install / resolve 面保持零 npm 依赖，可审计性强；
- hook 逻辑开始抽成 `lib/` 复用，结构上不是纯脚本拼贴；
- install、migration、validator、protocol 之间有明确边界；
- 对“workflow 资产也要有质量门”这件事是认真做了工程化的。

问题：

- 没有统一的根测试工程；JS 资产质量主要靠 validator，而非完整单测/集成测试体系；
- `.claude` 与 `.codex` 镜像层仍会发生真实回归，说明 parity discipline 还不够硬；
- 这是一个高度协议化项目，文档与代码必须强同步，一旦 release 环节松动就会直接伤 adoption。

### 测试

- 磁盘上可见 **37 个 `validate-*` 脚本**，外加若干生成/审计脚本。
- `validate.yml` / `release.yml` 当前都会跑一套核心 validator 子集，而不是只做 lint。
- 2026-07-07 我对关键 validator 做了真实执行，结果：
  - `validate-agent-parity`：通过（15 vs 15，对齐但有若干 warning）；
  - `validate-skills`：通过（33 skills）；
  - `validate-guide-sync`：通过，仅有 README 中 `vc-` / `my-` / `team-` / `proj-` 文案级 warning；
  - `validate-protocol-wiring`、`validate-seeds`、`validate-skill-routing`、`validate-skill-cross-refs`、`validate-plan-inventory`、`validate-kit-portability`：全部 exit 0；
  - `validate-context-discovery` 与 `validate-all-context`：在 bare-kit mode 下正确 skip，而不再误失败。
- 额外做了 **fresh install 实测**：临时 git 仓库、Node `v22.22.3`、本地 kit 源，安装 exit 0，得到 15 agents / 33 skills / 10 hooks / 415 installed files。

### CI/CD

- `validate.yml`：PR 触发，Node 22，执行 agent/skill/protocol/context/plan/portability 等验证。
- `release.yml`：tag `v*` 触发，先跑同类验证，再用 `gh release create` 发版。
- 当前成熟度问题不在“有没有 CI”，而在**CI 是否真的托住了 release 质量**：GitHub API 显示近几次 `Release Kit` run 都是 failure。

### 文档质量

优点：

- README 极强，卖点、安装、phase 设计、上下文、对比、FAQ 都写得清楚；
- `CHANGELOG.md` 在 3.2.x 这波修复里很有价值，能直接看到设计修复轨迹；
- 多语言 i18n 扩大了传播面。

问题：

- 文档和真实宿主 parity 仍有偏差：Codex hook regression 已进入 release，但 README 的“works everywhere” 口径仍偏乐观；
- i18n 会放大同步成本；对这种高速迭代 kit 来说，越多镜像面越容易漂移。

### Issue / PR 健康度

- open issues 18、open PR 1，整体规模还小。
- 很多 issue 是 roadmap / docs / good-first，说明维护者在主动搭贡献入口。
- 当前最关键的真实 bug 是 **issue #20：v3.2.5 安装后 Codex hooks 引用缺失的 `run-node.sh`**。
- 这意味着项目已经开始从“快速堆功能”进入“必须处理真实发行质量回归”的阶段。

---

## 社区与生态

### 社区评价

- 从 star/fork 看，项目传播力很强，定位也抓得准：AI coding 缺工程纪律，这件事确实打中痛点。
- 但从 issue / PR 和贡献者结构看，它仍是**早期强主导项目**，而不是已经有广泛维护共识的成熟生态。
- 换句话说：**热度是真实的，稳定性还在追赶热度。**

### 衍生项目 / 插件生态

- 目前从仓库可见面看，二级生态仍以 fork、翻译、说明类 issue/PR 为主。
- 还没有观察到像成熟插件平台那样清晰的“围绕它形成的下游工具链层”。
- 这不妨碍它值得学，但会影响企业团队把它当基础设施标准件的意愿。

### 竞品对比

| 项目 / 方案 | 定位 | 相比 vibecode-pro-max-kit |
|------------|------|---------------------------|
| 手工维护 `.claude` / `AGENTS.md` / rules | 最轻方案 | 心智成本低，但没有 install / upgrade / validator / process memory 全套机制 |
| superpowers 一类 methodology / skill 层 | 行为约束与技能复用 | 更轻、更易加到现有流程；但不提供这么重的仓库内生命周期资产 |
| ECC / 更大一体化 harness | 更完整的 control plane / safety / infra | 控制力更强，但产品面更重；vibecode 更聚焦“可复制入仓库”的资产包 |
| 自有 runtime 型 agent 平台 | 端到端 agent 系统 | 能力更强，但 adoption 面更重；vibecode 的优势是能借现有宿主快速落地 |

---

## 关键代码走读

### 1. `install.sh`

- 路径：`install.sh`
- 作用：产品入口。负责 Node 22 gate、kit 拉取、manifest 解析、备份、复制、stale cleanup、symlink fallback、summary 与 fresh/update 路由。
- 关键信号：
  - 42-56 行把 Node >= 22 从“文档要求”升级为“真实 preflight”；
  - 224-289、337-384 行体现 snapshot diff 和 legacyDeletions 的保守删除语义；
  - 452-470 行把 install 从“完成复制”延伸到“告诉用户下一步该跑什么”。

### 2. `resolve-manifest.mjs`

- 路径：`resolve-manifest.mjs`
- 作用：把 manifest 的 include/exclude/kitOnly/merge/symlink 规则解析成确定文件集。
- 关键价值：
  - 用 Node built-ins 做零依赖解析；
  - 对 dotfile glob 做了兼容补偿，而不是完全交给 `globSync` 黑盒；
  - 把“workflow 资产边界”变成可验证、可 diff、可发布的机器输出。

### 3. `vc-manifest.json`

- 路径：`vc-manifest.json`
- 作用：定义 kit 对用户仓库的所有权边界。
- 当前关键字段：
  - `include` 覆盖 `.claude/`、`.codex/`、`CLAUDE.md`、`AGENTS.md`、部分 `process/`；
  - `exclude` 排除 `process/features/**`、`process/general-plans/**`、测试与运行噪音；
  - `kitOnly` 明确 README/docs/install 等只属于 kit，不应装到用户项目里；
  - `legacyDeletions` 记录升级时可清理的旧路径清单。

### 4. `session-init.cjs`

- 路径：`.claude/hooks/session-init.cjs`
- 作用：会话启动时加载配置、探测项目类型/包管理器/框架、解析当前计划、预热状态栏快照并向环境变量写入上下文。
- 为什么重要：
  - 这是 kit 把“仓库知道自己是什么项目”这件事自动化的入口；
  - 也说明它不是纯静态文档包，而是真会在宿主启动时跑逻辑。

### 5. `scout-block.cjs` + `pattern-matcher.cjs`

- 路径：`.claude/hooks/scout-block.cjs`、`.claude/hooks/scout-block/pattern-matcher.cjs`
- 作用：阻断 agent 进入 `node_modules`、`dist`、`.git`、`coverage` 等高噪音目录，并支持 `.vcignore` 规则与 negation allowlist。
- 设计要点：
  - 用 vendored `ignore` 做 gitignore 语义匹配；
  - 输入解析异常时 fail-open；
  - 既能阻断明确路径，也能阻断过宽的搜索模式。

### 6. `.codex/hooks.json`

- 路径：`.codex/hooks.json`
- 作用：Codex 侧 hook wiring。
- 当前关键发现：
  - 所有 command 基本都通过 `sh "$ROOT/.codex/hooks/run-node.sh" ...` 调起；
  - 但 fresh install 后该 `run-node.sh` 文件并不存在；
  - 这使它成为当前版本最重要的现实风险锚点——不是“文案失配”，而是“镜像宿主执行面断裂”。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 5 | 从 install、upgrade、agents、skills、hooks、process memory 到 validators 是一整套闭环，不是散件 |
| 代码质量 | 4 | core installer / resolver / hooks 有明确分层与边界；但 mirror regression 说明 release discipline 仍需加强 |
| 文档质量 | 4 | README、CHANGELOG、MIGRATION 都强；但宿主 parity 仍有口径跑偏 |
| 社区活跃度 | 4 | star/fork 增长快、issue 入口清晰；但贡献与维护仍高度集中 |
| 架构设计 | 4 | “workflow as installable asset” 设计很强；多宿主镜像层还不够稳 |
| 学习价值 | 5 | 对 agent workflow harness、manifest installer、hook guardrail、durable process memory 都很有学习价值 |
| 可借鉴度 | 4 | 模式非常可迁移；但整套 discipline 偏重，不是所有项目都适合原样照搬 |

---

## 总结

### 一句话评价

**它已经不再是“有想法但安装器不稳”的早期样子，而是一个可以认真研究、在 Claude 路径上有条件采用，但在 Codex 路径上还差一次关键回归修复的 workflow substrate。**

### 谁应该用

- 以 Claude Code 为主，希望把 AI coding 变成 phase-first、artifact-backed 交付流程的团队。
- 想把 setup / context / plan / validate / update 这套 agent 工作流沉淀成仓库资产的人。
- 想研究如何把 methodology、hooks、migration、validators 打包成“可安装产品”的工程师。

### 谁不应该直接用

- 只想要几条 rules、几份 prompt、不想引入整套 `process/` discipline 的轻量用户。
- 需要 **Claude + Codex 都零补丁即稳定可用** 的团队。
- 对 release 健康、跨宿主 parity、维护去中心化要求很高的保守组织。

### 下一步

1. 如果目标是**采用**：优先在非关键仓库做一次真实 fresh install + `vc-setup` 演练；Claude 路径可以继续，Codex 路径先验证/修补 `run-node.sh`。
2. 如果目标是**学架构**：先精读 `install.sh`、`resolve-manifest.mjs`、`vc-manifest.json`、`session-init.cjs`、`scout-block.cjs`。
3. 如果目标是**贡献上游**：最佳首批 PR 就是修复 Codex `run-node.sh` 缺失，并给 `.codex` 镜像层加真正的 release-grade 验证。