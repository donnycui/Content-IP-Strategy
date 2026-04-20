import { CenterAgentGrid } from "@/components/center/center-agent-grid";
import { CenterCoordinatorSection } from "@/components/center/center-coordinator-section";
import { CenterJudgmentSection } from "@/components/center/center-judgment-section";
import { CenterMemorySnapshotSection } from "@/components/center/center-memory-snapshot-section";
import { CenterQuickActionsSection } from "@/components/center/center-quick-actions-section";
import { LearningInsightsPanel } from "@/components/learning/learning-insights-panel";
import { getCenterHomeData } from "@/lib/services/center-home-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const center = await getCenterHomeData();

  return (
    <main className="space-y-5">
      <CenterJudgmentSection data={center.judgment} metrics={center.metrics} />
      <CenterAgentGrid agents={center.agents} />
      <CenterCoordinatorSection data={center.coordinator} />
      <CenterMemorySnapshotSection items={center.memory} />
      <LearningInsightsPanel />
      <CenterQuickActionsSection actions={center.quickActions} />
    </main>
  );
}
