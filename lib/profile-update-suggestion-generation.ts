import { getReviewCalibrationSummary } from "@/lib/data";
import { getDirections } from "@/lib/direction-data";
import type { CreatorProfileRow } from "@/lib/profile-data";
import { executeStructuredGeneration } from "@/lib/services/structured-generation-service";
import { getTopicCandidates } from "@/lib/topic-candidate-data";
import { getTopics } from "@/lib/topic-data";

export type DraftProfileUpdateSuggestion = {
  type: "CORE_THEME" | "CONTENT_BOUNDARY" | "CURRENT_STAGE";
  beforeValue?: string | null;
  suggestedValue: string;
  reason: string;
  confidence: number;
};

type ProfileEvolutionPayload = {
  suggestions?: Array<{
    type?: DraftProfileUpdateSuggestion["type"];
    beforeValue?: string | null;
    suggestedValue?: string;
    reason?: string;
    confidence?: number;
  }>;
};

function suggestNextStage(
  currentStage: CreatorProfileRow["currentStage"],
  counts: { directions: number; topics: number; keptCandidates: number },
) {
  if (currentStage === "EXPLORING" && counts.directions >= 2 && counts.topics >= 2) {
    return "EMERGING" as const;
  }

  if (currentStage === "EMERGING" && counts.directions >= 2 && counts.topics >= 3 && counts.keptCandidates >= 2) {
    return "SCALING" as const;
  }

  if (currentStage === "SCALING" && counts.directions >= 3 && counts.topics >= 5 && counts.keptCandidates >= 4) {
    return "ESTABLISHED" as const;
  }

  return null;
}

export async function generateProfileUpdateSuggestionsForProfile(
  profile: CreatorProfileRow,
): Promise<DraftProfileUpdateSuggestion[]> {
  const [reviewSummary, topicCandidates, directions, topics] = await Promise.all([
    getReviewCalibrationSummary(),
    getTopicCandidates(profile.id),
    getDirections(profile.id),
    getTopics(profile.id),
  ]);

  const suggestions: DraftProfileUpdateSuggestion[] = [];
  const keptCandidates = topicCandidates.filter((candidate) => candidate.status === "KEPT");
  const candidateDirectionCounts = keptCandidates.reduce<Record<string, number>>((accumulator, candidate) => {
    const key = candidate.directionTitle ?? "未归入方向";
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
  const dominantDirection = Object.entries(candidateDirectionCounts).sort((left, right) => right[1] - left[1])[0];

  if (
    dominantDirection &&
    dominantDirection[1] >= 2 &&
    !profile.coreThemes.includes(dominantDirection[0]) &&
    dominantDirection[0] !== "未归入方向"
  ) {
    suggestions.push({
      type: "CORE_THEME",
      beforeValue: profile.coreThemes,
      suggestedValue: `${profile.coreThemes}；当前应额外强调：${dominantDirection[0]}`,
      reason: `最近被你保留的选题里，有 ${dominantDirection[1]} 条持续落在“${dominantDirection[0]}”这条方向上，说明它已经开始成为实际主线，而不仅是候选方向。`,
      confidence: 0.78,
    });
  }

  if (reviewSummary.routineUnderDetected > 0 && !profile.contentBoundaries.includes("公司日常新闻")) {
    suggestions.push({
      type: "CONTENT_BOUNDARY",
      beforeValue: profile.contentBoundaries,
      suggestedValue: `${profile.contentBoundaries}；进一步压低没有行业外溢的公司日常新闻。`,
      reason: `最近人工复核里，“日常噪音识别不足”已出现 ${reviewSummary.routineUnderDetected} 次，说明你的内容边界应该更明确地排除这类信号。`,
      confidence: 0.82,
    });
  }

  const nextStage = suggestNextStage(profile.currentStage, {
    directions: directions.length,
    topics: topics.length,
    keptCandidates: keptCandidates.length,
  });

  if (nextStage) {
    suggestions.push({
      type: "CURRENT_STAGE",
      beforeValue: profile.currentStage,
      suggestedValue: nextStage,
      reason: `当前已经有 ${directions.length} 条方向、${topics.length} 条主题线，以及 ${keptCandidates.length} 条已保留选题，说明你正在从 ${profile.currentStage} 进入更稳定的创作阶段。`,
      confidence: 0.74,
    });
  }

  if (!suggestions.length && topics.length > 0) {
    const topDirection = directions[0];

    if (topDirection && !profile.coreThemes.includes(topDirection.title)) {
      suggestions.push({
        type: "CORE_THEME",
        beforeValue: profile.coreThemes,
        suggestedValue: `${profile.coreThemes}；近期重点押注：${topDirection.title}`,
        reason: `当前系统还没有足够多的显式保留记录，但方向台已经显示“${topDirection.title}”是最优先方向，可以先把它补进核心议题表述。`,
        confidence: 0.58,
      });
    }
  }

  const fallbackSuggestions = suggestions;

  const payload = await executeStructuredGeneration<ProfileEvolutionPayload>({
    capabilityKey: "profile_evolution",
    systemInstruction:
      "你是知识型创作者平台里的画像进化助手。请根据创作者当前画像、方向/主题/选题状态和人工校准摘要，输出 0 到 3 条需要用户确认的画像进化建议。返回严格 JSON，格式为 {\"suggestions\":[{\"type\":\"CORE_THEME|CONTENT_BOUNDARY|CURRENT_STAGE\",\"beforeValue\":\"...\",\"suggestedValue\":\"...\",\"reason\":\"...\",\"confidence\":0.78}]}。不要输出多余解释。",
    userPrompt: JSON.stringify(
      {
        creatorProfile: {
          positioning: profile.positioning,
          coreThemes: profile.coreThemes,
          contentBoundaries: profile.contentBoundaries,
          currentStage: profile.currentStage,
          growthGoal: profile.growthGoal,
        },
        reviewSummary,
        directions: directions.map((direction) => ({
          title: direction.title,
          priority: direction.priority,
        })),
        topics: topics.map((topic) => ({
          title: topic.title,
          heatScore: topic.heatScore,
          signalCount: topic.signalCount,
          status: topic.status,
        })),
        keptTopicCandidates: keptCandidates.map((candidate) => ({
          title: candidate.title,
          directionTitle: candidate.directionTitle,
          priority: candidate.priority,
        })),
        fallbackSuggestions,
      },
      null,
      2,
    ),
    metadata: {
      channel: "web",
      flow: "creator-os",
    },
  });

  const normalized = (payload?.suggestions ?? [])
    .map((item) => ({
      type:
        item.type === "CORE_THEME" || item.type === "CONTENT_BOUNDARY" || item.type === "CURRENT_STAGE"
          ? item.type
          : null,
      beforeValue: item.beforeValue ?? null,
      suggestedValue: item.suggestedValue?.trim() ?? "",
      reason: item.reason?.trim() ?? "",
      confidence:
        typeof item.confidence === "number" ? Math.max(0, Math.min(1, Number(item.confidence.toFixed(2)))) : 0.6,
    }))
    .filter((item) => Boolean(item.type && item.suggestedValue && item.reason))
    .map(
      (item) =>
        ({
          type: item.type as DraftProfileUpdateSuggestion["type"],
          beforeValue: item.beforeValue,
          suggestedValue: item.suggestedValue,
          reason: item.reason,
          confidence: item.confidence,
        }) satisfies DraftProfileUpdateSuggestion,
    )
    .slice(0, 3);

  return normalized.length ? normalized : fallbackSuggestions;
}
