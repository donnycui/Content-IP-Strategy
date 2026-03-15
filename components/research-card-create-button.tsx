"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  signalId: string;
};

export function ResearchCardCreateButton({ signalId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleCreate() {
    startTransition(async () => {
      try {
        setError("");

        const response = await fetch("/api/research-cards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ signalId }),
        });

        const result = (await response.json()) as {
          ok: boolean;
          error?: string;
          researchCard?: { id: string };
        };

        if (!response.ok || !result.ok || !result.researchCard) {
          throw new Error(result.error ?? "创建研究卡失败。");
        }

        router.push(`/research/${result.researchCard.id}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "创建研究卡失败。");
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        className="pill hover:border-sky-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isPending}
        onClick={handleCreate}
        type="button"
      >
        {isPending ? "正在创建研究卡..." : "推进到研究卡"}
      </button>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
