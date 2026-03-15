import { NextResponse } from "next/server";
import { ingestRssSources } from "@/lib/rss-ingest";

type IngestPayload = {
  sourceId?: string;
};

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const payload = (await request.json().catch(() => ({}))) as IngestPayload;

  try {
    const results = await ingestRssSources(payload.sourceId);
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to ingest RSS sources." },
      { status: 500 },
    );
  }
}

