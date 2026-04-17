# Conversational Profile Extraction Design

**Date:** 2026-04-18  
**Project:** `content-ip-research-workbench`

## Goal

把当前“一次性粘贴文本 -> 直接生成整张画像”的 IP 提炼流程，升级为默认的“对话式提炼”，让系统通过多轮追问逐步收敛创作者画像，同时保留快捷提炼作为备用入口。

## Why Change

当前流程的问题：

- 一次性输入会迫使模型立刻压缩为固定字段
- 输出容易模板化
- 当模型提炼不稳定时，会落到 fallback 风格内容
- 用户缺少“系统是如何理解我”的中间过程反馈

目标不是简单换一个 prompt，而是把体验从“表单提炼”改成“访谈式共创”。

## Product Decision

保留双模式：

- **对话式提炼**：默认主流程
- **快捷提炼**：保留现有一次性输入方式

这样：

- 新用户走对话式提炼，获得更高质量画像
- 老用户或高效率用户仍可直接用快捷提炼

## Conversation Model

### Core Principle

系统不是按固定题库顺序提问，而是每轮根据当前输入实时选择“下一问最该问什么”。

### Question Types

系统每轮从以下问题类型中选择一类：

1. 对象澄清
2. 能力锚定
3. 角色定位
4. 边界收窄
5. 长期目标
6. 表达风格

### Dynamic Selection

每轮回答后，系统维护一份“当前画像草案”并评估：

- 哪些字段缺失
- 哪些字段过于空泛
- 哪些字段之间有冲突
- 哪个问题能带来最高信息增益

然后只生成**下一条最有价值的问题**。

### Stop Conditions

当满足以下任一条件时，可以进入“生成画像草案”阶段：

- 核心字段已足够明确
- 连续两轮新增信息很少
- 用户主动要求先生成草案
- 达到最大轮数（建议 5-7 轮）

## User Experience

### Mode Entry

`/profile/extract` 页面提供两个入口：

- **对话式提炼**：默认入口
- **快捷提炼**：保留现有大文本输入方式

### Conversational Layout

页面分三块：

1. **对话区**
   - 系统当前问题
   - 用户输入框
   - 提交回答
   - 跳过
   - 生成草案

2. **实时画像草案**
   - 定位
   - 人设
   - 受众
   - 核心议题
   - 表达风格
   - 增长目标
   - 内容边界
   - 当前阶段

3. **模式切换**
   - 对话式提炼
   - 快捷提炼

### Draft Presentation

实时草案必须明确标记为：

- `草案`
- `仍在收敛`
- `会随对话更新`

系统应优先给出自然语言总结，再显示结构化字段。

## Data Model

建议新增一个轻量会话表，例如：

### `ProfileExtractionSession`

核心字段：

- `id`
- `status` (`ACTIVE`, `COMPLETED`, `ABANDONED`)
- `sourceMode` (`CONVERSATIONAL`, `QUICK`)
- `transcriptJson`
- `draftProfileJson`
- `currentQuestion`
- `questionType`
- `turnCount`
- `lastUserMessage`
- `createdAt`
- `updatedAt`

用途：

- 支持多轮状态
- 支持恢复
- 支持调试
- 支持后续分析“哪些问题最有效”

## API Shape

建议新增一组 conversation API，而不是改掉现有 `/api/profile/extract`。

### Keep

- `/api/profile/extract`
  - 继续服务快捷提炼

### Add

- `POST /api/profile/extract/conversation`
  - 创建会话
  - 返回第一问 + 初始草案

- `POST /api/profile/extract/conversation/[id]/reply`
  - 提交用户一轮回答
  - 返回更新后的草案 + 下一问 + 当前状态

- `POST /api/profile/extract/conversation/[id]/finalize`
  - 把当前草案固化成 `CreatorProfile`
  - 返回 `profileId`

## Generation Logic

### For each reply

每轮系统执行：

1. 读取当前 session transcript
2. 更新草案
3. 判断当前缺口
4. 生成下一问
5. 判断是否可以结束

### Output requirements

模型在每轮不应该直接输出整张终稿，而应该返回：

- `draftProfile`
- `nextQuestion`
- `questionType`
- `readyToFinalize`
- `reasoningSummary`

### Guardrails

- 每轮只允许一个问题
- 问题必须引用用户前文语义
- 禁止输出模板化“字段问卷”
- 如果用户输入已经足够，允许不继续追问，直接建议生成草案

## Fallback Strategy

当前系统在提炼失败时会直接落到通用 fallback。  
对话式提炼里不应再采用同样粗暴策略。

建议：

- 如果某轮模型失败：
  - 保留已有 transcript
  - 不覆盖已有 draft
  - 返回一个保守的“确认式问题”或允许用户重试

- 只有在最终 `finalize` 阶段完全无法提炼时，才考虑降级到快捷 fallback 风格

## Migration Strategy

第一阶段：

- 保留旧的快捷提炼
- 新增对话式提炼
- 创作者画像页继续复用当前 `CreatorProfile` 渲染逻辑

第二阶段：

- 根据用户实际使用情况，决定是否把快捷提炼降级为次级入口

## Risks

- 多轮状态会增加实现复杂度
- 问题生成如果不稳定，可能出现追问跑偏
- 如果每轮都调深度模型，成本会上升
- 需要更清楚地区分“草案”和“定稿”

## Recommendation

值得做，而且优先级高。

不是因为“体验更高级”，而是因为：

- 能显著降低当前模板化画像问题
- 能减少 fallback 风格内容直接落库
- 更符合创作者画像这个任务的本质：访谈、澄清、收敛，而不是一次性压缩
