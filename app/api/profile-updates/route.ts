import { NextResponse } from "next/server";
import type { ProfileUpdatesListResponse } from "@/lib/domain/contracts";
import { getProfileEvolutionSuggestionsService } from "@/lib/services/profile-evolution-service";

export async function GET() {
  const suggestions = await getProfileEvolutionSuggestionsService();
  return NextResponse.json<ProfileUpdatesListResponse>({
    ok: true,
    data: {
      suggestions,
    },
  });
}
