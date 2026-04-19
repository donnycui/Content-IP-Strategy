import type {
  EvolutionDashboardPayload,
  ReviewDashboardPayload,
  StyleContentDashboardPayload,
} from "@/lib/domain/contracts";
import { buildDemoPlaybook, type DemoPlaybook } from "@/lib/demo/demo-playbook-logic";
import { getCenterHomeData } from "@/lib/services/center-home-service";
import { getStyleContentDashboard } from "@/lib/services/content-project-service";
import { getEvolutionDashboard } from "@/lib/services/evolution-decision-service";
import { getReviewDashboard } from "@/lib/services/review-snapshot-service";

export async function getDemoPlaybook(): Promise<DemoPlaybook> {
  const [center, styleContent, reviewDashboard, evolutionDashboard] = await Promise.all([
    getCenterHomeData(),
    getStyleContentDashboard(),
    getReviewDashboard(),
    getEvolutionDashboard(),
  ]);

  return buildDemoPlaybook({
    center,
    styleContent,
    reviewDashboard,
    evolutionDashboard,
  });
}
