import Link from "next/link";
import { DirectionGenerateButton } from "@/components/direction-generate-button";
import { getDirections } from "@/lib/direction-data";
import { getActiveCreatorProfile, mockCreatorProfile } from "@/lib/profile-data";

export const dynamic = "force-dynamic";

const priorityLabels = {
  PRIMARY: "主方向",
  SECONDARY: "第二方向",
  WATCH: "观察方向",
} as const;

export default async function DirectionsPage() {
  const profile = (await getActiveCreatorProfile()) ?? mockCreatorProfile;
  const directions = await getDirections(profile.id);

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="section-kicker">方向台</p>
            <h2 className="section-title mt-2">先决定未来 2 到 4 周往哪里投入</h2>
            <p className="section-desc mt-3">
              方向不是热点列表，而是对创作者未来一段时间内容重心的判断。它应该比单条选题更稳定，也比长期定位更贴近当前现实。
            </p>
          </div>
          <DirectionGenerateButton />
        </div>
      </section>

      <section className="panel px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="metric-label">当前画像锚点</p>
            <p className="text-lg font-semibold">{profile.name}</p>
          </div>
          <Link className="pill transition hover:border-sky-400 hover:text-slate-800" href="/profile">
            查看创作者画像
          </Link>
        </div>
        <p className="muted mt-3 text-sm leading-7">{profile.positioning}</p>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        {directions.length ? (
          directions.map((direction) => (
            <div className="panel space-y-4 px-6 py-5" key={direction.id}>
              <div className="flex items-center justify-between gap-3">
                <span className="pill">{priorityLabels[direction.priority]}</span>
                <span className="pill">{direction.timeHorizon}</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold leading-8">{direction.title}</h3>
                <p className="muted text-sm leading-7">{direction.whyNow}</p>
              </div>
              <div className="subpanel px-4 py-4">
                <p className="text-sm font-semibold text-slate-700">为什么适合你来讲</p>
                <p className="muted mt-2 text-sm leading-7">{direction.fitReason}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="panel px-6 py-6 xl:col-span-3">
            <p className="text-lg font-semibold">当前还没有方向建议。</p>
            <p className="muted mt-2 max-w-3xl text-sm leading-7">
              先完成 IP 提炼并点击“刷新方向建议”，系统才会根据创作者画像与当前信号积累生成未来 2 到 4 周的内容方向。
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

