import { NextResponse } from "next/server";
import { getTopicCandidates } from "@/lib/topic-candidate-data";

export async function GET() {
  const candidates = await getTopicCandidates();
  return NextResponse.json({ candidates });
}
