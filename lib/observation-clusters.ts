export const observationClusterLabels = {
  ai_infrastructure_power: "AI 基础设施权力集中",
  platform_entry_shift: "平台入口权迁移",
  strategic_supply_control: "半导体与关键供给控制",
  compute_capex_cycle: "算力与基础设施资本开支",
  policy_capital_allocation: "政策驱动型产业投资",
  risk_repricing_cycle: "风险偏好与估值再定价",
  profit_pool_shift: "平台利润池迁移",
  distribution_model_break: "旧分发模式失效",
  ai_revenue_rebuild: "AI 重做收入结构",
  org_efficiency_reorg: "组织效率与岗位重组",
  individual_capability_shift: "高认知个体能力迁移",
  sme_positioning_shift: "中小企业站位变化",
} as const;

export type ObservationClusterKey = keyof typeof observationClusterLabels;

export const observationClusterLabelToKey = Object.fromEntries(
  Object.entries(observationClusterLabels).map(([key, label]) => [label, key]),
) as Record<(typeof observationClusterLabels)[ObservationClusterKey], ObservationClusterKey>;

export function resolveObservationClusterKey(input?: string | null): ObservationClusterKey | null {
  if (!input) {
    return null;
  }

  if (input in observationClusterLabels) {
    return input as ObservationClusterKey;
  }

  return observationClusterLabelToKey[input as (typeof observationClusterLabels)[ObservationClusterKey]] ?? null;
}

export function getObservationClusterLabel(input?: string | null): string | null {
  const key = resolveObservationClusterKey(input);
  return key ? observationClusterLabels[key] : null;
}
