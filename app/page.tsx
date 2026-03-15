import Link from "next/link";
import { buildCandidateClusterBrief } from "@/lib/candidate-briefs";
import { getDraftsByResearchCardId, getFalseNegativeCalibration, getResearchCardPreview, getSignals } from "@/lib/data";

export default async function HomePage() {
  const [signals, falseNegatives, latestResearchCard] = await Promise.all([
    getSignals(),
    getFalseNegativeCalibration(),
    getResearchCardPreview(),
  ]);

  const newSignals = signals.filter((signal) => signal.status === "NEW").slice(0, 5);
  const candidateSignals = signals.filter((signal) => signal.status === "CANDIDATE");
  const groupedCandidates = candidateSignals.reduce<Record<string, typeof candidateSignals>>((accumulator, signal) => {
    const key = signal.primaryObservationCluster;
    accumulator[key] = accumulator[key] ? [...accumulator[key], signal] : [signal];
    return accumulator;
  }, {});
  const todayThemes = Object.entries(groupedCandidates)
    .sort((left, right) => right[1].length - left[1].length)
    .slice(0, 3);

  const latestResearchCardId = "id" in latestResearchCard ? latestResearchCard.id : null;
  const latestDrafts = latestResearchCardId ? await getDraftsByResearchCardId(latestResearchCardId) : [];
  const totalSignals = signals.length;
  const reviewQueue = falseNegatives.watchCandidates.length + falseNegatives.prioritizeCandidates.length;

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <p className="section-kicker">今日工作台</p>
        <h2 className="section-title mt-2">从今天最值得做的动作开始</h2>
        <p className="section-desc mt-3">
          这个页面把今天的工作路径压缩到一个视图里：先扫什么、先复核什么、哪个观察簇正在升温、哪些产出已经接近可发布状态。
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="metric-card">
            <p className="metric-label">待扫信号</p>
            <p className="metric-value">{newSignals.length}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">候选主题</p>
            <p className="metric-value">{todayThemes.length}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">待复核</p>
            <p className="metric-value">{reviewQueue}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">总信号量</p>
            <p className="metric-value">{totalSignals}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="panel px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="metric-label">今日摄取</p>
              <h3 className="text-2xl font-semibold">先扫这里</h3>
            </div>
            <Link className="action-link" href="/signals">
              进入信号流
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {newSignals.length ? (
              newSignals.map((signal) => (
                <Link className="subpanel px-4 py-4 transition hover:border-white/20" href={`/signals/${signal.id}`} key={signal.id}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium leading-6">{signal.title}</p>
                    <span className="pill shrink-0">{signal.primaryObservationCluster}</span>
                  </div>
                  <p className="muted mt-3 text-sm leading-6">{signal.reasoningSummary}</p>
                </Link>
              ))
            ) : (
              <p className="muted text-sm">当前没有等待处理的新信号。</p>
            )}
          </div>
        </div>

        <div className="panel px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="metric-label">今日复核</p>
              <h3 className="text-2xl font-semibold">先复核这里</h3>
            </div>
            <Link className="action-link" href="/reviews">
              进入校准台
            </Link>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="subpanel px-4 py-4">
              <p className="text-sm font-semibold">可能应该提升到“观察”</p>
              <p className="muted mt-2 text-sm">{falseNegatives.watchCandidates.length} 条信号可能被压得过低。</p>
            </div>
            <div className="subpanel px-4 py-4">
              <p className="text-sm font-semibold">可能应该提升到“优先”</p>
              <p className="muted mt-2 text-sm">{falseNegatives.prioritizeCandidates.length} 条信号可能值得上调。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="metric-label">今日主题</p>
            <h3 className="text-2xl font-semibold">正在升温的观察簇</h3>
          </div>
          <Link className="action-link" href="/candidates">
            进入候选池
          </Link>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          {todayThemes.length ? (
            todayThemes.map(([cluster, clusterSignals]) => {
              const brief = buildCandidateClusterBrief(cluster, clusterSignals);

              return (
                <div className="subpanel px-5 py-5" key={cluster}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold">{cluster}</p>
                    <span className="pill">{clusterSignals.length}</span>
                  </div>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                    <p>{brief.topicLine}</p>
                    <p>{brief.timingLine}</p>
                    <p className="text-sky-100">{brief.actionLine}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="muted text-sm">当前还没有候选观察簇。</p>
          )}
        </div>
      </section>

      <section className="panel px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="metric-label">今日产出</p>
            <h3 className="text-2xl font-semibold">离发布最近的一步</h3>
          </div>
          {latestResearchCardId ? (
            <Link className="action-link" href={`/drafts/${latestResearchCardId}`}>
              进入草稿区
            </Link>
          ) : null}
        </div>
        {latestResearchCard ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="subpanel px-5 py-5">
              <p className="text-lg font-semibold">{latestResearchCard.title}</p>
              <p className="muted mt-2 text-sm leading-6">{latestResearchCard.positioningJudgment ?? latestResearchCard.eventDefinition}</p>
            </div>
            <div className="subpanel px-5 py-5">
              <p className="text-sm font-semibold">草稿状态</p>
              <p className="muted mt-2 text-sm">这张研究卡当前已生成 {latestDrafts.length} 份草稿资产。</p>
            </div>
          </div>
        ) : (
          <p className="muted mt-4 text-sm">当前还没有研究卡。先把候选信号或观察簇推进到研究阶段。</p>
        )}
      </section>
    </main>
  );
}
