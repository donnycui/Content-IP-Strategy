import { ProfileExtractWorkbench } from "@/components/profile-extract-workbench";

export function IpExtractionAgentPanel() {
  return (
    <section className="space-y-5">
      <section className="panel px-6 py-6">
        <div className="space-y-2">
          <p className="section-kicker">Agent Workspace</p>
          <h2 className="section-title">先把你是谁、你想做什么讲清楚。</h2>
          <p className="section-desc">这一页只保留对话式提炼。先不要追求一次填完整，而是通过多轮对话把定位、目标和边界收敛出来。</p>
        </div>
      </section>
      <ProfileExtractWorkbench />
    </section>
  );
}
