import {
  ProfileExtractionSourceMode,
  ProfileExtractionSessionStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreatorProfileDraft } from "@/lib/profile-data";
import type { BrainstormingModeValue } from "@/lib/domain/contracts";
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
  sourceMode: "CONVERSATIONAL" | "QUICK";
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

function firstQuestion() {
  return {
    question: "先别急着给自己下定义。你现在最想把哪一类经验、判断或能力，慢慢变成别人会主动来找你的内容？",
    questionType: "OPENING" as const,
  };
}

function getLatestBrainstormingMode(transcript: ConversationTranscriptMessage[]) {
  const systemEntries = [...transcript].reverse().find((item) => item.role === "system" && item.meta?.brainstormingMode);
  return systemEntries?.meta?.brainstormingMode ?? "AUTO";
}

function inferResponseMode({
  brainstormingMode,
  draft,
  lastUserMessage,
  turnCount,
}: {
  brainstormingMode: BrainstormingModeValue;
  draft: CreatorProfileDraft;
  lastUserMessage: string | null;
  turnCount: number;
}): "BRAINSTORMING" | "EXTRACTION" {
  if (brainstormingMode === "OFF") {
    return "EXTRACTION";
  }

  if (brainstormingMode === "ON") {
    return "BRAINSTORMING";
  }

  const text = (lastUserMessage ?? "").trim();
  const ambiguitySignals = ["不知道", "不确定", "还没想清楚", "有点乱", "不好说", "模糊", "纠结", "怕", "但是", "又"];
  const hasAmbiguity = ambiguitySignals.some((signal) => text.includes(signal));
  const structuredFields = [draft.positioning, draft.audience, draft.coreThemes].filter(Boolean).length;

  if (hasAmbiguity || (turnCount < 3 && structuredFields < 2)) {
    return "BRAINSTORMING";
  }

  return "EXTRACTION";
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

function chooseHeuristicQuestion(args: {
  draft: CreatorProfileDraft;
  lastUserMessage: string | null;
  brainstormingMode: BrainstormingModeValue;
  turnCount: number;
}): {
  nextQuestion: string;
  questionType: ConversationQuestionType;
  readyToFinalize: boolean;
  responseMode: "BRAINSTORMING" | "EXTRACTION";
} {
  const { draft, lastUserMessage, brainstormingMode, turnCount } = args;
  const snippet = lastUserMessage ? quoteSnippet(lastUserMessage) : "";
  const responseMode = inferResponseMode({
    brainstormingMode,
    draft,
    lastUserMessage,
    turnCount,
  });

  if (responseMode === "BRAINSTORMING") {
    if (!lastUserMessage) {
      return {
        nextQuestion: "先不要追求标准答案。你过去做过的事里，哪三类经历或能力最有可能变成你的长期内容资产？先随便说。",
        questionType: "OPENING",
        readyToFinalize: false,
        responseMode,
      };
    }

    if (!draft.positioning) {
      return {
        nextQuestion: snippet
          ? `你刚才提到“${snippet}”。如果只能保留一条线长期讲下去，你更想把它做成哪种价值：观点判断、经验方法，还是陪伴式成长？为什么？`
          : "如果只能保留一条线长期讲下去，你更想把它做成哪种价值：观点判断、经验方法，还是陪伴式成长？为什么？",
        questionType: "POSITIONING",
        readyToFinalize: false,
        responseMode,
      };
    }

    if (!draft.audience) {
      return {
        nextQuestion: "听起来方向开始有了。那你最想先帮哪一类人？他们现在最卡的一件事是什么？",
        questionType: "AUDIENCE",
        readyToFinalize: false,
        responseMode,
      };
    }

    if (!draft.coreThemes) {
      return {
        nextQuestion: "如果接下来连续输出一个月，你最愿意反复讲哪两三个主题？先说你真的想长期讲的，不用管热点。",
        questionType: "THEMES",
        readyToFinalize: false,
        responseMode,
      };
    }
  }

  if (!draft.audience) {
    return {
      nextQuestion: snippet
        ? `你刚才提到“${snippet}”，那你最想服务的是哪一类人？他们现在最困扰的问题是什么？`
        : "你最想服务的是哪一类人？他们现在最困扰的问题是什么？",
      questionType: "AUDIENCE",
      readyToFinalize: false,
      responseMode,
    };
  }

  if (!draft.positioning) {
    return {
      nextQuestion: "如果只能用一句话定义你的账号角色，你希望别人把你当成什么样的创作者或顾问？",
      questionType: "POSITIONING",
      readyToFinalize: false,
      responseMode,
    };
  }

  if (!draft.persona) {
    return {
      nextQuestion: "相比资讯搬运，你更希望别人记住你哪种能力：判断、解释、规划，还是陪伴决策？为什么？",
      questionType: "CAPABILITY",
      readyToFinalize: false,
      responseMode,
    };
  }

  if (!draft.coreThemes) {
    return {
      nextQuestion: "如果连续输出三个月，你最想反复围绕哪几个议题展开？",
      questionType: "THEMES",
      readyToFinalize: false,
      responseMode,
    };
  }

  if (!draft.growthGoal) {
    return {
      nextQuestion: "未来 6 到 12 个月，你希望这个账号优先给你带来什么：信任、获客、影响力，还是转化？",
      questionType: "GOAL",
      readyToFinalize: false,
      responseMode,
    };
  }

  if (!draft.contentBoundaries) {
    return {
      nextQuestion: "有哪些内容虽然可能有流量，但你明确不想做？",
      questionType: "BOUNDARY",
      readyToFinalize: false,
      responseMode,
    };
  }

  if (!draft.voiceStyle) {
    return {
      nextQuestion: "你希望自己的表达给人什么感觉？克制、锋利、陪伴感、结论先行，还是别的？",
      questionType: "STYLE",
      readyToFinalize: false,
      responseMode,
    };
  }

  return {
    nextQuestion: "目前已经抓到一版方向了。如果你觉得基本准确，可以直接生成画像；如果还有最重要的一点，请再补充一句真正决定你定位的话。",
    questionType: "CONFIRMATION",
    readyToFinalize: true,
    responseMode,
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
    positioning: draft.positioning || (summary ? `待继续明确。当前提炼重点：${summary}` : "待继续明确。"),
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
}) : ConversationSessionState {
  const draftProfile = mergeDraft(EMPTY_DRAFT, session.draftProfileJson as Partial<CreatorProfileDraft> | null);
  const transcript = Array.isArray(session.transcriptJson)
    ? (session.transcriptJson as ConversationTranscriptMessage[])
    : [];
  const brainstormingMode = getLatestBrainstormingMode(transcript);
  const inferred = chooseHeuristicQuestion({
    draft: draftProfile,
    lastUserMessage: session.currentQuestion,
    brainstormingMode,
    turnCount: session.turnCount,
  });

  return {
    id: session.id,
    status: session.status,
    sourceMode: session.sourceMode,
    brainstormingMode,
    responseMode: inferred.responseMode,
    draftProfile,
    transcript,
    currentQuestion: session.currentQuestion,
    questionType: (session.questionType as ConversationQuestionType | null) ?? null,
    turnCount: session.turnCount,
    readyToFinalize: inferred.readyToFinalize,
  };
}

async function generateConversationTurn(args: {
  transcript: ConversationTranscriptMessage[];
  draftProfile: CreatorProfileDraft;
  requestedTier?: "FAST" | "BALANCED" | "DEEP";
  brainstormingMode: BrainstormingModeValue;
  responseMode: "BRAINSTORMING" | "EXTRACTION";
}) {
  const payload = await executeStructuredGeneration<ConversationTurnModelOutput>({
    capabilityKey: "ip_extraction_interview",
    systemInstruction:
      `你是创作者画像访谈助手。当前 brainstormingMode=${args.brainstormingMode}，当前 responseMode=${args.responseMode}。如果 responseMode=BRAINSTORMING，请先帮助用户发散、比较、收敛，不要像问卷一样补字段；如果 responseMode=EXTRACTION，请把已有理解压成更明确的定位、受众、主题、边界和目标。无论哪种模式，都只生成下一条最有价值的问题，问题必须自然、具体、引用上下文。返回严格 JSON：{"draftProfile":{...},"nextQuestion":"...","questionType":"AUDIENCE|CAPABILITY|POSITIONING|BOUNDARY|GOAL|STYLE|THEMES|CONFIRMATION","readyToFinalize":true|false,"reasoningSummary":"...","responseMode":"BRAINSTORMING|EXTRACTION"}。未知字段保留空字符串，不要编造。`,
    userPrompt: JSON.stringify(
      {
        transcript: args.transcript,
        currentDraft: args.draftProfile,
        brainstormingMode: args.brainstormingMode,
        responseMode: args.responseMode,
      },
      null,
      2,
    ),
    requestedTier: args.requestedTier,
  });

  return payload;
}

export async function createProfileExtractionConversationSession(
  requestedTier?: "FAST" | "BALANCED" | "DEEP",
  brainstormingMode: BrainstormingModeValue = "AUTO",
) {
  assertDatabaseConfigured();

  const opening = firstQuestion();
  const transcript: ConversationTranscriptMessage[] = [
    {
      role: "system",
      content: "Session config",
      createdAt: nowIso(),
      meta: {
        brainstormingMode,
        responseMode: brainstormingMode === "OFF" ? "EXTRACTION" : "BRAINSTORMING",
      },
    },
    {
      role: "assistant",
      content: opening.question,
      createdAt: nowIso(),
      questionType: opening.questionType,
      meta: {
        brainstormingMode,
        responseMode: brainstormingMode === "OFF" ? "EXTRACTION" : "BRAINSTORMING",
      },
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
    role: "user",
    content: userMessage || "跳过当前问题",
    createdAt: nowIso(),
    skipped: Boolean(input.skip),
    meta: {
      brainstormingMode: activeBrainstormingMode,
    },
  });

  let nextDraft = mergeDraft(
    draftProfile,
    input.skip ? null : deriveHeuristicDraftPatch((session.questionType as ConversationQuestionType | null) ?? null, userMessage),
  );
  let nextQuestionResult = chooseHeuristicQuestion({
    draft: nextDraft,
    lastUserMessage: userMessage || session.lastUserMessage,
    brainstormingMode: activeBrainstormingMode,
    turnCount: session.turnCount + 1,
  });

  if (!input.skip) {
    const modelResult = await generateConversationTurn({
      transcript,
      draftProfile: nextDraft,
      requestedTier: input.requestedTier,
      brainstormingMode: activeBrainstormingMode,
      responseMode: nextQuestionResult.responseMode,
    }).catch(() => null);

    if (modelResult) {
      nextDraft = mergeDraft(nextDraft, modelResult.draftProfile ?? null);

      if (modelResult.nextQuestion?.trim()) {
        nextQuestionResult = {
          nextQuestion: modelResult.nextQuestion.trim(),
          questionType: modelResult.questionType ?? nextQuestionResult.questionType,
          readyToFinalize: Boolean(modelResult.readyToFinalize),
          responseMode: modelResult.responseMode ?? nextQuestionResult.responseMode,
        };
      } else {
        nextQuestionResult = chooseHeuristicQuestion({
          draft: nextDraft,
          lastUserMessage: userMessage,
          brainstormingMode: activeBrainstormingMode,
          turnCount: session.turnCount + 1,
        });
      }
    } else {
      nextQuestionResult = chooseHeuristicQuestion({
        draft: nextDraft,
        lastUserMessage: userMessage,
        brainstormingMode: activeBrainstormingMode,
        turnCount: session.turnCount + 1,
      });
    }
  }

  transcript.push({
    role: "assistant",
    content: nextQuestionResult.nextQuestion,
    createdAt: nowIso(),
    questionType: nextQuestionResult.questionType,
    meta: {
      brainstormingMode: activeBrainstormingMode,
      responseMode: nextQuestionResult.responseMode,
      usedModel: !input.skip,
    },
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
