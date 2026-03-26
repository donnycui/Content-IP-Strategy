import Link from "next/link";
import { AdminModelCreateForm } from "@/components/admin-model-create-form";
import { AdminModelUpdateForm } from "@/components/admin-model-update-form";
import { getGatewayConnections, getManagedModels } from "@/lib/model-management-data";

export const dynamic = "force-dynamic";

export default async function AdminModelsPage() {
  const [models, gateways] = await Promise.all([getManagedModels(), getGatewayConnections()]);
  const activeProviders = gateways.filter((gateway) => gateway.isActive);

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="space-y-2">
          <p className="section-kicker">Admin / Models</p>
          <h2 className="section-title mt-2">把 Provider 模型变成可用的产品资产</h2>
          <p className="section-desc mt-3">这里负责决定哪些模型启用、处于什么档位、以及是否对用户可见。</p>
        </div>
        <div className="mt-4">
          <Link className="pill" href="/admin/routing">
            打开能力路由配置
          </Link>
        </div>
      </section>

      <AdminModelCreateForm providers={activeProviders.map((provider) => ({ id: provider.id, name: provider.name }))} />

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
                    <span className="pill">{model.routeUsageCount} 条路由引用</span>
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
            <p className="text-lg font-semibold">当前还没有同步模型。</p>
            <p className="muted mt-2 text-sm leading-7">先到 Provider 连接页完成模型同步，这里才会出现可配置的模型列表。</p>
          </section>
        )}
      </section>
    </main>
  );
}
