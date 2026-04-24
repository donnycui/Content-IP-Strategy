import type { AgentStageShellData } from "@/lib/services/agent-stage-service";

function threadStatusLabel(status?: string | null) {
  if (!status) {
    return "未初始化";
  }

  if (status === "ACTIVE") {
    return "活跃中";
  }

  if (status === "PAUSED") {
    return "已暂停";
  }

  if (status === "ARCHIVED") {
    return "已归档";
  }

  return "待启动";
}

export function AgentThreadPanel({ data }: { data: AgentStageShellData }) {
  const thread = data.thread;
  const blockers = thread?.summary?.blockers ?? [];
  const assets = thread?.summary?.assets ?? [];

  return (
    <section className="panel px-6 py-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="section-kicker">Agent Thread</p>
            <h2 className="section-title">这个阶段 Agent 的独立线程</h2>
          </div>
          <span className="pill">{threadStatusLabel(thread?.status)}</span>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="metric-card">
            <p className="metric-label">线程状态</p>
            <p className="mt-3 text-lg font-semibold text-slate-800">{threadStatusLabel(thread?.status)}</p>
            <p className="muted mt-3 text-sm leading-6">
              这个线程会逐步接管该阶段的摘要、草稿、下一步建议和后续消息。
            </p>
          </div>
          <div className="metric-card">
            <p className="metric-label">最新摘要</p>
            <p className="mt-3 text-sm leading-7 text-slate-800">{thread?.latestSummary || "当前还没有独立线程摘要。"}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">下一步建议</p>
            <p className="mt-3 text-sm leading-7 text-slate-800">
              {thread?.nextRecommendedAction || data.agent.actionLabel || "等待该阶段开始后生成下一步建议。"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="subpanel px-4 py-4">
            <p className="text-sm font-semibold text-slate-800">当前阻塞 / 注意点</p>
            {blockers.length ? (
              <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
                {blockers.map((item: string) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            ) : (
              <p className="muted mt-3 text-sm leading-7">当前还没有单独记录阻塞项，后续阶段线程会逐步沉淀下来。</p>
            )}
          </div>

          <div className="subpanel px-4 py-4">
            <p className="text-sm font-semibold text-slate-800">线程内已挂靠资产</p>
            {assets.length ? (
              <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
                {assets.map((item: string) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            ) : (
              <p className="muted mt-3 text-sm leading-7">当前只接入了首页同步摘要，后续会挂接真正的提炼报告、画像版本、选题卡、内容资产与复盘记录。</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
