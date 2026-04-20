import assert from "node:assert/strict";

import { deriveEvolutionDecisionDrafts } from "../lib/center/evolution-decision-logic.ts";

const review = {
  id: "review-1",
  workspaceId: "workspace-1",
  projectId: "project-1",
  assetId: "asset-1",
  channelKey: "xiaohongshu",
  views: 1000,
  likes: 90,
  comments: 18,
  shares: 12,
  saves: 20,
  inquiries: 4,
  leads: 2,
  conversions: 1,
  reviewNote: "这条内容的表达更像我自己，但需要把边界再讲得更明确。",
  updatedAt: new Date().toISOString(),
};

const drafts = deriveEvolutionDecisionDrafts(review);

assert.ok(drafts.length >= 3);

const styleDraft = drafts.find((item) => item.targetType === "STYLE");
assert.ok(styleDraft);
assert.equal(styleDraft.actionPayload?.kind, "STYLE_SKILL_APPEND");
assert.equal(styleDraft.actionPayload?.reviewSnapshotId, review.id);

const directionDraft = drafts.find((item) => item.targetType === "DIRECTION");
assert.ok(directionDraft);
assert.equal(directionDraft.actionPayload?.kind, "DIRECTION_FROM_PROJECT");
assert.equal(directionDraft.actionPayload?.projectId, review.projectId);
assert.equal(directionDraft.actionPayload?.priority, "PRIMARY");

const profileDraft = drafts.find((item) => item.targetType === "PROFILE");
assert.ok(profileDraft);
assert.equal(profileDraft.actionPayload?.kind, "PROFILE_APPEND_BOUNDARY");
assert.match(String(profileDraft.actionPayload?.note), /边界/);

console.log("evolution decision logic smoke checks passed");
