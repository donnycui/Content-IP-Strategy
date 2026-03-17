import { NextResponse } from "next/server";
import { getDirections } from "@/lib/direction-data";

export async function GET() {
  const directions = await getDirections();
  return NextResponse.json({ directions });
}

