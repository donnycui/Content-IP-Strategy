import type { StyleRevisionPayload, StyleSamplePayload } from "../domain/contracts";

export type StyleLearningProfile = {
  voiceStyle?: string | null;
  positioning?: string | null;
  contentBoundaries?: string | null;
};

function buildFallbackRules(profile?: StyleLearningProfile | null) {
  const voice = profile?.voiceStyle || "先说人话，再说观点，最后给行动方向。";
  const positioning = profile?.positioning || "围绕创作者当前定位，用清晰判断替代空泛套话。";
  const boundary = profile?.contentBoundaries || "避免模板化套话、空洞鸡血和与画像不一致的流量表达。";

  return [
    "# 风格规则",
    "",
    "## 当前底味",
    voice,
    "",
    "## 表达定位",
    positioning,
    "",
    "## 禁忌边界",
    boundary,
    "",
    "## 当前阶段工作法",
    "- 优先让表达贴近创作者本人，而不是追求平均化模板。",
    "- 生成初稿以后，必须允许用户手动修改，并把修改差异沉淀成后续规则。",
    "- 当用户还没有足够样本时，先提供可编辑的基础稿，再逐步收敛风格。",
  ].join("\n");
}

function takePreview(value: string, limit = 90) {
  const text = value.trim().replace(/\s+/g, " ");
  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit)}...`;
}

function uniqueItems(items: string[], limit = 6) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).slice(0, limit);
}

function inferSampleStyleNotes(samples: StyleSamplePayload[]) {
  const joined = samples.map((sample) => sample.sampleText).join("\n");
  const notes: string[] = [];

  if (/[我咱]/.test(joined)) {
    notes.push("保留第一人称和真人立场，不要把表达改成机构公告。");
  }

  if (/你|客户|用户|读者/.test(joined)) {
    notes.push("表达要直接面向读者，用对话感把问题讲清楚。");
  }

  if (/不是|但|但是|真正|核心|关键/.test(joined)) {
    notes.push("常用“先排除表面答案，再给真实判断”的表达路径。");
  }

  if (/案例|场景|家庭|客户|经历|故事/.test(joined)) {
    notes.push("适合用具体场景和客户语境承接观点，不要只讲抽象概念。");
  }

  if (/风险|边界|底线|避坑|误区/.test(joined)) {
    notes.push("要保留风险意识和边界感，避免过度承诺。");
  }

  if (!notes.length && samples.length) {
    notes.push("先以最近原创样本的句式、语气和判断顺序作为生成参照。");
  }

  return uniqueItems(notes);
}

function inferRevisionStyleNotes(revisions: StyleRevisionPayload[]) {
  const notes: string[] = [];

  for (const revision of revisions) {
    if (revision.ruleDelta?.trim()) {
      notes.push(revision.ruleDelta);
      continue;
    }

    const draftLength = revision.draftText.trim().length;
    const revisedLength = revision.revisedText.trim().length;

    if (draftLength && revisedLength < draftLength * 0.85) {
      notes.push("手改稿明显更短，生成时要减少铺垫和空泛解释。");
    }

    if (draftLength && revisedLength > draftLength * 1.15) {
      notes.push("手改稿补充了更多场景，生成时要把判断落到具体例子。");
    }

    if (/你|咱|我|大哥|小老弟/.test(revision.revisedText) && !/你|咱|我|大哥|小老弟/.test(revision.draftText)) {
      notes.push("手改稿增强了对话感，后续生成要更像真人沟通。");
    }

    if (/首先|其次|最后|第一|第二|第三/.test(revision.draftText) && !/首先|其次|最后|第一|第二|第三/.test(revision.revisedText)) {
      notes.push("手改稿弱化了模板化分点，后续不要机械列提纲。");
    }
  }

  if (!notes.length && revisions.length) {
    notes.push("以用户手改稿为准，优先学习删改后的语气、结构和信息密度。");
  }

  return uniqueItems(notes);
}

export function buildLearnedStyleSkill(input: {
  profile?: StyleLearningProfile | null;
  samples: StyleSamplePayload[];
  revisions: StyleRevisionPayload[];
  sampleCount: number;
  revisionCount: number;
}) {
  const sampleNotes = inferSampleStyleNotes(input.samples);
  const revisionNotes = inferRevisionStyleNotes(input.revisions);
  const sourceLines = input.samples.length
    ? input.samples.map((sample) => `- ${sample.title}${sample.sourceLabel ? `（${sample.sourceLabel}）` : ""}：${takePreview(sample.sampleText)}`)
    : ["- 暂无原创样本，先从画像和手改记录学习。"];
  const revisionLines = input.revisions.length
    ? input.revisions.map((revision) => `- ${takePreview(revision.ruleDelta || revision.revisedText)}`)
    : ["- 暂无手改修订记录，先用原创样本建立初始风格。"];
  const profileRules = buildFallbackRules(input.profile);
  const summary =
    input.sampleCount || input.revisionCount
      ? `已从 ${input.sampleCount} 个原创样本和 ${input.revisionCount} 次手改修订中沉淀风格：${[
          ...sampleNotes.slice(0, 2),
          ...revisionNotes.slice(0, 2),
        ].join(" ")}`
      : input.profile?.voiceStyle
        ? `当前先从画像里的表达风格出发：${input.profile.voiceStyle}`
        : "当前还没有稳定风格样本，先从画像和后续手改稿逐步沉淀 style skill。";

  const rulesMarkdown = [
    "# 风格规则",
    "",
    "## 基础画像规则",
    profileRules.replace(/^# 风格规则\s*/u, "").trim(),
    "",
    "## 已学习的原创样本",
    ...sourceLines,
    "",
    "## 从原创样本学到的表达习惯",
    ...(sampleNotes.length ? sampleNotes.map((note) => `- ${note}`) : ["- 暂无足够样本，先让用户上传代表性内容。"]),
    "",
    "## 从手改修订学到的规则",
    ...revisionLines,
    "",
    "## 后续生成必须遵守",
    ...(revisionNotes.length ? revisionNotes.map((note) => `- ${note}`) : ["- 生成后必须允许用户手改，并把差异继续沉淀为规则。"]),
    "- 优先生成像本人会说的话，而不是平台通用模板。",
    "- 不要只给方向或大纲，内容项目必须生成可编辑成稿。",
  ].join("\n");

  return {
    summary,
    rulesMarkdown,
  };
}
