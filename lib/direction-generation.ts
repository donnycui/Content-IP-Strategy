import type { CreatorProfileRow } from "@/lib/profile-data";
import { executeStructuredGeneration } from "@/lib/services/structured-generation-service";

type DraftDirection = {
  title: string;
  whyNow: string;
  fitReason: string;
  priority: "PRIMARY" | "SECONDARY" | "WATCH";
  timeHorizon: string;
};

function splitThemes(text: string) {
  return text
    .split(/[；;。,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
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
  const themes = splitThemes(profile.coreThemes);
  const primary = themes[0] || "先建立第一条清晰主线";
  const secondary = themes[1] || "把经验沉淀成方法";
  const watch = themes[2] || "持续观察新的表达切口";

  return [
    {
      title: `围绕“${primary}”建立主方向`,
      whyNow: "画像已经形成，当前最重要的不是继续扩散，而是先形成一条可以持续讲下去的主线。",
      fitReason: `这条方向与当前定位“${profile.positioning || "待继续明确"}”最贴近，也最容易形成稳定辨识度。`,
      priority: "PRIMARY",
      timeHorizon: "未来 2-4 周",
    },
    {
      title: `把“${secondary}”作为第二方向`,
      whyNow: "第二方向负责补充主线，避免内容只围绕一个切口反复重复。",
      fitReason: "它适合承接案例、经验和方法论，让后续主题线更有扩展空间。",
      priority: "SECONDARY",
      timeHorizon: "未来 2-4 周",
    },
    {
      title: `保留“${watch}”为观察方向`,
      whyNow: "观察方向不是今天立刻重投入，而是为后续可能成立的内容增长线预留空间。",
      fitReason: "它可以让系统持续观察用户真实表达和市场反应，再决定是否升级成稳定主线。",
      priority: "WATCH",
      timeHorizon: "未来 2-4 周",
    },
  ];
}

export async function generateDirectionsForProfile(profile: CreatorProfileRow): Promise<DraftDirection[]> {
  return generateDirectionsForProfileWithTier(profile);
}

export async function generateDirectionsForProfileWithTier(
  profile: CreatorProfileRow,
  requestedTier?: "FAST" | "BALANCED" | "DEEP",
): Promise<DraftDirection[]> {
  const fallback = await buildFallbackDirections(profile);

  const payload = await executeStructuredGeneration<DirectionGenerationPayload>({
    capabilityKey: "direction_generation",
    systemInstruction:
      "你是 zhaocai-IP-center 的方向生成助手。请根据创作者画像和已有方向草案，输出 1 到 3 条未来 2-4 周的内容方向。返回严格 JSON，格式为 {\"directions\":[{\"title\":\"...\",\"whyNow\":\"...\",\"fitReason\":\"...\",\"priority\":\"PRIMARY|SECONDARY|WATCH\",\"timeHorizon\":\"未来 2-4 周\"}]}。不要输出多余解释。",
    userPrompt: JSON.stringify(
      {
        creatorProfile: {
          positioning: profile.positioning,
          audience: profile.audience,
          coreThemes: profile.coreThemes,
          growthGoal: profile.growthGoal,
          currentStage: profile.currentStage,
        },
        fallbackDirections: fallback,
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

  return normalizeDirections(payload, fallback);
}
