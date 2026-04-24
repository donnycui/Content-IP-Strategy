import type { DirectionRow } from "@/lib/direction-data";
import {
  getObservationClusterLabel,
  type ObservationClusterKey,
} from "@/lib/observation-clusters";
import type { CreatorProfileRow } from "@/lib/profile-data";
import { executeStructuredGeneration } from "@/lib/services/structured-generation-service";

export type DraftTopic = {
  title: string;
  summary: string;
  status: "ACTIVE" | "WATCHING";
  heatScore: number;
  signalCount: number;
  primaryObservationCluster: ObservationClusterKey;
  secondaryObservationCluster?: ObservationClusterKey | null;
  directionId?: string | null;
};

type TopicGenerationPayload = {
  topics?: Array<{
    title?: string;
    summary?: string;
    status?: DraftTopic["status"];
    heatScore?: number;
    signalCount?: number;
    primaryObservationCluster?: string;
    secondaryObservationCluster?: string | null;
    directionTitle?: string | null;
  }>;
};

const CLUSTER_KEYS: ObservationClusterKey[] = [
  "ai_infrastructure_power",
  "platform_entry_shift",
  "strategic_supply_control",
  "compute_capex_cycle",
  "policy_capital_allocation",
  "risk_repricing_cycle",
  "profit_pool_shift",
  "distribution_model_break",
];

function pickClusterKey(index: number) {
  return CLUSTER_KEYS[index % CLUSTER_KEYS.length];
}

function buildTopicSummary(direction: DirectionRow) {
  return `${direction.title} 这条主题线承接的是方向层已经确认的长期判断。下一步应该围绕它沉淀案例、方法和连续表达，而不是只做一次性选题。`;
}

export function buildFallbackTopicsForProfile(
  profile: CreatorProfileRow,
  directions: DirectionRow[],
): DraftTopic[] {
  const fallbackDrafts: DraftTopic[] = directions.slice(0, 6).map((direction, index) => ({
    title: direction.title,
    summary: buildTopicSummary(direction),
    status: direction.priority === "WATCH" ? "WATCHING" : "ACTIVE",
    heatScore: direction.priority === "PRIMARY" ? 4.6 : direction.priority === "SECONDARY" ? 4.1 : 3.6,
    signalCount: 0,
    primaryObservationCluster: pickClusterKey(index),
    secondaryObservationCluster: null,
    directionId: direction.id,
  }));

  if (fallbackDrafts.length) {
    return fallbackDrafts;
  }

  const firstTheme = profile.coreThemes.split(/[；;。]/).map((item) => item.trim()).filter(Boolean)[0] ?? "技术革命如何改写权力结构";
  const fallbackClusterKey: ObservationClusterKey = "distribution_model_break";

  return [
    {
      title: directions[0]?.title || getObservationClusterLabel(fallbackClusterKey) || "主题线待继续明确",
      summary: `当前真实信号还不够密，但围绕“${firstTheme}”的主题线已经值得先建立一个观察容器，后续再用新信号填充它。`,
      status: "WATCHING",
      heatScore: 2.8,
      signalCount: 0,
      primaryObservationCluster: fallbackClusterKey,
      secondaryObservationCluster: null,
      directionId: directions[0]?.id ?? null,
    },
  ];
}

export async function generateTopicsForProfile(
  profile: CreatorProfileRow,
  directions: DirectionRow[],
): Promise<DraftTopic[]> {
  return buildFallbackTopicsForProfile(profile, directions);
}

export async function generateTopicsForProfileWithTier(
  profile: CreatorProfileRow,
  directions: DirectionRow[],
  requestedTier?: "FAST" | "BALANCED" | "DEEP",
): Promise<DraftTopic[]> {
  const fallbackDrafts = buildFallbackTopicsForProfile(profile, directions);

  if (fallbackDrafts.length) {
    const payload = await executeStructuredGeneration<TopicGenerationPayload>({
      capabilityKey: "topic_generation",
      systemInstruction:
        "你是 zhaocai-IP-center 的主题线生成助手。请根据创作者画像和方向层结果，输出 1 到 8 条主题线。返回严格 JSON，格式为 {\"topics\":[{\"title\":\"...\",\"summary\":\"...\",\"status\":\"ACTIVE|WATCHING\",\"heatScore\":4.2,\"signalCount\":0,\"primaryObservationCluster\":\"固定观察簇 key\",\"secondaryObservationCluster\":null,\"directionTitle\":\"关联方向标题，可为空\"}]}。不要输出多余解释。",
      userPrompt: JSON.stringify(
        {
          creatorProfile: {
            positioning: profile.positioning,
            coreThemes: profile.coreThemes,
            audience: profile.audience,
            growthGoal: profile.growthGoal,
          },
          directions: directions.map((direction) => ({
            id: direction.id,
            title: direction.title,
            priority: direction.priority,
            whyNow: direction.whyNow,
          })),
          fallbackTopics: fallbackDrafts,
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

    const normalized = (payload?.topics ?? [])
      .map((item) => {
        const primaryObservationCluster = (item.primaryObservationCluster ?? "") as ObservationClusterKey;
        if (!primaryObservationCluster) {
          return null;
        }

        const secondaryObservationCluster = item.secondaryObservationCluster
          ? ((item.secondaryObservationCluster as ObservationClusterKey) ?? null)
          : null;
        const directionId =
          directions.find((direction) => direction.title === item.directionTitle)?.id ?? directions[0]?.id ?? null;

        return {
          title: item.title?.trim() || getObservationClusterLabel(primaryObservationCluster) || "未命名主题线",
          summary: item.summary?.trim() || buildTopicSummary(directions.find((direction) => direction.id === directionId) ?? directions[0]),
          status: item.status === "ACTIVE" || item.status === "WATCHING" ? item.status : "WATCHING",
          heatScore: typeof item.heatScore === "number" ? Number(item.heatScore.toFixed(2)) : 3,
          signalCount: typeof item.signalCount === "number" ? Math.max(0, Math.round(item.signalCount)) : 0,
          primaryObservationCluster,
          secondaryObservationCluster,
          directionId,
        } satisfies DraftTopic;
      })
      .filter((item) => Boolean(item))
      .map(
        (item) =>
          ({
            title: item!.title,
            summary: item!.summary,
            status: item!.status,
            heatScore: item!.heatScore,
            signalCount: item!.signalCount,
            primaryObservationCluster: item!.primaryObservationCluster,
            secondaryObservationCluster: item!.secondaryObservationCluster ?? null,
            directionId: item!.directionId ?? null,
          }) satisfies DraftTopic,
      )
      .slice(0, 8);

    return normalized.length ? normalized : fallbackDrafts;
  }

  return fallbackDrafts;
}
