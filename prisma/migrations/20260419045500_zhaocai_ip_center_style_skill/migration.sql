-- CreateEnum
CREATE TYPE "StyleSkillStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "StyleSkill" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "creatorProfileId" TEXT,
  "status" "StyleSkillStatus" NOT NULL DEFAULT 'DRAFT',
  "title" TEXT NOT NULL DEFAULT '个人风格 Skill',
  "summary" TEXT NOT NULL,
  "rulesMarkdown" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "revisionCount" INTEGER NOT NULL DEFAULT 0,
  "sampleCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "StyleSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StyleSample" (
  "id" TEXT NOT NULL,
  "styleSkillId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sourceLabel" TEXT,
  "sampleText" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "StyleSample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StyleRevision" (
  "id" TEXT NOT NULL,
  "styleSkillId" TEXT NOT NULL,
  "sampleId" TEXT,
  "draftText" TEXT NOT NULL,
  "revisedText" TEXT NOT NULL,
  "ruleDelta" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StyleRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StyleSkill_workspaceId_key" ON "StyleSkill"("workspaceId");

-- CreateIndex
CREATE INDEX "StyleSkill_creatorProfileId_updatedAt_idx" ON "StyleSkill"("creatorProfileId", "updatedAt");

-- CreateIndex
CREATE INDEX "StyleSkill_status_updatedAt_idx" ON "StyleSkill"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "StyleSample_styleSkillId_createdAt_idx" ON "StyleSample"("styleSkillId", "createdAt");

-- CreateIndex
CREATE INDEX "StyleRevision_styleSkillId_createdAt_idx" ON "StyleRevision"("styleSkillId", "createdAt");

-- CreateIndex
CREATE INDEX "StyleRevision_sampleId_idx" ON "StyleRevision"("sampleId");

-- AddForeignKey
ALTER TABLE "StyleSkill"
ADD CONSTRAINT "StyleSkill_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "CenterWorkspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleSkill"
ADD CONSTRAINT "StyleSkill_creatorProfileId_fkey"
FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleSample"
ADD CONSTRAINT "StyleSample_styleSkillId_fkey"
FOREIGN KEY ("styleSkillId") REFERENCES "StyleSkill"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleRevision"
ADD CONSTRAINT "StyleRevision_styleSkillId_fkey"
FOREIGN KEY ("styleSkillId") REFERENCES "StyleSkill"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleRevision"
ADD CONSTRAINT "StyleRevision_sampleId_fkey"
FOREIGN KEY ("sampleId") REFERENCES "StyleSample"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
