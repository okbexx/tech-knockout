# Agent-Native Design 横评

> 更新日期：2026-06-28
> 涉及项目 / 方案：DESIGN.md, open-design, W3C Design Tokens / DTCG, Style Dictionary, Tailwind theme。
> 分类口径：这里比较的是“让 AI coding agent 稳定理解和复用设计系统”的上下文 / 协议 / 工具链，不是传统设计画布，也不是单纯 CSS 框架。

---

## 场景一：采用选型横评

### 对比矩阵

| 维度 | DESIGN.md | open-design | DTCG / tokens.json | Style Dictionary | Tailwind theme |
|------|-----------|-------------|--------------------|------------------|----------------|
| 产品形态 | Markdown + YAML 设计上下文格式 + CLI | 本地优先 AI 设计工作台 / agent shell | 设计 token 标准数据格式 | 跨平台 token build system | CSS framework 配置层 |
| 面向 agent 的可读性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ |
| 工程集成成本 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 设计意图表达 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ | ⭐ | ⭐ |
| token 管线成熟度 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 预览 / 产物生成 | ⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ | ⭐⭐ |
| 企业生产成熟度 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 最佳角色 | Agent 设计上下文事实源 | AI 设计产物工作台 | 标准 token 交换格式 | 多端 token 编译分发 | 前端实现层主题配置 |
| 采用建议 | 推荐作为 AI 前端项目上下文层 | 推荐学习/PoC，生产观望 | 适合作为 token 数据标准 | 企业 token pipeline 首选之一 | 前端项目继续使用 |

### 结论

- **如果核心问题是“coding agent 每次写 UI 都跑偏 / 没有稳定审美上下文”** → 优先引入 **DESIGN.md**。
- **如果核心问题是“我要一个能生成、预览、导出设计产物的 AI 工作台”** → 看 **open-design**。
- **如果核心问题是“多端设计 token 标准交换”** → 看 **DTCG / tokens.json**。
- **如果核心问题是“把 token 编译到 Web/iOS/Android/品牌包”** → 看 **Style Dictionary**。
- **如果只是前端实现层主题** → Tailwind theme 足够，但不应承担 agent 设计意图上下文。

---

## 场景二：架构学习横评

### 核心差异

| 问题 | DESIGN.md 的方案 | open-design 的方案 | 传统 token pipeline 的方案 |
|------|------------------|--------------------|-----------------------------|
| 设计事实源 | repo 中的 plain-text `DESIGN.md` | project workspace + `DESIGN.md` + skills + artifacts | Figma / tokens.json / Style Dictionary config |
| Agent 如何理解设计 | prose-first：具体参考、负面约束、rationale | Skill prompt + design-system registry + preview feedback | 主要依赖工具适配或额外 prompt |
| 机器如何验证 | CLI lint / diff / export | daemon / preview / agent workflow / export | schema validation / build transform |
| 状态模型 | 无 daemon，每次从文件重建 model | SQLite + 文件系统 + daemon runtime state | token 文件 + build outputs |
| 扩展边界 | unknown sections/keys + custom rules/exporters | plugins / atoms / skills / runtimes | transforms / formats / platforms |
| 最大风险 | spec alpha、不能替代完整设计系统治理 | 架构面大、安全面重、项目早期 | agent 可读性弱、意图与 token 分离 |

### 最值得复刻的架构模式

1. **DESIGN.md 的 prose + token 双层契约**
   - token 是 normative value，prose 是 semantic context。
   - 这是 agent-native 设计系统的关键不变量。

2. **DESIGN.md 的 parser/model/rule/emitter 分层**
   - 小工具也要有稳定中间模型，不能让 CLI 直接读 raw YAML 做所有事。

3. **open-design 的设计产物工作台闭环**
   - brief → agent runtime → artifact preview → critique → export。
   - 适合学习“AI 设计产品”而不是“设计格式”。

4. **Style Dictionary 的跨平台编译思想**
   - DESIGN.md 如果进入企业流程，应该把 Style Dictionary / DTCG 当下游，而不是重写整个 token compiler。

5. **Tailwind theme 的低摩擦实现层**
   - DESIGN.md export Tailwind 是正确路径：上游保留语义，下游快速落地。

---

## 推荐组合

### 个人 / 小团队 AI 前端项目

```text
DESIGN.md
  ↓ lint in CI
Tailwind export / manual theme mapping
  ↓
Claude Code / Codex / Cursor / Hermes read DESIGN.md before UI work
```

### AI 设计工作台 PoC

```text
open-design as workbench
  + DESIGN.md as design-system file
  + Tailwind/DTCG export as implementation bridge
```

### 企业设计系统试点

```text
Figma Variables / Tokens Studio
  ↓ export tokens.json / DTCG
DESIGN.md as agent-readable prose + token subset
  ↓ lint/diff in PR
Style Dictionary / existing token pipeline remains production source
```

---

## 最终推荐

- **采用冠军（agent 上下文）**：DESIGN.md。
- **采用冠军（企业 token pipeline）**：Style Dictionary + DTCG。
- **产品学习冠军（AI 设计工作台）**：open-design。
- **最实用组合**：`DESIGN.md + Tailwind + 现有 coding agent`。
