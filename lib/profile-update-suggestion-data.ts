import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { buildFallbackProfileUpdateSuggestions } from "@/lib/profile-update-suggestion-generation";
import { getActiveCreatorProfile, mockCreatorProfile, type CreatorProfileRow } from "@/lib/profile-data";

export type ProfileUpdateSuggestionRow = {
  id: string;
  creatorProfileId: string;
  type: "POSITIONING" | "PERSONA" | "AUDIENCE" | "CORE_THEME" | "VOICE_STYLE" | "GROWTH_GOAL" | "CONTENT_BOUNDARY" | "CURRENT_STAGE" | "DIRECTION_WEIGHT";
  beforeValue?: string | null;
  suggestedValue: string;
  reason: string;
  confidence?: number | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
};

export const mockProfileUpdateSuggestions: ProfileUpdateSuggestionRow[] = [
  {
    id: "suggestion-core-theme",
    creatorProfileId: mockCreatorProfile.id,
    type: "CORE_THEME",
    beforeValue: mockCreatorProfile.coreThemes,
    suggestedValue: `${mockCreatorProfile.coreThemes}；当前应额外强调：把 AI 权力迁移讲成长期主线`,
    reason: "最近的方向、主题线和选题都在朝这条主线聚集，说明它已经不只是备选议题。",
    confidence: 0.78,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  },
];

export const getProfileUpdateSuggestions = cache(
  async (creatorProfileId?: string): Promise<ProfileUpdateSuggestionRow[]> => {
  if (!process.env.DATABASE_URL) {
    return mockProfileUpdateSuggestions;
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

    const items = await prisma.profileUpdateSuggestion.findMany({
      where: {
        creatorProfileId: profile.id,
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    if (!items.length) {
      const fallback = await buildFallbackProfileUpdateSuggestions({
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
      });

      return fallback.map((item, index) => ({
        id: `profile-suggestion-fallback-${index + 1}`,
        creatorProfileId: profile.id,
        type: item.type,
        beforeValue: item.beforeValue,
        suggestedValue: item.suggestedValue,
        reason: item.reason,
        confidence: item.confidence,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      }));
    }

    return items.map((item) => ({
      id: item.id,
      creatorProfileId: item.creatorProfileId,
      type: item.type,
      beforeValue: item.beforeValue,
      suggestedValue: item.suggestedValue,
      reason: item.reason,
      confidence: item.confidence,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
});

export async function getActiveProfileForSuggestions(): Promise<CreatorProfileRow> {
  return (await getActiveCreatorProfile()) ?? mockCreatorProfile;
}
