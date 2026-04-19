import { ContentProjectEditor } from "@/components/content/content-project-editor";
import Link from "next/link";
import { ContentAssetEditor } from "@/components/content/content-asset-editor";
import { PublishRecordPackage } from "@/components/content/publish-record-package";
import { PublishRecordStatusActions } from "@/components/content/publish-record-status-actions";
import type { ReviewSnapshotPayload } from "@/lib/domain/contracts";
import type { AwaitedContentProjectDetail } from "@/lib/types/content-project";

function renderReview(review: ReviewSnapshotPayload) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3" key={review.id}>
      <div className="flex flex-wrap gap-2">
        <span className="pill">{review.channelKey}</span>
        {review.views != null ? <span className="pill">浏览 {review.views}</span> : null}
        {review.likes != null ? <span className="pill">点赞 {review.likes}</span> : null}
        {review.inquiries != null ? <span className="pill">咨询 {review.inquiries}</span> : null}
        {review.leads != null ? <span className="pill">线索 {review.leads}</span> : null}
      </div>
      {review.reviewNote ? <p className="mt-3 text-sm leading-7 text-slate-700">{review.reviewNote}</p> : null}
    </div>
  );
}

export function ContentProjectDetail({
  data,
}: {
  data: Exclude<AwaitedContentProjectDetail, null>;
}) {
  return (
    <main className="space-y-5">
      <section className="panel px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="section-kicker">Content Project Workspace</p>
            <h1 className="section-title">{data.project.title}</h1>
            <p className="section-desc">
              这是内容项目的独立工作区。你可以在这里同时看选题来源、风格底味、所有资产版本、导出包信息以及后续复盘结果。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="pill">{data.project.status}</span>
            <Link className="pill hover:border-sky-400 hover:text-slate-800" href="/agents/style-content">
              返回风格与内容 Agent
            </Link>
            <Link
              className="pill hover:border-sky-400 hover:text-slate-800"
              href={`/api/content/projects/${data.project.id}/package`}
              target="_blank"
            >
              打开项目导出包
            </Link>
            <Link
              className="pill hover:border-sky-400 hover:text-slate-800"
              href={`/agents/daily-review?projectId=${data.project.id}${
                data.publishRecords[0]?.channelKey ? `&channelKey=${data.publishRecords[0].channelKey}` : ""
              }`}
            >
              去录入复盘
            </Link>
          </div>
        </div>
      </section>

      <section className="panel px-6 py-6">
        <div className="grid gap-4 xl:grid-cols-3">
          <ContentProjectEditor project={data.project} />

          <div className="subpanel px-4 py-4">
            <p className="text-sm font-semibold text-slate-800">来源选题</p>
            {data.candidate ? (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-slate-800">{data.candidate.title}</p>
                <p className="muted text-sm leading-7">{data.candidate.whyNow || data.candidate.topicSummary}</p>
                <p className="muted text-sm leading-7">{data.candidate.fitReason}</p>
              </div>
            ) : (
              <p className="muted mt-3 text-sm leading-7">当前没有关联到明确选题，说明这个项目可能来自更早的草稿或手动内容路径。</p>
            )}
          </div>

          <div className="subpanel px-4 py-4">
            <p className="text-sm font-semibold text-slate-800">当前风格底味</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{data.styleSkill.summary}</p>
            <pre className="muted mt-3 whitespace-pre-wrap text-sm leading-7">{data.styleSkill.rulesMarkdown}</pre>
          </div>
        </div>
      </section>

      <section className="panel px-6 py-6">
        <div className="space-y-3">
          <p className="section-kicker">Assets</p>
          <h2 className="section-title">内容资产编辑区</h2>
          <p className="section-desc">先把这一批资产改到像你，再决定是否导出、发布或继续回填复盘。</p>
        </div>

        <div className="mt-6 grid gap-4">
          {data.assets.map((asset) => (
            <ContentAssetEditor asset={asset} key={asset.id} label={asset.title || asset.assetType} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
        <section className="panel px-6 py-6">
          <div className="space-y-3">
            <p className="section-kicker">Export Packages</p>
            <h2 className="section-title">导出包与发布准备</h2>
            <p className="section-desc">当前先把导出包和状态流做扎实，真实平台 API 接入之后会直接挂在这层之上。</p>
          </div>
          <div className="mt-6 space-y-4">
            {data.publishRecords.map((record) => (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4" key={record.id}>
                <PublishRecordPackage record={record} />
                <div className="mt-3">
                  <PublishRecordStatusActions record={record} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel px-6 py-6">
          <div className="space-y-3">
            <p className="section-kicker">Reviews</p>
            <h2 className="section-title">这个项目的复盘反馈</h2>
            <p className="section-desc">复盘 Agent 会继续积累这里的快照，进化 Agent 会据此推导出后续的风格、方向和画像更新建议。</p>
          </div>

          <div className="mt-6 space-y-4">
            {data.reviews.length ? (
              data.reviews.map(renderReview)
            ) : (
              <p className="muted text-sm leading-7">当前这个内容项目还没有复盘快照。先去 `每日复盘 Agent` 手动录入第一条数据。</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
