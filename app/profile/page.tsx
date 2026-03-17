import Link from "next/link";
import { CreatorProfileEditor } from "@/components/creator-profile-editor";
import { getActiveCreatorProfile, mockCreatorProfile } from "@/lib/profile-data";

export const dynamic = "force-dynamic";

const stageLabels = {
  EXPLORING: "探索期",
  EMERGING: "成长期",
  SCALING: "放大期",
  ESTABLISHED: "成熟期",
} as const;

export default async function ProfilePage() {
  const profile = (await getActiveCreatorProfile()) ?? mockCreatorProfile;

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="section-kicker">Creator Profile</p>
            <h2 className="section-title mt-2">先固定你是谁，再让系统围绕你运转</h2>
            <p className="section-desc mt-3">
              这是方向台、主题台和画像进化建议的总锚点。后续系统提出变化建议时，也会以这张画像为基准。
            </p>
          </div>
          <Link className="pill transition hover:border-sky-400 hover:text-slate-800" href="/profile/extract">
            重新提炼 IP
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="metric-card">
            <p className="metric-label">当前阶段</p>
            <p className="metric-value text-2xl">{stageLabels[profile.currentStage]}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">活跃方向</p>
            <p className="metric-value">{profile.directionsCount}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">主题数量</p>
            <p className="metric-value">{profile.topicsCount}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">待确认进化建议</p>
            <p className="metric-value">{profile.pendingSuggestionsCount}</p>
          </div>
        </div>
      </section>

      <CreatorProfileEditor profile={profile} />
    </main>
  );
}
