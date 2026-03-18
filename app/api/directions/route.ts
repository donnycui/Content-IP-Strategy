import { NextResponse } from "next/server";
import { getActiveDirectionsService } from "@/lib/services/direction-service";

export async function GET() {
  const directions = await getActiveDirectionsService();
  return NextResponse.json({ directions });
}
