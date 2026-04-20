import { DirectionGenerateButton } from "@/components/direction-generate-button";
import { HomeSectionSkeleton } from "@/components/home/home-section-skeleton";
import { TopicCandidateGenerateButton } from "@/components/topic-candidate-generate-button";
import { TopicGenerateButton } from "@/components/topic-generate-button";
import { CandidatesListSection } from "@/components/candidates/candidates-list-section";
import { CandidatesProfileSection } from "@/components/candidates/candidates-profile-section";
import { TopicsListSection } from "@/components/topics/topics-list-section";
import { TopicsProfileSection } from "@/components/topics/topics-profile-section";
import { Suspense } from "react";

export async function TopicDirectionAgentPanel() {
  return (
    <section className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="section-kicker">Agent Workspace</p>
            <h2 className="section-title mt-2">在一个工作区里完成方向、主题线和今日选题</h2>
            <p className="section-desc mt-3">
              旧的方向台、主题台和选题台不再作为独立判断入口。这里统一承接方向生成、主题沉淀和选题推进。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <DirectionGenerateButton />
            <TopicGenerateButton />
            <TopicCandidateGenerateButton />
          </div>
        </div>
      </section>

      <Suspense fallback={<HomeSectionSkeleton compact />}>
        <TopicsProfileSection />
      </Suspense>

      <Suspense fallback={<HomeSectionSkeleton />}>
        <TopicsListSection />
      </Suspense>

      <Suspense fallback={<HomeSectionSkeleton compact />}>
        <CandidatesProfileSection />
      </Suspense>

      <Suspense fallback={<HomeSectionSkeleton />}>
        <CandidatesListSection />
      </Suspense>
    </section>
  );
}
