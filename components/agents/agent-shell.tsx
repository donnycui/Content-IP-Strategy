import Link from "next/link";
import { AgentSummaryPanel } from "@/components/agents/agent-summary-panel";
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
      <section className="panel px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="section-kicker">Stage Agent</p>
            <h1 className="section-title">{data.definition.label}</h1>
            <p className="section-desc">每个 Agent 只负责一个阶段。先在这里完成当前动作，再进入下一步。</p>
          </div>
          <Link className="pill hover:border-sky-400 hover:text-slate-800" href="/">
            返回首页
          </Link>
        </div>
      </section>

      <AgentSummaryPanel data={data} />
      {data.definition.routeKey === "ip-extraction" ? <IpExtractionAgentPanel /> : null}
      {data.definition.routeKey === "creator-profile" ? <CreatorProfileAgentPanel /> : null}
      {data.definition.routeKey === "topic-direction" ? <TopicDirectionAgentPanel /> : null}
      {data.definition.routeKey === "style-content" ? <StyleContentAgentPanel /> : null}
      {data.definition.routeKey === "daily-review" ? <ReviewAgentPanel /> : null}
      {data.definition.routeKey === "evolution" ? <EvolutionAgentPanel /> : null}
    </main>
  );
}
