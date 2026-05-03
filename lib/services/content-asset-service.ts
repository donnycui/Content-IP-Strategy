import type {
  ContentAssetPayload,
  ContentAssetTypeValue,
  ContentAssetUpdateRequest,
  ContentProjectPayload,
  StyleSkillPayload,
  TopicCandidateRow,
} from "@/lib/domain/contracts";
import { buildFallbackAssetDrafts } from "@/lib/content/content-asset-draft-logic";
import { prisma } from "@/lib/prisma";
import { executeStructuredGeneration } from "@/lib/services/structured-generation-service";

type ContentDraftPayload = {
  xhsPost?: string;
  shortVideoScript?: string;
  wechatArticle?: string;
  livestreamScript?: string;
};

function mapContentAsset(record: {
  id: string;
  projectId: string;
  assetType: ContentAssetTypeValue;
  title: string | null;
  content: string;
  targetPlatform: string;
  status: "DRAFT" | "READY" | "APPROVED" | "ARCHIVED";
  updatedAt: Date;
}): ContentAssetPayload {
  return {
    id: record.id,
    projectId: record.projectId,
    assetType: record.assetType,
    title: record.title,
    content: record.content,
    targetPlatform: record.targetPlatform,
    status: record.status,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function fallbackAssetTitle(assetType: ContentAssetTypeValue, candidate: TopicCandidateRow) {
  if (assetType === "XHS_POST") {
    return `${candidate.title} · 小红书图文包`;
  }

  if (assetType === "SHORT_VIDEO_SCRIPT") {
    return `${candidate.title} · 短视频脚本`;
  }

  if (assetType === "WECHAT_ARTICLE") {
    return `${candidate.title} · 公众号文章`;
  }

  return `${candidate.title} · 直播脚本`;
}

async function generateDraftsWithModel(candidate: TopicCandidateRow, styleSkill: StyleSkillPayload) {
  const fallback = buildFallbackAssetDrafts(candidate, styleSkill);
  const payload = await executeStructuredGeneration<ContentDraftPayload>({
    capabilityKey: "draft_generation",
    systemInstruction: [
      "你是 zhaocai-IP-center 的内容资产生成助手。",
      "目标不是给方向建议，而是一次性生成可直接复制、编辑、发布前修改的中文初稿。",
      "请围绕给定选题和 style skill 输出四类内容资产：xhsPost、shortVideoScript、wechatArticle、livestreamScript。",
      "每个字段都必须是完整正文草稿，不要只写大纲、建议、方向、结构说明。",
      "小红书图文必须包含标题备选、封面文案、正文、结尾互动和标签。",
      "短视频脚本必须包含开场钩子、分段口播、画面提示和结尾互动。",
      "公众号文章必须包含标题、导语、正文小节和结尾行动建议。",
      "直播脚本必须包含开场、分段流程、互动问题和收尾话术。",
      "内容要贴合 style skill，避免空泛鸡血、模板套话和只有平台运营建议。",
      "返回严格 JSON，不要附加解释。",
    ].join("\n"),
    userPrompt: JSON.stringify(
      {
        candidate,
        styleSkill,
        fallback,
      },
      null,
      2,
    ),
    metadata: {
      channel: "web",
      flow: "zhaocai-ip-center-content-project",
    },
    requestedTier: "BALANCED",
  });

  return {
    XHS_POST: payload?.xhsPost?.trim() || fallback.XHS_POST,
    SHORT_VIDEO_SCRIPT: payload?.shortVideoScript?.trim() || fallback.SHORT_VIDEO_SCRIPT,
    WECHAT_ARTICLE: payload?.wechatArticle?.trim() || fallback.WECHAT_ARTICLE,
    LIVESTREAM_SCRIPT: payload?.livestreamScript?.trim() || fallback.LIVESTREAM_SCRIPT,
  } as const;
}

export async function generateProjectAssets(input: {
  project: ContentProjectPayload;
  candidate: TopicCandidateRow;
  styleSkill: StyleSkillPayload;
}): Promise<ContentAssetPayload[]> {
  const drafts = await generateDraftsWithModel(input.candidate, input.styleSkill);

  const assetInputs = [
    {
      assetType: "XHS_POST" as const,
      title: fallbackAssetTitle("XHS_POST", input.candidate),
      content: drafts.XHS_POST,
      targetPlatform: "xiaohongshu",
    },
    {
      assetType: "SHORT_VIDEO_SCRIPT" as const,
      title: fallbackAssetTitle("SHORT_VIDEO_SCRIPT", input.candidate),
      content: drafts.SHORT_VIDEO_SCRIPT,
      targetPlatform: "short-video",
    },
    {
      assetType: "WECHAT_ARTICLE" as const,
      title: fallbackAssetTitle("WECHAT_ARTICLE", input.candidate),
      content: drafts.WECHAT_ARTICLE,
      targetPlatform: "wechat-official-account",
    },
    {
      assetType: "LIVESTREAM_SCRIPT" as const,
      title: fallbackAssetTitle("LIVESTREAM_SCRIPT", input.candidate),
      content: drafts.LIVESTREAM_SCRIPT,
      targetPlatform: "livestream",
    },
  ];

  if (!process.env.DATABASE_URL) {
    return assetInputs.map((asset) => ({
      id: `content-asset-${asset.assetType.toLowerCase()}`,
      projectId: input.project.id,
      assetType: asset.assetType,
      title: asset.title,
      content: asset.content,
      targetPlatform: asset.targetPlatform,
      status: "DRAFT",
      updatedAt: new Date().toISOString(),
    }));
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      contentAsset?: {
        upsert: (args: unknown) => Promise<unknown>;
      };
    };

    const results: ContentAssetPayload[] = [];

    for (const asset of assetInputs) {
      const saved = await prismaClient.contentAsset?.upsert({
        where: {
          projectId_assetType: {
            projectId: input.project.id,
            assetType: asset.assetType,
          },
        },
        update: {
          title: asset.title,
          content: asset.content,
          targetPlatform: asset.targetPlatform,
        },
        create: {
          projectId: input.project.id,
          assetType: asset.assetType,
          title: asset.title,
          content: asset.content,
          targetPlatform: asset.targetPlatform,
        },
      });

      if (saved) {
        results.push(mapContentAsset(saved as Parameters<typeof mapContentAsset>[0]));
      }
    }

    return results.length
      ? results
      : assetInputs.map((asset) => ({
          id: `content-asset-${asset.assetType.toLowerCase()}`,
          projectId: input.project.id,
          assetType: asset.assetType,
          title: asset.title,
          content: asset.content,
          targetPlatform: asset.targetPlatform,
          status: "DRAFT",
          updatedAt: new Date().toISOString(),
        }));
  } catch {
    return assetInputs.map((asset) => ({
      id: `content-asset-${asset.assetType.toLowerCase()}`,
      projectId: input.project.id,
      assetType: asset.assetType,
      title: asset.title,
      content: asset.content,
      targetPlatform: asset.targetPlatform,
      status: "DRAFT",
      updatedAt: new Date().toISOString(),
    }));
  }
}

export async function updateContentAsset(input: {
  id: string;
  payload: ContentAssetUpdateRequest;
}): Promise<ContentAssetPayload> {
  const title = input.payload.title !== undefined ? input.payload.title?.trim() || null : undefined;
  const content = input.payload.content !== undefined ? input.payload.content : undefined;
  const status = input.payload.status;

  if (title === undefined && content === undefined && !status) {
    throw new Error("At least one content-asset field is required.");
  }

  if (!process.env.DATABASE_URL) {
    return {
      id: input.id,
      projectId: "content-project-mock",
      assetType: "XHS_POST",
      title: title ?? "未命名内容资产",
      content: content ?? "",
      targetPlatform: "xiaohongshu",
      status: status ?? "DRAFT",
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      contentAsset?: {
        update: (args: unknown) => Promise<unknown>;
      };
    };

    const asset = await prismaClient.contentAsset?.update({
      where: {
        id: input.id,
      },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(status ? { status } : {}),
      },
    });

    if (!asset) {
      throw new Error("Content asset not found.");
    }

    return mapContentAsset(asset as Parameters<typeof mapContentAsset>[0]);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "更新内容资产失败。");
  }
}
