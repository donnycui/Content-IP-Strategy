import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type CreatorProfileRow = {
  id: string;
  name: string;
  positioning: string;
  persona: string;
  audience: string;
  coreThemes: string;
  voiceStyle: string;
  growthGoal: string;
  contentBoundaries: string;
  currentStage: "EXPLORING" | "EMERGING" | "SCALING" | "ESTABLISHED";
  isActive: boolean;
  directionsCount: number;
  topicsCount: number;
  pendingSuggestionsCount: number;
};

export type CreatorProfileDraft = Omit<
  CreatorProfileRow,
  "id" | "isActive" | "directionsCount" | "topicsCount" | "pendingSuggestionsCount"
>;

export const mockCreatorProfile: CreatorProfileRow = {
  id: "profile-donny",
  name: "Donny",
  positioning: "用商业、金融与科技的交叉视角，帮助高认知受众理解时代变量并找到个人站位。",
  persona: "宏观叙事型、观点鲜明、但最终落到行动方向的知识型创作者。",
  audience: "高认知内容消费者、研究型读者、创业者、顾问与希望提升判断力的知识工作者。",
  coreThemes: "技术革命改写权力结构；资本流向预示时代选择；商业模式在新周期里重估；个体与组织重新站位。",
  voiceStyle: "冷静、锋利、结构化，先给结论，再给因果链，最终落到站位建议。",
  growthGoal: "建立一个能够持续输出方向判断与高质量选题的个人品牌系统。",
  contentBoundaries: "不做情绪化热点点评，不做纯资讯搬运，不为了流量牺牲长期母命题。",
  currentStage: "EMERGING",
  isActive: true,
  directionsCount: 0,
  topicsCount: 0,
  pendingSuggestionsCount: 0,
};

export const getActiveCreatorProfile = cache(async (): Promise<CreatorProfileRow | null> => {
  if (!process.env.DATABASE_URL) {
    return mockCreatorProfile;
  }

  try {
    const profile = await prisma.creatorProfile.findFirst({
      where: {
        isActive: true,
      },
      include: {
        directions: {
          where: {
            status: "ACTIVE",
          },
        },
        topics: {
          where: {
            status: {
              in: ["ACTIVE", "WATCHING"],
            },
          },
        },
        profileUpdates: {
          where: {
            status: "PENDING",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!profile) {
      return null;
    }

    return {
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
      directionsCount: profile.directions.length,
      topicsCount: profile.topics.length,
      pendingSuggestionsCount: profile.profileUpdates.length,
    };
  } catch {
    return null;
  }
});
