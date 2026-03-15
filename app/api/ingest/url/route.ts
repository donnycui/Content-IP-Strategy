import { NextResponse } from "next/server";
import { ingestUrl } from "@/lib/url-ingest";

type UrlIngestPayload = {
  sourceId?: string;
  url?: string;
};

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const payload = (await request.json()) as UrlIngestPayload;

  if (!payload.sourceId || !payload.url) {
    return NextResponse.json({ ok: false, error: "sourceId and url are required." }, { status: 400 });
  }

  try {
    const result = await ingestUrl({
      sourceId: payload.sourceId,
      url: payload.url,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to ingest URL." },
      { status: 500 },
    );
  }
}

