import { ContentProjectOverview } from "@/components/content/content-project-overview";
import { getStyleContentDashboard } from "@/lib/services/content-project-service";

export const dynamic = "force-dynamic";

export default async function ContentProjectsPage() {
  const dashboard = await getStyleContentDashboard();

  return <ContentProjectOverview dashboard={dashboard} />;
}
