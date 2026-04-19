import Link from "next/link";
import type { CenterAgentSummaryPayload } from "@/lib/domain/contracts";
import type { AgentStageShellData } from "@/lib/services/agent-stage-service";
import { getAgentStageStatusLabel } from "@/lib/services/agent-stage-service";

function statusStyle(status: CenterAgentSummaryPayload["status"]) {
  if (status === "CURRENT") {
    return "border-sky-400/35 bg-sky-400/14 text-slate-800";
  }

  if (status === "REVISIT") {
    return "border-amber-300/45 bg-amber-300/14 text-slate-800";
  }

  return "border-slate-300/70 bg-white/55 text-slate-600";
}

export function AgentSummaryPanel({ data }: { data: AgentStageShellData }) {
  return (
    <section className="panel px-6 py-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`pill ${statusStyle(data.agent.status)}`}>{getAgentStageStatusLabel(data.agent.status)}</span>
          <span className="pill">Workspace · {data.workspace.workspaceKey}</span>
        </div>

        <div className="space-y-2">
          <p className="section-kicker">{data.definition.kicker}</p>
          <h2 className="section-title">{data.definition.title}</h2>
          <p className="section-desc">{data.definition.description}</p>
        </div>

        <div className="subpanel px-4 py-4">
          <p className="text-sm font-semibold text-slate-800">当前判断</p>
          <p className="muted mt-2 text-sm leading-7">{data.agent.summary}</p>
          <p className="muted mt-2 text-sm leading-7">{data.agent.detail}</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
          <div className="subpanel px-4 py-4">
            <p className="text-sm font-semibold text-slate-800">这个 Agent 负责产出</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.definition.ownedOutcomes.map((item) => (
                <span className="pill" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="subpanel px-4 py-4">
            <p className="text-sm font-semibold text-slate-800">这一层在整个循环中的位置</p>
            <p className="muted mt-2 text-sm leading-7">{data.definition.loopNote}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {data.definition.legacyLinks.map((link) => (
            <Link
              className="rounded-2xl border border-slate-300/70 bg-white/70 px-4 py-2.5 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-white"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
