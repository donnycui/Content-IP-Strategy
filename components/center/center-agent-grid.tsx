import Link from "next/link";
import type { CenterAgentStatusValue, CenterAgentSummaryPayload } from "@/lib/domain/contracts";

function statusStyle(status: CenterAgentStatusValue) {
  if (status === "CURRENT") {
    return "border-sky-400/35 bg-sky-400/14 text-slate-800";
  }

  if (status === "REVISIT") {
    return "border-amber-300/45 bg-amber-300/14 text-slate-800";
  }

  return "border-slate-300/70 bg-white/55 text-slate-600";
}

function statusLabel(status: CenterAgentStatusValue) {
  if (status === "CURRENT") {
    return "当前";
  }

  if (status === "REVISIT") {
    return "建议回看";
  }

  return "待解锁";
}

export function CenterAgentGrid({ agents }: { agents: CenterAgentSummaryPayload[] }) {
  return (
    <section className="panel px-6 py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="section-kicker">Stage Agents</p>
          <h2 className="section-title">主流程一共 6 步。</h2>
          <p className="section-desc">你只需要知道现在在哪一步、下一步去哪一步，不需要理解后台所有结构。</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {agents.map((agent) => (
          <section className="subpanel flex h-full flex-col px-5 py-5" key={agent.key}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-slate-800">{agent.label}</p>
                <span className={`pill ${statusStyle(agent.status)}`}>{statusLabel(agent.status)}</span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-700">{agent.summary}</p>
            <p className="muted mt-3 text-sm leading-7">{agent.detail}</p>
            <div className="mt-5">
              <Link
                className="inline-flex rounded-2xl border border-slate-300/70 bg-white/70 px-4 py-2.5 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-white"
                href={agent.href}
              >
                {agent.actionLabel}
              </Link>
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
