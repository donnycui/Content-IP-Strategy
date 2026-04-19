import Link from "next/link";
import type { StyleContentDashboardPayload } from "@/lib/domain/contracts";

export function ContentProjectOverview({ dashboard }: { dashboard: StyleContentDashboardPayload }) {
  return (
    <main className="space-y-5">
      <section className="panel px-6 py-6">
        <div className="space-y-2">
          <p className="section-kicker">Content Project Index</p>
          <h1 className="section-title">内容项目总览</h1>
          <p className="section-desc">
            这里把当前所有内容项目统一展开，你可以快速查看项目状态、内容资产数量、发布准备状态，并进入单项目工作区继续编辑。
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {dashboard.projects.length ? (
          dashboard.projects.map((item) => (
            <section className="panel px-6 py-5" key={item.project.id}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="pill">{item.project.status}</span>
                <span className="pill">资产 {item.assets.length}</span>
                <span className="pill">导出包 {item.publishRecords.length}</span>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-800">{item.project.title}</h2>
              {item.project.summary ? <p className="muted mt-2 text-sm leading-7">{item.project.summary}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {item.assets.slice(0, 4).map((asset) => (
                  <span className="pill" key={asset.id}>
                    {asset.assetType}
                  </span>
                ))}
              </div>
              <div className="mt-5">
                <div className="flex flex-wrap gap-3">
                  <Link
                    className="rounded-2xl border border-slate-300/70 bg-white/70 px-4 py-2.5 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-white"
                    href={`/content/projects/${item.project.id}`}
                  >
                    打开项目工作区
                  </Link>
                  <Link
                    className="rounded-2xl border border-slate-300/70 bg-white/70 px-4 py-2.5 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-white"
                    href={`/api/content/projects/${item.project.id}/package`}
                    target="_blank"
                  >
                    打开项目导出包
                  </Link>
                </div>
              </div>
            </section>
          ))
        ) : (
          <section className="panel px-6 py-8 xl:col-span-3">
            <p className="text-lg font-semibold text-slate-800">当前还没有内容项目。</p>
            <p className="muted mt-2 text-sm leading-7">先从 `风格与内容 Agent` 的候选题里创建第一批内容项目，再回来这里统一浏览。</p>
            <div className="mt-4">
              <Link
                className="rounded-2xl border border-slate-300/70 bg-white/70 px-4 py-2.5 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-white"
                href="/agents/style-content"
              >
                打开风格与内容 Agent
              </Link>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
