import type { EvolutionTargetTypeValue, ReviewSnapshotPayload } from "../domain/contracts";

export type EvolutionDecisionDraft = {
  targetType: EvolutionTargetTypeValue;
  headline: string;
  rationale: string;
  suggestedAction: string;
  actionPayload?: Record<string, string | number | boolean | null>;
};

export function deriveEvolutionDecisionDrafts(review: ReviewSnapshotPayload): EvolutionDecisionDraft[] {
  const decisions: EvolutionDecisionDraft[] = [];

  const views = review.views ?? 0;
  const likes = review.likes ?? 0;
  const inquiries = review.inquiries ?? 0;
  const leads = review.leads ?? 0;
  const saves = review.saves ?? 0;

  if (views > 0 && likes / Math.max(views, 1) >= 0.06) {
    decisions.push({
      targetType: "STYLE",
      headline: "这条内容的表达方式值得保留并继续强化",
      rationale: `当前互动比率较高（点赞 ${likes} / 浏览 ${views}），说明表达方式至少有一部分贴近了你的真实风格。`,
      suggestedAction: "把这条内容里最有效的表达方式抽成 style skill 更新项，并在后续内容里复用。",
      actionPayload: {
        kind: "STYLE_SKILL_APPEND",
        reviewSnapshotId: review.id,
      },
    });
  }

  if (inquiries > 0 || leads > 0) {
    decisions.push({
      targetType: "DIRECTION",
      headline: "这个方向不只是有流量，可能还有转化信号",
      rationale: `当前内容已经带来 ${inquiries} 次咨询、${leads} 条线索，说明它可能不只是一个可讲选题，而是一条更值得加权的方向。`,
      suggestedAction: "提高这类题型在方向层的权重，并观察是否应该扩成连续主题线。",
      actionPayload: {
        kind: "DIRECTION_FROM_PROJECT",
        projectId: review.projectId,
        priority: leads > 0 ? "PRIMARY" : "SECONDARY",
      },
    });
  }

  if (views > 0 && saves / Math.max(views, 1) < 0.01 && likes / Math.max(views, 1) < 0.02) {
    decisions.push({
      targetType: "PLATFORM_STRATEGY",
      headline: "这条内容的当前包装方式可能不适合这个平台",
      rationale: `当前浏览有 ${views}，但点赞和收藏偏低，说明选题可能还行，平台包装或切口不够强。`,
      suggestedAction: "保留题目本身，但尝试重新包装标题、开场结构和平台适配方式。",
      actionPayload: {
        kind: "PLATFORM_STRATEGY_NOTE",
        channelKey: review.channelKey,
      },
    });
  }

  if (review.reviewNote?.trim()) {
    decisions.push({
      targetType: "PROFILE",
      headline: "这条复盘里有值得写回画像的主观线索",
      rationale: "你在复盘备注里给出了人工判断，这类主观反馈通常比纯数据更能说明画像和内容边界是否需要更新。",
      suggestedAction: `检查这条备注是否应该更新到画像或内容边界：${review.reviewNote.trim()}`,
      actionPayload: {
        kind: "PROFILE_APPEND_BOUNDARY",
        note: review.reviewNote.trim(),
      },
    });
  }

  return decisions.slice(0, 3);
}
