"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function RssIngestButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");

  function runIngest() {
    startTransition(async () => {
      try {
        setFeedback("");

        const response = await fetch("/api/ingest/rss", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        const result = (await response.json()) as {
          ok: boolean;
          error?: string;
          results?: Array<{ created: number; skipped: number }>;
        };

        if (!response.ok || !result.ok) {
          throw new Error(result.error ?? "RSS 抓取失败。");
        }

        const created = result.results?.reduce((sum, item) => sum + item.created, 0) ?? 0;
        const skipped = result.results?.reduce((sum, item) => sum + item.skipped, 0) ?? 0;

        setFeedback(`RSS 抓取完成。新增 ${created} 条信号，跳过 ${skipped} 条。`);
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "RSS 抓取失败。");
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        className="rounded-2xl border border-sky-300/30 bg-sky-400/10 px-4 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isPending}
        onClick={runIngest}
        type="button"
      >
        {isPending ? "正在执行 RSS 抓取..." : "执行 RSS 抓取"}
      </button>
      {feedback ? <p className="text-sm text-emerald-300">{feedback}</p> : null}
    </div>
  );
}
