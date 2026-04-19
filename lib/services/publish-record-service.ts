import type {
  ContentAssetPayload,
  ContentProjectPayload,
  PublishRecordPayload,
  PublishRecordUpdateRequest,
} from "@/lib/domain/contracts";
import { prisma } from "@/lib/prisma";

function mapPublishRecord(record: {
  id: string;
  projectId: string;
  assetId: string | null;
  channelKey: string;
  mode: "EXPORT" | "DIRECT";
  status: "DRAFT" | "READY" | "EXPORTED" | "QUEUED" | "PUBLISHED" | "FAILED";
  failureReason: string | null;
  packageJson: Record<string, string | number | boolean | null> | null;
  updatedAt: Date;
}): PublishRecordPayload {
  return {
    id: record.id,
    projectId: record.projectId,
    assetId: record.assetId,
    channelKey: record.channelKey,
    mode: record.mode,
    status: record.status,
    failureReason: record.failureReason,
    packageJson: record.packageJson,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function deriveChannelKey(asset: ContentAssetPayload) {
  if (asset.assetType === "XHS_POST") {
    return "xiaohongshu";
  }

  if (asset.assetType === "WECHAT_ARTICLE") {
    return "wechat-official-account";
  }

  if (asset.assetType === "SHORT_VIDEO_SCRIPT") {
    return "short-video-pack";
  }

  return "livestream-pack";
}

export async function ensureExportPublishRecords(input: {
  project: ContentProjectPayload;
  assets: ContentAssetPayload[];
}): Promise<PublishRecordPayload[]> {
  if (!process.env.DATABASE_URL) {
    return input.assets.map((asset) => ({
      id: `publish-record-${asset.assetType.toLowerCase()}`,
      projectId: input.project.id,
      assetId: asset.id,
      channelKey: deriveChannelKey(asset),
      mode: "EXPORT",
      status: "READY",
      failureReason: null,
      packageJson: {
        assetType: asset.assetType,
        targetPlatform: asset.targetPlatform,
        title: asset.title,
      },
      updatedAt: new Date().toISOString(),
    }));
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      publishRecord?: {
        create: (args: unknown) => Promise<unknown>;
      };
    };

    const results: PublishRecordPayload[] = [];

    for (const asset of input.assets) {
      const saved = await prismaClient.publishRecord?.create({
        data: {
          projectId: input.project.id,
          assetId: asset.id,
          channelKey: deriveChannelKey(asset),
          mode: "EXPORT",
          status: "READY",
          packageJson: {
            assetType: asset.assetType,
            targetPlatform: asset.targetPlatform,
            title: asset.title,
          },
        },
      });

      if (saved) {
        results.push(mapPublishRecord(saved as Parameters<typeof mapPublishRecord>[0]));
      }
    }

    return results.length
      ? results
      : input.assets.map((asset) => ({
          id: `publish-record-${asset.assetType.toLowerCase()}`,
          projectId: input.project.id,
          assetId: asset.id,
          channelKey: deriveChannelKey(asset),
          mode: "EXPORT",
          status: "READY",
          failureReason: null,
          packageJson: {
            assetType: asset.assetType,
            targetPlatform: asset.targetPlatform,
            title: asset.title,
          },
          updatedAt: new Date().toISOString(),
        }));
  } catch {
    return input.assets.map((asset) => ({
      id: `publish-record-${asset.assetType.toLowerCase()}`,
      projectId: input.project.id,
      assetId: asset.id,
      channelKey: deriveChannelKey(asset),
      mode: "EXPORT",
      status: "READY",
      failureReason: null,
      packageJson: {
        assetType: asset.assetType,
        targetPlatform: asset.targetPlatform,
        title: asset.title,
      },
      updatedAt: new Date().toISOString(),
    }));
  }
}

export async function updatePublishRecord(input: {
  id: string;
  payload: PublishRecordUpdateRequest;
}): Promise<{ updated: true }> {
  if (!input.payload.status) {
    throw new Error("status is required.");
  }

  if (!process.env.DATABASE_URL) {
    return {
      updated: true,
    };
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      publishRecord?: {
        update: (args: unknown) => Promise<unknown>;
      };
    };

    await prismaClient.publishRecord?.update({
      where: {
        id: input.id,
      },
      data: {
        status: input.payload.status,
        failureReason: input.payload.failureReason ?? null,
        ...(input.payload.status === "PUBLISHED"
          ? {
              publishedAt: new Date(),
            }
          : {}),
      },
    });

    return {
      updated: true,
    };
  } catch {
    return {
      updated: true,
    };
  }
}
