-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('RSS', 'WEBSITE', 'NEWSLETTER', 'MANUAL_URL', 'SOCIAL_LINK', 'DISCLOSURE', 'BLOG');

-- CreateEnum
CREATE TYPE "SignalStatus" AS ENUM ('NEW', 'REVIEWED', 'CANDIDATE', 'DEFERRED', 'IGNORED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'KEPT', 'REJECTED', 'DEFERRED');

-- CreateEnum
CREATE TYPE "ReasoningAcceptance" AS ENUM ('ACCEPTED', 'PARTIAL', 'REJECTED');

-- CreateEnum
CREATE TYPE "ClusterStatus" AS ENUM ('ACTIVE', 'MERGED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ResearchCardStatus" AS ENUM ('DRAFT', 'READY', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DraftPlatform" AS ENUM ('WECHAT_ARTICLE', 'WECHAT_VIDEO', 'SHORT_POST');

-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('DRAFT', 'READY', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TagType" AS ENUM ('TOPIC', 'COMPANY', 'PERSON', 'COUNTRY', 'INDUSTRY', 'MOTHER_THEME');

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "baseUrl" TEXT,
    "feedUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "qualityScore" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "author" TEXT,
    "language" TEXT,
    "publishedAt" TIMESTAMP(3),
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawContent" TEXT,
    "summary" TEXT,
    "status" "SignalStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignalTag" (
    "id" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "tagType" "TagType" NOT NULL,

    CONSTRAINT "SignalTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignalCluster" (
    "id" TEXT NOT NULL,
    "clusterTitle" TEXT NOT NULL,
    "clusterSummary" TEXT,
    "heatScore" DOUBLE PRECISION,
    "status" "ClusterStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignalCluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignalClusterItem" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "similarityScore" DOUBLE PRECISION,

    CONSTRAINT "SignalClusterItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignalScore" (
    "id" TEXT NOT NULL,
    "signalId" TEXT,
    "clusterId" TEXT,
    "importanceScore" DOUBLE PRECISION NOT NULL,
    "viewpointScore" DOUBLE PRECISION NOT NULL,
    "structuralScore" DOUBLE PRECISION,
    "impactScore" DOUBLE PRECISION,
    "redistributionScore" DOUBLE PRECISION,
    "durabilityScore" DOUBLE PRECISION,
    "confidenceScore" DOUBLE PRECISION,
    "reasoningSummary" TEXT NOT NULL,
    "reasoningDetail" TEXT,
    "modelName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignalScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HumanReview" (
    "id" TEXT NOT NULL,
    "signalId" TEXT,
    "clusterId" TEXT,
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "adjustedImportanceScore" DOUBLE PRECISION,
    "adjustedViewpointScore" DOUBLE PRECISION,
    "reasoningAcceptance" "ReasoningAcceptance",
    "reviewNote" TEXT,
    "myAngle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HumanReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchCard" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "eventDefinition" TEXT,
    "mainstreamNarrative" TEXT,
    "ignoredVariables" TEXT,
    "historicalAnalogy" TEXT,
    "threeMonthProjection" TEXT,
    "oneYearProjection" TEXT,
    "winnersLosers" TEXT,
    "positioningJudgment" TEXT,
    "status" "ResearchCardStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentDraft" (
    "id" TEXT NOT NULL,
    "researchCardId" TEXT NOT NULL,
    "platform" "DraftPlatform" NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "toneVersion" TEXT,
    "status" "DraftStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentFeedback" (
    "id" TEXT NOT NULL,
    "contentDraftId" TEXT NOT NULL,
    "platform" "DraftPlatform" NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "views" INTEGER,
    "saves" INTEGER,
    "shares" INTEGER,
    "comments" INTEGER,
    "qualityNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Signal_url_key" ON "Signal"("url");

-- CreateIndex
CREATE INDEX "Signal_sourceId_publishedAt_idx" ON "Signal"("sourceId", "publishedAt");

-- CreateIndex
CREATE INDEX "Signal_status_idx" ON "Signal"("status");

-- CreateIndex
CREATE INDEX "SignalTag_signalId_idx" ON "SignalTag"("signalId");

-- CreateIndex
CREATE INDEX "SignalTag_tag_idx" ON "SignalTag"("tag");

-- CreateIndex
CREATE INDEX "SignalTag_tagType_idx" ON "SignalTag"("tagType");

-- CreateIndex
CREATE INDEX "SignalCluster_status_idx" ON "SignalCluster"("status");

-- CreateIndex
CREATE INDEX "SignalClusterItem_signalId_idx" ON "SignalClusterItem"("signalId");

-- CreateIndex
CREATE UNIQUE INDEX "SignalClusterItem_clusterId_signalId_key" ON "SignalClusterItem"("clusterId", "signalId");

-- CreateIndex
CREATE INDEX "SignalScore_signalId_createdAt_idx" ON "SignalScore"("signalId", "createdAt");

-- CreateIndex
CREATE INDEX "SignalScore_clusterId_createdAt_idx" ON "SignalScore"("clusterId", "createdAt");

-- CreateIndex
CREATE INDEX "HumanReview_signalId_createdAt_idx" ON "HumanReview"("signalId", "createdAt");

-- CreateIndex
CREATE INDEX "HumanReview_clusterId_createdAt_idx" ON "HumanReview"("clusterId", "createdAt");

-- CreateIndex
CREATE INDEX "HumanReview_reviewStatus_idx" ON "HumanReview"("reviewStatus");

-- CreateIndex
CREATE INDEX "ResearchCard_clusterId_idx" ON "ResearchCard"("clusterId");

-- CreateIndex
CREATE INDEX "ResearchCard_status_idx" ON "ResearchCard"("status");

-- CreateIndex
CREATE INDEX "ContentDraft_researchCardId_idx" ON "ContentDraft"("researchCardId");

-- CreateIndex
CREATE INDEX "ContentDraft_platform_status_idx" ON "ContentDraft"("platform", "status");

-- CreateIndex
CREATE INDEX "ContentFeedback_contentDraftId_idx" ON "ContentFeedback"("contentDraftId");

-- CreateIndex
CREATE INDEX "ContentFeedback_platform_publishedAt_idx" ON "ContentFeedback"("platform", "publishedAt");

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalTag" ADD CONSTRAINT "SignalTag_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalClusterItem" ADD CONSTRAINT "SignalClusterItem_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "SignalCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalClusterItem" ADD CONSTRAINT "SignalClusterItem_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalScore" ADD CONSTRAINT "SignalScore_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalScore" ADD CONSTRAINT "SignalScore_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "SignalCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanReview" ADD CONSTRAINT "HumanReview_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanReview" ADD CONSTRAINT "HumanReview_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "SignalCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchCard" ADD CONSTRAINT "ResearchCard_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "SignalCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentDraft" ADD CONSTRAINT "ContentDraft_researchCardId_fkey" FOREIGN KEY ("researchCardId") REFERENCES "ResearchCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentFeedback" ADD CONSTRAINT "ContentFeedback_contentDraftId_fkey" FOREIGN KEY ("contentDraftId") REFERENCES "ContentDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

