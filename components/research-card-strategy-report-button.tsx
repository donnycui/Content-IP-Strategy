"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ModelTierValue } from "@/lib/domain/contracts";
import { ModelTierPicker } from "@/components/model-tier-picker";

export function ResearchCardStrategyReportButton({ researchCardId }: { researchCardId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");
  const [requestedTier, setRequestedTier] = useState<ModelTierValue>("DEEP");

  function generateReport() {
    startTransition(async () => {
      try {
        setFeedback("");
        const response = await fetch(`/api/research-cards/${researchCardId}/strategy-report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestedTier,
          }),
        });

        const result = (await response.json()) as { ok: boolean; error?: string };

        if (!response.ok || !result.ok) {
          throw new Error(result.error ?? "生成战略报告失败。");
        }

        setFeedback("战略报告已生成，研究卡内容已更新。");
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "生成战略报告失败。");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <ModelTierPicker compact onChange={setRequestedTier} value={requestedTier} />
        <button
          className="pill hover:border-sky-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isPending}
          onClick={generateReport}
          type="button"
        >
          {isPending ? "正在生成战略报告..." : "生成战略报告"}
        </button>
      </div>
      {feedback ? <p className="text-sm text-emerald-300">{feedback}</p> : null}
    </div>
  );
}
