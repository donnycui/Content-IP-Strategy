-- CreateEnum
CREATE TYPE "CreatorStage" AS ENUM ('EXPLORING', 'EMERGING', 'SCALING', 'ESTABLISHED');

-- CreateEnum
CREATE TYPE "DirectionPriority" AS ENUM ('PRIMARY', 'SECONDARY', 'WATCH');

-- CreateEnum
CREATE TYPE "DirectionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('ACTIVE', 'WATCHING', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TopicCandidateStatus" AS ENUM ('NEW', 'KEPT', 'DEFERRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TopicFormatRecommendation" AS ENUM ('SINGLE_POST', 'RECURRING_TRACK', 'SERIES_ENTRY');

-- CreateEnum
CREATE TYPE "ProfileUpdateSuggestionType" AS ENUM ('POSITIONING', 'PERSONA', 'AUDIENCE', 'CORE_THEME', 'VOICE_STYLE', 'GROWTH_GOAL', 'CONTENT_BOUNDARY', 'CURRENT_STAGE', 'DIRECTION_WEIGHT');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "CreatorProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "positioning" TEXT,
    "persona" TEXT,
    "audience" TEXT,
    "coreThemes" TEXT,
    "voiceStyle" TEXT,
    "growthGoal" TEXT,
    "contentBoundaries" TEXT,
    "currentStage" "CreatorStage" NOT NULL DEFAULT 'EXPLORING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Direction" (
    "id" TEXT NOT NULL,
    "creatorProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "whyNow" TEXT,
    "fitReason" TEXT,
    "priority" "DirectionPriority" NOT NULL DEFAULT 'SECONDARY',
    "status" "DirectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "timeHorizon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Direction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "creatorProfileId" TEXT NOT NULL,
    "directionId" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "status" "TopicStatus" NOT NULL DEFAULT 'ACTIVE',
    "heatScore" DOUBLE PRECISION,
    "signalCount" INTEGER NOT NULL DEFAULT 0,
    "primaryObservationCluster" "ObservationCluster",
    "secondaryObservationCluster" "ObservationCluster",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicCandidate" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "anchorSignalId" TEXT,
    "title" TEXT NOT NULL,
    "whyNow" TEXT,
    "fitReason" TEXT,
    "formatRecommendation" "TopicFormatRecommendation" NOT NULL DEFAULT 'SINGLE_POST',
    "priority" "DirectionPriority" NOT NULL DEFAULT 'SECONDARY',
    "status" "TopicCandidateStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileUpdateSuggestion" (
    "id" TEXT NOT NULL,
    "creatorProfileId" TEXT NOT NULL,
    "type" "ProfileUpdateSuggestionType" NOT NULL,
    "beforeValue" TEXT,
    "suggestedValue" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileUpdateSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreatorProfile_isActive_updatedAt_idx" ON "CreatorProfile"("isActive", "updatedAt");

-- CreateIndex
CREATE INDEX "Direction_creatorProfileId_status_priority_idx" ON "Direction"("creatorProfileId", "status", "priority");

-- CreateIndex
CREATE INDEX "Topic_creatorProfileId_status_updatedAt_idx" ON "Topic"("creatorProfileId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "Topic_directionId_heatScore_idx" ON "Topic"("directionId", "heatScore");

-- CreateIndex
CREATE INDEX "TopicCandidate_topicId_status_updatedAt_idx" ON "TopicCandidate"("topicId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "TopicCandidate_anchorSignalId_idx" ON "TopicCandidate"("anchorSignalId");

-- CreateIndex
CREATE INDEX "ProfileUpdateSuggestion_creatorProfileId_status_createdAt_idx" ON "ProfileUpdateSuggestion"("creatorProfileId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ProfileUpdateSuggestion_type_status_idx" ON "ProfileUpdateSuggestion"("type", "status");

-- AddForeignKey
ALTER TABLE "Direction" ADD CONSTRAINT "Direction_creatorProfileId_fkey" FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_creatorProfileId_fkey" FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_directionId_fkey" FOREIGN KEY ("directionId") REFERENCES "Direction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicCandidate" ADD CONSTRAINT "TopicCandidate_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicCandidate" ADD CONSTRAINT "TopicCandidate_anchorSignalId_fkey" FOREIGN KEY ("anchorSignalId") REFERENCES "Signal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileUpdateSuggestion" ADD CONSTRAINT "ProfileUpdateSuggestion_creatorProfileId_fkey" FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

