import { regenerateDirections } from "@/lib/services/direction-service";
import { regenerateProfileEvolutionSuggestions } from "@/lib/services/profile-evolution-service";
import { regenerateTopicCandidates } from "@/lib/services/topic-candidate-service";
import { regenerateTopics } from "@/lib/services/topic-service";

export type OpenClawTool =
  | "generate_directions"
  | "generate_topics"
  | "generate_topic_candidates"
  | "generate_profile_updates"
  | "draft_content"
  | "run_review";

export const openClawToolCatalog = {
  generate_directions: {
    tool: "generate_directions",
    description: "基于当前 Creator Profile 和信号上下文生成方向建议。",
    backingCapabilities: ["regenerateDirections"],
  },
  generate_topics: {
    tool: "generate_topics",
    description: "基于方向和信号生成新的主题线。",
    backingCapabilities: ["regenerateTopics"],
  },
  generate_topic_candidates: {
    tool: "generate_topic_candidates",
    description: "基于主题线生成当前的选题建议。",
    backingCapabilities: ["regenerateTopicCandidates"],
  },
  generate_profile_updates: {
    tool: "generate_profile_updates",
    description: "基于创作者行为和系统状态生成画像进化建议。",
    backingCapabilities: ["regenerateProfileEvolutionSuggestions"],
  },
  draft_content: {
    tool: "draft_content",
    description: "后续将用于从研究卡或选题生成创作草稿。",
    backingCapabilities: [],
  },
  run_review: {
    tool: "run_review",
    description: "后续将用于对信号、草稿或策略进行 agent 化复盘。",
    backingCapabilities: [],
  },
} satisfies Record<
  OpenClawTool,
  {
    tool: OpenClawTool;
    description: string;
    backingCapabilities: string[];
  }
>;

export async function runOpenClawTool(
  tool: OpenClawTool,
  input?: {
    sourceText?: string;
  },
) {
  switch (tool) {
    case "generate_directions":
      return regenerateDirections();
    case "generate_topics":
      return regenerateTopics();
    case "generate_topic_candidates":
      return regenerateTopicCandidates();
    case "generate_profile_updates":
      return regenerateProfileEvolutionSuggestions();
    case "draft_content":
      return {
        ok: false,
        reason: "Draft generation is reserved for a later OpenClaw integration phase.",
      };
    case "run_review":
      return {
        ok: false,
        reason: "Review workflows are reserved for a later OpenClaw integration phase.",
      };
  }
}
