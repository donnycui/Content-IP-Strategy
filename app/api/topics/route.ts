import { NextResponse } from "next/server";
import { getTopicsService } from "@/lib/services/topic-service";

export async function GET() {
  const topics = await getTopicsService();
  return NextResponse.json({ topics });
}
