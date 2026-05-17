# Technical Knockout

开源项目技术调研与选型擂台。每个项目进来做全量分析，同类项目持续横评。

## 项目总览

| 项目 | 分类 | 定位 | 采用建议 | 架构学习价值 | 分析日期 |
|------|------|------|----------|-------------|---------|
| [jcode](./reports/jcode.md) | Coding Agent | Rust TUI + Swarm + 本地 Graph Memory 的下一代 Coding Agent 平台 | 观望 | ⭐⭐⭐⭐⭐ | 2026-05-01 |
| [pi-mono](./reports/pi-mono.md) | Coding Agent | TypeScript Agent 工具箱：可扩展 Coding Agent CLI + SDK + 25+ Provider | 推荐采用 | ⭐⭐⭐⭐⭐ | 2026-05-01 |
| [superpowers](./reports/superpowers.md) | AI Coding Workflow | 跨平台 Agentic 技能框架与方法论，14 技能强制注入 TDD + 设计先行 + 子代理审查 | 推荐采用 | ⭐⭐⭐⭐⭐ | 2026-05-02 |
| [compound-engineering-plugin](./reports/compound-engineering-plugin.md) | AI Coding Workflow | 以"复利工程"为理念的 7 平台多 Agent 协作工作流插件 | 推荐采用 | ⭐⭐⭐⭐⭐ | 2026-05-02 |
| [GitNexus](./reports/GitNexus.md) | Code Intelligence | 纯客户端知识图谱引擎，通过 MCP 让 AI Agent 获得深度代码库感知 | 观望（个人）/ 不推荐（企业免费） | ⭐⭐⭐⭐⭐ | 2026-05-01 |
| [gitingest](./reports/gitingest.md) | Code Ingestion | 一键将 Git 仓库转换为 LLM-friendly 文本摘要，支持 CLI/Web/API/浏览器扩展 | 推荐采用 | ⭐⭐⭐⭐ | 2026-05-02 |
| [mijia-control](./reports/mijia-control.md) | Smart Home Platform | 米家 x MCP x AI Agent x HomeKit 全桥接智能家居中控平台 | 观望 | ⭐⭐⭐⭐ | 2026-05-05 |
| [miaomiaowu](./reports/miaomiaowu.md) | proxy-subscription-manager | 个人 Clash/Mihomo 订阅管理系统，带 Web UI 和流量聚合 | 推荐采用 | ⭐⭐⭐⭐ | 2026-05-06 |
| [macshot](./reports/macshot.md) | screenshot-utility | macOS 原生截图与录屏标注工具，18+ 工具/OCR/视频编辑/40 语言 | 推荐采用 | ⭐⭐⭐⭐⭐ | 2026-05-06 |
| [ssh-mcp](./reports/ssh-mcp.md) | mcp-server / remote-execution | MCP 远程 SSH 命令执行服务器，让 AI 获得远程服务器操作能力 | 观望 | ⭐⭐⭐⭐ | 2026-05-07 |
| [token-tracker](./reports/token-tracker.md) | developer-tool / cli-utility | 本地 AI Agent Token 消耗追踪 CLI 仪表盘，支持 Claude Code + Codex | 观望 | ⭐⭐⭐⭐ | 2026-05-08 |
| [CodexDesktop-Rebuild](./reports/CodexDesktop-Rebuild.md) | electron-repackaging / desktop-distribution | 基于逆向工程将官方仅 macOS 的 Codex Desktop 重新打包为跨平台安装包 | 不推荐（生产）/ 观望（尝鲜） | ⭐⭐⭐⭐ | 2026-05-09 |
| [UI-TARS-desktop](./reports/UI-TARS-desktop.md) | GUI Agent Platform / Desktop Automation | ByteDance 开源的 GUI Agent 平台型 monorepo：桌面端 + SDK + Operator + browser/remote runtime | 观望（生产）/ 推荐（PoC） | ⭐⭐⭐⭐⭐ | 2026-05-10 |
| [ace-tool-rs](./reports/ace-tool-rs.md) | Code Intelligence | Rust MCP 代码上下文桥接器：本地索引切块，远端检索与 prompt enhancement | 观望 | ⭐⭐⭐⭐ | 2026-05-13 |
| [openhuman](./reports/openhuman.md) | Desktop AI / Agent Platform | Rust/Tauri 本地优先个人 AI 桌面平台：memory、tools、channels、voice、webhooks 为主，skills 当前偏 metadata/catalog 层 | 观望（学习价值高） | ⭐⭐⭐⭐⭐ | 2026-05-17 |

<!-- 新项目进来后自动追加衛 -->

## 目录说明

```
Technical Knockout/
├── README.md                 # 本文件：总索引
├── repos/                    # git clone 的源码（保留，明确淘汰才删）
├── reports/                  # 每个项目的完整分析报告
└── comparisons/              # 同类项目横评（按分类归档）
```

## 分析流程

1. 项目进来 → `repos/` 下 clone 源码
2. 跑五层全量分析，产出 `reports/<project>.md`
3. 更新本文件总览表
4. 刷新该分类的横评 → `comparisons/<category>.md`

## 分析框架

### 五层分析

1. **定位与画像** — 解决什么问题，目标用户，类比，基础指标
2. **架构解剖** — 目录结构，核心架构图，技术栈，设计模式，扩展点
3. **质量与成熟度** — 代码质量，测试覆盖，CI/CD，文档，Issue 响应
4. **社区与生态** — 真实评价，衍生项目，生态活跃度
5. **选型决策** — 适合/不适合场景，风险评估，明确结论

### 双场景评估

每个项目从两个角度评估：

- **场景一：是否值得采用** — 功能覆盖、集成成本、学习曲线、维护趋势、许可证风险
- **场景二：技术架构学习** — 核心架构图、设计决策 trade-off、值得借鉴的模式、代码走读

### 横评维度

横评按场景分开打分：

**采用维度：** 功能覆盖度 / 集成成本 / 社区健康 / 文档质量 / 维护持续性
**架构学习维度：** 设计模式深度 / 代码质量 / 可借鉴度 / 创新性
