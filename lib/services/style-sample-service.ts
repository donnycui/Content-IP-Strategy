import type { StyleSampleCreateRequest, StyleSamplePayload } from "@/lib/domain/contracts";
import { prisma } from "@/lib/prisma";
import { ensureActiveStyleSkill, syncStyleSkillCounts } from "@/lib/services/style-skill-service";

function mapStyleSample(record: {
  id: string;
  styleSkillId: string;
  title: string;
  sourceLabel: string | null;
  sampleText: string;
  updatedAt: Date;
}): StyleSamplePayload {
  return {
    id: record.id,
    styleSkillId: record.styleSkillId,
    title: record.title,
    sourceLabel: record.sourceLabel,
    sampleText: record.sampleText,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function buildMockSample(input: {
  styleSkillId: string;
  title: string;
  sourceLabel?: string | null;
  sampleText: string;
}): StyleSamplePayload {
  return {
    id: `style-sample-${Date.now()}`,
    styleSkillId: input.styleSkillId,
    title: input.title,
    sourceLabel: input.sourceLabel ?? null,
    sampleText: input.sampleText,
    updatedAt: new Date().toISOString(),
  };
}

export async function createStyleSample(input: StyleSampleCreateRequest): Promise<{
  sample: StyleSamplePayload;
  skillId: string;
}> {
  const styleSkill = await ensureActiveStyleSkill();

  const title = input.title?.trim() || "未命名样本";
  const sampleText = input.sampleText?.trim() || "";
  const sourceLabel = input.sourceLabel?.trim() || null;

  if (!sampleText) {
    throw new Error("sampleText is required.");
  }

  if (!process.env.DATABASE_URL) {
    const sample = buildMockSample({
      styleSkillId: styleSkill.id,
      title,
      sourceLabel,
      sampleText,
    });

    return {
      sample,
      skillId: styleSkill.id,
    };
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      styleSample?: {
        create: (args: unknown) => Promise<unknown>;
      };
    };

    const sample = await prismaClient.styleSample?.create({
      data: {
        styleSkillId: styleSkill.id,
        title,
        sourceLabel,
        sampleText,
      },
    });

    const mapped = sample
      ? mapStyleSample(sample as Parameters<typeof mapStyleSample>[0])
      : buildMockSample({
          styleSkillId: styleSkill.id,
          title,
          sourceLabel,
          sampleText,
        });

    await syncStyleSkillCounts(styleSkill.id);

    return {
      sample: mapped,
      skillId: styleSkill.id,
    };
  } catch {
    return {
      sample: buildMockSample({
        styleSkillId: styleSkill.id,
        title,
        sourceLabel,
        sampleText,
      }),
      skillId: styleSkill.id,
    };
  }
}
