import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getActiveCreatorProfile, mockCreatorProfile, type CreatorProfileRow } from "@/lib/profile-data";

export type TopicCandidateRow = {
  id: string;
  topicId: string;
  topicTitle: string;
  topicSummary: string;
  directionId?: string | null;
  directionTitle?: string | null;
  anchorSignalId?: string | null;
  anchorSignalTitle?: string | null;
  title: string;
  whyNow: string;
  fitReason: string;
  formatRecommendation: "SINGLE_POST" | "RECURRING_TRACK" | "SERIES_ENTRY";
  priority: "PRIMARY" | "SECONDARY" | "WATCH";
  status: "NEW" | "KEPT" | "DEFERRED" | "REJECTED";
  primaryObservationCluster?: string | null;
  secondaryObservationCluster?: string | null;
};

export const mockTopicCandidates: TopicCandidateRow[] = [
  {
    id: "recommendation-ai-power",
    topicId: "topic-ai-infra",
    topicTitle: "AI 基础设施权力集中",
    topicSummary: "基础设施层的信号正在持续积累，已经具备从主题线转换成连续选题的条件。",
    directionId: "direction-ai-power",
    directionTitle: "把 AI 权力迁移讲成长期主线",
    anchorSignalId: null,
    anchorSignalTitle: "AI 基础设施的竞争正在从参数叙事转向供给控制",
    title: "把 AI 基础设施权力迁移讲成今天的主选题",
    whyNow: "这条主题线最近已有多条支撑信号，适合从基础设施控制权切入而不是继续讲表层产品新闻。",
    fitReason: "它和你的商业、金融、科技交叉定位高度一致，也最容易形成连续系列。",
    formatRecommendation: "RECURRING_TRACK",
    priority: "PRIMARY",
    status: "NEW",
    primaryObservationCluster: "AI 基础设施权力集中",
    secondaryObservationCluster: "算力与基础设施资本开支",
  },
];

export const getTopicCandidates = cache(async (creatorProfileId?: string): Promise<TopicCandidateRow[]> => {
  if (!process.env.DATABASE_URL) {
    return mockTopicCandidates;
  }

  try {
    const profile = creatorProfileId
      ? await prisma.creatorProfile.findUnique({
          where: {
            id: creatorProfileId,
          },
        })
      : await prisma.creatorProfile.findFirst({
          where: {
            isActive: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
        });

    if (!profile) {
      return [];
    }

    const items = await prisma.topicCandidate.findMany({
      where: {
        topic: {
          creatorProfileId: profile.id,
        },
      },
      include: {
        topic: {
          include: {
            direction: true,
          },
        },
        anchorSignal: true,
      },
      orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
    });

    return items.map((item) => ({
      id: item.id,
      topicId: item.topicId,
      topicTitle: item.topic.title,
      topicSummary: item.topic.summary ?? "",
      directionId: item.topic.directionId,
      directionTitle: item.topic.direction?.title ?? null,
      anchorSignalId: item.anchorSignalId,
      anchorSignalTitle: item.anchorSignal?.title ?? null,
      title: item.title,
      whyNow: item.whyNow ?? "",
      fitReason: item.fitReason ?? "",
      formatRecommendation: item.formatRecommendation,
      priority: item.priority,
      status: item.status,
      primaryObservationCluster: item.topic.primaryObservationCluster ?? null,
      secondaryObservationCluster: item.topic.secondaryObservationCluster ?? null,
    }));
  } catch {
    return [];
  }
});

export async function getActiveProfileOrMock(): Promise<CreatorProfileRow> {
  return (await getActiveCreatorProfile()) ?? mockCreatorProfile;
}
