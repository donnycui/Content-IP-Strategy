import type { DirectionRow } from "@/lib/direction-data";
import type { CreatorProfileRow } from "@/lib/profile-data";
import type { ProfileUpdateSuggestionRow } from "@/lib/profile-update-suggestion-data";
import type { TopicCandidateRow } from "@/lib/topic-candidate-data";
import type { TopicRow } from "@/lib/topic-data";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type ProfileExtractRequest = {
  sourceText?: string;
};

export type ProfileExtractResponse = ApiResponse<{
  profileId: string;
}>;

export type ProfileGetResponse = ApiResponse<{
  profile: CreatorProfileRow | null;
}>;

export type ProfileUpdateRequest = {
  id?: string;
  name?: string;
  positioning?: string;
  persona?: string;
  audience?: string;
  coreThemes?: string;
  voiceStyle?: string;
  growthGoal?: string;
  contentBoundaries?: string;
  currentStage?: "EXPLORING" | "EMERGING" | "SCALING" | "ESTABLISHED";
};

export type ProfileUpdateResponse = ApiResponse<{
  updated: true;
}>;

export type DirectionsListResponse = ApiResponse<{
  directions: DirectionRow[];
}>;

export type DirectionsGenerateResponse = ApiResponse<{
  createdCount: number;
}>;

export type TopicsListResponse = ApiResponse<{
  topics: TopicRow[];
}>;

export type TopicsGenerateResponse = ApiResponse<{
  createdCount: number;
}>;

export type TopicCandidatesListResponse = ApiResponse<{
  candidates: TopicCandidateRow[];
}>;

export type TopicCandidatesGenerateResponse = ApiResponse<{
  createdCount: number;
}>;

export type TopicCandidateStatusUpdateRequest = {
  status?: "KEPT" | "DEFERRED" | "REJECTED";
};

export type TopicCandidateStatusUpdateResponse = ApiResponse<{
  updated: true;
}>;

export type ProfileUpdatesListResponse = ApiResponse<{
  suggestions: ProfileUpdateSuggestionRow[];
}>;

export type ProfileUpdatesGenerateResponse = ApiResponse<{
  createdCount: number;
}>;

export type ProfileUpdateStatusRequest = {
  status?: "ACCEPTED" | "REJECTED";
};

export type ProfileUpdateStatusResponse = ApiResponse<{
  updated: true;
}>;
