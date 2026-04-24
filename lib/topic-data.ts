import { prisma } from "@/lib/prisma";
import { getDirections, mockDirections, type DirectionRow } from "@/lib/direction-data";
import { getObservationClusterLabel } from "@/lib/observation-clusters";
import { buildFallbackTopicsForProfile } from "@/lib/topic-generation";
import { getActiveCreatorProfile, mockCreatorProfile, type CreatorProfileRow } from "@/lib/profile-data";

export type TopicRow = {
  id: string;
  creatorProfileId: string;
  directionId?: string | null;
  directionTitle?: string | null;
  title: string;
  summary: string;
  status: "ACTIVE" | "WATCHING" | "ARCHIVED";
  heatScore: number;
  signalCount: number;
  primaryObservationCluster: string;
  secondaryObservationCluster?: string | null;
  sampleSignals: Array<{
    id: string;
    title: string;
    importanceScore: number;
  }>;
};

const mockTopics: TopicRow[] = [
  {
    id: "topic-ai-infra",
    creatorProfileId: mockCreatorProfile.id,
    directionId: mockDirections[0].id,
    directionTitle: mockDirections[0].title,
    title: "AI 基础设施权力集中",
    summary: "这条主题线适合持续跟踪，因为多条信号都在把 AI 竞争重心从应用层往基础设施层推。",
    status: "ACTIVE",
    heatScore: 4.8,
    signalCount: 3,
    primaryObservationCluster: "AI 基础设施权力集中",
    secondaryObservationCluster: "算力与基础设施资本开支",
    sampleSignals: [],
  },
];

function shapeFallbackTopics(profile: CreatorProfileRow, directions: DirectionRow[]) {
  const drafts = buildFallbackTopicsForProfile(profile, directions);

  return drafts.map((draft, index) => ({
      id: `topic-fallback-${index + 1}`,
      creatorProfileId: profile.id,
      directionId: draft.directionId,
      directionTitle: directions.find((direction) => direction.id === draft.directionId)?.title ?? null,
      title: draft.title,
      summary: draft.summary,
      status: draft.status,
      heatScore: draft.heatScore,
      signalCount: draft.signalCount,
      primaryObservationCluster: getObservationClusterLabel(draft.primaryObservationCluster) ?? draft.title,
      secondaryObservationCluster: draft.secondaryObservationCluster
        ? getObservationClusterLabel(draft.secondaryObservationCluster)
        : null,
      sampleSignals: [],
    }));
}

export async function getTopics(creatorProfileId?: string): Promise<TopicRow[]> {
  if (!process.env.DATABASE_URL) {
    return mockTopics;
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

    const topics = await prisma.topic.findMany({
      where: {
        creatorProfileId: profile.id,
        status: {
          in: ["ACTIVE", "WATCHING"],
        },
      },
      include: {
        direction: true,
      },
      orderBy: [{ heatScore: "desc" }, { updatedAt: "desc" }],
    });

    if (!topics.length) {
      const directions = await getDirections(profile.id);
      return shapeFallbackTopics(
        {
          id: profile.id,
          name: profile.name,
          positioning: profile.positioning ?? "",
          persona: profile.persona ?? "",
          audience: profile.audience ?? "",
          coreThemes: profile.coreThemes ?? "",
          voiceStyle: profile.voiceStyle ?? "",
          growthGoal: profile.growthGoal ?? "",
          contentBoundaries: profile.contentBoundaries ?? "",
          currentStage: profile.currentStage,
          isActive: profile.isActive,
          directionsCount: 0,
          topicsCount: 0,
          pendingSuggestionsCount: 0,
        },
        directions,
      );
    }

    return topics.map((topic) => ({
      id: topic.id,
      creatorProfileId: topic.creatorProfileId,
      directionId: topic.directionId,
      directionTitle: topic.direction?.title ?? null,
      title: topic.title,
      summary: topic.summary ?? "",
      status: topic.status,
      heatScore: topic.heatScore ?? 0,
      signalCount: topic.signalCount,
      primaryObservationCluster: topic.primaryObservationCluster
        ? getObservationClusterLabel(topic.primaryObservationCluster) ?? topic.title
        : topic.title,
      secondaryObservationCluster: topic.secondaryObservationCluster
        ? getObservationClusterLabel(topic.secondaryObservationCluster)
        : null,
      sampleSignals: [],
    }));
  } catch {
    return [];
  }
}
