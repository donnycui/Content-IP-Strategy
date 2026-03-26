# Provider-Managed Model Routing Design

**Date:** 2026-03-26

## Goal

让 `content-ip-research-workbench` 使用自己的模型配置后台，直接连接 OpenAI 兼容 provider，不再依赖 `zhaocai-gateway` 作为运行时转发入口。

## Current Problem

- 现有后台已经具备“连接、同步模型、按 capability 路由”的基本能力，但语义仍然绑定在“网关”上。
- 运行时主链路当前把 `GatewayConnection.baseUrl` 直接当作模型请求入口使用，因此数据库里现有的 `zhaocai-gateway` 连接仍然是实际执行路径。
- 后台测试和同步逻辑假设对端提供 `/v1/providers` 和 `/v1/models`，这对独立 provider 并不通用。
- 文案和默认值仍然围绕 `zhaocai-gateway`，不适合继续作为本项目自己的模型后台。

## Decision

第一阶段不重命名 Prisma 表，也不引入新的 Provider 实体，而是直接把现有 `GatewayConnection` 在业务语义上视为“模型 Provider 连接”。

这意味着：

- `GatewayConnection` 负责保存 provider 的 Base URL、鉴权方式、密钥环境变量名。
- `ManagedModel` 继续表示该连接下的可用模型。
- `CapabilityRoute` 继续表示业务能力到模型的路由规则。
- 后台保留现有页面结构，只把文案和默认值调整为 provider 语义。
- 模型同步/测试逻辑从“依赖自定义 gateway 能力”改成“面向 OpenAI 兼容 provider 的 `/v1/models`”。

## Scope

第一阶段只支持 OpenAI 兼容 provider，包括：

- OpenAI
- OpenRouter
- 其他兼容 `/v1/models`、`/v1/chat/completions`、`/v1/responses` 的服务

第一阶段不解决：

- Anthropic 原生 `messages` 协议直连
- 非 OpenAI 兼容 provider 的模型同步
- 复杂的多 provider 聚合代理

## Implementation Shape

### 1. 后台语义调整

- `Admin / Gateway` 页面改为“模型 Provider 连接”
- 创建表单默认值不再预填 `zhaocai-gateway`
- 页面说明改为“配置 provider 连接、测试连接、同步模型”

### 2. 测试与同步改造

- 连接测试只验证模型列表端点，而不是依赖 `/v1/providers`
- 模型同步以 `/v1/models` 为主
- `providerKey` 优先使用响应中的 `owned_by`，缺失时回退为连接名
- 不再把 provider 列表作为同步成功的必要条件

### 3. 运行时 URL 兼容

- 当前执行层对 OpenAI 端点路径的拼接对 `/v1` 前缀有不一致假设
- 需要统一封装 endpoint 生成逻辑，兼容：
  - `https://api.openai.com`
  - `https://api.openai.com/v1`
  - 其他 OpenAI 兼容服务的根路径或 `/v1` 路径

### 4. 路由与数据保持不变

- `CapabilityRoute`、`ManagedModel`、`PlanModelAccess` 不改结构
- 现有路由 UI 与数据库表继续沿用
- 当前数据库里的 `zhaocai-gateway` 配置不自动删除，由人工切换到新 provider 连接

## Rollout

1. 完成代码改造，使后台和运行时都支持 provider 直连
2. 手动新增 provider 连接
3. 同步模型
4. 重新配置 capability route
5. 验证 `signal_scoring`、`profile extraction`、`draft_generation`

## Risks

- 现有数据库路由仍指向 `zhaocai-gateway`，切换前功能不会自动改变
- 并非所有 provider 都支持 `responses` 协议，需要根据模型连接选择合适协议
- 当前项目仍存在部分 mock/live 混用问题，上线前需要继续收口
