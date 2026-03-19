import { getSignals } from "@/lib/data";
import type { CreatorProfileRow } from "@/lib/profile-data";
import { executeStructuredGeneration } from "@/lib/services/structured-generation-service";

type DraftDirection = {
  title: string;
  whyNow: string;
  fitReason: string;
  priority: "PRIMARY" | "SECONDARY" | "WATCH";
  timeHorizon: string;
};

function summarizeClusterSignals(cluster: string, count: number) {
  return `${cluster} 这条主题线最近已累计 ${count} 条高相关信号，说明它已经具备持续产出条件。`;
}

type DirectionGenerationPayload = {
  directions?: Array<{
    title?: string;
    whyNow?: string;
    fitReason?: string;
    priority?: DraftDirection["priority"];
    timeHorizon?: string;
  }>;
};

function normalizeDirections(payload: DirectionGenerationPayload | null, fallback: DraftDirection[]) {
  const items = payload?.directions ?? [];

  const normalized = items
    .map((item) => ({
      title: item.title?.trim() ?? "",
      whyNow: item.whyNow?.trim() ?? "",
      fitReason: item.fitReason?.trim() ?? "",
      priority:
        item.priority === "PRIMARY" || item.priority === "SECONDARY" || item.priority === "WATCH"
          ? item.priority
          : "WATCH",
      timeHorizon: item.timeHorizon?.trim() || "未来 2-4 周",
    }))
    .filter((item) => item.title && item.whyNow && item.fitReason)
    .slice(0, 3);

  return normalized.length ? normalized : fallback;
}

async function buildFallbackDirections(profile: CreatorProfileRow): Promise<DraftDirection[]> {
  const signals = await getSignals();
  const relevantSignals = signals.filter((signal) => signal.status === "NEW" || signal.status === "CANDIDATE" || signal.status === "REVIEWED");

  const grouped = relevantSignals.reduce<Record<string, number>>((accumulator, signal) => {
    const key = signal.primaryObservationCluster;
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});

  const rankedClusters = Object.entries(grouped)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3);

  if (!rankedClusters.length) {
    return [
      {
        title: "先围绕当前定位建立第一条主方向",
        whyNow: "当前系统里的信号积累还不够密，但你已经完成画像定义，适合先把主线定下来。",
        fitReason: `你的定位是“${profile.positioning}”，因此第一步应先确立最核心的长期方向。`,
        priority: "PRIMARY",
        timeHorizon: "未来 2-4 周",
      },
    ];
  }

  return rankedClusters.map(([cluster, count], index) => ({
    title:
      index === 0
        ? `把“${cluster}”升级成主方向`
        : index === 1
          ? `让“${cluster}”成为第二方向`
          : `把“${cluster}”保留为观察方向`,
    whyNow: summarizeClusterSignals(cluster, count),
    fitReason:
      index === 0
        ? `这条方向和你的定位“${profile.positioning}”最贴合，也最容易形成清晰的人设与方法论。`
        : index === 1
          ? `它能补足你当前内容系统的第二解释维度，让选题不只围绕一个母命题旋转。`
          : "保留观察方向有助于平台判断你未来的画像变化，并为后续主题台预留增长空间。",
    priority: index === 0 ? "PRIMARY" : index === 1 ? "SECONDARY" : "WATCH",
    timeHorizon: "未来 2-4 周",
  }));
}

export async function generateDirectionsForProfile(profile: CreatorProfileRow): Promise<DraftDirection[]> {
  const fallback = await buildFallbackDirections(profile);
  const signals = await getSignals();
  const signalContext = signals
    .filter((signal) => signal.status === "NEW" || signal.status === "CANDIDATE" || signal.status === "REVIEWED")
    .slice(0, 8)
    .map((signal) => ({
      title: signal.title,
      primaryObservationCluster: signal.primaryObservationCluster,
      importanceScore: signal.importanceScore,
      viewpointScore: signal.viewpointScore,
    }));

  const payload = await executeStructuredGeneration<DirectionGenerationPayload>({
    capabilityKey: "direction_generation",
    systemInstruction:
      "你是知识型创作者平台里的方向生成助手。请根据创作者画像、近期信号和已有的方向草案，输出 1 到 3 条未来 2-4 周的内容方向。返回严格 JSON，格式为 {\"directions\":[{\"title\":\"...\",\"whyNow\":\"...\",\"fitReason\":\"...\",\"priority\":\"PRIMARY|SECONDARY|WATCH\",\"timeHorizon\":\"未来 2-4 周\"}]}。不要输出多余解释。",
    userPrompt: JSON.stringify(
      {
        creatorProfile: {
          positioning: profile.positioning,
          audience: profile.audience,
          coreThemes: profile.coreThemes,
          growthGoal: profile.growthGoal,
          currentStage: profile.currentStage,
        },
        recentSignals: signalContext,
        fallbackDirections: fallback,
      },
      null,
      2,
    ),
    metadata: {
      channel: "web",
      flow: "creator-os",
    },
  });

  return normalizeDirections(payload, fallback);
}
