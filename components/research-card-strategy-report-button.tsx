"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function ResearchCardStrategyReportButton({ researchCardId }: { researchCardId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");

  function generateReport() {
    startTransition(async () => {
      try {
        setFeedback("");
        const response = await fetch(`/api/research-cards/${researchCardId}/strategy-report`, {
          method: "POST",
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
      <button
        className="pill hover:border-sky-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isPending}
        onClick={generateReport}
        type="button"
      >
        {isPending ? "正在生成战略报告..." : "生成战略报告"}
      </button>
      {feedback ? <p className="text-sm text-emerald-300">{feedback}</p> : null}
    </div>
  );
}
