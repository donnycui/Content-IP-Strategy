import { NextResponse } from "next/server";
import { getTopicCandidatesService } from "@/lib/services/topic-candidate-service";

export async function GET() {
  const candidates = await getTopicCandidatesService();
  return NextResponse.json({ candidates });
}
