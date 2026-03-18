import { NextResponse } from "next/server";
import { getProfileEvolutionSuggestionsService } from "@/lib/services/profile-evolution-service";

export async function GET() {
  const suggestions = await getProfileEvolutionSuggestionsService();
  return NextResponse.json({ suggestions });
}
