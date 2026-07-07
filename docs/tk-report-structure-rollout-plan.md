# TK Report Structure Rollout Plan

本文档描述 TK 报告结构治理的落地顺序，目标是把仓库从“旧结构 / 新结构混用的半迁移态”收敛到可维护状态。

## Goal

把报告层治理成以下形态：

- canonical 章节命名冻结
- 结构 audit / lint 成为正式 gate
- 低风险标题漂移可自动修复
- 真正的结构缺口与叙事差异被区分开
- 报告正文、npm snapshot、catalog/lock 与文档入口一起收口

## Non-goals

这轮治理 **不** 追求：

- 一次性重写所有报告措辞
- 让每篇报告都拥有完全相同的叙事长度
- 把所有推荐章节都升级成 hard gate
- 以“删掉旧报告”代替迁移

## Rollout Phases

### Phase 1 — Freeze contract

产物：

- `packages/tk/lib/report-structure.mjs`
- `docs/tk-report-structure-contract-v1.md`
- `packages/tk/schemas/report-structure-audit.schema.json`

要求：

- 冻结 required H2 / required H3
- 冻结 recommended H2 / recommended H3
- 冻结 alias map
- 冻结 audit artifact path

### Phase 2 — Wire audit / lint / fix into product surface

产物：

- `tk report audit`
- `tk report lint`
- `tk report fix-headings`
- `tk doctor repo`
- `npm run verify --workspace @jarl_okbe/tk`

要求：

- audit 可输出 human-readable 与 JSON
- lint 遇到 fail 非 0 退出
- `--write` 可以落盘最新审计结果
- verify 链正式包含 report lint

### Phase 3 — Sync docs

最少同步这些文档：

- `README.md`
- `METHODOLOGY.md`
- `CONTRIBUTING.md`
- `reports/_TEMPLATE.md`
- `packages/tk/README.md`
- `docs/tk-agent-plugin-architecture.md`

要求：

- 文档口径从“随意的五层长文”收敛到“contract + dual-scenario + strict/warn split”
- command examples 与真实 CLI 对齐
- 报告结构治理不再只存在于代码里

### Phase 4 — Migrate reports in two lanes

#### Lane A: low-risk automatic normalization

通过 `tk report fix-headings --write` 处理：

- 明确别名 → canonical 标题
- 旧层级标题（如 `第五层：...`）能安全剥离时优先修正
- 不改写正文判断，不重排大段论证

#### Lane B: manual structural repair

只对真正 fail 的报告人工修：

- 缺 required H2
- 缺 required H3
- 核心场景章节没有落到正确父级
- 旧结构导致双场景内容无法被 contract 识别

## Migration Triage

每份报告只分三类，避免无边界返工：

| Tier | Definition | Action |
|---|---|---|
| A | 已满足 hard gate，只剩 warn | 暂不阻断；按需慢慢补推荐章节 |
| B | 结构正确，但标题 alias / 父子层级轻微漂移 | 优先自动修复 |
| C | 缺核心骨架，`report lint` 失败 | 必须人工修正文 |

## Snapshot / Index Sync Rule

只要正式报告正文被修改，就要同步检查这些机器层：

- `packages/tk/data/reports/*.md`
- `packages/tk/data/tk.catalog.json`
- `packages/tk/data/tk.lock.json`

原则：

1. 报告层是 human-readable source of judgment
2. package data snapshots 是 npm 分发镜像
3. catalog / lock 是 machine-readable index 层
4. 三者不能长期漂移

## Acceptance Commands

收口前至少执行：

```bash
node packages/tk/bin/tk.mjs report audit --json
node packages/tk/bin/tk.mjs report lint --write
node packages/tk/bin/tk.mjs doctor repo --json
npm run verify --workspace @jarl_okbe/tk
```

如果本轮修改了正式报告正文，还应补做：

```bash
node packages/tk/bin/tk.mjs catalog build
node packages/tk/bin/tk.mjs catalog validate
```

## Release Rule

只有在以下条件同时满足时，这轮治理才算完成：

- `report lint` 无 fail
- `doctor repo` 通过
- 文档入口已经同步
- 报告 snapshots 已同步
- catalog / lock 没有与正文脱节

## One-line policy

> 先冻结 contract，再把 audit/lint 接进产品面，再自动归一低风险漂移，最后只人工修真正的结构缺口。
