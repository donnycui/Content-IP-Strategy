import type { ReviewDashboardPayload } from "@/lib/domain/contracts";

export function ReviewSummaryPanel({ dashboard }: { dashboard: ReviewDashboardPayload }) {
  return (
    <section className="panel px-6 py-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="section-kicker">Review Snapshots</p>
          <h2 className="section-title">最近复盘快照</h2>
          <p className="section-desc">这里先存“每条内容 / 每次回填”的基础复盘快照，后续再扩成长周期趋势和更细的平台自动数据。</p>
        </div>

        {dashboard.reviews.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {dashboard.reviews.map((review) => (
              <div className="subpanel px-4 py-4" key={review.id}>
                <div className="flex flex-wrap gap-2">
                  <span className="pill">{review.channelKey}</span>
                  {review.views != null ? <span className="pill">浏览 {review.views}</span> : null}
                  {review.likes != null ? <span className="pill">点赞 {review.likes}</span> : null}
                  {review.inquiries != null ? <span className="pill">咨询 {review.inquiries}</span> : null}
                  {review.leads != null ? <span className="pill">线索 {review.leads}</span> : null}
                </div>
                {review.reviewNote ? <p className="mt-3 text-sm leading-7 text-slate-700">{review.reviewNote}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="muted text-sm leading-7">当前还没有复盘快照。先从最近生成的内容项目里选一个，手动回填最关键的结果指标。</p>
        )}
      </div>
    </section>
  );
}
