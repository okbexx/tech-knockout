# UI-TARS-desktop

> 一句话定位：`bytedance/UI-TARS-desktop` 现在仍然是 ByteDance 的 **Multimodal AI Agent Stack** 总仓：同仓承载 Agent TARS、UI-TARS Desktop、GUI Agent SDK、Operator 家族、browser / MCP / remote infra。若聚焦 UI-TARS Desktop，它最有价值的部分仍不是 Electron 壳，而是 `GUIAgent Loop + VLM Model Adapter + Action Parser + Operator Port` 这套可复刻的 GUI / computer-use runtime；但当前主分支推进很慢、release 与 app package 口径长期分离、remote 文档与源码边界仍漂移，所以更适合 PoC / 研究 / 架构学习，而不是省心生产底座。

## 基本信息

| 项目 | 值 |
|------|----|
| 仓库 | `bytedance/UI-TARS-desktop` |
| URL | `https://github.com/bytedance/UI-TARS-desktop` |
| Star | 37,765（2026-07-07 GitHub API 快照） |
| Fork | 3,801（2026-07-07 GitHub API 快照） |
| Watchers | 278（2026-07-07 GitHub API 快照） |
| 许可证 | Apache-2.0 |
| 主要语言 | TypeScript；其次 MDX / JavaScript / CSS / Less / HTML / Shell / Dockerfile |
| 默认分支 | `main` |
| GitHub 创建时间 | 2025-01-19 |
| 本地首次提交 | `dee6f8f1` / 2025-01-21 / `feat(ui-tars-desktop): initialize` |
| 当前 HEAD | `c2ad42e3eb9b` / 2026-07-01 / `fix(mcp-http-server): default host to 127.0.0.1, not all interfaces (#1918)` |
| GitHub pushed_at | 2026-07-01T03:03:19Z |
| 最新 GitHub Release | `v0.3.0` / 2025-11-04；注意该 release 更偏 Agent TARS CLI，不应简单等同 UI-TARS Desktop App 版本 |
| 最新 Git tag | `pdk@0.0.6-beta.3` / 2025-12-15；这是仓库内其他 package/tag 轨道，不代表 Desktop App 版本 |
| UI-TARS Desktop App 版本 | `apps/ui-tars/package.json` = `0.2.4` |
| `@ui-tars/*` 包版本 | `packages/ui-tars/sdk` / `packages/ui-tars/action-parser` 等仍为 `1.2.3` |
| 贡献者 | 本地 `git shortlog -sn --all` 56；头部：chenhaoli 1845、ULIVZ 631、jinxin001 250、Charles 192 |
| Issue / PR | repo API `open_issues_count=406` 含 PR；按 2026-07-07 open PR 88 推算 open issue 318 |
| 仓库体量 | 2,491 tracked files；TypeScript 1,158，TSX 282，MD/MDX 310，JSON 236；test-like tracked files 约 163 |
| GitHub workflows | 8 个：test、e2e-ui-tars、release-ui-tars、agent_tars_test、benchmark、secretlint、secret-scan、scorecard |
| 分析日期 | 2026-07-07 |
| 分析边界 | 只做源码、文档、Git 历史、GitHub API / Release / Issue / PR 静态分析；未安装依赖、未运行项目、未跑测试/构建 |

## 版本变化速读（相对 2026-05 旧报告）

旧报告结论“观望（生产）/ 推荐（PoC、研究、架构学习）”仍成立，而且这段时间新的证据让这个判断更稳了：

1. **仓库定位仍是总仓而非单 App**：README 当前第一句仍是 `TARS is a Multimodal AI Agent stack`，Agent TARS 与 UI-TARS Desktop 并列；报告不能退回去把整个仓库只写成桌面 App。
2. **UI-TARS Desktop 主链没有换心脏**：`apps/ui-tars` + `packages/ui-tars/sdk` + `packages/ui-tars/action-parser` + `operators/*` 的核心抽象没变，`GUIAgent.run()` 仍是最值得学习的心脏。
3. **热度继续涨，但主分支推进很慢**：Star 从 36.6k 增到 37.8k、Fork 从 3.7k 增到 3.8k；但从旧报告记录的 `e9f33872` 到当前 `c2ad42e3`，`main` 只新增了 1 个提交。
4. **这 1 个新增提交是安全收口，不是功能扩张**：当前 HEAD `fix(mcp-http-server): default host to 127.0.0.1, not all interfaces (#1918)` 说明仓库仍在做边界收紧，而不是全面加速功能演进。
5. **Release / package 口径继续分裂**：GitHub latest release 仍是 `v0.3.0`（2025-11-04，偏 Agent TARS CLI 轨道），而 UI-TARS Desktop App package 仍是 `0.2.4`；仓库还存在 `pdk@...` tag 轨道，选型时必须区分“总仓 release”与“具体产品线版本”。
6. **remote 文档漂移依然存在**：`docs/quick-start.md` 仍写“Remote Operator service will be discontinued on August 20, 2025”，但 README 继续宣传 remote computer / browser operator，源码也仍保留 remote proxy/operator 主链。真实边界必须以源码 + 当前服务状态复核。
7. **安全与审计需求没有消失**：`apps/ui-tars/src/main/services/runAgent.ts` 的 `onError` 仍直接把 `settings` 打进日志，而 `settings` schema 含 `vlmApiKey`；这类问题说明它仍更像研究/PoC 底座，而不是默认安全的生产执行面。

---

## 场景一：是否值得采用

### 解决的问题

UI-TARS-desktop 解决的是：**多模态模型如何稳定地看见 GUI、生成动作、把动作落到本地电脑 / 浏览器 / 远程环境，并把每一步变成可展示、可中断、可复用的 agent loop**。

它不是普通聊天桌面端，也不是单一 browser automation 库。它把 GUI agent 拆成三类资产：

1. **终端产品**：`apps/ui-tars` 是 Electron 桌面应用，负责设置、权限、窗口、IPC、状态展示、远程/本地 operator 选择。
2. **运行时内核**：`packages/ui-tars/sdk` 提供 `GUIAgent`、`UITarsModel`、核心类型与状态流。
3. **能力后端**：`packages/ui-tars/operators/*`、`packages/agent-infra/*`、`apps/ui-tars/src/main/remote/*` 提供本地电脑、本地浏览器、远程电脑、远程浏览器、BrowserBase、ADB 等执行面。

对于个人和团队的选型语境，它最值得被当成两类东西看：

- **采用视角**：GUI Agent / computer-use PoC 底座，适合隔离试用，不适合直接无脑生产化。
- **学习视角**：非常好的 GUI agent runtime 解剖样本，尤其是“模型输出如何变成 OS/browser side effect”。

### 核心能力与边界

**能做什么：**

- 提供 UI-TARS Desktop：本地 computer operator、本地 browser operator、remote computer / browser operator 的桌面入口。
- 提供 `@ui-tars/sdk`：`GUIAgent<T extends Operator>` 可在 Node/Web 环境中用自定义 operator 执行 GUI agent loop。
- 用 `Operator` 抽象统一 `screenshot()` 与 `execute()`，让本地电脑、浏览器、远程沙箱、ADB 等不同后端共享同一个 agent loop。
- 支持 OpenAI-compatible Chat Completions 与 Responses API，包含图像预处理、滑窗、`previous_response_id`、UI-TARS 版本差异处理。
- 用 `@ui-tars/action-parser` 把模型返回的 action grammar 转成 `PredictionParsed` / `ActionInputs` / screen coords。
- Electron main process 中有系统权限、浏览器可用性、AbortController、pause/resume/stop、消息状态、prediction marker 等产品级胶水。
- 同仓提供 Agent TARS / multimodal / MCP / browser infra 等更宽栈能力，适合观察 ByteDance 对 multimodal agent stack 的整体工程方向。

**不能或不应高估的部分：**

- 不能把 GUI automation 的固有不确定性抹掉：焦点、置顶窗口、坐标缩放、多显示器、DPR、输入法、系统权限、browser profile 都是硬问题。
- 不是通用 personal AI OS：它没有 OpenHuman 那种长期记忆、session DB、run ledger、connector/vault 的完整 personal context layer；核心是 GUI / browser / remote 操作。
- 不是企业生产级 RPA 替代品：缺少任务可重放、强审计、安全审批、策略沙箱、rollback、deterministic execution plan 等生产 RPA 必需件；仓库当前的安全修补与 release 口径漂移也说明这条线仍需大量补课。
- Remote operator 依赖外部 backend contract：`apps/ui-tars/src/main/remote/*` 通过 `/api/v1/register`、`/api/v1/proxy/*`、`/api/v1/browsers`、`/api/v1/time-balance` 等端点工作；是否可用取决于官方服务 / 自建服务，而不只是本地代码。
- 文档存在版本口径漂移：README、quick-start、release、app package version、Agent TARS CLI version 需要分开核验。

**与竞品差异：**

- 相比 `browser-use`：UI-TARS-desktop 不只控制浏览器，而是把本地电脑、浏览器、远程电脑、远程浏览器放进同一 `Operator` 端口；代价是复杂度和平台摩擦更高。
- 相比 `stagehand` / Playwright-first 工具：UI-TARS 走视觉 grounding + GUI action grammar，更适合真实 GUI，不适合追求 deterministic DOM automation 的场景。
- 相比 OpenHuman：OpenHuman 是 personal AI OS / desktop agent harness，重在记忆、工具、workflow、run ledger；UI-TARS-desktop 是 GUI agent execution stack，重在看屏幕和执行动作。
- 相比 OpenHands / OpenInterpreter：后者偏 coding / terminal / shell agent；UI-TARS 的独特性是 visual GUI loop。
- 相比闭源 Computer Use 产品：闭源产品体验可能更完整，但 UI-TARS-desktop 的源码可读、operator 可替换、学习价值更高。

### 集成成本

- **依赖链：** Node.js >=20、pnpm 9.10、Turbo、Electron 34、electron-vite、electron-forge、React、Zustand、Vitest、Playwright、Jimp、OpenAI SDK、nut-js、agent-infra browser/MCP/search 包。桌面端还依赖 macOS Accessibility / Screen Recording 权限、Chrome/Edge/Firefox 等浏览器。
- **仓库复杂度：** 2,491 tracked files；`apps/`、`packages/ui-tars/`、`packages/agent-infra/`、`multimodal/` 同仓。只想改 Desktop App 时，很容易被 Agent TARS / Tarko / Omni-TARS / benchmark 噪音干扰。
- **从零到 demo：** 文档路径清楚，但真实 demo 取决于 VLM provider、API key、模型是否支持 UI-TARS action format、系统权限、浏览器和 remote backend。保守估计：纯阅读/配置 30-60 分钟；稳定跑真实任务需要更久。
- **二次开发成本：** 如果只用 `@ui-tars/sdk` + 自定义 operator，成本中等；如果 fork 整个 desktop / remote / Agent TARS stack，成本高。
- **生产化成本：** 高。需要补安全审批、执行审计、任务 replay、凭证保护、日志脱敏、provider compatibility matrix、跨平台回归、多显示器与 DPI 场景。


### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键库 / SDK。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| `electron 34` + `electron-vite` + `electron-forge` | desktop host / packaging | 桌面宿主、IPC、打包分发、权限桥接、自动更新 | 把 GUI agent 做成真正可安装的桌面产品，而不是浏览器 demo | `apps/ui-tars/package.json` | 想把 computer-use 做成原生桌面产品时很有借鉴价值 | 跨平台打包、权限、签名、回归成本都高 |
| `@ui-tars/sdk` (`GUIAgent`) | runtime SDK | GUI agent loop、pause/resume/stop、history、status stream | 把截图→模型→动作→执行串成统一状态机 | `packages/ui-tars/sdk/src/GUIAgent.ts` | 这是仓库最值得抽象复用的核心 | GUI loop 天生脆弱，状态机复杂度会持续增长 |
| `openai` SDK + Responses / Chat Completions 双栈 | model adapter | VLM provider 兼容、图像窗口、`previous_response_id`、token/time 统计 | 让同一 agent loop 兼容 UI-TARS、Doubao、HF、自定义 OpenAI-compatible endpoint | `packages/ui-tars/sdk/src/Model.ts` | “视觉 agent 先统一模型适配层”很值得学 | provider 差异、日志体积、图像窗口和响应链都容易出边角问题 |
| `@ui-tars/action-parser` | action grammar parser | 将模型输出解析为 `PredictionParsed` / 坐标 / 动作参数 | 把 VLM 文本输出变成可执行 GUI 契约 | 报告架构走读 + `packages/ui-tars/action-parser` | 对所有 GUI agent 都是通用核心模式 | 一旦 parser 假设与模型输出偏离，就会直接误操作 |
| `@ui-tars/operator-nut-js` + `@ui-tars/operator-browser` | operator backends | 本地电脑 / 本地浏览器执行后端 | 用同一个 `Operator` 端口承接 OS 与 browser side effect | `apps/ui-tars/package.json` + old report code walk | “统一 operator port”是整仓最强复用点之一 | OS 权限、坐标、浏览器状态、焦点问题都会集中暴露 |
| `packages/agent-infra/mcp-http-server` + `jose` | local infra / auth | MCP HTTP server、本地/远程认证、host 绑定 | 把 GUI agent 生态扩展到 MCP / remote infra，同时尝试补安全边界 | `packages/agent-infra/mcp-http-server/src/startServer.ts`、`apps/ui-tars/package.json` | GUI agent 与 MCP / remote tooling 拼装方式值得参考 | 当前主分支最新提交都还在修默认 host，说明这条边界仍需谨慎 |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | 低 | Apache-2.0，商用友好；仍需核对模型权重、外部服务、第三方包许可证 |
| Bus factor | 中 | 本地 shortlog 56 位作者，但头部贡献高度集中在 chenhaoli、ULIVZ 等核心维护者 |
| 供应商 / backend 锁定 | 中 | SDK 支持 OpenAI-compatible API，但 GUI action 质量仍依赖特定 VLM；remote operator 依赖 `/api/v1` backend contract |
| 主线维护趋势 | 中-高风险 | 热度高、open PR 88，但自旧报告 HEAD 到现在 `main` 只新增 1 个提交；“社区很热”不等于“主线快速消化” |
| Release / 版本口径漂移 | 高 | latest release 仍是 `v0.3.0`，Desktop App package 仍是 `0.2.4`，仓库还存在 `pdk@...` tag 轨道 |
| 安全攻击面 | 中-高 | 本地屏幕、键鼠控制、浏览器、远程沙箱、设备注册、JWT auth、model API key、IPC、MCP HTTP server、日志都在攻击面内 |
| 日志泄露风险 | 中-高 | `apps/ui-tars/src/main/services/runAgent.ts` 的 `onError` 仍把 `settings` 直接打日志，而 `settings` schema 含 `vlmApiKey` |
| GUI 执行稳定性 | 高 | quick-start 仍明确只支持 single monitor；GUI 自动化天然受焦点、DPR、权限、浏览器状态、多显示器影响 |
| 文档漂移 | 中-高 | `docs/quick-start.md` 仍写 remote operator service 将于 2025-08-20 discontinued，但 README 和源码仍保留 remote operator 叙事与实现 |
| 测试可信度 | 中-高 | CI 有 test / e2e / secret scan / scorecard，但本次未运行；而 GUI/E2E 天生高度依赖平台环境 |

### 结论

**结论：生产采用观望；PoC / 研究 / 架构学习推荐；SDK / Operator 可隔离复用。**

理由：

1. **它的内核是真东西**：`GUIAgent.run()`、`UITarsModel.invoke()`、`actionParser()`、`Operator.screenshot/execute` 形成了完整 GUI agent runtime，不是 README demo。
2. **它的产品化边界还不够硬**：安全审批、日志脱敏、任务 replay、执行审计、remote backend contract、跨平台稳定性都需要二次收敛。
3. **它最适合做内部原型和架构参照**：如果目标是验证“模型控制电脑/浏览器”是否能跑通，它是高价值样本。
4. **不要整仓照搬**：实际落地优先抽 `@ui-tars/sdk` / `@ui-tars/action-parser` / operator 思路，而不是直接 fork 整个 TARS monorepo 当产品底座。

---

## 场景二：技术架构学习

### 核心架构图

```text
User instruction / Desktop UI
  │
  ▼
Electron Renderer
apps/ui-tars/src/renderer/src/hooks/useRunAgent.ts
  - permission precheck
  - history -> sessionHistoryMessages
  - api.setInstructions / setMessages / runAgent
  │ IPC
  ▼
Electron Main Control Plane
apps/ui-tars/src/main/ipcRoutes/agent.ts
apps/ui-tars/src/main/services/runAgent.ts
  - thinking / AbortController / status
  - SettingStore
  - choose LocalComputer / LocalBrowser / RemoteComputer / RemoteBrowser
  - build model config + system prompt
  │
  ▼
GUI Agent Runtime
packages/ui-tars/sdk/src/GUIAgent.ts
  loop:
    operator.screenshot()
      ↓
    toVlmModelFormat + processVlmParams
      ↓
    UITarsModel.invoke()
      ↓
    actionParser(prediction)
      ↓
    operator.execute(parsedPrediction)
      ↓
    StatusEnum: running / pause / call_user / end / user_stopped / error
  │
  ├────────────── Model Plane ──────────────┐
  ▼                                         ▼
packages/ui-tars/sdk/src/Model.ts      External VLM Provider
  - OpenAI Chat Completions             - OpenAI-compatible endpoint
  - Responses API                       - UI-TARS / Doubao / HF / custom
  - image resize/compress               - previous_response_id support
  - responseId/headImageContext
  │
  └──────────── Execution Plane ─────────────
          │
          ├─ Local Computer: @ui-tars/operator-nut-js -> OS screen / mouse / keyboard
          ├─ Local Browser: @ui-tars/operator-browser -> browser page/CDP + UIHelper
          ├─ Remote Computer: apps/ui-tars/src/main/remote -> /api/v1/proxy/*
          └─ Remote Browser: createRemoteBrowserOperator -> remote browser/CDP
```

### 底层技术架构

#### 最小架构内核

> UI-TARS-desktop 可复刻的最小内核是：`Visual Snapshot Contract + VLM Model Adapter + Action Grammar / Parser + Operator Port + Agent Loop State Machine + Desktop Permission / IPC Control Plane`。

这几个抽象缺一不可：

- 没有 **Visual Snapshot Contract**，模型不知道当前 GUI 状态。
- 没有 **VLM Model Adapter**，不同 provider / API / 图片窗口无法统一。
- 没有 **Action Grammar / Parser**，模型输出只是文本，无法变成执行语义。
- 没有 **Operator Port**，本地电脑、浏览器、远程环境无法共享同一个 loop。
- 没有 **Agent Loop State Machine**，系统无法处理 pause、stop、max loop、call_user、finished、retry、error。
- 没有 **Desktop Permission / IPC Control Plane**，桌面产品无法安全连接 UI、系统权限、执行后端与模型配置。

#### 核心抽象

| 抽象 | 源码位置 | 职责 | 关键字段 / 方法 | 为什么重要 |
|------|----------|------|-----------------|------------|
| `GUIAgent<T extends Operator>` | `packages/ui-tars/sdk/src/GUIAgent.ts` | GUI agent 主循环与状态机 | `run()`、`pause()`、`resume()`、`stop()`、`onData`、`onError`、`maxLoopCount`、`previousResponseId` | 全系统心脏，串起截图、模型、解析、执行、状态回调 |
| `Operator` | `packages/ui-tars/sdk/src/types.ts` | 执行后端端口 | `screenshot()`、`execute(params)`、`MANUAL.ACTION_SPACES` | 把 local computer / browser / remote / ADB 做成可替换后端 |
| `UITarsModel` | `packages/ui-tars/sdk/src/Model.ts` | VLM provider 适配 | `invoke()`、`invokeModelProvider()`、`useResponsesApi`、`headImageContext`、`factors` | 屏蔽 Chat Completions / Responses API / 图片预处理 / token 统计差异 |
| `PredictionParsed` / `ActionInputs` | `packages/ui-tars/shared/src/types/agent.ts` | 模型动作的中间表示 | `action_type`、`action_inputs`、`thought`、`reflection`、`start_coords`、`end_coords` | 把自然语言/函数式 action 转成可执行契约 |
| `actionParser()` | `packages/ui-tars/action-parser/src/actionParser.ts` | 动作语法解析与坐标归一化 | `parseActionVlm()`、`parseAction()`、`smartResizeForV15()` | 处理 UI-TARS 1.0/1.5、不同比例、`<bbox>`/`<point>` 格式 |
| `GUIAgentData` / `Conversation` | `packages/ui-tars/shared/src/types/data.ts` | UI 与 runtime 的状态/消息契约 | `status`、`conversations`、`screenshotContext`、`predictionParsed`、`timing` | `onData` 不是随意 log，而是 agent UI 可消费的 delta 状态流 |
| `agentRoute` / `GUIAgentManager` | `apps/ui-tars/src/main/ipcRoutes/agent.ts` | Electron IPC 控制入口 | `runAgent`、`pauseRun`、`resumeRun`、`stopRun`、`setMessages`、`setInstructions` | renderer 不直接控制系统能力，所有 run lifecycle 经 main process 汇聚 |
| `SettingStore` / `PresetSchema` | `apps/ui-tars/src/main/store/setting.ts`、`validate.ts` | 配置控制面 | `vlmBaseUrl`、`vlmApiKey`、`vlmModelName`、`operator`、`maxLoopCount`、`loopIntervalInMs` | provider、operator、loop 策略和 preset 都必须结构化，否则不可复现 |
| `RemoteComputer` / `ProxyClient` | `apps/ui-tars/src/main/remote/*` | 远程电脑 / 浏览器 backend contract | `/MoveMouse`、`/ClickMouse`、`/TakeScreenshot`、`/GetScreenSize`、`getSandboxInfo()`、JWT header | 把“本地 GUI loop”延伸到 remote sandbox，但引入服务端依赖和认证边界 |

#### 控制面 / 数据面

**Control Plane：**

- `useRunAgent.ts`：用户输入、历史压缩、权限前置、IPC 调用。
- `agentRoute`：run/pause/resume/stop、`thinking` gate、AbortController、主进程状态。
- `runAgent.ts`：读取 settings、选择 operator、选择 model config、拼 system prompt、设置 retry / max loop。
- `SettingStore` / `PresetSchema`：provider、operator、loop interval、search engine、preset import。
- `systemPermissions.ts` / `browserCheck.ts`：OS 权限和浏览器可用性。
- `GUIAgent` 状态机：loop count、snapshot error count、pause/resume/stop、terminal status。
- `remote/auth.ts`：设备注册、本地 RSA key、JWT header、remote 请求认证。

**Data Plane：**

- `operator.screenshot()`：本地屏幕、浏览器 viewport、远程屏幕截图。
- `Jimp` / `preprocessResizeImage()`：图片解码、压缩、缩放。
- `UITarsModel.invoke()`：调用外部 VLM provider，消费 token / time。
- `actionParser()`：解析动作与坐标。
- `operator.execute()`：鼠标、键盘、浏览器 DOM/CDP、远程 proxy API side effect。
- `showPredictionMarker()` / `markClickPosition()`：执行反馈与可视化标记。

这个项目的核心分层是清楚的：UI 和配置在控制面，截图/模型/执行在数据面。但安全审批、执行审计、任务 replay 还没有形成和 GUIAgent 同级的一等控制面，这是生产化前最大缺口。

#### 关键执行链路

**链路 A：本地电脑 GUI agent loop**

```text
Renderer useRunAgent.run(value, history)
  ↓
api.setInstructions / api.setMessages / api.setSessionHistoryMessages
  ↓
agentRoute.runAgent()
  - create AbortController
  - thinking=true
  ↓
main/services/runAgent.ts
  - SettingStore.getStore()
  - operator = new NutJSElectronOperator()
  - modelConfig = { baseURL, apiKey, model, useResponsesApi }
  - systemPrompt = getSpByModelVersion(..., operatorType='computer')
  ↓
new GUIAgent({ operator, model, retry, maxLoopCount, onData, onError })
  ↓
GUIAgent.run()
  - operator.screenshot()
  - Jimp decode screenshot size + scaleFactor
  - toVlmModelFormat() + processVlmParams()
  - UITarsModel.invoke()
  - actionParser()
  - operator.execute({ parsedPrediction, screenWidth, screenHeight, factors })
  ↓
StatusEnum.END / CALL_USER / ERROR / USER_STOPPED
  ↓
onData delta -> main store -> renderer messages
```

**链路 B：本地浏览器 operator**

```text
settings.operator = LocalBrowser
  ↓
checkBrowserAvailability()
  - DefaultBrowserOperator.hasBrowser()
  - store.browserAvailable = true/false
  ↓
DefaultBrowserOperator.getInstance(..., searchEngine)
  ↓
BrowserOperator.screenshot()
  - getActivePage()
  - getDeviceScaleFactor()
  - UIHelper.highlightClickableElements()
  - page.screenshot({ captureBeyondViewport:false, type:'jpeg', quality:75 })
  ↓
VLM prediction -> actionParser -> BrowserOperator.execute()
  - showActionInfo()
  - onOperatorAction hook
  - parseBoxToScreenCoords()
  - page.mouse / page.keyboard / navigation / scroll
  ↓
cleanupTemporaryVisuals / status callback
```

**链路 C：Remote Computer / Browser operator**

```text
settings.operator = RemoteComputer / RemoteBrowser
  ↓
ProxyClient.getRemoteVLMResponseApiSupport()
ProxyClient.getRemoteVLMProvider()
getAuthHeader()
  ↓
modelConfig = { baseURL: FREE_MODEL_BASE_URL, apiKey:'', model:'', useResponsesApi }
remoteModelHdrs = JWT headers
  ↓
RemoteComputerOperator.create()
  - ProxyClient.getSandboxInfo()
  - new RemoteComputer(sandBoxId)
  ↓
GUIAgent.run(..., remoteModelHdrs)
  ↓
RemoteComputer.screenshot()/execute()
  - /api/v1/proxy/GetScreenSize
  - /api/v1/proxy/TakeScreenshot
  - /api/v1/proxy/MoveMouse / ClickMouse / TypeText / Scroll
```

**链路 D：失败 / 停止路径**

```text
User clicks stop / API abort / model abort / max loop / screenshot failures
  ↓
AbortController.abort() or GUIAgent.stop()
  ↓
GUIAgent loop checks signal/isStopped/status
  ↓
StatusEnum.USER_STOPPED or ERROR
  ↓
finally:
  - model.reset()
  - if USER_STOPPED: operator.execute(action_type='user_stop')
  - onData({ conversations: [] })
  - if ERROR: onError({ data, error })
  ↓
main store: status/errorMsg/thinking=false
```

#### 状态模型

| 状态类型 | 位置 | 谁读写 | 生命周期 / 一致性规则 |
|----------|------|--------|------------------------|
| 用户设置 | `ElectronStore`，`SettingStore`，store name `ui_tars.setting` | main process 读写；renderer 通过 IPC/API 间接更新 | 持久化；含 model/provider/operator/max loop/preset；需注意 `vlmApiKey` 日志脱敏 |
| Preset schema | `apps/ui-tars/src/main/store/validate.ts` | `importPresetFromUrl/Text` 写入；`zod` 校验 | 持久配置边界；URL/API key/model/operator 必填或受约束 |
| 本地设备 key | `~/.ui-tars-desktop/local_public_v2.pem` / `local_private_v2.pem` | `remote/auth.ts` 生成/读取 | 持久；目录 0700、私钥 0600；remote 注册与 JWT 用 |
| App runtime state | `apps/ui-tars/src/main/store/types.ts` 的 `AppState` | agentRoute、runAgent、renderer hooks | 运行时；`status`、`messages`、`abortController`、`thinking`、`browserAvailable` |
| Agent loop state | `GUIAgent.ts` 内部变量 | `GUIAgent.run()` | 单次 run；`loopCnt`、`snapshotErrCnt`、`previousResponseId`、`totalTokens`、`isPaused/isStopped` |
| Model response state | `UITarsModel.headImageContext` | Responses API path 读写 | 单 model instance；管理 image sliding window 与 `responses.delete()` |
| Browser state | `BrowserOperator.currentPage`、browser profile/page | BrowserOperator / agent-infra browser | 运行时外部状态；active page 切换、deviceScaleFactor、UIHelper temporary visuals |
| Remote sandbox state | Proxy backend / sandbox id / browser id | `ProxyClient`、`RemoteComputer` | 外部状态；本地仅持有 id 和 auth header；backend 可用性决定执行成功 |
| Conversation telemetry | `GUIAgentData.conversations` / `onData` delta | GUIAgent 生产，main store/renderer 消费 | delta 契约；不是每次全量历史；用于 UI 展示与后续 history transform |

#### 契约边界

**内部契约：**

- `Operator.screenshot(): Promise<ScreenshotOutput>`：返回 `{ base64, scaleFactor }`。
- `Operator.execute(params: ExecuteParams): Promise<ExecuteOutput>`：消费 `prediction`、`parsedPrediction`、screen size、DPR、model coordinate factors。
- `Model.invoke(params: InvokeParams): Promise<InvokeOutput>`：返回 raw prediction、parsed predictions、cost time/token、response id。
- `StatusEnum`：`init / running / pause / end / call_user / user_stopped / error` 是 UI 与 runtime 的共同语言。
- `PredictionParsed`：`action_type` + `action_inputs` 是模型到执行器的最小 IR。

**外部 API / IPC / backend 契约：**

- Electron IPC：`runAgent`、`pauseRun`、`resumeRun`、`stopRun`、`setInstructions`、`setMessages`、`clearHistory`。
- OpenAI-compatible VLM：Chat Completions 与 Responses API；Responses API path 还依赖 `previous_response_id` 和可删除 response。
- Remote backend：/api/v1/register、/api/v1/proxy/*、/api/v1/browsers、/api/v1/time-balance；请求头包含设备 ID、时间戳与已脱敏的鉴权 token。
- Browser/CDP：`@agent-infra/browser` 的 `Page`、`BrowserInterface`、`RemoteBrowser`。
- OS input：`@computer-use/nut-js`、macOS screen capture / accessibility permission。
- Preset YAML：`vlmBaseUrl`、`vlmApiKey`、`vlmModelName`、`operator`、`language`、`maxLoopCount`、`loopIntervalInMs` 等。

**Agent-facing 契约：**

- `Operator.MANUAL.ACTION_SPACES` 注入 system prompt，定义模型允许输出的动作空间。
- 典型动作：`click(start_box='[x1,y1,x2,y2]')`、`drag(...)`、`hotkey(key='')`、`type(content='')`、`scroll(...)`、`wait()`、`finished()`、`call_user()`。
- `actionParser` 支持 `Action:`、`Thought:`、`Reflection:`、`Action_Summary:`、`<bbox>`、`<point>` 等多种模型输出格式。
- `finished` / `call_user` 是终止或转人工的 agent-facing terminal action，不只是普通 UI 状态。

#### 失败与降级模型

| 失败类型 | 检测方式 | 系统行为 | 降级 / 修复动作 |
|----------|----------|----------|------------------|
| 缺 macOS 权限 | `ensurePermissions()`、`hasScreenCapturePermission()`、`getAuthStatus('accessibility')` | 打开系统设置 / 包装 warning / 返回 permission state | fail-closed；提示用户授权 |
| 浏览器不可用 | `DefaultBrowserOperator.hasBrowser()` | `StatusEnum.ERROR` + `Browser is not available` | fail-closed；安装 Chrome/Edge/Firefox |
| 截图失败 / 非法图片 | `Jimp.fromBuffer()` 后 width/height 为空；`snapshotErrCnt` | sleep 后重试；超过阈值 `SCREENSHOT_RETRY_ERROR` | retry -> error |
| 模型调用失败 | OpenAI SDK error / abort / empty prediction | `INVOKE_RETRY_ERROR`；abort 走 bail | retry；用户 stop 不当成普通错误 |
| action parse 失败 | `parseAction()` catch 后返回 null；可能 action_type 为空 | parsedPredictions 为空或 unsupported action | 目前偏弱，容易静默；生产化应强类型错误 |
| 执行动作失败 | `operator.execute()` throw | `EXECUTE_RETRY_ERROR` | execute retry 默认 1；最终 error |
| loop 不收敛 | `loopCnt >= maxLoopCount` | `REACH_MAXLOOP_ERROR` | fail-closed；需要更好任务分解或 call_user |
| remote backend 失败 | `fetchWithAuth()` HTTP !ok / fetch throw | retry 1 次；抛 `FetchError` | backend contract 风险；需 doctor/health check |
| 用户停止 | AbortController / `GUIAgent.stop()` | `USER_STOPPED`；finally 执行 `user_stop` action | 可中断；但 operator 对 `user_stop` 支持不一 |
| 坐标/DPR 漂移 | issue / click marker offset / scaleFactor path | 点击偏移或操作失败 | 需要 platform regression、multi-monitor/DPR tests |
| 敏感日志 | `logger.error('[onGUIAgentError]', settings, error)` | settings 可能含 `vlmApiKey` | 生产化前必须脱敏，不应只靠日志级别 |

#### 可复刻设计不变量

1. **先定义 Operator 端口，再实现具体后端**：任何 GUI agent 都应先固定 `screenshot()` / `execute()` 契约，而不是把鼠标键盘写死在 loop 里。
2. **模型输出必须经过中间表示**：raw text 不应直接执行；必须有 `PredictionParsed` / `ActionInputs` / coords 这种 IR。
3. **Action grammar 必须进入 prompt contract**：`MANUAL.ACTION_SPACES` 与 parser 要共同演进，否则模型会输出执行器不理解的动作。
4. **截图上下文必须带尺寸和 DPR**：GUI 坐标不是纯文本问题；`screenWidth/screenHeight/scaleFactor/factors` 是核心状态。
5. **Agent loop 必须是状态机**：running / pause / stop / call_user / finished / error / max_loop 都要一等建模。
6. **Control plane 不直接做 side effect**：UI/IPC/setting 负责选择和调度，真正执行放在 operator 数据面。
7. **Provider adapter 与 action parser 解耦**：API 形态变化不应迫使执行器变化；模型版本差异放在 adapter/parser。
8. **失败要分类，不要只有 generic exception**：截图、模型、解析、执行、环境、max loop 的修复策略不同。
9. **桌面 agent 必须把权限和外部状态当一等公民**：屏幕录制、辅助功能、浏览器、remote sandbox、provider 都要有 health/availability 信号。
10. **生产化必须补审计层**：GUI agent 的关键问题不是“能不能点”，而是“为什么点、谁批准、能否回放、错了如何追责”。

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 单 App vs 多栈 monorepo | 选择 TARS stack monorepo | 小仓库低认知成本 | ByteDance 显然要沉淀 Agent TARS + UI-TARS + infra，而非只维护桌面壳 |
| Runtime 是否独立 | `@ui-tars/sdk` 独立于 Electron App | 初期开发速度 | 让 GUIAgent 可被 CLI、Web、外部 operator 复用 |
| 执行后端怎么扩展 | `Operator` 抽象 | 每个平台直接分支最简单 | GUI / browser / remote / ADB 差异大，端口化是唯一长期方案 |
| 模型接入 | OpenAI-compatible + Responses API | 单 provider 的稳定性 | 兼容更多 VLM provider，但也引入 version / response state 复杂度 |
| 浏览器截图 | highlight clickable elements + viewport screenshot | 完全纯视觉截图 | 提高 VLM grounding，但截图会被 UIHelper 临时视觉效果影响 |
| Remote operator | 本地 app + remote proxy backend | 纯本地可控性 | 降低用户本机依赖，但引入服务可用性、认证和供应商边界 |
| 终止条件 | `finished` / `call_user` / max loop / abort | 纯循环直到成功 | 更贴近真实 agent 产品，允许失败转人工和用户中断 |

### 值得学习的模式

1. **Port-and-Adapter GUI Agent**
   - `GUIAgent` 不知道自己在操作电脑、浏览器还是远程沙箱；它只依赖 `Operator`。
   - 这是所有 computer-use runtime 最核心的可复用模式。

2. **Action grammar as runtime interface**
   - action spaces 不是文档，而是 system prompt + parser + executor 的共同 ABI。
   - 如果做内部 GUI agent，也应把 action schema 版本化。

3. **VLM adapter hides image/context complexity**
   - `Model.ts` 处理图片压缩、Responses API 增量输入、`previous_response_id`、不同 UI-TARS 版本 max pixels。
   - 这比在业务层手拼 messages 稳定得多。

4. **Delta conversation callback**
   - `onData` 返回的 conversation 是 delta，不是全量历史；这适合 UI 实时刷新，也避免每轮传大对象。

5. **Desktop permission as first-class preflight**
   - `systemPermissions.ts`、`browserCheck.ts` 把“系统不可用”前置暴露，减少运行中不可解释失败。

6. **Remote computer uses same operator contract**
   - remote side 不是另写一套 agent，它只是 `Operator` 的另一个实现。

7. **Internal terminal actions**
   - `finished` / `call_user` / `user_stop` / `max_loop` 把 agent 生命周期显式化，值得所有 long-running agent 借鉴。

### 反模式 / 踩坑点

1. **权限判断有真实条件表达式 bug**
   - `apps/ui-tars/src/renderer/src/hooks/useRunAgent.ts`：`operator === Operator.LocalBrowser || Operator.LocalComputer` 右侧是字符串常量，整体恒 truthy。
   - 结果是权限 gate 可能错误地作用于所有 operator，包括 remote 场景。

2. **坐标 0 值被 truthy 判断误伤**
   - `packages/ui-tars/operators/browser-operator/src/browser-operator.ts` 多处 `if (startX && startY)`；当 x 或 y 为 0 时会误判缺失。
   - GUI 坐标系统里 0 是合法值，生产级代码应使用 `startX !== null && startY !== null`。

3. **日志可能泄露敏感配置**
   - `runAgent.ts` 的 error log 直接带 `settings`；而 settings 包含 `vlmApiKey`。
   - 对个人 PoC 影响可控，对企业和发布版是必须修的安全问题。

4. **Remote host / service contract 不够自解释**
   - `remote/shared.ts` 中 `UI_TARS_PROXY_HOST` / `COMPUTER_USE_HOST` 为空字符串，端点是相对 `/api/v1`；真实 host 如何注入需要结合构建/服务部署。
   - 使用者容易误以为 remote 能完全本地自足。

5. **Action parser 容错偏“吞错”**
   - `parseAction()` catch 后 `console.error` 并返回 null，外层仍可能 push action_type 空字符串。
   - 生产化应区分 parse error、unsupported action、unsafe action，并进入可观测 error path。

6. **文档口径与产品版本混杂**
   - README 同时服务 Agent TARS 和 UI-TARS Desktop；release tag、app package、SDK package 不是一个版本面。
   - 报告、脚本、部署文档都应显式写清楚分析对象。

### 可借鉴的具体技术点

| 技术点 | 文件 | 适用场景 |
|--------|------|---------|
| GUI agent 主循环 | `packages/ui-tars/sdk/src/GUIAgent.ts` | 任何 screenshot → VLM → action → execute 的 GUI runtime |
| VLM adapter | `packages/ui-tars/sdk/src/Model.ts` | 多 provider、多图片窗口、多 API 形态接入 |
| Operator interface | `packages/ui-tars/sdk/src/types.ts` | 把不同执行环境抽象成同一端口 |
| Action parser | `packages/ui-tars/action-parser/src/actionParser.ts` | 模型 action grammar 到坐标/IR 的解析层 |
| Electron main orchestration | `apps/ui-tars/src/main/services/runAgent.ts` | 桌面 App 连接 UI、设置、权限、runtime、operator |
| IPC lifecycle route | `apps/ui-tars/src/main/ipcRoutes/agent.ts` | run/pause/resume/stop 的桌面控制面 |
| Browser operator | `packages/ui-tars/operators/browser-operator/src/browser-operator.ts` | GUI + browser hybrid control |
| NutJS operator | `packages/ui-tars/operators/nut-js/src/index.ts` | 本地 OS 鼠标/键盘/截图自动化 |
| Remote proxy client | `apps/ui-tars/src/main/remote/proxyClient.ts` | remote computer-use backend contract |
| Permissions preflight | `apps/ui-tars/src/main/utils/systemPermissions.ts` | 依赖 OS 权限的桌面 AI 产品 |

---

## 架构解剖

### 目录结构

```text
UI-TARS-desktop/
├── apps/
│   ├── ui-tars/                      # Electron UI-TARS Desktop App
│   │   └── src/
│   │       ├── main/                 # main process：store / ipcRoutes / services / remote / operator
│   │       ├── preload/              # Electron preload bridge
│   │       └── renderer/             # React renderer hooks / UI
│   └── agent-tars/                   # Agent TARS app/workspace 相关入口
├── packages/
│   ├── ui-tars/
│   │   ├── sdk/                      # GUIAgent / Model / core types / utils
│   │   ├── action-parser/            # action grammar parser and coords normalization
│   │   ├── electron-ipc/             # typed IPC helper
│   │   ├── operators/
│   │   │   ├── browser-operator/     # BrowserOperator + UIHelper
│   │   │   ├── nut-js/               # Local computer operator
│   │   │   ├── adb/                  # Android/device operator
│   │   │   └── browserbase/          # BrowserBase operator
│   │   ├── shared/                   # shared types/constants/utils
│   │   ├── cli/                      # @ui-tars/cli
│   │   ├── utio/                     # UI-TARS IO/reporting adjunct
│   │   └── visualizer/               # visualization package（workspace exclude）
│   ├── agent-infra/                  # browser、MCP、search、logger、shared infra
│   └── common/                       # shared configs/build tools
├── multimodal/                       # Agent TARS / Tarko / GUI Agent / Omni-TARS / benchmarks / websites
├── docs/                             # quick-start / sdk / setting / deployment + archive-1.0
├── examples/                         # GUI agent/operator examples
├── infra/                            # pnpm dev kit / infra helpers
├── .github/workflows/                # CI, E2E, release, security, scorecard
├── pnpm-workspace.yaml               # apps/packages/multimodal workspace definition
└── package.json                      # root scripts: bootstrap, dev:ui-tars, lint, test, coverage, publish packages
```

### 技术栈

- **运行时 / 框架：** Node.js >=20、pnpm 9.10、Electron 34、React、Zustand、TypeScript 5.7。
- **Agent runtime：** `@ui-tars/sdk`、OpenAI SDK、`@ui-tars/action-parser`、`@computer-use/nut-js`、`@agent-infra/browser`。
- **构建 / 打包：** Turbo、electron-vite、electron-forge、rslib/rsbuild、Changesets、Husky。
- **测试：** Vitest、Playwright、coverage-v8 / coverage-istanbul；E2E 覆盖 macOS / Windows。
- **CI/CD：** GitHub Actions typecheck/coverage、E2E、release、secretlint、TruffleHog、OpenSSF Scorecard、Codecov。
- **发布：** `release-ui-tars.yml` 通过 electron-forge 处理 macOS arm64/x64 与 Windows x64 发布；`publish:packages` / `publish-beta:packages` 处理 packages 发布。

### 模块依赖关系

核心依赖方向是：

```text
apps/ui-tars renderer
  -> @ui-tars/electron-ipc generated api
  -> apps/ui-tars main ipcRoutes/services
  -> @ui-tars/sdk GUIAgent
  -> @ui-tars/sdk Model + @ui-tars/action-parser
  -> @ui-tars/operator-* / @agent-infra/browser / remote operators
  -> OS / Browser / Remote backend / VLM provider
```

重要关系：

- renderer 不直接操作 OS；它通过 IPC 调 main process。
- main process 不直接解析模型动作；它构造 `GUIAgent` 并消费 `onData/onError`。
- SDK 不依赖 Electron；Electron 是 SDK 的一个宿主。
- Operator 不依赖 UI；它只实现截图和执行。
- Action parser 不依赖 operator；它只输出中间表示和 coords。
- Remote operator 复用同一个 `Operator` contract，把外部 API 包装成执行面。

### 扩展机制

UI-TARS-desktop 不是典型插件市场，而是 **包级扩展 + operator 扩展 + provider/preset 扩展**：

- 新增执行环境：实现 `Operator.screenshot()` / `Operator.execute()`，注册到 Desktop setting / runAgent operator selection。
- 新增模型 provider：走 OpenAI-compatible config，或扩展 `getModelVersion()` / `getSpByModelVersion()` / `UITarsModelConfig`。
- 新增 action：更新 `MANUAL.ACTION_SPACES`、`actionParser()`、对应 operator execute switch，三者必须一起改。
- 新增 browser/search 能力：通过 `@agent-infra/browser`、`SearchEngineForSettings`、BrowserOperator options 扩展。
- 新增 remote backend：实现 `/api/v1` proxy/browser/time/register 契约或替换 `ProxyClient`。

---

## 质量与成熟度

### 代码质量

- **类型系统：** TypeScript 覆盖深，核心接口 `Operator`、`Model`、`InvokeParams`、`ExecuteParams`、`GUIAgentData`、`StatusEnum` 都明确。跨包边界比普通 demo 项目清楚。
- **错误处理：** GUIAgent 对 screenshot/model/execute/max loop/environment/unknown error 有分类；remote fetch 有 retry 与 status；BrowserOperator 执行失败会 cleanup。
- **状态建模：** `AppState`、`GUIAgentData`、`StatusEnum`、AbortController、pause/resume/stop 都是显式状态。
- **不足：** 仍有真实 bug 和 hardening gap：权限条件恒真、坐标 0 truthy 判断、settings 日志脱敏、parser 吞错、remote contract 口径不清。
- **仓库卫生：** monorepo 边界膨胀明显，`multimodal/` 体量最大，分析 UI-TARS Desktop 时需要刻意缩小范围。

### 测试

- **测试框架：** Vitest + Playwright。
- **测试文件分布：** tracked test-like files 约 163（排除 benchmark result 噪音）：`packages/agent-infra` 43、`packages/ui-tars` 15、`apps/ui-tars` 10、`multimodal/tarko` 60、`multimodal/agent-tars` 13、`multimodal/gui-agent` 11、`multimodal/omni-tars` 10。
- **UI-TARS Desktop 自身样本：** `apps/ui-tars/e2e/app.test.ts`、`apps/ui-tars/src/main/agent/operator.test.ts`、`ipcRoutes/*test.ts`、`systemPermissions.test.ts`、`setOfMarks.test.ts`。
- **CI 覆盖：** `test.yml` 跑 typecheck + coverage；`e2e-ui-tars.yml` 跑 macOS latest、macOS 13、Windows latest 的 UI-TARS E2E；Codecov 上传 coverage。
- **本次边界：** 本次没有安装依赖、没有运行测试或构建；测试结论来自源码与 CI 配置静态证据。

### CI/CD

- `test.yml`：pull request / main push 触发；macOS latest；pnpm 9、Node 20、Chrome 120；`turbo run typecheck`、`turbo run coverage`、Codecov。
- `e2e-ui-tars.yml`：UI-TARS 相关路径变更触发；macOS latest / macOS 13 / Windows latest；`turbo run ui-tars-desktop#test:e2e`。
- `release-ui-tars.yml`：manual workflow_dispatch；macOS arm64/x64、Windows x64；证书、provision profile、GitHub release artifact；secrets 使用 GitHub secrets。
- `agent_tars_test.yml`：Agent TARS / multimodal path 触发 bootstrap/build/test。
- `benchmark.yml`：MCP benchmark。
- `secretlint.yml`：changed files secretlint。
- `secret-scan.yml`：TruffleHog。
- `scorecard.yml`：OpenSSF Scorecard + SARIF upload。

CI 投入明显高于普通开源 demo；但 release / Desktop App / Agent TARS CLI 多版本面并存，发版口径仍需小心。

### 文档质量

- **README：** 当前主要介绍 TARS stack，Agent TARS 篇幅明显增加；UI-TARS Desktop 仍有 Showcase、Features、Quick Start。
- **Quick Start：** `docs/quick-start.md` 写清 Chrome/Edge/Firefox、单显示器限制、Mac 权限、Hugging Face / VolcEngine provider 配置。
- **SDK 文档：** `docs/sdk.md` 是高价值文档，明确 `GUIAgent`、`UITarsModel`、`Operator`、执行时序、配置项、status flow。
- **不足：** remote operator discontinue、release tag、app package version、Agent TARS docs 与 UI-TARS Desktop docs 混在一起；首次采用者需要自己分辨当前有效路径。

### Issue / PR 健康度

- **活跃度：** 2026-07-07 快照下，repo API `open_issues_count=406` 含 PR；单独查询 open PR 为 88，可推算 open issue 约 318。社区需求仍很旺。
- **主线吞吐：** 但从旧报告 HEAD `e9f33872` 到当前 `c2ad42e3`，`main` 只新增了 1 个提交，而且是 `mcp-http-server` 默认 host 从全网卡收紧到 `127.0.0.1` 的安全修复。
- **解读：** 这说明“外部热度高”与“主线快速合并/稳定演进”是两回事。项目仍值得跟踪，但生产采用时要按自己可维护的 fork/patch 面来评估，而不是按 star 数做乐观假设。

### 维护 / 二次开发视角

#### 能不能维护

能做外围贡献和局部修复，不建议一开始接管核心路线。最佳路径是：**先修明确 bug / 文档漂移 / 安全 hardening / 测试补强，再逐步进入 GUIAgent、Model、Operator 主链**。

#### 首批 PR 切入点

1. **修权限条件表达式**
   - `useRunAgent.ts` 把 `(operator === Operator.LocalBrowser || Operator.LocalComputer)` 改成显式枚举判断，并补测试。

2. **修坐标 0 truthy bug**
   - `BrowserOperator` 中所有 `if (startX && startY)` 改为 null/undefined 判断。

3. **日志脱敏**
   - `runAgent.ts` 的 `settings` log 过滤 `vlmApiKey`、auth header、baseURL 中敏感 query。

4. **文档口径整理**
   - README / quick-start 明确区分 Agent TARS CLI release、UI-TARS Desktop app version、`@ui-tars/sdk` npm version、remote operator 当前状态。

5. **Action parser error typing**
   - parse failure 不应只 `console.error`，应返回 typed parse error 或进入 `StatusEnum.ERROR` 可观测路径。

6. **Remote backend doctor**
   - 对 `/api/v1/time-balance`、sandbox info、browser availability、VLM response api support 做显式 health check。

#### 不建议一开始碰的区域

- 整体迁移 monorepo / workspace 拆分。
- 大改 `GUIAgent.run()` 主循环。
- 重写 `UITarsModel` provider adapter。
- remote backend contract / auth / billing / sandbox 大改。
- Agent TARS 与 UI-TARS Desktop 的统一产品路线。
- release/signing workflow。

---

## 社区与生态

### 社区评价

- **热度高且还在涨**：37.8k stars / 3.8k forks，在 GUI Agent / computer-use / multimodal agent 方向仍属头部开源项目。
- **社区关注点偏真实落地**：single monitor、权限、browser availability、remote backend、provider 配置、打包发布、安全边界，这些都直接反映在 docs、CI 和最近唯一一次主线修复上。
- **生态更多是内生而非插件市场**：`@ui-tars/*`、`@agent-infra/*`、Agent TARS / Tarko / Omni-TARS 都在同仓内生长；更像“总仓生态”而不是 browser-use 那种松耦合第三方生态。
- **项目阶段感很强**：外部热度、内部 package、总仓 release、Desktop App version 四条时间线不同步；对使用者来说，版本识别本身就是门槛。

### 衍生项目 / 插件生态

- `@ui-tars/sdk`：GUI automation agent toolkit。
- `@ui-tars/action-parser`：UI-TARS action grammar parser。
- `@ui-tars/operator-browser`：browser operator。
- `@ui-tars/operator-nut-js`：desktop computer operator。
- `@ui-tars/operator-adb` / `operator-browserbase`：更多执行后端。
- `@ui-tars/cli`：CLI 入口。
- `packages/agent-infra/*`：browser、MCP client/server、search、logger、shared infra。
- `multimodal/agent-tars`：Agent TARS CLI / Web UI / multimodal agent stack。
- `multimodal/tarko`、`omni-tars`、`gui-agent`：更宽 agent runtime / UI / benchmark 实验。

### 竞品对比

**直接竞品：GUI / computer-use runtime**

- `browser-use/browser-use`：浏览器自动化更聚焦，社区更大；但不覆盖完整桌面 GUI。
- `mediar-ai/screenpipe`：桌面/屏幕上下文采集与个人 AI 基础设施方向；更偏数据采集/上下文，不是同一 action runtime。
- Anthropic / OpenAI Computer Use 类闭源能力：体验和模型质量可能更强，但源码不可复用。

**邻近替代：Agent platform / desktop agent harness**

- `tinyhumansai/openhuman`：personal AI OS，memory/workflow/tool ledger 更强；GUI automation 不是唯一核心。
- `OpenInterpreter/open-interpreter`：本地电脑控制 + code/shell agent，更偏交互式解释器和系统操作。
- `All-Hands-AI/OpenHands`：coding agent 平台，不是 GUI automation，但在 agent execution / tool safety 上有参考价值。

**架构邻居：可借鉴但不直接竞争**

- `stagehand`：DOM/Playwright-first browser automation，对比视觉 GUI action grammar 很有价值。
- RPA / workflow replay 系统：在执行审计、审批、回放、失败恢复上值得补齐 UI-TARS 的生产化短板。
- OpenHuman / openagent：在 desktop host、tool registry、security policy、run ledger 上是 UI-TARS 下一阶段可学习对象。

### 竞品数据快照（2026-07-07）

| 项目 | Stars | Forks | pushed_at | 解读 |
|------|-------|-------|-----------|------|
| `browser-use/browser-use` | 103,297 | 11,429 | 2026-07-07 | 浏览器自动化头部项目；更聚焦 browser |
| `All-Hands-AI/OpenHands` | 79,789 | 10,175 | 2026-07-07 | Coding agent 平台；不是 GUI runtime 直接竞品 |
| `OpenInterpreter/open-interpreter` | 64,296 | 5,595 | 2026-07-07 | 本地系统控制/解释器生态；邻近替代 |
| `bytedance/UI-TARS-desktop` | 37,765 | 3,801 | 2026-07-01 | GUI / computer-use runtime 代表项目 |
| `mediar-ai/screenpipe` | 19,693 | 1,906 | 2026-07-07 | 屏幕上下文 / personal data infra |
| `microsoft/TaskWeaver` | 6,171 | 780 | 2026-03-23 | 已 archived；更多是历史参照 |

## 关键代码走读

### 1. `GUIAgent.run()`

- **路径：** `packages/ui-tars/sdk/src/GUIAgent.ts`
- **职责：** 执行 GUI agent 的核心闭环。
- **实现要点：**
  - 初始化 `GUIAgentData`，状态从 `INIT` 切到 `RUNNING`。
  - 注入 context，供 operator 获取 logger、systemPrompt、factors、model。
  - 每轮检查 pause / stop / abort / max loop / screenshot failure。
  - 调 `operator.screenshot()`，用 Jimp 读取截图尺寸与 MIME。
  - 写入 human `<image>` conversation，并通过 `onData` 发送 delta。
  - `toVlmModelFormat()` + `processVlmParams()` 组装 VLM 输入。
  - 调 `model.invoke()`，拿到 prediction、parsedPredictions、cost、responseId。
  - 遍历 parsed action，处理 `error_env`、`max_loop`、`call_user`、`finished`，否则调用 `operator.execute()`。
  - finally 中 `model.reset()`，必要时执行 `user_stop`，并发出最终状态。

### 2. `UITarsModel.invoke()` / `invokeModelProvider()`

- **路径：** `packages/ui-tars/sdk/src/Model.ts`
- **职责：** 把 GUIAgent 的 conversations/images 转成 OpenAI-compatible VLM 请求，并把 raw prediction 交给 action parser。
- **实现要点：**
  - `modelConfig.useResponsesApi` 决定走 Responses API 还是 Chat Completions。
  - Responses API path 使用 `previous_response_id`，并维护 `headImageContext` 删除滑出图片对应 response。
  - 根据 UI-TARS version 选择 `MAX_PIXELS_V1_0`、`MAX_PIXELS_V1_5`、`MAX_PIXELS_DOUBAO`。
  - 所有图片先 `preprocessResizeImage()`，再 `convertToOpenAIMessages()`。
  - action parsing 失败时返回 `parsedPredictions: []`，没有抛 typed parse error。

### 3. `runAgent()` 主进程编排

- **路径：** `apps/ui-tars/src/main/services/runAgent.ts`
- **职责：** Electron main process 把用户设置、operator、model、system prompt、GUIAgent 绑定到一次 run。
- **实现要点：**
  - 根据 `settings.operator` 选择 `NutJSElectronOperator`、`DefaultBrowserOperator`、`RemoteComputerOperator`、`RemoteBrowserOperator`。
  - LocalBrowser 前做 `checkBrowserAvailability()`，失败直接 `StatusEnum.ERROR`。
  - Remote 模式下改用 `FREE_MODEL_BASE_URL` 和 `getAuthHeader()`，model provider/version 由 `ProxyClient` 提供。
  - `handleData` 给 conversation 标记 SoM/click marker，并把 runtime delta 写回 main store。
  - 错误回调会记录 settings，需要脱敏。

### 4. `actionParser()` / `parseActionVlm()`

- **路径：** `packages/ui-tars/action-parser/src/actionParser.ts`
- **职责：** 解析模型输出中的 thought/reflection/action，并把 bbox/point 坐标转成 screen coords。
- **实现要点：**
  - 支持 `Thought:`、`Reflection:`、`Action_Summary:`、`Action:`、o1 XML-like 格式。
  - UI-TARS 1.5 使用 `smartResizeForV15()` 计算 resize factor。
  - `start_box` / `end_box` 归一化成 `[x1,y1,x2,y2]` 并进一步算 `start_coords` / `end_coords`。
  - 支持 `<bbox>` 与 `<point>` 输出。
  - parse failure 只 log，不够强类型。

### 5. `BrowserOperator.execute()`

- **路径：** `packages/ui-tars/operators/browser-operator/src/browser-operator.ts`
- **职责：** 将 `PredictionParsed` 变成 browser page actions。
- **实现要点：**
  - screenshot 前可高亮 clickable elements、显示 water flow，再截 viewport JPEG。
  - execute 前显示 action info，并触发 `onOperatorAction` hook。
  - 支持 click、double_click、right_click、type、hotkey、press/release、scroll、drag、navigate、navigate_back、wait、finished、call_user。
  - 坐标除以 `deviceScaleFactor` 后交给 page.mouse/page.keyboard。
  - `startX && startY` 是边界 bug。

### 6. `RemoteComputer` / `fetchWithAuth()`

- **路径：** `apps/ui-tars/src/main/remote/proxyClient.ts`、`remote/auth.ts`
- **职责：** 把 remote sandbox API 包装成 local operator 可调用的方法。
- **实现要点：**
  - `fetchWithAuth()` 自动加 JWT auth header，失败 retry 1 次。
  - `RemoteComputer` 封装 MoveMouse、ClickMouse、DragMouse、PressKey、TypeText、Scroll、GetScreenSize、TakeScreenshot。
  - `auth.ts` 生成本地 RSA key pair，注册 device，签 JWT。
  - 本地 key 权限设置相对合理，但 app private key 与 remote host 注入方式需要部署时核查。

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 5 | desktop、browser、remote、SDK、CLI、Agent TARS/multimodal infra 同仓覆盖广；GUI agent 能力完整 |
| 代码质量 | 4 | 核心分层优秀，类型边界清晰；但权限条件、坐标 truthy、日志脱敏、parser error typing 有明确改进点 |
| 文档质量 | 4 | README、quick-start、SDK docs 质量高；但 release/app/remote/Agent TARS 与 UI-TARS Desktop 口径混杂 |
| 社区活跃度 | 5 | 37.8k stars、3.8k forks、open PR/issue 仍很活跃，仍是 GUI Agent 方向头部项目 |
| 架构设计 | 5 | `GUIAgent + Model + Action Parser + Operator` 是高质量可复刻内核 |
| 学习价值 | 5 | 是理解 computer-use / browser-use / GUI action runtime 的高价值源码样本 |
| 可借鉴度 | 4 | 抽象非常可借鉴；但整仓过重，生产采用要抽内核而非照搬 |

---

## 总结

### 一句话评价

UI-TARS-desktop 是当前开源 GUI Agent / computer-use runtime 的代表样本：**非常值得学，适合 PoC 和抽取 SDK/Operator 思路；但主线推进偏慢、release/package 口径漂移仍在，直接作为生产桌面自动化底座仍需观望和二次 hardening。**

### 谁应该用

- 想研究 GUI Agent / Computer Use / Browser Use runtime 的开发者。
- 想做内部 GUI automation PoC 的团队。
- 想学习 `Operator` 抽象、VLM action parser、桌面权限控制、remote computer contract 的架构设计者。
- 想给自有 agent 接一个“看屏幕 + 点鼠标/键盘”的执行层的人。

### 谁不应该直接用

- 想要稳定企业 RPA / 审批 / 审计 / 回放 / 合规全套能力的团队。
- 只需要 deterministic browser automation 的团队；应优先看 Playwright / Stagehand / browser-use 类方案。
- 不愿处理系统权限、显示器/DPI、provider 兼容、远程 backend、日志脱敏、安全策略的人。
- 想找 personal AI OS / 长期记忆 / workflow ledger 的团队；应看 OpenHuman / openagent 一类平台。

### 下一步

1. **如果要试用**：优先用 release / quick-start 隔离跑 UI-TARS Desktop，本地只接测试 provider，不放真实高权限账号。
2. **如果要二次开发**：从 `@ui-tars/sdk`、`@ui-tars/action-parser`、`@ui-tars/operator-browser` 切入，不要先 fork 整个 TARS stack。
3. **如果要生产化**：先补四件事：approval gate、execution replay/audit、日志脱敏、provider/remote/backend health doctor。
4. **如果要学架构**：按顺序读 `GUIAgent.ts` → `Model.ts` → `actionParser.ts` → `runAgent.ts` → `browser-operator.ts` → `remote/proxyClient.ts`。
