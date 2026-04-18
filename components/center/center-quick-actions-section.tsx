import Link from "next/link";
import type { CenterQuickActionPayload } from "@/lib/domain/contracts";

export function CenterQuickActionsSection({ actions }: { actions: CenterQuickActionPayload[] }) {
  return (
    <section className="panel px-6 py-6">
      <div className="space-y-2">
        <p className="section-kicker">Quick Actions</p>
        <h2 className="section-title">不想从首页判断开始，也可以直接做事。</h2>
        <p className="section-desc">
          当前阶段判断会一直保留，但你也可以直接跳到某个动作。后续这些动作会逐步映射到正式的阶段 Agent 线程里。
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <Link
            className="subpanel flex h-full flex-col gap-3 px-5 py-5 transition hover:border-slate-400/60 hover:bg-white/80"
            href={action.href}
            key={action.label}
          >
            <p className="text-base font-semibold text-slate-800">{action.label}</p>
            <p className="muted text-sm leading-7">{action.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
