"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type {
  ManagedModelDeleteResponse,
  ManagedModelUpdateResponse,
  ModelTierValue,
} from "@/lib/domain/contracts";

const tierOptions: Array<{ value: ModelTierValue; label: string }> = [
  { value: "FAST", label: "Fast" },
  { value: "BALANCED", label: "Balanced" },
  { value: "DEEP", label: "Deep" },
];

export function AdminModelUpdateFormV2(props: {
  id: string;
  tier: ModelTierValue;
  enabled: boolean;
  visibleToUsers: boolean;
  routeUsageCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tier, setTier] = useState<ModelTierValue>(props.tier);
  const [enabled, setEnabled] = useState(props.enabled);
  const [visibleToUsers, setVisibleToUsers] = useState(props.visibleToUsers);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch(`/api/admin/models/${props.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tier,
            enabled,
            visibleToUsers,
          }),
        });

        const result = (await response.json()) as ManagedModelUpdateResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "Failed to update alias." : (result.error ?? "Failed to update alias."));
        }

        setFeedback("Alias updated.");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Failed to update alias.");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch(`/api/admin/models/${props.id}`, {
          method: "DELETE",
        });

        const result = (await response.json()) as ManagedModelDeleteResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "Failed to delete alias." : (result.error ?? "Failed to delete alias."));
        }

        setFeedback("Alias deleted.");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Failed to delete alias.");
      }
    });
  }

  return (
    <form className="flex flex-wrap items-center gap-3" onSubmit={handleSubmit}>
      <select className="field min-w-[120px]" onChange={(event) => setTier(event.target.value as ModelTierValue)} value={tier}>
        {tierOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input checked={enabled} onChange={(event) => setEnabled(event.target.checked)} type="checkbox" />
        Enabled
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input checked={visibleToUsers} onChange={(event) => setVisibleToUsers(event.target.checked)} type="checkbox" />
        Visible To Users
      </label>
      <button className="pill" disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Save Alias"}
      </button>
      <button
        className="pill"
        disabled={isPending || props.routeUsageCount > 0}
        onClick={handleDelete}
        type="button"
      >
        {isPending ? "Working..." : "Delete Alias"}
      </button>
      <Link className="pill" href="/admin/routing">
        Open Routing
      </Link>
      {props.routeUsageCount > 0 ? (
        <span className="text-sm text-amber-700">
          This alias is still referenced by {props.routeUsageCount} capability routes, so it cannot be deleted or disabled yet.
        </span>
      ) : null}
      {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
      {error ? <span className="text-sm text-rose-600">{error}</span> : null}
    </form>
  );
}
