import Link from "next/link";
import { AdminModelCreateFormV2 as AdminModelCreateForm } from "@/components/admin-model-create-form-v2";
import { AdminModelUpdateFormV2 as AdminModelUpdateForm } from "@/components/admin-model-update-form-v2";
import { getGatewayConnections, getManagedModels } from "@/lib/model-management-data";

export const revalidate = 30;

export default async function AdminModelsPage() {
  const [models, gateways] = await Promise.all([getManagedModels(), getGatewayConnections()]);
  const activeGateways = gateways.filter((gateway) => gateway.isActive);

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="space-y-2">
          <p className="section-kicker">Admin / Alias Catalog</p>
          <p className="section-desc mt-2">These rows represent gateway aliases used by capability routing.</p>
          <h2 className="section-title mt-2">Review synced aliases and control visibility</h2>
          <p className="section-desc mt-3">
            Use this catalog to decide which aliases stay enabled, which tier they belong to, and whether they are
            visible to product users.
          </p>
        </div>
        <div className="mt-4">
          <Link className="pill" href="/admin/routing">
            Open capability routing
          </Link>
        </div>
      </section>

      <AdminModelCreateForm gateways={activeGateways.map((gateway) => ({ id: gateway.id, name: gateway.name }))} />

      <section className="grid gap-5">
        {models.length ? (
          models.map((model) => (
            <div className="panel space-y-4 px-6 py-5" key={model.id}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="pill">{model.gatewayName}</span>
                    <span className="pill">{model.providerKey}</span>
                    <span className="pill">{model.modelKey}</span>
                    <span className="pill">{model.routeUsageCount} route links</span>
                  </div>
                  <h3 className="text-xl font-semibold">{model.displayName}</h3>
                </div>
              </div>
              <AdminModelUpdateForm
                enabled={model.enabled}
                id={model.id}
                routeUsageCount={model.routeUsageCount}
                tier={model.tier}
                visibleToUsers={model.visibleToUsers}
              />
            </div>
          ))
        ) : (
          <section className="panel px-6 py-8">
            <p className="text-lg font-semibold">No aliases have been synced yet.</p>
            <p className="muted mt-2 text-sm leading-7">
              Go to Gateway Access, test the gateway entry, and run alias sync. The synced aliases will appear here.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
