import type { StyleSkillDashboardPayload } from "@/lib/domain/contracts";

export function StyleSkillSummary({ dashboard }: { dashboard: StyleSkillDashboardPayload }) {
  const { skill, samples, revisions } = dashboard;

  return (
    <section className="panel px-6 py-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="section-kicker">Style Skill</p>
            <h2 className="section-title">把“去 AI 味”变成持续演化的个人风格资产</h2>
            <p className="section-desc">
              这里不是一次性提示词，而是一个会随着样本和手改稿持续更新的 style skill。后续内容生产会围绕它来生成图文、短视频和直播脚本。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="pill">{skill.status}</span>
            <span className="pill">样本 {skill.sampleCount}</span>
            <span className="pill">修订 {skill.revisionCount}</span>
            <span className="pill">版本 {skill.version}</span>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
          <div className="subpanel px-4 py-4">
            <p className="text-sm font-semibold text-slate-800">当前风格摘要</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{skill.summary}</p>
          </div>
          <div className="subpanel px-4 py-4">
            <p className="text-sm font-semibold text-slate-800">当前规则</p>
            <pre className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{skill.rulesMarkdown}</pre>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="subpanel px-4 py-4">
            <p className="text-sm font-semibold text-slate-800">最近样本</p>
            {samples.length ? (
              <div className="mt-3 space-y-3">
                {samples.map((sample) => (
                  <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3" key={sample.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">{sample.title}</p>
                      {sample.sourceLabel ? <span className="pill">{sample.sourceLabel}</span> : null}
                    </div>
                    <p className="muted mt-2 line-clamp-4 text-sm leading-7">{sample.sampleText}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted mt-3 text-sm leading-7">当前还没有正式风格样本，先录入你最满意的原创文案作为第一批参照物。</p>
            )}
          </div>

          <div className="subpanel px-4 py-4">
            <p className="text-sm font-semibold text-slate-800">最近修订信号</p>
            {revisions.length ? (
              <div className="mt-3 space-y-3">
                {revisions.map((revision) => (
                  <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3" key={revision.id}>
                    <p className="text-sm font-medium text-slate-800">{revision.ruleDelta || "已记录一条手改修订信号"}</p>
                    <p className="muted mt-2 text-xs leading-6">
                      初稿 {revision.draftText.length} 字 / 手改稿 {revision.revisedText.length} 字
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted mt-3 text-sm leading-7">当前还没有“AI 初稿 vs 你的手改稿”对比记录。后续这些差异会成为 style skill 最重要的迭代燃料。</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
