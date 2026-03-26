# Provider Admin Hardening Plan

**Date:** 2026-03-26  
**Project:** `content-ip-research-workbench`

## Goal

在现有三页后台结构不变的前提下，补齐可测试的 Provider / 模型管理能力：

- Provider 停用
- Provider 安全删除
- 模型手动新增
- 模型停用/启用
- 模型安全删除
- 从模型页快速跳转到 routing

## Scope

继续保留现有页面结构：

- `/admin/gateways`
- `/admin/models`
- `/admin/routing`

本轮不做统一后台重构，只做能力补全。

## Safety Rules

### Provider 删除

- 如果该 Provider 下还有模型被 `CapabilityRoute` 引用：
  - 禁止删除
  - 只允许停用
- 如果没有任何路由引用：
  - 允许删除
  - 一起删除该 Provider 下未引用模型

### 模型删除

- 如果模型被任何 `CapabilityRoute.defaultModelId` 或 `fallbackModelId` 引用：
  - 禁止删除
- 未被引用时允许删除

### 停用

- 停用不删除数据
- 允许后续回滚

## Files To Touch

### UI

- `app/admin/gateways/page.tsx`
- `app/admin/models/page.tsx`
- `components/admin-gateway-actions.tsx`
- `components/admin-model-update-form.tsx`
- `components/admin-gateway-create-form.tsx`
- `components/admin-model-create-form.tsx` (new)

### API

- `app/api/admin/gateways/[id]/route.ts` (new)
- `app/api/admin/models/route.ts`
- `app/api/admin/models/[id]/route.ts`

### Services / Data

- `lib/model-management-data.ts`
- `lib/services/gateway-admin-service.ts`
- `lib/services/model-admin-service.ts`
- `lib/domain/contracts.ts`

## Implementation Order

1. 扩展后台数据读取，补充“是否被路由引用”等显示字段
2. 增加 Provider 停用/删除 API
3. 增加模型手动新增 API
4. 增加模型删除 API
5. 补 UI：Provider 操作按钮、模型新增表单、模型删除按钮、routing 快捷入口
6. 做 TypeScript 检查
7. 做一轮手动 smoke test
