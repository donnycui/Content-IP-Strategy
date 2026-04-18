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

export type CenterAgentKeyValue =
  | "IP_EXTRACTION"
  | "CREATOR_PROFILE"
  | "TOPIC_DIRECTION"
  | "STYLE_CONTENT"
  | "DAILY_REVIEW"
  | "EVOLUTION";

export type CenterAgentStatusValue = "CURRENT" | "LOCKED" | "REVISIT";
export type AgentThreadStatusValue = "IDLE" | "ACTIVE" | "PAUSED" | "ARCHIVED";

export type CenterJudgmentPayload = {
  stageLabel: string;
  title: string;
  description: string;
  reason: string;
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryAction: {
    label: string;
    href: string;
  };
};

export type CenterMetricPayload = {
  label: string;
  value: string;
  detail: string;
};

export type CenterAgentSummaryPayload = {
  key: CenterAgentKeyValue;
  label: string;
  status: CenterAgentStatusValue;
  summary: string;
  detail: string;
  href: string;
  actionLabel: string;
  note?: string;
};

export type CenterCoordinatorPayload = {
  title: string;
  summary: string;
  bullets: string[];
};

export type CenterMemorySnapshotPayload = {
  label: string;
  value: string;
  detail: string;
};

export type SharedMemoryCategoryValue =
  | "PROFILE_SNAPSHOT"
  | "PROFILE_EVOLUTION_NOTE"
  | "STYLE_SNAPSHOT"
  | "STYLE_EVOLUTION_NOTE"
  | "KEY_CONCLUSION"
  | "REVIEW_TREND"
  | "LEARNING_INSIGHT";

export type SharedMemoryRecordPayload = {
  id: string;
  workspaceId: string;
  agentKey: CenterAgentKeyValue | null;
  category: SharedMemoryCategoryValue;
  title: string;
  summary: string;
  detail: string | null;
  sourceRef: string | null;
  isActive: boolean;
  effectiveAt: string;
  supersededAt: string | null;
};

export type CenterQuickActionPayload = {
  label: string;
  description: string;
  href: string;
};

export type CenterHomePayload = {
  judgment: CenterJudgmentPayload;
  metrics: CenterMetricPayload[];
  agents: CenterAgentSummaryPayload[];
  coordinator: CenterCoordinatorPayload;
  memory: CenterMemorySnapshotPayload[];
  quickActions: CenterQuickActionPayload[];
};

export type CenterHomeResponse = ApiResponse<{
  center: CenterHomePayload;
}>;

export type CenterWorkspaceRecord = {
  id: string;
  workspaceKey: string;
  creatorProfileId: string | null;
  currentAgentKey: CenterAgentKeyValue;
  recommendedActionLabel: string | null;
  recommendedActionHref: string | null;
  lastStageReason: string | null;
  lastJudgedAt: string | null;
};

export type CenterAgentThreadMessage = {
  role: "assistant" | "user" | "system";
  content: string;
  createdAt: string;
  meta?: Record<string, string | number | boolean | null>;
};

export type AgentThreadSummaryRecord = {
  headline?: string;
  blockers?: string[];
  assets?: string[];
};

export type AgentThreadRecord = {
  id: string;
  workspaceId: string;
  agentKey: CenterAgentKeyValue;
  status: AgentThreadStatusValue;
  transcript: CenterAgentThreadMessage[];
  summary: AgentThreadSummaryRecord | null;
  latestSummary: string | null;
  nextRecommendedAction: string | null;
  lastUserMessage: string | null;
  updatedAt: string;
};

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
