import type { CenterCoordinatorData } from "@/lib/services/center-home-service";

export function CenterCoordinatorSection({ data }: { data: CenterCoordinatorData }) {
  return (
    <section className="panel px-6 py-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="space-y-3">
          <p className="section-kicker">Homepage Coordinator</p>
          <h2 className="section-title">{data.title}</h2>
          <p className="section-desc">{data.summary}</p>
        </div>

        <div className="grid gap-3">
          {data.bullets.map((bullet) => (
            <div className="subpanel px-4 py-4 text-sm leading-7 text-slate-700" key={bullet}>
              {bullet}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
