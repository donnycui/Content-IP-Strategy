# Provider Cutover Handoff

> Update on 2026-04-02: the latest active handoff is now documented in
> `docs/plans/2026-04-02-gateway-alias-cutover-handoff.md`.
> The notes below are historical context from the pre-alias cutover stage.
>
> Update on 2026-03-31: the latest cutover direction is now documented in
> `docs/plans/2026-03-31-gateway-alias-cutover.md`. The provider-direct routing
> notes below should be treated as historical context.

**Date:** 2026-03-26  
**Project:** `content-ip-research-workbench`

## 1. 这次改动的目标

这轮改动的核心目标有两类：

1. 修掉当前 Creator OS 主链路里已经确认的真实问题  
2. 把模型执行链从 `zhaocai-gateway` 切到本项目自己的 Provider 配置后台

其中第 2 点是这次最大的架构调整：

- 以前：`zhaocai-gateway` 同时承担“模型配置来源”和“运行时转发入口”
- 现在：本项目自己维护 Provider 连接、模型列表和 capability route，运行时直接请求 OpenAI 兼容 provider

## 2. 改了什么，为什么这么改

### 2.1 校准统计不再把同一条 signal 的重复编辑算成多个样本

**文件：**
- `lib/data.ts`

**原问题：**
- `getReviewCalibrationRows()` 直接聚合所有 `HumanReview`
- 同一条 signal 被编辑多次，会在校准统计里重复计数
- 结果会扭曲 `sampleSize`、`failureReasons` 和 prompt 调整建议

**修改方式：**
- 改成按 `signalId` 去重
- 每个 signal 只保留最新一条 review 进入校准统计

**为什么这么改：**
- 校准统计应该反映“当前人工判断”和“当前 AI 判断”的偏差
- 不应该把编辑次数误当成样本量

### 2.2 快捷复核不再冲掉详细复核

**文件：**
- `app/api/reviews/route.ts`
- `app/api/reviews/bulk/route.ts`
- `components/review-editor.tsx`

**原问题：**
- 快捷复核和批量复核每次都 `create` 新的 `HumanReview`
- 页面只展示最新一条 review
- 所以一条只带状态的快捷复核，会把之前填写完整分数、备注、角度的详细复核“顶掉”

**修改方式：**
- 单条复核：优先更新 signal 最新一条 review，找不到才新建
- 批量复核：每个 signal 优先更新最近一条 review，找不到才新建
- 详细复核表单在清空值时，显式发 `null`，避免旧值被错误保留

**为什么这么改：**
- 复核页面看的应该是当前有效复核，不是最近一次随手点击
- 这样用户不会丢掉自己之前认真写的判断

### 2.3 重新生成草稿不再覆盖人工修改

**文件：**
- `app/api/drafts/route.ts`

**原问题：**
- 只要已有 draft，再点“生成草稿”就会直接 update 覆盖内容
- 人工手改过的标题和正文会被静默冲掉

**修改方式：**
- 如果 draft 已经被人工编辑过，或者状态已经不是 `DRAFT`
- 接口直接返回 `409`
- 提示当前不会自动重新生成，避免覆盖现有内容

**为什么这么改：**
- 对雏形项目来说，先保证“不会丢人工工作成果”比做版本系统更重要
- 这是最小、最稳的止血方案

### 2.4 signal 详情页不再只依赖最近 50 条列表数据

**文件：**
- `lib/data.ts`

**原问题：**
- `getSignalById()` 之前不是按主键查库
- 它先取最近 50 条 signal，再在内存里过滤
- 旧 signal 虽然数据库里存在，但详情页会 404

**修改方式：**
- 抽出统一的 `mapSignalRecord()`
- `getSignals()` 继续服务列表页
- `getSignalById()` 改成单独按 id 查询数据库

**为什么这么改：**
- 列表页和详情页的数据需求不一样
- 详情页必须按实体主键查，不应该复用截断列表

### 2.5 signal 详情页的 research card 预览不再串台

**文件：**
- `lib/data.ts`
- `app/signals/[id]/page.tsx`

**原问题：**
- 页面之前拿的是“全局最近更新的一张 research card”
- 这张卡不一定和当前 signal 相关
- 没有 research card 时甚至还会显示 mock 数据

**修改方式：**
- `getResearchCardPreview(signalId?)` 支持按当前 signal 查关联 cluster 下的 research card
- 查不到时返回 `null`
- 页面上改成明确提示“当前没有关联研究卡”
- 工作流跳转也改成动态链接，不再写死 `/research/demo`、`/drafts/demo`

**为什么这么改：**
- 这个页面不能再给用户错误上下文
- 预览如果不准确，比不显示更危险

## 3. 加了什么内容，为什么这么加

### 3.1 新增 OpenAI 兼容 endpoint 规范化工具

**文件：**
- `lib/models/openai-endpoints.ts`

**新增内容：**
- `buildOpenAiApiEndpoint(baseUrl, path)`

**为什么新增：**
- 现在要直接连 provider
- 不同 provider / 配置里，Base URL 可能是：
  - `https://api.openai.com`
  - `https://api.openai.com/v1`
- 如果不统一处理，很容易出现 `/v1` 重复或缺失

### 3.2 新增 Provider 切换设计与实施文档

**文件：**
- `docs/plans/2026-03-26-provider-managed-model-routing-design.md`
- `docs/plans/2026-03-26-provider-managed-model-routing-implementation-plan.md`

**为什么新增：**
- 这次不是小修补，是一次真正的执行链切换
- 需要给后续接手的人清楚记录设计边界和实施顺序

### 3.3 新增本次交接手册

**文件：**
- `docs/plans/2026-03-26-provider-cutover-handoff.md`

**为什么新增：**
- 这一轮改动横跨 review、draft、signal、provider routing、数据库配置
- 只看 git diff 很难快速理解背景和当前状态

## 4. Provider 切换具体做了什么

### 4.1 后台语义从“Gateway”改成“Provider”

**文件：**
- `app/admin/gateways/page.tsx`
- `components/admin-gateway-create-form.tsx`
- `components/admin-gateway-actions.tsx`
- `app/admin/models/page.tsx`
- `app/api/admin/gateways/route.ts`
- `app/api/admin/gateways/[id]/test/route.ts`
- `app/api/admin/gateways/[id]/sync/route.ts`
- `lib/domain/contracts.ts`

**修改内容：**
- 后台页面文案改成 “Model Providers / Provider 连接”
- 表单默认值不再是 `zhaocai-gateway`
- 创建 Provider 默认值改为：
  - name: `openai-primary`
  - authSecretRef: `OPENAI_API_KEY`
- 测试/同步返回值去掉对 `providersStatus/providersCount` 的依赖

### 4.2 同步和测试逻辑不再要求 `/v1/providers`

**文件：**
- `lib/services/gateway-admin-service.ts`
- `lib/services/gateway-sync-service.ts`

**修改内容：**
- Provider 连接测试只测 `/v1/models`
- 模型同步只从 `/v1/models` 拉可用模型
- `providerKey` 优先使用 `owned_by`，没有就回退为连接名
- capabilityTags 记录来源改成 `source: "provider"`

**为什么这么改：**
- `zhaocai-gateway` 这类聚合服务才有 `/v1/providers`
- 但 OpenAI 兼容 provider 一般只有 `/v1/models`
- 这次切换就是要让系统面向 provider 直连，而不是依赖聚合网关特性

### 4.3 运行时已经切换到新的直连 Provider

**数据库操作结果：**
- 新建了 `openai-primary`
- Base URL：`https://ai.qaq.al/v1`
- 鉴权方式：`BEARER`
- 密钥环境变量：`OPENAI_API_KEY`

**同步结果：**
- 已同步 10 个模型

**当前 capability route：**
- `signal_scoring` -> `gpt-5.2`，fallback `gpt-5.4`
- `topic_generation` -> `gpt-5.2`，fallback `gpt-5.4`
- `topic_candidate_generation` -> `gpt-5.2`，fallback `gpt-5.4`
- `draft_generation` -> `gpt-5.2`，fallback `gpt-5.4`
- `ip_extraction_interview` -> `gpt-5.4`，fallback `gpt-5.2`
- `ip_strategy_report` -> `gpt-5.4`，fallback `gpt-5.2`
- `direction_generation` -> `gpt-5.4`，fallback `gpt-5.2`
- `profile_evolution` -> `gpt-5.4`，fallback `gpt-5.2`

## 5. 旧 `zhaocai-gateway` 的处理方式

这次没有删除旧数据，而是做了**安全下线**：

- `zhaocai-gateway.isActive = false`
- 其下所有 `ManagedModel.enabled = false`
- 同时把 `visibleToUsers = false`

**为什么这么做：**
- 这样不会再被后台误选
- 但如果后面需要回滚，还保留着原始连接与模型数据

## 6. 当前配置逻辑

### 6.1 运行时如何选模型

**核心文件：**
- `lib/services/model-routing-service.ts`
- `lib/services/structured-generation-service.ts`
- `lib/models/gateway-client.ts`

**当前逻辑：**
- 有数据库时：
  - 先查 `CapabilityRoute`
  - 找到 `ManagedModel`
  - 找到对应 `GatewayConnection`（现语义为 Provider 连接）
  - 根据 `authSecretRef` 去 `process.env[...]` 读取密钥
  - 按 `protocol + baseUrl + modelKey` 发请求
- 没数据库或没路由时：
  - 回退到环境变量：
    - `SIGNAL_SCORING_BASE_URL`
    - `SIGNAL_SCORING_MODEL`
    - `OPENAI_API_KEY`

### 6.2 当前实际主路径

当前主路径已经不是 `zhaocai-gateway`：

- 当前主路径：数据库 capability route -> `openai-primary`
- 当前备用回退：`.env.local` 的 `SIGNAL_SCORING_*` + `OPENAI_API_KEY`

## 7. 测试与验证结果

### 已通过

- `tsc --noEmit`
- `next build` 的关键阶段：
  - 编译
  - lint / type checking
  - collecting page data
  - generating static pages

### 构建问题处理

之前构建卡在 `sharp` 依赖读取超时。  
已在 `next.config.ts` 中设置：

- `images.unoptimized = true`

**为什么这样做：**
- 当前项目没有使用 `next/image`
- 也没有 `icon/opengraph-image/twitter-image` 这类图片生成入口
- 对雏形项目来说，先让构建稳定比保留默认图片优化更重要

### 还没做的

- 还没有完成最终的人工 smoke test
- 还没有完成 GitHub 提交、推送、Vercel 部署后的线上 smoke test

## 8. 接下来还要做什么

### 8.1 先做代码交付

- 提交当前改动
- 推送到 GitHub
- 触发 Vercel 部署

### 8.2 然后做人工 smoke test

建议顺序：

1. 本地 / 当前环境后台检查
   - 打开 Provider 页面
   - 确认 `openai-primary` 存在
   - 确认 `zhaocai-gateway` 已停用
   - 确认模型列表只保留新的启用模型

2. 主业务流程验证
   - signal scoring
   - 画像提炼
   - 方向生成 / 主题生成
   - draft generation

3. 已修问题回归
   - 同一条 signal 多次复核，校准样本数不重复放大
   - 快捷复核后，详细复核内容不会丢
   - 手工修改后的 draft 不会被“重新生成草稿”覆盖
   - 旧 signal 详情页不再 404
   - signal 详情页不会显示错误 research card

4. Vercel 线上验证
   - Vercel 环境变量是否齐全
   - 线上是否能正常直连 `openai-primary`
   - 数据库连接是否稳定

### 8.3 可选后续优化

以下不是必须立即做，但建议后续安排：

- 把 `GatewayConnection` 正式重命名为更准确的 `ProviderConnection`
- 给模型后台增加“手动添加模型”入口，而不只依赖 `/v1/models` 同步
- 继续收口 mock/live 混用问题，减少“假可用”页面
- 给关键链路补最小自动化测试
- 把旧的历史设计文档里与 `zhaocai-gateway` 绑定过深的部分标记为 historical

## 9. 回滚方式

如果这次 provider 切换后出现问题，最小回滚方式是：

1. 重新启用 `zhaocai-gateway` 连接
2. 把其下 `ManagedModel.enabled` 恢复为 `true`
3. 把 `CapabilityRoute` 的默认模型 / fallback 模型重新指回旧连接下的模型

由于旧数据没有删除，所以目前仍可回滚。
