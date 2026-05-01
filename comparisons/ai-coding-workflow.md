# AI Coding Workflow 横评

> 分类：AI Coding Workflow
> 项目：[superpowers](../reports/superpowers.md) 、 [compound-engineering-plugin](../reports/compound-engineering-plugin.md)
> 更新日期：2026-05-02

## 横评对象

| 项目 | 一句话 | Star |
|------|--------|------|
| **superpowers** | 跨平台 Agentic 技能框架与方法论，14 技能强制注入 TDD + 设计先行 | 175,600 |
| **compound-engineering-plugin** | 以"复利工程"为理念的多 Agent 协作编码工作流插件 | 15,974 |

## 采用选型横评

| 维度 | superpowers | compound-engineering-plugin | 评价 |
|------|------------|---------------------------|------|
| 功能覆盖度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 两者都覆盖从需求到审查到合并的全流程。Superpowers 把重点放在 TDD 和纪律执行，CE 把重点放在复利积累和多 Agent 并行审查 |
| 集成成本 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Superpowers 是零依赖纯 Markdown，安装即即用；CE 是 TypeScript 项目，需要构建步骤 |
| 社区健康 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Superpowers 175k+ stars 和极高 PR 门槛，保证了核心质量；CE 社区活跃但规模较小 |
| 文档质量 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 两者文档都很优秀。Superpowers 的 RELEASE-NOTES 和 skill 结构更精致，CE 有完整的复利工程理论文档 |
| 维护持续性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 两者都在 2026年5月仍有活跃提交。Superpowers 更新频率更高（一个月 7 个 patch），CE 更稳定 |
| 平台覆盖 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Superpowers 支持 10+ 平台（含 Copilot CLI、Gemini CLI），CE 支持 7 平台 |
| 学习曲线 | ⭐⭐⭐⭐ | ⭐⭐⭐ | Superpowers 的流程更直接，用户不需要理解复利工程概念就能获益；CE 需要理解 brainstate 和 compound 闭环 |

### 采用建议

- **个人开发者 / 小团队：推荐 superpowers**
  - 零依赖、安装简单、即即用
  - TDD + 设计先行的方法论更通用，不捁杂复利工程理念
  - 平台支持更广（Gemini CLI、Copilot CLI 等）

- **团队技术负责人 / 需要组织记忆沉淀：推荐 compound-engineering-plugin**
  - 复利工程理念更适合团队规范：每次任务的结果都会沉淀为可复用的组织记忆
  - 多 Agent 并行审查 + 置信度门控更适合高风险代码变更
  - 支持工作流的持续改进（compound 闭环）

## 架构学习横评

| 维度 | superpowers | compound-engineering-plugin | 评价 |
|------|------------|---------------------------|------|
| 设计模式深度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Superpowers 的「技能即代码」和「CSO」是前沿的 agent 行为 shaping 方法；CE 的多 Agent 审查门控也是前沿 |
| 代码质量 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Superpowers 是 Markdown 不谈代码质量，但结构质量极高；CE 是规范 TypeScript 项目 |
| 可借鉴度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 两者都极具借鉴价值。Superpowers 的 skill 设计方法可复用于任何需要 shaping agent 行为的场景；CE 的审查门控机制可复用于任何多 Agent 协作场景 |
| 创新性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Superpowers 的 Red Flags 理性化表格和 TDD-for-docs 是独特创新；CE 的复利工程概念和置信度门控也是独特创新 |

### 架构学习建议

- **学习如何用文本控制 AI agent 行为：看 superpowers**
  - 「CSO」（Claude Search Optimization）：description 只写触发条件不写流程摘要，防止 agent 跳过正文
  - 「Red Flags 表格」：预先列出 agent 会找的借口并给出反驳，提高规则遵守率
  - 「零依赖跨平台 plugin」：如何用纯文本实现多宿主单内核

- **学习多 Agent 并行审查与门控：看 compound-engineering-plugin**
  - 置信度门控：如何让多个审查 agent 并行工作后合理地决定是否通过
  - 去重机制：如何处理并行审查中的重复问题
  - 复利闭环：brainstorm → plan → work → review → compound 的持续改进机制

## 总结推荐

| 场景 | 推荐 |
|------|------|
| 采用选型（个人/小团队） | 🏆 **superpowers** — 零依赖、安装简单、方法论通用、平台支持更广 |
| 采用选型（团队/组织记忆） | 🏆 **compound-engineering-plugin** — 复利沉淀、多 Agent 审查、持续改进闭环 |
| 架构学习（agent 行为 shaping） | 🏆 **superpowers** — 技能设计心理学、CSO、Red Flags 方法论是行业前沿 |
| 架构学习（多 agent 协作架构） | 🏆 **compound-engineering-plugin** — 置信度门控、去重机制、工作流驱动的实现更深入 |
| 综合冠军 | 🏆 **superpowers** — 更轻量、更通用、更易集成，架构创新性对行业影响更大 |

---

## 横评备注

- superpowers 和 compound-engineering-plugin 并非互斥，在使用 Claude Code 或 Cursor 的情况下可以同时安装两个插件
- 但如果只能选一个，superpowers 的零依赖设计、更广的平台支持、更简洁的学习曲线使其成为更普适的选择
