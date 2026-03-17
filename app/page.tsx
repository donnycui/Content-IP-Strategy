import Link from "next/link";
import { getTodayWorkspace } from "@/lib/today-data";

export const dynamic = "force-dynamic";

const directionPriorityLabels = {
  PRIMARY: "主方向",
  SECONDARY: "第二方向",
  WATCH: "观察方向",
} as const;

const formatLabels = {
  SINGLE_POST: "单条快判断",
  RECURRING_TRACK: "连续主题跟踪",
  SERIES_ENTRY: "专题系列入口",
} as const;

const suggestionTypeLabels = {
  CORE_THEME: "核心议题更新",
  CONTENT_BOUNDARY: "内容边界更新",
  CURRENT_STAGE: "成长阶段更新",
  POSITIONING: "定位更新",
  PERSONA: "人设更新",
  AUDIENCE: "受众更新",
  VOICE_STYLE: "表达风格更新",
  GROWTH_GOAL: "增长目标更新",
  DIRECTION_WEIGHT: "方向权重更新",
} as const;

export default async function HomePage() {
  const workspace = await getTodayWorkspace();

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <p className="section-kicker">今日工作台</p>
        <h2 className="section-title mt-2">围绕你的画像，决定今天该往哪走、讲什么、调整什么</h2>
        <p className="section-desc mt-3">
          这个页面不再只是内容后台，而是你的创作者操作台。它先回答“你是谁、该押哪条方向、今天讲什么”，再把信号和产出放回执行层。
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="metric-card">
            <p className="metric-label">当前方向</p>
            <p className="metric-value">{workspace.directions.length}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">活跃主题线</p>
            <p className="metric-value">{workspace.topics.length}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">今日选题</p>
            <p className="metric-value">{workspace.topicCandidates.length}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">待确认进化建议</p>
            <p className="metric-value">{workspace.pendingSuggestions.length}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="panel px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="metric-label">当前画像</p>
              <h3 className="text-2xl font-semibold">今天先记住你是谁</h3>
            </div>
            <Link className="action-link" href="/profile">
              查看画像
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            <div className="subpanel px-4 py-4">
              <p className="text-sm font-semibold text-slate-700">定位</p>
              <p className="muted mt-2 text-sm leading-7">{workspace.profile.positioning}</p>
            </div>
            <div className="subpanel px-4 py-4">
              <p className="text-sm font-semibold text-slate-700">当前阶段</p>
              <p className="muted mt-2 text-sm leading-7">{workspace.profile.currentStage}</p>
            </div>
            <div className="subpanel px-4 py-4">
              <p className="text-sm font-semibold text-slate-700">增长目标</p>
              <p className="muted mt-2 text-sm leading-7">{workspace.profile.growthGoal}</p>
            </div>
          </div>
        </div>

        <div className="panel px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="metric-label">今日方向</p>
              <h3 className="text-2xl font-semibold">未来 2 到 4 周先押哪几条</h3>
            </div>
            <Link className="action-link" href="/directions">
              进入方向台
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {workspace.directions.length ? (
              workspace.directions.map((direction) => (
                <div className="subpanel px-4 py-4" key={direction.id}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold leading-6">{direction.title}</p>
                    <span className="pill shrink-0">{directionPriorityLabels[direction.priority]}</span>
                  </div>
                  <p className="muted mt-2 text-sm leading-7">{direction.whyNow}</p>
                </div>
              ))
            ) : (
              <p className="muted text-sm">当前还没有方向建议。</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="panel px-6 py-5">
        <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="metric-label">今日主题</p>
              <h3 className="text-2xl font-semibold">哪些主题线正在积累</h3>
            </div>
          <Link className="action-link" href="/topics">
            进入主题台
          </Link>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {workspace.topics.length ? (
            workspace.topics.map((topic) => {
              return (
                <div className="subpanel px-5 py-5" key={topic.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold">{topic.title}</p>
                    <span className="pill">{topic.signalCount}</span>
                  </div>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                    <p>{topic.summary}</p>
                    <p className="text-sky-800">先围绕这条主题线组织选题，再决定是否推进成连续表达。</p>
                  </div>
                  <div className="mt-3">
                    <span className="pill">{topic.primaryObservationCluster}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="muted text-sm">当前还没有候选主题线。</p>
          )}
        </div>
        </div>

        <div className="panel px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="metric-label">今日选题</p>
              <h3 className="text-2xl font-semibold">今天真正值得推进的内容动作</h3>
            </div>
            <Link className="action-link" href="/candidates">
              进入选题台
            </Link>
          </div>
          <div className="mt-4 grid gap-4">
            {workspace.topicCandidates.length ? (
              workspace.topicCandidates.map((candidate) => (
                <div className="subpanel px-5 py-5" key={candidate.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="pill">{formatLabels[candidate.formatRecommendation]}</span>
                      <span className="pill">{directionPriorityLabels[candidate.priority]}</span>
                    </div>
                    <span className="pill">{candidate.directionTitle ?? "未归入方向"}</span>
                  </div>
                  <h4 className="mt-3 text-lg font-semibold leading-7">{candidate.title}</h4>
                  <p className="muted mt-2 text-sm leading-7">{candidate.whyNow}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{candidate.fitReason}</p>
                </div>
              ))
            ) : (
              <p className="muted text-sm">当前还没有选题建议。</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="panel px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="metric-label">待确认进化建议</p>
              <h3 className="text-2xl font-semibold">系统认为你正在发生的变化</h3>
            </div>
            <Link className="action-link" href="/evolution">
              进入进化建议
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {workspace.pendingSuggestions.length ? (
              workspace.pendingSuggestions.map((suggestion) => (
                <div className="subpanel px-4 py-4" key={suggestion.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{suggestionTypeLabels[suggestion.type] ?? suggestion.type}</p>
                    <span className="pill">置信度 {(suggestion.confidence ?? 0).toFixed(2)}</span>
                  </div>
                  <p className="muted mt-2 text-sm leading-7">{suggestion.reason}</p>
                </div>
              ))
            ) : (
              <p className="muted text-sm">当前还没有待确认的画像进化建议。</p>
            )}
          </div>
        </div>

        <div className="panel px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="metric-label">执行层</p>
              <h3 className="text-2xl font-semibold">信号和产出仍然在这里落地</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="action-link" href="/signals">
                进入信号流
              </Link>
              {workspace.output?.latestResearchCardId ? (
                <Link className="action-link" href={`/drafts/${workspace.output.latestResearchCardId}`}>
                  进入草稿区
                </Link>
              ) : null}
            </div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="subpanel px-4 py-4">
              <p className="text-sm font-semibold text-slate-700">待扫新信号</p>
              <p className="mt-2 text-3xl font-semibold">{workspace.signals.newSignals.length}</p>
              <p className="muted mt-2 text-sm leading-7">总信号量 {workspace.signals.total}。执行层继续负责摄取和初筛。</p>
            </div>
            <div className="subpanel px-4 py-4">
              <p className="text-sm font-semibold text-slate-700">已保留选题</p>
              <p className="mt-2 text-3xl font-semibold">{workspace.keptRecommendationsCount}</p>
              <p className="muted mt-2 text-sm leading-7">这些是你已经确认值得推进的内容动作。</p>
            </div>
          </div>
          {workspace.output?.latestResearchCard ? (
            <div className="subpanel mt-4 px-5 py-5">
              <p className="text-sm font-semibold text-slate-700">最近研究产出</p>
              <p className="mt-2 text-lg font-semibold">{workspace.output.latestResearchCard.title}</p>
              <p className="muted mt-2 text-sm leading-7">
                {workspace.output.latestResearchCard.positioningJudgment ?? workspace.output.latestResearchCard.eventDefinition}
              </p>
              <p className="muted mt-3 text-sm">当前已生成 {workspace.output.latestDraftsCount} 份草稿资产。</p>
            </div>
          ) : (
            <div className="subpanel mt-4 px-5 py-5">
              <p className="text-sm font-semibold text-slate-700">最近研究产出</p>
              <p className="muted mt-2 text-sm leading-7">当前还没有研究卡。先从选题台推进一个最强选题进入研究。</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
