import { getHomepageSummaryData } from "@/lib/services/homepage-service";

export async function HomeSummarySection() {
  const summary = await getHomepageSummaryData();

  return (
    <section className="panel px-6 py-5">
      <p className="section-kicker">今日工作台</p>
      <h2 className="section-title mt-2">围绕你的画像，决定今天该往哪走、讲什么、调整什么</h2>
      <p className="section-desc mt-3">
        这个页面不再只是内容后台，而是你的创作者操作台。它先回答“你是谁、该押哪条方向、今天讲什么”，再把信号和产出放回执行层。
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="metric-card">
          <p className="metric-label">当前方向</p>
          <p className="metric-value">{summary.directionsCount}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">活跃主题线</p>
          <p className="metric-value">{summary.topicsCount}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">今日选题</p>
          <p className="metric-value">{summary.topicCandidatesCount}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">待确认进化建议</p>
          <p className="metric-value">{summary.pendingSuggestionsCount}</p>
        </div>
      </div>
    </section>
  );
}
