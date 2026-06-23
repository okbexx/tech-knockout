# ECC

> 一句话定位：**ECC 是一套跨 Claude Code、Codex、OpenCode、Cursor、Gemini、Qwen、Zed 等 AI coding harness 的“工作流操作系统 / 性能优化层”：把 agents、skills、rules、commands、hooks、MCP 配置、选择性安装 manifests、continuous learning 和 ECC2 控制面放到一个可安装、可测试、可演进的公开仓库里。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `affaan-m/ECC` |
| URL | `https://github.com/affaan-m/ECC` |
| Star | 207,220（2026-06-05 观测） |
| Fork | 31,813 |
| 许可证 | MIT |
| 语言 | JavaScript / Markdown 为主，另有 Rust、Python、Shell、TypeScript、YAML 等 |
| 首次提交 | 2026-01-17（本地 git log）；GitHub created_at 为 2026-01-18 |
| 最近提交 | 2026-06-04 |
| 最新 Release / Tag | GitHub latest release API: `v1.10.0`（2026-04-05）；最新 Git tag: `v2.0.0-rc.1` |
| npm | `ecc-universal` latest 为 `1.10.0`，近 7 日下载约 4,246；`ecc-agentshield` 近 7 日下载约 6,871 |
| 贡献者数 | GitHub contributors API 返回 100；核心提交高度集中：`affaan-m` 1427，第二名 47 |
| 分析日期 | 2026-06-05 |
| 分类 | AI Coding Workflow / Agent Harness System |

> 观测口径：GitHub `open_issues_count=78` 包含 PR；拆分后 open issues 30、open PRs 48。GitNexus 已索引：52,981 nodes、64,227 edges、618 clusters、300 flows。

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

- 提供大型 agent 工作流资产库：63 agents、251 skills、79 commands、115 rule files。
- 支持多 harness：Claude / Claude project、Cursor、Antigravity、Codex、Gemini、OpenCode、CodeBuddy、JoyCode、Qwen、Zed。
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
  - 常规使用：Node >=18，npm/yarn/pnpm/bun 均有 CI compatibility lane。
  - npm 包 `ecc-universal`：`npm pack --dry-run` 显示 tarball 约 4.6 MB，unpacked 约 13.56 MB，entryCount 2269。
  - ECC2：Rust/Cargo，依赖更重，首次 `cargo test` 需要下载/编译大量 crates。

- **部署复杂度：**
  - 试用 `minimal` / `developer` profile：中低。
  - 自定义 target + profile + component：中。
  - 全量启用 hooks、continuous learning、ECC2 daemon/control pane：中高，需要理解副作用边界。

- **实测 install plan：**
  - `node scripts/ecc.js plan --profile developer --target claude --json`
  - 结果：9 个 selected modules，98 个 planned file operations。
  - 说明：它不是“复制一个 prompt 文件”，而是规则、agents、commands、hooks、platform configs、skills 多层组合安装。

- **学习曲线：**
  - 只用 profile：可在 30 分钟内上手。
  - 理解全部系统：需要读 manifests、hooks、skills、ECC2 docs，成本明显高于 superpowers。

- **从零到 demo：**
  - 作为 Claude/Cursor/Codex 工作流包：当天可试。
  - 作为团队标准化底座：建议先选 `minimal` / `developer` profile 小范围试 1-2 周，再决定 hooks 和 continuous learning 是否打开。
  - ECC2 控制面：只适合 alpha 评估，不建议直接纳入关键生产链路。

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | 低 | 根仓库 MIT，npm package 也声明 MIT。 |
| Bus factor | ⚠️ 高 | 贡献者很多，但提交高度集中：`affaan-m` 1427，第二名 47。方向和质量主要依赖核心维护者。 |
| 供应商锁定 | 中 | 文本资产可迁移，但实际 enforcement 依赖宿主 harness 的 skill/plugin/hook 能力；Claude Code 仍是最佳路径。 |
| 维护趋势 | 活跃 | 最近提交 2026-06-04；近期 closed PR 密集；open PR 48 说明迭代非常快。 |
| 安全历史 / 攻击面 | ⚠️ 中 | 项目安全意识强，但 hooks 会真实拦截/执行 shell 和文件操作，安装进用户环境后攻击面真实存在。必须先 dry-run、审 hooks、避免盲目 full install。 |
| 版本 / 发布口径 | ⚠️ 中 | 仓库 package 为 `2.0.0-rc.1`，最新 tag 为 `v2.0.0-rc.1`，但 GitHub latest release API 和 npm latest 仍是 `v1.10.0`。采用时应区分 repo HEAD、Git tag、GitHub release、npm version。 |
| 上下文负担 | ⚠️ 中 | 251 skills + 63 agents + 79 commands 很强，但全量注入会重。应按 profile / component 选择，不应“越多越好”。 |
| ECC2 成熟度 | ⚠️ 高 | README 明确 alpha；本地 `cargo test` 有环境敏感失败，不能按 GA 控制面采用。 |

### 结论

**推荐采用（profile / skill / hooks 层） / 观望（ECC2 控制面）**

ECC 值得采用，但采用方式必须克制：

- 如果你已经重度使用 Claude Code / Codex / Cursor：推荐从 `minimal` 或 `developer` profile 试起。
- 如果你想研究 agent workflow 系统设计：强烈推荐读源码和文档，学习价值极高。
- 如果你想把 ECC2 当“多 agent 控制中心”直接生产使用：现在应观望，它仍是 alpha。

采用建议：**把 ECC 当作“可拆解的 agent workflow 资产库 + cross-harness 安装/治理样板”，不要当作一次性全量安装的魔法包。**最值得借鉴的是它的 manifest 选择性安装、hook profile、workflow asset catalog、public/private boundary 和安全 CI gate。

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
  │ 251          63           115 files   79            configs    │
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

1. **资产面过大**：251 skills / 63 agents / 79 commands 很强，但也意味着检索、选择、更新和上下文控制变成核心问题。
2. **版本口径漂移**：repo/package/tag/npm/release 的版本口径不完全一致，外部用户容易困惑“我安装的是哪个 ECC”。
3. **ECC2 代码局部过大**：`ecc2/src/main.rs` 约 12.6k 行、`session/manager.rs` 约 8.2k 行，控制面 alpha 阶段功能集中，后续需要拆分。
4. **测试对 git 环境敏感**：本地 `cargo test` 有 9 个 worktree/merge-tree/main-branch 相关失败，说明 ECC2 测试仍有环境假设需要硬化。
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
├── agents/                     # 63 个 specialized subagents 定义
├── skills/                     # 251 个工作流 / 领域 / 工程技能，核心资产面
├── rules/                      # common + language/framework 规则
├── commands/                   # 79 个 slash-command 兼容文档
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
- **代码规模：** `git ls-files` 约 2,903；pygount 统计约 117,842 code lines，Markdown 2,229 files / 195k comment lines。

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

- `npm ci --ignore-scripts`：通过，0 vulnerabilities。
- `npm test`：通过，Final Results: 2,619 passed / 0 failed。
- `gitnexus analyze --skills --drop-embeddings`：通过，30.0s，52,981 nodes / 64,227 edges / 300 flows；有 Swift parser 和少量 Python scope extraction warnings，不阻塞。
- `npm pack --dry-run --json`：通过，tarball 约 4.6 MB，unpacked 约 13.56 MB。
- `cd ecc2 && cargo test`：失败，453 passed / 9 failed。失败集中在 `git merge-tree`、`main` branch / worktree / PR push 测试，环境显示本机 git 没有 `init.defaultBranch=main`，locale 为 `zh_CN.UTF-8`。这更像 ECC2 alpha 测试环境假设问题，不影响 Node 主安装器通过，但应计入控制面成熟度风险。

### CI/CD

- `.github/workflows/ci.yml` 有多平台矩阵：Ubuntu/Windows/macOS × Node 18/20/22 × npm/pnpm/yarn/bun（Bun 排除 Windows）。
- install steps 显式禁用 lifecycle scripts：`npm ci --ignore-scripts`、`pnpm install --ignore-scripts`、`yarn install --mode=skip-build`、`bun install --ignore-scripts`。
- Security job 运行 `npm audit signatures`、`npm audit --audit-level=high`、IOC scan。
- Coverage job 要求 80% lines/functions/branches/statements。
- Release workflow 对 npm provenance、GitHub Release、package version 有专门测试。

### 文档质量

- README 极完整：定位、版本节奏、指南、商业化、安装、语言翻译。
- `docs/architecture/cross-harness.md` 对“ECC 是 reusable workflow layer，不是 harness/runtime”讲得清楚。
- `docs/HERMES-SETUP.md` 明确 Hermes/ECC 边界和 sanitized public scope。
- 多语言文档非常多，但也带来同步成本。
- Changelog / release docs 详尽，但 version/release/npm 口径需要更清晰地对外统一。

### Issue/PR 健康度

- Open issues：30；open PRs：48。
- 最近 closed PR 密集，6 月 2-4 仍有 platform value loop、ECC2 control pane、dynamic workflow team 等合并。
- Issues 中存在低信息噪音（如 thanks/ctx），但也有真实问题：GateGuard 重复放大、context monitor false warnings、Codex plugin path unreliable、hook dry-run mode、block-no-verify over-match。
- 维护节奏非常活跃，但 triage 负担明显。

---

## 社区与生态

### 社区评价

- Star/Fork 极高：207k / 31.8k，说明传播和收藏强。
- npm 有真实下载：`ecc-universal` 近 7 日约 4.2k，`ecc-agentshield` 约 6.9k。
- 搜索到多个翻译/镜像/派生仓库，例如 `everything-claude-code-zh`、`WorldFlowAI/everything-claude-code` 等。
- 社区贡献很多，但贡献集中度依旧高，核心路线由 Affaan 主导。

### 衍生项目 / 插件生态

- 官方 surface 已覆盖多 harness：Claude plugin、Codex plugin、OpenCode、Cursor、Gemini、Qwen、Zed 等。
- 有 GitHub App / ECC Tools 的商业化入口，README 宣称 private repos / GitHub App / billing surface。
- 有 AgentShield、安全指南、Hermes setup、release collateral，说明不是单纯 config dump，而是在做平台化包装。

### 竞品对比

| 维度 | ECC | superpowers | compound-engineering-plugin | CLI-Anything |
|------|-----|-------------|-----------------------------|--------------|
| 核心定位 | Cross-harness workflow substrate + installer + hooks + ECC2 | 纪律注入型 skills | 复利工程 / 多 agent 审查 workflow | 把任意软件包装成 agent-native CLI |
| 是否替代 harness | 否 | 否 | 否 | 否，扩展 agent tool surface |
| 资产面 | 极大：63 agents / 251 skills / 79 commands | 轻量核心 skills | 中等 workflow plugin | 大量 harness / registry |
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
  - 功能野心很大，但 `main.rs` 和 `manager.rs` 仍偏大，本地 cargo tests 暴露 worktree/main-branch 环境敏感问题。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 5 | 覆盖 agent workflow 资产、安装、hooks、MCP、CI、安全、控制面 alpha，面非常全。 |
| 代码质量 | 4 | Node 主路径可测试且结构清晰；ECC2 alpha 局部文件过大、测试环境敏感。 |
| 文档质量 | 5 | README、architecture、Hermes setup、release docs、多语言都很完整。 |
| 社区活跃度 | 5 | 207k stars、31k forks、近期 PR/issue 活跃、npm 有下载，但 bus factor 仍高。 |
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

### 谁不应该用

- 只想要“一个轻量 TDD skill”的用户：先看 superpowers。
- 不愿意审查 hooks 副作用、也不想理解 profile 的用户。
- 想要成熟多 agent 控制中心的人：ECC2 还不是 GA。
- 对版本口径和发布稳定性要求很严格的生产团队：需要等待 `v2.0.0` npm/release 口径统一。

### 下一步

1. 采用试验：只跑 `ecc plan --profile minimal --target <your-harness>` 和 `developer` 对比 operations，不直接 full install。
2. 架构学习：优先读 `docs/architecture/cross-harness.md`、`manifests/*.json`、`scripts/lib/install-*`、`scripts/hooks/*`、`scripts/ci/validate-workflow-security.js`。
3. 内部借鉴：把“profile/component 选择性安装 + hook profile + CI validators”迁移到自己的 Hermes/Distill/agent workflow 体系中。
4. ECC2 观望：关注 worktree/merge tests、version release alignment、control-plane 模块拆分后再考虑生产化。
