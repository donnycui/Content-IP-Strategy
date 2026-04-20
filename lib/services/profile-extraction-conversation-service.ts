import {
  ProfileExtractionSourceMode,
  ProfileExtractionSessionStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BrainstormingModeValue } from "@/lib/domain/contracts";
import type { CreatorProfileDraft } from "@/lib/profile-data";
import { activateCreatorProfileDraft, assertDatabaseConfigured } from "@/lib/services/profile-service";
import { executeStructuredGeneration } from "@/lib/services/structured-generation-service";
import { ServiceError } from "@/lib/services/service-error";

export type ConversationQuestionType =
  | "OPENING"
  | "EXPLORATION"
  | "AUDIENCE"
  | "CAPABILITY"
  | "POSITIONING"
  | "THEMES"
  | "BOUNDARY"
  | "GOAL"
  | "STYLE"
  | "CONFIRMATION";

export type ConversationTranscriptMessage = {
  role: "assistant" | "user" | "system";
  content: string;
  createdAt: string;
  questionType?: ConversationQuestionType | null;
  skipped?: boolean;
  meta?: {
    brainstormingMode?: BrainstormingModeValue;
    responseMode?: "BRAINSTORMING" | "EXTRACTION";
    usedModel?: boolean;
  };
};

export type ConversationSessionState = {
  id: string;
  status: "ACTIVE" | "COMPLETED" | "ABANDONED";
  sourceMode: "CONVERSATIONAL";
  brainstormingMode: BrainstormingModeValue;
  responseMode: "BRAINSTORMING" | "EXTRACTION";
  draftProfile: CreatorProfileDraft;
  transcript: ConversationTranscriptMessage[];
  currentQuestion: string | null;
  questionType: ConversationQuestionType | null;
  turnCount: number;
  readyToFinalize: boolean;
};

type ConversationTurnModelOutput = {
  draftProfile?: Partial<CreatorProfileDraft>;
  nextQuestion?: string;
  questionType?: ConversationQuestionType;
  readyToFinalize?: boolean;
  reasoningSummary?: string;
  responseMode?: "BRAINSTORMING" | "EXTRACTION";
};

const EMPTY_DRAFT: CreatorProfileDraft = {
  name: "",
  positioning: "",
  persona: "",
  audience: "",
  coreThemes: "",
  voiceStyle: "",
  growthGoal: "",
  contentBoundaries: "",
  currentStage: "EXPLORING",
};

function nowIso() {
  return new Date().toISOString();
}

function normalizeDraftPatch(patch?: Partial<CreatorProfileDraft> | null) {
  if (!patch) {
    return {};
  }

  return {
    name: patch.name?.trim() ?? "",
    positioning: patch.positioning?.trim() ?? "",
    persona: patch.persona?.trim() ?? "",
    audience: patch.audience?.trim() ?? "",
    coreThemes: patch.coreThemes?.trim() ?? "",
    voiceStyle: patch.voiceStyle?.trim() ?? "",
    growthGoal: patch.growthGoal?.trim() ?? "",
    contentBoundaries: patch.contentBoundaries?.trim() ?? "",
    currentStage: patch.currentStage ?? "EXPLORING",
  };
}

function mergeDraft(current: CreatorProfileDraft, patch?: Partial<CreatorProfileDraft> | null): CreatorProfileDraft {
  const normalizedPatch = normalizeDraftPatch(patch);

  return {
    name: normalizedPatch.name || current.name,
    positioning: normalizedPatch.positioning || current.positioning,
    persona: normalizedPatch.persona || current.persona,
    audience: normalizedPatch.audience || current.audience,
    coreThemes: normalizedPatch.coreThemes || current.coreThemes,
    voiceStyle: normalizedPatch.voiceStyle || current.voiceStyle,
    growthGoal: normalizedPatch.growthGoal || current.growthGoal,
    contentBoundaries: normalizedPatch.contentBoundaries || current.contentBoundaries,
    currentStage: normalizedPatch.currentStage || current.currentStage,
  };
}

function getLatestBrainstormingMode(transcript: ConversationTranscriptMessage[]) {
  const systemEntries = [...transcript].reverse().find((item) => item.role === "system" && item.meta?.brainstormingMode);
  return systemEntries?.meta?.brainstormingMode ?? "AUTO";
}

function hasEnoughDraftSignal(draft: CreatorProfileDraft) {
  const fields = [draft.positioning, draft.audience, draft.coreThemes, draft.growthGoal, draft.contentBoundaries].filter(
    (item) => item.trim().length > 0,
  );

  return fields.length >= 3;
}

function ensureVisibleDraft(draft: CreatorProfileDraft) {
  return {
    name: draft.name || "未命名创作者",
    positioning: draft.positioning || "待继续明确。",
    persona: draft.persona || "待继续明确。",
    audience: draft.audience || "待继续明确。",
    coreThemes: draft.coreThemes || "待继续明确。",
    voiceStyle: draft.voiceStyle || "待继续明确。",
    growthGoal: draft.growthGoal || "待继续明确。",
    contentBoundaries: draft.contentBoundaries || "待继续明确。",
    currentStage: draft.currentStage || "EXPLORING",
  };
}

function mapSessionState(session: {
  id: string;
  status: ProfileExtractionSessionStatus;
  sourceMode: ProfileExtractionSourceMode;
  transcriptJson: unknown;
  draftProfileJson: unknown;
  currentQuestion: string | null;
  questionType: string | null;
  turnCount: number;
}): ConversationSessionState {
  const draftProfile = mergeDraft(EMPTY_DRAFT, session.draftProfileJson as Partial<CreatorProfileDraft> | null);
  const transcript = Array.isArray(session.transcriptJson)
    ? (session.transcriptJson as ConversationTranscriptMessage[])
    : [];
  const brainstormingMode = getLatestBrainstormingMode(transcript);
  const lastAssistant = [...transcript].reverse().find((item) => item.role === "assistant");
  const responseMode = lastAssistant?.meta?.responseMode ?? "EXTRACTION";

  return {
    id: session.id,
    status: session.status,
    sourceMode: "CONVERSATIONAL",
    brainstormingMode,
    responseMode,
    draftProfile,
    transcript,
    currentQuestion: session.currentQuestion,
    questionType: (session.questionType as ConversationQuestionType | null) ?? null,
    turnCount: session.turnCount,
    readyToFinalize: session.questionType === "CONFIRMATION" || hasEnoughDraftSignal(draftProfile),
  };
}

async function generateConversationTurn(args: {
  transcript: ConversationTranscriptMessage[];
  draftProfile: CreatorProfileDraft;
  requestedTier?: "FAST" | "BALANCED" | "DEEP";
  brainstormingMode: BrainstormingModeValue;
  phase: "OPENING" | "CONTINUE";
}) {
  const result = await executeStructuredGeneration<ConversationTurnModelOutput>({
    capabilityKey: "ip_extraction_interview",
    systemInstruction: [
      "你是一个真正参与共创的创作者 IP 提炼智能体，不是问卷机器人。",
      `当前 Brainstorming 模式是 ${args.brainstormingMode}。`,
      "如果是 OFF，就直接澄清和收敛。",
      "如果是 ON，就允许先发散、比较、挑战和收敛。",
      "如果是 AUTO，就由你根据上下文决定当前更适合发散共创还是提炼收敛。",
      "每一轮你都必须先理解用户刚才真正表达了什么，再决定下一步最值得问什么。",
      "不要按固定字段顺序提问，不要像表单，不要像问卷。",
      "不要用空泛的知识型创作者模板去定义用户。",
      "只有在你认为当前信息已经足够形成第一版画像时，才把 readyToFinalize 设为 true。",
      '返回严格 JSON：{"draftProfile":{...},"nextQuestion":"...","questionType":"OPENING|EXPLORATION|AUDIENCE|CAPABILITY|POSITIONING|THEMES|BOUNDARY|GOAL|STYLE|CONFIRMATION","readyToFinalize":true|false,"reasoningSummary":"...","responseMode":"BRAINSTORMING|EXTRACTION"}',
    ].join("\n"),
    userPrompt: JSON.stringify(
      {
        phase: args.phase,
        brainstormingMode: args.brainstormingMode,
        currentDraft: args.draftProfile,
        transcript: args.transcript,
      },
      null,
      2,
    ),
    requestedTier: args.requestedTier,
  });

  if (!result?.nextQuestion?.trim() || !result.responseMode) {
    throw new ServiceError("IP 提炼智能体本轮没有返回有效问题，请重试。", 503, "PROFILE_EXTRACTION_MODEL_INVALID");
  }

  return result;
}

async function generateFinalDraft(args: {
  transcript: ConversationTranscriptMessage[];
  draftProfile: CreatorProfileDraft;
  requestedTier?: "FAST" | "BALANCED" | "DEEP";
}) {
  const result = await executeStructuredGeneration<Partial<CreatorProfileDraft>>({
    capabilityKey: "ip_extraction_interview",
    systemInstruction: [
      "你是创作者 IP 提炼智能体。",
      "请根据完整访谈 transcript 和当前 draft，输出一版更准确的结构化创作者画像。",
      "不要编造，不要自动补成统一模板。",
      '返回严格 JSON：{"name":"","positioning":"","persona":"","audience":"","coreThemes":"","voiceStyle":"","growthGoal":"","contentBoundaries":"","currentStage":"EXPLORING|EMERGING|SCALING|ESTABLISHED"}',
    ].join("\n"),
    userPrompt: JSON.stringify(
      {
        transcript: args.transcript,
        currentDraft: args.draftProfile,
      },
      null,
      2,
    ),
    requestedTier: args.requestedTier,
  });

  return mergeDraft(args.draftProfile, result ?? null);
}

export async function createProfileExtractionConversationSession(
  requestedTier?: "FAST" | "BALANCED" | "DEEP",
  brainstormingMode: BrainstormingModeValue = "AUTO",
) {
  assertDatabaseConfigured();

  const transcript: ConversationTranscriptMessage[] = [
    {
      role: "system",
      content: "Session config",
      createdAt: nowIso(),
      meta: {
        brainstormingMode,
      },
    },
  ];

  const opening = await generateConversationTurn({
    transcript,
    draftProfile: EMPTY_DRAFT,
    requestedTier,
    brainstormingMode,
    phase: "OPENING",
  });

  transcript.push({
    role: "assistant",
    content: opening.nextQuestion!.trim(),
    createdAt: nowIso(),
    questionType: opening.questionType ?? "OPENING",
    meta: {
      brainstormingMode,
      responseMode: opening.responseMode,
      usedModel: true,
    },
  });

  const session = await prisma.profileExtractionSession.create({
    data: {
      sourceMode: ProfileExtractionSourceMode.CONVERSATIONAL,
      transcriptJson: transcript,
      draftProfileJson: mergeDraft(EMPTY_DRAFT, opening.draftProfile ?? null),
      currentQuestion: opening.nextQuestion!.trim(),
      questionType: opening.questionType ?? "OPENING",
      turnCount: 0,
      lastUserMessage: null,
    },
  });

  return {
    session: {
      ...mapSessionState(session),
      readyToFinalize: Boolean(opening.readyToFinalize),
    },
    requestedTier: requestedTier ?? "DEEP",
  };
}

export async function replyToProfileExtractionConversationSession(input: {
  id: string;
  message?: string;
  skip?: boolean;
  requestedTier?: "FAST" | "BALANCED" | "DEEP";
  brainstormingMode?: BrainstormingModeValue;
}) {
  assertDatabaseConfigured();

  const session = await prisma.profileExtractionSession.findUnique({
    where: {
      id: input.id,
    },
  });

  if (!session || session.status !== ProfileExtractionSessionStatus.ACTIVE) {
    throw new ServiceError("对话式提炼会话不存在或已结束。", 404, "PROFILE_EXTRACTION_SESSION_NOT_FOUND");
  }

  const draftProfile = mergeDraft(EMPTY_DRAFT, session.draftProfileJson as Partial<CreatorProfileDraft> | null);
  const transcript = Array.isArray(session.transcriptJson)
    ? ([...(session.transcriptJson as ConversationTranscriptMessage[])] as ConversationTranscriptMessage[])
    : [];
  const activeBrainstormingMode = input.brainstormingMode ?? getLatestBrainstormingMode(transcript);
  const userMessage = input.message?.trim() ?? "";

  if (!input.skip && !userMessage) {
    throw new ServiceError("请输入回答内容，或选择跳过当前问题。", 400, "EMPTY_CONVERSATION_REPLY");
  }

  transcript.push({
    role: "system",
    content: "Session config update",
    createdAt: nowIso(),
    meta: {
      brainstormingMode: activeBrainstormingMode,
    },
  });

  transcript.push({
    role: "user",
    content: userMessage || "我先跳过这一轮，请换一个角度继续引导我。",
    createdAt: nowIso(),
    skipped: Boolean(input.skip),
    meta: {
      brainstormingMode: activeBrainstormingMode,
    },
  });

  const modelTurn = await generateConversationTurn({
    transcript,
    draftProfile,
    requestedTier: input.requestedTier,
    brainstormingMode: activeBrainstormingMode,
    phase: "CONTINUE",
  });

  const nextDraft = mergeDraft(draftProfile, modelTurn.draftProfile ?? null);

  transcript.push({
    role: "assistant",
    content: modelTurn.nextQuestion!.trim(),
    createdAt: nowIso(),
    questionType: modelTurn.questionType ?? "EXPLORATION",
    meta: {
      brainstormingMode: activeBrainstormingMode,
      responseMode: modelTurn.responseMode,
      usedModel: true,
    },
  });

  const updated = await prisma.profileExtractionSession.update({
    where: {
      id: input.id,
    },
    data: {
      transcriptJson: transcript,
      draftProfileJson: nextDraft,
      currentQuestion: modelTurn.nextQuestion!.trim(),
      questionType: modelTurn.questionType ?? "EXPLORATION",
      turnCount: session.turnCount + 1,
      lastUserMessage: userMessage || session.lastUserMessage,
    },
  });

  return {
    session: {
      ...mapSessionState(updated),
      readyToFinalize: Boolean(modelTurn.readyToFinalize),
    },
  };
}

export async function finalizeProfileExtractionConversationSession(id: string) {
  assertDatabaseConfigured();

  const session = await prisma.profileExtractionSession.findUnique({
    where: {
      id,
    },
  });

  if (!session || session.status !== ProfileExtractionSessionStatus.ACTIVE) {
    throw new ServiceError("对话式提炼会话不存在或已结束。", 404, "PROFILE_EXTRACTION_SESSION_NOT_FOUND");
  }

  const transcript = Array.isArray(session.transcriptJson)
    ? (session.transcriptJson as ConversationTranscriptMessage[])
    : [];
  const draftProfile = mergeDraft(EMPTY_DRAFT, session.draftProfileJson as Partial<CreatorProfileDraft> | null);

  let finalizedDraft = draftProfile;

  try {
    finalizedDraft = await generateFinalDraft({
      transcript,
      draftProfile,
    });
  } catch {
    finalizedDraft = ensureVisibleDraft(draftProfile);
  }

  const visibleDraft = ensureVisibleDraft(finalizedDraft);
  const result = await activateCreatorProfileDraft(visibleDraft);

  await prisma.profileExtractionSession.update({
    where: {
      id,
    },
    data: {
      status: ProfileExtractionSessionStatus.COMPLETED,
      draftProfileJson: visibleDraft,
      currentQuestion: null,
      questionType: "CONFIRMATION",
    },
  });

  return {
    profileId: result.profileId,
    sessionId: id,
  };
}
