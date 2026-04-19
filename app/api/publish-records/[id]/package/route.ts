import { NextResponse } from "next/server";
import { getPublishRecordById } from "@/lib/services/publish-record-service";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const { id } = await params;
  const record = await getPublishRecordById(id);

  if (!record) {
    return NextResponse.json(
      {
        ok: false,
        error: "Publish record not found.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    channelKey: record.channelKey,
    mode: record.mode,
    status: record.status,
    failureReason: record.failureReason,
    package: record.packageJson ?? {},
  });
}
