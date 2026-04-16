# Top Nav Active State Design

**Date:** 2026-04-16  
**Project:** `content-ip-research-workbench`

## Goal

让顶部导航能够清楚显示“当前处于哪个板块”，减少用户点击导航后的迷失感。

## Decision

采用最小实现：

- 保留当前导航信息架构和顺序
- 新增一个小型 client 组件读取当前 pathname
- 根据 pathname 给当前导航项增加高亮样式
- `/admin/gateways`、`/admin/models`、`/admin/routing` 统一归到“模型管理”

## Files

- `components/top-nav.tsx`
- `app/layout.tsx`
- `app/globals.css`

## Notes

- 这个改动只优化视觉反馈，不解决页面切换慢的问题
- 页面切换慢的根因仍然主要是服务端动态渲染和数据查询
