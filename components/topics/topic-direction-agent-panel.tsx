import { DirectionGenerateButton } from "@/components/direction-generate-button";
import { HomeSectionSkeleton } from "@/components/home/home-section-skeleton";
import { LearningInsightsPanel } from "@/components/learning/learning-insights-panel";
import { TopicDirectionActions } from "@/components/topics/topic-direction-actions";
import { TopicDirectionWorkspaceClient } from "@/components/topics/topic-direction-workspace-client";
import { Suspense } from "react";

export async function TopicDirectionAgentPanel() {
  return (
    <section className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="section-kicker">Agent Workspace</p>
            <h2 className="section-title mt-2">在一个工作区里完成方向、主题线和今日选题。</h2>
            <p className="section-desc mt-3">这里是研究与决策主场。先看系统观察，再确定方向，再沉淀主题线，最后选今天真正要做的题。</p>
          </div>
        </div>
      </section>

      <TopicDirectionActions />

      <LearningInsightsPanel />

      <Suspense fallback={<HomeSectionSkeleton />}>
        <TopicDirectionWorkspaceClient />
      </Suspense>
    </section>
  );
}
