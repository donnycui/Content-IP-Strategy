"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type {
  GatewayDeleteResponse,
  GatewaySyncResponse,
  GatewayTestResponse,
  GatewayUpdateResponse,
} from "@/lib/domain/contracts";

export function AdminGatewayActionsV2({
  gatewayId,
  isActive,
  routeUsageCount,
}: {
  gatewayId: string;
  isActive: boolean;
  routeUsageCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function handleAction(action: "test" | "sync" | "toggle" | "delete") {
    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        if (action === "test") {
          const response = await fetch(`/api/admin/gateways/${gatewayId}/test`, {
            method: "POST",
          });
          const result = (await response.json()) as GatewayTestResponse;
          if (!response.ok || !result.ok) {
            throw new Error(result.ok ? "Failed to test gateway access." : (result.error ?? "Failed to test gateway access."));
          }
          setFeedback(
            result.data.healthy
              ? "Gateway alias admin access is healthy."
              : "Gateway responded, but the alias admin endpoint is degraded.",
          );
        } else if (action === "sync") {
          const response = await fetch(`/api/admin/gateways/${gatewayId}/sync`, {
            method: "POST",
          });
          const result = (await response.json()) as GatewaySyncResponse;
          if (!response.ok || !result.ok) {
            throw new Error(result.ok ? "Failed to sync aliases." : (result.error ?? "Failed to sync aliases."));
          }
          setFeedback(`Synced ${result.data.upsertedCount} aliases.`);
        } else if (action === "toggle") {
          const response = await fetch(`/api/admin/gateways/${gatewayId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              isActive: !isActive,
            }),
          });
          const result = (await response.json()) as GatewayUpdateResponse;
          if (!response.ok || !result.ok) {
            throw new Error(result.ok ? "Failed to update gateway access." : (result.error ?? "Failed to update gateway access."));
          }
          setFeedback(isActive ? "Gateway access disabled." : "Gateway access enabled.");
        } else {
          const response = await fetch(`/api/admin/gateways/${gatewayId}`, {
            method: "DELETE",
          });
          const result = (await response.json()) as GatewayDeleteResponse;
          if (!response.ok || !result.ok) {
            throw new Error(result.ok ? "Failed to delete gateway access." : (result.error ?? "Failed to delete gateway access."));
          }
          setFeedback("Gateway access deleted.");
        }

        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Action failed.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button className="pill" disabled={isPending} onClick={() => handleAction("test")} type="button">
          {isPending ? "Working..." : "Test Access"}
        </button>
        <button className="pill" disabled={isPending} onClick={() => handleAction("sync")} type="button">
          {isPending ? "Working..." : "Sync Aliases"}
        </button>
        <button
          className="pill"
          disabled={isPending || (isActive && routeUsageCount > 0)}
          onClick={() => handleAction("toggle")}
          type="button"
        >
          {isPending ? "Working..." : isActive ? "Disable Access" : "Enable Access"}
        </button>
        <button
          className="pill"
          disabled={isPending || routeUsageCount > 0}
          onClick={() => handleAction("delete")}
          type="button"
        >
          {isPending ? "Working..." : "Delete Access"}
        </button>
      </div>
      {routeUsageCount > 0 ? (
        <p className="text-sm text-amber-700">
          This gateway access is still referenced by {routeUsageCount} capability routes, so it cannot be disabled or deleted yet.
        </p>
      ) : null}
      {feedback ? <p className="text-sm text-emerald-700">{feedback}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
