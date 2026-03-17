import { prisma } from "@/lib/prisma";
import { getSignals } from "@/lib/data";
import { getActiveCreatorProfile, mockCreatorProfile, type CreatorProfileRow } from "@/lib/profile-data";

export type DirectionRow = {
  id: string;
  creatorProfileId: string;
  title: string;
  whyNow: string;
  fitReason: string;
  priority: "PRIMARY" | "SECONDARY" | "WATCH";
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  timeHorizon: string;
  createdAt: string;
};

export const mockDirections: DirectionRow[] = [
  {
    id: "direction-ai-power",
    creatorProfileId: mockCreatorProfile.id,
    title: "把 AI 权力迁移讲成长期主线",
    whyNow: "最近的新信号和候选信号持续集中在 AI 基础设施、平台入口迁移和利润池重组，适合形成连续判断。",
    fitReason: "这条方向与“商业 + 金融 + 科技”的交叉定位高度一致，也最容易体现你的宏观叙事能力。",
    priority: "PRIMARY",
    status: "ACTIVE",
    timeHorizon: "未来 2-4 周",
    createdAt: new Date().toISOString(),
  },
  {
    id: "direction-capital-choice",
    creatorProfileId: mockCreatorProfile.id,
    title: "用资本流向解释时代选择",
    whyNow: "政策、半导体、算力资本开支等信号正在积累，适合从资本开支和资源配置角度重构内容主线。",
    fitReason: "这条方向能把你的财经判断和科技趋势解释能力连在一起，更容易形成差异化观点。",
    priority: "SECONDARY",
    status: "ACTIVE",
    timeHorizon: "未来 2-4 周",
    createdAt: new Date().toISOString(),
  },
  {
    id: "direction-positioning",
    creatorProfileId: mockCreatorProfile.id,
    title: "把结构性变化落到个体站位建议",
    whyNow: "你的内容目标不是停留在解释，而是帮助高认知受众形成行动方向，这条线值得持续保留。",
    fitReason: "它直接对应你的增长目标和人设，能把“看完更有行动方向”变成稳定标签。",
    priority: "WATCH",
    status: "ACTIVE",
    timeHorizon: "未来 2-4 周",
    createdAt: new Date().toISOString(),
  },
];

function splitCoreThemes(coreThemes: string) {
  return coreThemes
    .split(/[；;。]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function deriveFallbackDirections(profile: CreatorProfileRow, signalTitles: string[]): DirectionRow[] {
  const themes = splitCoreThemes(profile.coreThemes);
  const topTheme = themes[0] ?? "技术革命改写权力结构";
  const secondTheme = themes[1] ?? "资本流向预示时代选择";
  const thirdTheme = themes[2] ?? "商业模式在新周期里重估";
  const currentSignalHint = signalTitles.slice(0, 3).join("、");

  return [
    {
      id: `${profile.id}-direction-1`,
      creatorProfileId: profile.id,
      title: `围绕“${topTheme}”建立主方向`,
      whyNow: currentSignalHint
        ? `最近的信号重点集中在 ${currentSignalHint} 这类主题，说明这条方向已经有现实支撑。`
        : "当前信号量还不够大，但这条方向与画像最匹配，适合作为主线。",
      fitReason: `这条方向与当前定位“${profile.positioning}”最一致，也最容易让你的内容形成长期辨识度。`,
      priority: "PRIMARY",
      status: "ACTIVE",
      timeHorizon: "未来 2-4 周",
      createdAt: new Date().toISOString(),
    },
    {
      id: `${profile.id}-direction-2`,
      creatorProfileId: profile.id,
      title: `把“${secondTheme}”作为第二方向`,
      whyNow: "这条方向适合承接与市场、资本和政策相关的结构性信号，能增加内容维度。",
      fitReason: "它能帮助平台从单点热点切到持续判断，更适合知识型创作者经营主题线。",
      priority: "SECONDARY",
      status: "ACTIVE",
      timeHorizon: "未来 2-4 周",
      createdAt: new Date().toISOString(),
    },
    {
      id: `${profile.id}-direction-3`,
      creatorProfileId: profile.id,
      title: `保留“${thirdTheme}”作为观察方向`,
      whyNow: "虽然不一定作为最强主线，但它能帮助你扩展解释框架，避免内容过窄。",
      fitReason: "保留一条观察方向，可以让系统后续更容易提出画像和方向的进化建议。",
      priority: "WATCH",
      status: "ACTIVE",
      timeHorizon: "未来 2-4 周",
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function getDirections(creatorProfileId?: string): Promise<DirectionRow[]> {
  if (!process.env.DATABASE_URL) {
    return mockDirections;
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

    const directions = await prisma.direction.findMany({
      where: {
        creatorProfileId: profile.id,
        status: "ACTIVE",
      },
      orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
    });

    if (!directions.length) {
      const signals = await getSignals();
      return deriveFallbackDirections(
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
        signals.map((signal) => signal.title),
      );
    }

    return directions.map((direction) => ({
      id: direction.id,
      creatorProfileId: direction.creatorProfileId,
      title: direction.title,
      whyNow: direction.whyNow ?? "",
      fitReason: direction.fitReason ?? "",
      priority: direction.priority,
      status: direction.status,
      timeHorizon: direction.timeHorizon ?? "未来 2-4 周",
      createdAt: direction.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

