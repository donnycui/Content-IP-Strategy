import { NextResponse } from "next/server";
import type { SearchRunRequest, SearchRunResponse } from "@/lib/domain/contracts";
import { ingestSearchResults } from "@/lib/services/search-signal-service";
import { searchWeb } from "@/lib/services/web-search-service";

function normalizeNumResults(value: unknown) {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);

  if (!Number.isFinite(parsed)) {
    return 5;
  }

  return Math.min(10, Math.max(1, Math.round(parsed)));
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as SearchRunRequest;
    const query = payload.query?.trim() ?? "";

    if (!query) {
      return NextResponse.json<SearchRunResponse>(
        {
          ok: false,
          error: "搜索关键词不能为空。",
        },
        { status: 400 },
      );
    }

    const results = await searchWeb(query, {
      numResults: normalizeNumResults(payload.numResults),
    });
    const ingestion = payload.ingest === false ? { ingestedCount: 0, skippedCount: 0 } : await ingestSearchResults(results);

    return NextResponse.json<SearchRunResponse>({
      ok: true,
      data: {
        query,
        results,
        ingestedSignalCount: ingestion.ingestedCount,
        skippedSignalCount: ingestion.skippedCount,
      },
    });
  } catch (error) {
    return NextResponse.json<SearchRunResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "搜索失败。",
      },
      { status: 500 },
    );
  }
}
