"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { GatewayAuthTypeValue, GatewayCreateResponse } from "@/lib/domain/contracts";

const authOptions: Array<{ value: GatewayAuthTypeValue; label: string }> = [
  { value: "NONE", label: "None" },
  { value: "BEARER", label: "Bearer Token" },
  { value: "API_KEY", label: "API Key" },
  { value: "PASSCODE", label: "Passcode" },
];

export function AdminGatewayCreateFormV2() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("zhaocai-gateway-v2");
  const [baseUrl, setBaseUrl] = useState("");
  const [authType, setAuthType] = useState<GatewayAuthTypeValue>("BEARER");
  const [authSecretRef, setAuthSecretRef] = useState("MODEL_ROUTER_GATEWAY_CLIENT_KEY");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch("/api/admin/gateways", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            baseUrl,
            authType,
            authSecretRef,
          }),
        });

        const result = (await response.json()) as GatewayCreateResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "Failed to create gateway access." : (result.error ?? "Failed to create gateway access."));
        }

        setFeedback("Gateway access created.");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Failed to create gateway access.");
      }
    });
  }

  return (
    <form className="subpanel grid gap-4 px-5 py-5 lg:grid-cols-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Gateway Name</p>
        <input className="field" onChange={(event) => setName(event.target.value)} value={name} />
      </div>
      <div className="space-y-2 lg:col-span-2">
        <p className="text-sm font-semibold text-slate-700">Base URL</p>
        <input
          className="field"
          onChange={(event) => setBaseUrl(event.target.value)}
          placeholder="https://gateway.example.com"
          value={baseUrl}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Auth Type</p>
        <select className="field" onChange={(event) => setAuthType(event.target.value as GatewayAuthTypeValue)} value={authType}>
          {authOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2 lg:col-span-3">
        <p className="text-sm font-semibold text-slate-700">Client Key Env Var</p>
        <input
          className="field"
          onChange={(event) => setAuthSecretRef(event.target.value)}
          placeholder="MODEL_ROUTER_GATEWAY_CLIENT_KEY"
          value={authSecretRef}
        />
      </div>
      <div className="flex items-end gap-3">
        <button
          className="rounded-2xl border border-sky-300/40 bg-sky-400/10 px-4 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:opacity-50"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Creating..." : "Add Gateway Access"}
        </button>
      </div>
      <div className="lg:col-span-4">
        {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
        {error ? <span className="text-sm text-rose-600">{error}</span> : null}
      </div>
    </form>
  );
}
