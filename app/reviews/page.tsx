import Link from "next/link";
import { getFalseNegativeCalibration, getReviewCalibrationRows, getReviewCalibrationSummary } from "@/lib/data";

export const dynamic = "force-dynamic";

const priorityLabels: Record<string, string> = {
  PRIORITIZE: "优先推进",
  WATCH: "持续观察",
  DEPRIORITIZE: "降低优先级",
};

const reviewStatusLabels: Record<string, string> = {
  PENDING: "待处理",
  KEPT: "保留",
  DEFERRED: "延后",
  REJECTED: "忽略",
};

const reasoningAcceptanceLabels: Record<string, string> = {
  ACCEPTED: "接受",
  PARTIAL: "部分接受",
  REJECTED: "不接受",
};

const failureReasonLabels: Record<string, string> = {
  "Thin signal": "信息过薄",
  "Routine news misread": "把日常公司新闻误判成重要信号",
  "Consensus missed": "忽略了共识已经形成",
  "Weak spillover": "高估了外溢效应",
  "Angle inflation": "高估了可讲性",
  "Theme mismatch": "母命题匹配失真",
};

function formatDelta(value: number | null) {
  if (value == null) {
    return "-";
  }

  const rounded = value.toFixed(1);
  return value > 0 ? `+${rounded}` : rounded;
}

function deltaTone(value: number | null) {
  if (value == null || Math.abs(value) < 0.6) {
    return "text-slate-300";
  }

  return Math.abs(value) >= 1.5 ? "text-amber-200" : "text-sky-200";
}

export default async function ReviewsPage() {
  const [rows, summary, falseNegatives] = await Promise.all([
    getReviewCalibrationRows(),
    getReviewCalibrationSummary(),
    getFalseNegativeCalibration(),
  ]);

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-sky-200">校准台</p>
          <h2 className="text-3xl font-semibold">AI 与人工复核偏差</h2>
          <p className="muted max-w-3xl text-sm">
            这个页面用来识别评分模型在哪些地方高估了重要性、漏掉了公司日常噪音，或者在共识已形成的情况下仍把信号排得过高。
            这些偏差会成为后续学习与校准的原始材料。
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="panel space-y-2 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">重要性高估</p>
          <p className="text-3xl font-semibold">{summary.importanceOverScored}</p>
          <p className="muted text-sm">AI 对重要性的判断至少高出人工 {summary.threshold.toFixed(1)} 分。</p>
        </div>
        <div className="panel space-y-2 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">观点潜力高估</p>
          <p className="text-3xl font-semibold">{summary.viewpointOverScored}</p>
          <p className="muted text-sm">AI 认为某条信号更适合形成差异化观点，但人工并不认同。</p>
        </div>
        <div className="panel space-y-2 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">日常噪音识别不足</p>
          <p className="text-3xl font-semibold">{summary.routineUnderDetected}</p>
          <p className="muted text-sm">人工复核认为，这条信号更像普通公司日常新闻。</p>
        </div>
        <div className="panel space-y-2 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">共识强度识别不足</p>
          <p className="text-3xl font-semibold">{summary.consensusUnderDetected}</p>
          <p className="muted text-sm">AI 没识别出主流叙事已经高度收敛。</p>
        </div>
        <div className="panel space-y-2 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">优先级误推</p>
          <p className="text-3xl font-semibold">{summary.priorityFalsePositives}</p>
          <p className="muted text-sm">AI 把信号推得太靠前，而人工后续把它压了下来。</p>
        </div>
      </section>

      <section className="panel px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">校准摘要</p>
            <p className="text-lg font-semibold">{summary.mostCommonFailure}</p>
          </div>
          <p className="muted text-sm">样本量：{summary.sampleSize} 条人工复核</p>
        </div>
      </section>

      <section className="panel px-6 py-5">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">AI 为什么会高估</p>
            <p className="text-lg font-semibold">自动归因分布</p>
          </div>
          {summary.topFailureReasons.length ? (
            <div className="flex flex-wrap gap-3">
              {summary.topFailureReasons.map((reason) => (
                <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3" key={reason.label}>
                  <p className="text-sm font-medium">{failureReasonLabels[reason.label] ?? reason.label}</p>
                  <p className="muted mt-1 text-sm">{reason.count} 条已标记复核</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted text-sm">暂时还没有足够的自动归因样本，人工复核数据仍然偏少。</p>
          )}
        </div>
      </section>

      <section className="panel px-6 py-5">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Prompt 指南</p>
            <p className="text-lg font-semibold">在这些情况下延后给出“优先推进”</p>
          </div>
          <div className="grid gap-3">
            {summary.delayPrioritizeGuidance.map((guidance) => (
              <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm leading-6" key={guidance}>
                {guidance}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="panel px-6 py-5">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">漏判检查</p>
              <p className="text-lg font-semibold">这些条目是否应该从“降低优先级”提升到“持续观察”？</p>
            </div>
            <div className="grid gap-3">
              {falseNegatives.watchCandidates.length ? (
                falseNegatives.watchCandidates.map((row) => (
                  <Link
                    className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 transition hover:border-white/20"
                    href={`/signals/${row.signalId}`}
                    key={row.signalId}
                  >
                    <p className="text-sm font-medium">{row.title}</p>
                    <p className="muted mt-1 text-sm">{row.source}</p>
                    <p className="muted mt-2 text-sm">
                      重 {row.importanceScore.toFixed(1)} / 观 {row.viewpointScore.toFixed(1)} / 共 {row.consensusStrength.toFixed(1)} / 噪{" "}
                      {row.companyRoutineScore.toFixed(1)}
                    </p>
                    <p className="muted mt-2 text-sm leading-6">{row.reasoningSummary}</p>
                  </Link>
                ))
              ) : (
                <p className="muted text-sm">在最新评分集合里，暂时没有明显应该提升到“持续观察”的漏判。</p>
              )}
            </div>
          </div>
        </div>

        <div className="panel px-6 py-5">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">漏判检查</p>
              <p className="text-lg font-semibold">这些条目是否应该从“持续观察”提升到“优先推进”？</p>
            </div>
            <div className="grid gap-3">
              {falseNegatives.prioritizeCandidates.length ? (
                falseNegatives.prioritizeCandidates.map((row) => (
                  <Link
                    className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 transition hover:border-white/20"
                    href={`/signals/${row.signalId}`}
                    key={row.signalId}
                  >
                    <p className="text-sm font-medium">{row.title}</p>
                    <p className="muted mt-1 text-sm">{row.source}</p>
                    <p className="muted mt-2 text-sm">
                      重 {row.importanceScore.toFixed(1)} / 观 {row.viewpointScore.toFixed(1)} / 共 {row.consensusStrength.toFixed(1)} / 噪{" "}
                      {row.companyRoutineScore.toFixed(1)}
                    </p>
                    <p className="muted mt-2 text-sm leading-6">{row.reasoningSummary}</p>
                  </Link>
                ))
              ) : (
                <p className="muted text-sm">在最新评分集合里，暂时没有明显应该提升到“优先推进”的漏判。</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="grid grid-cols-[1.7fr,0.9fr,0.9fr,0.9fr,0.9fr,1fr,1fr] gap-3 border-b border-white/10 px-5 py-3 text-xs uppercase tracking-[0.22em] text-slate-400">
          <span>信号</span>
          <span>AI</span>
          <span>人工</span>
          <span>偏差</span>
          <span>优先级</span>
          <span>接受度</span>
          <span>备注</span>
        </div>
        <div>
          {rows.length ? (
            rows.map((row) => (
              <div
                className="grid grid-cols-[1.7fr,0.9fr,0.9fr,0.9fr,0.9fr,1fr,1fr] gap-3 border-b border-white/5 px-5 py-4 transition hover:bg-white/5"
                key={row.id}
              >
                <div className="space-y-2">
                  <Link className="text-sm font-medium leading-6 hover:text-sky-200" href={`/signals/${row.signalId}`}>
                    {row.title}
                  </Link>
                  <p className="muted text-sm">{row.source}</p>
                  <p className="muted text-xs">{row.createdAt}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p>重 {row.ai.importance.toFixed(1)}</p>
                  <p>观 {row.ai.viewpoint.toFixed(1)}</p>
                  <p>共 {row.ai.consensus?.toFixed(1) ?? "-"}</p>
                  <p>噪 {row.ai.routine?.toFixed(1) ?? "-"}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p>重 {row.human.importance?.toFixed(1) ?? "-"}</p>
                  <p>观 {row.human.viewpoint?.toFixed(1) ?? "-"}</p>
                  <p>共 {row.human.consensus?.toFixed(1) ?? "-"}</p>
                  <p>噪 {row.human.routine?.toFixed(1) ?? "-"}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p className={deltaTone(row.delta.importance)}>重 {formatDelta(row.delta.importance)}</p>
                  <p className={deltaTone(row.delta.viewpoint)}>观 {formatDelta(row.delta.viewpoint)}</p>
                  <p className={deltaTone(row.delta.consensus)}>共 {formatDelta(row.delta.consensus)}</p>
                  <p className={deltaTone(row.delta.routine)}>噪 {formatDelta(row.delta.routine)}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="pill">{priorityLabels[row.ai.priority] ?? row.ai.priority}</p>
                  <p className="pill">{row.human.priority ? priorityLabels[row.human.priority] ?? row.human.priority : "-"}</p>
                  <p className="muted text-xs">{row.ai.modelName}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p>{reviewStatusLabels[row.reviewStatus] ?? row.reviewStatus}</p>
                  <p className="muted">{row.reasoningAcceptance ? reasoningAcceptanceLabels[row.reasoningAcceptance] ?? row.reasoningAcceptance : "-"}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="muted leading-6">{row.reviewNote ?? "暂无复核备注。"}</p>
                  <p className="muted leading-6">{row.myAngle ?? "暂无个人切入角度。"}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {row.failureReasons.length ? (
                      row.failureReasons.map((reason) => (
                        <span className="pill" key={reason}>
                          {failureReasonLabels[reason] ?? reason}
                        </span>
                      ))
                    ) : (
                      <span className="muted text-xs">暂未推断出归因原因。</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-8 text-sm text-slate-300">当前还没有人工复核。先去任意信号详情页保存一条人工校正，才能开始校准追踪。</div>
          )}
        </div>
      </section>
    </main>
  );
}
