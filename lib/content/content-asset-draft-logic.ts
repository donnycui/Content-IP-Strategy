import type { StyleSkillPayload, TopicCandidateRow } from "../domain/contracts";

function compactText(value?: string | null, fallback = "这个话题正在形成新的内容机会。") {
  const text = value?.trim().replace(/\s+/g, " ");
  return text || fallback;
}

export function buildFallbackAssetDrafts(candidate: TopicCandidateRow, styleSkill: StyleSkillPayload) {
  const topicTitle = compactText(candidate.topicTitle, candidate.title);
  const title = compactText(candidate.title, topicTitle);
  const topicSummary = compactText(candidate.topicSummary, "先把用户正在关心的问题讲清楚，再给出可执行判断。");
  const whyNow = compactText(candidate.whyNow, topicSummary);
  const fitReason = compactText(candidate.fitReason, "这个题目和当前创作者的专业背景、受众需求和内容风格匹配。");
  const styleSummary = compactText(styleSkill.summary, "表达要像本人，先说判断，再讲原因，最后给行动方向。");

  const xhsPost = [
    "小红书图文包",
    "",
    "标题备选：",
    `1. ${title}`,
    `2. 别只看热闹，${topicTitle}真正该看这一层`,
    `3. 我为什么建议你现在重新看一遍${topicTitle}`,
    "",
    "封面文案：",
    `${topicTitle}，先看判断，再做选择`,
    "",
    "正文：",
    `很多人看到“${topicTitle}”，第一反应是把它当成一个普通话题。`,
    "",
    `但我更建议你看背后的变化：${whyNow}`,
    "",
    `真正值得讨论的不是它热不热，而是它对目标用户意味着什么。${topicSummary}`,
    "",
    "如果你正好处在类似场景里，我建议先问自己三个问题：",
    "1. 这件事影响的是短期选择，还是长期判断？",
    "2. 我现在最容易忽略的风险在哪里？",
    "3. 有没有一个更稳、更适合自己的处理顺序？",
    "",
    `我会更倾向于这样判断：${fitReason}`,
    "",
    "结尾：",
    "如果你愿意，我后面可以把这个话题继续拆成一组更具体的案例。你也可以在评论区说一个你的情况，我会尽量用人话拆开讲。",
    "",
    "标签建议：",
    `#${topicTitle.replace(/[^\p{Script=Han}\p{Letter}\p{Number}]+/gu, "") || "内容选题"} #认知判断 #专业避坑 #长期主义`,
  ].join("\n");

  const shortVideoScript = [
    "短视频脚本",
    "",
    "0-3 秒开场：",
    `你以为“${topicTitle}”只是一个普通话题，其实真正影响你判断的是后面这一层。`,
    "",
    "3-15 秒抛出问题：",
    `最近我反复看到一个现象：${whyNow}`,
    "",
    "15-45 秒主体口播：",
    "这件事不要先问“火不火”，而要问“它和我有什么关系”。如果你只看表面，很容易被信息带着走；但如果你回到自己的目标和边界，判断会清楚很多。",
    "",
    `我的看法是：${fitReason}`,
    "",
    "45-60 秒收束：",
    "所以这条内容我想给你一个简单结论：先把问题讲清楚，再决定要不要跟进，不要为了追热点牺牲自己的长期判断。",
    "",
    "画面建议：",
    "- 开头用一句大字标题压住注意力。",
    "- 中段用 2-3 个关键词卡片解释判断链路。",
    "- 结尾回到人物表达，不要做成模板化口播。",
    "",
    "互动引导：",
    "你如果也遇到类似问题，可以留言一个具体场景，我下一条用案例继续拆。",
  ].join("\n\n");

  const wechatArticle = [
    `公众号文章：${title}`,
    "",
    "导语",
    `最近“${topicTitle}”被很多人反复提起，但我不想只把它当成一个信息点来讲。更重要的是，它背后反映了一个正在发生的判断变化。`,
    "",
    "一、先把问题摆正",
    whyNow,
    "",
    "很多内容会停留在表层：发生了什么、谁说了什么、现在是不是热点。但真正对用户有价值的，是把这件事放回自己的现实处境里，判断它到底影响什么。",
    "",
    "二、真正值得关注的不是热度，而是选择逻辑",
    topicSummary,
    "",
    "如果只看热度，很容易被信息推着走；如果先建立判断顺序，就能更稳定地做选择。",
    "",
    "三、为什么这个题目适合我来讲",
    fitReason,
    "",
    `我希望这类内容保持一个底层风格：${styleSummary}`,
    "",
    "四、给读者的行动建议",
    "你可以先不用急着做决定，先把自己的问题写下来：我现在最关心什么？我最担心什么？我能接受什么边界？这三个问题想清楚，后面的选择会简单很多。",
    "",
    "结尾",
    "如果你想看更具体的拆解，我后续会继续把这个主题做成系列内容，一次只讲透一个问题。",
  ].join("\n");

  const livestreamScript = [
    `直播主题：${title}`,
    "",
    "直播目标：",
    `围绕“${topicTitle}”做一场能建立信任的直播，不只讲信息，而是带观众完成一轮判断。`,
    "",
    "开场 3 分钟：",
    `今天不做泛泛科普，我先说我的判断：${whyNow}`,
    "",
    "第一段：先讲清问题",
    topicSummary,
    "",
    "第二段：讲用户最容易误判的地方",
    "把常见误区拆成 2-3 个具体场景，尽量用用户听得懂的话，不堆概念。",
    "",
    "第三段：给判断框架",
    `核心判断：${fitReason}`,
    "",
    "互动问题：",
    "1. 你现在最想搞清楚的是风险、机会，还是具体怎么做？",
    "2. 你希望我下一场更偏案例，还是更偏方法？",
    "3. 你遇到过哪个最纠结的具体场景？",
    "",
    "收尾：",
    "今天先不把所有问题讲满，我们先把判断顺序建立起来。下一场我会挑最典型的问题继续拆。",
  ].join("\n");

  return {
    XHS_POST: xhsPost,
    SHORT_VIDEO_SCRIPT: shortVideoScript,
    WECHAT_ARTICLE: wechatArticle,
    LIVESTREAM_SCRIPT: livestreamScript,
  } as const;
}
