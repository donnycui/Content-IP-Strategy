import Link from "next/link";
import { TopicGenerateButton } from "@/components/topic-generate-button";
import { getDirections } from "@/lib/direction-data";
import { getActiveCreatorProfile, mockCreatorProfile } from "@/lib/profile-data";
import { getTopics } from "@/lib/topic-data";

export const dynamic = "force-dynamic";

const topicStatusLabels = {
  ACTIVE: "活跃主题线",
  WATCHING: "观察主题线",
  ARCHIVED: "已归档",
} as const;

export default async function TopicsPage() {
  const profile = (await getActiveCreatorProfile()) ?? mockCreatorProfile;
  const [topics, directions] = await Promise.all([getTopics(profile.id), getDirections(profile.id)]);

  const grouped = topics.reduce<Record<string, typeof topics>>((accumulator, topic) => {
    const key = topic.directionTitle ?? "未归入方向";
    accumulator[key] = accumulator[key] ? [...accumulator[key], topic] : [topic];
    return accumulator;
  }, {});

  const directionOrder = [
    ...directions.map((direction) => direction.title),
    ...Object.keys(grouped).filter((title) => !directions.some((direction) => direction.title === title)),
  ];

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="section-kicker">主题台</p>
            <h2 className="section-title mt-2">把观察簇升级成可持续经营的主题线</h2>
            <p className="section-desc mt-3">
              主题线不是一条新闻，也不是一次热点反应。它是能承接方向、持续吸收信号、并逐步长成系列内容资产的长期容器。
            </p>
          </div>
          <TopicGenerateButton />
        </div>
      </section>

      <section className="panel px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="metric-label">当前画像锚点</p>
            <p className="text-lg font-semibold">{profile.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="pill transition hover:border-sky-400 hover:text-slate-800" href="/profile">
              查看创作者画像
            </Link>
            <Link className="pill transition hover:border-sky-400 hover:text-slate-800" href="/directions">
              打开方向台
            </Link>
          </div>
        </div>
        <p className="muted mt-3 text-sm leading-7">{profile.positioning}</p>
      </section>

      {topics.length ? (
        <section className="space-y-5">
          {directionOrder.map((directionTitle) => {
            const sectionTopics = grouped[directionTitle];

            if (!sectionTopics?.length) {
              return null;
            }

            return (
              <div className="panel space-y-5 px-6 py-5" key={directionTitle}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="metric-label">关联方向</p>
                    <h3 className="text-2xl font-semibold leading-8">{directionTitle}</h3>
                  </div>
                  <span className="pill">{sectionTopics.length} 条主题线</span>
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                  {sectionTopics.map((topic) => (
                    <div className="subpanel space-y-4 px-5 py-5" key={topic.id}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="pill">{topicStatusLabels[topic.status]}</span>
                          <span className="pill">热度 {topic.heatScore.toFixed(1)}</span>
                          <span className="pill">{topic.signalCount} 条支撑信号</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-semibold leading-7">{topic.title}</h4>
                        <p className="muted text-sm leading-7">{topic.summary}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="pill">{topic.primaryObservationCluster}</span>
                        {topic.secondaryObservationCluster ? <span className="pill">{topic.secondaryObservationCluster}</span> : null}
                      </div>
                      {topic.sampleSignals.length ? (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-slate-700">当前支撑信号</p>
                          <div className="space-y-2">
                            {topic.sampleSignals.map((signal) => (
                              <Link
                                className="block rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 transition hover:border-slate-300/90"
                                href={`/signals/${signal.id}`}
                                key={signal.id}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <span>{signal.title}</span>
                                  <span className="pill shrink-0">重要性 {signal.importanceScore.toFixed(1)}</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-3">
                        <Link className="pill transition hover:border-sky-400 hover:text-slate-800" href="/candidates">
                          查看相关候选
                        </Link>
                        <Link className="pill transition hover:border-sky-400 hover:text-slate-800" href="/signals">
                          回到信号流
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <section className="panel px-6 py-8">
          <p className="text-lg font-semibold">当前还没有主题线。</p>
          <p className="muted mt-2 max-w-3xl text-sm leading-7">
            先在方向台生成方向，再点击“刷新主题线”。系统会把当前观察簇组织成更稳定的主题线，而不是让你一直围着零散信号打转。
          </p>
        </section>
      )}
    </main>
  );
}
