# miaomiaowu（妙妙屋）技术报告

> **仓库**：https://github.com/iluobei/miaomiaowu  
> **观测日期**：2026-05-06  
> **分析版本**：v0.6.5 (2026-04-25)  
> **分类**：proxy-subscription-manager（代理订阅管理工具）

---

## 一句话定位

个人 Clash/Mihomo 订阅管理系统，支持节点管理、订阅生成、流量聚合统计，带可视化 Web 界面。类似 [subconverter](https://github.com/tindy2013/subconverter) 但侧重**订阅生命周期管理**而非纯格式转换。

---

## 第一层：定位与画像

| 指标 | 数值 |
|------|------|
| Stars | 732 |
| Forks | 89 |
| Open Issues | 11 |
| License | MIT |
| 主要语言 | Go（后端）+ TypeScript（前端） |
| 首次提交 | ~2024 下半年（从 v0.1.1 历史推算） |
| 最新 Release | v0.6.5 (2026-04-25) |
| 最近提交 | 10 小时前（活跃维护） |
| 贡献者 | 主要为 iluobei（单作者为主） |

**类比法**：像 subconverter + 简易版 Nezha Dashboard 的缝合体，但做成了一体化 Web UI，降低了非技术用户门槛。

---

## 第二层：架构解剖

### 2.1 目录结构

```
miaomiaowu/
├── cmd/server/           # 入口：HTTP 服务启动、路由注册、后台任务调度
├── internal/
│   ├── auth/             # JWT 认证 + TokenStore + 用户仓库适配器
│   ├── handler/          # HTTP 路由处理器（~40 个文件，核心逻辑层）
│   ├── logger/           # 结构化日志 + 日志清理管理器
│   ├── proxygroups/      # 代理组配置解析与内存存储
│   ├── storage/          # SQLite 数据访问层（traffic.go 等）
│   ├── substore/         # 订阅文件持久化 + 模板引擎 + 协议解析
│   ├── util/             # 工具函数
│   ├── validator/        # 输入校验
│   ├── version/          # 版本信息
│   └── web/              # 前端静态资源嵌入（go:embed dist）
├── miaomiaowu/           # React 前端源码
│   ├── src/components/   # UI 组件（Radix UI + Tailwind）
│   ├── src/routes/       # TanStack Router 路由
│   ├── src/stores/       # Zustand 状态管理
│   ├── src/hooks/        # 自定义 React Hooks
│   └── src/lib/          # 工具函数 / API 客户端
├── configs/              # 默认配置 JSON
├── proxy_groups/         # 代理组预设模板
├── rule_templates/       # 规则模板（嵌入到二进制）
├── subscribes/           # 订阅文件存放（运行时卷）
└── scripts/              # 构建辅助脚本
```

### 2.2 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 后端运行时 | Go 1.24 | 标准库 HTTP server，无框架依赖 |
| 数据库 | SQLite (modernc.org/sqlite) | CGO-free 实现，单文件免运维 |
| 前端框架 | React 19 + TypeScript 5.9 | |
| 构建工具 | Vite 7 + SWC | 快速编译 |
| 路由 | TanStack Router | 文件系统路由 |
| 状态管理 | Zustand 5 | 轻量全局状态 |
| 服务端请求 | TanStack Query 5 | 数据获取 + 缓存 |
| UI 组件 | Radix UI + Tailwind CSS 4 + shadcn/ui | 无样式组件 + 原子 CSS |
| 图表 | Recharts | 流量趋势图 |
| 拖拽 | @dnd-kit | 代理分组拖拽排序 |
| 验证 | react-hook-form | 表单处理 |

### 2.3 核心架构图

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│  React 19 + Vite + TanStack Router + Zustand + Recharts │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/JSON
┌────────────────────────▼────────────────────────────────┐
│                    Go HTTP Server                       │
│  (标准库 net/http + ServeMux，无外部 Web 框架)          │
├──────────────┬──────────────┬──────────────┬────────────┤
│  Auth Layer  │  API Routes  │  Middleware  │  Static FS │
│  (JWT+Token) │  (~40 handlers) │ (CORS+SilentMode) │ (go:embed) │
└──────┬───────┴──────┬───────┴──────┬───────┴─────┬──────┘
       │              │              │             │
┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐ ┌────▼─────┐
│  SQLite DB  │ │ Subscribe│ │  Rule/Proxy │ │  External │
│  (traffic.db)│ │ Files    │ │  Templates  │ │  Probe API│
│             │ │ (YAML)   │ │  (YAML/JSON)│ │ (Nezha/   │
│  - users    │ │          │ │             │ │  DStatus/ │
│  - nodes    │ │          │ │             │ │  Komari)  │
│  - sessions │ │          │ │             │ │           │
│  - traffic  │ │          │ │             │ │           │
└─────────────┘ └──────────┘ └─────────────┘ └───────────┘
```

### 2.4 关键设计决策

1. **单二进制部署**：Go 编译时通过 `go:embed` 将前端 dist 目录打包进二进制，实现零依赖单文件运行
2. **标准库 HTTP**：拒绝 Gin/Echo 等框架，直接用 `net/http.ServeMux`，降低依赖面
3. **CGO SQLite**：Docker 镜像中使用 `debian:bookworm-slim` + gcc 编译，生产环境用 modernc.org/sqlite（纯 Go）避免 CGO 兼容性问题
4. **文件+数据库双存储**：订阅配置存 YAML 文件（便于外部编辑），元数据存 SQLite（便于查询统计）
5. **静默模式**：通过中间件拦截非订阅请求，暴露公网时隐藏管理界面
6. **暴力探测防护**：短链接访问失败时记录 IP，超过阈值返回 404

---

## 第三层：质量与成熟度

### 3.1 代码质量

| 维度 | 评估 |
|------|------|
| 类型系统 | Go 后端无泛型滥用，TypeScript 前端有 `@types` 覆盖 |
| 错误处理 | Go 侧遵循 `if err != nil` 模式，但部分 handler 文件过长（subscription.go 2100+ 行） |
| 代码风格 | 有 ESLint + Prettier 配置，CI 中运行但 `continue-on-error: true` |
| 文件大小 | `internal/handler/subscription.go` (2104 行)、`proxy_parser.go` (1478 行) 偏大，职责可进一步拆分 |
| 未使用代码检测 | Knip 配置存在，但 CI 中标记为 `continue-on-error` |

### 3.2 测试

- **测试文件**：7 个，集中在 `internal/substore/`（模板解析、ACL 解析、代理组生成）
- **测试覆盖率**：目测较低，核心业务逻辑（handler 层）缺乏单元测试
- **CI**：不运行 `go test`，只跑 `go mod verify` + build + frontend lint

### 3.3 CI/CD

| 流水线 | 状态 |
|--------|------|
| Lint & Test | Go mod verify + npm lint/format/knip（均 continue-on-error） |
| Build | 交叉编译 linux/amd64、linux/arm64、windows/amd64 |
| Docker | Buildx 多平台推送到 ghcr.io |
| Release | Tag 触发，自动生成 checksums + Release Notes |

**评价**：CI 配置合理，但测试环节薄弱。`continue-on-error: true` 说明作者对前端 lint 稳定性没信心，可能项目处于快速迭代期。

### 3.4 文档

- **README**：中文，包含部署指南、截图、更新日志，质量较好
- **文档站点**：https://docs.miaomiaowu.net（独立文档站）
- **API 文档**：无 OpenAPI/Swagger，需读源码理解接口
- **Changelog**：README 中包含详细版本日志，按版本号组织

### 3.5 Issue/PR 健康度

- Issues 仅 11 个（相对 732 stars 比例很低），说明 either 项目较新，either 作者响应快
- 无 PR 记录（可能单作者开发，社区贡献尚未打开）
- 版本发布频繁：从 v0.1.1 到 v0.6.5 约 8 个月，平均 ~10 天一个版本

---

## 第四层：社区与生态

### 4.1 竞品对比

| 项目 | Stars | 定位 | 与 miaomiaowu 差异 |
|------|-------|------|-------------------|
| [subconverter](https://github.com/tindy2013/subconverter) | 16k+ | 订阅格式转换后端 | 无 UI，纯 API；miaomiaowu 有完整管理界面 |
| [SubStore](https://github.com/sub-store-org/Sub-Store) | 7k+ | 高级订阅管理（Surge/QuantumultX 脚本） | 依赖宿主 APP 脚本环境；miaomiaowu 独立部署 |
| [v2ray-subscribe](https://github.com) | 小 | 简单订阅转换 | 功能单一 |
| [DolbyIO/subconverter-web](https://github.com) | 小 | subconverter 的 Web UI | 仅做格式转换，无节点/流量管理 |

**生态位**：miaomiaowu 填补了"带 Web UI 的轻量级订阅管理 + 流量监控"这一细分市场，面向个人或小团体自建机场管理场景。

### 4.2 衍生项目/插件

- 无明显的第三方插件生态
- 项目内置支持从 GitHub 拉取代理组模板（`proxy-groups.json`），有一定可扩展性
- 模板引擎 v3 支持 YAML 变量和自定义规则，可视为轻量级插件机制

---

## 第五层：双场景评估

### 场景一：是否值得采用

| 评估维度 | 结论 |
|----------|------|
| **核心能力** | 节点导入（Clash/SS/VMess/Vless/Trojan/Hysteria2/WireGuard）、多客户端订阅生成、流量聚合统计、用户权限管理 |
| **边界** | 不是代理软件本身（无实际代理功能），只是配置管理器；不支持复杂负载均衡算法 |
| **集成成本** | 极低：单 Docker 容器部署，SQLite 免运维 |
| **学习曲线** | 低：有 Web UI，非技术用户可操作 |
| **demo 时间** | 5 分钟 docker run 即可跑起来 |
| **许可证合规** | MIT，可商用 |
| **Bus factor** | ⚠️ 低：单作者为主，社区贡献者少 |
| **供应商锁定** | 低：订阅输出为标准 Clash/Surge 格式，数据为 SQLite + YAML，易于迁移 |
| **维护趋势** | ✅ 高：版本迭代快，Issue 响应活跃 |
| **安全历史** | v0.5.0 专门做了"重要安全性优化"，说明作者有安全意识；但无第三方安全审计 |

**结论：推荐采用（个人/小团队场景）**

适用场景：
- 自建 Clash/Mihomo 机场，需要统一管理节点和订阅
- 多人共享机场，需要区分管理员/普通用户权限
- 有 Nezha/DStatus 探针，想聚合展示流量统计

不适用：
- 大型商业机场（缺乏多租户隔离、计费系统）
- 需要高并发订阅分发（SQLite 单文件并发有限）

### 场景二：技术架构学习

| 设计决策 | Trade-off | 可借鉴度 |
|----------|-----------|---------|
| 单二进制 + go:embed 前端 | 部署极简，但前端更新需重新编译后端 | ⭐⭐⭐⭐ |
| 标准库 HTTP 而非框架 | 零依赖，但手写路由注册繁琐（main.go 中 40+ 行手动 Handle） | ⭐⭐⭐ |
| SQLite + YAML 双存储 | 兼顾查询性能和人工可编辑性，但数据一致性需手动维护 | ⭐⭐⭐ |
| 模板引擎 v3 设计 | 通过 YAML 变量实现配置复用，轻量但功能有限 | ⭐⭐⭐ |
| 静默模式中间件 | 公网暴露时隐藏管理界面，简单有效的安全层 | ⭐⭐⭐⭐ |
| 暴力探测防护 | 基于内存的 IP 限流，重启后状态丢失（非持久化） | ⭐⭐ |

**值得学习的模式**：
1. **go:embed 静态资源**：前端独立构建后嵌入 Go 二进制，实现单文件交付
2. **JWT + TokenStore 双认证**：支持有状态会话（TokenStore 内存 + 数据库存储），也支持无状态 JWT
3. **文件系统同步到数据库**：启动时扫描 YAML 文件同步到 SQLite，兼容旧版本数据迁移
4. **探针流量聚合抽象**：统一接口聚合 Nezha/DStatus/Komari 三种探针数据

**反模式/踩坑点**：
1. **Handler 文件过大**：`subscription.go` 2100+ 行，`proxy_parser.go` 1470+ 行，SRP 原则被突破
2. **缺少接口层**：storage 层直接暴露 struct，没有 Repository 接口，测试/mock 困难
3. **CI 不跑测试**：`continue-on-error` 过多，质量门禁形同虚设
4. **CGO 交叉编译复杂性**：Dockerfile 中需要 gcc + libc6-dev，增加了多平台构建复杂度

---

## 核心文件/函数走读

### 1. `cmd/server/main.go` — 服务启动 orchestrator
- 初始化顺序：logger → SQLite → auth → token store → proxy groups → HTTP routes → background jobs
- 优雅关闭：signal 捕获 → context cancel → server.Shutdown
- **亮点**：`syncSubscribeFilesToDatabase` 函数处理版本升级时的文件→数据库迁移

### 2. `internal/handler/subscription.go` — 订阅生成核心
- 支持 clash/surge/loon/stash/v2ray/sing-box/shadowrocket 等 10+ 客户端格式
- Token 失效时返回"订阅已过期"的兜底 YAML（避免客户端空配置报错）
- **注意**：文件过长，包含生成、缓存、短链接、临时订阅多个职责

### 3. `internal/handler/proxy_parser.go` — 协议解析器
- 处理 SS/VMess/Vless/Trojan/Hysteria2/TUIC/WireGuard 等协议的 URL 解析和 YAML 序列化
- 包含大量客户端兼容性处理（如 Shadowrocket vs Loon 的参数差异）
- **注意**：1478 行的工具函数集合，缺乏结构化抽象

### 4. `internal/substore/template_v3.go` — 模板引擎 v3
- 支持 YAML 变量替换、代理组动态生成、规则集引用
- 支持从远程 URL 拉取模板，实现配置的"热更新"

---

## 评分（1-5）

| 维度 | 评分 | 说明 |
|------|------|------|
| 功能覆盖度 | 4 | 个人订阅管理场景覆盖全面，但缺乏企业级功能（计费、多租户） |
| 代码质量 | 3 | 功能正确但架构债务明显（大文件、缺接口、测试少） |
| 文档质量 | 4 | README + 独立文档站 + Demo，入门友好 |
| 社区活跃度 | 3 | 版本迭代快，但单作者为主，社区贡献有限 |
| 架构设计 | 3 | 单二进制部署设计优秀，但内部模块化不足 |
| 学习价值 | 4 | go:embed、SQLite 单文件应用、多协议解析有参考价值 |
| 可借鉴度 | 4 | 可直接学习其部署模式和协议解析逻辑 |

**总分：25/35**

---

## 总结

miaomiaowu 是一个**功能完整、部署简单、迭代活跃**的个人订阅管理工具。其最大亮点是"单二进制 + Web UI + SQLite"的极简部署体验，适合技术爱好者自建机场管理节点和订阅。

从工程角度，项目处于**快速功能迭代期**，内部代码结构有优化空间（handler 拆分、补测试、引入接口层）。但从用户角度，它解决了"管理 Clash 订阅"这一痛点，且 MIT 协议友好，值得在个人/小团队场景采用。

**技术选型建议**：
- 若你需要**快速搭建一个带 Web UI 的订阅管理平台** → 直接用 miaomiaowu
- 若你需要**纯后端订阅转换 API** → 用 subconverter
- 若你需要**Surge/QuantumultX 脚本化高级管理** → 用 Sub-Store
- 若你在**学习如何构建单二进制全栈 Go 应用** → miaomiaowu 是不错的参考案例
