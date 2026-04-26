# IP 提炼并行发散访谈实施计划

## 目标

把当前 `IP提炼` 从“轻量收敛访谈”升级成“并行发散式完整提炼”，并通过本地约束判定器压住过早收尾。

## 范围

本轮只改 `IP提炼`：

- 开场问题
- 访谈状态模型
- 本地结束判定
- 前端控制项
- 相关文案与错误处理

不扩到：

- 创作者画像页
- 方向与选题页
- 内容生产页

## 任务拆分

### 任务 1：扩展会话状态与前端控制项

涉及文件：

- `lib/domain/contracts.ts`
- `components/profile-extract-conversation.tsx`

工作：

1. 新增 `提炼约束` 前端字段
2. 支持 `强约束 / 中等约束 / 弱约束`
3. 默认值设成 `强约束`
4. 字段说明文案落到页面
5. 保持开始前可设置、对话中可切换

### 任务 2：重写开场引导

涉及文件：

- `lib/services/profile-extraction-conversation-service.ts`

工作：

1. 把 `firstQuestion()` 改成带结构的自我介绍引导
2. 在开场中同时引导：
   - 职业背景
   - 想做的 IP 方向
   - 最初想法
   - 为什么现在做
3. 保留双方称呼，但不再让它独占第一轮

### 任务 3：加入并行发散维度跟踪

涉及文件：

- `lib/services/profile-extraction-conversation-service.ts`

工作：

1. 定义 5 个维度：
   - 方向
   - 人设
   - 受众
   - 表达形式
   - 平台风格偏好
2. 给每个维度增加状态：
   - 未触达
   - 已触达但不够
   - 已足够
3. 每轮回答后更新维度状态
4. 让 prompt 显式知道当前每个维度状态

### 任务 4：本地结束判定器

涉及文件：

- `lib/services/profile-extraction-conversation-service.ts`

工作：

1. 新增本地 `canFinalizeConversation(...)`
2. 不再只信模型的 `readyToFinalize`
3. 按约束档位判断：
   - 强约束
   - 中等约束
   - 弱约束
4. 加最小有效轮数限制

### 任务 5：收尾文案降级

涉及文件：

- `lib/services/profile-extraction-conversation-service.ts`

工作：

1. 去掉“只要出现如果你愿意就强制收尾”的过度规则
2. 把收尾提示建立在本地结束判定器上
3. 如果仍未达到结束条件，要明确说明还缺哪些维度

### 任务 6：字段归一化继续加固

涉及文件：

- `lib/services/profile-extraction-conversation-service.ts`

工作：

1. 保持当前对字符串/数组/对象的安全归一化
2. 确认 `draftProfile` 的所有可写字段都经过同一层保护
3. 避免再次出现 `trim is not a function`

### 任务 7：最小验证

涉及文件：

- `scripts/` 下可选调试脚本
- 现有 smoke / typecheck

工作：

1. 跑 `tsc --noEmit`
2. 跑 `npm run test:zhaocai-center:smoke`
3. 手动验证 3 条关键路径：
   - 开场先进入完整自我介绍
   - 一条业务描述不会过早结束
   - 补充回答时不会因为草稿字段类型崩溃

## 验收标准

满足下面 5 条，才算这轮通过：

1. 第一轮开场不再只问双方称呼
2. 页面上能看到 `提炼约束` 三档并默认 `强约束`
3. 用户只说一段方向介绍后，系统不会直接提示“信息已经足够”
4. 用户补充额外信息时，不再出现 `xxx.trim is not a function`
5. 收尾必须符合本地结束判定器，而不是只靠模型主观判断
