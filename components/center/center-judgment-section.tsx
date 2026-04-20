import Link from "next/link";
import type { CenterJudgmentPayload, CenterMetricPayload } from "@/lib/domain/contracts";

export function CenterJudgmentSection({
  data,
  metrics,
}: {
  data: CenterJudgmentPayload;
  metrics: CenterMetricPayload[];
}) {
  return (
    <section className="panel px-6 py-6">
      <div className="grid gap-6 xl:grid-cols-[1.4fr,0.6fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="pill pill-active">当前阶段 · {data.stageLabel}</span>
            <span className="pill">今天先做这一件事</span>
          </div>
          <div className="space-y-3">
            <p className="section-kicker">Creator Workflow</p>
            <h2 className="section-title max-w-4xl">{data.title}</h2>
            <p className="section-desc">{data.description}</p>
            <p className="muted max-w-3xl text-sm leading-7">原因：{data.reason}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-2xl border border-sky-400/35 bg-sky-400/12 px-5 py-3 text-sm font-medium text-slate-800 transition hover:border-sky-400 hover:bg-sky-400/18"
              href={data.primaryAction.href}
            >
              {data.primaryAction.label}
            </Link>
            <Link
              className="rounded-2xl border border-slate-300/60 bg-white/60 px-5 py-3 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-white"
              href={data.secondaryAction.href}
            >
              {data.secondaryAction.label}
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {metrics.map((metric) => (
            <div className="metric-card" key={metric.label}>
              <p className="metric-label">{metric.label}</p>
              <p className="metric-value">{metric.value}</p>
              <p className="muted mt-3 text-sm leading-6">{metric.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
