import { AdminGatewayActionsV2 as AdminGatewayActions } from "@/components/admin-gateway-actions-v2";
import { AdminGatewayCreateFormV2 as AdminGatewayCreateForm } from "@/components/admin-gateway-create-form-v2";
import { getGatewayConnections } from "@/lib/model-management-data";

export const dynamic = "force-dynamic";

const healthLabels = {
  UNKNOWN: "Unknown",
  HEALTHY: "Healthy",
  DEGRADED: "Degraded",
  ERROR: "Error",
} as const;

export default async function AdminGatewaysPage() {
  const gateways = await getGatewayConnections();

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="space-y-2">
          <p className="section-kicker">Admin / Gateway Access</p>
          <p className="section-desc mt-2">
            This page stores the project-facing gateway entry, not direct upstream provider credentials.
          </p>
          <h2 className="section-title mt-2">Configure gateway access and sync aliases</h2>
          <p className="section-desc mt-3">
            Use one `zhaocai-gateway-v2` runtime entry for the project, test admin access, and sync the alias catalog
            used by capability routing.
          </p>
        </div>
      </section>

      <AdminGatewayCreateForm />

      <section className="grid gap-5">
        {gateways.length ? (
          gateways.map((gateway) => (
            <div className="panel space-y-4 px-6 py-5" key={gateway.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="pill">{gateway.isActive ? "Enabled" : "Disabled"}</span>
                    <span className="pill">{healthLabels[gateway.healthStatus]}</span>
                    <span className="pill">{gateway.modelsCount} aliases</span>
                    <span className="pill">{gateway.routeUsageCount} route links</span>
                  </div>
                  <h3 className="text-xl font-semibold">{gateway.name}</h3>
                  <p className="muted break-all text-sm">{gateway.baseUrl}</p>
                </div>
                <AdminGatewayActions
                  gatewayId={gateway.id}
                  isActive={gateway.isActive}
                  routeUsageCount={gateway.routeUsageCount}
                />
              </div>
              <div className="grid gap-4 text-sm text-slate-700 lg:grid-cols-3">
                <div>
                  <p className="metric-label">Auth Type</p>
                  <p className="mt-1">{gateway.authType}</p>
                </div>
                <div>
                  <p className="metric-label">Client Key Env</p>
                  <p className="mt-1">{gateway.authSecretRef || "Not configured"}</p>
                </div>
                <div>
                  <p className="metric-label">Last Synced</p>
                  <p className="mt-1">{gateway.lastSyncedAt || "Never"}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <section className="panel px-6 py-8">
            <p className="text-lg font-semibold">No gateway access is configured yet.</p>
            <p className="muted mt-2 max-w-3xl text-sm leading-7">
              Add the `zhaocai-gateway-v2` access point first, then test it and sync aliases.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
