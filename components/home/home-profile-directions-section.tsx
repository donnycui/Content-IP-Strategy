import Link from "next/link";
import { getHomepageProfileDirectionsData } from "@/lib/services/homepage-service";

const directionPriorityLabels = {
  PRIMARY: "主方向",
  SECONDARY: "第二方向",
  WATCH: "观察方向",
} as const;

export async function HomeProfileDirectionsSection() {
  const { profile, directions } = await getHomepageProfileDirectionsData();

  return (
    <section className="grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
      <div className="panel px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="metric-label">当前画像</p>
            <h3 className="text-2xl font-semibold">今天先记住你是谁</h3>
          </div>
          <Link className="action-link" href="/agents/creator-profile">
            查看画像 Agent
          </Link>
        </div>
        <div className="mt-4 space-y-4">
          <div className="subpanel px-4 py-4">
            <p className="text-sm font-semibold text-slate-700">定位</p>
            <p className="muted mt-2 text-sm leading-7">{profile.positioning}</p>
          </div>
          <div className="subpanel px-4 py-4">
            <p className="text-sm font-semibold text-slate-700">当前阶段</p>
            <p className="muted mt-2 text-sm leading-7">{profile.currentStage}</p>
          </div>
          <div className="subpanel px-4 py-4">
            <p className="text-sm font-semibold text-slate-700">增长目标</p>
            <p className="muted mt-2 text-sm leading-7">{profile.growthGoal}</p>
          </div>
        </div>
      </div>

      <div className="panel px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="metric-label">今日方向</p>
            <h3 className="text-2xl font-semibold">未来 2 到 4 周先押哪几条</h3>
          </div>
          <Link className="action-link" href="/agents/topic-direction">
            进入方向与选题 Agent
          </Link>
        </div>
        <div className="mt-4 grid gap-3">
          {directions.length ? (
            directions.map((direction) => (
              <div className="subpanel px-4 py-4" key={direction.id}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold leading-6">{direction.title}</p>
                  <span className="pill shrink-0">{directionPriorityLabels[direction.priority]}</span>
                </div>
                <p className="muted mt-2 text-sm leading-7">{direction.whyNow}</p>
              </div>
            ))
          ) : (
            <p className="muted text-sm">当前还没有方向建议。</p>
          )}
        </div>
      </div>
    </section>
  );
}
