import type {
  ContentAssetPayload,
  ContentProjectPayload,
  PublishRecordPayload,
  ReviewSnapshotPayload,
  StyleSkillPayload,
  TopicCandidateRow,
} from "../domain/contracts";

export type ContentProjectPackage = {
  project: ContentProjectPayload;
  sourceCandidate: {
    id: string;
    title: string;
    whyNow: string;
    fitReason: string;
    topicTitle: string;
    formatRecommendation: TopicCandidateRow["formatRecommendation"];
  } | null;
  styleSkill: {
    id: string;
    summary: string;
    version: number;
  };
  assets: Array<{
    assetType: ContentAssetPayload["assetType"];
    title: string | null;
    targetPlatform: string;
    status: ContentAssetPayload["status"];
    content: string;
  }>;
  publishRecords: Array<{
    channelKey: string;
    mode: PublishRecordPayload["mode"];
    status: PublishRecordPayload["status"];
    package: PublishRecordPayload["packageJson"];
    failureReason: string | null;
  }>;
  reviews: Array<{
    channelKey: string;
    views: number | null;
    likes: number | null;
    comments: number | null;
    shares: number | null;
    saves: number | null;
    inquiries: number | null;
    leads: number | null;
    conversions: number | null;
    reviewNote: string | null;
  }>;
};

export function buildContentProjectPackage(input: {
  project: ContentProjectPayload;
  candidate: TopicCandidateRow | null;
  styleSkill: StyleSkillPayload;
  assets: ContentAssetPayload[];
  publishRecords: PublishRecordPayload[];
  reviews: ReviewSnapshotPayload[];
}): ContentProjectPackage {
  return {
    project: input.project,
    sourceCandidate: input.candidate
      ? {
          id: input.candidate.id,
          title: input.candidate.title,
          whyNow: input.candidate.whyNow,
          fitReason: input.candidate.fitReason,
          topicTitle: input.candidate.topicTitle,
          formatRecommendation: input.candidate.formatRecommendation,
        }
      : null,
    styleSkill: {
      id: input.styleSkill.id,
      summary: input.styleSkill.summary,
      version: input.styleSkill.version,
    },
    assets: input.assets.map((asset) => ({
      assetType: asset.assetType,
      title: asset.title,
      targetPlatform: asset.targetPlatform,
      status: asset.status,
      content: asset.content,
    })),
    publishRecords: input.publishRecords.map((record) => ({
      channelKey: record.channelKey,
      mode: record.mode,
      status: record.status,
      package: record.packageJson,
      failureReason: record.failureReason,
    })),
    reviews: input.reviews.map((review) => ({
      channelKey: review.channelKey,
      views: review.views,
      likes: review.likes,
      comments: review.comments,
      shares: review.shares,
      saves: review.saves,
      inquiries: review.inquiries,
      leads: review.leads,
      conversions: review.conversions,
      reviewNote: review.reviewNote,
    })),
  };
}
