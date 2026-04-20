import { LearningGenerateButton } from "@/components/learning/learning-generate-button";
import { getLearningInsightsDashboard } from "@/lib/services/proactive-learning-service";

export async function LearningInsightsPanel() {
  const dashboard = await getLearningInsightsDashboard();
  const visibleInsights = dashboard.insights.slice(0, 3);

  return (
    <section className="panel px-6 py-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="section-kicker">System Observations</p>
            <h2 className="section-title">系统最近关注的热点和趋势。</h2>
            <p className="section-desc">首页只给结论，不给一堆搜索结果。详细研究放到“方向与选题”和“升级进化”里。</p>
          </div>
          <LearningGenerateButton />
        </div>

        {dashboard.activeMemorySummary ? (
          <div className="subpanel px-4 py-4">
            <p className="text-sm font-semibold text-slate-800">当前已写入长期记忆的学习摘要</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{dashboard.activeMemorySummary}</p>
            {dashboard.activeMemoryDetail ? <p className="muted mt-3 text-sm leading-7">{dashboard.activeMemoryDetail}</p> : null}
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-3">
          {visibleInsights.map((insight) => (
            <div className="subpanel px-4 py-4" key={insight.title}>
              <div className="flex flex-wrap gap-2">
                <span className="pill">{insight.kind}</span>
              </div>
              <p className="mt-3 text-base font-semibold text-slate-800">{insight.title}</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{insight.summary}</p>
              <p className="muted mt-3 text-sm leading-7">{insight.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
