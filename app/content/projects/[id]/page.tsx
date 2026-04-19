import { notFound } from "next/navigation";
import { ContentProjectDetail } from "@/components/content/content-project-detail";
import { getContentProjectDetail } from "@/lib/services/content-project-service";

export const dynamic = "force-dynamic";

export default async function ContentProjectPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  const detail = await getContentProjectDetail(id);

  if (!detail) {
    notFound();
  }

  return <ContentProjectDetail data={detail} />;
}
