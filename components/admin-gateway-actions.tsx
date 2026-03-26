"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type {
  GatewayDeleteResponse,
  GatewaySyncResponse,
  GatewayTestResponse,
  GatewayUpdateResponse,
} from "@/lib/domain/contracts";

export function AdminGatewayActions({
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
            throw new Error(result.ok ? "测试 Provider 连接失败。" : (result.error ?? "测试 Provider 连接失败。"));
          }
          setFeedback(result.data.healthy ? "Provider 连接健康。" : "Provider 可连通，但模型目录状态异常。");
        } else if (action === "sync") {
          const response = await fetch(`/api/admin/gateways/${gatewayId}/sync`, {
            method: "POST",
          });
          const result = (await response.json()) as GatewaySyncResponse;
          if (!response.ok || !result.ok) {
            throw new Error(result.ok ? "同步模型失败。" : (result.error ?? "同步模型失败。"));
          }
          setFeedback(`已同步 ${result.data.upsertedCount} 个模型。`);
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
            throw new Error(result.ok ? "更新 Provider 状态失败。" : (result.error ?? "更新 Provider 状态失败。"));
          }
          setFeedback(isActive ? "Provider 已停用。" : "Provider 已启用。");
        } else {
          const response = await fetch(`/api/admin/gateways/${gatewayId}`, {
            method: "DELETE",
          });
          const result = (await response.json()) as GatewayDeleteResponse;
          if (!response.ok || !result.ok) {
            throw new Error(result.ok ? "删除 Provider 失败。" : (result.error ?? "删除 Provider 失败。"));
          }
          setFeedback("Provider 已删除。");
        }

        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "执行失败。");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button className="pill" disabled={isPending} onClick={() => handleAction("test")} type="button">
          {isPending ? "处理中..." : "测试连接"}
        </button>
        <button className="pill" disabled={isPending} onClick={() => handleAction("sync")} type="button">
          {isPending ? "处理中..." : "同步模型"}
        </button>
        <button
          className="pill"
          disabled={isPending || (isActive && routeUsageCount > 0)}
          onClick={() => handleAction("toggle")}
          type="button"
        >
          {isPending ? "处理中..." : isActive ? "停用 Provider" : "启用 Provider"}
        </button>
        <button
          className="pill"
          disabled={isPending || routeUsageCount > 0}
          onClick={() => handleAction("delete")}
          type="button"
        >
          {isPending ? "处理中..." : "删除 Provider"}
        </button>
      </div>
      {routeUsageCount > 0 ? <p className="text-sm text-amber-700">当前有 {routeUsageCount} 条路由引用该 Provider，不能停用或删除。</p> : null}
      {feedback ? <p className="text-sm text-emerald-700">{feedback}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
