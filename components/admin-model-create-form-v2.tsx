"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ManagedModelCreateResponse, ModelTierValue } from "@/lib/domain/contracts";

const tierOptions: Array<{ value: ModelTierValue; label: string }> = [
  { value: "FAST", label: "Fast" },
  { value: "BALANCED", label: "Balanced" },
  { value: "DEEP", label: "Deep" },
];

type GatewayOption = {
  id: string;
  name: string;
};

export function AdminModelCreateFormV2({ gateways }: { gateways: GatewayOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [gatewayConnectionId, setGatewayConnectionId] = useState(gateways[0]?.id ?? "");
  const [modelKey, setModelKey] = useState("");
  const [displayName, setDisplayName] = useState("");
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
            tier,
            enabled,
            visibleToUsers,
          }),
        });

        const result = (await response.json()) as ManagedModelCreateResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "Failed to save alias." : (result.error ?? "Failed to save alias."));
        }

        setFeedback("Alias saved.");
        setModelKey("");
        setDisplayName("");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Failed to save alias.");
      }
    });
  }

  return (
    <form className="subpanel grid gap-4 px-5 py-5 lg:grid-cols-3" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Gateway Access</p>
        <select className="field" onChange={(event) => setGatewayConnectionId(event.target.value)} value={gatewayConnectionId}>
          <option value="">Select gateway access</option>
          {gateways.map((gateway) => (
            <option key={gateway.id} value={gateway.id}>
              {gateway.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Alias Key</p>
        <input
          className="field"
          onChange={(event) => setModelKey(event.target.value)}
          placeholder="signal/deep"
          value={modelKey}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Display Name</p>
        <input
          className="field"
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Signal Deep"
          value={displayName}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Tier</p>
        <select className="field" onChange={(event) => setTier(event.target.value as ModelTierValue)} value={tier}>
          {tierOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-4 lg:col-span-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input checked={enabled} onChange={(event) => setEnabled(event.target.checked)} type="checkbox" />
          Enabled
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input checked={visibleToUsers} onChange={(event) => setVisibleToUsers(event.target.checked)} type="checkbox" />
          Visible To Users
        </label>
      </div>
      <div className="lg:col-span-3 flex flex-wrap items-center gap-3">
        <button className="pill" disabled={isPending || !gateways.length} type="submit">
          {isPending ? "Saving..." : "Add Alias"}
        </button>
        {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
        {error ? <span className="text-sm text-rose-600">{error}</span> : null}
      </div>
    </form>
  );
}
