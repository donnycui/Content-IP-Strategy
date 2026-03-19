import { getDirections } from "@/lib/direction-data";
import type { CreatorProfileRow } from "@/lib/profile-data";
import { executeStructuredGeneration } from "@/lib/services/structured-generation-service";
import { getTopics } from "@/lib/topic-data";

export type DraftTopicCandidate = {
  topicId: string;
  anchorSignalId?: string | null;
  title: string;
  whyNow: string;
  fitReason: string;
  formatRecommendation: "SINGLE_POST" | "RECURRING_TRACK" | "SERIES_ENTRY";
  priority: "PRIMARY" | "SECONDARY" | "WATCH";
  status: "NEW";
};

type TopicCandidateGenerationPayload = {
  candidates?: Array<{
    topicTitle?: string;
    title?: string;
    whyNow?: string;
    fitReason?: string;
    formatRecommendation?: DraftTopicCandidate["formatRecommendation"];
    priority?: DraftTopicCandidate["priority"];
  }>;
};

function inferFormatRecommendation(signalCount: number, heatScore: number) {
  if (signalCount >= 3 || heatScore >= 4.6) {
    return "RECURRING_TRACK" as const;
  }

  if (signalCount >= 2 || heatScore >= 4) {
    return "SERIES_ENTRY" as const;
  }

  return "SINGLE_POST" as const;
}

function inferPriority(signalCount: number, heatScore: number) {
  if (signalCount >= 3 || heatScore >= 4.6) {
    return "PRIMARY" as const;
  }

  if (signalCount >= 2 || heatScore >= 3.7) {
    return "SECONDARY" as const;
  }

  return "WATCH" as const;
}

export async function generateTopicCandidatesForProfile(profile: CreatorProfileRow): Promise<DraftTopicCandidate[]> {
  return generateTopicCandidatesForProfileWithTier(profile);
}

export async function generateTopicCandidatesForProfileWithTier(
  profile: CreatorProfileRow,
  requestedTier?: "FAST" | "BALANCED" | "DEEP",
): Promise<DraftTopicCandidate[]> {
  const [topics, directions] = await Promise.all([getTopics(profile.id), getDirections(profile.id)]);

  const activeTopics = topics.filter((topic) => topic.status === "ACTIVE" || topic.status === "WATCHING").slice(0, 8);

  const fallbackCandidates = activeTopics.map((topic) => {
    const anchorSignal = topic.sampleSignals[0];
    const direction = directions.find((item) => item.id === topic.directionId);
    const formatRecommendation = inferFormatRecommendation(topic.signalCount, topic.heatScore);
    const priority = inferPriority(topic.signalCount, topic.heatScore);

    const whyNow = anchorSignal
      ? `这条主题线当前已有 ${topic.signalCount} 条支撑信号，其中“${anchorSignal.title}”最适合作为切入口，现在值得先做一条判断。`
      : `这条主题线当前热度为 ${topic.heatScore.toFixed(1)}，虽然支撑信号还不算多，但已经足够进入本周选题池。`;

    const fitReason = direction
      ? `它直接挂在方向“${direction.title}”下面，和你的定位“${profile.positioning}”一致，适合继续强化你的长期品牌主线。`
      : `它与当前画像“${profile.positioning}”一致，适合先作为观察型选题，再决定是否升成长期系列。`;

    return {
      topicId: topic.id,
      anchorSignalId: anchorSignal?.id ?? null,
      title: topic.title,
      whyNow,
      fitReason,
      formatRecommendation,
      priority,
      status: "NEW" as const,
    };
  });

  const payload = await executeStructuredGeneration<TopicCandidateGenerationPayload>({
    capabilityKey: "topic_candidate_generation",
    systemInstruction:
      "你是知识型创作者平台里的选题推荐助手。请基于主题线和方向台，输出最多 8 条今天/本周值得推进的选题。返回严格 JSON，格式为 {\"candidates\":[{\"topicTitle\":\"...\",\"title\":\"...\",\"whyNow\":\"...\",\"fitReason\":\"...\",\"formatRecommendation\":\"SINGLE_POST|RECURRING_TRACK|SERIES_ENTRY\",\"priority\":\"PRIMARY|SECONDARY|WATCH\"}]}。不要输出多余解释。",
    userPrompt: JSON.stringify(
      {
        creatorProfile: {
          positioning: profile.positioning,
          audience: profile.audience,
          growthGoal: profile.growthGoal,
          currentStage: profile.currentStage,
        },
        topics: activeTopics.map((topic) => ({
          topicId: topic.id,
          topicTitle: topic.title,
          topicSummary: topic.summary,
          directionTitle: topic.directionTitle,
          heatScore: topic.heatScore,
          signalCount: topic.signalCount,
          sampleSignals: topic.sampleSignals,
        })),
        fallbackCandidates,
      },
      null,
      2,
    ),
    metadata: {
      channel: "web",
      flow: "creator-os",
    },
    requestedTier,
  });

  const normalized = (payload?.candidates ?? [])
    .map((item) => {
      const topic = activeTopics.find((entry) => entry.title === item.topicTitle) ?? activeTopics[0];

      if (!topic) {
        return null;
      }

      const anchorSignal = topic.sampleSignals[0];

      return {
        topicId: topic.id,
        anchorSignalId: anchorSignal?.id ?? null,
        title: item.title?.trim() ?? "",
        whyNow: item.whyNow?.trim() ?? "",
        fitReason: item.fitReason?.trim() ?? "",
        formatRecommendation:
          item.formatRecommendation === "SINGLE_POST" ||
          item.formatRecommendation === "RECURRING_TRACK" ||
          item.formatRecommendation === "SERIES_ENTRY"
            ? item.formatRecommendation
            : inferFormatRecommendation(topic.signalCount, topic.heatScore),
        priority:
          item.priority === "PRIMARY" || item.priority === "SECONDARY" || item.priority === "WATCH"
            ? item.priority
            : inferPriority(topic.signalCount, topic.heatScore),
        status: "NEW" as const,
      } satisfies DraftTopicCandidate;
    })
    .filter((item) => Boolean(item && item.title && item.whyNow && item.fitReason))
    .map(
      (item) =>
        ({
          topicId: item!.topicId,
          anchorSignalId: item!.anchorSignalId ?? null,
          title: item!.title,
          whyNow: item!.whyNow,
          fitReason: item!.fitReason,
          formatRecommendation: item!.formatRecommendation,
          priority: item!.priority,
          status: "NEW",
        }) satisfies DraftTopicCandidate,
    )
    .slice(0, 8);

  return normalized.length ? normalized : fallbackCandidates;
}
