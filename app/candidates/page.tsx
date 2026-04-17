import { Suspense } from "react";
import { HomeSectionSkeleton } from "@/components/home/home-section-skeleton";
import { CandidatesListSection } from "@/components/candidates/candidates-list-section";
import { CandidatesProfileSection } from "@/components/candidates/candidates-profile-section";
import { TopicCandidateGenerateButton } from "@/components/topic-candidate-generate-button";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="section-kicker">选题台</p>
            <h2 className="section-title mt-2">让主题线变成今天真正值得做的选题建议</h2>
            <p className="section-desc mt-3">
              这个页面不是简单展示候选，而是告诉你：今天为什么讲、为什么适合你讲、以及更适合讲成单条、跟踪还是系列入口。
            </p>
          </div>
          <TopicCandidateGenerateButton />
        </div>
      </section>

      <Suspense fallback={<HomeSectionSkeleton compact />}>
        <CandidatesProfileSection />
      </Suspense>

      <Suspense fallback={<HomeSectionSkeleton />}>
        <CandidatesListSection />
      </Suspense>
    </main>
  );
}
