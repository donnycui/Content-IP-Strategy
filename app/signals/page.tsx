import { SignalCreateForm } from "@/components/signal-create-form";
import { SignalTable } from "@/components/signal-table";
import { UrlIngestForm } from "@/components/url-ingest-form";
import { getSignals } from "@/lib/data";
import { getSources } from "@/lib/source-data";

const filters = [
  "全量信号",
  "AI 初筛高分",
  "母命题：权力迁移",
  "待人工复核",
];

export default async function SignalsPage() {
  const signals = await getSignals();
  const sources = await getSources();

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="section-kicker">信号流</p>
            <h2 className="section-title">先筛，再判，再推进</h2>
            <p className="section-desc">
              AI 负责初步排序和解释，最终仍由你决定什么值得研究、什么进入候选池、什么应该忽略。
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
            {filters.map((filter) => (
              <span className="pill" key={filter}>
                {filter}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-[1fr,1fr]">
        <UrlIngestForm sources={sources} />
        <SignalCreateForm sources={sources} />
      </section>
      <SignalTable signals={signals} />
    </main>
  );
}
