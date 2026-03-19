import { buildCandidateClusterBrief } from "@/lib/candidate-briefs";
import { getSignals } from "@/lib/data";
import type { DirectionRow } from "@/lib/direction-data";
import {
  getObservationClusterLabel,
  getObservationClusterThemeLabel,
  resolveObservationClusterKey,
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

function rankDirectionPriority(priority: DirectionRow["priority"]) {
  switch (priority) {
    case "PRIMARY":
      return 0;
    case "SECONDARY":
      return 1;
    default:
      return 2;
  }
}

function pickDirectionId(clusterLabel: string, directions: DirectionRow[]) {
  const directMatch = directions.find((direction) =>
    [direction.title, direction.whyNow, direction.fitReason].some((text) => text.includes(clusterLabel)),
  );

  if (directMatch) {
    return directMatch.id;
  }

  const themeLabel = getObservationClusterThemeLabel(clusterLabel);
  const themeMatch = themeLabel
    ? directions.find((direction) =>
        [direction.title, direction.whyNow, direction.fitReason].some((text) => text.includes(themeLabel)),
      )
    : null;

  if (themeMatch) {
    return themeMatch.id;
  }

  return [...directions].sort((left, right) => rankDirectionPriority(left.priority) - rankDirectionPriority(right.priority))[0]?.id ?? null;
}

function buildTopicSummary(clusterLabel: string, signals: Awaited<ReturnType<typeof getSignals>>) {
  const brief = buildCandidateClusterBrief(clusterLabel, signals);
  const sampleTitles = signals
    .slice(0, 2)
    .map((signal) => signal.title)
    .filter(Boolean)
    .join("；");

  const leadLine =
    signals.length >= 2
      ? `${clusterLabel} 这条主题线已经开始稳定积累，不再只是零散观察点。`
      : `${clusterLabel} 已经形成早期主题线，但还处在继续验证阶段。`;

  const timingLine = brief.timingLine.replaceAll("观察对象", "主题线").replaceAll("观察", "跟踪");
  const actionLine = brief.actionLine.replaceAll("观察簇", "主题线").replaceAll("这个簇", "这条主题线");
  const supportLine = sampleTitles ? `当前最有代表性的支撑信号包括：${sampleTitles}。` : "";

  return [leadLine, timingLine, actionLine, supportLine].filter(Boolean).join(" ");
}

export async function generateTopicsForProfile(
  profile: CreatorProfileRow,
  directions: DirectionRow[],
): Promise<DraftTopic[]> {
  return generateTopicsForProfileWithTier(profile, directions);
}

export async function generateTopicsForProfileWithTier(
  profile: CreatorProfileRow,
  directions: DirectionRow[],
  requestedTier?: "FAST" | "BALANCED" | "DEEP",
): Promise<DraftTopic[]> {
  const signals = await getSignals();
  const relevantSignals = signals.filter(
    (signal) => signal.status === "NEW" || signal.status === "REVIEWED" || signal.status === "CANDIDATE",
  );

  const grouped = relevantSignals.reduce<Record<string, typeof relevantSignals>>((accumulator, signal) => {
    const key = signal.primaryObservationCluster;
    accumulator[key] = accumulator[key] ? [...accumulator[key], signal] : [signal];
    return accumulator;
  }, {});

  const fallbackDrafts = Object.entries(grouped)
    .map(([clusterLabel, clusterSignals]) => {
      const clusterKey = resolveObservationClusterKey(clusterLabel);

      if (!clusterKey) {
        return null;
      }

      const averageImportance =
        clusterSignals.reduce((sum, signal) => sum + signal.importanceScore, 0) / Math.max(clusterSignals.length, 1);
      const averageViewpoint =
        clusterSignals.reduce((sum, signal) => sum + signal.viewpointScore, 0) / Math.max(clusterSignals.length, 1);
      const secondaryCounts = clusterSignals.reduce<Record<string, number>>((accumulator, signal) => {
        if (!signal.secondaryObservationCluster) {
          return accumulator;
        }

        accumulator[signal.secondaryObservationCluster] = (accumulator[signal.secondaryObservationCluster] ?? 0) + 1;
        return accumulator;
      }, {});

      const rankedSecondary = Object.entries(secondaryCounts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
      const secondaryObservationCluster =
        rankedSecondary && rankedSecondary !== clusterLabel ? resolveObservationClusterKey(rankedSecondary) : null;
      const heatScore = Number((averageImportance * 0.55 + averageViewpoint * 0.25 + Math.min(clusterSignals.length, 5) * 0.4).toFixed(2));

      return {
        title: clusterLabel,
        summary: buildTopicSummary(clusterLabel, clusterSignals),
        status: clusterSignals.length >= 2 || averageImportance >= 4.2 ? "ACTIVE" : "WATCHING",
        heatScore,
        signalCount: clusterSignals.length,
        primaryObservationCluster: clusterKey,
        secondaryObservationCluster,
        directionId: pickDirectionId(clusterLabel, directions),
      } satisfies DraftTopic;
    })
    .filter((draft) => draft !== null)
    .sort((left, right) => right.heatScore - left.heatScore);

  if (fallbackDrafts.length) {
    const payload = await executeStructuredGeneration<TopicGenerationPayload>({
      capabilityKey: "topic_generation",
      systemInstruction:
        "你是知识型创作者平台里的主题线生成助手。请根据创作者画像、方向台和已有主题草案，输出 1 到 8 条主题线。返回严格 JSON，格式为 {\"topics\":[{\"title\":\"...\",\"summary\":\"...\",\"status\":\"ACTIVE|WATCHING\",\"heatScore\":4.2,\"signalCount\":3,\"primaryObservationCluster\":\"固定观察簇 key 或中文标签\",\"secondaryObservationCluster\":\"固定观察簇 key 或中文标签，可为空\",\"directionTitle\":\"关联方向标题，可为空\"}]}。不要输出多余解释。",
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
        const primaryObservationCluster = resolveObservationClusterKey(item.primaryObservationCluster ?? "") ?? null;
        if (!primaryObservationCluster) {
          return null;
        }

        const secondaryObservationCluster = item.secondaryObservationCluster
          ? resolveObservationClusterKey(item.secondaryObservationCluster)
          : null;
        const directionId =
          directions.find((direction) => direction.title === item.directionTitle)?.id ??
          pickDirectionId(item.title?.trim() || getObservationClusterLabel(primaryObservationCluster) || "", directions);

        return {
          title: item.title?.trim() || getObservationClusterLabel(primaryObservationCluster) || "未命名主题线",
          summary: item.summary?.trim() || buildTopicSummary(item.title?.trim() || "", relevantSignals),
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

  const firstTheme = profile.coreThemes.split(/[；;。]/).map((item) => item.trim()).filter(Boolean)[0] ?? "技术革命如何改写权力结构";
  const fallbackClusterKey: ObservationClusterKey = "distribution_model_break";

  return [
    {
      title: getObservationClusterLabel(fallbackClusterKey) ?? "旧分发模式失效",
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
