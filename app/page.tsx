import { Suspense } from "react";
import { HomeEvolutionOutputSection } from "@/components/home/home-evolution-output-section";
import { HomeProfileDirectionsSection } from "@/components/home/home-profile-directions-section";
import { HomeSectionSkeleton } from "@/components/home/home-section-skeleton";
import { HomeSummarySection } from "@/components/home/home-summary-section";
import { HomeTopicsCandidatesSection } from "@/components/home/home-topics-candidates-section";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <main className="space-y-5">
      <Suspense fallback={<HomeSectionSkeleton />}>
        <HomeSummarySection />
      </Suspense>

      <Suspense fallback={<HomeSectionSkeleton />}>
        <HomeProfileDirectionsSection />
      </Suspense>

      <Suspense fallback={<HomeSectionSkeleton />}>
        <HomeTopicsCandidatesSection />
      </Suspense>

      <Suspense fallback={<HomeSectionSkeleton />}>
        <HomeEvolutionOutputSection />
      </Suspense>
    </main>
  );
}
