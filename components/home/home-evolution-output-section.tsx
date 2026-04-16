import Link from "next/link";
import { getHomepageEvolutionOutputData } from "@/lib/services/homepage-service";

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

export async function HomeEvolutionOutputSection() {
  const workspace = await getHomepageEvolutionOutputData();

  return (
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
  );
}
