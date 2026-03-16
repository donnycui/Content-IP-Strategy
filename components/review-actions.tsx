"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ReviewActionsProps = {
  signalId?: string;
  clusterId?: string;
  compact?: boolean;
};

type FeedbackState =
  | {
      kind: "idle";
      message: "";
    }
  | {
      kind: "success" | "error";
      message: string;
    };

async function submitReview(payload: {
  signalId?: string;
  clusterId?: string;
  reviewStatus: "KEPT" | "REJECTED" | "DEFERRED";
  reasoningAcceptance?: "ACCEPTED" | "PARTIAL" | "REJECTED";
}) {
  const response = await fetch("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = (await response.json()) as {
    ok: boolean;
    error?: string;
    signal?: {
      id: string;
      status: string;
    };
  };

  if (!response.ok || !result.ok) {
    throw new Error(result.error ?? "复核请求失败。");
  }

  return result;
}

export function ReviewActions({ signalId, clusterId, compact = false }: ReviewActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<FeedbackState>({
    kind: "idle",
    message: "",
  });

  function handleAction(
    reviewStatus: "KEPT" | "REJECTED" | "DEFERRED",
    reasoningAcceptance?: "ACCEPTED" | "PARTIAL" | "REJECTED",
  ) {
    startTransition(async () => {
      try {
        setFeedback({ kind: "idle", message: "" });
        const result = await submitReview({
          signalId,
          clusterId,
          reviewStatus,
          reasoningAcceptance,
        });
        setFeedback({
          kind: "success",
          message: result.signal
            ? `已保存复核，信号已移动到 ${result.signal.status} 状态。`
            : "已保存复核。",
        });
        router.refresh();
      } catch (error) {
        setFeedback({
          kind: "error",
          message: error instanceof Error ? error.message : "保存复核失败。",
        });
      }
    });
  }

  const wrapperClass = compact ? "flex flex-wrap gap-2" : "grid gap-3";
  const buttonClass =
    "rounded-2xl border px-4 py-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-3">
      <div className={wrapperClass}>
        <button
          className={`${buttonClass} border-sky-300/30 bg-sky-400/10 hover:border-sky-200 hover:bg-sky-400/20`}
          disabled={isPending}
          onClick={() => handleAction("KEPT", "ACCEPTED")}
          type="button"
        >
          保留
        </button>
        <button
          className={`${buttonClass} border-slate-300/70 bg-white/70 hover:border-slate-400`}
          disabled={isPending}
          onClick={() => handleAction("DEFERRED", "PARTIAL")}
          type="button"
        >
          延后
        </button>
        <button
          className={`${buttonClass} border-slate-300/70 bg-white/70 hover:border-slate-400`}
          disabled={isPending}
          onClick={() => handleAction("REJECTED", "REJECTED")}
          type="button"
        >
          忽略
        </button>
      </div>
      {feedback.kind !== "idle" ? (
        <p className={feedback.kind === "error" ? "text-sm text-rose-600" : "text-sm text-emerald-700"}>
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
