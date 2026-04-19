import Link from "next/link";
import { AgentSummaryPanel } from "@/components/agents/agent-summary-panel";
import { AgentThreadPanel } from "@/components/agents/agent-thread-panel";
import { EvolutionAgentPanel } from "@/components/evolution/evolution-agent-panel";
import { ReviewAgentPanel } from "@/components/review/review-agent-panel";
import { StyleContentAgentPanel } from "@/components/style/style-content-agent-panel";
import type { AgentStageShellData } from "@/lib/services/agent-stage-service";

export async function AgentShell({ data }: { data: AgentStageShellData }) {
  return (
    <main className="space-y-5">
      <section className="panel px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="section-kicker">Explicit Stage Agent</p>
            <h1 className="section-title">{data.definition.label}</h1>
            <p className="section-desc">
              这里是新的阶段 Agent 工作区。旧页面能力还保留，但中枢正在把它们重新组织成一个显式多 Agent 工作空间。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="pill hover:border-sky-400 hover:text-slate-800" href="/">
              返回中枢首页
            </Link>
            <Link className="pill hover:border-sky-400 hover:text-slate-800" href={data.center.judgment.primaryAction.href}>
              当前主动作
            </Link>
          </div>
        </div>
      </section>

      <AgentSummaryPanel data={data} />
      <AgentThreadPanel data={data} />
      {data.definition.routeKey === "style-content" ? <StyleContentAgentPanel /> : null}
      {data.definition.routeKey === "daily-review" ? <ReviewAgentPanel /> : null}
      {data.definition.routeKey === "evolution" ? <EvolutionAgentPanel /> : null}

      <section className="panel px-6 py-6">
        <div className="space-y-3">
          <p className="section-kicker">Legacy Tools</p>
          <h2 className="section-title">当前仍在复用的旧能力入口</h2>
          <p className="section-desc">
            在新的内容层、复盘层和长期记忆层完全替换旧路径之前，这些入口仍然是当前阶段最实际可用的执行通道。
          </p>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {data.definition.legacyLinks.map((link) => (
            <Link
              className="subpanel flex h-full flex-col gap-3 px-5 py-5 transition hover:border-slate-400/60 hover:bg-white/80"
              href={link.href}
              key={link.href}
            >
              <p className="text-base font-semibold text-slate-800">{link.label}</p>
              <p className="muted text-sm leading-7">{link.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
