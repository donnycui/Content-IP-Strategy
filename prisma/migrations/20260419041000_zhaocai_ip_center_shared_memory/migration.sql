-- CreateEnum
CREATE TYPE "SharedMemoryCategory" AS ENUM (
  'PROFILE_SNAPSHOT',
  'PROFILE_EVOLUTION_NOTE',
  'STYLE_SNAPSHOT',
  'STYLE_EVOLUTION_NOTE',
  'KEY_CONCLUSION',
  'REVIEW_TREND',
  'LEARNING_INSIGHT'
);

-- CreateTable
CREATE TABLE "SharedMemoryRecord" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "agentKey" "CenterAgentKey",
  "category" "SharedMemoryCategory" NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "detail" TEXT,
  "sourceRef" TEXT,
  "payloadJson" JSONB,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "effectiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "supersededAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SharedMemoryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SharedMemoryRecord_workspaceId_category_isActive_effectiveAt_idx"
ON "SharedMemoryRecord"("workspaceId", "category", "isActive", "effectiveAt");

-- CreateIndex
CREATE INDEX "SharedMemoryRecord_workspaceId_createdAt_idx"
ON "SharedMemoryRecord"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "SharedMemoryRecord_agentKey_createdAt_idx"
ON "SharedMemoryRecord"("agentKey", "createdAt");

-- AddForeignKey
ALTER TABLE "SharedMemoryRecord"
ADD CONSTRAINT "SharedMemoryRecord_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "CenterWorkspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
