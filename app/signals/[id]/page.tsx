import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewEditor } from "@/components/review-editor";
import { ReviewActions } from "@/components/review-actions";
import { getResearchCardPreview, getSignalById } from "@/lib/data";

const priorityLabels: Record<string, string> = {
  PRIORITIZE: "优先推进",
  WATCH: "持续观察",
  DEPRIORITIZE: "降低优先级",
};

const reviewStatusLabels: Record<string, string> = {
  PENDING: "待处理",
  KEPT: "保留",
  DEFERRED: "延后",
  REJECTED: "忽略",
};

const reasoningAcceptanceLabels: Record<string, string> = {
  ACCEPTED: "接受",
  PARTIAL: "部分接受",
  REJECTED: "不接受",
};

const signalStatusLabels: Record<string, string> = {
  NEW: "新信号",
  REVIEWED: "已复核",
  CANDIDATE: "候选",
  DEFERRED: "延后",
  IGNORED: "已忽略",
  ARCHIVED: "已归档",
};

type SignalDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SignalDetailPage({ params }: SignalDetailPageProps) {
  const { id } = await params;
  const signal = await getSignalById(id);
  const researchCard = await getResearchCardPreview();

  if (!signal) {
    notFound();
  }

  return (
    <main className="grid gap-5 xl:grid-cols-[1.2fr,0.8fr]">
      <section className="space-y-5">
        <div className="panel space-y-5 px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="pill">{signalStatusLabels[signal.status] ?? signal.status}</span>
            <span className="pill">{signal.source}</span>
            <span className="pill">{signal.publishedAt}</span>
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-sky-200">信号详情</p>
            <h2 className="text-3xl font-semibold leading-tight">{signal.title}</h2>
            <p className="muted text-sm">
              在这个页面里，AI 理由、来源证据和你的编辑判断会汇合，决定这条信号是进入候选池、推进研究，还是直接忽略。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <p className="text-sm font-semibold">AI 初筛评分</p>
              <p className="mt-2 text-sm">重要性：{signal.importanceScore.toFixed(1)}</p>
              <p className="muted mt-1 text-sm">观点潜力：{signal.viewpointScore.toFixed(1)}</p>
              <p className="muted mt-1 text-sm">共识强度：{signal.consensusStrength.toFixed(1)}</p>
              <p className="muted mt-1 text-sm">公司日常噪音分：{signal.companyRoutineScore.toFixed(1)}</p>
              <p className="mt-2 text-sm">优先级：{priorityLabels[signal.priorityRecommendation] ?? signal.priorityRecommendation}</p>
              <p className="muted mt-1 text-sm">模型：{signal.modelName ?? "未知"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <p className="text-sm font-semibold">AI 理由摘要</p>
              <p className="muted mt-2 text-sm leading-6">{signal.reasoningSummary}</p>
              {signal.reasoningDetail ? (
                <p className="muted mt-3 text-sm leading-6">{signal.reasoningDetail}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="panel space-y-4 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.25em] text-sky-200">AI 与人工复核</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <p className="text-sm font-semibold">AI 判断</p>
              <div className="mt-3 space-y-2 text-sm">
                <p>重要性：{signal.importanceScore.toFixed(1)}</p>
                <p>观点潜力：{signal.viewpointScore.toFixed(1)}</p>
                <p>共识强度：{signal.consensusStrength.toFixed(1)}</p>
                <p>公司日常噪音：{signal.companyRoutineScore.toFixed(1)}</p>
                <p>优先级：{priorityLabels[signal.priorityRecommendation] ?? signal.priorityRecommendation}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <p className="text-sm font-semibold">最近一次人工复核</p>
              {signal.latestReview ? (
                <div className="mt-3 space-y-2 text-sm">
                  <p>状态：{reviewStatusLabels[signal.latestReview.reviewStatus] ?? signal.latestReview.reviewStatus}</p>
                  <p>重要性：{signal.latestReview.adjustedImportanceScore ?? "-"}</p>
                  <p>观点潜力：{signal.latestReview.adjustedViewpointScore ?? "-"}</p>
                  <p>共识强度：{signal.latestReview.adjustedConsensusStrength ?? "-"}</p>
                  <p>公司日常噪音：{signal.latestReview.adjustedCompanyRoutineScore ?? "-"}</p>
                  <p>优先级：{signal.latestReview.adjustedPriorityRecommendation ? priorityLabels[signal.latestReview.adjustedPriorityRecommendation] ?? signal.latestReview.adjustedPriorityRecommendation : "-"}</p>
                  <p>理由接受度：{signal.latestReview.reasoningAcceptance ? reasoningAcceptanceLabels[signal.latestReview.reasoningAcceptance] ?? signal.latestReview.reasoningAcceptance : "-"}</p>
                  <p className="muted pt-2 leading-6">{signal.latestReview.reviewNote ?? "暂时还没有复核备注。"}</p>
                  <p className="muted leading-6">{signal.latestReview.myAngle ?? "暂时还没有你的切入角度。"}</p>
                </div>
              ) : (
                <p className="muted mt-3 text-sm">暂时还没有保存人工复核。</p>
              )}
            </div>
          </div>
          <ReviewEditor initialReview={signal.latestReview} signalId={signal.id} />
        </div>

        <div className="panel space-y-4 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.25em] text-sky-200">研究卡预览</p>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold">事件定义</p>
              <p className="muted mt-1 text-sm leading-6">{researchCard.eventDefinition}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">被忽略变量</p>
              <p className="muted mt-1 text-sm leading-6">{researchCard.ignoredVariables}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">站位判断</p>
              <p className="muted mt-1 text-sm leading-6">{researchCard.positioningJudgment}</p>
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-5">
        <div className="panel space-y-4 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.25em] text-sky-200">编辑动作</p>
          <ReviewActions signalId={signal.id} />
        </div>

        <div className="panel space-y-4 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.25em] text-sky-200">工作流跳转</p>
          <div className="grid gap-3 text-sm">
            <Link className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20" href="/candidates">
              打开候选池
            </Link>
            <Link className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20" href="/research/demo">
              打开研究卡
            </Link>
            <Link className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20" href="/drafts/demo">
              打开草稿工作区
            </Link>
          </div>
        </div>
      </aside>
    </main>
  );
}
