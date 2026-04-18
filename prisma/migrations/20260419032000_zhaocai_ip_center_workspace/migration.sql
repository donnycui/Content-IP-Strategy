-- CreateEnum
CREATE TYPE "CenterAgentKey" AS ENUM (
  'IP_EXTRACTION',
  'CREATOR_PROFILE',
  'TOPIC_DIRECTION',
  'STYLE_CONTENT',
  'DAILY_REVIEW',
  'EVOLUTION'
);

-- CreateEnum
CREATE TYPE "AgentThreadStatus" AS ENUM (
  'IDLE',
  'ACTIVE',
  'PAUSED',
  'ARCHIVED'
);

-- CreateTable
CREATE TABLE "CenterWorkspace" (
  "id" TEXT NOT NULL,
  "workspaceKey" TEXT NOT NULL,
  "creatorProfileId" TEXT,
  "currentAgentKey" "CenterAgentKey" NOT NULL DEFAULT 'IP_EXTRACTION',
  "recommendedActionLabel" TEXT,
  "recommendedActionHref" TEXT,
  "lastStageReason" TEXT,
  "lastJudgedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CenterWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentThread" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "agentKey" "CenterAgentKey" NOT NULL,
  "status" "AgentThreadStatus" NOT NULL DEFAULT 'IDLE',
  "transcriptJson" JSONB NOT NULL DEFAULT '[]',
  "summaryJson" JSONB,
  "latestSummary" TEXT,
  "nextRecommendedAction" TEXT,
  "lastUserMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AgentThread_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CenterWorkspace_workspaceKey_key" ON "CenterWorkspace"("workspaceKey");

-- CreateIndex
CREATE UNIQUE INDEX "CenterWorkspace_creatorProfileId_key" ON "CenterWorkspace"("creatorProfileId");

-- CreateIndex
CREATE INDEX "CenterWorkspace_currentAgentKey_updatedAt_idx" ON "CenterWorkspace"("currentAgentKey", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentThread_workspaceId_agentKey_key" ON "AgentThread"("workspaceId", "agentKey");

-- CreateIndex
CREATE INDEX "AgentThread_workspaceId_updatedAt_idx" ON "AgentThread"("workspaceId", "updatedAt");

-- CreateIndex
CREATE INDEX "AgentThread_status_updatedAt_idx" ON "AgentThread"("status", "updatedAt");

-- AddForeignKey
ALTER TABLE "CenterWorkspace"
ADD CONSTRAINT "CenterWorkspace_creatorProfileId_fkey"
FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentThread"
ADD CONSTRAINT "AgentThread_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "CenterWorkspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
