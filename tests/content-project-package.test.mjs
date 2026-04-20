import assert from "node:assert/strict";

import { buildContentProjectPackage } from "../lib/content/content-project-package-logic.ts";

const bundle = buildContentProjectPackage({
  project: {
    id: "project-1",
    workspaceId: "workspace-1",
    creatorProfileId: "profile-1",
    topicCandidateId: "candidate-1",
    styleSkillId: "skill-1",
    status: "ACTIVE",
    title: "AI 基础设施权力集中",
    summary: "围绕 AI 基础设施做持续内容项目。",
    updatedAt: new Date().toISOString(),
  },
  candidate: {
    id: "candidate-1",
    topicId: "topic-1",
    topicTitle: "AI 基础设施权力集中",
    topicSummary: "主题线摘要",
    title: "把 AI 基础设施权力迁移讲成今天的主选题",
    whyNow: "最近多条信号都指向基础设施层。",
    fitReason: "和当前画像高度匹配。",
    formatRecommendation: "RECURRING_TRACK",
    priority: "PRIMARY",
    status: "NEW",
  },
  styleSkill: {
    id: "skill-1",
    workspaceId: "workspace-1",
    creatorProfileId: "profile-1",
    status: "ACTIVE",
    title: "个人风格 Skill",
    summary: "先给判断，再给因果链，最后落到行动方向。",
    rulesMarkdown: "# rules",
    version: 3,
    revisionCount: 5,
    sampleCount: 4,
    updatedAt: new Date().toISOString(),
  },
  assets: [
    {
      id: "asset-1",
      projectId: "project-1",
      assetType: "XHS_POST",
      title: "小红书图文包",
      content: "内容 1",
      targetPlatform: "xiaohongshu",
      status: "READY",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "asset-2",
      projectId: "project-1",
      assetType: "WECHAT_ARTICLE",
      title: "公众号文章",
      content: "内容 2",
      targetPlatform: "wechat-official-account",
      status: "APPROVED",
      updatedAt: new Date().toISOString(),
    },
  ],
  publishRecords: [
    {
      id: "publish-1",
      projectId: "project-1",
      assetId: "asset-1",
      channelKey: "xiaohongshu",
      mode: "EXPORT",
      status: "READY",
      failureReason: null,
      packageJson: {
        assetType: "XHS_POST",
      },
      updatedAt: new Date().toISOString(),
    },
  ],
  reviews: [
    {
      id: "review-1",
      workspaceId: "workspace-1",
      projectId: "project-1",
      assetId: "asset-1",
      channelKey: "xiaohongshu",
      views: 1200,
      likes: 80,
      comments: 12,
      shares: 6,
      saves: 24,
      inquiries: 2,
      leads: 1,
      conversions: 0,
      reviewNote: "这条内容很像我。",
      updatedAt: new Date().toISOString(),
    },
  ],
});

assert.equal(bundle.project.id, "project-1");
assert.equal(bundle.sourceCandidate?.id, "candidate-1");
assert.equal(bundle.styleSkill.version, 3);
assert.equal(bundle.assets.length, 2);
assert.equal(bundle.publishRecords[0].channelKey, "xiaohongshu");
assert.equal(bundle.reviews[0].reviewNote, "这条内容很像我。");

console.log("content project package smoke checks passed");
