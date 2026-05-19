# CLI-Anything

> 一句话定位：**CLI-Anything 是一套“把任意软件变成 Agent-native CLI”的方法论、Claude Code/多平台插件、CLI-Hub 注册表与 60 个示例 harness 组成的生态型项目；它的价值不只是生成 CLI，而是把 GUI/桌面/服务软件包装成可被 AI Agent 稳定调用、可预览、可测试、可分发的命令行接口。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `HKUDS/CLI-Anything` |
| URL | `https://github.com/HKUDS/CLI-Anything` |
| Star | 36,696 (2026-05-19) |
| Fork | 3,560 |
| 许可证 | Apache-2.0（仓库根 LICENSE）；部分 harness `setup.py` classifier 仍写 MIT/GPL，见风险说明 |
| 语言 | Python 为主，少量 JavaScript / TypeScript / C# / Shell |
| 首次提交 | 2026-03-08 |
| 最近提交 | 2026-05-18 |
| 最新 Release | v0.3.0 (2026-04-24) |
| 贡献者数 | GitHub API 首页 75；核心贡献：yuh-yang 235、AiMiDi 43、omerarslan0 33、furkankoykiran 31 |
| 分析日期 | 2026-05-19 |
| 分类 | Agent-Native Software / CLI Harness Framework |

> 观测口径：GitHub `open_issues_count=62` 包含 PR；拆分后 open issues 39、open PRs 23。

---

## 场景一：是否值得采用

### 解决的问题

AI Agent 擅长文本推理和调用命令行，但大量专业软件仍是 GUI-first：Blender、FreeCAD、LibreOffice、QGIS、OBS、视频剪辑器、图像编辑器、参考文献工具、网络服务后台等。传统方案要么靠截图点击，脆弱且不可审计；要么只调用碎片 API，难以组合成完整工作流。

CLI-Anything 的核心判断是：**CLI 是人类软件与 Agent 之间最稳定的窄腰接口**。项目试图提供一套 SOP，让编码 Agent 读目标软件源码 / API / 项目格式，自动设计并实现一个 `cli-anything-<software>`：有 REPL、有 `--json`、有 session、undo/redo、preview、E2E 测试和 SKILL.md。

目标用户：
- 想让 AI Agent 操作真实软件的开发者 / 自动化团队
- 想为内部系统生成 Agent 工具层的工程团队
- 想研究“Agent-native software”范式的人
- 已使用 Claude Code / Codex / Pi / OpenCode / Copilot CLI 等 coding agent 的用户

### 核心能力与边界

- **能做什么：**
  - 提供 `/cli-anything <software-path-or-repo>` 七阶段流程：分析 → 设计 → 实现 → 测试计划 → 测试实现 → SKILL.md → 发布安装。
  - 通过 `cli-anything-plugin/HARNESS.md` 固化方法论：真实后端调用、native project format、JSON 输出、REPL、session、undo/redo、真实文件 E2E。
  - 自带大量 harness 样例：仓库根 `registry.json` 有 60 个 CLI 条目，本地顶层 `*/agent-harness` 约 55 个；README 宣称 2,280 tests。
  - 通过 `cli-hub` 实现发现、安装、更新、卸载、launch，以及 preview bundle / live session 的通用查看器。
  - 支持多宿主：Claude Code plugin、Pi extension、OpenCode commands、OpenClaw skill、Codex skill、Qodercli、Copilot CLI 等。
  - 自动生成 repo-root `skills/cli-anything-<software>/SKILL.md`，让 agent 用 `npx skills add HKUDS/CLI-Anything --skill <name>` 发现具体 CLI 能力。

- **不能做什么：**
  - 不能真正“无成本”覆盖任意软件。高质量 harness 仍依赖目标软件本身有可脚本化后端、CLI、API、项目文件格式或 MCP server。
  - 不是运行时沙箱，也不替代权限、安全、凭证治理；agent 调用真实软件和真实文件，风险真实存在。
  - 不是完整产品级 registry 治理平台。当前更像 monorepo + GitHub Pages + PyPI hub 的快速生态实验。
  - 不能保证所有收录 harness 都同等成熟。仓库大、多贡献者、多 generated-like 代码，质量离散度高。

- **与竞品差异：**
  - vs MCP servers：MCP 是协议与工具注册层，CLI-Anything 是“把软件能力产品化成命令行 + 技能文档 + 测试”的 harness 工程方法；两者互补。
  - vs Composio：Composio 偏 SaaS/API app integration marketplace；CLI-Anything 偏本地/桌面/开源软件与真实后端调用。
  - vs Playwright MCP / UI-TARS：后者解决 GUI/browser 操作，CLI-Anything 试图绕开 GUI 脆弱性，用结构化 CLI 暴露真实能力。
  - vs coding workflow 插件（superpowers / compound-engineering-plugin）：它们塑造 agent 开发流程；CLI-Anything 让 agent 获得“能操作更多软件”的工具面。

### 集成成本

- **依赖链：**
  - 使用 CLI-Hub：`cli-anything-hub` 只依赖 `click` + `requests`，很轻。
  - 使用具体 harness：每个 harness 独立依赖真实软件（如 Blender、LibreOffice、QGIS、Zoom API、Obsidian Local REST API、n8n REST API 等），成本随目标软件变化。
  - 生成新 harness：依赖 coding agent 能力、目标源码、Python/Click/pytest，以及 HARNESS.md 规定的测试与文档流程。

- **部署复杂度：**
  - 安装已有 harness：中低。`pip install cli-anything-hub` 后 `cli-hub install <name>`。
  - 生成新 harness：中高。要读目标软件、设计状态模型、实现真实后端调用、跑真实 E2E。
  - 企业落地：高。必须补安全审查、软件依赖安装、凭证隔离、registry 审核、沙箱运行策略。

- **学习曲线：**
  - 用现成 CLI：低。
  - 学会写高质量 harness：中高，必须理解 HARNESS.md 的真实后端、preview、SKILL、测试、发布等规范。

- **从零到 demo：**
  - README 宣称 Quick Start 5 分钟。对已有 harness 可成立。
  - 对新 GUI 软件，若目标后端清晰（例如有 CLI/API），首版 demo 约 0.5-2 天；若是复杂桌面 GUI 且无脚本接口，会显著拉长。

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | ⚠️ 中 | 根仓库 Apache-2.0，但 `cli-hub/setup.py` 写 MIT，多个 harness classifier 写 MIT/GPL；Issue #269 还出现 AI 生成代码疑似混入 AGPL 来源并请求 revert。生态型仓库必须加强 license provenance。 |
| Bus factor | 中 | GitHub API 显示 75 contributors，但核心提交集中在少数人；HKUDS 背景和社区热度能缓解单点风险。 |
| 供应商锁定 | 中 | 方法论本身开源；但最佳入口是 Claude Code 插件，多平台支持程度不均。具体 harness 又锁定目标软件后端。 |
| 维护趋势 | 活跃 | 2026-03 创建，2026-05 仍高频合并 PR；已有 v0.2.0/v0.3.0 release。 |
| 安全历史 | ⚠️ 中高 | 项目明确有 SECURITY.md，但 open issues 中已有 FreeCAD macro code injection、Zoom token / recording、Obsidian content-type、自动 code-quality scan 12 个 security-tagged findings 等信号。Agent 自动执行真实软件命令，安全面天然大。 |
| 质量一致性 | ⚠️ 中 | `git ls-files '*.py'` 全量编译发现 `cli-hub/cli_hub/preview.py` 存在 Python 3.11 SyntaxError；`cli-hub` 测试因此 collection 失败。插件 skill_generator 测试通过，PR labeler JS 测试通过。 |

### 结论

**观望（直接生产采用） / 推荐学习和小范围 PoC**

理由：CLI-Anything 的方向很对，甚至可以说抓住了 Agent 时代软件形态的一个关键接口：**不是让 AI 学会点 GUI，而是让软件主动暴露 agent-native 命令面**。但当前仓库扩张极快，harness 数量、贡献者和注册表增长速度超过了治理能力；license、security、CI coverage、Python 语法错误等问题说明它还不适合不加筛选地生产级引入。

对 Jarl 的使用建议：**不要把它当“现成可靠工具市场”直接全量使用；把它当“Agent 工具化方法论 + harness 设计参考库”非常值得。**真正要落地内部工具，应选 1-2 个内部软件/服务，按 HARNESS.md 的真实后端 + JSON + test + SKILL 流程做受控 PoC。

---

## 场景二：技术架构学习

### 核心架构图

```text
┌────────────────────────────────────────────────────────────────────┐
│                            CLI-Anything                            │
│               Agent-native software interface ecosystem             │
└────────────────────────────────────────────────────────────────────┘

       Host Coding Agents
       ┌─────────────────────────────────────────────────────────┐
       │ Claude Code / Pi / OpenCode / Codex / OpenClaw / Qoder │
       └──────────────────────────┬──────────────────────────────┘
                                  │ slash command / skill / plugin
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│ cli-anything-plugin/                                                │
│ - HARNESS.md: 7-phase SOP + non-negotiable rules                    │
│ - commands/*.md: build / refine / test / validate / list             │
│ - repl_skin.py: unified REPL UI                                     │
│ - skill_generator.py: Click CLI → SKILL.md                          │
│ - preview_bundle.py: preview-bundle/live trajectory helpers          │
└──────────────────────────┬─────────────────────────────────────────┘
                           │ generates / validates
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│ <software>/agent-harness/                                           │
│ ├── <SOFTWARE>.md             target-specific SOP                   │
│ ├── setup.py / pyproject      installable Python package             │
│ └── cli_anything/<software>/                                        │
│     ├── <software>_cli.py      Click CLI + --json + REPL             │
│     ├── core/                 project/session/export/domain logic    │
│     ├── utils/                real backend wrappers                  │
│     ├── tests/                unit + E2E + subprocess tests          │
│     └── skills/SKILL.md       package-local skill                    │
└──────────────────────────┬─────────────────────────────────────────┘
                           │ publishes metadata
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│ Registry + Hub                                                       │
│ - registry.json: 60 harness CLIs                                     │
│ - public_registry.json: 16 public/bundled/uv/npm CLIs                │
│ - cli-hub package: install/search/launch/update + preview viewer     │
│ - docs/hub GitHub Pages + DigitalOcean Spaces meta skill             │
└──────────────────────────┬─────────────────────────────────────────┘
                           │ actual execution
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│ Real Software Backends                                               │
│ Blender bpy / LibreOffice headless / melt / ffmpeg / REST APIs / MCP │
│ Output: real artifacts + preview bundles + trajectory history        │
└────────────────────────────────────────────────────────────────────┘
```

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 以 CLI 作为 agent-native 窄腰 | 每个软件最终暴露 `cli-anything-<software>` | 直接走 GUI automation 的通用性 | CLI 可审计、可测试、可组合、适合 LLM 生成 |
| 真实软件是硬依赖 | 调用 Blender/LibreOffice/melt/REST API 等真实后端 | 用 Python 快速仿真/重实现 | 保留专业软件能力，不做 toy clone |
| 每个 harness 独立 Python 包 | `cli_anything` namespace package + `setup.py` | 单一 runtime 内聚管理 | 便于单独安装、单独维护、避免依赖冲突 |
| HARNESS.md 作为方法论内核 | Markdown SOP 驱动 coding agent | 强类型 DSL / 代码生成器的确定性 | 更容易被 Claude/Codex 等 agent 直接执行和迭代 |
| SKILL.md 作为能力发现接口 | 生成 repo-root + package-local skill | 仅靠 README / `--help` | 让不同 agent runtime 能读到目标 CLI 的使用方式 |
| Preview Bundle 协议 | manifest + summary + artifacts + live trajectory | 每个 harness 自己做 viewer | 跨 3D/CAD/video/diagram 统一中间结果反馈 |
| CLI-Hub 注册表 | `registry.json` + GitHub Pages + PyPI hub | 中央服务和复杂后端 | 低成本启动生态，PR merge 即更新 |

### 值得学习的模式

1. **“方法论即插件”**：`HARNESS.md` 不是普通文档，而是驱动 agent 生成工程产物的执行规范。它把“不要重实现软件、必须用真实后端、必须验证输出”等经验固化成强约束。
2. **Agent 工具的三层产物**：代码 CLI、测试套件、SKILL.md 同时生成。CLI 只是执行面，SKILL.md 才是 agent 的认知面，TEST.md 才是可信面。
3. **真实后端 + native format 的接口策略**：先构造目标软件真实项目文件 / API payload，再调用真实软件渲染，最后验证结果。这是替代 GUI automation 的关键。
4. **Preview Bundle / Trajectory**：把中间视觉状态变成可寻址 artifact，而不是让 agent 盲改。对内容创作、CAD、视频、3D、图表工具尤其有价值。
5. **Registry-first 生态增长**：核心仓库既收 in-repo harness，也允许 standalone repo 只提交 registry entry；这是工具市场快速扩容的低摩擦路径。
6. **统一 REPL Skin**：所有 generated CLI 共享命令历史、banner、skill path 提示和交互风格，降低 agent/human 切换成本。

### 反模式 / 踩坑点

1. **增长快于治理**：60 个 registry CLI、55 个 in-repo harness、1,036 个 Python 文件、粗略 34 万行文本内容；如果没有强 CI gate，很容易出现单个 harness 或 hub 破窗。
2. **License 口径不一致**：根 LICENSE Apache-2.0，但多个包 classifier 写 MIT/GPL，且 Issue #269 暴露 AI 生成代码来源合规问题。
3. **安全边界巨大**：Agent 会自动构造 subprocess 参数、宏脚本、文件路径、API payload。SECURITY.md 已列出风险，但 Issue #282 说明实际 harness 仍会踩 code injection。
4. **CI 对核心 hub 覆盖不足**：我在 Python 3.11 下跑 `py_compile` 发现 `cli-hub/cli_hub/preview.py` f-string SyntaxError；这会让 `cli-hub/tests/test_cli_hub.py` collection 失败。
5. **“任何软件”表述容易过度承诺**：没有脚本接口、项目格式不稳定、渲染只能 GUI 的软件，生成高质量 CLI 的难度会很高。
6. **生成代码风格离散**：不同 harness 的 license、setup.py、测试、REPL 实现存在历史版本差异，说明模板和回填治理还在演进中。

### 可借鉴的具体技术点

- `cli-anything-plugin/HARNESS.md`：可直接借鉴成“内部工具 agent-native 化”的工程规范。
- `cli-anything-plugin/preview_bundle.py` + `docs/PREVIEW_PROTOCOL.md`：可迁移为通用 artifact preview 协议，适合 Distill/内容生产/图像卡片/三维生成等工作流。
- `cli-anything-plugin/repl_skin.py`：生成工具统一交互面，把 skill 安装命令和 skill path 直接暴露在 banner 中。
- `.github/scripts/sync_root_skills.py` / `validate_root_skills.py`：把 package-local skill 镜像到 root skills，解决 monorepo 能力发现问题。
- `cli-hub/cli_hub/registry.py` + `installer.py`：轻量 registry + cache + 多安装策略（pip/npm/uv/bundled/command）的实现样板。
- `blender/agent-harness/cli_anything/blender/core/session.py`：session、undo/redo、file locking、autosave 模式的 generated harness 示例。

---

## 架构解剖

### 目录结构

```text
CLI-Anything/
├── cli-anything-plugin/        # 方法论内核 + Claude Code plugin
│   ├── HARNESS.md              # 7-phase SOP，真实后端/测试/preview 规则
│   ├── commands/               # /cli-anything、refine、test、validate、list
│   ├── guides/                 # session locking、preview、MCP backend、发布等专题
│   ├── repl_skin.py            # 各 harness 统一 REPL
│   ├── skill_generator.py      # 从 Click CLI 生成 SKILL.md
│   └── preview_bundle.py       # 预览 bundle/live trajectory helper
├── cli-hub/                    # PyPI 包：CLI registry manager + preview viewer
│   ├── cli_hub/cli.py          # click command entry
│   ├── registry.py             # fetch/cache/merge registry
│   ├── installer.py            # pip/npm/uv/command/bundled 安装策略
│   └── preview.py              # bundle/live session HTML/inspect viewer
├── skills/                     # repo-root canonical skills，供 npx skills 发现
├── registry.json               # 60 个 harness CLI 条目
├── public_registry.json        # 16 个 public/bundled/uv/npm CLI 条目
├── docs/                       # Hub、preview protocol、脚本等
├── .github/workflows/          # pages、root skills validation、pr labeler、publish hub
├── <software>/agent-harness/   # 大量软件 harness 示例
│   ├── setup.py / pyproject.toml
│   └── cli_anything/<software>/
│       ├── <software>_cli.py
│       ├── core/
│       ├── utils/
│       ├── tests/
│       └── skills/SKILL.md
├── codex-skill/                # Codex skill wrapper
├── .pi-extension/              # Pi Coding Agent extension
├── opencode-commands/          # OpenCode command definitions
└── qoder-plugin/               # Qodercli adapter
```

### 技术栈

- **运行时 / 框架**：Python 3.10+，Click 8+；少量 Node.js/TypeScript/JavaScript 用于插件/Hub/测试/前端；部分 harness 含 C# / Swift / Shell。
- **构建 / 打包**：各 harness 多数为 `setup.py` + namespace package；`cli-anything-hub` 发布到 PyPI；Hub 静态页用 GitHub Pages + Jekyll。
- **测试**：pytest 为主；少量 Node.js test。README 声称 2,280 passing tests（1,682 unit + 579 E2E + 19 Node.js）。本次 spot check：`cli-anything-plugin/tests/test_skill_generator.py` 35 passed；`.github/scripts/tests/pr-labeler.test.js` 4 passed；`cli-hub/tests/test_cli_hub.py` 因 `preview.py` SyntaxError 无法 collection。
- **CI/CD**：5 个 GitHub Actions：root skills validation、Pages deploy、PR labeler、PR labeler tests、cli-hub PyPI publish。当前没有看到全仓库 pytest / py_compile 级别 CI。
- **索引**：GitNexus 成功索引（420.6s）：42,596 nodes、67,897 edges、878 clusters、215 flows；worker pool 超时后 fallback sequential，多个空 `__init__.py` / 部分文件 scope extraction warning，不阻塞主体分析。

### 模块依赖关系

```text
Host plugin command
  └─ reads HARNESS.md + commands/*.md
      └─ coding agent creates/updates <software>/agent-harness
          ├─ Click CLI (<software>_cli.py)
          │   ├─ core/project/session/export/domain modules
          │   ├─ utils/<backend>.py → real software/API/MCP/subprocess
          │   ├─ utils/repl_skin.py → shared UX
          │   └─ utils/preview_bundle.py → preview protocol
          ├─ tests/test_core.py + test_full_e2e.py + TEST.md
          ├─ README.md + <SOFTWARE>.md
          └─ skills/SKILL.md

registry.json / public_registry.json
  └─ cli-hub fetch/cache/search/install/launch
      ├─ installer strategy: pip / npm / uv / command / bundled
      └─ previews inspect/html/watch/open reads existing bundles only
```

### 扩展机制

1. **新增 harness**：在 `<software>/agent-harness/` 下生成标准结构，增加 `registry.json` entry，新增 root skill。
2. **Standalone harness**：外部 repo 自行发布 PyPI 包，只向 `registry.json` 提交 `source_url` + `skill_md`。
3. **新增宿主平台**：仿照 `codex-skill/`、`.pi-extension/`、`opencode-commands/` 添加 wrapper，把 HARNESS.md 和 commands 暴露给该平台。
4. **新增 preview 能力**：实现 `preview recipes/capture/latest/diff/live ...`，输出 `preview-bundle/v1` 和 `preview-live/v1`。
5. **新增公共 CLI**：写入 `public_registry.json`，选择 npm/uv/brew/bundled/command 等安装策略。

---

## 质量与成熟度

### 代码质量

- **类型系统：** Python 类型标注不均衡。核心模板和部分 harness 有类型提示；大量 generated harness 更偏脚本式。
- **错误处理：** HARNESS.md 对 fail loudly、JSON error、backend dependency error 有明确规范。实际实现中存在差异：例如 `cli-hub/installer.py` 对 registry 中含 pipe/`&&` 的 trusted install command 使用 `shell=True`，实用但安全审计压力更大。
- **代码风格一致性：** 方法论层清晰，但 harness 层明显多代模板共存；`setup.py` license 字段、SKILL 路径、测试形态不完全一致。
- **静态可编译性：** 1,036 个 tracked Python 文件中 `py_compile` 发现 1 个 SyntaxError：`cli-hub/cli_hub/preview.py` line 723 附近 f-string expression 使用反斜杠转义，Python 3.11 不接受。

### 测试

- **测试框架：** pytest + Node.js built-in test。
- **项目宣称覆盖：** README 表格列 2,280 passed，覆盖多个 harness 的 unit/e2e/subprocess tests。
- **本次验证：**
  - `python3 -m pytest cli-anything-plugin/tests/test_skill_generator.py -q` → 35 passed。
  - `node .github/scripts/tests/pr-labeler.test.js` → 4 passed。
  - `python3 .github/scripts/validate_root_skills.py` → Root skills validation passed。
  - `python3 .github/scripts/generate_meta_skill.py` → 60 harness + 16 public CLIs，生成成功。
  - `python3 -m pytest cli-hub/tests/test_cli_hub.py` → collection 失败，原因是 `cli-hub/cli_hub/preview.py` SyntaxError。

### CI/CD

- **流水线配置：**
  - `check-root-skills.yml`：校验 package-local SKILL 到 root skills 镜像一致。
  - `deploy-pages.yml`：生成 registry dates / meta skill，上传 DigitalOcean Spaces，构建 GitHub Pages。
  - `pr-labeler.yml` + `pr-labeler-tests.yml`：PR 自动打标签。
  - `publish-cli-hub.yml`：`cli-hub/**` 变更时发布 PyPI。
- **缺口：** 没看到覆盖所有 Python 文件的 syntax check / pytest smoke；否则 `preview.py` SyntaxError 不应进入 main。

### 文档质量

- **API/方法论文档：** 很强。README、HARNESS.md、PREVIEW_PROTOCOL.md、CONTRIBUTING.md、SECURITY.md 都有实质内容。
- **教程/指南：** 多宿主安装文档完整；HARNESS.md 中的 pattern/pitfall 很像“给 agent 的工程教材”。
- **Changelog：** README News 很密，但更像运营日志；Release 有 v0.2.0/v0.3.0。
- **不足：** README 很长且营销口吻强，真实边界（哪些软件难做、哪些 harness 是实验级）需要读源码/issue 才能判断。

### Issue/PR 健康度

- **Open issues / PRs：** 39 open issues、23 open PRs（2026-05-19）。
- **高信号问题：**
  - #282 FreeCAD macro generation code injection via unsanitized `output_path`。
  - #278 n8n REPL `print_banner()` 参数错误导致不可用。
  - #271 Obsidian search content-type 不兼容。
  - #269 Stata harness 可能混入 AGPL 来源代码，请求 revert。
  - #284 自动 code-quality scan 50 findings，12 security-tagged。
- **PR 节奏：** 最近 merged PR 密集（#281、#244、#238、#241、#245、#275 等），说明维护活跃。

---

## 社区与生态

### 社区评价

- **热度与认可度：** 两个月内 36k+ stars、3.5k forks，热度极高；HN 上至少有 `CLI-Anything`、`Turn any software into an agent-native CLI` 等讨论条目，但分数不高。说明 GitHub star 热度远高于外部深度讨论。
- **正面评价集中点：** 概念很强：把 GUI/专业软件变成 agent-native CLI，天然契合当前 coding agent / MCP / desktop automation 方向。README demo 展示也很有传播力（FreeCAD rover、Blender drone、Draw.io diagram）。
- **真实痛点：** issue 不是大量用户功能争论，而是很工程化的问题：安装/插件识别、真实后端兼容、security hardening、license provenance、单个 harness REPL bug。这符合“快速扩张生态项目”的典型痛点。
- **社交平台：** HN 有少量条目；Reddit 未能直接获取（返回 blocked）。GitHub repo search 显示已有外部派生：`ItamarZand88/CLI-Anything-WEB`（182 stars）、`PiaoyangGuohai1/cli-anything-zotero`（52 stars）、`AgentSkillOS/SkillAnything`（436 stars）等。

### 衍生项目 / 插件生态

- **官方/准官方生态：** CLI-Hub，root skills，public registry，Claude Code plugin，Pi extension，OpenCode commands，Codex skill，Qoder plugin。
- **外部 standalone harness：** registry 中已有 `source_url` 外部项，例如 Zotero 等。
- **派生思路项目：** `CLI-Anything-WEB`（针对 Web app 的 traffic capture → CLI）、`SkillAnything`（Software Skill-Native）等，说明概念已经开始扩散。

### 竞品对比

| 项目 | 定位 | 与 CLI-Anything 的关系 |
|------|------|------------------------|
| MCP servers (`modelcontextprotocol/servers`) | 官方/社区 MCP server 集合 | 协议层竞品/互补。MCP 更标准，CLI-Anything 更强调生成真实 CLI harness 与测试。 |
| Composio | SaaS/API 工具集成平台 | 更成熟的 API integration marketplace；CLI-Anything 更适合本地软件、桌面软件、开源工具。 |
| Playwright MCP | Browser automation MCP | 适合浏览器场景；CLI-Anything 的 browser harness/DOMShell 是类似方向，但总目标更广。 |
| UI-TARS / GUI agents | 视觉/桌面操作 agent | GUI 操作更通用但脆弱；CLI-Anything 更可靠但要求能构建软件接口。 |
| Superpowers / Compound Engineering | Agent workflow / skill framework | 不是直接竞品；可与 CLI-Anything 叠加：一个塑造 agent 行为，一个扩展 agent 工具面。 |
| OpenHands / Cline | Agent 平台 | 平台层；CLI-Anything 可以成为这些 agent 调用的工具生态。 |

---

## 关键代码走读

### 1. `cli-anything-plugin/HARNESS.md` — 方法论内核

- **路径**：`cli-anything-plugin/HARNESS.md`
- **职责**：定义把 GUI / 专业软件转为 CLI harness 的完整 SOP 和质量门槛。
- **实现要点：**
  - 七阶段流水线：分析、设计、实现、测试计划、测试实现、测试文档、SKILL、发布。
  - 非协商规则：真实软件是硬依赖、不要 Python toy reimplementation、每个命令支持 `--json`、E2E 必须生成真实输出。
  - 针对 preview/live preview、MCP backend、session locking、filter translation 等都有 guide 引用。

### 2. `cli-anything-plugin/commands/cli-anything.md` — 主构建命令

- **路径**：`cli-anything-plugin/commands/cli-anything.md`
- **职责**：给宿主 coding agent 的 `/cli-anything <path-or-repo>` 指令说明。
- **实现要点：**
  - 明确要求先读 HARNESS.md，防止 agent 自由发挥。
  - 支持本地源码路径或 GitHub repo；不接受裸软件名。
  - 输出结构固定为 `<software>/agent-harness/cli_anything/<software>/...`。
  - 成功标准包含 CLI、REPL、JSON、tests、SKILL、setup.py、本地安装。

### 3. `cli-anything-plugin/skill_generator.py` — CLI 到 SKILL.md 的桥

- **路径**：`cli-anything-plugin/skill_generator.py`
- **职责**：从 harness 的 README、setup.py、Click decorators 中提取元数据并生成 SKILL.md。
- **实现要点：**
  - `extract_cli_metadata()` 找 `cli_anything/<software>` package，读取 README intro 和 setup.py version。
  - 正则解析 `@click.group()` / `@group.command()`，提取命令组和命令 docstring。
  - canonical skill id 使用 `cli-anything-<software>`，支持 repo-root skill 镜像。
  - 本次测试 `35 passed`，这是项目中比较稳的核心模块。

### 4. `cli-hub/cli_hub/installer.py` — Hub 安装策略

- **路径**：`cli-hub/cli_hub/installer.py`
- **职责**：根据 registry entry 分发安装/卸载/更新动作。
- **实现要点：**
  - `_install_strategy()` 支持 harness 默认 pip、public npm、uv、bundled、generic command。
  - `installed.json` 记录已安装 CLI 的 entry point、source、strategy、install command。
  - `_run_command()` 对包含 pipe / `&&` 等 shell operator 的 trusted registry command 使用 `shell=True`，换取通用性，但这也要求 registry 必须被严格审核。

### 5. `docs/PREVIEW_PROTOCOL.md` + `cli-anything-plugin/preview_bundle.py` — 预览协议

- **路径**：`docs/PREVIEW_PROTOCOL.md`、`cli-anything-plugin/preview_bundle.py`
- **职责**：统一不同 harness 的中间结果预览格式。
- **实现要点：**
  - `preview-bundle/v1`：bundle directory 包含 `manifest.json`、`summary.json`、`artifacts/`。
  - `preview-live/v1`：`session.json` 指向当前 head，`trajectory.json` 记录命令到预览的 append-only 历史。
  - `bundle_id` 基于 UTC timestamp + cache fingerprint + recipe，便于缓存与复现。
  - 设计目标是让 agent 在改 3D/CAD/video/diagram 时能看到中间状态，而不是盲改。

### 6. `blender/agent-harness/.../session.py` — 标准 harness 状态管理样例

- **路径**：`blender/agent-harness/cli_anything/blender/core/session.py`
- **职责**：维护 project state、undo/redo、modified flag、保存。
- **实现要点：**
  - `_locked_save_json()` 用 `fcntl.flock` 做独占写，避免 session JSON 并发写坏。
  - `snapshot()` 在 mutation 前保存 undo state；`undo()` / `redo()` 还原深拷贝 project。
  - `save_session()` 写回项目并更新 metadata.modified。

### 7. `cli-hub/cli_hub/preview.py` — 当前破窗点

- **路径**：`cli-hub/cli_hub/preview.py`
- **职责**：读取 preview bundle / live session，渲染 inspect text / HTML / watch 页面。
- **实现要点：**
  - 文件功能很全，但体量已达 1,838 行。
  - Python 3.11 下 line 723 附近 f-string expression 含反斜杠导致 SyntaxError，进而让 `cli-hub/tests/test_cli_hub.py` collection 失败。
  - 这是“快速扩容 + 大文件复杂度”带来的典型维护信号。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 5 | 方向覆盖极广：生成、安装、注册、预览、测试、skill、多宿主适配；60 个 registry CLI。 |
| 代码质量 | 3 | 方法论层清晰，但 harness 层质量离散；`cli-hub/preview.py` 存在语法错误，license/setup 口径不一致。 |
| 文档质量 | 5 | README、HARNESS、PREVIEW_PROTOCOL、CONTRIBUTING、SECURITY 都有高密度内容，对 agent 非常友好。 |
| 社区活跃度 | 4 | Star/fork/PR 活跃度极高，但项目过新，外部深度讨论和真实生产采用仍需观察。 |
| 架构设计 | 4 | CLI 窄腰 + SKILL + preview protocol 很有设计价值；但 Hub/registry/CI 治理仍偏轻。 |
| 学习价值 | 5 | 对“Agent-native software”范式、工具接口设计、预览反馈闭环非常值得学。 |
| 可借鉴度 | 5 | HARNESS.md、preview bundle、SKILL 生成、registry 模式都可直接迁移到内部工具建设。 |

**总分：31/35**

---

## 总结

### 一句话评价

**CLI-Anything 是一个理念领先、传播力强、工程治理仍在追赶增长速度的 Agent 工具生态实验。它最值得学的是“软件如何主动为 Agent 暴露结构化命令面”，而不是把它当成已经成熟的全自动 CLI 工厂。**

### 谁应该用

- 想把内部工具 / 专业软件 / 桌面软件变成 agent-callable CLI 的团队。
- 已经在使用 Claude Code / Codex / OpenCode，想扩展工具面的个人开发者。
- 做 Agent 产品、MCP 工具、内容生成 pipeline、自动化 QA 的工程师。
- 想学习 preview artifact / trajectory feedback loop 的人。

### 谁不应该用

- 需要立即生产级、强安全、强合规、强 SLA 的企业场景（除非先自建审核和沙箱）。
- 目标软件没有稳定 API/CLI/脚本接口，又要求完整覆盖的场景。
- 期望“扔给 agent 一个 repo 就得到可靠生产工具”的用户。
- 不愿维护依赖软件、真实后端、E2E 测试环境的人。

### 下一步

1. **学习路线：** 精读 `cli-anything-plugin/HARNESS.md`、`docs/PREVIEW_PROTOCOL.md`、`blender/agent-harness` 与 `cli-hub`。
2. **PoC 路线：** 选一个内部 API 服务或开源 GUI 软件，按 HARNESS.md 做最小 harness：`--json` + session + 3-5 个核心命令 + SKILL.md + E2E。
3. **产品化路线：** 如果要借鉴到 Jarl 的体系，建议抽象成“Internal Tool Harness Kit”：把内部服务/脚本统一包装成 agent-native CLI + skill + preview artifact。
4. **贡献切入：** 可以先修小而关键的问题：`cli-hub/preview.py` SyntaxError、license metadata 一致性、全仓 `py_compile` CI、registry install command 安全审计。