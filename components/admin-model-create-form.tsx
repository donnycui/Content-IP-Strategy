"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type {
  ManagedModelCreateResponse,
  ModelTierValue,
} from "@/lib/domain/contracts";

const tierOptions: Array<{ value: ModelTierValue; label: string }> = [
  { value: "FAST", label: "快速" },
  { value: "BALANCED", label: "平衡" },
  { value: "DEEP", label: "深度" },
];

type ProviderOption = {
  id: string;
  name: string;
};

export function AdminModelCreateForm({ providers }: { providers: ProviderOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [gatewayConnectionId, setGatewayConnectionId] = useState(providers[0]?.id ?? "");
  const [modelKey, setModelKey] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [providerKey, setProviderKey] = useState("");
  const [tier, setTier] = useState<ModelTierValue>("BALANCED");
  const [enabled, setEnabled] = useState(true);
  const [visibleToUsers, setVisibleToUsers] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch("/api/admin/models", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gatewayConnectionId,
            modelKey,
            displayName: displayName || undefined,
            providerKey: providerKey || undefined,
            tier,
            enabled,
            visibleToUsers,
          }),
        });

        const result = (await response.json()) as ManagedModelCreateResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "新增模型失败。" : (result.error ?? "新增模型失败。"));
        }

        setFeedback("模型已保存。");
        setModelKey("");
        setDisplayName("");
        setProviderKey("");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "新增模型失败。");
      }
    });
  }

  return (
    <form className="subpanel grid gap-4 px-5 py-5 lg:grid-cols-3" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Provider</p>
        <select
          className="field"
          onChange={(event) => setGatewayConnectionId(event.target.value)}
          value={gatewayConnectionId}
        >
          <option value="">请选择 Provider</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">模型 Key</p>
        <input
          className="field"
          onChange={(event) => setModelKey(event.target.value)}
          placeholder="例如 gpt-5.2"
          value={modelKey}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">显示名称</p>
        <input
          className="field"
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="默认使用模型 Key"
          value={displayName}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Provider Key</p>
        <input
          className="field"
          onChange={(event) => setProviderKey(event.target.value)}
          placeholder="默认使用 Provider 名称"
          value={providerKey}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">模型档位</p>
        <select className="field" onChange={(event) => setTier(event.target.value as ModelTierValue)} value={tier}>
          {tierOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input checked={enabled} onChange={(event) => setEnabled(event.target.checked)} type="checkbox" />
          启用
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input checked={visibleToUsers} onChange={(event) => setVisibleToUsers(event.target.checked)} type="checkbox" />
          对用户可见
        </label>
      </div>
      <div className="lg:col-span-3 flex flex-wrap items-center gap-3">
        <button className="pill" disabled={isPending || !providers.length} type="submit">
          {isPending ? "保存中..." : "手动新增模型"}
        </button>
        {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
        {error ? <span className="text-sm text-rose-600">{error}</span> : null}
      </div>
    </form>
  );
}
