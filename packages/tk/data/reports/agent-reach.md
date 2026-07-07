# Agent Reach

> 一句话定位：**Agent Reach 是给 AI Agent 装“互联网读取与搜索能力”的本地能力层：它不自己实现完整爬虫/浏览器/搜索引擎，而是为 Twitter/X、Reddit、YouTube、GitHub、B站、小红书、V2EX、雪球、RSS、Exa、网页等渠道选择、安装、体检和路由当下最可用的上游工具，让宿主 Agent 直接调用这些工具完成内容获取。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `Panniantong/agent-reach` |
| URL | `https://github.com/Panniantong/agent-reach` |
| Star | 30,034（2026-06-16 观测；见社区风险中 fake engagement 说明） |
| Fork | 2,442 |
| 许可证 | MIT |
| 主要语言 | Python |
| GitHub created_at | 2026-02-24 |
| 首次提交 | 2026-02-24，本地 `git log`：`ee2ad83 Initial: forked from runesleo/x-reader (MIT License)` |
| 最近提交 | 2026-06-12，本地 HEAD：`71b85f8 docs(readme): clarify browser action boundary` |
| 最新 Release / Tag | `v1.5.0`，2026-06-11，`能力层:多后端路由 + 真体检 + OpenCLI` |
| 贡献者数 | GitHub contributors API 首页 30；主要贡献集中在 Panniantong / Pnant |
| Issue / PR | open issues 32，open PRs 27；repo API `open_issues_count=59` 含 PR；merged PRs 142，closed issues 90（2026-06-16 GitHub Search 口径） |
| 代码规模 | 89 tracked files；Python 45 files；`agent_reach` 30 Python files / 约 3,765 非空非注释 LOC；tests 15 files / 约 2,218 LOC |
| 验证记录 | 静态复核源码、文档、Git 历史、GitHub API / Release / Issue / PR 元信息；保留 2026-06-14 既有实测记录：`py_compile` 45 files OK、`pytest -q` 162 passed、wheel build + clean venv smoke install OK；`ruff check` / `mypy` 未通过，详见质量章节 |
| 分析日期 | 2026-06-16 |
| 分类 | Agent Internet Capability Layer |

---

## 场景一：是否值得采用

### 解决的问题

大多数 AI Agent 理论上能“联网”，但现实里访问互联网内容会被具体平台碎片化能力卡住：

- YouTube / B站：字幕、音频、反爬和地区风控不同。
- Twitter/X / Reddit / 小红书：官方 API 成本高、审批制、Cookie 登录态、反机器人策略频繁变化。
- GitHub / RSS / 普通网页 / V2EX / 雪球：各有不同 CLI、API、认证与清洗方式。
- 搜索：通用搜索 API 要么成本高，要么不适合 Agent 直接消费。

Agent Reach 的产品判断是：**Agent 不需要再记住每个平台的最佳工具组合；Agent 只需要安装一个能力路由层，由它告诉 Agent 当前哪个后端可用、怎么调用、坏了怎么修。**

目标用户：

- 使用 Claude Code / OpenClaw / Cursor / Windsurf / Codex 等本地 Agent 的开发者；
- 需要让 Agent 做跨平台调研、内容摘要、社媒口碑读取的人；
- 希望沉淀“互联网读取能力层”而不是每次临时安装工具的 agent operator；
- 想学习多后端能力路由、健康检查、agent-facing Skill 分发的开发者。

### 核心能力与边界

**能做什么：**

- 提供 `agent-reach install / doctor / configure / skill / transcribe / watch / check-update` 等 CLI。
- 注册 13 个渠道：GitHub、Twitter/X、YouTube、Reddit、Bilibili、小红书、LinkedIn、小宇宙、V2EX、雪球、RSS、Exa Search、Web。
- 每个平台维护一个 ordered backend list，并通过 `doctor --json` 输出当前 `active_backend`。
- 区分零配置渠道、免费 key / 登录态渠道、复杂配置渠道。
- 安装 agent-facing `SKILL.md` 到 `~/.agents/skills` / `~/.openclaw/skills` / `~/.claude/skills`，让宿主 Agent 学会调用上游工具。
- 将 Cookie / token 等配置保存在 `~/.agent-reach/config.yaml`，并尽量以 0o600 权限写入。
- 对 stale venv shim、CLI 断链、OpenCLI 扩展睡眠/未安装、YouTube JS runtime、mcporter/Exa 配置等常见故障给出可复制处方。
- 支持 YouTube / 小宇宙等音频转写路径：yt-dlp + ffmpeg + Groq/OpenAI Whisper API。

**不能做什么：**

- 不是完整浏览器自动化平台。README 已明确“读内容 vs 操作网页”边界：它不替代登录后的复杂网页操作、表单提交、多账号隔离、并行浏览器会话。
- 不是统一代理服务或云端 API。真实读取由 twitter-cli、OpenCLI、gh、yt-dlp、bili-cli、rdt-cli、mcporter/Jina/Exa 等上游工具完成。
- 不能保证所有平台长期稳定。Reddit、X、小红书、B站、LinkedIn 的反爬与登录态策略都可能随时变化。
- 不解决平台 ToS / 封号 / 账号风控风险。项目文档建议使用专用小号和 Cookie-Editor。
- 目前不是 PyPI 正式包分发路径；本次查询 `https://pypi.org/pypi/agent-reach/json` 返回 404，安装主要走 GitHub archive / pipx / editable / wheel。

### 集成成本

| 维度 | 评估 |
|------|------|
| 安装复杂度 | 中低。基础命令是 `pipx install https://github.com/Panniantong/agent-reach/archive/main.zip` + `agent-reach install --env=auto`；但非 safe 模式会尝试安装系统依赖和 npm 全局包。 |
| 运行依赖 | Python 3.10+；核心依赖 requests、feedparser、python-dotenv、loguru、PyYAML、rich、yt-dlp；可选 Playwright / mcp / browser-cookie3。 |
| 上游工具依赖 | gh CLI、Node/npm、mcporter、yt-dlp、twitter-cli、OpenCLI、bili-cli、rdt-cli、xiaohongshu-mcp、ffmpeg 等按渠道启用。 |
| 默认可用度 | Web / GitHub 公共读 / YouTube 字幕 / RSS / V2EX / B站基础搜索 / Exa（需 mcporter 配置）是低门槛；Twitter、Reddit、小红书、雪球等需要登录态或 Cookie。 |
| 学习曲线 | 普通用户低：复制安装句子给 Agent；维护者中等：需要理解 channel registry、backend probing、credential handling、Skill 分发。 |
| 从零到 demo | 本地开发机几分钟可完成基础渠道；要让 Twitter/Reddit/小红书稳定可用，取决于浏览器登录态、Chrome 扩展、Cookie、代理。 |


### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键库 / SDK。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| `yt-dlp` | CLI / library | YouTube metadata, subtitles, and audio download for transcription | Avoids writing a video extractor and platform-specific downloader | `pyproject.toml`; `agent_reach/channels/youtube.py`; `agent_reach/transcribe.py`; `skill/references/video.md` | Reuse when an agent needs YouTube media/subtitle access and can accept upstream CLI/platform churn | Do not assume it works for every video platform; this report explicitly says Bilibili moved away from yt-dlp due to 412 risk control |
| `feedparser` | parser | RSS feed parsing backend | Avoids hand-writing RSS/Atom parsing and edge-case handling | `pyproject.toml`; `agent_reach/channels/rss.py`; `skill/references/web.md` | Reuse for lightweight RSS ingestion before building a crawler | RSS is only one channel; it does not solve logged-in/social content |
| `mcp` / `mcporter` | protocol / CLI bridge | Expose or route MCP-backed web/search/social tools | Avoids inventing a custom agent tool protocol for every upstream service | `pyproject.toml`; `agent_reach/integrations/mcp_server.py`; `channels/exa_search.py`; `guides/setup-exa.md` | Reuse MCP when an agent-facing tool should be discoverable and composable across hosts | MCP server availability, credentials, and local daemon state still need doctor checks |
| `browser-cookie3` | credential access | Optional browser cookie extraction for logged-in channels | Avoids custom browser cookie-store parsing | `pyproject.toml`; `agent_reach/cookie_extract.py` | Evaluate only when the product explicitly needs user-session backed reads | High privacy risk; prefer dedicated accounts, local-only storage, and explicit user consent |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | 低 | 根仓库 MIT，初始提交标注 fork 自 `runesleo/x-reader` MIT。需额外关注上游工具各自许可证和平台 ToS。 |
| Bus factor | 中高 | Stars/Forks 很高，contributors API 显示 30 人，但核心提交高度集中在 Panniantong/Pnant；方向、路由口径、release 主导仍偏单点。 |
| 供应商/上游锁定 | 中 | 项目本身可 fork；但效果绑定多个外部 CLI/MCP/API 和平台登录态，某个上游停更或失效时需要持续换路。 |
| 平台脆弱性 | 高 | README 和 v1.5.0 release 明确记录 B站 yt-dlp 412 风控、Reddit 匿名接口被封、X/小红书需登录态等现实问题。 |
| 安装副作用 | 中 | 默认 install 会尝试配置系统依赖、NodeSource、npm 全局包、mcporter 和 skill；生产/多人机器应优先 `--safe` / `--dry-run`。 |
| 凭证与隐私 | 中 | Cookie/token 本地 0o600 存储，有测试覆盖 shell quoting；但本质仍处理高权限 Cookie，建议专用小号、隔离环境。 |
| 维护趋势 | 活跃 | 2026-06 仍密集发版和 PR；v1.5.0 一次性引入多后端路由、真实探测、OpenCLI。 |
| 分发成熟度 | 中 | wheel build 和 smoke install 本次验证 OK；但 PyPI 未发布，用户主要依赖 GitHub archive。 |
| 社区信号可信度 | 中 | Star 很高且上榜传播明显；open issue #336 的 phantomstars 报告显示 24h 窗口有少量 suspicious/fake engagement，不能只用 star 判断质量。 |

### 结论

**推荐采用（个人/小团队 Agent 工作流） / 企业生产化前观望。**

采用建议：这个项目值得装到可控环境里试用，尤其适合做“让 Agent 读互联网内容”的统一入口。但不要把它理解成“稳定的互联网数据 API”；它更像一个**持续维护的本地能力清单 + 安装器 + 体检器 + Skill 分发包**。

推荐采用方式：

1. 在个人开发机或隔离容器里先跑 `agent-reach install --safe` / `--dry-run` 看副作用；
2. 先启用低风险零配置渠道：Web、GitHub、RSS、V2EX、YouTube、B站基础搜索、Exa；
3. Twitter/Reddit/小红书/雪球走专用小号 Cookie，不要用主账号；
4. 定期跑 `agent-reach doctor --json`，把 `active_backend` 当作运行时事实来源；
5. 如果内部产品化，先 fork：收紧 install 权限、固定上游版本、增加 sandbox、审计 token 写入、补 ruff/mypy/安全扫描 CI。

不建议直接采用的场景：

- 需要 SLA / 合规审计 / 多租户权限的生产数据服务；
- 不能接受 Cookie 登录态或平台 ToS 风险的企业环境；
- 希望 Agent 直接执行网页表单、下单、发布、点赞、登录操作的自动化场景；
- 不愿维护上游 CLI/MCP 变更的人。

---

## 场景二：技术架构学习

### 核心架构图

```text
User / Host Agent
  Claude Code / OpenClaw / Cursor / Codex / Windsurf / generic agents
        │
        │ reads install/update docs + installed SKILL.md
        ▼
Agent Reach CLI
  agent-reach install / doctor / configure / skill / transcribe / watch
        │
        ├─ Config layer
        │   ├─ ~/.agent-reach/config.yaml  (tokens/cookies/proxy/backend override)
        │   ├─ env vars fallback
        │   └─ 0o600 credential writes + browser cookie extraction
        │
        ├─ Channel registry
        │   ├─ GitHub / Twitter / YouTube / Reddit / Bilibili / XiaoHongShu
        │   ├─ LinkedIn / Xiaoyuzhou / V2EX / Xueqiu / RSS / Exa / Web
        │   └─ each channel: can_handle(url) + ordered_backends(config) + check(config)
        │
        ├─ Health probing
        │   ├─ probe_command(): missing / broken / timeout / error / ok
        │   ├─ stale venv shim detection
        │   ├─ OpenCLI daemon + Chrome extension readiness
        │   └─ active_backend surfaced by doctor --json
        │
        ▼
Upstream tools / services  (Agent calls these directly after install)
  Jina Reader · gh CLI · yt-dlp · mcporter + Exa MCP · feedparser
  twitter-cli · OpenCLI · rdt-cli · bili-cli · xiaohongshu-mcp · Xueqiu/V2EX APIs
        │
        ▼
Internet content returned to the host Agent for summarization / research / workflow use
```

### 底层技术架构

#### 最小架构内核

Agent Reach 脱掉 README、安装文案和具体平台之后，真正成立的最小内核是：

```text
Capability Registry
  + Ordered Backend Routing
  + Side-effect-aware Health Probe
  + Local Config / Credential Store
  + Agent-facing Skill Contract
  + Upstream Tool Direct Invocation
```

它不是“把所有互联网平台统一包成一个 API”的系统，而是一个**能力控制面**：负责声明 Agent 需要哪些互联网能力、当前有哪些候选后端、哪个后端真的可用、坏了该如何修、以及宿主 Agent 应该调用哪个外部工具。真实内容读取的数据面仍由上游 CLI / MCP / API / 浏览器会话完成。

这也是它最可复刻的架构价值：**把易变平台能力从 prompt 猜测，变成可体检、可路由、可分发、可审计的本地 runtime contract。**

#### 核心抽象

| 抽象 | 源码位置 | 职责 | 关键字段 / 方法 | 为什么重要 |
|------|----------|------|-----------------|------------|
| `Channel` | `agent_reach/channels/base.py` | 一个互联网平台能力，例如 Twitter、Reddit、YouTube、B站 | `name`、`description`、`backends`、`tier`、`active_backend`、`can_handle()`、`check()` | 把“平台”从安装脚本和 README 里提升成可注册、可体检、可路由的对象。 |
| Backend candidate | 各 `channels/*.py` 的 `backends` | 同一平台的候选实现，例如 `twitter-cli`、`OpenCLI`、`bird CLI` | ordered list；`ordered_backends(config)`；`<channel>_backend` override | 平台接入方式会变，系统通过重排候选后端而不是重写平台能力来恢复可用性。 |
| `ProbeResult` | `agent_reach/probe.py` | 外部命令健康状态的标准化结果 | `status=ok/missing/broken/timeout/error`、`output`、`hint` | 解决 `which()` 假阳性：命令存在但 venv 断链、执行超时、登录失败，是完全不同的修复路径。 |
| `Config` | `agent_reach/config.py` | 本地配置与凭证事实源 | `~/.agent-reach/config.yaml`、`get()` env fallback、`save()` 0o600、`FEATURE_REQUIREMENTS` | 让 backend override、API key、Cookie、proxy 有统一来源，同时降低凭证文件权限风险。 |
| Doctor result | `agent_reach/doctor.py` | 所有 channel 的机器可读运行时状态 | `status`、`name`、`message`、`tier`、`backends`、`active_backend` | 这是 Agent 判断“现在该走哪条路”的运行时事实，而不是 README 里的静态承诺。 |
| OpenCLI status | `agent_reach/backends/opencli.py` | 桌面浏览器登录态后端的状态模型 | `installed`、`broken`、`daemon_running`、`extension_connected`、`extension_installed`、`ready` | 把“浏览器扩展睡眠”和“未安装扩展”区分开，避免误杀可用后端。 |
| Agent Skill Contract | `agent_reach/skill/SKILL.md` + references | 给宿主 Agent 的操作协议 | 触发条件、平台路由表、命令组、doctor 规则、setup guides | 对 Agent-native 工具来说，Skill 不是文档附件，而是模型调用外部工具的 runtime interface。 |
| Installer step | `agent_reach/cli.py` | 把能力层落到本机环境 | `install --safe/--dry-run/--channels`、system deps、mcporter、OpenCLI、skill copy | 互联网能力依赖大量本地工具，安装器必须把副作用显式化，并提供安全刹车。 |
| Credential material | `cookie_extract.py` / `Config.save()` | Cookie / token 的采集、落盘和同步 | rookiepy/browser_cookie3、0o600、`shlex.quote`、best-effort legacy sync | 平台登录态是能力可用性的核心外部状态，也是最大安全风险点。 |
| Transcription job | `transcribe.py` | 少数由 Agent Reach 自己承载的数据面能力 | yt-dlp 下载、ffmpeg 压缩/切块、Groq→OpenAI Whisper fallback | 证明项目不是完全无数据面，但把数据面限制在明确、可边界化的音频转写场景。 |

#### 控制面 / 数据面

**控制面：Agent Reach 自己负责。**

- `cli.py`：接收 `install / configure / doctor / skill / watch / transcribe` 等入口，组织安装、配置、体检、Skill 分发。
- `channels/__init__.py`：静态注册所有平台能力，形成 capability registry。
- `Channel.ordered_backends(config)`：基于默认顺序和用户 override 生成候选后端顺序。
- `doctor.check_all()`：遍历 channel，隔离单 channel 异常，生成统一状态表。
- `probe_command()` / `opencli_status()`：把外部工具健康状态转成可审计分类。
- `Config` / `cookie_extract`：管理本地配置、凭证、Cookie 导入和安全写入。
- `skill/SKILL.md`：把“如何用这些能力”分发给宿主 Agent。

**数据面：大多数真实读取不经过 Agent Reach。**

- GitHub 内容：主要由 `gh` CLI / GitHub Web/API 完成。
- YouTube：`yt-dlp` / 字幕 / 音频链路完成。
- Twitter / Reddit / 小红书 / B站：由 `twitter-cli`、`OpenCLI`、`rdt-cli`、`bili-cli`、`xiaohongshu-mcp` 等上游完成。
- Search / Web / RSS：由 mcporter+Exa、Jina、feedparser、requests/平台 API 完成。
- 宿主 Agent：读取 `doctor --json` 和 Skill 后，直接调用这些上游工具并消费返回内容。

这条分离是 Agent Reach 的关键 trade-off：它避免成为所有平台的中心代理服务，也因此把生产稳定性绑定在上游工具和平台状态上。

#### 关键执行链路

**链路一：doctor 体检与 active backend 选择**

```text
agent-reach doctor --json
  ↓
Config() 读取 ~/.agent-reach/config.yaml + env fallback
  ↓
doctor.check_all(config)
  ↓
get_all_channels() 返回 Channel singleton 列表
  ↓
每个 Channel.check(config)
  ↓
ordered_backends(config) 生成候选后端顺序
  ↓
probe_command(...) / opencli_status() / platform-specific check
  ↓
第一个 ok backend 获胜；没有 ok 时选第一个 warn；只有 broken/timeout/error 则 error
  ↓
Channel.active_backend = 获胜后端；异常时 doctor 清空 active_backend
  ↓
输出 {status, name, message, tier, backends, active_backend}
```

这条链路的重点是：`active_backend` 是运行时观测结果，不是配置声明。Agent 应该信 doctor 输出，而不是自己猜 README 首选后端。

**链路二：安装与能力落地**

```text
agent-reach install --env=auto --safe/--dry-run --channels=...
  ↓
_detect_environment() 区分 local / server
  ↓
安全模式判断：dry-run 只打印；safe 跳过系统改动；默认执行安装
  ↓
安装/检查 gh、Node、undici、yt-dlp JS runtime、mcporter/Exa
  ↓
按 --channels 安装可选后端：twitter-cli、OpenCLI、rdt-cli、bili-cli 等
  ↓
本地桌面且需要 Cookie 时尝试 configure_from_browser()
  ↓
check_all(config) 立即体检安装结果
  ↓
_install_skill() 复制 SKILL.md + references 到 ~/.agents / ~/.openclaw / ~/.claude
```

安装链路的真实目标不是“把一个包装好”，而是把一组外部能力、凭证、后端候选和 Agent 操作说明落到同一台机器上。

**链路三：宿主 Agent 使用平台内容**

```text
Host Agent 收到 URL / 搜索任务
  ↓
读取 agent-reach Skill 路由说明
  ↓
运行 agent-reach doctor --json 获取 active_backend
  ↓
按平台和 active_backend 选择上游命令
  ↓
直接调用 twitter/opencli/rdt/bili/yt-dlp/gh/mcporter/feedparser 等
  ↓
拿到原始内容 / YAML / JSON / transcript
  ↓
由宿主 Agent 完成摘要、研究、工作流下一步
```

这条链路解释了为什么 Agent Reach 的“数据面”很薄：它把自己放在使用前的能力发现和路由环节，而不是放在每次读取调用的中间。

**链路四：Cookie / token 配置与安全同步**

```text
agent-reach configure --from-browser chrome
  ↓
cookie_extract.extract_all(browser)
  ↓
rookiepy 优先；失败则 browser_cookie3
  ↓
按 PLATFORM_SPECS 匹配 Twitter/X、小红书、B站、雪球 cookies
  ↓
Config.set(...) 写入 ~/.agent-reach/config.yaml
  ↓
Config.save() 用 os.open(..., 0o600) 创建/截断
  ↓
legacy 工具 best-effort sync：xfetch session.json / bird credentials.env
  ↓
credentials.env 用 shlex.quote，测试验证 source 时不会执行注入 payload
```

这里的状态契约是：Agent Reach config 是事实源；legacy sync 是兼容副产物，失败不影响主配置。

**链路五：音频转写数据面**

```text
agent-reach transcribe <url-or-file> --provider auto
  ↓
检查 groq/openai key，缺失则 fail-closed，避免先下载大文件
  ↓
URL 用 yt-dlp 下载音频；本地文件直接进入处理
  ↓
ffmpeg 压缩到 mono / 16kHz / 32kbps
  ↓
大于 24MB 切成 10 分钟 chunks
  ↓
每段按 Groq → OpenAI 顺序调用 Whisper-compatible API
  ↓
拼接 transcript 输出 / 写文件
```

这是项目少数自己承载的数据处理链路，特点是依赖检查前置、外部命令 timeout 有上限、provider fallback 明确。

#### 状态模型

| 状态类型 | 位置 | 谁读写 | 生命周期 / 一致性规则 |
|----------|------|--------|------------------------|
| 持久配置 | `~/.agent-reach/config.yaml` | `Config.load/save/set/delete`，CLI configure，cookie import | 本地事实源；配置文件优先，env var fallback；敏感内容 mask 展示；Unix 下 0o600 写入。 |
| Agent 操作合同 | `~/.agents/skills/agent-reach`、`~/.openclaw/skills/agent-reach`、`~/.claude/skills/agent-reach` | `_install_skill()` / `_uninstall_skill()` | 分发态文档；应随版本更新，否则宿主 Agent 会拿旧路由表调用。 |
| 上游工具状态 | pipx/uv/npm/global CLI、mcporter config、OpenCLI daemon、Chrome extension、yt-dlp config | install handlers、用户、上游工具自身 | 外部状态；Agent Reach 只能探测和给处方，不能保证长期一致。 |
| 平台登录态 | 浏览器 Cookie、rdt credential、twitter-cli auth、OpenCLI Chrome session | 用户浏览器、cookie_extract、上游 CLI | 最大不稳定外部状态；可能过期、风控、被平台撤销。doctor 是当前唯一可信观测。 |
| 运行时配置 | `Config.data` | `Config()` 实例 | 进程内缓存；每次 CLI 启动重新加载。 |
| 运行时路由 | `Channel.active_backend` | 每个 `Channel.check()`；`doctor.check_all()` 读取 | 临时观测结果，不应持久化；channel 是 singleton，所以异常时必须清空，避免上一轮 backend 泄漏。 |
| 体检结果 | `doctor --json` 输出 dict | `check_all()` 生成，宿主 Agent 消费 | 一次性快照；Agent 应在重要任务前重新跑，不应长期缓存。 |
| 转写中间态 | temp dir 下下载音频、压缩文件、chunks | `transcribe.py` | 临时工作文件；外部 API 成功后合并文本。 |

#### 契约边界

**内部契约：**

- `Channel.check(config) -> (status, message)`，并且必须设置 `self.active_backend`；可用状态只允许 `ok / warn / off / error`。
- `Channel.backends` 是有序候选，不是普通展示字段；`ordered_backends(config)` 只把有效 override 前移，未知 override 不能隐藏其他可用候选。
- `probe_command()` 只用于 side-effect-free 命令，例如 `--version`、`status`；不能拿有副作用命令做健康检查。
- `doctor.check_all()` 必须吞掉单 channel 异常，返回 `status="error"` 且 `active_backend=None`。

**外部 CLI 契约：**

- `agent-reach doctor --json` 是机器可读主接口。
- `agent-reach install --safe/--dry-run` 是副作用边界。
- `agent-reach configure ...` 是凭证和 proxy 写入入口。
- `agent-reach skill --install/--uninstall` 是 Skill 分发入口。
- `agent-reach watch` 是 cron/watchdog 入口，应该只在异常或更新时输出。

**Agent-facing 契约：**

- `SKILL.md` 告诉宿主 Agent：什么时候触发、先跑什么 doctor、每个平台该用哪个命令、遇到 warn/error 怎么修。
- references 把 dev/video/social/search/career/web 分域，降低主 Skill 体积并提高路由精度。
- 因为 Agent 是主要用户，Skill 的正确性和源码同等重要；Skill 漂移会直接导致 Agent 调错工具。

**上游工具契约：**

- Agent Reach 不稳定封装上游返回 schema；它更多依赖上游 CLI 的命令稳定性和文本/JSON/YAML输出。
- OpenCLI 的 contract 是“桌面 Chrome 登录态 + extension/daemon”；服务器环境不能假装可用。
- Reddit / 小红书 / X 等登录态平台的 contract 是“用户自担账号、Cookie、ToS、风控风险”。

#### 失败与降级模型

| 失败类型 | 检测方式 | 系统行为 | 降级 / 修复动作 |
|----------|----------|----------|------------------|
| 命令未安装 | `shutil.which()` missing | channel 返回 off/warn；`active_backend=None` | doctor message 给 pipx/uv/npm/install 指令。 |
| 命令存在但 venv 断链 | `probe_command()` exec `FileNotFoundError` / exit 126/127 | status 分类为 broken/error | 输出 `uv tool install --force` / `pipx reinstall` 处方。 |
| 命令超时 | `TimeoutExpired` | status error 或 warn | 有些 channel retry 1 次；提示稍后重试或手动 status。 |
| 首选后端未登录 | 后端 status 返回 warn | 继续收集候选；若后续 ok，后续 ok 获胜 | 避免“已安装但未登录”的首选后端挡住可用 fallback。 |
| 所有后端不可用 | findings 为空或全 error | channel off/error；doctor 继续其他 channel | 显示安装/登录/代理说明。 |
| Channel 代码异常 | `doctor.check_all()` catch Exception | 单 channel `status="error"`；active 清空 | 整体 doctor 不崩；用户看到具体异常。 |
| OpenCLI 扩展睡眠 | `daemon status` disconnected + on-disk extension exists | 视为 ready | 不误报；真实调用会唤醒 service worker。 |
| OpenCLI 扩展未安装 | disconnected + on-disk extension missing | warn | 给 Chrome Web Store 安装 URL；不自动安装。 |
| 平台反爬 / 风控 | live probe、issue/release 经验、channel 文案 | 明确降级或移除后端，如 B站退出 yt-dlp | 换 bili-cli / OpenCLI / 搜索 API，文档说明边界。 |
| 缺少转写 API key | `transcribe()` 先查 provider key | fail-closed，不先下载音频 | 提示配置 Groq/OpenAI key。 |
| 转写 provider HTTP 失败 | `requests.post` status / exception | auto 模式尝试下一个 provider | Groq → OpenAI fallback；最后抛出 last error。 |
| 安装副作用风险 | 用户选择 `--safe` / `--dry-run` | 不改系统或只打印计划 | 适合生产/服务器/审计环境先预检。 |

这个模型的核心不是“永不失败”，而是**失败要被分类、被观测、被路由、被转化成下一步动作**。

#### 可复刻设计不变量

1. **能力优先于工具。** 先定义 Agent 需要的能力和平台边界，再选择当前最稳的上游工具；不要反过来围绕某个 CLI 设计系统。
2. **路由必须显式可观测。** `active_backend`、候选列表、状态、修复提示必须进入机器可读输出，不能只藏在 README 或 prompt 里。
3. **健康检查必须真实执行且无副作用。** `which()` 只能证明路径存在，不能证明工具可用；但 probe 命令也不能偷偷启动 daemon、写配置或触发平台操作。
4. **首选后端不能阻断 fallback。** 多后端 channel 应先收集候选状态，再按 ok > warn > error 选路，避免“装了但没登录”的工具挡住可用后端。
5. **配置 override 只能重排，不能遮蔽。** 用户偏好可以把某 backend 前移，但未知/过期 override 不能让其他候选消失。
6. **Agent-facing docs 是运行时接口。** Skill、references、doctor JSON 与源码一样要版本化维护；它们是宿主 Agent 的调用契约，不是营销文档。
7. **凭证默认本地最小暴露。** Cookie/token 文件必须 owner-only；同步给 legacy 工具时必须 shell quote；同步失败不能破坏主配置。
8. **安装副作用必须有刹车。** 只要会动系统依赖、npm global、apt source、浏览器 Cookie，就必须提供 safe/dry-run 和明确提示。
9. **桌面登录态和服务器无头环境要分层。** OpenCLI 这类桌面后端不能在 VPS 上假装可用；server path 应该给 headless/MCP/cookie 专门方案。
10. **平台现实要写进代码和文档。** Reddit 无零配置、B站 yt-dlp 退役、OpenCLI extension 睡眠等事实应变成 channel 文案、doctor 提示和测试，而不是口头知识。
11. **单点失败不能拖垮全局体检。** doctor 是总控台，任何 channel 崩溃都应该降级成该 channel 的 error，而不是让 Agent 失去所有能力状态。
12. **能力层不要伪装成稳定数据服务。** 如果真实数据面在上游工具和平台登录态，采用建议就必须把 SLA、ToS、风控、上游停更风险写清楚。

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 能力层而非包装层 | 安装、体检、路由；读取由上游工具直接完成 | 统一封装所有 API 的中心 server | 降低维护面，避免自己成为反爬/接口兼容黑洞。 |
| 每个平台 ordered backends | `backends[0]` 首选，后续 fallback，支持 config override | 硬编码单一工具 | 平台接入方式会频繁失效，换路比重写更现实。 |
| 真探测而非 `which()` | `probe_command()` 实际执行轻量命令，识别 broken/timeout/error | 启动更快的静态检查 | CLI 存在不等于能运行，pipx/uv stale venv 是真实高频故障。 |
| Agent-facing Skill 分发 | 安装 `SKILL.md` + references，让宿主模型知道命令组 | 让用户自己读 README 复制命令 | 目标用户本来就是 Agent，文档必须成为 Agent 的运行合同。 |
| 本地 Cookie/Token | 写到 `~/.agent-reach/`，权限 0o600，支持浏览器提取 | 云端托管凭证或要求官方 API | 入门低、隐私本地化，但账号风控和本地安全责任转给用户。 |
| Safe/Dry-run 模式 | 给安全敏感用户预览/不改系统 | 默认完全无副作用 | 保留“一句话安装”的增长体验，同时给生产环境留刹车。 |
| OpenCLI 作为桌面通用后端 | 复用 Chrome 登录态，覆盖小红书/Reddit/B站字幕/Twitter fallback | 每个平台独立登录配置 | 登录态平台最现实的路线是复用浏览器，但服务器/无 GUI 场景能力下降。 |

### 值得学习的模式

1. **Capability-first abstraction**：项目不是先写爬虫，而是先定义“Agent 需要哪些互联网能力”，再为每个能力挂当前最稳后端。
2. **Observable routing**：`doctor --json` 暴露 `active_backend`、status、message、tier、backends，Agent 能据此选择命令，而不是靠 prompt 猜。
3. **Fail-soft doctor**：单个 channel 崩溃不会拖垮整体报告，doctor 把异常降级成 `status="error"`。
4. **Broken install classification**：把 missing、broken、timeout、error 分开，对 agent 自动修复很重要。
5. **Agent Skill as UX**：真正的用户界面不是 CLI help，而是安装进宿主 Agent 的 `SKILL.md` 路由表和 references。
6. **诚实的能力口径**：README / release 明确写 Reddit 没有零配置路径、B站 yt-dlp 退役、OpenCLI 需要桌面 + Chrome，这比“万能联网”更可信。
7. **本地凭证最小化处理**：`Config.save()`、cookie sync、bird env 写入都围绕 0o600 和 shell quote 做了补强，并有测试。
8. **上游工具组合治理**：Agent Reach 的价值在持续维护“当下选型”，这比一次性封装某个 API 更接近真实 agent ops。

### 反模式 / 踩坑点

1. **`cli.py` 过大**：1,805 行集中了 argparse、安装、配置、卸载、更新检查、转写命令、系统依赖安装等职责，长期会成为维护瓶颈。
2. **CI 没有执行文档承诺的 ruff/mypy**：`CONTRIBUTING.md` 要求 ruff/mypy，但 GitHub Actions 只跑 pytest + wheel gate。本次实测 ruff 46 errors、mypy 15 errors。
3. **默认安装副作用偏大**：会下载 GitHub CLI keyring、NodeSource setup script、apt-get、npm global install。虽然没有 shell pipeline，但仍建议在生产环境显式 safe/dry-run。
4. **渠道真实稳定性取决于上游**：项目自身质量再好，也挡不住 Twitter/Reddit/小红书/B站风控变化。
5. **Star 信号需打折**：phantomstars issue #336 报告 recent window 中存在可疑 engagement。不是定罪，但说明不能以 Star 作为核心质量证据。
6. **PyPI 缺席**：对普通 Python 用户来说，GitHub archive 安装比 `pipx install agent-reach` 更脆弱，也影响企业镜像/锁版本。
7. **Skill 触发范围很宽**：`SKILL.md` 声称用户提到任何 URL / GitHub / 调研都 MUST USE；在多 skill 环境中可能与已有专门工具抢路由，需要宿主侧治理。

### 可借鉴的具体技术点

- `agent_reach/channels/base.py`：ordered backend + user override 的轻量协议。
- `agent_reach/probe.py`：`ProbeResult` 分类和 stale venv shim 处方，可直接复用到 Hermes 工具体检。
- `agent_reach/doctor.py`：channel registry 聚合、active backend 渲染、单 channel 异常隔离。
- `agent_reach/backends/opencli.py`：不调用有副作用的 `opencli doctor`，改用 `daemon status` + Chrome extension on-disk 检测，是很好的体检设计细节。
- `agent_reach/cookie_extract.py`：rookiepy/browser_cookie3 双路径 + 0o600 写入 + shell quote sync。
- `agent_reach/skill/SKILL.md`：把平台路由表、doctor 规则、命令组、references 拆成 agent-facing 操作手册。
- `.github/workflows/pytest.yml`：wheel gate 明确验证 data files，修复了此前 duplicate wheel entry 这类真实安装问题。

---

## 架构解剖

### 目录结构

```text
agent-reach/
├── README.md                       # 中文主文档：定位、安装、平台、边界、安全
├── docs/                           # install/update/troubleshooting/i18n/cookie export
├── agent_reach/
│   ├── cli.py                      # CLI 主入口：install/configure/doctor/skill/transcribe/watch/update
│   ├── core.py                     # 极薄 Facade：AgentReach.doctor / doctor_report
│   ├── config.py                   # ~/.agent-reach/config.yaml 配置与 0o600 保存
│   ├── doctor.py                   # 汇总所有 channel 的健康检查结果
│   ├── probe.py                    # 外部命令真实探测与错误分类
│   ├── cookie_extract.py           # 浏览器 Cookie 提取与凭证同步
│   ├── transcribe.py               # yt-dlp + ffmpeg + Whisper API 转写
│   ├── backends/
│   │   └── opencli.py              # OpenCLI 桌面后端探测
│   ├── channels/
│   │   ├── base.py                 # Channel 抽象与 backend ordering
│   │   ├── __init__.py             # ALL_CHANNELS registry
│   │   ├── web/github/youtube/rss/exa_search.py
│   │   ├── twitter/reddit/bilibili/xiaohongshu.py
│   │   └── linkedin/xiaoyuzhou/v2ex/xueqiu.py
│   ├── skill/                      # 安装到宿主 Agent 的 SKILL.md + references
│   ├── guides/                     # setup-exa/groq/reddit/twitter/xhs 等指南
│   └── integrations/mcp_server.py  # 暴露 get_status 的简易 MCP server
├── tests/                          # 15 个测试文件，162 cases 实测通过
├── .github/workflows/pytest.yml    # pytest matrix + wheel gate
├── pyproject.toml                  # hatchling build，Python 3.10+，ruff/mypy 配置
├── constraints.txt                 # 测试/构建依赖锁定约束
└── SECURITY.md / CONTRIBUTING.md / CHANGELOG.md
```

### 技术栈

- **运行时 / 语言**：Python 3.10+。
- **核心依赖**：requests、feedparser、python-dotenv、loguru、PyYAML、rich、yt-dlp。
- **可选依赖**：playwright、mcp、browser-cookie3；代码还优先尝试 rookiepy。
- **外部工具**：gh CLI、Node/npm、mcporter、OpenCLI、twitter-cli、rdt-cli、bili-cli、ffmpeg、xiaohongshu-mcp、yt-dlp。
- **构建 / 打包**：hatchling；console script `agent-reach = agent_reach.cli:main`。
- **测试**：pytest；dev deps 包含 ruff、mypy、types-requests、types-PyYAML。
- **CI/CD**：Python 3.10/3.11/3.12/3.13 pytest matrix；独立 wheel gate 构建并在 clean venv smoke install。

### 模块依赖关系

```text
agent_reach.cli.main()
  ├─ install/configure/uninstall/update/watch command handlers
  ├─ Config()                     → ~/.agent-reach/config.yaml
  ├─ check_all(config)            → doctor.py
  │    └─ get_all_channels()      → channels/__init__.py registry
  │         └─ Channel.check()    → each channel probes its upstream backend
  ├─ _install_skill()             → copies agent_reach/skill to known skill dirs
  ├─ configure_from_browser()     → cookie_extract.py
  └─ transcribe()                 → transcribe.py → yt-dlp/ffmpeg/Groq/OpenAI

Channel.check()
  ├─ ordered_backends(config)     → config override aware candidate ordering
  ├─ probe_command()              → external CLI real execution
  ├─ opencli_status()             → OpenCLI-specific status parsing
  └─ returns status/message + sets active_backend
```

### 扩展机制

- **新增平台渠道**：新增 `agent_reach/channels/<platform>.py`，继承 `Channel`，实现 `can_handle()` / `check()`，在 `channels/__init__.py` 注册，补测试和 docs/skill。
- **新增 backend**：在 channel 的 `backends` 有序列表加入候选，并实现 `_check_<backend>()`；通过 `ordered_backends(config)` 支持用户 override。
- **新增 agent 指南**：更新 `agent_reach/skill/SKILL.md` 和 references，让宿主 Agent 知道新命令组。
- **新增安装路径**：在 `cli.py` 的 `CHANNEL_INSTALLERS` 增加安装函数。
- **MCP 集成**：当前仅暴露 `get_status`，未来可扩展为更完整的 status/doctor/config 查询层，但项目原则仍是不包装实际读取。

---

## 质量与成熟度

### 代码质量

- **类型系统**：`pyproject.toml` 配了 mypy，核心 dataclass/typing 有一些使用，但不是类型严格项目。本次 `mypy agent_reach` 失败 15 处，集中在 cookie_extract、probe、xueqiu、doctor、cli 的类型推断/赋值问题。
- **错误处理**：对外部 CLI 探测的错误分类做得较细；doctor 捕获单 channel 异常；GitHub update check 有 retry/backoff 和 rate limit 分类；转写流程有 timeout。
- **代码风格一致性**：channel 文件风格相对统一；但 `cli.py` 过大，ruff 显示 import sort、unused import、无 placeholder f-string、ambiguous variable 等基础 lint 问题。
- **安全意识**：凭证文件 0o600、bird env shell quoting、SECURITY.md、private advisory、CWE-732 修复 PR #350 都是正信号。

### 测试

本次实测：

```text
python3 py_compile over git ls-files '*.py'
→ py_files_checked 45
→ syntax_errors 0

/tmp/agent-reach-tk-venv/bin/python -m pytest -q
→ 162 passed in 6.24s

python -m build + clean venv install dist/*.whl
→ wheel entries 49, no duplicate entries
→ SKILL.md / guides / scripts data files present
→ agent-reach version returns v1.5.0
```

测试覆盖点包括：

- channel registry contract、`active_backend`、backend override；
- YouTube JS runtime warning；
- OpenCLI probe 状态；
- Twitter/Reddit/B站/小红书多后端优先级；
- cookie 文件权限与 shell quote；
- update check retry/rate limit/version compare；
- wheel packaging data files。

不足：

```text
ruff check agent_reach tests
→ 46 errors

mypy agent_reach
→ 15 errors in 5 files
```

这说明项目的“可运行测试”已经不错，但静态质量门还没有真正接入 CI。

### CI/CD

- `.github/workflows/pytest.yml` 跑 Python 3.10/3.11/3.12/3.13 的 `pytest -q`。
- wheel gate 会 build wheel、检查 duplicate entries、确认 `SKILL.md` / guides / scripts 被打进 wheel，并 clean venv smoke install。
- 没看到 ruff/mypy 在 CI 中执行，和 `CONTRIBUTING.md` 的要求不一致。
- release 走 GitHub Releases，v1.1.0 到 v1.5.0 共 7 个 release；本地 tags 与 GitHub latest release 一致为 v1.5.0。

### 文档质量

- **README**：中文定位清楚，能解释“为什么需要、支持哪些平台、能力边界、安全、安装、FAQ”。
- **安装文档**：`docs/install.md` 是 agent-facing guide，包含安全边界、目录规则、safe/dry-run、可选渠道选择、Cookie 导入、代理说明。
- **多语言**：docs 下有 English / Japanese / Korean README。
- **Changelog**：存在但明显滞后；文件只写到 1.3.1/1.3.0/1.1.0/1.0.0，没有记录 1.4.x/1.5.0，release notes 比 CHANGELOG 更新。
- **贡献文档**：基础齐全，但新增渠道步骤里写“Update `agent_reach/doctor.py` to include the new channel”，实际注册点是 `channels/__init__.py`；属于小文档漂移。

### Issue / PR 健康度

- open issues 32，open PRs 27，merged PRs 142；近期 PR 很活跃。
- 近期 closed PR 聚焦：OpenCLI、multi-backend routing、真实 probing、Reddit honest tiering、B站 yt-dlp 退役、wheel duplicate 修复、凭证 0o600 安全修复。
- open issues 多为新增平台/功能请求（小鹅通、Polymarket、韭研公社、Facebook、Instagram/TikTok、闲鱼等）和实际使用边界困惑（Exa 是否收费、公众号搜索不可抓）。
- #336 phantomstars 报告“likely fake engagement”但 repo classification 为 clean；可作为 star 信号打折依据，不直接否定项目质量。

---

## 社区与生态

### 社区评价

真实社区信号可以分成三类：

1. **强需求**：open issues 持续要求更多平台（小鹅通、Polymarket、韭研公社、今日头条、闲鱼、Facebook、Instagram/TikTok）。说明“让 Agent 读封闭平台内容”是明确痛点。
2. **边界困惑**：Exa 免费/免 key、微信公众号搜索、登录后视频下载等 issue 表明用户容易把 Agent Reach 理解成“万能互联网爬取器”。README 最近补了“读内容 vs 操作网页”边界是必要动作。
3. **快速迭代认可但需验证**：Stars/Forks 和 release 活跃度强，但项目历史不到 4 个月，且存在 fake engagement 检测报告。质量判断必须回到源码、测试、CI 和 issue 响应。

### 衍生项目 / 插件生态

- GitHub repo search 显示直接相关衍生项目不多：`dapao29/agent-reach-windows-cn` 是国内 Windows 实战 SOP；若干 demo/fork。
- 生态更多体现在**上游工具组合**而不是 Agent Reach 自身插件：OpenCLI、twitter-cli、rdt-cli、bili-cli、xiaohongshu-mcp、Jina Reader、Exa MCP、gh、yt-dlp、feedparser。
- 它自身的“生态接口”是 `SKILL.md` + agent skill install，而不是 marketplace / plugin SDK。

### 竞品对比

**直接竞品 / 同层能力路由：**

- 暂无非常直接的开源同类。多数项目要么是单平台 MCP/CLI，要么是浏览器自动化，要么是搜索/爬虫 SaaS。

**邻近替代：**

- **Firecrawl**：强网页抓取/搜索/结构化 API，适合生产爬取；但不是本地多平台 Cookie/CLI 能力层，且 AGPL/API 服务属性更强。
- **browser-use / BrowserAct / Playwright MCP**：适合真实网页操作和浏览器自动化；但不是轻量“内容读取路由表”，成本和副作用更高。
- **Exa MCP Server**：专注 web search / crawling；Agent Reach 会把它当上游之一，而非替代所有渠道。
- **last30days-skill**：更像“实时社会信号研究引擎”，会规划、聚合、排序和合成 brief；Agent Reach 更底层，只负责让 Agent 拿到平台内容。
- **MCP servers 集合**：提供大量工具协议入口；但每个平台仍要单独配置、体检、路由和写 agent usage docs。

**架构邻居：**

- Hermes skills/toolsets、superpowers/Agent Skills、CLI-Anything 的 SKILL.md 机制：都体现“Agent-facing docs as runtime interface”。
- ECC / vibecode 这类 harness workflow system：同样重视 install/doctor/skill/hook，只是 Agent Reach 的对象是互联网渠道能力。

---

## 关键代码走读

### 1. `Channel` 抽象与 backend ordering

- 路径：`agent_reach/channels/base.py`
- 职责：定义每个平台的最小协议：`name`、`description`、`backends`、`tier`、`active_backend`、`can_handle()`、`check()`。
- 实现要点：
  - `backends` 是 ordered candidate list，`backends[0]` 是首选；
  - `ordered_backends(config)` 支持 `<channel>_backend` override，且未知 override 不会隐藏可用后端；
  - `check()` 必须设置 `active_backend`，这让 doctor 输出可观测。

### 2. `probe_command()` 真实命令探测

- 路径：`agent_reach/probe.py`
- 职责：区分外部命令的 missing / broken / timeout / error / ok。
- 实现要点：
  - 先 `shutil.which()`，再真实执行 side-effect-free 命令；
  - 捕获 `FileNotFoundError` / `OSError` / 126 / 127，把 stale venv shim 识别成 broken；
  - 对 broken 给出 `uv tool install --force` / `pipx reinstall` 处方；
  - channels 基于它判断“装了但坏了”和“未登录/未配置”。

### 3. OpenCLI backend probe

- 路径：`agent_reach/backends/opencli.py`
- 职责：判断 OpenCLI 是否可作为桌面登录态后端。
- 实现要点：
  - 明确 `opencli doctor` 会 auto-start daemon，因此探测不用它，避免 side effect；
  - 调 `opencli daemon status`，解析 Daemon / Extension 文本；
  - Chrome 扩展 service worker 可能睡眠，不能把 disconnected 等同不可用；
  - 通过 Chrome profile `Extensions/<id>` on-disk 检查区分“睡眠”和“未安装”。

### 4. 多后端渠道：Twitter / Reddit / 小红书 / B站

- 路径：
  - `agent_reach/channels/twitter.py`
  - `agent_reach/channels/reddit.py`
  - `agent_reach/channels/xiaohongshu.py`
  - `agent_reach/channels/bilibili.py`
- 职责：把平台特定现实约束编码成路由。
- 实现要点：
  - Twitter：`twitter-cli` 首选，OpenCLI 备选，bird legacy；先收集候选，优先 ok，再 warn，避免一个“已装但未登录”的首选挡住后续可用后端。
  - Reddit：明确无 zero-config path，OpenCLI / rdt-cli 都需要登录态。
  - 小红书：OpenCLI（桌面）→ xiaohongshu-mcp（服务器）→ xhs-cli legacy。
  - B站：bili-cli → OpenCLI → 搜索 API；yt-dlp 明确退出 B站，只保留给 YouTube。

### 5. CLI 安装与 Skill 分发

- 路径：`agent_reach/cli.py`
- 职责：集中处理安装、配置、卸载、skill install、update check、watch、transcribe 等用户入口。
- 实现要点：
  - `install` 会安装系统依赖、mcporter、可选渠道、导入 cookies、跑 doctor、安装 skill；
  - `_install_skill()` 将 packaged skill 复制到 `.agents` / `.openclaw` / `.claude`；
  - `watch` 面向 cron，只输出问题或“一切正常”；
  - 缺点是文件过大，后续应拆为 `install.py` / `configure.py` / `update.py` / `skill.py` / `commands.py`。

### 6. 凭证与 Cookie 安全写入

- 路径：`agent_reach/config.py`、`agent_reach/cookie_extract.py`、`tests/test_cookie_extract_perms.py`
- 职责：本地保存 token/cookie，并同步到部分上游工具配置。
- 实现要点：
  - `Config.save()` 用 `os.open(..., 0o600)` 原子创建 config；
  - `_open_owner_only()` 同样用于 xfetch session 和 bird credentials；
  - `_sync_bird_env()` 用 `shlex.quote` 防止 token 中的 `"; touch ...` 这类内容变成可执行 shell；
  - tests 用真实 `sh -c '. credentials.env'` 验证不会执行注入 payload。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 4 | 覆盖 13 个常用互联网渠道，真实解决 Agent 联网碎片化；但不是浏览器操作/生产 API，且部分渠道依赖登录态。 |
| 代码质量 | 3 | 模块边界清晰，probe/channel 设计好；但 `cli.py` 过大，ruff/mypy 当前不通过。 |
| 文档质量 | 4 | README/install/SKILL 很实用，边界表述逐步诚实；CHANGELOG/CONTRIBUTING 有漂移。 |
| 社区活跃度 | 4 | Star/Fork/PR 活跃度高，merged PR 多；但项目过新、核心集中、star 信号需打折。 |
| 架构设计 | 4 | capability layer + ordered backend + real probing + Skill 分发是好设计；还缺更严格 package/command 分层。 |
| 学习价值 | 5 | 非常适合学习 Agent 能力层、可观测路由、health check、agent-facing docs。 |
| 可借鉴度 | 5 | `probe_command`、channel registry、doctor JSON、Skill 路由表、0o600 credential write 都可迁移到内部工具。 |

---

## 总结

### 一句话评价

Agent Reach 不是“万能联网神器”，而是一个很聪明的 **Agent Internet Capability Layer**：把互联网平台接入中最脏、最易变的“用哪个工具、怎么装、怎么体检、坏了怎么换路”收敛成可被 Agent 消费的本地能力路由表。

### 谁应该用

- 个人/小团队的 agent operator；
- 常让 Agent 做网页、社媒、视频、GitHub、RSS、中文平台信息读取的人；
- 想搭建内部“Agent 外部世界接入层”的开发者；
- 想学习 capability routing / doctor / Skill 分发模式的人。

### 谁不应该直接用

- 对平台 ToS / Cookie / 账号风控完全零容忍的组织；
- 需要稳定 SLA、审计、多租户权限、集中凭证治理的企业生产系统；
- 希望通过一个库完成登录后网页操作、表单提交、账号自动化的人；
- 不愿承受上游 CLI/MCP/API 频繁变化的人。

### 下一步

下一步最值得做的是两件事：

1. **短期试用**：在隔离环境里装，跑 `doctor --json`，把它当 Hermes / Claude Code 的互联网读取工具箱。
2. **架构借鉴**：把 `Channel + probe_command + doctor JSON + Skill 路由表` 抽象学走，用在工具系统、知识系统或 Agent ops 中；生产化时补强 sandbox、凭证治理、lint/type CI 和上游版本锁定。
