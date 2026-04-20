import type { StyleRevisionCreateRequest, StyleRevisionPayload } from "@/lib/domain/contracts";
import { prisma } from "@/lib/prisma";
import { ensureActiveStyleSkill, syncStyleSkillCounts } from "@/lib/services/style-skill-service";

function mapStyleRevision(record: {
  id: string;
  styleSkillId: string;
  sampleId: string | null;
  draftText: string;
  revisedText: string;
  ruleDelta: string | null;
  createdAt: Date;
}): StyleRevisionPayload {
  return {
    id: record.id,
    styleSkillId: record.styleSkillId,
    sampleId: record.sampleId,
    draftText: record.draftText,
    revisedText: record.revisedText,
    ruleDelta: record.ruleDelta,
    createdAt: record.createdAt.toISOString(),
  };
}

function buildMockRevision(input: {
  styleSkillId: string;
  sampleId?: string | null;
  draftText: string;
  revisedText: string;
  ruleDelta?: string | null;
}): StyleRevisionPayload {
  return {
    id: `style-revision-${Date.now()}`,
    styleSkillId: input.styleSkillId,
    sampleId: input.sampleId ?? null,
    draftText: input.draftText,
    revisedText: input.revisedText,
    ruleDelta: input.ruleDelta ?? null,
    createdAt: new Date().toISOString(),
  };
}

export async function createStyleRevision(input: StyleRevisionCreateRequest): Promise<{
  revision: StyleRevisionPayload;
  skillId: string;
}> {
  const styleSkill = await ensureActiveStyleSkill();
  const draftText = input.draftText?.trim() || "";
  const revisedText = input.revisedText?.trim() || "";
  const ruleDelta = input.ruleDelta?.trim() || null;

  if (!draftText || !revisedText) {
    throw new Error("draftText and revisedText are required.");
  }

  if (!process.env.DATABASE_URL) {
    return {
      revision: buildMockRevision({
        styleSkillId: styleSkill.id,
        sampleId: input.sampleId ?? null,
        draftText,
        revisedText,
        ruleDelta,
      }),
      skillId: styleSkill.id,
    };
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      styleRevision?: {
        create: (args: unknown) => Promise<unknown>;
      };
    };

    const revision = await prismaClient.styleRevision?.create({
      data: {
        styleSkillId: styleSkill.id,
        sampleId: input.sampleId ?? null,
        draftText,
        revisedText,
        ruleDelta,
      },
    });

    const mapped = revision
      ? mapStyleRevision(revision as Parameters<typeof mapStyleRevision>[0])
      : buildMockRevision({
          styleSkillId: styleSkill.id,
          sampleId: input.sampleId ?? null,
          draftText,
          revisedText,
          ruleDelta,
        });

    await syncStyleSkillCounts(styleSkill.id);

    return {
      revision: mapped,
      skillId: styleSkill.id,
    };
  } catch {
    return {
      revision: buildMockRevision({
        styleSkillId: styleSkill.id,
        sampleId: input.sampleId ?? null,
        draftText,
        revisedText,
        ruleDelta,
      }),
      skillId: styleSkill.id,
    };
  }
}
