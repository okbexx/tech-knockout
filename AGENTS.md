# Technical Knockout — Agent Instructions

Technical Knockout（TK）是开源项目技术调研与选型仓库。这里保存报告、横评、Agent 能力产品和源码缓存；`projects/` 下源码不纳入本仓库提交。

## 核心原则

- 每个项目必须做完整五层分析：定位与画像、架构解剖、质量成熟度、社区生态、选型决策。
- 必须 clone / pull 本地源码并读实际代码，不能只看 README。
- 默认不使用 GitNexus；只有用户明确点名“用 GitNexus / 代码图谱”时才作为增强步骤。
- 报告、横评、README 索引、插件、CLI、MCP、schema 必须落盘并提交；`projects/` 源码只做本地缓存。
- 模糊项目名且多个候选仓库存在时，先问用户确认具体 `org/repo`。
- 开发 TK 自身时优先使用 repo skill：`.agents/skills/develop-tech-knockout/SKILL.md`。

## Agent 产品边界

TK 给 Agent 的完整产品形态由 npm 包和 Codex 插件适配层共同组成：

- `packages/tk` 是 `@jarl_okbe/tk` npm 产品包，包含 CLI、MCP server、core、schema、报告快照和机器可读数据。
- `plugins/technical-knockout` 是 Codex 插件适配层，只包含 manifest、Skills、插件 README 和 MCP 启动配置。
- Skill 负责触发与编排，不复制 CLI/MCP 逻辑。
- CLI 负责确定性执行、catalog、source sync、doctor 和 JSON 输出。
- MCP 负责 read-mostly 的结构化上下文查询。
- `packages/tk/data/tk.catalog.json` 和 `tk.lock.json` 是机器可读事实。
- `projects/` 是可再生当前源码缓存，不能提交。Agent 需要读完整代码时，先用 `tk source path <project> --json` 解析本地路径，再直接读该目录。

常用验证命令：

```bash
node packages/tk/bin/tk.mjs catalog build
node packages/tk/bin/tk.mjs catalog validate
node packages/tk/bin/tk.mjs source path gitnexus --json
node packages/tk/bin/tk.mjs doctor
npm run verify
```

## 底层技术架构是硬要求

TK 的“架构分析”不能停在：

- 目录结构
- 技术栈
- 核心文件
- 模块职责
- 功能清单

这些只算工程结构。每份正式报告都必须单独回答：**这个系统为什么成立，以及如果我们重写同类系统，哪些架构能力必须被复刻。**

报告中至少包含以下内容：

1. **最小架构内核**：脱掉 UI、README、具体框架后，系统仍必须保留的核心组合。
2. **核心抽象**：系统把世界切成了哪些对象、能力、资源、状态、事件；写清职责、关键字段/方法和重要性。
3. **控制面 / 数据面分离**：哪些模块负责策略、路由、配置、权限、调度、状态；哪些模块真正处理数据或执行外部调用。
4. **关键执行链路**：至少 1–3 条真实核心流程，从入口到结果，区分控制流和数据流。
5. **状态模型**：持久状态、运行时状态、外部状态分别在哪里，谁读写，如何更新，谁是事实源。
6. **契约边界**：内部函数/接口契约、外部 API/CLI/MCP 契约、agent-facing Skill/Hook/JSON schema/prompt contract。
7. **失败与降级模型**：预期什么会坏，如何检测，如何 fallback，如何让人或 Agent 修复。
8. **可复刻设计不变量**：5–12 条未来做同类系统必须守住的架构原则。

一句话标准：**TK 不只是判断“用不用”，而是拆出“这个系统为什么成立，以及怎么复刻它的架构能力”。**

## 报告写作要求

- 基于 `reports/_TEMPLATE.md`，保存到 `reports/<repo-name>.md`。
- 基本信息中的 Star、Fork、Release、Issue/PR 等指标要注明观测日期。
- 风险结论必须区分“个人/小团队 PoC”和“企业生产化”。
- 竞品要按项目真实产品边界分层：直接竞品、邻近替代、架构邻居。
- 代码走读要引用真实文件路径和函数/类名。
- 如果本地实测了测试/构建/lint/mypy，要写真实命令和真实结果；不能编造。

## 提交规则

提交前执行：

```bash
git status --short
git diff --check
git add README.md reports/*.md comparisons/*.md AGENTS.md CONTRIBUTING.md docs .agents plugins/technical-knockout packages/tk package.json package-lock.json .gitignore
git diff --cached --stat
git diff --cached --check
git commit -m "analysis: <repo-name> 全量五层分析"
git push origin main
```

注意：

- 不要提交 `repos/` 下源码。
- 不要把无关本地脏文件混进报告提交。
- 新增或改动报告后必须更新 README 总览表。
- 同类项目已有横评时必须刷新 `comparisons/<category>.md`。
