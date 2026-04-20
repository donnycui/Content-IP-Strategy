import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ResearchCardPage() {
  redirect("/agents/style-content");
}
