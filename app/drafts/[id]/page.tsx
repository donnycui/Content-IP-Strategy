import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DraftsPage() {
  redirect("/agents/style-content");
}
