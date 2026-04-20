import Link from "next/link";
import { AgentSummaryPanel } from "@/components/agents/agent-summary-panel";
import { AgentThreadPanel } from "@/components/agents/agent-thread-panel";
import { EvolutionAgentPanel } from "@/components/evolution/evolution-agent-panel";
import { CreatorProfileAgentPanel } from "@/components/profile/creator-profile-agent-panel";
import { IpExtractionAgentPanel } from "@/components/profile/ip-extraction-agent-panel";
import { ReviewAgentPanel } from "@/components/review/review-agent-panel";
import { StyleContentAgentPanel } from "@/components/style/style-content-agent-panel";
import { TopicDirectionAgentPanel } from "@/components/topics/topic-direction-agent-panel";
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
              这里是当前阶段的正式工作区。中枢会把真实执行能力挂在这里，而不是再让你回到旧工作台判断产品。
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
      {data.definition.routeKey === "ip-extraction" ? <IpExtractionAgentPanel /> : null}
      {data.definition.routeKey === "creator-profile" ? <CreatorProfileAgentPanel /> : null}
      {data.definition.routeKey === "topic-direction" ? <TopicDirectionAgentPanel /> : null}
      {data.definition.routeKey === "style-content" ? <StyleContentAgentPanel /> : null}
      {data.definition.routeKey === "daily-review" ? <ReviewAgentPanel /> : null}
      {data.definition.routeKey === "evolution" ? <EvolutionAgentPanel /> : null}
    </main>
  );
}
