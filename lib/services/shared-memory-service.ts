import {
  SHARED_MEMORY_CATEGORY_BY_LABEL,
  SHARED_MEMORY_CATEGORY_ORDER,
  SHARED_MEMORY_LABEL_BY_CATEGORY,
} from "@/lib/center/shared-memory-types";
import type {
  CenterAgentKeyValue,
  CenterMemorySnapshotPayload,
  SharedMemoryCategoryValue,
  SharedMemoryRecordPayload,
} from "@/lib/domain/contracts";
import { prisma } from "@/lib/prisma";

function mapSharedMemoryRecord(record: {
  id: string;
  workspaceId: string;
  agentKey: CenterAgentKeyValue | null;
  category: SharedMemoryCategoryValue;
  title: string;
  summary: string;
  detail: string | null;
  sourceRef: string | null;
  isActive: boolean;
  effectiveAt: Date;
  supersededAt: Date | null;
}): SharedMemoryRecordPayload {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    agentKey: record.agentKey,
    category: record.category,
    title: record.title,
    summary: record.summary,
    detail: record.detail,
    sourceRef: record.sourceRef,
    isActive: record.isActive,
    effectiveAt: record.effectiveAt.toISOString(),
    supersededAt: record.supersededAt?.toISOString() ?? null,
  };
}

function buildMockSharedMemoryRecord(input: {
  workspaceId: string;
  category: SharedMemoryCategoryValue;
  title: string;
  summary: string;
  detail?: string | null;
  agentKey?: CenterAgentKeyValue | null;
  sourceRef?: string | null;
}): SharedMemoryRecordPayload {
  return {
    id: `shared-memory-${input.category.toLowerCase()}`,
    workspaceId: input.workspaceId,
    agentKey: input.agentKey ?? null,
    category: input.category,
    title: input.title,
    summary: input.summary,
    detail: input.detail ?? null,
    sourceRef: input.sourceRef ?? null,
    isActive: true,
    effectiveAt: new Date().toISOString(),
    supersededAt: null,
  };
}

function toSnapshotItem(record: SharedMemoryRecordPayload): CenterMemorySnapshotPayload {
  return {
    label: record.title || SHARED_MEMORY_LABEL_BY_CATEGORY[record.category],
    value: record.summary,
    detail: record.detail ?? "",
  };
}

export async function getActiveSharedMemoryRecords(
  workspaceId: string,
  categories?: SharedMemoryCategoryValue[],
): Promise<SharedMemoryRecordPayload[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      sharedMemoryRecord?: {
        findMany: (args: unknown) => Promise<unknown[]>;
      };
    };

    const records = await prismaClient.sharedMemoryRecord?.findMany({
      where: {
        workspaceId,
        isActive: true,
        ...(categories?.length
          ? {
              category: {
                in: categories,
              },
            }
          : {}),
      },
      orderBy: [{ effectiveAt: "desc" }, { createdAt: "desc" }],
    });

    return (records ?? []).map((record) => mapSharedMemoryRecord(record as Parameters<typeof mapSharedMemoryRecord>[0]));
  } catch {
    return [];
  }
}

export async function upsertActiveSharedMemoryRecord(input: {
  workspaceId: string;
  category: SharedMemoryCategoryValue;
  title: string;
  summary: string;
  detail?: string | null;
  agentKey?: CenterAgentKeyValue | null;
  sourceRef?: string | null;
  payload?: Record<string, string | number | boolean | null>;
}): Promise<SharedMemoryRecordPayload> {
  if (!process.env.DATABASE_URL) {
    return buildMockSharedMemoryRecord(input);
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      sharedMemoryRecord?: {
        findFirst: (args: unknown) => Promise<unknown>;
        updateMany: (args: unknown) => Promise<unknown>;
        create: (args: unknown) => Promise<unknown>;
      };
      $transaction: typeof prisma.$transaction;
    };

    const existing = await prismaClient.sharedMemoryRecord?.findFirst({
      where: {
        workspaceId: input.workspaceId,
        category: input.category,
        isActive: true,
      },
      orderBy: {
        effectiveAt: "desc",
      },
    });

    const mappedExisting = existing
      ? mapSharedMemoryRecord(existing as Parameters<typeof mapSharedMemoryRecord>[0])
      : null;

    if (
      mappedExisting &&
      mappedExisting.title === input.title &&
      mappedExisting.summary === input.summary &&
      (mappedExisting.detail ?? null) === (input.detail ?? null) &&
      mappedExisting.agentKey === (input.agentKey ?? null) &&
      mappedExisting.sourceRef === (input.sourceRef ?? null)
    ) {
      return mappedExisting;
    }

    await prismaClient.$transaction([
      prismaClient.sharedMemoryRecord!.updateMany({
        where: {
          workspaceId: input.workspaceId,
          category: input.category,
          isActive: true,
        },
        data: {
          isActive: false,
          supersededAt: new Date(),
        },
      }),
      prismaClient.sharedMemoryRecord!.create({
        data: {
          workspaceId: input.workspaceId,
          agentKey: input.agentKey ?? null,
          category: input.category,
          title: input.title,
          summary: input.summary,
          detail: input.detail ?? null,
          sourceRef: input.sourceRef ?? null,
          payloadJson: input.payload ?? null,
        },
      }),
    ]);

    const latest = await prismaClient.sharedMemoryRecord!.findFirst({
      where: {
        workspaceId: input.workspaceId,
        category: input.category,
        isActive: true,
      },
      orderBy: {
        effectiveAt: "desc",
      },
    });

    return latest
      ? mapSharedMemoryRecord(latest as Parameters<typeof mapSharedMemoryRecord>[0])
      : buildMockSharedMemoryRecord(input);
  } catch {
    return buildMockSharedMemoryRecord(input);
  }
}

export async function syncHomepageMemorySnapshot(input: {
  workspaceId: string;
  agentKey?: CenterAgentKeyValue | null;
  items: CenterMemorySnapshotPayload[];
}): Promise<SharedMemoryRecordPayload[]> {
  const syncTargets = input.items
    .map((item) => {
      const category = (SHARED_MEMORY_CATEGORY_BY_LABEL as Record<string, SharedMemoryCategoryValue | undefined>)[
        item.label
      ];

      if (!category) {
        return null;
      }

      return {
        category,
        title: item.label,
        summary: item.value,
        detail: item.detail,
      };
    })
    .filter(Boolean) as Array<{
    category: SharedMemoryCategoryValue;
    title: string;
    summary: string;
    detail: string;
  }>;

  const results: SharedMemoryRecordPayload[] = [];

  for (const target of syncTargets) {
    results.push(
      await upsertActiveSharedMemoryRecord({
        workspaceId: input.workspaceId,
        category: target.category,
        title: target.title,
        summary: target.summary,
        detail: target.detail,
        agentKey: input.agentKey ?? null,
        sourceRef: "center-home",
        payload: {
          label: target.title,
          value: target.summary,
          detail: target.detail,
        },
      }),
    );
  }

  return results;
}

export async function getSharedMemorySnapshotProjection(
  workspaceId: string,
  fallbackItems: CenterMemorySnapshotPayload[] = [],
): Promise<CenterMemorySnapshotPayload[]> {
  const records = await getActiveSharedMemoryRecords(workspaceId);

  if (!records.length) {
    return fallbackItems;
  }

  const ordered = [...records].sort((left, right) => {
    return SHARED_MEMORY_CATEGORY_ORDER.indexOf(left.category) - SHARED_MEMORY_CATEGORY_ORDER.indexOf(right.category);
  });

  return ordered.map(toSnapshotItem);
}
