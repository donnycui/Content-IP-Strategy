"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { GatewaySyncResponse, GatewayTestResponse } from "@/lib/domain/contracts";

export function AdminGatewayActions({ gatewayId }: { gatewayId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function handleAction(action: "test" | "sync") {
    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch(`/api/admin/gateways/${gatewayId}/${action}`, {
          method: "POST",
        });

        if (action === "test") {
          const result = (await response.json()) as GatewayTestResponse;
          if (!response.ok || !result.ok) {
            throw new Error(result.ok ? "测试 Provider 连接失败。" : (result.error ?? "测试 Provider 连接失败。"));
          }
          setFeedback(result.data.healthy ? "Provider 连接健康。" : "Provider 可连通，但模型目录状态异常。");
        } else {
          const result = (await response.json()) as GatewaySyncResponse;
          if (!response.ok || !result.ok) {
            throw new Error(result.ok ? "同步模型失败。" : (result.error ?? "同步模型失败。"));
          }
          setFeedback(`已同步 ${result.data.upsertedCount} 个模型。`);
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
      </div>
      {feedback ? <p className="text-sm text-emerald-700">{feedback}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
