import type { CenterAgentKeyValue, CenterWorkspaceRecord } from "@/lib/domain/contracts";
import { getActiveCreatorProfile } from "@/lib/profile-data";
import { prisma } from "@/lib/prisma";

export const DEFAULT_CENTER_WORKSPACE_KEY = "primary";

function mapCenterWorkspace(workspace: {
  id: string;
  workspaceKey: string;
  creatorProfileId: string | null;
  currentAgentKey: CenterAgentKeyValue;
  recommendedActionLabel: string | null;
  recommendedActionHref: string | null;
  lastStageReason: string | null;
  lastJudgedAt: Date | null;
}): CenterWorkspaceRecord {
  return {
    id: workspace.id,
    workspaceKey: workspace.workspaceKey,
    creatorProfileId: workspace.creatorProfileId,
    currentAgentKey: workspace.currentAgentKey,
    recommendedActionLabel: workspace.recommendedActionLabel,
    recommendedActionHref: workspace.recommendedActionHref,
    lastStageReason: workspace.lastStageReason,
    lastJudgedAt: workspace.lastJudgedAt?.toISOString() ?? null,
  };
}

function buildMockCenterWorkspace(input?: {
  creatorProfileId?: string | null;
  currentAgentKey?: CenterAgentKeyValue;
  recommendedActionLabel?: string | null;
  recommendedActionHref?: string | null;
  lastStageReason?: string | null;
}): CenterWorkspaceRecord {
  return {
    id: "center-workspace-primary",
    workspaceKey: DEFAULT_CENTER_WORKSPACE_KEY,
    creatorProfileId: input?.creatorProfileId ?? null,
    currentAgentKey: input?.currentAgentKey ?? "IP_EXTRACTION",
    recommendedActionLabel: input?.recommendedActionLabel ?? null,
    recommendedActionHref: input?.recommendedActionHref ?? null,
    lastStageReason: input?.lastStageReason ?? null,
    lastJudgedAt: new Date().toISOString(),
  };
}

function buildWorkspaceUpdateData(input: {
  creatorProfileId: string | null;
  currentAgentKey?: CenterAgentKeyValue;
  recommendedActionLabel?: string | null;
  recommendedActionHref?: string | null;
  lastStageReason?: string | null;
}) {
  return {
    creatorProfileId: input.creatorProfileId,
    ...(input.currentAgentKey ? { currentAgentKey: input.currentAgentKey } : {}),
    ...(input.recommendedActionLabel !== undefined ? { recommendedActionLabel: input.recommendedActionLabel } : {}),
    ...(input.recommendedActionHref !== undefined ? { recommendedActionHref: input.recommendedActionHref } : {}),
    ...(input.lastStageReason !== undefined ? { lastStageReason: input.lastStageReason } : {}),
    lastJudgedAt: new Date(),
  };
}

export async function getActiveCenterWorkspace(): Promise<CenterWorkspaceRecord | null> {
  if (!process.env.DATABASE_URL) {
    return buildMockCenterWorkspace();
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      centerWorkspace?: {
        findUnique: (args: unknown) => Promise<unknown>;
      };
    };

    const workspace = await prismaClient.centerWorkspace?.findUnique({
      where: {
        workspaceKey: DEFAULT_CENTER_WORKSPACE_KEY,
      },
    });

    return workspace ? mapCenterWorkspace(workspace as Parameters<typeof mapCenterWorkspace>[0]) : null;
  } catch {
    return null;
  }
}

export async function getCenterWorkspaceForRead(input?: {
  creatorProfileId?: string | null;
  currentAgentKey?: CenterAgentKeyValue;
  recommendedActionLabel?: string | null;
  recommendedActionHref?: string | null;
  lastStageReason?: string | null;
}): Promise<CenterWorkspaceRecord> {
  const activeProfile = await getActiveCreatorProfile();
  const creatorProfileId = input?.creatorProfileId !== undefined ? input.creatorProfileId : activeProfile?.id ?? null;
  const existing = await getActiveCenterWorkspace();

  if (existing) {
    return existing;
  }

  return buildMockCenterWorkspace({
    creatorProfileId,
    currentAgentKey: input?.currentAgentKey,
    recommendedActionLabel: input?.recommendedActionLabel,
    recommendedActionHref: input?.recommendedActionHref,
    lastStageReason: input?.lastStageReason,
  });
}

export async function ensureActiveCenterWorkspace(input?: {
  creatorProfileId?: string | null;
  currentAgentKey?: CenterAgentKeyValue;
  recommendedActionLabel?: string | null;
  recommendedActionHref?: string | null;
  lastStageReason?: string | null;
}): Promise<CenterWorkspaceRecord> {
  const activeProfile = await getActiveCreatorProfile();
  const creatorProfileId = input?.creatorProfileId !== undefined ? input.creatorProfileId : activeProfile?.id ?? null;

  if (!process.env.DATABASE_URL) {
    return buildMockCenterWorkspace({
      creatorProfileId,
      currentAgentKey: input?.currentAgentKey,
      recommendedActionLabel: input?.recommendedActionLabel,
      recommendedActionHref: input?.recommendedActionHref,
      lastStageReason: input?.lastStageReason,
    });
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      centerWorkspace?: {
        upsert: (args: unknown) => Promise<unknown>;
      };
    };

    const workspace = await prismaClient.centerWorkspace?.upsert({
      where: {
        workspaceKey: DEFAULT_CENTER_WORKSPACE_KEY,
      },
      update: buildWorkspaceUpdateData({
        creatorProfileId,
        currentAgentKey: input?.currentAgentKey,
        recommendedActionLabel: input?.recommendedActionLabel,
        recommendedActionHref: input?.recommendedActionHref,
        lastStageReason: input?.lastStageReason,
      }),
      create: {
        workspaceKey: DEFAULT_CENTER_WORKSPACE_KEY,
        creatorProfileId,
        currentAgentKey: input?.currentAgentKey ?? "IP_EXTRACTION",
        recommendedActionLabel: input?.recommendedActionLabel ?? null,
        recommendedActionHref: input?.recommendedActionHref ?? null,
        lastStageReason: input?.lastStageReason ?? null,
        lastJudgedAt: new Date(),
      },
    });

    return workspace
      ? mapCenterWorkspace(workspace as Parameters<typeof mapCenterWorkspace>[0])
      : buildMockCenterWorkspace({
          creatorProfileId,
          currentAgentKey: input?.currentAgentKey,
          recommendedActionLabel: input?.recommendedActionLabel,
          recommendedActionHref: input?.recommendedActionHref,
          lastStageReason: input?.lastStageReason,
        });
  } catch {
    return buildMockCenterWorkspace({
      creatorProfileId,
      currentAgentKey: input?.currentAgentKey,
      recommendedActionLabel: input?.recommendedActionLabel,
      recommendedActionHref: input?.recommendedActionHref,
      lastStageReason: input?.lastStageReason,
    });
  }
}
