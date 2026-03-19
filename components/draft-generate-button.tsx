"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ModelTierValue } from "@/lib/domain/contracts";
import { ModelTierPicker } from "@/components/model-tier-picker";

export function DraftGenerateButton({ researchCardId }: { researchCardId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [requestedTier, setRequestedTier] = useState<ModelTierValue>("BALANCED");

  function generateDrafts() {
    startTransition(async () => {
      try {
        setError("");
        const response = await fetch("/api/drafts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ researchCardId, requestedTier }),
        });

        const result = (await response.json()) as {
          ok: boolean;
          error?: string;
        };

        if (!response.ok || !result.ok) {
          throw new Error(result.error ?? "生成草稿失败。");
        }

        router.push(`/drafts/${researchCardId}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "生成草稿失败。");
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
          onClick={generateDrafts}
          type="button"
        >
          {isPending ? "正在生成草稿..." : "生成草稿"}
        </button>
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
