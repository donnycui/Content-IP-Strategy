"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { LearningInsightsGenerateResponse } from "@/lib/domain/contracts";

export function LearningGenerateButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function generate() {
    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch("/api/learning-insights", {
          method: "POST",
        });

        const result = (await response.json()) as LearningInsightsGenerateResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "生成主动学习洞察失败。" : (result.error ?? "生成主动学习洞察失败。"));
        }

        setFeedback(`已生成 ${result.data.createdCount} 条主动学习洞察。`);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "生成主动学习洞察失败。");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        className="rounded-2xl border border-sky-300/30 bg-sky-400/10 px-4 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isPending}
        onClick={generate}
        type="button"
      >
        {isPending ? "学习中..." : "刷新主动学习"}
      </button>
      {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
      {error ? <span className="text-sm text-rose-600">{error}</span> : null}
    </div>
  );
}
