import { DraftEditorGrid } from "@/components/draft-editor-grid";
import { buildEditorialAngle } from "@/lib/editorial-angle";
import { getDraftSupportContext, getDraftsByResearchCardId } from "@/lib/data";

type DraftsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DraftsPage({ params }: DraftsPageProps) {
  const { id } = await params;
  const [draftColumns, supportContext] = await Promise.all([getDraftsByResearchCardId(id), getDraftSupportContext(id)]);
  const editorialAngle = supportContext
    ? buildEditorialAngle({
        clusterTitle: supportContext.clusterTitle,
        supportingSignals: supportContext.supportingSignals,
      })
    : null;

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <p className="text-xs uppercase tracking-[0.25em] text-sky-200">草稿工作区</p>
        <h2 className="mt-2 text-3xl font-semibold">把一个判断转成多种发布格式</h2>
        <p className="muted mt-2 max-w-3xl text-sm">
          你不应该从空白页开始写。这个页面的目的，是把已经完成的研究卡压缩成适配不同平台的首稿。
        </p>
      </section>
      {supportContext ? (
        <section className="panel px-6 py-5">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">信号支撑上下文</p>
              <h3 className="text-2xl font-semibold">{supportContext.clusterTitle}</h3>
              <p className="muted text-sm leading-6">
                {supportContext.clusterSummary ?? "这些支撑信号共同解释了为什么这个判断现在值得发。"}
              </p>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {supportContext.supportingSignals.map((signal) => (
                <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4" key={signal.id}>
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
        </section>
      ) : null}
      {editorialAngle ? (
        <section className="panel px-6 py-5">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">编辑角度</p>
              <h3 className="text-2xl font-semibold">{editorialAngle.angleType}</h3>
            </div>
            <p className="text-sm leading-6 text-slate-200">{editorialAngle.guidance}</p>
          </div>
        </section>
      ) : null}
      <DraftEditorGrid drafts={draftColumns} />
    </main>
  );
}
