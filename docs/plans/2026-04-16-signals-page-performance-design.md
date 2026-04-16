# Signals Page Performance Design

**Date:** 2026-04-16  
**Project:** `content-ip-research-workbench`

## Goal

改善 `/signals` 页面从顶部导航进入时的首屏响应，让页面壳和表单区先出现，再等待表格数据加载。

## Problem

当前 [app/signals/page.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/app/signals/page.tsx) 会同步等待：

- `getSignals()`
- `getSources()`

其中 `SignalTable` 对整批 signal 数据依赖很重，而两个表单又依赖 `sources`。  
这导致整个页面必须等完整数据准备好后一起渲染。

## Decision

采用和首页一致的拆分方式：

- 页面保留壳
- 表单区块单独加载
- 信号表格区块单独加载
- 两个区块各自包 `Suspense`
- 使用轻量 skeleton 提供过渡

## Scope

第一轮只拆页面结构，不做这些事：

- 不改 `SignalTable` 的客户端逻辑
- 不改过滤、排序、批量操作逻辑
- 不做分页或虚拟滚动
- 不改 API 行为

## Files

- `app/signals/page.tsx`
- `components/signals/` 下新增区块组件
- `components/home/home-section-skeleton.tsx` 复用 skeleton

## Notes

- 这次优化的是首屏体感，不是信号表本身的客户端计算开销
- 如果这一轮收益明显，再继续考虑分页、虚拟滚动或减少 `getSignals()` 数据量
