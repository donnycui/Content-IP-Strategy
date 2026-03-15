CREATE TYPE "PriorityRecommendation" AS ENUM ('PRIORITIZE', 'WATCH', 'DEPRIORITIZE');

ALTER TABLE "SignalScore"
ADD COLUMN "consensusStrength" DOUBLE PRECISION,
ADD COLUMN "companyRoutineScore" DOUBLE PRECISION,
ADD COLUMN "priorityRecommendation" "PriorityRecommendation" NOT NULL DEFAULT 'WATCH';

CREATE INDEX "SignalScore_priorityRecommendation_createdAt_idx"
ON "SignalScore"("priorityRecommendation", "createdAt");
