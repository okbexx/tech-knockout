# CodexDesktop-Rebuild

> 一句话定位：基于逆向工程将 OpenAI 官方仅支持 macOS 的 Codex Desktop 应用重新打包为跨平台（macOS/Windows/Linux）独立安装包的 Electron 重分发项目。

## 基本信息

| 项目 | 值 |
|------|-----|
| 仓库 | `Haleclipse/CodexDesktop-Rebuild` |
| URL | `https://github.com/Haleclipse/CodexDesktop-Rebuild` |
| Star | 1552（截至 2026-05-09） |
| Fork | 118 |
| 许可证 | **未声明**（⚠️ 风险） |
| 语言 | JavaScript |
| 首次提交 | 2026-02-03 |
| 最近提交 | 2026-05-08 |
| 最新 Release | 无 GitHub Release，通过 GitHub Actions Artifact 分发 |
| 贡献者数 | 1 人（Haleclipse，51 commits）+ GitHub Actions bot |
| 分析日期 | 2026-05-09 |

---

## 场景一：是否值得采用

### 解决的问题

OpenAI 官方 Codex Desktop（基于 Electron 的 AI 编程助手 GUI）目前**仅提供 macOS 版本**（通过 Mac App Store 或官网 DMG 分发）。Windows 和 Linux 用户只能使用命令行版的 `codex` CLI，无法体验桌面端的完整功能（如文件浏览、插件系统、会话管理等）。

本项目通过**逆向重打包**官方应用，让 Windows 和 Linux 用户也能运行 Codex Desktop。

### 核心能力与边界

- **能做什么：**
  - 下载官方 Codex Desktop 各平台安装包（macOS ZIP / Windows MSIX）
  - 解压 Electron ASAR 包，应用功能性补丁（开启 DevTools、移除插件认证门控、解锁 browser-use 等）
  - 用 `@cometix/codex` 自编译 CLI 替换官方 codex 二进制（官方仅提供 macOS 版）
  - 重新打包并生成各平台安装包（macOS DMG、Windows ZIP、Linux deb/rpm/zip）
  - 通过 GitHub Actions CI 自动化构建

- **不能做什么：**
  - **不能修改官方应用的核心功能**——它只是在官方构建基础上打补丁，不是 fork 源码二次开发
  - **不能解决官方应用本身的 bug**——如果官方版本崩溃，重打包版同样崩溃
  - **不能保证长期可用**——OpenAI 随时可能更改分发渠道、加密 ASAR、或采取法律行动
  - Linux 版本存在较多兼容性问题（见 Issues #57-59）

- **与竞品差异：**
  - 无直接竞品。目前唯一能让 Windows/Linux 运行 Codex Desktop GUI 的方案。
  - 与官方 Codex CLI 的关系：CLI 是跨平台的，但无 GUI；本项目提供 GUI。
  - 与第三方 Web 封装的关系：本项目是原生 Electron 应用，非浏览器套壳。

### 集成成本

- **依赖链：** Node.js 24+、npm、7-Zip、`asar` CLI、electron-forge、electron-rebuild
- **部署复杂度：** 中。需要正确配置代码签名（macOS）、MS Store API 抓包（Windows）、Electron Forge（Linux）
- **学习曲线：** 低（如果只是想用），高（如果想理解/修改构建流程）
- **从零到 demo：** 克隆仓库 → `npm ci` → `npm run sync` → `npm run patch` → `npm run build`，约 10-30 分钟（取决于网络下载官方包的速度）


### 依赖 / SDK 选型证据

> 全量 direct dependencies 由 `tk catalog build` 从本地源码 manifest 写入 catalog；本表只解释影响 build-vs-buy 的关键库 / SDK。

| Dependency | Type | Used for | Problem solved | Evidence | Reuse signal | Caution |
|------------|------|----------|----------------|----------|--------------|---------|
| _待补关键依赖_ | | | | | | |

### 风险评估

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 许可证合规 | ❌ **高风险** | 仓库未声明许可证；逆向官方应用并重新分发存在法律灰色地带，可能违反 OpenAI ToS |
| Bus factor | **高** | 单作者项目（Haleclipse），51 个 commit 中无外部贡献者 |
| 供应商锁定 | **高** | 完全依赖 OpenAI 官方发布节奏和分发渠道。若官方加密 ASAR、改用新分发方式或停止更新，项目立即失效 |
| 维护趋势 | **活跃但脆弱** | 作者更新频繁（最近提交 2026-05-08），但生态脆弱——一旦官方封堵分发渠道，项目无法自救 |
| 安全历史 | ⚠️ | 无 CVE，但 patch 脚本修改了官方应用的认证门控（plugin auth gate）和 Statsig 功能开关，理论上引入了非官方行为 |

### 结论

**❌ 不推荐采用（生产环境） / ⚠️ 观望（个人尝鲜）**

理由：
1. **法律与合规风险**：无许可证声明 + 逆向官方闭源/半闭源应用 + 重新分发，企业和团队使用存在明确合规隐患
2. **技术脆弱性**：完全寄生在官方分发渠道上，官方任何微小改动（如 ASAR 加密、CDN 变更、MS Store API 变更）都可能导致构建失败
3. **Linux 稳定性差**：多个 open issue 报告 ELF 头无效、页面不显示、原生模块加载失败
4. **单点故障**：单作者维护，无社区贡献者

**适合场景：**个人用户想在 Windows/Linux 上尝鲜 Codex Desktop GUI，且能接受随时失效的风险。

**不适合场景：**团队内部工具、企业部署、需要长期稳定维护的项目。

---

## 场景二：技术架构学习

### 核心架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CodexDesktop-Rebuild 构建流水线                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │  Official    │    │  Microsoft   │    │  @cometix/   │                  │
│  │  Sparkle     │    │  Store API   │    │  codex       │                  │
│  │  Appcast     │    │  (MSIX pkg)  │    │  (CLI bins)  │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                   │                          │
│         ▼                   ▼                   │                          │
│  ┌─────────────────────────────────────┐        │                          │
│  │      sync-upstream.js               │        │                          │
│  │  • fetch macOS ZIP / Windows MSIX   │        │                          │
│  │  • extract app.asar → _asar/        │        │                          │
│  │  • copy native modules & resources  │        │                          │
│  └────────────────┬────────────────────┘        │                          │
│                   │                             │                          │
│                   ▼                             │                          │
│  ┌─────────────────────────────────────┐        │                          │
│  │      patch-all.js                   │        │                          │
│  │  ┌─────────┐ ┌─────────┐ ┌────────┐ │        │                          │
│  │  │patch-   │ │patch-   │ │patch-  │ │        │                          │
│  │  │devtools │ │copyright│ │i18n    │ │ ...    │                          │
│  │  │(AST)    │ │(text)   │ │(text)  │ │        │                          │
│  │  └─────────┘ └─────────┘ └────────┘ │        │                          │
│  └────────────────┬────────────────────┘        │                          │
│                   │                             │                          │
│                   ▼                             ▼                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Platform-Specific Build                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │
│  │  │   macOS      │  │   Windows    │  │        Linux             │  │   │
│  │  │              │  │              │  │                          │  │   │
│  │  │ asar pack    │  │ asar pack    │  │ Electron Forge           │  │   │
│  │  │ ↓            │  │ ↓            │  │ (rebuild + make)         │  │   │
│  │  │ codesign     │  │ patch exe    │  │ deb / rpm / zip          │  │   │
│  │  │ --remove     │  │ hash         │  │                          │  │   │
│  │  │ ↓            │  │ ↓            │  │                          │  │   │
│  │  │ ad-hoc sign  │  │ replace CLI  │  │                          │  │   │
│  │  │ ↓            │  │ ↓            │  │                          │  │   │
│  │  │ hdiutil      │  │ 7zz zip      │  │                          │  │   │
│  │  │ → DMG        │  │ → ZIP        │  │                          │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 关键设计决策与 trade-off

| 决策 | 选择 | 放弃了什么 | 为什么 |
|------|------|-----------|--------|
| 逆向重打包而非源码 fork | 直接修改官方构建产物 | 无法深度定制 UI/功能；受官方更新节奏制约 | OpenAI Codex Desktop 未开源，无法获取源码 |
| AST-based 补丁 vs 正则替换 | 用 `acorn` 解析 AST 后精确定位语法节点 | 实现复杂度高、依赖 acorn 解析器 | 官方 JS 经过打包混淆，正则替换极易误伤；AST 能精确定位 `allowInspectElement` / `devTools` 等属性 |
| macOS/Windows 用上游 ASAR，Linux 用 Forge 重编 | macOS/Win 复用官方框架，Linux 从头构建 | Linux 构建路径与 macOS/Win 不一致，维护成本高 | 官方未提供 Linux 构建，只能用 Electron Forge 自构建 |
| @cometix/codex 替换官方 CLI | 自编译跨平台 codex 二进制 | 需要额外维护 CLI 的跨平台编译 | 官方 codex CLI 仅提供 macOS 版 |
| 移除代码签名 + ad-hoc 重签 | 绕过 Gatekeeper 让用户能直接运行 | 用户首次打开仍会看到安全警告；无法使用 Apple ID 公证 | 没有 OpenAI 的签名证书，只能移除原签名后自签 |

### 值得学习的模式

1. **Electron ASAR 解包/重包流水线**
   - 用 `asar extract` / `asar pack` 对官方应用进行"开包手术"
   - 配合 `app.asar.unpacked/` 处理原生模块（不打包进 ASAR，保持性能）

2. **AST-based 代码补丁**
   - 面对混淆/压缩后的 JS bundle，用 `acorn` 解析 AST，通过语法特征（Property key name、BinaryExpression operator、CallExpression arguments）精确定位目标代码
   - 比正则更鲁棒，比 source map 更通用（无需 source map）

3. **二进制完整性修补**
   - Windows：Electron EXE 内嵌了 ASAR header 的 SHA256 hash，重包 ASAR 后需要用新 hash 原位替换 EXE 中的旧 hash
   - macOS：更新 `Info.plist` 中的 `ElectronAsarIntegrity` 字段

4. **Microsoft Store API 抓包**
   - `fetch-msstore.js` 实现了完整的 MS Store 下载链路：获取 cookie → 查询 app info → 获取 CategoryID → 拉取 package list → 获取下载 URL
   - 这是绕过 Windows Store 应用限制、获取离线安装包的经典技术

5. **Sparkle Appcast 解析**
   - 解析 macOS 应用常用的 Sparkle 更新 XML，自动获取最新版本下载链接

6. **Electron Forge 自定义 Hook**
   - `packageAfterCopy` hook 在 Forge 打包后阶段，将预构建的 ASAR 和资源复制到输出目录，跳过 Forge 自身的 ASAR 打包

### 反模式 / 踩坑点

1. **硬编码 Magic Number**
   - `patch-plugin-auth.js` 中硬编码了 Statsig gate ID `"410262010"`，一旦官方更改 gate ID，补丁失效
   - 补丁逻辑与官方代码结构强耦合，官方更新后 AST 结构可能变化，导致补丁找不到目标或误patch

2. **CI 配置错误**
   - `.github/workflows/build.yml` 中 Linux job 的 patch 步骤写成了 `patch-all.js mac-${{ matrix.arch }}`，实际应该是 `linux-${{ matrix.arch }}` 或兼容参数。这是一个明显的 copy-paste bug

3. **无版本控制的分发渠道**
   - 没有 GitHub Release，构建产物仅以 Artifact 形式存在，用户无法方便地获取历史版本

4. **TLS 证书硬编码**
   - `sync-upstream.js` 中从本地 `scripts/certs/` 加载微软 CDN 的根证书，说明曾遇到 TLS 握手问题。证书过期会导致同步失败

5. **无回滚机制**
   - 如果某次官方更新导致补丁脚本失效，整个构建流水线会中断，且没有优雅的降级策略

### 可借鉴的具体技术点

| 技术点 | 文件 | 适用场景 |
|--------|------|---------|
| ASAR 解包重包 + 二进制 hash 修复 | `build-from-upstream.js` | 任何需要修改 Electron 应用构建产物的场景 |
| AST 精确定位修改混淆 JS | `patch-devtools.js`, `patch-plugin-auth.js` | 逆向工程、破解/修改闭源前端应用 |
| MS Store API 抓包下载 | `scripts/fetch-msstore.js` | 获取 Windows Store 应用的离线安装包 |
| Sparkle Appcast 版本检测 | `sync-upstream.js` | macOS 应用自动更新系统 |
| Electron Forge 跳过自带 ASAR | `forge.config.js` | 用预构建 ASAR 替换 Forge 默认打包行为 |

---

## 架构解剖

### 目录结构

```
CodexDesktop-Rebuild/
├── .github/
│   └── workflows/
│       ├── build.yml          # 手动触发多平台构建（mac/Win/Linux）
│       └── sync.yml           # 定时同步上游版本
├── resources/
│   ├── electron.icns          # macOS 应用图标
│   ├── electron.ico           # Windows 应用图标
│   ├── electron.png           # Linux 应用图标
│   └── notification.wav       # 通知音效
├── scripts/                   # ⭐ 核心构建脚本（全部在这里）
│   ├── build-from-upstream.js # macOS/Windows：从上游构建 DMG/ZIP
│   ├── bump-version.js        # 版本号自动提升
│   ├── check-update.js        # 检查上游是否有新版本
│   ├── fetch-msstore.js       # MS Store API 抓包实现
│   ├── patch-all.js           # 顺序执行所有补丁
│   ├── patch-copyright.js     # 修改版权信息文本
│   ├── patch-devtools.js      # AST 补丁：强制开启 DevTools
│   ├── patch-fast-mode.js     # 快速模式开关补丁
│   ├── patch-gpu.js           # GPU 相关配置补丁
│   ├── patch-i18n.js          # 国际化文本补丁
│   ├── patch-plugin-auth.js   # AST 补丁：移除 plugin auth + browser-use gate
│   ├── patch-statsig-logger.js# Statsig 日志相关补丁
│   ├── patch-sunset.js        # 日落模式补丁
│   ├── patch-util.js          # 补丁工具函数（bundle 定位等）
│   ├── prepare-src.js         # Linux 构建前准备（重组 src/ 给 Forge）
│   ├── start-dev.js           # 开发模式启动
│   ├── sync-upstream.js       # ⭐ 同步上游：下载官方包 → 解压 → 提取 ASAR
│   └── certs/                 # 微软 CDN 额外 CA 证书
├── src/                       # 构建工作区（由 sync-upstream 填充）
│   ├── mac-arm64/             # macOS ARM64 上游资源
│   ├── mac-x64/               # macOS x64 上游资源
│   ├── win/                   # Windows 上游资源
│   └── .build-mode            # 构建模式标记（upstream-asar / linux）
├── forge.config.js            # Electron Forge 配置
├── package.json               # 项目元数据 + 脚本入口
└── README.md                  # 项目说明
```

### 技术栈

- **运行时 / 框架：** Node.js 24+、Electron 41.2.0
- **构建 / 打包：** Electron Forge 7.10.2（maker-dmg、maker-zip、maker-squirrel、maker-deb、maker-rpm）、electron-rebuild
- **AST 解析：** acorn 8.16.0
- **XML 解析：** fast-xml-parser 5.5.9
- **测试：** **无**
- **CI/CD：** GitHub Actions（手动触发 workflow_dispatch）

### 模块依赖关系

```
sync-upstream.js
    ├── https/http (fetch appcast / MS store)
    ├── fast-xml-parser (parse Sparkle appcast)
    ├── fetch-msstore.js (MS Store API chain)
    └── child_process (curl, ditto, 7zz, asar extract)

patch-all.js
    └── 顺序调用 patch-*.js
        ├── acorn (AST parse)
        └── patch-util.js (bundle 定位)

build-from-upstream.js
    ├── sync-upstream 产物 (src/{platform}/_asar/)
    ├── asar pack
    ├── codesign (macOS)
    ├── hdiutil (macOS DMG)
    ├── 7zz (Windows ZIP)
    └── @cometix/codex (替换 CLI)

prepare-src.js
    ├── asar pack
    ├── resolveCodexVendor (npm pack fallback)
    └── electron-forge make (Linux only)
```

### 扩展机制

- **补丁系统：** `patch-all.js` 提供顺序化补丁框架，新增补丁只需在 `PATCHES` 数组中添加新的 `patch-*.js` 脚本
- **平台配置：** `forge.config.js` 通过 `src/.build-mode` 标记文件切换 macOS/Windows 的"上游 ASAR 模式"和 Linux 的"Forge 打包模式"
- **CLI 二进制解析：** `resolveCodexVendor()` 支持从 `node_modules/@cometix/codex` 本地加载，或回退到 `npm pack` 动态下载平台特定包

---

## 质量与成熟度

### 代码质量

- **类型系统：** ❌ 无 TypeScript，纯 JavaScript，无 JSDoc 类型注解
- **错误处理：** 基础级别。主要用 `try/catch` 包裹 `execSync`，但部分错误仅打印日志不中断流程
- **代码风格一致性：** 良好。所有脚本遵循统一的注释头格式、helper 命名规范、`// ─── Section ───` 分隔线风格

### 测试

- **测试框架：** ❌ 无
- **覆盖率：** ❌ 无
- **测试类型：** ❌ 无

> 这是一个明显的短板。逆向重打包项目尤其需要回归测试来验证补丁是否成功应用、应用是否能正常启动。

### CI/CD

- **流水线配置：** `.github/workflows/build.yml` — 手动触发，分 macOS/Windows/Linux 三个 job
- **发布流程：** 无自动 Release，构建产物以 Artifact 形式上传。无签名分发（macOS ad-hoc sign 仅用于本地运行，非 Apple ID 公证）
- **⚠️ CI Bug：** Linux job 中 `patch-all.js mac-${{ matrix.arch }}` 参数错误，应为 `linux-x64` / `linux-arm64`

### 文档质量

- **API 文档：** ❌ 无
- **教程/指南：** README 简洁清晰，包含构建命令和项目结构说明，但缺少故障排查指南
- **Changelog：** ❌ 无。版本号通过 `bump-version.js` 自动提升，但无变更记录

### Issue/PR 健康度

- **Issue 数量：** 28 open / 34 closed（截至 2026-05-09）
- **Issue 响应：** 作者有回复（如 #55、#56），但部分严重问题（如 Linux ELF 头无效）尚未解决
- **PR 合并节奏：** 无外部 PR（0 个 contributor）
- **Breaking change 历史：** 无明确版本管理，但补丁脚本与官方版本强耦合，每次官方大版本更新都可能"breaking"

---

## 社区与生态

### 社区评价

- **热度：** 1552 Stars（2026-02-03 创建，3 个月内），对于一个"逆向重打包"工具来说热度很高
- **用户画像：** 主要是中文社区用户（Issue 标题多为中文），Windows/Linux 开发者 wanting to use Codex Desktop
- **真实痛点：**
  - Linux 兼容性差（无效的 ELF 头、原生模块加载失败）
  - Windows 11 页面不显示（#56）
  - 历史会话打开出错（#61）
  - 版本自动更新无法屏蔽（#60）
  - 希望增加 token 用量统计（#55）

### 衍生项目 / 插件生态

- **@cometix/codex**：作者同时维护的 npm 包，提供跨平台 codex CLI 二进制。这是本项目能跨平台的关键依赖。
- 无其他明显的二次开发或插件生态。

### 竞品对比

| 项目 | 类型 | 平台 | 开源 | 说明 |
|------|------|------|------|------|
| **官方 Codex Desktop** | 官方 Electron GUI | macOS only | ❌ | 功能最完整，官方支持 |
| **官方 Codex CLI** | 官方 CLI | 全平台 | ✅ Apache-2.0 | 命令行交互，无 GUI |
| **CodexDesktop-Rebuild** | 第三方重打包 | macOS/Win/Linux | 无许可证 | 基于官方构建产物修改 |
| **Continue.dev** | 第三方 AI 编程插件 | VS Code/JetBrains | ✅ | 独立项目，非 Codex 相关 |

> 严格来说本项目在"Codex Desktop 跨平台使用"这个细分场景没有竞品，是唯一的解决方案。

---

## 关键代码走读

### 1. `scripts/sync-upstream.js` — 上游同步核心

- **职责：** 从官方渠道获取最新 Codex Desktop 安装包，提取 ASAR 和资源到 `src/{platform}/`
- **实现要点：**
  - macOS：解析 Sparkle appcast XML（`persistent.oaistatic.com/codex-app-prod/appcast.xml`），获取最新版本 ZIP 下载链接
  - Windows：通过 `fetch-msstore.js` 链式调用 MS Store API，获取 MSIX 离线包下载链接
  - 下载后解压：macOS 用 `ditto`（保留 symlinks + resource forks），Windows 用 `7zz`
  - 提取 `app.asar` → `npx asar extract` 到 `_asar/` 目录
  - 复制 `app.asar.unpacked/`（原生模块）和其他资源文件

### 2. `scripts/patch-devtools.js` — AST 补丁示例

- **职责：** 在混淆后的 JS bundle 中精确找到 `allowInspectElement` 和 `devTools` 属性，强制设为 `!0`（true）
- **实现要点：**
  - 用 `acorn` 将 `main(-xxx).js` 解析为 AST
  - 自定义 AST walker 遍历所有节点
  - Rule 1：匹配 `Property` 节点，key 为 `allowInspectElement`，value 不是 `!0`，替换为 `!0`
  - Rule 2：匹配 `Property` 节点，key 为 `devTools`，value 包含 `allowDevtools` 字样，替换为 `!0`
  - 按 source offset 从后往前替换，避免位置偏移

### 3. `scripts/build-from-upstream.js` — macOS/Windows 重打包

- **职责：** 将 patch 后的 `_asar/` 重新打包为 DMG（macOS）或 ZIP（Windows）
- **实现要点：**
  - macOS：复制 `Codex.app` → `asar pack` → 更新 `Info.plist` 的 `ElectronAsarIntegrity` → `codesign --remove-signature` → `codesign --sign -`（ad-hoc）→ `hdiutil create`
  - Windows：复制 MSIX `app/` 目录 → `asar pack` → 计算新旧 ASAR header SHA256 → 在 `Codex.exe` 中原位替换 hash → 替换 `codex.exe` → `7zz` 打包 ZIP
  - `@cometix/codex` 替换：通过 `resolveCodexVendor()` 解析平台特定 npm 包中的二进制文件

### 4. `scripts/fetch-msstore.js` — MS Store API 抓包（节选）

- **职责：** 逆向 Microsoft Store 的私有 API，获取指定应用的离线安装包
- **实现要点：**
  - 获取 FE3 认证 cookie
  - 查询应用信息（CategoryID）
  - 获取文件列表（package name、update ID、revision number、digest）
  - 构造下载 URL 并返回
  - 这是绕过 Windows Store 限制、获取 UWP/MSIX 离线安装包的标准技术

---

## GitNexus 图谱分析

> 补充：索引完成后（`gitnexus analyze --skills --drop-embeddings`），3 秒完成索引。688 nodes / 1,024 edges / 13 clusters / 43 flows。

### 索引统计

| 指标 | 数值 |
|------|------|
| 文件数 | 21 |
| 符号节点 | 688 |
| 代码关系边 | 1,024 |
| 功能聚类（Community） | 13 |
| 执行流（Process） | 43 |

### 聚类特征

GitNexus 检测到 **10 个功能聚类，全部命名为 "Scripts"**，因为项目的所有代码逻辑都集中在 `scripts/` 目录，无外部模块拆分。这是一个典型的**单层级脚本聚合项目**——每个脚本独立负责一个构建阶段，通过 `require('child_process')` 的 `execFileSync` 串行执行，而非模块间的函数调用。

聚类内聚合度（Cohesion）极高（最高 1.0，平均 0.93），说明每个脚本内部的函数联系紧密。

### 执行流（Process）分析

图谱捕捉到 43 条执行流，代表从入口到终端的函数调用链。关键流包括：

| 执行流 | 类型 | 步骤 | 说明 |
|--------|------|------|------|
| `Main → HttpsRequest` | cross_community | 5 | 主流程向 HTTP 模块发起请求（Sparkle appcast / MS Store API） |
| `SyncWin → HttpsRequest` | cross_community | 5 | Windows 同步流的 HTTP 调用链 |
| `Main → ClearDir` | intra_community | 5 | 清理临时目录的调用链，在多个脚本中重复出现 |
| `Main → ParseXml` | cross_community | 4 | 解析 Sparkle appcast XML 的流程 |
| `Main → DeepFind` | cross_community | 4 | 在 MS Store SOAP 响应中深度搜索节点的流程 |
| `Main → MakeSyncUpdatesSoap` | cross_community | 4 | 构造 MS Store 更新同步 SOAP 请求 |

**观察：** 所有跨聚类（cross_community）流都集中在 `sync-upstream.js` 和 `fetch-msstore.js` 中，这两个脚本是项目的"外部依赖边界"——它们负责与官方分发渠道交互，其他脚本则是纯粹的本地处理。

### 函数调用链验证

GitNexus 的 `CALLS` 边关系验证了手动分析中的关键调用链：

**`build-from-upstream.js` 调用链（验证通过）：**
```
main → buildMac / buildWin
    buildMac → clearDir → findApp → updateAsarIntegrity → replaceCodex → getVersion
    buildWin → clearDir → copyRecursive → computeAsarHeaderHash → patchExeHash → replaceCodex → getVersion
    replaceCodex → resolveCodexVendor
    resolveCodexVendor → clearDir
    updateAsarIntegrity → computeAsarHeaderHash
```

**补充发现：**
- `resolveCodexVendor` 内部也调用了 `clearDir`（用于清理 npm pack 的临时目录），这是手动阅读时容易忽略的细节
- `copyRecursive` 和 `findApp` 都是**递归自调用**，用于深度遍历目录树

**`sync-upstream.js` 调用链（验证通过）：**
```
main → getAppcastVersion / getWindowsVersion / syncMac / syncWin / loadVersions / saveVersions
    getWindowsVersion → getCookie → getAppInfo → getFileList → getDownloadUrl
    syncMac → curlDownload → extractArchive → assembleOutput
    assembleOutput → copyRecursive / clearDir / countFiles
    findResourcesDir → findFile
```

### Patch 脚本的重复模式

图谱揭示了一个重要的架构模式：**6 个 patch 脚本（patch-copyright、patch-fast-mode、patch-i18n、patch-statsig-logger、patch-plugin-auth、patch-devtools）都遵循同一的三步法**：

1. `walk` / `walkAST` — 遍历 AST 或文本
2. `collectPatches` / rule match — 收集匹配点
3. `main` — 应用补丁

这是一个**书写良好的补丁框架**，可通过 `patch-all.js` 顺序执行。只是 `patch-all.js` 通过 `execFileSync("node", [scriptPath])` 调用，这种进程间调用**不被 GitNexus 的 CALLS 边捕捉**，所以图谱中看不到 `patch-all → patch-devtools` 等边。这也说明为什么 GitNexus 的 process 数量（43）远小于脚本总数－进程间调用是"跳跃边"。

### 生成的 Repo Skill

GitNexus 自动生成了 `.claude/skills/generated/scripts/SKILL.md`，关键符号排行最前的是：
- `getWindowsVersion`（`sync-upstream.js:140`）
- `makeSyncUpdatesSoap` / `makeGetUrlSoap` / `httpsRequest` / `soapPost` / `parseXml`（`fetch-msstore.js`）
- `clearDir` / `copyRecursive` / `resolveCodexVendor` / `buildMac`（`build-from-upstream.js`）

这与手动分析中识别的核心文件完全一致。

### 图谱分析结论

GitNexus 对这个项目的价值有限，原因是：
- **无外部依赖模块**：所有代码在同一层级，无需分析跨模块调用关系
- **进程间调用为 shell-out**：`execFileSync` 不在图谱中表示，导致构建流水线的完整调用链被切断
- **无类/接口/继承关系**：纯函数式脚本，无面向对象结构

但图谱仍有以下补充价值：
- 验证了手动分析中的调用链（如 `buildMac → updateAsarIntegrity → computeAsarHeaderHash`）
- 揭示了 patch 脚本的重复模式（每个都是 walk → match → patch 的变体）
- 确认了项目的单层级特性：13 个 clusters 全部是 "Scripts"，无服务/模型/API 层分离

---

## 评分

| 维度 | 评分(1-5) | 说明 |
|------|----------|------|
| 功能覆盖度 | 4 | 成功让 Win/Linux 用上 Codex Desktop，功能基本完整 |
| 代码质量 | 2 | 无类型系统、无测试、基础错误处理；但脚本结构清晰 |
| 文档质量 | 3 | README 够用，但无深入文档、Changelog、故障排查 |
| 社区活跃度 | 3 | 1552 Stars 不错，但单作者、无外部贡献、Issue 响应一般 |
| 架构设计 | 3 | 构建流水线设计巧妙，AST 补丁思路好，但强耦合官方构建 |
| 学习价值 | 4 | Electron ASAR 操作、AST 补丁、MS Store 抓包、Sparkle 解析，技术栈丰富 |
| 可借鉴度 | 3 | ASAR 重包、AST 修改、跨平台 Electron 分发可直接复用；但法律风险限制了实际采用 |

**总分：22/35**

---

## 总结

### 一句话评价

一个技术实现精巧但法律与维护风险极高的 Electron 逆向重打包项目——它用 AST 补丁和 ASAR 手术刀让 Codex Desktop 跨了平台，但也把自己绑在了官方分发渠道的战车上。

### 谁应该用

- 个人开发者，在 Windows/Linux 上想**尝鲜** Codex Desktop GUI
- 对 Electron 逆向、ASAR 操作、AST 补丁感兴趣的技术学习者
- 需要参考 MS Store API 抓包或 Sparkle appcast 解析实现的开发者

### 谁不应该用

- 企业或团队（合规风险）
- 需要长期稳定维护的项目（脆弱的单点依赖）
- 无法容忍应用随时可能失效的用户
- Linux 生产环境用户（兼容性问题多）

### 下一步

1. **观望官方动态：** OpenAI 是否会在未来发布 Windows/Linux 原生版本？一旦官方支持，本项目立即失去存在价值
2. **关注 `@cometix/codex`：** 这是项目中真正有价值的独立产出——跨平台 codex CLI 二进制分发
3. **学习 AST 补丁技术：** `patch-devtools.js` 和 `patch-plugin-auth.js` 是优秀的 AST 逆向工程教学材料
4. **修正 CI bug：** 如继续使用，应先修复 Linux job 中 `patch-all.js mac-xxx` 的参数错误
