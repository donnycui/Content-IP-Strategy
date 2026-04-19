import type { ContentAssetPayload, ContentProjectPayload, PublishRecordPayload } from "@/lib/domain/contracts";
import { prisma } from "@/lib/prisma";

function mapPublishRecord(record: {
  id: string;
  projectId: string;
  assetId: string | null;
  channelKey: string;
  mode: "EXPORT" | "DIRECT";
  status: "DRAFT" | "READY" | "EXPORTED" | "QUEUED" | "PUBLISHED" | "FAILED";
  failureReason: string | null;
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
      updatedAt: new Date().toISOString(),
    }));
  }
}
