import Link from "next/link";
import { ClusterResearchCreateButton } from "@/components/cluster-research-create-button";
import { ResearchCardCreateButton } from "@/components/research-card-create-button";
import { buildCandidateClusterBrief } from "@/lib/candidate-briefs";
import { getSignals } from "@/lib/data";

export default async function CandidatesPage() {
  const signals = await getSignals();
  const candidates = signals.filter((signal) => signal.status === "CANDIDATE");
  const groupedCandidates = candidates.reduce<Record<string, typeof candidates>>((accumulator, signal) => {
    const key = signal.primaryObservationCluster;
    accumulator[key] = accumulator[key] ? [...accumulator[key], signal] : [signal];
    return accumulator;
  }, {});
  const orderedGroups = Object.entries(groupedCandidates).sort((left, right) => right[1].length - left[1].length);

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <p className="section-kicker">候选池</p>
        <h2 className="section-title mt-2">把零散候选收束成少数几个明确主题</h2>
        <p className="section-desc mt-3">
          候选池不应该变成积压清单。这个页面的目的，是逼你做出少量清晰的推进决策。
        </p>
      </section>

      {candidates.length ? (
        <section className="space-y-5">
          {orderedGroups.map(([cluster, clusterSignals]) => (
            <div className="panel space-y-5 px-6 py-5" key={cluster}>
              {(() => {
                const brief = buildCandidateClusterBrief(cluster, clusterSignals);

                return (
                  <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">主观察簇</p>
                  <h3 className="text-2xl font-semibold">{cluster}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="pill">{clusterSignals.length} 条候选</span>
                  <ClusterResearchCreateButton primaryObservationCluster={cluster} />
                </div>
              </div>
              <div className="subpanel px-5 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">选题摘要</p>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                  <p>{brief.topicLine}</p>
                  <p>{brief.timingLine}</p>
                  <p className="text-sky-100">{brief.actionLine}</p>
                </div>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                {clusterSignals.map((signal) => (
                  <div className="subpanel px-5 py-5" key={signal.id}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="pill">{signal.motherTheme}</span>
                      <span className="pill">重要性 {signal.importanceScore.toFixed(1)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="pill">{signal.primaryObservationCluster}</span>
                      {signal.secondaryObservationCluster ? <span className="pill">{signal.secondaryObservationCluster}</span> : null}
                    </div>
                    <div className="mt-4">
                      <h4 className="text-xl font-semibold leading-7">{signal.title}</h4>
                      <p className="muted mt-2 text-sm leading-6">{signal.reasoningSummary}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link className="pill hover:border-sky-300 hover:text-white" href={`/signals/${signal.id}`}>
                        复核信号
                      </Link>
                      <ResearchCardCreateButton signalId={signal.id} />
                    </div>
                  </div>
                ))}
              </div>
                  </>
                );
              })()}
            </div>
          ))}
        </section>
      ) : (
        <section className="panel px-6 py-8">
          <p className="text-lg font-semibold">当前还没有候选。</p>
          <p className="muted mt-2 max-w-2xl text-sm leading-6">
            只有在复核动作把信号推进到 <code>CANDIDATE</code> 状态后，它才会出现在这里。
            先去信号流保留最强的条目，再把它们推进到今天的工作集。
          </p>
          <div className="mt-4">
            <Link className="pill hover:border-sky-300 hover:text-white" href="/signals">
              打开信号流
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
