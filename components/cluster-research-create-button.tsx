"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  primaryObservationCluster: string;
};

export function ClusterResearchCreateButton({ primaryObservationCluster }: Props) {
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
          body: JSON.stringify({
            primaryObservationCluster,
          }),
        });

        const result = (await response.json()) as {
          ok: boolean;
          error?: string;
          researchCard?: { id: string };
        };

        if (!response.ok || !result.ok || !result.researchCard) {
          throw new Error(result.error ?? "创建观察簇研究卡失败。");
        }

        router.push(`/research/${result.researchCard.id}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "创建观察簇研究卡失败。");
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
        {isPending ? "正在创建观察簇研究..." : "将观察簇推进到研究"}
      </button>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
