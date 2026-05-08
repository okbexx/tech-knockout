# token-tracker

> 一句话定位：本地 AI Agent（Claude Code / Codex）的 Token 消耗追踪 CLI 仪表盘，零配置即开即用。

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `stormzhang/token-tracker` |
| URL | `https://github.com/stormzhang/token-tracker` |
| Star | 4 |
| Fork | 0 |
| 许可证 | MIT |
| 语言 | Python |
| 首次提交 | 2026-05-08 |
| 最近提交 | 2026-05-08 |
| 最新 Release | v0.1.1 |
| 贡献者数 | 1 |
| 分析日期 | 2026-05-08 |

---

## 场景一：是否值得采用

### 解决的问题

重度使用 Claude Code / Codex 的开发者面临一个痛点：Agent 的 token 消耗是"黑盒"——你不知道今天花了多少、哪个项目最烧钱、rate limit 还剩多少。官方不直接提供本地聚合视图。token-tracker 解决这个问题：自动读取 Agent 本地日志，给出多维度统计 + 等效成本估算 + 限额监控。

目标用户：每天大量使用 AI Coding Agent 的开发者、需要控制 API 预算的团队。

### 核心能力与边界

- **能做什么：**
  - 自动探测已安装的 Claude Code / Codex（检查 `~/.claude/projects` 和 `~/.codex/sessions`）
  - 读取 JSONL 日志，按日 / 周 / 月 / 会话维度聚合 token 用量
  - 等效成本计算（拉取 LiteLLM 公开定价，本地缓存）
  - 5 小时计费块分析 + burn rate（活跃/空闲检测）
  - Claude Code rate limit 实时监控（通过 statusLine hook 注入）
  - 交互式 dashboard（多 Agent 时左右键切换 tab）
  - 纯只读，不修改 Agent 任何本地文件

- **不能做什么：**
  - 不支持远程/多机聚合（纯本地单用户工具）
  - 不支持 OpenAI Codex CLI 以外的 Agent（目前仅 Claude Code + Codex）
  - 不支持历史数据导入/导出
  - 没有 Web UI（纯 CLI）

- **与竞品差异：**
  - 零配置：不需要 API key，直接读本地日志
  - 多 Agent 统一面板：一个工具看两个 Agent 的消耗
  - Rate limit 集成：通过 Claude Code 的 statusLine hook 实时获取配额状态
  - 成本估算：基于 LiteLLM 定价数据自动计算等效美元成本

### 集成成本

- **依赖链**：仅 `rich>=13.7`，Python 3.10+，极度轻量
- **部署复杂度**：`pip install token-tracker` 或一行 curl 安装，无额外配置
- **学习曲线**：5 分钟——命令自解释，`tt` 进交互面板，`tt daily/weekly/monthly` 看统计
- **从零到 demo**：安装后直接运行，如果本地有 Claude Code / Codex 使用记录立即出数据

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | ✅ | MIT，无限制 |
| Bus factor | 高 | 单人项目，stormzhang 独立维护 |
| 供应商锁定 | 低 | 纯本地工具，不依赖外部服务（除 LiteLLM 定价拉取） |
| 维护趋势 | 待观察 | 2026-05-08 刚发布，尚未验证长期维护意愿 |
| 安全历史 | — | 太新，无历史。代码只读本地文件，无网络上传，风险可控 |

### 结论

**观望**

理由：项目非常新（今天刚发布），功能设计很精准地切中了重度 Agent 用户的痛点，代码质量在同体量工具中属于上乘。但单点维护风险高，且生态兼容性（未来是否支持更多 Agent）有待验证。建议：本地安装试用，观察 1-2 个月的迭代频率后再决定是否深度依赖。如果后续加入更多 Agent 支持（如 Codex CLI、Aider、Claude Code 的 Windows 路径等），升级潜力很大。

---

## 场景二：技术架构学习

### 核心架构图

```
┌─────────────────────────────────────────┐
│           tt (CLI Entry)                │
│  ┌──────────┐  ┌─────────────────────┐  │
│  │ Commands │  │ Interactive Dashboard│  │
│  │ daily/   │  │ (alternate screen +  │  │
│  │ weekly/  │  │  keyboard handler)   │  │
│  │ monthly/ │  └─────────────────────┘  │
│  │ sessions │                             │
│  │ blocks   │                             │
│  └────┬─────┘                             │
└───────┼───────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│         Agent Registry                  │
│   detect_agents() → [claude, codex]    │
└─────────────────────────────────────────┘
        │
   ┌────┴────┐
   ▼         ▼
┌────────┐ ┌────────┐
│ Claude │ │ Codex  │   Adapters (只读解析)
│ Adapter│ │ Adapter│
└───┬────┘ └───┬────┘
    │          │
    ▼          ▼
~/.claude/   ~/.codex/
projects/    sessions/
   │            │
   └────┬───────┘
        ▼
┌──────────────────────────┐
│    UsageEntry (统一模型)  │
│  timestamp, tokens, cost │
└───────────┬──────────────┘
            │
    ┌───────┴───────┐
    ▼               ▼
┌──────────┐  ┌──────────┐
│Aggregator│  │  Blocks  │
│日/周/月/ │  │ 5h 计费  │
│  会话    │  │ burn rate│
└────┬─────┘  └────┬─────┘
     │             │
     └──────┬──────┘
            ▼
┌──────────────────────────┐
│      Cost Calculator     │
│  LiteLLM pricing → USD   │
└──────────────────────────┘
            │
            ▼
┌──────────────────────────┐
│    UI / Rich Tables      │
│  响应式宽度 + 主题自适应  │
└──────────────────────────┘
```

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 数据源 | 直接读 Agent 本地 JSONL/SQLite | 官方 API 集成 | 零配置、无 API key、不依赖网络 |
| 成本定价 | 拉取 LiteLLM 公开 JSON + 本地缓存 | 自带精确价格表 | 自动覆盖新模型，fallback 保证离线可用 |
| Claude rate limits | statusLine hook 注入 | 轮询 API | 实时、无额外请求开销、与 Claude Code 生命周期绑定 |
| 交互模式 | ANSI escape sequences 手工处理 | 用 textual / curses | 零额外依赖，但代码复杂度高（tables.py 800行） |
| 去重策略 | message_id + request_id | 哈希内容去重 | 精确、低开销，依赖 Agent 日志质量 |
| Codex 模型识别 | 读 state_5.sqlite threads 表 | 从 JSONL 推断 | 更准确，但依赖 Codex 内部 DB schema 稳定性 |

### 值得学习的模式

1. **适配器 + 统一模型模式**：`adapters/` 下每个 Agent 一个模块，输出统一 `UsageEntry`。新增 Agent 支持只需实现 `detect()` + `load_entries()`，零侵入现有分析逻辑。
2. **数据源只读原则**：代码中没有任何写入 Agent 目录的操作（除了可选的 statusLine hook），最大限度降低对宿主工具的副作用风险。
3. **渐进式定价 fallback**：`_fetch_and_cache() → _fallback_pricing()` 三级降级，确保网络异常时仍可估算成本。
4. **终端主题自适应**：通过 `COLORFGBG` + `TT_THEME` 环境变量检测终端深浅主题，动态调整 Rich 样式。
5. **响应式表格布局**：`_width_mode()` 根据终端宽度在 compact/medium/wide 三档间切换列数，小屏幕也能用。

### 反模式 / 踩坑点

1. **tables.py 过大（800行）**：所有渲染逻辑塞在一个文件，随着视图增加会越来越难维护。应该按视图拆分为 `daily.py`, `weekly.py`, `dashboard.py`。
2. **交互模式没有使用成熟的 TUI 框架**：手工处理 ANSI escape + raw tty，虽然零依赖，但跨平台兼容性（尤其是 Windows）存疑。且键盘输入处理代码和渲染代码耦合在 `cli.py` 中。
3. **Hook 替换不保留原配置**：`setup()` 发现已有 statusLine 配置时直接替换，不备份。用户如果之前配置了自定义 statusLine 会丢失。
4. **模型名称匹配模糊**：`_resolve_model_key()` 使用子串包含匹配，可能在模型名相似时误匹配定价（如 `claude-sonnet` 和 `claude-sonnet-4-6`）。
5. **无测试**：新项目可以理解，但成本计算和聚合逻辑是容易出 bug 的地方（尤其是 Codex 的 `input_tokens - cached_input_tokens` 处理）。

### 可借鉴的具体技术点

- **Codex 日志解析策略**：Codex 的 JSONL 中 `total_token_usage` 是会话累计值，不是单条消息值。作者选择用会话最后一条的累计值作为整个会话的用量，并正确处理了 `cached_input_tokens` 子集关系——这是读第三方日志时常见陷阱，处理得很干净。
- **状态文件原子写入**：`hooks.py` 中用 `tempfile.mkstemp()` + `os.replace()` 写 `tt-status.json`，避免并发读写损坏。
- **去重键设计**：`UsageEntry.dedup_key = f"{message_id}:{request_id}"` 兼顾了消息级别和请求级别的唯一性。

---

## 架构解剖

### 目录结构

```
token-tracker/
├── src/
│   ├── __init__.py
│   ├── cli.py              # CLI 入口、命令路由、交互式键盘循环
│   ├── hooks.py            # Claude Code statusLine hook 安装/卸载
│   ├── adapters/           # 数据源适配器（核心扩展点）
│   │   ├── __init__.py
│   │   ├── types.py        # 统一数据模型（UsageEntry, AgentInfo, Stats 等）
│   │   ├── claude.py       # Claude Code：~/.claude/projects/*.jsonl 解析
│   │   ├── codex.py        # Codex：~/.codex/sessions/*.jsonl + state_5.sqlite
│   │   ├── rate_limits.py  # Claude：~/.claude/tt-status.json 读取
│   │   └── registry.py     # Agent 自动探测（调用各 adapter.detect()）
│   ├── analyzer/           # 数据分析层
│   │   ├── __init__.py
│   │   ├── aggregator.py   # 日/周/月/会话维度聚合
│   │   ├── blocks.py       # 5h 滑动窗口计费块 + burn rate + P90 估算
│   │   └── cost.py         # LiteLLM 定价拉取 + 成本计算
│   └── ui/
│       ├── __init__.py
│       └── tables.py       # Rich 表格渲染（全部视图，响应式主题）
├── pyproject.toml          # setuptools 打包，仅依赖 rich
├── install.sh              # 一行安装脚本
├── README.md / README_EN.md
├── screenshot.png
└── CLAUDE.md               # 项目内部规范（AGENTS.md 的简化版）
```

### 技术栈

- **运行时**：Python 3.10+
- **CLI 框架**：无（纯 sys.argv + 手工 ANSI 处理）
- **表格渲染**：Rich（唯一外部依赖）
- **构建 / 打包**：setuptools
- **测试**：无
- **CI/CD**：无
- **定价数据源**：LiteLLM 公开 GitHub raw JSON

### 模块依赖关系

```
cli.py ──→ adapters/registry ──→ adapters/{claude,codex}
  │           │                      │
  │           └──────────────────────┘
  │                      │
  │                      ▼
  │              adapters/types (UsageEntry)
  │                      │
  │        ┌─────────────┼─────────────┐
  │        ▼             ▼             ▼
  │   analyzer/agg   analyzer/blocks  analyzer/cost
  │        │             │             │
  │        └─────────────┴─────────────┘
  │                      │
  │                      ▼
  │                 ui/tables (Rich 渲染)
  │
  └──→ hooks.py (Claude statusLine 配置管理)
```

### 扩展机制

- **适配器注册表**：`adapters/registry.py` 的 `detect_agents()` 遍历 detector 列表。新增 Agent 只需：
  1. 在 `adapters/` 下新建模块（实现 `detect()` → `AgentInfo` 和 `load_entries()` → `list[UsageEntry]`）
  2. 在 `registry.py` 中 import 并加入 detector 列表
  3. 在 `cli.py` 的 `AGENT_LOADERS` 中注册别名
- **定价缓存**：`cost.py` 的 `_pricing` 全局缓存，可替换为其他定价源
- **主题**：`TT_THEME` 环境变量强制覆盖自动检测

---

## 质量与成熟度

### 代码质量

- **类型系统**：⭐⭐⭐⭐⭐ — 全面使用 Python 3.10+ union types（`float | None`）、dataclass、类型注解，无 `Any` 滥用。
- **错误处理**：⭐⭐⭐⭐ — 文件 IO 和 JSON 解析都有 try/except，静默跳过损坏行（适合日志解析场景），但缺少日志记录（无 logging 模块）。
- **代码风格一致性**：⭐⭐⭐⭐⭐ — 命名规范、缩进一致，遵循 PEP 8。

### 测试

- **测试框架**：无
- **覆盖率**：无
- **测试类型**：无
- 评估：作为今天刚发布的 0.1.1 版本可以理解，但成本计算逻辑（尤其是 Codex 的 token 减法）和聚合逻辑需要测试覆盖。

### CI/CD

- **流水线配置**：无 `.github/workflows/`
- **发布流程**：手动发布到 PyPI（已有 pip 安装说明）
- 评估：新项目典型状态。

### 文档质量

- **API 文档**：无（不需要，这是 CLI 工具而非库）
- **教程/指南**：README 中英文双版本，截图直观，安装和使用说明清晰
- **Changelog**：无
- **CLAUDE.md**：项目内部技术规范文件，说明作者用 Claude 辅助开发，并规范了 AI agent 的行为

### Issue/PR 健康度

- **Issue 响应速度**：太新，无数据
- **PR 合并节奏**：太新，无数据
- **Breaking change 历史**：无

---

## 社区与生态

### 社区评价

项目于 2026-05-08 发布，目前 4 stars，尚无公开社区讨论。stormzhang 是中文技术圈知名博主（公众号「stormzhang」），有一定影响力，项目初期获客有天然渠道。

### 衍生项目 / 插件生态

无（太新）。潜在扩展方向：
- VS Code 扩展 / IDE 插件侧栏展示
- 团队版（多用户数据聚合到共享 dashboard）
- Web UI（用 textual 或 streamlit 快速搭建）
- 更多 Agent 支持（Aider、Cursor、Windsurf 等）

### 竞品对比

| 项目 | 定位 | 与 token-tracker 的差异 |
|------|------|------------------------|
| [litellm](https://github.com/BerriAI/litellm) | LLM 路由/代理/监控平台 | 重量级服务端工具，需要部署；token-tracker 是纯本地零配置 CLI |
| [claude-code](https://github.com/anthropics/claude-code) 内置 `/cost` | Claude Code 自身命令 | 仅支持 Claude Code，无历史趋势、无多 Agent 对比 |
| 手工脚本 | 个人 awk/jq 处理 JSONL | token-tracker 提供了完整的交互式 UI 和成本估算 |

**结论**：在"本地零配置 Agent token 追踪"这个细分场景下，token-tracker 目前没有直接竞品。

---

## 关键代码走读

### 1. `src/adapters/codex.py` — Codex 日志解析

- **路径**：`src/adapters/codex.py`
- **职责**：解析 Codex 的 JSONL 会话日志，提取累计 token 用量
- **实现要点**：
  - Codex 的 JSONL 中每条 `token_count` 事件携带 `total_token_usage`（会话累计），作者选择用**最后一条**的累计值代表整个会话
  - 关键处理：`input_tokens = total.input_tokens - cached_input_tokens`，正确识别子集关系
  - `reasoning_output_tokens` 归入 `output_tokens`，符合 Anthropic 的计费逻辑
  - 通过 `state_5.sqlite` 的 `threads` 表获取模型名称，比从日志推断更可靠
  - 去重键用 `session_id`（Codex 粒度是整条会话，不像 Claude Code 是单条消息）

### 2. `src/analyzer/blocks.py` — 5h 计费块分析

- **路径**：`src/analyzer/blocks.py`
- **职责**：将时间线切分为 5 小时滑动窗口，计算 burn rate 和活跃状态
- **实现要点**：
  - `BLOCK_DURATION = timedelta(hours=5)` 对齐 Claude Code 的 5h rate limit 窗口
  - 空闲间隙检测：两条记录间隔 >5 分钟则插入 `is_gap=True` 的虚拟块
  - `burn_rate = total_tokens / elapsed_minutes`，仅对当前活跃块计算（`end_time > now`）
  - `calculate_p90()` 用历史日统计数据给没有 rate limit 数据的用户一个参考上限

### 3. `src/hooks.py` — StatusLine Hook 管理

- **路径**：`src/hooks.py`
- **职责**：向 Claude Code 注入 statusLine hook，实时捕获 rate limits
- **实现要点**：
  - Hook 脚本内嵌在 Python 字符串中（`HOOK_SCRIPT`），安装时写入 `~/.claude/tt-statusline.py`
  - 使用 `tempfile.mkstemp()` + `os.replace()` 原子写入 status 文件，避免并发损坏
  - 安装时检测已有 statusLine 配置并提醒替换（但不保留备份——这是踩坑点）
  - 输出格式简洁：`5h:XX% 7d:XX%`，直接显示在 Claude Code 底部状态栏

### 4. `src/ui/tables.py` — 响应式渲染

- **路径**：`src/ui/tables.py`
- **职责**：所有 Rich 表格和文本渲染
- **实现要点**：
  - `_S` 类封装语义化样式，根据 `COLORFGBG` / `TT_THEME` 自动切换深浅主题色
  - `_width_mode()` 三档响应式：`<100` compact / `<120` medium / `≥120` wide
  - 令牌热力色：`_token_heat_style()` 根据当日 token 占历史最大值的比率变色
  - 进度条用 Unicode block 字符（`█` / `░`）渲染，直观展示 rate limit 百分比

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 4 | 核心场景覆盖完整（追踪/成本/限额），但仅支持 2 个 Agent，无数据导出 |
| 代码质量 | 4 | 类型完整、风格一致、错误处理得当，但 tables.py 过大、无日志模块 |
| 文档质量 | 4 | README 双语言+截图清晰，有 CLAUDE.md，但无 Changelog 和 API 文档 |
| 社区活跃度 | 2 | 刚发布，1 个贡献者，4 stars。作者有影响力，有增长潜力 |
| 架构设计 | 4 | 适配器模式干净、统一模型设计好、扩展点明确，但 TUI 层欠成熟 |
| 学习价值 | 4 | 第三方日志解析、ANSI 交互、定价 fallback 等模式值得学习 |
| 可借鉴度 | 5 | 核心代码可直接复制到类似"读本地日志做仪表盘"的场景 |

**总分：27/35**

---

## 总结

### 一句话评价

一个设计精准、代码干净、零配置即用的本地 Agent token 追踪工具——虽然刚诞生，但架构骨架已经搭得很稳。

### 谁应该用

- 每天使用 Claude Code / Codex 超过 2 小时的开发者
- 需要监控团队/个人 API 预算的技术负责人
- 想学习"如何给第三方工具写零侵入仪表盘"的开发者

### 谁不应该用

- 只偶尔用 AI Agent 的轻度用户（没必要）
- 需要团队级聚合报表的企业（目前纯本地单机）
- Windows 用户（交互模式依赖 POSIX tty，未测试兼容性）

### 下一步

1. **试用**：`pip install token-tracker` 后运行 `tt`，观察是否准确读取你的历史数据
2. **关注迭代**：看未来 1-2 个月是否增加新 Agent 支持、修复边界 case
3. **贡献机会**：测试覆盖（尤其是 Codex 的 token 减法逻辑）、Windows 兼容、导出功能都是好的切入点
