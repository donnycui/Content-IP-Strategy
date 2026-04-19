import { ContentProjectCreateButton } from "@/components/content/content-project-create-button";
import { PublishRecordStatusActions } from "@/components/content/publish-record-status-actions";
import type { StyleContentDashboardPayload } from "@/lib/domain/contracts";

const assetTypeLabels = {
  XHS_POST: "小红书图文",
  SHORT_VIDEO_SCRIPT: "短视频脚本",
  WECHAT_ARTICLE: "公众号文章",
  LIVESTREAM_SCRIPT: "直播脚本",
} as const;

export function ContentProjectPanel({ dashboard }: { dashboard: StyleContentDashboardPayload }) {
  return (
    <section className="panel px-6 py-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="section-kicker">Content Projects</p>
          <h2 className="section-title">把选题推进成真实的内容项目，而不是停在候选阶段。</h2>
          <p className="section-desc">
            这里把选题方向层的候选题拉进内容层，直接生成一组基础内容资产。后续会继续接入更完整的内容编辑、发布准备和平台分发能力。
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
          <div className="subpanel px-4 py-4">
            <p className="text-sm font-semibold text-slate-800">当前推荐选题</p>
            {dashboard.recommendedCandidates.length ? (
              <div className="mt-3 space-y-4">
                {dashboard.recommendedCandidates.map((candidate) => (
                  <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-4" key={candidate.id}>
                    <p className="text-sm font-semibold text-slate-800">{candidate.title}</p>
                    <p className="muted mt-2 text-sm leading-7">{candidate.whyNow || candidate.topicSummary}</p>
                    <p className="muted mt-2 text-sm leading-7">{candidate.fitReason}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="pill">{candidate.topicTitle}</span>
                      <span className="pill">{candidate.formatRecommendation}</span>
                    </div>
                    <div className="mt-4">
                      <ContentProjectCreateButton candidate={candidate} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted mt-3 text-sm leading-7">当前还没有可推进的候选题，先回到选题方向 Agent 生成今天的选题。</p>
            )}
          </div>

          <div className="subpanel px-4 py-4">
            <p className="text-sm font-semibold text-slate-800">最近内容项目</p>
            {dashboard.projects.length ? (
              <div className="mt-3 space-y-4">
                {dashboard.projects.map((item) => (
                  <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-4" key={item.project.id}>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{item.project.title}</p>
                      <span className="pill">{item.project.status}</span>
                    </div>
                    {item.project.summary ? <p className="muted mt-2 text-sm leading-7">{item.project.summary}</p> : null}

                    <div className="mt-4 grid gap-3">
                      {item.assets.map((asset) => (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3" key={asset.id}>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="pill">{assetTypeLabels[asset.assetType]}</span>
                            <span className="pill">{asset.status}</span>
                          </div>
                          <p className="mt-2 text-sm font-medium text-slate-800">{asset.title || assetTypeLabels[asset.assetType]}</p>
                          <p className="muted mt-2 line-clamp-4 text-sm leading-7">{asset.content}</p>
                        </div>
                      ))}
                    </div>

                    {item.publishRecords.length ? (
                      <div className="mt-4 space-y-3">
                        {item.publishRecords.map((record) => (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3" key={record.id}>
                            <div className="flex flex-wrap gap-2">
                              <span className="pill">{record.channelKey}</span>
                              <span className="pill">{record.mode}</span>
                              <span className="pill">{record.status}</span>
                            </div>
                            {record.failureReason ? (
                              <p className="muted mt-2 text-sm leading-7">{record.failureReason}</p>
                            ) : null}
                            <div className="mt-3">
                              <PublishRecordStatusActions record={record} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted mt-3 text-sm leading-7">
                当前还没有内容项目。你可以从左侧的候选题直接创建一组基础内容资产，小红书图文、短视频脚本、公众号文章和直播脚本会一起生成。
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
