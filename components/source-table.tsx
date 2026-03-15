import type { SourceRow } from "@/lib/source-data";

const sourceTypeLabels: Record<string, string> = {
  RSS: "RSS",
  WEBSITE: "网站",
  NEWSLETTER: "Newsletter",
  MANUAL_URL: "手动 URL",
  SOCIAL_LINK: "社媒外链",
  DISCLOSURE: "公开披露",
  BLOG: "博客",
};

export function SourceTable({ sources }: { sources: SourceRow[] }) {
  return (
    <section className="panel overflow-hidden">
      <div className="grid grid-cols-[1.5fr,0.8fr,1.4fr,1fr,0.8fr] gap-3 border-b border-white/10 px-5 py-3 text-xs uppercase tracking-[0.22em] text-slate-400">
        <span>名称</span>
        <span>类型</span>
        <span>Feed 或基础 URL</span>
        <span>质量分</span>
        <span>状态</span>
      </div>
      <div>
        {sources.map((source) => (
          <div
            className="grid grid-cols-[1.5fr,0.8fr,1.4fr,1fr,0.8fr] gap-3 border-b border-white/5 px-5 py-4"
            key={source.id}
          >
            <div className="text-sm font-medium">{source.name}</div>
            <div className="text-sm text-slate-300">{sourceTypeLabels[source.type] ?? source.type}</div>
            <div className="muted text-sm">{source.feedUrl ?? source.baseUrl ?? "暂未配置 URL"}</div>
            <div className="text-sm text-slate-200">
              {source.qualityScore ? source.qualityScore.toFixed(1) : "未评分"}
            </div>
            <div>
              <span className="pill">{source.isActive ? "已启用" : "未启用"}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
