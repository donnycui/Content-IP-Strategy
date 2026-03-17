"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function TopicGenerateButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function handleClick() {
    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch("/api/topics/generate", {
          method: "POST",
        });

        const result = (await response.json()) as { ok: boolean; error?: string; created?: number };

        if (!response.ok || !result.ok) {
          throw new Error(result.error ?? "生成主题线失败。");
        }

        setFeedback(`已刷新 ${result.created ?? 0} 条主题线。`);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "生成主题线失败。");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        className="rounded-2xl border border-sky-300/30 bg-sky-400/10 px-4 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isPending}
        onClick={handleClick}
        type="button"
      >
        {isPending ? "生成中..." : "刷新主题线"}
      </button>
      {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
      {error ? <span className="text-sm text-rose-600">{error}</span> : null}
    </div>
  );
}
