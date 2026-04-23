import { DirectionGenerateButton } from "@/components/direction-generate-button";
import { HomeSectionSkeleton } from "@/components/home/home-section-skeleton";
import { LearningInsightsPanel } from "@/components/learning/learning-insights-panel";
import { CandidatesListSection } from "@/components/candidates/candidates-list-section";
import { CandidatesProfileSection } from "@/components/candidates/candidates-profile-section";
import { TopicsListSection } from "@/components/topics/topics-list-section";
import { TopicsProfileSection } from "@/components/topics/topics-profile-section";
import { TopicDirectionActions } from "@/components/topics/topic-direction-actions";
import { Suspense } from "react";
import { getTopicDirectionDashboard } from "@/lib/services/topic-direction-dashboard-service";

export async function TopicDirectionAgentPanel() {
  const dashboard = await getTopicDirectionDashboard();

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

      <Suspense fallback={<HomeSectionSkeleton compact />}>
        <TopicsProfileSection profile={dashboard.profile} />
      </Suspense>

      <Suspense fallback={<HomeSectionSkeleton />}>
        <TopicsListSection directions={dashboard.directions} profileId={dashboard.profile.id} topics={dashboard.topics} />
      </Suspense>

      <Suspense fallback={<HomeSectionSkeleton compact />}>
        <CandidatesProfileSection profile={dashboard.profile} />
      </Suspense>

      <Suspense fallback={<HomeSectionSkeleton />}>
        <CandidatesListSection candidates={dashboard.topicCandidates} />
      </Suspense>
    </section>
  );
}
