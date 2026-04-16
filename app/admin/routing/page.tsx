import { AdminCapabilityRouteFormV2 as AdminCapabilityRouteForm } from "@/components/admin-capability-route-form-v2";
import { getCapabilityRoutes, getManagedModels } from "@/lib/model-management-data";
import { MODEL_CAPABILITY_KEYS } from "@/lib/services/model-routing-service";

export const revalidate = 30;

const capabilityDescriptions: Record<(typeof MODEL_CAPABILITY_KEYS)[number], string> = {
  signal_scoring: "Initial signal scoring and screening",
  ip_extraction_interview: "Profile extraction interview",
  ip_strategy_report: "IP strategy report generation",
  direction_generation: "Direction generation",
  topic_generation: "Topic generation",
  topic_candidate_generation: "Topic candidate generation",
  profile_evolution: "Profile evolution suggestions",
  draft_generation: "Draft generation",
};

export default async function AdminRoutingPage() {
  const [routes, models] = await Promise.all([getCapabilityRoutes(), getManagedModels()]);
  const routeIndex = new Map(routes.map((route) => [route.capabilityKey, route]));
  const modelOptions = models
    .filter((model) => model.enabled)
    .map((model) => ({
      id: model.id,
      label: `${model.displayName} / ${model.modelKey} / ${model.tier}`,
    }));

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="space-y-2">
          <p className="section-kicker">Admin / Capability Routing</p>
          <p className="section-desc mt-2">
            Bind each business capability to a gateway alias instead of a real upstream model.
          </p>
          <h2 className="section-title mt-2">Bind each capability to a default alias</h2>
          <p className="section-desc mt-3">
            Each capability selects from the synced alias catalog. Real upstream fallback stays inside
            `zhaocai-gateway-v2`, not in this routing page.
          </p>
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
          <p className="text-lg font-semibold">No aliases are available for routing yet.</p>
          <p className="muted mt-2 text-sm leading-7">
            Sync aliases from Gateway Access first, then return here to bind capabilities to their default aliases.
          </p>
        </section>
      )}
    </main>
  );
}
