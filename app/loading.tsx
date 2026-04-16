export default function Loading() {
  return (
    <main className="space-y-5">
      <section className="panel px-6 py-8">
        <div className="flex flex-col gap-4">
          <p className="section-kicker">页面切换中</p>
          <div className="space-y-3">
            <div className="h-8 w-48 rounded-full bg-slate-200/70" />
            <div className="h-4 w-full max-w-3xl rounded-full bg-slate-200/60" />
            <div className="h-4 w-full max-w-2xl rounded-full bg-slate-200/60" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="panel space-y-4 px-6 py-6" key={index}>
            <div className="h-4 w-24 rounded-full bg-slate-200/70" />
            <div className="h-7 w-32 rounded-full bg-slate-200/70" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded-full bg-slate-200/60" />
              <div className="h-4 w-5/6 rounded-full bg-slate-200/60" />
              <div className="h-4 w-4/6 rounded-full bg-slate-200/60" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
