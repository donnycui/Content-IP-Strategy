import Link from "next/link";
import { getHomepageTopicsCandidatesData } from "@/lib/services/homepage-service";

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

export async function HomeTopicsCandidatesSection() {
  const { topics, topicCandidates } = await getHomepageTopicsCandidatesData();

  return (
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
          {topics.length ? (
            topics.map((topic) => (
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
            ))
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
          {topicCandidates.length ? (
            topicCandidates.map((candidate) => (
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
  );
}
