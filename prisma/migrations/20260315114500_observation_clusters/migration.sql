CREATE TYPE "ObservationCluster" AS ENUM (
  'ai_infrastructure_power',
  'platform_entry_shift',
  'strategic_supply_control',
  'compute_capex_cycle',
  'policy_capital_allocation',
  'risk_repricing_cycle',
  'profit_pool_shift',
  'distribution_model_break',
  'ai_revenue_rebuild',
  'org_efficiency_reorg',
  'individual_capability_shift',
  'sme_positioning_shift'
);

ALTER TABLE "SignalScore"
ADD COLUMN "primaryObservationCluster" "ObservationCluster",
ADD COLUMN "secondaryObservationCluster" "ObservationCluster";

CREATE INDEX "SignalScore_primaryObservationCluster_createdAt_idx"
ON "SignalScore"("primaryObservationCluster", "createdAt");
