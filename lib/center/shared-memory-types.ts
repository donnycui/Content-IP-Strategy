import type { SharedMemoryCategoryValue } from "@/lib/domain/contracts";

export const SHARED_MEMORY_CATEGORY_BY_LABEL = {
  当前画像: "PROFILE_SNAPSHOT",
  风格底味: "STYLE_SNAPSHOT",
  最近结论: "KEY_CONCLUSION",
  主动学习: "LEARNING_INSIGHT",
  长期曲线: "REVIEW_TREND",
} as const satisfies Record<string, SharedMemoryCategoryValue>;

export const SHARED_MEMORY_LABEL_BY_CATEGORY = {
  PROFILE_SNAPSHOT: "当前画像",
  PROFILE_EVOLUTION_NOTE: "画像演变",
  STYLE_SNAPSHOT: "风格底味",
  STYLE_EVOLUTION_NOTE: "风格演变",
  KEY_CONCLUSION: "最近结论",
  REVIEW_TREND: "长期曲线",
  LEARNING_INSIGHT: "主动学习",
} as const satisfies Record<SharedMemoryCategoryValue, string>;

export const SHARED_MEMORY_CATEGORY_ORDER: SharedMemoryCategoryValue[] = [
  "PROFILE_SNAPSHOT",
  "STYLE_SNAPSHOT",
  "KEY_CONCLUSION",
  "LEARNING_INSIGHT",
  "REVIEW_TREND",
  "PROFILE_EVOLUTION_NOTE",
  "STYLE_EVOLUTION_NOTE",
];
