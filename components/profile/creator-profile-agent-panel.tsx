import { CreatorProfileEditor } from "@/components/creator-profile-editor";
import { getActiveCreatorProfile, mockCreatorProfile } from "@/lib/profile-data";

const stageLabels = {
  EXPLORING: "探索期",
  EMERGING: "成长期",
  SCALING: "放大期",
  ESTABLISHED: "成熟期",
} as const;

export async function CreatorProfileAgentPanel() {
  const profile = (await getActiveCreatorProfile()) ?? mockCreatorProfile;

  return (
    <section className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="space-y-2">
          <p className="section-kicker">Agent Workspace</p>
          <h2 className="section-title mt-2">把提炼结果固化成长期画像。</h2>
          <p className="section-desc mt-3">后面的方向、风格、内容和进化都会参考这里，所以这里只做一件事：把画像改准确。</p>
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
    </section>
  );
}
