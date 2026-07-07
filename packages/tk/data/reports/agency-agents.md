# agency-agents

> 一句话定位：**agency-agents 是一个跨宿主 AI 专家角色库：用 233 个 Markdown agent、16 个业务 division、14 个工具安装目标、转换/安装脚本和 Hermes lazy-router plugin，把 Claude Code、Codex、Cursor、Gemini、OpenCode、Hermes 等宿主变成“按需调用专家团队”。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `msitarzewski/agency-agents` |
| URL | https://github.com/msitarzewski/agency-agents |
| Star | 125,636（2026-07-03 查询） |
| Fork | 20,385（2026-07-03 查询） |
| Watchers | 928（2026-07-03 查询） |
| 许可证 | MIT |
| 主要语言 | Shell / Markdown / Python（GitHub API 主语言为 Shell；核心资产是 Markdown agent） |
| 默认分支 | `main` |
| 首次提交 | 2025-10-13 `98eea4c Initial commit: The Agency - 51 AI Specialist Agents` |
| 最近提交 | 2026-07-01 `fc5a192 Merge pull request #642 from msitarzewski/feat/antigravity-config-skills` |
| 最新 Release / Tag | 无 GitHub latest release；本地无 tag（2026-07-03 查询） |
| 贡献者数 | GitHub contributors API 估算 87；本地 shortlog 显示 Michael Sitarzewski 163 commits 居首 |
| Open Issues / PRs | 44 issues / 54 PRs（GitHub `open_issues_count=98` 含 PR，2026-07-03 搜索 API 拆分） |
| Closed Issues / Merged PRs | 77 issues / 182 merged PRs（2026-07-03 查询） |
| 本地规模 | 300 tracked files；277 Markdown；233 agent files；约 76,823 行 tracked text；agent 正文约 432,972 words |
| 分类 | AI Agent Role Roster / Cross-Harness Agent Workflow Asset Library |
| 分析日期 | 2026-07-03 |
| 分析边界 | 静态源码 / README / 脚本 / CI / Git 历史 / GitHub API；未安装依赖，未运行转换、安装、测试或构建 |

---

## 场景一：是否值得采用

### 解决的问题

agency-agents 解决的不是“模型不会写代码”，而是 **agent 宿主已经有执行能力，但缺少稳定、可复用、可组合的专家角色上下文**。

常见问题是：

1. 用户临时写“你是前端专家 / 营销专家 / QA 专家”，角色深度和输出标准不可复用。
2. Claude Code、Codex、Cursor、OpenCode、Gemini CLI 等宿主各有 agent/skill/rules 格式，角色资产很难跨平台同步。
3. 全量把 200+ agent 当 skills 注入，会污染启动上下文和工具/技能目录，尤其对 Hermes 这种 prompt cache 敏感的长会话不友好。
4. 多 agent 协作容易只有“角色列表”，缺少 phase、handoff、QA gate、retry limit 等组织协议。
5. 社区贡献新 agent 时容易出现 frontmatter 缺失、division 漂移、工具清单漂移、find-replace reskin 等质量问题。

它的答案是：

```text
Markdown agent corpus
  + divisions/tools canonical JSON
  + deterministic converters
  + installer / interactive selector / dry-run
  + CI consistency gates
  + Hermes lazy-router plugin
  + NEXUS coordination playbooks
```

目标用户：

- 已经使用 Claude Code / Codex / Cursor / OpenCode / Gemini / Copilot / Hermes 的个人开发者。
- 想快速获得一批可复制专家 persona 的 AI coding / AI ops / growth / product operator。
- 想把内部角色库跨多个 agent harness 分发的小团队。
- 想研究“prompt asset library 如何产品化、分发、校验和社区治理”的开发者。

### 核心能力与边界

**能做什么：**

- 提供 233 个源码 agent，分布在 16 个 division：engineering、marketing、specialized、testing、security、GIS、finance、support 等。
- 每个 agent 以 YAML frontmatter + Markdown body 表达：`name`、`description`、`color`、`emoji`、`vibe` 和专家指令正文。
- 通过 `scripts/convert.sh` 生成多宿主格式：Antigravity/Gemini skill、Codex TOML、Cursor MDC、OpenCode agent、Qwen/Kimi/OpenClaw/Aider/Windsurf 等。
- 通过 `scripts/install.sh` 自动探测宿主、交互选择 tool/division/agent，并支持 `--dry-run`、`--division`、`--agent`、`--agents-file`、`--link`、`--path`、`--parallel`。
- `tools.json` 把 14 个宿主的格式、安装机制和目标路径作为单一事实源；`divisions.json` 把 16 个 division 作为单一事实源。
- Hermes 集成不是 233 个 skills，而是一个 `agency-agents-router` plugin：只暴露 4 个工具，agent roster 存在 `data/agents.json`，按需 search/inspect/load/delegate。
- `strategy/` 下提供 NEXUS playbook：用阶段、handoff、quality gate 和 Dev↔QA loop 组织多 agent 协作，而不是只堆角色。
- CI 对 agent frontmatter、division/tool single source of truth、原创性相似度做基础门禁。

**不能做什么 / 边界：**

- 不是独立 coding agent runtime：没有模型调用、tool loop、provider routing、session DB、权限沙箱或 GUI 执行器。
- 不是硬策略引擎：agent 是否遵守 persona、handoff、quality gate，取决于宿主和模型遵守 prompt 的程度。
- 不提供任务状态数据库；NEXUS playbook 是 operational doctrine，不是可执行 workflow engine。
- 不保证各宿主 runtime parity。Claude Code / Copilot / Codex 等是 per-agent 文件；Aider/Windsurf 是 roster 文件；Hermes 是 lazy-router plugin；它们的激活、上下文成本和强制力不同。
- 不适合盲目全量安装到所有宿主：233 个 agent 的体量会带来选择成本、文件膨胀和 host-specific cap 风险。
- 当前文档存在轻微漂移：README / Hermes integration README 仍写 232 agents，而当前源码扫描为 233 agents。

**与竞品差异：**

| 维度 | agency-agents | superpowers | ECC | compound-engineering-plugin | wshobson/agents |
|------|---------------|-------------|-----|-----------------------------|-----------------|
| 层级 | 专家角色库 + 多宿主转换/安装 + 协作 playbook | 工程纪律 skills / bootstrap | cross-harness workflow substrate | 团队 workflow + 多 reviewer + compound loop | multi-harness agent plugin marketplace |
| 最小内核 | Markdown agent corpus + converter + installer + lazy router | Skills + hooks/adapters | manifests + profiles + hooks + installer | Claude-compatible plugin assets + converters | agent packs + harness adapters |
| 强项 | 角色覆盖面极广，非工程角色也多；Hermes 懒加载设计好 | TDD/plan/debug/review 纪律强 | 安装治理、安全 CI、profiles 更强 | 团队工程闭环与多 agent review 更强 | 更像 agent marketplace，侧重多 harness plugin 生态 |
| 主要风险 | soft prompt、角色质量参差、全量安装上下文/文件成本 | 不提供丰富专家角色库 | 重、安装副作用和复杂度高 | 上下文成本高，Claude-first | 需另做质量与治理评估 |
| 推荐用途 | 按需专家选择、角色库素材、Hermes lazy specialist router | 提升单次编码纪律 | 内部 workflow substrate | 团队 review / compounding | 寻找多宿主 agent marketplace 形态 |

### 集成成本

- **依赖链低。** 仓库没有 Node/Python package runtime；核心转换/安装靠 Bash + 少量 Python 标准库。
- **安装副作用真实存在。** `install.sh` 会写入 `~/.claude/agents`、`~/.codex/agents`、`.cursor/rules`、`~/.gemini/config/skills`、`~/.hermes/plugins/agency-agents-router` 等宿主目录；Hermes 安装还会改 `config.yaml` 的 `plugins.enabled` 并创建 backup。
- **安全试用路径明确。** 先跑 `./scripts/install.sh --tool <tool> --dry-run`；再用 `--division` / `--agent` 缩小范围；Hermes 场景优先用 `--tool hermes`，不要把全部 agents 加进 `skills.external_dirs`。
- **学习成本中等。** 单个 agent 用法简单；真正用好需要理解 division、agent selection、host-specific activation、NEXUS playbook 和质量门禁。
- **从零到 demo。** 对 Claude Code / Codex / Gemini / Cursor 等文件型宿主，生成 + 安装通常是分钟级；Hermes 需要生成 plugin、安装到 `plugins/`、启用并重启 session/gateway 才发现工具。
- **生产推广成本。** 小团队可以先挑 5-20 个核心 agents；企业推广前需要角色审核、prompt injection 审查、安装目录 ownership、版本同步和禁用/回滚策略。

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | 🟢 低 | MIT；核心是 Markdown、Shell、Python 标准库脚本。 |
| Bus factor | 🟡 中 | 贡献者 API 估算 87，但本地 shortlog 显示 Michael Sitarzewski 163 commits 明显主导。 |
| 供应商锁定 | 🟢 低 | agent 是 Markdown，转换目标多，Hermes plugin 也可 fork；但 runtime enforcement 取决于具体宿主。 |
| 维护趋势 | 🟢 活跃 | 2026-07-01 仍有 merge；2026-06 下旬多条 docs/integration/agent PR 合并。 |
| 社区热度 | 🟢 很高 | 125k+ stars、20k+ forks；派生/翻译仓库活跃，`jnMetaCode/agency-agents-zh` 也有 16k+ stars。 |
| Backlog 压力 | 🟡 中高 | 44 open issues + 54 open PRs；热度高会带来重复 agent、路径漂移、工具适配请求。 |
| 安装攻击面 | 🟡 中 | `install.sh` 写宿主 home/config；Hermes installer 会 `rm -rf` 目标 plugin dir 后复制。建议只在隔离 profile / dry-run 后启用。 |
| Prompt 安全 | 🟡 中 | `SECURITY.md` 明确 agent 文件非 executable、禁止 secrets、提醒 suspicious prompt injection；但 prompt 资产仍需人工 review。 |
| 文档漂移 | 🟡 中 | 当前 source scan 为 233 agents；README/集成文档仍有 232 count。`check-agent-originality.sh` 的扫描目录也与 `divisions.json` 不完全一致。 |

### 结论

**🟢 推荐采用（个人 / 小团队按需专家库；Hermes 场景优先 lazy-router） / 🟡 团队生产化前隔离试点。**

理由：

- agency-agents 的价值不是“又一堆 prompt”，而是把 agent persona 做成了可版本控制、可 lint、可转换、可安装、可按需加载的角色资产库。
- 对 Hermes 用户，`agency-agents-router` 是正确路线：固定 4 个工具 + 磁盘 JSON roster + 按需 load/delegate，避免 233 个 skills 污染初始上下文和 prompt cache。
- 对团队，不能直接全量采用：先挑选高价值 division/agent，做 prompt review，再决定是否纳入默认工作流。
- 如果目标是工程纪律、TDD、debugging、review gating，superpowers / compound-engineering-plugin / ECC 更强；agency-agents 更适合作为“专家池”和“角色素材库”。

---

## 场景二：技术架构学习

### 核心架构图

```text
┌──────────────────────────────────────────────────────────────────────┐
│                         Source Agent Corpus                          │
│  16 divisions · 233 Markdown agents                                  │
│  frontmatter(name/description/color/emoji/vibe) + instruction body    │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ scanned by
┌───────────────────────────────▼──────────────────────────────────────┐
│                         Canonical Catalog Plane                      │
│  divisions.json                         tools.json                    │
│  - source-of-truth for divisions        - source-of-truth for tools    │
│  - label/icon/color                     - format/installKind/dest      │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ guarded by CI
┌───────────────────────────────▼──────────────────────────────────────┐
│                         Quality Gate Plane                           │
│  lint-agents.sh · check-divisions.sh · check-tools.sh                 │
│  check-agent-originality.sh · GitHub Actions                          │
│  - frontmatter/sections/LF                                            │
│  - tool/division drift                                                │
│  - duplicate/re-skin detection                                        │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ transforms through
┌───────────────────────────────▼──────────────────────────────────────┐
│                         Converter Plane                              │
│  scripts/convert.sh · build-hermes-plugin.py                         │
│  - per-agent files: codex/cursor/opencode/qwen/kimi/...              │
│  - roster files: aider/windsurf                                      │
│  - plugin bundle: Hermes agency-agents-router                         │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ installed by
┌───────────────────────────────▼──────────────────────────────────────┐
│                         Installer / Selection Plane                  │
│  scripts/install.sh                                                  │
│  --dry-run · --tool · --division · --agent · --agents-file · --link    │
│  detect host tools · copy/symlink artifacts · update host config      │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ consumed by
┌───────────────────────────────▼──────────────────────────────────────┐
│                         Host Runtime Layer                           │
│  Claude Code · Codex · Cursor · Gemini · OpenCode · Hermes · others   │
│  host owns LLM loop, tools, session, permissions, UI                  │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ coordinated by optional docs
┌───────────────────────────────▼──────────────────────────────────────┐
│                         NEXUS Strategy Layer                         │
│  phase playbooks · handoff templates · Dev↔QA loops · scenario modes  │
└──────────────────────────────────────────────────────────────────────┘
```

### 底层技术架构

#### 最小架构内核

```text
Frontmatter Agent Corpus
  + Canonical Division/Tool Registries
  + Deterministic Format Converters
  + Host-Aware Installer/Selector
  + CI Drift/Originality Gates
  + Optional Lazy Runtime Router
```

如果重写一个同类系统，最小可复刻组合不是“写很多 prompt”，而是：**agent 资产标准化、目标宿主标准化、转换确定性、安装可预览、质量门禁可自动化、运行时按需加载。**

#### 核心抽象

| 抽象 | 源码位置 | 职责 | 关键字段 / 方法 | 为什么重要 |
|------|----------|------|-----------------|------------|
| Agent File | `academic/*.md` 等 16 个 division | 单个专家角色的 source of truth | frontmatter: `name`/`description`/`color`/`emoji`/`vibe`; body: persona/workflow/deliverables | 把角色从临时 prompt 变成可审查、可转换、可版本控制资产 |
| Division Registry | `divisions.json` | division 名称、显示标签、图标、颜色的单一事实源 | `divisions.<id>.label/icon/color` | 避免目录、README、app、lint、converter 各自维护 division 列表 |
| Tool Registry | `tools.json` | 14 个宿主的安装目标和格式事实源 | `format`、`installKind`、`dest.user`、`dest.project` | 把“支持某宿主”变成机器可检查契约，而非 README 文案 |
| Converter | `scripts/convert.sh` | 从 agent corpus 生成各宿主格式 | `convert_codex`、`convert_cursor`、`convert_openclaw`、`accumulate_aider`、`run_conversions` | 让同一角色源资产跨工具复用，降低多平台漂移 |
| Hermes Router Builder | `scripts/build-hermes-plugin.py` | 生成 `agency-agents-router` plugin | `collect_agents`、`agents.json`、`agency_agents_search/load/delegate` | 解决全量 skills 注入导致的上下文膨胀，是本仓库最值得借鉴的架构点 |
| Installer Selection Engine | `scripts/install.sh` | 探测工具、筛选 division/agent、dry-run、复制/链接安装 | `ALL_TOOLS`、`build_selection`、`install_tool`、`install_hermes` | 把大角色库变成可控分发，而不是一键污染所有宿主 |
| Quality Gate Scripts | `scripts/lint-agents.sh`、`check-*.sh` | frontmatter、division/tool 漂移、原创性相似度检查 | required fields、single-source comparisons、shingle overlap threshold | 社区贡献规模上来后，prompt 库必须有软件工程门禁 |
| NEXUS Playbook | `strategy/*`、`specialized/agents-orchestrator.md` | 多 agent 协作协议 | phase playbooks、handoff templates、retry limits、QA gates | 从“专家列表”提升到“专家网络”的协作层，但目前主要是文档协议 |

#### 控制面 / 数据面

- **控制面：**
  - `divisions.json`、`tools.json` 决定系统的可见分类、工具目标、安装机制和目标路径。
  - `scripts/convert.sh` 决定每个目标格式怎么生成。
  - `scripts/install.sh` 决定安装选择、host detection、dry-run、copy/symlink、config mutation。
  - `.github/workflows/*.yml` 决定贡献门禁何时运行。
  - `strategy/` 和 `agents-orchestrator.md` 决定多 agent 协作的 phase / handoff / QA gate。

- **数据面：**
  - 233 个 Markdown agent body 是真实 prompt 数据。
  - `integrations/*` 是 converter 生成或安装消耗的数据产物。
  - `integrations/hermes/agency-agents-router/data/agents.json` 是 Hermes 插件运行时查询的数据面。
  - 用户宿主目录（如 `~/.codex/agents`、`~/.hermes/plugins`）是安装后的外部状态。

- **执行面：**
  - 真实 LLM 调用、工具执行、会话管理、安全权限全部由宿主负责。
  - agency-agents 只提供角色上下文、转换/安装和可选 Hermes router tool surface。

#### 关键执行链路

**链路 1：普通宿主转换**

```text
scripts/convert.sh --tool codex
  ↓
run_conversions(tool=codex)
  ↓
scan AGENT_DIRS/*.md, require first line '---', read name/description/body
  ↓
convert_codex(file)
  ↓
integrations/codex/agents/<slug>.toml
  ↓
scripts/install.sh --tool codex
  ↓
copy to ~/.codex/agents/<slug>.toml or selected path
```

**链路 2：Hermes lazy-router**

```text
scripts/convert.sh --tool hermes
  ↓
build-hermes-plugin.py
  ↓
collect_agents() -> parse frontmatter/body -> agents.json
  ↓
generate plugin.yaml + __init__.py + data/agents.json
  ↓
scripts/install.sh --tool hermes
  ↓
copy plugin to ${HERMES_HOME:-~/.hermes}/plugins/agency-agents-router
  ↓
ensure_hermes_plugin_enabled() mutates config.yaml plugins.enabled
  ↓
Hermes restart discovers 4 tools
  ↓
agency_agents_search -> inspect/load/delegate only selected specialist
```

**链路 3：PR 质量门禁**

```text
pull_request touching agent division
  ↓
.github/workflows/lint-agents.yml
  ↓
git diff changed agent files
  ↓
scripts/lint-agents.sh changed files
  - YAML frontmatter exists
  - required name/description/color fields
  - recommended sections warn
  - LF line endings
  ↓
scripts/check-agent-originality.sh changed files
  - entity-neutralized 8-word shingle overlap
  - warn >= 20%, fail >= 40%
```

**链路 4：division/tool drift detection**

```text
push / pull_request
  ↓
check-divisions.yml / check-tools.yml
  ↓
divisions.json compared with directories, convert.sh, lint-agents.sh, workflow filters
  ↓
tools.json compared with install.sh ALL_TOOLS and convert.sh valid_tools
  ↓
fail if source-of-truth drift is detected
```

#### 状态模型

| 状态类型 | 位置 | 谁读写 | 生命周期 / 一致性规则 |
|----------|------|--------|------------------------|
| 源 agent 状态 | 16 个 top-level division 下的 `.md` | 贡献者写；converter/linter 读 | Git 管理；frontmatter 是机器契约；正文是 prompt 契约 |
| division/tool catalog | `divisions.json`、`tools.json` | 维护者写；scripts/CI/app/installer 读 | JSON 是 source of truth；CI 检查脚本/README/目录是否漂移 |
| 生成产物 | `integrations/*` | `convert.sh` / `build-hermes-plugin.py` 写；`install.sh` 读 | 大部分 agent/skill 生成物被 `.gitignore` 排除；README 级文档保留 |
| 安装状态 | 用户/项目宿主目录 | `install.sh` 写；宿主 runtime 读 | 外部状态，不在本仓库管理；Hermes 会备份 config 后插入 plugin |
| Hermes runtime roster | `agency-agents-router/data/agents.json` + `_AGENTS` cache | plugin 首次调用读；进程内缓存 | session/gateway 重启后发现新 tool surface；roster 搜索按需加载 |
| CI 状态 | GitHub Actions runs | GitHub Actions 写；维护者读 | main push check-tools/check-divisions 最近成功；外部 PR runs 可处于 action_required |
| NEXUS 协作状态 | `strategy/*` 文档 / 用户项目任务文件 | agent/用户按文档写 | 当前是 prompt/process contract，不是自动状态机 |

#### 契约边界

- **内部契约：**
  - agent file 必须以 `---` 开头，frontmatter 至少有 `name`、`description`、`color`。
  - `divisions.json` 必须与实际 source-agent 目录、`convert.sh AGENT_DIRS`、`lint-agents.sh AGENT_DIRS`、workflow path filters 一致。
  - `tools.json` 必须与 `install.sh ALL_TOOLS`、`convert.sh valid_tools` 一致，并声明 `format/installKind/dest`。

- **外部 CLI 契约：**
  - `./scripts/convert.sh --tool <tool|all> [--out] [--parallel] [--jobs]`
  - `./scripts/install.sh --tool <tool|all> [--division] [--agent] [--agents-file] [--dry-run] [--link] [--path]`
  - 支持 per-agent、roster、plugin 三类 installKind。

- **Agent-facing 契约：**
  - 每个 agent body 是 persona + workflow + deliverables + success metrics 的 prompt contract。
  - NEXUS playbook 是 phase/handoff/QA gate contract。
  - Hermes router 以 tool schema 暴露：`agency_agents_search`、`agency_agents_inspect`、`agency_agents_load`、`agency_agents_delegate`。

- **Host runtime 契约：**
  - 宿主负责 agent 激活、LLM loop、tool permission、session、UI、MCP/插件发现。
  - agency-agents 只承诺写入宿主能识别的文件/插件格式。

#### 失败与降级模型

| 失败类型 | 检测方式 | 系统行为 | 降级 / 修复动作 |
|----------|----------|----------|------------------|
| agent frontmatter 缺失 | `lint-agents.sh` | PR lint fail 或本地 lint fail | 补 `name/description/color`，统一 LF line ending |
| division 漂移 | `check-divisions.sh` | CI fail | 更新 `divisions.json`、目录、`AGENT_DIRS`、workflow path filters |
| tool 漂移 | `check-tools.sh` | CI fail | 更新 `tools.json`、`ALL_TOOLS`、`valid_tools`、converter/installer |
| 重复/reskin agent | `check-agent-originality.sh` | warn/fail | 重写 agent body，增加真实差异；注意当前脚本目录列表有漂移风险 |
| 目标宿主未安装 | `install.sh` detection | interactive/auto 模式不选择该工具 | `--tool <name>` 强制安装，或先安装宿主 |
| 生成产物缺失 | `ensure_converted` / installer file checks | 自动 convert 或报错 | 先 `./scripts/convert.sh --tool <tool>` |
| 宿主路径/权限问题 | install copy/link 失败 | shell exit / warning | 使用 `--path`、用户级路径、隔离 profile；先 dry-run |
| Hermes plugin 未被发现 | install 后 session 未重启 | 工具不可见 | 重启 Hermes session/gateway；确认 `plugins.enabled` |
| 全量安装超出宿主 cap | install dry-run `tool_cap` warning | 部分 agents 可能不注册 | 用 `--division`/`--agent` 缩小，或用 Hermes lazy router |
| 文档计数漂移 | 源码扫描 vs README | 用户认知不一致 | 重新生成/更新 README 和 integration README |

#### 可复刻设计不变量

1. **Prompt asset 必须有机器可读 frontmatter**：没有 metadata 的角色库无法稳定转换、搜索、校验。
2. **division/tool 列表必须有单一事实源**：README、脚本和目录各自维护一定会漂移。
3. **转换器必须 deterministic**：同一 source agent 多次生成目标格式应只受源码和日期等明确变量影响。
4. **安装器必须有 dry-run 和 selection**：角色库越大，越不能默认全量写用户宿主目录。
5. **跨宿主支持要分 installKind**：per-agent、roster、plugin 的上下文成本和 runtime 语义完全不同。
6. **大角色库进入 Hermes 这类 prompt-cache 敏感宿主时，应使用 lazy router，不应全量 skills.external_dirs。**
7. **贡献门禁要覆盖结构和语义相似度**：frontmatter lint 只能保证格式，原创性/重复度检查才能防止库膨胀。
8. **协作 playbook 应与角色库分层**：角色是 capability，NEXUS 这类 phase/handoff/QA gate 是 orchestration contract。
9. **README 声称的 agent/tool 数要从源码生成**：人工计数很快漂移。
10. **不要把 cross-harness packaging 等同于 cross-harness enforcement**：只有有 plugin/hook/tool surface 的宿主才有更强 runtime 行为。

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| Agent 源格式 | Markdown + YAML frontmatter | 复杂 schema / DB / DSL | 最易贡献、最易 fork、Claude Code 原生可用 |
| 多平台支持 | 由 converter 生成宿主格式 | 每个平台维护独立源文件 | 降低 drift，允许单一角色源资产跨工具分发 |
| Hermes 集成 | lazy-router plugin | 233 个 Hermes skills | 保护启动上下文和 prompt cache，按需加载专家 |
| 安装器 | Bash + Python stdlib | npm/pip package manager | 依赖低，跨 macOS/Linux 容易；代价是 shell 复杂度和类型安全较弱 |
| 质量门禁 | Shell/Python scripts + GitHub Actions | 完整测试框架 / typed validator | 够轻，适合 prompt 库；但深层语义质量仍依赖人工 review |
| NEXUS 协作 | Markdown playbooks | 可执行 workflow engine | 低成本、可移植；但不能自动保证状态推进和 retry enforcement |

### 值得学习的模式

1. **角色库产品化，不是 prompt 堆叠。** `divisions.json`、`tools.json`、converter、installer、CI gates 让 prompt 资产进入软件工程流程。
2. **Lazy-router 解决大规模 skill 目录问题。** Hermes integration 是该仓库最值得直接复刻的设计：固定工具面 + 磁盘索引 + 搜索/读取/委派。
3. **Single source of truth + CI drift check。** `check-tools.sh` / `check-divisions.sh` 把 README 容易忽略的“列表同步”变成 CI fail。
4. **安装选择面前置。** `--dry-run`、division/agent filter、agents-file 让大库安装可控。
5. **用 shingle similarity 防 reskin。** prompt 库社区贡献中，重复换皮是高概率问题；实体归一化后检查 n-gram overlap 是轻量有效门禁。
6. **把 agent network doctrine 放在 strategy 层。** 角色库只解决“谁做”，NEXUS playbook 试图补“什么时候、如何交接、如何验收”。

### 反模式 / 踩坑点

- **计数漂移。** README/Hermes integration README 写 232，但当前 source scan 为 233；生成文档应自动化。
- **脚本列表仍可能漂移。** `check-agent-originality.sh` 的 `AGENT_DIRS` 包含 `strategy`，但缺少 `gis` / `security`；这会降低原创性检查覆盖面。虽然 `check-divisions.sh` 覆盖 convert/lint/workflow，但未覆盖 originality script。
- **Shell 脚本膨胀。** `install.sh` 1260 行，承载 TUI、探测、路径解析、安装、Hermes config mutation；未来继续加宿主会越来越难维护。
- **Generated files 不全量提交带来读者困惑。** `.gitignore` 排除大部分 generated integration agent 文件，README 说 convert/install，但浏览仓库时看不到完整输出；这是合理 trade-off，但需要清楚说明。
- **NEXUS 仍是文档协议。** 它写了质量门和 phase，但没有执行器、状态存储、可观测 workflow run；不能把它当 production orchestration engine。
- **全量安装心智成本高。** 233 agents 对多数个人用户不是“越多越好”，应通过 router/search/selection 降低选择面。

### 可借鉴的具体技术点

- `build-hermes-plugin.py`：把大 agent roster 转成 `agents.json` + 4 个 Hermes tools，是 agent library 对 prompt-cache-sensitive host 的优雅适配。
- `tools.json` 的 `installKind`：用 `per-agent | roster | plugin` 明确安装机制，比 README 列表更可扩展。
- `check-divisions.sh`：用 git tracked dirs + canonical JSON + script arrays + workflow path filters 做多面一致性检查。
- `check-agent-originality.sh`：实体归一化 + 8-word shingle Jaccard 的重复 prompt 检查，可复用到任何 skill/agent marketplace。
- `install.sh --agents-file`：适合团队维护一份 approved-agent allowlist，避免全员全量安装。

---

## 架构解剖

### 目录结构

```text
agency-agents/
├── academic/ design/ engineering/ ... testing/   # 16 个 source agent divisions
├── strategy/                                     # NEXUS doctrine、phase playbooks、runbooks、handoff templates
├── integrations/                                 # 各宿主安装/格式 README，generated agent files 多数被 gitignore
├── scripts/                                      # convert/install/lint/check 工具
│   ├── convert.sh                                # 多宿主格式转换入口
│   ├── install.sh                                # 探测/选择/安装入口
│   ├── build-hermes-plugin.py                    # Hermes lazy-router plugin 生成器
│   ├── lint-agents.sh                            # agent frontmatter/结构 lint
│   ├── check-tools.sh                            # tools.json 漂移检查
│   ├── check-divisions.sh                        # divisions.json 漂移检查
│   └── check-agent-originality.sh                # 重复/reskin agent 检查
├── .github/workflows/                            # CI gates
├── tools.json                                    # 14 个工具目标的 single source of truth
├── divisions.json                                # 16 个 division 的 single source of truth
├── README.md / CONTRIBUTING.md / SECURITY.md     # 使用、贡献、安全文档
└── LICENSE                                       # MIT
```

本地源码统计：

| 维度 | 数值 |
|------|------|
| Tracked files | 300 |
| Markdown files | 277 |
| Agent files | 233 |
| Source divisions | 16 |
| Supported tools in `tools.json` | 14 |
| Scripts | 12 |
| Workflows | 3 |
| Approx tracked text LOC | 76,823 |
| Agent body words | 432,972 |

Division 分布：

| Division | Agent 数 |
|----------|----------|
| specialized | 53 |
| marketing | 36 |
| engineering | 34 |
| game-development | 20 |
| gis | 13 |
| security | 10 |
| design | 9 |
| sales | 9 |
| testing | 8 |
| paid-media | 7 |
| project-management | 7 |
| spatial-computing | 6 |
| support | 6 |
| academic | 5 |
| finance | 5 |
| product | 5 |

### 技术栈

- **核心资产：** Markdown + YAML frontmatter。
- **转换/安装：** Bash 3.2 compatible scripts + Python 3 standard library。
- **Hermes plugin：** Python plugin file + JSON data file，通过 Hermes plugin API 注册工具。
- **CI/CD：** GitHub Actions，主要跑 shell validators。
- **无传统 package runtime：** 没有 `package.json` / `pyproject.toml` 作为主入口；不是 npm/pip library。
- **测试/验证：** 以 lint/check scripts 为主，不是单元测试框架。

### 模块依赖关系

```text
agent Markdown files
  ├─ read by scripts/convert.sh
  ├─ read by scripts/install.sh for selection/counting
  ├─ linted by scripts/lint-agents.sh
  └─ compared by scripts/check-agent-originality.sh

divisions.json
  └─ checked by scripts/check-divisions.sh against dirs/convert/lint/workflow

tools.json
  └─ checked by scripts/check-tools.sh against install.sh/convert.sh

scripts/lib.sh
  ├─ sourced by convert.sh
  └─ sourced by install.sh

scripts/build-hermes-plugin.py
  └─ called by convert.sh --tool hermes

integrations/*
  └─ consumed by install.sh install_<tool>()
```

### 扩展机制

- **新增 agent：** 在对应 division 新增 Markdown 文件，包含 frontmatter；PR 触发 lint/originality。
- **新增 division：** 新增目录 + 更新 `divisions.json`；`check-divisions.sh` 会指出 convert/lint/workflow 需要同步的位置。
- **新增 tool/host：** 更新 `tools.json` + `install.sh ALL_TOOLS` + `convert.sh valid_tools` + converter/installer；`check-tools.sh` 检测漂移。
- **Hermes 扩展：** 通过 generated plugin 注册 4 个工具，未来可扩展 query ranking、tag filters、usage telemetry（需 opt-in）或 toolset 配置。
- **协作扩展：** 在 `strategy/playbooks`、`coordination`、`runbooks` 增加 playbook/handoff/scenario。

### 核心文件 / 函数走读

| 文件 | 关键点 | 评价 |
|------|--------|------|
| `scripts/convert.sh` | 695 行；`convert_codex` 将 body TOML escape 到 `developer_instructions`；`run_conversions` 扫描 `AGENT_DIRS` 并根据 tool 分发；Hermes 分支调用 Python builder | 转换面清晰，但所有 target 写在一个 shell 文件里，继续增长会变重 |
| `scripts/install.sh` | 1260 行；`ALL_TOOLS`、selection engine、host detection、dry-run、parallel、per-tool install、Hermes config mutation | 功能完整，用户体验强；但职责过多，未来应考虑按 target 拆模块 |
| `scripts/build-hermes-plugin.py` | 收集 agent frontmatter/body，生成 plugin.yaml、`__init__.py`、`data/agents.json`；tool surface 包含 search/inspect/load/delegate | 架构亮点：用 lazy router 避免大技能目录污染 Hermes prompt cache |
| `tools.json` | 14 个工具目标，字段含 `format`、`installKind`、`dest` | 很好的机器可读 registry；适合驱动 docs/installer/app |
| `divisions.json` | division metadata + 长 `_note` 说明 source-of-truth 规则 | 简单但关键；让目录结构变成可校验 contract |
| `scripts/check-agent-originality.sh` | 实体归一化 + 8-word shingle Jaccard；warn 20%、fail 40% | 思路好；但目录列表未覆盖 GIS/Security，是当前需要修的质量洞 |
| `.github/workflows/*.yml` | check-tools/check-divisions 每个 PR/push 都跑；lint-agents 只在 agent paths 变化时跑 | 对 prompt library 足够实用；缺少 shellcheck / generated docs drift check |
| `strategy/EXECUTIVE-BRIEF.md` | NEXUS 把 agents 组织成 7 phases、handoff templates、scenario runbooks | 是“专家网络”叙事核心，但不是 runtime engine |

---

## 质量与成熟度

### 代码质量

- **类型系统：** 主体是 Bash，没有静态类型；Hermes builder 是 Python 3 typing annotations。作为 prompt asset repo 可接受，但 install/convert 脚本继续增长后维护压力会明显增加。
- **错误处理：** Shell 脚本普遍使用 `set -euo pipefail`；installer 有 `--dry-run`、backup、warning、路径解析、缺失 integrations 检查。
- **代码风格：** 脚本注释充分，single source of truth 意识强；`lib.sh` 抽出 frontmatter/body/slug/ANSI/TUI helper，避免完全堆在入口脚本。
- **数据一致性：** `tools.json` / `divisions.json` + CI checks 是强质量信号。
- **已发现问题：** `check-agent-originality.sh` 的 `AGENT_DIRS` 与 `divisions.json` 不一致，遗漏 `gis`、`security`，额外包含 `strategy`。这不影响基础 lint，但会削弱重复/reskin 检查覆盖。

### 测试 / 验证

- **测试框架：** 无传统单元测试框架；以 Bash/Python validators 替代。
- **CI 类型：**
  - `check-tools.yml`：`tools.json` 是工具列表单一事实源。
  - `check-divisions.yml`：`divisions.json` 是 division 单一事实源。
  - `lint-agents.yml`：对 changed agent files 跑 frontmatter/structure lint 和 originality check。
- **近期 CI 状态：** 2026-07-01 main push 的 check-tools/check-divisions 成功；2026-07-02 多个外部 PR workflow runs 显示 `action_required`，更像 fork PR approval 状态，不等于 main 失败。
- **覆盖盲区：** 未见 shellcheck、Python unit tests、converter golden tests、installer preservation tests、generated README/count drift tests。

### CI/CD

| Workflow | 触发 | 作用 | 评价 |
|----------|------|------|------|
| `check-tools.yml` | PR + main push | 工具清单一致性 | 好：新增 tool 不更新脚本会 fail |
| `check-divisions.yml` | PR + main push | division 目录/JSON/script/workflow 一致性 | 好：防新 division 漂移 |
| `lint-agents.yml` | PR agent paths | frontmatter、recommended sections、原创性 | 好：适合 prompt library；但只对 changed files 跑 |

发布流程方面，仓库没有 GitHub Release/tag；这符合“资产库 + 脚本”形态，但对企业固定版本采用不够友好。生产化建议 pin commit SHA 或 fork 内部版本。

### 依赖 / SDK 选型证据

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| Bash + POSIX shell utilities (`awk` / `sed` / `grep` / `perl`) | Runtime / scripting substrate | `scripts/install.sh`、`scripts/convert.sh`、`scripts/lint-agents.sh`、`scripts/check-tools.sh`、`scripts/check-divisions.sh` | 用最小依赖完成跨 macOS/Linux/CI 的转换、安装和一致性校验 | 脚本显式注释避免 `jq`，依赖 Bash 3.2 + coreutils；install/convert/lint/check 均为 shell 主体 | 低安装门槛，适合 prompt asset repo；用户无需 Node/Python 包管理器即可使用大部分功能 | 脚本体量已经较大，继续扩展 target 时应补 shellcheck/golden tests 或拆模块 |
| Python 3 standard library | Build helper / generated integration | `scripts/build-hermes-plugin.py`、Hermes router plugin 生成、agent roster JSON 生成 | 生成 Hermes plugin，把 233 个 agent 变成 4 个 lazy tools，避免全量 skills 注入 | builder 只使用 Python stdlib；installer 在 Hermes 分支调用 `python3` 检查/统计 `agents.json` | 适合作为跨平台生成器；比 Shell 更适合处理 JSON/frontmatter/搜索索引 | 当前不是打包的 Python project；无 pyproject/requirements，也无 Python unit tests |
| Git / GitHub Actions | CI and contribution governance | `check-tools.yml`、`check-divisions.yml`、`lint-agents.yml`、PR changed-file lint | 让工具清单、division 清单、agent frontmatter 和原创性检查进入 PR 门禁 | `.github/workflows/*` 与 `scripts/check-*` 已读；lint workflow 用 `git diff` 找 changed agent files | 对 Markdown agent library 足够轻量，贡献者无需复杂本地环境 | 只覆盖 changed agent files；缺少 generated docs drift、shellcheck、converter golden tests |
| Markdown + YAML frontmatter | Asset format / public contract | 233 个 agent 文件、`CONTRIBUTING.md` 模板、converter 输入 | 用人类可读、容易贡献的格式承载专家 persona，同时让 converter 能读取 `name/description/color/emoji/vibe` | agent corpus 以 Markdown 为主；`lib.sh` / Python builder 都解析 frontmatter | 极低贡献门槛，便于 fork、本地审查和跨宿主转换 | YAML/frontmatter 解析在 Shell/Python 中是轻量自实现，不等于完整 YAML parser；复杂值需谨慎 |
| JSON registries (`tools.json` / `divisions.json`) | Single source of truth | 工具目标、安装类型、division metadata、CI drift checks | 防止 README、脚本、workflow 和目录结构各自维护导致漂移 | `tools.json` 14 个工具目标；`divisions.json` 16 个 division；`check-tools.sh` / `check-divisions.sh` 读取它们校验脚本 | 可直接借鉴到内部 prompt library / plugin marketplace | JSON 不是完整 schema-validated；目前靠 Bash 文本解析，复杂字段增长后建议加 JSON schema |

### 文档质量

- **README：** 很完整，包含定位、场景、agent examples、统计、多工具集成、Quick Install、贡献入口。
- **CONTRIBUTING：** 贡献规范较详细，说明 agent 模板、PR 流程、风格要求。
- **SECURITY：** 明确 agent files 非 executable、脚本需 review、禁止 secrets、提示 prompt injection。
- **Integration docs：** 每个宿主都有 README；Hermes doc 特别强调不要 `skills.external_dirs` 全量预载。
- **文档缺口：** 计数漂移；没有一份自动生成的 full catalog / schema docs；NEXUS 文档里的效率/质量数字缺少可验证来源，适合作为内部方法论而非事实指标引用。

### Issue / PR 健康度

- **Open issues / PRs：** 44 issues / 54 PRs。
- **Merged PRs：** 182 merged PRs；近期有 Antigravity path fix、README tool list sync、Network Engineer agent、Hermes router plugin 等合并。
- **Recent open issues 类型：** 新 agent 请求、AppImage runtime error、接入/使用疑问、routing/index 标准建议。
- **健康判断：** 社区活跃、贡献多、维护者响应仍在；但 backlog 和重复 agent 请求会持续考验治理。

---

## 社区与生态

### 热度与认可度

- 主仓库 125k+ stars、20k+ forks，属于极高热度的 agent asset repo。
- 派生/翻译生态活跃：`jnMetaCode/agency-agents-zh` 16k+ stars，描述中称 266 个中文 agent、支持 Hermes/Claude/Cursor/Copilot 等 18 种工具。
- 官方/关联项目：`msitarzewski/agency-agents-app`（约 100 stars）显示有 native app 方向。
- 生态搜索中还能看到 `Anas-Khan93/ai-agency-agents`、`MarcusRawlins/agency-agents`、`keeply-cn/agency-agents-zh` 等 forks/衍生。

### 正面评价集中点

1. **角色覆盖面广。** 不只工程，还覆盖 marketing、sales、finance、GIS、spatial computing、support、security、game-development。
2. **跨宿主安装路径实用。** 对已有 Claude/Codex/Cursor/Gemini/Hermes 用户，迁移成本低。
3. **Hermes lazy-router 架构正确。** 对大角色库，按需加载明显优于全量 skills。
4. **社区贡献门槛低。** Markdown 文件贡献比写插件/代码容易。
5. **方法论叙事强。** NEXUS 让角色库有“专家网络”而非“prompt list”的产品感。

### 真实痛点

1. **质量参差不可避免。** 233 个 agent 平均 1858 words，深度很强，但不同贡献者风格、事实性和可维护性会不同。
2. **Prompt compliance 是软约束。** 没有 runtime 能强制 EvidenceQA、retry limit、handoff template。
3. **全量安装很重。** 文件和选择面会膨胀；对于部分宿主还可能存在 agent cap。
4. **脚本维护压力上升。** 每多一个宿主，都要扩展 convert/install/docs/check matrix。
5. **文档/脚本漂移已出现。** 计数漂移和 originality scan 目录漂移说明当前质量体系还需补边界。

### 直接竞品 / 邻近替代 / 架构邻居

| 类型 | 项目 | 关系 |
|------|------|------|
| 直接竞品 | `wshobson/agents` | 多宿主 agentic plugin marketplace，更接近“agent marketplace”形态 |
| 直接竞品 / 衍生 | `jnMetaCode/agency-agents-zh` | 中文增强/本地化 fork，扩展到 266 agents 和中国市场角色 |
| 邻近替代 | `superpowers` | 不提供大角色库，但提供更强 coding discipline；适合工程流程而非专家池 |
| 邻近替代 | `compound-engineering-plugin` | 团队 brainstorm/plan/work/review/compound workflow 更完整，但角色覆盖面不如 agency |
| 邻近替代 | `ECC` | 跨 harness substrate、profiles、hooks、安全治理更系统；比 agency 重 |
| 架构邻居 | `ponytail` | 同样有 Hermes/OpenCode/Pi/Gemini 等多宿主适配，展示 thin adapter + behavior source 模式 |
| 架构邻居 | `garrytan/gstack` | Founder/团队角色型 Claude Code setup，适合作为小而强 opinionated role pack 对照 |

### 社区结论

agency-agents 的社区信号很强，但它的热度主要来自“角色资产可见价值”和“复制即用”。生产采用时不要让 stars 掩盖质量治理问题：最安全方式是 fork/筛选/按需安装，而不是直接把全部 agent 当组织默认上下文。

---

## 评分

| 维度 | 分数 | 说明 |
|------|------|------|
| 功能覆盖度 | 4.5 / 5 | 角色覆盖极广，多工具安装完整；但不是可执行 workflow engine |
| 代码质量 | 3.5 / 5 | 脚本注释和一致性门禁好；Shell 文件偏大，originality 目录漂移需修 |
| 文档质量 | 4 / 5 | README/CONTRIBUTING/SECURITY/Integration docs 完整；计数和部分路径文档有漂移 |
| 社区活跃度 | 5 / 5 | 125k+ stars、20k+ forks、87 contributors、PR/issue 活跃 |
| 架构设计 | 4 / 5 | corpus + registry + converter + installer + lazy router 组合清晰；runtime enforcement 不在本仓库 |
| 学习价值 | 4 / 5 | 非常适合学习 prompt asset library 产品化、多宿主分发、Hermes 懒加载 |
| 可借鉴度 | 4.5 / 5 | `tools.json`/`divisions.json`/Hermes router/originality check 都可直接复用 |
| 综合 | 4.2 / 5 | 值得采用和学习，但要按需、隔离、审查，不要全量盲装 |

---

## 总结

### 个人开发者

**推荐采用，但只装需要的部分。**

- Claude/Codex/Cursor 等：先用 `--division engineering` 或 `--agent <name>`。
- Hermes：优先 `--tool hermes`，使用 lazy-router；不要把完整 roster 加到 `skills.external_dirs`。
- 不建议默认全量安装到所有宿主，选择成本和上下文成本会抵消收益。

### 小团队

**推荐 fork + allowlist。**

- 先选 10-30 个真实常用 agent，维护 `agents-file`。
- 对 agent body 做安全/合规/风格 review。
- 把 NEXUS playbook 的 handoff/QA gate 改成团队自己的产物模板。
- CI 增加 generated count drift、shellcheck、converter golden tests。

### 企业 / 生产化

**观望直接全量采用；推荐受控 PoC。**

- 角色资产可以商用友好地 fork，但全员安装前要治理 prompt injection、审计、更新、禁用和版本固定。
- 不应把 NEXUS 当成 production workflow engine；如果需要强 enforcement，应接入内部任务系统/CI/approval gate。
- 对 Hermes 这样的长期会话 agent，应坚持 lazy-router 模式，避免上下文膨胀破坏 prompt cache。

---

## 最值得复刻的架构能力

如果要在内部重写一个“专家角色库 / agent marketplace”，建议直接复刻这些不变量：

1. **Source agent schema：** Markdown frontmatter + body，frontmatter 至少 `name/description/tags/division/version/source`。
2. **Canonical registries：** `divisions.json` / `tools.json` / `schema.json` 驱动 docs、converter、installer、CI。
3. **Converter abstraction：** 每个 target 一个 pure-ish converter；输出 deterministic；golden snapshot test。
4. **Installer safety：** dry-run、selection、backup、manifest of managed files、uninstall/rollback。
5. **Lazy runtime router：** 对 Hermes/MCP/agent host 暴露 search/read/delegate，不全量注入。
6. **Quality gates：** frontmatter lint、schema validate、duplicate/reskin detector、prompt injection scan、generated docs drift。
7. **Role approval workflow：** 社区提交先进 pending，团队批准后进入 approved catalog。
8. **Usage feedback loop：** 记录哪些 agent 被 search/load/delegate（需用户 opt-in），用于淘汰低价值角色。

---

## 总结

**agency-agents 是目前最值得关注的“AI 专家角色库”之一，尤其值得 Hermes 用户学习它的 lazy-router plugin。**

但采用姿势要克制：

- **采用它的资产和架构，不要迷信全量安装。**
- **学习它的 registry/converter/installer/router，不要把 NEXUS 文档误读成硬 workflow runtime。**
- **团队用它之前先 fork、筛选、审查、加自己的治理。**

一句话：**它不是 agent runtime，也不是工程纪律框架；它是一个高热度、可分发、可转换、可按需路由的专家角色资产库。最强实践是“按需专家池”，不是“233 个 prompt 一次性塞进上下文”。**
