import { prisma } from "@/lib/prisma";

export type SourceRow = {
  id: string;
  name: string;
  type: string;
  baseUrl: string | null;
  feedUrl: string | null;
  isActive: boolean;
  qualityScore: number | null;
};

const mockSources: SourceRow[] = [
  {
    id: "source-ft",
    name: "Financial Times",
    type: "WEBSITE",
    baseUrl: "https://www.ft.com",
    feedUrl: null,
    isActive: true,
    qualityScore: 4.7,
  },
  {
    id: "source-the-information",
    name: "The Information",
    type: "WEBSITE",
    baseUrl: "https://www.theinformation.com",
    feedUrl: null,
    isActive: true,
    qualityScore: 4.6,
  },
  {
    id: "source-reuters",
    name: "Reuters",
    type: "RSS",
    baseUrl: "https://www.reuters.com",
    feedUrl: "https://www.reutersagency.com/feed/",
    isActive: true,
    qualityScore: 4.4,
  },
];

export async function getSources(): Promise<SourceRow[]> {
  if (!process.env.DATABASE_URL) {
    return mockSources;
  }

  try {
    const sources = await prisma.source.findMany({
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
      take: 100,
    });

    if (!sources.length) {
      return mockSources;
    }

    return sources.map((source) => ({
      id: source.id,
      name: source.name,
      type: source.type,
      baseUrl: source.baseUrl,
      feedUrl: source.feedUrl,
      isActive: source.isActive,
      qualityScore: source.qualityScore,
    }));
  } catch {
    return mockSources;
  }
}
