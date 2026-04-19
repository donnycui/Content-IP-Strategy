"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { PublishRecordPayload, PublishRecordUpdateResponse } from "@/lib/domain/contracts";

export function PublishRecordStatusActions({ record }: { record: PublishRecordPayload }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function update(status: PublishRecordPayload["status"], failureReason?: string | null) {
    startTransition(async () => {
      try {
        setError("");

        const response = await fetch(`/api/publish-records/${record.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            failureReason: failureReason ?? null,
          }),
        });

        const result = (await response.json()) as PublishRecordUpdateResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "更新发布状态失败。" : (result.error ?? "更新发布状态失败。"));
        }

        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "更新发布状态失败。");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          className="pill transition hover:border-sky-400 hover:text-slate-800"
          disabled={isPending}
          onClick={() => update("READY")}
          type="button"
        >
          准备导出
        </button>
        <button
          className="pill transition hover:border-sky-400 hover:text-slate-800"
          disabled={isPending}
          onClick={() => update("EXPORTED")}
          type="button"
        >
          已导出
        </button>
        <button
          className="pill transition hover:border-sky-400 hover:text-slate-800"
          disabled={isPending}
          onClick={() => update("PUBLISHED")}
          type="button"
        >
          已发布
        </button>
        <button
          className="pill transition hover:border-sky-400 hover:text-slate-800"
          disabled={isPending}
          onClick={() => update("FAILED", "手动标记为发布失败，等待后续补充具体失败原因。")}
          type="button"
        >
          标记失败
        </button>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
