-- CreateEnum
CREATE TYPE "EvolutionTargetType" AS ENUM ('PROFILE', 'STYLE', 'DIRECTION', 'PLATFORM_STRATEGY');

-- CreateEnum
CREATE TYPE "EvolutionDecisionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "ReviewSnapshot" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "assetId" TEXT,
  "channelKey" TEXT NOT NULL,
  "views" INTEGER,
  "likes" INTEGER,
  "comments" INTEGER,
  "shares" INTEGER,
  "saves" INTEGER,
  "inquiries" INTEGER,
  "leads" INTEGER,
  "conversions" INTEGER,
  "reviewNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ReviewSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvolutionDecision" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "reviewSnapshotId" TEXT,
  "targetType" "EvolutionTargetType" NOT NULL,
  "status" "EvolutionDecisionStatus" NOT NULL DEFAULT 'PENDING',
  "headline" TEXT NOT NULL,
  "rationale" TEXT NOT NULL,
  "suggestedAction" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EvolutionDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewSnapshot_workspaceId_createdAt_idx" ON "ReviewSnapshot"("workspaceId", "createdAt");
CREATE INDEX "ReviewSnapshot_projectId_createdAt_idx" ON "ReviewSnapshot"("projectId", "createdAt");
CREATE INDEX "ReviewSnapshot_channelKey_createdAt_idx" ON "ReviewSnapshot"("channelKey", "createdAt");
CREATE INDEX "ReviewSnapshot_assetId_idx" ON "ReviewSnapshot"("assetId");

-- CreateIndex
CREATE INDEX "EvolutionDecision_workspaceId_status_updatedAt_idx" ON "EvolutionDecision"("workspaceId", "status", "updatedAt");
CREATE INDEX "EvolutionDecision_targetType_createdAt_idx" ON "EvolutionDecision"("targetType", "createdAt");
CREATE INDEX "EvolutionDecision_reviewSnapshotId_idx" ON "EvolutionDecision"("reviewSnapshotId");

-- AddForeignKey
ALTER TABLE "ReviewSnapshot"
ADD CONSTRAINT "ReviewSnapshot_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "CenterWorkspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSnapshot"
ADD CONSTRAINT "ReviewSnapshot_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "ContentProject"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSnapshot"
ADD CONSTRAINT "ReviewSnapshot_assetId_fkey"
FOREIGN KEY ("assetId") REFERENCES "ContentAsset"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvolutionDecision"
ADD CONSTRAINT "EvolutionDecision_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "CenterWorkspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvolutionDecision"
ADD CONSTRAINT "EvolutionDecision_reviewSnapshotId_fkey"
FOREIGN KEY ("reviewSnapshotId") REFERENCES "ReviewSnapshot"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
