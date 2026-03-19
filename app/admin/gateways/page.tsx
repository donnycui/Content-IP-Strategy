import { AdminGatewayActions } from "@/components/admin-gateway-actions";
import { AdminGatewayCreateForm } from "@/components/admin-gateway-create-form";
import { getGatewayConnections } from "@/lib/model-management-data";

export const dynamic = "force-dynamic";

const healthLabels = {
  UNKNOWN: "未知",
  HEALTHY: "健康",
  DEGRADED: "降级",
  ERROR: "异常",
} as const;

export default async function AdminGatewaysPage() {
  const gateways = await getGatewayConnections();

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="space-y-2">
          <p className="section-kicker">Admin / Gateway</p>
          <h2 className="section-title mt-2">连接模型网关并拉取可用模型</h2>
          <p className="section-desc mt-3">
            第一阶段这里优先管理 `zhaocai-gateway`。你可以新增网关、测试连接，并把 provider/model 元数据同步进 Creator OS。
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
                    <span className="pill">{gateway.isActive ? "启用中" : "已停用"}</span>
                    <span className="pill">{healthLabels[gateway.healthStatus]}</span>
                    <span className="pill">{gateway.modelsCount} 个模型</span>
                  </div>
                  <h3 className="text-xl font-semibold">{gateway.name}</h3>
                  <p className="muted text-sm break-all">{gateway.baseUrl}</p>
                </div>
                <AdminGatewayActions gatewayId={gateway.id} />
              </div>
              <div className="grid gap-4 text-sm text-slate-700 lg:grid-cols-3">
                <div>
                  <p className="metric-label">鉴权方式</p>
                  <p className="mt-1">{gateway.authType}</p>
                </div>
                <div>
                  <p className="metric-label">密钥环境变量</p>
                  <p className="mt-1">{gateway.authSecretRef || "未设置"}</p>
                </div>
                <div>
                  <p className="metric-label">最近同步</p>
                  <p className="mt-1">{gateway.lastSyncedAt}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <section className="panel px-6 py-8">
            <p className="text-lg font-semibold">当前还没有模型网关。</p>
            <p className="muted mt-2 max-w-3xl text-sm leading-7">先新增一个 `zhaocai-gateway` 连接，再测试和同步模型。</p>
          </section>
        )}
      </section>
    </main>
  );
}
