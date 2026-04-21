"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ModelTierValue, TopicsGenerateResponse } from "@/lib/domain/contracts";
import { ModelTierPicker } from "@/components/model-tier-picker";

export function TopicGenerateButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [requestedTier, setRequestedTier] = useState<ModelTierValue>("BALANCED");

  function handleClick() {
    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch("/api/topics/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestedTier,
          }),
        });

        const result = (await response.json()) as TopicsGenerateResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "生成主题线失败。" : (result.error ?? "生成主题线失败。"));
        }

        setFeedback(`已刷新 ${result.data.createdCount ?? 0} 条主题线。`);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "生成主题线失败。");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ModelTierPicker capabilityKey="topic_generation" compact onChange={setRequestedTier} value={requestedTier} />
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
