import { ReviewMetricsForm } from "@/components/review/review-metrics-form";
import { ReviewSummaryPanel } from "@/components/review/review-summary-panel";
import { getReviewDashboard } from "@/lib/services/review-snapshot-service";

export async function ReviewAgentPanel() {
  const dashboard = await getReviewDashboard();

  return (
    <section className="space-y-5">
      <ReviewMetricsForm dashboard={dashboard} />
      <ReviewSummaryPanel dashboard={dashboard} />
    </section>
  );
}
