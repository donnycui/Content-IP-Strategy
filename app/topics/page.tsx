import { Suspense } from "react";
import { HomeSectionSkeleton } from "@/components/home/home-section-skeleton";
import { TopicsListSection } from "@/components/topics/topics-list-section";
import { TopicsProfileSection } from "@/components/topics/topics-profile-section";
import { TopicGenerateButton } from "@/components/topic-generate-button";

export const dynamic = "force-dynamic";

export default async function TopicsPage() {
  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="section-kicker">主题台</p>
            <h2 className="section-title mt-2">把观察簇升级成可持续经营的主题线</h2>
            <p className="section-desc mt-3">
              主题线不是一条新闻，也不是一次热点反应。它是能承接方向、持续吸收信号、并逐步长成系列内容资产的长期容器。
            </p>
          </div>
          <TopicGenerateButton />
        </div>
      </section>

      <Suspense fallback={<HomeSectionSkeleton compact />}>
        <TopicsProfileSection />
      </Suspense>

      <Suspense fallback={<HomeSectionSkeleton />}>
        <TopicsListSection />
      </Suspense>
    </main>
  );
}
