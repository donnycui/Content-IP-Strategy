import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function CandidatesPage() {
  redirect("/agents/topic-direction");
}
