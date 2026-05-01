# superpowers

> 一句话定位：**一套跨平台 Agentic 技能框架与软件开发方法论，通过 14 个可组合 SKILL 在编码 agent 中强制注入「先设计→再计划→TDD 执行→子代理审查」的纪律，支持 Claude Code / Codex / Cursor / Copilot CLI / Gemini CLI / OpenCode 等 10+ 平台。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `obra/superpowers` |
| URL | `https://github.com/obra/superpowers` |
| Star | 175,600 (2026-05-02) |
| Fork | 15,512 |
| 许可证 | MIT |
| 语言 | Shell（本质为 Markdown 文档仓库） |
| 首次提交 | 2025-10-09 |
| 最近提交 | 2026-05-01 |
| 最新 Release | v5.0.7 |
| 贡献者数 | 以 Jesse Vincent 为核心，社区贡献者活跃 |
| 分析日期 | 2026-05-02 |

---

## 场景一：是否值得采用

### 解决的问题

AI 编码 agent 的默认行为是「拿到需求就开始写代码」——这导致：
- 未充分理解需求就动手，返工率高
- 不写测试或后补测试，测试覆盖不可信
- 遇到 bug 随机打补丁，不追根因
- 代码写完后不审查就提交，质量不可控

Superpowers 通过**技能强制触发机制**（bootstrap + session-start hook）在会话开始时就把「纪律」注入 agent，使其在任何编码任务前自动执行：brainstorm → plan → TDD → subagent review → merge。

目标用户：已经在使用 Claude Code、Codex、Cursor 等 AI 编码工具的个人开发者或小团队，希望提升 agent 输出质量而不更换平台。

### 核心能力边界

**能做什么：**
- 在支持 plugin/skill 体系的宿主平台上自动触发规范工作流
- 通过 brainstorm 技能把模糊需求细化成可审查的设计文档
- 通过 writing-plans 生成细粒度实施计划（每个任务 2-5 分钟，含完整代码与验证步骤）
- 通过 subagent-driven-development 或 executing-plans 执行计划，前者每任务派子代理+两阶段审查，后者批量执行+人工检查点
- 通过 test-driven-development 强制 RED-GREEN-REFACTOR
- 通过 systematic-debugging 强制四阶段根因分析
- 多平台支持：Claude Code（官方市场）、Codex CLI/App、Cursor、OpenCode、Copilot CLI、Gemini CLI

**不能做什么：**
- **不替代宿主平台**：没有自己的 LLM 调用层、没有文件系统抽象、没有子进程管理。纯技能层，必须依附于 Claude Code / Codex / Cursor 等平台
- **不管理长期项目状态**：没有持久化的项目记忆、没有知识图谱、没有跨会话的上下文累积（除了 git worktree 和保存的设计文档）
- **不解决模型能力问题**：如果宿主平台的模型本身无法通过测试或写出正确代码，Superpowers 的流程再严也救不了
- **不适用于无 skill 工具的平台**：传统 ChatGPT Web、无插件体系的 IDE 无法使用

### 集成成本

| 维度 | 评估 |
|------|------|
| 安装复杂度 | 极低。Claude Code 一条 `/plugin install` 命令；Codex `/plugins` 搜索安装；Cursor `/add-plugin`。OpenCode 一行 fetch 指令。均 < 1 分钟 |
| 学习曲线 | 中低。用户不需要学习新 CLI，只需让 agent 干活，agent 会自动触发 skill。但需要适应 agent 先问一堆问题再写代码的节奏 |
| 对现有工作流侵入性 | 中。会自动在编码前插入 brainstorm 和 plan 阶段，对于「快速改个配置」类任务可能感觉重。但 skill 支持用户 override |
| 平台锁定 | 低。MIT 许可，技能是明文 Markdown，迁移到另一平台只需复制 skills/ 目录并适配 plugin metadata |
| 依赖链 | 零依赖。核心资产是 Markdown 文件，不依赖任何外部服务或库 |

### 风险评估

| 风险 | 等级 | 说明 |
|------|------|------|
| 许可证合规 | 低 | MIT，可自由商用和修改 |
| Bus factor | 中高 | 核心作者 Jesse Vincent 主导，Prime Radiant 商业化运作。社区贡献活跃但架构方向由核心团队把控 |
| 供应商锁定 | 低 | 明文 Markdown 技能，随时可 fork 自建 |
| 维护趋势 | 低 | 更新极频繁（2026年3月一个月内从 v5.0.0 到 v5.0.7），说明团队投入度高 |
| 安全历史 | 低 | 纯文档仓库，无运行时代码，攻击面极小。brainstorm server 在 v5.0.2 后实现为零依赖内置模块，移除了 ~1200 行 vendored node_modules |
| AI slop PR 风险 | 中 | 仓库有 94% PR 拒绝率，专门写了 AGENTS.md 警告 AI agent 不要提交 slop。说明社区对质量要求极高，但也意味着外部贡献门槛极高 |

### 采用结论

**推荐采用** — 对于已经在使用 Claude Code / Codex / Cursor 等平台的开发者，Superpowers 是**零成本、高回报**的质量提升方案。它不改变你的工具链，只是在现有工具链中注入纪律。尤其适合：
- 希望 agent 从「写代码快」进化到「写代码对」的个人开发者
- 需要结构化审查流程的小团队
- 想统一团队 AI 编码规范的技术负责人

**不适合：**
- 追求「一句话需求→立刻出代码」极致速度的场景（Superpowers 会强制先设计再计划）
- 没有 plugin/skill 支持的平台用户
- 需要独立 Coding Agent 平台（带自有 LLM 路由、文件系统、持久化记忆）的团队

---

## 场景二：技术架构学习

### 核心设计决策

#### 1. 技能即代码（Skills as Code）

Superpowers 把软件开发方法论编码为 Markdown 文档（SKILL.md），通过宿主平台的 skill 工具在运行时注入 agent 上下文。这是一种**声明式行为 shaping**——不写代码控制 agent，而是写文档约束 agent。

**Trade-off：**
- ✅ 跨平台：同一套 Markdown 技能可通过不同 plugin metadata 分发到 Claude Code、Codex、Cursor 等平台
- ✅ 可解释：人类可读、可 diff、可版本控制
- ❌ 无强制力：完全依赖 agent 自觉调用 skill，宿主平台不提供强制执行机制。作者通过 session-start hook 和「Red Flags 理性化表格」来最大化遵守率，但技术上 agent 仍可绕过

#### 2. 零依赖设计

整个仓库核心是 ~14 个 SKILL.md 文件 + 平台 plugin metadata。没有 package.json 依赖（除了 OpenCode 的 minimal package.json），没有构建步骤，没有 CI/CD pipeline。

**Trade-off：**
- ✅ 极端轻量：2.5 MB 仓库，可秒级 clone
- ✅ 长期可维护：不依赖任何可能过时的 npm 包
- ❌ 无自动化测试基础设施：测试全靠 shell 脚本驱动子代理做集成/压力测试
- ❌ 无类型安全：Markdown 无编译期检查，skill 质量全靠人工 review + 子代理压力测试

#### 3. 跨平台 Bootstrap + Hook 机制

每个平台通过不同的 plugin 系统接入，但统一通过 `hooks/session-start` 在会话开始时注入 `using-superpowers` 引导技能。这实现了**多宿主、单内核**的架构。

```
┌─────────────────────────────────────────────────────────┐
│                     宿主平台层                            │
│  Claude Code    Codex CLI    Cursor    Copilot CLI ...   │
│     │               │            │            │          │
│     └───────────────┴────────────┴────────────┘          │
│                      plugin metadata                       │
│  .claude-plugin/  .codex-plugin/  .cursor-plugin/ ...   │
│                      │                                    │
│              hooks/session-start                          │
│                      │                                    │
│         ┌────────────┴────────────┐                       │
│         ▼                         ▼                       │
│   using-superpowers          14 core skills               │
│   (bootstrap / gatekeeper)   (brainstorm, tdd, debug...)  │
└─────────────────────────────────────────────────────────┘
```

#### 4. TDD 作为元方法论

Superpowers 不仅要求用户对代码做 TDD，它自身也要求对 skill 做 TDD：`writing-skills` 技能明确要求「NO SKILL WITHOUT A FAILING TEST FIRST」——先让子代理在没有 skill 的情况下犯错（RED），再写 skill 让子代理做对（GREEN），最后收紧 loophole（REFACTOR）。

这是一种**自举式质量保障**：方法论的质量通过方法论本身来验证。

### 值得学习的模式列表

| 模式 | 说明 | 可借鉴度 |
|------|------|---------|
| Session-start bootstrap | 在 AI 会话开始时注入行为约束，而非每次对话提醒 | 高 |
| Red Flags 理性化表格 | 预判 agent 会找的借口并提前反驳，大幅提高规则遵守率 | 极高 |
| 技能描述 CSO (Claude Search Optimization) | description 字段只写触发条件不写流程，防止 agent 读摘要跳过正文 | 极高 |
| TDD for Documentation | 用子代理压力测试来验证 Markdown 文档的有效性 | 高 |
| 零依赖 Markdown 技能库 | 完全用文本文件实现跨平台可复用 agent 行为 | 中 |
| 两阶段审查（spec + quality） | subagent-driven-development 中先审合规再审质量 | 高 |
| 用户指令优先级声明 | 明确「用户显式指令 > skill > 系统默认提示」解决冲突 | 高 |

### 踩坑点 / 反模式

- **不要写摘要式 description**：Superpowers 的 CSO 研究明确证明，如果 skill description 总结了工作流程，Claude 会按摘要执行而不读正文，导致两阶段审查变成单阶段审查
- **不要在 skill 里放多个例子**：一个优秀例子胜过五个平庸例子，agent 会选第一个遇到的例子而忽略其他
- **不要假设 agent 会自觉遵守**：必须写明确的 loophole 封堵（如 "Delete means delete. Don't keep as reference."）
- **不要在没有测试的情况下修改 skill**：writing-skills 的 Iron Law 要求任何修改都必须先有失败测试

### 核心文件走读

**`skills/using-superpowers/SKILL.md`** — 整个系统的 gatekeeper。session-start hook 注入的就是这个技能。它用极其强硬的语气（"You MUST invoke" / "This is not negotiable"）和 Red Flags 表格防止 agent 绕过技能检查。包含一个 Graphviz DOT 流程图描述技能触发决策链。

**`skills/writing-skills/SKILL.md`** — 把 TDD 映射到文档创作的元技能。包含 CSO（Claude Search Optimization）的完整规范、四种技能类型（Discipline/Technique/Pattern/Reference）的测试策略、以及针对 agent 理性化的心理学防御（引用 Cialdini 的说服原则）。

**`skills/subagent-driven-development/SKILL.md`** — 执行层的核心。定义「每个任务派一个全新子代理 + 两阶段审查」的模式。强调上下文隔离：子代理只收到精确构造的上下文，不会继承父会话的历史。

**`skills/test-driven-development/SKILL.md`** — 纪律执行最严的技能。包含 RED-GREEN-REFACTOR 的完整规则、测试反模式参考、以及「如果没看测试失败就写了代码，必须删除重写」的强硬条款。

**`hooks/session-start`** — 跨平台启动脚本。检测当前宿主环境（CLAUDE_PLUGIN_ROOT / CODEX_PLUGIN_ROOT / CURSOR_PLUGIN_ROOT 等），注入 bootstrap 文本，用 `printf` 替代 heredoc 以兼容 Bash 5.3+ 和 dash。

**`scripts/sync-to-codex-plugin.sh`** — 把一个源仓库同步为 Codex plugin 的镜像工具，包含 overlay 生成、版本对齐、PR 自动创建。展示了如何维护多平台 plugin 的一致性。

---

## 质量与成熟度

### 代码质量

- **类型系统**：不适用（纯 Markdown 文档仓库）
- **错误处理**：不适用
- **风格一致性**：极高。所有 SKILL.md 遵循统一的前置事项（YAML frontmatter + 大写 H1 + Overview/When to Use/Core Pattern 结构），通过 `writing-skills` 技能自身来保证
- **AGENTS.md / CLAUDE.md 规范**：仓库主动为 AI agent 编写贡献者规范，说明项目本身高度 agent-aware

### 测试

- **框架**：无传统单元测试框架。测试目录 `tests/` 下是集成/压力测试脚本（bash），驱动真实 agent 会话验证技能触发和执行结果
- **覆盖率**：无法量化，但测试方法论非常严谨——每个技能变更需要 adversarial pressure testing（对抗性压力测试）
- **测试类型**：
  - `tests/skill-triggering/` — 验证用户输入特定 prompt 时是否自动触发正确 skill
  - `tests/explicit-skill-requests/` — 验证显式请求技能时的行为
  - `tests/subagent-driven-dev/` — 端到端验证子代理驱动开发流程（含 svelte-todo 和 go-fractals 两个示例项目）
  - `tests/claude-code/`、`tests/codex-plugin-sync/`、`tests/opencode/` — 平台特定集成测试

### CI/CD

- **无 GitHub Actions workflow**：这个项目没有 `.github/workflows/` 目录，完全依赖人工 review 和本地测试脚本
- **发布流程**：`scripts/bump-version.sh` 管理跨文件版本号一致性（.claude-plugin/plugin.json、.codex-plugin/plugin.json、package.json 等）
- **版本节奏**：2026年3月一个月内发布 7 个 patch 版本（v5.0.0 → v5.0.7），修复了 brainstorm server ESM 兼容、Windows PID 监控、Bash 5.3 heredoc 回归等大量平台兼容性问题

### 文档

- **README**：清晰。包含多平台安装指南、基础工作流说明、技能库索引
- **API 文档**：不适用（无 API）
- **教程/指南**：`docs/testing.md`、`docs/README.opencode.md`、`docs/README.codex.md` 等平台特定文档
- **Changelog**：`RELEASE-NOTES.md` 非常详细，每个版本都有具体的问题描述、修复细节、PR 引用

### Issue/PR 健康度

- **Open Issues**：287
- **PR 拒绝率**：94%（仓库自曝数据），大部分被拒 PR 来自未阅读贡献指南的 AI agent
- **响应速度**：核心团队对 issue 和 PR 响应快速，Release Notes 显示社区贡献被积极合并（如 @arittr、@culinablaz 的多项 PR）
- **Breaking change**：v5.0.6 用 inline self-review 替代了 subagent review loop（基于 5x5 回归测试数据），展示了数据驱动的变更决策

---

## 社区与生态

### 真实评价

- **Star/Fork 比**：175.6k / 15.5k ≈ 11.3，远高于一般项目（通常 10-20 为健康），说明不仅是 star 收藏，实际 fork 尝试的比例也高
- **社区渠道**：Discord（prime radiant）、GitHub Issues、邮件列表（release announcements）
- **商业化**：由 Prime Radiant 公司维护，Jesse Vincent 是创始人。有 GitHub Sponsors 但核心代码完全开源

### 衍生项目/插件生态

- **superpowers-marketplace**：obra/superpowers-marketplace 提供相关插件的集中分发
- **第三方 plugin**：社区为 OpenCode、Copilot CLI 等平台贡献适配层
- **技能衍生**：个人开发者基于 `writing-skills` 方法论编写自己的私有技能库

### 竞品对比

| 维度 | Superpowers | Compound Engineering | Raw Claude Code Skills |
|------|------------|---------------------|------------------------|
| 定位 | 跨平台技能框架 | 复利工程工作流插件 | 无（依赖用户自行管理） |
| 平台覆盖 | 10+（CC, Codex, Cursor, Copilot, Gemini, OpenCode...） | 7（CC, Cursor, Codex, Windsurf, V0, Cline, Roo） | 1（仅 Claude Code） |
| 核心理念 | 纪律注入（TDD、设计先行） | 复利积累（brainstorm→plan→work→review→compound） | 无统一理念 |
| 多 Agent 审查 | 两阶段审查（spec + quality） | 多 Agent 并行审查 + 置信度门控 + 去重 | 无 |
| 技能数量 | 14 核心 + 平台适配 | 36 skills + 51 agents | 用户自定义 |
| 零依赖 | 是 | 否（TypeScript + 构建步骤） | N/A |
| PR 门槛 | 极高（94% 拒绝率） | 中高 | N/A |
| 目标用户 | 个人开发者、小团队 | 团队、技术负责人 | 个人 |

---

## 评分（1-5）

| 维度 | 分数 | 说明 |
|------|------|------|
| 功能覆盖度 | 5 | 覆盖了从需求分析到代码审查到分支收尾的完整开发生命周期 |
| 代码质量 | 4 | Markdown 无类型系统，但内容质量极高，规范统一，自举式 TDD 保障 |
| 文档质量 | 5 | 每个技能都有清晰结构、流程图、反模式表格；Release Notes 极详细 |
| 社区活跃度 | 5 | 175k+ stars，issue/PR 活跃，核心团队响应快，更新频繁 |
| 架构设计 | 5 | 多宿主单内核的 plugin 架构精巧，零依赖设计大胆且有效 |
| 学习价值 | 5 | 技能设计心理学、CSO、Red Flags 表格、TDD-for-docs 都是前沿实践 |
| 可借鉴度 | 5 | 任何需要「让 AI agent 遵守规范」的场景都可以借鉴其技能设计方法 |

**总分：34/35**

---

## 总结

Superpowers 是 AI 编码工具时代的方法论基础设施。它不做 LLM，不做 IDE，不做文件系统——它只做一件事：**把经过验证的软件开发最佳实践编码为 agent 可执行的纪律**。在 175k+ stars 和社区 94% PR 拒绝率的背后，是一个对质量有偏执追求的团队。

对于架构学习者来说，Superpowers 最大的价值在于它展示了**「如何用文本来控制文本生成器」**——不是通过代码约束，而是通过精心设计的 Markdown 文档、Red Flags 表格、CSO 描述规范来 shaping agent 行为。这对于所有正在构建 AI 应用的人来说，都是一堂必修课。
