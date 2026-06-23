# last30days-skill

> 一句话定位：**last30days-skill 是一套 agent-native 的实时社会信号研究 Skill：用一个强约束 `SKILL.md` 驱动宿主模型规划查询，再由 Python 引擎并行抓取 Reddit、X、YouTube、TikTok、HN、Polymarket、GitHub、Web 等来源，按互动、时效、相关性和跨源聚类合成“最近 30 天人们真正怎么说”的研究 brief。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `mvanhorn/last30days-skill` |
| URL | `https://github.com/mvanhorn/last30days-skill` |
| Star | 约 39.1k（2026-06-11 观测） |
| Fork | 约 3.16k |
| 许可证 | MIT |
| 主要语言 | Python；另有 Markdown / JSON / Bash / JS / YAML |
| GitHub created_at | 2026-01-23 |
| 首次提交 | 2026-01-23，本地 `git log`：`5ca4829 Initial commit: last30days skill` |
| 最近提交 | 2026-06-06，本地 HEAD：`1221584 chore(release): v3.3.2 (#485)`；GitHub `pushed_at` 为 2026-06-10 |
| 最新 GitHub Release / Tag | GitHub latest release / latest tag 均为 `v3.3.0`（2026-05-17）；源码版本为 `3.3.2` |
| 贡献者数 | GitHub contributors API 返回 42；本地 shortlog 显示 Matt Van Horn、Trevin Chow、Jeffrey Sperling 为主要贡献者 |
| Issue / PR | open issues 75，open PRs 72；repo API `open_issues_count=147` 含 PR；merged PRs 171（2026-06-11 GitHub Search 口径） |
| 代码规模 | `pygount`：246 files，29,056 code LOC；其中 Python 160 files / 28,151 code LOC；Markdown 47 files |
| 测试验证 | `uv run pytest` 实测：1,617 passed，4 skipped，2 subtests passed，17.60s |
| GitNexus | 索引成功：7,664 nodes / 12,595 edges / 189 clusters / 238 flows；少量大文件 scope extraction 警告，不影响本次源码阅读 |
| 分析日期 | 2026-06-11 |
| 分类 | AI Research Skill / Agent-Native Research Engine |

补充口径：运行 GitNexus 会在源码缓存仓库内生成 `.gitnexus/`、`.claude/skills/generated/` 并修改 `AGENTS.md` / `CLAUDE.md` / `.gitignore` 的本地分析提示。这些是分析副产物，`repos/` 被 TK 仓库 `.gitignore` 排除，不纳入本报告提交。

---

## 场景一：是否值得采用

### 解决的问题

传统搜索和多数 Deep Research 工具的问题是：

- **时效慢**：网页和训练数据常常滞后，抓不到刚发生的社区讨论。
- **信号单一**：Google 偏网页，ChatGPT/Claude 原生能力不稳定或不覆盖 X、TikTok、Reddit comments、Polymarket、GitHub PR 等“人群行为信号”。
- **来源割裂**：每个平台都有不同认证、反爬、分页、时间窗口和内容格式，人工跨平台查一次成本高。
- **合成不可控**：普通 agent 容易把抓到的列表改写成泛泛总结，丢失来源、互动量、时间窗、失败来源和置信度。

last30days-skill 的核心价值不是“又一个搜索 API”，而是把**跨平台实时社会信号采集 + agent synthesis 约束 + 可分发 Skill 包**组合成一个可被 Claude Code、Codex、Cursor、Gemini CLI、OpenClaw、Agent Skills 等宿主调用的研究工具。

目标用户：

- 需要会议前快速了解一个人/公司/项目最近动态的 founder、销售、投资、研究人员；
- 想用 Reddit / X / YouTube / GitHub / Polymarket 等作为产品调研输入的 builder；
- 已在 Claude Code / Codex 等 agent harness 中工作的用户，希望用 `/last30days <topic>` 直接触发研究；
- 想学习“agent-facing skill + deterministic engine”组合架构的开发者。

### 核心能力与边界

**能做什么：**

- 以 `/last30days <topic>` 形式在多种 agent harness 中被调用。
- 通过宿主模型生成 `--plan` / `--competitors-plan`，把自然语言 topic 转成结构化 subqueries、sources、weights。
- 并行拉取多来源信号：Reddit、X、YouTube、TikTok、Instagram、Threads、HN、Polymarket、GitHub、Digg、Bluesky、TruthSocial、Pinterest、Xiaohongshu、Perplexity、Web grounding 等。
- 对不同来源统一归一化为 `SourceItem`，加上时间、互动、相关性、snippet、metadata。
- 用 weighted reciprocal rank fusion、dedupe、per-author cap、LLM/local rerank、fun judge、entity cluster 合并跨源证据。
- 输出 compact / md / json / html / context，多数路径会包含 badge、evidence envelope、pass-through footer、source coverage、warnings。
- 支持比较模式：`A vs B` 或 `--competitors`，每个实体独立 sub-run，再合成横向比较。
- 支持 HTML brief、SQLite store、watchlist、briefing、Webhook/Slack delivery 等持续监控场景。

**不能做什么：**

- 不是完整 SaaS 产品。没有 Web UI、多租户权限、团队空间、账单、队列、审计后台。
- 不是无需配置的万能 deep research。README 说 Reddit / HN / Polymarket / GitHub 零配置或低配置可用，但高质量 X、YouTube、TikTok、Instagram、Web grounding、Perplexity 仍依赖浏览器 cookie、CLI、API key 或宿主 WebSearch。
- 不能绕过平台反爬和 ToS 风险。X、Reddit、YouTube、TikTok 类来源天然会随平台策略变化而断裂。
- 不能保证每个 harness 完全同等体验。最佳路径明显偏 Claude Code marketplace + Agent Skills install；其他宿主更多依赖兼容语义。
- 不能替代企业级 social listening / compliance tooling。它更像个人/小团队 research skill，而不是 Brandwatch / Meltwater / Sprinklr 级别的治理平台。

### 集成成本

| 维度 | 评估 |
|------|------|
| 安装复杂度 | 低。Claude Code 走 `/plugin marketplace add` + `/plugin install`；其他 50+ harness 走 `npx skills add mvanhorn/last30days-skill -g`；claude.ai 可上传 `.skill` release artifact。 |
| 运行依赖 | Python 3.12+；`uv` 用于 dev/test；运行时核心依赖接近 stdlib，`pyproject.toml` `dependencies=[]`，但外部来源依赖 CLI/API key/cookies。 |
| 默认可用度 | 本机 `--diagnose` 实测无凭证时仅 `reddit`、`hackernews`、`polymarket` 可用；`bird` installed 但未认证，GitHub source 因无 `gh` / token 未启用。 |
| 高质量配置 | 中。需要 `SCRAPECREATORS_API_KEY`、X cookie / `XAI_API_KEY`、`yt-dlp`、`BRAVE_API_KEY` / host WebSearch、`GITHUB_TOKEN` / `gh`、`OPENROUTER_API_KEY` 等按需启用。 |
| 学习曲线 | 中高。普通用户只需会用 `/last30days`；维护者需要理解 1700 行级 `SKILL.md` contract、planner schema、source adapters、render LAWs 和 config priority。 |
| 从零到 demo | Skill 安装后 1-5 分钟可跑基础查询；要跑出 README 展示级跨源效果，需要浏览器登录、API key、host WebSearch 和输出合同配合。 |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | 低 | 根仓库 MIT。vendored `bird-search` 目录有独立 LICENSE；商用前仍应审源平台 ToS 与抓取来源授权。 |
| Bus factor | 中 | 贡献者 42、merged PR 171，社区参与明显；但核心方向、SKILL.md 语义和 release 主导仍高度集中在 Matt Van Horn。 |
| 供应商锁定 | 中 | Skill/源码可 fork；但真实效果依赖 Claude/Codex/Gemini 等宿主模型的工具遵循能力，以及 ScrapeCreators、xAI、OpenRouter、Brave/Exa/Serper/Parallel 等外部服务。 |
| 平台脆弱性 | 高 | Reddit `.json`、X anti-bot、YouTube transcript、TikTok/Instagram scraping 都是长期易碎面。近期 PR/Issue 也集中在这些来源修复上。 |
| 凭证与隐私 | 中高 | 处理 API keys、browser cookies、Codex auth、Keychain。`env.py` 有权限警告和 Keychain 支持，但企业使用仍需要隔离、审计和密钥轮换策略。 |
| 维护趋势 | 活跃 | 2026-05-17 v3.3.0 后仍有 v3.3.1/v3.3.2 源码版本、近期 PR/CI 活跃；Actions 最新 Validate/Security runs 成功。 |
| Release 口径 | 中 | 源码版本 `3.3.2`，但 GitHub latest release/tag 仍是 `v3.3.0`；对依赖 release artifact 的用户可能造成“代码已修但 release 未同步”的认知差。 |
| CI 安全门 | 中 | `Validate` 跑全量 `uv run pytest`；`Security` 跑 pip-audit 和 TruffleHog，但两个安全步骤目前 `continue-on-error: true`，偏 advisory-first。 |
| 社区健康 | 中高 | Stars/Forks 和衍生项目强；但项目只有约 5 个月历史，open PR 72 较高，社区真实长期使用数据还不够。 |

### 采用结论

**推荐采用（个人/小团队研究工作流） / 企业生产化前观望。**

采用建议：可以把它当作“agent 原生实时调研技能”的优秀样本和可直接试用工具，但不要把它未经改造地当企业内部唯一 research backend。

适合采用的方式：

1. 先在 Claude Code / Codex / Hermes 之类宿主里隔离安装，跑几个你关心的主题；
2. 只启用必要来源，先从 Reddit / HN / Polymarket / GitHub / host WebSearch 低风险路径开始；
3. 如果要用于客户/会议情报，配置独立 `LAST30DAYS_MEMORY_DIR`、项目级 `.claude/last30days.env`、store/watchlist；
4. 如果要内部产品化，优先 fork 出 credential boundary、source allowlist、artifact retention、cost logging、webhook 审计和失败可观测性。

不建议直接采用的场景：

- 监管/合规要求高，不能把浏览器 cookie/API key 暴露给本地脚本的组织；
- 需要稳定 SLA 的生产 API；
- 需要多用户权限、团队知识库、审计和数据治理的企业产品；
- 只想做传统网页搜索，不关心社交/评论/盘口/PR/实时社区信号的人。

---

## 场景二：技术架构学习

### 核心架构图

```text
User / Agent Harness
  ├─ Claude Code marketplace plugin
  ├─ Agent Skills CLI: Codex / Cursor / Copilot / Gemini / OpenClaw / etc.
  └─ Slash command: /last30days <topic>
        │
        ▼
SKILL.md agent contract
  ├─ output LAWs: badge, no trailing Sources, footer pass-through, inline links
  ├─ planning contract: host model must produce --plan / --competitors-plan
  ├─ preflight: handles, subreddits, GitHub user/repo, source flags
  └─ execution template: call scripts/last30days.py
        │
        ▼
Python CLI: scripts/last30days.py
  ├─ argparse flags: emit/search/depth/store/auto-resolve/competitors/html
  ├─ config/env loading + child process cleanup
  ├─ comparison fanout / save output / persist report
  └─ calls lib.pipeline.run()
        │
        ▼
Pipeline orchestration: lib/pipeline.py
  ├─ available_sources(config, requested_sources)
  ├─ planner: external --plan or LLM/local deterministic fallback
  ├─ ThreadPoolExecutor per subquery × source
  ├─ source adapters
  │   ├─ reddit_public / reddit ScrapeCreators
  │   ├─ bird_x / xai_x / xurl_x / xquik
  │   ├─ youtube_yt, tiktok, instagram, threads, pinterest
  │   ├─ hackernews, polymarket, github, digg, bluesky, truthsocial
  │   └─ grounding / perplexity / xiaohongshu
  ├─ normalize → relevance signals → prune → dedupe → snippets
  ├─ weighted RRF → rerank → fun score → GitHub enrichment
  ├─ cluster_candidates → warnings
  └─ schema.Report
        │
        ▼
Render / Persist
  ├─ render.py: compact/md/context + evidence envelope + pass-through footer
  ├─ html_render.py: shareable offline HTML brief
  ├─ store.py: SQLite + WAL + FTS5 findings database
  ├─ watchlist.py / briefing.py: recurring research + delivery
  └─ raw artifacts under LAST30DAYS_MEMORY_DIR
```

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| Skill 即产品 | `SKILL.md` 是 agent-facing 主界面，Python engine 是实现细节 | 传统 CLI/SaaS-first 产品形态 | 分发到现有 harness，最大化 agent 用户可用性。 |
| 宿主模型先规划 | named-entity topic 要求宿主模型生成 `--plan` 文件 | 纯 headless deterministic planner 的简单性 | 宿主模型更知道用户意图，能解析人名、产品名、subreddit、handle、竞品。 |
| 多来源并行 fanout | 每个 subquery/source 一个 future | 单一搜索 API 的稳定性 | 社会信号天然分散，必须跨平台过采样后 fusion。 |
| Free-first + optional paid | Reddit/HN/Polymarket 等免费，X/TikTok/Instagram/Web 等按凭证启用 | 默认全量高质量输出 | 降低入门成本，同时让重度用户用自有 keys 解锁更强来源。 |
| 统一证据模型 | `SourceItem` / `Candidate` / `Cluster` dataclass | 保留每个平台原始格式 | 统一排序、dedupe、render、store 和 JSON 输出。 |
| Weighted RRF + rerank | 先确定性融合，再 LLM/local rerank | 完全依赖 LLM judge | 可测试、可降级、可解释，避免模型直接吞原始搜索噪音。 |
| Render LAWs | 输出格式强约束写入 SKILL.md，并在 engine emit badge/footer | 让模型自由写研究报告 | 防止 agent 把 raw evidence 泄露、乱加 Sources、丢 footer、发明标题。 |
| Advisory security CI | pip-audit / TruffleHog 先可见、不阻塞 | 严格 fail-closed 安全门 | 项目迭代快，先建立基线，再逐步收紧。 |

### 值得学习的模式

1. **Agent-facing contract 与 deterministic engine 分层**：`SKILL.md` 约束模型行为，Python engine 承担可测试的 IO、排序、存储、渲染。比“全靠 prompt 搜索”稳得多。
2. **Host model as planner**：把“理解用户 topic 和实体解析”交给宿主 agent，让 engine 接收结构化 JSON plan。这是 agent-native 工具设计的好模式。
3. **Evidence envelope / pass-through footer**：raw evidence 给模型读，footer 给模型原样传，边界用 HTML comments 明确。这是控制 LLM 输出形态的实用技巧。
4. **Source availability gating**：每个来源由 env、CLI、credential、requested_sources 共同决定，缺失时 degrade，而不是让整个 run fail。
5. **Cross-source fusion before synthesis**：先做 dedupe、RRF、per-author cap、cluster，再合成 brief，避免“谁返回最多谁占据叙事”。
6. **Observability baked into output**：diagnose、planner stderr、warnings、source coverage、footer tree、raw save path 让用户知道这次研究到底搜到了什么、缺了什么。
7. **同一能力多分发面**：Claude plugin、Agent Skills、claude.ai `.skill`、OpenClaw、Gemini extension 共享同一 `skills/last30days` payload。
8. **配置文档与运行合同分离**：`CONFIGURATION.md` 面向人，`SKILL.md` 面向 agent，`AGENTS.md` 面向维护者，三者职责清楚。

### 反模式 / 踩坑点

1. **SKILL.md 过长是架构债**：1,700+ 行合同本身已经多次因“模型没读到后半段”触发回归，项目通过把 LAWs 前置、engine emit badge/footer 修补，但这仍是复杂度信号。
2. **source adapters 维护面极宽**：X、Reddit、YouTube、TikTok、Instagram、Threads、Pinterest、Bluesky、TruthSocial、GitHub、Polymarket、Web，每个都可能因平台改接口而坏。
3. **README marketing 与真实可用度之间有配置落差**：零配置能跑基础来源，但 README 展示级效果需要较多 keys/cookies/CLI/host WebSearch。
4. **Release/version 口径漂移**：源码 3.3.2，latest GitHub release/tag 3.3.0。对用户和包管理器都是小风险。
5. **安全扫描目前非阻塞**：项目处理 cookies/tokens，长期应把安全 baseline 收紧。
6. **高 star 不能等同生产成熟**：项目创建不到半年，真实企业用例、SLA、长期合规经验还未沉淀。
7. **比较模式和 planner 逻辑复杂**：`--competitors`、vs-mode、per-entity plan、auto_resolve、polymarket keyword filter 等已经很强，但也提高了维护/测试难度。

### 可借鉴的具体技术点

- `--plan` 接收文件路径而不是 inline JSON，避免 apostrophe / shell quoting 坑。
- `available_sources()` 把“是否有 key / CLI / requested source / exclude source”集中到一个边界函数。
- `RetrievalBundle` 同时维护 by `(label, source)` 和 by `source` 的索引，便于 fusion 和 source coverage。
- `weighted_rrf()` 里按 URL normalize dedupe、per-author cap、source diversity reservation，很适合复用到多源检索系统。
- `render_compact()` 用 evidence envelope + canonical boundary，让模型知道哪些读、哪些传、哪些不要输出。
- `store.py` 的 SQLite + WAL + FTS5 + URL dedupe 可作为轻量研究记忆层模板。
- `watchlist.py` 把 recurring topic、budget、webhook delivery 放在脚本层，不急着做完整后台服务，符合个人工具演进路径。

---

## 架构解剖

### 目录结构

```text
last30days-skill/
├── README.md                         # 产品定位、安装、功能说明
├── skills/last30days/
│   ├── SKILL.md                      # canonical runtime spec，agent 读取的真正产品界面
│   ├── scripts/
│   │   ├── last30days.py             # CLI / argparse / emit / save / competitors entrypoint
│   │   ├── store.py                  # SQLite research store
│   │   ├── watchlist.py              # recurring topic + delivery
│   │   ├── briefing.py               # store digest generator
│   │   ├── build-skill.sh            # .skill artifact packaging
│   │   └── lib/
│   │       ├── pipeline.py           # orchestration core
│   │       ├── planner.py            # LLM/deterministic query planning
│   │       ├── schema.py             # ProviderRuntime / SourceItem / Candidate / Report
│   │       ├── providers.py          # Gemini/OpenAI/xAI/OpenRouter clients
│   │       ├── fusion.py             # weighted RRF + dedupe + diversity
│   │       ├── render.py             # compact/md/context renderer + footer
│   │       ├── html_render.py        # shareable HTML brief
│   │       ├── env.py                # env/.env/Codex auth/Keychain/cookie availability
│   │       └── <source adapters>.py  # reddit, x, youtube, tiktok, github, etc.
│   ├── references/                   # user-facing helper docs
│   ├── assets/                       # demo assets
│   └── agents/openai.yaml            # agent metadata
├── tests/                            # 91 test_*.py，pytest 1,617 cases 实测通过
├── docs/solutions/                   # historical solution notes / bug patterns
├── .claude-plugin/plugin.json        # Claude Code marketplace metadata
├── gemini-extension.json             # Gemini CLI extension metadata
├── hooks/hooks.json                  # SessionStart config check hook
├── .github/workflows/                # validate / security / release
├── CONFIGURATION.md                  # user-facing config reference
├── CONCEPTS.md                       # Skill / Engine / Harness vocabulary
└── AGENTS.md / CLAUDE.md             # maintainer guidance
```

### 技术栈

- **运行时 / 语言**：Python 3.12+；少量 Bash/JS；核心运行时依赖接近 stdlib。
- **包管理 / 测试**：`uv` + `pytest` + `pytest-cov`；`pyproject.toml` 配置测试路径。
- **分发**：GitHub repo archive、Claude Code plugin marketplace、Agent Skills CLI、`.skill` artifact、Gemini extension、OpenClaw。
- **CI/CD**：GitHub Actions：`Validate` 跑 `uv run pytest`；`Security` 跑 pip-audit / TruffleHog；`Release` tag push 时构建 `dist/last30days.skill` 并发布 GitHub Release。
- **存储**：SQLite WAL + FTS5，默认 `~/.local/share/last30days/research.db`。
- **外部来源**：Reddit public JSON / ScrapeCreators、Bird/X cookies、xAI、xurl、yt-dlp、ScrapeCreators、HN Algolia、Polymarket Gamma、GitHub API/gh、Digg CLI/API、Brave/Exa/Serper/Parallel、OpenRouter/Perplexity 等。

### 模块依赖关系

```text
last30days.py
  ├─ env.get_config / diagnose
  ├─ parse flags / competitors / save output
  └─ pipeline.run
        ├─ providers.resolve_runtime / mock_runtime
        ├─ planner.plan_query / _sanitize_plan
        ├─ source adapters via _retrieve_stream
        ├─ normalize / signals / dedupe / snippet
        ├─ fusion.weighted_rrf
        ├─ rerank.rerank_candidates + score_fun
        ├─ github.enrich_candidates_with_stars
        ├─ cluster.cluster_candidates
        └─ schema.Report

render.py / html_render.py / schema.to_dict / store.py
  consume schema.Report and produce user-facing or persisted artifacts.
```

### 扩展机制

- **新增来源**：新增 `lib/<source>.py` adapter，实现 search + parse；在 `MOCK_AVAILABLE_SOURCES`、`available_sources()`、`_retrieve_stream()`、planner `SOURCE_CAPABILITIES`、render label、tests 中注册。
- **新增输出**：在 `last30days.py` `emit_output()` / `emit_comparison_output()`、render/html render 中增加 mode。
- **新增配置**：在 `env.py` 增加 key loading / availability；同步 `CONFIGURATION.md` 和 `SKILL.md`。
- **新增 harness**：新增 metadata / install docs，但真实运行仍依赖 `skills/last30days/SKILL.md` + `scripts/` payload。
- **行为调整**：优先改 `SKILL.md` agent contract 和 engine tests，避免出现“engine 有 flag，agent 不知道怎么用”的半成品。

---

## 质量与成熟度

### 代码质量

- **类型系统**：Python 代码大量使用 dataclass、type hints、`from __future__ import annotations`；不是 mypy strict 项目，但核心模型边界清晰。
- **错误处理**：source fetch 有 429 共享跳过、5xx retry、fallback chain、warnings；`env.py` 对缺失/过期/权限错误有明确状态；`last30days.py` 管理 child process cleanup。
- **代码风格**：整体模块化清楚，但 `render.py` 1,779 行、`pipeline.py` 1,138 行、`last30days.py` 1,036 行、`github.py` 989 行，核心文件偏大，说明抽象还有继续拆分空间。
- **安全意识**：明确不提交真实 secrets；Keychain 支持、file permission warning、TruffleHog、pip-audit、HTML link scheme hardening 相关 PR/CI 都存在。
- **Agent-aware 程度**：极高。`SKILL.md` 不是普通文档，而是围绕模型常见失败模式写的 runtime contract；`AGENTS.md` 明确“Skill 是产品，Engine 是实现”。

### 测试

- **框架**：pytest。
- **实测结果**：`uv run pytest` 在本地新建 `.venv` 后通过：`1617 passed, 4 skipped, 2 subtests passed in 17.60s`。
- **测试规模**：`tests/` 下 91 个 `test_*.py`，约 21k LOC；覆盖 source adapters、planner、pipeline、render、schema、store、CLI、credential/cookie extraction、competitor fanout、watchlist、security workflow 等。
- **测试特点**：很多 fixture/mock 路径，适合离线 CI；近期 issue #541 也显示维护者在修 “mock target stale 导致真实 macOS Keychain prompt” 这类测试隔离问题。
- **不足**：外部平台真实 API 行为变化仍难靠单元测试完全覆盖；README 展示级跨源效果依赖 live credentials，CI 主要验证 contract 和 mock/fixture 层。

### CI/CD

- **Validate**：push / PR 到 main 时跑 `uv run pytest`，近期 Actions runs 成功。
- **Security**：pip-audit against locked dependency set + TruffleHog verified secret scan，当前 `continue-on-error: true`，属于 advisory-first。
- **Release**：tag `v*` 时跑 `build-skill.sh`，用 `git archive HEAD:skills/last30days` 构建 `dist/last30days.skill`，并检查文件数 <= 200、只有一个 `SKILL.md`。
- **发布节奏**：v3.3.0 release 之后源码版本继续到 3.3.2，但 tag/release 未同步到 3.3.2，是当前可见的 release hygiene 小问题。

### 文档质量

- **README**：营销表达强，但同时给出安装、来源、v3 变化、使用场景和 install matrix。
- **SKILL.md**：运行合同极完整，甚至记录了具体历史失败案例；对 agent 行为控制有很高参考价值。
- **CONFIGURATION.md**：比 README 更适合运维，覆盖保存路径、API keys、reasoning provider、web backend、watchlist、per-client patterns。
- **CONCEPTS.md**：明确 Skill / Engine / Harness / Beta channel，降低新贡献者理解成本。
- **CHANGELOG.md**：质量较高，PR/issue 链接细，能看出每个版本修了什么真实问题。

### Issue/PR 健康度

- **高活跃但 backlog 大**：open issues 75、open PRs 72；对一个创建不到半年的项目来说，热度和维护压力都很高。
- **响应速度**：近期 PR/issue 每天都有，Actions 成功，维护者合并/修复节奏快。
- **真实痛点集中**：安装兼容、browser cookie/X auth、YouTube transcript、Reddit fallback、config defaults、release/provenance、Hermes 安装安全阻断。
- **Closed issues 质量**：#239 Claude Code plugin path escape、#195 env.py get_config、#307 OpenClaw stale bundle 等都说明项目在真实用户路径中修过硬问题。

---

## 社区与生态

### 热度与认可度

- 39k+ stars / 3.1k+ forks 对一个 2026-01 创建项目来说非常高，说明“agent skill + realtime social research”这个概念传播强。
- GitHub search 已出现衍生/本地化项目：
  - `Jesseovo/last30days-skill-cn`：中文互联网 8 平台版本，约 518 stars；
  - `levineam/lastXdays-skill`：可配置时间窗版本；
  - `kunhai1994/xhs-research`：小红书调研 skill；
  - `derandomized/last30days-webapp`、`SamppaFIN/NewsScaper` 等 UI/wrapper 尝试；
  - 多个 fork / packaged mirror / OpenClaw adaptation。
- HN Algolia 只搜到 3 条低分记录（2 points 级别），说明大众技术社区讨论还不如 GitHub 热度强。
- Reddit 搜索接口在本环境返回 403，无法作为本次社区情绪证据；不据此推断“无讨论”。

### 正面评价集中点

从 README、衍生项目和 issue/PR 方向看，正向认可主要集中在：

- **产品概念强**：把“最近 30 天真实人群信号”包装成 agent slash command，理解成本低。
- **来源覆盖广**：Reddit comments、X、YouTube transcripts、TikTok/Instagram、HN、Polymarket、GitHub、Digg、Web 比普通 search skill 更广。
- **agent-native 分发**：不要求用户换平台，直接装到 Claude Code / Codex / Cursor 等工作流里。
- **维护响应快**：从 changelog 看，Reddit、X、YouTube、installer、Windows、security、configuration 都在持续修。
- **测试体系强**：本地 1,617 tests 通过，对这样的平台适配型项目是重要成熟度信号。

### 真实痛点

高反应/高评论 issue 和近期 open items 暴露的真实痛点：

- **安装/分发路径容易漂移**：#239 “Path escapes plugin directory”、#237 marketplace errors、#362 plugin.json validator、#184 Gemini CLI install。
- **X / browser cookie / Bird 依赖脆弱**：#19 Bird missing、#22 Bird capabilities、#498 Firefox multi-profile cookie extraction。
- **YouTube transcript 与 relevance budget 是高频易碎点**：#468 transcript 提取成功但被 relevance pruning，#469 多语言 transcript fallback，#531 transcript budget 被 out-of-window videos 消耗。
- **配置默认值与新用户路径会出错**：#328 `INCLUDE_SOURCES` unset 导致 `NoneType.split`，#394 no config file 时 yt-dlp detection skipped，#539 check-config empty last-run 行为。
- **发布/供应链仍在补强**：#540 artifact attestation、#534 provenance attestation。
- **Hermes 安装安全阻断**：#513 显示某些 agent/harness 的安全策略会挡住安装路径，需要更明确的 installer/permission story。

### 竞品与替代分层

**直接竞品 / forks：**

- `last30days-skill-cn`：中文平台本地化版本，是最明确的地区化直接竞品/衍生。
- `lastXdays-skill`：可配置时间范围，直接扩展 last30days 的时间窗限制。
- `xhs-research`：聚焦小红书平台的 research skill。
- 各种 wrapper/webapp/mirror：说明有人希望把它从 skill 变成 UI 或服务。

**邻近替代：**

- Perplexity / Sonar / OpenAI Deep Research / ChatGPT Search / Gemini Deep Research：覆盖 web citation 和 synthesis，但通常不如 last30days 这样把 Reddit comments、X cookies、Polymarket、GitHub PR/person-mode、TikTok/Instagram 作为一等来源。
- Exa / Tavily / Brave / Serper / Parallel：更像 grounding/search backend，不是完整 agent skill。
- Brandwatch / Sprout / Meltwater 等 social listening 产品：企业治理更强，但不如 agent-native、开源可改、开发者工作流内联。

**架构邻居：**

- `obra/superpowers`：同为 Skill-as-code，值得对比 skill contract 写法与 agent compliance 策略。
- `ECC` / `vibecode-pro-max-kit`：同为多 harness assets / hooks / skills / installer 的工作流底座。
- `CodeGraph` / `GitNexus`：不同领域，但同样体现“确定性索引/证据层 + agent 消费层”的分层设计。

---

## 关键代码走读

### 1. `skills/last30days/SKILL.md`

- **职责**：整个产品的 agent-facing runtime contract。
- **实现要点**：
  - YAML frontmatter 定义 name/version/allowed-tools/homepage/repository/optional env。
  - 前置 STEP 0 处理 Claude Code marketplace stale clone 问题。
  - OUTPUT CONTRACT 把 badge、no Sources block、no invented title、no section header、footer pass-through、inline links 等写成硬性 LAWs。
  - LAW 7 要求宿主 reasoning model 自己生成 `--plan`，不要让 engine 退到 deterministic fallback。
  - 记录大量历史失败案例，本质是“用事故驱动的 prompt hardening”。

### 2. `skills/last30days/scripts/last30days.py`

- **职责**：CLI entrypoint，解析参数、调用 pipeline、保存/输出/persist、比较模式 fanout。
- **实现要点**：
  - 启动时强制 Python 3.12+。
  - `build_parser()` 支持 `--emit`、`--search`、`--quick/--deep`、`--plan`、`--store`、`--auto-resolve`、`--github-user/repo`、`--competitors`、`--competitors-plan`、`--polymarket-keywords` 等。
  - `emit_output()` / `emit_comparison_output()` 分离普通和比较输出。
  - `save_output()` 根据 topic slug 保存 raw md/json/html。
  - child process PID registry + atexit cleanup，防止外部 CLI 残留。

### 3. `skills/last30days/scripts/lib/pipeline.py`

- **职责**：研究引擎核心 orchestration。
- **实现要点**：
  - `available_sources()` 根据 config、CLI、env、installed bins 动态决定可用来源。
  - `run()` 生成 date range、resolve runtime、sanitize external plan 或调用 planner。
  - GitHub project/person mode 在主 loop 前单独运行，避免普通 keyword search 噪音。
  - `ThreadPoolExecutor` 并行执行 subquery × source，支持 429 共享跳过、5xx retry。
  - Phase 2 做 supplemental entity searches；Phase 2b retry thin sources。
  - 最后 normalize/dedupe/RRF/rerank/fun score/GitHub star enrichment/cluster/warnings，返回 `schema.Report`。

### 4. `skills/last30days/scripts/lib/planner.py`

- **职责**：把用户 topic 变成结构化 retrieval plan。
- **实现要点**：
  - 定义 intent、cluster_mode、source capabilities、quick source priority。
  - `_build_prompt()` 明确 JSON schema 和 search_query 规则，要求不要把 “last 30 days / news / latest” 这类 meta phrases 放进搜索词。
  - `_sanitize_plan()` 对 LLM 输出做 intent/source/subquery/weight 清洗。
  - 无 provider 时打印 LAW 7 warning，并退回 deterministic fallback。

### 5. `skills/last30days/scripts/lib/schema.py`

- **职责**：统一数据模型。
- **实现要点**：
  - `ProviderRuntime`、`SubQuery`、`QueryPlan`、`SourceItem`、`Candidate`、`Cluster`、`Report`、`RetrievalBundle` 都是 dataclass。
  - `SourceItem` 把不同平台统一到 title/body/url/author/container/published_at/engagement/relevance/snippet/metadata。
  - `Candidate` 保留 provenance、source_items、rrf/rerank/fun score，适合 debug 和 JSON 输出。

### 6. `skills/last30days/scripts/lib/fusion.py`

- **职责**：多源候选融合。
- **实现要点**：
  - URL normalize 去 tracking params、`www/old/m` prefix。
  - 标准 RRF_K=60；按 subquery weight × source weight 加权。
  - per-author cap 限制单个作者最多 3 条，防止某个 X/Reddit 用户刷屏。
  - diversity reservation 确保每个 relevance 合格来源至少有机会进入 pool。

### 7. `skills/last30days/scripts/lib/render.py`

- **职责**：把 `Report` 渲染成模型可消费和用户可读的输出。
- **实现要点**：
  - `_render_badge()` engine 直接输出 mandatory badge，降低模型忘记 badge 的概率。
  - `render_compact()` 输出 evidence envelope：raw evidence 给模型读，但禁止原样给用户。
  - pass-through footer 用 HTML comments 标记，要求模型原样传。
  - 有 freshness warning、warnings、source coverage、best takes、comparison scaffold、canonical boundary。

### 8. `skills/last30days/scripts/lib/env.py`

- **职责**：配置、凭证和 source availability 的基础层。
- **实现要点**：
  - 支持 `~/.config/last30days/.env` 和 project-scoped `.claude/last30days.env`。
  - POSIX secrets file 权限检查。
  - macOS Keychain optional credential source。
  - Codex auth.json JWT 读取、过期检查、account id extraction。
  - 各 source 的 availability helper 被 pipeline 使用。

### 9. `skills/last30days/scripts/store.py` / `watchlist.py`

- **职责**：把一次性 research 变成持续监控。
- **实现要点**：
  - SQLite WAL、FTS5、findings URL unique dedupe、sighting count。
  - watchlist 支持 add/remove/list/run-one/run-all、daily budget、Slack/generic webhook。
  - `run-all` 对每个 enabled topic 调用 engine `--emit=json --quick --lookback-days 90`，再把 findings 写回 store。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 5 | 社交、视频、论坛、预测市场、GitHub、Web、HTML、store、watchlist、比较模式覆盖很广。 |
| 代码质量 | 4 | 数据模型和测试强，错误处理积极；但核心文件偏大，source adapters 复杂度高。 |
| 文档质量 | 5 | README、SKILL.md、CONFIGURATION.md、CHANGELOG、CONCEPTS 都很完整，且事故驱动。 |
| 社区活跃度 | 4 | stars/forks/PR 很强，但项目年轻、open PR 多，真实长期 adoption 仍需观察。 |
| 架构设计 | 5 | Skill contract + deterministic engine + evidence fusion + render boundary 是优秀 agent-native 架构。 |
| 学习价值 | 5 | 对 agent skill、planner contract、多源检索、LLM 输出约束都有高学习价值。 |
| 可借鉴度 | 5 | `--plan`、source gating、RRF、evidence envelope、SQLite store、watchlist 都可直接迁移。 |

---

## 总结

### 一句话评价

last30days-skill 是目前很值得拆的 **agent-native research skill 标杆**：它把“跨平台实时社会信号”做成了可被 agent 调用、可测试、可降级、可分发的技能包，而不是停留在 prompt + search 的玩具层。

### 谁应该用

- 个人研究、会议前情报、产品需求发现、竞品/人物动态跟踪；
- 已使用 Claude Code / Codex / Cursor / Gemini CLI 等 harness 的用户；
- 想搭内部“社交信号研究助手”的小团队；
- 想学习 Skill-as-product、agent contract、evidence fusion 的工程团队。

### 谁不应该直接用

- 对凭证、cookie、数据留存、外部平台 ToS 有严格合规要求的企业；
- 需要稳定 SLA、多用户审计、后台权限和成本控制的生产产品；
- 不想配置 API key / browser session / CLI，只想“一键全网高质量研究”的用户。

### 下一步

1. 作为工具：建议先用隔离环境安装，启用最少来源跑 3-5 个真实 topic，对比 Perplexity / ChatGPT Deep Research 的输出差异。
2. 作为架构样本：重点拆 `SKILL.md`、`pipeline.py`、`planner.py`、`fusion.py`、`render.py`、`store.py`。
3. 如果要产品化：先做 credential boundary、source allowlist、cost log、artifact retention、security CI fail-closed、release/version hygiene，再考虑团队化界面。
