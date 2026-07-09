# Understand-Anything

> 一句话定位：**Understand-Anything 是一个 agent-native 的代码 / 文档 / 知识库理解工作流包**。它把“扫描仓库 → 抽取结构 → 合并知识图谱 → 可视化探索 → diff / chat / onboard / domain / knowledge 消费 → hook 驱动增量更新”封装成多平台可分发的 skills + plugin substrate，而不是单一 IDE 功能或传统静态分析器。

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `Egonex-AI/Understand-Anything` |
| URL | `https://github.com/Egonex-AI/Understand-Anything` |
| Star | 71,525（2026-07-07 观测） |
| Fork | 5,956（2026-07-07 观测） |
| 许可证 | MIT |
| 主要语言 | TypeScript；另有 JavaScript / Python / Astro / CSS / Shell / PowerShell |
| 创建时间 | 2026-03-15（GitHub 仓库创建） |
| 首次提交 | 2026-03-14（`5d20a57`，`docs: add design doc and Phase 1 implementation plan`） |
| 当前分析快照 | `73559a160645359c57be44c174935899dec9f9f2`（2026-07-06，`Merge pull request #541 ... fix-cross-layer-container-cache`） |
| 最新 Git tag / GitHub Release | `v2.7.3`（2026-05-19） |
| 当前主线插件版本 | `.claude-plugin/plugin.json` 为 `2.8.2`，说明 `main` 已明显领先于 latest release |
| 当前健康度 | open issues 96；open PRs 168；GitHub `open_issues_count` 为 264（含 PR） |
| 贡献分布 | `git shortlog -sn --all` 前两位：`Lum1104` 379、`Yuxiang Lin` 92；后续作者迅速长尾化，核心实现仍高度集中 |
| 代码规模 | 433 tracked files；9 个 agents；8 个 skills；2 个 hooks 文件；`packages/core/src` 142 个 TS 文件；当前可见测试文件 39 个 |
| 分析日期 | 2026-07-07 |

---

## 版本变化速读

相较 2026-06-15 的旧报告，这个项目已经不是“小修补”状态，而是继续在高热度下快速扩张：

1. **热度继续上冲。** Star 从 59.9k 增长到 71.5k，Fork 从 4.9k 增长到 5.9k，项目已经从“爆发中”进入“高关注高负载”阶段。
2. **主线版本继续向前，但 release 没跟上。** 最新 tag / GitHub Release 仍停在 `v2.7.3`，而主线插件元数据已到 `2.8.2`。这意味着“装 release”和“直接拉 main”得到的能力面并不一致。
3. **跨平台分发继续扩展。** `install.sh` 新增 `kiro` 平台；README 继续覆盖 Claude Code、Codex、Cursor、Copilot、Gemini CLI、Hermes、Nanobot 等宿主，并保留 PowerShell 安装入口。
4. **增量更新从设计意图变成实际 hook 面。** `understand-anything-plugin/hooks/hooks.json` 现在已经用 `PostToolUse` 和 `SessionStart` 自动检查 commit / staleness，并强制读取 `auto-update-prompt.md` 执行结构化增量更新。
5. **语言与结构抽取能力继续外扩。** 当前 core 依赖里新增 `@understand-anything/tree-sitter-dart-wasm` 与 `@understand-anything/tree-sitter-swift-wasm` workspace 包，配合 recent diff 中的 extractor / test 文件，说明它正把“图谱覆盖广度”继续拉高。
6. **CI 也更像正式工程了。** `.github/workflows/ci.yml` 已升级为 Ubuntu + Windows matrix，并补了 Python helper 的 unittest，而不再只是单平台 JS 测试。
7. **但核心风险并没有消失。** open PRs 168 已经比 6 月明显更高；当前 open issues 直接指向增量更新和 batching 的关键缺口（如 #546、#547），说明最难的“增量正确性”仍在波动区间。

**结论：这篇报告必须整篇重写，而不是在旧结论上小补丁。** 旧报告对项目定位仍基本成立，但版本面、hook 面、平台面、CI 面和风险口径都已显著变化。

---

## 场景一：是否值得采用

### 解决的问题

AI coding 助手在陌生仓库里最浪费 token 和注意力的，不是“回答问题”，而是前置的理解成本：

- 先列目录，再猜入口，再读 README，再 grep，再打开文件；
- 今天理解完，明天换一个会话或换一个宿主，又得重来；
- 纯文本 ingest 能喂上下文，但很难稳定给出“为什么这个文件重要、代码与业务怎么对应、改动会波及哪里”。

Understand-Anything 试图把这件事变成一个**可安装、可落盘、可复用、可被 agent 再消费**的工作流：

- `/understand`：扫描项目并生成 `.understand-anything/knowledge-graph.json`
- `/understand-dashboard`：图谱可视化探索
- `/understand-chat`：基于 graph 构造 graph-aware 问答上下文
- `/understand-diff`：把 changed files 映射到节点、边、layer 与 blast radius
- `/understand-explain`：围绕文件 / 函数构造 deep dive prompt
- `/understand-onboard`：生成新成员 onboarding 导览
- `/understand-domain`：生成 domain / flow / step 视图
- `/understand-knowledge`：把 LLM wiki / docs 也映射成知识图谱
- `hooks/hooks.json` + `auto-update-prompt.md`：在 autoUpdate 打开时，对 commit 后 / stale session 做增量重分析

它的产品本质不是“再做一个 dashboard”，而是：

> **把代码库理解从一次性 prompt，升级成一个能长期维护的 project memory substrate。**

### 适合采用的场景

- **个人 / 小团队理解陌生仓库。** 尤其适合“代码多、文档薄、但需要快速拿到入口、层次和学习路径”的仓库。
- **Agent coding workflow 的前置上下文预热。** 先产 graph，再让 agent 走 `/understand-chat`、`/understand-diff`、`/understand-explain`，比让模型盲读仓库更稳。
- **Onboarding / 教学 / 知识传承。** 它的 guided tour、layer、persona-adaptive dashboard 明显是为“教人理解系统”设计的，而不只是展示酷炫图。
- **代码 + 文档统一理解。** `/understand-knowledge` 让它不只盯代码文件，也能处理 wiki / docs，这对“文档驱动开发”团队很有吸引力。
- **多宿主分发的团队试点。** 如果团队成员并不统一使用同一个 agent 宿主，这个项目的一个优势就是把相同工作流分发到多个入口。

### 不适合直接采用的场景

- **把它当 compiler-grade code intelligence 平台。** 它仍不是 GitNexus 这类以执行流、精确引用、图查询、跨仓 contract 为目标的深图谱系统。
- **把它当零维护的企业标准件。** 168 个 open PR 与长期滞后的 release 说明主线仍然处在高演化区，不适合无脑大规模标准化铺设。
- **对供应链和脚本执行极度敏感的环境。** README 仍然主打 `curl | bash` / `iwr | iex` 的体验路径；组织内落地必须改成 pin commit、审计脚本、内部镜像或白名单流程。
- **希望增量更新绝对精确的场景。** 当前 open issue 已经直接暴露 changed-files batching 和 merge contract 的 bug，这一块离“可完全信赖”还有距离。
- **极大规模、多语言、强编译器语义依赖仓库。** 它的强项是 deterministic skeleton + LLM semantic overlay，而不是完整 compiler toolchain。

### 结论

**推荐个人 / 小团队试用；企业标准化前只建议受控 PoC。**

理由很直接：

1. **产品方向是对的。** 它抓住了 agent 时代一个真实痛点：不是生成更多 prompt，而是把“理解系统”本身变成 durable artifact。
2. **工程分层比很多同类工具更像平台。** graph schema、language registry、batch contract、change classifier、hooks、dashboard、skill surface 都已经拆出来了。
3. **但成熟度还没到“放心下沉成组织底座”。** 版本漂移、release 滞后、增量正确性缺口、跨宿主一致性和 PR backlog 都会放大采用成本。

### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键依赖与工程取舍。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| `web-tree-sitter` + `tree-sitter-*` + workspace wasm packages | parsing runtime | 确定性结构抽取、imports、语言扩展 | 把“代码结构骨架”从 LLM prompt 中拿出来，降低语义漂移 | `understand-anything-plugin/packages/core/package.json` 40-57 行；新增 `@understand-anything/tree-sitter-dart-wasm` / `swift-wasm` | 适合想做“先 deterministic skeleton、后 semantic overlay”的系统 | grammar / wasm 体积和兼容性会提高分发复杂度 |
| `zod` | schema / validation | graph schema、auto-fix、边界校验 | 在 LLM graph pipeline 后面补一层类型与修复闸门 | core package 57 行；旧报告已读 `schema.ts`，当前架构仍围绕 graph contract 运转 | 适合任何“模型产结构化对象”的流水线 | 只能兜底结构一致性，不能保证语义正确 |
| `fuse.js` | search | `/understand-chat`、dashboard 搜索 | 提供低成本 graph-aware fuzzy retrieval，而不是直接上向量库 | core package 43 行；旧报告已读 `search.ts` / `understand-chat.ts` | 适合先做本地轻量 query surface 的项目 | 语义搜索能力有限，embedding 仍不是默认强项 |
| `ignore` | policy / filtering | `.understandignore` 与 auto-update changed-files 过滤 | 降低噪音目录和无关变更进入 pipeline 的概率 | core package 44 行；recent diff 新增 `ignore-generator.ts` / 对应测试；`auto-update-prompt.md` 明确要求应用 ignore 过滤 | 适合所有需要 agent 在大仓库里避开噪音的系统 | fail-safe 仍取决于宿主执行上下文和文件路径规范 |
| pnpm workspace + Node 22 + Python helper | build / multi-runtime | core、dashboard、workspace wasm 包、`merge-batch-graphs.py` | 用 TS 管主干，用少量 Python 处理批次合并，兼顾速度与工程可读性 | 根 `package.json`、`pnpm-workspace.yaml`、`.github/workflows/ci.yml` 30-62 行 | 适合“多数逻辑在 TS，少量图处理/脚本在 Python”的团队 | 增加了 Node/Python 双运行时门槛，跨平台 CI 必须一直盯紧 |

### 采用风险

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证 | ✅ 低 | MIT，对企业法务阻力小。 |
| Bus factor | ⚠️ 高 | 虽然作者群在变多，但实现和方向仍显著集中在 `Lum1104 / Yuxiang Lin` 这条脉络。 |
| 维护压力 | ⚠️ 高 | 71k Star 级热度 + 168 open PR，说明项目已经进入“需求很多、收口很难”的阶段。 |
| 版本一致性 | ⚠️ 高 | latest release / latest tag 都停在 `v2.7.3`，但 main 插件版本已到 `2.8.2`。不明确 pin 版本就会遇到“文档看的是 main，装到的是旧 release”的偏差。 |
| 供应链 / 安装 | ⚠️ 中高 | 默认体验依然是 `curl | bash` / `iwr | iex`；个人试用没问题，组织采用必须改安装策略。 |
| 增量正确性 | ⚠️ 中高 | 当前 open issues #546 / #547 直接命中 changed-files / batch merge contract，说明最值钱的 incremental path 还在打磨。 |
| 跨宿主一致性 | ⚠️ 中 | 覆盖平台很多是优点，但也意味着每个宿主的 hooks、subagent、文件权限、长上下文能力都可能带来差异。 |
| 数据精度 | ⚠️ 中 | deterministic 结构层可信度较高，但语义边、summary、tour 仍依赖模型与 host runtime。 |
| 安全边界 | ⚠️ 中 | dashboard / graph 持久化有一定治理，但真正的边界仍掌握在安装脚本、宿主能力和团队审计流程里。 |

---

## 场景二：技术架构学习

### 核心架构图

```mermaid
flowchart TD
  U[用户 / Agent 宿主<br/>Claude Code / Codex / Cursor / Copilot / Gemini / Hermes / Kiro ...] --> I[install.sh / install.ps1<br/>多平台分发 + symlink / plugin wiring]
  I --> S[skills + plugin metadata]
  S --> C1[/understand]
  S --> C2[/understand-chat]
  S --> C3[/understand-diff]
  S --> C4[/understand-explain]
  S --> C5[/understand-onboard]
  S --> C6[/understand-domain]
  S --> C7[/understand-knowledge]
  S --> C8[/understand-dashboard]

  C1 --> P0[setup + scan-project]
  P0 --> IM[extract-import-map / language detection]
  IM --> B[compute-batches]
  B --> FA[file-analyzer subagents]
  FA --> ES[tree-sitter extractors + non-code parsers]
  ES --> M[merge-batch-graphs.py + normalize + validate]
  M --> AR[assemble-reviewer]
  AR --> LA[architecture-analyzer]
  LA --> TB[tour-builder]
  TB --> KG[knowledge-graph.json]
  KG --> FP[fingerprints.json + meta.json + config.json]

  KG --> D[React dashboard]
  KG --> Q[context-builder / understand-chat]
  KG --> DF[diff-analyzer]
  KG --> E[explain-builder]
  KG --> O[onboard-builder]
  KG --> K[knowledge / domain consumers]

  FP --> H[hooks.json + auto-update-prompt.md]
  H --> INC[commit / stale-session incremental update]
  INC --> B
```

### 底层技术架构

#### 最小架构内核

如果把 Understand-Anything 缩到最小可复刻内核，它本质上是：

> **Installable workflow substrate + deterministic graph core + stable graph contract + LLM semantic overlay + graph consumption surfaces + hook-driven incremental maintenance**

具体可拆成 6 层：

1. **分发层（install substrate）**
   - `install.sh` / `install.ps1` 负责把同一套 skills / plugin root 分发到多个宿主。
   - 这一步解决的不是“分析代码”，而是“让同一工作流跨宿主可用”。

2. **入口层（skill / plugin surface）**
   - `/understand*` 系列命令不是随手写的 prompt，而是稳定的 agent-facing contract。
   - 每个入口都对应明确的 graph 消费面：生成、聊天、diff、onboard、knowledge、dashboard。

3. **确定性抽取层（deterministic extraction core）**
   - `scan-project`、`extract-import-map`、tree-sitter extractors、non-code parsers、change classifier。
   - 这是整个系统最值钱的工程判断：**让 LLM 不再承担“从零抽结构”的职责。**

4. **图谱契约层（graph contract）**
   - `types.ts`、schema、normalize / validate / auto-fix。
   - 只有 graph contract 稳定，dashboard、chat、diff、onboard 才能共享同一个中间产物。

5. **语义增强层（LLM semantic overlay）**
   - file-analyzer、architecture-analyzer、tour-builder、reviewer。
   - 模型只负责补 summary、tags、semantic edges、layers、tour，而不是从零找文件关系。

6. **维护层（incremental runtime）**
   - fingerprints、change-classifier、hooks、auto-update-prompt。
   - 这让它不只是“一次性生成图谱”，而是尝试成为**持续更新的代码理解内存**。

#### 核心抽象

#### 1. `KnowledgeGraph`

`understand-anything-plugin/packages/core/src/types.ts` 定义了系统的总契约：

- 21 种 node type：代码、非代码、domain、knowledge 四大块
- 35 种 edge type：结构、行为、数据流、依赖、语义、基础设施、domain、knowledge
- `project / nodes / edges / layers / tour` 五个顶层核心字段

这意味着它输出的不是“文件摘要列表”，而是一套可以被多个消费器共享的统一中间表示。

#### 2. `LanguageRegistry / AnalyzerPlugin`

核心系统并不把“支持多语言”硬编码在一个大脚本里，而是拆成：

- 语言识别配置
- extractor / parser
- import resolution
- call graph / reference extraction

这让“继续支持 Dart / Swift / 新格式文档”成为可扩展动作，而不是破坏式重写。

#### 3. `Batch contract`

`compute-batches` 输出的不是临时文件，而是一套调度协议：

- batchIndex 不能乱
- changed-files 模式仍要保持 batch identity
- merge 侧需要依赖命名和结构不变量

当前 open issue #546 / #547 也证明：**batch contract 是系统成败关键，不是实现细节。**

#### 4. `Fingerprint / ChangeClassifier`

`change-classifier.ts` 把变化分成：

- `SKIP`
- `PARTIAL_UPDATE`
- `ARCHITECTURE_UPDATE`
- `FULL_UPDATE`

这是一个很好的架构决定：增量更新不靠“拍脑袋猜是否要重跑”，而是有一个显式 decision matrix。

#### 5. Hook-driven auto-update

`hooks/hooks.json` + `auto-update-prompt.md` 说明项目已经把“增量维护”接到真实宿主生命周期上：

- `PostToolUse` 捕获 `git commit/merge/rebase/cherry-pick`
- `SessionStart` 检查 graph 是否 stale
- 满足条件时强制读取 prompt 并执行结构指纹检查、必要的 targeted re-analysis

这一步让它从“分析工具”更接近“代码理解 runtime”。

#### 关键执行链路

#### `/understand` 全量分析链路

1. 用户触发 `/understand`
2. setup + scan-project 枚举文件并应用 ignore 规则
3. import map / language detection / structure extraction 生成 deterministic skeleton
4. compute-batches 组织并行分析批次
5. file-analyzer 子代理补 summary / tags / semantic edges
6. merge-batch-graphs.py 合并、去重、清理 dangling edge
7. architecture-analyzer / tour-builder 产出 layers 与 guided tour
8. graph validation / auto-fix 收口
9. 落盘 `knowledge-graph.json`、`fingerprints.json`、`meta.json`
10. dashboard / chat / diff / onboard 等消费同一份 graph

#### Auto-update hook 链路

1. 用户执行 `git commit` 等命令，或新 session 打开旧 graph
2. `hooks.json` 判断 `autoUpdate` 是否开启，以及 graph / meta 是否存在
3. 宿主被提示读取 `auto-update-prompt.md`
4. 先做零 token 的 changed-files 过滤和 fingerprint check
5. 根据 `SKIP / PARTIAL_UPDATE / ARCHITECTURE_UPDATE / FULL_UPDATE` 决定是否重跑
6. 仅必要时调用 file-analyzer；否则只更新 metadata

这是当前最值得学习的一条链：**把 token 成本管理嵌进运行时协议，而不是留给用户手工判断。**

#### `/understand-diff` 消费链路

1. 读取 changed file list
2. 将 filePath 映射为 graph nodes
3. 自动包含 changed file 的 `contains` children
4. 扩展 1-hop affected nodes / impacted edges / affected layers
5. 输出 markdown 风险分析

它不是 compiler-precise blast radius，但足够服务“代码理解辅助”和“改动前快速看波及面”。

#### 控制面 / 数据面

#### 控制面

- `install.sh` / `install.ps1`：多宿主分发策略
- `SKILL.md`：agent-facing workflow contract
- `hooks/hooks.json`：宿主事件接入点
- `types.ts` / schema / validator：graph 契约与边界
- `ci.yml`：Node 22 + Python + Ubuntu/Windows 的工程闸门

#### 数据面

主要状态都落在项目目录的 `.understand-anything/` 下：

- `knowledge-graph.json`
- `domain-graph.json`
- `fingerprints.json`
- `meta.json`
- `config.json`
- `intermediate/scan-result.json`
- `intermediate/batches.json`
- `intermediate/batch-*.json`
- `intermediate/assembled-graph.json`
- `intermediate/change-analysis.json`
- `intermediate/changed-files*.json`

这个状态模型的优点是：**透明、可检查、可复用、可提交给团队共享。**
缺点也很明确：**中间文件多，命名协议强，任何一个阶段的宿主中断都可能让流水线处于半完成态。**

#### 状态模型

- **安装与宿主状态**：`install.sh` / `install.ps1` 维护 skills、plugin root、宿主目录映射与 hooks 接入点，决定同一套 workflow 是否真的跨 Claude Code / Codex / Cursor / Hermes 等宿主可用。
- **图谱持久状态**：`.understand-anything/knowledge-graph.json`、`domain-graph.json`、`meta.json`、`config.json` 是 dashboard / chat / diff / onboard 共享的事实层。
- **增量运行时状态**：`fingerprints.json`、`intermediate/batches.json`、`intermediate/change-analysis.json`、`intermediate/batch-*.json` 共同支撑 `SKIP / PARTIAL_UPDATE / ARCHITECTURE_UPDATE / FULL_UPDATE` 决策。
- **外部状态**：宿主工具权限、tree-sitter grammar/wasm 可用性、Node/Python 环境与 Git changed-files 输入，都会直接影响 workflow 是否稳定复现。

#### 契约边界

- **agent-facing 契约**：`/understand*` 系列命令、`SKILL.md`、`hooks/hooks.json`、`auto-update-prompt.md`，共同定义宿主如何触发分析、增量更新与 graph 消费。
- **内部契约**：`KnowledgeGraph` schema、node/edge/layer/tour 结构、batch identity、fingerprint/change-classifier 决策矩阵，决定各阶段能否稳定拼接。
- **外部契约**：多宿主安装目录、dashboard / consumer 对 `.understand-anything/` 工件命名与字段稳定性的依赖，以及 release/main 口径差异带来的版本边界。

#### 失败与降级模型

当前系统最成熟的一点，是它承认 agent workflow 天生不稳定，因此给关键位置做了分层降级：

- **扫描阶段**：忽略 node_modules / dist / build / lock files 等高噪音目录
- **结构抽取阶段**：能 deterministic 的尽量 deterministic；拿不到 grammar 就降级而不是让 LLM 硬猜
- **merge 阶段**：清 dangling edge、去重、normalize ID 与 edge 方向
- **validation 阶段**：schema + auto-fix 兜底结构合法性
- **incremental 阶段**：先零 token fingerprint，再决定是否值得花模型成本
- **宿主 lifecycle 阶段**：借 hooks 在 commit / session start 时自动检查 stale

仍未完全解决的失败面：

1. **incremental correctness 仍脆弱。** 当前 issue 已经直接说明 changed-files / batch-existing contract 仍会出错。
2. **release 滞后导致行为不一致。** 用户按 README 装 main 与按 release/tag 使用并不是同一个产品。
3. **跨宿主能力差异仍不可忽略。** 同一份 workflow 在不同 host 的 tool policy、subagent 支持、文件权限和上下文长度下结果会不同。
4. **图谱语义边依旧不等于事实。** 确定性结构层可以稳，semantic overlay 仍会受模型影响。

#### 可复刻设计不变量

如果要复刻同类系统，最值得带走的是这些不变量：

1. **让 LLM 做 semantic overlay，不做 truth source。**
2. **所有阶段都必须有落盘 checkpoint。**
3. **graph schema 必须先稳定，再堆 dashboard / chat / diff / onboard。**
4. **增量更新必须有显式 decision matrix，而不是“改了就重跑”。**
5. **安装分发层和分析核心层要分开。**
6. **多宿主支持不是 README 文案，而是实际的目录映射和 plugin metadata。**
7. **让用户能看见 graph、layer、tour 和 blast radius，才能建立信任。**
8. **接受“release 不一定追上 main”，并为此单独做版本治理。**

---

## 架构解剖

### 目录结构

```text
Understand-Anything/
├── README.md
├── install.sh / install.ps1
├── package.json
├── pnpm-workspace.yaml
├── .claude-plugin/ .copilot-plugin/ .cursor-plugin/
├── .github/workflows/
│   ├── ci.yml
│   └── deploy-homepage.yml
├── homepage/
├── tests/
└── understand-anything-plugin/
    ├── agents/
    ├── hooks/
    ├── skills/
    ├── src/
    └── packages/
        ├── core/
        ├── dashboard/
        ├── tree-sitter-dart-wasm/
        └── tree-sitter-swift-wasm/
```

这个结构已经明显从“单插件仓库”升级成一个小型 workspace：

- 根目录负责分发与对外文档
- `understand-anything-plugin/` 承载真正的 workflow / core / dashboard
- workspace 包承载语言扩展与 dashboard
- hooks 成为当前新增加的 runtime 面

### 技术栈

- **语言 / 运行时**：TypeScript + Node.js 22；少量 Python / Shell / PowerShell
- **Workspace**：pnpm workspace
- **结构抽取**：web-tree-sitter + 多语言 grammar / wasm 包
- **数据契约**：自定义 `KnowledgeGraph` + Zod schema
- **搜索 / 图谱消费**：Fuse.js、graph-aware prompt builders
- **Dashboard**：React + Vite + 图布局相关库（旧报告已核到 XYFlow / ELK / d3-force）
- **测试 / 质量门**：Vitest + Python unittest + GitHub Actions matrix CI

### 模块依赖关系

```text
install.sh / install.ps1
  └─ understand-anything-plugin/{skills,hooks,src}
       ├─ packages/core (KnowledgeGraph schema / change-classifier / shared contracts)
       ├─ packages/dashboard (graph visualization / guided tour consumption)
       ├─ language extractors / wasm grammars
       ├─ diff-analyzer / context-builder / onboard-builder
       └─ .understand-anything/* artifacts (knowledge-graph / fingerprints / meta / intermediate batches)
```

关键不在 package 数量，而在 **所有消费器都围绕同一份 graph contract 和 artifact 命名协议工作**；这也是 incremental contract 一旦漂移，就会同时影响 dashboard、chat、diff 与 onboard 的原因。

### 扩展机制

- **新增宿主平台**：改 `install.sh` 的 `platforms_table()` + 对应 README 文档
- **新增语言**：加 language config / extractor / 相关测试
- **新增消费场景**：围绕 `KnowledgeGraph` 再写 builder，而不用重写整个扫描 core
- **新增知识面**：通过 `/understand-knowledge` 把 wiki / docs 纳入同一 graph contract
- **新增自动化行为**：通过 `hooks.json` 接入宿主 lifecycle，而不是继续扩写主 skill prompt

---

## 质量与成熟度

### 代码质量

优点：

- 核心契约、变更分类、graph consumer 都已经被拆成明确模块
- deterministic core 与 semantic overlay 分层清楚
- 多语言扩展不是随便 grep，而是有 registry / extractor / tests 的路径
- hook prompt 不是一句“自动更新一下吧”，而是分 phase 的显式操作协议

问题：

- 项目已经进入“功能面很广，工程面很厚”的阶段，复杂性上升很快
- 多宿主、多语言、多消费器同时推进，任何一处 contract 漂移都会扩散
- `main` 明显跑在 `release` 前面，意味着真实可维护面依赖阅读源码而不是只看发布页

### 测试

当前质量门比 6 月更像正式工程，至少已经把以下验证面纳入自动化：

- Node 22 固定为主运行时
- `pnpm lint`
- core build / skill build
- core test / skill test
- Python helper unittest（`test_merge_batch_graphs`）

### CI/CD

- `.github/workflows/ci.yml` 跑 Ubuntu + Windows matrix
- workflow 当前覆盖 lint、build、test 与 Python helper 校验
- `deploy-homepage.yml` 负责首页分发，但未看到与 release/tag 对齐的自动发布治理

这说明项目至少在工程意识上已经跨过“纯 prompt 项目”的门槛，但 CI 与 release governance 还没有完全打通。

### 文档质量

文档仍然是强项：

- README 写得非常像产品说明，而不是纯开发者自嗨文档
- 多语言 README、homepage、live demo 都在强化 adoption
- Quick Start、install matrix、token usage、localized output 等用户关心的内容都有明确入口

但发布治理是明显短板：

- 仓库 workflow 里只有 `ci.yml` 和 `deploy-homepage.yml`
- 没看到明确 release automation
- latest release / latest tag 长期停在 `v2.7.3`
- 主线插件版本已到 `2.8.2`

对个人用户这只是“文档与 release 不一致”；对团队采用，这就是版本治理风险。

### Issue / PR 健康度

当前数据：

- open issues：96
- open PRs：168

这组数字的含义不是“社区繁荣”那么简单，而是：

- adoption 很强
- 外部贡献很多
- maintainers 的 review / merge / release 节奏很难完全跟上

而且当前 open issues 直接命中高价值核心：

- #546：incremental merge contract / `batch-existing.json` 命名面出错
- #547：`--changed-files` 仍会重分析整片 community，造成 token 浪费和 graph churn

这说明系统最重要的“增量正确性”和“成本可控性”，还没有完全稳定。

### 本轮未做的验证

按 TK 默认静态边界，本轮**未执行**：

- `pnpm install`
- `pnpm test`
- `pnpm build`
- `/understand` 实机跑图
- dashboard 打开验证

**未做原因：** Jarl 的 TK 默认要求是“源码 / 文档 / Git / GitHub 元信息 / 静态结构优先”，不默认跑安装、构建、测试或 smoke。当前结论基于源码、workflow、依赖面、hooks、issue/PR 和版本差异，而不是运行时验证结果。

---

## 社区与生态

### 社区评价

从仓库面可见的社区信号很强：

- 71k Star、5.9k Fork 说明它已经不是小众实验
- README / homepage / live demo 做得很产品化，天然利于传播
- 多平台支持让它更容易被不同 host 的用户二次扩散

但社区成熟度不是线性上升的：

- 高热度带来了高 PR backlog
- 高 adoption 带来了更高的兼容性和版本治理压力
- 用户越多，incremental correctness 这种“核心但难测”的问题越会被放大

### 竞品对比

#### vs GitNexus

- **GitNexus 更像深代码智能平台**：执行流、上下游影响、路由消费者、图查询更强
- **Understand-Anything 更像 agent-native 理解工作流包**：更强调落盘 graph、dashboard、onboard、chat、diff、宿主分发
- 如果你的目标是**给 agent 和新人快速建立系统理解**，Understand-Anything 更顺手；如果目标是**精确 blast radius / code graph query / platform-grade code intelligence**，GitNexus 更强

#### vs CodeGraph（轻量本地图谱类）

- CodeGraph 一类项目往往更偏“本地索引 + MCP / SQLite / FTS5 工具面”
- Understand-Anything 更强调可视化学习面、guided tour、domain / knowledge graph 和多宿主 workflow 分发
- 前者强在可控、轻量、局部确定性；后者强在产品体验和 agent-native 消费路径

#### vs gitingest / 单次仓库压缩类工具

- gitingest 这类工具擅长“快速把仓库喂给模型”
- Understand-Anything 则试图建立长期可维护的中间层资产（graph + fingerprints + metadata）
- 如果你只想快速塞上下文，gitingest 成本更低；如果你想要可复用的项目理解内存，Understand-Anything 更有想象力

### 衍生项目 / 插件生态

目前它的“生态”主要不是插件市场，而是：

- 多宿主入口
- 多语言 README
- live demo / homepage
- 继续扩展的语言 extractor 与 platform support

也就是说，它当前更像**一个快速生长的 workflow substrate**，而不是已经形成稳定二级生态的底座平台。

---

## 关键代码走读

### 1. `install.sh`

为什么重要：它定义了项目到底是不是“多宿主工作流包”。

关键点：

- `platforms_table()` 直接声明宿主 → 目标 skills 目录 → 安装风格
- 当前已支持 `kiro`
- 通过 `per-skill` / `folder` 两种风格兼容不同宿主
- `clone_or_update()` 把 repo 当作分发源，`link_plugin_root()` 提供统一 plugin root

结论：**Understand-Anything 的跨平台支持不是 PPT，而是一个具体目录映射层。**

### 2. `understand-anything-plugin/hooks/hooks.json`

为什么重要：它说明项目已经不是只靠手动命令触发。

关键点：

- `PostToolUse` 针对 Bash 中的 `git commit/merge/rebase/cherry-pick`
- `SessionStart` 针对 stale graph 检查
- 满足条件时强制读取 `auto-update-prompt.md`

结论：**它开始把“代码理解内存维护”接到宿主生命周期事件上。**

### 3. `understand-anything-plugin/hooks/auto-update-prompt.md`

为什么重要：这里定义了“零 token 指纹判断 → 仅在必要时重分析”的成本控制协议。

关键点：

- 先检查 baseline graph / meta / commit hash
- 先过滤 source files 与 `.understandignore`
- 先写 changed-files / fingerprint-check 中间产物
- 再根据 `SKIP / PARTIAL_UPDATE / ARCHITECTURE_UPDATE / FULL_UPDATE` 做决策

结论：**这是该项目从“全量分析工具”升级到“持续维护 runtime”的关键文档。**

### 4. `understand-anything-plugin/packages/core/src/types.ts`

为什么重要：所有消费器都围绕这个 graph contract 工作。

关键点：

- 21 种 node type、35 种 edge type
- graph 不只描述代码，也描述 domain 与 knowledge
- `AnalysisMeta`、`ProjectConfig` 把 runtime metadata 纳入正式类型

结论：**graph contract 是整个系统真正的“平台 API”。**

### 5. `understand-anything-plugin/packages/core/src/change-classifier.ts`

为什么重要：它给 incremental update 提供显式 decision matrix。

关键点：

- `SKIP / PARTIAL_UPDATE / ARCHITECTURE_UPDATE / FULL_UPDATE`
- 结构变化数量、比例、目录结构变化都会影响决策
- architecture / tour 是否重跑被显式建模

结论：**它把“是否值得再次烧 token”做成了可审计代码，而不是口头经验。**

### 6. `understand-anything-plugin/src/diff-analyzer.ts`

为什么重要：它体现了 graph consumer 的真实价值。

关键点：

- changed files → changed nodes
- 自动包含 `contains` children
- 扩展 1-hop affected nodes / layers / edges
- 输出 markdown 风险摘要

结论：**这个项目最值得学的不只是“怎么产 graph”，而是“怎么消费 graph”。**

---

## 评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 功能覆盖度 | 5 | 代码 / domain / knowledge / dashboard / diff / chat / onboard / hook 增量更新，覆盖已经很完整。 |
| 代码质量 | 4 | 分层清楚、契约明确，但系统复杂度和版本漂移正在上升。 |
| 文档质量 | 5 | README、homepage、live demo、多语言文档都很强。 |
| 社区活跃度 | 4 | 热度极高，但 backlog 压力同样很高。 |
| 架构设计 | 5 | deterministic skeleton + graph contract + semantic overlay + graph consumers + hook runtime，这套组合很强。 |
| 学习价值 | 5 | 对 agent-native code intelligence / project memory / workflow substrate 都很有参考价值。 |
| 可借鉴度 | 4 | 思路极值得借，但直接照搬前要先处理宿主差异、版本治理和增量正确性。 |

**总分：32 / 35**

---

## 总结

### 一句话评价

这是一个方向很对、架构很值得学、但仍处在高演化高压力区的 agent-native code understanding substrate。

### 谁应该用

- 给个人 / 小团队快速建立项目理解内存的人
- 想给 agent 一个比“盲读仓库”更稳定前置上下文的人
- 想学习怎样把 deterministic analysis、graph contract、dashboard 和 hook-driven incremental update 组合成一个产品的人

### 谁不应该直接用

- 需要企业统一标准件的人
- 期待 stable release / version 治理的人
- 需要 compiler-grade impact analysis 的团队
- 需要低维护成本大规模铺设的组织

### 下一步

当前更适合停留在**受控 PoC**：先验证增量正确性、release/version 治理和跨宿主一致性，再考虑更大范围采用。
