import Link from "next/link";
import type { CenterQuickActionPayload } from "@/lib/domain/contracts";

export function CenterQuickActionsSection({ actions }: { actions: CenterQuickActionPayload[] }) {
  return (
    <section className="panel px-6 py-6">
      <div className="space-y-2">
        <p className="section-kicker">Quick Actions</p>
        <h2 className="section-title">也可以直接开始做事。</h2>
        <p className="section-desc">只保留最常用的动作，避免首页变成功能仓库。</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actions.slice(0, 3).map((action) => (
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
