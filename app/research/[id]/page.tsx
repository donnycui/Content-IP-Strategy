import Link from "next/link";
import { notFound } from "next/navigation";
import { DraftGenerateButton } from "@/components/draft-generate-button";
import { ResearchCardEditor } from "@/components/research-card-editor";
import { ResearchCardStrategyReportButton } from "@/components/research-card-strategy-report-button";
import { getResearchCardById } from "@/lib/data";

type ResearchCardPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ResearchCardPage({ params }: ResearchCardPageProps) {
  const { id } = await params;
  const mockResearchCard = await getResearchCardById(id);

  if (!mockResearchCard) {
    notFound();
  }

  const sections = [
    ["事件定义", mockResearchCard.eventDefinition],
    ["主流叙事", mockResearchCard.mainstreamNarrative],
    ["被忽略变量", mockResearchCard.ignoredVariables],
    ["历史镜像", mockResearchCard.historicalAnalogy],
    ["三个月推演", mockResearchCard.threeMonthProjection],
    ["一年推演", mockResearchCard.oneYearProjection],
    ["赢家与输家", mockResearchCard.winnersLosers],
    ["站位判断", mockResearchCard.positioningJudgment],
  ];
  const relatedSignals = "signals" in mockResearchCard && Array.isArray(mockResearchCard.signals) ? mockResearchCard.signals : [];

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <p className="text-xs uppercase tracking-[0.25em] text-sky-700">研究卡</p>
        <h2 className="mt-2 text-3xl font-semibold">{mockResearchCard.title}</h2>
        <p className="muted mt-2 max-w-3xl text-sm">
          这里是信号簇从“新闻”转成“结构化判断资产”的地方，并最终沉淀出明确的站位结论。
        </p>
        {"clusterTitle" in mockResearchCard ? (
          <div className="mt-5 space-y-4 rounded-3xl border border-slate-300/60 bg-stone-50/80 px-5 py-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="pill">{mockResearchCard.clusterTitle}</span>
              <span className="pill">{relatedSignals.length} 条支撑信号</span>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">观察簇上下文</p>
              <p className="text-sm leading-6 text-slate-700">
                {mockResearchCard.clusterSummary ?? "这张研究卡不是围绕单条新闻展开，而是锚定在一个观察簇之上。"}
              </p>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {relatedSignals.map((signal) => (
                <div className="rounded-2xl border border-slate-300/60 bg-white/70 px-4 py-4" key={signal.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{signal.title}</p>
                    <span className="pill">重要性 {signal.importanceScore.toFixed(1)}</span>
                  </div>
                  <p className="muted mt-2 text-sm">{signal.source}</p>
                  <p className="muted mt-2 text-sm leading-6">{signal.reasoningSummary}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr,0.85fr]">
        <ResearchCardEditor
          card={{
            id: mockResearchCard.id,
            title: mockResearchCard.title,
            eventDefinition: mockResearchCard.eventDefinition,
            mainstreamNarrative: mockResearchCard.mainstreamNarrative,
            ignoredVariables: mockResearchCard.ignoredVariables,
            historicalAnalogy: mockResearchCard.historicalAnalogy,
            threeMonthProjection: mockResearchCard.threeMonthProjection,
            oneYearProjection: mockResearchCard.oneYearProjection,
            winnersLosers: mockResearchCard.winnersLosers,
            positioningJudgment: mockResearchCard.positioningJudgment,
          }}
        />
        <aside className="space-y-5">
          <div className="panel space-y-4 px-6 py-5">
            <p className="text-xs uppercase tracking-[0.25em] text-sky-700">下一步动作</p>
            <p className="muted text-sm leading-6">
              当你确认这张研究卡的站位判断后，就应该把它转成文章、视频和短帖草稿。
            </p>
            <ResearchCardStrategyReportButton researchCardId={mockResearchCard.id} />
            <DraftGenerateButton researchCardId={mockResearchCard.id} />
            <Link className="pill hover:border-sky-400 hover:text-slate-800" href={`/drafts/${mockResearchCard.id}`}>
              打开草稿工作区
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
