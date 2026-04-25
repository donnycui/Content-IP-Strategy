import { HomeSectionSkeleton } from "@/components/home/home-section-skeleton";

export function AgentRouteSkeleton() {
  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <p className="section-kicker">Stage Agent / 正在切换</p>
            <div className="h-10 w-72 animate-pulse rounded-full bg-slate-200/70" />
            <div className="space-y-2">
              <div className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-slate-200/60" />
              <div className="h-4 w-full max-w-xl animate-pulse rounded-full bg-slate-200/60" />
            </div>
          </div>
          <div className="rounded-full border border-sky-300/35 bg-sky-100/60 px-4 py-2 text-sm text-slate-700">
            正在载入阶段工作区
          </div>
        </div>
      </section>

      <section className="panel px-6 py-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-8 w-20 animate-pulse rounded-full bg-slate-200/70" />
            <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200/60" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
            <HomeSectionSkeleton />
            <div className="subpanel space-y-3 px-4 py-4">
              <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200/70" />
              <div className="h-4 w-full animate-pulse rounded-full bg-slate-200/60" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200/60" />
              <div className="h-4 w-4/6 animate-pulse rounded-full bg-slate-200/60" />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <HomeSectionSkeleton compact />
            <HomeSectionSkeleton compact />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <HomeSectionSkeleton />
        <HomeSectionSkeleton />
      </section>
    </main>
  );
}
