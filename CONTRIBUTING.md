# Contributing to Technical Knockout

感谢你愿意为 Technical Knockout（TK）贡献项目分析、修正和横评。

TK 的目标是沉淀可复用的开源项目技术研究资产。贡献不要求“观点一致”，但要求证据清楚、结构稳定、结论可追溯。

## 可以贡献什么

- 新项目分析报告。
- 既有报告的事实修正。
- 新版本 / 新 Release 后的报告更新。
- 同类项目横评。
- 评分、风险、许可证、社区健康度修正。
- 方法论、模板、分类体系改进。

## 提交新项目

建议先开 Issue，说明：

- 项目名称和仓库 URL。
- 为什么值得分析。
- 你关注的是采用选型、架构学习，还是同类横评。
- 是否有特定问题需要回答。

如果直接提交 PR，请基于 [`reports/_TEMPLATE.md`](./reports/_TEMPLATE.md) 新增报告。

## 报告要求

每份正式报告都必须先满足 **TK Report Contract v1**。

### Required H2（hard gate）

1. `基本信息`
2. `场景一：是否值得采用`
3. `场景二：技术架构学习`
4. `质量与成熟度`
5. `社区与生态`
6. `评分`
7. `总结`

### Required H3（hard gate）

- `场景一：是否值得采用`：`解决的问题` / `核心能力与边界` / `结论`
- `场景二：技术架构学习`：`核心架构图`
- `质量与成熟度`：`代码质量`

### Recommended but not blocking

- `架构解剖`
- `关键代码走读`
- `依赖 / SDK 选型证据`
- `风险评估`
- `底层技术架构`
- `测试` / `CI/CD` / `文档质量` / `Issue / PR 健康度`
- `衍生项目 / 插件生态` / `竞品对比`
- `一句话评价` / `谁应该用` / `谁不应该直接用` / `下一步`

底层技术架构必须覆盖：

- 最小架构内核
- 核心抽象
- 控制面 / 数据面
- 关键执行链路
- 状态模型
- 契约边界
- 失败与降级模型
- 可复刻设计不变量

完整标准见 [`METHODOLOGY.md`](./METHODOLOGY.md) 与 [`docs/tk-report-structure-contract-v1.md`](./docs/tk-report-structure-contract-v1.md)。

## 证据要求

请尽量引用：

- 源码文件路径和函数 / 类名。
- README、docs、changelog、release notes。
- Issue / PR 证据。
- 实测命令和真实输出。
- 竞品或生态项目链接。

不要编造：

- 未运行过的测试结果。
- 未查询过的 GitHub 数据。
- 未验证过的 API 行为。
- 项目不存在的功能。

如果无法验证，请明确写“未验证”“文档声称”“源码中未找到”。

## 报告命名

- 单项目报告：`reports/<repo-name>.md`
- 横评：`comparisons/<category>.md`
- 使用仓库名，不使用完整 `org/repo` 作为文件路径。

示例：

```text
reports/codegraph.md
reports/agent-reach.md
comparisons/code-intelligence.md
```

## 更新索引

新增或删除报告时，需要更新 [`README.md`](./README.md) 的 Project Index。

同类项目已有横评时，也应更新对应 `comparisons/<category>.md`。

## 分类原则

分类应基于项目真实产品边界，而不是表面关键词。

例如：

- 独立 Coding Agent 平台 ≠ Agent workflow 插件。
- Code ingestion 工具 ≠ Code intelligence 图谱系统。
- 完整企业 RAG 平台 ≠ GraphRAG 检索内核。
- Remote ops 控制面 ≠ 极简 SSH MCP server。

如果分类不确定，可以在 PR 中说明候选分类和理由。

## 本地源码缓存

TK 维护时通常会把待分析仓库 clone 到本地 `projects/`，但 `projects/` 不属于本仓库内容，不应提交。

推荐使用 TK CLI 同步和检查源码缓存。仓库根目录是 npm workspace，依赖安装、验证和发布预检都从根目录执行：

```bash
node packages/tk/bin/tk.mjs source sync --missing
node packages/tk/bin/tk.mjs source status --json
node packages/tk/bin/tk.mjs source path gitnexus --json
node packages/tk/bin/tk.mjs report audit
node packages/tk/bin/tk.mjs report lint --write
node packages/tk/bin/tk.mjs doctor
npm run verify
npm run publish:tk -- --dry-run
```

请不要提交：

- 克隆的第三方源码。
- 本地配置文件。
- token、cookie、API key。
- 构建缓存、虚拟环境、node_modules、dist。

## Pull Request checklist

提交 PR 前请确认：

- [ ] 报告基于 `reports/_TEMPLATE.md` 或保持同等结构。
- [ ] README Project Index 已更新。
- [ ] 横评已更新，或说明为什么不需要横评。
- [ ] `node packages/tk/bin/tk.mjs report audit` 已运行并检查 warning / fail 面。
- [ ] `node packages/tk/bin/tk.mjs report lint --write` 通过。
- [ ] `node packages/tk/bin/tk.mjs catalog validate` 通过。
- [ ] `node packages/tk/bin/tk.mjs doctor` 已运行，或说明未运行原因。
- [ ] 改动 `packages/tk` 或 Agent 插件适配层时，`npm run verify` 通过。
- [ ] 改动 npm 包分发内容时，`npm run publish:tk -- --dry-run` 通过。
- [ ] 数据指标注明观察日期。
- [ ] 采用建议区分个人 / 小团队 / 企业生产化。
- [ ] 关键结论有证据来源。
- [ ] 没有提交本地源码、配置或凭证。
- [ ] Markdown 链接有效。

## 对被分析项目维护者

如果你的项目被 TK 分析，欢迎提交事实修正或补充证据。TK 会保留独立判断，但会优先修正可验证的事实错误。
