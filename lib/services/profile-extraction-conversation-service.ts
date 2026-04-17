import {
  ProfileExtractionSourceMode,
  ProfileExtractionSessionStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreatorProfileDraft } from "@/lib/profile-data";
import { activateCreatorProfileDraft, assertDatabaseConfigured } from "@/lib/services/profile-service";
import { executeStructuredGeneration } from "@/lib/services/structured-generation-service";
import { ServiceError } from "@/lib/services/service-error";

export type ConversationQuestionType =
  | "OPENING"
  | "AUDIENCE"
  | "CAPABILITY"
  | "POSITIONING"
  | "THEMES"
  | "BOUNDARY"
  | "GOAL"
  | "STYLE"
  | "CONFIRMATION";

export type ConversationTranscriptMessage = {
  role: "assistant" | "user";
  content: string;
  createdAt: string;
  questionType?: ConversationQuestionType | null;
  skipped?: boolean;
};

export type ConversationSessionState = {
  id: string;
  status: "ACTIVE" | "COMPLETED" | "ABANDONED";
  sourceMode: "CONVERSATIONAL" | "QUICK";
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

function firstQuestion() {
  return {
    question: "先用两三句话说说：你现在最想成为一个什么样的创作者？你最希望别人因为什么内容来认识你？",
    questionType: "OPENING" as const,
  };
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

function quoteSnippet(text: string) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact) {
    return "";
  }

  return compact.length > 28 ? `${compact.slice(0, 28)}...` : compact;
}

function chooseHeuristicQuestion(draft: CreatorProfileDraft, lastUserMessage: string | null): {
  nextQuestion: string;
  questionType: ConversationQuestionType;
  readyToFinalize: boolean;
} {
  const snippet = lastUserMessage ? quoteSnippet(lastUserMessage) : "";

  if (!draft.audience) {
    return {
      nextQuestion: snippet
        ? `你刚才提到“${snippet}”，那你最想服务的是哪一类人？他们现在最困扰的问题是什么？`
        : "你最想服务的是哪一类人？他们现在最困扰的问题是什么？",
      questionType: "AUDIENCE",
      readyToFinalize: false,
    };
  }

  if (!draft.positioning) {
    return {
      nextQuestion: "如果只能用一句话定义你的账号角色，你希望别人把你当成什么样的创作者或顾问？",
      questionType: "POSITIONING",
      readyToFinalize: false,
    };
  }

  if (!draft.persona) {
    return {
      nextQuestion: "相比资讯搬运，你更希望别人记住你哪种能力：判断、解释、规划，还是陪伴决策？为什么？",
      questionType: "CAPABILITY",
      readyToFinalize: false,
    };
  }

  if (!draft.coreThemes) {
    return {
      nextQuestion: "如果连续输出三个月，你最想反复围绕哪几个议题展开？",
      questionType: "THEMES",
      readyToFinalize: false,
    };
  }

  if (!draft.growthGoal) {
    return {
      nextQuestion: "未来 6 到 12 个月，你希望这个账号优先给你带来什么：信任、获客、影响力，还是转化？",
      questionType: "GOAL",
      readyToFinalize: false,
    };
  }

  if (!draft.contentBoundaries) {
    return {
      nextQuestion: "有哪些内容虽然可能有流量，但你明确不想做？",
      questionType: "BOUNDARY",
      readyToFinalize: false,
    };
  }

  if (!draft.voiceStyle) {
    return {
      nextQuestion: "你希望自己的表达给人什么感觉？克制、锋利、陪伴感、结论先行，还是别的？",
      questionType: "STYLE",
      readyToFinalize: false,
    };
  }

  return {
    nextQuestion: "当前草案已经比较完整了。如果你觉得基本准确，可以直接生成画像；如果还有最重要的一点，请再补充一句。",
    questionType: "CONFIRMATION",
    readyToFinalize: true,
  };
}

function deriveHeuristicDraftPatch(
  questionType: ConversationQuestionType | null,
  userMessage: string,
): Partial<CreatorProfileDraft> | null {
  const text = userMessage.trim();

  if (!text) {
    return null;
  }

  switch (questionType) {
    case "OPENING":
    case "POSITIONING":
      return {
        positioning: text,
      };
    case "AUDIENCE":
      return {
        audience: text,
      };
    case "CAPABILITY":
      return {
        persona: text,
      };
    case "THEMES":
      return {
        coreThemes: text,
      };
    case "BOUNDARY":
      return {
        contentBoundaries: text,
      };
    case "GOAL":
      return {
        growthGoal: text,
      };
    case "STYLE":
      return {
        voiceStyle: text,
      };
    default:
      return null;
  }
}

function ensureCompleteDraft(draft: CreatorProfileDraft, transcript: ConversationTranscriptMessage[]) {
  const mergedTranscript = transcript
    .filter((item) => item.role === "user" && !item.skipped)
    .map((item) => item.content.trim())
    .filter(Boolean)
    .join("\n");
  const summary = quoteSnippet(mergedTranscript);

  return {
    name: draft.name || "未命名创作者",
    positioning:
      draft.positioning ||
      `基于当前访谈，系统判断你适合成为一个以知识提炼和判断输出为核心的创作者。${summary ? ` 当前重点是：${summary}` : ""}`,
    persona: draft.persona || "结构化、重判断、强调长期方向与行动建议的知识型创作者。",
    audience: draft.audience || "希望提升认知密度、判断质量和内容持续性的高认知受众。",
    coreThemes: draft.coreThemes || "长期议题、结构性变化、方向判断、主题积累、个人品牌增长。",
    voiceStyle: draft.voiceStyle || "清晰、克制、结论先行，强调因果链和行动方向。",
    growthGoal: draft.growthGoal || "建立稳定的知识型个人品牌内容系统。",
    contentBoundaries: draft.contentBoundaries || "不做纯热点搬运，不做情绪驱动表达，不做与长期定位无关的泛内容。",
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
}) : ConversationSessionState {
  const draftProfile = mergeDraft(EMPTY_DRAFT, session.draftProfileJson as Partial<CreatorProfileDraft> | null);
  const transcript = Array.isArray(session.transcriptJson)
    ? (session.transcriptJson as ConversationTranscriptMessage[])
    : [];

  return {
    id: session.id,
    status: session.status,
    sourceMode: session.sourceMode,
    draftProfile,
    transcript,
    currentQuestion: session.currentQuestion,
    questionType: (session.questionType as ConversationQuestionType | null) ?? null,
    turnCount: session.turnCount,
    readyToFinalize: chooseHeuristicQuestion(draftProfile, session.currentQuestion).readyToFinalize,
  };
}

async function generateConversationTurn(args: {
  transcript: ConversationTranscriptMessage[];
  draftProfile: CreatorProfileDraft;
  requestedTier?: "FAST" | "BALANCED" | "DEEP";
}) {
  const payload = await executeStructuredGeneration<ConversationTurnModelOutput>({
    capabilityKey: "ip_extraction_interview",
    systemInstruction:
      "你是创作者画像访谈助手。请基于已有对话和当前草案，更新画像草案，并且只生成下一条最有价值的问题。问题必须自然、具体、引用上下文，不要像问卷。返回严格 JSON：{\"draftProfile\":{...},\"nextQuestion\":\"...\",\"questionType\":\"AUDIENCE|CAPABILITY|POSITIONING|BOUNDARY|GOAL|STYLE|CONFIRMATION\",\"readyToFinalize\":true|false,\"reasoningSummary\":\"...\"}。未知字段保留空字符串，不要编造。",
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

  return payload;
}

export async function createProfileExtractionConversationSession(requestedTier?: "FAST" | "BALANCED" | "DEEP") {
  assertDatabaseConfigured();

  const opening = firstQuestion();
  const transcript: ConversationTranscriptMessage[] = [
    {
      role: "assistant",
      content: opening.question,
      createdAt: nowIso(),
      questionType: opening.questionType,
    },
  ];

  const session = await prisma.profileExtractionSession.create({
    data: {
      sourceMode: ProfileExtractionSourceMode.CONVERSATIONAL,
      transcriptJson: transcript,
      draftProfileJson: EMPTY_DRAFT,
      currentQuestion: opening.question,
      questionType: opening.questionType,
      turnCount: 0,
      lastUserMessage: null,
    },
  });

  return {
    session: {
      ...mapSessionState(session),
      readyToFinalize: false,
    },
    requestedTier: requestedTier ?? "DEEP",
  };
}

export async function replyToProfileExtractionConversationSession(input: {
  id: string;
  message?: string;
  skip?: boolean;
  requestedTier?: "FAST" | "BALANCED" | "DEEP";
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

  const userMessage = input.message?.trim() ?? "";

  if (!input.skip && !userMessage) {
    throw new ServiceError("请输入回答内容，或选择跳过当前问题。", 400, "EMPTY_CONVERSATION_REPLY");
  }

  transcript.push({
    role: "user",
    content: userMessage || "跳过当前问题",
    createdAt: nowIso(),
    skipped: Boolean(input.skip),
  });

  let nextDraft = mergeDraft(
    draftProfile,
    input.skip ? null : deriveHeuristicDraftPatch((session.questionType as ConversationQuestionType | null) ?? null, userMessage),
  );
  let nextQuestionResult = chooseHeuristicQuestion(nextDraft, userMessage || session.lastUserMessage);

  if (!input.skip) {
    const modelResult = await generateConversationTurn({
      transcript,
      draftProfile: nextDraft,
      requestedTier: input.requestedTier,
    }).catch(() => null);

    if (modelResult) {
      nextDraft = mergeDraft(nextDraft, modelResult.draftProfile ?? null);

      if (modelResult.nextQuestion?.trim()) {
        nextQuestionResult = {
          nextQuestion: modelResult.nextQuestion.trim(),
          questionType: modelResult.questionType ?? nextQuestionResult.questionType,
          readyToFinalize: Boolean(modelResult.readyToFinalize),
        };
      } else {
        nextQuestionResult = chooseHeuristicQuestion(nextDraft, userMessage);
      }
    } else {
      nextQuestionResult = chooseHeuristicQuestion(nextDraft, userMessage);
    }
  }

  transcript.push({
    role: "assistant",
    content: nextQuestionResult.nextQuestion,
    createdAt: nowIso(),
    questionType: nextQuestionResult.questionType,
  });

  const updated = await prisma.profileExtractionSession.update({
    where: {
      id: input.id,
    },
    data: {
      transcriptJson: transcript,
      draftProfileJson: nextDraft,
      currentQuestion: nextQuestionResult.nextQuestion,
      questionType: nextQuestionResult.questionType,
      turnCount: session.turnCount + 1,
      lastUserMessage: userMessage || session.lastUserMessage,
    },
  });

  return {
    session: {
      ...mapSessionState(updated),
      readyToFinalize: nextQuestionResult.readyToFinalize,
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
  const finalizedDraft = ensureCompleteDraft(draftProfile, transcript);

  const result = await activateCreatorProfileDraft(finalizedDraft);

  await prisma.profileExtractionSession.update({
    where: {
      id,
    },
    data: {
      status: ProfileExtractionSessionStatus.COMPLETED,
      draftProfileJson: finalizedDraft,
      currentQuestion: null,
      questionType: "CONFIRMATION",
    },
  });

  return {
    profileId: result.profileId,
    sessionId: id,
  };
}
