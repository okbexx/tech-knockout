# ECC

> 一句话定位：**ECC 是一套跨 Claude Code、Codex、OpenCode、Cursor、Gemini、Qwen、Zed 等 AI coding harness 的“工作流操作系统 / 性能优化层”：把 agents、skills、rules、commands、hooks、MCP 配置、选择性安装 manifests、continuous learning 和 ECC2 控制面放到一个可安装、可测试、可演进的公开仓库里。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `affaan-m/ECC` |
| URL | `https://github.com/affaan-m/ECC` |
| Star | 227,216（2026-07-08 GitHub API 快照） |
| Fork | 34,738（2026-07-08 GitHub API 快照） |
| 许可证 | MIT |
| 语言 | JavaScript / Markdown 为主，另有 Rust、Python、Shell、TypeScript、YAML 等 |
| 首次提交 | 2026-01-17（本地 git log）；GitHub created_at 为 2026-01-18 |
| 最近提交 | 2026-07-04 `4130457d674d2180c5af2c5f634f3cae4cbc6c4f fix(tests): use mkdtempSync for test scratch dirs (CodeQL js/insecure-temporary-file) (#2443)` |
| 最新 Release / Tag | GitHub latest release 为 `v2.0.0`（2026-06-10）；tags API 最新也是 `v2.0.0` |
| npm | `ecc-universal` latest 为 `2.0.0`，近 7 日下载约 3,702；`ecc-agentshield` latest 为 `1.4.0`，近 7 日下载约 3,963 |
| 贡献者数 | GitHub contributors API 首屏 100；核心提交仍高度集中：`affaan-m` 1484，第二名 `pangerlkr` 47 |
| 分析日期 | 2026-07-08 |
| 分类 | AI Coding Workflow / Agent Harness System |

> 观测口径：GitHub `open_issues_count=76` 仍包含 PR；按 `/issues` 返回项是否含 `pull_request` 字段拆分后，当前为 **22 open issues / 54 open PRs**。主包版本面已明显收敛：repo package、GitHub latest release、最新 tag 与 npm latest（`ecc-universal`）都对齐到 `2.0.0`。

---

## 场景一：是否值得采用

### 解决的问题

单个 coding agent/harness（Claude Code、Codex、Cursor、OpenCode 等）通常只提供执行容器：对话、工具、文件编辑、命令运行。真正决定长期效率的是另一层：

- agent 应该如何做需求澄清、TDD、审查、发布、复盘；
- 多平台的 rules / skills / hooks / MCP 配置如何保持一致；
- 如何把一次次任务中形成的方法论沉淀成可复用资产；
- 如何降低 agent 盲目执行命令、修改配置、泄漏密钥、循环空转的风险；
- 如何从“我有一个 agent”变成“我有一套可运营的 agent 工作系统”。

ECC 的核心判断是：**harness 是执行面，workflow assets 才是可迁移资产**。所以它不直接替代 Claude Code / Codex / Cursor，而是在这些宿主之上提供一套跨平台的工作流底座。

目标用户：

- 高频使用 Claude Code / Codex / Cursor / OpenCode 的个人开发者；
- 想把 AI coding 工作流标准化的小团队；
- 想研究“agent harness 可迁移层”的开发者；
- 需要 agents、skills、rules、hooks、MCP、安装与审计体系整合的人。

### 核心能力与边界

**能做什么：**

- 提供大型 agent 工作流资产库：67 agents、448 skills、93 commands、122 rule files（按当前仓库文件计数）。
- 支持多 harness：Claude / Claude project、Cursor、Antigravity、Codex、Gemini、OpenCode、CodeBuddy、JoyCode、Qwen、Zed，并已把 `.hermes`、`.openclaw`、`.kimi` 等 surface 纳入主包发布文件。
- 用 manifest-driven selective install 解决“不要全量复制整个仓库”的问题：`minimal`、`core`、`developer`、`security`、`research`、`full` 等 profile。
- 提供可测试的 Node 安装器：`ecc install`、`ecc plan`、`ecc catalog`、`ecc doctor`、`ecc repair`、`ecc auto-update`、`ecc uninstall`。
- 提供 hook runtime：Pre/Post Bash、质量门、配置保护、成本记录、PR/构建完成提示、continuous-learning 观察等。
- 提供 security / supply-chain hardening：workflow security validator、npm audit signatures、IOC scanner、no personal paths check、hook schema validation。
- 提供 ECC2 Rust alpha：本地 session store、dashboard、daemon、worktree/session orchestration、observability、risk scoring 等控制面雏形。
- 明确公开边界：Hermes 是 operator shell，ECC 只发布可复用模式，不发布私有 `~/.hermes`、token、个人 workspace memory。

**不能做什么：**

- 不是独立 coding agent：没有自己的 LLM 推理层、工具 loop、provider routing，必须依附宿主 harness。
- 不能保证各 harness hook parity 完全一致：Claude/OpenCode/Cursor 可更接近 hook-backed，Codex/Gemini 等更多是 instruction/config-backed。
- 不能低成本全量启用。`full` profile 资产面很大，容易增加上下文、配置和维护负担。
- ECC2 不是 GA：仓库 README 和 `ecc2/README.md` 均明确它是 alpha，适合本地实验，不应当作为完整生产控制面宣传。
- 不包含私有 operator 业务链路、凭证和真实 Hermes 工作区；公开 repo 只是可复用 substrate。

**与竞品差异：**

- vs **superpowers**：superpowers 是更轻的“纪律注入型 skill 框架”；ECC 是更完整的 cross-harness 资产 + 安装 + hooks + control-plane 体系，覆盖更广但更重。
- vs **compound-engineering-plugin**：compound 更强调多 agent 审查与复利工程闭环；ECC 更强调 harness portability、安装治理、runtime hooks、安全审计和 operator surface。
- vs **CLI-Anything**：CLI-Anything 让软件变成 agent-native CLI；ECC 让 agent harness 本身变成可运营工作系统。二者是相邻层，不是直接替代。
- vs “自己维护 `.claude` / `.codex` 配置”：ECC 的优势是资产组织、profile、测试和安全门；代价是学习和理解成本。

### 集成成本

- **依赖链：**
  - 常规使用：Node >=18，仓库仍带 `package-lock.json`；CI/README 继续覆盖 npm/yarn/pnpm/bun 多 package-manager 路径。
  - npm 包 `ecc-universal`：本轮在安装 dev dependencies 后重新跑 `npm pack --dry-run --json`，当前 `unpackedSize` 约 14.25 MB，`entryCount` 2362。
  - ECC2：Rust/Cargo，依赖更重；当前仍应视作 alpha 控制面，不应与主 Node 安装层混为一谈。

- **部署复杂度：**
  - 试用 `minimal` / `developer` profile：中低。
  - 自定义 target + profile + component：中。
  - 全量启用 hooks、continuous learning、ECC2 daemon/control pane：中高，需要理解副作用边界。

- **实测 install plan：**
  - `node scripts/ecc.js plan --profile developer --target claude --json`
  - 结果：9 个 selected modules，99 个 planned file operations。
  - 说明：它不是“复制一个 prompt 文件”，而是 rules、agents、commands、hooks、platform configs、skills 等多层组合安装。

- **学习曲线：**
  - 只用 profile：可在 30 分钟内上手。
  - 理解全部系统：需要读 manifests、hooks、skills、ECC2 docs，成本明显高于 superpowers。

- **从零到 demo：**
  - 作为 Claude/Cursor/Codex 工作流包：当天可试。
  - 作为团队标准化底座：建议先选 `minimal` / `developer` profile 小范围试 1-2 周，再决定 hooks 和 continuous learning 是否打开。
  - ECC2 控制面：只适合 alpha 评估，不建议直接纳入关键生产链路。


### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键库 / SDK。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| `@iarna/toml` | TOML parser | 多 harness / profile / config 文件读写 | 让 workflow substrate 不被单一 JSON/YAML 配置面锁死 | `package.json` dependencies | 适合任何要跨工具链读写配置的 harness workflow repo | 配置 merge 语义仍需 target adapter 明确约束 |
| `ajv` | JSON Schema validator | manifests / hooks / workflow assets 校验 | 把安装面和资产面变成可验证数据，而不是纯文本约定 | `package.json` dependencies | 非常适合 profile/component/install-plan 这种数据驱动系统 | schema 演进若无迁移策略，容易制造隐性 breakage |
| `sql.js` | Embedded SQLite-in-WASM/JS | Node 侧状态、会话或控制面辅助能力 | 给纯 JS CLI 提供轻量本地结构化状态能力，而不是强依赖外部 DB | `package.json` dependencies | 适合 workflow substrate 引入轻状态层 | 不应与 ECC2 真正的 Rust/SQLite control plane 能力混为一谈 |
| `typescript` | Dev/build toolchain | `.opencode/dist` 预构建 | 让主 npm 包在发布前就能生成 OpenCode 适配产物 | `prepack -> build:opencode`, `devDependencies.typescript` | 说明多 harness 兼容层已进入真实构建流程，而不是只放静态模板 | clean clone 若未装 dev deps，`npm pack` 会失败；发布面依赖完整 bootstrap |
| `c8` + validators (`validate-*`) | Coverage/quality gate | agent/rules/skills/hooks/install-manifest/no-personal-paths 验证 | 把 workflow assets 当工程资产治理，而不是“提示词堆” | `scripts.test`, `scripts.coverage` | 这是 ECC 最值得学的工程纪律之一 | validator 越多，外部贡献门槛越高，需要良好错误信息 |
| `@opencode-ai/plugin` | Harness integration dev surface | OpenCode 适配与预构建 | 说明 ECC 不只发 instruction 文件，而是开始进入特定 harness 的实际插件/构建面 | `devDependencies` + `build:opencode` | 对“cross-harness，但不是最低公分母”很有参考价值 | 会放大版本兼容与打包链路复杂度 |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | 低 | 根仓库 MIT，npm package 也声明 MIT。 |
| Bus factor | ⚠️ 高 | 贡献者很多，但提交高度集中：`affaan-m` 1484，第二名 `pangerlkr` 47。方向和质量仍主要依赖核心维护者。 |
| 供应商锁定 | 中 | 文本资产可迁移，但实际 enforcement 依赖宿主 harness 的 skill/plugin/hook 能力；Claude Code / Cursor / OpenCode 仍是更强路径。 |
| 维护趋势 | 活跃 | `main` tip 到 2026-07-04；最近 CI / supply-chain watch 运行持续成功，open PR 54 说明迭代仍非常快。 |
| 安全历史 / 攻击面 | ⚠️ 中 | 项目安全意识强，但 hooks 会真实拦截/执行 shell 和文件操作，安装进用户环境后攻击面真实存在。必须先 dry-run、审 hooks、避免盲目 full install。 |
| 版本 / 发布口径 | 🟡 降低 | 旧稿里的 `1.10.0 / 2.0.0-rc.1` 漂移已明显收敛：repo package、tag、GitHub latest release、`ecc-universal` npm latest 现已对齐到 `2.0.0`；但多包生态仍有次级版本差异。 |
| 上下文负担 | ⚠️ 高 | 448 skills + 67 agents + 93 commands + 122 rule files 很强，但全量注入会更重。应按 profile / component 选择，不应“越多越好”。 |
| ECC2 成熟度 | ⚠️ 高 | README 仍明确 alpha；应把它与主 Node 安装层分开评估，不应按 GA 控制面采用。 |
| 发布面 bootstrap 依赖 | ⚠️ 中 | clean clone 直接 `npm pack --dry-run --json` 会因缺少 dev deps（TypeScript 编译器）失败；完成 `npm ci` 后可正常打包，说明发布面依赖完整 bootstrap。 |

### 结论

**推荐采用（profile / skill / hooks 层） / 观望（ECC2 控制面）**

ECC 仍值得采用，而且主安装层比旧稿时更稳：

- 如果你已经重度使用 Claude Code / Codex / Cursor / OpenCode：推荐从 `minimal` 或 `developer` profile 试起。
- 如果你想研究 agent workflow 系统设计：强烈推荐读源码和文档，学习价值依旧极高。
- 如果你想把 ECC2 当“多 agent 控制中心”直接生产使用：现在仍应观望，它依旧是 alpha。

采用建议：**把 ECC 当作“可拆解的 agent workflow 资产库 + cross-harness 安装/治理样板”，不要当作一次性全量安装的魔法包。**当前最值得借鉴的是 manifest 选择性安装、hook profile、workflow asset catalog、public/private boundary、安全 CI gate，以及把 OpenCode / Claude / Codex / Hermes 等 surface 统一纳入发布面的工程方法。

---

## 场景二：技术架构学习

### 核心架构图

```text
┌──────────────────────────────────────────────────────────────────┐
│                            ECC Repo                               │
│        reusable agent workflow substrate, not the LLM runtime      │
└──────────────────────────────────────────────────────────────────┘

  Source-of-truth assets
  ┌───────────────────────────────────────────────────────────────┐
  │ skills/      agents/      rules/      commands/      MCPs      │
  │ 448          67           122 files   93            configs    │
  └──────────────────────────────┬────────────────────────────────┘
                                 │ classified by
                                 ▼
  Manifest selection layer
  ┌───────────────────────────────────────────────────────────────┐
  │ manifests/install-modules.json                                │
  │ manifests/install-components.json                             │
  │ manifests/install-profiles.json                               │
  │ profiles: minimal / core / developer / security / research... │
  └──────────────────────────────┬────────────────────────────────┘
                                 │ resolved by
                                 ▼
  Installer / lifecycle CLI
  ┌───────────────────────────────────────────────────────────────┐
  │ scripts/ecc.js                                                │
  │ ├─ install / plan / catalog / consult                         │
  │ ├─ doctor / repair / auto-update / uninstall                  │
  │ └─ state preview + install-state                              │
  └──────────────────────────────┬────────────────────────────────┘
                                 │ target adapters
                                 ▼
  Harness surfaces
  ┌───────────────────────────────────────────────────────────────┐
  │ Claude / Claude Project / Cursor / Codex / Gemini / OpenCode  │
  │ CodeBuddy / JoyCode / Qwen / Zed / Antigravity                │
  └──────────────────────────────┬────────────────────────────────┘
                                 │ runtime behavior where supported
                                 ▼
  Hooks + learning + security
  ┌───────────────────────────────────────────────────────────────┐
  │ scripts/hooks/                                                │
  │ - bash dispatcher, quality gate, config protection            │
  │ - cost/audit logging, PR/build completion, continuous learning│
  │ - workflow security / IOC / personal-path validators          │
  └──────────────────────────────┬────────────────────────────────┘
                                 │ emerging control plane
                                 ▼
  ECC2 alpha
  ┌───────────────────────────────────────────────────────────────┐
  │ Rust TUI / daemon / SQLite state store / worktree/session ops │
  │ observability / risk scoring / delegation and backlog control │
  └───────────────────────────────────────────────────────────────┘
```

### 底层技术架构

#### 最小架构内核

ECC 的最小内核是 **Workflow Assets + Manifest Resolver + Target Adapter Installer + Hook Policy Middleware + Security Validators + Install State**。它不是 LLM runtime，本质是把 skills、agents、rules、commands、MCP 配置和 hooks 变成可选择安装、可审计、可修复的跨 harness 工作流底座。

#### 核心抽象

- `Skill` / `Agent` / `Rule` / `Command`：长期可迁移的 agent workflow 资产。
- `Profile` / `Module` / `Component`：manifest 中的选择单元，决定安装哪些资产和上下文重量。
- `InstallPlan`：由 manifest、target、profile 和 dependency resolution 生成的物化计划。
- `TargetAdapter`：封装 Claude、Cursor、Codex、OpenCode 等 harness 的路径和 merge/copy 策略。
- `HookProfile`：通过 profile 和 env flag 决定 hook chain 是否启用及如何输出。
- `InstallState`：doctor、repair、auto-update、uninstall 的事实来源。
- `StateStore`：ECC2 alpha 中用 SQLite 管 session、worktree、delegation、schedule 和 daemon control-plane。

#### 控制面 / 数据面

- **控制面**：`scripts/ecc.js` CLI、`manifests/install-*.json`、install resolver、target registry、hook dispatcher、workflow security validator、config-protection、ECC2 daemon/session manager。
- **数据面**：复制/合并 skill、agent、rule、command、MCP 配置，写入目标 harness 文件，执行 hook 脚本，扫描 GitHub Actions，写 install-state 或 ECC2 SQLite。

#### 关键执行链路

1. **选择性安装**：`ecc install` 进入 `scripts/ecc.js`，解析 profile/module/component/target，`install-manifests.js` 生成 plan，target adapter 物化 copy/merge-json operations，`apply.js` 写入目标目录并保存 install-state。
2. **Hook 治理**：harness 触发 bash hook，`bash-hook-dispatcher.js` 根据 profile/env flag 选择 pre/post hook，标准化 stdout/stderr/additionalContext/exitCode，`config-protection.js` 可 fail-closed 阻止弱化 lint/format 配置。
3. **CI 安全扫描**：`validate-workflow-security.js` 静态扫描 workflow，拒绝高风险 `pull_request_target`、shared cache、未禁 lifecycle scripts、过宽 write permission 等模式。

#### 状态模型

- **持久状态**：repo 内 workflow assets、manifest、target 配置模板、install-state、hook 配置、ECC2 SQLite。
- **运行时状态**：一次 install plan、hook chain 执行结果、CLI subprocess、ECC2 session/daemon memory。
- **外部状态**：用户目标 harness 配置目录、GitHub Actions workflow、真实项目 worktree、Claude/Codex/Cursor/OpenCode 等宿主。manifest 和 install-state 是 ECC 自身事实源，宿主实际文件需要 doctor/repair 再核对。

#### 契约边界

- **内部契约**：manifest schema、`resolveInstallPlan()`、target adapter registry、hook result envelope、ECC2 StateStore 方法。
- **外部契约**：`ecc install/plan/catalog/consult/doctor/repair/auto-update/uninstall` CLI、target harness 文件布局、hooks JSON、MCP config 模板。
- **Agent-facing 契约**：`SKILL.md`、rules、commands、subagent definitions 和 hook additional context，均以明文资产给 Agent 读取。

#### 失败与降级模型

- 不支持的 target、manifest target drift 和 component dependency 问题应在 plan/validator 阶段失败。
- Hook 通过 profile/env flag 控制启用，输出标准化；配置弱化类风险由 config-protection fail-closed。
- Workflow security validator 对供应链红线 fail-closed；Semgrep 等扫描可作为渐进增强。
- ECC2 仍是 alpha，session/worktree/daemon 路径对 git 环境敏感，不能按成熟 operator plane 预期。
- doctor/repair/auto-update 依赖 install-state 修复漂移，不能假设一次复制后长期一致。

#### 可复刻设计不变量

1. Agent workflow 资产必须作为工程资产治理，而不是散落提示词。
2. 安装选择要通过 manifest 数据模型表达，不能复制整个仓库到所有 harness。
3. 每个 harness 的路径和能力差异必须封装在 target adapter。
4. Hook 是 policy middleware，必须可观测、可禁用、可测试。
5. 安全红线要写成确定性 validator。
6. Public/private operator 边界要文档化，避免发布真实本地状态。
7. install-state 是 repair/uninstall 的前提，不能只做无状态复制。
8. alpha 控制面要隔离在独立边界，不能污染稳定 workflow asset 层。

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 以 workflow assets 为核心 | `skills/`、`agents/`、`rules/`、`commands/` 是长期资产 | 自研完整 agent runtime | 最大化跨 Claude/Codex/Cursor/OpenCode 等宿主迁移性 |
| SKILL.md / Markdown 优先 | 大量行为规范用明文文本表达 | 强类型 DSL 的编译期保障 | agent 易读、人类可 review、可跨平台复制 |
| Manifest-driven selective install | profile/module/component/target 组合解析 | 简单粗暴复制整个 repo | 降低上下文和副作用，支持不同 harness 差异 |
| Hook profile + dispatcher | 多个 hook 通过 profile 和 env flag 控制 | 每个 hook 独立散落配置 | 可观测、可测试、可 fail-open，避免单 hook 失控影响全局 |
| CI 中安全规则显式化 | workflow security validator、IOC scanner、no-personal-paths | 只靠人工 review | Agent workflow 仓库本身有高风险，必须把安全边界做成测试 |
| ECC2 独立 Rust 控制面 | session/worktree/daemon/dashboard 另起控制面 | 只做配置包 | 长期目标是 operator plane，但当前以 alpha 隔离风险 |
| Public/private boundary | 明确 Hermes 是 operator shell，不发布私有状态 | 把真实工作区完整开源 | 既展示方法论，又避免 token、memory、local automation 泄漏 |

### 值得学习的模式

1. **Cross-harness single source of truth**：把 durable behavior 放在 `skills/`、`rules/`、`hooks/`、`scripts/`，各 harness 只做加载/事件/路径适配。
2. **Selective install as product design**：`minimal/core/developer/security/research/full` 不是简单脚本参数，而是“不同使用者需要不同上下文重量”的产品判断。
3. **Hooks as policy middleware**：Pre/Post hooks 不只是自动化脚本，而是 agent 行为治理层：拦截危险命令、提醒 tmux/worktree、捕获成本、阻止配置弱化。
4. **Agent workflow catalog as data**：agents、commands、skills、rules 都被 CI 校验计数和结构，说明它把“提示词资产”当成工程资产治理。
5. **Fail-closed security validators**：GitHub Actions 安全检查会拒绝 `pull_request_target` 拉取不可信代码、拒绝未禁 lifecycle scripts 的 install、拒绝 shared cache 等。
6. **Continuous learning 的 project-scoped 设计**：`continuous-learning-v2` 把 learned instincts 从全局污染改成项目级 hash + 可提升为 global。
7. **Operator boundary 文档化**：`docs/architecture/cross-harness.md` 明确 Hermes 不是 public runtime，只能发布 sanitized patterns。这对个人/团队开源方法论很关键。

### 反模式 / 踩坑点

1. **资产面过大**：448 skills / 67 agents / 93 commands 很强，但也意味着检索、选择、更新和上下文控制变成核心问题。
2. **版本口径漂移问题已缓和，但多包版本面仍存在**：主包 `ecc-universal` 已与 tag / release 对齐到 `2.0.0`，但生态里仍有 `ecc-agentshield` 等次级包独立演进。
3. **ECC2 代码局部过大**：`ecc2/src/main.rs` 约 12.6k 行、`session/manager.rs` 约 8.2k 行，控制面 alpha 阶段功能集中，后续需要拆分。
4. **ECC2 测试仍对 git / worktree 语义敏感**：session、merge-tree、main-branch、daemon/control-plane 这类路径天然带环境假设；本轮未重跑 `cargo test`，因此保持 alpha 风险判断，但不沿用旧轮次的具体失败数。
5. **Hook 安装需要谨慎**：hook 会进入用户实际工具执行路径。强大但有副作用，必须先 dry-run 和审查。
6. **社区噪音与真实贡献混杂**：open issues 中有 thanks/ctx 等低信息量条目，同时 open PR 很多，维护者需要持续 triage。

### 可借鉴的具体技术点

- `manifests/install-*.json`：把 workflow asset 分类、profile、component 设计成显式数据模型。
- `scripts/lib/install-manifests.js`：manifest loader、synthetic skill component、target filtering、dependency resolution。
- `scripts/lib/install-executor.js`：从 resolved plan materialize file operations，并写 install-state，支持 legacy compatibility。
- `scripts/lib/install-targets/registry.js`：target adapter registry，适合学习多平台路径/能力适配。
- `scripts/hooks/bash-hook-dispatcher.js`：profile-gated hook multiplexing，统一 stderr/additional context/exit code 语义。
- `scripts/hooks/config-protection.js`：一个很实用的 agent guardrail，阻止 agent 为了让 lint 过而改弱配置。
- `scripts/ci/validate-workflow-security.js`：把 GitHub Actions 安全红线写成确定性扫描器。
- `skills/continuous-learning-v2/`：project-scoped learned instincts 设计，适合研究 agent 自我改进但避免跨项目污染。
- `ecc2/src/session/store.rs` / `manager.rs`：SQLite session state、worktree、delegation、schedule、daemon control-plane 的 alpha 实现。

---

## 架构解剖

### 目录结构

```text
ECC/
├── agents/                     # 67 个 specialized subagents 定义
├── skills/                     # 448 个工作流 / 领域 / 工程技能，核心资产面
├── rules/                      # common + language/framework 规则
├── commands/                   # 93 个 slash-command 兼容文档
├── hooks/                      # hook 配置入口
├── scripts/                    # Node/Python/Shell 实现：installer、CI、hooks、orchestration
│   ├── lib/                    # install/state/session/harness adapter 等可测试库
│   ├── hooks/                  # runtime hooks
│   └── ci/                     # validators/security/catalog sync
├── manifests/                  # install modules / profiles / components
├── mcp-configs/                # MCP server 配置样板
├── .claude-plugin/             # Claude Code plugin surface
├── .codex/ .codex-plugin/      # Codex surface
├── .cursor/ .opencode/ ...     # 各 harness adapter surface
├── ecc2/                       # Rust alpha 控制面：TUI/session/daemon/worktree/observability
├── docs/                       # 架构、Hermes setup、release、翻译、多语言文档
├── tests/                      # JS/Python 测试，Node 自定义 test runner
└── package.json / pyproject    # npm package + 遗留/局部 Python abstraction metadata
```

### 技术栈

- **运行时 / 框架：** Node.js >=18（主 CLI/installer/hooks/CI）、Rust（ECC2 alpha）、Python（部分 hooks/LLM abstraction/skills scripts）、Shell、少量 TS/TSX。
- **构建 / 打包：** npm package `ecc-universal`，Yarn 4 packageManager；`prepack` 会构建 OpenCode dist；ECC2 用 Cargo。
- **测试：** 自定义 Node test runner + JS assert 风格；Python pytest 局部；Rust `cargo test`。
- **CI/CD：** GitHub Actions 覆盖 OS × Node × package-manager matrix、validators、security scan、coverage、release、supply-chain watch。
- **代码规模：** 当前 `git ls-files` 为 3,301；其中 `.md` 2,490 / 443,235 行、`.js` 391 / 121,747 行、`.rs` 16 / 52,139 行、`.py` 62 / 10,702 行。

### 模块依赖关系

```text
package.json bin: ecc
  └─ scripts/ecc.js
      ├─ install → scripts/install-apply.js
      │    └─ normalize request → createInstallPlanFromRequest
      │        ├─ resolveInstallPlan(manifests)
      │        ├─ getInstallTargetAdapter(target)
      │        ├─ materialize copy/merge-json operations
      │        └─ applyInstallPlan + install-state
      ├─ plan → scripts/install-plan.js
      ├─ catalog / consult / doctor / repair / auto-update
      └─ status / sessions / work-items / platform-audit

hooks/hooks.json
  └─ scripts/hooks/*-dispatcher.js
      ├─ hook-flags profile gating
      ├─ pre/post bash hook chain
      ├─ config/security/quality/cost/logging hooks
      └─ optional continuous-learning observation

ecc2 CLI
  └─ clap subcommands
      ├─ StateStore(SQLite)
      ├─ session manager / daemon / output store
      ├─ worktree operations
      ├─ observability / risk scoring
      └─ TUI dashboard
```

### 扩展机制

- **Install profile / module / component：** 新资产进入 `manifests/` 后自动变成可选安装面。
- **Target adapter：** 新 harness 可通过 `scripts/lib/install-targets/*` 和 registry 适配目标路径、merge/copy 策略、install-state。
- **Skill / agent / command：** 通过目录约定 + validator 管理；不只是文档，属于工程资产。
- **Hook runtime：** hook profile、env flags、dispatcher 链路决定是否启用和如何处理输出。
- **ECC2 config：** `ecc2.toml`、agent profiles、worktree policy、daemon/orchestration settings。
- **MCP configs：** `.mcp.json` 和 `mcp-configs/` 作为跨 harness tool access 模板。

---

## 质量与成熟度

### 代码质量

- **类型系统：** 主体 Node.js 是 CommonJS + JSDoc/测试保障，类型安全中等；ECC2 Rust 类型安全较强，但局部文件过大。
- **错误处理：** CLI/installer 路径大量 fail-fast 和清晰错误；hook 路径偏 fail-open，避免工具链被 hook 异常卡死。
- **代码风格一致性：** assets 目录和 validators 很一致；Node installer 拆分较好；ECC2 alpha 仍有 monolithic 文件，需要后续模块化。
- **安全意识：** 明显强于普通 config pack：workflow security、IOC scan、no personal paths、config protection、hook validation 都是主动防线。

### 测试

本次验证：

- `node scripts/ecc.js plan --profile developer --target claude --json`：通过；9 个 selected modules，99 个 planned file operations。
- clean clone 直接 `npm pack --dry-run --json`：失败，原因是缺少 dev dependencies（TypeScript 编译器），`prepack -> build:opencode` 无法运行。
- `npm ci && npm pack --dry-run --json`：通过；当前产物为 `ecc-universal-2.0.0.tgz`，`packageSize` 4,825,659 bytes、`unpackedSize` 14,250,761 bytes、`entryCount` 2362、`bundled` 为空。
- `npm test`：通过，Final Results: **2971 passed / 0 failed**。
- **本轮未重跑：** `ecc2` 的 `cargo test`。因此 ECC2 仍按 README 的 alpha 定位和控制面风险评估，而不伪造新的 Rust 测试结论。

### CI/CD

- `.github/workflows/ci.yml` 仍有多平台矩阵：Ubuntu/Windows/macOS × Node 18/20/22 × npm/pnpm/yarn/bun（Bun 排除 Windows）。
- install steps 继续显式禁用 lifecycle scripts：`npm ci --ignore-scripts`、`pnpm install --ignore-scripts`、`yarn install --mode=skip-build`、`bun install --ignore-scripts`。
- Security / supply-chain 方向仍是硬信号：`npm audit signatures`、IOC scan，以及独立 `Supply-Chain Watch` 定时 workflow。
- 本轮 GitHub Actions 最近 12 条运行里，`Supply-Chain Watch` 连续 success，多个 PR `CI` success；也看到个别 `action_required`，说明仓库在高速推进中仍有人工/策略门存在。
- Coverage job 仍要求 80% lines/functions/branches/statements；Release workflow 继续覆盖 npm / GitHub Release / package version 的发布面。

### 文档质量

- README 极完整：定位、版本节奏、指南、商业化、安装、语言翻译。
- `docs/architecture/cross-harness.md` 对“ECC 是 reusable workflow layer，不是 harness/runtime”讲得清楚。
- `docs/HERMES-SETUP.md` 明确 Hermes/ECC 边界和 sanitized public scope。
- 多语言文档非常多，但也带来同步成本。
- 相比旧稿，主包版本面现在更清楚：README/package/release/tag/npm latest 已更接近同一条 `2.0.0` 叙事。

### Issue / PR 健康度

- Open issues：22；open PRs：54（2026-07-08，按 `/issues` 返回项是否含 `pull_request` 字段拆分）。
- 最近维护：`main` tip 到 2026-07-04；最近 GitHub Actions 里 PR CI 持续 success，`Supply-Chain Watch` 定时任务连续 success。
- 当前形态更像“高速推进 + 大量 PR 流入”的维护面，而不是 issue 积压失控。真正的负担更偏向 review / triage / profile drift 控制。
- 仍要注意：PR 数高达 54，说明生态与资产面扩张很快，maintainer 审查压力真实存在。

---

## 社区与生态

### 社区评价

- Star/Fork 继续走高：227,216 / 34,738；subscribers 已到 1,163，说明它不只是“被收藏”，而是在被持续跟踪。
- npm 仍有真实下载：`ecc-universal` 近 7 日约 3.7k，`ecc-agentshield` 约 4.0k。
- 仓库资产面明显继续膨胀：67 agents、448 skills、93 commands、122 rules，说明社区关注点已从“一个 Claude Code 包”变成“跨 harness workflow substrate”。
- 社区贡献很多，但贡献集中度依旧高，核心路线仍由 Affaan 主导。

### 衍生项目 / 插件生态

- 官方 surface 已覆盖多 harness：Claude plugin、Codex plugin、OpenCode、Cursor、Gemini、Qwen、Zed 等。
- 有 GitHub App / ECC Tools 的商业化入口，README 宣称 private repos / GitHub App / billing surface。
- 有 AgentShield、安全指南、Hermes setup、release collateral，说明不是单纯 config dump，而是在做平台化包装。

### 竞品对比

| 维度 | ECC | superpowers | compound-engineering-plugin | CLI-Anything |
|------|-----|-------------|-----------------------------|--------------|
| 核心定位 | Cross-harness workflow substrate + installer + hooks + ECC2 | 纪律注入型 skills | 复利工程 / 多 agent 审查 workflow | 把任意软件包装成 agent-native CLI |
| 是否替代 harness | 否 | 否 | 否 | 否，扩展 agent tool surface |
| 资产面 | 极大：67 agents / 448 skills / 93 commands | 轻量核心 skills | 中等 workflow plugin | 大量 harness / registry |
| 安装治理 | manifest profile 很强 | 简单 plugin install | plugin install/build | hub/registry |
| Hook/runtime | 强 | 轻 | 中 | 依 harness 而定 |
| 学习价值 | cross-harness + governance + control plane | skill psychology / CSO | 多 agent review / compound loop | agent-native software interface |
| 采用风险 | 上下文重、hook 副作用、ECC2 alpha | 低 | 中 | 生态质量离散 |

---

## 关键代码走读

### 1. `scripts/ecc.js`

- 职责：ECC npm CLI 入口，把 `ecc <command>` 路由到 install、plan、catalog、consult、doctor、repair、status、platform-audit 等脚本。
- 实现要点：
  - `COMMANDS` 表驱动路由，避免长 if/else。
  - 支持 legacy implicit install：如果第一个参数是已知语言或 flag，则路由到 `install`。
  - 使用 `spawnSync(process.execPath, [script, ...args])` 保证使用当前 Node 运行脚本。

### 2. `scripts/lib/install-manifests.js`

- 职责：读取 modules/profiles/components manifest，解析 component、profile、target 支持关系。
- 实现要点：
  - `SUPPORTED_INSTALL_TARGETS` 明确 target surface。
  - `addSyntheticSkillComponents` 自动把 `skills/<id>` 生成为 `skill:<id>` component，降低维护成本。
  - 校验 module targets，避免 manifest 指向未支持 target。
  - `resolveInstallPlan` 是选择性安装的核心决策层。

### 3. `scripts/lib/install-executor.js` + `scripts/lib/install/apply.js`

- 职责：把 manifest plan 转换成 copy/merge-json operations，并实际写入目标 harness 目录。
- 实现要点：
  - 兼容 legacy language install 和新 manifest install。
  - 对 Claude/Cursor/Antigravity 等 target 有不同 adapter 和路径策略。
  - `apply.js` 支持 JSON deep merge、MCP disabled server filtering、Claude hooks placeholder resolution。
  - 安装完成写 install-state，为 doctor/repair/auto-update/uninstall 提供依据。

### 4. `scripts/hooks/bash-hook-dispatcher.js` + `scripts/hooks/config-protection.js`

- 职责：运行 hook chain，并阻止 agent 修改 linter/formatter config 来“作弊过检查”。
- 实现要点：
  - `PRE_BASH_HOOKS` / `POST_BASH_HOOKS` 表驱动，按 profile 控制启用。
  - hook 输出标准化为 stdout/stderr/additionalContext/exitCode。
  - `config-protection.js` 对 ESLint/Prettier/Biome/Ruff/Markdownlint 等配置做 fail-closed 保护，只有首次创建允许。

### 5. `scripts/ci/validate-workflow-security.js`

- 职责：静态扫描 GitHub Actions 安全红线。
- 实现要点：
  - 拒绝 privileged event（`workflow_run` / `pull_request_target`）checkout 不可信 PR head。
  - 有 write permissions 时要求 `persist-credentials: false`。
  - 拒绝依赖 install 执行 lifecycle scripts。
  - 拒绝 `actions/cache`、top-level `id-token: write`、`npm audit` 不验证 signatures 等模式。

### 6. `ecc2/src/session/manager.rs` / `store.rs`

- 职责：ECC2 alpha 的 session / worktree / delegation / schedule / daemon control-plane。
- 实现要点：
  - 用 SQLite StateStore 管 session、messages、worktree、tool logs、decisions、context graph。
  - 支持 create/delegate/assign/drain-inbox/auto-dispatch/rebalance/merge queue 等操作。
  - 功能野心很大，但 `main.rs` 和 `manager.rs` 仍偏大，控制面依旧带明显 alpha 风险。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 5 | 覆盖 agent workflow 资产、安装、hooks、MCP、CI、安全、控制面 alpha，面非常全。 |
| 代码质量 | 4 | Node 主路径可测试且结构清晰；ECC2 alpha 局部文件过大、测试环境敏感。 |
| 文档质量 | 5 | README、architecture、Hermes setup、release docs、多语言都很完整。 |
| 社区活跃度 | 5 | 227k+ stars、34k+ forks、54 open PR、npm 仍有下载，且 subscribers 达 1,163；bus factor 仍高。 |
| 架构设计 | 5 | cross-harness source-of-truth + manifest install + hook runtime + control-plane alpha 组合很有启发。 |
| 学习价值 | 5 | 非常适合学习 agent workflow 资产工程化、hook governance、安全 CI、public/private boundary。 |
| 可借鉴度 | 5 | selective install、hook dispatcher、validators、continuous learning、ECC2 control-plane 都可拆出来复用。 |

**总分：34/35**

---

## 总结

### 一句话评价

ECC 是目前看到的最系统化的“agent harness 工作流资产工程化”项目之一：它不满足于写几条 prompt，而是把 agents、skills、rules、hooks、MCP、安装、审计、安全、控制面都纳入同一套工程体系。

### 谁应该用

- 已经重度使用 Claude Code / Codex / Cursor / OpenCode 的个人开发者；
- 想把 AI coding 工作流标准化的小团队；
- 想学习 cross-harness skill/rule/hook 分发的人；
- 想设计内部 agent workflow 平台的人。

### 谁不应该直接用

- 只想要“一个轻量 TDD skill”的用户：先看 superpowers。
- 不愿意审查 hooks 副作用、也不想理解 profile 的用户。
- 想要成熟多 agent 控制中心的人：ECC2 还不是 GA。
- 不愿意为跨 harness 大资产面承担 profile 选择、hook 审计和持续维护成本的团队。

### 下一步

1. 采用试验：只跑 `ecc plan --profile minimal --target <your-harness>` 和 `developer` 对比 operations，不直接 full install。
2. 架构学习：优先读 `docs/architecture/cross-harness.md`、`manifests/*.json`、`scripts/lib/install-*`、`scripts/hooks/*`、`scripts/ci/validate-workflow-security.js`。
3. 内部借鉴：把“profile/component 选择性安装 + hook profile + CI validators”迁移到自己的 Hermes/Distill/agent workflow 体系中。
4. ECC2 观望：关注 worktree / merge / session / control-plane 模块继续拆分后的稳定性，再考虑生产化。
