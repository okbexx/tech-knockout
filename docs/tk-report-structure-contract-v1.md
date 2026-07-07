# TK Report Structure Contract v1

TK 的报告治理目标不是把所有报告强行改成同一个长模板，而是冻结一套 **可 lint、可 audit、可自动修正一部分标题漂移** 的结构 contract。

当前实现以 **核心骨架严格、细分章节宽容** 为原则：

- **hard gate** 只拦截真正影响可比性和机器索引的缺口
- **warn only** 用于提示推荐章节、旧标题别名和可渐进迁移项
- **auto-fix** 只处理低风险标题归一，不自动改写正文判断

## 1. Contract 落点

| Surface | Path | Role |
|---|---|---|
| Contract implementation | `packages/tk/lib/report-structure.mjs` | canonical 章节、别名、audit/lint/fix 逻辑 |
| Audit output schema | `packages/tk/schemas/report-structure-audit.schema.json` | 机器可读审计结果 schema |
| Audit artifact | `packages/tk/data/report-structure-audit.json` | `--write` 时的落盘结果 |
| Report snapshots | `packages/tk/data/reports/*.md` | 发布到 npm 包的报告镜像 |

## 2. Required H2（hard gate）

下列顶层章节缺失会直接导致 `report lint` 失败：

| H2 | Purpose |
|---|---|
| `基本信息` | 项目标识、元信息、分析日期 |
| `场景一：是否值得采用` | adoption / build-vs-buy 判断 |
| `场景二：技术架构学习` | architecture learning 与 replication 核心 |
| `质量与成熟度` | 工程质量与验证信号 |
| `社区与生态` | adoption / ecosystem context |
| `评分` | 结构化评价结果 |
| `总结` | 最终面向读者的决策输出 |

## 3. Required H3（hard gate）

只保留少量最关键子章节为 hard gate：

| Parent H2 | Required H3 |
|---|---|
| `场景一：是否值得采用` | `解决的问题` / `核心能力与边界` / `结论` |
| `场景二：技术架构学习` | `核心架构图` |
| `质量与成熟度` | `代码质量` |

## 4. Recommended H2 / H3（warn only）

这些章节不缺就更完整，缺了只告警，不阻断：

### Recommended H2

| H2 | Why it matters |
|---|---|
| `架构解剖` | 把工程结构层和“底层技术架构”拆开，避免概念混叠 |
| `关键代码走读` | 给架构判断补源码锚点 |

### Recommended H3

| Parent H2 | Recommended H3 |
|---|---|
| `场景一：是否值得采用` | `依赖 / SDK 选型证据` / `风险评估` |
| `场景二：技术架构学习` | `底层技术架构` |
| `架构解剖` | `目录结构` / `技术栈` / `模块依赖关系` / `扩展机制` |
| `质量与成熟度` | `测试` / `CI/CD` / `文档质量` / `Issue / PR 健康度` |
| `社区与生态` | `衍生项目 / 插件生态` / `竞品对比` |
| `总结` | `一句话评价` / `谁应该用` / `谁不应该直接用` / `下一步` |

### Bottom Architecture 子项（warn only）

当报告存在 `### 底层技术架构` 时，建议继续补齐以下子项；缺失只告警：

- `最小架构内核`
- `核心抽象`
- `控制面 / 数据面`
- `关键执行链路`
- `状态模型`
- `契约边界`
- `失败与降级模型`
- `可复刻设计不变量`

## 5. Alias / 归一策略

contract 内置旧标题兼容层，避免半迁移态一次性打爆全库。

### Top-level aliases

| From | To |
|---|---|
| `结论` / `最终结论` / `采用建议` | `总结` |
| `关键文件走读` / `核心文件走读` | `关键代码走读` |
| `第二层：架构解剖` | `架构解剖` |
| `第三层：质量与成熟度` | `质量与成熟度` |
| `第四层：社区与生态` | `社区与生态` |

### Child-section aliases

| From | To |
|---|---|
| `采用结论` / `采用建议` | `结论` |
| `采用风险` | `风险评估` |
| `依赖/sdk 选型证据` | `依赖 / SDK 选型证据` |
| `Issue/PR 健康度` | `Issue / PR 健康度` |
| `热度与认可度` / `社区热度` / `社区结论` | `社区评价` |
| `衍生项目/生态` | `衍生项目 / 插件生态` |
| `竞品 / 参照物` / `竞品分层` | `竞品对比` |
| `谁不应该用` | `谁不应该直接用` |
| `下一步建议` | `下一步` |

## 6. Audit 语义

每份报告会得到以下状态之一：

| Status | Meaning |
|---|---|
| `pass` | 满足 hard gate，且没有 warning |
| `warn` | 满足 hard gate，但存在推荐项缺失 / 旧标题 / 非 contract 顶层章节 |
| `fail` | 缺失 required H2 / required H3 等核心骨架 |

审计结果包含：

- `summary`：总报告数、pass/warn/fail、warning/error 计数
- `reports[]`：逐文件状态
- `missingH2`
- `missingRequiredH3`
- `missingRecommendedH3`
- `missingBottomArchitectureChildren`
- `headings`
- `warnings[]` / `errors[]`

## 7. CLI Surface

| Command | Role |
|---|---|
| `tk report audit` | 生成全库结构审计；默认 human-readable，`--json` 输出机器可读结果 |
| `tk report audit --write` | 额外写入 `packages/tk/data/report-structure-audit.json` |
| `tk report lint` | 只要存在 fail 就退出非 0 |
| `tk report lint --write` | lint 同时落盘最新 audit artifact |
| `tk report fix-headings --write` | 批量归一低风险 heading alias |

## 8. Verify / Doctor 接入

结构 contract 已接入正式验证链：

- `npm run report:audit`
- `npm run report:lint`
- `npm run verify --workspace @jarl_okbe/tk`
- `tk doctor repo`

这意味着报告结构不再只是“编辑约定”，而是 TK 包的一部分正式健康面。

## 9. Design Principle

这版 contract 的目标不是追求“每篇报告章节一模一样”，而是保证三件事：

1. **读者能稳定找到 adoption / architecture / quality / community / verdict**
2. **agent 和脚本能可靠读取报告骨架**
3. **仓库能渐进迁移，而不是一次性重写 30+ 份报告**

一句话：

> `Report Contract v1 = strict on decision skeleton, tolerant on narrative granularity.`
