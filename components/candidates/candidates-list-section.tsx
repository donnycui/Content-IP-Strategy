import Link from "next/link";
import { ResearchCardCreateButton } from "@/components/research-card-create-button";
import { TopicCandidateStatusActions } from "@/components/topic-candidate-status-actions";
import { getTopicCandidates } from "@/lib/topic-candidate-data";

const priorityLabels = {
  PRIMARY: "优先推进",
  SECONDARY: "重点跟进",
  WATCH: "继续观察",
} as const;

const statusLabels = {
  NEW: "新建议",
  KEPT: "已保留",
  DEFERRED: "已延后",
  REJECTED: "已忽略",
} as const;

const formatLabels = {
  SINGLE_POST: "单条快判断",
  RECURRING_TRACK: "连续主题跟踪",
  SERIES_ENTRY: "专题系列入口",
} as const;

export async function CandidatesListSection() {
  const candidates = await getTopicCandidates();

  const groupedCandidates = candidates.reduce<Record<string, typeof candidates>>((accumulator, candidate) => {
    const key = candidate.directionTitle ?? "未归入方向";
    accumulator[key] = accumulator[key] ? [...accumulator[key], candidate] : [candidate];
    return accumulator;
  }, {});

  const orderedGroups = Object.entries(groupedCandidates).sort((left, right) => right[1].length - left[1].length);

  if (!candidates.length) {
    return (
      <section className="panel px-6 py-8">
        <p className="text-lg font-semibold">当前还没有选题建议。</p>
        <p className="muted mt-2 max-w-2xl text-sm leading-6">
          先在主题台生成主题线，再点击“刷新选题建议”。这一步会把方向、主题线和支撑信号一起压缩成今天真正可执行的选题列表。
        </p>
        <div className="mt-4">
          <Link className="pill hover:border-sky-400 hover:text-slate-800" href="/agents/topic-direction">
            留在方向与选题 Agent
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {orderedGroups.map(([directionTitle, topicCandidates]) => (
        <div className="panel space-y-5 px-6 py-5" key={directionTitle}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">关联方向</p>
              <h3 className="text-2xl font-semibold">{directionTitle}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="pill">{topicCandidates.length} 条选题建议</span>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {topicCandidates.map((candidate) => (
              <div className="subpanel space-y-4 px-5 py-5" key={candidate.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="pill">{priorityLabels[candidate.priority]}</span>
                    <span className="pill">{formatLabels[candidate.formatRecommendation]}</span>
                    <span className="pill">{statusLabels[candidate.status]}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-semibold leading-7">{candidate.title}</h4>
                  <p className="muted text-sm leading-7">{candidate.topicSummary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidate.primaryObservationCluster ? <span className="pill">{candidate.primaryObservationCluster}</span> : null}
                  {candidate.secondaryObservationCluster ? <span className="pill">{candidate.secondaryObservationCluster}</span> : null}
                </div>
                <div className="subpanel px-4 py-4">
                  <p className="text-sm font-semibold text-slate-700">为什么现在值得讲</p>
                  <p className="muted mt-2 text-sm leading-7">{candidate.whyNow}</p>
                </div>
                <div className="subpanel px-4 py-4">
                  <p className="text-sm font-semibold text-slate-700">为什么适合你来讲</p>
                  <p className="muted mt-2 text-sm leading-7">{candidate.fitReason}</p>
                </div>
                {candidate.anchorSignalTitle ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">推荐切入口</p>
                    <p className="muted text-sm leading-7">{candidate.anchorSignalTitle}</p>
                  </div>
                ) : null}
                <TopicCandidateStatusActions candidateId={candidate.id} currentStatus={candidate.status} />
                <div className="flex flex-wrap gap-3">
                  {candidate.anchorSignalId ? (
                    <>
                      <ResearchCardCreateButton signalId={candidate.anchorSignalId} />
                    </>
                  ) : (
                    <Link className="pill hover:border-sky-400 hover:text-slate-800" href="/agents/topic-direction">
                      查看当前工作区
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
