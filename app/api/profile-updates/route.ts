import { NextResponse } from "next/server";
import { getProfileUpdateSuggestions } from "@/lib/profile-update-suggestion-data";

export async function GET() {
  const suggestions = await getProfileUpdateSuggestions();
  return NextResponse.json({ suggestions });
}
