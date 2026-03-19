-- CreateEnum
CREATE TYPE "GatewayAuthType" AS ENUM ('NONE', 'BEARER', 'API_KEY', 'PASSCODE');

-- CreateEnum
CREATE TYPE "GatewayHealthStatus" AS ENUM ('UNKNOWN', 'HEALTHY', 'DEGRADED', 'ERROR');

-- CreateEnum
CREATE TYPE "ModelTier" AS ENUM ('FAST', 'BALANCED', 'DEEP');

-- CreateEnum
CREATE TYPE "ModelCapabilityKey" AS ENUM ('signal_scoring', 'ip_extraction_interview', 'ip_strategy_report', 'direction_generation', 'topic_generation', 'topic_candidate_generation', 'profile_evolution', 'draft_generation');

-- CreateTable
CREATE TABLE "GatewayConnection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "authType" "GatewayAuthType" NOT NULL DEFAULT 'NONE',
    "authSecretRef" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "healthStatus" "GatewayHealthStatus" NOT NULL DEFAULT 'UNKNOWN',
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GatewayConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagedModel" (
    "id" TEXT NOT NULL,
    "gatewayConnectionId" TEXT NOT NULL,
    "providerKey" TEXT NOT NULL,
    "modelKey" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "capabilityTags" JSONB,
    "tier" "ModelTier" NOT NULL DEFAULT 'BALANCED',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "visibleToUsers" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManagedModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapabilityRoute" (
    "id" TEXT NOT NULL,
    "capabilityKey" "ModelCapabilityKey" NOT NULL,
    "defaultModelId" TEXT NOT NULL,
    "fallbackModelId" TEXT,
    "allowFallback" BOOLEAN NOT NULL DEFAULT false,
    "allowUserOverride" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CapabilityRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanModelAccess" (
    "id" TEXT NOT NULL,
    "planKey" TEXT NOT NULL,
    "capabilityKey" "ModelCapabilityKey",
    "allowedTier" "ModelTier" NOT NULL,
    "canSelectModel" BOOLEAN NOT NULL DEFAULT false,
    "canUsePremiumReasoning" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanModelAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelUsageLog" (
    "id" TEXT NOT NULL,
    "creatorProfileId" TEXT,
    "gatewayConnectionId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "capabilityKey" "ModelCapabilityKey" NOT NULL,
    "channel" TEXT,
    "latencyMs" INTEGER,
    "estimatedCost" DECIMAL(10,4),
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GatewayConnection_isActive_healthStatus_idx" ON "GatewayConnection"("isActive", "healthStatus");

-- CreateIndex
CREATE UNIQUE INDEX "GatewayConnection_name_key" ON "GatewayConnection"("name");

-- CreateIndex
CREATE INDEX "ManagedModel_enabled_tier_idx" ON "ManagedModel"("enabled", "tier");

-- CreateIndex
CREATE INDEX "ManagedModel_gatewayConnectionId_visibleToUsers_idx" ON "ManagedModel"("gatewayConnectionId", "visibleToUsers");

-- CreateIndex
CREATE UNIQUE INDEX "ManagedModel_gatewayConnectionId_providerKey_modelKey_key" ON "ManagedModel"("gatewayConnectionId", "providerKey", "modelKey");

-- CreateIndex
CREATE INDEX "CapabilityRoute_defaultModelId_idx" ON "CapabilityRoute"("defaultModelId");

-- CreateIndex
CREATE INDEX "CapabilityRoute_fallbackModelId_idx" ON "CapabilityRoute"("fallbackModelId");

-- CreateIndex
CREATE UNIQUE INDEX "CapabilityRoute_capabilityKey_key" ON "CapabilityRoute"("capabilityKey");

-- CreateIndex
CREATE INDEX "PlanModelAccess_planKey_capabilityKey_idx" ON "PlanModelAccess"("planKey", "capabilityKey");

-- CreateIndex
CREATE UNIQUE INDEX "PlanModelAccess_planKey_capabilityKey_allowedTier_key" ON "PlanModelAccess"("planKey", "capabilityKey", "allowedTier");

-- CreateIndex
CREATE INDEX "ModelUsageLog_creatorProfileId_createdAt_idx" ON "ModelUsageLog"("creatorProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "ModelUsageLog_gatewayConnectionId_createdAt_idx" ON "ModelUsageLog"("gatewayConnectionId", "createdAt");

-- CreateIndex
CREATE INDEX "ModelUsageLog_modelId_createdAt_idx" ON "ModelUsageLog"("modelId", "createdAt");

-- CreateIndex
CREATE INDEX "ModelUsageLog_capabilityKey_createdAt_idx" ON "ModelUsageLog"("capabilityKey", "createdAt");

-- AddForeignKey
ALTER TABLE "ManagedModel" ADD CONSTRAINT "ManagedModel_gatewayConnectionId_fkey" FOREIGN KEY ("gatewayConnectionId") REFERENCES "GatewayConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapabilityRoute" ADD CONSTRAINT "CapabilityRoute_defaultModelId_fkey" FOREIGN KEY ("defaultModelId") REFERENCES "ManagedModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapabilityRoute" ADD CONSTRAINT "CapabilityRoute_fallbackModelId_fkey" FOREIGN KEY ("fallbackModelId") REFERENCES "ManagedModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelUsageLog" ADD CONSTRAINT "ModelUsageLog_creatorProfileId_fkey" FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelUsageLog" ADD CONSTRAINT "ModelUsageLog_gatewayConnectionId_fkey" FOREIGN KEY ("gatewayConnectionId") REFERENCES "GatewayConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelUsageLog" ADD CONSTRAINT "ModelUsageLog_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ManagedModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

