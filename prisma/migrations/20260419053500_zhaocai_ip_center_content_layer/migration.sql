-- CreateEnum
CREATE TYPE "ContentProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'READY', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentAssetType" AS ENUM ('XHS_POST', 'SHORT_VIDEO_SCRIPT', 'WECHAT_ARTICLE', 'LIVESTREAM_SCRIPT');

-- CreateEnum
CREATE TYPE "ContentAssetStatus" AS ENUM ('DRAFT', 'READY', 'APPROVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PublishMode" AS ENUM ('EXPORT', 'DIRECT');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'READY', 'EXPORTED', 'QUEUED', 'PUBLISHED', 'FAILED');

-- CreateTable
CREATE TABLE "ContentProject" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "creatorProfileId" TEXT,
  "topicCandidateId" TEXT,
  "styleSkillId" TEXT,
  "status" "ContentProjectStatus" NOT NULL DEFAULT 'DRAFT',
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContentProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentAsset" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "assetType" "ContentAssetType" NOT NULL,
  "title" TEXT,
  "content" TEXT NOT NULL,
  "targetPlatform" TEXT NOT NULL,
  "status" "ContentAssetStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContentAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishRecord" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "assetId" TEXT,
  "channelKey" TEXT NOT NULL,
  "mode" "PublishMode" NOT NULL DEFAULT 'EXPORT',
  "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
  "packageJson" JSONB,
  "publishedAt" TIMESTAMP(3),
  "failureReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PublishRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentProject_workspaceId_status_updatedAt_idx" ON "ContentProject"("workspaceId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "ContentProject_creatorProfileId_updatedAt_idx" ON "ContentProject"("creatorProfileId", "updatedAt");

-- CreateIndex
CREATE INDEX "ContentProject_topicCandidateId_idx" ON "ContentProject"("topicCandidateId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentAsset_projectId_assetType_key" ON "ContentAsset"("projectId", "assetType");

-- CreateIndex
CREATE INDEX "ContentAsset_targetPlatform_status_updatedAt_idx" ON "ContentAsset"("targetPlatform", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "PublishRecord_projectId_createdAt_idx" ON "PublishRecord"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "PublishRecord_channelKey_status_createdAt_idx" ON "PublishRecord"("channelKey", "status", "createdAt");

-- CreateIndex
CREATE INDEX "PublishRecord_assetId_idx" ON "PublishRecord"("assetId");

-- AddForeignKey
ALTER TABLE "ContentProject"
ADD CONSTRAINT "ContentProject_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "CenterWorkspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentProject"
ADD CONSTRAINT "ContentProject_creatorProfileId_fkey"
FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentProject"
ADD CONSTRAINT "ContentProject_topicCandidateId_fkey"
FOREIGN KEY ("topicCandidateId") REFERENCES "TopicCandidate"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentProject"
ADD CONSTRAINT "ContentProject_styleSkillId_fkey"
FOREIGN KEY ("styleSkillId") REFERENCES "StyleSkill"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAsset"
ADD CONSTRAINT "ContentAsset_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "ContentProject"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishRecord"
ADD CONSTRAINT "PublishRecord_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "ContentProject"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishRecord"
ADD CONSTRAINT "PublishRecord_assetId_fkey"
FOREIGN KEY ("assetId") REFERENCES "ContentAsset"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
