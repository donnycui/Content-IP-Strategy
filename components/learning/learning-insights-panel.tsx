import { LearningGenerateButton } from "@/components/learning/learning-generate-button";
import { getLearningInsightsDashboard } from "@/lib/services/proactive-learning-service";

export async function LearningInsightsPanel() {
  const dashboard = await getLearningInsightsDashboard();

  return (
    <section className="panel px-6 py-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="section-kicker">Proactive Learning</p>
            <h2 className="section-title">系统正在自己学什么，接下来又想追什么。</h2>
            <p className="section-desc">
              这层会把热点、风格观察和未来跟踪方向沉淀成长期洞察。第一版先用现有信号、主题、复盘和 style skill 推出基础结论，后续再接更完整的外部研究能力。
            </p>
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
          {dashboard.insights.map((insight) => (
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
