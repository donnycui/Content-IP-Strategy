import type { CreatorProfile, CreatorStage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getActiveCreatorProfile, type CreatorProfileDraft, type CreatorProfileRow } from "@/lib/profile-data";
import { extractCreatorProfileDraft } from "@/lib/profile-extraction";
import { ServiceError } from "@/lib/services/service-error";

export type UpdateCreatorProfileInput = {
  id?: string;
  name?: string;
  positioning?: string;
  persona?: string;
  audience?: string;
  coreThemes?: string;
  voiceStyle?: string;
  growthGoal?: string;
  contentBoundaries?: string;
  currentStage?: "EXPLORING" | "EMERGING" | "SCALING" | "ESTABLISHED";
};

function mapCreatorProfileEntity(
  profile: CreatorProfile & {
    directions?: Array<unknown>;
    topics?: Array<unknown>;
    profileUpdates?: Array<unknown>;
  },
): CreatorProfileRow {
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
    directionsCount: profile.directions?.length ?? 0,
    topicsCount: profile.topics?.length ?? 0,
    pendingSuggestionsCount: profile.profileUpdates?.length ?? 0,
  };
}

export function assertDatabaseConfigured() {
  if (!process.env.DATABASE_URL) {
    throw new ServiceError("DATABASE_URL is not configured.", 503, "DATABASE_UNAVAILABLE");
  }
}

export async function getActiveCreatorProfileService() {
  return getActiveCreatorProfile();
}

export async function getCreatorProfileById(id: string) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const profile = await prisma.creatorProfile.findUnique({
      where: {
        id,
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
    });

    return profile ? mapCreatorProfileEntity(profile) : null;
  } catch {
    return null;
  }
}

export async function requireCreatorProfile(id?: string) {
  const profile = id ? await getCreatorProfileById(id) : await getActiveCreatorProfile();

  if (!profile) {
    throw new ServiceError("请先完成 IP 提炼，生成创作者画像。", 400, "PROFILE_REQUIRED");
  }

  return profile;
}

function normalizeDraft(draft: CreatorProfileDraft) {
  return {
    name: draft.name,
    positioning: draft.positioning,
    persona: draft.persona,
    audience: draft.audience,
    coreThemes: draft.coreThemes,
    voiceStyle: draft.voiceStyle,
    growthGoal: draft.growthGoal,
    contentBoundaries: draft.contentBoundaries,
    currentStage: draft.currentStage as CreatorStage,
    isActive: true,
  };
}

export async function activateCreatorProfileDraft(draft: CreatorProfileDraft) {
  assertDatabaseConfigured();

  const profile = await prisma.$transaction(async (tx) => {
    await tx.creatorProfile.updateMany({
      data: {
        isActive: false,
      },
    });

    return tx.creatorProfile.create({
      data: normalizeDraft(draft),
      select: {
        id: true,
      },
    });
  });

  return {
    profileId: profile.id,
  };
}

export async function extractCreatorProfileAndActivate(sourceText: string) {
  return extractCreatorProfileAndActivateWithTier(sourceText);
}

export async function extractCreatorProfileAndActivateWithTier(sourceText: string, requestedTier?: "FAST" | "BALANCED" | "DEEP") {
  assertDatabaseConfigured();

  if (!sourceText.trim()) {
    throw new ServiceError("创作者自述不能为空。", 400, "EMPTY_SOURCE_TEXT");
  }

  const draft = await extractCreatorProfileDraft({
    sourceText,
    requestedTier,
  });

  return activateCreatorProfileDraft(draft);
}

export async function updateCreatorProfile(input: UpdateCreatorProfileInput) {
  assertDatabaseConfigured();

  if (!input.id) {
    throw new ServiceError("创作者画像 ID 缺失。", 400, "PROFILE_ID_REQUIRED");
  }

  const existing = await prisma.creatorProfile.findUnique({
    where: {
      id: input.id,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw new ServiceError("创作者画像不存在或已失效。", 404, "PROFILE_NOT_FOUND");
  }

  await prisma.creatorProfile.update({
    where: {
      id: input.id,
    },
    data: {
      name: input.name,
      positioning: input.positioning,
      persona: input.persona,
      audience: input.audience,
      coreThemes: input.coreThemes,
      voiceStyle: input.voiceStyle,
      growthGoal: input.growthGoal,
      contentBoundaries: input.contentBoundaries,
      currentStage: input.currentStage as CreatorStage | undefined,
    },
  });

  return { ok: true };
}
