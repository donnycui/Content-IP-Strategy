import { ContentProjectPanel } from "@/components/content/content-project-panel";
import { getStyleContentDashboard } from "@/lib/services/content-project-service";
import { StyleRevisionForm } from "@/components/style/style-revision-form";
import { StyleSampleUploadForm } from "@/components/style/style-sample-upload-form";
import { StyleSkillSummary } from "@/components/style/style-skill-summary";
import { getStyleSkillDashboard } from "@/lib/services/style-skill-service";

export async function StyleContentAgentPanel() {
  const [dashboard, contentDashboard] = await Promise.all([getStyleSkillDashboard(), getStyleContentDashboard()]);

  return (
    <section className="space-y-5">
      <StyleSkillSummary dashboard={dashboard} />
      <section className="grid gap-4 xl:grid-cols-2">
        <StyleSampleUploadForm />
        <StyleRevisionForm />
      </section>
      <ContentProjectPanel dashboard={contentDashboard} />
    </section>
  );
}
