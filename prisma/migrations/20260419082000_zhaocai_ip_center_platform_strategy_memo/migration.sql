-- CreateTable
CREATE TABLE "PlatformStrategyMemo" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "channelKey" TEXT NOT NULL,
  "headline" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "detail" TEXT,
  "sourceRef" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PlatformStrategyMemo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformStrategyMemo_workspaceId_channelKey_key"
ON "PlatformStrategyMemo"("workspaceId", "channelKey");

-- CreateIndex
CREATE INDEX "PlatformStrategyMemo_workspaceId_updatedAt_idx"
ON "PlatformStrategyMemo"("workspaceId", "updatedAt");

-- AddForeignKey
ALTER TABLE "PlatformStrategyMemo"
ADD CONSTRAINT "PlatformStrategyMemo_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "CenterWorkspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
