"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  candidateId: string;
  currentStatus: "NEW" | "KEPT" | "DEFERRED" | "REJECTED";
};

const actionMap = [
  { label: "保留", status: "KEPT" as const },
  { label: "延后", status: "DEFERRED" as const },
  { label: "忽略", status: "REJECTED" as const },
];

export function TopicCandidateStatusActions({ candidateId, currentStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function updateStatus(status: "KEPT" | "DEFERRED" | "REJECTED") {
    startTransition(async () => {
      try {
        setError("");

        const response = await fetch(`/api/topic-candidates/${candidateId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        });

        const result = (await response.json()) as { ok: boolean; error?: string };

        if (!response.ok || !result.ok) {
          throw new Error(result.error ?? "更新选题状态失败。");
        }

        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "更新选题状态失败。");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        {actionMap.map((action) => (
          <button
            className={`pill transition hover:border-sky-400 hover:text-slate-800 ${
              currentStatus === action.status ? "border-sky-400 bg-sky-50 text-slate-900" : ""
            }`}
            disabled={isPending}
            key={action.status}
            onClick={() => updateStatus(action.status)}
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
