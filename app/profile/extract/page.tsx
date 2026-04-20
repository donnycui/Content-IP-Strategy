import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ProfileExtractPage() {
  redirect("/agents/ip-extraction");
}
