import type { getContentProjectDetail } from "@/lib/services/content-project-service";

export type AwaitedContentProjectDetail = Awaited<ReturnType<typeof getContentProjectDetail>>;
