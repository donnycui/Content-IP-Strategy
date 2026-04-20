import { EvolutionDecisionPanel } from "@/components/evolution/evolution-decision-panel";
import { PlatformStrategyPanel } from "@/components/evolution/platform-strategy-panel";
import { LearningInsightsPanel } from "@/components/learning/learning-insights-panel";
import { getEvolutionDashboard } from "@/lib/services/evolution-decision-service";

export async function EvolutionAgentPanel() {
  const dashboard = await getEvolutionDashboard();

  return (
    <section className="space-y-5">
      <LearningInsightsPanel />
      <PlatformStrategyPanel />
      <EvolutionDecisionPanel dashboard={dashboard} />
    </section>
  );
}
