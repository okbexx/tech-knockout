# Pireel

> 一句话定位：面向口播视频的 browser-native NLE 与 Agent 编辑器内核，以 declarative composition、双时钟视频模型、客户端同源预览/导出和 MCP browser bridge，让外部 Coding Agent 能看见、修改并验证视频工程；但完整 Agent 与云项目路径仍依赖未公开的托管后端。

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `pireel/pireel` |
| URL | `https://github.com/pireel/pireel` |
| Star | 834（GitHub REST，2026-07-30） |
| Fork | 71（GitHub REST，2026-07-30） |
| 许可证 | AGPL-3.0-only；官方 companion `pireel-agent` 另为 Apache-2.0 |
| 语言 | TypeScript / TSX / CSS |
| 首次提交 | `25a73631`，2026-07-21，`Initial commit: Pireel Studio (open-source, backend-free editor)` |
| 最近提交 | `b0ff7bd2`，2026-07-30 |
| 源码快照 | `b0ff7bd269444446ec7dd12414c73735704f7c9a` |
| 最新 Release | 无 GitHub tag / release |
| 贡献者数 | 3 个本地 Git author identity；200 commits 中主维护者 196 commits |
| 代码规模 | 397 个 tracked files；71,672 行 TS/TSX/JS/CSS；34 个 test/spec 文件 |
| 分析日期 | 2026-07-30 |

> 指标口径：Stars、Forks 和仓库元数据来自 2026-07-30 的 GitHub REST 快照；Issue、PR、Release 和 Actions 由 GitHub 服务端 HTML与本地 Git history 交叉核验。公开仓历史仅覆盖 2026-07-21 至 2026-07-30，是私有 Pireel monorepo 的单向同步镜像，不能用十天公开历史证明长期维护性。

---

## 场景一：是否值得采用

### 解决的问题

Pireel 解决的不是“输入一句话生成完整视频”，而是一个更具体的编辑问题：如何让人类和外部 Agent 共同修改口播视频，同时让预览、时间线、导出和 Agent 工具围绕同一个结构化工程模型工作。

目标用户包括：

1. 需要在浏览器中做口播视频切段、字幕、构图、B-roll、音乐、主题和导出的个人创作者；
2. 希望让 Codex、Claude Code 等外部 Agent 通过 MCP 操作真实视频时间线的用户；
3. 想研究 browser-native NLE、WebCodecs 导出与 Agent-editable composition 的工程团队；
4. 愿意自行实现 `StudioProviders`，把私有模型、ASR、媒体库和项目存储接入编辑器的开发者。

它的关键产品判断是：Agent 不直接“生成一个 MP4”，而是先读 composition state，再对结构化 shot/block/caption/theme/audio 状态做可验证修改，最后由浏览器统一预览和导出。

### 核心能力与边界

- **能做什么：** 本地导入主视频；按 transcript/shot 编辑；多源视频片段；口播字幕；overlay blocks；主题 frame packs；framing、转场、滤镜、音量、BGM、降噪；浏览器实时预览；客户端 MP4/MOV/WebM 导出；通过 MCP 让外部 Agent 查询状态、生成并应用 block/plan/visual labels、截帧验证。
- **本地 OSS shell 能做什么：** 无账号运行基础编辑器，draft 存 `localStorage`、视频字节存 OPFS；`/local-assets` 提供开发期内容寻址文件存储；WebCodecs/MediaBunny 在 Chromium 内完成导出。
- **本地 OSS shell 不能做什么：** 默认 `unavailableProviders()` 会禁用 composer、planner、transcriber、vault、projects 和 uploads；生成、转录、云媒体、跨端同步、图像/视频生成都要自行实现 provider。
- **官方 Agent 路径的边界：** companion plugin 固定连接 `https://pireel.com/api/studio/mcp`，依赖 OAuth、云项目、import token、presigned upload、Durable Object routing 和 hosted auth；这些 routing/auth/storage 实现未在本仓公开。
- **导出边界：** client export 明确不导出 picture-in-picture video block frame 与 person-matte layer；跨域 block 图片还依赖未公开的 `/api/media/fetch` 代理。
- **与竞品差异：** Remotion/Motion Canvas/Revideo 从代码或 scene graph 生成视频；OpenCut 是通用 browser NLE；OpenMontage 是 Agent 制片 harness；Pireel 则把“口播 NLE + Agent MCP + browser visual verification + client export”压进同一个 composition runtime。

### 集成成本

#### 个人本地编辑

- 技术栈为 pnpm 9.12、Vite 8、React 19、Chromium WebCodecs；README 路径是 `pnpm install && pnpm dev`。
- 基础编辑无需服务端，但当前仓无 release artifact，用户必须从源码启动。
- 本轮遵守静态分析边界，未安装依赖、未启动应用、未运行目标测试；当前环境也没有 `pnpm`。

#### 自托管完整产品

- 不能只部署 Vite shell。至少还要实现 composer、planner、transcriber、vault、projects、uploads 六类 provider。
- 若要复制官方 Agent 体验，还需实现 MCP OAuth resource、project/user ownership、import token、media presign/register、browser handoff、Durable Object bridge、cloud project offline executor 和媒体代理。
- `mcp.ts`、`bridge-do.ts` 和 `server-tools.ts` 给出了纯逻辑与契约，但真正的 HTTP routing、auth、database schema、object storage policy 未公开。
- 对熟悉 React/Vite/WebCodecs 的团队，基础 shell demo 是小时级；完整 self-host Agent 产品是数周到数月级，而不是“换几个 API key”。

#### 商业采用

- 主仓 AGPL-3.0-only；修改后通过网络提供服务时，应评估 AGPL 对对应源代码提供义务的影响。
- companion plugin 为 Apache-2.0，不会把主编辑器自动变成宽松许可。
- 若团队无法接受 AGPL、未公开 hosted backend、Chromium-only 高级导出和当前超早期治理，不应把它放进关键生产路径。

### 依赖 / SDK 选型证据

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| React 19 + Vite 8 | UI / build framework | Studio shell、workbench、panels、timeline | 用成熟浏览器组件模型承载复杂 NLE UI | 根与 `apps/studio-oss/package.json` | 构建 browser-first 创作者工具时可评估 | UI 状态与媒体 runtime 复杂，不能只按普通 CRUD SPA 估算 |
| MediaBunny | media runtime | demux/decode/sample/encode MP4、MOV、WebM | 在浏览器内重采样多源视频与音频并写容器 | `package.json`、`studio-ui/src/client-export.ts` | 需要 WebCodecs-first 客户端媒体管线时优先评估 | 受 codec/browser 支持和内存压力约束；不是通用桌面转码替代 |
| Canvas + SVG `foreignObject` | browser rendering primitive | overlay WYSIWYG rasterization | 复用浏览器排版引擎，把 preview DOM 逐帧绘制到视频 | `client-export.ts` | 需要“HTML 预览即导出”时值得研究 | 外链图片必须内联；video/canvas layer 不能自然进入 foreignObject |
| `onnxruntime-web` + MediaPipe Tasks Vision | ML runtime | person matte、视觉分析与几何 passes | 把部分视觉推理放进浏览器 | 根 `package.json`、studio UI visual/matte modules | 本地隐私优先、模型可接受浏览器性能时可用 | 模型体积、GPU/WASM 兼容和 export parity 都要单独验证 |
| `@jitsi/rnnoise-wasm` | audio DSP | narration denoise | 浏览器内执行 RNNoise 降噪 | `package.json`、denoise modules/tests | 轻量口播降噪可评估 | 需要 preview/export 同源与性能预算，不能只接 UI toggle |
| `fast-json-patch` | state delta protocol | receipt / composition patch | 让 Agent mutation receipt 只返回状态增量 | `studio-engine/package.json`、`receipt-delta.ts` | 外部 Agent 操作大状态对象时适合 | patch 必须绑定版本/当前快照，避免 stale mutation |
| `jsondiffpatch` | diff / debugging | composition diff | 生成人可读状态变化 | `studio-engine/package.json`、draft/project modules | 需要审计编辑差异时可用 | 不能替代事务和并发控制 |
| AI SDK + Streamdown | chat/UI framework | 内部 AI chat 与流式内容呈现 | 复用 AI stream/react 渲染 | 根 `package.json`、studio UI chat modules | 同时需要 agent chat surface 时可评估 | 官方外部 Agent 主路径是 MCP，不应把内部 chat 当核心 runtime |
| OPFS + `localStorage` | browser storage | 视频字节与 draft 持久化 | 无后端保存大媒体和轻量工程状态 | README、`use-draft-persist.ts` | local-first browser app 可复用分层存储思路 | origin 绑定、浏览器清理、跨端同步和迁移都要另做 |
| Cloudflare Durable Object contract | coordination runtime | 每用户单活 browser socket、MCP call bridge | 把外部 Agent 请求路由到持有 React/media state 的浏览器 | `studio-engine/src/bridge-do.ts` | “云控制面调用活跃浏览器执行器”很适合 | hosted routing/auth 未公开；平台耦合明显 |
| Vitest | test framework | engine/UI pure-contract tests | 测 composition、MCP、bridge、trim、audio 等 | 根 `package.json`、34 个 test files | TS monorepo 单元/契约测试可复用 | 无公开 CI/E2E，当前测试信号不能证明真实浏览器导出稳定性 |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | ⚠️ | AGPL-3.0-only 对自托管网络服务和商业改造有明确合规成本；companion Apache-2.0 不改变主仓许可 |
| 公开/私有边界 | 高风险 | 仓库是私有 monorepo 的单向镜像；hosted auth、route、DB、R2 policy、媒体代理和完整 provider 实现不可审计 |
| Bus factor | 高 | 200 commits 中 196 来自主维护者；公开贡献刚出现 4 个 merged PR |
| 维护趋势 | 极活跃但过早 | 十天 200 commits、约 834 Stars；速度高，但无长期兼容、升级、release 或安全响应样本 |
| Custom HTML/JS 执行边界 | 高风险 | 两条旁路成立：element normalization/资产缩略图会把自由 HTML 注入主文档；client export 创建未 sandbox 的同源 `srcdoc` iframe，assembly 再通过 `new Function` 执行 `timelineBody`。lint 只拦截 `<script>` 和少数非确定 API，未形成 sanitizer/Trusted Types/受限 DSL 边界。应协调披露并在生产采用前修复 |
| MCP / OAuth | ⚠️ | pure MCP contract 设计清晰，但 routing 层负责 auth；公开仓无法验证 OAuth subject、project ownership、CSRF、rate limit 和审计 |
| 本地媒体隐私 | 中 | OSS shell 主视频本地；官方 plugin 主视频走 loopback，但转录音频、B-roll、图片和音频素材可能上传云端，不能概括为“所有内容均不离开浏览器” |
| 媒体 SSRF / proxy | 未知 | client export 会调用 `/api/media/fetch?url=`；路由未公开，无法验证 scheme/host/private-network/size/content-type 限制 |
| 单写者一致性 | 设计良好、仍需 E2E | DO 单活 socket + browser serial queue + same-project autosave demotion是好设计；无真实多 tab/cloud race E2E 证据 |
| 供应链 | 中 | pnpm lock 有 integrity；OSV Batch 对 526 个精确 npm 版本未发现匹配漏洞；但无 Actions、Dependabot、SBOM、release provenance |
| 发布能力 | 高风险 | 无 GitHub tag/release、无 checksum/签名/attestation，只有源码启动路径 |
| 浏览器兼容 | 中高 | WebCodecs 客户端导出明确偏 Chromium；高级 person matte/PiP export 不完整 |
| 安全响应 | 高风险 | 未见 `SECURITY.md`、私密漏洞报告流程或安全公告历史 |

### 结论

**观望。推荐架构学习和隔离 PoC，不建议直接用于生产或商业关键路径。**

理由：Pireel 已经不是 UI demo。composition、双时钟剪辑、browser bridge、MCP brief/apply、同源 preview/export 和客户端媒体管线都有真实工程深度。但采用判断要服从四个更高优先级事实：

1. 公开项目只有十天历史，没有 release、CI、E2E 和长期维护样本；
2. 完整 Agent/self-host 路径依赖未公开 hosted backend；
3. 自由 HTML/JS 同时可旁路进入应用主文档和未 sandbox 的同源导出 iframe，存在高风险缺口；
4. AGPL 与 Chromium/media capability 对企业产品有明确约束。

个人体验建议：固定 commit，在无敏感素材的独立浏览器 profile 中运行 OSS shell；不要默认连接托管 MCP；不要把 provider/Agent 生成的自定义 HTML 当可信；先验证本机 codec、长视频内存和导出一致性。

团队 PoC 建议：先只复用 `studio-engine` 的 composition/trim/audio contracts 和 client export spike；把 auth、媒体代理、HTML sanitizer、project revision、审计和异步 job 全部放进自己的边界。不要把未公开的 hosted behavior 当作可交付依赖。

---

## 场景二：技术架构学习

### 核心架构图

```text
                    External Coding Agent
                 Codex / Claude Code / MCP host
                              │
                   OAuth HTTP MCP (hosted)
                              │
              ┌───────────────▼────────────────┐
              │ studio-engine/mcp.ts           │
              │ tool catalog + brief/apply     │
              │ JSON-RPC contract, zero I/O    │
              └───────┬────────────────┬───────┘
                      │                │
         server-direct cloud ops       │ browser-required ops
         projects/assets/catalog       │
                      │         ┌──────▼───────────────┐
                      │         │ StudioBridge DO       │
                      │         │ one user / one socket │
                      │         └──────┬───────────────┘
                      │                │ WebSocket
                      │         ┌──────▼───────────────┐
                      └────────►│ Studio browser tab    │
                                │ serial runStudioTool  │
                                └──────┬───────────────┘
                                       │
             ┌─────────────────────────▼────────────────────────┐
             │ Composition runtime                              │
             │ shots + blocks + transcript + audio + theme      │
             │ edited clock ↔ source clock ↔ preview timeline   │
             └─────────────┬──────────────────────┬──────────────┘
                           │                      │
                  local/cloud draft         client export
                  localStorage + OPFS        MediaBunny + Canvas
                           │                      │
                           └──────────► MP4 / MOV / WebM
```

### 底层技术架构

#### 最小架构内核

脱掉 React 面板、主题素材和托管业务后，Pireel 的最小内核是：

```text
Serializable Composition
+ Edited/Source Clock Mapping
+ Deterministic Preview Assembly
+ Structured Studio Tool Registry
+ Single-writer Browser Executor
+ Client-side Frame/Audio Export
```

“AI”不是最小内核。真正让外部 Agent 可用的是：状态可序列化、工具输入有 schema、每次 mutation 有 receipt、视觉结果可 capture、预览与导出共享同一 composition semantics。

#### 核心抽象

| 抽象 | 源码位置 | 职责 | 关键字段 / 方法 | 为什么重要 |
|------|----------|------|-----------------|------------|
| `Composition` | `studio-engine/src/composition-core.ts` | 视频工程事实对象 | width/height、video、shots、blocks、captionStyle、audioTracks、personFx | UI、Agent、持久化、预览和导出的共同语言 |
| `VideoShot` / trim spans | `composition-core.ts`、`trim.ts` | 把源视频区间映射到最终 edited timeline | `srcStart`、`srcEnd`、`src`、treatment、`spans()` | 明确 source clock 与 edited clock，避免 Agent 按错时间编辑 |
| `Block` / template registry | `composition-core.ts`、templates/assemble modules | overlay 数据和自由 HTML | templateId、slots、start/duration、track、box/contentBox | 预设组件与 Agent 自由表达共用一个轨道模型 |
| `STUDIO_TOOLS` | `studio-engine/src/prompts/` | 统一 internal chat 与 MCP tool surface | id、kind、description、inputSchema | 避免两套 Agent 工具语义漂移 |
| MCP pure core | `studio-engine/src/mcp.ts` | JSON-RPC initialize/list/call 与 tool dispatch | `McpDeps`、`buildMcpTools()`、bridge timeouts | 把协议契约与 hosted I/O 分离，可纯测试 |
| `StudioBridge` | `studio-engine/src/bridge-do.ts` | Agent request 到浏览器的单活路由 | `/ws`、`/call`、pending map、single socket | React/media state 留在浏览器，外部 contract 不耦合执行位置 |
| Browser bridge queue | `studio-ui/src/use-agent-bridge.ts` | 串行执行外部 mutation | promise queue、reclaim、reconnect、displacement | 避免并发工具破坏 undo、generation lock 和 composition state |
| Offline executor | `studio-engine/src/server-tools.ts` | 无浏览器时对 cloud composition 执行 data-level tools | server tool handlers、project DTO | 让结构化编辑不必永远依赖活跃 tab |
| Draft persistence | `studio-ui/src/use-draft-persist.ts` | local/cloud draft、OPFS media 恢复、单写者 autosave | project revision、file signature、restore/heal | 浏览器媒体 state 的恢复与多 tab 一致性核心 |
| Client exporter | `studio-ui/src/client-export.ts` | 多源解码、overlay raster、音频混合、编码 | `openSource()`、`sampleAt()`、`createOverlay()`、MediaBunny output | 把 WYSIWYG 从口号变成逐帧同源实现 |
| `StudioProviders` | `studio-engine/src/providers.ts` | 注入生成/ASR/媒体/项目能力 | composer、planner、transcriber、vault、projects、uploads | OSS shell 与托管业务的显式 seam |

#### 控制面 / 数据面

- **控制面：** tool schema、frame/theme 选择、provider 注入、project ownership、OAuth/import token、single-writer claim、plan/brief contract、导出参数、caption/theme settings。
- **数据面：** 视频字节、OPFS、媒体 upload、transcription audio、WebSocket tool calls、composition mutation、MediaPipe/ONNX inference、frame capture、MediaBunny decode/encode、Canvas raster 和音频 mix。

关键边界：`mcp.ts` 只描述 contract，不负责 auth；`StudioBridge` 只路由单用户浏览器执行器，不负责证明请求属于该用户；HTML block 是数据模型的一部分，但一旦进入主 document 就变成代码执行面。

#### 关键执行链路

**Agent 编辑：**

```text
Agent call get_state
  ↓
MCP routing layer verifies OAuth/user (not open sourced)
  ↓
StudioBridge DO → active browser WebSocket
  ↓
useAgentBridge serial queue → runStudioTool
  ↓
validate ids/clocks/schema → mutate Composition
  ↓
receipt/delta + autosave + live preview
  ↓
Agent calls capture_frame for visual verification
```

**BYO block generation：**

```text
compose_block_brief
  ↓
Browser returns live composition context
  ↓
Server assembles system/prompt contract
  ↓
User's Agent generates component JSON or HTML/JS
  ↓
apply_block parses + lints + validates + places block
  ↓
preview / capture_frame / export share the resulting composition
```

**客户端导出：**

```text
Composition + local Files
  ↓
assembleHtml + hidden preview iframe + seekTimelines(t)
  ↓
MediaBunny sequentially samples each video source
  ↓
Canvas draws framed video / WebGL cut transition
  ↓
DOM root → SVG foreignObject → image → Canvas overlay
  ↓
audio samples + shot gain/fades + BGM mix
  ↓
MediaBunny encoder → MP4 / MOV / WebM Blob
```

#### 状态模型

| 状态类型 | 位置 | 谁读写 | 生命周期 / 一致性规则 |
|----------|------|--------|------------------------|
| Composition | engine DTO / React state / cloud project | UI、Agent tool executor、project provider | 每次 mutation 使旧 `get_state` 失效；ids 必须从新 state/receipt 获取 |
| Main/insert video bytes | OPFS / File / URL | local import、draft restore、export | blob URL 只活一 session；用 file signature 从 OPFS 重建 |
| Local draft | `localStorage` | workbench autosave/restore | 轻量 state 与大媒体分离；origin 绑定 |
| Cloud project | hosted DB（未公开） | MCP offline tools、project provider、browser autosave | 依赖 user/project ownership 与 revision；实现不可审计 |
| Active browser writer | Durable Object socket + workbench demotion | browser tabs / DO | 每用户一活跃 tool socket；同项目 takeover 后旧 tab 停止 autosave |
| Bridge pending call | DO memory map | `/call` 与 WS reply | 1–600 秒 timeout；late reply 丢弃；tab close fail fast |
| Export runtime | hidden iframe、sample rigs、Canvas、audio buffers | client exporter | 单次导出临时状态；逐帧推进，结束必须 close samples/remove iframe |
| Transcript/plan/visual labels | Composition/project DTO | ASR、Agent、layout tools | transcript source clock；plan 按 sentence index；visual labels 按 sampled frame index |

#### 契约边界

- **内部契约：** `Composition` / `VideoShot` / `Block` / transcript / audio clip；edited↔source 时间映射；tool receipt；preview/export 的 shot/filter/fade semantics。
- **外部 API / MCP 契约：** JSON-RPC streamable HTTP subset；`McpDeps`；OAuth resource；browser WS bridge；import token；media presign/register；provider contracts。
- **Agent-facing Skill / prompt / schema 契约：** companion `pireel` skill；`get_state first`；brief→generate→submit；每次 mutation 后刷新 state；`capture_frame` 验证；`[…CHARGES…]` billing marker。

#### 失败与降级模型

| 失败类型 | 检测方式 | 系统行为 | 降级 / 修复动作 |
|----------|----------|----------|------------------|
| Provider 未配置 | `unavailableProviders()` 抛出精确 hint | 对应生成/ASR/项目能力失败 | 基础本地编辑继续；实现六类 provider |
| Studio tab 未打开 | DO 无 socket | `409 studio_not_open` | 创建 browser handoff 或让用户打开 project |
| Bridge tool 超时 | pending timer | 返回 `tool_timeout`，删除 pending | 刷新 state 后重试；避免盲目重复 mutation |
| 新 tab 抢占 | WS close code 4000 | 旧 bridge 不自动争抢；同项目旧 tab demote autosave | 用户显式 `reclaim()` |
| Tab 中途关闭 | DO socket close | 所有 pending call fail fast | 重新打开 tab，刷新 state |
| OPFS 文件缺失 | restore/heal 检查 | draft 保留但媒体 source 失效或重建 | 重新导入对应 file |
| Block lint 失败 | parse/lint issues | 不应用输出，返回 issues | Agent只修 lint 问题后 re-apply |
| 跨域图片内联失败 | export fetch catch | 图片在导出帧中缺失但不阻断 | 修媒体代理/CORS，预先内联 asset |
| 浏览器 codec 不支持 | WebCodecs/MediaBunny open/encode error | client export 失败 | 改容器/codec/浏览器；托管 fallback 未公开 |
| 不支持的视觉层 | exporter known limits | person matte/PiP 在导出中降级或缺失 | 生产前建立 preview/export parity tests |

#### 可复刻设计不变量

1. **Agent 每次 mutation 后必须重新获取 state；旧 id/时间快照不可继续假定有效。**
2. **所有时间相关工具必须显式标明 edited clock 或 source clock。**
3. **浏览器中修改 composition 的外部调用必须串行；多 tab 必须有单写者。**
4. **preview 与 export 必须读取同一 composition、framing、filter、fade 和 timeline semantics。**
5. **云控制面只路由能力，媒体/React state 留在最合适的浏览器执行器。**
6. **Agent 生成内容先过 schema/lint，再应用；视觉任务必须有 capture-frame 闭环。**
7. **本地大媒体与轻量 draft 分层持久化，session-scoped blob URL 不能直接持久化。**
8. **任何自由 HTML/JS 无论进入预览、缩略图、测量还是导出，都必须消毒并放进 opaque-origin sandbox，或收敛为受限 AST/命令 DSL。**

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 工程模型 | declarative Composition，而非命令录像 | 任意桌面 NLE 状态自由度 | 让 UI、Agent、持久化、preview、export 共享事实对象 |
| 时间模型 | edited/source 双时钟 | 单时间轴的表面简单 | 口播删除、插段、transcript 与源文件定位必须可逆 |
| Agent 执行位置 | browser bridge | 全部 server-side executor 的无头能力 | 复用 React state、MediaPipe、iframe 和本地视频，不上传主视频 |
| 一致性 | 单活 browser socket + serial queue | 多 tab 同时编辑吞吐 | 降低重复执行和 autosave 覆盖风险 |
| Agent 生成 | brief→用户模型→apply | Pireel 全包模型体验 | 降低 credit 消耗，保持外部 Agent 所有权 |
| 预览/导出 | 浏览器同源 | FFmpeg/server render 的兼容与稳定 | 最大化 WYSIWYG 和本地隐私 |
| Overlay 表达 | preset slots + custom HTML/JS | 完全封闭组件系统的安全性 | 给 Agent 足够的视觉表达能力，但引入 XSS/确定性风险 |
| 开源边界 | editor packages + minimal shell | 完整 self-host product | 保留托管业务实现，降低公开面；同时削弱可独立部署性 |

### 值得学习的模式

1. **状态先于 prompt。** `get_state` 不是调试工具，而是 Agent 每次编辑的前置事实源。
2. **brief/apply 二段式。** 服务端提供带 live context 的生成 contract，用户自己的模型产出，系统再验证落地。
3. **视觉闭环。** `capture_frame` 同时给像素和可编辑 block/shot 映射，Agent 能“看见”并修正结果。
4. **Single-writer browser executor。** Durable Object 不复制媒体 runtime，只做每用户路由与 in-flight settlement。
5. **preview/export 同源。** 导出读取 iframe 的实际 computed transform，而不是重新实现一套近似动画。
6. **大媒体与工程状态分层。** OPFS 保存字节，`localStorage` 保存 draft，file signature 负责重连。
7. **音频 seam 微淡化。** splice edge 用 30ms micro-fade，且 preview/export 共用 envelope。
8. **provider seam 明示不可用。** OSS shell 不伪装具备生成能力，未配置时返回准确 hint。

### 反模式 / 踩坑点

1. **“backend-free AI editor”容易被误读。** 基础编辑确实无后端；生成、ASR、云项目、Agent OAuth 和离线 MCP 并非无后端。
2. **自由 HTML/JS 的信任边界不完整。** sandbox preview 做对了，但 normalization/asset thumbnail 又把 HTML 带回主 document；client export 还创建未 sandbox 的同源 iframe，并通过 `new Function` 执行 custom `timelineBody`。
3. **导出 parity 用注释而非 contract 封口。** person matte 和 PiP 已明确不导出，却缺少用户层 capability gate 与 E2E parity matrix。
4. **公开 mirror 没有 CI。** 私有 monorepo 可能有流水线，但外部采用者无法验证每个同步 commit。
5. **超新项目被热度放大。** 十天 834 Stars 是关注度，不是兼容性、恢复能力或安全成熟度。
6. **hosted layer 抽象已公开，实现未公开。** `McpDeps` 给人一种“差最后一点 wiring”的错觉，实际缺的是 auth/DB/storage/tenant 边界。
7. **根依赖集中。** UI/AI/media 依赖主要堆在 root，package-level manifest 对真实运行边界表达不够精确。

### 可借鉴的具体技术点

- `bridge-do.ts` 的单 socket eviction、pending call timeout 和 tab-close fail-fast；
- `use-agent-bridge.ts` 的 promise serial queue 与 same-project autosave demotion；
- `composition-core.ts` 的 `VideoShot`、`cutTransitions()`、audio gain/fade 与 source/edited semantics；
- `client-export.ts` 的 sequential sample stream，避免无 cue WebM 随机 seek 失败；
- overlay DOM → SVG foreignObject → Canvas 的同源 WYSIWYG 路径；
- `import-media.mjs` 的 loopback main-video fast path与短期 import token；
- `McpDeps` 依赖注入，使 JSON-RPC contract 可在无 Cloudflare runtime 下测试；
- `receipt-delta` 用 JSON Patch 压缩 mutation 后 state 变化。

---

## 架构解剖

### 目录结构

```text
pireel/
├── apps/studio-oss/             # minimal Vite shell + unavailable providers + local-assets dev route
├── packages/studio-engine/      # composition、MCP、bridge、server/offline tools、prompts、briefs
├── packages/studio-ui/          # workbench、timeline、Agent bridge、OPFS/draft、client export
├── packages/studio-frames/      # frame/theme packs、locales、design content
├── packages/studio-kit/         # component catalog / kit contract
├── packages/ui/                 # shared React primitives and visual tokens
├── pnpm-lock.yaml               # pnpm v6 lockfile format，含 integrity
└── README*.md                   # OSS shell / provider / Agent boundary
```

companion `pireel/pireel-agent` 独立仓包含：

```text
pireel/.mcp.json                 # hosted OAuth MCP registration
pireel/skills/pireel/SKILL.md    # Agent routing contract
pireel/skills/pireel/references/ # import/edit/storyboard/caption/export playbooks
pireel/skills/pireel/scripts/    # local import + export sink helpers
```

### 技术栈

- **运行时 / UI：** TypeScript、React 19、Vite 8、Tailwind 4、Base UI/Radix、use-intl。
- **媒体：** MediaBunny、WebCodecs、Canvas、SVG foreignObject、WebGL transitions、WebAudio、RNNoise WASM。
- **视觉：** MediaPipe Tasks Vision、ONNX Runtime Web、browser iframe preview。
- **状态：** declarative composition、JSON Patch/diff、`localStorage`、OPFS、cloud project provider。
- **Agent：** 自定义 MCP JSON-RPC pure core、Studio tool registry、external skill、OAuth hosted endpoint、Cloudflare Durable Object bridge。
- **测试：** Vitest；34 个 test/spec files。
- **CI/CD：** 公开仓无 `.github/workflows`；无 tag/release。

### 模块依赖关系

```text
studio-engine composition / prompts / provider contracts
          ↑                    ↑
studio-frames / studio-kit     │
          ↑                    │
studio-ui workbench / tools / export / persistence
          ↑
apps/studio-oss shell

external agent → hosted MCP route → studio-engine/mcp
                               → server-direct project tools
                               → StudioBridge DO → studio-ui runStudioTool
```

`studio-engine` 是逻辑窄腰；`studio-ui` 不是纯 presentation，它也承载浏览器媒体执行器、local storage、visual analysis 和 export data plane。因此把 UI package 当可随意替换的壳会低估耦合。

### 扩展机制

- `StudioProviders`：composer/planner/transcriber/vault/projects/uploads 六类 backend seam；
- frame registry：以 theme pack 扩展 palette/font/layout dialect；
- component kit：声明式 component/props 与 custom markup 两条 block 生成路径；
- `STUDIO_TOOLS`：internal chat 与 MCP 共用 tool catalog；
- MCP `McpDeps`：routing/auth/storage 依赖注入；
- companion skill references：按任务加载 Agent playbook。

---

## 质量与成熟度

### 代码质量

- **类型系统：** 核心 DTO、tool schema、bridge result、export rig、provider contracts 均有明确 TypeScript 类型；大量注释解释时间轴、媒体和一致性不变量。
- **模块边界：** composition core、MCP pure core、DO bridge、UI bridge queue 与 exporter 角色清楚；`studio-ui` 仍偏大，媒体 data plane 和展示层同包。
- **错误处理：** provider unavailable、bridge no-tab/timeout/close、OPFS heal、image inline failure 和 export unsupported path 都有显式降级。
- **安全质量：** preview iframe sandbox 是正确方向；主 document 注入与未 sandbox 导出 iframe 的双旁路破坏了同一安全模型，是当前最严重缺口。
- **可读性：** 注释密度极高且多为真实 gotcha；优点是工程意图清楚，缺点是部分 contract 只存在于注释，没有变成可执行 capability test。

### 测试

- 共 34 个 test/spec 文件：studio-engine 25、studio-frames 3、studio-kit 2、studio-ui 4。
- engine tests 覆盖 trim、composition、audio、block placement/lint、MCP、bridge、import token、server tools、project DTO、receipt delta、prompts。
- UI tests 只覆盖 denoise、audio mix、messages 和 preset elements；没有真实浏览器导出、multi-tab、OPFS restore、MCP OAuth/WS、sandbox/XSS E2E。
- OSS shell 0 tests；companion plugin 0 tests。
- 本轮未安装/执行目标项目，不能把测试文件存在等同于测试当前快照通过。

### CI/CD

- 公开主仓没有 `.github/workflows`；Actions 页面未提供已配置 workflow 的证据。
- 公开仓没有 release、tag、artifact、checksum、SBOM、provenance 或签名流程。
- companion plugin history 提到版本 bump CI，但主仓采用者仍看不到 editor sync 的公开 quality gate。

### 文档质量

- 中英文 README 清楚区分本地能力与 provider 能力，并给出 package layout。
- package README 能解释 engine/UI/kit 的公开边界；源码注释是最强架构文档。
- 不足：没有完整 self-host guide、provider implementation example、hosted threat model、API reference、migration policy、changelog 和 browser support matrix。
- README 的“nothing leaves the browser”只适用于本地 shell；companion import matrix 才准确说明官方 Agent 路径的数据去向。

### Issue / PR 健康度

- 2026-07-30 服务端 HTML显示 0 个公开 issue。
- #2–#5 四个 PR 均已进入 Git history；#3–#5 来自外部贡献者并集中修复 engine/UI 边界，说明项目已出现早期外部参与。
- 十天窗口太短，无法评估 issue 响应、breaking change、release regression 和安全修复 SLA。
- 主维护者 196/200 commits；当前 bus factor 仍为 1。

---

## 社区与生态

### 社区评价

- 约十天获得 834 Stars / 71 Forks，定位“Agent over MCP + browser video editor”具有明显传播力。
- 当前公开社区信号几乎全是热度与少量 PR，缺少用户 issue、release download、长期 discussion、迁移案例和第三方生产案例。
- 本轮 Web 搜索后端未配置、GitHub anonymous REST 配额中途耗尽；因此未把无法核验的社交媒体评价写成事实。

### 衍生项目 / 插件生态

- 官方 `pireel/pireel-agent` 是最重要 companion：Apache-2.0 skill + MCP config + import/export helpers。
- plugin HEAD 为 `24769b3370c5c3afb36eb045dfd84b15b5e01ad7`，30 commits、23 tracked files、0 tests、单维护者。
- 它证明官方 Agent workflow 是真实合同，不是 README 占位；同时也证明完整路径依赖 `pireel.com` hosted MCP/OAuth。
- 暂未发现稳定第三方 provider、frame pack、self-host backend 或插件市场证据。

### 竞品对比

| 项目 | 主要抽象 | 最强项 | 相比 Pireel |
|------|----------|--------|--------------|
| Remotion | React composition → deterministic render | 代码生成视频与成熟渲染生态 | 更适合程序化批量视频；Pireel 更像可视 NLE 和 Agent live editor |
| Motion Canvas | scene graph / generator timeline | 动画和教学可视化 | 代码/动画优先；Pireel 口播剪辑、transcript 和素材工作流更直接 |
| Revideo | TypeScript video generation | server/programmatic video pipeline | 更偏代码渲染；Pireel 更偏浏览器人机协作编辑 |
| OpenCut | browser NLE | 通用剪辑 UI 与 CapCut 替代定位 | 产品层最接近；Pireel 的 MCP brief/apply/capture 与口播模型更鲜明 |
| OpenMontage | Agent + manifest + artifact + gate | 长链 Agent 制片治理 | 适合仓库级 production harness；Pireel 是实时可视编辑器 |
| Pixelle-Video | LLM/TTS/media/template/FFmpeg pipeline | 主题到短视频自动生成 | Pixelle 重自动生成；Pireel 重已有口播视频的可控再编辑 |
| Cap | screen recording product | 录屏、分享和成品体验 | 不是同层 NLE；Pireel 的核心是时间线编辑与 Agent composition |

---

## 关键代码走读

### 1. `Composition` 与双时钟

- 路径：`packages/studio-engine/src/composition-core.ts`、`trim.ts`
- 职责：表达 shots、blocks、captions、audio、theme 和 edited/source mapping。
- 实现要点：`VideoShot` 保留源区间，最终 timeline 由 clips 拼接；B-roll 与主视频平等；shot framing/filter/audio 由同一个对象供 preview/export 读取。

### 2. MCP pure core 与 Browser Bridge

- 路径：`packages/studio-engine/src/mcp.ts`、`bridge-do.ts`、`packages/studio-ui/src/use-agent-bridge.ts`
- 职责：把外部 Agent JSON-RPC 调用可靠路由到活跃浏览器。
- 实现要点：`McpDeps` 隔离 I/O；每用户 DO 只保留一 socket；新的 tab 驱逐旧 tab；browser promise queue 串行 mutation；pending call 有 timeout/close settlement。

### 3. `client-export.ts`

- 路径：`packages/studio-ui/src/client-export.ts`
- 职责：浏览器内完成多源视频、overlay、转场、音频和容器编码。
- 实现要点：视频 sample 顺序推进；实际 preview iframe 的 computed transform 被逐帧复用；overlay 用 SVG foreignObject raster；音频 gain/fade/mix 与 preview semantics 共用。

### 4. Provider 与 OSS shell

- 路径：`packages/studio-engine/src/providers.ts`、`apps/studio-oss/src/providers.ts`
- 职责：明确开源编辑器与托管生成/项目能力之间的 seam。
- 实现要点：六类小 contract；未配置时 fail with hint；基础编辑不伪装成完整 AI product。

### 5. 自由 HTML 边界

- 路径：`packages/studio-engine/src/block-lint.ts`、`assemble.ts`、`packages/studio-ui/src/use-element-ops.ts`、`assets-panel.tsx`、`client-export.ts`
- 职责：解析、测量和展示 Agent/provider 生成的 custom block。
- 实现要点：preview iframe 使用 opaque-origin sandbox；但 lint 未覆盖所有 active-content sink，测量/缩略图会进入主 document，导出 iframe 又未 sandbox 且执行 `timelineBody`。修复应以 sanitizer/Trusted Types/opaque-origin export iframe 或受限 timeline DSL 为 contract，而不是继续追加少数字符串规则。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 4 | 口播剪辑、Agent、主题、音频、导出都很深；完整 AI/provider 和部分 export parity 不开源/不完整 |
| 代码质量 | 4 | 类型与不变量出色，engine tests 扎实；主文档与导出 iframe 的 HTML/JS 边界、UI/E2E 和 package 边界扣分 |
| 文档质量 | 3 | README 和源码注释强；self-host、安全、API、迁移和 browser matrix 不足 |
| 社区活跃度 | 2 | 十天热度高并已有外部 PR，但没有长期治理、issue/release/CI 样本 |
| 架构设计 | 5 | composition、双时钟、MCP bridge、单写者、同源 export 组合具有原创工程价值 |
| 学习价值 | 5 | browser NLE、Agent 编辑、媒体导出和状态契约都值得深读 |
| 可借鉴度 | 4 | engine/bridge/export 模式可复用；AGPL、hosted gap 和安全边界不能照搬 |
| **总分** | **27/35** | **架构强、产品边界聪明，但采用成熟度与可独立部署性明显落后于代码深度** |

---

## 总结

### 一句话评价

Pireel 是一个**代码深度远高于公开项目年龄**的 Agent-native browser video editor：最值得学的是让 Agent 操作结构化 composition 并用真实画面闭环验证，而不是“AI 生成视频”这个标签；当前最不应该忽略的是 hosted backend 缺口、HTML 信任边界、AGPL 和十天成熟度。

### 谁应该用

- 研究 browser-native NLE、WebCodecs/MediaBunny 和 WYSIWYG export 的工程师；
- 研究外部 Agent 如何可靠操作非代码型创作应用的团队；
- 愿意在隔离环境固定 commit、只处理非敏感素材的个人创作者；
- 想复用 composition/trim/audio/bridge 思路，而不是直接复制整套产品的架构团队。

### 谁不应该直接用

- 需要稳定 release、长期兼容、公开 CI/SLA 的生产团队；
- 不能接受 AGPL 网络服务义务的商业产品；
- 需要完全 self-host 且不依赖 Pireel hosted MCP/OAuth 的企业；
- 处理客户隐私视频、未成年人内容、商业机密素材但尚未完成数据路径与 XSS 审计的团队；
- 需要 Safari/Firefox 一致导出、person matte/PiP 完整 export parity 的用户。

### 下一步

1. 上游优先修复 custom HTML/JS 双旁路：主文档入口加 sanitizer/Trusted Types，导出改为 opaque-origin sandbox + postMessage 或受限 timeline DSL，并添加回归测试；
2. 为公开 mirror 增加 CI、Chromium export E2E、multi-tab/cloud conflict tests 和 security policy；
3. 发布 self-host provider 示例，并清楚说明 hosted-only routes；
4. 给导出能力建立 feature parity matrix，UI 在不支持时明确 fail closed；
5. 生产评估至少等待数个 release 周期、真实 issue/PR 处理样本和安全修复记录；
6. 架构复刻优先保留 composition、双时钟、single-writer、brief/apply/capture 和 preview/export 同源五个不变量。
