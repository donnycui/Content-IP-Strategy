# Topics And Candidates Performance Design

**Date:** 2026-04-17  
**Project:** `content-ip-research-workbench`

## Goal

改善 `/topics` 与 `/candidates` 页面从导航进入时的首屏响应，让页面壳和画像锚点先显示，再等待重列表区块加载。

## Problem

当前这两个页面都采用：

- `export const dynamic = "force-dynamic"`
- 页面函数里直接等待 profile + list 数据
- 列表区本身较重，且依赖较多关系字段

结果是：

- 页面必须等完整列表数据准备好后才开始渲染
- 顶部导航点击后，用户会觉得页面“反应慢”

## Decision

采用和首页 / `signals` 一致的拆分方式：

- 页面壳保留
- 画像锚点单独加载
- 重列表区块单独加载
- 各自包 `Suspense`
- 使用已有 skeleton

## Scope

这一轮不做：

- 查询字段裁剪
- 分页
- `force-dynamic` 调整
- 列表内部客户端逻辑优化

先只做结构拆分，验证体感收益。
