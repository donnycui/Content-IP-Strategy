import {
  ProfileExtractionSourceMode,
  ProfileExtractionSessionStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  BrainstormingModeValue,
  ExtractionConstraintValue,
  InterviewCoverageKeyValue,
  InterviewCoverageStatusValue,
} from "@/lib/domain/contracts";
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
    extractionConstraint?: ExtractionConstraintValue;
    responseMode?: "BRAINSTORMING" | "EXTRACTION";
    usedModel?: boolean;
    userName?: string;
    agentName?: string;
  };
};

export type ConversationSessionState = {
  id: string;
  status: "ACTIVE" | "COMPLETED" | "ABANDONED";
  sourceMode: "CONVERSATIONAL";
  brainstormingMode: BrainstormingModeValue;
  extractionConstraint: ExtractionConstraintValue;
  responseMode: "BRAINSTORMING" | "EXTRACTION";
  participantNames: {
    userName: string;
    agentName: string;
  };
  coverage: Record<InterviewCoverageKeyValue, InterviewCoverageStatusValue>;
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
  userName?: string;
  agentName?: string;
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

const EMPTY_COVERAGE: Record<InterviewCoverageKeyValue, InterviewCoverageStatusValue> = {
  DIRECTION: "UNTOUCHED",
  PERSONA: "UNTOUCHED",
  AUDIENCE: "UNTOUCHED",
  EXPRESSION_FORMAT: "UNTOUCHED",
  PLATFORM_STYLE: "UNTOUCHED",
};

function nowIso() {
  return new Date().toISOString();
}

function firstQuestion() {
  return "开始之前先约定一下：我怎么称呼你？你也可以顺手给我起个名字。然后请你先用一小段话做个自我介绍，尽量一起讲 4 件事：你的职业背景、你想打造什么方向的 IP、你现在最初的想法、以及你为什么现在想做这件事。";
}

function normalizeDraftPatch(patch?: Partial<CreatorProfileDraft> | null) {
  if (!patch) {
    return {};
  }

  const normalizeText = (value: unknown) => {
    if (typeof value === "string") {
      return value.trim();
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === "string" ? item.trim() : String(item ?? "").trim()))
        .filter(Boolean)
        .join("；");
    }

    if (value && typeof value === "object") {
      return JSON.stringify(value);
    }

    if (value === null || value === undefined) {
      return "";
    }

    return String(value).trim();
  };

  return {
    name: normalizeText(patch.name),
    positioning: normalizeText(patch.positioning),
    persona: normalizeText(patch.persona),
    audience: normalizeText(patch.audience),
    coreThemes: normalizeText(patch.coreThemes),
    voiceStyle: normalizeText(patch.voiceStyle),
    growthGoal: normalizeText(patch.growthGoal),
    contentBoundaries: normalizeText(patch.contentBoundaries),
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

function getLatestExtractionConstraint(transcript: ConversationTranscriptMessage[]) {
  const systemEntries = [...transcript].reverse().find((item) => item.role === "system" && item.meta?.extractionConstraint);
  return systemEntries?.meta?.extractionConstraint ?? "STRONG";
}

function getParticipantNames(transcript: ConversationTranscriptMessage[]) {
  const latest = [...transcript]
    .reverse()
    .find((item) => item.meta?.userName || item.meta?.agentName);

  return {
    userName: latest?.meta?.userName || "你",
    agentName: latest?.meta?.agentName || "系统",
  };
}

function hasLength(value: string, min: number) {
  return value.trim().length >= min;
}

function countKeywords(text: string, keywords: string[]) {
  return keywords.filter((keyword) => text.includes(keyword)).length;
}

function buildCoverage(input: {
  draft: CreatorProfileDraft;
  transcript: ConversationTranscriptMessage[];
}) {
  const userText = input.transcript
    .filter((item) => item.role === "user")
    .map((item) => item.content)
    .join("\n");

  const formatKeywordCount = countKeywords(userText, [
    "短视频",
    "长视频",
    "视频",
    "图文",
    "直播",
    "口播",
    "长文",
    "文章",
    "播客",
    "专栏",
    "栏目",
    "系列",
  ]);
  const platformKeywordCount = countKeywords(userText, [
    "小红书",
    "公众号",
    "视频号",
    "抖音",
    "快手",
    "B站",
    "知乎",
    "微博",
  ]);
  const styleKeywordCount = countKeywords(userText, [
    "风格",
    "调性",
    "语气",
    "口吻",
    "硬核",
    "轻松",
    "专业",
    "幽默",
    "真实体验",
    "避坑",
    "测评",
    "表达",
  ]);

  const coverage = { ...EMPTY_COVERAGE };

  coverage.DIRECTION = hasLength(input.draft.positioning, 24) || hasLength(input.draft.coreThemes, 16)
    ? "SUFFICIENT"
    : hasLength(input.draft.positioning, 6) || hasLength(input.draft.coreThemes, 6) || hasLength(input.draft.growthGoal, 6)
      ? "TOUCHED"
      : "UNTOUCHED";

  coverage.PERSONA = hasLength(input.draft.persona, 20) || hasLength(input.draft.voiceStyle, 10)
    ? "SUFFICIENT"
    : hasLength(input.draft.persona, 6) || hasLength(input.draft.voiceStyle, 6)
      ? "TOUCHED"
      : "UNTOUCHED";

  coverage.AUDIENCE = hasLength(input.draft.audience, 12)
    ? "SUFFICIENT"
    : hasLength(input.draft.audience, 4)
      ? "TOUCHED"
      : "UNTOUCHED";

  coverage.EXPRESSION_FORMAT = formatKeywordCount >= 2 ? "SUFFICIENT" : formatKeywordCount >= 1 ? "TOUCHED" : "UNTOUCHED";

  coverage.PLATFORM_STYLE =
    platformKeywordCount >= 1 && styleKeywordCount >= 1
      ? "SUFFICIENT"
      : platformKeywordCount >= 1 || styleKeywordCount >= 1
        ? "TOUCHED"
        : "UNTOUCHED";

  return coverage;
}

function canFinalizeConversation(input: {
  extractionConstraint: ExtractionConstraintValue;
  coverage: Record<InterviewCoverageKeyValue, InterviewCoverageStatusValue>;
  turnCount: number;
}) {
  const isSufficient = (key: InterviewCoverageKeyValue) => input.coverage[key] === "SUFFICIENT";
  const isTouched = (key: InterviewCoverageKeyValue) =>
    input.coverage[key] === "SUFFICIENT" || input.coverage[key] === "TOUCHED";

  if (input.extractionConstraint === "STRONG") {
    return (
      input.turnCount >= 6 &&
      isSufficient("DIRECTION") &&
      isSufficient("PERSONA") &&
      isSufficient("AUDIENCE") &&
      isSufficient("EXPRESSION_FORMAT") &&
      isSufficient("PLATFORM_STYLE")
    );
  }

  if (input.extractionConstraint === "MEDIUM") {
    return (
      input.turnCount >= 4 &&
      isSufficient("DIRECTION") &&
      isSufficient("PERSONA") &&
      isSufficient("AUDIENCE") &&
      ((isSufficient("EXPRESSION_FORMAT") && isTouched("PLATFORM_STYLE")) ||
        (isSufficient("PLATFORM_STYLE") && isTouched("EXPRESSION_FORMAT")))
    );
  }

  const coreSufficientCount = ["DIRECTION", "PERSONA", "AUDIENCE"].filter((key) =>
    isSufficient(key as InterviewCoverageKeyValue),
  ).length;

  return input.turnCount >= 3 && coreSufficientCount >= 2 && (isTouched("EXPRESSION_FORMAT") || isTouched("PLATFORM_STYLE"));
}

function getCoverageGapPrompt(coverage: Record<InterviewCoverageKeyValue, InterviewCoverageStatusValue>) {
  if (coverage.DIRECTION !== "SUFFICIENT") {
    return "我们还没把方向聊透。你最希望别人因为你输出哪类判断、经验或价值而记住你？";
  }

  if (coverage.PERSONA !== "SUFFICIENT") {
    return "方向已经有了，但你这个人为什么值得信还没聊透。你最能建立可信度的背景、经历或判断标准是什么？";
  }

  if (coverage.AUDIENCE !== "SUFFICIENT") {
    return "你想影响谁这件事还不够清楚。你最想服务的那群人是谁，他们现在最典型的问题是什么？";
  }

  if (coverage.EXPRESSION_FORMAT !== "SUFFICIENT") {
    return "还有一个关键点没聊透：你更适合用什么形式表达？比如短视频、图文、长文、直播，哪些是主阵地，哪些你不想碰？";
  }

  if (coverage.PLATFORM_STYLE !== "SUFFICIENT") {
    return "最后还差平台风格偏好。比如小红书图文、短视频、公众号或 B 站，你分别更想用什么风格和语气去表达？";
  }

  return "如果还想补一条关键内容，可以继续回复；否则可以直接生成画像草案。";
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

function sanitizeConfirmationQuestion(nextQuestion: string, readyToFinalize?: boolean, questionType?: ConversationQuestionType) {
  if (readyToFinalize || questionType === "CONFIRMATION" || nextQuestion.includes("如果你愿意")) {
    return "信息已经足够。你可以点击下方“生成画像草案”；如果还想补一条关键内容，也可以继续回复。";
  }

  return nextQuestion;
}

function parseNamesFromMessage(text: string) {
  const normalized = text.replace(/[，。；！]/g, " ").trim();
  const userMatch = normalized.match(/(?:我叫|我是|叫我|可以叫我|你叫我)([^\s]+)/);
  const agentMatch = normalized.match(/(?:你叫|给你起名|叫你|你可以叫)([^\s]+)/);

  return {
    userName: userMatch?.[1]?.trim() || "",
    agentName: agentMatch?.[1]?.trim() || "",
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
  const extractionConstraint = getLatestExtractionConstraint(transcript);
  const lastAssistant = [...transcript].reverse().find((item) => item.role === "assistant");
  const responseMode = lastAssistant?.meta?.responseMode ?? "EXTRACTION";
  const participantNames = getParticipantNames(transcript);
  const coverage = buildCoverage({
    draft: draftProfile,
    transcript,
  });

  return {
    id: session.id,
    status: session.status,
    sourceMode: "CONVERSATIONAL",
    brainstormingMode,
    extractionConstraint,
    responseMode,
    participantNames,
    coverage,
    draftProfile,
    transcript,
    currentQuestion: session.currentQuestion,
    questionType: (session.questionType as ConversationQuestionType | null) ?? null,
    turnCount: session.turnCount,
    readyToFinalize: canFinalizeConversation({
      extractionConstraint,
      coverage,
      turnCount: session.turnCount,
    }),
  };
}

async function generateConversationTurn(args: {
  transcript: ConversationTranscriptMessage[];
  draftProfile: CreatorProfileDraft;
  requestedTier?: "FAST" | "BALANCED" | "DEEP";
  brainstormingMode: BrainstormingModeValue;
  extractionConstraint: ExtractionConstraintValue;
  phase: "OPENING" | "CONTINUE";
  coverage: Record<InterviewCoverageKeyValue, InterviewCoverageStatusValue>;
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
      "如果用户给出了双方称呼，请提取 userName 和 agentName。",
      `当前提炼约束是 ${args.extractionConstraint}。`,
      "只有在你认为当前信息已经足够形成第一版画像时，才把 readyToFinalize 设为 true；如果仍有关键维度不完整，请继续追问。",
      '返回严格 JSON：{"draftProfile":{...},"nextQuestion":"...","questionType":"OPENING|EXPLORATION|AUDIENCE|CAPABILITY|POSITIONING|THEMES|BOUNDARY|GOAL|STYLE|CONFIRMATION","readyToFinalize":true|false,"reasoningSummary":"...","responseMode":"BRAINSTORMING|EXTRACTION","userName":"","agentName":""}',
    ].join("\n"),
    userPrompt: JSON.stringify(
      {
        phase: args.phase,
        brainstormingMode: args.brainstormingMode,
        extractionConstraint: args.extractionConstraint,
        currentCoverage: args.coverage,
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

export async function getLatestActiveProfileExtractionConversationSession() {
  assertDatabaseConfigured();

  const session = await prisma.profileExtractionSession.findFirst({
    where: {
      status: ProfileExtractionSessionStatus.ACTIVE,
      sourceMode: ProfileExtractionSourceMode.CONVERSATIONAL,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return session ? mapSessionState(session) : null;
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
  extractionConstraint: ExtractionConstraintValue = "STRONG",
  forceNew = false,
) {
  assertDatabaseConfigured();

  const existing = await getLatestActiveProfileExtractionConversationSession().catch(() => null);
  if (existing && !forceNew) {
    return {
      session: existing,
      requestedTier: requestedTier ?? "DEEP",
    };
  }

  if (forceNew) {
    await prisma.profileExtractionSession.updateMany({
      where: {
        status: ProfileExtractionSessionStatus.ACTIVE,
        sourceMode: ProfileExtractionSourceMode.CONVERSATIONAL,
      },
      data: {
        status: ProfileExtractionSessionStatus.ABANDONED,
      },
    });
  }

  const transcript: ConversationTranscriptMessage[] = [
    {
      role: "system",
      content: "Session config",
      createdAt: nowIso(),
      meta: {
        brainstormingMode,
        extractionConstraint,
        userName: "",
        agentName: "招财",
      },
    },
    {
      role: "assistant",
      content: firstQuestion(),
      createdAt: nowIso(),
      questionType: "OPENING",
      meta: {
        brainstormingMode,
        extractionConstraint,
        responseMode: "BRAINSTORMING",
        usedModel: false,
        userName: "",
        agentName: "招财",
      },
    },
  ];

  const session = await prisma.profileExtractionSession.create({
    data: {
      sourceMode: ProfileExtractionSourceMode.CONVERSATIONAL,
      transcriptJson: transcript,
      draftProfileJson: EMPTY_DRAFT,
      currentQuestion: firstQuestion(),
      questionType: "OPENING",
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
  extractionConstraint?: ExtractionConstraintValue;
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
  const activeExtractionConstraint = input.extractionConstraint ?? getLatestExtractionConstraint(transcript);
  const userMessage = input.message?.trim() ?? "";
  const currentNames = getParticipantNames(transcript);
  const parsedNames = parseNamesFromMessage(userMessage);

  if (!input.skip && !userMessage) {
    throw new ServiceError("请输入回答内容，或选择跳过当前问题。", 400, "EMPTY_CONVERSATION_REPLY");
  }

  transcript.push({
    role: "system",
    content: "Session config update",
    createdAt: nowIso(),
    meta: {
      brainstormingMode: activeBrainstormingMode,
      extractionConstraint: activeExtractionConstraint,
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
    extractionConstraint: activeExtractionConstraint,
    phase: "CONTINUE",
    coverage: buildCoverage({
      draft: draftProfile,
      transcript,
    }),
  });

  const nextDraft = mergeDraft(draftProfile, {
    ...(modelTurn.draftProfile ?? null),
    ...((modelTurn.userName?.trim() || parsedNames.userName) ? { name: modelTurn.userName?.trim() || parsedNames.userName } : {}),
  });
  const nextUserName = modelTurn.userName?.trim() || parsedNames.userName || currentNames.userName;
  const nextAgentName = modelTurn.agentName?.trim() || parsedNames.agentName || currentNames.agentName || "招财";
  const nextTurnCount = session.turnCount + 1;
  const nextCoverage = buildCoverage({
    draft: nextDraft,
    transcript,
  });
  const canFinalize = canFinalizeConversation({
    extractionConstraint: activeExtractionConstraint,
    coverage: nextCoverage,
    turnCount: nextTurnCount,
  });
  const confirmationLike =
    Boolean(modelTurn.readyToFinalize) ||
    modelTurn.questionType === "CONFIRMATION" ||
    Boolean(modelTurn.nextQuestion?.includes("如果你愿意")) ||
    Boolean(modelTurn.nextQuestion?.includes("信息已经足够"));
  const nextQuestion = canFinalize
    ? sanitizeConfirmationQuestion(
        modelTurn.nextQuestion!.trim(),
        modelTurn.readyToFinalize,
        modelTurn.questionType,
      )
    : confirmationLike
      ? getCoverageGapPrompt(nextCoverage)
      : modelTurn.nextQuestion!.trim();
  const nextQuestionType: ConversationQuestionType = canFinalize
    ? modelTurn.questionType ?? "CONFIRMATION"
    : confirmationLike && modelTurn.questionType === "CONFIRMATION"
      ? "EXPLORATION"
      : modelTurn.questionType ?? "EXPLORATION";

  transcript.push({
    role: "assistant",
    content: nextQuestion,
    createdAt: nowIso(),
    questionType: nextQuestionType,
    meta: {
      brainstormingMode: activeBrainstormingMode,
      extractionConstraint: activeExtractionConstraint,
      responseMode: modelTurn.responseMode,
      usedModel: true,
      userName: nextUserName,
      agentName: nextAgentName,
    },
  });

  const updated = await prisma.profileExtractionSession.update({
    where: {
      id: input.id,
    },
    data: {
      transcriptJson: transcript,
      draftProfileJson: nextDraft,
      currentQuestion: nextQuestion,
      questionType: nextQuestionType,
      turnCount: nextTurnCount,
      lastUserMessage: userMessage || session.lastUserMessage,
    },
  });

  return {
    session: {
      ...mapSessionState(updated),
      readyToFinalize: canFinalize,
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
