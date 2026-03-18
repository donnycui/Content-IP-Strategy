import { getActiveDirectionsService } from "@/lib/services/direction-service";
import { getActiveCreatorProfileService } from "@/lib/services/profile-service";
import {
  getProfileEvolutionSuggestionsService,
  updateProfileEvolutionSuggestionStatus,
} from "@/lib/services/profile-evolution-service";
import { getTopicCandidatesService } from "@/lib/services/topic-candidate-service";

export type MiniProgramAction =
  | "getTodaySummary"
  | "getDirections"
  | "getTopicRecommendations"
  | "respondToProfileUpdateSuggestion"
  | "captureQuickNote";

export const miniProgramActionCatalog = {
  getTodaySummary: {
    action: "getTodaySummary",
    description: "返回适合移动端查看的今日画像、方向、选题和待处理建议摘要。",
    backingServices: ["getActiveCreatorProfileService", "getActiveDirectionsService", "getTopicCandidatesService", "getProfileEvolutionSuggestionsService"],
  },
  getDirections: {
    action: "getDirections",
    description: "返回当前创作者画像下的活跃方向。",
    backingServices: ["getActiveDirectionsService"],
  },
  getTopicRecommendations: {
    action: "getTopicRecommendations",
    description: "返回当前值得在移动端快速查看和决策的选题建议。",
    backingServices: ["getTopicCandidatesService"],
  },
  respondToProfileUpdateSuggestion: {
    action: "respondToProfileUpdateSuggestion",
    description: "在移动端采纳或拒绝画像进化建议。",
    backingServices: ["updateProfileEvolutionSuggestionStatus"],
  },
  captureQuickNote: {
    action: "captureQuickNote",
    description: "记录临时灵感或待处理想法，当前仅保留接口占位。",
    backingServices: [],
  },
} satisfies Record<
  MiniProgramAction,
  {
    action: MiniProgramAction;
    description: string;
    backingServices: string[];
  }
>;

export async function getMiniProgramTodaySummary() {
  const [profile, directions, candidates, suggestions] = await Promise.all([
    getActiveCreatorProfileService(),
    getActiveDirectionsService(),
    getTopicCandidatesService(),
    getProfileEvolutionSuggestionsService(),
  ]);

  return {
    profile,
    directions: directions.slice(0, 3),
    topicRecommendations: candidates.slice(0, 4),
    pendingSuggestions: suggestions.filter((item) => item.status === "PENDING").slice(0, 3),
  };
}

export async function getMiniProgramDirections() {
  return getActiveDirectionsService();
}

export async function getMiniProgramTopicRecommendations() {
  return getTopicCandidatesService();
}

export async function respondToMiniProgramProfileSuggestion(id: string, status: "ACCEPTED" | "REJECTED") {
  return updateProfileEvolutionSuggestionStatus(id, status);
}

export async function captureMiniProgramQuickNote(_input: {
  text: string;
  creatorProfileId?: string;
}) {
  return {
    ok: false,
    reason: "Quick note capture is reserved for a later mobile iteration.",
  };
}
