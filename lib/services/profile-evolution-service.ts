import type { CreatorStage, SuggestionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getProfileUpdateSuggestions } from "@/lib/profile-update-suggestion-data";
import { generateProfileUpdateSuggestionsForProfileWithTier } from "@/lib/profile-update-suggestion-generation";
import { assertDatabaseConfigured, requireCreatorProfile } from "@/lib/services/profile-service";
import { ServiceError } from "@/lib/services/service-error";

export async function getProfileEvolutionSuggestionsService(creatorProfileId?: string) {
  return getProfileUpdateSuggestions(creatorProfileId);
}

export async function regenerateProfileEvolutionSuggestions(creatorProfileId?: string) {
  return regenerateProfileEvolutionSuggestionsWithTier(creatorProfileId);
}

export async function regenerateProfileEvolutionSuggestionsWithTier(
  creatorProfileId?: string,
  requestedTier?: "FAST" | "BALANCED" | "DEEP",
) {
  assertDatabaseConfigured();

  const profile = await requireCreatorProfile(creatorProfileId);
  const drafts = await generateProfileUpdateSuggestionsForProfileWithTier(profile, requestedTier);

  const createdCount = await prisma.$transaction(async (tx) => {
    await tx.profileUpdateSuggestion.deleteMany({
      where: {
        creatorProfileId: profile.id,
        status: "PENDING",
      },
    });

    const created = await Promise.all(
      drafts.map((draft) =>
        tx.profileUpdateSuggestion.create({
          data: {
            creatorProfileId: profile.id,
            type: draft.type,
            beforeValue: draft.beforeValue ?? null,
            suggestedValue: draft.suggestedValue,
            reason: draft.reason,
            confidence: draft.confidence,
            status: "PENDING",
          },
        }),
      ),
    );

    return created.length;
  });

  return { createdCount };
}

export async function updateProfileEvolutionSuggestionStatus(id: string, status?: SuggestionStatus) {
  assertDatabaseConfigured();

  if (!status) {
    throw new ServiceError("必须提供新的建议状态。", 400, "PROFILE_UPDATE_STATUS_REQUIRED");
  }

  const suggestion = await prisma.profileUpdateSuggestion.findUnique({
    where: {
      id,
    },
  });

  if (!suggestion) {
    throw new ServiceError("画像进化建议不存在或已失效。", 404, "PROFILE_UPDATE_NOT_FOUND");
  }

  await prisma.$transaction(async (tx) => {
    await tx.profileUpdateSuggestion.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    if (status !== "ACCEPTED") {
      return;
    }

    const profileData: {
      coreThemes?: string;
      contentBoundaries?: string;
      currentStage?: CreatorStage;
    } = {};

    if (suggestion.type === "CORE_THEME") {
      profileData.coreThemes = suggestion.suggestedValue;
    }

    if (suggestion.type === "CONTENT_BOUNDARY") {
      profileData.contentBoundaries = suggestion.suggestedValue;
    }

    if (suggestion.type === "CURRENT_STAGE") {
      profileData.currentStage = suggestion.suggestedValue as CreatorStage;
    }

    if (Object.keys(profileData).length > 0) {
      await tx.creatorProfile.update({
        where: {
          id: suggestion.creatorProfileId,
        },
        data: profileData,
      });
    }
  });

  return { ok: true };
}
