import { ProfileExtractWorkbench } from "@/components/profile-extract-workbench";

export function IpExtractionAgentPanel() {
  return (
    <section className="space-y-5">
      <section className="panel px-6 py-6">
        <div className="space-y-2">
          <p className="section-kicker">Agent Workspace</p>
          <h2 className="section-title">在这里直接完成真实对话式 IP 提炼</h2>
          <p className="section-desc">
            当前阶段只保留对话式提炼主路径，不再暴露旧的快捷提炼壳层，避免模板化流程继续影响新版判断。
          </p>
        </div>
      </section>
      <ProfileExtractWorkbench />
    </section>
  );
}
