import { RssIngestButton } from "@/components/rss-ingest-button";
import { SourceCreateForm } from "@/components/source-create-form";
import { SourceTable } from "@/components/source-table";
import { getSources } from "@/lib/source-data";

const sourceTypes = [
  {
    label: "主流新闻与商业媒体",
    detail: "覆盖面广，新意通常较弱，但适合做重要性校准。",
  },
  {
    label: "科技博客与行业分析",
    detail: "更容易出现早期信号，也更容易提供差异化视角。",
  },
  {
    label: "金融市场与公开披露",
    detail: "最适合捕捉资本流向、重估逻辑和战略下注信号。",
  },
];

export default async function SourcesPage() {
  const sources = await getSources();

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <p className="text-xs uppercase tracking-[0.25em] text-sky-200">信号源</p>
        <h2 className="mt-2 text-3xl font-semibold">信号入口要保持广覆盖，质量控制要越来越严格</h2>
        <p className="muted mt-2 max-w-3xl text-sm">
          产品应该靠入口广度和复核纪律来成长，而不是过早限制信号来源。
        </p>
      </section>
      <section className="grid gap-5 lg:grid-cols-3">
        {sourceTypes.map((source) => (
          <div className="panel space-y-4 px-6 py-5" key={source.label}>
            <p className="text-sm font-semibold">{source.label}</p>
            <p className="muted text-sm leading-7">{source.detail}</p>
          </div>
        ))}
      </section>
      <section className="panel flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-sky-200">RSS 抓取</p>
          <p className="muted mt-2 max-w-2xl text-sm leading-6">
            拉取已启用的 RSS 源，为未见过的链接创建新信号，并把它们推进主信号复核流。
          </p>
        </div>
        <RssIngestButton />
      </section>
      <SourceCreateForm />
      <SourceTable sources={sources} />
    </main>
  );
}
