-- CreateEnum
CREATE TYPE "ProfileExtractionSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "ProfileExtractionSourceMode" AS ENUM ('CONVERSATIONAL', 'QUICK');

-- CreateTable
CREATE TABLE "ProfileExtractionSession" (
    "id" TEXT NOT NULL,
    "status" "ProfileExtractionSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "sourceMode" "ProfileExtractionSourceMode" NOT NULL DEFAULT 'CONVERSATIONAL',
    "transcriptJson" JSONB NOT NULL,
    "draftProfileJson" JSONB NOT NULL,
    "currentQuestion" TEXT,
    "questionType" TEXT,
    "turnCount" INTEGER NOT NULL DEFAULT 0,
    "lastUserMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileExtractionSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileExtractionSession_status_updatedAt_idx" ON "ProfileExtractionSession"("status", "updatedAt");
