import { notFound } from "next/navigation";
import { AgentShell } from "@/components/agents/agent-shell";
import { isAgentRouteKey } from "@/lib/center/agent-stage-config";
import { getAgentStageShellData } from "@/lib/services/agent-stage-service";

export const dynamic = "force-dynamic";

export default async function AgentStagePage({
  params,
}: {
  params: Promise<{
    agentKey: string;
  }>;
}) {
  const { agentKey } = await params;

  if (!isAgentRouteKey(agentKey)) {
    notFound();
  }

  const data = await getAgentStageShellData(agentKey);

  return <AgentShell data={data} />;
}
