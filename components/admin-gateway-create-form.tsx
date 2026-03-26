"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { GatewayAuthTypeValue, GatewayCreateResponse } from "@/lib/domain/contracts";

const authOptions: Array<{ value: GatewayAuthTypeValue; label: string }> = [
  { value: "NONE", label: "无鉴权" },
  { value: "BEARER", label: "Bearer Token" },
  { value: "API_KEY", label: "API Key" },
  { value: "PASSCODE", label: "Passcode" },
];

export function AdminGatewayCreateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("openai-primary");
  const [baseUrl, setBaseUrl] = useState("");
  const [authType, setAuthType] = useState<GatewayAuthTypeValue>("BEARER");
  const [authSecretRef, setAuthSecretRef] = useState("OPENAI_API_KEY");
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
          throw new Error(result.ok ? "创建 Provider 连接失败。" : (result.error ?? "创建 Provider 连接失败。"));
        }

        setFeedback("Provider 连接已创建。");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "创建 Provider 连接失败。");
      }
    });
  }

  return (
    <form className="subpanel grid gap-4 px-5 py-5 lg:grid-cols-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Provider 名称</p>
        <input className="field" onChange={(event) => setName(event.target.value)} value={name} />
      </div>
      <div className="space-y-2 lg:col-span-2">
        <p className="text-sm font-semibold text-slate-700">Base URL</p>
        <input className="field" onChange={(event) => setBaseUrl(event.target.value)} placeholder="https://api.openai.com/v1" value={baseUrl} />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">鉴权方式</p>
        <select className="field" onChange={(event) => setAuthType(event.target.value as GatewayAuthTypeValue)} value={authType}>
          {authOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2 lg:col-span-3">
        <p className="text-sm font-semibold text-slate-700">密钥环境变量名</p>
        <input
          className="field"
          onChange={(event) => setAuthSecretRef(event.target.value)}
          placeholder="例如 OPENAI_API_KEY"
          value={authSecretRef}
        />
      </div>
      <div className="flex items-end gap-3">
        <button className="rounded-2xl border border-sky-300/40 bg-sky-400/10 px-4 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:opacity-50" disabled={isPending} type="submit">
          {isPending ? "创建中..." : "新增 Provider"}
        </button>
      </div>
      <div className="lg:col-span-4">
        {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
        {error ? <span className="text-sm text-rose-600">{error}</span> : null}
      </div>
    </form>
  );
}
