import { NextResponse } from "next/server";
import { getContentProjectPackage } from "@/lib/services/content-project-service";

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
  const bundle = await getContentProjectPackage(id);

  if (!bundle) {
    return NextResponse.json(
      {
        ok: false,
        error: "Content project not found.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(bundle);
}
