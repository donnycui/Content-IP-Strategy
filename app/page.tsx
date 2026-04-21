import { CenterAgentGrid } from "@/components/center/center-agent-grid";
import { CenterJudgmentSection } from "@/components/center/center-judgment-section";
import { CenterMemorySnapshotSection } from "@/components/center/center-memory-snapshot-section";
import { CenterQuickActionsSection } from "@/components/center/center-quick-actions-section";
import { LearningInsightsPanel } from "@/components/learning/learning-insights-panel";
import { getCenterHomeData } from "@/lib/services/center-home-service";
import { HomeSectionSkeleton } from "@/components/home/home-section-skeleton";
import { Suspense } from "react";

export const revalidate = 30;

export default async function HomePage() {
  const center = await getCenterHomeData();

  return (
    <main className="space-y-5">
      <CenterJudgmentSection data={center.judgment} metrics={center.metrics} />
      <CenterAgentGrid agents={center.agents} />
      <CenterQuickActionsSection actions={center.quickActions} />
      <CenterMemorySnapshotSection items={center.memory} />
      <Suspense fallback={<HomeSectionSkeleton compact />}>
        <LearningInsightsPanel />
      </Suspense>
    </main>
  );
}
