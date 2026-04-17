import type { DirectionRow } from "@/lib/direction-data";
import type { CapabilityRouteRow, GatewayConnectionRow, ManagedModelRow, PlanModelAccessRow } from "@/lib/model-management-data";
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
  requestedTier?: ModelTierValue;
};

export type ProfileExtractResponse = ApiResponse<{
  profileId: string;
}>;

export type ProfileExtractionConversationMessage = {
  role: "assistant" | "user";
  content: string;
  createdAt: string;
  questionType?: string | null;
  skipped?: boolean;
};

export type ProfileExtractionConversationDraft = {
  name: string;
  positioning: string;
  persona: string;
  audience: string;
  coreThemes: string;
  voiceStyle: string;
  growthGoal: string;
  contentBoundaries: string;
  currentStage: "EXPLORING" | "EMERGING" | "SCALING" | "ESTABLISHED";
};

export type ProfileExtractionConversationSession = {
  id: string;
  status: "ACTIVE" | "COMPLETED" | "ABANDONED";
  sourceMode: "CONVERSATIONAL" | "QUICK";
  draftProfile: ProfileExtractionConversationDraft;
  transcript: ProfileExtractionConversationMessage[];
  currentQuestion: string | null;
  questionType: string | null;
  turnCount: number;
  readyToFinalize: boolean;
};

export type ProfileExtractConversationStartRequest = {
  requestedTier?: ModelTierValue;
};

export type ProfileExtractConversationReplyRequest = {
  message?: string;
  skip?: boolean;
  requestedTier?: ModelTierValue;
};

export type ProfileExtractConversationStartResponse = ApiResponse<{
  session: ProfileExtractionConversationSession;
}>;

export type ProfileExtractConversationReplyResponse = ApiResponse<{
  session: ProfileExtractionConversationSession;
}>;

export type ProfileExtractConversationFinalizeResponse = ApiResponse<{
  profileId: string;
  sessionId: string;
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

export type TieredGenerationRequest = {
  requestedTier?: ModelTierValue;
};

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

export type GatewayAuthTypeValue = "NONE" | "BEARER" | "API_KEY" | "PASSCODE";
export type ModelTierValue = "FAST" | "BALANCED" | "DEEP";
export type CapabilityKeyValue =
  | "signal_scoring"
  | "ip_extraction_interview"
  | "ip_strategy_report"
  | "direction_generation"
  | "topic_generation"
  | "topic_candidate_generation"
  | "profile_evolution"
  | "draft_generation";

export type GatewayConnectionsListResponse = ApiResponse<{
  gateways: GatewayConnectionRow[];
}>;

export type GatewayCreateRequest = {
  name?: string;
  baseUrl?: string;
  authType?: GatewayAuthTypeValue;
  authSecretRef?: string;
};

export type GatewayCreateResponse = ApiResponse<{
  gatewayId: string;
}>;

export type GatewayUpdateRequest = {
  isActive?: boolean;
};

export type GatewayUpdateResponse = ApiResponse<{
  updated: true;
}>;

export type GatewayDeleteResponse = ApiResponse<{
  deleted: true;
}>;

export type GatewayTestResponse = ApiResponse<{
  healthy: boolean;
  modelsStatus: number;
}>;

export type GatewaySyncResponse = ApiResponse<{
  modelsCount: number;
  upsertedCount: number;
}>;

export type ManagedModelsListResponse = ApiResponse<{
  models: ManagedModelRow[];
}>;

export type ManagedModelCreateRequest = {
  gatewayConnectionId?: string;
  providerKey?: string;
  modelKey?: string;
  displayName?: string;
  tier?: ModelTierValue;
  enabled?: boolean;
  visibleToUsers?: boolean;
};

export type ManagedModelCreateResponse = ApiResponse<{
  created: true;
}>;

export type ManagedModelUpdateRequest = {
  id?: string;
  tier?: ModelTierValue;
  enabled?: boolean;
  visibleToUsers?: boolean;
};

export type ManagedModelUpdateResponse = ApiResponse<{
  updated: true;
}>;

export type ManagedModelDeleteResponse = ApiResponse<{
  deleted: true;
}>;

export type CapabilityRoutesListResponse = ApiResponse<{
  routes: CapabilityRouteRow[];
}>;

export type CapabilityRouteUpsertRequest = {
  capabilityKey?: CapabilityKeyValue;
  defaultModelId?: string;
  fallbackModelId?: string | null;
  allowFallback?: boolean;
  allowUserOverride?: boolean;
  notes?: string;
};

export type CapabilityRouteUpsertResponse = ApiResponse<{
  updated: true;
}>;

export type PlanKeyValue = "STANDARD" | "PROFESSIONAL" | "FLAGSHIP";

export type PlanModelAccessListResponse = ApiResponse<{
  scopes: PlanModelAccessRow[];
}>;

export type PlanModelAccessUpsertRequest = {
  planKey?: PlanKeyValue;
  capabilityKey?: CapabilityKeyValue | null;
  allowedTiers?: ModelTierValue[];
  canSelectModel?: boolean;
  canUsePremiumReasoning?: boolean;
};

export type PlanModelAccessUpsertResponse = ApiResponse<{
  updated: true;
}>;
