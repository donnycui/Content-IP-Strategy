import { getTodayWorkspaceService } from "@/lib/services/today-service";

export async function getTodayWorkspace() {
  return getTodayWorkspaceService();
}
