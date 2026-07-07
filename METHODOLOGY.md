# TK Methodology

Technical Knockout（TK）是一套面向 AI Agent 的能力复刻方法。它的目标不是“写一篇项目介绍”，而是把优秀开源项目拆成可复用、可比较、可被 Agent 落到当前项目的技术研究资产。

## 分析目标

每份 TK 报告都要同时服务两个场景：

1. **能力复刻**：如果当前项目要获得同类能力，必须保留哪些内核、契约、状态和失败边界？
2. **采用选型**：这个项目是否值得引入？适合个人、小团队、企业生产化，还是应该观望？
3. **架构学习**：这个项目为什么能成立？如果重写同类系统，哪些抽象、执行链路和设计不变量必须保留？

## 报告结构与分析框架

TK 逻辑上仍覆盖“定位 / 架构 / 质量 / 社区 / 决策”五类问题，但正式报告已经冻结为 **Report Contract v1**：

### Required H2（hard gate）

| H2 | 作用 |
|---|---|
| `基本信息` | 项目标识、仓库元数据、分析日期 |
| `场景一：是否值得采用` | adoption / build-vs-buy 判断 |
| `场景二：技术架构学习` | architecture learning / capability replication |
| `质量与成熟度` | 工程质量与验证信号 |
| `社区与生态` | adoption / ecosystem context |
| `评分` | 结构化评价输出 |
| `总结` | 对人和 agent 的最终结论 |

### Required H3（hard gate）

| Parent H2 | Required H3 |
|---|---|
| `场景一：是否值得采用` | `解决的问题` / `核心能力与边界` / `结论` |
| `场景二：技术架构学习` | `核心架构图` |
| `质量与成熟度` | `代码质量` |

### Recommended H2 / H3（warn only）

- Recommended H2：`架构解剖`、`关键代码走读`
- Recommended H3：
  - `场景一：是否值得采用` → `依赖 / SDK 选型证据`、`风险评估`
  - `场景二：技术架构学习` → `底层技术架构`
  - `质量与成熟度` → `测试`、`CI/CD`、`文档质量`、`Issue / PR 健康度`
  - `社区与生态` → `衍生项目 / 插件生态`、`竞品对比`
  - `总结` → `一句话评价`、`谁应该用`、`谁不应该直接用`、`下一步`

### Strict vs tolerant

- **strict**：只对影响报告可比性和机器索引的核心骨架做 fail gate
- **tolerant**：对推荐章节、旧标题别名、细分叙事颗粒度只给 warning
- **auto-fix**：只自动归一低风险 heading alias，不自动改写正文判断

正式 contract、alias map、audit artifact path 见 [`docs/tk-report-structure-contract-v1.md`](./docs/tk-report-structure-contract-v1.md)。

## 五类分析问题如何映射到 contract

### 1. 基本信息 / 定位与画像

回答项目“是什么”和“处在什么生态位”：

- 仓库、许可证、语言、Star/Fork、Release、贡献者、分析日期。
- 一句话定位。
- 类比法：类似哪个项目，但侧重什么差异。
- 项目分类：如 Coding Agent、Code Intelligence、Enterprise RAG、Agent Platform。
- 目标用户和核心使用场景。

### 2. 场景一：是否值得采用

回答项目“应该怎么用”：

- 解决的问题与目标用户。
- 核心能力与边界：能做什么 / 不能做什么。
- 集成成本：依赖、部署、学习曲线、从零到 demo 时间。
- 依赖 / SDK 选型证据：列出所有 direct dependency 的机器清单，并解释关键库解决的问题。
- 风险评估：许可证、bus factor、供应商锁定、维护趋势、安全历史。
- 明确结论：推荐采用 / 观望 / 不推荐。
- 区分个人 PoC、小团队试用和企业生产化。

### 3. 场景二：技术架构学习

回答项目“为什么能成立，以及如果重写同类系统该保留什么”：

- 核心架构图：Mermaid、ASCII 或 SVG。
- 关键设计决策与 trade-off。
- 值得学习的模式、反模式 / 踩坑点、可借鉴技术点。
- 底层技术架构：见下一节。

### 4. 质量与成熟度

回答项目“是否可靠”：

- 类型系统和边界处理。
- 错误处理、日志、状态恢复、降级策略。
- 测试类型：单元、集成、E2E、contract、mock/fake provider。
- CI/CD：是否真的跑测试，还是只跑 lint/build。
- 文档质量：README、API docs、tutorial、changelog、migration guide。
- Issue/PR 健康度：响应速度、积压、合并节奏、breaking changes。

### 5. 社区与生态

回答项目“是否有人真实使用”：

- Issue、PR、讨论区、HN/Reddit/社交平台中的真实评价。
- 衍生项目、插件、模板、集成。
- 竞品、邻近替代和架构邻居。
- 区分 hype、Star 增长和真实 adoption。

## 依赖 / SDK 选型证据

每份正式报告必须包含 `### 依赖 / SDK 选型证据` 章节。

TK 区分两层：

- **全量直接依赖清单**：由 `tk catalog build` 从本地源码 manifest 生成，写入 `project.dependencies`。范围是 manifest 明确声明的一层 direct dependencies，包括 runtime、development、optional、peer、build 等 scope；不包含 lockfile transitive dependencies。
- **关键依赖解释表**：由报告作者填写，解释关键库 / SDK / 框架 / CLI / 协议包为什么存在，以及它替代了什么自研基础设施。

固定表格：

```md
| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
```

字段要求：

- `Dependency`：库、SDK、框架、CLI 或协议包名称。
- `Type`：framework、SDK、CLI、protocol、parser、storage、search、UI、runtime 等。
- `Used for`：项目中实际用它做什么。
- `Problem solved`：它解决了什么通用工程问题，避免了哪类自研基础设施。
- `Evidence`：manifest 路径、源码调用点、配置文件或报告证据。
- `Reuse signal`：用户项目满足什么条件时，agent 应优先评估复用它或同类成熟库。
- `Caution`：什么情况下不要照搬，例如生态不匹配、过重、许可证、宿主限制、项目已有替代能力。

Agent 做 build-vs-buy 时，必须先看 current project 已有依赖，再看 TK reference 的 `dependencyEvidence` 和 direct dependency 清单。不能只因为参考项目用了某库就建议用户项目也安装。

## 底层技术架构标准

TK 的“架构分析”不能停在目录结构、技术栈、核心文件、模块职责和功能清单。这些只算工程结构。

每份正式报告必须单独回答：**这个系统为什么成立，以及如果重写同类系统，哪些架构能力必须被复刻。**

## 能力复刻 Brief

当 Agent 使用 TK 帮当前项目复刻能力时，最终输出应先落成这个 brief，
再进入实现：

```md
## Capability Replication Brief

Capability:
Current project fit:
Reference projects:
Evidence:
TK Replication Ladder:
Kernel:
Must keep:
Can adapt:
Do not copy:
Build-vs-buy:
Implementation boundary:
Verification:
Freshness gaps:
```

复刻的是能力语义，不是项目外观：

- 先跳过：当前项目不需要、已有同类能力、标准库/平台/现有依赖/官方 SDK/成熟 OSS 已覆盖的能力。
- 保留：架构内核、契约边界、状态事实源、失败降级、验证方式。
- 可替换：UI、框架、目录结构、宿主 adapter、具体 backend。
- 不照搬：品牌、私有路径、凭证、无关流程、未经许可证核验的源码。

### TK Replication Ladder

TK 的工程纪律是先少造，再复刻。Agent 在提出实现前按顺序检查：

1. 当前项目真的需要这个能力吗？不需要就不做。
2. 当前项目是否已有能力或相近模式？有就复用。
3. 标准库或平台原生能力是否足够？
4. 已安装依赖是否足够？
5. 官方 SDK 或成熟 OSS 是否足够？
6. 再用 TK 参考抽取最小能力内核和设计不变量。
7. 只实现可验证的最小边界。
8. 只有 brief 证明前面都不够时，才新增底座或自研基础设施。

### 必写 8 项

#### 1. 最小架构内核

脱掉 UI、README、具体框架后，系统仍必须保留的核心组合。

示例：

```text
Capability Registry + Ordered Backend Routing + Health Probe + Agent-facing Contract
```

#### 2. 核心抽象

列出 3–8 个核心抽象，每个写清：

- 源码位置
- 职责
- 关键字段 / 方法
- 为什么重要

常见抽象包括：Capability、Provider、Backend、Tool、Session、Graph、Document、Task、Plan、Run、Artifact、Contract、Probe。

#### 3. 控制面 / 数据面分离

明确：

- **控制面**：策略、路由、配置、权限、调度、状态、审计。
- **数据面**：真实数据处理、外部调用、执行 side effect、文件读写、网络请求、模型推理。

好的系统通常把控制面做得可观测、可配置、可恢复；把数据面做得可替换、可限权、可验证。

#### 4. 关键执行链路

画出 1–3 条真实核心流程，从入口到结果。每条链路应说明：

- 入口是什么：CLI、API、UI、MCP tool、hook、scheduler。
- 经过哪些核心模块 / 函数。
- 产生哪些状态变化。
- 调用哪些外部系统。
- 如何输出结果或错误。

#### 5. 状态模型

区分三类状态：

| 状态类型 | 说明 |
|---|---|
| 持久状态 | 数据库、文件、缓存、索引、配置、workspace metadata |
| 运行时状态 | session、queue、in-memory registry、process pool、connection pool |
| 外部状态 | GitHub、浏览器、LLM provider、远端 API、用户账号、第三方服务 |

必须说明谁读写、谁是事实源、如何更新、如何处理不一致。

#### 6. 契约边界

写清系统边界：

- 内部函数 / 类 / interface 契约。
- 外部 API / CLI / MCP / RPC / WebSocket 契约。
- Agent-facing Skill、Hook、JSON schema、prompt contract、manifest。
- 请求体、响应体、错误结构、artifact 格式。

#### 7. 失败与降级模型

列出预期失败类型：

- 网络失败
- provider 不可用
- 权限不足
- 文件损坏
- schema drift
- 版本不兼容
- 超时 / rate limit
- 模型输出不完整
- 外部平台风控

并说明检测方式、系统行为、fallback、恢复动作，以及 fail-open / fail-closed / degraded mode。

#### 8. 可复刻设计不变量

提炼 5–12 条未来做同类系统必须守住的架构原则。

示例：

- 能力必须先于工具定义，工具只是能力的后端实现。
- 路由决策必须结构化可观测，不能只藏在 prompt 里。
- Agent-facing 文档必须和真实 CLI/API contract 一起演进。
- 检索/分析结果必须携带证据来源和 freshness。
- side effect 工具必须有 dry-run、scope、approval 和 audit。

## 评分维度

每个维度 1–5 分：

| 维度 | 说明 |
|---|---|
| 功能覆盖度 | 解决目标问题的完整程度 |
| 代码质量 | 类型安全、错误处理、结构清晰度、工程纪律 |
| 文档质量 | README、API 文档、教程、Changelog、迁移指南 |
| 社区活跃度 | Issue/PR 响应、贡献者、生态、真实 adoption |
| 架构设计 | 抽象清晰度、扩展性、控制面/数据面、状态契约 |
| 学习价值 | 是否能提供可迁移的架构模式和设计启发 |
| 可借鉴度 | 是否能直接复用到自己的项目或团队系统中 |

## 横评规则

同类项目足够多时，建立 `comparisons/<category>.md` 横评。

横评分两个场景：

### 采用选型横评

关注：

- 功能覆盖度
- 集成成本
- 社区健康
- 文档质量
- 维护持续性
- 许可证和生产风险

### 架构学习横评

关注：

- 设计模式深度
- 代码质量
- 可借鉴度
- 创新性
- 对同类系统的可复刻价值

## 证据原则

TK 报告应优先使用可验证证据：

1. 本地源码和测试。
2. 官方 README / docs / changelog / release。
3. GitHub Issues / PRs / Actions。
4. 真实命令输出：构建、测试、lint、doctor、smoke test。
5. 社区讨论和生态项目。

不能编造测试结果、API 响应、社区反馈或项目能力。无法验证时，应明确写“未验证”或“文档声称”。

## 时效原则

所有 Star、Fork、Issue、Release、贡献者、社区活跃度等指标都是时间敏感数据。报告必须注明分析日期；生产采用前应重新核验。
