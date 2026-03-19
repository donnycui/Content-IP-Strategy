import { AdminCapabilityRouteForm } from "@/components/admin-capability-route-form";
import { getCapabilityRoutes, getManagedModels } from "@/lib/model-management-data";
import { MODEL_CAPABILITY_KEYS } from "@/lib/services/model-routing-service";

export const dynamic = "force-dynamic";

const capabilityDescriptions: Record<(typeof MODEL_CAPABILITY_KEYS)[number], string> = {
  signal_scoring: "信号初筛与初步判断",
  ip_extraction_interview: "IP 提炼访谈",
  ip_strategy_report: "IP 战略报告",
  direction_generation: "方向生成",
  topic_generation: "主题生成",
  topic_candidate_generation: "选题推荐",
  profile_evolution: "画像进化建议",
  draft_generation: "草稿生成",
};

export default async function AdminRoutingPage() {
  const [routes, models] = await Promise.all([getCapabilityRoutes(), getManagedModels()]);
  const routeIndex = new Map(routes.map((route) => [route.capabilityKey, route]));
  const modelOptions = models
    .filter((model) => model.enabled)
    .map((model) => ({
      id: model.id,
      label: `${model.gatewayName} / ${model.displayName} / ${model.tier}`,
    }));

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="space-y-2">
          <p className="section-kicker">Admin / Routing</p>
          <h2 className="section-title mt-2">给每个 Creator OS capability 配默认模型策略</h2>
          <p className="section-desc mt-3">这里是模型管理的核心。系统最终会按 capability 路由，而不是按页面硬编码模型。</p>
        </div>
      </section>

      {modelOptions.length ? (
        <section className="grid gap-5">
          {MODEL_CAPABILITY_KEYS.map((capabilityKey) => {
            const route = routeIndex.get(capabilityKey);

            return (
              <div className="panel space-y-4 px-6 py-5" key={capabilityKey}>
                <div className="space-y-1">
                  <p className="metric-label">{capabilityKey}</p>
                  <p className="muted text-sm">{capabilityDescriptions[capabilityKey]}</p>
                </div>
                <AdminCapabilityRouteForm
                  allowFallback={route?.allowFallback ?? false}
                  allowUserOverride={route?.allowUserOverride ?? false}
                  capabilityKey={capabilityKey}
                  defaultModelId={route?.defaultModelId ?? ""}
                  fallbackModelId={route?.fallbackModelId ?? ""}
                  models={modelOptions}
                  notes={route?.notes ?? ""}
                />
              </div>
            );
          })}
        </section>
      ) : (
        <section className="panel px-6 py-8">
          <p className="text-lg font-semibold">当前还没有可路由的模型。</p>
          <p className="muted mt-2 text-sm leading-7">先去网关页同步模型，再回来给 capability 配默认模型和 fallback。</p>
        </section>
      )}
    </main>
  );
}
