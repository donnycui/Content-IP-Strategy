import { NextResponse } from "next/server";
import { rescoreSignals } from "@/lib/signal-rescore";

type RescorePayload = {
  limit?: number;
};

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const payload = ((await request.json().catch(() => ({}))) ?? {}) as RescorePayload;

  try {
    const result = await rescoreSignals(payload.limit);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to rescore signals." },
      { status: 500 },
    );
  }
}
