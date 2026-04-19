import assert from "node:assert/strict";

import { buildDemoPlaybook } from "../lib/demo/demo-playbook-logic.ts";

const playbook = buildDemoPlaybook({
  center: {
    judgment: {
      stageLabel: "风格与内容",
      title: "推进内容",
      description: "推进内容",
      reason: "因为已经有选题",
      primaryAction: { label: "去做内容", href: "/agents/style-content" },
      secondaryAction: { label: "看画像", href: "/agents/creator-profile" },
    },
    metrics: [],
    agents: [
      {
        key: "IP_EXTRACTION",
        label: "IP提炼 Agent",
        status: "REVISIT",
        summary: "提炼已完成",
        detail: "detail",
        href: "/agents/ip-extraction",
        actionLabel: "回看",
      },
      {
        key: "CREATOR_PROFILE",
        label: "创作者画像 Agent",
        status: "REVISIT",
        summary: "画像已稳定",
        detail: "detail",
        href: "/agents/creator-profile",
        actionLabel: "打开",
      },
      {
        key: "TOPIC_DIRECTION",
        label: "选题方向 Agent",
        status: "REVISIT",
        summary: "方向已生成",
        detail: "detail",
        href: "/agents/topic-direction",
        actionLabel: "打开",
      },
      {
        key: "STYLE_CONTENT",
        label: "风格与内容 Agent",
        status: "CURRENT",
        summary: "内容中",
        detail: "detail",
        href: "/agents/style-content",
        actionLabel: "打开",
      },
      {
        key: "DAILY_REVIEW",
        label: "每日复盘 Agent",
        status: "LOCKED",
        summary: "未开始",
        detail: "detail",
        href: "/agents/daily-review",
        actionLabel: "打开",
      },
      {
        key: "EVOLUTION",
        label: "升级进化 Agent",
        status: "LOCKED",
        summary: "未开始",
        detail: "detail",
        href: "/agents/evolution",
        actionLabel: "打开",
      },
    ],
    coordinator: { title: "coord", summary: "coord", bullets: [] },
    memory: [],
    quickActions: [],
  },
  styleContent: {
    recommendedCandidates: [{ id: "candidate-1", title: "题目 1" }],
    projects: [
      {
        project: { id: "project-1", title: "项目 1" },
        assets: [{ id: "asset-1" }, { id: "asset-2" }],
        publishRecords: [{ id: "publish-1" }],
      },
    ],
  },
  reviewDashboard: {
    projects: [{ project: { id: "project-1" }, assets: [], publishRecords: [] }],
    reviews: [{ id: "review-1" }],
  },
  evolutionDashboard: {
    decisions: [{ id: "decision-1" }],
    latestReviews: [{ id: "review-1" }],
  },
});

assert.equal(playbook.headline, "zhaocai-IP-center 当前演示路径");
assert.ok(playbook.steps.length >= 8);

const homeStep = playbook.steps[0];
assert.equal(homeStep.title, "中枢首页");
assert.equal(homeStep.href, "/");

const styleStep = playbook.steps.find((step) => step.title === "风格与内容 Agent");
assert.ok(styleStep);
assert.equal(styleStep.href, "/agents/style-content");
assert.match(styleStep.state, /已创建内容项目/);

const contentIndexStep = playbook.steps.find((step) => step.title === "内容项目总览");
assert.ok(contentIndexStep);
assert.equal(contentIndexStep.href, "/content/projects");

console.log("demo playbook smoke checks passed");
