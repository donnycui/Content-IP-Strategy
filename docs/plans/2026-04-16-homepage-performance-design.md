# Homepage Performance Design

**Date:** 2026-04-16  
**Project:** `content-ip-research-workbench`

## Goal

改善首页点击导航后的体感速度，让页面先出现，再逐块补数据，而不是等待整个聚合查询完成后一次性渲染。

## Problem

当前首页 [app/page.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/app/page.tsx) 直接等待完整的 `getTodayWorkspace()` 结果。  
而 [lib/services/today-service.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/lib/services/today-service.ts) 会同时拉取 profile、directions、topics、topicCandidates、suggestions、signals、research card、drafts 等多组数据。

结果是：

- 首页首屏被整组查询阻塞
- 顶部导航点击后体感像“没反应”
- 任何一个慢查询都会拖住整个首页

## Decision

采用“轻首页壳 + 独立区块加载”的方案：

- `app/page.tsx` 不再等待完整聚合
- 拆分成多个首页区块组件
- 每个区块自己查自己的数据
- 每个区块包 `Suspense`
- 每个区块单独提供 loading skeleton

## First Iteration Scope

第一轮只拆以下 4 个区块：

1. Summary
2. Directions
3. Candidates
4. Output

先不拆：

- Profile
- Topics
- Evolution

原因：

- 控制改动面
- 优先优化最重、最影响首屏的部分
- 先验证拆块策略本身有效

## Files

- `app/page.tsx`
- `components/home/` 下新增首页区块组件
- `lib/services/homepage-service.ts` 新增首页轻量查询函数

## Notes

- 这次优化的是首页，不处理全站导航性能
- 这次不改缓存策略，不处理 `force-dynamic`
- 如果第一轮收益明显，再继续拆剩余区块或引入局部缓存
