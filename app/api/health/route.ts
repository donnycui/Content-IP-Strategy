import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "content-ip-research-workbench",
    timestamp: new Date().toISOString(),
  });
}
