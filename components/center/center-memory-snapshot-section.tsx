import type { CenterMemorySnapshotPayload } from "@/lib/domain/contracts";

export function CenterMemorySnapshotSection({ items }: { items: CenterMemorySnapshotPayload[] }) {
  return (
    <section className="panel px-6 py-6">
      <div className="space-y-2">
        <p className="section-kicker">Long-Term Assets</p>
        <h2 className="section-title">系统现在记住了什么，正在学什么，还缺什么。</h2>
        <p className="section-desc">
          这不是所有历史记录的堆放区，而是跨阶段共享的长期资产快照。后续的共享记忆层会把画像、风格、关键结论、主动学习和长期曲线正式固化下来。
        </p>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-5">
        {items.map((item) => (
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
