import { NextResponse } from "next/server";
import type { DirectionsListResponse } from "@/lib/domain/contracts";
import { getActiveDirectionsService } from "@/lib/services/direction-service";

export async function GET() {
  const directions = await getActiveDirectionsService();
  return NextResponse.json<DirectionsListResponse>({
    ok: true,
    data: {
      directions,
    },
  });
}
