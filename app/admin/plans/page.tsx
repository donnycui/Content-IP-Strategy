import { AdminPlanAccessForm } from "@/components/admin-plan-access-form";
import { getPlanModelAccessRows } from "@/lib/model-management-data";

export const dynamic = "force-dynamic";

const planLabels: Record<string, string> = {
  STANDARD: "标准版",
  PROFESSIONAL: "专业版",
  FLAGSHIP: "旗舰版",
};

export default async function AdminPlansPage() {
  const scopes = await getPlanModelAccessRows();

  function describeScope(scope: (typeof scopes)[number]) {
    const tierLabel = scope.allowedTiers.join(" / ");

    if (scope.canSelectModel) {
      return `当前模型档位：${tierLabel}；允许用户手动选择模型。`;
    }

    if (scope.canUsePremiumReasoning) {
      return `当前模型档位：${tierLabel}；允许使用深度推理。`;
    }

    return `当前模型档位：${tierLabel}；采用系统固定模型。`;
  }

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="space-y-2">
          <p className="section-kicker">Admin / Plans</p>
          <h2 className="section-title mt-2">定义不同套餐可使用哪些模型档位</h2>
          <p className="section-desc mt-3">
            这里决定标准版、专业版、旗舰版分别能用哪些 tier，以及是否允许用户手动切模型。
          </p>
        </div>
      </section>

      <section className="panel px-6 py-5">
        <AdminPlanAccessForm title="新增或覆盖一个套餐权限范围" />
      </section>

      {scopes.length ? (
        <section className="grid gap-5">
          {scopes.map((scope) => (
            <div className="panel px-6 py-5" key={`${scope.planKey}-${scope.capabilityKey ?? "global"}`}>
              <div className="mb-4 space-y-1">
                <p className="metric-label">
                  {planLabels[scope.planKey] ?? scope.planKey} / {scope.scopeLabel}
                </p>
                <p className="muted text-sm">{describeScope(scope)}</p>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="panel px-6 py-8">
          <p className="text-lg font-semibold">当前还没有套餐权限配置。</p>
          <p className="muted mt-2 text-sm leading-7">先保存一条全局默认范围，例如标准版只允许 FAST / BALANCED。</p>
        </section>
      )}
    </main>
  );
}
