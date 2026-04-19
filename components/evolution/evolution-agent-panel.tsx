import { EvolutionDecisionPanel } from "@/components/evolution/evolution-decision-panel";
import { LearningInsightsPanel } from "@/components/learning/learning-insights-panel";
import { getEvolutionDashboard } from "@/lib/services/evolution-decision-service";

export async function EvolutionAgentPanel() {
  const dashboard = await getEvolutionDashboard();

  return (
    <section className="space-y-5">
      <LearningInsightsPanel />
      <EvolutionDecisionPanel dashboard={dashboard} />
    </section>
  );
}
