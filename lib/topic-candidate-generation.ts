import { getDirections } from "@/lib/direction-data";
import type { CreatorProfileRow } from "@/lib/profile-data";
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
  const [topics, directions] = await Promise.all([getTopics(profile.id), getDirections(profile.id)]);

  const activeTopics = topics.filter((topic) => topic.status === "ACTIVE" || topic.status === "WATCHING").slice(0, 8);

  return activeTopics.map((topic) => {
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
}
