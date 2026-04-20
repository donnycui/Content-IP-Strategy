import type { CenterMemorySnapshotPayload } from "@/lib/domain/contracts";

export function CenterMemorySnapshotSection({ items }: { items: CenterMemorySnapshotPayload[] }) {
  return (
    <section className="panel px-6 py-6">
      <div className="space-y-2">
        <p className="section-kicker">System Snapshot</p>
        <h2 className="section-title">系统当前记住的重点。</h2>
        <p className="section-desc">首页只展示最关键的长期信息，不在这里展开全部历史记录。</p>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {items.slice(0, 4).map((item) => (
          <div className="metric-card" key={item.label}>
            <p className="metric-label">{item.label}</p>
            <p className="mt-3 text-base font-semibold leading-7 text-slate-800">{item.value}</p>
            <p className="muted mt-3 text-sm leading-6">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
