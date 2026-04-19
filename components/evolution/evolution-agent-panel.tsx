import { EvolutionDecisionPanel } from "@/components/evolution/evolution-decision-panel";
import { getEvolutionDashboard } from "@/lib/services/evolution-decision-service";

export async function EvolutionAgentPanel() {
  const dashboard = await getEvolutionDashboard();

  return <EvolutionDecisionPanel dashboard={dashboard} />;
}
