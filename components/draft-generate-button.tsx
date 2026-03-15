"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function DraftGenerateButton({ researchCardId }: { researchCardId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function generateDrafts() {
    startTransition(async () => {
      try {
        setError("");
        const response = await fetch("/api/drafts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ researchCardId }),
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
      <button
        className="pill hover:border-sky-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isPending}
        onClick={generateDrafts}
        type="button"
      >
        {isPending ? "正在生成草稿..." : "生成草稿"}
      </button>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
