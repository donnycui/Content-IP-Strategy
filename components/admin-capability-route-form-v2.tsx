"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { CapabilityKeyValue, CapabilityRouteUpsertResponse } from "@/lib/domain/contracts";

type ModelOption = {
  id: string;
  label: string;
};

export function AdminCapabilityRouteFormV2(props: {
  capabilityKey: CapabilityKeyValue;
  defaultModelId?: string | null;
  fallbackModelId?: string | null;
  allowFallback: boolean;
  allowUserOverride: boolean;
  notes: string;
  models: ModelOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [defaultModelId, setDefaultModelId] = useState(props.defaultModelId ?? "");
  const [fallbackModelId, setFallbackModelId] = useState(props.fallbackModelId ?? "");
  const [allowFallback, setAllowFallback] = useState(props.allowFallback);
  const [allowUserOverride, setAllowUserOverride] = useState(props.allowUserOverride);
  const [notes, setNotes] = useState(props.notes);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch("/api/admin/routing", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            capabilityKey: props.capabilityKey,
            defaultModelId,
            fallbackModelId: fallbackModelId || null,
            allowFallback,
            allowUserOverride,
            notes,
          }),
        });

        const result = (await response.json()) as CapabilityRouteUpsertResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "Failed to save capability route." : (result.error ?? "Failed to save capability route."));
        }

        setFeedback("Capability route saved.");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Failed to save capability route.");
      }
    });
  }

  return (
    <form className="subpanel space-y-4 px-5 py-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{props.capabilityKey}</h3>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Default Alias</p>
          <select className="field" onChange={(event) => setDefaultModelId(event.target.value)} value={defaultModelId}>
            <option value="">Select default alias</option>
            {props.models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Fallback Alias</p>
          <select className="field" onChange={(event) => setFallbackModelId(event.target.value)} value={fallbackModelId}>
            <option value="">No fallback alias</option>
            {props.models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input checked={allowFallback} onChange={(event) => setAllowFallback(event.target.checked)} type="checkbox" />
          Allow Fallback
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input checked={allowUserOverride} onChange={(event) => setAllowUserOverride(event.target.checked)} type="checkbox" />
          Allow User Override
        </label>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Notes</p>
        <textarea className="field min-h-[88px]" onChange={(event) => setNotes(event.target.value)} value={notes} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="pill" disabled={isPending} type="submit">
          {isPending ? "Saving..." : "Save Route"}
        </button>
        {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
        {error ? <span className="text-sm text-rose-600">{error}</span> : null}
      </div>
    </form>
  );
}
