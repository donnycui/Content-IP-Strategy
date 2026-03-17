"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  suggestionId: string;
  currentStatus: "PENDING" | "ACCEPTED" | "REJECTED";
};

export function ProfileUpdateStatusActions({ suggestionId, currentStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function updateStatus(status: "ACCEPTED" | "REJECTED") {
    startTransition(async () => {
      try {
        setError("");

        const response = await fetch(`/api/profile-updates/${suggestionId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        });

        const result = (await response.json()) as { ok: boolean; error?: string };

        if (!response.ok || !result.ok) {
          throw new Error(result.error ?? "更新画像进化建议失败。");
        }

        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "更新画像进化建议失败。");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        <button
          className={`pill transition hover:border-sky-400 hover:text-slate-800 ${
            currentStatus === "ACCEPTED" ? "border-sky-400 bg-sky-50 text-slate-900" : ""
          }`}
          disabled={isPending}
          onClick={() => updateStatus("ACCEPTED")}
          type="button"
        >
          采纳建议
        </button>
        <button
          className={`pill transition hover:border-sky-400 hover:text-slate-800 ${
            currentStatus === "REJECTED" ? "border-slate-400 bg-slate-50 text-slate-900" : ""
          }`}
          disabled={isPending}
          onClick={() => updateStatus("REJECTED")}
          type="button"
        >
          暂不采纳
        </button>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
