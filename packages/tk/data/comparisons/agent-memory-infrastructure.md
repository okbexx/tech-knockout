# Agent Memory Infrastructure 横评

> 更新日期：2026-07-31  
> 涉及项目：Memmy Agent、MemOS、mem0、Letta、OpenMemory  
> 分类口径：这里比较的是给 Agent 提供长期状态与记忆的不同产品层。Memmy 是 personal memory hub + 完整 Agent runtime；MemOS 是 Memory OS / 服务 / plugin 产品线；mem0 是通用 SDK/API/cloud memory layer；Letta 是 stateful agent platform；OpenMemory 是 local cognitive memory engine。它们不是同层替代品，选型前必须先决定要的是“记忆组件、记忆服务、stateful Agent server”还是“个人桌面 Agent + 共享记忆控制面”。  
> 证据边界：本轮对 Memmy Agent 做了完整 TK 静态源码审计；其他项目按 2026-07-31 GitHub README/公开文档做定位校准，不能替代对其当前源码的独立深审。

---

## 场景一：采用选型横评

### 对比矩阵

| 维度 | Memmy Agent | MemOS | mem0 | Letta | OpenMemory |
|---|---|---|---|---|---|
| 产品层级 | 个人桌面 Agent + 跨 Agent memory hub | Memory OS：cloud/self-host/plugin | SDK/API/cloud memory layer | Stateful agent server/platform | Local cognitive memory SDK/server/MCP |
| 核心对象 | Session/Episode/Turn + L1/L2/L3/Skill | Memory cube、多模态 memory、scheduler、plugin | User/Session/Agent memory、entity/temporal retrieval | Agent state、memory blocks、messages、tools | Episodic/semantic/procedural/emotional/reflective sectors + temporal graph |
| 主要入口 | Electron、CLI/TUI、OpenAI API、Memory API、channels、Agent Skills | Cloud API、self-host service、Hermes/OpenClaw plugins | Python/JS SDK、self-host server、cloud、CLI | Server API、SDK、agent development platform | Python/JS SDK、server、MCP、VS Code |
| 本地优先 | ✅ SQLite 主路径；但默认 cloud URL 与 analytics 路径需审计 | ✅ Local plugin；self-host 主服务更重 | ⚠️ OSS 可自托管，先进能力部分在 managed platform | ⚠️ 可自托管，核心定位偏 server/platform | ✅ SQLite/Postgres、本地 SDK |
| 跨现有 Agent 历史接管 | **强**：Cursor/Claude Code/Codex/OpenClaw/Hermes 等 source adapters | plugin 侧有宿主集成，非主要 desktop onboarding 产品 | 以 API/SDK 接入为主 | 以自身 stateful agent 为主 | connectors/MCP 为主 |
| 自演化深度 | **强**：L1→L2→L3→Skill、reward/repair/trial | **强**：同一 MemOS 方法论与 plugin 生态 | 中强：事实、entity、temporal、多信号 retrieval，产品重点是高质量记忆层 | 强：Agent 长期 state 与 memory 自管理 | 方向强：sector/decay/reinforcement/temporal；当前 rewrite 中 |
| Agent runtime | **完整内建** | 非核心；通过 plugin 接宿主 | 非核心 | **核心** | 非核心 |
| 桌面个人控制面 | **完整内建** | dashboard / plugin viewer，不是同类个人桌面 Agent | dashboard 主要在服务/平台侧 | 有平台 UI，但不是跨外部 Agent 本地 memory hub | dashboard 可选 |
| 集成成本 | 高：Node 22 + Electron + native deps + Memory/Agent/backend | plugin 低；self-host service 高（Neo4j/Qdrant 等） | SDK 低；self-host/server 中 | 中高：要围绕 Letta Agent/state model 建模 | SDK 低；server/MCP 中 |
| 安全默认值 | ⚠️ Memory API 边界较好；OpenAI API 无认证；Agent exec 默认无 sandbox/approval；browser 缺 private-network guard；secret store 默认 key 固定 | 路径多，需区分 cloud/self-host/local plugin | self-host auth 默认开启；云边界清楚 | server/sandbox/tenant 治理更成熟但系统更重 | local-first；rewrite 期需重新审计 |
| 供应链/发布 | ⚠️ GitHub installer 来自 OSS 预构建转发，非源码可复现构建 | 多产品面，按具体 package 评估 | 成熟 package/cloud 路线 | 成熟平台与大量 release/history | rewrite 期 |
| 许可证 | MIT | Apache-2.0 | Apache-2.0 | Apache-2.0 | 以仓库 LICENSE 为准；当前公开页有 license badge |
| 社区成熟度 | 新：公开约两周，launch 增长快 | 高：MemTensor 主品牌，研究/benchmark/plugin 完整 | 高：SDK、cloud、论文与大社区 | 高：多年 stateful agent 演进 | 中低：公开宣告 rewrite |
| 生产采用建议 | 固定版本隔离试用；整仓生产暂缓 | plugin/self-host 分路径 PoC | 通用 memory API/SDK 首选候选 | Stateful Agent server 首选候选 | 轻量本地实验；rewrite 稳定前观望 |
| 架构学习价值 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

### 分项详评

#### Memmy Agent

- **适合采用的点**：唯一把“跨 Agent history onboarding、共享本地记忆、自演化层级、完整 Agent runtime、桌面/CLI/API/渠道”压进同一端侧产品的样本。
- **主要风险**：公开历史极短；OpenAI-compatible API 的业务路由未鉴权；默认 shell/filesystem 权限宽；browser navigation 未复用 SSRF guard；recall 总预算未生效；telemetry privacy state 没有统一执行 gate；本地 secret store 默认 key material 固定；installer 不由公开源码 workflow 构建且客户端 updater 未验证 release digest；native packaging issue 尚多。
- **最佳路径**：先把它当 **Memory product + architecture reference**，用独立 OS 用户/VM、BYOK、关闭 exec/browser/MCP/channel 试 Memory；不要先接受整套默认 runtime 权限。

#### MemOS

- **适合采用的点**：同一组织更通用的 Memory OS；cloud API、self-host、OpenClaw/Hermes local plugin、multi-cube、多模态、scheduler、feedback 与 benchmark 覆盖最完整。
- **主要风险**：产品线跨度大，cloud、self-host service、local plugin 的能力/依赖/隐私边界不同；“MemOS 的 benchmark”不能自动外推到 Memmy 当前端侧实现。
- **最佳路径**：已有 Hermes/OpenClaw 时优先评估 local plugin；做应用级 memory service 时评估 MemOS self-host/cloud；只有确实需要桌面个人 Agent 才转向 Memmy。

#### mem0

- **适合采用的点**：SDK 和 API 形态最轻，Python/JS、self-host 与 managed platform 边界清楚；2026 memory algorithm 强调 ADD-only extraction、entity linking、BM25/semantic/entity fusion 和 temporal reasoning。
- **主要风险**：公开 benchmark 明确包含 proprietary managed optimizations，OSS 用户不能期待同分；它不会替你解决完整 Agent runtime、桌面控制面和跨 Agent 本地历史治理。
- **最佳路径**：如果需求是“给现有应用加 memory API”，先从 mem0 SDK/self-host PoC，而不是引入整个 Memmy。

#### Letta

- **适合采用的点**：把长期 memory/state 作为 Agent server 的一等对象，API、数据库、sandbox、tool execution、multi-tenant 与长历史最成熟；公开历史远长于其他选项。
- **主要风险**：它要求应用围绕 Letta stateful Agent 模型组织，不是一个可以无感附着到任意本地 Agent 的小组件；平台复杂度和运维成本更高。
- **最佳路径**：如果你要构建自己的 stateful Agent 服务与 API，而不是个人跨 Agent memory hub，优先看 Letta。

#### OpenMemory

- **适合采用的点**：SDK/server/MCP 三种入口清晰，强调 episodic/semantic/procedural/emotional/reflective sector、temporal graph、decay/reinforcement 和 explainable recall；适合轻量嵌入现有应用。
- **主要风险**：README 明示项目正在 rewrite，会有 breaking changes 和 bug；架构叙事需要和 rewrite branch 实现逐项核验。
- **最佳路径**：研究 cognitive memory taxonomy 或本地 SDK 可看；稳定生产采用应等待 rewrite contract 稳定。

### 场景一结论

- **给已有应用加通用 memory API/SDK** → 先看 **mem0**；需要 MemTensor 体系和多产品路径再看 **MemOS**。
- **给 Hermes/OpenClaw 加本地自演化记忆** → 先看 **MemOS local plugin**，比整装 Memmy footprint 小。
- **做 stateful Agent server/platform** → 先看 **Letta**。
- **做个人桌面 AI、并统一 Claude Code/Codex/OpenClaw/Hermes 历史** → **Memmy** 差异最明显，但必须固定版本、隔离权限。
- **做轻量本地 cognitive memory SDK/MCP 实验** → 看 **OpenMemory**，但 rewrite 期不宜押生产主干。
- **企业采用** → 不能按 star 或 benchmark 选；先确定数据边界、租户、删除/审计、模型出站、可复现构建和灾备，再比较 memory quality。

---

## 场景二：架构学习横评

### 对比矩阵

| 维度 | Memmy Agent | MemOS | mem0 | Letta | OpenMemory |
|---|---:|---:|---:|---:|---:|
| 设计模式深度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Durable state 完整度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 端侧产品化 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| 通用服务化 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 跨 Agent 接管 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 可借鉴度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 综合学习价值 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

### 架构模式对比

| 问题 | Memmy Agent | MemOS | mem0 | Letta | OpenMemory |
|---|---|---|---|---|---|
| 记忆窄腰 | `MemoryRecord + Session/Episode/Turn + RecallEvent + EvolutionJob` | Unified Memory API / memory cube / scheduler | add/search/update/delete + user/session/agent scope | Agent state + memory blocks + messages/steps | Memory sectors + waypoint/temporal graph |
| 原始证据 | raw turn、tool calls/results、episode | message/tool/multimodal memory | extracted facts + source messages | full agent messages/state | event/sector records |
| 提升机制 | L1 trace → L2 policy → L3 world model → Skill | tiered/plugin evolution + feedback | extraction/entity/temporal enrichment | Agent 自管理 context/memory | decay/reinforcement/reflection |
| 结果回流 | reward、decision repair、skill trial、recall outcome | feedback/correction、scheduler | memory feedback/correction | state update/tool results | reinforcement/association |
| 异步模型 | leased durable jobs + dead-letter | MemScheduler | server/cloud jobs | server task/step runtime | server/background processing |
| 宿主集成 | hook + source adapter + generated Skill | cloud/local plugin | SDK/API wrapper | 原生 Agent platform | SDK/MCP/integration |
| 失败隔离 | Memory hook fail-open，manual tool 报真实错误 | 按具体路径 | SDK/server errors | server/step/sandbox contract | 按 SDK/server path |
| 可观察性 | recall event、change log、audit log、panel jobs | dashboard/eval/feedback | platform observability | server traces/steps | explainable recall traces |

### 设计决策对比

#### “记忆层”还是“Agent 本体”

- **mem0 / OpenMemory** 把模型保持无状态，memory 是外部组件；替换宿主最容易。
- **Letta** 把 memory 纳入 Agent identity/state；一致性最好，但迁移成本最高。
- **MemOS** 同时提供 memory service 和宿主 plugin，覆盖两边。
- **Memmy** 把 Memory 保持成独立 HTTP 服务，又自带 Agent runtime 和 desktop；这是产品覆盖最强、运维与安全面也最宽的折中。

#### “事实检索”还是“经验/技能演化”

- **mem0** 当前重点是高质量 fact/entity/temporal retrieval，适合 personalization 与应用 memory。
- **Letta** 重点是 Agent 自身持续状态和 memory block 管理。
- **MemOS/Memmy** 明确区分 trace、policy、world model、skill，适合任务经验复用。
- **OpenMemory** 用 cognitive sectors、decay、reinforcement 和 graph 表达长期认知结构。

#### “共享”如何隔离

Memmy 的 `user + source + profile + host_session` scope 适合单用户、多 Agent、多工作区；但企业多租户还需要授权、配额、删除证明、加密、组织 policy 和 tenant-bound encryption。MemOS/Letta/mem0 的服务形态更接近企业多租户起点；Memmy 当前更像个人控制面。

### 最值得学习的 TOP 8

1. **Memmy 的 durable Memory state machine**
   - Session、Episode、RawTurn、Memory、RecallEvent、EvolutionJob、SkillTrial 全部落库，状态和证据可恢复。

2. **Memmy 的 evidence-backed promotion**
   - L2 candidate pool、trace-policy links、gain/support gates，避免一次 LLM 输出直接升级为长期规则。

3. **Memmy 的负面经验隔离**
   - failure-avoidance memory 不自动提升为成功 skill/world model，避免“把失败学成能力”。

4. **Memmy 的 Agent source onboarding**
   - parser、redactor、cursor、checkpoint、revised-content detection、Skill writer 分层，适合任何跨工具历史迁移产品。

5. **MemOS 的多产品 Memory OS 分层**
   - 同一 Memory API 向 cloud/self-host/local plugin 分发，说明研究内核与产品入口可以解耦。

6. **mem0 的单次、多信号检索路线**
   - ADD-only、entity、BM25、semantic、temporal 并行，适合控制 latency/token 的应用层 memory。

7. **Letta 的 stateful Agent server**
   - Agent memory、messages、tools、steps 与 API/server tenancy 统一，是构建长期在线 Agent 服务的成熟参照。

8. **OpenMemory 的 cognitive sector + explainability**
   - 让 recall 不只返回相似文本，还能解释 sector、时间、关联与强化路径。

### 可复刻的共同不变量

1. 原始 evidence 与派生 memory 分开保存；
2. memory 必须有 user/project/session/agent scope；
3. retrieval 不只看向量，至少融合 lexical、semantic、temporal/entity 信号；
4. 注入预算、删除、纠错和反馈必须是硬合同；
5. 异步处理必须 idempotent、可重试、可观测；
6. recall 结果必须能回流 outcome，而不是只记“搜索过”；
7. prompt 中的 memory 永远是不可信数据，权限控制不能交给提示词；
8. benchmark 必须标明 managed 与 OSS 能力差异；
9. “local-first”必须逐条列出模型、analytics、更新、账号与 connector 的出站路径。

### 场景二结论

- **学自演化任务记忆状态机** → 优先读 **Memmy / MemOS local plugin**。
- **学通用 memory SDK 与低摩擦产品接口** → 看 **mem0**。
- **学长期在线 stateful Agent server** → 看 **Letta**。
- **学 cognitive taxonomy、temporal graph 与可解释 recall** → 看 **OpenMemory**。
- **学跨现有 Agent 历史接管和端侧产品化** → **Memmy** 是当前最有辨识度的样本。

---

## 最终推荐

### 如果要采用

- **最小 footprint**：已有应用先试 mem0/OpenMemory SDK；已有 Hermes/OpenClaw 先试 MemOS local plugin。
- **完整 stateful Agent server**：优先 Letta。
- **个人跨 Agent memory hub**：Memmy 固定版本隔离试用，但先收紧 exec、cloud、telemetry 和 source 权限。
- **企业 memory platform**：先做 MemOS/mem0/Letta 的服务化 PoC，Memmy 不应直接承担多租户生产底座。

### 如果要学架构

- **Memory 内核**：Memmy 的 schema、retrieval、worker、reward/policy/world-model/skill pipeline；
- **产品层**：Memmy 的 source adapter + Skill writer + desktop/backend/runtime 边界；
- **服务层**：MemOS、mem0、Letta 的 API/tenant/SDK 形态；
- **认知模型**：OpenMemory 的 sectors/temporal/reinforcement。

### 综合结论

没有“记忆系统总冠军”：

- **通用 SDK/API**：mem0；
- **Memory OS / 多部署路径**：MemOS；
- **Stateful Agent platform**：Letta；
- **个人跨 Agent 共享记忆产品**：Memmy；
- **轻量 cognitive memory 实验**：OpenMemory。

Memmy 的真正价值不是替代全部竞品，而是证明一件事：**记忆基础设施只有被接入历史迁移、Agent loop、桌面控制面、反馈和恢复路径后，才会从“检索组件”变成用户能感知的长期关系产品。**
