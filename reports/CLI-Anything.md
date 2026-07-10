# CLI-Anything

> 一句话定位：**CLI-Anything 是一套把 GUI / 桌面 / 服务 / 专业软件变成 Agent-native CLI 的工程方法论、跨宿主 agent 技能/插件、CLI-Hub 注册表、Preview artifact 协议与 CLI Matrix 多工具工作流层；它的核心价值不是“自动生成一个命令行壳”，而是把真实软件能力包装成可被 Agent 稳定发现、调用、预检、组合、验证和分发的命令面。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `HKUDS/CLI-Anything` |
| URL | `https://github.com/HKUDS/CLI-Anything` |
| Star | 44,960（2026-07-08 观测） |
| Fork | 4,208（2026-07-08 观测） |
| 许可证 | Apache-2.0（仓库根 LICENSE）；多个 harness / package metadata 仍残留 MIT / GPL classifier，见风险说明 |
| 主要语言 | Python 为主，少量 JavaScript / TypeScript / C# / Shell / Swift |
| 首次提交 | 2026-03-08（`0148803 first commit`） |
| 最近提交 | 2026-06-25（`dc73924 feat(cli-hub): bump to 0.4.0 and add CLI-Matrix analytics`） |
| Git 提交数 | 844（本地 clone 统计，2026-07-08） |
| 最新 Release | v0.4.0（2026-06-25） |
| 最新 tag | v0.4.0 |
| 贡献者 | GitHub API 首页贡献者与本地 shortlog 都显示多作者协作仍在继续；近期主导仍集中于 yuh-yang / Yuhao 与少数活跃贡献者 |
| 当前健康度 | GitHub repo API `open_issues_count=72`（含 PR）；GitHub search 口径：open PR 30、open issues 42、merged PRs 164、closed issues 69 |
| 分析日期 | 2026-07-08 |
| 分类 | Agent-Native Software / CLI Harness Framework / CLI Workflow Substrate |

> 观测说明：本次以静态分析为主：源码、文档、Git 历史、GitHub API、Release、Issue/PR 元信息；**额外做了 Python 语法烟测**：本地 checkout 与 `FETCH_HEAD` tip 均为 `1262` 个 `.py` 文件、`0` 个 syntax error。未安装项目依赖、未启动服务、未跑完整测试/构建。

---

### 重新分析后的核心变化

相对 2026-05-19 旧报告，CLI-Anything 的项目重心明显上移：

1. **从“生成单个软件 CLI harness”扩展到“多 CLI 工作流矩阵”。** 新增 `matrix_registry.json`、`cli-hub/cli_hub/matrix.py`、`matrix_skill.py`、`cli-hub-matrix/*/SKILL.md`，把多个 CLI、Python 库、native binary、API、agent skill 编成按 capability 选择的任务矩阵。
2. **CLI-Hub 从安装器变成控制面。** 除 `list/search/install/launch/previews` 外，新增 `can`、`matrix list/search/info/preflight/install/doctor/recipes`，开始承担 provider discovery、环境 preflight、install plan、doctor 和 matrix skill 渲染。
3. **生态数量继续增长。** `registry.json` 从旧报告的 60 个 harness CLI 增到 76；`public_registry.json` 从 16 增到 20；`matrix_registry.json` 新增 5 个 workflow matrix。
4. **宿主适配更广。** README 已明确列出 Claude Code、Pi、OpenClaw、OpenCode、Codex、Hermes、Reasonix、Qodercli、GitHub Copilot CLI；Hermes skill 和 Reasonix skill 成为一等入口。
5. **旧报告里的 `cli-hub/preview.py` SyntaxError 已修复。** 当前同一区域已改为合法字符串拼接；并且本次对本地 checkout 与 fetched main tip 都跑了 `py_compile` 烟测，`1262` 个 `.py` 文件均无语法错误。
6. **文档/营销指标继续膨胀，但口径需审慎。** README 宣称 `2,461` tests / `100% pass rate`，同时写 `1,732 unit + 579 E2E + 19 Node.js`，三项相加为 2,330，存在测试汇总口径不一致；在未运行完整测试的情况下不能把该数字当作独立验证结果。
7. **2026-06-25 之后，CLI-Hub 已进入 `v0.4.0` 阶段。** `cli-hub` wheel 现在会 vendoring `cli-hub-matrix/*` 技能数据到包内，降低“无 repo checkout 时 matrix skill 不可用”的分发摩擦。
8. **新风险也出现了：analytics 进入控制面。** `cli_hub/analytics.py` 引入 PostHog/Umami、distinct ID、本地 `~/.cli-hub/.analytics_id` 与 agent/human 调用上下文识别；这说明项目开始从方法论工具向带产品遥测的 package manager 演化。

---

## 场景一：是否值得采用

### 解决的问题

Agent 要操作真实软件，传统有三条路：

1. **GUI automation**：看屏幕、点按钮、靠坐标/DOM/图像识别，通用但脆弱、不可审计、难复现。
2. **零散 API / SDK 调用**：可靠但碎片化，Agent 不知道哪个 API 对应完整任务，也缺少统一输出契约。
3. **MCP / tool registry**：解决协议和工具发现，但不自动解决“一个复杂软件如何被产品化成稳定工具面”。

CLI-Anything 的判断是：**CLI 是 Agent 与既有软件之间最稳的窄腰接口。** 它要求每个软件 harness 都具备：

- 真实后端调用，而不是 Python toy reimplementation；
- 一次性 subcommand + stateful REPL 双模式；
- `--json` 机器可读输出；
- session / undo / redo / autosave / dry-run；
- `TEST.md` 测试计划与测试结果；
- SKILL.md 作为 agent-facing 说明；
- preview bundle / live trajectory 作为视觉/中间结果反馈；
- registry + hub 作为分发与发现层。

### 核心能力与边界

**能做什么：**

- 提供 `/cli-anything <software-path-or-repo>` 七阶段 workflow：源码获取 → 代码分析 → CLI 架构设计 → 实现 → 测试计划 → 测试实现/文档 → SKILL.md → 发布安装。
- 通过 `cli-anything-plugin/HARNESS.md` 把真实后端、native format、JSON 输出、REPL、session、undo/redo、preview、E2E、SKILL 作为硬规范写给 coding agent。
- 通过 `registry.json` 收录 76 个 harness CLI，覆盖 graphics、video、office、web、AI、devops、knowledge、science、game、debugging 等类别。
- 通过 `public_registry.json` 纳入 20 个外部/第三方 CLI，如 Feishu、MiniMax、Contentful、Sanity、Shopify、Sentry、1Password CLI、yt/video/music/AI 相关工具等。
- 通过 `cli-hub` 做统一发现、缓存、安装、卸载、更新、launch、preview inspection、matrix preflight、matrix install、matrix doctor。
- 通过 `matrix_registry.json` 把 “视频创作、知识研究、3D/CAD、游戏开发、图像设计” 等任务拆成 capability/provider/recipe，不再让 Agent 盲目安装一堆工具。
- 支持多宿主：Claude Code plugin、Pi extension、OpenCode commands、Codex skill、Hermes skill、Reasonix skill、Qodercli、GitHub Copilot CLI 等。

**不能做什么：**

- 不能保证“任意软件”都能低成本变成高质量 CLI。前提仍是目标软件有可脚本化后端、稳定项目格式、CLI/API/MCP/SDK 或 headless 能力。
- 不是安全沙箱。它让 Agent 调真实软件、真实文件、真实 API；命令执行、路径写入、宏脚本、凭证读取的风险都是真实的。
- 不是成熟中心化 marketplace。当前 registry 本质仍是 GitHub repo + JSON + GitHub Pages + PyPI hub；治理、审核、签名、供应链 provenance 还偏轻。
- 不能保证所有 harness 质量一致。仓库增长极快，多贡献者、多代模板、多 license metadata、多 backend 类型并存，质量离散度天然高。
- Matrix 不是自动决策 AI。`preflight` 只是可用性检查，不是 provider selector；真正 provider 选择仍依赖 Agent 按成本、质量、离线性、凭证、授权和用户目标判断。

### 结论

**结论：推荐学习 / 推荐受控 PoC；生产级直接依赖仍观望。**

CLI-Anything 的方向非常值得学：它抓住了 Agent 时代软件形态的关键命题——**软件要主动暴露 Agent 可操作的结构化命令面，而不是等 Agent 去模拟人类 GUI 操作。**

但作为生产依赖，它还处在高增长、高扩张、高治理负债阶段。最稳妥的采用方式是三层：

1. **Learn：** 精读 `HARNESS.md`、`docs/PREVIEW_PROTOCOL.md`、`cli-hub`、`matrix_registry.json`、几个成熟 harness，学习如何把软件能力工程化给 Agent。
2. **PoC：** 选一个内部工具/服务/桌面软件，按 CLI-Anything 规范做最小 harness：`--json`、REPL、session、E2E、SKILL.md、preview/summary artifact。
3. **Production：** 不直接照搬 public registry。先加组织内 registry 审核、install command allowlist、license provenance、sandbox、凭证隔离、CI syntax/test gate、artifact 签名或 lockfile。


### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键库 / SDK。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| `click>=8.0` | Python CLI framework | `cli-hub` command surface、subcommand tree、参数解析 | 让 registry / matrix / preview / install / doctor 能稳定暴露成命令面 | `cli-hub/setup.py` `install_requires` | 适合作为 Agent-native CLI control plane 的最小框架 | 不是强 schema/runtime guard，本身不解决 install command 安全问题 |
| `requests>=2.28` | HTTP client | 拉取 registry / public registry / matrix registry；发送 analytics | 用最小依赖完成 registry 控制面与遥测上报 | `cli-hub/setup.py`、`cli_hub/registry.py`、`cli_hub/analytics.py` | 说明产品核心不是复杂服务端，而是“轻控制面 + JSON registry” | 网络层简单也意味着 provenance / retry / 签名 / policy 需要额外治理 |
| `setuptools` + package data vendoring | packaging/build | `cli-hub` 发布、entry point、把 `cli-hub-matrix/*` vendoring 进 wheel | 解决“脱离 repo checkout 后 matrix skill 丢失”问题 | `cli-hub/setup.py` 里的 `build_py`/`sdist` + `_sync_matrix_data()` | 对 skill-heavy / artifact-heavy Python 包很有借鉴价值 | 也暴露出 root Apache-2.0 与子包 MIT classifier 的 metadata 漂移 |
| **stdlib-first runtime** | architecture choice | registry cache、matrix state、preview protocol、skill 复制、agent context 检测 | 把产品重心放在方法论/协议/registry，而不是重运行时框架 | 大量核心逻辑在 `cli-anything-plugin/*`、`cli_hub/*` 中直接用 stdlib + 少量依赖 | 适合做“Agent tool packaging substrate” 的轻核设计 | 轻依赖不代表低风险；shell install、license provenance、telemetry 仍是系统性问题 |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | ⚠️ 中 | 根仓库 Apache-2.0，但多个 `setup.py` / `pyproject.toml` classifier 仍写 MIT / GPLv3；旧 issue 还暴露过 AI 生成代码来源合规问题。生态型仓库需要 provenance 机制，而不只是根 LICENSE。 |
| 安全边界 | ⚠️ 中高 | `SECURITY.md` 明确承认 Agent 会自主构造命令；风险面包括 subprocess 参数、Script-Fu / macro 注入、XML/SVG 注入、路径遍历、明文凭证。open PR #283 仍在修 FreeCAD output_path macro injection。 |
| Registry 供应链 | ⚠️ 中高 | `installer.py` 对含 pipe / `&&` / `;` 等 shell metacharacter 的 registry install command 使用 `shell=True`，理由是命令来自 trusted registry。这把 registry review 变成安全边界。 |
| 遥测 / 隐私 | ⚠️ 中 | `cli_hub/analytics.py` 新增 PostHog/Umami、distinct ID 与 agent/human 调用上下文识别；默认是 opt-out by env，而不是安装时显式确认。 |
| Bus factor | 中 | 贡献者数和 PR 活跃度高，但核心提交仍集中在 yuh-yang/Yuhao 及少数活跃贡献者。 |
| 维护趋势 | 活跃 | 2026-03 创建，2026-06-25 仍有 release + commit；最近已从 matrix 扩展到 analytics / package vendoring。 |
| 质量一致性 | ⚠️ 中 | 方法论层强，harness 层多代模板共存；README 测试汇总口径不一致；CI 尚未看到全仓 pytest/py_compile 级 gate。 |
| 供应商/宿主锁定 | 中 | 方法论跨平台，但最佳体验仍依赖具体 coding agent 能否稳定读 skill/commands、调用终端、编辑文件、运行测试。 |

---

## 场景二：技术架构学习

### 核心架构图

```text
┌────────────────────────────────────────────────────────────────────┐
│                          CLI-Anything                              │
│       Agent-native software interface + workflow substrate          │
└────────────────────────────────────────────────────────────────────┘

  Host Coding Agents
  ┌────────────────────────────────────────────────────────────────┐
  │ Claude Code / Codex / Hermes / Reasonix / Pi / OpenCode / ... │
  └─────────────────────────────┬──────────────────────────────────┘
                                │ slash command / plugin / skill
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│ Methodology Control Plane                                           │
│ cli-anything-plugin/HARNESS.md                                      │
│ commands/*.md: build / refine / test / validate / list              │
│ guides/: session locking / preview / skill generation / publishing  │
└─────────────────────────────┬──────────────────────────────────────┘
                              │ drives coding agent to generate
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│ Per-Software Harness                                                │
│ <software>/agent-harness/                                           │
│ - setup.py / pyproject.toml                                         │
│ - cli_anything/<software>/<software>_cli.py                         │
│ - core/: domain/session/project/export                              │
│ - utils/: real backend wrapper + repl_skin + preview_bundle         │
│ - tests/: TEST.md + unit + E2E + subprocess                         │
│ - skills/SKILL.md + repo-root skills/cli-anything-<software>/       │
└─────────────────────────────┬──────────────────────────────────────┘
                              │ publishes metadata and artifacts
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│ CLI-Hub Registry / Package Manager                                  │
│ registry.json: 76 harness CLIs                                      │
│ public_registry.json: 20 public CLIs                                │
│ cli-hub: list/search/info/install/update/uninstall/launch           │
│ preview viewer: inspect/html/watch/open                             │
└─────────────────────────────┬──────────────────────────────────────┘
                              │ composes across tasks
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│ CLI Matrix Workflow Layer                                           │
│ matrix_registry.json: 5 matrices                                    │
│ capabilities → providers → recipes                                  │
│ matrix preflight/install/doctor/skill-only                          │
│ provider kinds: harness/public/python/native/API/agent-skill/web    │
└─────────────────────────────┬──────────────────────────────────────┘
                              │ actual execution
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│ Real Software / External Backends                                   │
│ Blender / LibreOffice / QGIS / OBS / ffmpeg / REST APIs / MCP / ... │
│ Output: real files + preview bundles + trajectory + JSON summaries  │
└────────────────────────────────────────────────────────────────────┘
```

### 底层技术架构

#### 最小架构内核

`Methodology Spec + Harness Template + Agent-facing Skill + Registry Control Plane + Preview Artifact Contract + Capability Matrix`

换句话说，CLI-Anything 能成立不是因为某个 Python 包很复杂，而是因为它把 Agent 操作软件拆成六个稳定契约：

1. **怎么生成工具**：HARNESS.md / commands。
2. **工具长什么样**：Click CLI + REPL + JSON + session + tests。
3. **Agent 怎么知道会用**：SKILL.md。
4. **工具怎么发现/安装**：registry + CLI-Hub。
5. **中间结果怎么看**：preview bundle / live trajectory。
6. **复杂任务怎么组合工具**：matrix capability / provider / recipe。

#### 核心抽象

| 抽象 | 职责 | 关键字段 / 方法 | 为什么重要 |
|------|------|----------------|------------|
| `HARNESS.md` | 把“如何把软件变成 Agent-native CLI”写成可执行方法论 | 7 phases、真实后端、TEST.md、SKILL、preview、auto-save/dry-run | 这是项目真正的编译器前端：输入给 coding agent，输出工程产物 |
| Per-software Harness | 一个软件一个可安装 CLI 包 | `cli_anything/<software>`、`<software>_cli.py`、`core/`、`utils/`、`tests/` | 把软件能力切成可测试、可安装、可 JSON 化的命令面 |
| `SKILL.md` | Agent-facing 能力契约 | YAML frontmatter、usage、commands、examples、constraints | CLI 的 `--help` 给人/程序看，SKILL.md 给 Agent 规划器看 |
| Registry Entry | CLI 分发元数据 | `name`、`display_name`、`category`、`install_cmd`、`entry_point`、`skill_md`、`source_url` | 让 Hub 能安装/更新/launch，也让 Agent 能检索工具 |
| CLI-Hub Installed State | 本地安装状态 | `~/.cli-hub/installed.json`、strategy、entry_point、install/update/uninstall result | 把“我有哪些工具可用”持久化，避免每轮重新猜 |
| Preview Bundle | 中间结果协议 | `manifest.json`、`summary.json`、`artifacts/`、`protocol_version`、`bundle_id` | 让视觉/视频/CAD/3D 类任务有可审计反馈，而不是盲改 |
| Matrix Capability | 多工具工作流的任务原子 | `capabilities[].id`、`intent`、`inputs`、`outputs`、`providers` | 把“做视频/做 CAD/做研究”拆成可路由能力，而不是固定流水线 |
| Provider | capability 的实现候选 | `kind`、`requires`、`cost_tier`、`quality_tier`、`offline`、`install_hint` | 让 Agent 能基于环境、成本、质量、凭证选择实现路径 |
| Recipe | 常见任务的 capability 组合 | `recipes[].capabilities_used` | 给复杂任务默认组合，但不强制固定流程 |

#### 控制面 / 数据面

**控制面：**

- `cli-anything-plugin/HARNESS.md`：生成规则与质量门槛。
- `commands/*.md`：给不同宿主 Agent 的操作入口。
- `registry.py` / `registry.json` / `public_registry.json`：工具发现与安装元数据。
- `matrix.py` / `matrix_registry.json`：capability/provider/recipe 选择。
- `matrix_skill.py`：把 matrix 渲染成可被 Agent 读的本地 SKILL.md。
- `installer.py`：安装策略、installed state、matrix state。
- GitHub Actions：root skill mirror、Codex skill installer、pages、PyPI publish、PR labeler。

**数据面：**

- 各 harness 的 `core/`、`utils/`、`<software>_cli.py`：真正读写项目文件、调真实软件、调用 API、导出 artifacts。
- `preview_bundle.py` / `preview.py`：写入和读取 preview artifact。
- 真实软件后端：Blender、LibreOffice、QGIS、OBS、ffmpeg、REST API、MCP server、native CLI 等。

这种分离很关键：控制面负责“Agent 应该怎么选、怎么装、怎么调用”；数据面负责“真实软件如何产生真实结果”。这也是它比简单脚本集合更有学习价值的地方。

#### 关键执行链路

**链路 A：生成新 harness**

```text
User supplies repo/path
  → Host Agent loads /cli-anything command
  → MUST read HARNESS.md
  → analyze target codebase/backend/native format
  → design command groups + state model + JSON outputs
  → implement Click CLI + REPL + core/utils/backend wrapper
  → write TEST.md plan before tests
  → implement unit/E2E/subprocess tests
  → generate package-local SKILL.md + repo-root canonical skill
  → add registry entry / install command
```

**链路 B：Agent 使用现有 CLI**

```text
Agent gets task
  → reads CLI-Hub meta-skill or matrix skill
  → cli-hub search/info/can/matrix preflight
  → choose CLI/provider based on task + env + cost + offline + credentials
  → cli-hub install / matrix install
  → read installed CLI's SKILL.md
  → call cli-anything-<software> --json ...
  → inspect outputs / preview bundle / summary
  → continue workflow or report artifact
```

**链路 C：Matrix 多工具工作流**

```text
Task: e.g. create video / research knowledge / CAD workflow
  → matrix search/info identifies matrix
  → recipe narrows capability set
  → preflight checks providers in local environment
  → install plan installs only cli-hub-managed CLIs
  → native/API/python/agent-skill providers remain explicit requirements
  → Agent chooses providers per capability
  → matrix skill injects installed skill paths
  → workflow composes multiple tools through files/artifacts/JSON summaries
```

#### 状态模型

| 状态类型 | 位置 | 谁读写 | 说明 |
|----------|------|--------|------|
| Registry cache | `~/.cli-hub/registry_cache.json`、`public_registry_cache.json`、`matrix_registry_cache.json` | CLI-Hub | 1 小时 TTL；网络失败时可 fallback cache；matrix 还可 fallback 本地 checkout |
| Installed state | `~/.cli-hub/installed.json` | `installer.py` / `cli-hub` | 记录已安装 CLI、entry point、strategy、install command |
| Matrix install state | `~/.cli-hub/matrix_state.json` | `matrix install/doctor/resume` | 支持失败重试和 doctor |
| Matrix skill | `~/.cli-hub/matrix/<name>/SKILL.md` | `matrix_skill.py` | 渲染本地 skill，并注入已安装 CLI skill path |
| Harness session | 每个 harness 自定义 session file / project state | harness core/session | 保存 project、modified flag、undo/redo、history，部分有 file lock |
| Preview artifacts | `<project>/.cli-anything/previews/...` 或 `~/.cli-anything/previews/...` | harness + CLI-Hub preview viewer | manifest/summary/artifacts/trajectory，供 Agent/Human 审阅 |
| External state | 真实软件项目文件、API resources、云服务、桌面 app | harness backend | 这是最终事实来源；CLI-Anything 不应伪造结果 |

#### 契约边界

- **Agent-facing 契约**：`SKILL.md`、plugin command markdown、matrix skill、CLI-Hub meta-skill。
- **CLI 契约**：Click command groups、`--json`、exit code、REPL、`--help`、`cli-anything-<software>` entry point。
- **测试契约**：`TEST.md` 必须先写 plan，再写结果；subprocess tests 必须模拟安装后命令；真实 backend E2E 不应伪造。
- **Preview 契约**：`preview-bundle/v1`、`preview-trajectory/v1`、`manifest.json`、`summary.json`、artifact descriptors。
- **Registry 契约**：registry entry 的 install/update/uninstall command、entry point、skill path、source_url、package manager。
- **Matrix 契约**：capability `inputs/outputs/providers`，provider `requires/cost_tier/quality_tier/offline`，recipe capability set。

#### 失败与降级模型

| 失败类型 | 当前机制 | 评价 |
|----------|----------|------|
| Registry 网络失败 | cache fallback；matrix 可 fallback local checkout | 合理，适合 Agent session 里减少网络脆弱性 |
| Provider 缺失 | `matrix preflight` 标出 missing binary/env/package；`--fix-hints` 给安装建议 | 很有价值；但 provider 选择仍需 Agent 判断，不能自动代替授权/成本决策 |
| Matrix install 部分失败 | exit code 3、summary、`--resume`、`doctor` | 比一键安装失败更可恢复 |
| Harness backend 不存在 | HARNESS 要求 fail loudly，不做假 fallback | 正确，避免“看似成功实际没调真实软件” |
| Preview 生成失败 | `status: partial/error`、warnings、summary | 协议层有降级空间，但各 harness 执行质量不均 |
| Registry install command 风险 | 声明 trusted registry，含 shell operator 时 `shell=True` | 实用但危险；生产化必须加 review/allowlist/sandbox |
| 测试/CI 不覆盖全仓 | 当前 workflows 偏 root skills、Codex installer、Pages、PyPI publish、PR labeler | 治理缺口；生态继续增长时应补全仓静态和分层测试 gate |

#### 可复刻设计不变量

1. **CLI 是 Agent 工具化的稳定窄腰**：不要让 Agent 直接点 GUI；把 GUI 背后的 domain action 映射成命令。
2. **真实后端不可替代**：生成中间文件、调用真实软件、验证真实输出；不要做 toy clone。
3. **Agent-facing 文档是运行时契约**：SKILL.md / prompt / command markdown 不是文档附属品，而是 Agent planner 的输入。
4. **每个工具必须有机器输出**：`--json`、exit code、错误字段、artifact path 是 Agent 自动化的基本语法。
5. **状态必须显式化**：session、undo/redo、autosave、dry-run、installed state、matrix state 都要有可读写位置。
6. **中间视觉结果必须 artifact 化**：preview bundle / trajectory 比截图描述更可审计、可缓存、可复现。
7. **复杂任务不要固定流水线，应拆 capability**：Matrix 的 capability/provider/recipe 比“安装所有工具然后让 Agent 猜”更可控。
8. **preflight 只报告事实，不替代决策**：成本、凭证、授权、质量、离线性必须进入 provider selection。
9. **registry 是供应链边界**：一旦 registry 能执行 install command，就必须像包管理器一样治理。
10. **生态增长必须配 CI gate**：harness 数量越多，越需要全仓 syntax、metadata consistency、security pattern、license provenance 自动检查。

---

## 架构解剖

### 目录结构

```text
CLI-Anything/
├── README.md                         # 总入口、平台安装、registry/test/architecture 展示
├── cli-anything-plugin/               # 方法论内核 + Claude Code plugin
│   ├── HARNESS.md                     # 7-phase SOP，真实后端/测试/preview 规则
│   ├── commands/                      # /cli-anything、refine、test、validate、list
│   ├── guides/                        # session locking、skill generation、auto-save、preview 等
│   ├── repl_skin.py                   # 统一 REPL 皮肤
│   ├── skill_generator.py             # Click CLI → SKILL.md
│   └── preview_bundle.py              # preview-bundle / trajectory helper
├── cli-hub/                           # PyPI 包：registry manager + preview + matrix control plane
│   ├── cli_hub/cli.py                 # click command entry；含 can/matrix/previews
│   ├── registry.py                    # fetch/cache/merge harness + public registry
│   ├── installer.py                   # pip/npm/uv/bundled/command + matrix install state
│   ├── matrix.py                      # matrix registry、capability search、preflight
│   ├── matrix_skill.py                # matrix skill 渲染与本地 skill path 注入
│   └── preview.py                     # bundle/live session text/html/watch viewer
├── registry.json                      # 76 个 harness CLI 条目
├── public_registry.json               # 20 个 public/third-party CLI 条目
├── matrix_registry.json               # 5 个 capability-based workflow matrix
├── cli-hub-matrix/                    # matrix SKILL.md + references/scripts
│   ├── video-creation/
│   ├── knowledge-research/
│   ├── 3d-cad/
│   ├── game-development/
│   └── image-design/
├── skills/                            # repo-root canonical skills
├── cli-hub-meta-skill/                # 让 Agent 发现/安装 CLI-Hub 的 meta skill
├── codex-skill/                       # Codex skill wrapper
├── hermes-skill/                      # Hermes Agent skill entry point
├── reasonix-skill/                    # Reasonix skill entry point
├── .pi-extension/                     # Pi extension
├── opencode-commands/                 # OpenCode commands
├── qoder-plugin/                      # Qodercli adapter
├── docs/                              # Hub site、preview protocol、matrix docs、demos
├── .github/workflows/                 # skill checks、Pages、PyPI、PR labeler
└── <software>/agent-harness/          # 大量软件 harness 示例
    ├── setup.py / pyproject.toml
    └── cli_anything/<software>/
        ├── <software>_cli.py
        ├── core/
        ├── utils/
        ├── tests/
        └── skills/SKILL.md
```

### 技术栈

- **主语言 / runtime**：Python 3.10+、Click 8+。
- **辅助语言**：JavaScript/TypeScript（PR labeler、部分插件/测试/前端）、C#、Swift、Shell、PowerShell、HTML。
- **打包**：各 harness 多为 `setup.py` / namespace package；`cli-anything-hub` 发布到 PyPI，当前 `setup.py` 版本 `0.4.0`，并在 build/sdist 时 vendoring `cli-hub-matrix/*` 数据进 wheel。
- **测试宣称**：README 写 `2,461` tests / `100% pass rate`；但测试数字内部存在 subtotal 口径不一致，本次未运行完整测试验证。
- **CI/CD**：root skills validation、Codex skill installer test、GitHub Pages deploy、PR labeler、PR labeler tests、CLI-Hub PyPI publish。未看到全仓 pytest / py_compile / registry security policy 级 gate。

### 模块依赖关系

```text
Host Agent adapter
  └─ reads HARNESS.md + commands/*.md / SKILL.md
      └─ creates or refines <software>/agent-harness
          ├─ Click CLI + REPL + --json
          ├─ core/session/project/export
          ├─ utils/backend wrappers → real software/API/subprocess/MCP
          ├─ preview_bundle helper → manifest/summary/artifacts
          ├─ tests/TEST.md + unit/e2e/subprocess
          └─ package-local + repo-root SKILL.md

registry.json / public_registry.json
  └─ cli-hub registry fetch/cache/merge
      └─ installer strategy: pip / npm / uv / bundled / command
          └─ installed.json state + launch

matrix_registry.json
  └─ matrix.py capability/provider/recipe search
      ├─ preflight env/binary/package checks
      ├─ install plan for managed CLIs
      ├─ matrix_state + resume/doctor
      └─ matrix_skill.py renders local matrix SKILL.md
```

### 扩展机制

- **新增 harness：** 按 `HARNESS.md` 生成真实后端 CLI、REPL、`--json`、测试计划、preview artifact 和 SKILL.md，再进入 registry。
- **新增 registry entry：** 通过 `registry.json` / `public_registry.json` 暴露 install strategy、launch command、preview 和 source metadata；CLI-Hub 负责 fetch/cache/merge。
- **新增 workflow matrix：** 在 `matrix_registry.json` 中定义 capability、provider、requirement、recipe，再用 `cli-hub-matrix/*/SKILL.md` 给 Agent 提供任务级选择面。
- **新增宿主入口：** 通过 Codex / Hermes / Reasonix / OpenCode / Pi / Qoder 等薄适配层复用同一套 HARNESS、registry 和 matrix 资产。
- **分发扩展：** `cli-hub` wheel vendoring matrix skill 数据，降低脱离 repo checkout 后的 matrix 发现和渲染成本。

### Matrix 层统计

`matrix_registry.json`（2026-06-11 schema v2）当前包含 5 个矩阵：

| Matrix | CLIs | Capabilities | Recipes | Known gaps |
|--------|------|--------------|---------|------------|
| `video-creation` | 14 | 19 | 7 | 4 |
| `knowledge-research` | 13 | 12 | 6 | 4 |
| `3d-cad` | 6 | 12 | 6 | 4 |
| `game-development` | 9 | 10 | 6 | 3 |
| `image-design` | 7 | 9 | 7 | 3 |

Provider 类型分布（静态统计）：

- `python`: 81
- `api`: 72
- `harness-cli`: 55
- `native`: 51
- `public-cli`: 27
- `agent-skill`: 5
- `agent-native`: 3
- `web-search`: 2
- `bundled-script`: 1

这说明 Matrix 不是“安装 5 套 CLI 包”，而是把本地 CLI、Python 包、native binary、云 API、Agent 技能、web search 统一进 provider selection 面。

---

## 质量与成熟度

### 代码质量

**优点：**

- 方法论层非常清晰，`HARNESS.md` 明确告诉 Agent 不要自由发挥。
- CLI-Hub 控制面抽象开始成型：registry cache、public registry merge、matrix cache、preflight、dry-run install plan、resume、doctor。
- Preview protocol 有明确 `manifest.json` / `summary.json` / `artifacts` 契约，且 viewer 只读已有 bundle，不混入实际生产。
- `matrix_skill.py` 对 skill 内容有多级 lookup：repo checkout → bundled package data → published URL → stub，考虑了安装形态差异。

**问题：**

- `cli-hub/cli_hub/preview.py` 虽已修复旧语法错误，但仍是 1,838 行大文件，承载 inspect/html/live/watch/open 多职责，后续容易继续膨胀。
- harness 层多代模板共存，license classifier、package metadata、测试结构、skill 路径、backend wrapper 风格不完全一致。
- `installer.py` 的 `_run_command()` 对 trusted registry 命令启用 `shell=True`，这是功能便利与供应链风险的典型 trade-off。
- README 测试汇总数字有口径不一致：`2,461` 总数与 `1,732 + 579 + 19 = 2,330` 不匹配。

### 测试

- README 仍宣称：`2,461` tests，`100% pass rate`，包含 unit、E2E、Node.js tests。
- **本次实测只做语法烟测**：
  - 本地 checkout：`1262` 个 `.py` 文件，`0` 个 syntax error；
  - `FETCH_HEAD` main tip：`1262` 个 `.py` 文件，`0` 个 syntax error。
- 本次**未**跑完整 pytest / harness E2E / build，因此不能独立确认 README 的总测试数与通过率。
- 静态观察：`cli-hub/tests/test_cli_hub.py`、`test_matrix_skill_dist.py` 已覆盖 matrix/installer/preview 相关新逻辑；README 中各 harness 测试数增长明显。
- 质量信号：项目非常强调 TEST.md 和真实后端 E2E，但 CI 尚未体现“全仓真实执行这些测试”的能力。

### CI/CD

当前 workflows：

- `check-root-skills.yml`：校验 package-local skill 到 root skills 镜像一致。
- `check-codex-skill.yml`：测试 Codex skill installer。
- `deploy-pages.yml`：发布 Hub 页面、registry、matrix/static assets。
- `pr-labeler.yml` / `pr-labeler-tests.yml`：PR 自动标签。
- `publish-cli-hub.yml`：`cli-hub/**` 变更触发 PyPI trusted publish。

缺口：

- 没看到全仓 `python -m py_compile` / pytest smoke / registry schema validation / install command safety lint。
- `publish-cli-hub.yml` 排除了 `cli-hub/tests/**` 和 `cli-hub/README.md`，发布流程本身不跑测试。
- 对一个会被 Agent 自动执行安装命令的 registry 来说，CI 还应包括：shell metacharacter policy、license metadata drift、SKILL frontmatter schema、entry_point existence、install command parsing、preview protocol schema。

### 文档质量

文档很强，甚至是项目主要资产：

- README 有完整 quick start、平台安装、测试结果、架构、命令、贡献入口。
- `HARNESS.md` 是高质量 agent engineering spec。
- `docs/PREVIEW_PROTOCOL.md` 是明确的 artifact protocol。
- `cli-hub-matrix/*/SKILL.md` 把复杂任务中的 provider selection 写得很细，尤其 video-creation 对素材授权、音频源、caption、sound design、API 成本都有具体约束。

不足：

- README 营销密度高，真实边界需要读源码、SECURITY、issue/PR 才能看清。
- 测试数字和成熟度表述可能过度自信。
- registry / matrix 的信任边界和 install command 审核规则还没有被提升到足够显眼的位置。

### Issue / PR 健康度

当前口径：

- GitHub repo API：`open_issues_count=72`（含 PR）。
- GitHub search：open PR 30、open issues 42、merged PRs 164、closed issues 69。
- 近期 open issue/PR 样例：
  - #376 `fix: the cli-hub analytics module contains a hardcod... in analytics.py`
  - #374 `feat: add cli-anything-meerk40t (MeerK40t laser software)`
  - #373 `Harden cli-hub: registry install_cmd strings are shell-executed...`
  - #371 `registry: add browser-cdp (raw CDP, no extensions)`
  - #369 `RPG Maker XP harness + contract question`
  - #366 `feat(eval): cross-harness eval/benchmark framework (cli-anything-eval)`
- 信号判断：维护非常活跃，但 issue 类型已经从“新增 harness”扩展到 **registry 安全、preview/installer 兼容、analytics 隐私、跨 harness benchmark**。这说明项目正在从 demo 生态迈向更像平台的治理阶段。

---

## 社区与生态

### 社区评价

- 2026-05-19 旧快照：36,696 stars / 3,560 forks。
- 2026-06-15 快照：43,075 stars / 4,038 forks。
- 2026-07-08 快照：44,960 stars / 4,208 forks。
- 从 6 月中到 7 月初，增长放缓但仍在爬升，说明项目已从“爆发式认知传播”进入“继续吸星 + 开始承受治理摩擦”的阶段。
- README 挂出的 arXiv 技术报告 `arXiv:2606.03854` 继续强化它的 methodology / research narrative；而 `cli-hub analytics`、registry 安全 issue、benchmark PR 则说明它同时在向产品化控制面演进。

### 衍生项目 / 插件生态

- **官方内核**：HARNESS.md、CLI-Hub、Preview Protocol、Matrix Registry。
- **宿主适配**：Claude Code、Pi、OpenCode、Codex、Hermes、Reasonix、Qodercli、GitHub Copilot CLI。
- **Harness 生态**：76 个 in-repo/registry harness，20 个 public CLI，8 个 external `source_url` harness。
- **Matrix 生态**：video creation、knowledge research、3D/CAD、game development、image design，已经从“工具列表”进入“任务能力图谱”。

### 竞品对比

| 项目 | 定位 | 与 CLI-Anything 的关系 |
|------|------|------------------------|
| MCP servers | 标准工具协议和 server 集合 | 协议层互补/部分替代。MCP 解决 tool calling 标准，CLI-Anything 解决如何把真实软件包装成 CLI + skill + tests。 |
| Composio | SaaS/API integration marketplace | 更成熟的 API app marketplace；CLI-Anything 更偏本地软件、桌面软件、真实后端、agent-generated harness。 |
| Playwright MCP / Browser automation | 浏览器/DOM 自动化 | 对 web app 更直接；CLI-Anything 的 Browser/DOMShell harness 是相邻方向，但目标更广。 |
| UI-TARS / computer-use agents | GUI 视觉操作 | 更通用但更脆弱；CLI-Anything 更窄但更可审计、可测试。 |
| Superpowers / Everything Claude Code | Agent skill/workflow substrate | 它们塑造 Agent 行为；CLI-Anything 扩展 Agent 可调用软件面，可叠加。 |
| OpenHands / Cline / Codex / Claude Code | Agent 平台 | 平台层，不是直接竞品；CLI-Anything 可成为这些平台的工具生态。 |

最强直接竞品不是某个单 repo，而是 **MCP server 生态 + 包管理/工具 registry + Agent skill marketplace** 的组合。CLI-Anything 的独特性在于把“生成、测试、技能化、预览、注册、矩阵组合”打成一个端到端 methodology。

---

## 关键代码走读

### 1. `cli-anything-plugin/HARNESS.md` — 方法论内核

- 定义七阶段：Codebase Analysis → CLI Architecture Design → Implementation → Test Planning → Test Implementation → Test Documentation → SKILL.md → Publishing。
- 强制真实后端：不允许用 Python toy clone 代替真实软件。
- 强制 state model：session、undo/redo、file locking、auto-save、dry-run。
- 强制测试思路：先 TEST.md 计划，再实现 unit/E2E/subprocess，真实 backend 缺失应 fail 而不是伪通过。
- 价值：这是“给 coding agent 的工程编译规范”，是项目最值得复用的资产。

### 2. `cli-anything-plugin/commands/cli-anything.md` — 主构建命令

- 第一行关键要求：**Before doing anything else, you MUST read `./HARNESS.md`.**
- 不接受裸软件名，必须给本地路径或 GitHub repo，避免 Agent 无源猜测。
- 输出结构固定为 `<software>/agent-harness/cli_anything/<software>/...`。
- success criteria 明确到 `--json`、subprocess tests、SKILL.md、local install、auto-save/dry-run。

### 3. `cli-anything-plugin/skill_generator.py` — CLI 到 Agent skill 的桥

- 从 `agent-harness/cli_anything/<software>`、README、setup.py、Click decorators 提取 metadata。
- canonical skill name 使用 repo-root `cli-anything-<software-dir>`。
- 用正则解析 Click group/command/docstring，生成 command groups 和 examples。
- 这是“代码执行面 → Agent 认知面”的桥梁。

### 4. `cli-anything-plugin/preview_bundle.py` + `docs/PREVIEW_PROTOCOL.md` — Preview artifact protocol

- 定义 `preview-bundle/v1` 和 `preview-trajectory/v1`。
- bundle 目录包含 `manifest.json`、`summary.json`、`artifacts/`。
- `bundle_id` 由 UTC timestamp + cache key + recipe 组成，利于缓存/复现。
- 它没有试图做通用 GUI streaming，而是把中间结果转为 artifact contract，设计选择正确。

### 5. `cli-hub/cli_hub/registry.py` — Registry control plane

- 从 GitHub Pages 拉 `registry.json` 和 `public_registry.json`。
- 本地 `~/.cli-hub` cache，TTL 1 小时。
- merge 时给 entries 标 `_source = harness/public`，让 installer 按来源选择策略。
- 简单但够用；生产化需要签名/lockfile/provenance。

### 6. `cli-hub/cli_hub/installer.py` — 安装策略与风险边界

- 支持 pip、npm、uv、bundled、generic command。
- 记录 `installed.json` 和 `matrix_state.json`。
- `_run_command()` 遇到 `|`、`&&`、`;`、`` ` ``、`$(` 时启用 `shell=True`，以支持 script install。
- 注释写明“Commands come from the trusted registry, not from user input”。这句话就是核心风险：registry 必须被严格审核。

### 7. `cli-hub/cli_hub/matrix.py` — Capability matrix 引擎

- 拉取/缓存 `matrix_registry.json`，失败时 fallback cache / local checkout。
- 提供 `search_matrices`、`preflight_matrix`、`check_provider_requirements`。
- Provider requirement 可检查 env、binary、Python package。
- Agent-installable skill provider 被单独处理，不算 available/missing。
- 这是 CLI-Anything 从“工具市场”升级成“工作流能力图谱”的核心文件。

### 8. `cli-hub/cli_hub/matrix_skill.py` — Matrix skill 渲染器

- 把 `cli-hub-matrix/<name>/SKILL.md` 渲染到 `~/.cli-hub/matrix/<name>/SKILL.md`。
- 同步 references/scripts，保证 skill 内相对链接可用。
- 注入已安装 CLI 的 canonical/local skill path，让 Agent 能从 matrix 跳到具体工具 skill。
- 这解决了多工具 workflow 中“总 skill 如何指向成员工具 skill”的问题。

### 9. `matrix_registry.json` + `cli-hub-matrix/video-creation/SKILL.md` — 新的工作流层

- 不再是“先装所有工具再开干”，而是 capability/provider/recipe。
- `video-creation` 把 storyboard、source triage、video/audio search/download、capture/generate、caption、sound design、assembly、render doctor、review 等拆开。
- Provider 选择规则明确：preflight 是事实报告，不是 provider selector；不能静默调用付费 API；授权不清必须问。
- 这套写法对 Agent 工作流设计非常值得借鉴。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 5 | 从 harness 生成、registry、hub、preview、skill、多宿主，到 matrix workflow，覆盖面继续扩大。 |
| 代码质量 | 3 | 控制面抽象增强，旧 SyntaxError 已修；但大文件、多代 harness、license metadata、install shell 风险仍明显。 |
| 文档质量 | 5 | HARNESS、Preview Protocol、Matrix Skill、README 都是高密度 agent-facing 文档。 |
| 社区活跃度 | 4 | star/fork/PR 增长很强，贡献者多；但项目过新，真实生产采用和治理沉淀仍需时间。 |
| 架构设计 | 5 | CLI narrow waist + SKILL + Preview artifact + Capability Matrix 的组合很有原创性和可迁移价值。 |
| 学习价值 | 5 | 对 Agent-native software、工具分发、预览反馈、多工具 provider selection 都很值得学。 |
| 可借鉴度 | 5 | HARNESS.md、SKILL 生成、Preview Protocol、Matrix capability schema 可直接迁移到内部工具平台。 |

**总分：32/35**

---

## 总结

### 一句话评价

**CLI-Anything 已经从“把软件包装成 CLI 的 demo 集合”进化成“Agent 时代软件工具面的实验性操作系统”：用 HARNESS 规范生成工具，用 SKILL 让 Agent 理解工具，用 CLI-Hub 分发工具，用 Preview artifact 反馈中间结果，用 Matrix 把多个工具组合成任务能力图谱。**

### 值得学什么

1. **Agent-native interface first**：先为 Agent 定义稳定命令面，而不是让 Agent 适应人类 GUI。
2. **Methodology as executable spec**：HARNESS.md 这种“给 Agent 执行的规范”比普通 README 更接近未来工程模板。
3. **Skill as cognitive API**：SKILL.md 是 Agent 的认知接口，和 CLI entry point 同等重要。
4. **Preview artifact contract**：视觉/视频/CAD/3D 任务必须把中间结果变成可审计 artifact。
5. **Capability matrix**：复杂任务不应固定流水线，而应拆 capability，再按 provider 的 cost/quality/offline/credentials 选择。
6. **Fail loudly with real backend**：不要用假实现骗过 Agent；真实软件缺失就明确失败。

### 谁应该用

- 想把内部工具、专业软件、桌面软件、API 服务变成 Agent-callable CLI 的团队。
- 做 Agent 产品、MCP 工具、内容生产 pipeline、自动化 QA、工具平台的人。
- 已使用 Claude Code / Codex / Hermes / OpenCode，想扩展工具面的开发者。
- 想研究 Agent-native software、artifact feedback loop、workflow matrix 的工程师。

### 谁不应该直接用

- 需要强安全、强合规、强 SLA、供应链审计完整的企业场景。
- 目标软件没有稳定 API/CLI/脚本接口，又期望一键自动化完整能力的场景。
- 不愿维护真实后端、依赖软件、E2E 环境、registry 审核、凭证隔离的人。
- 期望 public registry 像成熟包管理器一样有签名、沙箱、license provenance 的团队。

### 下一步

1. **学习路线**：精读 `HARNESS.md`、`docs/PREVIEW_PROTOCOL.md`、`cli-hub/cli_hub/matrix.py`、`matrix_skill.py`、`cli-hub-matrix/video-creation/SKILL.md`。
2. **PoC 路线**：选一个内部工具，按 CLI-Anything 规范做 `--json + session + SKILL.md + TEST.md + preview/summary artifact`。
3. **产品化路线**：把它抽象成内部 “Tool Harness Kit”：统一 harness 模板、内部 registry、install allowlist、preflight、doctor、artifact protocol、skill 发布。
4. **贡献切入**：优先补治理类 PR：README 测试数口径修正、registry schema validation、install command safety lint、全仓 py_compile/metadata CI、license classifier 一致性。
