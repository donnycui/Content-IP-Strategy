import type { PlatformStrategyMemoPayload } from "@/lib/domain/contracts";
import { prisma } from "@/lib/prisma";
import { ensureActiveCenterWorkspace } from "@/lib/services/center-workspace-service";

function mapPlatformStrategyMemo(record: {
  id: string;
  workspaceId: string;
  channelKey: string;
  headline: string;
  summary: string;
  detail: string | null;
  sourceRef: string | null;
  updatedAt: Date;
}): PlatformStrategyMemoPayload {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    channelKey: record.channelKey,
    headline: record.headline,
    summary: record.summary,
    detail: record.detail,
    sourceRef: record.sourceRef,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function buildMockPlatformStrategyMemo(input: {
  workspaceId: string;
  channelKey: string;
  headline: string;
  summary: string;
  detail?: string | null;
  sourceRef?: string | null;
}): PlatformStrategyMemoPayload {
  return {
    id: `platform-strategy-${input.channelKey}`,
    workspaceId: input.workspaceId,
    channelKey: input.channelKey,
    headline: input.headline,
    summary: input.summary,
    detail: input.detail ?? null,
    sourceRef: input.sourceRef ?? null,
    updatedAt: new Date().toISOString(),
  };
}

export async function upsertPlatformStrategyMemo(input: {
  channelKey: string;
  headline: string;
  summary: string;
  detail?: string | null;
  sourceRef?: string | null;
}): Promise<PlatformStrategyMemoPayload> {
  const workspace = await ensureActiveCenterWorkspace();
  const fallback = buildMockPlatformStrategyMemo({
    workspaceId: workspace.id,
    channelKey: input.channelKey,
    headline: input.headline,
    summary: input.summary,
    detail: input.detail ?? null,
    sourceRef: input.sourceRef ?? null,
  });

  if (!process.env.DATABASE_URL) {
    return fallback;
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      platformStrategyMemo?: {
        upsert: (args: unknown) => Promise<unknown>;
      };
    };

    const memo = await prismaClient.platformStrategyMemo?.upsert({
      where: {
        workspaceId_channelKey: {
          workspaceId: workspace.id,
          channelKey: input.channelKey,
        },
      },
      update: {
        headline: input.headline,
        summary: input.summary,
        detail: input.detail ?? null,
        sourceRef: input.sourceRef ?? null,
      },
      create: {
        workspaceId: workspace.id,
        channelKey: input.channelKey,
        headline: input.headline,
        summary: input.summary,
        detail: input.detail ?? null,
        sourceRef: input.sourceRef ?? null,
      },
    });

    return memo ? mapPlatformStrategyMemo(memo as Parameters<typeof mapPlatformStrategyMemo>[0]) : fallback;
  } catch {
    return fallback;
  }
}

export async function getPlatformStrategyMemos(): Promise<PlatformStrategyMemoPayload[]> {
  const workspace = await ensureActiveCenterWorkspace();

  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      platformStrategyMemo?: {
        findMany: (args: unknown) => Promise<unknown[]>;
      };
    };

    const memos = await prismaClient.platformStrategyMemo?.findMany({
      where: {
        workspaceId: workspace.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return (memos ?? []).map((memo) => mapPlatformStrategyMemo(memo as Parameters<typeof mapPlatformStrategyMemo>[0]));
  } catch {
    return [];
  }
}
