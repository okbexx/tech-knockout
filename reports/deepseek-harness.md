# DeepSeek Harness

> 一句话定位：**DeepSeek Harness 是 DeepSeek 把 Coding Agent 拆成可逆组合插件树的 TypeScript runtime：以 Cordis fiber/plugin tree 管生命周期，以 append-only `SessionEvent` log 统一模型消息、工具调用与恢复，再通过 capability seams 把 LLM、工具、sandbox、approval、persistence、subagent、MCP、Web/Headless surface 组合成 profile。**

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `deepseek-ai/deepseek-harness` |
| URL | `https://github.com/deepseek-ai/deepseek-harness` |
| 冻结提交 | `47f943859bef60e4160492346772ded9b24f765a` |
| Star | 40,232（2026-08-14T07:50+08:00 GitHub API 快照） |
| Fork | 3,155 |
| 许可证 | MIT；附 `THIRD_PARTY_NOTICES.md` |
| 主要语言 | TypeScript；另含 Python SDK、CSS、少量 C/C++ native runner |
| 默认分支 | `master` |
| GitHub 仓库创建 | 2026-08-13T11:56:32Z |
| Git 根提交 | `b67e81ac`，2026-06-10 |
| 冻结 HEAD 时间 | 2026-08-13T19:38:46+08:00 |
| 最新 Release | 无 GitHub tag/release；npm/PyPI 为 `0.1.0-rc.6` |
| Git 历史 | 12,293 commits；46 个 name/email identity；GitHub Contributors API 31 个账号 |
| Issues / PRs | Issues 功能关闭，0 issue / 0 PR；反馈集中到 Discussions |
| Discussions | 开放后约 12 小时已到 #537；API 分页显示至少 535 条记录编号 |
| 源码规模 | 7,412 tracked files；2,578 个 TS/TSX 文件、约 564,122 行；2,355 个 Markdown 文件 |
| 测试资产 | 1,772 个测试目录/`*.test.*`/`*.spec.*`/fixture 资产，其中 927 个 TS 文件（静态分类） |
| 分析日期 | 2026-08-14 |

> 验证边界：本报告对冻结源码、Git 历史、GitHub API、npm/PyPI 元数据和公开 Actions 做**只读静态核验**；**未安装依赖、未启动 DeepSeek Harness、未运行目标测试、构建或 benchmark**。仓库官方也把当前版本标为 Developer Preview，并明确未来会有 breaking changes。

---

## 场景一：是否值得采用

### 解决的问题

DeepSeek Harness 不是“给 DeepSeek API 加一个 bash tool”的薄 CLI，而是在解决 Coding Agent 从产品变成可组合 runtime 时的五个系统问题：

1. **能力如何组合而不长成 god object。** LLM、session、tool、sandbox、approval、persistence、compaction、subagent、MCP、Web UI 都由独立 Cordis plugin 提供，profile 只描述组合关系。
2. **插件热替换时如何回收副作用。** Cordis fiber 把 service、event listener、timer、watcher、child process 注册到作用域，卸载时逆序 dispose；配置替换失败可保留或恢复上一代。
3. **对话历史如何同时服务 replay、恢复、UI 和模型。** `SessionEvent` append-only log 是事实源；`deriveMessages()` 只投影当前模型表面，compaction、UI metadata、telemetry、persistence 不必各维护一份“影子历史”。
4. **Agent loop 如何处理并发工具、steering、取消和持久化。** `ReactLoopAgent` 显式维护 idle/maintenance/running phase、turn/step 边界、inbox target、AbortSignal 与 model-order result commit。
5. **安全策略如何成为可替换能力而非散落判断。** sandbox、approval、permission preset、subprocess、credential store 都是 seam；默认 profile 组合成 `workspace-write + ask`，高风险模式需要显式切到 `danger-full-access`。

典型使用场景：

- 研究或构建自己的 Coding Agent runtime / harness；
- 需要 Web、headless、Python SDK 多入口共享同一 session/tool 内核；
- 需要通过 profile/patch/plugin 替换持久化、shell、sandbox、LLM、subagent provider；
- 需要 durable session、crash repair、compaction、后台任务和 continuable subagent；
- DeepSeek 内部或生态团队围绕 DeepSeek 模型打造定制 agent composition。

### 核心能力与边界

#### 能做什么

- `dsh web` 启动 Web Coding Agent；`--profile headless` 提供一次性任务模式；Python SDK 驱动同一 runtime binary。
- 默认 DeepSeek route，同时可通过 `dsh-llm-pi-ai` 配置其他 provider profile。
- bash/PowerShell、文件读写与搜索、后台 jobs、todo、goal、plan mode、web search、skills、LSP、MCP。
- `spawn` / `fork` 两类 in-process subagent，支持 one-shot 与 continuable background child；另有 Codex、Claude Code、ACP、SDK provider package。
- JSONL/Zstd 或 SQLite session persistence；append-only event、crash-interrupted turn repair、format refusal、raw artifact/export。
- 自动/手动 compaction、tool-result pruning、token meter、请求 overflow recovery。
- Web host/client plugin system、typed RPC、浏览器 Host/Origin/DNS-rebinding fence、loopback-first 部署。
- 本地与 E2B capability provider；code runtime worker thread 使用空环境。

#### 不能做什么 / 不应误解为什么

- **不是模型训练或评测框架。** 仓库名中的 Harness 指 agent runtime composition，不是 lm-eval、SWE-bench runner 或 RL rollout engine；`BENCHMARK.md` 当前只有占位说明。
- **不是仅支持 DeepSeek 模型。** 默认 route 是 DeepSeek，但 `llm-pi-ai`、MCP、ACP、外部 subagent provider 都说明它更接近通用 runtime；反过来，也不要把 provider breadth 夸大成已经等同 Pi/OpenCode 的开箱 catalog。
- **sandbox 不是容器或 microVM。** 默认本地 runner 主要约束文件写入；项目文档明确网络和进程可见性不在该边界内。Windows restricted token/ACL 和旧 Landlock ABI 还可能只有 partial enforcement。
- **approval 不是强隔离。** 默认 `ask` 是策略 gate；用户批准后，命令仍以宿主用户权限运行。`danger-full-access` 会同时切到 sandbox unrestricted 与 approval `never`。
- **缺少 workspace trust gate。** 默认会从当前仓库加载 `AGENTS.md`、`CLAUDE.md` 及 local variants，并扫描 `.dsh/skills`、`.agents/skills`；项目 skill 默认可被模型调用且会跟随 symlink。恶意仓库内容不能无条件直接 RCE，但可诱导模型结合宿主可读文件与可联网 shell 形成数据外发链。
- **插件/profile 配置是受信代码。** profile `cordis.patch.yml` 支持 `!!js` 表达式，插件由 Node 动态加载，`dsh plugin` 直接把参数转给 pnpm；这些入口不适合加载未知来源包或配置。
- **没有证明公开生产稳定。** 官方标记 Developer Preview；0.1 RC；无 tag/release；公开主 CI 对冻结 HEAD 没创建 job；公开生态仅经历约一天。
- **不提供 hostile multi-tenant isolation。** 本地 Web 默认 loopback、请求有 trust fence，但把它部署到共享网络或多租户环境仍需独立认证、容器边界、secret broker 和网络策略。

#### 与现有 Coding Agent 的层级关系

- 与 **OpenCode / Pi / Prime Agent / jcode / Grok Build** 同属 Coding Agent runtime/harness 层，不是一层插件。
- 与 **Claude Code / Codex CLI** 是可替代入口，也是可被 subagent provider 调用的外部 runtime。
- 与 **Cline / Continue** 的区别是后者以 IDE surface 为主，DSH 把 composition、session、tool 和 capability seam 放在宿主无关内核。
- 与 **OpenHands** 的区别是后者更接近自治软件工程平台/执行环境；DSH 当前优先做可组合 runtime，本地 sandbox 不是完整 remote computer。
- 与 **E2B** 是组合关系：E2B 是可替换执行后端之一，不是整个 Harness 的竞品。

### 集成成本

- **终端试用**：Node.js + `npx @deepseek-ai/dsh web`；需要 DeepSeek API key 才能走默认模型路径。
- **源码开发**：pnpm monorepo，248 个 `package.json`、248-package 级 composition、TypeScript 6、Vite/Vitest、native sandbox helper、Python SDK，完整构建面很大。
- **状态与配置**：`$DSH_HOME`（默认 `~/.dsh`）下保存 profiles、settings、credentials、sessions、home patch；当前工作目录作为 workspace root。
- **理解成本**：高。需要同时掌握 Cordis context/fiber/plugin loader、patch layering、declaration merging、session event/projection、capability seam、agent phase machine 和 client RPC/plugin tree。
- **PoC 建议**：只打开可信 workspace；固定 `0.1.0-rc.6` 或 SHA；保留 `workspace-write + ask`、loopback、telemetry disabled；只装审计过的 profile/plugin。对未审计仓库，先禁用 project instructions/skills，再使用 disposable container/VM、出站限制和无生产秘密环境。

### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地 manifest 写入 catalog；本表解释影响 build-vs-buy 的关键依赖与协议。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| `@deepseek-ai/cordis` + loader/include/HMR | framework | plugin context、service injection、fiber lifecycle、配置 patch/HMR | 把 capability composition、依赖等待与逆序回收下沉到框架 | 根 `package.json`；`packages/boot/app-boot`；`docs/architecture.md` | **高**：大型可插拔 agent runtime 值得研究 | 自定义框架心智重；`!!js`/动态插件属于受信代码面 |
| `@deepseek-ai/schemastery` | schema | plugin config、settings、tool/RPC shape | 让配置、UI settings 与运行时校验共享 schema | `packages/core/agent-loop/src/index.ts`；多 package manifest | **高**：配置驱动插件系统适用 | 内部生态绑定较强，外部通用性待观察 |
| append-only `SessionEvent` contract | event protocol | turn/step/message/tool/compaction/persistence/replay | 用一个事实源派生模型表面和 UI read model | `packages/core/session`；`docs/subsystems/session.md` | **极高**：任何 durable agent runtime 都应研究 | event vocabulary 与格式升级需要长期 migration 治理 |
| `node:sqlite` + JSONL/Zstd backends | storage | session persistence、projection、query | 本地 durable log、增量 suffix read、crash repair | `packages/session/session-persistence-*`；`docs/subsystems/persistence.md` | **高**：local-first agent session 适用 | JSONL sequential read 与 SQLite shared-file 各有不同运维边界 |
| `@modelcontextprotocol/sdk` | protocol SDK | stdio / Streamable HTTP MCP client | 接入外部 tools/services | `packages/mcp/mcp-client/package.json:42-45`、`transport.ts` | **高**：需要 MCP 时直接复用标准 SDK | MCP server 等同外部代码/网络/凭据边界；默认 base profile 未挂载任意 server |
| `node-pty` | runtime | 本地 PTY、terminal process tree | 终端交互、foreground group、signal 与 whole-tree cleanup | `packages/subprocess/subprocess-local/package.json:44-46` | **中高**：需要真实 terminal semantics 时适用 | native binding、跨平台 process-tree 行为复杂 |
| bwrap / Landlock / Seatbelt / Windows restricted token | OS isolation | 本地文件 effect confinement | 在不改 tool schema 的情况下限制 write surface | `packages/sandbox/*`；`.github/workflows/sandbox.yml` | **高**：本地 coding agent 默认防线值得复刻 | 不是网络/进程隔离；平台能力不一致；必须 fail closed |
| `commander` | CLI parser | launcher 与 profile app 参数分层 | 外层只解析 profile/patch，把剩余参数交给插件 app | `apps/cli/src/args.ts` | **中**：多 app launcher 可借鉴 | pass-through grammar 和 help ownership 需要严格测试 |
| React + Vite + typed client plugins | UI | Web shell、conversation、settings、tool views | 让 Host 与 browser plugin 共享 contract、按 slot 组合 UI | `apps/web`、`packages/client/*` | **高**：插件化 Web agent surface 可研究 | 包数量与 client/host 双面契约使变更成本高 |
| OpenTelemetry | telemetry | opt-in session-log export | 统一会话反馈/遥测传输 | `packages/bundle/base/cordis.patch.yml:129-161` | **中**：需要标准 collector 时复用 | FULL 模式上传 raw captured session copy；默认无强制脱敏且 endpoint 允许 HTTP，必须显式同意、强制 TLS 和治理 |
| pnpm workspace + lockfile | build/package | 248 manifests 的 monorepo 与发布序列 | workspace linkage、可复现依赖图、统一 RC 发布 | `pnpm-workspace.yaml`、`pnpm-lock.yaml`、release workflows | **中高**：超大 TS monorepo 适用 | 发布面巨大；RC 包 dist-tag 仍不完全一致 |
| Pydantic + pinned runtime wheel | SDK | Python host API / runtime distribution | 让 Python 调用方复用 DSH runtime contract | `python/sdk/pyproject.toml`、`python/sdk/uv.lock` | **中高**：需要 Python wrapper 时适用 | SDK 仍是 0.1 RC；runtime wheel 与 Node monorepo 双发行需同步 |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | ✅ | MIT，并提供第三方 notices；二次分发仍需保留 notices 与各依赖许可证 |
| Bus factor | 🟠 中偏高 | 46 个 Git identity、31 个 GitHub contributor；第一 identity 占 42.6%，前三约占 63.0% commits |
| 供应商锁定 | 🟡 中 | runtime seam 通用、可挂多 provider；默认模型、search、telemetry endpoint 与 npm scope 深度 DeepSeek 化 |
| 公开发行成熟度 | 🔴 低 | Developer Preview、0.1 RC、无 GitHub tag/release、公开时间约一天 |
| 内部工程成熟度 | 🟢 高 | 12,293 commits、56 万行 TS、927 个 TS test asset、完整架构/子系统/decision 文档；不能与公开稳定性混为一谈 |
| Workspace trust | 🔴 高（P1） | 无首次打开确认；默认加载项目 `AGENTS.md` / `CLAUDE.md` 和 model-invocable project skills，skills 还会跟随 symlink；宿主读取与网络未被 sandbox 切断 |
| 默认工具权限 | 🟠 中偏高 | 默认 `workspace-write + ask` 好于 unrestricted，但普通 standing-policy 命令不必逐次审批；批准后仍以宿主用户执行 |
| OS 隔离 | 🟠 中 | POSIX 有 bwrap/Landlock/Seatbelt，Windows 有 restricted token/ACL；仅文件 effect，非 container/microVM，部分平台 partial |
| 网络 / 进程隔离 | 🔴 高 | sandbox 不限制网络或进程可见性；需要外层容器、出站 ACL、最小 OS 用户补齐 |
| 插件 / 配置供应链 | 🔴 高 | `dsh plugin` 调 pnpm；profile/home patch 支持 `!!js`；未知插件与配置可在宿主进程执行任意代码 |
| MCP 权限边界 | 🟠 中偏高（P2） | stdio server 可执行配置中的 command/args/env/cwd，MCP tool 直接注册；该链不统一经过 shell sandbox 或 per-tool approval。base bundle 默认未挂任意 server |
| 发布供应链 | 🟠 中偏高（P2） | release/Python release 中多项第三方 Actions 使用可漂移 tag，而不是 40 位 commit SHA；虽有 frozen lock、environment gate、OIDC/checksum 等缓解，仍应固定 |
| 凭据泄露 | 🟡 中 | subprocess/MCP/PTY 共享敏感 env scrub，code worker 环境为空；启发式变量名不等于 secret broker，显式 env 仍可放行 |
| Telemetry | 🟠 中偏高（P2） | 默认 `DISABLED`；FULL 会镜像未经内建强制脱敏的 session event data，endpoint 允许 HTTP/HTTPS，启用时需单独确认、强制 TLS 和脱敏 |
| 后台任务 teardown | 🟡 中（P2） | 内建 subprocess 有 TERM→grace→KILL；但第三方 job producer 若 cancel 返回后永不 settle，owner/service dispose 可无限等待，缺 hard deadline/orphan reporting |
| Web 暴露 | 🟡 中 | 默认 127.0.0.1，Host/Origin/trustedHosts fence 防 DNS rebinding；非 loopback 部署仍缺完整多租户认证论证 |
| 主 CI 门禁 | 🔴 高 | 冻结 HEAD 的 CI workflow run `31701568000` conclusion=failure 且 API 返回 0 jobs，无法作为有效测试门禁 |
| Real API E2E | 🟡 未验证 | run `31701562200` 失败在 preflight 缺 `DEEPSEEK_API_KEY`，没有进入模型 E2E；不能算产品回归，也不能算通过 |
| Sandbox CI | 🟢 强信号 | 同 SHA 的 bwrap、x64/ARM Landlock、macOS Seatbelt 四个公开 E2E job 全部成功 |
| Security policy | 🔴 缺失 | 根仓库没有 `SECURITY.md`；Developer Preview 仍应提供漏洞披露渠道和受支持版本范围 |
| 社区治理 | 🟠 待观察 | Issues/PR 功能关闭，贡献规则要求先在 Discussion 获维护者同意；爆发热度尚不能证明协作闭环 |

### 结论

**🟡 架构学习强烈推荐；个人固定 RC 隔离试用；团队生产底座暂观望。**

分场景建议：

- **源码研究 / 内部架构设计**：强烈推荐。Cordis reversible composition、SessionEvent/projection、capability seam、tool scheduler、persistence repair 和默认 permission composition 的信息密度极高。
- **个人 Web Coding Agent**：只在可信 workspace 可试。固定 `0.1.0-rc.6`/SHA，保持 loopback 和 `workspace-write + ask`，只加载可信 profile/plugin，关闭 telemetry；不可信仓库先禁用 project instructions/skills，并放入一次性容器/VM与出站受限环境。
- **团队 PoC**：建立 workspace trust/allowlist；不可信仓默认禁用 project instructions/skills；放入一次性容器/VM、单独低权限用户并限制出站；不把生产 secrets 放进 ambient env；审计 `$DSH_HOME` patch、profile package 与 MCP server；保留 approval。
- **长期生产平台**：等待至少一个稳定版本、GitHub release/tag、有效主 CI、real API E2E、SECURITY policy、公开 migration/compatibility 承诺和真实社区修复周期。

---

## 场景二：技术架构学习

### 核心架构图

```text
CLI / Web / Headless / Python SDK
              │
              ▼
        profile composer
bundles → profile patch → home patch → --patch
              │
              ▼
 Cordis Context / Loader / Fiber Tree
  ├─ lifecycle + service injection + HMR
  ├─ LLM / tools / prompt / settings / credentials
  ├─ sandbox / approval / subprocess / jobs
  ├─ persistence / compaction / projection
  └─ client host / RPC / Web plugin slots
              │
              ▼
       ReactLoopAgent state machine
 Inbox → turn/start → step/start → LLM stream
                          │
                          ▼
               bounded tool scheduler
          policy/approval → side effect → result
                          │
                          ▼
           append-only SessionEvent log
              │                    │
              ▼                    ▼
      deriveMessages()       persistence/projection
       model surface       JSONL/Zstd / SQLite / UI
```

### 底层技术架构

#### 最小架构内核

去掉 Web UI、DeepSeek adapter、具体 tools 和所有产品文案，DSH 仍必须保留：

```text
Reversible Plugin/Fiber Tree
  + Capability Registry / Service Injection
  + Append-only SessionEvent Log + Surface Projection
  + Agent Turn/Step State Machine
  + Policy-aware Tool Scheduler
  + Persistence Checkpoint / Recovery Contract
```

真正不可替代的不是某个 tool，而是“**组合树决定能力，事件日志决定事实，projection 决定模型所见，fiber 决定生命周期**”这组不变量。

#### 核心抽象

| 抽象 | 源码位置 | 职责 | 关键字段 / 方法 | 为什么重要 |
|------|----------|------|-----------------|------------|
| `Context` / `Fiber` / Loader | `vendor/cordis`、`packages/boot/app-boot` | service 注入、插件挂载、effect ownership、逆序 dispose | `plugin()`、`inject`、`effect()`、`fiber.dispose()` | 把“启用能力”和“回收能力”变成同一个生命周期契约 |
| profile patch stack | `apps/cli/src/profile-boot.ts` | bundle/profile/home/CLI overlay 组合 | `composeProfile()`、`composeEntries()` | 产品不是 hardcoded app，而是可检查、可覆盖的 composition |
| `Session` / `SessionEvent` | `packages/core/session` | append-only 事实源与模型表面投影 | `append()`、`deriveMessages()`、header/events | replay、UI、持久化、compaction 共用一个真相 |
| `ReactLoopAgent` | `packages/core/agent-loop/src/agent.ts` | turn/step/inbox/cancel/LLM/tool 状态机 | `send()`、`turn()`、`step()`、`buildRequest()` | 把 steering、取消和失败明确落到 phase 边界 |
| `ToolRegistry` / scheduler | `packages/core/tools`、`agent-loop/src/tool-calls.ts` | tool schema、policy wrapper、并发分类与结果提交 | `executionMode()`、`prepare/dispatch/finalize` | 并行 side effect 与 model-order history 解耦 |
| `SessionPersistence` | `packages/session/session-persistence` | durable append、load/inspect、repair、suffix read | `append()`、`prepare()`、`load()`、`readFrom()` | 恢复不靠重放命令，而靠平衡事件日志 |
| capability seam | `docs/capability-seams.md` 与各 definition/provider/consumer 包 | 抽象能力与实现/消费分包 | abstract Service + provider + consumer | 本地/E2B、JSONL/SQLite、bash/pwsh 可替换而不改 loop |
| `SandboxPolicy` + approval | `packages/sandbox`、`packages/approval` | 文件 effect 和人类确认策略 | mode/preset、approval request | 明确区分策略 gate 与 OS enforcement |
| Typert / API gateway | `packages/typert`、`packages/host/apiproxy` | typed RPC、host/client bridge | request/result schema、interceptor | Web/Python/host surface 不绕过 domain contract |
| Slot runtime | `packages/client/runtime`、`packages/client/ui-*` | client plugin UI composition | `ctx.slots.register()`、scope/share | UI 也遵守插件 ownership，而非另建 monolith |

#### 控制面 / 数据面

- **控制面**：profile/package manifest、Cordis patch、settings、credential references、permission preset、tool registry、agent preset、LLM route、client trust policy。
- **数据面**：LLM stream、bash/pwsh/FS/MCP side effect、background process、attachment bytes、SessionEvent append、JSONL/SQLite write、Web RPC traffic。
- **边界要点**：Cordis `Context` 既是 dependency graph 也是 ownership graph；控制面替换一代插件时，旧数据面资源必须先 quiesce/dispose。

#### 关键执行链路

```text
dsh web / --profile headless
  ↓ parseDshArgs()
prepareProfile() + composeProfile()
  ↓ bundle → profile → home → overlay
boot() → Cordis Loader mounts rows when injections become available
  ↓
entry surface creates/resumes Agent
  ↓
ReactLoopAgent.send() → Inbox(next-turn / next-step)
  ↓
turn/start → pre-step prompt assembly → step/start
  ↓
Session.deriveMessages() → llm.prepareCall()/stream()
  ↓
assistant/chunk* → assistant/message
  ↓ if tool calls
executeToolCalls(): classify → approval/policy → bounded dispatch
  ↓
tool/call → tool/result (model order commit)
  ↓
next step or turn/end → session flush checkpoint
  ↓
JSONL/Zstd or SQLite + UI/session projections
```

#### 状态模型

| 状态类型 | 位置 | 谁读写 | 生命周期 / 一致性规则 |
|----------|------|--------|------------------------|
| 会话事实 | `Session.events` | agent loop、tools、compaction append；projection 只读 | seq 连续、append-only；surface replacement 通过 metadata 投影，不改旧事件 |
| 会话 header | persistence artifact header | store/launcher | format version、cwd、lineage、delegation depth 与 event log 分离 |
| Agent phase | `ReactLoopAgent.phase` | 单 driver | idle/maintenance/running；每个 turn/step 都有结构化闭合 |
| Inbox | `Inbox` | user input、steer/inject/followup | `next-turn` / `next-step`；取消后 waking input 重分类到下一 turn |
| 插件运行态 | Cordis fiber tree | Loader/HMR | effect 归属 fiber；替换失败保留/恢复旧 generation；dispose 逆序回收 |
| 持久状态 | `$DSH_HOME/sessions` / SQLite | persistence provider | batched append；flush 为下一普通 turn 前的 durability checkpoint |
| 配置状态 | profile/home `cordis.patch.yml`、settings、credentials | launcher/settings UI/user | layering last-write-wins；部分配置 HMR，plugin row 替换需 settlement |
| 外部状态 | LLM、filesystem、process、MCP、network | provider/tool | event log 能记录 intent/result，不能自动回滚任意外部 side effect |
| UI read model | session projection/client stores | host fold、browser consume | generation-scoped；断线清空 host description，重连重新握手 |

#### 契约边界

- **内部契约**：Cordis service injection、SessionEvent declaration merging、capability seam definition/provider/consumer、tool prepare/dispatch/finalize、projection unit。
- **外部 API / CLI / MCP 契约**：`dsh --profile` / `web` / `plugin`、Typert RPC、Python SDK、MCP client、ACP subagent provider。
- **Agent-facing 契约**：tools schema、system-prompt sections、skills、AGENTS instructions、plan/goal/todo/compact/subagent tool semantics。
- **安全契约**：sandbox 决定 filesystem enforcement；approval 决定是否问人；permission preset 只组合二者；外层 deployment 仍负责 network/tenant/secret isolation。

#### 失败与降级模型

| 失败类型 | 检测方式 | 系统行为 | 降级 / 修复动作 |
|----------|----------|----------|------------------|
| plugin dependency 缺失 | Loader injection settlement | row pending / boot fail loud | 补 provider 或移除 consumer；不会静默造假 service |
| HMR 新配置失败 | generation replacement error | 保留或恢复旧 generation | 修 patch 后重载；旧能力继续服务 |
| LLM stream 错误 / overflow | structured `LlmError` + `agent/request-error` | policy 可 retry；否则 turn/end error | retry/compaction 必须形成显式事件和新 surface generation |
| 并发 tool 中途取消 | AbortSignal | 停止补池，drain 已启动 call；未启动 call 写 synthetic abort result | 保持 call/result pairing 和 replay 有效 |
| sandbox backend 不可用 | provider capability probe | `SANDBOX_UNAVAILABLE`，fail closed | 修复 runner 或显式选择其他受控 backend；不静默 unconfined |
| persistence write 失败 | background append rejection / flush | 保留 pending events，暂停自动 retry；flush 报错 | 新事件或显式 flush 重试；不把失败写到已闭合 turn 后面 |
| crash 中断 turn | load 检测 open turn | 保留已 durable events，追加 synthetic interrupted `turn/end` | 不重放未知 side effect；恢复为平衡 log |
| 未知 log version/event | format/version validation | refuse load，不误报 corruption | 升级 Harness；当前无旧格式 migration chain |
| Web trust mismatch | Host/Origin/Fetch-Metadata fence | 请求/upgrade 拒绝 | 只用 loopback 或显式 trustedHosts；不要绕过 fence |
| real API secret 缺失 | E2E preflight | job 失败且不执行模型测试 | 正确配置 secret 后重跑；现有失败不能外推 runtime 质量 |

#### 可复刻设计不变量

1. **日志是事实，消息是投影。** 不允许 UI、provider、compactor 各自维护一套不可对账的 conversation history。
2. **所有副作用必须有 owner。** listener、timer、watcher、process、service 都绑定 fiber；卸载必须 quiesce 并逆序回收。
3. **并行执行，顺序提交。** 工具 body 可并发，但 policy、result 与 model context 以模型原始顺序提交。
4. **策略与 enforcement 分层。** permission preset 组合 sandbox + approval；不能用“用户问过了”替代 OS 边界。
5. **恢复上下文，不盲目重放副作用。** crash repair 补平事件边界，不重新执行未知状态的命令。
6. **能力缺失要 fail loud。** seam provider 不存在、sandbox 不可用、format 不支持都不能静默降级。
7. **产品 surface 只是 composition。** Web/headless/Python 不重写 Agent loop，而是挂同一 capability tree。

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| Runtime composition | Cordis plugin/fiber tree | 单体 class 和简单 import graph | 换取动态 capability、HMR、资源 ownership 与产品 profile |
| Session truth | append-only event + projection | 可原地修改的 message array | 换取 replay、审计、compaction、UI read model 与 crash repair |
| Tool concurrency | bounded rolling pool + model-order commit | 完全串行的简单性 / completion-order 低延迟 | 兼顾吞吐和 deterministic model history |
| Persistence | capability seam + JSONL/Zstd/SQLite | 单存储实现的低维护成本 | 本地 artifact 与数据库部署可选，共用 contract suite |
| Sandbox | native OS file-effect runner | 默认容器的强边界与运维成本 | 低摩擦本地使用，但网络/tenant 风险留给 deployment |
| Configuration | ordered patch layers + `!!js` | 纯数据配置的安全与简单 | 极强组合表达力，代价是配置进入受信代码面 |
| Multi-agent | in-process spawn/fork + provider seam | 默认独立进程/机器 failure domain | 低开销、复用 composition；隔离与资源治理较弱 |
| Telemetry | plugin mounted、默认 disabled | 默认收集带来的产品观测 | 隐私优先，但启用 FULL 时仍需治理 raw session export |
| Public launch | 带完整内部历史直接开放 | 干净 squashed snapshot | 保留 provenance 与演化细节；公开 API/治理却仍是第一天 |

### 值得学习的模式

1. **Cordis fiber 作为 capability ownership graph。** 比普通 DI 多了 teardown、HMR 和 scope semantics。
2. **Surface projection。** compaction 通过 append 新 event + shadow old surface，不破坏审计历史。
3. **Tool scheduler 的“parallel body / ordered commit”。** 是可靠并发 tool runtime 的优质实现样本。
4. **Session persistence preparation。** unpublished Session 先 prepare/reserve，成功后 publish，失败可 rollback。
5. **Crash repair 不重写历史。** 中断 turn 追加 synthetic closer，保留已 durable side effect evidence。
6. **Definition / Provider / Consumer 三分 capability seam。** 避免“抽象接口”和某个本地实现重新耦合。
7. **默认安全由 composition 给出。** `workspace-write + ask` 在 base bundle 可直接审计，不藏在 UI 文案。
8. **Host/browser trust fence。** loopback、Host、Origin、Fetch-Metadata、trustedHosts 组合防 DNS rebinding。
9. **Secret-aware child environment。** 普通 subprocess/MCP/PTY 共享 scrub，code worker 直接 empty env。
10. **文档即 contract。** generated Cordis API、type-equiv、persistence event catalog 让文档漂移进入 CI 范围。

### 反模式 / 踩坑点

1. **包数量与概念密度极高。** 248 manifests、数百 capability package 会让局部修改需要跨 package tracing。
2. **`!!js` 让配置成为代码。** 灵活性极强，但必须把 patch 文件纳入 code review、签名和来源治理。
3. **内部成熟度容易制造错误安全感。** 12k commits 不等于公开兼容、发行、支持和安全响应已经成熟。
4. **主 CI 当前不是门禁。** workflow 文件本身很完整，但公开 HEAD 的 run 没创建 job；在修复前不能用文档/测试数量替代绿色主链。
5. **原生 sandbox 容易被误称强隔离。** 它主要限制文件 effect，必须明确网络、进程、同用户数据与 kernel surface 仍在边界外。
6. **in-process subagent failure domain 较宽。** 默认 spawn/fork 共享宿主进程和部署权限；长期、多租户任务需要外部 worker 隔离。
7. **公开反馈入口只用 Discussions。** launch burst 很大，但缺 issue labels、security advisory 与 PR health signal，维护效能难量化。

### 可借鉴的具体技术点

- `packages/core/agent-loop/src/agent.ts`：phase、turn/step、steer/inject/followup、LLM request header。
- `packages/core/agent-loop/src/tool-calls.ts`：bounded rolling pool、barrier、abort drain、model-order commit。
- `packages/core/session`：append-only event、surface operation、message derivation。
- `packages/session/session-persistence`：prepare/load/inspect/readFrom、version refusal、crash repair。
- `packages/compaction/compaction-basic`：summary transaction、surface generation、overflow recovery。
- `packages/boot/app-boot` + `apps/cli/src/profile-boot.ts`：profile layering、HMR replacement、fail-loud boot。
- `packages/sandbox/sandbox-local`：跨平台 runner selection 与 fail-closed result。
- `packages/subprocess/subprocess-local`：process-tree ownership、TERM→KILL、credential scrub、PTY cleanup。
- `packages/client/connection/src/api-request-trust.ts`：browser Host/Origin trust fence。
- `scripts/gen-cordis-catalog.ts`：从源码生成 API catalog 并验证双语文档一致。

---

## 架构解剖

### 目录结构

```text
apps/
  cli/                         dsh launcher、profile compose/boot、plugin 管理
  web/                         React/Vite Web artifact
packages/
  boot/                        app-boot、cmdline、loader contracts
  core/                        agent、agent-loop、session、tools、LLM、scope、prompt
  bundle/                      base / web-app / headless profile patches
  session/                     JSONL/Zstd、SQLite persistence 与 projection/query
  sandbox/                     policy、local runners、fs/bwrap/Landlock/Seatbelt/Windows
  shell/ + subprocess/         bash/pwsh、PTY、jobs、process tree、env scrub
  compaction/                  summary、token meter、tool-result pruning
  subagent/ + workflow/        spawn/fork/ACP/Codex/Claude/SDK providers
  mcp/                         MCP client
  host/ + typert/              typed RPC、API proxy/gateway
  client/                      browser runtime、connection、slots、UI plugins
  llm/                         DeepSeek adapter、pi-ai routes、retry
  settings/ + credentials/     hot settings、managed secret references
  e2b/                         remote execution provider
python/
  sdk/                         Python API
  sdk-runtime/                 pinned runtime distribution
native/                        Landlock / Windows native helpers
vendor/                        Cordis、loader/include/HMR 等同仓框架
.agents/notes/                 implemented decisions、postmortems、process notes
.github/workflows/             CI、sandbox、real API E2E、release、docs
```

### 技术栈

- **运行时 / 框架**：Node.js `>=22.14.0`；TypeScript ESM；Cordis/Cosmokit/Schemastery。
- **前端**：React 18、Vite、typed client plugin/slot runtime、WebSocket + HTTP。
- **存储**：JSONL + concatenated Zstd frame；`node:sqlite`；content-addressed attachment。
- **执行**：bash/pwsh、node-pty、worker thread、bwrap/Landlock/Seatbelt/Windows restricted token、可选 E2B。
- **协议**：DeepSeek chat/messages、Pi AI provider bridge、MCP、ACP、Typert RPC、Python SDK。
- **构建 / 打包**：pnpm workspace、tsdown/tsx/tsgo、Vite、Python uv/lock、npm + PyPI RC。
- **测试**：Vitest、Playwright、contract suite、real API E2E、sandbox kernel E2E、doc/type/catalog sync。
- **CI/CD**：15 个 workflow；普通 CI、sandbox、E2E、release/vendor/native、docs、Dependabot。

### 模块依赖关系

```text
apps/cli
  → dsh-app-boot / Cordis Loader + Include
  → bundle/base + bundle/web-app | headless
  → capability providers

bundle/base
  → LLM + Session + Agent + Tools + Prompt
  → Persistence + Projection + Compaction
  → Sandbox + Approval + Subprocess
  → Skills + Goal + Subagents + Workflow

ReactLoopAgent
  → Session + LLM + Tools + SystemPrompt
  → event dispatch middleware
  → persistence checkpoint policy

Web host
  → Typert API gateway / API proxy
  → client plugin manifest + slot runtime
  → same agent/session services
```

### 扩展机制

- profile `package.json` 声明 ordered bundle stack；profile/home/CLI patch 逐层覆盖。
- Cordis plugin 可注册 service、event、timer、loader row 和 client half。
- capability seam 替换 provider：local/E2B、JSONL/SQLite、DeepSeek/Pi AI、spawn/ACP/Codex/Claude。
- MCP server 通过 MCP client plugin 接入；明确配置 command/transport/env/cwd。
- skills 从 filesystem 加载；agent preset 组合 persona、tools、plugins。
- client UI 用 slot registration 组合，Host 和 browser half 由 manifest 绑定。
- settings namespace 支持 runtime validation、热更新和 secrets path 声明。

---

## 质量与成熟度

### 代码质量

- **类型与契约极强。** 大量 branded types、closed unions、runtime schema、declaration merging、exhaustiveness guard；边界通常有错误码和 provenance。
- **并发/生命周期意识强。** AbortSignal、Promise race、quiescence、model-order commit、whole-process-tree join、generation scope 和 rollback 都有显式设计。
- **失败语义强。** 注释不只解释 happy path，还覆盖 reentrant cancel、abandoned value、torn tail、unknown format、partial commit、live/cold session 区别。
- **文档与源码同步工程罕见。** 2,355 份 Markdown 中包括 generated Cordis API、type-equiv、event catalog、implemented decision 和 postmortem。
- **复杂度代价真实。** 248 manifests 和 declaration-merging ecosystem 对外部开发者不友好；理解一个 feature 往往需要同时读 definition/provider/consumer/bundle/docs/tests。
- **安全文档缺口。** 代码里有许多具体安全控制，但根仓库没有 SECURITY.md 和统一 threat model，外部审计者必须跨子系统拼边界。

### 测试

静态分类得到 1,772 个测试/fixture 资产，其中 927 个 TS 文件。覆盖面包括：

- agent phase/turn/step/inbox、LLM stream 与 request header；
- tool registry、policy wrapper、并发 scheduler、abort/timeout；
- JSONL/SQLite persistence contract、repair、format validation、projection；
- bwrap/Landlock/Seatbelt/Windows sandbox 与 filesystem policy；
- subprocess/PTY/process-tree、credential env scrub；
- Web client/host plugin、RPC/trust fence、Playwright；
- subagent spawn/fork/ACP/Codex/Claude/SDK；
- compaction、token meter、tool-result pruning；
- docs catalog/type equivalence/codegen freshness。

公开 Actions 的实际信号：

- 同 SHA sandbox workflow：bwrap、Ubuntu x64 Landlock、Ubuntu ARM Landlock、macOS Seatbelt 全部 success。
- real API E2E：失败在 preflight 缺 `DEEPSEEK_API_KEY`，未执行实际模型链路。
- 主 CI：workflow run conclusion=failure，但 jobs API 为 0；没有形成可判读 test job。

本报告没有本地执行任何测试，因此不把测试资产数量或公开 sandbox job 外推为“全套测试通过”。

### CI/CD

- `ci.yml` 定义了按 package group 的 check/test/docs/benchmark/manual suite，文件本身达到成熟 monorepo 水平。
- `sandbox.yml` 把真实 kernel confinement 放到 master-only 独立 workflow，避免 mock 代替 OS boundary proof。
- `e2e.yml` 明确需要 external DeepSeek API secret，preflight 在缺 secret 时 fail loud。
- release workflow 在 PR 上 pack tarball，发布路径使用 npm provenance；Python SDK 有 uv lock。
- 依赖更新使用 Dependabot，覆盖 npm、uv、GitHub Actions。
- **当前公开主 CI 无有效 job 是硬缺口。** 在它修复前，release/pack 和 sandbox 绿灯不能替代核心 unit/integration/doc-sync gate。
- npm 包 dist-tag 暂不完全一致：`@deepseek-ai/dsh` latest/next 均为 rc.6，而 `dsh-base` latest 仍是 rc.1、next 才是 rc.6；RC 用户应固定完整版本。

### 文档质量

属于 Coding Agent 开源项目第一梯队：

- 根 README 简洁、双语、明确 Developer Preview；
- `docs/architecture.md`、`agent-lifecycle.md`、`capability-seams.md` 讲清 spine 与 seam；
- 50+ subsystem 页面给出源码等价类型和生成 API；
- `.agents/notes/implemented` 保存设计决策、故障修复和过程不变量；
- `AGENTS.md` 是高密度开发规约，不是通用 prompt 模板。

缺点：

- 没有稳定版 migration/changelog；
- `BENCHMARK.md` 尚未提供结果；
- 没有统一 security/threat model/deployment hardening；
- 文档体量巨大，新贡献者容易淹没在内部术语中。

### Issue / PR 健康度

- GitHub Issues 和 Pull Requests 功能关闭；Search API 返回 0 open/closed issue 与 PR。
- CONTRIBUTING 要求先在 Discussions 提 proposal，由 maintainer 同意后再实现；这更像 product-led intake，不是开放 backlog。
- 开放后约 12 小时，Discussion 编号从 #12 增长到 #537；样本包括安装失败、memory 请求、桌面版、更强 Linux sandbox。
- 该热度说明 launch attention 极强，但观察窗口太短，无法计算可靠的首响、关闭率、回归修复周期或外部 contributor merge rate。
- Git 历史不是单日代码 dump：根提交 2026-06-10，6 月 581、7 月 8,273、8 月 3,439 commits；说明约两个月高强度内部开发后完整开放。仍不能用内部历史替代公开治理成熟度。

---

## 社区与生态

### 社区评价

可验证信号：

- 一天内超过 40k Stars、3.1k Forks、约 535 个 Discussion 编号，DeepSeek 品牌与开源完整源码带来爆发式关注。
- 讨论主题迅速进入实际产品问题，而不只是点赞：安装错误、memory、sandbox、桌面版、模型配置均已出现。
- 官方同时提供企微社区、问卷和公众号，说明运营投入明确。

不能外推的结论：

- 没有足够时间判断维护者响应 SLA、bug closing、版本兼容和第三方插件质量；
- Issues/PR 关闭使社区健康无法用常规 open/merged 指标衡量；
- Star 速度不能证明 0.1 RC 已适合关键生产仓。

### 衍生项目 / 插件生态

- 官方通过 GitHub `dsh-plugin` topic 引导插件发现，但观测窗口只有一天，尚未形成可审计的成熟插件目录、签名或质量分级。
- 仓库内已经有大量一方插件/provider，可证明接口可落地，不等于外部生态已形成。
- MCP、ACP、Codex、Claude Code、E2B 等 bridge 扩大连接面；它们是 interoperability signal，也是供应链和权限扩张面。
- 团队采用前应自建 approved profile/plugin registry，固定版本、审查 install scripts、限制 MCP command/env 和网络目的地。

### 竞品对比

| 项目 | 层级 | 最强差异 | 相比 DSH 的优势 | 相比 DSH 的弱项 |
|------|------|----------|----------------|----------------|
| OpenCode | 完整 Coding Agent runtime | durable event/projection + 多入口 + 大生态 | 公开发行、用户生态、provider breadth 更成熟 | capability seam 与可逆 plugin composition 没有 DSH 如此体系化 |
| Pi | TypeScript agent substrate + CLI | 轻量 provider/agent/TUI SDK 与 extension | 更轻、更稳定、更适合直接嵌入 | durability、sandbox、profile composition 和 Web platform 深度较弱 |
| Prime Agent | 长时 Coding Agent runtime | daemon worker、IPython/RLM、retained child、continual harness | 长时自治与持久子代理更深 | 两者都缺 workspace trust gate；Prime Agent 项目扩展自动执行链更直接，DSH 默认权限 composition 更保守但仍有 prompt/skill→read/network 链 |
| Grok Build | 产品级 Coding Agent harness | ACP/actor、session、sandbox、worktree、multi-agent | 产品 surface 与 actor failure domain 完整 | 公开治理弱、生态封闭；DSH 的插件/文档契约更开放 |
| jcode | Rust terminal runtime | server-owned live session、Swarm、Graph Memory | 单二进制/Rust、本地性能与 memory depth | Web/plugin composition 和 capability seam 不如 DSH |
| Claude Code / Codex CLI | 商业 coding agent | 模型体验、分发、产品抛光 | 直接使用门槛低、稳定 support | 内核不可完整检查/替换；DSH 可作为外部 subagent 调用它们 |
| OpenHands | 自治软件工程平台 | remote execution、任务平台、多租户方向 | 平台/云执行面更完整 | 本地 runtime composition 和插件级可替换性不是同一重点 |
| Cline / Continue | IDE coding agent | 编辑器内交互与企业 IDE 接入 | IDE 工作流成熟 | 不是宿主无关 agent runtime；与 DSH 也可互补 |

---

## 关键代码走读

### 1. `ReactLoopAgent`

- 路径：`packages/core/agent-loop/src/agent.ts`
- 职责：驱动 session 通过 queued turn 与 step boundary。
- 实现要点：
  - phase 是 idle/maintenance/running closed union；
  - followup/steer/inject 映射到 `next-turn` / `next-step` 与 wakeup 语义；
  - 每个 model request 从 `session.deriveMessages()` 重建；
  - chunk、assistant message、request header/context、turn/step 都写入事件日志；
  - cancellation/error 都在 `turn/end` 结构化闭合。

### 2. `executeToolCalls`

- 路径：`packages/core/agent-loop/src/tool-calls.ts`
- 职责：调度单个 assistant step 的 tool calls。
- 实现要点：
  - exclusive call 形成 barrier；parallel call 进入 bounded rolling pool；
  - dispatch 可重叠，prepare/finalize/result context 按模型顺序提交；
  - 每次准备下一 call 前重新读取 execution mode，支持运行时 registry 变化；
  - abort 停止补池、drain 已启动 call，并为未启动 call 写 synthetic result，保证 replay pairing。

### 3. profile composition

- 路径：`apps/cli/src/profile-boot.ts`、`packages/bundle/base/cordis.patch.yml`
- 职责：从空 root 组合完整产品。
- 实现要点：
  - bundle patch → profile patch → home patch → `--patch` → telemetry switch；
  - row 以 id 定位，后层覆盖前层；
  - base bundle 可直接读出默认 DeepSeek route、JSONL persistence、workspace-write sandbox、ask approval、tools/subagents/compaction；
  - live user patch 重新 compose，避免旧 object alias 污染回滚。

### 4. `SessionPersistence`

- 路径：`packages/session/session-persistence/src/index.ts`
- 职责：定义 durable append-only session backend contract。
- 实现要点：
  - `prepare`、`load`、`inspect` 区分 unpublished、cold/live、repair/no-repair；
  - crash 中断 turn 通过 synthetic closer 平衡，不截断完整 durable prefix；
  - unknown version/required event fail loud；
  - `readFrom(seq)` 支持 projection 增量 fold；JSONL 和 SQLite 共享 contract suite。

### 5. sandbox / subprocess boundary

- 路径：`packages/sandbox/sandbox-local`、`packages/subprocess/subprocess-local`、`packages/subprocess/subprocess/src/index.ts`
- 职责：文件 effect confinement、process tree ownership 与 child env。
- 实现要点：
  - 平台 runner 不可用时返回 structured unavailable，不能静默裸跑；
  - subprocess detached tree 在 teardown 时 TERM→grace→KILL 并等待 whole-tree exit；
  - ambient env 剥离 credential-shaped 与 `DSH_*` 名称；显式 env 仍可有意覆盖；
  - 该边界不负责网络、host tenant 或 secret broker。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 4.8 | Web/headless/SDK、tools、subagent、persistence、compaction、sandbox、MCP/LSP 已形成完整 runtime |
| 代码质量 | 4.8 | 类型、失败语义、并发、lifecycle ownership 很强；248 包带来巨大复杂度 |
| 文档质量 | 5.0 | 架构、subsystem、generated API、decision/postmortem 信息密度罕见 |
| 社区活跃度 | 3.4 | launch 热度极高，但公开仅一天、Issues/PR 关闭，治理闭环尚无观察窗 |
| 架构设计 | 5.0 | reversible composition + event/projection + capability seam 是当前开源 harness 的一线样本 |
| 产品成熟度 | 2.8 | Developer Preview、0.1 RC、无 tag/release、主 CI 无有效 jobs |
| 安全默认值 | 3.0 | workspace-write + ask、sandbox fail-closed、env scrub、telemetry off 是优点；但缺 workspace trust，默认项目 instructions/skills 与宿主读取/网络组合成 P1 |
| 学习价值 | 5.0 | agent runtime、插件生命周期、持久化与安全 composition 都值得深读 |
| 可借鉴度 | 4.9 | 多个模式可独立抽取；不建议照搬 248-package 粒度和受信 `!!js` 配置 |

**综合评分：8.6 / 10。**

> 评分解释：若只评架构与源码工程，约 9.6/10；若评 2026-08-14 在**可信 workspace** 的个人受控试用，约 6.8/10；若评团队关键生产底座，受 workspace trust P1、0.1 RC、公开时间、CI/security policy/治理证据拖累，目前约 5.2/10。

---

## 总结

### 一句话评价

**DeepSeek Harness 是一个“公开发行很早、内部工程很深”的 Coding Agent runtime：它最值得学的不是 DeepSeek API，而是用 Cordis 可逆插件树管理能力生命周期、用 append-only event/projection 管 session 事实、用 capability seam 组合执行与安全边界。**

### 谁应该用

- 正在设计 Coding Agent runtime、tool scheduler、durable session、plugin/HMR、sandbox/approval 组合的架构师；
- 愿意固定 RC，在 disposable container/VM 中试用 Web/headless surface 的高级开发者；
- DeepSeek 生态内需要定制 profile、provider、tool、MCP、client plugin 的团队；
- 想把 OpenCode/Pi/Prime Agent/Grok Build 的 runtime 设计做横向比较的人。

### 谁不应该直接用

- 需要稳定 semver、长期迁移承诺、正式 security support 和企业 SLA 的团队；
- 想在共享服务器上直接做 hostile multi-tenant agent execution 的平台；
- 准备直接打开未审计仓库，或认为项目 `AGENTS.md` / `CLAUDE.md` / skills 只是无害文档的使用者；
- 认为默认 sandbox 会隔离网络、进程、同用户 secrets 的使用者；
- 准备安装未知 profile/plugin/MCP 或把 `danger-full-access` 用作无人值守默认值的人；
- 只需要一个轻量 CLI/SDK，不愿承担 248-package runtime 心智的人。

### 下一步

1. **官方优先级**：加入持久 workspace trust gate；未信任仓默认禁用 project instructions/skills；修复公开主 CI job creation；给 real API E2E 正确配置 secret；发布 SECURITY.md；固定 release Actions SHA；打 GitHub tag/release。
2. **个人试用**：固定 `0.1.0-rc.6`/SHA，只打开可信 workspace；保持 `workspace-write + ask`、loopback、telemetry disabled，只装可信插件。不可信仓先禁用 project instructions/skills，再进入无生产秘密、出站受限的一次性容器/VM。
3. **团队 PoC**：workspace allowlist + 外层容器/VM + 低权限用户 + egress allowlist + secret broker；审计 `$DSH_HOME`、profile package、MCP command/env 和 project skills；记录 approval 与 session artifact retention。
4. **架构复刻**：先复刻五个最小不变量——fiber ownership、event/projection、turn/step state machine、ordered tool settlement、persistence repair；不要一开始复制 248-package 全量产品面。
5. **复核窗口**：等待 30-60 天，重新观察公开版本、Discussion resolution、第三方插件、主 CI 与 security response，再决定是否进入团队主路径。
