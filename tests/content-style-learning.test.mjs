import assert from "node:assert/strict";

import { buildFallbackAssetDrafts } from "../lib/content/content-asset-draft-logic.ts";
import { buildLearnedStyleSkill } from "../lib/style/style-skill-learning-logic.ts";

const candidate = {
  id: "candidate-1",
  topicId: "topic-1",
  topicTitle: "高净值家庭保障配置",
  topicSummary: "用家庭资产和医疗资源两个维度讲清配置顺序。",
  title: "高净值家庭为什么不能只买普通医疗险",
  whyNow: "越来越多家庭开始关注医疗资源、续保稳定和家庭现金流安全。",
  fitReason: "创作者有保险和资产配置经验，适合用真实家庭场景讲判断。",
  formatRecommendation: "RECURRING_TRACK",
  priority: "PRIMARY",
  status: "NEW",
};

const styleSkill = {
  id: "skill-1",
  workspaceId: "workspace-1",
  creatorProfileId: "profile-1",
  status: "ACTIVE",
  title: "个人风格 Skill",
  summary: "先说人话，再给判断，最后落到客户能执行的下一步。",
  rulesMarkdown: "# rules",
  version: 1,
  revisionCount: 0,
  sampleCount: 0,
  updatedAt: new Date().toISOString(),
};

const drafts = buildFallbackAssetDrafts(candidate, styleSkill);

assert.match(drafts.XHS_POST, /标题备选/);
assert.match(drafts.XHS_POST, /正文/);
assert.match(drafts.SHORT_VIDEO_SCRIPT, /0-3 秒开场/);
assert.match(drafts.SHORT_VIDEO_SCRIPT, /画面建议/);
assert.match(drafts.WECHAT_ARTICLE, /导语/);
assert.match(drafts.WECHAT_ARTICLE, /行动建议/);
assert.match(drafts.LIVESTREAM_SCRIPT, /互动问题/);
assert.match(drafts.LIVESTREAM_SCRIPT, /收尾/);

const learned = buildLearnedStyleSkill({
  profile: {
    voiceStyle: "像顾问一样讲人话。",
    positioning: "家庭财富风险顾问。",
    contentBoundaries: "不做收益承诺。",
  },
  samples: [
    {
      id: "sample-1",
      styleSkillId: "skill-1",
      title: "家庭保障案例",
      sourceLabel: "公众号",
      sampleText: "我通常先问客户一个问题：你真正担心的是风险，还是现金流断掉？这个问题不是简单买产品。",
      updatedAt: new Date().toISOString(),
    },
  ],
  revisions: [
    {
      id: "revision-1",
      styleSkillId: "skill-1",
      sampleId: null,
      draftText: "首先我们应该了解保险配置的重要性，其次选择产品。",
      revisedText: "你先别急着买产品，先把家庭现金流和医疗资源这两个问题讲清楚。",
      ruleDelta: "",
      createdAt: new Date().toISOString(),
    },
  ],
  sampleCount: 1,
  revisionCount: 1,
});

assert.match(learned.summary, /1 个原创样本/);
assert.match(learned.summary, /1 次手改修订/);
assert.match(learned.rulesMarkdown, /从原创样本学到的表达习惯/);
assert.match(learned.rulesMarkdown, /从手改修订学到的规则/);
assert.match(learned.rulesMarkdown, /不要只给方向或大纲/);

console.log("content draft and style learning checks passed");
